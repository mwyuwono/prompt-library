import Foundation

enum LiveConnectionStage: String {
    case openTimeout = "Open timeout"
    case setupSend = "Setup send"
    case setupAcknowledgement = "Setup acknowledgement"
    case setupRejected = "Setup rejected"
    case setupTimeout = "Setup acknowledgement timeout"
    case realtimeSend = "Realtime send"
    case receiveClose = "Receive/close"
}

struct LiveConnectionError: LocalizedError {
    let stage: LiveConnectionStage
    let detail: String
    let closeCode: URLSessionWebSocketTask.CloseCode?
    let closeReason: Data?

    var errorDescription: String? {
        var message = "Live \(stage.rawValue): \(detail)"
        let hasCode = closeCode != nil && closeCode != .invalid
        let hasReason = closeReason?.isEmpty == false
        if hasCode || hasReason {
            var details: [String] = []
            if let closeCode, hasCode { details.append("WebSocket close code \(closeCode.rawValue)") }
            if let closeReason, hasReason {
                let reason = String(data: closeReason, encoding: .utf8)
                    ?? closeReason.base64EncodedString()
                details.append("reason: \(reason)")
            }
            message += " (\(details.joined(separator: ", ")))"
        }
        return message
    }

    static func transport(_ stage: LiveConnectionStage, error: Error,
                          task: URLSessionWebSocketTask?) -> LiveConnectionError {
        LiveConnectionError(stage: stage, detail: error.localizedDescription,
                            closeCode: task?.closeCode, closeReason: task?.closeReason)
    }
}

/// Interim frames are revised hypotheses for the current speech segment.
/// Final frames commit a segment; later segments may arrive as deltas or as a
/// cumulative transcript of the take.
struct LiveTranscriptAssembler {
    private(set) var committed = ""
    private(set) var interim = ""

    var text: String { Self.merge(committed, interim) }

    mutating func accept(_ chunk: String, isFinal: Bool) {
        let candidate = chunk.trimmingCharacters(in: .whitespacesAndNewlines)
        if isFinal {
            if !candidate.isEmpty {
                committed = Self.merge(committed, candidate)
                interim = ""
            }
        } else if !candidate.isEmpty {
            interim = candidate
        }
    }

    private static func normalizedWords(_ text: String) -> [String] {
        text.split(whereSeparator: \.isWhitespace).map { word in
            String(word.unicodeScalars.filter { CharacterSet.alphanumerics.contains($0) })
                .lowercased()
        }
    }

    private static func merge(_ previous: String, _ candidate: String) -> String {
        guard !previous.isEmpty else { return candidate }
        guard !candidate.isEmpty else { return previous }
        let oldWords = normalizedWords(previous)
        let newWords = normalizedWords(candidate)
        if newWords.starts(with: oldWords) { return candidate }
        if oldWords.starts(with: newWords) { return previous }
        let candidateWords = candidate.split(whereSeparator: \.isWhitespace)
        let limit = min(oldWords.count, newWords.count)
        if limit > 0 {
            for overlap in stride(from: limit, through: 1, by: -1) {
                if Array(oldWords.suffix(overlap)) == Array(newWords.prefix(overlap)) {
                    let remainder = candidateWords.dropFirst(overlap).joined(separator: " ")
                    return remainder.isEmpty ? previous : previous + " " + remainder
                }
            }
        }
        return previous + " " + candidate
    }
}

/// Streaming transcription through the Gemini Live API over WebSocket.
///
/// Raw WebSocket messages follow the v1beta Live API contract. The session
/// treats an empty stream as a fallback signal.
/// The REST path (`GeminiClient`) stays the default and the fallback.
enum GeminiLiveClient {
    static let endpoint = "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent"
    static let liveModel = "models/gemini-3.5-transcribe-live"

    static func endpointURL(apiKey: String) -> URL? {
        guard var components = URLComponents(string: endpoint) else { return nil }
        components.queryItems = [URLQueryItem(name: "key", value: apiKey)]
        return components.url
    }

    static let streamSampleRate = 16_000
    static let streamMimeType = "audio/pcm;rate=16000"

    enum LiveEvent {
        case transcript(text: String, isFinal: Bool)
        case usage(TokenUsage)
        case error(Error)
    }

    struct LiveServerUpdate {
        var transcriptChunk: String?
        var isFinal = false
        var usage: TokenUsage?
    }

