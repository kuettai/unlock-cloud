/**
 * Pipe Connect Lock Puzzle
 *
 * Grid of rotatable pipe segments. Rotate tiles to form a connected path
 * from the source to the sink.
 *
 * Pipe types: '─','│','┐','┘','└','┌','┬','┴','├','┤','┼'
 * Each has connection directions: top, right, bottom, left.
 *
 * Usage:
 *   new PipeLock(containerEl, {
 *     cols: 4,
 *     rows: 3,
 *     // Grid of pipe types in solved state (left-to-right, top-to-bottom)
 *     pipes: ['┌','─','─','┐','│',' ',' ','│','└','─','─','┘'],
 *     source: { col: 0, row: 0 },  // entry point
 *     sink: { col: 3, row: 2 },    // exit point
 *     onSubmit(correct) { ... }
 *   });
 */

const PIPE_CONNECTIONS = {
  '─': [0,1,0,1], '│': [1,0,1,0],
  '┐': [0,0,1,1], '┘': [1,0,0,1], '└': [1,1,0,0], '┌': [0,1,1,0],
  '┬': [0,1,1,1], '┴': [1,1,0,1], '├': [1,1,1,0], '┤': [1,0,1,1],
  '┼': [1,1,1,1], ' ': [0,0,0,0],
};

function rotateCW(conn) { return [conn[3], conn[0], conn[1], conn[2]]; }

class PipeLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.cols = opts.cols || 4;
    this.rows = opts.rows || 3;
    this.source = opts.source || { col: 0, row: 0 };
    this.sink = opts.sink || { col: this.cols - 1, row: this.rows - 1 };
    this.onSubmit = opts.onSubmit || (() => {});

    // Store solution connections and randomize rotations
    const pipes = opts.pipes || [];
    this.cells = pipes.map(p => {
      let conn = PIPE_CONNECTIONS[p] ? [...PIPE_CONNECTIONS[p]] : [0,0,0,0];
      const rotations = Math.floor(Math.random() * 4);
      for (let r = 0; r < rotations; r++) conn = rotateCW(conn);
      return { base: p, conn, rotation: 0 };
    });
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'piplk';

    this.grid = document.createElement('div');
    this.grid.className = 'piplk-grid';
    this.grid.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;

    this.cellEls = [];
    this.cells.forEach((cell, i) => {
      const el = document.createElement('div');
      el.className = 'piplk-cell';
      const col = i % this.cols;
      const row = Math.floor(i / this.cols);
      if (col === this.source.col && row === this.source.row) el.classList.add('piplk-source');
      if (col === this.sink.col && row === this.sink.row) el.classList.add('piplk-sink');

      const inner = document.createElement('div');
      inner.className = 'piplk-pipe';
      this._drawPipe(inner, cell.conn);
      el.appendChild(inner);

      el.addEventListener('click', () => this._rotate(i));
      this.grid.appendChild(el);
      this.cellEls.push({ el, inner });
    });

    wrap.appendChild(this.grid);
    this.container.appendChild(wrap);
    this._injectStyles();
  }

  _drawPipe(el, conn) {
    // Draw using CSS borders/lines
    const [t, r, b, l] = conn;
    let svg = '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">';
    svg += '<line x1="20" y1="20" x2="20" y2="20" stroke="#3b82f6" stroke-width="0"/>';
    if (t) svg += '<line x1="20" y1="0" x2="20" y2="20" stroke="#3b82f6" stroke-width="4" stroke-linecap="round"/>';
    if (r) svg += '<line x1="20" y1="20" x2="40" y2="20" stroke="#3b82f6" stroke-width="4" stroke-linecap="round"/>';
    if (b) svg += '<line x1="20" y1="20" x2="20" y2="40" stroke="#3b82f6" stroke-width="4" stroke-linecap="round"/>';
    if (l) svg += '<line x1="0" y1="20" x2="20" y2="20" stroke="#3b82f6" stroke-width="4" stroke-linecap="round"/>';
    // Center dot
    if (t || r || b || l) svg += '<circle cx="20" cy="20" r="4" fill="#3b82f6"/>';
    svg += '</svg>';
    el.innerHTML = svg;
  }

  _rotate(i) {
    const cell = this.cells[i];
    cell.conn = rotateCW(cell.conn);
    cell.rotation = (cell.rotation + 1) % 4;
    this._drawPipe(this.cellEls[i].inner, cell.conn);
    this._checkConnected();
  }

  _checkConnected() {
    // BFS from source following connected pipes
    const visited = new Set();
    const queue = [this.source.row * this.cols + this.source.col];
    visited.add(queue[0]);
    const dirs = [[-1,0,0,2],[0,1,1,3],[1,0,2,0],[0,-1,3,1]]; // [dr,dc,fromDir,toDir]

    while (queue.length) {
      const idx = queue.shift();
      const row = Math.floor(idx / this.cols);
      const col = idx % this.cols;
      const cell = this.cells[idx];

      for (const [dr, dc, fromDir, toDir] of dirs) {
        if (!cell.conn[fromDir]) continue;
        const nr = row + dr, nc = col + dc;
        if (nr < 0 || nr >= this.rows || nc < 0 || nc >= this.cols) continue;
        const ni = nr * this.cols + nc;
        if (visited.has(ni)) continue;
        if (!this.cells[ni].conn[toDir]) continue;
        visited.add(ni);
        queue.push(ni);
      }
    }

    // Highlight connected cells
    this.cellEls.forEach((c, i) => c.el.classList.toggle('piplk-connected', visited.has(i)));

    const sinkIdx = this.sink.row * this.cols + this.sink.col;
    if (visited.has(sinkIdx)) {
      setTimeout(() => this.onSubmit(true), 400);
    }
  }

  reset() {
    this.cells.forEach(cell => {
      const rotations = Math.floor(Math.random() * 4);
      cell.conn = PIPE_CONNECTIONS[cell.base] ? [...PIPE_CONNECTIONS[cell.base]] : [0,0,0,0];
      for (let r = 0; r < rotations; r++) cell.conn = rotateCW(cell.conn);
    });
    this._render();
  }

  _injectStyles() {
    if (document.getElementById('piplk-css')) return;
    const s = document.createElement('style');
    s.id = 'piplk-css';
    s.textContent = `
.piplk{padding:16px 0;display:flex;justify-content:center}
.piplk-grid{display:grid;gap:3px}
.piplk-cell{aspect-ratio:1;background:var(--surface,#141b2d);border:2px solid var(--border,#1e2a45);border-radius:6px;cursor:pointer;transition:all .15s;padding:4px;position:relative}
.piplk-cell:active{transform:scale(.93)}
.piplk-cell.piplk-connected{border-color:var(--accent,#3b82f6);box-shadow:0 0 6px rgba(59,130,246,.2)}
.piplk-cell.piplk-source::before,.piplk-cell.piplk-sink::before{content:'';position:absolute;top:3px;right:3px;width:8px;height:8px;border-radius:50%;z-index:1}
.piplk-cell.piplk-source::before{background:var(--green,#22c55e)}
.piplk-cell.piplk-sink::before{background:#ef4444}
.piplk-pipe{width:100%;height:100%}
.piplk-pipe svg{width:100%;height:100%;display:block}
`;
    document.head.appendChild(s);
  }
}
