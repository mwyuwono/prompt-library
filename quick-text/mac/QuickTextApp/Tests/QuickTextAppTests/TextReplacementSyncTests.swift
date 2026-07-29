import XCTest
@testable import QuickTextApp

/// Covers the pure logic of `TextReplacementSync` — diffing against two system layers,
/// merging the global preferences array, and verification — without touching the live
/// system. Nothing here calls the KeyboardServices XPC path or CFPreferences.
///
/// The behaviour these lock down was found the hard way on macOS 27 (see
/// docs/text-replacement-sync-plan.md): a shortcut present only in the KeyboardServices
/// database never expands, so "in sync" has to mean "correct in *both* layers".
final class TextReplacementSyncTests: XCTestCase {

    private typealias Replacement = TextReplacementSync.SystemReplacement
    private typealias Write = TextReplacementSync.ReplacementWrite

    private func makePhrase(id: String, title: String, value: String, shortcut: String, enabled: Bool = true) -> Phrase {
        var phrase = Phrase(
            id: id,
            categoryId: "cat",
            title: title,
            summary: nil,
            value: value,
            color: nil,
            textColor: nil,
            fontSize: nil,
            image: nil,
            favorite: false,
            visibility: .private,
            tags: [],
            createdAt: Date(),
            updatedAt: Date(),
            atoms: nil
        )
        phrase.textReplacement = TextReplacementLink(shortcut: shortcut, syncEnabled: enabled, lastSyncedAt: nil, lastSyncedValue: nil)
        return phrase
    }

    private func plan(
        phrases: [Phrase],
        managed: [String] = [],
        database: [Replacement]? = [],
        preferences: [Replacement]? = []
    ) -> TextReplacementSync.SyncPlan {
        TextReplacementSync.computePlan(
            phrases: phrases,
            variables: [],
            managedShortcuts: managed,
            systemState: TextReplacementSync.SystemState(database: database, preferences: preferences)
        )
    }

    // MARK: - Success requires persistence AND activation

    /// The macOS 27 failure that started all this: the entry is in the database with the
    /// right text, so the old database-only diff called it `.skip` and never repaired it —
    /// but it doesn't expand, because the preferences projection doesn't have it.
    func testDatabaseOnlyEntryIsNotConsideredInSync() {
        let phrase = makePhrase(id: "p1", title: "Align", value: "Evaluate the style.", shortcut: "xalign")
        let result = plan(
            phrases: [phrase],
            managed: ["xalign"],
            database: [Replacement(shortcut: "xalign", text: "Evaluate the style.", enabled: true)],
            preferences: []
        )

        XCTAssertTrue(result.skips.isEmpty, "a database-only entry must not be treated as already synced")
        XCTAssertEqual(result.updates.map(\.shortcut), ["xalign"])
    }

    /// The mirror case: present for activation but missing from the daemon's store, so it
    /// would never reach iOS and would be lost if the daemon republished.
    func testPreferencesOnlyEntryIsNotConsideredInSync() {
        let phrase = makePhrase(id: "p1", title: "Align", value: "Evaluate the style.", shortcut: "xalign")
        let result = plan(
            phrases: [phrase],
            managed: ["xalign"],
            database: [],
            preferences: [Replacement(shortcut: "xalign", text: "Evaluate the style.", enabled: true)]
        )

        XCTAssertEqual(result.updates.map(\.shortcut), ["xalign"])
    }

    func testEntryPresentAndMatchingInBothLayersIsSkipped() {
        let phrase = makePhrase(id: "p1", title: "Sum", value: "Summarize.", shortcut: "xsum")
        let both = [Replacement(shortcut: "xsum", text: "Summarize.", enabled: true)]
        let result = plan(phrases: [phrase], managed: ["xsum"], database: both, preferences: both)

        XCTAssertEqual(result.skips.map(\.shortcut), ["xsum"])
        XCTAssertTrue(result.isEmpty)
    }

    /// A disabled entry is present but inert, so it has to be rewritten, not skipped.
    func testDisabledEntryIsUpdated() {
        let phrase = makePhrase(id: "p1", title: "Sum", value: "Summarize.", shortcut: "xsum")
        let result = plan(
            phrases: [phrase],
            managed: ["xsum"],
            database: [Replacement(shortcut: "xsum", text: "Summarize.", enabled: true)],
            preferences: [Replacement(shortcut: "xsum", text: "Summarize.", enabled: false)]
        )

        XCTAssertEqual(result.updates.map(\.shortcut), ["xsum"])
    }