    static func isSetupComplete(_ data: Data) -> Bool {
        guard let json = try? JSONSerialization.jsonObject(with: data),
              let dict = json as? [String: Any] else { return false }
        return dict["setupComplete"] is [String: Any]
    }

    /// The first post-setup input must wait for the server acknowledgement.
    static func awaitSetupComplete(receive: @escaping () async throws -> Data) async throws {
        while true {
            let data = try await receive()
            if isSetupComplete(data) { return }
            if let rejection = setupRejection(data) {
                throw LiveConnectionError(stage: .setupRejected, detail: rejection,
                                          closeCode: nil, closeReason: nil)
            }
        }
    }

    static func setupRejection(_ data: Data) -> String? {
        guard let json = try? JSONSerialization.jsonObject(with: data),
              let dict = json as? [String: Any],
              let error = dict["error"] as? [String: Any] else { return nil }
        let code = (error["code"] as? Int).map(String.init) ?? "unknown code"
        let status = error["status"] as? String
        let message = error["message"] as? String ?? "server rejected setup"
        return "\(code)\(status.map { " \($0)" } ?? ""): \(message)"
    }

    static func awaitSetupComplete(
        receive: @escaping () async throws -> Data,
        timeoutNanoseconds: UInt64,
        onTimeout: @escaping () -> Void
    ) async throws {
        try await withThrowingTaskGroup(of: Void.self) { group in
            group.addTask { try await awaitSetupComplete(receive: receive) }
            group.addTask {
                try await Task.sleep(nanoseconds: timeoutNanoseconds)
                onTimeout()
                throw LiveConnectionError(stage: .setupTimeout,
                                          detail: "No setupComplete frame received.",
                                          closeCode: nil, closeReason: nil)
            }
            defer { group.cancelAll() }
            try await group.next()
        }
    }

    // MARK: - Outbound messages (testable)

    /// The dedicated Live Transcription model streams text for microphone input.
    static func setupMessage(model: String = liveModel) -> [String: Any] {
        ["setup": [
            "model": model,
            "generationConfig": ["responseModalities": ["TEXT"]],
            "inputAudioTranscription": ["languageCodes": [String]()]
        ]]
    }

    static func audioMessage(pcmData: Data) -> [String: Any] {
        ["realtimeInput": ["audio":
            ["mimeType": streamMimeType, "data": pcmData.base64EncodedString()]
        ]]
    }

    static func audioStreamEndMessage() -> [String: Any] {
        ["realtimeInput": ["audioStreamEnd": true]]
    }

    static func emptyStreamError() -> LiveConnectionError {
        LiveConnectionError(stage: .receiveClose,
                            detail: "No transcript received within 3 seconds after audioStreamEnd.",
                            closeCode: nil, closeReason: nil)
    }

    static func jsonString(_ message: [String: Any]) -> String? {
        guard let data = try? JSONSerialization.data(withJSONObject: message),
              let string = String(data: data, encoding: .utf8) else { return nil }
        return string
    }

    // MARK: - Inbound parsing (testable)

    /// Parses one server text frame. Returns nil for envelopes with no
    /// actionable content (`setupComplete`, pings, unknown shapes).
    static func parseServerMessage(_ data: Data) -> LiveServerUpdate? {
        guard let json = try? JSONSerialization.jsonObject(with: data),
              let dict = json as? [String: Any] else { return nil }
        var update = LiveServerUpdate()
        // A usage-only frame carries no serverContent; transcribe frames do.
        let content = dict["serverContent"] as? [String: Any]
        if let content {
            if let input = content["inputTranscription"] as? [String: Any],
               let text = input["text"] as? String, !text.isEmpty {
                update.transcriptChunk = text
                update.isFinal = true
            } else if let interim = content["interimInputTranscription"] as? [String: Any],
                      let text = interim["text"] as? String, !text.isEmpty {
                update.transcriptChunk = text
            } else if let legacy = content["transcription"] as? [String: Any],
                      let text = legacy["text"] as? String, !text.isEmpty {
                update.transcriptChunk = text
            }
            // `outputTranscription` / model turns are ignored on purpose: this
            // flow has no model speech, and model text must never pollute the take.
            if (content["turnComplete"] as? Bool) == true
                || (content["generationComplete"] as? Bool) == true {
                update.isFinal = true
            }
        }
        // Per https://ai.google.dev/api/live, `usageMetadata` is a top-level
        // sibling of `serverContent` on BidiGenerateContentServerMessage, not a
        // child of it. Accept the nested shape too for tolerance.
        if let usageDict = (dict["usageMetadata"] as? [String: Any])
            ?? (content?["usageMetadata"] as? [String: Any]) {
            let usage = GeminiClient.extractTokenUsage(from: usageDict)
            update.usage = usage
        }
        if update.transcriptChunk == nil && !update.isFinal && update.usage == nil { return nil }
        return update
    }
}

