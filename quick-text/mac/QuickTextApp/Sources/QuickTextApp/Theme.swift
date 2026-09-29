import AppKit
import SwiftUI

/// Semantic design tokens for the redesigned library and open card. Every color
/// resolves per appearance (NSColor dynamic provider), so views never branch on
/// light/dark for color and never hard-code hex values.
///
/// The highlight family (`hl*`) marks every "you are here" state: hover,
/// selection, the open card's source tile, search matches, variable fields, and
/// focus. It never fills a button — `accent` does that — so in light mode a
/// selection never reads as an action.
enum Theme {
    // MARK: Surfaces and text

    static let bgContent = dynamic(dark: "#1A1917", light: "#FFFFFF")
    static let bgSidebar = dynamic(dark: "#211F1C", light: "#F4F4F2")
    static let bgTile = dynamic(dark: "#24221F", light: "#FFFFFF")
    static let bgTileHover = dynamic(dark: "#2B2825", light: "#FFFFFF")
    static let bgSheet = dynamic(dark: "#24221F", light: "#FFFFFF")
    static let bgSheetFooter = dynamic(dark: "#211F1C", light: "#FAFAF8")
    static let bgPanel = dynamic(dark: "#1E1C1A", light: "#F4F4F2")
    static let bgField = dynamic(dark: "#FFFFFF", darkAlpha: 0.05, light: "#F4F4F2")
    static let borderTile = dynamic(dark: "#FFFFFF", darkAlpha: 0.06, light: "#DEDEDA")
    static let borderField = dynamic(dark: "#FFFFFF", darkAlpha: 0.09, light: "#111111", lightAlpha: 0.14)
    static let borderSheet = dynamic(dark: "#FFFFFF", darkAlpha: 0.08, light: "#111111", lightAlpha: 0.10)
    static let rule = dynamic(dark: "#FFFFFF", darkAlpha: 0.07, light: "#111111", lightAlpha: 0.10)
    static let textPrimary = dynamic(dark: "#F3EFE9", light: "#111111")
    static let textSecondary = dynamic(dark: "#B3ACA3", light: "#4A4A48")
    static let textTertiary = dynamic(dark: "#968E84", light: "#6B6B68")
    static let sidebarSelected = dynamic(dark: "#D67A62", darkAlpha: 0.16, light: "#111111", lightAlpha: 0.07)
    static let sidebarHover = dynamic(dark: "#FFFFFF", darkAlpha: 0.04, light: "#111111", lightAlpha: 0.04)
    static let segmentOn = dynamic(dark: "#FFFFFF", darkAlpha: 0.12, light: "#FFFFFF")
    static let scrim = dynamic(dark: "#0A0908", darkAlpha: 0.58, light: "#111111", lightAlpha: 0.28)
    static let star = dynamic(dark: "#D6A95C", light: "#9A7424")
    static let error = dynamic(dark: "#E5776B", light: "#B3261E")

    // MARK: Dictate page

    /// `rec` marks recording state and nothing else; `hl` still marks focus.
    static let rec = dynamic(dark: "#E5604F", light: "#C13A2E")
    static let onRec = dynamic(dark: "#1A1917", light: "#FFFFFF")
    static let recLine = dynamic(dark: "#E5604F", darkAlpha: 0.50, light: "#C13A2E", lightAlpha: 0.45)
    static let bgButton = dynamic(dark: "#FFFFFF", darkAlpha: 0.06, light: "#FFFFFF")
    /// Fields inside `bgPanel`; light `bgField` equals the panel and would vanish.
    static let bgFieldOnPanel = dynamic(dark: "#FFFFFF", darkAlpha: 0.05, light: "#FFFFFF")

    // MARK: Primary action

    static let accent = dynamic(dark: "#D67A62", light: "#111111")
    static let onAccent = dynamic(dark: "#1A1917", light: "#FFFFFF")
    static let kbdOnAccent = dynamic(dark: "#1A1917", darkAlpha: 0.14, light: "#FFFFFF", lightAlpha: 0.16)

    // MARK: Highlight

    static let hl = dynamic(dark: "#D67A62", light: "#6D7C3C")
    static let hlLine = dynamic(dark: "#D67A62", darkAlpha: 0.60, light: "#6D7C3C", lightAlpha: 0.60)
    static let hlRing = dynamic(dark: "#D67A62", darkAlpha: 0.35, light: "#6D7C3C", lightAlpha: 0.30)
    /// Translucent tint for inline chips, search matches, and variable fields.
    static let hlTint = dynamic(dark: "#D67A62", darkAlpha: 0.14, light: "#EEF1E4")
    /// Opaque equivalent of `hlTint` for whole-tile fills (open, pressed, copied).
    static let hlTintSolid = dynamic(dark: "#3A2A24", light: "#EEF1E4")
    static let hlInk = dynamic(dark: "#EBA08C", light: "#4F5A2B")
    static let hlSelection = dynamic(dark: "#D67A62", darkAlpha: 0.32, light: "#6D7C3C", lightAlpha: 0.22)

