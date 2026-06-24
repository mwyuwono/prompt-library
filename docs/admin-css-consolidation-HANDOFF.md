# Admin CSS / Component Migration — Handoff

_Status as of 2026-06-24. Session ended early (usage limit). This note captures
what shipped, what remains, and how to verify._

## What shipped (committed to `admin.css` only — no JS, no rebuild needed)

**Stage 1 — Shared Admin foundation tokens (DONE, verified).**
Added a single source-of-truth token block on the editor host elements
(`wy-prompt-editor, wy-variation-editor, wy-step-editor, wy-variable-editor,
wy-reference-image-editor, wy-image-upload, wy-code-textarea, wy-dropdown,
wy-option-toggle`) at the top of the `=== BEGIN admin editor ===` region:

- `--admin-field-bg` — neutral input/panel surface (= old `--admin-neutral-field`)
- `--admin-panel-bg` — white nested surface
- `--admin-hairline` / `--admin-hairline-soft` / `--admin-hairline-strong` — inset 1px ink washes
- `--admin-menu-border` — dropdown/menu border
- `--admin-radius` / `--admin-radius-pill` — control geometry
- `--admin-focus-inset` + `--admin-focus-ring` — restrained rust focus ring
- `--admin-shadow-card` — near-flat static card shadow

Token values were defined to **equal the current effective literals**, so Stage 1
is a pure DRY refactor with **zero rendering change** (verified by headless
screenshot at 1280px on `#antiques-expert` — pixel-identical to baseline).

- Replaced all `var(--admin-neutral-field)` usages with `var(--admin-field-bg)`
  and removed the redundant local `--admin-neutral-field` definition.
- Renamed the `=== BEGIN admin editor (light DOM migrated) — generated ===`
  marker to drop the "generated" framing.

## What remains OUTSTANDING

**Stage 2 — Migrate `wy-form-field` off shadow DOM (NOT STARTED).**
`wy-form-field` is the last shadow-DOM component affecting Admin styling. It is
used ~10× inside the (light-DOM) `wy-prompt-editor` (6×: Title, Slug, Prompt ID,
Description, Instructions, Icon) and `wy-variation-editor` (4×: Variation Name +3).
The `error` prop is never used; `required` used twice; `description` several times.

Recommended approach (lowest risk): **inline the wrapper into the two parents and
delete the component** — a light-DOM Lit `wy-form-field` cannot keep projected
children without a `<slot>`, which is why it was deferred. Replace each
`<wy-form-field label=".." id=".." [description] [required]><input/textarea></wy-form-field>`
with:

```html
<div class="form-field">
  <label class="field-label" for="ID">LABEL<span class="req">*</span></label>   <!-- *=required only -->
  <p class="field-description">DESCRIPTION</p>                                   <!-- if description -->
  <input id="ID" ...>
</div>
```

Then in `admin.css` (light-DOM region) add a `.form-field` block driven by the new
tokens (`--admin-field-bg`, `--admin-radius`, `--admin-hairline`,
`--admin-focus-inset`/`--admin-focus-ring`) so the inlined inputs match the rest of
the editor. Reuse the existing `wy-prompt-editor .label` (3333) eyebrow style for
`.field-label`. Update the adjacency rule
`wy-prompt-editor .card > wy-form-field + wy-form-field` → `.form-field + .form-field`,
and the `wy-prompt-editor wy-form-field { --field-bg }` mapping can be deleted once
the element is gone. Also fixes a latent **duplicate-`id`** bug (the `<wy-form-field>`
and its child `<input>` currently share the same `id`).

Files: `components/ui/wy-prompt-editor.js` (~1144–1203),
`components/ui/wy-variation-editor.js` (~369–413),
`components/ui/index.js` (remove `wy-form-field` registration),
then `npm run build:components` to regenerate `web-components.js`.
Update CLAUDE.md (move `wy-form-field` from "Still shadow DOM (deferred)" to migrated).

**Stage 3 — Physically consolidate the two trailing staging blocks (NOT STARTED).**
The trailing `/* ---- requested visual deltas (override) ---- */` (~3256) and
`/* ---- admin polish pass ... ---- */` (~3308) blocks still override earlier
foundational rules rather than living in their component sections. They are now
tokenized-ready but not yet relocated. Key findings for a safe merge:

- The blocks win purely by source order at **equal specificity** — merge by
  computing the per-property winner, writing it once in the component section, and
  deleting both the earlier foundational copy and the trailing override.
- Watch the traps: several "override" rules mix live + dead declarations
  (e.g. `.variation-card` at 3257 sets a `border` that survives even though its
  `background`/`box-shadow` are superseded at 3613/3705).
- Provably-dead and safe to delete outright: the trailing
  `wy-prompt-editor .variation-display-setting` (~3293) rule — fully superseded by
  the later 3511 definition.
- **Preserve the rust sticky save bar exactly**: `wy-prompt-editor .actions`
  (rust background, pill radius, `padding: 10px 10px 10px 20px`) + `.toolbar-title`
  (1.75rem, contrast color) must not change.
- After merging, swap remaining literal `color-mix(... var(--ink) X%)` washes and
  `var(--surface-2)` field surfaces to the Stage-1 tokens, and normalize the
  per-control focus rings (input 16%, dropdown 18%, variation toggle 24%) onto the
  shared `--admin-focus-ring`.

## Verification harness (works in this sandbox)

Headless Chromium needs one missing lib stubbed (no root available):
```bash
# build once:
cd /tmp/libx && printf 'unsigned long XDamageCreate(void*a,unsigned long b,int c){return 0;}\nvoid XDamageDestroy(void*a,unsigned long b){}\nvoid XDamageSubtract(void*a,unsigned long b,unsigned long c,unsigned long d){}\nint XDamageQueryExtension(void*a,int*b,int*c){return 0;}\n' > stub.c && gcc -shared -fPIC -o libXdamage.so.1 stub.c
# run server + screenshots in ONE shell (each bash call has an isolated netns and
# kills bg procs on exit):
cd <repo> && node server.js >/tmp/s.log 2>&1 & SRV=$!; sleep 2.5; \
  LD_LIBRARY_PATH=/tmp/libx node /…/outputs/shot.mjs <tag>; kill $SRV
```
`shot.mjs` captures `#architectural-rendering` and `#antiques-expert` at 1280 &
1024, plus the expanded variant selector and open dropdown. Baseline shots are in
`outputs/baseline/`, Stage-1 in `outputs/stage1/` (pixel-identical — good).

## Outstanding checks
- `git diff --check` — run on host (the VM mount can't see `.git`).
- Re-screenshot + diff after Stage 2 and Stage 3; confirm no console/page errors
  and that the variant selector, Visual Variant Selector, Prompt Image, Variables,
  Reference Images, and the 1024px layout are unchanged.
