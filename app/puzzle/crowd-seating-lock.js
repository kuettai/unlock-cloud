/**
 * Crowd Seating Lock Puzzle
 *
 * Grid representing a hillside. Player taps cells to place group markers.
 * Groups can't be adjacent (need paths between them for distribution).
 * Must place exactly the target number of groups.
 *
 * Usage:
 *   new CrowdSeatingLock(containerEl, {
 *     cols: 8,
 *     rows: 6,
 *     target: 10,              // number of groups to place
 *     groupSize: 50,           // people per group (display only)
 *     blocked: [[0,0],[2,3]],  // cells that can't be used (rocks, trees)
 *     onSubmit({ groups }) {},
 *     onWrong(msg) {},
 *   });
 */

class CrowdSeatingLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.cols = opts.cols || 8;
    this.rows = opts.rows || 6;
    this.target = opts.target || 10;
    this.groupSize = opts.groupSize || 50;
    this.blocked = new Set((opts.blocked || []).map(([r, c]) => `${r},${c}`));
    this.onSubmit = opts.onSubmit || (() => {});
    this.onWrong = opts.onWrong || (() => {});
    this.placed = new Set();
    this.solved = false;
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'cslk';

    this.statusEl = document.createElement('div');
    this.statusEl.className = 'cslk-status';
    wrap.appendChild(this.statusEl);

    this.infoEl = document.createElement('div');
    this.infoEl.className = 'cslk-info';
    wrap.appendChild(this.infoEl);

    const grid = document.createElement('div');
    grid.className = 'cslk-grid';
    grid.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;

    this.cells = [];
    for (let r = 0; r < this.rows; r++) {
      this.cells[r] = [];
      for (let c = 0; c < this.cols; c++) {
        const cell = document.createElement('div');
        const key = `${r},${c}`;
        if (this.blocked.has(key)) {
          cell.className = 'cslk-cell cslk-blocked';
          cell.textContent = '🪨';
        } else {
          cell.className = 'cslk-cell cslk-open';
          cell.addEventListener('click', () => this._tap(r, c));
        }
        grid.appendChild(cell);
        this.cells[r][c] = cell;
      }
    }
    wrap.appendChild(grid);

    const bar = document.createElement('div');
    bar.className = 'cslk-bar';
    const btn = document.createElement('button');
    btn.className = 'cslk-btn';
    btn.textContent = '✓ Confirm Seating';
    btn.addEventListener('click', () => this._submit());
    bar.appendChild(btn);
    const resetBtn = document.createElement('button');
    resetBtn.className = 'cslk-btn-sec';
    resetBtn.textContent = '↻ Clear';
    resetBtn.addEventListener('click', () => this._reset());
    bar.appendChild(resetBtn);
    wrap.appendChild(bar);

    this.container.appendChild(wrap);
    this._injectStyles();
    this._update();
  }

  _tap(r, c) {
    if (this.solved) return;
    const key = `${r},${c}`;
    if (this.placed.has(key)) {
      this.placed.delete(key);
      this.cells[r][c].classList.remove('cslk-placed');
      this.cells[r][c].textContent = '';
    } else {
      this.placed.add(key);
      this.cells[r][c].classList.add('cslk-placed');
      this.cells[r][c].textContent = '👥';
    }
    this._update();
  }

  _hasAdjacent() {
    const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
    for (const key of this.placed) {
      const [r, c] = key.split(',').map(Number);
      for (const [dr, dc] of dirs) {
        if (this.placed.has(`${r+dr},${c+dc}`)) return true;
      }
    }
    return false;
  }

  _update() {
    const count = this.placed.size;
    const total = count * this.groupSize;
    this.infoEl.textContent = `Groups: ${count}/${this.target} (${total.toLocaleString()} people seated)`;
    if (!this.solved) {
      this.statusEl.textContent = 'Tap to place groups of ' + this.groupSize + ' — leave paths between them';
    }
    // Highlight adjacency violations
    const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.cells[r][c].classList.remove('cslk-conflict');
        if (!this.placed.has(`${r},${c}`)) continue;
        for (const [dr, dc] of dirs) {
          if (this.placed.has(`${r+dr},${c+dc}`)) {
            this.cells[r][c].classList.add('cslk-conflict');
            break;
          }
        }
      }
    }
  }

  _submit() {
    if (this.solved) return;
    if (this.placed.size !== this.target) {
      const msg = this.placed.size < this.target ? `Need ${this.target - this.placed.size} more groups` : `Too many — remove ${this.placed.size - this.target}`;
      this.statusEl.textContent = '❌ ' + msg;
      this.onWrong(msg);
      return;
    }
    if (this._hasAdjacent()) {
      this.statusEl.textContent = '❌ Groups too close — leave paths for distribution!';
      this.onWrong('Groups too close together');
      return;
    }
    this.solved = true;
    this.statusEl.textContent = '✅ Crowd organized — ' + (this.target * this.groupSize).toLocaleString() + ' people seated in groups!';
    for (const key of this.placed) {
      const [r, c] = key.split(',').map(Number);
      this.cells[r][c].classList.add('cslk-done');
    }
    setTimeout(() => this.onSubmit({ groups: this.placed.size }), 600);
  }

  _reset() {
    this.placed.clear();
    this.solved = false;
    for (let r = 0; r < this.rows; r++)
      for (let c = 0; c < this.cols; c++) {
        this.cells[r][c].classList.remove('cslk-placed', 'cslk-conflict', 'cslk-done');
        if (!this.blocked.has(`${r},${c}`)) this.cells[r][c].textContent = '';
      }
    this._update();
  }

  _injectStyles() {
    if (document.getElementById('cslk-css')) return;
    const s = document.createElement('style');
    s.id = 'cslk-css';
    s.textContent = `
.cslk{display:flex;flex-direction:column;align-items:center;gap:10px;padding:16px 0}
.cslk-status{font-size:14px;color:var(--muted,#7a8ba8);min-height:20px;text-align:center}
.cslk-info{font-size:15px;font-weight:700;color:var(--text,#e0e6f0)}
.cslk-grid{display:grid;gap:2px;width:min(320px,95vw)}
.cslk-cell{aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:4px;font-size:14px;cursor:pointer;user-select:none;-webkit-user-select:none;transition:all .12s}
.cslk-open{background:rgba(34,80,34,.2);border:1px solid transparent}
.cslk-open:active{transform:scale(.92)}
.cslk-blocked{background:rgba(100,100,100,.15);cursor:default;font-size:12px}
.cslk-placed{background:rgba(59,130,246,.25);border-color:var(--accent,#3b82f6)}
.cslk-conflict{background:rgba(239,68,68,.2)!important;border-color:var(--red,#ef4444)!important}
.cslk-done{background:rgba(34,197,94,.2)!important;border-color:var(--green,#22c55e)!important}
.cslk-bar{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.cslk-btn{padding:10px 18px;border:none;border-radius:8px;background:var(--accent,#3b82f6);color:#fff;font-size:14px;font-weight:600;cursor:pointer}
.cslk-btn:active{opacity:.7}
.cslk-btn-sec{padding:8px 14px;border:none;border-radius:8px;background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);color:var(--muted,#7a8ba8);font-size:13px;font-weight:600;cursor:pointer}
.cslk-btn-sec:active{opacity:.7}
`;
    document.head.appendChild(s);
  }
}
