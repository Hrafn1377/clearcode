import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { Extension } from "@codemirror/state";

// Protanopia: red-blind. Cannot distinguish reds from greens.
// Safe colors: blues, yellows, whites. Avoid red/green as meaningful contrast.
const protanopiaDarkColors = {
  bg:        "#1a1a2e",
  bgPanel:   "#16213e",
  bgSurface: "#0f3460",
  fg:        "#e0e0f0",
  fgMuted:   "#7a7a9a",
  blue:      "#4fc3f7",
  blueLight: "#81d4fa",
  yellow:    "#fff176",
  yellowDim: "#f9a825",
  white:     "#ffffff",
  grey:      "#9e9e9e",
  teal:      "#80cbc4",
  lavender:  "#b0bec5",
};

const protanopiaDarkTheme = EditorView.theme({
  "&": {
    backgroundColor: protanopiaDarkColors.bg,
    color: protanopiaDarkColors.fg,
    fontFamily: "var(--font-mono)",
    fontSize: "var(--font-size)",
  },
  ".cm-content": { caretColor: protanopiaDarkColors.yellow },
  ".cm-cursor": { borderLeftColor: protanopiaDarkColors.yellow },
  ".cm-selectionBackground, ::selection": { backgroundColor: protanopiaDarkColors.bgSurface },
  ".cm-gutters": {
    backgroundColor: protanopiaDarkColors.bgPanel,
    color: protanopiaDarkColors.fgMuted,
    borderRight: `1px solid ${protanopiaDarkColors.bgSurface}`,
  },
  ".cm-activeLineGutter": { backgroundColor: protanopiaDarkColors.bgSurface },
  ".cm-activeLine": { backgroundColor: "#0f346033" },
  ".cm-lineNumbers": { color: protanopiaDarkColors.fgMuted },
}, { dark: true });

const protanopiaDarkHighlight = HighlightStyle.define([
  { tag: t.keyword,            color: protanopiaDarkColors.yellow },
  { tag: t.operator,           color: protanopiaDarkColors.teal },
  { tag: t.string,             color: protanopiaDarkColors.blueLight },
  { tag: t.number,             color: protanopiaDarkColors.yellowDim },
  { tag: t.bool,               color: protanopiaDarkColors.yellowDim },
  { tag: t.comment,            color: protanopiaDarkColors.fgMuted, fontStyle: "italic" },
  { tag: t.function(t.name),   color: protanopiaDarkColors.blue },
  { tag: t.className,          color: protanopiaDarkColors.yellow },
  { tag: t.typeName,           color: protanopiaDarkColors.teal },
  { tag: t.propertyName,       color: protanopiaDarkColors.lavender },
  { tag: t.variableName,       color: protanopiaDarkColors.fg },
  { tag: t.punctuation,        color: protanopiaDarkColors.fgMuted },
  { tag: t.meta,               color: protanopiaDarkColors.yellowDim },
]);

export const protanopiaDark: Extension = [protanopiaDarkTheme, syntaxHighlighting(protanopiaDarkHighlight)];