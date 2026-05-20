/**
 * Streak Lock Puzzle
 *
 * A sequence of rapid-fire micro-challenges. Answering quickly builds a
 * streak multiplier. Breaking the streak (wrong answer or timeout) resets it.
 * Points = base × streak multiplier. Reach the target to unlock.
 *
 * The faster you go, the more you earn — but one mistake and you're back to 1×.
 *
 * Inspired by Hades boon chains / Guitar Hero streaks / combo systems.
 *
 * Usage:
 *   new StreakLock(containerEl, {
 *     target: 20,
 *     timePerQuestion: 5,  // seconds before timeout
 *     questions: [
 *       { question: '2 + 2 = ?', answer: '4', decoys: ['3', '5', '6'] },
 *       ...
 *     ],
 *     onSubmit(correct) { ... }
 *   });
 */

class StreakLock {
  constructor(container, opts = {}) {
    this.container = container;
    this.target = opts.target || 20;
    this.timePerQuestion = opts.timePerQuestion || 5;
    this.questions = opts.questions || [];
    this.onSubmit = opts.onSubmit || (() => {});

    this._init();
  }

  _init() {
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.round = 0;
    this.won = false;
    this.timedOut = false;
    this.lastResult = null;
    this._shuffled = this._shuffle([...this.questions]);
    this._timeLeft = this.timePerQuestion;
    this._startTimer();
    this._render();
  }

  _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  _startTimer() {
    this._stopTimer();
    this._timeLeft = this.timePerQuestion;
    this._timer = setInterval(() => {
      this._timeLeft -= 0.1;
      this._updateTimerDisplay();
      if (this._timeLeft <= 0) {
        this._timeout();
      }
    }, 100);
  }

  _stopTimer() {
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
  }

  _updateTimerDisplay() {
    const bar = this.container.querySelector('.stlk-timer-fill');
    if (bar) {
      const pct = Math.max(0, (this._timeLeft / this.timePerQuestion) * 100);
      bar.style.width = `${pct}%`;
      if (pct < 30) bar.style.background = 'var(--red,#ef4444)';
      else if (pct < 60) bar.style.background = '#eab308';
      else bar.style.background = 'var(--green,#22c55e)';
    }
  }

  _timeout() {
    this._stopTimer();
    this.streak = 0;
    this.timedOut = true;
    this.lastResult = { type: 'timeout' };
    this._render();
    setTimeout(() => {
      this.timedOut = false;
      this._nextQuestion();
    }, 1200);
  }

  _answer(choice) {
    if (this.won || this.timedOut) return;
    this._stopTimer();

    const q = this._shuffled[this.round % this._shuffled.length];
    const correct = choice === q.answer;

    if (correct) {
      this.streak++;
      if (this.streak > this.maxStreak) this.maxStreak = this.streak;
      const points = this.streak; // multiplier IS the streak
      this.score += points;
      this.lastResult = { type: 'correct', points, streak: this.streak };

      if (this.score >= this.target) {
        this.won = true;
        this._render();
        setTimeout(() => this.onSubmit(true), 600);
        return;
      }
    } else {
      this.lastResult = { type: 'wrong', streak: this.streak };
      this.streak = 0;
    }

    this._render();
    setTimeout(() => this._nextQuestion(), correct ? 600 : 1200);
  }

  _nextQuestion() {
    this.round++;
    if (this.round >= this._shuffled.length) {
      this._shuffled = this._shuffle([...this.questions]);
      this.round = 0;
    }
    this.lastResult = null;
    this.timedOut = false;
    this._startTimer();
    this._render();
  }

