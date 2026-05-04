/**
 * Sequence Tap Lock Puzzle
 *
 * 3x3 grid. Two modes:
 *   "flash" (default) — pattern lights up first, player repeats from memory.
 *   "blind" — no flash, player must know the sequence from story clues.
 *
 * Usage:
 *   new SequenceLock(containerEl, {
 *     sequence: [0,4,8,6,2],  // cell indices 0-8 (top-left to bottom-right)
 *     mode: 'flash',          // 'flash' or 'blind'
 *     flashMs: 400,           // flash mode: how long each cell lights up
 *     gapMs: 200,             // flash mode: gap between flashes
 *     onSubmit(correct) { ... }
 *   });
 */

class SequenceLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.sequence = opts.sequence || [0, 4, 8];
    this.mode = opts.mode || 'flash';
    this.flashMs = opts.flashMs || 400;
    this.gapMs = opts.gapMs || 200;
    this.onSubmit = opts.onSubmit || (() => {});
    this.playerInput = [];
    this.accepting = false;
    this._render();
    if (this.mode === 'flash') this._playSequence();
    else this._startBlind();
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'seqlk';

    this.statusEl = document.createElement('div');
    this.statusEl.className = 'seqlk-status';
    this.statusEl.textContent = 'Watch the pattern...';
    wrap.appendChild(this.statusEl);

    const grid = document.createElement('div');
    grid.className = 'seqlk-grid';
    this.cells = [];
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('div');
      cell.className = 'seqlk-cell';
      cell.dataset.idx = i;
      cell.addEventListener('click', () => this._tap(i));
      grid.appendChild(cell);
      this.cells.push(cell);
    }
    wrap.appendChild(grid);

    const bar = document.createElement('div');
    bar.className = 'seqlk-bar';

    this.replayBtn = document.createElement('button');
    this.replayBtn.className = 'seqlk-btn seqlk-btn-sec';
    this.replayBtn.textContent = '↻ Replay';
    this.replayBtn.addEventListener('click', () => this._playSequence());
    if (this.mode === 'blind') this.replayBtn.style.display = 'none';
    bar.appendChild(this.replayBtn);

    this.dots = document.createElement('div');
    this.dots.className = 'seqlk-dots';
    this.sequence.forEach(() => {
      const d = document.createElement('div');
      d.className = 'seqlk-dot';
      this.dots.appendChild(d);
    });
    bar.appendChild(this.dots);

    wrap.appendChild(bar);
    this.container.appendChild(wrap);
    this._injectStyles();
  }

  _startBlind() {
    this.accepting = true;
    this.playerInput = [];
    this._resetDots();
    this.statusEl.textContent = 'Enter the sequence';
    this.cells.forEach(c => c.classList.remove('seqlk-wrong'));
  }

  _playSequence() {
    this.accepting = false;
    this.playerInput = [];
    this._resetDots();
    this.statusEl.textContent = 'Watch the pattern...';
    this.cells.forEach(c => c.classList.remove('seqlk-wrong'));

    let i = 0;
    const next = () => {
      if (i >= this.sequence.length) {
        setTimeout(() => {
          this.accepting = true;
          this.statusEl.textContent = 'Your turn — tap the sequence';
        }, this.gapMs);
        return;
      }
      const cell = this.cells[this.sequence[i]];
      cell.classList.add('seqlk-flash');
      setTimeout(() => {
        cell.classList.remove('seqlk-flash');
        i++;
        setTimeout(next, this.gapMs);
      }, this.flashMs);
    };
    setTimeout(next, 500);
  }

  _tap(idx) {
    if (!this.accepting) return;
    const step = this.playerInput.length;
    const cell = this.cells[idx];

    if (this.sequence[step] === idx) {
      // Correct
      cell.classList.add('seqlk-flash');
      setTimeout(() => cell.classList.remove('seqlk-flash'), 200);
      this.playerInput.push(idx);
      this._fillDot(step);

      if (this.playerInput.length === this.sequence.length) {
        this.accepting = false;
        this.statusEl.textContent = '✅ Correct!';
        setTimeout(() => this.onSubmit(true), 400);
      }
    } else {
      // Wrong
      this.accepting = false;
      cell.classList.add('seqlk-wrong');
      if (this.mode === 'flash') {
        this.statusEl.textContent = '❌ Wrong — watch again';
        setTimeout(() => this._playSequence(), 1200);
      } else {
        this.statusEl.textContent = '❌ Wrong — try again';
        setTimeout(() => this._startBlind(), 1200);
      }
    }
  }

  _fillDot(i) {
    const dots = this.dots.querySelectorAll('.seqlk-dot');
    if (dots[i]) dots[i].classList.add('seqlk-dot-filled');
  }

  _resetDots() {
    this.dots.querySelectorAll('.seqlk-dot').forEach(d => d.classList.remove('seqlk-dot-filled'));
  }

  reset() { this.mode === 'flash' ? this._playSequence() : this._startBlind(); }

  _injectStyles() {
    if (document.getElementById('seqlk-css')) return;
    const s = document.createElement('style');
    s.id = 'seqlk-css';
    s.textContent = `
.seqlk{display:flex;flex-direction:column;align-items:center;gap:16px;padding:16px 0}
.seqlk-status{font-size:14px;color:var(--muted,#7a8ba8);min-height:20px;letter-spacing:.3px}
.seqlk-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;width:200px;height:200px}
.seqlk-cell{background:var(--surface,#141b2d);border:2px solid var(--border,#1e2a45);border-radius:10px;cursor:pointer;transition:background .15s,border-color .15s,box-shadow .15s}
.seqlk-cell:active{transform:scale(.95)}
.seqlk-flash{background:var(--accent,#3b82f6)!important;border-color:var(--accent,#3b82f6)!important;box-shadow:0 0 16px rgba(59,130,246,.5)}
.seqlk-wrong{background:#ef4444!important;border-color:#ef4444!important;box-shadow:0 0 16px rgba(239,68,68,.5)}
.seqlk-bar{display:flex;align-items:center;gap:16px}
.seqlk-btn{padding:8px 16px;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;transition:opacity .2s}
.seqlk-btn:active{opacity:.7}
.seqlk-btn-sec{background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);color:var(--muted,#7a8ba8)}
.seqlk-dots{display:flex;gap:6px}
.seqlk-dot{width:10px;height:10px;border-radius:50%;background:var(--border,#1e2a45);transition:background .2s}
.seqlk-dot-filled{background:var(--accent,#3b82f6)}
`;
    document.head.appendChild(s);
  }
}
