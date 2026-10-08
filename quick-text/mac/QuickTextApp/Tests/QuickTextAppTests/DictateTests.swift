import XCTest
import AppKit
import AVFoundation
import SwiftUI
@testable import QuickTextApp

/// Covers the testable seams of Dictate mode without touching the mic,
/// the network, the Keychain, or the real corpus: transcript retention,
//  take joining, and Gemini response parsing.
final class DictateTests: XCTestCase {

    private func tempDir() throws -> URL {
        let dir = FileManager.default.temporaryDirectory
            .appendingPathComponent("dictate-tests-\(UUID().uuidString)", isDirectory: true)
        try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir
    }

    private func writeFile(in dir: URL, named name: String, ageDays: Int) throws -> URL {
        let url = dir.appendingPathComponent(name)
        try Data("x".utf8).write(to: url)
        let date = Date().addingTimeInterval(TimeInterval(-ageDays * 24 * 3600))
        try FileManager.default.setAttributes([.modificationDate: date], ofItemAtPath: url.path)
        return url
    }

    func testPruneRemovesOnlySessionsOlderThanRetention() throws {
        let dir = try tempDir()
        let old = try writeFile(in: dir, named: "dictate-old.json", ageDays: 16)
        let fresh = try writeFile(in: dir, named: "dictate-new.json", ageDays: 3)

        let removed = try TranscriptStore.prune(retentionDays: 15, in: dir)

        XCTAssertEqual(removed, 1)
        XCTAssertFalse(FileManager.default.fileExists(atPath: old.path))
        XCTAssertTrue(FileManager.default.fileExists(atPath: fresh.path))
    }

    func testPruneOnMissingDirectoryIsNoOp() throws {
        let dir = FileManager.default.temporaryDirectory
            .appendingPathComponent("dictate-missing-\(UUID().uuidString)", isDirectory: true)
        XCTAssertEqual(try TranscriptStore.prune(in: dir), 0)
    }

    func testSaveSessionRoundTrips() throws {
        let dir = try tempDir()
        let url = try TranscriptStore.saveSession(takes: ["hello", "world"], result: "done", in: dir)
        let data = try Data(contentsOf: url)
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        let record = try decoder.decode(TranscriptStore.SessionRecord.self, from: data)
        XCTAssertEqual(record.takes, ["hello", "world"])
        XCTAssertEqual(record.result, "done")
    }

    func testJoinedTranscriptNumbersTakesInOrder() {
        XCTAssertEqual(
            DictateSession.joinedTranscript(["first", "second"]),
            "Take 1:\nfirst\n\nTake 2:\nsecond")
    }

