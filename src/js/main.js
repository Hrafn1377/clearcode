import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { themes } from './themes.js';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { open, save } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile, readDir, rename, remove } from '@tauri-apps/plugin-fs';
import { python } from '@codemirror/lang-python';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { rust } from '@codemirror/lang-rust';
import { cpp } from '@codemirror/lang-cpp';
import { Decoration, ViewPlugin, WidgetType } from '@codemirror/view';
import { Command } from '@tauri-apps/plugin-shell';
import { search, searchKeymap, openSearchPanel, replaceAll } from '@codemirror/search';
import { keymap } from '@codemirror/view';

let editor;
let tabs = [];
let activeTabIndex = -1;
let currentTheme = 'one-dark';
let currentFontFamily = 'monospace';
let currentFontSize = 14;
let currentLineHeight = 1.5;
let currentLetterSpacing = 0;
let currentLineNumberStyle = 'arabic';
let currentFolder = null;
let numberSpacingEnabled = false;
let speechRate = 0.9;
let speechVoice = null;

function saveSettings() {
  const settings = {
    theme: currentTheme,
    fontFamily: window.currentFontFamily,
    fontSize: currentFontSize,
    lineHeight: currentLineHeight,
    letterSpacing: currentLetterSpacing,
    lineNumberStyle: currentLineNumberStyle,
    numberSpacing: numberSpacingEnabled,
    speechRate: speechRate,
    voice: window.currentVoice
  };
  localStorage.setItem('clearcode-settings', JSON.stringify(settings));
}

function loadSettings() {
  const saved = localStorage.getItem('clearcode-settings');
  if (saved) {
    const settings = JSON.parse(saved);
    currentTheme = settings.theme || 'one-dark';
    currentFontSize = settings.fontSize || 14;
    currentLineHeight = settings.lineHeight || 1.5;
    currentLetterSpacing = settings.letterSpacing || 0;
    currentLineNumberStyle = settings.lineNumberStyle || 'arabic';
    numberSpacingEnabled = settings.numberSpacing || false;
    speechRate = settings.speechRate || 0.9;

    window.currentTheme = currentTheme;
    window.currentFontFamily = settings.fontFamily || 'default';
    window.currentFontSize = currentFontSize;
    window.currentLineHeight = currentLineHeight;
    window.currentLetterSpacing = currentLetterSpacing;
    window.currentLineNumberStyle = currentLineNumberStyle;
    window.numberSpacingEnabled = numberSpacingEnabled;
    window.speechRate = speechRate;
    window.currentVoice = settings.voice || null;

    if (settings.fontFamily) {
      setFontFamily(settings.fontFamily);
    }

    if (settings.voice) {
      setTimeout(() => setVoiceByName(settings.voice), 100);
    }
  }
}

function getLanguage(path) {
  const ext = path.split('.').pop().toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return javascript();
    case 'html':
    case 'htm':
      return html();
    case 'css':
      return css();
    case 'py':
      return python();
    case 'json':
      return json();
    case 'md':
      return markdown();
    case 'rs':
      return rust();
    case 'c':
    case 'cpp':
    case 'h':
    case 'hpp':
      return cpp();
    default:
      return javascript();
  }
}

function createTab(path = null, content = '') {
  const tab = {
    id: Date.now(),
    path: path,
    name: path ? path.split('/').pop() : 'untitled',
    content: content,
    unsaved: false
  };
  tabs.push(tab);
  activeTabIndex = tabs.length - 1;
  window.activeTabIndex = activeTabIndex;
  renderTabs();
  initEditor(content, path ? getLanguage(path) : javascript());
}

function switchTab(index) {
  if (index === activeTabIndex) return;
  if (activeTabIndex >= 0 && tabs[activeTabIndex]) {
    tabs[activeTabIndex].content = editor.state.doc.toString();
  }
  activeTabIndex = index;
  window.activeTabIndex = activeTabIndex;
  const tab = tabs[index];
  initEditor(tab.content, tab.path ? getLanguage(tab.path) : javascript());
  renderTabs();
}

function closeTab(index) {
  tabs.splice(index, 1);
  if (tabs.length === 0) {
    createTab();
  } else if (activeTabIndex >= tabs.length) {
    activeTabIndex = tabs.length - 1;
    switchTab(activeTabIndex);
  } else if (index === activeTabIndex) {
    switchTab(Math.max(0, index));
  } else if (index < activeTabIndex) {
    activeTabIndex--;
  }
  window.activeTabIndex = activeTabIndex;
  renderTabs();
}

