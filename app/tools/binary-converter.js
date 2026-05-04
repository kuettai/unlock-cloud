/**
 * Binary Converter Tool
 *
 * Convert between binary, decimal, and hex. Type in any field, others update live.
 *
 * Usage:
 *   new BinaryConverter(containerEl, { initialValue: '10110001' });
 */

class BinaryConverter {
  constructor(container, opts = {}) {
    this.container = container;
    this._render();
    if (opts.initialValue) { this.binInput.value = opts.initialValue; this._fromBin(); }
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'binconv';

    const fields = [
      { label: 'Binary', id: 'bin', placeholder: '10110001', handler: () => this._fromBin() },
      { label: 'Decimal', id: 'dec', placeholder: '177', handler: () => this._fromDec() },
      { label: 'Hex', id: 'hex', placeholder: 'B1', handler: () => this._fromHex() },
    ];

    fields.forEach(f => {
      const row = document.createElement('div');
      row.className = 'binconv-row';
      const lbl = document.createElement('label');
      lbl.className = 'binconv-label';
      lbl.textContent = f.label;
      const input = document.createElement('input');
      input.className = 'binconv-input';
      input.type = 'text';
      input.placeholder = f.placeholder;
      input.spellcheck = false;
      input.addEventListener('input', f.handler);
      row.appendChild(lbl);
      row.appendChild(input);
      wrap.appendChild(row);
      this[f.id + 'Input'] = input;
    });

    this.container.appendChild(wrap);
    this._injectStyles();
  }

  _fromBin() {
    const v = parseInt(this.binInput.value, 2);
    if (isNaN(v)) { this.decInput.value = ''; this.hexInput.value = ''; return; }
    this.decInput.value = v;
    this.hexInput.value = v.toString(16).toUpperCase();
  }

  _fromDec() {
    const v = parseInt(this.decInput.value, 10);
    if (isNaN(v)) { this.binInput.value = ''; this.hexInput.value = ''; return; }
    this.binInput.value = v.toString(2);
    this.hexInput.value = v.toString(16).toUpperCase();
  }

  _fromHex() {
    const v = parseInt(this.hexInput.value, 16);
    if (isNaN(v)) { this.binInput.value = ''; this.decInput.value = ''; return; }
    this.binInput.value = v.toString(2);
    this.decInput.value = v;
  }

  _injectStyles() {
    if (document.getElementById('binconv-css')) return;
    const s = document.createElement('style');
    s.id = 'binconv-css';
    s.textContent = `
.binconv{display:flex;flex-direction:column;gap:10px;padding:12px 0;max-width:300px;margin:0 auto}
.binconv-row{display:flex;align-items:center;gap:10px}
.binconv-label{font-size:12px;font-weight:700;color:var(--muted,#7a8ba8);min-width:60px;text-align:right}
.binconv-input{flex:1;padding:10px;background:var(--bg,#0a0e17);border:1px solid var(--border,#1e2a45);border-radius:6px;color:var(--text,#e0e6f0);font-family:monospace;font-size:14px}
.binconv-input:focus{outline:none;border-color:var(--accent,#3b82f6)}
`;
    document.head.appendChild(s);
  }
}
