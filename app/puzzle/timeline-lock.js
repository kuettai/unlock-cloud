/**
 * Incident Timeline Lock Puzzle
 *
 * Drag events onto a timeline in chronological order.
 * Reuses sort mechanic but with a horizontal timeline visual.
 *
 * Usage:
 *   new TimelineLock(containerEl, {
 *     events: [
 *       { id: 'a', label: 'Alarm fired', time: '10:23' },
 *       { id: 'b', label: 'Runbook triggered', time: '10:25' },
 *       { id: 'c', label: 'Instance replaced', time: '10:31' },
 *       { id: 'd', label: 'All clear', time: '10:35' },
 *     ],
 *     answer: ['a','b','c','d'],
 *     onSubmit(correct) { ... }
 *   });
 */

class TimelineLock {
  constructor(container, opts = {}) {
    this.container = container;
    // Normalize events so the timestamp is separated from the visible label.
    // Timestamps are hidden by default (the player sorts by logic/causality);
    // an explicit "time" field wins, otherwise we peel a trailing "(HH:MM)".
    this.events = (opts.events || []).map(e => {
      if (e.time) return { id: e.id, label: e.label, time: String(e.time) };
      const m = /^(.*?)\s*\(([^)]*\d[^)]*)\)\s*$/.exec(e.label || '');
      if (m) return { id: e.id, label: m[1].trim(), time: m[2].trim() };
      return { id: e.id, label: e.label, time: null };
    });
    this.answer = opts.answer || [];
    this.onSubmit = opts.onSubmit || (() => {});
    this.showTimes = false; // revealed via the "Check timestamps" action
    this.order = this._shuffle(this.events.map(e => e.id));
    this._render();
  }

  _shuffle(arr) {
    let s; do { s = [...arr]; for (let i = s.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [s[i], s[j]] = [s[j], s[i]]; } } while (s.every((v, i) => v === arr[i]));
    return s;
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'tmlk';

    const title = document.createElement('div');
    title.className = 'tmlk-title';
    title.textContent = 'Arrange events in chronological order';
    wrap.appendChild(title);

    // Timeline
    this.listEl = document.createElement('div');
    this.listEl.className = 'tmlk-list';
    wrap.appendChild(this.listEl);

    // "Check timestamps" — a free hint that reveals the hidden times. Only
    // offered when the events actually carry timestamps.
    if (this.events.some(e => e.time)) {
      this.timesBtn = document.createElement('button');
      this.timesBtn.className = 'tmlk-times-btn';
      this.timesBtn.textContent = '🕐 Check timestamps';
      this.timesBtn.addEventListener('click', () => {
        this.showTimes = true;
        this.timesBtn.textContent = '🕐 Timestamps revealed';
        this.timesBtn.disabled = true;
        this._renderItems();
      });
      wrap.appendChild(this.timesBtn);
    }

    const btn = document.createElement('button');
    btn.className = 'tmlk-btn';
    btn.textContent = 'Confirm Timeline';
    btn.addEventListener('click', () => this._test());
    wrap.appendChild(btn);

    this.statusEl = document.createElement('div');
    this.statusEl.className = 'tmlk-status';
    wrap.appendChild(this.statusEl);

    this.container.appendChild(wrap);
    this._injectStyles();
    this._renderItems();
  }

  _renderItems() {
    this.listEl.innerHTML = '';
    this.selected = null;
    this.itemEls = [];
    this.order.forEach((id, i) => {
      const ev = this.events.find(e => e.id === id);
      const el = document.createElement('div');
      el.className = 'tmlk-item';
      const timeHtml = (this.showTimes && ev.time) ? `<span class="tmlk-time">${ev.time}</span>` : '';
      el.innerHTML = `<span class="tmlk-dot"></span><span class="tmlk-ev-label">${ev.label}</span>${timeHtml}`;
      el.addEventListener('click', () => this._tap(i));
      this.listEl.appendChild(el);
      this.itemEls.push(el);
    });
  }

  _tap(i) {
    if (this.selected === null) {
      this.selected = i;
      this.itemEls[i].classList.add('tmlk-selected');
    } else if (this.selected === i) {
      this.itemEls[i].classList.remove('tmlk-selected');
      this.selected = null;
    } else {
      [this.order[this.selected], this.order[i]] = [this.order[i], this.order[this.selected]];
      this.selected = null;
      this._renderItems();
    }
  }

  _test() {
    const correct = this.order.every((id, i) => id === this.answer[i]);
    if (correct) {
      this.statusEl.textContent = '✅ Timeline correct!';
      this.itemEls.forEach(el => el.classList.add('tmlk-done'));
      setTimeout(() => this.onSubmit(true), 400);
    } else {
      this.statusEl.textContent = '❌ Wrong order';
      this.listEl.classList.add('tmlk-shake');
      setTimeout(() => this.listEl.classList.remove('tmlk-shake'), 600);
    }
  }

  reset() { this.order = this._shuffle(this.events.map(e => e.id)); this._renderItems(); this.statusEl.textContent = ''; }

  _injectStyles() {
    if (document.getElementById('tmlk-css')) return;
    const s = document.createElement('style'); s.id = 'tmlk-css';
    s.textContent = `
.tmlk{display:flex;flex-direction:column;gap:12px;padding:16px 0;max-width:360px;margin:0 auto}
.tmlk-title{font-size:13px;color:var(--muted,#7a8ba8);font-weight:600;text-align:center}
.tmlk-list{display:flex;flex-direction:column;gap:0;position:relative;padding-left:20px;border-left:2px solid var(--border,#1e2a45);margin-left:10px}
.tmlk-item{display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--surface,#141b2d);border:2px solid var(--border,#1e2a45);border-radius:8px;margin-bottom:8px;cursor:pointer;transition:all .15s;user-select:none;position:relative}
.tmlk-item:active{transform:scale(.97)}
.tmlk-item.tmlk-selected{border-color:var(--accent,#3b82f6);box-shadow:0 0 10px rgba(59,130,246,.3)}
.tmlk-item.tmlk-done{border-color:var(--green,#22c55e)}
.tmlk-dot{width:12px;height:12px;border-radius:50%;background:var(--accent,#3b82f6);flex-shrink:0;position:absolute;left:-27px}
.tmlk-done .tmlk-dot{background:var(--green,#22c55e)}
.tmlk-ev-label{font-size:13px;color:var(--text,#e0e6f0);font-weight:600}
.tmlk-time{margin-left:auto;font-size:12px;color:var(--accent,#3b82f6);font-family:'Courier New',monospace;font-weight:700;white-space:nowrap}
.tmlk-times-btn{padding:8px 16px;border:1px dashed var(--border,#1e2a45);border-radius:8px;background:transparent;color:var(--muted,#7a8ba8);font-size:12px;font-weight:600;cursor:pointer;align-self:center}
.tmlk-times-btn:active{opacity:.7}
.tmlk-times-btn:disabled{opacity:.7;cursor:default;border-style:solid;color:var(--accent,#3b82f6)}
.tmlk-shake{animation:tmlk-sh .4s}
@keyframes tmlk-sh{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
.tmlk-btn{padding:12px 28px;border:none;border-radius:8px;background:var(--accent,#3b82f6);color:#fff;font-size:14px;font-weight:600;cursor:pointer;align-self:center}
.tmlk-btn:active{opacity:.7}
.tmlk-status{font-size:13px;color:var(--muted,#7a8ba8);text-align:center;min-height:18px}
`;
    document.head.appendChild(s);
  }
}