function renderTabs() {
  const tabBar = document.getElementById('tab-bar');
  tabBar.innerHTML = tabs.map((tab, i) => `
    <div class="tab ${i === activeTabIndex ? 'active' : ''}" data-index="${i}">
      <span class="tab-name">${tab.unsaved ? '● ' : ''}${tab.name}</span>
      <span class="tab-close" data-index="${i}">×</span>
    </div>
  `).join('');

  tabBar.querySelectorAll('.tab').forEach(el => {
    el.addEventListener('click', (e) => {
      if (!e.target.classList.contains('tab-close')) {
        switchTab(parseInt(el.dataset.index));
      }
    });

    el.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const index = parseInt(el.dataset.index);
      const tab = tabs[index];
      const items = [
        {
          label: 'Close',
          action: () => closeTab(index)
        }
      ];
      if (tab.path) {
        items.unshift({
          label: 'Rename',
          action: () => renameFile(tab.path, (newPath, newName) => {
            tab.path = newPath;
            tab.name = newName;
            renderTabs();
            if (currentFolder) renderFileTree(currentFolder);
          })
        });
      }
      createContextMenu(e.clientX, e.clientY, items);
    });
  });

  tabBar.querySelectorAll('.tab-close').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      closeTab(parseInt(el.dataset.index));
    });
  });
}

const activeLineHighlight = EditorView.theme({
  '.cm-activeLine': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    boxShadow: 'inset 3px 0 0 0 #61afef'
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)'
  }
});

class SpacedNumberWidget extends WidgetType {
  constructor(text) {
    super();
    this.text = text;
  }

  toDOM() {
    const span = document.createElement('span');
    span.textContent = this.text;
    span.style.letterSpacing = '0.15em';
    return span;
  }

  eq(other) {
    return this.text === other.text;
  }
}

function formatNumber(num) {
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

const numberSpacingPlugin = ViewPlugin.fromClass(class {
  constructor(view) {
    this.decorations = this.buildDecorations(view);
  }

  update(update) {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = this.buildDecorations(update.view);
    }
  }

  buildDecorations(view) {
    if (!numberSpacingEnabled) return Decoration.none;
    const widgets = [];
    const { from, to } = view.viewport;
    const text = view.state.doc.sliceString(from, to);
    const regex = /\b\d{4,}\b/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const start = from + match.index;
      const end = start + match[0].length;
      const formatted = formatNumber(match[0]);
      widgets.push(
        Decoration.replace({
          widget: new SpacedNumberWidget(formatted)
        }).range(start, end)
      );
    }
    return Decoration.set(widgets);
  }
}, {
  decorations: v => v.decorations
});

function initEditor(content = '', lang = javascript()) {
  const parent = document.getElementById('editor');
  parent.innerHTML = '';
  editor = new EditorView({
    doc: content,
    extensions: [
      basicSetup,
      lang,
      ...themes[currentTheme],
      activeLineHighlight,
      numberSpacingPlugin,
      search(),
      keymap.of(searchKeymap)
    ],
    parent: parent
  });
  setTimeout(applyFontSettings, 0);
}

function setTheme(themeName) {
  currentTheme = themeName;
  window.currentTheme = themeName;
  const tab = tabs[activeTabIndex];
  if (tab) {
    tab.content = editor.state.doc.toString();
    initEditor(tab.content, tab.path ? getLanguage(tab.path) : javascript());
  }
  saveSettings();
}

function applyFontSettings() {
  const cmContent = document.querySelector('.cm-content');
  const cmGutters = document.querySelector('.cm-gutters');
  if (cmContent) {
    cmContent.style.fontFamily = currentFontFamily;
    cmContent.style.fontSize = currentFontSize + 'px';
    cmContent.style.lineHeight = currentLineHeight;
    cmContent.style.letterSpacing = currentLetterSpacing + 'px';
  }
  if (cmGutters) {
    cmGutters.style.fontFamily = currentFontFamily;
    cmGutters.style.fontSize = currentFontSize + 'px';
    cmGutters.style.lineHeight = currentLineHeight;
  }
}

function setFontFamily(font) {
  const fonts = {
    'default': 'monospace',
    'fira-code': '"Fira Code", monospace',
    'jetbrains-mono': '"JetBrains Mono", monospace',
    'source-code-pro': '"Source Code Pro", monospace',
    'open-dyslexic': '"OpenDyslexic Mono", monospace'
  };
  currentFontFamily = fonts[font] || 'monospace';
  window.currentFontFamily = font;
  applyFontSettings();
  saveSettings();
}

function setFontSize(size) {
  currentFontSize = parseInt(size);
  window.currentFontSize = currentFontSize;
  applyFontSettings();
  saveSettings();
}

