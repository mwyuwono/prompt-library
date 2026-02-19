# Fabric Colorizer — Implementation Plan

## Context

The existing fabric-palette page lets me organize color swatches used in fabric pattern design. This feature extends it for collaboration: I add SVG fabric designs to the site, collaborators open a shared URL, pick colors layer by layer, and download a modified SVG. No backend, no auth, no persistence — everything is client-side and session-only.

**Feasibility: High (95% confidence).** All required browser APIs (inline SVG DOM manipulation, `<input type="color">`, `XMLSerializer`, `URL.createObjectURL`) are natively supported with zero dependencies.

---

## Architecture

### New Files to Create

```
fabric-colorizer/
    index.html              # Gallery — lists all designs as cards
    colorizer.html          # Colorizer — single SVG editing view
    colorizer.js            # All JS logic shared by both pages
    colorizer.css           # Page styles (matches palette.html's Tailwind CDN pattern)
    designs-manifest.json   # Central registry of designs + layer metadata
    designs/
        [design-id]/
            design.svg      # Colorizable SVG (author-authored per guidelines below)
            thumbnail.png   # Pre-rendered thumbnail for gallery card
```

### File to Modify

- `vercel.json` — add `{ "src": "fabric-colorizer/**", "use": "@vercel/static" }` to builds array

### Navigation Flow

```
/fabric-colorizer/index.html (Gallery)
  → click card → /fabric-colorizer/colorizer.html?design={id}
  → reads ?design= param → fetches manifest → fetches SVG → injects inline
  → user edits colors → Download SVG → XMLSerializer Blob download
```

---

## Data Model

### designs-manifest.json

```json
[
  {
    "id": "jacket-001",
    "title": "Classic Blazer",
    "description": "Single-breasted jacket with notch lapels",
    "thumbnail": "./designs/jacket-001/thumbnail.png",
    "svgPath": "./designs/jacket-001/design.svg",
    "layers": [
      { "id": "layer-body",    "label": "Body / Outer Shell" },
      { "id": "layer-collar",  "label": "Collar" },
      { "id": "layer-lining",  "label": "Lining" },
      { "id": "layer-buttons", "label": "Buttons" }
    ]
  }
]
```

Layer `id` values map 1:1 to `<g id="...">` elements in the SVG. Labels are human-readable and come from the manifest, not the SVG file.

---

## SVG Authoring Requirements

SVGs must follow these conventions for the colorizer to work:

1. **Each colorizable region is a `<g>` with a `layer-` prefixed `id`:**
   ```xml
   <g id="layer-body" fill="#CCCCCC">
     <path d="..."/>
   </g>
   ```

2. **Fill is a presentation attribute on the `<g>`, NOT a CSS class or `<style>` block** — CSS specificity beats presentation attributes, making group-level fill override impossible.

3. **Child `<path>` elements must NOT have their own `fill` attribute** (they inherit from the parent `<g>`). Exception: `fill="none"` for strokes/outlines — those are skipped by the colorizer.

4. **Non-colorizable elements** (outlines, decorative lines) go in a separate group without the `layer-` prefix, e.g., `<g id="outlines">`.

5. **Illustrator export:** "Export As > SVG" → CSS Properties: "Presentation Attributes". Layer names → SVG `id` attributes.

6. **Inkscape export:** "Save As > Plain SVG" (not Inkscape SVG). Layer names → `id` attributes.

---

## Implementation: Core Technical Pieces

### 1. SVG Injection (colorizer.js)

```javascript
const response = await fetch(design.svgPath);
const svgText = await response.text();
const parser = new DOMParser();
const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
const svgEl = document.importNode(svgDoc.documentElement, true);
// Make responsive — override hardcoded width/height
svgEl.removeAttribute('width');
svgEl.removeAttribute('height');
svgEl.style.cssText = 'width: 100%; height: 100%;';
previewContainer.appendChild(svgEl);
```

### 2. Apply Color to Layer

