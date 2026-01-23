# Prompt Template Guidelines

## Overview

This document provides guidelines for creating and maintaining prompts in `prompts.json` to ensure consistent behavior and prevent common issues.

## Variable Substitution Rules

### Rule 1: Use `{{variable}}` syntax, not manual placeholders

**❌ INCORRECT:**
```json
{
    "template": "Style: [Describe the style...]\nClothing: [Describe the clothing...]"
}
```

**✅ CORRECT:**
```json
{
    "template": "Style: {{style}}\nClothing: {{clothing}}",
    "variables": [
        {
            "name": "style",
            "label": "Painting Style",
            "placeholder": "e.g., 19th-century academic, Baroque",
            "value": ""
        },
        {
            "name": "clothing",
            "label": "Clothing Description",
            "placeholder": "e.g., simple classical attire",
            "value": ""
        }
    ]
}
```

**Why:** Manual placeholders like `[Describe...]` won't be replaced by the app's variable substitution engine. They also don't show up as input fields in the UI.

### Rule 2: Variables can be at prompt-level OR variation-level

**Prompt-Level Variables (Shared across all variations):**
```json
{
    "id": "my-prompt",
    "title": "My Prompt",
    "variables": [
        {"name": "text", "label": "Text", "placeholder": "Enter text", "value": ""}
    ],
    "variations": [
        {
            "id": "casual",
            "template": "Text: {{text}}\n\nRewrite this casually..."
        },
        {
            "id": "formal",
            "template": "Text: {{text}}\n\nRewrite this formally..."
        }
    ]
}
```

**Variation-Level Variables (Specific to each variation):**
```json
{
    "id": "my-prompt",
    "title": "My Prompt",
    "variables": [],
    "variations": [
        {
            "id": "custom",
            "template": "Style: {{style}}\n\nRender in this style...",
            "variables": [
                {"name": "style", "label": "Style", "placeholder": "e.g., Baroque", "value": ""}
            ]
        },
        {
            "id": "preset",
            "template": "Render in classical style..."
            // No variables needed for this variation
        }
    ]
}
```

**Why:** The app's `getActiveVariables()` function checks for variation-level variables first, then falls back to prompt-level variables. This allows flexible reuse.

### Rule 3: Empty variables array is valid

If a prompt/variation doesn't need variables (e.g., image-based prompts), use an empty array:

```json
{
    "id": "image-analyzer",
    "title": "Image Analyzer",
    "variables": [],
    "template": "Analyze the uploaded image and provide insights..."
}
```

## Variable Input Types

### Supported Types

1. **Text Input (default)**
   ```json
   {
       "name": "title",
       "label": "Title",
       "placeholder": "Enter title",
       "value": ""
   }
   ```

2. **Textarea** (for multi-line input)
   ```json
   {
       "name": "content",
       "label": "Content",
       "placeholder": "Enter content",
       "value": "",
       "inputType": "textarea",
       "rows": 10
   }
   ```

3. **Toggle** (for boolean/conditional values)
   ```json
   {
       "name": "include_examples",
       "label": "Include Examples",
       "inputType": "toggle",
       "options": ["", "Include 3 examples."],
       "value": ""
   }
   ```

### Unsupported Types

❌ **DO NOT USE:**
- `inputType: "select"` - Not implemented
- `inputType: "checkbox"` - Not implemented
- `inputType: "radio"` - Not implemented

## Testing Checklist

Before committing changes to `prompts.json`:

- [ ] All `{{variable}}` placeholders have corresponding entries in `variables` array
- [ ] No manual placeholders like `[Describe...]` in templates
- [ ] Variable `name` matches the placeholder exactly (case-sensitive)
- [ ] `inputType` is either omitted, `"textarea"`, or `"toggle"`
- [ ] Prompt-level OR variation-level variables are used consistently
- [ ] Test the prompt in the UI to ensure variables render correctly

## Common Issues & Fixes

### Issue: Variables not showing in UI

**Symptom:** Opening a prompt modal shows no input fields, or missing fields.

**Diagnosis:**
1. Check if the prompt has variations
2. If yes, check if the active variation has its own `variables` array
3. If no variation-level variables exist, check prompt-level `variables`

**Fix:**
- Add `variables` array to the variation that needs them
- OR move variables to prompt-level if they should be shared

### Issue: Placeholders not being replaced

**Symptom:** Template shows `[Describe the style...]` instead of user input.

