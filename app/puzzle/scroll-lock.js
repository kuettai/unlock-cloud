/**
 * Scroll Lock — Royal Decree / Natural Language Policy Editor
 *
 * A parchment-styled decree with clause blanks. Player picks the right
 * phrase for each blank from scrollable options. Choices can constrain
 * other blanks via `constraints`.
 *
 * Usage:
 *   new ScrollLock(el, {
 *     title: "The King's Seal",
 *     clauses: [
 *       { text: 'The bearer may ___ performers.', blank: { options: ['book','dismiss'], answer: 'book' } }
 *     ],
 *     constraints: [{ if: { clause: 0, value: 'dismiss' }, then: { clause: 1, disable: ['50'] } }],
 *     falseOutputs: ['The seal crumbles!'],
 *     onSubmit() {}, onWrong(msg) {}
 *   });
 */
class ScrollLock {
  constructor(container, opts = {}) {
    this.container = container;
    const rawTitle = opts.title || 'Royal Decree';
    // If title starts with an emoji (non-ASCII char), use it as icon
    const emojiMatch = rawTitle.match(/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})\s*/u);
    if (emojiMatch) {
      this.icon = emojiMatch[1];
      this.title = rawTitle.slice(emojiMatch[0].length);
    } else {
      this.icon = opts.icon || '👑';
      this.title = rawTitle;
    }
    this.clauses = opts.clauses || [];
    this.constraints = opts.constraints || [];
    this.falseOutputs = opts.falseOutputs || [];
    this.onSubmit = opts.onSubmit || (() => {});
    this.onWrong = opts.onWrong || (() => {});
    this.selections = this.clauses.map(() => null);
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const w = document.createElement('div');
    w.className = 'scrlk';

    // Parchment
    const parch = document.createElement('div');
    parch.className = 'scrlk-parchment';

    const ttl = document.createElement('div');
    ttl.className = 'scrlk-title';
    ttl.textContent = this.title;
    parch.appendChild(ttl);

    const seal = document.createElement('div');
    seal.className = 'scrlk-seal';
    seal.textContent = this.icon;
    parch.appendChild(seal);

    this.clauseEls = [];
    this.clauses.forEach((c, i) => {
      const row = document.createElement('div');
      row.className = 'scrlk-clause';

      const parts = c.text.split('___');
      parts.forEach((part, pi) => {
        const span = document.createElement('span');
        span.textContent = part;
        row.appendChild(span);
        if (pi < parts.length - 1) {
          const sel = document.createElement('select');
          sel.className = 'scrlk-select';
          sel.dataset.clause = i;
          const placeholder = document.createElement('option');
          placeholder.value = '';
          placeholder.textContent = '— choose —';
          placeholder.disabled = true;
          placeholder.selected = true;
          sel.appendChild(placeholder);
          c.blank.options.forEach(o => {
            const opt = document.createElement('option');
            opt.value = o;
            opt.textContent = o;
            sel.appendChild(opt);
          });
          sel.addEventListener('change', () => {
            this.selections[i] = sel.value;
            this._applyConstraints();
          });
          row.appendChild(sel);
          this.clauseEls.push({ idx: i, el: sel, opts: c.blank.options });
        }
      });
      parch.appendChild(row);
    });

    w.appendChild(parch);

    const btn = document.createElement('button');
    btn.className = 'scrlk-btn';
    btn.textContent = '🔏 Apply the Seal';
    btn.addEventListener('click', () => this._test());
    w.appendChild(btn);

    this.statusEl = document.createElement('div');
    this.statusEl.className = 'scrlk-status';
    w.appendChild(this.statusEl);

    this.container.appendChild(w);
    this._injectStyles();
  }

  _applyConstraints() {
    // Reset all options to enabled
    this.clauseEls.forEach(ce => {
      Array.from(ce.el.options).forEach(o => { o.disabled = o.value === ''; });
    });
    // Apply constraints
    this.constraints.forEach(con => {
      if (this.selections[con.if.clause] === con.if.value) {
        const target = this.clauseEls.find(ce => ce.idx === con.then.clause);
        if (!target) return;
        (con.then.disable || []).forEach(val => {
          const opt = Array.from(target.el.options).find(o => o.value === val);
          if (opt) {
            opt.disabled = true;
            if (this.selections[con.then.clause] === val) {
              this.selections[con.then.clause] = null;
              target.el.value = '';
            }
          }
        });
      }
    });
  }

  _test() {
    let allCorrect = true;
    this.clauses.forEach((c, i) => {
      const ce = this.clauseEls.find(x => x.idx === i);
      if (!ce) return;
      const correct = this.selections[i] === c.blank.answer;
      ce.el.classList.toggle('scrlk-correct', correct);
      ce.el.classList.remove('scrlk-wrong');
      if (!correct) {
        allCorrect = false;
        ce.el.classList.add('scrlk-wrong');
        setTimeout(() => ce.el.classList.remove('scrlk-wrong'), 700);
      }
    });
    if (allCorrect) {
      this.statusEl.textContent = '✅ The decree is sealed!';
      setTimeout(() => this.onSubmit(true), 400);
    } else {
      const msg = this.falseOutputs.length ? this.falseOutputs[Math.floor(Math.random() * this.falseOutputs.length)] : '❌ The decree is flawed — review your choices';
      this.statusEl.textContent = msg;
      this.onWrong(msg);
    }
  }

  reset() { this.selections = this.clauses.map(() => null); this.clauseEls.forEach(ce => { ce.el.value = ''; ce.el.classList.remove('scrlk-correct', 'scrlk-wrong'); }); this.statusEl.textContent = ''; }

  _injectStyles() {
    if (document.getElementById('scrlk-css')) return;
    const s = document.createElement('style'); s.id = 'scrlk-css';
    s.textContent = `
.scrlk{display:flex;flex-direction:column;align-items:center;gap:14px;padding:16px 0;max-width:380px;margin:0 auto}
.scrlk-parchment{position:relative;width:100%;padding:28px 22px 22px;background:linear-gradient(135deg,#2a1f0e,#1a1408,#2a1f0e);border:2px solid #5c4a2a;border-radius:6px;box-shadow:inset 0 0 30px rgba(0,0,0,.4),0 4px 16px rgba(0,0,0,.3)}
.scrlk-title{text-align:center;font-size:17px;font-weight:700;color:#d4a853;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;font-family:Georgia,serif}
.scrlk-seal{position:absolute;top:10px;right:14px;font-size:22px;opacity:.7}
.scrlk-clause{font-size:14px;color:#c4a66a;line-height:2.2;margin-bottom:6px;font-family:Georgia,serif}
.scrlk-select{appearance:none;-webkit-appearance:none;background:#1a1408;border:1px solid #5c4a2a;border-bottom:2px solid #d4a853;color:#d4a853;font-size:13px;font-weight:700;font-family:Georgia,serif;padding:3px 22px 3px 8px;border-radius:3px;cursor:pointer;transition:all .2s;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23d4a853'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 6px center}
.scrlk-select:focus{outline:none;border-color:#d4a853;box-shadow:0 0 6px rgba(212,168,83,.3)}
.scrlk-select.scrlk-correct{border-color:#22c55e;color:#22c55e;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2322c55e'/%3E%3C/svg%3E")}
.scrlk-select.scrlk-wrong{animation:scrlk-sh .4s;border-color:#ef4444;color:#ef4444}
@keyframes scrlk-sh{25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
.scrlk-select option{background:#1a1408;color:#c4a66a}
.scrlk-select option:disabled{color:#5c4a2a}
.scrlk-btn{padding:12px 28px;border:none;border-radius:8px;background:#8b6914;color:#fff;font-size:14px;font-weight:600;cursor:pointer;font-family:Georgia,serif;letter-spacing:1px}
.scrlk-btn:hover{background:#a07a1a}
.scrlk-btn:active{opacity:.7}
.scrlk-status{font-size:13px;color:var(--muted,#7a8ba8);text-align:center;min-height:18px}
`;
    document.head.appendChild(s);
  }
}
