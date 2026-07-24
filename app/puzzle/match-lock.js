/**
 * Match Pairs Lock Puzzle
 *
 * Flip-card memory game. Tap two cards to reveal — match pairs to clear them.
 *
 * Usage:
 *   new MatchLock(containerEl, {
 *     pairs: [
 *       ['S3', 'Storage'],
 *       ['EC2', 'Compute'],
 *       ['IAM', 'Identity'],
 *       ['VPC', 'Network'],
 *     ],
 *     cols: 4,  // grid columns (default 4)
 *     onSubmit(correct) { ... }
 *   });
 */

class MatchLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.pairs = opts.pairs || [];
    this.cols = opts.cols || 4;
    this.revealed = opts.revealed || false;
    this.faceUp = opts.faceUp || false; // All cards always visible — no memory, just match pairs by clicking
    this.onSubmit = opts.onSubmit || (() => {});
    this.cards = this._buildCards();
    this.flipped = [];
    this.matched = new Set();
    this.busy = false;
    this._render();
  }

  _buildCards() {
    const cards = [];
    this.pairs.forEach(([a, b], i) => {
      cards.push({ text: a, pairId: i });
      cards.push({ text: b, pairId: i });
    });
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'mtchlk';

    this.grid = document.createElement('div');
    this.grid.className = 'mtchlk-grid';
    this.grid.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;

    this.cellEls = [];
    this.cards.forEach((card, i) => {
      const el = document.createElement('div');
      el.className = 'mtchlk-card';
      el.dataset.idx = i;

      const inner = document.createElement('div');
      inner.className = 'mtchlk-inner';
      const front = document.createElement('div');
      front.className = 'mtchlk-front';
      front.textContent = '?';
      const back = document.createElement('div');
      back.className = 'mtchlk-back';
      back.textContent = card.text;
      inner.appendChild(front);
      inner.appendChild(back);
      el.appendChild(inner);

      el.addEventListener('click', () => this._flip(i));
      this.grid.appendChild(el);
      this.cellEls.push(el);
      if (this.revealed || this.faceUp) el.classList.add('mtchlk-flipped');
    });

    wrap.appendChild(this.grid);
    this.container.appendChild(wrap);
    this._injectStyles();
  }

  _flip(i) {
    if (this.busy) return;
    if (this.matched.has(i)) return;
    if (this.flipped.includes(i)) {
      // Deselect on second tap
      this.cellEls[i].classList.remove('mtchlk-selected');
      this.flipped = this.flipped.filter(x => x !== i);
      return;
    }

    this.cellEls[i].classList.add('mtchlk-flipped');
    if (this.faceUp) this.cellEls[i].classList.add('mtchlk-selected');
    this.flipped.push(i);

    if (this.flipped.length === 2) {
      this.busy = true;
      const [a, b] = this.flipped;
      if (this.cards[a].pairId === this.cards[b].pairId) {
        this.matched.add(a);
        this.matched.add(b);
        this.cellEls[a].classList.add('mtchlk-matched');
        this.cellEls[b].classList.add('mtchlk-matched');
        this.cellEls[a].classList.remove('mtchlk-selected');
        this.cellEls[b].classList.remove('mtchlk-selected');
        this.flipped = [];
        this.busy = false;
        if (this.matched.size === this.cards.length) {
          setTimeout(() => this.onSubmit(true), 400);
        }
      } else {
        setTimeout(() => {
          if (!this.faceUp) {
            this.cellEls[a].classList.remove('mtchlk-flipped');
            this.cellEls[b].classList.remove('mtchlk-flipped');
          }
          this.cellEls[a].classList.remove('mtchlk-selected');
          this.cellEls[b].classList.remove('mtchlk-selected');
          this.flipped = [];
          this.busy = false;
        }, 800);
      }
    }
  }

  reset() {
    this.cards = this._buildCards();
    this.flipped = [];
    this.matched = new Set();
    this.busy = false;
    this._render();
  }

  _injectStyles() {
    if (document.getElementById('mtchlk-css')) return;
    const s = document.createElement('style');
    s.id = 'mtchlk-css';
    s.textContent = `
.mtchlk{padding:16px 0}
.mtchlk-grid{display:grid;gap:6px;max-width:340px;margin:0 auto}
.mtchlk-card{aspect-ratio:1;perspective:400px;cursor:pointer}
.mtchlk-inner{position:relative;width:100%;height:100%;transition:transform .4s;transform-style:preserve-3d}
.mtchlk-flipped .mtchlk-inner{transform:rotateY(180deg)}
.mtchlk-front,.mtchlk-back{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;border-radius:8px;font-size:13px;font-weight:700;backface-visibility:hidden;-webkit-backface-visibility:hidden}
.mtchlk-front{background:var(--surface,#141b2d);border:2px solid var(--border,#1e2a45);color:var(--muted,#7a8ba8)}
.mtchlk-back{background:var(--accent,#3b82f6);border:2px solid var(--accent,#3b82f6);color:#fff;transform:rotateY(180deg);padding:4px;text-align:center;word-break:break-word;font-size:11px}
.mtchlk-matched .mtchlk-back{background:var(--green,#22c55e);border-color:var(--green,#22c55e)}
.mtchlk-selected .mtchlk-back{border-color:#fff;box-shadow:0 0 0 4px rgba(255,255,255,.8);transform:rotateY(180deg) scale(1.08);background:#22c55e}
`;
    document.head.appendChild(s);
  }
}
