/**
 * DNS Resolver Lock Puzzle
 *
 * Chain of dropdown selects tracing a DNS resolution path.
 *
 * Usage:
 *   new DnsLock(containerEl, {
 *     steps: [
 *       { label: 'Domain', options: ['app.example.com','api.example.com'], answer: 'app.example.com' },
 *       { label: 'Hosted Zone', options: ['example.com','example.org'], answer: 'example.com' },
 *       { label: 'Record Type', options: ['A','CNAME','AAAA','MX'], answer: 'CNAME' },
 *       { label: 'Target', options: ['d1234.cloudfront.net','10.0.1.5','mail.example.com'], answer: 'd1234.cloudfront.net' },
 *     ],
 *     onSubmit(correct) { ... }
 *   });
 */

class DnsLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.steps = opts.steps || [];
    this.onSubmit = opts.onSubmit || (() => {});
    this.selections = new Array(this.steps.length).fill('');
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'dnslk';

    const title = document.createElement('div');
    title.className = 'dnslk-title';
    title.textContent = 'Trace the DNS resolution path';
    wrap.appendChild(title);

    this.stepEls = [];
    this.steps.forEach((step, i) => {
      const row = document.createElement('div');
      row.className = 'dnslk-step';
      if (i > 0) {
        const arrow = document.createElement('div');
        arrow.className = 'dnslk-arrow';
        arrow.textContent = '↓';
        wrap.appendChild(arrow);
      }
      const lbl = document.createElement('div');
      lbl.className = 'dnslk-label';
      lbl.textContent = step.label;
      row.appendChild(lbl);
      const sel = document.createElement('select');
      sel.className = 'dnslk-sel';
      const def = document.createElement('option');
      def.value = '';
      def.textContent = '— select —';
      sel.appendChild(def);
      step.options.forEach(o => {
        const opt = document.createElement('option');
        opt.value = o;
        opt.textContent = o;
        sel.appendChild(opt);
      });
      sel.addEventListener('change', () => { this.selections[i] = sel.value; });
      row.appendChild(sel);
      wrap.appendChild(row);
      this.stepEls.push({ row, sel });
    });

    const btn = document.createElement('button');
    btn.className = 'dnslk-btn';
    btn.textContent = 'Resolve';
    btn.addEventListener('click', () => this._test());
    wrap.appendChild(btn);

    this.statusEl = document.createElement('div');
    this.statusEl.className = 'dnslk-status';
    wrap.appendChild(this.statusEl);

    this.container.appendChild(wrap);
    this._injectStyles();
  }

  _test() {
    let allCorrect = true;
    this.steps.forEach((step, i) => {
      const correct = this.selections[i] === step.answer;
      this.stepEls[i].row.classList.toggle('dnslk-correct', correct);
      if (!correct) {
        allCorrect = false;
        this.stepEls[i].row.classList.add('dnslk-wrong');
        setTimeout(() => this.stepEls[i].row.classList.remove('dnslk-wrong'), 600);
      }
    });
    if (allCorrect) { this.statusEl.textContent = '✅ DNS resolved!'; setTimeout(() => this.onSubmit(true), 400); }
    else this.statusEl.textContent = '❌ Resolution failed';
  }

  reset() { this.selections.fill(''); this.stepEls.forEach(s => { s.sel.value = ''; s.row.classList.remove('dnslk-correct','dnslk-wrong'); }); this.statusEl.textContent = ''; }

  _injectStyles() {
    if (document.getElementById('dnslk-css')) return;
    const s = document.createElement('style');
    s.id = 'dnslk-css';
    s.textContent = `
.dnslk{display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px 0;max-width:340px;margin:0 auto}
.dnslk-title{font-size:13px;color:var(--muted,#7a8ba8);font-weight:600;margin-bottom:4px}
.dnslk-arrow{color:var(--border,#1e2a45);font-size:18px}
.dnslk-step{width:100%;padding:10px 14px;background:var(--surface,#141b2d);border:2px solid var(--border,#1e2a45);border-radius:8px;transition:all .2s}
.dnslk-step.dnslk-correct{border-color:var(--green,#22c55e)}
.dnslk-step.dnslk-wrong{animation:dnslk-sh .4s}
@keyframes dnslk-sh{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
.dnslk-label{font-size:11px;color:var(--muted,#7a8ba8);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px}
.dnslk-sel{width:100%;padding:8px;background:var(--bg,#0a0e17);border:1px solid var(--border,#1e2a45);border-radius:6px;color:var(--text,#e0e6f0);font-size:13px}
.dnslk-btn{padding:12px 28px;border:none;border-radius:8px;background:var(--accent,#3b82f6);color:#fff;font-size:14px;font-weight:600;cursor:pointer;margin-top:4px}
.dnslk-btn:active{opacity:.7}
.dnslk-status{font-size:13px;color:var(--muted,#7a8ba8);min-height:18px}
`;
    document.head.appendChild(s);
  }
}
