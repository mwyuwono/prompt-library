# Verification checklist — post-implementation

Run after `npm run build:components`.

## Console checks (browser devtools)

Open each page and check for zero console errors and zero shadow-root warnings.

- [ ] http://localhost:8000 (index.html) — public site
- [ ] http://localhost:8000/private.html — private vault
- [ ] http://localhost:3001/admin.html — admin editor
- [ ] http://localhost:3001/admin-settings.html — settings page

Expected: no `customElements.define()` errors, no `md-dialog` undefined warnings,
no `shadowRoot` null reference errors.

## Functional checks

### wy-modal
- [ ] Open any prompt modal → modal overlay renders (not blank/empty)
- [ ] Heading uses Lora serif (inspect: font-family in devtools)
- [ ] ESC key closes modal
- [ ] Click outside box closes modal
- [ ] Mobile (≤600px): modal slides up from bottom, full width

### wy-controls-bar
- [ ] Desktop: chip-track has fade mask on right edge when chips overflow
- [ ] Desktop: scrolling page causes bar to float (fixed position)
- [ ] Mobile: tapping search icon expands input, chips fade out
- [ ] Mobile: Cancel button closes search and clears input

### wy-links-modal
- [ ] No DM Sans network request in Network tab
- [ ] All link chips are transparent with a visible border (not white)
- [ ] Hovering chip shows border darken
- [ ] Palette entry button uses Inter font

### wy-filter-chip
- [ ] Inactive chips have a visible outline (1px paper-edge border)
- [ ] Active chip has ink background + paper text
- [ ] Hover on inactive chip shows subtle ink tint

### wy-info-panel
- [ ] Text renders in Inter (not DM Sans)
- [ ] Panel has 0px border-radius (square corners)
- [ ] Panel has a visible 1px border

### wy-toast
- [ ] Toast appears with 0px radius (square corners)
- [ ] Auto-dismisses after duration
- [ ] Error variant shows warm tint on icon

### wy-copy-confirm
- [ ] Panel appears with 0px radius
- [ ] Close button is square (0px radius)
- [ ] Link chips are pill-shaped (999px) as before

## index.js cleanup
- [ ] No `@material/web` import errors in console
- [ ] Run: `grep -r "md-dialog\|md-icon" components/ --include="*.js"`
      → should return 0 results after migration
