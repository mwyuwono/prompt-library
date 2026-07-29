import Foundation
import AppKit

/// Syncs Quick Text phrases with `syncEnabled` text replacements to the macOS/iOS
/// system Text Replacement store (System Settings > Keyboard > Text Replacements).
/// See docs/text-replacement-sync-plan.md for the full design. Quick Text is
/// canonical: this only ever touches shortcuts it created (`managedReplacementShortcuts`)
/// plus whatever a `SyncPlan` explicitly lists, never the user's other personal entries.
///
/// ## Two system layers (macOS 27)
///
/// A text replacement lives in two places, and on macOS 27 they can diverge:
///
/// 1. **`~/Library/KeyboardServices/TextReplacements.db`** — `keyboardservicesd`'s store.
///    Written through the private KeyboardServices XPC client. This is the *persistence*
///    layer and the one that propagates to iOS via iCloud.
/// 2. **`NSUserDictionaryReplacementItems`** in the global any-host preferences domain —
///    the *activation* layer. This is what the text-input system actually reads when
///    deciding whether to expand something you typed.
///
/// On macOS 26 the XPC write published to both. **On macOS 27 it does not**: the XPC
/// transaction reports success and lands in the database, but never reaches the
/// preferences projection, and a database-only entry never expands (verified 2026-07-29
/// with a throwaway shortcut in a freshly launched TextEdit). So sync writes *both*
/// layers — XPC for persistence/iCloud, CFPreferences for activation — and only reports
/// success when both verify.
///
/// ## Activation is per-process and read at launch
///
/// Applications read the replacement set when they start and cache it. An entry added
/// after an app launched does not expand in that app until it is relaunched, even though
/// the entry is correct in both layers (verified 2026-07-29: the same well-formed entry
/// did not expand in an already-running TextEdit, then expanded immediately in a
/// relaunched one). There is no notification a third-party process can post to invalidate
/// that cache. This is a macOS limitation, not something sync can fix, so the report says
/// so explicitly rather than implying the shortcut is usable everywhere right away.
enum TextReplacementSync {
    struct SystemReplacement: Equatable {
        var shortcut: String
        var text: String
        var enabled: Bool
    }

    /// A single canonical entry to write into the activation layer.
    struct ReplacementWrite: Equatable {
        var shortcut: String
        var text: String
    }

    /// Snapshot of both system layers. A `nil` layer means "couldn't be read" and is
    /// treated as unknown rather than empty, so an unreadable layer never causes sync
    /// to think the user's replacements have vanished.
    struct SystemState {
        /// keyboardservicesd's database — persistence and iCloud/iOS propagation.
        var database: [SystemReplacement]?
        /// `NSUserDictionaryReplacementItems` — what the input system reads to expand.
        var preferences: [SystemReplacement]?

        static let empty = SystemState(database: [], preferences: [])

        var readableLayers: [[SystemReplacement]] {
            [database, preferences].compactMap { $0 }
        }

        /// True when every readable layer holds exactly one enabled entry for `shortcut`
        /// with exactly `text`. Anything else — missing from one layer, disabled, stale
        /// text, or duplicated — means the shortcut is not reliably active and must be
        /// rewritten. Requiring *both* layers is what stops a database-only entry (which
        /// never expands on macOS 27) from being reported as already in sync.
        func isSatisfied(shortcut: String, text: String) -> Bool {
            let layers = readableLayers
            guard !layers.isEmpty else { return false }
            return layers.allSatisfy { layer in
                let matches = layer.filter { $0.shortcut.lowercased() == shortcut.lowercased() }
                return matches.count == 1 && matches[0].enabled && matches[0].text == text
            }
        }

        /// Any existing text for `shortcut`, preferring the database (that's the value the
        /// XPC remove side has to match). Used for `oldText` in the plan.
        func existingText(shortcut: String) -> String? {
            for layer in [database, preferences].compactMap({ $0 }) {
                if let match = layer.first(where: { $0.shortcut.lowercased() == shortcut.lowercased() }) {
                    return match.text
                }
            }
            return nil
        }

