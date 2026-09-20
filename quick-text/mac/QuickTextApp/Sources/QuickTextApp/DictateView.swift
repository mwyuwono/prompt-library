import SwiftUI

/// Dictate mode: multi-take voice capture with per-take transcription and
/// one-shot processing through a `voice-process` corpus master prompt.
/// Presented as a sheet from the phrases grid; phrase editing, copy, and
/// text-replacement sync are untouched.
struct DictateView: View {
    let parentWindowWidth: CGFloat
    @EnvironmentObject private var store: CorpusStore
    @StateObject private var session = DictateSession()
    @State private var showingPromptManager = false

    @Environment(\.dismiss) private var dismiss

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
        ScrollView {
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
                    sessionUsageFooter
                }
            }
            .padding(20)
        }
        // Sheets size to their content by default. Use the presenting app window
        // width so Dictate remains capped at 90% while giving editing room.
        .frame(width: parentWindowWidth * 0.9)
        .frame(minHeight: 560, idealHeight: 640, maxHeight: 720)
        .alert("Dictate Error", isPresented: Binding(
            get: { session.errorMessage != nil },
            set: { if !$0 { session.errorMessage = nil } }
        )) {
            Button("OK") { session.errorMessage = nil }
        } message: {
            Text(session.errorMessage ?? "")
        }
        .sheet(isPresented: $showingPromptManager) {
            DictationPromptManager(selectedProcessID: $session.selectedProcessID)
                .environmentObject(store)
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
            Button {
                showingPromptManager = true
            } label: {
                Label("Manage prompts", systemImage: "gearshape")
            }
            .buttonStyle(.glass)
            .help("Create and edit Process As prompts")
            Button("Done") { dismiss() }
                .buttonStyle(.glass)
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
            .frame(width: 80)

            if session.isRecording {
                HStack(spacing: 8) {
                    Circle()
                        .fill(.red)
                        .frame(width: 8, height: 8)
                    Text("Recording (\(formatDuration(session.recordingElapsed)))")
                        .foregroundStyle(.red)
                        .monospacedDigit()
                    recordingLevelMeter
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            } else if session.isWorking {
                HStack(spacing: 8) {
                    ProgressView()
                        .controlSize(.small)
                    Text("Working…")
                        .foregroundStyle(.secondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            } else {
                Text(session.takes.isEmpty ? "Press Record, speak, then Stop. Repeat for more takes." : "\(session.readyTranscripts.count) of \(session.takes.count) takes transcribed.")
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .frame(minHeight: 32)
    }

    private var recordingLevelMeter: some View {
        GeometryReader { geometry in
            ZStack(alignment: .leading) {
                Capsule()
                    .fill(Color.primary.opacity(0.10))
                Capsule()
                    .fill(.red.gradient)
                    .frame(width: geometry.size.width * CGFloat(session.recordingLevel))
            }
        }
        .frame(width: 96, height: 6)
        .accessibilityLabel("Recording input level")
        .accessibilityValue("\(Int(session.recordingLevel * 100)) percent")
    }

    private func formatDuration(_ duration: TimeInterval) -> String {
        let totalSeconds = max(0, Int(duration.rounded(.down)))
        return String(format: "%02d:%02d", totalSeconds / 60, totalSeconds % 60)
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
            VStack(alignment: .leading, spacing: 2) {
                Text("Take \(index + 1)")
                    .font(.headline)
                HStack(spacing: 5) {
                    if let duration = take.duration {
                        Text(formatDuration(duration))
                    }
                    if let usage = take.tokenUsage {
                        Text("·")
                        Text("\(usage.totalTokens.formatted()) tokens")
                    }
                }
                .font(.caption2)
                .foregroundStyle(.tertiary)
            }
            .frame(minWidth: 68, alignment: .leading)
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
                if take.audioURL != nil, take.status != .recording, take.status != .transcribing {
                    Button {
                        session.togglePlayback(take)
                    } label: {
                        Label(
                            session.playingTakeID == take.id ? "Stop" : "Play",
                            systemImage: session.playingTakeID == take.id ? "stop.fill" : "play.fill"
                        )
                    }
                    .buttonStyle(.glass)
                    .help(session.playingTakeID == take.id ? "Stop playback" : "Play recorded take")
                }
                if take.status == .ready {
                    Button {
                        session.copyTake(take)
                    } label: {
                        Label("Copy", systemImage: "doc.on.doc")
                    }
                    .buttonStyle(.glass)
                    .disabled((take.transcript ?? "").trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    .help("Copy take transcript")
                    Button {
                        session.rerecordTake(take)
                    } label: {
                        Label("Re-record", systemImage: "arrow.counterclockwise")
                    }
                    .buttonStyle(.glass)
                    .help("Discard this take and record it again")
                }
                if case .failed = take.status {
                    Button {
                        session.rerecordTake(take)
                    } label: {
                        Label("Re-record", systemImage: "arrow.counterclockwise")
                    }
                    .buttonStyle(.glass)
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
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 12) {
                Picker("Process as", selection: $session.selectedProcessID) {
                    ForEach(voicePhrases) { phrase in
                        Text(phrase.title).tag(phrase.id)
                    }
                }
                .pickerStyle(.menu)
                .frame(maxWidth: 280)

                Button("Reprocess Takes") {
                    if let prompt = selectedPrompt {
                        session.reprocessTakes(masterPrompt: prompt.value)
                    }
                }
                .buttonStyle(.glassProminent)
                .tint(store.highlightColor)
                .disabled(session.readyTranscripts.isEmpty || session.isWorking || session.isRecording || selectedPrompt == nil)
            }

            if let prompt = selectedPrompt {
                DisclosureGroup("Prompt preview") {
                    ScrollView {
                        Text(prompt.value)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .textSelection(.enabled)
                    }
                    .frame(maxHeight: 88)
                }
                .font(.caption)
            }
        }
    }

    private var resultSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 8) {
                Text("Result")
                    .font(.headline)
                if let synth = session.synthesisTokenUsage {
                    Text("(\(synth.totalTokens.formatted()) tokens · \(TokenUsage.formatCost(synth.estimatedCost)))")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                if !session.resultText.isEmpty {
                    Button("Clear") { session.resultText = "" }
                        .buttonStyle(.glass)
                }
                Button("Reprocess Takes") {
                    if let prompt = selectedPrompt {
                        session.reprocessTakes(masterPrompt: prompt.value)
                    }
                }
                .buttonStyle(.glass)
                .disabled(session.readyTranscripts.isEmpty || session.isWorking || session.isRecording || selectedPrompt == nil)
                Button("Refine Result") {
                    if let prompt = selectedPrompt {
                        session.refineCurrentResult(masterPrompt: prompt.value)
                    }
                }
                .buttonStyle(.glass)
                .disabled(session.resultText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || session.isWorking || session.isRecording || selectedPrompt == nil)
                Button("Copy") { session.copyResult() }
                    .buttonStyle(.glass)
                    .disabled(session.resultText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
            ZStack(alignment: .topLeading) {
                TextEditor(text: $session.resultText)
                    .font(.body)
                    .frame(minHeight: 200)
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

    private var sessionUsageFooter: some View {
        let total = session.sessionTokenUsage
        let transcription = session.transcriptionTokenUsage
        let synthesis = session.synthesisTokenUsage

        let costString = total.totalTokens == 0 ? "$0.00" : "~\(TokenUsage.formatCost(session.sessionEstimatedCost))"

        return HStack(spacing: 6) {
            Image(systemName: "chart.bar")
                .font(.caption2)
                .foregroundStyle(.tertiary)
            Text("Session usage: \(total.totalTokens.formatted()) tokens (\(costString))")
                .font(.caption)
                .foregroundStyle(.secondary)

            if transcription.totalTokens > 0 {
                Text("·")
                    .font(.caption)
                    .foregroundStyle(.tertiary)
                Text("Transcription: \(transcription.totalTokens.formatted())")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            if !session.processingTurns.isEmpty {
                Text("·")
                    .font(.caption)
                    .foregroundStyle(.tertiary)
                Text("Processing: \(session.processingTokenUsage.totalTokens.formatted()) (\(session.processingTurns.count) turn\(session.processingTurns.count == 1 ? "" : "s"))")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()
        }
        .padding(.top, 2)
        .help("Transcription: \(transcription.totalTokens.formatted()) tokens (\(TokenUsage.formatCost(transcription.estimatedCost(pricing: .transcribe)))), latest processing: \(synthesis?.totalTokens.formatted() ?? "0") tokens")
    }
}
