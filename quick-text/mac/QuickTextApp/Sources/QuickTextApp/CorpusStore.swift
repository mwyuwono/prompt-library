import SwiftUI

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
    /// Surfaced by ContentView as an alert. Set on any load()/writeCorpus() failure
    /// instead of leaving those errors NSLog-only.
    @Published var errorMessage: String?

    /// Guards writeCorpus(): without this, a failed load() (e.g. an evicted/not-yet-
    /// downloaded iCloud file) leaves `corpus` at `.empty`, and the very next mutation
    /// would silently overwrite the real quick-text.json with that empty corpus.
    private var loadSucceeded = false
    private var hasBackedUpThisSession = false
    private var corpusWatcher: DispatchSourceFileSystemObject?
    /// Hash of the bytes this process itself last wrote, so the directory watcher
    /// can tell its own writes apart from genuinely external changes and skip
    /// reloading after them.
    private var lastWrittenHash: Int?
    private var settingsWriteWorkItem: DispatchWorkItem?

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
            loadSucceeded = true
        } catch {
            NSLog("Quick Text load failed: \(error.localizedDescription)")
            loadSucceeded = false
            errorMessage = "Couldn't read Quick Text data, so nothing will be saved until this is fixed and the app is relaunched: \(error.localizedDescription)"
        }
    }

    /// Reloads from disk after an external change (see startWatchingCorpus()),
    /// preserving selection/filter state where it's still valid rather than
    /// resetting the user back to an unfiltered view of the first phrase.
    private func reloadFromDisk() {
        let previousSelectedPhraseID = selectedPhraseID
        let previousActiveCategoryID = activeCategoryID
        let previousSearchScope = searchScope
        let previousSearchTerm = searchTerm
        let previousCategoryFocusMode = categoryFocusMode
        let previousFocusedCategoryID = focusedCategoryID

        load()
        guard loadSucceeded else { return }

        searchTerm = previousSearchTerm
        if previousActiveCategoryID == "all"
            || previousActiveCategoryID == "favorites"
            || corpus.categories.contains(where: { $0.id == previousActiveCategoryID }) {
            activeCategoryID = previousActiveCategoryID
            searchScope = previousSearchScope
            categoryFocusMode = previousCategoryFocusMode
            focusedCategoryID = previousFocusedCategoryID
        }
        if let previousSelectedPhraseID, corpus.phrases.contains(where: { $0.id == previousSelectedPhraseID }) {
            selectedPhraseID = previousSelectedPhraseID
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
        copyText(resolvedCopyText(for: phrase), feedbackFor: phrase.id, autoClose: false)
    }

    /// Substitutes resolved `"value"`-type library variables (`{{@name}}`) into
    /// `phrase.value` before copying — the tile context-menu Copy, toolbar Cmd-C,
    /// and Return-to-copy paths all route through here so they match
    /// `ExpandedCardView.copyFull()`'s substitution instead of copying the raw,
    /// unsubstituted template. Inline/choice/unresolved variables are left literal,
    /// same fallback as everywhere else — there's no fill-in step outside the
    /// expanded card to have filled them.
    func resolvedCopyText(for phrase: Phrase) -> String {
        var values: [String: String] = [:]
        for variable in PhraseVariable.parse(phrase.value, library: libraryVariables) where variable.isCannedValue {
            values[variable.key] = variable.libraryValue
        }
        return PhraseVariable.substitute(phrase.value, values: values)
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
            id: "phrase-\(UUID().uuidString)",
            categoryId: categoryIDForNewPhrase(),
            title: "",
            summary: "",
            value: "",
            // nil, not snapshotted from the current default: this lets the phrase ->
            // category -> settings fallback tier apply (see CorpusStore.color(for:)),
            // so later changing the default or category color still restyles it.
            color: nil,
            textColor: nil,
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
        clone.id = "\(phrase.id)-copy-\(UUID().uuidString)"
        clone.title = "\(phrase.title) Copy"
        clone.createdAt = Date()
        clone.updatedAt = Date()
        corpus.phrases.append(clone)
        writeCorpus()
    }

    /// `corpus.settings` is written through immediately so sliders (text size, card
    /// size) stay live, but the disk write is debounced ~0.5s after the last change —
    /// otherwise dragging a slider fires dozens of writeCorpus() calls, each kicking
    /// off an iCloud sync.
    func saveSettings(_ settings: Settings) {
        corpus.settings = settings
        corpus.updatedAt = Date()
        settingsWriteWorkItem?.cancel()
        let workItem = DispatchWorkItem { [weak self] in self?.writeCorpus() }
        settingsWriteWorkItem = workItem
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5, execute: workItem)
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
        // Refuse to write until a load has actually succeeded this session — see
        // the `loadSucceeded` doc comment above. Without this, an evicted/not-yet-
        // downloaded iCloud file makes `corpus` silently start as `.empty`, and any
        // subsequent settings tweak or phrase edit would overwrite the real data.
        guard loadSucceeded else {
            NSLog("Quick Text save skipped: no successful load this session.")
            errorMessage = "Couldn't save — Quick Text data was never loaded successfully this session, so saving was skipped to avoid overwriting your data. Quit and relaunch once the corpus file is reachable again."
            return
        }
        do {
            backupCorpusIfNeeded()
            let data = try JSONEncoder.quickText.encode(corpus)
            // Recorded before the write so the directory watcher's post-write fire
            // (see startWatchingCorpus()) recognizes this as our own change.
            lastWrittenHash = data.hashValue
            try data.write(to: corpusURL, options: .atomic)
        } catch {
            NSLog("Quick Text save failed: \(error.localizedDescription)")
            errorMessage = "Couldn't save Quick Text data: \(error.localizedDescription)"
        }
    }

    /// Single rotating backup, written once per session before the first real write
    /// — cheap insurance against a bad save clobbering the only copy of the corpus.
    private func backupCorpusIfNeeded() {
        guard !hasBackedUpThisSession else { return }
        hasBackedUpThisSession = true
        guard FileManager.default.fileExists(atPath: corpusURL.path) else { return }
        let backupURL = corpusURL.deletingLastPathComponent().appendingPathComponent(corpusURL.lastPathComponent + ".bak")
        try? FileManager.default.removeItem(at: backupURL)
        try? FileManager.default.copyItem(at: corpusURL, to: backupURL)
    }

    /// Watches the corpus file's *directory* rather than the file itself: an atomic
    /// write (`.atomic`, used by writeCorpus() and by external editors like Bullfinch
    /// or coding agents) replaces the inode via rename, which would silently end a
    /// direct file-descriptor watch. Replaces the old "quit and reopen" workflow.
    func startWatchingCorpus() {
        guard corpusWatcher == nil else { return }
        let directoryURL = corpusURL.deletingLastPathComponent()
        let fd = open(directoryURL.path, O_EVTONLY)
        guard fd >= 0 else { return }
        let source = DispatchSource.makeFileSystemObjectSource(fileDescriptor: fd, eventMask: [.write, .rename], queue: .main)
        source.setEventHandler { [weak self] in
            self?.handleCorpusDirectoryEvent()
        }
        source.setCancelHandler {
            close(fd)
        }
        source.resume()
        corpusWatcher = source
    }

    func stopWatchingCorpus() {
        corpusWatcher?.cancel()
        corpusWatcher = nil
    }

    private func handleCorpusDirectoryEvent() {
        guard let data = try? Data(contentsOf: corpusURL) else { return }
        // Skip reload if this is the app's own write landing on disk, not a
        // genuinely external change.
        guard data.hashValue != lastWrittenHash else { return }
        reloadFromDisk()
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
            id: "var-\(UUID().uuidString)",
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

