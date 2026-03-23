const THEMES = [
  // Aesthetic
  { id: 'synthwave-2077', label: 'Synthwave 2077' },
  { id: 'nordic-frost', label: 'Nordic Frost' },
  { id: 'obsidian', label: 'Obsidian' },
  { id: 'solarized-dark', label: 'Solarized Dark' },
  { id: 'solarized-light', label: 'Solarized Light' },
  { id: 'dracula', label: 'Dracula' },
  { id: 'one-dark', label: 'One Dark' },
  // Colorblind
  { id: 'protanopia-dark', label: 'Protanopia Dark' },
  { id: 'protanopia-light', label: 'Protanopia Light' },
  { id: 'deuteranopia-dark', label: 'Deuteranopia Dark' },
  { id: 'deuteranopia-light', label: 'Deuteranopia Light' },
  { id: 'tritanopia-dark', label: 'Tritanopia Dark' },
  { id: 'tritanopia-light', label: 'Tritanopia Light' },
  { id: 'achromatopsia-dark', label: 'Achromatopsia Dark' },
  { id: 'achromatopsia-light', label: 'Achromatopsia Light' },
];

export class SettingsPanel {
  private panel: HTMLElement;
  private overlay: HTMLElement;
  private csrfToken: string;
  private themeManager: any;
  private tts: any;

  constructor(themeManager: any, tts: any) {
    this.themeManager = themeManager;
    this.tts = tts;
    this.csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
    this.panel = this.buildPanel();
    this.overlay = this.buildOverlay();
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.panel);
  }

  private buildOverlay(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.id = 'settings-overlay';
    overlay.style.cssText = `
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 99;
    `;
    overlay.addEventListener('click', () => this.close());
    return overlay;
  }

  private buildPanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.id = 'settings-panel';
    panel.style.cssText = `
      display: none;
      position: fixed;
      top: 0;
      right: 0;
      width: 320px;
      height: 100dvh;
      background: var(--bg-panel);
      border-left: 1px solid var(--accent-purple);
      z-index: 100;
      overflow-y: auto;
      padding: 1.5rem;
      box-shadow: -4px 0 30px #b45fcb33;
      font-family: var(--font-ui);
      color: var(--fg);
    `;

    panel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
        <span style="color:var(--accent-cyan); font-size:0.85rem; letter-spacing:0.1em; text-transform:uppercase;">Settings</span>
        <button id="settings-close" style="background:none; border:none; color:var(--fg-muted); cursor:pointer; font-size:1.2rem;">×</button>
      </div>

      <div class="settings-section">
        <label class="settings-label">Theme</label>
        <select id="settings-theme" class="settings-select">
          ${THEMES.map(t => `<option value="${t.id}">${t.label}</option>`).join('')}
        </select>
        <button id="settings-customize-palette" style="margin-top:0.5rem; width:100%; background:transparent; border:1px solid var(--accent-purple); border-radius:4px; padding:0.4rem; color:var(--accent-purple); font-family:var(--font-mono); font-size:0.8rem; cursor:pointer; display:none;">
  Customize Palette →
