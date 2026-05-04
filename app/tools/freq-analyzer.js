/**
 * Frequency Analyzer Tool
 *
 * Letter frequency bar chart for input text. Helps crack substitution ciphers.
 *
 * Usage:
 *   new FreqAnalyzer(containerEl, { initialValue: 'HELLO WORLD' });
 */

class FreqAnalyzer {
  constructor(container, opts = {}) {
    this.container = container;
    this._render();
    if (opts.initialValue) { this.input.value = opts.initialValue; this._analyze(); }
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'freq';

    this.input = document.createElement('textarea');
    this.input.className = 'freq-input';
    this.input.placeholder = 'Paste text to analyze...';
    this.input.rows = 3;
    this.input.spellcheck = false;
    this.input.addEventListener('input', () => this._analyze());
    wrap.appendChild(this.input);

    this.chartEl = document.createElement('div');
    this.chartEl.className = 'freq-chart';
    wrap.appendChild(this.chartEl);

    this.container.appendChild(wrap);
    this._injectStyles();
    this._drawEmpty();
  }

  _drawEmpty() {
    this.chartEl.innerHTML = '';
    for (let i = 0; i < 26; i++) {
      const col = document.createElement('div');
      col.className = 'freq-col';
      const bar = document.createElement('div');
      bar.className = 'freq-bar';
      bar.style.height = '0%';
      const lbl = document.createElement('div');
      lbl.className = 'freq-lbl';
      lbl.textContent = String.fromCharCode(65 + i);
      col.appendChild(bar);
      col.appendChild(lbl);
      this.chartEl.appendChild(col);
    }
  }

  _analyze() {
    const text = this.input.value.toUpperCase();
    const counts = new Array(26).fill(0);
    let total = 0;
    for (const ch of text) {
      const idx = ch.charCodeAt(0) - 65;
      if (idx >= 0 && idx < 26) { counts[idx]++; total++; }
    }
    const max = Math.max(...counts, 1);
    const bars = this.chartEl.querySelectorAll('.freq-bar');
    const cols = this.chartEl.querySelectorAll('.freq-col');
    counts.forEach((c, i) => {
      const pct = (c / max) * 100;
      bars[i].style.height = `${pct}%`;
      bars[i].title = `${String.fromCharCode(65 + i)}: ${c} (${total ? ((c / total) * 100).toFixed(1) : 0}%)`;
      cols[i].classList.toggle('freq-active', c > 0);
    });
  }

  _injectStyles() {
    if (document.getElementById('freq-css')) return;
    const s = document.createElement('style');
    s.id = 'freq-css';
    s.textContent = `
.freq{display:flex;flex-direction:column;gap:12px;padding:12px 0;max-width:340px;margin:0 auto}
.freq-input{width:100%;padding:10px;background:var(--bg,#0a0e17);border:1px solid var(--border,#1e2a45);border-radius:6px;color:var(--text,#e0e6f0);font-family:monospace;font-size:13px;resize:vertical}
.freq-input:focus{outline:none;border-color:var(--accent,#3b82f6)}
.freq-chart{display:flex;align-items:flex-end;gap:2px;height:100px;padding:8px 4px;background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);border-radius:6px}
.freq-col{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%}
.freq-bar{width:100%;background:var(--accent,#3b82f6);border-radius:2px 2px 0 0;transition:height .2s;min-height:0}
.freq-active .freq-bar{opacity:1}
.freq-lbl{font-size:8px;color:var(--muted,#7a8ba8);margin-top:3px;font-weight:600}
.freq-active .freq-lbl{color:var(--text,#e0e6f0)}
`;
    document.head.appendChild(s);
  }
}
