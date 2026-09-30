import AppKit
import SwiftUI
import UniformTypeIdentifiers

/// In-process drag type for dictate take reordering. A dedicated type
/// (rather than plain text) keeps transcript editors from accepting
/// take drags as text insertions.
private extension UTType {
    static var dictateTake: UTType {
        UTType(exportedAs: "com.weaveryuwono.quicktext.dictate-take")
    }
}

/// Dictate mode: multi-take voice capture with per-take transcription and
/// one-shot processing through a `voice-process` corpus master prompt.
/// A full page in the library content area (sidebar stays). The page has one
/// vertical scroll; takes and the result size to their content, and the Record
/// dock floats over the bottom edge.
struct DictateView: View {
    @ObservedObject var session: DictateSession
    @Binding var sidebarVisible: Bool
    let onClose: () -> Void

    @EnvironmentObject private var store: CorpusStore
    @Environment(\.colorScheme) private var scheme
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var showingPromptManager = false
    @State private var dropTargetID: UUID?
    @State private var focusedTakeID: UUID?
    @State private var promptExpanded = true
    @State private var pageWidth: CGFloat = 1200
    @State private var levels: [Float] = []

    private let columnGap: CGFloat = 48
    private let sideColumnWidth: CGFloat = 460
    private let pageInset: CGFloat = 56

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

    private var isBusy: Bool { session.isRecording || session.isWorking }
    private var resultIsEmpty: Bool {
        session.resultText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }
    private var stacked: Bool { pageWidth - pageInset * 2 < 1000 }

    var body: some View {
        VStack(spacing: 0) {
            toolbar
            ScrollViewReader { proxy in
                ScrollView {
                    page
                        .padding(EdgeInsets(top: 44, leading: pageInset, bottom: 140, trailing: pageInset))
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
                .onGeometryChange(for: CGFloat.self) { $0.size.width } action: { pageWidth = $0 }
                .onChange(of: session.isRecording) { _, recording in
                    if recording {
                        levels = []
                        // Keep the recording card visible when the list is longer than the window.
                        DispatchQueue.main.async {
                            guard let id = session.takes.last?.id else { return }
                            withAnimation(reduceMotion ? nil : Theme.Motion.fade) {
                                proxy.scrollTo(id, anchor: .bottom)
                            }
                        }
                        announce("Recording take \(session.takes.count)")
                    } else if !session.takes.isEmpty {
                        announce("Take \(session.takes.count) recorded, transcribing")
                    }
                }
                .onChange(of: session.recordingLevel) { _, level in
                    guard session.isRecording else { return }
                    levels.append(level)
                    if levels.count > 400 { levels.removeFirst(levels.count - 400) }
                }
            }
        }
        .background(Theme.bgContent)
        .overlay(alignment: .bottom) { dock.padding(.bottom, 32) }
        .onExitCommand { close() }
        .sheet(isPresented: $showingPromptManager) {
            DictationPromptManager(selectedProcessID: $session.selectedProcessID)
                .environmentObject(store)
        }
    }

    /// Leaving while recording stops the take first, so audio is never lost silently.
    private func close() {
        if session.isRecording { session.stopRecording() }
        onClose()
    }

    private func announce(_ text: String) {
        AccessibilityNotification.Announcement(text).post()
    }

    // MARK: - Toolbar

    private var toolbar: some View {
        HStack(spacing: 12) {
            Button {
                withAnimation(reduceMotion ? nil : Theme.Motion.sheet) { sidebarVisible.toggle() }
            } label: {
                Image(systemName: "sidebar.left")
                    .font(.system(size: 15, weight: .regular))
                    .foregroundStyle(Theme.textSecondary)
            }
            .buttonStyle(IconButtonStyle())
            .accessibilityLabel(sidebarVisible ? "Hide sidebar" : "Show sidebar")

            Button(action: close) {
                HStack(spacing: 4) {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 13, weight: .semibold))
                    Text("Library")
                }
                .font(.system(size: 14, weight: .medium))
                .foregroundStyle(Theme.textSecondary)
                .padding(.horizontal, 8)
                .frame(height: 36)
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .keyboardShortcut("[", modifiers: .command)
            .accessibilityLabel("Back to Library")
            .help("Back to Library (⌘[ or Esc)")

            Rectangle().fill(Theme.rule).frame(width: 1, height: 20)

            Text("Dictate")
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(Theme.textPrimary)
                .accessibilityAddTraits(.isHeader)

            Spacer(minLength: 12)

            Button { session.newSession() } label: {
                Label("New Session", systemImage: "plus")
            }
            .buttonStyle(OutlineButtonStyle(height: 34, fill: Theme.bgButton))
            .dimWhenDisabled()
            .disabled(isBusy)

            Button { showingPromptManager = true } label: {
                Label("Manage prompts", systemImage: "slider.horizontal.3")
            }
            .buttonStyle(OutlineButtonStyle(height: 34, fill: Theme.bgButton))
            .help("Create and edit Process As prompts")
        }
        // Leaves room for the traffic lights when the sidebar is hidden.
        .padding(.leading, sidebarVisible ? 16 : 84)
        .padding(.trailing, 20)
        .frame(height: 56)
        .overlay(alignment: .bottom) { Rectangle().fill(Theme.rule).frame(height: 1) }
    }

