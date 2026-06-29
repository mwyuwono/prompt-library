# Handoff: Visual Selector Modal — Nineteenth alignment

## Overview
This brief aligns the existing **`modal-container.visual-selector-modal`** (the `wy-prompt-modal` web component) with **The Nineteenth design system**, and refines the variant tiles to read more editorial. The component already pulls Nineteenth color tokens through Material-token aliases (`tokens.css`), so this is a **targeted changeset**, not a rebuild.

## About the design files
`Visual Selector Modal - Component Spec.dc.html` (included) is a **design reference created in HTML** — a spec sheet showing the intended look, the assembled dialog, and an "anatomy" breakdown of each approved sub-component. It is **not** code to copy. The task is to reproduce its visual decisions in the real component using the codebase's existing Lit + CSS patterns.

## Fidelity
**High-fidelity.** Exact colors, type, spacing, and states below. Recreate pixel-for-pixel using existing tokens.

## Source of truth & build
- **Edit only:** `components/ui/wy-prompt-modal.js` (the Lit component — `static styles` CSS block + the `render()` / `_renderVisual*` template methods).
- **Do NOT hand-edit** `web-components.js` — it is the esbuild output of `components/ui/index.js`. Regenerate it after editing:
  ```
  npm run build:components
  ```
- **Verify** against `style-guide-v3.html`, which renders the real `wy-*` tags from the bundle.

## The changeset

Apply in this order (low effort → high). All values come from `tokens.css` / The Nineteenth.

### 1. Scrim — remove blur, solid ink at 60%
Selector `.scrim`:
- `background: rgba(0, 0, 0, 0.3)` → **`rgba(40, 40, 40, 0.6)`**
- **Delete** `backdrop-filter: blur(4px)` (the system forbids modal blur).

### 2. Image aspect ratios → 16:9
Your real preview artwork is **1920×1080**. Update so images fill without cropping:
- `.visual-variation-media` — `aspect-ratio: 4 / 3` → **`16 / 9`**
- `.variation-image img` — `aspect-ratio: 16 / 10` → **`16 / 9`**

### 3. Font cleanup (cosmetic)
Replace remaining literal `'DM Sans'` fallbacks with `var(--ff-sans)` (Inter). Tokens already resolve, so this only tidies the fallback stack. Optionally collapse `--md-sys-*` references to the direct Nineteenth tokens they alias, but not required.

### 4. Variant tiles — editorial refinement
This is the main visual change. Goal: drop the boxy white card with a bold sans label; make tiles a neutral plate over a serif caption separated by a hairline "loom" rule.

`.visual-variation-tile`:
- `background: var(--md-sys-color-surface-container-lowest)` → **`transparent`**
- Remove the full `border: 1px solid var(--paper-edge)` and `overflow: hidden` from the tile itself.

`.visual-variation-media`:
- Keep/add **`border: 1px solid var(--paper-edge)`** (the plate now carries the only border).
- Add **`transition: opacity var(--dur-2) var(--ease)`** and on `:hover` set **`opacity: 0.9`** (Nineteenth hover = images tighten).
- `aspect-ratio: 16 / 9` (from step 2).
- Background while no image: a neutral warm gradient, e.g. `linear-gradient(150deg, #E6E0D4, #CDC4B2)`.

`.visual-variation-copy`:
- Add a **`border-top: 1px solid var(--paper-edge)`** + `padding-top: 8px; margin-top: 10px` (the loom rule above the caption).

`.visual-variation-name`:
- `font-family: var(--ff-sans); font-weight: 700` → **`font-family: var(--ff-serif); font-style: italic; font-weight: 500`**
- `font-size: ~1rem; line-height: 1.2; color: var(--ink)`.

`.visual-variation-description` (details mode only): keep — `var(--ff-sans); 0.75rem; line-height: 1.45; color: var(--ink-mute)`; 2-line clamp.

`.visual-variation-tile.selected`:
- **Remove** `box-shadow: inset 0 0 0 1px …` ring.
- Instead apply a **1px frame on the media**: a `::after` (or overlay) on `.visual-variation-media` with `position: absolute; inset: -1px; border: 1px solid var(--ink)` (use an accent — `--accent-rust` etc. — if you want the selected color to differ from ink).

> Note: the spec sheet originally showed a "Nº 01" edition number in each caption; that was **removed** per review. Do not add numbering.

### 5. Icons (optional, larger lift)
The modal uses **filled Material Symbols** (`content_copy`, `link`, `edit`, `download`, `close`, `expand_more`, `auto_awesome`, `assignment`, `image`). The system specifies **hairline SVGs at 1.25 stroke** (Lucide is the sanctioned substitute). Swap to inline SVG / Lucide only if you want full brand fidelity — functionally the modal works unchanged. If you do swap: no fill, `stroke: currentColor`, `stroke-width: 1.25`, sizes 16/18/20px so they invert correctly on the ink-fill buttons.

## Design tokens (all from `tokens.css` / colors_and_type.css)
- Surface: `--paper #F7F4EE`, `--paper-deep #EEE8DD`, `--paper-edge #DDD6C8`, `--white #FFFFFF`
- Ink: `--ink #1A1A1A`, `--ink-mute #6B6B6A`, `--ink-soft #A8A49C`
- Accents (selected/active emphasis): `--accent-rust #C06F45`, `--accent-sage #7D8E39`, `--accent-dusty-rose #C06D5C`
- Type: serif `--ff-serif` (Lora), sans `--ff-sans` (Inter)
- Scrim: `rgba(40,40,40,0.6)` · Shadow: `--shadow-modal` (the only modal lift) · Radius: `0` everywhere
- Motion: `--dur-1 150ms`, `--dur-2 350ms`, `--ease`

## Components in scope (already in the file)
Header actions (`.labeled-btn.primary`, `.icon-btn.filled`, `.icon-btn.primary`), tabs (`.tab-item`), variant tiles (`.visual-variation-tile` + rail), selected-variant panel (`.variation-name` collapsible), reference-image rows (`.reference-image-row`), variable inputs (`_renderVariable`: text/textarea/toggle), and the shell + scrim. Only the scrim, ratios, fonts, and tiles change; the rest already conform.

## Verification checklist
- [ ] `npm run build:components` run; `web-components.js` regenerated.
- [ ] Modal opens with a solid (un-blurred) scrim.
- [ ] Variant previews are 16:9 and fill edge-to-edge.
- [ ] Variant tiles: no white card, serif-italic names, hairline rule above caption, accent/ink frame on the selected tile, image dims on hover.
- [ ] No numbering in tile captions.
- [ ] Compare side-by-side with `Visual Selector Modal - Component Spec.dc.html` (section II, "Anatomy") and `style-guide-v3.html`.

## Files
- `README.md` — this brief.
- `Visual Selector Modal - Component Spec.dc.html` — the visual reference (opens in the Claude Design project; needs its `_ds/` assets to render standalone).
- Target in your repo: `components/ui/wy-prompt-modal.js`.
