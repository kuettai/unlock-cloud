/**
 * Subnet CIDR Lock Puzzle
 *
 * Given a VPC CIDR, player sets subnet CIDRs using dropdowns. Visual bar shows usage.
 *
 * Usage:
 *   new CidrLock(containerEl, {
 *     vpc: '10.0.0.0/16',
 *     subnets: [
 *       { label: 'Public A', options: ['/24','/25','/26'], answer: '10.0.1.0/24' },
 *       { label: 'Private A', options: ['/24','/25','/26'], answer: '10.0.2.0/24' },
 *     ],
 *     onSubmit(correct) { ... }
 *   });
 */

class CidrLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.vpc = opts.vpc || '10.0.0.0/16';
    this.subnets = opts.subnets || [];
    this.onSubmit = opts.onSubmit || (() => {});
    this.selections = new Array(this.subnets.length).fill('');
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'cidrlk';

    const vpcEl = document.createElement('div');
    vpcEl.className = 'cidrlk-vpc';
    vpcEl.innerHTML = `VPC: <b>${this.vpc}</b>`;
    wrap.appendChild(vpcEl);

    this.subEls = [];
    this.subnets.forEach((sub, i) => {
      const row = document.createElement('div');
      row.className = 'cidrlk-row';
      const lbl = document.createElement('span');
      lbl.className = 'cidrlk-label';
      lbl.textContent = sub.label;
      row.appendChild(lbl);
      const sel = document.createElement('select');
      sel.className = 'cidrlk-sel';
      const def = document.createElement('option');
      def.value = '';
      def.textContent = '— select CIDR —';
      sel.appendChild(def);
      sub.options.forEach(o => { const opt = document.createElement('option'); opt.value = o; opt.textContent = o; sel.appendChild(opt); });
      sel.addEventListener('change', () => { this.selections[i] = sel.value; });
      row.appendChild(sel);
      wrap.appendChild(row);
      this.subEls.push({ row, sel });
    });

    const btn = document.createElement('button');
    btn.className = 'cidrlk-btn';
    btn.textContent = 'Create Subnets';
    btn.addEventListener('click', () => this._test());
    wrap.appendChild(btn);

    this.statusEl = document.createElement('div');
    this.statusEl.className = 'cidrlk-status';
    wrap.appendChild(this.statusEl);

    this.container.appendChild(wrap);
    this._injectStyles();
  }

  _test() {
    let ok = true;
    this.subnets.forEach((sub, i) => {
      const correct = this.selections[i] === sub.answer;
      this.subEls[i].row.classList.toggle('cidrlk-correct', correct);
      if (!correct) { ok = false; this.subEls[i].row.classList.add('cidrlk-wrong'); setTimeout(() => this.subEls[i].row.classList.remove('cidrlk-wrong'), 600); }
    });
    this.statusEl.textContent = ok ? '✅ Subnets created!' : '❌ CIDR conflict or wrong range';
    if (ok) setTimeout(() => this.onSubmit(true), 400);
  }

  reset() { this.selections.fill(''); this.subEls.forEach(s => { s.sel.value = ''; s.row.classList.remove('cidrlk-correct','cidrlk-wrong'); }); this.statusEl.textContent = ''; }

  _injectStyles() {
    if (document.getElementById('cidrlk-css')) return;
    const s = document.createElement('style'); s.id = 'cidrlk-css';
    s.textContent = `
.cidrlk{display:flex;flex-direction:column;gap:12px;padding:16px 0;max-width:360px;margin:0 auto}
.cidrlk-vpc{font-size:14px;color:var(--muted,#7a8ba8);text-align:center}
.cidrlk-vpc b{color:var(--accent,#3b82f6)}
.cidrlk-row{display:flex;align-items:center;gap:10px;padding:10px;background:var(--surface,#141b2d);border:2px solid var(--border,#1e2a45);border-radius:8px;transition:all .2s}
.cidrlk-row.cidrlk-correct{border-color:var(--green,#22c55e)}
.cidrlk-row.cidrlk-wrong{animation:cidrlk-sh .4s;border-color:#ef4444}
@keyframes cidrlk-sh{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
.cidrlk-label{font-size:13px;color:var(--text,#e0e6f0);font-weight:600;min-width:80px}
.cidrlk-sel{flex:1;padding:8px;background:var(--bg,#0a0e17);border:1px solid var(--border,#1e2a45);border-radius:6px;color:var(--text,#e0e6f0);font-size:12px;font-family:monospace}
.cidrlk-btn{padding:12px 28px;border:none;border-radius:8px;background:var(--accent,#3b82f6);color:#fff;font-size:14px;font-weight:600;cursor:pointer;align-self:center}
.cidrlk-btn:active{opacity:.7}
.cidrlk-status{font-size:13px;color:var(--muted,#7a8ba8);text-align:center;min-height:18px}
`;
    document.head.appendChild(s);
  }
}