    // MARK: - Duplicate handling

    func testDuplicateShortcutIsDetectedAndRewritten() {
        let phrase = makePhrase(id: "p1", title: "Learn", value: "New text.", shortcut: "xlearn")
        let result = plan(
            phrases: [phrase],
            managed: ["xlearn"],
            database: [Replacement(shortcut: "xlearn", text: "New text.", enabled: true)],
            preferences: [
                Replacement(shortcut: "xlearn", text: "New text.", enabled: true),
                Replacement(shortcut: "xlearn", text: "Stale text.", enabled: true)
            ]
        )

        XCTAssertEqual(result.duplicates, ["xlearn"])
        XCTAssertEqual(result.updates.map(\.shortcut), ["xlearn"], "a duplicated shortcut is not reliably active and must be rewritten")
    }

    /// Upserting collapses however many copies exist down to exactly one — this is what
    /// stops an update from adding yet another duplicate.
    func testMergeCollapsesDuplicatesIntoOneCanonicalEntry() {
        let existing: [[String: Any]] = [
            ["replace": "xlearn", "with": "Stale one.", "on": 1],
            ["replace": "xlearn", "with": "Stale two.", "on": 1]
        ]
        let merged = TextReplacementSync.mergedPreferenceItems(
            existing: existing,
            upserts: [Write(shortcut: "xlearn", text: "Fresh.")],
            removals: []
        )

        XCTAssertEqual(merged.count, 1)
        XCTAssertEqual(merged[0]["replace"] as? String, "xlearn")
        XCTAssertEqual(merged[0]["with"] as? String, "Fresh.")
        XCTAssertEqual(merged[0]["on"] as? Int, 1, "`on` must be an integer, matching every entry System Settings writes")
    }

    // MARK: - Preserving unmanaged replacements

    func testMergePreservesUnmanagedEntriesVerbatim() {
        let existing: [[String: Any]] = [
            ["replace": "omw", "with": "On my way!", "on": 1],
            ["replace": "m@", "with": "matt@example.com", "on": 1, "someFutureKey": "keep me"],
            ["replace": "xsum", "with": "Old summary.", "on": 1]
        ]
        let merged = TextReplacementSync.mergedPreferenceItems(
            existing: existing,
            upserts: [Write(shortcut: "xsum", text: "New summary.")],
            removals: []
        )

        XCTAssertEqual(merged.count, 3)
        XCTAssertEqual(merged[0]["replace"] as? String, "omw")
        XCTAssertEqual(merged[1]["replace"] as? String, "m@")
        XCTAssertEqual(merged[1]["someFutureKey"] as? String, "keep me", "unknown keys on unmanaged entries must survive")
        XCTAssertEqual(merged[2]["replace"] as? String, "xsum")
        XCTAssertEqual(merged[2]["with"] as? String, "New summary.")
    }

    func testMergeRemovalDropsOnlyTheTargetedShortcut() {
        let existing: [[String: Any]] = [
            ["replace": "omw", "with": "On my way!", "on": 1],
            ["replace": "xgone", "with": "Retired.", "on": 1]
        ]
        let merged = TextReplacementSync.mergedPreferenceItems(existing: existing, upserts: [], removals: ["xgone"])

        XCTAssertEqual(merged.map { $0["replace"] as? String }, ["omw"])
    }

    func testMergeMatchesShortcutsCaseInsensitively() {
        let existing: [[String: Any]] = [["replace": "XSum", "with": "Old.", "on": 1]]
        let merged = TextReplacementSync.mergedPreferenceItems(
            existing: existing,
            upserts: [Write(shortcut: "xsum", text: "New.")],
            removals: []
        )

        XCTAssertEqual(merged.count, 1)
        XCTAssertEqual(merged[0]["with"] as? String, "New.")
    }

    // MARK: - Removals

    func testManagedShortcutWithoutAPhraseIsRemoved() {
        let both = [Replacement(shortcut: "xgone", text: "Retired.", enabled: true)]
        let result = plan(phrases: [], managed: ["xgone"], database: both, preferences: both)

        XCTAssertEqual(result.removals.map(\.shortcut), ["xgone"])
        XCTAssertEqual(result.removals.first?.oldText, "Retired.", "the XPC remove side needs the current phrase text")
    }

