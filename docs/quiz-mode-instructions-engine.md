# Group Quiz Mode — Engine/Client Engineer Instructions

## Context

We're building a new game mode: a 5-puzzle group quiz session for AWS Cloud and AI Day Hanoi (Sept 29, 2026). The 5 puzzles use existing lock components: **keypad-lock, word-lock, pillar-lock, streak-lock, wager-lock**. This doc covers the client-side/engine changes needed — a separate backend engineer is handling session/voting/assembly server-side.

Reference files:
- `docs/quiz-mode-puzzle-config-example.json` — exact payload shape each lock expects, once the backend delivers it
- `app/puzzle-selection.html` — live interactive samples of all 5 puzzles

## Rule: NO HINTS in this mode

Hard mode-wide rule: **players must find answers through their own knowledge or reasoning — no hint system of any kind should be exposed.** This is the opposite of normal re:Solve episodes (which lean on escalating hints) — quiz mode is sink or swim.

### Per-puzzle hint audit

| Puzzle | Hint mechanism found | Change needed |
|---|---|---|
| keypad-lock | `falseOutputs` — flavor text on wrong attempts, no answer leak | None. Just don't author flavor text that hints at digits (e.g. avoid "Close! First digit is right.") |
| word-lock | One-time UI overlay ("swipe each reel...") on first play, via `localStorage` | **None — this is NOT a hint**, it's an interaction instruction. Keep it; removing it would confuse first-time players about the controls. |
| pillar-lock | None built in | None. Just ensure the resolved `{text, answer}` pair sent by the backend doesn't leak the unpicked side anywhere in the DOM before the player answers. |
| streak-lock | None — generic "Wrong!"/timeout feedback, no answer reveal | None. |
| wager-lock | ⚠️ **Real answer leak** — see below | **Code change required.** |

### wager-lock — required code change

On a wrong answer, the result screen unconditionally reveals the correct answer:
```js
// wager-lock.js, current behavior
<div class="wglk-result-text">${this.correct ? 'Correct!' : `Wrong — answer: ${q.answer}`}</div>
```
This is a direct answer leak on every wrong guess. Fix:

1. Add a constructor option (default `true` to preserve current behavior for other episodes already using this lock):
```js
this.revealAnswerOnWrong = opts.revealAnswerOnWrong !== false; // default true
```
2. Gate the reveal string:
```js
<div class="wglk-result-text">${this.correct ? 'Correct!' : (this.revealAnswerOnWrong ? `Wrong — answer: ${q.answer}` : 'Wrong!')}</div>
```
3. Quiz mode's config passes `revealAnswerOnWrong: false`.

## Brute-force / penalty gap — required code change

The engine already penalizes wrong attempts on 3 of the 5 puzzles via a shared `onFail(msg)` helper in `app/index.js` (does `engine.penalties++` + fires a `penalty` leaderboard event):

**Already correct, no change needed:**
- keypad-lock: `onSubmit(correct) { correct ? onSolve() : onFail('Wrong code. Try again.'); }`
- word-lock: same pattern
- pillar-lock: same pattern

**⚠️ Gap — streak-lock and wager-lock have no penalty hook at all.** Their engine wiring only calls `onSubmit()` on eventual puzzle completion — never on a wrong answer or timeout. A player can get every question wrong repeatedly with zero episode-level penalty; only in-puzzle score is affected internally.

### Fix for wager-lock.js
Call a new `onWrong` option wherever `this.correct` is set to `false` (inside `_selectAnswer`):
```js
if (!this.correct && this.onWrong) this.onWrong('Wrong — try again.');
```
Then in `app/index.js`, add the missing callback to the existing `WagerLock` instantiation:
```js
new WagerLock(mount, {
  target: cfg.target || 10,
  questions: cfg.questions || [],
  stakes: cfg.stakes || [],
  maxRounds: cfg.maxRounds || null,
  onSubmit() { onSolve(); },
  onWrong(msg) { onFail(msg); }   // ADD THIS LINE
});
```

### Fix for streak-lock.js
Call a new `onWrong` option in both the wrong-answer branch of `_answer()` and in `_timeout()`:
```js
// inside _answer(), wrong branch
} else {
  this.lastResult = { type: 'wrong', streak: this.streak };
  this.streak = 0;
  if (this.onWrong) this.onWrong('Wrong answer — streak reset.');
}
// inside _timeout()
this.streak = 0;
this.timedOut = true;
if (this.onWrong) this.onWrong('Time out — streak reset.');
```
Then in `app/index.js`:
```js
new StreakLock(mount, {
  target: cfg.target || 20,
  timePerQuestion: cfg.timePerQuestion || 5,
  questions: cfg.questions || [],
  onSubmit() { onSolve(); },
  onWrong(msg) { onFail(msg); }   // ADD THIS LINE
});
```

Implement both `wager-lock.js` fixes (revealAnswerOnWrong + onWrong) together since they touch the same file.

## Wager-lock stake default — no code change needed

Requirement: skip the Safe/Confident/All-In picker screen entirely, always show 4 answer choices, remove the risk/wager layer for this mode.

**Already supported.** `wager-lock.js` has this built in:
```js
// existing code, ~line 171
if (this.phase === 'wager' && this.stakes.length === 1) {
  this.chosenStake = 0;
  this.phase = 'answer';
}
```
Passing a `stakes` array with exactly **one** entry auto-skips the picker. Quiz mode config:
```json
"stakes": [
  { "label": "Confident", "wager": 1, "penalty": 0, "color": "#eab308", "showOptions": 4 }
]
```
See `docs/quiz-mode-puzzle-config-example.json` for the full working example (already uses this single-entry form + `revealAnswerOnWrong: false` together).

## Summary of required code changes

| File | Change |
|---|---|
| `app/puzzle/wager-lock.js` | Add `revealAnswerOnWrong` option (default `true`), gate the answer-reveal string. Add `onWrong` callback fired when `this.correct` is false. |
| `app/puzzle/streak-lock.js` | Add `onWrong` callback fired on wrong answer AND on timeout. |
| `app/index.js` | Wire the new `onWrong` callbacks to the existing `onFail(msg)` helper for both the `wager-lock` and `streak-lock` instantiation blocks. |

No changes needed to `keypad-lock.js`, `word-lock.js`, or `pillar-lock.js`.

## Other open items to flag/consider

1. streak-lock and wager-lock both shuffle their question pool order internally per client instance — the question POOL sent to all players in a session is identical, but each player's client may present it in a different ORDER. If strict order-sync across players matters for this mode, that would require a new "pre-shuffled, don't reshuffle" flag neither component currently exposes — not built yet, flag if needed.
2. Consider whether a max-wrong-attempts cap (not just a per-wrong penalty) is needed for streak-lock/wager-lock to more strongly discourage brute-forcing, since there's no time pressure elsewhere gating repeated guesses.
