/**
 * Craft Lock Puzzle
 *
 * Given raw materials and a set of combination RULES (not fixed recipes),
 * the player must discover which combinations produce useful outputs.
 * Combine two items to produce a result. Reach the required output to unlock.
 *
 * Rules are pattern-based: e.g., "any metal + fire = molten metal",
 * "any liquid + container = filled container".
 *
 * Inspired by Little Alchemy / Noita wand crafting / Doodle God.
 *
 * Usage:
 *   new CraftLock(containerEl, {
 *     materials: [
 *       { id: 'iron', label: '🪨 Iron Ore', tags: ['metal','raw'] },
 *       { id: 'fire', label: '🔥 Furnace', tags: ['heat'], permanent: true },
 *       { id: 'water', label: '💧 Water', tags: ['liquid'] },
 *       { id: 'mold', label: '🧱 Mold', tags: ['container'], permanent: true },
 *     ],
 *     rules: [
 *       { inputs: ['metal', 'heat'], output: { id: 'molten', label: '�ite Molten Metal', tags: ['liquid','metal'] } },
 *       { inputs: ['liquid', 'container'], output: { id: 'cast', label: '⚙️ Cast Part', tags: ['part'] } },
 *       { inputs: ['part', 'part'], output: { id: 'key', label: '🔑 Key', tags: ['final'] } },
 *     ],
 *     goal: 'key',  // id of the item to produce
 *     onSubmit(correct) { ... }
 *   });
 */

class CraftLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.materials = (opts.materials || []).map(m => ({ ...m }));
    this.rules = opts.rules || [];
    this.goal = opts.goal || '';
    this.onSubmit = opts.onSubmit || (() => {});

    this._init();
  }

  _init() {
    this.inventory = this.materials.map(m => ({ ...m, crafted: false }));
    this.selected = [];
    this.won = false;
    this.message = null;
    this.history = [];
    this._render();
  }

  _select(idx) {
    if (this.won) return;
    if (this.selected.includes(idx)) {
      this.selected = this.selected.filter(i => i !== idx);
    } else {
      if (this.selected.length >= 2) return;
      this.selected.push(idx);
    }

    if (this.selected.length === 2) {
      setTimeout(() => this._combine(), 300);
    }

    this._render();
  }

  _combine() {
    const [a, b] = this.selected.map(i => this.inventory[i]);
    const result = this._findMatch(a, b);

    if (result) {
      // Check if we already have this item
      const existing = this.inventory.find(i => i.id === result.id);
      if (existing) {
        this.message = { text: `Already have ${result.label}`, type: 'warn' };
      } else {
        // Add result to inventory
        const newItem = { ...result, crafted: true };
        this.inventory.push(newItem);
        this.history.push({ a: a.label, b: b.label, out: result.label });
        this.message = { text: `Crafted: ${result.label}`, type: 'good' };

        // Consume non-permanent inputs
        if (!a.permanent) this.inventory[this.selected[0]]._consumed = true;
        if (!b.permanent) this.inventory[this.selected[1]]._consumed = true;
        this.inventory = this.inventory.filter(i => !i._consumed);

        // Check win
        if (result.id === this.goal) {
          this.won = true;
          this.message = { text: `${result.label} crafted! Puzzle unlocked.`, type: 'win' };
          setTimeout(() => this.onSubmit(true), 600);
        }
      }
    } else {
      this.message = { text: 'Nothing happens... try a different combination.', type: 'bad' };
    }

    this.selected = [];
    this._render();
  }

  _findMatch(a, b) {
    for (const rule of this.rules) {
      const [tag1, tag2] = rule.inputs;
      if ((a.tags.includes(tag1) && b.tags.includes(tag2)) ||
          (a.tags.includes(tag2) && b.tags.includes(tag1))) {
        return rule.output;
      }
    }
    return null;
  }

  reset() { this._init(); }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'crlk';

    // Goal
    const goalEl = document.createElement('div');
    goalEl.className = 'crlk-goal';
    goalEl.innerHTML = `<span class="crlk-goal-label">Goal:</span> <span class="crlk-goal-item">${this._getGoalLabel()}</span>`;
    wrap.appendChild(goalEl);

    // Combine area
    const combine = document.createElement('div');
    combine.className = 'crlk-combine';
    const slot1 = this.selected[0] !== undefined ? this.inventory[this.selected[0]] : null;
    const slot2 = this.selected[1] !== undefined ? this.inventory[this.selected[1]] : null;
    combine.innerHTML = `
      <div class="crlk-slot ${slot1 ? 'crlk-slot-filled' : ''}">${slot1 ? slot1.label : '<span class="crlk-slot-empty">Slot 1</span>'}</div>
      <div class="crlk-plus">+</div>
      <div class="crlk-slot ${slot2 ? 'crlk-slot-filled' : ''}">${slot2 ? slot2.label : '<span class="crlk-slot-empty">Slot 2</span>'}</div>`;
    wrap.appendChild(combine);

    // Message
    if (this.message) {
      const msg = document.createElement('div');
      msg.className = `crlk-msg crlk-msg-${this.message.type}`;
      msg.textContent = this.message.text;
      wrap.appendChild(msg);
    }

    // Inventory grid
    const invLabel = document.createElement('div');
    invLabel.className = 'crlk-inv-label';
    invLabel.textContent = `Inventory (${this.inventory.length})`;
    wrap.appendChild(invLabel);

    const inv = document.createElement('div');
    inv.className = 'crlk-inv';
    this.inventory.forEach((item, idx) => {
      const el = document.createElement('button');
      el.className = 'crlk-item';
      if (this.selected.includes(idx)) el.classList.add('crlk-item-selected');
      if (item.crafted) el.classList.add('crlk-item-crafted');
      if (item.permanent) el.classList.add('crlk-item-permanent');
      el.innerHTML = `<span class="crlk-item-label">${item.label}</span>${item.permanent ? '<span class="crlk-item-badge">∞</span>' : ''}`;
      el.addEventListener('click', () => this._select(idx));
      inv.appendChild(el);
    });
    wrap.appendChild(inv);

    // Craft history
    if (this.history.length > 0) {
      const histEl = document.createElement('div');
      histEl.className = 'crlk-history';
      histEl.innerHTML = '<div class="crlk-hist-title">Discoveries</div>' +
        this.history.map(h => `<div class="crlk-hist-row">${h.a} + ${h.b} → ${h.out}</div>`).join('');
      wrap.appendChild(histEl);
    }

    this.container.appendChild(wrap);
    this._injectStyles();
  }

  _getGoalLabel() {
    // Find the goal in rules outputs
    for (const rule of this.rules) {
      if (rule.output.id === this.goal) return rule.output.label;
    }
    return this.goal;
  }

  _injectStyles() {
    if (document.getElementById('crlk-css')) return;
    const s = document.createElement('style'); s.id = 'crlk-css';
    s.textContent = `
.crlk{display:flex;flex-direction:column;gap:12px;padding:16px 0;max-width:420px;margin:0 auto}
.crlk-goal{text-align:center;padding:8px 12px;background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);border-radius:8px;font-size:13px}
.crlk-goal-label{color:var(--muted,#7a8ba8)}
.crlk-goal-item{color:var(--accent,#3b82f6);font-weight:700}
.crlk-combine{display:flex;align-items:center;justify-content:center;gap:10px;padding:16px;background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);border-radius:10px}
.crlk-slot{padding:10px 16px;background:var(--bg,#0a0e17);border:2px dashed var(--border,#1e2a45);border-radius:8px;min-width:100px;text-align:center;font-size:13px;transition:all .2s}
.crlk-slot-filled{border-style:solid;border-color:var(--accent,#3b82f6);background:rgba(59,130,246,.05)}
.crlk-slot-empty{color:var(--muted,#7a8ba8);font-size:11px}
.crlk-plus{font-size:20px;font-weight:700;color:var(--muted,#7a8ba8)}
.crlk-msg{text-align:center;padding:8px 12px;border-radius:6px;font-size:13px;font-weight:600;animation:crlk-pop .3s ease-out}
@keyframes crlk-pop{0%{transform:scale(.9);opacity:0}100%{transform:scale(1);opacity:1}}
.crlk-msg-good{color:var(--green,#22c55e);background:rgba(34,197,94,.1)}
.crlk-msg-bad{color:var(--red,#ef4444);background:rgba(239,68,68,.1)}
.crlk-msg-warn{color:#eab308;background:rgba(234,179,8,.1)}
.crlk-msg-win{color:var(--green,#22c55e);background:rgba(34,197,94,.15);font-size:15px}
.crlk-inv-label{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--muted,#7a8ba8)}
.crlk-inv{display:flex;flex-wrap:wrap;gap:6px}
.crlk-item{padding:8px 12px;background:var(--bg,#0a0e17);border:1px solid var(--border,#1e2a45);border-radius:6px;cursor:pointer;font-size:12px;color:var(--text,#e0e6f0);transition:all .15s;position:relative;display:flex;align-items:center;gap:4px}
.crlk-item:active{transform:scale(.95)}
.crlk-item-selected{border-color:var(--accent,#3b82f6);background:rgba(59,130,246,.1);box-shadow:0 0 0 2px rgba(59,130,246,.3)}
.crlk-item-crafted{border-color:var(--green,#22c55e);background:rgba(34,197,94,.05)}
.crlk-item-permanent{border-style:double;border-width:3px}
.crlk-item-label{white-space:nowrap}
.crlk-item-badge{font-size:10px;color:var(--muted,#7a8ba8);margin-left:2px}
.crlk-history{background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);border-radius:8px;padding:10px 12px}
.crlk-hist-title{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--muted,#7a8ba8);margin-bottom:6px}
.crlk-hist-row{font-size:11px;color:var(--text,#e0e6f0);padding:3px 0;border-bottom:1px solid var(--border,#1e2a45)}
.crlk-hist-row:last-child{border:none}
`;
    document.head.appendChild(s);
  }
}
