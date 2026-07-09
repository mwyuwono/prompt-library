import Foundation

/// Shared validation/resolution logic for the Text Replacement sync feature (see
/// docs/text-replacement-sync-plan.md), used by `PhraseEditor`, `TextReplacementSync`,
/// and previews alike so none of them re-implement the rules.
enum TextReplacementSupport {
    /// Shorthand convention: `x` + 2-11 lowercase letters (3-12 chars total).
    static let shortcutConventionPattern = "^x[a-z]{2,11}$"

    static func matchesConvention(_ shortcut: String) -> Bool {
        shortcut.range(of: shortcutConventionPattern, options: .regularExpression) != nil
    }

    /// Auto-suggests a conforming shortcut from a non-conforming one or a phrase title:
    /// strips non-letters, lowercases, prefixes "x", truncates to fit the length cap.
    static func suggestedConformingShortcut(from text: String) -> String {
        let letters = text.lowercased().filter { $0.isLetter }
        let suffix = String(letters.prefix(11))
        let padded = suffix.count < 2 ? (suffix + "xx").prefix(2) : Substring(suffix)
        return "x" + padded
    }

    /// Returns the phrase value with canned library variables (`{{@name}}` where
    /// `type == .value`) substituted. Returns nil if unresolved placeholders remain —
    /// text/choice library variables or phrase-local `{{placeholders}}` — since a
    /// static text replacement has no fill-in step to resolve them at expansion time.
    static func resolvedReplacementText(for phrase: Phrase, variables: [LibraryVariable]) -> String? {
        let parsed = PhraseVariable.parse(phrase.value, library: variables)
        guard parsed.allSatisfy(\.isCannedValue) else { return nil }
        var values: [String: String] = [:]
        for variable in parsed where variable.isCannedValue {
            values[variable.key] = variable.libraryValue
        }
        return PhraseVariable.substitute(phrase.value, values: values)
    }

    /// Whether `phrase.value` still has unresolved placeholders after canned-variable
    /// resolution — the condition that blocks `syncEnabled` (see PhraseEditor).
    static func hasUnresolvedPlaceholders(_ phrase: Phrase, variables: [LibraryVariable]) -> Bool {
        resolvedReplacementText(for: phrase, variables: variables) == nil
    }

    static func normalizedShortcut(_ shortcut: String) -> String {
        shortcut.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    static func isShortcutUnique(_ shortcut: String, among phrases: [Phrase], excludingPhraseID: String?) -> Bool {
        let target = normalizedShortcut(shortcut).lowercased()
        guard !target.isEmpty else { return true }
        return !phrases.contains { phrase in
            guard phrase.id != excludingPhraseID, let link = phrase.textReplacement else { return false }
            return normalizedShortcut(link.shortcut).lowercased() == target
        }
    }
}
