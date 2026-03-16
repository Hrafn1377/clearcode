import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { Extension } from "@codemirror/state";

// Tritanopia: blue-blind. Cannot distinguish blues from greens, yellows from reds.
// Safe colors: reds, magentas, greens, cyans. Avoid blue/yellow as meaningful contrast.
const tritanopiaDarkColors = {
  bg:        "#1a1a1a",
  bgPanel:   "#121212",
  bgSurface: "#2d2d2d",
  fg:        "#f0f0f0",
  fgMuted:   "#7a7a7a",
  red:       "#ff6b6b",
  redDim:    "#e53935",
  magenta:   "#f48fb1",
  green:     "#69f0ae",
  greenDim:  "#00c853",
  cyan:      "#80cbc4",
  white:     "#ffffff",
  lavender:  "#b0bec5",
};

const tritanopiaDarkTheme = EditorView.theme({
  "&": {
    backgroundColor: tritanopiaDarkColors.bg,
    color: tritanopiaDarkColors.fg,
    fontFamily: "var(--font-mono)",
    fontSize: "var(--font-size)",
  },
  ".cm-content": { caretColor: tritanopiaDarkColors.magenta },
  ".cm-cursor": { borderLeftColor: tritanopiaDarkColors.magenta },
  ".cm-selectionBackground, ::selection": { backgroundColor: tritanopiaDarkColors.bgSurface },
  ".cm-gutters": {
    backgroundColor: tritanopiaDarkColors.bgPanel,
    color: tritanopiaDarkColors.fgMuted,
    borderRight: `1px solid ${tritanopiaDarkColors.bgSurface}`,
  },
  ".cm-activeLineGutter": { backgroundColor: tritanopiaDarkColors.bgSurface },
  ".cm-activeLine": { backgroundColor: "#2d2d2d55" },
  ".cm-lineNumbers": { color: tritanopiaDarkColors.fgMuted },
}, { dark: true });

const tritanopiaDarkHighlight = HighlightStyle.define([
  { tag: t.keyword,            color: tritanopiaDarkColors.magenta },
  { tag: t.operator,           color: tritanopiaDarkColors.cyan },
  { tag: t.string,             color: tritanopiaDarkColors.green },
  { tag: t.number,             color: tritanopiaDarkColors.red },
  { tag: t.bool,               color: tritanopiaDarkColors.red },
  { tag: t.comment,            color: tritanopiaDarkColors.fgMuted, fontStyle: "italic" },
  { tag: t.function(t.name),   color: tritanopiaDarkColors.greenDim },
  { tag: t.className,          color: tritanopiaDarkColors.magenta },
  { tag: t.typeName,           color: tritanopiaDarkColors.cyan },
  { tag: t.propertyName,       color: tritanopiaDarkColors.lavender },
  { tag: t.variableName,       color: tritanopiaDarkColors.fg },
  { tag: t.punctuation,        color: tritanopiaDarkColors.fgMuted },
  { tag: t.meta,               color: tritanopiaDarkColors.redDim },
]);

export const tritanopiaDark: Extension = [tritanopiaDarkTheme, syntaxHighlighting(tritanopiaDarkHighlight)];