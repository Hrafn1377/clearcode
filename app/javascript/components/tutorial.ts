const APP_VERSION = "3.0.0";
const TUTORIAL_KEY = "clearcode_tutorial_version";

export class TutorialSystem {
    private seen: boolean;

    constructor() {
        const stored = localStorage.getItem(TUTORIAL_KEY);
        this.seen = stored === APP_VERSION;
        if (!this.seen) this.show();
    }

    show(): void {
        // Render tutorial overlay - wired up with UI
        console.info("[ClearCode] Tutorial: version", APP_VERSION);
    }

    dismiss(): void {
        localStorage.setItem(TUTORIAL_KEY, APP_VERSION);
        this.seen = true;
    }
}