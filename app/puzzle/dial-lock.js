class DialLock {
  constructor(el, opts) {
    this.el = el;
    this.cfg = opts.config || opts;
    this.onSubmit = opts.onSubmit;
    this.onWrong = opts.onWrong;
    this.dials = this.cfg.dials;
    this.vals = this.dials.map(d => d.min || 0);
    this.solved = false;
    this._injectStyles();
    this._render();
  }
  _injectStyles() {
    if (document.getElementById('dllk-style')) return;
    const s = document.createElement('style'); s.id = 'dllk-style';
    s.textContent = `
.dllk-wrap{max-width:420px;margin:0 auto;padding:8px 0}
.dllk-safe{position:relative;background:linear-gradient(145deg,#3a3a3a,#2a2a2a);border:3px solid #555;border-radius:12px;padding:1.5rem;text-align:center;box-shadow:inset 0 2px 8px rgba(0,0,0,0.5),0 4px 12px rgba(0,0,0,0.3)}
.dllk-safe.open{border-color:#2ecc71;box-shadow:0 0 20px rgba(46,204,113,0.3)}
.dllk-title{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px}
.dllk-subtitle{font-size:10px;color:#666;margin-bottom:16px}
.dllk-dials{display:flex;justify-content:center;gap:1.2rem;margin-bottom:16px}
.dllk-dial-col{text-align:center}
.dllk-dial-arrow{font-size:9px;color:#888;margin-bottom:4px;cursor:pointer;user-select:none}
.dllk-dial-box{position:relative;width:56px;height:70px;background:#111;border:2px solid #666;border-radius:6px;overflow:hidden;touch-action:none}
.dllk-dial-strip{position:absolute;width:100%;transition:transform 0.2s}
.dllk-dial-num{height:70px;display:flex;align-items:center;justify-content:center;font-size:1.8rem;font-weight:bold;color:#444;font-family:'Courier New',monospace}
.dllk-dial-num.active{color:#f39c12}
.dllk-dial-label{font-size:8px;color:#666;margin-top:4px}
.dllk-handle{width:40px;height:40px;margin:0 auto;border:3px solid #666;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.3s}
.dllk-handle.open{transform:rotate(90deg);border-color:#2ecc71}
.dllk-handle.open .dllk-handle-bar{background:#2ecc71}
.dllk-handle.wrong{transform:rotate(5deg);border-color:#e74c3c}
.dllk-handle-bar{width:16px;height:3px;background:#666;border-radius:2px}
.dllk-handle-hint{font-size:9px;color:#555;margin-top:6px}
.dllk-net{margin-top:16px;position:relative;background:linear-gradient(to bottom,#0a1628,#1a2a4e);border:2px solid #444;border-radius:12px;padding:1.5rem 1rem;text-align:center;overflow:hidden;min-height:180px}
.dllk-net.full{border-color:#f39c12;box-shadow:0 0 20px rgba(243,156,18,0.3)}
.dllk-net-shape{position:relative;margin:0 auto;width:180px;height:130px}
.dllk-net-border{position:absolute;inset:0;border:3px solid #556;border-radius:0 0 50% 50%;background:rgba(50,80,120,0.15)}
.dllk-net-inner{position:absolute;inset:8px;border:2px dashed #445;border-radius:0 0 50% 50%}
.dllk-net-fish{position:absolute;inset:12px;display:flex;flex-wrap:wrap;align-items:end;justify-content:center;gap:1px;padding:8px;overflow:hidden}
.dllk-counter{margin-top:10px;font-size:1.8rem;font-weight:bold;color:#556}
.dllk-counter-label{font-size:11px;color:#445}`;
    document.head.appendChild(s);
  }
  _render() {
    this.el.innerHTML = `<div class="dllk-wrap">
      <div class="dllk-safe" id="dllk-safe">
        <div class="dllk-title">${this.cfg.title || 'Cash Safe'}</div>
        <div class="dllk-subtitle">${this.cfg.subtitle || "Manager's Daily Code"}</div>
        <div class="dllk-dials">${this.dials.map((d, i) => `<div class="dllk-dial-col">
          <div class="dllk-dial-arrow" data-dir="up" data-idx="${i}">▲</div>
          <div class="dllk-dial-box" data-idx="${i}"><div class="dllk-dial-strip" id="dllk-strip-${i}"></div></div>
          <div class="dllk-dial-arrow" data-dir="down" data-idx="${i}">▼</div>
          <div class="dllk-dial-label">${d.label || ''}</div>
        </div>`).join('')}</div>
        <div class="dllk-handle" id="dllk-handle"><div class="dllk-handle-bar"></div></div>
        <div class="dllk-handle-hint">turn handle to open</div>
      </div>
      <div id="dllk-net-area"></div>
    </div>`;
    this._renderStrips();
    this._bindDials();
    this.el.querySelector('#dllk-handle').addEventListener('click', () => this._try());
  }
  _renderStrips() {
    this.dials.forEach((d, i) => {
      const strip = this.el.querySelector(`#dllk-strip-${i}`);
      const min = d.min || 0, max = d.max || 9;
      strip.innerHTML = '';
      for (let n = min; n <= max; n++) {
        const div = document.createElement('div');
        div.className = 'dllk-dial-num' + (n === this.vals[i] ? ' active' : '');
        div.textContent = n;
        strip.appendChild(div);
      }
      strip.style.transform = `translateY(-${(this.vals[i] - (d.min || 0)) * 70}px)`;
    });
  }
  _bindDials() {
    this.el.querySelectorAll('.dllk-dial-arrow').forEach(a => a.addEventListener('click', e => {
      if (this.solved) return;
      const i = +e.target.dataset.idx;
      const d = this.dials[i];
      const min = d.min || 0, max = d.max || 9;
      if (e.target.dataset.dir === 'up') this.vals[i] = this.vals[i] > min ? this.vals[i] - 1 : max;
      else this.vals[i] = this.vals[i] < max ? this.vals[i] + 1 : min;
      this._renderStrips();
    }));
    this.el.querySelectorAll('.dllk-dial-box').forEach(box => {
      let startY = 0, startVal = 0;
      const i = +box.dataset.idx;
      box.addEventListener('pointerdown', e => {
        if (this.solved) return;
        e.preventDefault(); startY = e.clientY; startVal = this.vals[i];
        const move = ev => { const diff = startY - ev.clientY; const d = this.dials[i]; this.vals[i] = ((startVal + Math.round(diff / 30)) % 10 + 10) % 10; this._renderStrips(); };
        const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); };
        document.addEventListener('pointermove', move);
        document.addEventListener('pointerup', up);
      });
    });
  }
  _try() {
    if (this.solved) return;
    const correct = this.dials.every((d, i) => this.vals[i] === d.answer);
    const handle = this.el.querySelector('#dllk-handle');
    if (correct) {
      this.solved = true;
      handle.classList.add('open');
      this.el.querySelector('#dllk-safe').classList.add('open');
      const reward = this.cfg.reward;
      if (reward && reward.type === 'net_fill') { this._fillNet(reward); }
      else { setTimeout(() => this.onSubmit(), 800); }
    } else {
      handle.classList.add('wrong');
      setTimeout(() => handle.classList.remove('wrong'), 400);
      const fo = this.cfg.falseOutputs || [];
      const msg = fo[Math.floor(Math.random() * fo.length)] || 'Wrong code.';
      if (this.onWrong) this.onWrong(msg);
    }
  }
  _fillNet(reward) {
    const area = this.el.querySelector('#dllk-net-area');
    if (!area) { this.onSubmit(); return; }
    area.innerHTML = `<div class="dllk-net" id="dllk-net"><div class="dllk-net-shape"><div class="dllk-net-border"></div><div class="dllk-net-inner"></div><div class="dllk-net-fish" id="dllk-fish"></div></div><div class="dllk-counter" id="dllk-count">0</div><div class="dllk-counter-label">fish in the net</div></div>`;
    const fishEl = this.el.querySelector('#dllk-fish');
    const counter = this.el.querySelector('#dllk-count');
    const netEl = this.el.querySelector('#dllk-net');
    if (!fishEl) { this.onSubmit(); return; }
    const total = reward.total || 153;
    let count = 0;
    const onDone = () => this.onSubmit();
    const iv = setInterval(() => {
      if (!fishEl.isConnected) { clearInterval(iv); onDone(); return; }
      const batch = Math.min(Math.ceil((total - count) / 20) + 1, total - count);
      for (let i = 0; i < batch; i++) {
        const f = document.createElement('span');
        f.textContent = reward.emoji || '🐟';
        f.style.fontSize = (0.35 + Math.random() * 0.25) + 'rem';
        f.style.opacity = '0'; f.style.transition = 'opacity 0.3s';
        fishEl.appendChild(f);
        setTimeout(() => { f.style.opacity = '1'; }, 50);
        count++;
      }
      counter.textContent = count;
      counter.style.color = count >= total ? (reward.counterColorEnd || '#f39c12') : (reward.counterColorStart || '#8ab4f8');
      if (count >= total) {
        clearInterval(iv);
        netEl.classList.add('full');
        if (reward.revelation) {
          setTimeout(() => {
            const rev = reward.revelation;
            const revEl = document.createElement('div');
            revEl.style.cssText = 'margin-top:16px;text-align:center;animation:cslk-fade 2s';
            revEl.innerHTML = `<div style="font-size:2rem;font-weight:bold;color:#f39c12;font-family:serif;margin-bottom:4px">${rev.hebrew}</div><div style="font-size:1.2rem;color:#8ab4f8;font-family:serif;font-style:italic;margin-bottom:4px">${rev.greek}</div><div style="font-size:1rem;color:#e0e6f0;font-weight:600;margin-bottom:8px">${rev.english}</div><div style="font-size:0.8rem;color:#7a8ba8;font-style:italic">${rev.verse}</div>`;
            netEl.parentElement.appendChild(revEl);
            setTimeout(onDone, 4000);
          }, 1200);
        } else {
          setTimeout(onDone, 1200);
        }
      }
    }, 60);
  }
}
