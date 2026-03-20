# Public Site Color Map

Edit the `New Color` column, or replace a `Current Color` value inline if that is easier for you.

Design-system-backed rows are intentionally left as tokens or source expressions instead of flattened hex values. Some updates may need to be implemented in `m3-design-v2` instead of this repo.

## Global Tokens And Semantic Mappings

### Core App Mappings From `tokens.css`

| Component | Selector / Token | Property | Current Color | New Color | Notes |
| --- | --- | --- | --- | --- | --- |
| Page background | `--color-page-background` | background token | `var(--md-sys-color-background)` |  | App semantic mapping to design system |
| Card surface | `--color-card-surface` | surface token | `var(--md-sys-color-surface-container-lowest)` |  | App semantic mapping to design system |
| Dark card surface | `--color-card-dark` | surface token | `var(--md-sys-color-primary)` |  | App semantic mapping to design system |
| Primary text | `--color-text-primary` | text token | `var(--md-sys-color-text-main)` |  | App semantic mapping to design system |
| Secondary text | `--color-text-secondary` | text token | `var(--md-sys-color-text-muted)` |  | App semantic mapping to design system |
| Contrast text | `--color-text-contrast` | text token | `var(--md-sys-color-on-primary)` |  | App semantic mapping to design system |
| Primary brand | `--color-primary` | brand token | `var(--md-sys-color-primary)` |  | App semantic mapping to design system |
| Accent / action | `--color-action-primary` | action token | `var(--md-sys-color-secondary)` |  | App semantic mapping to design system |
| Accent / action hover | `--color-action-primary-hover` | action hover token | `#7A6E62` |  | Local hardcoded value |
| Emphasis background | `--color-emphasis-background` | surface accent token | `color-mix(in srgb, var(--md-sys-color-secondary) 10%, transparent)` |  | Local derived token |
| Surface hover | `--color-surface-hover` | hover token | `color-mix(in srgb, var(--md-sys-color-text-muted) 10%, transparent)` |  | Local derived token |
| Subtle border | `--color-border-subtle` | border token | `color-mix(in srgb, var(--md-sys-color-text-muted) 10%, transparent)` |  | Local derived token |
| Legacy linen | `--color-linen` | legacy surface token | `var(--md-sys-color-background)` |  | Legacy mapping still used in public styles |
| Legacy charcoal | `--color-charcoal` | legacy dark text/surface token | `var(--md-sys-color-on-background)` |  | Legacy mapping still used in public styles |
| Legacy white | `--color-white` | legacy white/surface token | `var(--md-sys-color-surface-container-lowest)` |  | Legacy mapping still used in public styles |
| Legacy olive | `--color-olive` | legacy brand token | `var(--md-sys-color-primary)` |  | Legacy mapping still used in public styles |
| Legacy gold | `--color-gold` | legacy accent token | `var(--md-sys-color-secondary)` |  | Legacy mapping still used in public styles |
| Legacy warm grey | `--color-warmgrey` | legacy muted token | `var(--md-sys-color-text-muted)` |  | Legacy mapping still used in public styles |

### Shared Design Tokens Referenced Directly

| Component | Selector / Token | Property | Current Color | New Color | Notes |
| --- | --- | --- | --- | --- | --- |
| Design system primary | `--md-sys-color-primary` | primary | design-system token |  | Shared token, not locally defined in light mode |
| Design system on-primary | `--md-sys-color-on-primary` | on-primary text | design-system token |  | Shared token, used by buttons and featured states |
| Design system secondary | `--md-sys-color-secondary` | secondary | design-system token |  | Shared token, used by accent states |
| Design system background | `--md-sys-color-background` | background | design-system token |  | Shared token, used for page/list backgrounds |
| Design system surface container | `--md-sys-color-surface-container` | surface | design-system token |  | Shared token, used by `body` |
| Design system surface container low | `--md-sys-color-surface-container-low` | surface | design-system token |  | Shared token, used indirectly |
| Design system surface container high | `--md-sys-color-surface-container-high` | surface | design-system token |  | Shared token, used by category badges |
| Design system outline variant | `--md-sys-color-outline-variant` | border | design-system token |  | Shared token, used by inputs and editor states |
| Design system text main | `--md-sys-color-text-main` | text | design-system token |  | Shared token via app mappings |
| Design system text muted | `--md-sys-color-text-muted` | text | design-system token |  | Shared token via app mappings |

