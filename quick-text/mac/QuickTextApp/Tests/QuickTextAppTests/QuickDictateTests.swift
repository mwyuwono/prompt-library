import XCTest
import AppKit
@testable import QuickTextApp

/// Quick Dictate seams that run without the mic, event taps, or the network:
/// the hold/tap recognizer, clipboard borrow/restore, and the session's
/// quick-take finish / process / handoff.
final class QuickDictateTests: XCTestCase {

    // MARK: - Trigger recognizer

    func testHoldPastThresholdFinishesOnRelease() {
        var recognizer = TriggerGestureRecognizer()
        XCTAssertEqual(recognizer.triggerDown(at: 10), .begin)
        XCTAssertEqual(recognizer.triggerUp(at: 11), .finish)
        XCTAssertEqual(recognizer.phase, .idle)
    }

    func testQuickTapEntersHandsFreeAndNextTapFinishes() {
        var recognizer = TriggerGestureRecognizer()
        XCTAssertEqual(recognizer.triggerDown(at: 10), .begin)
        XCTAssertEqual(recognizer.triggerUp(at: 10.1), .enterHandsFree)
        XCTAssertEqual(recognizer.triggerDown(at: 15), nil)
        XCTAssertEqual(recognizer.triggerUp(at: 15.05), .finish)
        XCTAssertEqual(recognizer.phase, .idle)
    }

    func testOtherKeyWhileHeldCancelsAsModifierUse() {
        var recognizer = TriggerGestureRecognizer()
        _ = recognizer.triggerDown(at: 10)
        XCTAssertEqual(recognizer.otherKeyDown(isEscape: false), .cancel)
        // The release that follows is ignored.
        XCTAssertNil(recognizer.triggerUp(at: 12))
    }

    func testHandsFreeIgnoresTypingButEscapeCancels() {
        var recognizer = TriggerGestureRecognizer()
        _ = recognizer.triggerDown(at: 10)
        _ = recognizer.triggerUp(at: 10.1)
        XCTAssertNil(recognizer.otherKeyDown(isEscape: false))
        XCTAssertEqual(recognizer.otherKeyDown(isEscape: true), .cancel)
        XCTAssertEqual(recognizer.phase, .idle)
    }

    func testFnModifierDuringHandsFreeKeepsRecording() {
        var recognizer = TriggerGestureRecognizer()
        _ = recognizer.triggerDown(at: 10)
        _ = recognizer.triggerUp(at: 10.1)
        _ = recognizer.triggerDown(at: 12)
        XCTAssertNil(recognizer.otherKeyDown(isEscape: false))
        XCTAssertEqual(recognizer.phase, .handsFree)
        XCTAssertNil(recognizer.triggerUp(at: 12.2))
    }

    func testAdoptHandsFreeLetsNextTapFinishMenuStartedTake() {
        var recognizer = TriggerGestureRecognizer()
        recognizer.adoptHandsFree()
        XCTAssertNil(recognizer.triggerDown(at: 5))
        XCTAssertEqual(recognizer.triggerUp(at: 5.1), .finish)
    }

    func testOnlyFnFlaggedKeysCountAsModifierUse() {
        // Real Fn+arrow carries the Fn flag.
        XCTAssertEqual(FnKeyMonitor.classifyKeyDown(keyCode: 124, flags: .maskSecondaryFn), false)
        // Another app's synthesized Cmd-C (no Fn flag) is ignored.
        XCTAssertNil(FnKeyMonitor.classifyKeyDown(keyCode: 8, flags: .maskCommand))
        // Esc always counts.
        XCTAssertEqual(FnKeyMonitor.classifyKeyDown(keyCode: FnKeyMonitor.escapeKeyCode, flags: []), true)
    }

    // MARK: - Clipboard borrow/restore

    @MainActor
    func testPasteboardSnapshotRestoresAllTypes() {
        let pasteboard = NSPasteboard(name: .init("quick-dictate-test-\(UUID().uuidString)"))
        defer { pasteboard.releaseGlobally() }
        pasteboard.clearContents()
        let item = NSPasteboardItem()
        item.setString("original", forType: .string)
        item.setString("<b>original</b>", forType: .html)
        pasteboard.writeObjects([item])

        let snapshot = PasteboardSnapshot(pasteboard)
        pasteboard.clearContents()
        pasteboard.setString("dictated", forType: .string)
        TextInserter.restoreIfUnchanged(snapshot, ourChangeCount: pasteboard.changeCount, pasteboard: pasteboard)

        XCTAssertEqual(pasteboard.string(forType: .string), "original")
        XCTAssertEqual(pasteboard.string(forType: .html), "<b>original</b>")
    }

