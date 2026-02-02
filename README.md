# ClearCode v2.0.0

An accessibility-focused code editor built with Tauri and CodeMirror 6.

![ClearCode Screenshot](screenshot.png)

## Features

- **15 Colorblind-Friendly Themes** - Carefully selected for various types of color vision
- **Text-to-Speech** - Read code aloud with adjustable voice and speed
- **Dyslexia Support** - OpenDyslexic font option
- **Customizable Display** - Font family, size, line height, letter spacing
- **Alternative Line Numbers** - Arabic, Roman numerals, or letters
- **Number Spacing** - Visual separation for large numbers (dyscalculia support)
- **Full Git Integration** - Stage, commit, push, pull from the UI
- **Multi-Tab Editor** - Work on multiple files simultaneously
- **Native Menu Bar** - Standard macOS/Windows menus with keyboard shortcuts
- **Syntax Highlighting** - JavaScript, HTML, CSS, Python, JSON, Markdown, Rust, C++

## Installation

### macOS (Apple Silicon)
Download `ClearCode-v2.0.0-macos-arm64.zip` from [Releases](../../releases), unzip, and drag to Applications.

### Build from Source
```bash
cd src
npm install
cd ../src-tauri
cargo tauri build
```

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| New File | ⌘N |
| Open File | ⌘O |
| Open Folder | ⌘⇧O |
| Save | ⌘S |
| Close Tab | ⌘W |
| Previous Tab | ⌘⇧[ |
| Next Tab | ⌘⇧] |
| Find | ⌘F |
| Settings | ⌘⇧P |
| Git Panel | ⌘⇧I |
| Shortcuts | ⌘/ |
| Read Aloud | ⌘⇧R |
| Stop Reading | Esc |

## Philosophy

"Accessibility by intention" - Every feature is designed with accessibility in mind, drawing from personal experience with tritanopia and understanding of various accessibility challenges.

## Tech Stack

- **Tauri v2** - Rust-based desktop framework
- **CodeMirror 6** - Modern code editor
- **Vanilla JavaScript** - No framework bloat

## License

MIT

## Support

If you find ClearCode useful, consider [buying me a coffee](https://buymeacoffee.com/hrafn1377) ☕
