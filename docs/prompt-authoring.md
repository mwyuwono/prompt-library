# Prompt Authoring Guide

Rules for adding or editing prompts in `prompts.json`.

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

Before committing changes to `prompts.json`:

- All `{{variable}}` placeholders have entries in `variables`
- No manual placeholders like `[Describe...]`
- Variable `name` matches placeholder exactly
- `inputType` is omitted, `"textarea"`, or `"toggle"` only
- JSON validates (run through a formatter)
- Test in UI: variables render, preview compiles, copy works
