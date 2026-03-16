import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { Extension } from "@codemirror/state";

const draculaColors = {
  bg:        "#282a36",
  bgPanel:   "#21222c",
  bgSurface: "#44475a",
  fg:        "#f8f8f2",
  fgMuted:   "#6272a4",
  cyan:      "#8be9fd",
  blue:      "#6272a4",
  teal:      "#8be9fd",
  green:     "#50fa7b",
  yellow:    "#f1fa8c",
  orange:    "#ffb86c",
  red:       "#ff5555",
  purple:    "#bd93f9",
  pink:      "#ff79c6",
};

const draculaTheme = EditorView.theme({
  "&": {
    backgroundColor: draculaColors.bg,
    color: draculaColors.fg,
    fontFamily: "var(--font-mono)",
    fontSize: "var(--font-size)",
  },
  ".cm-content": { caretColor: draculaColors.pink },
  ".cm-cursor": { borderLeftColor: draculaColors.pink },
  ".cm-selectionBackground, ::selection": { backgroundColor: draculaColors.bgSurface },
  ".cm-gutters": {
    backgroundColor: draculaColors.bgPanel,
    color: draculaColors.fgMuted,
    borderRight: `1px solid ${draculaColors.bgSurface}`,
  },
  ".cm-activeLineGutter": { backgroundColor: draculaColors.bgSurface },
  ".cm-activeLine": { backgroundColor: "#44475a44" },
  ".cm-lineNumbers": { color: draculaColors.fgMuted },
}, { dark: true });

const draculaHighlight = HighlightStyle.define([
  { tag: t.keyword,            color: draculaColors.pink },
  { tag: t.operator,           color: draculaColors.pink },
  { tag: t.string,             color: draculaColors.yellow },
  { tag: t.number,             color: draculaColors.purple },
  { tag: t.bool,               color: draculaColors.purple },
  { tag: t.comment,            color: draculaColors.fgMuted, fontStyle: "italic" },
  { tag: t.function(t.name),   color: draculaColors.green },
  { tag: t.className,          color: draculaColors.cyan },
  { tag: t.typeName,           color: draculaColors.cyan },
  { tag: t.propertyName,       color: draculaColors.fg },
  { tag: t.variableName,       color: draculaColors.fg },
  { tag: t.punctuation,        color: draculaColors.fg },
  { tag: t.meta,               color: draculaColors.orange },
]);

export const dracula: Extension = [draculaTheme, syntaxHighlighting(draculaHighlight)];