</button>
      </div>

      <div class="settings-section">
        <label class="settings-label">Font Size</label>
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <input type="range" id="settings-fontsize" min="10" max="24" step="1" class="settings-range" />
          <span id="settings-fontsize-value" style="color:var(--accent-cyan); min-width:2rem;">14</span>
        </div>
      </div>

      <div class="settings-section">
        <label class="settings-label">Dyslexia Mode</label>
        <label class="settings-toggle">
          <input type="checkbox" id="settings-dyslexia" />
          <span class="settings-toggle-track"></span>
          <span class="settings-toggle-label">Use OpenDyslexic font</span>
        </label>
      </div>

      <div class="settings-section">
        <label class="settings-label">Text to Speech</label>
        <div style="margin-bottom:0.75rem;">
          <label class="settings-label" style="text-transform:none; font-size:0.75rem;">Voice</label>
          <select id="settings-voice" class="settings-select">
            <option value="">Loading voices...</option>
          </select>
        </div>
        <div>
          <label class="settings-label" style="text-transform:none; font-size:0.75rem;">Speed</label>
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <input type="range" id="settings-tts-rate" min="0.5" max="2" step="0.05" class="settings-range" />
            <span id="settings-tts-rate-value" style="color:var(--accent-cyan); min-width:2.5rem;">0.95</span>
          </div>
        </div>
        <div style="display:flex; gap:0.5rem; margin-top:0.75rem;">
          <button id="settings-tts-test" style="background:var(--accent-cyan); border:none; border-radius:4px; padding:0.4rem 0.75rem; color:var(--bg); font-family:var(--font-mono); font-size:0.8rem; cursor:pointer;">▶ Test</button>
          <button id="settings-tts-stop" style="background:transparent; border:1px solid var(--fg-muted); border-radius:4px; padding:0.4rem 0.75rem; color:var(--fg-muted); font-family:var(--font-mono); font-size:0.8rem; cursor:pointer;">■ Stop</button>
        </div>
      </div>

      <div class="settings-section">
  <label class="settings-label">Anthropic API Key</label>
  <input type="text" id="settings-api-key" class="settings-select"
    placeholder="sk-ant-..." 
    style="font-family:var(--font-mono); font-size:0.8rem;" />
  <div style="font-size:0.7rem; color:var(--fg-muted); margin-top:0.4rem;">
    Your key is stored locally and only sent to Anthropic. 
    <a href="https://console.anthropic.com" target="_blank" rel="noopener" 
      style="color:var(--accent-cyan);">Get a key →</a>
  </div>
