class StockMemoryLock {
  constructor(el, opts) {
    this.el = el;
    this.cfg = opts.config || opts;
    this.onSubmit = opts.onSubmit;
    this.onWrong = opts.onWrong;
    this.checklist = this.cfg.checklist;
    this.memTime = this.cfg.memorizeSeconds || 5;
    this.reviewTime = this.cfg.reviewSeconds || 5;
    this.phase = 'memorize';
    this.timer = this.memTime;
    this.grabbed = {};
    this.picked = [];
    this.checking = false;
    this.reviewing = false;
    this._buildShelf();
    this._injectStyles();
    this._startMemorize();
  }
  _injectStyles() {
    if (document.getElementById('smlk-style')) return;
    const s = document.createElement('style'); s.id = 'smlk-style';
    s.textContent = `
.smlk-wrap{max-width:420px;margin:0 auto;padding:8px 0}
.smlk-memo{background:#2a2a4e;border:2px solid #f39c12;border-radius:10px;padding:1.2rem;text-align:center}
.smlk-memo-title{font-size:12px;color:#f39c12;margin-bottom:6px}
.smlk-memo-timer{font-size:1.5rem;font-weight:bold;color:#e94560;margin-bottom:10px}
.smlk-memo-item{font-size:14px;color:#eee;padding:4px 0}
.smlk-memo-item strong{color:#f39c12}
.smlk-memo-foot{font-size:11px;color:#888;margin-top:10px}
.smlk-grab{background:#1a1a2e;border:1px solid var(--border,#444);border-radius:10px;padding:1rem}
.smlk-grab-title{font-size:12px;color:#e94560;text-align:center;margin-bottom:4px}
.smlk-grab-sub{font-size:11px;color:#888;text-align:center;margin-bottom:10px}
.smlk-shelf{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:12px}
.smlk-shelf-btn{padding:6px;background:#2a2a4e;border:2px solid var(--border,#444);border-radius:6px;cursor:pointer;text-align:center;transition:all 0.2s}
.smlk-shelf-btn.picked{background:#1e4d2b;border-color:#2ecc71;opacity:0.4;cursor:default}
.smlk-shelf-btn .emoji{font-size:1.1rem}
.smlk-shelf-btn .lbl{font-size:9px;color:#aaa}
.smlk-basket{background:#2a2a4e;border-radius:6px;padding:8px;margin-bottom:10px}
.smlk-basket-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
.smlk-basket-label{font-size:11px;color:#aaa}
.smlk-qc-btn{padding:3px 8px;background:#0f3460;border:1px solid #3498db;border-radius:4px;color:#3498db;cursor:pointer;font-size:10px}
.smlk-basket-items{display:flex;flex-wrap:wrap;gap:4px}
.smlk-basket-chip{padding:3px 6px;background:#1a1a2e;border:1px solid var(--border,#444);border-radius:4px;font-size:11px;cursor:pointer}
.smlk-btns{display:flex;gap:6px;justify-content:center;flex-wrap:wrap}
.smlk-btn{padding:8px 14px;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer}
.smlk-btn-primary{background:var(--accent,#e94560);color:#fff}
.smlk-btn-secondary{background:var(--surface,#0f3460);color:var(--text,#eee)}
.smlk-status{text-align:center;margin-top:8px;font-size:12px;min-height:18px}`;
    document.head.appendChild(s);
  }
  _buildShelf() {
    const shelfCfg = this.cfg.shelf;
    this.shelfItems = [];
    const rows = shelfCfg.rows;
    const perRow = shelfCfg.itemsPerRow || 5;
    const badItems = shelfCfg.badItems || {};
    const emojis = { milk: '🥛', beans: '☕', cups: '🥤', ice: '🧊', syrup: '🍯', matcha: '🍵' };
    rows.forEach(id => {
      const items = Array.from({ length: perRow }, () => ({ id, emoji: emojis[id] || '📦', label: id.charAt(0).toUpperCase() + id.slice(1), bad: false }));
      if (badItems[id]) { const pos = Math.floor(Math.random() * perRow); items[pos] = { id, emoji: emojis[id] || '📦', label: badItems[id], bad: true }; }
      this.shelfItems.push(...items);
    });
  }
  _startMemorize() {
    this._renderMemo();
    this._iv = setInterval(() => {
      this.timer--;
      if (this.timer <= 0) { clearInterval(this._iv); this.phase = 'grab'; this._renderGrab(); }
      else this._renderMemo();
    }, 1000);
  }
  _renderMemo() {
    this.el.innerHTML = `<div class="smlk-wrap"><div class="smlk-memo">
      <div class="smlk-memo-title">📋 TODAY'S CHECKLIST — MEMORIZE!</div>
      <div class="smlk-memo-timer">${this.timer}s</div>
      ${this.checklist.map(c => `<div class="smlk-memo-item">• ${c.label}: <strong>${c.need}</strong></div>`).join('')}
      <div class="smlk-memo-foot">Checklist will disappear in ${this.timer} seconds...</div>
    </div></div>`;
  }
  _renderGrab() {
    if (this.reviewing) { this._renderReview(); return; }
    const basketHtml = this.picked.length ? this.picked.map(i => {
      const it = this.shelfItems[i];
      if (this.checking) return `<div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;color:${it.bad ? '#e74c3c' : '#2ecc71'}"><span>${it.emoji} ${it.id} — ${it.bad ? '⚠️ ' + it.label : '✅ Good'}</span><button data-ret="${i}" class="smlk-qc-btn">↩</button></div>`;
      return `<span class="smlk-basket-chip" data-ret="${i}">${it.emoji}<span style="font-size:9px;color:#888;margin-left:2px">×</span></span>`;
    }).join('') : '<span style="font-size:11px;color:#666">Empty</span>';

    this.el.innerHTML = `<div class="smlk-wrap"><div class="smlk-grab">
      <div class="smlk-grab-title">📋 Checklist HIDDEN — grab from memory!</div>
      <div class="smlk-grab-sub">Tap items on the shelf. Some may be spoilt — use Check Quality to inspect.</div>
      <div class="smlk-shelf">${this.shelfItems.map((item, i) => {
        const sel = this.picked.includes(i);
        return `<button class="smlk-shelf-btn${sel ? ' picked' : ''}" data-pick="${i}" ${sel ? 'disabled' : ''}><div class="emoji">${item.emoji}</div><div class="lbl">${item.bad ? item.id.charAt(0).toUpperCase() + item.id.slice(1) : item.label}</div></button>`;
      }).join('')}</div>
      <div class="smlk-basket"><div class="smlk-basket-head"><span class="smlk-basket-label">🪣 Basket:</span><button class="smlk-qc-btn" id="smlk-qc">🔍 ${this.checking ? 'Hide' : 'Check quality'}</button></div><div class="smlk-basket-items">${basketHtml}</div></div>
      <div class="smlk-btns"><button class="smlk-btn smlk-btn-primary" id="smlk-done">✅ Done</button><button class="smlk-btn smlk-btn-secondary" id="smlk-review">📋 Review list</button><button class="smlk-btn smlk-btn-secondary" id="smlk-clear">↺ Put back</button></div>
      <div class="smlk-status" id="smlk-status"></div>
    </div></div>`;
    this.el.querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', e => { this._pick(+e.currentTarget.dataset.pick); }));
    this.el.querySelectorAll('[data-ret]').forEach(b => b.addEventListener('click', e => { this._return(+e.currentTarget.dataset.ret); }));
    this.el.querySelector('#smlk-qc').addEventListener('click', () => { this.checking = !this.checking; this._renderGrab(); });
    this.el.querySelector('#smlk-done').addEventListener('click', () => this._submit());
    this.el.querySelector('#smlk-review').addEventListener('click', () => { this.reviewing = true; this._renderGrab(); });
    this.el.querySelector('#smlk-clear').addEventListener('click', () => { this.grabbed = {}; this.picked = []; this.checking = false; this._renderGrab(); });
  }
  _renderReview() {
    this.el.innerHTML = `<div class="smlk-wrap"><div class="smlk-memo">
      <div class="smlk-memo-title">📋 REVIEWING CHECKLIST</div>
      <div class="smlk-memo-timer" id="smlk-rv">${this.reviewTime}</div>
      ${this.checklist.map(c => `<div class="smlk-memo-item">• ${c.label}: <strong>${c.need}</strong></div>`).join('')}
    </div></div>`;
    let rt = this.reviewTime;
    const ri = setInterval(() => {
      rt--;
      const el = this.el.querySelector('#smlk-rv');
      if (el) el.textContent = rt;
      if (rt <= 0) { clearInterval(ri); this.reviewing = false; this._renderGrab(); }
    }, 1000);
  }
  _pick(i) { if (!this.picked.includes(i)) { this.picked.push(i); const it = this.shelfItems[i]; if (!it.bad) this.grabbed[it.id] = (this.grabbed[it.id] || 0) + 1; this.checking = false; this._renderGrab(); } }
  _return(i) { this.picked = this.picked.filter(x => x !== i); const it = this.shelfItems[i]; if (!it.bad && this.grabbed[it.id]) this.grabbed[it.id]--; this.checking = false; this._renderGrab(); }
  _submit() {
    const hasBad = this.picked.some(i => this.shelfItems[i].bad);
    const correct = this.checklist.every(c => (this.grabbed[c.id] || 0) === c.need) && !hasBad;
    if (hasBad) { if (this.onWrong) this.onWrong('❌ Bad item in basket! Use Check Quality to find it.'); }
    else if (correct) { this.onSubmit(); }
    else { const wrong = this.checklist.filter(c => (this.grabbed[c.id] || 0) !== c.need).map(c => `${c.label.split('(')[0].trim()}: got ${this.grabbed[c.id] || 0}, need ${c.need}`).join(', '); if (this.onWrong) this.onWrong('❌ Wrong amounts: ' + wrong); }
  }
}
