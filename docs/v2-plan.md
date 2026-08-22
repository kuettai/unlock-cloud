# re:Solve v2 — Restructure & Extensibility Plan

> **Status:** all 12 decisions locked (§12). **Ready to fan out** — §24.4 is the confidence audit; 9 of 10 gaps closed, the tenth is external (backend, §9). ~171 disjoint parallel nodes verified against a ~12-node serial spine (§22.5).
> **Shape:** **total rebuild, total cutover.** Not an incremental migration — no back-compat shims, no aliases, no dual-write windows. Long downtime is acceptable and assumed. v1 and v2 never run side by side.
> **Scope:** rebuild the engine/app layer and directory structure. Explicitly *not* rebuilt: the 9-file episode JSON schema, which 13 shipped episodes and the whole `.kiro` authoring pipeline target.
> **Origin:** expands the original scrappy v1 notes (directory reshuffle + hook concept). Every claim below is checked against the actual v1 code, with file:line refs.
> **The audit found 15 live production bugs plus 4 data-integrity defects** — 2 structural (§2.1), 13 from line-by-line reads of `index.js`, `engine.js`, all 75 `app/puzzle/*.js`, `admin.html`, `guide.html`, and `home.js` (§13.4). Plus one data drift (§2.3). **Three are hard crashes**; `aws/ep8-macet` has two of them and zero test coverage — not a coincidence (§17).
> **Two findings change scope beyond a restructure:** `aws/ep4-spec-architect` scores `NaN` and always shows 1 star, and **nine `scoring.json` fields are read by zero lines of code** — 12 of 15 episodes declare a lore-bonus system that does nothing. The scoring model in the data is substantially fictional. Decide whether v2 implements it or the data drops it (§13.4 bugs 7 and 9).
> **Backend coordination required** — see §9.
> **Read §20 first if you are picking this up cold.** It lists what to re-verify, what not to assume, and the sequence rules. §13 maps every episode to the hooks it needs; §14 gives every path in the repo an explicit v2 fate.
> **To execute:** §21 is the per-unit build→test→validate→feedback contract; §22 is the dependency graph with parallel groups and gates, ready to become a `GRAPH_SPEC`. All 12 decisions in §12 are closed — the graph has no blocked root. Start at G0 (`scoring-engine`, §23).

---

## 1. Why v2

The codebase serves two audiences with one set of files, and the contract between them is a README warning rather than a structural boundary:

- **Core maintainers** need `app/index.js` (2283 lines) and `app/engine.js` (704 lines) stable across every fork.
- **Episode/category authors** have no sanctioned customization surface. Anything behavioral or visual — a category-branded header, a custom hint UI, a per-category scoring screen — requires editing shared core, which `project.md` forbids ("NEVER modify `app/index.js`").

That contradiction has already been resolved the wrong way, in shipped code:

```js
// app/index.js:2154 — inside showEndScreen(), shared by every episode
const _usedAidlc = engine.solvedPuzzles.has('ctx-aidlc')
  || engine.solvedPuzzles.has('wordlock-bolts')
  || (engine.unlockedRooms || []).includes(600);
```

Two `ep8-macet` puzzle IDs (`ctx-aidlc`, `wordlock-bolts` — both live in `scenarios/aws/ep8-macet/puzzles.json`) plus a magic room number, hardcoded in the end screen every episode shares.

**And the room number is worse than a leak — it's a latent cross-episode bug.** `card_id: 600` is not unique to ep8: `aws/ep2-day-one`, `aws/ep3-kings-errand`, `aws/ep5-quick-bites`, and `aws/ep7-macet` all define a room 600 too. Today the damage is masked — the branch resolves to `_s.image` either way when `image_manual` is absent, and only ep8 defines `image_manual` — but the moment any of those four episodes adds an `image_manual` ending variant, it silently gets ep8's ending-image logic. That's the failure mode this whole rebuild is meant to make structurally impossible.

Similar leaks: `renderLearningRecap()` uses `aidlc-recap` element/CSS IDs (`app/index.js:259-275`) for a feature only `ep8-macet` uses; `home.js:12` clears `cafe_order_state` — a localStorage key owned by one puzzle (`app/puzzle/cafe-order-lock.js:35`) used by exactly one episode in a *different category* (`bible-jesus-miracles/ep2-153-fish`) — and `app/index.js:1963` removes the same key by hand. Full inventory in §13.

**v2's thesis: customization must happen by composition (hooks + overlay files), so core stays generic and episode-specific behavior stays local to the episode.**

---

## 2. Pain points in v1, with evidence

### 2.1 Puzzle loading is a hardcoded manifest that has already drifted out of sync

`app/index.html:145-204` hardcodes 60 `<script src="puzzle/*.js">` tags. `app/puzzle/` contains **75** files. There is no dynamic loading anywhere (`grep "createElement('script')\|import(" app/index.js` → no matches). So the load list is manually maintained, and it has drifted:

| Symptom | Count | Detail |
| --- | --- | --- |
| Puzzle files never loaded | 15 | `alarm-lock az-lock binary-lock cidr-lock color-lock cost-lock dns-lock grid-org-lock lifecycle-lock query-lock tag-lock task-lock terminal-lock traffic-lane-lock waf-lock` |
| Dispatch branches no episode uses | 7 | `arch-lock deduction-grid-lock key-lock pipe-lock rank-lock slider-lock word_lock` |
| Distinct `ui` values across all episodes | 58 | vs. 65 `puzzle.ui === '...'` branches in `showPuzzlePopup` |

**Two of the drifted entries are live bugs:**

1. **`ep8-macet` is broken.** It uses `ui: "traffic-lane-lock"`; the dispatch branch exists (`app/index.js:1195` → `new TrafficLaneLock(...)`); the file exists (`app/puzzle/traffic-lane-lock.js`); but `app/index.html` never loads it → `ReferenceError: TrafficLaneLock is not defined` at puzzle-open time. This is the most recently shipped episode (HEAD commit `84cf024 EP8 kt`). **Must be fixed** — this episode carries forward to v2.
2. **`ep7-macet` has a silent softlock.** `puzzles.json:295` declares `ui: "4digits-lock"`. The script *is* loaded (`index.html:151`), but there is **no dispatch branch** for it, and the `if/else if` chain has **no final `else` fallback** (`app/index.js:1608`). Result: `mount` stays empty, the popup opens blank, and since the puzzle gates progression the player is stuck with no error message. **Moot** — `ep7-macet` is being deleted (§7), it's a superseded duplicate of `ep8-macet`. Kept in this doc as evidence of the failure mode, not as a bug to fix.

Neither bug is caught by anything: `tools/validate-progression.js` validates the room/card reachability graph but never checks that a puzzle's `ui` value resolves to a dispatch branch *and* a loaded script. **Two independent silent-failure classes from one hand-maintained mapping** — this is the strongest argument for §5's registry.

> **These are bugs 1 and 2 of 6.** The line-by-line read in §13.4 found four more: a call to a method that doesn't exist (`engine.addPenalty`), zero voice audio files despite the feature being documented, a puzzle that forks the reward path and silently skips four steps, and another episode's card ID hardcoded in the engine. Read §13.4 before starting — three of the six live in episodes with no test coverage at all.

### 2.2 The puzzle dispatch is a ~670-line `if/else if` chain inside core

`showPuzzlePopup()` spans `app/index.js:937-1610` — 65 sequential `else if (puzzle.ui === '...')` branches, each hand-wiring one lock's constructor args. Adding a puzzle type means editing shared core (violating the "don't touch index.js" rule) in *two* places (`index.js` dispatch + `index.html` script tag), and forgetting either produces the two failure modes above. Some branches don't even delegate: `terminal-lock` is implemented inline as ~60 lines of manual DOM construction (`app/index.js:1029-1090`) **and** has an unused `app/puzzle/terminal-lock.js` file — two implementations, one dead.

The lock classes themselves are already uniform and registry-ready: `class WordLock` (`word-lock.js:15`), `class CidrLock` (`cidr-lock.js:17`), `class AlarmLock` (`alarm-lock.js:18`) — all `new Klass(mount, config)` with callbacks. The chain is boilerplate, not necessary complexity.

### 2.3 Hand-maintained registries are merge-conflict magnets, and already drifted

`scenarios/categories.json` hardcodes `"episodes": 9` for `aws`, but `scenarios/aws/index.json` lists **10** episodes. The count is stale because it's hand-entered instead of derived. Both files are shared, so every new category or episode PR touches a file every other PR touches.

### 2.4 `app/tools/` is dead code — confirmed, delete it

`app/tools/` holds 7 modules (`aws-glossary, base64-decoder, binary-converter, cipher-wheel, freq-analyzer, hex-decoder, image-viewer`). Verified reachability:

- `app/index.html` loads **zero** of them; `app/index.js` references **none** of their class names.
- The only consumer is `app/tools-test.html:53-59` — a standalone dev harness, not part of the game.
- `app/guide.html` is the facilitator answer sheet, not a tutorial, and does not use them.
- They are **duplicated** where they matter: `app/puzzle/base64-decoder.js` is the live version wired into the puzzle dispatch (`app/index.js` `base64-decoder` branch); `app/tools/base64-decoder.js` is a redundant twin. `tools/puzzle-tester.html:1251` implements its own `mountHexDecoder()` rather than using `app/tools/hex-decoder.js`.

**Decision: delete `app/tools/` in v2.** Also delete `app/tools-test.html` (its only consumer) and correct `README.md:48`, which advertises "tools/ — In-game tools (decoders, cipher wheel, etc.)" as a shipped feature it isn't. If a future episode wants an in-game decoder, it belongs in `apps/puzzle/` (where `base64-decoder` already lives and works) or in a category's `lib/puzzle/` — not a parallel directory with its own loading story.

### 2.5 Core-hardcoded config that categories will want to change

- `ROLE_META` (`app/index.js:123-126`) hardcodes exactly three lanes (builder/planner/strategist) with AWS-flavored copy ("Developer, DevOps, SRE"). `bible-jesus-miracles` and `corporate` categories have no business with these labels, but can't change them without editing core.
- `home.js:140` hardcodes `'Built by Kiro'` branding + a ghost animation in the shared home shell.
- `home.js:52-54` and `app/index.js:24` hardcode the production domain `https://beta.re-solve.cloud/scenarios` as the non-localhost asset base.
- `app/index.js:22` hardcodes `'../scenarios/aws/ep0-boot-sequence'` as the fallback episode.

### 2.6 Naming doesn't match the data model

`scenarios/` actually holds *categories*, each holding *episodes*. And `scenarios/aws/` sorts as `ep0, ep0.5, ep1, ep2...` only by luck of string comparison — `ep0.5-cloud-onboarding` landing between `ep0` and `ep1` is coincidence, not design.

### 2.7 The one thing that already works: locale overlays

`engine.js:86-131` opt-in-loads `locales/index.json`, `engine.js:135` (`applyLocale`) fetches `locales/<lang>.json`, and `engine.t(type, id, field)` returns the overlay value or `null` so callers fall back to base English. Two episodes use it (`ep6-the-bolt`, `ep8-macet`). **This is the proven pattern v2 generalizes** from "text overlay" to "behavior + style + component overlay." v2 should not replace it — it should look like it.

---

## 3. Proposed Directory Structure

```
apps/                              (was app/) — core engine. Structurally read-only for authors.
    engine.js                      Game state machine, scoring, save/restore, leaderboard client
    index.html / index.js          Game shell
    index.css
    home.{html,js,css}             Category/episode browser
    hooks.js                       NEW — hook registry + resolution (§4)
    registry.js                    NEW — puzzle/tool type registry (§5)
    puzzle/                        Base puzzle lock library
    version.js                     NEW — generated at deploy; single cache-bust stamp (§8)
                                   (app/tools/ is DELETED — see §2.4)

categories/                        (was scenarios/)
    categories.json                GENERATED — never hand-edited (§6)
    aws/
        meta.json                  NEW — this category's title/subtitle/icon/color/description
        index.json                 Episode list (unchanged)
        lib/                       Category-level overlay (all optional)
            hooks.js                Hook implementations for every episode in this category
            style.css               Appended after apps/index.css
            puzzle/<type>.js        Shadows apps/puzzle/<type>.js for this category
        01-boot-sequence/          (was ep0-boot-sequence/ — §7)
            meta.json  cards.json  rooms.json  puzzles.json
            combinations.json  narrative.json  events.json
            scoring.json  image-style.json          ← schema UNCHANGED
            assets/                                 ← unchanged, optional
            locales/                                ← unchanged, optional
            lib/                   Episode-level overlay — identical shape to category lib/
                hooks.js
                style.css
                puzzle/<type>.js
        02-cloud-onboarding/
        ...
    bible-jesus-miracles/          same shape
    corporate/                     same shape
```

Design decisions:

- **`apps/` is a hard boundary, not a README warning.** A CI check that rejects any PR touching `apps/**` (unless labeled `core-change`) enforces mechanically what `project.md` currently asks politely. This is only viable *because* hooks + overlays give authors a real alternative — today the rule is unenforceable because there's no other way to customize.
- **`lib/` is one overlay contract at two altitudes.** Same shape at category and episode level; episode layers over category layers over `apps/`. One mental model for hooks, CSS, puzzles, and tools.
- **Episode JSON schema is frozen.** `meta/cards/rooms/puzzles/combinations/narrative/events/scoring/image-style.json` keep their exact current shape, so `tools/validate-progression.js`, the episode-review rubric, and every `.kiro` authoring agent keep working untouched.

---

## 4. Hook System

### 4.1 Registration and precedence

Each `lib/hooks.js` registers into a global registry:

```js
ReSolveHooks.register('endScreenExtraFn', (ctx) => { /* ... */ });
```

Resolution order: **episode `lib/hooks.js` → category `lib/hooks.js` → `apps/` default (no-op)**. An episode overrides its category; a category overrides the engine default; neither needs to know the other exists.

`ctx` should carry the engine instance plus hook-specific payload, so a hook can read game state (`ctx.engine.solvedPuzzles`) without core exporting globals — this is what makes the `_usedAidlc` leak (§1) expressible as an episode-local hook.

### 4.2 Hook catalog

Grouped by lifecycle. **Tier A** = implement at v2 launch (each one absorbs a known v1 leak or hardcode). **Tier B** = declared in the catalog but stubbed as no-ops; wire the call site when someone actually needs it. Splitting tiers keeps launch scope sane without leaving the catalog looking arbitrary later.

Every row with a file:line reference is replacing code that exists today. Rows without one are anticipated needs — those are the ones most likely to be wrong, which is why §4.3's escape hatches matter more than getting this table perfect.

#### Home / catalog

| Hook | Tier | Fires at | Replaces / enables |
| --- | --- | --- | --- |
| `preHomeLoadFn` | A | `home.js:57` before `categories.json` fetch | Custom loading screen, analytics ping |
| `postHomeLoadFn` | A | `home.js:60` after categories render | Banner injection, category reordering |
| `homeHeaderFn` | A | `home.js:64` header render | Unhardcodes `'Built by Kiro'` (`home.js:140`) |
| `homeBgFn` | A | home background | The ghost-wander animation (`home.js:149-163`) becomes opt-in, not core |
| `homeFooterFn` | B | home footer | Sponsor/credit block per deployment |
| `categoryCardFn` | B | `home.js:67-76` per category card | Custom category tile layout |
| `episodeCardFn` | A | `home.js:102-123` per episode card | Badges/tags beyond difficulty/duration/players |
| `episodeSortFn` | B | `home.js:99` `sort((a,b) => a.episode - b.episode)` | Non-numeric ordering (recommended-first, difficulty-ascending) |
| `resumeBadgeFn` | A | `home.js:104-105` | Keys off `utc_${m.id}`, which must match `engine.js:465` by hand — one hook makes the coupling explicit |
| `gateScreenFn` | B | `home.js:25-40` QR/`game_id` gate | Alternate entry flows (SSO, event code, open access) |

#### Episode load

| Hook | Tier | Fires at | Replaces / enables |
| --- | --- | --- | --- |
| `preEpisodeLoadFn` | A | `engine.load()` `engine.js:43` | Loading screen, prefetch |
| `episodeDataFn` | A | after all 8 JSON fetches resolve, before first render | **The general-purpose escape hatch.** Mutate loaded `cards`/`rooms`/`puzzles`/`scoring` in memory. Most "I need a hook for X" requests can be served here instead of adding a named hook. |
| `postEpisodeLoadFn` | A | end of `engine.load()` | Post-load setup |
| `assetUrlFn` | B | every `${ASSET_BASE}/...` construction | Per-category CDN, WebP/AVIF negotiation, offline bundling. Currently the prod domain is hardcoded in two places (`index.js:24`, `home.js:52`) |
| `localeListFn` | B | `engine.js:96` locale index load | Category-wide locales instead of per-episode `locales/index.json` |

#### Intro / onboarding

| Hook | Tier | Fires at | Replaces / enables |
| --- | --- | --- | --- |
| `introScreenFn` | A | `renderIntro()` `index.js:420` | Per-category intro layout |
| `roleConfigFn` | A | `ROLE_META` `index.js:123` | Categories define their own lanes, or none. Today `bible-jesus-miracles` inherits "Developer, DevOps, SRE" |
| `roleChooserFn` | B | `renderRoleChooser()` `index.js:176` | Custom lane-picker UI |
| `narrativeSegmentFn` | B | `renderNarrativeText()` `index.js:326` | Per-segment styling, speaker attribution |
| `voiceFileFn` | B | `playVoice()` `index.js:293` | Voice pack selection, TTS fallback when audio is missing |

#### Gameplay

| Hook | Tier | Fires at | Replaces / enables |
| --- | --- | --- | --- |
| `episodeBackgroundFn` | A | `applyEpisodeBackground()` `index.js:246` | Today: `meta.background` + one fixed gradient. Hook allows video/parallax/animation |
| `preRoomEnterFn` | A | `renderGame()` `index.js:597` | Room transition, per-room ambience |
| `postRoomRenderFn` | A | end of `renderGame()` | Overlay UI, per-room decoration |
| `roomHeaderFn` | B | room header render | Category-styled room titles |
| `cardRenderFn` | B | `renderCard()` `index.js:709` | Custom card art/layout per type |
| `discoveryOrderFn` | B | `buildDiscoveryHtml()` `index.js:731` | Override discovery ordering — the "lore before puzzles" design rule in `project.md` is currently enforced by author discipline, not code |
| `combineValidateFn` | B | `doCombine()` `index.js:852` | Custom combination rules beyond `combinations.json` pairs |
| `eventPopupFn` | B | `showEventPopup()` `index.js:878` | Custom event card presentation |
| `timerRenderFn` | B | `updateTimer()` `index.js:567` | Alternate timer display |
| `timerThresholdFn` | B | `updateTimer()` | Category-defined warning thresholds and their visual treatment |
| `sfxFn` | B | `SFX` `index.js:100` | Per-category sound packs; today all tones are hardcoded oscillator calls |
| `toastFn` | B | `showToast()` `index.js:2129` | Custom notification styling |

#### Puzzle

| Hook | Tier | Fires at | Replaces / enables |
| --- | --- | --- | --- |
| `puzzleConfigFn` | A | `getPuzzleConfig()` `engine.js:143` / `resolveRoleCfg()` `index.js:132` | Mutate config before mount. **Role-variant resolution should become an implementation of this hook rather than core behavior** — it's currently a string-suffix convention (`_builder`/`_planner`/`_strategist`) baked into core |
| `prePuzzleOpenFn` | B | `showPuzzlePopup()` `index.js:937` | Framing text, pre-puzzle cutscene |
| `puzzleMountFn` | B | before registry mount | Fully custom mount, bypassing the registry for one puzzle |
| `puzzleSuccessFn` | A | `onSolve()` `index.js:952` | Custom success animation/sound beyond `SFX.solve()` |
| `puzzleFailFn` | A | `onFail()` `index.js:975` | Custom penalty messaging and penalty weight |
| `puzzleHintFn` | A | `usePuzzleHint()` `index.js:2010` | Category-specific hint copy |
| `roomHintFn` | A | `useHint()` `index.js:2019` | Also lets a category change the "first unsolved puzzle" selection heuristic |
| `hintCostFn` | B | `engine.getHint()` `engine.js:343` | Category-defined hint economy (free hints, escalating cost, hint budget) |
| `learningCardFn` | A | `showLearningCard()` `index.js:194` | Today one fixed 3s-lockout design for every category |
| `puzzleClosedFn` | B | `closePuzzlePopup()` `index.js:1663` | Cleanup, abandonment telemetry |

#### Scoring / end

| Hook | Tier | Fires at | Replaces / enables |
| --- | --- | --- | --- |
| `scoreCalcFn` | **A** | `engine.getScore()` `engine.js:374` | **Required by §23.3** — `aws/ep8-macet`'s path-dependent `all_lore_bonus` (`lore_bonus_aidlc_required` vs `lore_bonus_manual_required`) can't be scored generically, because core doesn't know which route the player took. The hook puts that determination in the same file as `endImageFn`, which needs the identical signal |
| `starThresholdFn` | B | `engine.getScore()` | Dynamic star thresholds (player count, difficulty) |
| `endImageFn` | A | `showEndScreen()` `index.js:2148-2160` | **Directly replaces the `_usedAidlc` hardcode at :2154.** `ep8-macet` (→ `09-macet`) picks its own ending image from its own `lib/hooks.js`, and the room-600 collision (§1) stops being possible |
| `preScoringScreenFn` | A | `showEndScreen()` `index.js:2136` | Pre-render injection |
| `scoreTableFn` | A | `index.js:2223` | Category-specific score rows |
| `loreRecapFn` | B | `index.js:2243-2258` | Today hardcoded "Memory Fragments" card grid |
| `endMapFn` | B | `renderEndNode()` `index.js:2262` | Alternate map rendering; the box-drawing ASCII tree is baked into core |
| `endScreenExtraFn` | A | `renderLearningRecap()` `index.js:258` | Moves the AIDLC recap out of core into the owning episode's `lib/hooks.js`; `aidlc-recap` stops being a global element ID |
| `postScoringScreenFn` | A | after end screen renders | Next-episode CTA, sponsor message, share button |

#### Persistence / telemetry

| Hook | Tier | Fires at | Replaces / enables |
| --- | --- | --- | --- |
| `saveStateFn` / `restoreStateFn` | B | `engine.js:464` / `engine.js:496` | Extra state a category's custom hooks need persisted across resume |
| `leaderboardPayloadFn` | B | `LeaderboardClient.push()` `engine.js:600` | Category-specific event payload enrichment |
| `analyticsFn` | B | alongside `_historyLog()` `index.js:64` | Pluggable analytics without touching core |

**Tier A total: ~22.** Tier B is declared-but-stubbed, so adding one later is a call-site edit in `apps/`, not a design change.

### 4.3 Extensibility — authors add capability without waiting for core

A fixed hook list will always be incomplete; §4.2's Tier B rows are guesses. Three mechanisms so an author who needs something uncatalogued isn't blocked on a core PR:

#### (a) Event bus — subscribe to any state change

The engine emits every state transition as a namespaced event. Authors subscribe instead of requesting a hook:

```js
ReSolveHooks.on('puzzle:solved', ({ puzzleId, engine }) => { /* ... */ });
ReSolveHooks.on('room:entered', ({ roomId }) => { /* ... */ });
ReSolveHooks.on('card:revealed', ({ cardId }) => { /* ... */ });
ReSolveHooks.on('*', (name, payload) => { /* firehose, for debugging */ });
```

Proposed event set, all from existing `engine.js` state transitions: `episode:loaded`, `game:started`, `room:entered`, `card:revealed`, `card:discovered`, `card:consumed`, `combination:tried`, `combination:succeeded`, `puzzle:opened`, `puzzle:solved`, `puzzle:failed`, `hint:used`, `penalty:applied`, `event:triggered`, `timer:tick`, `timer:expired`, `game:finished`, `state:saved`, `state:restored`.

**Hooks vs. events — the distinction matters:** a hook can *change* what happens (return a value core uses); an event is read-only notification. Anything observational (analytics, sound, extra UI, achievement tracking) should be an event subscription, because events are cheap to add and can't break core. Reserve hooks for genuine behavior override. Most "can I get a hook for X" requests are actually event subscriptions.

#### (b) Render slots — inject UI without a hook per location

Many customizations are just "put something here." Core declares named mount points; authors fill them:

```html
<div data-slot="end-screen-top"></div>
```
```js
ReSolveHooks.slot('end-screen-top', () => '<div>...</div>');
```

