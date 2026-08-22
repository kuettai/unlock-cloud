/**
 * Booking Run Lock Puzzle
 *
 * Live narrated tool-call debugging. Watch NPC attempt calls, fix broken params.
 *
 * Usage:
 *   new BookingRunLock(containerEl, {
 *     npc: { name: 'The Artificer', portrait: '🔧' },
 *     calls: [{ fn, params: {k:v}, broken: 'key', answer: 'val', options: [...],
 *              narrate: '...', fail: '...', success: '...' }],
 *     onSubmit() { }
 *   });
 */
class BookingRunLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.npc = opts.npc || { name: 'Artificer', portrait: '🔧' };
    this.calls = opts.calls || [];
    this.onSubmit = opts.onSubmit || (() => {});
    this.step = 0; this.phase = 'narrate'; this.log = [];
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const w = document.createElement('div'); w.className = 'brlk';

    if (this.step >= this.calls.length) {
      w.innerHTML = `<div class="brlk-done"><span style="font-size:2rem;">${this.npc.portrait}✅</span><br><strong>All calls executed!</strong></div>`;
      this.container.appendChild(w); this._injectStyles();
      setTimeout(() => this.onSubmit(true), 400);
      return;
    }

    const c = this.calls[this.step];
    const portrait = `<div class="brlk-npc"><span class="brlk-portrait">${this.npc.portrait}</span><strong>${this.npc.name}</strong><span class="brlk-step">${this.step + 1}/${this.calls.length}</span></div>`;

    this.sceneEl = document.createElement('div'); this.sceneEl.className = 'brlk-scene';
    this.fixEl = document.createElement('div'); this.fixEl.className = 'brlk-fix';
    this.logEl = document.createElement('div'); this.logEl.className = 'brlk-log';

    w.appendChild(this.sceneEl); w.appendChild(this.fixEl); w.appendChild(this.logEl);
    this.container.appendChild(w); this._injectStyles();

    const paramStr = Object.entries(c.params).map(([k, v]) => `<span style="color:#7a8ba8">${k}:</span> <span style="color:#f59e0b">"${v}"</span>`).join(', ');

    if (this.phase === 'narrate') {
      this.sceneEl.innerHTML = `<div class="brlk-box">${portrait}<div class="brlk-speech">${c.narrate}</div><div class="brlk-code">${c.fn}(${paramStr})</div></div>`;
      this.fixEl.innerHTML = `<button class="brlk-btn" id="brlk-go">⚡ Let him try</button>`;
      document.getElementById('brlk-go').addEventListener('click', () => { this.phase = 'fail'; this.log.push('❌ ' + c.fn + ' — FAILED'); this._render(); });
    } else if (this.phase === 'fail') {
      this.sceneEl.innerHTML = `<div class="brlk-box brlk-err">${portrait}<div class="brlk-speech brlk-red">${c.fail}</div><div class="brlk-code"><span style="color:#ef4444">❌ ${c.fn}(${c.broken}: <s>"${c.params[c.broken]}"</s> ← FIX)</span></div></div>`;
      this.fixEl.innerHTML = `<div class="brlk-opts">${(c.options || []).filter(o => o !== c.params[c.broken]).map(o => `<button class="brlk-opt">${o}</button>`).join('')}</div>`;
      this.fixEl.querySelectorAll('.brlk-opt').forEach(btn => {
        btn.addEventListener('click', () => {
          if (btn.textContent === c.answer) { this.phase = 'success'; this.log.push('✅ ' + c.fn + ' — fixed'); }
          else { this.log.push('⚠️ ' + c.fn + '(' + c.broken + ': "' + btn.textContent + '") — wrong'); }
          this._render();
        });
      });
    } else if (this.phase === 'success') {
      this.sceneEl.innerHTML = `<div class="brlk-box brlk-ok">${portrait}<div class="brlk-speech brlk-green">${c.success}</div><div class="brlk-code" style="color:#22c55e">✅ ${c.fn}(${c.broken}: "${c.answer}")</div></div>`;
      this.fixEl.innerHTML = `<button class="brlk-btn" id="brlk-next">→ Next</button>`;
      document.getElementById('brlk-next').addEventListener('click', () => { this.step++; this.phase = 'narrate'; this._render(); });
    }

    this.logEl.innerHTML = this.log.slice(-4).map(l => `<div class="brlk-log-line">${l}</div>`).join('');
  }

  _injectStyles() {
    if (document.getElementById('brlk-css')) return;
    const s = document.createElement('style'); s.id = 'brlk-css';
    s.textContent = `
.brlk{display:flex;flex-direction:column;gap:10px;padding:16px 0;max-width:420px;margin:0 auto}
.brlk-npc{display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:13px;color:#e0e6f0}
.brlk-portrait{font-size:20px}
.brlk-step{margin-left:auto;font-size:11px;color:#7a8ba8}
.brlk-box{padding:12px;background:#141b2d;border:1px solid #1e2a45;border-radius:8px}
.brlk-box.brlk-err{border-color:#ef4444;background:#1a0e0e}
.brlk-box.brlk-ok{border-color:#22c55e;background:#0e1a0e}
.brlk-speech{font-size:13px;font-style:italic;color:#e0e6f0;margin-bottom:8px}
.brlk-red{color:#ef4444!important}
.brlk-green{color:#22c55e!important}
.brlk-code{font-family:monospace;font-size:12px;padding:8px;background:#0a0e17;border-radius:4px;color:#3b82f6}
.brlk-fix{text-align:center}
.brlk-opts{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
.brlk-opt{padding:8px 14px;background:#141b2d;border:1px solid #1e2a45;border-radius:6px;font-size:12px;font-family:monospace;color:#e0e6f0;cursor:pointer;transition:all .15s}
.brlk-opt:active{transform:scale(.95)}
.brlk-btn{padding:10px 20px;background:#3b82f6;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer}
.brlk-log{font-size:11px;color:#7a8ba8;max-height:60px;overflow-y:auto}
.brlk-log-line{padding:2px 0}
.brlk-done{text-align:center;padding:24px;color:#22c55e;font-size:14px}
`;
    document.head.appendChild(s);
  }
}
