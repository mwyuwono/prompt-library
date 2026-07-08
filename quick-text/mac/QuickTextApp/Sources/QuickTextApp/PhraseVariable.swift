import Foundation

/// A `{{...}}` placeholder occurrence detected in a phrase's `value`, character-indexed
/// to match `Atom` offset semantics (see quick-text/README.md "Variable placeholders").
/// Not persisted — parsed fresh from `value` wherever needed. Two forms share the syntax:
/// a bare `{{name}}`/`{{a/b}}` is phrase-local (`kind == .inline`, exactly as before the
/// library existed); a `{{@name}}` resolves `name` against `QuickTextCorpus.variables`
/// instead (`kind == .library`). A library reference whose name doesn't match any current
/// library entry (renamed or deleted) is `isUnresolved` — it still renders as a chip, but
/// a visually distinct one, and (since it's never given a fill) copies through as the
/// literal `{{@name}}` text via the same unfilled-placeholder fallback in `substitute`.
struct PhraseVariable: Identifiable, Equatable {
    enum Kind: Equatable {
        case inline
        /// `libraryVariableID` is non-nil only when `name` resolved to a live library entry.
        case library(name: String, libraryVariableID: String?)
    }

    var id: String { key }
    /// Dictionary key used to share one fill across every occurrence of this placeholder
    /// within the same phrase. Inline placeholders key off their exact literal text
    /// (unchanged from before the library existed). Library references key off the
    /// case-insensitive/trimmed name so `{{@Name}}` and `{{@name}}` in the same phrase
    /// share one fill.
    let key: String
    /// Text shown in the chip before it's filled. Inline placeholders show their literal
    /// key (unchanged); library references show the human-facing variable name (or the
    /// dangling name typed, if unresolved).
    let displayLabel: String
    /// Non-nil for `{{option one/option two}}` inline placeholders, or a resolved
    /// `"choice"`-type library entry; each choice is offered as a discrete pick instead
    /// of free text.
    let choices: [String]?
    let start: Int
    let end: Int
    let kind: Kind
    /// Non-nil when this resolved to a `"value"`-type library entry — its fixed,
    /// canned text. Substituted automatically (no fill-in step); the chip shows
    /// `displayLabel` (the variable's `name`) collapsed, `libraryValue` in
    /// preview/Expanded display mode (see `ExpandedCardView.variableChip`).
    let libraryValue: String?

    var isLibraryReference: Bool {
        if case .library = kind { return true }
        return false
    }

    var isCannedValue: Bool { libraryValue != nil }

    /// True for a `{{@name}}` whose name doesn't match any current library entry —
    /// renamed or deleted out from under this reference.
    var isUnresolved: Bool {
        if case .library(_, let libraryVariableID) = kind { return libraryVariableID == nil }
        return false
    }

    private static let pattern = #"\{\{([^{}]+)\}\}"#

    /// `library` resolves `{{@name}}` references against the corpus's variable library;
    /// pass `[]` (the default) to parse only inline placeholders.
    static func parse(_ value: String, library: [LibraryVariable] = []) -> [PhraseVariable] {
        guard let regex = try? NSRegularExpression(pattern: pattern) else { return [] }
        let nsRange = NSRange(value.startIndex..<value.endIndex, in: value)
        var results: [PhraseVariable] = []
        regex.enumerateMatches(in: value, range: nsRange) { match, _, _ in
            guard let match,
                  let fullRange = Range(match.range, in: value),
                  let innerRange = Range(match.range(at: 1), in: value) else { return }
            let inner = String(value[innerRange]).trimmingCharacters(in: .whitespacesAndNewlines)
            guard !inner.isEmpty else { return }
            let start = value.distance(from: value.startIndex, to: fullRange.lowerBound)
            let end = value.distance(from: value.startIndex, to: fullRange.upperBound)

            if inner.hasPrefix("@") {
                let rawName = String(inner.dropFirst()).trimmingCharacters(in: .whitespacesAndNewlines)
                guard !rawName.isEmpty else { return }
                let normalizedName = rawName.lowercased()
                let resolved = library.first { $0.name.trimmingCharacters(in: .whitespacesAndNewlines).lowercased() == normalizedName }
                results.append(PhraseVariable(
                    key: "@\(normalizedName)",
                    displayLabel: resolved?.name ?? rawName,
                    choices: resolved?.type == .choice ? resolved?.options : nil,
                    start: start,
                    end: end,
                    kind: .library(name: resolved?.name ?? rawName, libraryVariableID: resolved?.id),
                    libraryValue: resolved?.type == .value ? resolved?.value : nil
                ))
            } else {
                let choices = inner.contains("/")
                    ? inner.split(separator: "/").map { $0.trimmingCharacters(in: .whitespaces) }.filter { !$0.isEmpty }
                    : nil
                results.append(PhraseVariable(key: inner, displayLabel: inner, choices: choices, start: start, end: end, kind: .inline, libraryValue: nil))
            }
        }
        return results
    }