Proposed slots: `home-header`, `home-footer`, `home-above-categories`, `intro-top`, `intro-bottom`, `room-header`, `room-footer`, `puzzle-above`, `puzzle-below`, `end-screen-top`, `end-above-score`, `end-bottom`. One mechanism covers a whole class of future requests, and adding a slot is one line of HTML in `apps/` rather than a hook plus a call site plus a default.

#### (c) Author-declared hooks — namespaced, category-owned

A category can declare hook points for its own episodes, so shared category logic is extensible by its episodes without core involvement:

```js
// categories/aws/lib/hooks.js
ReSolveHooks.declare('aws:serviceIconFn');                 // must be prefixed
ReSolveHooks.fire('aws:serviceIconFn', { service: 'ec2' }); // category code fires it
```
```js
// categories/aws/09-macet/lib/hooks.js
ReSolveHooks.register('aws:serviceIconFn', ({ service }) => customIcons[service]);
```

Rules: names **must** carry a `<category>:` prefix (unprefixed namespace belongs to core, so core can add hooks later without colliding); `register()` on an undeclared unprefixed name is an error, not a silent no-op — that catches typos, which are otherwise invisible in a registry keyed by string.

#### (d) Registry introspection — make the contract discoverable

`ReSolveHooks.list()` returns every hook and slot with its tier, who registered it, and whether it's currently wired. Without this, a string-keyed registry is undebuggable — an author with a typo'd hook name gets silence. Pair it with a dev-only console warning on registration of an unknown name (§4.5's localhost hard-fail rule covers this).

### 4.4 Override semantics by asset type

| Asset | Merge behavior | Why |
| --- | --- | --- |
| `lib/hooks.js` | **Append**, run most-specific-first until one short-circuits (returns non-`undefined`) | Mirrors how `engine.t()` already falls through overlay → base (`engine.js:132`). Lets a category *add* behavior without silently deleting the engine default. |
| `lib/style.css` | **Append into a named cascade layer** — see the correction below. "Loaded after `apps/index.css`" is **not sufficient** | See §4.4a. Source order does not win against runtime-injected `<style>` blocks, and 85% of this app's CSS is runtime-injected. |
| `lib/puzzle/<type>.js` | **Overwrite** — same filename fully shadows `apps/puzzle/<type>.js` | A category may need a restyled or retuned variant of a shared lock without forking the library. Filename-based shadowing is explicit and greppable. |

### 4.4a CORRECTION — the CSS overlay design as first drafted does not work

An earlier draft said category/episode CSS would win by being "loaded after `apps/index.css`," and estimated the cleanup as "migrate ~15 inline blobs." **Both were wrong.** Measured:

| Where the CSS lives | Volume |
| --- | --- |
| `app/index.css` (a real stylesheet) | 25,552 chars |
| **Injected from JS into `document.head` by all 75 `app/puzzle/*.js` components** | **148,893 chars** |
| Plus 3 injected blocks in `index.js` (`role-bar-css`, `learn-card-css`, `aidlc-recap-css`) and 51 inline `style=`/`cssText` sites | — |

**~85% of this application's CSS is injected at runtime**, appended to the end of `<head>` when a puzzle mounts. A stylesheet declared in the HTML — including any `lib/style.css` — appears *earlier* in the cascade, so at equal specificity **the component always wins**. Overlay CSS would appear to work in testing (against `index.css` rules) and silently fail against every puzzle component.

Two facts that make this fixable cheaply, both verified:

- **Zero style-tag ID collisions** across all 75 components. Each guards its injection with a unique `id`.
- **Zero components inject without an ID**, so nothing re-injects on re-mount.

The 75 components are individually well-behaved. The problem is purely cascade position.

#### Recommended fix: CSS cascade layers

Rather than extracting 148KB of CSS out of 75 files, declare layer order once and wrap the injected blocks:

```css
/* apps/index.css — first rule in the file */
@layer base, components, category, episode;
```
```js
// each apps/puzzle/*.js — wrap its existing CSS, unchanged
s.textContent = '@layer components {' + existingCss + '}';
```
```css
/* categories/<cat>/lib/style.css */
@layer category { /* ... */ }
/* categories/<cat>/<ep>/lib/style.css */
@layer episode { /* ... */ }
```

Layer order beats both source order and specificity, so overlays win regardless of when a component injects. Cost: one wrapping change per component — mechanical, and **75 independent single-file edits, i.e. an ideal parallel fan-out group** (§22). Compare with extracting 148KB by hand, which is neither cheap nor parallel-safe.

Caveat to confirm: `@layer` requires Safari 15.4+ (March 2022). This is a mobile-first app, so check the minimum iOS target before committing. If it's unacceptable, the fallback is extraction — much more expensive.

The 51 inline `style=`/`cssText` sites are a separate problem that layers do **not** solve: inline styles beat every layer. Those must be extracted, and that work is real (`index.js:780` even embeds `engine.penaltySeconds += 15` inside an `onclick` attribute).

### 4.5 Error isolation

A throwing hook **degrades to the engine default in production, hard-fails loudly on localhost.** Reuse the host check already present at `app/index.js:24` and `app/home.js:4`:

- `localhost` / `127.0.0.1` → let it throw, plus a console error naming the hook and the file that registered it. Authors find their bugs immediately.
- Anywhere else → catch, log, fall through to the next handler in the chain (ultimately the `apps/` no-op default). A broken category hook must never take down a booth session mid-game.

The asymmetry is deliberate: hiding errors from authors is how you get silent breakage like §2.1's blank-popup softlock; showing them to players at an event is worse.

---

## 5. Puzzle Registry + Per-Episode Loading

This is the fix for §2.1 and §2.2, and the highest-value change in v2.

**Replace** the 65-branch `if/else if` chain and the 60 hardcoded `<script>` tags **with** a registry keyed on `ui` type:

```js
// apps/registry.js — one entry per lock type, replacing one else-if branch
ReSolveRegistry.puzzle('wire-lock', {
  file: 'wire-lock.js',
  klass: 'WireLock',
  map: (cfg, cb) => ({
    wires: cfg.wires, sockets: cfg.sockets, solution: cfg.solution,
    submitLabel: cfg.submitLabel, falseOutputs: cfg.falseOutputs || [],
    onSubmit: cb.solve, onWrong: cb.fail,
  }),
});
```

Load flow per episode:

1. Read `puzzles.json`, collect distinct `ui` values (already declared — no new schema).
2. For each, resolve the file by the same precedence as hooks: episode `lib/puzzle/<type>.js` → category `lib/puzzle/<type>.js` → `apps/puzzle/<type>.js`.
3. Inject only those scripts. An episode using 15 types loads 15 files, not 60.
4. **Unknown `ui` → loud failure**, not a blank popup. Console error + visible in-game message naming the missing type.

Wins beyond performance:

- Adding a puzzle type = one registry entry, and (with a category-level `lib/puzzle/`) authors can add types **without touching `apps/` at all** — which is what makes the §3 CI boundary enforceable.
- Both live bugs in §2.1 become impossible: type-to-file mapping is declared once, not maintained in two places.
- **Extend `tools/validate-progression.js`** to assert every `ui` in `puzzles.json` resolves to a registry entry. That single check would have caught both §2.1 failures before merge. Cheap, and it becomes part of the §11 step 7 verification gate.

`apps/tools/` does **not** get a registry — it gets deleted (§2.4). The registry covers `apps/puzzle/` only.

---

## 6. Killing hand-maintained `categories.json`

The v1 notes asked "how do we eliminate this and make it dynamic." Decided approach:

1. Each category owns `categories/<category>/meta.json` with the fields currently duplicated into the shared array (`title, subtitle, icon, color, description`).
2. **Drop the hand-entered `episodes` count** — derive it from `index.json` length. This kills the existing 9-vs-10 drift (§2.3) permanently.
3. `categories/categories.json` becomes a **build-time generated artifact**.

### Decision: build-time generation

**There is no "no-build" option to protect.** `tools/bump-and-deploy.sh` already *is* a build step — it increments `app/VERSION` and `sed`s every `?v=` in `index.html` before syncing to S3. Adding `tools/build-categories.js` to that script costs zero new infrastructure.

The runtime alternative doesn't actually work: `home.js` would need to enumerate `categories/*/meta.json`, but S3-behind-CloudFront serves no directory listing. So it would still need a generated index of category IDs — i.e. a build step, just with N extra round-trips on top. It scales worse on both axes (more requests as categories grow, and still needs generation).

**Build-time scales best. Implementation:**

```
tools/build-categories.js
  walk categories/*/meta.json + categories/*/index.json
  → write categories/categories.json  (id, title, subtitle, icon, color, description, episodes: <derived count>)
```

- Called from `tools/bump-and-deploy.sh` before the `aws s3 sync`.
- CI check: regenerate and fail if the committed file differs from the generated one. This closes the "forgot to regenerate" hole, which is the only real cost of build-time generation.
- Keep the output schema byte-compatible with today's `categories.json` so `home.js` needs no change when this lands.

Merge-conflict surface is gone either way: adding a category stops touching a file other categories' PRs touch.

---

## 7. Renames

### `scenarios/` → `categories/`

Matches the data model and disambiguates "scenario," which docs use loosely (`docs/leaderboard-api-spec.md`, `.kiro/skills/scenario-blueprint/`).

**Blast radius — complete, 33 files.** Generated by `grep -rln "scenarios/" --include={*.js,*.html,*.md,*.json,*.py,*.sh} . | grep -v node_modules | grep -v "^./scenarios/"`. **Re-run that grep before starting step 6 (§11)** — this list is a snapshot.

| Group | Files | Note |
| --- | --- | --- |
| **Engine core** | `app/index.js` (`:2` `?scenario=` param, `:17-18` path build, `:22` fallback, `:24` prod `ASSET_BASE`), `app/engine.js`, `app/home.js` (`:51-54`, `:129`, `:135`) | Expected |
| **Facilitator surfaces — easy to miss** | `app/admin.html`, `app/guide.html` | See §14. `admin.html` **generates the event play links** (`:127`), so it's the tool that must be updated for §9's QR regeneration |
| **Dev harnesses** | `app/tools-test.html`, `tools/puzzle-tester.html` | §14 disposition |
| **Tests** | `tests/happy-path.test.js` (`:38-39` dir constants, `:492`), `tests/e2e/ep0.spec.js`, `ep5-smoke.spec.js`, `bible-ep1.spec.js`, `bible-ep2.spec.js`, `_template.spec.js` | `_template.spec.js` is the pattern new specs are copied from — update it or every future spec inherits the old path |
| **Build/tooling** | `tools/bump-and-deploy.sh`, `tools/validate-progression.js`, `tools/ep3_generate_all_images.py`, `tools/resize_images.py` | Python asset tools take `scenarios/...` args |
| **`.kiro` authoring pipeline — 12 files** | `agents/{asset-agent,deploy-agent,game-engine,locale-translator,scenario-data}/AGENT.md`; `skills/{card-images,deploy,episode-review,locale-translation,narrative-voice,scenario-blueprint}/SKILL.md`; plus `skills/voxel-map/SKILL.md` which is **deleted, not edited** (§19) | **Highest-count offender: `skills/locale-translation/SKILL.md` has 11 references, `skills/deploy/SKILL.md` has 6.** See the correction in §10 |
| **`.quickwork`** | `skills/resolve-episode-builder/SKILL.md` (6 refs) | Second authoring pipeline, separate from `.kiro` |
| **Docs** | `README.md`, `project.md`, `CONTRIBUTING.md`, `docs/REVIEWER-GUIDE.md`, `docs/blueprints/ep5-quick-bites-draft.md` | `project.md` and `CONTRIBUTING.md` need full rewrites, not path edits (§11 step 9) |
| **Deployed** | `s3://kuettai-unlock-asset/scenarios/`, `beta.re-solve.cloud/scenarios/...` | §9 cutover step 7 |

**Decision: total cutover.** No `scenarios/` alias, no `?scenario=` back-compat shim, no dual-path support. v1 goes down, v2 comes up. Downtime is acceptable. Consequences, all accepted:

- Every printed/deployed QR code pointing at `?scenario=../scenarios/...` dies. Regenerate booth QR codes from the new URL format as part of the cutover.
- In-progress localStorage saves are orphaned by the `meta.json` `"id"` change (the save key at `engine.js:465`). Accepted — no in-flight sessions to protect.
- Backend `scenario_id` → `category_id` rename and episode-slug migration: see §9.
- Delete the old `s3://kuettai-unlock-asset/scenarios/` prefix after v2 is verified. Note `bump-and-deploy.sh` syncs `scenarios` **without** `--delete`, so it lingers unless removed deliberately.

### Episode folders: renumber, and delete `ep7-macet`

**Decision: renumber sequentially, drop decimals, delete `ep7-macet`.** Episode numbers are not stable identifiers. Zero-padded two digits, gap-free:

| v1 | v2 |
| --- | --- |
| `ep0-boot-sequence` | `01-boot-sequence` |
| `ep0.5-cloud-onboarding` | `02-cloud-onboarding` |
| `ep1-awakening` | `03-awakening` |
| `ep2-day-one` | `04-day-one` |
| `ep3-kings-errand` | `05-kings-errand` |
| `ep4-spec-architect` | `06-spec-architect` |
| `ep5-quick-bites` | `07-quick-bites` |
| `ep6-the-bolt` | `08-the-bolt` |
| ~~`ep7-macet`~~ | **deleted** |
| `ep8-macet` | `09-macet` |

`ep7-macet` and `ep8-macet` are both titled "Macet" and share a slug — ep8 supersedes ep7. Deleting ep7 resolves the slug collision and retires the `4digits-lock` softlock (§2.1 bug 2) without writing a fix. **Deletion checklist:**

- `rm -rf scenarios/aws/ep7-macet/` (108K, no `assets/` — nothing else references its files)
- Remove `"ep7-macet"` from `scenarios/aws/index.json`
- **Remove the test block at `tests/happy-path.test.js:686`** (`createEngine('ep7-macet')`) — the only code reference outside the folder itself; the suite fails without this

Rename mechanics (scripted pass, remaining 13 episodes across 3 categories) must update: each category's `index.json`, `meta.json`'s `"id"` and `"episode"` fields, `locales/` paths, asset paths, `tests/e2e/*.spec.js` fixture paths, `tests/happy-path.test.js` `createEngine()` calls, and the `app/index.js:22` fallback constant.

---

## 8. Cache-busting strategy

`?v={N}` is not the problem. *How v1 applies it* is the problem — three separate mistakes:

| Current | Problem |
| --- | --- |
| `engine.js:47` — `?v=${Date.now()}` on all 8 episode JSON fetches | Unique URL every page load. Episode JSON is **never** cached, by browser or CDN. Worst offender. |
| `index.html` — manual `?v=4` on 60 script tags, rewritten by `sed` in `bump-and-deploy.sh:13` | A regex over HTML as the versioning mechanism. Also: the registry rewrite (§5) removes those 60 tags, so the `sed` will silently match nothing and stop working. |
| `bump-and-deploy.sh:20` — `create-invalidation --paths "/*"` every deploy | Invalidates the entire distribution, making both mechanisms above redundant, and costs money per path beyond the free tier. |

Net effect today: near-zero caching despite having a CDN, plus a version number that must be bumped by a shell script rewriting HTML.

### Recommended: one version stamp + immutable headers + no blanket invalidation

**1. Single source of truth.** `bump-and-deploy.sh` already owns `app/VERSION`. Have it also emit:

```js
// apps/version.js — GENERATED, do not edit
window.RESOLVE_VERSION = '17';
```

`apps/index.html` loads `version.js` first (uncached), and **nothing else in the HTML carries a `?v=`**. Delete the `sed` line.

**2. Everything else derives from it.**
- The puzzle registry (§5) appends `?v=${RESOLVE_VERSION}` when it injects scripts — one code path, not 60 hand-maintained tags.
- `engine.js` replaces `?v=${Date.now()}` with `?v=${RESOLVE_VERSION}`. Episode JSON now actually caches between sessions, which matters most on booth wifi with 20 phones loading the same episode.
- Hook and CSS overlay files (§4) use the same stamp.

**3. Cache headers do the real work.** Set on upload in `bump-and-deploy.sh`:

| Path | `Cache-Control` |
| --- | --- |
| `apps/index.html`, `apps/home.html` | `no-cache` (must revalidate — this is the only entry point that needs to be fresh) |
| `apps/version.js` | `no-cache` |
| everything else under `apps/**` | `max-age=31536000, immutable` |
| `categories/**` (JSON + assets) | `max-age=31536000, immutable` |

**4. Drop `create-invalidation "/*"`.** With `no-cache` on the two HTML entry points and a version-stamped URL for everything else, there is nothing left to invalidate. If a hotfix ever needs it, invalidate the specific path.

### Decision: `?v={N}`, one integer, generated

**Confirmed: `?v={N}` stays** — an incrementing integer from `app/VERSION`, emitted once into `apps/version.js` and referenced from code. What changes is that *nothing* hand-maintains it: no `sed` over HTML, no `Date.now()`, no per-tag duplication.

Not content hashing (`engine.abc123.js`): strictly better in theory (only changed files bust) but needs a bundler/manifest and rewriting every reference — infrastructure this project doesn't have and shouldn't grow for this. A single global stamp over-invalidates on deploy (everything re-downloads once), which is fine: deploys are infrequent, payload is small. Revisit only if deploy frequency makes it hurt.

---

## 9. Backend work orders (summary — full spec in §27)

> **§27 is the deliverable to send.** This section is the summary view; §27 carries the actual schema deltas, request/response shapes, migration table, and the 7 questions for the backend team. Where the two differ, §27 is correct — in particular, **`scenario_id` needs to be *split* into `category_id` + `episode_id`, not renamed** (§27.2 Change 1).


**Context:** total cutover with downtime. No dual-accept window, no back-compat, no in-flight sessions to protect. Backend leaderboard no longer depends on frontend episode data, so historical score migration is **not required**.

Path construction lives in the frontend (`app/index.js:11-22`):

```js
const _cat = _gd.scenario_id;          // from backend game-state response
const _ep  = /* episode id */;
if (_cat && _ep) SCENARIO_BASE = '../scenarios/' + _cat + '/' + _ep;
else if (_cat)   SCENARIO_BASE = '../scenarios/' + _cat;
```

The frontend owns the `scenarios/` prefix; the backend owns the `scenario_id` and episode values interpolated into it — and those episode values are the folder names being renumbered (§7).

**Two details worth flagging to the backend team:** the fetch is a **synchronous** `XMLHttpRequest` executed during module evaluation (`index.js:11-12`), so backend latency directly delays first paint on every event-mode load — worth revisiting during the rebuild. And the endpoint is in **`ap-southeast-5`** while `bump-and-deploy.sh` deploys the frontend to `ap-southeast-1`; confirm that's intentional.

### Work orders

| # | Change | Detail |
| --- | --- | --- |
| 1 | **Rename `scenario_id` → `category_id`** | Confirmed decision. Breaking API change; no compat alias needed given the cutover. Update the game-state response, any request payloads, DB column/attribute, and `docs/leaderboard-api-spec.md`. |
| 2 | **Migrate persisted episode slugs** | Per the §7 mapping table. **⚠️ CORRECTED — read this carefully, an earlier draft of this doc was wrong.** The frontend reads `_gd.games_config.episodes[0]` (`index.js:16`), so this doc previously asserted slugs live in `games_config.episodes[]`. **They do not, for games created by `admin.html`.** That tool sends `scenario_id` as a **compound** `"<category>/<episode>"` string (`admin.html:96` builds `opt.value = ${cat.id}/${ep}`; `:115` passes it through) and sends `games_config: { puzzle_count: N }` with **no `episodes` array at all**. So `index.js:15-17`'s preferred branch can never fire for an admin-created game — resolution always falls through to `:18`'s `else if (_cat)`, which works *only* because `scenario_id` already contains the episode. **Migrate the compound `scenario_id` values. Check whether anything else populates `games_config.episodes` before assuming that array matters.** |
| 3 | **Delete `ep7-macet` references** | The episode is being deleted, not renamed. Any backend row targeting it must be removed or re-pointed at `09-macet` (its successor). |
| 4 | **Verify `category_id` contains an ID, not a path** | Frontend treats it as a bare category id (`aws`). If any stored row holds a path fragment containing `scenarios/`, normalize it during migration 2. |
| 5 | **Re-point pre-generated `game_id` rows** | Any `game_id` whose target episode is encoded in backend state needs updating to the new slug. |
| 6 | **Leaderboard: no migration needed** | Confirmed: leaderboard no longer depends on frontend episode data. Historical scores under old slugs need no migration, archival, or cleanup. Verify this holds for `server/dev-server.js` too — it's the local dev backend and may still key on episode slug. |
| 7 | **Return a status code for "lobby full", not an English message** | `engine.js:616` currently does `if (d.error && d.error.includes('full'))` — the client substring-matches your error copy to decide whether to fall back to guest mode. Any wording change breaks it silently. |
| 8 | **Confirm the server-side penalty and hint costs** | `engine.js:663` reports `hint_used` as a flat 60s and `:666` reports `penalty` as 30s, while the client charges 60s locally (`:336`). Neither reads `scoring.json`, where `hint_penalty` ranges −2 to −75 per episode. Client and server currently disagree on every wrong answer. Decide which side owns the number. |
| 9 | **Scores are submitted with no episode or category marker** | `register(playerName, scenarioId, gameId)` accepts `scenarioId` and **never uses it** (`engine.js:605`). Meanwhile `base_score` ranges from 30 (`bible/ep2-153-fish`) to 1000 (`corporate/breach-protocol`). If the leaderboard ranks across episodes, it is comparing incomparable scales. Confirm whether the backend derives the episode itself, or whether the client must start sending it. |

### Cutover sequence

Downtime is acceptable, so this is a straight sequence with no overlap window:

1. Take v1 down (maintenance page).
2. Run backend migrations 1-5.
3. Deploy v2 frontend to the new `categories/` S3 prefix.
4. Smoke-test all 13 episodes end to end (see §11 gate).
5. Regenerate booth QR codes with the new URL format.
6. Bring the site up.
7. Delete the old `s3://.../scenarios/` prefix once verified.

Rollback within this window = redeploy v1 + revert the backend migration. After step 7 there is no rollback, so don't do step 7 the same day.

---

## 10. What deliberately does not change

- The 9-file episode JSON schema and its validation (`tools/validate-progression.js`, episode-review rubric ≥70/78).
- The locale overlay mechanism (`locales/index.json` + `locales/<lang>.json`, `engine.t()`) — v2's `lib/` is modeled on it, not replacing it.
- The **JSON schema** that the `.kiro`/`.quickwork` authoring pipelines emit — frozen, so no authoring agent needs to relearn the data format.
- `server/dev-server.js`'s leaderboard **protocol** and `docs/leaderboard-api-spec.md`'s endpoint shapes.

> **⚠️ Correction to an earlier draft of this doc.** It claimed "the `.kiro` authoring pipeline is unchanged because it targets the frozen JSON schema." **That is wrong.** The *schema* is frozen; the *paths* are not. 12 `.kiro` files and 1 `.quickwork` skill hardcode `scenarios/` (§7 blast radius) — `skills/locale-translation/SKILL.md` alone has 11 references. Every one needs updating, or the next author to run the episode pipeline generates files into a directory that no longer exists.
>
> Same correction for `server/dev-server.js`: the protocol survives, but it uses `scenarioId` in 6 places (`handleRegister`, the `events`/`players` maps) and needs the §9 order 1 rename. State is in-memory only — no DB migration for local dev.

---

## 11. Build order

**This is not a phased migration.** v2 is built on a branch, verified whole, and cut over in one release (§9). The steps below are a **dependency-ordered build sequence** — what to write before what, because each step needs the previous one to exist. Nothing here ships to production individually; only step 8 ships.

> **§22 is the same sequence expressed as a parallel dependency graph** with explicit gates and per-node write sets, for execution by fan-out. Read this section for the *reasoning*; use §22 to *run* it. If the two ever disagree, §22 is the one that has been checked against file-level write conflicts.

Why this ordering: steps 1-2 are cheap groundwork that makes the rest measurable. Steps 3-4 are the two new subsystems everything else sits on. Steps 5-7 are mechanical once 3-4 exist. Step 8 is the cutover.

### Step 1 — Baseline the truth (before writing any v2 code)

Two deliverables, both cheap, both needed to know whether v2 broke anything:

**(a) Test coverage for every episode.** Exact current coverage is in §17. Summary: **5 of the 13 surviving episodes have zero tests of any kind — including `ep8-macet`, the one that's actually broken, and the entire `corporate` category.** Write baseline specs for those 5 against **v1** first, so they're a known-good reference. Without this, "did the rebuild break the corporate episodes?" is unanswerable.

**(b) The leak inventory (the "full pass").** Read `app/index.js` (2283 lines) and `app/home.js` (163 lines) line by line. Produce a table: every place core holds an episode-specific string, ID, magic number, or hardcoded design decision → which §4.2 hook, event, or slot absorbs it. §2.5 and §4.2 are the seed, not the answer — they came from targeted greps and are biased toward what was searched for. Output goes in this doc as §13.

**(c) Fix the live bugs on v1 first** (§2.1 bugs 1-2, §13.4 bugs 3-10), so the baseline specs capture *correct* behavior rather than freezing current breakage as the reference. Porting a bug forward makes it permanent; `dial-lock`'s forked `onSolve` in particular gets harder to spot once the registry rewrite lands. `ep7-macet`'s `4digits-lock` bug needs no fix — that episode is being deleted (§7).

**(d) Implement the full scoring model before capturing baselines** (§23). Nine `scoring.json` fields currently have zero code behind them, including the lore bonuses declared by 12 of 15 episodes. **Decided: implement all of them** — the thresholds were tuned assuming they fire (proven in §23.1; `ep7` sits three star-tiers below its own documented intent), so implementing repairs author intent rather than disturbing it. This must land *before* baseline specs, because those specs assert scores.

### Step 2 — Scaffold `apps/` and delete dead weight

Copy `app/` → `apps/`. Delete `app/tools/` and `app/tools-test.html` (§2.4). Delete `scenarios/aws/ep7-macet/` plus its `index.json` entry and the `tests/happy-path.test.js:686` block (§7). Fix `README.md:48`. No behavior change yet — this is clearing the floor.

### Step 3 — Hook system (`apps/hooks.js`)

Build all four mechanisms together — they share one registry and splitting them means retrofitting:

- Named hooks with episode → category → default precedence (§4.1)
- Event bus (§4.3a)
- Render slots (§4.3b)
- Author-declared namespaced hooks + `list()` introspection (§4.3c, §4.3d)
- Error isolation: degrade in prod, hard-fail on localhost (§4.5)

**Validate the design on the ugliest real case before building the rest of the catalog:** move the `_usedAidlc` block (`index.js:2154`) and `renderLearningRecap` (`index.js:258`) out of core into `categories/aws/09-macet/lib/hooks.js` (that's `ep8-macet` — verify the attribution in §13, an earlier draft of this doc had it as ep6), with zero behavior change. That case involves state inspection, DOM injection, and CSS — if it's clean, the design holds. If it's awkward, fix the design now, not after ~22 hooks exist.

**Do this against `ep8-macet` specifically because it is the worst case in the repo** (§13.2): sole user of six advanced features, zero test coverage, and currently crashing. If the hook design survives ep8, it survives everything.

Then wire the Tier A hooks (§4.2), stub Tier B.

### Step 4 — Puzzle registry (`apps/registry.js`)

Convert all 65 `else if (puzzle.ui === ...)` branches into registry entries (§5). Includes: folding the inline `terminal-lock` implementation (`index.js:1029-1090`) into `apps/puzzle/terminal-lock.js` (the file already exists, unused), per-episode script injection with episode → category → `apps/` file resolution, and loud failure on unknown `ui`.

Ships with §8's cache-bust rework, because the registry is what eliminates the 60 hand-maintained `?v=` tags and the `sed` that rewrites them.

**Gate: the step 1(a) specs pass for all 13 episodes.** This step touches every episode's runtime load path — it's the highest-regression-risk work in v2.

### Step 5 — CSS layering + inline extraction

**Revised after measurement — see §4.4a.** This step is bigger and differently shaped than first described: 85% of the app's CSS (148,893 chars) is injected at runtime from the 75 puzzle components, not held in `apps/index.css` (25,552 chars).

Three sub-steps, in order:

1. **Declare cascade layers** — `@layer base, components, category, episode;` as the first rule of `apps/index.css`. Confirm the minimum iOS target supports `@layer` (Safari 15.4+) before committing to this approach.
2. **Wrap each component's injected CSS** in `@layer components { … }` — 75 independent single-file edits, mechanical, **the cleanest parallel fan-out group in the whole migration** (§22 G5).
3. **Extract the 51 inline `style=`/`cssText` sites** in `index.js`, plus the 3 injected blocks (`role-bar-css`, `learn-card-css`, `aidlc-recap-css`). Layers do **not** beat inline styles, so this part is unavoidable. `index.js:780` also has `engine.penaltySeconds += 15` living inside an `onclick` attribute — that's logic, not styling, and it moves too.

Only after all three does `lib/style.css` overlay loading actually work.

### Step 6 — `categories/` restructure

Rename `scenarios/` → `categories/`, renumber episode folders per §7's table, add per-category `meta.json`, write `tools/build-categories.js` + its CI drift check (§6). Scripted, mechanical. Update every reference in §7's list.

### Step 7 — Verify whole

- All 13 episodes pass e2e (the step 1(a) baseline, repointed at v2 paths)
- `node tools/validate-progression.js` clean on all 13, with the new `ui`-resolves check
- `tests/happy-path.test.js`, `tests/puzzle-locks.test.js` green
- Manual pass on mobile — the design rules in `project.md` call for touch testing, and no automated spec covers it
- `ReSolveHooks.list()` shows every Tier A hook wired

### Step 8 — Cutover

Execute §9's sequence: v1 down → backend migrations → v2 deploy → smoke test → QR regeneration → up.

### Step 9 — Lock the boundary (post-cutover)

Add the CI check rejecting PRs that touch `apps/**` without a `core-change` label (§3). After cutover, not before — authors need the hook system live and documented first, and `project.md`/`CONTRIBUTING.md` need rewriting for the new structure. **That doc rewrite is a real deliverable, not an afterthought:** every path, rule, and workflow in `project.md` describes v1.

---

## 12. Decisions (all locked)

| # | Question | Decision |
| --- | --- | --- |
| 1 | Hook list completeness | **Expanded to a ~60-entry tiered catalog (§4.2), plus three extensibility mechanisms so authors aren't blocked on core** (§4.3): event bus for observation, render slots for UI injection, namespaced author-declared hooks for category-owned extension points. Tier A (~22) ships at launch; Tier B is declared-but-stubbed. The exhaustive leak inventory is step 1(b). |
| 2 | `?scenario=` back-compat | **Total cutover.** No alias, no shim, no dual-accept window. Downtime accepted. §9. |
| 3 | Build step | **Build-time.** `bump-and-deploy.sh` is already a build step, so it costs nothing new. Runtime generation can't enumerate S3 without a generated index anyway — worse on requests *and* complexity. §6. |
| 4 | `app/tools/` fate | **Delete.** Verified dead: only consumer is `app/tools-test.html` (dev harness); `guide.html` is the facilitator answer sheet, not a tutorial; `base64-decoder` is duplicated in `app/puzzle/` (that's the live one); `puzzle-tester.html` reimplements `mountHexDecoder` locally. Delete directory + harness, fix `README.md:48`. §2.4. |
| 5 | Episode numbering | **Renumber sequentially, no decimals, and delete `ep7-macet`.** Mapping table + deletion checklist in §7. Deleting ep7 also retires the `4digits-lock` softlock without a fix. |
| 6 | Hook error isolation | **Degrade in production, hard-fail on localhost.** Reuses the existing host check (`index.js:24`, `home.js:4`). §4.5. |
| 7 | Cache busting | **`?v={N}`** — one generated integer in `apps/version.js`, `immutable` headers on everything but the two HTML entry points, drop the blanket `/*` invalidation. `?v={N}` was never the problem; `Date.now()` on episode JSON and `sed`-rewriting 60 HTML tags were. §8. |
| 8 | Leaderboard history | **No migration needed.** Backend leaderboard no longer depends on frontend episode data. §9 order 6. |
| 9 | `scenario_id` naming | **SPLIT into `category_id` + `episode_id`** — not a rename. It currently holds a compound `"<category>/<episode>"` string (`admin.html:96`), so renaming it would preserve the ambiguity. Breaking API change, no compat alias. §27.2 Change 1. |
| 10 | Duplicate `macet` slug | **Resolved by deleting ep7** — ep8 supersedes it. |
| 11 | Voxel map | **Dropped.** `meta.map_style: "voxel"` unsupported in v2. Clean removal: the renderer already displays nothing (its `25maps` tile directory doesn't exist), and its sole user `bible/ep2-153-fish` already has `map_pos`, so it falls through to the isometric renderer after removing one `meta.json` line. Takes `tools/vox-generator/` (865 lines) and `.kiro/skills/voxel-map/SKILL.md` with it. §19. |
| 12 | Scoring fields with no implementation | **DECIDED: implement all of them.** The episode data is correct; the engine is incomplete. Proven arithmetically — the `stars` thresholds were tuned *assuming* the bonuses fire, so implementing them repairs author intent rather than invalidating tuning. Full specification in §23. This unblocks the graph root (§22 G0). |

---

## 13. Episode ↔ hook requirement map

### 13.1 Method

Two passes, both reproducible:

1. **Feature-usage attribution** (below, complete): for every optional field and behavior core supports, grep `scenarios/` to find which episodes actually use it. This answers "which episode needs which hook" without reading a line of engine code.
2. **Code-leak inventory** (§13.3): read `index.js`/`engine.js`/`home.js` line by line, find every non-generic construct, attribute each to its owning episode by grepping the hardcoded value.

Every attribution below is a grep result, not an inference. Re-run any of them to verify — the commands are inline.

### 13.2 Feature usage by episode

**Headline: `ep8-macet` is the sole user of six advanced features, has zero test coverage, and is currently crashing.** It is simultaneously the hardest episode to port and the least verifiable one. Everything else in the repo is comparatively plain.

Legend: **A** = needs a Tier A hook, **d** = uses a documented optional field (no hook needed, but the loader must tolerate absence)

| Episode | v2 folder | Features used | Hooks required |
| --- | --- | --- | --- |
| `aws/ep0-boot-sequence` | `01-boot-sequence` | `challenge` blocks, `assets/` | — (challenge is engine-level, not per-episode) |
| `aws/ep0.5-cloud-onboarding` | `02-cloud-onboarding` | `lore_label`, `assets/` | `loreRecapFn` (Tier B) or leave as `d` |
| `aws/ep1-awakening` | `03-awakening` | `challenge`, `accept_variations`, **`follow_up`** | **`puzzleConfigFn` (A)** — `follow_up` is the two-step terminal-lock flow that mutates `cfg` in place (§13.3) |
| `aws/ep2-day-one` | `04-day-one` | `accept_variations`, room 600 | — (but see the room-600 collision, §1) |
| `aws/ep3-kings-errand` | `05-kings-errand` | `accept_variations`, room 600 | — |
| `aws/ep4-spec-architect` | `06-spec-architect` | `challenge`, `accept_variations` | — |
| `aws/ep5-quick-bites` | `07-quick-bites` | `end_title`, `lore_label`, `assets/`, room 600, **orphan `npcs.json`** | — ; resolve `npcs.json` (§16) |
| `aws/ep6-the-bolt` | `08-the-bolt` | `end_title`, `lore_label`, **`locales/`**, `assets/` | — (locale mechanism already generic) |
| **`aws/ep8-macet`** | **`09-macet`** | **`learning_recap`, `background`, `learning_card`, all 3 role variants, `image_manual`, `locales/`, `end_title`, `lore_label`, `assets/`, room 600, `traffic-lane-lock` (broken)** | **`endImageFn`, `endScreenExtraFn`, `learningCardFn`, `puzzleConfigFn`, `episodeBackgroundFn` — 5 of the ~22 Tier A hooks exist for this one episode** |
| `bible/ep0-masters-investigation` | (unchanged) | `challenge`, `end_title`, `lore_label` | — |
| `bible/ep1-philips-impossible-math` | (unchanged) | `challenge`, `end_title`, `lore_label` | — |
| `bible/ep2-153-fish` | (unchanged) | `end_title`, `lore_label`, **`cafe-order-lock`** | **`puzzleClosedFn` (B)** — owns the `cafe_order_state` localStorage key that `home.js:12` and `index.js:1963` clear by hand |
| `corporate/breach-protocol` | (unchanged) | none | — |
| `corporate/filing-frenzy` | (unchanged) | none | — |
| ~~`aws/ep7-macet`~~ | **deleted** | `end_title`, `lore_label`, room 600, `4digits-lock` (broken) | n/a |

**Reproduce:**
```
grep -rl '"learning_recap"' scenarios/*/*/meta.json      # → aws/ep8-macet only
grep -rl '"background"'     scenarios/*/*/meta.json      # → aws/ep8-macet only
grep -rl '"learning_card"'  scenarios/*/*/puzzles.json   # → aws/ep8-macet only
grep -rl '_builder'         scenarios/*/*/puzzles.json   # → aws/ep8-macet only
grep -rl 'image_manual'     scenarios/*/*/narrative.json # → aws/ep8-macet only
grep -rl '"follow_up"'      scenarios/*/*/puzzles.json   # → aws/ep1-awakening only
grep -rl '"challenge"'      scenarios/*/*/{puzzles,cards}.json
grep -rln 'ctx-aidlc\|wordlock-bolts' scenarios/         # → aws/ep8-macet only
```

### 13.3 What this means for sequencing

Three consequences that change the build plan:

**1. Port `ep8-macet` first, not last.** It exercises 5 of ~22 Tier A hooks alone. If the hook design can't express ep8 cleanly, the design is wrong — and you want to know that in build step 3, not step 7. This is why §11 step 3 names it as the validation case.

**2. Write ep8's baseline spec before anything else.** It's the only episode that is simultaneously feature-heavy, untested, and broken (§2.1, §17). Porting an episode with no reference behavior means "did I break it?" is unanswerable. Fix the `traffic-lane-lock` crash on v1 first, then capture the baseline.

**3. Most episodes need no hooks at all.** 8 of the 13 surviving episodes use only generic behavior plus documented optional `meta.json` fields. Their port is a path rename. Don't over-engineer per-episode `lib/` scaffolding for episodes that will never have a `hooks.js` — the overlay directories are all optional (§3), and most categories/episodes should ship without them.

### 13.4 Live bugs found during the deep read

The line-by-line pass over `index.js` turned up **four more production bugs beyond the two in §2.1.** All verified directly, not inferred. These are not v2 work — they are v1 defects that a rebuild would otherwise silently carry forward or mask.

| # | Bug | Evidence | Impact |
| --- | --- | --- | --- |
| 3 | **`engine.addPenalty()` does not exist.** Called at `index.js:1231` (`onBump`) and `:1240` (`onSpill`). `grep -rn "addPenalty" app/` returns **only those two call sites — no definition.** | `bible/ep0-masters-investigation/puzzles.json:473` sets `"bumpPenalty": 10`, `:575` sets `15` | `TypeError` the moment a player bumps in either maze puzzle. `bible/ep0` has **zero test coverage** (§17), which is why nobody caught it |
| 4 | **No voice audio exists anywhere in the repo.** `find scenarios -iname "*.wav" -o -iname "*.mp3"` → **0 files.** `playVoice()` (`index.js:293`) builds `${ASSET_BASE}/assets/voice/${file}` from a 2-entry `fileMap` (`:316`) | All 15 episodes | Every `playVoice()` call 404s. `README.md` and `project.md` both advertise "voice-narrated story segments" as a shipped feature. `tools/narrative_to_voice.py` exists to generate the files; its output was never committed. Also: `fileMap` has no `ending_failure` entry even though `:349` renders that narrative branch |
| 5 | **`dial-lock` forks `onSolve` instead of calling it** (`index.js:1459-1473`). Reimplements the reward path inline, including `const savedUpdate = engine.onUpdate; engine.onUpdate = null; … engine.onUpdate = savedUpdate` | `bible/ep2-153-fish` (sole `dial-lock` user) | Silently skips `SFX.solve()`, the `learning_card` teaching moment, the "Used:" consumed-inventory toast, and `showDiscoverPopup`. Guaranteed behavioral drift from every other puzzle, and it will drift further as `onSolve` evolves |
| 6 | **Hardcoded card ID `45` in shared core** (`index.js:1480-1482`): `if (total >= 4 && !engine.visibleCards.has(45)) { engine.revealCard(45); … }`. Card 45 is "Drinks Served" in `bible/ep2-153-fish/cards.json:242` | `bible/ep2-153-fish` | One episode's card ID and threshold embedded in the engine. **The same branch also has no `onSubmit`**, so that puzzle can never be solved |

**The `engine.js` pass found four more, including the two most severe in the audit:**

| # | Bug | Evidence | Impact |
| --- | --- | --- | --- |
| 7 | **`aws/ep4-spec-architect` always scores `NaN` and always shows 1 star.** `getScore()` (`engine.js:377-378`) reads `s.base_score`, `s.time_bonus_per_minute`, `s.wrong_combination_penalty`. **ep4's `scoring.json` has none of them** — it uses a different contract (`base_score_per_puzzle: 100`, `time_bonuses: [...]`, `wrong_answer_penalty: -10`). `grep -L '"base_score"' scenarios/*/*/scoring.json` → **ep4 is the only file** | `undefined` arithmetic → `NaN` → `Math.max(0, NaN)` → `NaN` → `stars.find(st => NaN >= st.min)` → `undefined` → `\|\| {stars: 1}`. ep4 also declares a **3**-star scale while `index.js:2212` hardcodes `'★'.repeat(stars) + '☆'.repeat(5 - stars)` | ep4 **has unit test coverage** (§17) — the tests never assert on score |
| 8 | **`tryCodeEntry()` dereferences a field that 199 of 202 puzzles don't have.** `engine.js:315` does `const solution = puzzle.solution;` then `if (solution.type === 'text')` with **no null guard.** Verified: `202 total puzzles, 3 with a non-null solution` | `TypeError: Cannot read properties of null` for any code-entry attempt on the other 199 | Reachable via `tryCode()` (`index.js:1980`), the generic "Enter code…" input rendered at `index.js:620` |
| 9 | **Nine `scoring.json` fields are read by zero lines of application code.** Verified `grep` counts — app code references: **0** for every one | `lore_bonus`, `lore_ids`, `all_lore_bonus` are declared in **12 of 15 episodes**. Also unused: `nova_bonus`, `research_bonus`, `parallel_completion_bonus`, `base_score_per_puzzle`, `time_bonuses`, `wrong_answer_penalty` | **12 episodes declare a lore-bonus system that does nothing.** Authors have been tuning numbers with no effect. The scoring model in the data is substantially fictional |
| 10 | **`bible/ep2-153-fish`'s voxel map renders zero tiles.** `index.js:1851` builds `ASSET_BASE + '/25maps'`. `find . -iname "*25maps*"` → **0 hits repo-wide** | Every tile 404s, hidden by `onerror="this.style.display='none'"` | ep2 is the only episode with `meta.map_style: "voxel"`. Tile filenames are also derived by slugifying the **English** room name (`:1897`), so any rename or non-latin locale breaks them independently. **Resolved by dropping the voxel map entirely — see §19.** No fix needed |

**Bugs 11-14, from the facilitator-surface and component audits:**

| # | Bug | Evidence | Impact |
| --- | --- | --- | --- |
| 11 | **`guide.html` prints the WRONG ANSWER in Challenge mode.** Its challenge merge (`:80-86`) copies only `config`, `description`, and `hints` from `p.challenge` — **not `solution`.** `engine.js:68-80` does `Object.assign(p, topLevel)`, merging *all* top-level keys plus card-level `challenge` blocks | Verified concrete case: `aws/ep0-boot-sequence` puzzle `base64-decode` has normal `solution.value = "locknu"` and `challenge.solution.value = "booter"`. **In Challenge mode the facilitator guide displays `locknu` — the wrong answer.** Also ignores `challenge.input` and `challenge.wrong_answer_message` | A facilitator hands players a wrong answer. Worst *user-facing* bug found, because it actively misinforms a human running a live event |
| 12 | **Two different backends, and the API spec documents the wrong one.** `engine.js` and `admin.html` call `/games/*` on API Gateway (`ap-southeast-5`). `server/dev-server.js` implements only `/api/register`, `/api/status`, `/api/events`, `/api/admin/*` — verified `grep -c "games" server/dev-server.js` → **0** | `docs/leaderboard-api-spec.md` documents the `/api/*` shape, i.e. the dev server, not production | `server/dev-server.js` is **not** a local stand-in for prod — the leaderboard cannot be exercised locally at all. And Playwright runs `npx http-server`, not dev-server, so **no test touches either backend**. Correct the spec or it will mislead the §9 backend conversation |
| 13 | **6 of 9 difficulty labels render unstyled, and one emits an invalid CSS class.** `home.js:103` builds `` `diff-${label.toLowerCase()}` `` | Data has 9 distinct `difficulty.label` values: `Tutorial, Booth Qualifier, Initiate, Practitioner, Specialist, Apprentice, Master, Intermediate, Accessible`. `home.css` defines only `diff-tutorial`, `diff-initiate`, `diff-practitioner`, and `diff-architect` — **and `diff-architect` matches no episode.** `Booth Qualifier` produces the two-token, invalid class `diff-booth qualifier` | Silent — tags render unstyled. Fix belongs with `episodeCardFn` (§4.2) |
| 14 | **`image-prompt-lock.js` re-fires `onSubmit` on every subsequent interaction.** The completion check lives inside `_render()`: `if (this.commissions.every(...)) setTimeout(() => this.onSubmit(true), 400)` | Owner: `aws/ep3-kings-errand` | Every tab click after completion re-awards the puzzle. `onSolve` calls `discoverCard` and fires leaderboard events, so this is duplicate scoring |

**Bug 15 — a hard crash in three episodes, found in the component audit:**

| # | Bug | Evidence | Impact |
| --- | --- | --- | --- |
| 15 | **`spec-lock.js` throws `TypeError` on mount. `this.cfg` is never assigned.** | Traced the full path: constructor calls `this._render()` (`:38`) → `_render()` dispatches on `this.phase`, initialised to `'vibe'` (`:31`) → `:82` calls `_renderVibe()` → **`:96` dereferences `this.cfg.introText`**. `grep -n "this\.cfg" spec-lock.js` returns only reads at `:74`, `:96`, `:119` — **zero assignments.** | `TypeError: Cannot read properties of undefined (reading 'introText')` the moment any `spec-lock` puzzle opens. Affects **`aws/ep4-spec-architect`, `aws/ep6-the-bolt`, `aws/ep8-macet`** |

Two consequences worth stating plainly:

- **`aws/ep8-macet` now has two independent hard crashes** — `traffic-lane-lock`'s `ReferenceError` (bug 1) and this `TypeError`. It is also the episode with **zero test coverage** (§17) and the sole user of six advanced features (§13.2). It is comprehensively the worst-off episode in the repo.
- `spec-lock` also has **dead theming**: its constructor builds a `this._txt` map from `agentName` (`:24-29`), but `:74`/`:96`/`:119` use golem literals instead — so `aws/ep8-macet`'s `agentName: "Kiro"` never reaches the intro, send, or done text. And `aws/ep6-the-bolt/locales/id.json:229-231` supplies `introText`/`sendButton`/`doneText` that `index.js:1487-1494` never forwards. **Localisation that was authored and wired to nothing.**

**Three data-integrity defects (not crashes, but wrong behavior):**

- **`engine.js:553` — one global leaderboard queue for all episodes.** `this._storageKey = 'utc_lb_queue'`, not namespaced by `meta.id` or `gameId`. Unflushed events from one episode get posted under the next episode's `gameId`/`playerId`. Unbounded: no cap, no TTL. And `engine.js:697-699` re-queues the **entire** batch on partial failure, so delivered events are re-sent — double-counted penalties and hints.
- **`engine.js:605` — `register(playerName, scenarioId, gameId)` never uses `scenarioId`.** Confirmed: the parameter appears only in the signature. The leaderboard therefore has no idea which episode or category a score came from, while `base_score` ranges from 30 (`bible/ep2`) to 1000 (`corporate/breach-protocol`). Scores across categories are not comparable, and nothing records the scale.
- **`saveState()` (`engine.js:466-488`) is a hand-maintained 21-field allowlist that omits state the code uses:** `timeInvested` (read at `engine.js:367`, written at `index.js:911`), `_timerExpired` (`index.js:52`, `:586`), `gameMode`, `activeLocale`/`localeData`, `revealQueue`, `lastConsumed`. So on refresh: **the chosen language reverts to English**, invested time resets to 0, and an expired timer un-expires. `restoreState()` (`:507-522`) also assigns raw values with no `\|\| 0` defaults, so an older save missing a numeric field yields `undefined` → `NaN` score. There is no `version` field, and the only stale-save guard validates `currentRoom` alone.
- **The wrong-answer penalty disagrees with itself:** `engine.js:336` charges `penaltySeconds += 60` locally; `engine.js:666` reports `seconds: ev.seconds || 30` to the server. Same event, two numbers. Neither reads `scoring.json`. Same pattern at `engine.js:663`: `hint_used` is hardcoded to 60s server-side while `scoring.hint_penalty` ranges −2 to −75 across episodes.

**Two more defects that are dead code rather than live failures:**

- `index.js:622` — `if (p.tools_available && p.tools_available.includes('base64_decoder')) {}` — **empty body.** A feature that was wired up and then gutted. Owner: `aws/ep0-boot-sequence` (only episode with `tools_available`).
- `index.js:645-650` — both branches of `if (visitedRooms.has(room.id))` call `showRoomBanner(roomTitle)` identically. The `visitedRooms` set is maintained but never changes behavior — dead first-visit logic.
- `index.js:1987-2006` — `mountWordLock()` reads `puzzle.solution.value.toUpperCase()`. All four `ui: "word-lock"` puzzles (`aws/ep8-macet`) store their answers at `config.answer` with `solution: null`, so this would throw. It's unreachable in practice (live path is `index.js:1203`), i.e. **dead and broken**. Delete rather than port.
- **Two more unnamespaced cross-episode localStorage keys, in puzzle components:** `resolve_hint_shown_matchlock` (`app/puzzle/match-lock.js:94,96`) and `resolve_hint_shown_wordlock` (`app/puzzle/word-lock.js:81,83`). Neither is cleared by `home.js:12` (which handles only `utc_*` and `cafe_order_state`) nor by `engine.clearSave()`. **Effect: a player who sees the match-lock hint in `aws/ep4` never sees it again in `aws/ep5`, `aws/ep8`, or `bible/ep0`** — and "Reset the game" doesn't restore it. `match-lock` is used by 4 episodes, `word-lock` by 5. Same class of bug as `cafe_order_state`, but it survives a reset.
- `engine.js:384-392` — `getVisibleCardsByType()` buckets are `locations, objects, items, events, penalties, lore`. Lookup is `result[card.type + 's'] || result[card.type]`, so `type: "tool"` resolves to neither and is **silently dropped**. There are **52 tool cards** across 7 episodes. The tools UI happens to use a separate render path (`renderTools`, `index.js:1714`), so nothing visibly breaks today — but any v2 code that trusts this method to enumerate visible cards will lose all tools.

**Also worth knowing before the rebuild:** `index.js:11-12` performs a **synchronous** `XMLHttpRequest` (`_xhr.open(..., false)`) against a hardcoded API Gateway URL during module evaluation. It blocks first paint on a network round trip. Note the region: `ap-southeast-5`, while `bump-and-deploy.sh` deploys to `ap-southeast-1`.

**And it reveals a backend contract detail §9 was missing:** the response is read as `_gd.scenario_id` **and `_gd.games_config.episodes[0]`**. So episode slugs live inside a `games_config.episodes` array in the backend — that array is what §9 order 2's slug migration must actually rewrite.

`index.js:435` also hardcodes `${ASSET_BASE}/assets/cover.png` for the intro cover, ignoring `meta.cover` — which `aws/ep8-macet/meta.json:7` is the only episode to declare. The 10 episodes with no `assets/` directory (§16) show a broken image here.

### 13.5 Code-leak inventory

| `file:line` | Construct | Owner | Absorbing hook |
| --- | --- | --- | --- |
| `index.js:2154` | `solvedPuzzles.has('ctx-aidlc') \|\| solvedPuzzles.has('wordlock-bolts') \|\| unlockedRooms.includes(600)` | `aws/ep8-macet` | `endImageFn` |
| `index.js:258-283` | `renderLearningRecap()`, element ID `aidlc-recap`, injected `aidlc-recap-css` | `aws/ep8-macet` (`meta.learning_recap`) | `endScreenExtraFn` |
| `index.js:246-256` | `applyEpisodeBackground()`, fixed gradient over `meta.background` | `aws/ep8-macet` (only user) | `episodeBackgroundFn` |
| `index.js:194+` | `showLearningCard()`, fixed 3s lockout | `aws/ep8-macet` (`config.learning_card`) | `learningCardFn` |
| `index.js:123-126` | `ROLE_META` — 3 lanes, AWS job titles ("Developer, DevOps, SRE") | `aws/ep8-macet` is the only episode with `_<role>` config keys; the other 12 inherit labels they don't use | `roleConfigFn` |
| `index.js:132-143` | `resolveRoleCfg()` — `_builder`/`_planner`/`_strategist` suffix convention baked into core | `aws/ep8-macet` | `puzzleConfigFn` |
| `index.js:152-174` | `_injectRoleBar()` + injected `role-bar-css` | `aws/ep8-macet` | `puzzleConfigFn` + CSS extraction (§11 step 5) |
| `home.js:12` / `index.js:1963` | `cafe_order_state` localStorage key cleared by hand in two places | `bible-jesus-miracles/ep2-153-fish` (sole `cafe-order-lock` user) | `puzzleClosedFn` |
| `index.js:1029-1090` | `terminal-lock` mounted inline; mutates `cfg.answer`/`cfg.accept_variations`, `delete cfg.follow_up` | `aws/ep1-awakening` (sole `follow_up` user) | Registry entry (§5) + `puzzleConfigFn`. **Note: the in-place mutation breaks re-mount, and role switching re-mounts the open puzzle (`index.js:150`)** |
| `index.js:2175` | `'Mission Complete'` fallback | 6 episodes override via `meta.end_title`; `aws/ep0`–`ep4` + both `corporate` episodes get the hardcoded English | `d` — leave as fallback |
| `index.js:2241` | `'Memory Fragments'` fallback | 8 episodes override via `meta.lore_label` | `d` — leave as fallback |
| `index.js:2191` | `timedOut ? 'Overtime' : "Time's Up"` — **no override field exists**, so no episode and no locale can change it | all 13 | needs a `meta` field or `scoreTableFn` |
| `index.js:2282` | `'Map'` heading, hardcoded English + inline styles | all 13 | `endMapFn` (B) |

**Additional leaks found in the deep read, grouped by owning episode.** This is the "which episode requires which hook" answer at code granularity.

#### `aws/ep8-macet` → `09-macet` (by far the heaviest)

| `file:line` | Construct | Absorbing hook |
| --- | --- | --- |
| `index.js:283-284` | Comment encoding room 200 + "Requirements Tollbooth" (a room name unique to this episode, `rooms.json:14`) | n/a — delete with the code it describes |
| `index.js:177` | `getElementById('intro-role-chooser')`; gated on `meta.roles === true`, declared by this episode only | `roleChooserFn` |
| `index.js:163`, `:179-180` | `'Lane'`, `'Choose your lane'`, `'All lanes reach the same destination — …'` — ep8's traffic-jam metaphor, in core, unlocalizable | `roleConfigFn` + `roleChooserFn` |
| `index.js:128`, `:130` | `currentRole = 'builder'` default | `roleConfigFn` |
| `index.js:129`, `:148` | `localStorage` key `resolve_role` | `roleConfigFn` |
| `index.js:154-159` | Injected `role-bar-css` — ~400 chars appended to `<head>`, so it **beats any episode stylesheet**. Unoverridable by design accident | CSS extraction (§11 step 5) |
| `index.js:196-201` | Injected `learn-card-css` — overlay geometry, `z-index:9998`, purple palette, 2 keyframes | `learningCardFn` + CSS extraction |
| `index.js:252-253` | `linear-gradient(rgba(10,14,23,.88), rgba(10,14,23,.95))` scrim + `backgroundAttachment='fixed'`. Ignores the category colour that `categories.json` already defines (aws `#f97316`, bible `#a855f7`, corporate `#dc2626`) | `episodeBackgroundFn` |
| `index.js:263-268` | Injected `aidlc-recap-css` with raw hex colours, not `var(--*)` | `endScreenExtraFn` + CSS extraction |
| `index.js:1196` | `new TrafficLaneLock(...)` — **§2.1 bug 1** | Registry (§5) |

#### `aws/ep0-boot-sequence` → `01-boot-sequence`

| `file:line` | Construct | Absorbing hook |
| --- | --- | --- |
| `index.js:22` | `SCENARIO_BASE` fallback hardcodes this episode for the whole engine | config, not a hook |
| `index.js:609-613` | `if (room.hidden_elements …)` + `id="hidden-input-${room.id}"` — `hidden_elements` appears in this episode's `cards.json` only | `postRoomRenderFn` |
| `index.js:617-618` | `if (p.puzzle_ui === 'word_lock')` + fixed `word-lock-mount` element ID. `puzzle_ui: "word_lock"` exists only here (`puzzles.json:295`) | Registry (§5) |
| `index.js:622` | Empty-body `if` on `tools_available` — dead (§13.4) | delete |
| `index.js:986`, `:1008-1015` | `'Wrong sequence. Try again.'`; `base64-decoder` branch with hand-built `'Close'` button + `cssText` | `puzzleFailFn`, Registry |

#### `bible-jesus-miracles/ep2-153-fish`

| `file:line` | Construct | Absorbing hook |
| --- | --- | --- |
| `index.js:379-382` | `window._cafeOrderBadgeUpdate` + `typeof CafeOrderLock !== 'undefined'` — core boots a global keyed to one puzzle class and probes for it by name | `postEpisodeLoadFn` / event bus |
| `index.html:110` | `<span id="badge-cafe" style="…background:#f39c12">` — a café-named badge with an inline colour, bolted onto the generic Tools tab | slot (§4.3b) |
| `index.js:1963-1964` | `localStorage.removeItem('cafe_order_state')` + `CafeOrderLock._state = null` | `puzzleClosedFn` |
| `home.js:12` | Same key cleared again, in the *other* entry point | `puzzleClosedFn` |
| `index.js:1459-1473` | `dial-lock` forked `onSolve` — **§13.4 bug 5** | Registry + `puzzleSuccessFn` |
| `index.js:1480-1482` | Hardcoded card `45` + threshold `4` — **§13.4 bug 6** | Registry + event bus |

#### `bible-jesus-miracles/ep0-masters-investigation`

| `file:line` | Construct | Absorbing hook |
| --- | --- | --- |
| `index.js:1231`, `:1240` | `engine.addPenalty()` — **§13.4 bug 3, does not exist** | `puzzleFailFn` + a real engine method |
| `index.js:1231`, `:1240` | `'You stumbled in the dark!'`, `'Water spilled!'` defaults | `puzzleFailFn` |
| `index.js:108-110` | `SFX.pour/fall/bump` — jar/maze-specific cues in the core sound table; `pour()` has **zero call sites** | `sfxFn` (B) |

#### `aws/ep1-awakening` → `03-awakening`

| `file:line` | Construct | Absorbing hook |
| --- | --- | --- |
| `index.js:1058-1060` | `cfg.answer = cfg.follow_up.answer; … delete cfg.follow_up` — **the config-corruption bug, see §13.6** | `puzzleConfigFn` |
| `index.js:1134-1170` | Entire `hex-decoder` branch inline, 37 lines. **No `app/puzzle/hex-decoder.js` exists at all** | Registry — needs a real component file |
| `index.js:1145` | `placeholder = 'e.g. 6e6574776f726b'` — hex for "network", i.e. **this episode's puzzle content, in the engine** | Registry config |
| `index.js:1311-1324` | Entire `audio-player` branch inline. No file, no script tag — and it **plays no audio**, just renders `cfg.message` | Registry, or delete |

#### `aws/ep3-kings-errand` → `05-kings-errand`

| `file:line` | Construct | Absorbing hook |
| --- | --- | --- |
| `index.js:1328-1336` | 9-line `stalls`/`quests` schema translator living in core | Registry `map()` |
| `index.js:1342`, `:1348` | `'Royal Decree'` and `'The decree is flawed.'` defaults — medieval flavour, but **both `corporate` episodes mount this same `ui`** and inherit it | `puzzleConfigFn` |
| `index.js:1366`, `:1376-1378` | `gold \|\| 80`, `cooldown \|\| 30`, `target \|\| 'strides'` — `'strides'` is verbatim one of this episode's tier labels | Registry defaults |
| `index.js:1371` | `cfg.slots.filter(s => engine.solvedPuzzles.has(s.quest))` — cross-puzzle progress derivation inline in core | event bus |

#### `aws/ep2-day-one` + `aws/ep3-kings-errand`

| `file:line` | Construct | Absorbing hook |
| --- | --- | --- |
| `index.js:906-913` | `engine['_used_' + puzzleId]` dynamic property + `time_cost_seconds` (only these 2 episodes) | `hintCostFn` / real engine state |
| `index.js:912` | `` `⏱️ ${desc} activated (−${Math.floor(cost/60)} min)` `` — floors 90s to "1 min" | `toastFn` |

#### `aws/ep5-quick-bites` + ~~`ep7-macet`~~

| `file:line` | Construct | Absorbing hook |
| --- | --- | --- |
| `index.js:1578` | `engine.penaltySeconds += seconds` — writes the engine timer field directly; every other branch uses a callback | `puzzleFailFn` |
| `index.js:1579` | `reason: 'Circle back'` — Amazon-internal phrase hardcoded as a leaderboard reason string | `leaderboardPayloadFn` |
| `index.js:1580` | `showToast('-30 seconds penalty')` — **ignores the `seconds` argument**; correct only because `decay-lock.js:49` happens to pass `30` | `puzzleFailFn` |

### 13.6 Systemic issues — not episode-specific, but they will block the rebuild

These affect all 13 episodes. None can be fixed by a per-episode hook; each needs a core decision in v2.

**(a) `getPuzzleConfig()` returns the config by reference — so any branch that writes to `cfg` permanently corrupts engine state.**

`engine.js:143-148` returns `p.config` directly when no locale overlay is active. `index.js:942` then passes it through `resolveRoleCfg()`, **which also mutates it** (`:132-139`). The `terminal-lock` branch (`:1058-1060`) deletes `cfg.follow_up` outright.

Why this matters more than it looks: `setRole()` (`:149`) **re-mounts the currently open puzzle**. So switching role after answering step 1 of a `follow_up` puzzle re-mounts against a config whose `follow_up` was already deleted. The two-step flow is gone, permanently, for the rest of the session. Owner of the trigger: `aws/ep1-awakening`; owner of the re-mount: `aws/ep8-macet`. **The registry must hand each mount a deep clone.** This is the single most important correctness fix in §5.

**(b) There is no i18n layer, only per-field overrides.** `engine.t()` covers `cards`/`rooms`/`puzzles`/`meta`/`narrative`. Everything else is hardcoded English: ~40 `showToast()` strings, all 65 puzzle-branch failure messages, the entire history log (`index.js:67-72`), `'No items'`/`'No objects'`, `'Select one Item + one Object to interact'`, `"Time's Up"`/`'Overtime'` (`:2191`), `'Map'` (`:2282`), and `index.js:620`'s `placeholder="Enter code..."` which has **no config lookup at all**. Also `index.js:65` forces `toLocaleTimeString('en-GB')` regardless of `engine.activeLocale` — wrong for the two episodes that ship `locales/id.json`. **Decide in v2: a real UI string table, or accept English-only chrome.** Retrofitting later is far more expensive.

**(c) `corporate` is the category that breaks generic defaults.** Neither corporate episode defines `end_title` or `lore_label`, so they display `'Mission Complete'` and `'Memory Fragment'` — the latter being `aws/ep1-awakening`'s vocabulary. `index.js:434` renders `` `Episode ${meta.episode}: …` `` though corporate content is branded as scenarios, not episodes. And `index.js:584`'s hardcoded timer thresholds (`<=60` critical, `<=180` warning) are wrong for `corporate/filing-frenzy`, whose `duration_minutes` is 15 — **a fifth of that game is spent in "warning" state.** Fixes: `timerThresholdFn`, `episodeCardFn`, and reading thresholds from `scoring.json`.

**(d) The card taxonomy is hardcoded three times, with three different emoji mappings** for the same types (`index.js:69`, `:698`, `:928`). `item/object/location/lore/event/penalty` should be one table.

**(e) Inline styles are pervasive**, not incidental: 3 injected `<style>` blocks (`role-bar-css`, `learn-card-css`, `aidlc-recap-css`) plus ~30 `style="…"` and `style.cssText` sites. Two are worth singling out — `index.js:780` embeds `engine.penaltySeconds += 15` **inside an HTML `onclick` attribute string** (a 15-second peek penalty that never consults `scoring.json`), and `index.js:894` adds an `event-result` class that is never removed, so it leaks across popups. §11 step 5 cannot be skipped or overlays won't cascade.

**(f) Magic numbers encoding design decisions**, all currently unreachable from any episode: every SFX frequency/duration (`:101-107`), the 3s learning-card lockout (`:221`), the 1.5s room fade (`:654`), the 800ms reveal stagger (`:704`), the 10s leaderboard flush (`:389`, `:542` — duplicated), the 3s lobby poll (`:558`), the 400ms penalty flash (`:864`), the 3s penalty banner (`:865`).

**(g) Dead code to remove, not port:** 6 puzzle dispatch branches no episode uses (`arch-lock`, `deduction-grid-lock`, `key-lock`, `pipe-lock`, `rank-lock`, `slider-lock`); 13 orphan files in `app/puzzle/` with neither a script tag nor a branch (`alarm-lock`, `az-lock`, `binary-lock`, `cidr-lock`, `color-lock`, `cost-lock`, `dns-lock`, `grid-org-lock`, `lifecycle-lock`, `query-lock`, `tag-lock`, `task-lock`, `waf-lock`); empty stubs `togglePanel()`/`closeAllPanels()` (`:593-594`) still wired to HTML `onclick`s; the dead `visitedRooms` branch (`:645-650`); the empty `tools_available` `if` (`:622`).

**(h) `4digits-lock`'s class is named `DigitLock`**, not `FourDigitsLock` (`app/puzzle/4digits-lock.js:12`). Worth noting because the registry maps `ui` → class name explicitly, and this is exactly the kind of mismatch that produced §2.1's bugs. Audit all 75 files' actual class names when writing registry entries — **do not infer the class name from the filename.**

**(i) The map renderer is forked three ways, and the "remaining actions" rule is copy-pasted three times.** `index.js` has an isometric path (`:1786`, 13 episodes with `rooms[].map_pos`), a voxel path (`:1849`, `bible/ep2-153-fish` only, keyed on `meta.map_style === 'voxel'`), and a list fallback (`:1919`, both `corporate` episodes — the only ones without `map_pos`). Each has its own copy of `'📍 You are here'` / `'⚠️ N actions remaining'` / `'✅ Explored'` / `'Go Here'`, its own centering constant (iso uses `S = 1.4` and `+60`; voxel uses `+100` with no scale factor), and its own copy of the tools/NPC exclusion rule (`:1816`, `:1884`, `:1932`). Four copies of the same strings counting the end-screen map.

**Decision: the voxel path is dropped (§19), taking the fork from three to two.** The remaining iso and list paths should still be unified behind one renderer plus a hook, or the string duplication returns.

**(j) `engine.js` mutates the loaded JSON with `_`-prefixed private fields** — `puzzle._hintsUsed` (`:355`, `:491`, `:525`) is stored onto the parsed data object and then re-serialized separately, and `index.js:52` writes `engine._timerExpired` onto the engine from the UI layer. Neither is declared in the constructor. A v2 engine should hold this in real state, not smuggled onto data.

**(k) Locale coverage has structural holes.** `card.short_description` is checked **before** the locale lookup (`index.js:1625`), so any card with it can never be translated. `card.flavor_text` (`:1627`) has no `engine.t()` call at all. Room titles resolve via the `cards` namespace while unlock text uses `rooms` (`engine.js:270` vs `:278`) — undocumented and inconsistent; `renderTools` prefers `roomDef.name` while `renderMap` prefers the translated card title, so the same room can display two different names. `engine.js:160`'s answer-protection denylist is `['answer','answers','accept','solution']`, which covers ep8's word-locks but **not** answer data held in `config.tasks`/`config.order`/`config.lanes`/`config.events` — those would be handed to translators.

**(l) The engine parses an English server error string to detect a full lobby:** `engine.js:616` — `if (d.error && d.error.includes('full'))`. Any backend copy change silently breaks the guest-mode fallback. Flag to the backend team (§9) that this needs a real status code.

---

## 14. Repo inventory and disposition

**Purpose: nothing in the repo is undecided.** A rebuild that copies `app/` → `apps/` without this table drags 12 undocumented HTML harnesses along and silently omits two facilitator tools. Every path below has an explicit v2 fate.

### `app/` → `apps/`

| Path | Lines | Disposition |
| --- | --- | --- |
| `index.html` | — | Rewrite: 60 puzzle `<script>` tags removed (registry, §5), `?v=` tags removed (§8), slot markers added (§4.3b) |
| `index.js` | 2283 | Rewrite: dispatch → registry (§5), leaks → hooks (§4, §13) |
| `engine.js` | 704 | Modify: `?v=${Date.now()}` → version stamp (§8), emit events (§4.3a), hook call sites |
| `home.{html,js,css}` | 163 (js) | Modify: hooks for header/bg/cards, `BASE` path, generated links |
| `index.css` | — | Modify: absorb extracted inline styles (§11 step 5) |
| `puzzle/*.js` | 75 files | **Keep as-is.** Uniform `new Klass(mount, cfg)` shape — the registry wraps them, doesn't change them. Includes 15 currently-unloaded files (§2.1) which the registry makes reachable |
| `tools/*.js` | 7 files | **Delete** (§2.4) |
| `tools-test.html` | — | **Delete** (only consumer of `tools/`) |
| **`admin.html`** | 217 | **Keep — and it is not optional.** Event/facilitator console: creates games via the backend `/games` API, lists categories/episodes, and **generates the player URLs** (`:127`: `?scenario=...&event=...&gameMode=...`). This is the tool that produces booth QR links, so §9's "regenerate QR codes" step runs *through* this file. Needs: path rename, `scenario`→`category` param, `category_id` API rename |
| **`guide.html`** | — | **Keep.** Facilitator answer sheet — fetches `categories.json`, `<cat>/index.json`, `<ep>/meta.json`, then `puzzles.json`/`cards.json`/`rooms.json` directly (`:52-76`). Needs path rename. Independent of the engine, so it won't break loudly — it'll just 404 silently |
| `puzzle-test-*.html` | 11 files | **Decide, don't assume.** These are *prescribed convention*, not cruft: `.kiro/agents/game-engine/AGENT.md:66` instructs authors to "create a test page `app/puzzle-test-<name>.html`" per new puzzle. But only 11 exist for 75 puzzles — the convention was abandoned in favor of `tools/puzzle-tester.html`. **Recommendation: delete all 11 and remove the instruction from `game-engine/AGENT.md`,** consolidating on `puzzle-tester.html`. Requires the §18 doc update to land, or authors keep generating them |
| `VERSION` | 1 | Keep; becomes the source for generated `apps/version.js` (§8) |

### Repo root

| Path | Disposition |
| --- | --- |
| `puzzle-rogue.html` | Prototype. Referenced by `docs/game-systems.md:99` ("café order system is prototyped in `puzzle-rogue.html`") — its production form is `app/puzzle/cafe-order-lock.js`, which ships. **Recommendation: delete, update that doc line.** Don't delete silently — the doc reference makes it look load-bearing |
| `puzzle-test-ep0.html`, `puzzle-test-finale.html` | Unreferenced prototypes. **Delete** |

### Other directories

| Path | Disposition |
| --- | --- |
| `tools/validate-progression.js` | **Extend** — add the `ui`-resolves check (§5). Path constants update |
| `tools/puzzle-tester.html` | **Keep, and refactor onto the registry.** It currently duplicates the dispatch logic (its own `mountHexDecoder` at `:1251`, `:856`) — a second copy of the mapping that can drift from the first, which is the §2.1 failure mode again. Post-registry it should import registry entries |
| `tools/bump-and-deploy.sh` | **Rewrite** — drop the `sed`, emit `version.js`, set cache headers, drop `/*` invalidation, call `build-categories.js`, sync `categories/` (§6, §8) |
| `tools/{cards_to_images,narrative_to_voice,resize_images,ep3_generate_all_images}.py` | **Path updates only.** They consume `image-style.json` + `cards.json`/`narrative.json` — schema frozen, so logic is untouched |
| `tools/vox-generator/` | **Delete** — 7 scripts, 865 lines, plus an `output/` dir. Generator for voxel map tiles that were never committed and whose renderer is being dropped (§19) |
| `server/dev-server.js` | Modify: `scenarioId` → `categoryId` (6 occurrences), path serving. In-memory state only — no data migration |
| `tests/` | See §17 |
| `docs/*` | Path updates; `REVIEWER-GUIDE.md` and `blueprints/ep5-quick-bites-draft.md` contain `scenarios/` |
| `.kiro/`, `.quickwork/` | See §18 |
| `playwright.config.js` | Note: `webServer` runs `npx http-server . -p 3000`, **not** `server/dev-server.js` (which `project.md` documents as the dev server). Two different servers — e2e tests never exercise the leaderboard backend. Keep, but know this |
| `package.json` | Scripts reference test paths only; low impact |

---

## 15. Runtime mode matrix

**Six orthogonal runtime dimensions.** None are documented together anywhere in v1, and §11 step 7's "verify whole" is meaningless without them — a next agent will test the default path, see green, and ship broken challenge mode.

| Dimension | Values | Set by | Where it lives |
| --- | --- | --- | --- |
| **Guest** | on / off | `?mode=guest` | `index.js:30`. Skips name entry, leaderboard registration, and flush (`:32`, `:59-60`, `:383`, `:512-515`) |
| **Admin** | on / off | `?admin=true` | `index.js:366`, `initAdmin()` `:2045`. Exposes room-jump, force-reveal, force-solve, skip-to-end, add-time |
| **Game mode** | `normal` / `challenge` | `?gameMode=` → localStorage (`index.js:4-5`) | `engine.js:67-84`. **Destructive in-place mutation**: merges `p.challenge` into puzzles and `c.challenge` into cards, then `delete`s the key. **41 `challenge` blocks across 5 episodes** (`aws/ep0`, `aws/ep1`, `aws/ep4`, `bible/ep0`, `bible/ep1`). Documented in `.kiro/skills/challenge-mode/SKILL.md` |
| **Role / lane** | `builder` / `planner` / `strategist` | localStorage `resolve_role`, switchable mid-game (`setRole()` `:145`) | `ROLE_META` `:123`, `resolveRoleCfg()` `:132`. Config keys with a `_<role>` suffix override their base key. Switching **re-mounts the open puzzle** (`:150`) |
| **Locale** | `en` + per-episode opt-in | intro toggle → `engine.applyLocale()` | `engine.js:86-131`, `:135`, `t()` `:132`. Only 2 episodes ship locales (`ep6-the-bolt`, `ep8-macet`) |
| **Multiplayer** | solo / event | `?game_id=` or `?event=` | `LeaderboardClient` `engine.js:545`, 10s periodic flush, server-authoritative timer (`syncTimer` `:457`) |

**Interactions that must keep working — the non-obvious ones:**

- **Challenge × role**: challenge merges `config` overrides; role resolution reads `_<role>`-suffixed keys. Both mutate the same config object. Order matters, and it's implicit in v1. §4.2's `puzzleConfigFn` must preserve it.
- **Challenge × save/restore**: `engine.js:67-84` mutates loaded data and deletes the `challenge` key. A save made in challenge mode, restored after `localStorage.gameMode` changed, loads different puzzle data than it saved against.
- **Role switch × open puzzle**: re-mount mid-puzzle must not lose progress or double-fire `onSolve`.
- **Guest × leaderboard**: every leaderboard call site needs the guest guard. Easy to miss one when adding hooks.
- **Locale × puzzle answers**: `project.md` rule — answers must never be translated. Nothing enforces it in code.

**Minimum verification matrix for §11 step 7:** normal/challenge × 3 roles on the 5 challenge-carrying episodes; guest and non-guest on one episode; both locale episodes in both languages; admin mode once; one multiplayer session end-to-end.

---

## 16. Data reality vs. what the docs claim

Discrepancies a next agent will otherwise discover by crashing into them.

**"9 required JSON files" is wrong in two directions.**

- The **engine loads 8** (`engine.js:47-56`): `meta, narrative, cards, combinations, puzzles, events, scoring, rooms`. `rooms.json` has a `.catch(() => ({rooms: []}))` fallback; the other 7 do not — a missing or malformed file rejects `Promise.all` and the episode dies with an unhandled rejection.
- **`image-style.json` is never fetched at runtime.** It exists only for the Python image-generation tools. It is a 9th *authoring* file, not a 9th *runtime* file. Any v2 loader written against "9 files" will 404 or mis-scope.

**`ep5-quick-bites/npcs.json` is a 10th file with zero consumers.** Only that episode has it; nothing in `app/`, `tools/`, or `tests/` reads it. Either dead data or an unfinished feature. **Decide during step 6** — don't carry it forward silently.

**Optional `meta.json` fields, present on some episodes only.** A v2 loader must treat each as absent-by-default:

| Field | Read at | Note |
| --- | --- | --- |
| `background` | `applyEpisodeBackground()` `:246` | Silent no-op if absent |
| `learning_recap` | `renderLearningRecap()` `:258` | Opt-in; drives the AIDLC card |
| `end_title` | `showEndScreen()` `:2178` | Falls back to `'Mission Complete'` |
| `lore_label` | `:2245` | Falls back to `'Memory Fragments'` |
| `id` | `engine.js:465` | **Falls back to the literal string `'game'`** — so two episodes missing `id` would share one save slot |

**`assets/` exists on only 5 of 15 episode folders** (`aws/ep0`, `aws/ep0.5`, `aws/ep5`, `aws/ep6`, `aws/ep8`). The other 10 have no cover art; `home.js:112` hides broken images via `onerror`. Missing assets are *normal*, not a bug — don't "fix" them, and don't write a loader that requires them.

**`locales/` exists on 2 of 15** (`aws/ep6`, `aws/ep8`).

> **§16 is extended by §26**, which maps `rooms.json`/`cards.json`/`events.json`/`combinations.json` exhaustively. §26 contains the single most dangerous schema fact in the repo: **`requires_item` and `consumes_item` are `int` OR `array<int>`, mixed within the same episode**, and the engine silently normalizes both. Any rebuild that assumes one shape breaks 7 episodes.

**`IMAGE-PROMPTS.md` sits inside 4 episode folders** (`aws/ep4`, all 3 bible episodes) — authoring notes committed alongside data. Harmless; keep, but a folder-shape validator shouldn't reject it.

---

## 17. Test coverage baseline (exact)

Two independent suites with **different** episode coverage. Neither alone tells you if v2 is safe.

| Episode | Unit (`happy-path.test.js`) | E2E (`tests/e2e/`) |
| --- | --- | --- |
| `aws/ep0-boot-sequence` | ✅ | ✅ `ep0.spec.js` |
| `aws/ep0.5-cloud-onboarding` | ✅ | ❌ |
| `aws/ep1-awakening` | ✅ | ❌ |
| `aws/ep2-day-one` | ✅ | ❌ |
| `aws/ep3-kings-errand` | ❌ | ❌ |
| `aws/ep4-spec-architect` | ✅ | ❌ |
| `aws/ep5-quick-bites` | ❌ | ✅ `ep5-smoke.spec.js` |
| `aws/ep6-the-bolt` | ✅ | ❌ |
| `aws/ep7-macet` | ✅ (`:686`) | ❌ | *(being deleted — remove this block, §7)* |
| `aws/ep8-macet` | ❌ | ❌ |
| `bible/ep0-masters-investigation` | ❌ | ❌ |
| `bible/ep1-philips-impossible-math` | ✅ (`:492`) | ✅ `bible-ep1.spec.js` |
| `bible/ep2-153-fish` | ❌ | ✅ `bible-ep2.spec.js` |
| `corporate/breach-protocol` | ❌ | ❌ |
| `corporate/filing-frenzy` | ❌ | ❌ |

**Zero coverage of any kind — 5 episodes (post-ep7-deletion):** `aws/ep3-kings-errand`, `aws/ep8-macet`, `bible/ep0-masters-investigation`, `corporate/breach-protocol`, `corporate/filing-frenzy`.

Two facts worth pausing on: **`ep8-macet` — the episode with the live `traffic-lane-lock` crash — has no test at all**, which is exactly why the bug shipped. And **the entire `corporate` category is untested**, so a v2 regression there would be invisible.

`tests/puzzle-locks.test.js` tests puzzle classes in isolation (`DeductionGridLock`, `PushLuckLock`, `DecayLock`, `FogMapLock`, …) — orthogonal to episode coverage, and unaffected by the registry since it instantiates classes directly.

**Step 1(a) target:** baseline specs for the 5 uncovered episodes, written against v1 and passing, before any v2 code exists.

---

## 18. Authoring pipeline updates (`.kiro/`, `.quickwork/`)

> **Answer to "now or later": later — but scoped, tiered, and scheduled now, and it gates cutover-complete.**

**Why later:** these files are prose instructions for authoring agents. No v2 code imports them, so they never break a build. Writing them against hook names and registry shapes that aren't final until build steps 3-4 means writing them twice.

**Why they can't be skipped:** the first person to author an episode after cutover follows them. Stale instructions mean generated files land in a directory that no longer exists, or a new puzzle gets registered by a method that no longer works. This is a **cutover-completion blocker**, not a nice-to-have.

Total surface: **4,828 lines** across 21 `.kiro` files + 1 `.quickwork` file.

### Tier 1 — mechanical path edits (safe to do any time, including now)

12 files, `scenarios/` → `categories/` plus §7's episode-slug mapping. No design dependency:

`agents/{asset-agent,deploy-agent,game-engine,locale-translator,scenario-data}/AGENT.md`; `skills/{card-images,deploy,episode-review,locale-translation,narrative-voice,scenario-blueprint}/SKILL.md`; `.quickwork/skills/resolve-episode-builder/SKILL.md`.

**12, not 13** — `skills/voxel-map/SKILL.md` is deleted rather than edited (§19).

Highest reference counts: `skills/locale-translation/SKILL.md` (11), `skills/deploy/SKILL.md` (6), `.quickwork/.../SKILL.md` (6).

### Tier 2 — substantive rewrites (must wait for build steps 3-4)

These describe *mechanisms* v2 replaces. Doing them early guarantees rework:

| File | Lines | Why it needs a rewrite, not an edit |
| --- | --- | --- |
| `skills/deploy/SKILL.md` | 134 | **Actively wrong after §8.** `:41` describes the deploy script as rewriting `?v=` on every tag; `:48` explains the `sed`; **`:49` instructs authors: "If you add a new `<script>` or `<link>` tag, initialize it with `?v=<current VERSION>` so the bump script's regex picks it up."** In v2 the registry injects scripts and there are no tags to stamp. `:56-57` documents the manual `sed` fallback. `:77-82` documents the `/*` invalidations being dropped. |
| `agents/game-engine/AGENT.md` | 97 | The engine map itself: `:15` `app/index.html`, `:17` `app/puzzle/*.js`, `:19` `app/puzzle-test*.html`, `:44` "UI (`index.html`)", `:87` the `?scenario=` URL contract. **`:62-66` is the create-a-puzzle workflow** — the registry replaces steps 1-4, and step 5 ("create a test page `app/puzzle-test-<name>.html`") is the instruction that generated the 11 harness files in §14. Must be rewritten against the registry, and is where the `apps/` read-only boundary (§3) gets documented for agents. |
| `skills/puzzle-components/SKILL.md` | 904 | Largest single file. Documents puzzle registration and component conventions — 11 references to v2-changed subsystems. Needs a registry-shaped rewrite of the registration section; the per-component reference material should survive intact. |
| `agents/scenario-data/AGENT.md` | 201 | Emits the episode JSON. Schema frozen, so mostly Tier 1 — but must learn the new folder naming (`{NN}-{slug}`, no `ep` prefix, no decimals) and the optional `lib/` overlay. |
| `agents/qa-agent/AGENT.md` | 195 | Test commands and paths. Should also gain §15's mode matrix — it currently has no notion that challenge mode or role lanes need separate verification. |
| `skills/mechanics/SKILL.md` | 1050 | ✅ **AUDITED — zero changes needed.** All 1,050 lines are pure design content; every "Puzzle component:" line names a lock *type*, never a file path. Its one apparent hit (`L193: "The app/screen has interactive elements"`) is prose, not a path — **do not let a path-rename sweep turn it into `apps/screen`.** |

### Also needs writing, not just editing

- `project.md` (323 lines) — every path, rule, and workflow describes v1. Its "⛔ NEVER modify `app/index.js`" section is superseded by the hook system + the `apps/**` CI boundary. **Full rewrite.**
- `CONTRIBUTING.md` — contains `scenarios/` references; same treatment.
- `README.md` — structure tree and "Adding a New Episode" steps.
- **New doc needed: the hook/event/slot reference** (§4). Without it the extensibility system is undiscoverable, and authors will keep editing core because they don't know there's an alternative — which is the exact v1 failure this rebuild exists to fix.

### Audited scope — ~134 lines total, not a rewrite of 4,828

Gap 9 closed. Every file read in full; line-level verdicts:

| File | Lines | Factually wrong | Verdict | Lines to change |
| --- | --- | --- | --- | --- |
| `skills/mechanics/SKILL.md` | 1050 | **0** | none needed | **~0** |
| `skills/puzzle-components/SKILL.md` | 904 | `L868-878` (Test Pages section), `L889`, `L894` | partial | ~28 |
| `agents/game-engine/AGENT.md` | 97 | `L19`, `L52`, `L63`, `L66`, `L87` | partial | ~20 |
| `skills/deploy/SKILL.md` | 134 | `L29`,`31`,`35`,`41`,`48`,**`49`**,`53`,`56`,`57` | partial | ~28 |
| `agents/scenario-data/AGENT.md` | 201 | **`L124-139`**, `L44`, `L46`, `L164`, `L168`, `L195` | partial | ~25 |
| `agents/qa-agent/AGENT.md` | 195 | `L99`, `L171`, + `L91-164` conditional | partial¹ | ~15 (or ~90) |
| `.quickwork/.../SKILL.md` | 187 | `L68`,`71`,`77`,`138-141`,**`161`**,`177` | partial | ~18 |

¹ Escalates to full rewrite if the rebuilt UI changes DOM ids/classes.

**Good news: ~95% of the corpus is pure content.** `puzzle-components`' 850-line API catalogue, `mechanics` entirely, and most design guidance survive untouched. Damage concentrates in headers, episode labels, and procedure sections.

**The three worst offenders, in order:**

1. **`skills/deploy/SKILL.md:49`** — "If you add a new `<script>` or `<link>` tag, initialize it with `?v=<current VERSION>` so the bump script's regex picks it up." Wrong **three ways** after §8: there are no per-tag `?v=` params, there is no regex left to feed, and authors must not add script tags to `apps/index.html` at all. It instructs an author to edit a read-only file to add a parameter that no longer exists.
2. **`agents/game-engine/AGENT.md:63`** — "Register it in the puzzle component system." Insidious because it reads as *still correct* while pointing at two deleted edit sites (the `index.html` script tag and the `index.js` if/else branch), and the surrounding workflow never names the registry. Also `L52` claims components "register via `window.PuzzleLocks`" — **already false today**, `PuzzleLocks` has zero occurrences in `app/`.
3. **`agents/scenario-data/AGENT.md:124-139`** — the `scoring.json` schema block shows only the 5 implemented fields. After §23 implements the other 9, an author following this schema **ships an episode that forfeits scoring features that now actually work.** This is the largest content gap in the corpus.

**Cross-cutting gap: the hook system appears in zero of the seven files.** It's a new authoring surface with three new file types, and it's what makes "never edit `apps/`" actionable rather than merely prohibitive. `scenario-data/AGENT.md` and `.quickwork/resolve-episode-builder/SKILL.md` need it most — they own the episode folder and the build pipeline.

### Three answers these rewrites depend on

Not answerable from the plan as written; they change the verdicts above:

1. **Does the rebuilt UI preserve the DOM ids/classes** at `qa-agent/AGENT.md:152-161` (`#intro-screen h2`, `.discover-btn`, `#puzzle-popup.open`, `#btn-combine-mode`, `#end-title`) **and the `window.engine` global?** Governs whether qa-agent is 15 lines or 90, and whether the playtest workarounds in `.quickwork`'s skill still work.
2. **Does `?scenario=` keep its param name and `../` relative shape?** §7 renames the directory but doesn't state the param's fate. Affects `game-engine:87`, the whole E2E suite, and `admin.html`'s generated links (§14).
3. **Where do `app/VERSION` and `scenarios/categories.json` land** — `apps/VERSION` and `categories/categories.json`? `deploy/SKILL.md:56`'s manual fallback bumps `VERSION` without emitting `version.js`, which would silently break cache-busting (§8).

✅ **Checked: `docs/puzzle-taxonomy.json` has zero `ep7`/`macet` references** — the taxonomy is episode-agnostic, so deleting ep7 doesn't touch it. `.quickwork`'s Step 2 keeps working.
✅ **Confirmed `window.PuzzleLocks` does not exist** (0 occurrences in `index.js` and `engine.js`), while `window.engine` **does** (1 occurrence). So `game-engine/AGENT.md:52` is documenting a registry that was never built — and v2 is about to build the thing that line describes.

### Scheduling

Insert as **step 8.5** in §11, between cutover and boundary-locking. Tier 1 may be pulled forward to step 6 (alongside the rename) since it's the same mechanical edit. Cutover is not "done" until Tier 2 and the new hook reference exist.

---

## 19. Dropped: the voxel map

**Decision: v2 removes the voxel map renderer entirely.** `meta.map_style: "voxel"` stops being a supported value.

**Why it's a clean drop, not a feature loss:** the voxel path already renders nothing. Its tiles come from `ASSET_BASE + '/25maps'` (`index.js:1851`) and **that directory does not exist anywhere in the repo** (`find . -iname "*25maps*"` → 0 hits) — every tile 404s and is hidden by an inline `onerror`. So the only episode using it has been falling back to invisible tiles in production.

**No episode data needs to change.** `bible/ep2-153-fish` is the sole user (`grep -rn '"map_style"' scenarios/*/*/meta.json` → 1 hit) and its `rooms.json` **already carries 5 `map_pos` entries**. Removing the one `meta.json` line makes it fall through to the isometric renderer that 13 of 15 episodes already use, with no other edits.

### Deletion checklist

| Target | Detail |
| --- | --- |
| `app/index.js:1778` | The dispatch line `if (engine.meta.map_style === 'voxel') { renderMapVoxel(...); return; }` |
| `app/index.js:1849-1918` | `renderMapVoxel()` — ~70 lines. Takes with it the `+100` centering constant, the third copy of `'📍 You are here'`/`'⚠️ N actions remaining'`/`'✅ Explored'`/`'Go Here'`, the third copy of the tools/NPC exclusion rule, the English-room-name slugify at `:1897`, and the `iso-info` panel duplicate at `:1852` |
| `app/index.css:166-181` | All `.vox-*` rules — `.vox-floor`, `.vox-tile` (+6 state variants), `.vox-connector` (+2 variants) |
| `scenarios/bible-jesus-miracles/ep2-153-fish/meta.json:4` | Remove `"map_style": "voxel"` |
| `tools/vox-generator/` | **Delete the whole directory** — 7 scripts (865 lines) + 5 committed `.vox` binaries in `output/`, 116K total. Verified fully self-contained: nothing outside it imports it (`vox-writer.js` is required only by its 5 sibling scripts), no `package.json` script references it, and its only external documentation is `voxel-map/SKILL.md`, also being deleted |
| `package.json` → `dependencies.sharp` | **Removable.** `sharp@^0.34.5` is required by exactly one file — `tools/vox-generator/remove-bg.js`. Verified: `grep -rln "require('sharp')" --include=*.js .` → that file only. Deleting vox-generator makes `sharp` the **only** entry in `dependencies`, and it becomes dead. Dropping it leaves the project with dev-dependencies only (`@playwright/test`) |
| `.kiro/skills/voxel-map/SKILL.md` | 147 lines. Removes one of §18's path-edit targets (13 → 12). Also the only doc describing the `.vox` → PNG → `25maps/` pipeline |

**Knock-on effects:**

- §13.4 bug 10 is resolved by deletion — no fix required.
- §13.6i's three-way map fork becomes two-way.
- §14's `tools/vox-generator/` row said "not inspected — check for `scenarios/` paths." Now moot: the whole directory goes.
- §18's Tier 1 list drops from 13 files to 12.
- **`sharp` leaves `package.json`**, so v2 ships with zero runtime dependencies. Worth doing deliberately: it removes a native-binary install step from onboarding.
- The `bible/ep2-153-fish` baseline spec (§11 step 1a — ep2 has e2e coverage today) must be re-captured **after** the drop, since its map rendering changes from voxel-with-invisible-tiles to iso.

**Verify before deleting:** load `bible/ep2-153-fish` locally with `map_style` removed and confirm the iso map renders its 5 rooms correctly. That's the only behavioral risk in the whole change.

---

## 20. Pre-build checklist for the next agent

Read before writing code. Each item is a place this plan has *already* been wrong once, or a fact that isn't discoverable from the code without a targeted search.

**Verify these are still true** (this plan is a snapshot; the repo moves):

1. `grep -rln "scenarios/" --include={*.js,*.html,*.md,*.json,*.py,*.sh} . | grep -v node_modules | grep -v "^./scenarios/"` → §7 says 33 files.
2. `ls app/puzzle | wc -l` → 75. `grep -c 'script src="puzzle/' app/index.html` → 60. `grep -c "puzzle.ui === " app/index.js` → 65. If these three still disagree, §2.1's analysis holds.
3. `tools/vox-generator/` — **not inspected by this plan.** Check it for `scenarios/` paths and hardcoded episode IDs.
4. Whether `ep8-macet`'s `traffic-lane-lock` crash is still unfixed (§2.1).

**Don't assume:**

4b. **There are 10 live bugs plus 4 data-integrity defects, not 2** (§2.1 + §13.4). Fix them on v1 first — a rebuild that ports them forward makes them permanent, and one (`dial-lock`'s forked `onSolve`) gets *harder* to spot after the registry rewrite.
4e. **The scoring system is partly fictional.** Nine `scoring.json` fields have zero code behind them, including the lore bonuses 12 of 15 episodes declare (§13.4 bug 9). `ep4-spec-architect` scores `NaN` outright (bug 7). **This is a product decision that must be answered before writing baseline specs** — it determines what they assert (§11 step 1d).
4c. **`getPuzzleConfig()` returns config by reference and branches mutate it** (§13.6a). The registry must deep-clone per mount. This is the highest-consequence correctness item in the rebuild.
4d. **Class names don't match filenames** — `app/puzzle/4digits-lock.js` exports `DigitLock` (§13.6h). Read the actual `class` declaration for all 75 files when writing registry entries.
5. **The episode JSON schema is 8 runtime files, not 9** (§16). `image-style.json` is tooling-only.
6. **`app/admin.html` and `app/guide.html` exist and matter** (§14). Neither is imported by the engine, so nothing fails loudly when they break — they just 404 quietly. `admin.html` is how event links get generated.
7. **`app/puzzle-test-*.html` files are a documented convention**, not stray cruft (`game-engine/AGENT.md:66`). Deleting them requires updating that instruction (§18).
8. **Missing `assets/` is normal** — 10 of 15 episodes have none (§16).
9. **`.kiro` is not schema-only.** 12 files hardcode paths; `skills/deploy/SKILL.md` documents the exact cache-bust mechanism v2 removes (§18).
10. **There are two dev servers** — `server/dev-server.js` (documented in `project.md`) and `npx http-server` (what Playwright actually runs). E2E tests never touch the leaderboard backend (§14).

**Sequence rules that will bite if broken:**

11. Write the 5 missing baseline specs **before** touching any code (§17). Otherwise the corporate category and ep8 have no reference point.
12. Extract inline CSS **before** wiring style overlays (§11 step 5) — overlays can't cascade over `style.cssText`.
13. Validate the hook design on the `_usedAidlc` + `renderLearningRecap` case **before** building the other ~20 hooks (§11 step 3).
14. Verify the §15 mode matrix, not just the default path. Challenge mode mutates loaded data in place and interacts with role resolution; both are easy to break invisibly.

---

## 21. Execution model — closed loop per unit of work

§11 gives the *order*. This gives the *contract* every unit obeys, so work can be handed to parallel agents without any of them needing to hold the whole plan in context.

### 21.1 The loop

```
build → test → validate → feedback → (build | done)
```

- **build** — make the change. Write set declared up front (§22).
- **test** — an automated check that passes or fails, no judgment. If a unit has no automatable check, it is scoped wrong: split it until it does.
- **validate** — the judgment gate. Does this satisfy intent, not just the assertion? Catches "the test passes because the test is wrong."
- **feedback** — a failure is information, not just a retry signal. It names *which upstream node was wrong* and writes the correction back into this document.
- **build** — re-enter, either at this node or the upstream one feedback identified.

The loop is not decoration. This plan has already been wrong four times in ways only a read of the actual code caught: `_usedAidlc` attributed to ep6 instead of ep8, `.kiro` declared schema-only when 12 files hardcode paths, test coverage stated as 4 e2e episodes when two suites cover different sets, and `tools/vox-generator/` marked "not inspected" when it was deletable. **Assume the same error rate in the parts not yet verified.** Every node writing its correction back to this doc is what keeps that error rate from compounding.

### 21.2 Node contract

Every unit of work declares all nine fields. Missing fields are a definition bug, not an implementation detail.

| Field | Meaning |
| --- | --- |
| `id` | Stable identifier, referenced by `depends_on` |
| `depends_on` | Node ids that must reach `done` first. Empty = startable immediately |
| `write_set` | **Every path this node may modify.** Two nodes in the same parallel group must have disjoint write sets — this is what makes fan-out safe |
| `read_set` | Paths it needs but won't modify. Overlap is fine |
| `build` | The change to make |
| `test` | The command that must exit 0 |
| `validate` | The judgment question a reviewer must answer yes to |
| `feedback` | On failure: which upstream node to suspect, and what to record in this doc |
| `done_when` | Unambiguous completion condition |

### 21.3 Rules that make parallel execution safe

1. **Disjoint write sets within a parallel group.** The single biggest hazard: 13 episode-port nodes all wanting to edit `apps/index.js` is not parallel work, it's a merge conflict with extra steps. Where writes genuinely must overlap, either serialize those nodes or give each an isolated worktree and merge deliberately.
2. **No node depends on another's in-progress state** — only on its `done`. If node B needs to see B-relevant changes from A, that's a `depends_on`, not a timing assumption.
3. **Gates are barriers, not suggestions.** A gate node (e.g. "hook design validated on ep8") blocks its whole downstream group. Fan-out past a red gate produces work that has to be thrown away.
4. **Every node is revertible alone.** If reverting node X requires also reverting Y, they are one node.
5. **Findings flow back to this document, not into a side channel.** A node that discovers the plan was wrong updates the relevant section and says so. That is the `feedback` arc, and it is what a later node reads as its `read_set`.
6. **`test` never asserts current behavior on a known-buggy path.** §13.4's bugs must be fixed before baseline capture, or the specs freeze the bugs as the contract.

### 21.4 Where the loop tightens vs. loosens

Not every node deserves the same rigor. Calibrate:

| Work type | Loop weight |
| --- | --- |
| Mechanical path renames, `.kiro` Tier 1 edits, dead-code deletion | Light — `test` is "grep finds no stale references", `validate` is a skim |
| Baseline spec authoring | Heavy `validate` — a spec that passes for the wrong reason is worse than no spec |
| Hook system, puzzle registry | Heaviest — these are the two nodes everything downstream sits on. Full loop, and the ep8 validation gate before fan-out |
| Episode ports | Light `build`, heavy `test` — the baseline spec *is* the test |
| Cutover | No loop. One shot, rehearsed beforehand, with the §9 rollback window |

---

## 22. GRAPH_SPEC scaffold

The migration as a dependency graph. **This section exists to be turned into a machine-readable `GRAPH_SPEC` and executed with parallel fan-out.** It is not yet complete — node write sets need confirming against the real tree — but the shape, the gates, and the parallel groups are settled.

### 22.1 Parallel groups and gates

```
G0  SCORING         ─── scoring-engine   (§23; single-writer on engine.js)
                          │              (was a decision gate; now decided)
                          │
G1  FIX + BASELINE  ─┬─ fix-bug-1 … fix-bug-10        [parallel, disjoint files]
                     ├─ spec-ep3, spec-ep8, spec-bible-ep0,
                     │  spec-corp-breach, spec-corp-filing   [parallel, 1 file each]
                     ├─ spec-scoring × 13              [parallel; asserts §23 scores]
                     └─ leak-inventory (§13.4 completion)     [read-only]
                          │
                     ══ GATE A: all 13 episodes have a green baseline spec ══
                          │
G2  SCAFFOLD        ─┬─ apps-copy                     [serial: creates the tree]
                     ├─ delete-app-tools, delete-ep7,
                     │  delete-voxel, delete-dead-puzzles     [parallel after apps-copy]
                     └─ kiro-tier1 (12 files)         [parallel, fully independent]
                          │
G3  HOOKS           ─── hook-registry                 [serial: one subsystem]
                          │
                     ══ GATE B: ep8 port clean (hook design proven) ══
                          │
G4  REGISTRY        ─┬─ registry-core                 [serial]
                     └─ registry-entries × ~58        [parallel in batches after core]
                          │
                     ══ GATE C: all 13 baseline specs green on the registry ══
                          │
G5  CSS             ─┬─ css-layer-decl                [serial, 1 line in index.css]
                     ├─ css-wrap × 75                 [PARALLEL, 1 file each — §4.4a]
                     └─ css-inline-extract → css-overlay   [serial after both]
                          │
G6  PORT EPISODES   ─── port × 13                     [parallel, 1 episode dir each]
                          │
G7  CATEGORIES      ─┬─ category-meta × 3
                     └─ build-categories-script + CI check
                          │
G8  RENAME          ─── rename-sweep                  [serial: touches 33 files]
                          │
                     ══ GATE D: full §7 + §15 + §20 verification ══
                          │
G9  BACKEND         ─── backend-migration (§9 orders 1-9)  [external team]
                          │
G10 CUTOVER         ─── cutover (§9 sequence)         [serial, no loop]
                          │
G11 DOCS + BOUNDARY ─┬─ kiro-tier2, project.md, CONTRIBUTING.md,
                     │  README.md, hook-reference     [parallel]
                     └─ ci-apps-boundary              [last]
```

### 22.2 Why the gates sit where they do

- **G0 still blocks everything**, now as a build node rather than a decision. Baseline specs assert scores, and §23 changes what every episode scores (`ep7` moved 3 star-tiers in the proof table). Capture baselines before G0 and you capture the bug as the contract. Note `scoring-engine` writes `apps/engine.js`, so it cannot run concurrently with `hook-registry` (G3) — same file.
- **GATE A** — no v2 code before every episode has a green reference. 5 of 13 have no test today (§17), and `ep8-macet` is both the most feature-heavy and currently crashing.
- **GATE B** is the highest-leverage gate in the plan. `ep8-macet` alone exercises 6 of ~23 Tier A hooks (§13.2, plus `scoreCalcFn` from §23.3). If the hook design can't express it cleanly, that's a design fix — cheap now, expensive after 12 more ports assume the design.
- **GATE C** — the registry rewires every episode's load path. It's the largest-blast-radius change in v2.
- **GATE D** before handing off to the backend, because the §9 cutover has no rollback after its final step.

### 22.3 The real fan-out wins

| Group | Nodes | Note |
| --- | --- | --- |
| G1 baseline specs | 5 | One spec file each — perfectly disjoint |
| G2 `.kiro` Tier 1 | 12 | Independent files, mechanical edit, no shared state |
| G4 registry entries | ~58 | Batch them; each is one registry entry mapping `ui` → class + config. **Read each file's actual `class` declaration — `4digits-lock.js` exports `DigitLock` (§13.6h)** |
| G5 `css-wrap` | **75** | One `apps/puzzle/*.js` each. Wrap the existing injected CSS in `@layer components { … }` — no CSS is rewritten, only enclosed. The single largest and cleanest fan-out in the migration (§4.4a) |
| G6 episode ports | 13 | One episode directory each. **8 of 13 need no hooks at all (§13.2)** — those are near-trivial |
| G11 docs | 5 | Independent files |

Sequential bottlenecks, unavoidable: `apps-copy`, `hook-registry`, `registry-core`, `css-extract`→`css-overlay`, `rename-sweep`, `cutover`.

### 22.4 Example node, fully specified

```yaml
id: port-ep8-macet
depends_on: [hook-registry, registry-core, spec-ep8, fix-bug-1]
write_set:
  - categories/aws/09-macet/**          # includes new lib/hooks.js
read_set:
  - apps/hooks.js
  - apps/registry.js
  - docs/v2-plan.md#13.2                # its own hook requirement list
build: |
  Move out of apps/ into categories/aws/09-macet/lib/hooks.js:
    endImageFn        (replaces index.js:2154 _usedAidlc + the room-600 collision)
    endScreenExtraFn  (replaces renderLearningRecap, index.js:258)
    episodeBackgroundFn
    learningCardFn
    puzzleConfigFn    (role-variant _<role> suffix resolution)
  Zero behavior change.
test: npx playwright test tests/e2e/ep8-macet.spec.js
validate: |
  Does ep8 render identically to the pre-port baseline across all 3 role lanes
  and both locales (en, id)? Does apps/ still contain zero ep8-specific strings?
feedback: |
  If a hook can't express its case, suspect hook-registry, not this node.
  Record the shortfall in §4.2 and re-open GATE B before porting anything else.
done_when: |
  Spec green; grep for 'aidlc|ctx-aidlc|wordlock-bolts|Requirements Tollbooth'
  in apps/ returns zero hits.
```

### 22.5 Verified write sets and the conflicts they expose

Derived file-by-file. **Two planned fan-outs were not actually parallel** — caught here rather than mid-run.

#### Single-writer files (these serialize their nodes, no exceptions)

| File | Nodes that write it | Required order |
| --- | --- | --- |
| `apps/engine.js` | `scoring-engine` (G0), `hook-registry` (G3), `registry-core` (G4) | Strictly serial, in that order. **This is the graph's main spine** — G0 → G3 → G4 cannot overlap |
| `apps/index.js` | `hook-registry`, `registry-core`, `css-inline-extract`, `star-renderer` (part of `scoring-engine`) | Serial. Largest file (2,283 lines) and the most contended |
| `apps/index.html` | `registry-core` (removes 60 script tags), `version-stamp` (§8) | Serial, or merge into one node |
| `apps/index.css` | `css-layer-decl`, `css-inline-extract` | Serial |
| `tools/bump-and-deploy.sh` | `version-stamp`, `build-categories-script` | Serial, or one node |
| `tools/validate-progression.js` | `ui-resolves-check` (§5), `scoring-schema-check` (§23.6) | Serial, or one node — both extend the same validator |

#### ⚠️ Conflict 1 — `registry-entries × ~58` all writing `apps/registry.js`

As drafted in §22.3, all ~58 registry-entry nodes write one file. **That is 58 nodes contending for a single file — not parallel work.**

**Resolution: one file per entry.** `apps/registry/<ui-type>.js`, each self-registering, plus a generated `apps/registry/index.js` manifest. Then the ~58 nodes have genuinely disjoint write sets and the fan-out is real. The manifest is generated, so it is one separate single-writer node that runs after.

This is a design change forced by fan-out safety, and it's a good one independently: it mirrors the `apps/puzzle/<type>.js` layout, and it means adding a puzzle type touches one new file instead of editing a shared one — the same property that makes §3's `apps/**` CI boundary workable.

#### ⚠️ Conflict 2 — `fix-bug-*` nodes overlap each other and G0

The 10 bug fixes (§13.4) are **not** disjoint:

| Bug | Writes | Conflicts with |
| --- | --- | --- |
| 1 `traffic-lane-lock` | `app/index.html` | — |
| 3 `addPenalty` missing | `app/engine.js` + `app/index.js` | bugs 5, 6, 7, 8; G0 |
| 4 voice audio | decision only, no code | — |
| 5 `dial-lock` forked `onSolve` | `app/index.js` | bugs 3, 6 |
| 6 hardcoded card 45 | `app/index.js` | bugs 3, 5 |
| 7 ep4 `NaN` score | `app/engine.js` | **This IS G0** — fold it in |
| 8 `tryCodeEntry` null deref | `app/engine.js` | bug 3, G0 |
| 9 scoring fields unimplemented | `app/engine.js` | **This IS G0** — fold it in |
| 10 voxel `25maps` | — | resolved by §19 deletion, no fix |

**Resolution:** collapse bugs 7, 8, 9 into the `scoring-engine`/`engine-hardening` node (they're all `getScore`/`tryCodeEntry` in the same file), and run bugs 3, 5, 6 as **one serial node** on `index.js`. Only bug 1 is independent. So G1's bug work is **3 nodes, not 10** — the parallelism there was illusory.

#### Genuinely disjoint — safe to fan out wide

| Group | Nodes | Write set per node |
| --- | --- | --- |
| `css-wrap` (G5) | **75** | one `apps/puzzle/<type>.js` |
| `registry-entries` (G4, after Conflict 1's fix) | **~58** | one `apps/registry/<type>.js` |
| `spec-*` baselines (G1) | 5 | one `tests/e2e/<ep>.spec.js` |
| ~~`spec-scoring`~~ | **1, not 13** | Confirmed: `tests/happy-path.test.js` contains **zero** assertions on score or stars today (`grep -n "getScore\|stars\|score"` → no matches). So this is an entirely new file, `tests/scoring.test.js`, with 13 assertion blocks — one node, one writer. This absence is also why ep4's `NaN` score went unnoticed |
| `port-episode` (G6) | 13 | one `categories/<cat>/<ep>/**` |
| `kiro-tier1` (G2) | 12 | one `.md` each |
| `category-meta` (G7) | 3 | one `categories/<cat>/meta.json` |
| `docs` (G11) | 5 | one `.md` each |
| deletions (G2) | 4 | `app/tools/`, `scenarios/aws/ep7-macet/`, voxel targets, dead puzzle files — **`delete-ep7` also writes `scenarios/aws/index.json` and `tests/happy-path.test.js`, and `delete-voxel` also writes `app/index.js` + `app/index.css` + `ep2/meta.json`.** Neither is a pure deletion; sequence them against the `index.js` spine |

**Revised fan-out total: ~171 genuinely parallel nodes** (75 + 58 + 13 + 12 + 5 + 5 + 3), against a serial spine of roughly 12 contended nodes.

### 22.6 Before generating the GRAPH_SPEC

Three things to settle, or the graph will be wrong in ways that surface mid-run:

1. ~~**Confirm every `write_set` against the real tree.**~~ **Done — §22.5.** It found two false fan-outs (the ~58 registry entries and the 10 bug fixes) and mapped the 6 single-writer files that form the serial spine.
2. **Decide the isolation mechanism.** With §22.5's fix, the wide groups (`css-wrap` 75, `registry-entries` ~58, `port-episode` 13) have genuinely disjoint write sets, so plain parallelism is safe for them. Worktrees are only needed if you also want to parallelize *across* groups that share the `index.js`/`engine.js` spine — which §22.5 says you cannot.
2b. **Confirm `@layer` browser support** against the minimum iOS target before committing to G5's approach (§4.4a). If unsupported, G5 becomes a 148KB extraction instead of a 75-file wrap.
2c. **Confirm whether `spec-scoring`'s 13 assertions land in one file or 13.** One file means they serialize.
3. ~~**Answer §12 item 12 (scoring).**~~ **Resolved — see §23.** All declared scoring fields get implemented. G0 becomes a build node (`scoring-engine`) rather than a decision gate, and it still gates G1 because baseline specs must assert post-fix scores.

---

## 23. Scoring: implement every declared field

**Decision: the episode data is right and the engine is incomplete. Implement all of it.**

### 23.1 Why implement rather than delete

The `stars` thresholds were tuned by authors who believed the bonuses were being awarded. Their own `notes` fields say so, and the arithmetic confirms it:

| Episode | `notes` claim | Score today | Stars today | Score with bonuses | Stars with bonuses |
| --- | --- | --- | --- | --- | --- |
| `ep7-macet` | "no hints, both parallel bonuses, all lore, 5+ min left **lands 5 stars**" | 60 | **2** | 97 | **5** ✓ |
| `ep6-the-bolt` | "no hints, 3+ min remaining, all 3 lore lands **4-5 stars**" | 56 | **4** | 70 | **5** ✓ |
| `ep0.5-cloud-onboarding` | "no hints, 3+ min remaining, 2 lore lands **4 stars**" | 53 | 4 | 57 | **4** ✓ |

`ep7` is three tiers below its documented intent. `ep6`'s "with bonuses" total is **exactly** its 5-star threshold of 70 — a threshold you only land on by computing it with `lore_bonus` and `all_lore_bonus` included.

This reverses the risk noted earlier in this document's drafting: implementing these fields does **not** invalidate the tuning, it repairs it. Players have been under-scored since the fields were added.

### 23.2 Unified schema — the full field set across 15 episodes

`grep`-verified. **Bold = currently implemented.** Everything else is the work.

#### Core (all 15 episodes, except ep4 — see 23.4)

| Field | Semantics | Present in |
| --- | --- | --- |
| **`base_score`** | Awarded only when `completed` | 14/15 (not ep4) |
| **`time_bonus_per_minute`** | × `floor(remainingSeconds / 60)` | 14/15 |
| **`hint_penalty`** | × `hintsUsed`. Negative value | 15/15 |
| **`wrong_combination_penalty`** | × `penalties`. Negative value | 14/15 (ep4 uses `wrong_answer_penalty`) |
| **`stars`** | `[{min, stars}]`, descending by `min`. **Not always 5 tiers** — ep4 has 3 | 15/15 |

#### Lore bonuses (12 of 15 episodes — the largest gap)

| Field | Semantics | Present in |
| --- | --- | --- |
| `lore_ids` | Card IDs that count as lore for scoring. **Not the same as `type === 'lore'`** — use this list, not a type filter | 12 |
| `lore_bonus` | Points **per** `lore_ids` card the player read. Ranges 1 (bible) – 3 (aws) | 12 |
| `all_lore_bonus` | Flat bonus when **every** `lore_ids` card was read. Always 5 | 12 |

"Read" must use the same predicate the end screen already uses at `index.js:2240`: `visibleCards.has(id) || discoveredCards.has(id) || revealedCards.has(id)`. Reuse it — don't invent a second definition.

#### Per-episode bonuses (one owner each)

| Field | Owner | Semantics | Note |
| --- | --- | --- | --- |
| `bonus_lore` | `aws/ep1-awakening` | `{card_id: 38, points: 5}` — one extra card worth more than standard lore | Simple |
| `nova_bonus` | `aws/ep3-kings-errand` | `{npc_ids: [4 ids], bonus: 3}` — all 4 NPCs consulted | `npc_ids` are **puzzle** ids, so check `solvedPuzzles`, not cards |
| `remaining_gold_bonus_per_gold` | `aws/ep3-kings-errand` | 1 point per unspent gold | **Needs state the engine doesn't have.** Gold lives inside the bazaar puzzle component (`cfg.gold \|\| 80`, `index.js:1366`). Requires the component to report its final gold — a `puzzleSuccessFn` payload or event-bus emission (§4.3a) |
| `research_bonus` | `aws/ep5-quick-bites` | `{card_ids: [4 ids], bonus: 10}` — all 4 research rooms done | Card-based, straightforward |
| `parallel_completion_bonus` | ~~`aws/ep7-macet`~~ | `{bonus: 8}` | **Zero owners after ep7 is deleted (§7). Do not implement.** |
| `lore_bonus_shared_required`, `lore_bonus_aidlc_required`, `lore_bonus_manual_required` | `aws/ep8-macet` | **Path-dependent `all_lore_bonus`.** ep8 branches (Express/AIDLC vs Manual); each route has its own required-lore set, and path-exclusive cards off the taken route don't count against you | The most complex case. `all_lore_bonus_note` in the file spells out the rule |

#### Documentation-only keys — must be explicitly ignored

`notes`, `all_lore_bonus_note`. A schema validator must allow them; the scorer must not treat them as scoring inputs.

### 23.3 The ep8 path-dependent case belongs in a hook

`lore_bonus_*_required` cannot be scored generically — the engine has no idea which route the player took. That determination is exactly what `index.js:2154`'s `_usedAidlc` hack was doing. So:

- Core implements `all_lore_bonus` against `lore_ids` by default.
- `scoreCalcFn` (§4.2, promote from Tier B to **Tier A**) lets `categories/aws/09-macet/lib/hooks.js` substitute the route-specific required set.
- The route determination lives in that same hooks file, next to `endImageFn`, which needs the identical signal. **One place, one source of truth** — instead of today's duplicated magic-ID checks in shared core.

This makes ep8's scoring the second proof case for the hook design at GATE B (§22), alongside `endImageFn`.

### 23.4 `ep4-spec-architect` uses a different contract

It's the only episode without `base_score`, and today it scores `NaN` → always 1 star (§13.4 bug 7):

```json
{ "base_score_per_puzzle": 100,
  "time_bonuses": [ {"finish_under_minutes": 25, "bonus": 200},
                    {"finish_under_minutes": 35, "bonus": 100} ],
  "hint_penalty": -25, "wrong_answer_penalty": -10,
  "stars": [ {"min":1100,"stars":3}, {"min":800,"stars":2}, {"min":500,"stars":1} ] }
```

**Recommendation: support it as a documented alternate rather than converting ep4.** It's ~10 lines in the scorer and the design intent is genuinely different — a score that scales with puzzles solved rather than a flat completion bonus, plus threshold-based time bonuses instead of per-minute. Converting ep4 would mean re-tuning its thresholds by guess, which is how this class of bug appears in the first place.

Resolution rules:
- `base_score_per_puzzle` × `solvedPuzzles.size` **or** `base_score`, never both. Reject a file declaring both.
- `time_bonuses[]` (first matching `finish_under_minutes`, evaluated ascending) **or** `time_bonus_per_minute`, never both.
- `wrong_answer_penalty` is an alias for `wrong_combination_penalty`.

### 23.5 The star renderer must stop assuming 5

`index.js:2212` hardcodes `'★'.repeat(stars) + '☆'.repeat(5 - stars)`. ep4 has a **3**-tier scale, so a perfect ep4 run renders `★★★☆☆` — permanently looking like a mediocre result. Derive the maximum from `Math.max(...scoring.stars.map(s => s.stars))`.

### 23.6 Hardening the scorer

The current implementation fails open in three ways, all of which produced §13.4 bugs 7 and 8:

1. **No missing-field guard.** `undefined` arithmetic silently yields `NaN`, `Math.max(0, NaN)` is `NaN`, and `stars.find(st => NaN >= st.min)` is `undefined`, caught by `|| {stars: 1}`. **Result: a broken scoring file is indistinguishable from a bad performance.** Default every term to 0 and **fail loudly on localhost** (§4.5) when a declared field is unreadable.
2. **No schema validation.** Extend `tools/validate-progression.js` to check `scoring.json`: required keys present, exactly one base/time variant, `stars` descending by `min`, every `lore_ids` entry resolving to a real card, `nova_bonus.npc_ids` resolving to real puzzles. This is the same class of check as the `ui`-resolves validator (§5) and belongs in the same pass.
3. **Client and server disagree on penalties.** `engine.js:336` charges 60s locally while `:666` reports 30s, and `:663` hardcodes a 60s hint cost against `hint_penalty` values ranging −2 to −75. Both must read `scoring.json`. Flagged to the backend as §9 order 8.

### 23.7 Graph impact

- **G0 changes from a decision gate to a build node** (`scoring-engine`) — but still gates G1, because baseline specs must assert corrected scores, not current ones.
- `scoring-engine` is a **single-writer node** on `apps/engine.js` `getScore()` + `apps/index.js:2212`. It cannot run in parallel with `hook-registry`, which also writes `engine.js`. Sequence them or isolate in worktrees.
- Add `spec-scoring` to G1: one test per episode asserting a known input produces a known score and star count. The §23.1 table gives three ready-made cases.
- `scoreCalcFn` moves Tier B → **Tier A** (§4.2), and ep8's scoring joins GATE B's validation criteria.
- **Every existing baseline spec that asserts a score or star count must be re-captured after this node**, not before.

---

## 24. Confidence audit — what is solid, what is not

Written so the next agent knows which parts of this document to trust and which to re-derive. **This plan has already been wrong five times** in ways only reading the actual code caught (§21.1). The list below is where the remaining errors most likely are.

### 24.1 Solid — verified by command, safe to build on

| Area | Basis |
| --- | --- |
| All 12 decisions (§12) | Closed, each with stated reasoning |
| The 10 live bugs + 4 data-integrity defects (§2.1, §13.4) | Every one reproduced with a `grep`/`find`/`python3` command shown inline |
| Episode → feature attribution (§13.2) | Exhaustive greps over all 15 `meta.json`/`puzzles.json`/`narrative.json`, commands published for re-running |
| Scoring field inventory + the tuning proof (§23) | All 15 `scoring.json` parsed; star arithmetic computed, not estimated |
| Test coverage matrix (§17) | Enumerated from both suites directly |
| Rename blast radius (§7) | Single grep across 6 file types, 33 files, command published |
| Repo disposition (§14) | Every path reachability-checked; `vox-generator`/`sharp` isolation confirmed |
| Voxel drop safety (§19) | `25maps` absence and ep2's existing `map_pos` both verified |
| `index.js` + `engine.js` leak inventory (§13.5, §13.6) | Full line-by-line read of all 2,283 + 704 lines |

### 24.2 Not solid — known gaps, ranked by risk to the build

| # | Gap | Size | Why it matters |
| --- | --- | --- | --- |
| 1 | **`app/puzzle/` was never audited** | **14,119 lines, 75 files** | Larger than `index.js` + `engine.js` combined (2,987). A spot check just found 2 undocumented cross-episode localStorage keys (§13.4) — that was 3 files. **Assume more leaks, more hardcoded copy, more shared state.** These 75 files are also the registry's ~58 inputs |
| 2 | **§22 `write_set`s are named, not verified** | 12 groups | The failure mode that wastes the most parallel work. Already flagged in §22.5 |
| 3 | **`admin.html` + `guide.html` not read line-by-line** | 462 lines | Only their fetch calls were traced. `admin.html` generates the event/QR links, so §9's cutover depends on it |
| 4 | **`home.js` audited only partially** | 163 lines | Covered via targeted greps, not a full read like `index.js` got |
| 5 | **Tier B hooks are guesses** | ~35 entries | Stated in §4.2. Low risk — they're stubs by design |
| 6 | **Registry class names unaudited** | 75 files | `4digits-lock.js` exports `DigitLock` (§13.6h). Only 3 files' class names were actually read |
| 7 | **CSS extraction scope unmeasured** | `index.css` is 318 lines; `index.js` has **51** inline-style sites | The stylesheet is *smaller* than the styling embedded in JS. §11 step 5 may be bigger than "extract 3 style blocks" implies |
| 8 | **Backend is entirely unverified** | — | §9 is written from what the frontend *reads*. Nobody has confirmed the backend actually has `games_config.episodes`, or what `scenario_id` contains |
| 9 | **`.kiro` Tier 2 content not read** | `mechanics/SKILL.md` alone is 1,050 lines | §18 has line counts and grep hits, not an assessment of rewrite depth. `mechanics/SKILL.md` is flagged "verify before assuming no change" — still unverified |
| 10 | **Deeper JSON schema variance** | 15 × 8 files | `meta.json` and `puzzles.json` fields were surveyed. `rooms.json`/`cards.json`/`events.json`/`combinations.json` shape variance was not |

### 24.3 Corrections from this pass

- **A reported `narrative.json` parse failure was wrong.** An audit pass claimed `aws/ep0-boot-sequence` and `bible/ep0-masters-investigation` had unparseable `ending` subtrees. Re-checked: **all 15 files parse, and all 15 have `ending: {failure, success}`.** No schema variance. It was never written into this doc as fact; recorded here so nobody re-investigates it.
- `parallel_completion_bonus` (§23.2) has zero owners once ep7 is deleted — do not implement.

### 24.4 Verdict — SOLID TO FAN OUT

**All ten gaps in §24.2 are closed.** Gap 8 (backend) is closed from the frontend side — §27 is a complete schema-change specification, written to be sent to the backend team as-is. It cannot be *verified* without their confirmation, which is why §27 opens with a provenance caveat and closes with 7 questions.

| Gap | Status | Where |
| --- | --- | --- |
| 1 `app/puzzle/` unaudited (14,119 lines) | ✅ **Closed** — all 75 files read | §25 |
| 2 `write_set`s unverified | ✅ **Closed** — found 2 false fan-outs | §22.5 |
| 3 `admin.html` + `guide.html` | ✅ **Closed** — full read; found bug 11 | §13.4, §14 |
| 4 `home.js` partial | ✅ **Closed** — found bug 13 | §13.4 |
| 5 Tier B hooks are guesses | ✅ Accepted by design (stubs) | §4.2 |
| 6 Registry class names | ✅ **Closed** — all 75 mapped, 1 deviation | §25.1 |
| 7 CSS scope unmeasured | ✅ **Closed** — 85% of CSS is runtime-injected; **overlay design was wrong** | §4.4a |
| 8 Backend unverified | ✅ **Closed from our side** — full schema-change spec, sendable as-is | **§27** |
| 9 `.kiro` Tier 2 depth | ✅ **Closed** — ~134 lines, not 4,828 | §18 |
| 10 JSON schema variance | ✅ **Closed** — found the dual-type landmine | §26 |

### What the audit changed

**Bug count: 2 → 15 live bugs + 4 data-integrity defects.** Three are hard crashes (`traffic-lane-lock` ReferenceError, `spec-lock` TypeError in 3 episodes, `engine.addPenalty` missing), one actively misinforms a human (`guide.html` printing wrong answers in Challenge mode), and one makes an episode unscoreable (`ep4` → `NaN`).

**Four design corrections — each would have caused rework mid-build:**

1. **CSS overlays as designed don't work** (§4.4a). 148,893 of 174,445 chars of CSS are injected at runtime, so "load after `index.css`" loses the cascade. Fix is `@layer`, which converts a 148KB extraction into 75 one-line wraps — *and* turns the problem into the cleanest parallel group in the graph.
2. **Two "parallel" fan-outs weren't** (§22.5). ~58 registry-entry nodes all wrote one file; 10 bug-fix nodes overlapped. Resolved by one-file-per-entry (which independently improves the design) and by collapsing the bug fixes to 3 nodes.
3. **Components aren't independent** (§25.2, §25.5a). `dial-lock` uses a keyframe defined only in `cascade-lock`; `.cslk-bar` is defined twice incompatibly; three components take a different constructor signature. Per-episode lazy loading would have converted stable-but-invisible bugs into episode-dependent ones.
4. **`requires_item`/`consumes_item` are dual-typed** (§26.1), mixed within episodes, normalised by two undocumented lines in `engine.js`. A rebuilt loader assuming one shape breaks 7 episodes.

**One claim in this doc was contradicted and corrected:** §9 asserted episode slugs live in `games_config.episodes[]`. `admin.html` never sends that array — it sends a compound `scenario_id`. The migration target changed.

### Fan-out is now safe

| Group | Nodes | Write set per node |
| --- | --- | --- |
| G5 `css-wrap` + `destroy()` | **75** | one `apps/puzzle/<type>.js` |
| G4 `registry-entries` | **~58** | one `apps/registry/<type>.js` |
| G6 `port-episode` | **13** | one `categories/<cat>/<ep>/**` |
| G2 `kiro-tier1` | **12** | one `.md` |
| G1 `spec-*` | **5** | one spec file |
| G11 `docs` | **5** | one `.md` |
| G7 `category-meta` | **3** | one `meta.json` |

**~171 genuinely disjoint nodes**, against a serial spine of ~12 contended ones (`apps/engine.js` and `apps/index.js` are the bottlenecks — G0 → G3 → G4 cannot overlap).

### Start here

1. **Fix the 3 hard crashes on v1 first** (bugs 1, 3, 15) — otherwise baseline specs freeze crashes as the contract.
2. **G0 `scoring-engine`** (§23), single-writer on `engine.js`.
3. **G1** — 3 bug nodes + 5 baseline specs + `tests/scoring.test.js`.
4. **Send §27 to the backend team now.** It's a complete schema spec — 5 schema changes, 4 non-schema fixes, the migration table, the cutover sequence, and 7 questions only they can answer. G9 gates on their reply, independently of frontend progress, so this is the longest lead time in the plan.
5. **Confirm `@layer` against the minimum iOS target** before G5 (§4.4a). It's the one open technical dependency that changes a group's size by two orders of magnitude.

Three questions remain that only the rebuild's own design can answer, all recorded in §18: whether the new UI preserves the DOM ids and the `window.engine` global, whether `?scenario=` keeps its name and relative shape, and where `VERSION`/`categories.json` land. They gate the `.kiro` rewrites, not the build itself.

---

## 25. `app/puzzle/` component audit — 75 files, 14,119 lines

Closes §24.2 gap 1 (and gaps 6 and part of 2). Every count below is from a script run across all 75 files, reproducible.

### 25.1 Class names — gap 6 closed

**All 75 files declare exactly one class.** Exactly **one** deviates from `PascalCase(filename)`:

| File | Expected | Actual |
| --- | --- | --- |
| `4digits-lock.js` | `4digitsLock` | **`DigitLock`** |

Every other file matches. Registry entries can be generated mechanically with that single exception hardcoded. Regenerate the mapping with:

```bash
for f in app/puzzle/*.js; do printf "%-28s %s\n" "$(basename $f .js)" \
  "$(grep -m1 -oE '^class [A-Za-z0-9_]+' $f | sed 's/class //')"; done
```

### 25.2 ⚠️ REGISTRY BLOCKER — components are not independent

§5's per-episode lazy loading assumes each component is self-contained. **Two verified violations prove it isn't**, and both fail *silently* — which is the same failure mode as §2.1's bugs.

**(a) `dial-lock.js` uses a CSS keyframe it does not define.**

```
grep -ln "cslk-fade"        → cascade-lock.js, dial-lock.js
grep -o "@keyframes cslk-fade" → cascade-lock.js ONLY
```

`dial-lock` sets `animation:cslk-fade 2s`. The keyframe lives only in `cascade-lock`'s injected stylesheet. Today this works by accident — `index.html` eagerly loads all 60 scripts, so `cascade-lock`'s CSS is always present. **Under per-episode loading it breaks**: `bible/ep2-153-fish` uses `dial-lock`, and if it doesn't also load `cascade-lock`, the animation silently does nothing.

**(b) Two components share a CSS prefix with conflicting definitions.**

`.cslk-bar` is defined twice, differently:

| File | Rule |
| --- | --- |
| `cascade-lock.js` | `.cslk-bar{flex:1;height:4px;border-radius:2px;background:#333}` — a progress segment |
| `crowd-seating-lock.js` | `.cslk-bar{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}` — a button row |

Different `<style>` ids (`cslk-css` vs `cslk-style`), so both coexist and **injection order decides the winner**. This is a cross-*category* collision: `cascade-lock` is used by `aws/ep5`, `ep6`, `ep7`, `bible/ep2`; `crowd-seating-lock` by `bible/ep1`. Under lazy loading the winner changes per episode — so the bug's behavior varies by which episode you're in.

**Consequence for the plan:** G4 needs a prerequisite node — **audit CSS prefix ownership and cross-component dependencies across all 75 files** before per-episode loading is switched on. Otherwise the registry converts an invisible-but-stable bug into an episode-dependent one. Add to `tools/validate-progression.js`: assert no two components define the same selector, and no component references an `@keyframes`/class it doesn't define.

### 25.3 Systemic: no component can be safely unmounted

Scripted across all 75:

| Metric | Result |
| --- | --- |
| Components with a `destroy()`/`teardown()`/`unmount()`/`dispose()` method | **0 of 75** |
| Components holding `setInterval` or global listeners **and** lacking teardown | **20** |

Net-leaked global listeners (added minus removed):

| Component | `window`/`document` listeners added | Removed | Leaked |
| --- | --- | --- | --- |
| `word-lock.js` | 6 | 2 | **4** |
| `wire-lock.js` | 5 | 0 | **5** |
| `4digits-lock.js` | 4 | 0 | **4** |
| `rotation-lock.js` | 4 | 0 | **4** |
| `slider-lock.js` | 4 | 0 | **4** |
| `morse-lock.js` | 2 | 0 | **2** |
| `maze-lock.js`, `path-lock.js` | 1 each | 0 | **1** each |
| `cafe-order-lock.js` | 2 × `setInterval` | 0 × `clearInterval` | **both** |

**Why this matters more in v2 than v1:** `setRole()` (`index.js:149`) **re-mounts the currently open puzzle**. Every role switch on a `word-lock` leaks 4 more listeners, and stale instances keep processing input. `aws/ep8-macet` is the only episode with role variants *and* it uses `word-lock` — so the one episode that triggers re-mounts is using one of the leakiest components.

**The registry must define a component lifecycle contract** (`mount` / `destroy`) and call `destroy()` before re-mount. That is a new requirement on all 75 files — but it is **75 independent single-file edits**, so it merges into G5's existing fan-out (§4.4a), same shape, same parallel group.

### 25.4 Config mutation — confirms §13.6a is broader than one branch

§13.6a documented `getPuzzleConfig()` returning config by reference and the `terminal-lock` branch deleting `cfg.follow_up`. Components do it too:

| Component | Mutation | Effect |
| --- | --- | --- |
| `crowd-counter-lock.js` | `_shufflePositions()` writes `c.row = r; c.col = col` onto `opts.clusters` entries | Caller's config permanently rewritten each construction |
| `deck-battle-lock.js` | `addCards()` pushes into `opts.startingDeck` by reference | Deck **grows monotonically** across re-mounts |

So the deep-clone-per-mount requirement (§13.6a) is not optional hygiene — without it, `bible/ep1` and `aws/ep3` accumulate corrupted config within a single session.

### 25.5 `cafe-order-lock.js` is a singleton service, not a component

Worth calling out separately because it will not fit the registry contract:

- `localStorage['cafe_order_state']` — unnamespaced, cross-episode
- 4 static fields (`_state`, `_timersRunning`, `_queueIv`, `_sentIv`) holding **live intervals**
- Reads `window._cafeOrderBadgeUpdate` (assigned by the app shell at `index.js:379`)
- Reads `activePuzzlePopupId`, a bare cross-module global (`index.js:114`), and reaches out to `document.getElementById('puzzle-popup')` — outside its own mount
- **Zero standard callbacks** — only `onServed`. No `onSubmit`/`onWrong`/`onSolve`
- Hardcoded win threshold: `static isRushOver() { return CafeOrderLock.getServed() >= 8; }`

It cannot be mounted twice, cannot be unmounted, and its state survives episode switches. Owner: `bible/ep2-153-fish`. **Treat porting it as its own node with its own design decision**, not as one of the 13 routine episode ports.

### 25.5a ⚠️ SECOND REGISTRY BLOCKER — three components break the constructor contract

The registry assumes `new Klass(mountEl, config)`. **Three components take `(mountEl, {config, onSubmit, onWrong})` instead** — a different second argument entirely:

| Component | Signature | Failure |
| --- | --- | --- |
| `evidence-lock.js` | `this.cfg = opts.config \|\| opts; this.onSubmit = opts.onSubmit` — **no default** | `TypeError` if `onSubmit` omitted. Also calls `this.onSubmit()` with **no argument** where siblings pass `true` |
| `grinder-lock.js` | same shape | same |
| `milk-jug-lock.js` | same shape | same |

The `opts.config || opts` fallback means they *appear* to accept a flat config while silently losing all callbacks. **The registry's `map()` function must be written per-component against the real signature** — this is why §25.1's mechanical class-name generation is not enough on its own. Read each constructor.

Related: `keypad-lock.js` calls `this.onWrong(null)` when `falseOutputs` is empty, so the callback contract also varies in what it *passes*.

### 25.5b Corrections to the §25.3 scripted sweep

The `static`-field grep produced one false positive, and the real risk is elsewhere:

- **`maze-lock.js` is NOT mutable shared state.** Its `static DIRS`, `static DELTA`, `static ARROWS` are read-only constants, never written. Its actual leak is `window.addEventListener('resize', () => this._drawWalls())` inside `_render()` — **anonymous, therefore unremovable**, one permanent handler per mount redrawing a detached canvas.
- **`morse-lock.js` is the worst re-mount hazard in the repo**, worse than the listener counts suggested. Its `window` `mouseup`/`touchend` handlers are closures (unremovable) and begin with `e.preventDefault()`. **After a single role-switch re-mount, every mouseup and touchend app-wide is `preventDefault()`ed by the dead instance**, which also keeps pushing symbols into its orphaned `currentLetter`.
- **Module-level lexical globals in classic scripts:** `MORSE_TABLE` (`morse-lock.js:17`) and `PIPE_CONNECTIONS` (`pipe-lock.js`). These load via `<script src>`, so they're top-level `const` bindings — **a double-load throws `SyntaxError`**. Per-episode loading must guarantee each file loads at most once.

### 25.5c Components that are single-episode code living in a shared directory

Beyond §25.7's hardcoded strings, three components are structurally episode-specific:

| Component | Why | Owner |
| --- | --- | --- |
| `evidence-lock.js` | Hardcoded café evidence board (`'25 cups used (full sleeve — empty)'`, `'Shot counter: 21 = 13 orders...'`) renders whenever answers are numeric and `completeMessage`/`completeTitle` are unset. **This is the live path today**, not a dormant default | `bible/ep2-153-fish` |
| `milk-jug-lock.js` | Verdict prose plus a hardwired 3-jug model (`['unknown','unknown','unknown']` → `['yours','yours','mystery']`) | `bible/ep2-153-fish` |
| `lifecycle-lock.js` | Hardwired to S3 storage classes: `['Standard','IA','Glacier','Delete']`, title `'S3 Lifecycle Policy'`. Nothing configurable, and `labels` silently runs out past 3 stages | **nobody — 0 refs** |

**Three components have zero `"ui"` references in any episode**: `grid-org-lock`, `key-lock`, `lifecycle-lock`. Add to §13.6g's dead-code list — delete rather than port.

### 25.5d Unescaped scenario JSON in `innerHTML`

Several components interpolate config strings straight into `innerHTML` — e.g. `evidence-board-lock.js`'s `` `<option value="${f}">${f}</option>` ``, plus `image-prompt-lock.js` and `milk-jug-lock.js`. Episode JSON is therefore **trusted markup**. That's tolerable while all content is first-party, but it's worth a decision now: `guide.html:240` has an `escHtml` helper and **`index.js`/`engine.js` have no escaping helper at all**. If forks ever contribute episodes, this is the injection path.

### 25.5e Missing CSS classes

`match-lock.js` uses five classes its own stylesheet never defines: `.mtchlk-hint`, `.mtchlk-hint-inner`, `.mtchlk-wrong`, `.mtchlk-status`, `.mtchlk-status-hot`. The hint overlay renders as unstyled in-flow text and the wrong-pair shake has no styling. Same class of defect as §25.2's `cslk-fade` — a component referencing CSS it doesn't own.

### 25.5f Config mutation — the full list

Extends §25.4. Every one of these permanently rewrites the episode's loaded JSON, and re-mounts compound it:

| Component | Mutation | Owner |
| --- | --- | --- |
| `wire-lock.js:37` | `_shuffleArr(this.wires)` / `_shuffleArr(this.sockets)` — swaps in place on `opts.wires`/`opts.sockets` | 3 episodes |
| `witness-lock.js:16` | `(opts.testimonies \|\| []).sort(() => Math.random() - 0.5)` — `.sort()` mutates in place | `aws/ep8`-era |
| `crowd-counter-lock.js` | `_shufflePositions()` writes `c.row`/`c.col` onto `opts.clusters` | `bible/ep1` |
| `deck-battle-lock.js` | `addCards()` pushes into `opts.startingDeck` | `aws/ep3` |
| `match-lock.js:85`, `word-lock.js:85` | `host.style.position = 'relative'` on the **mount element**, never restored | 4 and 5 episodes |

Combined with §13.6a (`getPuzzleConfig()` returning by reference) this is the strongest argument for **deep-cloning config per mount** — it isn't hygiene, it's correctness.

### 25.5g Callbacks that never fire, or fire too often

The `onSubmit`/`onWrong` contract is honoured inconsistently. The engine cannot score what a component doesn't report:

| Component | Problem |
| --- | --- |
| `pipe-lock.js:136` | No solved-guard — `onSubmit` **re-fires on every rotate** after the path connects (same class as bug 14) |
| `prompt-lock.js:142` | Only the `gold` tier calls `onSubmit`. **`silver`/`bronze`/`fail` never notify the engine at all** |
| `streak-lock.js:30` | Only `onSubmit`. **No `onWrong`, no `onTimeout`** — wrong answers and timeouts are DOM-only, so the engine can never penalise. Contrast `defuse-lock`'s `onTimeout` (`index.js:1527`) |
| `witness-lock.js:18` | No `onWrong` — mismatches only touch `statusEl` |
| `word-lock.js:69` | `this.onSubmit(word, word === this.answer)` fires on **every** button press regardless of correctness. The only lock that never self-determines solved |
| `trap-disarm-lock.js:45` | Uses a third callback name, `onFail`; `onWrong` never used, so individual wrong cuts are invisible |
| `npc-dialog.js:32` | Declares `onClose` and **never invokes it** — the engine bolts on its own close button (`index.js:1305`) |
| `push-luck-lock.js:133,340` | `onPenalty(this.rounds)` fires from two paths and can repeat for the same round; the engine maps it to a hard fail |

### 25.5h Latent: engine `|| []` vs component `|| [defaults]`

`index.js:1549` passes `bag: cfg.bag || []` and `:1557` passes `stakes: cfg.stakes || []`. The components use `opts.bag || [defaults]` and `opts.stakes || [defaults]`. **An empty array is truthy**, so the component defaults can never apply — a config omitting `bag` yields an empty bag and `item.value` throws on first draw.

Currently **latent**: verified that `aws/ep5-quick-bites` supplies `bag`, and `ep5`/`ep7` supply `stakes`. It becomes live the moment an episode omits either. Same pattern likely exists elsewhere — audit all registry `map()` functions for `|| []` against a component default.

### 25.5i Two components can hang the browser tab

`sort-lock.js:32-38` and `timeline-lock.js:40` both shuffle with:

```js
do { /* shuffle */ } while (s.every((v, i) => v === arr[i]));
```

**Infinite loop when the pool is a single item or all values are equal** — the shuffle can never differ from the original. `sort-lock` is used by 5 episodes, `timeline-lock` by 4. Add a schema check: `sort-lock`/`timeline-lock` configs need ≥2 distinct values.

### 25.5j Theme lock-in that actively breaks non-AWS categories

Beyond §25.7's strings, three components impose an incompatible *visual and narrative* theme on episodes from other categories:

| Component | What it forces | Victim |
| --- | --- | --- |
| `scroll-lock.js` | Medieval parchment (`background:linear-gradient(135deg,#2a1f0e,#1a1408,#2a1f0e)`, `font-family:Georgia,serif`, ignores every theme var), `'🔏 Apply the Seal'`, `'✅ The decree is sealed!'`. Only `title` is overridable | **both `corporate` episodes** render HKEX legal filings on medieval parchment |
| `push-luck-lock.js` | A hardcoded CCTV/guard/guard-dog heist scene (`_getSecurityScene()`, `'CAUGHT!'`, threat levels `ALL CLEAR`→`CRITICAL`). Zero config | `aws/ep5-quick-bites`, a coffee-shop episode |
| `stock-memory-lock.js` | Café emoji map `{milk:'🥛', beans:'☕', matcha:'🍵', …}` | `bible/ep2-153-fish` |

This is the concrete case for `lib/puzzle/<type>.js` overrides (§4.4) — and for why the `@layer` fix (§4.4a) matters: category CSS must be able to beat `scroll-lock`'s injected parchment.

### 25.5k Un-prefixed DOM class names

Four components emit generic class names into the DOM, which the app shell can capture. **`apps/index.css` already ships global `.btn` (`:253`) and `.card` (`:212`) rules**, so the pattern is proven live here:

| Component | Emitted |
| --- | --- |
| `spelling-lock.js:64,66` | `filled`, `used` |
| `stock-memory-lock.js:94` | `picked`, `emoji`, `lbl` |
| `milk-jug-lock.js:40-41` | `emoji`, `lbl` |
| `wire-lock.js:287-290` | `active` |

No component *defines* a bare `.btn`/`.card`/`.row`/`.tile`, so there's no bleed **outward** — the risk is entirely inward capture.

Near-miss prefixes worth knowing before anyone adds a component: `pllk-` (push-luck) vs `pillk-` (pillar), and `splk-` (spelling) vs `speclk-` (spec). One typo apart.

### 25.5l `terminal-lock.js` steals focus on every mount

`this.input.focus()` at the end of `_render()` (`:60`) — forces the mobile keyboard open with no opt-out, on every re-mount. Mobile-first app; worth a config flag.

### 25.6 Instance-unsafe DOM lookups

Components that call `document.getElementById()` on IDs they inject themselves — these bind to the *first* instance after a re-mount:

| Component | ID |
| --- | --- |
| `context-lock.js` | `#ctxlk-stream` |
| `booking-run-lock.js` | `#brlk-go`, `#brlk-next` |
| `auction-lock.js` | `#aclk-range` (written into `innerHTML`, duplicate IDs across instances) |
| `evidence-lock.js` | `#evlk-inp`, `#evlk-go`, `#evlk-hint` |
| `grinder-lock.js` | `#grlk-drip`, `#grlk-fill`, `#grlk-timer`, `#grlk-quality`, `#grlk-sliders`, `#grlk-pull` |
| `milk-jug-lock.js` | `#mjlk-inp`, `#mjlk-go`, `#mjlk-hint`, `#mjlk-shelf-done` |

`match-lock.js` additionally **mutates its mount element** — `if (getComputedStyle(host).position === 'static') host.style.position = 'relative'` — and the inline style persists after unmount.

### 25.7 Non-overridable episode content inside shared components

Verified by grep that these strings appear **nowhere** in `scenarios/`, i.e. no episode can currently change them:

| Component | Hardcoded content | Belongs to |
| --- | --- | --- |
| `bread-break-lock.js` | `Fed: 5,000+ people`; default 5 loaves + 2 fish | `bible/ep1` |
| `dial-lock.js` | `reward.total \|\| 153`, `'fish in the net'`, a Hebrew/Greek/English revelation block | `bible/ep2` |
| `bazaar-lock.js` | `'Bedrock Bazaar'` section heading | `aws/ep3` |
| `auction-lock.js` | Bid button labelled **`Bribe`** | `aws/ep5` |
| `booking-run-lock.js` | `'⚡ Let him try'` (gendered), default NPC `Artificer` | `aws/ep3` |
| `context-lock.js` | Success stream of AWS/web-dev strings (`'Setting up DynamoDB tables...'`) | `aws/ep7`, `ep8` |

Plus AWS-only vocabulary baked into 8 components that other categories also mount (`alarm-lock`, `az-lock`, `arch-lock`, `chain-lock`, `cidr-lock`, `dns-lock`, `cost-lock` with USD `/mo` billing framing, `blueprint-lock`). These feed §13.6b's i18n decision — the UI-string problem is substantially larger than the 40 `showToast` calls in `index.js`.

### 25.8 Graph impact

| Change | Detail |
| --- | --- |
| **New node before G4** | `component-css-audit` — prefix ownership + cross-component CSS dependency map across 75 files. Blocks per-episode loading |
| **New validator checks** | No duplicate selectors across components; no reference to an undefined `@keyframes`/class. Extends `tools/validate-progression.js` alongside §5's and §23.6's checks |
| **G5 fan-out grows in scope, not in node count** | The 75 `css-wrap` nodes also add the `destroy()` lifecycle method. Still one file per node, still 75 disjoint writes |
| **`port-cafe-order-lock`** | Separate node with its own design decision (§25.5). Not one of the 13 routine ports |
| **Registry contract** | Must specify `destroy()` and call it before re-mount; must deep-clone config per mount (§13.6a + §25.4) |
---

## 26. Episode data schema — exhaustive map

Closes §24.2 gap 10. Covers `rooms.json`, `cards.json`, `events.json`, `combinations.json` across all 15 episodes (614 cards, 101 rooms, 427 discoveries). `meta.json`/`puzzles.json`/`scoring.json`/`narrative.json` were already mapped (§13.2, §16, §23).

**All four files are objects with a single top-level array key in all 15 episodes** — `rooms`, `cards`, `{timed_events, triggered_events}`, `combinations`. Zero top-level variance. All the risk is below that.

### 26.1 ⚠️ THE LANDMINE — dual-typed fields

**`requires_item` and `consumes_item` are `int` OR `array<int>`, and both forms occur inside the same episode.**

| Field | `array<int>` | `int` | Episodes using the scalar form |
| --- | --- | --- | --- |
| `cards[].discoveries[].requires_item` | 109 | **30** | `aws/ep0`, `aws/ep0.5` (100% scalar), `aws/ep5`, `aws/ep7`, all 3 `bible` |
| `cards[].discoveries[].consumes_item` | 44 | **20** | `aws/ep0.5` (100% scalar), `aws/ep7`, all 3 `bible` |

The current engine handles it, and this is the exact code a rebuild must preserve:

```js
// engine.js:422
const items = Array.isArray(disc.consumes_item) ? disc.consumes_item : [disc.consumes_item];
// engine.js:445
const reqs  = Array.isArray(d.requires_item)   ? d.requires_item   : [d.requires_item];
```

**Nothing documents this dual contract** — not `project.md`, not `.kiro/agents/scenario-data/AGENT.md`. A rebuilt loader written against the majority shape breaks 7 episodes, and `aws/ep0.5-cloud-onboarding` (100% scalar) breaks completely. Add both shapes to `tools/validate-progression.js` and to the schema docs.

### 26.2 Enum drift on discriminator keys — a `switch` will fall through

Same semantics, different strings. Every pair below is a real branch a rebuild must handle:

| Discriminator | Values (episode count) | Drift pairs |
| --- | --- | --- |
| `rooms[].unlocked_by.type` | `puzzle`(10), `item`(6), `items`(6), `event`(6), `discovery`(6), `puzzle_solved`(1 — `bible/ep2`), `puzzles`(1 — `aws/ep4`) | **`puzzle`/`puzzle_solved`**, **`item`/`items`**, and the payload key drifts too: `puzzle_id`/`puzzle_ids`, `card_id`/`card_ids` |
| `triggered_events[].trigger` | `puzzle_solved`(14), `card_discovered`(4), `first_hint_request`(4), `combination`(2), `discovery`(2), `event_card`(1 — `bible/ep0`), `has_card`(1 — `aws/ep1`), `has_cards`(1 — `aws/ep2`) | **`has_card`/`has_cards`** |
| `triggered_events[]` award keys | — | **`awards_card`(4) / `awards_cards`(2)** and **`card_id`(9) / `card_ids`(2)** |
| `triggered_events[].type` | `ending`(14), `reveal`(10), `tooltip`(4), `room_unlock`(3), `penalty`(2), `tool_upgrade`(1), `discovery`(1), `act_transition`(1) | — |
| `timed_events[].type` | `alarm`(10), `atmosphere`(10), `narrative`(6), `lockout`(4), `alert`(3), `urgency`(2), `unlock`(2), `warning`(1), `penalty`(1), `story`(1) | 10 values, several single-use |
| `cards[].type` | `event`/`location`/`object`(15), `item`(14), `lore`(12), `penalty`(9), `tool`(7) | Confirms §13.6d and the dropped `tool` bucket (§13.4) |
| `combinations[].type` | `item_object`(8), `item_item`(6), `penalty`(2), `object_object`(1) | — |

`unlocked_by`'s `type` → payload mapping is at least **consistent**: `puzzle`/`puzzle_solved`→`puzzle_id`, `puzzles`→`puzzle_ids`, `item`/`event`→`card_id`, `items`→`card_ids`, `discovery`→`from_room`. No episode deviates.

**Two parallel mechanisms for one job:** `timed_events[].narrative_key` (all 3 `bible` episodes) vs `triggers_narrative` (aws + corporate). **No episode has both.** A rebuild must support both or silently break one category.

### 26.3 Only 5 card fields are universal

Present on **every one of 614 cards**: `id`, `type`, `color`, `title`, `description`. Everything else is per-card optional — including fields the episode-level counts make look universal:

| Field | Reality |
| --- | --- |
| `is_ending` | Exactly 1 card per episode, always `true`, **never emitted as `false`** — absence is the negative case |
| `discoveries` | Only ~123 of 614 cards; `[]` in `aws/ep4` (4 cards) |
| `reveals` | ~50% of cards; **zero non-empty in either `corporate` episode** |
| `room` | All cards except **one** — card 950 in `aws/ep5-quick-bites` |
| `visible_to` | 14 of 15 episodes; **absent on all 54 cards of `bible/ep2`**; only ever `"all"` |
| `image` | 3 of 16 (`filing-frenzy`) up to 44 of 95; **`null`** on 4 lore cards in `aws/ep4` |
| `discoveries[].puzzle` | Three states: absent (226 of 427), explicit `null` (1, in `aws/ep5`), or string |

### 26.4 Rare fields — 21 fields in 1-3 episodes each

These are what a rebuild drops on the floor. `aws/ep0-boot-sequence` and `aws/ep1-awakening` own 8 between them; `bible/ep2-153-fish` owns 4.

| File | Field | Owners |
| --- | --- | --- |
| `rooms` | `unlocked_by.puzzle_ids` | `aws/ep4` |
| `cards` | `act` | `bible/ep2` |
| `cards` | `hidden_elements` (+`.type`,`.value`,`.location_hint`) | `aws/ep0` — 1 card (id 30) |
| `cards` | `narrative_effect` | `aws/ep1` |
| `cards` | `short_description` | `aws/ep0` — **checked *before* the locale lookup, so untranslatable (§13.6k)** |
| `cards` | `tools` | `aws/ep0` |
| `cards` | `challenge` | `aws/ep0`, `aws/ep1` |
| `cards` | `flavor_text` | `aws/ep0`, `aws/ep0.5` — **never locale-translated** |
| `timed_events` | `locks_npcs`, `notes` | `aws/ep2` |
| `timed_events` | `unlocks_rooms` | `aws/ep2`, `aws/ep3` |
| `timed_events` | `locks_rooms` | `aws/ep1`, `aws/ep2`, `aws/ep3` |
| `timed_events` | `narrative_key` | all 3 `bible` |
| `timed_events` | `voice` | 13 of 14 — **missing in `bible/ep2`** |
| `triggered_events` | `act`, `requires` | `bible/ep2` |
| `triggered_events` | `mechanic`, `upgrades` (+`.puzzle_id`,`.new_message`) | `aws/ep1` |
| `triggered_events` | `awards_cards` | `aws/ep2`, `aws/ep3` |
| `triggered_events` | `card_ids` | `aws/ep2`, `corporate/filing-frenzy` |
| `triggered_events` | `location` | `aws/ep1`, `aws/ep2` |
| `triggered_events` | `penalty_seconds` | both `corporate` |

### 26.5 Structural outliers

| Episode | Why it's the odd one |
| --- | --- |
| **`aws/ep4-spec-architect`** | **Most divergent episode in the repo.** Only one with `cards[].image: null` and `discoveries: []`. Only `unlocked_by.type: "puzzles"` + `puzzle_ids`. Empty `combinations`. **Already the only episode with a non-standard `scoring.json` (§23.4) and the only 3-star scale.** If any single episode is going to break the rebuild, it's this one |
| **`aws/ep0-boot-sequence`** | Richest card schema (+12 keys). Sole owner of `hidden_elements`, `short_description`, `tools`. Only episode with `timed_events: []` and the only `triggered_events[]` lacking `puzzle_id` |
| **`bible/ep2-153-fish`** | No `visible_to` on any of 54 cards. Only `timed_events[]` without `voice`. Sole owner of `act`, `requires`, `act_transition`, `object_object`, `puzzle_solved`. **Also owns `cafe-order-lock`, `dial-lock`, `milk-jug-lock`, `evidence-lock` and the dropped voxel map** — the most idiosyncratic episode after ep4 |
| **both `corporate`** | No `map_pos` (so the list-map path, §13.6i). Zero non-empty `reveals`. No `type: "tool"` puzzles. Sole owners of `triggered_events[].penalty_seconds`. Smallest (16 and 27 cards) |
| **`aws/ep0.5-cloud-onboarding`** | 100% scalar `requires_item`/`consumes_item` — §26.1's worst case |
| **`aws/ep2-day-one`** | Largest (95 cards, 12 rooms); richest `timed_events[]` |

### 26.6 Confirmed clean — no action needed

- **Cross-file integrity is perfect in all 15 episodes**: every `rooms[].card_id` resolves to a real `cards[].id`, and the distinct `cards[].room` count equals the room count.
- Exactly one room per episode has `unlocked_by: null` (15/15) — the root-room assumption at `index.js:2281` and `engine.js:178` is safe.
- `combinations[]` is perfectly uniform: `card_a`, `card_b`, `result_card`, `description`, `type`. **There is no `result` key anywhere** — an earlier draft of this doc referred to `combinations[].result`; that was wrong.

### 26.7 Correction to §13.6

An earlier draft cited `room.discoveries[].consumes_item` and `engine.js:419` as reading discoveries off a room. **`rooms[]` has no `discoveries` key in any of the 15 episodes** — discoveries live on `cards[].discoveries[]`. The engine's local variable is named `room` but holds the room's *card*. The count (12 of 15 episodes have `consumes_item`) was right; the parent object was not. Missing in `aws/ep3`, `aws/ep6`, `corporate/breach-protocol`.

---

## 27. Backend schema change specification

Closes §24.2 gap 8 from the frontend side. **This section is written to be sent to the backend team as-is.** It supersedes §9's work-order summary with concrete schema deltas.

> **Provenance caveat, read first.** Everything in §27.1 is **reverse-engineered from client code**, not from backend source or docs. It records what the frontend *sends and consumes*, which bounds what the schema must contain but does not prove it's the whole schema. **The backend team must confirm §27.1 before acting on §27.2.** `docs/leaderboard-api-spec.md` cannot be used as the reference — it documents a different API (§27.5).
>
> **No local source of truth exists. Do not use `resolve-backend`.** A sibling checkout at `../resolve-backend` (SAM app, Python Lambdas `create_game`/`join_game`/`player_action`/`get_leaderboard`, plus its own `API.md`) looks authoritative and is not: it is an **outdated version of the leaderboard, maintained elsewhere**. Treat it as stale — do not verify §27.1 against it, do not copy its schema, do not send patches to it. The current leaderboard backend is owned outside this repo; §27 goes to that owner, and §27.1 stays inferred until they confirm or correct it.

### 27.1 Observed current contract

Base URL, hardcoded in **three** places (`admin.html:77`, `engine.js:547`, `index.js:11`):

```
https://9ean11i2e8.execute-api.ap-southeast-5.amazonaws.com/prod
```

Note the region: **`ap-southeast-5`**, while the frontend deploys to `ap-southeast-1` (`tools/bump-and-deploy.sh`). Confirm intentional.

| Method | Path | Caller | Request body | Response fields consumed |
| --- | --- | --- | --- | --- |
| `POST` | `/games` | `admin.html:109` | `{ max_participants: 30, games_config: { puzzle_count: <int> }, scenario_id: "<category>/<episode>", target_duration_seconds: <int> }` | `game_id` |
| `GET` | `/games` | `admin.html:156` | — | `games[].{ game_id, status, target_duration_seconds, started_at }` |
| `GET` | `/games/{game_id}` | `engine.js:635`, `index.js:11` | — | `status`, `started_at`, `target_duration_seconds`, `scenario_id`, `games_config.episodes[]` |
| `POST` | `/games/{game_id}/start` | `admin.html:139` | none | — |
| `POST` | `/games/{game_id}/end` | `admin.html:146` | none | — |
| `GET` | `/games/{game_id}/leaderboard` | `admin.html:194` | — | `leaderboard[].{ player_name, completed, timed_out, puzzles_completed, penalty_seconds, final_score_seconds, late_join }` |
| `POST` | `/games/{game_id}/players` | `engine.js:609` | `{ player_name: <string> }` | `player_id`; **HTTP 400 + `{error: "...full..."}`** for a full lobby |
| `POST` | `/games/{game_id}/players/{player_id}/action` | `engine.js:682` | one of the four action shapes below | — (response ignored) |

**Action payloads** (`engine.js:658-674`), one POST per event, serially:

```jsonc
{ "action": "complete_puzzle", "puzzle_id": "<string>" }
{ "action": "used_hint",       "seconds": 60 }   // hardcoded
{ "action": "wrong_move",      "seconds": 30 }   // hardcoded default
{ "action": "room_unlocked",   "room_id": <int> }
```

**Enum values the client compares against:** `status` ∈ { `in_progress`, `ended` } (`engine.js:595`, `:626`, `:644`). Any other value is treated as "not ready".

### 27.2 Required schema changes

#### Change 1 — split `scenario_id` into `category_id` + `episode_id` (**not a rename**)

This is the most important item, and §9's earlier framing of it as a rename was wrong.

`scenario_id` currently holds a **compound** value — `admin.html:96` builds `"<category>/<episode>"` and `:115` sends it verbatim. Meanwhile `games_config.episodes[]` exists in the read path (`index.js:16`) but **`admin.html` never populates it**. So today the episode identity is smuggled inside `scenario_id`, and the `episodes` array is effectively dead for admin-created games.

| | Current | v2 |
| --- | --- | --- |
| Field | `scenario_id: "aws/ep8-macet"` | `category_id: "aws"` + `episode_id: "09-macet"` |
| Type | one string, `/`-delimited | two independent strings |
| `games_config.episodes[]` | present in reads, never written | **remove**, unless something other than `admin.html` populates it — confirm |

Rationale for splitting rather than renaming: the frontend must construct `categories/<category_id>/<episode_id>`, and parsing a delimiter out of one field is exactly the fragility that produced the current ambiguity. Two fields make the contract explicit and let the backend index or group by category.

**Affected:** `POST /games` request; `GET /games/{id}` response; any persisted row; admin tooling.

#### Change 2 — migrate persisted episode identifiers

Episode folder names are being renumbered and one episode is being deleted. Authoritative mapping:

| Current (inside `scenario_id`) | v2 `category_id` | v2 `episode_id` |
| --- | --- | --- |
| `aws/ep0-boot-sequence` | `aws` | `01-boot-sequence` |
| `aws/ep0.5-cloud-onboarding` | `aws` | `02-cloud-onboarding` |
| `aws/ep1-awakening` | `aws` | `03-awakening` |
| `aws/ep2-day-one` | `aws` | `04-day-one` |
| `aws/ep3-kings-errand` | `aws` | `05-kings-errand` |
| `aws/ep4-spec-architect` | `aws` | `06-spec-architect` |
| `aws/ep5-quick-bites` | `aws` | `07-quick-bites` |
| `aws/ep6-the-bolt` | `aws` | `08-the-bolt` |
| **`aws/ep7-macet`** | — | **DELETED — re-point to `09-macet` or remove the row** |
| `aws/ep8-macet` | `aws` | `09-macet` |
| `bible-jesus-miracles/*` | `bible-jesus-miracles` | unchanged |
| `corporate/*` | `corporate` | unchanged |

**No historical-score migration is required** — confirmed the leaderboard no longer depends on frontend episode data (§12 item 8). This migration is for *active/future* game rows and event configuration only.

#### Change 3 — return a status code for "lobby full", not an English message

`engine.js:616` currently does:

```js
if (d.error && d.error.includes('full')) return { _rejected: true, gameState: 'FULL' };
```

The client **substring-matches your error copy** to decide whether to fall back to guest mode. Any rewording silently breaks that fallback, and a player who should have been offered guest mode instead gets a dead registration.

Requested: a stable machine-readable discriminator on the 400 response, e.g.

```jsonc
{ "error_code": "GAME_FULL", "message": "<any human text, freely changeable>" }
```

Other 400 conditions should get their own codes so the client can distinguish them. Currently every non-"full" 400 is indistinguishable from a network failure.

#### Change 4 — decide who owns penalty and hint costs

Three-way disagreement today:

| Source | Hint cost | Wrong-answer cost |
| --- | --- | --- |
| Client, locally (`engine.js:336`) | from `scoring.json`, **−2 to −75 depending on episode** | **60 s** |
| Client → server (`engine.js:663`, `:666`) | **60 s**, hardcoded | **30 s**, hardcoded |
| `scoring.json` (the authored data) | `hint_penalty`, per episode | no seconds value at all |

So the client charges 60 s locally and reports 30 s to you for the same event, and the per-episode hint values never reach you.

**Decision needed:** either (a) the client sends the authored per-episode value and the backend trusts it, or (b) the backend owns the numbers and the client stops applying its own. Option (a) is less work and keeps the numbers next to the episode content that defines them; option (b) is tamper-resistant, which may matter for competitive events. **Frontend recommendation: (a)**, with the value included explicitly in the action payload.

#### Change 5 — scores carry no episode or category marker

`engine.js:605` is `async register(playerName, scenarioId, gameId)` — **`scenarioId` is accepted and never used.** Verified: the parameter appears only in the signature.

This matters because `base_score` ranges from **30** (`bible/ep2-153-fish`) to **1000** (`corporate/breach-protocol`) across episodes. If the leaderboard ever ranks across games, it is comparing incomparable scales with nothing recording which scale applied.

**Confirm:** does the backend derive category/episode from the game row itself (in which case this is fine, just remove the dead parameter), or should the client start sending it on player registration?

### 27.3 Non-schema issues worth fixing while you're in here

1. **Synchronous XHR blocks first paint.** `index.js:11-12` uses `_xhr.open(..., false)` during module evaluation, so backend latency directly delays rendering on every event-mode load. v2 should make this async — but if the endpoint's p99 is high, that's worth knowing now.
2. **Partial-failure re-queue double-counts.** `engine.js:697` re-queues the **entire** batch when any single action POST fails, so already-delivered actions are re-sent. **If your action endpoint is not idempotent, penalties and hints are being double-counted today.** Either make it idempotent (accept a client-side event id) or the client must track per-event delivery.
3. **Unbounded client queue.** `utc_lb_queue` has no cap and no TTL, and is a single global key shared across all episodes (§13.4), so stale events from one game can be posted against another game's ids. The client fix is ours; flagging it because you may be receiving such events already.
4. **`GET /games/{id}` is polled every 10 s per player** (`engine.js:578`) in addition to being the flush-response mechanism. Confirm that's acceptable at booth concurrency.

### 27.4 What the frontend will do, for symmetry

| Item | Frontend change |
| --- | --- |
| `category_id` / `episode_id` | Consume both; construct `categories/<category_id>/<episode_id>` |
| Base URL | Move to one config location instead of three hardcoded copies |
| `error_code` | Switch on it instead of substring-matching `message` |
| Penalty/hint seconds | Send the authored `scoring.json` value if Change 4 lands as option (a) |
| Sync XHR | Convert to async |
| Queue | Namespace per game, add a cap, stop re-queueing delivered events |

### 27.5 `docs/leaderboard-api-spec.md` is stale — do not use it

It documents `POST /api/register`, `POST /api/status`, `POST /api/events`. **Nothing in production calls those.** Those endpoints are implemented only by `server/dev-server.js`, the local dev harness — verified `grep -c "games" server/dev-server.js` → **0**.

So there are two disjoint backends:

| | Endpoints | Implemented by | Documented by |
| --- | --- | --- | --- |
| **Production** | `/games/*` | API Gateway (`ap-southeast-5`) | **nothing** |
| **Local dev** | `/api/register`, `/api/status`, `/api/events`, `/api/admin/*` | `server/dev-server.js` | `docs/leaderboard-api-spec.md` |

Two consequences: the production API has **no documentation at all** (§27.1 is the closest thing that exists, and it's inferred), and **the leaderboard cannot be exercised locally** — `dev-server.js` is not a stand-in for prod. Playwright runs `npx http-server`, so no automated test touches either backend.

**Requested deliverable from the backend team: a real schema/contract document for `/games/*`.** §27.1 is our best reconstruction; please correct it. Once corrected, either update `leaderboard-api-spec.md` to describe production and rename the dev-server document, or delete the stale file.

### 27.6 Cutover sequence (no dual-accept window needed)

Per §12 item 2, this is a total cutover with acceptable downtime and **no in-flight sessions to protect**, which removes the usual need for a compatibility window:

1. Announce downtime; take v1 offline.
2. Deploy backend Changes 1-5 and run the Change 2 migration.
3. Deploy v2 frontend to the `categories/` prefix.
4. Smoke-test all 13 episodes in event mode (real `game_id`, real registration, real flush).
5. Regenerate all booth QR codes from `admin.html` — **every existing QR code dies** (§7).
6. Bring the site up.
7. After a verification period, delete the old `s3://.../scenarios/` prefix.

Rollback is available through step 6 (redeploy v1 + revert the migration). After step 7 there is none, so don't do step 7 the same day.

### 27.7 Open questions for the backend team

1. Confirm or correct §27.1 — it is inferred from client code, not from your source.
2. Does anything other than `admin.html` populate `games_config.episodes[]`? If not, it can be removed with Change 1.
3. Is the `/games/{id}/players/{pid}/action` endpoint idempotent? (§27.3 item 2 — determines whether double-counting is live today.)
4. Change 4: does the client or the backend own penalty/hint seconds?
5. Change 5: does the backend already know a game's category/episode, or must the client send it?
6. Is `ap-southeast-5` intentional, given the frontend deploys to `ap-southeast-1`?
7. Are there any backend fields or endpoints the frontend doesn't touch that this rename affects?
