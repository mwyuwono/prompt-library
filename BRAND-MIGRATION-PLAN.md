# Prompt Library Style Guide

**Version:** 2.0
**Last Updated:** January 11, 2026
**Design Philosophy:** Warm, elegant, refined — a gallery-like aesthetic that emphasizes clarity and sophistication

---

## Table of Contents

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Component Library](#component-library)
4. [Layout & Spacing](#layout--spacing)
5. [Shadows & Effects](#shadows--effects)
6. [Usage Guidelines](#usage-guidelines)

---

## Color Palette

The design uses a refined 5-color system that emphasizes warmth and elegance.

### Core Colors

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| **Linen** | `#F9F7F2` | rgb(249, 247, 242) | Page background, secondary buttons |
| **Charcoal** | `#1C1C1C` | rgb(28, 28, 28) | Primary text (light backgrounds), primary buttons, active states |
| **White** | `#FFFFFF` | rgb(255, 255, 255) | Card backgrounds, text (dark backgrounds) |
| **Olive** | `#3D4435` | rgb(61, 68, 53) | Featured cards, category badges, emphasis |
| **Gold** | `#C4A484` | rgb(196, 164, 132) | Accent color, hover states, focus indicators, category badges |
| **Warm Grey** | `#707070` | rgb(112, 112, 112) | Secondary text, borders, category badges |

### Contextual Color Usage

#### On Light Backgrounds (White, Linen)
- **Primary text:** Charcoal `#1C1C1C`
- **Secondary text:** Warm Grey `#707070`
- **Borders:** Warm Grey at 10-20% opacity `rgba(112, 112, 112, 0.1)`

#### On Dark Backgrounds (Olive)
- **Primary text:** White `#FFFFFF`
- **Secondary text:** White at 80-90% opacity `rgba(255, 255, 255, 0.85)`
- **Borders:** White at 10-20% opacity `rgba(255, 255, 255, 0.2)`

#### Interactive States
- **Default:** Charcoal or context-appropriate color
- **Hover:** Gold `#C4A484`
- **Focus:** Gold outline (3px solid, 2px offset)
- **Active/Selected:** Charcoal background, White text

---

## Typography

### Font Families

**Serif:** Playfair Display
**Sans-Serif:** Inter

### Universal Usage

- **All card titles:** Playfair Display (serif)
- **All body text, descriptions, UI:** Inter (sans-serif)
- **Category badges:** Inter (sans-serif)
- **Buttons:** Inter (sans-serif)

### Type Scale

| Element | Font | Weight | Size | Line Height | Transform | Letter Spacing |
|---------|------|--------|------|-------------|-----------|----------------|
| **Card Title** | Playfair Display | 600 | 1.5rem (24px) | 1.3 | None | 0 |
| **Card Description** | Inter | 300-400 | 0.875rem (14px) | 1.625 | None | 0 |
| **Category Badge** | Inter | 700 | 0.75rem (12px) | 1.2 | Uppercase | 0.05em |
| **Button Text** | Inter | 500 | 0.875-1rem | 1.5 | Uppercase | 0.05em |
| **Search Input** | Inter | 400 | 1rem (16px) | 1.5 | None | 0 |
| **Page Title** | Inter | 500 | 1rem (16px) | 1.5 | None | 0 |

### Typography Colors by Context

**White Cards:**
- Title: Charcoal `#1C1C1C`
- Description: Warm Grey `#707070`

**Olive Cards:**
- Title: White `#FFFFFF`
- Description: White at 85% opacity `rgba(255, 255, 255, 0.85)`

---

## Component Library

### 1. Cards

#### Standard White Card

**Visual Specifications:**
- **Background:** White `#FFFFFF`
- **Border:** 1px solid Warm Grey/10 `rgba(112, 112, 112, 0.1)`
- **Border Radius:** 24px (1.5rem)
- **Height:** 400px fixed
- **Shadow (default):** `0 1px 3px rgba(0, 0, 0, 0.05)`
- **Shadow (hover):** `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`
- **Transform (hover):** translateY(-2px)

**With Image:**
- **Image area:** Top 50% of card height
- **Content area:** Bottom 50%, white background
- **Title text:** Charcoal `#1C1C1C`, Playfair Display, 24px, weight 600
- **Description text:** Warm Grey `#707070`, Inter, 14px, weight 300
- **Padding (content):** 24px horizontal, 20px vertical

**Without Image (icon only):**
- **Full white background**
- **Icon:** Top center, Charcoal color, 24-32px size
- **Same typography as image cards**

#### Featured Olive Card

**Visual Specifications:**
- **Background:** Olive `#3D4435`
- **Border:** None
- **Border Radius:** 24px (1.5rem)
- **Height:** 400px fixed
- **Shadow (default):** `0 1px 3px rgba(0, 0, 0, 0.05)`
- **Shadow (hover):** `0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)`
- **Glow effect:** Soft white radial gradient blur in top-right corner

**Typography:**
- **Title text:** White `#FFFFFF`, Playfair Display, 24px, weight 600
- **Description text:** White 85% `rgba(255, 255, 255, 0.85)`, Inter, 14px, weight 300
- **Icon:** White `#FFFFFF`, top center, 24-32px
- **Padding:** 32px horizontal, 28px vertical

---

### 2. Badges

The design uses a **3-color badge system** for categories.

#### Gold Badge
**Categories:** Creativity, Lifestyle, Inspiration

**On White/Light Backgrounds:**
- **Background:** Gold/10 `rgba(196, 164, 132, 0.1)`
- **Text:** Gold `#C4A484`
- **Font:** Inter, weight 700, 12px
- **Transform:** Uppercase
- **Letter spacing:** 0.05em
- **Padding:** 0.35rem horizontal, 0.75rem vertical
- **Border radius:** 8px

**On Olive/Dark Backgrounds:**
- **Background:** White/20 `rgba(255, 255, 255, 0.2)`
- **Text:** White `#FFFFFF`
- **Same typography settings**

#### Olive Badge
**Categories:** Productivity, Expertise

**On White/Light Backgrounds:**
- **Background:** Olive/10 `rgba(61, 68, 53, 0.1)`
- **Text:** Olive `#3D4435`
- **Same typography as Gold badge**

**On Olive/Dark Backgrounds:**
- **Background:** White/20 `rgba(255, 255, 255, 0.2)`
- **Text:** White `#FFFFFF`

#### Warm Grey Badge
**Categories:** Travel & Shopping, Editing, Architecture, Education, Photography, Audio

**On White/Light Backgrounds:**
- **Background:** Warm Grey/10 `rgba(112, 112, 112, 0.1)`
- **Text:** Warm Grey `#707070`
- **Same typography as Gold badge**

**On Olive/Dark Backgrounds:**
- **Background:** White/20 `rgba(255, 255, 255, 0.2)`
- **Text:** White `#FFFFFF`

---

### 3. Buttons

#### Primary Button

**Visual Specifications:**
- **Background:** Charcoal `#1C1C1C`
- **Text:** White `#FFFFFF`
- **Font:** Inter, weight 500, 14-16px
- **Transform:** Uppercase
- **Letter spacing:** 0.05em
- **Padding:** 0.625rem vertical, 1.5rem horizontal
- **Border radius:** Full (9999px, pill shape)
- **Border:** None

**States:**
- **Hover:** Background Charcoal/90 `rgba(28, 28, 28, 0.9)` or Olive
- **Focus:** 3px solid Gold outline, 2px offset
- **Active:** Slight scale down

#### Secondary Button

**Visual Specifications:**
- **Background:** Linen `#F9F7F2`
- **Text:** Charcoal `#1C1C1C`
- **Border:** 1px solid Warm Grey/20 `rgba(112, 112, 112, 0.2)`
- **Font:** Inter, weight 500, 14-16px
- **Transform:** Uppercase
- **Letter spacing:** 0.05em
- **Padding:** 0.625rem vertical, 1.5rem horizontal
- **Border radius:** Full (9999px, pill shape)

**States:**
- **Hover:** Border Gold `#C4A484`, Background Linen/80
- **Focus:** 3px solid Gold outline, 2px offset
- **Active:** Background Linen/60

---

### 4. Arrow Buttons

**Visual Specifications:**
- **Size:** 40px (2.5rem) diameter
- **Background (default):** Transparent
- **Border (default):** 1px solid Warm Grey/20 `rgba(112, 112, 112, 0.2)`
- **Icon:** Material Icons `arrow_forward`, Charcoal color
- **Border radius:** Full circle (50%)
- **Opacity (default):** 0 (hidden)
- **Opacity (card hover):** 1 (visible)
- **Transform (default):** translateX(-4px)
- **Transform (card hover):** translateX(0)

**Hover State (on arrow itself):**
- **Background:** Gold `#C4A484`
- **Border:** Gold `#C4A484`
- **Icon color:** White `#FFFFFF`

**On Olive Cards:**
- **Border (default):** White/30 `rgba(255, 255, 255, 0.3)`
- **Icon color:** White `#FFFFFF`
- **Hover:** Gold background, white icon (same as white cards)

---

### 5. Search Bar

**Visual Specifications:**
- **Background:** White `#FFFFFF`
- **Border:** 1px solid Warm Grey/10 `rgba(112, 112, 112, 0.1)`
- **Border radius:** 12px (0.75rem)
- **Padding:** 0.75rem horizontal, 0.5rem vertical
- **Width:** ~350px (adjusts on mobile)
- **Height:** ~48px

**Typography:**
- **Placeholder text:** "Search prompts..." in Warm Grey `#707070`
- **Input text:** Charcoal `#1C1C1C`
- **Font:** Inter, weight 400, 16px
- **Icon:** Search icon (magnifying glass) in Warm Grey, 20px

**States:**
- **Focus:** Border Gold `#C4A484`, 3px solid outline at 2px offset
- **Hover:** Border Warm Grey/20

---

### 6. Category Filter Chips

**Visual Specifications:**

**Inactive State:**
- **Background:** Transparent
- **Text:** Charcoal `#1C1C1C`
- **Font:** Inter, weight 500, 14px
- **Transform:** Uppercase
- **Letter spacing:** 0.05em
- **Padding:** 0.5rem horizontal, 0.375rem vertical
- **Border radius:** 8px
- **Border:** None

**Active State:**
- **Background:** Charcoal `#1C1C1C`
- **Text:** White `#FFFFFF`
- **Same typography**
- **Transform:** scale(1.05) (slight grow)

**Hover State:**
- **Background:** Warm Grey/10 `rgba(112, 112, 112, 0.1)`

**Focus State:**
- **Outline:** 3px solid Gold, 2px offset

---

### 7. View Toggle

**Visual Specifications:**
- **Icons:** List view (☰), Grid view (⊞)
- **Size:** 24px icons
- **Color (inactive):** Warm Grey `#707070`
- **Color (active):** Charcoal `#1C1C1C`
- **Background (hover):** Warm Grey/10 `rgba(112, 112, 112, 0.1)`
- **Border radius:** 8px
- **Padding:** 8px

---

### 8. Descriptions Toggle

**Visual Specifications:**
- **Type:** Toggle switch (pill-shaped)
- **Label:** "DESCRIPTIONS" in Inter, weight 500, 12px, uppercase
- **Switch background (off):** Warm Grey `#707070`
- **Switch background (on):** Charcoal `#1C1C1C`
- **Switch knob:** White circle
- **Width:** ~48px
- **Height:** ~24px

---

## Layout & Spacing

### Grid System

**Grid View (Cards):**
- **Container:** CSS Grid
- **Columns:** Auto-fill with minimum 300px width
- **Gap:** 24px (1.5rem) between cards
- **Padding:** 32px (2rem) container padding

**Responsive Breakpoints:**
- **Mobile (< 768px):** 1 column
- **Tablet (768-1023px):** 2 columns
- **Desktop (1024-1279px):** 3 columns
- **XL (1280px+):** 4 columns

### Spacing Scale

| Token | Size | Usage |
|-------|------|-------|
| xs | 4px | Tight spacing, icon gaps |
| sm | 8px | Small gaps, compact layouts |
| md | 16px | Standard spacing between elements |
| lg | 24px | Card padding, section spacing |
| xl | 32px | Container padding, large gaps |
| 2xl | 48px | Section separators |

### Component Spacing

**Cards:**
- **Internal padding (white cards):** 24px horizontal, 20px vertical
- **Internal padding (olive cards):** 32px horizontal, 28px vertical
- **Gap between title and description:** 12px
- **Gap between content and badges:** 16px

**Header:**
- **Height:** 64px fixed
- **Horizontal padding:** 32px (2rem)
- **Logo to title gap:** 16px
- **Title to nav gap:** Auto (flex space-between)

**Controls Bar:**
- **Height:** Minimum 64px
- **Horizontal padding:** 32px
- **Gap between elements:** 16px
- **Gap between chips:** 8px

---

## Shadows & Effects

### Shadow System

| Level | CSS Value | Usage |
|-------|-----------|-------|
| **Subtle** | `0 1px 3px rgba(0, 0, 0, 0.05)` | Default card state |
| **Medium** | `0 4px 6px -1px rgba(0, 0, 0, 0.1)` | Elevated elements |
| **Large** | `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)` | Card hover state |
| **XL** | `0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)` | Olive card hover, modals |

### Glow Effect (Olive Cards Only)

**Specifications:**
- **Position:** Top-right corner of card
- **Element:** Pseudo-element (`::before`)
- **Background:** White `#FFFFFF` at 5% opacity `rgba(255, 255, 255, 0.05)`
- **Size:** 200px x 200px circle
- **Blur:** 60px
- **Border radius:** 50% (circular)
- **Purpose:** Adds subtle depth and visual interest to dark cards

### Border Radius Scale

| Size | Value | Usage |
|------|-------|-------|
| **Small** | 8px | Badges, chips, small buttons |
| **Medium** | 12px | Search bar, inputs |
| **Large** | 24px | Cards, modals |
| **XL** | 32px | Special containers |
| **Full** | 9999px | Pill-shaped buttons, circular icons |

---

## Usage Guidelines

### When to Use White Cards vs. Olive Cards

**White Cards:**
- **Default choice** for most prompts
- Prompts with featured images
- General content that needs high readability
- When you want the image to be the primary focus
- Standard library items

**Olive Featured Cards:**
- Special or featured prompts you want to highlight
- Prompts without compelling images (icon-based)
- To create visual rhythm and hierarchy in the grid
- Every 3-4 cards for balanced visual interest
- Premium or advanced prompts

**Ratio Guideline:** Approximately 60-70% white cards, 30-40% olive cards in a typical grid view.

---

### Badge Color Assignment

Use the 3-color system to create visual grouping:

**Gold Badges** — Creative, expressive, lifestyle-focused:
- Creativity
- Lifestyle
- Inspiration
- Art & Design

**Olive Badges** — Professional, productivity-focused:
- Productivity
- Expertise
- Business
- Professional Writing

**Warm Grey Badges** — Specialized, technical, or niche:
- Travel & Shopping
- Editing
- Architecture
- Education
- Photography
- Audio
- Technical categories

**Guideline:** When adding a new category, assign it based on the nature of the prompts—creative (gold), professional (olive), or specialized (warm grey).

---

### Button Hierarchy

**Primary Button (Charcoal):**
- Main call-to-action
- "Copy to Clipboard", "Download", "Save"
- Single most important action per context
- **Limit:** 1-2 primary buttons per screen/modal

**Secondary Button (Linen + border):**
- Supporting actions
- "Cancel", "Edit", "Clear"
- Less critical actions
- Can have multiple per context

**Text/Link Style:**
- Tertiary actions
- "Learn more", "Skip", navigation links
- Inline help or info links

---

### Focus States

**All interactive elements** must have a consistent focus indicator:
- **Outline:** 3px solid Gold `#C4A484`
- **Offset:** 2px outside the element
- **Applied to:** Buttons, links, inputs, chips, cards, toggles

**Purpose:** Provides clear keyboard navigation feedback while maintaining the elegant gold accent color.

---

### Responsive Behavior

**Mobile Adjustments:**
- Search bar width: 100% minus padding
- Category chips: Horizontal scroll if needed
- Grid: 1 column with full width cards
- Card height: Can be flexible (auto) on mobile if needed
- Padding reduced: 16px instead of 32px

**Tablet (768px+):**
- 2-column grid
- Standard padding maintained
- Chips remain horizontal scroll

**Desktop (1024px+):**
- 3-4 column grid based on viewport
- Full spacing and padding
- All elements at optimal size

---

### Text Hierarchy on Cards

**Title (Most Prominent):**
- Playfair Display serif
- 24px, weight 600
- Charcoal on white, White on olive
- 1-2 lines maximum (truncate with ellipsis if needed)

**Description (Supporting):**
- Inter sans-serif
- 14px, weight 300-400
- Warm Grey on white (70%), White 85% on olive
- 2-3 lines maximum

**Badges (Least Prominent):**
- Inter sans-serif
- 12px, weight 700, uppercase
- Colored backgrounds with matching text
- Bottom of card, aligned left

---

### Icon Usage

**Material Icons** are used throughout:
- **Size:** 20-24px for most UI icons
- **Size:** 24-32px for card icons (on olive cards without images)
- **Color:** Matches context (Charcoal on light, White on dark)
- **Hover:** Transform to Gold when applicable (arrow buttons)

**Common Icons:**
- Search: `search` (magnifying glass)
- List view: `view_list` or equivalent
- Grid view: `grid_view` or equivalent
- Arrow: `arrow_forward`
- Close: `close`

---

### Animation & Transitions

**Standard Duration:** 200-300ms
**Easing:** Cubic-bezier(0.4, 0, 0.2, 1) or ease-out

**What Animates:**
- Card shadows and transforms on hover
- Arrow button opacity and position on card hover
- Arrow button colors on direct hover
- Button hover states
- Chip background changes
- Toggle switch state changes

**What Doesn't Animate:**
- Text color changes (instant)
- Icon color changes (instant)
- Layout shifts

---

### Color Contrast Requirements

While accessibility isn't a primary concern, these ratios ensure readability:

**Verified Contrasts:**
- Charcoal on Linen: Excellent (high contrast)
- Charcoal on White: Excellent (high contrast)
- White on Olive: Good (readable)
- Warm Grey on White: Good for secondary text
- Gold on White: Sufficient for accents (avoid for body text)

**Usage Note:** Avoid using Gold for large blocks of text on white backgrounds. Use for accents, borders, and highlights only.

---

## Quick Reference Card

### Colors
- Linen: `#F9F7F2` (background)
- Charcoal: `#1C1C1C` (primary text/buttons)
- White: `#FFFFFF` (cards, text on dark)
- Olive: `#3D4435` (featured cards)
- Gold: `#C4A484` (accents, hover)
- Warm Grey: `#707070` (secondary text, borders)

### Fonts
- Titles: Playfair Display
- Everything else: Inter

### Card Types
- White cards: Default, with or without images
- Olive cards: Featured, usually without images

### Badge Colors
- Gold: Creative categories
- Olive: Professional categories
- Warm Grey: Specialized categories

### Shadows
- Default: Subtle
- Hover: Large or XL

### Border Radius
- Cards/Modals: 24px
- Buttons: Full (pill)
- Badges/Chips: 8px
- Inputs: 12px

---

**End of Style Guide**

*This guide represents the current visual design system for the Prompt Library. All new components and updates should follow these specifications to maintain consistency and elegance.*