    func testExtractOutputTextTopLevel() throws {
        let data = Data(#"{"output_text":"hi"}"#.utf8)
        XCTAssertEqual(try GeminiClient.extractOutputText(from: data), "hi")
    }

    func testExtractOutputTextNestedInteraction() throws {
        let data = Data(#"{"interaction":{"output_text":"hello"}}"#.utf8)
        XCTAssertEqual(try GeminiClient.extractOutputText(from: data), "hello")
    }

    func testExtractOutputTextFromInteractionsSteps() throws {
        let json = """
        {
          "id": "int_123",
          "status": "completed",
          "steps": [
            {
              "type": "thought",
              "content": [{"type": "text", "text": "transcribing audio..."}]
            },
            {
              "type": "model_output",
              "content": [{"type": "text", "text": "This is the transcribed speech."}]
            }
          ]
        }
        """
        let data = Data(json.utf8)
        XCTAssertEqual(try GeminiClient.extractOutputText(from: data), "This is the transcribed speech.")
    }

    func testExtractOutputTextThrowsWhenMissing() {
        let data = Data(#"{"something_else":1}"#.utf8)
        XCTAssertThrowsError(try GeminiClient.extractOutputText(from: data))
    }

    /// The shipped corpus must decode and carry the Dictate mode's
    /// `voice-process` prompts, with agent instructions as the default.
    func testShippedCorpusCarriesVoiceProcessPrompts() throws {
        // #filePath is …/quick-text/mac/QuickTextApp/Tests/QuickTextAppTests/…:
        // five levels up is the quick-text project root.
        let corpusURL = URL(fileURLWithPath: #filePath)
            .deletingLastPathComponent().deletingLastPathComponent()
            .deletingLastPathComponent().deletingLastPathComponent()
            .deletingLastPathComponent()
            .appendingPathComponent("corpus/quick-text.json")
            .standardizedFileURL
        let corpus = try JSONDecoder.quickText.decode(
            QuickTextCorpus.self, from: Data(contentsOf: corpusURL))
        XCTAssertTrue(corpus.categories.contains { $0.id == "voice-process" })
        let ids = Set(corpus.phrases.filter { $0.categoryId == "voice-process" }.map(\.id))
        XCTAssertTrue(ids.contains(DictateSession.defaultProcessID))
        XCTAssertTrue(ids.contains("voice-process-text-message"))
        XCTAssertTrue(ids.contains("voice-process-email"))
        XCTAssertTrue(ids.contains(QuickDictateSettings.cleanTranscriptID))
    }

    @MainActor
    func testUpdateTranscriptAndCopyTake() {
        let session = DictateSession()
        session.transcriptDirectory = makeTranscriptDirectory()
        let take = DictateTake(audioURL: nil, transcript: "original text", status: .ready)
        session.takes = [take]

        session.updateTranscript(for: take.id, text: "tweaked text")
        XCTAssertEqual(session.takes.first?.transcript, "tweaked text")
        XCTAssertEqual(session.readyTranscripts, ["tweaked text"])

        session.copyTake(session.takes[0])
        XCTAssertEqual(NSPasteboard.general.string(forType: .string), "tweaked text")
    }

    // MARK: - Token Usage & Cost Estimation Tests

    func testTokenUsageCostCalculation() {
        XCTAssertEqual(TokenUsage.zero.estimatedCost, 0.0, accuracy: 1e-9)

        // 1M input tokens at $0.75 / 1M = $0.75
        let inputCost = TokenUsage.estimatedCost(inputTokens: 1_000_000, outputTokens: 0)
        XCTAssertEqual(inputCost, 0.75, accuracy: 1e-9)

        // 1M output tokens at $3.75 / 1M = $3.75
        let outputCost = TokenUsage.estimatedCost(inputTokens: 0, outputTokens: 1_000_000)
        XCTAssertEqual(outputCost, 3.75, accuracy: 1e-9)

        // 1,000 input tokens ($0.00075) + 200 output tokens ($0.00075) = $0.0015
        let combined = TokenUsage(inputTokens: 1_000, outputTokens: 200)
        XCTAssertEqual(combined.estimatedCost, 0.0015, accuracy: 1e-9)
        XCTAssertEqual(combined.totalTokens, 1_200)

        // Addition operator
        let a = TokenUsage(inputTokens: 100, outputTokens: 20)
        let b = TokenUsage(inputTokens: 200, outputTokens: 30)
        let c = a + b
        XCTAssertEqual(c, TokenUsage(inputTokens: 300, outputTokens: 50))
    }

    func testFormatCost() {
        XCTAssertEqual(TokenUsage.formatCost(0.0), "$0.00")
        XCTAssertEqual(TokenUsage.formatCost(-1.0), "$0.00")
        XCTAssertEqual(TokenUsage.formatCost(0.00005), "< $0.0001")
        XCTAssertEqual(TokenUsage.formatCost(0.0034), "$0.0034")
        XCTAssertEqual(TokenUsage.formatCost(0.004), "$0.004")
        XCTAssertEqual(TokenUsage.formatCost(0.0034, subCentPrecision: false), "< $0.01")
        XCTAssertEqual(TokenUsage.formatCost(0.05), "$0.05")
        XCTAssertEqual(TokenUsage.formatCost(1.234), "$1.23")
    }

    func testModelPricingIntroductoryAndStandardRates() {
        // Introductory rates: $0.75 / 1M input, $3.75 / 1M output
        XCTAssertEqual(TokenUsage.ModelPricing.introductory.inputRatePerToken, 0.75 / 1_000_000.0, accuracy: 1e-12)
        XCTAssertEqual(TokenUsage.ModelPricing.introductory.outputRatePerToken, 3.75 / 1_000_000.0, accuracy: 1e-12)

        // Standard rates: $1.50 / 1M input, $7.50 / 1M output
        XCTAssertEqual(TokenUsage.ModelPricing.standard.inputRatePerToken, 1.50 / 1_000_000.0, accuracy: 1e-12)
        XCTAssertEqual(TokenUsage.ModelPricing.standard.outputRatePerToken, 7.50 / 1_000_000.0, accuracy: 1e-12)

        // Test date-based transition for .transcribe and .flash
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(identifier: "UTC")!

        // Date before 2027 (e.g. Sept 20, 2026)
        var comp2026 = DateComponents()
        comp2026.year = 2026
        comp2026.month = 9
        comp2026.day = 20
        let date2026 = calendar.date(from: comp2026)!

        XCTAssertEqual(TokenUsage.ModelPricing.transcribe.inputRatePerToken(at: date2026), 0.75 / 1_000_000.0, accuracy: 1e-12)
        XCTAssertEqual(TokenUsage.ModelPricing.transcribe.outputRatePerToken(at: date2026), 3.75 / 1_000_000.0, accuracy: 1e-12)
        XCTAssertEqual(TokenUsage.ModelPricing.flash.inputRatePerToken(at: date2026), 0.75 / 1_000_000.0, accuracy: 1e-12)
        XCTAssertEqual(TokenUsage.ModelPricing.flash.outputRatePerToken(at: date2026), 3.75 / 1_000_000.0, accuracy: 1e-12)

        // Date on or after Jan 1, 2027
        var comp2027 = DateComponents()
        comp2027.year = 2027
        comp2027.month = 1
        comp2027.day = 1
        let date2027 = calendar.date(from: comp2027)!

        XCTAssertEqual(TokenUsage.ModelPricing.transcribe.inputRatePerToken(at: date2027), 1.50 / 1_000_000.0, accuracy: 1e-12)
        XCTAssertEqual(TokenUsage.ModelPricing.transcribe.outputRatePerToken(at: date2027), 7.50 / 1_000_000.0, accuracy: 1e-12)
        XCTAssertEqual(TokenUsage.ModelPricing.flash.inputRatePerToken(at: date2027), 1.50 / 1_000_000.0, accuracy: 1e-12)
        XCTAssertEqual(TokenUsage.ModelPricing.flash.outputRatePerToken(at: date2027), 7.50 / 1_000_000.0, accuracy: 1e-12)

        // Test estimated cost at specific date
        let sampleUsage = TokenUsage(inputTokens: 1_000_000, outputTokens: 1_000_000)
        let cost2026 = sampleUsage.estimatedCost(pricing: .flash, at: date2026)
        XCTAssertEqual(cost2026, 0.75 + 3.75, accuracy: 1e-9) // $4.50

        let cost2027 = sampleUsage.estimatedCost(pricing: .flash, at: date2027)
        XCTAssertEqual(cost2027, 1.50 + 7.50, accuracy: 1e-9) // $9.00
    }

    func testExtractTokenUsageFromInteractionsResponse() {
        let json = """
        {
          "output_text": "Hello world",
          "usage": {
            "input_tokens": 120,
            "output_tokens": 45,
            "total_tokens": 165
          }
        }
        """
        let data = Data(json.utf8)
        let usage = GeminiClient.extractTokenUsage(from: data)
        XCTAssertEqual(usage.inputTokens, 120)
        XCTAssertEqual(usage.outputTokens, 45)
        XCTAssertEqual(usage.totalTokens, 165)
    }

    func testExtractTokenUsageFromLiveInteractionsAPIResponse() {
        // Live Gemini Interactions API payload format with total_input_tokens,
        // total_output_tokens, total_thought_tokens, and total_tokens.
        let json = """
        {
          "id": "interactions_12345",
          "status": "completed",
          "usage": {
            "input_tokens_by_modality": [
              {
                "modality": "audio",
                "tokens": 450
              }
            ],
            "total_cached_tokens": 0,
            "total_input_tokens": 450,
            "total_output_tokens": 35,
            "total_thought_tokens": 85,
            "total_tokens": 570,
            "total_tool_use_tokens": 0
          }
        }
        """
        let data = Data(json.utf8)
        let usage = GeminiClient.extractTokenUsage(from: data)
        XCTAssertEqual(usage.inputTokens, 450)
        // Thinking tokens (85) are billed as output tokens, so outputTokens = 35 + 85 = 120
        XCTAssertEqual(usage.outputTokens, 120)
        XCTAssertEqual(usage.totalTokens, 570)
    }

    func testExtractTokenUsageFromNestedInteractionObject() {
        let json = """
        {
          "event_type": "interaction.completed",
          "interaction": {
            "id": "interactions_nested_999",
            "status": "completed",
            "usage": {
              "total_input_tokens": 1200,
              "total_output_tokens": 280,
              "total_tokens": 1480
            }
          }
        }
        """
        let data = Data(json.utf8)
        let usage = GeminiClient.extractTokenUsage(from: data)
        XCTAssertEqual(usage.inputTokens, 1200)
        XCTAssertEqual(usage.outputTokens, 280)
        XCTAssertEqual(usage.totalTokens, 1480)
    }

    func testExtractTokenUsageFromStepsFallback() {
        let json = """
        {
          "steps": [
            {
              "id": "step_1",
              "usage": {
                "total_input_tokens": 300,
                "total_output_tokens": 90,
                "total_tokens": 390
              }
            }
          ]
        }
        """
        let data = Data(json.utf8)
        let usage = GeminiClient.extractTokenUsage(from: data)
        XCTAssertEqual(usage.inputTokens, 300)
        XCTAssertEqual(usage.outputTokens, 90)
        XCTAssertEqual(usage.totalTokens, 390)
    }

    func testExtractTokenUsageInputModalityFallback() {
        let json = """
        {
          "usage": {
            "input_tokens_by_modality": [
              { "modality": "text", "tokens": 50 },
              { "modality": "audio", "tokens": 350 }
            ],
            "total_output_tokens": 100
          }
        }
        """
        let data = Data(json.utf8)
        let usage = GeminiClient.extractTokenUsage(from: data)
        XCTAssertEqual(usage.inputTokens, 400)
        XCTAssertEqual(usage.outputTokens, 100)
        XCTAssertEqual(usage.totalTokens, 500)
    }

    func testExtractTokenUsageFromUsageMetadata() {
        let json = """
        {
          "candidates": [],
          "usageMetadata": {
            "promptTokenCount": 500,
            "candidatesTokenCount": 150,
            "totalTokenCount": 650
          }
        }
        """
        let data = Data(json.utf8)
        let usage = GeminiClient.extractTokenUsage(from: data)
        XCTAssertEqual(usage.inputTokens, 500)
        XCTAssertEqual(usage.outputTokens, 150)
        XCTAssertEqual(usage.totalTokens, 650)
    }

    func testExtractTokenUsageMissingReturnsZero() {
        let data = Data(#"{"output_text": "hello"}"#.utf8)
        XCTAssertEqual(GeminiClient.extractTokenUsage(from: data), .zero)
    }

    func testExtractResponseReturnsTextAndUsage() throws {
        let json = """
        {
          "output_text": "Processed output",
          "usage": {
            "input_tokens": 800,
            "output_tokens": 200
          }
        }
        """
        let response = try GeminiClient.extractResponse(from: Data(json.utf8))
        XCTAssertEqual(response.text, "Processed output")
        XCTAssertEqual(response.usage, TokenUsage(inputTokens: 800, outputTokens: 200))
    }

    func testSaveSessionRoundTripsTokenUsageAndCost() throws {
        let dir = try tempDir()
        let usage = TokenUsage(inputTokens: 1000, outputTokens: 200)
        let transcribeUsage = TokenUsage(inputTokens: 400, outputTokens: 50)
        let synthUsage = TokenUsage(inputTokens: 600, outputTokens: 150)
        let cost = usage.estimatedCost
        let url = try TranscriptStore.saveSession(
            takes: ["take 1"],
            result: "result text",
            tokenUsage: usage,
            transcriptionUsage: transcribeUsage,
            synthesisUsage: synthUsage,
            estimatedCost: cost,
            in: dir
        )
        let data = try Data(contentsOf: url)
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        let record = try decoder.decode(TranscriptStore.SessionRecord.self, from: data)

        XCTAssertEqual(record.takes, ["take 1"])
        XCTAssertEqual(record.result, "result text")
        XCTAssertEqual(record.tokenUsage, usage)
        XCTAssertEqual(record.transcriptionUsage, transcribeUsage)
        XCTAssertEqual(record.synthesisUsage, synthUsage)
        XCTAssertNotNil(record.estimatedCost)
        XCTAssertEqual(record.estimatedCost!, cost, accuracy: 1e-9)
    }

    @MainActor
    func testDictateStatsStoreTracksAndResets() throws {
        let suiteName = "test-dictate-stats-\(UUID().uuidString)"
        let testDefaults = UserDefaults(suiteName: suiteName)!
        let store = DictateStatsStore(defaults: testDefaults)

        XCTAssertEqual(store.cumulativeInputTokens, 0)
        XCTAssertEqual(store.cumulativeOutputTokens, 0)
        XCTAssertEqual(store.cumulativeTotalTokens, 0)
        XCTAssertEqual(store.cumulativeEstimatedCost, 0.0, accuracy: 1e-9)

        store.recordUsage(TokenUsage(inputTokens: 1_000, outputTokens: 500))
        XCTAssertEqual(store.cumulativeInputTokens, 1_000)
        XCTAssertEqual(store.cumulativeOutputTokens, 500)
        XCTAssertEqual(store.cumulativeTotalTokens, 1_500)
        XCTAssertEqual(store.cumulativeEstimatedCost, TokenUsage.estimatedCost(inputTokens: 1_000, outputTokens: 500), accuracy: 1e-9)

        store.reset()
        XCTAssertEqual(store.cumulativeInputTokens, 0)
        XCTAssertEqual(store.cumulativeOutputTokens, 0)
        XCTAssertEqual(store.cumulativeTotalTokens, 0)
        testDefaults.removePersistentDomain(forName: suiteName)
    }

    @MainActor
    func testDictateSessionAccumulatesTokenUsageLiveAndResets() async throws {
        let session = DictateSession()
        session.transcriptDirectory = makeTranscriptDirectory()
        let testDefaults = UserDefaults(suiteName: "test-session-\(UUID().uuidString)")!
        session.statsStore = DictateStatsStore(defaults: testDefaults)

        XCTAssertEqual(session.sessionTokenUsage, .zero)
        XCTAssertEqual(session.transcriptionTokenUsage, .zero)
        XCTAssertNil(session.synthesisTokenUsage)

        // Mock transcription
        session.transcribe = { _, _ in
            GeminiResponse(text: "take transcript", usage: TokenUsage(inputTokens: 800, outputTokens: 40))
        }

        // Mock synthesis
        session.synthesize = { _, _ in
            GeminiResponse(text: "synthesized text", usage: TokenUsage(inputTokens: 1000, outputTokens: 200))
        }

        // Create a dummy audio file for a take
        let tempAudio = FileManager.default.temporaryDirectory.appendingPathComponent("test-\(UUID().uuidString).m4a")
        try Data("dummy".utf8).write(to: tempAudio)
        session.takes = [DictateTake(audioURL: tempAudio, transcript: nil, status: .recording)]

        session.stopRecording()
        // Wait briefly for Task to complete
        try await Task.sleep(nanoseconds: 100_000_000)

        XCTAssertEqual(session.takes.first?.status, .ready)
        XCTAssertEqual(session.takes.first?.transcript, "take transcript")
        XCTAssertEqual(session.takes.first?.tokenUsage, TokenUsage(inputTokens: 800, outputTokens: 40))
        XCTAssertEqual(session.transcriptionTokenUsage, TokenUsage(inputTokens: 800, outputTokens: 40))
        XCTAssertNil(session.synthesisTokenUsage)
        XCTAssertEqual(session.sessionTokenUsage, TokenUsage(inputTokens: 800, outputTokens: 40))

        // Run process
        session.process(masterPrompt: "prompt")
        try await Task.sleep(nanoseconds: 100_000_000)

        XCTAssertEqual(session.resultText, "synthesized text")
        XCTAssertEqual(session.transcriptionTokenUsage, TokenUsage(inputTokens: 800, outputTokens: 40))
        XCTAssertEqual(session.synthesisTokenUsage, TokenUsage(inputTokens: 1000, outputTokens: 200))
        XCTAssertEqual(session.sessionTokenUsage, TokenUsage(inputTokens: 1800, outputTokens: 240))
        let archived = try FileManager.default.contentsOfDirectory(at: session.transcriptDirectory!, includingPropertiesForKeys: nil)
        XCTAssertEqual(archived.count, 1, "processing archives into the injected directory")

        // Reset
        session.newSession()
        XCTAssertEqual(session.sessionTokenUsage, .zero)
        XCTAssertEqual(session.transcriptionTokenUsage, .zero)
        XCTAssertNil(session.synthesisTokenUsage)
        XCTAssertEqual(session.takes.count, 0)
        XCTAssertEqual(session.resultText, "")
    }

    @MainActor
    func testDictateSessionAccumulatesMultipleTakesAndSynthesisLive() async throws {
        // Cost assertions below assume After-take rates; pin the selection.
        let previousMode = TranscriptionMode.stored
        defer { TranscriptionMode.stored = previousMode }
        TranscriptionMode.stored = .afterTake
        let session = DictateSession()
        session.transcriptDirectory = makeTranscriptDirectory()
        let suiteName = "test-multi-takes-\(UUID().uuidString)"
        let testDefaults = UserDefaults(suiteName: suiteName)!
        let store = DictateStatsStore(defaults: testDefaults)
        session.statsStore = store

        var takeCounter = 0
        session.transcribe = { _, _ in
            takeCounter += 1
            if takeCounter == 1 {
                return GeminiResponse(text: "take 1 text", usage: TokenUsage(inputTokens: 500, outputTokens: 50))
            } else {
                return GeminiResponse(text: "take 2 text", usage: TokenUsage(inputTokens: 700, outputTokens: 70))
            }
        }

        session.synthesize = { _, _ in
            GeminiResponse(text: "synthesis result", usage: TokenUsage(inputTokens: 1500, outputTokens: 300))
        }

        // Take 1
        let tempAudio1 = FileManager.default.temporaryDirectory.appendingPathComponent("test1-\(UUID().uuidString).m4a")
        try Data("audio1".utf8).write(to: tempAudio1)
        session.takes = [DictateTake(audioURL: tempAudio1, transcript: nil, status: .recording)]
        session.stopRecording()
        try await Task.sleep(nanoseconds: 100_000_000)

        XCTAssertEqual(session.takes.count, 1)
        XCTAssertEqual(session.takes[0].tokenUsage, TokenUsage(inputTokens: 500, outputTokens: 50))
        XCTAssertEqual(session.transcriptionTokenUsage, TokenUsage(inputTokens: 500, outputTokens: 50))
        XCTAssertEqual(session.sessionTokenUsage, TokenUsage(inputTokens: 500, outputTokens: 50))
        XCTAssertEqual(store.cumulativeInputTokens, 500)
        XCTAssertEqual(store.cumulativeOutputTokens, 500 == 0 ? 0 : 50)

        // Take 2
        let tempAudio2 = FileManager.default.temporaryDirectory.appendingPathComponent("test2-\(UUID().uuidString).m4a")
        try Data("audio2".utf8).write(to: tempAudio2)
        session.takes.append(DictateTake(audioURL: tempAudio2, transcript: nil, status: .recording))
        // Transcribe take 2 directly via transcribeTake
        session.stopRecording()
        try await Task.sleep(nanoseconds: 100_000_000)

        XCTAssertEqual(session.takes.count, 2)
        XCTAssertEqual(session.takes[1].tokenUsage, TokenUsage(inputTokens: 700, outputTokens: 70))
        XCTAssertEqual(session.transcriptionTokenUsage, TokenUsage(inputTokens: 1200, outputTokens: 120))
        XCTAssertEqual(session.sessionTokenUsage, TokenUsage(inputTokens: 1200, outputTokens: 120))
        XCTAssertEqual(store.cumulativeInputTokens, 1200)
        XCTAssertEqual(store.cumulativeOutputTokens, 120)

        // Process synthesis
        session.process(masterPrompt: "Synthesize")
        try await Task.sleep(nanoseconds: 100_000_000)

        XCTAssertEqual(session.resultText, "synthesis result")
        XCTAssertEqual(session.synthesisTokenUsage, TokenUsage(inputTokens: 1500, outputTokens: 300))
        XCTAssertEqual(session.transcriptionTokenUsage, TokenUsage(inputTokens: 1200, outputTokens: 120))
        XCTAssertEqual(session.sessionTokenUsage, TokenUsage(inputTokens: 2700, outputTokens: 420))
        XCTAssertEqual(session.sessionTokenUsage.totalTokens, 3120)

        let expectedCost = TokenUsage.estimatedCost(inputTokens: 1200, outputTokens: 120, pricing: .transcribe) +
                           TokenUsage.estimatedCost(inputTokens: 1500, outputTokens: 300, pricing: .flash)
        XCTAssertEqual(session.sessionEstimatedCost, expectedCost, accuracy: 1e-9)

        XCTAssertEqual(store.cumulativeInputTokens, 2700)
        XCTAssertEqual(store.cumulativeOutputTokens, 420)
        XCTAssertEqual(store.cumulativeTotalTokens, 3120)
        XCTAssertEqual(store.cumulativeEstimatedCost, expectedCost, accuracy: 1e-9)

        // Deleting Take 1 decrements current session usage, but preserves lifetime stats
        let take1 = session.takes[0]
        session.deleteTake(take1)
        XCTAssertEqual(session.takes.count, 1)
        XCTAssertEqual(session.transcriptionTokenUsage, TokenUsage(inputTokens: 700, outputTokens: 70))
        XCTAssertEqual(session.sessionTokenUsage, TokenUsage(inputTokens: 2200, outputTokens: 370))
        XCTAssertEqual(store.cumulativeTotalTokens, 3120)

        testDefaults.removePersistentDomain(forName: suiteName)
    }

    func testCustomProcessAsPresetRoundTripsWithoutRemovingBuiltIns() throws {
        let builtIns = CorpusStore.builtInDictationPromptIDs
        XCTAssertEqual(builtIns, Set([
            DictateSession.defaultProcessID,
            "voice-process-text-message",
            "voice-process-email",
            QuickDictateSettings.cleanTranscriptID
        ]))

        let custom = Phrase(
            id: "voice-process-custom-test", categoryId: "voice-process", title: "Meeting notes",
            summary: nil, value: "Turn this into concise meeting notes.", color: nil,
            textColor: nil, fontSize: nil, image: nil, favorite: false, visibility: .private,
            tags: [], createdAt: Date(), updatedAt: Date()
        )
        var corpus = QuickTextCorpus.empty
        corpus.phrases = [custom]
        let decoded = try JSONDecoder.quickText.decode(QuickTextCorpus.self, from: JSONEncoder.quickText.encode(corpus))
        XCTAssertEqual(decoded.phrases.first?.title, "Meeting notes")
        XCTAssertTrue(decoded.phrases.contains { $0.categoryId == "voice-process" && $0.id == custom.id })
        XCTAssertTrue(builtIns.contains(DictateSession.defaultProcessID))
    }

    @MainActor
    func testOnlyCustomProcessAsPresetsCanBeDeleted() {
        let store = CorpusStore()
        let builtin = Phrase(
            id: DictateSession.defaultProcessID, categoryId: "voice-process", title: "Agent Instructions",
            summary: nil, value: "built in", color: nil, textColor: nil, fontSize: nil, image: nil,
            favorite: false, visibility: .private, tags: [], createdAt: Date(), updatedAt: Date()
        )
        let custom = Phrase(
            id: "voice-process-custom-delete", categoryId: "voice-process", title: "Custom",
            summary: nil, value: "custom", color: nil, textColor: nil, fontSize: nil, image: nil,
            favorite: false, visibility: .private, tags: [], createdAt: Date(), updatedAt: Date()
        )
        store.corpus.phrases = [builtin, custom]
        store.deleteDictationPrompt(builtin)
        XCTAssertEqual(store.corpus.phrases.map(\.id), [builtin.id, custom.id])
        store.deleteDictationPrompt(custom)
        XCTAssertEqual(store.corpus.phrases.map(\.id), [builtin.id])
    }

    @MainActor
    func testReprocessTakesAndRefineCurrentResultUseDistinctInputsAndUsage() async throws {
        let session = DictateSession()
        session.transcriptDirectory = makeTranscriptDirectory()
        let defaults = UserDefaults(suiteName: "test-refine-\(UUID().uuidString)")!
        session.statsStore = DictateStatsStore(defaults: defaults)
        session.takes = [
            DictateTake(audioURL: nil, transcript: "first take", tokenUsage: TokenUsage(inputTokens: 10, outputTokens: 1), status: .ready),
            DictateTake(audioURL: nil, transcript: "second take", tokenUsage: TokenUsage(inputTokens: 20, outputTokens: 2), status: .ready)
        ]
        var receivedInputs: [String] = []
        var call = 0
        session.synthesize = { _, input in
            receivedInputs.append(input)
            call += 1
            return GeminiResponse(text: call == 1 ? "reprocessed" : "refined", usage: TokenUsage(inputTokens: 100, outputTokens: 10))
        }

        session.reprocessTakes(masterPrompt: "prompt")
        try await Task.sleep(nanoseconds: 100_000_000)
        XCTAssertEqual(receivedInputs, ["Take 1:\nfirst take\n\nTake 2:\nsecond take"])
        XCTAssertEqual(session.resultText, "reprocessed")
        XCTAssertEqual(session.processingTurns.map(\.kind), [.reprocessTakes])

        session.resultText = "manual edit survives as the refinement input"
        session.refineCurrentResult(masterPrompt: "prompt")
        try await Task.sleep(nanoseconds: 100_000_000)
        XCTAssertEqual(receivedInputs.last, "manual edit survives as the refinement input")
        XCTAssertEqual(session.takes.count, 2)
        XCTAssertEqual(session.processingTurns.map(\.kind), [.reprocessTakes, .refineResult])
        XCTAssertEqual(session.processingTokenUsage, TokenUsage(inputTokens: 200, outputTokens: 20))
        XCTAssertEqual(session.sessionTokenUsage, TokenUsage(inputTokens: 230, outputTokens: 23))
    }

    func testSessionRecordPersistsEveryProcessingTurnAndTakeUsage() throws {
        let dir = try tempDir()
        let turns = [
            DictateProcessingTurn(kind: .reprocessTakes, usage: TokenUsage(inputTokens: 10, outputTokens: 2), estimatedCost: 0.001),
            DictateProcessingTurn(kind: .refineResult, usage: TokenUsage(inputTokens: 20, outputTokens: 3), estimatedCost: 0.002)
        ]
        let url = try TranscriptStore.saveSession(
            takes: ["take"], result: "result", tokenUsage: TokenUsage(inputTokens: 35, outputTokens: 6),
            takeUsages: [TokenUsage(inputTokens: 5, outputTokens: 1)], processingTurns: turns, in: dir
        )
        let record = try JSONDecoder.quickText.decode(TranscriptStore.SessionRecord.self, from: Data(contentsOf: url))
        XCTAssertEqual(record.takeUsages, [TokenUsage(inputTokens: 5, outputTokens: 1)])
        XCTAssertEqual(record.processingTurns?.map(\.kind), [.reprocessTakes, .refineResult])
    }

    // MARK: - Take Reordering & Combine Tests

    func testCombinedTranscriptJoinsPlainParagraphs() {
        XCTAssertEqual(
            DictateSession.combinedTranscript(["first", "second"]),
            "first\n\nsecond")
        XCTAssertEqual(DictateSession.combinedTranscript([]), "")
    }

    @MainActor
    func testMoveTakeOntoReordersBothDirections() {
        let session = DictateSession()
        session.transcriptDirectory = makeTranscriptDirectory()
        session.takes = ["a", "b", "c"].map {
            DictateTake(audioURL: nil, transcript: $0, status: .ready)
        }
        let ids = session.takes.map(\.id)

        // Dragging the last take onto the first lands it before the first.
        session.moveTake(ids[2], onto: ids[0])
        XCTAssertEqual(session.takes.map(\.id), [ids[2], ids[0], ids[1]])
        XCTAssertEqual(session.readyTranscripts, ["c", "a", "b"])

        // Dragging the first take onto the last lands it after the last.
        session.moveTake(ids[2], onto: ids[1])
        XCTAssertEqual(session.takes.map(\.id), [ids[0], ids[1], ids[2]])
        XCTAssertEqual(session.readyTranscripts, ["a", "b", "c"])

        // Dropping a take onto itself is a no-op.
        session.moveTake(ids[0], onto: ids[0])
        XCTAssertEqual(session.takes.map(\.id), [ids[0], ids[1], ids[2]])
    }

    @MainActor
    func testMoveTakeBlockedWhileRecordingOrWorking() {
        let session = DictateSession()
        session.transcriptDirectory = makeTranscriptDirectory()
        session.takes = ["a", "b"].map {
            DictateTake(audioURL: nil, transcript: $0, status: .ready)
        }
        let ids = session.takes.map(\.id)

        session.isRecording = true
        session.moveTake(ids[1], onto: ids[0])
        XCTAssertEqual(session.takes.map(\.id), ids)

        session.isRecording = false
        session.isWorking = true
        session.moveTake(ids[1], onto: ids[0])
        XCTAssertEqual(session.takes.map(\.id), ids)
    }

    @MainActor
    func testCombineTakesIntoResultRespectsOrderSkipsEmptyAndUsesNoModelCall() {
        let session = DictateSession()
        session.transcriptDirectory = makeTranscriptDirectory()
        session.takes = [
            DictateTake(audioURL: nil, transcript: "first", status: .ready),
            DictateTake(audioURL: nil, transcript: "   ", status: .ready),
            DictateTake(audioURL: nil, transcript: nil, status: .failed("nope")),
            DictateTake(audioURL: nil, transcript: "second", status: .ready),
        ]
        var modelCalls = 0
        session.synthesize = { _, _ in
            modelCalls += 1
            return GeminiResponse(text: "should not happen", usage: .zero)
        }

        session.resultText = "previous result"
        session.combineTakesIntoResult()
        XCTAssertEqual(session.resultText, "first\n\nsecond")
        XCTAssertEqual(modelCalls, 0)
        XCTAssertTrue(session.processingTurns.isEmpty)
        XCTAssertNil(session.synthesisTokenUsage)
        XCTAssertNil(session.errorMessage)

        // Reordered takes combine in the new order.
        let ids = session.takes.map(\.id)
        session.moveTake(ids[3], onto: ids[0])
        session.combineTakesIntoResult()
        XCTAssertEqual(session.resultText, "second\n\nfirst")
        XCTAssertEqual(modelCalls, 0)
    }

    @MainActor
    func testCombineTakesIntoResultWithNothingReadySetsError() {
        let session = DictateSession()
        session.transcriptDirectory = makeTranscriptDirectory()
        session.combineTakesIntoResult()
        XCTAssertEqual(session.errorMessage, "Nothing to combine yet — record at least one take.")
        XCTAssertEqual(session.resultText, "")
    }

    @MainActor
    func testReprocessRespectsReorderedTakes() async throws {
        let session = DictateSession()
        session.transcriptDirectory = makeTranscriptDirectory()
        let suiteName = "test-reorder-reprocess-\(UUID().uuidString)"
        let defaults = UserDefaults(suiteName: suiteName)!
        session.statsStore = DictateStatsStore(defaults: defaults)
        session.takes = ["aaa", "bbb", "ccc"].map {
            DictateTake(audioURL: nil, transcript: $0, status: .ready)
        }
        var receivedInputs: [String] = []
        session.synthesize = { _, input in
            receivedInputs.append(input)
            return GeminiResponse(text: "ok", usage: .zero)
        }

        let ids = session.takes.map(\.id)
        session.moveTake(ids[2], onto: ids[0])
        session.reprocessTakes(masterPrompt: "prompt")
        try await Task.sleep(nanoseconds: 100_000_000)
        XCTAssertEqual(receivedInputs, ["Take 1:\nccc\n\nTake 2:\naaa\n\nTake 3:\nbbb"])

        defaults.removePersistentDomain(forName: suiteName)
    }

    // MARK: - Live Transcription

    func testLivePCMConverterResamplesMicrophoneFormat() throws {
        for (sampleRate, channels) in [(44_100.0, AVAudioChannelCount(1)),
                                       (48_000.0, AVAudioChannelCount(1)),
                                       (48_000.0, AVAudioChannelCount(2))] {
            let source = try XCTUnwrap(AVAudioFormat(
                commonFormat: .pcmFormatFloat32, sampleRate: sampleRate,
                channels: channels, interleaved: false))
            let converter = try XCTUnwrap(LivePCM16Converter(from: source))
            let input = try XCTUnwrap(AVAudioPCMBuffer(pcmFormat: source, frameCapacity: 4096))
            input.frameLength = 4096
            let samples = try XCTUnwrap(input.floatChannelData)
            for channel in 0..<Int(channels) {
                for index in 0..<4096 {
                    samples[channel][index] = sin(Float(index) * 0.05) * 0.3
                }
            }
            let pcm = try converter.convert(input)
            XCTAssertGreaterThan(pcm.count, 2_000)
            XCTAssertLessThan(pcm.count, 4_000)
            XCTAssertTrue(pcm.contains { $0 != 0 })
        }
    }

    /// Scripted driver: no socket, no mic. Fails on start or replays events.
    final class FakeLiveDriver: LiveTranscriptionDriver {
        enum Behavior {
            case failToConnect
            case replay([GeminiLiveClient.LiveEvent])
        }

        let behavior: Behavior
        private(set) var sentAudioCount = 0
        private(set) var didStop = false

        init(_ behavior: Behavior) { self.behavior = behavior }

        func start(apiKey: String) async throws {
            if case .failToConnect = behavior {
                throw DictateError.network(URLError(.notConnectedToInternet))
            }
        }

        func sendAudio(_ pcmChunk: Data) { sentAudioCount += 1 }

        func events() -> AsyncStream<GeminiLiveClient.LiveEvent> {
            AsyncStream { continuation in
                if case .replay(let events) = behavior {
                    for event in events { continuation.yield(event) }
                }
                continuation.finish()
            }
        }

        func stop() { didStop = true }
    }

    func testLiveSetupMessageRequestsTranscription() {
        let message = GeminiLiveClient.setupMessage()
        let setup = message["setup"] as? [String: Any]
        XCTAssertEqual(setup?["model"] as? String, "models/gemini-3.5-transcribe-live")
        XCTAssertEqual((setup?["generationConfig"] as? [String: Any])?["responseModalities"] as? [String], ["TEXT"])
        XCTAssertEqual((setup?["inputAudioTranscription"] as? [String: Any])?["languageCodes"] as? [String], [])
        let url = GeminiLiveClient.endpointURL(apiKey: "a+b/c?d")
        XCTAssertTrue(url?.absoluteString.contains("v1beta.GenerativeService.BidiGenerateContent") == true)
        XCTAssertEqual(URLComponents(url: url!, resolvingAgainstBaseURL: false)?.queryItems?.first?.value, "a+b/c?d")
        let audio = GeminiLiveClient.audioMessage(pcmData: Data([0, 1]))["realtimeInput"] as? [String: Any]
        XCTAssertEqual((audio?["audio"] as? [String: String])?["data"], "AAE=")
        XCTAssertNil(audio?["mediaChunks"])
        XCTAssertEqual((GeminiLiveClient.audioStreamEndMessage()["realtimeInput"] as? [String: Bool])?["audioStreamEnd"], true)
    }

    func testLiveSetupCompleteGateIgnoresOtherFrames() async throws {
        let frames = [
            Data(#"{"serverContent":{"interimInputTranscription":{"text":"early"}}}"#.utf8),
            Data(#"{"setupComplete":{}}"#.utf8)
        ]
        var index = 0
        try await GeminiLiveClient.awaitSetupComplete {
            defer { index += 1 }
            return frames[index]
        }
        XCTAssertEqual(index, 2)
        XCTAssertFalse(GeminiLiveClient.isSetupComplete(Data(#"{"serverContent":{}}"#.utf8)))
    }

    func testLiveSetupRejectionAndTimeoutHaveDistinctStages() async {
        do {
            try await GeminiLiveClient.awaitSetupComplete {
                Data(#"{"error":{"code":1008,"status":"PERMISSION_DENIED","message":"Model unavailable"}}"#.utf8)
            }
            XCTFail("expected setup rejection")
        } catch {
            XCTAssertEqual(error.localizedDescription,
                           "Live Setup rejected: 1008 PERMISSION_DENIED: Model unavailable")
        }

        do {
            try await GeminiLiveClient.awaitSetupComplete(
                receive: {
                    try await Task.sleep(nanoseconds: 1_000_000_000)
                    return Data(#"{"setupComplete":{}}"#.utf8)
                }, timeoutNanoseconds: 1_000_000, onTimeout: {})
            XCTFail("expected setup timeout")
        } catch {
            XCTAssertEqual((error as? LiveConnectionError)?.stage, .setupTimeout)
        }
    }

    func testLiveStageLabelsAndWebSocketCloseDetails() {
        let stages: [LiveConnectionStage] = [
            .openTimeout, .setupSend, .setupAcknowledgement, .setupRejected,
            .setupTimeout, .realtimeSend, .receiveClose
        ]
        for stage in stages {
            let error = LiveConnectionError(stage: stage, detail: "sample failure",
                                            closeCode: nil, closeReason: nil)
            XCTAssertTrue(error.localizedDescription.contains("Live \(stage.rawValue): sample failure"))
        }
        let closed = LiveConnectionError(stage: .receiveClose, detail: "socket closed",
                                         closeCode: .policyViolation,
                                         closeReason: Data("not permitted".utf8))
        XCTAssertTrue(closed.localizedDescription.contains("close code 1008"))
        XCTAssertTrue(closed.localizedDescription.contains("reason: not permitted"))
        let receiveError = LiveConnectionError.transport(
            .setupAcknowledgement, error: URLError(.networkConnectionLost), task: nil)
        XCTAssertEqual(receiveError.stage, .setupAcknowledgement)
        XCTAssertTrue(receiveError.localizedDescription.contains("Live Setup acknowledgement:"))
        XCTAssertEqual(GeminiLiveClient.emptyStreamError().localizedDescription,
                       "Live Receive/close: No transcript received within 3 seconds after audioStreamEnd.")
    }

    func testLiveParsesInterimFinalAndUsage() {
        let interim = Data(#"{"serverContent":{"interimInputTranscription":{"text":"hello"},"turnComplete":false}}"#.utf8)
        let interimUpdate = GeminiLiveClient.parseServerMessage(interim)
        XCTAssertEqual(interimUpdate?.transcriptChunk, "hello")
        XCTAssertEqual(interimUpdate?.isFinal, false)

        // Official Live envelope: usageMetadata is a top-level sibling of
        // serverContent (https://ai.google.dev/api/live), using the Live
        // UsageMetadata fields promptTokenCount / responseTokenCount.
        let final = Data(#"{"serverContent":{"inputTranscription":{"text":"hello world"}},"usageMetadata":{"promptTokenCount":100,"responseTokenCount":5,"totalTokenCount":105}}"#.utf8)
        let finalUpdate = GeminiLiveClient.parseServerMessage(final)
        XCTAssertEqual(finalUpdate?.transcriptChunk, "hello world")
        XCTAssertEqual(finalUpdate?.isFinal, true)
        XCTAssertEqual(finalUpdate?.usage, TokenUsage(inputTokens: 100, outputTokens: 5))

        // Nested placement kept for tolerance.
        let nested = Data(#"{"serverContent":{"inputTranscription":{"text":"hi"},"usageMetadata":{"promptTokenCount":7,"responseTokenCount":2}}}"#.utf8)
        XCTAssertEqual(GeminiLiveClient.parseServerMessage(nested)?.usage, TokenUsage(inputTokens: 7, outputTokens: 2))

        // usageMetadata-only frame still surfaces usage with no transcript.
        let usageOnly = Data(#"{"usageMetadata":{"promptTokenCount":50,"responseTokenCount":3}}"#.utf8)
        XCTAssertEqual(GeminiLiveClient.parseServerMessage(usageOnly)?.usage, TokenUsage(inputTokens: 50, outputTokens: 3))

        XCTAssertNil(GeminiLiveClient.parseServerMessage(Data(#"{"setupComplete":{}}"#.utf8)))
        XCTAssertNil(GeminiLiveClient.parseServerMessage(Data("not json".utf8)))
    }

    func testLiveTranscribePricingMatchesOfficialRates() {
        // https://ai.google.dev/gemini-api/docs/pricing: $3.50/M audio input,
        // $21.00/M text output, with no introductory/standard split.
        XCTAssertEqual(TokenUsage.ModelPricing.liveTranscribe.inputRatePerToken, 3.50 / 1_000_000.0, accuracy: 1e-12)
        XCTAssertEqual(TokenUsage.ModelPricing.liveTranscribe.outputRatePerToken, 21.00 / 1_000_000.0, accuracy: 1e-12)
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(identifier: "UTC")!
        var comp = DateComponents()
        comp.year = 2027
        comp.month = 6
        comp.day = 15
        let date2027 = calendar.date(from: comp)!
        XCTAssertEqual(TokenUsage.ModelPricing.liveTranscribe.inputRatePerToken(at: date2027), 3.50 / 1_000_000.0, accuracy: 1e-12)
        XCTAssertEqual(TokenUsage.ModelPricing.liveTranscribe.outputRatePerToken(at: date2027), 21.00 / 1_000_000.0, accuracy: 1e-12)
        let cost = TokenUsage(inputTokens: 1_000_000, outputTokens: 1_000_000).estimatedCost(pricing: .liveTranscribe)
        XCTAssertEqual(cost, 3.50 + 21.00, accuracy: 1e-9)
    }

    @MainActor
    func testSessionEstimatedCostUsesActualTakeSources() {
        let previous = TranscriptionMode.stored
        defer { TranscriptionMode.stored = previous }
        let session = DictateSession()
        session.transcriptDirectory = makeTranscriptDirectory()
        session.takes = [
            DictateTake(audioURL: nil, transcript: "live", tokenUsage: TokenUsage(inputTokens: 1_000, outputTokens: 100), status: .ready, isLive: true),
            DictateTake(audioURL: nil, transcript: "rest", tokenUsage: TokenUsage(inputTokens: 1_000, outputTokens: 100), status: .ready, isLive: false)
        ]
        TranscriptionMode.stored = .realTime
        XCTAssertEqual(
            session.sessionEstimatedCost,
            TokenUsage.estimatedCost(inputTokens: 1_000, outputTokens: 100, pricing: .liveTranscribe) + TokenUsage.estimatedCost(inputTokens: 1_000, outputTokens: 100, pricing: .flash),
            accuracy: 1e-9)
        TranscriptionMode.stored = .afterTake
        XCTAssertEqual(
            session.sessionEstimatedCost,
            TokenUsage.estimatedCost(inputTokens: 1_000, outputTokens: 100, pricing: .liveTranscribe) + TokenUsage.estimatedCost(inputTokens: 1_000, outputTokens: 100, pricing: .flash),
            accuracy: 1e-9)
    }

    func testSaveSessionFallbackUsesLiveAndRestMetadata() throws {
        let previous = TranscriptionMode.stored
        defer { TranscriptionMode.stored = previous }
        let dir = try tempDir()
        let transcription = TokenUsage(inputTokens: 2_000, outputTokens: 200)
        let live = TokenUsage(inputTokens: 1_000, outputTokens: 100)
        let synthesis = TokenUsage(inputTokens: 500, outputTokens: 50)
        TranscriptionMode.stored = .realTime
        let url = try TranscriptStore.saveSession(
            takes: ["take"], result: "result",
            tokenUsage: TokenUsage(inputTokens: 2_500, outputTokens: 250),
            transcriptionUsage: transcription,
            liveTranscriptionUsage: live,
            synthesisUsage: synthesis,
            in: dir
        )
        let record = try JSONDecoder.quickText.decode(TranscriptStore.SessionRecord.self, from: Data(contentsOf: url))
        let expected = live.estimatedCost(pricing: .liveTranscribe)
            + live.estimatedCost(pricing: .flash)
            + synthesis.estimatedCost(pricing: .flash)
        XCTAssertEqual(record.liveTranscriptionUsage, live)
        XCTAssertEqual(record.estimatedCost!, expected, accuracy: 1e-9)
    }

    func testLiveTranscriptAssemblerReplacesRevisedInterimAndJoinsFinalSegments() {
        var transcript = LiveTranscriptAssembler()
        transcript.accept("Four score and seven years ago, our fathers", isFinal: false)
        transcript.accept("Four score and seven years ago our fathers set", isFinal: false)
        transcript.accept("Four score and seven years ago our fathers brought forth on this continent", isFinal: false)
        XCTAssertEqual(transcript.text,
                       "Four score and seven years ago our fathers brought forth on this continent")
        transcript.accept("", isFinal: true) // turnComplete must not commit a speculative hypothesis
        transcript.accept("Four score and seven years ago, our fathers brought forth on this continent.", isFinal: true)
        XCTAssertEqual(transcript.text,
                       "Four score and seven years ago, our fathers brought forth on this continent.")

        transcript.accept("a new", isFinal: false)
        XCTAssertEqual(transcript.text,
                       "Four score and seven years ago, our fathers brought forth on this continent. a new")
        transcript.accept("a new nation", isFinal: true)
        XCTAssertEqual(transcript.text,
                       "Four score and seven years ago, our fathers brought forth on this continent. a new nation")
        transcript.accept("Four score and seven years ago, our fathers brought forth on this continent, a new nation.", isFinal: true)
        XCTAssertEqual(transcript.text,
                       "Four score and seven years ago, our fathers brought forth on this continent, a new nation.")
    }

    func testLiveSocketOpenerSignalsOpenEitherOrder() async {
        // Signal before waiting.
        let early = LiveSocketOpener()
        early.notifyOpened()
        await early.waitForOpen()

        // Signal after waiting starts.
        let late = LiveSocketOpener()
        async let waiter: Void = late.waitForOpen()
        late.notifyOpened()
        await waiter
    }

    func testLiveSocketOpenerTimesOut() async {
        let opener = LiveSocketOpener()
        do {
            try await opener.waitForOpen(timeoutNanoseconds: 1_000_000)
            XCTFail("expected a timeout")
        } catch {
            guard case DictateError.network(let underlying as URLError) = error else {
                XCTFail("expected DictateError.network(URLError), got \(error)")
                return
            }
            XCTAssertEqual(underlying.code, .timedOut)
        }
    }

    func testTranscriptionModeDefaultsToAfterTake() {
        UserDefaults.standard.removeObject(forKey: TranscriptionMode.storageKey)
        XCTAssertEqual(TranscriptionMode.stored, .afterTake)
        TranscriptionMode.stored = .realTime
        XCTAssertEqual(TranscriptionMode.stored, .realTime)
        TranscriptionMode.stored = .afterTake
    }

    @MainActor
    func testLiveFailureFallsBackToRestTake() async throws {
        let session = DictateSession()
        session.transcriptDirectory = makeTranscriptDirectory()
        let dir = try tempDir()
        let audioURL = dir.appendingPathComponent("live-fallback.m4a")
        try Data("fake-audio".utf8).write(to: audioURL)
        let take = DictateTake(audioURL: audioURL, transcript: nil, status: .recording)
        session.takes = [take]

        var restCalls = 0
        session.transcribe = { _, _ in
            restCalls += 1
            return GeminiResponse(text: "restored", usage: TokenUsage(inputTokens: 10, outputTokens: 1))
        }

        let outcome = await session.pumpLiveTake(driver: FakeLiveDriver(.failToConnect), takeID: take.id, apiKey: "test-key")
        XCTAssertEqual(outcome.text, "")
        session.finalizeLiveTake(outcome, takeID: take.id, audioURL: audioURL)
        try await Task.sleep(nanoseconds: 100_000_000)

        XCTAssertEqual(restCalls, 1)
        XCTAssertEqual(session.takes.first?.transcript, "restored")
        XCTAssertEqual(session.takes.first?.status, .ready)
        XCTAssertFalse(FileManager.default.fileExists(atPath: audioURL.path))
    }

    @MainActor
    func testLiveFallbackNoticeIncludesStreamError() async throws {
        let session = DictateSession()
        session.transcriptDirectory = makeTranscriptDirectory()
        let dir = try tempDir()
        session.transcribe = { _, _ in
            GeminiResponse(text: "restored", usage: .zero)
        }

        let withErrorURL = dir.appendingPathComponent("live-fallback-error.m4a")
        try Data("fake-audio".utf8).write(to: withErrorURL)
        let withError = DictateTake(audioURL: withErrorURL, transcript: nil, status: .recording)
        session.takes = [withError]
        session.finalizeLiveTake(
            LiveTakeOutcome(text: "", errorMessage: "The operation couldn’t be completed."),
            takeID: withError.id, audioURL: withErrorURL)
        XCTAssertEqual(
            session.errorMessage,
            "Real-time transcription dropped (The operation couldn’t be completed.) — transcribing after take.")

        let bareURL = dir.appendingPathComponent("live-fallback-bare.m4a")
        try Data("fake-audio".utf8).write(to: bareURL)
        let bare = DictateTake(audioURL: bareURL, transcript: nil, status: .recording)
        session.takes = [bare]
        session.finalizeLiveTake(
            LiveTakeOutcome(text: "   ", errorMessage: nil),
            takeID: bare.id, audioURL: bareURL)
        XCTAssertEqual(
            session.errorMessage,
            "Real-time transcription dropped — transcribing after take.")
        try await Task.sleep(nanoseconds: 100_000_000)
    }

    @MainActor
    func testLivePartialTranscriptNoticeKeepsDiagnosticStage() throws {
        let session = DictateSession()
        session.transcriptDirectory = makeTranscriptDirectory()
        let dir = try tempDir()
        let audioURL = dir.appendingPathComponent("live-partial.m4a")
        try Data("fake-audio".utf8).write(to: audioURL)
        let take = DictateTake(audioURL: audioURL, transcript: nil, status: .recording)
        session.takes = [take]
        session.finalizeLiveTake(
            LiveTakeOutcome(text: "partial", errorMessage: "Live Receive/close: socket closed"),
            takeID: take.id, audioURL: audioURL)
        XCTAssertEqual(session.takes.first?.transcript, "partial")
        XCTAssertEqual(session.errorMessage,
                       "Real-time connection dropped (Live Receive/close: socket closed) — kept the streamed text.")
    }

    @MainActor
    func testLiveSuccessSkipsRestTake() async throws {
        let session = DictateSession()
        session.transcriptDirectory = makeTranscriptDirectory()
        let dir = try tempDir()
        let audioURL = dir.appendingPathComponent("live-success.m4a")
        try Data("fake-audio".utf8).write(to: audioURL)
        let take = DictateTake(audioURL: audioURL, transcript: nil, status: .recording)
        session.takes = [take]

        var restCalls = 0
        session.transcribe = { _, _ in
            restCalls += 1
            return GeminiResponse(text: "unused", usage: .zero)
        }

        let driver = FakeLiveDriver(.replay([
            .transcript(text: "hello", isFinal: false),
            .transcript(text: "hello world", isFinal: true),
            .usage(TokenUsage(inputTokens: 100, outputTokens: 5))
        ]))
        let outcome = await session.pumpLiveTake(driver: driver, takeID: take.id, apiKey: "test-key")
        XCTAssertEqual(outcome.text, "hello world")
        XCTAssertTrue(outcome.receivedFinal)
        // Interim text lands on the recording take live.
        XCTAssertEqual(session.takes.first?.transcript, "hello world")

        session.finalizeLiveTake(outcome, takeID: take.id, audioURL: audioURL)
        XCTAssertEqual(restCalls, 0)
        XCTAssertEqual(session.takes.first?.status, .ready)
        XCTAssertEqual(session.takes.first?.tokenUsage, TokenUsage(inputTokens: 100, outputTokens: 5))
        XCTAssertEqual(session.takes.first?.isLive, true)
        XCTAssertFalse(FileManager.default.fileExists(atPath: audioURL.path))
    }

    @MainActor
    func testLiveRevisedInterimPersistsOnlyFinalSentence() async throws {
        let session = DictateSession()
        session.transcriptDirectory = makeTranscriptDirectory()
        let dir = try tempDir()
        let audioURL = dir.appendingPathComponent("live-revised-interim.m4a")
        try Data("fake-audio".utf8).write(to: audioURL)
        let take = DictateTake(audioURL: audioURL, transcript: nil, status: .recording)
        session.takes = [take]
        session.transcribe = { _, _ in
            XCTFail("REST fallback should not run")
            return GeminiResponse(text: "", usage: .zero)
        }
        let driver = FakeLiveDriver(.replay([
            .transcript(text: "Four score and seven years ago, our fathers", isFinal: false),
            .transcript(text: "Four score and seven years ago our fathers set", isFinal: false),
            .transcript(text: "Four score and seven years ago our fathers brought forth on this continent", isFinal: false),
            .transcript(text: "Four score and seven years ago, our fathers brought forth on this continent.", isFinal: true)
        ]))
        let outcome = await session.pumpLiveTake(driver: driver, takeID: take.id, apiKey: "test-key")
        session.finalizeLiveTake(outcome, takeID: take.id, audioURL: audioURL)
        XCTAssertEqual(session.takes.first?.transcript,
                       "Four score and seven years ago, our fathers brought forth on this continent.")
    }

    // MARK: - Take Transcript Sizing

    /// The take card must grow to fit the whole transcript: with a zero-size
    /// starting frame (as in the view), a multi-line transcript has to measure
    /// several lines taller than a single line, otherwise the last line renders
    /// clipped behind the card edge.
    @MainActor
    func testTakeTranscriptViewFitsFullContent() {
        let font = NSFont.systemFont(ofSize: 19)
        let style = NSMutableParagraphStyle()
        style.lineSpacing = 7
        let attributes: [NSAttributedString.Key: Any] = [.font: font, .paragraphStyle: style]

        let longView = AutoHeightTextView.baseTextView(font: font, label: "Take 1 transcript")
        longView.textStorage?.setAttributedString(NSAttributedString(
            string: "This is just an example of the general sentiment I want to convey, you can rework the language as needed. Keep it concise, and also find a way to mention that I have a referral from a former McKinsey colleague.",
            attributes: attributes))

        let shortView = AutoHeightTextView.baseTextView(font: font, label: "Take 1 transcript")
        shortView.textStorage?.setAttributedString(NSAttributedString(string: "Hi.", attributes: attributes))

        guard let full = AutoHeightTextView.fittingHeight(textView: longView, width: 300),
              let single = AutoHeightTextView.fittingHeight(textView: shortView, width: 300) else {
            XCTFail("fittingHeight returned nil for a finite width")
            return
        }
        XCTAssertGreaterThan(full, single * 3)
        XCTAssertNil(AutoHeightTextView.fittingHeight(textView: shortView, width: 0))
    }

    /// Transcription arrives programmatically (transcribing → ready), bypassing
    /// the typing delegate — the card must still re-measure taller, otherwise
    /// Take 1's text paints over Take 2.
    @MainActor
    func testTakeTranscriptViewGrowsOnProgrammaticUpdate() {
        let font = NSFont.systemFont(ofSize: 19)
        let view = AutoHeightTextView.baseTextView(font: font, label: "Take 1 transcript")
        view.string = "Hi."
        guard let before = AutoHeightTextView.fittingHeight(textView: view, width: 300) else {
            XCTFail("fittingHeight returned nil for a finite width")
            return
        }
        view.string = "This is just an example of the general sentiment I want to convey, you can rework the language as needed. Keep it concise, and also find a way to mention that I have a referral from a former McKinsey colleague."
        guard let after = AutoHeightTextView.fittingHeight(textView: view, width: 300) else {
            XCTFail("fittingHeight returned nil after programmatic update")
            return
        }
        XCTAssertGreaterThan(after, before * 3)
    }

    // MARK: - Pinned height with scroll fallback

    /// Displayed height is the measured height capped at maxHeight: a long
    /// transcription pins at the cap instead of growing unbounded.
    func testPinnedHeightIsCappedAtMaxHeight() {
        XCTAssertEqual(AutoHeightTextView.pinnedHeight(measured: 2400, maxHeight: 480), 480)
        XCTAssertEqual(AutoHeightTextView.pinnedHeight(measured: 480, maxHeight: 480), 480)
        XCTAssertEqual(AutoHeightTextView.pinnedHeight(measured: 120, maxHeight: 480), 120)
    }

    /// Pin writes are thresholded so layout converges instead of churning on
    /// sub-point jitter from repeated re-measures.
    func testHeightPinUpdateThreshold() {
        XCTAssertTrue(AutoHeightTextView.heightNeedsUpdate(old: nil, new: 120))
        XCTAssertFalse(AutoHeightTextView.heightNeedsUpdate(old: 120, new: 120.2))
        XCTAssertTrue(AutoHeightTextView.heightNeedsUpdate(old: 120, new: 121))
        XCTAssertFalse(AutoHeightTextView.heightNeedsUpdate(old: 480, new: 480))
    }

    /// The scroll container keeps the full transcript in the text system
    /// while the displayed height stays capped: scroll, not overflow.
    @MainActor
    func testCappedTakeKeepsFullTextForScrolling() {
        let font = NSFont.systemFont(ofSize: 19)
        let scroll = AutoHeightTextView.makeScrollView(font: font, label: "Take 1 transcript")
        guard let doc = scroll.documentView as? NSTextView else {
            XCTFail("take scroll view has no text document")
            return
        }
        let long = String(repeating: "The mail room and the trash room. ", count: 200)
        doc.string = long
        guard let measured = AutoHeightTextView.fittingHeight(textView: doc, width: 300) else {
            XCTFail("fittingHeight returned nil for a finite width")
            return
        }
        XCTAssertGreaterThan(measured, AutoHeightTextView.defaultMaxHeight)
        XCTAssertEqual(
            AutoHeightTextView.pinnedHeight(measured: measured, maxHeight: AutoHeightTextView.defaultMaxHeight),
            AutoHeightTextView.defaultMaxHeight)
        XCTAssertEqual(doc.string, long)
    }

    /// Re-applying identical attributes must not change the measured height.
    /// Redundant text-system mutation ahead of a re-measure is what let a
    /// transient short value stick and paint over the next take, so the
    /// update fast path skips it — this test pins that premise.
    @MainActor
    func testIdenticalAttributeReapplicationKeepsMeasuredHeight() {
        let font = NSFont.systemFont(ofSize: 19)
        let view = AutoHeightTextView.baseTextView(font: font, label: "Take 1 transcript")
        view.string = String(repeating: "Space number two, main entrance. ", count: 60)
        let style = NSMutableParagraphStyle()
        style.lineSpacing = 7
        let attributes: [NSAttributedString.Key: Any] = [.font: font, .paragraphStyle: style]
        view.textStorage?.setAttributes(attributes, range: NSRange(location: 0, length: view.string.utf16.count))
        guard let first = AutoHeightTextView.fittingHeight(textView: view, width: 300) else {
            XCTFail("fittingHeight returned nil for a finite width")
            return
        }
        view.textStorage?.setAttributes(attributes, range: NSRange(location: 0, length: view.string.utf16.count))
        guard let second = AutoHeightTextView.fittingHeight(textView: view, width: 300) else {
            XCTFail("fittingHeight returned nil after re-applying attributes")
            return
        }
        XCTAssertEqual(first, second)
    }

    /// Appearance changes must re-apply styling: the no-op fast path in
    /// updateNSView keys on the full applied signature including scheme.
    func testAppliedStyleDistinguishesAppearanceChange() {
        let color = Color.gray
        let light = AutoHeightTextView.AppliedStyle(
            fontName: "Helvetica", pointSize: 19, lineSpacing: 7,
            textColor: color, caretColor: color, selectionColor: color, scheme: .light)
        XCTAssertEqual(light, light)
        XCTAssertNotEqual(light, AutoHeightTextView.AppliedStyle(
            fontName: "Helvetica", pointSize: 19, lineSpacing: 7,
            textColor: color, caretColor: color, selectionColor: color, scheme: .dark))
    }

    /// The coordinator pins the measured height back into SwiftUI state, so a
    /// later re-layout keeps the card at content height without re-measuring.
    @MainActor
    func testCoordinatorPinsMeasuredHeight() async {
        let font = NSFont.systemFont(ofSize: 19)
        final class PinBox: @unchecked Sendable { var value: CGFloat? = nil }
        let box = PinBox()
        let written = expectation(description: "pinned height written")
        let binding = Binding<CGFloat?>(
            get: { box.value },
            set: { box.value = $0; written.fulfill() })
        let parent = AutoHeightTextView(
            text: .constant("Hi."),
            contentHeight: binding,
            font: font,
            lineSpacing: 7,
            textColor: .primary,
            caretColor: .accentColor,
            selectionColor: .accentColor,
            accessibilityLabel: "Take 1 transcript",
            colorScheme: .light)
        let coordinator = AutoHeightTextView.Coordinator(parent)
        let scroll = AutoHeightTextView.makeScrollView(font: font, label: "Take 1 transcript")
        guard let doc = scroll.documentView as? NSTextView else {
            XCTFail("take scroll view has no text document")
            return
        }
        doc.string = "Hi."
        coordinator.syncHeight(scrollView: scroll, width: 300)
        await fulfillment(of: [written], timeout: 2)
        guard let measured = AutoHeightTextView.fittingHeight(textView: doc, width: 300) else {
            XCTFail("fittingHeight returned nil for a finite width")
            return
        }
        XCTAssertEqual(box.value ?? -1, measured, accuracy: 0.5)
    }

    // MARK: - Failed-take audio recovery

    /// A take directory for preserved audio that never touches the real
    /// store; removed after the test.
    func makeFailedTakeAudioDirectory() -> URL {
        let dir = FileManager.default.temporaryDirectory
            .appendingPathComponent("failed-take-audio-\(UUID().uuidString)", isDirectory: true)
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        addTeardownBlock { try? FileManager.default.removeItem(at: dir) }
        return dir
    }

    @MainActor
    func testFailedTakeAudioIsPreservedAndSurvivesNewSession() async throws {
        let session = DictateSession()
        session.transcriptDirectory = makeTranscriptDirectory()
        session.failedTakeAudioDirectory = makeFailedTakeAudioDirectory()
        let suiteName = "test-preserve-\(UUID().uuidString)"
        session.statsStore = DictateStatsStore(defaults: UserDefaults(suiteName: suiteName)!)
        defer { UserDefaults.standard.removePersistentDomain(forName: suiteName) }
        session.transcribe = { _, _ in
            throw DictateError.apiError(status: 400, message: "input was blocked")
        }

        let tempAudio = FileManager.default.temporaryDirectory
            .appendingPathComponent("blocked-\(UUID().uuidString).m4a")
        let bytes = Data("blocked-audio".utf8)
        try bytes.write(to: tempAudio)
        session.takes = [DictateTake(audioURL: tempAudio, transcript: nil, status: .recording)]
        session.stopRecording()
        try await Task.sleep(nanoseconds: 200_000_000)

        guard case .failed = session.takes.first?.status else {
            return XCTFail("take should be failed after a blocked transcription")
        }
        let preserved = try XCTUnwrap(session.takes.first?.audioURL)
        XCTAssertTrue(
            FailedTakeAudioStore.isPreserved(preserved, in: session.failedTakeAudioDirectory))
        XCTAssertEqual(try Data(contentsOf: preserved), bytes)
        XCTAssertFalse(FileManager.default.fileExists(atPath: tempAudio.path))

        // A new session must not sweep the only recoverable copy.
        session.newSession()
        XCTAssertEqual(session.takes.count, 0)
        XCTAssertTrue(
            FileManager.default.fileExists(atPath: preserved.path),
            "new sessions must not delete preserved failed-take audio")
    }

    @MainActor
    func testRetryStillPossibleAfterPreservation() async throws {
        let session = DictateSession()
        session.transcriptDirectory = makeTranscriptDirectory()
        session.failedTakeAudioDirectory = makeFailedTakeAudioDirectory()
        let suiteName = "test-retry-\(UUID().uuidString)"
        session.statsStore = DictateStatsStore(defaults: UserDefaults(suiteName: suiteName)!)
        defer { UserDefaults.standard.removePersistentDomain(forName: suiteName) }
        var attempts = 0
        session.transcribe = { _, _ in
            attempts += 1
            if attempts == 1 { throw DictateError.apiError(status: 400, message: "input was blocked") }
            return GeminiResponse(text: "recovered", usage: .zero)
        }

        let tempAudio = FileManager.default.temporaryDirectory
            .appendingPathComponent("retry-\(UUID().uuidString).m4a")
        try Data("retry-audio".utf8).write(to: tempAudio)
        session.takes = [DictateTake(audioURL: tempAudio, transcript: nil, status: .recording)]
        session.stopRecording()
        try await Task.sleep(nanoseconds: 200_000_000)
        guard case .failed = session.takes.first?.status else {
            return XCTFail("first attempt should fail")
        }

        session.retryTake(session.takes[0])
        try await Task.sleep(nanoseconds: 200_000_000)
        XCTAssertEqual(session.takes.first?.status, .ready)
        XCTAssertEqual(session.takes.first?.transcript, "recovered")
        XCTAssertNil(session.takes.first?.audioURL, "success still discards the audio")
    }

    @MainActor
    func testDeleteTakeRemovesPreservedAudio() throws {
        let session = DictateSession()
        let dir = makeFailedTakeAudioDirectory()
        let preserved = dir.appendingPathComponent("failed-take-test.m4a")
        try Data("doomed".utf8).write(to: preserved)
        let take = DictateTake(audioURL: preserved, transcript: nil, status: .failed("blocked"))
        session.takes = [take]

        session.deleteTake(take)

        XCTAssertEqual(session.takes.count, 0)
        XCTAssertFalse(FileManager.default.fileExists(atPath: preserved.path))
    }

    @MainActor
    func testExportTakeAudioCopiesRecording() throws {
        let session = DictateSession()
        let dir = makeFailedTakeAudioDirectory()
        let source = dir.appendingPathComponent("failed-take-export.m4a")
        let bytes = Data("export-me".utf8)
        try bytes.write(to: source)
        let take = DictateTake(audioURL: source, transcript: nil, status: .failed("blocked"))

        let destination = dir.appendingPathComponent("saved-take.m4a")
        try session.exportTakeAudio(take, to: destination)
        XCTAssertEqual(try Data(contentsOf: destination), bytes)
        // Exporting keeps the take intact for retry and playback.
        XCTAssertEqual(take.audioURL, source)
        XCTAssertTrue(FileManager.default.fileExists(atPath: source.path))

        // Saving over an existing file replaces it instead of throwing.
        try session.exportTakeAudio(take, to: destination)
        XCTAssertEqual(try Data(contentsOf: destination), bytes)

        let silent = DictateTake(audioURL: nil, transcript: nil, status: .failed("blocked"))
        XCTAssertThrowsError(try session.exportTakeAudio(silent, to: destination))
    }

    func testSuggestedFilenameFormat() {
        let name = FailedTakeAudioStore.suggestedFilename(takeNumber: 1, date: Date(timeIntervalSince1970: 0))
        XCTAssertTrue(name.hasPrefix("QuickText-Take1-"))
        XCTAssertTrue(name.hasSuffix(".m4a"))
    }

    // MARK: - Live finalization gate

    func testGateClosesImmediatelyOnTurnCompleteAfterEnd() {
        var gate = LiveFinalizationGate()
        gate.markEndSent(at: 0)
        gate.noteFrame(at: 100_000_000, isFinal: true, hasText: true)
        XCTAssertFalse(gate.shouldClose(at: 150_000_000))
        gate.noteFrame(at: 100_000_000, isFinal: true, hasText: false)
        XCTAssertTrue(gate.shouldClose(at: 150_000_000))
    }

    func testGateWaitsQuietWindowWhenFinalCameBeforeEnd() {
        var gate = LiveFinalizationGate()
        gate.noteFrame(at: 0, isFinal: true, hasText: true)
        gate.noteFrame(at: 10, isFinal: true, hasText: false) // turn ended pre-release
        gate.markEndSent(at: 60_000_000)
        XCTAssertFalse(gate.shouldClose(at: 500_000_000))
        XCTAssertTrue(gate.shouldClose(at: 900_000_000))
    }

    func testGateInterimAloneNeverClosesBeforeCeiling() {
        var gate = LiveFinalizationGate()
        gate.markEndSent(at: 0)
        gate.noteFrame(at: 100_000_000, isFinal: false, hasText: true)
        XCTAssertFalse(gate.shouldClose(at: 1_900_000_000))
        XCTAssertTrue(gate.shouldClose(at: 2_000_000_000))
    }

    func testGateNeverClosesBeforeEndSent() {
        var gate = LiveFinalizationGate()
        gate.noteFrame(at: 0, isFinal: true, hasText: false)
        XCTAssertFalse(gate.shouldClose(at: 10_000_000_000))
    }
}

extension XCTestCase {
    /// Temp archive for `DictateSession.transcriptDirectory`, removed after
    /// the test, so processing never writes into the real transcript history.
    func makeTranscriptDirectory() -> URL {
        let dir = FileManager.default.temporaryDirectory
            .appendingPathComponent("dictate-transcripts-\(UUID().uuidString)", isDirectory: true)
        addTeardownBlock { try? FileManager.default.removeItem(at: dir) }
        return dir
    }

}
