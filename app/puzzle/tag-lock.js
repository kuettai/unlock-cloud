/**
 * Tag Builder Lock Puzzle
 *
 * Drag key-value tag chips onto resource slots. Each resource needs specific tags.
 *
 * Usage:
 *   new TagLock(containerEl, {
 *     resources: [
 *       { id: 'web', label: 'Web Server', requiredTags: { Environment: 'Production', Team: 'Frontend' } },
 *       { id: 'db', label: 'Database', requiredTags: { Environment: 'Production', Team: 'Backend' } },
 *     ],
 *     extraTags: [{ key: 'Environment', value: 'Staging' }, { key: 'Team', value: 'DevOps' }],
 *     onSubmit(correct) { ... }
 *   });
 */

class TagLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.resources = opts.resources || [];
    this.onSubmit = opts.onSubmit || (() => {});
    this.allTags = this._buildTags(opts.extraTags || []);
    this.assignments = {};
    this.resources.forEach(r => { this.assignments[r.id] = []; });
    this._render();
  }

  _buildTags(extras) {
    const tags = [];
    this.resources.forEach(r => {
      Object.entries(r.requiredTags).forEach(([k, v]) => {
        if (!tags.find(t => t.key === k && t.value === v)) tags.push({ key: k, value: v });
      });
    });
    extras.forEach(t => { if (!tags.find(x => x.key === t.key && x.value === t.value)) tags.push(t); });
    for (let i = tags.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [tags[i], tags[j]] = [tags[j], tags[i]]; }
    return tags;
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'taglk';

    // Tag pool
    const pool = document.createElement('div');
    pool.className = 'taglk-pool';
    const poolLabel = document.createElement('div');
    poolLabel.className = 'taglk-section';
    poolLabel.textContent = 'Available Tags';
    pool.appendChild(poolLabel);
    this.poolEl = document.createElement('div');
    this.poolEl.className = 'taglk-chips';
    pool.appendChild(this.poolEl);
    wrap.appendChild(pool);

    // Resources
    this.resEls = {};
    this.resources.forEach(r => {
      const box = document.createElement('div');
      box.className = 'taglk-res';
      box.dataset.res = r.id;
      const hdr = document.createElement('div');
      hdr.className = 'taglk-res-label';
      hdr.textContent = r.label;
      box.appendChild(hdr);
      const slots = document.createElement('div');
      slots.className = 'taglk-slots';
      box.appendChild(slots);
      box.addEventListener('dragover', e => { e.preventDefault(); box.classList.add('taglk-over'); });
      box.addEventListener('dragleave', () => box.classList.remove('taglk-over'));
      box.addEventListener('drop', e => { e.preventDefault(); box.classList.remove('taglk-over'); this._dropOnRes(r.id, e); });
      wrap.appendChild(box);
      this.resEls[r.id] = { box, slots };
    });

    const btn = document.createElement('button');
    btn.className = 'taglk-btn';
    btn.textContent = 'Validate Tags';
    btn.addEventListener('click', () => this._test());
    wrap.appendChild(btn);

    this.statusEl = document.createElement('div');
    this.statusEl.className = 'taglk-status';
    wrap.appendChild(this.statusEl);

    this.container.appendChild(wrap);
    this._injectStyles();
    this._renderChips();
  }

  _renderChips() {
    this.poolEl.innerHTML = '';
    const assigned = new Set();
    Object.values(this.assignments).forEach(tags => tags.forEach(t => assigned.add(`${t.key}=${t.value}`)));
    this.allTags.forEach((t, i) => {
      if (assigned.has(`${t.key}=${t.value}`)) return;
      const chip = this._makeChip(t, i);
      this.poolEl.appendChild(chip);
    });
    // Render assigned tags in resource slots
    this.resources.forEach(r => {
      const slots = this.resEls[r.id].slots;
      slots.innerHTML = '';
      this.assignments[r.id].forEach((t, ti) => {
        const chip = this._makeChip(t, -1, true);
        chip.addEventListener('click', () => { this.assignments[r.id].splice(ti, 1); this._renderChips(); });
        slots.appendChild(chip);
      });
    });
  }

  _makeChip(tag, idx, removable) {
    const chip = document.createElement('div');
    chip.className = 'taglk-chip' + (removable ? ' taglk-chip-placed' : '');
    chip.textContent = `${tag.key}: ${tag.value}`;
    chip.draggable = !removable;
    if (!removable) {
      chip.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', JSON.stringify(tag)); chip.classList.add('taglk-dragging'); });
      chip.addEventListener('dragend', () => chip.classList.remove('taglk-dragging'));
      // Touch
      chip.addEventListener('touchstart', () => { this._touchTag = tag; chip.classList.add('taglk-dragging'); }, { passive: true });
      chip.addEventListener('touchend', (e) => {
        chip.classList.remove('taglk-dragging');
        const touch = e.changedTouches[0];
        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        const box = el && el.closest('[data-res]');
        if (box && this._touchTag) { this._dropTag(box.dataset.res, this._touchTag); }
        this._touchTag = null;
      });
    }
    return chip;
  }

  _dropOnRes(resId, e) {
    try {
      const tag = JSON.parse(e.dataTransfer.getData('text/plain'));
      this._dropTag(resId, tag);
    } catch {}
  }

  _dropTag(resId, tag) {
    const already = this.assignments[resId].find(t => t.key === tag.key && t.value === tag.value);
    if (already) return;
    // Remove from other resources
    this.resources.forEach(r => { this.assignments[r.id] = this.assignments[r.id].filter(t => !(t.key === tag.key && t.value === tag.value)); });
    this.assignments[resId].push(tag);
    this._renderChips();
  }

  _test() {
    let allCorrect = true;
    this.resources.forEach(r => {
      const assigned = this.assignments[r.id];
      const correct = Object.entries(r.requiredTags).every(([k, v]) => assigned.find(t => t.key === k && t.value === v))
        && assigned.length === Object.keys(r.requiredTags).length;
      this.resEls[r.id].box.classList.toggle('taglk-correct', correct);
      this.resEls[r.id].box.classList.toggle('taglk-wrong', !correct);
      if (!correct) { allCorrect = false; setTimeout(() => this.resEls[r.id].box.classList.remove('taglk-wrong'), 600); }
    });
    if (allCorrect) { this.statusEl.textContent = '✅ Tags validated!'; setTimeout(() => this.onSubmit(true), 400); }
    else this.statusEl.textContent = '❌ Some tags are wrong';
  }

  reset() { this.resources.forEach(r => { this.assignments[r.id] = []; }); this._renderChips(); this.statusEl.textContent = ''; }

  _injectStyles() {
    if (document.getElementById('taglk-css')) return;
    const s = document.createElement('style');
    s.id = 'taglk-css';
    s.textContent = `
.taglk{display:flex;flex-direction:column;gap:12px;padding:16px 0;max-width:360px;margin:0 auto}
.taglk-section{font-size:11px;color:var(--muted,#7a8ba8);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px}
.taglk-chips{display:flex;flex-wrap:wrap;gap:6px;min-height:32px}
.taglk-chip{padding:6px 10px;background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);border-radius:6px;font-size:12px;font-weight:600;color:var(--accent,#3b82f6);cursor:grab;user-select:none;-webkit-user-select:none;white-space:nowrap}
.taglk-chip.taglk-dragging{opacity:.4}
.taglk-chip-placed{cursor:pointer;border-color:var(--accent,#3b82f6);background:#0c1a2e}
.taglk-chip-placed::after{content:' ✕';color:var(--muted,#7a8ba8);font-size:10px}
.taglk-res{padding:12px;background:var(--surface,#141b2d);border:2px solid var(--border,#1e2a45);border-radius:8px;transition:all .2s;min-height:70px}
.taglk-res.taglk-over{border-color:var(--accent,#3b82f6);box-shadow:0 0 10px rgba(59,130,246,.2)}
.taglk-res.taglk-correct{border-color:var(--green,#22c55e)}
.taglk-res.taglk-wrong{animation:taglk-sh .4s}
@keyframes taglk-sh{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
.taglk-res-label{font-size:13px;font-weight:700;color:var(--text,#e0e6f0);margin-bottom:8px}
.taglk-slots{display:flex;flex-wrap:wrap;gap:6px;min-height:28px}
.taglk-btn{padding:12px 28px;border:none;border-radius:8px;background:var(--accent,#3b82f6);color:#fff;font-size:14px;font-weight:600;cursor:pointer;align-self:center}
.taglk-btn:active{opacity:.7}
.taglk-status{font-size:13px;color:var(--muted,#7a8ba8);text-align:center;min-height:18px}
`;
    document.head.appendChild(s);
  }
}
