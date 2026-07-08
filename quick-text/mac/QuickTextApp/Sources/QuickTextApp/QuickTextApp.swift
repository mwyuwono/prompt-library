import Carbon
import SwiftUI
import UniformTypeIdentifiers

@main
struct QuickTextApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    @StateObject private var store = CorpusStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(store)
                .frame(minWidth: 720, minHeight: 520)
                .onAppear {
                    appDelegate.store = store
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
    private var hotKeyRef: EventHotKeyRef?
    private var eventHandler: EventHandlerRef?

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.regular)
        registerHotKey()
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        false
    }

    static func openWindow() {
        NSApp.activate(ignoringOtherApps: true)
        if let window = NSApp.windows.first {
            window.makeKeyAndOrderFront(nil)
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

#Preview("Content View") {
    ContentView()
        .environmentObject(PreviewData.store)
        .frame(width: 720, height: 520)
}

/// The three top-level keyboard-navigable regions. Tab cycles between these;
/// arrow keys navigate *within* whichever one is focused.
private enum FocusModule: Int, CaseIterable {
    case categories, search, cards
}

/// Inline neighbors within the search module, navigated with left/right
/// arrows once the search module has focus.
private enum SearchInlineItem: Int, CaseIterable {
    case searchField, newButton, variablesButton, settingsButton
}

struct ContentView: View {
    @EnvironmentObject private var store: CorpusStore
    @FocusState private var searchFocused: Bool
    @State private var showingSettings = false
    @State private var settingsPanelOffset = CGSize.zero
    @State private var settingsPanelDragOffset = CGSize.zero
    @State private var showingVariablesLibrary = false
    @State private var variablesPanelOffset = CGSize.zero
    @State private var variablesPanelDragOffset = CGSize.zero
    @State private var showingKeyboardShortcuts = false
    @State private var shortcutsPanelOffset = CGSize.zero
    @State private var shortcutsPanelDragOffset = CGSize.zero
    @State private var showingGlossary = false
    @State private var glossaryPanelOffset = CGSize.zero
    @State private var glossaryPanelDragOffset = CGSize.zero
    @State private var savedWindowFrame: NSRect?
    @State private var gridWidth: CGFloat = 0
    @State private var keyMonitor: Any?
    @State private var focusedModule: FocusModule = .search
    @State private var searchInlineFocus: SearchInlineItem = .searchField

    private let gridSpacing: CGFloat = 10

    private var cardWidth: CGFloat {
        CGFloat(store.corpus.settings.cardWidth ?? Settings.defaultCardWidth)
    }

    private var gridColumnCount: Int {
        max(Int((max(gridWidth, cardWidth) + gridSpacing) / (cardWidth + gridSpacing)), 1)
    }

    private var currentWindowWidth: CGFloat {
        NSApp.keyWindow?.contentLayoutRect.width ?? 720
    }

    private var standardPanelWidth: CGFloat {
        min(max(currentWindowWidth * 0.6, 420), currentWindowWidth * 0.9)
    }

    private var settingsPanelWidth: CGFloat {
        min(max(currentWindowWidth * 0.6, 560), currentWindowWidth * 0.9)
    }

    private var showVariablesLibraryButton: Bool {
        store.corpus.settings.showVariablesLibraryButton ?? Settings.defaultShowVariablesLibraryButton
    }

    private var activeSearchInlineItems: [SearchInlineItem] {
        SearchInlineItem.allCases.filter { item in
            item != .variablesButton || showVariablesLibraryButton
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            categoryTabs

            searchModuleRow

            GeometryReader { geometry in
                ScrollView {
                    MasonryGrid(columnWidth: cardWidth, spacing: gridSpacing) {
                        ForEach(Array(store.filteredPhrases.enumerated()), id: \.element.id) { index, phrase in
                            let category = store.category(for: phrase.categoryId)
                            TileView(
                                phrase: phrase,
                                imageURL: store.imageURL(for: phrase.image),
                                backgroundColor: store.color(for: phrase.color ?? category?.color ?? store.corpus.settings.defaultTileColor),
                                textColor: store.color(for: phrase.textColor ?? category?.textColor ?? store.corpus.settings.defaultTextColor),
                                fontSize: store.corpus.settings.defaultFontSize,
                                fontFamily: store.corpus.settings.defaultFontFamily,
                                cardWidth: cardWidth,
                                isSelected: store.selectedPhraseID == phrase.id,
                                isCopied: store.copiedPhraseID == phrase.id,
                                highlightColor: store.highlightColor
                            )
                            .onTapGesture {
                                store.selectedPhraseID = phrase.id
                                store.expandedPhraseID = phrase.id
                                store.exitCategoryFocus()
                                setFocusedModule(.cards)
                            }
                            .contextMenu {
                                Button("Copy") { store.copy(phrase) }
                                Button("Preview") { store.expandedPhraseID = phrase.id }
                                Button("Edit") { store.beginEditing(phrase) }
                                Button("Duplicate") { store.duplicate(phrase) }
                                Button("Delete", role: .destructive) { store.delete(phrase) }
                            }
                            // Drag-to-reorder: live-reorders `corpus.phrases` while dragging
                            // (mirrors List's onMove), then persists on drop.
                            .onDrag {
                                store.draggedPhraseID = phrase.id
                                return NSItemProvider(object: phrase.id as NSString)
                            }
                            .onDrop(of: [.text], delegate: PhraseDropDelegate(target: phrase, store: store))
                        }
                    }
                    .padding(.vertical, 2)
                }
                .onAppear { gridWidth = geometry.size.width }
                .onChange(of: geometry.size.width) { _, width in gridWidth = width }
            }
            .padding(.top, 10)
            .background(
                RoundedRectangle(cornerRadius: 14)
                    .fill(focusedModule == .cards ? store.highlightColor.opacity(0.06) : Color.clear)
            )
            .contextMenu { gridContextMenu }
        }
        .padding(14)
        .background(store.gridBackgroundColor)
        .onAppear {
            store.load()
            installKeyMonitor()
            focusSearchSoon()
        }
        .onDisappear { removeKeyMonitor() }
        .onReceive(NotificationCenter.default.publisher(for: .quickTextFocusSearch)) { _ in
            guard store.editingPhrase == nil, !showingSettings, !showingVariablesLibrary, !showingKeyboardShortcuts, !showingGlossary else { return }
            focusSearchSoon()
        }
        .onReceive(NotificationCenter.default.publisher(for: .quickTextShowKeyboardShortcuts)) { _ in
            guard store.editingPhrase == nil else { return }
            openKeyboardShortcutsPanel()
        }
        .onReceive(NotificationCenter.default.publisher(for: .quickTextShowGlossary)) { _ in
            guard store.editingPhrase == nil else { return }
            openGlossaryPanel()
        }
        .onChange(of: store.searchTerm) { _, _ in
            store.searchTermDidChange()
        }
        .onChange(of: searchFocused) { _, focused in
            if focused {
                focusedModule = .search
                searchInlineFocus = .searchField
            }
        }
        .onExitCommand {
            handleEscape()
        }
        .sheet(item: $store.editingPhrase) { phrase in
            PhraseEditor(phrase: phrase)
                .environmentObject(store)
        }
        .toolbar {
            Button(action: { searchFocused = true }) {
                Label("Search", systemImage: "magnifyingglass")
            }
            .keyboardShortcut("f", modifiers: .command)
            Button(action: copySelected) {
                Label("Copy", systemImage: "doc.on.doc")
            }
            .keyboardShortcut("c", modifiers: .command)
        }
        .overlay {
            if let phrase = store.expandedPhrase {
                ExpandedOverlayView(store: store, phrase: phrase)
            }
        }
        .overlay(alignment: .topTrailing) {
            if showingSettings {
                FloatingPanel(
                    onClose: closeFloatingPanels,
                    onDragEnded: {
                        settingsPanelOffset.width += settingsPanelDragOffset.width
                        settingsPanelOffset.height += settingsPanelDragOffset.height
                        settingsPanelDragOffset = .zero
                    },
                    dragOffset: $settingsPanelDragOffset
                ) {
                    SettingsEditor(width: settingsPanelWidth)
                        .environmentObject(store)
                }
                .offset(
                    x: settingsPanelOffset.width + settingsPanelDragOffset.width,
                    y: settingsPanelOffset.height + settingsPanelDragOffset.height
                )
                .padding(.top, 54)
                .padding(.trailing, 8)
                .zIndex(2)
            }
        }
        .overlay(alignment: .topTrailing) {
            if showingVariablesLibrary {
                FloatingPanel(
                    title: "Variables Library",
                    systemImage: "curlybraces",
                    onClose: closeFloatingPanels,
                    onDragEnded: {
                        variablesPanelOffset.width += variablesPanelDragOffset.width
                        variablesPanelOffset.height += variablesPanelDragOffset.height
                        variablesPanelDragOffset = .zero
                    },
                    dragOffset: $variablesPanelDragOffset
                ) {
                    VariablesLibraryEditor()
                        .environmentObject(store)
                }
                .offset(
                    x: variablesPanelOffset.width + variablesPanelDragOffset.width,
                    y: variablesPanelOffset.height + variablesPanelDragOffset.height
                )
                .padding(.top, 54)
                .padding(.trailing, 8)
                .zIndex(2)
            }
        }
        .overlay(alignment: .topTrailing) {
            if showingKeyboardShortcuts {
                FloatingPanel(
                    title: "Keyboard Shortcuts",
                    systemImage: "keyboard",
                    onClose: closeFloatingPanels,
                    onDragEnded: {
                        shortcutsPanelOffset.width += shortcutsPanelDragOffset.width
                        shortcutsPanelOffset.height += shortcutsPanelDragOffset.height
                        shortcutsPanelDragOffset = .zero
                    },
                    dragOffset: $shortcutsPanelDragOffset
                ) {
                    KeyboardShortcutsView(width: standardPanelWidth)
                }
                .offset(
                    x: shortcutsPanelOffset.width + shortcutsPanelDragOffset.width,
                    y: shortcutsPanelOffset.height + shortcutsPanelDragOffset.height
                )
                .padding(.top, 54)
                .padding(.trailing, 8)
                .zIndex(3)
            }
        }
        .overlay(alignment: .topTrailing) {
            if showingGlossary {
                FloatingPanel(
                    title: "Glossary",
                    systemImage: "questionmark.circle",
                    onClose: closeFloatingPanels,
                    onDragEnded: {
                        glossaryPanelOffset.width += glossaryPanelDragOffset.width
                        glossaryPanelOffset.height += glossaryPanelDragOffset.height
                        glossaryPanelDragOffset = .zero
                    },
                    dragOffset: $glossaryPanelDragOffset
                ) {
                    GlossaryView(width: standardPanelWidth)
                }
                .offset(
                    x: glossaryPanelOffset.width + glossaryPanelDragOffset.width,
                    y: glossaryPanelOffset.height + glossaryPanelDragOffset.height
                )
                .padding(.top, 54)
                .padding(.trailing, 8)
                .zIndex(4)
            }
        }
        .onChange(of: store.expandedPhraseID) { _, newValue in
            resizeWindowForExpansion(expanding: newValue != nil)
        }
    }

    private var searchField: some View {
        HStack(spacing: 8) {
            Image(systemName: "magnifyingglass")
                .foregroundStyle(.secondary)
            TextField("Search", text: $store.searchTerm)
                .textFieldStyle(.plain)
                .focused($searchFocused)
                .focusEffectDisabled()
                .onSubmit { copySelected() }
            if !store.searchTerm.isEmpty {
                Button {
                    store.clearSearch()
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundStyle(.secondary)
                        .font(.system(size: 17, weight: .semibold))
                        .frame(width: 34, height: 34)
                        .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .frame(minHeight: 44)
        .glassEffect(.regular, in: Capsule())
        .overlay(
            Capsule()
                .stroke(searchFocused ? store.highlightColor : Color.primary.opacity(0.15), lineWidth: searchFocused ? 2 : 1)
        )
    }

    /// Search field plus its inline neighbors (New/Variables/Settings), treated
    /// as one keyboard-navigable module — left/right arrows move between them.
    private var searchModuleRow: some View {
        HStack(spacing: 10) {
            searchField
            moduleButton(icon: "plus", label: "New", item: .newButton) {
                store.beginNewPhrase()
            }
            if showVariablesLibraryButton {
                moduleButton(icon: "curlybraces", label: "Variables", item: .variablesButton) {
                    openVariablesPanel()
                }
            }
            moduleButton(icon: "slider.horizontal.3", label: "Settings", item: .settingsButton) {
                openSettingsPanel()
            }
        }
        .padding(6)
        .background(
            RoundedRectangle(cornerRadius: 14)
                .fill(focusedModule == .search ? store.highlightColor.opacity(0.06) : Color.clear)
        )
    }

    private func moduleButton(icon: String, label: String, item: SearchInlineItem, action: @escaping () -> Void) -> some View {
        let isFocused = focusedModule == .search && searchInlineFocus == item
        return Button {
            action()
            focusedModule = .search
            searchInlineFocus = item
            searchFocused = false
        } label: {
            Label(label, systemImage: icon)
        }
        .buttonStyle(.glass)
        .background(
            Capsule().fill(isFocused ? store.highlightColor.opacity(0.35) : Color.clear)
        )
    }

    /// Expands the window to ~80% of the display when a card expands, since the
    /// expanded card overlay fills the window rather than floating independently.
    /// Unanimated both ways so expand/collapse feel instant rather than laggy.
    private func resizeWindowForExpansion(expanding: Bool) {
        guard let window = NSApp.keyWindow ?? NSApp.windows.first else { return }
        if expanding {
            guard savedWindowFrame == nil else { return }
            savedWindowFrame = window.frame
            if let screen = window.screen ?? NSScreen.main {
                let visible = screen.visibleFrame
                let size = NSSize(width: visible.width * 0.8, height: visible.height * 0.8)
                let origin = NSPoint(x: visible.midX - size.width / 2, y: visible.midY - size.height / 2)
                window.setFrame(NSRect(origin: origin, size: size), display: true, animate: false)
            }
        } else if let frame = savedWindowFrame {
            window.setFrame(frame, display: true, animate: false)
            savedWindowFrame = nil
        }
    }

    private var categoryTabs: some View {
        HStack(spacing: 6) {
            ForEach(store.tabs, id: \.id) { tab in
                CategoryTabButton(
                    title: tab.name,
                    isSelected: store.isTabSelected(tab.id),
                    background: store.categoryTabBackground(for: tab, isSelected: store.isTabSelected(tab.id))
                ) {
                    store.selectTab(tab.id)
                    setFocusedModule(.categories)
                }
            }
        }
        .padding(6)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(focusedModule == .categories ? store.highlightColor.opacity(0.12) : Color.clear)
        )
    }

    private func openSelected() {
        if let phrase = store.selectedPhrase {
            store.expandedPhraseID = phrase.id
            store.exitCategoryFocus()
        }
    }

    private func copySelected() {
        if let phrase = store.selectedPhrase {
            store.copy(phrase)
        }
    }

    @ViewBuilder
    private var gridContextMenu: some View {
        Button("New Phrase") { store.beginNewPhrase() }
        Button("Edit Selected Phrase") { store.beginEditingSelectedPhrase() }
            .disabled(store.selectedPhrase == nil)
        Button("Copy Selected") { copySelected() }
            .disabled(store.selectedPhrase == nil)
        Divider()
        Button("Variables Library") { openVariablesPanel() }
        Button("Settings") { openSettingsPanel() }
    }

    private var isEditingText: Bool {
        return NSApp.keyWindow?.firstResponder is NSTextView
    }

    private var canUseGridKeyboard: Bool {
        store.expandedPhraseID == nil && !showingSettings && !showingVariablesLibrary && !showingKeyboardShortcuts && !showingGlossary && store.editingPhrase == nil && !searchFocused && !isEditingText
    }

    private func openSettingsPanel() {
        showingVariablesLibrary = false
        showingKeyboardShortcuts = false
        showingGlossary = false
        showingSettings = true
    }

    private func openVariablesPanel() {
        showingSettings = false
        showingKeyboardShortcuts = false
        showingGlossary = false
        showingVariablesLibrary = true
    }

    private func openKeyboardShortcutsPanel() {
        showingSettings = false
        showingVariablesLibrary = false
        showingGlossary = false
        showingKeyboardShortcuts = true
    }

    private func openGlossaryPanel() {
        showingSettings = false
        showingVariablesLibrary = false
        showingKeyboardShortcuts = false
        showingGlossary = true
    }

    private func closeFloatingPanels() {
        showingSettings = false
        showingVariablesLibrary = false
        showingKeyboardShortcuts = false
        showingGlossary = false
    }

    private func focusSearchSoon() {
        DispatchQueue.main.async {
            setFocusedModule(.search)
        }
    }

    /// Switches which of the three top-level regions has keyboard focus,
    /// applying each module's "entry" default (search field ready to type,
    /// a card always selected once the grid is focused).
    private func setFocusedModule(_ module: FocusModule) {
        focusedModule = module
        switch module {
        case .categories:
            searchFocused = false
        case .search:
            searchInlineFocus = .searchField
            searchFocused = true
        case .cards:
            searchFocused = false
            if store.selectedPhraseID == nil || !store.filteredPhrases.contains(where: { $0.id == store.selectedPhraseID }) {
                store.selectedPhraseID = store.filteredPhrases.first?.id
            }
        }
    }

    private func advanceFocusedModule(reverse: Bool) {
        let all = FocusModule.allCases
        guard let index = all.firstIndex(of: focusedModule) else { return }
        let next = all[(index + (reverse ? -1 : 1) + all.count) % all.count]
        setFocusedModule(next)
    }

    private func moveSearchInlineFocus(_ delta: Int) {
        let all = activeSearchInlineItems
        guard let index = all.firstIndex(of: searchInlineFocus) else { return }
        let nextIndex = min(max(index + delta, 0), all.count - 1)
        searchInlineFocus = all[nextIndex]
        searchFocused = (searchInlineFocus == .searchField)
    }

    private func activateSearchInlineItem() -> Bool {
        switch searchInlineFocus {
        case .searchField:
            return false
        case .newButton:
            store.beginNewPhrase()
            return true
        case .variablesButton:
            openVariablesPanel()
            return true
        case .settingsButton:
            openSettingsPanel()
            return true
        }
    }

    private func installKeyMonitor() {
        guard keyMonitor == nil else { return }
        keyMonitor = NSEvent.addLocalMonitorForEvents(matching: .keyDown) { event in
            handleKeyEvent(event)
        }
    }

    private func removeKeyMonitor() {
        if let keyMonitor {
            NSEvent.removeMonitor(keyMonitor)
            self.keyMonitor = nil
        }
    }

    private func handleKeyEvent(_ event: NSEvent) -> NSEvent? {
        guard event.modifierFlags.intersection([.command, .option, .control]).isEmpty else { return event }
        if event.keyCode == 53 {
            if showingSettings || showingVariablesLibrary || showingKeyboardShortcuts || showingGlossary || store.expandedPhraseID != nil || !store.searchTerm.isEmpty || store.categoryFocusMode {
                handleEscape()
                return nil
            }
            return event
        }
        guard store.editingPhrase == nil, !showingSettings, !showingVariablesLibrary, !showingKeyboardShortcuts, !showingGlossary else { return event }
        guard store.expandedPhraseID == nil else { return event }

        switch event.keyCode {
        case 48: // Tab
            advanceFocusedModule(reverse: event.modifierFlags.contains(.shift))
            return nil
        case 53: // Escape
            handleEscape()
            return nil
        case 123: // Left
            return handleHorizontal(-1) ? nil : event
        case 124: // Right
            return handleHorizontal(1) ? nil : event
        case 125: // Down
            return handleDown() ? nil : event
        case 126: // Up
            return handleUp() ? nil : event
        case 49: // Space
            return handleSpace() ? nil : event
        case 36, 76: // Return
            return handleReturn() ? nil : event
        default:
            return event
        }
    }

    /// Left/right: in-module navigation for categories and the search row;
    /// left/right selection movement within the cards grid.
    private func handleHorizontal(_ delta: Int) -> Bool {
        switch focusedModule {
        case .categories:
            store.moveCategoryFocus(delta)
            return true
        case .search:
            // Let the text field own left/right for cursor movement once there's
            // something to edit; only hijack for inline-item navigation when the
            // field is empty (nothing for the caret to move through).
            guard searchInlineFocus != .searchField || store.searchTerm.isEmpty else { return false }
            moveSearchInlineFocus(delta)
            return true
        case .cards:
            guard canUseGridKeyboard else { return false }
            store.moveSelection(delta)
            return true
        }
    }

    /// Down always hands off from categories/search to the cards grid;
    /// within the grid it moves selection down a row.
    private func handleDown() -> Bool {
        switch focusedModule {
        case .categories, .search:
            setFocusedModule(.cards)
            return true
        case .cards:
            guard canUseGridKeyboard else { return false }
            store.moveSelection(gridColumnCount)
            return true
        }
    }

    private func handleUp() -> Bool {
        guard focusedModule == .cards, canUseGridKeyboard else { return false }
        store.moveSelection(-gridColumnCount)
        return true
    }

    private func handleSpace() -> Bool {
        switch focusedModule {
        case .categories:
            return false
        case .search:
            return activateSearchInlineItem()
        case .cards:
            guard canUseGridKeyboard else { return false }
            openSelected()
            return true
        }
    }

    private func handleReturn() -> Bool {
        switch focusedModule {
        case .categories:
            return false
        case .search:
            return activateSearchInlineItem()
        case .cards:
            guard canUseGridKeyboard else { return false }
            copySelected()
            return true
        }
    }

    private func handleEscape() {
        if showingGlossary || showingKeyboardShortcuts || showingSettings || showingVariablesLibrary {
            closeFloatingPanels()
        } else if store.expandedPhraseID != nil {
            store.collapseExpanded()
        } else if !store.searchTerm.isEmpty {
            store.clearSearch()
            setFocusedModule(.search)
        } else if store.categoryFocusMode {
            store.exitCategoryFocus()
        }
    }
}

struct CategoryTabButton: View {
    let title: String
    let isSelected: Bool
    let background: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.caption.weight(.semibold))
                .foregroundStyle(isSelected ? Color.white : .primary)
                .lineLimit(1)
                .padding(.horizontal, 12)
                .padding(.vertical, 7)
                .background {
                    Capsule()
                        .fill(isSelected ? background.opacity(0.78) : Color(nsColor: .windowBackgroundColor).opacity(0.18))
                        .background(.ultraThinMaterial, in: Capsule())
                }
        }
        .buttonStyle(.plain)
    }
}

