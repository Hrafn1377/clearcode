import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { Extension } from "@codemirror/state";

// Protanopia: red-blind. Light mode version.
// Safe colors: blues, yellows, dark neutrals. Avoid red/green as meaningful contrast.
const protanopiaLightColors = {
  bg:        "#f5f5ff",
  bgPanel:   "#e8e8f8",
  bgSurface: "#d0d0e8",
  fg:        "#1a1a2e",
  fgMuted:   "#6a6a8a",
  blue:      "#1565c0",
  blueLight: "#1976d2",
  yellow:    "#f57f17",
  yellowDim: "#f9a825",
  teal:      "#00695c",
  lavender:  "#455a64",
};

const protanopiaLightTheme = EditorView.theme({
  "&": {
    backgroundColor: protanopiaLightColors.bg,
    color: protanopiaLightColors.fg,
    fontFamily: "var(--font-mono)",
    fontSize: "var(--font-size)",
  },
  ".cm-content": { caretColor: protanopiaLightColors.blue },
  ".cm-cursor": { borderLeftColor: protanopiaLightColors.blue },
  ".cm-selectionBackground, ::selection": { backgroundColor: protanopiaLightColors.bgSurface },
  ".cm-gutters": {
    backgroundColor: protanopiaLightColors.bgPanel,
    color: protanopiaLightColors.fgMuted,
    borderRight: `1px solid ${protanopiaLightColors.bgSurface}`,
  },
  ".cm-activeLineGutter": { backgroundColor: protanopiaLightColors.bgSurface },
  ".cm-activeLine": { backgroundColor: "#d0d0e855" },
  ".cm-lineNumbers": { color: protanopiaLightColors.fgMuted },
}, { dark: false });

const protanopiaLightHighlight = HighlightStyle.define([
  { tag: t.keyword,            color: protanopiaLightColors.yellow },
  { tag: t.operator,           color: protanopiaLightColors.teal },
  { tag: t.string,             color: protanopiaLightColors.blueLight },
  { tag: t.number,             color: protanopiaLightColors.yellowDim },
  { tag: t.bool,               color: protanopiaLightColors.yellowDim },
  { tag: t.comment,            color: protanopiaLightColors.fgMuted, fontStyle: "italic" },
  { tag: t.function(t.name),   color: protanopiaLightColors.blue },
  { tag: t.className,          color: protanopiaLightColors.yellow },
  { tag: t.typeName,           color: protanopiaLightColors.teal },
  { tag: t.propertyName,       color: protanopiaLightColors.lavender },
  { tag: t.variableName,       color: protanopiaLightColors.fg },
  { tag: t.punctuation,        color: protanopiaLightColors.fgMuted },
  { tag: t.meta,               color: protanopiaLightColors.yellowDim },
]);

export const protanopiaLight: Extension = [protanopiaLightTheme, syntaxHighlighting(protanopiaLightHighlight)];