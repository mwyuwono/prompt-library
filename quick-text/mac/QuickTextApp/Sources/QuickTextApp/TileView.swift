import SwiftUI

/// Library grid tile. Neutral surface; the eyebrow shows the phrase's text
/// replacement shortcut (as typed, mono) in place of the category, with a
/// collection dot. Cards without a shortcut show the dot plus blank space.
/// The summary body is never truncated: cards grow past `tileHeight` as needed.
/// States (see `TileButtonStyle`): rest, hover, selected, pressed, and open
/// (the source of the open card behind the sheet). A copy flashes the tile
/// in `hlTintSolid`.
struct TileView: View {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    let phrase: Phrase
    let categoryName: String
    let dotColor: Color
    var libraryVariables: [LibraryVariable] = []
    var searchTerm: String = ""
    let isSelected: Bool
    var isOpen: Bool = false
    let isCopied: Bool
    /// Whether activating the tile opens the card (atoms / fill-in variables)
    /// rather than copying; drives the footer hint.
    var opensCard: Bool = false
    var onActivate: () -> Void = {}
    var onToggleFavorite: () -> Void = {}
    var onCopy: () -> Void = {}
    @State private var isHovering = false

    private var showsFooter: Bool { isHovering || isSelected }

    private var title: String { phrase.title }

    /// Eyebrow text: the text replacement shortcut in place of the category
    /// name (see `Phrase.eyebrowShortcut`).
    private var shortcutLabel: String { phrase.eyebrowShortcut }

    /// VoiceOver names what the eyebrow shows: the shortcut when present,
    /// otherwise the category for context.
    private var eyebrowForAccessibility: String {
        shortcutLabel.isEmpty ? categoryName : shortcutLabel
    }

    var body: some View {
        Button(action: onActivate) {
            label
        }
        .buttonStyle(TileButtonStyle(isHovering: isHovering, isSelected: isSelected, isOpen: isOpen, isCopied: isCopied))
        .accessibilityLabel(Text(title + ", " + eyebrowForAccessibility))
        .accessibilityValue(Text(accessibilityState))
        .accessibilityHint(Text(opensCard ? "Opens the snippet" : "Copies the snippet"))
        .overlay(alignment: .topTrailing) {
            Button(action: onToggleFavorite) {
                Image(systemName: phrase.favorite ? "star.fill" : "star")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(phrase.favorite ? Theme.star : Theme.textTertiary)
                    .frame(width: 44, height: 44)
                    .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .accessibilityLabel(phrase.favorite ? "Remove from favorites" : "Add to favorites")
            .padding(.top, 6)
            .padding(.trailing, 8)
            .opacity(phrase.favorite || showsFooter ? 1 : 0)
        }
        .overlay(alignment: .bottom) {
            if showsFooter {
                footer
                    .transition(.opacity)
            }
        }
        .onHover { isHovering = $0 }
        .animation(reduceMotion ? nil : Theme.Motion.hover, value: showsFooter)
    }

    private var label: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 8) {
                Circle()
                    .fill(dotColor)
                    .frame(width: 7, height: 7)
                if !shortcutLabel.isEmpty {
                    Text(shortcutLabel)
                        .font(ThemeFont.mono(11))
                        .foregroundStyle(Theme.textTertiary)
                        .lineLimit(1)
                }
                Spacer(minLength: 44)
            }
            .frame(height: 16)

            Text(SearchMark.string(title, term: searchTerm))
                .font(ThemeFont.serif(26, weight: .medium))
                .tracking(26 * -0.015)
                .foregroundStyle(Theme.textPrimary)
                .lineLimit(2)
                .multilineTextAlignment(.leading)

            Text(Self.cardText(for: phrase, library: libraryVariables, term: searchTerm))
                .font(.system(size: 13))
                .lineSpacing(4)
                .foregroundStyle(Theme.textSecondary)
                .multilineTextAlignment(.leading)

