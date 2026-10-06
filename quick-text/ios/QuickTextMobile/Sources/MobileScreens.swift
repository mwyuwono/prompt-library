import SwiftUI
import UniformTypeIdentifiers

struct DictationView: View {
    @EnvironmentObject private var dictate: MobileDictation
    @EnvironmentObject private var library: MobileLibrary
    @State private var promptID = "voice-process-clean-transcript"
    @State private var clearConfirmation = false
    private var prompts: [Phrase] { library.corpus.phrases.filter { $0.categoryId == "voice-process" } }
    private var prompt: String {
        guard let selected = prompts.first(where: { $0.id == promptID }) else { return "Clean up this transcript. Remove filler and fix punctuation while preserving meaning. Return only the cleaned text." }
        let parsed = PhraseVariable.parse(selected.value, library: library.corpus.variables ?? [])
        let fixed = parsed.reduce(into: [String: String]()) { if let value = $1.libraryValue { $0[$1.key] = value } }
        return PhraseVariable.substitute(selected.value, values: fixed)
    }
    private var promptNeedsInput: Bool { !PhraseVariable.parse(prompt).isEmpty }
    var body: some View {
        NavigationStack {
            List {
                Section {
                    Text("Record here, then copy your result into another app. Audio and transcripts are sent to Gemini when you transcribe or process.").font(.subheadline).foregroundStyle(.secondary)
                    Button {
                        if dictate.recording { dictate.stop() } else { dictate.start() }
                    } label: {
                        Label(dictate.recording ? "Stop and transcribe" : "Record a take", systemImage: dictate.recording ? "stop.circle.fill" : "mic.circle.fill")
                            .font(.title3).frame(maxWidth: .infinity, minHeight: 44)
                    }.disabled(dictate.busy).accessibilityIdentifier("record-take")
                    if dictate.recording { ProgressView(value: dictate.level).tint(.red).accessibilityLabel("Microphone level") }
                    if dictate.busy { ProgressView("Working…") }
                    Text("Takes are limited to three minutes. Leaving the app stops recording and saves audio for retry.").font(.caption).foregroundStyle(.secondary)
                }
                Section("Takes") {
                    ForEach(dictate.state.takes) { take in
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Take \((dictate.state.takes.firstIndex { $0.id == take.id } ?? 0) + 1)").font(.headline)
                            if let failure = take.failure {
                                Text(failure).font(.subheadline).foregroundStyle(.secondary)
                                if take.audioName != nil { Button("Retry transcription") { dictate.retry(take.id) }.disabled(dictate.busy || dictate.recording) }
                            } else if take.transcript.isEmpty { Text(dictate.recording ? "Recording…" : "No speech detected").foregroundStyle(.secondary) }
                            else { TextField("Transcript", text: Binding(get: { dictate.state.takes.first { $0.id == take.id }?.transcript ?? "" }, set: { dictate.updateTranscript(take.id, text: $0) }), axis: .vertical).disabled(dictate.busy || dictate.recording) }
                        }
                    }.onMove { dictate.move(from: $0, to: $1) }
                    .onDelete { indices in for id in indices.map({ dictate.state.takes[$0].id }) { dictate.remove(id) } }
                }
                Section("Result") {
                    if !prompts.isEmpty {
                        Picker("Process as", selection: $promptID) {
                            Text("Clean transcript (built in)").tag("built-in")
                            ForEach(prompts) { Text($0.title).tag($0.id) }
                        }.disabled(dictate.busy || dictate.recording)
                    }
                    Button("Combine takes — no API call") { dictate.combine() }.disabled(dictate.combined.isEmpty || dictate.busy || dictate.recording)
                    Button("Process takes with Gemini") { dictate.process(prompt: prompt) }.disabled(dictate.combined.isEmpty || dictate.busy || dictate.recording || promptNeedsInput)
                    if promptNeedsInput { Text("This processing prompt has unfilled variables. Choose another prompt or edit its phrase first.").font(.caption).foregroundStyle(.secondary) }
                    TextEditor(text: Binding(get: { dictate.state.result }, set: { dictate.setResult($0) })).frame(minHeight: 160).disabled(dictate.busy || dictate.recording).accessibilityIdentifier("dictation-result")
                    Button { UIPasteboard.general.string = dictate.state.result } label: { Label("Copy result", systemImage: "doc.on.doc") }.disabled(dictate.state.result.isEmpty)
                }
                Section {
                    Text("\(dictate.state.calls) API requests · \(dictate.state.usage.inputTokens) input / \(dictate.state.usage.outputTokens) output tokens reported").font(.caption).foregroundStyle(.secondary)
                    if dictate.state.unreportedCalls > 0 { Text("Usage is incomplete for \(dictate.state.unreportedCalls) requests. Retrying may incur another charge.").font(.caption).foregroundStyle(.secondary) }
                }
            }
            .navigationTitle("Dictate")
            .toolbar { EditButton().disabled(dictate.busy || dictate.recording); Button("Clear") { clearConfirmation = true }.disabled(dictate.busy || dictate.recording || dictate.state.takes.isEmpty) }
            .confirmationDialog("Clear takes and result?", isPresented: $clearConfirmation, titleVisibility: .visible) { Button("Clear session", role: .destructive) { dictate.clear() } }
            .alert("Dictation", isPresented: Binding(get: { dictate.error != nil }, set: { if !$0 { dictate.error = nil } })) { Button("OK") { dictate.error = nil } } message: { Text(dictate.error ?? "") }
        }
    }
}

