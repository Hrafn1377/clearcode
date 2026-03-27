export class ClientPanel {
  private panel: HTMLElement;
  private overlay: HTMLElement;
  private csrfToken: string;
  private clients: any[] = [];
  private editingId: number | null = null;

  constructor() {
    this.csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
    this.panel = this.buildPanel();
    this.overlay = this.buildOverlay();
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.panel);
    this.addStyles();
  }

  private buildOverlay(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.id = 'client-overlay';
    overlay.style.cssText = `
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 99;
    `;
    overlay.addEventListener('click', () => this.close());
    return overlay;
  }

  private buildPanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.id = 'client-panel';
    panel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:1.5rem 1.5rem 1rem; border-bottom:1px solid var(--border);">
        <span style="color:var(--accent-cyan); font-size:0.85rem; letter-spacing:0.1em; text-transform:uppercase;">👥 Clients</span>
        <button id="client-close" style="background:none; border:none; color:var(--fg-muted); cursor:pointer; font-size:1.2rem;">×</button>
      </div>

      <div style="padding:1rem 1.5rem; border-bottom:1px solid var(--border);">
        <button id="client-add-btn" style="width:100%; background:transparent; border:1px solid var(--accent-cyan); border-radius:4px; padding:0.5rem; color:var(--accent-cyan); font-family:var(--font-mono); font-size:0.8rem; cursor:pointer;">+ New Client</button>
      </div>

      <div id="client-form" style="display:none; padding:1rem 1.5rem; border-bottom:1px solid var(--border);">
        <div class="client-field">
          <label class="client-label">Name *</label>
          <input type="text" id="cf-name" class="client-input" placeholder="Client name" />
        </div>
        <div class="client-field">
          <label class="client-label">Company</label>
          <input type="text" id="cf-company" class="client-input" placeholder="Company name" />
        </div>
        <div class="client-field">
          <label class="client-label">Email</label>
          <input type="email" id="cf-email" class="client-input" placeholder="email@example.com" />
        </div>
        <div class="client-field">
          <label class="client-label">Phone</label>
          <input type="text" id="cf-phone" class="client-input" placeholder="Phone number" />
        </div>
        <div class="client-field">
          <label class="client-label">Address</label>
          <input type="text" id="cf-address" class="client-input" placeholder="Street address" />
        </div>
        <div style="display:flex; gap:0.5rem;">
          <div class="client-field" style="flex:2;">
            <label class="client-label">City</label>
            <input type="text" id="cf-city" class="client-input" placeholder="City" />
          </div>
          <div class="client-field" style="flex:1;">
            <label class="client-label">State</label>
            <input type="text" id="cf-state" class="client-input" placeholder="TN" maxlength="2" />
          </div>
          <div class="client-field" style="flex:1;">
            <label class="client-label">Zip</label>
            <input type="text" id="cf-zip" class="client-input" placeholder="00000" />
          </div>
        </div>
        <div class="client-field">
          <label class="client-label">Billing Type</label>
          <select id="cf-billing-type" class="client-input">
            <option value="">— Select —</option>
            <option value="hourly">Hourly</option>
            <option value="fixed">Fixed Rate</option>
            <option value="per_word">Per Word</option>
            <option value="per_page">Per Page</option>
          </select>
        </div>
        <div id="cf-rate-fields" style="display:none;">
          <div id="cf-hourly-field" class="client-field" style="display:none;">
            <label class="client-label">Hourly Rate ($)</label>
            <input type="number" id="cf-hourly-rate" class="client-input" placeholder="0.00" step="0.01" />
          </div>
          <div id="cf-word-field" class="client-field" style="display:none;">
            <label class="client-label">Rate per Word ($)</label>
            <input type="number" id="cf-rate-per-word" class="client-input" placeholder="0.00" step="0.001" />
          </div>
          <div id="cf-page-field" class="client-field" style="display:none;">
            <label class="client-label">Rate per Page ($)</label>
            <input type="number" id="cf-rate-per-page" class="client-input" placeholder="0.00" step="0.01" />
          </div>
        </div>
        <div class="client-field" style="display:flex; align-items:center; gap:0.5rem;">
          <input type="checkbox" id="cf-tax-exempt" />
          <label for="cf-tax-exempt" class="client-label" style="margin:0;">Tax exempt</label>
        </div>
        <div class="client-field">
          <label class="client-label">Notes</label>
          <textarea id="cf-notes" class="client-input" rows="2" placeholder="Any notes about this client..."></textarea>
        </div>
        <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
          <button id="cf-save" style="flex:1; background:var(--accent-cyan); border:none; border-radius:4px; padding:0.5rem; color:var(--bg); font-family:var(--font-mono); font-size:0.8rem; cursor:pointer;">Save Client</button>
          <button id="cf-cancel" style="background:transparent; border:1px solid var(--border); border-radius:4px; padding:0.5rem 0.75rem; color:var(--fg-muted); font-family:var(--font-mono); font-size:0.8rem; cursor:pointer;">Cancel</button>
        </div>
      </div>

      <div id="client-list" style="padding:1rem 1.5rem; overflow-y:auto;"></div>
    `;
    return panel;
  }

  private addStyles() {
    if (document.getElementById('client-panel-styles')) return;
    const style = document.createElement('style');
    style.id = 'client-panel-styles';
    style.textContent = `
      #client-panel {
        display: none;
        position: fixed;
        top: 0;
        right: 0;
        width: 380px;
        height: 100dvh;
        background: var(--bg-panel);
        border-left: 1px solid var(--accent-cyan);
        z-index: 100;
        flex-direction: column;
        box-shadow: -4px 0 30px #00e5ff22;
        font-family: var(--font-ui);
        color: var(--fg);
        overflow-y: auto;
      }
      #client-panel.open { display: flex; flex-direction: column; }
      .client-field { margin-bottom: 0.6rem; }
      .client-label {
        display: block;
        font-size: 0.7rem;
        color: var(--fg-muted);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin-bottom: 0.25rem;
      }
      .client-input {
        width: 100%;
        background: var(--bg-surface);
        border: 1px solid var(--border);
        border-radius: 4px;
        padding: 0.4rem 0.5rem;
        color: var(--fg);
        font-family: var(--font-mono);
        font-size: 0.8rem;
        outline: none;
      }
      .client-input:focus { border-color: var(--accent-cyan); }
      .client-card {
        background: var(--bg-surface);
        border: 1px solid var(--border);
        border-radius: 6px;
        padding: 0.75rem;
        margin-bottom: 0.6rem;
      }
      .client-card-name {
        font-family: var(--font-mono);
        color: var(--fg);
        font-size: 0.9rem;
        margin-bottom: 0.25rem;
      }
      .client-card-detail {
        font-size: 0.75rem;
        color: var(--fg-muted);
        margin-bottom: 0.1rem;
      }
      .client-card-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.5rem;
      }
      .client-card-actions button {
        background: transparent;
        border: 1px solid var(--border);
        border-radius: 4px;
        padding: 0.2rem 0.5rem;
        color: var(--fg-muted);
        font-family: var(--font-mono);
        font-size: 0.7rem;
        cursor: pointer;
      }
      .client-card-actions button:hover { color: var(--accent-cyan); border-color: var(--accent-cyan); }
      .client-card-actions .btn-delete-client:hover { color: var(--accent-pink); border-color: var(--accent-pink); }
    `;
    document.head.appendChild(style);
  }

  async open() {
    this.panel.classList.add('open');
    this.overlay.style.display = 'block';
    await this.loadClients();
    this.wireEvents();
  }

  close() {
    this.panel.classList.remove('open');
    this.overlay.style.display = 'none';
    this.hideForm();
  }

  private async loadClients() {
    const res = await fetch('/clients', { headers: { 'Accept': 'application/json' } });
    this.clients = await res.json();
    this.renderClients();
  }

  private renderClients() {
    const list = this.panel.querySelector('#client-list')!;
    if (this.clients.length === 0) {
      list.innerHTML = '<div style="color:var(--fg-muted); font-size:0.8rem; padding:0.5rem 0;">No clients yet. Add your first client above.</div>';
      return;
    }
    list.innerHTML = this.clients.map(c => `
      <div class="client-card" data-id="${c.id}">
        <div class="client-card-name">${c.name}${c.company ? ` — ${c.company}` : ''}</div>
        ${c.email ? `<div class="client-card-detail">✉ ${c.email}</div>` : ''}
        ${c.phone ? `<div class="client-card-detail">📞 ${c.phone}</div>` : ''}
        ${c.display_rate !== 'Not set' ? `<div class="client-card-detail">💰 ${c.display_rate}</div>` : ''}
        ${c.state ? `<div class="client-card-detail">📍 ${c.city ? c.city + ', ' : ''}${c.state}</div>` : ''}
        ${c.tax_exempt ? `<div class="client-card-detail" style="color:var(--accent-yellow);">⚡ Tax exempt</div>` : ''}
        <div class="client-card-actions">
          <button class="btn-edit-client" data-id="${c.id}">Edit</button>
          <button class="btn-delete-client" data-id="${c.id}">Delete</button>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.btn-edit-client').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt((btn as HTMLElement).dataset.id!);
        this.editClient(id);
      });
    });

    list.querySelectorAll('.btn-delete-client').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = (btn as HTMLElement).dataset.id!;
        const client = this.clients.find(c => c.id === parseInt(id));
        if (!confirm(`Delete "${client.name}"? This cannot be undone.`)) return;
        await fetch(`/clients/${id}`, {
          method: 'DELETE',
          headers: { 'X-CSRF-Token': this.csrfToken }
        });
        await this.loadClients();
      });
    });
  }

  private showForm() {
    const form = this.panel.querySelector('#client-form') as HTMLElement;
    form.style.display = 'block';
  }

  private hideForm() {
    const form = this.panel.querySelector('#client-form') as HTMLElement;
    form.style.display = 'none';
    this.clearForm();
    this.editingId = null;
  }

  private clearForm() {
    ['cf-name', 'cf-company', 'cf-email', 'cf-phone', 'cf-address', 'cf-city', 'cf-state', 'cf-zip', 'cf-notes'].forEach(id => {
      (this.panel.querySelector(`#${id}`) as HTMLInputElement).value = '';
    });
    (this.panel.querySelector('#cf-billing-type') as HTMLSelectElement).value = '';
    (this.panel.querySelector('#cf-hourly-rate') as HTMLInputElement).value = '';
    (this.panel.querySelector('#cf-rate-per-word') as HTMLInputElement).value = '';
    (this.panel.querySelector('#cf-rate-per-page') as HTMLInputElement).value = '';
    (this.panel.querySelector('#cf-tax-exempt') as HTMLInputElement).checked = false;
    this.updateRateFields('');
  }

  private editClient(id: number) {
    const client = this.clients.find(c => c.id === id);
    if (!client) return;
    this.editingId = id;
    this.showForm();

    (this.panel.querySelector('#cf-name') as HTMLInputElement).value = client.name ?? '';
    (this.panel.querySelector('#cf-company') as HTMLInputElement).value = client.company ?? '';
    (this.panel.querySelector('#cf-email') as HTMLInputElement).value = client.email ?? '';
    (this.panel.querySelector('#cf-phone') as HTMLInputElement).value = client.phone ?? '';
    (this.panel.querySelector('#cf-address') as HTMLInputElement).value = client.address ?? '';
    (this.panel.querySelector('#cf-city') as HTMLInputElement).value = client.city ?? '';
    (this.panel.querySelector('#cf-state') as HTMLInputElement).value = client.state ?? '';
    (this.panel.querySelector('#cf-zip') as HTMLInputElement).value = client.zip ?? '';
    (this.panel.querySelector('#cf-notes') as HTMLTextAreaElement).value = client.notes ?? '';
    (this.panel.querySelector('#cf-billing-type') as HTMLSelectElement).value = client.billing_type ?? '';
    (this.panel.querySelector('#cf-hourly-rate') as HTMLInputElement).value = client.hourly_rate ?? '';
    (this.panel.querySelector('#cf-rate-per-word') as HTMLInputElement).value = client.rate_per_word ?? '';
    (this.panel.querySelector('#cf-rate-per-page') as HTMLInputElement).value = client.rate_per_page ?? '';
    (this.panel.querySelector('#cf-tax-exempt') as HTMLInputElement).checked = client.tax_exempt ?? false;
    this.updateRateFields(client.billing_type ?? '');
  }

  private updateRateFields(billingType: string) {
    const rateFields = this.panel.querySelector('#cf-rate-fields') as HTMLElement;
    const hourlyField = this.panel.querySelector('#cf-hourly-field') as HTMLElement;
    const wordField = this.panel.querySelector('#cf-word-field') as HTMLElement;
    const pageField = this.panel.querySelector('#cf-page-field') as HTMLElement;

    rateFields.style.display = billingType ? 'block' : 'none';
    hourlyField.style.display = billingType === 'hourly' ? 'block' : 'none';
    wordField.style.display = billingType === 'per_word' ? 'block' : 'none';
    pageField.style.display = billingType === 'per_page' ? 'block' : 'none';
  }

  private wireEvents() {
    const closeBtn = this.panel.querySelector('#client-close')!;
    const addBtn = this.panel.querySelector('#client-add-btn')!;
    const saveBtn = this.panel.querySelector('#cf-save')!;
    const cancelBtn = this.panel.querySelector('#cf-cancel')!;
    const billingSelect = this.panel.querySelector('#cf-billing-type') as HTMLSelectElement;

    (closeBtn as HTMLElement).onclick = () => this.close();
(addBtn as HTMLElement).onclick = () => this.showForm();
(cancelBtn as HTMLElement).onclick = () => this.hideForm();

billingSelect.onchange = () => this.updateRateFields(billingSelect.value);

(saveBtn as HTMLElement).onclick = async () => {
      const name = (this.panel.querySelector('#cf-name') as HTMLInputElement).value.trim();
      if (!name) { alert('Client name is required.'); return; }

      const data = {
        client: {
          name,
          company: (this.panel.querySelector('#cf-company') as HTMLInputElement).value,
          email: (this.panel.querySelector('#cf-email') as HTMLInputElement).value,
          phone: (this.panel.querySelector('#cf-phone') as HTMLInputElement).value,
          address: (this.panel.querySelector('#cf-address') as HTMLInputElement).value,
          city: (this.panel.querySelector('#cf-city') as HTMLInputElement).value,
          state: (this.panel.querySelector('#cf-state') as HTMLInputElement).value,
          zip: (this.panel.querySelector('#cf-zip') as HTMLInputElement).value,
          billing_type: (this.panel.querySelector('#cf-billing-type') as HTMLSelectElement).value,
          hourly_rate: (this.panel.querySelector('#cf-hourly-rate') as HTMLInputElement).value || null,
          rate_per_word: (this.panel.querySelector('#cf-rate-per-word') as HTMLInputElement).value || null,
          rate_per_page: (this.panel.querySelector('#cf-rate-per-page') as HTMLInputElement).value || null,
          tax_exempt: (this.panel.querySelector('#cf-tax-exempt') as HTMLInputElement).checked,
          notes: (this.panel.querySelector('#cf-notes') as HTMLTextAreaElement).value,
        }
      };

      const url = this.editingId ? `/clients/${this.editingId}` : '/clients';
      const method = this.editingId ? 'PATCH' : 'POST';

      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': this.csrfToken,
        },
        body: JSON.stringify(data),
      });

      this.hideForm();
      await this.loadClients();
    };
  }
}
