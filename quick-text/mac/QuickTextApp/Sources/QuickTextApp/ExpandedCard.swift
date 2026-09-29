import SwiftUI

enum QuickTextMotion {
    static let microDuration: Double = 0.14
    static let selectionDuration: Double = 0.12
    static let standardDuration: Double = 0.22
    static let panelDuration: Double = 0.30

    static let micro = Animation.easeOut(duration: microDuration)
    static let selection = Animation.easeOut(duration: selectionDuration)
    static let standard = Animation.easeInOut(duration: standardDuration)
    static let panel = Animation.easeInOut(duration: panelDuration)
}

struct CardTextUnit {
    let characterCount: Int
    let isChip: Bool
    let isWhitespace: Bool
}

/// Hosts the open card: a scrim with backdrop blur, then the sheet, centered,
/// 112 pt from the top and at most 820 pt wide. The scrim fades; the sheet
/// scales from 0.96 and fades (cross-fade only under Reduce Motion).
struct ExpandedOverlayView: View {
    @ObservedObject var store: CorpusStore
    var onDelete: (Phrase) -> Void = { _ in }
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    /// A double-click that opens the card would otherwise land its second click
    /// on the fresh scrim and close it again.
    @State private var openedAt = Date.distantPast

    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .top) {
                if let phrase = store.expandedPhrase {
                    Theme.scrim
                        .background(.ultraThinMaterial)
                        .contentShape(Rectangle())
                        .onTapGesture {
                            guard Date().timeIntervalSince(openedAt) > 0.4 else { return }
                            store.collapseExpanded()
                        }
                        .accessibilityHidden(true)
                        .transition(.opacity)

                    ExpandedCardView(
                        phrase: phrase,
                        categoryName: store.categoryName(for: phrase.categoryId),
                        dotColor: store.dotColor(for: phrase.categoryId),
                        libraryVariables: store.libraryVariables,
                        expandedChipDisplay: store.corpus.settings.expandedChipDisplay ?? Settings.defaultExpandedChipDisplay,
                        maxBodyHeight: max(geometry.size.height - 300, 160),
                        onCopyAtom: { atom in store.copyAtom(atom, in: phrase) },
                        onCopySelection: { atoms in store.copyAtomSelection(atoms, in: phrase) },
                        onCopyFull: { text, close in store.copyFullFromExpandedCard(text, phraseID: phrase.id, closeImmediately: close) },
                        onClose: { store.collapseExpanded() },
                        onEdit: { store.beginEditing(phrase) },
                        onToggleFavorite: { store.toggleFavorite(phrase) },
                        onDuplicate: { store.duplicate(phrase) },
                        onDelete: {
                            store.collapseExpanded()
                            onDelete(phrase)
                        }
                    )
                    // Resets fill-in state when the open phrase changes.
                    .id(phrase.id)
                    .frame(width: min(820, max(geometry.size.width - 32, 320)))
                    .padding(.top, 112)
                    .transition(reduceMotion ? .opacity : .scale(scale: 0.96).combined(with: .opacity))
                    .zIndex(1)
                }
            }
            .frame(width: geometry.size.width, height: geometry.size.height, alignment: .top)
        }
        .animation(reduceMotion ? Theme.Motion.fade : Theme.Motion.sheet, value: store.expandedPhraseID)
        .allowsHitTesting(store.expandedPhraseID != nil)
        .onChange(of: store.expandedPhraseID) { _, id in
            if id != nil { openedAt = Date() }
        }
    }
}

