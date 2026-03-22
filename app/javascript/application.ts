import { ClearCodeEditor } from "./editor/editor";
import { ThemeManager } from "./themes/theme-manager";
import { TTSController } from "./utils/tts";
import { GitPanel } from "./components/git-panel";
import { LivePreview } from "./components/live-preview";
import { TutorialSystem } from "./components/tutorial";
import { FileManager } from "./components/file-manager";
import { SettingsPanel } from "./components/settings-panel";
import { ProjectManager } from "./components/project-manager";
import { ProjectSwitcher } from "./components/project-switcher";
import { checkForUpdates } from "./utils/version-check";
import { AIPanel } from "./components/ai-panel";

console.log("[ClearCode] script loaded");

function boot() {
    console.log("[Clearcode] DOM ready, mounting editor");
    const editorEl = document.getElementById("editor-host");
    if (!editorEl) return;

    const themeManager = new ThemeManager();
    const editor = new ClearCodeEditor(editorEl, themeManager);
    const tts = new TTSController(editor);
    const git = new GitPanel();
    const preview = new LivePreview(editor);
    const projectManager = new ProjectManager();
    const projectSwitcher = new ProjectSwitcher(projectManager);
    const fileManager = new FileManager(editor);
    const settings = new SettingsPanel(themeManager, tts);
    const aiPanel = new AIPanel(
      () => {
        const key = document.getElementById('settings-api-key') as HTMLInputElement;
        return key?.value ?? '';
      },
      () => editor.getContent()
    );  
    new TutorialSystem();

    fileManager.loadFiles();
    editor.setOnUpdate(() => preview.update());

    // Restore last project on load
    const lastProjectId = projectManager.getPersistedProjectId();

    projectManager.setOnProjectChange((project) => {
        const label = document.getElementById('current-project-label');
        if (label) label.textContent = project ? project.name : 'No Project';
        fileManager.setProjectFilter(project?.id ?? null);
        fileManager.loadFiles();
    });

    projectSwitcher.setOnSelect((project) => {
        const label = document.getElementById('current-project-label');
        if (label) label.textContent = project ? project.name : 'No Project';
    });

    if (lastProjectId) {
        projectManager.loadProjects().then(projects => {
            const last = projects.find(p => p.id === lastProjectId);
            if (last) projectManager.openProject(last);
        });
    }

    const projectBtn = document.getElementById('project-btn');
    if (projectBtn) projectBtn.addEventListener('click', () => projectSwitcher.open());

    const settingsBtn = document.getElementById("settings-btn");
    if (settingsBtn) settingsBtn.addEventListener("click", () => settings.open());

    const previewBtn = document.getElementById("preview-btn");
    if (previewBtn) {
        previewBtn.addEventListener("click", () => {
            preview.toggle();
            previewBtn.style.color = preview.isActive() ? 'var(--accent-cyan)' : '';
        });
    }

   document.addEventListener('keydown', (e) => {
  if (e.metaKey && e.altKey && e.key === 'f') {
    e.preventDefault();
    editor.format();
  }
});

    const gitBtn = document.getElementById("git-btn");
    if (gitBtn) gitBtn.addEventListener("click", () => git.open());

    const aiBtn = document.getElementById("ai-btn");
    if (aiBtn) aiBtn.addEventListener("click", () => aiPanel.open());

    const focusBtn = document.getElementById("focus-btn");
    let focusMode = false;
    if (focusBtn) {
        focusBtn.addEventListener("click", () => {
            focusMode = !focusMode;
            const sidebar = document.getElementById("sidebar");
            const topbar = document.getElementById("topbar");
            const statusbar = document.getElementById("statusbar");
            if (focusMode) {
                sidebar!.style.display = "none";
                topbar!.style.display = "none";
                statusbar!.style.display = "none";
                document.getElementById("app-shell")!.style.gridTemplateColumns = "1fr";
                document.getElementById("app-shell")!.style.gridTemplateRows = "1fr";
            } else {
                sidebar!.style.display = "";
                topbar!.style.display = "";
                statusbar!.style.display = "";
                document.getElementById("app-shell")!.style.gridTemplateColumns = "";
                document.getElementById("app-shell")!.style.gridTemplateRows = "";
            }
        });
    }

    // Exit focus mode with Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && focusMode) {
            focusBtn?.click();
        }
    });

    (window as any).__clearcode = { editor, themeManager, tts, git, preview, fileManager, projectManager, projectSwitcher, settings };
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
} else {
    boot();
    checkForUpdates();
}