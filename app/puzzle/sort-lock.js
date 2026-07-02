/**
 * Drag-Sort Lock Puzzle
 *
 * List of items the player reorders by dragging up/down.
 *
 * Usage:
 *   new SortLock(containerEl, {
 *     items: ['Step 3','Step 1','Step 2'],  // initial (scrambled) order
 *     answer: ['Step 1','Step 2','Step 3'], // correct order
 *     distractors: ['Decoy A'],             // optional decoys; mixed into items but ignored when validating
 *     onSubmit(correct) { ... }
 *   });
 *
 * Validation: items are filtered to remove any value present in `distractors`,
 * and the remaining sequence must match `answer` exactly. Distractors may sit
 * anywhere in the list without affecting correctness.
 */

class SortLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.answer = opts.answer || [];
    this.distractors = opts.distractors || [];
    const pool = [...this.answer, ...this.distractors];
    this.items = opts.items ? [...opts.items] : this._shuffle(pool);
    this.onSubmit = opts.onSubmit || (() => {});
    this._render();
  }

  _shuffle(arr) {
    let s;
    do {
      s = [...arr];
      for (let i = s.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [s[i], s[j]] = [s[j], s[i]];
      }
    } while (s.every((v, i) => v === arr[i]));
    return s;
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'srtlk';

    this.statusEl = document.createElement('div');
    this.statusEl.className = 'srtlk-status';
    this.statusEl.textContent = 'Drag items into the correct order';
    wrap.appendChild(this.statusEl);

    this.list = document.createElement('div');
    this.list.className = 'srtlk-list';
    wrap.appendChild(this.list);

    const btn = document.createElement('button');
    btn.className = 'srtlk-btn';
    btn.textContent = 'Confirm Order';
    btn.addEventListener('click', () => this._test());
    wrap.appendChild(btn);

    this.container.appendChild(wrap);
    this._injectStyles();
    this._renderItems();
  }

  _renderItems() {
    this.list.innerHTML = '';
    this.items.forEach((item, i) => {
      const row = document.createElement('div');
      row.className = 'srtlk-item';
      row.draggable = true;
      row.dataset.idx = i;
      row.dataset.value = item;

      const grip = document.createElement('span');
      grip.className = 'srtlk-grip';
      grip.textContent = '⠿';
      row.appendChild(grip);

      const lbl = document.createElement('span');
      lbl.textContent = item;
      row.appendChild(lbl);

      row.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', i);
        row.classList.add('srtlk-dragging');
      });
      row.addEventListener('dragend', () => row.classList.remove('srtlk-dragging'));
      row.addEventListener('dragover', (e) => { e.preventDefault(); row.classList.add('srtlk-over'); });
      row.addEventListener('dragleave', () => row.classList.remove('srtlk-over'));
      row.addEventListener('drop', (e) => {
        e.preventDefault();
        row.classList.remove('srtlk-over');
        const from = parseInt(e.dataTransfer.getData('text/plain'));
        const to = i;
        if (from !== to) {
          const [moved] = this.items.splice(from, 1);
          this.items.splice(to, 0, moved);
          this._renderItems();
        }
      });

      // Touch drag support
      let touchIdx = null;
      row.addEventListener('touchstart', (e) => {
        touchIdx = i;
        row.classList.add('srtlk-dragging');
      }, { passive: true });
      row.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        const target = el && el.closest('.srtlk-item');
        this.list.querySelectorAll('.srtlk-over').forEach(r => r.classList.remove('srtlk-over'));
        if (target) target.classList.add('srtlk-over');
      }, { passive: false });
      row.addEventListener('touchend', (e) => {
        row.classList.remove('srtlk-dragging');
        const touch = e.changedTouches[0];
        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        const target = el && el.closest('.srtlk-item');
        this.list.querySelectorAll('.srtlk-over').forEach(r => r.classList.remove('srtlk-over'));
        if (target && touchIdx !== null) {
          const to = parseInt(target.dataset.idx);
          if (touchIdx !== to) {
            const [moved] = this.items.splice(touchIdx, 1);
            this.items.splice(to, 0, moved);
            this._renderItems();
          }
        }
        touchIdx = null;
      });

      this.list.appendChild(row);
    });
  }

  _test() {
    const filtered = this.items.filter(v => !this.distractors.includes(v));
    const correct = filtered.length === this.answer.length
      && filtered.every((v, i) => v === this.answer[i]);
    if (correct) {
      this.statusEl.textContent = '✅ Correct order!';
      this.list.querySelectorAll('.srtlk-item').forEach(el => {
        if (!this.distractors.includes(el.dataset.value)) {
          el.classList.add('srtlk-done');
        }
      });
      setTimeout(() => this.onSubmit(true), 400);
    } else {
      this.statusEl.textContent = '❌ Wrong order — try again';
      this.list.classList.add('srtlk-shake');
      setTimeout(() => this.list.classList.remove('srtlk-shake'), 600);
    }
  }

  reset() {
    const pool = [...this.answer, ...this.distractors];
    this.items = this._shuffle(pool);
    this.statusEl.textContent = 'Drag items into the correct order';
    this._renderItems();
  }

  _injectStyles() {
    if (document.getElementById('srtlk-css')) return;
    const s = document.createElement('style');
    s.id = 'srtlk-css';
    s.textContent = `
.srtlk{display:flex;flex-direction:column;align-items:center;gap:14px;padding:16px 0}
.srtlk-status{font-size:14px;color:var(--muted,#7a8ba8);min-height:20px}
.srtlk-list{display:flex;flex-direction:column;gap:6px;width:100%;max-width:320px}
.srtlk-item{display:flex;align-items:center;gap:10px;padding:12px 14px;background:var(--surface,#141b2d);border:2px solid var(--border,#1e2a45);border-radius:8px;font-size:14px;font-weight:600;color:var(--muted,#7a8ba8);cursor:grab;user-select:none;-webkit-user-select:none;transition:all .15s}
.srtlk-item.srtlk-dragging{opacity:.4}
.srtlk-item.srtlk-over{border-color:var(--accent,#3b82f6);box-shadow:0 0 10px rgba(59,130,246,.2)}
.srtlk-item.srtlk-done{border-color:var(--green,#22c55e);color:var(--green,#22c55e)}
.srtlk-grip{color:var(--border,#1e2a45);font-size:16px}
.srtlk-shake{animation:srtlk-sh .4s}
@keyframes srtlk-sh{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
.srtlk-btn{padding:12px 28px;border:none;border-radius:8px;background:var(--accent,#3b82f6);color:#fff;font-size:14px;font-weight:600;cursor:pointer;letter-spacing:.5px;transition:opacity .2s}
.srtlk-btn:active{opacity:.7}
`;
    document.head.appendChild(s);
  }
}