    // MARK: - Page

    private var page: some View {
        VStack(alignment: .leading, spacing: 36) {
            headerRow
            notices
            if voicePhrases.isEmpty {
                Text("No Voice Process prompts found in the corpus. Add phrases to the Voice Process category first.")
                    .foregroundStyle(Theme.textSecondary)
            } else if stacked {
                VStack(alignment: .leading, spacing: 36) {
                    takesColumn
                    sideColumn
                }
            } else {
                HStack(alignment: .top, spacing: columnGap) {
                    takesColumn.frame(maxWidth: .infinity, alignment: .leading)
                    sideColumn.frame(width: sideColumnWidth)
                }
            }
        }
    }

    private var eyebrowText: String {
        if session.isRecording { return "Recording" }
        if session.takes.isEmpty { return "New session" }
        return "\(session.readyTranscripts.count) of \(session.takes.count) takes transcribed"
    }

    private var headerRow: some View {
        HStack(alignment: .lastTextBaseline) {
            VStack(alignment: .leading, spacing: 6) {
                Text(eyebrowText.uppercased())
                    .font(ThemeFont.eyebrow())
                    .tracking(11 * 0.12)
                    .foregroundStyle(Theme.accent)
                Text("Dictate")
                    .font(ThemeFont.serif(52))
                    .tracking(-52 * 0.02)
                    .foregroundStyle(Theme.textPrimary)
                    .accessibilityAddTraits(.isHeader)
            }
            Spacer(minLength: 24)
            usage
        }
    }

    private var usage: some View {
        let total = session.sessionTokenUsage.totalTokens
        let transcription = session.transcriptionTokenUsage.totalTokens
        let processing = session.processingTokenUsage.totalTokens
        let cost = total == 0 ? "$0.00" : "~\(TokenUsage.formatCost(session.sessionEstimatedCost))"
        return VStack(alignment: .trailing, spacing: 3) {
            Text("SESSION USAGE")
                .font(.system(size: 10.5, weight: .semibold))
                .tracking(10.5 * 0.09)
                .foregroundStyle(Theme.textTertiary)
            Text("\(total.formatted()) tokens · \(cost)")
                .font(.system(size: 15, weight: .medium))
                .monospacedDigit()
                .foregroundStyle(Theme.textPrimary)
            if total > 0 {
                Text("Transcription \(transcription.formatted()) · Processing \(processing.formatted())")
                    .font(.system(size: 12))
                    .monospacedDigit()
                    .foregroundStyle(Theme.textTertiary)
            }
        }
        .accessibilityElement(children: .combine)
    }

    /// Inline error rows directly under the header (replaces the old alert).
    @ViewBuilder
    private var notices: some View {
        if !GeminiKeychain.hasKey {
            noticeRow("No Gemini API key saved — open Settings > Dictation to add it.", symbol: "key.fill", onDismiss: nil)
        }
        if let message = session.errorMessage {
            noticeRow(message, symbol: "exclamationmark.circle.fill") { session.errorMessage = nil }
        }
    }

    private func noticeRow(_ text: String, symbol: String, onDismiss: (() -> Void)?) -> some View {
        HStack(spacing: 10) {
            Image(systemName: symbol)
                .font(.system(size: 13))
                .foregroundStyle(Theme.rec)
            Text(text)
                .font(.system(size: 13))
                .foregroundStyle(Theme.textSecondary)
                .frame(maxWidth: .infinity, alignment: .leading)
            if let onDismiss {
                Button(action: onDismiss) {
                    Image(systemName: "xmark")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(Theme.textTertiary)
                }
                .buttonStyle(IconButtonStyle(size: 28))
                .accessibilityLabel("Dismiss")
            }
        }
    }

