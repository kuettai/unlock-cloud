/**
 * NPC Dialog Component
 *
 * Chat-style dialog with portrait, greeting, and clickable dialog options.
 * Supports state-aware lines that only appear when player has specific cards.
 *
 * Usage:
 *   new NpcDialog(containerEl, {
 *     name: 'Dr. Priya',
 *     portrait: '🧑‍🔬',
 *     greeting: 'Hello! What can I help with?',
 *     lines: [
 *       { label: 'What is this place?', response: 'This is the data team office.' },
 *     ],
 *     state_lines: [
 *       { requires_card: 1006, label: 'I have the error logs.', response: 'Let me see those...' },
 *     ],
 *     hasCard(id) { return engine.visibleCards.has(id); },
 *     onClose() { }
 *   });
 */

class NpcDialog {
  constructor(container, opts = {}) {
    this.container = container;
    this.name = opts.name || 'NPC';
    this.portrait = opts.portrait || '🧑';
    this.greeting = opts.greeting || '...';
    this.lines = opts.lines || [];
    this.state_lines = opts.state_lines || [];
    this.hasCard = opts.hasCard || (() => false);
    this.onClose = opts.onClose || (() => {});
    this._render();
  }

  _getAvailableLines() {
    const base = this.lines.map(l => ({ ...l }));
    this.state_lines.forEach(sl => {
      if (this.hasCard(sl.requires_card)) base.push({ label: sl.label, response: sl.response });
    });
    return base;
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'npcd';

    // Header
    const hdr = document.createElement('div');
    hdr.className = 'npcd-hdr';
    hdr.innerHTML = `<span class="npcd-portrait">${this.portrait}</span><span class="npcd-name">${this.name}</span>`;
    wrap.appendChild(hdr);

    // Chat area
    this.chatEl = document.createElement('div');
    this.chatEl.className = 'npcd-chat';
    wrap.appendChild(this.chatEl);

    // Show greeting
    this._addBubble(this.greeting, 'npc');

    // Options area
    this.optionsEl = document.createElement('div');
    this.optionsEl.className = 'npcd-options';
    wrap.appendChild(this.optionsEl);

    this._renderOptions();
    this.container.appendChild(wrap);
    this._injectStyles();
  }

  _renderOptions() {
    this.optionsEl.innerHTML = '';
    const lines = this._getAvailableLines();
    lines.forEach(l => {
      const btn = document.createElement('button');
      btn.className = 'npcd-opt';
      btn.textContent = l.label;
      btn.addEventListener('click', () => this._pick(l));
      this.optionsEl.appendChild(btn);
    });
  }

  _pick(line) {
    this._addBubble(line.label, 'player');
    this._addBubble(line.response, 'npc');
    this.chatEl.scrollTop = this.chatEl.scrollHeight;
  }

  _addBubble(text, who) {
    const b = document.createElement('div');
    b.className = `npcd-bubble npcd-${who}`;
    if (who === 'npc') {
      b.innerHTML = `<span class="npcd-bp">${this.portrait}</span><span class="npcd-bt">${text}</span>`;
    } else {
      b.innerHTML = `<span class="npcd-bt">${text}</span>`;
    }
    this.chatEl.appendChild(b);
    requestAnimationFrame(() => this.chatEl.scrollTop = this.chatEl.scrollHeight);
  }

  _injectStyles() {
    if (document.getElementById('npcd-css')) return;
    const s = document.createElement('style');
    s.id = 'npcd-css';
    s.textContent = `
.npcd{display:flex;flex-direction:column;gap:0;max-width:460px;margin:0 auto;height:100%}
.npcd-hdr{display:flex;align-items:center;gap:10px;padding:8px 0 12px;border-bottom:1px solid var(--border,#1e2a45)}
.npcd-portrait{font-size:32px}
.npcd-name{font-size:16px;font-weight:700;color:var(--text,#e0e6f0)}
.npcd-chat{flex:1;overflow-y:auto;padding:12px 0;display:flex;flex-direction:column;gap:8px;min-height:120px;max-height:240px}
.npcd-bubble{display:flex;gap:8px;align-items:flex-start;animation:npcd-in .3s ease-out}
.npcd-npc{justify-content:flex-start}
.npcd-player{justify-content:flex-end}
.npcd-bp{font-size:20px;flex-shrink:0;margin-top:2px}
.npcd-bt{padding:8px 12px;border-radius:10px;font-size:13px;line-height:1.5;max-width:85%}
.npcd-npc .npcd-bt{background:var(--surface,#141b2d);color:var(--muted,#7a8ba8);border:1px solid var(--border,#1e2a45)}
.npcd-player .npcd-bt{background:var(--accent,#3b82f6);color:#fff;border-radius:10px 10px 2px 10px}
.npcd-options{display:flex;flex-direction:column;gap:6px;padding:12px 0 0;border-top:1px solid var(--border,#1e2a45)}
.npcd-opt{background:var(--bg,#0a0e17);border:1px dashed var(--muted,#7a8ba8);border-radius:8px;padding:10px 14px;color:var(--text,#e0e6f0);font-size:13px;cursor:pointer;text-align:left;transition:all .15s}
.npcd-opt:hover{border-color:var(--accent,#3b82f6);color:var(--accent,#3b82f6)}
.npcd-opt:active{opacity:.7}
@keyframes npcd-in{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)}}
`;
    document.head.appendChild(s);
  }
}
