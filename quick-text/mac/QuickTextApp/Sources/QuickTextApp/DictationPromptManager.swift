import SwiftUI

/// Scoped prompt management keeps Dictate users in their recording flow while
/// still storing custom Process As types in the normal corpus-backed phrase set.
struct DictationPromptManager: View {
    @EnvironmentObject private var store: CorpusStore
    @Environment(\.dismiss) private var dismiss
    @Binding var selectedProcessID: String
    @State private var editing: Phrase?

    private var prompts: [Phrase] {
        store.corpus.phrases
            .filter { $0.categoryId == "voice-process" }
            .sorted { $0.title.localizedCaseInsensitiveCompare($1.title) == .orderedAscending }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                VStack(alignment: .leading) {
                    Text("Dictation Prompts").font(.title2.weight(.semibold))
                    Text("Built-ins stay available. Custom types appear in Process As immediately.")
                        .font(.caption).foregroundStyle(.secondary)
                }
                Spacer()
                Button("New Type") { editing = newPrompt() }
                    .buttonStyle(.glassProminent)
                Button("Done") { dismiss() }.buttonStyle(.glass)
            }

            List(prompts) { prompt in
                HStack {
                    VStack(alignment: .leading, spacing: 3) {
                        Text(prompt.title)
                        Text(prompt.value).lineLimit(2).font(.caption).foregroundStyle(.secondary)
                    }
                    Spacer()
                    if CorpusStore.builtInDictationPromptIDs.contains(prompt.id) {
                        Text("Built-in").font(.caption).foregroundStyle(.secondary)
                    }
                    Button("Edit") { editing = prompt }.buttonStyle(.glass)
                    if !CorpusStore.builtInDictationPromptIDs.contains(prompt.id) {
                        Button(role: .destructive) {
                            if selectedProcessID == prompt.id { selectedProcessID = DictateSession.defaultProcessID }
                            store.deleteDictationPrompt(prompt)
                        } label: { Image(systemName: "trash") }
                        .buttonStyle(.glass)
                    }
                }
                .padding(.vertical, 3)
            }
        }
        .padding(20)
        .frame(width: 700, height: 500)
        .sheet(item: $editing) { prompt in
            DictationPromptEditor(prompt: prompt) { updated in
                store.save(updated)
                selectedProcessID = updated.id
            }
        }
    }

    private func newPrompt() -> Phrase {
        Phrase(
            id: "voice-process-custom-\(UUID().uuidString)", categoryId: "voice-process",
            title: "", summary: nil, value: "", color: nil, textColor: nil,
            fontSize: nil, image: nil, favorite: false, visibility: .private,
            tags: [], createdAt: Date(), updatedAt: Date()
        )
    }
}

private struct DictationPromptEditor: View {
    @Environment(\.dismiss) private var dismiss
    @State private var prompt: Phrase
    let onSave: (Phrase) -> Void

    init(prompt: Phrase, onSave: @escaping (Phrase) -> Void) {
        _prompt = State(initialValue: prompt)
        self.onSave = onSave
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(prompt.title.isEmpty ? "New Dictation Type" : "Edit Dictation Type").font(.title3.weight(.semibold))
            TextField("Type name", text: $prompt.title)
            Text("Prompt template").font(.headline)
            TextEditor(text: $prompt.value).font(.body).frame(minHeight: 220)
                .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.primary.opacity(0.15)))
            HStack {
                Spacer()
                Button("Cancel") { dismiss() }.buttonStyle(.glass)
                Button("Save") {
                    prompt.title = prompt.title.trimmingCharacters(in: .whitespacesAndNewlines)
                    prompt.value = prompt.value.trimmingCharacters(in: .whitespacesAndNewlines)
                    onSave(prompt)
                    dismiss()
                }
                .buttonStyle(.glassProminent)
                .disabled(prompt.title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || prompt.value.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
        }
        .padding(20).frame(width: 620)
    }
}
