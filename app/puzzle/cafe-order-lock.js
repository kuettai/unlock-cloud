class CafeOrderLock {
  constructor(el, opts) {
    this.el = el;
    this.cfg = opts.config || opts;
    this.onServed = opts.onServed; // callback(served count)
    this.recipes = this.cfg.recipes;
    this.drinkNames = Object.keys(this.recipes);
    this.queueInterval = this.cfg.queueInterval || 60000;
    this.autoCompleteChance = this.cfg.autoCompleteChance || 0.25;
    this.maxQueue = this.cfg.maxQueue || 4;

    // Persistent state (survives popup close/reopen AND page refresh)
    if (!CafeOrderLock._state) {
      try {
        const saved = localStorage.getItem('cafe_order_state');
        if (saved) CafeOrderLock._state = JSON.parse(saved);
      } catch {}
      if (!CafeOrderLock._state) {
        CafeOrderLock._state = { queue: [], served: 0, autoServed: 0, sentiment: 100, started: false };
      }
    }
    this.state = CafeOrderLock._state;
    this.chosenCup = null;
    this.added = [];
    this._injectStyles();
    this._render();
    if (!this.state.started) { this.state.started = true; this._addOrder(); this._startTimers(); }
    else if (!CafeOrderLock._timersRunning) { this._startTimers(); }
  }

  static getState() { return CafeOrderLock._state || { queue: [], served: 0, sentiment: 100 }; }
  static getPending() { return (CafeOrderLock._state?.queue || []).length; }
  static getServed() { return (CafeOrderLock._state?.served || 0) + (CafeOrderLock._state?.autoServed || 0); }

  _save() { try { localStorage.setItem('cafe_order_state', JSON.stringify(this.state)); } catch {} }

  static isPaused() {
    // Pause when another puzzle popup is open (not the cafe itself)
    const popup = document.getElementById('puzzle-popup');
    if (popup && popup.classList.contains('open') && activePuzzlePopupId !== 'cafe-orders') return true;
    return false;
  }

  static isRushOver() {
    return CafeOrderLock.getServed() >= 8;
  }

  _startTimers() {
    if (CafeOrderLock._timersRunning) return;
    CafeOrderLock._timersRunning = true;
    CafeOrderLock._queueIv = setInterval(() => {
      if (!CafeOrderLock.isPaused() && !CafeOrderLock.isRushOver()) this._addOrder();
    }, this.queueInterval);
    CafeOrderLock._sentIv = setInterval(() => {
      if (CafeOrderLock.isPaused() || CafeOrderLock.isRushOver()) return;
      if (this.state.queue.length > 0) {
        this.state.sentiment = Math.max(0, this.state.sentiment - this.state.queue.length * 2);
        if (this._mounted) this._render();
      }
    }, 5000);
  }

  _addOrder() {
    if (CafeOrderLock.isRushOver()) return;
    if (this.state.queue.length >= this.maxQueue) {
      this.state.sentiment = Math.max(0, this.state.sentiment - 15);
    } else {
      // Auto-complete chance (the Manager helps)
      if (this.state.queue.length > 0 && Math.random() < this.autoCompleteChance) {
        this.state.queue.shift();
        this.state.autoServed++;
        this.state.sentiment = Math.min(100, this.state.sentiment + 5);
      }
      this.state.queue.push({ drink: this.drinkNames[Math.floor(Math.random() * this.drinkNames.length)], time: Date.now() });
    }
    this._save();
    if (this._mounted) this._render();
    if (window._cafeOrderBadgeUpdate) window._cafeOrderBadgeUpdate();
  }

  get _mounted() { return this.el && this.el.isConnected; }

  _injectStyles() {
    if (document.getElementById('colk-style')) return;
    const s = document.createElement('style'); s.id = 'colk-style';
    s.textContent = `
.colk-wrap{max-width:420px;margin:0 auto;padding:8px 0}
.colk-stats{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap}
.colk-stat{flex:1;min-width:70px;padding:8px;background:var(--surface,#2a2a4e);border-radius:8px;text-align:center}
.colk-stat-label{font-size:10px;color:#aaa}
.colk-stat-val{font-size:1.2rem;font-weight:bold}
.colk-order{background:#3d2a1f;border:1px solid #f39c12;border-radius:8px;padding:10px;margin-bottom:10px}
.colk-order-name{color:#f39c12;font-weight:bold;font-size:14px}
.colk-order-queue{font-size:11px;color:#888;margin-top:4px}
.colk-empty{text-align:center;padding:1rem;color:#666;font-style:italic}
.colk-cups{display:flex;gap:8px;margin-bottom:10px}
.colk-cup-btn{padding:6px 12px;border:2px solid var(--border,#444);background:var(--bg,#1a1a2e);color:var(--text,#eee);border-radius:6px;cursor:pointer;font-size:13px}
.colk-cup-btn.sel{border-color:#f39c12;background:#3d2a1f}
.colk-workspace{display:flex;gap:10px;align-items:flex-start;margin-bottom:10px}
.colk-glass{width:70px;height:120px;border:3px solid #555;border-top:none;border-radius:0 0 10px 10px;background:#0a0e17;display:flex;flex-direction:column-reverse;overflow:hidden}
.colk-glass.hot{border-color:#e74c3c}
.colk-glass.cold{border-color:#3498db}
.colk-layer{flex:1}
.colk-layer-empty{flex:1;border-top:1px dashed #333}
.colk-ingredients{display:grid;grid-template-columns:1fr 1fr;gap:4px;flex:1}
.colk-ing-group{background:var(--bg,#1a1a2e);border:1px solid var(--border,#333);border-radius:5px;padding:4px}
.colk-ing-group-label{font-size:9px;color:#666;margin-bottom:2px}
.colk-ing-btn{display:block;width:100%;padding:3px 5px;margin-bottom:2px;background:var(--surface,#2a2a4e);border:1px solid var(--border,#444);border-radius:3px;color:var(--text,#eee);cursor:pointer;font-size:11px;text-align:left}
.colk-actions{display:flex;gap:6px;justify-content:center}
.colk-btn{padding:8px 14px;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer}
.colk-btn-serve{background:var(--accent,#e94560);color:#fff}
.colk-btn-clear{background:var(--surface,#0f3460);color:var(--text,#eee)}
.colk-btn-undo{background:var(--surface,#0f3460);color:var(--text,#eee)}
.colk-result{text-align:center;margin-top:8px;font-size:12px;min-height:18px}
.colk-menu-btn{display:block;margin:0 auto 10px;padding:4px 10px;background:var(--surface,#2a2a4e);border:1px solid var(--border,#444);border-radius:4px;color:#f39c12;cursor:pointer;font-size:11px}
.colk-menu{background:var(--surface,#2a2a4e);border:1px solid var(--border,#444);border-radius:8px;padding:8px;margin-bottom:10px;max-height:200px;overflow-y:auto;font-size:11px}
.colk-menu table{width:100%;border-collapse:collapse}
.colk-menu th{text-align:left;padding:2px 4px;color:#aaa;border-bottom:1px solid var(--border,#444)}
.colk-menu td{padding:2px 4px}`;
    document.head.appendChild(s);
  }

  _getSentimentEmoji() {
    const s = this.state.sentiment;
    return s >= 80 ? '😊' : s >= 60 ? '😐' : s >= 40 ? '😤' : '😡';
  }

  _render() {
    if (!this._mounted) return;
    const st = this.state;
    const totalServed = st.served + st.autoServed;
    const cupColors = { 'Ice': '#e0f4ff', 'Espresso': '#3d1f0a', 'Hot Water': '#f5e6d3', 'Water': '#d4eaf7', 'Steamed Milk': '#fff8f0', 'Milk': '#fff', 'Matcha': '#7ab648', 'Tea Bag': '#a0522d', 'Butterfly Pea': '#4a3ab5', 'Soda Water': '#e8f8ff', 'Lemon': '#fff44f', 'Cocoa': '#5c3317', 'Hot Milk': '#fff8f0', 'Nata De Coco': '#f7a8c4' };

    let orderHtml;
    if (CafeOrderLock.isRushOver()) {
      orderHtml = '<div class="colk-empty" style="color:#2ecc71">☕ Rush complete! All customers served. Time to close up.</div>';
    } else if (!st.queue.length) {
      orderHtml = '<div class="colk-empty">No orders... waiting for customers.</div>';
    } else {
      const cur = st.queue[0];
      orderHtml = `<div class="colk-order"><div class="colk-order-name">Order: ${cur.drink}</div>${st.queue.length > 1 ? `<div class="colk-order-queue">+${st.queue.length - 1} more waiting</div>` : ''}</div>`;
    }

    const layers = this.added.map(ing => `<div class="colk-layer" style="background:${cupColors[ing] || '#888'}"></div>`).join('');
    const empty = Array(Math.max(0, 5 - this.added.length)).fill('<div class="colk-layer-empty"></div>').join('');

    const groups = [
      { label: '🧊', items: ['Ice', 'Nata De Coco'] },
      { label: '💧', items: ['Hot Water', 'Water', 'Soda Water'] },
      { label: '☕', items: ['Espresso', 'Tea Bag'] },
      { label: '🍵', items: ['Matcha', 'Butterfly Pea'] },
      { label: '🥛', items: ['Steamed Milk', 'Milk', 'Hot Milk'] },
      { label: '🍫', items: ['Cocoa', 'Lemon'] },
    ];

    this.el.innerHTML = `<div class="colk-wrap">
      <div class="colk-stats">
        <div class="colk-stat"><div class="colk-stat-label">Sentiment</div><div class="colk-stat-val">${this._getSentimentEmoji()}</div></div>
        <div class="colk-stat"><div class="colk-stat-label">Served</div><div class="colk-stat-val" style="color:#2ecc71">${totalServed}</div></div>
        <div class="colk-stat"><div class="colk-stat-label">Waiting</div><div class="colk-stat-val" style="color:#f39c12">${st.queue.length}</div></div>
      </div>
      <button class="colk-menu-btn" id="colk-menu-toggle">📖 Menu</button>
      <div class="colk-menu" id="colk-menu" style="display:none"><table><tr><th>Drink</th><th>Cup</th><th>Ingredients</th></tr>${this.drinkNames.map(n => { const r = this.recipes[n]; return `<tr><td>${n}</td><td>${r.cup === 'hot' ? '☕' : '🧊'}</td><td>${r.ingredients.join(' → ')}</td></tr>`; }).join('')}</table></div>
      ${orderHtml}
      ${st.queue.length ? `<div><div style="font-size:11px;color:#aaa;margin-bottom:4px">Cup:</div><div class="colk-cups">
        <button class="colk-cup-btn${this.chosenCup === 'hot' ? ' sel' : ''}" data-cup="hot">☕ Hot</button>
        <button class="colk-cup-btn${this.chosenCup === 'cold' ? ' sel' : ''}" data-cup="cold">🧊 Cold</button>
      </div>
      <div class="colk-workspace">
        <div class="colk-glass${this.chosenCup === 'hot' ? ' hot' : this.chosenCup === 'cold' ? ' cold' : ''}">${layers}${empty}</div>
        <div class="colk-ingredients">${groups.map(g => `<div class="colk-ing-group"><div class="colk-ing-group-label">${g.label}</div>${g.items.map(ing => `<button class="colk-ing-btn" data-ing="${ing}">${ing}</button>`).join('')}</div>`).join('')}</div>
      </div>
      <div class="colk-actions"><button class="colk-btn colk-btn-serve" id="colk-serve">🍽️ Serve</button><button class="colk-btn colk-btn-undo" id="colk-undo">↩</button><button class="colk-btn colk-btn-clear" id="colk-clear">↺</button></div></div>` : ''}
      <div class="colk-result" id="colk-result"></div>
    </div>`;
    this._bind();
  }

  _bind() {
    this.el.querySelector('#colk-menu-toggle')?.addEventListener('click', () => {
      const m = this.el.querySelector('#colk-menu');
      m.style.display = m.style.display === 'none' ? 'block' : 'none';
    });
    this.el.querySelectorAll('[data-cup]').forEach(b => b.addEventListener('click', e => { this.chosenCup = e.currentTarget.dataset.cup; this._render(); }));
    this.el.querySelectorAll('[data-ing]').forEach(b => b.addEventListener('click', e => { if (this.added.length < 5) { this.added.push(e.currentTarget.dataset.ing); this._render(); } }));
    this.el.querySelector('#colk-undo')?.addEventListener('click', () => { this.added.pop(); this._render(); });
    this.el.querySelector('#colk-clear')?.addEventListener('click', () => { this.chosenCup = null; this.added = []; this._render(); });
    this.el.querySelector('#colk-serve')?.addEventListener('click', () => this._serve());
  }

  _serve() {
    const res = this.el.querySelector('#colk-result');
    if (!this.state.queue.length) return;
    const cur = this.state.queue[0];
    const recipe = this.recipes[cur.drink];
    if (!this.chosenCup) { res.innerHTML = '<span style="color:#e74c3c">Pick a cup first!</span>'; return; }
    if (this.chosenCup !== recipe.cup) { res.innerHTML = `<span style="color:#e74c3c">Wrong cup! ${cur.drink} needs ${recipe.cup}.</span>`; return; }
    // Check ingredients in order
    let searchFrom = 0, valid = true;
    for (const req of recipe.ingredients) {
      const idx = this.added.indexOf(req, searchFrom);
      if (idx === -1) { valid = false; break; }
      searchFrom = idx + 1;
    }
    if (!valid) { res.innerHTML = '<span style="color:#e74c3c">Wrong ingredients or order!</span>'; return; }
    // Success
    this.state.queue.shift();
    this.state.served++;
    this.state.sentiment = Math.min(100, this.state.sentiment + 10);
    this.chosenCup = null;
    this.added = [];
    this._save();
    res.innerHTML = `<span style="color:#2ecc71">✅ ${cur.drink} served!</span>`;
    if (this.onServed) this.onServed(CafeOrderLock.getServed());
    if (window._cafeOrderBadgeUpdate) window._cafeOrderBadgeUpdate();
    setTimeout(() => this._render(), 1200);
  }
}
