import AppKit
import AVFoundation

/// Plays the short success chime whenever a prompt is copied to the clipboard.
enum CopySound {
    private static var player: AVAudioPlayer?

    static func play() {
        guard let url = soundURL else { return }
        do {
            player = try AVAudioPlayer(contentsOf: url)
            player?.prepareToPlay()
            player?.play()
        } catch {
            // Fallback to NSSound if AVAudioPlayer fails (e.g. codec issue).
            if let sound = NSSound(contentsOf: url, byReference: false) {
                sound.play()
            }
        }
    }

    private static var soundURL: URL? {
        // SwiftPM resource bundle (swift run / swift build)
        if let url = Bundle.module.url(forResource: "success", withExtension: "mp3") {
            return url
        }
        // App bundle Resources (Quick Text.app)
        if let url = Bundle.main.url(forResource: "success", withExtension: "mp3") {
            return url
        }
        // Direct .app Resources path when Bundle.main lookup misses (e.g. preview)
        if let resources = Bundle.main.resourceURL {
            let direct = resources.appendingPathComponent("success.mp3")
            if FileManager.default.fileExists(atPath: direct.path) { return direct }
        }
        return nil
    }
}
