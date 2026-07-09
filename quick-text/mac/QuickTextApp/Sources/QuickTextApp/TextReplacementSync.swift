import Foundation
import AppKit

/// Syncs Quick Text phrases with `syncEnabled` text replacements to the macOS/iOS
/// system Text Replacement store (System Settings > Keyboard > Text Replacements).
/// See docs/text-replacement-sync-plan.md for the full design. Quick Text is
/// canonical: this only ever touches shortcuts it created (`managedReplacementShortcuts`)
/// plus whatever a `SyncPlan` explicitly lists, never the user's other personal entries.
enum TextReplacementSync {
    struct SystemReplacement: Equatable {
        var shortcut: String
        var text: String
        var enabled: Bool
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
        /// Set when the direct XPC write failed or didn't verify. The preview sheet's
        /// plan is left unapplied to corpus state (see `CorpusStore.applyTextReplacementSync`)
        /// so the user can retry; `manualInstructions` gives them a way to do it by hand
        /// in the meantime (plist drag-import is broken on macOS 26 — see Phase 3d).
        var usedFallback = false
        var manualInstructions: [String] = []
        var failureReason: String?

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

    // MARK: - 3a. Reading current system state

    /// Reads `NSUserDictionaryReplacementItems` from the global preferences domain
    /// (equivalent to `defaults read -g NSUserDictionaryReplacementItems`) — a
    /// read-only operation. This is also how writes are verified: a successful XPC
    /// transaction is reflected here within ~2s.
    static func readSystemReplacements() -> [SystemReplacement] {
        guard let raw = CFPreferencesCopyValue(
            "NSUserDictionaryReplacementItems" as CFString,
            "Apple Global Domain" as CFString,
            kCFPreferencesCurrentUser,
            kCFPreferencesCurrentHost
        ) as? [[String: Any]] else { return [] }

        return raw.compactMap { dict in
            guard let shortcut = dict["replace"] as? String, let phrase = dict["with"] as? String else { return nil }
            let enabled = (dict["on"] as? Bool) ?? true
            return SystemReplacement(shortcut: shortcut, text: phrase, enabled: enabled)
        }
    }

    // MARK: - 3b. Diff computation

    /// Builds the plan of what a sync would do, without writing anything.
    static func computePlan(
        phrases: [Phrase],
        variables: [LibraryVariable],
        managedShortcuts: [String],
        systemReplacements: [SystemReplacement]
    ) -> SyncPlan {
        var entries: [SyncPlan.Entry] = []
        let managedSet = Set(managedShortcuts.map { $0.lowercased() })
        var systemByShortcut: [String: SystemReplacement] = [:]
        for replacement in systemReplacements {
            systemByShortcut[replacement.shortcut.lowercased()] = replacement
        }

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

            if let existing = systemByShortcut[key] {
                if existing.text == resolvedText {
                    entries.append(SyncPlan.Entry(shortcut: shortcut, kind: .skip, isConflict: false, oldText: existing.text, newText: resolvedText, phraseTitle: phrase.title, phraseID: phrase.id))
                } else {
                    let isConflict = !managedSet.contains(key)
                    entries.append(SyncPlan.Entry(shortcut: shortcut, kind: .update, isConflict: isConflict, oldText: existing.text, newText: resolvedText, phraseTitle: phrase.title, phraseID: phrase.id))
                }
            } else {
                entries.append(SyncPlan.Entry(shortcut: shortcut, kind: .add, isConflict: false, oldText: nil, newText: resolvedText, phraseTitle: phrase.title, phraseID: phrase.id))
            }
        }

        for managed in managedShortcuts {
            let key = managed.lowercased()
            guard !seenShortcuts.contains(key) else { continue }
            let existing = systemByShortcut[key]
            entries.append(SyncPlan.Entry(shortcut: managed, kind: .remove, isConflict: false, oldText: existing?.text, newText: nil, phraseTitle: nil, phraseID: nil))
        }

        return SyncPlan(entries: entries)
    }

    // MARK: - 3c/3d. Applying a plan

    /// Applies `plan` to the system store via the KeyboardServices XPC client
    /// (`ksTransact`). If the framework/selectors are unavailable, the transaction
    /// errors, or verify-after-write finds a mismatch, falls back to manual
    /// instructions rather than reporting false success. Returns the updated
    /// `managedReplacementShortcuts` list for the caller to persist (via `CorpusStore`).
    static func apply(_ plan: SyncPlan, currentManagedShortcuts: [String]) -> (report: SyncReport, managedShortcuts: [String]) {
        guard !plan.isEmpty else {
            return (SyncReport(), currentManagedShortcuts)
        }

        if let report = applyDirect(plan) {
            let managed = nextManagedShortcuts(plan: plan, current: currentManagedShortcuts, appliedDirect: true)
            return (report, managed)
        }

        let report = manualInstructionsReport(plan)
        // Nothing was written — managed shortcuts (and corpus lastSyncedAt/lastSyncedValue,
        // handled by the caller) stay untouched until a sync actually lands.
        return (report, currentManagedShortcuts)
    }

