export class QuotePanel {
  private panel: HTMLElement;
  private overlay: HTMLElement;
  private csrfToken: string;
  private quotes: any[] = [];
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
    overlay.id = 'quote-overlay';
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
    panel.id = 'quote-panel';
    panel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:1.5rem 1.5rem 1rem; border-bottom:1px solid var(--border);">
        <span style="color:var(--accent-purple); font-size:0.85rem; letter-spacing:0.1em; text-transform:uppercase;">📋 Quotes</span>
        <button id="quote-close" style="background:none; border:none; color:var(--fg-muted); cursor:pointer; font-size:1.2rem;">×</button>
      </div>

      <div style="padding:1rem 1.5rem; border-bottom:1px solid var(--border);">
        <button id="quote-add-btn" style="width:100%; background:transparent; border:1px solid var(--accent-purple); border-radius:4px; padding:0.5rem; color:var(--accent-purple); font-family:var(--font-mono); font-size:0.8rem; cursor:pointer;">+ New Quote</button>
      </div>

      <div id="quote-form" style="display:none; padding:1rem 1.5rem; border-bottom:1px solid var(--border); overflow-y:auto;">
        
        <div class="quote-section-title">Quote Details</div>

        <div class="quote-field">
          <label class="quote-label">Client *</label>
          <select id="qf-client" class="quote-input">
            <option value="">— Select client —</option>
          </select>
        </div>

        <div style="display:flex; gap:0.5rem;">
          <div class="quote-field" style="flex:1;">
            <label class="quote-label">Issue Date</label>
            <input type="date" id="qf-issue-date" class="quote-input" />
          </div>
          <div class="quote-field" style="flex:1;">
            <label class="quote-label">Valid Until</label>
            <input type="date" id="qf-validity-date" class="quote-input" />
          </div>
        </div>

        <div class="quote-section-title" style="margin-top:1rem;">Line Items</div>

        <div id="qf-line-items"></div>
        <button id="qf-add-line-item" style="width:100%; background:transparent; border:1px dashed var(--border); border-radius:4px; padding:0.4rem; color:var(--fg-muted); font-family:var(--font-mono); font-size:0.75rem; cursor:pointer; margin-bottom:0.75rem;">+ Add Line Item</button>

        <div class="quote-section-title" style="margin-top:0.5rem;">Financial</div>

        <div style="display:flex; gap:0.5rem;">
          <div class="quote-field" style="flex:1;">
            <label class="quote-label">Discount Type</label>
            <select id="qf-discount-type" class="quote-input">
              <option value="">None</option>
              <option value="percent">Percent (%)</option>
              <option value="flat">Flat Amount ($)</option>
            </select>
          </div>
          <div class="quote-field" style="flex:1;">
            <label class="quote-label">Discount Amount</label>
            <input type="number" id="qf-discount-amount" class="quote-input" placeholder="0" step="0.01" />
          </div>
        </div>

        <div class="quote-section-title" style="margin-top:0.5rem;">Tax Lines</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.4rem;">
          <input type="text" id="qf-tax1-label" class="quote-input" placeholder="Tax 1 label (e.g. State)" />
          <input type="number" id="qf-tax1-rate" class="quote-input" placeholder="Rate %" step="0.01" />
          <input type="text" id="qf-tax2-label" class="quote-input" placeholder="Tax 2 label" />
          <input type="number" id="qf-tax2-rate" class="quote-input" placeholder="Rate %" step="0.01" />
          <input type="text" id="qf-tax3-label" class="quote-input" placeholder="Tax 3 label" />
          <input type="number" id="qf-tax3-rate" class="quote-input" placeholder="Rate %" step="0.01" />
          <input type="text" id="qf-tax4-label" class="quote-input" placeholder="Tax 4 label" />
          <input type="number" id="qf-tax4-rate" class="quote-input" placeholder="Rate %" step="0.01" />
        </div>

        <div class="quote-section-title" style="margin-top:1rem;">Deposit</div>
        <div style="display:flex; gap:0.5rem;">
          <div class="quote-field" style="flex:1;">
            <label class="quote-label">Deposit Type</label>
            <select id="qf-deposit-type" class="quote-input">
              <option value="">None</option>
              <option value="percent">Percent (%)</option>
              <option value="flat">Flat Amount ($)</option>
            </select>
          </div>
          <div class="quote-field" style="flex:1;">
            <label class="quote-label">Amount</label>
            <input type="number" id="qf-deposit-amount" class="quote-input" placeholder="0" step="0.01" />
          </div>
        </div>