function setLineHeight(height) {
  currentLineHeight = parseFloat(height);
  window.currentLineHeight = currentLineHeight;
  applyFontSettings();
  saveSettings();
}

function setLetterSpacing(spacing) {
  currentLetterSpacing = parseFloat(spacing);
  window.currentLetterSpacing = currentLetterSpacing;
  applyFontSettings();
  saveSettings();
}

function setLineNumberStyle(style) {
  currentLineNumberStyle = style;
  window.currentLineNumberStyle = style;
  const gutters = document.querySelector('.cm-gutters');
  if (!gutters) return;
  const lineNumbers = gutters.querySelectorAll('.cm-lineNumbers .cm-gutterElement');
  lineNumbers.forEach((el, index) => {
    const num = index;
    if (num === 0) return;
    switch(style) {
      case 'roman':
        el.textContent = toRoman(num);
        break;
      case 'letters':
        el.textContent = toLetter(num);
        break;
      case 'none':
        el.style.visibility = 'hidden';
        break;
      default:
        el.textContent = num;
        el.style.visibility = 'visible';
    }
  });
  saveSettings();
}

function toRoman(num) {
  const roman = [
    ['m', 1000], ['cm', 900], ['d', 500], ['cd', 400],
    ['c', 100], ['xc', 90], ['l', 50], ['xl', 40],
    ['x', 10], ['ix', 9], ['v', 5], ['iv', 4], ['i', 1]
  ];
  let result = '';
  for (const [letter, value] of roman) {
    while (num >= value) {
      result += letter;
      num -= value;
    }
  }
  return result;
}

function toLetter(num) {
  let result = '';
  while (num > 0) {
    num--;
    result = String.fromCharCode(97 + (num % 26)) + result;
    num = Math.floor(num / 26);
  }
  return result;
}

function setNumberSpacing(enabled) {
  numberSpacingEnabled = enabled;
  window.numberSpacingEnabled = enabled;
  const tab = tabs[activeTabIndex];
  if (tab) {
    tab.content = editor.state.doc.toString();
    initEditor(tab.content, tab.path ? getLanguage(tab.path) : javascript());
  }
  saveSettings();
}

window.setTheme = setTheme;
window.setFontFamily = setFontFamily;
window.setFontSize = setFontSize;
window.setLineHeight = setLineHeight;
window.setLetterSpacing = setLetterSpacing;
window.setLineNumberStyle = setLineNumberStyle;
window.setNumberSpacing = setNumberSpacing;
window.currentTheme = currentTheme;
window.currentFontFamily = 'default';
window.currentFontSize = 14;
window.currentLineHeight = 1.5;
window.currentLetterSpacing = 0;
window.currentLineNumberStyle = 'arabic';
window.numberSpacingEnabled = false;

async function openFile() {
  const path = await open({
    multiple: false,
    directory: false
  });
  if (path) {
    const content = await readTextFile(path);
    createTab(path, content);
  }
}

async function saveFile() {
  const tab = tabs[activeTabIndex];
  let path = tab.path;
  if (!path) {
    path = await save({});
  }
  if (path) {
    const content = editor.state.doc.toString();
    await writeTextFile(path, content);
    tab.path = path;
    tab.name = path.split('/').pop();
    tab.content = content;
    tab.unsaved = false;
    renderTabs();
  }
}

function newFile() {
  createTab(null, '');
}

async function openFolder() {
  const path = await open({
    directory: true,
    multiple: false
  });
  if (path) {
    currentFolder = path;
    window.currentFolder = path;
    renderFileTree(path);
    updateGitUI();
  }
}

async function renderFileTree(folderPath) {
  const fileTree = document.getElementById('file-tree');
  fileTree.innerHTML = '<div class="file-item">Loading...</div>';

  try {
    const entries = await readDir(folderPath);
    const sorted = entries.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

    fileTree.innerHTML = sorted.map(entry => `
      <div class="file-item ${entry.isDirectory ? 'folder' : 'file'}" 
           data-path="${folderPath}/${entry.name}"
           data-is-dir="${entry.isDirectory}">
        <span class="file-icon">${entry.isDirectory ? '📁' : '📄'}</span>
        <span class="file-name">${entry.name}</span>
      </div>
    `).join('');

    fileTree.querySelectorAll('.file-item').forEach(el => {
      el.addEventListener('click', async () => {
        const path = el.dataset.path;
        const isDir = el.dataset.isDir === 'true';
        if (isDir) {
          renderFileTree(path);
        } else {
          const content = await readTextFile(path);
          createTab(path, content);
        }
      });

      el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const path = el.dataset.path;
        const isDir = el.dataset.isDir === 'true';
        const items = [
          {
            label: 'Rename',
            action: () => renameFile(path, () => {
              renderFileTree(currentFolder);
            })
          }
        ];
        if (!isDir) {
          items.push({
            label: 'Delete',
            action: () => deleteFile(path, () => {
              const tabIndex = tabs.findIndex(t => t.path === path);
              if (tabIndex >= 0) closeTab(tabIndex);
              renderFileTree(currentFolder);
            })
          });
        }
        createContextMenu(e.clientX, e.clientY, items);
      });
    });
  } catch (err) {
    fileTree.innerHTML = `<div class="file-item">Error: ${err.message}</div>`;
  }
}

