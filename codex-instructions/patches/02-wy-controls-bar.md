# wy-controls-bar — Critical fix: shadowRoot references

**File:** `components/ui/wy-controls-bar.js`

Three `this.shadowRoot?.querySelector` calls silently return null in light DOM,
breaking the chip-track fade mask and mobile search UX.

## Exact replacements (search → replace)

### Fix 1 — _bindChipsTrackScroll()
```diff
- const track = this.shadowRoot?.querySelector('.chips-track');
+ const track = this.querySelector('.chips-track');
```

### Fix 2 — updated() mobile search focus (line ~updated method)
```diff
- this.shadowRoot?.querySelector('.search-input')?.focus();
+ this.querySelector('.search-input')?.focus();
```

### Fix 3 — _clearSearch()
```diff
- this.shadowRoot?.querySelector('.search-input')?.focus();
+ this.querySelector('.search-input')?.focus();
```

### Fix 4 — _closeMobileSearch() / dismissSearch() if also referencing shadowRoot
Search the whole file for `shadowRoot` and replace every occurrence with the plain
`this.querySelector` equivalent.

## Also add createRenderRoot if not present

```js
createRenderRoot() { return this; }
```

## Visual design

The visual design of wy-controls-bar is correct and needs no CSS changes.
