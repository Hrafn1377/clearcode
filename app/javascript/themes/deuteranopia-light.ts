import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { Extension } from "@codemirror/state";

// Deuteranopia: green-blind. Light mode version.
// Safe colors: blues, yellows, oranges. Avoid green as meaningful contrast.
const deuteranopiaLightColors = {
  bg:        "#f5f5ff",
  bgPanel:   "#e8e8f8",
  bgSurface: "#d0d0e8",
  fg:        "#1a1a2e",
  fgMuted:   "#6a6a8a",
  blue:      "#1565c0",
  blueLight: "#1976d2",
  yellow:    "#f57f17",
  orange:    "#e65100",
  orangeDim: "#ef6c00",
  teal:      "#00838f",
  lavender:  "#455a64",
};

const deuteranopiaLightTheme = EditorView.theme({
  "&": {
    backgroundColor: deuteranopiaLightColors.bg,
    color: deuteranopiaLightColors.fg,
    fontFamily: "var(--font-mono)",
    fontSize: "var(--font-size)",
  },
  ".cm-content": { caretColor: deuteranopiaLightColors.blue },
  ".cm-cursor": { borderLeftColor: deuteranopiaLightColors.blue },
  ".cm-selectionBackground, ::selection": { backgroundColor: deuteranopiaLightColors.bgSurface },
  ".cm-gutters": {
    backgroundColor: deuteranopiaLightColors.bgPanel,
    color: deuteranopiaLightColors.fgMuted,
    borderRight: `1px solid ${deuteranopiaLightColors.bgSurface}`,
  },
  ".cm-activeLineGutter": { backgroundColor: deuteranopiaLightColors.bgSurface },
  ".cm-activeLine": { backgroundColor: "#d0d0e855" },
  ".cm-lineNumbers": { color: deuteranopiaLightColors.fgMuted },
}, { dark: false });

const deuteranopiaLightHighlight = HighlightStyle.define([
  { tag: t.keyword,            color: deuteranopiaLightColors.yellow },
  { tag: t.operator,           color: deuteranopiaLightColors.teal },
  { tag: t.string,             color: deuteranopiaLightColors.blueLight },
  { tag: t.number,             color: deuteranopiaLightColors.orange },
  { tag: t.bool,               color: deuteranopiaLightColors.orange },
  { tag: t.comment,            color: deuteranopiaLightColors.fgMuted, fontStyle: "italic" },
  { tag: t.function(t.name),   color: deuteranopiaLightColors.blue },
  { tag: t.className,          color: deuteranopiaLightColors.yellow },
  { tag: t.typeName,           color: deuteranopiaLightColors.teal },
  { tag: t.propertyName,       color: deuteranopiaLightColors.lavender },
  { tag: t.variableName,       color: deuteranopiaLightColors.fg },
  { tag: t.punctuation,        color: deuteranopiaLightColors.fgMuted },
  { tag: t.meta,               color: deuteranopiaLightColors.orangeDim },
]);

export const deuteranopiaLight: Extension = [deuteranopiaLightTheme, syntaxHighlighting(deuteranopiaLightHighlight)];