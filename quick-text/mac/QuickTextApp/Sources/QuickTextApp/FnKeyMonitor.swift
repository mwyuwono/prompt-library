import AppKit
import Carbon

/// Pure hold/tap state machine behind the Quick Dictate trigger. Fed by the
/// Fn/Globe event tap and by the Opt-Shift-D Carbon fallback alike, so both
/// triggers behave identically and the logic is testable without events.
///
/// - Hold: press starts recording; release after `tapThreshold` finishes.
/// - Tap: a release inside `tapThreshold` switches to hands-free; the next
///   tap finishes.
/// - Fn used as a modifier (any other key while held) cancels silently.
/// - Esc cancels from any active state.
struct TriggerGestureRecognizer {
    enum Output: Equatable {
        case begin
        case finish
        case enterHandsFree
        case cancel
    }

    enum Phase: Equatable {
        case idle
        case pressed(at: TimeInterval)
        case handsFree
        case handsFreePressed
    }

    static let defaultTapThreshold: TimeInterval = 0.3

    var tapThreshold: TimeInterval = defaultTapThreshold
    private(set) var phase: Phase = .idle

    mutating func triggerDown(at time: TimeInterval) -> Output? {
        switch phase {
        case .idle:
            phase = .pressed(at: time)
            return .begin
        case .handsFree:
            phase = .handsFreePressed
            return nil
        case .pressed, .handsFreePressed:
            return nil
        }
    }

    mutating func triggerUp(at time: TimeInterval) -> Output? {
        switch phase {
        case .pressed(let start):
            if time - start < tapThreshold {
                phase = .handsFree
                return .enterHandsFree
            }
            phase = .idle
            return .finish
        case .handsFreePressed:
            phase = .idle
            return .finish
        case .idle, .handsFree:
            return nil
        }
    }

    mutating func otherKeyDown(isEscape: Bool) -> Output? {
        switch phase {
        case .idle:
            return nil
        case .pressed:
            phase = .idle
            return .cancel
        case .handsFree:
            guard isEscape else { return nil }
            phase = .idle
            return .cancel
        case .handsFreePressed:
            if isEscape {
                phase = .idle
                return .cancel
            }
            // Fn+key while hands-free (e.g. Fn+arrow): leave the take running.
            phase = .handsFree
            return nil
        }
    }

    /// Externally driven stop/cancel (pill buttons, menu, errors).
    mutating func reset() { phase = .idle }

    /// A take started elsewhere (menu bar) so the next trigger tap finishes it.
    mutating func adoptHandsFree() { phase = .handsFree }
}

/// Listen-only Fn/Globe key tap. Needs Input Monitoring; `start()` returns
/// false when it isn't granted so the caller can rely on the Carbon fallback.
final class FnKeyMonitor {
    /// kVK_Function: the Fn/Globe key's flagsChanged keycode.
    static let functionKeyCode: Int64 = 63
    static let escapeKeyCode: Int64 = 53

    var onTriggerDown: () -> Void = {}
    var onTriggerUp: () -> Void = {}
    var onOtherKeyDown: (_ isEscape: Bool) -> Void = { _ in }

    private var tap: CFMachPort?
    private var runLoopSource: CFRunLoopSource?
    private var fnDown = false

    static var hasInputMonitoringAccess: Bool { CGPreflightListenEventAccess() }

    @discardableResult
    static func requestInputMonitoringAccess() -> Bool { CGRequestListenEventAccess() }

    var isRunning: Bool { tap != nil }

    @discardableResult
    func start() -> Bool {
        guard tap == nil else { return true }
        guard Self.hasInputMonitoringAccess else { return false }
        let mask = (1 << CGEventType.flagsChanged.rawValue) | (1 << CGEventType.keyDown.rawValue)
        let callback: CGEventTapCallBack = { _, type, event, userInfo in
            guard let userInfo else { return Unmanaged.passUnretained(event) }
            let monitor = Unmanaged<FnKeyMonitor>.fromOpaque(userInfo).takeUnretainedValue()
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
        fnDown = false
    }

    private func handle(type: CGEventType, event: CGEvent) {
        switch type {
        case .tapDisabledByTimeout, .tapDisabledByUserInput:
            if let tap { CGEvent.tapEnable(tap: tap, enable: true) }
        case .flagsChanged:
            let keyCode = event.getIntegerValueField(.keyboardEventKeycode)
            if keyCode == Self.functionKeyCode {
                let isDown = event.flags.contains(.maskSecondaryFn)
                guard isDown != fnDown else { return }
                fnDown = isDown
                isDown ? onTriggerDown() : onTriggerUp()
            } else if fnDown {
                // Another modifier joined Fn (Fn+Shift…): a shortcut, not dictation.
                let modifiers: CGEventFlags = [.maskCommand, .maskControl, .maskAlternate, .maskShift]
                if !event.flags.intersection(modifiers).isEmpty { onOtherKeyDown(false) }
            }
        case .keyDown:
            let keyCode = event.getIntegerValueField(.keyboardEventKeycode)
            onOtherKeyDown(keyCode == Self.escapeKeyCode)
        default:
            break
        }
    }

    // MARK: - System Globe-key setting

    /// System Settings › Keyboard › "Press 🌐 key to". Anything other than
    /// "Do Nothing" (0) makes macOS act on the same press Quick Dictate uses.
    static var globeKeyUsage: Int? {
        UserDefaults(suiteName: "com.apple.HIToolbox")?.object(forKey: "AppleFnUsageType") as? Int
    }

    static var globeKeyConflicts: Bool { (globeKeyUsage ?? 0) != 0 }
}
