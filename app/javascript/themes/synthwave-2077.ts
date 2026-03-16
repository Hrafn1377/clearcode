import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { Extension } from "@codemirror/state";

// Synthwave '2077 — neon on dark
// Palette
const bg       = "#0d0d1a";
const bgPanel  = "#12122a";
const cursor   = "#ff2079";
const selection= "#2a1f4a";
const fg       = "#e2e2ff";

const neonPink    = "#ff2079";
const neonCyan    = "#00e5ff";
const neonYellow  = "#ffe600";
const neonPurple  = "#b45fcb";
const neonGreen   = "#39ff14";
const neonOrange  = "#ff6b35";
const dimGray     = "#6b6b8a";

export const synthwave2077Theme = EditorView.theme(
  {
    "&": {
      color: fg,
      backgroundColor: bg,
      fontFamily: "'Asimovian', 'Fira Code', 'JetBrains Mono', monospace",
      fontSize: "14px",
    },
    ".cm-content": { caretColor: cursor },
    ".cm-cursor": { borderLeftColor: cursor, borderLeftWidth: "2px" },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
      backgroundColor: selection,
    },
    ".cm-panels": { backgroundColor: bgPanel },
    ".cm-gutters": {
      backgroundColor: bgPanel,
      color: dimGray,
      border: "none",
      borderRight: `1px solid ${neonPurple}22`,
    },
    ".cm-lineNumbers .cm-gutterElement": { color: dimGray },
    ".cm-activeLine": { backgroundColor: `${neonPink}08` },
    ".cm-activeLineGutter": { backgroundColor: `${neonPink}12`, color: neonPink },
    ".cm-foldPlaceholder": { backgroundColor: neonPurple, color: bg, border: "none" },
    ".cm-tooltip": { backgroundColor: bgPanel, border: `1px solid ${neonPurple}` },
    ".cm-completionIcon": { color: neonCyan },
  },
  { dark: true }
);

export const synthwave2077Highlight = HighlightStyle.define([
  { tag: t.keyword,           color: neonPink,   fontWeight: "bold" },
  { tag: t.controlKeyword,    color: neonPink },
  { tag: t.operatorKeyword,   color: neonCyan },
  { tag: t.definitionKeyword, color: neonPurple },
  { tag: t.moduleKeyword,     color: neonPurple },
  { tag: t.string,            color: neonYellow },
  { tag: t.special(t.string), color: neonOrange },
  { tag: t.number,            color: neonCyan },
  { tag: t.bool,              color: neonPink },
  { tag: t.null,              color: dimGray },
  { tag: t.function(t.variableName), color: neonGreen },
  { tag: t.definition(t.variableName), color: neonGreen },
  { tag: t.typeName,          color: neonCyan,   fontStyle: "italic" },
  { tag: t.className,         color: neonYellow },
  { tag: t.propertyName,      color: fg },
  { tag: t.comment,           color: dimGray,    fontStyle: "italic" },
  { tag: t.lineComment,       color: dimGray,    fontStyle: "italic" },
  { tag: t.blockComment,      color: dimGray },
  { tag: t.operator,          color: neonCyan },
  { tag: t.punctuation,       color: fg },
  { tag: t.bracket,           color: neonPurple },
  { tag: t.angleBracket,      color: neonPink },
  { tag: t.tagName,           color: neonPink },
  { tag: t.attributeName,     color: neonCyan },
  { tag: t.attributeValue,    color: neonYellow },
  { tag: t.heading,           color: neonPink,   fontWeight: "bold" },
  { tag: t.emphasis,          fontStyle: "italic" },
  { tag: t.strong,            fontWeight: "bold" },
  { tag: t.link,              color: neonCyan,   textDecoration: "underline" },
  { tag: t.invalid,           color: neonOrange, textDecoration: "underline wavy" },
]);

export const synthwave2077: Extension = [
  synthwave2077Theme,
  syntaxHighlighting(synthwave2077Highlight),
];