/**
 * Rank Lock — Knight Equipment Puzzle
 *
 * Drag capability badges onto a knight silhouette's slots.
 * Knight visually ranks up as correct badges are placed.
 *
 * Usage:
 *   new RankLock(el, {
 *     slots: [{ id: 'model', label: 'Mind', icon: '🧠', y: 8 }],
 *     badges: [{ id: 'claude', label: 'Claude', icon: '🧠', slot: 'model' }],
 *     extraBadges: [{ id: 'decoy', label: 'Sharp Sword', icon: '⚔️' }],
 *     ranks: ['Soldier','Scout','Marshal','Champion'],
 *     onSubmit() {}, onWrong(msg) {}
 *   });
 */
class RankLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.slots = opts.slots || [];
    this.badges = opts.badges || [];
    this.extra = opts.extraBadges || [];
    this.ranks = opts.ranks || ['Soldier', 'Champion'];
    this.onSubmit = opts.onSubmit || (() => {});
    this.onWrong = opts.onWrong || (() => {});
    this.falseOutputs = opts.falseOutputs || [];
    this.placements = {};
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const w = document.createElement('div');
    w.className = 'rnklk';

    // Rank display
    this.rankEl = document.createElement('div');
    this.rankEl.className = 'rnklk-rank';
    this.rankEl.textContent = this.ranks[0];
    w.appendChild(this.rankEl);

    // Knight figure
    const fig = document.createElement('div');
    fig.className = 'rnklk-figure';
    // Knight body SVG
    fig.innerHTML = `<svg viewBox="0 0 120 200" class="rnklk-svg">
      <circle cx="60" cy="30" r="22" class="rnklk-body"/>
      <rect x="35" y="55" width="50" height="60" rx="8" class="rnklk-body"/>
      <rect x="15" y="60" width="20" height="50" rx="6" class="rnklk-body"/>
      <rect x="85" y="60" width="20" height="50" rx="6" class="rnklk-body"/>
      <rect x="38" y="118" width="18" height="55" rx="6" class="rnklk-body"/>
      <rect x="64" y="118" width="18" height="55" rx="6" class="rnklk-body"/>
    </svg>`;
    // Slot overlays
    this.slotEls = {};
    this.slots.forEach(s => {
      const slot = document.createElement('div');
      slot.className = 'rnklk-slot';
      slot.dataset.slot = s.id;
      slot.style.top = s.y + '%';
      if (s.x != null) { slot.style.left = s.x + '%'; slot.style.transform = 'translate(-50%,-50%)'; }
      slot.innerHTML = `<span class="rnklk-slot-label">${s.label}</span><span class="rnklk-slot-icon">?</span>`;
      slot.addEventListener('dragover', e => { e.preventDefault(); slot.classList.add('rnklk-over'); });
      slot.addEventListener('dragleave', () => slot.classList.remove('rnklk-over'));
      slot.addEventListener('drop', e => { e.preventDefault(); slot.classList.remove('rnklk-over'); this._place(s.id, e.dataTransfer.getData('text/plain')); });
      slot.addEventListener('click', () => { if (this.placements[s.id]) this._remove(s.id); });
      fig.appendChild(slot);
      this.slotEls[s.id] = slot;
    });
    w.appendChild(fig);

    // Badge pool
    const pool = document.createElement('div');
    pool.className = 'rnklk-pool';
    this.allBadges = [...this.badges, ...this.extra];
    this.badgeEls = {};
    this.allBadges.forEach(b => {
      const chip = document.createElement('div');
      chip.className = 'rnklk-badge';
      chip.draggable = true;
      chip.dataset.badge = b.id;
      chip.innerHTML = `<span class="rnklk-badge-icon">${b.icon || '⚙️'}</span><span>${b.label}</span>`;
      chip.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', b.id); chip.classList.add('rnklk-dragging'); });
      chip.addEventListener('dragend', () => chip.classList.remove('rnklk-dragging'));
      // Touch support
      chip.addEventListener('touchstart', () => { this._touchBadge = b.id; chip.classList.add('rnklk-dragging'); }, { passive: true });
      chip.addEventListener('touchend', e => {
        chip.classList.remove('rnklk-dragging');
        const t = e.changedTouches[0];
        const el = document.elementFromPoint(t.clientX, t.clientY);
        const slotEl = el && el.closest('[data-slot]');
        if (slotEl && this._touchBadge) this._place(slotEl.dataset.slot, this._touchBadge);
        this._touchBadge = null;
      });
      pool.appendChild(chip);
      this.badgeEls[b.id] = chip;
    });
    w.appendChild(pool);

    // Button
    const btn = document.createElement('button');
    btn.className = 'rnklk-btn';
    btn.textContent = '⚔️ Promote Knight';
    btn.addEventListener('click', () => this._test());
    w.appendChild(btn);

    this.statusEl = document.createElement('div');
    this.statusEl.className = 'rnklk-status';
    w.appendChild(this.statusEl);

    this.container.appendChild(w);
    this._injectStyles();
  }

  _place(slotId, badgeId) {
    // Remove badge from any other slot
    Object.keys(this.placements).forEach(s => { if (this.placements[s] === badgeId) delete this.placements[s]; });
    this.placements[slotId] = badgeId;
    this._updateUI();
  }

  _remove(slotId) {
    delete this.placements[slotId];
    this._updateUI();
  }

  _updateUI() {
    const placed = new Set(Object.values(this.placements));
    // Update slots
    this.slots.forEach(s => {
      const el = this.slotEls[s.id];
      const bId = this.placements[s.id];
      const iconEl = el.querySelector('.rnklk-slot-icon');
      if (bId) {
        const b = this.allBadges.find(x => x.id === bId);
        iconEl.textContent = b.icon || '⚙️';
        el.classList.add('rnklk-filled');
      } else {
        iconEl.textContent = '?';
        el.classList.remove('rnklk-filled');
      }
      el.classList.remove('rnklk-correct', 'rnklk-wrong');
    });
    // Update pool
    this.allBadges.forEach(b => { this.badgeEls[b.id].classList.toggle('rnklk-placed', placed.has(b.id)); });
    // Update rank based on correct count
    let correct = 0;
    this.slots.forEach(s => {
      const b = this.badges.find(x => x.slot === s.id);
      if (b && this.placements[s.id] === b.id) correct++;
    });
    const ri = Math.min(Math.floor(correct / Math.max(1, this.slots.length) * (this.ranks.length - 1)), this.ranks.length - 1);
    this.rankEl.textContent = this.ranks[ri];
    this.rankEl.dataset.level = ri;
  }

  _test() {
    let allCorrect = true;
    this.slots.forEach(s => {
      const b = this.badges.find(x => x.slot === s.id);
      const correct = b && this.placements[s.id] === b.id;
      this.slotEls[s.id].classList.toggle('rnklk-correct', !!correct);
      if (!correct) {
        allCorrect = false;
        this.slotEls[s.id].classList.add('rnklk-wrong');
        setTimeout(() => this.slotEls[s.id].classList.remove('rnklk-wrong'), 600);
      }
    });
    if (allCorrect) {
      this.rankEl.textContent = this.ranks[this.ranks.length - 1];
      this.rankEl.dataset.level = this.ranks.length - 1;
      this.statusEl.textContent = '✅ Knight promoted to ' + this.ranks[this.ranks.length - 1] + '!';
      setTimeout(() => this.onSubmit(true), 400);
    } else {
      const msg = this.falseOutputs.length ? this.falseOutputs[Math.floor(Math.random() * this.falseOutputs.length)] : '❌ Some badges are in the wrong slots';
      this.statusEl.textContent = msg;
      this.onWrong(msg);
    }
  }

  reset() { this.placements = {}; this._updateUI(); this.statusEl.textContent = ''; }

  _injectStyles() {
    if (document.getElementById('rnklk-css')) return;
    const s = document.createElement('style'); s.id = 'rnklk-css';
    s.textContent = `
.rnklk{display:flex;flex-direction:column;align-items:center;gap:14px;padding:16px 0;max-width:360px;margin:0 auto}
.rnklk-rank{font-size:18px;font-weight:700;color:var(--accent,#3b82f6);text-transform:uppercase;letter-spacing:2px;transition:all .3s}
.rnklk-rank[data-level="0"]{color:var(--muted,#7a8ba8)}
.rnklk-rank[data-level="1"]{color:#22c55e}
.rnklk-rank[data-level="2"]{color:#eab308}
.rnklk-rank[data-level="3"]{color:#f97316}
.rnklk-rank[data-level="4"]{color:#ef4444}
.rnklk-figure{position:relative;width:100%;max-width:360px;height:280px;display:flex;align-items:center;justify-content:center;overflow:visible}
.rnklk-svg{width:120px;height:200px}
.rnklk-body{fill:var(--surface,#141b2d);stroke:var(--border,#1e2a45);stroke-width:2;transition:fill .3s}
.rnklk-slot{position:absolute;left:50%;transform:translateX(-50%);min-width:90px;max-width:130px;padding:6px 8px;background:rgba(10,14,23,.85);border:2px dashed var(--border,#1e2a45);border-radius:8px;text-align:center;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:6px;white-space:nowrap}
.rnklk-slot.rnklk-over{border-color:var(--accent,#3b82f6);box-shadow:0 0 12px rgba(59,130,246,.25)}
.rnklk-slot.rnklk-filled{border-style:solid;border-color:var(--accent,#3b82f6);background:rgba(59,130,246,.1)}
.rnklk-slot.rnklk-correct{border-color:#22c55e;background:rgba(34,197,94,.1)}
.rnklk-slot.rnklk-wrong{animation:rnklk-sh .4s}
@keyframes rnklk-sh{25%{margin-left:-5px}75%{margin-left:5px}100%{margin-left:0}}
.rnklk-slot-label{font-size:10px;color:var(--muted,#7a8ba8);text-transform:uppercase;letter-spacing:.5px}
.rnklk-slot-icon{font-size:18px}
.rnklk-pool{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;max-width:340px}
.rnklk-badge{display:flex;align-items:center;gap:5px;padding:7px 11px;background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);border-radius:8px;font-size:12px;font-weight:600;color:var(--text,#e0e6f0);cursor:grab;user-select:none;-webkit-user-select:none;transition:opacity .2s}
.rnklk-badge.rnklk-dragging{opacity:.4}
.rnklk-badge.rnklk-placed{opacity:.25;pointer-events:none}
.rnklk-badge-icon{font-size:16px}
.rnklk-btn{padding:12px 28px;border:none;border-radius:8px;background:var(--accent,#3b82f6);color:#fff;font-size:14px;font-weight:600;cursor:pointer}
.rnklk-btn:active{opacity:.7}
.rnklk-status{font-size:13px;color:var(--muted,#7a8ba8);text-align:center;min-height:18px}
`;
    document.head.appendChild(s);
  }
}
