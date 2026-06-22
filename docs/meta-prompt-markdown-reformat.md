# Meta-Prompt: Reformat Prompt Library to Markdown

You are reformatting a JSON prompt library to use markdown syntax. The rendered output supports: `**bold**`, `*italic*`, `# h1`–`###### h6`, `- ` / `1. ` lists, `> blockquote`, `` `inline code` ``, fenced code blocks, `---` horizontal rules, and `[text](url)` links. Single newlines render as `<br>` (breaks:true). Double newlines create paragraph breaks.

## Input

A flat JSON array. Each object has some combination of these fields (not all are present on every object):

```
id, title, description, instructions, template, variables, variations, category, archived, promptImage, icon
```

`variations` is an array of objects with: `id`, `name`, `template`, and optionally `description` and `instructions`.

## Reformat Rules

**Apply markdown to:** `template`, `description`, `instructions`, and any `description`/`instructions` fields inside `variations[*]`.

**Never touch:** `id`, `title`, `name`, `category`, `icon`, `promptImage`, `archived`, `variables` (entire array), `variations[*].id`, `variations[*].name`.

**Preserve exactly:** All `{{variable_name}}` placeholders — do not escape, wrap, or alter them in any way.

**Formatting judgement:**

- Section headers in templates (e.g. `PROMPT 1 — DEEP RESEARCH`, `Character Details:`, `Follow these strict constraints:`) → convert to `##` or `###` headers
- Hyphen-prefixed lists (`- item`) → proper markdown `- item` lists (they may already be correct; verify)
- Numbered steps → `1.` ordered lists
- Key labels before colons at line-start (e.g. `Face:`, `Tone:`, `Goal:`) → `**Face:**`
- Existing `---` dividers used as section breaks → keep as `---`; do not add new ones unless clearly needed
- `description` and `instructions` fields are typically 1–3 sentences; apply markdown sparingly — bold key terms only if it improves scannability
- Do not add markdown where plain prose already reads cleanly
- Do not invent content; only reformat what exists

## Output

Return the complete reformatted JSON array only. No commentary, no code fences wrapping the outer JSON, no ellipsis placeholders. Every object from the input must appear in the output.
