# Using the Component Adaptation Prompt

**The new prompt is now available in your Prompts Library!**

---

## How to Access

1. **Open Prompts Library:** http://localhost:8000
2. **Find the prompt:** 
   - Category: **Productivity**
   - Title: **Component Adaptation (Design System)**
   - Icon: 🧩 widgets

---

## How to Use

### Step 1: Fill in the Form

The prompt has 3 input fields:

**1. Screenshot**
- Describe the component screenshot
- Or note "Attached" if you'll attach the image in Cursor

**2. Original Code** (textarea)
- Paste the HTML/CSS/JavaScript from the example component
- Can be from any source (CodePen, website inspect, design mockup)

**3. Usage Context**
- Where will this component be used?
- Any specific requirements?
- Example: "Primary action button for forms"

### Step 2: Generate the Prompt

Click "Generate" to create the formatted prompt text with your inputs filled in.

### Step 3: Copy to Cursor

Copy the generated prompt and paste it into Cursor.

### Step 4: Attach Screenshot

In Cursor, attach or describe your screenshot along with the pasted prompt.

---

## What Happens Next

When you paste the generated prompt in Cursor, the AI will:

1. **Analyze** screenshot and code
2. **Map** values to design tokens
3. **Update** design system if needed (adds missing tokens)
4. **Implement** as Web Component
5. **Test** with Playwright automation:
   - Visual capture (light + dark)
   - Hardcoded value detection
   - Layout measurements
   - Interactive states
   - Dark mode verification
6. **Deliver:**
   - Complete component code
   - Token mapping report
   - Playwright test results
   - Screenshots proving it works

---

## Example Usage

### In Prompts Library:

**Screenshot:** `Attached - blue button with rounded corners and icon`

**Original Code:**
```html
<button class="action-btn" style="background: #007bff; color: white; padding: 12px 24px; border-radius: 20px; font-size: 16px;">
  <span class="icon">→</span>
  Click Me
</button>
```

**Usage Context:** `Primary call-to-action button for modal dialogs`

### Generated Output:

The prompt will expand to include:
- Your inputs filled into the template
- Complete workflow instructions
- Playwright testing requirements
- Deliverables checklist

### In Cursor:

Paste the generated prompt, attach your screenshot, and you'll receive:
- `wy-action-button.js` component
- Token mapping showing `#007bff` → `var(--md-sys-color-primary)`
- Playwright screenshots proving visual match
- Integration instructions

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────┐
│  Component Adaptation (Design System)           │
│  Category: Productivity | Icon: widgets         │
├─────────────────────────────────────────────────┤
│                                                 │
│  📸 Screenshot: [describe or attach]            │
│  💻 Original Code: [paste HTML/CSS/JS]          │
│  📍 Context: [where it's used]                  │
│                                                 │
│  ⬇️ Generate → Copy → Paste in Cursor          │
│                                                 │
│  ✅ Returns:                                     │
│    • Complete Web Component                     │
│    • Playwright test results                    │
│    • Visual match screenshots                   │
│    • 100% token usage verified                  │
│    • Dark mode tested                           │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Benefits

**Traditional approach:**
- Paste code in Cursor
- "Can you adapt this?"
- Back and forth fixing issues
- Hope it works in dark mode
- ~1 hour

**With this prompt:**
- Fill form in Prompts Library
- Generate and paste
- AI runs automated tests
- Delivers working component with proof
- ~15 minutes

**Time savings: 75%**

---

## Testing the Prompt

Try it with this simple example:

**Screenshot:** Simple card with title and description

**Original Code:**
```html
<div style="background: #f5f5f5; padding: 24px; border-radius: 12px;">
  <h3 style="color: #333;">Title</h3>
  <p style="color: #666;">Description text here</p>
</div>
```

**Context:** Info card for dashboard metrics

Generate this in the Prompts Library, paste in Cursor, and you'll get a fully adapted `wy-info-card` component with Playwright verification!

---

## Location in Library

The prompt appears in the **Productivity** category alongside:
- Writing Assistant
- Work Email Reply
- Jira Task Extractor
- Webflow Code Helper

**Now your component adaptation workflow is part of your prompt library!** 🎉
