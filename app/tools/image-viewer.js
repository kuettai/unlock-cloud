/**
 * Image Viewer Tool
 *
 * Shows a pre-defined image. Tap to zoom/fullscreen.
 *
 * Usage:
 *   new ImageViewer(containerEl, {
 *     src: 'assets/diagram.png',
 *     alt: 'Network diagram',
 *   });
 */

class ImageViewer {
  constructor(container, opts = {}) {
    this.container = container;
    this.src = opts.src || '';
    this.alt = opts.alt || 'Image';
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'imgv';

    const img = document.createElement('img');
    img.className = 'imgv-img';
    img.src = this.src;
    img.alt = this.alt;
    img.addEventListener('click', () => this._fullscreen(this.src, this.alt));
    wrap.appendChild(img);

    const hint = document.createElement('div');
    hint.className = 'imgv-hint';
    hint.textContent = 'Tap to enlarge';
    wrap.appendChild(hint);

    this.container.appendChild(wrap);
    this._injectStyles();
  }

  _fullscreen(src, alt) {
    const overlay = document.createElement('div');
    overlay.className = 'imgv-overlay';
    const img = document.createElement('img');
    img.className = 'imgv-full';
    img.src = src;
    img.alt = alt;
    overlay.appendChild(img);
    overlay.addEventListener('click', () => overlay.remove());
    document.body.appendChild(overlay);
  }

  _injectStyles() {
    if (document.getElementById('imgv-css')) return;
    const s = document.createElement('style');
    s.id = 'imgv-css';
    s.textContent = `
.imgv{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 0}
.imgv-img{max-width:100%;border-radius:8px;border:1px solid var(--border,#1e2a45);cursor:pointer;transition:opacity .15s}
.imgv-img:active{opacity:.8}
.imgv-hint{font-size:11px;color:var(--muted,#7a8ba8)}
.imgv-overlay{position:fixed;inset:0;background:rgba(0,0,0,.9);display:flex;align-items:center;justify-content:center;z-index:9999;cursor:pointer;padding:16px}
.imgv-full{max-width:100%;max-height:100%;object-fit:contain;border-radius:8px}
`;
    document.head.appendChild(s);
  }
}
