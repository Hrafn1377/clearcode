import type { ClearCodeEditor } from "../editor/editor";
import type { ThemeManager } from "../themes/theme-manager";
import { backupToGist } from "../utils/gist";

export interface CodeFile {
  id: number;
  name: string;
  language: string;
  content?: string;
  updated_at: string;
}

export class FileManager {
  private editor: ClearCodeEditor;
  private currentFile: CodeFile | null = null;
  private files: CodeFile[] = [];
  private csrfToken: string;
  private sidebar: HTMLElement | null;
  private statusLang: HTMLElement | null;
  private projectFilter: number | null = null;

  constructor(editor: ClearCodeEditor) {
    this.editor = editor;
    this.csrfToken =
      (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? "";
    this.sidebar = document.getElementById("sidebar");
    this.statusLang = document.getElementById("status-lang");
    this.bindKeyboard();
    setInterval(() => {
      if (this.currentFile) this.saveCurrentFile();
    }, 5 * 60 * 1000);
  }
  setProjectFilter(projectId: number | null): void {
    this.projectFilter = projectId;
  }

  async loadFiles(): Promise<void> {
  const url = this.projectFilter
    ? `/code_files?project_id=${this.projectFilter}`
    : '/code_files';
  const res = await fetch(url, {
    headers: { "X-CSRF-Token": this.csrfToken },
  });
  this.files = await res.json() as CodeFile[];
  this.renderSidebar();
}

  async openFile(id: number): Promise<void> {
    const res = await fetch(`/code_files/${id}`, {
      headers: { "X-CSRF-Token": this.csrfToken },
    });
    const file = await res.json() as CodeFile;
    this.currentFile = file;
    this.editor.setContent(file.content ?? "");
    this.editor.setLanguage(file.name);
    if (this.statusLang) this.statusLang.textContent = file.language;
  }

  async newFile(name: string): Promise<void> {
    const res = await fetch("/code_files", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": this.csrfToken,
      },
      body: JSON.stringify({ code_file: { name, content: "", project_id: this.projectFilter } }),
    });
    const file = await res.json() as CodeFile;
    this.files.push(file);
    this.renderSidebar();
    await this.openFile(file.id);
  }

  async saveCurrentFile(): Promise<void> {
    if (!this.currentFile) return;
    const content = this.editor.getContent();
    await fetch(`/code_files/${this.currentFile.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": this.csrfToken,
      },
      body: JSON.stringify({ code_file: { content } }),
    });
    this.showSavedFeedback();
  }

  private showSavedFeedback(): void {
    console.log("[ClearCode] showSavedFeedback called");
  const el = document.getElementById("status-cursor");
  if (!el) return;
  const original = el.textContent;
  el.textContent = "✓ Saved";
  el.style.color = "var(--accent-cyan)";
  setTimeout(() => {
    el.textContent = original;
    el.style.color = "";
  }, 3000);
}

  async deleteFile(id: number): Promise<void> {
    await fetch(`/code_files/${id}`, {
      method: "DELETE",
      headers: { "X-CSRF-Token": this.csrfToken },
    });
    this.files = this.files.filter(f => f.id !== id);
    if (this.currentFile?.id === id) {
      this.currentFile = null;
      this.editor.setContent("");
    }
    this.renderSidebar();
  }

  async renameFile(id: number, newName: string): Promise<void> {
    const res = await fetch (`/code_files/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": this.csrfToken,
      },
      body: JSON.stringify({ code_file: { name: newName } }),
    });
    const updated = await res.json() as CodeFile;
    this.files = this.files.map(f => f.id === id ? { ...f, name: updated.name, language: updated.language } :f);
    if (this.currentFile?.id === id) {
      this.currentFile = { ...this.currentFile, name: updated.name };
      this.editor.setLanguage(updated.name);
      if (this.statusLang) this.statusLang.textContent = updated.language;
    }
    this.renderSidebar();
  }

  private renderSidebar(): void {
    if (!this.sidebar) return;
    this.sidebar.innerHTML = `
      <div class="sidebar-header">
        <button class="btn-new" id="btn-new-file">+ New File</button>
        <button class="btn-save" id="btn-save-file">↓ Save</button>
        <button class="btn-gist" id="btn-backup-gist">☁ Gist</button>
      </div>
      <ul class="file-list">
        ${this.files.map(f => `
          <li class="file-item ${this.currentFile?.id === f.id ? 'active' : ''}" data-id="${f.id}">
            <span class="file-name">${f.name}</span>
            <button class="btn-delete" data-id="${f.id}">×</button>
          </li>
        `).join("")}
      </ul>
    `;

    document.getElementById("btn-new-file")?.addEventListener("click", () => {
      const name = prompt("File name (e.g. index.ts):");
      if (name) this.newFile(name);
    });

    document.getElementById("btn-save-file")?.addEventListener("click", () => {
      this.saveCurrentFile();
    });

    document.getElementById("btn-backup-gist")?.addEventListener("click", async () => {
      const token = (document.getElementById('settings-github-token') as HTMLInputElement)?.value;
      if (!token) {
        alert('Add your GitHub token in Settings to use Gist backup.');
        return;
      }
      if (!this.currentFile) {
        alert('Open a file first to back it up.');
        return;
      }
      try {
        const result = await backupToGist(
          token,
          `ClearCode backup — ${this.currentFile.name}`,
          [{ name: this.currentFile.name, content: this.editor.getContent() }]
        );
        const open = confirm(`✓ Backed up to Gist!\n\n${result.html_url}\n\nOpen in browser?`);
        if (open) window.open(result.html_url, '_blank');
      } catch (e: any) {
        alert(`gist backup failed: ${e.message}`);
      }
    });

    this.sidebar.querySelectorAll(".file-item .file-name").forEach(el => {
      el.addEventListener("click", () => {
        const id = Number((el.closest(".file-item") as HTMLElement).dataset["id"]);
        this.openFile(id);
      });

      el.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        const item = el.closest(".file-item") as HTMLElement;
        const id = Number(item.dataset["id"]);
        const current = (el as HTMLElement).textContent ?? "";
        const input = document.createElement("input");
        input.value = current;
        input.className = "file-rename-input";
        input.style.cssText = `
          background: var(--bg-surface);
          border: 1p solid var(--sccent-cyan);
          color: var(--fg);
          font-family: var(--font-mono);
          font-size: 12px;
          padding: 0 4px;
          border-radius: 3px;
          width: 100%;
          outline: none;
        `;
        el.replaceWith(input);
        input.focus();
        input.select();

        const commit = () => {
          const newName = input.value.trim();
          if (newName && newName !== current) {
            this.renameFile(id, newName);
          } else {
            this.renderSidebar();
          }
        };

        input.addEventListener("keydown", (e) => {
          e.stopPropagation();
          if (e.key === "Enter") commit();
          if (e.key === "Escape") this.renderSidebar();
        });
        input.addEventListener("blur", commit);
      });
    });

    this.sidebar.querySelectorAll(".btn-delete").forEach(el => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = Number((el as HTMLElement).dataset["id"]);
        if (confirm(`Delete file?`)) this.deleteFile(id);
      });
    });
  }

  private bindKeyboard(): void {
    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        this.saveCurrentFile();
      }
    });
  }
}