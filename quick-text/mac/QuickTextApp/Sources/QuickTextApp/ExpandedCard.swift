import SwiftUI

enum QuickTextMotion {
    static let microDuration: Double = 0.14
    static let standardDuration: Double = 0.22
    static let panelDuration: Double = 0.30

    static let micro = Animation.easeOut(duration: microDuration)
    static let standard = Animation.easeInOut(duration: standardDuration)
    static let panel = Animation.easeInOut(duration: panelDuration)
}

struct ExpandedOverlayView: View {
    @ObservedObject var store: CorpusStore
    let phrase: Phrase

    var body: some View {
        ZStack {
            Rectangle()
                .fill(.ultraThinMaterial)
                .overlay(Color.black.opacity(0.16))
                .ignoresSafeArea()
                .contentShape(Rectangle())
                .onTapGesture { store.collapseExpanded() }

            ExpandedCardView(
                phrase: phrase,
                fontSize: store.corpus.settings.defaultFontSize,
                fontFamily: store.corpus.settings.defaultFontFamily,
                isCopied: store.copiedPhraseID == phrase.id,
                background: store.expandedCardBackgroundColor,
                textColor: store.expandedCardTextColor,
                chipColor: store.expandedCardChipColor,
                highlightColor: store.highlightColor,
                libraryVariables: store.libraryVariables,
                expandedChipDisplay: store.corpus.settings.expandedChipDisplay ?? Settings.defaultExpandedChipDisplay,
                onCopyAtom: { atom in store.copyAtom(atom, in: phrase) },
                onCopySelection: { atoms in store.copyAtomSelection(atoms, in: phrase) },
                onCopyFull: { text in store.copyFullFromExpandedCard(text, phraseID: phrase.id) },
                onClose: { store.collapseExpanded() }
            )
            // Resets variable fill-in state when the expanded phrase changes,
            // rather than carrying stale entries over from the previous card.
            .id(phrase.id)
            .padding(64)
        }
    }
}

/// Preview mechanism for every card, atomic or plain: fills ~80% of the display
/// (see `ContentView.resizeWindowForExpansion`) so the full item text can be read
/// at a glance. Hovering the card body (not an atom chip) surfaces a copy icon in
/// the top-right corner using the same text/highlight colors as the atom chips;
/// hovering a chip instead highlights that chip since it becomes the copy target.
/// Shift-click on atoms multiselects (highlighted, clipboard updated in document
/// order on every change); a plain click reverts to single-atom copy.
struct ExpandedCardView: View {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    let phrase: Phrase
    let fontSize: Int
    let fontFamily: String
    let isCopied: Bool
    // Defaulted so #Preview call sites below don't need to specify a full
    // palette; ExpandedOverlayView passes the live, settings-resolved values.
    var background: Color = Color(hex: Settings.defaultExpandedCardBackgroundColor)
    var textColor: Color = Color(hex: Settings.defaultExpandedCardTextColor)
    var chipColor: Color = Color(hex: Settings.defaultExpandedCardChipColor)
    var highlightColor: Color = Color(hex: Settings.defaultHighlightColor)
    // Resolves `{{@name}}` references against the corpus-level library; defaulted so
    // #Preview call sites below don't need to specify one for inline-only phrases.
    var libraryVariables: [LibraryVariable] = []
    /// Global display-mode toggle (Settings > Behavior): when on, canned `"value"`-type
    /// library chips show their full value inline instead of the collapsed `name`.
    var expandedChipDisplay: Bool = false
    /// Preview-only seed values for showing a filled variable state without changing
    /// the runtime/session copy model.
    var initialVariableValues: [String: String] = [:]
    let onCopyAtom: (Atom) -> Void
    let onCopySelection: ([Atom]) -> Void
    /// Receives the phrase value with any filled `{{...}}` variables substituted in.
    let onCopyFull: (String) -> Void
    let onClose: () -> Void