    /// Replaces every `{{...}}` occurrence whose key has a filled value; occurrences with
    /// no fill — including any unresolved library reference, which is never fillable —
    /// stay as the literal placeholder text, same fallback for both placeholder kinds.
    static func substitute(_ value: String, values: [String: String]) -> String {
        guard let regex = try? NSRegularExpression(pattern: pattern) else { return value }
        let nsValue = value as NSString
        let nsRange = NSRange(location: 0, length: nsValue.length)
        var result = ""
        var cursor = 0
        regex.enumerateMatches(in: value, range: nsRange) { match, _, _ in
            guard let match else { return }
            result += nsValue.substring(with: NSRange(location: cursor, length: match.range.location - cursor))
            let inner = nsValue.substring(with: match.range(at: 1)).trimmingCharacters(in: .whitespacesAndNewlines)
            let key = inner.hasPrefix("@")
                ? "@\(String(inner.dropFirst()).trimmingCharacters(in: .whitespacesAndNewlines).lowercased())"
                : inner
            result += values[key] ?? nsValue.substring(with: match.range)
            cursor = match.range.location + match.range.length
        }
        result += nsValue.substring(from: cursor)
        return result
    }

    /// Every distinct library-variable name referenced via `{{@name}}` in `value`
    /// (case-insensitive, trimmed, without the `@`) — a live scan used for the Variables
    /// Library's reference counts and edit-propagation, rather than a stored
    /// back-reference list (see README "Variables Library" admin surface).
    static func referencedLibraryNames(in value: String) -> Set<String> {
        guard let regex = try? NSRegularExpression(pattern: pattern) else { return [] }
        let nsRange = NSRange(value.startIndex..<value.endIndex, in: value)
        var names: Set<String> = []
        regex.enumerateMatches(in: value, range: nsRange) { match, _, _ in
            guard let match, let innerRange = Range(match.range(at: 1), in: value) else { return }
            let inner = String(value[innerRange]).trimmingCharacters(in: .whitespacesAndNewlines)
            guard inner.hasPrefix("@") else { return }
            let rawName = String(inner.dropFirst()).trimmingCharacters(in: .whitespacesAndNewlines)
            guard !rawName.isEmpty else { return }
            names.insert(rawName.lowercased())
        }
        return names
    }

    /// Rewrites every `{{@oldName}}` occurrence (case-insensitive, trimmed match against
    /// `oldName`) in `value` to `{{@newName}}` — used by the library's "Update all" flow
    /// when a referenced variable is renamed, so existing references don't go dangling.
    static func renamingLibraryReferences(in value: String, from oldName: String, to newName: String) -> String {
        guard let regex = try? NSRegularExpression(pattern: pattern) else { return value }
        let target = oldName.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard !target.isEmpty else { return value }
        let nsValue = value as NSString
        let nsRange = NSRange(location: 0, length: nsValue.length)
        var result = ""
        var cursor = 0
        regex.enumerateMatches(in: value, range: nsRange) { match, _, _ in
            guard let match else { return }
            result += nsValue.substring(with: NSRange(location: cursor, length: match.range.location - cursor))
            let inner = nsValue.substring(with: match.range(at: 1)).trimmingCharacters(in: .whitespacesAndNewlines)
            if inner.hasPrefix("@") {
                let rawName = String(inner.dropFirst()).trimmingCharacters(in: .whitespacesAndNewlines)
                if rawName.lowercased() == target {
                    result += "{{@\(newName)}}"
                    cursor = match.range.location + match.range.length
                    return
                }
            }
            result += nsValue.substring(with: match.range)
            cursor = match.range.location + match.range.length
        }
        result += nsValue.substring(from: cursor)
        return result
    }
}

