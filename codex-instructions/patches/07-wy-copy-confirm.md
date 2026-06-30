# wy-copy-confirm — Minor fix: border-radius

**File:** `components/ui/wy-copy-confirm.js`

## Fix 1 — Container

```diff
  .container {
    background-color: var(--ink, #1A1A1A);
    color: var(--paper, #F7F4EE);
    padding: 16px;
-   border-radius: 8px;
+   border-radius: 0;
```

## Fix 2 — Close button

```diff
  .close {
    width: 28px;
    height: 28px;
    padding: 0;
    border: 0;
-   border-radius: 4px;
+   border-radius: 0;
```

No other changes needed.
