/**
 * Morse Tap Lock Puzzle
 *
 * Single tap button. Short press = dot, long press = dash.
 * Player enters a morse code sequence to unlock.
 *
 * Usage:
 *   new MorseLock(containerEl, {
 *     answer: 'SOS',           // word to encode (auto-converts to morse)
 *     dashMs: 300,             // hold threshold for dash (default 300ms)
 *     gapMs: 800,              // pause between letters (default 800ms)
 *     showReference: true,     // show morse alphabet reference (default true)
 *     onSubmit(correct) { ... }
 *   });
 */

const MORSE_TABLE = {
  A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',
  J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',
  S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..',
  '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-',
  '5':'.....','6':'-....','7':'--...','8':'---..','9':'----.',
};

class MorseLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.answerWord = (opts.answer || 'SOS').toUpperCase();
    this.dashMs = opts.dashMs || 300;
    this.gapMs = opts.gapMs || 800;
    this.showReference = opts.showReference !== undefined ? opts.showReference : true;
    this.onSubmit = opts.onSubmit || (() => {});
    this.answerMorse = this._wordToMorse(this.answerWord);
    this.currentLetter = [];   // dots/dashes for current letter
    this.enteredLetters = [];  // completed morse letters
    this.pressStart = 0;
    this.gapTimer = null;
    this._render();
  }

  _wordToMorse(word) {
    return [...word].map(ch => MORSE_TABLE[ch] || '').filter(Boolean);
  }

  _morseToChar(morse) {
    for (const [ch, m] of Object.entries(MORSE_TABLE)) {
      if (m === morse) return ch;
    }
    return '?';
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'morslk';

    // Display area
    this.displayEl = document.createElement('div');
    this.displayEl.className = 'morslk-display';
    wrap.appendChild(this.displayEl);

    // Current morse input
    this.morseEl = document.createElement('div');
    this.morseEl.className = 'morslk-morse';
    wrap.appendChild(this.morseEl);

    // Decoded letters
    this.decodedEl = document.createElement('div');
    this.decodedEl.className = 'morslk-decoded';
    wrap.appendChild(this.decodedEl);

    // Tap button
    this.btn = document.createElement('div');
    this.btn.className = 'morslk-tap';
    this.btn.textContent = 'TAP';
    wrap.appendChild(this.btn);

    // Status
    this.statusEl = document.createElement('div');
    this.statusEl.className = 'morslk-status';
    this.statusEl.textContent = `Enter ${this.answerWord.length} letters in morse`;
    wrap.appendChild(this.statusEl);

    // Controls
    const bar = document.createElement('div');
    bar.className = 'morslk-bar';
    const resetBtn = document.createElement('button');
    resetBtn.className = 'morslk-btn-sec';
    resetBtn.textContent = '↻ Reset';
    resetBtn.addEventListener('click', () => this.reset());
    bar.appendChild(resetBtn);
    wrap.appendChild(bar);

    // Reference
    if (this.showReference) {
      const ref = document.createElement('div');
      ref.className = 'morslk-ref';
      // Show only letters in the answer to narrow it down
      const unique = [...new Set(this.answerWord.split(''))].sort();
      unique.forEach(ch => {
        const m = MORSE_TABLE[ch];
        if (!m) return;
        const item = document.createElement('span');
        item.className = 'morslk-ref-item';
        const symbols = m.split('').map(ch2 => ch2 === '.' ? '<span class="morslk-dot"></span>' : '<span class="morslk-dash"></span>').join('');
        item.innerHTML = `<b>${ch}</b>&nbsp;${symbols}`;
        ref.appendChild(item);
      });
      wrap.appendChild(ref);
    }

    this.container.appendChild(wrap);
    this._injectStyles();
    this._attachEvents();
    this._updateDisplay();
  }

  _attachEvents() {
    const onDown = (e) => {
      e.preventDefault();
      this.pressStart = Date.now();
      this.btn.classList.add('morslk-active');
      if (this.gapTimer) { clearTimeout(this.gapTimer); this.gapTimer = null; }
    };

    const onUp = (e) => {
      e.preventDefault();
      if (!this.pressStart) return;
      const dur = Date.now() - this.pressStart;
      this.pressStart = 0;
      this.btn.classList.remove('morslk-active');

      const symbol = dur >= this.dashMs ? '-' : '.';
      this.currentLetter.push(symbol);
      this._updateDisplay();

      // Start gap timer — if no tap within gapMs, commit the letter
      this.gapTimer = setTimeout(() => this._commitLetter(), this.gapMs);
    };

    this.btn.addEventListener('mousedown', onDown);
    this.btn.addEventListener('touchstart', onDown, { passive: false });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
  }

  _commitLetter() {
    if (!this.currentLetter.length) return;
    const morse = this.currentLetter.join('');
    this.enteredLetters.push(morse);
    this.currentLetter = [];
    this._updateDisplay();
    this._check();
  }

  _updateDisplay() {
    // Show entered morse sequences
    const parts = this.enteredLetters.map(m =>
      m.replace(/\./g, '·').replace(/-/g, '—')
    );
    const current = this.currentLetter.join('').replace(/\./g, '·').replace(/-/g, '—');
    this.morseEl.textContent = [...parts, current].filter(Boolean).join('  ') || '…';

    // Show decoded letters
    const decoded = this.enteredLetters.map(m => this._morseToChar(m));
    this.decodedEl.textContent = decoded.join('') + (this.currentLetter.length ? '_' : '');
  }

  _check() {
    if (this.enteredLetters.length < this.answerMorse.length) return;

    const correct = this.enteredLetters.length === this.answerMorse.length &&
      this.enteredLetters.every((m, i) => m === this.answerMorse[i]);

    if (correct) {
      this.statusEl.textContent = '✅ Signal accepted!';
      this.btn.classList.add('morslk-done');
      setTimeout(() => this.onSubmit(true), 400);
    } else {
      this.statusEl.textContent = '❌ Wrong signal — try again';
      setTimeout(() => this.reset(), 1500);
    }
  }

  reset() {
    this.currentLetter = [];
    this.enteredLetters = [];
    this.pressStart = 0;
    if (this.gapTimer) clearTimeout(this.gapTimer);
    this.btn.classList.remove('morslk-done');
    this.statusEl.textContent = `Enter ${this.answerWord.length} letters in morse`;
    this._updateDisplay();
  }

  _injectStyles() {
    if (document.getElementById('morslk-css')) return;
    const s = document.createElement('style');
    s.id = 'morslk-css';
    s.textContent = `
.morslk{display:flex;flex-direction:column;align-items:center;gap:14px;padding:16px 0}
.morslk-display{min-height:20px}
.morslk-morse{font-size:22px;font-weight:700;letter-spacing:4px;color:var(--accent,#3b82f6);min-height:28px;font-family:monospace}
.morslk-decoded{font-size:20px;font-weight:700;letter-spacing:6px;color:var(--text,#e0e6f0);min-height:26px}
.morslk-tap{width:100px;height:100px;border-radius:50%;background:var(--surface,#141b2d);border:3px solid var(--accent,#3b82f6);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:var(--accent,#3b82f6);cursor:pointer;user-select:none;-webkit-user-select:none;transition:all .1s;letter-spacing:2px}
.morslk-tap:active,.morslk-tap.morslk-active{background:var(--accent,#3b82f6);color:#fff;box-shadow:0 0 20px rgba(59,130,246,.5);transform:scale(.95)}
.morslk-tap.morslk-done{border-color:var(--green,#22c55e);background:var(--green,#22c55e);color:#fff}
.morslk-status{font-size:13px;color:var(--muted,#7a8ba8);min-height:18px}
.morslk-bar{display:flex;gap:12px}
.morslk-btn-sec{padding:8px 16px;border:none;border-radius:8px;background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);color:var(--muted,#7a8ba8);font-size:13px;font-weight:600;cursor:pointer}
.morslk-btn-sec:active{opacity:.7}
.morslk-ref{display:flex;flex-wrap:wrap;gap:8px 14px;justify-content:center;max-width:300px;margin-top:4px}
.morslk-ref-item{font-size:12px;color:var(--muted,#7a8ba8);white-space:nowrap}
.morslk-ref-item b{color:var(--text,#e0e6f0);margin-right:3px}
.morslk-dot{display:inline-block;width:8px;height:8px;background:var(--muted,#7a8ba8);border-radius:50%;margin:0 4px;vertical-align:middle}
.morslk-dash{display:inline-block;width:22px;height:8px;background:var(--text,#e0e6f0);border-radius:4px;margin:0 4px;vertical-align:middle}
`;
    document.head.appendChild(s);
  }
}
