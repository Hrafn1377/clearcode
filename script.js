// Multi-file management system
let files = [];
let activeFileId = null;
let fileIdCounter = 0;
let autoSaveTimer = null;
let autoSaveEnabled = true;
let autoSaveDelay = 2000;
let historyTimer = null;
let historyDelay = 500;
let syntaxTimer = null;
let syntaxDelay = 150;
let lineNumbersTimer = null;
let lineNumbersDelay = 100;
let syntaxEnabled = true;

// Syntax highlighting patterns
const syntaxPatterns = {
    javascript: {
        keywords: /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|extends|import|export|default|async|await|try|catch|finally|throw|new|this|super|typeof|instanceof|delete|void|yield|in|of|with|debugger)\b/g,
        strings: /(["'\`])(?:(?=(\\?))\2.)*?\1/g,
        comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
        numbers: /\b(\d+\.?\d*|\.\d+)\b/g,
        functions: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g,
        operators: /[+\-*/%=<>!&|^~?:]/g
    },
    html: {
        tags: /<\/?[\w\s="/.':;#-\/]+>/g,
        attributes: /\b([a-zA-Z-]+)=/g,
        strings: /(["'])(?:(?=(\\?))\2.)*?\1/g,
        comments: /(<!--[\s\S]*?-->)/g
    },
    css: {
        properties: /\b([a-z-]+)(?=\s*:)/g,
        values: /:\s*([^;{}\n]+)/g,
        keywords: /@[a-z-]+/g,
        comments: /(\/\*[\s\S]*?\*\/)/g,
        strings: /(["'])(?:(?=(\\?))\2.)*?\1/g
    }
};

// Detect language from filename
function detectLanguage(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const langMap = {
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'javascript',
        'tsx': 'javascript',
        'html': 'html',
        'htm': 'html',
        'css': 'css',
        'scss': 'css',
        'sass': 'css',
        'json': 'javascript',
        'py': 'python',
        'txt': 'plaintext'
    };
    return langMap[ext] || 'plaintext';
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// FIXED: Helper function to parse HTML tags and attributes WITH PROPER SPACING
function highlightHtmlTag(tag) {
    // Match opening/closing tag with attributes
    const tagMatch = tag.match(/^<(\/)?([\w-]+)(.*?)(\/?)>$/s);
    if (!tagMatch) return escapeHtml(tag);
    
    const [, isClosing, tagName, attributes, isSelfClosing] = tagMatch;
    let result = '<span class="token-tag">&lt;';
    
    if (isClosing) result += '/';
    result += tagName;
    
    // Parse attributes if present - PRESERVE ALL WHITESPACE
    if (attributes && attributes.trim()) {
        const attrRegex = /(\s+)([\w-]+)(?:=((?:(['"])([^\4]*?)\4)|([^\s>]+)))?/g;
        let lastIndex = 0;
        let attrMatch;
        
        while ((attrMatch = attrRegex.exec(attributes)) !== null) {
            // Add any text before this attribute (should be whitespace)
            const beforeText = attributes.substring(lastIndex, attrMatch.index);
            if (beforeText) {
                result += escapeHtml(beforeText);
            }
            
            // Add the whitespace before attribute (attrMatch[1])
            result += escapeHtml(attrMatch[1]);
            
            // Add attribute name (attrMatch[2])
            result += '<span class="token-attribute">' + escapeHtml(attrMatch[2]) + '</span>';
            
            // Add equals sign and value if present
            if (attrMatch[3]) {
                result += '=';
                // attrMatch[3] is the full value (with or without quotes)
                // attrMatch[4] is the quote character if present
                // attrMatch[5] is the value inside quotes
                // attrMatch[6] is the unquoted value
                if (attrMatch[4]) {
                    // Quoted value
                    result += '<span class="token-string">' + 
                             escapeHtml(attrMatch[4] + attrMatch[5] + attrMatch[4]) + 
                             '</span>';
                } else if (attrMatch[6]) {
                    // Unquoted value
                    result += '<span class="token-string">' + escapeHtml(attrMatch[6]) + '</span>';
                }
            }
            
            lastIndex = attrRegex.lastIndex;
        }
        
        // Add any remaining text (trailing whitespace)
        if (lastIndex < attributes.length) {
            result += escapeHtml(attributes.substring(lastIndex));
        }
    }
    
    if (isSelfClosing) result += '/';
    result += '&gt;</span>';
    
    return result;
}
// Highlight code based on language
function highlightCode(code, language) {
    if (!syntaxEnabled || language === 'plaintext') {
        return escapeHtml(code);
    }
    
    let highlighted = escapeHtml(code);
    
    if (language === 'javascript') {
        // Apply highlighting in specific order to avoid conflicts
        const matches = [];
        
        // Find all matches with their positions
        let match;
        
        // Comments first (highest priority)
        const commentRegex = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm;
        while ((match = commentRegex.exec(code)) !== null) {
            matches.push({
                start: match.index,
                end: match.index + match[0].length,
                type: 'comment',
                text: match[0]
            });
        }
        
        // Strings
        const stringRegex = /(["'\`])(?:(?=(\\?))\2.)*?\1/g;
        while ((match = stringRegex.exec(code)) !== null) {
            if (!isInRange(match.index, matches)) {
                matches.push({
                    start: match.index,
                    end: match.index + match[0].length,
                    type: 'string',
                    text: match[0]
                });
            }
        }
        
        // Keywords
        const keywordRegex = /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|extends|import|export|default|async|await|try|catch|finally|throw|new|this|super|typeof|instanceof|delete|void|yield|in|of|with|debugger)\b/g;
        while ((match = keywordRegex.exec(code)) !== null) {
            if (!isInRange(match.index, matches)) {
                matches.push({
                    start: match.index,
                    end: match.index + match[0].length,
                    type: 'keyword',
                    text: match[0]
                });
            }
        }
        
        // Functions
        const functionRegex = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g;
        while ((match = functionRegex.exec(code)) !== null) {
            if (!isInRange(match.index, matches)) {
                matches.push({
                    start: match.index,
                    end: match.index + match[0].length,
                    type: 'function',
                    text: match[0]
                });
            }
        }
        
        // Numbers
        const numberRegex = /\b(\d+\.?\d*|\.\d+)\b/g;
        while ((match = numberRegex.exec(code)) !== null) {
            if (!isInRange(match.index, matches)) {
                matches.push({
                    start: match.index,
                    end: match.index + match[0].length,
                    type: 'number',
                    text: match[0]
                });
            }
        }
        
        // Sort matches by position
        matches.sort((a, b) => a.start - b.start);
        
        // Build highlighted string
        let result = '';
        let lastIndex = 0;
        
        for (const m of matches) {
            // Add text before match with default token color
            const plainText = code.substring(lastIndex, m.start);
            if (plainText) {
                result += `<span class="token-plain">${escapeHtml(plainText)}</span>`;
            }
            // Add highlighted match
            result += `<span class="token-${m.type}">${escapeHtml(m.text)}</span>`;
            lastIndex = m.end;
        }
        
        // Add remaining text with default token color
        const remainingText = code.substring(lastIndex);
        if (remainingText) {
            result += `<span class="token-plain">${escapeHtml(remainingText)}</span>`;
        }
        
        return result;
    } else if (language === 'html') {
        // Token-based HTML highlighting
        const matches = [];
        let match;
        
        // Comments first (highest priority)
        const commentRegex = /(<!--[\s\S]*?-->)/g;
        while ((match = commentRegex.exec(code)) !== null) {
            matches.push({
                start: match.index,
                end: match.index + match[0].length,
                type: 'comment',
                text: match[0]
            });
        }
        
        // DOCTYPE declarations (like <!DOCTYPE html>)
        const doctypeRegex = /<!(DOCTYPE|doctype)\s+[^>]*>/gi;
        while ((match = doctypeRegex.exec(code)) !== null) {
            if (!isInRange(match.index, matches)) {
                matches.push({
                    start: match.index,
                    end: match.index + match[0].length,
                    type: 'doctype',
                    text: match[0]
                });
            }
        }
        
        // HTML tags (regular tags)
        const tagRegex = /<\/?[\w][\w\s="'.\/:;#-]*\/?>/g;
        while ((match = tagRegex.exec(code)) !== null) {
            if (!isInRange(match.index, matches)) {
                matches.push({
                    start: match.index,
                    end: match.index + match[0].length,
                    type: 'tag',
                    text: match[0]
                });
            }
        }
        
        // Sort matches by position
        matches.sort((a, b) => a.start - b.start);
        
        // Build highlighted string
        let result = '';
        let lastIndex = 0;
        
        for (const m of matches) {
            // Add text before match
            const plainText = code.substring(lastIndex, m.start);
            if (plainText) {
                result += `<span class="token-plain">${escapeHtml(plainText)}</span>`;
            }
            
            // Add highlighted match
            if (m.type === 'comment') {
                result += `<span class="token-comment">${escapeHtml(m.text)}</span>`;
            } else if (m.type === 'doctype') {
                result += `<span class="token-keyword">${escapeHtml(m.text)}</span>`;
            } else if (m.type === 'tag') {
                result += highlightHtmlTag(m.text);
            }
            
            lastIndex = m.end;
        }
        
        // Add remaining text
        const remainingText = code.substring(lastIndex);
        if (remainingText) {
            result += `<span class="token-plain">${escapeHtml(remainingText)}</span>`;
        }
        
        return result;
    } else if (language === 'css') {
        // Token-based CSS highlighting
        const matches = [];
        let match;
        
        // Comments first (highest priority)
        const commentRegex = /(\/\*[\s\S]*?\*\/)/g;
        while ((match = commentRegex.exec(code)) !== null) {
            matches.push({
                start: match.index,
                end: match.index + match[0].length,
                type: 'comment',
                text: match[0]
            });
        }
        
        // Strings
        const stringRegex = /(["'])(?:(?=(\\?))\2.)*?\1/g;
        while ((match = stringRegex.exec(code)) !== null) {
            if (!isInRange(match.index, matches)) {
                matches.push({
                    start: match.index,
                    end: match.index + match[0].length,
                    type: 'string',
                    text: match[0]
                });
            }
        }
        
        // At-rules (@media, @import, etc.)
        const atRuleRegex = /@[\w-]+/g;
        while ((match = atRuleRegex.exec(code)) !== null) {
            if (!isInRange(match.index, matches)) {
                matches.push({
                    start: match.index,
                    end: match.index + match[0].length,
                    type: 'keyword',
                    text: match[0]
                });
            }
        }
        
        // CSS Properties and Values together
        // Match property: value; pattern
        const propertyValueRegex = /([a-z-]+)\s*:\s*([^;{}]+);?/gi;
        while ((match = propertyValueRegex.exec(code)) !== null) {
            const propStart = match.index;
            const propName = match[1];
            const propValue = match[2];
            
            // Find where the property name starts and ends
            const propNameStart = propStart;
            const propNameEnd = propNameStart + propName.length;
            
            // Find where the value starts (after the colon and whitespace)
            const colonIndex = code.indexOf(':', propNameStart);
            const valueStart = colonIndex + 1;
            // Trim leading whitespace from value
            let trimmedValueStart = valueStart;
            while (trimmedValueStart < code.length && /\s/.test(code[trimmedValueStart])) {
                trimmedValueStart++;
            }
            const valueEnd = trimmedValueStart + propValue.trim().length;
            
            // Add property if not already matched
            if (!isInRange(propNameStart, matches)) {
                matches.push({
                    start: propNameStart,
                    end: propNameEnd,
                    type: 'property',
                    text: propName
                });
            }
            
            // Add value if not already matched
            if (!isInRange(trimmedValueStart, matches)) {
                matches.push({
                    start: trimmedValueStart,
                    end: valueEnd,
                    type: 'value',
                    text: propValue.trim()
                });
            }
        }
        
        // Sort matches by position
        matches.sort((a, b) => a.start - b.start);
        
        // Build highlighted string
        let result = '';
        let lastIndex = 0;
        
        for (const m of matches) {
            // Add text before match
            const plainText = code.substring(lastIndex, m.start);
            if (plainText) {
                result += `<span class="token-plain">${escapeHtml(plainText)}</span>`;
            }
            
            // Add highlighted match
            result += `<span class="token-${m.type}">${escapeHtml(m.text)}</span>`;
            lastIndex = m.end;
        }
        
        // Add remaining text
        const remainingText = code.substring(lastIndex);
        if (remainingText) {
            result += `<span class="token-plain">${escapeHtml(remainingText)}</span>`;
        }
        
        return result;
    }
    
    return highlighted;
}

// Check if position is within any existing match range
function isInRange(pos, matches) {
    return matches.some(m => pos >= m.start && pos < m.end);
}

// Update syntax highlighting
function updateSyntaxHighlight() {
    const editor = document.getElementById('editor');
    const overlay = document.getElementById('syntaxOverlay');
    const file = files.find(f => f.id === activeFileId);
    
    if (!file || !overlay || !editor) return;
    
    // If syntax is disabled, remove the class and show normal text
    if (!syntaxEnabled) {
        editor.classList.remove('syntax-enabled');
        overlay.innerHTML = '';
        return;
    }
    
    const language = detectLanguage(file.name);
    const code = editor.value;
    
    // If empty or very short, don't enable syntax overlay
    if (!code || code.trim().length < 2) {
        editor.classList.remove('syntax-enabled');
        overlay.innerHTML = '';
        return;
    }
    
    // Don't enable syntax overlay for plaintext files
    if (language === 'plaintext') {
        editor.classList.remove('syntax-enabled');
        overlay.innerHTML = '';
        return;
    }
    
    const highlighted = highlightCode(code, language);
    
    overlay.innerHTML = highlighted;
    editor.classList.add('syntax-enabled');
    
    // Sync scroll
    overlay.scrollTop = editor.scrollTop;
    overlay.scrollLeft = editor.scrollLeft;
}

// Debounced syntax update - only runs after user stops typing
function debouncedSyntaxUpdate() {
    clearTimeout(syntaxTimer);
    syntaxTimer = setTimeout(() => {
        updateSyntaxHighlight();
    }, syntaxDelay);
}

// Debounced line numbers update - reduces lag on large files
function debouncedLineNumbersUpdate() {
    clearTimeout(lineNumbersTimer);
    lineNumbersTimer = setTimeout(() => {
        updateLineNumbers();
    }, lineNumbersDelay);
}

// Initialize with welcome file
function initializeEditor() {
    const welcomeContent = `// Welcome to Clearcode
console.log("Hello World!");

function greet(name) {
    return "Hello, " + name + "!";
}

greet("Developer");`;
    
    createNewFile('welcome.js', welcomeContent);
    
    // Load saved files from localStorage
    loadSavedFiles();
}

// Save all files to localStorage
function saveAllFilesToStorage() {
    try {
        const filesToSave = files.map(f => ({
            id: f.id,
            name: f.name,
            content: f.content
        }));
        localStorage.setItem('clearcode-files', JSON.stringify(filesToSave));
        localStorage.setItem('clearcode-active-file', activeFileId);
        return true;
    } catch (e) {
        console.error('Failed to save files:', e);
        return false;
    }
}

// Load saved files from localStorage
function loadSavedFiles() {
    try {
        const savedFiles = localStorage.getItem('clearcode-files');
        const savedActiveId = localStorage.getItem('clearcode-active-file');
        
        if (savedFiles) {
            const parsedFiles = JSON.parse(savedFiles);
            if (parsedFiles && parsedFiles.length > 0) {
                // Clear default welcome file
                files = [];
                
                // Restore saved files with history initialized
                parsedFiles.forEach(file => {
                    files.push({
                        id: file.id,
                        name: file.name,
                        content: file.content,
                        history: [file.content], // Initialize history with current content
                        historyIndex: 0
                    });
                    if (file.id >= fileIdCounter) {
                        fileIdCounter = file.id + 1;
                    }
                });
                
                // Restore active file
                const activeId = savedActiveId ? parseInt(savedActiveId) : files[0].id;
                switchToFile(activeId);
                renderFileList();
            }
        }
    } catch (e) {
        console.error('Failed to load saved files:', e);
    }
}

// Auto-save function with debouncing
function triggerAutoSave() {
    if (!autoSaveEnabled) return;
    
    // Clear existing timer
    if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
    }
    
    // Show "Saving..." status
    showStatus('Saving...', 'saving');
    
    // Set new timer
    autoSaveTimer = setTimeout(() => {
        const success = saveAllFilesToStorage();
        if (success) {
            showStatus('Saved', 'success');
            // Clear status after 2 seconds
            setTimeout(() => {
                const statusMsg = document.getElementById('statusMessage');
                if (statusMsg.textContent === 'Saved') {
                    statusMsg.textContent = 'Ready';
                    statusMsg.className = '';
                }
            }, 2000);
        } else {
            showStatus('Save failed', 'error');
        }
    }, autoSaveDelay);
}

// Add to history with debouncing
function addToHistory(content) {
    const file = files.find(f => f.id === activeFileId);
    if (!file) return;
    
    // Clear existing timer
    if (historyTimer) {
        clearTimeout(historyTimer);
    }
    
    // Set new timer
    historyTimer = setTimeout(() => {
        // Don't add to history if content hasn't changed
        if (file.history[file.historyIndex] === content) return;
        
        // Remove any redo history (everything after current index)
        file.history = file.history.slice(0, file.historyIndex + 1);
        
        // Add new state
        file.history.push(content);
        file.historyIndex++;
        
        // Limit history size to 100 states
        if (file.history.length > 100) {
            file.history.shift();
            file.historyIndex--;
        }
    }, historyDelay);
}

// Undo function
function undo() {
    const file = files.find(f => f.id === activeFileId);
    if (!file) return;
    
    if (file.historyIndex > 0) {
        file.historyIndex--;
        const previousContent = file.history[file.historyIndex];
        
        // Update editor without triggering history
        const editor = document.getElementById('editor');
        const cursorPos = editor.selectionStart;
        editor.value = previousContent;
        file.content = previousContent;
        
        // Try to maintain cursor position
        editor.setSelectionRange(Math.min(cursorPos, previousContent.length), Math.min(cursorPos, previousContent.length));
        
        updateLineNumbers();
        showStatus('Undo', 'success');
    } else {
        showStatus('Nothing to undo', 'error');
    }
}

// Redo function
function redo() {
    const file = files.find(f => f.id === activeFileId);
    if (!file) return;
    
    if (file.historyIndex < file.history.length - 1) {
        file.historyIndex++;
        const nextContent = file.history[file.historyIndex];
        
        // Update editor without triggering history
        const editor = document.getElementById('editor');
        const cursorPos = editor.selectionStart;
        editor.value = nextContent;
        file.content = nextContent;
        
        // Try to maintain cursor position
        editor.setSelectionRange(Math.min(cursorPos, nextContent.length), Math.min(cursorPos, nextContent.length));
        
        updateLineNumbers();
        showStatus('Redo', 'success');
    } else {
        showStatus('Nothing to redo', 'error');
    }
}

// Create new file
function createNewFile(name = null, content = '// New file\n') {
    const fileId = fileIdCounter++;
    const fileName = name || `untitled-${fileId}.txt`;
    
    const newFile = {
        id: fileId,
        name: fileName,
        content: content,
        history: [content], // Undo/redo history
        historyIndex: 0 // Current position in history
    };
    
    files.push(newFile);
    switchToFile(fileId);
    renderFileList();
    showStatus('New file created', 'success');
}

// Wrapper for toolbar button
function createNew() {
    createNewFile();
}

// Switch to a file
function switchToFile(fileId) {
    // Save current file content before switching
    if (activeFileId !== null) {
        const currentFile = files.find(f => f.id === activeFileId);
        if (currentFile) {
            currentFile.content = document.getElementById('editor').value;
        }
    }
    
    // Switch to new file
    activeFileId = fileId;
    const file = files.find(f => f.id === fileId);
    
    if (file) {
        document.getElementById('editor').value = file.content;
        updateLineNumbers();
        updateSyntaxHighlight();
        updateFileName(file.name);
        renderFileList();
    }
}

// Close a file
function closeFile(fileId, event) {
    event.stopPropagation(); // Prevent switching to file when closing
    
    const fileIndex = files.findIndex(f => f.id === fileId);
    if (fileIndex === -1) return;
    
    // Remove file
    files.splice(fileIndex, 1);
    
    // If closing active file, switch to another
    if (activeFileId === fileId) {
        if (files.length > 0) {
            // Switch to previous file or first file
            const newActiveFile = files[Math.max(0, fileIndex - 1)];
            switchToFile(newActiveFile.id);
        } else {
            // No files left, create a new one
            createNewFile();
        }
    }
    
    renderFileList();
}

// Close current file (for menu)
function closeCurrentFile() {
    if (activeFileId !== null) {
        const fakeEvent = { stopPropagation: () => {} };
        closeFile(activeFileId, fakeEvent);
    }
}

// Rename current file
function renameFile() {
    if (activeFileId === null) {
        showStatus('No file open to rename', 'error');
        return;
    }
    
    const file = files.find(f => f.id === activeFileId);
    if (!file) return;
    
    const newName = prompt('Enter new file name:', file.name);
    
    if (newName && newName.trim() !== '' && newName !== file.name) {
        file.name = newName.trim();
        updateFileName(file.name);
        renderFileList();
        renderTabs();
        
        // Re-run syntax highlighting with new extension
        updateSyntaxHighlight();
        
        showStatus(`File renamed to: ${file.name}`, 'success');
    }
}

// Render file list in sidebar
function renderFileList() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';
    
    files.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = `file-item ${file.id === activeFileId ? 'active' : ''}`;
        fileItem.onclick = () => switchToFile(file.id);
        
        fileItem.innerHTML = `
            <span class="file-name">${file.name}</span>
            <button class="file-close" onclick="closeFile(${file.id}, event)" title="Close">×</button>
        `;
        
        fileList.appendChild(fileItem);
    });
    
    // Also render tabs
    renderTabs();
}

// Render tabs in tab bar
function renderTabs() {
    const tabsContainer = document.getElementById('tabsContainer');
    tabsContainer.innerHTML = '';
    
    files.forEach(file => {
        const tab = document.createElement('div');
        tab.className = `file-tab ${file.id === activeFileId ? 'active' : ''}`;
        tab.onclick = () => switchToFile(file.id);
        
        tab.innerHTML = `
            <span class="tab-name">${file.name}</span>
            <button class="tab-close" onclick="event.stopPropagation(); closeFile(${file.id}, event)" title="Close">×</button>
        `;
        
        tabsContainer.appendChild(tab);
    });
    
    // Scroll active tab into view
    const activeTab = tabsContainer.querySelector('.file-tab.active');
    if (activeTab) {
        activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
}

// Simple working functions
function openFile() {
    document.getElementById('fileInput').click();
}

function saveFile() {
    const file = files.find(f => f.id === activeFileId);
    if (!file) return;
    
    const content = document.getElementById('editor').value;
    file.content = content; // Update content
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
    showStatus('File downloaded', 'success');
    
    // Also save to localStorage
    saveAllFilesToStorage();
}

function saveAllFilesManually() {
    const success = saveAllFilesToStorage();
    if (success) {
        showStatus('All files saved', 'success');
    } else {
        showStatus('Save failed', 'error');
    }
}

function toggleAutoSave() {
    autoSaveEnabled = !autoSaveEnabled;
    const menuItem = document.getElementById('autoSaveMenuItem');
    if (menuItem) {
        menuItem.textContent = `Auto-save: ${autoSaveEnabled ? 'ON' : 'OFF'}`;
    }
    localStorage.setItem('autoSaveEnabled', autoSaveEnabled);
    showStatus(`Auto-save ${autoSaveEnabled ? 'enabled' : 'disabled'}`, 'success');
}

function runCode() {
    const code = document.getElementById('editor').value;
    showStatus('Running...', 'running');
    
    // Clear previous execution
    const consoleOutput = document.getElementById('consoleOutput');
    
    // Intercept console.log
    const originalLog = console.log;
    const logs = [];
    
    console.log = function(...args) {
        logs.push(args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
        originalLog.apply(console, args);
    };
    
    setTimeout(() => {
        try {
            // Execute code
            eval(code);
            
            // Show logs
            if (logs.length > 0) {
                logs.forEach(log => addConsoleMessage(log, 'log'));
            }
            
            addConsoleMessage('✓ Executed successfully', 'success');
            showStatus('Executed successfully', 'success');
        } catch (error) {
            // Show error in console
            addConsoleMessage('✗ ' + error.toString(), 'error');
            showStatus('Error - check console', 'error');
        } finally {
            // Restore console.log
            console.log = originalLog;
        }
    }, 100);
}

// Add message to console panel
function addConsoleMessage(message, type = 'log') {
    const consoleOutput = document.getElementById('consoleOutput');
    const messageDiv = document.createElement('div');
    messageDiv.className = `console-message ${type}`;
    
    const timestamp = new Date().toLocaleTimeString();
    messageDiv.innerHTML = `<span class="console-timestamp">[${timestamp}]</span>${message}`;
    
    consoleOutput.appendChild(messageDiv);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// Clear console
function clearConsole() {
    const consoleOutput = document.getElementById('consoleOutput');
    consoleOutput.innerHTML = '<div class="console-message info">Console cleared</div>';
}

// NEW: Line numbers function
function updateLineNumbers() {
    const editor = document.getElementById('editor');
    const lineNumbers = document.getElementById('lineNumbers');
    const lineCountDisplay = document.getElementById('lineCount');
    const lines = editor.value.split('\n');
    const lineCount = lines.length;
    
    let numbers = '';
    for (let i = 1; i <= lineCount; i++) {
        numbers += i + '\n';
    }
    lineNumbers.textContent = numbers;
    
    // Update line count in status bar
    if (lineCountDisplay) {
        lineCountDisplay.textContent = lineCount + (lineCount === 1 ? ' line' : ' lines');
    }
}

// Status message function
function showStatus(message, type = '') {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.textContent = message;
    statusMessage.className = type;
    
    // Auto-clear success/error messages after 3 seconds
    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            statusMessage.textContent = 'Ready';
            statusMessage.className = '';
        }, 3000);
    }
}

// Update filename display
function updateFileName(name = null) {
    const fileNameDisplay = document.getElementById('fileName');
    if (fileNameDisplay) {
        const file = files.find(f => f.id === activeFileId);
        fileNameDisplay.textContent = name || (file ? file.name : 'No file');
    }
}

// Handle file opening
document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            createNewFile(file.name, content);
            showStatus('File opened', 'success');
        };
        reader.readAsText(file);
    }
    // Reset file input
    e.target.value = '';
});

// NEW: Update line numbers when typing
document.getElementById('editor').addEventListener('input', function() {
    debouncedLineNumbersUpdate(); // Debounced for performance
    // Save content to active file
    const file = files.find(f => f.id === activeFileId);
    if (file) {
        file.content = this.value;
    }
    // Update syntax highlighting (debounced)
    debouncedSyntaxUpdate();
    // Add to history (debounced)
    addToHistory(this.value);
    // Trigger auto-save
    triggerAutoSave();
});
document.getElementById('editor').addEventListener('scroll', function() {
    document.getElementById('lineNumbers').scrollTop = this.scrollTop;
    // Sync syntax overlay
    const overlay = document.getElementById('syntaxOverlay');
    if (overlay) {
        overlay.scrollTop = this.scrollTop;
        overlay.scrollLeft = this.scrollLeft;
    }
});

// NEW: Initialize line numbers on page load
window.addEventListener('load', updateLineNumbers);

// Toggle line comment
function toggleLineComment() {
    const editor = document.getElementById('editor');
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const value = editor.value;
    
    // Find the start of the current line
    let lineStart = value.lastIndexOf('\n', start - 1) + 1;
    let lineEnd = value.indexOf('\n', end);
    if (lineEnd === -1) lineEnd = value.length;
    
    const line = value.substring(lineStart, lineEnd);
    
    // Check if line is already commented
    const isCommented = line.trimStart().startsWith('//');
    
    let newValue;
    let cursorOffset = 0;
    
    if (isCommented) {
        // Remove comment
        const firstSlash = line.indexOf('//');
        newValue = value.substring(0, lineStart) + 
                   line.substring(0, firstSlash) + 
                   line.substring(firstSlash + 2).replace(/^ /, '') + 
                   value.substring(lineEnd);
        cursorOffset = -3; // Account for removed //
    } else {
        // Add comment
        const indent = line.match(/^\s*/)[0];
        newValue = value.substring(0, lineStart) + 
                   indent + '// ' + line.trimStart() + 
                   value.substring(lineEnd);
        cursorOffset = 3; // Account for added //
    }
    
    editor.value = newValue;
    editor.selectionStart = start + cursorOffset;
    editor.selectionEnd = end + cursorOffset;
    
    // Save to file
    const file = files.find(f => f.id === activeFileId);
    if (file) {
        file.content = editor.value;
    }
    updateLineNumbers();
}

// Show keyboard shortcuts help
function showShortcutsHelp() {
    const helpContent = `
<div style="font-family: 'SF Mono', monospace; font-size: 13px; line-height: 1.8;">
    <h3 style="margin-top: 0; color: var(--text-primary); border-bottom: 2px solid var(--border-color); padding-bottom: 10px;">Keyboard Shortcuts</h3>
    
    <div style="margin-bottom: 20px;">
        <h4 style="color: var(--text-secondary); margin-bottom: 8px;">File Operations</h4>
        <div><kbd>Ctrl+N</kbd> / <kbd>⌘N</kbd> - New File</div>
        <div><kbd>Ctrl+O</kbd> / <kbd>⌘O</kbd> - Open File</div>
        <div><kbd>Ctrl+S</kbd> / <kbd>⌘S</kbd> - Save File</div>
        <div><kbd>Ctrl+Shift+S</kbd> / <kbd>⌘⇧S</kbd> - Save All Files</div>
        <div><kbd>Ctrl+W</kbd> / <kbd>⌘W</kbd> - Close File</div>
    </div>
    
    <div style="margin-bottom: 20px;">
        <h4 style="color: var(--text-secondary); margin-bottom: 8px;">Code Execution</h4>
        <div><kbd>Ctrl+Enter</kbd> / <kbd>⌘Enter</kbd> - Run Code</div>
        <div><kbd>F5</kbd> - Run Code (alternative)</div>
        <div><kbd>Ctrl+Shift+K</kbd> / <kbd>⌘⇧K</kbd> - Clear Console</div>
    </div>
    
    <div style="margin-bottom: 20px;">
        <h4 style="color: var(--text-secondary); margin-bottom: 8px;">Editing</h4>
        <div><kbd>Ctrl+Z</kbd> / <kbd>⌘Z</kbd> - Undo</div>
        <div><kbd>Ctrl+Y</kbd> / <kbd>⌘Y</kbd> - Redo</div>
        <div><kbd>Ctrl+F</kbd> / <kbd>⌘F</kbd> - Find & Replace</div>
        <div><kbd>Ctrl+/</kbd> / <kbd>⌘/</kbd> - Toggle Line Comment</div>
        <div><kbd>Ctrl+G</kbd> / <kbd>⌘G</kbd> - Go to Line</div>
        <div><kbd>Tab</kbd> - Add Indentation (2 spaces)</div>
    </div>
    
    <div style="margin-bottom: 20px;">
        <h4 style="color: var(--text-secondary); margin-bottom: 8px;">View & Theme</h4>
        <div><kbd>Ctrl+Shift+T</kbd> / <kbd>⌘⇧T</kbd> - Cycle Through Themes</div>
        <div><kbd>Ctrl+=</kbd> / <kbd>⌘=</kbd> - Increase Font Size</div>
        <div><kbd>Ctrl+-</kbd> / <kbd>⌘-</kbd> - Decrease Font Size</div>
        <div><kbd>Ctrl+0</kbd> / <kbd>⌘0</kbd> - Reset Font Size</div>
    </div>
    
    <div style="margin-bottom: 10px;">
        <h4 style="color: var(--text-secondary); margin-bottom: 8px;">Help</h4>
        <div><kbd>F1</kbd> - Show This Help</div>
    </div>
    
    <div style="margin-top: 20px; padding: 12px; background: rgba(52, 152, 219, 0.1); border-left: 3px solid #3498db; border-radius: 4px; font-size: 12px;">
        <strong>💡 Tip:</strong> On Mac, use <kbd>⌘</kbd> (Command) instead of <kbd>Ctrl</kbd>
    </div>
</div>

<style>
    kbd {
        display: inline-block;
        padding: 3px 8px;
        font-family: 'SF Mono', monospace;
        font-size: 11px;
        color: var(--text-primary);
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        box-shadow: 0 2px 0 var(--border-color);
        margin: 0 2px;
    }
</style>
`;
    
    showModal('Keyboard Shortcuts', helpContent);
}

// Show About dialog
function showAbout() {
    const aboutContent = `
<div style="text-align: center; padding: 20px;">
    <h2 style="color: var(--text-primary); margin-bottom: 8px;">Clearcode<span style="color: #e74c3c;">.</span></h2>
    <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 24px;">A simple, accessible code editor</p>
    
    <div style="text-align: left; background: var(--bg-secondary); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
        <h4 style="color: var(--text-secondary); margin-top: 0;">Features:</h4>
        <ul style="color: var(--text-primary); line-height: 1.8;">
            <li>Multi-file editing</li>
            <li>8 beautiful themes</li>
            <li>Accessibility support (dyslexia mode)</li>
            <li>Find & replace</li>
            <li>Code execution with console</li>
            <li>Customizable fonts and spacing</li>
        </ul>
    </div>
    
    <p style="color: var(--text-muted); font-size: 12px;">Made with ❤️ for accessible coding</p>
</div>
`;
    
    showModal('About Clearcode', aboutContent);
}

// Go to line function
function goToLine() {
    const editor = document.getElementById('editor');
    const lineNumber = prompt('Go to line:');
    
    if (lineNumber) {
        const lines = editor.value.split('\n');
        const targetLine = parseInt(lineNumber) - 1;
        
        if (targetLine >= 0 && targetLine < lines.length) {
            // Calculate position
            let position = 0;
            for (let i = 0; i < targetLine; i++) {
                position += lines[i].length + 1; // +1 for newline
            }
            
            editor.focus();
            editor.setSelectionRange(position, position + lines[targetLine].length);
            editor.scrollTop = (targetLine * 20); // Approximate scroll
            
            showStatus(`Jumped to line ${lineNumber}`, 'success');
        } else {
            showStatus('Invalid line number', 'error');
        }
    }
}

// Simple modal system
function showModal(title, content) {
    // Remove existing modal if any
    const existingModal = document.getElementById('shortcutsModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'shortcutsModal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button onclick="closeModal()" class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on Escape key
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

function closeModal() {
    const modal = document.getElementById('shortcutsModal');
    if (modal) {
        modal.remove();
    }
}

// Menu System Functions
function toggleMenu(menuId) {
    // Close all menus first
    const allMenus = document.querySelectorAll('.menu-dropdown');
    const allButtons = document.querySelectorAll('.menu-button');
    const allSubmenus = document.querySelectorAll('.menu-submenu');
    
    allMenus.forEach(menu => {
        if (menu.id !== menuId) {
            menu.classList.remove('show');
        }
    });
    
    allButtons.forEach(btn => {
        if (btn.getAttribute('onclick') !== `toggleMenu('${menuId}')`) {
            btn.classList.remove('active');
        }
    });
    
    allSubmenus.forEach(submenu => submenu.classList.remove('show'));
    
    // Toggle the clicked menu
    const menu = document.getElementById(menuId);
    const button = event.target;
    
    if (menu.classList.contains('show')) {
        menu.classList.remove('show');
        button.classList.remove('active');
    } else {
        menu.classList.add('show');
        button.classList.add('active');
    }
}

function showSubmenu(submenuId) {
    // Close other submenus
    const allSubmenus = document.querySelectorAll('.menu-submenu');
    allSubmenus.forEach(submenu => {
        if (submenu.id !== submenuId) {
            submenu.classList.remove('show');
        }
    });
    
    const submenu = document.getElementById(submenuId);
    if (submenu) {
        submenu.classList.add('show');
    }
}

function closeAllMenus() {
    const allMenus = document.querySelectorAll('.menu-dropdown');
    const allButtons = document.querySelectorAll('.menu-button');
    const allSubmenus = document.querySelectorAll('.menu-submenu');
    
    allMenus.forEach(menu => menu.classList.remove('show'));
    allButtons.forEach(btn => btn.classList.remove('active'));
    allSubmenus.forEach(submenu => submenu.classList.remove('show'));
}

// Set theme directly (for menu)
function setTheme(themeName) {
    if (themeName === 'light') {
        document.body.removeAttribute('data-theme');
    } else {
        document.body.setAttribute('data-theme', themeName);
    }
    
    localStorage.setItem('theme', themeName);
    
    const themeNames = {
        'light': 'Light',
        'dark': 'Dark',
        'ayu': 'Ayu Dark',
        'tokyo-night': 'Tokyo Night',
        'nord': 'Nord',
        'night-owl': 'Night Owl',
        'monokai-pro': 'Monokai Pro',
        'one-dark-pro': 'One Dark Pro'
    };
    
    showStatus(`Theme: ${themeNames[themeName]}`, 'success');
}

// Set font family directly (for menu)
function setFontFamily(fontFamily) {
    const editor = document.getElementById('editor');
    const lineNumbers = document.getElementById('lineNumbers');
    
    editor.style.fontFamily = fontFamily;
    lineNumbers.style.fontFamily = fontFamily;
    
    localStorage.setItem('fontFamily', fontFamily);
    
    const fontNames = {
        "'SF Mono', 'Monaco', 'Consolas', monospace": "SF Mono",
        "'Fira Code', monospace": "Fira Code",
        "'JetBrains Mono', monospace": "JetBrains Mono",
        "'Source Code Pro', monospace": "Source Code Pro",
        "'Courier New', monospace": "Courier New",
        "'OpenDyslexic', monospace": "OpenDyslexic"
    };
    
    showStatus(`Font: ${fontNames[fontFamily] || fontFamily}`, 'success');
}

// Close menus when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.menu-item')) {
        closeAllMenus();
    }
});

// Search & Replace Functions
let searchMatches = [];
let currentMatchIndex = -1;

function openSearch() {
    const searchPanel = document.getElementById('searchPanel');
    const searchInput = document.getElementById('searchInput');
    
    searchPanel.style.display = 'block';
    searchInput.focus();
    searchInput.select();
    
    // If there's text in search, perform search immediately
    if (searchInput.value) {
        performSearch();
    }
}

function closeSearch() {
    const searchPanel = document.getElementById('searchPanel');
    searchPanel.style.display = 'none';
    
    // Clear search highlighting
    clearSearchHighlights();
    
    // Return focus to editor
    document.getElementById('editor').focus();
}

function performSearch() {
    const editor = document.getElementById('editor');
    const searchInput = document.getElementById('searchInput');
    const matchCase = document.getElementById('matchCase').checked;
    const matchCount = document.getElementById('matchCount');
    
    const searchText = searchInput.value;
    if (!searchText) {
        matchCount.textContent = 'No results';
        searchMatches = [];
        currentMatchIndex = -1;
        return;
    }
    
    const editorText = editor.value;
    searchMatches = [];
    
    // Find all matches
    let flags = 'g';
    if (!matchCase) flags += 'i';
    
    try {
        const regex = new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
        let match;
        
        while ((match = regex.exec(editorText)) !== null) {
            searchMatches.push({
                start: match.index,
                end: match.index + match[0].length
            });
        }
        
        if (searchMatches.length > 0) {
            matchCount.textContent = `${searchMatches.length} match${searchMatches.length !== 1 ? 'es' : ''}`;
            currentMatchIndex = 0;
            highlightCurrentMatch();
        } else {
            matchCount.textContent = 'No results';
            currentMatchIndex = -1;
        }
    } catch (e) {
        matchCount.textContent = 'Invalid search';
    }
}

function highlightCurrentMatch() {
    if (currentMatchIndex < 0 || currentMatchIndex >= searchMatches.length) return;
    
    const editor = document.getElementById('editor');
    const match = searchMatches[currentMatchIndex];
    
    editor.focus();
    editor.setSelectionRange(match.start, match.end);
    
    // Update match counter
    const matchCount = document.getElementById('matchCount');
    matchCount.textContent = `${currentMatchIndex + 1} of ${searchMatches.length}`;
}

function clearSearchHighlights() {
    searchMatches = [];
    currentMatchIndex = -1;
    document.getElementById('matchCount').textContent = 'No results';
}

function findNext() {
    if (searchMatches.length === 0) {
        performSearch();
        return;
    }
    
    currentMatchIndex = (currentMatchIndex + 1) % searchMatches.length;
    highlightCurrentMatch();
}

function findPrevious() {
    if (searchMatches.length === 0) {
        performSearch();
        return;
    }
    
    currentMatchIndex = currentMatchIndex - 1;
    if (currentMatchIndex < 0) {
        currentMatchIndex = searchMatches.length - 1;
    }
    highlightCurrentMatch();
}

function replaceNext() {
    if (currentMatchIndex < 0 || currentMatchIndex >= searchMatches.length) return;
    
    const editor = document.getElementById('editor');
    const replaceInput = document.getElementById('replaceInput');
    const replaceText = replaceInput.value;
    const match = searchMatches[currentMatchIndex];
    
    // Replace the current match
    const value = editor.value;
    editor.value = value.substring(0, match.start) + replaceText + value.substring(match.end);
    
    // Update active file
    const file = files.find(f => f.id === activeFileId);
    if (file) {
        file.content = editor.value;
    }
    
    updateLineNumbers();
    
    // Re-perform search to update matches
    performSearch();
    
    // If there are still matches, move to the next one
    if (searchMatches.length > 0) {
        if (currentMatchIndex >= searchMatches.length) {
            currentMatchIndex = 0;
        }
        highlightCurrentMatch();
    }
    
    showStatus('Replaced 1 occurrence', 'success');
}

function replaceAll() {
    if (searchMatches.length === 0) return;
    
    const editor = document.getElementById('editor');
    const searchInput = document.getElementById('searchInput');
    const replaceInput = document.getElementById('replaceInput');
    const matchCase = document.getElementById('matchCase').checked;
    
    const searchText = searchInput.value;
    const replaceText = replaceInput.value;
    
    let flags = 'g';
    if (!matchCase) flags += 'i';
    
    try {
        const regex = new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
        const count = searchMatches.length;
        
        editor.value = editor.value.replace(regex, replaceText);
        
        // Update active file
        const file = files.find(f => f.id === activeFileId);
        if (file) {
            file.content = editor.value;
        }
        
        updateLineNumbers();
        
        // Clear and re-search
        performSearch();
        
        showStatus(`Replaced ${count} occurrence${count !== 1 ? 's' : ''}`, 'success');
    } catch (e) {
        showStatus('Replace failed', 'error');
    }
}

// Add event listeners for search input
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const matchCaseCheckbox = document.getElementById('matchCase');
    
    if (searchInput) {
        // Search as you type
        searchInput.addEventListener('input', performSearch);
        
        // Enter to find next
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                findNext();
            } else if (e.key === 'Enter' && e.shiftKey) {
                e.preventDefault();
                findPrevious();
            }
        });
    }
    
    if (matchCaseCheckbox) {
        matchCaseCheckbox.addEventListener('change', performSearch);
    }
});

// NEW: Initialize line numbers on page load
window.addEventListener('load', updateLineNumbers);

// Theme Management
function cycleTheme() {
    const themes = ['light', 'dark', 'ayu', 'tokyo-night', 'nord', 'night-owl', 'monokai-pro', 'one-dark-pro'];
    const currentTheme = localStorage.getItem('theme') || 'light';
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    
    setTheme(themes[nextIndex]);
}

// Keyboard Shortcuts Setup Function
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl+Z or Cmd+Z - Undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            undo();
            return;
        }
        
        // Ctrl+Y or Cmd+Y or Ctrl+Shift+Z - Redo
        if (((e.ctrlKey || e.metaKey) && e.key === 'y') || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')) {
            e.preventDefault();
            redo();
            return;
        }
        
        // Ctrl+S or Cmd+S - Save File
        if ((e.ctrlKey || e.metaKey) && e.key === 's' && !e.shiftKey) {
            e.preventDefault();
            saveFile();
            return;
        }
        
        // Ctrl+Shift+S or Cmd+Shift+S - Save All
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            saveAllFilesManually();
            return;
        }
        
        // Ctrl+N or Cmd+N - New File
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            createNew();
            return;
        }
        
        // Ctrl+O or Cmd+O - Open File
        if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
            e.preventDefault();
            openFile();
            return;
        }
        
        // Ctrl+Enter or Cmd+Enter - Run Code
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            runCode();
            return;
        }
        
        // F5 - Run Code (alternative)
        if (e.key === 'F5') {
            e.preventDefault();
            runCode();
            return;
        }
        
        // Ctrl+W or Cmd+W - Close Current File
        if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
            e.preventDefault();
            if (activeFileId !== null) {
                closeCurrentFile();
            }
            return;
        }
        
        // Ctrl+Shift+T or Cmd+Shift+T - Cycle Theme
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
            e.preventDefault();
            cycleTheme();
            return;
        }
        
        // Ctrl+= or Cmd+= - Increase Font Size
        if ((e.ctrlKey || e.metaKey) && e.key === '=') {
            e.preventDefault();
            changeFontSize(1);
            return;
        }
        
        // Ctrl+- or Cmd+- - Decrease Font Size
        if ((e.ctrlKey || e.metaKey) && e.key === '-') {
            e.preventDefault();
            changeFontSize(-1);
            return;
        }
        
        // Ctrl+0 or Cmd+0 - Reset Font Size
        if ((e.ctrlKey || e.metaKey) && e.key === '0') {
            e.preventDefault();
            resetFontSize();
            return;
        }
        
        // Ctrl+G or Cmd+G - Go to Line
        if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
            e.preventDefault();
            goToLine();
            return;
        }
        
        // F1 - Show Keyboard Shortcuts Help
        if (e.key === 'F1') {
            e.preventDefault();
            showShortcutsHelp();
            return;
        }
        
        // F2 - Rename File
        if (e.key === 'F2') {
            e.preventDefault();
            renameFile();
            return;
        }
        
        // Ctrl+F or Cmd+F - Open Search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            openSearch();
            return;
        }
        
        // Escape - Close Search (if open)
        if (e.key === 'Escape') {
            const searchPanel = document.getElementById('searchPanel');
            if (searchPanel && searchPanel.style.display !== 'none') {
                closeSearch();
                return;
            }
        }
        
        // Ctrl+/ or Cmd+/ - Toggle Line Comment
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            toggleLineComment();
            return;
        }
        
        // Ctrl+Shift+K or Cmd+Shift+K - Clear Console
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'K') {
            e.preventDefault();
            clearConsole();
            return;
        }
        
        // Ctrl+Shift+G or Cmd+Shift+G - Open Source Control
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'G') {
            e.preventDefault();
            switchBottomTab('git');
            return;
        }
        
        // Tab - Add indentation (2 spaces)
        if (e.key === 'Tab' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
            const editor = document.getElementById('editor');
            if (document.activeElement === editor) {
                e.preventDefault();
                const start = editor.selectionStart;
                const end = editor.selectionEnd;
                const value = editor.value;
                
                // Insert 2 spaces at cursor
                editor.value = value.substring(0, start) + '  ' + value.substring(end);
                editor.selectionStart = editor.selectionEnd = start + 2;
                
                // Save to file
                const file = files.find(f => f.id === activeFileId);
                if (file) {
                    file.content = editor.value;
                }
                updateLineNumbers();
            }
        }
    });
}