/// Generic floating card used for both the Settings panel and the Variables Library
/// panel — same header/close/drag chrome, just a different title/icon and content.
struct FloatingPanel<Content: View>: View {
    var title: String = "Settings"
    var systemImage: String = "slider.horizontal.3"
    let onClose: () -> Void
    let onDragEnded: () -> Void
    @Binding var dragOffset: CGSize
    @ViewBuilder let content: Content

    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 8) {
                Image(systemName: systemImage)
                    .foregroundStyle(.secondary)
                Text(title)
                    .font(.headline)
                Spacer()
                Button(action: onClose) {
                    Image(systemName: "xmark")
                        .frame(width: 28, height: 28)
                }
                .buttonStyle(.plain)
                .help("Close")
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .contentShape(Rectangle())
            .gesture(
                DragGesture()
                    .onChanged { dragOffset = $0.translation }
                    .onEnded { _ in onDragEnded() }
            )

            Divider()
            content
        }
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 14))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(Color.primary.opacity(0.12), lineWidth: 1)
        )
        .shadow(color: .black.opacity(0.28), radius: 24, y: 12)
    }
}

struct KeyboardShortcutsView: View {
    let width: CGFloat

    private let sections: [ShortcutSection] = [
        ShortcutSection(
            title: "App",
            shortcuts: [
                ShortcutItem(keys: "Cmd-Shift-Space", action: "Open Quick Text"),
                ShortcutItem(keys: "Cmd-N", action: "New phrase"),
                ShortcutItem(keys: "Cmd-E", action: "Edit selected phrase"),
                ShortcutItem(keys: "Cmd-F", action: "Focus search"),
                ShortcutItem(keys: "Cmd-C", action: "Copy selected phrase")
            ]
        ),
        ShortcutSection(
            title: "Navigation",
            shortcuts: [
                ShortcutItem(keys: "Tab / Shift-Tab", action: "Move between categories, search row, and cards"),
                ShortcutItem(keys: "Arrow keys", action: "Move within the focused area"),
                ShortcutItem(keys: "Space", action: "Open the selected card"),
                ShortcutItem(keys: "Return", action: "Copy the selected phrase"),
                ShortcutItem(keys: "Escape", action: "Close help/settings panels, close expanded cards, or clear search")
            ]
        ),
        ShortcutSection(
            title: "Expanded Cards",
            shortcuts: [
                ShortcutItem(keys: "Click chip", action: "Copy or edit that atom or variable"),
                ShortcutItem(keys: "Shift-click atoms", action: "Select multiple atoms and copy them in document order"),
                ShortcutItem(keys: "Space / Return", action: "Copy the full expanded card"),
                ShortcutItem(keys: "Escape", action: "Close the expanded card")
            ]
        )
    ]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                Text("Quick reference for keyboard and pointer actions.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                ForEach(sections) { section in
                    VStack(alignment: .leading, spacing: 10) {
                        Text(section.title)
                            .font(.headline)
                        ForEach(section.shortcuts) { shortcut in
                            HStack(alignment: .firstTextBaseline, spacing: 12) {
                                Text(shortcut.keys)
                                    .font(.caption.monospaced().weight(.semibold))
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 4)
                                    .background(Color(nsColor: .windowBackgroundColor).opacity(0.32), in: RoundedRectangle(cornerRadius: 6))
                                    .frame(width: 140, alignment: .leading)
                                Text(shortcut.action)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                                    .fixedSize(horizontal: false, vertical: true)
                            }
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
            }
            .padding(18)
        }
        .frame(width: width)
        .frame(minHeight: 360, maxHeight: 620)
    }
}

struct ShortcutSection: Identifiable {
    let id = UUID()
    let title: String
    let shortcuts: [ShortcutItem]
}

struct ShortcutItem: Identifiable {
    let id = UUID()
    let keys: String
    let action: String
}

struct GlossaryView: View {
    let width: CGFloat

    private let sections: [GlossarySection] = [
        GlossarySection(
            title: "Core Objects",
            terms: [
                GlossaryTerm(name: "Phrase", definition: "A saved reusable text item. This is the canonical name for what the app stores and copies."),
                GlossaryTerm(name: "Card", definition: "The visual tile for a phrase in the main grid."),
                GlossaryTerm(name: "Expanded card", definition: "The large preview and copy surface that opens when a phrase needs atoms, variables, or a full-text preview."),
                GlossaryTerm(name: "Value", definition: "The full stored text of a phrase. Full-card copy uses the value, with filled variables substituted."),
                GlossaryTerm(name: "Category", definition: "A group used to filter and color phrases.")
            ]
        ),
        GlossarySection(
            title: "Copy Parts",
            terms: [
                GlossaryTerm(name: "Atom", definition: "A fixed slice of a phrase value that can be copied on its own. Atoms copy literal text and do not change when variables are filled."),
                GlossaryTerm(name: "Atom chip", definition: "The clickable chip shown for an atom inside an expanded card."),
                GlossaryTerm(name: "Full copy", definition: "Copying the phrase value as a whole instead of copying one atom or chip.")
            ]
        ),
        GlossarySection(
            title: "Variables",
            terms: [
                GlossaryTerm(name: "Inline variable", definition: "A phrase-local fill-in placeholder written as {{name}}."),
                GlossaryTerm(name: "Choice variable", definition: "A phrase-local option picker written as {{option one/option two}}."),
                GlossaryTerm(name: "Library variable", definition: "A shared variable referenced from phrases with {{@name}} and managed in the Variables Library."),
                GlossaryTerm(name: "Value variable", definition: "A library variable with a fixed stored value that substitutes automatically. Use this term instead of atomic variable."),
                GlossaryTerm(name: "Variable chip", definition: "The clickable fill-in or display chip for a variable inside an expanded card."),
                GlossaryTerm(name: "Unresolved variable", definition: "A {{@name}} reference that no longer matches a library variable. It copies through as literal text until fixed.")
            ]
        ),
        GlossarySection(
            title: "Visibility",
            terms: [
                GlossaryTerm(name: "Private", definition: "Kept in the local corpus and not included in the public export."),
                GlossaryTerm(name: "Public", definition: "Included when generating the public Quick Text corpus."),
                GlossaryTerm(name: "Favorite", definition: "A phrase pinned into the Favorites tab.")
            ]
        )
    ]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                Text("Shared terminology for Quick Text authoring and support.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                ForEach(sections) { section in
                    VStack(alignment: .leading, spacing: 10) {
                        Text(section.title)
                            .font(.headline)
                        ForEach(section.terms) { term in
                            VStack(alignment: .leading, spacing: 3) {
                                Text(term.name)
                                    .font(.subheadline.weight(.semibold))
                                Text(term.definition)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                                    .fixedSize(horizontal: false, vertical: true)
                            }
                            .padding(.vertical, 2)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
            }
            .padding(18)
        }
        .frame(width: width)
        .frame(minHeight: 420, maxHeight: 640)
    }
}

struct GlossarySection: Identifiable {
    let id = UUID()
    let title: String
    let terms: [GlossaryTerm]
}

struct GlossaryTerm: Identifiable {
    let id = UUID()
    let name: String
    let definition: String
}

/// Shared "Copied" feedback for every copy action in the app (tiles, atom chips,
/// expanded-card copies): pops in fast, then fades out rapidly. Whole interaction
/// stays under `CorpusStore.copyFeedbackDuration` plus this animation's tail.
struct CopiedBadge: View {
    let isVisible: Bool
    var color: Color = .primary

    var body: some View {
        VStack {
            Spacer(minLength: 0)
            Text("Copied")
                .font(.system(size: 40, weight: .heavy, design: .rounded))
                .foregroundStyle(color)
                .padding(.horizontal, 26)
                .padding(.vertical, 12)
                .glassEffect(.regular, in: Capsule())
                .scaleEffect(isVisible ? 1 : 0.5)
                .opacity(isVisible ? 1 : 0)
                .animation(isVisible ? .spring(response: 0.16, dampingFraction: 0.6) : .easeOut(duration: 0.22), value: isVisible)
                .padding(.bottom, 18)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .allowsHitTesting(false)
    }
}

/// Live-reorders the grid while dragging (mirrors List's onMove UX), then
/// persists the new order to disk once the drop completes.
struct PhraseDropDelegate: DropDelegate {
    let target: Phrase
    let store: CorpusStore

    func dropEntered(info: DropInfo) {
        guard let draggedID = store.draggedPhraseID, draggedID != target.id else { return }
        withAnimation(.default) {
            store.movePhrase(draggedID, before: target.id)
        }
    }

    func performDrop(info: DropInfo) -> Bool {
        store.finishReorder()
        return true
    }
}

struct MasonryGrid: Layout {
    let columnWidth: CGFloat
    let spacing: CGFloat

    private struct ItemPlacement {
        let size: CGSize
        let origin: CGPoint
    }

    private func layout(in width: CGFloat, subviews: Subviews) -> (placements: [ItemPlacement], size: CGSize) {
        let availableWidth = max(width, columnWidth)
        let columnCount = max(Int((availableWidth + spacing) / (columnWidth + spacing)), 1)
        let actualColumnWidth = (availableWidth - (CGFloat(columnCount - 1) * spacing)) / CGFloat(columnCount)
        var columnHeights = Array(repeating: CGFloat.zero, count: columnCount)
        var placements: [ItemPlacement] = []

        for subview in subviews {
            let size = subview.sizeThatFits(ProposedViewSize(width: actualColumnWidth, height: nil))
            let columnIndex = columnHeights.enumerated().min { $0.element < $1.element }?.offset ?? 0
            let origin = CGPoint(
                x: CGFloat(columnIndex) * (actualColumnWidth + spacing),
                y: columnHeights[columnIndex]
            )
            placements.append(ItemPlacement(size: CGSize(width: actualColumnWidth, height: size.height), origin: origin))
            columnHeights[columnIndex] += size.height + spacing
        }

        let height = max((columnHeights.max() ?? 0) - spacing, 0)
        return (placements, CGSize(width: availableWidth, height: height))
    }

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        layout(in: proposal.width ?? columnWidth, subviews: subviews).size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let placements = layout(in: bounds.width, subviews: subviews).placements
        for (placement, subview) in zip(placements, subviews) {
            subview.place(
                at: CGPoint(x: bounds.minX + placement.origin.x, y: bounds.minY + placement.origin.y),
                proposal: ProposedViewSize(width: placement.size.width, height: placement.size.height)
            )
        }
    }
}

struct TileView: View {
    let phrase: Phrase
    let imageURL: URL?
    let backgroundColor: Color
    let textColor: Color
    let fontSize: Int
    let fontFamily: String
    var cardWidth: CGFloat = Settings.defaultCardWidth
    let isSelected: Bool
    let isCopied: Bool
    var highlightColor: Color = Color(hex: Settings.defaultHighlightColor)

    // Keeps the tile's proportions consistent as the card-size slider changes
    // (112/164 matches the original fixed tile dimensions).
    private var tileMinHeight: CGFloat { cardWidth * (112.0 / 164.0) }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            if let imageURL {
                PhrasePreviewImage(url: imageURL)
            }
            HStack(alignment: .firstTextBaseline, spacing: 6) {
                Text(phrase.summary?.isEmpty == false ? phrase.summary! : phrase.title)
                    .font(tileFont)
                    .foregroundStyle(isSelected ? highlightColor.readableForeground : textColor)
                    .lineLimit(imageURL == nil ? 4 : 3)
                    .minimumScaleFactor(0.72)
                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity, alignment: .topLeading)
        }
        .padding(12)
        .frame(minHeight: tileMinHeight, alignment: .topLeading)
        .background(isSelected ? highlightColor : backgroundColor)
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(isSelected ? highlightColor : Color.clear, lineWidth: 3)
        )
        .clipShape(RoundedRectangle(cornerRadius: 8))
        .overlay {
            CopiedBadge(isVisible: isCopied, color: highlightColor)
        }
    }

    private var tileFont: Font {
        if fontFamily == "serif" {
            return .custom("Palatino", size: CGFloat(fontSize)).weight(.bold)
        }
        return .system(size: CGFloat(fontSize), weight: .bold)
    }
}

struct PhrasePreviewImage: View {
    let url: URL

    var body: some View {
        Group {
            if url.isFileURL, let image = NSImage(contentsOf: url) {
                Image(nsImage: image)
                    .resizable()
                    .scaledToFill()
            } else {
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .success(let image):
                        image.resizable().scaledToFill()
                    case .failure:
                        previewFallback(systemName: "photo.badge.exclamationmark")
                    case .empty:
                        previewFallback(systemName: "photo")
                    @unknown default:
                        previewFallback(systemName: "photo")
                    }
                }
            }
        }
        .aspectRatio(16.0 / 9.0, contentMode: .fit)
        .frame(maxWidth: .infinity)
        .clipShape(RoundedRectangle(cornerRadius: 6))
        .overlay(
            RoundedRectangle(cornerRadius: 6)
                .stroke(Color.black.opacity(0.16), lineWidth: 1)
        )
    }

    private func previewFallback(systemName: String) -> some View {
        ZStack {
            Color.black.opacity(0.14)
            Image(systemName: systemName)
                .font(.title3)
                .foregroundStyle(.secondary)
        }
    }
}

#Preview("Tile - Plain") {
    TileView(
        phrase: PreviewData.plainPhrase,
        imageURL: nil,
        backgroundColor: Color(hex: "#2E301D"),
        textColor: Color(hex: "#E2D6CF"),
        fontSize: 18,
        fontFamily: "sans",
        isSelected: false,
        isCopied: false
    )
    .frame(width: 200, height: 112)
    .padding()
}

#Preview("Tile - Atomic") {
    TileView(
        phrase: PreviewData.addressPhrase,
        imageURL: nil,
        backgroundColor: Color(hex: "#2E301D"),
        textColor: Color(hex: "#E2D6CF"),
        fontSize: 18,
        fontFamily: "sans",
        isSelected: false,
        isCopied: false
    )
    .frame(width: 200, height: 112)
    .padding()
}

