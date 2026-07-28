/**
 * Blueprint Lock Puzzle — "Raise the Building"
 *
 * Components arrive one at a time. For each, player taps the correct
 * architectural floor to place it. Right = installs with glow animation.
 * Wrong = floor cracks, error message explains WHY it's wrong.
 * All placed correctly = building rises with celebration.
 *
 * Teaches: architectural layering, dependency order, separation of concerns.
 */

class BlueprintLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.layers = opts.layers || [];
    this.components = opts.components || [];
    this.onSubmit = opts.onSubmit || (() => {});
    this.onWrong = opts.onWrong || (() => {});
    this.falseOutputs = opts.falseOutputs || {};
    this.successMessage = opts.successMessage || null;
    this.successIcon = opts.successIcon || null;
    // Shuffle component order for variety
    this.queue = [...this.components].sort(() => Math.random() - 0.5);
    this.currentIdx = 0;
    this.placed = {}; // layerId → [component labels]
    this.layers.forEach(l => { this.placed[l.id] = []; });
    this.mistakes = 0;
    this.lastError = null;
    this._render();
  }

  _current() { return this.queue[this.currentIdx]; }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'bplk';

    // Check if done
    if (this.currentIdx >= this.queue.length) {
      this._renderSuccess(wrap);
      this.container.appendChild(wrap);
      this._injectStyles();
      return;
    }

    const comp = this._current();

    // Current component card (the "incoming" piece)
    const incoming = document.createElement('div');
    incoming.className = 'bplk-incoming';
    incoming.innerHTML = `
      <div class="bplk-incoming-label">PLACE THIS COMPONENT</div>
      <div class="bplk-incoming-card">
        <span class="bplk-incoming-icon">${comp.icon || '📦'}</span>
        <span class="bplk-incoming-name">${comp.label}</span>
      </div>
      <div class="bplk-incoming-hint"></div>
    `;
    wrap.appendChild(incoming);

    // Error display
    if (this.lastError) {
      const err = document.createElement('div');
      err.className = 'bplk-error bplk-pop';
      err.textContent = '❌ ' + this.lastError;
      wrap.appendChild(err);
    }

    // Manifest — show ALL components up front so the player can see the full
    // set and plan the ordering, instead of guessing one blind piece at a time.
    const manifest = document.createElement('div');
    manifest.className = 'bplk-manifest';
    manifest.innerHTML = `<div class="bplk-manifest-label">All components — place each into the right step</div>`
      + `<div class="bplk-manifest-items">`
      + this.queue.map((c, i) => {
          const st = i < this.currentIdx ? 'done' : (i === this.currentIdx ? 'current' : 'pending');
          const mark = st === 'done' ? '✅ ' : st === 'current' ? '👉 ' : '';
          return `<span class="bplk-manifest-chip bplk-manifest-${st}">${mark}${c.icon || '📦'} ${c.label}</span>`;
        }).join('')
      + `</div>`;
    wrap.appendChild(manifest);

    // Building cross-section (tap floors to place)
    const building = document.createElement('div');
    building.className = 'bplk-building';
    // Render top to bottom (UI at top, infra at bottom)
    this.layers.forEach(layer => {
      const floor = document.createElement('button');
      floor.className = 'bplk-floor';
      floor.style.borderLeftColor = layer.color;
      floor.innerHTML = `
        <div class="bplk-floor-label">${layer.icon} ${layer.label}</div>
        <div class="bplk-floor-contents">${this.placed[layer.id].map(c => `<span class="bplk-placed-chip">${c}</span>`).join('') || '<span class="bplk-floor-empty">empty</span>'}</div>
      `;
      floor.addEventListener('click', () => this._place(layer.id));
      building.appendChild(floor);
    });
    wrap.appendChild(building);

    // Progress
    const prog = document.createElement('div');
    prog.className = 'bplk-progress';
    prog.innerHTML = `<span>${this.currentIdx}/${this.queue.length} placed</span><span>Mistakes: ${this.mistakes}</span>`;
    wrap.appendChild(prog);

    this.container.appendChild(wrap);
    this._injectStyles();
  }

  _place(layerId) {
    const comp = this._current();
    if (layerId === comp.layer) {
      // Correct!
      this.placed[layerId].push(comp.label);
      this.lastError = null;
      this.currentIdx++;
      this._render();
      // Flash the floor green
      const floors = this.container.querySelectorAll('.bplk-floor');
      const idx = this.layers.findIndex(l => l.id === layerId);
      if (floors[idx]) {
        floors[idx].classList.add('bplk-floor-correct');
        setTimeout(() => floors[idx]?.classList.remove('bplk-floor-correct'), 800);
      }
    } else {
      // Wrong!
      this.mistakes++;
      const wrongLayer = this.layers.find(l => l.id === layerId);
      const rightLayer = this.layers.find(l => l.id === comp.layer);
      // Generate contextual error
      const key = `${comp.id}->${layerId}`;
      this.lastError = this.falseOutputs[key] || `${comp.label} doesn't belong in ${wrongLayer.label}. It needs ${rightLayer.label}.`;
      this._render();
      // Shake the wrong floor
      const floors = this.container.querySelectorAll('.bplk-floor');
      const idx = this.layers.findIndex(l => l.id === layerId);
      if (floors[idx]) {
        floors[idx].classList.add('bplk-floor-shake');
        setTimeout(() => floors[idx]?.classList.remove('bplk-floor-shake'), 500);
      }
      this.onWrong(this.lastError);
    }
  }

  _renderSuccess(wrap) {
    // Animate building rising
    const building = document.createElement('div');
    building.className = 'bplk-building bplk-building-done';
    this.layers.forEach((layer, i) => {
      const floor = document.createElement('div');
      floor.className = 'bplk-floor bplk-floor-rise';
      floor.style.borderLeftColor = layer.color;
      floor.style.animationDelay = (this.layers.length - 1 - i) * 0.2 + 's';
      floor.innerHTML = `
        <div class="bplk-floor-label">${layer.icon} ${layer.label}</div>
        <div class="bplk-floor-contents">${this.placed[layer.id].map(c => `<span class="bplk-placed-chip bplk-chip-done">${c}</span>`).join('')}</div>
      `;
      building.appendChild(floor);
    });
    wrap.appendChild(building);

    const msg = document.createElement('div');
    msg.className = 'bplk-success';
    const successIcon = this.successIcon || '✅';
    const successMsg = this.successMessage || 'All components placed correctly!';
    const mistakeNote = this.mistakes === 0 ? ' Perfect — zero mistakes!' : ` (${this.mistakes} mistake${this.mistakes > 1 ? 's' : ''})`;
    msg.innerHTML = `<div class="bplk-success-icon">${successIcon}</div><div class="bplk-success-text">${successMsg}${mistakeNote}</div>`;
    wrap.appendChild(msg);

    setTimeout(() => this.onSubmit(), 3000);
  }

  _injectStyles() {
    if (document.getElementById('bplk-css')) return;
    const s = document.createElement('style');
    s.id = 'bplk-css';
    s.textContent = `
.bplk{display:flex;flex-direction:column;gap:12px;padding:12px 0}
.bplk-incoming{text-align:center;padding:14px;background:var(--surface,#141b2d);border:2px solid var(--accent,#3b82f6);border-radius:10px}
.bplk-incoming-label{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:var(--muted,#7a8ba8);margin-bottom:8px}
.bplk-incoming-card{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;background:var(--bg,#0a0e17);border:2px solid var(--accent,#3b82f6);border-radius:8px;font-size:15px;font-weight:700;color:var(--text,#e0e6f0)}
.bplk-incoming-icon{font-size:1.3rem}
.bplk-incoming-hint{font-size:11px;color:var(--muted,#7a8ba8);margin-top:8px;font-style:italic}
.bplk-manifest{background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);border-radius:10px;padding:10px 12px}
.bplk-manifest-label{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--muted,#7a8ba8);margin-bottom:8px}
.bplk-manifest-items{display:flex;flex-wrap:wrap;gap:6px}
.bplk-manifest-chip{font-size:11px;padding:5px 10px;border-radius:6px;background:var(--bg,#0a0e17);border:1px solid var(--border,#1e2a45);color:var(--text,#e0e6f0)}
.bplk-manifest-done{opacity:.55;border-color:var(--green,#22c55e);color:var(--green,#22c55e)}
.bplk-manifest-current{border-color:var(--accent,#3b82f6);box-shadow:0 0 6px rgba(59,130,246,.3);font-weight:700}
.bplk-manifest-pending{border-style:dashed}
.bplk-error{font-size:12px;color:#e94560;padding:8px 12px;background:rgba(233,69,96,.08);border:1px solid rgba(233,69,96,.2);border-radius:6px;text-align:center}
.bplk-building{display:flex;flex-direction:column;gap:4px}
.bplk-building-done .bplk-floor{cursor:default}
.bplk-floor{display:flex;align-items:center;gap:8px;padding:12px;border-left:5px solid var(--border,#1e2a45);border-radius:4px;background:var(--bg,#0a0e17);cursor:pointer;transition:all .15s;border:none;font-family:inherit;color:inherit;font-size:inherit;text-align:left;width:100%}
.bplk-floor:hover{background:rgba(59,130,246,.04)}
.bplk-floor:active{transform:scale(.98)}
.bplk-floor-correct{background:rgba(34,197,94,.08)!important;box-shadow:inset 0 0 12px rgba(34,197,94,.1)}
.bplk-floor-shake{animation:bplk-sh .4s}
.bplk-floor-rise{animation:bplk-rise .5s both;background:rgba(34,197,94,.05);border-left-color:var(--green,#22c55e)!important}
.bplk-floor-label{font-size:12px;font-weight:600;color:var(--muted,#7a8ba8);min-width:100px;white-space:nowrap}
.bplk-floor-contents{flex:1;display:flex;flex-wrap:wrap;gap:4px}
.bplk-floor-empty{font-size:11px;color:var(--border,#1e2a45);font-style:italic}
.bplk-placed-chip{padding:3px 10px;background:var(--surface,#141b2d);border:1px solid var(--accent,#3b82f6);border-radius:4px;font-size:11px;color:var(--text,#e0e6f0)}
.bplk-chip-done{border-color:var(--green,#22c55e);color:var(--green,#22c55e)}
.bplk-progress{display:flex;justify-content:space-between;font-size:11px;color:var(--muted,#7a8ba8)}
.bplk-success{text-align:center;padding:16px;background:rgba(34,197,94,.05);border:2px solid var(--green,#22c55e);border-radius:10px}
.bplk-success-icon{font-size:2rem;margin-bottom:6px}
.bplk-success-text{font-size:13px;color:var(--green,#22c55e);font-weight:600}
.bplk-pop{animation:bplk-pop .3s}
@keyframes bplk-sh{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
@keyframes bplk-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes bplk-pop{from{transform:scale(.9);opacity:0}to{transform:scale(1);opacity:1}}
`;
    document.head.appendChild(s);
  }
}
