import AppKit
import ApplicationServices
import Carbon

/// Full copy of a pasteboard's items, so Quick Dictate can borrow the
/// clipboard for a paste and hand the user's contents back afterwards.
struct PasteboardSnapshot {
    private let items: [[NSPasteboard.PasteboardType: Data]]

    init(_ pasteboard: NSPasteboard) {
        items = (pasteboard.pasteboardItems ?? []).map { item in
            var entry: [NSPasteboard.PasteboardType: Data] = [:]
            for type in item.types {
                if let data = item.data(forType: type) { entry[type] = data }
            }
            return entry
        }
    }

    var isEmpty: Bool { items.isEmpty }

    func restore(to pasteboard: NSPasteboard) {
        pasteboard.clearContents()
        let restored = items.map { entry -> NSPasteboardItem in
            let item = NSPasteboardItem()
            for (type, data) in entry { item.setData(data, forType: type) }
            return item
        }
        if !restored.isEmpty { pasteboard.writeObjects(restored) }
    }
}

/// Delivers Quick Dictate text to the app that was frontmost when dictation
/// began: paste at the cursor (Wispr Flow's approach — works in native,
/// browser, Electron, and terminal apps), else the clipboard.
@MainActor
enum TextInserter {
    struct Target {
        let app: NSRunningApplication?
        let isSecureField: Bool
    }

    enum Outcome: Equatable {
        case inserted
        case copied(reason: String?)
    }

    /// kVK_ANSI_V
    private static let vKeyCode: CGKeyCode = 9
    /// Long enough for the target to read the pasteboard before it's restored.
    static let restoreDelay: Duration = .milliseconds(350)

    static var isAccessibilityTrusted: Bool { AXIsProcessTrusted() }

    static func requestAccessibilityAccess() {
        let options = ["AXTrustedCheckOptionPrompt": true] as CFDictionary
        _ = AXIsProcessTrustedWithOptions(options)
    }

    /// Call before showing any UI so the target is the user's app, not ours.
    static func captureTarget() -> Target {
        let app = NSWorkspace.shared.frontmostApplication
        return Target(app: app, isSecureField: focusedElementIsSecure())
    }

    static func deliver(_ text: String, to target: Target, insert: Bool) async -> Outcome {
        guard insert else {
            copy(text)
            return .copied(reason: nil)
        }
        guard isAccessibilityTrusted else {
            copy(text)
            return .copied(reason: "Allow Accessibility to insert at the cursor.")
        }
        // Secure Event Input is system-wide and can be enabled by another app;
        // only the captured field's accessibility subrole identifies a password target.
        if target.isSecureField {
            copy(text)
            return .copied(reason: "Password field — copied instead.")
        }
        if let app = target.app, app.processIdentifier != ProcessInfo.processInfo.processIdentifier,
           NSWorkspace.shared.frontmostApplication?.processIdentifier != app.processIdentifier {
            app.activate()
            try? await Task.sleep(for: .milliseconds(120))
        }
        await paste(text)
        return .inserted
    }

    static func copy(_ text: String) {
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(text, forType: .string)
    }

    /// Borrow the clipboard for Cmd-V, then restore it unless something else
    /// wrote to it in the meantime.
    static func paste(_ text: String, pasteboard: NSPasteboard = .general) async {
        let snapshot = PasteboardSnapshot(pasteboard)
        pasteboard.clearContents()
        pasteboard.setString(text, forType: .string)
        let ourChange = pasteboard.changeCount
        postCommandV()
        try? await Task.sleep(for: restoreDelay)
        restoreIfUnchanged(snapshot, ourChangeCount: ourChange, pasteboard: pasteboard)
    }

    /// Restores only when the pasteboard still holds our text, so a copy the
    /// user made during the delay is never clobbered.
    static func restoreIfUnchanged(_ snapshot: PasteboardSnapshot, ourChangeCount: Int, pasteboard: NSPasteboard) {
        guard pasteboard.changeCount == ourChangeCount else { return }
        snapshot.restore(to: pasteboard)
    }

    private static func postCommandV() {
        let source = CGEventSource(stateID: .combinedSessionState)
        let down = CGEvent(keyboardEventSource: source, virtualKey: vKeyCode, keyDown: true)
        let up = CGEvent(keyboardEventSource: source, virtualKey: vKeyCode, keyDown: false)
        down?.flags = .maskCommand
        up?.flags = .maskCommand
        down?.post(tap: .cghidEventTap)
        up?.post(tap: .cghidEventTap)
    }

    private static func focusedElementIsSecure() -> Bool {
        guard isAccessibilityTrusted else { return false }
        let system = AXUIElementCreateSystemWide()
        var focused: CFTypeRef?
        guard AXUIElementCopyAttributeValue(system, kAXFocusedUIElementAttribute as CFString, &focused) == .success,
              let focused, CFGetTypeID(focused) == AXUIElementGetTypeID() else { return false }
        let element = focused as! AXUIElement
        var subrole: CFTypeRef?
        guard AXUIElementCopyAttributeValue(element, kAXSubroleAttribute as CFString, &subrole) == .success else { return false }
        return (subrole as? String) == (kAXSecureTextFieldSubrole as String)
    }
}