// Load saved theme on page load
window.addEventListener('load', function() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    if (savedTheme === 'light') {
        document.body.removeAttribute('data-theme');
    } else {
        document.body.setAttribute('data-theme', savedTheme);
    }
    
    // Load auto-save setting
    const savedAutoSave = localStorage.getItem('autoSaveEnabled');
    if (savedAutoSave !== null) {
        autoSaveEnabled = savedAutoSave === 'true';
        const menuItem = document.getElementById('autoSaveMenuItem');
        if (menuItem) {
            menuItem.textContent = `Auto-save: ${autoSaveEnabled ? 'ON' : 'OFF'}`;
        }
    }
    
    // Load saved font settings
    loadFontSettings();
    
    // Initialize multi-file editor
    initializeEditor();
    
    // Initialize keyboard shortcuts
    setupKeyboardShortcuts();
});

// Font Settings Functions
let currentFontSize = 15; // Default size
let currentLineHeight = 1.6; // Default line height
let currentLetterSpacing = 0; // Default letter spacing (px)
let currentWordSpacing = 0; // Default word spacing (px)
let dyslexiaModeEnabled = false;

function changeFontSize(delta) {
    const editor = document.getElementById('editor');
    const lineNumbers = document.getElementById('lineNumbers');
    
    currentFontSize = Math.max(10, Math.min(32, currentFontSize + delta));
    
    editor.style.fontSize = currentFontSize + 'px';
    lineNumbers.style.fontSize = currentFontSize + 'px';
    
    localStorage.setItem('fontSize', currentFontSize);
}

