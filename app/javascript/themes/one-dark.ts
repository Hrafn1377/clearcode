import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { Extension } from "@codemirror/state";

const oneDarkColors = {
  bg:        "#282c34",
  bgPanel:   "#21252b",
  bgSurface: "#2c313a",
  fg:        "#abb2bf",
  fgMuted:   "#4b5263",
  cyan:      "#56b6c2",
  blue:      "#61afef",
  teal:      "#56b6c2",
  green:     "#98c379",
  yellow:    "#e5c07b",
  orange:    "#d19a66",
  red:       "#e06c75",
  purple:    "#c678dd",
  pink:      "#e06c75",
};

const oneDarkTheme = EditorView.theme({
  "&": {
    backgroundColor: oneDarkColors.bg,
    color: oneDarkColors.fg,
    fontFamily: "var(--font-mono)",
    fontSize: "var(--font-size)",
  },
  ".cm-content": { caretColor: oneDarkColors.blue },
  ".cm-cursor": { borderLeftColor: oneDarkColors.blue },
  ".cm-selectionBackground, ::selection": { backgroundColor: oneDarkColors.bgSurface },
  ".cm-gutters": {
    backgroundColor: oneDarkColors.bgPanel,
    color: oneDarkColors.fgMuted,
    borderRight: `1px solid ${oneDarkColors.bgSurface}`,
  },
  ".cm-activeLineGutter": { backgroundColor: oneDarkColors.bgSurface },
  ".cm-activeLine": { backgroundColor: "#2c313a88" },
  ".cm-lineNumbers": { color: oneDarkColors.fgMuted },
}, { dark: true });

const oneDarkHighlight = HighlightStyle.define([
  { tag: t.keyword,            color: oneDarkColors.purple },
  { tag: t.operator,           color: oneDarkColors.cyan },
  { tag: t.string,             color: oneDarkColors.green },
  { tag: t.number,             color: oneDarkColors.orange },
  { tag: t.bool,               color: oneDarkColors.orange },
  { tag: t.comment,            color: oneDarkColors.fgMuted, fontStyle: "italic" },
  { tag: t.function(t.name),   color: oneDarkColors.blue },
  { tag: t.className,          color: oneDarkColors.yellow },
  { tag: t.typeName,           color: oneDarkColors.yellow },
  { tag: t.propertyName,       color: oneDarkColors.red },
  { tag: t.variableName,       color: oneDarkColors.fg },
  { tag: t.punctuation,        color: oneDarkColors.fg },
  { tag: t.meta,               color: oneDarkColors.orange },
]);

export const oneDark: Extension = [oneDarkTheme, syntaxHighlighting(oneDarkHighlight)];