/// Injectable transport for a live take. Production uses `Driver` (WebSocket);
/// tests substitute scripted fakes.
protocol LiveTranscriptionDriver: AnyObject {
    var modelID: String { get }
    /// Connects and waits for setupComplete. Throws when the socket or setup fails, in
    /// which case the session falls back to the file + REST path.
    func start(apiKey: String) async throws
    /// Fire-and-forget PCM chunk (16 kHz mono int16).
    func sendAudio(_ pcmChunk: Data)
    /// Server events for the take. Ends when the socket closes or `stop` runs.
    func events() -> AsyncStream<GeminiLiveClient.LiveEvent>
    /// Signals audio stream end, then closes after a grace window.
    func stop()
    /// Non-content counters for an empty-stream diagnostic.
    var diagnostics: String { get }
}

extension LiveTranscriptionDriver {
    var modelID: String { GeminiLiveClient.liveModel }
    var diagnostics: String { "" }
}

/// Rendezvous between the socket handshake and `start()`. A setup send on a
/// not-yet-open socket fails with "socket is not connected", so the driver
/// waits for `didOpen` (or times out) before its first send. Single waiter.
/// The delegate callback needs a live task, so tests drive `notifyOpened()`
/// directly instead.
final class LiveSocketOpener: NSObject, URLSessionWebSocketDelegate {
    private let lock = NSLock()
    private var opened = false
    private var continuation: CheckedContinuation<Void, Never>?

    func urlSession(_ session: URLSession, webSocketTask: URLSessionWebSocketTask, didOpenWithProtocol protocol: String?) {
        notifyOpened()
    }

    func notifyOpened() {
        lock.withLock {
            if let continuation {
                self.continuation = nil
                continuation.resume()
            } else {
                opened = true
            }
        }
    }

    func waitForOpen() async {
        if lock.withLock({ opened }) { return }
        // A checked continuation ignores cancellation, which would strand a
        // cancelled waiter (and any task group around it) forever.
        await withTaskCancellationHandler {
            await withCheckedContinuation { (continuation: CheckedContinuation<Void, Never>) in
                lock.withLock {
                    if opened {
                        continuation.resume()
                    } else {
                        self.continuation = continuation
                    }
                }
            }
        } onCancel: {
            lock.withLock {
                if let continuation {
                    self.continuation = nil
                    continuation.resume()
                }
            }
        }
    }

    func waitForOpen(timeoutNanoseconds: UInt64) async throws {
        try await withThrowingTaskGroup(of: Void.self) { group in
            group.addTask { await self.waitForOpen() }
            group.addTask {
                try await Task.sleep(nanoseconds: timeoutNanoseconds)
                throw DictateError.network(URLError(.timedOut))
            }
            try await group.next()
            group.cancelAll()
        }
    }
}

final class GeminiLiveWebSocketDriver: LiveTranscriptionDriver {
    private struct PendingMessage {
        let json: String
        let audioBytes: Int
    }

    private var session: URLSession?
    private var task: URLSessionWebSocketTask?
    private var receiveTask: Task<Void, Never>?
    private var continuation: AsyncStream<GeminiLiveClient.LiveEvent>.Continuation?
    private var stream: AsyncStream<GeminiLiveClient.LiveEvent>?
    private let sendLock = NSLock()
    private var pendingMessages: [PendingMessage] = []
    private var setupReady = false
    private var sending = false
    private var stopRequested = false
    private var receivedTranscript = false
    private var gate = LiveFinalizationGate()
    private var queuedAudioChunks = 0
    private var sentAudioChunks = 0
    private var sentAudioBytes = 0
    private var serverFrames = 0
    /// Handshake grace: recording continues on the parallel file while we
    /// wait, so a slow open costs latency, never audio.
    static let openTimeoutNanoseconds: UInt64 = 10_000_000_000
    static let setupTimeoutNanoseconds: UInt64 = 10_000_000_000