struct PhraseEditor: View {
    @EnvironmentObject private var store: CorpusStore
    @Environment(\.dismiss) private var dismiss
    @State var phrase: Phrase
    @State private var atoms: [Atom] = []
    @State private var selectedRange = NSRange(location: 0, length: 0)
    @State private var editingColorTarget: ColorEditTarget?
    @State private var showingInsertVariable = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                field("Title") {
                    TextField("Title", text: $phrase.title)
                        .textFieldStyle(.roundedBorder)
                }

                field("Summary") {
                    TextField("Summary", text: stringBinding($phrase.summary, replacingNilWith: ""))
                        .textFieldStyle(.roundedBorder)
                }

                field("Preview image (16:9 path or URL)") {
                    TextField("Preview image (16:9 path or URL)", text: stringBinding($phrase.image, replacingNilWith: ""))
                        .textFieldStyle(.roundedBorder)
                }

                field("Category") {
                    Picker("Category", selection: $phrase.categoryId) {
                        ForEach(store.corpus.categories) { category in
                            Text(category.name).tag(category.id)
                        }
                    }
                    .labelsHidden()
                    .frame(maxWidth: 320, alignment: .leading)
                }

                field("Value") {
                    VStack(alignment: .leading, spacing: 6) {
                        HStack {
                            Spacer()
                            Button {
                                showingInsertVariable = true
                            } label: {
                                Label("Insert Variable", systemImage: "curlybraces")
                            }
                            .buttonStyle(.glass)
                            .popover(isPresented: $showingInsertVariable, arrowEdge: .top) {
                                InsertVariablePopover(
                                    libraryVariables: store.libraryVariables,
                                    onInsertExisting: { variable in
                                        insertAtCursor("{{@\(variable.name)}}")
                                        showingInsertVariable = false
                                    },
                                    onCreateAndInsert: { name, type, options, value in
                                        let created = store.addLibraryVariable(name: name, type: type, options: options, value: value)
                                        insertAtCursor("{{@\(created.name)}}")
                                        showingInsertVariable = false
                                    }
                                )
                            }
                        }
                        SelectableTextEditor(text: $phrase.value, selectedRange: $selectedRange)
                            .frame(minHeight: 180)
                            .overlay(RoundedRectangle(cornerRadius: 6).stroke(Color.secondary.opacity(0.3)))
                    }
                }

                editorSection {
                    atomsSection
                    Divider()
                    variablesSection
                }

                HStack(alignment: .top, spacing: 14) {
                    ColorSwatchField(
                        title: "Background",
                        selection: stringBinding($phrase.color, replacingNilWith: store.corpus.settings.defaultTileColor),
                        colors: store.palette.colors,
                        isEditing: colorEditingBinding(for: .background)
                    )
                    ColorSwatchField(
                        title: "Text",
                        selection: stringBinding($phrase.textColor, replacingNilWith: store.corpus.settings.defaultTextColor),
                        colors: store.palette.colors,
                        isEditing: colorEditingBinding(for: .text)
                    )
                }

                field("Tags") {
                    TextField("Tags", text: Binding(
                        get: { phrase.tags.joined(separator: ", ") },
                        set: { phrase.tags = $0.split(separator: ",").map { $0.trimmingCharacters(in: .whitespaces) }.filter { !$0.isEmpty } }
                    ))
                    .textFieldStyle(.roundedBorder)
                }

                HStack(alignment: .center, spacing: 18) {
                    Toggle("Favorite", isOn: $phrase.favorite)
                    field("Visibility") {
                        Picker("Visibility", selection: $phrase.visibility) {
                            ForEach(Visibility.allCases, id: \.self) { visibility in
                                Text(visibility.rawValue).tag(visibility)
                            }
                        }
                        .labelsHidden()
                        .frame(maxWidth: 180, alignment: .leading)
                    }
                }

                HStack {
                    Button("Cancel") { dismiss() }
                        .buttonStyle(.glass)
                    Spacer()
                    Button("Save") {
                        phrase.atoms = atoms.isEmpty ? nil : atoms
                        store.save(phrase)
                        dismiss()
                    }
                    .buttonStyle(.glassProminent)
                    .disabled(phrase.title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || phrase.value.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
            .padding(24)
        }
        .frame(minWidth: 560, idealWidth: editorWidth, maxWidth: editorWidth)
        .frame(minHeight: 500, idealHeight: 680, maxHeight: 760)
        .onAppear { atoms = phrase.atoms ?? [] }
    }

    private var editorWidth: CGFloat {
        let candidate = (NSApp.mainWindow?.contentLayoutRect.width ?? 800) * 0.9
        return min(max(candidate, 640), 980)
    }

    private func field<Content: View>(_ title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title).font(.caption).foregroundStyle(.secondary)
            content()
        }
    }

    private func editorSection<Content: View>(@ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            content()
        }
        .padding(12)
        .background(Color(nsColor: .windowBackgroundColor).opacity(0.22), in: RoundedRectangle(cornerRadius: 10))
    }

    private func colorEditingBinding(for target: ColorEditTarget) -> Binding<Bool> {
        Binding(
            get: { editingColorTarget == target },
            set: { editingColorTarget = $0 ? target : (editingColorTarget == target ? nil : editingColorTarget) }
        )
    }

    private var atomsSection: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Atoms (select text above, then Add atom)").font(.caption).foregroundStyle(.secondary)

            Button("Add atom from selection") { addAtomFromSelection() }
                .disabled(selectedRange.length == 0)

            if atoms.isEmpty {
                Text("No atoms yet. This card copies as a single unit.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            } else {
                FlowLayout(spacing: 6) {
                    ForEach(atoms) { atom in
                        atomChip(atom)
                    }
                }
            }
        }
    }

    private var variablesSection: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Variables (fill in when copying, see the expanded card)").font(.caption).foregroundStyle(.secondary)
            let variables = detectedVariables
            if variables.isEmpty {
                Text("No variables detected. Use {{setting}}, {{option one/option two}}, or {{@libraryName}} to reference the Variables Library.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            } else {
                FlowLayout(spacing: 6) {
                    ForEach(variables) { variable in
                        HStack(spacing: 4) {
                            Text(variable.choices?.joined(separator: " / ") ?? variable.displayLabel)
                            if variable.isUnresolved {
                                Image(systemName: "exclamationmark.triangle.fill")
                                    .foregroundStyle(.red)
                                    .help("No library variable named \u{201C}\(variable.displayLabel)\u{201D} — this copies through as literal text.")
                            }
                        }
                        .font(.caption)
                        .lineLimit(1)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(variable.isUnresolved ? Color.red.opacity(0.14) : Color.secondary.opacity(0.14))
                        .clipShape(Capsule())
                    }
                }
            }
        }
    }

    /// Deduplicated by key, since PhraseEditor only needs to list what will be
    /// fillable at copy time — occurrence offsets don't matter here.
    private var detectedVariables: [PhraseVariable] {
        var seen = Set<String>()
        return PhraseVariable.parse(phrase.value, library: store.libraryVariables).filter { seen.insert($0.key).inserted }
    }

    /// Inserts `text` at the current cursor position in the Value field (falls back to
    /// appending if there's no live selection), then moves the cursor to just after it —
    /// used by "Insert Variable" for both the existing-variable and create-new paths.
    private func insertAtCursor(_ text: String) {
        guard let range = Range(selectedRange, in: phrase.value) else {
            phrase.value += text
            return
        }
        phrase.value.replaceSubrange(range, with: text)
        let newCursor = selectedRange.location + (text as NSString).length
        selectedRange = NSRange(location: newCursor, length: 0)
    }

    private func atomChip(_ atom: Atom) -> some View {
        HStack(spacing: 6) {
            Text(atomPreview(atom))
                .font(.caption)
                .lineLimit(1)
                .truncationMode(.tail)
            Button {
                atoms.removeAll { $0.id == atom.id }
            } label: {
                Image(systemName: "xmark.circle.fill")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .buttonStyle(.plain)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(Color.secondary.opacity(0.14))
        .clipShape(Capsule())
    }

    private func atomPreview(_ atom: Atom) -> String {
        let characters = Array(phrase.value)
        guard atom.start >= 0, atom.end <= characters.count, atom.end > atom.start else { return "(invalid range)" }
        return String(characters[atom.start..<atom.end])
    }

    private func addAtomFromSelection() {
        guard selectedRange.length > 0,
              let range = Range(selectedRange, in: phrase.value) else { return }
        let start = phrase.value.distance(from: phrase.value.startIndex, to: range.lowerBound)
        let end = phrase.value.distance(from: phrase.value.startIndex, to: range.upperBound)
        guard end > start else { return }
        // Evict only existing atoms whose range overlaps the new selection;
        // non-overlapping atoms must survive so multiple atoms can accumulate.
        atoms.removeAll { !(end <= $0.start || start >= $0.end) }
        atoms.append(Atom(id: "atom-\(Int(Date().timeIntervalSince1970 * 1000))", start: start, end: end, label: nil))
        atoms.sort { $0.start < $1.start }
    }
}

/// AppKit-backed text editor exposing the live NSTextView selection, since SwiftUI's
/// TextEditor does not surface selection ranges on this project's deployment target.
/// Used by PhraseEditor so admins can select a substring of Value and turn it into an atom.
struct SelectableTextEditor: NSViewRepresentable {
    @Binding var text: String
    @Binding var selectedRange: NSRange

    func makeNSView(context: Context) -> NSScrollView {
        let textView = NSTextView()
        textView.isRichText = false
        textView.isEditable = true
        textView.isSelectable = true
        textView.font = .systemFont(ofSize: 13)
        textView.textContainerInset = NSSize(width: 6, height: 6)
        textView.string = text
        textView.delegate = context.coordinator

        let scrollView = NSScrollView()
        scrollView.hasVerticalScroller = true
        scrollView.documentView = textView
        scrollView.drawsBackground = false
        return scrollView
    }

    func updateNSView(_ nsView: NSScrollView, context: Context) {
        guard let textView = nsView.documentView as? NSTextView else { return }
        if textView.string != text {
            textView.string = text
        }
    }

    func makeCoordinator() -> Coordinator { Coordinator(self) }

    final class Coordinator: NSObject, NSTextViewDelegate {
        var parent: SelectableTextEditor
        init(_ parent: SelectableTextEditor) { self.parent = parent }

        func textDidChange(_ notification: Notification) {
            guard let textView = notification.object as? NSTextView else { return }
            parent.text = textView.string
        }

        func textViewDidChangeSelection(_ notification: Notification) {
            guard let textView = notification.object as? NSTextView else { return }
            parent.selectedRange = textView.selectedRange()
        }
    }
}

/// Authoring flow for `{{@name}}` (see quick-text/README.md "Variable placeholders" ->
/// reusable variable library): either insert an existing library variable by name, or
/// create a new one (name/type/options) and insert it in one step. Typing a plain
/// `{{name}}`/`{{a/b}}` by hand still needs no library interaction at all.
private struct InsertVariablePopover: View {
    enum Mode { case existing, new }

    let libraryVariables: [LibraryVariable]
    let onInsertExisting: (LibraryVariable) -> Void
    let onCreateAndInsert: (_ name: String, _ type: LibraryVariable.Kind, _ options: [String], _ value: String) -> Void

    @State private var mode: Mode = .existing
    @State private var search = ""
    @State private var newName = ""
    @State private var newType: LibraryVariable.Kind = .text
    @State private var newOptionsText = ""
    @State private var newValueText = ""

    private var filtered: [LibraryVariable] {
        let term = search.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        let sorted = libraryVariables.sorted { $0.name.lowercased() < $1.name.lowercased() }
        guard !term.isEmpty else { return sorted }
        return sorted.filter { $0.name.lowercased().contains(term) }
    }

    private var trimmedNewName: String { newName.trimmingCharacters(in: .whitespacesAndNewlines) }

    private var nameCollides: Bool {
        let target = trimmedNewName.lowercased()
        guard !target.isEmpty else { return false }
        return libraryVariables.contains { $0.name.trimmingCharacters(in: .whitespacesAndNewlines).lowercased() == target }
    }

    private var parsedOptions: [String] {
        newOptionsText.split(separator: ",").map { $0.trimmingCharacters(in: .whitespaces) }.filter { !$0.isEmpty }
    }

    private var trimmedNewValue: String { newValueText.trimmingCharacters(in: .whitespacesAndNewlines) }

    private var canCreate: Bool {
        guard !trimmedNewName.isEmpty, !nameCollides else { return false }
        switch newType {
        case .text: return true
        case .choice: return !parsedOptions.isEmpty
        case .value: return !trimmedNewValue.isEmpty
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Picker("", selection: $mode) {
                Text("Existing").tag(Mode.existing)
                Text("New").tag(Mode.new)
            }
            .labelsHidden()
            .pickerStyle(.segmented)

            if mode == .existing {
                existingSection
            } else {
                newSection
            }
        }
        .padding(14)
        .frame(width: 280)
    }

    private var existingSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            TextField("Search variables", text: $search)
                .textFieldStyle(.roundedBorder)
            if libraryVariables.isEmpty {
                Text("No library variables yet. Switch to New to create one.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            } else if filtered.isEmpty {
                Text("No matches.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            } else {
                ScrollView {
                    VStack(alignment: .leading, spacing: 2) {
                        ForEach(filtered) { variable in
                            Button {
                                onInsertExisting(variable)
                            } label: {
                                HStack {
                                    Text(variable.name)
                                    Spacer()
                                    Text(variableTypeLabel(variable.type))
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                                .contentShape(Rectangle())
                            }
                            .buttonStyle(.plain)
                            .padding(.vertical, 4)
                        }
                    }
                }
                .frame(maxHeight: 180)
            }
        }
    }

    private var newSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            TextField("Variable name", text: $newName)
                .textFieldStyle(.roundedBorder)
            Picker("Type", selection: $newType) {
                Text("Text").tag(LibraryVariable.Kind.text)
                Text("Choice").tag(LibraryVariable.Kind.choice)
                Text("Value").tag(LibraryVariable.Kind.value)
            }
            .pickerStyle(.segmented)
            if newType == .choice {
                TextField("Options, comma separated", text: $newOptionsText)
                    .textFieldStyle(.roundedBorder)
            }
            if newType == .value {
                TextEditor(text: $newValueText)
                    .font(.body)
                    .frame(height: 80)
                    .overlay(RoundedRectangle(cornerRadius: 6).stroke(Color.secondary.opacity(0.3)))
            }
            if nameCollides {
                Text("A variable named \u{201C}\(trimmedNewName)\u{201D} already exists.")
                    .font(.caption)
                    .foregroundStyle(.red)
            }
            Button("Create & Insert") {
                onCreateAndInsert(trimmedNewName, newType, parsedOptions, trimmedNewValue)
            }
            .buttonStyle(.glassProminent)
            .disabled(!canCreate)
        }
    }

    private func variableTypeLabel(_ kind: LibraryVariable.Kind) -> String {
        switch kind {
        case .choice: return "Choice"
        case .value: return "Value"
        case .text: return "Text"
        }
    }
}

#Preview("Phrase Editor - Atomic") {
    PhraseEditor(phrase: PreviewData.addressPhrase)
        .environmentObject(PreviewData.store)
}

/// Every control here writes straight through to `store.corpus.settings` on
/// change (via `settings`, a computed `Binding`) — there's no draft state and
/// no Save button, so text size, card size, colors, and font apply live.
struct SettingsEditor: View {
    @EnvironmentObject private var store: CorpusStore
    let width: CGFloat
    @State private var editingColorTarget: ColorEditTarget?
    @State private var didCopyPath = false

    private var usesTwoColumns: Bool { width >= 760 }
    private var primaryColumnWidth: CGFloat { usesTwoColumns ? 320 : width - 44 }
    private var colorsColumnWidth: CGFloat { usesTwoColumns ? max(width - primaryColumnWidth - 62, 300) : width - 44 }

