# Handoff: Quick Text Mac redesign — first build, test, merge (2026-09-29)

Temporary. Delete this file before merging PR #103 (repo documentation-hygiene rule in `CLAUDE.md`).

## Objective
Get the redesigned Quick Text Mac app (`quick-text/mac/QuickTextApp`) compiling, with tests passing, installed, and merged into `main`.

Done means all of these hold:
- `swift build` and `swift test` pass on the Mac.
- The app is reinstalled to `/Applications/Quick Text.app` and relaunched.
- The UI roughly matches the design canvas in light and dark.
- PR https://github.com/mwyuwono/prompt-library/pull/103 is merged, and this handoff file is deleted.

## Status
- **Done:**
  - The redesign is on `main`: squash commit `b779af0`, from PR #102, which is merged.
  - The user's previously uncommitted Mac work is commit `6e46e6b` on branch `mac-local-changes`. It contains:
    - Dictate take reordering.
    - A Combine Takes button.
    - An ⌥⇧Space hotkey.
    - Menu-bar icon `character.textbox.badge.sparkles`.
    - Corpus edits.
  - `main` is merged into that branch as `a828355`. Conflicts in `HelpPanels.swift` and `quick-text/README.md` were resolved, keeping Opt-Shift-Space.
  - PR #103 (`mac-local-changes` → `main`) is open. Vercel previews are green, which is irrelevant to the Swift code.
- **Unverified:**
  - **The redesign Swift has never been compiled.** It was written in a Linux container.
  - The only checks run were a tree-sitter syntax parse (0 errors) and `npm run quicktext:validate` (passes).
  - The user's earlier `swift build` ("Build complete! 0.42 s") ran on the old `main`, before the redesign was pulled, so it proves nothing.
- **Not started:**
  - Compiling and testing the redesign.
  - Visual QA against the canvas.
  - Deleting the stale remote branch `claude/eager-carson-4gb7mu`.

## Context
- **Local repo (iCloud):** `~/Library/Mobile Documents/com~apple~CloudDocs/Projects/prompts-library`. Check out branch `mac-local-changes`.
- **Build, test and reinstall commands:** see `quick-text/README.md`, section "Environment notes".
  - Tests need an iCloud FinderInfo workaround: `swift build --build-tests` → `xattr -cr .build` → `codesign --force --sign -` the `.xctest` → `swift test --skip-build`. The `.xctest` bundle name is unverified; guessed as `.build/debug/QuickTextAppPackageTests.xctest`.
  - Reinstall: `swift build -c release`, copy the binary into `/Applications/Quick Text.app/Contents/MacOS/`, run `xattr -cr`, then `codesign --force --deep --sign -`. Then quit and relaunch the app.
- **Toolchain:** Swift tools 6.2, macOS 26 target (see `Package.swift`). If `swift` is missing, run `xcode-select --install`.
- **Design spec:** Google Drive file `quick-text-redesign-handoff.md`, id `1RInhR1mYpoZpKz87wMPZj6aB9xKz6aYf`, in the Drive "Watch Folder". It is not in the repo.
- **Design canvas (5 artboards):** https://claude.ai/code/artifact/2aaae507-422d-4f34-b57f-593c1e68c044. The files are `project/Main.dc.html`, `Open.dc.html`, `Highlight.dc.html`, `Light.dc.html` and `OpenLight.dc.html`.
- **Redesign documentation:** `quick-text/README.md`, section "Mac library design". Tokens live in `Sources/QuickTextApp/Theme.swift`.
- **Files the redesign touched:** `Theme.swift` (new), `ContentView.swift`, `TileView.swift`, `ExpandedCard.swift`, `CorpusStore.swift`, `SettingsEditor.swift`, `App.swift`, `HelpPanels.swift`, and `Tests/QuickTextAppTests/LibrarySectionsTests.swift` (new).
- **Local UserDefaults keys:** `QuickText.lastUsed`, `QuickText.librarySort`, `QuickText.appearance`, `QuickText.sidebarVisible`, `QuickText.libraryLayout`.

