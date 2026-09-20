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
    var status: Status
}

/// Multi-take dictate session: record turns, transcribe each immediately,
/// synthesize once via the selected `voice-process` master prompt. Runs on
/// the main actor; network closures are injectable for tests.
@MainActor
final class DictateSession: ObservableObject {
    nonisolated static let defaultProcessID = "voice-process-agent-instructions"
    /// AVAudioRecorder writes MPEG-4 AAC; the Gemini inline-audio shape takes
    /// it as `audio/mp4`.
    nonisolated static let audioMIMEType = "audio/mp4"

    @Published var takes: [DictateTake] = []
    @Published var isRecording = false
    @Published var isWorking = false
    @Published var selectedProcessID = DictateSession.defaultProcessID
    @Published var resultText = ""
    @Published var errorMessage: String?

    private var recorder: AVAudioRecorder?

    var transcribe: (Data, String) async throws -> String = { data, mimeType in
        let key = try loadKey()
        return try await GeminiClient(apiKey: key).transcribe(audioData: data, mimeType: mimeType)
    }

    var synthesize: (String, String) async throws -> String = { masterPrompt, transcript in
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
        recorder?.record()
        takes.append(DictateTake(audioURL: url, transcript: nil, status: .recording))
        isRecording = true
    }

    func stopRecording() {
        recorder?.stop()
        recorder = nil
        isRecording = false
        guard let index = takes.lastIndex(where: { $0.status == .recording }) else { return }
        takes[index].status = .transcribing
        transcribeTake(at: index)
    }

    // MARK: - Transcription

    func retryTake(_ take: DictateTake) {
        guard let index = takes.firstIndex(where: { $0.id == take.id }),
              takes[index].audioURL != nil else { return }
        errorMessage = nil
        takes[index].status = .transcribing
        transcribeTake(at: index)
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
                let text = try await transcribe(data, Self.audioMIMEType)
                guard let i = takes.firstIndex(where: { $0.id == id }) else { return }
                takes[i].transcript = text
                takes[i].status = .ready
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
        if let url = take.audioURL {
            try? FileManager.default.removeItem(at: url)
        }
        takes.removeAll { $0.id == take.id }
    }

    // MARK: - Processing

    func process(masterPrompt: String) {
        let transcripts = readyTranscripts
        guard !transcripts.isEmpty else {
            errorMessage = "Nothing to process yet — record at least one take."
            return
        }
        errorMessage = nil
        isWorking = true
        Task {
            do {
                let joined = Self.joinedTranscript(transcripts)
                let output = try await synthesize(masterPrompt, joined)
                resultText = output
                _ = try? TranscriptStore.saveSession(takes: transcripts, result: output)
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
        for take in takes {
            if let url = take.audioURL {
                try? FileManager.default.removeItem(at: url)
            }
        }
        takes = []
        resultText = ""
        errorMessage = nil
    }
}
