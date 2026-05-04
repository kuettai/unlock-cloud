/**
 * Word Combination Lock Puzzle
 *
 * Rolling reel UI for 3–6 letter words. Each reel shows the correct letter
 * mixed with 5 random decoy letters (6 per reel), shuffled.
 *
 * Usage:
 *   const lock = new WordLock(containerEl, {
 *     answer: 'SHOUT',
 *     onSubmit(word, correct) { ... }
 *   });
 *   lock.reset();
 */

class WordLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.answer = opts.alphabet ? (opts.answer || '') : (opts.answer || '').toUpperCase();
    this.alphabet = opts.alphabet || null;
    this.onSubmit = opts.onSubmit || (() => {});
    this.reelChars = this._buildReels();
    this.selected = new Array(this.answer.length).fill(0);
    this._render();
  }

  /* ── Build reel character sets ──────────────────── */

  _buildReels() {
    const ALPHA = this.alphabet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const pool = [...ALPHA];
    return [...this.answer].map(ch => {
      const decoys = new Set();
      while (decoys.size < Math.min(5, pool.length - 1)) {
        const r = pool[Math.floor(Math.random() * pool.length)];
        if (r !== ch && !decoys.has(r)) decoys.add(r);
      }
      const chars = [ch, ...decoys];
      // Shuffle
      for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
      }
      return chars;
    });
  }

  /* ── Render ─────────────────────────────────────── */

  _render() {
    this.container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'wlock';

    const reels = document.createElement('div');
    reels.className = 'wlock-reels';
    this.reelEls = [];
    for (let i = 0; i < this.answer.length; i++) {
      const reel = this._createReel(i);
      reels.appendChild(reel);
      this.reelEls.push(reel);
    }
    wrapper.appendChild(reels);

    const btn = document.createElement('button');
    btn.className = 'wlock-submit';
    btn.textContent = 'Unlock';
    btn.addEventListener('click', () => {
      const word = this.getWord();
      this.onSubmit(word, word === this.answer);
    });
    wrapper.appendChild(btn);

    this.container.appendChild(wrapper);
    this._injectStyles();
  }

  _createReel(index) {
    const chars = this.reelChars[index];
    const CELL_H = 52;
    const COUNT = chars.length; // 6

    const reel = document.createElement('div');
    reel.className = 'wlock-reel';
    reel.style.height = `${CELL_H * 3}px`; // show 3 rows: prev, current, next

    const strip = document.createElement('div');
    strip.className = 'wlock-strip';
    // 3 copies for seamless wrap
    for (let pass = 0; pass < 3; pass++) {
      for (const ch of chars) {
        const cell = document.createElement('div');
        cell.className = 'wlock-cell';
        cell.style.height = `${CELL_H}px`;
        cell.textContent = ch;
        strip.appendChild(cell);
      }
    }
    reel.appendChild(strip);

    // Highlight window
    const win = document.createElement('div');
    win.className = 'wlock-window';
    win.style.top = `${CELL_H}px`;
    win.style.height = `${CELL_H}px`;
    reel.appendChild(win);

    // Fades
    const fadeTop = document.createElement('div');
    fadeTop.className = 'wlock-fade wlock-fade-top';
    fadeTop.style.height = `${CELL_H}px`;
    reel.appendChild(fadeTop);
    const fadeBot = document.createElement('div');
    fadeBot.className = 'wlock-fade wlock-fade-bot';
    fadeBot.style.height = `${CELL_H}px`;
    reel.appendChild(fadeBot);

    this._attachDrag(reel, strip, index, COUNT, CELL_H);
    requestAnimationFrame(() => {
      const target = -(COUNT + this.selected[index] - 1) * CELL_H;
      strip.style.transform = `translateY(${target}px)`;
    });

    return reel;
  }

  /* ── Drag / Touch ───────────────────────────────── */

  _attachDrag(reel, strip, index, count, CELL_H) {
    let dragging = false, startY = 0, startOffset = 0, currentOffset = 0;
    let velocity = 0, lastY = 0, lastTime = 0, animFrame = null;

    const getY = (e) => (e.touches ? e.touches[0].clientY : e.clientY);

    const onStart = (e) => {
      dragging = true;
      startY = getY(e);
      startOffset = currentOffset;
      velocity = 0;
      lastY = startY;
      lastTime = Date.now();
      if (animFrame) cancelAnimationFrame(animFrame);
      reel.classList.add('wlock-dragging');
    };

    const onMove = (e) => {
      if (!dragging) return;
      e.preventDefault();
      const y = getY(e);
      const now = Date.now();
      const dt = now - lastTime;
      if (dt > 0) velocity = (y - lastY) / dt;
      lastY = y;
      lastTime = now;
      currentOffset = startOffset + (y - startY);
      strip.style.transform = `translateY(${currentOffset}px)`;
    };

    const onEnd = () => {
      if (!dragging) return;
      dragging = false;
      reel.classList.remove('wlock-dragging');
      const decel = () => {
        if (Math.abs(velocity) < 0.01) { snap(); return; }
        velocity *= 0.92;
        currentOffset += velocity * 16;
        strip.style.transform = `translateY(${currentOffset}px)`;
        animFrame = requestAnimationFrame(decel);
      };
      decel();
    };

    const snap = () => {
      let idx = Math.round(-currentOffset / CELL_H) + 1;
      idx = ((idx % count) + count) % count;
      this.selected[index] = idx;
      const target = -(count + idx - 1) * CELL_H;
      currentOffset = target;
      strip.style.transition = 'transform 0.2s ease-out';
      strip.style.transform = `translateY(${target}px)`;
      setTimeout(() => { strip.style.transition = ''; }, 200);
    };

    reel.addEventListener('mousedown', onStart);
    reel.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchend', onEnd);

    strip._snap = () => { currentOffset = 0; snap(); };
  }

  /* ── Public API ─────────────────────────────────── */

  getWord() {
    return this.selected.map((si, i) => this.reelChars[i][si]).join('');
  }

  reset() {
    this.selected = new Array(this.answer.length).fill(0);
    this.reelEls.forEach(reel => {
      const strip = reel.querySelector('.wlock-strip');
      if (strip._snap) strip._snap();
    });
  }

  /* ── Styles ─────────────────────────────────────── */

  _injectStyles() {
    if (document.getElementById('wlock-css')) return;
    const s = document.createElement('style');
    s.id = 'wlock-css';
    s.textContent = `
.wlock{display:flex;flex-direction:column;align-items:center;gap:16px;padding:16px 0}
.wlock-reels{display:flex;gap:6px}
.wlock-reel{position:relative;width:48px;overflow:hidden;border-radius:10px;background:#0d1220;border:1px solid var(--border,#1e2a45);cursor:grab;user-select:none;-webkit-user-select:none}
.wlock-reel.wlock-dragging{cursor:grabbing}
.wlock-strip{display:flex;flex-direction:column;will-change:transform}
.wlock-cell{display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;color:var(--muted,#7a8ba8);letter-spacing:1px}
.wlock-window{position:absolute;left:0;right:0;border-top:2px solid var(--accent,#3b82f6);border-bottom:2px solid var(--accent,#3b82f6);pointer-events:none;z-index:2}
.wlock-fade{position:absolute;left:0;right:0;pointer-events:none;z-index:1}
.wlock-fade-top{top:0;background:linear-gradient(to bottom,var(--bg,#0a0e17) 30%,transparent)}
.wlock-fade-bot{bottom:0;background:linear-gradient(to top,var(--bg,#0a0e17) 30%,transparent)}
.wlock-submit{padding:12px 32px;border:none;border-radius:8px;background:var(--accent,#3b82f6);color:#fff;font-size:15px;font-weight:600;cursor:pointer;transition:opacity .2s;letter-spacing:.5px}
.wlock-submit:active{opacity:.7}
`;
    document.head.appendChild(s);
  }
}
