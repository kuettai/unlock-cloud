/**
 * Grid Organization Lock Puzzle
 *
 * Drag people into group zones. Each zone has a target capacity.
 * All zones must be filled to exactly their target. People come from
 * a "crowd" pool at the top.
 *
 * Usage:
 *   new GridOrgLock(containerEl, {
 *     zones: [
 *       { id: 'g1', label: 'Group 1', target: 50 },
 *       { id: 'g2', label: 'Group 2', target: 50 },
 *     ],
 *     pool: 200,              // total people to distribute
 *     increment: 10,          // each tap adds/removes this many
 *     onSubmit({ zones }) {},
 *     onWrong(msg) {},
 *   });
 */

class GridOrgLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.zones = (opts.zones || []).map(z => ({ ...z, current: 0 }));
    this.pool = opts.pool || 200;
    this.increment = opts.increment || 10;
    this.remaining = this.pool;
    this.onSubmit = opts.onSubmit || (() => {});
    this.onWrong = opts.onWrong || (() => {});
    this.solved = false;
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'golk';

    this.statusEl = document.createElement('div');
    this.statusEl.className = 'golk-status';
    wrap.appendChild(this.statusEl);

    // Pool display
    this.poolEl = document.createElement('div');
    this.poolEl.className = 'golk-pool';
    wrap.appendChild(this.poolEl);

    // Zones
    const grid = document.createElement('div');
    grid.className = 'golk-zones';
    this.zoneEls = [];
    this.zones.forEach((z, i) => {
      const zone = document.createElement('div');
      zone.className = 'golk-zone';

      const label = document.createElement('div');
      label.className = 'golk-zone-label';
      label.textContent = z.label;
      zone.appendChild(label);

      const bar = document.createElement('div');
      bar.className = 'golk-zone-bar';
      const fill = document.createElement('div');
      fill.className = 'golk-zone-fill';
      bar.appendChild(fill);
      zone.appendChild(bar);

      const info = document.createElement('div');
      info.className = 'golk-zone-info';
      zone.appendChild(info);

      const btns = document.createElement('div');
      btns.className = 'golk-zone-btns';
      const minus = document.createElement('button');
      minus.className = 'golk-zbtn';
      minus.textContent = '−';
      minus.addEventListener('click', () => this._adjust(i, -1));
      const plus = document.createElement('button');
      plus.className = 'golk-zbtn';
      plus.textContent = '+';
      plus.addEventListener('click', () => this._adjust(i, 1));
      btns.appendChild(minus);
      btns.appendChild(plus);
      zone.appendChild(btns);

      grid.appendChild(zone);
      this.zoneEls.push({ zone, fill, info });
    });
    wrap.appendChild(grid);

    // Buttons
    const bar = document.createElement('div');
    bar.className = 'golk-bar';
    const btn = document.createElement('button');
    btn.className = 'golk-btn';
    btn.textContent = '✓ Confirm Groups';
    btn.addEventListener('click', () => this._submit());
    bar.appendChild(btn);
    const resetBtn = document.createElement('button');
    resetBtn.className = 'golk-btn-sec';
    resetBtn.textContent = '↻ Reset';
    resetBtn.addEventListener('click', () => this._reset());
    bar.appendChild(resetBtn);
    wrap.appendChild(bar);

    this.container.appendChild(wrap);
    this._injectStyles();
    this._updateAll();
  }

  _adjust(i, dir) {
    if (this.solved) return;
    const z = this.zones[i];
    const amount = this.increment * dir;
    const newVal = z.current + amount;
    if (newVal < 0) return;
    if (dir > 0 && this.remaining < this.increment) return;
    z.current = newVal;
    this.remaining = this.pool - this.zones.reduce((s, z) => s + z.current, 0);
    this._updateAll();
  }

  _updateAll() {
    this.remaining = this.pool - this.zones.reduce((s, z) => s + z.current, 0);
    this.poolEl.textContent = `👥 Remaining in crowd: ${this.remaining.toLocaleString()}`;
    if (!this.solved) {
      this.statusEl.textContent = `Organize the crowd into groups — use + and −`;
    }
    this.zones.forEach((z, i) => {
      const el = this.zoneEls[i];
      const pct = Math.min(100, (z.current / z.target) * 100);
      el.fill.style.width = pct + '%';
      const exact = z.current === z.target;
      const over = z.current > z.target;
      el.fill.style.background = over ? 'var(--red,#ef4444)' : exact ? 'var(--green,#22c55e)' : 'var(--accent,#3b82f6)';
      el.info.textContent = `${z.current}/${z.target}`;
      el.info.style.color = exact ? 'var(--green,#22c55e)' : over ? 'var(--red,#ef4444)' : '';
    });
  }

  _submit() {
    if (this.solved) return;
    const allCorrect = this.zones.every(z => z.current === z.target);
    if (allCorrect && this.remaining === 0) {
      this.solved = true;
      this.statusEl.textContent = '✅ All groups organized!';
      this.zoneEls.forEach(el => el.zone.classList.add('golk-done'));
      setTimeout(() => this.onSubmit({ zones: this.zones.map(z => ({ id: z.id, count: z.current })) }), 600);
    } else if (this.remaining > 0) {
      this.statusEl.textContent = `❌ ${this.remaining.toLocaleString()} people still unassigned`;
      this.onWrong('Not everyone is seated');
    } else {
      const wrong = this.zones.filter(z => z.current !== z.target);
      this.statusEl.textContent = `❌ ${wrong.length} group(s) have wrong size`;
      this.onWrong('Groups must match target sizes');
    }
  }

  _reset() {
    this.zones.forEach(z => z.current = 0);
    this.remaining = this.pool;
    this.solved = false;
    this.zoneEls.forEach(el => el.zone.classList.remove('golk-done'));
    this._updateAll();
  }

  _injectStyles() {
    if (document.getElementById('golk-css')) return;
    const s = document.createElement('style');
    s.id = 'golk-css';
    s.textContent = `
.golk{display:flex;flex-direction:column;align-items:center;gap:12px;padding:16px 0}
.golk-status{font-size:14px;color:var(--muted,#7a8ba8);min-height:20px;text-align:center}
.golk-pool{font-size:15px;font-weight:700;color:var(--text,#e0e6f0);text-align:center;padding:8px 16px;background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);border-radius:8px}
.golk-zones{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;width:min(360px,95vw)}
.golk-zone{flex:1 1 45%;min-width:140px;background:var(--surface,#141b2d);border:1.5px solid var(--border,#1e2a45);border-radius:8px;padding:10px;display:flex;flex-direction:column;gap:6px}
.golk-done{border-color:var(--green,#22c55e)!important}
.golk-zone-label{font-size:12px;color:var(--muted,#7a8ba8);font-weight:600}
.golk-zone-bar{height:8px;background:rgba(255,255,255,.05);border-radius:4px;overflow:hidden}
.golk-zone-fill{height:100%;width:0%;border-radius:4px;transition:width .15s,background .15s}
.golk-zone-info{font-size:13px;font-weight:700;color:var(--text,#e0e6f0);text-align:center}
.golk-zone-btns{display:flex;gap:6px;justify-content:center}
.golk-zbtn{width:36px;height:36px;border:none;border-radius:8px;background:var(--bg,#0a0e17);border:1px solid var(--border,#1e2a45);color:var(--text,#e0e6f0);font-size:18px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center}
.golk-zbtn:active{opacity:.7;transform:scale(.95)}
.golk-bar{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.golk-btn{padding:10px 18px;border:none;border-radius:8px;background:var(--accent,#3b82f6);color:#fff;font-size:14px;font-weight:600;cursor:pointer}
.golk-btn:active{opacity:.7}
.golk-btn-sec{padding:8px 14px;border:none;border-radius:8px;background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);color:var(--muted,#7a8ba8);font-size:13px;font-weight:600;cursor:pointer}
.golk-btn-sec:active{opacity:.7}
`;
    document.head.appendChild(s);
  }
}
