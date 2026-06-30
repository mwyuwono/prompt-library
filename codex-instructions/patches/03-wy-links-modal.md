# wy-links-modal — Issues fix

**File:** `components/ui/wy-links-modal.js`

## Fix 1 — Remove _loadFonts() entirely

Delete the `_loadFonts()` method and its call in `connectedCallback()`:

```diff
  connectedCallback() {
    super.connectedCallback();
-   this._loadFonts();
    this._escKeyHandler = this._handleEscKey.bind(this);
  }
```

Delete the full `_loadFonts() { … }` method body. Inter is loaded globally via tokens.css.

## Fix 2 — Chip background: white → transparent + border

In `static styles`, find `.link-chip`:

```diff
  .link-chip {
-   background-color: var(--md-sys-color-surface-container-lowest);
+   background-color: transparent;
+   border: 1px solid var(--paper-edge, #DDD6C8);
    color: var(--wy-links-modal-chip-text-color, #44403C);
```

## Fix 3 — Chip hover: refine state layer

The current `.link-chip::before` hover uses a color-mix with primary. Keep it but
ensure the border also shifts on hover:

```diff
+ .link-chip:hover {
+   border-color: color-mix(in srgb, var(--ink, #1A1A1A) 40%,
+     var(--paper-edge, #DDD6C8));
+ }
```

## Fix 4 — palette-entry-btn: DM Sans → Inter, radius fix

```diff
  .palette-entry-btn {
-   font-family: 'DM Sans', sans-serif;
+   font-family: var(--ff-sans, 'Inter', sans-serif);
-   border-radius: 20px;
+   border-radius: var(--radius-pill, 999px);
```

## Fix 5 — Remove duplicate border on .modal-container

The rule has `border:` declared twice. Remove the first one:

```diff
  .modal-container {
    …
-   border: 1px solid color-mix(in srgb, …);   ← REMOVE this first one
    …
    border: 1px solid color-mix(in srgb, var(--md-sys-color-on-surface) 5%, transparent);
```

(Keep whichever declaration comes last in the rule, or consolidate to:
`border: 1px solid var(--paper-edge);`)

## Fix 6 — shadowRoot reference in _focusFirstElement()

```diff
- const closeButton = this.shadowRoot?.querySelector('.close-button');
+ const closeButton = this.querySelector('.close-button');
```