```javascript
function applyColorToLayer(svgEl, layerId, hex) {
  const g = svgEl.getElementById(layerId);
  if (!g) return;
  g.setAttribute('fill', hex);
  // Force on each child shape to override any path-level fill attributes
  g.querySelectorAll('path, rect, circle, polygon, ellipse, polyline').forEach(el => {
    if (el.getAttribute('fill') !== 'none') {
      el.setAttribute('fill', hex);
    }
  });
}
```

### 3. SVG Download

```javascript
function downloadSVG(svgEl, designId) {
  const serializer = new XMLSerializer();
  const svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    serializer.serializeToString(svgEl.cloneNode(true));
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${designId}-colorized.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
```

### 4. Swatch Integration

- Fetches `../fabric-palette/shareable-color-swatches.json` (same-origin, no CORS issue)
- Renders all 21 primary swatches as clickable color circles in the color picker panel
- Native `<input type="color">` at bottom for custom colors
- Clicking any color immediately calls `applyColorToLayer()`

---

## UI Layout (colorizer.html)

```
┌──────────────────────────────────────────────┐
│ ⚠ Session-only banner (non-dismissable)       │
├────────────────────────┬─────────────────────┤
│                        │ LAYER PANEL          │
│   SVG PREVIEW          │ ─────────────────── │
│   (responsive,         │ ● Body / Outer Shell │
│    fills left panel)   │ ● Collar             │
│                        │ ● Lining             │
│                        │ ─────────────────── │
│                        │ COLOR PICKER         │
│                        │ [21 swatch circles]  │
│                        │ [Custom color input] │
│                        │ ─────────────────── │
│                        │ [↓ Download SVG]     │
└────────────────────────┴─────────────────────┘
```

**Workflow:**
1. User clicks a layer row → layer highlighted as active
2. Color picker shows (already visible, just tracks active layer)
3. User clicks swatch or custom color → color applies immediately to SVG preview + layer row preview square updates
4. Repeat for other layers
5. Click "Download SVG" → file saved locally

---

## Styling Approach

**CSS scope: Local to `fabric-colorizer/`** — this is new UI not in the design system.