    private static func nextManagedShortcuts(plan: SyncPlan, current: [String], appliedDirect: Bool) -> [String] {
        var set = Set(current.map { $0.lowercased() })
        var display: [String: String] = Dictionary(uniqueKeysWithValues: current.map { ($0.lowercased(), $0) })
        for entry in plan.adds + plan.updates + plan.conflicts {
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

    // MARK: - Direct write via KeyboardServices XPC

    enum SyncError: Error {
        case frameworkUnavailable
        case timeout
    }

    private typealias KSCompletion = @convention(block) (NSError?) -> Void
    private typealias KSAddRemoveFn = @convention(c) (AnyObject, Selector, NSArray?, NSArray?, @escaping KSCompletion) -> Void

    /// Talks to `keyboardservicesd` via the private `_KSTextReplacementClientStore`
    /// XPC client — the same path System Settings itself uses. Verified end-to-end
    /// on macOS 26.5.1 (2026-07-09): add propagates to both the defaults cache and
    /// `TextReplacements.db` with no manual refresh, and the shortcut expands when
    /// typed. Never write to the db or `NSUserDictionaryReplacementItems` directly —
    /// the daemon treats iCloud as authoritative and will silently revert those.
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
        let block: KSCompletion = { err in completion((err?.code ?? 0) != 0 ? err : nil) }
        fn(store, sel,
           add.isEmpty ? nil : add.map { entry($0.shortcut, $0.phrase) } as NSArray,
           remove.isEmpty ? nil : remove.map { entry($0.shortcut, $0.phrase) } as NSArray,
           block)
    }

    /// Blocking wrapper around `ksTransact` (the app's sync flow is a single modal
    /// "Sync Now" action, so a bounded wait on a background-delivered completion
    /// handler is simpler than threading async/await through `CorpusStore`).
    /// Times out after 8s per the plan (reference implementation used 3s).
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

    /// Returns nil if the direct write couldn't be attempted/verified at all, signaling
    /// the caller to fall back to manual instructions. A `SyncReport` here means the
    /// XPC transaction succeeded AND verify-after-write confirmed every change landed.
    private static func applyDirect(_ plan: SyncPlan) -> SyncReport? {
        var report = SyncReport()

        let addRemoveEntries = plan.adds + plan.updates + plan.conflicts
        let toAdd = addRemoveEntries.compactMap { entry -> (shortcut: String, phrase: String)? in
            guard let newText = entry.newText else { return nil }
            return (entry.shortcut, newText)
        }
        // Removes need the shortcut AND its current phrase on the entry (matches the
        // reference implementation) — use what's currently in the system store.
        let toRemove = plan.removals.compactMap { entry -> (shortcut: String, phrase: String)? in
            guard let oldText = entry.oldText else { return nil }
            return (entry.shortcut, oldText)
        }

        if let error = ksTransactSync(add: toAdd, remove: toRemove) {
            report.failureReason = "KeyboardServices XPC transaction failed: \(error.localizedDescription)"
            return nil
        }

        for entry in addRemoveEntries {
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

        // The defaults cache updates within ~2s of a successful XPC transaction.
        Thread.sleep(forTimeInterval: 2)

        guard verifyAfterWrite(plan) else {
            report.failureReason = "Verification after write found mismatches — falling back to manual instructions."
            return nil
        }

        return report
    }

    /// Re-reads system state and confirms every planned add/update/removal landed.
    private static func verifyAfterWrite(_ plan: SyncPlan) -> Bool {
        let after = readSystemReplacements()
        var byShortcut: [String: SystemReplacement] = [:]
        for replacement in after { byShortcut[replacement.shortcut.lowercased()] = replacement }

        for entry in plan.adds + plan.updates + plan.conflicts {
            guard let newText = entry.newText,
                  let landed = byShortcut[entry.shortcut.lowercased()],
                  landed.text == newText else { return false }
        }
        for entry in plan.removals {
            if byShortcut[entry.shortcut.lowercased()] != nil { return false }
        }
        return true
    }

    // MARK: - 3d. Manual instructions fallback

    /// Plist drag-import into System Settings > Keyboard > Text Replacements is
    /// confirmed broken on macOS 26 (shows drag feedback, imports nothing) — do not
    /// build that path. If the direct XPC write fails, corpus state is left untouched
    /// (see `CorpusStore.applyTextReplacementSync`) and the user is shown exactly what
    /// to change by hand, plus a shortcut to open the right System Settings pane.
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
