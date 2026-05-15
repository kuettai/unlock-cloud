/**
 * Image Prompt Lock Puzzle
 *
 * Iterative image generation. Select attributes, generate, get feedback, refine.
 *
 * Usage:
 *   new ImagePromptLock(containerEl, {
 *     commissions: [{ noble, target: {color,material,style}, desc, feedback: {color:{wrong:'msg'},..} }],
 *     options: { color: [...], material: [...], style: [...] },
 *     maxAttempts: 5,
 *     onSubmit() { }
 *   });
 */
class ImagePromptLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.commissions = opts.commissions || [];
    this.options = opts.options || {};
    this.maxAttempts = opts.maxAttempts || 5;
    this.onSubmit = opts.onSubmit || (() => {});
    this.current = 0;
    this.choices = this.commissions.map(() => ({}));
    this.attempts = [];
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const w = document.createElement('div'); w.className = 'iplk';
    const c = this.commissions[this.current];
    const ch = this.choices[this.current];

    // Tabs
    const tabs = document.createElement('div'); tabs.className = 'iplk-tabs';
    this.commissions.forEach((cm, i) => {
      const done = this.attempts.some(a => a.idx === i && a.correct);
      const btn = document.createElement('button');
      btn.className = 'iplk-tab' + (i === this.current ? ' iplk-tab-on' : '') + (done ? ' iplk-tab-done' : '');
      btn.textContent = (done ? '✅ ' : '') + cm.noble;
      btn.addEventListener('click', () => { this.current = i; this._render(); });
      tabs.appendChild(btn);
    });
    w.appendChild(tabs);

    // Request
    const req = document.createElement('div'); req.className = 'iplk-req';
    req.innerHTML = `<strong>${c.noble}</strong><br><span class="iplk-desc">${c.desc}</span>`;
    w.appendChild(req);

    // Last attempt result
    const last = this.attempts.filter(a => a.idx === this.current).slice(-1)[0];
    if (last) {
      const res = document.createElement('div'); res.className = 'iplk-canvas' + (last.correct ? ' iplk-canvas-ok' : '');
      res.innerHTML = `<div style="font-size:1.5rem;">${last.correct ? '🎨✅' : '🎨❌'}</div><div class="iplk-canvas-prompt">"${last.color} + ${last.material} + ${last.style}"</div><div class="iplk-canvas-fb">${last.feedback}</div>`;
      w.appendChild(res);
    }

    // Options
    Object.entries(this.options).forEach(([key, opts]) => {
      const row = document.createElement('div'); row.className = 'iplk-row';
      row.innerHTML = `<span class="iplk-label">${key}:</span>`;
      const btns = document.createElement('div'); btns.className = 'iplk-opts';
      opts.forEach(o => {
        const btn = document.createElement('button');
        btn.className = 'iplk-opt' + (ch[key] === o ? ' iplk-opt-on' : '');
        btn.textContent = o;
        btn.addEventListener('click', () => { this.choices[this.current][key] = o; this._render(); });
        btns.appendChild(btn);
      });
      row.appendChild(btns); w.appendChild(row);
    });

    // Generate button
    const bar = document.createElement('div'); bar.className = 'iplk-bar';
    const gen = document.createElement('button'); gen.className = 'iplk-btn'; gen.textContent = '🎨 Generate';
    gen.addEventListener('click', () => this._generate());
    bar.appendChild(gen);
    w.appendChild(bar);

    // Attempt counter
    const hist = this.attempts.filter(a => a.idx === this.current);
    if (hist.length) {
      const counter = document.createElement('div'); counter.className = 'iplk-counter';
      counter.textContent = `Attempts: ${hist.length}/${this.maxAttempts}`;
      w.appendChild(counter);
    }

    this.container.appendChild(w); this._injectStyles();

    // Check all done
    if (this.commissions.every((_, i) => this.attempts.some(a => a.idx === i && a.correct))) {
      setTimeout(() => this.onSubmit(true), 400);
    }
  }

  _generate() {
    const c = this.commissions[this.current];
    const ch = this.choices[this.current];
    if (!ch.color || !ch.material || !ch.style) return;

    const correct = ch.color === c.target.color && ch.material === c.target.material && ch.style === c.target.style;
    let feedback = '';
    if (correct) { feedback = 'Perfect. Exactly what I envisioned.'; }
    else {
      const wrong = Object.keys(c.target).find(k => ch[k] !== c.target[k]);
      feedback = c.feedback?.[wrong]?.[ch[wrong]] || 'Not quite right. Try again.';
    }
    this.attempts.push({ idx: this.current, ...ch, correct, feedback });
    this._render();
  }

  _injectStyles() {
    if (document.getElementById('iplk-css')) return;
    const s = document.createElement('style'); s.id = 'iplk-css';
    s.textContent = `
.iplk{display:flex;flex-direction:column;gap:10px;padding:16px 0;max-width:420px;margin:0 auto}
.iplk-tabs{display:flex;gap:4px;flex-wrap:wrap}
.iplk-tab{padding:6px 10px;border:2px solid var(--border,#1e2a45);background:var(--bg,#0a0e17);border-radius:6px;font-size:11px;color:var(--muted,#7a8ba8);cursor:pointer}
.iplk-tab.iplk-tab-on{border-color:var(--accent,#3b82f6);color:var(--text,#e0e6f0)}
.iplk-tab.iplk-tab-done{border-color:var(--green,#22c55e);color:var(--green,#22c55e)}
.iplk-req{padding:10px;background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);border-radius:8px;font-size:13px;color:var(--text,#e0e6f0)}
.iplk-desc{color:var(--muted,#7a8ba8);font-style:italic;font-size:12px}
.iplk-canvas{text-align:center;padding:12px;background:var(--bg,#0a0e17);border:2px solid var(--border,#1e2a45);border-radius:8px}
.iplk-canvas.iplk-canvas-ok{border-color:var(--green,#22c55e)}
.iplk-canvas-prompt{font-size:12px;color:var(--text,#e0e6f0);margin:4px 0}
.iplk-canvas-fb{font-size:12px;font-style:italic;color:var(--muted,#7a8ba8)}
.iplk-row{display:flex;align-items:flex-start;gap:8px}
.iplk-label{font-size:11px;color:var(--muted,#7a8ba8);text-transform:uppercase;min-width:55px;padding-top:6px}
.iplk-opts{display:flex;flex-wrap:wrap;gap:4px}
.iplk-opt{padding:5px 9px;background:var(--bg,#0a0e17);border:2px solid var(--border,#1e2a45);border-radius:4px;font-size:11px;color:var(--muted,#7a8ba8);cursor:pointer;transition:all .15s}
.iplk-opt.iplk-opt-on{border-color:var(--accent,#3b82f6);color:var(--text,#e0e6f0);background:var(--surface,#141b2d)}
.iplk-bar{text-align:center}
.iplk-btn{padding:10px 20px;background:var(--accent,#3b82f6);color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer}
.iplk-counter{text-align:center;font-size:11px;color:var(--muted,#7a8ba8)}
`;
    document.head.appendChild(s);
  }
}