        <div class="quote-section-title" style="margin-top:0.5rem;">Payment</div>
        <div style="display:flex; gap:0.5rem;">
          <div class="quote-field" style="flex:1;">
            <label class="quote-label">Terms</label>
            <select id="qf-payment-terms" class="quote-input">
              <option value="due_on_receipt">Due on Receipt</option>
              <option value="net_7">Net 7</option>
              <option value="net_15">Net 15</option>
              <option value="net_30">Net 30</option>
              <option value="net_35">Net 35</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div class="quote-field" style="flex:1;">
            <label class="quote-label">Method</label>
            <input type="text" id="qf-payment-method" class="quote-input" placeholder="Bank transfer, PayPal..." />
          </div>
        </div>

        <div class="quote-section-title" style="margin-top:0.5rem;">Legal</div>
        <div class="quote-field">
          <label class="quote-label">State Clause</label>
          <select id="qf-state-clause" class="quote-input">
            <option value="">None</option>
            <option value="california">California (FWPA)</option>
            <option value="new_york_state">New York State</option>
            <option value="new_york_city">New York City</option>
            <option value="illinois">Illinois</option>
            <option value="minnesota">Minnesota</option>
            <option value="seattle">Seattle, WA</option>
            <option value="columbus">Columbus, OH</option>
            <option value="los_angeles">Los Angeles, CA</option>
          </select>
        </div>
        <div class="quote-field">
          <label class="quote-label">Terms & Conditions</label>
          <textarea id="qf-terms" class="quote-input" rows="4" placeholder="Enter your terms and conditions..."></textarea>
        </div>
        <div style="font-size:0.7rem; color:var(--fg-muted); margin-bottom:0.75rem;">
          Need a full contract? <a href="https://freelancersunion.org/contract/" target="_blank" rel="noopener" style="color:var(--accent-cyan);">Freelancers Union Contract Creator →</a>
        </div>

        <div class="quote-field">
          <label class="quote-label">Notes</label>
          <textarea id="qf-notes" class="quote-input" rows="2" placeholder="Additional notes for the client..."></textarea>
        </div>

        <div style="display:flex; gap:0.5rem; margin-top:0.75rem;">
          <button id="qf-save" style="flex:1; background:var(--accent-purple); border:none; border-radius:4px; padding:0.5rem; color:white; font-family:var(--font-mono); font-size:0.8rem; cursor:pointer;">Save Quote</button>
          <button id="qf-cancel" style="background:transparent; border:1px solid var(--border); border-radius:4px; padding:0.5rem 0.75rem; color:var(--fg-muted); font-family:var(--font-mono); font-size:0.8rem; cursor:pointer;">Cancel</button>
        </div>
      </div>

