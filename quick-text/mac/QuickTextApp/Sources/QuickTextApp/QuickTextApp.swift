import Carbon
import SwiftUI

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

#Preview("Content View") {
    ContentView()
        .environmentObject(PreviewData.store)
        .frame(width: 720, height: 520)
}

struct ContentView: View {
    @EnvironmentObject private var store: CorpusStore
    @FocusState private var searchFocused: Bool
    @State private var showingSettings = false
    @State private var savedWindowFrame: NSRect?

    private var columns: [GridItem] {
        [GridItem(.adaptive(minimum: 164), spacing: 10)]
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            categoryTabs

            HStack(spacing: 8) {
                searchField

                Button(action: { store.beginNewPhrase() }) {
                    Label("New", systemImage: "plus")
                }
                Button(action: { showingSettings = true }) {
                    Label("Settings", systemImage: "slider.horizontal.3")
                }
            }

            ScrollView {
                LazyVGrid(columns: columns, spacing: 10) {
                    ForEach(Array(store.filteredPhrases.enumerated()), id: \.element.id) { index, phrase in
                        TileView(
                            phrase: phrase,
                            backgroundColor: store.color(for: phrase.color ?? store.corpus.settings.defaultTileColor),
                            textColor: store.color(for: phrase.textColor ?? store.corpus.settings.defaultTextColor),
                            fontSize: store.corpus.settings.defaultFontSize,
                            fontFamily: store.corpus.settings.defaultFontFamily,
                            isSelected: store.selectedPhraseID == phrase.id,
                            isCopied: store.copiedPhraseID == phrase.id
                        )
                        .onTapGesture {
                            store.selectedPhraseID = phrase.id
                            store.expandedPhraseID = phrase.id
                        }
                        .contextMenu {
                            Button("Copy") { store.copy(phrase) }
                            Button("Preview") { store.expandedPhraseID = phrase.id }
                            Button("Edit") { store.beginEditing(phrase) }
                            Button("Duplicate") { store.duplicate(phrase) }
                            Button("Delete", role: .destructive) { store.delete(phrase) }
                        }
                    }
                }
                .padding(.vertical, 2)
            }
        }
        .padding(14)
        .background(Color(nsColor: .windowBackgroundColor))
        .onAppear { store.load() }
        .onExitCommand {
            if store.expandedPhraseID != nil {
                store.collapseExpanded()
            } else {
                NSApp.keyWindow?.orderOut(nil)
            }
        }
        .onKeyPress(.downArrow) { moveSelection(1) }
        .onKeyPress(.rightArrow) { moveSelection(1) }
        .onKeyPress(.upArrow) { moveSelection(-1) }
        .onKeyPress(.leftArrow) { moveSelection(-1) }
        .onKeyPress(.space) {
            if let phrase = store.selectedPhrase { store.expandedPhraseID = phrase.id }
            return .handled
        }
        .sheet(item: $store.editingPhrase) { phrase in
            PhraseEditor(phrase: phrase)
                .environmentObject(store)
        }
        .sheet(isPresented: $showingSettings) {
            SettingsEditor(settings: store.corpus.settings)
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
                    store.searchTerm = ""
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundStyle(.secondary)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 7)
        .background(Color.secondary.opacity(0.12))
        .clipShape(Capsule())
        .overlay(
            Capsule().stroke(searchFocused ? Color.primary.opacity(0.35) : Color.secondary.opacity(0.18), lineWidth: 1)
        )
    }

    /// Expands the window to ~80% of the display when a card expands, since the
    /// expanded card overlay fills the window rather than floating independently.
    /// Restoring is unanimated so dismissing (click-out or Escape) feels instant.
    private func resizeWindowForExpansion(expanding: Bool) {
        guard let window = NSApp.keyWindow ?? NSApp.windows.first else { return }
        if expanding {
            guard savedWindowFrame == nil else { return }
            savedWindowFrame = window.frame
            if let screen = window.screen ?? NSScreen.main {
                let visible = screen.visibleFrame
                let size = NSSize(width: visible.width * 0.8, height: visible.height * 0.8)
                let origin = NSPoint(x: visible.midX - size.width / 2, y: visible.midY - size.height / 2)
                window.setFrame(NSRect(origin: origin, size: size), display: true, animate: true)
            }
        } else if let frame = savedWindowFrame {
            window.setFrame(frame, display: true, animate: false)
            savedWindowFrame = nil
        }
    }

    private var categoryTabs: some View {
        HStack(spacing: 6) {
            ForEach(store.tabs, id: \.id) { tab in
                Button(tab.name) { store.activeCategoryID = tab.id }
                    .buttonStyle(CategoryTabStyle(active: store.activeCategoryID == tab.id))
            }
        }
    }

    private func moveSelection(_ delta: Int) -> KeyPress.Result {
        store.moveSelection(delta)
        return .handled
    }

    private func copySelected() {
        if let phrase = store.selectedPhrase {
            store.copy(phrase)
        }
    }
}

