/**
 * Crowd Counter Lock Puzzle
 *
 * Bird's-eye view grid with clusters of people (emoji/icons). Player taps
 * clusters to count them. Running tally shown. Must reach the target count.
 * Tapping an already-counted cluster uncounts it.
 *
 * Usage:
 *   new CrowdCounterLock(containerEl, {
 *     rows: 6, cols: 8,
 *     clusters: [
 *       { row: 0, col: 1, count: 120, icon: '👥' },
 *       { row: 2, col: 3, count: 350, icon: '👨‍👩‍👦' },
 *     ],
 *     target: 5000,
 *     tolerance: 0,           // exact match required (0) or allow +/- N
 *     onSubmit({ total }) {},
 *     onWrong(msg) {},
 *   });
 */

class CrowdCounterLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.rows = opts.rows || 6;
    this.cols = opts.cols || 8;
    this.clusters = opts.clusters || [];
    if (opts.shuffle !== false) this._shufflePositions();
    this.target = opts.target || 5000;
    this.tolerance = opts.tolerance || 0;
    this.showTally = opts.showTally !== false;
    this.onSubmit = opts.onSubmit || (() => {});
    this.onWrong = opts.onWrong || (() => {});
    this.counted = new Set();
    this.total = 0;
    this.solved = false;
    this._render();
  }

  _shufflePositions() {
    const used = new Set();
    this.clusters.forEach(c => {
      let r, col, key;
      do {
        r = Math.floor(Math.random() * this.rows);
        col = Math.floor(Math.random() * this.cols);
        key = `${r},${col}`;
      } while (used.has(key));
      used.add(key);
      c.row = r;
      c.col = col;
    });
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'cclk';

    this.statusEl = document.createElement('div');
    this.statusEl.className = 'cclk-status';
    wrap.appendChild(this.statusEl);

    // Tally display
    this.tallyEl = document.createElement('div');
    this.tallyEl.className = 'cclk-tally';
    wrap.appendChild(this.tallyEl);

    // Grid
    const grid = document.createElement('div');
    grid.className = 'cclk-grid';
    grid.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${this.rows}, 1fr)`;

    // Fill grid with empty cells, place clusters
    const clusterMap = {};
    this.clusters.forEach((c, i) => { clusterMap[`${c.row},${c.col}`] = { ...c, idx: i }; });

    this.clusterEls = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = document.createElement('div');
        cell.className = 'cclk-cell';
        const key = `${r},${c}`;
        const cluster = clusterMap[key];
        if (cluster) {
          cell.classList.add('cclk-cluster');
          cell.innerHTML = `<span class="cclk-icon">${cluster.icon || '👥'}</span><span class="cclk-count">${cluster.count}</span>`;
          cell.addEventListener('click', () => this._tap(cluster.idx));
          this.clusterEls[cluster.idx] = cell;
        } else {
          cell.innerHTML = '<span class="cclk-grass">~</span>';
        }
        grid.appendChild(cell);
      }
    }
    wrap.appendChild(grid);

    // Submit button
    const bar = document.createElement('div');
    bar.className = 'cclk-bar';
    const btn = document.createElement('button');
    btn.className = 'cclk-btn';
    btn.textContent = '✓ Submit Count';
    btn.addEventListener('click', () => this._submit());
    bar.appendChild(btn);
    const resetBtn = document.createElement('button');
    resetBtn.className = 'cclk-btn-sec';
    resetBtn.textContent = '↻ Recount';
    resetBtn.addEventListener('click', () => this._reset());
    bar.appendChild(resetBtn);
    wrap.appendChild(bar);

    this.container.appendChild(wrap);
    this._injectStyles();
    this._updateTally();
  }

  _tap(idx) {
    if (this.solved) return;
    const cluster = this.clusters[idx];
    const el = this.clusterEls[idx];
    if (this.counted.has(idx)) {
      this.counted.delete(idx);
      this.total -= cluster.count;
      el.classList.remove('cclk-active');
    } else {
      this.counted.add(idx);
      this.total += cluster.count;
      el.classList.add('cclk-active');
    }
    this._updateTally();
  }

  _updateTally() {
    if (this.showTally) {
      this.tallyEl.textContent = `Counted: ${this.total.toLocaleString()} / Target: ${this.target.toLocaleString()}`;
    } else {
      this.tallyEl.textContent = `${this.counted.size} group${this.counted.size !== 1 ? 's' : ''} selected — target: ${this.target.toLocaleString()}`;
    }
    if (!this.solved) {
      this.statusEl.textContent = `Tap groups to count them (${this.counted.size} groups selected)`;
    }
  }

  _submit() {
    if (this.solved) return;
    const diff = Math.abs(this.total - this.target);
    if (diff <= this.tolerance) {
      this.solved = true;
      this.statusEl.textContent = `✅ Count confirmed: ${this.total.toLocaleString()}!`;
      this.clusterEls.forEach(el => { if (el) el.classList.add('cclk-done'); });
      setTimeout(() => this.onSubmit({ total: this.total }), 600);
    } else {
      const hint = this.total < this.target ? 'Too few — keep counting' : 'Too many — uncount some groups';
      this.statusEl.textContent = `❌ ${hint} (off by ${diff.toLocaleString()})`;
      this.onWrong(hint);
    }
  }

  _reset() {
    this.counted.clear();
    this.total = 0;
    this.solved = false;
    this.clusterEls.forEach(el => { if (el) el.classList.remove('cclk-active', 'cclk-done'); });
    this._updateTally();
  }

  _injectStyles() {
    if (document.getElementById('cclk-css')) return;
    const s = document.createElement('style');
    s.id = 'cclk-css';
    s.textContent = `
.cclk{display:flex;flex-direction:column;align-items:center;gap:10px;padding:16px 0}
.cclk-status{font-size:14px;color:var(--muted,#7a8ba8);min-height:20px;text-align:center}
.cclk-tally{font-size:16px;font-weight:700;color:var(--text,#e0e6f0);text-align:center}
.cclk-grid{display:grid;gap:2px;width:min(340px,95vw);aspect-ratio:4/3}
.cclk-cell{display:flex;align-items:center;justify-content:center;background:rgba(34,80,34,.15);border-radius:4px;font-size:10px;color:var(--muted,#7a8ba8);min-height:0}
.cclk-grass{opacity:.3}
.cclk-cluster{cursor:pointer;background:rgba(59,130,246,.1);border:1.5px solid transparent;border-radius:6px;flex-direction:column;gap:1px;transition:all .15s;user-select:none;-webkit-user-select:none}
.cclk-cluster:active{transform:scale(.95)}
.cclk-active{border-color:var(--accent,#3b82f6);background:rgba(59,130,246,.25)}
.cclk-active .cclk-count{color:var(--accent,#3b82f6)}
.cclk-done{border-color:var(--green,#22c55e);background:rgba(34,197,94,.15)}
.cclk-done .cclk-count{color:var(--green,#22c55e)}
.cclk-icon{font-size:16px;line-height:1}
.cclk-count{font-size:9px;font-weight:700;color:var(--muted,#7a8ba8)}
.cclk-bar{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.cclk-btn{padding:10px 18px;border:none;border-radius:8px;background:var(--accent,#3b82f6);color:#fff;font-size:14px;font-weight:600;cursor:pointer}
.cclk-btn:active{opacity:.7}
.cclk-btn-sec{padding:8px 14px;border:none;border-radius:8px;background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);color:var(--muted,#7a8ba8);font-size:13px;font-weight:600;cursor:pointer}
.cclk-btn-sec:active{opacity:.7}
`;
    document.head.appendChild(s);
  }
}
