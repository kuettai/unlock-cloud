/**
 * Jar Fill Lock Puzzle
 *
 * Two modes:
 *   "logic"  — Pour water between jars to reach target levels. Tap well to fill
 *              smallest jar, tap jar→jar to pour, tap ground to empty.
 *   "timing" — Hold down on each jar to fill from well. Release at the brim line.
 *              Overshoot = spill. Undershoot = try again.
 *
 * Usage:
 *   new JarFillLock(containerEl, {
 *     mode: 'logic' | 'timing',
 *     jars: [{ id, capacity, label, target? }],  // target defaults to capacity
 *     pourSpeed: 2,          // timing mode: units per second
 *     tolerance: 0.15,       // timing mode: how close to brim counts (fraction)
 *     onSubmit({ pours }) {},
 *     onSpill() {},
 *   });
 */

class JarFillLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.mode = opts.mode || 'timing';
    this.jars = (opts.jars || [
      { id: 'j1', capacity: 3, label: 'I' },
      { id: 'j2', capacity: 2, label: 'II' },
      { id: 'j3', capacity: 3, label: 'III' },
      { id: 'j4', capacity: 2, label: 'IV' },
      { id: 'j5', capacity: 2, label: 'V' },
      { id: 'j6', capacity: 3, label: 'VI' },
    ]).map(j => ({ ...j, level: 0, target: j.target ?? j.capacity, done: false }));
    this.pourSpeed = opts.pourSpeed || 2;
    this.tolerance = opts.tolerance ?? 0.15;
    this.onSubmit = opts.onSubmit || (() => {});
    this.onSpill = opts.onSpill || null;
    this.pours = 0;
    this.solved = false;
    // logic mode state
    this.selected = null;
    // timing mode state
    this._holdTimer = null;
    this._holdIdx = -1;
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'jflk';

    this.statusEl = document.createElement('div');
    this.statusEl.className = 'jflk-status';
    wrap.appendChild(this.statusEl);

    const row = document.createElement('div');
    row.className = 'jflk-row';

    const maxCap = Math.max(...this.jars.map(j => j.capacity));
    this.jarEls = [];
    this.jars.forEach((jar, i) => {
      const col = document.createElement('div');
      col.className = 'jflk-jar-wrap';

      const jarEl = document.createElement('div');
      jarEl.className = 'jflk-jar';
      jarEl.style.height = (50 + (jar.capacity / maxCap) * 70) + 'px';

      const fill = document.createElement('div');
      fill.className = 'jflk-fill';
      jarEl.appendChild(fill);

      // brim target line
      const brimPct = (jar.target / jar.capacity) * 100;
      const brimLine = document.createElement('div');
      brimLine.className = 'jflk-brimline';
      brimLine.style.bottom = brimPct + '%';
      jarEl.appendChild(brimLine);

      if (this.mode === 'timing') {
        const start = (e) => { e.preventDefault(); this._holdStart(i); };
        const end = (e) => { e.preventDefault(); this._holdEnd(i); };
        jarEl.addEventListener('mousedown', start);
        jarEl.addEventListener('touchstart', start, { passive: false });
        jarEl.addEventListener('mouseup', end);
        jarEl.addEventListener('mouseleave', end);
        jarEl.addEventListener('touchend', end);
      } else {
        jarEl.addEventListener('click', () => this._logicTap(i));
      }

      col.appendChild(jarEl);

      const label = document.createElement('div');
      label.className = 'jflk-label';
      label.textContent = jar.label;
      col.appendChild(label);

      const info = document.createElement('div');
      info.className = 'jflk-info';
      col.appendChild(info);

      row.appendChild(col);
      this.jarEls.push({ col, jarEl, fill, info, brimLine });
    });

    wrap.appendChild(row);

    if (this.mode === 'logic') {
      const actBar = document.createElement('div');
      actBar.className = 'jflk-bar';
      const wellBtn = document.createElement('button');
      wellBtn.className = 'jflk-btn';
      wellBtn.textContent = '🪣 Fill from well';
      wellBtn.addEventListener('click', () => this._logicFillFromWell());
      actBar.appendChild(wellBtn);
      const emptyBtn = document.createElement('button');
      emptyBtn.className = 'jflk-btn-sec';
      emptyBtn.textContent = '🚿 Empty selected';
      emptyBtn.addEventListener('click', () => this._logicEmpty());
      actBar.appendChild(emptyBtn);
      wrap.appendChild(actBar);
    }

    const resetBar = document.createElement('div');
    resetBar.className = 'jflk-bar';
    const resetBtn = document.createElement('button');
    resetBtn.className = 'jflk-btn-sec';
    resetBtn.textContent = '↻ Reset all';
    resetBtn.addEventListener('click', () => this._reset());
    resetBar.appendChild(resetBtn);
    wrap.appendChild(resetBar);

    this.container.appendChild(wrap);
    this._injectStyles();
    this._updateAll();
  }

  // ── TIMING MODE ──

  _holdStart(i) {
    if (this.solved || this.jars[i].done) return;
    this._holdIdx = i;
    const jar = this.jars[i];
    jar.level = 0; // reset on new hold
    this._updateJar(i);
    const interval = 30; // ms
    const increment = this.pourSpeed * (interval / 1000);
    this._holdTimer = setInterval(() => {
      jar.level = Math.min(jar.level + increment, jar.capacity + 0.01);
      if (jar.level > jar.capacity) {
        // overflow
        this._holdStop();
        jar.level = 0;
        this.jarEls[i].jarEl.classList.add('jflk-spill');
        this.statusEl.textContent = `💧 ${jar.label} overflowed!`;
        if (this.onSpill) this.onSpill();
        setTimeout(() => {
          this.jarEls[i].jarEl.classList.remove('jflk-spill');
          this._updateJar(i);
          this._updateStatus();
        }, 800);
        return;
      }
      this._updateJar(i);
    }, interval);
  }

  _holdEnd() {
    if (this._holdIdx < 0) return;
    const i = this._holdIdx;
    this._holdStop();
    const jar = this.jars[i];
    if (jar.done || jar.level === 0) return;
    // check if close enough to target
    const diff = Math.abs(jar.level - jar.target);
    if (diff <= this.tolerance) {
      jar.level = jar.target;
      jar.done = true;
      this.pours++;
      this.jarEls[i].jarEl.classList.add('jflk-full');
      this._updateJar(i);
      this._checkWin();
    } else if (jar.level < jar.target) {
      // underfill — keep it, they can try again
      this.statusEl.textContent = `Not quite — ${jar.label} needs more`;
    }
    this._updateStatus();
  }

  _holdStop() {
    clearInterval(this._holdTimer);
    this._holdTimer = null;
    this._holdIdx = -1;
  }

  // ── LOGIC MODE ──

  _logicTap(i) {
    if (this.solved) return;
    if (this.selected === null) {
      this.selected = i;
      this.jarEls[i].jarEl.classList.add('jflk-selected');
      this.statusEl.textContent = `${this.jars[i].label} selected — tap another jar to pour into, or use buttons`;
    } else if (this.selected === i) {
      // deselect
      this.jarEls[i].jarEl.classList.remove('jflk-selected');
      this.selected = null;
      this._updateStatus();
    } else {
      // pour from selected into i
      this._logicPour(this.selected, i);
      this.jarEls[this.selected].jarEl.classList.remove('jflk-selected');
      this.selected = null;
    }
  }

  _logicPour(from, to) {
    const src = this.jars[from], dst = this.jars[to];
    const space = dst.capacity - dst.level;
    const amount = Math.min(src.level, space);
    if (amount <= 0) {
      this.statusEl.textContent = 'Nothing to pour';
      return;
    }
    src.level -= amount;
    dst.level += amount;
    this.pours++;
    this._updateJar(from);
    this._updateJar(to);
    this._checkDone(from);
    this._checkDone(to);
    this._checkWin();
    this._updateStatus();
  }

  _logicFillFromWell() {
    if (this.solved) return;
    if (this.selected === null) {
      this.statusEl.textContent = 'Select a jar first, then fill from well';
      return;
    }
    const jar = this.jars[this.selected];
    jar.level = jar.capacity;
    this.pours++;
    this.jarEls[this.selected].jarEl.classList.remove('jflk-selected');
    this._updateJar(this.selected);
    this._checkDone(this.selected);
    this.selected = null;
    this._checkWin();
    this._updateStatus();
  }

  _logicEmpty() {
    if (this.solved || this.selected === null) return;
    const jar = this.jars[this.selected];
    jar.level = 0;
    jar.done = false;
    this.jarEls[this.selected].jarEl.classList.remove('jflk-selected', 'jflk-full');
    this._updateJar(this.selected);
    this.selected = null;
    this._updateStatus();
  }

  _checkDone(i) {
    const jar = this.jars[i];
    const diff = Math.abs(jar.level - jar.target);
    if (diff < 0.01) {
      jar.done = true;
      this.jarEls[i].jarEl.classList.add('jflk-full');
    } else {
      jar.done = false;
      this.jarEls[i].jarEl.classList.remove('jflk-full');
    }
  }

  // ── SHARED ──

  _updateJar(i) {
    const jar = this.jars[i];
    const el = this.jarEls[i];
    const pct = Math.max(0, Math.min(100, (jar.level / jar.capacity) * 100));
    el.fill.style.height = pct + '%';
    if (this.mode === 'logic') {
      el.info.textContent = jar.done ? '✓ target' : `${Math.round(jar.level * 10) / 10} → ${jar.target}`;
    } else {
      el.info.textContent = jar.done ? '✓ brim' : (jar.level > 0 ? '...' : `cap: ${jar.capacity}`);
    }
  }

  _updateAll() {
    this.jars.forEach((_, i) => this._updateJar(i));
    this._updateStatus();
  }

  _updateStatus() {
    if (this.solved) return;
    const filled = this.jars.filter(j => j.done).length;
    if (this.mode === 'timing') {
      this.statusEl.textContent = `Hold to pour, release at the brim — ${filled}/${this.jars.length} filled`;
    } else {
      this.statusEl.textContent = `Tap a jar to select, then pour or fill — ${filled}/${this.jars.length} at target`;
    }
  }

  _checkWin() {
    if (!this.jars.every(j => j.done)) return;
    this.solved = true;
    this.statusEl.textContent = '✅ All jars filled to the brim!';
    setTimeout(() => {
      this.jarEls.forEach(e => e.fill.classList.add('jflk-wine'));
      this.statusEl.textContent = '🍷 The water has become wine!';
    }, 600);
    setTimeout(() => this.onSubmit({ pours: this.pours }), 1800);
  }

  _reset() {
    this._holdStop();
    this.jars.forEach(j => { j.level = 0; j.done = false; });
    this.pours = 0;
    this.solved = false;
    this.selected = null;
    this.jarEls.forEach((el, i) => {
      el.fill.style.height = '0%';
      el.fill.classList.remove('jflk-wine');
      el.jarEl.classList.remove('jflk-full', 'jflk-spill', 'jflk-selected');
    });
    this._updateAll();
  }

  _injectStyles() {
    if (document.getElementById('jflk-css')) return;
    const s = document.createElement('style');
    s.id = 'jflk-css';
    s.textContent = `
.jflk{display:flex;flex-direction:column;align-items:center;gap:14px;padding:16px 0}
.jflk-status{font-size:14px;color:var(--muted,#7a8ba8);min-height:20px;text-align:center}
.jflk-row{display:flex;gap:10px;justify-content:center;align-items:flex-end;flex-wrap:wrap}
.jflk-jar-wrap{display:flex;flex-direction:column;align-items:center;gap:4px}
.jflk-jar{position:relative;width:42px;border:2px solid var(--border,#3b4a6b);border-top:2px dashed var(--border,#3b4a6b);border-radius:0 0 8px 8px;cursor:pointer;overflow:hidden;transition:border-color .2s;background:var(--surface,#141b2d);user-select:none;-webkit-user-select:none;touch-action:none}
.jflk-jar:active{opacity:.85}
.jflk-fill{position:absolute;bottom:0;left:0;right:0;height:0%;background:rgba(59,130,246,.45);transition:height .08s linear}
.jflk-brimline{position:absolute;left:2px;right:2px;height:0;border-top:1.5px dashed rgba(255,255,255,.2);pointer-events:none;z-index:1}
.jflk-full{border-color:var(--accent,#3b82f6)!important;border-top-color:var(--accent,#3b82f6)!important}
.jflk-full .jflk-fill{background:rgba(59,130,246,.65)}
.jflk-selected{border-color:var(--yellow,#eab308)!important;border-top-color:var(--yellow,#eab308)!important;box-shadow:0 0 8px rgba(234,179,8,.3)}
.jflk-spill{border-color:var(--red,#ef4444)!important;border-top-color:var(--red,#ef4444)!important}
.jflk-wine{background:rgba(139,0,0,.75)!important;transition:background 1s ease}
.jflk-label{font-size:12px;color:var(--muted,#7a8ba8);font-weight:700}
.jflk-info{font-size:11px;color:var(--muted,#7a8ba8);min-height:16px}
.jflk-bar{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.jflk-btn{padding:8px 14px;border:none;border-radius:8px;background:var(--accent,#3b82f6);color:#fff;font-size:13px;font-weight:600;cursor:pointer;touch-action:manipulation}
.jflk-btn:active{opacity:.7}
.jflk-btn-sec{padding:8px 14px;border:none;border-radius:8px;background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);color:var(--muted,#7a8ba8);font-size:13px;font-weight:600;cursor:pointer}
.jflk-btn-sec:active{opacity:.7}
`;
    document.head.appendChild(s);
  }
}
