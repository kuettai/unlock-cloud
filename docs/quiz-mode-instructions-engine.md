# Group Quiz Mode — Engine/Client Engineer Instructions

## Context

We're building a new game mode: a 5-puzzle group quiz session for AWS Cloud and AI Day Hanoi (Sept 29, 2026). The 5 puzzles use existing lock components: **keypad-lock, word-lock, pillar-lock, spelling-lock, wager-lock**. This doc covers the client-side/engine changes needed — a separate backend engineer is handling session/voting/assembly server-side.

**Note:** an earlier draft of this lineup used streak-lock instead of spelling-lock. streak-lock was dropped because it and wager-lock were both "MCQ pool building toward a score target," which felt redundant across two of five puzzle slots in one session. spelling-lock was chosen as the replacement because it's a genuinely distinct mechanic from word-lock: word-lock uses per-position reels with random unrelated decoy letters (recall-and-select), while spelling-lock gives the player the exact letters of the answer, already shuffled, and asks them to rearrange them into order (recall-and-order) — no decoy ambiguity, no typo risk, good fit for competitive scoring.

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
| spelling-lock | None — wrong spelling just clears the current attempt and calls `onWrong('Wrong spelling. Try again.')`, no letter-position feedback, no answer reveal | None. |
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

The engine already penalizes wrong attempts on 4 of the 5 puzzles via a shared `onFail(msg)` helper in `app/index.js` (does `engine.penalties++` + fires a `penalty` leaderboard event):

**Already correct, no change needed:**
- keypad-lock: `onSubmit(correct) { correct ? onSolve() : onFail('Wrong code. Try again.'); }`
- word-lock: same pattern
- pillar-lock: same pattern
- spelling-lock: already exposes `onWrong(msg)` fired on every wrong spelling attempt (see `_check()` in `spelling-lock.js`) — just needs to be wired to `onFail` in `index.js` the same way the other three are, if not already. Confirm this wiring exists; if the component isn't yet instantiated anywhere in `index.js`, add it following the same `onWrong(msg) { onFail(msg); }` pattern as keypad/word/pillar.

**⚠️ Gap — wager-lock has no penalty hook at all.** Its engine wiring only calls `onSubmit()` on eventual puzzle completion — never on a wrong answer. A player can get every question wrong repeatedly with zero episode-level penalty; only in-puzzle score is affected internally.

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

Implement this together with the `revealAnswerOnWrong` fix above since they touch the same file.

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

## spelling-lock content constraint — corrected, and now backed by a dedicated bank array

**Correction to an earlier draft of this doc:** I originally wrote that multi-word answers (e.g. "Kiro Power") were "not recommended" for spelling-lock because spaces get stripped, producing one confusing continuous anagram. That was wrong — re-reading `_render()` closely: it iterates the word including spaces and renders a visible `<div class="splk-space">` gap in the slot layout for each space character, so the UI *does* show separate word-groups. `_buildPool()` only strips spaces from the internal shuffled *letter* pool (the player never needs to place a "space" tile), but the answer slots visually preserve word boundaries. **Multi-word answers work fine and are explicitly supported** — no need to restrict to single words.

Given that, the question bank (`docs/quiz-mode-question-bank.json`) now has a **dedicated `spelling` array per category** (54 entries total, added 2026-08-25), separate from the `word` array, so the backend doesn't need to filter or validate anything at request time — every entry in `spelling` is already guaranteed safe (letters and spaces only, 5-16 letters excluding spaces). Just pull directly from `spelling` for this puzzle slot, not from `word`.

One category (`aws-core-services`) needed newly-authored `spelling` entries since every one of its `word` entries is a bare acronym or contains symbols/digits (e.g. "EC2", "S3") — its `spelling` array uses real AWS service names already referenced elsewhere in that category's own content (DynamoDB, CloudFront, CloudWatch, CloudTrail, Redshift, Lambda, Aurora, Glacier, Athena, Direct Connect).

## spelling-lock word length constraint — already applied when the bank's `spelling` array was built

The component has **no built-in length validation** — it will happily accept a 2-letter or 25-letter word/phrase. Both extremes are bad for this mode:
- **Too short (3-4 letters):** trivial to solve without engaging the anagram mechanic at all.
- **Too long (17+ letters total):** becomes a tedious slog rather than a fun puzzle, especially on the small mobile screen the pool is designed for (`.splk-wrap{max-width:420px}`).

This rule (5-16 total letters excluding spaces) has already been applied when curating the bank's `spelling` array — no further filtering needed on the backend side for this specific concern.

## spelling-lock hardcoded title — needs a code change

`spelling-lock.js` has a hardcoded header string in `_render()`:
```js
// spelling-lock.js, current behavior (line ~68)
<div class="splk-count">TODAY'S SPECIALS (${this.current + 1}/${this.words.length})</div>
```
This is leftover theming from the component's original café/menu-board use case (matches the `theme: "chalkboard"` config seen in `scenarios/bible-jesus-miracles/ep2-153-fish/puzzles.json`) and doesn't fit an AWS trivia quiz mode — "Today's Specials" makes no sense when spelling terms like "TANGENT" or "MEMORY". Fix:

1. Add a `title` constructor option with the current string as the default (to avoid breaking the existing café episode that already uses this component):
```js
this.title = opts.config?.title || opts.title || "TODAY'S SPECIALS";
```
2. Use it in the render:
```js
<div class="splk-count">${this.title} (${this.current + 1}/${this.words.length})</div>
```
3. Quiz mode's config passes something generic, e.g. `title: "SPELL IT OUT"` or similar — not café-themed. Exact wording is a content/copy decision, not something to hardcode in the fix itself.

## Summary of required code changes

| File | Change |
|---|---|
| `app/puzzle/wager-lock.js` | Add `revealAnswerOnWrong` option (default `true`), gate the answer-reveal string. Add `onWrong` callback fired when `this.correct` is false. |
| `app/puzzle/spelling-lock.js` | Add a `title` config option (default `"TODAY'S SPECIALS"` for backward compatibility), replace the hardcoded header string with it. |
| `app/index.js` | Wire the new `onWrong` callback to the existing `onFail(msg)` helper for the `wager-lock` instantiation block. Confirm `spelling-lock`'s existing `onWrong` is also wired the same way if not already present. Pass through the new `title` config option if `spelling-lock` isn't already forwarding all config fields. |

No changes needed to `keypad-lock.js`, `word-lock.js`, or `pillar-lock.js`.

## Other open items to flag/consider

1. wager-lock shuffles its question pool order internally per client instance — the question POOL sent to all players in a session is identical, but each player's client may present it in a different ORDER. If strict order-sync across players matters for this mode, that would require a new "pre-shuffled, don't reshuffle" flag the component doesn't currently expose — not built yet, flag if needed. (spelling-lock does not have this concern — it draws a fixed `pickCount` from the pool once per instance, no reshuffle-on-loop.)
2. Consider whether a max-wrong-attempts cap (not just a per-wrong penalty) is needed for wager-lock to more strongly discourage brute-forcing, since there's no time pressure gating repeated guesses in that puzzle specifically.
