/**
 * Drag-Wire Lock Puzzle
 *
 * Left: wire terminals. Right: socket terminals. Both support custom labels and decoys.
 * Player drags freely, then "Power On" tests all connections.
 *
 * Usage:
 *   new WireLock(containerEl, {
 *     wires: [
 *       { id: 'r', color: '#ef4444', label: 'VPC' },
 *       { id: 'b', color: '#3b82f6', label: 'S3' },
 *       { id: 'x', color: '#7a8ba8', label: 'Decoy' },  // not in solution = decoy
 *     ],
 *     sockets: [
 *       { id: 's0', label: 'Network' },
 *       { id: 's1', label: 'Storage' },
 *       { id: 's2', label: 'Compute' },
 *     ],
 *     solution: { r: 's0', b: 's1' },  // wire id -> socket id
 *     onSubmit() { ... }
 *   });
 */

class WireLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.wires = opts.wires || [];
    this.sockets = opts.sockets || [];
    this.solution = opts.solution || {};
    this.falseOutputs = opts.falseOutputs || [];
    this.onSubmit = opts.onSubmit || (() => {});
    this.onWrong = opts.onWrong || (() => {});
    this.submitLabel = opts.submitLabel || '⚡ Power On';
    this.connections = {};   // wireId -> socketId
    this.locked = {};        // wireId -> true
    this.dragging = null;
    if (opts.shuffle !== false) { this._shuffleArr(this.wires); this._shuffleArr(this.sockets); }
    this._render();
  }

  _shuffleArr(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'wirelk';

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'wirelk-canvas';
    wrap.appendChild(this.canvas);

    // Left terminals
    const left = document.createElement('div');
    left.className = 'wirelk-col wirelk-left';
    this.wireDots = {};
    this.wires.forEach(w => {
      const row = document.createElement('div');
      row.className = 'wirelk-terminal';
      const dot = document.createElement('div');
      dot.className = 'wirelk-dot';
      dot.style.background = w.color;
      dot.dataset.wire = w.id;
      const lbl = document.createElement('span');
      lbl.className = 'wirelk-label';
      lbl.textContent = w.label;
      row.appendChild(lbl);
      row.appendChild(dot);
      left.appendChild(row);
      this.wireDots[w.id] = dot;
    });
    wrap.appendChild(left);

    // Right sockets
    const right = document.createElement('div');
    right.className = 'wirelk-col wirelk-right';
    this.socketDots = {};
    this.sockets.forEach(s => {
      const row = document.createElement('div');
      row.className = 'wirelk-terminal';
      const dot = document.createElement('div');
      dot.className = 'wirelk-dot wirelk-socket';
      dot.dataset.socket = s.id;
      const lbl = document.createElement('span');
      lbl.className = 'wirelk-label';
      lbl.textContent = s.label;
      row.appendChild(dot);
      row.appendChild(lbl);
      right.appendChild(row);
      this.socketDots[s.id] = dot;
    });
    wrap.appendChild(right);

    this.sparkEl = document.createElement('div');
    this.sparkEl.className = 'wirelk-spark';
    wrap.appendChild(this.sparkEl);

    const btn = document.createElement('button');
    btn.className = 'wirelk-btn';
    btn.textContent = this.submitLabel;
    btn.addEventListener('click', () => this._test());
    wrap.appendChild(btn);

    this.container.appendChild(wrap);
    this._injectStyles();
    this._attachEvents(wrap);
    requestAnimationFrame(() => this._resize());
  }

  _resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this._drawAll();
  }

  _dotCenter(dot) {
    const cr = this.canvas.getBoundingClientRect();
    const dr = dot.getBoundingClientRect();
    return { x: dr.left + dr.width / 2 - cr.left, y: dr.top + dr.height / 2 - cr.top };
  }

  _drawAll() {
    const ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const [wid, sid] of Object.entries(this.connections)) {
      const wire = this.wires.find(w => w.id === wid);
      const from = this._dotCenter(this.wireDots[wid]);
      const to = this._dotCenter(this.socketDots[sid]);
      const glow = !!this.locked[wid];
      this._drawWire(ctx, from, to, wire.color, glow ? 1 : 0.6, glow);
    }

    if (this.dragging) {
      const wire = this.wires.find(w => w.id === this.dragging.wireId);
      const from = this._dotCenter(this.wireDots[this.dragging.wireId]);
      this._drawWire(ctx, from, { x: this.dragging.x, y: this.dragging.y }, wire.color, 0.4, false);
    }
  }

  _drawWire(ctx, from, to, color, alpha, glow) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = glow ? 4 : 3;
    if (glow) { ctx.shadowColor = color; ctx.shadowBlur = 12; }
    ctx.beginPath();
    const cpx = (from.x + to.x) / 2;
    ctx.moveTo(from.x, from.y);
    ctx.bezierCurveTo(cpx, from.y, cpx, to.y, to.x, to.y);
    ctx.stroke();
    ctx.restore();
  }

  _attachEvents(wrap) {
    const getPos = (e) => {
      const t = e.touches ? e.touches[0] : e;
      const cr = this.canvas.getBoundingClientRect();
      return { x: t.clientX - cr.left, y: t.clientY - cr.top };
    };

    const onStart = (e) => {
      const dot = e.target.closest('[data-wire]');
      if (!dot) return;
      const wid = dot.dataset.wire;
      if (this.locked[wid]) return;
      delete this.connections[wid];
      const pos = getPos(e);
      this.dragging = { wireId: wid, x: pos.x, y: pos.y };
      this._drawAll();
    };

    const onMove = (e) => {
      if (!this.dragging) return;
      e.preventDefault();
      const pos = getPos(e);
      this.dragging.x = pos.x;
      this.dragging.y = pos.y;
      this._drawAll();
    };

    const onEnd = (e) => {
      if (!this.dragging) return;
      const wid = this.dragging.wireId;
      this.dragging = null;

      const endEl = document.elementFromPoint(
        e.changedTouches ? e.changedTouches[0].clientX : e.clientX,
        e.changedTouches ? e.changedTouches[0].clientY : e.clientY
      );
      const socketDot = endEl && endEl.closest('[data-socket]');
      if (socketDot) {
        const sid = socketDot.dataset.socket;
        const taken = Object.entries(this.connections).find(([k, v]) => v === sid && k !== wid);
        if (!taken) this.connections[wid] = sid;
      }
      this._drawAll();
    };

    wrap.addEventListener('mousedown', onStart);
    wrap.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchend', onEnd);
    window.addEventListener('resize', () => this._resize());
  }

  _test() {
    const toRemove = [];
    const correctWireIds = Object.keys(this.solution);

    for (const [wid, sid] of Object.entries(this.connections)) {
      if (this.locked[wid]) continue;
      if (this.solution[wid] === sid) {
        this.locked[wid] = true;
      } else {
        toRemove.push(wid);
        this._spark(this.socketDots[sid]);
      }
    }

    this._drawAll();
    setTimeout(() => {
      toRemove.forEach(wid => delete this.connections[wid]);
      this._drawAll();
      // Check if all required wires are locked
      if (correctWireIds.every(wid => this.locked[wid])) {
        this.onSubmit(true);
      } else if (toRemove.length) {
        this._fireWrong();
      }
    }, 500);
  }

  _fireWrong() {
    if (this.falseOutputs.length) {
      const msg = this.falseOutputs[Math.floor(Math.random() * this.falseOutputs.length)];
      this.onWrong(msg);
    } else {
      this.onWrong(null);
    }
  }

  _spark(el) {
    const rect = el.getBoundingClientRect();
    const pr = this.container.querySelector('.wirelk').getBoundingClientRect();
    this.sparkEl.style.left = `${rect.left - pr.left + rect.width / 2}px`;
    this.sparkEl.style.top = `${rect.top - pr.top + rect.height / 2}px`;
    this.sparkEl.classList.remove('active');
    void this.sparkEl.offsetWidth;
    this.sparkEl.classList.add('active');
    setTimeout(() => this.sparkEl.classList.remove('active'), 400);
  }

  reset() {
    this.connections = {};
    this.locked = {};
    this._drawAll();
  }

  _injectStyles() {
    if (document.getElementById('wirelk-css')) return;
    const s = document.createElement('style');
    s.id = 'wirelk-css';
    s.textContent = `
.wirelk{position:relative;display:flex;justify-content:space-between;align-items:stretch;padding:24px 0 60px;min-height:220px;user-select:none;-webkit-user-select:none;gap:40px}
.wirelk-canvas{position:absolute;inset:0;pointer-events:none;z-index:1}
.wirelk-col{display:flex;flex-direction:column;justify-content:space-around;gap:12px;z-index:2;max-width:40%}
.wirelk-left .wirelk-terminal{display:flex;align-items:center;gap:6px;justify-content:flex-end}
.wirelk-right .wirelk-terminal{display:flex;align-items:center;gap:6px}
.wirelk-dot{width:24px;height:24px;border-radius:50%;border:2px solid var(--border,#1e2a45);cursor:pointer;flex-shrink:0;transition:box-shadow .2s}
.wirelk-dot:hover{box-shadow:0 0 10px rgba(255,255,255,.2)}
.wirelk-socket{background:var(--surface,#141b2d)!important}
.wirelk-label{font-size:11px;color:var(--muted,#7a8ba8);font-weight:600}
.wirelk-spark{position:absolute;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%;pointer-events:none;z-index:3;opacity:0;transition:opacity .1s}
.wirelk-spark.active{opacity:1;box-shadow:0 0 20px 10px #ef4444,0 0 40px 20px #ff8800;animation:wirelk-zap .4s}
@keyframes wirelk-zap{0%{transform:scale(1)}50%{transform:scale(3)}100%{transform:scale(0);opacity:0}}
.wirelk-btn{position:absolute;bottom:0;left:50%;transform:translateX(-50%);padding:10px 28px;border:none;border-radius:8px;background:var(--accent,#3b82f6);color:#fff;font-size:14px;font-weight:600;cursor:pointer;z-index:2;letter-spacing:.5px;transition:opacity .2s}
.wirelk-btn:active{opacity:.7}
`;
    document.head.appendChild(s);
  }
}
