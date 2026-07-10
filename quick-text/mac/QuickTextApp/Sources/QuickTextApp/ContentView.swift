import SwiftUI
import QuartzCore
import UniformTypeIdentifiers

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
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
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
    @State private var deleteCandidate: Phrase?
    private var deleteCandidateIsPresented: Binding<Bool> {
        Binding(get: { deleteCandidate != nil }, set: { isPresented in if !isPresented { deleteCandidate = nil } })
    }

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

    private var variablesPanelWidth: CGFloat {
        currentWindowWidth * 0.9
    }

    private var currentWindowHeight: CGFloat {
        NSApp.keyWindow?.contentLayoutRect.height ?? 520
    }

    private var variablesPanelHeight: CGFloat {
        currentWindowHeight * 0.9
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
                    if store.filteredPhrases.isEmpty {
                        emptyState
                    } else {
                        MasonryGrid(columnWidth: cardWidth, spacing: gridSpacing) {
                            ForEach(Array(store.filteredPhrases.enumerated()), id: \.element.id) { _, phrase in
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
                                    Button("Delete", role: .destructive) { deleteCandidate = phrase }
                                }
                                .onDrag {
                                    store.draggedPhraseID = phrase.id
                                    return NSItemProvider(object: phrase.id as NSString)
                                }
                                .onDrop(of: [.text], delegate: PhraseDropDelegate(target: phrase, store: store))
                            }
                        }
                        .padding(.vertical, 2)
                    }
                }
                .onAppear { gridWidth = geometry.size.width }
                .onChange(of: geometry.size.width) { _, width in gridWidth = width }
            }
            .padding(.top, 10)
            .background(
                RoundedRectangle(cornerRadius: 14)
                    .fill(focusedModule == .cards ? store.highlightColor.opacity(0.06) : Color.clear)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(store.highlightColor.opacity(focusedModule == .cards ? 0.18 : 0), lineWidth: 1)
            )
            .animation(reduceMotion ? nil : QuickTextMotion.standard, value: focusedModule)
            .contextMenu { gridContextMenu }
        }
        .padding(14)
        .background(store.gridBackgroundColor)
        .onAppear {
            store.load()
            store.startWatchingCorpus()
            installKeyMonitor()
            focusSearchSoon()
        }
        .onDisappear {
            removeKeyMonitor()
            store.stopWatchingCorpus()
        }
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
            // Only claim Cmd-C window-wide while the grid actually owns keyboard
            // focus; otherwise leave it unregistered so the search field, the
            // phrase editor sheet, and settings text fields keep native Cmd-C.
            if canUseGridKeyboard {
                Button(action: copySelected) {
                    Label("Copy", systemImage: "doc.on.doc")
                }
                .keyboardShortcut("c", modifiers: .command)
            } else {
                Button(action: copySelected) {
                    Label("Copy", systemImage: "doc.on.doc")
                }
            }
        }
        .overlay {
            if let phrase = store.expandedPhrase {
                ExpandedOverlayView(store: store, phrase: phrase)
                    .transition(.opacity)
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
        .overlay {
            if showingVariablesLibrary {
                ZStack {
                    Color.clear
                        .contentShape(Rectangle())
                        .onTapGesture(perform: closeFloatingPanels)

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
                        VariablesLibraryEditor(
                            width: variablesPanelWidth,
                            height: variablesPanelHeight,
                            onClose: closeFloatingPanels
                        )
                            .environmentObject(store)
                    }
                    .offset(
                        x: variablesPanelOffset.width + variablesPanelDragOffset.width,
                        y: variablesPanelOffset.height + variablesPanelDragOffset.height
                    )
                }
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
        .animation(reduceMotion ? nil : QuickTextMotion.panel, value: store.expandedPhraseID)
        .alert(
            "Delete \u{201C}\(deleteCandidate?.title ?? "")\u{201D}?",
            isPresented: deleteCandidateIsPresented,
            presenting: deleteCandidate
        ) { phrase in
            Button("Delete", role: .destructive) {
                store.delete(phrase)
                deleteCandidate = nil
            }
            Button("Cancel", role: .cancel) { deleteCandidate = nil }
        } message: { _ in
            Text("This can't be undone.")
        }
        .alert(
            "Quick Text Error",
            isPresented: Binding(get: { store.errorMessage != nil }, set: { isPresented in if !isPresented { store.errorMessage = nil } })
        ) {
            Button("OK") { store.errorMessage = nil }
        } message: {
            Text(store.errorMessage ?? "")
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
                .buttonStyle(.glass)
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
        .animation(reduceMotion ? nil : QuickTextMotion.micro, value: searchFocused)
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
        .animation(reduceMotion ? nil : QuickTextMotion.micro, value: isFocused)
    }

    private var emptyState: some View {
        VStack(spacing: 10) {
            Image(systemName: store.searchTerm.isEmpty ? "square.stack.3d.up" : "magnifyingglass")
                .font(.system(size: 28, weight: .light))
                .foregroundStyle(.secondary)
            Text(store.searchTerm.isEmpty ? "No phrases yet" : "No phrases found")
                .font(.title3.weight(.semibold))
            Text(store.searchTerm.isEmpty ? "Create a phrase to begin building your library." : "Try a different search or clear the current filter.")
                .font(.body)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            if store.searchTerm.isEmpty {
                Button("New Phrase") { store.beginNewPhrase() }
                    .buttonStyle(.glassProminent)
                    .tint(store.highlightColor)
                    .padding(.top, 4)
            } else {
                Button("Clear Search") { store.clearSearch() }
                    .buttonStyle(.glass)
                    .padding(.top, 4)
            }
        }
        .frame(maxWidth: .infinity, minHeight: 240)
        .padding(32)
    }

    /// Expands the window to ~80% of the display when a card expands, since the
    /// expanded card overlay fills the window rather than floating independently.
    private func resizeWindowForExpansion(expanding: Bool) {
        guard let window = NSApp.keyWindow ?? NSApp.windows.first else { return }
        let reduceMotion = NSWorkspace.shared.accessibilityDisplayShouldReduceMotion
        if expanding {
            guard savedWindowFrame == nil else { return }
            savedWindowFrame = window.frame
            if let screen = window.screen ?? NSScreen.main {
                let visible = screen.visibleFrame
                let size = NSSize(width: visible.width * 0.8, height: visible.height * 0.8)
                let origin = NSPoint(x: visible.midX - size.width / 2, y: visible.midY - size.height / 2)
                let target = NSRect(origin: origin, size: size)
                if reduceMotion {
                    window.setFrame(target, display: true, animate: false)
                } else {
                    NSAnimationContext.runAnimationGroup { context in
                        context.duration = QuickTextMotion.panelDuration
                        context.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
                        window.animator().setFrame(target, display: true)
                    }
                }
            }
        } else if let frame = savedWindowFrame {
            if reduceMotion {
                window.setFrame(frame, display: true, animate: false)
            } else {
                NSAnimationContext.runAnimationGroup { context in
                    context.duration = QuickTextMotion.panelDuration
                    context.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
                    window.animator().setFrame(frame, display: true)
                }
            }
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
        // Escape (keyCode 53) is handled by the early guard above this switch —
        // this case would be unreachable.
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

/// Live-reorders the grid while dragging (mirrors List's onMove UX), then
/// persists the new order to disk once the drop completes.
struct PhraseDropDelegate: DropDelegate {
    let target: Phrase
    let store: CorpusStore

    func dropEntered(info: DropInfo) {
        guard let draggedID = store.draggedPhraseID, draggedID != target.id else { return }
        if NSWorkspace.shared.accessibilityDisplayShouldReduceMotion {
            store.movePhrase(draggedID, before: target.id)
        } else {
            withAnimation(QuickTextMotion.standard) {
                store.movePhrase(draggedID, before: target.id)
            }
        }
    }

    func performDrop(info: DropInfo) -> Bool {
        store.finishReorder()
        return true
    }
}
