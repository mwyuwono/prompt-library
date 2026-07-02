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
