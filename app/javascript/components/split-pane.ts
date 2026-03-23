import { ClearCodeEditor } from "../editor/editor";
import { ThemeManager } from "../themes/theme-manager";

export class SplitPane {
  private active: boolean = false;
  private secondEditor: ClearCodeEditor | null = null;
  private secondHost: HTMLElement | null = null;
  private themeManager: ThemeManager;
  private csrfToken: string;
  private currentFileId: number | null = null;

  constructor(themeManager: ThemeManager) {
    this.themeManager = themeManager;
    this.csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
  }

  toggle(): void {
    if (this.active) {
      this.close();
    } else {
      this.open();
    }
  }

  isActive(): boolean {
    return this.active;
  }

  open(): void {
    const container = document.getElementById('editor-preview-container');
    if (!container) return;

    this.secondHost = document.createElement('div');
    this.secondHost.id = 'editor-host-2';
    this.secondHost.style.cssText = `
      flex: 1;
      overflow: hidden;
      background: var(--bg);
      height: 100%;
      min-height: 0;
      min-width: 0;
      border-left: 1px solid var(--border);
    `;

    container.appendChild(this.secondHost);
    this.secondEditor = new ClearCodeEditor(this.secondHost, this.themeManager);
    this.active = true;

    // Add file picker header
    const header = document.createElement('div');
    header.id = 'split-header';
    header.style.cssText = `
      position: absolute;
      top: 0;
      right: 0;
      z-index: 10;
      background: var(--bg-panel);
      border: 1px solid var(--border);
      border-radius: 0 0 0 4px;
      padding: 0.25rem 0.5rem;
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--fg-muted);
      cursor: pointer;
    `;
    header.textContent = '+ Open file in split';
    header.addEventListener('click', () => this.promptOpenFile());
    this.secondHost.style.position = 'relative';
    this.secondHost.appendChild(header);
  }

  close(): void {
    if (this.secondEditor) {
      this.secondEditor.destroy();
      this.secondEditor = null;
    }
    if (this.secondHost) {
      this.secondHost.remove();
      this.secondHost = null;
    }
    this.active = false;
  }

  private async promptOpenFile(): Promise<void> {
    const res = await fetch('/code_files', {
      headers: { 'X-CSRF-Token': this.csrfToken },
    });
    const files = await res.json() as Array<{ id: number; name: string; language: string }>;

    if (files.length === 0) {
      alert('No files available.');
      return;
    }

    const fileList = files.map((f, i) => `${i + 1}. ${f.name}`).join('\n');
    const input = prompt(`Choose a file to open in split pane:\n\n${fileList}\n\nEnter number:`);
    if (!input) return;

    const index = parseInt(input) - 1;
    const file = files[index];
    if (!file) return;

    await this.openFile(file.id, file.name);
  }

  private async openFile(id: number, name: string): Promise<void> {
    if (!this.secondEditor) return;

    const res = await fetch(`/code_files/${id}`, {
      headers: { 'X-CSRF-Token': this.csrfToken },
    });
    const file = await res.json() as { content: string; language: string };

    this.secondEditor.setContent(file.content ?? '');
    this.secondEditor.setLanguage(name);
    this.currentFileId = id;

    const header = document.getElementById('split-header');
    if (header) header.textContent = name;
  }

  getSecondEditor(): ClearCodeEditor | null {
    return this.secondEditor;
  }
}
