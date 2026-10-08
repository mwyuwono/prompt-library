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
    var liveRequestID = UUID()
    var createdAt = Date()
    var restSource: DictateUsageSource = .afterTakeREST
    var usageEvents: [DictateUsageEvent] = []
    var audioURL: URL?
    var transcript: String?
    var tokenUsage: TokenUsage?
    var duration: TimeInterval? = nil
    var status: Status
    /// True when this take's usage was reported by the Real-time Live stream
    /// (`gemini-3.5-transcribe-live`); false for After-take / REST takes
    /// (`gemini-3.8-flash`). Drives the per-model cost split.
    var isLive: Bool = false
}

/// Accumulated result of one live take. Empty text signals REST fallback.
struct LiveTakeOutcome {
    var text = ""
    var usage: TokenUsage = .zero
    var receivedFinal = false
    var errorMessage: String?
    var usageReported = false
    var event: DictateUsageEvent?
}

/// Thread-safe peak holder: the mic tap writes from the audio thread while
/// the meter loop reads on the main actor.
final class LivePeakHolder {
    private let lock = NSLock()
    private var _value: Float = 0

    var value: Float {
        get { lock.withLock { _value } }
        set { lock.withLock { _value = newValue } }
    }
}

/// AVAudioConverter's simple convert(to:from:) cannot resample a microphone
/// buffer. The input-block form supplies one buffer and retains converter state
/// across taps, producing raw 16 kHz mono PCM for Gemini Live.
final class LivePCM16Converter {
    private let converter: AVAudioConverter
    private let outputFormat: AVAudioFormat
    private let inputSampleRate: Double

    init?(from inputFormat: AVAudioFormat) {
        guard let outputFormat = AVAudioFormat(
            commonFormat: .pcmFormatInt16,
            sampleRate: Double(GeminiLiveClient.streamSampleRate),
            channels: 1,
            interleaved: true),
              let converter = AVAudioConverter(from: inputFormat, to: outputFormat) else { return nil }
        self.converter = converter
        self.outputFormat = outputFormat
        self.inputSampleRate = inputFormat.sampleRate
    }

    func convert(_ input: AVAudioPCMBuffer) throws -> Data {
        let estimatedFrames = Double(input.frameLength) * outputFormat.sampleRate / inputSampleRate
        let capacity = AVAudioFrameCount(ceil(estimatedFrames) + 256)
        guard let output = AVAudioPCMBuffer(pcmFormat: outputFormat, frameCapacity: capacity) else {
            throw DictateError.badResponse("live PCM buffer")
        }
        var supplied = false
        var conversionError: NSError?
        let status = converter.convert(to: output, error: &conversionError) { _, status in
            guard !supplied else {
                status.pointee = .noDataNow
                return nil
            }
            supplied = true
            status.pointee = .haveData
            return input
        }
        if let conversionError { throw conversionError }
        if status == .error { throw DictateError.badResponse("live PCM conversion") }
        guard output.frameLength > 0, let samples = output.int16ChannelData?[0] else { return Data() }
        return Data(bytes: samples, count: Int(output.frameLength) * MemoryLayout<Int16>.size)
    }
}

final class LiveCaptureStats {
    private let lock = NSLock()
    private var tapCount = 0
    private var convertedChunks = 0
    private var convertedBytes = 0
    private var conversionErrors = 0
    private var lastConversionError: String?

    func reset() {
        lock.withLock {
            tapCount = 0
            convertedChunks = 0
            convertedBytes = 0
            conversionErrors = 0
            lastConversionError = nil
        }
    }

