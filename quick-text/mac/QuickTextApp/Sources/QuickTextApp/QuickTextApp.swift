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
}

#Preview("Content View") {
    ContentView()
        .environmentObject(PreviewData.store)
        .frame(width: 720, height: 520)
}

struct ContentView: View {
    @EnvironmentObject private var store: CorpusStore
    @FocusState private var searchFocused: Bool
    @State private var showingSettings = false
    @State private var settingsPanelOffset = CGSize.zero
    @State private var settingsPanelDragOffset = CGSize.zero
    @State private var savedWindowFrame: NSRect?
    @State private var gridWidth: CGFloat = 0
    @State private var keyMonitor: Any?

    private let gridSpacing: CGFloat = 10

    private var cardWidth: CGFloat {
        CGFloat(store.corpus.settings.cardWidth ?? Settings.defaultCardWidth)
    }

    private var gridColumnCount: Int {
        max(Int((max(gridWidth, cardWidth) + gridSpacing) / (cardWidth + gridSpacing)), 1)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            categoryTabs

            HStack(spacing: 10) {
                searchField

                Button(action: { store.beginNewPhrase() }) {
                    Label("New", systemImage: "plus")
                }
                .buttonStyle(.glass)
                Button(action: { showingSettings = true }) {
                    Label("Settings", systemImage: "slider.horizontal.3")
                }
                .buttonStyle(.glass)
            }

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
                                isCopied: store.copiedPhraseID == phrase.id
                            )
                            .onTapGesture {
                                store.selectedPhraseID = phrase.id
                                store.expandedPhraseID = phrase.id
                                store.exitCategoryFocus()
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
            guard store.editingPhrase == nil, !showingSettings else { return }
            focusSearchSoon()
        }
        .onChange(of: store.searchTerm) { _, _ in
            store.searchTermDidChange()
        }
        .onExitCommand {
            handleEscape()
        }
        .onKeyPress(.downArrow) { moveSelection(gridColumnCount) }
        .onKeyPress(.rightArrow) { moveSelection(1) }
        .onKeyPress(.upArrow) { moveSelection(-gridColumnCount) }
        .onKeyPress(.leftArrow) { moveSelection(-1) }
        .onKeyPress(.space) {
            guard canUseGridKeyboard else { return .ignored }
            openSelected()
            return .handled
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
                FloatingSettingsPanel(
                    onClose: { showingSettings = false },
                    onDragEnded: {
                        settingsPanelOffset.width += settingsPanelDragOffset.width
                        settingsPanelOffset.height += settingsPanelDragOffset.height
                        settingsPanelDragOffset = .zero
                    },
                    dragOffset: $settingsPanelDragOffset
                ) {
                    SettingsEditor()
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
                }
            }
        }
    }

    private func moveSelection(_ delta: Int) -> KeyPress.Result {
        guard canUseGridKeyboard else { return .ignored }
        store.moveSelection(delta)
        return .handled
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
        Button("Settings") { showingSettings = true }
    }

    private var isEditingText: Bool {
        return NSApp.keyWindow?.firstResponder is NSTextView
    }

    private var canUseGridKeyboard: Bool {
        store.expandedPhraseID == nil && !showingSettings && store.editingPhrase == nil && !searchFocused && !isEditingText
    }

    private func focusSearchSoon() {
        DispatchQueue.main.async {
            searchFocused = true
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
        guard store.editingPhrase == nil, !showingSettings else { return event }
        guard event.modifierFlags.intersection([.command, .option, .control]).isEmpty else { return event }
        guard store.expandedPhraseID == nil else { return event }

        switch event.keyCode {
        case 48:
            store.advanceCategoryFocus(reverse: event.modifierFlags.contains(.shift))
            searchFocused = false
            return nil
        case 53:
            handleEscape()
            return nil
        case 123:
            guard canUseGridKeyboard else { return event }
            store.moveSelection(-1)
            return nil
        case 124:
            guard canUseGridKeyboard else { return event }
            store.moveSelection(1)
            return nil
        case 125:
            guard canUseGridKeyboard else { return event }
            store.moveSelection(gridColumnCount)
            return nil
        case 126:
            guard canUseGridKeyboard else { return event }
            store.moveSelection(-gridColumnCount)
            return nil
        case 49:
            guard canUseGridKeyboard else { return event }
            openSelected()
            return nil
        case 36, 76:
            guard canUseGridKeyboard else { return event }
            copySelected()
            return nil
        default:
            return event
        }
    }

    private func handleEscape() {
        if store.expandedPhraseID != nil {
            store.collapseExpanded()
        } else if !store.searchTerm.isEmpty {
            store.clearSearch()
            searchFocused = true
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
                .overlay {
                    Capsule()
                        .stroke(isSelected ? Color.white.opacity(0.38) : Color.primary.opacity(0.12), lineWidth: 1)
                }
        }
        .buttonStyle(.plain)
    }
}

