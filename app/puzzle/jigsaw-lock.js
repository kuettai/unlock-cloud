/**
 * Jigsaw Fragment Lock Puzzle
 *
 * Grid of scrambled tiles. Player taps two tiles to swap them.
 * Goal: arrange tiles into correct order. Numbered or image-based.
 *
 * Usage:
 *   new JigsawLock(containerEl, {
 *     cols: 3,
 *     rows: 3,
 *     tiles: ['A','B','C','D','E','F','G','H','I'],  // correct order
 *     revealCorrect: true,  // show green on correctly placed tiles (false = no hints)
 *     onSubmit(correct) { ... }
 *   });
 */

class JigsawLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.cols = opts.cols || 3;
    this.rows = opts.rows || 3;
    this.solution = [...(opts.tiles || [])];
    this.revealCorrect = opts.revealCorrect !== undefined ? opts.revealCorrect : true;
    this.onSubmit = opts.onSubmit || (() => {});
    this.tiles = this._shuffle([...this.solution]);
    this.selected = null;
    this._render();
  }

  _shuffle(arr) {
    // Fisher-Yates, ensure not already solved
    let shuffled;
    do {
      shuffled = [...arr];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
    } while (shuffled.every((v, i) => v === arr[i]));
    return shuffled;
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'jiglk';

    this.statusEl = document.createElement('div');
    this.statusEl.className = 'jiglk-status';
    this.statusEl.textContent = 'Tap two tiles to swap them';
    wrap.appendChild(this.statusEl);

    this.grid = document.createElement('div');
    this.grid.className = 'jiglk-grid';
    this.grid.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
    wrap.appendChild(this.grid);

    this.container.appendChild(wrap);
    this._injectStyles();
    this._renderTiles();
  }

  _renderTiles() {
    this.grid.innerHTML = '';
    this.cellEls = [];
    this.tiles.forEach((tile, i) => {
      const el = document.createElement('div');
      el.className = 'jiglk-cell';
      el.textContent = tile;
      el.dataset.idx = i;
      // Highlight if in correct position
      if (this.revealCorrect && this.tiles[i] === this.solution[i]) {
        el.classList.add('jiglk-placed');
      }
      el.addEventListener('click', () => this._tap(i));
      this.grid.appendChild(el);
      this.cellEls.push(el);
    });
  }

  _tap(i) {
    if (this.selected === null) {
      this.selected = i;
      this.cellEls[i].classList.add('jiglk-selected');
    } else if (this.selected === i) {
      this.cellEls[i].classList.remove('jiglk-selected');
      this.selected = null;
    } else {
      // Swap
      [this.tiles[this.selected], this.tiles[i]] = [this.tiles[i], this.tiles[this.selected]];
      this.selected = null;
      this._renderTiles();
      this._check();
    }
  }

  _check() {
    if (this.tiles.every((v, i) => v === this.solution[i])) {
      this.statusEl.textContent = '✅ Assembled!';
      this.cellEls.forEach(el => el.classList.add('jiglk-done'));
      setTimeout(() => this.onSubmit(true), 400);
    }
  }

  reset() {
    this.tiles = this._shuffle([...this.solution]);
    this.selected = null;
    this.statusEl.textContent = 'Tap two tiles to swap them';
    this._renderTiles();
  }

  _injectStyles() {
    if (document.getElementById('jiglk-css')) return;
    const s = document.createElement('style');
    s.id = 'jiglk-css';
    s.textContent = `
.jiglk{display:flex;flex-direction:column;align-items:center;gap:14px;padding:16px 0}
.jiglk-status{font-size:14px;color:var(--muted,#7a8ba8);min-height:20px}
.jiglk-grid{display:grid;gap:6px;width:220px}
.jiglk-cell{aspect-ratio:1;display:flex;align-items:center;justify-content:center;background:var(--surface,#141b2d);border:2px solid var(--border,#1e2a45);border-radius:8px;font-size:18px;font-weight:700;color:var(--muted,#7a8ba8);cursor:pointer;transition:all .15s;user-select:none;-webkit-user-select:none}
.jiglk-cell:active{transform:scale(.93)}
.jiglk-cell.jiglk-selected{border-color:var(--accent,#3b82f6);box-shadow:0 0 12px rgba(59,130,246,.4);color:var(--accent,#3b82f6)}
.jiglk-cell.jiglk-placed{border-color:var(--green,#22c55e);color:var(--green,#22c55e);opacity:.7}
.jiglk-cell.jiglk-done{border-color:var(--green,#22c55e);color:var(--green,#22c55e);box-shadow:0 0 10px rgba(34,197,94,.3);opacity:1}
`;
    document.head.appendChild(s);
  }
}
