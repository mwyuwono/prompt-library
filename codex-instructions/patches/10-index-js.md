# components/ui/index.js — Cleanup: remove Material Web imports

**File:** `components/ui/index.js`

After wy-modal no longer uses <md-dialog>, the Material Web imports are unused.

## Remove these two lines

```diff
- import '@material/web/icon/icon.js';
- import '@material/web/dialog/dialog.js';
```

## Verify before removing

Before deleting, grep the codebase for md-dialog and md-icon usage:

```bash
grep -r "md-dialog\|md-icon\|<md-" components/ --include="*.js"
```

If other components still reference them, keep the imports until those are also migrated.
