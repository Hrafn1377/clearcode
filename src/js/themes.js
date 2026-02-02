import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

// Theme builder function
function createTheme(name, colors) {
  const theme = EditorView.theme({
    '&': {
      backgroundColor: colors.background,
      color: colors.foreground
    },
    '.cm-content': {
      caretColor: colors.cursor
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: colors.cursor
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
      backgroundColor: colors.selection
    },
    '.cm-gutters': {
      backgroundColor: colors.gutterBackground,
      color: colors.gutterForeground,
      border: 'none'
    },
    '.cm-activeLineGutter': {
      backgroundColor: colors.activeLineGutter
    },
    '.cm-activeLine': {
      backgroundColor: colors.activeLine
    },
    '.cm-line': {
      padding: '0 4px'
    }
  }, { dark: colors.dark });

  const highlighting = HighlightStyle.define([
    { tag: tags.keyword, color: colors.keyword },
    { tag: tags.comment, color: colors.comment, fontStyle: 'italic' },
    { tag: tags.string, color: colors.string },
    { tag: tags.number, color: colors.number },
    { tag: tags.function(tags.variableName), color: colors.function },
    { tag: tags.variableName, color: colors.variable },
    { tag: tags.definition(tags.variableName), color: colors.variable },
    { tag: tags.operator, color: colors.operator },
    { tag: tags.bool, color: colors.boolean },
    { tag: tags.null, color: colors.null },
    { tag: tags.className, color: colors.class },
    { tag: tags.propertyName, color: colors.property },
    { tag: tags.tagName, color: colors.tag },
    { tag: tags.attributeName, color: colors.attribute },
    { tag: tags.typeName, color: colors.type }
  ]);

  return [theme, syntaxHighlighting(highlighting)];
}

// ============ DARK THEMES ============

export const oneDark = createTheme('one-dark', {
  dark: true,
  background: '#282c34',
  foreground: '#abb2bf',
  cursor: '#528bff',
  selection: '#3e4451',
  gutterBackground: '#282c34',
  gutterForeground: '#5c6370',
  activeLineGutter: '#2c313c',
  activeLine: '#2c313c',
  keyword: '#c678dd',
  comment: '#5c6370',
  string: '#98c379',
  number: '#d19a66',
  function: '#61afef',
  variable: '#e06c75',
  operator: '#56b6c2',
  boolean: '#d19a66',
  null: '#d19a66',
  class: '#e5c07b',
  property: '#e06c75',
  tag: '#e06c75',
  attribute: '#d19a66',
  type: '#e5c07b'
});

export const dracula = createTheme('dracula', {
  dark: true,
  background: '#282a36',
  foreground: '#f8f8f2',
  cursor: '#f8f8f2',
  selection: '#44475a',
  gutterBackground: '#282a36',
  gutterForeground: '#6272a4',
  activeLineGutter: '#44475a',
  activeLine: '#44475a',
  keyword: '#ff79c6',
  comment: '#6272a4',
  string: '#f1fa8c',
  number: '#bd93f9',
  function: '#50fa7b',
  variable: '#f8f8f2',
  operator: '#ff79c6',
  boolean: '#bd93f9',
  null: '#bd93f9',
  class: '#8be9fd',
  property: '#50fa7b',
  tag: '#ff79c6',
  attribute: '#50fa7b',
  type: '#8be9fd'
});

export const synthwave = createTheme('synthwave', {
  dark: true,
  background: '#262335',
  foreground: '#ffffff',
  cursor: '#ff7edb',
  selection: '#463465',
  gutterBackground: '#262335',
  gutterForeground: '#848bbd',
  activeLineGutter: '#34294f',
  activeLine: '#34294f',
  keyword: '#fede5d',
  comment: '#848bbd',
  string: '#ff8b39',
  number: '#f97e72',
  function: '#36f9f6',
  variable: '#ff7edb',
  operator: '#fede5d',
  boolean: '#f97e72',
  null: '#f97e72',
  class: '#36f9f6',
  property: '#72f1b8',
  tag: '#ff7edb',
  attribute: '#fede5d',
  type: '#36f9f6'
});

export const nord = createTheme('nord', {
  dark: true,
  background: '#2e3440',
  foreground: '#d8dee9',
  cursor: '#d8dee9',
  selection: '#434c5e',
  gutterBackground: '#2e3440',
  gutterForeground: '#4c566a',
  activeLineGutter: '#3b4252',
  activeLine: '#3b4252',
  keyword: '#81a1c1',
  comment: '#616e88',
  string: '#a3be8c',
  number: '#b48ead',
  function: '#88c0d0',
  variable: '#d8dee9',
  operator: '#81a1c1',
  boolean: '#b48ead',
  null: '#b48ead',
  class: '#8fbcbb',
  property: '#d8dee9',
  tag: '#81a1c1',
  attribute: '#8fbcbb',
  type: '#8fbcbb'
});

