/**
 * JSON Policy Lock Puzzle
 *
 * JSON editor with blanks. Player fills in missing values in an IAM-style policy.
 *
 * Usage:
 *   new PolicyLock(containerEl, {
 *     template: '{\n  "Effect": "___",\n  "Action": "___",\n  "Resource": "___"\n}',
 *     blanks: [
 *       { placeholder: '___', answer: 'Allow', options: ['Allow','Deny'] },
 *       { placeholder: '___', answer: 's3:GetObject', options: ['s3:GetObject','s3:*','ec2:*'] },
 *       { placeholder: '___', answer: 'arn:aws:s3:::my-bucket/*', options: ['*','arn:aws:s3:::my-bucket/*'] },
 *     ],
 *     onSubmit(correct) { ... }
 *   });
 */

class PolicyLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.template = opts.template || '';
    this.blanks = opts.blanks || [];
    this.onSubmit = opts.onSubmit || (() => {});
    this.selections = new Array(this.blanks.length).fill('');
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'pollk';

    const code = document.createElement('div');
    code.className = 'pollk-code';

    // Split template by ___ and interleave dropdowns
    let parts = this.template.split('___');
    this.selectEls = [];
    parts.forEach((part, i) => {
      const span = document.createElement('span');
      span.textContent = part;
      code.appendChild(span);
      if (i < this.blanks.length) {
        const sel = document.createElement('select');
        sel.className = 'pollk-select';
        const blank = this.blanks[i];
        const defOpt = document.createElement('option');
        defOpt.value = '';
        defOpt.textContent = '▼ select';
        sel.appendChild(defOpt);
        blank.options.forEach(o => {
          const opt = document.createElement('option');
          opt.value = o;
          opt.textContent = o;
          sel.appendChild(opt);
        });
        sel.addEventListener('change', () => { this.selections[i] = sel.value; });
        code.appendChild(sel);
        this.selectEls.push(sel);
      }
    });
    wrap.appendChild(code);

    const btn = document.createElement('button');
    btn.className = 'pollk-btn';
    btn.textContent = 'Apply Policy';
    btn.addEventListener('click', () => this._test());
    wrap.appendChild(btn);

    this.statusEl = document.createElement('div');
    this.statusEl.className = 'pollk-status';
    wrap.appendChild(this.statusEl);

    this.container.appendChild(wrap);
    this._injectStyles();
  }

  _test() {
    let allCorrect = true;
    this.blanks.forEach((b, i) => {
      const correct = this.selections[i] === b.answer;
      this.selectEls[i].classList.toggle('pollk-correct', correct);
      this.selectEls[i].classList.toggle('pollk-wrong', !correct);
      if (!correct) { allCorrect = false; setTimeout(() => this.selectEls[i].classList.remove('pollk-wrong'), 600); }
    });
    if (allCorrect) { this.statusEl.textContent = '✅ Policy applied!'; setTimeout(() => this.onSubmit(true), 400); }
    else this.statusEl.textContent = '❌ Policy has errors';
  }

  reset() { this.selections.fill(''); this.selectEls.forEach(s => { s.value = ''; s.classList.remove('pollk-correct','pollk-wrong'); }); this.statusEl.textContent = ''; }

  _injectStyles() {
    if (document.getElementById('pollk-css')) return;
    const s = document.createElement('style');
    s.id = 'pollk-css';
    s.textContent = `
.pollk{display:flex;flex-direction:column;gap:12px;padding:16px 0;max-width:400px;margin:0 auto}
.pollk-code{background:#0c0c0c;border:1px solid #1e2a45;border-radius:8px;padding:14px;font-family:'Courier New',monospace;font-size:12px;color:#7a8ba8;white-space:pre-wrap;line-height:2}
.pollk-select{background:#141b2d;border:1px solid #3b82f6;border-radius:4px;color:#3b82f6;font-family:inherit;font-size:11px;padding:2px 4px;cursor:pointer;transition:all .2s}
.pollk-select.pollk-correct{border-color:#22c55e;color:#22c55e}
.pollk-select.pollk-wrong{border-color:#ef4444;color:#ef4444;animation:pollk-sh .4s}
@keyframes pollk-sh{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
.pollk-btn{padding:12px 28px;border:none;border-radius:8px;background:#3b82f6;color:#fff;font-size:14px;font-weight:600;cursor:pointer;align-self:center}
.pollk-btn:active{opacity:.7}
.pollk-status{font-size:13px;color:#7a8ba8;text-align:center;min-height:18px}
`;
    document.head.appendChild(s);
  }
}