/// Shared "Copied" feedback for every copy action in the app (tiles, atom chips,
/// expanded-card copies): pops in fast, then fades out rapidly. Whole interaction
/// stays under `CorpusStore.copyFeedbackDuration` plus this animation's tail.
struct CopiedBadge: View {
    let isVisible: Bool
    var color: Color = .primary

    var body: some View {
        Text("Copied")
            .font(.system(size: 40, weight: .heavy, design: .rounded))
            .foregroundStyle(color)
            .scaleEffect(isVisible ? 1 : 0.5)
            .opacity(isVisible ? 1 : 0)
            .animation(isVisible ? .spring(response: 0.16, dampingFraction: 0.6) : .easeOut(duration: 0.22), value: isVisible)
            .allowsHitTesting(false)
    }
}

struct TileView: View {
    let phrase: Phrase
    let backgroundColor: Color
    let textColor: Color
    let fontSize: Int
    let fontFamily: String
    let isSelected: Bool
    let isCopied: Bool

    var body: some View {
        HStack(alignment: .firstTextBaseline, spacing: 6) {
            Text(phrase.summary?.isEmpty == false ? phrase.summary! : phrase.title)
                .font(tileFont)
                .foregroundStyle(textColor)
                .lineLimit(4)
                .minimumScaleFactor(0.72)
            if let atoms = phrase.atoms, !atoms.isEmpty {
                Circle()
                    .fill(textColor.opacity(0.55))
                    .frame(width: 6, height: 6)
            }
            Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity, alignment: .topLeading)
        .padding(12)
        .frame(minHeight: 112, alignment: .topLeading)
        .background(backgroundColor)
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(isSelected ? Color.primary : backgroundColor.opacity(0.5), lineWidth: isSelected ? 2 : 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 8))
        .overlay {
            CopiedBadge(isVisible: isCopied, color: textColor)
        }
    }

    private var tileFont: Font {
        if fontFamily == "serif" {
            return .custom("Palatino", size: CGFloat(fontSize)).weight(.bold)
        }
        return .system(size: CGFloat(fontSize), weight: .bold)
    }
}