export const tokyoNight = createTheme('tokyo-night', {
  dark: true,
  background: '#1a1b26',
  foreground: '#a9b1d6',
  cursor: '#c0caf5',
  selection: '#33467c',
  gutterBackground: '#1a1b26',
  gutterForeground: '#3b4261',
  activeLineGutter: '#24283b',
  activeLine: '#24283b',
  keyword: '#bb9af7',
  comment: '#565f89',
  string: '#9ece6a',
  number: '#ff9e64',
  function: '#7aa2f7',
  variable: '#c0caf5',
  operator: '#89ddff',
  boolean: '#ff9e64',
  null: '#ff9e64',
  class: '#2ac3de',
  property: '#73daca',
  tag: '#f7768e',
  attribute: '#bb9af7',
  type: '#2ac3de'
});

export const gruvboxDark = createTheme('gruvbox-dark', {
  dark: true,
  background: '#282828',
  foreground: '#ebdbb2',
  cursor: '#ebdbb2',
  selection: '#504945',
  gutterBackground: '#282828',
  gutterForeground: '#7c6f64',
  activeLineGutter: '#3c3836',
  activeLine: '#3c3836',
  keyword: '#fb4934',
  comment: '#928374',
  string: '#b8bb26',
  number: '#d3869b',
  function: '#b8bb26',
  variable: '#83a598',
  operator: '#fe8019',
  boolean: '#d3869b',
  null: '#d3869b',
  class: '#fabd2f',
  property: '#83a598',
  tag: '#fb4934',
  attribute: '#fabd2f',
  type: '#fabd2f'
});

export const monokai = createTheme('monokai', {
  dark: true,
  background: '#272822',
  foreground: '#f8f8f2',
  cursor: '#f8f8f2',
  selection: '#49483e',
  gutterBackground: '#272822',
  gutterForeground: '#75715e',
  activeLineGutter: '#3e3d32',
  activeLine: '#3e3d32',
  keyword: '#f92672',
  comment: '#75715e',
  string: '#e6db74',
  number: '#ae81ff',
  function: '#a6e22e',
  variable: '#f8f8f2',
  operator: '#f92672',
  boolean: '#ae81ff',
  null: '#ae81ff',
  class: '#66d9ef',
  property: '#a6e22e',
  tag: '#f92672',
  attribute: '#a6e22e',
  type: '#66d9ef'
});

// ============ LIGHT THEMES ============

export const oneLight = createTheme('one-light', {
  dark: false,
  background: '#fafafa',
  foreground: '#383a42',
  cursor: '#526fff',
  selection: '#e5e5e6',
  gutterBackground: '#fafafa',
  gutterForeground: '#9d9d9f',
  activeLineGutter: '#f0f0f0',
  activeLine: '#f0f0f0',
  keyword: '#a626a4',
  comment: '#a0a1a7',
  string: '#50a14f',
  number: '#986801',
  function: '#4078f2',
  variable: '#e45649',
  operator: '#0184bc',
  boolean: '#986801',
  null: '#986801',
  class: '#c18401',
  property: '#e45649',
  tag: '#e45649',
  attribute: '#986801',
  type: '#c18401'
});

export const githubLight = createTheme('github-light', {
  dark: false,
  background: '#ffffff',
  foreground: '#24292e',
  cursor: '#24292e',
  selection: '#c8e1ff',
  gutterBackground: '#ffffff',
  gutterForeground: '#babbbc',
  activeLineGutter: '#f6f8fa',
  activeLine: '#f6f8fa',
  keyword: '#d73a49',
  comment: '#6a737d',
  string: '#032f62',
  number: '#005cc5',
  function: '#6f42c1',
  variable: '#24292e',
  operator: '#d73a49',
  boolean: '#005cc5',
  null: '#005cc5',
  class: '#6f42c1',
  property: '#005cc5',
  tag: '#22863a',
  attribute: '#6f42c1',
  type: '#6f42c1'
});

export const solarizedLight = createTheme('solarized-light', {
  dark: false,
  background: '#fdf6e3',
  foreground: '#657b83',
  cursor: '#657b83',
  selection: '#eee8d5',
  gutterBackground: '#fdf6e3',
  gutterForeground: '#93a1a1',
  activeLineGutter: '#eee8d5',
  activeLine: '#eee8d5',
  keyword: '#859900',
  comment: '#93a1a1',
  string: '#2aa198',
  number: '#d33682',
  function: '#268bd2',
  variable: '#b58900',
  operator: '#657b83',
  boolean: '#d33682',
  null: '#d33682',
  class: '#cb4b16',
  property: '#268bd2',
  tag: '#268bd2',
  attribute: '#b58900',
  type: '#cb4b16'
});

