Reformat the prompt library at ~/Library/Mobile\ Documents/com~apple~CloudDocs/Projects/prompts-library to use markdown in a new chat.

## Context

The modal renderer now supports full markdown via marked.js with breaks:true (single newlines → <br>, double newlines → paragraph breaks). Supported syntax: **bold**, *italic*, # h1–###### h6, - and 1. lists, > blockquote, `inline code`, fenced code blocks, ---, [text](url).

## Steps

1. `cp prompts.json prompts.json.bak`

2. Read prompts.json (54 prompts, flat array).

3. Reformat these fields on every prompt and every object in variations[]:
   - template
   - description
   - instructions (when present)

   Apply markdown to improve readability and structure:
   - ALL-CAPS section headers → ## or ### headers
   - Key labels at line start followed by colon (e.g. `Face:`, `Goal:`, `Tone:`) → **Face:**
   - Hyphen-prefixed items → proper - lists
   - Numbered steps → 1. ordered lists
   - Existing --- dividers used as section separators → keep as ---
   - Bold key terms in description/instructions only where it improves scannability; don't force it
   - Do not add markdown where prose already reads cleanly
   - Do not invent, reword, or truncate any content

4. Never modify: id, title, name, category, icon, promptImage, archived, the variables[] array, variations[].id, variations[].name.

5. Preserve all {{variable_name}} placeholders exactly — do not escape, wrap in backticks, or alter them.

6. Write the reformatted array back to prompts.json.

7. Run `node validate-prompts.js` and fix any reported failures before proceeding.

8. `git add prompts.json && git commit -m "reformat prompt templates with markdown"`

Do not push. Stop after commit.