  reset() {
    this._stopTimer();
    this._init();
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'stlk';

    // Score + streak
    const header = document.createElement('div');
    header.className = 'stlk-header';
    const pct = Math.min(100, (this.score / this.target) * 100);
    header.innerHTML = `
      <div class="stlk-score-bar"><div class="stlk-score-fill" style="width:${pct}%"></div></div>
      <div class="stlk-stats">
        <span>Score: <strong>${this.score}</strong>/${this.target}</span>
        <span class="stlk-streak ${this.streak >= 3 ? 'stlk-streak-hot' : ''}">
          🔥 ×${this.streak}${this.streak >= 3 ? ' COMBO' : ''}
        </span>
      </div>`;
    wrap.appendChild(header);

    if (this.won) {
      const res = document.createElement('div');
      res.className = 'stlk-result stlk-win';
      res.innerHTML = `Target reached!<br><span style="font-size:12px;color:var(--muted)">Max streak: ×${this.maxStreak}</span>`;
      wrap.appendChild(res);
      this.container.appendChild(wrap);
      this._injectStyles();
      return;
    }

    // Timer bar
    const timerWrap = document.createElement('div');
    timerWrap.className = 'stlk-timer';
    timerWrap.innerHTML = `<div class="stlk-timer-fill" style="width:${(this._timeLeft / this.timePerQuestion) * 100}%"></div>`;
    wrap.appendChild(timerWrap);

    // Last result feedback
    if (this.lastResult) {
      const fb = document.createElement('div');
      fb.className = 'stlk-feedback';
      if (this.lastResult.type === 'correct') {
        fb.classList.add('stlk-fb-correct');
        fb.textContent = `+${this.lastResult.points} (×${this.lastResult.streak})`;
      } else if (this.lastResult.type === 'wrong') {
        fb.classList.add('stlk-fb-wrong');
        fb.textContent = this.lastResult.streak > 0 ? `Streak lost! (was ×${this.lastResult.streak})` : 'Wrong!';
      } else {
        fb.classList.add('stlk-fb-wrong');
        fb.textContent = '⏰ Time\'s up!';
      }
      wrap.appendChild(fb);
    }

    // Question
    if (!this.timedOut) {
      const q = this._shuffled[this.round % this._shuffled.length];
      const qEl = document.createElement('div');
      qEl.className = 'stlk-question';
      qEl.textContent = q.question;
      wrap.appendChild(qEl);

      // Options
      const allOpts = this._shuffle([q.answer, ...q.decoys]);
      const opts = document.createElement('div');
      opts.className = 'stlk-options';
      allOpts.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'stlk-option';
        btn.textContent = opt;
        btn.addEventListener('click', () => this._answer(opt));
        opts.appendChild(btn);
      });
      wrap.appendChild(opts);
    }

    this.container.appendChild(wrap);
    this._injectStyles();
  }

  _injectStyles() {
    if (document.getElementById('stlk-css')) return;
    const s = document.createElement('style'); s.id = 'stlk-css';
    s.textContent = `
.stlk{display:flex;flex-direction:column;gap:10px;padding:16px 0;max-width:420px;margin:0 auto}
.stlk-header{display:flex;flex-direction:column;gap:6px}
.stlk-score-bar{width:100%;height:8px;background:var(--surface,#141b2d);border-radius:4px;overflow:hidden;border:1px solid var(--border,#1e2a45)}
.stlk-score-fill{height:100%;background:var(--green,#22c55e);transition:width .3s;border-radius:4px}
.stlk-stats{display:flex;justify-content:space-between;font-size:12px;color:var(--muted,#7a8ba8)}
.stlk-stats strong{color:var(--text,#e0e6f0)}
.stlk-streak{font-weight:600;transition:all .2s}
.stlk-streak-hot{color:#f97316;font-size:14px;animation:stlk-pulse .5s infinite alternate}
@keyframes stlk-pulse{0%{transform:scale(1)}100%{transform:scale(1.1)}}
.stlk-timer{width:100%;height:5px;background:var(--surface,#141b2d);border-radius:3px;overflow:hidden}
.stlk-timer-fill{height:100%;background:var(--green,#22c55e);transition:width .1s linear;border-radius:3px}
.stlk-feedback{text-align:center;font-size:16px;font-weight:700;padding:8px;border-radius:6px;animation:stlk-pop .3s ease-out}
@keyframes stlk-pop{0%{transform:scale(.8);opacity:0}100%{transform:scale(1);opacity:1}}
.stlk-fb-correct{color:var(--green,#22c55e);background:rgba(34,197,94,.1)}
.stlk-fb-wrong{color:var(--red,#ef4444);background:rgba(239,68,68,.1)}
.stlk-question{text-align:center;font-size:18px;font-weight:700;color:var(--text,#e0e6f0);padding:20px 16px;background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);border-radius:10px}
.stlk-options{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.stlk-option{padding:14px;background:var(--bg,#0a0e17);border:2px solid var(--border,#1e2a45);border-radius:8px;color:var(--text,#e0e6f0);font-size:14px;font-weight:600;cursor:pointer;text-align:center;transition:all .1s}
.stlk-option:hover{border-color:var(--accent,#3b82f6)}
.stlk-option:active{transform:scale(.95);background:rgba(59,130,246,.1)}
.stlk-result{text-align:center;padding:20px;border-radius:10px;font-size:16px;font-weight:700}
.stlk-win{color:var(--green,#22c55e);background:rgba(34,197,94,.15)}
`;
    document.head.appendChild(s);
  }
}
