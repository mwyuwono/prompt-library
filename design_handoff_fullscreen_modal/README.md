# Handoff: wy-prompt-modal Fullscreen Variant

## Overview
Adds a `.fullscreen` modifier to the existing `wy-prompt-modal` `.modal-container`, controlled per-prompt by an admin-only `fullScreenModal` boolean field. When enabled, the modal takes over the entire browser window instead of rendering as a centered card — intended for prompts with many visual variants, where a wider thumbnail rail (2 columns instead of 1) helps comparison.

## About the Design Files
The bundled `.dc.html` file is a **design reference created in HTML** — it is an annotated visual mock plus literal CSS/JS/markup snippets meant to be copied into the real files. It is NOT a component to drop into the app as-is. The actual implementation target is the existing vanilla-JS / Lit-style web component codebase: `components.css`, `components/ui/wy-prompt-modal.js`, `components/ui/wy-prompt-editor.js`, and `app.js`. Recreate the behavior described below in those files, following their existing conventions (no Shadow DOM, no `!important`, CSS variables only, light DOM).

## Fidelity
**High-fidelity.** Exact selectors, exact property values, and copy-pasteable code snippets are provided below and in the mock. No guessing should be required — the snippets in section "Implementation Snippets" are intended to be used close to verbatim, adapted only to match exact existing class/attribute names in your current codebase (verify against your actual `wy-prompt-modal.js` and `wy-prompt-editor.js` before pasting, as line numbers may have shifted).

## Screens / Views

### 1. Prompt modal — centered (existing, unchanged)
No changes. `.modal-container` keeps `width: 90%`, `max-width: 800px`, `max-height: 90vh`, `position: absolute`, centered via `transform: translate(-50%, -50%) scale(0.95→1)`, bordered, shadowed. `.visual-selector-modal` keeps `width: min(94vw, 1120px)`. This must continue to work exactly as today when `fullscreen` is absent.

### 2. Prompt modal — fullscreen, visual-selector mode (new)
- **Purpose:** Same content as the centered visual-selector modal (header with action buttons/category badge/close button, left main content panel, right thumbnail rail), but the modal fills the entire viewport for prompts with many visual variants.
- **Layout:** `.modal-container.fullscreen` is `position: fixed; inset: 0; width: 100vw; height: 100vh;` with no `max-width`/`max-height`, no `border`, no `box-shadow`, `border-radius: 0`. Internally still a flex column: sticky `.header` on top, `.visual-selector-layout` grid filling the remainder.
- **Header:** Same buttons/content as today, padding widened to `var(--spacing-2xl, 40px) var(--spacing-2xl, 48px) var(--spacing-sm, 8px)` (centered modal's header padding is narrower — check current value and only widen, don't restructure).
- **Grid:** `.visual-selector-layout` becomes `grid-template-columns: minmax(0, 1fr) minmax(280px, 360px)` (vs. `minmax(220px, 280px)` centered), with outer padding `0 var(--spacing-2xl, 48px) var(--spacing-2xl, 48px)`.
- **Rail:** `.visual-selector-rail` `max-height: calc(100vh - 96px)` (vs. `calc(90vh - 128px)` centered). Sticky positioning and `overflow: auto` unchanged.
- **Rail's tile grid:** `.visual-variation-grid` inside the fullscreen rail switches from `grid-template-columns: 1fr` to `repeat(2, 1fr)` — thumbnails sit two-up.
- **Compound case:** `.modal-container.fullscreen.visual-selector-modal` must resolve to the same wide rail rule (`minmax(280px, 360px)`) — both modifiers active together should not conflict or produce a narrower rail.

## Interactions & Behavior
- **Animation:** Centered modal currently animates `transform: scale(0.95) → scale(1)`. Fullscreen instead animates `transform: translateY(4%) → translateY(0)`. Same duration/easing: `0.3s cubic-bezier(0.2, 0, 0.2, 1)`. Apply the open-state transform via the existing `[open]` attribute pattern already used for the scale animation.
- **Scrim suppression:** In fullscreen mode the modal IS the screen — the scrim/backdrop element behind `.modal-container` should be hidden (`opacity: 0; pointer-events: none`) rather than visible-but-irrelevant. Use a `:has()` selector scoped to `wy-prompt-modal` (see snippet) or, if `:has()` support is a concern in your target browsers, toggle a class on the host element instead from JS.
- **Toggle entry point:** Admin editor → Visuals step → `wy-option-toggle` labeled "Full-screen modal", placed directly beneath the existing tile-mode toggle. Toggling writes `fullScreenModal: true|false` onto `this._editedPrompt`, same generic field-setter path as `variationSelectorTileMode`.
- **No new modal-close/open behavior** — fullscreen reuses the existing open/close lifecycle, just a different container size/animation.

## State Management
- New prompt-level field: `fullScreenModal: boolean` (defaults to `false`/absent — falsy for all existing prompts, fully backward compatible).
- Stored in `prompts.json` alongside other per-prompt admin fields (e.g. `variationSelectorTileMode`).
- Read in `app.js` wherever the modal is opened (mirroring the existing `variationSelectorTileMode` pass-through) and set on the `<wy-prompt-modal>` instance as a property, which reflects to a `full-screen` boolean attribute.

