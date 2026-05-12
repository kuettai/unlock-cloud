/**
 * Deck Battle Lock Puzzle (STS-inspired Persuasion Battle)
 *
 * Play cards (Persuasion/Composure) against a merchant with rotating intents.
 * Draw 4, play 2 per turn. Merchant cycles attack/block pattern.
 * Win by filling conviction meter. Lose if gold (HP) hits 0.
 *
 * Usage:
 *   new DeckBattleLock(containerEl, {
 *     merchant: { name: '🧔 Spice Trader', conviction: 8,
 *       pattern: [{ attack: 2, block: 0, text: '"Greetings"' }, ...] },
 *     startingDeck: [{ id, name, type: 'persuasion'|'composure'|'both', value }],
 *     gold: 80,
 *     onSubmit() { },
 *     onWalkAway() { }
 *   });
 */

class DeckBattleLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.merchant = opts.merchant || { name: '🧔 Merchant', conviction: 8, pattern: [{ attack: 3, block: 1, text: '"..."' }] };
    this.startingDeck = opts.startingDeck || [];
    this.startGold = opts.gold || 80;
    this.onSubmit = opts.onSubmit || (() => {});
    this.onWalkAway = opts.onWalkAway || (() => {});
    this._init();
  }

  _init() {
    this.gold = this.startGold;
    this.conviction = 0;
    this.turn = 1;
    this.composure = 0;
    this.played = [];
    this.gameOver = false;
    this.drawPile = this._shuffle([...this.startingDeck]);
    this.discardPile = [];
    this.hand = [];
    this._drawHand();
    this._render();
  }

  _shuffle(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }

  _drawHand() {
    this.hand = [];
    this.played = [];
    this.composure = 0;
    for (let i = 0; i < 4; i++) {
      if (this.drawPile.length === 0) { this.drawPile = this._shuffle([...this.discardPile]); this.discardPile = []; }
      if (this.drawPile.length > 0) this.hand.push(this.drawPile.pop());
    }
  }

  _getIntent() { return this.merchant.pattern[(this.turn - 1) % this.merchant.pattern.length]; }

  _endTurn() {
    const intent = this._getIntent();
    let persuasion = 0;
    this.played.forEach(i => { const c = this.hand[i]; if (c.type === 'persuasion' || c.type === 'both') persuasion += c.value; });

    const convGain = Math.max(0, persuasion - intent.block);
    this.conviction = Math.min(this.merchant.conviction, this.conviction + convGain);
    const goldLoss = Math.max(0, intent.attack - this.composure);
    this.gold -= goldLoss;

    this.hand.forEach(c => this.discardPile.push(c));
    this.hand = [];

    if (this.conviction >= this.merchant.conviction) {
      this.gameOver = true;
      this._render();
      setTimeout(() => this.onSubmit(true), 400);
      return;
    }
    if (this.gold <= 0) { this.gold = 0; this.gameOver = true; this._render(); return; }

    this.turn++;
    this._drawHand();
    this._render();
  }

  _playCard(i) {
    if (this.played.length >= 2 || this.played.includes(i) || this.gameOver) return;
    this.played.push(i);
    const card = this.hand[i];
    if (card.type === 'composure' || card.type === 'both') this.composure += card.value;
    this._render();
  }

  _walkAway() { this.gameOver = true; this._render(); this.onWalkAway(); }

  /** Add cards to deck externally (quest rewards) */
  addCards(cards) { cards.forEach(c => this.startingDeck.push(c)); }

  reset() { this._init(); }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'dblk';

    // Stats bar
    const stats = document.createElement('div');
    stats.className = 'dblk-stats';
    stats.innerHTML = `<span class="dblk-stat">💰 <strong style="color:${this.gold<=15?'#e74c3c':'#f39c12'}">${this.gold}g</strong></span>
      <span class="dblk-stat">💬 <strong>${this.conviction}/${this.merchant.conviction}</strong></span>
      <span class="dblk-stat">🛡️ <strong>${this.composure}</strong></span>
      <span class="dblk-stat">Turn <strong>${this.turn}</strong></span>`;
    wrap.appendChild(stats);

    // Conviction bar
    const pct = (this.conviction / this.merchant.conviction) * 100;
    const barWrap = document.createElement('div');
    barWrap.className = 'dblk-bar-wrap';
    barWrap.innerHTML = `<div class="dblk-bar" style="width:${pct}%"></div>`;
    wrap.appendChild(barWrap);

    if (!this.gameOver) {
      // Merchant intent
      const intent = this._getIntent();
      const prevP = this.played.reduce((s, i) => { const c = this.hand[i]; return s + (c.type === 'persuasion' || c.type === 'both' ? c.value : 0); }, 0);
      const mEl = document.createElement('div');
      mEl.className = 'dblk-merchant';
      mEl.innerHTML = `<div class="dblk-m-row"><span style="font-size:1.5rem;">${this.merchant.name.slice(0, 2)}</span>
        <div class="dblk-m-info"><strong>${this.merchant.name}</strong><br><span class="dblk-m-text">${intent.text}</span></div>
        <div class="dblk-m-intents"><div style="color:var(--red,#e74c3c)">⚔️ ${intent.attack}g</div><div style="color:var(--purple,#9b59b6)">🛡️ ${intent.block}</div></div></div>
        ${this.played.length > 0 ? `<div class="dblk-preview">🗣️${prevP} − 🛡️${intent.block} = <span style="color:var(--green,#22c55e)">+${Math.max(0, prevP - intent.block)}</span> | ⚔️${intent.attack} − 🛡️${this.composure} = <span style="color:var(--red,#e74c3c)">−${Math.max(0, intent.attack - this.composure)}g</span></div>` : ''}`;
      wrap.appendChild(mEl);

      // Hand
      const handEl = document.createElement('div');
      handEl.className = 'dblk-hand';
      const canPlay = this.played.length < 2;
      this.hand.forEach((c, i) => {
        const isPlayed = this.played.includes(i);
        const color = c.type === 'persuasion' ? 'var(--green,#22c55e)' : c.type === 'composure' ? 'var(--purple,#9b59b6)' : 'var(--yellow,#f39c12)';
        const card = document.createElement('div');
        card.className = 'dblk-card' + (isPlayed ? ' dblk-played' : '');
        card.style.borderColor = isPlayed ? 'var(--border,#1e2a45)' : color;
        card.innerHTML = `<div class="dblk-card-name">${c.name}</div><div class="dblk-card-val" style="color:${color}">${c.type === 'both' ? '🗣️+🛡️ ' + c.value : (c.type === 'persuasion' ? '🗣️ ' : '🛡️ ') + c.value}</div>`;
        if (canPlay && !isPlayed) card.addEventListener('click', () => this._playCard(i));
        handEl.appendChild(card);
      });
      wrap.appendChild(handEl);

      // Actions
      const bar = document.createElement('div');
      bar.className = 'dblk-actions';
      const endBtn = document.createElement('button');
      endBtn.className = 'dblk-btn';
      endBtn.textContent = this.played.length >= 2 ? '⚡ End Turn' : `⏭️ End Turn (${this.played.length}/2)`;
      endBtn.addEventListener('click', () => this._endTurn());
      bar.appendChild(endBtn);
      const walkBtn = document.createElement('button');
      walkBtn.className = 'dblk-btn-sec';
      walkBtn.textContent = '🚪 Walk Away';
      walkBtn.addEventListener('click', () => this._walkAway());
      bar.appendChild(walkBtn);
      wrap.appendChild(bar);
    } else {
      // Result
      const res = document.createElement('div');
      res.className = 'dblk-result';
      if (this.conviction >= this.merchant.conviction) {
        res.innerHTML = `<div class="dblk-win">✅ Convinced! Trade secured. Gold remaining: ${this.gold}g</div>`;
      } else if (this.gold <= 0) {
        res.innerHTML = `<div class="dblk-lose">❌ Bankrupt! The merchants took everything.</div>`;
      } else {
        res.innerHTML = `<div class="dblk-walk">🚪 You bow and leave. Come back with a stronger deck.</div>`;
      }
      const retry = document.createElement('button');
      retry.className = 'dblk-btn-sec';
      retry.textContent = '↻ Retry';
      retry.addEventListener('click', () => this.reset());
      res.appendChild(retry);
      wrap.appendChild(res);
    }

    this.container.appendChild(wrap);
    this._injectStyles();
  }

  _injectStyles() {
    if (document.getElementById('dblk-css')) return;
    const s = document.createElement('style'); s.id = 'dblk-css';
    s.textContent = `
.dblk{display:flex;flex-direction:column;gap:10px;padding:16px 0;max-width:420px;margin:0 auto}
.dblk-stats{display:flex;justify-content:space-between;font-size:12px;color:var(--muted,#7a8ba8)}
.dblk-stat strong{color:var(--text,#e0e6f0)}
.dblk-bar-wrap{height:6px;background:var(--surface,#141b2d);border-radius:3px;overflow:hidden}
.dblk-bar{height:100%;background:var(--green,#22c55e);transition:width .3s}
.dblk-merchant{background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);border-radius:8px;padding:10px}
.dblk-m-row{display:flex;align-items:center;gap:8px}
.dblk-m-info{flex:1;font-size:12px;color:var(--text,#e0e6f0)}
.dblk-m-info strong{font-size:13px}
.dblk-m-text{color:var(--muted,#7a8ba8);font-style:italic}
.dblk-m-intents{text-align:right;font-size:12px;font-weight:600}
.dblk-preview{margin-top:8px;padding:6px 8px;background:var(--bg,#0a0e17);border-radius:4px;font-size:11px;color:var(--muted,#7a8ba8)}
.dblk-hand{display:flex;flex-wrap:wrap;gap:6px}
.dblk-card{flex:1;min-width:80px;padding:8px;background:var(--bg,#0a0e17);border:2px solid var(--border,#1e2a45);border-radius:8px;cursor:pointer;transition:all .15s;text-align:center}
.dblk-card:active{transform:scale(.95)}
.dblk-card.dblk-played{opacity:.3;cursor:default}
.dblk-card-name{font-size:11px;font-weight:600;color:var(--text,#e0e6f0);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dblk-card-val{font-size:12px;font-weight:700;margin-top:4px}
.dblk-actions{display:flex;gap:8px;justify-content:center}
.dblk-btn,.dblk-btn-sec{padding:10px 16px;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer}
.dblk-btn{background:var(--accent,#3b82f6);color:#fff}
.dblk-btn-sec{background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);color:var(--muted,#7a8ba8)}
.dblk-result{text-align:center;padding:16px}
.dblk-win{color:var(--green,#22c55e);font-weight:600;margin-bottom:8px}
.dblk-lose{color:var(--red,#e74c3c);font-weight:600;margin-bottom:8px}
.dblk-walk{color:var(--muted,#7a8ba8);font-style:italic;margin-bottom:8px}
`;
    document.head.appendChild(s);
  }
}
