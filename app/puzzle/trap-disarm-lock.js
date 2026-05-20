/**
 * Trap Disarm Lock Puzzle
 *
 * A bomb/trap panel with wires to cut. The player sees the panel (wire colors,
 * positions) but the disarm rules are partially obscured — they must deduce
 * which wires to cut based on incomplete instructions.
 *
 * Each wire has visible properties (color, position, label fragment).
 * The manual gives conditional rules: "If red is in position 3, cut it"
 * but some conditions are hidden, forcing deduction.
 *
 * Wrong cuts trigger strikes. 3 strikes = fail.
 *
 * Inspired by Keep Talking and Nobody Explodes.
 *
 * Usage:
 *   new TrapDisarmLock(containerEl, {
 *     wires: [
 *       { id: 'w1', color: 'red', label: 'MAIN', position: 1 },
 *       { id: 'w2', color: 'blue', label: 'AUX', position: 2 },
 *       { id: 'w3', color: 'yellow', label: 'BACKUP', position: 3 },
 *       { id: 'w4', color: 'green', label: 'GROUND', position: 4 },
 *     ],
 *     rules: [
 *       { text: 'If a wire is labeled "███", do NOT cut it.', hint: 'GROUND' },
 *       { text: 'Cut the wire in position ██ first.', hint: '2' },
 *       { text: 'Never cut red unless it is in position 1.', hint: null },
 *       { text: 'The last wire to cut is colored ██████.', hint: 'yellow' },
 *     ],
 *     solution: ['w2', 'w1', 'w3'],  // correct cut order
 *     maxStrikes: 3,
 *     onSubmit(correct) { ... },
 *     onFail() { ... }
 *   });
 */

class TrapDisarmLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.wires = opts.wires || [];
    this.rules = opts.rules || [];
    this.solution = opts.solution || [];
    this.maxStrikes = opts.maxStrikes || 3;
    this.onSubmit = opts.onSubmit || (() => {});
    this.onFail = opts.onFail || (() => {});

    this._init();
  }

  _init() {
    this.cuts = [];
    this.strikes = 0;
    this.won = false;
    this.failed = false;
    this.lastCut = null;
    this.message = null;
    this._render();
  }

  _cut(wireId) {
    if (this.won || this.failed) return;
    if (this.cuts.includes(wireId)) return;

    const expectedIdx = this.cuts.length;
    const expected = this.solution[expectedIdx];

    this.lastCut = wireId;
    this.cuts.push(wireId);

    if (wireId === expected) {
      this.message = { text: 'Correct cut.', type: 'good' };
      if (this.cuts.length === this.solution.length) {
        this.won = true;
        this.message = { text: 'Trap disarmed!', type: 'win' };
        setTimeout(() => this.onSubmit(true), 600);
      }
    } else {
      this.cuts.pop();
      this.strikes++;
      this.message = { text: `Wrong wire! Strike ${this.strikes}/${this.maxStrikes}`, type: 'bad' };
      if (this.strikes >= this.maxStrikes) {
        this.failed = true;
        this.message = { text: 'Too many strikes — trap triggered!', type: 'fail' };
        this.onFail();
      }
    }

    this._render();
  }

  reset() { this._init(); }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'tdlk';

    // Strikes indicator
    const strikes = document.createElement('div');
    strikes.className = 'tdlk-strikes';
    strikes.innerHTML = Array.from({ length: this.maxStrikes }, (_, i) =>
      `<span class="tdlk-strike ${i < this.strikes ? 'tdlk-strike-used' : ''}">✕</span>`
    ).join('') + `<span class="tdlk-strike-label">${this.strikes}/${this.maxStrikes} strikes</span>`;
    wrap.appendChild(strikes);

    // Wire panel
    const panel = document.createElement('div');
    panel.className = 'tdlk-panel' + (this.failed ? ' tdlk-panel-failed' : '') + (this.won ? ' tdlk-panel-disarmed' : '');

    this.wires.forEach(wire => {
      const isCut = this.cuts.includes(wire.id);
      const isWrongLast = this.lastCut === wire.id && !this.cuts.includes(wire.id) && this.message?.type === 'bad';
      const el = document.createElement('button');
      el.className = 'tdlk-wire';
      if (isCut) el.classList.add('tdlk-wire-cut');
      if (isWrongLast) el.classList.add('tdlk-wire-spark');
      el.disabled = isCut || this.won || this.failed;
      el.style.setProperty('--wire-color', this._getWireCSS(wire.color));
      el.innerHTML = `
        <span class="tdlk-wire-line"></span>
        <span class="tdlk-wire-info">
          <span class="tdlk-wire-color">${wire.color.toUpperCase()}</span>
          <span class="tdlk-wire-label">${wire.label}</span>
          <span class="tdlk-wire-pos">Pos ${wire.position}</span>
        </span>
        ${isCut ? '<span class="tdlk-wire-status">✓ CUT</span>' : '<span class="tdlk-wire-action">✂️</span>'}`;
      el.addEventListener('click', () => this._cut(wire.id));
      panel.appendChild(el);
    });
    wrap.appendChild(panel);

    // Progress
    if (this.cuts.length > 0 && !this.won && !this.failed) {
      const prog = document.createElement('div');
      prog.className = 'tdlk-progress';
      prog.textContent = `${this.cuts.length}/${this.solution.length} wires cut`;
      wrap.appendChild(prog);
    }

    // Message
    if (this.message) {
      const msg = document.createElement('div');
      msg.className = `tdlk-msg tdlk-msg-${this.message.type}`;
      msg.textContent = this.message.text;
      wrap.appendChild(msg);
    }

    // Manual (rules)
    const manual = document.createElement('div');
    manual.className = 'tdlk-manual';
    manual.innerHTML = '<div class="tdlk-manual-title">📋 Disarm Manual</div>';
    this.rules.forEach(rule => {
      const row = document.createElement('div');
      row.className = 'tdlk-rule';
      row.textContent = rule.text;
      manual.appendChild(row);
    });
    wrap.appendChild(manual);

    // Retry on fail
    if (this.failed) {
      const btn = document.createElement('button');
      btn.className = 'tdlk-btn';
      btn.textContent = 'Retry';
      btn.addEventListener('click', () => this.reset());
      wrap.appendChild(btn);
    }

    this.container.appendChild(wrap);
    this._injectStyles();
  }

  _getWireCSS(color) {
    const map = { red: '#ef4444', blue: '#3b82f6', yellow: '#eab308', green: '#22c55e', white: '#e0e6f0', purple: '#a855f7', orange: '#f97316' };
    return map[color] || '#7a8ba8';
  }

  _injectStyles() {
    if (document.getElementById('tdlk-css')) return;
    const s = document.createElement('style'); s.id = 'tdlk-css';
    s.textContent = `
.tdlk{display:flex;flex-direction:column;gap:12px;padding:16px 0;max-width:420px;margin:0 auto}
.tdlk-strikes{display:flex;align-items:center;gap:6px;justify-content:center}
.tdlk-strike{width:22px;height:22px;display:flex;align-items:center;justify-content:center;border-radius:50%;border:2px solid var(--border,#1e2a45);color:var(--border,#1e2a45);font-size:11px;font-weight:700}
.tdlk-strike-used{border-color:var(--red,#ef4444);color:var(--red,#ef4444);background:rgba(239,68,68,.1)}
.tdlk-strike-label{font-size:10px;color:var(--muted,#7a8ba8);margin-left:6px}
.tdlk-panel{display:flex;flex-direction:column;gap:4px;padding:14px;background:var(--surface,#141b2d);border:2px solid var(--border,#1e2a45);border-radius:10px;transition:all .3s}
.tdlk-panel-failed{border-color:var(--red,#ef4444);background:rgba(239,68,68,.05);animation:tdlk-shake .4s}
.tdlk-panel-disarmed{border-color:var(--green,#22c55e);background:rgba(34,197,94,.05)}
@keyframes tdlk-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-4px)}40%{transform:translateX(4px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
.tdlk-wire{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--bg,#0a0e17);border:1px solid var(--border,#1e2a45);border-radius:6px;cursor:pointer;transition:all .15s;text-align:left;color:var(--text,#e0e6f0)}
.tdlk-wire:hover:not(:disabled){border-color:var(--wire-color);background:rgba(255,255,255,.02)}
.tdlk-wire:active:not(:disabled){transform:scale(.98)}
.tdlk-wire:disabled{cursor:default;opacity:.6}
.tdlk-wire-cut{border-color:var(--green,#22c55e);background:rgba(34,197,94,.05);opacity:1}
.tdlk-wire-spark{animation:tdlk-spark .5s;border-color:var(--red,#ef4444)}
@keyframes tdlk-spark{0%{background:rgba(239,68,68,.3)}50%{background:rgba(239,68,68,.1)}100%{background:var(--bg,#0a0e17)}}
.tdlk-wire-line{width:40px;height:4px;border-radius:2px;background:var(--wire-color);flex-shrink:0;box-shadow:0 0 6px var(--wire-color)}
.tdlk-wire-info{flex:1;display:flex;gap:8px;align-items:center;font-size:11px}
.tdlk-wire-color{font-weight:700;color:var(--wire-color);min-width:50px}
.tdlk-wire-label{color:var(--text,#e0e6f0)}
.tdlk-wire-pos{color:var(--muted,#7a8ba8);margin-left:auto;font-size:10px}
.tdlk-wire-status{font-size:11px;color:var(--green,#22c55e);font-weight:600}
.tdlk-wire-action{font-size:16px;opacity:.5;transition:opacity .2s}
.tdlk-wire:hover:not(:disabled) .tdlk-wire-action{opacity:1}
.tdlk-progress{text-align:center;font-size:11px;color:var(--muted,#7a8ba8)}
.tdlk-msg{text-align:center;padding:8px 12px;border-radius:6px;font-size:13px;font-weight:600;animation:tdlk-pop .3s ease-out}
@keyframes tdlk-pop{0%{transform:scale(.9);opacity:0}100%{transform:scale(1);opacity:1}}
.tdlk-msg-good{color:var(--green,#22c55e);background:rgba(34,197,94,.1)}
.tdlk-msg-bad{color:var(--red,#ef4444);background:rgba(239,68,68,.1)}
.tdlk-msg-win{color:var(--green,#22c55e);background:rgba(34,197,94,.15);font-size:15px}
.tdlk-msg-fail{color:var(--red,#ef4444);background:rgba(239,68,68,.15);font-size:15px}
.tdlk-manual{background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);border-radius:8px;padding:12px}
.tdlk-manual-title{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--muted,#7a8ba8);margin-bottom:8px}
.tdlk-rule{font-size:12px;color:var(--text,#e0e6f0);padding:6px 0;border-bottom:1px solid var(--border,#1e2a45);line-height:1.5;font-family:'Courier New',monospace}
.tdlk-rule:last-child{border:none}
.tdlk-btn{display:block;margin:0 auto;padding:10px 24px;background:var(--accent,#3b82f6);color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer}
.tdlk-btn:active{transform:scale(.95)}
`;
    document.head.appendChild(s);
  }
}
