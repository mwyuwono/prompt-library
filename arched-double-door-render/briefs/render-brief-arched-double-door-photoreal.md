# Render Brief: arched-double-door-photoreal

Date: 2026-07-08
Project folder: /Users/mwy/Library/Mobile Documents/com~apple~CloudDocs/Projects/prompts-library/arched-double-door-render
Status: confirmed

## Purpose & audience

- What these images are for: review-board/client-facing architectural visualization of a historic arched double-door assembly.
- Realism bar: must read as a credible high-resolution close-up architectural photograph; zero AI tells.
- Tone/constraints from audience: conservative historic-detail accuracy, no beautification beyond converting the sketch into plausible real painted wood, glass, trim, shadow, and hardware.

## Reference images

| # | File (in refs/) | Role | What it establishes |
|---|-----------------|------|---------------------|
| 1 | identity-arched-double-door.jpeg | identity | Overall arched double-door composition, arched opening, double doors, central vertical divider, casing, trim hierarchy, door panel layout, muntin rhythm, proportions, and historic character. |
| 2 | style-component-transom-hardware.png | component | Operable arched transom construction, inward bottom-hinged sash position, dark glass, frame thickness, chain-stay path, central brass anchor loop, antique brass brackets, scale and hardware quality. |
| 3 | style-component-transom-hardware.png | style | Photorealistic architectural-detail finish: painted wood texture, dark non-scenic glass, soft directional lighting, shadow depth, historic trim detail, and antique brass material realism. |

Roles: `identity` = reproduce faithfully · `component` = render accurately · `style` = mood/lighting only, no content leakage.

## Invariants (must not change)

- Preserve Image 1's overall portrait arched double-door composition and close-up architectural framing.
- Preserve the large arched opening, outer casing, inner arched trim, trim hierarchy, sill/rail stack, and historic surround proportions.
- Preserve the two main lower doors, central vertical meeting line, door proportions, upper glazed panel placement, lower recessed panel placement, and rectangular trim hierarchy.
- Preserve the arched transom as two equal operable sash sections divided by the central vertical divider.
- Preserve the transom muntin rhythm and sash proportions from Image 1 while rendering the sash construction with Image 2's realism and hardware logic.
- Preserve the historic character and cream-painted wood palette, translated from sepia sketch into realistic aged painted wood.
- Preserve dark, non-scenic glass. Glass must not reveal exterior scenery, people, landscape, sky, rooms, labels, reflections with readable content, or background views.
- Preserve believable physical clearances, frame thickness, curved top rails, and sash geometry within each half of the arched opening.
- Preserve only two chain-stay runs: one from the upper outside face/stile of the left open sash to a single central brass anchor loop on the vertical center divider, and one from the upper outside face/stile of the right open sash to that same central anchor loop.
- Preserve both transom sash sections open inward toward the viewer from a bottom hinge axis, with top edges tilted inward/downward.

## New elements

- What is added: photorealistic materialization of Image 1's sketch as painted historic wood, dark glass, shadowed trim, and antique brass transom hardware, using Image 2 as the strict component/style reference.
- Placement: all architecture remains in the Image 1 composition; Image 2's transom operation and hardware are applied only to the arched transom area above the double doors.
- Seams: each transom sash sits physically within its own half of the arched opening with visible clearances at the arched frame, central divider, and bottom hinge rail; the two chain-stays attach with small brass brackets at the upper outside sash stiles and meet at one shared brass anchor loop on the central vertical divider.

## Deliverables

| # | Slug | Viewpoint | Size/aspect | Notes |
|---|------|-----------|-------------|-------|
| 1 | arched-double-door-photoreal | Portrait close-up matching Image 1's composition, slightly architectural-rendering clean but photographic | Portrait, preserve Image 1's approximate 0.74 width/height ratio; high resolution | Full arched double-door assembly, not a cropped transom-only detail. |

## Avoid

- No people.
- No labels, text, annotations, signage, watermark, pseudo-lettering, or diagrams.
- No exterior scenery or background views through glass.
- No third chain, duplicate chain, extra diagonal support, improvised chain path, or additional support hardware.
- No altered door layout, altered panel count, changed muntin rhythm, missing central divider, or missing arched casing.
- No stylized illustration, sketch, watercolor, sepia drawing, blueprint, concept-art look, or painterly rendering.
- No plastic-smooth surfaces, melted trim, warped arches, inconsistent perspective, impossible hinge motion, or floating hardware.

## Results log

<!-- Appended per session: date, final versions, iteration counts, residual issues -->

### 2026-07-08

- Generated: outputs/arched-double-door-photoreal-v1.png
- Source generated image: /Users/mwy/.codex/generated_images/019f43b0-f366-7fb2-ba2e-15563b45b841/ig_0d245e9be36c3b4d016a4ec699d3988194a9df4f8de3ce8be5.png
- Iterations: 1 generation, 0 edit iterations
- Checklist: pass
- Review notes: Identity composition, arched opening, double doors, central divider, trim hierarchy, panel layout, dark glass, and portrait framing preserved. Component operation reads as two inward-opening arched transom sash sections. Hardware reads as two antique brass chain-stay runs meeting at one central brass anchor with no visible third support chain. Material realism, painted wood texture, shadow depth, and dark non-scenic glass match the style reference well.
- Residual issues: none requiring iteration; minor inherent uncertainty remains around exact hinge-axis readability because the sash are rendered in perspective.
