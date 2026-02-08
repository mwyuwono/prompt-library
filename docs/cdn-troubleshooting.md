# CDN Cache Troubleshooting

jsDelivr CDN cache management for the m3-design-v2 design system.

## When to Purge

After pushing any commit to m3-design-v2, or when components/styles behave differently than source code suggests.

## Purge Commands

```bash
# One-liner: purge all variants of all files
for f in src/styles/tokens.css src/styles/main.css dist/web-components.js; do
  for v in @main "" @latest; do
    curl -s "https://purge.jsdelivr.net/gh/mwyuwono/m3-design-v2${v}/${f}"
  done
done
```

Or use the helper script:
```bash
VERIFY_SNIPPET="expected-code-snippet" scripts/design-system-refresh.sh
```

## Verification

```bash
# Check CSS token was updated
curl -s "https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@main/src/styles/tokens.css" | grep "your-changed-property"

# Check JS bundle was updated
curl -s "https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@main/dist/web-components.js" | grep "expected-code-snippet"
```

Then hard refresh the browser (`Cmd+Shift+R`).

## Why Multiple Purges

- jsDelivr caches `@main`, default, and `@latest` separately
- Edge nodes cache independently; one purge may not clear all
- Both CSS and JS must be purged (components depend on both)

## Post-Purge Checklist

1. Purge all CDN variants (command above)
2. Update `?v=YYYYMMDD` in `tokens.css` CDN imports
3. Update `?v=` in `components/index.js` if JS changed
4. Commit version bumps
5. Hard refresh browser

## Known Issues

- **Filter chips not working:** Stale CDN serving old `wy-filter-chip` with internal toggle conflict. Fix: purge CDN.
- **Icons as text:** Shadow DOM isolates fonts. Fix: font import added inside component Shadow DOM styles.
- **Nested shadow variable inheritance:** CSS custom properties don't cascade through nested shadow boundaries. Fix: set variables on outer component host element.
