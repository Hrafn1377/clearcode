export class TimerPanel {
  private panel: HTMLElement;
  private overlay: HTMLElement;
  private csrfToken: string;
  private projects: any[] = [];
  private activeEntryId: number | null = null;
  private activeProjectId: number | null = null;
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private startTime: Date | null = null;

  constructor() {
  this.csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
  this.panel = this.buildPanel();
  this.overlay = this.buildOverlay();
  document.body.appendChild(this.overlay);
  document.body.appendChild(this.panel);
  this.addStyles();
  const popoutBtn = this.panel.querySelector('#timer-popout')!;
  (popoutBtn as HTMLElement).onclick = () => {
    window.open(
      '/timer',
      'ClearCodeTimer',
      'width=340,height=600,resizable=yes,scrollbars=no'
    );
  };
}

  private buildOverlay(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.id = 'timer-overlay';
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
    panel.id = 'timer-panel';
    panel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:1.5rem 1.5rem 1rem; border-bottom:1px solid var(--border);">
  <span style="color:var(--accent-yellow); font-size:0.85rem; letter-spacing:0.1em; text-transform:uppercase;">⏱ Timer</span>
  <div style="display:flex; align-items:center; gap:0.5rem;">
    <button id="timer-popout" style="background:none; border:none; color:var(--fg-muted); cursor:pointer; font-size:0.9rem;" title="Pop out timer">⤢</button>
    <button id="timer-close" style="background:none; border:none; color:var(--fg-muted); cursor:pointer; font-size:1.2rem;">×</button>
  </div>
</div>


      <div style="padding:1rem 1.5rem;">
        <select id="timer-project-select" style="width:100%; background:var(--bg-surface); border:1px solid var(--border); border-radius:4px; padding:0.4rem 0.5rem; color:var(--fg); font-family:var(--font-mono); font-size:0.8rem; outline:none; margin-bottom:0.5rem;">
          <option value="">— Select a project —</option>
        </select>
        <input type="text" id="timer-note" placeholder="What are you working on? (optional)"
          style="width:100%; background:var(--bg-surface); border:1px solid var(--border); border-radius:4px; padding:0.4rem 0.5rem; color:var(--fg); font-family:var(--font-mono); font-size:0.75rem; outline:none; margin-bottom:0.75rem;" />
        <div id="timer-display" style="font-family:var(--font-mono); font-size:2.5rem; color:var(--accent-cyan); text-shadow:0 0 12px var(--accent-cyan); text-align:center; margin:0.5rem 0; letter-spacing:0.05em;">00:00:00</div>
        <button id="timer-toggle" style="width:100%; border:none; border-radius:4px; padding:0.6rem; font-family:var(--font-mono); font-size:0.85rem; cursor:pointer; font-weight:bold; background:var(--accent-green); color:var(--bg);">▶ Start Timer</button>
      </div>

      <div style="padding:0 1.5rem 1rem;">
        <div style="font-size:0.7rem; color:var(--fg-muted); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:0.75rem;">Projects</div>
        <div id="timer-project-list"></div>
        <div style="display:flex; gap:0.5rem; margin-top:0.75rem;">
          <input type="text" id="timer-new-project" placeholder="New project..." 
            style="flex:1; background:var(--bg-surface); border:1px solid var(--border); border-radius:4px; padding:0.4rem 0.5rem; color:var(--fg); font-family:var(--font-mono); font-size:0.75rem; outline:none;" />
          <input type="number" id="timer-new-rate" placeholder="$/hr"
            style="width:60px; background:var(--bg-surface); border:1px solid var(--border); border-radius:4px; padding:0.4rem 0.5rem; color:var(--fg); font-family:var(--font-mono); font-size:0.75rem; outline:none;" />
          <button id="timer-add-project" style="background:var(--accent-cyan); border:none; border-radius:4px; padding:0.4rem 0.75rem; color:var(--bg); font-family:var(--font-mono); font-size:0.75rem; cursor:pointer;">+</button>
        </div>
      </div>
    `;
    return panel;
  }

  private addStyles() {
    if (document.getElementById('timer-panel-styles')) return;
    const style = document.createElement('style');
    style.id = 'timer-panel-styles';
    style.textContent = `
      #timer-panel {
        display: none;
        position: fixed;
        top: 0;
        right: 0;
        width: 340px;
        height: 100dvh;
        background: var(--bg-panel);
        border-left: 1px solid var(--accent-yellow);
        z-index: 100;
        flex-direction: column;
        box-shadow: -4px 0 30px #ffe60033;
        font-family: var(--font-ui);
        color: var(--fg);
        overflow-y: auto;
      }
      #timer-panel.open { display: flex; flex-direction: column; }
      .timer-project-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.4rem 0;
        border-bottom: 1px solid var(--border);
        font-size: 0.8rem;
      }
      .timer-project-row:last-child { border-bottom: none; }
      .timer-running-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--accent-green);
        box-shadow: 0 0 6px var(--accent-green);
        display: inline-block;
        margin-right: 0.4rem;
      }
    `;
    document.head.appendChild(style);
  }

  async open() {
    this.panel.classList.add('open');
    this.overlay.style.display = 'block';
    await this.loadProjects();
    this.wireEvents();
  }

  close() {
    this.panel.classList.remove('open');
    this.overlay.style.display = 'none';
  }

  private async loadProjects() {
    const res = await fetch('/timer_projects', { headers: { 'Accept': 'application/json' } });
    this.projects = await res.json();
    this.renderProjects();
    this.renderProjectSelect();
    this.checkRunning();
  }

  private renderProjectSelect() {
    const select = this.panel.querySelector('#timer-project-select') as HTMLSelectElement;
    const current = select.value;
    select.innerHTML = '<option value="">— Select a project —</option>';
    this.projects.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      select.appendChild(opt);
    });
    if (current) select.value = current;
  }

  private renderProjects() {
    const list = this.panel.querySelector('#timer-project-list')!;
    if (this.projects.length === 0) {
      list.innerHTML = '<div style="color:var(--fg-muted); font-size:0.75rem; padding:0.5rem 0;">No projects yet.</div>';
      return;
    }
    list.innerHTML = this.projects.map(p => `
      <div class="timer-project-row">
        <span style="font-family:var(--font-mono); color:var(--fg);">
          ${p.running ? '<span class="timer-running-dot"></span>' : ''}${p.name}
        </span>
        <span style="color:var(--accent-cyan); font-family:var(--font-mono); font-size:0.75rem;">${p.total_hours}h</span>
        ${p.hourly_rate ? `<span style="color:var(--accent-yellow); font-family:var(--font-mono); font-size:0.75rem;">$${p.billable_amount}</span>` : ''}
        <button class="timer-btn-delete" data-id="${p.id}" style="background:none; border:none; color:var(--fg-muted); cursor:pointer; font-size:0.8rem;">✕</button>
      </div>
    `).join('');

    list.querySelectorAll('.timer-btn-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = (btn as HTMLElement).dataset.id;
        const project = this.projects.find(p => p.id === parseInt(id!));
        if (!confirm(`Delete "${project.name}" and all its time entries?`)) return;
        await fetch(`/timer_projects/${id}`, {
          method: 'DELETE',
          headers: { 'X-CSRF-Token': this.csrfToken }
        });
        await this.loadProjects();
      });
    });
  }

  private checkRunning() {
    const running = this.projects.find(p => p.running);
    if (running) {
      this.activeProjectId = running.id;
      this.activeEntryId = running.active_entry_id;
      const select = this.panel.querySelector('#timer-project-select') as HTMLSelectElement;
      select.value = running.id;
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.startTimerDisplay();
      this.updateToggleBtn(true);
    }
  }

  private startTimerDisplay() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.startTime = this.startTime || new Date();
    this.timerInterval = setInterval(() => this.updateDisplay(), 1000);
  }

  private updateDisplay() {
    const elapsed = Math.floor((new Date().getTime() - this.startTime!.getTime()) / 1000);
    const h = Math.floor(elapsed / 3600).toString().padStart(2, '0');
    const m = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
    const s = (elapsed % 60).toString().padStart(2, '0');
    const display = this.panel.querySelector('#timer-display') as HTMLElement;
    display.textContent = `${h}:${m}:${s}`;
    display.style.color = 'var(--accent-green)';
    display.style.textShadow = '0 0 12px var(--accent-green)';
  }

  private stopTimerDisplay() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.startTime = null;
    const display = this.panel.querySelector('#timer-display') as HTMLElement;
    display.textContent = '00:00:00';
    display.style.color = 'var(--accent-cyan)';
    display.style.textShadow = '0 0 12px var(--accent-cyan)';
  }

  private updateToggleBtn(running: boolean) {
    const btn = this.panel.querySelector('#timer-toggle') as HTMLButtonElement;
    if (running) {
      btn.textContent = '■ Stop Timer';
      btn.style.background = 'var(--accent-pink)';
    } else {
      btn.textContent = '▶ Start Timer';
      btn.style.background = 'var(--accent-green)';
    }
  }

  private wireEvents() {
    const closeBtn = this.panel.querySelector('#timer-close')!;
    const toggleBtn = this.panel.querySelector('#timer-toggle')!;
    const addBtn = this.panel.querySelector('#timer-add-project')!;
    const select = this.panel.querySelector('#timer-project-select') as HTMLSelectElement;

    (closeBtn as HTMLButtonElement).onclick = () => this.close();

    select.addEventListener('change', async () => {
      const selectedId = select.value;
      const runningProject = this.projects.find(p => p.running);
      if (runningProject && runningProject.id !== parseInt(selectedId)) {
        const confirmed = confirm(`Stop timer on "${runningProject.name}" and switch to this project?`);
        if (!confirmed) {
          select.value = String(runningProject.id);
          return;
        }
        if (this.activeEntryId) {
          await fetch(`/timer_entries/${this.activeEntryId}`, {
            method: 'PATCH',
            headers: { 'X-CSRF-Token': this.csrfToken }
          });
          this.activeEntryId = null;
        }
        this.stopTimerDisplay();
        this.updateToggleBtn(false);
        const res = await fetch('/timer_entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': this.csrfToken },
          body: JSON.stringify({ project_id: selectedId, note: '' })
        });
        const data = await res.json();
        this.activeEntryId = data.id;
        this.activeProjectId = parseInt(selectedId);
        this.startTime = new Date();
        this.startTimerDisplay();
        this.updateToggleBtn(true);
        await this.loadProjects();
      }
    });

    toggleBtn.addEventListener('click', async () => {
      const projectId = select.value;
      const note = (this.panel.querySelector('#timer-note') as HTMLInputElement).value;

      if (this.timerInterval) {
        if (this.activeEntryId) {
          await fetch(`/timer_entries/${this.activeEntryId}`, {
            method: 'PATCH',
            headers: { 'X-CSRF-Token': this.csrfToken }
          });
          this.activeEntryId = null;
        }
        this.stopTimerDisplay();
        this.updateToggleBtn(false);
        this.activeProjectId = null;
        await this.loadProjects();
      } else {
        if (!projectId) { alert('Select a project first.'); return; }
        const res = await fetch('/timer_entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': this.csrfToken },
          body: JSON.stringify({ project_id: projectId, note })
        });
        const data = await res.json();
        this.activeEntryId = data.id;
        this.activeProjectId = parseInt(projectId);
        this.startTime = new Date();
        this.startTimerDisplay();
        this.updateToggleBtn(true);
        await this.loadProjects();
      }
    });

    addBtn.addEventListener('click', async () => {
      const name = (this.panel.querySelector('#timer-new-project') as HTMLInputElement).value.trim();
      const rate = (this.panel.querySelector('#timer-new-rate') as HTMLInputElement).value;
      if (!name) return;
      await fetch('/timer_projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': this.csrfToken },
        body: JSON.stringify({ timer_project: { name, hourly_rate: rate || null } })
      });
      (this.panel.querySelector('#timer-new-project') as HTMLInputElement).value = '';
      (this.panel.querySelector('#timer-new-rate') as HTMLInputElement).value = '';
      await this.loadProjects();
    });
  }
}
