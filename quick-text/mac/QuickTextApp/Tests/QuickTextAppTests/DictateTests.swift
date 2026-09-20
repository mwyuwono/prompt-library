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
}
