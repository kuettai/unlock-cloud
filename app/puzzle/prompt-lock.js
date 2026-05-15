/**
 * Prompt Lock Puzzle
 *
 * Tap fragments to build a prompt. Quality of prompt determines result tier.
 *
 * Usage:
 *   new PromptLock(containerEl, {
 *     npc: { name: 'Scholar', portrait: '🧙' },
 *     fragments: [{ id, text, type }],
 *     answers: [{ required: ['id1','id2'], tier: 'gold'|'silver'|'bronze'|'fail', response: '...' }],
 *     onSubmit(tier) { }
 *   });
 */
class PromptLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.npc = opts.npc || { name: 'Scholar', portrait: '🧙' };
    this.fragments = opts.fragments || [];
    this.answers = opts.answers || [];
    this.onSubmit = opts.onSubmit || (() => {});
    this.selected = [];
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const w = document.createElement('div'); w.className = 'prlk';

    // NPC response area
    this.responseEl = document.createElement('div'); this.responseEl.className = 'prlk-response';
    this.responseEl.textContent = 'Give me a prompt and I\'ll search.';
    const npcBox = document.createElement('div'); npcBox.className = 'prlk-npc';
    npcBox.innerHTML = `<span class="prlk-portrait">${this.npc.portrait}</span><strong>${this.npc.name}</strong>`;
    w.appendChild(npcBox); w.appendChild(this.responseEl);

    // Fragments
    this.fragEl = document.createElement('div'); this.fragEl.className = 'prlk-frags';
    w.appendChild(this.fragEl);

    // Built prompt
    this.builtEl = document.createElement('div'); this.builtEl.className = 'prlk-built';
    w.appendChild(this.builtEl);

    // Buttons
    const bar = document.createElement('div'); bar.className = 'prlk-bar';
    const send = document.createElement('button'); send.className = 'prlk-btn'; send.textContent = '🔍 Send';
    send.addEventListener('click', () => this._submit());
    const clear = document.createElement('button'); clear.className = 'prlk-btn-sec'; clear.textContent = '✕ Clear';
    clear.addEventListener('click', () => { this.selected = []; this._update(); });
    bar.appendChild(send); bar.appendChild(clear);
    w.appendChild(bar);

    this.resultEl = document.createElement('div'); this.resultEl.className = 'prlk-result';
    w.appendChild(this.resultEl);

    this.container.appendChild(w);
    this._injectStyles(); this._update();
  }

  _update() {
    const colors = { action: '#3b82f6', what: '#22c55e', where: '#f59e0b', format: '#a855f7', detail: '#ef4444' };
    this.fragEl.innerHTML = '';
    this.fragments.forEach(f => {
      const btn = document.createElement('button'); btn.className = 'prlk-frag' + (this.selected.includes(f.id) ? ' prlk-frag-on' : '');
      btn.style.borderColor = this.selected.includes(f.id) ? (colors[f.type] || '#3b82f6') : '';
      btn.style.color = this.selected.includes(f.id) ? (colors[f.type] || '#3b82f6') : '';
      btn.textContent = f.text;
      btn.addEventListener('click', () => { if (this.selected.includes(f.id)) this.selected = this.selected.filter(x => x !== f.id); else this.selected.push(f.id); this._update(); });
      this.fragEl.appendChild(btn);
    });
    this.builtEl.textContent = this.selected.map(id => this.fragments.find(f => f.id === id)?.text).join(' ') || '(tap fragments to build prompt)';
  }

  _submit() {
    if (!this.selected.length) return;
    const match = this.answers.find(a => a.required.every(r => this.selected.includes(r)));
    if (match) {
      this.responseEl.textContent = match.response;
      this.responseEl.className = 'prlk-response prlk-' + match.tier;
      if (match.tier === 'gold') setTimeout(() => this.onSubmit(match.tier), 400);
    } else {
      this.responseEl.textContent = 'I don\'t understand what you want.';
      this.responseEl.className = 'prlk-response prlk-fail';
    }
  }

  _injectStyles() {
    if (document.getElementById('prlk-css')) return;
    const s = document.createElement('style'); s.id = 'prlk-css';
    s.textContent = `
.prlk{display:flex;flex-direction:column;gap:10px;padding:16px 0;max-width:400px;margin:0 auto}
.prlk-npc{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text,#e0e6f0)}
.prlk-portrait{font-size:20px}
.prlk-response{padding:12px;background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);border-radius:8px;font-size:13px;color:var(--muted,#7a8ba8);font-style:italic;min-height:44px}
.prlk-response.prlk-gold{color:var(--green,#22c55e);border-color:var(--green,#22c55e)}
.prlk-response.prlk-silver{color:#3b82f6;border-color:#3b82f6}
.prlk-response.prlk-bronze{color:#f59e0b;border-color:#f59e0b}
.prlk-response.prlk-fail{color:var(--red,#ef4444);border-color:var(--red,#ef4444)}
.prlk-frags{display:flex;flex-wrap:wrap;gap:6px}
.prlk-frag{padding:6px 10px;background:var(--bg,#0a0e17);border:2px solid var(--border,#1e2a45);border-radius:6px;font-size:12px;color:var(--muted,#7a8ba8);cursor:pointer;transition:all .15s}
.prlk-frag.prlk-frag-on{background:var(--surface,#141b2d)}
.prlk-built{padding:8px 12px;background:var(--bg,#0a0e17);border:1px solid var(--border,#1e2a45);border-radius:6px;font-size:12px;color:var(--text,#e0e6f0);min-height:32px}
.prlk-bar{display:flex;gap:8px;justify-content:center}
.prlk-btn,.prlk-btn-sec{padding:10px 16px;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer}
.prlk-btn{background:var(--accent,#3b82f6);color:#fff}
.prlk-btn-sec{background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);color:var(--muted,#7a8ba8)}
.prlk-result{text-align:center;font-size:13px;min-height:18px}
`;
    document.head.appendChild(s);
  }
}
