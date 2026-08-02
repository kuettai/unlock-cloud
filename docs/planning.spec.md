# Planning Spec — Episode Restructure for Multi-Contributor Scale

Status: draft · Owner: maintainers · Target: complete before external contributors fork

## Goal

Let many people build episodes in parallel without touching shared engine files, and cut
the reading load that players are complaining about.

Three independent workstreams:

| ID | Workstream | Fixes |
|----|-----------|-------|
| A | Puzzle decoupling | New puzzle types require edits to 3 shared files |
| B | Theme layers | Episodes can't restyle without editing `app/index.css` |
| C | Text budget | Forced reading exceeds the session clock in 2 episodes |
| D | Governance | Nothing enforces the "don't touch core" rule |

## Non-goals

- Rewriting the engine, introducing a build step, or adopting a framework
- Changing the 9-file episode schema
- Migrating existing episodes' content wholesale (C is applied per-episode, opportunistically)
- Multiplayer/leaderboard changes

---

## Current state (measured, not assumed)

Verified by reading the files on 2026-08-02:

**Coupling points.** Adding one puzzle type today requires edits to:
1. `app/index.html` — one `<script src="puzzle/x-lock.js?v=4">` tag (62 present)
2. `app/index.js` — one branch in the `puzzle.ui === '...'` chain (69 branches, lines 982–1607)
3. `tools/puzzle-tester.html` — manual registration

**Already decoupled (do not "fix").** All 75 components in `app/puzzle/` self-inject their
own stylesheet via the pattern below, and none reference classes from `index.css`.
`index.css` contains zero episode-specific rules.

```js
if (document.getElementById('speclk-css')) return;
const s = document.createElement('style');
s.id = 'speclk-css';
```

**Reading load.** Forced reading = discovery modals + narrative segments + room unlock text +
event messages + learning cards + the one puzzle title shown. Rate 130 wpm (mobile, mostly
non-native readers, technical jargon, timer running). Ranking is rate-independent.

| Episode | Clock | Forced words | Reading min | % of clock |
|---|---:|---:|---:|---:|
| ep6-the-bolt | 15 | 2281 | 17.5 | **117%** |
| ep0.5-cloud-onboarding | 10 | 1472 | 11.3 | **113%** |
| ep2-day-one | 60 | 5356 | 41.2 | 69% |
| ep7-macet | 45 | 3063 | 23.6 | 52% |
| ep8-macet | 45 | 2325 | 17.9 | 40% |
| ep4-spec-architect | 40 | 1611 | 12.4 | 31% |
| ep1-awakening | 60 | 1702 | 13.1 | 22% |

Card discovery modals are **65–88% of forced reading in every episode** (ep2: 4384/5356).
Narrative and event text are rounding errors. On-demand text (hints, NPC branches) is not
a problem — the player opted in.

**Unused capability.** `short_description` is already honored at `app/index.js:1625` and is
used in exactly one episode (`ep0-boot-sequence`, one occurrence). `app/index.js:886` — the
other popup path — ignores it.

**Governance.** No `.github/`, no CI, no `CODEOWNERS`. `project.md` says "NEVER modify
`app/index.js`" with nothing enforcing it.

---

## Workstream A — Puzzle decoupling

### A1. Puzzle registry with legacy fallback

Each component registers itself; `index.js` does one generic lookup. Config-mapping code
moves out of the shared file into the file that owns those parameters.

```js
// end of app/puzzle/spec-lock.js
window.PuzzleRegistry = window.PuzzleRegistry || {};
window.PuzzleRegistry['spec-lock'] = (mount, cfg, api) => new SpecLock(mount, {
  rounds: cfg.rounds || [],
  cliName: cfg.cliName || 'kiro',
  onSubmit(ok) { ok ? api.solve() : api.fail('Spec incomplete.'); }
});
```

```js
// app/index.js — replaces the head of the else-if chain
const factory = window.PuzzleRegistry?.[puzzle.ui];
if (factory) factory(mount, cfg, { solve: onSolve, fail: onFail, engine });
else if (puzzle.ui === 'sequence-lock') { /* ...existing 69 branches unchanged... */ }
```

The `api` object is the frozen contract. Start with `{ solve, fail, engine }`; add fields
only additively.

Migration is incremental — convert branches at will, unconverted ones keep working.

**Done when:** registry path works for ≥1 puzzle, all existing episodes play unchanged.

### A2. Convention-based lazy loading

On first use of an unregistered `ui`, inject the script and retry. Resolution order:

```
scenarios/<cat>/<ep>/puzzles/<ui>.js   episode-private (checked first)
app/puzzle/<ui>.js                      shared library
app/tools/<ui>.js                       tool-type UIs (hex-decoder, base64-decoder)
```