    // MARK: Collection dots

    /// Keyed by corpus category id (display names in comments). Categories added
    /// later fall back to their own stored color, then `textTertiary`
    /// (see `CorpusStore.dotColor(for:)`). Elbridge uses slate rather than the
    /// handoff's olive (#5E6B4E) so it doesn't read as the light-mode highlight.
    private static let collectionDots: [String: Color] = [
        "personal": dynamic(dark: "#CDBB9E", light: "#8C7651"),           // Personal Details
        "prompt-reuse": dynamic(dark: "#D67A62", light: "#8E3B2E"),       // Prompting
        "voice-process": dynamic(dark: "#C8A95E", light: "#9A7424"),      // Voice Process
        "response-style": dynamic(dark: "#8FA6BE", light: "#1F3A5F"),     // Prompt Response Rules
        "workflow-commands": dynamic(dark: "#BC9CB5", light: "#6E4F6A"),  // Workflows
        "image-quality": dynamic(dark: "#7FAEA4", light: "#3E6F66"),      // Images
        "bullfinch": dynamic(dark: "#A88E6E", light: "#6A5238"),          // Bullfinch
        "elbridge": dynamic(dark: "#A7AEB8", light: "#505C6B")            // Elbridge
    ]

    static func collectionDot(for categoryID: String) -> Color? {
        collectionDots[categoryID]
    }

    // MARK: Radii

    enum Radius {
        static let tile: CGFloat = 14
        static let sheet: CGFloat = 20
        static let panel: CGFloat = 14
        static let control: CGFloat = 10
        static let search: CGFloat = 9
        static let sidebarItem: CGFloat = 8
        static let chip: CGFloat = 5
        static let kbd: CGFloat = 5
    }

    // MARK: Shadows

    struct Shadow {
        let color: Color
        let radius: CGFloat
        let y: CGFloat

        static let none = Shadow(color: .clear, radius: 0, y: 0)
    }

    /// CSS blur values from the handoff are halved into SwiftUI shadow radii.
    static func tileShadow(hover: Bool, scheme: ColorScheme) -> Shadow {
        switch (hover, scheme) {
        case (false, .dark): Shadow(color: .black.opacity(0.35), radius: 1, y: 1)
        case (false, _): .none
        case (true, .dark): Shadow(color: .black.opacity(0.45), radius: 16, y: 12)
        case (true, _): Shadow(color: Color(nsColor: nsColor("#111111", 1)).opacity(0.10), radius: 20, y: 18)
        }
    }

    static func sheetShadow(scheme: ColorScheme) -> Shadow {
        scheme == .dark
            ? Shadow(color: .black.opacity(0.55), radius: 50, y: 40)
            : Shadow(color: Color(nsColor: nsColor("#111111", 1)).opacity(0.18), radius: 50, y: 40)
    }

    static func dockShadow(scheme: ColorScheme) -> [Shadow] {
        scheme == .dark
            ? [Shadow(color: .black.opacity(0.55), radius: 50, y: 40)]
            : [Shadow(color: Color(nsColor: nsColor("#111111", 1)).opacity(0.10), radius: 20, y: 18),
               Shadow(color: Color(nsColor: nsColor("#111111", 1)).opacity(0.06), radius: 1, y: 1)]
    }

    // MARK: Motion

    enum Motion {
        static let hover = Animation.easeOut(duration: 0.15)
        static let press = Animation.easeOut(duration: 0.12)
        static let sheet = Animation.spring(response: 0.32, dampingFraction: 0.86)
        static let fade = Animation.easeOut(duration: 0.2)
        static let pageOpen = Animation.spring(response: 0.30, dampingFraction: 0.88)
        static let pageClose = Animation.easeOut(duration: 0.16)
        static let pageReduced = Animation.easeInOut(duration: 0.12)
    }

    // MARK: Grid

    static let gridMinTileWidth: CGFloat = 300
    static let gridSpacing: CGFloat = 20
    static let tileHeight: CGFloat = 184

    /// floor((width + gap) / (minTile + gap)), clamped to 1–4.
    static func columnCount(for contentWidth: CGFloat) -> Int {
        let count = Int((contentWidth + gridSpacing) / (gridMinTileWidth + gridSpacing))
        return min(max(count, 1), 4)
    }

    // MARK: Helpers

