/**
 * Cost Calculator Lock Puzzle
 *
 * Adjust inputs (dropdowns/sliders) to hit a target monthly cost.
 *
 * Usage:
 *   new CostLock(containerEl, {
 *     target: 150.00,
 *     tolerance: 5,
 *     inputs: [
 *       { label: 'Instance Type', type: 'select', options: [{label:'t3.micro',cost:8},{label:'t3.small',cost:15},{label:'m5.large',cost:70}] },
 *       { label: 'Count', type: 'slider', min: 1, max: 10, step: 1, costPer: 1 },  // cost = value * costPer * selected instance
 *       { label: 'Storage (GB)', type: 'slider', min: 10, max: 500, step: 10, costPer: 0.10 },
 *     ],
 *     costFn(values) { return values[0].cost * values[1] + values[2] * 0.10; },
 *     onSubmit(correct) { ... }
 *   });
 */

class CostLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.target = opts.target || 100;
    this.tolerance = opts.tolerance || 5;
    this.inputs = opts.inputs || [];
    this.costFn = opts.costFn || (() => 0);
    this.onSubmit = opts.onSubmit || (() => {});
    this.values = this.inputs.map(inp => inp.type === 'select' ? inp.options[0] : inp.min);
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'cstlk';

    // Target display
    const targetEl = document.createElement('div');
    targetEl.className = 'cstlk-target';
    targetEl.innerHTML = `Target: <b>$${this.target.toFixed(2)}/mo</b>`;
    wrap.appendChild(targetEl);

    // Current cost
    this.costEl = document.createElement('div');
    this.costEl.className = 'cstlk-current';
    wrap.appendChild(this.costEl);

    // Inputs
    this.inputs.forEach((inp, i) => {
      const row = document.createElement('div');
      row.className = 'cstlk-row';
      const lbl = document.createElement('span');
      lbl.className = 'cstlk-label';
      lbl.textContent = inp.label;
      row.appendChild(lbl);

      if (inp.type === 'select') {
        const sel = document.createElement('select');
        sel.className = 'cstlk-sel';
        inp.options.forEach((o, oi) => {
          const opt = document.createElement('option');
          opt.value = oi;
          opt.textContent = `${o.label} ($${o.cost})`;
          sel.appendChild(opt);
        });
        sel.addEventListener('change', () => { this.values[i] = inp.options[parseInt(sel.value)]; this._updateCost(); });
        row.appendChild(sel);
      } else {
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = inp.min;
        slider.max = inp.max;
        slider.step = inp.step;
        slider.value = inp.min;
        slider.className = 'cstlk-slider';
        const val = document.createElement('span');
        val.className = 'cstlk-val';
        val.textContent = inp.min;
        slider.addEventListener('input', () => { this.values[i] = parseFloat(slider.value); val.textContent = slider.value; this._updateCost(); });
        row.appendChild(slider);
        row.appendChild(val);
      }
      wrap.appendChild(row);
    });

    const btn = document.createElement('button');
    btn.className = 'cstlk-btn';
    btn.textContent = 'Submit Estimate';
    btn.addEventListener('click', () => this._test());
    wrap.appendChild(btn);

    this.statusEl = document.createElement('div');
    this.statusEl.className = 'cstlk-status';
    wrap.appendChild(this.statusEl);

    this.container.appendChild(wrap);
    this._injectStyles();
    this._updateCost();
  }

  _updateCost() {
    const cost = this.costFn(this.values);
    this.costEl.innerHTML = `Your estimate: <b>$${cost.toFixed(2)}/mo</b>`;
    const diff = Math.abs(cost - this.target);
    this.costEl.classList.toggle('cstlk-close', diff <= this.tolerance);
  }

  _test() {
    const cost = this.costFn(this.values);
    if (Math.abs(cost - this.target) <= this.tolerance) {
      this.statusEl.textContent = '✅ Budget approved!';
      setTimeout(() => this.onSubmit(true), 400);
    } else {
      this.statusEl.textContent = cost > this.target ? '❌ Over budget!' : '❌ Under-provisioned!';
      this.costEl.classList.add('cstlk-shake');
      setTimeout(() => this.costEl.classList.remove('cstlk-shake'), 600);
    }
  }

  reset() { this.values = this.inputs.map(inp => inp.type === 'select' ? inp.options[0] : inp.min); this._render(); }

  _injectStyles() {
    if (document.getElementById('cstlk-css')) return;
    const s = document.createElement('style');
    s.id = 'cstlk-css';
    s.textContent = `
.cstlk{display:flex;flex-direction:column;gap:12px;padding:16px 0;max-width:340px;margin:0 auto}
.cstlk-target{font-size:14px;color:var(--muted,#7a8ba8);text-align:center}
.cstlk-target b{color:var(--accent,#3b82f6)}
.cstlk-current{font-size:16px;color:var(--muted,#7a8ba8);text-align:center;transition:color .2s}
.cstlk-current b{color:var(--text,#e0e6f0)}
.cstlk-current.cstlk-close b{color:var(--green,#22c55e)}
.cstlk-shake{animation:cstlk-sh .4s}
@keyframes cstlk-sh{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
.cstlk-row{display:flex;align-items:center;gap:10px}
.cstlk-label{font-size:13px;color:var(--muted,#7a8ba8);font-weight:600;min-width:90px}
.cstlk-sel{flex:1;padding:6px;background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);border-radius:6px;color:var(--text,#e0e6f0);font-size:12px}
.cstlk-slider{flex:1}
.cstlk-val{font-size:13px;font-weight:700;color:var(--accent,#3b82f6);min-width:30px;text-align:right}
.cstlk-btn{padding:12px 28px;border:none;border-radius:8px;background:var(--accent,#3b82f6);color:#fff;font-size:14px;font-weight:600;cursor:pointer;align-self:center}
.cstlk-btn:active{opacity:.7}
.cstlk-status{font-size:13px;color:var(--muted,#7a8ba8);text-align:center;min-height:18px}
`;
    document.head.appendChild(s);
  }
}
