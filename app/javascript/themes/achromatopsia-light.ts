import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { Extension } from "@codemirror/state";

// Achromatopsia: complete colour blindness. Light mode version.
// No colour at all — differentiation through lightness contrast and font weight only.
const achromatopsiaLightColors = {
  bg:        "#f5f5f5",
  bgPanel:   "#ebebeb",
  bgSurface: "#d5d5d5",
  fg:        "#111111",
  fgMuted:   "#888888",
  dark:      "#000000",
  darkMid:   "#222222",
  mid:       "#555555",
  light:     "#777777",
  dim:       "#aaaaaa",
};

const achromatopsiaLightTheme = EditorView.theme({
  "&": {
    backgroundColor: achromatopsiaLightColors.bg,
    color: achromatopsiaLightColors.fg,
    fontFamily: "var(--font-mono)",
    fontSize: "var(--font-size)",
  },
  ".cm-content": { caretColor: achromatopsiaLightColors.dark },
  ".cm-cursor": { borderLeftColor: achromatopsiaLightColors.dark },
  ".cm-selectionBackground, ::selection": { backgroundColor: achromatopsiaLightColors.bgSurface },
  ".cm-gutters": {
    backgroundColor: achromatopsiaLightColors.bgPanel,
    color: achromatopsiaLightColors.fgMuted,
    borderRight: `1px solid ${achromatopsiaLightColors.bgSurface}`,
  },
  ".cm-activeLineGutter": { backgroundColor: achromatopsiaLightColors.bgSurface },
  ".cm-activeLine": { backgroundColor: "#d5d5d555" },
  ".cm-lineNumbers": { color: achromatopsiaLightColors.fgMuted },
}, { dark: false });

const achromatopsiaLightHighlight = HighlightStyle.define([
  { tag: t.keyword,            color: achromatopsiaLightColors.dark,    fontWeight: "bold" },
  { tag: t.operator,           color: achromatopsiaLightColors.darkMid },
  { tag: t.string,             color: achromatopsiaLightColors.mid,     fontStyle: "italic" },
  { tag: t.number,             color: achromatopsiaLightColors.mid },
  { tag: t.bool,               color: achromatopsiaLightColors.darkMid, fontWeight: "bold" },
  { tag: t.comment,            color: achromatopsiaLightColors.dim,     fontStyle: "italic" },
  { tag: t.function(t.name),   color: achromatopsiaLightColors.dark },
  { tag: t.className,          color: achromatopsiaLightColors.darkMid, fontWeight: "bold" },
  { tag: t.typeName,           color: achromatopsiaLightColors.darkMid },
  { tag: t.propertyName,       color: achromatopsiaLightColors.mid },
  { tag: t.variableName,       color: achromatopsiaLightColors.fg },
  { tag: t.punctuation,        color: achromatopsiaLightColors.fgMuted },
  { tag: t.meta,               color: achromatopsiaLightColors.light },
]);

export const achromatopsiaLight: Extension = [achromatopsiaLightTheme, syntaxHighlighting(achromatopsiaLightHighlight)];