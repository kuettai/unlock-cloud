/**
 * Context Lock Puzzle — "Debug the Golem's Mind"
 *
 * The golem starts with ALL documents loaded (over budget, confused).
 * It outputs a live "build stream" showing what it's doing — full of
 * contradictions and errors caused by poisoned/conflicting docs.
 *
 * Player must REMOVE bad docs to fix the output. Each removal changes
 * the live stream. When only correct docs remain and budget is met,
 * the output stabilizes and the golem succeeds.
 *
 * Like tuning a radio — remove static until the signal is clear.
 */

class ContextLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.capacity = opts.capacity || 2000;
    this.documents = opts.documents || [];
    this.onSubmit = opts.onSubmit || (() => {});
    this.onWrong = opts.onWrong || (() => {});
    // Themeable agent label — defaults to the original "golem" theme so existing
    // episodes are unaffected; ep8 (Macet) overrides it via config.
    this.agentName = opts.agentName || 'golem';
    // Optional framing line shown above the puzzle before the player interacts.
    // Backward compatible: no intro provided → nothing rendered.
    this.intro = opts.intro || null;
    // Configurable shelf label
    this.shelfLabel = opts.shelfLabel || null;
    // Start with everything loaded
    this.loaded = new Set(this.documents.map(d => d.id));
    this._streamInterval = null;
    this._streamLines = [];
    this._render();
  }

  _getUsed() {
    let t = 0;
    this.loaded.forEach(id => { const d = this.documents.find(x => x.id === id); if (d) t += d.tokens; });
    return t;
  }

  _getProblems() {
    const problems = [];
    const used = this._getUsed();
    if (used > this.capacity) problems.push({ type: 'overload', msg: '⚠️ MEMORY OVERFLOW — context exceeds capacity' });
    this.documents.forEach(d => {
      if (this.loaded.has(d.id) && d.status === 'poison') {
        problems.push({ type: 'poison', id: d.id, msg: d.poisonLine });
      }
    });
    const required = this.documents.filter(d => d.status === 'required');
    required.forEach(d => {
      if (!this.loaded.has(d.id)) problems.push({ type: 'missing', id: d.id, msg: d.missingLine });
    });
    return problems;
  }

  _isClean() {
    const used = this._getUsed();
    if (used > this.capacity) return false;
    const hasPoison = this.documents.some(d => this.loaded.has(d.id) && d.status === 'poison');
    if (hasPoison) return false;
    const required = this.documents.filter(d => d.status === 'required');
    const allReq = required.every(d => this.loaded.has(d.id));
    return allReq;
  }

  _generateStreamLine() {
    const problems = this._getProblems();
    if (problems.length === 0) {
      const good = ['Building user profile component...', 'Creating REST API routes...', 'Setting up DynamoDB tables...', 'Configuring Lambda handlers...', 'Generating React components...', 'Writing unit tests...'];
      return { text: '✅ ' + good[Math.floor(Math.random() * good.length)], type: 'good' };
    }
    // Pick a random problem to surface
    const p = problems[Math.floor(Math.random() * problems.length)];
    if (p.type === 'overload') return { text: '🤯 ' + p.msg, type: 'error' };
    if (p.type === 'poison') return { text: '❌ ' + p.msg, type: 'error' };
    if (p.type === 'missing') return { text: '❓ ' + p.msg, type: 'warn' };
    return { text: '...', type: 'neutral' };
  }

  _render() {
    this.container.innerHTML = '';
    if (this._streamInterval) { clearInterval(this._streamInterval); this._streamInterval = null; }

    const wrap = document.createElement('div');
    wrap.className = 'ctxlk';

    // Optional framing intro — explains the task before the player interacts.
    if (this.intro) {
      const intro = document.createElement('div');
      intro.className = 'ctxlk-intro';
      intro.textContent = this.intro;
      wrap.appendChild(intro);
    }

    const isClean = this._isClean();
    const used = this._getUsed();
    const pct = Math.min(110, (used / this.capacity) * 100);

    // Golem + stream output
    const monitor = document.createElement('div');
    monitor.className = 'ctxlk-monitor' + (isClean ? ' ctxlk-monitor-clean' : '');
    monitor.innerHTML = `
      <div class="ctxlk-mon-header">
        <span class="ctxlk-mon-dot ${isClean ? 'ctxlk-dot-green' : 'ctxlk-dot-red'}"></span>
        <span class="ctxlk-mon-title">${this.agentName} build output</span>
        <span class="ctxlk-mon-status">${isClean ? 'STABLE' : 'UNSTABLE'}</span>
      </div>
      <div class="ctxlk-stream" id="ctxlk-stream"></div>
    `;
    wrap.appendChild(monitor);

    // Capacity gauge
    const gaugeState = pct > 100 ? 'over' : pct > 80 ? 'warn' : 'ok';
    const gauge = document.createElement('div');
    gauge.className = 'ctxlk-gauge';
    gauge.innerHTML = `
      <div class="ctxlk-gauge-bar"><div class="ctxlk-gauge-fill ctxlk-gauge-${gaugeState}" style="width:${Math.min(100, pct)}%"></div></div>
      <div class="ctxlk-gauge-label">${used} / ${this.capacity} tokens ${pct > 100 ? '⚠️ OVER' : ''}</div>
    `;
    wrap.appendChild(gauge);

    // Document list — tap to remove/re-add
    const shelf = document.createElement('div');
    shelf.className = 'ctxlk-shelf';
    shelf.innerHTML = `<div class="ctxlk-shelf-label">${this.shelfLabel || 'Loaded documents — tap to remove incorrect ones'}</div>`;
    this.documents.forEach(doc => {
      const isLoaded = this.loaded.has(doc.id);
      const card = document.createElement('button');
      card.className = 'ctxlk-doc' + (isLoaded ? ' ctxlk-doc-loaded' : ' ctxlk-doc-removed');
      card.innerHTML = `
        <div class="ctxlk-doc-icon">${doc.icon || '📄'}</div>
        <div class="ctxlk-doc-info">
          <div class="ctxlk-doc-name">${doc.label}</div>
          ${doc.desc ? `<div class="ctxlk-doc-desc">${doc.desc}</div>` : ''}
        </div>
        <div class="ctxlk-doc-cost">~${doc.tokens}</div>
        <div class="ctxlk-doc-toggle">${isLoaded ? '🔵' : '⭕'}</div>
      `;
      card.addEventListener('click', () => { this._toggle(doc.id); });
      shelf.appendChild(card);
    });
    wrap.appendChild(shelf);

    // Lock in button
    if (isClean) {
      const btn = document.createElement('button');
      btn.className = 'ctxlk-btn ctxlk-btn-go';
      btn.textContent = '✅ Output stable — lock in context';
      btn.addEventListener('click', () => this._submit());
      wrap.appendChild(btn);
    }

    this.container.appendChild(wrap);
    this._injectStyles();
    this._startStream();
  }

  _startStream() {
    const streamEl = document.getElementById('ctxlk-stream');
    if (!streamEl) return;
    // Seed initial lines
    this._streamLines = [];
    for (let i = 0; i < 4; i++) this._streamLines.push(this._generateStreamLine());
    this._renderStream(streamEl);

    this._streamInterval = setInterval(() => {
      this._streamLines.push(this._generateStreamLine());
      if (this._streamLines.length > 5) this._streamLines.shift();
      this._renderStream(streamEl);
    }, 1500);
  }

  _renderStream(el) {
    el.innerHTML = this._streamLines.map(l =>
      `<div class="ctxlk-line ctxlk-line-${l.type}">${l.text}</div>`
    ).join('');
    el.scrollTop = el.scrollHeight;
  }

  _toggle(id) {
    if (this.loaded.has(id)) this.loaded.delete(id);
    else this.loaded.add(id);
    this._render();
  }

  _submit() {
    if (this._streamInterval) clearInterval(this._streamInterval);
    this.onSubmit();
  }

  _injectStyles() {
    if (document.getElementById('ctxlk-css')) return;
    const s = document.createElement('style');
    s.id = 'ctxlk-css';
    s.textContent = `
.ctxlk{display:flex;flex-direction:column;gap:12px;padding:12px 0}
.ctxlk-intro{font-size:12px;line-height:1.5;color:var(--text,#e0e6f0);background:rgba(59,130,246,.08);border:1px solid var(--accent,#3b82f6);border-radius:8px;padding:10px 12px}
.ctxlk-monitor{background:#0d1117;border:2px solid #e94560;border-radius:10px;overflow:hidden;transition:border-color .5s}
.ctxlk-monitor-clean{border-color:var(--green,#22c55e)}
.ctxlk-mon-header{display:flex;align-items:center;gap:8px;padding:8px 12px;background:#161b22;border-bottom:1px solid #30363d}
.ctxlk-mon-dot{width:8px;height:8px;border-radius:50%;animation:ctxlk-blink 1s infinite}
.ctxlk-dot-red{background:#e94560}
.ctxlk-dot-green{background:#22c55e;animation:none}
.ctxlk-mon-title{font-size:11px;color:#7a8ba8;font-family:'Courier New',monospace;flex:1}
.ctxlk-mon-status{font-size:10px;font-weight:700;letter-spacing:1px;color:#e94560}
.ctxlk-monitor-clean .ctxlk-mon-status{color:#22c55e}
.ctxlk-stream{padding:10px 12px;height:120px;overflow-y:auto;font-family:'Courier New',monospace;font-size:11px;display:flex;flex-direction:column;gap:3px}
.ctxlk-line{padding:2px 0;animation:ctxlk-fadein .3s}
.ctxlk-line-good{color:#22c55e}
.ctxlk-line-error{color:#e94560}
.ctxlk-line-warn{color:#eab308}
.ctxlk-line-neutral{color:#7a8ba8}
.ctxlk-gauge{display:flex;flex-direction:column;gap:3px}
.ctxlk-gauge-bar{height:8px;background:#141b2d;border:1px solid #1e2a45;border-radius:4px;overflow:hidden}
.ctxlk-gauge-fill{height:100%;border-radius:4px;transition:width .3s}
.ctxlk-gauge-ok{background:#3b82f6}
.ctxlk-gauge-warn{background:#eab308}
.ctxlk-gauge-over{background:#e94560}
.ctxlk-gauge-label{font-size:11px;color:var(--muted,#7a8ba8);text-align:right}
.ctxlk-shelf{display:flex;flex-direction:column;gap:5px}
.ctxlk-shelf-label{font-size:11px;color:var(--muted,#7a8ba8);margin-bottom:2px}
.ctxlk-doc{display:flex;align-items:center;gap:10px;padding:14px 14px;background:var(--surface,#141b2d);border:2px solid var(--border,#1e2a45);border-radius:8px;cursor:pointer;transition:all .15s;text-align:left;width:100%;font-family:inherit;color:inherit;font-size:inherit}
.ctxlk-doc:active{transform:scale(.98)}
.ctxlk-doc-loaded{border-color:var(--accent,#3b82f6);background:rgba(59,130,246,.04)}
.ctxlk-doc-removed{opacity:.45;border-style:dashed}
.ctxlk-doc-icon{font-size:1.1rem;width:24px;text-align:center}
.ctxlk-doc-info{flex:1}
.ctxlk-doc-name{font-size:13px;font-weight:600;color:var(--text,#e0e6f0);line-height:1.4}
.ctxlk-doc-desc{font-size:10px;color:var(--muted,#7a8ba8);margin-top:1px}
.ctxlk-doc-cost{font-size:10px;color:var(--muted,#7a8ba8)}
.ctxlk-doc-toggle{font-size:12px;width:18px;text-align:center}
.ctxlk-btn{padding:12px 24px;border:none;border-radius:8px;background:var(--accent,#3b82f6);color:#fff;font-size:14px;font-weight:600;cursor:pointer;align-self:center;transition:all .2s}
.ctxlk-btn:active{opacity:.7}
.ctxlk-btn-go{background:var(--green,#22c55e)}
@keyframes ctxlk-blink{0%,50%{opacity:1}51%,100%{opacity:.3}}
@keyframes ctxlk-fadein{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
`;
    document.head.appendChild(s);
  }
}
