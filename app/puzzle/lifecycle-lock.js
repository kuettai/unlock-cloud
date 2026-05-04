/**
 * S3 Lifecycle Lock Puzzle
 *
 * Set day thresholds for lifecycle transitions on a timeline.
 *
 * Usage:
 *   new LifecycleLock(containerEl, {
 *     stages: [
 *       { label: 'Standard → IA', min: 30, max: 180, step: 30, answer: 30 },
 *       { label: 'IA → Glacier', min: 60, max: 365, step: 30, answer: 90 },
 *       { label: 'Glacier → Delete', min: 180, max: 730, step: 30, answer: 365 },
 *     ],
 *     onSubmit(correct) { ... }
 *   });
 */

class LifecycleLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.stages = opts.stages || [];
    this.onSubmit = opts.onSubmit || (() => {});
    this.values = this.stages.map(s => s.min);
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'lflk';

    const title = document.createElement('div');
    title.className = 'lflk-title';
    title.textContent = 'S3 Lifecycle Policy';
    wrap.appendChild(title);

    // Timeline visual
    this.timelineEl = document.createElement('div');
    this.timelineEl.className = 'lflk-timeline';
    wrap.appendChild(this.timelineEl);

    this.sliderEls = [];
    this.stages.forEach((stage, i) => {
      const row = document.createElement('div');
      row.className = 'lflk-row';
      const lbl = document.createElement('span');
      lbl.className = 'lflk-label';
      lbl.textContent = stage.label;
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = stage.min;
      slider.max = stage.max;
      slider.step = stage.step;
      slider.value = stage.min;
      slider.className = 'lflk-slider';
      const val = document.createElement('span');
      val.className = 'lflk-val';
      val.textContent = `${stage.min}d`;
      slider.addEventListener('input', () => {
        this.values[i] = parseInt(slider.value);
        val.textContent = `${slider.value}d`;
        this._updateTimeline();
      });
      row.appendChild(lbl);
      row.appendChild(slider);
      row.appendChild(val);
      wrap.appendChild(row);
      this.sliderEls.push({ row, slider, val });
    });

    const btn = document.createElement('button');
    btn.className = 'lflk-btn';
    btn.textContent = 'Apply Policy';
    btn.addEventListener('click', () => this._test());
    wrap.appendChild(btn);

    this.statusEl = document.createElement('div');
    this.statusEl.className = 'lflk-status';
    wrap.appendChild(this.statusEl);

    this.container.appendChild(wrap);
    this._injectStyles();
    this._updateTimeline();
  }

  _updateTimeline() {
    const colors = ['#3b82f6','#eab308','#7a8ba8','#ef4444'];
    const labels = ['Standard','IA','Glacier','Delete'];
    const maxDay = Math.max(...this.values, 400);
    let html = '';
    let prev = 0;
    this.values.forEach((v, i) => {
      const w = ((v - prev) / maxDay) * 100;
      html += `<div class="lflk-seg" style="width:${w}%;background:${colors[i]}">${labels[i]}</div>`;
      prev = v;
    });
    html += `<div class="lflk-seg" style="flex:1;background:${colors[colors.length - 1]}">${labels[labels.length - 1]}</div>`;
    this.timelineEl.innerHTML = html;
  }

  _test() {
    let ok = true;
    // Check ordering and correct values
    this.stages.forEach((stage, i) => {
      const correct = this.values[i] === stage.answer;
      this.sliderEls[i].row.classList.toggle('lflk-correct', correct);
      if (!correct) { ok = false; this.sliderEls[i].row.classList.add('lflk-wrong'); setTimeout(() => this.sliderEls[i].row.classList.remove('lflk-wrong'), 600); }
    });
    // Check ordering
    for (let i = 1; i < this.values.length; i++) {
      if (this.values[i] <= this.values[i - 1]) { ok = false; this.statusEl.textContent = '❌ Stages must be in order!'; return; }
    }
    this.statusEl.textContent = ok ? '✅ Lifecycle policy applied!' : '❌ Wrong thresholds';
    if (ok) setTimeout(() => this.onSubmit(true), 400);
  }

  reset() { this.values = this.stages.map(s => s.min); this._render(); }

  _injectStyles() {
    if (document.getElementById('lflk-css')) return;
    const s = document.createElement('style'); s.id = 'lflk-css';
    s.textContent = `
.lflk{display:flex;flex-direction:column;gap:12px;padding:16px 0;max-width:360px;margin:0 auto}
.lflk-title{font-size:13px;color:var(--muted,#7a8ba8);font-weight:600;text-align:center}
.lflk-timeline{display:flex;height:28px;border-radius:6px;overflow:hidden;border:1px solid var(--border,#1e2a45)}
.lflk-seg{display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff;min-width:20px;transition:width .2s;text-transform:uppercase;letter-spacing:.5px}
.lflk-row{display:flex;align-items:center;gap:8px;transition:all .2s}
.lflk-row.lflk-correct .lflk-label{color:var(--green,#22c55e)}
.lflk-row.lflk-wrong{animation:lflk-sh .4s}
@keyframes lflk-sh{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
.lflk-label{font-size:12px;color:var(--muted,#7a8ba8);font-weight:600;min-width:110px;white-space:nowrap}
.lflk-slider{flex:1}
.lflk-val{font-size:13px;font-weight:700;color:var(--accent,#3b82f6);min-width:36px;text-align:right;font-variant-numeric:tabular-nums}
.lflk-btn{padding:12px 28px;border:none;border-radius:8px;background:var(--accent,#3b82f6);color:#fff;font-size:14px;font-weight:600;cursor:pointer;align-self:center}
.lflk-btn:active{opacity:.7}
.lflk-status{font-size:13px;color:var(--muted,#7a8ba8);text-align:center;min-height:18px}
`;
    document.head.appendChild(s);
  }
}