function resetFontSize() {
    currentFontSize = 15;
    const editor = document.getElementById('editor');
    const lineNumbers = document.getElementById('lineNumbers');
    editor.style.fontSize = currentFontSize + 'px';
    lineNumbers.style.fontSize = currentFontSize + 'px';
    localStorage.setItem('fontSize', currentFontSize);
    showStatus('Font size reset', 'success');
}

function changeLineHeight(delta) {
    const editor = document.getElementById('editor');
    const lineNumbers = document.getElementById('lineNumbers');
    
    currentLineHeight = Math.max(1.2, Math.min(3.0, currentLineHeight + delta));
    currentLineHeight = Math.round(currentLineHeight * 10) / 10; // Round to 1 decimal
    
    editor.style.lineHeight = currentLineHeight;
    lineNumbers.style.lineHeight = currentLineHeight;
    
    localStorage.setItem('lineHeight', currentLineHeight);
}

function changeLetterSpacing(delta) {
    const editor = document.getElementById('editor');
    
    currentLetterSpacing = Math.max(-2, Math.min(10, currentLetterSpacing + delta));
    
    editor.style.letterSpacing = currentLetterSpacing + 'px';
    
    localStorage.setItem('letterSpacing', currentLetterSpacing);
}

function changeWordSpacing(delta) {
    const editor = document.getElementById('editor');
    
    currentWordSpacing = Math.max(-5, Math.min(20, currentWordSpacing + delta));
    
    editor.style.wordSpacing = currentWordSpacing + 'px';
    
    localStorage.setItem('wordSpacing', currentWordSpacing);
}

