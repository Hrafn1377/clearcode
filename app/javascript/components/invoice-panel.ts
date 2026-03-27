export class InvoicePanel {
  private panel: HTMLElement;
  private overlay: HTMLElement;
  private csrfToken: string;
  private invoices: any[] = [];
  private clients: any[] = [];
  private editingId: number | null = null;
  private lineItems: any[] = [];

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
    overlay.id = 'invoice-overlay';
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
    panel.id = 'invoice-panel';
    panel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:1.5rem 1.5rem 1rem; border-bottom:1px solid var(--border);">
        <span style="color:var(--accent-yellow); font-size:0.85rem; letter-spacing:0.1em; text-transform:uppercase;">🧾 Invoices</span>
        <button id="invoice-close" style="background:none; border:none; color:var(--fg-muted); cursor:pointer; font-size:1.2rem;">×</button>
      </div>

      <div style="padding:1rem 1.5rem; border-bottom:1px solid var(--border);">
        <button id="invoice-add-btn" style="width:100%; background:transparent; border:1px solid var(--accent-yellow); border-radius:4px; padding:0.5rem; color:var(--accent-yellow); font-family:var(--font-mono); font-size:0.8rem; cursor:pointer;">+ New Invoice</button>
      </div>

      <div id="invoice-form" style="display:none; padding:1rem 1.5rem; border-bottom:1px solid var(--border); overflow-y:auto; max-height:80vh;">

        <div class="invoice-section-title">Invoice Details</div>

        <div class="invoice-field">
          <label class="invoice-label">Client *</label>
          <select id="if-client" class="invoice-input">
            <option value="">— Select client —</option>
          </select>
        </div>

        <div style="display:flex; gap:0.5rem;">
          <div class="invoice-field" style="flex:1;">
            <label class="invoice-label">Issue Date</label>
            <input type="date" id="if-issue-date" class="invoice-input" />
          </div>
          <div class="invoice-field" style="flex:1;">
            <label class="invoice-label">Due Date</label>
            <input type="date" id="if-due-date" class="invoice-input" />
          </div>
        </div>

        <div class="invoice-section-title" style="margin-top:1rem;">Line Items</div>
        <div id="if-line-items"></div>
        <button id="if-add-line-item" style="width:100%; background:transparent; border:1px dashed var(--border); border-radius:4px; padding:0.4rem; color:var(--fg-muted); font-family:var(--font-mono); font-size:0.75rem; cursor:pointer; margin-bottom:0.75rem;">+ Add Line Item</button>

        <div class="invoice-section-title">Financial</div>

        <div style="display:flex; gap:0.5rem;">
          <div class="invoice-field" style="flex:1;">
            <label class="invoice-label">Discount Type</label>
            <select id="if-discount-type" class="invoice-input">
              <option value="">None</option>
              <option value="percent">Percent (%)</option>
              <option value="flat">Flat Amount ($)</option>
            </select>
          </div>
          <div class="invoice-field" style="flex:1;">
            <label class="invoice-label">Discount Amount</label>
            <input type="number" id="if-discount-amount" class="invoice-input" placeholder="0" step="0.01" />
          </div>
        </div>

        <div class="invoice-section-title" style="margin-top:0.5rem;">Tax Lines</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.4rem;">
          <input type="text" id="if-tax1-label" class="invoice-input" placeholder="Tax 1 label" />
          <input type="number" id="if-tax1-rate" class="invoice-input" placeholder="Rate %" step="0.01" />
          <input type="text" id="if-tax2-label" class="invoice-input" placeholder="Tax 2 label" />
          <input type="number" id="if-tax2-rate" class="invoice-input" placeholder="Rate %" step="0.01" />
          <input type="text" id="if-tax3-label" class="invoice-input" placeholder="Tax 3 label" />
          <input type="number" id="if-tax3-rate" class="invoice-input" placeholder="Rate %" step="0.01" />
          <input type="text" id="if-tax4-label" class="invoice-input" placeholder="Tax 4 label" />
          <input type="number" id="if-tax4-rate" class="invoice-input" placeholder="Rate %" step="0.01" />
        </div>

        <div class="invoice-section-title" style="margin-top:1rem;">Payment</div>
        <div style="display:flex; gap:0.5rem;">
          <div class="invoice-field" style="flex:1;">
            <label class="invoice-label">Method</label>
            <input type="text" id="if-payment-method" class="invoice-input" placeholder="Bank transfer, PayPal..." />
          </div>
          <div class="invoice-field" style="flex:1;">
            <label class="invoice-label">Amount Paid</label>
            <input type="number" id="if-amount-paid" class="invoice-input" placeholder="0.00" step="0.01" />
          </div>
        </div>

        <div class="invoice-field">
          <label class="invoice-label">Status</label>
          <select id="if-status" class="invoice-input">
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div class="invoice-field">
          <label class="invoice-label">Notes</label>
          <textarea id="if-notes" class="invoice-input" rows="2" placeholder="Notes for the client..."></textarea>
        </div>

        <div style="display:flex; gap:0.5rem; margin-top:0.75rem;">
          <button id="if-save" style="flex:1; background:var(--accent-yellow); border:none; border-radius:4px; padding:0.5rem; color:var(--bg); font-family:var(--font-mono); font-size:0.8rem; cursor:pointer; font-weight:bold;">Save Invoice</button>
          <button id="if-cancel" style="background:transparent; border:1px solid var(--border); border-radius:4px; padding:0.5rem 0.75rem; color:var(--fg-muted); font-family:var(--font-mono); font-size:0.8rem; cursor:pointer;">Cancel</button>
        </div>
      </div>

      <div id="invoice-list" style="padding:1rem 1.5rem; overflow-y:auto;"></div>
    `;
    return panel;
  }

  private addStyles() {
    if (document.getElementById('invoice-panel-styles')) return;
    const style = document.createElement('style');
    style.id = 'invoice-panel-styles';
    style.textContent = `
      #invoice-panel {
        display: none;
        position: fixed;
        top: 0;
        right: 0;
        width: 420px;
        height: 100dvh;
        background: var(--bg-panel);
        border-left: 1px solid var(--accent-yellow);
        z-index: 100;
        flex-direction: column;
        box-shadow: -4px 0 30px #ffe60022;
        font-family: var(--font-ui);
        color: var(--fg);
      }
      #invoice-panel.open { display: flex; flex-direction: column; }
      .invoice-field { margin-bottom: 0.6rem; }
      .invoice-label {
        display: block;
        font-size: 0.7rem;
        color: var(--fg-muted);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin-bottom: 0.25rem;
      }
      .invoice-input {
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
      .invoice-input:focus { border-color: var(--accent-yellow); }
      .invoice-section-title {
        font-size: 0.7rem;
        color: var(--accent-yellow);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 0.5rem;
        padding-bottom: 0.25rem;
        border-bottom: 1px solid var(--border);
      }
      .invoice-line-item-row {
        background: var(--bg-surface);
        border: 1px solid var(--border);
        border-radius: 4px;
        padding: 0.5rem;
        margin-bottom: 0.4rem;
      }
      .invoice-line-item-row input, .invoice-line-item-row select {
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 3px;
        padding: 0.3rem 0.4rem;
        color: var(--fg);
        font-family: var(--font-mono);
        font-size: 0.75rem;
        outline: none;
      }
      .invoice-card {
        background: var(--bg-surface);
        border: 1px solid var(--border);
        border-radius: 6px;
        padding: 0.75rem;
        margin-bottom: 0.6rem;
      }
      .invoice-card-number {
        font-family: var(--font-mono);
        color: var(--accent-yellow);
        font-size: 0.75rem;
        margin-bottom: 0.25rem;
      }
      .invoice-card-client {
        font-family: var(--font-mono);
        color: var(--fg);
        font-size: 0.9rem;
        margin-bottom: 0.25rem;
      }
      .invoice-card-detail {
        font-size: 0.75rem;
        color: var(--fg-muted);
        margin-bottom: 0.1rem;
      }
      .invoice-status {
        display: inline-block;
        padding: 0.1rem 0.4rem;
        border-radius: 3px;
        font-size: 0.65rem;
        font-family: var(--font-mono);
        text-transform: uppercase;
      }
      .inv-status-draft { background: var(--bg); color: var(--fg-muted); border: 1px solid var(--border); }
      .inv-status-sent { background: #1a3a5c; color: var(--accent-cyan); }
      .inv-status-unpaid { background: #3a1a1a; color: var(--accent-pink); }
      .inv-status-partial { background: #3a2a1a; color: var(--accent-orange); }
      .inv-status-paid { background: #1a3a1a; color: var(--accent-green); }
      .inv-status-overdue { background: #3a0a0a; color: #ff4444; }
      .invoice-card-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.5rem;
        flex-wrap: wrap;
      }
      .invoice-card-actions button {
        background: transparent;
        border: 1px solid var(--border);
        border-radius: 4px;
        padding: 0.2rem 0.5rem;
        color: var(--fg-muted);
        font-family: var(--font-mono);
        font-size: 0.7rem;
        cursor: pointer;
      }
      .invoice-card-actions button:hover { color: var(--accent-yellow); border-color: var(--accent-yellow); }
      .btn-delete-invoice:hover { color: var(--accent-pink) !important; border-color: var(--accent-pink) !important; }
    `;
    document.head.appendChild(style);
  }

  async open() {
    this.panel.classList.add('open');
    this.overlay.style.display = 'block';
    await Promise.all([this.loadClients(), this.loadInvoices()]);
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
    this.populateClientSelect();
  }

  private async loadInvoices() {
    const res = await fetch('/invoices', { headers: { 'Accept': 'application/json' } });
    this.invoices = await res.json();
    this.renderInvoices();
  }

  private populateClientSelect() {
    const select = this.panel.querySelector('#if-client') as HTMLSelectElement;
    select.innerHTML = '<option value="">— Select client —</option>';
    this.clients.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.company ? `${c.name} — ${c.company}` : c.name;
      select.appendChild(opt);
    });
  }

  private renderLineItems() {
    const container = this.panel.querySelector('#if-line-items')!;
    container.innerHTML = this.lineItems.map((item, i) => `
      <div class="invoice-line-item-row" data-index="${i}">
        <div style="display:flex; gap:0.4rem; margin-bottom:0.3rem;">
          <input type="text" class="ili-description" data-index="${i}" placeholder="Description" style="flex:3;" value="${item.description || ''}" />
          <select class="ili-billing-type" data-index="${i}" style="flex:1;">
            <option value="fixed" ${item.billing_type === 'fixed' ? 'selected' : ''}>Fixed</option>
            <option value="hourly" ${item.billing_type === 'hourly' ? 'selected' : ''}>Hourly</option>
            <option value="per_word" ${item.billing_type === 'per_word' ? 'selected' : ''}>Per Word</option>
            <option value="per_page" ${item.billing_type === 'per_page' ? 'selected' : ''}>Per Page</option>
            <option value="per_day" ${item.billing_type === 'per_day' ? 'selected' : ''}>Per Day</option>
            <option value="per_item" ${item.billing_type === 'per_item' ? 'selected' : ''}>Per Item</option>
          </select>
        </div>
        <div style="display:flex; gap:0.4rem; align-items:center;">
          <input type="number" class="ili-quantity" data-index="${i}" placeholder="Qty" style="width:60px;" value="${item.quantity || 1}" step="0.01" />
          <span style="color:var(--fg-muted); font-size:0.75rem;">×</span>
          <input type="number" class="ili-rate" data-index="${i}" placeholder="Rate" style="flex:1;" value="${item.rate || ''}" step="0.01" />
          <span style="color:var(--accent-yellow); font-family:var(--font-mono); font-size:0.75rem; min-width:50px; text-align:right;">$${((item.quantity || 0) * (item.rate || 0)).toFixed(2)}</span>
          <button class="ili-remove" data-index="${i}" style="background:none; border:none; color:var(--fg-muted); cursor:pointer; font-size:0.9rem;">✕</button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.ili-description, .ili-billing-type, .ili-quantity, .ili-rate').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt((e.target as HTMLElement).dataset.index!);
        const row = container.querySelector(`.invoice-line-item-row[data-index="${idx}"]`)!;
        this.lineItems[idx].description = (row.querySelector('.ili-description') as HTMLInputElement).value;
        this.lineItems[idx].billing_type = (row.querySelector('.ili-billing-type') as HTMLSelectElement).value;
        this.lineItems[idx].quantity = parseFloat((row.querySelector('.ili-quantity') as HTMLInputElement).value) || 0;
        this.lineItems[idx].rate = parseFloat((row.querySelector('.ili-rate') as HTMLInputElement).value) || 0;
        if ((e.target as HTMLElement).classList.contains('ili-quantity') ||
            (e.target as HTMLElement).classList.contains('ili-rate') ||
            (e.target as HTMLElement).classList.contains('ili-billing-type')) {
          this.renderLineItems();
        }
      });
    });

    container.querySelectorAll('.ili-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt((btn as HTMLElement).dataset.index!);
        this.lineItems.splice(idx, 1);
        this.renderLineItems();
      });
    });
  }

  private renderInvoices() {
    const list = this.panel.querySelector('#invoice-list')!;
    if (this.invoices.length === 0) {
      list.innerHTML = '<div style="color:var(--fg-muted); font-size:0.8rem; padding:0.5rem 0;">No invoices yet.</div>';
      return;
    }
    list.innerHTML = this.invoices.map(inv => `
      <div class="invoice-card">
        <div class="invoice-card-number">${inv.invoice_number}</div>
        <div class="invoice-card-client">${inv.client_name || 'No client'}</div>
        <div style="display:flex; gap:0.5rem; align-items:center; margin-bottom:0.25rem;">
          <span class="invoice-status inv-status-${inv.status}">${inv.status}</span>
          <span class="invoice-card-detail">Due: ${inv.due_date}</span>
        </div>
        <div class="invoice-card-detail" style="color:var(--accent-yellow);">Total: $${inv.total || '0.00'}</div>
        <div class="invoice-card-detail" style="color:${inv.amount_due > 0 ? 'var(--accent-pink)' : 'var(--accent-green)'};">
          ${inv.amount_due > 0 ? `Due: $${inv.amount_due}` : '✓ Paid'}
        </div>
        <div class="invoice-card-actions">
          <button class="btn-edit-invoice" data-id="${inv.id}">Edit</button>
          <button class="btn-delete-invoice" data-id="${inv.id}">Delete</button>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.btn-edit-invoice').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = parseInt((btn as HTMLElement).dataset.id!);
        await this.editInvoice(id);
      });
    });

    list.querySelectorAll('.btn-delete-invoice').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = (btn as HTMLElement).dataset.id!;
        const inv = this.invoices.find(i => i.id === parseInt(id));
        if (!confirm(`Delete invoice ${inv.invoice_number}?`)) return;
        await fetch(`/invoices/${id}`, {
          method: 'DELETE',
          headers: { 'X-CSRF-Token': this.csrfToken }
        });
        await this.loadInvoices();
      });
    });
  }

  private showForm() {
    (this.panel.querySelector('#invoice-form') as HTMLElement).style.display = 'block';
    const today: string = new Date().toISOString().split('T')[0] ?? '';
    const due: string = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] ?? '';
    const issueDateEl = this.panel.querySelector('#if-issue-date') as HTMLInputElement;
    const dueDateEl = this.panel.querySelector('#if-due-date') as HTMLInputElement;
    if (issueDateEl) issueDateEl.value = today;
    if (dueDateEl) dueDateEl.value = due;
  }

  private hideForm() {
    (this.panel.querySelector('#invoice-form') as HTMLElement).style.display = 'none';
    this.clearForm();
    this.editingId = null;
    this.lineItems = [];
  }

  private clearForm() {
    ['if-payment-method', 'if-notes', 'if-amount-paid',
     'if-tax1-label', 'if-tax1-rate', 'if-tax2-label', 'if-tax2-rate',
     'if-tax3-label', 'if-tax3-rate', 'if-tax4-label', 'if-tax4-rate',
     'if-discount-amount'].forEach(id => {
      const el = this.panel.querySelector(`#${id}`) as HTMLInputElement;
      if (el) el.value = '';
    });
    (this.panel.querySelector('#if-client') as HTMLSelectElement).value = '';
    (this.panel.querySelector('#if-discount-type') as HTMLSelectElement).value = '';
    (this.panel.querySelector('#if-status') as HTMLSelectElement).value = 'draft';
    this.lineItems = [];
    this.renderLineItems();
  }

  private async editInvoice(id: number) {
    const res = await fetch(`/invoices/${id}`, { headers: { 'Accept': 'application/json' } });
    const invoice = await res.json();
    this.editingId = id;
    this.showForm();

    (this.panel.querySelector('#if-client') as HTMLSelectElement).value = invoice.client_id;
    (this.panel.querySelector('#if-issue-date') as HTMLInputElement).value = invoice.issue_date;
    (this.panel.querySelector('#if-due-date') as HTMLInputElement).value = invoice.due_date;
    (this.panel.querySelector('#if-status') as HTMLSelectElement).value = invoice.status;
    (this.panel.querySelector('#if-discount-type') as HTMLSelectElement).value = invoice.discount_type || '';
    (this.panel.querySelector('#if-discount-amount') as HTMLInputElement).value = invoice.discount_amount || '';
    (this.panel.querySelector('#if-tax1-label') as HTMLInputElement).value = invoice.tax1_label || '';
    (this.panel.querySelector('#if-tax1-rate') as HTMLInputElement).value = invoice.tax1_rate || '';
    (this.panel.querySelector('#if-tax2-label') as HTMLInputElement).value = invoice.tax2_label || '';
    (this.panel.querySelector('#if-tax2-rate') as HTMLInputElement).value = invoice.tax2_rate || '';
    (this.panel.querySelector('#if-tax3-label') as HTMLInputElement).value = invoice.tax3_label || '';
    (this.panel.querySelector('#if-tax3-rate') as HTMLInputElement).value = invoice.tax3_rate || '';
    (this.panel.querySelector('#if-tax4-label') as HTMLInputElement).value = invoice.tax4_label || '';
    (this.panel.querySelector('#if-tax4-rate') as HTMLInputElement).value = invoice.tax4_rate || '';
    (this.panel.querySelector('#if-payment-method') as HTMLInputElement).value = invoice.payment_method || '';
    (this.panel.querySelector('#if-amount-paid') as HTMLInputElement).value = invoice.amount_paid || '';
    (this.panel.querySelector('#if-notes') as HTMLTextAreaElement).value = invoice.notes || '';

    this.lineItems = invoice.line_items || [];
    this.renderLineItems();
  }

  async openWithQuote(quoteId: number) {
    const res = await fetch(`/quotes/${quoteId}`, { headers: { 'Accept': 'application/json' } });
    const quote = await res.json();
    this.panel.classList.add('open');
    this.overlay.style.display = 'block';
    await Promise.all([this.loadClients(), this.loadInvoices()]);
    this.wireEvents();
    this.showForm();
    (this.panel.querySelector('#if-client') as HTMLSelectElement).value = quote.client_id;
    (this.panel.querySelector('#if-tax1-label') as HTMLInputElement).value = quote.tax1_label || '';
    (this.panel.querySelector('#if-tax1-rate') as HTMLInputElement).value = quote.tax1_rate || '';
    (this.panel.querySelector('#if-tax2-label') as HTMLInputElement).value = quote.tax2_label || '';
    (this.panel.querySelector('#if-tax2-rate') as HTMLInputElement).value = quote.tax2_rate || '';
    (this.panel.querySelector('#if-payment-method') as HTMLInputElement).value = quote.payment_method || '';
    this.lineItems = quote.line_items || [];
    this.renderLineItems();
  }

  private wireEvents() {
    (this.panel.querySelector('#invoice-close') as HTMLElement).onclick = () => this.close();
    (this.panel.querySelector('#invoice-add-btn') as HTMLElement).onclick = () => {
      this.lineItems = [];
      this.showForm();
      this.renderLineItems();
    };
    (this.panel.querySelector('#if-cancel') as HTMLElement).onclick = () => this.hideForm();
    (this.panel.querySelector('#if-add-line-item') as HTMLElement).onclick = () => {
      this.lineItems.push({ description: '', billing_type: 'fixed', quantity: 1, rate: 0 });
      this.renderLineItems();
    };

    (this.panel.querySelector('#if-save') as HTMLElement).onclick = async () => {
      const clientId = (this.panel.querySelector('#if-client') as HTMLSelectElement).value;
      if (!clientId) { alert('Please select a client.'); return; }

      const invoiceData = {
        invoice: {
          client_id: clientId,
          issue_date: (this.panel.querySelector('#if-issue-date') as HTMLInputElement).value,
          due_date: (this.panel.querySelector('#if-due-date') as HTMLInputElement).value,
          status: (this.panel.querySelector('#if-status') as HTMLSelectElement).value,
          discount_type: (this.panel.querySelector('#if-discount-type') as HTMLSelectElement).value || null,
          discount_amount: (this.panel.querySelector('#if-discount-amount') as HTMLInputElement).value || null,
          tax1_label: (this.panel.querySelector('#if-tax1-label') as HTMLInputElement).value || null,
          tax1_rate: (this.panel.querySelector('#if-tax1-rate') as HTMLInputElement).value || null,
          tax2_label: (this.panel.querySelector('#if-tax2-label') as HTMLInputElement).value || null,
          tax2_rate: (this.panel.querySelector('#if-tax2-rate') as HTMLInputElement).value || null,
          tax3_label: (this.panel.querySelector('#if-tax3-label') as HTMLInputElement).value || null,
          tax3_rate: (this.panel.querySelector('#if-tax3-rate') as HTMLInputElement).value || null,
          tax4_label: (this.panel.querySelector('#if-tax4-label') as HTMLInputElement).value || null,
          tax4_rate: (this.panel.querySelector('#if-tax4-rate') as HTMLInputElement).value || null,
          payment_method: (this.panel.querySelector('#if-payment-method') as HTMLInputElement).value,
          amount_paid: (this.panel.querySelector('#if-amount-paid') as HTMLInputElement).value || 0,
          notes: (this.panel.querySelector('#if-notes') as HTMLTextAreaElement).value,
        },
        line_items: this.lineItems
      };

      const url = this.editingId ? `/invoices/${this.editingId}` : '/invoices';
      const method = this.editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': this.csrfToken },
        body: JSON.stringify(invoiceData)
      });

      if (res.ok) {
        this.hideForm();
        await this.loadInvoices();
      } else {
        const err = await res.json();
        alert(`Error: ${err.errors?.join(', ') || 'Something went wrong'}`);
      }
    };
  }
}
