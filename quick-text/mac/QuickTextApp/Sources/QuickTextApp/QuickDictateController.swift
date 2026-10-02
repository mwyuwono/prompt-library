import AppKit
import AVFoundation
import Combine
import SwiftUI

enum QuickDictateError: LocalizedError, Equatable {
    case nothingRecorded
    case transcriptionFailed(String)

    var errorDescription: String? {
        switch self {
        case .nothingRecorded: return "Didn't catch anything — try again."
        case .transcriptionFailed(let message): return message
        }
    }
}

/// Where a finished Quick Dictate take goes.
enum QuickDictateOutput: String, CaseIterable, Identifiable {
    case insert
    case copy
    case openInDictate

    var id: String { rawValue }

    var title: String {
        switch self {
        case .insert: return "Insert at cursor"
        case .copy: return "Copy to clipboard"
        case .openInDictate: return "Open in Dictate"
        }
    }
}

/// Quick Dictate preferences (UserDefaults; never in the corpus).
enum QuickDictateSettings {
    static let enabledKey = "quicktext.quickDictate.enabled"
    static let useFnKeyKey = "quicktext.quickDictate.useFnKey"
    static let outputKey = "quicktext.quickDictate.output"
    static let processIDKey = "quicktext.quickDictate.processID"

    /// Built-in light-cleanup prompt. Falls back to `cleanTranscriptPrompt`
    /// when the corpus doesn't carry it yet.
    static let cleanTranscriptID = "voice-process-clean-transcript"
    /// Empty process ID = Raw: insert the transcript as spoken.
    static let rawProcessID = ""
    static let cleanTranscriptPrompt = """
    Clean up this dictated text for direct insertion where the speaker's cursor is. \
    Remove filler words, false starts, and repeated words. Fix punctuation, capitalization, \
    and obvious transcription errors. Apply spoken self-corrections ("actually, make that Tuesday"). \
    Keep the speaker's exact wording, tone, and meaning otherwise; do not summarize, rephrase, \
    or add anything. Output only the cleaned text, with no preamble, quotes, or markdown.
    """

    static var enabled: Bool {
        get { UserDefaults.standard.object(forKey: enabledKey) as? Bool ?? true }
        set { UserDefaults.standard.set(newValue, forKey: enabledKey) }
    }

    static var useFnKey: Bool {
        get { UserDefaults.standard.object(forKey: useFnKeyKey) as? Bool ?? true }
        set { UserDefaults.standard.set(newValue, forKey: useFnKeyKey) }
    }

    static var output: QuickDictateOutput {
        get { UserDefaults.standard.string(forKey: outputKey).flatMap(QuickDictateOutput.init(rawValue:)) ?? .insert }
        set { UserDefaults.standard.set(newValue.rawValue, forKey: outputKey) }
    }

    static var processID: String {
        get { UserDefaults.standard.string(forKey: processIDKey) ?? cleanTranscriptID }
        set { UserDefaults.standard.set(newValue, forKey: processIDKey) }
    }
}

/// System-wide dictation: Fn/Globe (or Opt-Shift-D) → floating pill →
/// transcribe → optional cleanup → insert at the cursor / clipboard / Dictate.
/// Owns its own `DictateSession` so it never disturbs takes on the Dictate page.
@MainActor
final class QuickDictateController: ObservableObject {
    enum Phase: Equatable {
        case idle
        case listening(handsFree: Bool)
        case transcribing
        case processing
        case done(TextInserter.Outcome)
        case failed(String)

        var isActive: Bool {
            switch self {
            case .listening, .transcribing, .processing: return true
            case .idle, .done, .failed: return false
            }
        }
    }

    struct ProcessOption: Identifiable, Equatable {
        let id: String
        let title: String
    }

    @Published private(set) var phase: Phase = .idle
    @Published private(set) var levels: [Float] = []
    @Published private(set) var elapsed: TimeInterval = 0
    @Published private(set) var liveText = ""
    @Published private(set) var lastText: String?
    @Published var processID = QuickDictateSettings.processID {
        didSet { QuickDictateSettings.processID = processID }
    }