The colorizer pages follow the same pattern as `fabric-palette/palette.html`:
- Tailwind CSS CDN (same plugins: `forms`, `container-queries`)
- Google Fonts: Inter + Playfair Display + Material Symbols
- Inline `<style>` block for custom animations/effects not covered by Tailwind
- No m3-design-v2 token imports (palette page doesn't use them; match that pattern for consistency)

---

## Key Constraints / Gotchas

1. **No SVG files exist yet** — implementation creates the plumbing; the first real design can be added as a test case with a placeholder SVG.

2. **CSS-based fills in SVGs break the colorizer** — must be caught at authoring time. A helper function could warn in console if a layer uses CSS class fills.

3. **Gradient fills become flat** — XmlSerializer replaces gradient fill with hex. Acceptable for v1; can document this limitation.

4. **Inkscape namespaces in download** — harmless extra XML namespace attributes in the exported SVG. Not worth cleaning up in v1.

5. **No URL state** — colorway is not encoded in the URL. Each session starts from the SVG's default colors. Future enhancement: encode color state in URL hash.

---

## Design Mockups

Reference mockups are in `docs/fabric-design-examples/`. Use these as the visual source of truth during implementation.

| Screen | Files |
|--------|-------|
| Gallery | `docs/fabric-design-examples/fabric_designs_collection_view/screen.png` + `code.html` |
| Colorizer | `docs/fabric-design-examples/print_colors_editor_-_editorial_variant_1_of_3/screen.png` + `code.html` |

**Key design tokens from mockups (override the Stitch prompts below where they differ):**
- Primary accent: `#2C4C3B` (Hunter Green) — not earth-brown
- Background: `#FDFBF7` (Alabaster)
- Surface: `#FFFFFF`
- Border: `#E5E0D8` (taupe)
- Fonts: Manrope (body/labels), Playfair Display (headings), DM Sans (caps/tracking labels), Material Symbols Outlined
- Border-radius: `1rem` default, `1.5rem` lg, `full` for pills
- Header: WY monogram logo (left), centered "Prints / Palette" pill nav, sticky with backdrop-blur
- Footer: `© 2024 Weaver-Yuwono Family Office. All rights reserved.`

**Layer row details from colorizer mockup:**
- Each row: `[40×40 color swatch square with inner shadow]` + `[layer name bold]` + `[hex + color name in small muted text below]` + `[visibility icon]` + `[lock icon]` (right side)
- Active row: `border-2 border-primary` + left accent bar + `bg-white shadow-sm`
- Inactive rows: `border border-taupe-border bg-background-light`
- "Reset All" text link in top-right of Layers section header
- Visibility toggle and lock icons per layer (Material Symbols: `visibility`, `visibility_off`, `lock_open`, `lock`)

**Color picker from colorizer mockup:**
- `+` (add custom) button as last item in grid — dashed circle border, `add` icon
- No `<input type="color">` in the mockup — custom colors added via the `+` button only
- Auto-Contrast toggle section below color grid (toggle switch, label + subtitle)

**Download section (colorizer mockup, pinned to bottom of right panel):**
- Full-width pill button: `DOWNLOAD SVG` + download icon, tracking-widest, uppercase
- Below: "CANCEL" text-only button (all caps, small, letter-spaced)
- Section floats above with `border-t` separator, `absolute bottom-0`

---

## UI Requirements (Stitch AI Prompt Format)

> Copy each block verbatim into Google Stitch as a separate screen prompt.

---

### Screen 1: Fabric Gallery (`fabric-colorizer/index.html`)

Reference mockup: `docs/fabric-design-examples/fabric_designs_collection_view/`

```
Desktop web page. Background #FDFBF7 (Alabaster). Fonts: Manrope (body), Playfair Display (headings), Material Symbols Outlined.

HEADER (sticky, backdrop-blur): Left: circular WY monogram (40px, bg #2C4C3B, white Playfair serif text). Center/Right nav: pill buttons — "Prints" (filled #2C4C3B, white text) and "Palette" (ghost, charcoal text). Border-bottom #e7ecf3.

WARNING BANNER (non-dismissable): Full-width #FFF8E1 (amber-soft) bar below header. Material Symbol: warning (green #2C4C3B). Text: "Color changes are session-only and will not be saved. Download your SVG after editing." Center-aligned. No close button.

MAIN CONTENT (max-width 1440px, padding 120px desktop):
- Hero: "Fabric Designs" h1 in Playfair Display, 5xl/6xl, tight tracking. Subtitle "Select a design to start colorizing" in Manrope, muted (#1A1C18/70).
- Card grid: 3 columns desktop, 2 tablet, 1 mobile. Gap 8-10.

CARD (each design):
- 4:5 aspect ratio image thumbnail, object-cover, rounded-lg (1rem), shadow-sm → shadow-xl on hover
- Hover: card lifts (-translate-y-1), image scales slightly (scale-105 on inner div, 500ms transition)
- Bottom-right badge: pill "#2C4C3B bg, white text, font-bold, text-xs" showing "N layers"
- Below image: title in Manrope medium, charcoal. Subtitle (description) in small muted charcoal/60.
- Title color transitions to #2C4C3B on hover.

FOOTER: Border-top, centered small text "© 2024 Weaver-Yuwono Family Office. All rights reserved." charcoal/40.
```

---

### Screen 2: Fabric Colorizer (`fabric-colorizer/colorizer.html`)

Reference mockup: `docs/fabric-design-examples/print_colors_editor_-_editorial_variant_1_of_3/`

```
Desktop web page. Full-viewport height, no scroll on outer body. Background #FDFBF7. Fonts: DM Sans (body/labels), Playfair Display (headings), Manrope (caps/tracking labels), Material Symbols Outlined.

HEADER (80px, border-bottom #E5E0D8): Left: WY monogram circle (40px, bg #2C4C3B). Center (absolute): pill nav — "Prints" filled #2C4C3B, "Palette" ghost text link. No back button in header.

MAIN LAYOUT (calc 100vh - 80px, flex-row, no overflow):
LEFT PANEL (60% width, padding 40px, flex-col, center content):
  - Design title: Playfair Display, 4xl/5xl, color #2C4C3B, font-medium
  - Subtitle: "Variant 1: Editorial Gallery" small, #2C4C3B/60, tracking-wide
  - Zoom controls (top-right of left panel): 3 circular ghost buttons (40px) with border #E5E0D8, shadow-sm — icons: add, remove, center_focus_strong (Material Symbols)
  - SVG preview card: white bg, rounded-xl, border #E5E0D8/50, editorial shadow (0 20px 40px -10px rgba(44,76,59,0.08))
    - Inner area: bg #f4f1ea, subtle dot-grid overlay (opacity-20), rounded-lg
    - SVG centered, 75% of container, slight scale on group hover (1.02, 700ms ease-out)
    - "PREVIEW MODE" pill badge: bottom-right, white/90 bg, backdrop-blur, text-xs, font-bold, tracking-wider, border border-primary/10

RIGHT PANEL (40% width, white bg #FFFFFF, border-left #E5E0D8, shadow-xl, flex-col, z-10):
  - Scrollable content area with custom scrollbar (6px, #2C4C3B/10 thumb)
  - Pinned bottom action section

  LAYERS SECTION (inside scroll):
    - Header: "LAYERS" label in xs, font-bold, tracking-[0.2em], uppercase, #2C4C3B/80. Right: "Reset All" text link xs, text-primary.
    - Layer rows (space-y-4):
      INACTIVE ROW: padding 16px, rounded-lg, border #E5E0D8, bg #FDFBF7, hover:border-primary/30, cursor-pointer.
        Left: [40×40 rounded swatch square with inner shadow showing current fill color] + [layer name Manrope semibold #2C4C3B] + [hex code + color name in xs muted text below name]
        Right: [visibility icon button] [lock_open icon button] — both text-primary/40 hover:text-primary
      ACTIVE ROW: border-2 border-primary, bg-white, shadow-sm, overflow-hidden. Left accent bar (4px wide, absolute, bg-primary). Layer name is font-bold. Icons use full primary color.

  PALETTE COLORS SECTION (inside scroll, below layers):
    - Header: "PALETTE COLORS" label, same style as Layers header
    - 5-column grid of circular swatch buttons (aspect-square, rounded-full):
      - Each: bg set to swatch hex color, border-2 border-transparent, hover:scale-110 hover:border-primary/30, focus:ring-2 ring-primary ring-offset-2
      - Selected swatch: ring-2 ring-primary ring-offset-2 active
      - Last item: dashed-border circle with "add" Material Symbol, text-primary/50 hover:text-primary
    - Auto-Contrast toggle block below grid: rounded-lg, bg #FDFBF7, border #E5E0D8, padding 16px.
      Left: label "Auto-Contrast" Manrope semibold + "Adjust text color automatically" xs muted. Right: toggle switch (checked state = bg-primary).

  PINNED BOTTOM (absolute bottom-0, padding 32px, border-top #E5E0D8, bg white):
    - "DOWNLOAD SVG" pill button: full-width, rounded-full, bg #2C4C3B hover:#1e3629, white text, font-bold, tracking-widest, text-sm, shadow-lg. Right icon: download (Material Symbol, slides right on hover).
    - "CANCEL" text button: full-width, rounded-full, border-transparent, text-primary, font-bold, text-xs, tracking-widest, uppercase.
```

---

## Verification

1. **Deploy check:** Add `fabric-colorizer/**` to `vercel.json`, push, confirm Vercel builds without error.
2. **Gallery page:** Loads `designs-manifest.json`, renders design cards.
3. **SVG injection:** A test SVG with 3 named layers loads and renders correctly in the preview panel.
4. **Color apply:** Clicking a swatch changes the correct layer color in the live preview.
5. **Custom color:** Native `<input type="color">` applies color correctly.
6. **Download:** Downloaded SVG opens in browser/Illustrator with modified colors baked in.
7. **Session-only:** Reloading the page resets all colors to SVG defaults.
8. **Sharing:** A `?design=test-001` URL shared to another browser opens the correct design.