    func start(apiKey: String) async throws {
        guard let url = GeminiLiveClient.endpointURL(apiKey: apiKey) else {
            throw DictateError.badResponse("live endpoint")
        }
        // A dedicated session so the delegate sees the handshake.
        let opener = LiveSocketOpener()
        let session = URLSession(configuration: .default, delegate: opener, delegateQueue: nil)
        self.session = session
        let task = session.webSocketTask(with: url)
        self.task = task
        task.resume()
        let stream = AsyncStream<GeminiLiveClient.LiveEvent> { [weak self] continuation in
            self?.continuation = continuation
        }
        self.stream = stream
        guard let setup = GeminiLiveClient.jsonString(GeminiLiveClient.setupMessage()) else {
            session.invalidateAndCancel()
            self.session = nil
            self.task = nil
            throw DictateError.badResponse("live setup")
        }
        do {
            do {
                try await opener.waitForOpen(timeoutNanoseconds: Self.openTimeoutNanoseconds)
            } catch {
                throw LiveConnectionError.transport(.openTimeout, error: error, task: task)
            }
            do {
                try await task.send(.string(setup))
            } catch {
                throw LiveConnectionError.transport(.setupSend, error: error, task: task)
            }
            do {
                try await GeminiLiveClient.awaitSetupComplete(receive: {
                let message = try await task.receive()
                switch message {
                case .string(let text): return Data(text.utf8)
                case .data(let data): return data
                @unknown default: return Data()
                }
                }, timeoutNanoseconds: Self.setupTimeoutNanoseconds,
                   onTimeout: { task.cancel(with: .goingAway, reason: nil) })
            } catch let error as LiveConnectionError {
                throw LiveConnectionError(stage: error.stage, detail: error.detail,
                                          closeCode: task.closeCode == .invalid ? error.closeCode : task.closeCode,
                                          closeReason: task.closeReason ?? error.closeReason)
            } catch {
                throw LiveConnectionError.transport(.setupAcknowledgement, error: error, task: task)
            }
        } catch {
            session.invalidateAndCancel()
            self.session = nil
            self.task = nil
            continuation?.finish()
            throw error
        }
        sendLock.withLock { setupReady = true }
        startSendingIfNeeded()
        receiveTask = Task { [weak self] in await self?.receiveLoop() }
    }

    func events() -> AsyncStream<GeminiLiveClient.LiveEvent> {
        stream ?? AsyncStream { $0.finish() }
    }

    var diagnostics: String {
        sendLock.withLock {
            "socket queued chunks \(queuedAudioChunks), sent chunks \(sentAudioChunks), sent bytes \(sentAudioBytes), server frames \(serverFrames)"
        }
    }

    func sendAudio(_ pcmChunk: Data) {
        guard !pcmChunk.isEmpty,
              let json = GeminiLiveClient.jsonString(GeminiLiveClient.audioMessage(pcmData: pcmChunk)) else { return }
        sendLock.withLock {
            if !stopRequested {
                pendingMessages.append(PendingMessage(json: json, audioBytes: pcmChunk.count))
                queuedAudioChunks += 1
            }
        }
        startSendingIfNeeded()
    }

    func stop() {
        sendLock.withLock {
            guard !stopRequested else { return }
            stopRequested = true
            if let json = GeminiLiveClient.jsonString(GeminiLiveClient.audioStreamEndMessage()) {
                pendingMessages.append(PendingMessage(json: json, audioBytes: 0))
            }
        }
        startSendingIfNeeded()
    }

    private func startSendingIfNeeded() {
        let shouldStart = sendLock.withLock { () -> Bool in
            guard setupReady, !sending, !pendingMessages.isEmpty else { return false }
            sending = true
            return true
        }
        if shouldStart { Task { [weak self] in await self?.drainMessages() } }
    }

