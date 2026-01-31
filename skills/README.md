# Agent Skills

This directory contains Agent Skills for the Prompt Library project. Skills are folders of instructions, scripts, and resources that AI agents can discover and use to perform better at specific tasks.

## What are Agent Skills?

Agent Skills follow the open [Agent Skills](https://agentskills.io/) format, originally developed by Anthropic. Each skill is a folder containing a `SKILL.md` file with:

- **YAML frontmatter** - Metadata including `name` and `description`
- **Markdown content** - Instructions, examples, and guidelines for the agent to follow

Skills are designed to be "write once, use everywhere" - compatible agents can load and apply these skills automatically.

## Available Skills

### 1. vanilla-js-development
**Location:** `skills/vanilla-js-development/SKILL.md`

Expert guidance for building modern web applications using vanilla JavaScript without frameworks or build tools. Covers:

- Zero dependencies philosophy
- Modern JavaScript practices (ES6+, async/await)
- Single class organization patterns
- Event delegation with data attributes
- DOM manipulation best practices
- Data loading and storage (Fetch API, LocalStorage)
- Common patterns (modals, search/filter, clipboard)
- Security considerations (XSS prevention)

**Use when:** Working on vanilla JavaScript projects, implementing new features without frameworks, or understanding native browser API patterns.

---

### 2. material-design-css
**Location:** `skills/material-design-css/SKILL.md`

Expert guidance for implementing Material Design 3 principles using vanilla CSS. Covers:

- Design tokens and CSS custom properties
- State layer pattern for hover effects
- Motion tokens and transitions
- Color mixing with CSS
- Elevation and shadows
- Typography system
- Accessibility requirements
- Critical CSS quality rules (no !important, always use variables)

**Use when:** Implementing Material Design UI components, styling with design tokens, or ensuring consistent motion and state layer patterns.

---

### 3. prompt-library-architecture
**Location:** `skills/prompt-library-architecture/SKILL.md`

Architecture-specific guidance for the Prompt Library project. Covers:

- Project identity and design principles
- Single class architectural pattern
- State management (app state and runtime properties)
- Key patterns (event delegation, card/modal sync, template compilation)
- Data structure (`prompts.json` schema)
- Variable input types (text, textarea, toggle, conditional)
- UI views and component behaviors
- CSS architecture and design system
- Development workflow and deployment

**Use when:** Working specifically on this Prompt Library project, adding features, modifying prompts, or understanding the unique architectural decisions.

---

## How Agents Use Skills

Compatible AI agents (like Claude Code) can:

1. **Discover** skills in this directory automatically
2. **Load** relevant skills based on the task at hand
3. **Apply** the instructions and patterns defined in each skill
4. **Combine** multiple skills when working on complex tasks

For example, when adding a new prompt with custom styling, an agent might use:
- `prompt-library-architecture` - For data structure and app patterns
- `vanilla-js-development` - For JavaScript implementation
- `material-design-css` - For styling with design tokens

## Skill Format

Each skill follows this structure:

```
skills/
└── skill-name/
    └── SKILL.md          # Required: Skill definition
```

**SKILL.md format:**
```markdown
---
name: skill-name
description: Brief description of what this skill does and when to use it
---

# Skill Title

[Markdown content with instructions, examples, and guidelines]
```

## Adding New Skills

To add a new skill:

1. Create a new folder in `skills/` with a descriptive name (use lowercase with hyphens)
2. Create a `SKILL.md` file in that folder
3. Add YAML frontmatter with `name` and `description` fields
4. Write instructions, examples, and guidelines in Markdown
5. Update this README to list the new skill

## Resources

- **Agent Skills Format:** https://agentskills.io/
- **Specification:** https://agentskills.io/specification
- **Example Skills:** https://github.com/anthropics/skills
- **Skills Reference Library:** https://github.com/agentskills/agentskills

## Compatible Agents

This skills format is supported by:
- Claude Code (Anthropic)
- Cursor
- VS Code extensions
- And many other AI development tools

See https://agentskills.io/ for the full list of compatible agents.