    static func dynamic(dark: String, darkAlpha: CGFloat = 1, light: String, lightAlpha: CGFloat = 1) -> Color {
        let darkColor = nsColor(dark, darkAlpha)
        let lightColor = nsColor(light, lightAlpha)
        return Color(nsColor: NSColor(name: nil) { appearance in
            appearance.bestMatch(from: [.aqua, .darkAqua]) == .darkAqua ? darkColor : lightColor
        })
    }

    static func nsColor(_ hex: String, _ alpha: CGFloat) -> NSColor {
        let value = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: value).scanHexInt64(&int)
        return NSColor(
            srgbRed: CGFloat((int >> 16) & 0xff) / 255,
            green: CGFloat((int >> 8) & 0xff) / 255,
            blue: CGFloat(int & 0xff) / 255,
            alpha: alpha
        )
    }
}

/// Newsreader carries meaning (titles, phrase text); the system font carries
/// chrome. Newsreader is used when installed, otherwise New York, the
/// Apple-consistent serif fallback.
enum ThemeFont {
    static let hasNewsreader = NSFontManager.shared.availableFontFamilies.contains("Newsreader")

    static func serif(_ size: CGFloat, weight: Font.Weight = .regular, italic: Bool = false) -> Font {
        let font: Font = hasNewsreader
            ? Font.custom("Newsreader", size: size).weight(weight)
            : Font.system(size: size, weight: weight, design: .serif)
        return italic ? font.italic() : font
    }

    static func mono(_ size: CGFloat) -> Font {
        .system(size: size, weight: .regular, design: .monospaced)
    }

    static func eyebrow(_ size: CGFloat = 11) -> Font {
        .system(size: size, weight: .semibold)
    }
}

/// Per-device appearance override (Settings > Appearance). Stored in
/// UserDefaults, not the shared corpus, so each Mac keeps its own choice.
enum AppAppearance: String, CaseIterable, Identifiable {
    case system, light, dark

    static let storageKey = "QuickText.appearance"

    var id: String { rawValue }

    var label: String {
        switch self {
        case .system: "System"
        case .light: "Light"
        case .dark: "Dark"
        }
    }

    static var current: AppAppearance {
        AppAppearance(rawValue: UserDefaults.standard.string(forKey: storageKey) ?? "") ?? .system
    }

    func apply() {
        switch self {
        case .system: NSApp.appearance = nil
        case .light: NSApp.appearance = NSAppearance(named: .aqua)
        case .dark: NSApp.appearance = NSAppearance(named: .darkAqua)
        }
    }
}

// MARK: - Shared controls

/// Keyboard focus ring for custom controls: a 3 pt `hlRing` outside the shape.
struct FocusRing: ViewModifier {
    let isVisible: Bool
    var cornerRadius: CGFloat = Theme.Radius.control
    var width: CGFloat = 3

    func body(content: Content) -> some View {
        content.overlay {
            if isVisible {
                RoundedRectangle(cornerRadius: cornerRadius + width)
                    .strokeBorder(Theme.hlRing, lineWidth: width)
                    .padding(-width)
                    .allowsHitTesting(false)
            }
        }
    }
}

extension View {
    func focusRing(_ isVisible: Bool, cornerRadius: CGFloat = Theme.Radius.control, width: CGFloat = 3) -> some View {
        modifier(FocusRing(isVisible: isVisible, cornerRadius: cornerRadius, width: width))
    }
}

/// Filled primary action (New Snippet, Copy). `accent` fill, never `hl`.
struct AccentButtonStyle: ButtonStyle {
    var height: CGFloat = 34
    var fontSize: CGFloat = 13
    /// Overridden only by the Dictate Stop button (`rec` / `onRec`).
    var fill: Color = Theme.accent
    var ink: Color = Theme.onAccent

    func makeBody(configuration: Configuration) -> some View {
        AccentButtonChrome(configuration: configuration, height: height, fontSize: fontSize, fill: fill, ink: ink)
    }
}

private struct AccentButtonChrome: View {
    let configuration: ButtonStyleConfiguration
    let height: CGFloat
    let fontSize: CGFloat
    let fill: Color
    let ink: Color
    @Environment(\.isFocused) private var isFocused
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        configuration.label
            .font(.system(size: fontSize, weight: .semibold))
            .foregroundStyle(ink)
            .padding(.horizontal, 12)
            .frame(height: height)
            .background(RoundedRectangle(cornerRadius: Theme.Radius.control).fill(fill))
            .overlay(RoundedRectangle(cornerRadius: Theme.Radius.control).fill(Color.black.opacity(configuration.isPressed ? 0.12 : 0)))
            .contentShape(RoundedRectangle(cornerRadius: Theme.Radius.control))
            .focusRing(isFocused)
            .scaleEffect(configuration.isPressed && !reduceMotion ? 0.98 : 1)
            .animation(reduceMotion ? nil : Theme.Motion.press, value: configuration.isPressed)
    }
}

