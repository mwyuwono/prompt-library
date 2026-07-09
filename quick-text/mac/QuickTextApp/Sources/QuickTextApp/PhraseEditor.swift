import SwiftUI

struct PhraseEditor: View {
    @EnvironmentObject private var store: CorpusStore
    @Environment(\.dismiss) private var dismiss
    @State var phrase: Phrase
    @State private var atoms: [Atom] = []
    @State private var selectedRange = NSRange(location: 0, length: 0)
    @State private var editingColorTarget: ColorEditTarget?
    @State private var showingInsertVariable = false
    @FocusState private var shortcutFieldFocused: Bool
    @State private var pendingShortcutPrompt = false

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

                field("Text Replacement") {
                    textReplacementSection
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
                    .disabled(phrase.title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || phrase.value.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || !invalidAtomIDs.isEmpty || textReplacementBlocksSave)
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

    // MARK: - Text Replacement (see docs/text-replacement-sync-plan.md)

    private var shortcutBinding: Binding<String> {
        Binding(
            get: { phrase.textReplacement?.shortcut ?? "" },
            set: { newValue in
                var link = phrase.textReplacement ?? TextReplacementLink(shortcut: "", syncEnabled: false)
                link.shortcut = newValue
                phrase.textReplacement = link
                if !newValue.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                    pendingShortcutPrompt = false
                }
            }
        )
    }

