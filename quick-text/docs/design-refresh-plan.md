# Quick Text Mac App — Design Refresh Plan (v2)

Orchestration doc for a phased visual refresh of the Quick Text **Mac app** (SwiftUI). Scope: Mac app only. Direction: **match the design references** in `quick-text/docs/design-references/` — editorial serif hero text with small, quiet inline variable tokens. Not a redesign of behavior.

**Status:** a first implementation pass (commit `27ef124`) fixed the mechanical defects — baseline-aligned `FlowLayout`, native text runs, punctuation hugging chips, `CardTypography` spec, Liquid Glass icons — but kept the old chip philosophy (large, inverted, high-contrast slabs). **Phase 1b below is the active phase.** Later phases (2–5) polish interactions and remaining surfaces.

**Do not delete this file until the user says the refresh is complete.** Run ONE phase per session; stop after the phase's acceptance criteria are met and wait for review.

---

## 1. Context for the implementing model

Read `quick-text/README.md` first (glossary, architecture, feature semantics). Key facts:

- **App root**: `quick-text/mac/QuickTextApp` (Swift package, macOS 26 target, SwiftUI).
- **Design standard**: Apple Liquid Glass (`.glass`, `.glassProminent`, `.glassEffect(...)`) for buttons/chips/scrims.
- **Colors are data-driven**: card background, text, chip, and highlight colors come from corpus settings + `corpus/palette.json` via `CorpusStore`. Never hardcode display colors; the design must hold across palettes.
- **Typography is settings-driven**: `settings.defaultFontSize` / `defaultFontFamily` (`"sans"` → system, `"serif"` → Palatino). All card metrics derive from these via `CardTypography` in `ExpandedCard.swift`.
- **Behavior is off-limits**: copy semantics, atom offsets, variable parsing/substitution, keyboard shortcuts, and the corpus schema must not change. `swift test` must pass after every phase.
- **Verify visually with `#Preview`s** backed by `PreviewData.swift`; add fixtures for any state you touch.
- **Build/reinstall loop** (on the Mac; then QUIT AND RELAUNCH the app — replacing the binary does not update a running process):
  ```bash
  cd quick-text/mac/QuickTextApp
  swift build -c release
  cp .build/release/QuickTextApp "/Applications/Quick Text.app/Contents/MacOS/QuickTextApp"
  codesign --force --deep --sign - "/Applications/Quick Text.app"
  ```

### File map

| File | Owns |
|---|---|
| `ExpandedCard.swift` | `ExpandedOverlayView` (scrim), `ExpandedCardView` (card + atom/variable/canned/unresolved chips, fill popovers, key handling), `CardTypography`, `LineSegment` tokenizer |
| `TileView.swift` | Grid tiles, `PhrasePreviewImage`, `CopiedBadge` |
| `ContentView.swift` | Main window: tabs, search module, masonry grid, overlay presentation, window resize, context menus, focus/keyboard |
| `Layouts.swift` | `MasonryGrid`, baseline-aligned `FlowLayout` |
| `PhraseEditor.swift` | Add/edit sheet, atom editor, Insert Variable popover, text-replacement controls |
| `VariablesLibrary.swift` | Variables Library window + editor/fork sheets |
| `SettingsEditor.swift` | Settings window + sync preview sheet |
| `HelpPanels.swift` | Keyboard Shortcuts + Glossary panels |
| `DesignSystem.swift` | `QuickTextDesign` constants, section/field/pill surface modifiers |
| `PreviewData.swift` | Preview fixtures |

---

## 2. Surface & interaction inventory

### A. Expanded card (top priority)
Static: card container; title label; hero body text; atom chips; inline variable chips (unfilled/filled); canned `"value"` library chips (collapsed/expanded display modes + tooltip); unresolved `{{@name}}` chips; multi-line wrapping; content block alignment.
Interactions: card-hover copy affordance + copy-all tint; chip hover/click highlight; single-copy flash; shift/arrow multiselect; full-copy pulse; `CopiedBadge`; variable fill popover (text + choice); copy/close icon buttons; scrim; window resize on expand/collapse.