#Preview("Tile - Plain") {
    TileView(
        phrase: PreviewData.plainPhrase,
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

struct CategoryTabStyle: ButtonStyle {
    let active: Bool

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 13, weight: .semibold))
            .foregroundStyle(active ? Color.white : Color.primary)
            .padding(.horizontal, 11)
            .padding(.vertical, 7)
            .background(active ? Color.primary : Color.secondary.opacity(0.16))
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .opacity(configuration.isPressed ? 0.82 : 1)
    }
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
            Form {
                TextField("Title", text: $phrase.title)
                TextField("Summary", text: stringBinding($phrase.summary, replacingNilWith: ""))
                Picker("Category", selection: $phrase.categoryId) {
                    ForEach(store.corpus.categories) { category in
                        Text(category.name).tag(category.id)
                    }
                }

                VStack(alignment: .leading, spacing: 6) {
                    Text("Value").font(.caption).foregroundStyle(.secondary)
                    SelectableTextEditor(text: $phrase.value, selectedRange: $selectedRange)
                        .frame(minHeight: 140)
                        .overlay(RoundedRectangle(cornerRadius: 6).stroke(Color.secondary.opacity(0.3)))
                }

                atomsSection

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
                TextField("Tags", text: Binding(
                    get: { phrase.tags.joined(separator: ", ") },
                    set: { phrase.tags = $0.split(separator: ",").map { $0.trimmingCharacters(in: .whitespaces) }.filter { !$0.isEmpty } }
                ))
                Toggle("Favorite", isOn: $phrase.favorite)
                Picker("Visibility", selection: $phrase.visibility) {
                    ForEach(Visibility.allCases, id: \.self) { visibility in
                        Text(visibility.rawValue).tag(visibility)
                    }
                }
                HStack {
                    Button("Cancel") { dismiss() }
                    Spacer()
                    Button("Save") {
                        phrase.atoms = atoms.isEmpty ? nil : atoms
                        store.save(phrase)
                        dismiss()
                    }
                    .disabled(phrase.title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || phrase.value.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
            .padding()
        }
        .frame(width: 520)
        .frame(minHeight: 400, maxHeight: 720)
        .onAppear { atoms = phrase.atoms ?? [] }
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
        atoms.removeAll { end <= $0.start || start >= $0.end }
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

struct SettingsEditor: View {
    @EnvironmentObject private var store: CorpusStore
    @Environment(\.dismiss) private var dismiss
    @State var settings: Settings
    @State private var editingColorTarget: ColorEditTarget?

    var body: some View {
        ScrollView {
            Form {
                Stepper("Text size: \(settings.defaultFontSize)", value: $settings.defaultFontSize, in: 14...44)
                ColorSwatchField(
                    title: "Default background",
                    selection: $settings.defaultTileColor,
                    colors: store.palette.colors,
                    isEditing: colorEditingBinding(for: .background)
                )
                ColorSwatchField(
                    title: "Default text",
                    selection: $settings.defaultTextColor,
                    colors: store.palette.colors,
                    isEditing: colorEditingBinding(for: .text)
                )
                Picker("Font", selection: $settings.defaultFontFamily) {
                    Text("Sans").tag("sans")
                    Text("Serif").tag("serif")
                }
                HStack {
                    Button("Cancel") { dismiss() }
                    Spacer()
                    Button("Save") {
                        store.saveSettings(settings)
                        dismiss()
                    }
                }
            }
            .padding()
        }
        .frame(width: 520)
        .frame(minHeight: 300, maxHeight: 600)
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

    var body: some View {
        Button {
            isEditing.toggle()
        } label: {
            HStack(spacing: 8) {
                Circle()
                    .fill(currentColor.map { Color(hex: $0.hex) } ?? Color.secondary)
                    .frame(width: 18, height: 18)
                    .overlay(Circle().stroke(Color.black.opacity(0.18), lineWidth: 1))
                Text(title)
                Spacer()
                Text(currentColor?.name ?? "Select")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Image(systemName: "chevron.down")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
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
        }
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
    let onCopyAtom: (Atom) -> Void
    let onCopySelection: ([Atom]) -> Void
    let onCopyFull: () -> Void
    let onClose: () -> Void

    @State private var hoveredAtomID: String?
    @State private var isHoveringCard = false
    @State private var isHoveringCopyIcon = false
    @State private var isHoveringCloseIcon = false
    @State private var selectedAtomIDs: Set<String> = []

    private static let background = Color(hex: "#22201B")
    private static let textColor = Color(hex: "#F4EDE0")
    private static let chipColor = Color(hex: "#F1E6D3")
    private static let chipHoverColor = Color(hex: "#E2725B")

    var body: some View {
        VStack(alignment: .leading, spacing: 22) {
            Text(phrase.title.uppercased())
                .font(.callout.bold())
                .foregroundStyle(Self.textColor.opacity(0.6))

            GeometryReader { geometry in
                ScrollView {
                    VStack(alignment: .leading, spacing: 10) {
                        Spacer(minLength: 0)
                        linesBlock
                            .frame(maxWidth: .infinity, alignment: .center)
                        Spacer(minLength: 0)
                    }
                    .frame(minHeight: geometry.size.height)
                }
            }
        }
        .padding(46)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .background(Self.background)
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .shadow(color: .black.opacity(0.4), radius: 40, y: 16)
        .overlay(alignment: .topTrailing) { iconsOverlay }
        .overlay { CopiedBadge(isVisible: isCopied, color: Self.textColor) }
        .contentShape(Rectangle())
        .onHover { hovering in isHoveringCard = hovering }
        .onTapGesture { onCopyFull() }
    }

    private var linesBlock: some View {
        VStack(alignment: .leading, spacing: 10) {
            ForEach(Array(lines.enumerated()), id: \.offset) { _, line in
                FlowLayout(spacing: 6) {
                    ForEach(line) { segment in
                        if segment.atom != nil {
                            atomChip(segment)
                        } else {
                            Text(segment.text)
                                .font(bodyFont)
                                .foregroundStyle(Self.textColor)
                        }
                    }
                }
            }
        }
    }

    private var iconsOverlay: some View {
        HStack(spacing: 12) {
            if isHoveringCard, hoveredAtomID == nil {
                iconButton(systemName: "doc.on.doc", isHovering: isHoveringCopyIcon, action: onCopyFull) { hovering in
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
            .foregroundStyle(isHovering ? Self.chipHoverColor : Self.textColor)
            .frame(width: 44, height: 44)
            .contentShape(Rectangle())
            .onHover(perform: onHoverChange)
            .onTapGesture(perform: action)
    }

    private func atomChip(_ segment: LineSegment) -> some View {
        let isHighlighted = selectedAtomIDs.contains(segment.id) || hoveredAtomID == segment.id
        return Button(segment.text) { handleAtomTap(segment.atom!) }
            .buttonStyle(.plain)
            .font(.system(size: bodyFontSize, weight: .bold))
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .frame(minHeight: 44)
            .background(isHighlighted ? Self.chipHoverColor : Self.chipColor)
            .foregroundStyle(isHighlighted ? .white : Self.background)
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
            let selected = (phrase.atoms ?? []).filter { selectedAtomIDs.contains($0.id) }
            guard !selected.isEmpty else { return }
            onCopySelection(selected)
        } else {
            selectedAtomIDs = [atom.id]
            onCopyAtom(atom)
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
                if !part.isEmpty {
                    lines[lines.count - 1].append(LineSegment(id: nextID(), text: part, atom: nil))
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

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let maxWidth = proposal.width ?? .infinity
        var width: CGFloat = 0
        var height: CGFloat = 0
        var lineWidth: CGFloat = 0
        var lineHeight: CGFloat = 0
        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if lineWidth > 0, lineWidth + size.width > maxWidth {
                width = max(width, lineWidth)
                height += lineHeight + spacing
                lineWidth = 0
                lineHeight = 0
            }
            lineWidth += size.width + spacing
            lineHeight = max(lineHeight, size.height)
        }
        width = max(width, lineWidth)
        height += lineHeight
        return CGSize(width: min(width, maxWidth), height: max(height, 0))
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var x = bounds.minX
        var y = bounds.minY
        var lineHeight: CGFloat = 0
        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x > bounds.minX, x + size.width > bounds.maxX {
                x = bounds.minX
                y += lineHeight + spacing
                lineHeight = 0
            }
            subview.place(at: CGPoint(x: x, y: y), proposal: ProposedViewSize(size))
            x += size.width + spacing
            lineHeight = max(lineHeight, size.height)
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

final class CorpusStore: ObservableObject {
    @Published var corpus = QuickTextCorpus.empty
    @Published var palette = Palette.empty
    @Published var activeCategoryID = "all"
    @Published var searchTerm = ""
    @Published var selectedPhraseID: String?
    @Published var copiedPhraseID: String?
    @Published var editingPhrase: Phrase?
    @Published var expandedPhraseID: String?

    var expandedPhrase: Phrase? {
        guard let id = expandedPhraseID else { return nil }
        return corpus.phrases.first { $0.id == id }
    }

    private var corpusURL: URL { Self.resolveCorpusURL(named: "quick-text.json") }
    private var paletteURL: URL { Self.resolveCorpusURL(named: "palette.json") }

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
            activeCategoryID == "all" || phrase.categoryId == activeCategoryID || (activeCategoryID == "favorites" && phrase.favorite)
        }.filter { phrase in
            if term.isEmpty { return true }
            return [phrase.title, phrase.summary ?? "", phrase.value, phrase.tags.joined(separator: " ")]
                .joined(separator: " ")
                .lowercased()
                .contains(term)
        }
        if selectedPhraseID == nil { selectedPhraseID = result.first?.id }
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
        copyText(phrase.value, feedbackFor: phrase.id, autoClose: false)
    }

    func collapseExpanded() {
        expandedPhraseID = nil
    }

    func copyAtom(_ atom: Atom, in phrase: Phrase) {
        let characters = Array(phrase.value)
        guard atom.start >= 0, atom.end <= characters.count, atom.end > atom.start else { return }
        copyText(String(characters[atom.start..<atom.end]), feedbackFor: phrase.id, autoClose: true)
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
            .joined()
        copyText(text, feedbackFor: phrase.id, autoClose: false)
    }

    func copyFullFromExpandedCard(_ phrase: Phrase) {
        copyText(phrase.value, feedbackFor: phrase.id, autoClose: true)
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
            categoryId: corpus.categories.first?.id ?? "personal",
            title: "",
            summary: "",
            value: "",
            color: corpus.settings.defaultTileColor,
            textColor: corpus.settings.defaultTextColor,
            fontSize: nil,
            favorite: false,
            visibility: .private,
            tags: [],
            createdAt: Date(),
            updatedAt: Date()
        )
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

    func moveSelection(_ delta: Int) {
        let phrases = filteredPhrases
        guard !phrases.isEmpty else { return }
        let current = phrases.firstIndex { $0.id == selectedPhraseID } ?? 0
        let next = min(max(current + delta, 0), phrases.count - 1)
        selectedPhraseID = phrases[next].id
    }

    func categoryName(for id: String) -> String {
        corpus.categories.first { $0.id == id }?.name ?? ""
    }

    func color(for id: String?) -> Color {
        let fallback = corpus.settings.defaultTileColor
        let hex = palette.colors.first { $0.id == (id ?? fallback) }?.hex ?? "#D2BEB1"
        return Color(hex: hex)
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
}

struct Category: Codable, Identifiable {
    var id: String
    var name: String
    var sortOrder: Int
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
