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
