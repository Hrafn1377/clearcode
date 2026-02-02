class SettingsPanel extends HTMLElement {
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
      <div class="settings-overlay ${this.isOpen ? 'open' : ''}" id="settings-overlay"></div>
      <div class="settings-panel ${this.isOpen ? 'open' : ''}">
        <div class="settings-header">
          <h2>Settings</h2>
          <button class="settings-close" id="settings-close">×</button>
        </div>
        
        <div class="settings-content">
          <section class="settings-section">
            <h3>Vision</h3>
            <label>Theme</label>
          <select id="theme-select">
  <optgroup label="Dark">
    <option value="one-dark">One Dark</option>
    <option value="dracula">Dracula</option>
    <option value="monokai">Monokai</option>
    <option value="nord">Nord</option>
    <option value="tokyo-night">Tokyo Night</option>
    <option value="gruvbox-dark">Gruvbox Dark</option>
    <option value="synthwave">SynthWave '84</option>
  </optgroup>
  <optgroup label="Light">
    <option value="one-light">One Light</option>
    <option value="solarized-light">Solarized Light</option>
    <option value="github-light">GitHub Light</option>
  </optgroup>
  <optgroup label="High Contrast">
    <option value="high-contrast-dark">High Contrast Dark</option>
    <option value="high-contrast-light">High Contrast Light</option>
  </optgroup>
  <optgroup label="Color Optimized">
    <option value="protanopia-dark">Protanopia Dark</option>
    <option value="deuteranopia-dark">Deuteranopia Dark</option>
    <option value="tritanopia-dark">Tritanopia Dark</option>
  </optgroup>
</select>
          </section>

          <section class="settings-section">
            <h3>Reading</h3>
            <label>Font Family</label>
            <select id="font-select">
              <option value="default">Default (Monospace)</option>
              <option value="fira-code">Fira Code</option>
              <option value="jetbrains-mono">JetBrains Mono</option>
              <option value="source-code-pro">Source Code Pro</option>
              <option value="open-dyslexic">OpenDyslexic Mono</option>
            </select>

            <label>Font Size</label>
            <input type="range" id="font-size" min="12" max="24" value="14">
            <span id="font-size-value">14px</span>

            <label>Line Height</label>
            <input type="range" id="line-height" min="1" max="2" step="0.1" value="1.5">
            <span id="line-height-value">1.5</span>

            <label>Letter Spacing</label>
            <input type="range" id="letter-spacing" min="0" max="5" step="0.5" value="0">
            <span id="letter-spacing-value">0px</span>
          </section>

          <section class="settings-section">
            <h3>Numbers</h3>
            <label>Line Number Style</label>
            <select id="line-number-style">
              <option value="arabic">Arabic (1, 2, 3)</option>
              <option value="roman">Roman (i, ii, iii)</option>
              <option value="letters">Letters (a, b, c)</option>
              <option value="none">Hidden</option>
            </select>

            <label>Number Spacing in Code</label>
            <input type="checkbox" id="number-spacing"> 
            <span>Add spacing to numbers (1000 → 1 000)</span>
          </section>
          <section class="settings-section">
            <h3>SPEECH</h3>
            <label>Voice</label>
            <select id="voice-select">
              <option value="">System Default</option>
            </select>
            <label>Speed</label>
            <input type="range" id="speech-rate" min="0.5" max="2" step="0.1" value="0.9">
            <span id="speech-rate-value">0.9x</span>
          </section>
        </div>
      </div>
    `;
  }
       

  setupListeners() {
  const close = this.querySelector('#settings-close');
  const overlay = this.querySelector('#settings-overlay');
  const numberSpacing = this.querySelector('#number-spacing');
  if (numberSpacing) {
    numberSpacing.checked = window.numberspacingEnabled || false;
    numberSpacing.addEventListener('change', (e) => {
        window.setNumberSpacing(e.target.checked);
    });
  }

  // Voice selection
const voiceSelect = this.querySelector('#voice-select');
if (voiceSelect) {
  const voices = window.getVoices();
  voices.forEach(voice => {
    const option = document.createElement('option');
    option.value = voice.name;
    option.textContent = `${voice.name} (${voice.lang})`;
    if (voice.name === window.currentVoice) {
      option.selected = true;
    }
    voiceSelect.appendChild(option);
  });
  
  voiceSelect.addEventListener('change', (e) => {
    window.setVoiceByName(e.target.value);
  });
}

// Speech rate
const speechRateInput = this.querySelector('#speech-rate');
const speechRateValue = this.querySelector('#speech-rate-value');
if (speechRateInput) {
  speechRateInput.value = window.speechRate || 0.9;
  speechRateValue.textContent = speechRateInput.value + 'x';
  speechRateInput.addEventListener('input', (e) => {
    speechRateValue.textContent = e.target.value + 'x';
    window.setSpeechRate(e.target.value);
  });
}
  
  // Theme
  const themeSelect = this.querySelector('#theme-select');
  if (themeSelect) {
    themeSelect.value = window.currentTheme || 'one-dark';
    themeSelect.addEventListener('change', (e) => {
      window.setTheme(e.target.value);
    });
  }

  // Font Family
  const fontSelect = this.querySelector('#font-select');
  if (fontSelect) {
    fontSelect.value = window.currentFontFamily || 'default';
    fontSelect.addEventListener('change', (e) => {
      window.setFontFamily(e.target.value);
    });
  }

  // Font Size
  const fontSize = this.querySelector('#font-size');
  const fontSizeValue = this.querySelector('#font-size-value');
  if (fontSize) {
    fontSize.value = window.currentFontSize || 14;
    fontSizeValue.textContent = fontSize.value + 'px';
    fontSize.addEventListener('input', (e) => {
      fontSizeValue.textContent = e.target.value + 'px';
      window.setFontSize(e.target.value);
    });
  }

  // Line Height
  const lineHeight = this.querySelector('#line-height');
  const lineHeightValue = this.querySelector('#line-height-value');
  if (lineHeight) {
    lineHeight.value = window.currentLineHeight || 1.5;
    lineHeightValue.textContent = lineHeight.value;
    lineHeight.addEventListener('input', (e) => {
      lineHeightValue.textContent = e.target.value;
      window.setLineHeight(e.target.value);
    });
  }

  // Letter Spacing
  const letterSpacing = this.querySelector('#letter-spacing');
  const letterSpacingValue = this.querySelector('#letter-spacing-value');
  if (letterSpacing) {
    letterSpacing.value = window.currentLetterSpacing || 0;
    letterSpacingValue.textContent = letterSpacing.value + 'px';
    letterSpacing.addEventListener('input', (e) => {
      letterSpacingValue.textContent = e.target.value + 'px';
      window.setLetterSpacing(e.target.value);
    });
  }

  // Line Number Style
  const lineNumberStyle = this.querySelector('#line-number-style');
  if (lineNumberStyle) {
    lineNumberStyle.value = window.currentLineNumberStyle || 'arabic';
    lineNumberStyle.addEventListener('change', (e) => {
        window.setLineNumberStyle(e.target.value);
    });
  }

  // Close handlers
  if (close) close.addEventListener('click', () => this.toggle());
  if (overlay) overlay.addEventListener('click', () => this.toggle());
}
}

customElements.define('settings-panel', SettingsPanel);