            Spacer(minLength: 0)
        }
        .padding(.horizontal, 22)
        .padding(.top, 20)
        .padding(.bottom, showsFooter ? 16 + 30 + 10 : 20)
        .frame(maxWidth: .infinity, alignment: .topLeading)
        .frame(minHeight: Theme.tileHeight, alignment: .topLeading)
    }

    private var footer: some View {
        HStack {
            Button(action: onCopy) {
                HStack(spacing: 6) {
                    Image(systemName: "doc.on.doc")
                        .font(.system(size: 11, weight: .semibold))
                    Text("Copy")
                }
            }
            .buttonStyle(AccentButtonStyle(height: 30, fontSize: 12))
            .accessibilityLabel("Copy \(title)")

            Spacer()

            HStack(spacing: 6) {
                KeyCap(text: opensCard ? "Space" : "↩")
                Text(opensCard ? "Open" : "Copy")
            }
            .font(.system(size: 11.5))
            .foregroundStyle(Theme.textTertiary)
            .accessibilityHidden(true)
        }
        .padding(.horizontal, 22)
        .padding(.bottom, 16)
    }

    private var accessibilityState: String {
        var states: [String] = []
        if phrase.favorite { states.append("favorite") }
        if isSelected { states.append("selected") }
        return states.joined(separator: ", ")
    }

    /// Grid card body: the summary when present (search matches are marked),
    /// else the first lines of the phrase value.
    static func cardText(for phrase: Phrase, library: [LibraryVariable], term: String) -> AttributedString {
        if let summary = phrase.summary,
           !summary.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            return SearchMark.string(summary, term: term)
        }
        return previewText(for: phrase, library: library, term: term)
    }

    /// First lines of the phrase value. Variables render as mono chips in the
    /// highlight tint; search matches are marked.
    static func previewText(for phrase: Phrase, library: [LibraryVariable], term: String) -> AttributedString {
        let characters = Array(phrase.value)
        let variables = PhraseVariable.parse(phrase.value, library: library)
        var result = AttributedString()
        var cursor = 0
        for variable in variables where variable.start >= cursor && variable.end <= characters.count {
            if variable.start > cursor {
                SearchMark.append(String(characters[cursor..<variable.start]), to: &result, term: term)
            }
            var chip = AttributedString("\u{2009}" + variable.displayLabel + "\u{2009}")
            chip.swiftUI.font = ThemeFont.mono(11.5)
            chip.swiftUI.backgroundColor = variable.isUnresolved ? Theme.error.opacity(0.12) : Theme.hlTint
            chip.swiftUI.foregroundColor = variable.isUnresolved ? Theme.error : Theme.hlInk
            result.append(chip)
            cursor = variable.end
            if result.characters.count > 320 { return result }
        }
        if cursor < characters.count {
            SearchMark.append(String(characters[cursor..<min(characters.count, cursor + 320)]), to: &result, term: term)
        }
        return result
    }
}

/// Tile chrome per the card-state table: fill, border, ring, shadow, and the
/// 0.98 press scale. Pressed, open, and just-copied tiles take the solid
/// highlight tint.
private struct TileButtonStyle: ButtonStyle {
    let isHovering: Bool
    let isSelected: Bool
    let isOpen: Bool
    let isCopied: Bool

    func makeBody(configuration: Configuration) -> some View {
        TileChrome(configuration: configuration, isHovering: isHovering, isSelected: isSelected, isOpen: isOpen, isCopied: isCopied)
    }
}

private struct TileChrome: View {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.colorScheme) private var colorScheme
    let configuration: ButtonStyleConfiguration
    let isHovering: Bool
    let isSelected: Bool
    let isOpen: Bool
    let isCopied: Bool

    var body: some View {
        let pressed = configuration.isPressed
        let tinted = pressed || isOpen || isCopied
        let fill = tinted ? Theme.hlTintSolid : (isHovering ? Theme.bgTileHover : Theme.bgTile)
        let border: Color = (isOpen || isSelected) ? Theme.hl : ((pressed || isHovering) ? Theme.hlLine : Theme.borderTile)
        let shadow = tinted ? Theme.Shadow.none : Theme.tileShadow(hover: isHovering, scheme: colorScheme)
        let shape = RoundedRectangle(cornerRadius: Theme.Radius.tile)

        configuration.label
            .background(shape.fill(fill))
            .overlay(shape.strokeBorder(border, lineWidth: 1))
            .focusRing(isSelected && !isOpen, cornerRadius: Theme.Radius.tile)
            .contentShape(shape)
            .shadow(color: shadow.color, radius: shadow.radius, y: shadow.y)
            .scaleEffect(pressed && !reduceMotion ? 0.98 : 1)
            .animation(reduceMotion ? nil : Theme.Motion.press, value: pressed)
            .animation(reduceMotion ? nil : Theme.Motion.hover, value: isHovering)
            .animation(reduceMotion ? nil : Theme.Motion.hover, value: isCopied)
    }
}

