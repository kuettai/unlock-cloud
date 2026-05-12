/**
 * Bread Break Lock Puzzle
 *
 * Tap-and-hold to break loaves/fish. Hold in the sweet spot to break cleanly.
 * Too short = not broken. Too long = crumbles. Each successful break shows
 * a multiplying counter. Visual miracle moment.
 *
 * Usage:
 *   new BreadBreakLock(containerEl, {
 *     items: [
 *       { id: 'loaf1', icon: '🍞', label: 'Loaf 1' },
 *       { id: 'fish1', icon: '🐟', label: 'Fish 1' },
 *     ],
 *     holdMin: 0.4,          // minimum hold seconds for clean break
 *     holdMax: 1.2,          // maximum before crumble
 *     multiplier: [2, 10, 100, 1000, 5000],  // count after each break
 *     onSubmit({ breaks }) {},
 *     onCrumble() {},
 *   });
 */

class BreadBreakLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.items = (opts.items || [
      { id: 'l1', icon: '🍞', label: 'Loaf 1' },
      { id: 'l2', icon: '🍞', label: 'Loaf 2' },
      { id: 'l3', icon: '🍞', label: 'Loaf 3' },
      { id: 'l4', icon: '🍞', label: 'Loaf 4' },
      { id: 'l5', icon: '🍞', label: 'Loaf 5' },
      { id: 'f1', icon: '🐟', label: 'Fish 1' },
      { id: 'f2', icon: '🐟', label: 'Fish 2' },
    ]).map((item, i) => ({ ...item, broken: false, idx: i }));
    this.holdMin = opts.holdMin || 0.4;
    this.holdMax = opts.holdMax || 1.2;
    this.multiplier = opts.multiplier || [2, 10, 100, 1000, 5000];
    this.randomizeHold = opts.randomizeHold || false;
    this._holdRange = this.holdMax - this.holdMin;
    this.onSubmit = opts.onSubmit || (() => {});
    this.onCrumble = opts.onCrumble || null;
    this.breaks = 0;
    this.solved = false;
    this._holdStart = 0;
    this._holdTimer = null;
    this._activeIdx = -1;
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'bblk';

    this.statusEl = document.createElement('div');
    this.statusEl.className = 'bblk-status';
    this.statusEl.textContent = 'Hold each item to break it — not too short, not too long';
    wrap.appendChild(this.statusEl);

    // Counter
    this.counterEl = document.createElement('div');
    this.counterEl.className = 'bblk-counter';
    this.counterEl.textContent = 'Pieces: 0';
    wrap.appendChild(this.counterEl);

    // Progress bar (shows hold timing)
    const barWrap = document.createElement('div');
    barWrap.className = 'bblk-bar-wrap';
    this.barFill = document.createElement('div');
    this.barFill.className = 'bblk-bar-fill';
    barWrap.appendChild(this.barFill);
    // Sweet spot markers
    const minMark = document.createElement('div');
    minMark.className = 'bblk-mark bblk-mark-min';
    minMark.style.left = `${(this.holdMin / (this.holdMax * 1.3)) * 100}%`;
    barWrap.appendChild(minMark);
    const maxMark = document.createElement('div');
    maxMark.className = 'bblk-mark bblk-mark-max';
    maxMark.style.left = `${(this.holdMax / (this.holdMax * 1.3)) * 100}%`;
    barWrap.appendChild(maxMark);
    this._minMark = minMark;
    this._maxMark = maxMark;
    wrap.appendChild(barWrap);

    // Items row
    const row = document.createElement('div');
    row.className = 'bblk-row';
    this.itemEls = [];
    this.items.forEach((item, i) => {
      const el = document.createElement('div');
      el.className = 'bblk-item';
      el.innerHTML = `<span class="bblk-icon">${item.icon}</span><span class="bblk-label">${item.label}</span>`;
      const start = (e) => { e.preventDefault(); this._startHold(i); };
      const end = (e) => { e.preventDefault(); this._endHold(i); };
      el.addEventListener('mousedown', start);
      el.addEventListener('touchstart', start, { passive: false });
      el.addEventListener('mouseup', end);
      el.addEventListener('mouseleave', end);
      el.addEventListener('touchend', end);
      row.appendChild(el);
      this.itemEls.push(el);
    });
    wrap.appendChild(row);

    // Reset
    const resetBar = document.createElement('div');
    resetBar.className = 'bblk-rbar';
    const resetBtn = document.createElement('button');
    resetBtn.className = 'bblk-btn-sec';
    resetBtn.textContent = '↻ Reset';
    resetBtn.addEventListener('click', () => this._reset());
    resetBar.appendChild(resetBtn);
    wrap.appendChild(resetBar);

    this.container.appendChild(wrap);
    this._injectStyles();
  }

  _startHold(idx) {
    if (this.solved || this.items[idx].broken) return;
    this._activeIdx = idx;
    this._holdStart = Date.now();
    this.barFill.style.transition = 'none';
    this.barFill.style.width = '0%';
    this.itemEls[idx].classList.add('bblk-holding');

    // Animate bar
    const maxTime = this.holdMax * 1.3 * 1000;
    const tick = () => {
      if (this._activeIdx !== idx) return;
      const elapsed = Date.now() - this._holdStart;
      const pct = Math.min(100, (elapsed / maxTime) * 100);
      this.barFill.style.width = pct + '%';
      const secs = elapsed / 1000;
      if (secs > this.holdMax * 1.3) {
        // Auto-crumble
        this._endHold(idx);
        return;
      }
      // Color zones
      if (secs < this.holdMin) this.barFill.style.background = 'var(--muted,#7a8ba8)';
      else if (secs <= this.holdMax) this.barFill.style.background = 'var(--green,#22c55e)';
      else this.barFill.style.background = 'var(--red,#ef4444)';
      this._holdTimer = requestAnimationFrame(tick);
    };
    this._holdTimer = requestAnimationFrame(tick);
  }

  _endHold(idx) {
    if (this._activeIdx !== idx) return;
    cancelAnimationFrame(this._holdTimer);
    this._activeIdx = -1;
    this.itemEls[idx].classList.remove('bblk-holding');

    const elapsed = (Date.now() - this._holdStart) / 1000;

    if (elapsed < this.holdMin) {
      this.statusEl.textContent = '⚡ Too quick — hold longer!';
      this.barFill.style.width = '0%';
      return;
    }

    if (elapsed > this.holdMax) {
      this.statusEl.textContent = '💨 Crumbled! Hold more gently.';
      this.itemEls[idx].classList.add('bblk-crumble');
      setTimeout(() => this.itemEls[idx].classList.remove('bblk-crumble'), 600);
      this.barFill.style.width = '0%';
      if (this.onCrumble) this.onCrumble();
      return;
    }

    // Clean break!
    this.items[idx].broken = true;
    this.breaks++;
    this.itemEls[idx].classList.add('bblk-broken');
    this.itemEls[idx].querySelector('.bblk-icon').textContent = '✓';

    // Update counter with multiplier
    const countIdx = Math.min(this.breaks - 1, this.multiplier.length - 1);
    const pieces = this.multiplier[countIdx];
    this.counterEl.textContent = `Pieces: ${pieces.toLocaleString()}`;
    this.counterEl.classList.add('bblk-pop');
    setTimeout(() => this.counterEl.classList.remove('bblk-pop'), 300);

    this.barFill.style.width = '0%';
    this.statusEl.textContent = `✅ ${this.items[idx].label} broken! (${this.breaks}/${this.items.length})`;

    // Randomize timing for next item
    if (this.randomizeHold) {
      this.holdMin = 0.3 + Math.random() * 0.7;
      this.holdMax = this.holdMin + this._holdRange;
      this._minMark.style.left = `${(this.holdMin / (this.holdMax * 1.3)) * 100}%`;
      this._maxMark.style.left = `${(this.holdMax / (this.holdMax * 1.3)) * 100}%`;
    }

    // Check win
    if (this.items.every(i => i.broken)) {
      this.solved = true;
      this.statusEl.textContent = '🍞🐟 All broken and multiplied — enough for everyone!';
      this.counterEl.textContent = `Fed: 5,000+ people`;
      this.counterEl.classList.add('bblk-pop');
      setTimeout(() => this.onSubmit({ breaks: this.breaks }), 1000);
    }
  }

  _reset() {
    this.items.forEach(i => i.broken = false);
    this.breaks = 0;
    this.solved = false;
    this._activeIdx = -1;
    this.barFill.style.width = '0%';
    this.counterEl.textContent = 'Pieces: 0';
    this.statusEl.textContent = 'Hold each item to break it — not too short, not too long';
    this.itemEls.forEach((el, i) => {
      el.classList.remove('bblk-broken', 'bblk-crumble', 'bblk-holding');
      el.querySelector('.bblk-icon').textContent = this.items[i].icon;
    });
  }

  _injectStyles() {
    if (document.getElementById('bblk-css')) return;
    const s = document.createElement('style');
    s.id = 'bblk-css';
    s.textContent = `
.bblk{display:flex;flex-direction:column;align-items:center;gap:12px;padding:16px 0}
.bblk-status{font-size:14px;color:var(--muted,#7a8ba8);min-height:20px;text-align:center}
.bblk-counter{font-size:22px;font-weight:700;color:var(--text,#e0e6f0);transition:transform .2s}
.bblk-pop{transform:scale(1.3)}
.bblk-bar-wrap{width:min(280px,85vw);height:12px;background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);border-radius:6px;overflow:visible;position:relative}
.bblk-bar-fill{height:100%;width:0%;border-radius:6px;transition:background .1s}
.bblk-mark{position:absolute;top:-4px;bottom:-4px;width:2px;border-radius:1px}
.bblk-mark-min{background:var(--green,#22c55e)}
.bblk-mark-max{background:var(--red,#ef4444)}
.bblk-row{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.bblk-item{display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px;background:var(--surface,#141b2d);border:1.5px solid var(--border,#1e2a45);border-radius:10px;cursor:pointer;user-select:none;-webkit-user-select:none;touch-action:none;transition:all .15s;min-width:56px}
.bblk-item:active,.bblk-holding{transform:scale(.95);border-color:var(--accent,#3b82f6)}
.bblk-holding{background:rgba(59,130,246,.15)}
.bblk-broken{border-color:var(--green,#22c55e);opacity:.5;pointer-events:none}
.bblk-broken .bblk-icon{color:var(--green,#22c55e)}
.bblk-crumble{border-color:var(--red,#ef4444);animation:bblk-shake .3s}
.bblk-icon{font-size:24px}
.bblk-label{font-size:10px;color:var(--muted,#7a8ba8);font-weight:600}
.bblk-rbar{display:flex;gap:8px}
.bblk-btn-sec{padding:8px 14px;border:none;border-radius:8px;background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);color:var(--muted,#7a8ba8);font-size:13px;font-weight:600;cursor:pointer}
.bblk-btn-sec:active{opacity:.7}
@keyframes bblk-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}
`;
    document.head.appendChild(s);
  }
}
