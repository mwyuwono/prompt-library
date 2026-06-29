import { LitElement, html } from 'lit';

export class WyTabs extends LitElement {
  createRenderRoot() {
    return this;
  }

  static properties = {
    activeTab: { type: String, attribute: 'active-tab' }
  };

  connectedCallback() {
    // Preserve existing tab button children after Lit renders into light DOM.
    if (!this._capturedTabNodes) {
      this._tabNodes = Array.from(this.childNodes);
      this._tabNodes.forEach(node => node.remove());
      this._capturedTabNodes = true;
    }
    super.connectedCallback();
  }

  render() {
    return html`
      <div class="tabs-list" role="tablist"></div>
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
    this._projectTabs();
    if (changedProperties.has('activeTab')) {
      this._updateTabs();
    }
  }

  firstUpdated() {
    this._projectTabs();
    this._updateTabs();
  }

  _projectTabs() {
    const target = this.querySelector('.tabs-list');
    if (!target || target.childNodes.length || !this._tabNodes?.length) return;
    target.append(...this._tabNodes);
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