### B. Main window
Tiles (typography, selection, preview image + fallbacks, copied badge); category tabs; search module row; masonry grid chrome + focus tints; context menus; drag-to-reorder feedback; empty states.

### C. Editors & panels
Phrase editor sheet; Variables Library window (rows, reference counts, fork/delete flows); Settings window (sections, pickers, sliders, sync status + preview sheet); Keyboard Shortcuts + Glossary panels; alerts.

### D. System chrome
Menu bar extra; title bar/toolbar; app icon (out of scope unless asked).

---

## 3. Design references (authoritative)

`quick-text/docs/design-references/`:

- `anchor-expanded-card.png` — the expanded-card composition target: huge tight-leaded serif hero sentence; small wide-tracked uppercase label; variables as small bracketed mono tokens in quiet pill surfaces; soft square glass icon buttons.
- `anchor-inline-chips.png` — the inline-chip target: chips ~half the body size sitting inside the sentence without inflating line height; filled = faint tint surface, muted label; unfilled = fine dashed hairline in an accent color; punctuation tight against the chip.
- `anchor-browsing-surface.png`, `anchor-utility-surfaces.png` — targets for Phases 3–4.

The chips are **quieter than the body text**: annotations, not buttons. The body sentence is the hero.

---

## 4. Phases

### Phase 1b — ACTIVE — Corrective pass: match the reference chip philosophy

**Why:** the first pass kept the original chip anatomy (label ≈ 0.88× body, semibold, solid inverted fill — dark text on light chip). The references demand the opposite. Keep the Phase-1 plumbing (`CardTypography`, baseline-aligned `FlowLayout`, native text runs); replace the visual spec.

**Target spec (tune by eye in previews; acceptance bar is the reference images):**

- **Hero body**: larger and tighter — line height ≈ 1.08–1.15, regular-weight serif; the sentence dominates the card. Title label: small, wide-tracked (≈0.2em), low opacity; shrink if it competes.
- **Chip scale**: label ≈ 0.45–0.55× body size. Chip box height ≤ body line height — chips sit inside the line, vertically centered on the body's x-height band, never inflating line spacing.
- **Contrast inverts from current**: no solid inverted fill. Resting chip = 1pt hairline border (`textColor` at ~20–25%) + faint fill (`chipColor` at ~10–18%), label in a muted tone of `textColor`. Chips read quieter than body text.
- **Label voice contrasts with the body**: small monospaced (or utilitarian sans) regular weight with slight tracking — NOT the body serif. Source token delimiters are data syntax, not UI copy, so brackets are omitted from the rendered label. This supersedes the earlier "unify families" instruction and the earlier bracket-display wording.
- **Unfilled variable**: fine 1pt dashed hairline, label in the accent/highlight color, regular weight. **Filled / canned value**: faint solid tint, muted label at full text color — never inverted.
- **Hover/selection**: `highlightColor` scaled to the quiet anatomy (border + tint strengthen; no white-on-highlight slab). Unresolved: same anatomy, red-tinted hairline + label.
- **Icon buttons**: soft square glass tiles (reference bottom-right pair); 44pt hit areas.
- Everything derives from `fontSize`/`fontFamily` via `CardTypography`; must hold at fontSize 14–28, serif and sans, across palettes.

**Constraints:** no behavior changes; `swift test` green; `LineSegmentTests` stay green.

**Acceptance:** `#Preview` matrix (plain / atomic / unfilled + filled inline / choice / canned value both display modes / unresolved / long multi-line, in serif + sans at fontSize 14 and 22) and side-by-side screenshots vs. `anchor-inline-chips.png` and `anchor-expanded-card.png`. At a glance, chip weight, scale, and contrast must match the references.

**Prompt for the implementing model:**