/// The open card. Header (collection, favorite, edit, more, close); the title
/// and a meta line; the full phrase value in the reading serif, with each
/// fill-in variable as an inline field; the Fill in panel (one input per
/// variable); and a footer with Copy (stays open) and Copy & Close (↩).
///
/// Atoms stay individually copyable: click copies that slice, Shift-click
/// multiselects (clipboard updated in document order), and arrow keys walk
/// them when no text field has focus.
struct ExpandedCardView: View {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.colorScheme) private var colorScheme
    let phrase: Phrase
    var categoryName: String = ""
    var dotColor: Color = Theme.textTertiary
    // Resolves `{{@name}}` references against the corpus-level library.
    var libraryVariables: [LibraryVariable] = []
    /// Global display-mode toggle (Settings > Behavior): when on, canned `"value"`-type
    /// library chips show their full value inline instead of the collapsed `name`.
    var expandedChipDisplay: Bool = false
    /// Preview-only seed values for showing a filled variable state without changing
    /// the runtime/session copy model.
    var initialVariableValues: [String: String] = [:]
    /// Cap for the scrolling body (window height minus the sheet's offsets and chrome).
    var maxBodyHeight: CGFloat = 640
    let onCopyAtom: (Atom) -> Void
    let onCopySelection: ([Atom]) -> Void
    /// Receives the phrase value with filled `{{...}}` variables substituted in,
    /// and whether to close the card right away.
    let onCopyFull: (String, Bool) -> Void
    let onClose: () -> Void
    var onEdit: (() -> Void)? = nil
    var onToggleFavorite: (() -> Void)? = nil
    var onDuplicate: (() -> Void)? = nil
    var onDelete: (() -> Void)? = nil

    @State private var hoveredAtomID: String?
    @State private var focusedAtomID: String?
    @State private var selectedAtomAnchorID: String?
    @State private var selectedAtomIDs: Set<String> = []
    @State private var singleCopiedAtomID: String?
    @State private var keyMonitor: Any?
    @State private var shiftReleaseMonitor: Any?
    @State private var variableValues: [String: String] = [:]
    /// The variable whose inline field shows the active underline and caret.
    @State private var activeVariableKey: String?
    @State private var bodyHeight: CGFloat = 240
    @FocusState private var focusedField: String?

    private static let bodySize: CGFloat = 23
    /// Half the extra leading of a 1.6 line height, applied above and below every
    /// run so wrapped lines and FlowLayout rows share one rhythm.
    private static let bodyLeading: CGFloat = 4.5

    private var hasAtoms: Bool { !(phrase.atoms ?? []).isEmpty }
    private var sortedAtoms: [Atom] { (phrase.atoms ?? []).sorted { $0.start < $1.start } }
    private var parsedVariables: [PhraseVariable] { PhraseVariable.parse(phrase.value, library: libraryVariables) }

    /// One entry per fill-in key, in first-occurrence order. Canned values fill
    /// themselves and unresolved references have nothing to fill.
    private var fillableVariables: [PhraseVariable] {
        var seen = Set<String>()
        return parsedVariables.filter { variable in
            guard !variable.isCannedValue, !variable.isUnresolved else { return false }
            return seen.insert(variable.key).inserted
        }
    }

    private var filledCount: Int {
        fillableVariables.filter { !(variableValues[$0.key] ?? "").isEmpty }.count
    }

    private var lines: [[LineSegment]] {
        LineSegment.lines(value: phrase.value, atoms: phrase.atoms ?? [], variables: parsedVariables)
    }

    /// Title line for the open card: the phrase title plus its Text Replacement
    /// shortcut when one is configured (e.g. "SUMMARY | xsum"). The shortcut keeps
    /// its exact typed case since that is what the user types.
    static func openCardTitle(for phrase: Phrase) -> String {
        let base = phrase.title.uppercased()
        guard let shortcut = textReplacementShortcut(for: phrase) else { return base }
        return base + " | " + shortcut
    }

    private static func textReplacementShortcut(for phrase: Phrase) -> String? {
        guard let shortcut = phrase.textReplacement?.shortcut.trimmingCharacters(in: .whitespacesAndNewlines),
              !shortcut.isEmpty else { return nil }
        return shortcut
    }

    /// e.g. "1 variable", "4 parts · xhoa", "12 words".
    private var metaLine: String {
        var parts: [String] = []
        let variableCount = fillableVariables.count
        if variableCount > 0 { parts.append(variableCount == 1 ? "1 variable" : "\(variableCount) variables") }
        let atomCount = phrase.atoms?.count ?? 0
        if atomCount > 0 { parts.append(atomCount == 1 ? "1 part" : "\(atomCount) parts") }
        if parts.isEmpty {
            let words = phrase.value.split(whereSeparator: \.isWhitespace).count
            parts.append(words == 1 ? "1 word" : "\(words) words")
        }
        if let shortcut = Self.textReplacementShortcut(for: phrase) { parts.append(shortcut) }
        return parts.joined(separator: " · ")
    }

    var body: some View {
        let shadow = Theme.sheetShadow(scheme: colorScheme)
        let shape = RoundedRectangle(cornerRadius: Theme.Radius.sheet)
        return VStack(spacing: 0) {
            header
            ScrollView {
                content
                    .onGeometryChange(for: CGFloat.self) { $0.size.height } action: { bodyHeight = $0 }
            }
            .scrollBounceBehavior(.basedOnSize)
            .frame(height: min(bodyHeight, maxBodyHeight))
            footer
        }
        .background(shape.fill(Theme.bgSheet))
        .clipShape(shape)
        .overlay(shape.strokeBorder(Theme.borderSheet, lineWidth: 1))
        .shadow(color: shadow.color, radius: shadow.radius, y: shadow.y)
        .accessibilityElement(children: .contain)
        .accessibilityAddTraits(.isModal)
        .accessibilityLabel(Text(phrase.title))
        .onChange(of: focusedField) { _, key in
            if let key { activeVariableKey = key }
        }
        .onAppear {
            if variableValues.isEmpty {
                variableValues = initialVariableValues
            }
            keyMonitor = NSEvent.addLocalMonitorForEvents(matching: .keyDown) { event in
                handleKeyEvent(event)
            }
            // Releasing shift drops the multiselect highlight immediately.
            shiftReleaseMonitor = NSEvent.addLocalMonitorForEvents(matching: .flagsChanged) { event in
                if !event.modifierFlags.contains(.shift) {
                    clearAtomSelection()
                }
                return event
            }
            if let first = fillableVariables.first {
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.05) { focus(first) }
            }
        }
        .onDisappear {
            if let keyMonitor {
                NSEvent.removeMonitor(keyMonitor)
                self.keyMonitor = nil
            }
            if let monitor = shiftReleaseMonitor {
                NSEvent.removeMonitor(monitor)
                shiftReleaseMonitor = nil
            }
        }
    }

    // MARK: - Header

    private var header: some View {
        HStack(spacing: 0) {
            HStack(spacing: 8) {
                Circle()
                    .fill(dotColor)
                    .frame(width: 7, height: 7)
                Text(categoryName.uppercased())
                    .font(ThemeFont.eyebrow())
                    .tracking(11 * 0.09)
                    .foregroundStyle(Theme.textTertiary)
                    .lineLimit(1)
            }
            Spacer(minLength: 12)
            HStack(spacing: 2) {
                if let onToggleFavorite {
                    Button(action: onToggleFavorite) {
                        Image(systemName: phrase.favorite ? "star.fill" : "star")
                            .font(.system(size: 15))
                            .foregroundStyle(phrase.favorite ? Theme.star : Theme.textSecondary)
                    }
                    .buttonStyle(IconButtonStyle(size: 44))
                    .accessibilityLabel(phrase.favorite ? "Remove from favorites" : "Add to favorites")
                }
                if let onEdit {
                    sheetIconButton("pencil", label: "Edit snippet", action: onEdit)
                        .help("Edit (⌘E)")
                }
                if onDuplicate != nil || onDelete != nil {
                    Menu {
                        Button("Copy Without Closing") { copyFull(close: false) }
                        if let onDuplicate {
                            Button("Duplicate", action: onDuplicate)
                        }
                        if let onDelete {
                            Divider()
                            Button("Delete…", role: .destructive, action: onDelete)
                        }
                    } label: {
                        Image(systemName: "ellipsis")
                            .font(.system(size: 15))
                            .foregroundStyle(Theme.textSecondary)
                            .frame(width: 44, height: 44)
                            .contentShape(Rectangle())
                    }
                    .menuStyle(.button)
                    .buttonStyle(.plain)
                    .menuIndicator(.hidden)
                    .fixedSize()
                    .accessibilityLabel("More actions")
                }
                Rectangle()
                    .fill(Theme.rule)
                    .frame(width: 1, height: 20)
                    .padding(.horizontal, 6)
                sheetIconButton("xmark", label: "Close", action: onClose)
            }
        }
        .padding(.top, 14)
        .padding(.trailing, 16)
        .padding(.leading, 40)
    }

    private func sheetIconButton(_ systemName: String, label: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: systemName)
                .font(.system(size: 15))
                .foregroundStyle(Theme.textSecondary)
        }
        .buttonStyle(IconButtonStyle(size: 44))
        .accessibilityLabel(label)
    }

    // MARK: - Body

    private var content: some View {
        VStack(alignment: .leading, spacing: 28) {
            VStack(alignment: .leading, spacing: 10) {
                Text(phrase.title)
                    .font(ThemeFont.serif(50))
                    .tracking(50 * -0.02)
                    .foregroundStyle(Theme.textPrimary)
                    .fixedSize(horizontal: false, vertical: true)
                    .textSelection(.enabled)
                    .accessibilityAddTraits(.isHeader)
                Text(metaLine)
                    .font(.system(size: 13))
                    .foregroundStyle(Theme.textTertiary)
            }
            Rectangle()
                .fill(Theme.rule)
                .frame(height: 1)
            linesBlock
            if !fillableVariables.isEmpty {
                fillInPanel
            }
        }
        .padding(.top, 18)
        .padding(.horizontal, 64)
        .padding(.bottom, 40)
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var linesBlock: some View {
        VStack(alignment: .leading, spacing: 0) {
            ForEach(Array(lines.enumerated()), id: \.offset) { _, line in
                if line.isEmpty {
                    Text(" ")
                        .font(ThemeFont.serif(Self.bodySize))
                        .padding(.vertical, Self.bodyLeading)
                } else {
                    FlowLayout(spacing: 0) {
                        ForEach(line) { segment in
                            segmentView(segment)
                        }
                    }
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    @ViewBuilder
    private func segmentView(_ segment: LineSegment) -> some View {
        if let atom = segment.atom {
            atomChip(segment, atom: atom)
        } else if let variable = segment.variable {
            if variable.isUnresolved {
                unresolvedChip(variable, segment: segment)
            } else if variable.isCannedValue {
                cannedChip(variable, segment: segment)
            } else {
                inlineField(variable, segment: segment)
            }
        } else {
            bodyText(segment.text)
                .textSelection(.enabled)
                .padding(.vertical, Self.bodyLeading)
                .layoutValue(
                    key: FlowLayoutWhitespaceKey.self,
                    value: segment.text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                )
        }
    }

    private func bodyText(_ text: String) -> some View {
        Text(text)
            .font(ThemeFont.serif(Self.bodySize))
            .lineSpacing(Self.bodyLeading * 2)
            .foregroundStyle(Theme.textPrimary)
    }

    /// Splits a chip segment into the chip's own text and the punctuation that
    /// `LineSegment.lines` attached after it so it never wraps alone.
    private func split(_ segment: LineSegment, length: Int) -> (chip: String, trailing: String) {
        let characters = Array(segment.text)
        let count = min(max(length, 0), characters.count)
        return (String(characters.prefix(count)), String(characters.dropFirst(count)))
    }

    private func atomChip(_ segment: LineSegment, atom: Atom) -> some View {
        let parts = split(segment, length: atom.end - atom.start)
        let isHighlighted = selectedAtomIDs.contains(atom.id) || hoveredAtomID == atom.id
            || singleCopiedAtomID == atom.id || focusedAtomID == atom.id
        return HStack(alignment: .firstTextBaseline, spacing: 0) {
            Button { handleAtomTap(atom) } label: {
                Text(parts.chip)
                    .font(ThemeFont.serif(Self.bodySize))
                    .foregroundStyle(isHighlighted ? Theme.hlInk : Theme.textPrimary)
                    .multilineTextAlignment(.leading)
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(.horizontal, 3)
                    .background(RoundedRectangle(cornerRadius: Theme.Radius.chip).fill(isHighlighted ? Theme.hlTint : Color.clear))
                    .overlay(alignment: .bottom) {
                        DottedRule()
                            .stroke(isHighlighted ? Theme.hl : Theme.textTertiary, style: StrokeStyle(lineWidth: 1, dash: [2, 3]))
                            .frame(height: 1)
                    }
                    .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .onHover { hovering in hoveredAtomID = hovering ? atom.id : nil }
            .help("Click to copy. Shift-click to select several.")
            .accessibilityLabel("Copy \(parts.chip)")
            if !parts.trailing.isEmpty {
                bodyText(parts.trailing)
            }
        }
        .padding(.vertical, Self.bodyLeading)
        .animation(reduceMotion ? nil : Theme.Motion.hover, value: isHighlighted)
    }

    /// An inline fill-in field: highlight tint, italic variable name until
    /// filled, then the value. The active field gets a 2 pt underline and caret.
    private func inlineField(_ variable: PhraseVariable, segment: LineSegment) -> some View {
        let parts = split(segment, length: variable.end - variable.start)
        let value = variableValues[variable.key] ?? ""
        let filled = !value.isEmpty
        let isActive = activeVariableKey == variable.key
        return HStack(alignment: .firstTextBaseline, spacing: 0) {
            HStack(alignment: .firstTextBaseline, spacing: 2) {
                Text(filled ? value : variable.displayLabel)
                    .font(ThemeFont.serif(Self.bodySize, italic: !filled))
                    .foregroundStyle(Theme.hlInk)
                    .multilineTextAlignment(.leading)
                    .fixedSize(horizontal: false, vertical: true)
                if isActive {
                    Rectangle()
                        .fill(Theme.hl)
                        .frame(width: 2, height: 24)
                        .alignmentGuide(.firstTextBaseline) { dimensions in dimensions.height - 5 }
                }
            }
            .padding(.horizontal, 8)
            .background(
                UnevenRoundedRectangle(topLeadingRadius: Theme.Radius.chip, topTrailingRadius: Theme.Radius.chip)
                    .fill(Theme.hlTint)
            )
            .overlay(alignment: .bottom) {
                Rectangle()
                    .fill(isActive ? Theme.hl : Color.clear)
                    .frame(height: 2)
            }
            .contentShape(Rectangle())
            .onTapGesture { focus(variable) }
            .accessibilityElement(children: .ignore)
            .accessibilityLabel("\(variable.displayLabel): \(filled ? value : "empty")")
            .accessibilityAddTraits(.isButton)
            if !parts.trailing.isEmpty {
                bodyText(parts.trailing)
            }
        }
        .padding(.vertical, Self.bodyLeading)
        .animation(reduceMotion ? nil : Theme.Motion.hover, value: isActive)
    }

    /// A resolved `"value"`-type library reference: fills itself. Collapsed shows
    /// `name`; Expanded display mode shows the full value. Hover shows the value.
    private func cannedChip(_ variable: PhraseVariable, segment: LineSegment) -> some View {
        let parts = split(segment, length: variable.end - variable.start)
        let label = expandedChipDisplay ? (variable.libraryValue ?? variable.displayLabel) : variable.displayLabel
        return HStack(alignment: .firstTextBaseline, spacing: 0) {
            Text(label)
                .font(expandedChipDisplay ? ThemeFont.serif(Self.bodySize) : ThemeFont.mono(13))
                .foregroundStyle(Theme.hlInk)
                .multilineTextAlignment(.leading)
                .fixedSize(horizontal: false, vertical: true)
                .padding(.horizontal, 6)
                .padding(.vertical, 1)
                .background(RoundedRectangle(cornerRadius: Theme.Radius.chip).fill(Theme.hlTint))
                .help(variable.libraryValue ?? "")
            if !parts.trailing.isEmpty {
                bodyText(parts.trailing)
            }
        }
        .padding(.vertical, Self.bodyLeading)
    }

    /// A dangling `{{@name}}` — renamed or deleted out of the library. Not
    /// fillable; copies through as the literal placeholder text.
    private func unresolvedChip(_ variable: PhraseVariable, segment: LineSegment) -> some View {
        let parts = split(segment, length: variable.end - variable.start)
        return HStack(alignment: .firstTextBaseline, spacing: 0) {
            Text(variable.displayLabel)
                .font(ThemeFont.mono(13))
                .foregroundStyle(Theme.error)
                .padding(.horizontal, 6)
                .padding(.vertical, 1)
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.Radius.chip)
                        .strokeBorder(Theme.error.opacity(0.6), style: StrokeStyle(lineWidth: 1, dash: [4, 3]))
                )
                .help("Unresolved variable reference — no library variable named \u{201C}\(variable.displayLabel)\u{201D} was found. Copies through as literal text.")
            if !parts.trailing.isEmpty {
                bodyText(parts.trailing)
            }
        }
        .padding(.vertical, Self.bodyLeading)
    }

    // MARK: - Fill in

    private var fillInPanel: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Text("FILL IN")
                    .font(ThemeFont.eyebrow())
                    .tracking(11 * 0.09)
                    .foregroundStyle(Theme.textTertiary)
                Spacer()
                Text("\(filledCount) of \(fillableVariables.count)")
                    .font(.system(size: 12))
                    .monospacedDigit()
                    .foregroundStyle(Theme.textTertiary)
            }
            ForEach(fillableVariables) { variable in
                VStack(alignment: .leading, spacing: 8) {
                    Text("{\(variable.displayLabel)}")
                        .font(ThemeFont.mono(12))
                        .foregroundStyle(Theme.hlInk)
                        .accessibilityHidden(true)
                    if let choices = variable.choices {
                        choiceRow(variable, choices: choices)
                    } else {
                        textInput(variable)
                    }
                }
            }
        }
        .padding(.top, 22)
        .padding(.horizontal, 24)
        .padding(.bottom, 24)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(RoundedRectangle(cornerRadius: Theme.Radius.panel).fill(Theme.bgPanel))
    }

    private func textInput(_ variable: PhraseVariable) -> some View {
        let isFocused = focusedField == variable.key
        return TextField(variable.displayLabel, text: binding(for: variable.key), prompt: Text(variable.displayLabel))
            .textFieldStyle(.plain)
            .font(.system(size: 15))
            .foregroundStyle(Theme.textPrimary)
            .focused($focusedField, equals: variable.key)
            .focusEffectDisabled()
            .padding(.horizontal, 14)
            .frame(height: 46)
            .background(RoundedRectangle(cornerRadius: Theme.Radius.control).fill(Theme.bgSheet))
            .overlay(RoundedRectangle(cornerRadius: Theme.Radius.control).strokeBorder(isFocused ? Theme.hl : Theme.borderField, lineWidth: 1))
            .focusRing(isFocused, width: 4)
            .animation(reduceMotion ? nil : Theme.Motion.hover, value: isFocused)
    }

    /// `{{a/b}}` and choice-type library variables: one button per option. When
    /// the group is active, ←/→ step through the options.
    private func choiceRow(_ variable: PhraseVariable, choices: [String]) -> some View {
        let isActive = activeVariableKey == variable.key
        return FlowLayout(spacing: 8) {
            ForEach(choices, id: \.self) { choice in
                let isOn = variableValues[variable.key] == choice
                Button {
                    variableValues[variable.key] = choice
                    activeVariableKey = variable.key
                    focusedField = nil
                } label: {
                    Text(choice)
                        .font(.system(size: 14))
                        .foregroundStyle(isOn ? Theme.hlInk : Theme.textPrimary)
                        .padding(.horizontal, 14)
                        .frame(height: 36)
                        .background(RoundedRectangle(cornerRadius: Theme.Radius.control).fill(isOn ? Theme.hlTint : Theme.bgSheet))
                        .overlay(RoundedRectangle(cornerRadius: Theme.Radius.control).strokeBorder(isOn ? Theme.hl : Theme.borderField, lineWidth: 1))
                        .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .accessibilityAddTraits(isOn ? .isSelected : [])
            }
        }
        .padding(4)
        .focusRing(isActive, cornerRadius: Theme.Radius.control + 4)
        .accessibilityElement(children: .contain)
        .accessibilityLabel(variable.displayLabel)
    }

    private func binding(for key: String) -> Binding<String> {
        Binding(
            get: { variableValues[key] ?? "" },
            set: { variableValues[key] = $0.isEmpty ? nil : $0 }
        )
    }

    private func focus(_ variable: PhraseVariable) {
        activeVariableKey = variable.key
        focusedField = variable.choices == nil ? variable.key : nil
    }

    private func moveActiveVariable(_ delta: Int) {
        let variables = fillableVariables
        guard !variables.isEmpty else { return }
        let current = activeVariableKey.flatMap { key in variables.firstIndex { $0.key == key } }
        let next: Int
        if let current {
            next = (current + delta + variables.count) % variables.count
        } else {
            next = delta > 0 ? 0 : variables.count - 1
        }
        focus(variables[next])
    }

    private func stepChoice(_ variable: PhraseVariable, choices: [String], delta: Int) {
        let current = variableValues[variable.key].flatMap { choices.firstIndex(of: $0) }
        let next = current.map { min(max($0 + delta, 0), choices.count - 1) } ?? (delta > 0 ? 0 : choices.count - 1)
        variableValues[variable.key] = choices[next]
    }

    // MARK: - Footer

    private var footer: some View {
        HStack(spacing: 10) {
            HStack(spacing: 18) {
                if !fillableVariables.isEmpty {
                    keyHint("Tab", "Next field")
                }
                keyHint("Esc", "Close")
            }
            .font(.system(size: 12))
            .foregroundStyle(Theme.textTertiary)
            .accessibilityHidden(true)

            Spacer(minLength: 12)

            Button { copyFull(close: false) } label: {
                HStack(spacing: 7) {
                    Image(systemName: "doc.on.doc")
                        .font(.system(size: 12, weight: .medium))
                    Text("Copy")
                }
            }
            .buttonStyle(OutlineButtonStyle())
            .accessibilityHint("Copies and keeps the snippet open")

            Button { copyFull(close: true) } label: {
                HStack(spacing: 10) {
                    Text("Copy & Close")
                    KeyCap(text: "↩", onAccent: true)
                }
            }
            .buttonStyle(AccentButtonStyle(height: 40))
        }
        .padding(.vertical, 16)
        .padding(.leading, 40)
        .padding(.trailing, 20)
        .background(Theme.bgSheetFooter)
        .overlay(alignment: .top) {
            Rectangle().fill(Theme.rule).frame(height: 1)
        }
    }

    private func keyHint(_ key: String, _ label: String) -> some View {
        HStack(spacing: 6) {
            KeyCap(text: key)
            Text(label)
        }
    }

    // MARK: - Keyboard

    private func handleKeyEvent(_ event: NSEvent) -> NSEvent? {
        // The phrase editor opens as a sheet window over this card; leave its keys alone.
        guard NSApp.keyWindow?.sheetParent == nil else { return event }
        if event.keyCode == 53 {
            onClose()
            return nil
        }
        guard event.modifierFlags.intersection([.command, .option, .control]).isEmpty else { return event }
        let editingText = NSApp.keyWindow?.firstResponder is NSTextView
        switch event.keyCode {
        case 48: // Tab — next/previous variable, including choice groups
            guard !fillableVariables.isEmpty else { return event }
            moveActiveVariable(event.modifierFlags.contains(.shift) ? -1 : 1)
            return nil
        case 36, 76: // Return
            if editingText && focusedField == nil { return event }
            copySelectedAtomsOrFull()
            return nil
        case 123, 124: // Left / Right
            guard !editingText else { return event }
            let delta = event.keyCode == 123 ? -1 : 1
            if let key = activeVariableKey,
               let variable = fillableVariables.first(where: { $0.key == key }),
               let choices = variable.choices {
                stepChoice(variable, choices: choices, delta: delta)
                return nil
            }
            guard hasAtoms else { return event }
            moveAtomSelection(delta: delta, extending: event.modifierFlags.contains(.shift))
            return nil
        case 125, 126: // Down / Up
            guard !editingText, hasAtoms else { return event }
            moveAtomSelection(delta: event.keyCode == 126 ? -1 : 1, extending: event.modifierFlags.contains(.shift))
            return nil
        default:
            return event
        }
    }

    // MARK: - Atoms and copying

    private func handleAtomTap(_ atom: Atom) {
        if NSEvent.modifierFlags.contains(.shift) {
            if selectedAtomIDs.contains(atom.id) {
                selectedAtomIDs.remove(atom.id)
            } else {
                selectedAtomIDs.insert(atom.id)
            }
            focusedAtomID = atom.id
            selectedAtomAnchorID = selectedAtomAnchorID ?? atom.id
            let selected = (phrase.atoms ?? []).filter { selectedAtomIDs.contains($0.id) }
            guard !selected.isEmpty else { return }
            onCopySelection(selected)
        } else {
            clearAtomSelection()
            flashSingleCopiedAtom(atom.id)
            onCopyAtom(atom)
        }
    }

    private func moveAtomSelection(delta: Int, extending: Bool) {
        let atoms = sortedAtoms
        guard !atoms.isEmpty else { return }
        let currentIndex = focusedAtomID.flatMap { id in atoms.firstIndex { $0.id == id } }
        let nextIndex: Int
        if let currentIndex {
            nextIndex = min(max(currentIndex + delta, 0), atoms.count - 1)
        } else {
            nextIndex = delta < 0 ? atoms.count - 1 : 0
        }
        let nextAtom = atoms[nextIndex]
        focusedAtomID = nextAtom.id
        singleCopiedAtomID = nil

        if extending {
            let anchorID = selectedAtomAnchorID ?? selectedAtomIDs.first ?? atoms[currentIndex ?? nextIndex].id
            selectedAtomAnchorID = anchorID
            guard let anchorIndex = atoms.firstIndex(where: { $0.id == anchorID }) else {
                selectedAtomIDs = [nextAtom.id]
                return
            }
            let range = min(anchorIndex, nextIndex)...max(anchorIndex, nextIndex)
            selectedAtomIDs = Set(atoms[range].map(\.id))
        } else {
            selectedAtomAnchorID = nextAtom.id
            selectedAtomIDs = [nextAtom.id]
        }
    }

    private func copySelectedAtomsOrFull() {
        let selected = sortedAtoms.filter { selectedAtomIDs.contains($0.id) }
        if selected.isEmpty {
            copyFull(close: true)
        } else if selected.count == 1, let atom = selected.first {
            flashSingleCopiedAtom(atom.id)
            onCopyAtom(atom)
        } else {
            onCopySelection(selected)
        }
    }

    private func clearAtomSelection() {
        focusedAtomID = nil
        selectedAtomAnchorID = nil
        selectedAtomIDs = []
    }

    /// Single-atom copy highlight pops and fades back on its own.
    private func flashSingleCopiedAtom(_ id: String) {
        withAnimation(reduceMotion ? nil : QuickTextMotion.micro) { singleCopiedAtomID = id }
        DispatchQueue.main.asyncAfter(deadline: .now() + CorpusStore.copyFeedbackDuration) {
            guard singleCopiedAtomID == id else { return }
            withAnimation(reduceMotion ? nil : QuickTextMotion.standard) { singleCopiedAtomID = nil }
        }
    }

    /// Canned `"value"`-type library entries are never stored in `variableValues`
    /// (there's nothing to fill in), so they're merged in at copy time.
    private var valuesForSubstitution: [String: String] {
        var values = variableValues
        for variable in parsedVariables where variable.isCannedValue {
            values[variable.key] = variable.libraryValue
        }
        return values
    }

    private func copyFull(close: Bool) {
        onCopyFull(PhraseVariable.substitute(phrase.value, values: valuesForSubstitution), close)
    }
}

private struct DottedRule: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(to: CGPoint(x: rect.minX, y: rect.midY))
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.midY))
        return path
    }
}