    private var settings: Binding<Settings> {
        Binding(
            get: { store.corpus.settings },
            set: { store.saveSettings($0) }
        )
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                if usesTwoColumns {
                    HStack(alignment: .top, spacing: 18) {
                        primarySettingsColumn
                            .frame(width: primaryColumnWidth, alignment: .topLeading)

                        settingsSection("Colors") {
                            colorControls
                        }
                        .frame(width: colorsColumnWidth, alignment: .topLeading)
                    }
                } else {
                    primarySettingsColumn
                    settingsSection("Colors") {
                        colorControls
                    }
                }

                settingsSection("Categories") {
                    CategoryManagerSection()
                }
            }
            .padding(22)
        }
        .frame(width: width)
        .frame(minHeight: 420, maxHeight: 720)
    }

    private var primarySettingsColumn: some View {
        VStack(alignment: .leading, spacing: 14) {
            settingsSection("Display") {
                textSizeControl
                cardSizeControl
                Picker("Font", selection: settings.defaultFontFamily) {
                    Text("Sans").tag("sans")
                    Text("Serif").tag("serif")
                }
                .frame(maxWidth: 220, alignment: .leading)
            }

            settingsSection("Behavior") {
                Toggle("Close card automatically after copying", isOn: Binding(
                    get: { settings.wrappedValue.closeCardOnCopy ?? Settings.defaultCloseCardOnCopy },
                    set: { settings.wrappedValue.closeCardOnCopy = $0 }
                ))
                Toggle("Expanded: show full variable values", isOn: Binding(
                    get: { settings.wrappedValue.expandedChipDisplay ?? Settings.defaultExpandedChipDisplay },
                    set: { settings.wrappedValue.expandedChipDisplay = $0 }
                ))
                .help("Shows canned variable values in full instead of their short name on every expanded card.")
                Toggle("Show Variables button in toolbar", isOn: Binding(
                    get: { settings.wrappedValue.showVariablesLibraryButton ?? Settings.defaultShowVariablesLibraryButton },
                    set: { settings.wrappedValue.showVariablesLibraryButton = $0 }
                ))
                .help("Controls whether the Variables Library button is shown next to Search and Settings.")
                Button {
                    copyCorpusPath()
                } label: {
                    Label(didCopyPath ? "Path copied" : "Copy corpus file path", systemImage: didCopyPath ? "checkmark" : "doc.on.doc")
                }
                .buttonStyle(.glass)
                .help("Copies the path to quick-text.json, for handing off to a coding agent for bulk edits.")
            }
        }
    }

    private func settingsSection<Content: View>(_ title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title)
                .font(.headline)
            content()
        }
        .padding(14)
        .background(Color(nsColor: .windowBackgroundColor).opacity(0.24), in: RoundedRectangle(cornerRadius: 10))
    }

    private var textSizeControl: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Text size: \(settings.wrappedValue.defaultFontSize)").font(.caption).foregroundStyle(.secondary)
            Slider(
                value: Binding(
                    get: { Double(settings.wrappedValue.defaultFontSize) },
                    set: { settings.wrappedValue.defaultFontSize = Int($0.rounded()) }
                ),
                in: 14...44,
                step: 1
            )
        }
    }

    private var cardSizeControl: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Card size: \(Int(settings.wrappedValue.cardWidth ?? Settings.defaultCardWidth))").font(.caption).foregroundStyle(.secondary)
            Slider(
                value: Binding(
                    get: { settings.wrappedValue.cardWidth ?? Settings.defaultCardWidth },
                    set: { settings.wrappedValue.cardWidth = $0 }
                ),
                in: 120...320,
                step: 4
            )
        }
    }

    private var colorControls: some View {
        VStack(alignment: .leading, spacing: 8) {
            ColorSwatchField(
                title: "Default tile background",
                selection: settings.defaultTileColor,
                colors: store.palette.colors,
                isEditing: colorEditingBinding(for: .background)
            )
            ColorSwatchField(
                title: "Default tile text",
                selection: settings.defaultTextColor,
                colors: store.palette.colors,
                isEditing: colorEditingBinding(for: .text)
            )
            ColorSwatchField(
                title: "Highlight",
                selection: Binding(
                    get: { settings.wrappedValue.highlightColor ?? Settings.defaultHighlightColor },
                    set: { settings.wrappedValue.highlightColor = $0 }
                ),
                colors: store.palette.colors,
                isEditing: colorEditingBinding(for: .highlight)
            )
            .help("Atom-chip selection, copy pulses, hover tints, the active category chip, and card/copy-badge selection highlights.")
            HStack(spacing: 8) {
                ColorSwatchField(
                    title: "Grid background",
                    selection: Binding(
                        get: { store.corpus.settings.gridBackgroundColor ?? "" },
                        set: { settings.wrappedValue.gridBackgroundColor = $0 }
                    ),
                    colors: store.palette.colors,
                    isEditing: colorEditingBinding(for: .gridBackground)
                )
                if store.corpus.settings.gridBackgroundColor != nil {
                    Button("System") {
                        settings.wrappedValue.gridBackgroundColor = nil
                    }
                    .buttonStyle(.glass)
                    .help("Use system default")
                }
            }
            ColorSwatchField(
                title: "Expanded card background",
                selection: Binding(
                    get: { settings.wrappedValue.expandedCardBackgroundColor ?? Settings.defaultExpandedCardBackgroundColor },
                    set: { settings.wrappedValue.expandedCardBackgroundColor = $0 }
                ),
                colors: store.palette.colors,
                isEditing: colorEditingBinding(for: .expandedCardBackground)
            )
            ColorSwatchField(
                title: "Expanded card text",
                selection: Binding(
                    get: { settings.wrappedValue.expandedCardTextColor ?? Settings.defaultExpandedCardTextColor },
                    set: { settings.wrappedValue.expandedCardTextColor = $0 }
                ),
                colors: store.palette.colors,
                isEditing: colorEditingBinding(for: .expandedCardText)
            )
            ColorSwatchField(
                title: "Expanded card chip",
                selection: Binding(
                    get: { settings.wrappedValue.expandedCardChipColor ?? Settings.defaultExpandedCardChipColor },
                    set: { settings.wrappedValue.expandedCardChipColor = $0 }
                ),
                colors: store.palette.colors,
                isEditing: colorEditingBinding(for: .expandedCardChip)
            )
        }
    }

    private func colorEditingBinding(for target: ColorEditTarget) -> Binding<Bool> {
        Binding(
            get: { editingColorTarget == target },
            set: { editingColorTarget = $0 ? target : (editingColorTarget == target ? nil : editingColorTarget) }
        )
    }

    private func copyCorpusPath() {
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(store.corpusPath, forType: .string)
        didCopyPath = true
        DispatchQueue.main.asyncAfter(deadline: .now() + CorpusStore.copyFeedbackDuration) {
            didCopyPath = false
        }
    }
}

/// Lists every category with inline rename/color/delete, plus an add-row.
/// Category colors are a fallback tier between a phrase's own color and the
/// global default (see `CorpusStore.color(for:)`), so editing one here
/// re-tints every card in that category that hasn't set its own color.
struct CategoryManagerSection: View {
    @EnvironmentObject private var store: CorpusStore
    @State private var newCategoryName = ""

    var body: some View {
        ForEach(store.corpus.categories.sorted { $0.sortOrder < $1.sortOrder }) { category in
            CategoryRow(category: category)
        }
        HStack(spacing: 8) {
            TextField("New category", text: $newCategoryName)
                .textFieldStyle(.plain)
                .onSubmit(addCategory)
                .frame(minWidth: 240)
            Button("Add", action: addCategory)
                .buttonStyle(.glass)
                .disabled(newCategoryName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
        }
    }

    private func addCategory() {
        let name = newCategoryName.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !name.isEmpty else { return }
        store.addCategory(name: name)
        newCategoryName = ""
    }
}

struct CategoryRow: View {
    @EnvironmentObject private var store: CorpusStore
    let category: Category
    @State private var editingColorTarget: ColorEditTarget?

    var body: some View {
        HStack(spacing: 8) {
            TextField("Name", text: nameBinding)
                .textFieldStyle(.plain)
                .frame(width: 240)
            ColorSwatchField(
                title: "BG",
                selection: colorBinding,
                colors: store.palette.colors,
                isEditing: colorEditingBinding(for: .background)
            )
            .frame(width: 240)
            ColorSwatchField(
                title: "Text",
                selection: textColorBinding,
                colors: store.palette.colors,
                isEditing: colorEditingBinding(for: .text)
            )
            .frame(width: 240)
            Button {
                store.deleteCategory(category.id)
            } label: {
                Image(systemName: "trash")
            }
            .buttonStyle(.glass)
            .disabled(store.corpus.categories.count <= 1)
            .help(store.corpus.categories.count <= 1 ? "At least one category is required" : "Delete category (its cards move to another category)")
        }
    }

    private var nameBinding: Binding<String> {
        Binding(
            get: { category.name },
            set: { store.renameCategory(category.id, name: $0) }
        )
    }

    private var colorBinding: Binding<String> {
        Binding(
            get: { category.color ?? store.corpus.settings.defaultTileColor },
            set: { store.updateCategoryColor(category.id, color: $0) }
        )
    }

    private var textColorBinding: Binding<String> {
        Binding(
            get: { category.textColor ?? store.corpus.settings.defaultTextColor },
            set: { store.updateCategoryTextColor(category.id, textColor: $0) }
        )
    }

    private func colorEditingBinding(for target: ColorEditTarget) -> Binding<Bool> {
        Binding(
            get: { editingColorTarget == target },
            set: { editingColorTarget = $0 ? target : (editingColorTarget == target ? nil : editingColorTarget) }
        )
    }
}

enum ColorEditTarget {
    case background
    case text
    case highlight
    case gridBackground
    case expandedCardBackground
    case expandedCardText
    case expandedCardChip
}

/// Admin surface for the reusable variable library (see quick-text/README.md
/// "Variable placeholders" -> reusable variable library): lists every library
/// variable, its type/options, and a live reference count (`CorpusStore.referenceCount`
/// — a fresh scan for `{{@name}}` across `phrases[].value`, not a stored back-reference
/// list), plus add/edit/delete. Opened from the toolbar button next to Settings.
struct VariablesLibraryEditor: View {
    @EnvironmentObject private var store: CorpusStore
    @State private var editingVariableID: String?
    @State private var isAddingNew = false
    @State private var deleteCandidate: LibraryVariable?

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            if store.libraryVariables.isEmpty {
                Text("No library variables yet. Add one below, or use \u{201C}Insert Variable\u{201D} in a phrase's Value field.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            } else {
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 180), spacing: 10)], alignment: .leading, spacing: 10) {
                    ForEach(store.libraryVariables) { variable in
                        VariableCard(
                            variable: variable,
                            referenceCount: store.referenceCount(forLibraryVariableName: variable.name),
                            onEdit: { editingVariableID = variable.id },
                            onDelete: { deleteCandidate = variable }
                        )
                    }
                }
            }
            Button {
                isAddingNew = true
            } label: {
                Label("Add Variable", systemImage: "plus")
            }
            .buttonStyle(.glass)
        }
        .padding(14)
        .frame(width: 520)
        .frame(minHeight: 240, maxHeight: 520)
        .sheet(item: editingVariableBinding) { variable in
            LibraryVariableEditorSheet(mode: .edit(variable), referenceCount: store.referenceCount(forLibraryVariableName: variable.name))
                .environmentObject(store)
        }
        .sheet(isPresented: $isAddingNew) {
            LibraryVariableEditorSheet(mode: .create, referenceCount: 0)
                .environmentObject(store)
        }
        .alert(
            "Delete \u{201C}\(deleteCandidate?.name ?? "")\u{201D}?",
            isPresented: Binding(get: { deleteCandidate != nil }, set: { isPresented in if !isPresented { deleteCandidate = nil } }),
            presenting: deleteCandidate
        ) { variable in
            Button("Delete", role: .destructive) {
                store.deleteLibraryVariable(variable.id)
                deleteCandidate = nil
            }
            Button("Cancel", role: .cancel) { deleteCandidate = nil }
        } message: { variable in
            let count = store.referenceCount(forLibraryVariableName: variable.name)
            Text(count > 0
                ? "\(count) phrase\(count == 1 ? "" : "s") reference this variable via {{@\(variable.name)}}. They'll keep that literal text, which will then show as unresolved."
                : "No phrases currently reference this variable.")
        }
    }

    private var editingVariableBinding: Binding<LibraryVariable?> {
        Binding(
            get: { editingVariableID.flatMap { id in store.libraryVariables.first { $0.id == id } } },
            set: { editingVariableID = $0?.id }
        )
    }
}

private struct VariableCard: View {
    let variable: LibraryVariable
    let referenceCount: Int
    let onEdit: () -> Void
    let onDelete: () -> Void
    @State private var isHovering = false

    var body: some View {
        Button(action: onEdit) {
            VStack(alignment: .leading, spacing: 2) {
                HStack(alignment: .firstTextBaseline, spacing: 6) {
                    Text(isHovering ? hoverText : variable.name)
                        .font(.system(size: 18, weight: .bold))
                        .lineLimit(isHovering ? 5 : 3)
                        .minimumScaleFactor(0.78)
                    Spacer(minLength: 0)
                }
                Spacer(minLength: 0)
                HStack(spacing: 6) {
                    Text(variable.type.rawValue.capitalized)
                    Text("\(referenceCount) phrase\(referenceCount == 1 ? "" : "s")")
                }
                .font(.caption)
                .foregroundStyle(.secondary)
            }
            .padding(12)
            .frame(minHeight: 112, alignment: .topLeading)
            .frame(maxWidth: .infinity, alignment: .topLeading)
            .background(Color(nsColor: .controlBackgroundColor).opacity(isHovering ? 0.96 : 0.74))
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(Color.primary.opacity(isHovering ? 0.22 : 0.1), lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .contentShape(RoundedRectangle(cornerRadius: 8))
        }
        .buttonStyle(.plain)
        .onHover { hovering in
            withAnimation(.easeInOut(duration: 0.12)) {
                isHovering = hovering
            }
        }
        .help(hoverText)
        .contextMenu {
            Button("Edit", action: onEdit)
            Button("Delete", role: .destructive, action: onDelete)
        }
        .accessibilityLabel(variable.name)
        .accessibilityValue(hoverText)
        .accessibilityAction(named: "Edit", onEdit)
        .accessibilityAction(named: "Delete", onDelete)
    }

    private var hoverText: String {
        switch variable.type {
        case .choice: return (variable.options ?? []).joined(separator: " / ")
        case .value: return variable.value ?? ""
        case .text: return "Free text"
        }
    }
}

/// Create/edit form for one library variable. Editing a variable that's currently
/// referenced by >=1 phrase (per `referenceCount`) prompts "Update all" vs. "Fork"
/// on save (see quick-text/README.md "Edit propagation"); editing an unreferenced one,
/// or creating a new one, saves directly with no prompt.
private struct LibraryVariableEditorSheet: View {
    enum Mode {
        case create
        case edit(LibraryVariable)
    }

    @EnvironmentObject private var store: CorpusStore
    @Environment(\.dismiss) private var dismiss
    let mode: Mode
    let referenceCount: Int

    @State private var name: String = ""
    @State private var type: LibraryVariable.Kind = .text
    @State private var optionsText: String = ""
    @State private var valueText: String = ""
    @State private var showingPropagationPrompt = false
    @State private var isForking = false

    private var isEditing: Bool {
        if case .edit = mode { return true }
        return false
    }

    private var originalVariable: LibraryVariable? {
        if case .edit(let variable) = mode { return variable }
        return nil
    }

    private var trimmedName: String { name.trimmingCharacters(in: .whitespacesAndNewlines) }

    private var parsedOptions: [String] {
        optionsText.split(separator: ",").map { $0.trimmingCharacters(in: .whitespaces) }.filter { !$0.isEmpty }
    }

    private var trimmedValue: String { valueText.trimmingCharacters(in: .whitespacesAndNewlines) }

    private var nameAvailable: Bool {
        store.isLibraryVariableNameAvailable(trimmedName, excludingID: originalVariable?.id)
    }

    private var canSave: Bool {
        guard !trimmedName.isEmpty, nameAvailable else { return false }
        switch type {
        case .text: return true
        case .choice: return !parsedOptions.isEmpty
        case .value: return !trimmedValue.isEmpty
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text(isEditing ? "Edit Variable" : "New Variable").font(.headline)

            TextField("Name", text: $name)
                .textFieldStyle(.roundedBorder)
            if !nameAvailable && !trimmedName.isEmpty {
                Text("Another variable already uses this name.")
                    .font(.caption)
                    .foregroundStyle(.red)
            }

            Picker("Type", selection: $type) {
                Text("Text").tag(LibraryVariable.Kind.text)
                Text("Choice").tag(LibraryVariable.Kind.choice)
                Text("Value").tag(LibraryVariable.Kind.value)
            }
            .pickerStyle(.segmented)

            if type == .choice {
                TextField("Options, comma separated", text: $optionsText)
                    .textFieldStyle(.roundedBorder)
            }

            if type == .value {
                Text("Card shows just the name; the full value below is substituted at copy time.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                TextEditor(text: $valueText)
                    .font(.body)
                    .frame(height: 100)
                    .overlay(RoundedRectangle(cornerRadius: 6).stroke(Color.secondary.opacity(0.3)))
            }

            if isEditing, referenceCount > 0 {
                Text("\(referenceCount) phrase\(referenceCount == 1 ? "" : "s") currently reference this variable.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            HStack {
                Button("Cancel") { dismiss() }
                    .buttonStyle(.glass)
                Spacer()
                Button(isEditing ? "Save" : "Add") { save() }
                    .buttonStyle(.glassProminent)
                    .disabled(!canSave)
            }
        }
        .padding(20)
        .frame(width: 380)
        .onAppear {
            if let original = originalVariable {
                name = original.name
                type = original.type
                optionsText = (original.options ?? []).joined(separator: ", ")
                valueText = original.value ?? ""
            }
        }
        .confirmationDialog(
            "This variable is referenced by \(referenceCount) phrase\(referenceCount == 1 ? "" : "s"). Update them all, or fork a new variable instead?",
            isPresented: $showingPropagationPrompt,
            titleVisibility: .visible
        ) {
            Button("Update All") { applyUpdateAll() }
            Button("Fork Instead") { isForking = true }
            Button("Cancel", role: .cancel) {}
        }
        .sheet(isPresented: $isForking) {
            ForkVariableSheet(
                suggestedName: "\(trimmedName) copy",
                onCreate: { newName in
                    store.forkLibraryVariable(name: newName, type: type, options: parsedOptions, value: trimmedValue)
                    isForking = false
                    dismiss()
                },
                onCancel: { isForking = false }
            )
            .environmentObject(store)
        }
    }

    private func save() {
        guard canSave else { return }
        guard let original = originalVariable else {
            store.addLibraryVariable(name: trimmedName, type: type, options: parsedOptions, value: trimmedValue)
            dismiss()
            return
        }
        guard referenceCount > 0 else {
            store.updateLibraryVariableInPlace(original.id, name: trimmedName, type: type, options: parsedOptions, value: trimmedValue)
            dismiss()
            return
        }
        showingPropagationPrompt = true
    }

    private func applyUpdateAll() {
        guard let original = originalVariable else { return }
        store.updateLibraryVariableInPlace(original.id, name: trimmedName, type: type, options: parsedOptions, value: trimmedValue)
        dismiss()
    }
}

/// "Fork" (see quick-text/README.md "Edit propagation"): the admin picks a new name for
/// the forked copy — can't collide with the original or any other existing library
/// variable. The original entry and every phrase referencing it are left untouched.
private struct ForkVariableSheet: View {
    @EnvironmentObject private var store: CorpusStore
    let suggestedName: String
    /// Creation of the forked entry itself (with whatever type/options were being
    /// edited at fork time) happens in the caller's closure; this sheet only picks
    /// the new, non-colliding name.
    let onCreate: (String) -> Void
    let onCancel: () -> Void

    @State private var name: String = ""

    private var trimmedName: String { name.trimmingCharacters(in: .whitespacesAndNewlines) }
    private var nameAvailable: Bool { store.isLibraryVariableNameAvailable(trimmedName) }
    private var canCreate: Bool { !trimmedName.isEmpty && nameAvailable }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Fork Variable").font(.headline)
            Text("Creates a new, separate variable. Phrases using the original keep pointing at it, unchanged.")
                .font(.caption)
                .foregroundStyle(.secondary)
            TextField("New variable name", text: $name)
                .textFieldStyle(.roundedBorder)
            if !nameAvailable && !trimmedName.isEmpty {
                Text("Another variable already uses this name.")
                    .font(.caption)
                    .foregroundStyle(.red)
            }
            HStack {
                Button("Cancel", action: onCancel)
                    .buttonStyle(.glass)
                Spacer()
                Button("Create Fork") { onCreate(trimmedName) }
                    .buttonStyle(.glassProminent)
                    .disabled(!canCreate)
            }
        }
        .padding(20)
        .frame(width: 340)
        .onAppear { name = suggestedName }
    }
}

/// Collapsed color field: shows the current swatch, expands into a `SwatchPicker`
/// popover on click. SwiftUI popovers dismiss automatically on an outside click,
/// and only one of a pair (background/text) is ever open since callers share a
/// single `editingColorTarget` state.
struct ColorSwatchField: View {
    let title: String
    @Binding var selection: String
    let colors: [PaletteColor]
    @Binding var isEditing: Bool

