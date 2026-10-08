import SwiftUI
import UniformTypeIdentifiers

#Preview("Content View") {
    ContentView()
        .environmentObject(PreviewData.store)
        .environmentObject(DictateSession())
        .frame(width: 1280, height: 900)
}

/// The three top-level keyboard-navigable regions. Tab cycles between these;
/// arrow keys navigate *within* whichever one is focused.
private enum FocusModule: Int, CaseIterable {
    case sidebar, search, cards
}

private enum LibraryLayout: String {
    case grid, list
}

struct ContentView: View {
    @EnvironmentObject private var store: CorpusStore
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @FocusState private var searchFocused: Bool
    @AppStorage("QuickText.sidebarVisible") private var sidebarVisible = true
    @AppStorage("QuickText.libraryLayout") private var layoutRaw = LibraryLayout.grid.rawValue
    @State private var showingDictionary = false
    @State private var dictionaryPanelOffset = CGSize.zero
    @State private var dictionaryPanelDragOffset = CGSize.zero
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
    @State private var showingDictate = false
    /// Owned by the app (not DictateView) so takes and results survive leaving
    /// the page, and Quick Dictate can hand takes to it.
    @EnvironmentObject private var dictateSession: DictateSession
    /// Sidebar-initiated sync uses the same compute → preview → apply flow as
    /// Settings' Sync Now, without opening the Settings panel.
    @State private var pendingSidebarSyncPlan: TextReplacementSync.SyncPlan?
    @State private var isSyncingShortcuts = false
    @State private var contentWidth: CGFloat = 0
    @State private var windowSize = CGSize(width: 1280, height: 900)
    @State private var keyMonitor: Any?
    @State private var focusedModule: FocusModule = .search
    @State private var deleteCandidate: Phrase?
    private var deleteCandidateIsPresented: Binding<Bool> {
        Binding(get: { deleteCandidate != nil }, set: { isPresented in if !isPresented { deleteCandidate = nil } })
    }
    /// Extracted from the `.alert` call below: the interpolated form timed out
    /// the type-checker on newer toolchains, while plain concatenation checks
    /// trivially. Same rendered string.
    private var deleteAlertTitle: String {
        "Delete \u{201C}" + (deleteCandidate?.title ?? "") + "\u{201D}?"
    }
    /// Extracted from the error `.alert` call below for the same type-checker
    /// timeout reason as `deleteAlertTitle`/`deleteCandidateIsPresented`.
    private var errorAlertIsPresented: Binding<Bool> {
        Binding(get: { store.errorMessage != nil }, set: { isPresented in if !isPresented { store.errorMessage = nil } })
    }

    private var layout: LibraryLayout { LibraryLayout(rawValue: layoutRaw) ?? .grid }

    private var columnCount: Int {
        layout == .list ? 1 : Theme.columnCount(for: contentWidth)
    }

    private var standardPanelWidth: CGFloat {
        min(max(windowSize.width * 0.6, 420), windowSize.width * 0.9)
    }

    private var settingsPanelWidth: CGFloat {
        min(max(windowSize.width * 0.6, 560), windowSize.width * 0.9)
    }

    private var showVariablesLibraryButton: Bool {
        store.corpus.settings.showVariablesLibraryButton ?? Settings.defaultShowVariablesLibraryButton
    }

    private var anyPanelOpen: Bool {
        showingDictionary || showingSettings || showingVariablesLibrary || showingKeyboardShortcuts || showingGlossary
    }

