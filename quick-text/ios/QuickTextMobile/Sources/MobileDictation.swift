import AVFoundation
import SwiftUI
import Combine
import Foundation

struct MobileTake: Codable, Identifiable {
    var id = UUID()
    var createdAt = Date()
    var transcript = ""
    var audioName: String?
    var failure: String?
}

struct MobileDictationState: Codable {
    var takes: [MobileTake] = []
    var result = ""
    var calls = 0
    var usage = TokenUsage.zero
    var unreportedCalls = 0
}

@MainActor final class MobileDictation: NSObject, ObservableObject, AVAudioRecorderDelegate {
    @Published private(set) var state = MobileDictationState()
    @Published private(set) var recording = false
    @Published private(set) var busy = false
    @Published private(set) var level: Float = 0
    @Published var error: String?
    private var recorder: AVAudioRecorder?
    private var timer: Timer?
    private var activeID: UUID?
    private var foreground = true
    private let folder: URL
    private var canPersist = true
    private var operation: Task<Void, Never>?

    override init() {
        folder = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0].appendingPathComponent("Dictate", isDirectory: true)
        super.init()
        do {
            try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
            let saved = folder.appendingPathComponent("session.json")
            if FileManager.default.fileExists(atPath: saved.path) {
                state = try JSONDecoder.quickText.decode(MobileDictationState.self, from: Data(contentsOf: saved))
                state.takes.removeAll { Date().timeIntervalSince($0.createdAt) > 15 * 24 * 3600 }
                for i in state.takes.indices where state.takes[i].audioName != nil && state.takes[i].failure == nil {
                    state.takes[i].failure = "Recording or transcription was interrupted. Retry when ready."
                }
                persist()
            }
            let active = Set(state.takes.compactMap(\.audioName))
            for file in try FileManager.default.contentsOfDirectory(at: folder, includingPropertiesForKeys: nil)
                where file.pathExtension == "m4a" && !active.contains(file.lastPathComponent) {
                try? FileManager.default.removeItem(at: file)
            }
        } catch { canPersist = false; self.error = "Saved dictation could not be opened. Its files have been preserved. \(error.localizedDescription)" }
    }

    func start() {
        guard !recording, !busy, canPersist else { return }
        do { _ = try GeminiKeychain.load() } catch { self.error = error.localizedDescription; return }
        busy = true
        operation = Task {
            let granted = await AVAudioApplication.requestRecordPermission()
            guard foreground else { busy = false; return }
            guard granted else { busy = false; error = "Microphone access is off. Enable it in Settings > Privacy & Security > Microphone."; return }
            do {
                let session = AVAudioSession.sharedInstance()
                try session.setCategory(.record, mode: .default)
                try session.setActive(true)
                let name = "\(UUID().uuidString).m4a"
                let next = try AVAudioRecorder(url: folder.appendingPathComponent(name), settings: [
                    AVFormatIDKey: kAudioFormatMPEG4AAC,
                    AVSampleRateKey: 44100,
                    AVNumberOfChannelsKey: 1,
                    AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
                ])
                next.delegate = self
                next.isMeteringEnabled = true
                guard next.record() else { throw MobileError.message("Recording could not start.") }
                let take = MobileTake(audioName: name)
                state.takes.append(take)
                activeID = take.id
                recorder = next
                recording = true
                persist()
                let owner = self
                timer = Timer.scheduledTimer(withTimeInterval: 0.15, repeats: true) { [weak owner] _ in
                    Task { @MainActor in
                        guard let self = owner, let recorder = self.recorder else { return }
                        recorder.updateMeters()
                        self.level = max(0, min(1, (recorder.averagePower(forChannel: 0) + 60) / 60))
                        if recorder.currentTime >= 180 { self.stop() }
                    }
                }
            } catch { self.error = error.localizedDescription; try? AVAudioSession.sharedInstance().setActive(false) }
            busy = false
        }
    }

    func setForeground(_ active: Bool) {
        foreground = active
        if !active { stop(transcribe: false) }
    }

    func stop(transcribe: Bool = true) {
        guard recording, let id = activeID else { return }
        let duration = recorder?.currentTime ?? 0
        recorder?.stop()
        recorder = nil
        timer?.invalidate(); timer = nil
        recording = false; level = 0; activeID = nil
        try? AVAudioSession.sharedInstance().setActive(false)
        if duration < 0.4 {
            remove(id)
        } else if transcribe {
            retry(id)
        } else {
            if let index = state.takes.firstIndex(where: { $0.id == id }) {
                state.takes[index].failure = "Recording saved. Return to Dictate and tap Retry to transcribe."
                persist()
            }
        }
    }

    func retry(_ id: UUID) {
        guard !busy, !recording, canPersist,
              let take = state.takes.first(where: { $0.id == id }), let name = take.audioName else { return }
        let key: String
        do { key = try GeminiKeychain.load() } catch { self.error = error.localizedDescription; return }
        busy = true
        operation = Task {
            do {
                let audio = try Data(contentsOf: folder.appendingPathComponent(name))
                guard audio.count <= 20_000_000 else { throw MobileError.message("Recording is too large. Record a shorter take.") }
                state.calls += 1; state.unreportedCalls += 1; persist()
                let response = try await GeminiClient(apiKey: key).transcribe(audioData: audio, mimeType: "audio/mp4")
                account(response)
                if let index = state.takes.firstIndex(where: { $0.id == id }) {
                    state.takes[index].transcript = response.text
                    state.takes[index].failure = nil
                    state.takes[index].audioName = nil
                    persist()
                    try? FileManager.default.removeItem(at: folder.appendingPathComponent(name))
                }
            } catch {
                // Requests without a response remain marked as unreported.
                if let index = state.takes.firstIndex(where: { $0.id == id }) { state.takes[index].failure = error.localizedDescription }
                self.error = error.localizedDescription
                persist()
            }
            busy = false
        }
    }

    func process(prompt: String) {
        guard !busy, !recording, canPersist else { return }
        let transcript = combined
        guard !transcript.isEmpty else { return }
        let key: String
        do { key = try GeminiKeychain.load() } catch { self.error = error.localizedDescription; return }
        busy = true
        operation = Task {
            state.calls += 1; state.unreportedCalls += 1; persist()
            do {
                let response = try await GeminiClient(apiKey: key).process(masterPrompt: prompt, transcript: transcript)
                account(response)
                state.result = response.text
            } catch { self.error = error.localizedDescription }
            persist(); busy = false
        }
    }

    var combined: String { state.takes.filter { $0.failure == nil }.map(\.transcript).filter { !$0.isEmpty }.joined(separator: "\n\n") }
    func combine() { guard !busy, !recording else { return }; state.result = combined; persist() }
    func setResult(_ text: String) { state.result = text; persist() }
    func updateTranscript(_ id: UUID, text: String) {
        guard !busy, !recording, let index = state.takes.firstIndex(where: { $0.id == id }) else { return }
        state.takes[index].transcript = text; persist()
    }
    func move(from: IndexSet, to: Int) { guard !busy, !recording else { return }; state.takes.move(fromOffsets: from, toOffset: to); persist() }
    func remove(_ id: UUID) {
        guard !busy, !recording else { return }
        if let name = state.takes.first(where: { $0.id == id })?.audioName { try? FileManager.default.removeItem(at: folder.appendingPathComponent(name)) }
        state.takes.removeAll { $0.id == id }; persist()
    }
    func clear() {
        guard !busy, !recording else { return }
        for take in state.takes { if let name = take.audioName { try? FileManager.default.removeItem(at: folder.appendingPathComponent(name)) } }
        state.takes = []; state.result = ""; persist()
    }
    private func account(_ response: GeminiResponse) {
        state.usage += response.usage
        if response.usageReported { state.unreportedCalls = max(0, state.unreportedCalls - 1) }
    }
    private func persist() {
        guard canPersist else { return }
        do { try JSONEncoder.quickText.encode(state).write(to: folder.appendingPathComponent("session.json"), options: [.atomic, .completeFileProtection]) }
        catch { self.error = "Dictation could not be saved. \(error.localizedDescription)" }
    }
    nonisolated func audioRecorderEncodeErrorDidOccur(_ recorder: AVAudioRecorder, error: Error?) {
        Task { @MainActor in self.stop(transcribe: false); self.error = error?.localizedDescription ?? "Recording was interrupted." }
    }
}
