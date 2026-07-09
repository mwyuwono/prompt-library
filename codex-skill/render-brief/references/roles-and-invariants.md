# Multi-reference prompt construction

How to compose generation and edit prompts from a confirmed Render Brief.

## Principles

1. **Cite images by index and role.** The model must know which image is ground truth for what. Never pass references without stating their job.
2. **Identity beats style.** If a style reference conflicts with an identity reference (color cast, materials), identity wins — say so in the prompt.
3. **Invariants are restated verbatim in every prompt** — first generation and every edit. Drift happens when invariants are assumed to carry over. They don't.
4. **Describe seams explicitly.** The highest-risk regions are where new meets existing. Name each connection point and the intended transition.
5. **Edits change one thing.** Name the single change, then repeat the full invariant block.

## Prompt skeleton (generation)

```text
Task: photorealistic rendering of <deliverable description> for <audience>.

Input images:
- Image 1 (identity — reproduce faithfully): <what it shows>. Every visible feature must appear exactly as in this image.
- Image 2 (identity — reproduce faithfully): <what it shows>.
- Image 3 (component — render accurately): <what it shows>. Match its geometry, proportions, spacing, materials, color, and finish exactly.
- Image 4 (style — mood only): use only its lighting/mood. Do not copy any objects, materials, or colors from it.

Scene: <viewpoint, framing, time of day, weather>.

New elements: <what is added, where, with dimensions and materials, per component references>.

Seams: <connection point 1: how new meets existing>. <connection point 2: ...>.

Invariants — do not change any of the following:
- <invariant 1>
- <invariant 2>
- ...

Realism requirements: single consistent light source and shadow direction; correct perspective shared by all elements; natural material textures; crisp fine structures (pickets, railings, branches); uniform grain and sharpness across the frame.

Avoid: <brief's avoid list>; no text, no watermark, no people unless specified; no warped geometry; no invented or removed features.
```

## Prompt skeleton (edit iteration)

```text
Edit the previous image. Change ONLY: <single targeted fix, precisely located — e.g., "the shadow cast by the new gate post nearest the driveway: align its direction with the house's shadows (falling to the northwest) and match their softness">.

Keep everything else in the image exactly as it is.

Invariants — do not change any of the following:
- <full invariant block, verbatim from the brief>

Avoid: <brief's avoid list>.
```

## Role behaviors

| Role | Model instruction | Verification target |
|------|-------------------|---------------------|
| identity | "reproduce faithfully; every visible feature exactly as shown" | Checklist section A |
| component | "render accurately; match geometry, spacing, materials, color, finish" | Checklist section B |
| style | "mood/lighting only; copy no content" | No content leakage; identity/component still win conflicts |

## Common failure → prompt fix

- **Invariant drifted over iterations** → the invariant block was shortened or paraphrased; restore it verbatim and edit from the last version where the invariant held.
- **Component looks "inspired by" rather than matched** → enumerate its measurable properties in the prompt (e.g., "flat-top pickets, ~2:1 picket-to-gap ratio, square 4x4 posts with pyramid caps, semi-gloss black").
- **Seam looks composited** → add an explicit transition sentence ("the new rail dies into the existing post at the same height as the existing rail; continuous shadow line across both") and require uniform grain across the frame.
- **Scene beautified** (lawn greener, house cleaner) → add invariant: "preserve the existing conditions exactly, including wear, weathering, and imperfections."
- **Fine structures merging** → name the structure and its count/spacing; request a wider framing or generate at higher resolution, then verify at zoom.
