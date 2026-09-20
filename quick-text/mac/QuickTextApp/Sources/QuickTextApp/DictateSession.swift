import AVFoundation
import SwiftUI

/// One recording turn inside a Dictate session. Audio lives only until its
/// transcript arrives; a failed take keeps its file so it can be retried.
struct DictateTake: Identifiable {
    enum Status: Equatable {
        case recording
        case transcribing
        case ready
        case failed(String)
    }

    let id = UUID()
    var audioURL: URL?
    var transcript: String?
    var tokenUsage: TokenUsage?
    var duration: TimeInterval? = nil
    var status: Status
}

/// Multi-take dictate session: record turns, transcribe each immediately,
/// synthesize once via the selected `voice-process` master prompt. Runs on
/// the main actor; network closures are injectable for tests.
@MainActor
final class DictateSession: NSObject, ObservableObject, AVAudioPlayerDelegate {
    nonisolated static let defaultProcessID = "voice-process-agent-instructions"
    /// AVAudioRecorder writes MPEG-4 AAC; the Gemini inline-audio shape takes
    /// it as `audio/mp4`.
    nonisolated static let audioMIMEType = "audio/mp4"

    @Published var takes: [DictateTake] = []
    @Published var isRecording = false
    @Published var recordingElapsed: TimeInterval = 0
    @Published var recordingLevel: Float = 0
    @Published var isWorking = false
    @Published var selectedProcessID = DictateSession.defaultProcessID
    @Published var resultText = ""
    /// Kept as a compatibility/UI convenience for the last model turn.
    @Published var synthesisTokenUsage: TokenUsage? = nil
    @Published private(set) var processingTurns: [DictateProcessingTurn] = []
    @Published var errorMessage: String?

    var transcriptionTokenUsage: TokenUsage {
        takes.compactMap(\.tokenUsage).reduce(.zero, +)
    }

    var sessionTokenUsage: TokenUsage {
        transcriptionTokenUsage + processingTokenUsage
    }

    var processingTokenUsage: TokenUsage {
        processingTurns.map(\.usage).reduce(.zero, +)
    }

    var sessionEstimatedCost: Double {
        transcriptionTokenUsage.estimatedCost(pricing: .transcribe) +
        processingTurns.reduce(0) { $0 + $1.estimatedCost }
    }

    var statsStore: DictateStatsStore = .shared
    private var recorder: AVAudioRecorder?
    private var audioPlayer: AVAudioPlayer?
    private var recordingMonitorTask: Task<Void, Never>?
    @Published var playingTakeID: UUID?

    var transcribe: (Data, String) async throws -> GeminiResponse = { data, mimeType in
        let key = try loadKey()
        return try await GeminiClient(apiKey: key).transcribe(audioData: data, mimeType: mimeType)
    }

    var synthesize: (String, String) async throws -> GeminiResponse = { masterPrompt, transcript in
        let key = try loadKey()
        return try await GeminiClient(apiKey: key).process(masterPrompt: masterPrompt, transcript: transcript)
    }

    private static func loadKey() throws -> String {
        do {
            return try GeminiKeychain.load()
        } catch {
            throw DictateError.missingAPIKey
        }
    }

    var readyTranscripts: [String] {
        takes.compactMap { $0.status == .ready ? $0.transcript : nil }
    }

    /// Testable join: numbered takes in record order, blank line separated.
    nonisolated static func joinedTranscript(_ transcripts: [String]) -> String {
        transcripts.enumerated()
            .map { "Take \($0.offset + 1):\n\($0.element)" }
            .joined(separator: "\n\n")
    }

    // MARK: - Recording

    func toggleRecording() {
        isRecording ? stopRecording() : startRecording()
    }