struct FloatingSettingsPanel<Content: View>: View {
    let onClose: () -> Void
    let onDragEnded: () -> Void
    @Binding var dragOffset: CGSize
    @ViewBuilder let content: Content

    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 8) {
                Image(systemName: "slider.horizontal.3")
                    .foregroundStyle(.secondary)
                Text("Settings")
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
                    .foregroundStyle(textColor)
                    .lineLimit(imageURL == nil ? 4 : 3)
                    .minimumScaleFactor(0.72)
                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity, alignment: .topLeading)
        }
        .padding(12)
        .frame(minHeight: tileMinHeight, alignment: .topLeading)
        .background(backgroundColor)
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(isSelected ? Color.primary : backgroundColor.opacity(0.5), lineWidth: isSelected ? 2 : 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 8))
        .overlay {
            CopiedBadge(isVisible: isCopied, color: backgroundColor)
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
                    SelectableTextEditor(text: $phrase.value, selectedRange: $selectedRange)
                        .frame(minHeight: 180)
                        .overlay(RoundedRectangle(cornerRadius: 6).stroke(Color.secondary.opacity(0.3)))
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
            Text("Variables").font(.caption).foregroundStyle(.secondary)
            let variables = detectedVariables
            if variables.isEmpty {
                Text("No variables detected. Use {{setting}} or {{option one/option two}}.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            } else {
                FlowLayout(spacing: 6) {
                    ForEach(variables, id: \.self) { variable in
                        Text(variable)
                            .font(.caption)
                            .lineLimit(1)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(Color.secondary.opacity(0.14))
                            .clipShape(Capsule())
                    }
                }
            }
        }
    }

    private var detectedVariables: [String] {
        let pattern = #"\{\{([^{}]+)\}\}"#
        guard let regex = try? NSRegularExpression(pattern: pattern) else { return [] }
        let text = phrase.value
        let nsRange = NSRange(text.startIndex..<text.endIndex, in: text)
        var seen = Set<String>()
        return regex.matches(in: text, range: nsRange).compactMap { match in
            guard let range = Range(match.range(at: 1), in: text) else { return nil }
            let value = String(text[range]).trimmingCharacters(in: .whitespacesAndNewlines)
            guard !value.isEmpty, !seen.contains(value) else { return nil }
            seen.insert(value)
            return value
        }
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

#Preview("Phrase Editor - Atomic") {
    PhraseEditor(phrase: PreviewData.addressPhrase)
        .environmentObject(PreviewData.store)
}

/// Every control here writes straight through to `store.corpus.settings` on
/// change (via `settings`, a computed `Binding`) — there's no draft state and
/// no Save button, so text size, card size, colors, and font apply live.
struct SettingsEditor: View {
    @EnvironmentObject private var store: CorpusStore
    @State private var editingColorTarget: ColorEditTarget?
    @State private var didCopyPath = false

    private var settings: Binding<Settings> {
        Binding(
            get: { store.corpus.settings },
            set: { store.saveSettings($0) }
        )
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                HStack(alignment: .top, spacing: 18) {
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
                            Button {
                                copyCorpusPath()
                            } label: {
                                Label(didCopyPath ? "Path copied" : "Copy corpus file path", systemImage: didCopyPath ? "checkmark" : "doc.on.doc")
                            }
                            .buttonStyle(.glass)
                            .help("Copies the path to quick-text.json, for handing off to a coding agent for bulk edits.")
                        }
                    }
                    .frame(width: 320, alignment: .topLeading)

