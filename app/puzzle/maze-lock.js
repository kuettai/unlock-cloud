/**
 * Maze Lock Puzzle
 *
 * First-person maze navigation with 3 buttons: Turn Left, Move Forward, Turn Right.
 * Player navigates a grid maze from start to goal. Walls drawn on canvas overlay
 * so the grid never shifts.
 *
 * Usage:
 *   new MazeLock(containerEl, {
 *     cols: 5,
 *     rows: 5,
 *     walls: [                          // walls as [row,col,side] — side: 'N','S','E','W'
 *       [0,0,'E'], [1,0,'S'], ...
 *     ],
 *     start: { row: 0, col: 0, facing: 'E' },  // facing: N/S/E/W
 *     goal: { row: 4, col: 4 },
 *     maxSteps: 30,                     // optional step limit
 *     showWalls: true,                  // false = walls invisible (player discovers by bumping)
 *     showGoal: true,                   // false = goal ★ hidden until player steps on it
 *     fallOnBump: false,                // true = hitting a wall resets player to start
 *     falseOutputs: [],                 // optional wrong-attempt messages
 *     onSubmit() { },
 *     onWrong(msg) { },
 *     onBump() { }                      // called when player hits a wall — let engine decide penalty
 *   });
 */

class MazeLock {
  static DIRS = ['N', 'E', 'S', 'W'];
  static DELTA = { N: [-1, 0], E: [0, 1], S: [1, 0], W: [0, -1] };
  static ARROWS = { N: '▲', E: '▶', S: '▼', W: '◀' };

  constructor(container, opts = {}) {
    this.container = container;
    this.cols = opts.cols || 5;
    this.rows = opts.rows || 5;
    this.wallSet = new Set();
    (opts.walls || []).forEach(([r, c, s]) => {
      this.wallSet.add(`${r},${c},${s}`);
      const d = MazeLock.DELTA[s];
      const opp = { N: 'S', S: 'N', E: 'W', W: 'E' }[s];
      this.wallSet.add(`${r + d[0]},${c + d[1]},${opp}`);
    });
    this.startPos = opts.start || { row: 0, col: 0, facing: 'E' };
    this.goal = opts.goal || { row: this.rows - 1, col: this.cols - 1 };
    this.maxSteps = opts.maxSteps || 0;
    this.showWalls = opts.showWalls !== false;
    this.showGoal = opts.showGoal !== false;
    this.revealedWalls = new Set();
    this.falseOutputs = opts.falseOutputs || [];
    this.falseIdx = 0;
    this.onSubmit = opts.onSubmit || (() => {});
    this.onWrong = opts.onWrong || (() => {});
    this.onBump = opts.onBump || null;
    this.fallOnBump = !!opts.fallOnBump;
    this.showSteps = opts.showSteps !== false;
    this.playerIcon = opts.playerIcon || null;
    this.checkpoints = (opts.checkpoints || []).map((cp, i) => ({ ...cp, idx: i, collected: false }));
    this.onCheckpoint = opts.onCheckpoint || null;
    this.row = this.startPos.row;
    this.col = this.startPos.col;
    this.facing = this.startPos.facing;
    this.steps = 0;
    this.done = false;
    this.visited = new Set([`${this.startPos.row},${this.startPos.col}`]);
    this._render();
  }

