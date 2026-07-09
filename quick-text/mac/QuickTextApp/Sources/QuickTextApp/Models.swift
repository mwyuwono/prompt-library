import SwiftUI

struct QuickTextCorpus: Codable {
    var version: Int
    var updatedAt: Date
    var settings: Settings
    var categories: [Category]
    var phrases: [Phrase]
    // Reusable variable library (see quick-text/README.md "Variable placeholders" ->
    // reusable variable library). `{{@name}}` placeholders in any phrase's `value`
    // resolve against this list by `name` (case-insensitive, trimmed) instead of being
    // parsed as a literal, phrase-local placeholder. Optional so existing corpus.json
    // files without this key still decode.
    var variables: [LibraryVariable]?

    static let empty = QuickTextCorpus(version: 1, updatedAt: Date(), settings: Settings(defaultFontSize: 18, defaultTileColor: "brown-13", defaultTextColor: "brown-22", defaultFontFamily: "sans", paletteSource: "Robert Brown Fabric Collection"), categories: [], phrases: [])
}

struct Settings: Codable {
    var defaultFontSize: Int
    var defaultTileColor: String
    var defaultTextColor: String
    var defaultFontFamily: String
    var paletteSource: String
    // Optional so existing corpus.json files without this key still decode.
    var cardWidth: Double? = nil
    // Optional so existing corpus.json files without this key still decode.
    // Whether copying from the expanded card auto-closes it.
    var closeCardOnCopy: Bool? = nil
    // Optional so existing corpus.json files without this key still decode.
    // Global display mode: when true, canned "value"-type library variable chips show
    // their full value inline instead of the collapsed `name` (see README "Reusable
    // variable library" and `ExpandedCardView.cannedValueChip`).
    var expandedChipDisplay: Bool? = nil
    // Optional so existing corpus.json files without this key still decode.
    // Controls whether the top-row Variables Library button is visible.
    var showVariablesLibraryButton: Bool? = nil

    // Optional so existing corpus.json files without these keys still decode.
    // Each stores either a palette swatch id or a literal "#RRGGBB" hex string
    // (see PaletteColor.isHex). nil falls back to the matching default below.
    var highlightColor: String? = nil
    var gridBackgroundColor: String? = nil
    var expandedCardBackgroundColor: String? = nil
    var expandedCardTextColor: String? = nil
    var expandedCardChipColor: String? = nil

    // Optional so existing corpus.json files without these keys still decode
    // (see docs/text-replacement-sync-plan.md). Corpus-level bookkeeping for
    // syncing phrases to macOS/iOS Text Replacements.
    var textReplacementLastSyncAt: Date? = nil
    /// Shortcuts this app created/manages in the system store. Needed so sync can
    /// remove entries after a toggle is switched off or a phrase is deleted,
    /// without ever touching the user's unmanaged replacements.
    var managedReplacementShortcuts: [String]? = nil

    static let defaultCardWidth: Double = 164
    static let defaultCloseCardOnCopy = false
    static let defaultExpandedChipDisplay = false
    static let defaultShowVariablesLibraryButton = true
    static let defaultHighlightColor = "#E2725B"
    static let defaultExpandedCardBackgroundColor = "#22201B"
    static let defaultExpandedCardTextColor = "#F4EDE0"
    static let defaultExpandedCardChipColor = "#F1E6D3"
}

struct Category: Codable, Identifiable {
    var id: String
    var name: String
    var sortOrder: Int
    // Optional so existing corpus.json files without these keys still decode.
    // Sits between a phrase's own color and the global settings default.
    var color: String? = nil
    var textColor: String? = nil
}

struct Phrase: Codable, Identifiable {
    var id: String
    var categoryId: String
    var title: String
    var summary: String?
    var value: String
    var color: String?
    var textColor: String?
    var fontSize: Int?
    var image: String? = nil
    var favorite: Bool
    var visibility: Visibility
    var tags: [String]
    var createdAt: Date
    var updatedAt: Date
    // Atomic phrase cards (see web/quick-text-component/quick-text.js). Tile tap expands
    // into ExpandedOverlayView/ExpandedCardView below. PhraseEditor lets admins add/remove
    // atoms from a text selection in the Value field (see SelectableTextEditor).
    var atoms: [Atom]?
    // Optional so existing corpus.json files without this key still decode
    // (see docs/text-replacement-sync-plan.md). Links this phrase to a managed
    // macOS/iOS Text Replacement shortcut.
    var textReplacement: TextReplacementLink? = nil
}

/// Links a phrase to a managed macOS/iOS Text Replacement (System Settings > Keyboard
/// > Text Replacements) — see docs/text-replacement-sync-plan.md and TextReplacementSync.swift.
struct TextReplacementLink: Codable, Equatable {
    /// The shorthand typed to expand, e.g. "xsum". Convention: `^x[a-z]{2,11}$` (warned,
    /// not enforced — see PhraseEditor's shortcut validation).
    var shortcut: String
    var syncEnabled: Bool
    /// Set by the sync engine after a successful add/update.
    var lastSyncedAt: Date? = nil
    /// Resolved phrase value at last sync, for drift detection (see TextReplacementSync).
    var lastSyncedValue: String? = nil
}

struct Atom: Codable, Identifiable, Equatable {
    var id: String
    var start: Int
    var end: Int
    var label: String?
}

/// A reusable, corpus-level variable (see quick-text/README.md "Variable placeholders" ->
/// reusable variable library). Referenced from any phrase's `value` via `{{@name}}`,
/// resolved by `name` (case-insensitive, trimmed) at render time. `id` is stable and
/// never reused, even across a rename — `name` is just the human-facing lookup key.
struct LibraryVariable: Codable, Identifiable, Equatable {
    enum Kind: String, Codable, CaseIterable {
        case text
        case choice
        /// A fixed, canned value substituted directly — no fill-in step at copy time.
        /// The card shows just `name` (collapsed) unless previewed or in Expanded
        /// display mode, which shows `value` in full (see README "Reusable variable
        /// library" and `PhraseVariable.libraryValue`).
        case value
    }

    var id: String
    var name: String
    var type: Kind
    /// Required and non-empty when `type == .choice`; nil/ignored otherwise.
    var options: [String]?
    /// Required and non-empty when `type == .value`; nil/ignored otherwise.
    var value: String?
}

enum Visibility: String, Codable, CaseIterable {
    case `private`
    case `public`
    case localOnly = "local-only"
}

struct Palette: Codable {
    var name: String
    var source: String
    var colors: [PaletteColor]

    static let empty = Palette(name: "Robert Brown Fabric Collection", source: "", colors: [])
}

struct PaletteColor: Codable, Identifiable {
    var id: String
    var name: String
    var hex: String

    /// Color-selection fields (phrase/category/settings) store either a palette
    /// swatch id or a literal "#RRGGBB" hex string directly — this tells the two apart.
    static func isHex(_ value: String) -> Bool {
        guard value.hasPrefix("#"), value.count == 7 else { return false }
        return value.dropFirst().allSatisfy(\.isHexDigit)
    }
}

extension JSONDecoder {
    static var quickText: JSONDecoder {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return decoder
    }
}

extension JSONEncoder {
    static var quickText: JSONEncoder {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        return encoder
    }
}

