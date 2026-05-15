/**
 * Witness Lock Puzzle
 *
 * Match witness testimonies to the correct events/moments.
 *
 * Usage:
 *   new WitnessLock(containerEl, {
 *     testimonies: [{ id, who, quote, moment }],
 *     moments: ['moment1', 'moment2', ...],
 *     onSubmit() { }
 *   });
 */
class WitnessLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.testimonies = (opts.testimonies || []).sort(() => Math.random() - 0.5);
    this.moments = opts.moments || this.testimonies.map(t => t.moment);
    this.onSubmit = opts.onSubmit || (() => {});
    this.assignments = {};
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const w = document.createElement('div'); w.className = 'wtlk';

    this.testimonies.forEach(t => {
      const row = document.createElement('div'); row.className = 'wtlk-row';
      row.innerHTML = `<div class="wtlk-who">${t.who} says:</div><div class="wtlk-quote">${t.quote}</div>`;
      const sel = document.createElement('select'); sel.className = 'wtlk-sel';
      sel.innerHTML = `<option value="">— What moment is this? —</option>` + this.moments.map(m => `<option value="${m}" ${this.assignments[t.id]===m?'selected':''}>${m}</option>`).join('');
      sel.addEventListener('change', () => { this.assignments[t.id] = sel.value; });
      row.appendChild(sel);
      w.appendChild(row);
    });

    const bar = document.createElement('div'); bar.className = 'wtlk-bar';
    const btn = document.createElement('button'); btn.className = 'wtlk-btn'; btn.textContent = '✅ Confirm';
    btn.addEventListener('click', () => this._check());
    bar.appendChild(btn);
    w.appendChild(bar);

    this.statusEl = document.createElement('div'); this.statusEl.className = 'wtlk-status';
    w.appendChild(this.statusEl);

    this.container.appendChild(w);
    this._injectStyles();
  }

  _check() {
    const allFilled = this.testimonies.every(t => this.assignments[t.id]);
    if (!allFilled) { this.statusEl.textContent = 'Match all testimonies first.'; this.statusEl.style.color = 'var(--red,#ef4444)'; return; }
    const correct = this.testimonies.every(t => this.assignments[t.id] === t.moment);
    if (correct) { this.statusEl.textContent = '✅ All testimonies matched!'; this.statusEl.style.color = 'var(--green,#22c55e)'; setTimeout(() => this.onSubmit(true), 400); }
    else { const wrong = this.testimonies.filter(t => this.assignments[t.id] !== t.moment).length; this.statusEl.textContent = `❌ ${wrong} mismatch(es). Re-read the quotes.`; this.statusEl.style.color = 'var(--red,#ef4444)'; }
  }

  _injectStyles() {
    if (document.getElementById('wtlk-css')) return;
    const s = document.createElement('style'); s.id = 'wtlk-css';
    s.textContent = `
.wtlk{display:flex;flex-direction:column;gap:8px;padding:16px 0;max-width:400px;margin:0 auto}
.wtlk-row{background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);border-radius:8px;padding:10px}
.wtlk-who{font-size:11px;color:var(--yellow,#f59e0b);font-weight:600;margin-bottom:4px}
.wtlk-quote{font-size:13px;font-style:italic;color:var(--text,#e0e6f0);margin-bottom:8px;line-height:1.4}
.wtlk-sel{width:100%;padding:8px;background:var(--bg,#0a0e17);border:1px solid var(--border,#1e2a45);border-radius:6px;color:var(--muted,#7a8ba8);font-size:12px}
.wtlk-bar{text-align:center;margin-top:4px}
.wtlk-btn{padding:10px 20px;background:var(--accent,#3b82f6);color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer}
.wtlk-status{text-align:center;font-size:13px;min-height:18px;margin-top:4px}
`;
    document.head.appendChild(s);
  }
}