## Design Tokens
All values pull from existing tokens — no new colors introduced:
- `--paper` (#F7F4EE) — modal background
- `--paper-deep` (#EEE8DD) — secondary surface
- `--paper-edge` (#DDD6C8) — hairline borders/dividers (header bottom border in fullscreen)
- `--ink` (#1A1A1A) — primary foreground, close button fill
- `--ink-mute` (#6B6B6A) — secondary copy
- `--white` (#FDFBF7) — tile placeholders
- `--shadow-modal` — explicitly NOT used in fullscreen (set to `none`)
- Font: `var(--ff-sans, 'Inter', sans-serif)` for UI text, `var(--ff-serif, 'Lora', serif)` for headings/category badge, per The Nineteenth design system.
- Spacing: prefer existing `--spacing-*` scale tokens if defined in your codebase (`--spacing-sm`, `--spacing-lg`, `--spacing-xl`, `--spacing-2xl`) — fall back to literal px values shown in snippets if those tokens don't exist yet.

## Implementation Snippets

### components.css (additive — append after the existing `.visual-selector-rail` block)
```css
wy-prompt-modal .modal-container.fullscreen {
  position: fixed;
  inset: 0;
  top: auto; left: auto; /* override centering offsets */
  width: 100vw;
  height: 100vh;
  max-width: none;
  max-height: none;
  border: 0;
  box-shadow: none;
  border-radius: 0;
  transform: translateY(4%);
}

wy-prompt-modal[open] .modal-container.fullscreen {
  transform: translateY(0);
}

/* the modal IS the screen — suppress the scrim beneath it */
wy-prompt-modal:has(.modal-container.fullscreen) .scrim {
  opacity: 0;
  pointer-events: none;
}

wy-prompt-modal .modal-container.fullscreen .header {
  padding: var(--spacing-2xl, 40px) var(--spacing-2xl, 48px) var(--spacing-sm, 8px);
}

/* widen the rail column; coexists with .visual-selector-modal */
wy-prompt-modal .modal-container.fullscreen .visual-selector-layout,
wy-prompt-modal .modal-container.fullscreen.visual-selector-modal .visual-selector-layout {
  grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
  padding: 0 var(--spacing-2xl, 48px) var(--spacing-2xl, 48px);
}

wy-prompt-modal .modal-container.fullscreen .visual-selector-rail {
  max-height: calc(100vh - 96px);
}

/* 2-column tile grid inside the wider rail */
wy-prompt-modal .modal-container.fullscreen .visual-selector-rail .visual-variation-grid {
  grid-template-columns: repeat(2, 1fr);
}
```
Note: verify the exact transition/duration declaration already used for `[open]` scale animation in your current `components.css` and reuse the same property (likely `transition: transform 0.3s cubic-bezier(0.2, 0, 0.2, 1)` on `.modal-container`) — don't duplicate it, the `fullscreen` rule above only needs to override the `transform` values, not redeclare the transition.

### wy-prompt-modal.js — reflected boolean property + class application
```js
static properties = {
  // ...existing properties...
  variationSelectorTileMode: { type: String, attribute: 'variation-selector-tile-mode' },
  fullScreenModal: { type: Boolean, attribute: 'full-screen' },
};

// in render(), alongside the existing visual-selector-modal class:
// <div class="modal-container ${useVisualSelector ? 'visual-selector-modal' : ''} ${this.fullScreenModal ? 'fullscreen' : ''}">
```
Because `fullScreenModal` is declared `type: Boolean`, setting the JS property to `true` automatically reflects the `full-screen` attribute onto the host (present/absent) — no manual `setAttribute` call needed.

### wy-prompt-editor.js — admin toggle markup (Visuals step, beneath the existing tile-mode toggle)
```html
${this._editedPrompt.variationSelector === 'visual' ? html`
    <wy-option-toggle
        size="compact"
        label="Tile Content"
        description="Choose whether visual selector thumbnails include variant text."
        .options="${['thumbnail', 'details']}"
        .labels="${['Thumbnail only', 'Title + description']}"
        .value="${this._editedPrompt.variationSelectorTileMode === 'details' ? 'details' : 'thumbnail'}"
        @change="${(e) => this._handleVariationTileModeChange(e.detail.value)}"
    ></wy-option-toggle>

    <wy-option-toggle
        variant="switch"
        size="compact"
        label="Full-screen modal"
        description="Expands modal to fill the browser window. Recommended for prompts with many visual variants."
        .options="${[false, true]}"
        .labels="${['Off', 'On']}"
        .value="${this._editedPrompt.fullScreenModal === true}"
        @change="${(e) => this._handleFieldChange('fullScreenModal', e.detail.value === true)}"
    ></wy-option-toggle>
  ` : ''}
```
No new handler method is required — `_handleFieldChange('fullScreenModal', bool)` should write directly into `this._editedPrompt` via whatever generic field setter `variationSelectorTileMode`'s sibling fields already use. Confirm the method name in your current `wy-prompt-editor.js` (it may differ from `_handleFieldChange`).

### app.js — pass the field through when opening the modal
```js
// wherever the modal is opened (same spot variationSelectorTileMode is currently set):
this.promptModal.variationSelectorTileMode = prompt.variationSelectorTileMode || 'thumbnail';
this.promptModal.fullScreenModal = prompt.fullScreenModal === true;
```

### prompts.json — new optional field
```json
{
  "id": "...",
  "variationSelector": "visual",
  "variationSelectorTileMode": "thumbnail",
  "fullScreenModal": true
}
```
Omit or set `false` for all prompts that should keep the centered modal (no migration needed — falsy/absent is the existing default behavior).

## Assets
No new image assets. Thumbnail tiles in the rail reuse whatever images/placeholders the existing `visual-variation-grid` already renders — only the grid's column count changes (1 → 2) in fullscreen.

## Files
- `wy-prompt-modal Fullscreen Variant.dc.html` — the annotated visual mock (fullscreen + visual-selector-mode layout) plus the same code snippets reproduced above, viewable directly in a browser.