### Global Surface Details

| Component | Selector / Token | Property | Current Color | New Color | Notes |
| --- | --- | --- | --- | --- | --- |
| Body | `body` | background-color | `var(--md-sys-color-surface-container)` |  | Local style using DS token |
| Body | `body` | text color | `var(--color-text-primary)` |  | Local style |
| Text selection | `::selection` | background-color | `var(--color-gold)` |  | Local style |
| Text selection | `::selection` | color | `var(--color-white)` |  | Local style |
| Firefox text selection | `::-moz-selection` | background-color | `var(--color-gold)` |  | Local style |
| Firefox text selection | `::-moz-selection` | color | `var(--color-white)` |  | Local style |
| Scrollbar | `*` | thumb color | `var(--color-border-subtle)` |  | Local style |
| Scrollbar | `*` | track color | `transparent` |  | Local style |
| Search highlight | `mark` | background-color | `var(--color-surface-hover)` |  | Local style |
| Search highlight | `mark` | color | `var(--color-action-primary)` |  | Local style |

## Header And Top-Level Navigation

### Header Bar

| Component | Selector / Token | Property | Current Color | New Color | Notes |
| --- | --- | --- | --- | --- | --- |
| Top header | `.header-top` | text color | `var(--color-text-secondary)` |  | Local style |
| Top header | `.header-top` | background | `transparent` |  | Local style |
| Header logo text | `.header-logo-text` | color | `var(--color-text-primary)` |  | Local style |
| Legacy sticky header | `.header` | background-color | `rgba(249, 247, 242, 0.95)` |  | Local style, appears to be older public header styling |
| Legacy header title | `.header-title` | color | `var(--color-text-primary)` |  | Local style |
| Hamburger focus | `.hamburger:focus-visible` | outline | `3px solid var(--color-gold)` |  | Local state color |
| Hamburger bars | `.hamburger span` | background | `var(--color-charcoal)` |  | Local style |

### Quick Links

| Component | Selector / Token | Property | Current Color | New Color | Notes |
| --- | --- | --- | --- | --- | --- |
| Quick link button | `.quick-link-btn` | background | `var(--color-border-subtle)` |  | Local style |
| Quick link button | `.quick-link-btn` | text color | `var(--color-text-primary)` |  | Local style |
| Quick link button | `.quick-link-btn` | border | `none` |  | Local style |
| Quick link button hover | `.quick-link-btn:hover` | background | `var(--color-surface-hover)` |  | Local state color |
| Quick link button focus | `.quick-link-btn:focus-visible` | outline | `3px solid var(--color-action-primary)` |  | Local state color |

### Deprecated Header Button Styles Still Present In CSS

| Component | Selector / Token | Property | Current Color | New Color | Notes |
| --- | --- | --- | --- | --- | --- |
| Deprecated filters button | `.btn-filters` | background | `var(--color-charcoal)` |  | Deprecated, no current public usage expected |
| Deprecated filters button | `.btn-filters` | color | `var(--color-white)` |  | Deprecated |
| Deprecated filters button hover | `.btn-filters:hover` | background | `var(--color-gold)` |  | Deprecated |
| Deprecated download button | `.btn-download` | background | `var(--color-charcoal)` |  | Deprecated |
| Deprecated download button | `.btn-download` | color | `var(--color-white)` |  | Deprecated |
| Deprecated download button hover | `.btn-download:hover` | background | `var(--color-gold)` |  | Deprecated |

### Visual Identity Styles Still Present In CSS

