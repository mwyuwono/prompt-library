import Carbon
import SwiftUI

@main
struct QuickTextApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    @StateObject private var store = CorpusStore()
    /// The Dictate page's session. Owned at app level (not by ContentView) so
    /// Quick Dictate can hand takes to it.
    @StateObject private var dictateSession = DictateSession()
    @Environment(\.openWindow) private var openWindow

    var body: some Scene {
        WindowGroup(id: "main") {
            ContentView()
                .environmentObject(store)
                .environmentObject(dictateSession)
                .frame(minWidth: 900, minHeight: 600)
                .onAppear {
                    appDelegate.store = store
                    appDelegate.dictateSession = dictateSession
                    // Lets AppDelegate.openWindow() recreate the window if the user
                    // closed it — NSApp.windows alone can't do that, only the SwiftUI
                    // environment's openWindow action can (**verify** on device).
                    appDelegate.reopenWindow = { openWindow(id: "main") }
                }
        }
        // Full-bleed layout: the sidebar runs under the traffic lights and the
        // library header replaces the toolbar.
        .windowStyle(.hiddenTitleBar)
        .windowBackgroundDragBehavior(.enabled)
        .defaultSize(width: 1280, height: 900)
        .commands {
            CommandGroup(after: .newItem) {
                Button("New Snippet") { store.beginNewPhrase() }
                    .keyboardShortcut("n", modifiers: .command)
                Button("Edit Selected Snippet") { store.beginEditingSelectedPhrase() }
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

        MenuBarExtra("Quick Text", systemImage: "character.textbox.badge.sparkles") {
            Button("Open Quick Text") { AppDelegate.openWindow() }
            Button("Open Dictate") {
                AppDelegate.openWindow()
                DispatchQueue.main.async {
                    NotificationCenter.default.post(name: .quickTextOpenDictate, object: nil)
                }
            }
            Button("Quick Dictate") { appDelegate.quickDictate.toggleHandsFree() }
            Button("Copy Last Dictation") { appDelegate.quickDictate.copyLast() }
            Button("New Phrase") {
                AppDelegate.openWindow()
                store.beginNewPhrase()
            }
            Divider()
            Button("Quit") { NSApp.terminate(nil) }
        }
    }
}

@MainActor
final class AppDelegate: NSObject, NSApplicationDelegate {
    weak var store: CorpusStore?
    weak var dictateSession: DictateSession?
    /// System-wide dictation (Fn/Globe or Opt-Shift-D), see QuickDictateController.
    lazy var quickDictate: QuickDictateController = {
        let controller = QuickDictateController()
        controller.storeProvider = { [weak self] in self?.store }
        controller.mainSessionProvider = { [weak self] in self?.dictateSession }
        controller.openDictate = {
            AppDelegate.openWindow()
            DispatchQueue.main.async {
                NotificationCenter.default.post(name: .quickTextOpenDictate, object: nil)
            }
        }
        return controller
    }()
    /// Set by `QuickTextApp.body`'s `onAppear` so the static `openWindow()` below can
    /// recreate the WindowGroup's window when none is eligible to reuse.
    var reopenWindow: (() -> Void)?
    static weak var shared: AppDelegate?
    private var hotKeyRef: EventHotKeyRef?
    private var dictateHotKeyRef: EventHotKeyRef?
    private var eventHandler: EventHandlerRef?

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.regular)
        AppAppearance.current.apply()
        Self.shared = self
        applyDockIcon()
        registerHotKey()
        quickDictate.refreshFnMonitor()
    }

    /// Picks up an Input Monitoring grant made while the app was in the background.
    func applicationDidBecomeActive(_ notification: Notification) {
        quickDictate.refreshFnMonitor()
    }

    /// Dock-only icon override: the txt artwork replaces the Dock (and
    /// Cmd-Tab) tile at runtime. The bundle `.icns` — what Finder shows —
    /// and the MenuBarExtra SF Symbol are left untouched.
    private func applyDockIcon() {
        guard let url = Bundle.main.url(forResource: "DockIcon", withExtension: "png"),
              let image = NSImage(contentsOf: url) else { return }
        NSApp.applicationIconImage = image
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
            // (**verify**: confirm Opt-Shift-Space restores the window after close).
            shared?.reopenWindow?()
        }
        NotificationCenter.default.post(name: .quickTextFocusSearch, object: nil)
    }

    private func registerHotKey() {
        let hotKeyID = EventHotKeyID(signature: OSType("QTXT".fourCharCodeValue), id: 1)
        let modifiers = UInt32(optionKey | shiftKey)
        RegisterEventHotKey(49, modifiers, hotKeyID, GetApplicationEventTarget(), 0, &hotKeyRef)
        // Opt-Shift-D: Quick Dictate fallback that needs no Input Monitoring.
        // Press and release both feed the same hold/tap recognizer as Fn.
        let dictateID = EventHotKeyID(signature: OSType("QTXT".fourCharCodeValue), id: 2)
        RegisterEventHotKey(UInt32(kVK_ANSI_D), modifiers, dictateID, GetApplicationEventTarget(), 0, &dictateHotKeyRef)

        var eventTypes = [
            EventTypeSpec(eventClass: OSType(kEventClassKeyboard), eventKind: UInt32(kEventHotKeyPressed)),
            EventTypeSpec(eventClass: OSType(kEventClassKeyboard), eventKind: UInt32(kEventHotKeyReleased))
        ]
        InstallEventHandler(GetApplicationEventTarget(), { _, event, _ in
            var hotKeyID = EventHotKeyID()
            GetEventParameter(event, EventParamName(kEventParamDirectObject), EventParamType(typeEventHotKeyID), nil, MemoryLayout<EventHotKeyID>.size, nil, &hotKeyID)
            let pressed = GetEventKind(event) == UInt32(kEventHotKeyPressed)
            switch hotKeyID.id {
            case 1 where pressed:
                DispatchQueue.main.async { AppDelegate.openWindow() }
            case 2:
                DispatchQueue.main.async {
                    guard let controller = AppDelegate.shared?.quickDictate else { return }
                    pressed ? controller.triggerDown() : controller.triggerUp()
                }
            default:
                break
            }
            return noErr
        }, eventTypes.count, &eventTypes, nil, &eventHandler)
    }
}

extension Notification.Name {
    static let quickTextOpenDictate = Notification.Name("quickTextOpenDictate")
    static let quickTextFocusSearch = Notification.Name("quickTextFocusSearch")
    static let quickTextShowKeyboardShortcuts = Notification.Name("quickTextShowKeyboardShortcuts")
    static let quickTextShowGlossary = Notification.Name("quickTextShowGlossary")
}

