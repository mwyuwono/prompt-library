# Contributing

## Documentation Standard: High-Density

All documentation in this project follows a high-density standard. Prefer concise, high-value content over verbose explanations.

### Principles

1. **Proportionality** - Detailed explanations only for complex logic, non-obvious architectural decisions, or mission-critical flows. If the code is self-documenting (clear naming, standard patterns), don't describe it in prose.

2. **No Redundant Text** - If a concept is already documented in one place, reference it rather than restating it. One source of truth per topic.

3. **Utility over History** - Document what the system *is* and how to *use* it, not the story of how it was built. Implementation logs and session summaries go in `docs/ARCHIVE.md`.

4. **Anti-Bloat** - If a document feels repetitive, condense it. A 10-line technical summary beats a 50-line narrative. Tables beat paragraphs for structured data. Code examples should be minimal and purposeful.

### Document Structure

| Document | Purpose | Owner |
|----------|---------|-------|
| `README.md` | Project overview, quick start, architecture | Primary entry point |
| `CLAUDE.md` | AI assistant instructions, design system rules | Claude Code guidance |
| `docs/admin-system-plan.md` | Admin API reference and components | Admin system |
| `docs/prompt-authoring.md` | How to write prompts | Content authors |
| `docs/cdn-troubleshooting.md` | CDN cache operations | Design system ops |
| `docs/CONTRIBUTING.md` | This file - documentation standards | Meta |
| `docs/ARCHIVE.md` | Historical implementation notes | Read-only reference |
| `skills/` | Agent Skills for AI-assisted dev | AI tools |

### Rules

- **Never create root-level status reports** (e.g., `FIX-COMPLETE.md`, `SESSION-SUMMARY.md`). Completed work goes in `docs/ARCHIVE.md` as a condensed entry.
- **Never duplicate the data model.** It's defined in `README.md`. Reference it, don't copy it.
- **Keep CLAUDE.md focused** on rules and constraints for AI tools, not on explaining what the project does (that's `README.md`).
- **Completed checklists are dead weight.** Remove them or move to archive. Only keep checklists that describe *future* verification steps.
- **No emojis in documentation** unless explicitly requested.

### When to Update Documentation

| Event | Action |
|-------|--------|
| New feature shipped | Update `README.md` if user-facing. Add archive entry if complex. |
| Bug fixed | No doc update unless it changes usage or reveals a gotcha worth noting. |
| API changed | Update `docs/admin-system-plan.md`. |
| Design system change | Check if `CLAUDE.md` rules or `docs/cdn-troubleshooting.md` need updates. |
| New prompt added | No doc update needed (self-service via admin). |

### Style

- Use sentence case for headings (not Title Case)
- Prefer tables over lists for structured data
- Code blocks: include only the minimum needed to illustrate the point
- Links: use relative paths (`docs/admin-system-plan.md`, not full URLs)
- No trailing whitespace or empty sections