        func exists(shortcut: String) -> Bool {
            readableLayers.contains { layer in
                layer.contains { $0.shortcut.lowercased() == shortcut.lowercased() }
            }
        }

        /// Shortcuts appearing more than once in a readable layer. Surfaced in the plan
        /// diagnostics because duplicates are how an add-only update used to fail.
        func duplicatedShortcuts() -> [String] {
            var found = Set<String>()
            for layer in readableLayers {
                var counts: [String: Int] = [:]
                for replacement in layer {
                    counts[replacement.shortcut.lowercased(), default: 0] += 1
                }
                for (shortcut, count) in counts where count > 1 { found.insert(shortcut) }
            }
            return found.sorted()
        }
    }

    struct SyncPlan {
        enum Kind { case add, update, remove, skip }

        struct Entry: Identifiable {
            var id: String { shortcut }
            let shortcut: String
            let kind: Kind
            /// True when this shortcut exists in the system store but was NOT created by
            /// Quick Text — a pre-existing overlapping entry. Still classified `.update`
            /// (Quick Text is canonical), but surfaced distinctly in the preview sheet.
            let isConflict: Bool
            let oldText: String?
            let newText: String?
            let phraseTitle: String?
            let phraseID: String?
        }

        var entries: [Entry]
        /// Shortcuts found more than once in a system layer when the plan was computed.
        var duplicates: [String] = []

        var adds: [Entry] { entries.filter { $0.kind == .add } }
        var updates: [Entry] { entries.filter { $0.kind == .update && !$0.isConflict } }
        var conflicts: [Entry] { entries.filter { $0.kind == .update && $0.isConflict } }
        var removals: [Entry] { entries.filter { $0.kind == .remove } }
        var skips: [Entry] { entries.filter { $0.kind == .skip } }
        var isEmpty: Bool { adds.isEmpty && updates.isEmpty && conflicts.isEmpty && removals.isEmpty }
    }

    struct SyncReport {
        var added: [String] = []
        var updated: [String] = []
        var removed: [String] = []
        var overwrittenConflicts: [String] = []
        var skipped: [String] = []
        /// Set when the write failed or didn't verify. The preview sheet's plan is left
        /// unapplied to corpus state (see `CorpusStore.applyTextReplacementSync`) so the
        /// user can retry; `manualInstructions` gives them a way to do it by hand.
        var usedFallback = false
        var manualInstructions: [String] = []
        var failureReason: String?
        /// Stage-by-stage record of what actually happened: XPC availability, the XPC
        /// callback result, the preferences write, per-layer verification, and duplicate
        /// detection. Shown in Settings so a future failure names the stage that broke
        /// instead of just "sync failed".
        var diagnostics: [String] = []

        /// Non-nil on success. Newly written replacements only reach applications that
        /// launch afterwards (see the type doc), so a successful sync still has a caveat
        /// worth showing the user.
        var activationNote: String?

        var summaryLine: String {
            if let failureReason {
                return "Sync failed: \(failureReason)"
            }
            if usedFallback {
                return "Direct sync unavailable — follow the manual steps below."
            }
            return "Added \(added.count), updated \(updated.count) (\(overwrittenConflicts.count) overwritten), removed \(removed.count), skipped \(skipped.count)."
        }
    }

    static let preferencesKey = "NSUserDictionaryReplacementItems"

    /// Shown after every successful sync. Relaunching is genuinely required — see the
    /// type doc's "Activation is per-process" note.
    static let relaunchNote = "Applications read text replacements when they launch. Quit and reopen any app you want to use these in (or log out and back in) — already-running apps won't pick up new shortcuts."

    // MARK: - Reading current system state