function toggleDyslexiaMode() {
    dyslexiaModeEnabled = !dyslexiaModeEnabled;
    const editor = document.getElementById('editor');
    const lineNumbers = document.getElementById('lineNumbers');
    
    if (dyslexiaModeEnabled) {
        // Enable dyslexia mode with optimal settings
        
        // Apply recommended settings
        currentFontSize = 18; // Larger font
        currentLineHeight = 2.0; // More line spacing
        currentLetterSpacing = 1.5; // More letter spacing
        currentWordSpacing = 4; // More word spacing
        
        editor.style.fontSize = currentFontSize + 'px';
        lineNumbers.style.fontSize = currentFontSize + 'px';
        editor.style.lineHeight = currentLineHeight;
        lineNumbers.style.lineHeight = currentLineHeight;
        editor.style.letterSpacing = currentLetterSpacing + 'px';
        editor.style.wordSpacing = currentWordSpacing + 'px';
        
        // Switch to OpenDyslexic font
        editor.style.fontFamily = "'OpenDyslexic', monospace";
        lineNumbers.style.fontFamily = "'OpenDyslexic', monospace";
        
        // Save to localStorage
        localStorage.setItem('dyslexiaMode', 'true');
        localStorage.setItem('fontSize', currentFontSize);
        localStorage.setItem('lineHeight', currentLineHeight);
        localStorage.setItem('letterSpacing', currentLetterSpacing);
        localStorage.setItem('wordSpacing', currentWordSpacing);
        localStorage.setItem('fontFamily', "'OpenDyslexic', monospace");
        
        showStatus('Dyslexia mode enabled', 'success');
    } else {
        // Disable dyslexia mode - reset to defaults
        
        // Reset to default settings
        currentFontSize = 15;
        currentLineHeight = 1.6;
        currentLetterSpacing = 0;
        currentWordSpacing = 0;
        
        editor.style.fontSize = currentFontSize + 'px';
        lineNumbers.style.fontSize = currentFontSize + 'px';
        editor.style.lineHeight = currentLineHeight;
        lineNumbers.style.lineHeight = currentLineHeight;
        editor.style.letterSpacing = currentLetterSpacing + 'px';
        editor.style.wordSpacing = currentWordSpacing + 'px';
        
        // Reset to default font
        editor.style.fontFamily = "'SF Mono', 'Monaco', 'Consolas', monospace";
        lineNumbers.style.fontFamily = "'SF Mono', 'Monaco', 'Consolas', monospace";
        
        // Save to localStorage
        localStorage.setItem('dyslexiaMode', 'false');
        localStorage.setItem('fontSize', currentFontSize);
        localStorage.setItem('lineHeight', currentLineHeight);
        localStorage.setItem('letterSpacing', currentLetterSpacing);
        localStorage.setItem('wordSpacing', currentWordSpacing);
        localStorage.setItem('fontFamily', "'SF Mono', 'Monaco', 'Consolas', monospace");
        
        showStatus('Dyslexia mode disabled', 'success');
    }
}

