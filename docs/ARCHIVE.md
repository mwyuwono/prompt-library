# Archive

Historical implementation notes preserved for reference. These document completed work and are not actively maintained.

---

## Design System Integration (Jan 23, 2026)

Three-phase integration of `m3-design-v2`:

1. **Token Integration** - Replaced generic M3 tokens with Hunter Green palette, migrated typography to Manrope/Playfair Display, created legacy variable mappings for backward compatibility.
2. **Component Adoption** - Integrated `wy-filter-chip` (category chips) and `wy-toast` (notifications) as Web Components via Lit 3.x CDN importmap. No build step required.
3. **Editorial Design Refactor** - Aligned with "Meeting Minutes Architect" aesthetic: serif headings, pill-shaped buttons/badges, forest green (`#2A3D31`) primary color, uniform beige badges, right-aligned modal actions.

**Files:** `tokens.css` (full rewrite), `styles.css` (110 line changes), `index.html`, `components/` directory added.

---

## Style Guide v2.0 (Jan 11, 2026)

Design philosophy: warm, elegant, gallery-like aesthetic.

**Core palette:** Linen `#F9F7F2` (bg), Charcoal `#1C1C1C` (text/buttons), Olive `#3D4435` (featured cards), Gold `#C4A484` (accents), Warm Grey `#707070` (secondary).

**Typography:** Playfair Display (titles), Inter (body). **Cards:** White (default, 24px radius, 400px height) and Olive (featured, glow effect). **Buttons:** Pill-shaped primary (charcoal) and secondary (linen+border). **Focus:** 3px solid Gold outline, 2px offset on all interactive elements.

Badge system: Gold (creative categories), Olive (professional), Warm Grey (specialized).

---

## Multi-Step Prompt Editing (Feb 3, 2026)

Added full multi-step prompt editing to admin and public site.

**Components created:** `wy-step-editor` (380 lines) - collapsible step cards with CRUD operations.

**Components enhanced:** `wy-prompt-editor` (mode detection, conversion logic), `wy-prompt-modal` (lifecycle methods for state sync).

**6 bugs fixed:**
1. Steps not displaying - missing import in build entry point
2. Radio button cancel ignored - changed `@change` to `@click` + `preventDefault()`
3. Preview area blank - added `updated()` lifecycle to populate `_values` from step variables
4. Random step selection - race condition; added `willUpdate()` to validate props before render
5. Navigation buttons broken - event handlers failed during race condition renders
6. Tab toggle broken - inline arrow functions unreliable in Shadow DOM; switched to bound methods with data attributes

**Key insight:** LitElement lifecycle order matters: `willUpdate()` (validate) -> `render()` -> `updated()` (sync derived state).

---

## Variation Management (Feb 3, 2026)

Bidirectional conversion between standard and variations modes in admin.

- `_convertToVariations()` / `_convertFromVariations()` methods added to `wy-prompt-editor`
- Discard changes fix: deep copy prompt data (`JSON.parse(JSON.stringify())`) to ensure Lit detects reference changes
- Save handler fix: traverse three levels of Shadow DOM to read textarea values from step editors

---

## Component Adaptation Workflow (Jan 26, 2026)

Added "Component Adaptation (Design System)" prompt (#22, Productivity category). Static prompt with 6-phase workflow for adapting external components to m3-design-v2 with Playwright verification.

Also fixed invisible prompt cards caused by empty motion tokens from CDN - added fallback values to `tokens.css`.

---

## Controls-Bar Refactor (Feb 2026)

Fixed inconsistent styling between scrolled/non-scrolled states. Root cause: design system tokens had incorrect defaults that overrode component-level changes. Fixed search background, filter chip colors, borders, and active states in `m3-design-v2/src/styles/tokens.css`.

**Lesson:** Always audit local token overrides before making design system changes. Token precedence: consuming project > design system tokens > component defaults.

---

## CSS Cache Postmortem (Feb 3, 2026)

Design system changes not appearing in admin despite rebuilds. Root causes:
1. Source files edited but `dist/web-components.js` not rebuilt
2. Bundle not copied to `prompt-library/web-components.js`
3. Duplicate CSS selectors (second overwrites first at equal specificity)

**Resolution:** Created `m3-design-v2/scripts/deploy.sh` to automate build, copy, and cache-busting updates.

---

## Zero-Trust Verification (Jan 27, 2026)

Automated Playwright testing of production site. 6/8 tests passed. Modal padding misalignment (8px difference between header and content) identified and fixed.

---

## Admin Layout Fix

Double-scrolling behavior fixed by changing `.admin-page` from `min-height: 100vh` to `height: 100vh; overflow: hidden`.