    /// Reads both layers. Neither read mutates anything: the database is opened read-only
    /// through the system `sqlite3` client, and preferences are read through CFPreferences.
    static func readSystemState() -> SystemState {
        SystemState(
            database: readSystemReplacementsFromDatabase(),
            preferences: readSystemReplacementsFromPreferences()
        )
    }

    private static func parseSystemReplacements(_ raw: [[String: Any]]) -> [SystemReplacement] {
        raw.compactMap { dict in
            guard let shortcut = dict["replace"] as? String, let phrase = dict["with"] as? String else { return nil }
            return SystemReplacement(shortcut: shortcut, text: phrase, enabled: parseEnabled(dict["on"]))
        }
    }

    /// `on` has been seen as a boolean, an integer, and (when written by `defaults write
    /// -array-add`) a string. Treat anything that isn't explicitly off as on.
    static func parseEnabled(_ value: Any?) -> Bool {
        switch value {
        case nil: return true
        case let flag as Bool: return flag
        case let number as NSNumber: return number.intValue != 0
        case let text as String: return !["0", "false", "no"].contains(text.lowercased())
        default: return true
        }
    }

    /// Reads keyboardservicesd's database through the system sqlite client. This is
    /// read-only: writes still go exclusively through KeyboardServices XPC. Returns nil
    /// if the database can't be read, which the diff treats as "unknown", not "empty".
    private static func readSystemReplacementsFromDatabase() -> [SystemReplacement]? {
        struct Row: Decodable {
            let shortcut: String
            let text: String
        }

        let databaseURL = FileManager.default.homeDirectoryForCurrentUser
            .appendingPathComponent("Library/KeyboardServices/TextReplacements.db")
        let process = Process()
        let output = Pipe()
        let errors = Pipe()
        process.executableURL = URL(fileURLWithPath: "/usr/bin/sqlite3")
        process.arguments = [
            "-readonly",
            "-json",
            databaseURL.path,
            "SELECT ZSHORTCUT AS shortcut, ZPHRASE AS text FROM ZTEXTREPLACEMENTENTRY WHERE COALESCE(ZWASDELETED, 0) = 0"
        ]
        process.standardOutput = output
        process.standardError = errors

        do {
            try process.run()
            let data = output.fileHandleForReading.readDataToEndOfFile()
            process.waitUntilExit()
            guard process.terminationStatus == 0 else { return nil }
            guard !data.isEmpty else { return [] }

            return try JSONDecoder().decode([Row].self, from: data).map {
                SystemReplacement(shortcut: $0.shortcut, text: $0.text, enabled: true)
            }
        } catch {
            return nil
        }
    }

    /// Reads the activation layer. Must use the **any-host** global domain — text
    /// replacements are stored there, so a `kCFPreferencesCurrentHost` read always
    /// returns nil and silently produces an empty array.
    private static func readSystemReplacementsFromPreferences() -> [SystemReplacement]? {
        guard let raw = readPreferenceItems() else { return nil }
        return parseSystemReplacements(raw)
    }

    private static func readPreferenceItems() -> [[String: Any]]? {
        CFPreferencesCopyValue(
            preferencesKey as CFString,
            kCFPreferencesAnyApplication,
            kCFPreferencesCurrentUser,
            kCFPreferencesAnyHost
        ) as? [[String: Any]]
    }

    /// Reads the activation layer from a *fresh* process (`defaults export -g -`). Used
    /// only for verify-after-write: this process's own CFPreferences cache can report a
    /// value it just wrote before the daemon has committed it, so confirming through a
    /// separate process is what actually proves the write landed.
    private static func readPreferencesFromFreshProcess() -> [SystemReplacement]? {
        let process = Process()
        let output = Pipe()
        let errors = Pipe()
        process.executableURL = URL(fileURLWithPath: "/usr/bin/defaults")
        process.arguments = ["export", "-g", "-"]
        process.standardOutput = output
        process.standardError = errors

        do {
            try process.run()
            let data = output.fileHandleForReading.readDataToEndOfFile()
            process.waitUntilExit()
            guard process.terminationStatus == 0 else { return nil }

            guard
                let plist = try PropertyListSerialization.propertyList(from: data, options: [], format: nil) as? [String: Any],
                let raw = plist[preferencesKey] as? [[String: Any]]
            else { return nil }
            return parseSystemReplacements(raw)
        } catch {
            return nil
        }
    }

