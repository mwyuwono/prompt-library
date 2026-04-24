import { LitElement, html, css } from 'lit';

export class WyTabs extends LitElement {
  static properties = {
    activeTab: { type: String, attribute: 'active-tab' }
  };

  static styles = css`
    :host {
      display: block;
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
    }

    .tabs-list {
      display: flex;
      gap: 32px; /* Wider gap for cleaner look */
      padding: 0 32px; /* Align with modal content padding */
    }

    .tab-item {
      padding: 12px 0 16px 0; /* More bottom padding for visual balance */
      font-family: var(--font-body);
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--md-sys-color-on-surface-variant);
      cursor: pointer;
      position: relative;
      transition: color 0.2s;
      background: none;
      border: none;
      margin: 0;
    }

    .tab-item:hover {
      color: var(--md-sys-color-text-heading);
    }

    .tab-item.active {
      color: var(--md-sys-color-text-heading);
      font-weight: 700;
    }

    .tab-item.active::after {
      content: '';
      position: absolute;
      bottom: -1px; /* Overlap the border-bottom */
      left: 0;
      right: 0;
      height: 2px;
      background-color: var(--md-sys-color-primary);
    }

    /* Responsive padding to match page/modal gutters */
    @media (max-width: 600px) {
      .tabs-list {
        padding: 0 16px;
        gap: 24px;
      }
    }
  `;

  render() {
    return html`
      <div class="tabs-list" role="tablist">
        <slot></slot>
      </div>
    `;
  }

  constructor() {
    super();
    this.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('[role="tab"]');
      if (tabBtn) {
        const tabValue = tabBtn.getAttribute('data-tab');
        this.activeTab = tabValue;
        this._updateTabs();
        this.dispatchEvent(new CustomEvent('tab-change', {
          detail: { tab: tabValue },
          bubbles: true,
          composed: true
        }));
      }
    });
  }

  updated(changedProperties) {
    if (changedProperties.has('activeTab')) {
      this._updateTabs();
    }
  }

  _updateTabs() {
    const tabs = this.querySelectorAll('[role="tab"]');
    tabs.forEach(tab => {
      if (tab.getAttribute('data-tab') === this.activeTab) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  }
}

customElements.define('wy-tabs', WyTabs);
