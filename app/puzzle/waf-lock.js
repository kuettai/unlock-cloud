/**
 * WAF Rule Lock Puzzle
 *
 * Requests scroll by. Player builds rules (action + match + value) to filter malicious ones.
 *
 * Usage:
 *   new WafLock(containerEl, {
 *     requests: [
 *       { method: 'GET', path: '/api/data', ip: '10.0.1.5', label: 'legit', malicious: false },
 *       { method: 'POST', path: '/admin/login', ip: '203.0.113.50', label: 'brute force', malicious: true },
 *     ],
 *     rules: [
 *       { match: 'path', options: ['/admin/*','/api/*','/'], answer: '/admin/*', action: 'block' },
 *     ],
 *     onSubmit(correct) { ... }
 *   });
 */

class WafLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.requests = opts.requests || [];
    this.rules = opts.rules || [];
    this.onSubmit = opts.onSubmit || (() => {});
    this.selections = this.rules.map(() => ({ match: '', action: '' }));
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'waflk';

    // Traffic log
    const log = document.createElement('div');
    log.className = 'waflk-log';
    const logTitle = document.createElement('div');
    logTitle.className = 'waflk-section';
    logTitle.textContent = 'Incoming Traffic';
    log.appendChild(logTitle);
    this.requests.forEach(r => {
      const line = document.createElement('div');
      line.className = `waflk-req ${r.malicious ? 'waflk-mal' : 'waflk-ok'}`;
      line.textContent = `${r.method} ${r.path} [${r.ip}] — ${r.label}`;
      log.appendChild(line);
    });
    wrap.appendChild(log);

    // Rule builder
    const ruleSection = document.createElement('div');
    ruleSection.className = 'waflk-section';
    ruleSection.textContent = 'Build WAF Rules';
    wrap.appendChild(ruleSection);

    this.ruleEls = [];
    this.rules.forEach((rule, i) => {
      const row = document.createElement('div');
      row.className = 'waflk-rule';

      const actSel = document.createElement('select');
      actSel.className = 'waflk-sel';
      ['— action —','block','allow'].forEach(o => { const opt = document.createElement('option'); opt.value = o === '— action —' ? '' : o; opt.textContent = o.toUpperCase(); actSel.appendChild(opt); });
      actSel.addEventListener('change', () => { this.selections[i].action = actSel.value; });

      const matchLbl = document.createElement('span');
      matchLbl.className = 'waflk-match';
      matchLbl.textContent = `if ${rule.match} =`;

      const valSel = document.createElement('select');
      valSel.className = 'waflk-sel';
      const def = document.createElement('option'); def.value = ''; def.textContent = '— value —'; valSel.appendChild(def);
      rule.options.forEach(o => { const opt = document.createElement('option'); opt.value = o; opt.textContent = o; valSel.appendChild(opt); });
      valSel.addEventListener('change', () => { this.selections[i].match = valSel.value; });

      row.appendChild(actSel);
      row.appendChild(matchLbl);
      row.appendChild(valSel);
      wrap.appendChild(row);
      this.ruleEls.push(row);
    });

    const btn = document.createElement('button');
    btn.className = 'waflk-btn';
    btn.textContent = 'Deploy Rules';
    btn.addEventListener('click', () => this._test());
    wrap.appendChild(btn);

    this.statusEl = document.createElement('div');
    this.statusEl.className = 'waflk-status';
    wrap.appendChild(this.statusEl);

    this.container.appendChild(wrap);
    this._injectStyles();
  }

  _test() {
    let ok = true;
    this.rules.forEach((rule, i) => {
      const correct = this.selections[i].match === rule.answer && this.selections[i].action === rule.action;
      this.ruleEls[i].classList.toggle('waflk-correct', correct);
      if (!correct) { ok = false; this.ruleEls[i].classList.add('waflk-wrong'); setTimeout(() => this.ruleEls[i].classList.remove('waflk-wrong'), 600); }
    });
    this.statusEl.textContent = ok ? '✅ WAF rules deployed!' : '❌ Traffic still getting through';
    if (ok) setTimeout(() => this.onSubmit(true), 400);
  }

  reset() { this.selections = this.rules.map(() => ({ match: '', action: '' })); this._render(); }

  _injectStyles() {
    if (document.getElementById('waflk-css')) return;
    const s = document.createElement('style'); s.id = 'waflk-css';
    s.textContent = `
.waflk{display:flex;flex-direction:column;gap:10px;padding:16px 0;max-width:400px;margin:0 auto}
.waflk-section{font-size:11px;color:#7a8ba8;text-transform:uppercase;letter-spacing:1px}
.waflk-log{background:#0c0c0c;border:1px solid #1e2a45;border-radius:8px;padding:10px;max-height:120px;overflow-y:auto;font-family:monospace;font-size:11px}
.waflk-req{padding:3px 0}
.waflk-mal{color:#ef4444}
.waflk-ok{color:#7a8ba8}
.waflk-rule{display:flex;align-items:center;gap:8px;padding:10px;background:#141b2d;border:2px solid #1e2a45;border-radius:8px;transition:all .2s}
.waflk-rule.waflk-correct{border-color:#22c55e}
.waflk-rule.waflk-wrong{animation:waflk-sh .4s;border-color:#ef4444}
@keyframes waflk-sh{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
.waflk-sel{padding:6px;background:#0a0e17;border:1px solid #1e2a45;border-radius:4px;color:#e0e6f0;font-size:11px}
.waflk-match{font-size:12px;color:#7a8ba8;white-space:nowrap}
.waflk-btn{padding:12px 28px;border:none;border-radius:8px;background:#3b82f6;color:#fff;font-size:14px;font-weight:600;cursor:pointer;align-self:center}
.waflk-btn:active{opacity:.7}
.waflk-status{font-size:13px;color:#7a8ba8;text-align:center;min-height:18px}
`;
    document.head.appendChild(s);
  }
}