    // MARK: - Diff computation

    /// Builds the plan of what a sync would do, without writing anything.
    static func computePlan(
        phrases: [Phrase],
        variables: [LibraryVariable],
        managedShortcuts: [String],
        systemState: SystemState
    ) -> SyncPlan {
        var entries: [SyncPlan.Entry] = []
        let managedSet = Set(managedShortcuts.map { $0.lowercased() })
        var seenShortcuts = Set<String>()

        for phrase in phrases {
            guard let link = phrase.textReplacement, link.syncEnabled else { continue }
            let shortcut = TextReplacementSupport.normalizedShortcut(link.shortcut)
            guard !shortcut.isEmpty else { continue }
            let key = shortcut.lowercased()
            seenShortcuts.insert(key)

            guard let resolvedText = TextReplacementSupport.resolvedReplacementText(for: phrase, variables: variables) else {
                // Unresolved placeholders — shouldn't happen if the editor enforced the
                // rule, but never sync an unresolved value if it slips through.
                continue
            }

            if systemState.isSatisfied(shortcut: shortcut, text: resolvedText) {
                entries.append(SyncPlan.Entry(shortcut: shortcut, kind: .skip, isConflict: false, oldText: resolvedText, newText: resolvedText, phraseTitle: phrase.title, phraseID: phrase.id))
            } else if systemState.exists(shortcut: shortcut) {
                // Present but not reliably active: wrong text, disabled, duplicated, or
                // missing from one of the two layers.
                let isConflict = !managedSet.contains(key)
                entries.append(SyncPlan.Entry(shortcut: shortcut, kind: .update, isConflict: isConflict, oldText: systemState.existingText(shortcut: shortcut), newText: resolvedText, phraseTitle: phrase.title, phraseID: phrase.id))
            } else {
                entries.append(SyncPlan.Entry(shortcut: shortcut, kind: .add, isConflict: false, oldText: nil, newText: resolvedText, phraseTitle: phrase.title, phraseID: phrase.id))
            }
        }

        for managed in managedShortcuts {
            let key = managed.lowercased()
            guard !seenShortcuts.contains(key) else { continue }
            guard systemState.exists(shortcut: managed) else { continue }
            entries.append(SyncPlan.Entry(shortcut: managed, kind: .remove, isConflict: false, oldText: systemState.existingText(shortcut: managed), newText: nil, phraseTitle: nil, phraseID: nil))
        }

        return SyncPlan(entries: entries, duplicates: systemState.duplicatedShortcuts())
    }

    // MARK: - Applying a plan

    /// Applies `plan` to both system layers. If any stage fails or verification finds a
    /// mismatch, falls back to manual instructions rather than reporting false success.
    /// Returns the updated `managedReplacementShortcuts` list for the caller to persist.
    ///
    /// - Important: **Never call this on the main thread.** It blocks for up to 8s waiting
    ///   on the KeyboardServices reply and then polls verification for a few seconds more,
    ///   which would freeze the UI. `CorpusStore.applyTextReplacementSync` dispatches it
    ///   correctly and delivers the report back on the main queue; go through it.
    static func apply(_ plan: SyncPlan, currentManagedShortcuts: [String]) -> (report: SyncReport, managedShortcuts: [String]) {
        guard !plan.isEmpty else {
            return (SyncReport(), currentManagedShortcuts)
        }

        var diagnostics: [String] = []
        if let report = applyDirect(plan, diagnostics: &diagnostics) {
            let managed = nextManagedShortcuts(plan: plan, current: currentManagedShortcuts, appliedDirect: true)
            return (report, managed)
        }

        var report = manualInstructionsReport(plan)
        report.diagnostics = diagnostics
        // Nothing verified — managed shortcuts (and corpus lastSyncedAt/lastSyncedValue,
        // handled by the caller) stay untouched until a sync actually lands.
        return (report, currentManagedShortcuts)
    }