    private func sectionHeader(_ title: String, count: Int? = nil, trailing: String? = nil) -> some View {
        HStack(alignment: .firstTextBaseline, spacing: 10) {
            Text(title)
                .font(ThemeFont.serif(24, italic: true))
                .foregroundStyle(Theme.textPrimary)
                .accessibilityAddTraits(.isHeader)
            if let count {
                Text("\(count)")
                    .font(.system(size: 13))
                    .foregroundStyle(Theme.textTertiary)
            }
            Rectangle().fill(Theme.rule).frame(height: 1)
                .alignmentGuide(.firstTextBaseline) { $0[.bottom] }
            if let trailing {
                Text(trailing)
                    .font(.system(size: 12))
                    .monospacedDigit()
                    .foregroundStyle(Theme.textTertiary)
            }
        }
    }

    // MARK: - Takes

    private var takesColumn: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeader("Takes", count: session.takes.count)
            if session.takes.count > 1 {
                Text("Drag the grip to reorder. Processing and Combine follow this order.")
                    .font(.system(size: 13))
                    .foregroundStyle(Theme.textSecondary)
            }
            if session.takes.isEmpty {
                emptyTakes
            } else {
                VStack(alignment: .leading, spacing: 12) {
                    ForEach(Array(session.takes.enumerated()), id: \.element.id) { index, take in
                        takeCard(index: index, take: take).id(take.id)
                    }
                }
            }
        }
    }

    private var emptyTakes: some View {
        VStack(spacing: 12) {
            Image(systemName: "mic")
                .font(.system(size: 30, weight: .light))
                .foregroundStyle(Theme.textTertiary)
            Text("No takes yet")
                .font(ThemeFont.serif(26, weight: .medium))
                .tracking(-26 * 0.015)
                .foregroundStyle(Theme.textPrimary)
            Text("Press Record, speak, then Stop. Repeat for more takes.")
                .font(.system(size: 14))
                .lineSpacing(5)
                .multilineTextAlignment(.center)
                .foregroundStyle(Theme.textSecondary)
                .frame(maxWidth: 320)
        }
        .padding(40)
        .frame(maxWidth: .infinity, minHeight: 340)
        .background(RoundedRectangle(cornerRadius: Theme.Radius.panel).fill(Theme.bgPanel))
    }

    private func transcriptBinding(takeID: UUID) -> Binding<String> {
        Binding(
            get: { session.takes.first(where: { $0.id == takeID })?.transcript ?? "" },
            set: { session.updateTranscript(for: takeID, text: $0) }
        )
    }

    private func takeCard(index: Int, take: DictateTake) -> some View {
        let recording = take.status == .recording
        let focused = focusedTakeID == take.id
        let dropTarget = dropTargetID == take.id
        let shadow = Theme.tileShadow(hover: false, scheme: scheme)
        let border: Color = recording ? Theme.recLine : (focused || dropTarget ? Theme.hl : Theme.borderTile)
        return HStack(alignment: .top, spacing: 0) {
            grip(index: index, take: take, dimmed: recording || isBusy)
            VStack(alignment: .leading, spacing: 6) {
                takeHeader(index: index, take: take)
                takeBody(index: index, take: take)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(EdgeInsets(top: 16, leading: 14, bottom: 18, trailing: 20))
        .background(RoundedRectangle(cornerRadius: Theme.Radius.tile).fill(Theme.bgTile))
        .overlay(RoundedRectangle(cornerRadius: Theme.Radius.tile).strokeBorder(border, lineWidth: 1))
        .focusRing(focused, cornerRadius: Theme.Radius.tile)
        .shadow(color: shadow.color, radius: shadow.radius, y: shadow.y)
        .onDrop(of: [.dictateTake], isTargeted: Binding(
            get: { dropTargetID == take.id },
            set: {
                if $0 {
                    dropTargetID = take.id
                } else if dropTargetID == take.id {
                    dropTargetID = nil
                }
            }
        )) { providers in
            dropTargetID = nil
            guard !isBusy, let provider = providers.first else { return false }
            provider.loadDataRepresentation(forTypeIdentifier: UTType.dictateTake.identifier) { data, _ in
                guard let data,
                      let idString = String(data: data, encoding: .utf8),
                      let draggedID = UUID(uuidString: idString) else { return }
                Task { @MainActor in
                    session.moveTake(draggedID, onto: take.id)
                }
            }
            return true
        }
    }

    private func grip(index: Int, take: DictateTake, dimmed: Bool) -> some View {
        Image(systemName: "circle.grid.2x3.fill")
            .font(.system(size: 14))
            .foregroundStyle(Theme.textTertiary)
            .frame(width: 28, height: 36)
            .contentShape(Rectangle())
            .opacity(take.status == .recording ? 0.4 : (dimmed ? 0.3 : 1))
            .allowsHitTesting(!dimmed)
            .help("Drag to reorder this take")
            .accessibilityLabel("Reorder Take \(index + 1)")
            .accessibilityAddTraits(.isButton)
            .onDrag {
                let provider = NSItemProvider()
                provider.registerDataRepresentation(
                    forTypeIdentifier: UTType.dictateTake.identifier,
                    visibility: .ownProcess
                ) { completion in
                    completion(Data(take.id.uuidString.utf8), nil)
                    return nil
                }
                return provider
            }
    }

    private func takeHeader(index: Int, take: DictateTake) -> some View {
        HStack(spacing: 10) {
            Text("TAKE \(index + 1)")
                .font(.system(size: 10.5, weight: .semibold))
                .tracking(10.5 * 0.09)
                .foregroundStyle(Theme.textSecondary)
            if take.status == .recording {
                Circle().fill(Theme.rec).frame(width: 8, height: 8)
                Text("Recording")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(Theme.rec)
                Spacer()
                Text(formatDuration(session.recordingElapsed))
                    .font(.system(size: 13))
                    .monospacedDigit()
                    .foregroundStyle(Theme.textSecondary)
            } else {
                takeMeta(take)
                Spacer()
                takeActions(index: index, take: take)
            }
        }
        .frame(height: 36)
    }

    private func takeMeta(_ take: DictateTake) -> some View {
        var parts: [String] = []
        if let duration = take.duration { parts.append(formatDuration(duration)) }
        if let usage = take.tokenUsage { parts.append("\(usage.totalTokens.formatted()) tokens") }
        return Text(parts.joined(separator: " · "))
            .font(.system(size: 12))
            .monospacedDigit()
            .foregroundStyle(Theme.textTertiary)
    }

    private func takeActions(index: Int, take: DictateTake) -> some View {
        let n = index + 1
        let hasText = !(take.transcript ?? "").trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        var canRerecord = false
        if take.status == .ready { canRerecord = true }
        if case .failed = take.status { canRerecord = true }
        return HStack(spacing: 0) {
            if take.audioURL != nil, take.status != .transcribing {
                let playing = session.playingTakeID == take.id
                iconButton(playing ? "stop.fill" : "play.fill", label: "\(playing ? "Stop" : "Play") Take \(n)") {
                    session.togglePlayback(take)
                }
            }
            if take.status == .ready {
                iconButton("doc.on.doc", label: "Copy Take \(n)", disabled: !hasText) { session.copyTake(take) }
            }
            if canRerecord {
                iconButton("arrow.counterclockwise", label: "Re-record Take \(n)") { session.rerecordTake(take) }
            }
            iconButton("trash", label: "Delete Take \(n)", disabled: session.isRecording) { session.deleteTake(take) }
        }
    }

    /// 36 pt glyph target on a 44 pt hit area.
    private func iconButton(_ symbol: String, label: String, disabled: Bool = false, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: symbol)
                .font(.system(size: 15, weight: .regular))
                .foregroundStyle(Theme.textTertiary)
        }
        .buttonStyle(IconButtonStyle(size: 44))
        .dimWhenDisabled()
        .disabled(disabled)
        .accessibilityLabel(label)
        .help(label)
    }

    @ViewBuilder
    private func takeBody(index: Int, take: DictateTake) -> some View {
        switch take.status {
        case .recording:
            VStack(alignment: .leading, spacing: 10) {
                waveform
                let interim = (take.transcript ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
                if !interim.isEmpty {
                    // Real-time mode: words appear while recording. Read-only
                    // until the take is ready, like the waveform above.
                    Text(interim)
                        .font(ThemeFont.serif(19))
                        .lineSpacing(7)
                        .foregroundStyle(Theme.textPrimary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .accessibilityLabel("Take \(index + 1) live transcript")
                }
            }
        case .transcribing:
            HStack(spacing: 8) {
                ProgressView().controlSize(.small)
                Text("Transcribing…")
                    .font(.system(size: 14))
                    .foregroundStyle(Theme.textSecondary)
            }
        case .ready:
            AutoHeightTextView(
                text: transcriptBinding(takeID: take.id),
                font: nsSerif(19),
                lineSpacing: 7,
                textColor: Theme.textPrimary,
                caretColor: Theme.hl,
                selectionColor: Theme.hlSelection,
                accessibilityLabel: "Take \(index + 1) transcript",
                onFocusChange: { focusedTakeID = $0 ? take.id : (focusedTakeID == take.id ? nil : focusedTakeID) }
            )
        case .failed(let message):
            VStack(alignment: .leading, spacing: 10) {
                HStack(alignment: .firstTextBaseline, spacing: 8) {
                    Image(systemName: "exclamationmark.circle.fill").foregroundStyle(Theme.rec)
                    Text(message)
                        .font(.system(size: 13))
                        .foregroundStyle(Theme.textSecondary)
                }
                Button("Retry") { session.retryTake(take) }
                    .buttonStyle(OutlineButtonStyle(height: 30, fill: Theme.bgButton))
                    .disabled(take.audioURL == nil)
            }
        }
    }

    /// 56 pt row of 3 pt bars. Elapsed bars follow the live input level;
    /// upcoming bars are flat `rule` ticks. Decorative; the timer carries state.
    private var waveform: some View {
        GeometryReader { geo in
            let count = max(1, Int((geo.size.width + 3) / 6))
            let visible = Array(levels.suffix(count))
            HStack(alignment: .center, spacing: 3) {
                ForEach(0..<count, id: \.self) { i in
                    if i < visible.count {
                        RoundedRectangle(cornerRadius: 2).fill(Theme.rec)
                            .frame(width: 3, height: 4 + CGFloat(visible[i]) * 52)
                    } else {
                        RoundedRectangle(cornerRadius: 2).fill(Theme.rule)
                            .frame(width: 3, height: 4)
                    }
                }
            }
            .frame(width: geo.size.width, height: geo.size.height, alignment: .leading)
        }
        .frame(height: 56)
        .accessibilityHidden(true)
    }

    // MARK: - Process and result

    private var sideColumn: some View {
        VStack(alignment: .leading, spacing: 36) {
            processPanel
            resultSection
        }
    }

    private var processPanel: some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 8) {
                Text("PROCESS AS")
                    .font(.system(size: 10.5, weight: .semibold))
                    .tracking(10.5 * 0.09)
                    .foregroundStyle(Theme.textTertiary)
                promptMenu
            }
            if let prompt = selectedPrompt {
                VStack(alignment: .leading, spacing: 8) {
                    Button {
                        withAnimation(reduceMotion ? nil : Theme.Motion.fade) { promptExpanded.toggle() }
                    } label: {
                        HStack(spacing: 6) {
                            Image(systemName: "chevron.right")
                                .font(.system(size: 9, weight: .bold))
                                .rotationEffect(.degrees(promptExpanded ? 90 : 0))
                            Text("Prompt preview")
                                .font(.system(size: 12, weight: .semibold))
                        }
                        .foregroundStyle(Theme.textTertiary)
                        .contentShape(Rectangle())
                    }
                    .buttonStyle(.plain)
                    .accessibilityValue(promptExpanded ? "Expanded" : "Collapsed")
                    if promptExpanded {
                        Text(prompt.value)
                            .font(.system(size: 12.5))
                            .lineSpacing(5)
                            .foregroundStyle(Theme.textSecondary)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .textSelection(.enabled)
                    }
                }
            }
            HStack(spacing: 10) {
                Button {
                    if let prompt = selectedPrompt { session.reprocessTakes(masterPrompt: prompt.value) }
                } label: {
                    Text("Process Takes").frame(maxWidth: .infinity)
                }
                .buttonStyle(AccentButtonStyle(height: 38, fontSize: 13.5))
                .dimWhenDisabled()
                .disabled(session.readyTranscripts.isEmpty || isBusy || selectedPrompt == nil)

                Button {
                    session.combineTakesIntoResult()
                } label: {
                    Text("Combine Takes").frame(maxWidth: .infinity)
                }
                .buttonStyle(OutlineButtonStyle(height: 38, fill: Theme.bgFieldOnPanel))
                .dimWhenDisabled()
                .disabled(session.combinableTranscripts.isEmpty || isBusy)
                .help("Copy all take transcripts into Result as-is, without AI processing")
            }
        }
        .padding(EdgeInsets(top: 20, leading: 22, bottom: 22, trailing: 22))
        .background(RoundedRectangle(cornerRadius: Theme.Radius.panel).fill(Theme.bgPanel))
    }

    private var promptMenu: some View {
        Menu {
            ForEach(voicePhrases) { phrase in
                Button(phrase.title) { session.selectedProcessID = phrase.id }
            }
        } label: {
            HStack {
                Text(selectedPrompt?.title ?? "Choose prompt")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(Theme.textPrimary)
                Spacer()
                Image(systemName: "chevron.up.chevron.down")
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundStyle(Theme.textTertiary)
            }
            .padding(.horizontal, 14)
            .frame(maxWidth: .infinity)
            .frame(height: 40)
            .background(RoundedRectangle(cornerRadius: Theme.Radius.control).fill(Theme.bgFieldOnPanel))
            .overlay(RoundedRectangle(cornerRadius: Theme.Radius.control).strokeBorder(Theme.borderField, lineWidth: 1))
            .contentShape(RoundedRectangle(cornerRadius: Theme.Radius.control))
        }
        .menuStyle(.button)
        .buttonStyle(.plain)
        .menuIndicator(.hidden)
        .disabled(isBusy)
        .accessibilityLabel("Process as")
    }

    private var resultSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeader("Result", trailing: resultReadout)
            VStack(spacing: 0) {
                resultBody
                resultFooter
            }
            .background(RoundedRectangle(cornerRadius: Theme.Radius.tile).fill(Theme.bgTile))
            .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.tile))
            .overlay(RoundedRectangle(cornerRadius: Theme.Radius.tile).strokeBorder(Theme.borderTile, lineWidth: 1))
        }
    }

    private var resultReadout: String? {
        guard let synth = session.synthesisTokenUsage, !session.isRecording else { return nil }
        return "\(synth.totalTokens.formatted()) tokens · \(TokenUsage.formatCost(synth.estimatedCost))"
    }

    private var resultBody: some View {
        ZStack(alignment: .topLeading) {
            AutoHeightTextView(
                text: $session.resultText,
                font: .monospacedSystemFont(ofSize: 12.5, weight: .regular),
                lineSpacing: 6,
                textColor: Theme.textPrimary,
                caretColor: Theme.hl,
                selectionColor: Theme.hlSelection,
                accessibilityLabel: "Result"
            )
            if session.resultText.isEmpty {
                Text("Result will appear here after processing, or type and edit directly…")
                    .font(.system(size: 14))
                    .foregroundStyle(Theme.textTertiary)
                    .allowsHitTesting(false)
            }
        }
        .padding(EdgeInsets(top: 22, leading: 24, bottom: 24, trailing: 24))
        .frame(maxWidth: .infinity, minHeight: 150, alignment: .topLeading)
    }

    private var resultFooter: some View {
        HStack(spacing: 8) {
            if !session.resultText.isEmpty {
                Button("Clear") { session.resultText = "" }
                    .buttonStyle(.plain)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(Theme.textSecondary)
            }
            Spacer()
            Button("Refine Result") {
                if let prompt = selectedPrompt { session.refineCurrentResult(masterPrompt: prompt.value) }
            }
            .buttonStyle(OutlineButtonStyle(height: 34, fill: Theme.bgButton))
            .dimWhenDisabled()
            .disabled(resultIsEmpty || isBusy || selectedPrompt == nil)

            Button { session.copyResult() } label: {
                Label("Copy", systemImage: "doc.on.doc")
            }
            .buttonStyle(AccentButtonStyle(height: 34, fontSize: 13))
            .dimWhenDisabled()
            .disabled(resultIsEmpty)
        }
        .padding(EdgeInsets(top: 12, leading: 12, bottom: 12, trailing: 14))
        .frame(maxWidth: .infinity)
        .background(Theme.bgSheetFooter)
        .overlay(alignment: .top) { Rectangle().fill(Theme.rule).frame(height: 1) }
    }

    // MARK: - Record dock

    private var dock: some View {
        let shadows = Theme.dockShadow(scheme: scheme)
        return HStack(spacing: 18) {
            if session.isRecording {
                Button { session.toggleRecording() } label: {
                    HStack(spacing: 8) {
                        RoundedRectangle(cornerRadius: 3).fill(Theme.onRec).frame(width: 12, height: 12)
                        Text("Stop")
                    }
                    .frame(width: 96)
                }
                .buttonStyle(AccentButtonStyle(height: 44, fontSize: 15, fill: Theme.rec, ink: Theme.onRec))
                .keyboardShortcut(.defaultAction)
                HStack(spacing: 8) {
                    Circle().fill(Theme.rec).frame(width: 8, height: 8)
                    Text(formatDuration(session.recordingElapsed))
                        .font(.system(size: 17, weight: .medium))
                        .monospacedDigit()
                        .foregroundStyle(Theme.textPrimary)
                }
                .accessibilityElement(children: .combine)
                .accessibilityLabel("Recording, \(formatDuration(session.recordingElapsed))")
            } else {
                Button { session.toggleRecording() } label: {
                    HStack(spacing: 8) {
                        Image(systemName: "mic.fill").font(.system(size: 18))
                        Text("Record")
                    }
                    .frame(width: 112)
                }
                .buttonStyle(AccentButtonStyle(height: 44, fontSize: 15))
                .keyboardShortcut(.defaultAction)
                .dimWhenDisabled()
                .disabled(session.isWorking)
                if session.isWorking {
                    HStack(spacing: 8) {
                        ProgressView().controlSize(.small)
                        Text("Working…")
                    }
                    .font(.system(size: 13))
                    .foregroundStyle(Theme.textSecondary)
                } else {
                    Text(dockStatus)
                        .font(.system(size: 13))
                        .monospacedDigit()
                        .foregroundStyle(Theme.textSecondary)
                }
            }
        }
        .padding(EdgeInsets(top: 8, leading: 8, bottom: 8, trailing: 20))
        .background(RoundedRectangle(cornerRadius: 16).fill(Theme.bgTile))
        .overlay(RoundedRectangle(cornerRadius: 16).strokeBorder(Theme.borderTile, lineWidth: 1))
        .shadow(color: shadows[0].color, radius: shadows[0].radius, y: shadows[0].y)
        .shadow(color: shadows.count > 1 ? shadows[1].color : .clear, radius: shadows.count > 1 ? shadows[1].radius : 0, y: shadows.count > 1 ? shadows[1].y : 0)
    }

    private var dockStatus: String {
        guard !session.takes.isEmpty else { return "Ready" }
        let total = session.takes.compactMap(\.duration).reduce(0, +)
        return "\(session.takes.count) take\(session.takes.count == 1 ? "" : "s") · \(formatDuration(total))"
    }

    private func formatDuration(_ duration: TimeInterval) -> String {
        let totalSeconds = max(0, Int(duration.rounded(.down)))
        return String(format: "%02d:%02d", totalSeconds / 60, totalSeconds % 60)
    }

    private func nsSerif(_ size: CGFloat) -> NSFont {
        if ThemeFont.hasNewsreader, let font = NSFont(name: "Newsreader", size: size) { return font }
        let base = NSFont.systemFont(ofSize: size)
        if let descriptor = base.fontDescriptor.withDesign(.serif), let font = NSFont(descriptor: descriptor, size: size) {
            return font
        }
        return base
    }
}