    func tapped() { lock.withLock { tapCount += 1 } }
    func converted(bytes: Int) {
        lock.withLock {
            convertedChunks += 1
            convertedBytes += bytes
        }
    }
    func failed(_ error: Error) {
        lock.withLock {
            conversionErrors += 1
            lastConversionError = error.localizedDescription
        }
    }
    var summary: String {
        lock.withLock {
            var result = "capture taps \(tapCount), PCM chunks \(convertedChunks), PCM bytes \(convertedBytes), conversion errors \(conversionErrors)"
            if let lastConversionError { result += " (last: \(lastConversionError))" }
            return result
        }
    }
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
    /// Loudest meter reading of the current take (0...1, same scale as
    /// `recordingLevel`). Quick Dictate uses it to drop silent takes before
    /// they reach the model, which otherwise invents speech from silence.
    var peakRecordingLevel: Float = 0
    /// Below this peak a take is treated as silence (~-42 dBFS average
    /// power on the After-take meter): room tone stays under it, speech at
    /// laptop distance clears it comfortably.
    nonisolated static let speechLevelThreshold: Float = 0.3
    /// Shorter takes are accidental taps, not dictation.
    nonisolated static let minimumSpeechDuration: TimeInterval = 0.4
    @Published var isWorking = false
    @Published var selectedProcessID = DictateSession.defaultProcessID
    /// Refreshed from stored settings at each capture start; Live mode shows
    /// interim transcripts and falls back to the file + REST path on failure.
    @Published var transcriptionMode: TranscriptionMode = .stored
    @Published var resultText = ""
    /// Kept as a compatibility/UI convenience for the last model turn.
    @Published var synthesisTokenUsage: TokenUsage? = nil
    @Published private(set) var processingTurns: [DictateProcessingTurn] = []
    @Published var errorMessage: String?
    private(set) var sessionID = UUID()
    @Published private(set) var usageEvents: [DictateUsageEvent] = []
    private var finalizedLiveIDs: Set<UUID> = []

    var transcriptionTokenUsage: TokenUsage {
        takes.compactMap(\.tokenUsage).reduce(.zero, +)
    }

    /// Reported Live usage, including an unsuccessful stream before REST fallback.
    var liveTranscriptionTokenUsage: TokenUsage {
        takes.reduce(.zero) { total, take in
            if take.usageEvents.isEmpty { return total + (take.isLive ? take.tokenUsage ?? .zero : .zero) }
            return total + take.usageEvents.filter { $0.source == .realTimeLive }.reduce(.zero) { $0 + ($1.usage ?? .zero) }
        }
    }

    var sessionTokenUsage: TokenUsage {
        transcriptionTokenUsage + processingTokenUsage
    }

    var processingTokenUsage: TokenUsage {
        processingTurns.map(\.usage).reduce(.zero, +)
    }

    /// Actual call costs remain frozen even if Settings changes or a take is removed.
    var sessionEstimatedCost: Double {
        let recorded = usageEvents.reduce(0) { $0 + ($1.estimatedCost ?? 0) }
        let untrackedTakes = takes.filter { $0.usageEvents.isEmpty }.reduce(0.0) {
            $0 + ($1.tokenUsage?.estimatedCost(pricing: $1.isLive ? .liveTranscribe : .flash, at: $1.createdAt) ?? 0)
        }
        let eventTurnIDs = Set(usageEvents.compactMap(\.processingTurnID))
        return recorded + untrackedTakes + processingTurns.filter { !eventTurnIDs.contains($0.id) }.reduce(0) { $0 + $1.estimatedCost }
    }

    private func recordEvent(_ event: DictateUsageEvent) {
        statsStore.record(event)
        guard event.sessionID == sessionID, !usageEvents.contains(where: { $0.id == event.id }) else { return }
        usageEvents.append(event)
        if let index = takes.firstIndex(where: { $0.id == event.takeID }) {
            takes[index].usageEvents.append(event)
        }
    }

    var statsStore: DictateStatsStore = .shared
    /// Where processed sessions are archived and pruned; nil uses
    /// `TranscriptStore.directory`. Tests point this at a temp directory so
    /// they never touch the real archive.
    var transcriptDirectory: URL? = nil
    /// Where failed-take audio is preserved; nil uses
    /// `FailedTakeAudioStore.directory`. Tests point this at a temp directory
    /// so they never touch the real store.
    var failedTakeAudioDirectory: URL? = nil
    private var recorder: AVAudioRecorder?
    private var audioPlayer: AVAudioPlayer?
    /// Outstanding built-in-mic flip for the in-flight take; restored on stop.
    private var micOverride: MicrophonePreference.Override?