    private func drainMessages() async {
        while true {
            let next = sendLock.withLock { () -> (PendingMessage?, Bool) in
                if !pendingMessages.isEmpty { return (pendingMessages.removeFirst(), false) }
                sending = false
                return (nil, stopRequested)
            }
            guard let message = next.0 else {
                if next.1 {
                    // Wait for the server to finish the turn (see LiveFinalizationGate)
                    // instead of a fixed delay; the ceiling still bounds it.
                    let endSent = DispatchTime.now().uptimeNanoseconds
                    sendLock.withLock { gate.markEndSent(at: endSent) }
                    while !Task.isCancelled {
                        let now = DispatchTime.now().uptimeNanoseconds
                        if sendLock.withLock({ gate.shouldClose(at: now) }) { break }
                        try? await Task.sleep(nanoseconds: 25_000_000)
                    }
                    LatencyTrace.mark("sleep-3s-over")
                    let hasTranscript = sendLock.withLock { receivedTranscript }
                    if !hasTranscript {
                        continuation?.yield(.error(GeminiLiveClient.emptyStreamError()))
                    }
                    task?.cancel(with: .normalClosure, reason: nil)
                    session?.invalidateAndCancel()
                    session = nil
                    continuation?.finish()
                }
                return
            }
            do {
                guard let task else {
                    throw URLError(.notConnectedToInternet)
                }
                try await task.send(.string(message.json))
                if message.audioBytes == 0 { LatencyTrace.mark("audioStreamEnd-sent") }
                if message.audioBytes > 0 {
                    sendLock.withLock {
                        sentAudioChunks += 1
                        sentAudioBytes += message.audioBytes
                    }
                }
            } catch {
                continuation?.yield(.error(LiveConnectionError.transport(
                    .realtimeSend, error: error, task: task)))
                continuation?.finish()
                task?.cancel(with: .goingAway, reason: nil)
                session?.invalidateAndCancel()
                return
            }
        }
    }

    private func receiveLoop() async {
        guard let task else { return }
        while true {
            do {
                let message = try await task.receive()
                sendLock.withLock { serverFrames += 1 }
                let data: Data?
                switch message {
                case .string(let text): data = Data(text.utf8)
                case .data(let binary): data = binary
                default: data = nil
                }
                guard let data,
                      let update = GeminiLiveClient.parseServerMessage(data) else { continue }
                sendLock.withLock {
                    gate.noteFrame(at: DispatchTime.now().uptimeNanoseconds,
                                   isFinal: update.isFinal, hasText: update.transcriptChunk != nil)
                }
                if sendLock.withLock({ stopRequested }) {
                    LatencyTrace.mark("server-frame", "final=\(update.isFinal) chunk=\(update.transcriptChunk?.count ?? 0)")
                }
                if let chunk = update.transcriptChunk {
                    sendLock.withLock { receivedTranscript = true }
                    continuation?.yield(.transcript(text: chunk, isFinal: update.isFinal))
                } else if update.isFinal {
                    continuation?.yield(.transcript(text: "", isFinal: true))
                }
                if let usage = update.usage {
                    continuation?.yield(.usage(usage))
                }
            } catch {
                continuation?.yield(.error(LiveConnectionError.transport(
                    .receiveClose, error: error, task: task)))
                continuation?.finish()
                return
            }
        }
    }
}

/// Decides when a stopped live take may close its socket. Closes at once on
/// the turn-complete frame (an empty final) that follows `audioStreamEnd`;
/// failing that, after a quiet spell once a final was seen; never later than
/// the ceiling. Interim text is not treated as complete without a final.
struct LiveFinalizationGate {
    var quiet: UInt64 = 800_000_000
    var ceiling: UInt64 = 2_000_000_000
    private(set) var endSentAt: UInt64?
    private var lastFrameAt: UInt64?
    private var finalSeen = false
    private var turnCompleteAfterEnd = false

    init(quiet: UInt64 = 800_000_000, ceiling: UInt64 = 2_000_000_000) {
        self.quiet = quiet
        self.ceiling = ceiling
    }

    mutating func markEndSent(at now: UInt64) { endSentAt = now }

    mutating func noteFrame(at now: UInt64, isFinal: Bool, hasText: Bool) {
        lastFrameAt = now
        guard isFinal else { return }
        finalSeen = true
        if endSentAt != nil, !hasText { turnCompleteAfterEnd = true }
    }

    func shouldClose(at now: UInt64) -> Bool {
        guard let end = endSentAt else { return false }
        if now &- end >= ceiling { return true }
        if turnCompleteAfterEnd { return true }
        guard finalSeen else { return false }
        return now &- max(lastFrameAt ?? end, end) >= quiet
    }
}
