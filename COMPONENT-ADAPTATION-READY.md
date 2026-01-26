# Component Adaptation Prompt - Ready to Use ✅

**Status:** Fully integrated and ready  
**Action Required:** Hard refresh browser to load

---

## ✅ What Was Completed

### 1. Prompt Created as Static (No Variables)
- **ID:** `component-adaptation`
- **Title:** Component Adaptation (Design System)
- **Category:** Productivity (#7 in category)
- **Type:** Static prompt (copy to clipboard)
- **Format:** Plain text paragraphs (8,548 characters)

### 2. Prompt Cards Visibility Fixed
- **Issue:** Cards had `opacity: 0` due to missing motion tokens
- **Fix:** Added motion token fallbacks to `tokens.css`
- **Result:** All cards now visible with working animations

### 3. Files Updated

**prompts.json:**
```json
{
  "id": "component-adaptation",
  "title": "Component Adaptation (Design System)",
  "description": "Adapt external components to m3-design-v2...",
  "category": "Productivity",
  "icon": "widgets",
  "template": "[8548 character plain text workflow]",
  "variables": []
}
```

**tokens.css:**
- Added fallback motion easing tokens
- Added fallback motion duration tokens

**prompts-for-implementation/component-adaptation.txt:**
- Backup copy of the prompt text

---

## 🎯 How to Use It

### Step 1: Hard Refresh Browser
Press **Cmd+Shift+R** (Mac) or **Ctrl+Shift+F5** (Windows)

This clears the cache and loads the updated prompts.json

### Step 2: Navigate to Productivity
- Click the **"Productivity"** category filter chip
- You should see 7 prompts (was 6, now includes Component Adaptation)

### Step 3: Click the Prompt Card
Find **"Component Adaptation (Design System)"** with the widgets icon 🧩

### Step 4: Copy to Clipboard
- The modal will show the complete workflow text
- Click **"Copy to Clipboard"** button
- Paste into Cursor or your LLM coding assistant

### Step 5: Provide Your Materials
After pasting the workflow prompt, add:
- Your screenshot (attach in Cursor)
- Original code (paste below the prompt)
- Any context about usage

---

## 📝 What the Prompt Contains

The static prompt includes:

**Introduction:**
- States you need to adapt a component
- Mentions you'll provide screenshot and code
- Requests Playwright verification

**6 Phase Workflow:**
1. **Analysis & Planning** - Visual and code analysis, token mapping
2. **Design System Updates** - Adding missing tokens with dark mode
3. **Implementation** - Web Component creation with 100% tokens
4. **Automated Testing** - Playwright verification commands
5. **Quality Assurance** - Verification checklist
6. **Deliverables** - What to provide (token mapping, test results, code)

**Success Criteria:**
- Visual fidelity, token usage, Playwright tests passing
- Dark mode working, no hardcoded values
- Component documented and ready for deployment

**Anti-Patterns to Avoid:**
- Hardcoded colors, magic numbers, !important
- Missing dark mode, missing font imports
- Skipping Playwright verification

**Design System Compliance Checklist:**
- Colors, typography, spacing, shape, motion, interactive states

**All in plain text paragraph form** (no markdown formatting in the actual prompt)

---

## 🧪 Verification Test

I verified the prompt is ready:

```
✅ prompts.json contains component-adaptation
✅ Template field has 8,548 characters
✅ Category: Productivity (correct)
✅ Variables: empty array (static prompt)
✅ Icon: widgets
✅ JSON validation passed
✅ Total prompts in library: 22
```

---

## 💡 Example Usage

### You'll Copy:
```
I need to adapt a component to my m3-design-v2 design system. I will provide 
a screenshot of the component and the original code. Please follow the 
systematic component adaptation workflow to recreate this component using 
100% design system tokens with automated Playwright verification.

Follow this workflow: Phase 1 is Analysis and Planning. Analyze the screenshot 
I provide for visual patterns including layout structure, typography hierarchy, 
color palette...

[continues for 8,548 characters with complete workflow]
```

### You'll Add:
```
[Paste the prompt above]

Screenshot: [Attach your screenshot in Cursor]

Original Code:
<button style="background: #007bff; padding: 12px 24px;">
  Click Me
</button>

Context: Primary action button for modal dialogs
```

### You'll Get:
- Complete Web Component (wy-action-button.js)
- Token mapping report
- Playwright test screenshots
- Integration instructions

---

## 📊 Current Status

### Prompts Library (localhost:8000):
- ✅ All cards visible
- ✅ Animations working
- ✅ Motion tokens loaded
- ✅ 22 prompts total
- ✅ Component Adaptation added to Productivity
- ⏳ **Needs hard refresh to load new prompt**

### M3 Design System (localhost:5173):
- ✅ Component library fixed
- ✅ Sticky sidebar working
- ✅ Material Icons loading
- ✅ Automation tools ready

---

## 🎯 Next Step

**Hard refresh your browser** (Cmd+Shift+R) at http://localhost:8000

Then navigate to Productivity category to see your new static prompt!

---

**The Component Adaptation workflow is fully integrated and ready to use!** 🚀

Just refresh to see it in action.