    /// Nothing to remove if it's already gone — otherwise every sync would replay a
    /// removal that can never verify.
    func testAlreadyAbsentManagedShortcutProducesNoRemoval() {
        let result = plan(phrases: [], managed: ["xgone"], database: [], preferences: [])
        XCTAssertTrue(result.isEmpty)
    }

    func testRemovalVerificationFailsWhileTheEntryStillExists() {
        let both = [Replacement(shortcut: "xgone", text: "Retired.", enabled: true)]
        let result = plan(phrases: [], managed: ["xgone"], database: both, preferences: both)

        let stillThere = TextReplacementSync.verificationProblems(for: result, database: [], preferences: both)
        XCTAssertEqual(stillThere, ["xgone still present in preferences"])

        let cleared = TextReplacementSync.verificationProblems(for: result, database: [], preferences: [])
        XCTAssertTrue(cleared.isEmpty)
    }

    // MARK: - Update as add-new / remove-old

    func testUpdateWithChangedTextRemovesTheOldEntryInTheSameTransaction() {
        let phrase = makePhrase(id: "p1", title: "Learn", value: "New text.", shortcut: "xlearn")
        let existing = [Replacement(shortcut: "xlearn", text: "Old text.", enabled: true)]
        let result = plan(phrases: [phrase], managed: ["xlearn"], database: existing, preferences: existing)

        XCTAssertEqual(
            TextReplacementSync.xpcRemovals(for: result),
            [Write(shortcut: "xlearn", text: "Old text.")],
            "an add-only update creates a duplicate shortcut instead of replacing the entry"
        )
    }

    /// The macOS 27 repair case: the database already holds the right text and only the
    /// activation layer is missing it. Removing here would ask the daemon to add and
    /// delete the same entry in one transaction and could leave nothing behind.
    func testUpdateWithUnchangedTextSendsNoRemoval() {
        let phrase = makePhrase(id: "p1", title: "Align", value: "Evaluate.", shortcut: "xalign")
        let result = plan(
            phrases: [phrase],
            managed: ["xalign"],
            database: [Replacement(shortcut: "xalign", text: "Evaluate.", enabled: true)],
            preferences: []
        )

        XCTAssertEqual(result.updates.map(\.shortcut), ["xalign"])
        XCTAssertTrue(TextReplacementSync.xpcRemovals(for: result).isEmpty)
    }

    func testPlanRemovalStillSendsAnXPCRemoval() {
        let both = [Replacement(shortcut: "xgone", text: "Retired.", enabled: true)]
        let result = plan(phrases: [], managed: ["xgone"], database: both, preferences: both)

        XCTAssertEqual(TextReplacementSync.xpcRemovals(for: result), [Write(shortcut: "xgone", text: "Retired.")])
    }

    // MARK: - Verification

    func testVerificationRequiresBothLayers() {
        let phrase = makePhrase(id: "p1", title: "Align", value: "Evaluate the style.", shortcut: "xalign")
        let result = plan(phrases: [phrase], managed: [], database: [], preferences: [])
        let written = [Replacement(shortcut: "xalign", text: "Evaluate the style.", enabled: true)]

        XCTAssertEqual(
            TextReplacementSync.verificationProblems(for: result, database: written, preferences: []),
            ["xalign missing from preferences"],
            "database presence alone must never verify — that is exactly the macOS 27 trap"
        )
        XCTAssertEqual(
            TextReplacementSync.verificationProblems(for: result, database: [], preferences: written),
            ["xalign missing from database"]
        )
        XCTAssertTrue(TextReplacementSync.verificationProblems(for: result, database: written, preferences: written).isEmpty)
    }

