---
name: render-brief
description: High-fidelity, multi-reference image generation with a structured brief, confirmation gate, and mandatory self-review loop. Explicit invocation only via $render-brief. Use for renderings that must faithfully preserve real subjects (properties, products, people, spaces) while accurately adding new elements from separate component references — e.g., architectural renderings for review boards, product-in-scene composites, before/after visualizations. Not for casual one-off image generation; use the built-in imagegen skill for that.
---

# Render Brief — disciplined iterative image generation

This skill wraps the built-in `image_gen` tool with a production process: build a Render Brief, confirm it with the user, generate, then run a mandatory self-review loop against the brief until the output passes or iteration budget is exhausted.

Delegate model mechanics (sizes, quality, edit-vs-generate semantics, transparency) to the built-in imagegen skill's guidance. This skill governs **process**: intake, fidelity, verification, and file management.

## Non-negotiable rules

1. **Never generate before the brief is confirmed.** Always play the completed brief back to the user and wait for explicit approval. This applies to new briefs AND re-runs from saved briefs.
2. **Never skip the self-review loop.** After every generation or edit, view the output and score it against the checklist before showing it to the user or iterating.
3. **One targeted change per edit iteration.** Restate all invariants verbatim in every edit prompt to prevent drift.
4. **Never overwrite outputs.** Every generation gets a new versioned filename.
5. **Load every local input image with `view_image`** before using it, so it is in conversation context for generation/editing.

## Workflow

### Step 1 — Locate or create the project

Ask which project this is for. Projects live wherever the user says; default to a new folder in the current working directory:

```
<project-name>/
├── refs/        # user-provided reference images (never modified)
├── briefs/      # render-brief-<slug>.md files (one per deliverable set)
└── outputs/     # generated images, versioned: <slug>-v1.png, <slug>-v2.png, ...
```

If the user points at an existing project folder with a saved brief in `briefs/`, load it, summarize it, and ask what changed. Update the brief file with any changes before proceeding.

### Step 2 — Build the Render Brief

Interview the user to fill the template in `references/brief-template.md`. Keep the interview short — ask only for what's missing; infer what's evident from provided images and confirm inferences in the playback.

Critical items:

- **Reference image roles.** Every input image gets exactly one role (see `references/roles-and-invariants.md`):
  - `identity` — must be reproduced faithfully (the real property, product, person, space)
  - `component` — must be rendered accurately (fence parts, fixtures, materials being added)
  - `style` — guides mood/lighting/finish only; content must not leak into the output
- **Invariants** — an explicit list of what must NOT change (existing architecture, materials, landscape, sightlines, proportions).
- **New elements** — what is being added, and exactly where new meets existing (connection points, seams, transitions).
- **Deliverables** — count, viewpoints, dimensions/aspect ratio, output filenames.
- **Realism bar & audience** — e.g., "historic district commission; must read as a credible photograph, zero AI tells."

Save the brief to `briefs/render-brief-<slug>.md`.

### Step 3 — Confirmation gate (always)

Play the full brief back to the user in compact form: roles table, invariants, new elements, deliverables, realism bar. Ask: "Confirm, or correct anything before I generate?" **Do not generate until the user confirms.**

### Step 4 — Generate

- Load all reference images into context with `view_image`.
- Compose the prompt per `references/roles-and-invariants.md`: reference images cited by index and role, invariants restated, seams described explicitly, realism/anti-artifact constraints appended.
- Use built-in `image_gen`. One call per deliverable.
- Copy each output into `outputs/` as `<slug>-v1.png` (or next version number).

### Step 5 — Self-review loop (mandatory)

For each output:

1. View the image.
2. Score it against every item in `references/artifact-checklist.md`, grouped as:
   - Invariant fidelity (compare against `identity` references)
   - Component accuracy (compare against `component` references)
   - Integration seams (where new meets existing)
   - AI-artifact scan
3. If practical, crop/zoom into seam areas and high-risk regions and inspect them at detail.
4. Record pass/fail per item with a one-line reason for each fail.

**On failures:** make ONE targeted edit fixing the most severe failure, restating all invariants verbatim, then re-run this step on the new version.

**Stop conditions:**
- All checklist items pass → proceed to Step 6.
- 5 edit iterations per deliverable without full pass → stop, pick the best version, proceed to Step 6 with residual issues documented.
- An invariant regresses twice in a row → stop and consult the user rather than burning iterations.

### Step 6 — Deliver

- Confirm all deliverables exist in `outputs/` with correct versioned names; note which version is the candidate for each.
- Report per deliverable: final path, iteration count, checklist result, and an honest list of residual issues (never claim artifact-free if anything failed).
- Append a short results log to the brief file (date, final versions, residual issues) so the next session starts informed.

## Revision runs

When the user returns with feedback ("commission wants the gate 6 inches taller"):

1. Load the saved brief; apply the feedback as a brief change; save.
2. Confirmation gate (Step 3) on the delta.
3. Prefer editing the last accepted version over regenerating from scratch, restating all invariants.
4. Full self-review loop applies.

## References

- `references/brief-template.md` — blank Render Brief.
- `references/artifact-checklist.md` — the full inspection checklist for Step 5.
- `references/roles-and-invariants.md` — prompt construction for role-labeled multi-reference generation.
