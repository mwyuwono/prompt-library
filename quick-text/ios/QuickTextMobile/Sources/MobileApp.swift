import SwiftUI
import UniformTypeIdentifiers

@main struct QuickTextMobileApp: App {
    @StateObject private var library = MobileLibrary()
    @StateObject private var dictate = MobileDictation()
    @Environment(\.scenePhase) private var phase
    var body: some Scene {
        WindowGroup {
            TabView {
                LibraryView().tabItem { Label("Library", systemImage: "square.grid.2x2") }
                DictationView().tabItem { Label("Dictate", systemImage: "mic") }
                MobileSettingsView().tabItem { Label("Settings", systemImage: "gearshape") }
            }
            .tint(.primary)
            .environmentObject(library).environmentObject(dictate)
            .onChange(of: phase) { _, next in dictate.setForeground(next == .active) }
            .alert("Library", isPresented: Binding(get: { library.error != nil }, set: { if !$0 { library.error = nil } })) {
                Button("OK") { library.error = nil }
            } message: { Text(library.error ?? "") }
        }
    }
}

struct LibraryView: View {
    @EnvironmentObject private var library: MobileLibrary
    @State private var search = ""
    @State private var category = "all"
    @State private var favorites = false
    @State private var selected: Phrase?
    @State private var adding = false
    private var visible: [Phrase] {
        library.corpus.phrases.filter {
            (category == "all" || $0.categoryId == category) && (!favorites || $0.favorite) &&
            (search.isEmpty || [$0.title, $0.summary ?? "", $0.value, $0.tags.joined(separator: " ")].joined(separator: " ").localizedCaseInsensitiveContains(search))
        }
    }
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    HStack {
                        Picker("Collection", selection: $category) {
                            Text("All collections").tag("all")
                            ForEach(library.corpus.categories.sorted { $0.sortOrder < $1.sortOrder }) { Text($0.name).tag($0.id) }
                        }.pickerStyle(.menu)
                        Spacer()
                        Toggle(isOn: $favorites) { Image(systemName: "star.fill").accessibilityLabel("Favorites only") }.toggleStyle(.button)
                    }
                    if visible.isEmpty {
                        ContentUnavailableView("No phrases", systemImage: "text.badge.plus", description: Text("Change your search, add a phrase, or import your Mac library in Settings."))
                    }
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 155), spacing: 14)], spacing: 14) {
                        ForEach(visible) { phrase in
                            Button { selected = phrase } label: {
                                VStack(alignment: .leading, spacing: 12) {
                                    HStack { Text(library.corpus.categories.first { $0.id == phrase.categoryId }?.name ?? "").font(.caption).foregroundStyle(.secondary); Spacer(); if phrase.favorite { Image(systemName: "star.fill").foregroundStyle(.secondary) } }
                                    Text(phrase.title).font(.system(.title3, design: .serif)).foregroundStyle(.primary).multilineTextAlignment(.leading)
                                    if let summary = phrase.summary { Text(summary).font(.subheadline).foregroundStyle(.secondary).lineLimit(3) }
                                    Spacer(minLength: 0)
                                }
                                .frame(maxWidth: .infinity, minHeight: 135, alignment: .topLeading)
                                .padding(16).background(Color(uiColor: .secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 14))
                            }.buttonStyle(.plain).accessibilityIdentifier(phrase.id)
                        }
                    }
                }.padding()
            }
            .background(Color(uiColor: .systemGroupedBackground))
            .navigationTitle("Quick Text")
            .searchable(text: $search, prompt: "Search phrases")
            .toolbar { Button { adding = true } label: { Label("Add phrase", systemImage: "plus") }.disabled(!library.writable || library.corpus.categories.isEmpty).accessibilityIdentifier("add-phrase") }
            .sheet(item: $selected) { PhraseDetailView(phrase: $0) }
            .sheet(isPresented: $adding) { PhraseEditView(phrase: nil) }
        }
    }
}