    private var currentColor: PaletteColor? { colors.first { $0.id == selection } }
    private var isCustomHex: Bool { PaletteColor.isHex(selection) }

    var body: some View {
        Button {
            isEditing.toggle()
        } label: {
            HStack(spacing: 8) {
                Circle()
                    .fill(isCustomHex ? Color(hex: selection) : (currentColor.map { Color(hex: $0.hex) } ?? Color.secondary))
                    .frame(width: 18, height: 18)
                    .overlay(Circle().stroke(Color.black.opacity(0.18), lineWidth: 1))
                Text(title)
                Spacer()
                Text(isCustomHex ? selection.uppercased() : (currentColor?.name ?? "Select"))
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Image(systemName: "chevron.down")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
            .contentShape(Rectangle())
        }
        .buttonStyle(.glass)
        .popover(isPresented: $isEditing, arrowEdge: .bottom) {
            SwatchPicker(title: title, selection: $selection, colors: colors)
                .padding()
                .frame(width: 240)
        }
    }
}

struct SwatchPicker: View {
    let title: String
    @Binding var selection: String
    let colors: [PaletteColor]

    @State private var hexDraft: String = ""

    private let columns = [GridItem(.adaptive(minimum: 28), spacing: 8)]

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title).font(.caption).foregroundStyle(.secondary)
            LazyVGrid(columns: columns, alignment: .leading, spacing: 8) {
                ForEach(colors) { item in
                    Button {
                        selection = item.id
                    } label: {
                        Circle()
                            .fill(Color(hex: item.hex))
                            .frame(width: 26, height: 26)
                            .overlay(
                                Circle()
                                    .stroke(selection == item.id ? Color.primary : Color.clear, lineWidth: 3)
                            )
                            .overlay(
                                Circle()
                                    .stroke(Color.black.opacity(0.18), lineWidth: 1)
                            )
                    }
                    .buttonStyle(.plain)
                    .help(item.name)
                }
            }
            Divider()
            Text("Custom hex").font(.caption).foregroundStyle(.secondary)
            HStack(spacing: 8) {
                Circle()
                    .fill(PaletteColor.isHex(hexDraft) ? Color(hex: hexDraft) : Color.secondary.opacity(0.2))
                    .frame(width: 20, height: 20)
                    .overlay(Circle().stroke(Color.black.opacity(0.18), lineWidth: 1))
                TextField("#RRGGBB", text: $hexDraft)
                    .textFieldStyle(.plain)
                    .font(.system(.caption, design: .monospaced))
                    .onSubmit(applyHex)
                Button("Apply", action: applyHex)
                    .buttonStyle(.glass)
                    .disabled(!PaletteColor.isHex(hexDraft))
            }
            Divider()
            // Opens the system color panel — palettes, crayons, sliders, and the
            // magnifier/eyedropper — as another way in, alongside the presets above.
            ColorPicker("System color panel", selection: systemPickerBinding, supportsOpacity: false)
                .font(.caption)
        }
        .onAppear {
            if PaletteColor.isHex(selection) { hexDraft = selection }
        }
    }

    private var systemPickerBinding: Binding<Color> {
        Binding(
            get: {
                if PaletteColor.isHex(selection) { return Color(hex: selection) }
                return colors.first { $0.id == selection }.map { Color(hex: $0.hex) } ?? Color.secondary
            },
            set: { newColor in
                let hex = newColor.hexString
                selection = hex
                hexDraft = hex
            }
        )
    }

    private func applyHex() {
        guard PaletteColor.isHex(hexDraft) else { return }
        selection = hexDraft.uppercased()
    }
}

struct ExpandedOverlayView: View {
    @ObservedObject var store: CorpusStore
    let phrase: Phrase

    var body: some View {
        ZStack {
            Rectangle()
                .fill(.ultraThinMaterial)
                .ignoresSafeArea()
                .contentShape(Rectangle())
                .onTapGesture { store.collapseExpanded() }

            ExpandedCardView(
                phrase: phrase,
                fontSize: store.corpus.settings.defaultFontSize,
                fontFamily: store.corpus.settings.defaultFontFamily,
                isCopied: store.copiedPhraseID == phrase.id,
                background: store.expandedCardBackgroundColor,
                textColor: store.expandedCardTextColor,
                chipColor: store.expandedCardChipColor,
                highlightColor: store.highlightColor,
                libraryVariables: store.libraryVariables,
                expandedChipDisplay: store.corpus.settings.expandedChipDisplay ?? Settings.defaultExpandedChipDisplay,
                onCopyAtom: { atom in store.copyAtom(atom, in: phrase) },
                onCopySelection: { atoms in store.copyAtomSelection(atoms, in: phrase) },
                onCopyFull: { text in store.copyFullFromExpandedCard(text, phraseID: phrase.id) },
                onClose: { store.collapseExpanded() }
            )
            // Resets variable fill-in state when the expanded phrase changes,
            // rather than carrying stale entries over from the previous card.
            .id(phrase.id)
            .padding(64)
        }
    }
}

/// Preview mechanism for every card, atomic or plain: fills ~80% of the display
/// (see `ContentView.resizeWindowForExpansion`) so the full item text can be read
/// at a glance. Hovering the card body (not an atom chip) surfaces a copy icon in
/// the top-right corner using the same text/highlight colors as the atom chips;
/// hovering a chip instead highlights that chip since it becomes the copy target.
/// Shift-click on atoms multiselects (highlighted, clipboard updated in document
/// order on every change); a plain click reverts to single-atom copy.
struct ExpandedCardView: View {
    let phrase: Phrase
    let fontSize: Int
    let fontFamily: String
    let isCopied: Bool
    // Defaulted so #Preview call sites below don't need to specify a full
    // palette; ExpandedOverlayView passes the live, settings-resolved values.
    var background: Color = Color(hex: Settings.defaultExpandedCardBackgroundColor)
    var textColor: Color = Color(hex: Settings.defaultExpandedCardTextColor)
    var chipColor: Color = Color(hex: Settings.defaultExpandedCardChipColor)
    var highlightColor: Color = Color(hex: Settings.defaultHighlightColor)
    // Resolves `{{@name}}` references against the corpus-level library; defaulted so
    // #Preview call sites below don't need to specify one for inline-only phrases.
    var libraryVariables: [LibraryVariable] = []
    /// Global display-mode toggle (Settings > Behavior): when on, canned `"value"`-type
    /// library chips show their full value inline instead of the collapsed `name`.
    var expandedChipDisplay: Bool = false
    let onCopyAtom: (Atom) -> Void
    let onCopySelection: ([Atom]) -> Void
    /// Receives the phrase value with any filled `{{...}}` variables substituted in.
    let onCopyFull: (String) -> Void
    let onClose: () -> Void

    @State private var hoveredAtomID: String?
    @State private var isHoveringCard = false
    @State private var isHoveringAtomsBlock = false
    @State private var isHoveringCopyIcon = false
    @State private var isHoveringCloseIcon = false
    @State private var focusedAtomID: String?
    @State private var selectedAtomAnchorID: String?
    @State private var selectedAtomIDs: Set<String> = []
    @State private var keyMonitor: Any?
    @State private var singleCopiedAtomID: String?
    @State private var shiftReleaseMonitor: Any?
    @State private var isPulsingAllAtoms = false
    @State private var isPulsingCardBackground = false
    @State private var variableValues: [String: String] = [:]
    @State private var editingVariableKey: String?

    private var hasAtoms: Bool { !(phrase.atoms ?? []).isEmpty }
    private var sortedAtoms: [Atom] { (phrase.atoms ?? []).sorted { $0.start < $1.start } }
    private var parsedVariables: [PhraseVariable] { PhraseVariable.parse(phrase.value, library: libraryVariables) }
    private var hasVariables: Bool { !parsedVariables.isEmpty }
    /// Either kind of chip makes the card interactive rather than a single tap target,
    /// so atom- and variable-only phrases share the same "gaps absorb taps" behavior.
    private var hasChips: Bool { hasAtoms || hasVariables }

    /// True over the same area that reveals the copy icon (hovering the card but
    /// not the chips block) — a tap right now copies the whole card, so the
    /// background gets a subtle tint to signal that instead of leaving it
    /// ambiguous with the dead space between chips.
    private var isHoveringCopyAllZone: Bool { isHoveringCard && !isHoveringAtomsBlock }

    private var showsCopyAllTint: Bool { isHoveringCopyAllZone || isAllAtomsMultiselected }

    private var isAllAtomsMultiselected: Bool {
        guard hasAtoms else { return false }
        let atomIDs = Set((phrase.atoms ?? []).map(\.id))
        return selectedAtomIDs == atomIDs
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 22) {
            Text(phrase.title.uppercased())
                .font(.callout.bold())
                .foregroundStyle(textColor.opacity(0.6))

            GeometryReader { geometry in
                ScrollView {
                    VStack(alignment: .leading, spacing: 10) {
                        Spacer(minLength: 0)
                        linesBlock(maxWidth: geometry.size.width)
                            .frame(maxWidth: .infinity, alignment: .center)
                        Spacer(minLength: 0)
                    }
                    .frame(minHeight: geometry.size.height)
                }
            }
        }
        .padding(46)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .background(
            ZStack {
                isPulsingCardBackground ? highlightColor : background
                if showsCopyAllTint {
                    highlightColor.opacity(0.06)
                }
            }
            .animation(.easeInOut(duration: 0.25), value: showsCopyAllTint)
        )
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .shadow(color: .black.opacity(0.4), radius: 40, y: 16)
        .overlay(alignment: .topTrailing) { iconsOverlay }
        .overlay { CopiedBadge(isVisible: isCopied, color: highlightColor) }
        .contentShape(Rectangle())
        .onHover { hovering in isHoveringCard = hovering }
        .onTapGesture { copyFull() }
        .onAppear {
            keyMonitor = NSEvent.addLocalMonitorForEvents(matching: .keyDown) { event in
                handleKeyEvent(event)
            }
            // Releasing shift should drop the multiselect highlight immediately,
            // not just on the next click, so watch modifier-key changes directly.
            shiftReleaseMonitor = NSEvent.addLocalMonitorForEvents(matching: .flagsChanged) { event in
                if !event.modifierFlags.contains(.shift) {
                    clearAtomSelection()
                }
                return event
            }
        }
        .onDisappear {
            if let keyMonitor {
                NSEvent.removeMonitor(keyMonitor)
                self.keyMonitor = nil
            }
            if let monitor = shiftReleaseMonitor {
                NSEvent.removeMonitor(monitor)
                shiftReleaseMonitor = nil
            }
        }
    }

    private func linesBlock(maxWidth: CGFloat) -> some View {
        let content = VStack(alignment: .leading, spacing: 10) {
            ForEach(Array(lines.enumerated()), id: \.offset) { _, line in
                FlowLayout(spacing: 6) {
                    ForEach(line) { segment in
                        if segment.atom != nil {
                            atomChip(segment, maxWidth: maxWidth)
                        } else if segment.variable != nil {
                            variableChip(segment, maxWidth: maxWidth)
                        } else {
                            // Matches the atom chips' minHeight so punctuation/filler
                            // text doesn't shift vertically relative to neighboring chips.
                            Text(segment.text)
                                .font(bodyFont)
                                .foregroundStyle(textColor)
                                .frame(minHeight: 44)
                        }
                    }
                }
            }
        }
        // Bounding box around the whole chip cluster: while the cursor is anywhere
        // inside it (including gaps/punctuation between chips), the full-card copy
        // icon stays hidden so it doesn't flicker as the cursor crosses those gaps.
        return Group {
            if hasChips {
                content
                    .contentShape(Rectangle())
                    .onHover { hovering in isHoveringAtomsBlock = hovering }
                    // Absorbs taps in the gaps between chips so only an explicit chip
                    // click copies; the card's full-copy tap only fires outside this box.
                    .onTapGesture {}
            } else {
                content
            }
        }
    }

    private var iconsOverlay: some View {
        HStack(spacing: 12) {
            if isHoveringCard, !isHoveringAtomsBlock {
                iconButton(systemName: "doc.on.doc", isHovering: isHoveringCopyIcon, action: copyFull) { hovering in
                    isHoveringCopyIcon = hovering
                }
            }
            iconButton(systemName: "xmark", isHovering: isHoveringCloseIcon, action: onClose) { hovering in
                isHoveringCloseIcon = hovering
            }
        }
        .padding(.top, 26)
        .padding(.trailing, 26)
    }

    /// No background or border by design; the larger glyph plus a wider invisible
    /// hit area (44x44) compensate for the lost touch target.
    private func iconButton(systemName: String, isHovering: Bool, action: @escaping () -> Void, onHoverChange: @escaping (Bool) -> Void) -> some View {
        Image(systemName: systemName)
            .font(.system(size: 26, weight: .semibold))
            .foregroundStyle(isHovering ? highlightColor : textColor)
            .frame(width: 44, height: 44)
            .contentShape(Rectangle())
            .onHover(perform: onHoverChange)
            .onTapGesture(perform: action)
    }

    /// `maxWidth` caps the chip so a long atom (spanning a whole sentence, say)
    /// wraps internally instead of running off the card uncut — FlowLayout only
    /// wraps between subviews, so a single Text needs its own width ceiling.
    private func atomChip(_ segment: LineSegment, maxWidth: CGFloat) -> some View {
        let isHighlighted = selectedAtomIDs.contains(segment.id) || hoveredAtomID == segment.id
            || isPulsingAllAtoms || singleCopiedAtomID == segment.id || isHoveringCopyAllZone
        return Button { handleAtomTap(segment.atom!) } label: {
            Text(segment.text)
                .multilineTextAlignment(.leading)
                .fixedSize(horizontal: false, vertical: true)
                .frame(maxWidth: maxWidth, alignment: .leading)
        }
            .buttonStyle(.plain)
            .font(.system(size: bodyFontSize, weight: .bold))
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .frame(minHeight: 44)
            .background(isHighlighted ? highlightColor : chipColor)
            .foregroundStyle(isHighlighted ? .white : background)
            .clipShape(RoundedRectangle(cornerRadius: 10))
            .onHover { hovering in hoveredAtomID = hovering ? segment.id : nil }
    }

    /// Renders a `{{...}}` occurrence as a fill-in chip: unfilled shows a dashed
    /// outline with the placeholder's display label as a hint, filled shows a solid
    /// chip with the entered value. Tapping opens a popover — a text field for
    /// free-form placeholders, or a list of choices for `{{a/b}}`-style/`"choice"`-type
    /// ones. An unresolved `{{@name}}` library reference (see `PhraseVariable.isUnresolved`)
    /// has nothing to fill, so it renders as a distinct, non-interactive chip instead.
    @ViewBuilder
    private func variableChip(_ segment: LineSegment, maxWidth: CGFloat) -> some View {
        let variable = segment.variable!
        if variable.isUnresolved {
            unresolvedVariableChip(variable, maxWidth: maxWidth)
        } else if variable.isCannedValue {
            cannedValueChip(variable, maxWidth: maxWidth)
        } else {
            let filled = variableValues[variable.key]
            let isHighlighted = isPulsingAllAtoms || isHoveringCopyAllZone
            Button {
                editingVariableKey = variable.key
            } label: {
                Text(filled ?? variable.displayLabel)
                    .multilineTextAlignment(.leading)
                    .fixedSize(horizontal: false, vertical: true)
                    .frame(maxWidth: maxWidth, alignment: .leading)
                    .italic(filled == nil)
            }
                .buttonStyle(.plain)
                .font(.system(size: bodyFontSize, weight: .bold))
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .frame(minHeight: 44)
                .background(isHighlighted ? highlightColor : (filled != nil ? chipColor : Color.clear))
                .foregroundStyle(isHighlighted ? .white : (filled != nil ? background : textColor))
                .clipShape(RoundedRectangle(cornerRadius: 10))
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .strokeBorder(filled == nil && !isHighlighted ? textColor.opacity(0.4) : .clear, style: StrokeStyle(lineWidth: 1.5, dash: [4, 3]))
                )
                .popover(isPresented: Binding(
                    get: { editingVariableKey == variable.key },
                    set: { isPresented in if !isPresented { editingVariableKey = nil } }
                )) {
                    variableEditorPopover(for: variable, currentValue: filled)
                }
        }
    }

    /// A resolved `"value"`-type library reference: nothing to fill in, so it's always
    /// solid (like an atom chip) rather than dashed. Collapsed shows `name`; Expanded
    /// display mode (`expandedChipDisplay`) shows the full canned `value` instead. Either
    /// way, hovering surfaces the full value as a native tooltip — the "preview option"
    /// without switching modes (see README "Reusable variable library").
    private func cannedValueChip(_ variable: PhraseVariable, maxWidth: CGFloat) -> some View {
        let isHighlighted = isPulsingAllAtoms || isHoveringCopyAllZone
        return Text(expandedChipDisplay ? (variable.libraryValue ?? variable.displayLabel) : variable.displayLabel)
            .multilineTextAlignment(.leading)
            .fixedSize(horizontal: false, vertical: true)
            .frame(maxWidth: maxWidth, alignment: .leading)
            .font(.system(size: bodyFontSize, weight: .bold))
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .frame(minHeight: 44)
            .background(isHighlighted ? highlightColor : chipColor)
            .foregroundStyle(isHighlighted ? .white : background)
            .clipShape(RoundedRectangle(cornerRadius: 10))
            .help(variable.libraryValue ?? "")
    }

    /// A dangling `{{@name}}` — renamed or deleted out of the library. Visually distinct
    /// (red-tinted dashed outline, no fill state) from both a plain unfilled placeholder
    /// and a resolved one; not tappable, since there's nothing to fill. Still copies
    /// through as the literal `{{@name}}` text via `PhraseVariable.substitute`'s
    /// unfilled fallback, since it's never present in `variableValues`.
    private func unresolvedVariableChip(_ variable: PhraseVariable, maxWidth: CGFloat) -> some View {
        Text(variable.displayLabel)
            .multilineTextAlignment(.leading)
            .fixedSize(horizontal: false, vertical: true)
            .frame(maxWidth: maxWidth, alignment: .leading)
            .italic()
            .font(.system(size: bodyFontSize, weight: .bold))
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .frame(minHeight: 44)
            .foregroundStyle(Color.red.opacity(0.85))
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .strokeBorder(Color.red.opacity(0.55), style: StrokeStyle(lineWidth: 1.5, dash: [4, 3]))
            )
            .help("Unresolved variable reference — no library variable named \u{201C}\(variable.displayLabel)\u{201D} was found. Copies through as literal text.")
    }

    @ViewBuilder
    private func variableEditorPopover(for variable: PhraseVariable, currentValue: String?) -> some View {
        if let choices = variable.choices {
            VStack(alignment: .leading, spacing: 2) {
                ForEach(choices, id: \.self) { choice in
                    Button(choice) {
                        variableValues[variable.key] = choice
                        editingVariableKey = nil
                    }
                    .buttonStyle(.plain)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                }
            }
            .padding(6)
        } else {
            VariableFillPopover(initialValue: currentValue ?? "") { value in
                variableValues[variable.key] = value
                editingVariableKey = nil
            }
        }
    }

    private func handleAtomTap(_ atom: Atom) {
        if NSEvent.modifierFlags.contains(.shift) {
            if selectedAtomIDs.contains(atom.id) {
                selectedAtomIDs.remove(atom.id)
            } else {
                selectedAtomIDs.insert(atom.id)
            }
            focusedAtomID = atom.id
            selectedAtomAnchorID = selectedAtomAnchorID ?? atom.id
            let selected = (phrase.atoms ?? []).filter { selectedAtomIDs.contains($0.id) }
            guard !selected.isEmpty else { return }
            onCopySelection(selected)
        } else {
            clearAtomSelection()
            flashSingleCopiedAtom(atom.id)
            onCopyAtom(atom)
        }
    }

    private func handleKeyEvent(_ event: NSEvent) -> NSEvent? {
        guard event.modifierFlags.intersection([.command, .option, .control]).isEmpty else { return event }
        let extending = event.modifierFlags.contains(.shift)
        switch event.keyCode {
        case 53:
            onClose()
            return nil
        case 49:
            copyFull()
            return nil
        case 36, 76:
            copySelectedAtomsOrFull()
            return nil
        case 123, 126:
            moveAtomSelection(delta: -1, extending: extending)
            return nil
        case 124, 125:
            moveAtomSelection(delta: 1, extending: extending)
            return nil
        default:
            return event
        }
    }

    private func moveAtomSelection(delta: Int, extending: Bool) {
        let atoms = sortedAtoms
        guard !atoms.isEmpty else { return }
        let currentIndex = focusedAtomID.flatMap { id in atoms.firstIndex { $0.id == id } }
        let nextIndex: Int
        if let currentIndex {
            nextIndex = min(max(currentIndex + delta, 0), atoms.count - 1)
        } else {
            nextIndex = delta < 0 ? atoms.count - 1 : 0
        }
        let nextAtom = atoms[nextIndex]
        focusedAtomID = nextAtom.id
        singleCopiedAtomID = nil

        if extending {
            let anchorID = selectedAtomAnchorID ?? selectedAtomIDs.first ?? atoms[currentIndex ?? nextIndex].id
            selectedAtomAnchorID = anchorID
            guard let anchorIndex = atoms.firstIndex(where: { $0.id == anchorID }) else {
                selectedAtomIDs = [nextAtom.id]
                return
            }
            let range = min(anchorIndex, nextIndex)...max(anchorIndex, nextIndex)
            selectedAtomIDs = Set(atoms[range].map(\.id))
        } else {
            selectedAtomAnchorID = nextAtom.id
            selectedAtomIDs = [nextAtom.id]
        }
    }

    private func copySelectedAtomsOrFull() {
        let selected = sortedAtoms.filter { selectedAtomIDs.contains($0.id) }
        if selected.isEmpty {
            copyFull()
        } else if selected.count == 1, let atom = selected.first {
            flashSingleCopiedAtom(atom.id)
            onCopyAtom(atom)
        } else {
            onCopySelection(selected)
        }
    }

    private func clearAtomSelection() {
        focusedAtomID = nil
        selectedAtomAnchorID = nil
        selectedAtomIDs = []
    }

    /// Single-atom copy highlight: unlike shift-multiselect (which persists until
    /// shift releases), this should pop and fade back on its own, matching the
    /// full-card pulse's timing instead of sticking until the next tap.
    private func flashSingleCopiedAtom(_ id: String) {
        withAnimation(.easeOut(duration: 0.12)) { singleCopiedAtomID = id }
        DispatchQueue.main.asyncAfter(deadline: .now() + CorpusStore.copyFeedbackDuration) {
            guard singleCopiedAtomID == id else { return }
            withAnimation(.easeOut(duration: 0.22)) { singleCopiedAtomID = nil }
        }
    }

    /// Full-card copy (background tap or the copy icon): substitutes any filled
    /// variables into the value, then pulses every chip (or, for plain cards with
    /// no chips, the whole card background) to the highlight color in sync with
    /// the "Copied" badge, since the whole value just got copied.
    /// Canned `"value"`-type library entries are never stored in `variableValues` (there's
    /// nothing to fill in), so they're merged in here at copy time instead.
    private var valuesForSubstitution: [String: String] {
        var values = variableValues
        for variable in parsedVariables where variable.isCannedValue {
            values[variable.key] = variable.libraryValue
        }
        return values
    }

    private func copyFull() {
        onCopyFull(PhraseVariable.substitute(phrase.value, values: valuesForSubstitution))
        guard hasChips else {
            withAnimation(.easeOut(duration: 0.12)) { isPulsingCardBackground = true }
            DispatchQueue.main.asyncAfter(deadline: .now() + CorpusStore.copyFeedbackDuration) {
                withAnimation(.easeOut(duration: 0.22)) { isPulsingCardBackground = false }
            }
            return
        }
        withAnimation(.easeOut(duration: 0.12)) { isPulsingAllAtoms = true }
        DispatchQueue.main.asyncAfter(deadline: .now() + CorpusStore.copyFeedbackDuration) {
            withAnimation(.easeOut(duration: 0.22)) { isPulsingAllAtoms = false }
        }
    }

    private var bodyFontSize: CGFloat { CGFloat(fontSize) * 1.5 }

    private var bodyFont: Font {
        fontFamily == "serif" ? .custom("Palatino", size: bodyFontSize) : .system(size: bodyFontSize)
    }

    private var lines: [[LineSegment]] {
        LineSegment.lines(value: phrase.value, atoms: phrase.atoms ?? [], variables: parsedVariables)
    }
}

