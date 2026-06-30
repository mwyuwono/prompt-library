# wy-tabs — Minor / optional: serif italic active tab

**File:** `components/ui/wy-tabs.js`

The active tab currently uses font-weight: 700 (bold Inter). An editorial alternative
is Lora italic at 500 weight — more on-brand for The Nineteenth.

This is optional — discuss with product. Option A (current) is safe; Option B is more
editorial.

## Option B — Serif italic active tab

```diff
  .tab-item.active {
-   color: var(--md-sys-color-text-heading);
-   font-weight: 700;
+   color: var(--ink, #1A1A1A);
+   font-family: var(--ff-serif, 'Lora', serif);
+   font-style: italic;
+   font-weight: 500;
  }
```

## Also: replace MD color tokens with canonical tokens

```diff
  :host {
    display: block;
-   border-bottom: 1px solid var(--md-sys-color-outline-variant);
+   border-bottom: 1px solid var(--paper-edge, #DDD6C8);
  }

  .tab-item {
    …
-   color: var(--md-sys-color-on-surface-variant);
+   color: var(--ink-mute, #6B6B6A);
  }

  .tab-item:hover {
-   color: var(--md-sys-color-text-heading);
+   color: var(--ink, #1A1A1A);
  }

  .tab-item.active::after {
    …
-   background-color: var(--md-sys-color-primary);
+   background-color: var(--ink, #1A1A1A);
  }
```
