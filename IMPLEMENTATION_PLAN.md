# Implementation Plan - Prompt Library Enhancements

This document outlines the implementation plan for upcoming features. Each section includes technical approach, files to modify, and estimated complexity.

---

## #2: Keyboard Shortcuts

**Goal**: Add keyboard shortcuts for common actions

**Shortcuts to implement**:
- `Escape` - Collapse currently expanded card
- `Cmd/Ctrl + K` - Focus search input
- `Cmd/Ctrl + /` - Show keyboard shortcuts help modal

**Implementation**:

1. **Add keyboard event listener** (`app.js`)
   ```javascript
   setupKeyboardShortcuts() {
       document.addEventListener('keydown', (e) => {
           // Escape to collapse expanded cards
           if (e.key === 'Escape') {
               const expandedIndex = this.filteredPrompts.findIndex(p => p.expanded);
               if (expandedIndex !== -1) this.toggleExpand(expandedIndex);
           }

           // Cmd/Ctrl + K to focus search
           if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
               e.preventDefault();
               this.searchInput.focus();
           }

           // Cmd/Ctrl + / to show shortcuts
           if ((e.metaKey || e.ctrlKey) && e.key === '/') {
               e.preventDefault();
               this.showShortcutsModal();
           }
       });
   }
   ```

2. **Create shortcuts modal** (`index.html`, `styles.css`, `app.js`)
   - Add modal HTML structure
   - Style modal with overlay
   - Toggle visibility with JavaScript
   - Show keyboard shortcut hints (e.g., `⌘K` or `Ctrl+K`)

3. **Add visual hint** (`index.html`, `styles.css`)
   - Small "Press ⌘K to search" hint near search bar
   - Use `navigator.platform` to detect Mac vs Windows for correct key display

**Files to modify**:
- `app.js` - Add `setupKeyboardShortcuts()` and `showShortcutsModal()`
- `index.html` - Add modal HTML
- `styles.css` - Add modal and hint styles

**Complexity**: Low-Medium (2-3 hours)

---

## #3: Local Storage for Variable Values

**Goal**: Persist user-entered variable values across page reloads (template edits remain session-only)

**Implementation**:

1. **Add localStorage utilities** (`app.js`)
   ```javascript
   saveVariableValues(promptId, variables) {
       const key = `prompt_vars_${promptId}`;
       const values = {};
       variables.forEach(v => {
           if (v.value) values[v.name] = v.value;
       });
       localStorage.setItem(key, JSON.stringify(values));
   }

   loadVariableValues(promptId, variables) {
       const key = `prompt_vars_${promptId}`;
       const saved = localStorage.getItem(key);
       if (!saved) return;

       const values = JSON.parse(saved);
       variables.forEach(v => {
           if (values[v.name]) v.value = values[v.name];
       });
   }
   ```

2. **Load saved values on init** (`app.js`)
   ```javascript
   async loadPrompts() {
       // ... existing fetch logic
       this.prompts.forEach(prompt => {
           if (prompt.variables) {
               this.loadVariableValues(prompt.id, prompt.variables);
           }
       });
       this.filteredPrompts = [...this.prompts];
   }
   ```

3. **Save on variable input change** (`app.js`)
   ```javascript
   // In attachCardEventListeners, modify variable input handler:
   input.addEventListener('input', (e) => {
       const variableName = e.target.dataset.variable;
       const variable = prompt.variables.find(v => v.name === variableName);
       if (variable) {
           variable.value = e.target.value;
           this.updatePreview(card, prompt);
           // Add this line:
           this.saveVariableValues(prompt.id, prompt.variables);
       }
   });
   ```

4. **Add "Clear saved data" option** (optional)
   - Add button in UI to clear all localStorage
   - Or add per-card "Reset" button

**Files to modify**:
- `app.js` - Add localStorage methods and integrate with existing variable handling

**Complexity**: Low (1-2 hours)

---

## #4: Visual Feedback Improvements

**Goal**: Better visual indicators and clear actions

### 4a. Variable count badge on collapsed cards

**Implementation**:

1. **Add badge to card header** (`app.js`)
   ```javascript
   getCardHTML(prompt, index) {
       const isExpanded = prompt.expanded || false;
       const variableCount = prompt.variables?.length || 0;

       return `
           <div class="card-header" data-action="toggle-expand">
               <div class="card-title-wrapper" data-action="toggle-expand">
                   <h3 class="card-title">${this.escapeHTML(prompt.title)}</h3>
                   <span class="card-category">${this.escapeHTML(prompt.category)}</span>
                   ${!isExpanded && variableCount > 0 ?
                       `<span class="variable-count-badge">${variableCount} variable${variableCount > 1 ? 's' : ''}</span>`
                       : ''}
               </div>
               ...
   ```

2. **Style badge** (`styles.css`)
   ```css
   .variable-count-badge {
       display: inline-block;
       font-size: 0.75rem;
       color: #718096;
       background-color: #edf2f7;
       padding: 0.15rem 0.5rem;
       border-radius: 10px;
       margin-left: 0.5rem;
       font-weight: 500;
   }
   ```

### 4b. "Clear all" button for variable inputs

**Implementation**:

1. **Add clear button to card actions** (`app.js`)
   ```javascript
   // In getLockedViewHTML, add button when expanded:
   ${isExpanded && hasVariables ? `
       <button class="btn-text" data-action="clear-variables">Clear All</button>
   ` : ''}
   ```

2. **Handle clear action** (`app.js`)
   ```javascript
   // In attachCardEventListeners:
   const clearButton = card.querySelector('[data-action="clear-variables"]');
   if (clearButton) {
       clearButton.addEventListener('click', () => this.clearVariables(index));
   }

   clearVariables(index) {
       const prompt = this.filteredPrompts[index];
       prompt.variables.forEach(v => v.value = '');
       localStorage.removeItem(`prompt_vars_${prompt.id}`);
       // Re-render card
       const card = this.promptGrid.querySelector(`[data-index="${index}"]`);
       if (card) {
           const newCard = this.createPromptCard(prompt, index);
           card.replaceWith(newCard);
       }
   }
   ```

### 4c. Visual distinction for filled variables

**Implementation**:

1. **Add CSS class for filled inputs** (`app.js`)
   ```javascript
   getVariablesHTML(prompt) {
       return `
           <div class="variables-section">
               ${prompt.variables.map(variable => `
                   <div class="variable-group">
                       <label class="variable-label">${this.escapeHTML(variable.label)}</label>
                       <input
                           type="text"
                           class="variable-input ${variable.value ? 'has-value' : ''}"
                           ...
   ```

2. **Style filled inputs** (`styles.css`)
   ```css
   .variable-input.has-value {
       border-color: #48bb78;
       background-color: #f0fdf4;
   }
   ```

**Files to modify**:
- `app.js` - Add badge, clear button, filled class logic
- `styles.css` - Style badge, button, and filled inputs

**Complexity**: Low-Medium (2-3 hours)

---

## #5: Better Mobile Experience

**Goal**: Optimize for mobile devices with touch-friendly interactions

**Implementation**:

1. **Increase touch targets** (`styles.css`)
   ```css
   @media (max-width: 768px) {
       .category-chip {
           padding: 0.625rem 1.25rem;
           font-size: 1rem;
       }

       .expand-button {
           font-size: 1.25rem;
           padding: 0.5rem;
       }

       .btn {
           padding: 0.875rem 1.5rem;
           font-size: 1rem;
       }

       .variable-input {
           padding: 0.75rem;
           font-size: 1rem;
       }
   }
   ```

2. **Sticky search bar on scroll** (`styles.css`, `app.js`)
   ```css
   .controls-bar.sticky {
       position: sticky;
       top: 0;
       z-index: 100;
       background: #f5f5f5;
       padding: 1rem 0;
       box-shadow: 0 2px 4px rgba(0,0,0,0.1);
   }
   ```

   ```javascript
   setupStickySearch() {
       let lastScroll = 0;
       window.addEventListener('scroll', () => {
           const currentScroll = window.pageYOffset;
           const controlsBar = document.querySelector('.controls-bar');

           if (currentScroll > 100) {
               controlsBar.classList.add('sticky');
           } else {
               controlsBar.classList.remove('sticky');
           }
       });
   }
   ```

3. **Improve mobile layout** (`styles.css`)
   ```css
   @media (max-width: 768px) {
       .header {
           padding: 2rem 0 1.5rem;
       }

       .header-title {
           font-size: 1.75rem;
       }

       .prompt-card {
           padding: 1.25rem;
       }

       .card-title {
           font-size: 1.1rem;
       }
   }
   ```

4. **Optional: Swipe gestures** (More complex)
   - Use touch events to detect swipe up/down
   - Expand on swipe up, collapse on swipe down
   - Requires careful handling to not interfere with scrolling

**Files to modify**:
- `styles.css` - Mobile-specific styles
- `app.js` - Sticky search logic (optional: swipe gestures)

**Complexity**: Low-Medium (2-3 hours, or 4-5 hours with swipe)

---

## #6: Prompt Card Metadata

**Goal**: Show additional useful information about each prompt

**Implementation**:

1. **Update JSON schema** (`prompts.json`)
   ```json
   {
       "id": "email-writer",
       "title": "Professional Email Writer",
       "description": "Generate professional emails for various business scenarios",
       "category": "Business",
       "tags": ["email", "communication", "professional"],
       "lastUsed": null,  // Timestamp, set by JavaScript
       "useCount": 0,     // Incremented on copy
       "isFavorite": false,
       ...
   }
   ```

2. **Track usage** (`app.js`)
   ```javascript
   async copyToClipboard(index) {
       const prompt = this.filteredPrompts[index];
       const compiledPrompt = this.compilePrompt(prompt);

       try {
           await navigator.clipboard.writeText(compiledPrompt);

           // Track usage
           prompt.lastUsed = Date.now();
           prompt.useCount = (prompt.useCount || 0) + 1;
           this.savePromptMetadata(prompt.id, {
               lastUsed: prompt.lastUsed,
               useCount: prompt.useCount
           });

           this.showToast('Copied!');
       } catch (error) {
           // ... error handling
       }
   }

   savePromptMetadata(promptId, metadata) {
       const key = `prompt_meta_${promptId}`;
       localStorage.setItem(key, JSON.stringify(metadata));
   }

   loadPromptMetadata(promptId) {
       const key = `prompt_meta_${promptId}`;
       const saved = localStorage.getItem(key);
       return saved ? JSON.parse(saved) : null;
   }
   ```

3. **Load metadata on init** (`app.js`)
   ```javascript
   async loadPrompts() {
       // ... existing fetch logic
       this.prompts.forEach(prompt => {
           const metadata = this.loadPromptMetadata(prompt.id);
           if (metadata) {
               Object.assign(prompt, metadata);
           }
       });
       this.filteredPrompts = [...this.prompts];
   }
   ```

4. **Display metadata** (`app.js`, `styles.css`)
   - Show use count as subtle badge
   - Add favorite star icon (clickable toggle)
   - Show "Recently used" indicator

   ```javascript
   // In getCardHTML:
   <div class="card-metadata">
       ${prompt.isFavorite ? '<span class="favorite-star">⭐</span>' : ''}
       ${prompt.useCount > 0 ? `<span class="use-count">Used ${prompt.useCount}x</span>` : ''}
   </div>
   ```

5. **Add tags support** (`app.js`)
   - Display tags as small chips on expanded cards
   - Optional: Filter by tags (similar to category chips)

6. **Add "Recently used" filter** (`index.html`, `app.js`)
   - Add chip to show recently used prompts
   - Sort by lastUsed timestamp

**Files to modify**:
- `prompts.json` - Add tags to existing prompts
- `app.js` - Add metadata tracking and display logic
- `styles.css` - Style metadata elements

**Complexity**: Medium (3-4 hours)

---

## #7: Better Search Functionality

**Goal**: Enhanced search with more features

### 7a. Search within template content

**Implementation**:

1. **Update filter logic** (`app.js`)
   ```javascript
   filterPrompts() {
       this.filteredPrompts = this.prompts.filter(prompt => {
           const searchLower = this.searchTerm;

           const matchesSearch = !searchLower ||
               prompt.title.toLowerCase().includes(searchLower) ||
               prompt.description.toLowerCase().includes(searchLower) ||
               prompt.category.toLowerCase().includes(searchLower) ||
               prompt.template.toLowerCase().includes(searchLower) ||
               (prompt.tags && prompt.tags.some(tag =>
                   tag.toLowerCase().includes(searchLower)
               ));

           const matchesCategory = !this.selectedCategory ||
               prompt.category === this.selectedCategory;

           return matchesSearch && matchesCategory;
       });

       this.renderPrompts();
   }
   ```

### 7b. Highlight search matches

**Implementation**:

1. **Add highlight function** (`app.js`)
   ```javascript
   highlightText(text, searchTerm) {
       if (!searchTerm) return this.escapeHTML(text);

       const escapedText = this.escapeHTML(text);
       const regex = new RegExp(`(${searchTerm})`, 'gi');
       return escapedText.replace(regex, '<mark>$1</mark>');
   }
   ```

2. **Use in card rendering** (`app.js`)
   ```javascript
   getCardHTML(prompt, index) {
       return `
           <div class="card-header" data-action="toggle-expand">
               <div class="card-title-wrapper" data-action="toggle-expand">
                   <h3 class="card-title">${this.highlightText(prompt.title, this.searchTerm)}</h3>
                   ...
   ```

3. **Style highlights** (`styles.css`)
   ```css
   mark {
       background-color: #fef3c7;
       color: #92400e;
       padding: 0.1rem 0.2rem;
       border-radius: 2px;
   }
   ```

### 7c. Search suggestions/history

**Implementation**:

1. **Track search history** (`app.js`)
   ```javascript
   saveSearchHistory(term) {
       if (!term || term.length < 2) return;

       const history = this.getSearchHistory();
       const updated = [term, ...history.filter(t => t !== term)].slice(0, 10);
       localStorage.setItem('search_history', JSON.stringify(updated));
   }

   getSearchHistory() {
       const saved = localStorage.getItem('search_history');
       return saved ? JSON.parse(saved) : [];
   }
   ```

2. **Show suggestions dropdown** (`app.js`, `index.html`, `styles.css`)
   - Create dropdown below search input
   - Show on focus
   - Populate with history + matching prompts
   - Click to fill search

**Files to modify**:
- `app.js` - Enhanced search logic, highlighting, suggestions
- `styles.css` - Style highlights and suggestions dropdown
- `index.html` - Add suggestions dropdown container

**Complexity**: Medium (4-5 hours)

---

## #16: Animation Polish

**Goal**: Smoother, more polished UI transitions and micro-interactions

**Implementation**:

1. **Improve card expand/collapse** (`styles.css`)
   ```css
   .card-content {
       overflow: hidden;
       transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                   opacity 0.3s ease-out,
                   margin 0.3s ease-out;
   }

   .card-content.collapsed {
       max-height: 0;
       opacity: 0;
       margin: 0;
   }

   .card-content.expanded {
       max-height: 2000px;
       opacity: 1;
       animation: slideIn 0.3s ease-out;
   }

   @keyframes slideIn {
       from {
           transform: translateY(-10px);
           opacity: 0;
       }
       to {
           transform: translateY(0);
           opacity: 1;
       }
   }
   ```

2. **Add hover effects** (`styles.css`)
   ```css
   .prompt-card {
       transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
                   box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
   }

   .prompt-card:hover {
       transform: translateY(-4px);
       box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
   }

   .category-chip {
       transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
   }

   .category-chip:hover {
       transform: translateY(-2px);
       box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
   }
   ```

3. **Button ripple effect** (`app.js`, `styles.css`)
   ```javascript
   addRippleEffect(button) {
       button.addEventListener('click', function(e) {
           const ripple = document.createElement('span');
           ripple.classList.add('ripple');

           const rect = this.getBoundingClientRect();
           const size = Math.max(rect.width, rect.height);
           const x = e.clientX - rect.left - size / 2;
           const y = e.clientY - rect.top - size / 2;

           ripple.style.width = ripple.style.height = size + 'px';
           ripple.style.left = x + 'px';
           ripple.style.top = y + 'px';

           this.appendChild(ripple);

           setTimeout(() => ripple.remove(), 600);
       });
   }
   ```

   ```css
   .btn {
       position: relative;
       overflow: hidden;
   }

   .ripple {
       position: absolute;
       border-radius: 50%;
       background: rgba(255, 255, 255, 0.5);
       transform: scale(0);
       animation: ripple-animation 0.6s ease-out;
       pointer-events: none;
   }

   @keyframes ripple-animation {
       to {
           transform: scale(4);
           opacity: 0;
       }
   }
   ```

4. **Loading skeleton** (`index.html`, `styles.css`, `app.js`)
   - Show skeleton cards while fetching prompts
   - Smooth fade-in when real content loads

   ```css
   .skeleton-card {
       background: white;
       border-radius: 12px;
       padding: 1.5rem;
       margin-bottom: 1.5rem;
   }

   .skeleton-line {
       height: 1rem;
       background: linear-gradient(
           90deg,
           #f0f0f0 25%,
           #e0e0e0 50%,
           #f0f0f0 75%
       );
       background-size: 200% 100%;
       animation: loading 1.5s infinite;
       border-radius: 4px;
       margin-bottom: 0.75rem;
   }

   @keyframes loading {
       0% { background-position: 200% 0; }
       100% { background-position: -200% 0; }
   }
   ```

5. **Toast animation improvements** (`styles.css`)
   ```css
   .toast {
       animation: toast-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
   }

   @keyframes toast-in {
       from {
           transform: translateY(-100%);
           opacity: 0;
       }
       to {
           transform: translateY(0);
           opacity: 1;
       }
   }
   ```

6. **Stagger animation for cards** (`app.js`)
   ```javascript
   renderPrompts() {
       this.promptGrid.innerHTML = '';

       if (this.filteredPrompts.length === 0) {
           this.emptyState.style.display = 'block';
           return;
       } else {
           this.emptyState.style.display = 'none';
       }

       // Render with stagger
       this.filteredPrompts.forEach((prompt, index) => {
           const card = this.createPromptCard(prompt, index);
           card.style.opacity = '0';
           card.style.transform = 'translateY(20px)';
           this.promptGrid.appendChild(card);

           // Stagger animation
           setTimeout(() => {
               card.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
               card.style.opacity = '1';
               card.style.transform = 'translateY(0)';
           }, index * 50); // 50ms stagger
       });
   }
   ```

**Files to modify**:
- `styles.css` - All animation improvements
- `app.js` - Ripple effect, stagger animation, skeleton logic
- `index.html` - Skeleton HTML (optional)

**Complexity**: Medium (3-4 hours)

---

## Download Filled Prompts as Text Files

**Goal**: Allow users to download compiled prompts as .txt files

**Implementation**:

1. **Add download button** (`app.js`)
   ```javascript
   getLockedViewHTML(prompt, index) {
       // ... existing code
       return `
           <div class="tabs-container">
               ...
           </div>
       `;
   }

   // Modify card actions to include download:
   <div class="card-actions">
       ${isLocked ?
           `<button class="btn btn-primary" data-action="copy">Copy to Clipboard</button>
            <button class="btn btn-secondary" data-action="download">Download</button>` :
           `<button class="btn btn-secondary" data-action="save">Save Changes</button>`
       }
   </div>
   ```

2. **Add download handler** (`app.js`)
   ```javascript
   // In attachCardEventListeners:
   const downloadButton = card.querySelector('[data-action="download"]');
   if (downloadButton) {
       downloadButton.addEventListener('click', () => this.downloadPrompt(index));
   }

   downloadPrompt(index) {
       const prompt = this.filteredPrompts[index];
       const compiledPrompt = this.compilePrompt(prompt);

       // Create filename from prompt title
       const filename = `${prompt.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.txt`;

       // Create blob and download
       const blob = new Blob([compiledPrompt], { type: 'text/plain' });
       const url = URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = filename;
       document.body.appendChild(a);
       a.click();
       document.body.removeChild(a);
       URL.revokeObjectURL(url);

       this.showToast('Downloaded!');
   }
   ```

3. **Style download button** (`styles.css`)
   ```css
   .card-actions {
       display: grid;
       grid-template-columns: 1fr auto;
       gap: 0.75rem;
   }

   .btn-secondary {
       background-color: #e2e8f0;
       color: #2d3748;
   }

   .btn-secondary:hover {
       background-color: #cbd5e0;
   }
   ```

4. **Optional: Add download options** (More complex)
   - Dropdown to choose format (TXT, Markdown, JSON)
   - Include metadata in download (timestamp, variable values)
   - Batch download multiple prompts

**Files to modify**:
- `app.js` - Add download handler
- `styles.css` - Style download button

**Complexity**: Low (1-2 hours)

---

## Implementation Order Recommendation

Based on dependencies and value:

1. **#3: Local Storage** (Foundation for other features)
2. **#4: Visual Feedback** (Quick wins, improves UX immediately)
3. **Download Feature** (Simple, high user value)
4. **#2: Keyboard Shortcuts** (Low effort, nice polish)
5. **#5: Mobile Experience** (Important if mobile traffic is significant)
6. **#6: Metadata** (Builds on localStorage from #3)
7. **#7: Better Search** (More complex, can be done in phases)
8. **#16: Animation Polish** (Last, purely cosmetic)

---

## Testing Checklist

For each feature, test:

- [ ] Works on desktop (Chrome, Firefox, Safari)
- [ ] Works on mobile (iOS Safari, Chrome Android)
- [ ] Keyboard navigation works
- [ ] localStorage persists correctly
- [ ] Search/filter doesn't break
- [ ] Existing features still work
- [ ] No console errors
- [ ] Responsive design maintained
- [ ] Accessibility (screen reader, keyboard-only)

---

## Version Control Strategy

Create feature branches for each implementation:

```bash
git checkout -b feature/local-storage
git checkout -b feature/keyboard-shortcuts
git checkout -b feature/visual-feedback
# etc.
```

Merge to main when complete and tested.

Update `CLAUDE.md` with any architectural changes.

---

**Document Version**: 1.0
**Last Updated**: October 19, 2025
**Status**: Ready for implementation