## Constraints
- **User style:** terse, no preamble. Always state verification status and risks.
- **Scope:** Mac app only. The user said: "web component doesn't matter".
- **Repo rules** (`CLAUDE.md`, `AGENTS.md`):
  - Delete temporary docs when done.
  - Keep model names out of commits and PRs.
  - The main site's "no dark mode" rule does not apply to `quick-text/`.
- **Keep unchanged:**
  - Copy semantics, atom offsets, variable parsing and the corpus schema.
  - The ⌥⇧Space hotkey. The user changed it from ⌘⇧Space.
- **No non-functional UI:** no Clipboard History button, no paste-to-front.

## Decisions
- **Click always opens the card.** The user decided this in commit `fe90fb4`. Rejected: click-to-copy for phrases with no variables, which the handoff assumed.
  - Return still copies the selection. The tile's Copy button still copies.
  - `store.opensCard` now only drives the tile footer hint, and `TileView` is passed `opensCard: true`.
- **The handoff's Paste action becomes "Copy & Close" (↩), plus a secondary "Copy" that keeps the card open.** The app has no paste-into-front-app feature.
- **Variables keep the corpus syntax `{{name}}`; Fill-in labels display `{name}`.**
- **Light-mode Elbridge dot is slate `#505C6B`** instead of the handoff's olive `#5E6B4E`, so it doesn't read as the highlight color.
- **Recently Used, appearance, layout, sort and sidebar visibility are stored in UserDefaults**, not in the corpus.
- **The appearance override uses `NSApp.appearance`.** Rejected: `preferredColorScheme`, which doesn't revert reliably.
- **Colors are dynamic `NSColor(name:dynamicProvider:)` tokens.** Rejected: an asset catalog, which needs SPM resources.
- **The open-card body keeps its `FlowLayout` segments** so atom chips stay clickable. Rejected: a single `Text` with links.
- **Old tile, text, size and color settings stay in the corpus but are no longer read.** The Settings UI for them was removed.

## Open issues
- **Compile risks, unverified:**
  - `.windowBackgroundDragBehavior(.enabled)` in `App.swift`.
  - `AttributedString.swiftUI.*` in `Theme.swift` (`SearchMark`) and in `TileView.previewText`.
  - `onGeometryChange(for:of:action:)`.
  - `@Environment(\.isFocused)` in the button-style chrome views.
  - How long `ContentView.body` takes to type-check.
- **Runtime behaviour, unverified:**
  - Whether the traffic lights overlap the header when the sidebar is hidden (header leading padding is 84).
  - Whether the window drags with the hidden title bar.
  - Whether `Button` combined with `.onDrag` still allows reordering tiles.
  - Tab handling in the Fill-in panel via the key monitor.
  - Focus returning to the tile when the sheet closes.
  - The 0.4 s scrim-tap guard.
- **Merge interaction, unverified:** the user's `DictateView` changes (drag handles, Combine button) have not been checked against the redesign.
  - `DictateView` still uses `store.highlightColor`, which now returns `Theme.accent`.
- **Known gaps:**
  - SwiftUI has no custom text-selection color, so `hl.selection` is not implemented.
  - `PhraseEditor` still shows tile color swatches that no longer do anything.
  - `HelpPanels` no longer lists the Space shortcut, although Space still opens the card.
- **Also unverified:** `LibrarySectionsTests` compile and pass.
- **Watcher in the previous cloud session:** it is still subscribed to PR #103, with a check-in routine `trig_019bhcW9CaBPCw2fzvSGYNg5`. That session could act on the PR in parallel. Delete the routine if it causes interference.

## Next step
1. `cd` into the local repo, `git checkout mac-local-changes && git pull`, then from `quick-text/mac/QuickTextApp` run `swift build`. Fix compile errors with minimal changes.
2. Run the tests (sequence under Context) and fix failures. Never skip or disable tests.
3. Reinstall and relaunch the app. Compare it against the canvas in both themes and fix visual drift. Screenshots are part of the handoff's acceptance checklist.
4. Commit and push to `mac-local-changes`. Delete this file. Update PR #103's Verification section.
5. Merge PR #103. Delete the remote branches `claude/eager-carson-4gb7mu` and `mac-local-changes`.
6. Optional: restyle `PhraseEditor`, `VariablesLibrary`, Settings and `HelpPanels` with the `Theme` tokens.
