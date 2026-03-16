export interface Project {
    id: number;
    name: string;
    description: string | null;
    last_opened_at: string | null;
}

export class ProjectManager {
    private csrfToken: string;
    private currentProject: Project | null = null;
    private onProjectChange: ((project: Project | null) => void) | null = null;

    constructor() {
        this.csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
    }

    setOnProjectChange(fn: (project: Project | null) => void) {
        this.onProjectChange = fn;
    }

    getCurrentProject(): Project | null {
        return this.currentProject;
    }

    async loadProjects(): Promise<Project[]> {
        const res = await fetch('/projects', { headers: { 'Accept': 'application/json' } });
        return res.json();
    }

    async createProject(name: string, description?: string): Promise<Project> {
        const res = await fetch('/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': this.csrfToken,
            },
            body: JSON.stringify({ project: { name, description } }),
        });
        if (!res.ok) throw new Error('Failed to create project');
        return res.json();
    }

    async openProject(project: Project): Promise<void> {
        await fetch(`/projects/${project.id}/open`, {
            method: 'POST',
            headers: { 'X-CSRF-Token': this.csrfToken },
        });
        this.currentProject = project;
        this.onProjectChange?.(project);
        this.persistCurrentProject(project.id);
    }

    async deleteProject(id: number): Promise<void> {
        await fetch(`/projects/${id}`, {
            method: 'DELETE',
            headers: { 'X-CSRF-Token': this.csrfToken },
        });
        if (this.currentProject?.id === id) {
            this.currentProject =null;
            this.onProjectChange?.(null);
            this.clearPersistedProject();
        }
    }

    async renameProject(id: number, name: string): Promise<Project> {
        const res = await fetch(`/projects/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': this.csrfToken,
            },
            body: JSON.stringify({ project: { name } }),
        });
        if (!res.ok) throw new Error('Failed to rename project');
        const updated = await res.json();
        if (this.currentProject?.id === id) {
            this.currentProject = updated;
            this.onProjectChange?.(updated);
        }
        return updated;
    }

    getPersistedProjectId(): number | null {
        const val = localStorage.getItem('clearcode_project_id');
        return val ? parseInt(val) : null;
    }

    private persistCurrentProject(id: number): void {
        localStorage.setItem('clearcode_project_id', String(id));
    }

    private clearPersistedProject(): void {
        localStorage.removeItem('clearcode_project)id');
    }
}