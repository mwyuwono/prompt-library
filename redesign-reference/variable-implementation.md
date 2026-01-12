UI/UX Questions

  1. Variation Selection UI: How should users select between variations?
    - Option A: Dropdown menu above the variables section
  
  2. Card Indication: Should cards in the grid view indicate that a prompt has multiple variations available? No

  3. Modal Display: When the modal opens, which variation should show by default?
    - First variation.

  Data Structure Questions

  4. JSON Structure: How should variations be structured in prompts.json? For example:
  {
    "id": "writing-assistant",
    "title": "Writing Assistant",
    "category": "Productivity",
    "variations": [
      {
        "id": "casual",
        "name": "Casual Style",
        "template": "..."
      },
      {
        "id": "formal",
        "name": "Formal Style",
        "template": "..."
      }
    ],
    "variables": [...]
  }
  4. Or a different structure? Looks fine to me--I defer to you.
  5. Shared vs Unique Properties: Should variations:
    - Share the same description and variables? Or can each have unique ones?
    - Share the same category? Or can each be categorized differently? Share the same description and variables. 
  6. Variable Compatibility: Must all variations use the exact same variables, or can some variations have additional/different variables? Some can have additional/different variables. 

  Behavior Questions

  7. Input Preservation: When switching between variations, should user input values be preserved? Yes
  8. Preview Tab: Should the Preview tab show the compiled prompt with the currently selected variation? Yes
  9. Download Filename: When downloading, should the filename include the variation name? yes

  Also make these adjustments: 

  1. Header & Branding Refinement
Remove Decorative Image: Remove the div.modal-preview-image entirely.

Typography: Set the #promptModalTitle font-family to match the cards .

Tighten Header: * Reduce padding on .modal-header.

Ensure .modal-header uses display: flex with align-items: center.

The #promptModalLockButton (currently labeled "Save changes") and the .modal-close button should be vertically centered relative to the title text.

2. Content Area & Spacing (.modal-body)
Reduce Vertical Gaps: * Decrease the margin-top and margin-bottom on .prompt-modal-description.

Reduce padding inside .modal-body and .modal-body-content.

Stabilize Container Height:

The video shows a "jump" when switching tabs. Apply a min-height (e.g., 400px) to .modal-scroll-area or .modal-body-content to ensure the modal height remains consistent regardless of the content length in the Variables vs. Preview tabs.

Textarea Adjustments:

Remove the inline style="height: 353px;" from the .template-textarea.

Use CSS to set a height or min-height that fills the available space in .modal-scroll-area without forcing unnecessary page scrolling.

3. Layout & Alignment
Tab Alignment: In the video, the "Variables/Preview" tabs and the "Clear All" button shift the layout. Ensure .template-editor and other tab content share the same horizontal alignment.

Label Spacing: Ensure the "TEXT TO REVIEW" label has minimal top margin to keep it tight to the tabs.

4. Action Buttons (.modal-actions)
Horizontal Layout: * Update .modal-actions.card-actions to use display: flex; flex-direction: row; gap: 12px;.

The buttons (.btn-secondary and .btn-primary) should be side-by-side.

Set the buttons to flex: 1 so they share equal width, or flex: 0 1 auto for natural width, depending on the design preference.

Mobile Responsiveness: Use a media query (e.g., @media (max-width: 480px)) to switch .modal-actions back to flex-direction: column for small screens.

Sizing: Reduce the padding on the .btn classes within the modal to make them less "chunky."

5. Component Cleanup
Consistency: #promptModalLockButton should be hidden when in "Edit" mode to reduce visual clutter.