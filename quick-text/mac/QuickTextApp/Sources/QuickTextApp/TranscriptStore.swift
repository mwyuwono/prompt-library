import Foundation

/// Retains Dictate session transcripts for 15 days, then prunes. Audio is
/// never stored here — take recordings are deleted right after successful
/// transcription. No other logging.
enum TranscriptStore {
    static let retentionDays = 15

    static var directory: URL {
        FileManager.default
            .urls(for: .applicationSupportDirectory, in: .userDomainMask).first!
            .appendingPathComponent("com.weaveryuwono.quicktext/DictateTranscripts", isDirectory: true)
    }

    struct TakeEventReference: Codable, Equatable {
        var takeID: UUID
        var eventIDs: [UUID]
    }

    struct SessionRecord: Codable, Equatable {
        var savedAt: Date
        var takes: [String]
        var result: String
        var tokenUsage: TokenUsage?
        var transcriptionUsage: TokenUsage?
        var liveTranscriptionUsage: TokenUsage? = nil
        var synthesisUsage: TokenUsage?
        var takeUsages: [TokenUsage]?
        var processingTurns: [DictateProcessingTurn]?
        var estimatedCost: Double?
        var accountingVersion: Int? = nil
        var usageEvents: [DictateUsageEvent]? = nil
        var takeEventReferences: [TakeEventReference]? = nil
    }

    @discardableResult
    static func saveSession(
        takes: [String],
        result: String,
        tokenUsage: TokenUsage? = nil,
        transcriptionUsage: TokenUsage? = nil,
        liveTranscriptionUsage: TokenUsage? = nil,
        synthesisUsage: TokenUsage? = nil,
        takeUsages: [TokenUsage]? = nil,
        processingTurns: [DictateProcessingTurn]? = nil,
        estimatedCost: Double? = nil,
        usageEvents: [DictateUsageEvent]? = nil,
        takeEventReferences: [TakeEventReference]? = nil,
        date: Date = Date(),
        in directory: URL? = nil
    ) throws -> URL {
        let dir = directory ?? Self.directory
        try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        // A processing/refinement chain can finish more than once in a second.
        // Keep every billable turn rather than overwriting a same-second record.
        let url = dir.appendingPathComponent("dictate-\(UUID().uuidString).json")
        let eventCost = usageEvents.map { events in
            var seen = Set<UUID>()
            return events.filter { seen.insert($0.id).inserted }.reduce(0.0) { $0 + ($1.estimatedCost ?? 0) }
        }
        let cost = estimatedCost ?? eventCost ?? Self.splitEstimatedCost(
            transcriptionUsage: transcriptionUsage,
            liveTranscriptionUsage: liveTranscriptionUsage,
            synthesisUsage: synthesisUsage,
            processingTurns: processingTurns,
            tokenUsage: tokenUsage,
            at: date
        )
        let record = SessionRecord(
            savedAt: date,
            takes: takes,
            result: result,
            tokenUsage: tokenUsage,
            transcriptionUsage: transcriptionUsage,
            liveTranscriptionUsage: liveTranscriptionUsage,
            synthesisUsage: synthesisUsage,
            takeUsages: takeUsages,
            processingTurns: processingTurns,
            estimatedCost: cost,
            accountingVersion: usageEvents == nil ? nil : 1,
            usageEvents: usageEvents,
            takeEventReferences: takeEventReferences
        )
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        try encoder.encode(record).write(to: url, options: .atomic)
        return url
    }

    /// Compatibility for callers without an event ledger. Use available source
    /// metadata at the save date; never consult current Settings. Existing saved
    /// estimates are retained when records are decoded.
    static func splitEstimatedCost(
        transcriptionUsage: TokenUsage?,
        liveTranscriptionUsage: TokenUsage? = nil,
        synthesisUsage: TokenUsage?,
        processingTurns: [DictateProcessingTurn]?,
        tokenUsage: TokenUsage?,
        at date: Date
    ) -> Double? {
        if let transcription = transcriptionUsage {
            let live = liveTranscriptionUsage ?? .zero
            let rest = TokenUsage(inputTokens: transcription.inputTokens - live.inputTokens,
                                  outputTokens: transcription.outputTokens - live.outputTokens)
            var cost = live.estimatedCost(pricing: .liveTranscribe, at: date) + rest.estimatedCost(pricing: .flash, at: date)
            if let turns = processingTurns, !turns.isEmpty {
                cost += turns.reduce(0) { $0 + $1.estimatedCost }
            } else if let synthesis = synthesisUsage {
                cost += synthesis.estimatedCost(pricing: .flash, at: date)
            }
            return cost
        }
        return tokenUsage?.estimatedCost(pricing: .flash, at: date)
    }

    /// Deletes session files whose modification date is older than the cutoff.
    /// Returns the number of files removed. Missing directory is a no-op.
    @discardableResult
    static func prune(retentionDays: Int = Self.retentionDays, now: Date = Date(), in directory: URL? = nil) throws -> Int {
        let dir = directory ?? Self.directory
        guard FileManager.default.fileExists(atPath: dir.path) else { return 0 }
        let cutoff = now.addingTimeInterval(TimeInterval(-retentionDays * 24 * 3600))
        let files = try FileManager.default.contentsOfDirectory(at: dir, includingPropertiesForKeys: [.contentModificationDateKey])
        var removed = 0
        for file in files {
            let values = try file.resourceValues(forKeys: [.contentModificationDateKey])
            if let modified = values.contentModificationDate, modified < cutoff {
                try FileManager.default.removeItem(at: file)
                removed += 1
            }
        }
        return removed
    }
}