`ui` values already match filenames 1:1 — no renaming needed. Cache-bust from `app/VERSION`
instead of the hand-maintained `?v=4` repeated 62 times.

Side benefit: episodes stop downloading all 62 puzzle scripts. `ep0-boot-sequence` uses a
handful.

**Done when:** `index.html` has zero `puzzle/*.js` tags and every episode still loads.

### A3. Episode-private puzzles

The first resolution path is the real unlock: contributors build experimental locks inside
`scenarios/<cat>/<ep>/puzzles/` with no shared-library PR and no review burden. Promote to
`app/puzzle/` + `docs/puzzle-taxonomy.json` when a type proves reusable.

### A4. Registry-driven puzzle tester

`tools/puzzle-tester.html` enumerates `window.PuzzleRegistry` instead of hardcoding
instantiation. Retires common-mistake #10 in `project.md`.

---

## Workstream B — Theme layers

### B1. Cascade

Precedence falls out of load order; no JS precedence logic.

```
app/index.css                              general (core-owned)
scenarios/<cat>/theme.css                  category layer (optional)
scenarios/<cat>/<ep>/theme.css             episode layer (optional)
```

Declared in data, not probed, to avoid speculative 404s and to keep it reviewable:

```json
// scenarios/<cat>/index.json      → { "theme": "theme.css", "episodes": [...] }
// scenarios/<cat>/<ep>/meta.json  → { "theme": "theme.css", ... }
```

### B2. Override on `:root`, not `#app`

`index.css` has `html,body{background:var(--bg)}`. `body` is not a descendant of `#app`, so
overriding vars on `#app` recolors the app chrome but leaves the page background. Theme
files must target `:root` — equal specificity, later file wins, inherits everywhere.

Most themes are then just:

```css
:root{ --bg:#120c0c; --surface:#241616; --accent:#f97316; --border:#3a2020; }
```

### B3. Loader

```js
async function loadThemeLayers(scenarioBase, categoryMeta, episodeMeta) {
  const catBase = scenarioBase.replace(/\/[^/]+$/, '');
  const layers = [
    categoryMeta.theme && `${catBase}/${categoryMeta.theme}`,
    episodeMeta.theme  && `${scenarioBase}/${episodeMeta.theme}`,
  ].filter(Boolean);

  await Promise.all(layers.map(href => new Promise(resolve => {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = `${href}?v=${APP_VERSION}`;
    l.onload = l.onerror = resolve;   // a broken theme degrades, never hangs
    document.head.appendChild(l);
  })));
}
```

Await before revealing the intro screen or the cover flashes default colors and repaints.
`url()` inside a theme resolves relative to the stylesheet, so `url(assets/rooms/vault.png)`
works with no base-path juggling even though scenarios are served from CloudFront.

### B4. Prerequisite: de-inline `index.html`

Inline `style=` attributes beat every external stylesheet regardless of load order, so these
are currently un-themeable without `!important`: `#guest-badge`, `#timer` (visibility),
`#history-panel`, `#lang-toggle-container`, `#player-name-input`, `#waiting-state`,
`#end-message`, `#tools-top` and its `h3`, `#tools-list`, the "Back to Episodes" button, and
the Kiro credit line.

Unrelated bug found while auditing: `<div id="narrative-panel" id="narrative-panel">` has a
duplicate `id` attribute. Harmless today, worth fixing in the same pass.

Migrate them to classes in `index.css`. Mechanical, invisible to episodes, and it's what
makes the theme layer honest rather than half-working.

### B5. Guardrails

- Category layer: custom properties only — it affects other people's episodes, review like core
- Episode layer: free-form, contributor-owned
- Set `#app[data-episode="<id>"]` for optional narrow overrides; don't *require* the prefix
- Feed `categories.json` `color` into `--accent` so a category only needs `theme.css` for more than a palette
- Keep documenting the self-injecting `<style id="<prefix>-css">` pattern as mandatory for puzzles, with a unique prefix per lock

---

## Workstream C — Text budget

### C1. Adopt `short_description` (no engine change)

Every card gets `short_description` ≤15 words for the modal; `description` stays full for the
inspect view. Estimated to roughly halve forced reading. Additive JSON only.

Patch `app/index.js:886` to use the same `short_description ||` fallback as line 1625.

### C2. Progressive disclosure

Modal shows `short_description` with a "More ▾" toggle revealing the full `description`.
Depth becomes opt-in, nothing is deleted, and it makes C1 safe even where authors over-trim.
Highest payoff per effort of the engine-side changes.

### C3. Stop blocking on low-value discoveries

Items and objects surface as a passive toast; reserve the blocking modal for lore and story
beats. Batch simultaneous reveals — a room revealing 3 cards currently fires 3 sequential
modals.

### C4. Authoring rules

