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

## Prompt Images

Standard prompts can use a prompt-level image:
```json
{ "image": "public/images/example.jpg" }
```

Prompts with variations should put images on each variation:
```json
{
  "variations": [
    { "id": "v1", "name": "Variant 1", "image": "public/images/example.jpg", "template": "..." },
    { "id": "v2", "name": "Variant 2", "image": "public/images/example-2.jpg", "template": "..." }
  ]
}
```

The first variation image is used as the overall prompt thumbnail in list and grid views. When the prompt is open, the selected variation's image is shown; variations without an image simply omit that image area.

## Supported Input Types

| Type | Config |
|------|--------|
| Text (default) | Omit `inputType` |
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
- Variable `name` matches placeholder exactly
- `inputType` is omitted, `"textarea"`, or `"toggle"` only
- JSON validates (run through a formatter)
- Test in UI: variables render, preview compiles, copy works

For private prompt changes:

- Update `private-prompts.source.json` through admin or locally
- Run `npm run encrypt:private` after changes if the encrypted vault was not auto-refreshed
- If rotating the passcode, update `private-passcode.txt` first, then run `npm run encrypt:private`
- Deploy `private-prompts.enc.json`, not the plaintext source file
