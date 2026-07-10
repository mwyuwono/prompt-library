import SwiftUI

/// Admin surface for the reusable variable library (see quick-text/README.md
/// "Variable placeholders" -> reusable variable library): lists every library
/// variable, its type/options, and a live reference count (`CorpusStore.referenceCount`
/// — a fresh scan for `{{@name}}` across `phrases[].value`, not a stored back-reference
/// list), plus add/edit/delete. Opened from the toolbar button next to Settings.
struct VariablesLibraryEditor: View {
    @EnvironmentObject private var store: CorpusStore
    let width: CGFloat
    let height: CGFloat
    let onClose: () -> Void
    @State private var editingVariableID: String?
    @State private var isAddingNew = false
    @State private var deleteCandidate: LibraryVariable?

    private let cardWidth: CGFloat = 180
    private let cardSpacing: CGFloat = 10

    private var settings: Binding<Settings> {
        Binding(
            get: { store.corpus.settings },
            set: { store.saveSettings($0) }
        )
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                Spacer()
                Menu {
                    Toggle("Expanded cards show full variable values", isOn: Binding(
                        get: { settings.wrappedValue.expandedChipDisplay ?? Settings.defaultExpandedChipDisplay },
                        set: { settings.wrappedValue.expandedChipDisplay = $0 }
                    ))
                    Toggle("Show Variables button in toolbar", isOn: Binding(
                        get: { settings.wrappedValue.showVariablesLibraryButton ?? Settings.defaultShowVariablesLibraryButton },
                        set: { settings.wrappedValue.showVariablesLibraryButton = $0 }
                    ))
                } label: {
                    Label("Variable Settings", systemImage: "gearshape")
                }
                .buttonStyle(.glass)

                Button {
                    isAddingNew = true
                } label: {
                    Label("Add Variable", systemImage: "plus")
                }
                .buttonStyle(.glass)
            }

            ZStack(alignment: .topLeading) {
                Color.clear
                    .contentShape(Rectangle())
                    .onTapGesture(perform: onClose)

                if store.libraryVariables.isEmpty {
                    Text("No library variables yet. Use Add Variable or Insert Variable in a phrase's Value field.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .padding(.top, 8)
                        .padding(.horizontal, 4)
                } else {
                    ScrollView {
                        MasonryGrid(columnWidth: cardWidth, spacing: cardSpacing) {
                            ForEach(store.libraryVariables) { variable in
                                VariableCard(
                                    variable: variable,
                                    referenceCount: store.referenceCount(forLibraryVariableName: variable.name),
                                    onEdit: { editingVariableID = variable.id },
                                    onDelete: { deleteCandidate = variable }
                                )
                            }
                        }
                        .padding(.vertical, 2)
                    }
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        }
        .padding(14)
        .frame(width: width, height: max(height - 50, 240))
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
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    let variable: LibraryVariable
    let referenceCount: Int
    let onEdit: () -> Void
    let onDelete: () -> Void
    @State private var isHovering = false
    private var typography: CardTypography { CardTypography(baseSize: 18, family: "serif") }

    var body: some View {
        Button(action: onEdit) {
            VStack(alignment: .leading, spacing: 2) {
                HStack(alignment: .firstTextBaseline, spacing: 6) {
                    Text(isHovering ? hoverText : variable.name)
                        .font(typography.tileFont)
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
            .padding(14)
            .frame(minHeight: 112, alignment: .topLeading)
            .frame(maxWidth: .infinity, alignment: .topLeading)
            .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.primary.opacity(isHovering ? 0.22 : 0.1), lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .contentShape(RoundedRectangle(cornerRadius: 12))
        }
        .buttonStyle(.plain)
        .onHover { hovering in
            withAnimation(reduceMotion ? nil : QuickTextMotion.micro) {
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
                .textFieldStyle(.plain)
                .quickTextFieldSurface()
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
                    .textFieldStyle(.plain)
                    .quickTextFieldSurface()
            }

            if type == .value {
                Text("Card shows just the name; the full value below is substituted at copy time.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                TextEditor(text: $valueText)
                    .font(.body)
                    .frame(height: 100)
                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: QuickTextDesign.controlRadius))
                    .overlay(RoundedRectangle(cornerRadius: QuickTextDesign.controlRadius).stroke(Color.primary.opacity(0.13), lineWidth: 1))
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
                .textFieldStyle(.plain)
                .quickTextFieldSurface()
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

#Preview("Variables Library") {
    VariablesLibraryEditor(width: 720, height: 520, onClose: {})
        .environmentObject(PreviewData.store)
        .padding()
}
