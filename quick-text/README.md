# Quick Text

Local-first phrase launcher with two surfaces:

- `mac/QuickTextApp`: SwiftUI Mac utility, local JSON load, global `Cmd+Shift+Space` hotkey, click-to-copy, search, category tabs, menu bar extra, add/edit/delete/duplicate phrases.
- `web/quick-text-component`: buildless Web Component, read-only public mode or local admin mode, same corpus and palette files.

Shared data:

- `corpus/quick-text.json`
- `corpus/palette.json`

Commands:

```bash
npm run quicktext:validate
npm run quicktext:export-public
npm run quicktext:extract-palette
```

Web demo:

```bash
python3 -m http.server 8000
open http://localhost:8000/quick-text/web/quick-text-component/demo.html
```

Mac app from source:

```bash
cd quick-text/mac/QuickTextApp
QUICK_TEXT_CORPUS_DIR="$(pwd)/../../corpus" swift run
```

Installed Mac app:

```bash
open "/Applications/Quick Text.app"
```

The installed app reads and writes this shared corpus:

```text
/Users/mwy/Library/Mobile Documents/com~apple~CloudDocs/Projects/prompts-library/quick-text/corpus
```

After `quick-text.json` is changed by Bullfinch or another external editor, quit and reopen the app for the new phrases to appear:

```bash
pkill -x QuickTextApp
open "/Applications/Quick Text.app"
```

Embed:

```html
<script type="module" src="/quick-text/web/quick-text-component/quick-text.js"></script>
<quick-text-launcher
  mode="public"
  corpus-url="/quick-text/corpus/quick-text.public.json"
  palette-url="/quick-text/corpus/palette.json">
</quick-text-launcher>
```

Public publishing uses `quick-text.public.json`, generated from phrases where `visibility` is `public`.

## Atomic phrase cards

A phrase can optionally carry an `atoms` array so part of its `value` can be copied on its own (e.g. an address card where you sometimes just need the city). `value` stays the single source of truth for full-copy text and formatting; atoms are offset references into it, not separate strings:

```json
{
  "value": "20 Mechanic Square, No. 5\nMarblehead, MA 01945 ",
  "atoms": [
    { "id": "atom-street", "start": 0, "end": 18 },
    { "id": "atom-city", "start": 26, "end": 36 }
  ]
}
```

