# Prompt Authoring Guide

Rules for adding or editing prompts in `prompts.json` and the local private prompt source.

## Files

- Public prompts live in `prompts.json`
- Private prompts live in `private-prompts.source.json`
- Deployed private vault data lives in `private-prompts.enc.json`

## Variable Substitution

Use `{{variable}}` syntax. Manual placeholders like `[Describe...]` won't be replaced by the app.

```json
{
  "template": "Style: {{style}}\nMood: {{mood}}",
  "variables": [
    { "name": "style", "label": "Painting Style", "placeholder": "e.g., Baroque", "value": "" },
    { "name": "mood", "label": "Mood", "placeholder": "e.g., melancholic", "value": "" }
  ]
}
```

- `name` must match the `{{placeholder}}` exactly (case-sensitive)
- Empty `variables: []` is valid for static prompts

## Variable Scoping

**Prompt-level variables** are shared across all variations:
```json
{ "variables": [...], "variations": [{ "id": "v1", "template": "..." }] }
```

**Variation-level variables** override prompt-level when present:
```json
{ "variations": [{ "id": "v1", "template": "...", "variables": [...] }] }
```

The app checks variation-level first, then falls back to prompt-level.

## Variation Descriptions

Use `variations[].description` only for the unique differentiator of that variant. Do not repeat the parent prompt's job, accepted inputs, or shared usage instructions.

Good:
```json
{ "name": "Manuscript Site Plan", "description": "18th Century Hand Colored Plan" }
```

Avoid:
```json
{ "name": "Manuscript Site Plan", "description": "Recreates an uploaded map, satellite view, or site-plan screenshot as..." }
```

Put common setup, input requirements, and shared usage notes in the parent prompt `description` or `instructions` instead.

## Descriptions And Instructions

Keep all descriptions short. A description should state what the prompt does in language users can scan quickly. Do not put usage instructions, setup steps, or prompt-level instructions in a description.

For multi-step prompts:

- Use the prompt or variation `description` to describe the whole workflow.
- Put actionable guidance for each step in that step's `instructions`.
- Avoid prompt-level or variation-level `instructions` that restate the workflow.

Write instructions as readable markdown. If the content is a sequence or checklist, use a numbered or bulleted list instead of one dense paragraph.

## Prompt Images

Standard prompts can use a prompt-level image:
```json
{ "image": "public/images/example.jpg" }
```

Prompts with variations can use a prompt-level image as an explicit card thumbnail, and can also put images on each variation:
```json
{
  "image": "public/images/prompt-thumbnail.jpg",
  "variations": [
    { "id": "v1", "name": "Variant 1", "image": "public/images/example.jpg", "template": "..." },
    { "id": "v2", "name": "Variant 2", "image": "public/images/example-2.jpg", "template": "..." }
  ]
}
```

The prompt-level image is used as the overall prompt thumbnail in list and grid views. If a multi-variation prompt does not have a prompt-level image, the first variation image is used as the default thumbnail. When the prompt is open, the selected variation's image is shown; variations without an image simply omit that image area.

For image-generation prompts with multiple variants, save the shared base/reference image used to create the variant previews in `public/images/` and record it on the prompt:

```json
{
  "previewBaseImage": "public/images/example-base-reference.png",
  "previewBaseImageDescription": "Short note explaining the standardized preview source."
}
```

When adding or refreshing variant previews later, reuse that same saved base image so the variant thumbnails show standardized outputs from a consistent source. Final project preview images should be exact `1920x1080`.

Prompt execution reference images (`referenceImages[].path`) should use the public S3 asset bucket:

```json
{
  "referenceImages": [
    {
      "variable": "style_reference",
      "label": "Style Reference",
      "path": "https://prompt-library-assets-009019643313.s3.amazonaws.com/reference-images/example-reference.jpg"
    }
  ]
}
```

Keep these reference images out of Git unless they are also used as prompt preview artwork.

Use descriptive preview filenames:

```text
{prompt-slug}-{variant-slug}-{base-subject}-preview.png
{prompt-slug}-base-{base-subject}.png
```

Example:

```text
topographic-site-plan-manuscript-fort-sewall-preview.png
topographic-site-plan-base-fort-sewall-satellite.png
```

## Supported Input Types

| Type | Config |
|------|--------|
| Text (default) | Omit `inputType` or use `"inputType": "text"` |
| Textarea | `"inputType": "textarea"`, optional `"rows"` |
| Toggle | `"inputType": "toggle"`, `"options": ["OFF text", "ON text"]` |

Do **not** use `select`, `checkbox`, or `radio` - they are not implemented.

## Conditional Visibility

```json
{
  "name": "details",
  "dependsOn": "include_details",
  "hideWhen": ""
}
```

The `details` field hides when `include_details` equals the empty string (toggle OFF).

## Checklist

Before committing public prompt changes to `prompts.json`:

- All `{{variable}}` placeholders have entries in `variables`
- No manual placeholders like `[Describe...]`
- Variation descriptions state only what makes that variant different
- Variable `name` matches placeholder exactly
- `inputType` is omitted, `"text"`, `"textarea"`, or `"toggle"` only
- JSON validates with `node validate-prompts.js`
- Validation warnings are acceptable only for intentional literal examples or known unused helper variables
- Test in UI: variables render, preview compiles, copy works

### Image Preview Validation

When changing generated preview images, validate JSON, referenced image paths, and final dimensions:

```sh
jq empty prompts.json
jq -r '.[] | select(.id=="PROMPT_ID") | [.image,.previewBaseImage,(.variations[]?.image)][] | select(. != null and . != "")' prompts.json | while read -r p; do test -f "$p" || echo "missing $p"; done
magick identify -format '%f %wx%h\n' public/images/*preview*.png
```

Multi-variant prompt preview images should report `1920x1080`.

For private prompt changes:

- Update `private-prompts.source.json` through admin or locally
- Run `npm run encrypt:private` after changes if the encrypted vault was not auto-refreshed
- If rotating the passcode, update `private-passcode.txt` first, then run `npm run encrypt:private`
- Deploy `private-prompts.enc.json`, not the plaintext source file
