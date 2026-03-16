import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { Extension } from "@codemirror/state";

// Achromatopsia: complete colour blindness. Sees only in shades of grey.
// No colour at all — differentiation is achieved through lightness contrast only.
const achromatopsiaDarkColors = {
  bg:        "#0a0a0a",
  bgPanel:   "#141414",
  bgSurface: "#2a2a2a",
  fg:        "#e8e8e8",
  fgMuted:   "#666666",
  bright:    "#ffffff",
  light:     "#cccccc",
  mid:       "#999999",
  dim:       "#555555",
  dark:      "#333333",
};

const achromatopsiaDarkTheme = EditorView.theme({
  "&": {
    backgroundColor: achromatopsiaDarkColors.bg,
    color: achromatopsiaDarkColors.fg,
    fontFamily: "var(--font-mono)",
    fontSize: "var(--font-size)",
  },
  ".cm-content": { caretColor: achromatopsiaDarkColors.bright },
  ".cm-cursor": { borderLeftColor: achromatopsiaDarkColors.bright },
  ".cm-selectionBackground, ::selection": { backgroundColor: achromatopsiaDarkColors.bgSurface },
  ".cm-gutters": {
    backgroundColor: achromatopsiaDarkColors.bgPanel,
    color: achromatopsiaDarkColors.fgMuted,
    borderRight: `1px solid ${achromatopsiaDarkColors.bgSurface}`,
  },
  ".cm-activeLineGutter": { backgroundColor: achromatopsiaDarkColors.bgSurface },
  ".cm-activeLine": { backgroundColor: "#2a2a2a55" },
  ".cm-lineNumbers": { color: achromatopsiaDarkColors.fgMuted },
}, { dark: true });

const achromatopsiaDarkHighlight = HighlightStyle.define([
  { tag: t.keyword,            color: achromatopsiaDarkColors.bright,  fontWeight: "bold" },
  { tag: t.operator,           color: achromatopsiaDarkColors.light },
  { tag: t.string,             color: achromatopsiaDarkColors.light,   fontStyle: "italic" },
  { tag: t.number,             color: achromatopsiaDarkColors.mid },
  { tag: t.bool,               color: achromatopsiaDarkColors.mid,     fontWeight: "bold" },
  { tag: t.comment,            color: achromatopsiaDarkColors.dim,     fontStyle: "italic" },
  { tag: t.function(t.name),   color: achromatopsiaDarkColors.bright },
  { tag: t.className,          color: achromatopsiaDarkColors.light,   fontWeight: "bold" },
  { tag: t.typeName,           color: achromatopsiaDarkColors.light },
  { tag: t.propertyName,       color: achromatopsiaDarkColors.mid },
  { tag: t.variableName,       color: achromatopsiaDarkColors.fg },
  { tag: t.punctuation,        color: achromatopsiaDarkColors.fgMuted },
  { tag: t.meta,               color: achromatopsiaDarkColors.mid },
]);

export const achromatopsiaDark: Extension = [achromatopsiaDarkTheme, syntaxHighlighting(achromatopsiaDarkHighlight)];