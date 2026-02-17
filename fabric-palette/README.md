# Robert Brown Color Palette

A single-page color palette that renders swatches from external JSON data and supports copy-to-clipboard on click.

## Files

- `RB Color Palette.html`: UI + rendering + clipboard logic
- `swatches.json`: swatch data source loaded at runtime

## Open from Finder (Recommended)

Use `/Applications/RB Color Palette.app`.

What it does:
- Starts a local web server in this project folder on `127.0.0.1:8123` (if not already running)
- Opens `http://127.0.0.1:8123/RB%20Color%20Palette.html`

## Run manually

From this folder:

```bash
python3 -m http.server 8123 --bind 127.0.0.1
```

Then open:

`http://127.0.0.1:8123/RB%20Color%20Palette.html`

## Update colors

Edit `swatches.json` and refresh the browser.

Expected object shape:

```json
{
  "id": "unique-id",
  "brand": "Brand Name",
  "title": "Display Name",
  "alt": "Accessible description",
  "primary": { "name": "Color Name", "hex": "#RRGGBB" },
  "secondary": []
}
```