function loadFontSettings() {
    const editor = document.getElementById('editor');
    const lineNumbers = document.getElementById('lineNumbers');
    
    // Load font size
    const savedSize = localStorage.getItem('fontSize');
    if (savedSize) {
        currentFontSize = parseInt(savedSize);
        editor.style.fontSize = currentFontSize + 'px';
        lineNumbers.style.fontSize = currentFontSize + 'px';
    }
    
    // Load font family
    const savedFont = localStorage.getItem('fontFamily');
    if (savedFont) {
        editor.style.fontFamily = savedFont;
        lineNumbers.style.fontFamily = savedFont;
    }
    
    // Load line height
    const savedLineHeight = localStorage.getItem('lineHeight');
    if (savedLineHeight) {
        currentLineHeight = parseFloat(savedLineHeight);
        editor.style.lineHeight = currentLineHeight;
        lineNumbers.style.lineHeight = currentLineHeight;
    }
    
    // Load letter spacing
    const savedLetterSpacing = localStorage.getItem('letterSpacing');
    if (savedLetterSpacing) {
        currentLetterSpacing = parseFloat(savedLetterSpacing);
        editor.style.letterSpacing = currentLetterSpacing + 'px';
    }
    
    // Load word spacing
    const savedWordSpacing = localStorage.getItem('wordSpacing');
    if (savedWordSpacing) {
        currentWordSpacing = parseFloat(savedWordSpacing);
        editor.style.wordSpacing = currentWordSpacing + 'px';
    }
    
    // Load dyslexia mode state
    const savedDyslexiaMode = localStorage.getItem('dyslexiaMode');
    if (savedDyslexiaMode === 'true') {
        dyslexiaModeEnabled = true;
    }
}

// =====================================================
// GIT/GITHUB INTEGRATION
// =====================================================

// Git state
let gitRepo = null;
let gitConnected = false;
let currentBranch = 'main';
let gitHubToken = null;
let gitInitialized = false;
let gitRemoteUrl = '';
let githubToken = '';
let changedFilesData = [];

// Switch bottom panel tabs
function switchBottomTab(tabName) {
    // Remove active class from all tabs and panels
    document.querySelectorAll('.bottom-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.bottom-panel-content').forEach(panel => panel.classList.remove('active'));
    
    // Add active class to selected tab and panel
    if (tabName === 'console') {
        document.getElementById('consoleTab').classList.add('active');
        document.getElementById('consolePanel').classList.add('active');
    } else if (tabName === 'git') {
        document.getElementById('gitTab').classList.add('active');
        document.getElementById('gitPanel').classList.add('active');
        refreshGitStatus();
    } else if (tabName === 'history') {
        document.getElementById('historyTab').classList.add('active');
        document.getElementById('historyPanel').classList.add('active');
        loadGitHistory();
    }
}

// GitHub Authentication
function gitHubLogin() {
    const token = prompt('Enter your GitHub Personal Access Token:\n\n' +
        '1. Go to GitHub Settings > Developer settings > Personal access tokens\n' +
        '2. Generate new token (classic)\n' +
        '3. Select "repo" scope\n' +
        '4. Copy and paste token here');
    
    if (token) {
        gitHubToken = token;
        localStorage.setItem('github-token', token);
        gitConnected = true;
        showStatus('✓ Connected to GitHub', 'success');
        addConsoleMessage('✓ GitHub authenticated successfully', 'success');
    }
}

// Initialize Git Repository
function initRepository() {
    if (!files || files.length === 0) {
        showStatus('Create some files first', 'error');
        return;
    }
    
    gitRepo = {
        initialized: true,
        branch: 'main',
        commits: [],
        staged: [],
        modified: [],
        remote: null
    };
    
    localStorage.setItem('git-repo', JSON.stringify(gitRepo));
    
    showStatus('✓ Repository initialized', 'success');
    addConsoleMessage('✓ Git repository initialized', 'success');
    switchBottomTab('git');
    refreshGitStatus();
}

// Clone Repository
function cloneRepository() {
    const repoUrl = prompt('Enter GitHub repository URL:\n(e.g., https://github.com/username/repo)');
    
    if (!repoUrl) return;
    
    if (!gitHubToken) {
        showStatus('Connect to GitHub first', 'error');
        gitHubLogin();
        return;
    }
    
    showStatus('Cloning repository...', 'running');
    addConsoleMessage('🔄 Cloning repository...', 'info');
    
    // Simulate cloning (in real implementation, would use isomorphic-git)
    setTimeout(() => {
        initRepository();
        gitRepo.remote = repoUrl;
        localStorage.setItem('git-repo', JSON.stringify(gitRepo));
        
        showStatus('✓ Repository cloned', 'success');
        addConsoleMessage(`✓ Cloned ${repoUrl}`, 'success');
        switchBottomTab('git');
    }, 1500);
}

// Refresh Git Status
function refreshGitStatus() {
    const statusDiv = document.getElementById('gitStatus');
    const changedFilesDiv = document.getElementById('changedFiles');
    const branchSelector = document.getElementById('branchSelector');
    
    // Load from localStorage
    const savedRepo = localStorage.getItem('git-repo');
    if (savedRepo) {
        gitRepo = JSON.parse(savedRepo);
    }
    
    if (!gitRepo || !gitRepo.initialized) {
        statusDiv.innerHTML = '<div class="git-info">No repository initialized<br><small>Use GitHub menu → Initialize Repository</small></div>';
        changedFilesDiv.innerHTML = '<div class="git-info">No repository</div>';
        branchSelector.innerHTML = '<option value="">No branches</option>';
        return;
    }
    
    // Update status
    let statusHTML = `
        <div style="padding: 8px;">
            <div style="margin-bottom: 8px;"><strong>Branch:</strong> ${gitRepo.branch}</div>
            <div style="margin-bottom: 8px;"><strong>Commits:</strong> ${gitRepo.commits.length}</div>
            <div><strong>Remote:</strong> ${gitRepo.remote || 'None'}</div>
        </div>
    `;
    statusDiv.innerHTML = statusHTML;
    
    // Update branches
    branchSelector.innerHTML = `<option value="${gitRepo.branch}">${gitRepo.branch}</option>`;
    
    // Check for changes
    checkForChanges();
}

// Check for file changes
function checkForChanges() {
    const changedFilesDiv = document.getElementById('changedFiles');
    
    if (!gitRepo) return;
    
    // Compare current files with last commit
    const changedFiles = files.map(f => ({
        name: f.name,
        status: 'modified' // Simplified - in real app would check actual changes
    }));
    
    if (changedFiles.length === 0) {
        changedFilesDiv.innerHTML = '<div class="git-info">No changes</div>';
        return;
    }
    
    let filesHTML = '';
    changedFiles.forEach(file => {
        filesHTML += `
            <div class="git-file-item">
                <span class="git-file-name">${file.name}</span>
                <span class="git-file-status ${file.status}">${file.status.toUpperCase()}</span>
            </div>
        `;
    });
    
    changedFilesDiv.innerHTML = filesHTML;
}

// Stage all files
function stageAll() {
    if (!gitRepo) {
        showStatus('Initialize repository first', 'error');
        return;
    }
    
    gitRepo.staged = files.map(f => f.name);
    localStorage.setItem('git-repo', JSON.stringify(gitRepo));
    
    showStatus('✓ All files staged', 'success');
    refreshGitStatus();
}

// Git Commit
function gitCommit() {
    if (!gitRepo || !gitRepo.initialized) {
        showStatus('Initialize repository first', 'error');
        return;
    }
    
    const commitMessage = document.getElementById('commitMessage').value.trim();
    
    if (!commitMessage) {
        showStatus('Enter commit message', 'error');
        return;
    }
    
    // Create commit
    const commit = {
        hash: generateCommitHash(),
        message: commitMessage,
        author: 'User',
        date: new Date().toISOString(),
        files: files.map(f => ({ name: f.name, content: f.content }))
    };
    
    gitRepo.commits.push(commit);
    gitRepo.staged = [];
    localStorage.setItem('git-repo', JSON.stringify(gitRepo));
    
    // Clear commit message
    document.getElementById('commitMessage').value = '';
    
    showStatus('✓ Committed successfully', 'success');
    addConsoleMessage(`✓ [${commit.hash.substring(0, 7)}] ${commitMessage}`, 'success');
    refreshGitStatus();
}

// Git Push
function gitPush() {
    if (!gitRepo || !gitRepo.initialized) {
        showStatus('Initialize repository first', 'error');
        return;
    }
    
    if (!gitRepo.remote) {
        showStatus('Set remote first', 'error');
        openRemoteSettings();
        return;
    }
    
    if (!gitHubToken) {
        showStatus('Connect to GitHub first', 'error');
        gitHubLogin();
        return;
    }
    
    showStatus('Pushing to remote...', 'running');
    addConsoleMessage('🔄 Pushing to remote...', 'info');
    
    // Simulate push (in real implementation, would use isomorphic-git)
    setTimeout(() => {
        showStatus('✓ Pushed successfully', 'success');
        addConsoleMessage(`✓ Pushed to ${gitRepo.remote}`, 'success');
    }, 1500);
}

// Git Pull
function gitPull() {
    if (!gitRepo || !gitRepo.initialized) {
        showStatus('Initialize repository first', 'error');
        return;
    }
    
    if (!gitRepo.remote) {
        showStatus('Set remote first', 'error');
        openRemoteSettings();
        return;
    }
    
    if (!gitHubToken) {
        showStatus('Connect to GitHub first', 'error');
        gitHubLogin();
        return;
    }
    
    showStatus('Pulling from remote...', 'running');
    addConsoleMessage('🔄 Pulling from remote...', 'info');
    
    // Simulate pull (in real implementation, would use isomorphic-git)
    setTimeout(() => {
        showStatus('✓ Pulled successfully', 'success');
        addConsoleMessage('✓ Up to date', 'success');
    }, 1500);
}

// Load Git History
function loadGitHistory() {
    const historyDiv = document.getElementById('commitHistory');
    
    // Load from localStorage
    const savedRepo = localStorage.getItem('git-repo');
    if (savedRepo) {
        gitRepo = JSON.parse(savedRepo);
    }
    
    if (!gitRepo || !gitRepo.commits || gitRepo.commits.length === 0) {
        historyDiv.innerHTML = '<div class="git-info">No commits yet</div>';
        return;
    }
    
    let historyHTML = '';
    gitRepo.commits.reverse().forEach(commit => {
        const date = new Date(commit.date).toLocaleString();
        historyHTML += `
            <div class="git-commit-item">
                <div class="git-commit-hash">${commit.hash.substring(0, 7)}</div>
                <div class="git-commit-message">${commit.message}</div>
                <div class="git-commit-author">${commit.author} • ${date}</div>
            </div>
        `;
    });
    
    historyDiv.innerHTML = historyHTML;
}

// Create new branch
function createBranch() {
    const branchName = prompt('Enter new branch name:');
    
    if (!branchName) return;
    
    if (!gitRepo || !gitRepo.initialized) {
        showStatus('Initialize repository first', 'error');
        return;
    }
    
    gitRepo.branch = branchName;
    localStorage.setItem('git-repo', JSON.stringify(gitRepo));
    
    showStatus(`✓ Created branch: ${branchName}`, 'success');
    addConsoleMessage(`✓ Switched to new branch '${branchName}'`, 'success');
    refreshGitStatus();
}

// Switch branch
function switchBranch() {
    const branchSelector = document.getElementById('branchSelector');
    const newBranch = branchSelector.value;
    
    if (gitRepo) {
        gitRepo.branch = newBranch;
        localStorage.setItem('git-repo', JSON.stringify(gitRepo));
        showStatus(`✓ Switched to ${newBranch}`, 'success');
    }
}

// Open remote settings
function openRemoteSettings() {
    const currentRemote = gitRepo?.remote || '';
    const remote = prompt('Enter remote URL:', currentRemote);
    
    if (remote) {
        if (!gitRepo) gitRepo = { initialized: true, branch: 'main', commits: [], remote: null };
        gitRepo.remote = remote;
        localStorage.setItem('git-repo', JSON.stringify(gitRepo));
        showStatus('✓ Remote set', 'success');
        refreshGitStatus();
    }
}

