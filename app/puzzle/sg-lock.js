/**
 * Security Group Lock Puzzle
 *
 * Table of rules. Player toggles allow/deny per row to create the correct ruleset.
 *
 * Usage:
 *   new SgLock(containerEl, {
 *     rules: [
 *       { protocol: 'TCP', port: '443', source: '0.0.0.0/0', answer: 'allow' },
 *       { protocol: 'TCP', port: '22', source: '0.0.0.0/0', answer: 'deny' },
 *       { protocol: 'TCP', port: '22', source: '10.0.0.0/8', answer: 'allow' },
 *       { protocol: 'TCP', port: '3306', source: '0.0.0.0/0', answer: 'deny' },
 *     ],
 *     onSubmit(correct) { ... }
 *   });
 */

class SgLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.rules = opts.rules || [];
    this.headers = opts.headers || null;
    this.onSubmit = opts.onSubmit || (() => {});
    this.states = this.rules.map(() => 'deny');
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'sglk';

    const table = document.createElement('div');
    table.className = 'sglk-table';
    const headers = this.headers || ['Protocol','Port','Source','Action'];
    const numCols = headers.length;
    const gridCols = `repeat(${numCols},1fr)`;
    // Header
    const hdr = document.createElement('div');
    hdr.className = 'sglk-row sglk-hdr';
    hdr.style.gridTemplateColumns = gridCols;
    headers.forEach(h => { const c = document.createElement('div'); c.className = 'sglk-cell'; c.textContent = h; hdr.appendChild(c); });
    table.appendChild(hdr);

    this.rowEls = [];
    let lastGroup = '';
    this.rules.forEach((r, i) => {
      if (r.label) {
        const group = r.label.replace(/#\d+\s*/, '');
        if (group !== lastGroup) {
          lastGroup = group;
          const sep = document.createElement('div');
          sep.className = 'sglk-row sglk-sep';
          sep.textContent = group;
          table.appendChild(sep);
        }
      }
      const row = document.createElement('div');
      row.className = 'sglk-row';
      row.style.gridTemplateColumns = gridCols;
      [r.protocol, r.port, r.source].filter(v => v !== '').forEach(v => { const c = document.createElement('div'); c.className = 'sglk-cell'; c.textContent = v; row.appendChild(c); });
      const toggle = document.createElement('div');
      toggle.className = 'sglk-cell';
      const btn = document.createElement('button');
      btn.className = 'sglk-toggle sglk-deny';
      btn.textContent = 'DENY';
      btn.addEventListener('click', () => {
        this.states[i] = this.states[i] === 'allow' ? 'deny' : 'allow';
        btn.textContent = this.states[i].toUpperCase();
        btn.classList.toggle('sglk-allow', this.states[i] === 'allow');
        btn.classList.toggle('sglk-deny', this.states[i] === 'deny');
      });
      toggle.appendChild(btn);
      row.appendChild(toggle);
      table.appendChild(row);
      this.rowEls.push(row);
    });
    wrap.appendChild(table);

    const btn = document.createElement('button');
    btn.className = 'sglk-btn';
    btn.textContent = 'Apply Rules';
    btn.addEventListener('click', () => this._test());
    wrap.appendChild(btn);

    this.statusEl = document.createElement('div');
    this.statusEl.className = 'sglk-status';
    wrap.appendChild(this.statusEl);

    this.container.appendChild(wrap);
    this._injectStyles();
  }

  _test() {
    let ok = true;
    this.rules.forEach((r, i) => {
      const correct = this.states[i] === r.answer;
      this.rowEls[i].classList.toggle('sglk-correct', correct);
      this.rowEls[i].classList.toggle('sglk-wrong', !correct);
      if (!correct) { ok = false; setTimeout(() => this.rowEls[i].classList.remove('sglk-wrong'), 600); }
    });
    this.statusEl.textContent = ok ? '✅ Rules applied!' : '❌ Incorrect configuration';
    if (ok) setTimeout(() => this.onSubmit(true), 400);
  }

  reset() { this.states = this.rules.map(() => 'deny'); this._render(); }

  _injectStyles() {
    if (document.getElementById('sglk-css')) return;
    const s = document.createElement('style'); s.id = 'sglk-css';
    s.textContent = `
.sglk{display:flex;flex-direction:column;gap:12px;padding:16px 0;max-width:400px;margin:0 auto}
.sglk-table{border:1px solid var(--border,#1e2a45);border-radius:8px;overflow:hidden}
.sglk-row{display:grid;gap:1px;background:var(--border,#1e2a45)}
.sglk-hdr{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--muted,#7a8ba8)}
.sglk-cell{background:var(--surface,#141b2d);padding:8px;font-size:12px;color:var(--muted,#7a8ba8);display:flex;align-items:center}
.sglk-toggle{padding:4px 10px;border:none;border-radius:4px;font-size:11px;font-weight:700;cursor:pointer;letter-spacing:.5px;transition:all .15s}
.sglk-allow{background:#0c2d1a;color:var(--green,#22c55e)}
.sglk-deny{background:#2a0a0a;color:#ef4444}
.sglk-row.sglk-correct .sglk-cell{background:#0c1a0c}
.sglk-row.sglk-wrong{animation:sglk-sh .4s}
@keyframes sglk-sh{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
.sglk-btn{padding:12px 28px;border:none;border-radius:8px;background:var(--accent,#3b82f6);color:#fff;font-size:14px;font-weight:600;cursor:pointer;align-self:center}
.sglk-btn:active{opacity:.7}
.sglk-status{font-size:13px;color:var(--muted,#7a8ba8);text-align:center;min-height:18px}
.sglk-sep{display:block;padding:6px 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--accent,#3b82f6);background:var(--bg,#0a0e17)}
`;
    document.head.appendChild(s);
  }
}
