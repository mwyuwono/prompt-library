import SwiftUI

/// Dictate mode: multi-take voice capture with per-take transcription and
/// one-shot processing through a `voice-process` corpus master prompt.
/// Presented as a sheet from the phrases grid; phrase editing, copy, and
/// text-replacement sync are untouched.
struct DictateView: View {
    @EnvironmentObject private var store: CorpusStore
    @StateObject private var session = DictateSession()

    private var voicePhrases: [Phrase] {
        store.corpus.phrases
            .filter { $0.categoryId == "voice-process" }
            .sorted { $0.title < $1.title }
    }

    private var selectedPrompt: Phrase? {
        voicePhrases.first { $0.id == session.selectedProcessID }
            ?? voicePhrases.first { $0.id == DictateSession.defaultProcessID }
            ?? voicePhrases.first
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            header

            if !GeminiKeychain.hasKey {
                keyWarning
            }

            if voicePhrases.isEmpty {
                Text("No Voice Process prompts found in the corpus. Add phrases to the Voice Process category first.")
                    .foregroundStyle(.secondary)
            } else {
                recordRow
                takesList
                processRow
                resultSection
            }

            Spacer(minLength: 0)
        }
        .padding(20)
        .frame(minWidth: 620, minHeight: 560)
        .alert("Dictate Error", isPresented: Binding(
            get: { session.errorMessage != nil },
            set: { if !$0 { session.errorMessage = nil } }
        )) {
            Button("OK") { session.errorMessage = nil }
        } message: {
            Text(session.errorMessage ?? "")
        }
    }

    private var header: some View {
        HStack {
            Label("Dictate", systemImage: "mic.fill")
                .font(.title2.weight(.semibold))
            Spacer()
            Button("New Session") { session.newSession() }
                .buttonStyle(.glass)
                .disabled(session.isRecording || session.isWorking)
        }
    }

    private var keyWarning: some View {
        Label("No Gemini API key saved — open Settings > Dictation to add it.", systemImage: "key.fill")
            .font(.callout)
            .foregroundStyle(.orange)
    }

    private var recordRow: some View {
        HStack(spacing: 12) {
            Button(session.isRecording ? "Stop" : "Record") {
                session.toggleRecording()
            }
            .buttonStyle(.glassProminent)
            .tint(session.isRecording ? .red : store.highlightColor)
            .keyboardShortcut(.defaultAction)
            .disabled(session.isWorking)

            if session.isRecording {
                Text("Recording…")
                    .foregroundStyle(.red)
            } else if session.isWorking {
                ProgressView()
                    .controlSize(.small)
                Text("Working…")
                    .foregroundStyle(.secondary)
            } else {
                Text(session.takes.isEmpty ? "Press Record, speak, then Stop. Repeat for more takes." : "\(session.readyTranscripts.count) of \(session.takes.count) takes transcribed.")
                    .foregroundStyle(.secondary)
            }
        }
    }

    private var takesList: some View {
        Group {
            if session.takes.isEmpty {
                Text("No takes yet.")
                    .foregroundStyle(.tertiary)
                    .frame(maxWidth: .infinity, minHeight: 60)
            } else {
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 8) {
                        ForEach(Array(session.takes.enumerated()), id: \.element.id) { index, take in
                            takeRow(index: index, take: take)
                        }
                    }
                }
                .frame(maxHeight: 220)
            }
        }
    }

    private func transcriptBinding(takeID: UUID) -> Binding<String> {
        Binding(
            get: {
                session.takes.first(where: { $0.id == takeID })?.transcript ?? ""
            },
            set: { newValue in
                session.updateTranscript(for: takeID, text: newValue)
            }
        )
    }

    private func takeRow(index: Int, take: DictateTake) -> some View {
        HStack(alignment: .top, spacing: 10) {
            Text("Take \(index + 1)")
                .font(.headline)
                .frame(minWidth: 56, alignment: .leading)
                .padding(.top, 4)
            VStack(alignment: .leading, spacing: 4) {
                switch take.status {
                case .recording:
                    Text("Recording…").foregroundStyle(.red)
                case .transcribing:
                    HStack(spacing: 6) {
                        ProgressView().controlSize(.small)
                        Text("Transcribing…").foregroundStyle(.secondary)
                    }
                case .ready:
                    TextField("Transcript", text: transcriptBinding(takeID: take.id), axis: .vertical)
                        .textFieldStyle(.plain)
                        .lineLimit(1...6)
                        .padding(6)
                        .background(RoundedRectangle(cornerRadius: 6).fill(Color.primary.opacity(0.04)))
                        .overlay(RoundedRectangle(cornerRadius: 6).stroke(Color.primary.opacity(0.12)))
                case .failed(let message):
                    Text(message)
                        .foregroundStyle(.red)
                        .lineLimit(3)
                    Button("Retry") { session.retryTake(take) }
                        .buttonStyle(.glass)
                }
            }
            Spacer()
            HStack(spacing: 6) {
                if take.status == .ready {
                    Button {
                        session.copyTake(take)
                    } label: {
                        Label("Copy", systemImage: "doc.on.doc")
                    }
                    .buttonStyle(.glass)
                    .disabled((take.transcript ?? "").trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    .help("Copy take transcript")
                }
                Button(role: .destructive) { session.deleteTake(take) } label: {
                    Image(systemName: "trash")
                }
                .buttonStyle(.glass)
                .disabled(session.isRecording)
                .help("Delete take")
            }
        }
        .padding(10)
        .background(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.05)))
    }

    private var processRow: some View {
        HStack(spacing: 12) {
            Picker("Process as", selection: $session.selectedProcessID) {
                ForEach(voicePhrases) { phrase in
                    Text(phrase.title).tag(phrase.id)
                }
            }
            .pickerStyle(.menu)
            .frame(maxWidth: 280)

            Button("Process") {
                if let prompt = selectedPrompt {
                    session.process(masterPrompt: prompt.value)
                }
            }
            .buttonStyle(.glassProminent)
            .tint(store.highlightColor)
            .disabled(session.readyTranscripts.isEmpty || session.isWorking || session.isRecording || selectedPrompt == nil)
        }
    }

    private var resultSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("Result")
                    .font(.headline)
                Spacer()
                Button("Copy") { session.copyResult() }
                    .buttonStyle(.glass)
                    .disabled(session.resultText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
            ZStack(alignment: .topLeading) {
                TextEditor(text: $session.resultText)
                    .font(.body)
                    .frame(minHeight: 140)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                    .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.primary.opacity(0.15)))
                if session.resultText.isEmpty {
                    Text("Result will appear here after processing, or type and edit directly…")
                        .font(.body)
                        .foregroundStyle(.tertiary)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 10)
                        .allowsHitTesting(false)
                }
            }
        }
    }
}