/// Outlined secondary action.
struct OutlineButtonStyle: ButtonStyle {
    var height: CGFloat = 40
    var fill: Color = .clear

    func makeBody(configuration: Configuration) -> some View {
        OutlineButtonChrome(configuration: configuration, height: height, fill: fill)
    }
}

private struct OutlineButtonChrome: View {
    let configuration: ButtonStyleConfiguration
    let height: CGFloat
    var fill: Color = .clear
    @Environment(\.isFocused) private var isFocused
    @State private var isHovering = false

    var body: some View {
        configuration.label
            .font(.system(size: 13, weight: .medium))
            .foregroundStyle(Theme.textPrimary)
            .padding(.horizontal, 14)
            .frame(height: height)
            .background(RoundedRectangle(cornerRadius: Theme.Radius.control).fill(configuration.isPressed ? Theme.hlTint : (isHovering ? Theme.sidebarHover : Color.clear)))
            .background(RoundedRectangle(cornerRadius: Theme.Radius.control).fill(fill))
            .overlay(RoundedRectangle(cornerRadius: Theme.Radius.control).strokeBorder(Theme.borderField, lineWidth: 1))
            .contentShape(RoundedRectangle(cornerRadius: Theme.Radius.control))
            .focusRing(isFocused)
            .onHover { isHovering = $0 }
    }
}

/// Borderless icon button with a square hit area (36 pt toolbar, 44 pt sheet).
struct IconButtonStyle: ButtonStyle {
    var size: CGFloat = 36

    func makeBody(configuration: Configuration) -> some View {
        IconButtonChrome(configuration: configuration, size: size)
    }
}

private struct IconButtonChrome: View {
    let configuration: ButtonStyleConfiguration
    let size: CGFloat
    @Environment(\.isFocused) private var isFocused
    @State private var isHovering = false

    var body: some View {
        configuration.label
            .frame(width: size, height: size)
            .background(RoundedRectangle(cornerRadius: Theme.Radius.control).fill(configuration.isPressed ? Theme.hlTint : (isHovering ? Theme.sidebarHover : Color.clear)))
            .contentShape(RoundedRectangle(cornerRadius: Theme.Radius.control))
            .focusRing(isFocused)
            .onHover { isHovering = $0 }
    }
}

/// Small key hint, e.g. ⌘K, ↩, Esc.
struct KeyCap: View {
    let text: String
    var onAccent = false

    var body: some View {
        Text(text)
            .font(.system(size: 11))
            .padding(.horizontal, 6)
            .padding(.vertical, 2)
            .background {
                if onAccent {
                    RoundedRectangle(cornerRadius: Theme.Radius.kbd).fill(Theme.kbdOnAccent)
                } else {
                    RoundedRectangle(cornerRadius: Theme.Radius.kbd).strokeBorder(Theme.borderField, lineWidth: 1)
                }
            }
    }
}

/// Window-level "Copied" confirmation, shown for every copy path.
struct CopiedToast: View {
    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "checkmark")
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(Theme.hl)
            Text("Copied")
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(Theme.textPrimary)
        }
        .padding(.horizontal, 16)
        .frame(height: 36)
        .background(Capsule().fill(Theme.bgSheet))
        .overlay(Capsule().strokeBorder(Theme.borderSheet, lineWidth: 1))
        .shadow(color: .black.opacity(0.18), radius: 12, y: 6)
        .accessibilityElement(children: .combine)
        .accessibilityAddTraits(.updatesFrequently)
    }
}

/// Builds text runs with case-insensitive search matches marked in `hlTint` /
/// `hlInk` (titles and previews).
enum SearchMark {
    static func append(_ text: String, to result: inout AttributedString, term: String, base: (inout AttributedString) -> Void = { _ in }) {
        let needle = term.trimmingCharacters(in: .whitespacesAndNewlines)
        var remaining = text[...]
        while !needle.isEmpty, let match = remaining.range(of: needle, options: [.caseInsensitive, .diacriticInsensitive]) {
            var before = AttributedString(String(remaining[remaining.startIndex..<match.lowerBound]))
            base(&before)
            result.append(before)
            var marked = AttributedString(String(remaining[match]))
            base(&marked)
            marked.swiftUI.backgroundColor = Theme.hlTint
            marked.swiftUI.foregroundColor = Theme.hlInk
            result.append(marked)
            remaining = remaining[match.upperBound...]
        }
        var rest = AttributedString(String(remaining))
        base(&rest)
        result.append(rest)
    }

    static func string(_ text: String, term: String) -> AttributedString {
        var result = AttributedString()
        append(text, to: &result, term: term)
        return result
    }
}
