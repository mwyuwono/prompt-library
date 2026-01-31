# Prompt: Update CDN Import and Cache Management Documentation

Update the CLAUDE.md documentation to establish better practices for CDN imports and cache management. Make the following changes:

## Changes Required

### 1. Update the "Import Pinning Policy" section

Replace the current policy with this improved approach:

**Default: Use semantic version tags when available, otherwise `@main` with cache-busting.**

**Preferred import strategies (in order of preference):**

1. **Semantic version tags** (most reliable):
   ```javascript
   import 'https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@v1.2.3/dist/web-components.js';
   ```
   - Predictable, immutable references
   - Clear upgrade path via version bumps
   - Requires tagging releases in the design system repo

2. **`@main` with cache-busting parameter** (good for rapid iteration):
   ```javascript
   import 'https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@main/dist/web-components.js?v=20260131';
   ```
   - Gets latest from main branch
   - Version parameter forces browser cache refresh
   - Update the `?v=YYYYMMDD` parameter when design system changes

3. **Commit hash pinning** (emergency fallback only):
   ```javascript
   // TEMPORARY: Pinned due to [specific issue]. Revert to @main by [date].
   import 'https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@abc1234/dist/web-components.js';
   ```
   - Only use when CDN is serving stale `@main` after purging
   - MUST include a comment explaining why and when to revert
   - Should be resolved within 24-48 hours

**NEVER pin to a commit hash without:**
- A comment explaining the specific issue
- A TODO with target date to revert
- Filing an issue or noting the root cause

### 2. Add a new section: "Browser Cache Management"

Add this section after the CDN Cache Purging section:

#### Browser Cache Management (Safari Specific)

Safari aggressively caches CSS and JS files even with proper `Cache-Control` headers. To ensure users see updates:

**For local CSS/JS files (`tokens.css`, `styles.css`):**
- Always use cache-busting query parameters: `href="styles.css?v=YYYYMMDD"`
- Update the version parameter whenever the file changes
- Use the current date format: `?v=20260131`

**For CDN imports:**
- Prefer versioned tags or add `?v=YYYYMMDD` to `@main` imports
- After design system changes, update the version parameter in consuming projects

**When making style changes:**
1. Update the CSS file
2. Increment the `?v=` parameter in `index.html`
3. Purge jsDelivr CDN if design system changed
4. Commit both changes together

### 3. Update components/index.js

Change the current pinned import to use cache-busting:

```javascript
// Import design system web components
// Update ?v= parameter after design system changes to bust browser cache
import 'https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@main/dist/web-components.js?v=20260131';
```

Remove any TODO comments about switching back to @main since we're now using @main with cache-busting.

### 4. Add to the "When Making Changes" section

Add this checklist item:

**After design system changes:**
- [ ] Purge jsDelivr CDN cache (run the purge commands)
- [ ] Update `?v=` parameter in `components/index.js`
- [ ] Update `?v=` parameters in `index.html` if CSS changed
- [ ] Commit all version bumps together
