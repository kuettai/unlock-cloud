/**
 * Evidence Board Lock Puzzle
 *
 * Connect investigation steps to their key findings.
 *
 * Usage:
 *   new EvidenceBoardLock(containerEl, {
 *     connections: [{ step, finding, icon }],
 *     onSubmit() { }
 *   });
 */
class EvidenceBoardLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.connections = opts.connections || [];
    this.findings = this.connections.map(c => c.finding).sort(() => Math.random() - 0.5);
    this.onSubmit = opts.onSubmit || (() => {});
    this.assignments = {};
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const w = document.createElement('div'); w.className = 'eblk';

    this.connections.forEach((c, i) => {
      const row = document.createElement('div'); row.className = 'eblk-row';
      row.innerHTML = `<span class="eblk-icon">${c.icon || '🔍'}</span><div class="eblk-step">${c.step}</div>`;
      const sel = document.createElement('select'); sel.className = 'eblk-sel';
      sel.innerHTML = `<option value="">— Key finding —</option>` + this.findings.map(f => `<option value="${f}" ${this.assignments[i]===f?'selected':''}>${f}</option>`).join('');
      sel.addEventListener('change', () => { this.assignments[i] = sel.value; });
      row.appendChild(sel);
      w.appendChild(row);
    });

    const bar = document.createElement('div'); bar.className = 'eblk-bar';
    const btn = document.createElement('button'); btn.className = 'eblk-btn'; btn.textContent = '✅ Confirm';
    btn.addEventListener('click', () => this._check());
    bar.appendChild(btn);
    w.appendChild(bar);

    this.statusEl = document.createElement('div'); this.statusEl.className = 'eblk-status';
    w.appendChild(this.statusEl);

    this.container.appendChild(w);
    this._injectStyles();
  }

  _check() {
    const allFilled = this.connections.every((_, i) => this.assignments[i]);
    if (!allFilled) { this.statusEl.textContent = 'Connect all steps first.'; this.statusEl.style.color = 'var(--red,#ef4444)'; return; }
    const correct = this.connections.every((c, i) => this.assignments[i] === c.finding);
    if (correct) { this.statusEl.textContent = '✅ Evidence board complete!'; this.statusEl.style.color = 'var(--green,#22c55e)'; setTimeout(() => this.onSubmit(true), 400); }
    else { const wrong = this.connections.filter((c, i) => this.assignments[i] !== c.finding).length; this.statusEl.textContent = `❌ ${wrong} connection(s) wrong.`; this.statusEl.style.color = 'var(--red,#ef4444)'; }
  }

  _injectStyles() {
    if (document.getElementById('eblk-css')) return;
    const s = document.createElement('style'); s.id = 'eblk-css';
    s.textContent = `
.eblk{display:flex;flex-direction:column;gap:8px;padding:16px 0;max-width:400px;margin:0 auto}
.eblk-row{background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);border-radius:8px;padding:10px;display:flex;flex-wrap:wrap;align-items:flex-start;gap:8px}
.eblk-icon{font-size:18px;flex-shrink:0}
.eblk-step{font-size:13px;font-weight:600;color:var(--text,#e0e6f0);flex:1;min-width:120px}
.eblk-sel{width:100%;padding:8px;background:var(--bg,#0a0e17);border:1px solid var(--border,#1e2a45);border-radius:6px;color:var(--muted,#7a8ba8);font-size:11px}
.eblk-bar{text-align:center;margin-top:4px}
.eblk-btn{padding:10px 20px;background:var(--accent,#3b82f6);color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer}
.eblk-status{text-align:center;font-size:13px;min-height:18px;margin-top:4px}
`;
    document.head.appendChild(s);
  }
}
