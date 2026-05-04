/**
 * Slider Lock Puzzle
 *
 * Multiple horizontal sliders, each with a label and a target value.
 * Player drags each slider to the correct position, then tests with "Activate".
 *
 * Usage:
 *   new SliderLock(containerEl, {
 *     sliders: [
 *       { label: 'Frequency', min: 0, max: 100, step: 1, answer: 42 },
 *       { label: 'Amplitude', min: 0, max: 10, step: 0.5, answer: 7.5 },
 *       { label: 'Phase',     min: 0, max: 360, step: 10, answer: 180 },
 *     ],
 *     tolerance: 0,       // how far off is still correct (default 0 = exact)
 *     revealCorrect: true, // show green lock on correct sliders (false = no feedback, all-or-nothing)
 *     onSubmit(correct) { ... }
 *   });
 */

class SliderLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.sliders = opts.sliders || [];
    this.tolerance = opts.tolerance || 0;
    this.revealCorrect = opts.revealCorrect !== undefined ? opts.revealCorrect : true;
    this.falseOutputs = opts.falseOutputs || [];
    this.onSubmit = opts.onSubmit || (() => {});
    this.onWrong = opts.onWrong || (() => {});
    this.values = this.sliders.map(s => s.min);
    this.locked = new Array(this.sliders.length).fill(false);
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'slilk';

    this.rowEls = [];
    this.sliders.forEach((s, i) => {
      const row = document.createElement('div');
      row.className = 'slilk-row';

      const head = document.createElement('div');
      head.className = 'slilk-head';
      const lbl = document.createElement('span');
      lbl.className = 'slilk-label';
      lbl.textContent = s.label;
      const val = document.createElement('span');
      val.className = 'slilk-val';
      val.textContent = s.min;
      head.appendChild(lbl);
      head.appendChild(val);
      row.appendChild(head);

      const track = document.createElement('div');
      track.className = 'slilk-track';
      const fill = document.createElement('div');
      fill.className = 'slilk-fill';
      const thumb = document.createElement('div');
      thumb.className = 'slilk-thumb';
      track.appendChild(fill);
      track.appendChild(thumb);
      row.appendChild(track);

      wrap.appendChild(row);
      this.rowEls.push({ row, val, track, fill, thumb });
      this._attachDrag(track, fill, thumb, val, i);
    });

    const btn = document.createElement('button');
    btn.className = 'slilk-btn';
    btn.textContent = 'Activate';
    btn.addEventListener('click', () => this._test());
    wrap.appendChild(btn);

    this.container.appendChild(wrap);
    this._injectStyles();
  }

  _attachDrag(track, fill, thumb, valEl, index) {
    const s = this.sliders[index];
    const range = s.max - s.min;

    const update = (clientX) => {
      if (this.locked[index]) return;
      const rect = track.getBoundingClientRect();
      let pct = (clientX - rect.left) / rect.width;
      pct = Math.max(0, Math.min(1, pct));
      // Snap to step
      let val = s.min + pct * range;
      val = Math.round(val / s.step) * s.step;
      val = Math.max(s.min, Math.min(s.max, val));
      // Recalc pct from snapped value
      pct = (val - s.min) / range;
      this.values[index] = val;
      fill.style.width = `${pct * 100}%`;
      thumb.style.left = `${pct * 100}%`;
      valEl.textContent = Number.isInteger(val) ? val : val.toFixed(1);
    };

    let dragging = false;
    const onStart = (e) => {
      if (this.locked[index]) return;
      dragging = true;
      update(e.touches ? e.touches[0].clientX : e.clientX);
    };
    const onMove = (e) => {
      if (!dragging) return;
      e.preventDefault();
      update(e.touches ? e.touches[0].clientX : e.clientX);
    };
    const onEnd = () => { dragging = false; };

    track.addEventListener('mousedown', onStart);
    track.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchend', onEnd);
  }

  _test() {
    let allCorrect = true;
    this.sliders.forEach((s, i) => {
      const el = this.rowEls[i];
      if (this.locked[i]) return;
      const correct = Math.abs(this.values[i] - s.answer) <= this.tolerance;
      if (!correct) allCorrect = false;
      if (this.revealCorrect) {
        if (correct) {
          this.locked[i] = true;
          el.row.classList.add('slilk-correct');
        } else {
          el.row.classList.add('slilk-wrong');
          setTimeout(() => el.row.classList.remove('slilk-wrong'), 600);
        }
      }
    });
    if (allCorrect) {
      if (!this.revealCorrect) {
        // Show all correct at once
        this.rowEls.forEach((el, i) => {
          this.locked[i] = true;
          el.row.classList.add('slilk-correct');
        });
      }
      this.onSubmit(true);
    } else if (!this.revealCorrect) {
      // Shake all sliders — no hints which are wrong
      this.rowEls.forEach(el => {
        if (!this.locked[el]) {
          el.row.classList.add('slilk-wrong');
          setTimeout(() => el.row.classList.remove('slilk-wrong'), 600);
        }
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
    this.values = this.sliders.map(s => s.min);
    this.locked = new Array(this.sliders.length).fill(false);
    this.rowEls.forEach(el => {
      el.fill.style.width = '0%';
      el.thumb.style.left = '0%';
      el.val.textContent = this.sliders[0].min;
      el.row.classList.remove('slilk-correct', 'slilk-wrong');
    });
  }

  _injectStyles() {
    if (document.getElementById('slilk-css')) return;
    const s = document.createElement('style');
    s.id = 'slilk-css';
    s.textContent = `
.slilk{display:flex;flex-direction:column;gap:16px;padding:16px 0;max-width:360px;margin:0 auto}
.slilk-row{transition:opacity .2s}
.slilk-row.slilk-correct{opacity:.6}
.slilk-row.slilk-correct .slilk-fill{background:var(--green,#22c55e)!important}
.slilk-row.slilk-correct .slilk-thumb{border-color:var(--green,#22c55e)!important;box-shadow:0 0 8px rgba(34,197,94,.5)}
.slilk-row.slilk-wrong .slilk-track{animation:slilk-shake .4s}
@keyframes slilk-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
.slilk-head{display:flex;justify-content:space-between;margin-bottom:6px}
.slilk-label{font-size:13px;color:var(--muted,#7a8ba8);font-weight:600}
.slilk-val{font-size:13px;color:var(--accent,#3b82f6);font-weight:700;font-variant-numeric:tabular-nums;min-width:36px;text-align:right}
.slilk-track{position:relative;height:32px;background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);border-radius:8px;cursor:pointer;touch-action:none}
.slilk-fill{position:absolute;top:0;left:0;height:100%;background:var(--accent,#3b82f6);border-radius:8px 0 0 8px;opacity:.3;pointer-events:none;transition:width .05s}
.slilk-thumb{position:absolute;top:50%;width:20px;height:20px;margin:-10px 0 0 -10px;background:var(--bg,#0a0e17);border:3px solid var(--accent,#3b82f6);border-radius:50%;pointer-events:none;transition:left .05s}
.slilk-btn{padding:12px 28px;border:none;border-radius:8px;background:var(--accent,#3b82f6);color:#fff;font-size:14px;font-weight:600;cursor:pointer;align-self:center;letter-spacing:.5px;transition:opacity .2s}
.slilk-btn:active{opacity:.7}
`;
    document.head.appendChild(s);
  }
}