    @State private var hoveredAtomID: String?
    @State private var isHoveringCard = false
    @State private var isHoveringAtomsBlock = false
    @State private var isHoveringCopyIcon = false
    @State private var isHoveringCloseIcon = false
    @State private var focusedAtomID: String?
    @State private var selectedAtomAnchorID: String?
    @State private var selectedAtomIDs: Set<String> = []
    @State private var keyMonitor: Any?
    @State private var singleCopiedAtomID: String?
    @State private var shiftReleaseMonitor: Any?
    @State private var isPulsingAllAtoms = false
    @State private var isPulsingCardBackground = false
    @State private var variableValues: [String: String] = [:]
    @State private var editingVariableKey: String?

    private var hasAtoms: Bool { !(phrase.atoms ?? []).isEmpty }
    private var typography: CardTypography { CardTypography(baseSize: CGFloat(fontSize), family: fontFamily) }
    private var sortedAtoms: [Atom] { (phrase.atoms ?? []).sorted { $0.start < $1.start } }
    private var parsedVariables: [PhraseVariable] { PhraseVariable.parse(phrase.value, library: libraryVariables) }
    private var hasVariables: Bool { !parsedVariables.isEmpty }
    /// Either kind of chip makes the card interactive rather than a single tap target,
    /// so atom- and variable-only phrases share the same "gaps absorb taps" behavior.
    private var hasChips: Bool { hasAtoms || hasVariables }

    /// True over the same area that reveals the copy icon (hovering the card but
    /// not the chips block) — a tap right now copies the whole card, so the
    /// background gets a subtle tint to signal that instead of leaving it
    /// ambiguous with the dead space between chips.
    private var isHoveringCopyAllZone: Bool { isHoveringCard && !isHoveringAtomsBlock }

    private var showsCopyAllTint: Bool { isHoveringCopyAllZone || isAllAtomsMultiselected }

    private var isAllAtomsMultiselected: Bool {
        guard hasAtoms else { return false }
        let atomIDs = Set((phrase.atoms ?? []).map(\.id))
        return selectedAtomIDs == atomIDs
    }

