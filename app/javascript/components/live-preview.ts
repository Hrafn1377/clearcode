import type { ClearCodeEditor } from "../editor/editor";

export class LivePreview {
    private editor: ClearCodeEditor;
    private frame: HTMLIFrameElement | null = null;
    private debounceTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(editor: ClearCodeEditor) {
        this.editor = editor;
        this.frame = document.getElementById("preview-frame") as HTMLIFrameElement | null;
    }

    enable(): void {
        // Hook into CodeMirror update listener 
        this.update();
    }

    private update(): void {
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
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
    }
}