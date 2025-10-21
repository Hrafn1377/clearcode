# ✨ ClearCode

**An accessibility-focused code editor designed for developers with visual needs, including dyslexia, color blindness, and other visual processing differences.**

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Status](https://img.shields.io/badge/status-live-success.svg)
![Deployment](https://img.shields.io/badge/deployed-GitHub%20Pages-informational.svg)

---

## 🎯 Overview

ClearCode is a modern, browser-based code editor built with accessibility at its core. Whether you have dyslexia, color vision deficiency, or simply prefer a more customizable coding environment, ClearCode provides the tools you need to code comfortably and effectively.

### ✨ Key Features

- 🎨 **Visual Guides** - Space, tab, and block indicators with customizable colors
- 🔤 **Dyslexia Support** - OpenDyslexic font, increased spacing, and line highlighting
- 🔊 **Text-to-Speech** - Read selected text or current line with customizable voice settings
- ♿ **Full Accessibility** - WCAG compliant with keyboard navigation
- 🎨 **Customizable Colors** - Tritanopia-friendly defaults with full color customization
- 📁 **Multi-File Support** - Tab-based file management
- 🔍 **Search & Replace** - Find and replace across files
- 💾 **Auto-Save** - Automatic session persistence
- 🌙 **Multiple Themes** - Dark, light, and high-contrast modes
- ⌨️ **Keyboard Shortcuts** - Full keyboard accessibility

---

## 🚀 Demo

**Try ClearCode live:** [https://hrafn1377.github.io/clearcode.github.io/](https://hrafn1377.github.io/clearcode.github.io/)

*No installation required - works directly in your browser!*

---

## 📋 Table of Contents

- [Features](#-features)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [Keyboard Shortcuts](#%EF%B8%8F-keyboard-shortcuts)
- [Accessibility Features](#-accessibility-features)
- [Customization](#-customization)
- [Technologies](#-technologies-used)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🎨 Features

### Visual Accessibility

**Visual Guides**
- Customizable space and tab indicators
- Block boundary markers for code structure
- Indent guides for better code readability
- Python-specific colon highlighting
- Fully customizable colors and opacity

**Color Customization**
- Tritanopia-friendly color schemes
- Full RGB color picker for all visual elements
- High-contrast theme options
- Color presets for common vision types

**Theme Options**
- Dark mode (default)
- Light mode
- High-contrast dark
- High-contrast light

### Dyslexia Support

**Typography**
- Optional OpenDyslexic font
- Adjustable letter spacing (reduces visual crowding)
- Customizable line height
- Clear, readable syntax highlighting

**Visual Aids**
- Current line highlighting
- Block boundary indicators
- Reduced visual clutter
- Focus assistance features

### Text-to-Speech

**Features**
- Read selected text on command
- Read current line
- Customizable voice settings:
  - Speech rate (0.5x - 2x)
  - Pitch adjustment
  - Volume control
  - Multiple voice options

**Keyboard Shortcuts**
- `Ctrl/Cmd + R` - Read selected text
- `Ctrl/Cmd + L` - Read current line
- `Ctrl/Cmd + T` - Open TTS settings

### File Management

**Multi-File Support**
- Tab-based interface
- Switch between files easily
- Save/load files
- Auto-save capability
- Session persistence

**File Operations**
- Open files (`Ctrl/Cmd + O`)
- Save files (`Ctrl/Cmd + S`)
- New file (`Ctrl/Cmd + N`)
- Close tabs
- Drag and drop support

### Search & Replace

**Features**
- Find text across files
- Replace with regex support
- Case-sensitive search
- Whole word matching
- Navigate through results

**Keyboard Shortcuts**
- `Ctrl/Cmd + F` - Find
- `Ctrl/Cmd + H` - Replace

---

## 🚀 Getting Started

### Option 1: Use Online (Recommended)

**Visit the live app:** [https://hrafn1377.github.io/clearcode.github.io/](https://hrafn1377.github.io/clearcode.github.io/)

No installation required - works instantly in your browser!

### Option 2: Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Hrafn1377/clearcode.git
   cd clearcode
   ```

2. **Open in browser:**
   ```bash
   # Using Python
   python3 -m http.server 8000
   
   # Or using Node.js
   npx serve
   ```

3. **Visit:** http://localhost:8000

That's it! No build process or dependencies needed.

### Option 3: Desktop App *(coming soon)*

Download installers for:
- Windows (.exe)
- macOS (.dmg)
- Linux (.AppImage, .deb, .rpm)

---

## 💻 Usage

### Basic Workflow

1. **Open ClearCode** in your browser
2. **Enable Visual Guides** - Click "Visual Guides" or press `Ctrl/Cmd + G`
3. **Customize Settings** - Click "Settings" or press `Ctrl/Cmd + ,`
4. **Start Coding!**

### Enabling Accessibility Features

**Visual Guides:**
- Click "Visual Guides" button or press `Ctrl/Cmd + G`
- Customize colors in Settings → Visual Guides

**Dyslexia Mode:**
- Click "Dyslexia Mode" button or press `Ctrl/Cmd + D`
- Toggle individual features:
  - OpenDyslexic font
  - Increased letter spacing
  - Line highlighting
  - Block boundaries

**Text-to-Speech:**
1. Select text
2. Press `Ctrl/Cmd + R` to read
3. Or press `Ctrl/Cmd + L` to read current line
4. Customize voice in Settings → Text-to-Speech

### Customizing Colors

1. Open **Settings** (`Ctrl/Cmd + ,`)
2. Navigate to **Visual Guides** section
3. Click color pickers to customize:
   - Space indicator color
   - Tab indicator color
   - Block marker color
   - Indent guide color
4. Use **Color Presets** for quick schemes

---

## ⌨️ Keyboard Shortcuts

### File Operations
| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + N` | New File |
| `Ctrl/Cmd + O` | Open File |
| `Ctrl/Cmd + S` | Save File |
| `Ctrl/Cmd + W` | Close Tab |

### Editing
| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + F` | Find |
| `Ctrl/Cmd + H` | Replace |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Y` | Redo |

### Accessibility
| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + G` | Toggle Visual Guides |
| `Ctrl/Cmd + D` | Toggle Dyslexia Mode |
| `Ctrl/Cmd + R` | Read Selected Text |
| `Ctrl/Cmd + L` | Read Current Line |
| `Ctrl/Cmd + T` | Text-to-Speech Settings |

### Other
| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + ,` | Open Settings |
| `Ctrl/Cmd + Shift + F` | Send Feedback |
| `F1` | Open Help |

---

## ♿ Accessibility Features

### WCAG Compliance

ClearCode follows Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards:

- ✅ **Keyboard Navigation** - Full keyboard accessibility
- ✅ **Screen Reader Support** - Proper ARIA labels
- ✅ **Color Contrast** - High contrast options available
- ✅ **Text Resizing** - Adjustable font sizes
- ✅ **Focus Indicators** - Clear visual focus states

### Supported Accessibility Needs

**Visual Impairments:**
- High contrast themes
- Adjustable font sizes (8px - 72px)
- Text-to-speech support
- Customizable color schemes

**Dyslexia:**
- OpenDyslexic font option
- Increased letter spacing
- Line highlighting
- Reduced visual clutter

**Color Vision Deficiency:**
- Tritanopia-friendly defaults
- Customizable color schemes
- High contrast options
- Pattern-based indicators (not just color)

**Motor Impairments:**
- Full keyboard navigation
- Customizable shortcuts
- No time-dependent interactions
- Large, clear buttons

---

## 🎨 Customization

### Settings Overview

**Editor Preferences:**
- Theme (Dark/Light/High Contrast)
- Font size
- Font family
- Line height
- Word wrap
- Minimap
- Line numbers

**Visual Guides:**
- Space color
- Tab color
- Block marker color
- Indent guide color
- Opacity settings
- Enable/disable individual guides

**Dyslexia Settings:**
- OpenDyslexic font toggle
- Letter spacing
- Line highlighting
- Block boundaries

**Text-to-Speech:**
- Voice selection
- Speech rate
- Pitch
- Volume

**Auto-Save:**
- Enable/disable
- Interval (5-300 seconds)

### Saving Settings

Settings are automatically saved to your browser's local storage and persist across sessions.

**Export/Import:**
- Export your settings to a file
- Import settings from another device
- Share configurations with others

**Reset Options:**
- Reset All Settings - Return to defaults
- Reset Colors - Reset visual guide colors only
- Clear All Data - Remove all stored data

---

## 🛠️ Technologies Used

**Editor:**
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - The code editor that powers VS Code

**Frontend:**
- Pure HTML, CSS, and JavaScript
- No framework dependencies
- Modern ES6+ JavaScript

**Fonts:**
- [OpenDyslexic](https://opendyslexic.org/) - Dyslexia-friendly font

**Browser APIs:**
- Web Speech API (Text-to-Speech)
- Local Storage API (Settings persistence)
- File API (File operations)

---

## 🤝 Contributing

Contributions are welcome! ClearCode is built with accessibility in mind, and we'd love your help making it better.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly** (especially accessibility features)
5. **Commit your changes:**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push to your fork:**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Contribution Guidelines

- **Test accessibility features** - Ensure keyboard navigation works
- **Follow existing code style** - Maintain consistency
- **Document changes** - Update README if needed
- **Add comments** - Explain complex logic
- **Test across browsers** - Chrome, Firefox, Safari, Edge

### Areas We'd Love Help With

- 🌍 **Internationalization** - Translations
- 🎨 **Color Schemes** - More accessibility presets
- 🔊 **Voice Options** - Additional TTS features
- 📱 **Mobile Support** - Touch optimization
- 🧪 **Testing** - Automated accessibility testing
- 📖 **Documentation** - Tutorials and guides

---

## 🐛 Bug Reports

Found a bug? Please [open an issue](https://github.com/Hrafn1377/clearcode/issues) with:

- **Description** - What happened?
- **Steps to reproduce** - How can we recreate it?
- **Expected behavior** - What should happen?
- **Screenshots** - If applicable
- **Browser/OS** - What environment?

---

## 💬 Feedback

We'd love to hear from you!

- **Feature Requests:** Use the built-in feedback button (`Ctrl/Cmd + Shift + F`)
- **Accessibility Issues:** Please report any accessibility barriers
- **General Feedback:** Open a [GitHub Discussion](https://github.com/Hrafn1377/clearcode/discussions)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### What This Means

You are free to:
- ✅ Use ClearCode for personal or commercial projects
- ✅ Modify and customize it
- ✅ Distribute copies
- ✅ Include it in your own projects

Just include the original license and copyright notice.

---

## 👤 Contact

**J. Harmon**
- Email: hrafn1377@gmail.com
- GitHub: [@Hrafn1377](https://github.com/Hrafn1377)

---

## 🙏 Acknowledgments

- **Monaco Editor** - For the excellent code editor component
- **OpenDyslexic** - For the dyslexia-friendly font
- **The Accessibility Community** - For invaluable feedback and guidance

---

## 🗺️ Roadmap

### Version 1.1 *(Planned)*
- [ ] Offline PWA support
- [ ] Mobile-optimized interface
- [ ] More language syntax support
- [ ] Plugin system
- [ ] Cloud storage integration

### Version 2.0 *(Future)*
- [ ] Collaborative editing
- [ ] AI-powered code assistance
- [ ] Advanced accessibility features
- [ ] Desktop applications
- [ ] Mobile apps

---

## ⭐ Star This Project

If ClearCode helps you, please consider giving it a star on GitHub! It helps others discover the project.

---

## 📊 Project Stats

- **Lines of Code:** ~2,500
- **Features:** 15+ accessibility features
- **Themes:** 4 theme options
- **Languages Supported:** Multiple via Monaco Editor
- **Browser Support:** Chrome, Firefox, Safari, Edge

---

<div align="center">

**Made with ❤️ and ♿ by developers, for developers**

*Coding should be accessible to everyone*

[⬆ Back to Top](#-clearcode)

</div>