**Diagnosis:** Template uses manual placeholders instead of `{{variable}}` syntax.

**Fix:**
1. Replace `[Describe...]` with `{{variable_name}}`
2. Add corresponding variable to `variables` array

## Example: Converting Manual Placeholders

**Before (Broken):**
```json
{
    "id": "custom-style",
    "template": "Style: [Enter style here]\nMood: [Enter mood here]"
}
```

**After (Fixed):**
```json
{
    "id": "custom-style",
    "template": "Style: {{style}}\nMood: {{mood}}",
    "variables": [
        {
            "name": "style",
            "label": "Style",
            "placeholder": "e.g., Impressionist, Renaissance",
            "value": ""
        },
        {
            "name": "mood",
            "label": "Mood",
            "placeholder": "e.g., melancholic, joyful",
            "value": ""
        }
    ]
}
```

## Validation Script (Future Enhancement)

Consider creating a validation script to run before commits:

```bash
# Check for manual placeholders
grep -n '\[.*\.\.\.\]' prompts.json

# Check for {{variables}} without corresponding definitions
# (Requires custom jq script)
```

## UI Styling Conventions

### Design System Overview (Meeting Minutes Architect)

The prompts-library uses a warm, editorial design system with:
- Serif headings (Playfair Display) in deep forest green
- Pill-shaped buttons and badges
- Clean white inputs with subtle borders
- Right-aligned action buttons
- Uppercase form labels with wide letter-spacing

### Button Color Usage

**Primary Action Buttons** (Copy, Save, Submit):
- Background: `var(--brand-primary)` (deep forest green #2A3D31)
- Text: `#FFFFFF` (white)
- Border radius: `var(--md-sys-shape-corner-pill)` (50px pill shape)
- Hover: `color-mix(in srgb, var(--brand-primary) 85%, #000000)` (15% darker)
- **DO NOT** use `var(--color-charcoal)` for primary buttons

**Secondary/Outlined Buttons** (Cancel, Download):
- Background: transparent
- Border: `1px solid var(--color-border-subtle)`
- Text: `var(--color-action-primary)` (gold)
- Border radius: `var(--md-sys-shape-corner-pill)` for consistency

**Text-only Actions** (links, "Clear All"):
- Text: `var(--color-action-primary)` (gold)
- No background or border

### Typography Conventions

**Modal Headings:**
- Font family: `var(--font-serif)` (Playfair Display)
- Color: `var(--brand-primary)` (deep forest green #2A3D31)
- Creates editorial, sophisticated hierarchy

**Variable Labels:**
- **Capitalization**: ALL UPPERCASE for form labels (e.g., "PAINTING STYLE")
- **Font Weight**: Bold (700) for strong hierarchy
- **Letter Spacing**: `var(--tracking-wide)` (0.025em) for readability
- Labels should be clear and descriptive

**Tab Labels:**
- Normal case (not uppercase)
- Clean sans-serif styling
- Minimal 2px underline for active state

### Badge/Pill Components

**Category Badges:**
- Background: `var(--tag-bg)` (muted beige #E8E4D8)
- Text: `var(--color-text-secondary)`
- Border radius: `var(--md-sys-shape-corner-pill)` (50px)
- Font size: 0.625rem
- Letter spacing: `var(--tracking-widest)`
- **DO NOT** use category-specific colors (all badges uniform)

**Variable Count Badges:**
- Match category badge styling exactly
- Uniform muted beige background

### Input Field Styling

**Text Inputs & Textareas:**
- Background: `var(--input-bg)` (#FFFFFF clean white)
- Border: `1px solid var(--input-border)` (#D1CDC2 subtle gray)
- **DO NOT** use transparent backgrounds
- Border radius: `var(--md-sys-shape-corner-extra-small)` (4px)

### Button Layout

**Modal Actions & Card Actions:**
- Alignment: `justify-content: flex-end` (right-aligned)
- Gap: `1rem` between buttons
- Buttons: `flex: 0 0 auto` (natural sizing, no stretching)

### Button Text Guidelines

- Use descriptive labels: "Copy to Clipboard" not just "Copy"
- Include context in download buttons: "Download .txt" with icon
- Maintain consistency with design mockups

---

**Last Updated:** January 23, 2026
**Related Docs:** CLAUDE.md (Variable Types section), INTEGRATION-LOG.md (Design System)