    let session = DictateSession()
    /// Resolved lazily: the corpus store and the Dictate page's session are
    /// created by the SwiftUI scene, after this controller.
    var storeProvider: () -> CorpusStore? = { nil }
    var mainSessionProvider: () -> DictateSession? = { nil }
    var openDictate: () -> Void = {}

    private var recognizer = TriggerGestureRecognizer()
    private let fnMonitor = FnKeyMonitor()
    private var panel: QuickDictatePanel?
    private var target: TextInserter.Target?
    private var runID = UUID()
    private var lastTake: DictateTake?
    private var hideTask: Task<Void, Never>?
    private var cancellables: Set<AnyCancellable> = []

    init() {
        fnMonitor.onTriggerDown = { [weak self] in self?.triggerDown() }
        fnMonitor.onTriggerUp = { [weak self] in self?.triggerUp() }
        fnMonitor.onOtherKeyDown = { [weak self] isEscape in self?.otherKeyDown(isEscape: isEscape) }
        observeSession()
    }

    // MARK: - Trigger wiring

    var isFnKeyActive: Bool { fnMonitor.isRunning }

    /// (Re)applies the Fn setting. Safe to call repeatedly, e.g. after the
    /// user grants Input Monitoring.
    @discardableResult
    func refreshFnMonitor() -> Bool {
        guard QuickDictateSettings.enabled, QuickDictateSettings.useFnKey else {
            fnMonitor.stop()
            return false
        }
        return fnMonitor.start()
    }

    func triggerDown() {
        guard QuickDictateSettings.enabled else { return }
        handle(recognizer.triggerDown(at: ProcessInfo.processInfo.systemUptime))
    }

    func triggerUp() {
        handle(recognizer.triggerUp(at: ProcessInfo.processInfo.systemUptime))
    }

    func otherKeyDown(isEscape: Bool) {
        if isEscape, case .transcribing = phase { cancel(); return }
        if isEscape, case .processing = phase { cancel(); return }
        handle(recognizer.otherKeyDown(isEscape: isEscape))
    }

    private func handle(_ output: TriggerGestureRecognizer.Output?) {
        switch output {
        case .begin: begin(handsFree: false)
        case .enterHandsFree:
            if case .listening = phase { phase = .listening(handsFree: true) }
        case .finish: finish()
        case .cancel: cancel()
        case nil: break
        }
    }

    // MARK: - Actions (also used by the pill and the menu bar)

    /// Menu bar entry point: starts hands-free, or finishes a running take.
    func toggleHandsFree() {
        if case .listening = phase {
            finish()
        } else {
            begin(handsFree: true)
        }
    }

    func begin(handsFree: Bool) {
        guard !phase.isActive else { return }
        hideTask?.cancel()
        runID = UUID()
        target = TextInserter.captureTarget()
        session.newSession()
        levels = []
        elapsed = 0
        liveText = ""
        lastTake = nil
        phase = .listening(handsFree: handsFree)
        if handsFree { recognizer.adoptHandsFree() }
        showPanel()
        session.startRecording()
    }

    func finish() {
        guard case .listening = phase else { return }
        recognizer.reset()
        phase = .transcribing
        let run = runID
        Task { await complete(run: run) }
    }

    func cancel() {
        recognizer.reset()
        runID = UUID()
        session.newSession()
        phase = .idle
        hidePanel()
    }

    func dismiss() {
        guard !phase.isActive else { return }
        phase = .idle
        hidePanel()
    }

    func copyLast() {
        guard let lastText else { return }
        TextInserter.copy(lastText)
    }

    /// Hands the take and its result to the Dictate page and opens it.
    func openInDictate() {
        guard let take = lastTake, let main = mainSessionProvider() else { return }
        main.adoptQuickTake(take, result: lastText)
        lastTake = nil
        phase = .idle
        hidePanel()
        openDictate()
    }

    // MARK: - Pipeline

