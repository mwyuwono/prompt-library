import Foundation

/// Durable home for take recordings that failed to transcribe (safety-block
/// false alarms, network errors, ...). Captures record to a temp file that a
/// new session or the OS can sweep; a failed take's audio is copied here so it
/// survives until the user deletes the take or saves it elsewhere via
/// "Save Audio…". Success-path audio is still deleted immediately.
enum FailedTakeAudioStore {
    static var directory: URL {
        FileManager.default
            .urls(for: .applicationSupportDirectory, in: .userDomainMask).first!
            .appendingPathComponent("com.weaveryuwono.quicktext/FailedTakeAudio", isDirectory: true)
    }

    /// Copies `source` into the store and returns the stored URL. Throws
    /// without touching `source`, so callers can keep the original file and
    /// stay retryable.
    @discardableResult
    static func preserve(_ source: URL, createdAt: Date = Date(), in directory: URL? = nil) throws -> URL {
        let dir = directory ?? Self.directory
        try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyyMMdd-HHmmss"
        let stamp = formatter.string(from: createdAt)
        let url = dir.appendingPathComponent("failed-take-\(stamp)-\(UUID().uuidString.prefix(8)).m4a")
        try FileManager.default.copyItem(at: source, to: url)
        return url
    }

    /// Whether `url` already lives in the store. Takes holding such a URL
    /// must not have their audio swept by a new session.
    static func isPreserved(_ url: URL, in directory: URL? = nil) -> Bool {
        let dir = (directory ?? Self.directory).standardizedFileURL.path
        return url.standardizedFileURL.path.hasPrefix(dir + "/")
    }

    /// Default filename for the "Save Audio…" panel, e.g.
    /// `QuickText-Take1-2026-10-08.m4a`.
    static func suggestedFilename(takeNumber: Int, date: Date = Date()) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return "QuickText-Take\(takeNumber)-\(formatter.string(from: date)).m4a"
    }
}
