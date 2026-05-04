/**
 * Path Trace Lock Puzzle
 *
 * Mini network diagram. Player taps nodes in the correct order to trace a route.
 *
 * Usage:
 *   new PathLock(containerEl, {
 *     nodes: [
 *       { id: 'a', label: 'IGW', x: 50, y: 20 },
 *       { id: 'b', label: 'Router', x: 50, y: 50 },
 *       { id: 'c', label: 'EC2', x: 20, y: 80 },
 *       { id: 'd', label: 'RDS', x: 80, y: 80 },
 *     ],
 *     edges: [['a','b'],['b','c'],['b','d']],  // connections
 *     answer: ['a','b','c'],  // correct path node ids in order
 *     onSubmit(correct) { }
 *   });
 */

class PathLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.nodes = opts.nodes || [];
    this.edges = opts.edges || [];
    this.answer = opts.answer || [];
    this.onSubmit = opts.onSubmit || (() => {});
    this.selected = [];
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'pthlk';

    this.statusEl = document.createElement('div');
    this.statusEl.className = 'pthlk-status';
    this.statusEl.textContent = 'Tap nodes to trace the route';
    wrap.appendChild(this.statusEl);

    const area = document.createElement('div');
    area.className = 'pthlk-area';

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'pthlk-canvas';
    area.appendChild(this.canvas);

    this.nodeEls = {};
    this.nodes.forEach(n => {
      const el = document.createElement('div');
      el.className = 'pthlk-node';
      el.textContent = n.label;
      el.style.left = `${n.x}%`;
      el.style.top = `${n.y}%`;
      el.addEventListener('click', () => this._tap(n.id));
      area.appendChild(el);
      this.nodeEls[n.id] = el;
    });

    wrap.appendChild(area);

    const bar = document.createElement('div');
    bar.className = 'pthlk-bar';
    const resetBtn = document.createElement('button');
    resetBtn.className = 'pthlk-btn-sec';
    resetBtn.textContent = '↻ Reset';
    resetBtn.addEventListener('click', () => this.reset());
    bar.appendChild(resetBtn);
    wrap.appendChild(bar);

    this.container.appendChild(wrap);
    this._injectStyles();
    requestAnimationFrame(() => { this._resize(); this._drawEdges(); });
    window.addEventListener('resize', () => { this._resize(); this._drawAll(); });
  }

  _resize() {
    const r = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = r.width;
    this.canvas.height = r.height;
  }

  _nodeCenter(id) {
    const el = this.nodeEls[id];
    const cr = this.canvas.getBoundingClientRect();
    const nr = el.getBoundingClientRect();
    return { x: nr.left + nr.width / 2 - cr.left, y: nr.top + nr.height / 2 - cr.top };
  }

  _drawAll() {
    const ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this._drawEdges();
    this._drawPath();
  }

  _drawEdges() {
    const ctx = this.canvas.getContext('2d');
    ctx.strokeStyle = '#1e2a45';
    ctx.lineWidth = 2;
    this.edges.forEach(([a, b]) => {
      const pa = this._nodeCenter(a);
      const pb = this._nodeCenter(b);
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    });
  }

  _drawPath() {
    if (this.selected.length < 2) return;
    const ctx = this.canvas.getContext('2d');
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    const p0 = this._nodeCenter(this.selected[0]);
    ctx.moveTo(p0.x, p0.y);
    for (let i = 1; i < this.selected.length; i++) {
      const p = this._nodeCenter(this.selected[i]);
      ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  _tap(id) {
    // Undo last if tapping it again
    if (this.selected.length && this.selected[this.selected.length - 1] === id) {
      this.selected.pop();
      this.nodeEls[id].classList.remove('pthlk-active');
      this._drawAll();
      return;
    }
    if (this.selected.includes(id)) return;

    this.selected.push(id);
    this.nodeEls[id].classList.add('pthlk-active');
    this._drawAll();

    if (this.selected.length === this.answer.length) {
      const correct = this.selected.every((s, i) => s === this.answer[i]);
      if (correct) {
        this.statusEl.textContent = '✅ Route traced!';
        Object.values(this.nodeEls).forEach(el => el.classList.add('pthlk-done'));
        setTimeout(() => this.onSubmit(true), 400);
      } else {
        this.statusEl.textContent = '❌ Wrong route — try again';
        setTimeout(() => this.reset(), 1200);
      }
    }
  }

  reset() {
    this.selected = [];
    this.statusEl.textContent = 'Tap nodes to trace the route';
    Object.values(this.nodeEls).forEach(el => el.classList.remove('pthlk-active', 'pthlk-done'));
    this._drawAll();
  }

  _injectStyles() {
    if (document.getElementById('pthlk-css')) return;
    const s = document.createElement('style');
    s.id = 'pthlk-css';
    s.textContent = `
.pthlk{display:flex;flex-direction:column;align-items:center;gap:12px;padding:16px 0}
.pthlk-status{font-size:14px;color:var(--muted,#7a8ba8);min-height:20px}
.pthlk-area{position:relative;width:280px;height:220px}
.pthlk-canvas{position:absolute;inset:0;pointer-events:none}
.pthlk-node{position:absolute;transform:translate(-50%,-50%);padding:6px 12px;background:var(--surface,#141b2d);border:2px solid var(--border,#1e2a45);border-radius:8px;font-size:12px;font-weight:700;color:var(--muted,#7a8ba8);cursor:pointer;user-select:none;-webkit-user-select:none;transition:all .15s;z-index:1;white-space:nowrap}
.pthlk-node:active{transform:translate(-50%,-50%) scale(.93)}
.pthlk-node.pthlk-active{border-color:var(--accent,#3b82f6);color:var(--accent,#3b82f6);box-shadow:0 0 10px rgba(59,130,246,.3)}
.pthlk-node.pthlk-done{border-color:var(--green,#22c55e);color:var(--green,#22c55e);box-shadow:0 0 10px rgba(34,197,94,.3)}
.pthlk-bar{display:flex;gap:12px}
.pthlk-btn-sec{padding:8px 16px;border:none;border-radius:8px;background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);color:var(--muted,#7a8ba8);font-size:13px;font-weight:600;cursor:pointer}
.pthlk-btn-sec:active{opacity:.7}
`;
    document.head.appendChild(s);
  }
}
