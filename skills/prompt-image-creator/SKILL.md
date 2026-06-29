---
name: prompt-image-creator
description: Create prompt preview images for the Prompt Library project using "The Nineteenth" editorial atelier style. Use when generating, editing, or refreshing prompt card images, prompt hero images, or prompt-library visual assets under public/images.
---

# Prompt Image Creator

## Overview

Use this skill to create prompt preview images for the Prompt Library. Default every image to "The Nineteenth" style unless the user explicitly asks for a different direction.

Prompt images are project assets. Save final selected images under `public/images/`, use descriptive filenames, and wire them into the relevant `prompts.json` entry with the `image` field. Normalize prompt preview images to exact `1920x1080` unless the user specifies another project need.

## Workflow

1. Identify the prompt or prompt family the image represents.
2. Choose the image type:
   - `text`: typography, prompt cards, conceptual layouts, UI-like prompt structures.
   - `full-bleed artwork`: pattern, craft swatches, textile/collage material studies.
   - `photography`: object, scene, atelier interior, product-like prompt preview.
3. Choose aspect ratio:
   - Use `16:9` for prompt-library preview cards and wide heroes.
   - Use `4:5` for object portraits.
   - Use `3:2` for scenes.
   - Use `1:1` for catalogue tiles.
4. Pick one accent only when it helps the subject: rust, sage, terracotta, dusty rose, or none.
5. Generate or edit the image with the style guide below embedded in the prompt.
6. Inspect the result for forbidden traits: gradients, rounded corners, glows, shadows, busy backgrounds, centered symmetry, or clutter.
7. Save the final project copy in `public/images/`, leaving any generated source file in place.
8. If the image belongs to a prompt entry, update `prompts.json` and validate JSON.

## Prompt Template

Use this structure when asking an image model to create a prompt image:

```text
Create a prompt-library preview image in "The Nineteenth" style.

Subject: [describe what the image shows]
Type: [text / full-bleed artwork / photography]
Aspect ratio: [16:9 / 4:5 / 3:2 / 1:1]
Accent: [rust / sage / terracotta / dusty rose / none]

Apply this aesthetic to the image unless a per-type rule below overrides it: contemporary luxury craft-house / editorial atelier look; calm, serif-heavy when type appears, lots of negative space, hairline grid rules, restrained color.

[Include the relevant style guide rules from below.]

Negative prompt: no gradients, no neon, no rounded corners, no drop shadows, no glow, no lens flare, no glossy 3D render, no emoji, no stock-photo gloss, no busy backgrounds, no centered symmetry, no clutter.
```

## Global Style Guide

Always apply these rules unless the user explicitly overrides them:

- Background: warm off-white paper, `#F7F4EE`. Never pure white.
- Composition: asymmetric. Place the subject off-center, not centered. Leave generous, deliberate empty space. Let the eye fall down the page in diagonals.
- Structure: thin `1px` hairline rules, or "loom" lines, horizontal and vertical, dividing the frame into a quiet grid. Use them structurally, never as decoration.
- Corners: everything square-cornered. No rounded corners anywhere.
- Surface: flat and matte. No gradients, glows, drop shadows, textures, blur, glossy 3D render, or lens flare.
- Color discipline: near-black ink `#1A1A1A` on warm cream. Use at most one saturated accent per image:
  - rust ochre `#C06F45`
  - muted sage `#7D8E39`
  - terracotta `#C18A4D`
  - dusty rose `#C06D5C`
- Accent behavior: use the accent as a solid full-bleed block or panel, never as a gradient or glow. Never place two saturated accent blocks touching; keep paper or ink between them. Sage is the loudest; use it at most once.
- Mood: curatorial, unhurried, self-assured. Gallery-quiet, never loud.

## Type Images

Apply when the image contains text or type is the subject:

- Use a warm serif display face, such as Lora or similar, with tight letter spacing.
- Set one key word in italic for emphasis; keep everything else upright.
- Use sentence case.
- Any small label may be all caps only as a tiny eyebrow with wide letter spacing.
- Do not use emoji or decorative icons.
- Use only these Unicode punctuation marks when needed: `—`, `·`, `№`, `→`.
- Prefer abstract text lines if exact wording is not essential; avoid accidental readable gibberish.

## Full-Bleed Artwork Images

Apply when the image is full-bleed artwork or pattern:

- Create a patchwork collage of craft material swatches: textile, embroidery, ceramic glaze, paint chips, or related handmade samples.
- Arrange swatches as a grid of samples.
- Make the result tactile, handmade, earthy, and muted.
- Never use neon.
- For full-bleed artwork, the off-white background and one-accent rule may be dropped so the artwork can fill the frame.

## Photography Images

Apply when the image is photography:

- Use warm, slightly desaturated daylight photography.
- Use soft directional window light, gentle natural shadows, and fine subtle film grain.
- Favor natural materials: linen, raw oak, unvarnished wood, hand-thrown ceramic, plaster, and stone.
- Keep tones muted and earthy. Never use high-saturation or punchy color.
- Shoot like a quiet atelier or gallery interior.
- Compose off-center with intentional empty space.
- For pure photography, do not force brand accent colors into the scene.

## Project Asset Rules

- Use descriptive lowercase filenames, for example `reusable-prompt-builder-preview.png`.
- Prefer exact `1920x1080` PNG or JPG for prompt preview cards.
- Do not overwrite existing assets unless explicitly asked; create a new descriptive filename.
- After adding or changing a prompt image, run JSON validation for `prompts.json`.
- If the image is generated outside the workspace, copy the selected output into `public/images/` and leave the original generated file in place.
