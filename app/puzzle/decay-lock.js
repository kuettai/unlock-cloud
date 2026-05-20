/**
 * Decay Lock Puzzle (Environmental Decay / Timed Erosion)
 *
 * A puzzle where clues visually decay over time. Letters/words fade,
 * become scrambled, or disappear. Players must read and remember
 * before information is lost, then answer from memory.
 *
 * Inspired by Darkest Dungeon stress / FTL oxygen drain.
 *
 * Usage:
 *   new DecayLock(containerEl, {
 *     fragments: [
 *       { text: 'The vault code is ALPHA-7', decayAfter: 8 },
 *       { text: 'Ignore any code starting with BETA', decayAfter: 12 },
 *       { text: 'The third digit is always 7', decayAfter: 6 },
 *     ],
 *     question: 'What is the vault code?',
 *     answer: 'ALPHA-7',
 *     decayRate: 1,         // seconds between decay ticks
 *     corruptChar: '█',     // character used to corrupt text
 *     onSubmit(correct) { ... }
 *   });
 */

class DecayLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.fragments = (opts.fragments || []).map(f => ({ ...f }));
    this.question = opts.question || 'What is the answer?';
    this.answers = opts.answers || (opts.answer ? [opts.answer.toLowerCase().trim()] : ['unknown']);
    this.decayRate = (opts.decayRate || 1) * 1000;
    this.corruptChar = opts.corruptChar || '█';
    this.onSubmit = opts.onSubmit || (() => {});

    this._init();
  }

  _init() {
    this.elapsed = 0;
    this.solved = false;
    this.failed = false;
    this.fragStates = this.fragments.map(f => ({
      original: f.text,
      current: f.text.split(''),
      decayAfter: f.decayAfter,
      decayProgress: 0,
      fullyDecayed: false,
    }));
    this._render();
    this._startTimer();
  }

  _startTimer() {
    this._stopTimer();
    this._interval = setInterval(() => {
      if (this.solved) return;
      this.elapsed++;
      this._decayTick();
      this._updateFragments();
    }, this.decayRate);
  }

  _stopTimer() {
    if (this._interval) { clearInterval(this._interval); this._interval = null; }
  }

  _decayTick() {
    this.fragStates.forEach(frag => {
      if (frag.fullyDecayed) return;
      if (this.elapsed < frag.decayAfter) return;

      const remaining = frag.current.filter((ch, i) => ch !== this.corruptChar && frag.original[i] !== ' ').length;
      if (remaining <= 0) { frag.fullyDecayed = true; return; }

      const toCorrupt = Math.max(1, Math.ceil(remaining * 0.2));
      let corrupted = 0;
      const indices = [...Array(frag.current.length).keys()].filter(i => frag.current[i] !== this.corruptChar && frag.original[i] !== ' ');
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      for (const idx of indices) {
        if (corrupted >= toCorrupt) break;
        frag.current[idx] = this.corruptChar;
        corrupted++;
      }
      frag.decayProgress = 1 - (remaining - toCorrupt) / frag.original.replace(/ /g, '').length;
    });

    if (this.fragStates.every(f => f.fullyDecayed)) {
      this.failed = true;
      this._stopTimer();
    }
  }

  _submit() {
    const input = this.container.querySelector('.dclk-input');
    if (!input) return;
    const val = input.value.toLowerCase().trim();
    if (this.answers.includes(val)) {
      this.solved = true;
      this._stopTimer();
      this._render();
      setTimeout(() => this.onSubmit(true), 400);
    } else {
      this.container.querySelector('.dclk-result').textContent = 'Wrong — read the fragments carefully.';
      this.container.querySelector('.dclk-result').style.color = 'var(--red,#ef4444)';
    }
  }

  _updateFragments() {
    const timerEl = this.container.querySelector('.dclk-timer');
    if (timerEl) timerEl.textContent = `${this.elapsed}s elapsed`;

    const fragEls = this.container.querySelectorAll('.dclk-frag');
    this.fragStates.forEach((frag, idx) => {
      const el = fragEls[idx];
      if (!el) return;
      el.classList.toggle('dclk-frag-dead', frag.fullyDecayed);
      const decayPct = frag.current.filter(c => c === this.corruptChar).length / frag.original.replace(/ /g, '').length;
      el.classList.toggle('dclk-frag-warn', decayPct > 0.5 && !frag.fullyDecayed);

      const textEl = el.querySelector('.dclk-frag-text');
      if (textEl) {
        textEl.innerHTML = '';
        frag.current.forEach(ch => {
          const span = document.createElement('span');
          if (ch === this.corruptChar) {
            span.className = 'dclk-corrupt';
            span.textContent = this.corruptChar;
          } else {
            span.textContent = ch;
          }
          textEl.appendChild(span);
        });
      }

      const countdown = el.querySelector('.dclk-countdown');
      if (countdown) {
        if (frag.fullyDecayed || this.elapsed >= frag.decayAfter) {
          countdown.remove();
        } else {
          countdown.textContent = `${frag.decayAfter - this.elapsed}s`;
        }
      }
    });

    if (this.failed) {
      const resultEl = this.container.querySelector('.dclk-result');
      if (resultEl && !resultEl.textContent) {
        resultEl.textContent = 'All fragments decayed. Use memory!';
        resultEl.style.color = 'var(--yellow,#eab308)';
      }
    }
  }

  reset() {
    this._stopTimer();
    this._init();
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'dclk';

    // Timer
    const timer = document.createElement('div');
    timer.className = 'dclk-timer';
    timer.textContent = `${this.elapsed}s elapsed`;
    wrap.appendChild(timer);

    // Fragments
    const fragBox = document.createElement('div');
    fragBox.className = 'dclk-fragments';
    this.fragStates.forEach(frag => {
      const el = document.createElement('div');
      el.className = 'dclk-frag';
      if (frag.fullyDecayed) el.classList.add('dclk-frag-dead');
      const decayPct = frag.current.filter(c => c === this.corruptChar).length / frag.original.replace(/ /g, '').length;
      if (decayPct > 0.5) el.classList.add('dclk-frag-warn');

      const text = document.createElement('span');
      text.className = 'dclk-frag-text';
      frag.current.forEach((ch, i) => {
        const span = document.createElement('span');
        if (ch === this.corruptChar) {
          span.className = 'dclk-corrupt';
          span.textContent = this.corruptChar;
        } else {
          span.textContent = ch;
        }
        text.appendChild(span);
      });
      el.appendChild(text);

      if (!frag.fullyDecayed && this.elapsed < frag.decayAfter) {
        const badge = document.createElement('span');
        badge.className = 'dclk-countdown';
        badge.textContent = `${frag.decayAfter - this.elapsed}s`;
        el.appendChild(badge);
      }

      fragBox.appendChild(el);
    });
    wrap.appendChild(fragBox);

    // Question + input
    if (!this.solved) {
      const qBox = document.createElement('div');
      qBox.className = 'dclk-question';
      qBox.textContent = this.question;
      wrap.appendChild(qBox);

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'dclk-input';
      input.placeholder = 'Type your answer...';
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') this._submit(); });
      wrap.appendChild(input);

      const bar = document.createElement('div');
      bar.className = 'dclk-bar';
      const btn = document.createElement('button');
      btn.className = 'dclk-btn';
      btn.textContent = 'Submit';
      btn.addEventListener('click', () => this._submit());
      bar.appendChild(btn);
      const result = document.createElement('div');
      result.className = 'dclk-result';
      if (this.failed) { result.textContent = 'All fragments decayed. Use memory!'; result.style.color = 'var(--yellow,#eab308)'; }
      bar.appendChild(result);
      wrap.appendChild(bar);
    } else {
      const res = document.createElement('div');
      res.className = 'dclk-solved';
      res.textContent = 'Correct! Decrypted.';
      wrap.appendChild(res);
    }

    this.container.appendChild(wrap);
    this._injectStyles();
  }

  _injectStyles() {
    if (document.getElementById('dclk-css')) return;
    const s = document.createElement('style'); s.id = 'dclk-css';
    s.textContent = `
.dclk{display:flex;flex-direction:column;gap:12px;padding:16px 0;max-width:420px;margin:0 auto}
.dclk-timer{font-size:11px;color:var(--muted,#7a8ba8);text-align:right;font-variant-numeric:tabular-nums}
.dclk-fragments{display:flex;flex-direction:column;gap:6px}
.dclk-frag{background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);border-radius:8px;padding:10px 12px;display:flex;align-items:center;justify-content:space-between;gap:8px;transition:all .3s}
.dclk-frag-warn{border-color:var(--yellow,#eab308);background:rgba(234,179,8,.05)}
.dclk-frag-dead{border-color:var(--red,#ef4444);background:rgba(239,68,68,.05);opacity:.5}
.dclk-frag-text{font-family:'Courier New',monospace;font-size:13px;color:var(--text,#e0e6f0);letter-spacing:.5px;word-break:break-all}
.dclk-corrupt{color:var(--red,#ef4444);opacity:.6}
.dclk-countdown{font-size:10px;color:var(--green,#22c55e);background:rgba(34,197,94,.1);padding:2px 6px;border-radius:4px;white-space:nowrap}
.dclk-question{font-size:14px;font-weight:600;color:var(--text,#e0e6f0);text-align:center;margin-top:8px}
.dclk-input{width:100%;padding:12px;background:var(--bg,#0a0e17);border:1px solid var(--border,#1e2a45);border-radius:8px;color:var(--text,#e0e6f0);font-size:14px;text-align:center}
.dclk-input:focus{outline:none;border-color:var(--accent,#3b82f6)}
.dclk-bar{display:flex;flex-direction:column;align-items:center;gap:6px}
.dclk-btn{padding:10px 24px;background:var(--accent,#3b82f6);color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer}
.dclk-btn:active{opacity:.7}
.dclk-result{font-size:12px;font-weight:600;min-height:18px}
.dclk-solved{text-align:center;font-size:16px;font-weight:700;color:var(--green,#22c55e);padding:16px;background:rgba(34,197,94,.1);border-radius:8px}
`;
    document.head.appendChild(s);
  }
}