    var body: some View {
        VStack(alignment: .leading, spacing: typography.titleToBodySpacing) {
            Text(phrase.title.uppercased())
                .font(typography.titleFont)
                .tracking(typography.titleTracking)
                .foregroundStyle(textColor.opacity(0.6))

            GeometryReader { geometry in
                ScrollView {
                    VStack(alignment: .leading, spacing: typography.lineSpacing) {
                        Spacer(minLength: 0)
                        linesBlock(maxWidth: geometry.size.width)
                            .frame(maxWidth: .infinity, alignment: .leading)
                        Spacer(minLength: 0)
                    }
                    .frame(minHeight: geometry.size.height)
                }
            }
        }
        .padding(46)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            .background(
            ZStack {
                isPulsingCardBackground ? highlightColor : background
                if showsCopyAllTint {
                    highlightColor.opacity(0.06)
                }
            }
            .animation(reduceMotion ? nil : QuickTextMotion.standard, value: showsCopyAllTint)
        )
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .shadow(color: .black.opacity(0.4), radius: 40, y: 16)
        .overlay(alignment: .topTrailing) { iconsOverlay }
        .overlay { CopiedBadge(isVisible: isCopied, color: highlightColor) }
        .contentShape(Rectangle())
        .onHover { hovering in isHoveringCard = hovering }
        .onTapGesture { copyFull() }
        .onAppear {
            if variableValues.isEmpty {
                variableValues = initialVariableValues
            }
            keyMonitor = NSEvent.addLocalMonitorForEvents(matching: .keyDown) { event in
                handleKeyEvent(event)
            }
            // Releasing shift should drop the multiselect highlight immediately,
            // not just on the next click, so watch modifier-key changes directly.
            shiftReleaseMonitor = NSEvent.addLocalMonitorForEvents(matching: .flagsChanged) { event in
                if !event.modifierFlags.contains(.shift) {
                    clearAtomSelection()
                }
                return event
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

    private func linesBlock(maxWidth: CGFloat) -> some View {
        let content = VStack(alignment: .leading, spacing: typography.lineSpacing) {
            ForEach(Array(lines.enumerated()), id: \.offset) { _, line in
                FlowLayout(spacing: 0) {
                    ForEach(line) { segment in
                        if segment.atom != nil {
                            atomChip(segment, maxWidth: maxWidth)
                        } else if segment.variable != nil {
                            variableChip(segment, maxWidth: maxWidth)
                        } else {
                            Text(segment.text)
                                .font(typography.bodyFont)
                                .foregroundStyle(textColor)
                        }
                    }
                }
            }
        }
        // Bounding box around the whole chip cluster: while the cursor is anywhere
        // inside it (including gaps/punctuation between chips), the full-card copy
        // icon stays hidden so it doesn't flicker as the cursor crosses those gaps.
        return Group {
            if hasChips {
                content
                    .contentShape(Rectangle())
                    .onHover { hovering in isHoveringAtomsBlock = hovering }
                    // Absorbs taps in the gaps between chips so only an explicit chip
                    // click copies; the card's full-copy tap only fires outside this box.
                    .onTapGesture {}
            } else {
                content
            }
        }
    }

    private var iconsOverlay: some View {
        HStack(spacing: 12) {
            if isHoveringCard, !isHoveringAtomsBlock {
                iconButton(systemName: "doc.on.doc", isHovering: isHoveringCopyIcon, action: copyFull) { hovering in
                    isHoveringCopyIcon = hovering
                }
            }
            iconButton(systemName: "xmark", isHovering: isHoveringCloseIcon, action: onClose) { hovering in
                isHoveringCloseIcon = hovering
            }
        }
        .padding(.top, 26)
        .padding(.trailing, 26)
    }

    private func iconButton(systemName: String, isHovering: Bool, action: @escaping () -> Void, onHoverChange: @escaping (Bool) -> Void) -> some View {
        Button(action: action) {
            Image(systemName: systemName)
                .font(.system(size: 15, weight: .semibold))
                .frame(width: 44, height: 44)
        }
        .buttonStyle(.glass)
        .tint(isHovering ? highlightColor : textColor)
        .scaleEffect(isHovering && !reduceMotion ? 1.02 : 1)
        .frame(width: 44, height: 44)
        .contentShape(RoundedRectangle(cornerRadius: 12))
        .onHover(perform: onHoverChange)
        .animation(reduceMotion ? nil : QuickTextMotion.micro, value: isHovering)
    }

    /// `maxWidth` caps the chip so a long atom (spanning a whole sentence, say)
    /// wraps internally instead of running off the card uncut — FlowLayout only
    /// wraps between subviews, so a single Text needs its own width ceiling.
    private func atomChip(_ segment: LineSegment, maxWidth: CGFloat) -> some View {
        let isHighlighted = selectedAtomIDs.contains(segment.id) || hoveredAtomID == segment.id
            || isPulsingAllAtoms || singleCopiedAtomID == segment.id || isHoveringCopyAllZone
        return Button { handleAtomTap(segment.atom!) } label: {
            Text(segment.text)
                .multilineTextAlignment(.leading)
                .fixedSize(horizontal: false, vertical: true)
                .frame(maxWidth: maxWidth, alignment: .leading)
        }
            .buttonStyle(.plain)
            .font(typography.chipFont)
            .padding(.horizontal, typography.chipHorizontalPadding)
            .padding(.vertical, typography.chipVerticalPadding)
            .frame(minHeight: typography.chipMinHeight)
            .background(isHighlighted ? highlightColor : chipColor)
            .foregroundStyle(isHighlighted ? .white : background)
            .clipShape(RoundedRectangle(cornerRadius: typography.chipCornerRadius))
            .onHover { hovering in hoveredAtomID = hovering ? segment.id : nil }
            .animation(reduceMotion ? nil : QuickTextMotion.micro, value: isHighlighted)
    }

    /// Renders a `{{...}}` occurrence as a fill-in chip: unfilled shows a dashed
    /// outline with the placeholder's display label as a hint, filled shows a solid
    /// chip with the entered value. Tapping opens a popover — a text field for
    /// free-form placeholders, or a list of choices for `{{a/b}}`-style/`"choice"`-type
    /// ones. An unresolved `{{@name}}` library reference (see `PhraseVariable.isUnresolved`)
    /// has nothing to fill, so it renders as a distinct, non-interactive chip instead.
    @ViewBuilder
    private func variableChip(_ segment: LineSegment, maxWidth: CGFloat) -> some View {
        let variable = segment.variable!
        if variable.isUnresolved {
            unresolvedVariableChip(variable, maxWidth: maxWidth)
        } else if variable.isCannedValue {
            cannedValueChip(variable, maxWidth: maxWidth)
        } else {
            let filled = variableValues[variable.key]
            let isHighlighted = isPulsingAllAtoms || isHoveringCopyAllZone
            Button {
                editingVariableKey = variable.key
            } label: {
                Text(filled ?? variable.displayLabel)
                    .multilineTextAlignment(.leading)
                    .fixedSize(horizontal: false, vertical: true)
                    .frame(maxWidth: maxWidth, alignment: .leading)
                    .italic(filled == nil)
            }
                .buttonStyle(.plain)
                .font(typography.chipFont)
                .padding(.horizontal, typography.chipHorizontalPadding)
                .padding(.vertical, typography.chipVerticalPadding)
                .frame(minHeight: typography.chipMinHeight)
                .background(isHighlighted ? highlightColor : (filled != nil ? chipColor : Color.clear))
                .foregroundStyle(isHighlighted ? .white : (filled != nil ? background : textColor))
                .clipShape(RoundedRectangle(cornerRadius: typography.chipCornerRadius))
                .overlay(
                    RoundedRectangle(cornerRadius: typography.chipCornerRadius)
                        .strokeBorder(filled == nil && !isHighlighted ? textColor.opacity(0.4) : .clear, style: StrokeStyle(lineWidth: 1.5, dash: [4, 3]))
                )
                .animation(reduceMotion ? nil : QuickTextMotion.standard, value: filled)
                .popover(isPresented: Binding(
                    get: { editingVariableKey == variable.key },
                    set: { isPresented in if !isPresented { editingVariableKey = nil } }
                )) {
                    variableEditorPopover(for: variable, currentValue: filled)
                }
        }
    }

    /// A resolved `"value"`-type library reference: nothing to fill in, so it's always
    /// solid (like an atom chip) rather than dashed. Collapsed shows `name`; Expanded
    /// display mode (`expandedChipDisplay`) shows the full canned `value` instead. Either
    /// way, hovering surfaces the full value as a native tooltip — the "preview option"
    /// without switching modes (see README "Reusable variable library").
    private func cannedValueChip(_ variable: PhraseVariable, maxWidth: CGFloat) -> some View {
        let isHighlighted = isPulsingAllAtoms || isHoveringCopyAllZone
        return Text(expandedChipDisplay ? (variable.libraryValue ?? variable.displayLabel) : variable.displayLabel)
            .multilineTextAlignment(.leading)
            .fixedSize(horizontal: false, vertical: true)
            .frame(maxWidth: maxWidth, alignment: .leading)
            .font(typography.chipFont)
            .padding(.horizontal, typography.chipHorizontalPadding)
            .padding(.vertical, typography.chipVerticalPadding)
            .frame(minHeight: typography.chipMinHeight)
            .background(isHighlighted ? highlightColor : chipColor)
            .foregroundStyle(isHighlighted ? .white : background)
            .clipShape(RoundedRectangle(cornerRadius: typography.chipCornerRadius))
            .help(variable.libraryValue ?? "")
            .animation(reduceMotion ? nil : QuickTextMotion.micro, value: isHighlighted)
    }

    /// A dangling `{{@name}}` — renamed or deleted out of the library. Visually distinct
    /// (red-tinted dashed outline, no fill state) from both a plain unfilled placeholder
    /// and a resolved one; not tappable, since there's nothing to fill. Still copies
    /// through as the literal `{{@name}}` text via `PhraseVariable.substitute`'s
    /// unfilled fallback, since it's never present in `variableValues`.
    private func unresolvedVariableChip(_ variable: PhraseVariable, maxWidth: CGFloat) -> some View {
        let isHighlighted = isPulsingAllAtoms || isHoveringCopyAllZone
        return Text(variable.displayLabel)
            .multilineTextAlignment(.leading)
            .fixedSize(horizontal: false, vertical: true)
            .frame(maxWidth: maxWidth, alignment: .leading)
            .italic()
            .font(typography.chipFont)
            .padding(.horizontal, typography.chipHorizontalPadding)
            .padding(.vertical, typography.chipVerticalPadding)
            .frame(minHeight: typography.chipMinHeight)
            .foregroundStyle(isHighlighted ? background : Color.red.opacity(0.85))
            .background(isHighlighted ? highlightColor : Color.red.opacity(0.06))
            .overlay(
                RoundedRectangle(cornerRadius: typography.chipCornerRadius)
                    .strokeBorder(isHighlighted ? highlightColor : Color.red.opacity(0.55), style: StrokeStyle(lineWidth: 1.5, dash: [4, 3]))
            )
            .clipShape(RoundedRectangle(cornerRadius: typography.chipCornerRadius))
            .animation(reduceMotion ? nil : QuickTextMotion.micro, value: isHighlighted)
            .help("Unresolved variable reference — no library variable named \u{201C}\(variable.displayLabel)\u{201D} was found. Copies through as literal text.")
    }

    @ViewBuilder
    private func variableEditorPopover(for variable: PhraseVariable, currentValue: String?) -> some View {
        if let choices = variable.choices {
            VStack(alignment: .leading, spacing: 4) {
                ForEach(choices, id: \.self) { choice in
                    Button(choice) {
                        variableValues[variable.key] = choice
                        editingVariableKey = nil
                    }
                    .font(typography.chipFont)
                    .foregroundStyle(textColor)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .buttonStyle(.glass)
                }
            }
            .padding(10)
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 14))
        } else {
            VariableFillPopover(
                initialValue: currentValue ?? "",
                typography: typography,
                textColor: textColor,
                highlightColor: highlightColor
            ) { value in
                variableValues[variable.key] = value
                editingVariableKey = nil
            }
        }
    }

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

    private func handleKeyEvent(_ event: NSEvent) -> NSEvent? {
        guard event.modifierFlags.intersection([.command, .option, .control]).isEmpty else { return event }
        // The variable fill-in popover (VariableFillPopover) has its own TextField;
        // without this guard, Space/Return/arrows here swallow keystrokes meant for
        // it — most notably Space, which multi-word variable values need.
        guard editingVariableKey == nil, !(NSApp.keyWindow?.firstResponder is NSTextView) else { return event }
        let extending = event.modifierFlags.contains(.shift)
        switch event.keyCode {
        case 53:
            onClose()
            return nil
        case 49:
            copyFull()
            return nil
        case 36, 76:
            copySelectedAtomsOrFull()
            return nil
        case 123, 126:
            moveAtomSelection(delta: -1, extending: extending)
            return nil
        case 124, 125:
            moveAtomSelection(delta: 1, extending: extending)
            return nil
        default:
            return event
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
            copyFull()
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

    /// Single-atom copy highlight: unlike shift-multiselect (which persists until
    /// shift releases), this should pop and fade back on its own, matching the
    /// full-card pulse's timing instead of sticking until the next tap.
    private func flashSingleCopiedAtom(_ id: String) {
        withAnimation(reduceMotion ? nil : QuickTextMotion.micro) { singleCopiedAtomID = id }
        DispatchQueue.main.asyncAfter(deadline: .now() + CorpusStore.copyFeedbackDuration) {
            guard singleCopiedAtomID == id else { return }
            withAnimation(reduceMotion ? nil : QuickTextMotion.standard) { singleCopiedAtomID = nil }
        }
    }

    /// Full-card copy (background tap or the copy icon): substitutes any filled
    /// variables into the value, then pulses every chip (or, for plain cards with
    /// no chips, the whole card background) to the highlight color in sync with
    /// the "Copied" badge, since the whole value just got copied.
    /// Canned `"value"`-type library entries are never stored in `variableValues` (there's
    /// nothing to fill in), so they're merged in here at copy time instead.
    private var valuesForSubstitution: [String: String] {
        var values = variableValues
        for variable in parsedVariables where variable.isCannedValue {
            values[variable.key] = variable.libraryValue
        }
        return values
    }

    private func copyFull() {
        onCopyFull(PhraseVariable.substitute(phrase.value, values: valuesForSubstitution))
        guard hasChips else {
            withAnimation(reduceMotion ? nil : QuickTextMotion.micro) { isPulsingCardBackground = true }
            DispatchQueue.main.asyncAfter(deadline: .now() + CorpusStore.copyFeedbackDuration) {
                withAnimation(reduceMotion ? nil : QuickTextMotion.standard) { isPulsingCardBackground = false }
            }
            return
        }
        withAnimation(reduceMotion ? nil : QuickTextMotion.micro) { isPulsingAllAtoms = true }
        DispatchQueue.main.asyncAfter(deadline: .now() + CorpusStore.copyFeedbackDuration) {
            withAnimation(reduceMotion ? nil : QuickTextMotion.standard) { isPulsingAllAtoms = false }
        }
    }

    private var lines: [[LineSegment]] {
        LineSegment.lines(value: phrase.value, atoms: phrase.atoms ?? [], variables: parsedVariables)
    }
}

/// Shared card and tile type metrics derive from the user's base font-size setting.
/// Expanded-card body text is intentionally scaled from the same base size used by
/// the browsing surface so the two surfaces feel like one system.
struct CardTypography {
    let baseSize: CGFloat
    let family: String

    var isSerif: Bool { family == "serif" }
    var bodySize: CGFloat { baseSize * 1.5 }
    var bodyLineHeight: CGFloat { bodySize * (isSerif ? 1.22 : 1.28) }
    var chipSize: CGFloat { bodySize * 0.88 }
    var chipLineHeight: CGFloat { chipSize * 1.18 }
    var chipHorizontalPadding: CGFloat { chipSize * 0.62 }
    var chipVerticalPadding: CGFloat { chipSize * 0.12 }
    var chipMinHeight: CGFloat { bodyLineHeight + 6 }
    var chipCornerRadius: CGFloat { min(10, chipMinHeight * 0.24) }
    var titleSize: CGFloat { baseSize * 0.62 }
    var titleTracking: CGFloat { baseSize * (isSerif ? 0.14 : 0.12) }
    var titleToBodySpacing: CGFloat { baseSize * 0.9 }
    var lineSpacing: CGFloat { bodyLineHeight * 0.28 }

    var bodyFont: Font { font(bodySize, weight: .regular) }
    var chipFont: Font { font(chipSize, weight: .semibold) }
    var titleFont: Font { font(titleSize, weight: .semibold) }
    var tileFont: Font { font(baseSize, weight: .semibold) }

    private func font(_ size: CGFloat, weight: Font.Weight) -> Font {
        if isSerif {
            return .custom("Palatino", size: size).weight(weight)
        }
        return .system(size: size, weight: weight)
    }
}

/// Free-text fill-in popover for a single `{{variable}}` occurrence, shown by
/// `ExpandedCardView.variableChip`. Choice-style `{{a/b}}` placeholders skip this
/// in favor of a plain list of buttons.
private struct VariableFillPopover: View {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var text: String
    @FocusState private var isFocused: Bool
    let typography: CardTypography
    let textColor: Color
    let highlightColor: Color
    let onSubmit: (String) -> Void

    init(
        initialValue: String,
        typography: CardTypography,
        textColor: Color,
        highlightColor: Color,
        onSubmit: @escaping (String) -> Void
    ) {
        _text = State(initialValue: initialValue)
        self.typography = typography
        self.textColor = textColor
        self.highlightColor = highlightColor
        self.onSubmit = onSubmit
    }

    var body: some View {
        HStack(spacing: 8) {
            TextField("Value", text: $text)
                .font(typography.bodyFont)
                .foregroundStyle(textColor)
                .textFieldStyle(.plain)
                .frame(width: 220)
                .padding(.horizontal, 10)
                .padding(.vertical, 8)
                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 10))
                .focused($isFocused)
                .onSubmit { onSubmit(text) }
            Button("Set") { onSubmit(text) }
                .font(typography.chipFont)
                .buttonStyle(.glassProminent)
                .tint(highlightColor)
        }
        .padding(14)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16))
        .transition(reduceMotion ? .opacity : .opacity.combined(with: .scale(scale: 0.96)).combined(with: .offset(y: 4)))
        .onAppear { isFocused = true }
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

