import XCTest
import AppKit
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
    }

    @MainActor
    func testUpdateTranscriptAndCopyTake() {
        let session = DictateSession()
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
        let session = DictateSession()
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
            "voice-process-email"
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
}
