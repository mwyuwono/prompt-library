# Text Replacement Sync — Implementation Plan

Goal: keep macOS/iOS text replacements (System Settings > Keyboard > Text Replacements) in sync with Quick Text phrases. **Quick Text is canonical.** A Sync button in the Mac app's Settings panel pushes changes; per-phrase toggle opts phrases in.

Decisions already made (do not revisit):

- **New field, keep `tags`.** Add a `textReplacement` object per phrase; `tags` remain general search labels.
- **Sync method:** direct write to the system store (automatic, syncs to iOS via iCloud), with plist export as fallback if the direct write fails.
- **Removal:** turning a phrase's toggle off (or deleting the phrase) removes its managed replacement on next sync. Unmanaged replacements (`omw`, `m@`, `mbma`, etc.) are NEVER touched.
- **Variables:** phrases containing unresolved fill-in variables cannot enable sync (toggle disabled with explanation). Canned library variables (`type == "value"`) are resolved inline before syncing.
- **Shorthand convention (see below):** all managed shortcuts follow `x` + descriptive suffix. Existing replacements are renamed to the convention during migration.

---

## Shorthand format convention

**Format: `x` + lowercase descriptive suffix.** Regex: `^x[a-z]{2,11}$` (3–12 chars total, letters only, no digits/punctuation/whitespace).

Why `x`: almost no English words start with it (no accidental expansion), it's on the home row's reachable bottom row on both Mac and iOS keyboards, and it reads as a deliberate "command" sigil. Suffix rules:

- One token describing the phrase's action or object: `xsum`, `xmeta`, `xapprove`.
- Prefer verbs for workflow phrases (`xpush`, `xlearn`), nouns for content inserts (`xhoa`).
- Keep suffixes short but unambiguous; avoid two shortcuts differing by one letter.

Enforcement: PhraseEditor validates managed shortcuts against the regex (hard error on whitespace/uniqueness as before; convention violation is a **warning with an auto-suggested conforming shortcut**, not a block — the user may keep a legacy shortcut deliberately). `validate-corpus.mjs` emits the same warning. Unmanaged personal snippets in System Settings (`m@`, `mwy`, `omw`, addresses) are exempt — the convention governs only Quick Text–managed shortcuts.

### Rename mapping (applied by migration; first sync removes old shortcut, adds new)

| Old shortcut | New shortcut | Phrase |
|---|---|---|
| llmsum | xsum | Summarize all context from this chat |
| llmmeta | xmeta | Write a prompt that... |
| llmformat | xformat | Restate for an LLM |
| llmlearn | xlearn | Capture durable learnings |
| llmnoise | xnoise | Minimize AI artifacts |
| llmapprove | xapprove | Approve proposed actions |
| nointro | xnointro | Avoid commentary & filler |
| nocontext | xcontext | Respond with full task context |
| noneg | xnoneg | Restate as positive instructions |
| nofiles | xnofiles | Responses must be portable |
| ptext | xprose | Prose formatting only. No lists. |
| samefiles | xsamefiles | Same attachments provided |
| subjectagnostic | xreuse | Turn a chat into a reusable prompt |
| compush | xpush | Github: Commit, Push, Merge |
| bfwf | xbfwf | Bullfinch Watch Folder |
| ehoa | xhoa | HOA Members |

Implementer: treat this table as data for the migration script; if the user edits a suggestion before running it, use the edited value. Note the rename mechanics: renames need no special code path — the old shortcut is seeded into `managedReplacementShortcuts`, so the standard diff removes it and adds the new one (both shown in the preview sheet).

## Phase 1 — Data model

`Models.swift`:

```swift
struct TextReplacementLink: Codable, Equatable {
    var shortcut: String          // e.g. "llmsum" — the shorthand typed to expand
    var syncEnabled: Bool
    var lastSyncedAt: Date?       // set by sync engine
    var lastSyncedValue: String?  // resolved value at last sync, for drift detection
}

// On Phrase (optional so existing corpus files still decode — follow the
// existing pattern used by `atoms`, `cardWidth`, etc.):
var textReplacement: TextReplacementLink? = nil
```

Corpus-level sync bookkeeping on `Settings` (optional fields, same decode-compat pattern):

```swift
var textReplacementLastSyncAt: Date? = nil
// Shortcuts this app created/manages in the system store. Needed so sync can
// remove entries after a toggle is switched off or a phrase is deleted,
// without ever touching the user's unmanaged replacements.
var managedReplacementShortcuts: [String]? = nil
```