window.openFile = openFile;
window.newFile = newFile;
window.saveFile = saveFile;
window.closeTab = closeTab;
window.openFolder = openFolder;

async function runGitCommand(args) {
  if (!currentFolder) return null;
  try {
    const command = Command.create('git', args, { cwd: currentFolder });
    const output = await command.execute();
    return output.stdout || output.stderr;
  } catch (err) {
    console.error('Git error:', err);
    return null;
  }
}

async function getGitStatus() {
  const status = await runGitCommand(['status', '--porcelain']);
  return status;
}

async function gitAdd(file = '.') {
  return await runGitCommand(['add', file]);
}

async function gitCommit(message) {
  return await runGitCommand(['commit', '-m', message]);
}

async function gitPush() {
  return await runGitCommand(['push']);
}

async function gitPull() {
  return await runGitCommand(['pull']);
}

async function getGitBranch() {
  const branch = await runGitCommand(['branch', '--show-current']);
  return branch ? branch.trim() : null;
}

async function updateGitUI() {
  if (!currentFolder) {
    document.getElementById('git-branch').textContent = '';
    document.getElementById('git-status').textContent = '';
    return;
  }
  const branch = await getGitBranch();
  const branchEl = document.getElementById('git-branch');
  if (branch) {
    branchEl.textContent = '⎇ ' + branch;
    branchEl.classList.add('branch');
  } else {
    branchEl.textContent = '';
  }
  const status = await getGitStatus();
  const statusEl = document.getElementById('git-status');
  if (status && status.trim()) {
    const lines = status.trim().split('\n');
    statusEl.textContent = `${lines.length} changed`;
  } else {
    statusEl.textContent = '✓ clean';
  }
}

window.runGitCommand = runGitCommand;
window.getGitStatus = getGitStatus;
window.gitAdd = gitAdd;
window.gitCommit = gitCommit;
window.gitPush = gitPush;
window.gitPull = gitPull;
window.getGitBranch = getGitBranch;
window.updateGitUI = updateGitUI;

let speechSynthesis = window.speechSynthesis;
let currentUtterance = null;

function speakText(text) {
  if (currentUtterance) {
    speechSynthesis.cancel();
  }
  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.rate = speechRate;
  if (speechVoice) {
    currentUtterance.voice = speechVoice;
  }
  currentUtterance.onend = () => {
    currentUtterance = null;
  };
  speechSynthesis.speak(currentUtterance);
}

function speakSelection() {
  if (!editor) return;
  const selection = editor.state.sliceDoc(
    editor.state.selection.main.from,
    editor.state.selection.main.to
  );
  if (selection) {
    speakText(selection);
  } else {
    const line = editor.state.doc.lineAt(editor.state.selection.main.head);
    speakText(line.text);
  }
}

function stopSpeaking() {
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
    currentUtterance = null;
  }
}

function getVoices() {
  return speechSynthesis.getVoices();
}

function setVoiceByName(name) {
  const voices = getVoices();
  speechVoice = voices.find(v => v.name === name) || null;
  window.currentVoice = name;
  saveSettings();
}

function setSpeechRate(rate) {
  speechRate = parseFloat(rate);
  window.speechRate = speechRate;
  saveSettings();
}

window.speakSelection = speakSelection;
window.stopSpeaking = stopSpeaking;
window.getVoices = getVoices;
window.setVoiceByName = setVoiceByName;
window.setSpeechRate = setSpeechRate;
window.speechRate = 0.9;
window.currentVoice = null;

// Context menu
function createContextMenu(x, y, items) {
  const existing = document.getElementById('context-menu');
  if (existing) existing.remove();

  const menu = document.createElement('div');
  menu.id = 'context-menu';
  menu.className = 'context-menu';
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';

  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'context-menu-item';
    el.textContent = item.label;
    el.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      menu.remove();
      item.action();
    });
    menu.appendChild(el);
  });

  document.body.appendChild(menu);

  const closeMenu = (e) => {
    if (!menu.contains(e.target)) {
      menu.remove();
      document.removeEventListener('mousedown', closeMenu);
    }
  };
  setTimeout(() => document.addEventListener('mousedown', closeMenu), 0);
}