    func startRecording() {
        errorMessage = nil
        AVAudioApplication.requestRecordPermission { [weak self] granted in
            Task { @MainActor in
                guard let self else { return }
                guard granted else {
                    self.errorMessage = "Microphone access was denied. Allow it in System Settings > Privacy & Security > Microphone."
                    return
                }
                do {
                    try self.beginCapture()
                } catch {
                    self.errorMessage = error.localizedDescription
                }
            }
        }
    }

    private func beginCapture() throws {
        let url = FileManager.default.temporaryDirectory
            .appendingPathComponent("dictate-\(UUID().uuidString).m4a")
        let settings: [String: Any] = [
            AVFormatIDKey: kAudioFormatMPEG4AAC,
            AVSampleRateKey: 44_100,
            AVNumberOfChannelsKey: 1,
            AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
        ]
        recorder = try AVAudioRecorder(url: url, settings: settings)
        recorder?.isMeteringEnabled = true
        recorder?.record()
        takes.append(DictateTake(audioURL: url, transcript: nil, status: .recording))
        isRecording = true
        recordingElapsed = 0
        recordingLevel = 0
        startRecordingMonitor()
    }

    func stopRecording() {
        let duration = recorder?.currentTime
        recorder?.stop()
        recorder = nil
        isRecording = false
        stopRecordingMonitor()
        guard let index = takes.lastIndex(where: { $0.status == .recording }) else { return }
        takes[index].duration = duration
        takes[index].status = .transcribing
        transcribeTake(at: index)
    }

    private func startRecordingMonitor() {
        recordingMonitorTask?.cancel()
        recordingMonitorTask = Task { [weak self] in
            while !Task.isCancelled {
                try? await Task.sleep(nanoseconds: 100_000_000)
                guard let self else { return }
                self.updateRecordingMeter()
            }
        }
    }

    private func stopRecordingMonitor() {
        recordingMonitorTask?.cancel()
        recordingMonitorTask = nil
        recordingLevel = 0
    }

    private func updateRecordingMeter() {
        guard let recorder, recorder.isRecording else { return }
        recorder.updateMeters()
        recordingElapsed = recorder.currentTime
        // AVAudioRecorder reports power in dBFS, usually from -160 to 0.
        // Convert it to a quiet, visually useful 0...1 level.
        let power = max(-60, recorder.averagePower(forChannel: 0))
        recordingLevel = min(1, max(0, (power + 60) / 60))
    }

    // MARK: - Transcription

    func retryTake(_ take: DictateTake) {
        guard let index = takes.firstIndex(where: { $0.id == take.id }),
              takes[index].audioURL != nil else { return }
        errorMessage = nil
        takes[index].status = .transcribing
        transcribeTake(at: index)
    }

    func rerecordTake(_ take: DictateTake) {
        guard !isRecording, !isWorking else { return }
        deleteTake(take)
        startRecording()
    }

    private func transcribeTake(at index: Int) {
        guard let audioURL = takes[index].audioURL,
              let data = try? Data(contentsOf: audioURL) else {
            takes[index].status = .failed("Recording file is missing.")
            return
        }
        let id = takes[index].id
        Task {
            do {
                let response = try await transcribe(data, Self.audioMIMEType)
                guard let i = takes.firstIndex(where: { $0.id == id }) else { return }
                takes[i].transcript = response.text
                takes[i].tokenUsage = response.usage
                takes[i].status = .ready
                statsStore.recordUsage(response.usage, pricing: .transcribe)
                // Audio is discarded once its transcript exists.
                try? FileManager.default.removeItem(at: audioURL)
                takes[i].audioURL = nil
            } catch {
                guard let i = takes.firstIndex(where: { $0.id == id }) else { return }
                takes[i].status = .failed(error.localizedDescription)
            }
        }
    }

    func deleteTake(_ take: DictateTake) {
        if playingTakeID == take.id {
            stopPlayback()
        }
        if let url = take.audioURL {
            try? FileManager.default.removeItem(at: url)
        }
        takes.removeAll { $0.id == take.id }
    }

