import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { Extension } from "@codemirror/state";

// Tritanopia: blue-blind. Light mode version.
// Safe colors: reds, magentas, greens, cyans. Avoid blue/yellow as meaningful contrast.
const tritanopiaLightColors = {
  bg:        "#fafafa",
  bgPanel:   "#f0f0f0",
  bgSurface: "#e0e0e0",
  fg:        "#1a1a1a",
  fgMuted:   "#757575",
  red:       "#c62828",
  redDim:    "#e53935",
  magenta:   "#ad1457",
  green:     "#2e7d32",
  greenDim:  "#388e3c",
  cyan:      "#00695c",
  lavender:  "#546e7a",
};

const tritanopiaLightTheme = EditorView.theme({
  "&": {
    backgroundColor: tritanopiaLightColors.bg,
    color: tritanopiaLightColors.fg,
    fontFamily: "var(--font-mono)",
    fontSize: "var(--font-size)",
  },
  ".cm-content": { caretColor: tritanopiaLightColors.magenta },
  ".cm-cursor": { borderLeftColor: tritanopiaLightColors.magenta },
  ".cm-selectionBackground, ::selection": { backgroundColor: tritanopiaLightColors.bgSurface },
  ".cm-gutters": {
    backgroundColor: tritanopiaLightColors.bgPanel,
    color: tritanopiaLightColors.fgMuted,
    borderRight: `1px solid ${tritanopiaLightColors.bgSurface}`,
  },
  ".cm-activeLineGutter": { backgroundColor: tritanopiaLightColors.bgSurface },
  ".cm-activeLine": { backgroundColor: "#e0e0e055" },
  ".cm-lineNumbers": { color: tritanopiaLightColors.fgMuted },
}, { dark: false });

const tritanopiaLightHighlight = HighlightStyle.define([
  { tag: t.keyword,            color: tritanopiaLightColors.magenta },
  { tag: t.operator,           color: tritanopiaLightColors.cyan },
  { tag: t.string,             color: tritanopiaLightColors.green },
  { tag: t.number,             color: tritanopiaLightColors.red },
  { tag: t.bool,               color: tritanopiaLightColors.red },
  { tag: t.comment,            color: tritanopiaLightColors.fgMuted, fontStyle: "italic" },
  { tag: t.function(t.name),   color: tritanopiaLightColors.greenDim },
  { tag: t.className,          color: tritanopiaLightColors.magenta },
  { tag: t.typeName,           color: tritanopiaLightColors.cyan },
  { tag: t.propertyName,       color: tritanopiaLightColors.lavender },
  { tag: t.variableName,       color: tritanopiaLightColors.fg },
  { tag: t.punctuation,        color: tritanopiaLightColors.fgMuted },
  { tag: t.meta,               color: tritanopiaLightColors.redDim },
]);

export const tritanopiaLight: Extension = [tritanopiaLightTheme, syntaxHighlighting(tritanopiaLightHighlight)];