Validation rules (enforce in PhraseEditor and in `scripts/validate-corpus.mjs`):

- `shortcut` non-empty when `syncEnabled == true`.
- Shortcut unique across all phrases (case-insensitive).
- Shortcut has no whitespace; warn if < 3 chars (accidental-expansion risk).
- Warn (don't block) when shortcut doesn't match the convention regex `^x[a-z]{2,11}$`; offer an auto-suggested conforming alternative.
- `syncEnabled` may not be true if the resolved value still contains `{{...}}` after canned-variable resolution.

## Phase 2 — Value resolution helper

Single function used by editor validation, sync engine, and preview:

```swift
/// Returns the phrase value with canned library variables ({{@name}} where
/// type == .value) substituted. Returns nil if unresolved placeholders remain
/// (text/choice library variables or phrase-local {{placeholders}}).
func resolvedReplacementText(for phrase: Phrase, variables: [LibraryVariable]) -> String?
```

Reuse the existing `{{@name}}` resolution logic (see `PhraseVariable.swift` / `ExpandedCard.swift`) — do not re-implement parsing.

## Phase 3 — Sync engine (`TextReplacementSync.swift`, new file)

### 3a. Reading current system state

Read `NSUserDictionaryReplacementItems` from the global defaults domain (this is how `corpus/text-replacements-map.json` was generated; reads are reliable even though writes are not). **Use the any-host domain** — `UserDefaults.standard.array(forKey:)`, not `CFPreferencesCopyValue` with `kCFPreferencesCurrentHost` (the latter always returns `nil` for this key and silently produces an empty array; shipped as a real bug, fixed 2026-07-09). See the "Verify-after-write reliability" note under 3c for a same-process staleness gotcha on the read side.

### 3b. Diff computation

Inputs: corpus phrases, library variables, `managedReplacementShortcuts`, current system entries.

Output a `SyncPlan`:

- **add**: toggle on, shortcut absent from system.
- **update**: toggle on, shortcut present, system replacement text ≠ resolved phrase value.
- **remove**: shortcut in `managedReplacementShortcuts` but no longer has a toggle-on phrase.
- **conflict**: toggle on, shortcut exists in system but is NOT in `managedReplacementShortcuts` and its text differs (a pre-existing user entry). Policy: Quick Text is canonical → classify as update, but flag it in the preview so the user sees it will be overwritten. First sync after migration will adopt the 15+ existing overlapping entries this way — expected.
- **skip/noop**: toggle on, system text already matches.

### 3c. Writing — direct method (VERIFIED WORKING on macOS 26.5.1, 2026-07-09)

**Do NOT write to `TextReplacements.db` or `NSUserDictionaryReplacementItems` — both are daemon-owned downstream stores and direct writes are overwritten or ignored.** The verified mechanism is the private KeyboardServices XPC client API, which transacts with `keyboardservicesd` (the same path System Settings uses). End-to-end verification performed: XPC add → entry appeared in both defaults cache and db without any manual refresh → typing the shortcut in TextEdit expanded correctly → XPC remove → entry gone from both stores. iCloud sync is handled by the daemon automatically. No entitlements or special permissions were needed (tested as a plain unsigned CLI).

API (from `/System/Library/PrivateFrameworks/KeyboardServices.framework`, verified present with correct selectors at runtime):

- `_KSTextReplacementClientStore` — instantiate with plain `init`.
- `_KSTextReplacementEntry` — plain `init`; set `shortcut` and `phrase` via KVC (`setValue(_:forKey:)`; properties are synthesized).
- `-[_KSTextReplacementClientStore addEntries:removeEntries:withCompletionHandler:]` — adds and removes in one transaction; handler receives `NSError?` (nil or code 0 = success). Pass `nil` for an empty side.
- For **removes**, construct the entry with BOTH the shortcut and its current phrase (matching the reference implementation; verified working this way).
- Updates: reference implementation uses `modifyEntry:toEntry:withCompletionHandler:` for in-place updates; alternatively remove-old + add-new in one `addEntries:removeEntries:` transaction. Implementer: try the single-transaction route first (simpler), verify, fall back to `modifyEntry` if updates misbehave.

Swift access pattern (no bridging header needed):

```swift
private typealias KSCompletion = @convention(block) (NSError?) -> Void
private typealias KSAddRemoveFn = @convention(c) (AnyObject, Selector, NSArray?, NSArray?, @escaping KSCompletion) -> Void

func ksTransact(add: [(shortcut: String, phrase: String)],
                remove: [(shortcut: String, phrase: String)],
                completion: @escaping (Error?) -> Void) {
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
    guard let method = store.method(for: sel) else { completion(SyncError.frameworkUnavailable); return }
    let fn = unsafeBitCast(method, to: KSAddRemoveFn.self)
    let block: KSCompletion = { err in completion((err?.code ?? 0) != 0 ? err : nil) }
    fn(store, sel,
       add.isEmpty ? nil : add.map { entry($0.shortcut, $0.phrase) } as NSArray,
       remove.isEmpty ? nil : remove.map { entry($0.shortcut, $0.phrase) } as NSArray,
       block)
}
```

Reading current state (for diff + verify): `NSUserDefaults` global domain, key `NSUserDictionaryReplacementItems`, entry keys are **`replace`** (shortcut) / **`with`** (phrase) / `on`.

**Verify-after-write reliability (found 2026-07-09):** the ~2s cache-update estimate below does NOT hold for a re-read from the same process that issued the XPC write — that same-process `UserDefaults`/`CFPreferences` snapshot has been observed staying stale for 60+ seconds, even with polling and an explicit `CFPreferencesAppSynchronize(kCFPreferencesAnyApplication)` call before the read. A **fresh process** (new `defaults read -g` invocation, new script) sees the change correctly and immediately — this looks like an in-process cache/notification gap specific to writes made via this XPC path, not a real system-wide propagation delay. Current code (`applyDirect` in `TextReplacementSync.swift`) polls up to ~10s and then falls back to manual instructions on timeout; this is a **safe false negative** (corpus sync-state is only persisted on confirmed success, so nothing corrupts) but means a real successful write can still surface as "Direct sync unavailable" to the user. If revisiting this: the next thing to try is verifying via a freshly-spawned helper process rather than more same-process polling/synchronize calls, since neither of those reliably closed the gap when tried.

Timeout the completion handler wait (reference uses 3s; use 5–8s) — treat timeout as failure.

A working ObjC proof (compiled + verified on this Mac) is at `/tmp/qt-sync-spike/kstest.m` (tmp — may not survive reboot); pre-experiment backups of the db and global defaults are in the same folder.

Side note for the implementer: the daemon treats iCloud as authoritative and will resurrect the cloud set on its next sync — this is why past attempts to "edit the db directly" appeared to work then reverted, and why a stale restored db healed itself to 33 entries during verification. Never fight the daemon; only talk to it via this API.

### 3d. Fallback — manual instructions (plist drag-import is BROKEN on macOS 26)

Tested: dragging a `{phrase, shortcut, on}` plist into System Settings > Keyboard > Text Replacements shows drag feedback but imports nothing. Do not build the plist path. If the direct mechanism fails (class/selector missing after an OS update, XPC error, or verify mismatch):

1. Mark sync failed; keep corpus state untouched (don't update `lastSyncedAt`/managed set for unconfirmed changes).
2. Show the SyncPlan as explicit manual instructions (add/change/delete lines) plus a button to open System Settings > Keyboard > Text Replacements (`x-apple.systempreferences:com.apple.Keyboard-Settings.extension`).

### 3e. Sync report

Return a summary: counts + per-shortcut lines for added / updated / removed / overwritten-conflicts / skipped. Update `lastSyncedAt`/`lastSyncedValue` on each phrase, `managedReplacementShortcuts`, and `textReplacementLastSyncAt`, then persist via `CorpusStore` (respect the existing self-write hash guard in `writeCorpus()` so the file watcher doesn't loop).

## Phase 4 — UI

### PhraseEditor (`PhraseEditor.swift`)

New "Text Replacement" group under the existing tags field:

- **Shortcut** text field (monospaced), with inline validation (uniqueness, whitespace, emptiness).
- **Sync to macOS/iOS** toggle.
- Toggle on with empty shortcut → focus the shortcut field with a prompt ("Enter the shorthand to type, e.g. llmsum"); keep toggle visually pending until a valid shortcut exists. Suggest the first tag as a default if one looks shortcut-like (single token, no spaces).
- Phrase has unresolved variables → toggle disabled, caption: "Phrases with fill-in variables can't sync as static text replacements."
- When synced, show a subtle status line: "Synced ✓ <relative time>" or "Out of sync — value changed since last sync" (compare `lastSyncedValue` to current resolved value).

### SettingsEditor (`SettingsEditor.swift`)

New `settingsSection("Text Replacements")`:

- "**Sync Now**" button → runs diff → presents a preview sheet (the SyncPlan: what will be added/updated/removed/overwritten) → Confirm applies. Never write without showing the preview.
- Last sync timestamp + count of managed shortcuts.
- If the last sync used the plist fallback, show that state and a "Re-export plist" button.

Follow existing `settingsSection` / `FloatingPanel` styling; no new visual patterns.

### Web component

Out of scope — the browser cannot write macOS settings. Only requirement: `quick-text.js` and `export-public-corpus.mjs` must tolerate (pass through / strip for public export) the new `textReplacement` field. Strip it from the public export like other private metadata.

## Phase 5 — Migration (one-time script, `scripts/seed-replacement-links.mjs`)

Seed from `corpus/text-replacements-map.json` and the rename-mapping table above:

- For each `tag_exact` match (15): set `textReplacement = { shortcut: <NEW conforming shortcut from the table>, syncEnabled: true }` on the phrase, and add the **old** shortcut to `managedReplacementShortcuts` so the first sync removes the legacy entry and adds the new one (both visible in the preview).
- `value_exact` matches (e.g. `ehoa` → HOA Members): same treatment — link with the new shortcut (`xhoa`), seed old shortcut for removal.
- `value_contains` matches (`mbh`, `mp`, `sb`, `qsb`, `mwy`, `w-y`): DO NOT link — these are substring coincidences, not equivalents. Leave for manual decision.
- Duplicate targets: `llmnoise` matches two phrases (`image-quality-llmnoise` tag_exact + `phrase-1783371344` value_exact) — link only the tag_exact one. Same rule anywhere one shortcut matches multiple phrases: tag_exact wins, otherwise skip and report.
- Print a report of what was linked and what was skipped. Run `npm run quicktext:validate` after.

Delete this script when migration is confirmed done (per repo documentation-hygiene rules).

## Phase 6 — Validator + docs

- Extend `scripts/validate-corpus.mjs`: shortcut uniqueness, non-empty when enabled, no unresolved placeholders when enabled.
- Update `quick-text/README.md` with a short "Text replacement sync" section (field schema, shorthand convention, sync semantics, fallback path). No other docs.

## Verification checklist (implementer must complete)

1. `swift build` clean; app decodes existing corpus (all optional fields).
2. Toggle validations: empty shortcut prompt, duplicate rejection, variable-phrase block.
3. Run migration script → validate → inspect diff of `quick-text.json`.
4. Sync Now with a throwaway test shortcut (e.g. `qttest1`) → confirm it appears in System Settings > Keyboard > Text Replacements and expands when typed on the Mac.
5. Toggle it off → Sync Now → confirm removal from System Settings; confirm `omw`/`m@` untouched.
5b. After the real first sync: typing an old shortcut (`llmsum`) no longer expands; the new one (`xsum`) does.
6. Force the fallback path (e.g. temporarily point the engine at a bogus db path) → confirm plist exports and imports correctly by drag.
7. iOS propagation: user checks iPhone after a few minutes (iCloud sync latency; can't be automated).
8. `npm run quicktext:validate` and `npm run quicktext:export-public` pass; public export contains no `textReplacement` fields.

## Risks (state these to the user, don't hide)

- **Direct-write mechanism is undocumented.** Apple can change the db schema or sync behavior in any macOS release. The fallback plist path is the durable escape hatch; verification-after-write catches silent failures.
- **iCloud sync latency/reliability** between Mac and iOS is Apple's, not ours; historically flaky.
- First sync intentionally overwrites the ~15 pre-existing overlapping replacements with the (newer, refined) Quick Text values — the preview sheet makes this visible before it happens.

## Suggested implementation order

1. Phase 1 + 2 (model + resolver) — small, testable.
2. Phase 4 PhraseEditor UI (works standalone: fields persist even before sync exists).
3. Phase 3 sync engine + Phase 4 SettingsEditor.
4. Phase 5 migration, Phase 6 validator/docs, then full verification checklist.
