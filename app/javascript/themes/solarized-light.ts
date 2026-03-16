import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { Extension } from "@codemirror/state";

const solarizedLightColors = {
  bg:        "#fdf6e3",
  bgPanel:   "#eee8d5",
  bgSurface: "#e5dfc8",
  fg:        "#657b83",
  fgMuted:   "#93a1a1",
  cyan:      "#2aa198",
  blue:      "#268bd2",
  teal:      "#2aa198",
  green:     "#859900",
  yellow:    "#b58900",
  orange:    "#cb4b16",
  red:       "#dc322f",
  purple:    "#6c71c4",
  pink:      "#d33682",
};

const solarizedLightTheme = EditorView.theme({
  "&": {
    backgroundColor: solarizedLightColors.bg,
    color: solarizedLightColors.fg,
    fontFamily: "var(--font-mono)",
    fontSize: "var(--font-size)",
  },
  ".cm-content": { caretColor: solarizedLightColors.cyan },
  ".cm-cursor": { borderLeftColor: solarizedLightColors.cyan },
  ".cm-selectionBackground, ::selection": { backgroundColor: solarizedLightColors.bgSurface },
  ".cm-gutters": {
    backgroundColor: solarizedLightColors.bgPanel,
    color: solarizedLightColors.fgMuted,
    borderRight: `1px solid ${solarizedLightColors.bgSurface}`,
  },
  ".cm-activeLineGutter": { backgroundColor: solarizedLightColors.bgSurface },
  ".cm-activeLine": { backgroundColor: "#eee8d588" },
  ".cm-lineNumbers": { color: solarizedLightColors.fgMuted },
}, { dark: false });

const solarizedLightHighlight = HighlightStyle.define([
  { tag: t.keyword,            color: solarizedLightColors.green },
  { tag: t.operator,           color: solarizedLightColors.cyan },
  { tag: t.string,             color: solarizedLightColors.cyan },
  { tag: t.number,             color: solarizedLightColors.cyan },
  { tag: t.bool,               color: solarizedLightColors.orange },
  { tag: t.comment,            color: solarizedLightColors.fgMuted, fontStyle: "italic" },
  { tag: t.function(t.name),   color: solarizedLightColors.blue },
  { tag: t.className,          color: solarizedLightColors.yellow },
  { tag: t.typeName,           color: solarizedLightColors.yellow },
  { tag: t.propertyName,       color: solarizedLightColors.blue },
  { tag: t.variableName,       color: solarizedLightColors.fg },
  { tag: t.punctuation,        color: solarizedLightColors.fgMuted },
  { tag: t.meta,               color: solarizedLightColors.orange },
]);

export const solarizedLight: Extension = [solarizedLightTheme, syntaxHighlighting(solarizedLightHighlight)];