import { EditorState, Extension, Compartment } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, highlightActiveLine } from "@codemirror/view";
import { defaultKeymap, historyKeymap, history } from "@codemirror/commands";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { autocompletion, completionKeymap } from "@codemirror/autocomplete";
import { indentOnInput, bracketMatching, foldGutter } from "@codemirror/language";
import { javascript } from "@codemirror/lang-javascript";
import type { ThemeManager } from "../themes/theme-manager";
import { detectLanguage } from "../utils/language-detect";

const langCompartment = new Compartment();
const themeCompartment = new Compartment();

export class ClearCodeEditor {
    private view: EditorView;
    private themeManager: ThemeManager;

    constructor(host: HTMLElement, themeManager: ThemeManager) {
        this.themeManager = themeManager;

        const state = EditorState.create({
            doc: "",
            extensions: this.buildExtensions(),
        });

        this.view = new EditorView({
            state,
            parent: host,
        });

        this.themeManager.onChange((id) => {
            this.setTheme(this.themeManager.currentExtension());
        });
    }

    private buildExtensions(): Extension[] {
        return [
            lineNumbers(),
            highlightActiveLine(),
            history(),
            foldGutter(),
            indentOnInput(),
            bracketMatching(),
            highlightSelectionMatches(),
            autocompletion(),
            keymap.of([
                ...defaultKeymap,
                ...historyKeymap,
                ...searchKeymap,
                ...completionKeymap,
            ]),
            langCompartment.of(javascript()),
            themeCompartment.of(this.themeManager.currentExtension()),
            EditorView.updateListener.of((update) => {
                if (update.selectionSet || update.docChanged) {
                    const cursor = update.state.selection.main.head;
                    const line = update.state.doc.lineAt(cursor);
                    const col = cursor - line.from + 1;
                    const statusCursor = document.getElementById("status-cursor");
                    if (statusCursor) statusCursor.textContent = `Ln ${line.number}, Col ${col}`;    
                }
            }),
            EditorView.lineWrapping,
        ];
    }

    getContent(): string {
        return this.view.state.doc.toString();
    }

    setContent(content: string): void {
        this.view.dispatch({
            changes: { from: 0, to: this.view.state.doc.length, insert: content },
        });
    }

    setLanguage(filename: string): void {
        const lang = detectLanguage(filename);
        if (!lang) return;
        this.view.dispatch({
            effects: langCompartment.reconfigure(lang),
        });
    }

    destroy(): void {
        this.view.destroy();
    }

    setTheme(extension: Extension): void {
        this.view.dispatch({
            effects: themeCompartment.reconfigure(extension),
        });
    }
}