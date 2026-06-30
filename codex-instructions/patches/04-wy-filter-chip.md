# wy-filter-chip — Issues fix: invisible inactive state

**File:** `components/ui/wy-filter-chip.js`

The inactive chip has `border: 0` and transparent background — it's invisible on the
paper surface. The --wy-filter-chip-border token exists in tokens.css but isn't applied.

## Fix 1 — Add border to :host

```diff
  :host {
    …
    background-color: var(--wy-filter-chip-bg, var(--md-sys-color-surface));
-   border: 0;
+   border: 1px solid var(--wy-filter-chip-border, var(--paper-edge, #DDD6C8));
    color: var(--wy-filter-chip-text, var(--md-sys-color-on-surface));
```

## Fix 2 — Fix hover background formula

```diff
  :host(:hover:not([active])) {
-   background-color: var(--wy-filter-chip-hover-bg,
-     color-mix(in srgb, var(--wy-button-primary-bg, var(--md-sys-color-primary)) 15%, transparent));
+   background-color: color-mix(in srgb, var(--ink, #1A1A1A) 6%, transparent);
+   border-color: color-mix(in srgb, var(--ink, #1A1A1A) 25%, var(--paper-edge, #DDD6C8));
  }
```

## Fix 3 — Active state: also set border-color explicitly

```diff
  :host([active]) {
    background-color: var(--wy-filter-chip-active-bg, …);
    color: var(--wy-filter-chip-active-fg, …);
+   border-color: var(--wy-filter-chip-active-bg, var(--ink, #1A1A1A));
    font-weight: var(--wy-filter-chip-font-weight-active, 500);
```
