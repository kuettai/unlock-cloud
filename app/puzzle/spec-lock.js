/**
 * Spec Lock Puzzle — "The Golem's Interpretation"
 *
 * 3-phase per round:
 * Phase 0 (vibe): Player picks a vague prompt and sends it. Golem "builds" something wrong.
 * Phase 1 (chaos): Golem cycles through wrong outputs. Player sees the failure.
 * Phase 2 (spec): Player fills structured spec. Golem builds correctly.
 *
 * Multi-round: cycles through all rounds, then success.
 */

class SpecLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.rounds = opts.rounds || [];
    this.onSubmit = opts.onSubmit || (() => {});
    this.onWrong = opts.onWrong || (() => {});
    // Themeable agent name — when omitted, the original "golem" theme is used
    // verbatim (ep4/ep6). A proper name (e.g. ep8's "Kiro") switches to
    // name-friendly phrasing so sentences stay grammatical.
    this.agentName = opts.agentName || null;
    this.cliName = opts.cliName || 'golem-cli';
    const A = this.agentName;
    this._txt = {
      awaiting: A ? `${A} is ready. What do you want it to build?` : 'The golem awaits your command. What do you want it to build?',
      send: '⏎ Send to ' + (A || 'Golem'),
      done: A ? `All specs validated! ${A} knows exactly what to build.` : 'All specs validated! The golem knows exactly what to build.',
      builds: A ? `✅ Spec validated! ${A} builds correctly.` : '✅ Spec validated! The golem builds correctly.'
    };
    this.falseOutputs = opts.falseOutputs || [A ? `${A} is still confused.` : 'The golem is still confused.'];
    this.currentRound = 0;
    this.selections = [];
    this.phase = 'vibe'; // 'vibe' → 'chaos' → 'spec'
    this.solved = [];
    this._chaosTimer = null;
    this._chaosIdx = 0;
    this._resetSelections();
    this._render();
  }

  _resetSelections() {
    const round = this.rounds[this.currentRound];
    this.selections = round ? new Array(round.spec.length).fill(null) : [];
  }

  _round() { return this.rounds[this.currentRound]; }

  _render() {
    this.container.innerHTML = '';
    if (this._chaosTimer) { clearTimeout(this._chaosTimer); this._chaosTimer = null; }

    const wrap = document.createElement('div');
    wrap.className = 'speclk';

    // Progress
    if (this.rounds.length > 1) {
      const prog = document.createElement('div');
      prog.className = 'speclk-progress';
      prog.innerHTML = this.rounds.map((_, i) =>
        `<div class="speclk-pip ${i < this.currentRound ? 'speclk-pip-done' : i === this.currentRound ? 'speclk-pip-active' : ''}"></div>`
      ).join('');
      wrap.appendChild(prog);
    }

    // Solved list
    if (this.solved.length > 0) {
      const list = document.createElement('div');
      list.className = 'speclk-solved';
      this.solved.forEach(s => { list.innerHTML += `<div class="speclk-solved-item">✅ ${s}</div>`; });
      wrap.appendChild(list);
    }

    if (this.currentRound >= this.rounds.length) {
      const doneText = this._txt.done;
      wrap.innerHTML += `<div class="speclk-done"><div class="speclk-done-icon">🤖✨</div><div class="speclk-done-text">${doneText}</div></div>`;
      this.container.appendChild(wrap);
      this._injectStyles();
      setTimeout(() => this.onSubmit(), 600);
      return;
    }

    if (this.phase === 'vibe') this._renderVibe(wrap);
    else if (this.phase === 'chaos') this._renderChaos(wrap);
    else this._renderSpec(wrap);

    this.container.appendChild(wrap);
    this._injectStyles();
  }

  // Phase 0: Player sends a vague prompt
  _renderVibe(wrap) {
    const round = this._round();

    const intro = document.createElement('div');
    intro.className = 'speclk-intro';
    const introText = this._txt.awaiting;
    intro.innerHTML = `<div class="speclk-intro-icon">🤖</div><div class="speclk-intro-text">${introText}</div>`;
    wrap.appendChild(intro);

    // Fake terminal with the vibe prompt pre-filled
    const terminal = document.createElement('div');
    terminal.className = 'speclk-terminal';
    terminal.innerHTML = `
      <div class="speclk-term-header"><span class="speclk-term-dot" style="background:#e94560"></span><span class="speclk-term-dot" style="background:#f39c12"></span><span class="speclk-term-dot" style="background:#2ecc71"></span><span class="speclk-term-title">${this.cliName}</span></div>
      <div class="speclk-term-body">
        <div class="speclk-term-line"><span class="speclk-term-prompt">you@project:~$</span> <span class="speclk-term-cmd">kiro build</span></div>
        <div class="speclk-term-line speclk-term-response">🤖 What should I build?</div>
        <div class="speclk-term-input">
          <span class="speclk-term-prompt">you@project:~$</span>
          <span class="speclk-term-typed">${round.vibe}</span>
          <span class="speclk-term-cursor">▊</span>
        </div>
      </div>
    `;
    wrap.appendChild(terminal);

    const btn = document.createElement('button');
    btn.className = 'speclk-btn speclk-btn-send';
    btn.textContent = this._txt.send;
    btn.addEventListener('click', () => { this.phase = 'chaos'; this._render(); });
    wrap.appendChild(btn);
  }

  // Phase 1: Golem builds wrong things
  _renderChaos(wrap) {
    const round = this._round();

    const scene = document.createElement('div');
    scene.className = 'speclk-scene speclk-scene-chaos';
    scene.innerHTML = `
      <div class="speclk-golem">🤖</div>
      <div class="speclk-golem-says">Interpreting "${round.vibe}"...</div>
      <div class="speclk-chaos-output" id="speclk-chaos-out"></div>
    `;
    wrap.appendChild(scene);

    // Show all chaos items stacked with delays, then verdict + button
    const out = scene.querySelector('#speclk-chaos-out');
    const chaos = round.chaosOutputs || round.golemChaos || [];
    let idx = 0;
    const showNext = () => {
      if (idx < chaos.length) {
        const item = document.createElement('div');
        item.className = 'speclk-chaos-item speclk-pop';
        const tokens = 150 + Math.floor(Math.random() * 200);
        item.innerHTML = `${chaos[idx]} <span class="speclk-chaos-cost">~${tokens} tokens wasted</span>`;
        out.appendChild(item);
        idx++;
        this._chaosTimer = setTimeout(showNext, 1200);
      } else {
        // All shown — show verdict and button
        const verdict = document.createElement('div');
        verdict.className = 'speclk-verdict-text speclk-pop';
        verdict.innerHTML = `❌ None of these are what you wanted.<br><span style="color:#7a8ba8;font-size:0.75rem;">Vague prompt → wrong output. Every time.</span>`;
        wrap.appendChild(verdict);

        const fixBtn = document.createElement('button');
        fixBtn.className = 'speclk-btn speclk-pop';
        fixBtn.textContent = '📝 Let me write a proper spec instead';
        fixBtn.addEventListener('click', () => { this.phase = 'spec'; this._render(); });
        wrap.appendChild(fixBtn);
      }
    };
    this._chaosTimer = setTimeout(showNext, 600);
  }

  // Phase 2: Structured spec
  _renderSpec(wrap) {
    const round = this._round();

    const header = document.createElement('div');
    header.className = 'speclk-header';
    header.innerHTML = `<span class="speclk-golem-mini">🤖</span> <span>"That didn't work. Tell me <strong>exactly</strong> — who, what, and why." (${this.currentRound + 1}/${this.rounds.length})</span>`;
    wrap.appendChild(header);

    const split = document.createElement('div');
    split.className = 'speclk-split';

    // Scene preview
    const scene = document.createElement('div');
    scene.className = 'speclk-scene speclk-scene-build';
    const correctCount = this.selections.filter((s, i) => s !== null && round.spec[i].options[s] === round.spec[i].answer).length;
    if (correctCount === 0) {
      scene.innerHTML = `<div class="speclk-build-item speclk-dim">🤖 Waiting for spec...</div>`;
    } else {
      const items = round.correctScene.slice(0, correctCount).map(s => `<div class="speclk-build-item speclk-pop">✅ ${s}</div>`).join('');
      const remaining = round.correctScene.slice(correctCount).map(() => `<div class="speclk-build-item speclk-dim">⬜ ???</div>`).join('');
      scene.innerHTML = items + remaining;
    }
    split.appendChild(scene);

    // Spec form
    const form = document.createElement('div');
    form.className = 'speclk-form';
    round.spec.forEach((field, i) => {
      const isCorrect = this.selections[i] !== null && round.spec[i].options[this.selections[i]] === round.spec[i].answer;
      const row = document.createElement('div');
      row.className = 'speclk-field' + (isCorrect ? ' speclk-field-correct' : '');
      row.innerHTML = `<div class="speclk-field-label">${field.label}</div><div class="speclk-field-prompt">${field.prompt}</div>`;
      const select = document.createElement('select');
      select.className = 'speclk-select';
      const shuffled = [...field.options].sort(() => Math.random() - 0.5);
      select.innerHTML = `<option value="">— choose —</option>` + shuffled.map(o => {
        const oi = field.options.indexOf(o);
        return `<option value="${oi}" ${this.selections[i] === oi ? 'selected' : ''}>${o}</option>`;
      }).join('');
      select.addEventListener('change', e => { this.selections[i] = e.target.value === '' ? null : parseInt(e.target.value); this._render(); });
      row.appendChild(select);
      form.appendChild(row);
    });
    split.appendChild(form);
    wrap.appendChild(split);

    const status = document.createElement('div');
    status.className = 'speclk-status';
    status.id = 'speclk-status';
    wrap.appendChild(status);

    const btn = document.createElement('button');
    btn.className = 'speclk-btn';
    btn.textContent = '📜 Submit Spec';
    btn.addEventListener('click', () => this._test());
    wrap.appendChild(btn);
  }

  _test() {
    const round = this._round();
    const statusEl = document.getElementById('speclk-status');
    const allFilled = this.selections.every(s => s !== null);
    if (!allFilled) { statusEl.textContent = 'Fill all fields first.'; return; }

    const correct = round.spec.every((field, i) => field.options[this.selections[i]] === field.answer);
    if (correct) {
      // Show success state briefly before moving on
      statusEl.textContent = this._txt.builds;
      this.container.querySelectorAll('.speclk-field').forEach(el => el.classList.add('speclk-field-correct'));
      const summary = round.spec.map(f => f.answer).join(' → ');
      this.solved.push(summary);
      this.currentRound++;
      this.phase = 'vibe';
      this._chaosIdx = 0;
      this._resetSelections();
      setTimeout(() => this._render(), 2000);
    } else {
      const msg = this.falseOutputs[Math.floor(Math.random() * this.falseOutputs.length)];
      statusEl.textContent = '❌ ' + msg;
      this.container.querySelector('.speclk-form').classList.add('speclk-shake');
      setTimeout(() => this.container.querySelector('.speclk-form')?.classList.remove('speclk-shake'), 500);
      this.onWrong(msg);
    }
  }

  _injectStyles() {
    if (document.getElementById('speclk-css')) return;
    const s = document.createElement('style');
    s.id = 'speclk-css';
    s.textContent = `
.speclk{display:flex;flex-direction:column;gap:12px;padding:12px 0}
.speclk-progress{display:flex;gap:6px;justify-content:center}
.speclk-pip{width:10px;height:10px;border-radius:50%;background:var(--border,#1e2a45);transition:all .3s}
.speclk-pip-done{background:var(--green,#22c55e)}
.speclk-pip-active{background:var(--accent,#3b82f6);box-shadow:0 0 6px rgba(59,130,246,.5)}
.speclk-solved{display:flex;flex-direction:column;gap:4px}
.speclk-solved-item{font-size:12px;color:var(--green,#22c55e);padding:6px 10px;background:rgba(34,197,94,.05);border:1px solid rgba(34,197,94,.2);border-radius:6px}
.speclk-done{text-align:center;padding:24px;background:rgba(34,197,94,.05);border:2px solid var(--green,#22c55e);border-radius:12px}
.speclk-done-icon{font-size:2.5rem;margin-bottom:8px}
.speclk-done-text{font-size:14px;color:var(--green,#22c55e);font-weight:600}
.speclk-intro{text-align:center;padding:16px;background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);border-radius:10px}
.speclk-intro-icon{font-size:2rem;margin-bottom:6px}
.speclk-intro-text{font-size:13px;color:var(--muted,#7a8ba8)}
.speclk-terminal{background:#0d1117;border:1px solid #30363d;border-radius:8px;overflow:hidden;font-family:'Courier New',monospace;font-size:12px}
.speclk-term-header{display:flex;align-items:center;gap:6px;padding:8px 12px;background:#161b22;border-bottom:1px solid #30363d}
.speclk-term-dot{width:10px;height:10px;border-radius:50%}
.speclk-term-title{font-size:11px;color:#7a8ba8;margin-left:8px;font-family:'Segoe UI',sans-serif}
.speclk-term-body{padding:12px}
.speclk-term-line{margin-bottom:6px;color:#c9d1d9}
.speclk-term-prompt{color:#58a6ff}
.speclk-term-cmd{color:#e0e6f0}
.speclk-term-response{color:#7a8ba8;font-style:italic}
.speclk-term-input{display:flex;align-items:center;gap:0}
.speclk-term-typed{color:#f0883e;font-weight:bold}
.speclk-term-cursor{color:#58a6ff;animation:speclk-blink 1s infinite}
.speclk-scene{background:var(--surface,#141b2d);border:2px solid var(--border,#1e2a45);border-radius:10px;padding:16px;min-height:100px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px}
.speclk-scene-chaos{border-color:#e94560;background:linear-gradient(135deg,#1a0a0e,#141b2d)}
.speclk-scene-build{flex:1;min-width:130px;align-items:stretch}
.speclk-golem{font-size:2.5rem;animation:speclk-bob 1.5s infinite}
.speclk-golem-mini{font-size:1.2rem}
.speclk-golem-says{font-size:12px;color:var(--muted,#7a8ba8);text-align:center}
.speclk-chaos-output{min-height:36px;display:flex;flex-direction:column;align-items:center;gap:6px;margin-top:8px}
.speclk-chaos-item{font-size:13px;color:#e94560;font-weight:600;padding:6px 14px;background:rgba(233,69,96,.1);border:1px solid rgba(233,69,96,.3);border-radius:6px}
.speclk-chaos-cost{font-size:10px;color:#7a8ba8;font-weight:400;margin-left:6px;font-style:italic}
.speclk-chaos-verdict{min-height:30px;text-align:center}
.speclk-verdict-text{font-size:13px;color:#e94560;padding:8px;border-top:1px solid rgba(233,69,96,.2);margin-top:8px}
.speclk-build-item{font-size:12px;padding:5px 10px;border-radius:5px;margin-bottom:3px}
.speclk-build-item.speclk-dim{color:var(--border,#1e2a45)}
.speclk-header{font-size:13px;color:var(--text,#e0e6f0);display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--surface,#141b2d);border-radius:8px}
.speclk-split{display:flex;gap:12px;flex-wrap:wrap}
.speclk-form{flex:1;min-width:200px;display:flex;flex-direction:column;gap:8px}
.speclk-field{background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);border-radius:8px;padding:10px}
.speclk-field-correct{border-color:var(--green,#22c55e)!important}
.speclk-field-label{font-size:11px;font-weight:700;color:var(--accent,#3b82f6);text-transform:uppercase;letter-spacing:1px}
.speclk-field-prompt{font-size:13px;color:var(--muted,#7a8ba8);margin:4px 0 8px}
.speclk-select{width:100%;padding:8px;background:var(--bg,#0a0e17);border:2px solid var(--border,#1e2a45);border-radius:6px;color:var(--text,#e0e6f0);font-size:13px;font-family:inherit}
.speclk-select:focus{border-color:var(--accent,#3b82f6);outline:none}
.speclk-status{font-size:13px;color:var(--muted,#7a8ba8);text-align:center;min-height:18px}
.speclk-btn{padding:12px 24px;border:none;border-radius:8px;background:var(--accent,#3b82f6);color:#fff;font-size:14px;font-weight:600;cursor:pointer;align-self:center;transition:all .2s}
.speclk-btn:active{opacity:.7}
.speclk-btn-send{background:#f0883e}
.speclk-btn-stop{background:#e94560}
.speclk-shake{animation:speclk-sh .4s}
.speclk-pop{animation:speclk-pop .3s}
@keyframes speclk-sh{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
@keyframes speclk-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes speclk-pop{from{transform:scale(.8);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes speclk-blink{0%,50%{opacity:1}51%,100%{opacity:0}}
`;
    document.head.appendChild(s);
  }
}
