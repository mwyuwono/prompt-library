# Generalizable Project Setup Guide

This document outlines general preferences, standards, and setup instructions that apply across projects.

## CSS Quality Standards

### CRITICAL: NO !important Declarations
- **NEVER use `!important`** in CSS except for true utility classes that must override everything
- If specificity conflicts arise, resolve them by:
  - Increasing selector specificity (e.g., adding a class or parent selector)
  - Reordering rules in the source file
  - Using attribute selectors `[hidden]` for utilities
- `!important` breaks the cascade and makes maintenance extremely difficult

### Consistency
- All interactive elements use Material Design 3 state layers for hover/focus/pressed states
- State layer opacity controlled by `--md-sys-state-hover-opacity`, `--md-sys-state-focus-opacity`, `--md-sys-state-pressed-opacity`
- **NEVER change background colors directly on hover**; always use pseudo-element overlays (`:before` or `:after`) instead
- Example pattern:
  ```css
  .element {
    position: relative;
    overflow: hidden;
  }
  .element::before {
    content: '';
    position: absolute;
    inset: 0;
    background-color: var(--color-action-primary);
    opacity: 0;
    transition: opacity var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
    pointer-events: none;
  }
  .element:hover::before {
    opacity: var(--md-sys-state-hover-opacity);
  }
  ```

### CSS Variables
- **NEVER use hardcoded color values** like `#ffffff` or `#000000` - always use CSS variables
- Use `color-mix()` with variables: `color-mix(in srgb, var(--category-color) 16%, var(--color-card-surface))`
- Define a clear color palette with descriptive names (e.g., `--color-page-background`, `--color-card-surface`, `--color-text-primary`)
- Motion/typography/state tokens should use `--md-sys-*` variable naming convention

### Transitions & Animations
- **Always use motion token variables** for durations and easing curves
- Common patterns:
  - Short interactions: `var(--md-sys-motion-duration-short4)` (200ms) with `var(--md-sys-motion-easing-standard)`
  - Medium interactions: `var(--md-sys-motion-duration-medium2)` (300ms) with `var(--md-sys-motion-easing-legacy)`
  - Long interactions: `var(--md-sys-motion-duration-long1)` (450ms) with `var(--md-sys-motion-easing-emphasized)`
- **NEVER use magic numbers** like `0.2s` or `0.3s` - always reference the motion tokens
- Modal animations use spring-like easing: `cubic-bezier(0.34, 1.56, 0.64, 1)`

### Accessibility
- All interactive elements must have `:focus-visible` states with clear outlines
- Standard pattern: `outline: 3px solid var(--color-action-primary); outline-offset: 2px;`
- Ensure adequate color contrast (WCAG AA minimum):
  - Dark backgrounds require light text
  - Light backgrounds use primary or secondary text colors
- Toggle controls should use `:focus-within` for the label container

### Code Organization
- Remove empty rulesets - they serve no purpose
- Consolidate duplicate rules - check for multiple declarations of the same selector
- Group related properties together (positioning, box model, typography, visual, animation)
- Comment major sections clearly

## Git Workflow and Deployment

### GitHub Repository Setup
- **GitHub Account**: https://github.com/mwyuwono
- Always initialize repositories with a README
- Use descriptive repository names (lowercase with hyphens)

### Vercel Deployment
- Projects auto-deploy to Vercel on every push to `main`
- Use `vercel.json` to configure static hosting
- Example `vercel.json` for static sites:
  ```json
  {
    "version": 2,
    "builds": [
      {
        "src": "**/*",
        "use": "@vercel/static"
      }
    ]
  }
  ```
- Custom domains managed through Vercel dashboard
- Ensure domain DNS points to Vercel's CNAME

### Commit Guidelines
- Create commits for all meaningful changes
- Use descriptive commit messages that explain the "why"
- Always include the Claude Code attribution footer:
  ```
  > Generated with [Claude Code](https://claude.com/claude-code)

  Co-Authored-By: Claude <noreply@anthropic.com>
  ```
- Push to trigger automatic deployment

### Standard Git Workflow
```bash
# After making changes, commit them
git add .
git commit -m "Description of changes

> Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to GitHub (auto-deploys to Vercel)
git push origin main
```

## Documentation Standards

### CLAUDE.md
- Every project should have a `CLAUDE.md` file at the root
- This file provides project-specific guidance for Claude Code
- Keep it synchronized with actual implementation
- Include:
  - Project overview and purpose
  - Architecture patterns
  - File structure
  - Key implementation details
  - Important deviations from requirements

### Requirements Document Maintenance
When making significant changes:
1. **Update code files** first
2. **Update requirements/documentation** to reflect implementation changes
3. **Update CLAUDE.md** if architectural patterns change
4. **Commit all changes together** so documentation stays in sync

**Note**: When in doubt, the actual code is the source of truth.

## Development Preferences

### Technology Stack Preferences
- Prefer vanilla JavaScript when possible (no frameworks unless necessary)
- Zero dependencies and no build process for simple projects
- Use modern web APIs (Fetch, LocalStorage, Clipboard API)
- Material Design 3 for UI patterns and design tokens
- Google Material Symbols for iconography

### Code Quality
- Use semantic HTML
- Implement XSS protection (escape user inputs)
- Use event delegation with `data-action` attributes
- Keep state management simple and transparent
- Comprehensive comments for complex logic

### File Organization
- Keep HTML, CSS, and JS in separate files
- Use descriptive, kebab-case filenames
- Co-locate related functionality
- Minimize file count for simple projects

## Browser Compatibility
- Use modern browser features with graceful fallbacks
- Test in major browsers (Chrome, Firefox, Safari, Edge)
- Provide fallbacks for older browsers when using cutting-edge APIs
- Use `autocomplete="off"` to prevent unwanted browser autofill

## Security Best Practices
- Escape all user inputs before rendering
- Use HTTPS in production
- Avoid inline scripts where possible
- Implement Content Security Policy headers when appropriate
