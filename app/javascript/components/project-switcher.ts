import { ProjectManager, Project } from "./project-manager";

export class ProjectSwitcher {
  private manager: ProjectManager;
  private modal: HTMLElement;
  private overlay: HTMLElement;
  private csrfToken: string;
  private onSelect: ((project: Project | null) => void) | null = null;

  constructor(manager: ProjectManager) {
    this.manager = manager;
    this.csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
    this.modal = this.buildModal();
    this.overlay = this.buildOverlay();
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.modal);
    this.addStyles();
  }

  setOnSelect(fn: (project: Project | null) => void) {
    this.onSelect = fn;
  }

  private buildOverlay(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.id = 'project-overlay';
    overlay.style.cssText = `
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      z-index: 199;
    `;
    overlay.addEventListener('click', () => this.close());
    return overlay;
  }

  private buildModal(): HTMLElement {
    const modal = document.createElement('div');
    modal.id = 'project-modal';
    modal.style.cssText = `
      display: none;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 480px;
      max-width: 90vw;
      background: var(--bg-panel);
      border: 1px solid var(--accent-purple);
      border-radius: 8px;
      z-index: 200;
      padding: 1.5rem;
      box-shadow: 0 0 40px #b45fcb33;
      font-family: var(--font-ui);
      color: var(--fg);
    `;
    return modal;
  }

  private addStyles() {
    if (document.getElementById('project-switcher-styles')) return;
    const style = document.createElement('style');
    style.id = 'project-switcher-styles';
    style.textContent = `
      .project-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.6rem 0.75rem;
        border-radius: 4px;
        cursor: pointer;
        border: 1px solid transparent;
        margin-bottom: 0.4rem;
        transition: border-color 0.15s, background 0.15s;
      }
      .project-item:hover { background: var(--bg-surface); }
      .project-item.active { border-color: var(--accent-cyan); }
      .project-name {
        font-family: var(--font-mono);
        font-size: 0.9rem;
        color: var(--fg);
      }
      .project-meta {
        font-size: 0.75rem;
        color: var(--fg-muted);
        margin-top: 0.15rem;
      }
      .project-actions { display: flex; gap: 0.5rem; }
      .project-action-btn {
        background: none;
        border: none;
        color: var(--fg-muted);
        cursor: pointer;
        font-size: 0.8rem;
        padding: 0.2rem 0.4rem;
        border-radius: 3px;
      }
      .project-action-btn:hover { color: var(--accent-pink); }
      .new-project-form {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid var(--border);
      }
      .new-project-input {
        flex: 1;
        background: var(--bg-surface);
        border: 1px solid var(--border);
        border-radius: 4px;
        padding: 0.5rem 0.75rem;
        color: var(--fg);
        font-family: var(--font-mono);
        font-size: 0.85rem;
        outline: none;
      }
      .new-project-input:focus { border-color: var(--accent-cyan); }
      .new-project-btn {
        background: var(--accent-cyan);
        border: none;
        border-radius: 4px;
        padding: 0.5rem 1rem;
        color: var(--bg);
        font-family: var(--font-mono);
        font-size: 0.85rem;
        cursor: pointer;
        white-space: nowrap;
      }
      .no-projects {
        color: var(--fg-muted);
        font-size: 0.85rem;
        text-align: center;
        padding: 1.5rem 0;
      }
    `;
    document.head.appendChild(style);
  }

  async open() {
    this.modal.style.display = 'block';
    this.overlay.style.display = 'block';
    await this.render();
  }

  close() {
    this.modal.style.display = 'none';
    this.overlay.style.display = 'none';
  }

  private async render() {
    const projects = await this.manager.loadProjects();
    const current = this.manager.getCurrentProject();

    this.modal.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
        <span style="color:var(--accent-cyan); font-size:0.85rem; letter-spacing:0.1em; text-transform:uppercase;">Projects</span>
        <button id="project-modal-close" style="background:none; border:none; color:var(--fg-muted); cursor:pointer; font-size:1.2rem;">×</button>
      </div>

      <div id="project-list">
        ${projects.length === 0
          ? '<div class="no-projects">No projects yet — create one below.</div>'
          : projects.map(p => `
            <div class="project-item ${current?.id === p.id ? 'active' : ''}" data-id="${p.id}">
              <div>
                <div class="project-name">${p.name}</div>
                ${p.description ? `<div class="project-meta">${p.description}</div>` : ''}
              </div>
              <div class="project-actions">
                <button class="project-action-btn btn-delete-project" data-id="${p.id}" title="Delete">✕</button>
              </div>
            </div>
          `).join('')
        }
      </div>

      <div class="new-project-form">
        <input type="text" id="new-project-name" class="new-project-input" placeholder="New project name..." />
        <button id="btn-create-project" class="new-project-btn">+ Create</button>
      </div>
    `;

    this.modal.querySelector('#project-modal-close')!.addEventListener('click', () => this.close());

    this.modal.querySelectorAll('.project-item').forEach(el => {
      el.addEventListener('click', async (e) => {
        if ((e.target as HTMLElement).closest('.project-actions')) return;
        const id = parseInt((el as HTMLElement).dataset.id!);
        const project = projects.find(p => p.id === id)!;
        await this.manager.openProject(project);
        this.onSelect?.(project);
        this.close();
      });
    });

    this.modal.querySelectorAll('.btn-delete-project').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = parseInt((btn as HTMLElement).dataset.id!);
        if (!confirm('Delete this project? Files will not be deleted.')) return;
        await this.manager.deleteProject(id);
        await this.render();
      });
    });

    const createBtn = this.modal.querySelector('#btn-create-project')!;
    const nameInput = this.modal.querySelector('#new-project-name') as HTMLInputElement;

    createBtn.addEventListener('click', async () => {
      const name = nameInput.value.trim();
      if (!name) return;
      const project = await this.manager.createProject(name);
      await this.manager.openProject(project);
      this.onSelect?.(project);
      this.close();
    });

    nameInput.addEventListener('keydown', (e) => {
  e.stopPropagation();
  if (e.key === 'Enter') createBtn.dispatchEvent(new Event('click'));
});
    nameInput.addEventListener('keyup', (e) => e.stopPropagation());
    nameInput.addEventListener('keypress', (e) => e.stopPropagation());
    nameInput.focus();
  }
}