        for range in ranges {
            guard range.start >= cursor else { continue }
            if range.start > cursor {
                flat.append(LineSegment(id: nextID(), text: String(characters[cursor..<range.start]), atom: nil, variable: nil))
            }
            let id = range.atom?.id ?? nextID()
            flat.append(LineSegment(id: id, text: String(characters[range.start..<range.end]), atom: range.atom, variable: range.variable))
            cursor = range.end
        }
        if cursor < characters.count {
            flat.append(LineSegment(id: nextID(), text: String(characters[cursor...]), atom: nil, variable: nil))
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

#Preview("Expanded Card - Atomic") {
    ExpandedCardView(
        phrase: PreviewData.addressPhrase,
        fontSize: 18,
        fontFamily: "sans",
        isCopied: false,
        onCopyAtom: { _ in },
        onCopySelection: { _ in },
        onCopyFull: { _ in },
        onClose: {}
    )
    .frame(width: 900, height: 500)
    .padding(40)
}

#Preview("Expanded Card - Plain") {
    ExpandedCardView(
        phrase: PreviewData.plainPhrase,
        fontSize: 18,
        fontFamily: "sans",
        isCopied: false,
        onCopyAtom: { _ in },
        onCopySelection: { _ in },
        onCopyFull: { _ in },
        onClose: {}
    )
    .frame(width: 900, height: 500)
    .padding(40)
}

