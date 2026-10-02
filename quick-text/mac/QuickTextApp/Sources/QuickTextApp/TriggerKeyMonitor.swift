import AppKit
import Carbon

/// Pure hold/tap state machine behind the Quick Dictate trigger. Fed by the
/// trigger-key event tap and by the Opt-Shift-D Carbon fallback alike, so both
/// triggers behave identically and the logic is testable without events.
///
/// - Hold: press starts recording; release after `tapThreshold` finishes.
/// - Tap: a release inside `tapThreshold` switches to hands-free; the next
///   tap finishes.
/// - The trigger used as a modifier (any other key while held) cancels silently.
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
            // Trigger+key while hands-free (e.g. Fn+arrow): leave the take running.
            phase = .handsFree
            return nil
        }
    }

    /// Externally driven stop/cancel (pill buttons, menu, errors).
    mutating func reset() { phase = .idle }

    /// A take started elsewhere (menu bar) so the next trigger tap finishes it.
    mutating func adoptHandsFree() { phase = .handsFree }
}

/// The single key Quick Dictate listens for. Both arrive as flagsChanged
/// events, so either works with a listen-only tap.
enum QuickDictateTriggerKey: String, CaseIterable, Identifiable {
    /// Right Option alone. Reaches every app on any keyboard, unlike Fn,
    /// which external keyboards keep to themselves and system services
    /// (Siri, Gemini) may intercept.
    case rightOption
    case fn
    /// No key trigger: Opt-Shift-D and the menu bar only.
    case none

    var id: String { rawValue }

    var title: String {
        switch self {
        case .rightOption: return "Right Option"
        case .fn: return "Fn/Globe"
        case .none: return "None (Opt-Shift-D only)"
        }
    }

    var keyCode: Int64? {
        switch self {
        case .rightOption: return 61 // kVK_RightOption
        case .fn: return 63 // kVK_Function
        case .none: return nil
        }
    }

    /// The modifier flag a held trigger adds to every other key event.
    var modifierFlag: CGEventFlags {
        switch self {
        case .rightOption: return .maskAlternate
        case .fn, .none: return .maskSecondaryFn
        }
    }

    /// NX_DEVICERALTKEYMASK: distinguishes Right Option from Left Option,
    /// which share `.maskAlternate`.
    private static let rightOptionDeviceMask: UInt64 = 0x40

    func isDown(_ flags: CGEventFlags) -> Bool {
        switch self {
        case .rightOption: return flags.rawValue & Self.rightOptionDeviceMask != 0
        case .fn: return flags.contains(.maskSecondaryFn)
        case .none: return false
        }
    }
}

/// Listen-only tap for the trigger key. Needs Input Monitoring; `start()`
/// returns false when it isn't granted so the caller can rely on the Carbon
/// fallback.
final class TriggerKeyMonitor {
    static let escapeKeyCode: Int64 = 53

    var onTriggerDown: () -> Void = {}
    var onTriggerUp: () -> Void = {}
    var onOtherKeyDown: (_ isEscape: Bool) -> Void = { _ in }

    var triggerKey: QuickDictateTriggerKey = .rightOption {
        didSet { if triggerKey != oldValue { triggerDown = false } }
    }

    private var tap: CFMachPort?
    private var runLoopSource: CFRunLoopSource?
    private var triggerDown = false

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
            let monitor = Unmanaged<TriggerKeyMonitor>.fromOpaque(userInfo).takeUnretainedValue()
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
        triggerDown = false
    }

    private func handle(type: CGEventType, event: CGEvent) {
        switch type {
        case .tapDisabledByTimeout, .tapDisabledByUserInput:
            if let tap { CGEvent.tapEnable(tap: tap, enable: true) }
        case .flagsChanged:
            let keyCode = event.getIntegerValueField(.keyboardEventKeycode)
            if keyCode == triggerKey.keyCode {
                let isDown = triggerKey.isDown(event.flags)
                guard isDown != triggerDown else { return }
                triggerDown = isDown
                isDown ? onTriggerDown() : onTriggerUp()
            } else if triggerDown, Self.otherModifierJoined(event.flags, trigger: triggerKey) {
                // Another modifier joined the trigger (e.g. Right Option+Cmd): a shortcut, not dictation.
                onOtherKeyDown(false)
            }
        case .keyDown:
            let keyCode = event.getIntegerValueField(.keyboardEventKeycode)
            if let isEscape = Self.classifyKeyDown(keyCode: keyCode, flags: event.flags, trigger: triggerKey) {
                onOtherKeyDown(isEscape)
            }
        default:
            break
        }
    }

    static func otherModifierJoined(_ flags: CGEventFlags, trigger: QuickDictateTriggerKey) -> Bool {
        let others = CGEventFlags([.maskCommand, .maskControl, .maskAlternate, .maskShift])
            .subtracting(trigger.modifierFlag)
        return !flags.intersection(others).isEmpty
    }

    /// Which key presses count while dictating: Esc always; any other key
    /// only when it carries the trigger's modifier flag, i.e. the user is
    /// really holding the trigger as a modifier (Right Option+E for é).
    /// Keystrokes other apps synthesize (Gemini posts Cmd-C on Fn) carry no
    /// such flag and must not cancel the take. Returns nil to ignore.
    static func classifyKeyDown(keyCode: Int64, flags: CGEventFlags, trigger: QuickDictateTriggerKey) -> Bool? {
        if keyCode == escapeKeyCode { return true }
        return flags.contains(trigger.modifierFlag) ? false : nil
    }

}

/// Fn-specific system conflicts, surfaced in Settings when Fn is the trigger.
enum FnKeyConflicts {

    /// System Settings › Keyboard › "Press 🌐 key to". Anything other than
    /// "Do Nothing" (0) makes macOS act on the same press Quick Dictate uses.
    static var globeKeyUsage: Int? {
        UserDefaults(suiteName: "com.apple.HIToolbox")?.object(forKey: "AppleFnUsageType") as? Int
    }

    static var globeKeyConflicts: Bool { (globeKeyUsage ?? 0) != 0 }

    /// macOS Dictation on with its keyboard shortcut enabled (symbolic hot
    /// key 164) also answers Fn presses, typing its own transcript and
    /// competing for the mic.
    static var systemDictationConflicts: Bool {
        guard UserDefaults(suiteName: "com.apple.assistant.support")?.bool(forKey: "Dictation Enabled") == true else { return false }
        let hotKeys = UserDefaults(suiteName: "com.apple.symbolichotkeys")?.dictionary(forKey: "AppleSymbolicHotKeys")
        let dictation = hotKeys?["164"] as? [String: Any]
        return (dictation?["enabled"] as? Bool) ?? (dictation?["enabled"] as? Int == 1)
    }
}
