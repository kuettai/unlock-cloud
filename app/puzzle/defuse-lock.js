/**
 * Countdown Defuse Lock Puzzle
 *
 * Composite puzzle: multiple mini-tasks that must all be completed before a timer runs out.
 * Each task is a simple toggle/code/button. Timer counts down visually.
 *
 * Usage:
 *   new DefuseLock(containerEl, {
 *     timeSeconds: 30,
 *     tasks: [
 *       { type: 'toggle', label: 'Cut red wire', answer: true },
 *       { type: 'toggle', label: 'Arm shield', answer: false },
 *       { type: 'code', label: 'Enter code', answer: '42' },
 *     ],
 *     onSubmit(correct) { ... },
 *     onTimeout() { ... }
 *   });
 */

class DefuseLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.timeSeconds = opts.timeSeconds || 30;
    this.tasks = opts.tasks || [];
    this.onSubmit = opts.onSubmit || (() => {});
    this.onTimeout = opts.onTimeout || (() => {});
    this.remaining = this.timeSeconds;
    this.timer = null;
    this.taskStates = this.tasks.map(t => t.type === 'toggle' ? false : '');
    this._render();
    this._startTimer();
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'dfslk';

    // Timer
    this.timerEl = document.createElement('div');
    this.timerEl.className = 'dfslk-timer';
    wrap.appendChild(this.timerEl);

    // Tasks
    this.taskEls = [];
    this.tasks.forEach((task, i) => {
      const row = document.createElement('div');
      row.className = 'dfslk-task';
      const lbl = document.createElement('span');
      lbl.className = 'dfslk-label';
      lbl.textContent = task.label;
      row.appendChild(lbl);

      if (task.type === 'toggle') {
        const sw = document.createElement('div');
        sw.className = 'dfslk-sw';
        sw.addEventListener('click', () => {
          this.taskStates[i] = !this.taskStates[i];
          sw.classList.toggle('dfslk-sw-on', this.taskStates[i]);
        });
        row.appendChild(sw);
      } else if (task.type === 'code') {
        const input = document.createElement('input');
        input.className = 'dfslk-code';
        input.type = 'text';
        input.placeholder = '...';
        input.addEventListener('input', () => { this.taskStates[i] = input.value.trim(); });
        row.appendChild(input);
      }

      wrap.appendChild(row);
      this.taskEls.push(row);
    });

    const btn = document.createElement('button');
    btn.className = 'dfslk-btn';
    btn.textContent = '🔓 Defuse';
    btn.addEventListener('click', () => this._test());
    wrap.appendChild(btn);

    this.container.appendChild(wrap);
    this._injectStyles();
    this._updateTimer();
  }

  _startTimer() {
    this.timer = setInterval(() => {
      this.remaining--;
      this._updateTimer();
      if (this.remaining <= 0) {
        clearInterval(this.timer);
        this.onTimeout();
      }
    }, 1000);
  }

  _updateTimer() {
    const m = Math.floor(this.remaining / 60);
    const s = this.remaining % 60;
    this.timerEl.textContent = `${m}:${String(s).padStart(2, '0')}`;
    this.timerEl.classList.toggle('dfslk-critical', this.remaining <= 10);
  }

  _test() {
    const correct = this.tasks.every((t, i) => {
      if (t.type === 'toggle') return this.taskStates[i] === t.answer;
      if (t.type === 'code') return this.taskStates[i] === t.answer;
      return false;
    });
    if (correct) {
      clearInterval(this.timer);
      this.timerEl.classList.add('dfslk-safe');
      this.timerEl.textContent = '✅ DEFUSED';
      setTimeout(() => this.onSubmit(true), 400);
    } else {
      this.taskEls.forEach(el => {
        el.classList.add('dfslk-shake');
        setTimeout(() => el.classList.remove('dfslk-shake'), 600);
      });
    }
  }

  reset() {
    clearInterval(this.timer);
    this.remaining = this.timeSeconds;
    this.taskStates = this.tasks.map(t => t.type === 'toggle' ? false : '');
    this._render();
    this._startTimer();
  }

  _injectStyles() {
    if (document.getElementById('dfslk-css')) return;
    const s = document.createElement('style');
    s.id = 'dfslk-css';
    s.textContent = `
.dfslk{display:flex;flex-direction:column;align-items:center;gap:12px;padding:16px 0;max-width:320px;margin:0 auto}
.dfslk-timer{font-size:36px;font-weight:700;font-variant-numeric:tabular-nums;color:var(--accent,#3b82f6);transition:color .3s}
.dfslk-timer.dfslk-critical{color:#ef4444;animation:dfslk-pulse 1s infinite}
.dfslk-timer.dfslk-safe{color:var(--green,#22c55e);font-size:20px}
@keyframes dfslk-pulse{50%{opacity:.4}}
.dfslk-task{display:flex;align-items:center;justify-content:space-between;width:100%;padding:10px 14px;background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);border-radius:8px}
.dfslk-label{font-size:14px;color:var(--muted,#7a8ba8);font-weight:600}
.dfslk-sw{width:44px;height:24px;background:var(--border,#1e2a45);border-radius:12px;position:relative;cursor:pointer;transition:background .2s;flex-shrink:0}
.dfslk-sw::after{content:'';position:absolute;top:3px;left:3px;width:18px;height:18px;background:var(--muted,#7a8ba8);border-radius:50%;transition:all .2s}
.dfslk-sw.dfslk-sw-on{background:var(--green,#22c55e)}
.dfslk-sw.dfslk-sw-on::after{left:23px;background:#fff}
.dfslk-code{width:60px;padding:6px 8px;background:var(--bg,#0a0e17);border:1px solid var(--border,#1e2a45);border-radius:6px;color:var(--text,#e0e6f0);font-family:monospace;font-size:14px;text-align:center}
.dfslk-code:focus{outline:none;border-color:var(--accent,#3b82f6)}
.dfslk-shake{animation:dfslk-sh .4s}
@keyframes dfslk-sh{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
.dfslk-btn{padding:12px 28px;border:none;border-radius:8px;background:#ef4444;color:#fff;font-size:14px;font-weight:700;cursor:pointer;letter-spacing:.5px;transition:opacity .2s}
.dfslk-btn:active{opacity:.7}
`;
    document.head.appendChild(s);
  }
}
