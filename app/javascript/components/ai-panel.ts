export class AIPanel {
  private panel: HTMLElement;
  private overlay: HTMLElement;
  private messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  private csrfToken: string;
  private getApiKey: () => string;
  private getEditorContent: () => string;

  constructor(getApiKey: () => string, getEditorContent: () => string) {
    this.csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
    this.getApiKey = getApiKey;
    this.getEditorContent = getEditorContent;
    this.panel = this.buildPanel();
    this.overlay = this.buildOverlay();
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.panel);
    this.addStyles();
  }

  private buildOverlay(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.id = 'ai-overlay';
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
    panel.id = 'ai-panel';
    panel.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 380px;
      height: 100dvh;
      background: var(--bg-panel);
      border-left: 1px solid var(--accent-yellow);
      z-index: 100;
      flex-direction: column;
      box-shadow: -4px 0 30px #ffe60033;
      font-family: var(--font-ui);
      color: var(--fg);
    `;

    panel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:1.5rem 1.5rem 1rem; border-bottom:1px solid var(--border);">
        <span style="color:var(--accent-yellow); font-size:0.85rem; letter-spacing:0.1em; text-transform:uppercase;">✦ AI Assistant</span>
        <div style="display:flex; gap:0.5rem; align-items:center;">
          <button id="ai-include-code" title="Include current file" style="background:none; border:1px solid var(--border); border-radius:4px; color:var(--fg-muted); cursor:pointer; font-size:0.7rem; padding:0.2rem 0.5rem;">+ code</button>
          <button id="ai-clear" title="Clear chat" style="background:none; border:none; color:var(--fg-muted); cursor:pointer; font-size:0.8rem;">✕ clear</button>
          <button id="ai-close" style="background:none; border:none; color:var(--fg-muted); cursor:pointer; font-size:1.2rem;">×</button>
        </div>
      </div>

      <div id="ai-messages" style="flex:1; overflow-y:auto; padding:1rem 1.5rem; display:flex; flex-direction:column; gap:1rem;">
        <div class="ai-message ai-message--assistant">
          <div class="ai-message-content">Hi! I'm your AI assistant. Ask me anything about your code, or use the <strong>+ code</strong> button to include your current file in the conversation.</div>
        </div>
      </div>

      <div id="ai-no-key" style="display:none; padding:1rem 1.5rem; background:var(--bg-surface); margin:1rem; border-radius:6px; font-size:0.8rem; color:var(--fg-muted);">
        No API key set. Add your Anthropic API key in <strong style="color:var(--accent-yellow)">Settings</strong> to use AI features.
      </div>

      <div style="padding:1rem 1.5rem; border-top:1px solid var(--border);">
        <div style="display:flex; gap:0.5rem;">
          <textarea id="ai-input" placeholder="Ask anything..." rows="3"
            style="flex:1; background:var(--bg-surface); border:1px solid var(--border); border-radius:4px;
            padding:0.5rem 0.75rem; color:var(--fg); font-family:var(--font-mono); font-size:0.8rem;
            outline:none; resize:none; line-height:1.5;"></textarea>
          <button id="ai-send" style="background:var(--accent-yellow); border:none; border-radius:4px;
            padding:0.5rem 0.75rem; color:var(--bg); font-family:var(--font-mono); font-size:0.85rem;
            cursor:pointer; align-self:flex-end; font-weight:bold;">▶</button>
        </div>
        <div style="font-size:0.65rem; color:var(--fg-muted); margin-top:0.4rem;">
          Powered by Claude · Your API key · Your data
        </div>
      </div>
    `;

    return panel;
  }

  private addStyles() {
    if (document.getElementById('ai-panel-styles')) return;
    const style = document.createElement('style');
    style.id = 'ai-panel-styles';
    style.textContent = `
      #ai-panel { display: none; flex-direction: column; }
      #ai-panel.open { display: flex; }
      .ai-message { max-width: 100%; }
      .ai-message--user .ai-message-content {
        background: var(--bg-surface);
        border-radius: 8px 8px 2px 8px;
        padding: 0.6rem 0.75rem;
        font-size: 0.85rem;
        margin-left: 2rem;
      }
      .ai-message--assistant .ai-message-content {
        background: transparent;
        border-left: 2px solid var(--accent-yellow);
        padding: 0.4rem 0.75rem;
        font-size: 0.85rem;
        line-height: 1.6;
      }
      .ai-message--assistant .ai-message-content code {
        background: var(--bg-surface);
        padding: 0.1rem 0.3rem;
        border-radius: 3px;
        font-family: var(--font-mono);
        font-size: 0.8rem;
      }
      .ai-message--assistant .ai-message-content pre {
        background: var(--bg-surface);
        border-radius: 4px;
        padding: 0.75rem;
        overflow-x: auto;
        margin: 0.5rem 0;
        font-family: var(--font-mono);
        font-size: 0.8rem;
      }
      .ai-thinking {
        color: var(--fg-muted);
        font-size: 0.8rem;
        font-style: italic;
        padding: 0.4rem 0.75rem;
        border-left: 2px solid var(--accent-yellow);
      }
    `;
    document.head.appendChild(style);
  }

  open() {
    this.panel.classList.add('open');
    this.overlay.style.display = 'block';
    this.wireEvents();
    this.checkApiKey();
  }

  close() {
    this.panel.classList.remove('open');
    this.overlay.style.display = 'none';
  }

  private checkApiKey() {
    const key = this.getApiKey();
    const noKeyEl = document.getElementById('ai-no-key')!;
    const inputEl = document.getElementById('ai-input') as HTMLTextAreaElement;
    const sendEl = document.getElementById('ai-send') as HTMLButtonElement;
    if (!key) {
      noKeyEl.style.display = 'block';
      inputEl.disabled = true;
      sendEl.disabled = true;
    } else {
      noKeyEl.style.display = 'none';
      inputEl.disabled = false;
      sendEl.disabled = false;
    }
  }

  private wireEvents() {
    const closeBtn = document.getElementById('ai-close')!;
    const clearBtn = document.getElementById('ai-clear')!;
    const sendBtn = document.getElementById('ai-send')!;
    const input = document.getElementById('ai-input') as HTMLTextAreaElement;
    const includeCodeBtn = document.getElementById('ai-include-code')!;

    closeBtn.onclick = () => this.close();
    clearBtn.onclick = () => this.clearChat();

    let includeCode = false;
    includeCodeBtn.onclick = () => {
      includeCode = !includeCode;
      includeCodeBtn.style.color = includeCode ? 'var(--accent-yellow)' : 'var(--fg-muted)';
      includeCodeBtn.style.borderColor = includeCode ? 'var(--accent-yellow)' : 'var(--border)';
    };

    const send = async () => {
      const text = input.value.trim();
      if (!text) return;

      let content = text;
      if (includeCode) {
        const code = this.getEditorContent();
        if (code) content = `${text}\n\n\`\`\`\n${code}\n\`\`\``;
        includeCode = false;
        includeCodeBtn.style.color = 'var(--fg-muted)';
        includeCodeBtn.style.borderColor = 'var(--border)';
      }

      input.value = '';
      this.addMessage('user', text);
      await this.sendToAI(content);
    };

    sendBtn.onclick = send;
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    });
  }

  private addMessage(role: 'user' | 'assistant', content: string) {
    this.messages.push({ role, content });
    const messagesEl = document.getElementById('ai-messages')!;
    const div = document.createElement('div');
    div.className = `ai-message ai-message--${role}`;
    div.innerHTML = `<div class="ai-message-content">${this.formatContent(content)}</div>`;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  private formatContent(content: string): string {
    return content
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  private clearChat() {
    this.messages = [];
    const messagesEl = document.getElementById('ai-messages')!;
    messagesEl.innerHTML = `
      <div class="ai-message ai-message--assistant">
        <div class="ai-message-content">Chat cleared. How can I help?</div>
      </div>
    `;
  }

  private async sendToAI(content: string) {
    const apiKey = this.getApiKey();
    if (!apiKey) return;

    const messagesEl = document.getElementById('ai-messages')!;
    const thinking = document.createElement('div');
    thinking.className = 'ai-thinking';
    thinking.textContent = 'Thinking...';
    messagesEl.appendChild(thinking);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-allow-browser': 'true',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-6',
          max_tokens: 1024,
          messages: [
            ...this.messages.slice(0, -1).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content }
          ],
          system: 'You are a helpful coding assistant built into ClearCode, a code editor. Be concise and practical. When showing code, use markdown code blocks.',
        }),
      });

      thinking.remove();

      if (!response.ok) {
        const err = await response.json();
        this.addMessage('assistant', `Error: ${err.error?.message ?? 'Something went wrong'}`);
        return;
      }

      const data = await response.json();
      const reply = data.content[0]?.text ?? 'No response';
      this.addMessage('assistant', reply);

    } catch (e: any) {
      thinking.remove();
      this.addMessage('assistant', `Error: ${e.message}`);
    }
  }
}