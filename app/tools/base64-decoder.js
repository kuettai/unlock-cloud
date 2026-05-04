/**
 * Base64 Decoder Tool
 *
 * Interactive decoder with input field, live output, and copy button.
 * Purely a tool — no submit/solve logic. Pair with another lock for the answer.
 *
 * Usage:
 *   new Base64Decoder(containerEl, {
 *     initialValue: 'dW5sb2Nr',  // optional pre-filled value
 *   });
 */

class Base64Decoder {
  constructor(container, opts = {}) {
    this.container = container;
    this.initialValue = opts.initialValue || '';
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'b64d';

    const label = document.createElement('div');
    label.className = 'b64d-label';
    label.textContent = 'Base64 Decoder';
    wrap.appendChild(label);

    const input = document.createElement('input');
    input.className = 'b64d-input';
    input.type = 'text';
    input.placeholder = 'Paste encoded text...';
    input.value = this.initialValue;
    wrap.appendChild(input);

    const outRow = document.createElement('div');
    outRow.className = 'b64d-out-row';

    const output = document.createElement('div');
    output.className = 'b64d-output';
    output.textContent = this.initialValue ? this._decode(this.initialValue) : '';
    outRow.appendChild(output);

    const copyBtn = document.createElement('button');
    copyBtn.className = 'b64d-copy';
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', () => {
      const text = output.textContent;
      if (text && text !== '...') {
        navigator.clipboard.writeText(text).catch(() => {});
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1200);
      }
    });
    outRow.appendChild(copyBtn);
    wrap.appendChild(outRow);

    input.addEventListener('input', () => {
      output.textContent = this._decode(input.value);
    });

    this.container.appendChild(wrap);
    this._injectStyles();
  }

  _decode(val) {
    try { return atob(val); }
    catch { return '...'; }
  }

  _injectStyles() {
    if (document.getElementById('b64d-css')) return;
    const s = document.createElement('style');
    s.id = 'b64d-css';
    s.textContent = `
.b64d{background:var(--bg,#0a0e17);border:1px solid var(--border,#1e2a45);border-radius:8px;padding:12px;margin-top:12px}
.b64d-label{font-size:12px;color:var(--muted,#7a8ba8);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px}
.b64d-input{width:100%;padding:8px;background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);border-radius:6px;color:var(--text,#e0e6f0);font-family:monospace;font-size:14px}
.b64d-input:focus{outline:none;border-color:var(--accent,#3b82f6)}
.b64d-out-row{display:flex;gap:8px;margin-top:8px;align-items:center}
.b64d-output{flex:1;padding:8px;background:var(--surface,#141b2d);border-radius:6px;font-family:monospace;font-size:14px;color:var(--green,#22c55e);min-height:32px}
.b64d-copy{padding:6px 12px;border:1px solid var(--border,#1e2a45);border-radius:6px;background:var(--surface,#141b2d);color:var(--muted,#7a8ba8);font-size:12px;cursor:pointer;white-space:nowrap}
.b64d-copy:active{opacity:.7}
`;
    document.head.appendChild(s);
  }
}
