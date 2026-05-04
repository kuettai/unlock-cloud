/**
 * Rotation Lock Puzzle
 *
 * Circular dials the player rotates by dragging. Each dial has evenly spaced
 * symbols and must be aligned so the correct symbol sits at the top marker.
 *
 * Usage:
 *   new RotationLock(containerEl, {
 *     dials: [
 *       { symbols: ['▲','■','●','◆','★','✦'], answer: 2 },  // index of correct symbol
 *       { symbols: ['A','B','C','D'], answer: 3 },
 *     ],
 *     revealCorrect: true,  // green lock per dial (false = all-or-nothing)
 *     falseOutputs: [       // shown on wrong attempt to mislead
 *       'Access granted to Subnet-7B... but something feels off.',
 *       'Route table updated. Packets rerouting to unknown gateway.',
 *     ],
 *     onSubmit(correct) { ... },
 *     onWrong(message) { ... }  // called with a false output string
 *   });
 */

class RotationLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.dials = opts.dials || [];
    this.revealCorrect = opts.revealCorrect !== undefined ? opts.revealCorrect : true;
    this.falseOutputs = opts.falseOutputs || [];
    this.onSubmit = opts.onSubmit || (() => {});
    this.onWrong = opts.onWrong || (() => {});
    this.angles = this.dials.map(() => 0);
    this.locked = new Array(this.dials.length).fill(false);
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'rotlk';

    const row = document.createElement('div');
    row.className = 'rotlk-row';
    this.dialEls = [];
    this.dials.forEach((d, i) => {
      const el = this._createDial(d, i);
      row.appendChild(el);
      this.dialEls.push(el);
    });
    wrap.appendChild(row);

    const btn = document.createElement('button');
    btn.className = 'rotlk-btn';
    btn.textContent = 'Activate';
    btn.addEventListener('click', () => this._test());
    wrap.appendChild(btn);

    this.container.appendChild(wrap);
    this._injectStyles();
  }

  _createDial(dial, index) {
    const SIZE = 100;
    const R = 36;
    const outer = document.createElement('div');
    outer.className = 'rotlk-dial';

    // Marker at top
    const marker = document.createElement('div');
    marker.className = 'rotlk-marker';
    outer.appendChild(marker);

    // Rotatable ring
    const ring = document.createElement('div');
    ring.className = 'rotlk-ring';
    ring.style.width = ring.style.height = `${SIZE}px`;

    const count = dial.symbols.length;
    dial.symbols.forEach((sym, si) => {
      const el = document.createElement('div');
      el.className = 'rotlk-sym';
      el.textContent = sym;
      const angle = (360 / count) * si;
      const rad = angle * Math.PI / 180;
      const x = SIZE / 2 + R * Math.sin(rad) - 12;
      const y = SIZE / 2 - R * Math.cos(rad) - 12;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      ring.appendChild(el);
    });
    outer.appendChild(ring);

    this._attachDrag(outer, ring, index, count);
    return outer;
  }

  _attachDrag(outer, ring, index, count) {
    const step = 360 / count;
    let dragging = false, startAngle = 0, baseAngle = 0;

    const center = () => {
      const r = ring.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    };

    const pointerAngle = (e) => {
      const t = e.touches ? e.touches[0] : e;
      const c = center();
      return Math.atan2(t.clientX - c.x, -(t.clientY - c.y)) * 180 / Math.PI;
    };

    const onStart = (e) => {
      if (this.locked[index]) return;
      dragging = true;
      startAngle = pointerAngle(e);
      baseAngle = this.angles[index];
      outer.classList.add('rotlk-dragging');
    };

    const onMove = (e) => {
      if (!dragging) return;
      e.preventDefault();
      const delta = pointerAngle(e) - startAngle;
      this.angles[index] = baseAngle + delta;
      ring.style.transform = `rotate(${this.angles[index]}deg)`;
    };

    const onEnd = () => {
      if (!dragging) return;
      dragging = false;
      outer.classList.remove('rotlk-dragging');
      // Snap to nearest step
      let a = ((this.angles[index] % 360) + 360) % 360;
      a = Math.round(a / step) * step;
      this.angles[index] = a;
      ring.style.transition = 'transform 0.15s ease-out';
      ring.style.transform = `rotate(${a}deg)`;
      setTimeout(() => { ring.style.transition = ''; }, 150);
    };

    outer.addEventListener('mousedown', onStart);
    outer.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchend', onEnd);
  }

  _getSelected(index) {
    const count = this.dials[index].symbols.length;
    const step = 360 / count;
    const a = ((this.angles[index] % 360) + 360) % 360;
    // Rotation moves symbols clockwise, so top symbol index shifts backward
    const offset = Math.round(a / step) % count;
    return (count - offset) % count;
  }

  _test() {
    let allCorrect = true;
    this.dials.forEach((d, i) => {
      if (this.locked[i]) return;
      const selected = this._getSelected(i);
      const correct = selected === d.answer;
      if (!correct) allCorrect = false;
      if (this.revealCorrect) {
        if (correct) {
          this.locked[i] = true;
          this.dialEls[i].classList.add('rotlk-correct');
        } else {
          this.dialEls[i].classList.add('rotlk-wrong');
          setTimeout(() => this.dialEls[i].classList.remove('rotlk-wrong'), 600);
        }
      }
    });
    if (allCorrect) {
      if (!this.revealCorrect) {
        this.dialEls.forEach((el, i) => {
          this.locked[i] = true;
          el.classList.add('rotlk-correct');
        });
      }
      this.onSubmit(true);
    } else if (!this.revealCorrect) {
      this.dialEls.forEach(el => {
        el.classList.add('rotlk-wrong');
        setTimeout(() => el.classList.remove('rotlk-wrong'), 600);
      });
      this._fireWrong();
    } else {
      this._fireWrong();
    }
  }

  _fireWrong() {
    if (this.falseOutputs.length) {
      const msg = this.falseOutputs[Math.floor(Math.random() * this.falseOutputs.length)];
      this.onWrong(msg);
    } else {
      this.onWrong(null);
    }
  }

  reset() {
    this.angles = this.dials.map(() => 0);
    this.locked = new Array(this.dials.length).fill(false);
    this.dialEls.forEach(el => {
      el.classList.remove('rotlk-correct', 'rotlk-wrong');
      el.querySelector('.rotlk-ring').style.transform = 'rotate(0deg)';
    });
  }

  _injectStyles() {
    if (document.getElementById('rotlk-css')) return;
    const s = document.createElement('style');
    s.id = 'rotlk-css';
    s.textContent = `
.rotlk{display:flex;flex-direction:column;align-items:center;gap:20px;padding:16px 0}
.rotlk-row{display:flex;gap:16px;flex-wrap:wrap;justify-content:center}
.rotlk-dial{position:relative;display:flex;align-items:center;justify-content:center;width:110px;height:110px;cursor:grab;user-select:none;-webkit-user-select:none}
.rotlk-dial.rotlk-dragging{cursor:grabbing}
.rotlk-marker{position:absolute;top:2px;left:50%;width:12px;height:12px;margin-left:-6px;background:var(--accent,#3b82f6);clip-path:polygon(50% 0%,0% 100%,100% 100%);z-index:2}
.rotlk-ring{position:relative;border:2px solid var(--border,#1e2a45);border-radius:50%;background:var(--surface,#141b2d);will-change:transform}
.rotlk-sym{position:absolute;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:var(--muted,#7a8ba8)}
.rotlk-correct .rotlk-ring{border-color:var(--green,#22c55e);box-shadow:0 0 12px rgba(34,197,94,.4)}
.rotlk-correct .rotlk-marker{background:var(--green,#22c55e)}
.rotlk-wrong .rotlk-ring{animation:rotlk-shake .4s}
@keyframes rotlk-shake{0%,100%{transform:rotate(var(--a,0deg))}25%{transform:rotate(calc(var(--a,0deg) - 8deg))}75%{transform:rotate(calc(var(--a,0deg) + 8deg))}}
.rotlk-btn{padding:12px 28px;border:none;border-radius:8px;background:var(--accent,#3b82f6);color:#fff;font-size:14px;font-weight:600;cursor:pointer;letter-spacing:.5px;transition:opacity .2s}
.rotlk-btn:active{opacity:.7}
`;
    document.head.appendChild(s);
  }
}
