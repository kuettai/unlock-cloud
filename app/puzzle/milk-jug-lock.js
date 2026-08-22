class MilkJugLock {
  constructor(el, opts) {
    this.el = el;
    this.cfg = opts.config || opts;
    this.onSubmit = opts.onSubmit;
    this.onWrong = opts.onWrong;
    this.steps = this.cfg.steps;
    this.jugDisplay = this.cfg.jugDisplay;
    this.step = 0;
    this.jugStates = ['unknown', 'unknown', 'unknown'];
    this.shelfPicked = [];
    this.cardFlipped = [];
    this.attempts = 0;
    this._injectStyles();
    this._render();
  }
  _injectStyles() {
    if (document.getElementById('mjlk-style')) return;
    const s = document.createElement('style'); s.id = 'mjlk-style';
    s.textContent = `
.mjlk-wrap{max-width:420px;margin:0 auto;padding:8px 0}
.mjlk-jugs{display:flex;justify-content:center;gap:1rem;margin-bottom:12px;padding:10px;background:#1a1a2e;border:1px solid var(--border,#333);border-radius:10px}
.mjlk-jug{text-align:center;transition:all 0.4s}
.mjlk-jug.unknown{opacity:0.3}
.mjlk-jug-icon{font-size:2.2rem}
.mjlk-jug.mystery .mjlk-jug-icon{filter:hue-rotate(300deg)}
.mjlk-jug-name{font-size:10px;font-weight:bold;margin-top:3px}
.mjlk-jug-time{font-size:9px;color:#888}
.mjlk-jug-tag{font-size:9px;margin-top:2px}
.mjlk-progress{display:flex;gap:3px;margin-bottom:12px}
.mjlk-bar{flex:1;height:4px;border-radius:2px;background:#333}
.mjlk-bar.done{background:#2ecc71}
.mjlk-bar.active{background:#f39c12}
.mjlk-narrative{background:#2a2a4e;border-left:3px solid #f39c12;border-radius:0 6px 6px 0;padding:12px;margin-bottom:12px;font-size:13px;color:#ccc;line-height:1.5;font-style:italic}
.mjlk-input{background:#1a1a2e;border:1px solid var(--border,#444);border-radius:8px;padding:12px}
.mjlk-prompt{font-size:13px;color:#eee;margin-bottom:10px}
.mjlk-shelf{display:flex;justify-content:center;gap:10px;flex-wrap:wrap}
.mjlk-shelf-btn{width:60px;height:75px;background:#2a2a4e;border:2px solid #555;border-radius:8px;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:all 0.2s}
.mjlk-shelf-btn .emoji{color:#eee}
.mjlk-shelf-btn.picked{background:#1e4d2b;border-color:#2ecc71;transform:scale(0.9)}
.mjlk-shelf-btn .emoji{font-size:1.8rem}
.mjlk-shelf-btn .lbl{font-size:9px;color:#888}
.mjlk-shelf-count{text-align:center;margin-top:10px;font-size:12px}
.mjlk-choice{display:block;width:100%;text-align:left;padding:10px;margin-bottom:6px;background:var(--surface,#2a2a4e);border:1px solid var(--border,#444);border-radius:6px;color:var(--text,#eee);cursor:pointer;font-size:13px}
.mjlk-suspects{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.mjlk-suspect{padding:10px;background:#2a2a4e;border:2px solid #555;border-radius:8px;text-align:center;cursor:pointer;transition:all 0.2s}
.mjlk-suspect.eliminated{background:#1a1a1a;border-color:#333;opacity:0.4;cursor:default}
.mjlk-suspect.correct{background:#1e4d2b;border-color:#2ecc71}
.mjlk-suspect-icon{font-size:1.5rem}
.mjlk-suspect-name{font-size:12px;color:#eee;margin-top:4px}
.mjlk-suspect-reason{font-size:10px;color:#e74c3c;margin-top:3px}
.mjlk-suspect.correct .mjlk-suspect-reason{color:#2ecc71}
.mjlk-hint{font-size:11px;color:#e74c3c;margin-top:8px;min-height:16px}
.mjlk-num-row{display:flex;align-items:center;justify-content:center;gap:8px}
.mjlk-num{width:70px;padding:8px;background:var(--surface,#2a2a4e);border:2px solid #f39c12;border-radius:6px;color:#f39c12;font-size:1.3rem;text-align:center;font-family:monospace}
.mjlk-go{padding:8px 14px;border:none;border-radius:6px;background:var(--accent,#e94560);color:#fff;font-size:14px;font-weight:600;cursor:pointer}
.mjlk-done-btn{display:block;margin:10px auto 0;padding:8px 16px;border:none;border-radius:6px;background:var(--accent,#e94560);color:#fff;font-size:13px;cursor:pointer}
.mjlk-complete{background:#1a3320;border:2px solid #2ecc71;border-radius:10px;padding:1.2rem;text-align:center}`;
    document.head.appendChild(s);
  }
  _renderJugs() {
    const jugs = this.jugDisplay.jugs;
    return `<div class="mjlk-jugs">${jugs.map((j, i) => {
      const state = this.jugStates[i];
      const color = state === 'yours' ? '#2ecc71' : state === 'mystery' ? '#e94560' : '#555';
      const tag = state === 'yours' ? 'You' : state === 'mystery' ? '???' : '';
      return `<div class="mjlk-jug ${state}"><div class="mjlk-jug-icon">🥛</div><div class="mjlk-jug-name" style="color:${color}">${j.name}</div><div class="mjlk-jug-time">${j.time}</div>${tag ? `<div class="mjlk-jug-tag" style="color:${color}">${tag}</div>` : ''}</div>`;
    }).join('')}</div>`;
  }
  _render() {
    if (this.step >= this.steps.length) {
      this.jugStates = ['yours', 'yours', 'mystery'];
      this.el.innerHTML = `<div class="mjlk-wrap">${this._renderJugs()}<div class="mjlk-complete"><div style="font-size:1rem;color:#2ecc71;margin-bottom:6px">🥛 Evidence Complete</div><div style="font-size:12px;color:#ccc">Someone with the store room code. Working the machine. Steaming milk. Rinsing up after. The whole shift.</div></div></div>`;
      this.onSubmit();
      return;
    }
    const st = this.steps[this.step];
    const progress = this.steps.map((_, i) => `<div class="mjlk-bar${i < this.step ? ' done' : i === this.step ? ' active' : ''}"></div>`).join('');
    let inputHtml = '';
    if (st.type === 'shelf_tap') {
      inputHtml = `<div class="mjlk-input"><div style="font-size:11px;color:#888;text-align:center;margin-bottom:8px">STORE ROOM SHELF — tap the jugs you took this morning</div>
        <div class="mjlk-shelf">${Array.from({ length: st.shelfCount || 5 }, (_, i) => {
          const picked = this.shelfPicked.includes(i);
          return `<button class="mjlk-shelf-btn${picked ? ' picked' : ''}" data-shelf="${i}"><div class="emoji">${picked ? '✓' : '🥛'}</div><div class="lbl">Jug ${String.fromCharCode(65 + i)}</div></button>`;
        }).join('')}</div>
        <div class="mjlk-shelf-count" style="color:${this.shelfPicked.length === (st.selectCount || 2) ? '#2ecc71' : '#888'}">${this.shelfPicked.length}/${st.selectCount || 2} selected</div>
        ${this.shelfPicked.length === (st.selectCount || 2) ? '<button class="mjlk-done-btn" id="mjlk-shelf-done">Done — head to the counter</button>' : ''}
      </div>`;
    } else if (st.type === 'choice') {
      inputHtml = `<div class="mjlk-input"><div class="mjlk-prompt">${st.prompt}</div>${st.options.map((o, i) => `<button class="mjlk-choice" data-choice="${i}">${o}</button>`).join('')}<div class="mjlk-hint" id="mjlk-hint"></div></div>`;
    } else if (st.type === 'card_elimination') {
      inputHtml = `<div class="mjlk-input"><div class="mjlk-prompt">${st.prompt}</div><div class="mjlk-suspects">${st.suspects.map((su, i) => {
        const flipped = this.cardFlipped.includes(i);
        if (flipped && su.eliminate) return `<div class="mjlk-suspect eliminated"><div class="mjlk-suspect-icon">❌</div><div class="mjlk-suspect-name" style="text-decoration:line-through">${su.name}</div><div class="mjlk-suspect-reason">${su.reason}</div></div>`;
        if (flipped && !su.eliminate) return `<div class="mjlk-suspect correct"><div class="mjlk-suspect-icon">🔑</div><div class="mjlk-suspect-name">${su.name}</div><div class="mjlk-suspect-reason">${su.reason}</div></div>`;
        return `<button class="mjlk-suspect" data-card="${i}"><div class="mjlk-suspect-icon">${su.icon}</div><div class="mjlk-suspect-name">${su.name}</div><div style="font-size:9px;color:#888;margin-top:2px">tap to investigate</div></button>`;
      }).join('')}</div></div>`;
    } else if (st.type === 'number_input') {
      inputHtml = `<div class="mjlk-input"><div class="mjlk-prompt">${st.prompt}</div><div class="mjlk-num-row"><input type="number" class="mjlk-num" id="mjlk-inp"><button class="mjlk-go" id="mjlk-go">→</button></div><div class="mjlk-hint" id="mjlk-hint"></div></div>`;
    }
    this.el.innerHTML = `<div class="mjlk-wrap">${this._renderJugs()}<div class="mjlk-progress">${progress}</div><div class="mjlk-narrative">${st.narrative}</div>${inputHtml}</div>`;
    this._bind(st);
  }
  _bind(st) {
    if (st.type === 'shelf_tap') {
      this.el.querySelectorAll('[data-shelf]').forEach(b => b.addEventListener('click', e => {
        const i = +e.currentTarget.dataset.shelf;
        if (this.shelfPicked.includes(i)) this.shelfPicked = this.shelfPicked.filter(x => x !== i);
        else if (this.shelfPicked.length < (st.selectCount || 2)) this.shelfPicked.push(i);
        this._render();
      }));
      const done = this.el.querySelector('#mjlk-shelf-done');
      if (done) done.addEventListener('click', () => { this.jugStates[0] = 'yours'; this.jugStates[1] = 'yours'; this.jugStates[2] = 'mystery'; this.step++; this._render(); });
    } else if (st.type === 'choice') {
      this.el.querySelectorAll('[data-choice]').forEach(b => b.addEventListener('click', e => {
        const i = +e.currentTarget.dataset.choice;
        if (i === st.answer) { this.attempts = 0; this.step++; this._render(); }
        else { const hint = this.el.querySelector('#mjlk-hint'); if (hint && st.wrong && st.wrong[i]) hint.textContent = '❌ ' + st.wrong[i]; if (this.onWrong) this.onWrong(st.wrong?.[i] || 'Wrong.'); }
      }));
    } else if (st.type === 'card_elimination') {
      this.el.querySelectorAll('[data-card]').forEach(b => b.addEventListener('click', e => {
        const i = +e.currentTarget.dataset.card;
        if (this.cardFlipped.includes(i)) return;
        this.cardFlipped.push(i);
        this._render();
        if (this._advancing) return;
        const eliminatedCount = this.cardFlipped.filter(x => st.suspects[x].eliminate).length;
        const totalToEliminate = st.suspects.filter(s => s.eliminate).length;
        if (eliminatedCount === totalToEliminate) {
          this._advancing = true;
          setTimeout(() => { this._advancing = false; this.step++; this._render(); }, 1000);
        }
      }));
    } else if (st.type === 'number_input') {
      const inp = this.el.querySelector('#mjlk-inp');
      const go = this.el.querySelector('#mjlk-go');
      const check = () => {
        const val = parseInt(inp.value); if (isNaN(val)) return;
        if (val === st.answer) { this.attempts = 0; this.step++; this._render(); }
        else { this.attempts++; inp.style.borderColor = '#e74c3c'; setTimeout(() => { inp.style.borderColor = '#f39c12'; }, 400); if (this.attempts >= 2 && st.hint) this.el.querySelector('#mjlk-hint').textContent = '💡 ' + st.hint; if (this.onWrong) this.onWrong('Wrong.'); }
      };
      go.addEventListener('click', check);
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
      setTimeout(() => inp.focus(), 50);
    }
  }
}