| Component | Selector / Token | Property | Current Color | New Color | Notes |
| --- | --- | --- | --- | --- | --- |
| Visual identity wrapper | `.visual-identity-wrapper` | background | `var(--color-linen)` |  | Present in CSS, not visible in current `index.html` |
| Visual identity wrapper | `.visual-identity-wrapper` | border-bottom | `1px solid var(--color-border-subtle)` |  | Present in CSS |
| Eyebrow text | `.visual-identity-eyebrow` | color | `var(--md-sys-color-secondary)` |  | Present in CSS |
| Visual identity title | `.visual-identity-title` | color | `var(--color-text-primary)` |  | Present in CSS |
| Visual identity description | `.visual-identity-description` | color | `var(--color-text-secondary)` |  | Present in CSS |
| Visual identity description | `.visual-identity-description` | border-left | `2px solid var(--color-gold)` |  | Present in CSS |
| Linen circle sample | `.circle-linen` | background | `var(--color-white)` |  | Present in CSS |
| Linen circle sample | `.circle-linen` | text color | `var(--color-text-primary)` |  | Present in CSS |
| Olive circle sample | `.circle-olive` | background | `var(--color-olive)` |  | Present in CSS |
| Olive circle sample | `.circle-olive` | text color | `var(--color-white)` |  | Present in CSS |
| Gold circle sample | `.circle-gold` | background | `var(--color-gold)` |  | Present in CSS |
| Gold circle sample | `.circle-gold` | text color | `var(--color-white)` |  | Present in CSS |

## Prompt List View And Empty States

### List View Shell

| Component | Selector / Token | Property | Current Color | New Color | Notes |
| --- | --- | --- | --- | --- | --- |
| Category heading | `.category-section-header` | text color | `var(--color-text-primary)` |  | Local style |
| Category heading | `.category-section-header` | border-bottom | `2px solid var(--color-border-subtle)` |  | Local style |
| Category items container | `.category-items` | background-color | `var(--color-page-background)` |  | Local style |
| List row | `.prompt-list-item` | background | `var(--color-page-background)` |  | Local style |
| List row overlay | `.prompt-list-item::before` | background-color | `var(--color-action-primary)` |  | Local hover/pressed overlay color |
| List row focus | `.prompt-list-item:focus-visible` | outline | `3px solid var(--color-action-primary)` |  | Local state color |
| List row title | `.prompt-list-item-title` | color | `var(--color-text-primary)` |  | Local style |
| List row description | `.prompt-list-item-description` | color | `var(--color-text-secondary)` |  | Local style |

### Public Empty State

| Component | Selector / Token | Property | Current Color | New Color | Notes |
| --- | --- | --- | --- | --- | --- |
| Empty state pill | `.empty-state` | background | `var(--color-card-surface)` |  | Local style used in public prompt area |
| Empty state pill | `.empty-state` | text color | `var(--color-action-primary)` |  | Local style used in public prompt area |

## Prompt Cards, Badges, Inputs, Editor States

### Card Shell

| Component | Selector / Token | Property | Current Color | New Color | Notes |
| --- | --- | --- | --- | --- | --- |
| Standard prompt card | `.prompt-card` | background | `var(--color-white)` |  | Local style |
| Standard prompt card | `.prompt-card` | border | `1px solid var(--color-border-subtle)` |  | Local style |
| Standard prompt card | `.prompt-card` | text color | `var(--color-text-primary)` |  | Local style |
| Featured olive card | `.prompt-card.featured-olive` | background | `var(--color-olive)` |  | Local variant |
| Featured olive card | `.prompt-card.featured-olive` | border | `none` |  | Local variant |
| Featured olive card | `.prompt-card.featured-olive` | text color | `var(--color-white)` |  | Local variant |
| Featured olive glow | `.prompt-card.featured-olive::before` | background | `rgba(255, 255, 255, 0.05)` |  | Local decorative layer |
| Card focus | `.prompt-card:focus-visible` | outline | `3px solid var(--color-gold)` |  | Local state color |

### Thumbnail And Media Treatments

