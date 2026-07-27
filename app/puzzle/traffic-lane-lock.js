/**
 * Traffic Lane Lock Puzzle — "Route the Work"
 *
 * Top-down 3-lane highway. Player drags each task card into the correct lane:
 *   🟢 AI Lane    — AI can handle autonomously (inner loop)
 *   🔵 Human Lane — needs human judgment (outer loop)
 *   🚫 Skip Lane  — unnecessary for this fix (adaptive composition)
 *
 * Teaches AIDLC: know what AI handles vs what humans decide vs what to skip.
 *
 * Usage:
 *   new TrafficLaneLock(container, {
 *     tasks: [ { id, label, lane: 'ai'|'human'|'skip' }, ... ],
 *     lanes: [ { id, label, sub, icon, color }, ... ],   // optional
 *     onSubmit() { ... },
 *     onWrong(msg) { ... }
 *   });
 */

class TrafficLaneLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.tasks = (opts.tasks || []).map(t => ({ ...t }));
    this.lanes = (opts.lanes && opts.lanes.length) ? opts.lanes : [
      { id: 'ai', label: 'AI Lane', sub: 'AI handles it', icon: '🟢', color: '#22c55e' },
      { id: 'human', label: 'Human Lane', sub: 'You decide', icon: '🔵', color: '#3b82f6' },
      { id: 'skip', label: 'Skip Lane', sub: 'Not needed', icon: '🚫', color: '#ef4444' }
    ];
    this.onSubmit = opts.onSubmit || (() => {});
    this.onWrong = opts.onWrong || (() => {});
    this.placed = {};      // taskId -> laneId
    this._drag = null;
    this._laneEls = {};
    this._render();
  }

  _unplaced() { return this.tasks.filter(t => !this.placed[t.id]); }
  _allPlaced() { return this.tasks.every(t => this.placed[t.id]); }

  _render() {
    this.container.innerHTML = '';
    this._injectStyles();

    const wrap = document.createElement('div');
    wrap.className = 'tll';

    const instr = document.createElement('div');
    instr.className = 'tll-instr';
    instr.textContent = 'Drag each task into the right lane — AI handles it, you decide, or skip it.';
    wrap.appendChild(instr);

    // Lanes (drop zones)
    const lanesEl = document.createElement('div');
    lanesEl.className = 'tll-lanes';
    this._laneEls = {};
    this.lanes.forEach(lane => {
      const l = document.createElement('div');
      l.className = 'tll-lane';
      l.dataset.lane = lane.id;
      l.style.setProperty('--lane', lane.color);
      const drop = document.createElement('div');
      drop.className = 'tll-lane-drop';
      this.tasks.filter(t => this.placed[t.id] === lane.id).forEach(t => {
        const chip = document.createElement('div');
        chip.className = 'tll-chip';
        chip.textContent = t.label;
        chip.title = 'Tap to remove';
        chip.addEventListener('click', () => { delete this.placed[t.id]; this._render(); });
        drop.appendChild(chip);
      });
      l.innerHTML = `<div class="tll-lane-head"><span class="tll-lane-icon">${lane.icon}</span><span class="tll-lane-label">${lane.label}</span></div><div class="tll-lane-sub">${lane.sub || ''}</div>`;
      l.appendChild(drop);
      lanesEl.appendChild(l);
      this._laneEls[lane.id] = l;
    });
    wrap.appendChild(lanesEl);

    // Tray of draggable task cards
    const tray = document.createElement('div');
    tray.className = 'tll-tray';
    const left = this._unplaced().length;
    const trayLabel = document.createElement('div');
    trayLabel.className = 'tll-tray-label';
    trayLabel.textContent = left ? `📦 Tasks to route (${left} left)` : '✅ All tasks placed — review and submit';
    tray.appendChild(trayLabel);
    const trayCards = document.createElement('div');
    trayCards.className = 'tll-tray-cards';
    this._unplaced().forEach(t => {
      const c = document.createElement('div');
      c.className = 'tll-card';
      c.textContent = t.label;
      c.dataset.task = t.id;
      this._attachDrag(c, t);
      trayCards.appendChild(c);
    });
    tray.appendChild(trayCards);
    wrap.appendChild(tray);

    this.statusEl = document.createElement('div');
    this.statusEl.className = 'tll-status';
    wrap.appendChild(this.statusEl);

    if (this._allPlaced()) {
      const btn = document.createElement('button');
      btn.className = 'tll-submit';
      btn.textContent = '🚦 Submit lanes';
      btn.addEventListener('click', () => this._check());
      wrap.appendChild(btn);
    }

    this.container.appendChild(wrap);
  }

  _pointFrom(e) {
    if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    if (e.changedTouches && e.changedTouches[0]) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  }

  _laneAtPoint(x, y) {
    for (const lane of this.lanes) {
      const r = this._laneEls[lane.id].getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return lane.id;
    }
    return null;
  }

  _attachDrag(card, task) {
    const onMove = (e) => {
      if (!this._drag) return;
      e.preventDefault();
      const p = this._pointFrom(e);
      this._drag.ghost.style.left = (p.x - this._drag.offX) + 'px';
      this._drag.ghost.style.top = (p.y - this._drag.offY) + 'px';
      const laneId = this._laneAtPoint(p.x, p.y);
      this.lanes.forEach(l => this._laneEls[l.id].classList.toggle('tll-lane-hover', l.id === laneId));
    };
    const onEnd = (e) => {
      if (!this._drag) return;
      const p = this._pointFrom(e);
      const laneId = this._laneAtPoint(p.x, p.y);
      this._drag.ghost.remove();
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchend', onEnd);
      const t = this._drag.task;
      this._drag = null;
      if (laneId) this.placed[t.id] = laneId;
      this._render();
    };
    const onStart = (e) => {
      e.preventDefault();
      const p = this._pointFrom(e);
      const rect = card.getBoundingClientRect();
      const ghost = card.cloneNode(true);
      ghost.classList.add('tll-ghost');
      ghost.style.width = rect.width + 'px';
      ghost.style.left = rect.left + 'px';
      ghost.style.top = rect.top + 'px';
      document.body.appendChild(ghost);
      this._drag = { task, ghost, offX: p.x - rect.left, offY: p.y - rect.top };
      document.addEventListener('mousemove', onMove, { passive: false });
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('mouseup', onEnd);
      document.addEventListener('touchend', onEnd);
    };
    card.addEventListener('mousedown', onStart);
    card.addEventListener('touchstart', onStart, { passive: false });
  }

  _check() {
    const wrong = this.tasks.filter(t => this.placed[t.id] !== t.lane);
    if (wrong.length === 0) {
      this.statusEl.textContent = '✅ Perfect triage!';
      this.container.querySelectorAll('.tll-chip').forEach(c => c.classList.add('tll-chip-ok'));
      setTimeout(() => this.onSubmit(), 500);
    } else {
      this.statusEl.textContent = `❌ ${wrong.length} in the wrong lane — try again.`;
      wrong.forEach(t => { delete this.placed[t.id]; }); // return only the wrong ones
      const lanesEl = this.container.querySelector('.tll-lanes');
      if (lanesEl) { lanesEl.classList.add('tll-shake'); setTimeout(() => lanesEl.classList.remove('tll-shake'), 500); }
      this.onWrong(`${wrong.length} task${wrong.length > 1 ? 's' : ''} in the wrong lane.`);
      setTimeout(() => this._render(), 560);
    }
  }

  reset() { this.placed = {}; this._render(); }

  _injectStyles() {
    if (document.getElementById('tll-css')) return;
    const s = document.createElement('style');
    s.id = 'tll-css';
    s.textContent = `
.tll{display:flex;flex-direction:column;gap:12px;padding:8px 0}
.tll-instr{font-size:13px;color:var(--muted,#7a8ba8);text-align:center;line-height:1.4}
.tll-lanes{display:flex;gap:6px}
.tll-lane{flex:1;min-width:0;background:#0d1117;border:2px solid var(--border,#1e2a45);border-top:4px solid var(--lane,#3b82f6);border-radius:10px;padding:8px 6px;min-height:130px;display:flex;flex-direction:column;transition:background .15s,box-shadow .15s}
.tll-lane-hover{background:rgba(255,255,255,.05);box-shadow:0 0 0 2px var(--lane,#3b82f6) inset}
.tll-lane-head{display:flex;align-items:center;gap:4px;justify-content:center;flex-wrap:wrap}
.tll-lane-icon{font-size:15px}
.tll-lane-label{font-size:11px;font-weight:700;color:var(--text,#e0e6f0)}
.tll-lane-sub{font-size:9px;color:var(--muted,#7a8ba8);text-align:center;margin:2px 0 6px;text-transform:uppercase;letter-spacing:.5px}
.tll-lane-drop{flex:1;display:flex;flex-direction:column;gap:4px;min-height:40px}
.tll-chip{background:var(--surface,#141b2d);border:1px solid var(--lane,#3b82f6);border-radius:6px;padding:6px 6px;font-size:10px;line-height:1.25;color:var(--text,#e0e6f0);cursor:pointer;text-align:center;word-break:break-word}
.tll-chip-ok{border-color:var(--green,#22c55e);animation:tll-pop .35s}
.tll-tray{background:var(--surface,#141b2d);border:1px dashed var(--border,#1e2a45);border-radius:10px;padding:10px}
.tll-tray-label{font-size:11px;color:var(--muted,#7a8ba8);margin-bottom:8px;text-align:center}
.tll-tray-cards{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.tll-card{background:var(--bg,#0a0e17);border:1px solid var(--accent,#3b82f6);border-radius:8px;padding:10px 12px;font-size:12px;font-weight:600;color:var(--text,#e0e6f0);cursor:grab;max-width:150px;text-align:center;line-height:1.3;touch-action:none;user-select:none;-webkit-user-select:none}
.tll-card:active{cursor:grabbing;transform:scale(.97)}
.tll-ghost{position:fixed;z-index:10000;pointer-events:none;background:var(--bg,#0a0e17);border:1px solid var(--accent,#3b82f6);border-radius:8px;padding:10px 12px;font-size:12px;font-weight:600;color:var(--text,#e0e6f0);max-width:150px;text-align:center;line-height:1.3;box-shadow:0 8px 24px rgba(0,0,0,.5);opacity:.95}
.tll-status{font-size:13px;text-align:center;min-height:18px;color:var(--muted,#7a8ba8)}
.tll-submit{align-self:center;padding:12px 28px;border:none;border-radius:8px;background:var(--accent,#3b82f6);color:#fff;font-size:14px;font-weight:600;cursor:pointer}
.tll-submit:active{opacity:.7}
.tll-shake{animation:tll-sh .5s}
@keyframes tll-sh{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}
@keyframes tll-pop{from{transform:scale(.8)}to{transform:scale(1)}}
`;
    document.head.appendChild(s);
  }
}
