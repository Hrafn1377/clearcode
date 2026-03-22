import type { ClearCodeEditor } from "../editor/editor";

export class LivePreview {
    private editor: ClearCodeEditor;
    private frame: HTMLIFrameElement | null = null;
    private debounceTimer: ReturnType<typeof setTimeout> | null = null;
    private active: boolean = false;

    constructor(editor: ClearCodeEditor) {
        this.editor = editor;
        this.frame = document.getElementById("preview-frame") as HTMLIFrameElement | null;
    }

    toggle(): void {
        if (this.active) {
            this.disable();
        } else {
            this.enable();
        }
    }

    isActive(): boolean {
        return this.active;
    }

    enable(): void {
        if (!this.frame) return;
        this.active = true;
        this.frame.style.display = 'block';
        const btn = document.getElementById('preview-btn');
        if (btn) {
            btn.style.color = 'var(--accent-green)';
        }
        this.render();
    }

    update(): void {
        if (!this.active) return;
   if (this.debounceTimer) clearTimeout(this.debounceTimer);
   this.debounceTimer = setTimeout(() => this.render(), 300);
 }

 private render(): void {
   if (!this.frame) return;
   const content = this.editor.getContent();
   const doc = this.frame.contentDocument;
   if (!doc) return;
   doc.open();
   doc.write(content);
   doc.close();
 }

 disable(): void {
   if (!this.frame) return;
   this.active = false;
   this.frame.style.display = 'none';
   if (this.debounceTimer) clearTimeout(this.debounceTimer);
   const btn = document.getElementById('preview-btn');
   if (btn) {
     btn.style.color = '';
   }
 }
}