/// Shared card and tile type metrics derive from the user's base font-size setting.
/// Expanded-card body text is intentionally scaled from the same base size used by
/// the browsing surface so the two surfaces feel like one system.
struct CardTypography {
    let baseSize: CGFloat
    let family: String

    var isSerif: Bool { family == "serif" }
    var availableWidth: CGFloat = 0
    var availableHeight: CGFloat = 0
    var contentCharacterCount: Int = 0
    var contentLines: [[CardTextUnit]] = []

    var bodySize: CGFloat {
        let preferredSize = baseSize * (isSerif ? 5.0 : 4.6)
        guard availableWidth > 0 else { return preferredSize }
        // A conservative average glyph width keeps at least 16 ordinary body
        // characters on one line while preserving the largest possible hero type.
        let sixteenCharacterLimit = availableWidth / (16 * 0.62)
        let maximumSize = min(preferredSize, sixteenCharacterLimit)
        guard availableHeight > 0, contentCharacterCount > 0 else { return maximumSize }

        // Choose the largest type size whose rendered-unit estimate fits. Atom and
        // variable chips occupy substantially less width/height than body text, so
        // sizing from raw character count would undersize chip-heavy cards.
        var candidate = maximumSize
        while candidate > 10 {
            let estimatedHeight = estimatedContentHeight(for: candidate)
            if estimatedHeight <= availableHeight {
                return candidate
            }
            candidate -= 1
        }
        return 10
    }

