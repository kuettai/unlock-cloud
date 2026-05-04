/**
 * Hex Decoder Tool
 *
 * Convert hex string to ASCII text and vice versa.
 *
 * Usage:
 *   new HexDecoder(containerEl, { initialValue: '4f50454e' });
 */

class HexDecoder {
  constructor(container, opts = {}) {
    this.container = container;
    this._render();
    if (opts.initialValue) { this.hexInput.value = opts.initialValue; this._decode(); }
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'hexd';

    // Hex input
    const hexRow = document.createElement('div');
    hexRow.className = 'hexd-row';
    const hexLbl = document.createElement('label');
    hexLbl.className = 'hexd-label';
    hexLbl.textContent = 'Hex';
    this.hexInput = document.createElement('input');
    this.hexInput.className = 'hexd-input';
    this.hexInput.placeholder = '4f 50 45 4e';
    this.hexInput.spellcheck = false;
    this.hexInput.addEventListener('input', () => this._decode());
    hexRow.appendChild(hexLbl);
    hexRow.appendChild(this.hexInput);
    wrap.appendChild(hexRow);

    // ASCII output
    const ascRow = document.createElement('div');
    ascRow.className = 'hexd-row';
    const ascLbl = document.createElement('label');
    ascLbl.className = 'hexd-label';
    ascLbl.textContent = 'ASCII';
    this.ascInput = document.createElement('input');
    this.ascInput.className = 'hexd-input';
    this.ascInput.placeholder = 'OPEN';
    this.ascInput.spellcheck = false;
    this.ascInput.addEventListener('input', () => this._encode());
    ascRow.appendChild(ascLbl);
    ascRow.appendChild(this.ascInput);
    wrap.appendChild(ascRow);

    this.container.appendChild(wrap);
    this._injectStyles();
  }

  _decode() {
    const hex = this.hexInput.value.replace(/\s+/g, '');
    let out = '';
    for (let i = 0; i < hex.length; i += 2) {
      const code = parseInt(hex.substr(i, 2), 16);
      if (!isNaN(code)) out += String.fromCharCode(code);
    }
    this.ascInput.value = out;
  }

  _encode() {
    this.hexInput.value = [...this.ascInput.value].map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ').toUpperCase();
  }

  _injectStyles() {
    if (document.getElementById('hexd-css')) return;
    const s = document.createElement('style');
    s.id = 'hexd-css';
    s.textContent = `
.hexd{display:flex;flex-direction:column;gap:10px;padding:12px 0;max-width:300px;margin:0 auto}
.hexd-row{display:flex;align-items:center;gap:10px}
.hexd-label{font-size:12px;font-weight:700;color:var(--muted,#7a8ba8);min-width:44px;text-align:right}
.hexd-input{flex:1;padding:10px;background:var(--bg,#0a0e17);border:1px solid var(--border,#1e2a45);border-radius:6px;color:var(--text,#e0e6f0);font-family:monospace;font-size:14px}
.hexd-input:focus{outline:none;border-color:var(--accent,#3b82f6)}
`;
    document.head.appendChild(s);
  }
}