                    settingsSection("Colors") {
                        colorControls
                    }
                    .frame(width: 520, alignment: .topLeading)
                }

                settingsSection("Categories") {
                    CategoryManagerSection()
                }
            }
            .padding(22)
        }
        .frame(width: 900)
        .frame(minHeight: 420, maxHeight: 720)
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
            .help("Atom-chip selection, copy pulses, hover tints, and the active category chip.")
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
                onCopyAtom: { atom in store.copyAtom(atom, in: phrase) },
                onCopySelection: { atoms in store.copyAtomSelection(atoms, in: phrase) },
                onCopyFull: { store.copyFullFromExpandedCard(phrase) },
                onClose: { store.collapseExpanded() }
            )
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
    let onCopyAtom: (Atom) -> Void
    let onCopySelection: ([Atom]) -> Void
    let onCopyFull: () -> Void
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

    private var hasAtoms: Bool { !(phrase.atoms ?? []).isEmpty }
    private var sortedAtoms: [Atom] { (phrase.atoms ?? []).sorted { $0.start < $1.start } }

    /// True over the same area that reveals the copy icon (hovering the card but
    /// not an atom chip/gap) — a tap right now copies the whole card, so the
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
        .overlay { CopiedBadge(isVisible: isCopied, color: background) }
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
        // Bounding box around the whole atom cluster: while the cursor is anywhere
        // inside it (including gaps/punctuation between chips), the full-card copy
        // icon stays hidden so it doesn't flicker as the cursor crosses those gaps.
        return Group {
            if hasAtoms {
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

    /// Full-card copy (background tap or the copy icon): pulses every atom chip
    /// (or, for plain cards with no chips, the whole card background) to the
    /// highlight color in sync with the "Copied" badge, since the whole value —
    /// including every atom's text — just got copied.
    private func copyFull() {
        onCopyFull()
        guard hasAtoms else {
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
        LineSegment.lines(value: phrase.value, atoms: phrase.atoms ?? [])
    }
}

struct LineSegment: Identifiable {
    let id: String
    let text: String
    let atom: Atom?

    static func lines(value: String, atoms: [Atom]) -> [[LineSegment]] {
        let characters = Array(value)
        let sorted = atoms
            .filter { $0.start >= 0 && $0.end > $0.start && $0.end <= characters.count }
            .sorted { $0.start < $1.start }

        var flat: [LineSegment] = []
        var cursor = 0
        var counter = 0
        func nextID() -> String { counter += 1; return "seg-\(counter)" }

        for atom in sorted {
            guard atom.start >= cursor else { continue }
            if atom.start > cursor {
                flat.append(LineSegment(id: nextID(), text: String(characters[cursor..<atom.start]), atom: nil))
            }
            flat.append(LineSegment(id: atom.id, text: String(characters[atom.start..<atom.end]), atom: atom))
            cursor = atom.end
        }
        if cursor < characters.count {
            flat.append(LineSegment(id: nextID(), text: String(characters[cursor...]), atom: nil))
        }

        var lines: [[LineSegment]] = [[]]
        for segment in flat {
            if segment.atom != nil {
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
                    lines[lines.count - 1].append(LineSegment(id: nextID(), text: String(word), atom: nil))
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
        onCopyFull: {},
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
        onCopyFull: {},
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
        onCopyFull: {},
        onClose: {}
    )
    .frame(width: 900, height: 500)
    .padding(40)
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

    func copyFullFromExpandedCard(_ phrase: Phrase) {
        copyText(phrase.value, feedbackFor: phrase.id, autoClose: closesCardOnCopy)
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

    func advanceCategoryFocus(reverse: Bool = false) {
        let categories = corpus.categories.sorted { $0.sortOrder < $1.sortOrder }
        guard !categories.isEmpty else { return }
        searchScope = .category
        categoryFocusMode = true

        let currentID = focusedCategoryID ?? (corpus.categories.contains { $0.id == activeCategoryID } ? activeCategoryID : nil)
        let currentIndex = currentID.flatMap { id in categories.firstIndex { $0.id == id } }
        let nextIndex: Int
        if let currentIndex {
            nextIndex = (currentIndex + (reverse ? -1 : 1) + categories.count) % categories.count
        } else {
            nextIndex = reverse ? categories.count - 1 : 0
        }

        let nextID = categories[nextIndex].id
        focusedCategoryID = nextID
        activeCategoryID = nextID
        reconcileSelectedPhrase()
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

struct QuickTextCorpus: Codable {
    var version: Int
    var updatedAt: Date
    var settings: Settings
    var categories: [Category]
    var phrases: [Phrase]

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

    static let store: CorpusStore = {
        let store = CorpusStore()
        store.corpus = QuickTextCorpus(
            version: 1,
            updatedAt: Date(),
            settings: Settings(defaultFontSize: 18, defaultTileColor: "brown-13", defaultTextColor: "brown-22", defaultFontFamily: "sans", paletteSource: "Robert Brown Fabric Collection"),
            categories: [Category(id: "personal", name: "Personal", sortOrder: 10)],
            phrases: [plainPhrase, addressPhrase]
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