    private func estimatedContentHeight(for bodySize: CGFloat) -> CGFloat {
        guard !contentLines.isEmpty else {
            let averageGlyphWidth: CGFloat = isSerif ? 0.55 : 0.60
            let lineHeightMultiplier: CGFloat = isSerif ? 1.10 : 1.14
            let charactersPerLine = max(Int(availableWidth / (bodySize * averageGlyphWidth)), 1)
            let lineCount = CGFloat((contentCharacterCount + charactersPerLine - 1) / charactersPerLine)
            return lineCount * bodySize * lineHeightMultiplier
                + max(lineCount - 1, 0) * bodySize * 0.08
        }

        let bodyLineHeight = bodySize * (isSerif ? 1.10 : 1.14)
        let chipLineHeight = bodySize * 0.46 * 1.04 + max(2, bodySize * 0.46 * 0.06) * 2
        let bodyGlyphWidth = bodySize * (isSerif ? 0.55 : 0.60)
        let chipGlyphWidth = bodySize * 0.46 * 0.60
        var total: CGFloat = 0

        for (lineIndex, line) in contentLines.enumerated() {
            var rowWidth: CGFloat = 0
            var rowHeight: CGFloat = 0
            var rowCount = 0

            func flushRow() {
                guard rowWidth > 0 else { return }
                total += rowHeight
                rowCount += 1
                rowWidth = 0
                rowHeight = 0
            }

            for unit in line {
                let glyphWidth = unit.isChip ? chipGlyphWidth : bodyGlyphWidth
                let unitWidth = CGFloat(max(unit.characterCount, 1)) * glyphWidth
                let unitHeight = unit.isChip ? chipLineHeight : bodyLineHeight
                if unit.isWhitespace {
                    // Spaces are only a small separator and can disappear at a wrap.
                    if rowWidth + unitWidth <= availableWidth { rowWidth += unitWidth }
                    continue
                }
                if unitWidth > availableWidth {
                    flushRow()
                    let wrappedRows = max(Int(ceil(unitWidth / availableWidth)), 1)
                    total += CGFloat(wrappedRows) * unitHeight
                    rowCount += wrappedRows
                } else if rowWidth > 0 && rowWidth + unitWidth > availableWidth {
                    flushRow()
                    rowWidth = unitWidth
                    rowHeight = unitHeight
                } else {
                    rowWidth += unitWidth
                    rowHeight = max(rowHeight, unitHeight)
                }
            }
            flushRow()
            if lineIndex < contentLines.count - 1 && rowCount > 0 {
                total += bodySize * 0.06
            }
        }
        return total
    }
    var bodyLineHeight: CGFloat { bodySize * (isSerif ? 1.08 : 1.12) }
    var chipSize: CGFloat { bodySize * 0.46 }
    var chipLineHeight: CGFloat { chipSize * 1.04 }
    var chipHorizontalPadding: CGFloat { max(7, chipSize * 0.34) }
    var chipVerticalPadding: CGFloat { max(2, chipSize * 0.06) }
    var chipMinHeight: CGFloat { chipLineHeight + (chipVerticalPadding * 2) }
    var chipCornerRadius: CGFloat { min(10, chipMinHeight * 0.22) }
    var titleSize: CGFloat { max(13, baseSize * 0.84) }
    var titleTracking: CGFloat { titleSize * 0.22 }
    var titleToBodySpacing: CGFloat { max(24, bodySize * 0.42) }
    var lineSpacing: CGFloat { bodyLineHeight * 0.06 }