/// Free-text fill-in popover for a single `{{variable}}` occurrence, shown by
/// `ExpandedCardView.variableChip`. Choice-style `{{a/b}}` placeholders skip this
/// in favor of a plain list of buttons.
private struct VariableFillPopover: View {
    @State private var text: String
    @FocusState private var isFocused: Bool
    let onSubmit: (String) -> Void

    init(initialValue: String, onSubmit: @escaping (String) -> Void) {
        _text = State(initialValue: initialValue)
        self.onSubmit = onSubmit
    }

    var body: some View {
        HStack(spacing: 8) {
            TextField("Value", text: $text)
                .textFieldStyle(.roundedBorder)
                .frame(width: 220)
                .focused($isFocused)
                .onSubmit { onSubmit(text) }
            Button("Set") { onSubmit(text) }
                .buttonStyle(.borderedProminent)
        }
        .padding(12)
        .onAppear { isFocused = true }
    }
}

struct LineSegment: Identifiable {
    let id: String
    let text: String
    let atom: Atom?
    let variable: PhraseVariable?

    var isChip: Bool { atom != nil || variable != nil }

    /// Merges atom ranges and detected `{{...}}` variable ranges (both character-indexed,
    /// see `PhraseVariable`/`Atom`) into a single ordered run of chip/plain-text segments.
    /// A variable range that overlaps an already-placed atom is dropped rather than
    /// double-rendered; atoms are user-curated so they take priority.
    static func lines(value: String, atoms: [Atom], variables: [PhraseVariable]) -> [[LineSegment]] {
        let characters = Array(value)
        struct ChipRange { let start: Int; let end: Int; let atom: Atom?; let variable: PhraseVariable? }
        let ranges = (
            atoms
                .filter { $0.start >= 0 && $0.end > $0.start && $0.end <= characters.count }
                .map { ChipRange(start: $0.start, end: $0.end, atom: $0, variable: nil) }
            + variables
                .filter { $0.start >= 0 && $0.end > $0.start && $0.end <= characters.count }
                .map { ChipRange(start: $0.start, end: $0.end, atom: nil, variable: $0) }
        ).sorted { $0.start < $1.start }

        var flat: [LineSegment] = []
        var cursor = 0
        var counter = 0
        func nextID() -> String { counter += 1; return "seg-\(counter)" }

        for range in ranges {
            guard range.start >= cursor else { continue }
            if range.start > cursor {
                flat.append(LineSegment(id: nextID(), text: String(characters[cursor..<range.start]), atom: nil, variable: nil))
            }
            let id = range.atom?.id ?? nextID()
            flat.append(LineSegment(id: id, text: String(characters[range.start..<range.end]), atom: range.atom, variable: range.variable))
            cursor = range.end
        }
        if cursor < characters.count {
            flat.append(LineSegment(id: nextID(), text: String(characters[cursor...]), atom: nil, variable: nil))
        }

        var lines: [[LineSegment]] = [[]]
        for segment in flat {
            if segment.isChip {
                lines[lines.count - 1].append(segment)
                continue
            }
            let parts = segment.text.components(separatedBy: "\n")
            for (index, part) in parts.enumerated() {
                // FlowLayout only wraps between subviews, not inside one, so a long
                // run of plain text has to be split into word tokens for word wrap
                // to work; FlowLayout's own spacing supplies the gap between words.
                let words = part.split(separator: " ")
                for word in words {
                    lines[lines.count - 1].append(LineSegment(id: nextID(), text: String(word), atom: nil, variable: nil))
                }
                if index < parts.count - 1 {
                    lines.append([])
                }
            }
        }
        return lines
    }
}

/// Minimal left-to-right wrapping layout for a run of text/chip views.
struct FlowLayout: Layout {
    var spacing: CGFloat = 4

    /// A subview whose natural single-line width fits the container flows inline
    /// like any other token (short atom chips, words). One whose natural width
    /// would overflow — a long atom chip — is measured at the container's width
    /// instead (so it reports its true wrapped height) and always starts on its
    /// own line, so its wrapped block doesn't sit half-inline with neighbors.
    private struct Item {
        let size: CGSize
        let startsNewLine: Bool
    }

    private func items(for subviews: Subviews, maxWidth: CGFloat) -> [Item] {
        subviews.map { subview in
            let natural = subview.sizeThatFits(.unspecified)
            guard natural.width > maxWidth else { return Item(size: natural, startsNewLine: false) }
            let wrapped = subview.sizeThatFits(ProposedViewSize(width: maxWidth, height: nil))
            return Item(size: wrapped, startsNewLine: true)
        }
    }

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let maxWidth = proposal.width ?? .infinity
        var width: CGFloat = 0
        var height: CGFloat = 0
        var lineWidth: CGFloat = 0
        var lineHeight: CGFloat = 0
        for item in items(for: subviews, maxWidth: maxWidth) {
            if lineWidth > 0, item.startsNewLine || lineWidth + item.size.width > maxWidth {
                width = max(width, lineWidth)
                height += lineHeight + spacing
                lineWidth = 0
                lineHeight = 0
            }
            lineWidth += item.size.width + spacing
            lineHeight = max(lineHeight, item.size.height)
            if item.startsNewLine {
                width = max(width, lineWidth)
                height += lineHeight + spacing
                lineWidth = 0
                lineHeight = 0
            }
        }
        width = max(width, lineWidth)
        height += lineHeight
        return CGSize(width: min(width, maxWidth), height: max(height, 0))
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var x = bounds.minX
        var y = bounds.minY
        var lineHeight: CGFloat = 0
        for (subview, item) in zip(subviews, items(for: subviews, maxWidth: bounds.width)) {
            if x > bounds.minX, item.startsNewLine || x + item.size.width > bounds.maxX {
                x = bounds.minX
                y += lineHeight + spacing
                lineHeight = 0
            }
            subview.place(at: CGPoint(x: x, y: y), proposal: ProposedViewSize(item.size))
            x += item.size.width + spacing
            lineHeight = max(lineHeight, item.size.height)
            if item.startsNewLine {
                x = bounds.minX
                y += lineHeight + spacing
                lineHeight = 0
            }
        }
    }
}

#Preview("Expanded Card - Atomic") {
    ExpandedCardView(
        phrase: PreviewData.addressPhrase,
        fontSize: 18,
        fontFamily: "sans",
        isCopied: false,
        onCopyAtom: { _ in },
        onCopySelection: { _ in },
        onCopyFull: { _ in },
        onClose: {}
    )
    .frame(width: 900, height: 500)
    .padding(40)
}

#Preview("Expanded Card - Plain") {
    ExpandedCardView(
        phrase: PreviewData.plainPhrase,
        fontSize: 18,
        fontFamily: "sans",
        isCopied: false,
        onCopyAtom: { _ in },
        onCopySelection: { _ in },
        onCopyFull: { _ in },
        onClose: {}
    )
    .frame(width: 900, height: 500)
    .padding(40)
}

#Preview("Expanded Card - Copied") {
    ExpandedCardView(
        phrase: PreviewData.addressPhrase,
        fontSize: 18,
        fontFamily: "sans",
        isCopied: true,
        onCopyAtom: { _ in },
        onCopySelection: { _ in },
        onCopyFull: { _ in },
        onClose: {}
    )
    .frame(width: 900, height: 500)
    .padding(40)
}

#Preview("Expanded Card - Variables") {
    ExpandedCardView(
        phrase: PreviewData.variablePhrase,
        fontSize: 18,
        fontFamily: "sans",
        isCopied: false,
        onCopyAtom: { _ in },
        onCopySelection: { _ in },
        onCopyFull: { _ in },
        onClose: {}
    )
    .frame(width: 900, height: 500)
    .padding(40)
}

#Preview("Expanded Card - Library Variables") {
    ExpandedCardView(
        phrase: PreviewData.libraryVariablePhrase,
        fontSize: 18,
        fontFamily: "sans",
        isCopied: false,
        libraryVariables: PreviewData.store.libraryVariables,
        onCopyAtom: { _ in },
        onCopySelection: { _ in },
        onCopyFull: { _ in },
        onClose: {}
    )
    .frame(width: 900, height: 500)
    .padding(40)
}

#Preview("Variables Library") {
    VariablesLibraryEditor()
        .environmentObject(PreviewData.store)
        .padding()
}

#Preview("Expanded Overlay") {
    ExpandedOverlayView(store: PreviewData.store, phrase: PreviewData.addressPhrase)
        .frame(width: 900, height: 600)
}

enum SearchScope {
    case all
    case category
}

final class CorpusStore: ObservableObject {
    @Published var corpus = QuickTextCorpus.empty
    @Published var palette = Palette.empty
    @Published var activeCategoryID = "all"
    @Published var searchScope: SearchScope = .all
    @Published var categoryFocusMode = false
    @Published var focusedCategoryID: String?
    @Published var searchTerm = ""
    @Published var selectedPhraseID: String?
    @Published var copiedPhraseID: String?
    @Published var editingPhrase: Phrase?
    @Published var expandedPhraseID: String?
    @Published var draggedPhraseID: String?

    var expandedPhrase: Phrase? {
        guard let id = expandedPhraseID else { return nil }
        return corpus.phrases.first { $0.id == id }
    }

    private var corpusURL: URL { Self.resolveCorpusURL(named: "quick-text.json") }
    private var paletteURL: URL { Self.resolveCorpusURL(named: "palette.json") }

    /// Absolute path to the corpus JSON, for handing off to a coding agent for bulk edits.
    var corpusPath: String { corpusURL.path }

    var tabs: [Category] {
        var result = [Category(id: "all", name: "All", sortOrder: 0)]
        result.append(contentsOf: corpus.categories.sorted { $0.sortOrder < $1.sortOrder })
        if corpus.phrases.contains(where: \.favorite) {
            result.append(Category(id: "favorites", name: "Favorites", sortOrder: 999))
        }
        return result
    }

    var filteredPhrases: [Phrase] {
        let term = searchTerm.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        let result = corpus.phrases.filter { phrase in
            searchScope == .all || activeCategoryID == "all" || phrase.categoryId == activeCategoryID || (activeCategoryID == "favorites" && phrase.favorite)
        }.filter { phrase in
            if term.isEmpty { return true }
            return [phrase.title, phrase.summary ?? "", phrase.value, phrase.tags.joined(separator: " ")]
                .joined(separator: " ")
                .lowercased()
                .contains(term)
        }
        return result
    }

    var selectedPhrase: Phrase? {
        filteredPhrases.first { $0.id == selectedPhraseID } ?? filteredPhrases.first
    }

    func load() {
        do {
            corpus = try JSONDecoder.quickText.decode(QuickTextCorpus.self, from: Data(contentsOf: corpusURL))
            palette = try JSONDecoder.quickText.decode(Palette.self, from: Data(contentsOf: paletteURL))
            selectedPhraseID = filteredPhrases.first?.id
        } catch {
            NSLog("Quick Text load failed: \(error.localizedDescription)")
        }
    }

    func save(_ phrase: Phrase) {
        var next = phrase
        next.updatedAt = Date()
        if let index = corpus.phrases.firstIndex(where: { $0.id == phrase.id }) {
            corpus.phrases[index] = next
        } else {
            next.createdAt = Date()
            corpus.phrases.append(next)
        }
        corpus.updatedAt = Date()
        writeCorpus()
    }