| Component | Selector / Token | Property | Current Color | New Color | Notes |
| --- | --- | --- | --- | --- | --- |
| Card thumbnail | `.card-thumbnail` | background-color | `var(--color-emphasis-background)` |  | Local style |
| Thumbnail overlay | `.card-thumbnail::after` | background | `linear-gradient(to top, rgba(0, 0, 0, 0.4) 0%, transparent 60%)` |  | Local style |
| No-image pattern overlay | `.prompt-card:not(.has-image):not([data-has-image="true"])::after` | pattern fill | `fill='%23ffffff' fill-opacity='0.05'` in embedded SVG |  | Local decorative layer on dark cards |

### Card Text And Meta

| Component | Selector / Token | Property | Current Color | New Color | Notes |
| --- | --- | --- | --- | --- | --- |
| Card badge | `.card-badge` | background | `var(--color-linen)` |  | Local style |
| Card badge | `.card-badge` | color | `var(--color-text-primary)` |  | Local style |
| Card arrow button | `.card-arrow-button` | background-color | `transparent` |  | Local default state |
| Card arrow button | `.card-arrow-button` | color | `var(--color-charcoal)` |  | Local default state |
| Card arrow button hover | `.prompt-card:hover .card-arrow-button` | background-color | `var(--color-gold)` |  | Local hover state |
| Card arrow button hover | `.prompt-card:hover .card-arrow-button` | color | `var(--color-white)` |  | Local hover state |
| Featured card arrow | `.prompt-card.featured-olive .card-arrow-button` | color | `var(--color-white)` |  | Local variant |
| Featured card arrow hover | `.prompt-card.featured-olive .card-arrow-button:hover` | background-color | `var(--color-gold)` |  | Local variant state |
| Featured card arrow hover | `.prompt-card.featured-olive .card-arrow-button:hover` | color | `var(--color-white)` |  | Local variant state |
| Image-overlay badge group | `.card-thumbnail + .card-content .card-header .card-category, .card-thumbnail + .card-content .card-header .variable-count-badge` | background-color | `rgba(30, 30, 30, 0.75)` |  | Local frosted-glass treatment |
| Image-overlay badge group | `.card-thumbnail + .card-content .card-header .card-category, .card-thumbnail + .card-content .card-header .variable-count-badge` | color | `var(--color-text-contrast)` |  | Local frosted-glass treatment |
| Image-overlay badge group | `.card-thumbnail + .card-content .card-header .card-category, .card-thumbnail + .card-content .card-header .variable-count-badge` | border | `1px solid rgba(255, 255, 255, 0.25)` |  | Local frosted-glass treatment |
| Card title | `.card-title` | color | `var(--color-charcoal)` |  | Local style |
| Default category pill | `.card-category` | background-color | `var(--md-sys-color-surface-container-high)` |  | DS token used directly |
| Default category pill | `.card-category` | color | `var(--md-sys-color-primary)` |  | DS token used directly |
| Gold category pill | `.card-category.badge-gold` and matching category selectors | background-color | `rgba(196, 164, 132, 0.1)` |  | Local variant |
| Gold category pill | `.card-category.badge-gold` and matching category selectors | color | `var(--color-gold)` |  | Local variant |
| Olive category pill | `.card-category.badge-olive` and matching category selectors | background-color | `rgba(61, 68, 53, 0.1)` |  | Local variant |
| Olive category pill | `.card-category.badge-olive` and matching category selectors | color | `var(--color-olive)` |  | Local variant |
| Grey category pill | `.card-category.badge-grey` and matching category selectors | background-color | `rgba(112, 112, 112, 0.1)` |  | Local variant |
| Grey category pill | `.card-category.badge-grey` and matching category selectors | color | `var(--color-warmgrey)` |  | Local variant |
| Featured card category pill | `.prompt-card.featured-olive .card-category` | background-color | `rgba(255, 255, 255, 0.2)` |  | Local variant |
| Featured card category pill | `.prompt-card.featured-olive .card-category` | color | `var(--color-white)` |  | Local variant |
| Featured icon container | `.card-icon-container.icon-featured` | background-color | `var(--md-sys-color-primary, #2C4C3B)` |  | DS token with fallback |
| Featured icon container | `.card-icon-container.icon-featured` | color | `var(--color-white)` |  | Local + DS mix |
| Neutral icon container | `.card-icon-container.icon-neutral` | background-color | `var(--color-emphasis-background)` |  | Local style |
| Neutral icon container | `.card-icon-container.icon-neutral` | color | `var(--color-charcoal)` |  | Local style |
| Variable count badge | `.variable-count-badge` | background-color | `var(--tag-bg)` |  | `--tag-bg` source should be confirmed during implementation |
| Variable count badge | `.variable-count-badge` | color | `var(--color-text-secondary)` |  | Local style |
| Card description | `.card-description` | color | `var(--color-warmgrey)` |  | Local style |
| Featured card title | `.prompt-card.featured-olive .card-title` | color | `var(--color-white)` |  | Local variant |
| Featured card description | `.prompt-card.featured-olive .card-description` | color | `rgba(255, 255, 255, 0.8)` |  | Local variant |
| Variable label | `.variable-label` | color | `var(--md-sys-color-primary)` |  | DS token used directly |

