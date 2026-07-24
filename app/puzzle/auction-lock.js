/**
 * Auction / Bidding Lock Puzzle
 *
 * Player has a limited budget (time/coins/energy). Multiple items are up for
 * auction in sequence. Each item has a hidden value and a minimum bid.
 * Player decides how much to bid — overbidding wastes resources,
 * underbidding loses the item. Must acquire enough key items to unlock.
 *
 * Twist: some items are decoys (worthless), some are essential.
 * Clues hint at which are valuable.
 *
 * Inspired by Ra / No Thanks! / storage unit auction shows.
 *
 * Usage:
 *   new AuctionLock(containerEl, {
 *     budget: 100,
 *     requiredItems: 3,
 *     lots: [
 *       { id: 'a', label: '📦 Crate A', hint: 'Heavy. Metallic.', value: 'key', minBid: 15, idealBid: 25 },
 *       { id: 'b', label: '📦 Crate B', hint: 'Light. Rattles.', value: 'decoy', minBid: 10, idealBid: 20 },
 *       ...
 *     ],
 *     onSubmit(correct) { ... }
 *   });
 */

class AuctionLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.budget = opts.budget || 100;
    this.requiredItems = opts.requiredItems || 3;
    this._originalLots = opts.lots || [];
    this.lots = [...this._originalLots].sort(() => Math.random() - 0.5);
    this.onSubmit = opts.onSubmit || (() => {});

    this._init();
  }

  _init() {
    this.lots = [...this._originalLots].sort(() => Math.random() - 0.5);
    this.remaining = this.budget;
    this.currentLot = 0;
    this.won = false;
    this.failed = false;
    this.acquired = [];
    this.passed = [];
    this.history = [];
    this.message = null;
    this.bidAmount = 0;
    this.haggleAttempts = 0;
    this.maxHaggle = 3;
    this.haggleCost = 0;
    this.sellerMood = null; // null | 'firm' | 'annoyed' | 'walkaway'
    this._render();
  }

  _bid() {
    if (this.won || this.failed) return;
    const lot = this.lots[this.currentLot];
    const bid = this.bidAmount;

    if (bid > this.remaining) {
      this.message = { text: "Can't afford that bid!", type: 'warn' };
      this._render();
      return;
    }

    if (bid < lot.minBid) {
      // Haggle — seller counters
      this.haggleAttempts++;

      if (this.haggleAttempts >= this.maxHaggle) {
        // Seller walks away
        this.sellerMood = 'walkaway';
        this.message = { text: `"We're done here." Seller walks away.`, type: 'bad' };
        this.history.push({ lot, action: 'walked', bid });
        this.passed.push(lot);
        this._advance();
      } else {
        // Seller gives a counter-hint
        const gap = lot.minBid - bid;
        this.sellerMood = this.haggleAttempts === 1 ? 'firm' : 'annoyed';
        const responses = this._getSellerResponse(lot, bid, gap);
        this.message = { text: responses, type: 'haggle' };
        this._render();
      }
    } else {
      // Accepted!
      this.remaining -= bid;
      this.acquired.push(lot);
      const overpay = bid - lot.idealBid;
      this.sellerMood = null;
      if (overpay > 10) {
        this.message = { text: `Deal! (You could've paid less...)`, type: 'warn' };
      } else if (bid === lot.minBid) {
        this.message = { text: `"Barely acceptable." Deal closed.`, type: 'good' };
      } else {
        this.message = { text: `"Deal." Handshake. Item is yours.`, type: 'good' };
      }
      this.history.push({ lot, action: 'won', bid, attempts: this.haggleAttempts + 1 });
      this._advance();
    }
  }

  _getSellerResponse(lot, bid, gap) {
    if (this.haggleAttempts === 1) {
      // First reject: vague hint
      if (gap > 15) return `"Not even close. I'd need way more than ${bid}."`;
      if (gap > 8) return `"Hmm. You're in the ballpark, but not there yet."`;
      return `"Almost. Just a little more and we have a deal."`;
    } else {
      // Second reject: more specific, annoyed
      const hint = lot.minBid;
      if (gap > 10) return `"Final warning. I won't take less than ${hint}."`;
      return `"Look, ${hint} and it's yours. Last chance."`;
    }
  }

  _pass() {
    if (this.won || this.failed) return;
    const lot = this.lots[this.currentLot];
    this.passed.push(lot);
    this.history.push({ lot, action: 'passed', bid: 0 });
    this.message = { text: `Skipped "${lot.label}".`, type: 'neutral' };
    this._advance();
  }

  _advance() {
    const keyItems = this.acquired.filter(l => l.value === 'key').length;
    if (keyItems >= this.requiredItems) {
      this.won = true;
      this.message = { text: `All ${this.requiredItems} key items acquired!`, type: 'win' };
      this._render();
      setTimeout(() => this.onSubmit(true), 600);
      return;
    }

    this.currentLot++;
    this.haggleAttempts = 0;
    this.sellerMood = null;

    if (this.currentLot >= this.lots.length) {
      this.failed = true;
      this.message = { text: `Auction over. Only got ${keyItems}/${this.requiredItems} key items.`, type: 'fail' };
    }

    this.bidAmount = 0;
    this._render();
  }

  reset() { this._init(); }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'aclk';

    // Budget bar
    const pct = (this.remaining / this.budget) * 100;
    const budgetEl = document.createElement('div');
    budgetEl.className = 'aclk-budget';
    budgetEl.innerHTML = `
      <div class="aclk-budget-bar"><div class="aclk-budget-fill" style="width:${pct}%"></div></div>
      <div class="aclk-budget-info">
        <span>💰 ${this.remaining} / ${this.budget}</span>
        <span>🔑 ${this.acquired.filter(l => l.value === 'key').length} / ${this.requiredItems} keys</span>
        <span>📦 ${this.currentLot + (this.won || this.failed ? 0 : 1)} / ${this.lots.length}</span>
      </div>`;
    wrap.appendChild(budgetEl);

    // Current lot or end state
    if (!this.won && !this.failed && this.currentLot < this.lots.length) {
      const lot = this.lots[this.currentLot];
      const moodIcon = this.sellerMood === 'firm' ? '😐' : this.sellerMood === 'annoyed' ? '😤' : '🧔';
      const lotEl = document.createElement('div');
      lotEl.className = 'aclk-lot' + (this.sellerMood === 'annoyed' ? ' aclk-lot-tense' : '');
      lotEl.innerHTML = `
        <div class="aclk-lot-header">
          <span class="aclk-lot-num">Lot ${this.currentLot + 1}/${this.lots.length}</span>
          <span class="aclk-haggle-count">${this.haggleAttempts > 0 ? `Haggle ${this.haggleAttempts}/${this.maxHaggle}` : ''}</span>
        </div>
        <div class="aclk-lot-seller">${moodIcon}</div>
        <div class="aclk-lot-label">${lot.label}</div>
        <div class="aclk-lot-hint">"${lot.hint}"</div>`;
      wrap.appendChild(lotEl);

      // Bid controls
      const controls = document.createElement('div');
      controls.className = 'aclk-controls';

      const slider = document.createElement('div');
      slider.className = 'aclk-slider-wrap';
      slider.innerHTML = `
        <input type="range" class="aclk-slider" min="0" max="${this.remaining}" value="${this.bidAmount}" id="aclk-range">
        <div class="aclk-slider-labels">
          <span>0</span>
          <span class="aclk-bid-display">${this.bidAmount}</span>
          <span>${this.remaining}</span>
        </div>`;
      controls.appendChild(slider);

      const actions = document.createElement('div');
      actions.className = 'aclk-actions';
      const bidBtn = document.createElement('button');
      bidBtn.className = 'aclk-btn aclk-btn-bid';
      bidBtn.textContent = `Bribe ${this.bidAmount}`;
      bidBtn.disabled = this.bidAmount === 0;
      bidBtn.addEventListener('click', () => this._bid());
      actions.appendChild(bidBtn);
      const passBtn = document.createElement('button');
      passBtn.className = 'aclk-btn aclk-btn-pass';
      passBtn.textContent = 'Skip';
      passBtn.addEventListener('click', () => this._pass());
      actions.appendChild(passBtn);
      controls.appendChild(actions);
      wrap.appendChild(controls);
    }

    // Message
    if (this.message) {
      const msg = document.createElement('div');
      msg.className = `aclk-msg aclk-msg-${this.message.type}`;
      msg.textContent = this.message.text;
      wrap.appendChild(msg);
    }

    // Won/failed
    if (this.failed) {
      const btn = document.createElement('button');
      btn.className = 'aclk-btn aclk-btn-bid';
      btn.textContent = 'Retry';
      btn.addEventListener('click', () => this.reset());
      wrap.appendChild(btn);
    }

    // History
    if (this.history.length > 0) {
      const hist = document.createElement('div');
      hist.className = 'aclk-history';
      hist.innerHTML = '<div class="aclk-hist-title">Auction Log</div>' +
        this.history.map(h => {
          const icon = h.action === 'won' ? '✓' : h.action === 'walked' ? '🚪' : h.action === 'passed' ? '—' : '✕';
          const cls = h.action === 'won' ? 'aclk-hist-won' : (h.action === 'walked' || h.action === 'outbid') ? 'aclk-hist-lost' : 'aclk-hist-pass';
          const detail = h.action === 'won' ? `${h.bid}${h.attempts > 1 ? ` (${h.attempts} tries)` : ''}` : h.action === 'passed' ? 'passed' : h.action === 'walked' ? 'walked away' : `bid ${h.bid}`;
          const reveal = (this.won || this.failed) ? `<span class="aclk-hist-value">${h.lot.value === 'key' ? '🔑' : '💨'}</span>` : '';
          return `<div class="aclk-hist-row ${cls}"><span>${icon}</span><span>${h.lot.label}</span><span>${detail}</span>${reveal}</div>`;
        }).join('');
      wrap.appendChild(hist);
    }

    this.container.appendChild(wrap);
    this._injectStyles();

    // Bind slider after render
    const rangeEl = this.container.querySelector('#aclk-range');
    if (rangeEl) {
      rangeEl.addEventListener('input', (e) => {
        this.bidAmount = parseInt(e.target.value);
        const display = this.container.querySelector('.aclk-bid-display');
        if (display) display.textContent = this.bidAmount;
        const bidBtn = this.container.querySelector('.aclk-btn-bid');
        if (bidBtn) { bidBtn.textContent = `Bribe ${this.bidAmount}`; bidBtn.disabled = this.bidAmount === 0; }
      });
    }
  }

  _injectStyles() {
    if (document.getElementById('aclk-css')) return;
    const s = document.createElement('style'); s.id = 'aclk-css';
    s.textContent = `
.aclk{display:flex;flex-direction:column;gap:12px;padding:16px 0;max-width:420px;margin:0 auto}
.aclk-budget{display:flex;flex-direction:column;gap:6px}
.aclk-budget-bar{width:100%;height:8px;background:var(--surface,#141b2d);border-radius:4px;overflow:hidden;border:1px solid var(--border,#1e2a45)}
.aclk-budget-fill{height:100%;background:var(--green,#22c55e);transition:width .4s;border-radius:4px}
.aclk-budget-info{display:flex;justify-content:space-between;font-size:11px;color:var(--muted,#7a8ba8)}
.aclk-lot{background:var(--surface,#141b2d);border:2px solid var(--border,#1e2a45);border-radius:10px;padding:16px;text-align:center;animation:aclk-slide .3s ease-out}
@keyframes aclk-slide{0%{opacity:0;transform:translateX(20px)}100%{opacity:1;transform:translateX(0)}}
.aclk-lot-tense{border-color:#f97316;background:rgba(249,115,22,.03)}
.aclk-lot-header{display:flex;justify-content:space-between;font-size:10px;color:var(--muted,#7a8ba8);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
.aclk-haggle-count{color:#f97316;font-weight:600}
.aclk-lot-seller{font-size:32px;margin-bottom:6px}
.aclk-lot-label{font-size:18px;font-weight:700;color:var(--text,#e0e6f0);margin-bottom:8px}
.aclk-lot-hint{font-size:13px;color:var(--muted,#7a8ba8);font-style:italic;line-height:1.5}
.aclk-controls{display:flex;flex-direction:column;gap:10px}
.aclk-slider-wrap{padding:0 4px}
.aclk-slider{width:100%;accent-color:var(--accent,#3b82f6);cursor:pointer}
.aclk-slider-labels{display:flex;justify-content:space-between;font-size:10px;color:var(--muted,#7a8ba8);margin-top:2px}
.aclk-bid-display{font-size:14px;font-weight:700;color:var(--accent,#3b82f6)}
.aclk-actions{display:flex;gap:8px;justify-content:center}
.aclk-btn{padding:10px 20px;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;transition:all .1s}
.aclk-btn:active{transform:scale(.95)}
.aclk-btn:disabled{opacity:.3;cursor:default}
.aclk-btn-bid{background:var(--accent,#3b82f6);color:#fff}
.aclk-btn-pass{background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);color:var(--muted,#7a8ba8)}
.aclk-msg{text-align:center;padding:8px 12px;border-radius:6px;font-size:13px;font-weight:600;animation:aclk-pop .3s ease-out}
@keyframes aclk-pop{0%{transform:scale(.9);opacity:0}100%{transform:scale(1);opacity:1}}
.aclk-msg-good{color:var(--green,#22c55e);background:rgba(34,197,94,.1)}
.aclk-msg-bad{color:var(--red,#ef4444);background:rgba(239,68,68,.1)}
.aclk-msg-warn{color:#eab308;background:rgba(234,179,8,.1)}
.aclk-msg-win{color:var(--green,#22c55e);background:rgba(34,197,94,.15);font-size:15px}
.aclk-msg-fail{color:var(--red,#ef4444);background:rgba(239,68,68,.15)}
.aclk-msg-neutral{color:var(--muted,#7a8ba8)}
.aclk-msg-haggle{color:#f97316;background:rgba(249,115,22,.1);font-style:italic}
.aclk-history{background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);border-radius:8px;padding:10px 12px}
.aclk-hist-title{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--muted,#7a8ba8);margin-bottom:8px}
.aclk-hist-row{display:grid;grid-template-columns:20px 1fr 50px 24px;gap:6px;align-items:center;padding:5px 0;border-bottom:1px solid var(--border,#1e2a45);font-size:11px;color:var(--text,#e0e6f0)}
.aclk-hist-row:last-child{border:none}
.aclk-hist-won{color:var(--green,#22c55e)}
.aclk-hist-lost{color:var(--red,#ef4444)}
.aclk-hist-pass{color:var(--muted,#7a8ba8)}
.aclk-hist-value{font-size:12px}
`;
    document.head.appendChild(s);
  }
}
