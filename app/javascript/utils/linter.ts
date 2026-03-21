import { linter, Diagnostic } from "@codemirror/lint";
import { EditorView } from "@codemirror/view";

export function jsLinter() {
  return linter((view: EditorView): Diagnostic[] => {
    const code = view.state.doc.toString();
    const diagnostics: Diagnostic[] = [];

    const addDiagnostic = (index: number, length: number, message: string, severity: "error" | "warning" | "info") => {
      diagnostics.push({ from: index, to: index + length, severity, message, source: "ClearCode" });
    };

    // Prefer const/let over var
    const varRegex = /\bvar\b/g;
    let match;
    while ((match = varRegex.exec(code)) !== null) {
      addDiagnostic(match.index, 3, "Prefer 'const' or 'let' over 'var'", "warning");
    }

    // Detect console.log
    const consoleRegex = /\bconsole\.log\b/g;
    while ((match = consoleRegex.exec(code)) !== null) {
      addDiagnostic(match.index, 11, "Remove console.log before committing", "info");
    }

    // Detect debugger statement
    const debuggerRegex = /\bdebugger\b/g;
    while ((match = debuggerRegex.exec(code)) !== null) {
      addDiagnostic(match.index, 8, "Remove debugger statement", "error");
    }

    // Detect TODO/FIXME comments
    const todoRegex = /\/\/\s*(TODO|FIXME|HACK|XXX):/gi;
    while ((match = todoRegex.exec(code)) !== null) {
      addDiagnostic(match.index, match[0].length, `${match[1]} comment — remember to address this`, "info");
    }

    // Detect triple equals suggestion
    const doubleEqRegex = /[^=!<>]==[^=]/g;
    while ((match = doubleEqRegex.exec(code)) !== null) {
      addDiagnostic(match.index + 1, 2, "Prefer '===' over '=='", "warning");
    }

    // Detect empty catch blocks
    const emptyCatchRegex = /catch\s*\([^)]*\)\s*\{\s*\}/g;
    while ((match = emptyCatchRegex.exec(code)) !== null) {
      addDiagnostic(match.index, match[0].length, "Empty catch block — handle or log the error", "warning");
    }

    return diagnostics;
  });
}