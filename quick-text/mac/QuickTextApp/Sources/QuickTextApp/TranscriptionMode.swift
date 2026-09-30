import Foundation

/// Dictate transcription path. `afterTake` is the original behavior: record to
/// a file, then send the whole take to Gemini REST transcription on stop.
/// `realTime` streams mic audio to the Gemini Live API and shows words while
/// recording, falling back to the file + REST path if the stream drops.
enum TranscriptionMode: String, CaseIterable, Identifiable {
    case afterTake
    case realTime

    var id: String { rawValue }

    var title: String {
        switch self {
        case .afterTake: return "After take"
        case .realTime: return "Real-time"
        }
    }

    static let storageKey = "quicktext.dictate.transcriptionMode"

    /// Defaults to `afterTake` so upgrades keep current behavior.
    static var stored: TranscriptionMode {
        get {
            guard let raw = UserDefaults.standard.string(forKey: storageKey),
                  let mode = TranscriptionMode(rawValue: raw) else { return .afterTake }
            return mode
        }
        set { UserDefaults.standard.set(newValue.rawValue, forKey: storageKey) }
    }
}
