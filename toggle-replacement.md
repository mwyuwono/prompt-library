# Toggle Component Replacement Plan

## Problem

The existing `wy-toggle-field` web component is broken and does not display correctly. This plan defines requirements for a replacement component derived from actual use cases in the site — not from the broken implementation.

---

## How the Toggle Is Used: Identified Use Cases

Three prompts use toggle variables. Two distinct patterns emerge:

### Pattern A — Conditional Text Injection
The toggle inserts a block of instruction text when ON, or nothing when OFF.

**Examples:**
- "Masked Image" toggle (ceramic-scene-porcelain): OFF = `""`, ON = `"Limit all edits to only the areas masked by the user..."`
- "Ko-Imari Palette" toggle (ceramic-scene-porcelain): OFF = `""`, ON = `"Use skin tones consistent with the 'Ko-Imari' palette..."`

**UX intent:** Let the user opt into additional AI instructions without cluttering the prompt by default. The OFF state contributes nothing to the output.

### Pattern B — Semantic Value Pair
Both states produce a meaningful word substituted directly into the template.

**Example:**
- "Background" toggle (fabric-vector-prep): OFF = `"White"`, ON = `"Transparent"`
- Template reads: `"...on a solid, neutral {{background}} background..."`

**UX intent:** Let the user choose between two named options. Both choices affect the output.

### Pattern C — Conditional Visibility Trigger (secondary behavior)
A toggle's value can show or hide other variable fields via `dependsOn` / `hideWhen`. This is handled by `app.js`, not by the component itself — the component only needs to emit the right change event for this to work.

---

## Why a Classic Toggle Switch Is the Wrong Pattern Here

A standard toggle switch communicates ON/OFF (enabled/disabled). It gives no indication of *what* either state means. For Pattern A (where OFF = silence and ON = a long instruction block), users cannot see what they are enabling. For Pattern B (where both states have named values like "White" and "Transparent"), a toggle with no labels forces users to guess.

---

## Recommended Replacement: `wy-option-toggle`

A **two-option pill selector** (also called a segmented control). Both option labels are always visible. The selected option is highlighted. This makes both states legible at a glance for all existing use cases.

### Visual Design

```
Label text
┌───────────────────────────────┐
│  [ Option A ]   Option B      │   ← Option A selected (filled)
└───────────────────────────────┘

┌───────────────────────────────┐
│    Option A   [ Option B ]    │   ← Option B selected (filled)
└───────────────────────────────┘
```

- Pill-shaped outer container (uses `--md-sys-shape-corner-full`)
- Both option labels visible at all times
- Selected option: filled with `--md-sys-color-primary`, label in `--md-sys-color-on-primary`
- Unselected option: transparent background, label in `--md-sys-color-on-surface-variant`
- Hover state: use `--md-sys-state-hover-opacity` overlay (pseudo-element, not direct background change)
- Smooth transition using `--md-sys-motion-duration-short2` and `--md-sys-motion-easing-standard`
- For Pattern A (OFF = empty string): the first option label should display a meaningful fallback. Since the `label` in options[0] can be empty, the component should display `"Default"` or `"Off"` if options[0] is an empty string, but still emit the empty string as the value.

### Component Name

`wy-option-toggle`

Retire `wy-toggle-field`. Do not keep both.

---

## Component API

### Attributes / Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `options` | `Array` | `null` | Required. Exactly 2 strings: `[offValue, onValue]`. These are the values emitted, not necessarily the displayed labels. |
| `labels` | `Array` | `null` | Optional. Exactly 2 display strings. If omitted, falls back to `options` values. If an options value is `""`, falls back to `"Off"` / `"On"`. |
| `value` | `String` | `""` | Current value. Synced bidirectionally with `checked` state. |
| `checked` | `Boolean` | `false` | Reflects which option is active (`false` = options[0], `true` = options[1]). |
| `label` | `String` | `""` | Field label displayed above the control. |
| `description` | `String` | `""` | Optional helper text displayed below the label, above the control. |
| `disabled` | `Boolean` | `false` | Disables interaction. Reflects to attribute. |

