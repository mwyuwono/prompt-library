Finish the unfinished "atomic variables" feature in Quick Text (~/Library/Mobile Documents/com~apple~CloudDocs/Projects/prompts-library/quick-text) in a new chat.

## Context

Quick Text phrases live in `quick-text/corpus/quick-text.json` and render in two surfaces: `quick-text/web/quick-text-component/quick-text.js` (buildless Web Component) and `quick-text/mac/QuickTextApp/Sources/QuickTextApp/QuickTextApp.swift` (SwiftUI). Read `quick-text/README.md` in full before doing anything — it documents two related but distinct features you must not conflate:

- **Atomic phrase cards** (`atoms` array, offsets into `value`): fully implemented on both surfaces. Clicking a tile with `atoms` expands a dark card; clicking a chip copies just that atom's slice of `value`; clicking the card background copies the full `value`.
- **Variable placeholders** (`{{...}}` in `value`, e.g. `{{setting}}` or `{{option one/option two}}`): only *detection* exists, and only in the Mac app. `PhraseEditor.detectedVariables` / `variablesSection` in `QuickTextApp.swift` (search for `detectedVariables`) lists placeholders found in `value` as read-only capsules while editing. Nothing else uses them. This is the unfinished piece — the README's "Variable placeholders → Current boundary" section spells out exactly what's missing:
  - Copy actions copy `value` verbatim; there's no fill-in prompt or copy-time substitution.
  - The corpus tolerates a top-level `variables` array for future use but nothing reads or writes it as a real contract.
  - The web component has no variable detection or UI at all.
  - Interaction between atoms and variables in the same phrase is undefined.

## Goal

Make `{{variable}}` placeholders actually usable at copy time, on both surfaces, without breaking existing atomic-card or plain-copy behavior.

## Before writing code

Decide and write down (in your plan, and in the README update at the end) the interaction model for these open questions, since the original session deliberately left them unresolved:

1. When a phrase's `value` contains one or more `{{...}}` placeholders and the phrase has no `atoms`, what does clicking the tile do? (Likely: open a small fill-in form for each unique placeholder, then copy `value` with substitutions applied — mirroring how atomic cards expand instead of copying immediately.)
2. When a phrase has both `atoms` and `{{...}}` placeholders, how do they coexist inside the expanded card? (Likely: variable runs render as their own visually-distinct chip/segment type alongside atom chips and plain text, each openable to fill in a value; full-card-background click should still copy the whole `value`, substituting any filled variables and leaving unfilled ones as literal `{{...}}` or prompting for all of them first — pick one and be consistent both surfaces.)
3. `{{option one/option two}}` is a distinct sub-syntax (slash-separated choices) already detected by the existing regex (`\{\{([^{}]+)\}\}`, then split remaining logic is up to you) — decide whether it renders as a dropdown/segmented choice vs. a free-text fill and apply that consistently.
4. Whether to formalize the corpus-level `variables` array (e.g. per-variable default value, label, or type) or keep detection purely regex-driven from `value` with no schema addition. Prefer the smallest change that satisfies 1–3; don't add schema you don't need.

## Implementation notes

- Match existing conventions: the web component is a single buildless file (shadow DOM, template-string rendering, `segmentsForValue`/`hasAtoms` helpers already exist there for atoms — you'll likely want an analogous `variables`-aware segmenter). The Mac app is a single SwiftUI file with `AtomicCardView`/`LineSegment`/`FlowLayout` for the expanded card and `PhraseEditor`/`SelectableTextEditor` for editing; `#Preview` blocks and a `PreviewData` fixture enum are at the bottom of the file for visual iteration in Xcode.
- Preserve all existing behavior: plain phrases (no atoms, no variables) still copy immediately; existing atomic phrases (`personal-address-placeholder` in the corpus) still work exactly as before.
- If you touch `quick-text/scripts/validate-corpus.mjs`, keep its existing atom validation intact and only add checks for whatever `variables` contract (if any) you decide on in step 4.
- This sandbox/session may not have a Swift toolchain — if so, syntax-review the Swift changes carefully and say so explicitly rather than claiming a successful build. The user will run `swift build -c release` and reinstall `/Applications/Quick Text.app` themselves; give them the exact commands.

## Verification

1. `npm run quicktext:validate` passes.
2. Manually trace through: a variable-only phrase, an atoms-only phrase, a phrase with both, and a plain phrase — confirm each behaves as decided above.
3. Update `quick-text/README.md`'s "Variable placeholders" section to replace the "Current boundary" list with what's now true, and update `docs/backlog.md` if anything remains deliberately deferred.
4. Report which files changed and what manual/visual verification you did (Xcode previews, web demo, or both) — do not claim the Mac app builds unless you actually ran `swift build`.

Do not push. Stop after committing (or ask before committing if uncommitted corpus changes already existed when you started — check `git status` first).
