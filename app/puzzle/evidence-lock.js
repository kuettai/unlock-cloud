class EvidenceLock {
  constructor(el, opts) {
    this.el = el;
    this.cfg = opts.config || opts;
    this.onSubmit = opts.onSubmit;
    this.onWrong = opts.onWrong;
    this.steps = this.cfg.steps;
    this.step = 0;
    this.attempts = 0;
    this._injectStyles();
    this._render();
  }
  _injectStyles() {
    if (document.getElementById('evlk-style')) return;
    const s = document.createElement('style'); s.id = 'evlk-style';
    s.textContent = `
.evlk-wrap{max-width:420px;margin:0 auto;padding:8px 0}
.evlk-progress{display:flex;gap:3px;margin-bottom:12px}
.evlk-bar{flex:1;height:4px;border-radius:2px;background:#333}
.evlk-bar.done{background:#2ecc71}
.evlk-bar.active{background:#f39c12}
.evlk-narrative{background:var(--surface,#2a2a4e);border-left:3px solid #f39c12;border-radius:0 6px 6px 0;padding:12px;margin-bottom:12px;font-size:13px;color:#ccc;line-height:1.5;font-style:italic}
.evlk-detail{color:#f39c12;font-weight:bold;margin-top:8px;font-style:normal;text-align:center;font-size:14px}
.evlk-input{background:var(--bg,#1a1a2e);border:1px solid var(--border,#444);border-radius:8px;padding:12px;text-align:center}
.evlk-prompt{font-size:13px;color:var(--text,#eee);margin-bottom:10px}
.evlk-row{display:flex;align-items:center;justify-content:center;gap:8px}
.evlk-num{width:70px;padding:8px;background:var(--surface,#2a2a4e);border:2px solid #f39c12;border-radius:6px;color:#f39c12;font-size:1.3rem;text-align:center;font-family:monospace}
.evlk-num.wrong{border-color:#e74c3c}
.evlk-go{padding:8px 14px;border:none;border-radius:6px;background:var(--accent,#e94560);color:#fff;font-size:14px;font-weight:600;cursor:pointer}
.evlk-hint{font-size:11px;color:#666;margin-top:8px;min-height:16px}
.evlk-complete{background:#1a3320;border:2px solid #2ecc71;border-radius:10px;padding:1.2rem;text-align:center}
.evlk-complete-title{font-size:1rem;color:#2ecc71;margin-bottom:10px}
.evlk-evidence{text-align:left;font-size:12px;color:#ccc;line-height:1.6}
.evlk-evidence div{border-left:3px solid;padding-left:10px;margin-bottom:6px}`;
    document.head.appendChild(s);
  }
  _render() {
    if (this.step >= this.steps.length) {
      this.el.innerHTML = `<div class="evlk-wrap"><div class="evlk-complete">
        <div class="evlk-complete-title">📋 Evidence Board — Complete</div>
        <div class="evlk-evidence">
          <div style="border-color:#2ecc71">25 cups used (full sleeve — empty)</div>
          <div style="border-color:#3498db">17 sales (cash matches perfectly)</div>
          <div style="border-color:#f39c12">21 in wash = 17 yours + <strong style="color:#e94560">4 mystery</strong></div>
          <div style="border-color:#e94560">4 on corner table = served to <strong style="color:#e94560">no one you saw</strong></div>
          <div style="border-color:#9b59b6">Shot counter: 21 = 13 orders + 1 calibration + 4 mystery + <strong style="color:#e94560">3 unexplained</strong></div>
        </div>
      </div></div>`;
      this.onSubmit();
      return;
    }
    const st = this.steps[this.step];
    const progress = this.steps.map((_, i) => `<div class="evlk-bar${i < this.step ? ' done' : i === this.step ? ' active' : ''}"></div>`).join('');
    this.el.innerHTML = `<div class="evlk-wrap">
      <div class="evlk-progress">${progress}</div>
      <div class="evlk-narrative">${st.narrative}${st.detail ? `<div class="evlk-detail">${st.detail}</div>` : ''}</div>
      <div class="evlk-input">
        <div class="evlk-prompt">${st.prompt}</div>
        <div class="evlk-row"><input type="number" class="evlk-num" id="evlk-inp"><button class="evlk-go" id="evlk-go">→</button></div>
        <div class="evlk-hint" id="evlk-hint"></div>
      </div>
    </div>`;
    const inp = this.el.querySelector('#evlk-inp');
    this.el.querySelector('#evlk-go').addEventListener('click', () => this._check());
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') this._check(); });
    setTimeout(() => inp.focus(), 50);
  }
  _check() {
    const inp = this.el.querySelector('#evlk-inp');
    const val = parseInt(inp.value);
    if (isNaN(val)) return;
    const st = this.steps[this.step];
    if (val === st.answer) { this.attempts = 0; this.step++; this._render(); }
    else {
      this.attempts++;
      inp.classList.add('wrong');
      setTimeout(() => inp.classList.remove('wrong'), 400);
      if (this.attempts >= (this.cfg.hintsAfterAttempts || 2)) {
        this.el.querySelector('#evlk-hint').textContent = '💡 ' + st.hint;
      }
      if (this.onWrong) this.onWrong('Wrong. Try again.');
    }
  }
}
