import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { Extension } from "@codemirror/state";

const solarizedDarkColors = {
  bg:        "#002b36",
  bgPanel:   "#073642",
  bgSurface: "#094652",
  fg:        "#839496",
  fgMuted:   "#586e75",
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

const solarizedDarkTheme = EditorView.theme({
  "&": {
    backgroundColor: solarizedDarkColors.bg,
    color: solarizedDarkColors.fg,
    fontFamily: "var(--font-mono)",
    fontSize: "var(--font-size)",
  },
  ".cm-content": { caretColor: solarizedDarkColors.cyan },
  ".cm-cursor": { borderLeftColor: solarizedDarkColors.cyan },
  ".cm-selectionBackground, ::selection": { backgroundColor: solarizedDarkColors.bgSurface },
  ".cm-gutters": {
    backgroundColor: solarizedDarkColors.bgPanel,
    color: solarizedDarkColors.fgMuted,
    borderRight: `1px solid ${solarizedDarkColors.bgSurface}`,
  },
  ".cm-activeLineGutter": { backgroundColor: solarizedDarkColors.bgSurface },
  ".cm-activeLine": { backgroundColor: "#07364288" },
  ".cm-lineNumbers": { color: solarizedDarkColors.fgMuted },
}, { dark: true });

const solarizedDarkHighlight = HighlightStyle.define([
  { tag: t.keyword,            color: solarizedDarkColors.green },
  { tag: t.operator,           color: solarizedDarkColors.cyan },
  { tag: t.string,             color: solarizedDarkColors.cyan },
  { tag: t.number,             color: solarizedDarkColors.cyan },
  { tag: t.bool,               color: solarizedDarkColors.orange },
  { tag: t.comment,            color: solarizedDarkColors.fgMuted, fontStyle: "italic" },
  { tag: t.function(t.name),   color: solarizedDarkColors.blue },
  { tag: t.className,          color: solarizedDarkColors.yellow },
  { tag: t.typeName,           color: solarizedDarkColors.yellow },
  { tag: t.propertyName,       color: solarizedDarkColors.blue },
  { tag: t.variableName,       color: solarizedDarkColors.fg },
  { tag: t.punctuation,        color: solarizedDarkColors.fgMuted },
  { tag: t.meta,               color: solarizedDarkColors.orange },
]);

export const solarizedDark: Extension = [solarizedDarkTheme, syntaxHighlighting(solarizedDarkHighlight)];