      <div id="quote-list" style="padding:1rem 1.5rem; overflow-y:auto;"></div>
    `;
    return panel;
  }

  private addStyles() {
    if (document.getElementById('quote-panel-styles')) return;
    const style = document.createElement('style');
    style.id = 'quote-panel-styles';
    style.textContent = `
      #quote-panel {
        display: none;
        position: fixed;
        top: 0;
        right: 0;
        width: 420px;
        height: 100dvh;
        background: var(--bg-panel);
        border-left: 1px solid var(--accent-purple);
        z-index: 100;
        flex-direction: column;
        box-shadow: -4px 0 30px #b45fcb22;
        font-family: var(--font-ui);
        color: var(--fg);
      }
      #quote-panel.open { display: flex; flex-direction: column; }
      #quote-form { max-height: 80vh; overflow-y: auto; }
      .quote-field { margin-bottom: 0.6rem; }
      .quote-label {
        display: block;
        font-size: 0.7rem;
        color: var(--fg-muted);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin-bottom: 0.25rem;
      }
      .quote-input {
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
      .quote-input:focus { border-color: var(--accent-purple); }
      .quote-section-title {
        font-size: 0.7rem;
        color: var(--accent-purple);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 0.5rem;
        padding-bottom: 0.25rem;
        border-bottom: 1px solid var(--border);
      }
      .line-item-row {
        background: var(--bg-surface);
        border: 1px solid var(--border);
        border-radius: 4px;
        padding: 0.5rem;
        margin-bottom: 0.4rem;
      }
      .line-item-row input, .line-item-row select {
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 3px;
        padding: 0.3rem 0.4rem;
        color: var(--fg);
        font-family: var(--font-mono);
        font-size: 0.75rem;
        outline: none;
      }
      .quote-card {
        background: var(--bg-surface);
        border: 1px solid var(--border);
        border-radius: 6px;
        padding: 0.75rem;
        margin-bottom: 0.6rem;
      }
      .quote-card-number {
        font-family: var(--font-mono);
        color: var(--accent-purple);
        font-size: 0.75rem;
        margin-bottom: 0.25rem;
      }
      .quote-card-client {
        font-family: var(--font-mono);
        color: var(--fg);
        font-size: 0.9rem;
        margin-bottom: 0.25rem;
      }
      .quote-card-detail {
        font-size: 0.75rem;
        color: var(--fg-muted);
        margin-bottom: 0.1rem;
      }
      .quote-status {
        display: inline-block;
        padding: 0.1rem 0.4rem;
        border-radius: 3px;
        font-size: 0.65rem;
        font-family: var(--font-mono);
        text-transform: uppercase;
      }
      .status-draft { background: var(--bg); color: var(--fg-muted); border: 1px solid var(--border); }
      .status-sent { background: #1a3a5c; color: var(--accent-cyan); }
      .status-accepted { background: #1a3a1a; color: var(--accent-green); }
      .status-rejected { background: #3a1a1a; color: var(--accent-pink); }
      .status-invoiced { background: #3a3a1a; color: var(--accent-yellow); }
      .quote-card-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.5rem;
        flex-wrap: wrap;
      }
      .quote-card-actions button {
        background: transparent;
        border: 1px solid var(--border);
        border-radius: 4px;
        padding: 0.2rem 0.5rem;
        color: var(--fg-muted);
        font-family: var(--font-mono);
        font-size: 0.7rem;
        cursor: pointer;
      }
      .quote-card-actions button:hover { color: var(--accent-purple); border-color: var(--accent-purple); }
      .btn-delete-quote:hover { color: var(--accent-pink) !important; border-color: var(--accent-pink) !important; }
    `;
    document.head.appendChild(style);
  }

  async open() {
    this.panel.classList.add('open');
    this.overlay.style.display = 'block';
    await Promise.all([this.loadClients(), this.loadQuotes()]);
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

  private async loadQuotes() {
    const res = await fetch('/quotes', { headers: { 'Accept': 'application/json' } });
    this.quotes = await res.json();
    this.renderQuotes();
  }

  private populateClientSelect() {
    const select = this.panel.querySelector('#qf-client') as HTMLSelectElement;
    select.innerHTML = '<option value="">— Select client —</option>';
    this.clients.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.company ? `${c.name} — ${c.company}` : c.name;
      select.appendChild(opt);
    });
  }

  private renderLineItems() {
    const container = this.panel.querySelector('#qf-line-items')!;
    container.innerHTML = this.lineItems.map((item, i) => `
      <div class="line-item-row" data-index="${i}">
        <div style="display:flex; gap:0.4rem; margin-bottom:0.3rem;">
          <input type="text" class="li-description" data-index="${i}" placeholder="Description" style="flex:3;" value="${item.description || ''}" />
          <select class="li-billing-type" data-index="${i}" style="flex:1;">
            <option value="fixed" ${item.billing_type === 'fixed' ? 'selected' : ''}>Fixed</option>
            <option value="hourly" ${item.billing_type === 'hourly' ? 'selected' : ''}>Hourly</option>
            <option value="per_word" ${item.billing_type === 'per_word' ? 'selected' : ''}>Per Word</option>
            <option value="per_page" ${item.billing_type === 'per_page' ? 'selected' : ''}>Per Page</option>
            <option value="per_day" ${item.billing_type === 'per_day' ? 'selected' : ''}>Per Day</option>
            <option value="per_item" ${item.billing_type === 'per_item' ? 'selected' : ''}>Per Item</option>
          </select>
        </div>
        <div style="display:flex; gap:0.4rem; align-items:center;">
          <input type="number" class="li-quantity" data-index="${i}" placeholder="Qty" style="width:60px;" value="${item.quantity || 1}" step="0.01" />
          <span style="color:var(--fg-muted); font-size:0.75rem;">×</span>
          <input type="number" class="li-rate" data-index="${i}" placeholder="Rate" style="flex:1;" value="${item.rate || ''}" step="0.01" />
          <span style="color:var(--accent-yellow); font-family:var(--font-mono); font-size:0.75rem; min-width:50px; text-align:right;">$${((item.quantity || 0) * (item.rate || 0)).toFixed(2)}</span>
          <button class="li-remove" data-index="${i}" style="background:none; border:none; color:var(--fg-muted); cursor:pointer; font-size:0.9rem;">✕</button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.li-description, .li-billing-type, .li-quantity, .li-rate').forEach(input => {
  input.addEventListener('input', (e) => {
    const idx = parseInt((e.target as HTMLElement).dataset.index!);
    const row = container.querySelector(`.line-item-row[data-index="${idx}"]`)!;
    this.lineItems[idx].description = (row.querySelector('.li-description') as HTMLInputElement).value;
    this.lineItems[idx].billing_type = (row.querySelector('.li-billing-type') as HTMLSelectElement).value;
    this.lineItems[idx].quantity = parseFloat((row.querySelector('.li-quantity') as HTMLInputElement).value) || 0;
    this.lineItems[idx].rate = parseFloat((row.querySelector('.li-rate') as HTMLInputElement).value) || 0;
    // Only re-render for non-description fields to update totals
    if ((e.target as HTMLElement).classList.contains('li-quantity') || 
        (e.target as HTMLElement).classList.contains('li-rate') ||
        (e.target as HTMLElement).classList.contains('li-billing-type')) {
      this.renderLineItems();
    }
  });
});


    container.querySelectorAll('.li-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt((btn as HTMLElement).dataset.index!);
        this.lineItems.splice(idx, 1);
        this.renderLineItems();
      });
    });
  }

  private renderQuotes() {
    const list = this.panel.querySelector('#quote-list')!;
    if (this.quotes.length === 0) {
      list.innerHTML = '<div style="color:var(--fg-muted); font-size:0.8rem; padding:0.5rem 0;">No quotes yet. Create your first quote above.</div>';
      return;
    }
    list.innerHTML = this.quotes.map(q => `
      <div class="quote-card">
        <div class="quote-card-number">${q.quote_number}</div>
        <div class="quote-card-client">${q.client_name || 'No client'}</div>
        <div style="display:flex; gap:0.5rem; align-items:center; margin-bottom:0.25rem;">
          <span class="quote-status status-${q.status}">${q.status}</span>
          <span class="quote-card-detail">Issued: ${q.issue_date}</span>
          <span class="quote-card-detail">Valid: ${q.validity_date}</span>
        </div>
        <div class="quote-card-detail" style="color:var(--accent-yellow);">Total: $${q.total || '0.00'}</div>
        <div class="quote-card-actions">
          <button class="btn-edit-quote" data-id="${q.id}">Edit</button>
          <button class="btn-convert-quote" data-id="${q.id}">→ Invoice</button>
          <button class="btn-export-pdf-quote" data-id="${q.id}">⬇️ PDF</button>
          <button class="btn-status-quote" data-id="${q.id}">Status</button>
          <button class="btn-delete-quote" data-id="${q.id}">Delete</button>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.btn-edit-quote').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = parseInt((btn as HTMLElement).dataset.id!);
        await this.editQuote(id);
      });
    });

    list.querySelectorAll('.btn-status-quote').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = (btn as HTMLElement).dataset.id!;
        const status = prompt('New status (draft/sent/accepted/rejected/invoiced):');
        if (!status) return;
        await fetch(`/quotes/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': this.csrfToken },
          body: JSON.stringify({ quote: { status } })
        });
        await this.loadQuotes();
      });
    });
    list.querySelectorAll('.btn-convert-quote').forEach(btn => {
  btn.addEventListener('click', async () => {
    const id = (btn as HTMLElement).dataset.id!;
    if (!confirm('Convert this quote to an invoice?')) return;
    const res = await fetch(`/quotes/${id}/convert_to_invoice`, {
      method: 'POST',
      headers: { 'X-CSRF-Token': this.csrfToken }
    });
    if (res.ok) {
      alert('Invoice created successfully!');
      await this.loadQuotes();
    }
  });
});

     list.querySelectorAll('.btn-export-pdf-quote').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = (btn as HTMLElement).dataset.id!;
            window.location.href = `/quotes/${id}/export_pdf`;
        });
     });


    list.querySelectorAll('.btn-delete-quote').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = (btn as HTMLElement).dataset.id!;
        const quote = this.quotes.find(q => q.id === parseInt(id));
        if (!confirm(`Delete quote ${quote.quote_number}?`)) return;
        await fetch(`/quotes/${id}`, {
          method: 'DELETE',
          headers: { 'X-CSRF-Token': this.csrfToken }
        });
        await this.loadQuotes();
      });
    });
  }

  private showForm() {
  (this.panel.querySelector('#quote-form') as HTMLElement).style.display = 'block';
  const today: string = new Date().toISOString().split('T')[0] ?? '';
  const validity: string = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] ?? '';
  const issueDateEl = this.panel.querySelector('#qf-issue-date') as HTMLInputElement;
  const validityDateEl = this.panel.querySelector('#qf-validity-date') as HTMLInputElement;
  if (issueDateEl) issueDateEl.value = today;
  if (validityDateEl) validityDateEl.value = validity;
}


  private hideForm() {
    (this.panel.querySelector('#quote-form') as HTMLElement).style.display = 'none';
    this.clearForm();
    this.editingId = null;
    this.lineItems = [];
  }

  private clearForm() {
    ['qf-payment-method', 'qf-terms', 'qf-notes',
     'qf-tax1-label', 'qf-tax1-rate', 'qf-tax2-label', 'qf-tax2-rate',
     'qf-tax3-label', 'qf-tax3-rate', 'qf-tax4-label', 'qf-tax4-rate',
     'qf-discount-amount', 'qf-deposit-amount'].forEach(id => {
      const el = this.panel.querySelector(`#${id}`) as HTMLInputElement;
      if (el) el.value = '';
    });
    (this.panel.querySelector('#qf-client') as HTMLSelectElement).value = '';
    (this.panel.querySelector('#qf-discount-type') as HTMLSelectElement).value = '';
    (this.panel.querySelector('#qf-deposit-type') as HTMLSelectElement).value = '';
    (this.panel.querySelector('#qf-payment-terms') as HTMLSelectElement).value = 'due_on_receipt';
    (this.panel.querySelector('#qf-state-clause') as HTMLSelectElement).value = '';
    this.lineItems = [];
    this.renderLineItems();
  }

  private async editQuote(id: number) {
    const res = await fetch(`/quotes/${id}`, { headers: { 'Accept': 'application/json' } });
    const quote = await res.json();
    this.editingId = id;
    this.showForm();

    (this.panel.querySelector('#qf-client') as HTMLSelectElement).value = quote.client_id;
    (this.panel.querySelector('#qf-issue-date') as HTMLInputElement).value = quote.issue_date;
    (this.panel.querySelector('#qf-validity-date') as HTMLInputElement).value = quote.validity_date;
    (this.panel.querySelector('#qf-discount-type') as HTMLSelectElement).value = quote.discount_type || '';
    (this.panel.querySelector('#qf-discount-amount') as HTMLInputElement).value = quote.discount_amount || '';
    (this.panel.querySelector('#qf-tax1-label') as HTMLInputElement).value = quote.tax1_label || '';
    (this.panel.querySelector('#qf-tax1-rate') as HTMLInputElement).value = quote.tax1_rate || '';
    (this.panel.querySelector('#qf-tax2-label') as HTMLInputElement).value = quote.tax2_label || '';
    (this.panel.querySelector('#qf-tax2-rate') as HTMLInputElement).value = quote.tax2_rate || '';
    (this.panel.querySelector('#qf-tax3-label') as HTMLInputElement).value = quote.tax3_label || '';
    (this.panel.querySelector('#qf-tax3-rate') as HTMLInputElement).value = quote.tax3_rate || '';
    (this.panel.querySelector('#qf-tax4-label') as HTMLInputElement).value = quote.tax4_label || '';
    (this.panel.querySelector('#qf-tax4-rate') as HTMLInputElement).value = quote.tax4_rate || '';
    (this.panel.querySelector('#qf-deposit-type') as HTMLSelectElement).value = quote.deposit_type || '';
    (this.panel.querySelector('#qf-deposit-amount') as HTMLInputElement).value = quote.deposit_amount || '';
    (this.panel.querySelector('#qf-payment-terms') as HTMLSelectElement).value = quote.payment_terms || 'due_on_receipt';
    (this.panel.querySelector('#qf-payment-method') as HTMLInputElement).value = quote.payment_method || '';
    (this.panel.querySelector('#qf-state-clause') as HTMLSelectElement).value = quote.state_clause || '';
    (this.panel.querySelector('#qf-terms') as HTMLTextAreaElement).value = quote.terms_and_conditions || '';
    (this.panel.querySelector('#qf-notes') as HTMLTextAreaElement).value = quote.notes || '';

    this.lineItems = quote.line_items || [];
    this.renderLineItems();
  }

  private wireEvents() {
    (this.panel.querySelector('#quote-close') as HTMLElement).onclick = () => this.close();
    (this.panel.querySelector('#quote-add-btn') as HTMLElement).onclick = () => {
      this.lineItems = [];
      this.showForm();
      this.renderLineItems();
    };
    (this.panel.querySelector('#qf-cancel') as HTMLElement).onclick = () => this.hideForm();
    (this.panel.querySelector('#qf-add-line-item') as HTMLElement).onclick = () => {
      this.lineItems.push({ description: '', billing_type: 'fixed', quantity: 1, rate: 0 });
      this.renderLineItems();
    };

    (this.panel.querySelector('#qf-save') as HTMLElement).onclick = async () => {
      const clientId = (this.panel.querySelector('#qf-client') as HTMLSelectElement).value;
      if (!clientId) { alert('Please select a client.'); return; }

      const quoteData = {
        quote: {
          client_id: clientId,
          issue_date: (this.panel.querySelector('#qf-issue-date') as HTMLInputElement).value,
          validity_date: (this.panel.querySelector('#qf-validity-date') as HTMLInputElement).value,
          discount_type: (this.panel.querySelector('#qf-discount-type') as HTMLSelectElement).value || null,
          discount_amount: (this.panel.querySelector('#qf-discount-amount') as HTMLInputElement).value || null,
          tax1_label: (this.panel.querySelector('#qf-tax1-label') as HTMLInputElement).value || null,
          tax1_rate: (this.panel.querySelector('#qf-tax1-rate') as HTMLInputElement).value || null,
          tax2_label: (this.panel.querySelector('#qf-tax2-label') as HTMLInputElement).value || null,
          tax2_rate: (this.panel.querySelector('#qf-tax2-rate') as HTMLInputElement).value || null,
          tax3_label: (this.panel.querySelector('#qf-tax3-label') as HTMLInputElement).value || null,
          tax3_rate: (this.panel.querySelector('#qf-tax3-rate') as HTMLInputElement).value || null,
          tax4_label: (this.panel.querySelector('#qf-tax4-label') as HTMLInputElement).value || null,
          tax4_rate: (this.panel.querySelector('#qf-tax4-rate') as HTMLInputElement).value || null,
          deposit_type: (this.panel.querySelector('#qf-deposit-type') as HTMLSelectElement).value || null,
          deposit_amount: (this.panel.querySelector('#qf-deposit-amount') as HTMLInputElement).value || null,
          payment_terms: (this.panel.querySelector('#qf-payment-terms') as HTMLSelectElement).value,
          payment_method: (this.panel.querySelector('#qf-payment-method') as HTMLInputElement).value,
          state_clause: (this.panel.querySelector('#qf-state-clause') as HTMLSelectElement).value || null,
          terms_and_conditions: (this.panel.querySelector('#qf-terms') as HTMLTextAreaElement).value,
          notes: (this.panel.querySelector('#qf-notes') as HTMLTextAreaElement).value,
        },
        line_items: this.lineItems
      };

      const url = this.editingId ? `/quotes/${this.editingId}` : '/quotes';
      const method = this.editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': this.csrfToken },
        body: JSON.stringify(quoteData)
      });

      if (res.ok) {
        this.hideForm();
        await this.loadQuotes();
      } else {
        const err = await res.json();
        alert(`Error: ${err.errors?.join(', ') || 'Something went wrong'}`);
      }
    };
  }
}
