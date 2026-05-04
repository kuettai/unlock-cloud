/**
 * AZ Placement Lock Puzzle
 *
 * Distribute resources across availability zone columns for high availability.
 *
 * Usage:
 *   new AzLock(containerEl, {
 *     zones: ['us-east-1a','us-east-1b','us-east-1c'],
 *     resources: [
 *       { id: 'web1', label: 'Web Server', icon: '🖥️' },
 *       { id: 'web2', label: 'Web Server', icon: '🖥️' },
 *       { id: 'db1', label: 'DB Primary', icon: '🗄️' },
 *       { id: 'db2', label: 'DB Replica', icon: '🗄️' },
 *     ],
 *     solution: { web1: 0, web2: 1, db1: 0, db2: 2 },  // resource id -> zone index
 *     onSubmit(correct) { ... }
 *   });
 */

class AzLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.zones = opts.zones || [];
    this.resources = opts.resources || [];
    this.solution = opts.solution || {};
    this.onSubmit = opts.onSubmit || (() => {});
    this.placements = {};
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'azlk';

    // Resource pool
    const pool = document.createElement('div');
    pool.className = 'azlk-pool';
    const poolLbl = document.createElement('div');
    poolLbl.className = 'azlk-section';
    poolLbl.textContent = 'Resources';
    pool.appendChild(poolLbl);
    this.poolChips = document.createElement('div');
    this.poolChips.className = 'azlk-chips';
    pool.appendChild(this.poolChips);
    wrap.appendChild(pool);

    // AZ columns
    const cols = document.createElement('div');
    cols.className = 'azlk-cols';
    this.zoneEls = [];
    this.zones.forEach((z, zi) => {
      const col = document.createElement('div');
      col.className = 'azlk-col';
      col.dataset.zone = zi;
      const hdr = document.createElement('div');
      hdr.className = 'azlk-zone-hdr';
      hdr.textContent = z;
      col.appendChild(hdr);
      const slots = document.createElement('div');
      slots.className = 'azlk-slots';
      col.appendChild(slots);
      col.addEventListener('dragover', e => { e.preventDefault(); col.classList.add('azlk-over'); });
      col.addEventListener('dragleave', () => col.classList.remove('azlk-over'));
      col.addEventListener('drop', e => { e.preventDefault(); col.classList.remove('azlk-over'); this._place(zi, e.dataTransfer.getData('text/plain')); });
      cols.appendChild(col);
      this.zoneEls.push({ col, slots });
    });
    wrap.appendChild(cols);

    const btn = document.createElement('button');
    btn.className = 'azlk-btn';
    btn.textContent = 'Validate HA';
    btn.addEventListener('click', () => this._test());
    wrap.appendChild(btn);

    this.statusEl = document.createElement('div');
    this.statusEl.className = 'azlk-status';
    wrap.appendChild(this.statusEl);

    this.container.appendChild(wrap);
    this._injectStyles();
    this._renderAll();
  }

  _makeChip(res, inPool) {
    const chip = document.createElement('div');
    chip.className = 'azlk-chip';
    chip.draggable = true;
    chip.dataset.res = res.id;
    chip.innerHTML = `<span>${res.icon}</span> ${res.label}`;
    chip.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', res.id); chip.classList.add('azlk-dragging'); });
    chip.addEventListener('dragend', () => chip.classList.remove('azlk-dragging'));
    chip.addEventListener('touchstart', () => { this._touchRes = res.id; chip.classList.add('azlk-dragging'); }, { passive: true });
    chip.addEventListener('touchend', e => {
      chip.classList.remove('azlk-dragging');
      const t = e.changedTouches[0];
      const el = document.elementFromPoint(t.clientX, t.clientY);
      const col = el && el.closest('[data-zone]');
      if (col && this._touchRes) this._place(parseInt(col.dataset.zone), this._touchRes);
      this._touchRes = null;
    });
    if (!inPool) {
      chip.addEventListener('click', () => { delete this.placements[res.id]; this._renderAll(); });
      chip.classList.add('azlk-placed');
    }
    return chip;
  }

  _place(zoneIdx, resId) {
    this.placements[resId] = zoneIdx;
    this._renderAll();
  }

  _renderAll() {
    const placed = new Set(Object.keys(this.placements));
    this.poolChips.innerHTML = '';
    this.resources.forEach(r => { if (!placed.has(r.id)) this.poolChips.appendChild(this._makeChip(r, true)); });
    this.zoneEls.forEach((z, zi) => {
      z.slots.innerHTML = '';
      this.resources.forEach(r => { if (this.placements[r.id] === zi) z.slots.appendChild(this._makeChip(r, false)); });
    });
  }

  _test() {
    const correct = Object.entries(this.solution).every(([rid, zi]) => this.placements[rid] === zi);
    if (correct) {
      this.statusEl.textContent = '✅ High availability achieved!';
      this.zoneEls.forEach(z => z.col.classList.add('azlk-correct'));
      setTimeout(() => this.onSubmit(true), 400);
    } else {
      this.statusEl.textContent = '❌ Not highly available';
      this.zoneEls.forEach(z => { z.col.classList.add('azlk-shake'); setTimeout(() => z.col.classList.remove('azlk-shake'), 600); });
    }
  }

  reset() { this.placements = {}; this._renderAll(); this.statusEl.textContent = ''; this.zoneEls.forEach(z => z.col.classList.remove('azlk-correct')); }

  _injectStyles() {
    if (document.getElementById('azlk-css')) return;
    const s = document.createElement('style');
    s.id = 'azlk-css';
    s.textContent = `
.azlk{display:flex;flex-direction:column;gap:12px;padding:16px 0;max-width:400px;margin:0 auto}
.azlk-section{font-size:11px;color:var(--muted,#7a8ba8);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
.azlk-chips{display:flex;flex-wrap:wrap;gap:6px;min-height:32px}
.azlk-chip{display:flex;align-items:center;gap:6px;padding:6px 10px;background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);border-radius:6px;font-size:12px;font-weight:600;color:var(--text,#e0e6f0);cursor:grab;user-select:none;-webkit-user-select:none;white-space:nowrap}
.azlk-chip.azlk-dragging{opacity:.4}
.azlk-chip.azlk-placed{cursor:pointer;border-color:var(--accent,#3b82f6)}
.azlk-cols{display:flex;gap:8px}
.azlk-col{flex:1;background:var(--surface,#141b2d);border:2px solid var(--border,#1e2a45);border-radius:8px;padding:8px;min-height:120px;transition:all .2s}
.azlk-col.azlk-over{border-color:var(--accent,#3b82f6);box-shadow:0 0 10px rgba(59,130,246,.2)}
.azlk-col.azlk-correct{border-color:var(--green,#22c55e)}
.azlk-shake{animation:azlk-sh .4s}
@keyframes azlk-sh{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
.azlk-zone-hdr{font-size:10px;color:var(--muted,#7a8ba8);text-align:center;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid var(--border,#1e2a45)}
.azlk-slots{display:flex;flex-direction:column;gap:6px}
.azlk-btn{padding:12px 28px;border:none;border-radius:8px;background:var(--accent,#3b82f6);color:#fff;font-size:14px;font-weight:600;cursor:pointer;align-self:center}
.azlk-btn:active{opacity:.7}
.azlk-status{font-size:13px;color:var(--muted,#7a8ba8);text-align:center;min-height:18px}
`;
    document.head.appendChild(s);
  }
}