    override init() {
        super.init()
        // A take that crashed or quit mid-flip leaves the system default on
        // the built-in mic; put the user's input back at launch.
        MicrophonePreference.restoreInterruptedOverrideIfNeeded()
    }

    /// Injectable live transport; tests substitute scripted fakes.
    var makeLiveDriver: () -> any LiveTranscriptionDriver = { GeminiLiveWebSocketDriver() }
    private var liveEngine: AVAudioEngine?
    private var liveDriver: (any LiveTranscriptionDriver)?
    private var liveTask: Task<LiveTakeOutcome, Never>?
    private var liveStartDate: Date?
    private let livePeak = LivePeakHolder()
    private let liveCaptureStats = LiveCaptureStats()
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

    /// Testable join: numbered takes in current list order, blank line separated.
    nonisolated static func joinedTranscript(_ transcripts: [String]) -> String {
        transcripts.enumerated()
            .map { "Take \($0.offset + 1):\n\($0.element)" }
            .joined(separator: "\n\n")
    }

    /// Takes with usable text, in current list order. Backs the no-AI combine
    /// action; empty transcripts are skipped.
    var combinableTranscripts: [String] {
        takes.compactMap { take -> String? in
            guard take.status == .ready else { return nil }
            guard let text = take.transcript?.trimmingCharacters(in: .whitespacesAndNewlines),
                  !text.isEmpty else { return nil }
            return text
        }
    }

    /// Testable join for the no-AI combine action: plain paragraphs in the
    /// given order, blank line separated, no `Take N:` headers.
    nonisolated static func combinedTranscript(_ transcripts: [String]) -> String {
        transcripts.joined(separator: "\n\n")
    }

    /// Reorders takes via drag and drop. Dropping a take onto a later row
    /// places it after that row; dropping onto an earlier row places it
    /// before, so every position (including last) is reachable. Take numbers
    /// follow the new order and processing uses it as-is.
    func moveTake(_ draggedID: UUID, onto targetID: UUID) {
        guard !isRecording, !isWorking,
              let from = takes.firstIndex(where: { $0.id == draggedID }),
              let to = takes.firstIndex(where: { $0.id == targetID }),
              from != to else { return }
        let element = takes.remove(at: from)
        if let targetIndex = takes.firstIndex(where: { $0.id == targetID }) {
            takes.insert(element, at: from < to ? targetIndex + 1 : targetIndex)
        } else {
            takes.append(element)
        }
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
        // The Settings switch applies to the next take.
        transcriptionMode = .stored
        // Prefer the built-in mic over Bluetooth (AirPods) for the take.
        // Sub-millisecond HAL switch, before the recorder opens the device.
        micOverride = MicrophonePreference.beginPreferredInput()
        do {
            if transcriptionMode == .realTime {
                try beginLiveCapture()
            } else {
                try beginRecorderCapture()
            }
        } catch {
            MicrophonePreference.restore(micOverride)
            micOverride = nil
            throw error
        }
    }

    /// Original path, unchanged: record AAC to a file, transcribe on stop.
    private func beginRecorderCapture() throws {
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
        peakRecordingLevel = 0
        startRecordingMonitor()
    }

