class ShortcutsPanel extends HTMLElement {
  constructor() {
    super();
    this.isOpen = false;
  }

  connectedCallback() {
    this.render();
    this.setupListeners();
  }

  toggle() {
    this.isOpen = !this.isOpen;
    this.render();
    this.setupListeners();
  }

  render() {
    this.innerHTML = `
      <div class="shortcuts-overlay ${this.isOpen ? 'open' : ''}" id="shortcuts-overlay"></div>
      <div class="shortcuts-panel ${this.isOpen ? 'open' : ''}">
        <div class="shortcuts-header">
          <h2>Keyboard Shortcuts</h2>
          <button class="shortcuts-close" id="shortcuts-close">×</button>
        </div>
        <div class="shortcuts-content">
          <section class="shortcuts-section">
            <h3>FILE</h3>
            <div class="shortcut-row"><span>New File</span><kbd>⌘ N</kbd></div>
            <div class="shortcut-row"><span>Open File</span><kbd>⌘ O</kbd></div>
            <div class="shortcut-row"><span>Open Folder</span><kbd>⌘ ⇧ O</kbd></div>
            <div class="shortcut-row"><span>Save</span><kbd>⌘ S</kbd></div>
            <div class="shortcut-row"><span>Close Tab</span><kbd>⌘ W</kbd></div>
            <div class="shortcut-row"><span>Previous Tab</span><kbd>⌘ ⇧ [</kbd></div>
            <div class="shortcut-row"><span>Next Tab</span><kbd>⌘ ⇧ ]</kbd></div>
          </section>
          <section class="shortcuts-section">
            <h3>EDIT</h3>
            <div class="shortcut-row"><span>Undo</span><kbd>⌘ Z</kbd></div>
            <div class="shortcut-row"><span>Redo</span><kbd>⌘ ⇧ Z</kbd></div>
            <div class="shortcut-row"><span>Cut</span><kbd>⌘ X</kbd></div>
            <div class="shortcut-row"><span>Copy</span><kbd>⌘ C</kbd></div>
            <div class="shortcut-row"><span>Paste</span><kbd>⌘ V</kbd></div>
            <div class="shortcut-row"><span>Select All</span><kbd>⌘ A</kbd></div>
            <div class="shortcut-row"><span>Find</span><kbd>⌘ F</kbd></div>
            <div class="shortcut-row"><span>Find Next</span><kbd>⌘ G</kbd></div>
            <div class="shortcut-row"><span>Find Previous</span><kbd>⌘ ⇧ G</kbd></div>
          </section>
          <section class="shortcuts-section">
            <h3>VIEW</h3>
            <div class="shortcut-row"><span>Settings</span><kbd>⌘ ⇧ P</kbd></div>
            <div class="shortcut-row"><span>Git Panel</span><kbd>⌘ ⇧ I</kbd></div>
            <div class="shortcut-row"><span>Shortcuts</span><kbd>⌘ /</kbd></div>
          </section>
          <section class="shortcuts-section">
            <h3>ACCESSIBILITY</h3>
            <div class="shortcut-row"><span>Read Selection</span><kbd>⌘ ⇧ R</kbd></div>
            <div class="shortcut-row"><span>Stop Reading</span><kbd>Esc</kbd></div>
          </section>
        </div>
      </div>
    `;
  }

  setupListeners() {
    const close = this.querySelector('#shortcuts-close');
    const overlay = this.querySelector('#shortcuts-overlay');
    
    if (close) close.addEventListener('click', () => this.toggle());
    if (overlay) overlay.addEventListener('click', () => this.toggle());
  }
}

customElements.define('shortcuts-panel', ShortcutsPanel);