class GitPanel extends HTMLElement {
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
    if (this.isOpen) {
      this.refresh();
    }
    this.render();
    this.setupListeners();
  }

  async refresh() {
    const status = await window.getGitStatus();
    const branch = await window.getGitBranch();
    this.currentBranch = branch;
    this.changedFiles = [];
    
    if (status && status.trim()) {
      this.changedFiles = status.trim().split('\n').map(line => {
        const status = line.substring(0, 2);
        const file = line.substring(3);
        return { status, file, staged: status[0] !== ' ' && status[0] !== '?' };
      });
    }
    
    this.render();
    this.setupListeners();
  }

  render() {
    const files = this.changedFiles || [];
    const staged = files.filter(f => f.staged);
    const unstaged = files.filter(f => !f.staged);
    
    this.innerHTML = `
      <div class="git-overlay ${this.isOpen ? 'open' : ''}" id="git-overlay"></div>
      <div class="git-panel ${this.isOpen ? 'open' : ''}">
        <div class="git-header">
          <h2>Git: ${this.currentBranch || 'No repo'}</h2>
          <button class="git-close" id="git-close">×</button>
        </div>
        
        <div class="git-content">
          <div class="git-section">
            <h3>Staged (${staged.length})</h3>
            <div class="git-files">
              ${staged.length ? staged.map(f => `
                <div class="git-file staged" data-file="${f.file}">
                  <span class="git-file-status">${f.status}</span>
                  <span class="git-file-name">${f.file}</span>
                  <button class="git-unstage" data-file="${f.file}">−</button>
                </div>
              `).join('') : '<div class="git-empty">No staged files</div>'}
            </div>
          </div>

          <div class="git-section">
            <h3>Changes (${unstaged.length})</h3>
            <div class="git-files">
              ${unstaged.length ? unstaged.map(f => `
                <div class="git-file unstaged" data-file="${f.file}">
                  <span class="git-file-status">${f.status}</span>
                  <span class="git-file-name">${f.file}</span>
                  <button class="git-stage" data-file="${f.file}">+</button>
                </div>
              `).join('') : '<div class="git-empty">No changes</div>'}
            </div>
          </div>

          <div class="git-section">
            <h3>Commit</h3>
            <textarea id="commit-message" placeholder="Commit message..." rows="3"></textarea>
            <div class="git-actions">
              <button id="git-commit" ${staged.length === 0 ? 'disabled' : ''}>Commit</button>
              <button id="git-push">Push</button>
              <button id="git-pull">Pull</button>
            </div>
          </div>

          <div class="git-section">
            <button id="git-stage-all">Stage All</button>
          </div>
        </div>
      </div>
    `;
  }

  setupListeners() {
    const close = this.querySelector('#git-close');
    const overlay = this.querySelector('#git-overlay');
    
    if (close) close.addEventListener('click', () => this.toggle());
    if (overlay) overlay.addEventListener('click', () => this.toggle());

    // Stage individual file
    this.querySelectorAll('.git-stage').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const file = btn.dataset.file;
        await window.gitAdd(file);
        await this.refresh();
        await window.updateGitUI();
      });
    });

    // Unstage individual file
    this.querySelectorAll('.git-unstage').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const file = btn.dataset.file;
        await window.runGitCommand(['reset', 'HEAD', file]);
        await this.refresh();
        await window.updateGitUI();
      });
    });

    // Stage all
    const stageAll = this.querySelector('#git-stage-all');
    if (stageAll) {
      stageAll.addEventListener('click', async () => {
        await window.gitAdd('.');
        await this.refresh();
        await window.updateGitUI();
      });
    }

    // Commit
    const commitBtn = this.querySelector('#git-commit');
    const commitMsg = this.querySelector('#commit-message');
    if (commitBtn) {
      commitBtn.addEventListener('click', async () => {
        const message = commitMsg.value.trim();
        if (!message) {
          alert('Please enter a commit message');
          return;
        }
        await window.gitCommit(message);
        commitMsg.value = '';
        await this.refresh();
        await window.updateGitUI();
      });
    }

    // Push
    const pushBtn = this.querySelector('#git-push');
    if (pushBtn) {
      pushBtn.addEventListener('click', async () => {
        await window.gitPush();
        await this.refresh();
      });
    }

    // Pull
    const pullBtn = this.querySelector('#git-pull');
    if (pullBtn) {
      pullBtn.addEventListener('click', async () => {
        await window.gitPull();
        await this.refresh();
        await window.updateGitUI();
      });
    }
  }
}

customElements.define('git-panel', GitPanel);