    private static func nextManagedShortcuts(plan: SyncPlan, current: [String], appliedDirect: Bool) -> [String] {
        var set = Set(current.map { $0.lowercased() })
        var display: [String: String] = Dictionary(uniqueKeysWithValues: current.map { ($0.lowercased(), $0) })
        for entry in plan.adds + plan.updates + plan.conflicts + plan.skips {
            set.insert(entry.shortcut.lowercased())
            display[entry.shortcut.lowercased()] = entry.shortcut
        }
        if appliedDirect {
            for entry in plan.removals {
                set.remove(entry.shortcut.lowercased())
            }
        }
        return set.sorted().compactMap { display[$0] ?? $0 }
    }

    // MARK: - Layer 1: persistence via KeyboardServices XPC

    enum SyncError: Error {
        case frameworkUnavailable
        case timeout
    }

    private typealias KSCompletion = @convention(block) (NSError?) -> Void
    private typealias KSAddRemoveFn = @convention(c) (AnyObject, Selector, NSArray?, NSArray?, @escaping KSCompletion) -> Void

    /// Talks to `keyboardservicesd` via the private `_KSTextReplacementClientStore` XPC
    /// client — the same path System Settings uses. This is what persists the entry and
    /// propagates it to iOS through iCloud. It is **not** sufficient on its own on macOS
    /// 27: it no longer publishes to the activation layer (see the type doc).
    ///
    /// The completion handler hands back an `NSError` in `KSTextReplacementErrorDomain`
    /// with code 0 on success, so only a non-zero code counts as a failure.
    private static func ksTransact(
        add: [(shortcut: String, phrase: String)],
        remove: [(shortcut: String, phrase: String)],
        completion: @escaping (Error?) -> Void
    ) {
        guard dlopen("/System/Library/PrivateFrameworks/KeyboardServices.framework/KeyboardServices", RTLD_NOW) != nil,
              let storeClass = NSClassFromString("_KSTextReplacementClientStore") as? NSObject.Type,
              let entryClass = NSClassFromString("_KSTextReplacementEntry") as? NSObject.Type
        else { completion(SyncError.frameworkUnavailable); return }

        func entry(_ s: String, _ p: String) -> NSObject {
            let e = entryClass.init()
            e.setValue(s, forKey: "shortcut")
            e.setValue(p, forKey: "phrase")
            return e
        }
        let store = storeClass.init()
        let sel = NSSelectorFromString("addEntries:removeEntries:withCompletionHandler:")
        guard store.responds(to: sel), let method = store.method(for: sel) else {
            completion(SyncError.frameworkUnavailable)
            return
        }
        let fn = unsafeBitCast(method, to: KSAddRemoveFn.self)
        // `store` owns the XPC connection carrying this request. Capturing it in the
        // completion block keeps it alive until the reply arrives — without this, ARC
        // releases the store as soon as this function returns, the connection is torn
        // down mid-flight, and the handler is never called, so every sync fails with a
        // timeout. It only looked like an OS problem because a command-line spike waits
        // inside the same scope that holds the store and therefore can't hit this.
        let block: KSCompletion = { err in
            withExtendedLifetime(store) {
                completion((err?.code ?? 0) != 0 ? err : nil)
            }
        }
        fn(store, sel,
           add.isEmpty ? nil : add.map { entry($0.shortcut, $0.phrase) } as NSArray,
           remove.isEmpty ? nil : remove.map { entry($0.shortcut, $0.phrase) } as NSArray,
           block)
    }