    var body: some View {
        HStack(spacing: 0) {
            if sidebarVisible {
                sidebar
                    .transition(.move(edge: .leading))
            }
            ZStack {
                if showingDictate {
                    DictateView(session: dictateSession, sidebarVisible: $sidebarVisible, onClose: { closeDictate() })
                        .environmentObject(store)
                        .transition(dictateTransition)
                } else {
                    VStack(spacing: 0) {
                        header
                        library
                    }
                    .transition(.opacity)
                }
            }
            .background(Theme.bgContent)
        }
        .background(Theme.bgContent)
        .ignoresSafeArea(.container, edges: .top)
        .onGeometryChange(for: CGSize.self) { $0.size } action: { windowSize = $0 }
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
            guard store.editingPhrase == nil, !anyPanelOpen else { return }
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
        .onReceive(NotificationCenter.default.publisher(for: .quickTextOpenDictate)) { _ in
            openDictate()
        }
        .onChange(of: store.searchTerm) { _, _ in
            store.searchTermDidChange()
        }
        .onChange(of: searchFocused) { _, focused in
            if focused { focusedModule = .search }
        }
        .onChange(of: store.expandedPhraseID) { oldValue, newValue in
            // Focus returns to the source tile when the card closes.
            if oldValue != nil, newValue == nil { setFocusedModule(.cards) }
        }
        .onExitCommand {
            handleEscape()
        }
        .sheet(item: $store.editingPhrase) { phrase in
            PhraseEditor(phrase: phrase)
                .environmentObject(store)
        }
        .sheet(isPresented: Binding(get: { pendingSidebarSyncPlan != nil }, set: { if !$0 { pendingSidebarSyncPlan = nil } })) {
            if let plan = pendingSidebarSyncPlan {
                TextReplacementSyncPreviewSheet(
                    plan: plan,
                    onCancel: { pendingSidebarSyncPlan = nil },
                    onConfirm: {
                        // Same off-main-thread contract as Settings' Sync Now:
                        // the KeyboardServices reply needs the main queue free.
                        isSyncingShortcuts = true
                        pendingSidebarSyncPlan = nil
                        store.applyTextReplacementSync(plan) { report in
                            isSyncingShortcuts = false
                            if let reason = report.failureReason {
                                store.errorMessage = reason
                            }
                        }
                    }
                )
            }
        }
        .overlay {
            ExpandedOverlayView(store: store, onDelete: { deleteCandidate = $0 })
        }
        .overlay(alignment: .bottom) { copiedToast }
        .overlay { floatingPanels }
        .alert(
            deleteAlertTitle,
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
            isPresented: errorAlertIsPresented
        ) {
            Button("OK") { store.errorMessage = nil }
        } message: {
            Text(store.errorMessage ?? "")
        }
    }

    /// Dictate is a page in the content area: 24 pt trailing slide plus fade
    /// (220 ms open, 160 ms close). Reduce Motion cross-fades only.
    private var dictateTransition: AnyTransition {
        reduceMotion ? .opacity : .opacity.combined(with: .offset(x: 24))
    }

    private func openDictate() {
        guard !showingDictate else { return }
        withAnimation(reduceMotion ? Theme.Motion.pageReduced : Theme.Motion.pageOpen) { showingDictate = true }
    }

    private func closeDictate(focusSearchAfterClose: Bool = true) {
        withAnimation(reduceMotion ? Theme.Motion.pageReduced : Theme.Motion.pageClose) { showingDictate = false }
        // Focus returns to the library.
        if focusSearchAfterClose { focusSearchSoon() }
    }

    /// Window-level confirmation for every copy path (tile, keyboard, card).
    private var copiedToast: some View {
        ZStack {
            if store.copiedPhraseID != nil {
                CopiedToast()
                    .transition(reduceMotion ? .opacity : .opacity.combined(with: .offset(y: 6)))
            }
        }
        .animation(reduceMotion ? nil : Theme.Motion.fade, value: store.copiedPhraseID)
        .padding(.bottom, 28)
        .allowsHitTesting(false)
    }

