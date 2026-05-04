/**
 * CloudWatch Alarm Lock Puzzle
 *
 * Configure alarm: metric, threshold, period, action. Animated metric graph.
 *
 * Usage:
 *   new AlarmLock(containerEl, {
 *     fields: [
 *       { label: 'Metric', options: ['CPUUtilization','NetworkIn','DiskReadOps'], answer: 'CPUUtilization' },
 *       { label: 'Threshold', options: ['> 50%','> 70%','> 90%'], answer: '> 80%' },
 *       { label: 'Period', options: ['1 min','5 min','15 min'], answer: '5 min' },
 *       { label: 'Action', options: ['SNS Alert','Auto Scale','Reboot'], answer: 'SNS Alert' },
 *     ],
 *     onSubmit(correct) { ... }
 *   });
 */

class AlarmLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.fields = opts.fields || [];
    this.onSubmit = opts.onSubmit || (() => {});
    this.selections = new Array(this.fields.length).fill('');
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'almlk';

    // Mini graph
    const graph = document.createElement('div');
    graph.className = 'almlk-graph';
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 80;
    graph.appendChild(canvas);
    wrap.appendChild(graph);
    this._drawGraph(canvas);

    this.fieldEls = [];
    this.fields.forEach((f, i) => {
      const row = document.createElement('div');
      row.className = 'almlk-row';
      const lbl = document.createElement('span');
      lbl.className = 'almlk-label';
      lbl.textContent = f.label;
      const sel = document.createElement('select');
      sel.className = 'almlk-sel';
      const def = document.createElement('option'); def.value = ''; def.textContent = '—'; sel.appendChild(def);
      f.options.forEach(o => { const opt = document.createElement('option'); opt.value = o; opt.textContent = o; sel.appendChild(opt); });
      sel.addEventListener('change', () => { this.selections[i] = sel.value; });
      row.appendChild(lbl);
      row.appendChild(sel);
      wrap.appendChild(row);
      this.fieldEls.push({ row, sel });
    });

    const btn = document.createElement('button');
    btn.className = 'almlk-btn';
    btn.textContent = 'Create Alarm';
    btn.addEventListener('click', () => this._test());
    wrap.appendChild(btn);

    this.statusEl = document.createElement('div');
    this.statusEl.className = 'almlk-status';
    wrap.appendChild(this.statusEl);

    this.container.appendChild(wrap);
    this._injectStyles();
  }

  _drawGraph(canvas) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    // Fake metric data
    const data = [20,25,30,35,50,65,80,85,90,88,75,60,45,40,35,30,28,25,30,45,70,85,92,88];
    ctx.strokeStyle = '#1e2a45';
    ctx.lineWidth = 1;
    // Threshold line
    ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(0, h * 0.2); ctx.lineTo(w, h * 0.2); ctx.stroke();
    ctx.setLineDash([]);
    // Data line
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - (v / 100) * h;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    // Alarm zone
    ctx.fillStyle = 'rgba(239,68,68,0.1)';
    ctx.fillRect(0, 0, w, h * 0.2);
  }

  _test() {
    let ok = true;
    this.fields.forEach((f, i) => {
      const correct = this.selections[i] === f.answer;
      this.fieldEls[i].row.classList.toggle('almlk-correct', correct);
      if (!correct) { ok = false; this.fieldEls[i].row.classList.add('almlk-wrong'); setTimeout(() => this.fieldEls[i].row.classList.remove('almlk-wrong'), 600); }
    });
    this.statusEl.textContent = ok ? '✅ Alarm created!' : '❌ Alarm misconfigured';
    if (ok) setTimeout(() => this.onSubmit(true), 400);
  }

  reset() { this.selections.fill(''); this.fieldEls.forEach(f => { f.sel.value = ''; f.row.classList.remove('almlk-correct','almlk-wrong'); }); this.statusEl.textContent = ''; }

  _injectStyles() {
    if (document.getElementById('almlk-css')) return;
    const s = document.createElement('style'); s.id = 'almlk-css';
    s.textContent = `
.almlk{display:flex;flex-direction:column;gap:10px;padding:16px 0;max-width:360px;margin:0 auto}
.almlk-graph{background:#0c0c0c;border:1px solid var(--border,#1e2a45);border-radius:8px;padding:8px;display:flex;justify-content:center}
.almlk-graph canvas{display:block}
.almlk-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 12px;background:var(--surface,#141b2d);border:2px solid var(--border,#1e2a45);border-radius:8px;transition:all .2s}
.almlk-row.almlk-correct{border-color:var(--green,#22c55e)}
.almlk-row.almlk-wrong{animation:almlk-sh .4s;border-color:#ef4444}
@keyframes almlk-sh{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
.almlk-label{font-size:13px;color:var(--muted,#7a8ba8);font-weight:600}
.almlk-sel{padding:6px;background:var(--bg,#0a0e17);border:1px solid var(--border,#1e2a45);border-radius:6px;color:var(--text,#e0e6f0);font-size:12px}
.almlk-btn{padding:12px 28px;border:none;border-radius:8px;background:var(--accent,#3b82f6);color:#fff;font-size:14px;font-weight:600;cursor:pointer;align-self:center}
.almlk-btn:active{opacity:.7}
.almlk-status{font-size:13px;color:var(--muted,#7a8ba8);text-align:center;min-height:18px}
`;
    document.head.appendChild(s);
  }
}