struct MobileSettingsView: View {
    @EnvironmentObject private var library: MobileLibrary
    @EnvironmentObject private var dictate: MobileDictation
    @State private var key = ""
    @State private var keySaved = GeminiKeychain.hasKey
    @State private var importing = false
    @State private var exporting = false
    @State private var export = LibraryExport(data: Data())
    @State private var pending: MobileLibraryDocument?
    @State private var importConfirmation = false
    @State private var message: String?
    var body: some View {
        NavigationStack {
            Form {
                Section("Gemini") {
                    Text(keySaved ? "API key saved on this device" : "Add your API key to use Dictate").foregroundStyle(.secondary)
                    SecureField("Gemini API key", text: $key).textInputAutocapitalization(.never).autocorrectionDisabled().accessibilityIdentifier("api-key")
                    Button("Save API key") {
                        do { try GeminiKeychain.save(key); key = ""; keySaved = true; message = "API key saved in this device’s Keychain." } catch { message = error.localizedDescription }
                    }.disabled(key.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    if keySaved { Button("Remove API key", role: .destructive) { do { try GeminiKeychain.delete(); keySaved = false } catch { message = error.localizedDescription } } }
                    Text("The key stays in Keychain and is never included in library exports. Dictate uses the same Gemini model as the Mac app. API charges apply.").font(.caption).foregroundStyle(.secondary)
                }
                Section("Library") {
                    Text("\(library.corpus.phrases.count) phrases · \(library.corpus.categories.count) collections")
                    Button("Import library from Files") { importing = true }.disabled(dictate.busy || dictate.recording)
                    Button("Export library to Files") {
                        do { export = LibraryExport(data: try library.exportData()); exporting = true } catch { message = error.localizedDescription }
                    }
                    Text("Import replaces this device’s library after confirmation and keeps a local backup. Export includes all private and local-only phrases. Choose the destination carefully.").font(.caption).foregroundStyle(.secondary)
                    Text("On your Mac, AirDrop quick-text.json from Quick Text’s corpus folder, then import it here. Mobile edits stay on this device until exported; importing is not automatic sync.").font(.caption).foregroundStyle(.secondary)
                }
                Section("Installation") {
                    Text("Free signing expires after seven days. Refresh with AltStore while your Mac is running AltServer on the same Wi-Fi, or connected over USB.")
                    Link("AltStore refresh instructions", destination: URL(string: "https://faq.altstore.io/altstore-classic/your-altstore")!)
                    Text("Background refresh can fail. Confirm renewal before travel. Keep library exports as backups; deleting the app removes its local files.").font(.caption).foregroundStyle(.secondary)
                }
            }
            .navigationTitle("Settings")
            .fileImporter(isPresented: $importing, allowedContentTypes: [.json]) { result in
                do {
                    let url = try result.get()
                    let access = url.startAccessingSecurityScopedResource()
                    defer { if access { url.stopAccessingSecurityScopedResource() } }
                    pending = try MobileLibraryDocument(data: Data(contentsOf: url))
                    importConfirmation = true
                } catch { message = error.localizedDescription }
            }
            .confirmationDialog("Replace this device’s library with \((try? pending?.corpus.phrases.count) ?? 0) imported phrases?", isPresented: $importConfirmation, titleVisibility: .visible) {
                Button("Replace library") {
                    do { if let pending { try library.importLibrary(pending); message = "Library imported. The Mac library has not been changed." } } catch { message = error.localizedDescription }
                    pending = nil
                }
                Button("Cancel", role: .cancel) { pending = nil }
            }
            .fileExporter(isPresented: $exporting, document: export, contentType: .json, defaultFilename: "quick-text-mobile") { result in
                if case .failure(let error) = result { message = error.localizedDescription }
            }
            .alert("Quick Text", isPresented: Binding(get: { message != nil }, set: { if !$0 { message = nil } })) { Button("OK") { message = nil } } message: { Text(message ?? "") }
        }
    }
}