/// Compact list-view row: same states as the tile. The summary-derived title
/// is never truncated (rows grow past 52 pt as needed); the trailing label
/// shows the text replacement shortcut in place of the category, blank when
/// the phrase has none.
struct PhraseRowView: View {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    let phrase: Phrase
    let categoryName: String
    let dotColor: Color
    var libraryVariables: [LibraryVariable] = []
    var searchTerm: String = ""
    let isSelected: Bool
    var isOpen: Bool = false
    let isCopied: Bool
    var onActivate: () -> Void = {}
    var onToggleFavorite: () -> Void = {}
    @State private var isHovering = false

    private var title: String {
        if let summary = phrase.summary, !summary.isEmpty { return summary }
        return phrase.title
    }

    /// Eyebrow text: the text replacement shortcut in place of the category
    /// name (see `Phrase.eyebrowShortcut`).
    private var shortcutLabel: String { phrase.eyebrowShortcut }

    /// VoiceOver names what the trailing label shows: the shortcut when
    /// present, otherwise the category for context.
    private var eyebrowForAccessibility: String {
        shortcutLabel.isEmpty ? categoryName : shortcutLabel
    }

    var body: some View {
        Button(action: onActivate) {
            HStack(spacing: 14) {
                Circle()
                    .fill(dotColor)
                    .frame(width: 7, height: 7)
                Text(SearchMark.string(title, term: searchTerm))
                    .font(ThemeFont.serif(19, weight: .medium))
                    .foregroundStyle(Theme.textPrimary)
                    .frame(width: 260, alignment: .leading)
                Text(TileView.previewText(for: phrase, library: libraryVariables, term: searchTerm))
                    .font(.system(size: 13))
                    .foregroundStyle(Theme.textSecondary)
                    .lineLimit(1)
                Spacer(minLength: 12)
                if !shortcutLabel.isEmpty {
                    Text(shortcutLabel)
                        .font(ThemeFont.mono(11))
                        .foregroundStyle(Theme.textTertiary)
                        .lineLimit(1)
                }
                Color.clear.frame(width: 32)
            }
            .padding(.horizontal, 18)
            .frame(minHeight: 52)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .buttonStyle(TileButtonStyle(isHovering: isHovering, isSelected: isSelected, isOpen: isOpen, isCopied: isCopied))
        .accessibilityLabel(Text(title + ", " + eyebrowForAccessibility))
        .accessibilityValue(Text([phrase.favorite ? "favorite" : nil, isSelected ? "selected" : nil].compactMap { $0 }.joined(separator: ", ")))
        .overlay(alignment: .trailing) {
            Button(action: onToggleFavorite) {
                Image(systemName: phrase.favorite ? "star.fill" : "star")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(phrase.favorite ? Theme.star : Theme.textTertiary)
                    .frame(width: 44, height: 44)
                    .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .accessibilityLabel(phrase.favorite ? "Remove from favorites" : "Add to favorites")
            .padding(.trailing, 4)
            .opacity(phrase.favorite || isHovering || isSelected ? 1 : 0)
        }
        .onHover { isHovering = $0 }
    }
}

#Preview("Tile States") {
    let phrases = [PreviewData.shortcutPhrase, PreviewData.addressPhrase, PreviewData.variablePhrase, PreviewData.longMixedPhrase]
    return VStack(spacing: 24) {
        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 20), count: 3), spacing: 20) {
            TileView(phrase: phrases[0], categoryName: "Personal Details", dotColor: Theme.collectionDot(for: "personal")!, isSelected: false, isCopied: false)
            TileView(phrase: phrases[1], categoryName: "Personal Details", dotColor: Theme.collectionDot(for: "personal")!, isSelected: true, isCopied: false, opensCard: true)
            TileView(phrase: phrases[2], categoryName: "Prompting", dotColor: Theme.collectionDot(for: "prompt-reuse")!, isSelected: false, isOpen: true, isCopied: false, opensCard: true)
            TileView(phrase: phrases[3], categoryName: "Workflows", dotColor: Theme.collectionDot(for: "workflow-commands")!, searchTerm: "proposal", isSelected: false, isCopied: false, opensCard: true)
            TileView(phrase: phrases[0], categoryName: "Personal Details", dotColor: Theme.collectionDot(for: "personal")!, isSelected: false, isCopied: true)
        }
        PhraseRowView(phrase: phrases[0], categoryName: "Personal Details", dotColor: Theme.collectionDot(for: "personal")!, isSelected: true, isCopied: false)
    }
    .padding(40)
    .frame(width: 1100)
    .background(Theme.bgContent)
}
