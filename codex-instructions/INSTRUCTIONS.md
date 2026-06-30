# Component Refinement — Codex Implementation Instructions

Post-migration audit of 11 wy-* components. Work top-to-bottom; the criticals must be
done before smoke-testing. Each patch file in `patches/` has the exact code to apply.

## Priority order

| # | Component | Severity | Est. effort |
|---|-----------|----------|-------------|
| 1 | wy-modal | **Critical** | ~30 min |
| 2 | wy-controls-bar | **Critical** | 5 min |
| 3 | wy-links-modal | Issues | 15 min |
| 4 | wy-filter-chip | Issues | 10 min |
| 5 | wy-info-panel | Issues | 10 min |
| 6 | wy-toast | Minor | 2 min |
| 7 | wy-copy-confirm | Minor | 2 min |
| 8 | wy-button | Minor | 5 min (confirm with product first) |
| 9 | wy-tabs | Minor | 5 min (optional) |
| 10 | index.js | Cleanup | 2 min |

## Build step

After editing any file in `components/ui/`, run:

```bash
npm run build:components
```

Then verify on all four pages: index.html, private.html, admin.html, admin-settings.html.

## Where styles live

- **Component logic/markup** → `components/ui/<name>.js`
- **Light-DOM CSS overrides** → `components.css` (create if missing; import after tokens.css)
- **Token defaults** → `tokens.css` (do not change existing entries, only add missing component tokens)

## Verification checklist

After all patches are applied and bundle is rebuilt:

- [ ] Open index.html — no console errors, no horizontal overflow
- [ ] Open private.html — no console errors
- [ ] Open admin.html — prompt editor loads, no shadow-root references in console
- [ ] Open admin-settings.html — no console errors
- [ ] Open a prompt card → copy button → wy-copy-confirm appears, 0px radius
- [ ] Open links modal → chips have border, transparent bg, no DM Sans network request
- [ ] Open a prompt modal → modal renders (not blank), heading is Lora serif
- [ ] Filter chips show a visible border when inactive
- [ ] Controls bar: search expands on mobile, chip-track fade mask works on desktop
- [ ] Toast appears and auto-dismisses, 0px radius
- [ ] Color palette drawer opens and closes correctly