    /// Blocking wrapper around `ksTransact` (the app's sync flow is a single modal
    /// "Sync Now" action, so a bounded wait on a background-delivered completion handler
    /// is simpler than threading async/await through `CorpusStore`).
    private static func ksTransactSync(add: [(shortcut: String, phrase: String)], remove: [(shortcut: String, phrase: String)]) -> Error? {
        let semaphore = DispatchSemaphore(value: 0)
        var result: Error?
        ksTransact(add: add, remove: remove) { error in
            result = error
            semaphore.signal()
        }
        if semaphore.wait(timeout: .now() + 8) == .timedOut {
            return SyncError.timeout
        }
        return result
    }

    private static func keyboardServicesAvailable() -> Bool {
        dlopen("/System/Library/PrivateFrameworks/KeyboardServices.framework/KeyboardServices", RTLD_NOW) != nil
            && NSClassFromString("_KSTextReplacementClientStore") != nil
            && NSClassFromString("_KSTextReplacementEntry") != nil
    }

    // MARK: - Layer 2: activation via global preferences

    /// Pure merge used by `writePreferences`. Entries whose shortcut isn't targeted are
    /// passed through **verbatim** (including any keys we don't know about), so the
    /// user's unmanaged replacements survive untouched. Every entry matching a targeted
    /// shortcut is dropped first and a single canonical entry appended, which is what
    /// collapses pre-existing duplicates instead of adding another one.
    static func mergedPreferenceItems(
        existing: [[String: Any]],
        upserts: [ReplacementWrite],
        removals: [String]
    ) -> [[String: Any]] {
        let targeted = Set(upserts.map { $0.shortcut.lowercased() } + removals.map { $0.lowercased() })
        var result = existing.filter { item in
            guard let shortcut = item["replace"] as? String else { return true }
            return !targeted.contains(shortcut.lowercased())
        }
        for upsert in upserts {
            // `on` is written as an integer to match every entry System Settings creates.
            result.append(["replace": upsert.shortcut, "with": upsert.text, "on": 1])
        }
        return result
    }

    /// Read-modify-writes `NSUserDictionaryReplacementItems` in the global any-host
    /// domain. Returns a diagnostic line, or throws-by-returning-nil semantics via
    /// `problem`. Refuses to write when the current array reads back as empty while the
    /// database says replacements exist — that combination means the read failed, and
    /// writing then would wipe the user's replacements.
    private static func writePreferences(
        upserts: [ReplacementWrite],
        removals: [String],
        databaseCount: Int?
    ) -> (ok: Bool, diagnostic: String) {
        guard let existing = readPreferenceItems() else {
            return (false, "Preferences write skipped: could not read \(preferencesKey).")
        }
        if existing.isEmpty, let databaseCount, databaseCount > 0 {
            return (false, "Preferences write refused: \(preferencesKey) read back empty while the database holds \(databaseCount) entries — refusing to overwrite.")
        }

        let merged = mergedPreferenceItems(existing: existing, upserts: upserts, removals: removals)
        CFPreferencesSetValue(
            preferencesKey as CFString,
            merged as CFArray,
            kCFPreferencesAnyApplication,
            kCFPreferencesCurrentUser,
            kCFPreferencesAnyHost
        )
        let synchronized = CFPreferencesSynchronize(kCFPreferencesAnyApplication, kCFPreferencesCurrentUser, kCFPreferencesAnyHost)
        guard synchronized else {
            return (false, "Preferences write failed: CFPreferencesSynchronize returned false.")
        }
        return (true, "Preferences write: \(existing.count) → \(merged.count) entries (\(upserts.count) upserted, \(removals.count) removed).")
    }

    // MARK: - Write + verify

