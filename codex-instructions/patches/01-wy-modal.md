# wy-modal — Critical fix: replace md-dialog

**File:** `components/ui/wy-modal.js`

The component currently renders `<md-dialog>` which will be undefined after removing
Material Web. Replace the entire render() and styles block.

## 1. Replace static styles

Remove the entire `static styles = css`...`` block. Styles move to `components.css`.

## 2. Replace render()

```js
render() {
  if (!this.open) return html``;
  return html`
    <div class="wy-modal-scrim" @click="${this._handleOverlayClick}">
      <div class="wy-modal-box" style="max-width: ${this.maxWidth}">
        <header class="wy-modal-header">
          <h2 class="wy-modal-heading">${this.heading}</h2>
        </header>
        <div class="wy-modal-body">
          <slot></slot>
        </div>
        <footer class="wy-modal-footer">
          <slot name="actions"></slot>
        </footer>
      </div>
    </div>
  `;
}
```

## 3. Fix _handleClose and _handleCancel

They currently reference md-dialog events. Simplify:

```js
_handleOverlayClick(e) {
  if (e.target === e.currentTarget) {
    this.close();
  }
}

_handleClose(e) {
  this.open = false;
  this.dispatchEvent(new CustomEvent('close', {
    bubbles: true,
    composed: true
  }));
}

_handleCancel(e) {
  this.open = false;
}
```

## 4. Add CSS to components.css

See `components.css` in this ZIP — the full `wy-modal` block is included.

## 5. Remove createRenderRoot override if present

In light DOM mode the component must have:
```js
createRenderRoot() { return this; }
```
If not already present, add it above the static properties declaration.
