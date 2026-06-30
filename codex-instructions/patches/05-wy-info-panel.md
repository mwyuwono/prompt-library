# wy-info-panel — Issues fix: DM Sans, radius, border, :host tokens

**File:** `components/ui/wy-info-panel.js`

## Fix 1 — Replace DM Sans with var(--ff-sans)

Search the entire file for `'DM Sans'` and replace every occurrence:

```diff
- font-family: var(--font-sans, 'DM Sans', sans-serif);
+ font-family: var(--ff-sans, 'Inter', sans-serif);
```

This affects: .panel, ::slotted(*), and any other font-family declarations.

## Fix 2 — Remove border-radius from .panel

```diff
  .panel {
    background-color: var(--wy-info-panel-bg);
-   border-radius: var(--md-sys-shape-corner-medium, 16px);
    padding: var(--wy-info-panel-padding);
```

## Fix 3 — Add border to .panel

```diff
  .panel {
    background-color: var(--wy-info-panel-bg);
+   border: 1px solid var(--wy-info-panel-border, var(--paper-edge, #DDD6C8));
    padding: var(--wy-info-panel-padding);
```

## Fix 4 — Fix panel-heading font

```diff
  .panel-heading {
-   font-family: var(--font-serif, 'Playfair Display', serif);
+   font-family: var(--ff-serif, 'Lora', 'Playfair Display', serif);
```

## Fix 5 — Move :host token defaults to components.css

The :host block redefines --wy-info-panel-* variables. In light DOM these definitions
don't cascade to children. Remove the variable declarations from :host {} in the
component and add them to components.css instead (already included in the components.css
file in this ZIP).

Remove from :host {}:
```diff
  :host {
    display: block;
-   --wy-info-panel-bg: var(--md-sys-color-background, #FDFBF7);
-   --wy-info-panel-border: var(--md-sys-color-surface-container-highest, #D7D3C8);
-   --wy-info-panel-text-color: #52525B;
-   --wy-info-panel-compact-bg: var(--md-sys-color-secondary-container, #E8DDD7);
-   --wy-info-panel-compact-border: var(--md-sys-color-outline-variant, #DDD);
-   --wy-info-panel-padding: var(--spacing-lg, 24px);
-   --wy-info-panel-compact-padding: var(--spacing-md, 16px);
-   --wy-info-panel-font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
  }
```

The variables are now defined at the wy-info-panel element level in components.css.
