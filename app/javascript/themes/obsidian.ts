import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { Extension } from "@codemirror/state";

const obsidianColors = {
  bg:        "#1e1e2e",
  bgPanel:   "#181825",
  bgSurface: "#313244",
  fg:        "#cdd6f4",
  fgMuted:   "#585b70",
  cyan:      "#89dceb",
  blue:      "#89b4fa",
  teal:      "#94e2d5",
  green:     "#a6e3a1",
  yellow:    "#f9e2af",
  orange:    "#fab387",
  red:       "#f38ba8",
  purple:    "#cba6f7",
  pink:      "#f5c2e7",
};

const obsidianTheme = EditorView.theme({
  "&": {
    backgroundColor: obsidianColors.bg,
    color: obsidianColors.fg,
    fontFamily: "var(--font-mono)",
    fontSize: "var(--font-size)",
  },
  ".cm-content": { caretColor: obsidianColors.purple },
  ".cm-cursor": { borderLeftColor: obsidianColors.purple },
  ".cm-selectionBackground, ::selection": { backgroundColor: obsidianColors.bgSurface },
  ".cm-gutters": {
    backgroundColor: obsidianColors.bgPanel,
    color: obsidianColors.fgMuted,
    borderRight: `1px solid ${obsidianColors.bgSurface}`,
  },
  ".cm-activeLineGutter": { backgroundColor: obsidianColors.bgSurface },
  ".cm-activeLine": { backgroundColor: "#31324488" },
  ".cm-lineNumbers": { color: obsidianColors.fgMuted },
}, { dark: true });

const obsidianHighlight = HighlightStyle.define([
  { tag: t.keyword,            color: obsidianColors.purple },
  { tag: t.operator,           color: obsidianColors.teal },
  { tag: t.string,             color: obsidianColors.green },
  { tag: t.number,             color: obsidianColors.orange },
  { tag: t.bool,               color: obsidianColors.orange },
  { tag: t.comment,            color: obsidianColors.fgMuted, fontStyle: "italic" },
  { tag: t.function(t.name),   color: obsidianColors.blue },
  { tag: t.className,          color: obsidianColors.yellow },
  { tag: t.typeName,           color: obsidianColors.cyan },
  { tag: t.propertyName,       color: obsidianColors.fg },
  { tag: t.variableName,       color: obsidianColors.fg },
  { tag: t.punctuation,        color: obsidianColors.fgMuted },
  { tag: t.meta,               color: obsidianColors.pink },
]);

export const obsidian: Extension = [obsidianTheme, syntaxHighlighting(obsidianHighlight)];