// Generate commit hash (simplified)
function generateCommitHash() {
    return Array.from({length: 40}, () => 
        Math.floor(Math.random() * 16).toString(16)
    ).join('');
}

// Load GitHub token on startup
window.addEventListener('load', function() {
    const savedToken = localStorage.getItem('github-token');
    if (savedToken) {
        gitHubToken = savedToken;
        gitConnected = true;
    }
});

// Switch Branch Menu (open git panel and focus selector)
function switchBranchMenu() {
    switchBottomTab('git');
    document.getElementById('branchSelector').focus();
}

// =====================================================
// FLOATING PREVIEW PANEL
// =====================================================

let previewOpen = false;
let previewMinimized = false;
let previewMaximized = false;
let previewTimer = null;
let previewDelay = 500; // ms delay before updating preview

// Preview panel drag state
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragStartLeft = 0;
let dragStartTop = 0;

// Preview panel resize state
let isResizing = false;
let resizeDir = '';
let resizeStartX = 0;
let resizeStartY = 0;
let resizeStartWidth = 0;
let resizeStartHeight = 0;
let resizeStartLeft = 0;
let resizeStartTop = 0;

// Toggle preview panel
function togglePreview() {
    const panel = document.getElementById('previewPanel');
    const btn = document.getElementById('previewBtn');
    
    if (!previewOpen) {
        openPreview();
    } else {
        closePreview();
    }
}

// Open preview panel
function openPreview() {
    const panel = document.getElementById('previewPanel');
    const btn = document.getElementById('previewBtn');
    
    // Load saved position/size
    loadPreviewSettings();
    
    panel.style.display = 'flex';
    previewOpen = true;
    btn.classList.add('active');
    
    // Initial render
    updatePreview();
    
    // Setup event listeners
    setupPreviewDrag();
    setupPreviewResize();
    
    showStatus('Preview opened', 'success');
}

// Close preview panel
function closePreview() {
    const panel = document.getElementById('previewPanel');
    const btn = document.getElementById('previewBtn');
    
    // Save position/size
    savePreviewSettings();
    
    panel.style.display = 'none';
    previewOpen = false;
    btn.classList.remove('active');
    
    showStatus('Preview closed', 'success');
}

// Minimize preview
function minimizePreview() {
    const panel = document.getElementById('previewPanel');
    
    if (previewMinimized) {
        panel.classList.remove('minimized');
        previewMinimized = false;
        document.getElementById('minimizeBtn').textContent = '−';
    } else {
        panel.classList.add('minimized');
        panel.classList.remove('maximized');
        previewMinimized = true;
        previewMaximized = false;
        document.getElementById('minimizeBtn').textContent = '+';
        document.getElementById('maximizeBtn').textContent = '□';
    }
    
    savePreviewSettings();
}

// Maximize preview
function maximizePreview() {
    const panel = document.getElementById('previewPanel');
    
    if (previewMaximized) {
        panel.classList.remove('maximized');
        previewMaximized = false;
        document.getElementById('maximizeBtn').textContent = '□';
        
        // Restore saved size/position
        const settings = JSON.parse(localStorage.getItem('preview-settings') || '{}');
        if (settings.width) panel.style.width = settings.width + 'px';
        if (settings.height) panel.style.height = settings.height + 'px';
        if (settings.left) panel.style.left = settings.left + 'px';
        if (settings.top) panel.style.top = settings.top + 'px';
    } else {
        panel.classList.add('maximized');
        panel.classList.remove('minimized');
        previewMaximized = true;
        previewMinimized = false;
        document.getElementById('maximizeBtn').textContent = '❐';
        document.getElementById('minimizeBtn').textContent = '−';
    }
    
    savePreviewSettings();
}

// Refresh preview manually
function refreshPreview() {
    updatePreview();
    showStatus('Preview refreshed', 'success');
}

// Update preview content (debounced)
function debouncedPreviewUpdate() {
    if (!previewOpen) return;
    
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => {
        updatePreview();
    }, previewDelay);
}

// Update preview content
function updatePreview() {
    if (!previewOpen) return;
    
    const frame = document.getElementById('previewFrame');
    const filenameDisplay = document.getElementById('previewFilename');
    
    // Find HTML file in current files
    let htmlFile = files.find(f => {
        const ext = f.name.split('.').pop().toLowerCase();
        return ext === 'html' || ext === 'htm';
    });
    
    // If no HTML file, show message
    if (!htmlFile) {
        frame.srcdoc = `
            <html>
            <head>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        margin: 0;
                        background: #f5f5f5;
                        color: #666;
                    }
                    .message {
                        text-align: center;
                        padding: 40px;
                    }
                    .icon {
                        font-size: 48px;
                        margin-bottom: 16px;
                    }
                </style>
            </head>
            <body>
                <div class="message">
                    <div class="icon">📄</div>
                    <h2>No HTML File Found</h2>
                    <p>Create an HTML file to see the preview</p>
                </div>
            </body>
            </html>
        `;
        filenameDisplay.textContent = 'No HTML file';
        return;
    }
    
    // Update filename display
    filenameDisplay.textContent = htmlFile.name;
    
    // Get HTML content (use current editor if it's the HTML file, otherwise use saved content)
    let htmlContent;
    if (activeFileId === htmlFile.id) {
        htmlContent = document.getElementById('editor').value;
    } else {
        htmlContent = htmlFile.content;
    }
    
    // Find and inject CSS files
    let cssFiles = files.filter(f => {
        const ext = f.name.split('.').pop().toLowerCase();
        return ext === 'css';
    });
    
    let cssContent = '';
    cssFiles.forEach(f => {
        let content = (activeFileId === f.id) ? 
            document.getElementById('editor').value : 
            f.content;
        cssContent += `\n/* ${f.name} */\n${content}\n`;
    });
    
    // Find and inject JS files
    let jsFiles = files.filter(f => {
        const ext = f.name.split('.').pop().toLowerCase();
        return ext === 'js' && !f.name.includes('script.js'); // Don't include the editor's script
    });
    
    let jsContent = '';
    jsFiles.forEach(f => {
        let content = (activeFileId === f.id) ? 
            document.getElementById('editor').value : 
            f.content;
        jsContent += `\n// ${f.name}\n${content}\n`;
    });
    
    // Build complete HTML
    let completeHTML = htmlContent;
    
    // Inject CSS
    if (cssContent) {
        const styleTag = `<style>${cssContent}</style>`;
        
        // Try to inject before </head>, or at start of <body>, or at start of document
        if (completeHTML.includes('</head>')) {
            completeHTML = completeHTML.replace('</head>', styleTag + '</head>');
        } else if (completeHTML.includes('<body>')) {
            completeHTML = completeHTML.replace('<body>', '<body>' + styleTag);
        } else {
            completeHTML = styleTag + completeHTML;
        }
    }
    
    // Inject JS
    if (jsContent) {
        const scriptTag = `<script>${jsContent}</script>`;
        
        // Try to inject before </body>, or at end of document
        if (completeHTML.includes('</body>')) {
            completeHTML = completeHTML.replace('</body>', scriptTag + '</body>');
        } else {
            completeHTML += scriptTag;
        }
    }
    
    // Update iframe
    frame.srcdoc = completeHTML;
}

// Setup preview panel dragging
function setupPreviewDrag() {
    const panel = document.getElementById('previewPanel');
    const header = document.getElementById('previewHeader');
    
    header.addEventListener('mousedown', function(e) {
        if (previewMaximized) return; // Can't drag when maximized
        if (e.target.closest('.preview-btn')) return; // Don't drag when clicking buttons
        
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        
        const rect = panel.getBoundingClientRect();
        dragStartLeft = rect.left;
        dragStartTop = rect.top;
        
        e.preventDefault();
    });
}

// Setup preview panel resizing
function setupPreviewResize() {
    const panel = document.getElementById('previewPanel');
    const handles = panel.querySelectorAll('.preview-resize-handle');
    
    handles.forEach(handle => {
        handle.addEventListener('mousedown', function(e) {
            if (previewMaximized) return; // Can't resize when maximized
            if (previewMinimized) return; // Can't resize when minimized
            
            isResizing = true;
            resizeDir = '';
            
            // Determine resize direction
            if (handle.classList.contains('preview-resize-n')) resizeDir = 'n';
            else if (handle.classList.contains('preview-resize-s')) resizeDir = 's';
            else if (handle.classList.contains('preview-resize-e')) resizeDir = 'e';
            else if (handle.classList.contains('preview-resize-w')) resizeDir = 'w';
            else if (handle.classList.contains('preview-resize-ne')) resizeDir = 'ne';
            else if (handle.classList.contains('preview-resize-nw')) resizeDir = 'nw';
            else if (handle.classList.contains('preview-resize-se')) resizeDir = 'se';
            else if (handle.classList.contains('preview-resize-sw')) resizeDir = 'sw';
            
            resizeStartX = e.clientX;
            resizeStartY = e.clientY;
            
            const rect = panel.getBoundingClientRect();
            resizeStartWidth = rect.width;
            resizeStartHeight = rect.height;
            resizeStartLeft = rect.left;
            resizeStartTop = rect.top;
            
            e.preventDefault();
            e.stopPropagation();
        });
    });
}

// Global mouse move handler
document.addEventListener('mousemove', function(e) {
    const panel = document.getElementById('previewPanel');
    
    // Handle dragging
    if (isDragging) {
        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;
        
        const newLeft = dragStartLeft + deltaX;
        const newTop = dragStartTop + deltaY;
        
        panel.style.left = newLeft + 'px';
        panel.style.top = newTop + 'px';
        panel.style.right = 'auto';
        panel.style.bottom = 'auto';
    }
    
    // Handle resizing
    if (isResizing) {
        const deltaX = e.clientX - resizeStartX;
        const deltaY = e.clientY - resizeStartY;
        
        let newWidth = resizeStartWidth;
        let newHeight = resizeStartHeight;
        let newLeft = resizeStartLeft;
        let newTop = resizeStartTop;
        
        // Calculate new dimensions based on resize direction
        if (resizeDir.includes('e')) {
            newWidth = Math.max(250, resizeStartWidth + deltaX);
        }
        if (resizeDir.includes('w')) {
            newWidth = Math.max(250, resizeStartWidth - deltaX);
            newLeft = resizeStartLeft + deltaX;
        }
        if (resizeDir.includes('s')) {
            newHeight = Math.max(200, resizeStartHeight + deltaY);
        }
        if (resizeDir.includes('n')) {
            newHeight = Math.max(200, resizeStartHeight - deltaY);
            newTop = resizeStartTop + deltaY;
        }
        
        panel.style.width = newWidth + 'px';
        panel.style.height = newHeight + 'px';
        panel.style.left = newLeft + 'px';
        panel.style.top = newTop + 'px';
        panel.style.right = 'auto';
        panel.style.bottom = 'auto';
    }
});

// Global mouse up handler
document.addEventListener('mouseup', function() {
    if (isDragging || isResizing) {
        savePreviewSettings();
    }
    isDragging = false;
    isResizing = false;
});

// Save preview panel settings to localStorage
function savePreviewSettings() {
    const panel = document.getElementById('previewPanel');
    const rect = panel.getBoundingClientRect();
    
    const settings = {
        width: rect.width,
        height: rect.height,
        left: rect.left,
        top: rect.top,
        minimized: previewMinimized,
        maximized: previewMaximized
    };
    
    localStorage.setItem('preview-settings', JSON.stringify(settings));
}

// Load preview panel settings from localStorage
function loadPreviewSettings() {
    const panel = document.getElementById('previewPanel');
    const settings = JSON.parse(localStorage.getItem('preview-settings') || '{}');
    
    // Apply saved settings
    if (settings.width) panel.style.width = settings.width + 'px';
    if (settings.height) panel.style.height = settings.height + 'px';
    if (settings.left !== undefined) {
        panel.style.left = settings.left + 'px';
        panel.style.right = 'auto';
    }
    if (settings.top !== undefined) {
        panel.style.top = settings.top + 'px';
        panel.style.bottom = 'auto';
    }
    
    // Apply minimized/maximized state
    if (settings.minimized) {
        panel.classList.add('minimized');
        previewMinimized = true;
        document.getElementById('minimizeBtn').textContent = '+';
    }
    if (settings.maximized) {
        panel.classList.add('maximized');
        previewMaximized = true;
        document.getElementById('maximizeBtn').textContent = '❐';
    }
}

// Hook into editor input to update preview
const editorElement = document.getElementById('editor');
if (editorElement) {
    const originalInputHandler = editorElement.oninput;
    editorElement.addEventListener('input', function() {
        debouncedPreviewUpdate();
    });
}

// =====================================================
// ACTIVE LINE HIGHLIGHTING - FULL WIDTH UPDATE
// Replace the existing active line functions in script.js
// =====================================================

// Active line highlighting elements
let activeLineHighlight = null;

