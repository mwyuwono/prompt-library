# Component Adaptation Prompt - Successfully Added ✅

**Date:** January 26, 2026  
**Status:** Ready to use

---

## What Was Created

### In Prompts Library:

**New Prompt Added:**
- **ID:** `component-adaptation`
- **Title:** Component Adaptation (Design System)
- **Category:** Productivity
- **Icon:** widgets 🧩
- **Total prompts in library:** 22

**Files Created/Modified:**

1. ✅ `prompts-for-implementation/component-adaptation.txt` - Complete workflow text
2. ✅ `prompts.json` - Added new prompt entry
3. ✅ `COMPONENT-ADAPTATION-USAGE.md` - Usage guide (this file)

---

## How to Use the New Prompt

### Step 1: Access Prompts Library

**URL:** http://localhost:8000

**Navigate to:** Productivity category

**Find:** "Component Adaptation (Design System)" prompt card

### Step 2: Fill in the Form

**Field 1: Screenshot**
- Describe your screenshot
- Or write "Attached" if you'll attach in Cursor
- Example: "Blue rounded button with white text and drop shadow"

**Field 2: Original Code** (Large textarea)
- Paste the HTML/CSS/JavaScript from the source
- Example:
  ```html
  <button style="background: #007bff; padding: 12px 24px;">
    Click Me
  </button>
  ```

**Field 3: Usage Context**
- Where will this be used?
- Any special requirements?
- Example: "Primary CTA button for modal actions"

### Step 3: Generate

Click the "Generate" button to create the full prompt with your inputs filled in.

### Step 4: Use in Cursor

1. Copy the generated prompt text
2. Paste into Cursor chat
3. Attach your screenshot (if you have one)
4. The AI will follow the complete workflow with Playwright automation

---

## What the Workflow Does

When you paste the generated prompt in Cursor:

**Phase 1: Analysis**
- Analyzes your screenshot visually
- Reviews original code for hardcoded values
- Creates token mapping table (original → design system)
- Identifies missing design system assets

**Phase 2: Design System Updates**
- Adds new tokens to `m3-design-v2/src/styles/tokens.css` if needed
- Includes dark mode variants
- Documents rationale

**Phase 3: Implementation**
- Creates Web Component (`wy-[name].js`)
- Uses 100% design system tokens
- Follows MD3 patterns
- Imports fonts in Shadow DOM

**Phase 4: Automated Playwright Testing**
- Visual capture (light + dark mode)
- Layout measurements
- Hardcoded value detection
- Interactive state testing
- Dark mode verification
- Material Icons check

**Phase 5: Quality Assurance**
- Compares with original screenshot
- Verifies all tests passing
- Checks for console errors
- Validates accessibility

**Phase 6: Deliverables**
- Token mapping report
- Playwright test results
- Complete component code
- Integration instructions

---

## Example Flow

### You input in Prompts Library:

```
Screenshot: Card with blue gradient background, white title, and button

Original Code:
<div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 32px;">
  <h3 style="color: white;">Premium Feature</h3>
  <button style="background: white; color: #667eea;">Learn More</button>
</div>

Context: Feature highlight cards for marketing pages
```

### You get in Cursor:

```javascript
// wy-premium-card.js
export class WyPremiumCard extends LitElement {
  static styles = css`
    .card {
      background: var(--wy-gradient-premium);
      padding: var(--spacing-xl);
      /* Complete implementation with tokens */
    }
  `;
}
```

**Plus:**
- Token mapping: `#667eea` → `var(--md-sys-color-primary)`
- New token created: `--wy-gradient-premium`
- Playwright screenshots showing match
- All automated tests passing

---

## Prompt Template Preview

The generated prompt will look like:

```markdown
Screenshot: [your input]

Original Code:
[your pasted code]

Context: [your context]

---

I need to adapt this component to my m3-design-v2 design system.

Follow the systematic component adaptation workflow:

Phase 1: Analysis & Planning
[Detailed analysis instructions]

Phase 2: Design System Updates (If Needed)
[Token creation guidelines]

Phase 3: Implementation
[Web Component implementation requirements]

Phase 4: Automated Testing with Playwright
CRITICAL: Use Playwright to verify before showing results
[Complete testing protocol]

Phase 5: Quality Assurance
[Verification checklist]

Phase 6: Deliverables
- Token mapping report
- Playwright test results with screenshots
- Complete component code
- Integration instructions

Success Criteria:
✅ Visual fidelity matches screenshot
✅ All Playwright tests passing
✅ Zero hardcoded values
✅ Dark mode working
✅ Component documented
✅ Ready for deployment
```

---

## Benefits

**Automated Quality:**
- Playwright catches issues before you see them
- No manual testing required
- Proof via screenshots and test results

**Design System Compliance:**
- 100% token usage enforced
- Dark mode automatically verified
- MD3 patterns followed

**Fast Iterations:**
- One prompt generates everything
- No back-and-forth describing issues
- Working component in ~15 minutes

---

## Troubleshooting

### Issue: Prompt not appearing in library

**Solution:** Hard refresh browser (Cmd+Shift+R) to reload prompts.json

### Issue: Can't find the prompt

**Solution:** 
- Look in "Productivity" category
- Search for "Component Adaptation"
- Filter by "Design System" in description

### Issue: Want to modify the workflow

**Solution:** Edit `prompts-for-implementation/component-adaptation.txt` to customize the workflow text

---

## Server Status

**Prompts Library:** Running at http://localhost:8000  
**M3 Design System:** Running at http://localhost:5173  

**Both servers ready for testing!**

---

## Next Steps

1. **Hard refresh** Prompts Library (Cmd+Shift+R)
2. **Navigate** to Productivity category
3. **Click** "Component Adaptation (Design System)" prompt
4. **Test** with a simple example
5. **Use** for your real component adaptations!

The prompt is ready to use immediately! 🚀
