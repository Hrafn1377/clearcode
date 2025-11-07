# 🎨 ClearCode - Coding Without Barriers

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-stable-brightgreen)

**A beautiful, accessible, feature-rich code editor built for everyone.**

ClearCode is a web-based code editor with professional features, stunning themes, and comprehensive accessibility support. Write code without barriers.

---

## ✨ Features

### 🎨 **15 Professional Themes**
- Light & Dark modes
- Synthwave '84, Tokyo Night, Nord
- Material Theme, Dracula, Gruvbox
- One Dark Pro, Monokai Pro, Palenight
- Cobalt2, Night Owl, Ayu Dark, Atom One Dark

### 📁 **Multi-File Management**
- Work on multiple files simultaneously
- Tab-based interface
- Sidebar file explorer
- Auto-save functionality

### ✨ **Smart Editor**
- Syntax highlighting (JavaScript, HTML, CSS)
- Active line highlighting
- Line numbers
- Find & replace with regex support
- Auto-indentation

### 🐛 **Debug Panel**
- Console capture (logs, errors, warnings)
- Performance metrics
- Execution time tracking
- Filter by message type
- **Keyboard Shortcut:** F12

### 🔊 **Text-to-Speech**
- Read code aloud
- Customizable voice, speed, pitch, volume
- Read current line, selection, or entire file
- **Keyboard Shortcuts:** F7, F8

### 👁️ **Live Preview**
- Real-time HTML/CSS/JS rendering
- Draggable, resizable floating panel
- Auto-combines project files
- Instant updates as you type

### 🔀 **Git Integration**
- Initialize repositories
- Commit changes
- GitHub connection
- Branch management
- Push/Pull support

### ♿ **Accessibility First**
- Dyslexia mode with OpenDyslexic font
- 9 font options (Fira Code, JetBrains Mono, etc.)
- Adjustable font size, line height, spacing
- High contrast themes
- Full keyboard navigation

### 🎓 **Interactive Tutorial**
- Version-aware walkthrough system
- 16-step complete tutorial
- "What's New" for updates
- Spotlight animations
- **Keyboard Shortcut:** F9

### ⌨️ **Keyboard Shortcuts**
- Complete shortcut system
- VS Code-inspired hotkeys
- Press F1 for full list
- Mouse-free workflow

---

## 🚀 Quick Start

