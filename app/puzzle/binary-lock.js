/**
 * Binary Toggle Lock Puzzle
 *
 * Row of 8 on/off toggle switches. Player sets the correct binary pattern.
 *
 * Usage:
 *   new BinaryLock(containerEl, {
 *     answer: '10110001',       // 8-char string of 0s and 1s
 *     labels: true,             // show bit position labels (default true)
 *     showDecimal: true,        // show decimal value live (default true)
 *     revealCorrect: false,     // true = lock correct bits, false = all-or-nothing
 *     falseOutputs: ['Access code accepted... entering quarantine zone.'],
 *     onSubmit(correct) { ... },
 *     onWrong(message) { ... }
 *   });
 */

class BinaryLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.answer = opts.answer || '00000000';
    this.showLabels = opts.labels !== undefined ? opts.labels : true;
    this.showDecimal = opts.showDecimal !== undefined ? opts.showDecimal : true;
    this.revealCorrect = opts.revealCorrect !== undefined ? opts.revealCorrect : false;
    this.falseOutputs = opts.falseOutputs || [];
    this.onSubmit = opts.onSubmit || (() => {});
    this.onWrong = opts.onWrong || (() => {});
    this.bits = new Array(8).fill(0);
    this.locked = new Array(8).fill(false);
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'binlk';

    if (this.showDecimal) {
      this.decEl = document.createElement('div');
      this.decEl.className = 'binlk-dec';
      this.decEl.textContent = '0';
      wrap.appendChild(this.decEl);
    }

    const row = document.createElement('div');
    row.className = 'binlk-row';
    this.switchEls = [];
    for (let i = 0; i < 8; i++) {
      const col = document.createElement('div');
      col.className = 'binlk-col';

      if (this.showLabels) {
        const lbl = document.createElement('div');
        lbl.className = 'binlk-label';
        lbl.textContent = 7 - i;
        col.appendChild(lbl);
      }

      const sw = document.createElement('div');
      sw.className = 'binlk-sw';
      sw.dataset.bit = i;
      const knob = document.createElement('div');
      knob.className = 'binlk-knob';
      sw.appendChild(knob);
      sw.addEventListener('click', () => this._toggle(i));
      col.appendChild(sw);

      const val = document.createElement('div');
      val.className = 'binlk-val';
      val.textContent = '0';
      col.appendChild(val);

      row.appendChild(col);
      this.switchEls.push({ sw, knob, val });
    }
    wrap.appendChild(row);

    const btn = document.createElement('button');
    btn.className = 'binlk-btn';
    btn.textContent = 'Activate';
    btn.addEventListener('click', () => this._test());
    wrap.appendChild(btn);

    this.container.appendChild(wrap);
    this._injectStyles();
  }

  _toggle(i) {
    if (this.locked[i]) return;
    this.bits[i] = this.bits[i] ? 0 : 1;
    const el = this.switchEls[i];
    el.sw.classList.toggle('binlk-on', this.bits[i] === 1);
    el.val.textContent = this.bits[i];
    if (this.decEl) this.decEl.textContent = parseInt(this.bits.join(''), 2);
  }

  _test() {
    const current = this.bits.join('');
    const allCorrect = current === this.answer;

    if (allCorrect) {
      this.locked.fill(true);
      this.switchEls.forEach(el => el.sw.classList.add('binlk-correct'));
      this.onSubmit(true);
      return;
    }

    if (this.revealCorrect) {
      for (let i = 0; i < 8; i++) {
        if (this.locked[i]) continue;
        if (this.bits[i] === parseInt(this.answer[i])) {
          this.locked[i] = true;
          this.switchEls[i].sw.classList.add('binlk-correct');
        } else {
          this.switchEls[i].sw.classList.add('binlk-wrong');
          setTimeout(() => this.switchEls[i].sw.classList.remove('binlk-wrong'), 600);
        }
      }
    } else {
      this.switchEls.forEach(el => {
        el.sw.classList.add('binlk-wrong');
        setTimeout(() => el.sw.classList.remove('binlk-wrong'), 600);
      });
    }
    this._fireWrong();
  }

  _fireWrong() {
    if (this.falseOutputs.length) {
      this.onWrong(this.falseOutputs[Math.floor(Math.random() * this.falseOutputs.length)]);
    } else {
      this.onWrong(null);
    }
  }

  getCode() { return this.bits.join(''); }
  getDecimal() { return parseInt(this.bits.join(''), 2); }

  reset() {
    this.bits = new Array(8).fill(0);
    this.locked = new Array(8).fill(false);
    this.switchEls.forEach(el => {
      el.sw.classList.remove('binlk-on', 'binlk-correct', 'binlk-wrong');
      el.val.textContent = '0';
    });
    if (this.decEl) this.decEl.textContent = '0';
  }

  _injectStyles() {
    if (document.getElementById('binlk-css')) return;
    const s = document.createElement('style');
    s.id = 'binlk-css';
    s.textContent = `
.binlk{display:flex;flex-direction:column;align-items:center;gap:16px;padding:16px 0}
.binlk-dec{font-size:28px;font-weight:700;font-variant-numeric:tabular-nums;color:var(--accent,#3b82f6);letter-spacing:2px}
.binlk-row{display:flex;gap:6px}
.binlk-col{display:flex;flex-direction:column;align-items:center;gap:6px}
.binlk-label{font-size:10px;color:var(--muted,#7a8ba8);font-weight:600}
.binlk-sw{width:36px;height:56px;background:var(--surface,#141b2d);border:2px solid var(--border,#1e2a45);border-radius:18px;position:relative;cursor:pointer;transition:background .2s,border-color .2s}
.binlk-sw.binlk-on{background:#0c2d1a;border-color:var(--green,#22c55e)}
.binlk-sw.binlk-on .binlk-knob{top:4px;background:var(--green,#22c55e);box-shadow:0 0 8px rgba(34,197,94,.5)}
.binlk-knob{position:absolute;bottom:4px;left:50%;width:24px;height:24px;margin-left:-12px;background:var(--muted,#7a8ba8);border-radius:50%;transition:top .15s,bottom .15s,background .2s,box-shadow .2s}
.binlk-sw:not(.binlk-on) .binlk-knob{top:auto;bottom:4px}
.binlk-sw.binlk-on .binlk-knob{top:4px;bottom:auto}
.binlk-val{font-size:13px;font-weight:700;color:var(--muted,#7a8ba8);font-variant-numeric:tabular-nums}
.binlk-sw.binlk-correct{border-color:var(--green,#22c55e);opacity:.6;pointer-events:none}
.binlk-sw.binlk-wrong{animation:binlk-shake .4s}
@keyframes binlk-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
.binlk-btn{padding:12px 28px;border:none;border-radius:8px;background:var(--accent,#3b82f6);color:#fff;font-size:14px;font-weight:600;cursor:pointer;letter-spacing:.5px;transition:opacity .2s}
.binlk-btn:active{opacity:.7}
`;
    document.head.appendChild(s);
  }
}