    /// What the XPC transaction should remove. An update is an add-new + remove-old
    /// transaction: adding the new value alone creates a duplicate shortcut in
    /// KeyboardServices instead of replacing the old entry.
    ///
    /// The exception is an update whose old and new text are identical — that happens when
    /// the database is already correct and only the activation layer is missing the entry
    /// (the macOS 27 divergence). There the removal has nothing to undo, and sending
    /// add-and-remove for the same entry in one transaction risks the daemon cancelling
    /// the add and deleting a perfectly good entry.
    static func xpcRemovals(for plan: SyncPlan) -> [ReplacementWrite] {
        var removals: [ReplacementWrite] = []
        for entry in plan.updates + plan.conflicts {
            guard let oldText = entry.oldText, oldText != entry.newText else { continue }
            removals.append(ReplacementWrite(shortcut: entry.shortcut, text: oldText))
        }
        for entry in plan.removals {
            guard let oldText = entry.oldText else { continue }
            removals.append(ReplacementWrite(shortcut: entry.shortcut, text: oldText))
        }
        return removals
    }

    /// Returns nil if the write couldn't be completed or verified, signaling the caller to
    /// fall back to manual instructions. A `SyncReport` here means both layers verified.
    private static func applyDirect(_ plan: SyncPlan, diagnostics: inout [String]) -> SyncReport? {
        var report = SyncReport()

        if !plan.duplicates.isEmpty {
            diagnostics.append("Duplicate shortcuts found before write: \(plan.duplicates.joined(separator: ", ")).")
        }

        let writeEntries = plan.adds + plan.updates + plan.conflicts
        let upserts = writeEntries.compactMap { entry -> ReplacementWrite? in
            guard let newText = entry.newText else { return nil }
            return ReplacementWrite(shortcut: entry.shortcut, text: newText)
        }
        let xpcRemovals = xpcRemovals(for: plan).map { (shortcut: $0.shortcut, phrase: $0.text) }
        let preferenceRemovals = plan.removals.map(\.shortcut)

        // Stage 1 — persistence (and iCloud/iOS propagation) via KeyboardServices XPC.
        let available = keyboardServicesAvailable()
        diagnostics.append("KeyboardServices XPC available: \(available ? "yes" : "no").")
        guard available else {
            report.failureReason = "KeyboardServices framework unavailable."
            return nil
        }

        let xpcAdds = upserts.map { (shortcut: $0.shortcut, phrase: $0.text) }
        if let error = ksTransactSync(add: xpcAdds, remove: xpcRemovals) {
            diagnostics.append("XPC transaction failed: \(error.localizedDescription).")
            report.failureReason = "KeyboardServices XPC transaction failed: \(error.localizedDescription)"
            return nil
        }
        diagnostics.append("XPC transaction succeeded (\(xpcAdds.count) added, \(xpcRemovals.count) removed).")

        // Stage 2 — activation via the global preferences projection. Required on macOS
        // 27: the XPC write above no longer publishes here, and an entry missing here
        // never expands no matter what the database says.
        let databaseCount = readSystemReplacementsFromDatabase()?.count
        let preferencesWrite = writePreferences(upserts: upserts, removals: preferenceRemovals, databaseCount: databaseCount)
        diagnostics.append(preferencesWrite.diagnostic)
        guard preferencesWrite.ok else {
            report.failureReason = preferencesWrite.diagnostic
            return nil
        }

        // Stage 3 — verify both layers from outside this process.
        var problems: [String] = ["verification did not run"]
        var verified = false
        for _ in 0..<6 {
            Thread.sleep(forTimeInterval: 0.5)
            problems = verificationProblems(for: plan)
            if problems.isEmpty {
                verified = true
                break
            }
        }
        diagnostics.append(verified ? "Verified in both the database and a fresh preferences read." : "Verification failed: \(problems.joined(separator: "; ")).")

        guard verified else {
            report.failureReason = "Verification after write failed: \(problems.joined(separator: "; "))"
            return nil
        }

        for entry in writeEntries {
            if entry.kind == .add {
                report.added.append(entry.shortcut)
            } else if entry.isConflict {
                report.overwrittenConflicts.append(entry.shortcut)
            } else {
                report.updated.append(entry.shortcut)
            }
        }
        report.removed = plan.removals.map(\.shortcut)
        report.skipped = plan.skips.map(\.shortcut)
        report.diagnostics = diagnostics
        report.activationNote = relaunchNote
        return report
    }