### Option 1: Use Online (Easiest)
1. Visit the [live demo](#) (add your GitHub Pages link)
2. Start coding immediately!

### Option 2: Run Locally
```bash
# Clone the repository
git clone https://github.com/YOUR-USERNAME/clearcode.git

# Navigate to the directory
cd clearcode

# Open in browser
# Just open index.html in your web browser!
# No build process required - it's pure HTML/CSS/JS
```

That's it! ClearCode runs entirely in the browser with **zero dependencies**. 🎉

---

## 📸 Screenshots

### Editor with Synthwave Theme
![ClearCode Editor](screenshots/editor-synthwave.png)

### Debug Panel
![Debug Panel](screenshots/debug-panel.png)

### Interactive Tutorial
![Tutorial System](screenshots/tutorial.png)

*(Add screenshots to a `/screenshots` folder in your repo)*

---

## 🎯 Use Cases

- **Learning to Code** - Perfect for beginners with the interactive tutorial
- **Quick Prototyping** - Test ideas without opening a full IDE
- **Accessibility Testing** - Multiple fonts and dyslexia support
- **Teaching** - Use live preview to demonstrate concepts
- **Portable Coding** - Works on any device with a browser

---

## 🎨 Themes Preview

| Theme | Description |
|-------|-------------|
| **Synthwave '84** | Retro neon aesthetic with pink/cyan glow |
| **Tokyo Night** | Deep blue with vibrant purple accents |
| **Dracula** | Dark theme with pastel highlights |
| **Gruvbox** | Warm, retro colors |
| **Material Theme** | Clean, modern Google Material design |

*...and 10 more beautiful themes!*

---

## ⌨️ Keyboard Shortcuts

| Action | Shortcut | Description |
|--------|----------|-------------|
| **File Operations** | | |
| New File | `Ctrl+N` | Create a new file |
| Open File | `Ctrl+O` | Open file from disk |
| Save File | `Ctrl+S` | Save current file |
| Close File | `Ctrl+W` | Close current file |
| **Editing** | | |
| Undo | `Ctrl+Z` | Undo last change |
| Redo | `Ctrl+Y` | Redo last undo |
| Find | `Ctrl+F` | Open find & replace |
| Toggle Comment | `Ctrl+/` | Comment/uncomment line |
| **Code Execution** | | |
| Run Code | `Ctrl+Enter` or `F5` | Execute JavaScript |
| Clear Console | `Ctrl+Shift+K` | Clear console output |
| **Tools** | | |
| Debug Panel | `F12` | Toggle debug console |
| Text-to-Speech | `F8` | Open TTS panel |
| Read Line | `F7` | Read current line aloud |
| Tutorial | `F9` | Start tutorial |
| Shortcuts Help | `F1` | Show all shortcuts |

*Full list available by pressing **F1** in the app.*

---

## 🛠️ Technology Stack

- **Frontend:** Pure HTML5, CSS3, JavaScript (ES6+)
- **No frameworks required** - Vanilla JS for maximum performance
- **No build process** - Just open and run
- **No dependencies** - Everything is self-contained
- **Browser-based** - Works on any modern browser

**Supported Browsers:**
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

---

## 🗂️ Project Structure

```
clearcode/
├── index.html          # Main HTML file
├── style.css           # Complete CSS (themes, layout, components)
├── script.js           # All JavaScript functionality
├── icon.png            # ClearCode logo
└── README.md           # This file
```

**That's it!** Three main files. No complex build setup. 🎯

---

## 🎓 Tutorial System

ClearCode includes an **interactive version-aware tutorial** that:

- **New Users:** Get a complete 16-step walkthrough
- **Returning Users:** See "What's New" for version updates
- **Smart Detection:** Automatically shows appropriate tutorial
- **Press F9:** Restart tutorial anytime

The tutorial system highlights UI elements with beautiful spotlight animations and guides users through every feature.

---

## ♿ Accessibility Features

ClearCode is built with accessibility in mind:

### Visual
- **15 high-contrast themes**
- **Dyslexia mode** with OpenDyslexic font
- **Adjustable font sizes** (10px - 32px)
- **Customizable spacing** (line height, letter spacing, word spacing)
- **Active line highlighting** for easier tracking

### Auditory
- **Text-to-Speech** for code reading
- **Multiple voice options**
- **Adjustable speed and pitch**

### Motor
- **Full keyboard navigation**
- **Large clickable targets**
- **No mouse required** - complete keyboard workflow

### Cognitive
- **Clear visual hierarchy**
- **Interactive tutorial**
- **Consistent UI patterns**
- **Helpful tooltips everywhere**

---

## 🐛 Debug Features

The debug panel includes:

- **Console Capture** - Intercepts all console.log(), error(), warn()
- **Message Filtering** - View all, logs, errors, or warnings
- **Timestamps** - Track when messages occur
- **Performance Metrics** - Execution time, memory usage, line count
- **Color Coding** - Visual distinction between message types

Perfect for learning and debugging! 🔍

---

## 🔊 Text-to-Speech

Never miss a detail with TTS:

- **Read Current Line** (F7) - Hear the line your cursor is on
- **Read Selection** - Listen to highlighted code
- **Read Entire File** - Full file narration
- **Voice Controls** - Choose voice, adjust speed/pitch/volume
- **Smart Parsing** - Handles code syntax naturally

Great for:
- Proofreading code
- Learning pronunciation
- Accessibility support
- Multitasking while coding

---

## 🚧 Roadmap

### v1.0 ✅ (Current - Complete!)
- Multi-file editor
- 15 professional themes
- Syntax highlighting
- Debug panel
- Text-to-speech
- Live preview
- Git integration
- Tutorial system

### v2.0 (Future)
- Colorblindness modes
- More language support (Python, Java, etc.)
- Code completion
- Desktop app (Electron)
- Cloud sync
- Collaborative editing
- Plugin system

---

## 🤝 Contributing

Contributions are welcome! Whether it's:

- 🐛 Bug reports
- ✨ Feature requests
- 📝 Documentation improvements
- 🎨 New themes
- ♿ Accessibility enhancements

**Please:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**TL;DR:** You can use, modify, and distribute this freely! 🎉

---

## 👤 Author

**Hrafn**
- Home-health nurse by night 🏥
- Developer by passion 💻
- Building accessible tools for everyone ♿

---

## 🙏 Acknowledgments

- Font providers: Google Fonts, Hack Font
- Inspiration: VS Code, Atom, Sublime Text
- Accessibility guidelines: WCAG 2.1
- Theme designs: Community color schemes

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/YOUR-USERNAME/clearcode/issues)
- **Discussions:** [GitHub Discussions](https://github.com/YOUR-USERNAME/clearcode/discussions)

---

## ⭐ Star This Project!

If ClearCode helps you, please consider giving it a star! ⭐

It helps others discover this accessible code editor! 🚀

---

## 📊 Stats

- **Size:** ~150KB total (HTML + CSS + JS)
- **Dependencies:** 0
- **Themes:** 15
- **Languages:** JavaScript, HTML, CSS
- **Browser Support:** All modern browsers
- **Load Time:** < 1 second
- **Features:** 10+ major features
- **Accessibility Score:** AAA (WCAG 2.1)

---

<div align="center">

**Made with ❤️ for accessible coding**

*ClearCode - Coding Without Barriers*

[⬆ Back to Top](#-clearcode---coding-without-barriers)

</div>