    func testVerificationReportsStaleTextAndDuplicates() {
        let phrase = makePhrase(id: "p1", title: "Align", value: "New.", shortcut: "xalign")
        let result = plan(phrases: [phrase], managed: [], database: [], preferences: [])
        let good = [Replacement(shortcut: "xalign", text: "New.", enabled: true)]

        XCTAssertEqual(
            TextReplacementSync.verificationProblems(
                for: result,
                database: good,
                preferences: [Replacement(shortcut: "xalign", text: "Old.", enabled: true)]
            ),
            ["xalign has stale text in preferences"]
        )
        XCTAssertEqual(
            TextReplacementSync.verificationProblems(
                for: result,
                database: good,
                preferences: [
                    Replacement(shortcut: "xalign", text: "New.", enabled: true),
                    Replacement(shortcut: "xalign", text: "New.", enabled: true)
                ]
            ),
            ["xalign duplicated in preferences"]
        )
    }

    // MARK: - Conflicts and unreadable layers

    func testUnmanagedOverlappingShortcutIsFlaggedAsConflict() {
        let phrase = makePhrase(id: "p1", title: "Mine", value: "Quick Text value.", shortcut: "xhoa")
        let existing = [Replacement(shortcut: "xhoa", text: "Pre-existing value.", enabled: true)]
        let result = plan(phrases: [phrase], managed: [], database: existing, preferences: existing)

        XCTAssertEqual(result.conflicts.map(\.shortcut), ["xhoa"])
        XCTAssertTrue(result.updates.isEmpty, "a conflict is reported separately from a plain update")
    }

    /// An unreadable layer is unknown, not empty. It must not make sync believe a
    /// correctly-synced shortcut has disappeared, but it also must not let a
    /// one-layer-only entry pass as satisfied.
    func testUnreadableDatabaseFallsBackToPreferencesWithoutInventingChanges() {
        let phrase = makePhrase(id: "p1", title: "Sum", value: "Summarize.", shortcut: "xsum")
        let result = plan(
            phrases: [phrase],
            managed: ["xsum"],
            database: nil,
            preferences: [Replacement(shortcut: "xsum", text: "Summarize.", enabled: true)]
        )

        XCTAssertEqual(result.skips.map(\.shortcut), ["xsum"])
    }

    func testBothLayersUnreadableTreatsEverythingAsAnAdd() {
        let phrase = makePhrase(id: "p1", title: "Sum", value: "Summarize.", shortcut: "xsum")
        let result = plan(phrases: [phrase], managed: [], database: nil, preferences: nil)

        XCTAssertEqual(result.adds.map(\.shortcut), ["xsum"])
    }

    // MARK: - Sync-disabled phrases and reporting

    func testSyncDisabledPhraseIsIgnored() {
        let phrase = makePhrase(id: "p1", title: "Off", value: "Nope.", shortcut: "xoff", enabled: false)
        XCTAssertTrue(plan(phrases: [phrase]).isEmpty)
    }

    func testPhraseWithUnresolvedPlaceholderIsNeverSynced() {
        let phrase = makePhrase(id: "p1", title: "Var", value: "Hello {{name}}", shortcut: "xvar")
        XCTAssertTrue(plan(phrases: [phrase]).isEmpty)
    }

    /// A failed sync must keep the real reason rather than collapsing to a generic
    /// message — that opacity is what made the original failure so hard to pin down.
    func testFailureReportRetainsUnderlyingReason() {
        let phrase = makePhrase(id: "p1", title: "Align", value: "Evaluate.", shortcut: "xalign")
        let result = plan(phrases: [phrase])
        var report = TextReplacementSync.SyncReport()
        report.failureReason = "Verification after write failed: xalign missing from preferences"
        report.diagnostics = ["KeyboardServices XPC available: yes."]

        XCTAssertTrue(report.summaryLine.contains("missing from preferences"))
        XCTAssertNil(report.activationNote, "a failed sync must not claim the shortcut is usable")
        XCTAssertFalse(result.isEmpty)
    }

    func testEnabledFlagParsingAcceptsTheTypesSeenInTheWild() {
        XCTAssertTrue(TextReplacementSync.parseEnabled(1))
        XCTAssertTrue(TextReplacementSync.parseEnabled(true))
        XCTAssertTrue(TextReplacementSync.parseEnabled("1"), "`defaults write -array-add` stores `on` as a string")
        XCTAssertTrue(TextReplacementSync.parseEnabled(nil))
        XCTAssertFalse(TextReplacementSync.parseEnabled(0))
        XCTAssertFalse(TextReplacementSync.parseEnabled(false))
        XCTAssertFalse(TextReplacementSync.parseEnabled("0"))
    }
}
