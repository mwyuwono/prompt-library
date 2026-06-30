# wy-toast — Minor fix: border-radius

**File:** `components/ui/wy-toast.js`

The Nineteenth design system uses border-radius: 0 for containers (no rounding).

## Fix

```diff
  .toast-container {
    background-color: rgba(26, 26, 26, 0.62);
    backdrop-filter: blur(20px) saturate(140%);
    …
-   border-radius: 8px;
+   border-radius: 0;
    …
  }
```

No other changes needed. The rest of the component is well-crafted:
glass morphism effect, token usage, animation easing, and mobile layout are all correct.
