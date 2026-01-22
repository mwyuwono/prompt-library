---
name: vanilla-js-development
description: Expert guidance for building modern web applications using vanilla JavaScript without frameworks or build tools. Use this skill when working on projects that prioritize simplicity, zero dependencies, and direct DOM manipulation.
---

# Vanilla JavaScript Development Skill

## Core Principles

### Zero Dependencies Philosophy
- **No frameworks**: Build with native browser APIs only (no React, Vue, Angular)
- **No build tools**: Code runs directly in browsers without transpilation or bundling
- **No package managers**: Avoid npm/yarn dependencies entirely
- **Static deployment**: All files can be served from any static host

### Modern JavaScript Practices
- Use ES6+ features (classes, arrow functions, template literals, destructuring)
- Leverage modern DOM APIs (querySelector, classList, dataset)
- Implement event delegation for dynamic content
- Use async/await for asynchronous operations

## Architecture Patterns

### Single Class Organization
For small to medium applications, consolidate logic into a single class:

```javascript
class AppName {
  constructor() {
    this.state = {};
    this.init();
  }

  async init() {
    await this.loadData();
    this.setupEventListeners();
    this.render();
  }

  setupEventListeners() {
    // Event delegation pattern
    document.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      if (action && this[action]) {
        this[action](e);
      }
    });
  }

  render() {
    // Update DOM
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new AppName();
});
```

### State Management
- Store state as class properties
- Update state and DOM in a single pass
- Use method calls to trigger updates, not direct property mutation

### Event Handling
**Use data attributes for actions:**
```html
<button data-action="handleClick" data-id="123">Click me</button>
```

```javascript
setupEventListeners() {
  document.addEventListener('click', (e) => {
    const action = e.target.dataset.action;
    if (action && typeof this[action] === 'function') {
      this[action](e);
    }
  });
}
```

## DOM Manipulation Best Practices

### Template Literals for HTML
```javascript
renderCard(item) {
  return `
    <div class="card" data-id="${item.id}">
      <h3>${this.escapeHTML(item.title)}</h3>
      <p>${this.escapeHTML(item.description)}</p>
    </div>
  `;
}

// Always escape user input
escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
```

### Efficient Updates
- Use `innerHTML` for bulk updates
- Use `textContent` for text-only updates
- Minimize reflows by batching DOM changes
- Cache DOM queries in class properties

### Class and Attribute Manipulation
```javascript
// Modern classList API
element.classList.add('active');
element.classList.remove('hidden');
element.classList.toggle('expanded');
element.classList.contains('selected');

// Data attributes
element.dataset.userId = '123';
const userId = element.dataset.userId;
```

## Data Loading and Storage

### Fetch API
```javascript
async loadData() {
  try {
    const response = await fetch('/data.json');
    if (!response.ok) throw new Error('Network response was not ok');
    this.data = await response.json();
  } catch (error) {
    console.error('Failed to load data:', error);
    this.handleError(error);
  }
}
```

### LocalStorage
```javascript
// Save state
saveState(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

// Load state
loadState(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
}
```

## Common Patterns

### Modal Management
```javascript
openModal(content) {
  this.modal.innerHTML = content;
  this.modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

closeModal() {
  this.modal.classList.remove('show');
  document.body.style.overflow = '';
}

// Close on backdrop click
this.modal.addEventListener('click', (e) => {
  if (e.target === this.modal) {
    this.closeModal();
  }
});
```

### Search and Filter
```javascript
filterItems(query) {
  this.filteredItems = this.items.filter(item => {
    return item.title.toLowerCase().includes(query.toLowerCase()) ||
           item.description.toLowerCase().includes(query.toLowerCase());
  });
  this.render();
}

// Debounced search input
setupSearch() {
  let timeoutId;
  this.searchInput.addEventListener('input', (e) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      this.filterItems(e.target.value);
    }, 300);
  });
}
```

### Copy to Clipboard
```javascript
async copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    this.showToast('Copied to clipboard!');
  } catch (error) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    this.showToast('Copied to clipboard!');
  }
}
```

## Security Considerations

### XSS Prevention
**CRITICAL**: Always escape user input before rendering to DOM

```javascript
escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Use when rendering user content
renderUserContent(content) {
  return `<div>${this.escapeHTML(content)}</div>`;
}
```

### Safe JSON Parsing
```javascript
safeJSONParse(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.error('Invalid JSON:', error);
    return fallback;
  }
}
```

## File Structure

For vanilla JS projects:
```
/
├── index.html          # Main HTML structure
├── app.js             # Application logic (single class)
├── styles.css         # All styling
├── data.json          # Static data (if needed)
└── assets/            # Images, fonts, etc.
```

## Development Workflow

### Local Development
Use Python's built-in server:
```bash
python3 -m http.server 8000
# Open http://localhost:8000
```

### Production Deployment
Deploy directly to static hosts:
- GitHub Pages
- Netlify
- Vercel
- Any CDN or static file server

## Common Pitfalls to Avoid

1. **Don't use jQuery**: Modern DOM APIs are sufficient
2. **Don't overcomplicate**: If vanilla JS feels hard, simplify the requirements
3. **Don't ignore browser APIs**: Modern browsers have built-in solutions for most needs
4. **Don't skip error handling**: Always handle fetch failures and edge cases
5. **Don't forget accessibility**: Use semantic HTML and ARIA attributes

## When to Use This Skill

✅ **Use vanilla JavaScript when:**
- Building small to medium web applications
- Prototyping quickly without setup overhead
- Creating tools that need to run anywhere
- Performance and bundle size are critical
- You want maximum compatibility and longevity

❌ **Consider frameworks when:**
- Building large-scale applications with complex state
- Team already has framework expertise
- Need server-side rendering or routing
- Component reusability is paramount

## Additional Resources

- MDN Web Docs for browser API reference
- Chrome DevTools for debugging
- Lighthouse for performance auditing
- Can I Use for browser compatibility checks
