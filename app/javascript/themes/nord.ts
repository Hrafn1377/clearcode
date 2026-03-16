import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { Extension } from "@codemirror/state";

const nordColors = {
  bg:        "#2e3440",
  bgPanel:   "#3b4252",
  bgSurface: "#434c5e",
  fg:        "#d8dee9",
  fgMuted:   "#4c566a",
  cyan:      "#88c0d0",
  blue:      "#81a1c1",
  teal:      "#8fbcbb",
  green:     "#a3be8c",
  yellow:    "#ebcb8b",
  orange:    "#d08770",
  red:       "#bf616a",
  purple:    "#b48ead",
};

const nordTheme = EditorView.theme({
  "&": {
    backgroundColor: nordColors.bg,
    color: nordColors.fg,
    fontFamily: "var(--font-mono)",
    fontSize: "var(--font-size)",
  },
  ".cm-content": { caretColor: nordColors.cyan },
  ".cm-cursor": { borderLeftColor: nordColors.cyan },
  ".cm-selectionBackground, ::selection": { backgroundColor: nordColors.bgSurface },
  ".cm-gutters": {
    backgroundColor: nordColors.bgPanel,
    color: nordColors.fgMuted,
    borderRight: `1px solid ${nordColors.bgSurface}`,
  },
  ".cm-activeLineGutter": { backgroundColor: nordColors.bgSurface },
  ".cm-activeLine": { backgroundColor: "#3b425244" },
  ".cm-lineNumbers": { color: nordColors.fgMuted },
}, { dark: true });

const nordHighlight = HighlightStyle.define([
  { tag: t.keyword,            color: nordColors.blue },
  { tag: t.operator,           color: nordColors.teal },
  { tag: t.string,             color: nordColors.green },
  { tag: t.number,             color: nordColors.purple },
  { tag: t.bool,               color: nordColors.orange },
  { tag: t.comment,            color: nordColors.fgMuted, fontStyle: "italic" },
  { tag: t.function(t.name),   color: nordColors.cyan },
  { tag: t.className,          color: nordColors.yellow },
  { tag: t.typeName,           color: nordColors.teal },
  { tag: t.propertyName,       color: nordColors.fg },
  { tag: t.variableName,       color: nordColors.fg },
  { tag: t.punctuation,        color: nordColors.fgMuted },
  { tag: t.meta,               color: nordColors.orange },
]);

export const nord: Extension = [nordTheme, syntaxHighlighting(nordHighlight)];