    @MainActor
    func testRestoreSkipsWhenClipboardChangedSincePaste() {
        let pasteboard = NSPasteboard(name: .init("quick-dictate-test-\(UUID().uuidString)"))
        defer { pasteboard.releaseGlobally() }
        pasteboard.clearContents()
        pasteboard.setString("original", forType: .string)
        let snapshot = PasteboardSnapshot(pasteboard)
        pasteboard.clearContents()
        pasteboard.setString("dictated", forType: .string)
        let ourChange = pasteboard.changeCount
        // The user copies something before the restore delay elapses.
        pasteboard.clearContents()
        pasteboard.setString("user copy", forType: .string)

        TextInserter.restoreIfUnchanged(snapshot, ourChangeCount: ourChange, pasteboard: pasteboard)
        XCTAssertEqual(pasteboard.string(forType: .string), "user copy")
    }

    // MARK: - Session quick-take API

    @MainActor
    private func makeSession() -> DictateSession {
        let session = DictateSession()
        session.statsStore = DictateStatsStore(defaults: UserDefaults(suiteName: "quick-dictate-\(UUID().uuidString)")!)
        session.transcribe = { _, _ in
            GeminiResponse(text: "  um so send it tuesday  ", usage: TokenUsage(inputTokens: 100, outputTokens: 10))
        }
        session.synthesize = { prompt, input in
            GeminiResponse(text: "Send it Tuesday.", usage: TokenUsage(inputTokens: 50, outputTokens: 5))
        }
        return session
    }

    @MainActor
    private func recordingTake() throws -> DictateTake {
        let url = FileManager.default.temporaryDirectory.appendingPathComponent("qd-\(UUID().uuidString).m4a")
        try Data("dummy".utf8).write(to: url)
        return DictateTake(audioURL: url, transcript: nil, status: .recording)
    }

    @MainActor
    func testFinishQuickTranscriptWaitsForTrimmedTranscript() async throws {
        let session = makeSession()
        session.takes = [try recordingTake()]
        session.isRecording = true
        let transcript = try await session.finishQuickTranscript()
        XCTAssertEqual(transcript, "um so send it tuesday")
        XCTAssertFalse(session.isRecording)
    }

    @MainActor
    func testFinishQuickTranscriptSurfacesFailure() async throws {
        let session = makeSession()
        session.transcribe = { _, _ in throw DictateError.badResponse("boom") }
        session.takes = [try recordingTake()]
        session.isRecording = true
        do {
            _ = try await session.finishQuickTranscript()
            XCTFail("expected failure")
        } catch let error as QuickDictateError {
            guard case .transcriptionFailed = error else { return XCTFail("wrong error \(error)") }
        }
    }

    @MainActor
    func testFinishQuickTranscriptWithNoTakeThrows() async {
        let session = makeSession()
        do {
            _ = try await session.finishQuickTranscript()
            XCTFail("expected failure")
        } catch {
            XCTAssertEqual(error as? QuickDictateError, .nothingRecorded)
        }
    }

    @MainActor
    func testProcessQuickTranscriptRawSkipsModel() async throws {
        let session = makeSession()
        session.synthesize = { _, _ in XCTFail("raw must not call the model"); return GeminiResponse(text: "", usage: .zero) }
        let text = try await session.processQuickTranscript("as spoken", masterPrompt: nil)
        XCTAssertEqual(text, "as spoken")
        XCTAssertTrue(session.processingTurns.isEmpty)
    }

    @MainActor
    func testProcessQuickTranscriptRunsPromptAndRecordsTurn() async throws {
        let session = makeSession()
        let text = try await session.processQuickTranscript("um so send it tuesday", masterPrompt: "clean")
        XCTAssertEqual(text, "Send it Tuesday.")
        XCTAssertEqual(session.resultText, "Send it Tuesday.")
        XCTAssertEqual(session.processingTurns.count, 1)
    }

    @MainActor
    func testAdoptQuickTakeAppendsAndReplacesResult() {
        let main = makeSession()
        main.takes = [DictateTake(audioURL: nil, transcript: "existing", status: .ready)]
        let quick = DictateTake(audioURL: nil, transcript: "quick", status: .ready)
        main.adoptQuickTake(quick, result: "Quick.")
        XCTAssertEqual(main.takes.map(\.transcript), ["existing", "quick"])
        XCTAssertEqual(main.resultText, "Quick.")

        main.adoptQuickTake(DictateTake(audioURL: nil, transcript: nil, status: .failed("x")), result: nil)
        XCTAssertEqual(main.takes.count, 2)
    }

    // MARK: - Prompt resolution

    @MainActor
    func testResolvedPromptFallsBackToBuiltInCleanAndRaw() {
        let controller = QuickDictateController()
        controller.processID = QuickDictateSettings.cleanTranscriptID
        XCTAssertEqual(controller.resolvedPrompt(), QuickDictateSettings.cleanTranscriptPrompt)
        controller.processID = QuickDictateSettings.rawProcessID
        XCTAssertNil(controller.resolvedPrompt())
        controller.processID = QuickDictateSettings.cleanTranscriptID
    }
}
