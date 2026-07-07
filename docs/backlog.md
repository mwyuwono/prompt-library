# Backlog

Keep this list short and remove items when they are resolved.

## Prompt validation warnings

- Review literal placeholder examples in `mochi-cloze-flashcards` and `reusable-prompt-builder`; reword or escape them if they confuse authors.
- Review the unused `reference_image` variable in the `engraving-conversion` / `fauvist-post-impressionist` variation and remove or wire it if accidental.

## Quick Text reusable variable library — web surface

- Shipped and manually verified on the Mac app (`{{@name}}` resolution, corpus `variables` schema, "Insert Variable" authoring, "Variables Library" admin surface, update-all/fork edit propagation, unresolved-reference rendering, delete warning — see `quick-text/README.md` "Reusable variable library"). Not yet ported to `web/quick-text-component/quick-text.js`, which still only has phrase-local `{{name}}`/`{{a/b}}` placeholders. Build the web side against the same shipped spec/behavior in the README rather than re-deriving it, and keep the two surfaces' interaction style consistent.

## Quick Text atomic phrase cards

- Atom `start`/`end` offsets are UTF-16 code units in the web component but `Character` counts in the Mac app (`Array(value)` indexing). Fine for ASCII; would diverge on emoji/combining characters. Pick one convention and align both surfaces if a non-ASCII atomic phrase is ever added.
- No UI on either surface remaps existing atom offsets when `value` is edited afterward — offsets can silently go stale. Consider either live remapping on text edit or a validation warning when an atomic phrase's `updatedAt` changes without its atoms being touched.
- `atom.label` exists in the schema (`Atom.label` in Swift) but nothing sets or displays it yet on either surface — wire it into both editors or drop it from the schema.
- Neither editor supports reordering atoms or manually retyping bounds, only add-from-selection and remove; fine for the one seeded atomic phrase today, revisit if atomic cards become common.
