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

struct ContentView: View {
    @EnvironmentObject private var store: CorpusStore
    @FocusState private var searchFocused: Bool
    @State private var previewPhrase: Phrase?
    @State private var showingSettings = false

    private var columns: [GridItem] {
        [GridItem(.adaptive(minimum: 164), spacing: 10)]
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            categoryTabs

            HStack(spacing: 8) {
                TextField("Search", text: $store.searchTerm)
                    .textFieldStyle(.roundedBorder)
                    .focused($searchFocused)
                    .onSubmit { copySelected() }

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
                            store.copy(phrase)
                        }
                        .contextMenu {
                            Button("Copy") { store.copy(phrase) }
                            Button("Preview") { previewPhrase = phrase }
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
        .onExitCommand { NSApp.keyWindow?.orderOut(nil) }
        .onKeyPress(.downArrow) { moveSelection(1) }
        .onKeyPress(.rightArrow) { moveSelection(1) }
        .onKeyPress(.upArrow) { moveSelection(-1) }
        .onKeyPress(.leftArrow) { moveSelection(-1) }
        .onKeyPress(.space) {
            if let phrase = store.selectedPhrase { previewPhrase = phrase }
            return .handled
        }
        .sheet(item: $store.editingPhrase) { phrase in
            PhraseEditor(phrase: phrase)
                .environmentObject(store)
        }
        .sheet(item: $previewPhrase) { phrase in
            PreviewView(phrase: phrase)
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

struct TileView: View {
    let phrase: Phrase
    let backgroundColor: Color
    let textColor: Color
    let fontSize: Int
    let fontFamily: String
    let isSelected: Bool
    let isCopied: Bool

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            Text(phrase.summary?.isEmpty == false ? phrase.summary! : phrase.title)
                .font(tileFont)
                .foregroundStyle(textColor)
                .lineLimit(4)
                .minimumScaleFactor(0.72)
                .frame(maxWidth: .infinity, alignment: .leading)
            if isCopied {
                Text("Copied")
                    .font(.caption.bold())
                    .foregroundStyle(textColor.opacity(0.82))
            }
        }
        .padding(12)
        .frame(minHeight: 112, alignment: .topLeading)
        .background(backgroundColor)
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(isSelected ? Color.primary : backgroundColor.opacity(0.5), lineWidth: isSelected ? 2 : 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }

    private var tileFont: Font {
        if fontFamily == "serif" {
            return .custom("Palatino", size: CGFloat(fontSize)).weight(.bold)
        }
        return .system(size: CGFloat(fontSize), weight: .bold)
    }
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

    var body: some View {
        Form {
            TextField("Title", text: $phrase.title)
            TextField("Summary", text: stringBinding($phrase.summary, replacingNilWith: ""))
            Picker("Category", selection: $phrase.categoryId) {
                ForEach(store.corpus.categories) { category in
                    Text(category.name).tag(category.id)
                }
            }
            TextEditor(text: $phrase.value)
                .frame(minHeight: 140)
            SwatchPicker(title: "Background", selection: stringBinding($phrase.color, replacingNilWith: store.corpus.settings.defaultTileColor), colors: store.palette.colors)
            SwatchPicker(title: "Text", selection: stringBinding($phrase.textColor, replacingNilWith: store.corpus.settings.defaultTextColor), colors: store.palette.colors)
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
                    store.save(phrase)
                    dismiss()
                }
                .disabled(phrase.title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || phrase.value.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
        }
        .padding()
        .frame(width: 520)
        .frame(minHeight: 560)
    }
}

struct SettingsEditor: View {
    @EnvironmentObject private var store: CorpusStore
    @Environment(\.dismiss) private var dismiss
    @State var settings: Settings

    var body: some View {
        Form {
            Stepper("Text size: \(settings.defaultFontSize)", value: $settings.defaultFontSize, in: 14...44)
            SwatchPicker(title: "Default background", selection: $settings.defaultTileColor, colors: store.palette.colors)
            SwatchPicker(title: "Default text", selection: $settings.defaultTextColor, colors: store.palette.colors)
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
        .frame(width: 520)
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

struct PreviewView: View {
    let phrase: Phrase

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(phrase.title).font(.headline)
            ScrollView {
                Text(phrase.value)
                    .textSelection(.enabled)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .padding()
        .frame(width: 520, height: 360)
    }
}

final class CorpusStore: ObservableObject {
    @Published var corpus = QuickTextCorpus.empty
    @Published var palette = Palette.empty
    @Published var activeCategoryID = "all"
    @Published var searchTerm = ""
    @Published var selectedPhraseID: String?
    @Published var copiedPhraseID: String?
    @Published var editingPhrase: Phrase?

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

    func copy(_ phrase: Phrase) {
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(phrase.value, forType: .string)
        selectedPhraseID = phrase.id
        copiedPhraseID = phrase.id
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) { [weak self] in
            if self?.copiedPhraseID == phrase.id {
                self?.copiedPhraseID = nil
            }
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
    // Atomic phrase cards (see web/quick-text-component/quick-text.js). Decoded/encoded
    // here only to round-trip losslessly; the Mac app does not yet render expandable
    // atom chips or per-atom copy. TODO: add expand-on-click + atom chip UI + editor
    // support to match the web component before treating this as feature-complete.
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
