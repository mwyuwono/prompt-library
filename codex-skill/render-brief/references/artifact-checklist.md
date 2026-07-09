# Self-review checklist

Score every item pass/fail for each generated output. One-line reason per fail. Fix the most severe fail first; severity order is the section order below.

## A. Invariant fidelity (vs. `identity` references)

- [ ] Every listed invariant is visually unchanged (feature-by-feature against the brief's invariants list)
- [ ] Existing structures: correct geometry, proportions, rooflines, window/door placement and counts
- [ ] Existing materials and colors match references (siding, brick, trim, roofing, paving)
- [ ] Existing landscape/hardscape unchanged unless the brief says otherwise (trees, plantings, walkways, grade)
- [ ] Nothing present in the identity references has been removed, moved, or "improved"
- [ ] Nothing has been invented in areas the brief did not authorize changing

## B. Component accuracy (vs. `component` references)

- [ ] Component geometry matches reference (profiles, spacing, proportions — e.g., picket width and gap)
- [ ] Component materials, color, and finish match reference
- [ ] Component scale is correct relative to surroundings (check against door heights, siding courses, people-scale cues)
- [ ] Correct count/repetition (no extra or missing pickets, panels, posts, fixtures)
- [ ] Hardware and connection details plausible and consistent with reference

## C. Integration seams (where new meets existing)

- [ ] Connection points align physically (heights match, lines continue, no floating or embedded geometry)
- [ ] Lighting direction and color temperature consistent across new and existing
- [ ] Shadows: new elements cast shadows consistent in direction, softness, and density with existing shadows
- [ ] Perspective: new elements obey the same vanishing points and horizon as the scene
- [ ] Ground contact: new elements meet the ground convincingly (no hover, no smudge)
- [ ] Reflections/occlusions correct (new elements properly in front of/behind existing ones)

## D. AI-artifact scan

- [ ] No warped or bent geometry (wavy straight lines, melted edges, curved posts)
- [ ] No texture melt or improbable repetition (cloned bushes, tiled brick patterns, smeared grass)
- [ ] No phantom objects, orphan fragments, or half-formed elements
- [ ] No gibberish text, mangled signage, or pseudo-lettering anywhere
- [ ] No oversmoothed "plastic" surfaces where real texture is expected
- [ ] No impossible lighting (multiple sun directions, shadowless objects, glow without source)
- [ ] Edges crisp and natural — no halos, fringing, or cutout look around inserted elements
- [ ] Fine structures intact (railings, pickets, branches, wires — no merging or dissolving)
- [ ] Overall noise/grain/sharpness uniform across the frame (composited regions not detectably different)

## E. Deliverable spec

- [ ] Correct viewpoint per brief
- [ ] Correct dimensions/aspect ratio per brief
- [ ] All "Avoid" items from the brief are absent

## Zoom inspection

When practical, crop and view at detail before scoring C and D:
- every seam listed in the brief
- fine repeated structures (fences, railings, shingles)
- ground-contact lines of new elements
- any region that failed in a previous iteration