    /// Settings, Variables Library, Keyboard Shortcuts, and Glossary panels.
    /// Extracted from `body` to keep it under the type-checker's limit.
    private var floatingPanels: some View {
        ZStack(alignment: .topTrailing) {
            Color.clear
                .allowsHitTesting(false)
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
                            width: windowSize.width * 0.9,
                            height: windowSize.height * 0.9,
                            onClose: closeFloatingPanels
                        )
                            .environmentObject(store)
                    }
                    .offset(
                        x: variablesPanelOffset.width + variablesPanelDragOffset.width,
                        y: variablesPanelOffset.height + variablesPanelDragOffset.height
                    )
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .zIndex(2)
            }
            if showingDictionary {
                FloatingPanel(
                    title: "Dictation Dictionary",
                    systemImage: "character.book.closed",
                    onClose: closeFloatingPanels,
                    onDragEnded: {
                        dictionaryPanelOffset.width += dictionaryPanelDragOffset.width
                        dictionaryPanelOffset.height += dictionaryPanelDragOffset.height
                        dictionaryPanelDragOffset = .zero
                    },
                    dragOffset: $dictionaryPanelDragOffset
                ) {
                    DictationDictionaryEditor(
                        width: standardPanelWidth,
                        height: min(560, windowSize.height * 0.75)
                    )
                }
                .frame(width: standardPanelWidth)
                .offset(
                    x: dictionaryPanelOffset.width + dictionaryPanelDragOffset.width,
                    y: dictionaryPanelOffset.height + dictionaryPanelDragOffset.height
                )
                .padding(.top, 64)
                .padding(.trailing, 12)
                .zIndex(2)
            }
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
                .padding(.top, 64)
                .padding(.trailing, 12)
                .zIndex(2)
            }
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
                .padding(.top, 64)
                .padding(.trailing, 12)
                .zIndex(3)
            }
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
                .padding(.top, 64)
                .padding(.trailing, 12)
                .zIndex(4)
            }
        }
    }

    // MARK: - Sidebar

    private var sidebar: some View {
        VStack(alignment: .leading, spacing: 28) {
            sidebarGroup("Library") {
                SidebarRow(title: "All Snippets", systemImage: "rectangle.stack", isSelected: store.isTabSelected("all"), showsFocus: focusedModule == .sidebar) {
                    selectSidebar("all")
                }
                SidebarRow(title: "Favorites", systemImage: "star", isSelected: store.isTabSelected("favorites"), showsFocus: focusedModule == .sidebar) {
                    selectSidebar("favorites")
                }
                SidebarRow(title: "Recently Used", systemImage: "clock", isSelected: store.isTabSelected("recent"), showsFocus: focusedModule == .sidebar) {
                    selectSidebar("recent")
                }
            }

            sidebarGroup("Collections") {
                ForEach(store.sortedCategories) { category in
                    SidebarRow(title: category.name, dotColor: store.dotColor(for: category.id), isSelected: store.isTabSelected(category.id), showsFocus: focusedModule == .sidebar) {
                        selectSidebar(category.id)
                    }
                }
            }

            Spacer(minLength: 0)

            VStack(alignment: .leading, spacing: 2) {
                if showVariablesLibraryButton {
                    SidebarRow(title: "Variables", systemImage: "curlybraces", isSelected: showingVariablesLibrary, showsFocus: false) {
                        openVariablesPanel()
                    }
                }
                SidebarRow(title: "Dictionary", systemImage: "character.book.closed", isSelected: showingDictionary, showsFocus: false) {
                    openDictionaryPanel()
                }
                SidebarRow(title: "Settings", systemImage: "gearshape", isSelected: showingSettings, showsFocus: false) {
                    openSettingsPanel()
                }
                SidebarRow(title: isSyncingShortcuts ? "Syncing…" : "Sync Shortcuts", systemImage: "arrow.triangle.2.circlepath", isSelected: false, showsFocus: false) {
                    syncShortcutsFromSidebar()
                }
                .help("Sync text replacement shortcuts (same as Settings > Text Replacements > Sync Now)")
            }
            .padding(.top, 14)
            .overlay(alignment: .top) {
                Rectangle().fill(Theme.rule).frame(height: 1)
            }
        }
        // Clears the window's traffic lights, which sit over the sidebar's top edge.
        .padding(.top, 64)
        .padding(.horizontal, 14)
        .padding(.bottom, 18)
        .frame(width: 260)
        .frame(maxHeight: .infinity, alignment: .top)
        .background(Theme.bgSidebar)
        .overlay(alignment: .trailing) {
            Rectangle().fill(Theme.rule).frame(width: 1)
        }
        .accessibilityElement(children: .contain)
        .accessibilityLabel("Collections")
    }

    private func sidebarGroup<Content: View>(_ title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(title.uppercased())
                .font(ThemeFont.eyebrow())
                .tracking(11 * 0.06)
                .foregroundStyle(Theme.textTertiary)
                .padding(.horizontal, 10)
                .padding(.bottom, 8)
                .accessibilityAddTraits(.isHeader)
            content()
        }
    }

    private func selectSidebar(_ id: String) {
        store.selectTab(id)
        focusedModule = .sidebar
        searchFocused = false
        if showingDictate {
            // Leaving while recording stops the take first, so audio is never
            // lost silently. Session state (takes, result) is owned by
            // `dictateSession` above, so it survives the page closing and is
            // restored intact when Dictate reopens.
            if dictateSession.isRecording { dictateSession.stopRecording() }
            closeDictate(focusSearchAfterClose: false)
        }
    }

    // MARK: - Header

    private var header: some View {
        HStack(spacing: 12) {
            Button {
                withAnimation(reduceMotion ? nil : Theme.Motion.sheet) { sidebarVisible.toggle() }
            } label: {
                Image(systemName: "sidebar.left")
                    .font(.system(size: 15, weight: .regular))
                    .foregroundStyle(Theme.textSecondary)
            }
            .buttonStyle(IconButtonStyle())
            .accessibilityLabel(sidebarVisible ? "Hide sidebar" : "Show sidebar")

            Text("Quick Text")
                .font(.system(size: 14, weight: .semibold))
                .tracking(-0.14)
                .foregroundStyle(Theme.textPrimary)

            Spacer(minLength: 12)

            searchField

            Button { openDictate() } label: {
                Image(systemName: "mic")
                    .font(.system(size: 15, weight: .regular))
                    .foregroundStyle(Theme.textSecondary)
            }
            .buttonStyle(IconButtonStyle())
            .keyboardShortcut("d", modifiers: .command)
            .accessibilityLabel("Dictate snippet")
            .help("Dictate (⌘D)")

            Rectangle()
                .fill(Theme.rule)
                .frame(width: 1, height: 20)
                .padding(.horizontal, 4)

            Button { store.beginNewPhrase() } label: {
                HStack(spacing: 6) {
                    Image(systemName: "plus")
                        .font(.system(size: 12, weight: .bold))
                    Text("New Snippet")
                }
            }
            .buttonStyle(AccentButtonStyle())
        }
        // Leaves room for the traffic lights when the sidebar is hidden.
        .padding(.leading, sidebarVisible ? 16 : 84)
        .padding(.trailing, 20)
        .frame(height: 56)
        .overlay(alignment: .bottom) {
            Rectangle().fill(Theme.rule).frame(height: 1)
        }
        .background { shortcutButtons }
    }

    private var searchField: some View {
        HStack(spacing: 8) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(Theme.textTertiary)
            TextField("Search snippets", text: $store.searchTerm)
                .textFieldStyle(.plain)
                .font(.system(size: 13))
                .foregroundStyle(Theme.textPrimary)
                .focused($searchFocused)
                .focusEffectDisabled()
                .onSubmit { copySelected() }
                .accessibilityLabel("Search snippets")
            if store.searchTerm.isEmpty {
                KeyCap(text: "⌘K")
                    .foregroundStyle(Theme.textTertiary)
                    .accessibilityHidden(true)
            } else {
                Button { store.clearSearch() } label: {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 13))
                        .foregroundStyle(Theme.textTertiary)
                        .frame(width: 22, height: 22)
                        .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Clear search")
            }
        }
        .padding(.leading, 12)
        .padding(.trailing, 8)
        .frame(minWidth: 180, idealWidth: 300, maxWidth: 300)
        .frame(height: 34)
        .background(RoundedRectangle(cornerRadius: Theme.Radius.search).fill(Theme.bgField))
        .overlay(RoundedRectangle(cornerRadius: Theme.Radius.search).strokeBorder(searchFocused ? Theme.hl : Theme.borderField, lineWidth: 1))
        .focusRing(searchFocused, cornerRadius: Theme.Radius.search)
        .animation(reduceMotion ? nil : Theme.Motion.hover, value: searchFocused)
    }

    /// Invisible buttons that own window-level shortcuts. Cmd-C is only claimed
    /// while the grid owns keyboard focus, so text fields keep native copy.
    @ViewBuilder
    private var shortcutButtons: some View {
        ZStack {
            Button("Search") { setFocusedModule(.search) }
                .keyboardShortcut("k", modifiers: .command)
            Button("Find") { setFocusedModule(.search) }
                .keyboardShortcut("f", modifiers: .command)
            if canUseGridKeyboard {
                Button("Copy") { copySelected() }
                    .keyboardShortcut("c", modifiers: .command)
            }
        }
        .opacity(0)
        .frame(width: 0, height: 0)
        .accessibilityHidden(true)
    }

    // MARK: - Library

    private var library: some View {
        ScrollViewReader { proxy in
            ScrollView {
                VStack(alignment: .leading, spacing: 36) {
                    libraryHeader
                    if store.sections.isEmpty {
                        emptyState
                    } else {
                        ForEach(store.sections) { section in
                            sectionView(section)
                        }
                    }
                }
                .padding(.top, 44)
                .padding(.horizontal, 56)
                .padding(.bottom, 48)
                .frame(maxWidth: .infinity, alignment: .leading)
                .onGeometryChange(for: CGFloat.self) { $0.size.width - 112 } action: { contentWidth = $0 }
            }
            .scrollIndicators(.automatic)
            .onChange(of: store.selectedPhraseID) { _, selectedID in
                guard focusedModule == .cards, let selectedID else { return }
                if reduceMotion {
                    proxy.scrollTo(selectedID, anchor: nil)
                } else {
                    withAnimation(Theme.Motion.hover) { proxy.scrollTo(selectedID, anchor: nil) }
                }
            }
        }
        .contextMenu { gridContextMenu }
    }

    private var libraryHeader: some View {
        HStack(alignment: .bottom, spacing: 24) {
            VStack(alignment: .leading, spacing: 6) {
                Text(store.viewEyebrow.uppercased())
                    .font(ThemeFont.eyebrow())
                    .tracking(11 * 0.12)
                    .foregroundStyle(Theme.accent)
                Text(store.viewTitle)
                    .font(ThemeFont.serif(52))
                    .tracking(52 * -0.02)
                    .foregroundStyle(Theme.textPrimary)
                    .lineLimit(1)
                    .minimumScaleFactor(0.6)
                    .accessibilityAddTraits(.isHeader)
            }
            Spacer(minLength: 12)
            HStack(spacing: 12) {
                layoutToggle
                if store.activeCategoryID != "recent" {
                    sortMenu
                }
            }
            .padding(.bottom, 6)
        }
    }

    private var layoutToggle: some View {
        HStack(spacing: 0) {
            layoutButton(.grid, systemImage: "square.grid.2x2", label: "Grid view")
            layoutButton(.list, systemImage: "list.bullet", label: "List view")
        }
        .padding(2)
        .background(RoundedRectangle(cornerRadius: Theme.Radius.search).fill(Theme.bgField))
        .overlay(RoundedRectangle(cornerRadius: Theme.Radius.search).strokeBorder(Theme.borderField, lineWidth: 1))
        .accessibilityElement(children: .contain)
        .accessibilityLabel("View")
    }

    private func layoutButton(_ value: LibraryLayout, systemImage: String, label: String) -> some View {
        let isOn = layout == value
        return Button { layoutRaw = value.rawValue } label: {
            Image(systemName: systemImage)
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(isOn ? Theme.textPrimary : Theme.textTertiary)
                .frame(width: 34, height: 28)
                .background(RoundedRectangle(cornerRadius: 7).fill(isOn ? Theme.segmentOn : Color.clear))
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel(label)
        .accessibilityAddTraits(isOn ? .isSelected : [])
    }

    private var sortMenu: some View {
        Menu {
            Picker("Sort", selection: $store.librarySort) {
                ForEach(LibrarySort.allCases) { sort in
                    Text(sort.label).tag(sort)
                }
            }
            .pickerStyle(.inline)
        } label: {
            HStack(spacing: 6) {
                Text(store.librarySort.label)
                Image(systemName: "chevron.down")
                    .font(.system(size: 10, weight: .semibold))
            }
            .font(.system(size: 13))
            .foregroundStyle(Theme.textSecondary)
            .padding(.leading, 12)
            .padding(.trailing, 10)
            .frame(height: 34)
            .overlay(RoundedRectangle(cornerRadius: Theme.Radius.search).strokeBorder(Theme.borderField, lineWidth: 1))
            .contentShape(Rectangle())
        }
        .menuStyle(.button)
        .buttonStyle(.plain)
        .menuIndicator(.hidden)
        .fixedSize()
        .accessibilityLabel("Sort by \(store.librarySort.label)")
    }

    private func sectionView(_ section: PhraseSection) -> some View {
        VStack(alignment: .leading, spacing: 18) {
            if let title = section.title {
                HStack(spacing: 14) {
                    Text(title)
                        .font(ThemeFont.serif(24, italic: true))
                        .foregroundStyle(Theme.textPrimary)
                        .accessibilityAddTraits(.isHeader)
                    Text("\(section.phrases.count)")
                        .font(.system(size: 12))
                        .monospacedDigit()
                        .foregroundStyle(Theme.textTertiary)
                    Rectangle()
                        .fill(Theme.rule)
                        .frame(height: 1)
                }
            }
            if layout == .list {
                VStack(spacing: 8) {
                    ForEach(section.phrases) { phrase in
                        row(for: phrase)
                    }
                }
            } else {
                LazyVGrid(
                    columns: Array(repeating: GridItem(.flexible(), spacing: Theme.gridSpacing, alignment: .top), count: columnCount),
                    alignment: .leading,
                    spacing: Theme.gridSpacing
                ) {
                    ForEach(section.phrases) { phrase in
                        tile(for: phrase)
                    }
                }
            }
        }
    }

    private func tile(for phrase: Phrase) -> some View {
        TileView(
            phrase: phrase,
            categoryName: store.categoryName(for: phrase.categoryId),
            dotColor: store.dotColor(for: phrase.categoryId),
            libraryVariables: store.libraryVariables,
            searchTerm: store.trimmedSearchTerm,
            isSelected: isShowingSelection(phrase),
            isOpen: store.expandedPhraseID == phrase.id,
            isCopied: store.copiedPhraseID == phrase.id && store.expandedPhraseID == nil,
            opensCard: true,
            onActivate: { activate(phrase) },
            onToggleFavorite: { store.toggleFavorite(phrase) },
            onCopy: { select(phrase); store.copy(phrase) }
        )
        .id(phrase.id)
        .simultaneousGesture(TapGesture(count: 2).onEnded { open(phrase) })
        .contextMenu { tileContextMenu(for: phrase) }
        .onDrag {
            store.draggedPhraseID = phrase.id
            return NSItemProvider(object: phrase.id as NSString)
        }
        .onDrop(of: [.text], delegate: PhraseDropDelegate(target: phrase, store: store))
    }

    private func row(for phrase: Phrase) -> some View {
        PhraseRowView(
            phrase: phrase,
            categoryName: store.categoryName(for: phrase.categoryId),
            dotColor: store.dotColor(for: phrase.categoryId),
            libraryVariables: store.libraryVariables,
            searchTerm: store.trimmedSearchTerm,
            isSelected: isShowingSelection(phrase),
            isOpen: store.expandedPhraseID == phrase.id,
            isCopied: store.copiedPhraseID == phrase.id && store.expandedPhraseID == nil,
            onActivate: { activate(phrase) },
            onToggleFavorite: { store.toggleFavorite(phrase) }
        )
        .id(phrase.id)
        .simultaneousGesture(TapGesture(count: 2).onEnded { open(phrase) })
        .contextMenu { tileContextMenu(for: phrase) }
    }

    /// Selection is drawn only while the grid owns keyboard focus, so the
    /// implicit "first result" used by Return-from-search stays invisible.
    private func isShowingSelection(_ phrase: Phrase) -> Bool {
        focusedModule == .cards && store.selectedPhraseID == phrase.id && store.expandedPhraseID == nil
    }

    @ViewBuilder
    private func tileContextMenu(for phrase: Phrase) -> some View {
        Button("Copy") { select(phrase); store.copy(phrase) }
        Button("Open") { open(phrase) }
        Button(phrase.favorite ? "Remove from Favorites" : "Add to Favorites") { store.toggleFavorite(phrase) }
        Divider()
        Button("Edit") { store.beginEditing(phrase) }
        Button("Duplicate") { store.duplicate(phrase) }
        Button("Delete", role: .destructive) { deleteCandidate = phrase }
    }

    private var emptyState: some View {
        let searching = !store.trimmedSearchTerm.isEmpty
        return VStack(alignment: .leading, spacing: 10) {
            Text(searching ? "No snippets found" : emptyTitle)
                .font(ThemeFont.serif(26, weight: .medium))
                .foregroundStyle(Theme.textPrimary)
            Text(searching ? "Try a different search, or press Esc to clear it." : emptyMessage)
                .font(.system(size: 13))
                .foregroundStyle(Theme.textSecondary)
            if searching {
                Button("Clear Search") { store.clearSearch() }
                    .buttonStyle(OutlineButtonStyle(height: 34))
                    .padding(.top, 6)
            } else if store.activeCategoryID != "favorites" && store.activeCategoryID != "recent" {
                Button { store.beginNewPhrase() } label: {
                    HStack(spacing: 6) {
                        Image(systemName: "plus").font(.system(size: 12, weight: .bold))
                        Text("New Snippet")
                    }
                }
                .buttonStyle(AccentButtonStyle())
                .padding(.top, 6)
            }
        }
        .padding(.vertical, 24)
    }

    private var emptyTitle: String {
        switch store.activeCategoryID {
        case "favorites": "No favorites yet"
        case "recent": "Nothing used yet"
        default: "No snippets yet"
        }
    }

    private var emptyMessage: String {
        switch store.activeCategoryID {
        case "favorites": "Star a snippet to keep it here."
        case "recent": "Snippets you copy will appear here."
        default: "Create a snippet to begin building this collection."
        }
    }

    @ViewBuilder
    private var gridContextMenu: some View {
        Button("New Snippet") { store.beginNewPhrase() }
        Button("Edit Selected Snippet") { store.beginEditingSelectedPhrase() }
            .disabled(store.selectedPhrase == nil)
        Button("Copy Selected") { copySelected() }
            .disabled(store.selectedPhrase == nil)
        Divider()
        Button("Variables Library") { openVariablesPanel() }
        Button("Dictionary") { openDictionaryPanel() }
        Button("Settings") { openSettingsPanel() }
    }

    // MARK: - Actions

    private func select(_ phrase: Phrase) {
        store.selectedPhraseID = phrase.id
        focusedModule = .cards
        searchFocused = false
    }

    /// Click: always opens the card. Copy is the card's Copy / Copy & Close.
    private func activate(_ phrase: Phrase) {
        open(phrase)
    }

    private func open(_ phrase: Phrase) {
        select(phrase)
        store.expandedPhraseID = phrase.id
    }

    private func openSelected() {
        if let phrase = store.selectedPhrase { open(phrase) }
    }

    private func copySelected() {
        if let phrase = store.selectedPhrase {
            store.copy(phrase)
        }
    }

    private var isEditingText: Bool {
        NSApp.keyWindow?.firstResponder is NSTextView
    }

    private var canUseGridKeyboard: Bool {
        store.expandedPhraseID == nil && !anyPanelOpen && store.editingPhrase == nil && !searchFocused && !isEditingText
    }

    private func openDictionaryPanel() {
        closeFloatingPanels()
        showingDictionary = true
    }

    private func openSettingsPanel() {
        showingDictionary = false
        showingVariablesLibrary = false
        showingKeyboardShortcuts = false
        showingGlossary = false
        showingSettings = true
    }

    /// Sidebar shortcut to the existing text-replacement sync: computes the
    /// same plan as Settings' Sync Now and shows the same preview sheet, so a
    /// write never lands without review.
    private func syncShortcutsFromSidebar() {
        guard !isSyncingShortcuts, pendingSidebarSyncPlan == nil else { return }
        pendingSidebarSyncPlan = store.computeTextReplacementSyncPlan()
    }

    private func openVariablesPanel() {
        showingDictionary = false
        showingSettings = false
        showingKeyboardShortcuts = false
        showingGlossary = false
        showingVariablesLibrary = true
    }

    private func openKeyboardShortcutsPanel() {
        showingDictionary = false
        showingSettings = false
        showingVariablesLibrary = false
        showingGlossary = false
        showingKeyboardShortcuts = true
    }

    private func openGlossaryPanel() {
        showingDictionary = false
        showingSettings = false
        showingVariablesLibrary = false
        showingKeyboardShortcuts = false
        showingGlossary = true
    }

    private func closeFloatingPanels() {
        showingDictionary = false
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

    /// Switches which top-level region has keyboard focus, applying each
    /// module's entry default (search field ready to type; a card always
    /// selected once the grid is focused).
    private func setFocusedModule(_ module: FocusModule) {
        focusedModule = module
        switch module {
        case .sidebar:
            searchFocused = false
        case .search:
            searchFocused = true
        case .cards:
            searchFocused = false
            let displayed = store.displayedPhrases
            if store.selectedPhraseID == nil || !displayed.contains(where: { $0.id == store.selectedPhraseID }) {
                store.selectedPhraseID = displayed.first?.id
            }
        }
    }

    private func advanceFocusedModule(reverse: Bool) {
        let all = FocusModule.allCases.filter { $0 != .sidebar || sidebarVisible }
        let index = all.firstIndex(of: focusedModule) ?? 0
        setFocusedModule(all[(index + (reverse ? -1 : 1) + all.count) % all.count])
    }

    // MARK: - Keyboard

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
        // Sheets (phrase editor, prompt manager) are their own windows with their own keys.
        guard NSApp.keyWindow?.sheetParent == nil else { return event }
        // The Dictate page owns its keys (Esc, ⌘[, Return).
        guard !showingDictate else { return event }
        guard event.modifierFlags.intersection([.command, .option, .control]).isEmpty else { return event }

        // From the search field: Down hands off to the grid; Escape clears.
        if searchFocused, store.expandedPhraseID == nil, !anyPanelOpen {
            if event.keyCode == 125 {
                setFocusedModule(.cards)
                return nil
            }
            if event.keyCode == 53, !store.searchTerm.isEmpty {
                store.clearSearch()
                return nil
            }
        }

        // SwiftUI text controls are backed by NSTextView on macOS. Never consume
        // their arrows/selection keys in the app-wide navigator.
        guard !isEditingText else { return event }

        if event.keyCode == 53 {
            if anyPanelOpen || store.expandedPhraseID != nil || !store.searchTerm.isEmpty || focusedModule != .search {
                handleEscape()
                return nil
            }
            return event
        }
        guard store.editingPhrase == nil, !anyPanelOpen, store.expandedPhraseID == nil else { return event }

        switch event.keyCode {
        case 48: // Tab
            advanceFocusedModule(reverse: event.modifierFlags.contains(.shift))
            return nil
        case 44 where !event.modifierFlags.contains(.shift): // "/"
            setFocusedModule(.search)
            return nil
        case 123: // Left
            return handleHorizontal(-1) ? nil : event
        case 124: // Right
            return handleHorizontal(1) ? nil : event
        case 125: // Down
            return handleVertical(1) ? nil : event
        case 126: // Up
            return handleVertical(-1) ? nil : event
        case 49: // Space
            guard focusedModule == .cards else { return event }
            openSelected()
            return nil
        case 36, 76: // Return
            switch focusedModule {
            case .sidebar:
                setFocusedModule(.cards)
            case .search, .cards:
                copySelected()
            }
            return nil
        default:
            return event
        }
    }

    private func handleHorizontal(_ delta: Int) -> Bool {
        switch focusedModule {
        case .sidebar:
            guard delta > 0 else { return false }
            setFocusedModule(.cards)
            return true
        case .search:
            return false
        case .cards:
            store.moveSelection(delta)
            return true
        }
    }

    private func handleVertical(_ direction: Int) -> Bool {
        switch focusedModule {
        case .sidebar:
            store.moveSidebarSelection(direction)
            return true
        case .search:
            guard direction > 0 else { return false }
            setFocusedModule(.cards)
            return true
        case .cards:
            if !store.moveSelectionVertically(direction, columns: columnCount), direction < 0 {
                setFocusedModule(.search)
            }
            return true
        }
    }

    /// Escape order: panels, then the open card, then search, then selection.
    private func handleEscape() {
        if anyPanelOpen {
            closeFloatingPanels()
        } else if store.expandedPhraseID != nil {
            store.collapseExpanded()
        } else if !store.searchTerm.isEmpty {
            store.clearSearch()
            setFocusedModule(.search)
        } else if focusedModule != .search {
            setFocusedModule(.search)
        }
    }
}

