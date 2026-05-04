/**
 * Keypad Lock Puzzle
 *
 * Classic PIN pad with 0–9, enter, and clear.
 *
 * Usage:
 *   new KeypadLock(containerEl, {
 *     answer: '4721',
 *     length: 4,              // PIN length (default from answer)
 *     falseOutputs: ['Access granted... to the wrong vault.'],
 *     onSubmit(correct) { ... },
 *     onWrong(message) { ... }
 *   });
 */

class KeypadLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.answer = opts.answer || '0000';
    this.length = opts.length || this.answer.length;
    this.falseOutputs = opts.falseOutputs || [];
    this.onSubmit = opts.onSubmit || (() => {});
    this.onWrong = opts.onWrong || (() => {});
    this.input = '';
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'kpdlk';

    // Display
    this.display = document.createElement('div');
    this.display.className = 'kpdlk-display';
    this._updateDisplay();
    wrap.appendChild(this.display);

    // Keypad grid
    const grid = document.createElement('div');
    grid.className = 'kpdlk-grid';
    const keys = ['1','2','3','4','5','6','7','8','9','C','0','↵'];
    keys.forEach(k => {
      const btn = document.createElement('button');
      btn.className = 'kpdlk-key';
      btn.textContent = k;
      if (k === 'C') btn.classList.add('kpdlk-fn');
      if (k === '↵') btn.classList.add('kpdlk-fn', 'kpdlk-enter');
      btn.addEventListener('click', () => this._press(k));
      grid.appendChild(btn);
    });
    wrap.appendChild(grid);

    this.statusEl = document.createElement('div');
    this.statusEl.className = 'kpdlk-status';
    wrap.appendChild(this.statusEl);

    this.container.appendChild(wrap);
    this._injectStyles();
  }

  _press(k) {
    if (k === 'C') {
      this.input = '';
      this.statusEl.textContent = '';
      this.display.classList.remove('kpdlk-wrong', 'kpdlk-correct');
    } else if (k === '↵') {
      this._test();
    } else if (this.input.length < this.length) {
      this.input += k;
    }
    this._updateDisplay();
  }

  _updateDisplay() {
    const filled = '●'.repeat(this.input.length);
    const empty = '○'.repeat(this.length - this.input.length);
    this.display.textContent = filled + empty;
  }

  _test() {
    if (this.input.length < this.length) return;
    if (this.input === this.answer) {
      this.display.classList.add('kpdlk-correct');
      this.statusEl.textContent = '✅ Unlocked!';
      setTimeout(() => this.onSubmit(true), 400);
    } else {
      this.display.classList.add('kpdlk-wrong');
      this.statusEl.textContent = '❌ Wrong code';
      if (this.falseOutputs.length) {
        this.onWrong(this.falseOutputs[Math.floor(Math.random() * this.falseOutputs.length)]);
      } else {
        this.onWrong(null);
      }
      setTimeout(() => {
        this.input = '';
        this._updateDisplay();
        this.display.classList.remove('kpdlk-wrong');
      }, 800);
    }
  }

  reset() {
    this.input = '';
    this.statusEl.textContent = '';
    this.display.classList.remove('kpdlk-wrong', 'kpdlk-correct');
    this._updateDisplay();
  }

  _injectStyles() {
    if (document.getElementById('kpdlk-css')) return;
    const s = document.createElement('style');
    s.id = 'kpdlk-css';
    s.textContent = `
.kpdlk{display:flex;flex-direction:column;align-items:center;gap:14px;padding:16px 0}
.kpdlk-display{font-size:28px;letter-spacing:8px;color:var(--accent,#3b82f6);min-height:36px;font-weight:700;transition:color .2s}
.kpdlk-display.kpdlk-wrong{color:#ef4444;animation:kpdlk-sh .4s}
.kpdlk-display.kpdlk-correct{color:var(--green,#22c55e)}
@keyframes kpdlk-sh{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
.kpdlk-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;width:200px}
.kpdlk-key{padding:14px;border:none;border-radius:10px;background:var(--surface,#141b2d);border:2px solid var(--border,#1e2a45);color:var(--text,#e0e6f0);font-size:20px;font-weight:700;cursor:pointer;transition:all .1s;user-select:none}
.kpdlk-key:active{background:var(--accent,#3b82f6);color:#fff;transform:scale(.95)}
.kpdlk-fn{font-size:16px;color:var(--muted,#7a8ba8)}
.kpdlk-enter{background:var(--accent,#3b82f6);color:#fff;border-color:var(--accent,#3b82f6)}
.kpdlk-status{font-size:13px;color:var(--muted,#7a8ba8);min-height:18px}
`;
    document.head.appendChild(s);
  }
}