    /// Live path: one mic tap feeds the socket (16 kHz PCM), a parallel AAC
    /// file (the REST fallback), and the level meter. A missing API key fails
    /// fast here instead of recording a take that cannot stream.
    private func beginLiveCapture() throws {
        _ = try Self.loadKey()
        let engine = AVAudioEngine()
        let input = engine.inputNode
        let hardwareFormat = input.outputFormat(forBus: 0)
        guard let converter = LivePCM16Converter(from: hardwareFormat) else {
            throw DictateError.badResponse("live audio format")
        }
        liveCaptureStats.reset()
        let url = FileManager.default.temporaryDirectory
            .appendingPathComponent("dictate-\(UUID().uuidString).m4a")
        let file = try AVAudioFile(forWriting: url, settings: [
            AVFormatIDKey: kAudioFormatMPEG4AAC,
            AVSampleRateKey: 44_100,
            AVNumberOfChannelsKey: 1,
            AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
        ])
        let driver = makeLiveDriver()
        let peak = livePeak
        let captureStats = liveCaptureStats
        var take = DictateTake(audioURL: url, transcript: nil, status: .recording)
        take.restSource = .realTimeRESTFallback
        input.installTap(onBus: 0, bufferSize: 4096, format: hardwareFormat) { buffer, _ in
            captureStats.tapped()
            try? file.write(from: buffer)
            if buffer.format.commonFormat == .pcmFormatFloat32,
               let channel = buffer.floatChannelData?[0] {
                var maxSample: Float = 0
                for i in 0..<Int(buffer.frameLength) {
                    maxSample = max(maxSample, abs(channel[i]))
                }
                peak.value = maxSample
            }
            do {
                let pcm = try converter.convert(buffer)
                guard !pcm.isEmpty else { return }
                captureStats.converted(bytes: pcm.count)
                driver.sendAudio(pcm)
            } catch {
                captureStats.failed(error)
                return
            }
        }
        engine.prepare()
        try engine.start()
        liveEngine = engine
        liveDriver = driver
        liveStartDate = Date()
        livePeak.value = 0
        takes.append(take)
        isRecording = true
        recordingElapsed = 0
        recordingLevel = 0
        peakRecordingLevel = 0
        startRecordingMonitor()
        let takeID = take.id
        liveTask = Task { [weak self] in
            guard let self else { return LiveTakeOutcome() }
            do {
                let key = try Self.loadKey()
                return await self.pumpLiveTake(driver: driver, takeID: takeID, apiKey: key)
            } catch {
                return LiveTakeOutcome(errorMessage: error.localizedDescription)
            }
        }
    }

    func stopRecording() {
        if liveTask != nil {
            stopLiveCapture()
            return
        }
        let duration = recorder?.currentTime
        recorder?.stop()
        recorder = nil
        MicrophonePreference.restore(micOverride)
        micOverride = nil
        isRecording = false
        stopRecordingMonitor()
        guard let index = takes.lastIndex(where: { $0.status == .recording }) else { return }
        takes[index].duration = duration
        takes[index].status = .transcribing
        transcribeTake(at: index)
    }