#Preview("Expanded Card - Copied") {
    ExpandedCardView(
        phrase: PreviewData.addressPhrase,
        fontSize: 18,
        fontFamily: "sans",
        isCopied: true,
        onCopyAtom: { _ in },
        onCopySelection: { _ in },
        onCopyFull: { _ in },
        onClose: {}
    )
    .frame(width: 900, height: 500)
    .padding(40)
}

#Preview("Expanded Card - Variables") {
    ExpandedCardView(
        phrase: PreviewData.variablePhrase,
        fontSize: 18,
        fontFamily: "sans",
        isCopied: false,
        onCopyAtom: { _ in },
        onCopySelection: { _ in },
        onCopyFull: { _ in },
        onClose: {}
    )
    .frame(width: 900, height: 500)
    .padding(40)
}

#Preview("Expanded Card - Library Variables") {
    ExpandedCardView(
        phrase: PreviewData.libraryVariablePhrase,
        fontSize: 18,
        fontFamily: "sans",
        isCopied: false,
        libraryVariables: PreviewData.store.libraryVariables,
        onCopyAtom: { _ in },
        onCopySelection: { _ in },
        onCopyFull: { _ in },
        onClose: {}
    )
    .frame(width: 900, height: 500)
    .padding(40)
}

#Preview("Expanded Overlay") {
    ExpandedOverlayView(store: PreviewData.store, phrase: PreviewData.addressPhrase)
        .frame(width: 900, height: 600)
}

