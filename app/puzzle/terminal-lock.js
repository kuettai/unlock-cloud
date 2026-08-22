/**
 * Terminal Lock Puzzle
 *
 * Fake CLI prompt. Player types a specific command to unlock.
 *
 * Usage:
 *   new TerminalLock(containerEl, {
 *     prompt: 'admin@cloud:~$',
 *     answer: 'aws s3 ls',
 *     caseSensitive: false,
 *     history: ['System breach detected.', 'Enter override command:'],
 *     falseOutputs: ['bash: command not found', 'Permission denied'],
 *     onSubmit(correct) { ... },
 *     onWrong(message) { ... }
 *   });
 */

class TerminalLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.prompt = opts.prompt || '$';
    this.answer = opts.answer || '';
    this.caseSensitive = opts.caseSensitive || false;
    this.history = opts.history || [];
    this.falseOutputs = opts.falseOutputs || [];
    this.onSubmit = opts.onSubmit || (() => {});
    this.onWrong = opts.onWrong || (() => {});
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'trmlk';

    this.output = document.createElement('div');
    this.output.className = 'trmlk-output';
    this.history.forEach(line => this._addLine(line, 'trmlk-sys'));
    wrap.appendChild(this.output);

    const inputRow = document.createElement('div');
    inputRow.className = 'trmlk-row';
    const promptEl = document.createElement('span');
    promptEl.className = 'trmlk-prompt';
    promptEl.textContent = this.prompt + ' ';
    this.input = document.createElement('input');
    this.input.className = 'trmlk-input';
    this.input.type = 'text';
    this.input.autocomplete = 'off';
    this.input.spellcheck = false;
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this._submit();
    });
    inputRow.appendChild(promptEl);
    inputRow.appendChild(this.input);
    wrap.appendChild(inputRow);

    this.container.appendChild(wrap);
    this._injectStyles();
    this.input.focus();
  }

  _addLine(text, cls) {
    const line = document.createElement('div');
    line.className = `trmlk-line ${cls || ''}`;
    line.textContent = text;
    this.output.appendChild(line);
    this.output.scrollTop = this.output.scrollHeight;
  }

  _submit() {
    const val = this.input.value.trim();
    if (!val) return;
    this._addLine(`${this.prompt} ${val}`, 'trmlk-cmd');
    this.input.value = '';

    const a = this.caseSensitive ? this.answer : this.answer.toLowerCase();
    const v = this.caseSensitive ? val : val.toLowerCase();

    if (v === a) {
      this._addLine('✅ Access granted.', 'trmlk-ok');
      this.input.disabled = true;
      setTimeout(() => this.onSubmit(true), 400);
    } else {
      const msg = this.falseOutputs.length
        ? this.falseOutputs[Math.floor(Math.random() * this.falseOutputs.length)]
        : 'Command not recognized.';
      this._addLine(msg, 'trmlk-err');
      this.onWrong(msg);
    }
  }

  reset() {
    this.output.innerHTML = '';
    this.history.forEach(line => this._addLine(line, 'trmlk-sys'));
    this.input.value = '';
    this.input.disabled = false;
    this.input.focus();
  }

  _injectStyles() {
    if (document.getElementById('trmlk-css')) return;
    const s = document.createElement('style');
    s.id = 'trmlk-css';
    s.textContent = `
.trmlk{background:#0c0c0c;border:1px solid #1e2a45;border-radius:10px;padding:14px;font-family:'Courier New',monospace;font-size:13px;max-width:360px;margin:0 auto}
.trmlk-output{max-height:160px;overflow-y:auto;margin-bottom:10px}
.trmlk-line{padding:2px 0;word-break:break-all}
.trmlk-sys{color:#7a8ba8}
.trmlk-cmd{color:#e0e6f0}
.trmlk-ok{color:#22c55e;font-weight:700}
.trmlk-err{color:#ef4444}
.trmlk-row{display:flex;align-items:center}
.trmlk-prompt{color:#22c55e;white-space:pre;flex-shrink:0}
.trmlk-input{flex:1;background:transparent;border:none;color:#e0e6f0;font-family:inherit;font-size:inherit;outline:none;caret-color:#22c55e}
`;
    document.head.appendChild(s);
  }
}