    var bodyFont: Font { font(bodySize, weight: .regular) }
    var chipFont: Font { .system(size: chipSize, weight: .regular, design: .monospaced) }
    var titleFont: Font { font(titleSize, weight: .regular) }
    var tileFont: Font { font(baseSize, weight: .semibold) }
    var utilityFont: Font { .system(size: max(15, baseSize), weight: .regular) }
    var utilityButtonFont: Font { .system(size: max(13, baseSize * 0.82), weight: .regular, design: .monospaced) }

    private func font(_ size: CGFloat, weight: Font.Weight) -> Font {
        if isSerif {
            return .custom("Palatino", size: size).weight(weight)
        }
        return .system(size: size, weight: weight)
    }

}

struct LineSegment: Identifiable {
    let id: String
    let text: String
    let atom: Atom?
    let variable: PhraseVariable?

    var isChip: Bool { atom != nil || variable != nil }

    /// Merges atom ranges and detected `{{...}}` variable ranges (both character-indexed,
    /// see `PhraseVariable`/`Atom`) into a single ordered run of chip/plain-text segments.
    /// A variable range that overlaps an already-placed atom is dropped rather than
    /// double-rendered; atoms are user-curated so they take priority.
    static func lines(value: String, atoms: [Atom], variables: [PhraseVariable]) -> [[LineSegment]] {
        let characters = Array(value)
        struct ChipRange { let start: Int; let end: Int; let atom: Atom?; let variable: PhraseVariable? }
        let ranges = (
            atoms
                .filter { $0.start >= 0 && $0.end > $0.start && $0.end <= characters.count }
                .map { ChipRange(start: $0.start, end: $0.end, atom: $0, variable: nil) }
            + variables
                .filter { $0.start >= 0 && $0.end > $0.start && $0.end <= characters.count }
                .map { ChipRange(start: $0.start, end: $0.end, atom: nil, variable: $0) }
        ).sorted { $0.start < $1.start }

        var flat: [LineSegment] = []
        var cursor = 0
        var counter = 0
        func nextID() -> String { counter += 1; return "seg-\(counter)" }

        func appendPlainText(_ value: String) {
            guard !value.isEmpty else { return }
            var remaining = value

            // Keep punctuation visually attached to the preceding token so a
            // period or comma never opens a wrapped line by itself.
            if let last = flat.last, last.isChip,
               let first = remaining.first,
               ".,;:!?)]}".contains(first) {
                flat[flat.count - 1] = LineSegment(
                    id: last.id,
                    text: last.text + String(first),
                    atom: last.atom,
                    variable: last.variable
                )
                remaining.removeFirst()
            }

            // Keep an ordinary separating space as its own layout item. FlowLayout
            // renders it in-line but discards it when it would begin a new row.
            if let first = remaining.first, first.isWhitespace {
                flat.append(LineSegment(id: nextID(), text: String(first), atom: nil, variable: nil))
                remaining.removeFirst()
            }
            if !remaining.isEmpty {
                flat.append(LineSegment(id: nextID(), text: remaining, atom: nil, variable: nil))
            }
        }

        for range in ranges {
            guard range.start >= cursor else { continue }
            if range.start > cursor {
                appendPlainText(String(characters[cursor..<range.start]))
            }
            let id = range.atom?.id ?? nextID()
            flat.append(LineSegment(id: id, text: String(characters[range.start..<range.end]), atom: range.atom, variable: range.variable))
            cursor = range.end
        }
        if cursor < characters.count {
            appendPlainText(String(characters[cursor...]))
        }

        var lines: [[LineSegment]] = [[]]
        for segment in flat {
            if segment.isChip {
                lines[lines.count - 1].append(segment)
                continue
            }
            let parts = segment.text.components(separatedBy: "\n")
            for (index, part) in parts.enumerated() {
                // Keep contiguous plain runs intact so SwiftUI handles their native
                // kerning, whitespace, and wrapping. Runs adjacent to chips retain
                // their punctuation and spaces, allowing punctuation to hug a chip.
                if !part.isEmpty {
                    lines[lines.count - 1].append(LineSegment(id: nextID(), text: part, atom: nil, variable: nil))
                }
                if index < parts.count - 1 {
                    lines.append([])
                }
            }
        }
        return lines
    }
}

