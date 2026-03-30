const APP_VERSION = "3.1.0";
const TUTORIAL_KEY = "clearcode_tutorial_version";

const STEPS = [
  {
    title: "Welcome to ClearCode",
    content: "A code editor built for everyone. Let's take a quick tour of the key features.",
    icon: "✦",
  },
  {
    title: "Projects",
    content: "Use the project switcher in the topbar to create and switch between projects. Files are grouped by project.",
    icon: "⬡",
  },
  {
    title: "Files",
    content: "Click '+ New File' in the sidebar to create a file 'ꜛ Import' to bring in existing files, and 'ꜜ Save' to save manually. Double-click a filename to rename it. Files are auto-saved every 5 minutes.",
    icon: "📄",
  },
  {
    title: "Themes & Accessibility",
    content: "Open Settings to choose from 15 themes including 8 colorblind-safe modes. Dyslexia mode and font size are also adjustable.",
    icon: "🎨",
  },
  {
    title: "Text to Speech",
    content: "In Settings, configure TTS voice and speed. The editor can read your code back to you.",
    icon: "🔊",
  },
  {
    title: "Git Integration",
    content: "Click 'Git' in the topbar to open the Git panel. Point it at any local repo to view status, diffs, and commit changes.",
    icon: "⎇",
  },
  {
    title: "AI Assistant",
    content: "Click '✦ AI' in the topbar to open the AI assistant. Add your Anthropic API key in Settings to enable it.",
    icon: "✦",
  },
  {
    title: "Timer & Billing",
    content: "Click '⏱️ Timer' to track billable house per project. Click '👥 Clients' to manage clients, '📋 Quotes' to build quotes, and '🧾 Invoices' to manage invoices.",
    icon: "⏱️",
  },
  {
    title: "Focus Mode",
    content: "Click ⊡ in the topbar to enter distraction-free focus mode. Press Escape to exit.",
    icon: "⊡",
  },
  {
    title: "Keyboard Shortcuts",
    content: "Cmd+S to save · Cmd+Alt+F to format code · Shift+Enter to send AI message",
    icon: "⌨",
  },
];

export class TutorialSystem {
  private seen: boolean;
  private currentStep: number = 0;
  private overlay: HTMLElement | null = null;
  private modal: HTMLElement | null = null;

  constructor() {
    const stored = localStorage.getItem(TUTORIAL_KEY);
    this.seen = stored === APP_VERSION;
    console.info("[ClearCode] Tutorial: version", APP_VERSION);
    if (!this.seen) this.show();
  }

  show(): void {
    this.currentStep = 0;
    this.buildUI();
    this.renderStep();
  }

  private buildUI(): void {
    if (document.getElementById('tutorial-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'tutorial-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      z-index: 999;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    document.body.appendChild(overlay);
    this.overlay = overlay;

    const modal = document.createElement('div');
    modal.id = 'tutorial-modal';
    modal.style.cssText = `
      background: var(--bg-panel);
      border: 1px solid var(--accent-cyan);
      border-radius: 8px;
      padding: 2rem;
      width: 480px;
      max-width: 90vw;
      box-shadow: 0 0 40px #00e5ff22;
      font-family: var(--font-ui);
      color: var(--fg);
    `;
    overlay.appendChild(modal);
    this.modal = modal;

    const style = document.createElement('style');
    style.textContent = `
      #tutorial-modal .tutorial-icon {
        font-size: 2rem;
        margin-bottom: 0.75rem;
      }
      #tutorial-modal .tutorial-title {
        font-size: 1.1rem;
        font-weight: bold;
        color: var(--accent-cyan);
        margin-bottom: 0.75rem;
        font-family: var(--font-mono);
      }
      #tutorial-modal .tutorial-content {
        font-size: 0.9rem;
        color: var(--fg);
        line-height: 1.6;
        margin-bottom: 1.5rem;
      }
      #tutorial-modal .tutorial-dots {
        display: flex;
        gap: 0.4rem;
        justify-content: center;
        margin-bottom: 1.25rem;
      }
      #tutorial-modal .tutorial-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--border);
        transition: background 0.2s;
      }
      #tutorial-modal .tutorial-dot.active {
        background: var(--accent-cyan);
      }
      #tutorial-modal .tutorial-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      #tutorial-modal .btn-tutorial-skip {
        background: none;
        border: none;
        color: var(--fg-muted);
        cursor: pointer;
        font-family: var(--font-mono);
        font-size: 0.8rem;
      }
      #tutorial-modal .btn-tutorial-next {
        background: var(--accent-cyan);
        border: none;
        border-radius: 4px;
        padding: 0.5rem 1.25rem;
        color: var(--bg);
        font-family: var(--font-mono);
        font-size: 0.85rem;
        cursor: pointer;
        font-weight: bold;
      }
    `;
    document.head.appendChild(style);
  }

  private renderStep(): void {
    if (!this.modal) return;
    const step = STEPS[this.currentStep];
    if (!step) return;
    const isLast = this.currentStep === STEPS.length - 1;

    this.modal.innerHTML = `
      <div class="tutorial-icon">${step.icon}</div>
      <div class="tutorial-title">${step.title}</div>
      <div class="tutorial-content">${step.content}</div>
      <div class="tutorial-dots">
        ${STEPS.map((_, i) => `<div class="tutorial-dot ${i === this.currentStep ? 'active' : ''}"></div>`).join('')}
      </div>
      <div class="tutorial-actions">
        <button class="btn-tutorial-skip">Skip tutorial</button>
        <button class="btn-tutorial-next">${isLast ? 'Get started →' : 'Next →'}</button>
      </div>
    `;

    this.modal.querySelector('.btn-tutorial-skip')!.addEventListener('click', () => this.dismiss());
    this.modal.querySelector('.btn-tutorial-next')!.addEventListener('click', () => {
      if (isLast) {
        this.dismiss();
      } else {
        this.currentStep++;
        this.renderStep();
      }
    });
  }

  dismiss(): void {
    localStorage.setItem(TUTORIAL_KEY, APP_VERSION);
    this.seen = true;
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
      this.modal = null;
    }
  }
}