#Preview("Phase 1 — Serif and Sans at 14 and 22") {
    ScrollView {
        VStack(spacing: 20) {
            ExpandedCardView(
                phrase: PreviewData.plainPhrase,
                fontSize: 14,
                fontFamily: "serif",
                isCopied: false,
                onCopyAtom: { _ in }, onCopySelection: { _ in }, onCopyFull: { _ in }, onClose: {}
            )
            .frame(width: 760, height: 210)

            ExpandedCardView(
                phrase: PreviewData.plainPhrase,
                fontSize: 14,
                fontFamily: "sans",
                isCopied: false,
                onCopyAtom: { _ in }, onCopySelection: { _ in }, onCopyFull: { _ in }, onClose: {}
            )
            .frame(width: 760, height: 210)

            ExpandedCardView(
                phrase: PreviewData.longMixedPhrase,
                fontSize: 22,
                fontFamily: "serif",
                isCopied: false,
                initialVariableValues: ["recipient": "the review team", "date": "Friday"],
                onCopyAtom: { _ in }, onCopySelection: { _ in }, onCopyFull: { _ in }, onClose: {}
            )
            .frame(width: 760, height: 360)

            ExpandedCardView(
                phrase: PreviewData.longMixedPhrase,
                fontSize: 22,
                fontFamily: "sans",
                isCopied: false,
                onCopyAtom: { _ in }, onCopySelection: { _ in }, onCopyFull: { _ in }, onClose: {}
            )
            .frame(width: 760, height: 360)
        }
        .padding(32)
    }
}