#Preview("Open Card - Variables") {
    ExpandedCardView(
        phrase: PreviewData.variablePhrase,
        categoryName: "Prompting",
        dotColor: Theme.collectionDot(for: "prompt-reuse") ?? Theme.textTertiary,
        initialVariableValues: ["name": "Matt"],
        onCopyAtom: { _ in }, onCopySelection: { _ in }, onCopyFull: { _, _ in }, onClose: {},
        onEdit: {}, onToggleFavorite: {}, onDuplicate: {}, onDelete: {}
    )
    .frame(width: 820)
    .padding(40)
    .background(Theme.bgContent)
}

#Preview("Open Card - Atomic") {
    ExpandedCardView(
        phrase: PreviewData.addressPhrase,
        categoryName: "Personal Details",
        dotColor: Theme.collectionDot(for: "personal") ?? Theme.textTertiary,
        onCopyAtom: { _ in }, onCopySelection: { _ in }, onCopyFull: { _, _ in }, onClose: {},
        onEdit: {}, onToggleFavorite: {}
    )
    .frame(width: 820)
    .padding(40)
    .background(Theme.bgContent)
}

#Preview("Open Card - Library Variables") {
    VStack(spacing: 24) {
        ExpandedCardView(
            phrase: PreviewData.libraryVariablePhrase,
            categoryName: "Personal Details",
            libraryVariables: PreviewData.store.libraryVariables,
            onCopyAtom: { _ in }, onCopySelection: { _ in }, onCopyFull: { _, _ in }, onClose: {}
        )
        ExpandedCardView(
            phrase: PreviewData.cannedValuePhrase,
            categoryName: "Personal Details",
            libraryVariables: PreviewData.store.libraryVariables,
            expandedChipDisplay: true,
            onCopyAtom: { _ in }, onCopySelection: { _ in }, onCopyFull: { _, _ in }, onClose: {}
        )
    }
    .frame(width: 820)
    .padding(40)
    .background(Theme.bgContent)
}

#Preview("Open Card - Overlay") {
    let store = PreviewData.store
    store.expandedPhraseID = PreviewData.variablePhrase.id
    return ExpandedOverlayView(store: store)
        .frame(width: 1280, height: 900)
        .background(Theme.bgContent)
}
