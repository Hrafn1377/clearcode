export class GitPanel {
  private csrfToken: string;
  private panel: HTMLElement;
  private overlay: HTMLElement;
  private repoPath: string = "";

  constructor() {
    this.csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? "";
    this.panel = this.buildPanel();
    this.overlay = this.buildOverlay();
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.panel);
  }

  private buildOverlay(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.id = 'git-overlay';
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
    panel.id = 'git-panel';
    panel.style.cssText = `
      display: none;
      position: fixed;
      top: 0;
      right: 0;
      width: 360px;
      height: 100dvh;
      background: var(--bg-panel);
      border-left: 1px solid var(--accent-green);
      z-index: 100;
      overflow-y: auto;
      padding: 1.5rem;
      box-shadow: -4px 0 30px #39ff1433;
      font-family: var(--font-ui);
      color: var(--fg);
    `;
    return panel;
  }

  async open() {
    this.panel.style.display = 'block';
    this.overlay.style.display = 'block';
    await this.render();
  }

  close() {
    this.panel.style.display = 'none';
    this.overlay.style.display = 'none';
  }

  private async render() {
    this.panel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
        <span style="color:var(--accent-green); font-size:0.85rem; letter-spacing:0.1em; text-transform:uppercase;">Git</span>
        <button id="git-close" style="background:none; border:none; color:var(--fg-muted); cursor:pointer; font-size:1.2rem;">×</button>
      </div>

      <div class="git-section">
        <label class="git-label">Repository Path</label>
        <div style="display:flex; gap:0.5rem;">
          <input type="text" id="git-path" placeholder="/path/to/your/repo"
            style="flex:1; background:var(--bg-surface); border:1px solid var(--border); border-radius:4px;
            padding:0.5rem 0.75rem; color:var(--fg); font-family:var(--font-mono); font-size:0.8rem; outline:none;" />
          <button id="git-load" style="background:var(--accent-green); border:none; border-radius:4px;
            padding:0.5rem 0.75rem; color:var(--bg); font-family:var(--font-mono); font-size:0.8rem; cursor:pointer;">Load</button>
        </div>
      </div>

      <div class="git-section" id="git-status-section" style="display:none;">
        <label class="git-label">Status</label>
        <pre id="git-status-output" style="background:var(--bg-surface); border-radius:4px; padding:0.75rem;
          font-size:0.75rem; overflow-x:auto; white-space:pre-wrap; max-height:200px; overflow-y:auto;"></pre>
        <button id="git-refresh" style="margin-top:0.5rem; background:transparent; border:1px solid var(--border);
          border-radius:4px; padding:0.3rem 0.75rem; color:var(--fg-muted); font-family:var(--font-mono);
          font-size:0.75rem; cursor:pointer;">↻ Refresh</button>
      </div>

      <div class="git-section" id="git-diff-section" style="display:none;">
        <label class="git-label">Diff</label>
        <pre id="git-diff-output" style="background:var(--bg-surface); border-radius:4px; padding:0.75rem;
          font-size:0.75rem; overflow-x:auto; white-space:pre-wrap; max-height:250px; overflow-y:auto;"></pre>
      </div>

      <div class="git-section" id="git-commit-section" style="display:none;">
        <label class="git-label">Commit</label>
        <input type="text" id="git-commit-message" placeholder="Commit message..."
          style="width:100%; background:var(--bg-surface); border:1px solid var(--border); border-radius:4px;
          padding:0.5rem 0.75rem; color:var(--fg); font-family:var(--font-mono); font-size:0.8rem; outline:none;
          margin-bottom:0.5rem;" />
        <button id="git-commit-btn" style="width:100%; background:var(--accent-green); border:none; border-radius:4px;
          padding:0.5rem; color:var(--bg); font-family:var(--font-mono); font-size:0.85rem; cursor:pointer;">
          Commit All Changes
        </button>
        <div id="git-commit-result" style="margin-top:0.5rem; font-size:0.75rem; color:var(--fg-muted);"></div>
      </div>
    `;

    const style = document.getElementById('git-panel-styles');
    if (!style) {
      const s = document.createElement('style');
      s.id = 'git-panel-styles';
      s.textContent = `
        .git-section { margin-bottom: 1.5rem; }
        .git-label {
          display: block;
          font-size: 0.75rem;
          color: var(--fg-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 0.5rem;
        }
      `;
      document.head.appendChild(s);
    }

    document.getElementById('git-close')!.addEventListener('click', () => this.close());

    const pathInput = document.getElementById('git-path') as HTMLInputElement;
    const loadBtn = document.getElementById('git-load')!;

    if (this.repoPath) pathInput.value = this.repoPath;

    loadBtn.addEventListener('click', async () => {
      const path = pathInput.value.trim();
      if (!path) return;
      this.repoPath = path;
      await this.loadRepo(path);
    });
  }

private async loadRepo(path: string) {
  try {
    const [statusText, diffText] = await Promise.all([
      this.status(path),
      this.diff(path),
    ]);

    const statusSection = document.getElementById('git-status-section')!;
    const diffSection = document.getElementById('git-diff-section')!;
    const commitSection = document.getElementById('git-commit-section')!;
    const statusEl = document.getElementById('git-status-output')!;
    const diffEl = document.getElementById('git-diff-output')!;

    statusSection.style.display = 'block';
    diffSection.style.display = 'block';
    commitSection.style.display = 'block';

    statusEl.textContent = statusText || '(nothing to commit)';
    diffEl.textContent = diffText || '(no changes)';

    document.getElementById('git-refresh')!.addEventListener('click', () => this.loadRepo(path));

    const commitBtn = document.getElementById('git-commit-btn')!;
    const commitMsg = document.getElementById('git-commit-message') as HTMLInputElement;
    const commitResult = document.getElementById('git-commit-result')!;

    commitBtn.addEventListener('click', async () => {
      const message = commitMsg.value.trim();
      if (!message) { commitResult.textContent = 'Please enter a commit message.'; return; }
      try {
        await this.commit(path, message);
        commitResult.style.color = 'var(--accent-green)';
        commitResult.textContent = '✓ Committed successfully';
        commitMsg.value = '';
        await this.loadRepo(path);
      } catch (e: any) {
        commitResult.style.color = 'var(--accent-pink)';
        commitResult.textContent = `Error: ${e.message}`;
      }
    });

  } catch (e: any) {
    const statusSection = document.getElementById('git-status-section')!;
    statusSection.style.display = 'block';
    document.getElementById('git-status-output')!.textContent = `Error: ${e.message}`;
  }
}

  async status(path: string): Promise<string> {
    const res = await fetch(`/git/status?path=${encodeURIComponent(path)}`, {
      headers: { "X-CSRF-Token": this.csrfToken },
    });
    if (!res.ok) throw new Error("Git status failed");
    const data = await res.json() as { output: string };
    return data.output;
  }

  async diff(path: string): Promise<string> {
    const res = await fetch(`/git/diff?path=${encodeURIComponent(path)}`, {
      headers: { "X-CSRF-Token": this.csrfToken },
    });
    if (!res.ok) throw new Error("Git diff failed");
    const data = await res.json() as { output: string };
    return data.output;
  }

  async commit(path: string, message: string): Promise<void> {
    const res = await fetch("/git/commit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": this.csrfToken,
      },
      body: JSON.stringify({ path, message }),
    });
    if (!res.ok) throw new Error("Commit failed");
  }
}