- A phrase with no `atoms` (or an empty array) behaves exactly as before: click copies `value` immediately.
- A phrase with `atoms` expands into a card on click instead of copying. Clicking a chip copies just that atom's slice of `value`; clicking the card background (not a chip) copies the full `value`. Escape or an outside click collapses without copying.
- Text between/around atoms (punctuation, spaces, line breaks) is preserved in the expanded view and is only included when copying the full value.
- `npm run quicktext:validate` checks atom `id` uniqueness, valid `start`/`end` bounds, and no overlaps.
- Implemented in both surfaces: `web/quick-text-component/quick-text.js` (`segmentsForValue`, the atomic overlay, and an "Add atom from selection" admin editor) and `mac/QuickTextApp` (`ExpandedCardView`/`ExpandedOverlayView` — the shared preview/expand mechanism for every card, atomic or plain — and `PhraseEditor`'s `SelectableTextEditor`-backed atom editor).
- **Offset semantics differ slightly by platform**: the web component indexes UTF-16 code units (native JS string indexing); the Mac app indexes `Character` (grapheme cluster) counts via `Array(value)`. These match for ASCII text (the only atomic phrase in the corpus today), but a value with emoji or combining characters could get different atom slices on each surface. Worth normalizing before adding a non-ASCII atomic phrase.
- Editing `atoms` by hand: offsets are into the *current* `value` exactly as stored (including trailing whitespace/newlines) — if you edit `value`, existing atom offsets are not automatically remapped on either surface, so re-derive them after significant text edits.

## Variable placeholders

Quick Text phrase text may include literal `{{...}}` placeholders (e.g. `{{setting}}`), including option-style placeholders such as `{{option one/option two}}`. Placeholders are fillable at copy time on both surfaces:

- A phrase whose `value` contains `{{...}}` placeholders (with or without `atoms`) expands into a card on click, same as an atomic phrase, instead of copying immediately.
- Each unique placeholder renders as its own chip inside the expanded card: a dashed outline with the placeholder key as a hint when unfilled, a solid chip with the entered value once filled. Clicking an unfilled or filled chip reopens it for editing.
- `{{a/b}}`-style placeholders (containing `/`) show each option as a discrete choice instead of free text; picking one fills the chip.
- Clicking the card background (not a chip) copies `value` with every filled placeholder substituted in; any placeholder left unfilled copies through as the literal `{{...}}` text rather than blocking the copy or prompting for the rest. A placeholder that appears more than once in the same `value` shares one fill across all its occurrences.
- Atoms and variables can coexist in the same phrase and render as distinct chip styles side by side (atom chips solid/bold from the start, variable chips dashed until filled). Atom offsets and atom copy behavior are unaffected by variable fills — copying an atom always copies its literal slice of `value`.
- Fill-in values are session-only, like everything else client-side here: they are not written back to the corpus and reset when the card is closed (Mac) or the page reloads (web).
- Implemented in both surfaces: `web/quick-text-component/quick-text.js` (`parseVariables`, `substituteVariables`, and the `var-chip`/`var-editor` overlay elements alongside the existing atom chips) and `mac/QuickTextApp` (`PhraseVariable.parse`/`.substitute`, and `ExpandedCardView.variableChip`/`variableEditorPopover` alongside `atomChip`). The Mac phrase editor's `PhraseEditor.detectedVariables` and the web admin editor's "Variables detected" list still just preview what will be fillable — they don't do the filling.

### Reusable variable library (Mac shipped; web not yet implemented)

Everything under "Variable placeholders" above is scoped to one phrase: an inline `{{name}}` or `{{a/b}}` placeholder only exists inside that phrase's own `value` text, and two phrases can't share one. The original ask (from an earlier Antigravity session — see git history on this file and on `corpus/quick-text.json` around commit `16c28f1`, which added an inert `variables: [{id, name, options}]` stub to the corpus that nothing ever read) was for **named variables decoupled from any one phrase**, reusable across many phrases, maintained in their own library, with a controlled propagation story when a shared variable is edited. That's now built on the Mac app; the web component (`web/quick-text-component/quick-text.js`) does not implement any of this yet and still only has phrase-local placeholders.

- **Syntax distinguishes inline vs. library by an `@` sigil**: `{{name}}` and `{{a/b}}` keep meaning exactly what they mean above — a one-off, phrase-local placeholder, never touching the library. `{{@name}}` resolves `name` against the shared library instead. Both forms are permanent, coexisting syntaxes — there's no migration step and inline placeholders aren't deprecated.
- **Corpus schema**: a real top-level `variables` array (replacing the old inert stub — nothing referenced it, so it was dropped rather than migrated), each entry `{ id, name, type: "text" | "choice", options?: string[] }` — `id` is stable and never reused; `name` is the human-facing key authors type inside `{{@name}}` and must be unique (case-insensitive) among library entries; `options` is required and non-empty when `type` is `"choice"`. `npm run quicktext:validate` (`quick-text/scripts/validate-corpus.mjs`) checks all of this.
- **Resolution**: at render time, `{{@name}}` looks up `variables` by `name` (case-insensitive, trimmed) and renders/fills like the inline chips — free-text popover for `"text"`, choice buttons for `"choice"` — just sourced from the library entry instead of parsed inline text. A dangling reference (renamed or deleted library entry) renders as a visually distinct, non-interactive "unresolved" chip and copies through as the literal `{{@name}}` text, same fallback precedent as an unfilled placeholder.
- **Authoring flow**: `PhraseEditor`'s Value field has an "Insert Variable" button that opens a popover to either insert an existing library variable at the cursor by name, or create a new one (name, type, options) and insert it in one step. Typing `{{name}}`/`{{a/b}}` by hand for a one-off still needs no library interaction at all. A "Variables Library" toolbar button (next to Settings) opens `VariablesLibraryEditor`, which lists every library variable, lets you add/edit/delete each, and shows how many phrases currently reference it (`CorpusStore.referenceCount(forLibraryVariableName:)` — a live reverse-index scan for `{{@name}}` across `phrases[].value`, not a stored back-reference list).
- **Edit propagation**: saving a change to an existing library variable's `name`, `type`, or `options` in `LibraryVariableEditorSheet` prompts, only when ≥1 phrase currently references it, with two choices:
  - **Update all** (`CorpusStore.updateLibraryVariableInPlace`) — mutates the existing entry in place (same `id`); every `{{@name}}` reference picks up the new options/type immediately. If `name` itself changed, this also rewrites `{{@oldName}}` to `{{@newName}}` in every referencing phrase's `value` (`PhraseVariable.renamingLibraryReferences`), since otherwise the rename silently breaks all of them.
  - **Fork** (`CorpusStore.forkLibraryVariable`, via `ForkVariableSheet`) — creates a new entry with a new `id` and a new name chosen by the admin (can't collide with the original or any other existing name). **Phrases that used the old variable stay pointing at the old, unforked entry — nothing about them changes.** The fork starts referenced by nothing; the admin manually inserts `{{@newName}}` into whichever phrases should adopt it going forward.
  - Deleting a library variable (`CorpusStore.deleteLibraryVariable`) that's still referenced warns how many phrases reference it first; afterward those phrases keep their literal `{{@name}}` text, which now resolves as "unresolved" rather than silently reverting to a plain inline placeholder.
- Implemented on Mac in `mac/QuickTextApp/Sources/QuickTextApp/QuickTextApp.swift`: `LibraryVariable` (corpus model), `PhraseVariable.Kind`/`.parse(_:library:)`/`.referencedLibraryNames(in:)`/`.renamingLibraryReferences(in:from:to:)` (parsing/resolution), the `CorpusStore` library-variable CRUD extension, `InsertVariablePopover` (authoring), and `VariablesLibraryEditor`/`VariableRow`/`LibraryVariableEditorSheet`/`ForkVariableSheet` (admin surface). Builds clean (`swift build` and `swift build -c release`) and has been manually verified end to end: existing atom/inline-placeholder behavior unchanged, "Insert Variable" insert-existing and create-new-and-insert both work, the "Variables" toolbar button lists live reference counts and supports add/edit/delete, `{{@name}}` chips resolve and fill like normal variable chips, renaming/deleting the referenced entry correctly shows the distinct "unresolved" chip and copies through as literal `{{@name}}` text, Update All rewrites `{{@oldName}}` → `{{@newName}}` across every referencing phrase while Fork leaves old phrases untouched, and delete warns with the correct phrase count first.

## Environment notes for future sessions

- The Cowork/agent sandbox used to edit this repo has no Swift toolchain, so Mac app changes can only be syntax-eyeballed there, not compiled. Build and reinstall on the actual Mac:
  ```bash
  cd quick-text/mac/QuickTextApp
  swift build -c release
  cp .build/release/QuickTextApp "/Applications/Quick Text.app/Contents/MacOS/QuickTextApp"
  codesign --force --deep --sign - "/Applications/Quick Text.app"
  ```
- `npm run check` (which runs `build:components`) fails in that same sandbox because `node_modules/@esbuild/darwin-arm64` is a macOS binary being invoked from a Linux sandbox — an environment mismatch, not a code regression. Re-run `npm run check` on the Mac to get a real signal after sandbox-based edits.
- SwiftUI views in `QuickTextApp.swift` have `#Preview` blocks (Content View, tiles, atomic card/overlay, phrase editor) backed by a `PreviewData` fixture enum at the bottom of the file — open the file in Xcode with the canvas on for a visual/no-rebuild way to tweak colors, spacing, and fonts.
- The Mac app's deployment target is macOS 26 (`Package.swift` platforms `.v26`, tools-version 6.2) so it can adopt Apple's Liquid Glass button styles (`.glass`/`.glassProminent`) and `.glassEffect(...)` directly rather than approximating them with materials — this is the standard going forward for buttons/chips/scrims in this app, applied consistently rather than per-screen.
