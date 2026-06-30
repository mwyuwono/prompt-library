# wy-button — Minor / optional: uppercase tracking on all variants

**File:** `components/ui/wy-button.js`

⚠ This is a **visible breaking change** — all button labels will become uppercase
with 0.18em tracking. Confirm with product before applying.

Currently only the text variant applies the architectural tracking. The DS tokens
(--md-filled-button-label-text-transform: uppercase, letter-spacing: 0.18em) suggest
all variants should use it.

## If approved — add to .button base rule

```diff
  .button {
    …
    font-family: var(--font-sans);
    font-weight: var(--wy-button-font-weight, 500);
+   text-transform: uppercase;
+   letter-spacing: var(--wy-button-tracking-architectural, 0.18em);
+   font-size: 0.75rem;  /* override per-size if needed */
    border-radius: var(--wy-button-radius, var(--radius-pill, 999px));
```

## Remove from variant-text (it'll inherit)

```diff
  .button.variant-text {
    background-color: transparent;
    color: var(--wy-button-text-fg);
-   text-transform: uppercase;
-   letter-spacing: var(--wy-button-tracking-architectural);
    font-weight: 700;
-   font-size: 0.75rem;
```

## Focus ring: cleaner token reference

```diff
  .button:focus-visible {
-   outline: 3px solid var(--md-sys-color-primary);
+   outline: 2px solid var(--ink, #1A1A1A);
    outline-offset: 2px;
  }
```