/// Sidebar destination: 32 pt row, 8 pt radius, icon or collection dot.
private struct SidebarRow: View {
    let title: String
    var systemImage: String? = nil
    var dotColor: Color? = nil
    let isSelected: Bool
    let showsFocus: Bool
    let action: () -> Void
    @State private var isHovering = false

    var body: some View {
        Button(action: action) {
            HStack(spacing: dotColor == nil ? 10 : 12) {
                if let systemImage {
                    Image(systemName: systemImage)
                        .font(.system(size: 13, weight: .regular))
                        .foregroundStyle(isSelected ? Theme.accent : Theme.textSecondary)
                        .frame(width: 16)
                } else if let dotColor {
                    Circle()
                        .fill(dotColor)
                        .frame(width: 8, height: 8)
                        .padding(.leading, 2)
                }
                Text(title)
                    .font(.system(size: 13, weight: isSelected ? .medium : .regular))
                    .foregroundStyle(isSelected ? Theme.textPrimary : Theme.textSecondary)
                    .lineLimit(1)
                Spacer(minLength: 0)
            }
            .padding(.horizontal, 10)
            .frame(height: 32)
            .background(
                RoundedRectangle(cornerRadius: Theme.Radius.sidebarItem)
                    .fill(isSelected ? Theme.sidebarSelected : (isHovering ? Theme.sidebarHover : Color.clear))
            )
            .focusRing(isSelected && showsFocus, cornerRadius: Theme.Radius.sidebarItem)
            .contentShape(RoundedRectangle(cornerRadius: Theme.Radius.sidebarItem))
        }
        .buttonStyle(.plain)
        .onHover { isHovering = $0 }
        .accessibilityAddTraits(isSelected ? .isSelected : [])
    }
}

/// Live-reorders the grid while dragging (mirrors List's onMove UX), then
/// persists the new order to disk once the drop completes. Only active in
/// Manual Order with no search, where the grid shows raw corpus order.
struct PhraseDropDelegate: DropDelegate {
    let target: Phrase
    let store: CorpusStore

    func validateDrop(info: DropInfo) -> Bool {
        store.canReorder
    }

    func dropEntered(info: DropInfo) {
        guard store.canReorder, let draggedID = store.draggedPhraseID, draggedID != target.id else { return }
        if NSWorkspace.shared.accessibilityDisplayShouldReduceMotion {
            store.movePhrase(draggedID, before: target.id)
        } else {
            withAnimation(QuickTextMotion.standard) {
                store.movePhrase(draggedID, before: target.id)
            }
        }
    }

    func performDrop(info: DropInfo) -> Bool {
        guard store.canReorder else {
            store.draggedPhraseID = nil
            return false
        }
        store.finishReorder()
        return true
    }
}