### Inputs And Template Editing

| Component | Selector / Token | Property | Current Color | New Color | Notes |
| --- | --- | --- | --- | --- | --- |
| Variable input | `.variable-input` | border | `1px solid var(--md-sys-color-outline-variant)` |  | DS token used directly |
| Variable input | `.variable-input` | color | `var(--md-sys-color-on-surface)` |  | DS token used directly |
| Variable input | `.variable-input` | background-color | `var(--md-sys-color-surface-container-lowest)` |  | DS token used directly |
| Variable input placeholder | `.variable-input::placeholder` | color | `var(--md-sys-color-text-muted)` |  | DS token used directly |
| Variable input hover | `.variable-input:hover` | border-color | `var(--md-sys-color-secondary)` |  | DS token used directly |
| Variable input focus | `.variable-input:focus` | border-color | `var(--md-sys-color-primary)` |  | DS token used directly |
| Variable input focus | `.variable-input:focus` | box-shadow | `0 0 0 1px var(--md-sys-color-primary)` |  | DS token used directly |
| Variable input with value | `.variable-input.has-value` | border-color | `var(--md-sys-color-outline-variant)` |  | DS token used directly |
| Template textarea | `.template-textarea` | border | `1px solid var(--color-border-subtle)` |  | Local style |
| Template textarea | `.template-textarea` | color | `var(--color-text-primary)` |  | Local style |
| Template textarea | `.template-textarea` | background-color | `var(--color-card-surface)` |  | Local style |
| Template textarea hover | `.template-textarea:hover` | border-color | `var(--color-text-primary)` |  | Local state color |
| Template textarea focus | `.template-textarea:focus` | border-color | `var(--color-action-primary)` |  | Local state color |

### Toast And Keyboard Shortcuts Styles Still Present Locally

| Component | Selector / Token | Property | Current Color | New Color | Notes |
| --- | --- | --- | --- | --- | --- |
| Legacy toast | `.toast` | background-color | `var(--color-charcoal)` |  | Local legacy style; public site now uses `wy-toast` |
| Legacy toast | `.toast` | color | `var(--color-white)` |  | Local legacy style |
| Shortcut item | `.shortcut-item` | background-color | `var(--color-card-surface)` |  | Local legacy modal content style |
| Shortcut item | `.shortcut-item` | border | `1px solid var(--color-border-subtle)` |  | Local legacy modal content style |
| Shortcut key | `.shortcut-keys kbd` | color | `var(--color-text-primary)` |  | Local legacy modal content style |
| Shortcut key | `.shortcut-keys kbd` | background-color | `var(--color-card-surface)` |  | Local legacy modal content style |
| Shortcut key | `.shortcut-keys kbd` | border | `1.5px solid var(--color-border-subtle)` |  | Local legacy modal content style |
| Shortcut description | `.shortcut-description` | color | `var(--color-text-secondary)` |  | Local legacy modal content style |

## Public Web Components Used By `index.html`

### Buttons