    /// Shared timing for the "Copied" pop/fade feedback, used by every copy path.
    static let copyFeedbackDuration: TimeInterval = 0.55

    func copy(_ phrase: Phrase) {
        selectedPhraseID = phrase.id
        exitCategoryFocus()
        copyText(phrase.value, feedbackFor: phrase.id, autoClose: false)
    }

    func collapseExpanded() {
        expandedPhraseID = nil
    }

    /// Whether copying from the expanded card should auto-close it, per user setting.
    private var closesCardOnCopy: Bool {
        corpus.settings.closeCardOnCopy ?? Settings.defaultCloseCardOnCopy
    }

    func copyAtom(_ atom: Atom, in phrase: Phrase) {
        let characters = Array(phrase.value)
        guard atom.start >= 0, atom.end <= characters.count, atom.end > atom.start else { return }
        copyText(String(characters[atom.start..<atom.end]), feedbackFor: phrase.id, autoClose: closesCardOnCopy)
    }

    /// Shift-multiselect copy: concatenates the selected atoms in document order
    /// (not click order) and keeps the expanded card open for further selection.
    func copyAtomSelection(_ atoms: [Atom], in phrase: Phrase) {
        guard !atoms.isEmpty else { return }
        let characters = Array(phrase.value)
        let text = atoms
            .sorted { $0.start < $1.start }
            .compactMap { atom -> String? in
                guard atom.start >= 0, atom.end <= characters.count, atom.end > atom.start else { return nil }
                return String(characters[atom.start..<atom.end])
            }
            .joined(separator: " ")
        copyText(text, feedbackFor: phrase.id, autoClose: false)
    }

    /// `text` is already variable-substituted by `ExpandedCardView.copyFull()`.
    func copyFullFromExpandedCard(_ text: String, phraseID: String) {
        copyText(text, feedbackFor: phraseID, autoClose: closesCardOnCopy)
    }

    func searchTermDidChange() {
        reconcileSelectedPhrase()
    }

    func clearSearch() {
        searchTerm = ""
        searchScope = .all
        activeCategoryID = "all"
        categoryFocusMode = false
        focusedCategoryID = nil
        reconcileSelectedPhrase()
    }

    func selectTab(_ id: String) {
        if id == "all" {
            searchScope = .all
            categoryFocusMode = false
            focusedCategoryID = nil
            activeCategoryID = "all"
        } else {
            searchScope = .category
            categoryFocusMode = true
            focusedCategoryID = id
            activeCategoryID = id
        }
        reconcileSelectedPhrase()
    }

    func isTabSelected(_ id: String) -> Bool {
        if searchScope == .all { return id == "all" }
        return activeCategoryID == id
    }

    /// Moves the keyboard-focused category chip by `delta`, cycling through
    /// every tab (All, each category, Favorites) in the same order they're
    /// displayed — no special-casing for All/Favorites.
    func moveCategoryFocus(_ delta: Int) {
        let categories = tabs
        guard !categories.isEmpty else { return }
        let currentIndex = categories.firstIndex { isTabSelected($0.id) } ?? 0
        let nextIndex = (currentIndex + delta + categories.count) % categories.count
        selectTab(categories[nextIndex].id)
    }

    func exitCategoryFocus() {
        categoryFocusMode = false
        focusedCategoryID = nil
        searchScope = .all
        activeCategoryID = "all"
        reconcileSelectedPhrase()
    }

    private func copyText(_ text: String, feedbackFor phraseID: String, autoClose: Bool) {
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(text, forType: .string)
        copiedPhraseID = phraseID
        DispatchQueue.main.asyncAfter(deadline: .now() + Self.copyFeedbackDuration) { [weak self] in
            if self?.copiedPhraseID == phraseID { self?.copiedPhraseID = nil }
            if autoClose, self?.expandedPhraseID == phraseID { self?.expandedPhraseID = nil }
        }
    }

    func beginNewPhrase() {
        editingPhrase = Phrase(
            id: "phrase-\(Int(Date().timeIntervalSince1970))",
            categoryId: categoryIDForNewPhrase(),
            title: "",
            summary: "",
            value: "",
            color: corpus.settings.defaultTileColor,
            textColor: corpus.settings.defaultTextColor,
            fontSize: nil,
            image: nil,
            favorite: false,
            visibility: .private,
            tags: [],
            createdAt: Date(),
            updatedAt: Date()
        )
    }

    private func categoryIDForNewPhrase() -> String {
        if corpus.categories.contains(where: { $0.id == activeCategoryID }) {
            return activeCategoryID
        }
        return corpus.categories.first?.id ?? "personal"
    }

    func beginEditingSelectedPhrase() {
        if let phrase = selectedPhrase { beginEditing(phrase) }
    }

    func beginEditing(_ phrase: Phrase) {
        editingPhrase = phrase
    }

    func duplicate(_ phrase: Phrase) {
        var clone = phrase
        clone.id = "\(phrase.id)-copy-\(Int(Date().timeIntervalSince1970))"
        clone.title = "\(phrase.title) Copy"
        clone.createdAt = Date()
        clone.updatedAt = Date()
        corpus.phrases.append(clone)
        writeCorpus()
    }

    func saveSettings(_ settings: Settings) {
        corpus.settings = settings
        corpus.updatedAt = Date()
        writeCorpus()
    }

    func delete(_ phrase: Phrase) {
        corpus.phrases.removeAll { $0.id == phrase.id }
        selectedPhraseID = filteredPhrases.first?.id
        writeCorpus()
    }

    /// Live grid-reorder while dragging: moves the dragged phrase to sit just
    /// before `targetID` in the underlying array (the array order *is* the
    /// display/persisted order). Doesn't write to disk — call `finishReorder()`
    /// once the drag ends so mid-drag jitter isn't hammering the corpus file.
    func movePhrase(_ id: String, before targetID: String) {
        guard id != targetID,
              let fromIndex = corpus.phrases.firstIndex(where: { $0.id == id }),
              corpus.phrases.contains(where: { $0.id == targetID }) else { return }
        let item = corpus.phrases.remove(at: fromIndex)
        let toIndex = corpus.phrases.firstIndex(where: { $0.id == targetID }) ?? corpus.phrases.count
        corpus.phrases.insert(item, at: toIndex)
    }

    func finishReorder() {
        draggedPhraseID = nil
        corpus.updatedAt = Date()
        writeCorpus()
    }

    func moveSelection(_ delta: Int) {
        let phrases = filteredPhrases
        guard !phrases.isEmpty else { return }
        guard let current = phrases.firstIndex(where: { $0.id == selectedPhraseID }) else {
            selectedPhraseID = phrases.first?.id
            return
        }
        let next = min(max(current + delta, 0), phrases.count - 1)
        selectedPhraseID = phrases[next].id
    }

    private func reconcileSelectedPhrase() {
        let phrases = filteredPhrases
        guard !phrases.isEmpty else {
            selectedPhraseID = nil
            return
        }
        if let selectedPhraseID, phrases.contains(where: { $0.id == selectedPhraseID }) {
            return
        }
        selectedPhraseID = phrases.first?.id
    }

    func categoryName(for id: String) -> String {
        corpus.categories.first { $0.id == id }?.name ?? ""
    }

    func category(for id: String) -> Category? {
        corpus.categories.first { $0.id == id }
    }

    func color(for id: String?) -> Color {
        let fallback = corpus.settings.defaultTileColor
        let value = id ?? fallback
        if PaletteColor.isHex(value) { return Color(hex: value) }
        let hex = palette.colors.first { $0.id == value }?.hex ?? "#D2BEB1"
        return Color(hex: hex)
    }

    /// The one accent used everywhere something is "selected/about to be
    /// copied": atom-chip highlight, full-card copy pulse, and hover tints —
    /// on both atomic and non-atomic cards.
    var highlightColor: Color { color(for: corpus.settings.highlightColor ?? Settings.defaultHighlightColor) }
    var expandedCardBackgroundColor: Color { color(for: corpus.settings.expandedCardBackgroundColor ?? Settings.defaultExpandedCardBackgroundColor) }
    var expandedCardTextColor: Color { color(for: corpus.settings.expandedCardTextColor ?? Settings.defaultExpandedCardTextColor) }
    var expandedCardChipColor: Color { color(for: corpus.settings.expandedCardChipColor ?? Settings.defaultExpandedCardChipColor) }

    /// Unlike the other card colors, nil here means "follow the system window
    /// background" rather than a fixed hex default.
    var gridBackgroundColor: Color {
        guard let value = corpus.settings.gridBackgroundColor else { return Color(nsColor: .windowBackgroundColor) }
        return color(for: value)
    }

    func categoryTabBackground(for tab: Category, isSelected: Bool) -> Color {
        if isSelected {
            return highlightColor
        }
        return color(for: corpus.settings.defaultTileColor)
    }

    func imageURL(for image: String?) -> URL? {
        guard let image, !image.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return nil }
        let value = image.trimmingCharacters(in: .whitespacesAndNewlines)
        if let url = URL(string: value), url.scheme != nil {
            return url
        }
        if value.hasPrefix("/") {
            return URL(fileURLWithPath: value)
        }
        return corpusURL.deletingLastPathComponent().appendingPathComponent(value).standardizedFileURL
    }

    func addCategory(name: String) {
        let id = uniqueCategoryID(from: name)
        let nextSort = (corpus.categories.map(\.sortOrder).max() ?? 0) + 10
        corpus.categories.append(Category(id: id, name: name, sortOrder: nextSort))
        corpus.updatedAt = Date()
        writeCorpus()
    }

    func renameCategory(_ id: String, name: String) {
        guard let index = corpus.categories.firstIndex(where: { $0.id == id }) else { return }
        corpus.categories[index].name = name
        corpus.updatedAt = Date()
        writeCorpus()
    }

    func updateCategoryColor(_ id: String, color: String) {
        guard let index = corpus.categories.firstIndex(where: { $0.id == id }) else { return }
        corpus.categories[index].color = color
        corpus.updatedAt = Date()
        writeCorpus()
    }

    func updateCategoryTextColor(_ id: String, textColor: String) {
        guard let index = corpus.categories.firstIndex(where: { $0.id == id }) else { return }
        corpus.categories[index].textColor = textColor
        corpus.updatedAt = Date()
        writeCorpus()
    }

    /// Refuses to delete the last remaining category; reassigns any phrases in
    /// the deleted category to the next-lowest-sortOrder survivor.
    func deleteCategory(_ id: String) {
        guard corpus.categories.count > 1, let index = corpus.categories.firstIndex(where: { $0.id == id }) else { return }
        corpus.categories.remove(at: index)
        if let fallback = corpus.categories.sorted(by: { $0.sortOrder < $1.sortOrder }).first {
            for i in corpus.phrases.indices where corpus.phrases[i].categoryId == id {
                corpus.phrases[i].categoryId = fallback.id
            }
        }
        if activeCategoryID == id { activeCategoryID = "all" }
        corpus.updatedAt = Date()
        writeCorpus()
    }

    private func uniqueCategoryID(from name: String) -> String {
        let base = name.lowercased()
            .replacingOccurrences(of: "[^a-z0-9]+", with: "-", options: .regularExpression)
            .trimmingCharacters(in: CharacterSet(charactersIn: "-"))
        let fallback = base.isEmpty ? "category" : base
        var candidate = fallback
        var suffix = 2
        let existing = Set(corpus.categories.map(\.id))
        while existing.contains(candidate) {
            candidate = "\(fallback)-\(suffix)"
            suffix += 1
        }
        return candidate
    }

    private func writeCorpus() {
        do {
            let data = try JSONEncoder.quickText.encode(corpus)
            try data.write(to: corpusURL, options: .atomic)
        } catch {
            NSLog("Quick Text save failed: \(error.localizedDescription)")
        }
    }

    private static func resolveCorpusURL(named fileName: String) -> URL {
        if let base = ProcessInfo.processInfo.environment["QUICK_TEXT_CORPUS_DIR"] {
            return URL(fileURLWithPath: base).appendingPathComponent(fileName)
        }
        if let base = Bundle.main.object(forInfoDictionaryKey: "QuickTextCorpusDirectory") as? String, !base.isEmpty {
            let configured = URL(fileURLWithPath: (base as NSString).expandingTildeInPath).appendingPathComponent(fileName)
            if FileManager.default.fileExists(atPath: configured.path) {
                return configured
            }
        }
        if let resourceURL = Bundle.main.resourceURL {
            let bundled = resourceURL.appendingPathComponent("Corpus").appendingPathComponent(fileName)
            if FileManager.default.fileExists(atPath: bundled.path) {
                return bundled
            }
        }
        let cwd = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
        let candidates = [
            cwd.appendingPathComponent("../../corpus/\(fileName)").standardizedFileURL,
            cwd.appendingPathComponent("quick-text/corpus/\(fileName)").standardizedFileURL,
            cwd.appendingPathComponent("corpus/\(fileName)").standardizedFileURL
        ]
        return candidates.first { FileManager.default.fileExists(atPath: $0.path) } ?? candidates[0]
    }
}

/// Reusable variable library CRUD and the reverse-index scan behind it (see
/// quick-text/README.md "Variable placeholders" -> reusable variable library, and
/// `VariablesLibraryEditor`/`LibraryVariableEditorSheet` below for the admin UI).
extension CorpusStore {
    var libraryVariables: [LibraryVariable] { corpus.variables ?? [] }

    /// Live reverse-index: every phrase currently referencing `name` via `{{@name}}`
    /// (case-insensitive, trimmed), scanned fresh from `phrases[].value` rather than a
    /// stored back-reference list, so it can never go stale.
    func phrasesReferencing(libraryVariableName name: String) -> [Phrase] {
        let target = name.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard !target.isEmpty else { return [] }
        return corpus.phrases.filter { PhraseVariable.referencedLibraryNames(in: $0.value).contains(target) }
    }

    func referenceCount(forLibraryVariableName name: String) -> Int {
        phrasesReferencing(libraryVariableName: name).count
    }

    func isLibraryVariableNameAvailable(_ name: String, excludingID: String? = nil) -> Bool {
        let target = name.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard !target.isEmpty else { return false }
        return !libraryVariables.contains { $0.id != excludingID && $0.name.trimmingCharacters(in: .whitespacesAndNewlines).lowercased() == target }
    }

    @discardableResult
    func addLibraryVariable(name: String, type: LibraryVariable.Kind, options: [String], value: String = "") -> LibraryVariable {
        let variable = LibraryVariable(
            id: "var-\(Int(Date().timeIntervalSince1970 * 1000))",
            name: name.trimmingCharacters(in: .whitespacesAndNewlines),
            type: type,
            options: type == .choice ? options : nil,
            value: type == .value ? value.trimmingCharacters(in: .whitespacesAndNewlines) : nil
        )
        var vars = corpus.variables ?? []
        vars.append(variable)
        corpus.variables = vars
        corpus.updatedAt = Date()
        writeCorpus()
        return variable
    }

    /// "Update all" (see README "Edit propagation"): mutates the entry in place — same
    /// `id` — and, if `name` changed, rewrites every `{{@oldName}}` reference across
    /// `phrases[].value` to `{{@newName}}` so they don't go dangling. Safe to call
    /// unconditionally (including when `referenceCount` is 0, i.e. no prompt was needed).
    func updateLibraryVariableInPlace(_ id: String, name: String, type: LibraryVariable.Kind, options: [String], value: String = "") {
        var vars = corpus.variables ?? []
        guard let index = vars.firstIndex(where: { $0.id == id }) else { return }
        let oldName = vars[index].name
        let trimmedName = name.trimmingCharacters(in: .whitespacesAndNewlines)
        vars[index].name = trimmedName
        vars[index].type = type
        vars[index].options = type == .choice ? options : nil
        vars[index].value = type == .value ? value.trimmingCharacters(in: .whitespacesAndNewlines) : nil
        corpus.variables = vars

        if oldName.trimmingCharacters(in: .whitespacesAndNewlines).lowercased() != trimmedName.lowercased() {
            for i in corpus.phrases.indices {
                corpus.phrases[i].value = PhraseVariable.renamingLibraryReferences(in: corpus.phrases[i].value, from: oldName, to: trimmedName)
            }
        }
        corpus.updatedAt = Date()
        writeCorpus()
    }

    /// "Fork" (see README "Edit propagation"): leaves the existing entry, and every
    /// phrase pointing at it, completely untouched; creates a brand-new entry that
    /// nothing references yet. The admin inserts `{{@newName}}` wherever it should apply.
    @discardableResult
    func forkLibraryVariable(name: String, type: LibraryVariable.Kind, options: [String], value: String = "") -> LibraryVariable {
        addLibraryVariable(name: name, type: type, options: options, value: value)
    }

    /// Removing the entry is enough — referencing phrases keep their literal `{{@name}}`
    /// text untouched, which now simply resolves as unresolved on next parse instead of
    /// silently reverting to a plain inline placeholder.
    func deleteLibraryVariable(_ id: String) {
        var vars = corpus.variables ?? []
        vars.removeAll { $0.id == id }
        corpus.variables = vars
        corpus.updatedAt = Date()
        writeCorpus()
    }
}

struct QuickTextCorpus: Codable {
    var version: Int
    var updatedAt: Date
    var settings: Settings
    var categories: [Category]
    var phrases: [Phrase]
    // Reusable variable library (see quick-text/README.md "Variable placeholders" ->
    // reusable variable library). `{{@name}}` placeholders in any phrase's `value`
    // resolve against this list by `name` (case-insensitive, trimmed) instead of being
    // parsed as a literal, phrase-local placeholder. Optional so existing corpus.json
    // files without this key still decode.
    var variables: [LibraryVariable]?

    static let empty = QuickTextCorpus(version: 1, updatedAt: Date(), settings: Settings(defaultFontSize: 18, defaultTileColor: "brown-13", defaultTextColor: "brown-22", defaultFontFamily: "sans", paletteSource: "Robert Brown Fabric Collection"), categories: [], phrases: [])
}