// ============ HIGH CONTRAST ============

export const highContrastDark = createTheme('high-contrast-dark', {
  dark: true,
  background: '#000000',
  foreground: '#ffffff',
  cursor: '#ffffff',
  selection: '#264f78',
  gutterBackground: '#000000',
  gutterForeground: '#858585',
  activeLineGutter: '#1a1a1a',
  activeLine: '#1a1a1a',
  keyword: '#c586c0',
  comment: '#6a9955',
  string: '#ce9178',
  number: '#b5cea8',
  function: '#dcdcaa',
  variable: '#9cdcfe',
  operator: '#d4d4d4',
  boolean: '#569cd6',
  null: '#569cd6',
  class: '#4ec9b0',
  property: '#9cdcfe',
  tag: '#569cd6',
  attribute: '#9cdcfe',
  type: '#4ec9b0'
});

export const highContrastLight = createTheme('high-contrast-light', {
  dark: false,
  background: '#ffffff',
  foreground: '#000000',
  cursor: '#000000',
  selection: '#add6ff',
  gutterBackground: '#ffffff',
  gutterForeground: '#000000',
  activeLineGutter: '#f0f0f0',
  activeLine: '#f0f0f0',
  keyword: '#af00db',
  comment: '#008000',
  string: '#a31515',
  number: '#098658',
  function: '#795e26',
  variable: '#001080',
  operator: '#000000',
  boolean: '#0000ff',
  null: '#0000ff',
  class: '#267f99',
  property: '#001080',
  tag: '#800000',
  attribute: '#e50000',
  type: '#267f99'
});

// ============ COLORBLIND OPTIMIZED ============

export const tritanopiaDark = createTheme('tritanopia-dark', {
  dark: true,
  background: '#1e1e1e',
  foreground: '#d4d4d4',
  cursor: '#d4d4d4',
  selection: '#264f78',
  gutterBackground: '#1e1e1e',
  gutterForeground: '#858585',
  activeLineGutter: '#2a2a2a',
  activeLine: '#2a2a2a',
  keyword: '#ff6b6b',
  comment: '#888888',
  string: '#ffd93d',
  number: '#ff8c42',
  function: '#4ecdc4',
  variable: '#d4d4d4',
  operator: '#ff6b6b',
  boolean: '#ff8c42',
  null: '#ff8c42',
  class: '#4ecdc4',
  property: '#ffd93d',
  tag: '#ff6b6b',
  attribute: '#ffd93d',
  type: '#4ecdc4'
});

export const protanopiaDark = createTheme('protanopia-dark', {
  dark: true,
  background: '#1e1e1e',
  foreground: '#d4d4d4',
  cursor: '#d4d4d4',
  selection: '#264f78',
  gutterBackground: '#1e1e1e',
  gutterForeground: '#858585',
  activeLineGutter: '#2a2a2a',
  activeLine: '#2a2a2a',
  keyword: '#ffd700',
  comment: '#888888',
  string: '#87ceeb',
  number: '#ffa500',
  function: '#40e0d0',
  variable: '#d4d4d4',
  operator: '#ffd700',
  boolean: '#ffa500',
  null: '#ffa500',
  class: '#40e0d0',
  property: '#87ceeb',
  tag: '#ffd700',
  attribute: '#87ceeb',
  type: '#40e0d0'
});

export const deuteranopiaDark = createTheme('deuteranopia-dark', {
  dark: true,
  background: '#1e1e1e',
  foreground: '#d4d4d4',
  cursor: '#d4d4d4',
  selection: '#264f78',
  gutterBackground: '#1e1e1e',
  gutterForeground: '#858585',
  activeLineGutter: '#2a2a2a',
  activeLine: '#2a2a2a',
  keyword: '#ffa07a',
  comment: '#888888',
  string: '#87cefa',
  number: '#f0e68c',
  function: '#00ced1',
  variable: '#d4d4d4',
  operator: '#ffa07a',
  boolean: '#f0e68c',
  null: '#f0e68c',
  class: '#00ced1',
  property: '#87cefa',
  tag: '#ffa07a',
  attribute: '#87cefa',
  type: '#00ced1'
});

// Theme map for easy lookup
export const themes = {
  'one-dark': oneDark,
  'dracula': dracula,
  'synthwave': synthwave,
  'nord': nord,
  'tokyo-night': tokyoNight,
  'gruvbox-dark': gruvboxDark,
  'monokai': monokai,
  'one-light': oneLight,
  'github-light': githubLight,
  'solarized-light': solarizedLight,
  'high-contrast-dark': highContrastDark,
  'high-contrast-light': highContrastLight,
  'tritanopia-dark': tritanopiaDark,
  'protanopia-dark': protanopiaDark,
  'deuteranopia-dark': deuteranopiaDark
};