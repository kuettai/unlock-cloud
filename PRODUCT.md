# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Teams of 2-6 people playing together on their own phones at a live event/booth, host-run, time-boxed to roughly 45-60 minutes (episode-dependent, some as short as 10 for the tutorial). Co-located in person as the primary case; players talk face-to-face or via external voice chat, with in-app text chat as a fallback — no in-game voice.

A host runs the session (creates a room, gets a room code, starts the event); players join via that code. The game must read clearly on a phone held by someone standing at a booth, often in a noisy/distracted environment, not seated at a desk.

## Product Purpose

re:Solve is a mobile-first, narrative-driven escape-room engine that teaches through play: players explore rooms, collect and combine item/object cards, solve puzzles, and follow a branching story, and the concepts being taught surface through that interaction rather than through instruction. Success is a team finishing (or making real progress through) an episode within the session window, coming away able to name and recognize the concepts the episode covered, and wanting to play the next episode.

## Positioning

This is an AWS-internal initiative: built for and run at AWS-run events (re:Invent/summit-style booths) to teach cloud concepts, and AWS owns it. Its mechanism — Unlock!-style card combination plus branching rooms plus a persistent in-fiction antagonist (a countdown/threat) — is deliberately not a quiz or a slide deck; concepts are taught by naming things correctly inside the fiction (the vault is called "S3") and reinforced in a debrief that maps the story back to the real service, never by pausing to explain.

The same engine is domain-agnostic: it already runs non-AWS content (HKEX regulatory compliance training, a public-sector AI-adoption episode, and a Bible/religious-education arc), all authored as data (JSON) against the same untouched engine — so the "AWS learning tool" and "generic gamified-training engine" framings are both true and both matter to design decisions.

## Operating Context

- Booth/event floor: phone screens, one hand often free, ambient noise, short attention windows between other booth activities.
- Session flow: Lobby (room code) → Intro cinematic (narrated) → Discovery phase → mid-event story beat → escalation phase → climax → debrief/score screen.
- Navigation is via a bottom tab bar (Map / Interact-Combine / Tools / Hints) with full-screen overlay panels (Combine, Map, Tools) replacing the main view rather than stacking on it.
- Timer is visible and framed in-fiction (e.g. "Purge progress: 73%"); wrong actions cost time and trigger an in-fiction penalty card, not just an error message.
- Hints are progressive (nudge → direction → answer), cost score but never block progress, and can trigger automatically if a team is stuck.
- A server component (`server/dev-server.js`) exists for multiplayer/leaderboard; local dev also runs fully static.

## Capabilities and Constraints

- Episodes are 100% data-driven: `scenarios/<category>/<episode-id>/` holds 9 required JSON files (meta, cards, rooms, puzzles, combinations, narrative, events, scoring, image-style) plus optional `assets/` and `locales/`. Adding or changing an episode requires zero engine code changes.
- `app/index.js` is the shared engine core and is explicitly off-limits for modification — every episode across every fork depends on it. Any UI work must be additive (new CSS classes, new puzzle-lock files) rather than edits to this file's logic.
- `app/puzzle/*.js` lock components must stay backward-compatible: new optional params only, never remove/rename/change default behavior, since existing episodes' configs must keep producing identical results.
- 74 catalogued puzzle types (`docs/puzzle-taxonomy.json`) rated by rarity/complexity/fun/interaction/duration; each episode design deliberately mixes interaction types (tap/drag/type/timing/observe) and avoids repeating a puzzle type within one episode.
- Multi-language support exists via locale overlay files per episode; English is always the fallback and puzzle answers are never translated.
- No account required to play; identity is a room code plus a display name (a "GUEST" badge state exists in the shell).
- Undecided: exact production deployment/hosting details beyond "AWS internal, dogfoods AWS," and how far the real-time multiplayer sync (vs. single-device play) currently reaches in production versus prototype.

## Brand Commitments

Name is "re:Solve" (playing on the AWS "re:" event-naming convention — re:Invent, re:Inforce, etc.), live at beta.re-solve.cloud. End-screen credit: "Crafted with Kiro." Beyond the name, current visual identity (dark theme, neon/accent color system in `app/index.css`) is not confirmed as locked — treat as the incumbent look to preserve by default for narrow refinement work, but not yet declared binding for a redesign.

## Evidence on Hand

- Live incumbent implementation: `app/` (engine + UI shell + puzzle library), `scenarios/` (11 categories/episodes' worth of real content, including AWS ep0 through ep9-plus, HKEX, public-sector, religious-education).
- `docs/game-design-document.md` — founding design vision (arcs, mechanics, scoring, learning-integration principles).
- `docs/puzzle-taxonomy.json` — full puzzle-type library with rarity/complexity/fun ratings.
- `project.md` — contributor-facing steering guide with hard rules (don't touch `index.js`, backward-compat, PR checklist).
- No confirmed customer testimonials, published metrics, or press to date — do not fabricate any.

## Product Principles

1. Story first, learning invisible — concepts are the world (rooms, objects, mechanisms), never a lesson interrupting play.
2. Cooperation by design — information is deliberately split across roles/players so no one person can solve everything alone.
3. Fiction carries the stakes — tension (a countdown, a hunting antagonist) comes from the story, not from an arbitrary UI timer.
4. Wrong answers still teach — penalties have an in-fiction consequence that clarifies what went wrong, not just a red "incorrect."
5. One engine, many worlds — episode content (any domain) is data against a stable engine; UI and puzzle-component work must hold across every existing category, not just AWS.

## Accessibility & Inclusion

Booth/event context implies short, one-handed, glanceable interaction and legible-at-arm's-length text/contrast as a practical necessity; no formal accessibility standard has been confirmed as a requirement. Existing multi-language locale system is a real, currently-used inclusion mechanism.
