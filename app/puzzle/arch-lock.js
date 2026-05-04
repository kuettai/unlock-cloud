/**
 * Architecture Diagram Lock Puzzle
 *
 * Drag service icons into drop zones on a blank architecture template.
 *
 * Usage:
 *   new ArchLock(containerEl, {
 *     zones: [
 *       { id: 'front', label: 'Frontend Tier', x: 50, y: 15 },
 *       { id: 'app', label: 'App Tier', x: 50, y: 50 },
 *       { id: 'data', label: 'Data Tier', x: 50, y: 85 },
 *     ],
 *     services: [
 *       { id: 'alb', label: 'ALB', icon: '⚖️' },
 *       { id: 'ec2', label: 'EC2', icon: '🖥️' },
 *       { id: 'rds', label: 'RDS', icon: '🗄️' },
 *       { id: 'sqs', label: 'SQS', icon: '📨' },  // decoy
 *     ],
 *     solution: { front: 'alb', app: 'ec2', data: 'rds' },
 *     onSubmit(correct) { ... }
 *   });
 */

class ArchLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.zones = opts.zones || [];
    this.services = opts.services || [];
    this.solution = opts.solution || {};
    this.onSubmit = opts.onSubmit || (() => {});
    this.placements = {};
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'archlk';

    // Service pool
    const pool = document.createElement('div');
    pool.className = 'archlk-pool';
    this.serviceEls = {};
    this.services.forEach(s => {
      const chip = document.createElement('div');
      chip.className = 'archlk-svc';
      chip.draggable = true;
      chip.dataset.svc = s.id;
      chip.innerHTML = `<span class="archlk-icon">${s.icon}</span><span>${s.label}</span>`;
      chip.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', s.id); chip.classList.add('archlk-dragging'); });
      chip.addEventListener('dragend', () => chip.classList.remove('archlk-dragging'));
      chip.addEventListener('touchstart', () => { this._touchSvc = s.id; chip.classList.add('archlk-dragging'); }, { passive: true });
      chip.addEventListener('touchend', e => {
        chip.classList.remove('archlk-dragging');
        const t = e.changedTouches[0];
        const el = document.elementFromPoint(t.clientX, t.clientY);
        const zone = el && el.closest('[data-zone]');
        if (zone && this._touchSvc) this._place(zone.dataset.zone, this._touchSvc);
        this._touchSvc = null;
      });
      pool.appendChild(chip);
      this.serviceEls[s.id] = chip;
    });
    wrap.appendChild(pool);

    // Diagram area
    const diagram = document.createElement('div');
    diagram.className = 'archlk-diagram';
    this.zoneEls = {};
    this.zones.forEach(z => {
      const zone = document.createElement('div');
      zone.className = 'archlk-zone';
      zone.dataset.zone = z.id;
      zone.style.left = `${z.x}%`;
      zone.style.top = `${z.y}%`;
      const lbl = document.createElement('div');
      lbl.className = 'archlk-zone-label';
      lbl.textContent = z.label;
      zone.appendChild(lbl);
      this.contentEl = document.createElement('div');
      this.contentEl.className = 'archlk-zone-content';
      zone.appendChild(this.contentEl);
      zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('archlk-over'); });
      zone.addEventListener('dragleave', () => zone.classList.remove('archlk-over'));
      zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('archlk-over'); this._place(z.id, e.dataTransfer.getData('text/plain')); });
      diagram.appendChild(zone);
      this.zoneEls[z.id] = { zone, content: this.contentEl };
    });
    wrap.appendChild(diagram);

    const btn = document.createElement('button');
    btn.className = 'archlk-btn';
    btn.textContent = 'Deploy';
    btn.addEventListener('click', () => this._test());
    wrap.appendChild(btn);

    this.statusEl = document.createElement('div');
    this.statusEl.className = 'archlk-status';
    wrap.appendChild(this.statusEl);

    this.container.appendChild(wrap);
    this._injectStyles();
  }

  _place(zoneId, svcId) {
    // Remove svc from any other zone
    Object.keys(this.placements).forEach(z => { if (this.placements[z] === svcId) delete this.placements[z]; });
    this.placements[zoneId] = svcId;
    this._updateZones();
  }

  _updateZones() {
    this.zones.forEach(z => {
      const el = this.zoneEls[z.id];
      const svcId = this.placements[z.id];
      if (svcId) {
        const svc = this.services.find(s => s.id === svcId);
        el.content.innerHTML = `<span class="archlk-icon">${svc.icon}</span> ${svc.label}`;
        el.content.classList.add('archlk-filled');
      } else {
        el.content.innerHTML = '?';
        el.content.classList.remove('archlk-filled');
      }
    });
    // Update pool visibility
    const placed = new Set(Object.values(this.placements));
    this.services.forEach(s => { this.serviceEls[s.id].classList.toggle('archlk-placed', placed.has(s.id)); });
  }

  _test() {
    let allCorrect = true;
    this.zones.forEach(z => {
      const correct = this.placements[z.id] === this.solution[z.id];
      this.zoneEls[z.id].zone.classList.toggle('archlk-correct', correct);
      if (!correct && this.solution[z.id]) {
        allCorrect = false;
        this.zoneEls[z.id].zone.classList.add('archlk-wrong');
        setTimeout(() => this.zoneEls[z.id].zone.classList.remove('archlk-wrong'), 600);
      }
    });
    if (allCorrect) { this.statusEl.textContent = '✅ Architecture deployed!'; setTimeout(() => this.onSubmit(true), 400); }
    else this.statusEl.textContent = '❌ Incorrect placement';
  }

  reset() { this.placements = {}; this._updateZones(); this.statusEl.textContent = ''; this.zones.forEach(z => this.zoneEls[z.id].zone.classList.remove('archlk-correct','archlk-wrong')); }

  _injectStyles() {
    if (document.getElementById('archlk-css')) return;
    const s = document.createElement('style');
    s.id = 'archlk-css';
    s.textContent = `
.archlk{display:flex;flex-direction:column;gap:12px;padding:16px 0;max-width:360px;margin:0 auto}
.archlk-pool{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.archlk-svc{display:flex;align-items:center;gap:6px;padding:8px 12px;background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);border-radius:8px;font-size:13px;font-weight:600;color:var(--text,#e0e6f0);cursor:grab;user-select:none;-webkit-user-select:none;transition:opacity .2s}
.archlk-svc.archlk-dragging{opacity:.4}
.archlk-svc.archlk-placed{opacity:.3;pointer-events:none}
.archlk-icon{font-size:18px}
.archlk-diagram{position:relative;height:240px;background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);border-radius:10px}
.archlk-zone{position:absolute;transform:translate(-50%,-50%);min-width:120px;padding:10px;background:var(--bg,#0a0e17);border:2px dashed var(--border,#1e2a45);border-radius:8px;text-align:center;transition:all .2s}
.archlk-zone.archlk-over{border-color:var(--accent,#3b82f6);box-shadow:0 0 10px rgba(59,130,246,.2)}
.archlk-zone.archlk-correct{border-color:var(--green,#22c55e);border-style:solid}
.archlk-zone.archlk-wrong{animation:archlk-sh .4s}
@keyframes archlk-sh{0%,100%{transform:translate(-50%,-50%)}25%{transform:translate(calc(-50% - 6px),-50%)}75%{transform:translate(calc(-50% + 6px),-50%)}}
.archlk-zone-label{font-size:10px;color:var(--muted,#7a8ba8);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
.archlk-zone-content{font-size:14px;color:var(--muted,#7a8ba8);min-height:24px}
.archlk-zone-content.archlk-filled{color:var(--text,#e0e6f0);font-weight:600}
.archlk-btn{padding:12px 28px;border:none;border-radius:8px;background:var(--accent,#3b82f6);color:#fff;font-size:14px;font-weight:600;cursor:pointer;align-self:center}
.archlk-btn:active{opacity:.7}
.archlk-status{font-size:13px;color:var(--muted,#7a8ba8);text-align:center;min-height:18px}
`;
    document.head.appendChild(s);
  }
}