#Preview("Phase 1 — Variable States") {
    VStack(spacing: 20) {
        ExpandedCardView(
            phrase: PreviewData.variablePhrase,
            fontSize: 18,
            fontFamily: "serif",
            isCopied: false,
            initialVariableValues: ["name": "Matt", "topic": "the design refresh"],
            onCopyAtom: { _ in }, onCopySelection: { _ in }, onCopyFull: { _ in }, onClose: {}
        )
        .frame(width: 860, height: 280)

        ExpandedCardView(
            phrase: PreviewData.cannedValuePhrase,
            fontSize: 18,
            fontFamily: "serif",
            isCopied: false,
            libraryVariables: PreviewData.store.libraryVariables,
            expandedChipDisplay: false,
            onCopyAtom: { _ in }, onCopySelection: { _ in }, onCopyFull: { _ in }, onClose: {}
        )
        .frame(width: 860, height: 220)

        ExpandedCardView(
            phrase: PreviewData.cannedValuePhrase,
            fontSize: 18,
            fontFamily: "serif",
            isCopied: false,
            libraryVariables: PreviewData.store.libraryVariables,
            expandedChipDisplay: true,
            onCopyAtom: { _ in }, onCopySelection: { _ in }, onCopyFull: { _ in }, onClose: {}
        )
        .frame(width: 860, height: 220)

        ExpandedCardView(
            phrase: PreviewData.libraryVariablePhrase,
            fontSize: 18,
            fontFamily: "sans",
            isCopied: false,
            libraryVariables: PreviewData.store.libraryVariables,
            onCopyAtom: { _ in }, onCopySelection: { _ in }, onCopyFull: { _ in }, onClose: {}
        )
        .frame(width: 860, height: 260)
    }
    .padding(32)
}

#Preview("Phase 2 — Feedback States") {
    VStack(spacing: 20) {
        ExpandedCardView(
            phrase: PreviewData.addressPhrase,
            fontSize: 18,
            fontFamily: "serif",
            isCopied: true,
            onCopyAtom: { _ in }, onCopySelection: { _ in }, onCopyFull: { _ in }, onClose: {}
        )
        .frame(width: 620, height: 300)

        TileView(
            phrase: PreviewData.plainPhrase,
            imageURL: nil,
            backgroundColor: Color(hex: "#2E301D"),
            textColor: Color(hex: "#E2D6CF"),
            fontSize: 18,
            fontFamily: "serif",
            cardWidth: 220,
            isSelected: false,
            isCopied: true
        )
    }
    .padding(24)
    .frame(width: 700)
}
