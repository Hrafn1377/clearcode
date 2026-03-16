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
    new TutorialSystem();

    fileManager.loadFiles();

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

    (window as any).__clearcode = { editor, themeManager, tts, git, preview, fileManager, projectManager, projectSwitcher, settings };
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
} else {
    boot();
}