    /// Re-reads both layers from outside this process and returns everything that doesn't
    /// match the plan. Empty means the sync genuinely landed. The preferences side is read
    /// from a fresh `defaults` process because this process's own cache can echo back a
    /// value it wrote before the daemon committed it.
    static func verificationProblems(for plan: SyncPlan) -> [String] {
        guard let database = readSystemReplacementsFromDatabase() else {
            return ["could not read the KeyboardServices database"]
        }
        guard let preferences = readPreferencesFromFreshProcess() else {
            return ["could not read \(preferencesKey) from a fresh process"]
        }
        return verificationProblems(for: plan, database: database, preferences: preferences)
    }

    /// Pure verification against two supplied layer snapshots, so the rules can be tested
    /// without touching the live system.
    static func verificationProblems(
        for plan: SyncPlan,
        database: [SystemReplacement],
        preferences: [SystemReplacement]
    ) -> [String] {
        var problems: [String] = []

        for (layerName, layer) in [("database", database), ("preferences", preferences)] {
            var byShortcut: [String: [SystemReplacement]] = [:]
            for replacement in layer {
                byShortcut[replacement.shortcut.lowercased(), default: []].append(replacement)
            }

            for entry in plan.adds + plan.updates + plan.conflicts {
                guard let newText = entry.newText else { continue }
                let matches = byShortcut[entry.shortcut.lowercased()] ?? []
                if matches.isEmpty {
                    problems.append("\(entry.shortcut) missing from \(layerName)")
                } else if matches.count > 1 {
                    problems.append("\(entry.shortcut) duplicated in \(layerName)")
                } else if matches[0].text != newText {
                    problems.append("\(entry.shortcut) has stale text in \(layerName)")
                } else if !matches[0].enabled {
                    problems.append("\(entry.shortcut) is disabled in \(layerName)")
                }
            }
            for entry in plan.removals where byShortcut[entry.shortcut.lowercased()] != nil {
                problems.append("\(entry.shortcut) still present in \(layerName)")
            }
        }
        return problems
    }

    // MARK: - Manual instructions fallback

    /// Plist drag-import into System Settings > Keyboard > Text Replacements is confirmed
    /// broken (shows drag feedback, imports nothing) — do not build that path. If the
    /// write fails, corpus state is left untouched (see `CorpusStore.applyTextReplacementSync`)
    /// and the user is shown exactly what to change by hand, plus a shortcut to open the
    /// right System Settings pane.
    private static func manualInstructionsReport(_ plan: SyncPlan) -> SyncReport {
        var report = SyncReport()
        report.usedFallback = true

        var lines: [String] = []
        for entry in plan.adds {
            lines.append("Add: \"\(entry.shortcut)\" → \(entry.newText ?? "")")
        }
        for entry in plan.updates + plan.conflicts {
            lines.append("Change: \"\(entry.shortcut)\" → \(entry.newText ?? "")")
        }
        for entry in plan.removals {
            lines.append("Delete: \"\(entry.shortcut)\"")
        }
        report.manualInstructions = lines
        report.skipped = plan.skips.map(\.shortcut)
        return report
    }

    /// Opens System Settings > Keyboard > Text Replacements directly.
    static func openSystemSettingsTextReplacements() {
        guard let url = URL(string: "x-apple.systempreferences:com.apple.Keyboard-Settings.extension") else { return }
        NSWorkspace.shared.open(url)
    }
}
