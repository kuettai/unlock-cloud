/**
 * Encryption Key Lock Puzzle
 *
 * Two phases: 1) Assemble key fragments by ordering them, 2) Use the key to decrypt a message.
 *
 * Usage:
 *   new KeyLock(containerEl, {
 *     fragments: ['A3','F7','B1','D9'],  // correct order
 *     encrypted: 'dW5sb2Nr',             // base64 or cipher text
 *     decrypted: 'unlock',               // expected plaintext
 *     onSubmit(correct) { ... }
 *   });
 */

class KeyLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.fragments = opts.fragments || [];
    this.encrypted = opts.encrypted || '';
    this.decrypted = opts.decrypted || '';
    this.onSubmit = opts.onSubmit || (() => {});
    this.phase = 1;
    this.order = this._shuffle([...this.fragments]);
    this._render();
  }

  _shuffle(arr) {
    let s;
    do { s = [...arr]; for (let i = s.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [s[i], s[j]] = [s[j], s[i]]; } } while (s.every((v, i) => v === arr[i]));
    return s;
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'keylk';

    if (this.phase === 1) {
      const title = document.createElement('div');
      title.className = 'keylk-title';
      title.textContent = 'Phase 1: Assemble the encryption key';
      wrap.appendChild(title);

      const hint = document.createElement('div');
      hint.className = 'keylk-hint';
      hint.textContent = 'Tap fragments to swap and arrange in correct order';
      wrap.appendChild(hint);

      this.fragEls = [];
      const row = document.createElement('div');
      row.className = 'keylk-frags';
      this.order.forEach((f, i) => {
        const el = document.createElement('div');
        el.className = 'keylk-frag';
        el.textContent = f;
        el.addEventListener('click', () => this._tapFrag(i));
        row.appendChild(el);
        this.fragEls.push(el);
      });
      wrap.appendChild(row);

      const btn = document.createElement('button');
      btn.className = 'keylk-btn';
      btn.textContent = 'Assemble Key';
      btn.addEventListener('click', () => this._testPhase1());
      wrap.appendChild(btn);
    } else {
      const title = document.createElement('div');
      title.className = 'keylk-title';
      title.textContent = 'Phase 2: Decrypt the message';
      wrap.appendChild(title);

      const keyDisplay = document.createElement('div');
      keyDisplay.className = 'keylk-key';
      keyDisplay.textContent = `🔑 ${this.fragments.join('-')}`;
      wrap.appendChild(keyDisplay);

      const cipher = document.createElement('div');
      cipher.className = 'keylk-cipher';
      cipher.textContent = this.encrypted;
      wrap.appendChild(cipher);

      const inputRow = document.createElement('div');
      inputRow.className = 'keylk-input-row';
      this.input = document.createElement('input');
      this.input.className = 'keylk-input';
      this.input.type = 'text';
      this.input.placeholder = 'Decrypted message...';
      const btn = document.createElement('button');
      btn.className = 'keylk-btn';
      btn.textContent = 'Decrypt';
      btn.addEventListener('click', () => this._testPhase2());
      inputRow.appendChild(this.input);
      inputRow.appendChild(btn);
      wrap.appendChild(inputRow);
    }

    this.statusEl = document.createElement('div');
    this.statusEl.className = 'keylk-status';
    wrap.appendChild(this.statusEl);

    this.container.appendChild(wrap);
    this._injectStyles();
  }

  _selected = null;
  _tapFrag(i) {
    if (this._selected === null) {
      this._selected = i;
      this.fragEls[i].classList.add('keylk-sel');
    } else if (this._selected === i) {
      this.fragEls[i].classList.remove('keylk-sel');
      this._selected = null;
    } else {
      [this.order[this._selected], this.order[i]] = [this.order[i], this.order[this._selected]];
      this._selected = null;
      this.fragEls.forEach((el, j) => { el.textContent = this.order[j]; el.classList.remove('keylk-sel'); });
    }
  }

  _testPhase1() {
    if (this.order.every((v, i) => v === this.fragments[i])) {
      this.statusEl.textContent = '✅ Key assembled!';
      this.phase = 2;
      setTimeout(() => this._render(), 800);
    } else {
      this.statusEl.textContent = '❌ Wrong order';
      this.fragEls.forEach(el => { el.classList.add('keylk-shake'); setTimeout(() => el.classList.remove('keylk-shake'), 600); });
    }
  }

  _testPhase2() {
    if (this.input.value.trim().toLowerCase() === this.decrypted.toLowerCase()) {
      this.statusEl.textContent = '✅ Message decrypted!';
      setTimeout(() => this.onSubmit(true), 400);
    } else {
      this.statusEl.textContent = '❌ Decryption failed';
      this.input.classList.add('keylk-shake');
      setTimeout(() => this.input.classList.remove('keylk-shake'), 600);
    }
  }

  reset() { this.phase = 1; this.order = this._shuffle([...this.fragments]); this._selected = null; this._render(); }

  _injectStyles() {
    if (document.getElementById('keylk-css')) return;
    const s = document.createElement('style');
    s.id = 'keylk-css';
    s.textContent = `
.keylk{display:flex;flex-direction:column;align-items:center;gap:12px;padding:16px 0;max-width:340px;margin:0 auto}
.keylk-title{font-size:14px;font-weight:700;color:var(--text,#e0e6f0)}
.keylk-hint{font-size:12px;color:var(--muted,#7a8ba8)}
.keylk-frags{display:flex;gap:8px}
.keylk-frag{padding:12px 16px;background:var(--surface,#141b2d);border:2px solid var(--border,#1e2a45);border-radius:8px;font-size:16px;font-weight:700;color:var(--accent,#3b82f6);cursor:pointer;font-family:monospace;transition:all .15s;user-select:none}
.keylk-frag.keylk-sel{border-color:var(--accent,#3b82f6);box-shadow:0 0 10px rgba(59,130,246,.3)}
.keylk-shake{animation:keylk-sh .4s}
@keyframes keylk-sh{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
.keylk-key{font-size:16px;font-weight:700;color:var(--green,#22c55e);font-family:monospace}
.keylk-cipher{padding:10px 16px;background:#0c0c0c;border:1px solid var(--border,#1e2a45);border-radius:6px;font-family:monospace;font-size:14px;color:var(--muted,#7a8ba8);letter-spacing:1px}
.keylk-input-row{display:flex;gap:8px;width:100%}
.keylk-input{flex:1;padding:10px;background:var(--bg,#0a0e17);border:1px solid var(--border,#1e2a45);border-radius:6px;color:var(--text,#e0e6f0);font-size:14px;font-family:monospace}
.keylk-input:focus{outline:none;border-color:var(--accent,#3b82f6)}
.keylk-btn{padding:10px 20px;border:none;border-radius:8px;background:var(--accent,#3b82f6);color:#fff;font-size:14px;font-weight:600;cursor:pointer;white-space:nowrap}
.keylk-btn:active{opacity:.7}
.keylk-status{font-size:13px;color:var(--muted,#7a8ba8);min-height:18px}
`;
    document.head.appendChild(s);
  }
}
