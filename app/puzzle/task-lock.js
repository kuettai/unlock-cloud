/**
 * Container Task Lock Puzzle
 *
 * Drag containers into a task definition. Must fit within CPU/memory limits.
 *
 * Usage:
 *   new TaskLock(containerEl, {
 *     taskLimits: { cpu: 1024, memory: 2048 },
 *     containers: [
 *       { id: 'web', label: 'Web', icon: '🌐', cpu: 512, memory: 1024 },
 *       { id: 'sidecar', label: 'Sidecar', icon: '📡', cpu: 256, memory: 512 },
 *       { id: 'db', label: 'DB Proxy', icon: '🗄️', cpu: 256, memory: 512 },
 *       { id: 'heavy', label: 'ML Worker', icon: '🧠', cpu: 1024, memory: 2048 },  // decoy
 *     ],
 *     answer: ['web','sidecar','db'],
 *     onSubmit(correct) { ... }
 *   });
 */

class TaskLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.limits = opts.taskLimits || { cpu: 1024, memory: 2048 };
    this.containers = opts.containers || [];
    this.answer = opts.answer || [];
    this.onSubmit = opts.onSubmit || (() => {});
    this.placed = [];
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'tsklk';

    // Limits bar
    this.cpuBar = this._makeBar('CPU', this.limits.cpu);
    this.memBar = this._makeBar('Memory', this.limits.memory);
    wrap.appendChild(this.cpuBar.el);
    wrap.appendChild(this.memBar.el);

    // Container pool
    const pool = document.createElement('div');
    pool.className = 'tsklk-pool';
    this.chipEls = {};
    this.containers.forEach(c => {
      const chip = document.createElement('div');
      chip.className = 'tsklk-chip';
      chip.innerHTML = `${c.icon} ${c.label} <span class="tsklk-spec">${c.cpu}cpu / ${c.memory}MB</span>`;
      chip.addEventListener('click', () => this._toggleContainer(c.id));
      pool.appendChild(chip);
      this.chipEls[c.id] = chip;
    });
    wrap.appendChild(pool);

    // Task box
    this.taskBox = document.createElement('div');
    this.taskBox.className = 'tsklk-task';
    const taskHdr = document.createElement('div');
    taskHdr.className = 'tsklk-task-hdr';
    taskHdr.textContent = 'Task Definition';
    this.taskBox.appendChild(taskHdr);
    this.taskSlots = document.createElement('div');
    this.taskSlots.className = 'tsklk-slots';
    this.taskBox.appendChild(this.taskSlots);
    wrap.appendChild(this.taskBox);

    const btn = document.createElement('button');
    btn.className = 'tsklk-btn';
    btn.textContent = 'Register Task';
    btn.addEventListener('click', () => this._test());
    wrap.appendChild(btn);

    this.statusEl = document.createElement('div');
    this.statusEl.className = 'tsklk-status';
    wrap.appendChild(this.statusEl);

    this.container.appendChild(wrap);
    this._injectStyles();
    this._updateView();
  }

  _makeBar(label, max) {
    const el = document.createElement('div');
    el.className = 'tsklk-bar';
    el.innerHTML = `<span class="tsklk-bar-label">${label}: <b>0</b> / ${max}</span>`;
    const track = document.createElement('div');
    track.className = 'tsklk-bar-track';
    const fill = document.createElement('div');
    fill.className = 'tsklk-bar-fill';
    track.appendChild(fill);
    el.appendChild(track);
    return { el, fill, valEl: el.querySelector('b'), max };
  }

  _toggleContainer(id) {
    const idx = this.placed.indexOf(id);
    if (idx >= 0) this.placed.splice(idx, 1);
    else this.placed.push(id);
    this._updateView();
  }

  _updateView() {
    let cpu = 0, mem = 0;
    this.placed.forEach(id => { const c = this.containers.find(x => x.id === id); cpu += c.cpu; mem += c.memory; });

    this.cpuBar.valEl.textContent = cpu;
    this.cpuBar.fill.style.width = `${Math.min(100, cpu / this.cpuBar.max * 100)}%`;
    this.cpuBar.fill.classList.toggle('tsklk-over', cpu > this.cpuBar.max);
    this.memBar.valEl.textContent = mem;
    this.memBar.fill.style.width = `${Math.min(100, mem / this.memBar.max * 100)}%`;
    this.memBar.fill.classList.toggle('tsklk-over', mem > this.memBar.max);

    this.containers.forEach(c => this.chipEls[c.id].classList.toggle('tsklk-active', this.placed.includes(c.id)));

    this.taskSlots.innerHTML = '';
    this.placed.forEach(id => {
      const c = this.containers.find(x => x.id === id);
      const el = document.createElement('div');
      el.className = 'tsklk-placed';
      el.textContent = `${c.icon} ${c.label}`;
      this.taskSlots.appendChild(el);
    });
    if (!this.placed.length) this.taskSlots.innerHTML = '<span style="color:var(--muted)">Empty — tap containers to add</span>';
  }

  _test() {
    const placedSet = new Set(this.placed);
    const answerSet = new Set(this.answer);
    const correct = placedSet.size === answerSet.size && [...placedSet].every(id => answerSet.has(id));
    let cpu = 0, mem = 0;
    this.placed.forEach(id => { const c = this.containers.find(x => x.id === id); cpu += c.cpu; mem += c.memory; });
    if (cpu > this.limits.cpu || mem > this.limits.memory) {
      this.statusEl.textContent = '❌ Exceeds task limits!';
      this.taskBox.classList.add('tsklk-shake');
      setTimeout(() => this.taskBox.classList.remove('tsklk-shake'), 600);
      return;
    }
    if (correct) { this.statusEl.textContent = '✅ Task registered!'; setTimeout(() => this.onSubmit(true), 400); }
    else { this.statusEl.textContent = '❌ Wrong container set'; this.taskBox.classList.add('tsklk-shake'); setTimeout(() => this.taskBox.classList.remove('tsklk-shake'), 600); }
  }

  reset() { this.placed = []; this._updateView(); this.statusEl.textContent = ''; }

  _injectStyles() {
    if (document.getElementById('tsklk-css')) return;
    const s = document.createElement('style'); s.id = 'tsklk-css';
    s.textContent = `
.tsklk{display:flex;flex-direction:column;gap:10px;padding:16px 0;max-width:360px;margin:0 auto}
.tsklk-bar{font-size:12px;color:var(--muted,#7a8ba8)}
.tsklk-bar b{color:var(--text,#e0e6f0)}
.tsklk-bar-label{display:flex;justify-content:space-between;margin-bottom:4px}
.tsklk-bar-track{height:8px;background:var(--surface,#141b2d);border-radius:4px;overflow:hidden}
.tsklk-bar-fill{height:100%;background:var(--accent,#3b82f6);border-radius:4px;transition:width .2s}
.tsklk-bar-fill.tsklk-over{background:#ef4444}
.tsklk-pool{display:flex;flex-wrap:wrap;gap:6px}
.tsklk-chip{padding:8px 12px;background:var(--surface,#141b2d);border:2px solid var(--border,#1e2a45);border-radius:8px;font-size:12px;color:var(--text,#e0e6f0);cursor:pointer;transition:all .15s;user-select:none}
.tsklk-chip.tsklk-active{border-color:var(--accent,#3b82f6);background:#0c1a2e;color:#e0e6f0}
.tsklk-chip.tsklk-active .tsklk-spec{color:#7a8ba8}
.tsklk-spec{color:var(--muted,#7a8ba8);font-size:10px}
.tsklk-task{padding:12px;background:var(--surface,#141b2d);border:2px dashed var(--border,#1e2a45);border-radius:8px;min-height:60px;transition:all .2s}
.tsklk-task-hdr{font-size:10px;color:var(--muted,#7a8ba8);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
.tsklk-slots{display:flex;flex-wrap:wrap;gap:6px}
.tsklk-placed{padding:4px 10px;background:var(--bg,#0a0e17);border:1px solid var(--accent,#3b82f6);border-radius:6px;font-size:12px}
.tsklk-shake{animation:tsklk-sh .4s}
@keyframes tsklk-sh{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
.tsklk-btn{padding:12px 28px;border:none;border-radius:8px;background:var(--accent,#3b82f6);color:#fff;font-size:14px;font-weight:600;cursor:pointer;align-self:center}
.tsklk-btn:active{opacity:.7}
.tsklk-status{font-size:13px;color:var(--muted,#7a8ba8);text-align:center;min-height:18px}
`;
    document.head.appendChild(s);
  }
}
