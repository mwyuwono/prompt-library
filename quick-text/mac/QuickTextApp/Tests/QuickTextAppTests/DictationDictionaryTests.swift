import XCTest
@testable import QuickTextApp

final class DictationDictionaryTests: XCTestCase {
    func testDictionaryPersistsEditsAndEmptyDictionaryWithoutReseeding() throws {
        let suite = "DictationDictionaryTests-\(UUID().uuidString)"
        let defaults = try XCTUnwrap(UserDefaults(suiteName: suite))
        defer { defaults.removePersistentDomain(forName: suite) }
        let seed = DictationDictionary.load(defaults: defaults)
        XCTAssertEqual(seed.map(\.spelling), ["Klebber", "Shubie's"])
        XCTAssertEqual(seed.last?.context, "Shubie's Market in Marblehead")
        DictationDictionary.save([
            DictationDictionaryEntry(spelling: " Klebber ", context: " name "),
            DictationDictionaryEntry(spelling: "klebber"),
            DictationDictionaryEntry(spelling: " "),
            DictationDictionaryEntry(spelling: "Shubie's")
        ], defaults: defaults)
        let saved = DictationDictionary.load(defaults: defaults)
        XCTAssertEqual(saved.map(\.spelling), ["Klebber", "Shubie's"])
        XCTAssertEqual(saved.first?.context, "name")
        DictationDictionary.save([], defaults: defaults)
        XCTAssertEqual(DictationDictionary.load(defaults: defaults), [])
    }

    func testLiveSetupSendsSpellingsAndOmitsEmptyVocabulary() throws {
        let message = GeminiLiveClient.setupMessage(vocabulary: ["Klebber", "Shubie's"])
        let setup = try XCTUnwrap(message["setup"] as? [String: Any])
        let config = try XCTUnwrap(setup["inputAudioTranscription"] as? [String: Any])
        XCTAssertEqual(config["customVocabulary"] as? [String], ["Klebber", "Shubie's"])
        let empty = GeminiLiveClient.setupMessage(vocabulary: [])
        let emptySetup = try XCTUnwrap(empty["setup"] as? [String: Any])
        XCTAssertNil((emptySetup["inputAudioTranscription"] as? [String: Any])?["customVocabulary"])
    }

    func testTranscriptionAndProcessingUseContextWithoutAddingAnotherCall() {
        let entries = DictationDictionary.initialEntries
        let transcription = GeminiClient.transcriptionPrompt(entries: entries)
        let processing = GeminiClient.processingPrompt(masterPrompt: "Clean transcript.", transcript: "Visit the market.", entries: entries)
        for prompt in [transcription, processing] {
            XCTAssertTrue(prompt.contains("Klebber"))
            XCTAssertTrue(prompt.contains("Shubie's Market in Marblehead"))
            XCTAssertTrue(prompt.contains("Do not add vocabulary words that were not spoken"))
        }
        XCTAssertTrue(processing.hasSuffix("--- Transcribed audio ---\nVisit the market."))
        XCTAssertFalse(GeminiClient.transcriptionPrompt(entries: []).contains("Personal vocabulary"))
        XCTAssertEqual(GeminiClient.processingPrompt(masterPrompt: "Clean.", transcript: "Text", entries: []),
                       "Clean.\n\n--- Transcribed audio ---\nText")
    }
}
