/**
 * Deduction Grid Lock Puzzle
 *
 * Logic grid elimination puzzle. Players receive clues and must
 * mark cells as YES/NO to deduce which item belongs to which category.
 * Inspired by Clue/Cryptid — forces cross-referencing multiple clues.
 *
 * Usage:
 *   new DeductionGridLock(containerEl, {
 *     categories: ['Person', 'Location', 'Time'],
 *     items: [
 *       ['Alice', 'Bob', 'Carol'],
 *       ['Lobby', 'Server Room', 'Rooftop'],
 *       ['9 AM', '12 PM', '6 PM'],
 *     ],
 *     solution: { Alice: ['Server Room', '12 PM'], Bob: ['Rooftop', '6 PM'], Carol: ['Lobby', '9 AM'] },
 *     clues: [
 *       'Alice was not in the Lobby.',
 *       'The person at 9 AM was in the Lobby.',
 *       'Bob was not there at 12 PM.',
 *     ],
 *     onSubmit(correct) { ... }
 *   });
 */

class DeductionGridLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.categories = opts.categories || [];
    this.items = opts.items || [];
    this.solution = opts.solution || {};
    this.clues = opts.clues || [];
    this.onSubmit = opts.onSubmit || (() => {});

    this.primaryItems = this.items[0];
    this.secondaryCategories = this.categories.slice(1);
    this.secondaryItems = this.items.slice(1);

    // Grid state: grid[catIdx][primaryIdx][secondaryIdx] = null | 'yes' | 'no'
    this.grid = this.secondaryCategories.map((_, ci) =>
      this.primaryItems.map(() => this.secondaryItems[ci].map(() => null))
    );

    this._render();
  }

  _cycle(catIdx, pIdx, sIdx) {
    const cur = this.grid[catIdx][pIdx][sIdx];
    if (cur === null) this.grid[catIdx][pIdx][sIdx] = 'yes';
    else if (cur === 'yes') this.grid[catIdx][pIdx][sIdx] = 'no';
    else this.grid[catIdx][pIdx][sIdx] = null;
    this._render();
  }

  _check() {
    for (let ci = 0; ci < this.secondaryCategories.length; ci++) {
      for (let pi = 0; pi < this.primaryItems.length; pi++) {
        const yesCount = this.grid[ci][pi].filter(v => v === 'yes').length;
        if (yesCount !== 1) return false;
        const yesIdx = this.grid[ci][pi].indexOf('yes');
        const expectedItem = this.solution[this.primaryItems[pi]];
        if (!expectedItem) return false;
        if (this.secondaryItems[ci][yesIdx] !== expectedItem[ci]) return false;
      }
    }
    return true;
  }

  _submit() {
    const correct = this._check();
    if (correct) {
      this.container.querySelector('.ddlk-result').textContent = 'Correct!';
      this.container.querySelector('.ddlk-result').style.color = 'var(--green,#22c55e)';
      setTimeout(() => this.onSubmit(true), 400);
    } else {
      this.container.querySelector('.ddlk-result').textContent = 'Not quite — check your grid.';
      this.container.querySelector('.ddlk-result').style.color = 'var(--red,#ef4444)';
    }
  }

  reset() {
    this.grid = this.secondaryCategories.map((_, ci) =>
      this.primaryItems.map(() => this.secondaryItems[ci].map(() => null))
    );
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'ddlk';

    // Clues
    const clueBox = document.createElement('div');
    clueBox.className = 'ddlk-clues';
    clueBox.innerHTML = '<div class="ddlk-clue-title">Clues</div>' +
      this.clues.map(c => `<div class="ddlk-clue">${c}</div>`).join('');
    wrap.appendChild(clueBox);

    // One grid per secondary category
    this.secondaryCategories.forEach((cat, ci) => {
      const section = document.createElement('div');
      section.className = 'ddlk-section';

      const label = document.createElement('div');
      label.className = 'ddlk-cat-label';
      label.textContent = `${this.categories[0]} → ${cat}`;
      section.appendChild(label);

      const table = document.createElement('div');
      table.className = 'ddlk-table';
      table.style.gridTemplateColumns = `80px repeat(${this.secondaryItems[ci].length}, 1fr)`;

      // Header row
      const corner = document.createElement('div');
      corner.className = 'ddlk-cell ddlk-header';
      table.appendChild(corner);
      this.secondaryItems[ci].forEach(s => {
        const h = document.createElement('div');
        h.className = 'ddlk-cell ddlk-header';
        h.textContent = s;
        table.appendChild(h);
      });

      // Data rows
      this.primaryItems.forEach((p, pi) => {
        const rowLabel = document.createElement('div');
        rowLabel.className = 'ddlk-cell ddlk-row-label';
        rowLabel.textContent = p;
        table.appendChild(rowLabel);

        this.secondaryItems[ci].forEach((_, si) => {
          const cell = document.createElement('div');
          cell.className = 'ddlk-cell ddlk-data';
          const val = this.grid[ci][pi][si];
          if (val === 'yes') { cell.textContent = 'O'; cell.classList.add('ddlk-yes'); }
          else if (val === 'no') { cell.textContent = 'X'; cell.classList.add('ddlk-no'); }
          cell.addEventListener('click', () => this._cycle(ci, pi, si));
          table.appendChild(cell);
        });
      });

      section.appendChild(table);
      wrap.appendChild(section);
    });

    // Submit
    const bar = document.createElement('div');
    bar.className = 'ddlk-bar';
    const btn = document.createElement('button');
    btn.className = 'ddlk-btn';
    btn.textContent = 'Submit Deduction';
    btn.addEventListener('click', () => this._submit());
    bar.appendChild(btn);
    const result = document.createElement('div');
    result.className = 'ddlk-result';
    bar.appendChild(result);
    wrap.appendChild(bar);

    this.container.appendChild(wrap);
    this._injectStyles();
  }

  _injectStyles() {
    if (document.getElementById('ddlk-css')) return;
    const s = document.createElement('style'); s.id = 'ddlk-css';
    s.textContent = `
.ddlk{display:flex;flex-direction:column;gap:14px;padding:16px 0;max-width:420px;margin:0 auto}
.ddlk-clues{background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);border-radius:8px;padding:12px}
.ddlk-clue-title{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--muted,#7a8ba8);margin-bottom:8px}
.ddlk-clue{font-size:13px;color:var(--text,#e0e6f0);padding:4px 0;border-bottom:1px solid var(--border,#1e2a45)}
.ddlk-clue:last-child{border:none}
.ddlk-section{margin-top:4px}
.ddlk-cat-label{font-size:11px;font-weight:700;color:var(--accent,#3b82f6);margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px}
.ddlk-table{display:grid;gap:2px}
.ddlk-cell{display:flex;align-items:center;justify-content:center;padding:6px 4px;font-size:11px;border-radius:4px;min-height:32px;text-align:center}
.ddlk-header{background:var(--surface,#141b2d);color:var(--muted,#7a8ba8);font-weight:600;font-size:10px;word-break:break-word}
.ddlk-row-label{background:var(--surface,#141b2d);color:var(--text,#e0e6f0);font-weight:600;font-size:11px;justify-content:flex-start;padding-left:8px}
.ddlk-data{background:var(--bg,#0a0e17);border:1px solid var(--border,#1e2a45);cursor:pointer;font-weight:700;font-size:14px;transition:all .1s}
.ddlk-data:active{transform:scale(.9)}
.ddlk-yes{color:var(--green,#22c55e);background:rgba(34,197,94,.1);border-color:var(--green,#22c55e)}
.ddlk-no{color:var(--red,#ef4444);background:rgba(239,68,68,.05);border-color:rgba(239,68,68,.3)}
.ddlk-bar{display:flex;flex-direction:column;align-items:center;gap:8px;margin-top:8px}
.ddlk-btn{padding:10px 24px;background:var(--accent,#3b82f6);color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer}
.ddlk-btn:active{opacity:.7}
.ddlk-result{font-size:12px;font-weight:600;min-height:18px}
`;
    document.head.appendChild(s);
  }
}