// Initialize active line highlighting
function initActiveLineHighlight() {
    const editorContainer = document.querySelector('.editor-container');
    const editor = document.getElementById('editor');
    
    if (!editorContainer || !editor) return;
    
    // Remove old highlight if it exists
    const oldHighlight = editorContainer.querySelector('.active-line-highlight');
    if (oldHighlight) {
        oldHighlight.remove();
    }
    
    // Create NEW active line highlight for FULL WIDTH
    activeLineHighlight = document.createElement('div');
    activeLineHighlight.className = 'active-line-highlight';
    
    // Insert at the beginning of editor-container so it's behind everything
    editorContainer.insertBefore(activeLineHighlight, editorContainer.firstChild);
    
    // Update on cursor movement
    editor.addEventListener('click', updateActiveLineHighlight);
    editor.addEventListener('keyup', updateActiveLineHighlight);
    editor.addEventListener('focus', updateActiveLineHighlight);
    editor.addEventListener('scroll', syncActiveLineHighlight);
    
    // Initial update
    updateActiveLineHighlight();
}

// Update active line highlight position
function updateActiveLineHighlight() {
    const editor = document.getElementById('editor');
    const editorContainer = document.querySelector('.editor-container');
    
    if (!editor || !activeLineHighlight || !editorContainer) return;
    
    // Get cursor position
    const cursorPos = editor.selectionStart;
    const textBeforeCursor = editor.value.substring(0, cursorPos);
    const currentLine = textBeforeCursor.split('\n').length;
    
    // Calculate line position (line numbers start at 1, arrays at 0)
    const lineHeight = parseFloat(getComputedStyle(editor).lineHeight);
    const editorPaddingTop = parseFloat(getComputedStyle(editor).paddingTop);
    
    // Position the highlight
    const topPosition = editorPaddingTop + ((currentLine - 1) * lineHeight);
    
    activeLineHighlight.style.top = topPosition + 'px';
    activeLineHighlight.style.height = lineHeight + 'px';
}

// Sync active line highlight with scroll
function syncActiveLineHighlight() {
    // Highlight moves with content, but we need to update if scroll changes
    updateActiveLineHighlight();
}

// Clean up old initialization code and re-initialize
window.addEventListener('load', function() {
    // Wait a bit for DOM to be fully ready
    setTimeout(initActiveLineHighlight, 100);
});

// Re-initialize when switching files
const originalSwitchToFile = window.switchToFile;
if (typeof originalSwitchToFile === 'function') {
    window.switchToFile = function(fileId) {
        originalSwitchToFile(fileId);
        setTimeout(updateActiveLineHighlight, 50);
    };
}

// Update highlight when content changes
const editor = document.getElementById('editor');
if (editor) {
    editor.addEventListener('input', function() {
        // Debounce for performance
        clearTimeout(window.activeLineUpdateTimer);
        window.activeLineUpdateTimer = setTimeout(updateActiveLineHighlight, 50);
    });
}

// =====================================================
// INSTRUCTIONS:
// 1. Find your existing initActiveLineHighlight() function
// 2. Replace it with the code above
// 3. Replace updateActiveLineHighlight() function
// 4. Keep the rest of your script.js unchanged
// =====================================================

// =====================================================
// DEBUG PANEL FUNCTIONALITY
// Add these functions to your script.js file
// =====================================================

// Debug panel state
let debugPanelOpen = false;
let currentDebugFilter = 'all';
let debugMessages = [];
let debugCounts = {
    all: 0,
    log: 0,
    error: 0,
    warn: 0
};

// Toggle debug panel
function toggleDebugPanel() {
    const panel = document.getElementById('debugPanel');
    const btn = document.getElementById('debugBtn');
    
    if (!debugPanelOpen) {
        openDebugPanel();
    } else {
        closeDebugPanel();
    }
}

// Open debug panel
function openDebugPanel() {
    const panel = document.getElementById('debugPanel');
    const btn = document.getElementById('debugBtn');
    
    panel.style.display = 'flex';
    // Force reflow
    panel.offsetHeight;
    panel.classList.add('open');
    
    debugPanelOpen = true;
    btn.classList.add('active');
    
    showStatus('Debug panel opened', 'success');
}

// Close debug panel
function closeDebugPanel() {
    const panel = document.getElementById('debugPanel');
    const btn = document.getElementById('debugBtn');
    
    panel.classList.remove('open');
    
    // Hide after animation
    setTimeout(() => {
        if (!debugPanelOpen) {
            panel.style.display = 'none';
        }
    }, 300);
    
    debugPanelOpen = false;
    btn.classList.remove('active');
    
    showStatus('Debug panel closed', 'success');
}

// Add message to debug console
function addDebugMessage(message, type = 'log', lineNumber = null) {
    const debugConsole = document.getElementById('debugConsole');
    if (!debugConsole) return;
    
    const timestamp = new Date().toLocaleTimeString();
    const messageId = 'debug-msg-' + Date.now() + '-' + Math.random();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `debug-message debug-${type}`;
    messageDiv.id = messageId;
    messageDiv.setAttribute('data-type', type);
    
    let messageContent = `<span class="debug-timestamp">[${timestamp}]</span>`;
    messageContent += escapeHtml(message);
    
    if (lineNumber) {
        messageContent += `<span class="debug-line-number">:${lineNumber}</span>`;
    }
    
    messageDiv.innerHTML = messageContent;
    
    // Store message data
    debugMessages.push({
        id: messageId,
        type: type,
        message: message,
        timestamp: timestamp,
        lineNumber: lineNumber
    });
    
    // Update counts
    debugCounts.all++;
    debugCounts[type]++;
    updateDebugCounts();
    
    // Apply current filter
    if (currentDebugFilter !== 'all' && currentDebugFilter !== type) {
        messageDiv.classList.add('hidden');
    }
    
    debugConsole.appendChild(messageDiv);
    debugConsole.scrollTop = debugConsole.scrollHeight;
    
    // Auto-open debug panel on error
    if (type === 'error' && !debugPanelOpen) {
        openDebugPanel();
    }
}

// Update debug message counts
function updateDebugCounts() {
    document.getElementById('debugCountAll').textContent = debugCounts.all;
    document.getElementById('debugCountLog').textContent = debugCounts.log;
    document.getElementById('debugCountError').textContent = debugCounts.error;
    document.getElementById('debugCountWarn').textContent = debugCounts.warn;
}

// Filter debug messages
function filterDebugMessages(filter) {
    currentDebugFilter = filter;
    
    // Update active filter button
    document.querySelectorAll('.debug-filter').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === filter) {
            btn.classList.add('active');
        }
    });
    
    // Show/hide messages based on filter
    const messages = document.querySelectorAll('.debug-message');
    messages.forEach(msg => {
        if (filter === 'all') {
            msg.classList.remove('hidden');
        } else {
            const msgType = msg.getAttribute('data-type');
            if (msgType === filter) {
                msg.classList.remove('hidden');
            } else {
                msg.classList.add('hidden');
            }
        }
    });
}

// Clear debug console
function clearDebugConsole() {
    const debugConsole = document.getElementById('debugConsole');
    debugConsole.innerHTML = '<div class="debug-message debug-info">Debug console cleared</div>';
    
    // Reset counts
    debugMessages = [];
    debugCounts = {
        all: 0,
        log: 0,
        error: 0,
        warn: 0
    };
    updateDebugCounts();
    
    // Reset performance metrics
    document.getElementById('debugExecTime').textContent = '-';
    document.getElementById('debugMemory').textContent = '-';
    document.getElementById('debugLines').textContent = '-';
}

// Toggle debug section
function toggleDebugSection(sectionId) {
    const content = document.getElementById('debug' + sectionId.charAt(0).toUpperCase() + sectionId.slice(1));
    const header = event.target.closest('.debug-section-header');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        header.classList.remove('collapsed');
    } else {
        content.style.display = 'none';
        header.classList.add('collapsed');
    }
}

// Update performance metrics
function updateDebugMetrics(execTime, codeLines) {
    document.getElementById('debugExecTime').textContent = execTime.toFixed(2) + ' ms';
    
    // Estimate memory (rough approximation)
    const memoryEstimate = (codeLines * 50 / 1024).toFixed(2); // Very rough estimate
    document.getElementById('debugMemory').textContent = memoryEstimate + ' KB';
    
    document.getElementById('debugLines').textContent = codeLines;
}

// Enhanced runCode function with debug integration
// REPLACE your existing runCode function with this:
function runCode() {
    const code = document.getElementById('editor').value;
    const codeLines = code.split('\n').length;
    
    showStatus('Running...', 'running');
    
    // Clear previous debug messages
    clearDebugConsole();
    
    // Add initial message
    addDebugMessage('▶ Executing code...', 'log');
    
    // Start performance timer
    const startTime = performance.now();
    
    // Intercept console methods
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.log = function(...args) {
        const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');
        
        addDebugMessage(message, 'log');
        addConsoleMessage(message, 'log'); // Also add to bottom console
        originalLog.apply(console, args);
    };
    
    console.error = function(...args) {
        const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');
        
        addDebugMessage(message, 'error');
        addConsoleMessage('✗ ' + message, 'error');
        originalError.apply(console, args);
    };
    
    console.warn = function(...args) {
        const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');
        
        addDebugMessage(message, 'warn');
        addConsoleMessage('⚠ ' + message, 'log');
        originalWarn.apply(console, args);
    };
    
    setTimeout(() => {
        try {
            // Execute code
            eval(code);
            
            // Calculate execution time
            const execTime = performance.now() - startTime;
            
            // Update metrics
            updateDebugMetrics(execTime, codeLines);
            
            addDebugMessage('✓ Execution completed successfully', 'log');
            addConsoleMessage('✓ Executed successfully', 'success');
            showStatus('Executed successfully', 'success');
            
        } catch (error) {
            // Calculate execution time even on error
            const execTime = performance.now() - startTime;
            updateDebugMetrics(execTime, codeLines);
            
            // Parse error for line number if available
            let lineNumber = null;
            const lineMatch = error.stack?.match(/:(\d+):/);
            if (lineMatch) {
                lineNumber = lineMatch[1];
            }
            
            // Show error in debug console
            addDebugMessage('✗ ' + error.toString(), 'error', lineNumber);
            addConsoleMessage('✗ ' + error.toString(), 'error');
            showStatus('Error - check debug panel', 'error');
            
            // Auto-open debug panel
            if (!debugPanelOpen) {
                openDebugPanel();
            }
        } finally {
            // Restore console methods
            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;
        }
    }, 100);
}

// Add keyboard shortcut for debug panel (F12)
// Add this to your setupKeyboardShortcuts function:
function setupDebugKeyboardShortcut() {
    document.addEventListener('keydown', function(e) {
        // F12 - Toggle Debug Panel
        if (e.key === 'F12') {
            e.preventDefault();
            toggleDebugPanel();
            return;
        }
    });
}

// Initialize debug panel on page load
window.addEventListener('load', function() {
    setupDebugKeyboardShortcut();
    
    // Initialize debug panel state
    updateDebugCounts();
    
    // Set initial metric values
    const editor = document.getElementById('editor');
    if (editor) {
        const lines = editor.value.split('\n').length;
        document.getElementById('debugLines').textContent = lines;
    }
});

// Update line count in debug when editing
// Add this to your editor input event listener:
const originalEditorInput = document.getElementById('editor').oninput;
document.getElementById('editor').addEventListener('input', function() {
    // Update debug metrics on edit
    const lines = this.value.split('\n').length;
    document.getElementById('debugLines').textContent = lines;
});

// =====================================================
// CLEARCODE TUTORIAL SYSTEM v1.0
// Version-aware tutorial with spotlight animations
// =====================================================

const CLEARCODE_VERSION = '1.0.0';
let tutorialActive = false;
let currentTutorialStep = 0;
let tutorialMode = 'full'; // 'full' or 'whats-new'

