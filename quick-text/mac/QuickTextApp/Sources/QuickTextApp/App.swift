import Carbon
import SwiftUI

struct QuickTextApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    @StateObject private var store = CorpusStore()
    @Environment(\.openWindow) private var openWindow

    var body: some Scene {
        WindowGroup(id: "main") {
            ContentView()
                .environmentObject(store)
                .frame(minWidth: 720, minHeight: 520)
                .onAppear {
                    appDelegate.store = store
                    // Lets AppDelegate.openWindow() recreate the window if the user
                    // closed it — NSApp.windows alone can't do that, only the SwiftUI
                    // environment's openWindow action can (**verify** on device).
                    appDelegate.reopenWindow = { openWindow(id: "main") }
                }
        }
        .commands {
            CommandGroup(after: .newItem) {
                Button("New Phrase") { store.beginNewPhrase() }
                    .keyboardShortcut("n", modifiers: .command)
                Button("Edit Selected Phrase") { store.beginEditingSelectedPhrase() }
                    .keyboardShortcut("e", modifiers: .command)
            }
            CommandGroup(after: .help) {
                Button("Keyboard Shortcuts") {
                    AppDelegate.openWindow()
                    DispatchQueue.main.async {
                        NotificationCenter.default.post(name: .quickTextShowKeyboardShortcuts, object: nil)
                    }
                }
                Button("Quick Text Glossary") {
                    AppDelegate.openWindow()
                    DispatchQueue.main.async {
                        NotificationCenter.default.post(name: .quickTextShowGlossary, object: nil)
                    }
                }
            }
        }

        MenuBarExtra("Quick Text", systemImage: "text.badge.plus") {
            Button("Open Quick Text") { AppDelegate.openWindow() }
            Button("New Phrase") {
                AppDelegate.openWindow()
                store.beginNewPhrase()
            }
            Divider()
            Button("Quit") { NSApp.terminate(nil) }
        }
    }
}

final class AppDelegate: NSObject, NSApplicationDelegate {
    weak var store: CorpusStore?
    /// Set by `QuickTextApp.body`'s `onAppear` so the static `openWindow()` below can
    /// recreate the WindowGroup's window when none is eligible to reuse.
    var reopenWindow: (() -> Void)?
    static weak var shared: AppDelegate?
    private var hotKeyRef: EventHotKeyRef?
    private var eventHandler: EventHandlerRef?

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.regular)
        Self.shared = self
        registerHotKey()
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        false
    }

    static func openWindow() {
        NSApp.activate(ignoringOtherApps: true)
        // `.first` was fragile with the MenuBarExtra and popovers/panels in play;
        // require a real, key-able content window rather than grabbing whatever
        // happens to be first in NSApp.windows.
        if let window = NSApp.windows.first(where: { $0.canBecomeKey && !($0 is NSPanel) }) {
            window.makeKeyAndOrderFront(nil)
        } else {
            // User closed the window — recreate it via the SwiftUI environment
            // (**verify**: confirm Cmd-Shift-Space restores the window after close).
            shared?.reopenWindow?()
        }
        NotificationCenter.default.post(name: .quickTextFocusSearch, object: nil)
    }

    private func registerHotKey() {
        let hotKeyID = EventHotKeyID(signature: OSType("QTXT".fourCharCodeValue), id: 1)
        let modifiers = UInt32(cmdKey | shiftKey)
        RegisterEventHotKey(49, modifiers, hotKeyID, GetApplicationEventTarget(), 0, &hotKeyRef)

        var eventType = EventTypeSpec(eventClass: OSType(kEventClassKeyboard), eventKind: UInt32(kEventHotKeyPressed))
        InstallEventHandler(GetApplicationEventTarget(), { _, event, _ in
            var hotKeyID = EventHotKeyID()
            GetEventParameter(event, EventParamName(kEventParamDirectObject), EventParamType(typeEventHotKeyID), nil, MemoryLayout<EventHotKeyID>.size, nil, &hotKeyID)
            if hotKeyID.id == 1 {
                DispatchQueue.main.async { AppDelegate.openWindow() }
            }
            return noErr
        }, 1, &eventType, nil, &eventHandler)
    }
}

extension Notification.Name {
    static let quickTextFocusSearch = Notification.Name("quickTextFocusSearch")
    static let quickTextShowKeyboardShortcuts = Notification.Name("quickTextShowKeyboardShortcuts")
    static let quickTextShowGlossary = Notification.Name("quickTextShowGlossary")
}