    private func complete(run: UUID) async {
        do {
            let transcript = try await session.finishQuickTranscript()
            guard run == runID else { return }
            guard !transcript.isEmpty else { throw QuickDictateError.nothingRecorded }
            lastTake = session.takes.last
            lastText = transcript

            var text = transcript
            var note: String?
            if let prompt = resolvedPrompt() {
                phase = .processing
                do {
                    text = try await session.processQuickTranscript(transcript, masterPrompt: prompt)
                    guard run == runID else { return }
                } catch {
                    guard run == runID else { return }
                    note = "Cleanup failed — used the raw transcript."
                }
            }
            lastText = text

            let output = QuickDictateSettings.output
            if output == .openInDictate {
                openInDictate()
                return
            }
            var outcome = await TextInserter.deliver(text, to: target ?? TextInserter.captureTarget(), insert: output == .insert)
            guard run == runID else { return }
            if let note, case .copied = outcome { outcome = .copied(reason: note) }
            phase = .done(outcome)
            scheduleHide(after: note == nil ? .seconds(2.5) : .seconds(5))
        } catch {
            guard run == runID else { return }
            session.newSession()
            phase = .failed(error.localizedDescription)
            scheduleHide(after: .seconds(6))
        }
    }

    /// The selected prompt's text, or nil for Raw.
    func resolvedPrompt() -> String? {
        guard processID != QuickDictateSettings.rawProcessID else { return nil }
        if let phrase = storeProvider()?.corpus.phrases.first(where: { $0.id == processID }) {
            return phrase.value
        }
        return processID == QuickDictateSettings.cleanTranscriptID ? QuickDictateSettings.cleanTranscriptPrompt : nil
    }

    /// Raw, Clean Transcript, then every other `voice-process` prompt.
    var processOptions: [ProcessOption] {
        var options = [
            ProcessOption(id: QuickDictateSettings.rawProcessID, title: "Raw transcript"),
            ProcessOption(id: QuickDictateSettings.cleanTranscriptID, title: "Clean Transcript")
        ]
        let prompts = (storeProvider()?.corpus.phrases ?? [])
            .filter { $0.categoryId == "voice-process" && $0.id != QuickDictateSettings.cleanTranscriptID }
            .sorted { $0.title.localizedCaseInsensitiveCompare($1.title) == .orderedAscending }
        options += prompts.map { ProcessOption(id: $0.id, title: $0.title) }
        return options
    }

    var processTitle: String {
        processOptions.first { $0.id == processID }?.title ?? "Clean Transcript"
    }

    // MARK: - Session observation

    private func observeSession() {
        session.$recordingLevel
            .sink { [weak self] level in
                guard let self, case .listening = self.phase else { return }
                self.levels.append(level)
                if self.levels.count > 28 { self.levels.removeFirst(self.levels.count - 28) }
            }
            .store(in: &cancellables)
        session.$recordingElapsed
            .sink { [weak self] in self?.elapsed = $0 }
            .store(in: &cancellables)
        session.$takes
            .sink { [weak self] takes in
                guard let self, case .listening = self.phase else { return }
                self.liveText = takes.last?.transcript ?? ""
            }
            .store(in: &cancellables)
        // Capture failures (mic denied, missing key) surface before any take exists.
        session.$errorMessage
            .compactMap { $0 }
            .sink { [weak self] message in
                guard let self, case .listening = self.phase, self.session.takes.isEmpty else { return }
                self.recognizer.reset()
                self.phase = .failed(message)
                self.scheduleHide(after: .seconds(6))
            }
            .store(in: &cancellables)
    }

    // MARK: - Panel

    private func showPanel() {
        if panel == nil {
            panel = QuickDictatePanel(controller: self)
        }
        panel?.present()
    }

    private func hidePanel() {
        hideTask?.cancel()
        panel?.dismiss()
    }

    private func scheduleHide(after delay: Duration) {
        hideTask?.cancel()
        hideTask = Task { [weak self] in
            try? await Task.sleep(for: delay)
            guard !Task.isCancelled, let self, !self.phase.isActive else { return }
            self.phase = .idle
            self.panel?.dismiss()
        }
    }

    /// Hovering the pill keeps a finished result on screen.
    func holdOpen(_ hovering: Bool) {
        if hovering {
            hideTask?.cancel()
        } else if !phase.isActive, phase != .idle {
            scheduleHide(after: .seconds(2))
        }
    }
}