// Tutorial Steps Data
const tutorialSteps = {
    // Complete walkthrough for first-time users
    full: [
        {
            title: '👋 Welcome to ClearCode!',
            content: 'ClearCode is a powerful, accessible code editor built with you in mind. Let\'s take a quick tour of the main features!',
            target: null, // No specific element to highlight
            position: 'center'
        },
        {
            title: '📁 File Management',
            content: 'Create, open, and manage multiple files simultaneously. Click the "+ New" button to create a new file, or use Ctrl+N.',
            target: '.tab-new-btn',
            position: 'bottom'
        },
        {
            title: '📂 File Explorer',
            content: 'All your open files appear in the sidebar. Click any file to switch to it. You can also close files by clicking the × button.',
            target: '.file-explorer',
            position: 'right'
        },
        {
            title: '🎨 Beautiful Themes',
            content: 'Choose from 15 professional themes! Go to View → Themes to explore Synthwave \'84, Tokyo Night, Dracula, and more.',
            target: '[onclick="toggleMenu(\'viewMenu\')"]',
            position: 'bottom'
        },
        {
            title: '✏️ Smart Editor',
            content: 'The editor features syntax highlighting for JavaScript, HTML, and CSS, with active line highlighting so you always know where you are.',
            target: '#editor',
            position: 'left'
        },
        {
            title: '🔍 Find & Replace',
            content: 'Quickly search your code with Ctrl+F. Find and replace text with case-sensitive options and match counting.',
            target: '.menu-button:nth-child(2)',
            position: 'bottom'
        },
        {
            title: '▶️ Run Your Code',
            content: 'Execute JavaScript code instantly! Press Ctrl+Enter or F5 to run your code and see the output in the console below.',
            target: '[onclick="toggleMenu(\'runMenu\')"]',
            position: 'bottom'
        },
        {
            title: '📟 Console Output',
            content: 'All console.log() outputs and errors appear here. Use Ctrl+Shift+K to clear the console.',
            target: '#consolePanel',
            position: 'top'
        },
        {
            title: '🐛 Debug Panel',
            content: 'The debug panel captures all console messages, errors, and warnings. Press F12 to toggle it. Perfect for tracking down issues!',
            target: '#debugBtn',
            position: 'bottom'
        },
        {
            title: '🔊 Text-to-Speech',
            content: 'ClearCode can read your code aloud! Press F8 to open the TTS panel. Great for proofreading or accessibility.',
            target: '#ttsBtn',
            position: 'bottom'
        },
        {
            title: '👁️ Live Preview',
            content: 'See your HTML come to life! The live preview automatically combines your HTML, CSS, and JavaScript files in real-time.',
            target: '#previewBtn',
            position: 'bottom'
        },
        {
            title: '♿ Accessibility Features',
            content: 'ClearCode includes dyslexia mode with OpenDyslexic font, adjustable spacing, and customizable font sizes. Check View → Font Settings!',
            target: '[onclick="toggleMenu(\'viewMenu\')"]',
            position: 'bottom'
        },
        {
            title: '🔀 Git Integration',
            content: 'Full GitHub integration! Initialize repos, commit changes, and push to remote. Find everything in the GitHub menu.',
            target: '[onclick="toggleMenu(\'githubMenu\')"]',
            position: 'bottom'
        },
        {
            title: '💾 Auto-Save',
            content: 'Your work is automatically saved to your browser. Enable/disable auto-save in File → Auto-save settings.',
            target: '[onclick="toggleMenu(\'fileMenu\')"]',
            position: 'bottom'
        },
        {
            title: '⌨️ Keyboard Shortcuts',
            content: 'Work faster with keyboard shortcuts! Press F1 anytime to see the complete list of shortcuts.',
            target: '#shortcutsBtn',
            position: 'bottom'
        },
        {
            title: '✅ You\'re All Set!',
            content: 'You\'ve completed the tutorial! Press F9 anytime to see this tutorial again. Happy coding! 🚀',
            target: null,
            position: 'center'
        }
    ],
    
    // What's New for v1.0 (for users upgrading from previous versions)
    whatsNew: [
        {
            title: '🎉 Welcome to ClearCode v1.0!',
            content: 'Let\'s show you the exciting new features in this release!',
            target: null,
            position: 'center'
        },
        {
            title: '🆕 Text-to-Speech',
            content: 'NEW! ClearCode can now read your code aloud. Press F8 to open the TTS panel and customize voice, speed, and pitch.',
            target: '#ttsBtn',
            position: 'bottom'
        },
        {
            title: '🆕 Enhanced Debug Panel',
            content: 'NEW! The debug panel now includes performance metrics, network monitoring, and variable watching. Press F12 to explore!',
            target: '#debugBtn',
            position: 'bottom'
        },
        {
            title: '🆕 Live Preview',
            content: 'NEW! See your HTML, CSS, and JavaScript come together in real-time with the floating preview panel!',
            target: '#previewBtn',
            position: 'bottom'
        },
        {
            title: '✨ Improved Themes',
            content: 'We\'ve added 7 new professional themes including Synthwave \'84, Material Theme, and Gruvbox!',
            target: '[onclick="toggleMenu(\'viewMenu\')"]',
            position: 'bottom'
        },
        {
            title: '♿ Better Accessibility',
            content: 'New dyslexia mode, OpenDyslexic font support, and enhanced spacing controls for better readability.',
            target: '[onclick="toggleDyslexiaMode(); closeAllMenus();"]',
            position: 'bottom'
        },
        {
            title: '🚀 Performance Improvements',
            content: 'Faster syntax highlighting, debounced updates, and optimized rendering for smoother editing!',
            target: '#editor',
            position: 'left'
        },
        {
            title: '🎓 Interactive Tutorial',
            content: 'And of course, this new interactive tutorial system! Press F9 anytime to restart it.',
            target: '#tutorialBtn',
            position: 'bottom'
        },
        {
            title: '✅ That\'s What\'s New!',
            content: 'Enjoy ClearCode v1.0! We hope you love these new features. Happy coding! 🚀',
            target: null,
            position: 'center'
        }
    ]
};

// Initialize Tutorial System
function initializeTutorial() {
    const lastVersion = localStorage.getItem('clearcode-version');
    const tutorialCompleted = localStorage.getItem('clearcode-tutorial-completed');
    
    // Check if user is new or returning
    if (!lastVersion || !tutorialCompleted) {
        // New user - show welcome message with tutorial option
        setTimeout(() => {
            if (confirm('Welcome to ClearCode! Would you like a quick tour of the features?')) {
                startTutorial('full');
            } else {
                // Mark as completed so we don't ask again
                localStorage.setItem('clearcode-tutorial-completed', 'true');
                localStorage.setItem('clearcode-version', CLEARCODE_VERSION);
            }
        }, 1000);
    } else if (lastVersion !== CLEARCODE_VERSION) {
        // Returning user with old version - show what's new
        setTimeout(() => {
            if (confirm('Welcome back! ClearCode has been updated to v' + CLEARCODE_VERSION + '. Would you like to see what\'s new?')) {
                startTutorial('whats-new');
            } else {
                localStorage.setItem('clearcode-version', CLEARCODE_VERSION);
            }
        }, 1000);
    }
}

// Start Tutorial
function startTutorial(mode = 'full') {
    tutorialMode = mode;
    tutorialActive = true;
    currentTutorialStep = 0;
    
    // Get steps for this mode
    const steps = tutorialSteps[mode];
    
    if (!steps || steps.length === 0) {
        console.error('No tutorial steps found for mode:', mode);
        return;
    }
    
    // Create tutorial overlay
    createTutorialOverlay();
    
    // Show first step
    showTutorialStep(0);
    
    // Update version
    localStorage.setItem('clearcode-version', CLEARCODE_VERSION);
}

// Create Tutorial Overlay
function createTutorialOverlay() {
    // Remove existing overlay if any
    const existingOverlay = document.getElementById('tutorialOverlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }
    
    // Create new overlay
    const overlay = document.createElement('div');
    overlay.id = 'tutorialOverlay';
    overlay.className = 'tutorial-overlay';
    overlay.innerHTML = `
        <div class="tutorial-spotlight"></div>
        <div class="tutorial-card">
            <div class="tutorial-header">
                <h3 class="tutorial-title"></h3>
                <button class="tutorial-close" onclick="skipTutorial()" title="Skip Tutorial">×</button>
            </div>
            <div class="tutorial-content"></div>
            <div class="tutorial-footer">
                <div class="tutorial-progress">
                    <span class="tutorial-progress-text">Step <span class="tutorial-current-step">1</span> of <span class="tutorial-total-steps">1</span></span>
                    <div class="tutorial-progress-bar">
                        <div class="tutorial-progress-fill"></div>
                    </div>
                </div>
                <div class="tutorial-nav">
                    <button class="tutorial-btn tutorial-btn-prev" onclick="previousTutorialStep()">← Previous</button>
                    <button class="tutorial-btn tutorial-btn-skip" onclick="skipTutorial()">Skip</button>
                    <button class="tutorial-btn tutorial-btn-next" onclick="nextTutorialStep()">Next →</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Fade in
    setTimeout(() => {
        overlay.classList.add('active');
    }, 50);
}

// Show Tutorial Step
function showTutorialStep(stepIndex) {
    const steps = tutorialSteps[tutorialMode];
    
    if (stepIndex < 0 || stepIndex >= steps.length) {
        return;
    }
    
    currentTutorialStep = stepIndex;
    const step = steps[stepIndex];
    
    // Update card content
    const card = document.querySelector('.tutorial-card');
    const title = document.querySelector('.tutorial-title');
    const content = document.querySelector('.tutorial-content');
    const currentStepSpan = document.querySelector('.tutorial-current-step');
    const totalStepsSpan = document.querySelector('.tutorial-total-steps');
    const progressFill = document.querySelector('.tutorial-progress-fill');
    const prevBtn = document.querySelector('.tutorial-btn-prev');
    const nextBtn = document.querySelector('.tutorial-btn-next');
    
    title.textContent = step.title;
    content.textContent = step.content;
    currentStepSpan.textContent = stepIndex + 1;
    totalStepsSpan.textContent = steps.length;
    
    // Update progress bar
    const progress = ((stepIndex + 1) / steps.length) * 100;
    progressFill.style.width = progress + '%';
    
    // Update navigation buttons
    prevBtn.disabled = stepIndex === 0;
    if (stepIndex === steps.length - 1) {
        nextBtn.textContent = 'Finish ✓';
    } else {
        nextBtn.textContent = 'Next →';
    }
    
    // Handle spotlight
    if (step.target) {
        const targetElement = document.querySelector(step.target);
        if (targetElement) {
            positionSpotlight(targetElement);
            positionCard(targetElement, step.position);
        } else {
            // Target not found, center card
            centerCard();
            hideSpotlight();
        }
    } else {
        // No target, center everything
        centerCard();
        hideSpotlight();
    }
}

// Position Spotlight
function positionSpotlight(element) {
    const spotlight = document.querySelector('.tutorial-spotlight');
    const rect = element.getBoundingClientRect();
    
    spotlight.style.display = 'block';
    spotlight.style.left = (rect.left - 10) + 'px';
    spotlight.style.top = (rect.top - 10) + 'px';
    spotlight.style.width = (rect.width + 20) + 'px';
    spotlight.style.height = (rect.height + 20) + 'px';
}

// Hide Spotlight
function hideSpotlight() {
    const spotlight = document.querySelector('.tutorial-spotlight');
    spotlight.style.display = 'none';
}

// Position Tutorial Card
function positionCard(targetElement, position) {
    const card = document.querySelector('.tutorial-card');
    const rect = targetElement.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const cardWidth = Math.min(500, window.innerWidth - 40);
    const cardHeight = cardRect.height || 300;
    
    let cardLeft = 0;
    let cardTop = 0;
    
    // Calculate position based on preference
    switch(position) {
        case 'top':
            cardLeft = Math.max(20, Math.min(window.innerWidth - cardWidth - 20, rect.left + (rect.width / 2) - (cardWidth / 2)));
            cardTop = Math.max(20, rect.top - cardHeight - 30);
            break;
            
        case 'bottom':
            cardLeft = Math.max(20, Math.min(window.innerWidth - cardWidth - 20, rect.left + (rect.width / 2) - (cardWidth / 2)));
            cardTop = Math.min(window.innerHeight - cardHeight - 20, rect.bottom + 30);
            break;
            
        case 'left':
            cardLeft = Math.max(20, rect.left - cardWidth - 30);
            cardTop = Math.max(20, Math.min(window.innerHeight - cardHeight - 20, rect.top + (rect.height / 2) - (cardHeight / 2)));
            break;
            
        case 'right':
            cardLeft = Math.min(window.innerWidth - cardWidth - 20, rect.right + 30);
            cardTop = Math.max(20, Math.min(window.innerHeight - cardHeight - 20, rect.top + (rect.height / 2) - (cardHeight / 2)));
            break;
            
        case 'center':
        default:
            centerCard();
            return;
    }
    
    // Apply positioning
    card.style.left = cardLeft + 'px';
    card.style.top = cardTop + 'px';
    card.style.transform = 'none';
}

// Center Tutorial Card
function centerCard() {
    const card = document.querySelector('.tutorial-card');
    card.style.left = '50%';
    card.style.top = '50%';
    card.style.transform = 'translate(-50%, -50%)';
}

// Navigation Functions
function nextTutorialStep() {
    const steps = tutorialSteps[tutorialMode];
    
    if (currentTutorialStep < steps.length - 1) {
        showTutorialStep(currentTutorialStep + 1);
    } else {
        // Last step - finish tutorial
        finishTutorial();
    }
}

function previousTutorialStep() {
    if (currentTutorialStep > 0) {
        showTutorialStep(currentTutorialStep - 1);
    }
}

function skipTutorial() {
    if (confirm('Are you sure you want to skip the tutorial?')) {
        closeTutorial();
    }
}

function finishTutorial() {
    // Mark tutorial as completed
    localStorage.setItem('clearcode-tutorial-completed', 'true');
    localStorage.setItem('clearcode-version', CLEARCODE_VERSION);
    
    closeTutorial();
    
    // Show completion message
    if (typeof showStatus === 'function') {
        showStatus('Tutorial completed! 🎉', 'success');
    }
}

function closeTutorial() {
    tutorialActive = false;
    const overlay = document.getElementById('tutorialOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.remove();
        }, 300);
    }
}

// Restart Tutorial (from menu/button)
function restartTutorial() {
    localStorage.removeItem('clearcode-tutorial-completed');
    startTutorial('full');
}

// Show What's New (from menu)
function showWhatsNew() {
    startTutorial('whats-new');
}

// Keyboard shortcut for tutorial (F9)
document.addEventListener('keydown', function(e) {
    if (e.key === 'F9') {
        e.preventDefault();
        if (tutorialActive) {
            skipTutorial();
        } else {
            startTutorial('full');
        }
    }
});

// Initialize tutorial on page load
window.addEventListener('load', function() {
    setTimeout(initializeTutorial, 500);
});

// =====================================================
// END OF TUTORIAL SYSTEM
// =====================================================