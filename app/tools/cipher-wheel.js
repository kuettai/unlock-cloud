/**
 * Cipher Wheel Tool
 *
 * Caesar shift with adjustable offset. Type ciphertext, drag slider to find plaintext.
 *
 * Usage:
 *   new CipherWheel(containerEl, { initialValue: 'XQORFN' });
 */

class CipherWheel {
  constructor(container, opts = {}) {
    this.container = container;
    this._render();
    if (opts.initialValue) { this.input.value = opts.initialValue; this._shift(); }
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'cipher';

    // Input
    const inRow = document.createElement('div');
    inRow.className = 'cipher-row';
    const inLbl = document.createElement('label');
    inLbl.className = 'cipher-label';
    inLbl.textContent = 'Input';
    this.input = document.createElement('input');
    this.input.className = 'cipher-input';
    this.input.placeholder = 'XQORFN';
    this.input.spellcheck = false;
    this.input.addEventListener('input', () => this._shift());
    inRow.appendChild(inLbl);
    inRow.appendChild(this.input);
    wrap.appendChild(inRow);

    // Offset slider
    const sliderRow = document.createElement('div');
    sliderRow.className = 'cipher-row';
    const sliderLbl = document.createElement('label');
    sliderLbl.className = 'cipher-label';
    sliderLbl.textContent = 'Shift';
    this.slider = document.createElement('input');
    this.slider.type = 'range';
    this.slider.min = 0;
    this.slider.max = 25;
    this.slider.value = 0;
    this.slider.className = 'cipher-slider';
    this.offsetEl = document.createElement('span');
    this.offsetEl.className = 'cipher-offset';
    this.offsetEl.textContent = '0';
    this.slider.addEventListener('input', () => { this.offsetEl.textContent = this.slider.value; this._shift(); });
    sliderRow.appendChild(sliderLbl);
    sliderRow.appendChild(this.slider);
    sliderRow.appendChild(this.offsetEl);
    wrap.appendChild(sliderRow);

    // Output
    this.outputEl = document.createElement('div');
    this.outputEl.className = 'cipher-output';
    this.outputEl.textContent = '...';
    wrap.appendChild(this.outputEl);

    // Quick ROT13 button
    const bar = document.createElement('div');
    bar.className = 'cipher-bar';
    const rot13 = document.createElement('button');
    rot13.className = 'cipher-btn';
    rot13.textContent = 'ROT13';
    rot13.addEventListener('click', () => { this.slider.value = 13; this.offsetEl.textContent = '13'; this._shift(); });
    bar.appendChild(rot13);
    wrap.appendChild(bar);

    this.container.appendChild(wrap);
    this._injectStyles();
  }

  _shift() {
    const offset = parseInt(this.slider.value);
    const text = this.input.value;
    let out = '';
    for (const ch of text) {
      if (/[A-Z]/.test(ch)) out += String.fromCharCode(((ch.charCodeAt(0) - 65 + offset) % 26) + 65);
      else if (/[a-z]/.test(ch)) out += String.fromCharCode(((ch.charCodeAt(0) - 97 + offset) % 26) + 97);
      else out += ch;
    }
    this.outputEl.textContent = out || '...';
  }

  _injectStyles() {
    if (document.getElementById('cipher-css')) return;
    const s = document.createElement('style');
    s.id = 'cipher-css';
    s.textContent = `
.cipher{display:flex;flex-direction:column;gap:12px;padding:12px 0;max-width:300px;margin:0 auto}
.cipher-row{display:flex;align-items:center;gap:10px}
.cipher-label{font-size:12px;font-weight:700;color:var(--muted,#7a8ba8);min-width:40px;text-align:right}
.cipher-input{flex:1;padding:10px;background:var(--bg,#0a0e17);border:1px solid var(--border,#1e2a45);border-radius:6px;color:var(--text,#e0e6f0);font-family:monospace;font-size:14px}
.cipher-input:focus{outline:none;border-color:var(--accent,#3b82f6)}
.cipher-slider{flex:1}
.cipher-offset{font-size:16px;font-weight:700;color:var(--accent,#3b82f6);min-width:24px;text-align:center}
.cipher-output{padding:12px;background:#0c0c0c;border:1px solid var(--border,#1e2a45);border-radius:6px;font-family:monospace;font-size:16px;color:var(--green,#22c55e);text-align:center;letter-spacing:2px;min-height:42px}
.cipher-bar{display:flex;justify-content:center}
.cipher-btn{padding:6px 16px;border:none;border-radius:6px;background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);color:var(--muted,#7a8ba8);font-size:12px;font-weight:600;cursor:pointer}
.cipher-btn:active{opacity:.7}
`;
    document.head.appendChild(s);
  }
}
