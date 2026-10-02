import Foundation
import os

/// Release-path timing for Quick Dictate. `mark("release")` starts a trace;
/// every later mark logs milliseconds since then. View with:
/// `log stream --predicate 'subsystem == "com.weaveryuwono.quicktext" && category == "latency"'`
enum LatencyTrace {
    private static let logger = Logger(subsystem: "com.weaveryuwono.quicktext", category: "latency")
    private static let origin = OSAllocatedUnfairLock<UInt64?>(initialState: nil)

    static func mark(_ name: String, _ detail: String = "") {
        let now = DispatchTime.now().uptimeNanoseconds
        let start = origin.withLock { state -> UInt64 in
            if name == "release" { state = now }
            return state ?? now
        }
        let ms = Double(now &- start) / 1_000_000
        logger.notice("+\(ms, format: .fixed(precision: 0), privacy: .public)ms \(name, privacy: .public) \(detail, privacy: .public)")
    }
}
