const CURRENT_VERSION = "3.0.0";
const VERSION_URL = "https://clearcode-registry-production.up.railway.app/version";
const CHECK_INTERVAL_MS = 1000 * 60 * 60 * 24; // once per day
const STORAGE_KEY = "clearcode_last_version_check";

export async function checkForUpdates(): Promise<void> {
  try {
    const lastCheck = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();

    if (lastCheck && now - parseInt(lastCheck) < CHECK_INTERVAL_MS) return;

    const res = await fetch(VERSION_URL);
    if (!res.ok) return;

    const data = await res.json();
    const latestVersion = data.version;

    localStorage.setItem(STORAGE_KEY, String(now));

    if (latestVersion !== CURRENT_VERSION) {
      showUpdateBanner(latestVersion);
    }
  } catch {
    // fail silently — user may be offline
  }
}

function showUpdateBanner(latestVersion: string): void {
  const existing = document.getElementById('update-banner');
  if (existing) return;

  const banner = document.createElement('div');
  banner.id = 'update-banner';
  banner.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: var(--bg-panel);
    border: 1px solid var(--accent-cyan);
    border-radius: 6px;
    padding: 0.75rem 1rem;
    font-family: var(--font-mono);
    font-size: 0.8rem;
    color: var(--fg);
    z-index: 999;
    box-shadow: 0 0 20px #00e5ff22;
    display: flex;
    align-items: center;
    gap: 1rem;
  `;

  banner.innerHTML = `
    <span>✦ ClearCode <strong style="color:var(--accent-cyan)">${latestVersion}</strong> is available</span>
    <a href="https://bsky.app/profile/clearcode.bsky.social" target="_blank" rel="noopener"
      style="color:var(--accent-cyan); text-decoration:none;">View →</a>
    <button id="update-banner-close" style="background:none; border:none; color:var(--fg-muted); cursor:pointer; font-size:1rem;">×</button>
  `;

  document.body.appendChild(banner);
  document.getElementById('update-banner-close')?.addEventListener('click', () => banner.remove());
}