  _hasWall(r, c, side) {
    if (side === 'N' && r === 0) return true;
    if (side === 'S' && r === this.rows - 1) return true;
    if (side === 'W' && c === 0) return true;
    if (side === 'E' && c === this.cols - 1) return true;
    return this.wallSet.has(`${r},${c},${side}`);
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'mazlk';

    this.statusEl = document.createElement('div');
    this.statusEl.className = 'mazlk-status';
    wrap.appendChild(this.statusEl);

    // maze area: canvas for walls, grid for cell highlights
    const area = document.createElement('div');
    area.className = 'mazlk-area';
    area.style.width = `min(280px, 90vw)`;
    area.style.aspectRatio = `${this.cols} / ${this.rows}`;

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'mazlk-canvas';
    area.appendChild(this.canvas);

    const grid = document.createElement('div');
    grid.className = 'mazlk-grid';
    grid.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${this.rows}, 1fr)`;
    this.cells = [];
    for (let r = 0; r < this.rows; r++) {
      this.cells[r] = [];
      for (let c = 0; c < this.cols; c++) {
        const cell = document.createElement('div');
        cell.className = 'mazlk-cell';
        if (r === this.goal.row && c === this.goal.col && this.showGoal) {
          cell.classList.add('mazlk-goal');
          cell.textContent = '★';
        }
        const cp = this.checkpoints.find(cp => cp.row === r && cp.col === c);
        if (cp) {
          cell.classList.add('mazlk-checkpoint');
          cell.textContent = cp.icon || '◆';
        }
        grid.appendChild(cell);
        this.cells[r][c] = cell;
      }
    }
    area.appendChild(grid);
    wrap.appendChild(area);

    // controls
    const bar = document.createElement('div');
    bar.className = 'mazlk-bar';
    const mkBtn = (label, fn) => {
      const b = document.createElement('button');
      b.className = 'mazlk-btn';
      b.textContent = label;
      b.addEventListener('click', () => { if (!this.done) fn(); });
      bar.appendChild(b);
      return b;
    };
    this.btnLeft = mkBtn('↰ Turn Left', () => this._turn(-1));
    this.btnFwd = mkBtn('↑ Forward', () => this._forward());
    this.btnRight = mkBtn('Turn Right ↱', () => this._turn(1));
    wrap.appendChild(bar);

    const resetBar = document.createElement('div');
    resetBar.className = 'mazlk-bar';
    const resetBtn = document.createElement('button');
    resetBtn.className = 'mazlk-btn-sec';
    resetBtn.textContent = '↻ Reset';
    resetBtn.addEventListener('click', () => this._reset());
    resetBar.appendChild(resetBtn);
    wrap.appendChild(resetBar);

    this.container.appendChild(wrap);
    this._injectStyles();
    requestAnimationFrame(() => { this._drawWalls(); this._updateView(); });
    window.addEventListener('resize', () => this._drawWalls());
  }

  _drawWalls() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    const ctx = this.canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const cw = w / this.cols, ch = h / this.rows;
    ctx.lineCap = 'round';

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const x = c * cw, y = r * ch;
        for (const side of ['N', 'S', 'E', 'W']) {
          if (!this._hasWall(r, c, side)) continue;
          const key = `${r},${c},${side}`;
          const revealed = this.revealedWalls.has(key);
          if (!this.showWalls && !revealed) continue;
          ctx.strokeStyle = revealed && !this.showWalls ? '#ef4444' : '#3b4a6b';
          ctx.lineWidth = revealed && !this.showWalls ? 3 : 2.5;
          ctx.beginPath();
          if (side === 'N') { ctx.moveTo(x, y); ctx.lineTo(x + cw, y); }
          else if (side === 'S') { ctx.moveTo(x, y + ch); ctx.lineTo(x + cw, y + ch); }
          else if (side === 'W') { ctx.moveTo(x, y); ctx.lineTo(x, y + ch); }
          else { ctx.moveTo(x + cw, y); ctx.lineTo(x + cw, y + ch); }
          ctx.stroke();
        }
      }
    }
  }

  _turn(dir) {
    const i = MazeLock.DIRS.indexOf(this.facing);
    this.facing = MazeLock.DIRS[(i + dir + 4) % 4];
    this._updateView();
  }

  _forward() {
    if (this._hasWall(this.row, this.col, this.facing)) {
      if (!this.showWalls) {
        this.revealedWalls.add(`${this.row},${this.col},${this.facing}`);
        this._drawWalls();
      }
      this.statusEl.textContent = this.fallOnBump ? '💀 You fell! Back to start...' : '🚫 Wall ahead!';
      this.statusEl.classList.add('mazlk-bump');
      setTimeout(() => this.statusEl.classList.remove('mazlk-bump'), 400);
      if (this.onBump) this.onBump();
      if (this.fallOnBump) {
        const wallKey = `${this.row},${this.col},${this.facing}`;
        this.row = this.startPos.row;
        this.col = this.startPos.col;
        this.facing = this.startPos.facing;
        this.visited.clear();
        this.visited.add(`${this.startPos.row},${this.startPos.col}`);
        this._updateView();
        // fade out the revealed wall after 2s
        setTimeout(() => {
          this.revealedWalls.delete(wallKey);
          this._drawWalls();
        }, 2000);
      }
      return;
    }
    const [dr, dc] = MazeLock.DELTA[this.facing];
    this.row += dr;
    this.col += dc;
    this.steps++;
    this.visited.add(`${this.row},${this.col}`);

    // Check checkpoints
    const cp = this.checkpoints.find(cp => cp.row === this.row && cp.col === this.col && !cp.collected);
    if (cp) {
      cp.collected = true;
      const cell = this.cells[this.row][this.col];
      cell.classList.remove('mazlk-checkpoint');
      cell.classList.add('mazlk-cp-done');
      cell.textContent = '✓';
      if (this.onCheckpoint) this.onCheckpoint({ checkpoint: cp, remaining: this.checkpoints.filter(c => !c.collected).length });
      // Change player icon if checkpoint has nextIcon
      if (cp.nextIcon) this.playerIcon = cp.nextIcon;
    }

    // Check goal — only if all checkpoints collected
    const allCollected = this.checkpoints.every(c => c.collected);
    if (this.row === this.goal.row && this.col === this.goal.col && allCollected) {
      this.done = true;
      if (!this.showGoal) {
        const gc = this.cells[this.goal.row][this.goal.col];
        gc.classList.add('mazlk-goal');
        gc.textContent = '★';
      }
      this._updateView();
      this.statusEl.textContent = '✅ You found the way!';
      this.btnLeft.disabled = this.btnFwd.disabled = this.btnRight.disabled = true;
      setTimeout(() => this.onSubmit({ steps: this.steps }), 600);
      return;
    }

    if (this.maxSteps && this.steps >= this.maxSteps) {
      this.done = true;
      const msg = this.falseOutputs.length
        ? this.falseOutputs[this.falseIdx++ % this.falseOutputs.length]
        : 'Too many steps — lost in the maze!';
      this.statusEl.textContent = '❌ ' + msg;
      this.onWrong(msg);
      setTimeout(() => this._reset(), 1500);
      return;
    }

    this._updateView();
  }

  _updateView() {
    for (let r = 0; r < this.rows; r++)
      for (let c = 0; c < this.cols; c++) {
        const cl = this.cells[r][c].classList;
        cl.remove('mazlk-player', 'mazlk-visited');
        const isGoal = r === this.goal.row && c === this.goal.col;
        const isCp = this.checkpoints.some(cp => cp.row === r && cp.col === c && !cp.collected);
        const isCpDone = this.checkpoints.some(cp => cp.row === r && cp.col === c && cp.collected);
        if (!isGoal && !isCp && !isCpDone) this.cells[r][c].textContent = '';
        if (isCpDone && !this.cells[r][c].textContent) this.cells[r][c].textContent = '✓';
        if (this.visited.has(`${r},${c}`)) cl.add('mazlk-visited');
      }
    const cell = this.cells[this.row][this.col];
    cell.classList.add('mazlk-player');
    const onGoal = this.row === this.goal.row && this.col === this.goal.col;
    if (!onGoal) {
      if (this.playerIcon) {
        cell.textContent = this.playerIcon;
      } else {
        cell.textContent = MazeLock.ARROWS[this.facing];
      }
    }

    if (!this.done) {
      const facing = this.playerIcon
        ? MazeLock.ARROWS[this.facing]
        : `Facing ${this.facing}`;
      const parts = [facing];
      if (this.showSteps) parts.push(`Steps: ${this.steps}`);
      if (this.maxSteps) parts.push(`${this.steps}/${this.maxSteps}`);
      if (this.checkpoints.length) {
        const collected = this.checkpoints.filter(c => c.collected).length;
        parts.push(`${collected}/${this.checkpoints.length} groups fed`);
        if (collected < this.checkpoints.length) parts.push('find next ◆');
        else parts.push('return to ★');
      } else {
        parts.push(this.showGoal ? 'navigate to ★' : 'find the exit');
      }
      this.statusEl.textContent = parts.join(' — ');
    }
  }

  _reset() {
    this.row = this.startPos.row;
    this.col = this.startPos.col;
    this.facing = this.startPos.facing;
    this.steps = 0;
    this.done = false;
    this.revealedWalls.clear();
    this.visited.clear();
    this.visited.add(`${this.startPos.row},${this.startPos.col}`);
    this.checkpoints.forEach(cp => { cp.collected = false; });
    if (this.checkpoints.length && this.checkpoints[0].icon) this.playerIcon = this.checkpoints[0].icon;
    this.btnLeft.disabled = this.btnFwd.disabled = this.btnRight.disabled = false;
    // Re-render checkpoint cells
    this.checkpoints.forEach(cp => {
      const cell = this.cells[cp.row][cp.col];
      cell.classList.remove('mazlk-cp-done');
      cell.classList.add('mazlk-checkpoint');
      cell.textContent = cp.icon || '◆';
    });
    this._drawWalls();
    this._updateView();
  }

  _injectStyles() {
    if (document.getElementById('mazlk-css')) return;
    const s = document.createElement('style');
    s.id = 'mazlk-css';
    s.textContent = `
.mazlk{display:flex;flex-direction:column;align-items:center;gap:12px;padding:16px 0}
.mazlk-status{font-size:14px;color:var(--muted,#7a8ba8);min-height:20px}
.mazlk-area{position:relative}
.mazlk-canvas{position:absolute;inset:0;z-index:2;pointer-events:none}
.mazlk-grid{position:relative;z-index:1;display:grid;gap:0;width:100%;height:100%}
.mazlk-cell{display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:var(--muted,#7a8ba8);transition:background .15s,color .15s}
.mazlk-player{background:rgba(59,130,246,.25);color:#60a5fa!important}
.mazlk-visited{background:rgba(59,130,246,.08)}
.mazlk-goal{color:var(--yellow,#eab308)!important;font-size:20px}
.mazlk-checkpoint{color:var(--yellow,#eab308)!important;font-size:16px;animation:mazlk-pulse 1.5s infinite}
.mazlk-cp-done{color:var(--green,#22c55e)!important;font-size:14px;opacity:.5}
@keyframes mazlk-pulse{0%,100%{opacity:1}50%{opacity:.4}}
.mazlk-player.mazlk-goal{background:rgba(34,197,94,.25);color:#4ade80!important}
.mazlk-bar{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.mazlk-btn{padding:10px 16px;border:none;border-radius:8px;background:var(--accent,#3b82f6);color:#fff;font-size:14px;font-weight:600;cursor:pointer;user-select:none;-webkit-user-select:none;touch-action:manipulation;transition:opacity .15s}
.mazlk-btn:active{opacity:.7}
.mazlk-btn:disabled{opacity:.4;cursor:default}
.mazlk-btn-sec{padding:8px 16px;border:none;border-radius:8px;background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);color:var(--muted,#7a8ba8);font-size:13px;font-weight:600;cursor:pointer}
.mazlk-btn-sec:active{opacity:.7}
.mazlk-bump{color:var(--red,#ef4444)!important}
`;
    document.head.appendChild(s);
  }
}