function showPrompt(title, defaultValue) {
  return new Promise((resolve) => {
    const existing = document.getElementById('prompt-dialog');
    if (existing) existing.remove();

    const dialog = document.createElement('div');
    dialog.id = 'prompt-dialog';
    dialog.className = 'prompt-overlay';
    dialog.innerHTML = `
      <div class="prompt-box">
        <h3>${title}</h3>
        <input type="text" id="prompt-input" value="${defaultValue}">
        <div class="prompt-buttons">
          <button id="prompt-cancel">Cancel</button>
          <button id="prompt-ok">OK</button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    const input = dialog.querySelector('#prompt-input');
    input.focus();
    input.select();

    dialog.querySelector('#prompt-ok').addEventListener('click', () => {
      const value = input.value;
      dialog.remove();
      resolve(value);
    });

    dialog.querySelector('#prompt-cancel').addEventListener('click', () => {
      dialog.remove();
      resolve(null);
    });

    input.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        const value = input.value;
        dialog.remove();
        resolve(value);
      }
      if (e.key === 'Escape') {
        dialog.remove();
        resolve(null);
      }
    });
  });
}

function showConfirm(message) {
  return new Promise((resolve) => {
    const existing = document.getElementById('prompt-dialog');
    if (existing) existing.remove();

    const dialog = document.createElement('div');
    dialog.id = 'prompt-dialog';
    dialog.className = 'prompt-overlay';
    dialog.innerHTML = `
      <div class="prompt-box">
        <h3>${message}</h3>
        <div class="prompt-buttons">
          <button id="prompt-cancel">Cancel</button>
          <button id="prompt-ok">Delete</button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    dialog.querySelector('#prompt-ok').addEventListener('click', () => {
      dialog.remove();
      resolve(true);
    });

    dialog.querySelector('#prompt-cancel').addEventListener('click', () => {
      dialog.remove();
      resolve(false);
    });
  });
}

async function renameFile(oldPath, callback) {
  const oldName = oldPath.split('/').pop();
  const newName = await showPrompt('Rename to:', oldName);
  if (!newName || newName === oldName) return;

  const dir = oldPath.substring(0, oldPath.lastIndexOf('/'));
  const newPath = dir + '/' + newName;

  try {
    await rename(oldPath, newPath);
    if (callback) callback(newPath, newName);
  } catch (err) {
    console.error('Rename error:', err);
  }
}

async function deleteFile(path, callback) {
  const name = path.split('/').pop();
  const confirmed = await showConfirm('Delete "' + name + '"?');
  if (!confirmed) return;

  try {
    await remove(path);
    if (callback) callback();
  } catch (err) {
    console.error('Delete error:', err);
  }
}

document.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey) {
    if (e.key === 'n') { e.preventDefault(); newFile(); }
    if (e.key === 'o' && e.shiftKey) { e.preventDefault(); openFolder(); }
    if (e.key === 'o' && !e.shiftKey) { e.preventDefault(); openFile(); }
    if (e.key === 's') { e.preventDefault(); saveFile(); }
    if (e.key === 'w') { e.preventDefault(); closeTab(activeTabIndex); }
    if (e.key === 'p' && e.shiftKey) {
      e.preventDefault();
      document.getElementById('settings').toggle();
    }
    if (e.key === 'i' && e.shiftKey) {
      e.preventDefault();
      document.getElementById('git-panel').toggle();
    }
    if (e.key === 'r' && e.shiftKey) {
      e.preventDefault();
      speakSelection();
    }
    if (e.key === '/') {
      e.preventDefault();
      document.getElementById('shortcuts-panel').toggle();
    }
    if (e.key === '[' && e.shiftKey) {
      e.preventDefault();
      if (activeTabIndex > 0) switchTab(activeTabIndex - 1);
    }
    if (e.key === ']' && e.shiftKey) {
      e.preventDefault();
      if (activeTabIndex < tabs.length - 1) switchTab(activeTabIndex + 1);
    }
  }
  if (e.key === 'Escape') {
    stopSpeaking();
  }
});

loadSettings();
createTab(null, '// Welcome to ClearCode v2.0.0\n// Cmd+N new file, Cmd+O open, Cmd+S save, Cmd+W close tab, Cmd+/ to view shortcuts\n');