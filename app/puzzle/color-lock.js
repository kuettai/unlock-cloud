/**
 * Color Mix Lock Puzzle
 *
 * 3 RGB sliders that blend a color in real-time. Player matches a target color.
 *
 * Usage:
 *   new ColorLock(containerEl, {
 *     answer: [180, 60, 220],  // target [R, G, B]
 *     tolerance: 15,           // per-channel tolerance (default 15)
 *     onSubmit(correct) { ... }
 *   });
 */

class ColorLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.answer = opts.answer || [128, 128, 128];
    this.tolerance = opts.tolerance || 15;
    this.onSubmit = opts.onSubmit || (() => {});
    this.values = [0, 0, 0];
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'clrlk';

    // Color previews
    const previews = document.createElement('div');
    previews.className = 'clrlk-previews';

    const targetBox = document.createElement('div');
    targetBox.className = 'clrlk-box';
    const targetSwatch = document.createElement('div');
    targetSwatch.className = 'clrlk-swatch';
    targetSwatch.style.background = `rgb(${this.answer.join(',')})`;
    const targetLbl = document.createElement('div');
    targetLbl.className = 'clrlk-lbl';
    targetLbl.textContent = 'Target';
    targetBox.appendChild(targetSwatch);
    targetBox.appendChild(targetLbl);

    const yourBox = document.createElement('div');
    yourBox.className = 'clrlk-box';
    this.yourSwatch = document.createElement('div');
    this.yourSwatch.className = 'clrlk-swatch';
    this.yourSwatch.style.background = 'rgb(0,0,0)';
    const yourLbl = document.createElement('div');
    yourLbl.className = 'clrlk-lbl';
    yourLbl.textContent = 'Yours';
    yourBox.appendChild(this.yourSwatch);
    yourBox.appendChild(yourLbl);

    previews.appendChild(targetBox);
    previews.appendChild(yourBox);
    wrap.appendChild(previews);

    // Sliders
    const channels = ['R', 'G', 'B'];
    const colors = ['#ef4444', '#22c55e', '#3b82f6'];
    this.sliderEls = [];
    channels.forEach((ch, i) => {
      const row = document.createElement('div');
      row.className = 'clrlk-row';
      const lbl = document.createElement('span');
      lbl.className = 'clrlk-ch';
      lbl.style.color = colors[i];
      lbl.textContent = ch;
      const input = document.createElement('input');
      input.type = 'range';
      input.min = 0;
      input.max = 255;
      input.value = 0;
      input.className = 'clrlk-slider';
      input.style.accentColor = colors[i];
      const val = document.createElement('span');
      val.className = 'clrlk-val';
      val.textContent = '0';
      input.addEventListener('input', () => {
        this.values[i] = parseInt(input.value);
        val.textContent = input.value;
        this._updatePreview();
      });
      row.appendChild(lbl);
      row.appendChild(input);
      row.appendChild(val);
      wrap.appendChild(row);
      this.sliderEls.push({ input, val });
    });

    const btn = document.createElement('button');
    btn.className = 'clrlk-btn';
    btn.textContent = 'Activate';
    btn.addEventListener('click', () => this._test());
    wrap.appendChild(btn);

    this.container.appendChild(wrap);
    this._injectStyles();
  }

  _updatePreview() {
    this.yourSwatch.style.background = `rgb(${this.values.join(',')})`;
  }

  _test() {
    const correct = this.values.every((v, i) => Math.abs(v - this.answer[i]) <= this.tolerance);
    if (correct) {
      this.yourSwatch.style.boxShadow = '0 0 16px rgba(34,197,94,.6)';
      this.onSubmit(true);
    } else {
      this.yourSwatch.style.animation = 'clrlk-shake .4s';
      setTimeout(() => this.yourSwatch.style.animation = '', 400);
    }
  }

  reset() {
    this.values = [0, 0, 0];
    this.sliderEls.forEach(el => { el.input.value = 0; el.val.textContent = '0'; });
    this._updatePreview();
  }

  _injectStyles() {
    if (document.getElementById('clrlk-css')) return;
    const s = document.createElement('style');
    s.id = 'clrlk-css';
    s.textContent = `
.clrlk{display:flex;flex-direction:column;align-items:center;gap:14px;padding:16px 0;max-width:320px;margin:0 auto}
.clrlk-previews{display:flex;gap:20px}
.clrlk-box{display:flex;flex-direction:column;align-items:center;gap:6px}
.clrlk-swatch{width:80px;height:80px;border-radius:12px;border:2px solid var(--border,#1e2a45);transition:background .1s}
.clrlk-lbl{font-size:12px;color:var(--muted,#7a8ba8);font-weight:600}
.clrlk-row{display:flex;align-items:center;gap:10px;width:100%}
.clrlk-ch{font-size:14px;font-weight:700;width:16px;text-align:center}
.clrlk-slider{flex:1;height:6px;cursor:pointer}
.clrlk-val{font-size:13px;font-weight:700;color:var(--muted,#7a8ba8);width:30px;text-align:right;font-variant-numeric:tabular-nums}
.clrlk-btn{padding:12px 28px;border:none;border-radius:8px;background:var(--accent,#3b82f6);color:#fff;font-size:14px;font-weight:600;cursor:pointer;letter-spacing:.5px;transition:opacity .2s}
.clrlk-btn:active{opacity:.7}
@keyframes clrlk-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
`;
    document.head.appendChild(s);
  }
}
