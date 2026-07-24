/**
 * Push-Your-Luck Lock Puzzle
 *
 * Draw tokens from a bag. Each consecutive draw without banking increases
 * a multiplier AND the bust chance — visualized as escalating security.
 * Banking locks in (pending × multiplier). Busting loses ALL pending.
 *
 * Visual: A scene that escalates with each draw:
 *   Draw 1: 1 CCTV camera
 *   Draw 2: 2 CCTV cameras
 *   Draw 3: Security guard appears
 *   Draw 4: 2 guards
 *   Draw 5: Guard dog
 *   Draw 6+: More dogs, spotlights
 *
 * Usage:
 *   new PushLuckLock(containerEl, {
 *     target: 30,
 *     bag: [
 *       { type: 'gem', value: 3, label: '📄 +3', weight: 3 },
 *       { type: 'gem', value: 5, label: '📂 +5', weight: 2 },
 *       { type: 'gem', value: 8, label: '💾 +8', weight: 1 },
 *       { type: 'bust', value: 0, label: '🚨 Caught!', weight: 2 },
 *     ],
 *     maxRounds: 5,
 *     onSubmit(correct) { ... },
 *     onPenalty(rounds) { ... }
 *   });
 */

class PushLuckLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.target = opts.target || 30;
    this.bag = opts.bag || [
      { type: 'gem', value: 3, label: '+3', weight: 3 },
      { type: 'gem', value: 5, label: '+5', weight: 2 },
      { type: 'gem', value: 8, label: '+8', weight: 1 },
      { type: 'bust', value: 0, label: 'Bust!', weight: 2 },
    ];
    this.maxRounds = opts.maxRounds || 5;
    this.onSubmit = opts.onSubmit || (() => {});
    this.onPenalty = opts.onPenalty || (() => {});

    this._baseBag = [];
    this.bag.forEach(item => {
      for (let i = 0; i < (item.weight || 1); i++) this._baseBag.push(item);
    });

    this._init();
  }

  _init() {
    this.banked = 0;
    this.pending = 0;
    this.streak = 0;
    this.rounds = 0;
    this.history = [];
    this.busted = false;
    this.won = false;
    this.lastDraw = null;
    this._render();
  }

  _getBustChance() {
    return Math.min(0.85, 0.125 + this.streak * 0.125);
  }

  _getMultiplier() {
    return 1 + this.streak * 0.25;
  }

  _draw() {
    if (this.busted || this.won || this._animating) return;
    this._animating = true;

    // Disable buttons visually
    const actions = this.container.querySelector('.pllk-actions');
    if (actions) actions.classList.add('pllk-actions-locked');

    // Animate player sneaking forward
    const player = this.container.querySelector('.pllk-player');
    if (player) {
      player.classList.add('pllk-sneaking');
    }

    setTimeout(() => {
      const bustChance = this._getBustChance();
      const roll = Math.random();

      if (roll < bustChance) {
        const bustItem = this.bag.find(b => b.type === 'bust') || { type: 'bust', value: 0, label: 'Bust!' };
        this.lastDraw = { ...bustItem };
        this.history.push(this.lastDraw);
        this.busted = true;
        this.pending = 0;
        this.streak = 0;
        this._animating = false;
        this._render();
        return;
      }

      const gems = this._baseBag.filter(b => b.type !== 'bust');
      const item = gems[Math.floor(Math.random() * gems.length)];
      this.streak++;
      this.lastDraw = { ...item };
      this.history.push(this.lastDraw);
      this.pending += item.value;
      this._animating = false;
      this._render();
    }, 600);
  }

  _bank() {
    if (this.busted || this.won || this.pending === 0 || this._animating) return;
    const multiplier = this._getMultiplier();
    const earned = Math.round(this.pending * multiplier);
    this.banked += earned;
    this.pending = 0;
    this.streak = 0;
    this.rounds++;
    this.history = [];
    this.lastDraw = null;

    if (this.banked >= this.target) {
      this.won = true;
      this._render();
      setTimeout(() => this.onSubmit(true), 500);
      return;
    }

    if (this.rounds >= this.maxRounds) {
      this.onPenalty(this.rounds);
    }

    this._render();
  }

  reset() { this._init(); }

  _getSecurityScene() {
    const s = this.streak;
    // Build scene elements based on streak
    const elements = [];
    let bgColor = '#0a1220';
    let alertLevel = '';

    if (s === 0) {
      alertLevel = 'ALL CLEAR';
      bgColor = '#0a1a10';
      return { elements: [], bgColor, alertLevel, alertColor: '#22c55e' };
    }

    // CCTVs
    if (s >= 1) elements.push({ type: 'cctv', x: 15, y: 8 });
    if (s >= 2) elements.push({ type: 'cctv', x: 75, y: 8 });
    if (s >= 4) elements.push({ type: 'cctv', x: 45, y: 5 });

    // Guards
    if (s >= 3) elements.push({ type: 'guard', x: 70, y: 55 });
    if (s >= 4) elements.push({ type: 'guard', x: 20, y: 60 });
    if (s >= 6) elements.push({ type: 'guard', x: 45, y: 50 });

    // Dogs
    if (s >= 5) elements.push({ type: 'dog', x: 55, y: 72 });
    if (s >= 6) elements.push({ type: 'dog', x: 30, y: 75 });

    // Spotlights
    if (s >= 5) elements.push({ type: 'spotlight', x: 50, y: 0 });
    if (s >= 7) elements.push({ type: 'spotlight', x: 25, y: 0 });

    // Alert level
    if (s <= 1) { alertLevel = 'LOW'; bgColor = '#0a1a15'; }
    else if (s === 2) { alertLevel = 'MODERATE'; bgColor = '#1a1a0a'; }
    else if (s === 3) { alertLevel = 'ELEVATED'; bgColor = '#1a150a'; }
    else if (s === 4) { alertLevel = 'HIGH'; bgColor = '#1a100a'; }
    else { alertLevel = 'CRITICAL'; bgColor = '#1a0a0a'; }

    const alertColor = s <= 1 ? '#22c55e' : s === 2 ? '#eab308' : s <= 4 ? '#f97316' : '#ef4444';
    return { elements, bgColor, alertLevel, alertColor };
  }

  _renderSecurityScene() {
    const { elements, bgColor, alertLevel, alertColor } = this._getSecurityScene();
    const bustedClass = this.busted ? ' pllk-scene-busted' : '';

    let elementsHtml = '';
    elements.forEach(el => {
      switch (el.type) {
        case 'cctv':
          elementsHtml += `<div class="pllk-el pllk-cctv" style="left:${el.x}%;top:${el.y}%">
            <div class="pllk-cctv-arm"></div><div class="pllk-cctv-lens"></div>
          </div>`;
          break;
        case 'guard':
          elementsHtml += `<div class="pllk-el pllk-guard" style="left:${el.x}%;top:${el.y}%">🧑‍✈️</div>`;
          break;
        case 'dog':
          elementsHtml += `<div class="pllk-el pllk-dog" style="left:${el.x}%;top:${el.y}%">🐕</div>`;
          break;
        case 'spotlight':
          elementsHtml += `<div class="pllk-spotlight" style="left:${el.x}%"></div>`;
          break;
      }
    });

    // Filing cabinet target on the right
    const cabinetHtml = `<div class="pllk-cabinet">🗄️</div>`;

    // The player
    const playerEmoji = this.busted ? '😱' : '🕵️';
    const playerHtml = `<div class="pllk-player">${playerEmoji}</div>`;

    // Loot float animation on successful draw
    const lootHtml = (this.lastDraw && this.lastDraw.type !== 'bust' && this.streak > 0)
      ? `<div class="pllk-loot">${this.lastDraw.label}</div>` : '';

    // Grabbed docs stash (bottom left)
    const stashHtml = this.streak > 0 && !this.busted
      ? `<div class="pllk-stash">${this.history.filter(h => h.type !== 'bust').map(() => '📄').join('')}</div>`
      : '';

    return `<div class="pllk-scene${bustedClass}" style="background:${bgColor}">
      <div class="pllk-scene-alert" style="color:${alertColor};border-color:${alertColor}">
        <span class="pllk-alert-dot" style="background:${alertColor}"></span>
        ${alertLevel}
      </div>
      ${elementsHtml}
      ${cabinetHtml}
      ${playerHtml}
      ${lootHtml}
      ${stashHtml}
      ${this.busted ? '<div class="pllk-scene-caught">CAUGHT!</div>' : ''}
    </div>`;
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'pllk';

    // Security scene
    const sceneDiv = document.createElement('div');
    sceneDiv.innerHTML = this._renderSecurityScene();
    wrap.appendChild(sceneDiv.firstElementChild);

    // Progress bar
    const pct = Math.min(100, (this.banked / this.target) * 100);
    const multiplier = this._getMultiplier();
    const earnPreview = Math.round(this.pending * multiplier);
    const pendPct = Math.min(100 - pct, (earnPreview / this.target) * 100);
    const barWrap = document.createElement('div');
    barWrap.className = 'pllk-bar-wrap';
    barWrap.innerHTML = `<div class="pllk-bar-banked" style="width:${pct}%"></div><div class="pllk-bar-pending" style="width:${pendPct}%;left:${pct}%"></div>`;
    wrap.appendChild(barWrap);

    // Score row
    const score = document.createElement('div');
    score.className = 'pllk-score';
    score.innerHTML = `<span class="pllk-banked">Banked: <strong>${this.banked}</strong></span>
      <span class="pllk-pending">Pending: <strong>${this.pending}</strong>${this.streak > 0 ? ' ×' + multiplier.toFixed(1) : ''}</span>
      <span class="pllk-target">Target: <strong>${this.target}</strong></span>`;
    wrap.appendChild(score);

    // Risk meter
    if (!this.busted && !this.won) {
      const bustChance = this._getBustChance();
      const nextBust = Math.min(0.85, 0.125 + (this.streak + 1) * 0.125);
      const riskPct = Math.round(bustChance * 100);
      const nextPct = Math.round(nextBust * 100);
      const riskColor = riskPct <= 20 ? 'var(--green,#22c55e)' : riskPct <= 40 ? 'var(--yellow,#eab308)' : riskPct <= 60 ? '#f97316' : 'var(--red,#ef4444)';
      const riskEl = document.createElement('div');
      riskEl.className = 'pllk-risk';
      riskEl.innerHTML = `
        <div class="pllk-risk-label">
          <span>Bust chance: <strong style="color:${riskColor}">${riskPct}%</strong></span>
          <span class="pllk-risk-next">Next: ${nextPct}%</span>
        </div>
        <div class="pllk-risk-bar"><div class="pllk-risk-fill" style="width:${riskPct}%;background:${riskColor}"></div></div>`;
      wrap.appendChild(riskEl);
    }

    // Multiplier callout
    if (this.streak > 0 && !this.busted && !this.won) {
      const multEl = document.createElement('div');
      multEl.className = 'pllk-mult';
      multEl.innerHTML = `<span class="pllk-mult-label">×${multiplier.toFixed(1)} Multiplier</span><span class="pllk-mult-value">Bank now = <strong>${earnPreview}</strong> pts</span>`;
      wrap.appendChild(multEl);
    }

    // Last draw
    if (this.lastDraw) {
      const drawEl = document.createElement('div');
      drawEl.className = 'pllk-last-draw' + (this.lastDraw.type === 'bust' ? ' pllk-bust' : ' pllk-gem');
      drawEl.textContent = this.lastDraw.label;
      wrap.appendChild(drawEl);
    }

    // History chips
    if (this.history.length > 0 && !this.busted) {
      const hist = document.createElement('div');
      hist.className = 'pllk-history';
      this.history.forEach(h => {
        const chip = document.createElement('span');
        chip.className = 'pllk-chip' + (h.type === 'bust' ? ' pllk-chip-bust' : '');
        chip.textContent = h.label;
        hist.appendChild(chip);
      });
      wrap.appendChild(hist);
    }

    // Round counter
    if (!this.won) {
      const roundEl = document.createElement('div');
      roundEl.className = 'pllk-rounds';
      roundEl.textContent = `Round ${this.rounds + 1}${this.maxRounds ? ' / ' + this.maxRounds : ''}`;
      if (this.rounds >= this.maxRounds - 1) roundEl.classList.add('pllk-rounds-warn');
      wrap.appendChild(roundEl);
    }

    // Actions or result
    if (this.won) {
      const res = document.createElement('div');
      res.className = 'pllk-result pllk-win';
      res.textContent = `Target reached! (${this.banked}/${this.target}) in ${this.rounds} rounds`;
      wrap.appendChild(res);
    } else if (this.busted) {
      const res = document.createElement('div');
      res.className = 'pllk-result pllk-fail';
      res.textContent = 'Busted! All pending points lost.';
      wrap.appendChild(res);
      const again = document.createElement('button');
      again.className = 'pllk-btn pllk-btn-draw';
      again.textContent = 'Next Round';
      again.addEventListener('click', () => {
        this.busted = false;
        this.rounds++;
        this.history = [];
        this.lastDraw = null;
        if (this.rounds >= this.maxRounds) this.onPenalty(this.rounds);
        this._render();
      });
      wrap.appendChild(again);
    } else {
      const actions = document.createElement('div');
      actions.className = 'pllk-actions';
      const bustChance2 = this._getBustChance();
      const dangerClass = bustChance2 >= 0.5 ? ' pllk-btn-danger' : bustChance2 >= 0.3 ? ' pllk-btn-warn' : '';
      const drawBtn = document.createElement('button');
      drawBtn.className = 'pllk-btn pllk-btn-draw' + dangerClass;
      drawBtn.textContent = 'Attempt';
      drawBtn.addEventListener('click', () => this._draw());
      actions.appendChild(drawBtn);
      const bankBtn = document.createElement('button');
      bankBtn.className = 'pllk-btn pllk-btn-bank';
      bankBtn.textContent = this.pending > 0 ? `Bank ${earnPreview}` : 'Bank';
      bankBtn.disabled = this.pending === 0;
      bankBtn.addEventListener('click', () => this._bank());
      actions.appendChild(bankBtn);
      wrap.appendChild(actions);
    }

    this.container.appendChild(wrap);
    this._injectStyles();
  }

  _injectStyles() {
    if (document.getElementById('pllk-css')) return;
    const s = document.createElement('style'); s.id = 'pllk-css';
    s.textContent = `
.pllk{display:flex;flex-direction:column;gap:10px;padding:16px 0;max-width:420px;margin:0 auto;align-items:center}

/* Scene */
.pllk-scene{position:relative;width:100%;height:140px;border-radius:10px;border:1px solid var(--border,#1e2a45);overflow:hidden;transition:background .4s}
.pllk-scene-busted{animation:pllk-flash .6s ease-out}
@keyframes pllk-flash{0%,40%,80%{background:#3a0a0a}20%,60%{background:#1a0a0a}}
.pllk-scene-alert{position:absolute;top:6px;right:8px;font-size:9px;font-weight:700;letter-spacing:1.5px;padding:2px 8px;border:1px solid;border-radius:4px;display:flex;align-items:center;gap:4px}
.pllk-alert-dot{width:6px;height:6px;border-radius:50%;animation:pllk-blink 1.2s infinite}
@keyframes pllk-blink{0%,100%{opacity:1}50%{opacity:.3}}
.pllk-el{position:absolute;transition:all .3s;animation:pllk-appear .4s ease-out}
@keyframes pllk-appear{0%{opacity:0;transform:scale(.5)}100%{opacity:1;transform:scale(1)}}
.pllk-cctv{width:20px;height:20px}
.pllk-cctv-arm{width:14px;height:3px;background:#555;border-radius:2px;position:absolute;top:4px;left:3px}
.pllk-cctv-lens{width:8px;height:8px;background:#ef4444;border-radius:50%;position:absolute;top:8px;left:6px;box-shadow:0 0 6px rgba(239,68,68,.6);animation:pllk-blink 2s infinite}
.pllk-guard{font-size:28px;transform:translateX(-50%)}
.pllk-dog{font-size:22px;transform:translateX(-50%);animation:pllk-appear .4s ease-out,pllk-patrol 2s ease-in-out infinite alternate}
@keyframes pllk-patrol{0%{transform:translateX(-50%) translateX(-5px)}100%{transform:translateX(-50%) translateX(5px)}}
.pllk-spotlight{position:absolute;top:0;width:40px;height:100%;background:linear-gradient(to bottom,rgba(255,255,200,.08),transparent 70%);transform:translateX(-50%);animation:pllk-sweep 3s ease-in-out infinite alternate}
@keyframes pllk-sweep{0%{transform:translateX(-50%) rotate(-5deg)}100%{transform:translateX(-50%) rotate(5deg)}}
.pllk-cabinet{position:absolute;right:12%;top:50%;transform:translateY(-50%);font-size:36px;opacity:.6}
.pllk-player{position:absolute;bottom:20px;left:25%;transform:translateX(-50%);font-size:30px;transition:left .4s ease-in-out,transform .4s ease-in-out}
.pllk-player.pllk-sneaking{left:65%;transform:translateX(-50%) scale(0.85)}
.pllk-stash{position:absolute;bottom:6px;left:8px;font-size:12px;letter-spacing:-2px;opacity:.7}
.pllk-scene-caught{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:18px;font-weight:900;color:#ef4444;text-shadow:0 0 10px rgba(239,68,68,.8);letter-spacing:3px;animation:pllk-pop .3s ease-out}
.pllk-loot{position:absolute;top:30%;left:45%;font-size:16px;font-weight:700;color:var(--green,#22c55e);animation:pllk-loot-fly 1s ease-out forwards;pointer-events:none}
@keyframes pllk-loot-fly{0%{opacity:1;transform:translate(0,0) scale(1.3)}40%{opacity:1;transform:translate(-40px,20px) scale(1)}100%{opacity:0;transform:translate(-80px,40px) scale(0.6)}}

/* Progress */
.pllk-bar-wrap{position:relative;width:100%;height:10px;background:var(--surface,#141b2d);border-radius:5px;overflow:hidden;border:1px solid var(--border,#1e2a45)}
.pllk-bar-banked{position:absolute;top:0;left:0;height:100%;background:var(--green,#22c55e);transition:width .3s}
.pllk-bar-pending{position:absolute;top:0;height:100%;background:var(--yellow,#eab308);opacity:.5;transition:width .3s,left .3s}
.pllk-score{display:flex;justify-content:space-between;width:100%;font-size:11px;color:var(--muted,#7a8ba8)}
.pllk-score strong{color:var(--text,#e0e6f0)}
.pllk-banked strong{color:var(--green,#22c55e)}
.pllk-pending strong{color:var(--yellow,#eab308)}

/* Risk */
.pllk-risk{width:100%;padding:6px 10px;background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);border-radius:6px}
.pllk-risk-label{display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px}
.pllk-risk-next{color:var(--muted,#7a8ba8);font-size:10px}
.pllk-risk-bar{width:100%;height:6px;background:var(--bg,#0a0e17);border-radius:3px;overflow:hidden}
.pllk-risk-fill{height:100%;border-radius:3px;transition:width .3s,background .3s}

/* Multiplier */
.pllk-mult{background:rgba(234,179,8,.08);border:1px solid rgba(234,179,8,.4);border-radius:6px;padding:6px 12px;text-align:center;font-size:12px;width:100%;display:flex;justify-content:space-between;align-items:center}
.pllk-mult-label{color:var(--yellow,#eab308);font-weight:700}
.pllk-mult-value{color:var(--muted,#7a8ba8)}
.pllk-mult-value strong{color:var(--text,#e0e6f0)}

/* Draw result */
.pllk-last-draw{font-size:20px;font-weight:700;padding:12px 20px;text-align:center;border-radius:10px;min-width:100px;animation:pllk-pop .3s ease-out}
.pllk-gem{color:var(--green,#22c55e);background:rgba(34,197,94,.1);border:2px solid var(--green,#22c55e)}
.pllk-bust{color:var(--red,#ef4444);background:rgba(239,68,68,.1);border:2px solid var(--red,#ef4444);animation:pllk-shake .4s ease-out}
@keyframes pllk-pop{0%{transform:scale(0.5);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes pllk-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}

/* History */
.pllk-history{display:flex;flex-wrap:wrap;gap:4px;justify-content:center}
.pllk-chip{font-size:10px;padding:2px 6px;border-radius:4px;background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);color:var(--muted,#7a8ba8)}
.pllk-chip-bust{color:var(--red,#ef4444);border-color:var(--red,#ef4444)}

/* Rounds */
.pllk-rounds{font-size:10px;color:var(--muted,#7a8ba8)}
.pllk-rounds-warn{color:var(--red,#ef4444);font-weight:600}

/* Actions */
.pllk-actions{display:flex;gap:10px;transition:opacity .2s}
.pllk-actions-locked{opacity:.4;pointer-events:none}
.pllk-btn{padding:12px 20px;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:all .1s}
.pllk-btn:active{transform:scale(.95)}
.pllk-btn:disabled{opacity:.3;cursor:default}
.pllk-btn-draw{background:var(--accent,#3b82f6);color:#fff;position:relative;overflow:hidden}
.pllk-btn-draw.pllk-btn-warn{background:#f97316;animation:pllk-btn-pulse 1.5s infinite}
.pllk-btn-draw.pllk-btn-danger{background:var(--red,#ef4444);animation:pllk-btn-pulse .8s infinite}
@keyframes pllk-btn-pulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.4)}50%{box-shadow:0 0 0 6px rgba(239,68,68,0)}}
.pllk-btn-bank{background:var(--green,#22c55e);color:#fff}

/* Results */
.pllk-result{font-size:13px;font-weight:700;padding:10px;text-align:center;border-radius:8px;width:100%}
.pllk-win{color:var(--green,#22c55e);background:rgba(34,197,94,.1)}
.pllk-fail{color:var(--red,#ef4444);background:rgba(239,68,68,.1)}
`;
    document.head.appendChild(s);
  }
}