- If the generated art conveys it, don't write it. (ep8 card 204 narrates its own illustration.)
- Forced modal text = what you got + one line on why it matters.
- Push the "why" into lore, which is already opt-in and already worth 3 points each.
  Benchmark: ep8 at 31 words/lore card vs ep6 at 73.
- Every word written is a word to translate. `ep8-macet/locales/id.json` is 45 KB.

### C5. Budget gate

Extend `tools/validate-progression.js`:

- warn: `short_description` > 15 words
- warn: card has no `short_description` and `description` > 25 words
- fail: total forced reading > 40 words per minute of `duration_minutes` (≈30% of clock)

Promote the measurement script to `tools/text-budget.js` so the number is trackable.
Add a matching criterion to `docs/episode-review-rubric.md`. Today only `ep1-awakening` (22%)
and `filing-frenzy` (25%) would pass a 25% target.

### C6. Remediation order

`ep6-the-bolt` and `ep0.5-cloud-onboarding` first — both exceed 100% of clock. Then
`ep2-day-one` (5356 words, the largest absolute offender), then `ep7`/`ep8`.

---

## Workstream D — Governance

- `CODEOWNERS` on `app/index.js`, `app/index.css`, `app/index.html`, `app/engine.js`
- CI check: fail any PR touching those paths without a `core-change` label
- CI check: a PR touches only one `scenarios/<cat>/<ep>/` folder plus that category's `index.json`
- CI: run `node tools/validate-progression.js` on changed episodes + `npm test`
- Validator: assert every `ui` in `puzzles.json` resolves to a file in one of A2's three paths

---

## Sequencing

```
B4 de-inline ──┐
               ├─→ B1/B2/B3 theme layers ──┐
A1 registry ───┼─→ A2 lazy load ─→ A3 ─→ A4 │
               │                            ├─→ D governance gates
C1 short_desc ─┴─→ C2 disclosure ─→ C3      │
                   C5 budget gate ──────────┘
```

A1, B4, and C1 are independent and can run in parallel. D lands last so the gates describe
the end state. C6 remediation is per-episode and can run any time after C1.

**A1 and B4 must land before external contributors fork.** Both touch the file everyone
depends on; doing them after ten forks exist means ten rebases.

## Acceptance criteria

| ID | Criterion | Verified by |
|----|-----------|-------------|
| A1 | Registry path mounts a puzzle; all episodes unchanged | `npm test`, `npm run test:e2e` |
| A2 | Zero `puzzle/*.js` tags in `index.html`; all episodes load | Playwright across every episode |
| A3 | An episode-private lock loads from the scenario folder | New fixture episode |
| B1 | Episode theme overrides category, category overrides base | Manual + screenshot diff |
| B3 | Missing/broken theme degrades to base, no hang | Deliberate 404 |
| B4 | No inline `style=` on themeable shell elements | grep `index.html` |
| C1 | All cards have `short_description`; forced reading halves | `tools/text-budget.js` |
| C5 | Validator fails an over-budget episode | Fixture with padded text |
| D | PR touching `app/index.js` without a label fails | Test PR |

## Risks

| Risk | Mitigation |
|---|---|
| Registry refactor breaks an episode silently | Keep the 69-branch fallback; migrate incrementally; E2E per episode |
| Lazy loading introduces a race before first paint | Await injection in `mountPuzzle`; loading state in the popup |
| Contributed CSS breaks the shell | Blast radius is that episode only (one episode loads per session) |
| Over-trimmed `short_description` loses meaning | C2 "More" toggle preserves full text |
| Theme files 404 in production (CloudFront) | Declared in data, `onerror` resolves to base theme |

## Open decisions

1. **`ep7-macet` vs `ep8-macet`** — both registered and live. Does ep8 supersede ep7? If so,
   unregister ep7 rather than offering two versions of the same story.
2. **`categories.json` says aws has 9 episodes; `index.json` lists 10.** One is stale.
3. **Challenge mode** — no episode except ep4 defines variants. Keep it as an `N/A` rubric
   row, or drop the criterion?
4. **`api` contract scope** — is `{ solve, fail, engine }` enough, or do components need
   `t()` for locale lookups at registration time?
5. **Text budget target** — 30% of clock as a hard fail, or start as warn-only for one release?

## Reference

- Worked example: `ep8-macet` scores 67/75 on the current rubric. Main deductions are 4×
  `word-lock` (violates the no-repeat rule in `project.md`), inverted hint tiers, no false
  outputs on word-locks, and 3 mandatory puzzles missing `triggered_events`
  (`wordlock-bolts`, `triage-lanes`, `wordlock-ship`). Card 206 is orphaned — that's the
  validator's 52/53.
- Existing gates: `node tools/validate-progression.js <episode>`, `npm test`,
  `npm run test:e2e`, rubric ≥70/78 per `.kiro/skills/episode-review/SKILL.md`.