    // MARK: - Playback

    func togglePlayback(_ take: DictateTake) {
        guard let url = take.audioURL else { return }
        if playingTakeID == take.id {
            stopPlayback()
            return
        }
        do {
            audioPlayer?.stop()
            audioPlayer = try AVAudioPlayer(contentsOf: url)
            audioPlayer?.delegate = self
            audioPlayer?.prepareToPlay()
            audioPlayer?.play()
            playingTakeID = take.id
        } catch {
            errorMessage = "Could not play this take: (error.localizedDescription)"
        }
    }

    func stopPlayback() {
        audioPlayer?.stop()
        audioPlayer = nil
        playingTakeID = nil
    }

    func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
        playingTakeID = nil
        audioPlayer = nil
    }

    func updateTranscript(for id: UUID, text: String) {
        guard let index = takes.firstIndex(where: { $0.id == id }) else { return }
        takes[index].transcript = text
    }

    func copyTake(_ take: DictateTake) {
        guard let text = take.transcript, !text.isEmpty else { return }
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(text, forType: .string)
    }

    // MARK: - Processing

    /// Rebuilds the result from the recorded take transcripts. This intentionally
    /// replaces the editor text, so manual edits are never silently discarded by
    /// the refinement action below.
    func reprocessTakes(masterPrompt: String) {
        let transcripts = readyTranscripts
        guard !transcripts.isEmpty else {
            errorMessage = "Nothing to process yet — record at least one take."
            return
        }
        runProcessing(kind: .reprocessTakes, masterPrompt: masterPrompt, input: Self.joinedTranscript(transcripts))
    }

    /// Processes the user-editable result instead of the takes. This is the safe
    /// follow-up path: recordings remain untouched and the edited text is the
    /// exact input to Gemini.
    func refineCurrentResult(masterPrompt: String) {
        let currentResult = resultText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !currentResult.isEmpty else {
            errorMessage = "Nothing to refine yet — write or process a result first."
            return
        }
        runProcessing(kind: .refineResult, masterPrompt: masterPrompt, input: currentResult)
    }

    /// Legacy call site compatibility. New UI should choose an explicit action.
    func process(masterPrompt: String) { reprocessTakes(masterPrompt: masterPrompt) }

    private func runProcessing(kind: DictateProcessingTurn.Kind, masterPrompt: String, input: String) {
        errorMessage = nil
        isWorking = true
        Task {
            do {
                let response = try await synthesize(masterPrompt, input)
                resultText = response.text
                synthesisTokenUsage = response.usage
                let turn = DictateProcessingTurn(
                    kind: kind,
                    usage: response.usage,
                    estimatedCost: response.usage.estimatedCost(pricing: .flash)
                )
                processingTurns.append(turn)
                statsStore.recordUsage(response.usage, pricing: .flash)
                let transcripts = readyTranscripts
                _ = try? TranscriptStore.saveSession(
                    takes: transcripts,
                    result: response.text,
                    tokenUsage: sessionTokenUsage,
                    transcriptionUsage: transcriptionTokenUsage,
                    synthesisUsage: response.usage,
                    takeUsages: takes.compactMap(\.tokenUsage),
                    processingTurns: processingTurns,
                    estimatedCost: sessionEstimatedCost
                )
                _ = try? TranscriptStore.prune()
            } catch {
                errorMessage = error.localizedDescription
            }
            isWorking = false
        }
    }

    func copyResult() {
        guard !resultText.isEmpty else { return }
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(resultText, forType: .string)
    }

    func newSession() {
        stopPlayback()
        stopRecordingMonitor()
        for take in takes {
            if let url = take.audioURL {
                try? FileManager.default.removeItem(at: url)
            }
        }
        takes = []
        resultText = ""
        recordingElapsed = 0
        recordingLevel = 0
        synthesisTokenUsage = nil
        processingTurns = []
        errorMessage = nil
    }
}