struct PhraseDetailView: View {
    let phrase: Phrase
    @EnvironmentObject private var library: MobileLibrary
    @Environment(\.dismiss) private var dismiss
    @State private var values: [String: String] = [:]
    @State private var editing = false
    @State private var copied = false
    private var current: Phrase { library.corpus.phrases.first { $0.id == phrase.id } ?? phrase }
    private var variables: [PhraseVariable] {
        var seen: Set<String> = []
        return PhraseVariable.parse(current.value, library: library.corpus.variables ?? []).filter { seen.insert($0.key).inserted }
    }
    private var rendered: String {
        var all = values
        for variable in variables { if let fixed = variable.libraryValue { all[variable.key] = fixed } }
        return PhraseVariable.substitute(current.value, values: all)
    }
    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Text(current.title).font(.system(.title2, design: .serif))
                    if let summary = current.summary { Text(summary).foregroundStyle(.secondary) }
                    Text(rendered).textSelection(.enabled).accessibilityIdentifier("phrase-preview")
                }
                if variables.contains(where: { !$0.isCannedValue }) {
                    Section("Fill in") {
                        ForEach(variables.filter { !$0.isCannedValue }) { variable in
                            if variable.isUnresolved { Text("Missing library variable: \(variable.displayLabel)").foregroundStyle(.red) }
                            else if let choices = variable.choices {
                                Picker(variable.displayLabel, selection: Binding(get: { values[variable.key] ?? "" }, set: { values[variable.key] = $0 })) {
                                    Text("Choose…").tag("")
                                    ForEach(choices, id: \.self) { Text($0).tag($0) }
                                }
                            } else { TextField(variable.displayLabel, text: Binding(get: { values[variable.key] ?? "" }, set: { values[variable.key] = $0 })).accessibilityIdentifier("fill-\(variable.key)") }
                        }
                    }
                }
                Section {
                    Button { UIPasteboard.general.string = rendered; copied = true } label: { Label(copied ? "Copied" : "Copy phrase", systemImage: copied ? "checkmark" : "doc.on.doc") }.accessibilityIdentifier("copy-phrase")
                    Button { library.toggleFavorite(current.id) } label: { Label(current.favorite ? "Remove favorite" : "Add favorite", systemImage: current.favorite ? "star.slash" : "star") }.disabled(!library.writable)
                    Button("Edit phrase") { editing = true }.disabled(!library.writable)
                }
            }
            .navigationTitle("Phrase").navigationBarTitleDisplayMode(.inline)
            .toolbar { Button("Done") { dismiss() } }
            .sheet(isPresented: $editing) { PhraseEditView(phrase: current) }
        }
    }
}

struct PhraseEditView: View {
    let phrase: Phrase?
    @EnvironmentObject private var library: MobileLibrary
    @Environment(\.dismiss) private var dismiss
    @State private var title = ""
    @State private var summary = ""
    @State private var value = ""
    @State private var category = ""
    var body: some View {
        NavigationStack {
            Form {
                TextField("Title", text: $title).accessibilityIdentifier("phrase-title")
                TextField("Summary", text: $summary)
                Picker("Collection", selection: $category) { ForEach(library.corpus.categories) { Text($0.name).tag($0.id) } }
                Section("Value") { TextEditor(text: $value).frame(minHeight: 220).accessibilityIdentifier("phrase-value") }
            }
            .navigationTitle(phrase == nil ? "New phrase" : "Edit phrase")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        var next = phrase ?? Phrase(id: "mobile-\(UUID().uuidString.lowercased())", categoryId: category, title: title, summary: nil, value: value, favorite: false, visibility: .private, tags: [], createdAt: Date(), updatedAt: Date())
                        next.title = title.trimmingCharacters(in: .whitespacesAndNewlines)
                        next.summary = summary.isEmpty ? nil : summary
                        next.value = value; next.categoryId = category; next.updatedAt = Date()
                        library.save(next)
                        if library.error == nil { dismiss() }
                    }.disabled(title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || value.isEmpty || category.isEmpty).accessibilityIdentifier("save-phrase")
                }
            }
            .onAppear { title = phrase?.title ?? ""; summary = phrase?.summary ?? ""; value = phrase?.value ?? ""; category = phrase?.categoryId ?? library.corpus.categories.first?.id ?? "" }
        }
    }
}

struct LibraryExport: FileDocument {
    static var readableContentTypes: [UTType] { [.json] }
    var data: Data
    init(data: Data) { self.data = data }
    init(configuration: ReadConfiguration) throws { data = configuration.file.regularFileContents ?? Data() }
    func fileWrapper(configuration: WriteConfiguration) throws -> FileWrapper { FileWrapper(regularFileWithContents: data) }
}