    /// Stops the engine synchronously so timing freezes, then finalizes from
    /// the streamed result — or the parallel file when the stream came up dry.
    private func stopLiveCapture() {
        LatencyTrace.mark("stop-live-capture")
        let duration = liveStartDate.map { Date().timeIntervalSince($0) } ?? recordingElapsed
        if let engine = liveEngine {
            engine.inputNode.removeTap(onBus: 0)
            engine.stop()
        }
        liveEngine = nil
        MicrophonePreference.restore(micOverride)
        micOverride = nil
        isRecording = false
        stopRecordingMonitor()
        guard let index = takes.lastIndex(where: { $0.status == .recording }) else {
            liveDriver?.stop()
            liveDriver = nil
            liveTask?.cancel()
            liveTask = nil
            return
        }
        takes[index].duration = duration
        takes[index].status = .transcribing
        let id = takes[index].id
        let url = takes[index].audioURL
        let driver = liveDriver
        driver?.stop()
        liveDriver = nil
        let task = liveTask
        liveTask = nil
        Task { [weak self] in
            var outcome = await task?.value ?? LiveTakeOutcome()
            if outcome.text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                let counts = [self?.liveCaptureStats.summary, driver?.diagnostics]
                    .compactMap { $0 }.filter { !$0.isEmpty }.joined(separator: "; ")
                outcome.errorMessage = [outcome.errorMessage, counts]
                    .compactMap { $0 }.filter { !$0.isEmpty }.joined(separator: " — ")
            }
            LatencyTrace.mark("live-stream-ended", "chars=\(outcome.text.count) final=\(outcome.receivedFinal) err=\(outcome.errorMessage != nil)")
            self?.finalizeLiveTake(outcome, takeID: id, audioURL: url)
        }
    }

    /// Pumps one live take: connects, applies interim transcripts to the take
    /// as they arrive, and returns the accumulated outcome for finalization.
    /// An empty outcome (connection or setup failure) signals REST fallback.
    func pumpLiveTake(driver: any LiveTranscriptionDriver, takeID: UUID, apiKey: String) async -> LiveTakeOutcome {
        var outcome = LiveTakeOutcome()
        let requestID = takes.first(where: { $0.id == takeID })?.liveRequestID ?? UUID()
        let requestSessionID = sessionID
        let startedAt = Date()
        let modelID = driver.modelID
        defer {
            let event = DictateUsageEvent(id: requestID, sessionID: requestSessionID, takeID: takeID,
                                         source: .realTimeLive, modelID: modelID, startedAt: startedAt,
                                         outcome: Task.isCancelled ? .cancelled : (outcome.errorMessage == nil && !outcome.text.isEmpty ? .succeeded : .failed),
                                         usage: outcome.usageReported ? outcome.usage : nil,
                                         capturedDurationSeconds: takes.first(where: { $0.id == takeID })?.duration)
            recordEvent(event)
        }
        // Carry the same request ID to finalization so it cannot charge twice.
        outcome.event = DictateUsageEvent(id: requestID, sessionID: requestSessionID, takeID: takeID,
                                         source: .realTimeLive, modelID: modelID, startedAt: startedAt, usage: nil)
        var transcript = LiveTranscriptAssembler()
        do {
            try await driver.start(apiKey: apiKey)
        } catch {
            outcome.errorMessage = error.localizedDescription
            return outcome
        }
        for await event in driver.events() {
            switch event {
            case .transcript(let chunk, let isFinal):
                transcript.accept(chunk, isFinal: isFinal)
                outcome.text = transcript.text
                if isFinal { outcome.receivedFinal = true }
                applyLiveTranscript(outcome.text, usage: outcome.usage, to: takeID)
            case .usage(let usage):
                outcome.usageReported = true
                outcome.usage += usage
                applyLiveTranscript(outcome.text, usage: outcome.usage, to: takeID)
            case .error(let error):
                outcome.errorMessage = error.localizedDescription
            }
        }
        return outcome
    }

    private func applyLiveTranscript(_ text: String, usage: TokenUsage, to takeID: UUID) {
        guard let index = takes.firstIndex(where: { $0.id == takeID }),
              takes[index].status == .recording else { return }
        takes[index].transcript = text
        takes[index].tokenUsage = usage.totalTokens > 0 ? usage : nil
    }

    /// Finalizes a live take. Streamed text wins (no second audio charge);
    /// an empty stream falls back to the parallel file via the normal path.
    func finalizeLiveTake(_ outcome: LiveTakeOutcome, takeID: UUID, audioURL: URL?) {
        guard let index = takes.firstIndex(where: { $0.id == takeID }) else { return }
        guard finalizedLiveIDs.insert(takeID).inserted else { return }
        let text = outcome.text.trimmingCharacters(in: .whitespacesAndNewlines)
        // pumpLiveTake records even a cancelled/deleted take. Direct finalization
        // also supports tests and any already-completed transport result.
        if !takes[index].usageEvents.contains(where: { $0.source == .realTimeLive }) {
            let context = outcome.event
            recordEvent(DictateUsageEvent(id: context?.id ?? takes[index].liveRequestID,
                                         sessionID: context?.sessionID ?? sessionID, takeID: takeID,
                                         source: .realTimeLive, modelID: context?.modelID ?? GeminiLiveClient.liveModel,
                                         startedAt: context?.startedAt ?? takes[index].createdAt,
                                         outcome: outcome.errorMessage == nil && !text.isEmpty ? .succeeded : .failed,
                                         usage: outcome.usageReported || outcome.usage.totalTokens > 0 ? outcome.usage : nil,
                                         capturedDurationSeconds: takes[index].duration))
        }
        guard !text.isEmpty else {
            takes[index].restSource = .realTimeRESTFallback
            LatencyTrace.mark("rest-fallback")
            if let detail = outcome.errorMessage?.trimmingCharacters(in: .whitespacesAndNewlines),
               !detail.isEmpty {
                errorMessage = "Real-time transcription dropped (\(detail)) — transcribing after take."
            } else {
                errorMessage = "Real-time transcription dropped — transcribing after take."
            }
            transcribeTake(at: index)
            return
        }
        takes[index].transcript = outcome.text
        takes[index].tokenUsage = outcome.usage.totalTokens > 0 ? outcome.usage : nil
        takes[index].isLive = true
        takes[index].status = .ready
        if outcome.errorMessage != nil {
            let detail = outcome.errorMessage?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
            errorMessage = detail.isEmpty
                ? "Real-time connection dropped — kept the streamed text."
                : "Real-time connection dropped (\(detail)) — kept the streamed text."
        }
        // Audio is discarded once its transcript exists, same as REST takes.
        if let url = audioURL {
            try? FileManager.default.removeItem(at: url)
        }
        takes[index].audioURL = nil
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
        if liveEngine != nil {
            if let start = liveStartDate {
                recordingElapsed = Date().timeIntervalSince(start)
            }
            recordingLevel = min(1, livePeak.value * 3)
            peakRecordingLevel = max(peakRecordingLevel, recordingLevel)
            return
        }
        guard let recorder, recorder.isRecording else { return }
        recorder.updateMeters()
        recordingElapsed = recorder.currentTime
        // AVAudioRecorder reports power in dBFS, usually from -160 to 0.
        // Convert it to a quiet, visually useful 0...1 level.
        let power = max(-60, recorder.averagePower(forChannel: 0))
        recordingLevel = min(1, max(0, (power + 60) / 60))
        peakRecordingLevel = max(peakRecordingLevel, recordingLevel)
    }

    /// Whether the in-flight take plausibly contains speech.
    var currentTakeHasSpeech: Bool {
        recordingElapsed >= Self.minimumSpeechDuration && peakRecordingLevel >= Self.speechLevelThreshold
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
        let requestID = UUID()
        let requestSessionID = sessionID
        let source = takes[index].restSource
        let startedAt = Date()
        let duration = takes[index].duration
        Task {
            do {
                let response = try await transcribe(data, Self.audioMIMEType)
                recordEvent(DictateUsageEvent(id: requestID, sessionID: requestSessionID, takeID: id,
                                             source: source, modelID: GeminiClient.transcribeModel, startedAt: startedAt,
                                             usage: response.usageReported ? response.usage : nil, capturedDurationSeconds: duration))
                guard let i = takes.firstIndex(where: { $0.id == id }) else { return }
                takes[i].transcript = response.text
                // A fallback take owns both the partial Live and REST usage.
                takes[i].tokenUsage = takes[i].usageEvents.reduce(.zero) { $0 + ($1.usage ?? .zero) }
                takes[i].isLive = false
                takes[i].status = .ready
                try? FileManager.default.removeItem(at: audioURL)
                takes[i].audioURL = nil
            } catch {
                recordEvent(DictateUsageEvent(id: requestID, sessionID: requestSessionID, takeID: id,
                                             source: source, modelID: GeminiClient.transcribeModel, startedAt: startedAt,
                                             outcome: Task.isCancelled ? .cancelled : .failed, usage: nil,
                                             capturedDurationSeconds: duration))
                guard let i = takes.firstIndex(where: { $0.id == id }) else { return }
                preserveTakeAudio(at: i, sourceURL: audioURL)
                takes[i].status = .failed(error.localizedDescription)
            }
        }
    }

    /// Moves a failed take's recording out of temp storage so a safety-block
    /// false alarm or network error never loses the audio. Best effort: when
    /// the copy fails the take keeps its original file and stays retryable.
    private func preserveTakeAudio(at index: Int, sourceURL: URL) {
        guard FileManager.default.fileExists(atPath: sourceURL.path),
              !FailedTakeAudioStore.isPreserved(sourceURL, in: failedTakeAudioDirectory) else { return }
        do {
            let stored = try FailedTakeAudioStore.preserve(
                sourceURL, createdAt: takes[index].createdAt, in: failedTakeAudioDirectory)
            try? FileManager.default.removeItem(at: sourceURL)
            takes[index].audioURL = stored
        } catch {
            // Keep the temp file; Retry and Play still work until it is swept.
        }
    }

    /// Copies a take's recording to a user-chosen location ("Save Audio…").
    /// The take keeps its audio afterwards, so saving never destroys the
    /// ability to retry or play it.
    func exportTakeAudio(_ take: DictateTake, to destination: URL) throws {
        guard let source = take.audioURL else {
            throw DictateError.missingAudio
        }
        if FileManager.default.fileExists(atPath: destination.path) {
            try FileManager.default.removeItem(at: destination)
        }
        try FileManager.default.copyItem(at: source, to: destination)
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

    /// Copies every take transcript into the result editor in current list
    /// order, with no model call, no token usage, and no transcript-archive
    /// write. This intentionally replaces the editor text, matching the
    /// reprocess action above.
    func combineTakesIntoResult() {
        let parts = combinableTranscripts
        guard !parts.isEmpty else {
            errorMessage = "Nothing to combine yet — record at least one take."
            return
        }
        errorMessage = nil
        resultText = Self.combinedTranscript(parts)
    }

    /// Legacy call site compatibility. New UI should choose an explicit action.
    func process(masterPrompt: String) { reprocessTakes(masterPrompt: masterPrompt) }

    private func runProcessing(kind: DictateProcessingTurn.Kind, masterPrompt: String, input: String) {
        errorMessage = nil
        isWorking = true
        Task {
            do {
                _ = try await performProcessing(kind: kind, masterPrompt: masterPrompt, input: input)
            } catch {
                errorMessage = error.localizedDescription
            }
            isWorking = false
        }
    }

    /// One model turn: sets the result, records usage, and archives the
    /// session. Shared by the Dictate page and Quick Dictate.
    @discardableResult
    private func performProcessing(kind: DictateProcessingTurn.Kind, masterPrompt: String, input: String) async throws -> String {
        let startedAt = Date()
        let turnID = UUID()
        let requestSessionID = sessionID
        let eventID = UUID()
        let response: GeminiResponse
        do {
            response = try await synthesize(masterPrompt, input)
        } catch {
            recordEvent(DictateUsageEvent(id: eventID, sessionID: requestSessionID, processingTurnID: turnID,
                                         source: .processing, modelID: GeminiClient.processModel, startedAt: startedAt,
                                         outcome: Task.isCancelled ? .cancelled : .failed, usage: nil))
            throw error
        }
        let event = DictateUsageEvent(id: eventID, sessionID: requestSessionID, processingTurnID: turnID,
                                     source: .processing, modelID: GeminiClient.processModel, startedAt: startedAt,
                                     usage: response.usageReported ? response.usage : nil)
        recordEvent(event)
        // A response from a reset session still counts for lifetime usage, but
        // must not overwrite a new session's editor or archive.
        guard sessionID == requestSessionID else { throw CancellationError() }
        resultText = response.text
        synthesisTokenUsage = response.usage
        let turn = DictateProcessingTurn(id: turnID, kind: kind, createdAt: startedAt,
                                        usage: response.usage, estimatedCost: event.estimatedCost ?? 0)
        processingTurns.append(turn)
        let transcripts = readyTranscripts
        _ = try? TranscriptStore.saveSession(
            takes: transcripts,
            result: response.text,
            tokenUsage: sessionTokenUsage,
            transcriptionUsage: transcriptionTokenUsage,
            liveTranscriptionUsage: liveTranscriptionTokenUsage,
            synthesisUsage: response.usage,
            takeUsages: takes.compactMap(\.tokenUsage),
            processingTurns: processingTurns,
            estimatedCost: sessionEstimatedCost,
            usageEvents: usageEvents,
            takeEventReferences: takes.map { TranscriptStore.TakeEventReference(takeID: $0.id, eventIDs: $0.usageEvents.map(\.id)) },
            in: transcriptDirectory
        )
        _ = try? TranscriptStore.prune(in: transcriptDirectory)
        return response.text
    }

    // MARK: - Quick Dictate

    /// Stops the in-flight take (if any) and waits for its transcript. Quick
    /// Dictate sessions hold a single take, so the last take is the one.
    func finishQuickTranscript() async throws -> String {
        if isRecording {
            // A silent or near-instant take never reaches the model:
            // transcription models hallucinate whole sentences from silence.
            guard currentTakeHasSpeech else {
                newSession()
                throw QuickDictateError.noSpeech
            }
            stopRecording()
        }
        for await snapshot in $takes.values {
            guard let take = snapshot.last else { throw QuickDictateError.nothingRecorded }
            switch take.status {
            case .ready:
                return (take.transcript ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
            case .failed(let message):
                throw QuickDictateError.transcriptionFailed(message)
            case .recording, .transcribing:
                continue
            }
        }
        throw QuickDictateError.nothingRecorded
    }

    /// Runs one processing turn over a quick take. A nil or empty prompt
    /// returns the transcript untouched (Raw), with no model call.
    func processQuickTranscript(_ transcript: String, masterPrompt: String?) async throws -> String {
        guard let masterPrompt, !masterPrompt.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            resultText = transcript
            return transcript
        }
        return try await performProcessing(kind: .reprocessTakes, masterPrompt: masterPrompt, input: transcript)
    }

    /// Hands a finished quick take to this (Dictate page) session: appended
    /// after any existing takes, and its result, if any, replaces the editor.
    func adoptQuickTake(_ take: DictateTake, result: String?) {
        guard take.status == .ready else { return }
        guard !takes.contains(where: { $0.id == take.id }) else { return }
        takes.append(take)
        for event in take.usageEvents where !usageEvents.contains(where: { $0.id == event.id }) {
            usageEvents.append(event)
        }
        if let result, !result.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            resultText = result
        }
    }

    func copyResult() {
        guard !resultText.isEmpty else { return }
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(resultText, forType: .string)
    }

    func newSession() {
        stopPlayback()
        // An After-take capture must release the mic too, or a cancelled
        // Quick Dictate take keeps recording in the background.
        recorder?.stop()
        recorder = nil
        if let engine = liveEngine {
            engine.inputNode.removeTap(onBus: 0)
            engine.stop()
        }
        liveEngine = nil
        liveDriver?.stop()
        liveDriver = nil
        liveTask?.cancel()
        liveTask = nil
        isRecording = false
        stopRecordingMonitor()
        for take in takes {
            // Preserved failed-take audio survives new sessions: it is the
            // user's only recoverable copy, and deleting the take explicitly
            // is the way to remove it.
            if let url = take.audioURL,
               !FailedTakeAudioStore.isPreserved(url, in: failedTakeAudioDirectory) {
                try? FileManager.default.removeItem(at: url)
            }
        }
        takes = []
        sessionID = UUID()
        usageEvents = []
        finalizedLiveIDs = []
        resultText = ""
        recordingElapsed = 0
        recordingLevel = 0
        synthesisTokenUsage = nil
        processingTurns = []
        errorMessage = nil
    }
}
