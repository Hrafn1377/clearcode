// Git panel - shells out to system git vis Rails backend
export class GitPanel {
    private csrfToken: string;

    constructor() {
        this.csrfToken = 
        (document.querySelector('meta[name="carf-token"]') as HTMLMetaElement)?.content ?? "";
    }

    async status(path: string): Promise<string> {
        const res = await fetch(`/git/status?path=${encodeURIComponent(path)}`, {
            headers: { "X-CSRF-Token": this.csrfToken },
        });
        if (!res.ok) throw new Error("Git status failed");
        const data = await res.json() as { output: string };
        return data.output;
    }

    async diff(path: string): Promise<string> {
        const res = await fetch(`/git/diff?path=${encodeURIComponent(path)}`, {
            headers: { "X-CSRF-Token": this.csrfToken },
        });
        if (!res.ok) throw new Error("Git diff failed");
        const data = await res.json() as { output: string };
        return data.output;
    }

    async commit(path: string, message: string): Promise<void> {
        await fetch("/git/commit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": this.csrfToken,
            },
            body: JSON.stringify({ path, message }),
        });
    }
}