// MARK: - Disabled dimming

private struct DimWhenDisabled: ViewModifier {
    @Environment(\.isEnabled) private var isEnabled

    func body(content: Content) -> some View {
        content.opacity(isEnabled ? 1 : 0.4)
    }
}

private extension View {
    /// Handoff §5.8: disabled controls sit at 40% opacity.
    func dimWhenDisabled() -> some View { modifier(DimWhenDisabled()) }
}

// MARK: - Auto-height text

/// Editable text that sizes to its content with no inner scroll, so the page
/// stays the only scroll region. Wheel events pass up to the page scroll view.
struct AutoHeightTextView: NSViewRepresentable {
    @Binding var text: String
    var font: NSFont
    var lineSpacing: CGFloat
    var textColor: Color
    var caretColor: Color
    var selectionColor: Color
    var accessibilityLabel: String
    var onFocusChange: (Bool) -> Void = { _ in }

    func makeCoordinator() -> Coordinator { Coordinator(self) }

    /// Shared factory so the sizing flags are testable without a SwiftUI context.
    static func baseTextView(font: NSFont, label: String) -> FocusReportingTextView {
        let view = FocusReportingTextView(frame: .zero)
        view.font = font
        view.drawsBackground = false
        view.isRichText = false
        view.allowsUndo = true
        view.isHorizontallyResizable = false
        // Vertical growth is required: with `isVerticallyResizable == false`
        // the container tracks the view's current (too-short) frame during
        // measurement and the last line renders clipped behind the card edge.
        view.isVerticallyResizable = true
        view.autoresizingMask = [.width]
        view.maxSize = NSSize(width: CGFloat.greatestFiniteMagnitude, height: CGFloat.greatestFiniteMagnitude)
        view.textContainerInset = .zero
        view.textContainer?.lineFragmentPadding = 0
        view.textContainer?.widthTracksTextView = true
        view.textContainer?.heightTracksTextView = false
        view.setAccessibilityLabel(label)
        return view
    }

