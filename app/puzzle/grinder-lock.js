class GrinderLock {
  constructor(el, opts) {
    this.el = el;
    this.cfg = opts.config || opts;
    this.onSubmit = opts.onSubmit;
    this.onWrong = opts.onWrong;
    this.sliders = this.cfg.sliders;
    this.vals = this.sliders.map(s => s.default || s.min);
    this.pulling = false;
    this._injectStyles();
    this._render();
  }
  _injectStyles() {
    if (document.getElementById('grlk-style')) return;
    const s = document.createElement('style'); s.id = 'grlk-style';
    s.textContent = `
.grlk-wrap{max-width:400px;margin:0 auto;padding:8px 0}
.grlk-machine{position:relative;background:var(--bg,#1a1a2e);border:1px solid var(--border,#444);border-radius:12px;padding:1.5rem 1rem;text-align:center;overflow:hidden;margin-bottom:12px}
.grlk-body{background:#333;border-radius:8px;padding:8px;margin:0 auto;width:160px}
.grlk-body-label{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px}
.grlk-pf{margin-top:8px;position:relative;height:40px}
.grlk-pf-base{position:absolute;left:50%;transform:translateX(-50%);width:80px;height:20px;background:#555;border-radius:0 0 10px 10px;top:0}
.grlk-drip-wrap{position:absolute;left:50%;transform:translateX(-50%);width:6px;top:20px;height:20px;display:flex;justify-content:center}
.grlk-drip{width:4px;height:0;background:linear-gradient(to bottom,#3d1f0a,#5c3317);border-radius:0 0 2px 2px;transition:height 0.3s}
.grlk-cup{margin:4px auto 0;width:60px;height:45px;border:3px solid #666;border-top:none;border-radius:0 0 8px 8px;background:#111;position:relative;overflow:hidden}
.grlk-fill{position:absolute;bottom:0;left:0;right:0;height:0;background:linear-gradient(to top,#2c1810,#5c3317);transition:height 1s}
.grlk-saucer{width:80px;height:6px;background:#444;border-radius:3px;margin:0 auto}
.grlk-timer{margin-top:12px;font-size:2rem;font-weight:bold;color:#888}
.grlk-timer-unit{font-size:0.8rem;color:#666}
.grlk-target{font-size:11px;color:#555}
.grlk-quality{margin-top:8px;font-size:13px;color:#888;min-height:20px}
.grlk-slider{margin-bottom:10px;background:var(--surface,#2a2a4e);border-radius:6px;padding:10px}
.grlk-slider-head{display:flex;justify-content:space-between;font-size:12px}
.grlk-slider-sub{font-size:10px;color:#666;margin-bottom:4px}
.grlk-slider input{width:100%;accent-color:var(--accent,#e94560)}
.grlk-note{background:#f5e6a3;border-radius:4px;padding:8px 10px;margin-top:10px;transform:rotate(-1deg);box-shadow:2px 2px 6px rgba(0,0,0,0.3)}
.grlk-note-title{font-size:10px;color:#5a4a00;font-family:'Comic Sans MS',cursive}
.grlk-note-body{font-size:12px;color:#3a2a00;font-family:'Comic Sans MS',cursive;margin-top:3px}
.grlk-btn{display:block;margin:12px auto 0;padding:10px 20px;border:none;border-radius:8px;background:var(--accent,#e94560);color:#fff;font-size:14px;font-weight:600;cursor:pointer}
.grlk-btn:disabled{opacity:0.5;cursor:default}`;
    document.head.appendChild(s);
  }
  _calcTime() {
    const g = this.vals[0], d = this.vals[1], y = this.vals[2];
    const rand = (Math.random() * 2 - 1) * (this.cfg.randomRange || 1);
    return Math.round(10 + g * 2.5 - d * 0.8 + y * 1.2 + rand);
  }
  _render() {
    const note = this.cfg.managerNote || '';
    this.el.innerHTML = `<div class="grlk-wrap">
      <div class="grlk-machine">
        <div class="grlk-body"><div class="grlk-body-label">Espresso Machine</div>
          <div class="grlk-pf"><div class="grlk-pf-base"></div><div class="grlk-drip-wrap"><div class="grlk-drip" id="grlk-drip"></div></div></div>
        </div>
        <div class="grlk-cup"><div class="grlk-fill" id="grlk-fill"></div></div>
        <div class="grlk-saucer"></div>
        <div class="grlk-timer"><span id="grlk-timer">--</span> <span class="grlk-timer-unit">sec</span></div>
        <div class="grlk-target">Target: 25-30s = perfect extraction</div>
        <div class="grlk-quality" id="grlk-quality"></div>
      </div>
      <div id="grlk-sliders"></div>
      ${note ? `<div class="grlk-note"><div class="grlk-note-title">📝 Dial-in notes (Manager):</div><div class="grlk-note-body">${note}</div></div>` : ''}
      <button class="grlk-btn" id="grlk-pull">☕ Pull Shot</button>
    </div>`;
    this._renderSliders();
    this.el.querySelector('#grlk-pull').addEventListener('click', () => this._pull());
  }
  _renderSliders() {
    const el = this.el.querySelector('#grlk-sliders');
    el.innerHTML = this.sliders.map((s, i) => `<div class="grlk-slider">
      <div class="grlk-slider-head"><span>${s.label}</span><span style="color:var(--accent,#f39c12)">${this.vals[i]}</span></div>
      <div class="grlk-slider-sub">${s.sub || ''}</div>
      <input type="range" min="${s.min}" max="${s.max}" value="${this.vals[i]}" data-idx="${i}">
    </div>`).join('');
    el.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('input', e => {
        if (this.pulling) return;
        this.vals[+e.target.dataset.idx] = +e.target.value;
        this._renderSliders();
      });
    });
  }
  _pull() {
    if (this.pulling) return;
    this.pulling = true;
    const btn = this.el.querySelector('#grlk-pull');
    btn.disabled = true;
    const t = this._calcTime();
    const drip = this.el.querySelector('#grlk-drip');
    const fill = this.el.querySelector('#grlk-fill');
    const timer = this.el.querySelector('#grlk-timer');
    const quality = this.el.querySelector('#grlk-quality');
    drip.style.height = '0'; fill.style.height = '0'; timer.textContent = '0';
    quality.textContent = 'Pulling...'; quality.style.color = '#f39c12';
    setTimeout(() => { drip.style.height = '20px'; }, 200);
    let elapsed = 0;
    const iv = setInterval(() => {
      elapsed++;
      timer.textContent = elapsed;
      fill.style.height = Math.min(90, elapsed / t * 90) + '%';
      if (elapsed >= t) {
        clearInterval(iv);
        drip.style.height = '0';
        const fb = this.cfg.feedback || {};
        const min = this.cfg.target?.min || 25, max = this.cfg.target?.max || 30;
        if (t >= min && t <= max) {
          timer.style.color = '#2ecc71';
          quality.textContent = fb.perfect || '✅ Perfect.'; quality.style.color = '#2ecc71';
          setTimeout(() => this.onSubmit(), 800);
        } else {
          timer.style.color = t < min ? '#3498db' : '#e74c3c';
          quality.textContent = t < min ? (fb.fast || '⚡ Too fast.') : (fb.slow || '🐌 Too slow.');
          quality.style.color = t < min ? '#3498db' : '#e74c3c';
          if (this.onWrong) this.onWrong(quality.textContent);
          this.pulling = false; btn.disabled = false;
        }
      }
    }, 100);
  }
}
