import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { Extension } from "@codemirror/state";

// Deuteranopia: green-blind. Cannot distinguish greens from reds.
// Safe colors: blues, yellows, oranges. Avoid green as meaningful contrast.
const deuteranopiaDarkColors = {
  bg:        "#1a1a2e",
  bgPanel:   "#16213e",
  bgSurface: "#1a3a5c",
  fg:        "#e0e0f0",
  fgMuted:   "#7a7a9a",
  blue:      "#4fc3f7",
  blueLight: "#81d4fa",
  yellow:    "#fff176",
  orange:    "#ffb74d",
  orangeDim: "#f57c00",
  teal:      "#80deea",
  lavender:  "#b0bec5",
};

const deuteranopiaDarkTheme = EditorView.theme({
  "&": {
    backgroundColor: deuteranopiaDarkColors.bg,
    color: deuteranopiaDarkColors.fg,
    fontFamily: "var(--font-mono)",
    fontSize: "var(--font-size)",
  },
  ".cm-content": { caretColor: deuteranopiaDarkColors.yellow },
  ".cm-cursor": { borderLeftColor: deuteranopiaDarkColors.yellow },
  ".cm-selectionBackground, ::selection": { backgroundColor: deuteranopiaDarkColors.bgSurface },
  ".cm-gutters": {
    backgroundColor: deuteranopiaDarkColors.bgPanel,
    color: deuteranopiaDarkColors.fgMuted,
    borderRight: `1px solid ${deuteranopiaDarkColors.bgSurface}`,
  },
  ".cm-activeLineGutter": { backgroundColor: deuteranopiaDarkColors.bgSurface },
  ".cm-activeLine": { backgroundColor: "#1a3a5c33" },
  ".cm-lineNumbers": { color: deuteranopiaDarkColors.fgMuted },
}, { dark: true });

const deuteranopiaDarkHighlight = HighlightStyle.define([
  { tag: t.keyword,            color: deuteranopiaDarkColors.yellow },
  { tag: t.operator,           color: deuteranopiaDarkColors.teal },
  { tag: t.string,             color: deuteranopiaDarkColors.blueLight },
  { tag: t.number,             color: deuteranopiaDarkColors.orange },
  { tag: t.bool,               color: deuteranopiaDarkColors.orange },
  { tag: t.comment,            color: deuteranopiaDarkColors.fgMuted, fontStyle: "italic" },
  { tag: t.function(t.name),   color: deuteranopiaDarkColors.blue },
  { tag: t.className,          color: deuteranopiaDarkColors.yellow },
  { tag: t.typeName,           color: deuteranopiaDarkColors.teal },
  { tag: t.propertyName,       color: deuteranopiaDarkColors.lavender },
  { tag: t.variableName,       color: deuteranopiaDarkColors.fg },
  { tag: t.punctuation,        color: deuteranopiaDarkColors.fgMuted },
  { tag: t.meta,               color: deuteranopiaDarkColors.orangeDim },
]);

export const deuteranopiaDark: Extension = [deuteranopiaDarkTheme, syntaxHighlighting(deuteranopiaDarkHighlight)];