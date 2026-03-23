const COLORBLIND_THEMES = [
  'protanopia-dark', 'protanopia-light',
  'deuteranopia-dark', 'deuteranopia-light',
  'tritanopia-dark', 'tritanopia-light',
  'achromatopsia-dark', 'achromatopsia-light',
];

const PALETTE_KEYS = [
  { key: '--bg',           label: 'Background' },
  { key: '--bg-panel',     label: 'Panel Background' },
  { key: '--bg-surface',   label: 'Surface Background' },
  { key: '--fg',           label: 'Text' },
  { key: '--fg-muted',     label: 'Muted Text' },
  { key: '--accent-cyan',  label: 'Primary Accent' },
  { key: '--accent-yellow',label: 'Secondary Accent' },
  { key: '--border',       label: 'Border' },
];

export class PaletteEditor {
  private panel: HTMLElement;
  private overlay: HTMLElement;
  private csrfToken: string;
  private currentPalette: Record<string, string> = {};

  constructor() {
    this.csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
    this.panel = this.buildPanel();
    this.overlay = this.buildOverlay();
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.panel);
    this.addStyles();
  }

  private buildOverlay(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.id = 'palette-overlay';
    overlay.style.cssText = `
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 199;
    `;
    overlay.addEventListener('click', () => this.close());
    return overlay;
  }

  private buildPanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.id = 'palette-panel';
    panel.style.cssText = `
      display: none;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 480px;
      max-width: 90vw;
      max-height: 80vh;
      overflow-y: auto;
      background: var(--bg-panel);
      border: 1px solid var(--accent-purple);
      border-radius: 8px;
      z-index: 200;
      padding: 1.5rem;
      box-shadow: 0 0 40px #b45fcb33;
      font-family: var(--font-ui);
      color: var(--fg);
    `;
    return panel;
  }

  private addStyles() {
    if (document.getElementById('palette-editor-styles')) return;
    const style = document.createElement('style');
    style.id = 'palette-editor-styles';
    style.textContent = `
      .palette-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid var(--border);
      }
      .palette-label {
        font-size: 0.85rem;
        color: var(--fg);
      }
      .palette-key {
        font-size: 0.7rem;
        color: var(--fg-muted);
        font-family: var(--font-mono);
      }
      .palette-color-input {
        width: 40px;
        height: 32px;
        border: 1px solid var(--border);
        border-radius: 4px;
        cursor: pointer;
        padding: 2px;
        background: var(--bg-surface);
      }
      .palette-hex {
        width: 80px;
        background: var(--bg-surface);
        border: 1px solid var(--border);
        border-radius: 4px;
        padding: 0.3rem 0.5rem;
        color: var(--fg);
        font-family: var(--font-mono);
        font-size: 0.8rem;
        outline: none;
      }
      .palette-reset-btn {
        background: none;
        border: 1px solid var(--border);
        border-radius: 4px;
        color: var(--fg-muted);
        cursor: pointer;
        font-size: 0.7rem;
        padding: 0.2rem 0.4rem;
      }
      .palette-reset-btn:hover { color: var(--accent-pink); border-color: var(--accent-pink); }
    `;
    document.head.appendChild(style);
  }

  async open(currentTheme: string) {
    if (!COLORBLIND_THEMES.includes(currentTheme)) {
      alert('Custom palettes are only available for colorblind themes.');
      return;
    }

    const res = await fetch('/settings', { headers: { 'Accept': 'application/json' } });
    const data = await res.json();
    this.currentPalette = data.custom_palette ?? {};

    this.render(currentTheme);
    this.panel.style.display = 'block';
    this.overlay.style.display = 'block';
  }

  close() {
    this.panel.style.display = 'none';
    this.overlay.style.display = 'none';
  }

  private render(theme: string) {
    const root = document.documentElement;

    this.panel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
        <span style="color:var(--accent-purple); font-size:0.85rem; letter-spacing:0.1em; text-transform:uppercase;">Customize Palette</span>
        <button id="palette-close" style="background:none; border:none; color:var(--fg-muted); cursor:pointer; font-size:1.2rem;">×</button>
      </div>
      <p style="font-size:0.75rem; color:var(--fg-muted); margin-bottom:1rem;">
        Adjusting: <strong style="color:var(--fg)">${theme}</strong> — changes apply live.
      </p>
      <div id="palette-rows"></div>
      <div style="display:flex; gap:0.75rem; margin-top:1.25rem; padding-top:1rem; border-top:1px solid var(--border);">
        <button id="palette-save" style="flex:1; background:var(--accent-purple); border:none; border-radius:4px; padding:0.5rem; color:white; font-family:var(--font-mono); font-size:0.85rem; cursor:pointer;">Save Palette</button>
        <button id="palette-reset-all" style="background:transparent; border:1px solid var(--border); border-radius:4px; padding:0.5rem 1rem; color:var(--fg-muted); font-family:var(--font-mono); font-size:0.85rem; cursor:pointer;">Reset All</button>
      </div>
    `;

    const rowsEl = this.panel.querySelector('#palette-rows')!;

    PALETTE_KEYS.forEach(({ key, label }) => {
      const currentValue = this.currentPalette[key] ||
        getComputedStyle(root).getPropertyValue(key).trim();

      const row = document.createElement('div');
      row.className = 'palette-row';
      row.innerHTML = `
        <div>
          <div class="palette-label">${label}</div>
          <div class="palette-key">${key}</div>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <input type="color" class="palette-color-input" data-key="${key}" value="${currentValue}" />
          <input type="text" class="palette-hex" data-key="${key}" value="${currentValue}" />
          <button class="palette-reset-btn" data-key="${key}">↺</button>
        </div>
      `;
      rowsEl.appendChild(row);
    });

    this.panel.querySelector('#palette-close')!.addEventListener('click', () => this.close());

    this.panel.querySelectorAll('.palette-color-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const el = e.target as HTMLInputElement;
        const key = el.dataset.key!;
        const val = el.value;
        const hex = this.panel.querySelector(`.palette-hex[data-key="${key}"]`) as HTMLInputElement;
        if (hex) hex.value = val;
        this.applyColor(key, val);
      });
    });

    this.panel.querySelectorAll('.palette-hex').forEach(input => {
      input.addEventListener('change', (e) => {
        const el = e.target as HTMLInputElement;
        const key = el.dataset.key!;
        const val = el.value;
        const color = this.panel.querySelector(`.palette-color-input[data-key="${key}"]`) as HTMLInputElement;
        if (color) color.value = val;
        this.applyColor(key, val);
      });
    });

    this.panel.querySelectorAll('.palette-reset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        console.log("[ClearCode] reset btn clicked");
        const key = (btn as HTMLElement).dataset.key!;
        delete this.currentPalette[key];
        document.documentElement.style.removeProperty(key);
        this.save();
        this.render(theme);
        this.applyAllColors();
      });
    });

    this.panel.querySelector('#palette-save')!.addEventListener('click', () => this.save());
    this.panel.querySelector('#palette-reset-all')!.addEventListener('click', () => {
      this.currentPalette = {};
      // Remove all custom CSS properties we set
      PALETTE_KEYS.forEach(({ key }) => {
        document.documentElement.style.removeProperty(key);
      });
      this.applyAllColors();
      this.save();
      this.render(theme);
    });
  }

  private applyColor(key: string, value: string) {
    document.documentElement.style.setProperty(key, value);
    this.currentPalette[key] = value;
  }

  private applyAllColors() {
    Object.entries(this.currentPalette).forEach(([key, val]) => {
      document.documentElement.style.setProperty(key, val);
    });
  }

  private async save() {
    await fetch('/settings', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': this.csrfToken,
      },
      body: JSON.stringify({ custom_palette: JSON.stringify(this.currentPalette) }),
    });
  }
}