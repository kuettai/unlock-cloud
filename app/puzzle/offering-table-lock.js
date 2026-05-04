/**
 * Offering Table Lock Puzzle
 *
 * Items from the crowd displayed. Player taps items to place on the table.
 * Correct items (loaves/fish) stay. Wrong items bounce back with flavor text.
 * Must collect all correct items to solve.
 *
 * Usage:
 *   new OfferingTableLock(containerEl, {
 *     items: [
 *       { id: 'loaf1', icon: '🍞', label: 'Barley loaf', correct: true },
 *       { id: 'coins', icon: '💰', label: 'Bag of coins', correct: false, response: 'Money won\'t solve this.' },
 *     ],
 *     onSubmit({ collected }) {},
 *     onWrong(msg) {},
 *   });
 */

class OfferingTableLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.items = (opts.items || []).map((item, i) => ({ ...item, idx: i, placed: false }));
    this.onSubmit = opts.onSubmit || (() => {});
    this.onWrong = opts.onWrong || (() => {});
    this.collected = 0;
    this.target = this.items.filter(i => i.correct).length;
    this.solved = false;
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'otlk';

    this.statusEl = document.createElement('div');
    this.statusEl.className = 'otlk-status';
    this.statusEl.textContent = 'Search the crowd — tap items to place on the table';
    wrap.appendChild(this.statusEl);

    // Table area
    this.tableEl = document.createElement('div');
    this.tableEl.className = 'otlk-table';
    this.tableEl.innerHTML = '<div class="otlk-table-label">The Table</div>';
    this.tableSlots = document.createElement('div');
    this.tableSlots.className = 'otlk-slots';
    this.tableEl.appendChild(this.tableSlots);
    wrap.appendChild(this.tableEl);

    // Counter
    this.counterEl = document.createElement('div');
    this.counterEl.className = 'otlk-counter';
    wrap.appendChild(this.counterEl);

    // Items grid (shuffled)
    const shuffled = [...this.items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const grid = document.createElement('div');
    grid.className = 'otlk-grid';
    this.itemEls = [];
    shuffled.forEach(item => {
      const el = document.createElement('div');
      el.className = 'otlk-item';
      el.innerHTML = `<span class="otlk-icon">${item.icon}</span><span class="otlk-name">${item.label}</span>`;
      el.addEventListener('click', () => this._tap(item.idx));
      grid.appendChild(el);
      this.itemEls[item.idx] = el;
    });
    wrap.appendChild(grid);

    // Response area
    this.responseEl = document.createElement('div');
    this.responseEl.className = 'otlk-response';
    wrap.appendChild(this.responseEl);

    this.container.appendChild(wrap);
    this._injectStyles();
    this._updateCounter();
  }

  _tap(idx) {
    if (this.solved) return;
    const item = this.items[idx];
    if (item.placed) return;
    const el = this.itemEls[idx];

    if (item.correct) {
      item.placed = true;
      this.collected++;
      el.classList.add('otlk-placed');
      // Add to table
      const slot = document.createElement('span');
      slot.className = 'otlk-slot-item';
      slot.textContent = item.icon;
      this.tableSlots.appendChild(slot);
      this.responseEl.textContent = `✓ ${item.label} placed on the table`;
      this.responseEl.style.color = 'var(--green,#22c55e)';
      this._updateCounter();

      if (this.collected === this.target) {
        this.solved = true;
        this.statusEl.textContent = `✅ Five loaves and two fish — all that was found!`;
        this.responseEl.textContent = '"What are these among so many?"';
        this.responseEl.style.color = 'var(--yellow,#eab308)';
        setTimeout(() => this.onSubmit({ collected: this.collected }), 1000);
      }
    } else {
      el.classList.add('otlk-wrong');
      this.responseEl.textContent = item.response || "That won't help here.";
      this.responseEl.style.color = 'var(--red,#ef4444)';
      this.onWrong(item.response);
      setTimeout(() => el.classList.remove('otlk-wrong'), 600);
    }
  }

  _updateCounter() {
    this.counterEl.textContent = `On the table: ${this.collected}/${this.target}`;
  }

  _injectStyles() {
    if (document.getElementById('otlk-css')) return;
    const s = document.createElement('style');
    s.id = 'otlk-css';
    s.textContent = `
.otlk{display:flex;flex-direction:column;align-items:center;gap:12px;padding:16px 0}
.otlk-status{font-size:14px;color:var(--muted,#7a8ba8);min-height:20px;text-align:center}
.otlk-table{background:var(--surface,#141b2d);border:2px solid var(--border,#1e2a45);border-radius:12px;padding:12px 16px;width:min(300px,90vw);text-align:center}
.otlk-table-label{font-size:11px;color:var(--muted,#7a8ba8);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
.otlk-slots{display:flex;gap:8px;justify-content:center;min-height:40px;flex-wrap:wrap}
.otlk-slot-item{font-size:28px;animation:otlk-pop .3s ease-out}
@keyframes otlk-pop{0%{transform:scale(0)}50%{transform:scale(1.3)}100%{transform:scale(1)}}
.otlk-counter{font-size:13px;color:var(--muted,#7a8ba8)}
.otlk-grid{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;width:min(340px,95vw)}
.otlk-item{display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--bg,#0a0e17);border:1.5px solid var(--border,#1e2a45);border-radius:8px;cursor:pointer;transition:all .15s;user-select:none;-webkit-user-select:none}
.otlk-item:active{transform:scale(.96)}
.otlk-placed{border-color:var(--green,#22c55e);opacity:.3;pointer-events:none}
.otlk-wrong{border-color:var(--red,#ef4444);animation:otlk-shake .3s}
@keyframes otlk-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
.otlk-icon{font-size:22px}
.otlk-name{font-size:13px;color:var(--text,#e0e6f0)}
.otlk-response{font-size:13px;min-height:20px;text-align:center;font-style:italic}
`;
    document.head.appendChild(s);
  }
}
