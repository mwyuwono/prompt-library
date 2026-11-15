import AppKit

/// Double-tap Right Command to open Quick Text.
///
/// Listens with a listen-only CGEvent tap for solitary Right Command taps:
/// press + release within `maxTapDuration`, two such taps within
/// `doubleTapThreshold`, with no other key between. A hold, a shortcut
/// (Right Command + another key), or a slow pair does not fire.
///
/// Needs Input Monitoring. `start()` returns false when not granted so the
/// caller can keep the existing Opt-Shift-Space Carbon hotkey as fallback.
/// Pure state machine for solitary Right Command double-tap.
/// Testable without CGEvents: feed `down(at:)` / `up(at:)` / `cancel()`.
struct RightCommandDoubleTapRecognizer {
    /// Maximum time a single press may be held and still count as a tap.
    var maxTapDuration: TimeInterval = 0.35
    /// Maximum gap between the first tap's release and the second tap's press.
    var doubleTapThreshold: TimeInterval = 0.35

    enum Phase: Equatable {
        case idle
        case firstDown(at: TimeInterval)
        case waitingSecondTap(firstUpAt: TimeInterval)
        case secondDown(at: TimeInterval)
    }

    private(set) var phase: Phase = .idle

    /// Returns true when the second tap completes a valid double-tap.
    @discardableResult
    mutating func down(at now: TimeInterval) -> Bool {
        switch phase {
        case .idle:
            phase = .firstDown(at: now)
        case .waitingSecondTap(let firstUpAt):
            if now - firstUpAt <= doubleTapThreshold {
                phase = .secondDown(at: now)
            } else {
                phase = .firstDown(at: now)
            }
        case .firstDown, .secondDown:
            phase = .firstDown(at: now)
        }
        return false
    }

    /// Returns true when this up completes a valid double-tap.
    @discardableResult
    mutating func up(at now: TimeInterval) -> Bool {
        switch phase {
        case .firstDown(let downAt):
            if now - downAt <= maxTapDuration {
                phase = .waitingSecondTap(firstUpAt: now)
            } else {
                phase = .idle
            }
            return false
        case .secondDown(let downAt):
            if now - downAt <= maxTapDuration {
                phase = .idle
                return true
            }
            phase = .idle
            return false
        case .idle, .waitingSecondTap:
            phase = .idle
            return false
        }
    }

    mutating func cancel() { phase = .idle }

    mutating func reset() { phase = .idle }
}

final class RightCommandDoubleTapMonitor {
    var onDoubleTap: () -> Void = {}

    // kVK_RightCommand = 54, kVK_Command = 55
    private static let rightCommandKeyCode: Int64 = 54

    var recognizer = RightCommandDoubleTapRecognizer()
    private var phase: RightCommandDoubleTapRecognizer.Phase { recognizer.phase }
    private var isRightCommandDown = false
    private var tap: CFMachPort?
    private var runLoopSource: CFRunLoopSource?

    static var hasInputMonitoringAccess: Bool { CGPreflightListenEventAccess() }

    var isRunning: Bool { tap != nil }

    @discardableResult
    func start() -> Bool {
        guard tap == nil else { return true }
        guard Self.hasInputMonitoringAccess else { return false }
        let mask = (1 << CGEventType.flagsChanged.rawValue) | (1 << CGEventType.keyDown.rawValue)
        let callback: CGEventTapCallBack = { _, type, event, userInfo in
            guard let userInfo else { return Unmanaged.passUnretained(event) }
            let monitor = Unmanaged<RightCommandDoubleTapMonitor>.fromOpaque(userInfo).takeUnretainedValue()
            monitor.handle(type: type, event: event)
            return Unmanaged.passUnretained(event)
        }
        guard let tap = CGEvent.tapCreate(
            tap: .cgSessionEventTap,
            place: .headInsertEventTap,
            options: .listenOnly,
            eventsOfInterest: CGEventMask(mask),
            callback: callback,
            userInfo: Unmanaged.passUnretained(self).toOpaque()
        ) else { return false }
        let source = CFMachPortCreateRunLoopSource(kCFAllocatorDefault, tap, 0)
        CFRunLoopAddSource(CFRunLoopGetMain(), source, .commonModes)
        CGEvent.tapEnable(tap: tap, enable: true)
        self.tap = tap
        runLoopSource = source
        return true
    }

    func stop() {
        if let tap { CGEvent.tapEnable(tap: tap, enable: false) }
        if let runLoopSource { CFRunLoopRemoveSource(CFRunLoopGetMain(), runLoopSource, .commonModes) }
        tap = nil
        runLoopSource = nil
        isRightCommandDown = false
        recognizer.reset()
    }

    /// Attempt to start; if Input Monitoring is missing, prompts once.
    @discardableResult
    func refresh() -> Bool {
        if isRunning { return true }
        if start() { return true }
        // Prompt the system dialog if never asked before.
        _ = CGRequestListenEventAccess()
        return false
    }

    private func handle(type: CGEventType, event: CGEvent) {
        switch type {
        case .tapDisabledByTimeout, .tapDisabledByUserInput:
            if let tap { CGEvent.tapEnable(tap: tap, enable: true) }
        case .flagsChanged:
            let keyCode = event.getIntegerValueField(.keyboardEventKeycode)
            if keyCode == Self.rightCommandKeyCode {
                let isDown = event.flags.contains(.maskCommand)
                guard isDown != isRightCommandDown else { return }
                isRightCommandDown = isDown
                let now = Date().timeIntervalSinceReferenceDate
                if isDown {
                    recognizer.down(at: now)
                } else if recognizer.up(at: now) {
                    DispatchQueue.main.async { [weak self] in self?.onDoubleTap() }
                }
            } else if isRightCommandDown {
                recognizer.cancel()
            } else if case .waitingSecondTap = recognizer.phase {
                recognizer.cancel()
            }
        case .keyDown:
            if isRightCommandDown {
                recognizer.cancel()
            } else {
                switch recognizer.phase {
                case .waitingSecondTap, .firstDown, .secondDown:
                    recognizer.cancel()
                case .idle:
                    break
                }
            }
        default:
            break
        }
    }
}