    private var syncEnabledBinding: Binding<Bool> {
        Binding(
            get: { phrase.textReplacement?.syncEnabled ?? false },
            set: { newValue in
                guard newValue else {
                    phrase.textReplacement?.syncEnabled = false
                    pendingShortcutPrompt = false
                    return
                }
                var link = phrase.textReplacement ?? TextReplacementLink(shortcut: "", syncEnabled: false)
                if link.shortcut.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                    if let suggestion = shortcutLikeTag {
                        link.shortcut = suggestion
                    } else {
                        pendingShortcutPrompt = true
                        shortcutFieldFocused = true
                    }
                }
                link.syncEnabled = !link.shortcut.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                phrase.textReplacement = link
            }
        )
    }

    /// A single-token, space-free existing tag looks like a plausible shortcut default.
    private var shortcutLikeTag: String? {
        phrase.tags.first { !$0.contains(" ") && !$0.isEmpty }
    }

    private var hasUnresolvedVariables: Bool {
        TextReplacementSupport.hasUnresolvedPlaceholders(phrase, variables: store.libraryVariables)
    }

    private var trimmedShortcut: String {
        TextReplacementSupport.normalizedShortcut(shortcutBinding.wrappedValue)
    }

    private var shortcutHasWhitespace: Bool {
        trimmedShortcut.contains(where: { $0.isWhitespace })
    }

    private var shortcutIsDuplicate: Bool {
        !TextReplacementSupport.isShortcutUnique(trimmedShortcut, among: store.corpus.phrases, excludingPhraseID: phrase.id)
    }

    private var shortcutConventionSuggestion: String? {
        guard !trimmedShortcut.isEmpty, !TextReplacementSupport.matchesConvention(trimmedShortcut) else { return nil }
        return TextReplacementSupport.suggestedConformingShortcut(from: trimmedShortcut)
    }

    /// Blocks Save when the shorthand as entered can't validly sync — mirrors the
    /// rules in `TextReplacementSupport`/`validate-corpus.mjs` (uniqueness, whitespace,
    /// non-empty when enabled, no unresolved placeholders).
    private var textReplacementBlocksSave: Bool {
        guard phrase.textReplacement?.syncEnabled == true else { return false }
        return trimmedShortcut.isEmpty || shortcutHasWhitespace || shortcutIsDuplicate || hasUnresolvedVariables
    }

    private var syncStatusLine: String? {
        guard let link = phrase.textReplacement, link.syncEnabled, let lastSyncedAt = link.lastSyncedAt else { return nil }
        if let lastSyncedValue = link.lastSyncedValue,
           let resolved = TextReplacementSupport.resolvedReplacementText(for: phrase, variables: store.libraryVariables),
           lastSyncedValue != resolved {
            return "Out of sync — value changed since last sync"
        }
        let formatter = RelativeDateTimeFormatter()
        return "Synced \u{2713} \(formatter.localizedString(for: lastSyncedAt, relativeTo: Date()))"
    }

    private var textReplacementSection: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 10) {
                TextField("e.g. xsum", text: shortcutBinding)
                    .textFieldStyle(.roundedBorder)
                    .font(.system(.body, design: .monospaced))
                    .focused($shortcutFieldFocused)
                    .frame(maxWidth: 180)
                Toggle("Sync to macOS/iOS", isOn: syncEnabledBinding)
                    .disabled(hasUnresolvedVariables)
            }
            if pendingShortcutPrompt {
                Text("Enter the shorthand to type, e.g. xsum.")
                    .font(.caption)
                    .foregroundStyle(.orange)
            }
            if hasUnresolvedVariables {
                Text("Phrases with fill-in variables can't sync as static text replacements.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            if !trimmedShortcut.isEmpty && shortcutHasWhitespace {
                Text("Shortcut can't contain whitespace.")
                    .font(.caption)
                    .foregroundStyle(.red)
            } else if shortcutIsDuplicate {
                Text("Another phrase already uses this shortcut.")
                    .font(.caption)
                    .foregroundStyle(.red)
            } else if !trimmedShortcut.isEmpty && trimmedShortcut.count < 3 {
                Text("Shortcuts under 3 characters risk accidental expansion.")
                    .font(.caption)
                    .foregroundStyle(.orange)
            } else if let suggestion = shortcutConventionSuggestion {
                Text("Doesn't match the `x` + word convention — consider \u{201C}\(suggestion)\u{201D}.")
                    .font(.caption)
                    .foregroundStyle(.orange)
            }
            if let syncStatusLine {
                Text(syncStatusLine)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
    }

    /// Deduplicated by key, since PhraseEditor only needs to list what will be
    /// fillable at copy time — occurrence offsets don't matter here.
    private var detectedVariables: [PhraseVariable] {
        var seen = Set<String>()
        return PhraseVariable.parse(phrase.value, library: store.libraryVariables).filter { seen.insert($0.key).inserted }
    }

    /// Guards against the known "stale atom offsets after editing value" issue
    /// (see docs/mac-app-improvement-plan.md item 13): if `value` is edited by hand,
    /// existing atom start/end offsets aren't remapped and can silently point at the
    /// wrong slice, or a formerly non-overlapping pair can start overlapping. This
    /// doesn't fix the offsets — it just flags atoms that are now out of bounds or
    /// overlapping so Save is blocked until they're removed or re-added.
    private var invalidAtomIDs: Set<String> {
        let characterCount = phrase.value.count
        var invalid = Set<String>()
        var acceptedRanges: [(Int, Int)] = []
        for atom in atoms.sorted(by: { $0.start < $1.start }) {
            let inBounds = atom.start >= 0 && atom.end <= characterCount && atom.end > atom.start
            let overlaps = acceptedRanges.contains { !(atom.end <= $0.0 || atom.start >= $0.1) }
            if !inBounds || overlaps {
                invalid.insert(atom.id)
            } else {
                acceptedRanges.append((atom.start, atom.end))
            }
        }
        return invalid
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
        let isInvalid = invalidAtomIDs.contains(atom.id)
        return HStack(spacing: 6) {
            if isInvalid {
                Image(systemName: "exclamationmark.triangle.fill")
                    .font(.caption2)
                    .foregroundStyle(.red)
            }
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
        .background(isInvalid ? Color.red.opacity(0.16) : Color.secondary.opacity(0.14))
        .overlay(
            Capsule().stroke(isInvalid ? Color.red.opacity(0.55) : Color.clear, lineWidth: 1.5)
        )
        .clipShape(Capsule())
        .help(isInvalid ? "This atom's range no longer matches the current text — remove it (stale after an edit)." : "")
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
        atoms.append(Atom(id: "atom-\(UUID().uuidString)", start: start, end: end, label: nil))
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
        context.coordinator.isProgrammaticUpdate = true
        defer { context.coordinator.isProgrammaticUpdate = false }
        if textView.string != text {
            textView.string = text
        }
        // Apply the binding's range back to the live view (e.g. after "Insert
        // Variable" moves the caret programmatically) — previously only `text` was
        // synced, so the NSTextView's actual caret didn't follow an inserted chip.
        let currentRange = textView.selectedRange()
        if selectedRange != currentRange {
            let length = (textView.string as NSString).length
            if selectedRange.location != NSNotFound, selectedRange.location + selectedRange.length <= length {
                textView.setSelectedRange(selectedRange)
            }
        }
    }

    func makeCoordinator() -> Coordinator { Coordinator(self) }

    final class Coordinator: NSObject, NSTextViewDelegate {
        var parent: SelectableTextEditor
        /// Set while `updateNSView` is programmatically applying `text`/`selectedRange`
        /// to the view, so the delegate callbacks below don't write that same value
        /// straight back into the bindings and create a feedback loop.
        var isProgrammaticUpdate = false
        init(_ parent: SelectableTextEditor) { self.parent = parent }

        func textDidChange(_ notification: Notification) {
            guard !isProgrammaticUpdate, let textView = notification.object as? NSTextView else { return }
            parent.text = textView.string
        }

        func textViewDidChangeSelection(_ notification: Notification) {
            guard !isProgrammaticUpdate, let textView = notification.object as? NSTextView else { return }
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