struct Settings: Codable {
    var defaultFontSize: Int
    var defaultTileColor: String
    var defaultTextColor: String
    var defaultFontFamily: String
    var paletteSource: String
    // Optional so existing corpus.json files without this key still decode.
    var cardWidth: Double? = nil
    // Optional so existing corpus.json files without this key still decode.
    // Whether copying from the expanded card auto-closes it.
    var closeCardOnCopy: Bool? = nil
    // Optional so existing corpus.json files without this key still decode.
    // Global display mode: when true, canned "value"-type library variable chips show
    // their full value inline instead of the collapsed `name` (see README "Reusable
    // variable library" and `ExpandedCardView.cannedValueChip`).
    var expandedChipDisplay: Bool? = nil
    // Optional so existing corpus.json files without this key still decode.
    // Controls whether the top-row Variables Library button is visible.
    var showVariablesLibraryButton: Bool? = nil

    // Optional so existing corpus.json files without these keys still decode.
    // Each stores either a palette swatch id or a literal "#RRGGBB" hex string
    // (see PaletteColor.isHex). nil falls back to the matching default below.
    var highlightColor: String? = nil
    var gridBackgroundColor: String? = nil
    var expandedCardBackgroundColor: String? = nil
    var expandedCardTextColor: String? = nil
    var expandedCardChipColor: String? = nil

    static let defaultCardWidth: Double = 164
    static let defaultCloseCardOnCopy = false
    static let defaultExpandedChipDisplay = false
    static let defaultShowVariablesLibraryButton = true
    static let defaultHighlightColor = "#E2725B"
    static let defaultExpandedCardBackgroundColor = "#22201B"
    static let defaultExpandedCardTextColor = "#F4EDE0"
    static let defaultExpandedCardChipColor = "#F1E6D3"
}

struct Category: Codable, Identifiable {
    var id: String
    var name: String
    var sortOrder: Int
    // Optional so existing corpus.json files without these keys still decode.
    // Sits between a phrase's own color and the global settings default.
    var color: String? = nil
    var textColor: String? = nil
}

struct Phrase: Codable, Identifiable {
    var id: String
    var categoryId: String
    var title: String
    var summary: String?
    var value: String
    var color: String?
    var textColor: String?
    var fontSize: Int?
    var image: String? = nil
    var favorite: Bool
    var visibility: Visibility
    var tags: [String]
    var createdAt: Date
    var updatedAt: Date
    // Atomic phrase cards (see web/quick-text-component/quick-text.js). Tile tap expands
    // into ExpandedOverlayView/ExpandedCardView below. PhraseEditor lets admins add/remove
    // atoms from a text selection in the Value field (see SelectableTextEditor).
    var atoms: [Atom]?
}

struct Atom: Codable, Identifiable, Equatable {
    var id: String
    var start: Int
    var end: Int
    var label: String?
}

/// A reusable, corpus-level variable (see quick-text/README.md "Variable placeholders" ->
/// reusable variable library). Referenced from any phrase's `value` via `{{@name}}`,
/// resolved by `name` (case-insensitive, trimmed) at render time. `id` is stable and
/// never reused, even across a rename — `name` is just the human-facing lookup key.
struct LibraryVariable: Codable, Identifiable, Equatable {
    enum Kind: String, Codable, CaseIterable {
        case text
        case choice
        /// A fixed, canned value substituted directly — no fill-in step at copy time.
        /// The card shows just `name` (collapsed) unless previewed or in Expanded
        /// display mode, which shows `value` in full (see README "Reusable variable
        /// library" and `PhraseVariable.libraryValue`).
        case value
    }

    var id: String
    var name: String
    var type: Kind
    /// Required and non-empty when `type == .choice`; nil/ignored otherwise.
    var options: [String]?
    /// Required and non-empty when `type == .value`; nil/ignored otherwise.
    var value: String?
}

/// A `{{...}}` placeholder occurrence detected in a phrase's `value`, character-indexed
/// to match `Atom` offset semantics (see quick-text/README.md "Variable placeholders").
/// Not persisted — parsed fresh from `value` wherever needed. Two forms share the syntax:
/// a bare `{{name}}`/`{{a/b}}` is phrase-local (`kind == .inline`, exactly as before the
/// library existed); a `{{@name}}` resolves `name` against `QuickTextCorpus.variables`
/// instead (`kind == .library`). A library reference whose name doesn't match any current
/// library entry (renamed or deleted) is `isUnresolved` — it still renders as a chip, but
/// a visually distinct one, and (since it's never given a fill) copies through as the
/// literal `{{@name}}` text via the same unfilled-placeholder fallback in `substitute`.
struct PhraseVariable: Identifiable, Equatable {
    enum Kind: Equatable {
        case inline
        /// `libraryVariableID` is non-nil only when `name` resolved to a live library entry.
        case library(name: String, libraryVariableID: String?)
    }

    var id: String { key }
    /// Dictionary key used to share one fill across every occurrence of this placeholder
    /// within the same phrase. Inline placeholders key off their exact literal text
    /// (unchanged from before the library existed). Library references key off the
    /// case-insensitive/trimmed name so `{{@Name}}` and `{{@name}}` in the same phrase
    /// share one fill.
    let key: String
    /// Text shown in the chip before it's filled. Inline placeholders show their literal
    /// key (unchanged); library references show the human-facing variable name (or the
    /// dangling name typed, if unresolved).
    let displayLabel: String
    /// Non-nil for `{{option one/option two}}` inline placeholders, or a resolved
    /// `"choice"`-type library entry; each choice is offered as a discrete pick instead
    /// of free text.
    let choices: [String]?
    let start: Int
    let end: Int
    let kind: Kind
    /// Non-nil when this resolved to a `"value"`-type library entry — its fixed,
    /// canned text. Substituted automatically (no fill-in step); the chip shows
    /// `displayLabel` (the variable's `name`) collapsed, `libraryValue` in
    /// preview/Expanded display mode (see `ExpandedCardView.variableChip`).
    let libraryValue: String?

    var isLibraryReference: Bool {
        if case .library = kind { return true }
        return false
    }

    var isCannedValue: Bool { libraryValue != nil }

    /// True for a `{{@name}}` whose name doesn't match any current library entry —
    /// renamed or deleted out from under this reference.
    var isUnresolved: Bool {
        if case .library(_, let libraryVariableID) = kind { return libraryVariableID == nil }
        return false
    }

    private static let pattern = #"\{\{([^{}]+)\}\}"#

    /// `library` resolves `{{@name}}` references against the corpus's variable library;
    /// pass `[]` (the default) to parse only inline placeholders.
    static func parse(_ value: String, library: [LibraryVariable] = []) -> [PhraseVariable] {
        guard let regex = try? NSRegularExpression(pattern: pattern) else { return [] }
        let nsRange = NSRange(value.startIndex..<value.endIndex, in: value)
        var results: [PhraseVariable] = []
        regex.enumerateMatches(in: value, range: nsRange) { match, _, _ in
            guard let match,
                  let fullRange = Range(match.range, in: value),
                  let innerRange = Range(match.range(at: 1), in: value) else { return }
            let inner = String(value[innerRange]).trimmingCharacters(in: .whitespacesAndNewlines)
            guard !inner.isEmpty else { return }
            let start = value.distance(from: value.startIndex, to: fullRange.lowerBound)
            let end = value.distance(from: value.startIndex, to: fullRange.upperBound)

            if inner.hasPrefix("@") {
                let rawName = String(inner.dropFirst()).trimmingCharacters(in: .whitespacesAndNewlines)
                guard !rawName.isEmpty else { return }
                let normalizedName = rawName.lowercased()
                let resolved = library.first { $0.name.trimmingCharacters(in: .whitespacesAndNewlines).lowercased() == normalizedName }
                results.append(PhraseVariable(
                    key: "@\(normalizedName)",
                    displayLabel: resolved?.name ?? rawName,
                    choices: resolved?.type == .choice ? resolved?.options : nil,
                    start: start,
                    end: end,
                    kind: .library(name: resolved?.name ?? rawName, libraryVariableID: resolved?.id),
                    libraryValue: resolved?.type == .value ? resolved?.value : nil
                ))
            } else {
                let choices = inner.contains("/")
                    ? inner.split(separator: "/").map { $0.trimmingCharacters(in: .whitespaces) }.filter { !$0.isEmpty }
                    : nil
                results.append(PhraseVariable(key: inner, displayLabel: inner, choices: choices, start: start, end: end, kind: .inline, libraryValue: nil))
            }
        }
        return results
    }

    /// Replaces every `{{...}}` occurrence whose key has a filled value; occurrences with
    /// no fill — including any unresolved library reference, which is never fillable —
    /// stay as the literal placeholder text, same fallback for both placeholder kinds.
    static func substitute(_ value: String, values: [String: String]) -> String {
        guard let regex = try? NSRegularExpression(pattern: pattern) else { return value }
        let nsValue = value as NSString
        let nsRange = NSRange(location: 0, length: nsValue.length)
        var result = ""
        var cursor = 0
        regex.enumerateMatches(in: value, range: nsRange) { match, _, _ in
            guard let match else { return }
            result += nsValue.substring(with: NSRange(location: cursor, length: match.range.location - cursor))
            let inner = nsValue.substring(with: match.range(at: 1)).trimmingCharacters(in: .whitespacesAndNewlines)
            let key = inner.hasPrefix("@")
                ? "@\(String(inner.dropFirst()).trimmingCharacters(in: .whitespacesAndNewlines).lowercased())"
                : inner
            result += values[key] ?? nsValue.substring(with: match.range)
            cursor = match.range.location + match.range.length
        }
        result += nsValue.substring(from: cursor)
        return result
    }

    /// Every distinct library-variable name referenced via `{{@name}}` in `value`
    /// (case-insensitive, trimmed, without the `@`) — a live scan used for the Variables
    /// Library's reference counts and edit-propagation, rather than a stored
    /// back-reference list (see README "Variables Library" admin surface).
    static func referencedLibraryNames(in value: String) -> Set<String> {
        guard let regex = try? NSRegularExpression(pattern: pattern) else { return [] }
        let nsRange = NSRange(value.startIndex..<value.endIndex, in: value)
        var names: Set<String> = []
        regex.enumerateMatches(in: value, range: nsRange) { match, _, _ in
            guard let match, let innerRange = Range(match.range(at: 1), in: value) else { return }
            let inner = String(value[innerRange]).trimmingCharacters(in: .whitespacesAndNewlines)
            guard inner.hasPrefix("@") else { return }
            let rawName = String(inner.dropFirst()).trimmingCharacters(in: .whitespacesAndNewlines)
            guard !rawName.isEmpty else { return }
            names.insert(rawName.lowercased())
        }
        return names
    }

    /// Rewrites every `{{@oldName}}` occurrence (case-insensitive, trimmed match against
    /// `oldName`) in `value` to `{{@newName}}` — used by the library's "Update all" flow
    /// when a referenced variable is renamed, so existing references don't go dangling.
    static func renamingLibraryReferences(in value: String, from oldName: String, to newName: String) -> String {
        guard let regex = try? NSRegularExpression(pattern: pattern) else { return value }
        let target = oldName.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard !target.isEmpty else { return value }
        let nsValue = value as NSString
        let nsRange = NSRange(location: 0, length: nsValue.length)
        var result = ""
        var cursor = 0
        regex.enumerateMatches(in: value, range: nsRange) { match, _, _ in
            guard let match else { return }
            result += nsValue.substring(with: NSRange(location: cursor, length: match.range.location - cursor))
            let inner = nsValue.substring(with: match.range(at: 1)).trimmingCharacters(in: .whitespacesAndNewlines)
            if inner.hasPrefix("@") {
                let rawName = String(inner.dropFirst()).trimmingCharacters(in: .whitespacesAndNewlines)
                if rawName.lowercased() == target {
                    result += "{{@\(newName)}}"
                    cursor = match.range.location + match.range.length
                    return
                }
            }
            result += nsValue.substring(with: match.range)
            cursor = match.range.location + match.range.length
        }
        result += nsValue.substring(from: cursor)
        return result
    }
}

enum Visibility: String, Codable, CaseIterable {
    case `private`
    case `public`
    case localOnly = "local-only"
}

struct Palette: Codable {
    var name: String
    var source: String
    var colors: [PaletteColor]

    static let empty = Palette(name: "Robert Brown Fabric Collection", source: "", colors: [])
}

struct PaletteColor: Codable, Identifiable {
    var id: String
    var name: String
    var hex: String

    /// Color-selection fields (phrase/category/settings) store either a palette
    /// swatch id or a literal "#RRGGBB" hex string directly — this tells the two apart.
    static func isHex(_ value: String) -> Bool {
        guard value.hasPrefix("#"), value.count == 7 else { return false }
        return value.dropFirst().allSatisfy(\.isHexDigit)
    }
}

extension JSONDecoder {
    static var quickText: JSONDecoder {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return decoder
    }
}

extension JSONEncoder {
    static var quickText: JSONEncoder {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        return encoder
    }
}

func stringBinding(_ source: Binding<String?>, replacingNilWith fallback: String) -> Binding<String> {
    Binding<String>(
        get: { source.wrappedValue ?? fallback },
        set: { source.wrappedValue = $0 }
    )
}

func intBinding(_ source: Binding<Int?>, replacingNilWith fallback: Int) -> Binding<Int> {
    Binding<Int>(
        get: { source.wrappedValue ?? fallback },
        set: { source.wrappedValue = $0 }
    )
}

extension Color {
    init(hex: String) {
        let value = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: value).scanHexInt64(&int)
        let red = Double((int >> 16) & 0xff) / 255
        let green = Double((int >> 8) & 0xff) / 255
        let blue = Double(int & 0xff) / 255
        self.init(red: red, green: green, blue: blue)
    }

    /// For round-tripping a `ColorPicker` selection (including the system color
    /// panel's palettes/crayons/sliders tabs) back into our hex-string storage.
    var hexString: String {
        let rgb = NSColor(self).usingColorSpace(.deviceRGB) ?? NSColor(self)
        let r = Int((rgb.redComponent * 255).rounded())
        let g = Int((rgb.greenComponent * 255).rounded())
        let b = Int((rgb.blueComponent * 255).rounded())
        return String(format: "#%02X%02X%02X", r, g, b)
    }

    var readableForeground: Color {
        let rgb = NSColor(self).usingColorSpace(.deviceRGB) ?? NSColor(self)
        let luminance = (0.2126 * rgb.redComponent) + (0.7152 * rgb.greenComponent) + (0.0722 * rgb.blueComponent)
        return luminance > 0.58 ? .black : .white
    }
}

extension String {
    var fourCharCodeValue: FourCharCode {
        var result: FourCharCode = 0
        for scalar in unicodeScalars {
            result = (result << 8) + FourCharCode(scalar.value)
        }
        return result
    }
}

/// Sample data for #Preview canvases only. Not used at runtime.
enum PreviewData {
    static let plainPhrase = Phrase(
        id: "preview-plain",
        categoryId: "personal",
        title: "Agent Brief",
        summary: "Direct task brief",
        value: "Act as a pragmatic local-first coding agent.",
        color: "brown-13",
        textColor: "brown-22",
        fontSize: nil,
        image: nil,
        favorite: true,
        visibility: .public,
        tags: ["agent"],
        createdAt: Date(),
        updatedAt: Date(),
        atoms: nil
    )

    static let addressPhrase = Phrase(
        id: "preview-address",
        categoryId: "personal",
        title: "Home",
        summary: "Home",
        value: "20 Mechanic Square, No. 5\nMarblehead, MA 01945 ",
        color: "brown-13",
        textColor: "brown-22",
        fontSize: nil,
        image: nil,
        favorite: false,
        visibility: .localOnly,
        tags: ["address"],
        createdAt: Date(),
        updatedAt: Date(),
        atoms: [
            Atom(id: "atom-street", start: 0, end: 18, label: nil),
            Atom(id: "atom-unit", start: 20, end: 25, label: nil),
            Atom(id: "atom-city", start: 26, end: 36, label: nil),
            Atom(id: "atom-state", start: 38, end: 40, label: nil),
            Atom(id: "atom-zip", start: 41, end: 46, label: nil)
        ]
    )

    static let variablePhrase = Phrase(
        id: "preview-variable",
        categoryId: "personal",
        title: "Follow-up",
        summary: "Follow-up",
        value: "Hi {{name}}, following up on {{topic}}. Please respond by {{urgent/end of week}}.",
        color: "brown-13",
        textColor: "brown-22",
        fontSize: nil,
        image: nil,
        favorite: false,
        visibility: .localOnly,
        tags: ["email"],
        createdAt: Date(),
        updatedAt: Date(),
        atoms: nil
    )

    /// Mixes a resolved `{{@}}` text reference, a resolved `{{@}}` choice reference, and
    /// a deliberately dangling one (no matching library entry below) to preview
    /// `ExpandedCardView`'s unresolved-chip styling alongside ordinary inline placeholders.
    static let libraryVariablePhrase = Phrase(
        id: "preview-library-variable",
        categoryId: "personal",
        title: "Library Greeting",
        summary: "Library Greeting",
        value: "Hi {{@customer name}}, thanks for reaching out about {{@topic}}. Status: {{@retired field}}.",
        color: "brown-13",
        textColor: "brown-22",
        fontSize: nil,
        image: nil,
        favorite: false,
        visibility: .localOnly,
        tags: ["email"],
        createdAt: Date(),
        updatedAt: Date(),
        atoms: nil
    )

    static let store: CorpusStore = {
        let store = CorpusStore()
        store.corpus = QuickTextCorpus(
            version: 1,
            updatedAt: Date(),
            settings: Settings(defaultFontSize: 18, defaultTileColor: "brown-13", defaultTextColor: "brown-22", defaultFontFamily: "sans", paletteSource: "Robert Brown Fabric Collection"),
            categories: [Category(id: "personal", name: "Personal", sortOrder: 10)],
            phrases: [plainPhrase, addressPhrase, variablePhrase, libraryVariablePhrase],
            variables: [
                LibraryVariable(id: "var-customer-name", name: "customer name", type: .text, options: nil, value: nil),
                LibraryVariable(id: "var-topic", name: "topic", type: .choice, options: ["billing", "support", "onboarding"], value: nil)
            ]
        )
        store.palette = Palette(
            name: "Robert Brown Fabric Collection",
            source: "",
            colors: [
                PaletteColor(id: "brown-13", name: "Invisible Green 56", hex: "#2E301D"),
                PaletteColor(id: "brown-22", name: "Sand Trap Lifted Midtone", hex: "#E2D6CF")
            ]
        )
        return store
    }()
}