</div>

      <div class="settings-section" style="margin-top:2rem; padding-top:1rem; border-top:1px solid var(--border);">
        <a href="https://bsky.app/profile/clearcode.bsky.social" target="_blank" rel="noopener"
          style="color:var(--accent-cyan); font-size:0.8rem; text-decoration:none;">
          🦋 ClearCode on Bluesky — updates &amp; news
        </a>
      </div>
    `;

    return panel;
  }

  private addStyles() {
    if (document.getElementById('settings-panel-styles')) return;
    const style = document.createElement('style');
    style.id = 'settings-panel-styles';
    style.textContent = `
      .settings-section { margin-bottom: 1.5rem; }
      .settings-label {
        display: block;
        font-size: 0.75rem;
        color: var(--fg-muted);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 0.5rem;
      }
      .settings-select {
        width: 100%;
        background: var(--bg-surface);
        border: 1px solid var(--border);
        border-radius: 4px;
        padding: 0.5rem 0.75rem;
        color: var(--fg);
        font-family: var(--font-mono);
        font-size: 0.85rem;
        outline: none;
        cursor: pointer;
      }
      .settings-select:focus { border-color: var(--accent-cyan); }
      .settings-range {
        flex: 1;
        accent-color: var(--accent-cyan);
      }
      .settings-toggle {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        cursor: pointer;
      }
      .settings-toggle input { display: none; }
      .settings-toggle-track {
        width: 36px;
        height: 20px;
        background: var(--border);
        border-radius: 10px;
        position: relative;
        transition: background 0.2s;
        flex-shrink: 0;
      }
      .settings-toggle-track::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 14px;
        height: 14px;
        background: var(--fg-muted);
        border-radius: 50%;
        transition: transform 0.2s, background 0.2s;
      }
      .settings-toggle input:checked + .settings-toggle-track {
        background: var(--accent-cyan);
      }
      .settings-toggle input:checked + .settings-toggle-track::after {
        transform: translateX(16px);
        background: var(--bg);
      }
      .settings-toggle-label { font-size: 0.85rem; color: var(--fg-muted); }
    `;
    document.head.appendChild(style);
  }

  async open() {
    this.addStyles();
    this.panel.style.display = 'block';
    this.overlay.style.display = 'block';

    const res = await fetch('/settings', { headers: { 'Accept': 'application/json' } });
    const data = await res.json();

    const themeSelect = this.panel.querySelector('#settings-theme') as HTMLSelectElement;
    const fontRange = this.panel.querySelector('#settings-fontsize') as HTMLInputElement;
    const fontValue = this.panel.querySelector('#settings-fontsize-value') as HTMLElement;
    const dyslexiaCheck = this.panel.querySelector('#settings-dyslexia') as HTMLInputElement;
    const closeBtn = this.panel.querySelector('#settings-close') as HTMLButtonElement;
    const voiceSelect = this.panel.querySelector('#settings-voice') as HTMLSelectElement;
    const rateRange = this.panel.querySelector('#settings-tts-rate') as HTMLInputElement;
    const rateValue = this.panel.querySelector('#settings-tts-rate-value') as HTMLElement;
    const testBtn = this.panel.querySelector('#settings-tts-test') as HTMLButtonElement;
    const stopBtn = this.panel.querySelector('#settings-tts-stop') as HTMLButtonElement;
    const apiKeyInput = this.panel.querySelector('#settings-api-key') as HTMLInputElement;

    themeSelect.value = data.theme ?? 'synthwave-2077';
    fontRange.value = data.font_size ?? '14';
    fontValue.textContent = fontRange.value;
    dyslexiaCheck.checked = data.dyslexia_mode ?? false;
    document.documentElement.setAttribute('data-dyslexia', String(data.dyslexia_mode ?? false));
    apiKeyInput.value = data.anthropic_api_key ?? '';

    rateRange.value = String(this.tts.getRate());
    rateValue.textContent = String(this.tts.getRate());

    const voices = this.tts.getVoices();
    if (voices.length > 0) {
      voiceSelect.innerHTML = voices.map((v: SpeechSynthesisVoice) =>
        `<option value="${v.voiceURI}">${v.name} (${v.lang})</option>`
      ).join('');
    }

    closeBtn.onclick = () => this.close();

    const customizeBtn = this.panel.querySelector('#settings-customize-palette') as HTMLButtonElement;

    const updateCustomizeBtn = (themeId: string) => {
      const colorBlindThemes = [
        'protanopia-dark', 'protanopia-light',
        'deuteranopia-dark', 'deuteranopia-light',
        'tritanopia-dark', 'tritanopia-light',
        'achromatopsia-dark', 'achromatopsia-light',
      ];
      customizeBtn.style.display = colorBlindThemes.includes(themeId) ? 'block' : 'none';
    };

    updateCustomizeBtn(data.theme ?? 'synthwave-2077');

    themeSelect.onchange = () => {
      this.themeManager.setTheme(themeSelect.value as any);
      this.save({ theme: themeSelect.value });
      updateCustomizeBtn(themeSelect.value);
    };

    customizeBtn.onclick = () => {
      (window as any).__clearcode?.paletteEditor?.open(themeSelect.value);
    };

    fontRange.oninput = () => {
      const size = parseInt(fontRange.value);
      fontValue.textContent = fontRange.value;
      document.documentElement.style.setProperty('--font-size', `${fontRange.value}px`);
      (window as any).__clearcode?.editor?.setFontSize(size);
      this.save({ font_size: size });
    };
    dyslexiaCheck.onchange = () => {
      document.documentElement.setAttribute('data-dyslexia', String(dyslexiaCheck.checked));
      this.save({ dyslexia_mode: dyslexiaCheck.checked });
};
    voiceSelect.onchange = () => this.tts.setVoice(voiceSelect.value);
    rateRange.oninput = () => {
      rateValue.textContent = rateRange.value;
      this.tts.setRate(parseFloat(rateRange.value));
    };
    testBtn.onclick = () => this.tts.speak("ClearCode text to speech is working.");
    stopBtn.onclick = () => this.tts.stop();
    apiKeyInput.onchange = () => this.save({ anthropic_api_key: apiKeyInput.value });
  }

  close() {
    this.panel.style.display = 'none';
    this.overlay.style.display = 'none';
  }

  private async save(changes: Record<string, string | number | boolean>) {
    await fetch('/settings', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': this.csrfToken,
      },
      body: JSON.stringify(changes),
    });
  }
}