    /// Full-content height for `width`, or nil when the width is unresolved.
    static func fittingHeight(textView: NSTextView, width: CGFloat) -> CGFloat? {
        guard width > 0, width.isFinite,
              let container = textView.textContainer, let layout = textView.layoutManager else { return nil }
        // The container tracks the view size, so stage the proposal width on
        // the view first; otherwise a zero/stale frame corrupts the measurement
        // (a zero frame measured a paragraph as one line — the clipped take).
        var frame = textView.frame
        frame.size.width = width
        textView.frame = frame
        container.containerSize = NSSize(width: width, height: .greatestFiniteMagnitude)
        layout.ensureLayout(for: container)
        let height = ceil(layout.usedRect(for: container).height)
        guard let font = textView.font else { return height }
        return max(height, ceil(font.pointSize * 1.4))
    }

    func makeNSView(context: Context) -> NSTextView {
        let view = Self.baseTextView(font: font, label: accessibilityLabel)
        view.onFocusChange = { [weak coordinator = context.coordinator] focused in
            coordinator?.parent.onFocusChange(focused)
        }
        view.delegate = context.coordinator
        return view
    }

    func updateNSView(_ view: NSTextView, context: Context) {
        context.coordinator.parent = self
        let env = context.environment
        let style = NSMutableParagraphStyle()
        style.lineSpacing = lineSpacing
        let color = textColor.nsColor(env)
        let attributes: [NSAttributedString.Key: Any] = [
            .font: font, .foregroundColor: color, .paragraphStyle: style
        ]
        if view.font != font { view.font = font }
        if view.string != text { view.string = text }
        view.textStorage?.setAttributes(attributes, range: NSRange(location: 0, length: view.string.utf16.count))
        view.typingAttributes = attributes
        view.insertionPointColor = caretColor.nsColor(env)
        view.selectedTextAttributes = [.backgroundColor: selectionColor.nsColor(env)]
    }

