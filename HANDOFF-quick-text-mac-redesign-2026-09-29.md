# Handoff: Quick Text Mac redesign (2026-09-29)

Temporary doc. Delete it before PR #102 merges (repo documentation-hygiene rule in `CLAUDE.md`).

## Objective
Implement the Quick Text redesign handoff in the **Mac app only** (`quick-text/mac/QuickTextApp`). The user said explicitly: "web component doesn't matter, I'm just focused on the desktop app."
Done means all of the following:
- PR https://github.com/mwyuwono/prompt-library/pull/102 builds and passes `swift test` on macOS 26.
- The UI visually matches the design canvas in both themes.
- The PR is merged.

## Status
- **Done** (commit `4d36c41`, branch `claude/eager-carson-4gb7mu`, PR #102 open, mergeable_state `clean`, no review threads as of 06:21 UTC):
  - New `Theme.swift`: tokens, fonts, button styles, `AppAppearance`, `CopiedToast`, `SearchMark`.
  - Rewritten `ContentView.swift`, `TileView.swift`, and the sheet section of `ExpandedCard.swift`.
  - `CorpusStore.swift`: sections, recents, favorites, sidebar navigation.
  - `SettingsEditor.swift`: Appearance picker added; Display and Colors sections removed.
  - `App.swift`: hidden title bar, `defaultSize` 1280×900, min 900×600, appearance applied at launch.
  - `HelpPanels.swift`: shortcuts and glossary updated.
  - New `Tests/QuickTextAppTests/LibrarySectionsTests.swift`.
  - README "Mac library design" section added; `docs/design-refresh-plan.md` marked superseded.
- **Unverified: none of the Swift has been compiled.** The container was Linux with no Swift toolchain, and download.swift.org is blocked by the proxy (403). Only a tree-sitter syntax parse was run, and it found 0 errors.
- **Not started**:
  - Compile/test on the Mac.
  - Visual comparison against the canvas and screenshots in both themes (handoff acceptance checklist).
  - Phase-4 restyle of `PhraseEditor`, `VariablesLibrary`, `SettingsEditor` internals, and `HelpPanels` to the new tokens.
  - Web component work (out of scope per the user).

## Context
- **Handoff spec**: Google Drive file `quick-text-redesign-handoff.md`, id `1RInhR1mYpoZpKz87wMPZj6aB9xKz6aYf`. It is in the Drive "Watch Folder" and is **not in the repo**.
- **Design canvas** (5 artboards: `Main.dc.html` Library, `Open.dc.html`, `Highlight.dc.html`, `Light.dc.html`, `OpenLight.dc.html`): https://claude.ai/code/artifact/2aaae507-422d-4f34-b57f-593c1e68c044. Read it with the Artifact tool's `read` action on `project/*.dc.html`.
- **Build, test, reinstall**: see `quick-text/README.md` "Environment notes":
  - `swift build -c release`, then copy the binary into `/Applications/Quick Text.app` and `codesign`.
  - For tests: `swift build --build-tests`, then `xattr -cr` and `codesign` the `.xctest`, then `swift test --skip-build` (iCloud FinderInfo workaround).
- **Run from source**: `cd quick-text/mac/QuickTextApp && QUICK_TEXT_CORPUS_DIR="$(pwd)/../../corpus" swift run`.
- **Corpus check**: `npm run quicktext:validate` passes. The corpus is unchanged; `favorite` already existed on phrases.
- **Local UserDefaults keys**: `QuickText.lastUsed`, `QuickText.librarySort`, `QuickText.appearance`, `QuickText.sidebarVisible`, `QuickText.libraryLayout`.

## Constraints
- User output style:
  - Terse; no preamble or acknowledgments.
  - Always state verification status and risks.
- Repo rules (from `CLAUDE.md`):
  - Delete temporary docs when done.
  - Never include a model name in commits or PRs.
  - The main site's "no dark mode" rule does NOT apply to `quick-text/`, which is a separate subproject.
- Behavior to keep: copy semantics, atom offsets, variable parsing and substitution, the corpus schema, and ⌘⇧Space summon.
- Do not add non-functional UI. That is why there is no Clipboard History button and no web changes.

## Decisions
- **Click copies phrases without atoms or fill-in variables; otherwise it opens the card.** The handoff assumes copy (its §8 "Decision for Matt"). The user has **not confirmed** this.
- **Paste becomes "Copy & Close" (↩); the secondary button is "Copy" and keeps the card open.** The app has no paste-into-front-app. Rejected: adding a CGEvent paste feature.
- **Variables keep the `{{name}}` syntax; Fill in labels display `{name}`.** The handoff said to follow the corpus syntax.
- **Light-mode Elbridge dot is slate `#505C6B` (dark `#A7AEB8`), not `#5E6B4E`.** The spec's olive reads as the highlight, and the handoff itself flagged this.
- **Recently Used is stored in UserDefaults, not the corpus.** Per handoff §10.
- **Appearance override uses `NSApp.appearance`.** `preferredColorScheme(nil)` doesn't reliably revert on macOS.
- **Colors are dynamic `NSColor(name:dynamicProvider:)` tokens.** Rejected: an asset catalog, because it needs SPM resources.
- **The open card still renders the body with `FlowLayout` segments, not a single `Text`.** This keeps atom chips clickable. Rejected: a single `Text` with links, because link styling is uncertain.
- **Per-phrase and per-corpus tile/text colors, text size, card size, and font settings are still in the data but no longer read.** Settings > Categories only shows a "Dot" color for categories that have no built-in pigment.
- **The window-resize-on-expand behavior was removed.** The sheet now lives inside the window.
- **Space in the card no longer copies.** Enter copies and closes; Tab and arrows move through the fields.

## Open issues
- **Compile risk (unverified):**
  - `.windowBackgroundDragBehavior(.enabled)` in `App.swift` (believed macOS 15+).
  - `AttributedString.swiftUI.backgroundColor` / `.font` / `.foregroundColor` in `Theme.swift` (`SearchMark`) and `TileView.previewText`.
  - `onGeometryChange(for:of:action:)`.
  - `@Environment(\.isFocused)` inside the button-style chrome views.
  - `ContentView.body` type-check time; the floating panels and toast were already extracted to reduce it.
- **Runtime behavior, all unverified:**
  - Traffic-light overlap with the header when the sidebar is hidden (the header's leading padding is 84).
  - Whether the window still drags with a hidden title bar.
  - Double-click on a card-opening tile: the scrim ignores taps for 0.4 s after opening.
  - Whether `Button` combined with `.onDrag` on tiles still reorders (only in Manual Order sort with no search).
  - Whether `TextField` Tab moves focus correctly when the key monitor intercepts Tab (`moveActiveVariable`).
  - Focus return to the tile when the sheet closes.
- **Not possible in SwiftUI:** a custom text-selection color (`hl.selection`) in the card.
- **Inconsistency:** `PhraseEditor` still shows tile color swatches, but they now have no effect.
- **The PR check-in routine could not be re-armed** (the auto-mode classifier errored). The PR subscription is still active.

## Next step
1. On the Mac, run `cd quick-text/mac/QuickTextApp && swift build`, and fix every compile error, minimal changes only.
2. Run the tests (sequence in the README), including `LibrarySectionsTests`, and fix failures.
3. Run the app, compare against the canvas artboards in light and dark, and fix visual drift.
4. Ask the user to confirm the click-copies-vs-opens decision.
5. Delete this file, push, update the PR body's Verification section, and get the PR merged.
6. Optional follow-up: restyle `PhraseEditor`, `VariablesLibrary`, Settings, and `HelpPanels` to the `Theme` tokens.