| Component | Selector / Token | Property | Current Color | New Color | Notes |
| --- | --- | --- | --- | --- | --- |
| `wy-button` FOUC fallback | `wy-button:not(:defined)` | background-color | `var(--md-sys-color-primary, #2C4C3B)` |  | Local fallback before component upgrade |
| `wy-button` FOUC fallback | `wy-button:not(:defined)` | color | `var(--md-sys-color-on-primary, #FFFFFF)` |  | Local fallback before component upgrade |
| `wy-button` FOUC fallback | `wy-button:not(:defined)` | border | `none` |  | Local fallback before component upgrade |
| Filters button | `#toggleFiltersBtn` | color source | component variant `primary` |  | Actual colors come from design system component tokens |
| AI Tools button | `#openLinksModal` | color source | component variant `primary` |  | Actual colors come from design system component tokens |
| Admin button | `#adminButton` | color source | component variant `outlined` |  | Actual colors come from design system component tokens |

### Shared Component Tokens Relevant To Public Components

| Component | Selector / Token | Property | Current Color | New Color | Notes |
| --- | --- | --- | --- | --- | --- |
| Button primary | `--wy-button-primary-bg` | button background | `var(--md-sys-color-primary)` |  | Defined locally only in dark-mode override; normal light value lives in design system |
| Button primary | `--wy-button-primary-fg` | button text | `var(--md-sys-color-on-primary)` |  | Same ownership note as above |
| Button primary hover | `--wy-button-primary-hover-bg` | hover background | `#1e3428` |  | Defined locally only in dark-mode override |
| Button secondary | `--wy-button-secondary-bg` | button background | `var(--md-sys-color-surface)` |  | Defined locally only in dark-mode override |
| Button secondary | `--wy-button-secondary-fg` | button text | `var(--md-sys-color-primary)` |  | Defined locally only in dark-mode override |
| Button outlined | `--wy-button-outlined-fg` | button text | `var(--md-sys-color-primary)` |  | Defined locally only in dark-mode override |
| Button outlined | `--wy-button-outlined-border` | button border | `var(--md-sys-color-surface-container-highest)` |  | Defined locally only in dark-mode override |
| Button text | `--wy-button-text-fg` | text button color | `var(--md-sys-color-primary)` |  | Defined locally only in dark-mode override |
| Button text hover | `--wy-button-text-hover-bg` | hover background | `color-mix(in srgb, var(--md-sys-color-primary) 5%, transparent)` |  | Defined locally only in dark-mode override |
| Toast success | `--wy-toast-success-color` | semantic color | `var(--md-sys-color-primary)` |  | Local token in `tokens.css` |
| Toast error | `--wy-toast-error-color` | semantic color | `#B3261E` |  | Local token in `tokens.css` |
| Toast warning | `--wy-toast-warning-color` | semantic color | `var(--md-sys-color-secondary)` |  | Local token in `tokens.css` |
| Toast info | `--wy-toast-info-color` | semantic color | `var(--md-sys-color-secondary)` |  | Local token in `tokens.css` |

### Components With No Local Public Color Overrides In This Repo

| Component | Selector / Token | Property | Current Color | New Color | Notes |
| --- | --- | --- | --- | --- | --- |
| Controls bar | `wy-controls-bar#controlsBar` | color source | design system component styles |  | Local host sets spacing/layout only, not color |
| Prompt modal | `wy-prompt-modal#promptModal` | color source | design system component styles |  | No local public color overrides found |
| Links modal | `wy-links-modal#linksModal` | color source | design system component styles |  | Mobile override changes spacing only |
| Keyboard shortcuts modal | `wy-modal#shortcutsModal` | color source | design system component styles |  | No local public color overrides found |

## Implementation Notes For Later

- Rows marked as design-system-backed may need implementation in `m3-design-v2`.
- Most prompt-card, prompt-list, quick-link, and textarea colors are local to this repo.
- `--tag-bg` is referenced by `.variable-count-badge` in [`styles.css`](/Users/mwy/Library/Mobile%20Documents/com~apple~CloudDocs/Projects/prompts-library/styles.css) but its source is not defined in the local files reviewed; confirm its runtime source before implementation.