    func sizeThatFits(_ proposal: ProposedViewSize, nsView: NSTextView, context: Context) -> CGSize? {
        guard let width = proposal.width,
              let height = Self.fittingHeight(textView: nsView, width: width) else { return nil }
        return CGSize(width: width, height: height)
    }

    final class Coordinator: NSObject, NSTextViewDelegate {
        var parent: AutoHeightTextView

        init(_ parent: AutoHeightTextView) { self.parent = parent }

        func textDidChange(_ notification: Notification) {
            guard let view = notification.object as? NSTextView else { return }
            parent.text = view.string
            view.invalidateIntrinsicContentSize()
        }
    }
}

final class FocusReportingTextView: NSTextView {
    var onFocusChange: ((Bool) -> Void)?

    override func becomeFirstResponder() -> Bool {
        let accepted = super.becomeFirstResponder()
        if accepted { onFocusChange?(true) }
        return accepted
    }

    override func resignFirstResponder() -> Bool {
        let resigned = super.resignFirstResponder()
        if resigned { onFocusChange?(false) }
        return resigned
    }
}

private extension Color {
    /// Resolves a dynamic theme color for the current appearance.
    func nsColor(_ environment: EnvironmentValues) -> NSColor {
        let r = resolve(in: environment)
        return NSColor(srgbRed: CGFloat(r.red), green: CGFloat(r.green), blue: CGFloat(r.blue), alpha: CGFloat(r.opacity))
    }
}