> Read `quick-text/README.md` and `quick-text/docs/design-refresh-plan.md`, then implement **Phase 1b ONLY** — stop when its acceptance criteria are met; do not proceed to other phases and do not delete the plan file. Open and study `quick-text/docs/design-references/anchor-expanded-card.png` and `anchor-inline-chips.png` before writing code; they are the acceptance bar. The current chips in `ExpandedCard.swift` are large, inverted, high-contrast slabs; the references demand small, quiet, low-contrast inline tokens that never inflate line height, inside a bigger, tighter-leaded hero sentence. Rework `CardTypography`'s body/chip metrics and all four chip builders to the plan's Phase 1b target spec (chip label ≈ half body size in a contrasting monospaced/utilitarian face with bracket-style delimiters; hairline border + faint tint instead of solid inverted fill; accent dashed hairline for unfilled; quiet tint for filled/canned; soft glass square icon buttons). Keep the existing plumbing: baseline-aligned FlowLayout, native text runs, settings-driven colors, no behavior changes, `swift test` green. Update every `#Preview`, then show me a screenshot of each preview next to the reference image and wait for my approval before finalizing.

### Phase 2 — Expanded card: interaction & feedback polish

Hover/copy/selection/fill states rescaled to the new quiet chip anatomy; `CopiedBadge` refinement (verify at tile size too); fill popover + choice list matched to the card type system; scrim + expand/collapse transition tuning; keep `CorpusStore.copyFeedbackDuration`'s contract. Acceptance: recording or previews of chip hover, copy-all tint, single-atom flash, multiselect, full-copy pulse, badge on card + tile, both popover variants.

> Prompt: Read the plan; implement **Phase 2 only** per §4, matching the Phase 1b visual system. Stop after acceptance evidence; don't delete the plan.

### Phase 3 — Main window: tiles, tabs, search, grid

Extend the type/interaction vocabulary to `TileView.swift` and `ContentView.swift` chrome per `anchor-browsing-surface.png`. Behavior (selection/keyboard/drag/card-size slider) unchanged. Acceptance: tile preview matrix (plain/atomic/with-image/selected/copied at min/max width, serif + sans) + full-window screenshots.

> Prompt: Read the plan; implement **Phase 3 only** per §4 against `anchor-browsing-surface.png`. Stop after acceptance evidence; don't delete the plan.

### Phase 4 — Editors, library, settings, help panels

Bring `PhraseEditor`, `VariablesLibrary`, `SettingsEditor`, `HelpPanels` in line per `anchor-utility-surfaces.png`, building on `DesignSystem.swift`. Visual only. Acceptance: before/after screenshots per surface; manual pass (edit phrase, edit library variable, sync preview → cancel).

> Prompt: Read the plan; implement **Phase 4 only** per §4 against `anchor-utility-surfaces.png`. Zero functional changes. Stop after acceptance evidence; don't delete the plan.

### Phase 5 — Consistency audit & QA

Audit every §2 surface against the final spec (fonts, radii, spacing, timing, color usage); fix drift; `swift test` + manual regression (tile copy, atom copy, multiselect, variable fill, canned value, unresolved fallback, keyboard copy, Escape paths). Only after the user confirms completion: delete this plan per repo documentation-hygiene policy, summarizing in the commit message.

---

## 5. Instructions for Matt

- One phase per session; paste the phase prompt and attach this file. The prompts now explicitly forbid running ahead or deleting the plan — the first pass did both.
- Phase 1b's prompt requires screenshot-vs-reference approval before finalizing. Judge chip scale and quietness there, not in prose.
- After each build: `cp` + `codesign`, then **quit and relaunch** the app.
- Review in serif and sans, at fontSize 14/28, every chip state (toggle Settings > Behavior for expanded chip display; temporarily rename a library variable to see an unresolved chip), a 3+ line phrase, and your real palette.
- Commit per phase so any phase can be reverted alone.