### Events

| Event | Detail | When |
|---|---|---|
| `change` | `{ checked: boolean, value: string }` | User clicks either option |

The `value` in detail is always the string from `options[checked ? 1 : 0]`.

### Internal State Logic

- On `value` set: derive `checked` by comparing `value === options[1]`
- On `options` change: re-derive `checked` from current `value`
- On click: toggle `checked`, set `value`, dispatch `change` event
- If `options` is null/invalid: render in an error/fallback state (do not throw)

---

## Accessibility Requirements

- `role="group"` on the outer container with `aria-label` set to the `label` property
- Each option is a `<button>` with `aria-pressed="true/false"`
- Full keyboard navigation: Tab focuses the control, Arrow keys move between options, Enter/Space selects
- Visible focus ring using `:focus-visible` (do not suppress focus outline)
- Meets WCAG AA contrast for both selected and unselected states

---

## Design Token Usage

| Property | Token |
|---|---|
| Track background | `--md-sys-color-surface-container` |
| Selected fill | `--md-sys-color-primary` |
| Selected label | `--md-sys-color-on-primary` |
| Unselected label | `--md-sys-color-on-surface-variant` |
| Border radius | `--md-sys-shape-corner-full` |
| Transition duration | `--md-sys-motion-duration-short2` |
| Transition easing | `--md-sys-motion-easing-standard` |
| Hover state overlay | `--md-sys-state-hover-opacity` |
| Typography | `--md-sys-typescale-label-large` |
| Padding (options) | `--spacing-xs` vertical, `--spacing-md` horizontal |
| Label typography | `--md-sys-typescale-body-medium` |
| Label color | `--md-sys-color-on-surface` |

---

## Implementation Location

**File to create:** `m3-design-v2/src/components/wy-option-toggle.js`

**File to remove:** `m3-design-v2/src/components/wy-toggle-field.js` (after all consuming sites are migrated)

**Bundle:** Run `m3-design-v2/scripts/deploy.sh "Replace wy-toggle-field with wy-option-toggle"` after implementation.

---

## Migration: prompt-library Updates

After deploying the new component from m3-design-v2:

### 1. `app.js` — rendering (`getVariableHTML`, ~line 992)

Replace the `wy-toggle-field` HTML string with `wy-option-toggle`:

```js
// Before
return `
    <wy-toggle-field
        ${dataAttr}
        label="${label}"
        ${description}
        ${hasOptions ? `options='${optionsJSON}'` : ''}
        value="${currentValue}"
    ></wy-toggle-field>
`;

// After
return `
    <wy-option-toggle
        ${dataAttr}
        label="${label}"
        ${description}
        ${hasOptions ? `options='${optionsJSON}'` : ''}
        value="${currentValue}"
    ></wy-option-toggle>
`;
```

### 2. `app.js` — event listeners (~line 1519)

Replace `querySelectorAll('wy-toggle-field')` with `querySelectorAll('wy-option-toggle')`.

The `change` event detail shape is identical (`{ checked, value }`), so no other logic changes.

### 3. `app.js` — focus targeting (~line 1355)

Replace `'wy-form-field input, wy-form-field textarea, wy-toggle-field'`
with `'wy-form-field input, wy-form-field textarea, wy-option-toggle'`

### 4. `app.js` — conditional visibility (~line 1623)

No change needed — the logic checks `dependency.inputType === 'toggle'` which is a data property, not the component name.

### 5. `web-components.js`

Updated automatically by `deploy.sh`. Do not edit directly.

### 6. Prompts with empty-string options (Pattern A)

The prompts themselves (`prompts.json`) do not need updating. The component will display `"Off"` as the label when `options[0]` is `""`, but will still emit `""` as the value — preserving all template substitution behavior.

---

## Out of Scope

- Admin interface (`admin.js`) uses a separate `wy-prompt-modal` component that renders toggles differently (as `<input type="checkbox">`). That is a separate component migration and should be handled independently.
- No changes to `prompts.json` variable definitions are required.
- The `dependsOn` / `hideWhen` conditional visibility system in `app.js` does not need to change.
