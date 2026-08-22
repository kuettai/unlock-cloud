/**
 * DynamoDB Query Lock Puzzle
 *
 * Build a query by selecting partition key, sort key condition, and filter.
 *
 * Usage:
 *   new QueryLock(containerEl, {
 *     table: 'Orders',
 *     schema: { pk: 'userId', sk: 'orderDate' },
 *     fields: [
 *       { label: 'Partition Key (userId)', options: ['user-123','user-456','*'], answer: 'user-123' },
 *       { label: 'Sort Key Condition', options: ['begins_with 2024','between 2024-01 and 2024-06','= 2024-03-15'], answer: 'begins_with 2024' },
 *       { label: 'Filter', options: ['status = shipped','amount > 100','none'], answer: 'status = shipped' },
 *     ],
 *     onSubmit(correct) { ... }
 *   });
 */

class QueryLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.table = opts.table || 'Table';
    this.schema = opts.schema || {};
    this.fields = opts.fields || [];
    this.onSubmit = opts.onSubmit || (() => {});
    this.selections = new Array(this.fields.length).fill('');
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'qlk';

    const hdr = document.createElement('div');
    hdr.className = 'qlk-hdr';
    hdr.innerHTML = `Table: <b>${this.table}</b> &nbsp; PK: <code>${this.schema.pk}</code> &nbsp; SK: <code>${this.schema.sk}</code>`;
    wrap.appendChild(hdr);

    this.fieldEls = [];
    this.fields.forEach((f, i) => {
      const row = document.createElement('div');
      row.className = 'qlk-row';
      const lbl = document.createElement('div');
      lbl.className = 'qlk-label';
      lbl.textContent = f.label;
      row.appendChild(lbl);
      const sel = document.createElement('select');
      sel.className = 'qlk-sel';
      const def = document.createElement('option'); def.value = ''; def.textContent = '— select —'; sel.appendChild(def);
      f.options.forEach(o => { const opt = document.createElement('option'); opt.value = o; opt.textContent = o; sel.appendChild(opt); });
      sel.addEventListener('change', () => { this.selections[i] = sel.value; this._updatePreview(); });
      row.appendChild(sel);
      wrap.appendChild(row);
      this.fieldEls.push({ row, sel });
    });

    this.previewEl = document.createElement('div');
    this.previewEl.className = 'qlk-preview';
    wrap.appendChild(this.previewEl);

    const btn = document.createElement('button');
    btn.className = 'qlk-btn';
    btn.textContent = 'Execute Query';
    btn.addEventListener('click', () => this._test());
    wrap.appendChild(btn);

    this.statusEl = document.createElement('div');
    this.statusEl.className = 'qlk-status';
    wrap.appendChild(this.statusEl);

    this.container.appendChild(wrap);
    this._injectStyles();
    this._updatePreview();
  }

  _updatePreview() {
    const parts = this.selections.map((s, i) => s ? `${this.fields[i].label}: ${s}` : '?');
    this.previewEl.textContent = `Query(${parts.join(', ')})`;
  }

  _test() {
    let ok = true;
    this.fields.forEach((f, i) => {
      const correct = this.selections[i] === f.answer;
      this.fieldEls[i].row.classList.toggle('qlk-correct', correct);
      if (!correct) { ok = false; this.fieldEls[i].row.classList.add('qlk-wrong'); setTimeout(() => this.fieldEls[i].row.classList.remove('qlk-wrong'), 600); }
    });
    this.statusEl.textContent = ok ? '✅ Query returned results!' : '❌ No matching items';
    if (ok) setTimeout(() => this.onSubmit(true), 400);
  }

  reset() { this.selections.fill(''); this.fieldEls.forEach(f => { f.sel.value = ''; f.row.classList.remove('qlk-correct','qlk-wrong'); }); this.statusEl.textContent = ''; this._updatePreview(); }

  _injectStyles() {
    if (document.getElementById('qlk-css')) return;
    const s = document.createElement('style'); s.id = 'qlk-css';
    s.textContent = `
.qlk{display:flex;flex-direction:column;gap:10px;padding:16px 0;max-width:380px;margin:0 auto}
.qlk-hdr{font-size:12px;color:#7a8ba8;text-align:center}
.qlk-hdr b{color:#e0e6f0}
.qlk-hdr code{color:#3b82f6;font-size:11px}
.qlk-row{padding:10px;background:#141b2d;border:2px solid #1e2a45;border-radius:8px;transition:all .2s}
.qlk-row.qlk-correct{border-color:#22c55e}
.qlk-row.qlk-wrong{animation:qlk-sh .4s;border-color:#ef4444}
@keyframes qlk-sh{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
.qlk-label{font-size:11px;color:#7a8ba8;margin-bottom:6px;font-weight:600}
.qlk-sel{width:100%;padding:8px;background:#0a0e17;border:1px solid #1e2a45;border-radius:6px;color:#e0e6f0;font-size:12px}
.qlk-preview{font-family:monospace;font-size:11px;color:#7a8ba8;background:#0c0c0c;padding:8px;border-radius:6px;word-break:break-all}
.qlk-btn{padding:12px 28px;border:none;border-radius:8px;background:#3b82f6;color:#fff;font-size:14px;font-weight:600;cursor:pointer;align-self:center}
.qlk-btn:active{opacity:.7}
.qlk-status{font-size:13px;color:#7a8ba8;text-align:center;min-height:18px}
`;
    document.head.appendChild(s);
  }
}
