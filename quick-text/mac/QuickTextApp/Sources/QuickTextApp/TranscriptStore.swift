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

    struct SessionRecord: Codable, Equatable {
        var savedAt: Date
        var takes: [String]
        var result: String
        var tokenUsage: TokenUsage?
        var transcriptionUsage: TokenUsage?
        var synthesisUsage: TokenUsage?
        var takeUsages: [TokenUsage]?
        var processingTurns: [DictateProcessingTurn]?
        var estimatedCost: Double?
    }

    @discardableResult
    static func saveSession(
        takes: [String],
        result: String,
        tokenUsage: TokenUsage? = nil,
        transcriptionUsage: TokenUsage? = nil,
        synthesisUsage: TokenUsage? = nil,
        takeUsages: [TokenUsage]? = nil,
        processingTurns: [DictateProcessingTurn]? = nil,
        estimatedCost: Double? = nil,
        date: Date = Date(),
        in directory: URL? = nil
    ) throws -> URL {
        let dir = directory ?? Self.directory
        try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        // A processing/refinement chain can finish more than once in a second.
        // Keep every billable turn rather than overwriting a same-second record.
        let url = dir.appendingPathComponent("dictate-\(UUID().uuidString).json")
        let cost = estimatedCost ?? tokenUsage?.estimatedCost
        let record = SessionRecord(
            savedAt: date,
            takes: takes,
            result: result,
            tokenUsage: tokenUsage,
            transcriptionUsage: transcriptionUsage,
            synthesisUsage: synthesisUsage,
            takeUsages: takeUsages,
            processingTurns: processingTurns,
            estimatedCost: cost
        )
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        try encoder.encode(record).write(to: url, options: .atomic)
        return url
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
