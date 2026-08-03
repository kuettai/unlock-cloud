# re:Solve — Kiro Steering Guide

> For developers building new episodes on their own fork.

---

## What is re:Solve?

A multiplayer escape-room platform for gamified tech events. Players solve puzzles that teach AWS concepts. Production: [beta.re-solve.cloud](https://beta.re-solve.cloud)

---

## Quick Start (Local Development)

```bash
# 1. Fork the repo on GitHub, then clone your fork
git clone https://github.com/<your-username>/unlock-cloud.git
cd unlock-cloud

# 2. Install bun (required for hooks and tools)
curl -fsSL https://bun.sh/install | bash

# 3. Install dependencies
bun install

# 4. Start local dev server
node server/dev-server.js

# 5. Open in browser
open http://localhost:3000/app/index.html?scenario=../scenarios/aws/ep0-boot-sequence

```

**URL format for testing your episode:**

```
http://localhost:3000/app/index.html?scenario=../scenarios/<category>/<episode-id>

```

---

## ⛔ Critical Rules (READ THIS FIRST)

### 1. NEVER modify `app/index.js`

This is the game engine core. **All episodes across all forks depend on it.** Any breaking change here breaks everyone.

- Cosmetic, additive, backward-compatible changes → submit as a **separate PR** with justification
- New features → discuss in an issue first
- If in doubt: **don't touch it**

### 2. Puzzle changes MUST be backward-compatible

Existing episodes use existing puzzle configs with specific parameters. If you modify a shared puzzle component (`app/puzzle/*.js`):

- **Add** new optional parameters with sensible defaults
- **Never remove** or rename existing parameters
- **Never change** default behavior — old configs must produce identical results
- Test against ALL existing episodes, not just yours

### 3. Never modify another team's episode folder

Your work lives in `scenarios/<category>/<your-episode-id>/`. That's your sandbox. Don't touch others.

### 4. You ARE free to:

- ✅ Create new puzzle types (`app/puzzle/<your-name>-lock.js`)
- ✅ Create new categories (`scenarios/<your-category>/`)
- ✅ Create new episodes with your own art style
- ✅ Add multi-language support (locale overlay files)
- ✅ Add entries to `scenarios/<category>/index.json`
- ✅ Add CSS classes to `app/index.css` (additive only — never modify existing classes)

---

## Repository Structure

```
unlock-cloud/
├── app/                          ← Game engine (SHARED — read-only for episode devs)
│   ├── index.html                ← Main game shell
│   ├── index.js                  ← ⛔ DO NOT MODIFY (engine core)
│   ├── index.css                 ← Additive only
│   ├── engine.js                 ← Game state machine
│   └── puzzle/                   ← Puzzle components (backward-compat changes only)
│       ├── word-lock.js
│       ├── defuse-lock.js
│       └── ...
├── scenarios/                    ← All episodes live here
│   ├── aws/                      ← Category
│   │   ├── index.json            ← Episode registry for this category
│   │   ├── ep0-boot-sequence/    ← Episode folder
│   │   ├── ep5-quick-bites/
│   │   └── ep8-macet/
│   └── <your-category>/          ← You can create new categories
├── docs/
│   └── puzzle-taxonomy.json      ← Full puzzle library (74 types)
├── tools/
│   ├── validate-progression.js   ← Episode validator (MUST PASS)
│   ├── puzzle-tester.html        ← Test puzzles in isolation
│   └── bump-and-deploy.sh        ← Deploy script (maintainers only)
├── tests/
│   └── happy-path.test.js        ← Integration tests
├── server/
│   └── dev-server.js             ← Local dev server
└── .kiro/                        ← Agent configs and skills
    ├── agents/                   ← Specialized agents (master, scenario-data, etc.)
    └── skills/                   ← Skills (scenario-blueprint, episode-review, etc.)

```

---

## Episode Anatomy (9 Required JSON Files)

Every episode lives in `scenarios/<category>/<episode-id>/` and requires:

| File | Purpose |
| --- | --- |
| `meta.json` | Episode metadata: title, duration, difficulty, topics, mechanics |
| `cards.json` | All cards (locations, items, lore, tools/NPCs) |
| `rooms.json` | Room definitions, connections, unlock conditions, map positions |
| `puzzles.json` | All puzzles with type, UI, and full config |
| `combinations.json` | Item combination rules (if any) |
| `narrative.json` | Intro/ending voice segments, voice assignments |
| `events.json` | Triggered events (timers, mid-game reveals) |
| `scoring.json` | Point system, bonuses, star thresholds |
| `image-style.json` | Art direction for image generation |

Optional:

- `assets/` — Episode-specific images (cover, cards, rooms)
- `locales/` — Multi-language translation overlays

---

## Naming Convention

**Episode ID format:** `ep<N>-<slug>`

Examples: `ep9-cloud-heist`, `ep10-serverless-sprint`, `ep11-data-maze`

Pick the next available number in your category's `index.json`.

---

## Design Rules (Non-Negotiable)

1. **No repeated puzzle types** in one episode
2. **NPC puzzles use **`type: "tool"` (NOT `"npc_dialog"`) — engine only reveals cards for type "tool"
3. **Lore cards BEFORE puzzles** in discovery order — players move forward after solving and miss trailing content
4. **Room content variety** — NOT every room should have NPC + puzzle + lore. Mix it up.
5. **Prefer branching maps** over linear chains (e.g., `1→2→1→3`)
6. **Endings MUST tie back to learning objectives** explicitly
7. `discovery card_id`** must equal **`success_card` on puzzle entries
8. **Scoring should be generous** for booth/event use — most players should get 3+ stars

---

## Picking Puzzles

Read `docs/puzzle-taxonomy.json` — it has 74 puzzle types with:

- **Rarity:** COMMON / MAGIC / RARE / LEGENDARY
- **Complexity:** 1-5
- **Fun:** 1-5
- **Interaction:** tap / drag / type / timing / observe
- **Duration:** quick / medium / long

**Mix guidelines:**

- At least 3 different interaction types per episode
- At least 1 RARE or LEGENDARY puzzle
- Complexity curve: start low → peak mid-episode → medium-high finish
- At least one fun:4+ puzzle per 3 rooms

---

## Creating a New Puzzle Type

1. Create `app/puzzle/<your-name>-lock.js`
2. Follow the existing class pattern (constructor takes `container`, `config`, callbacks)
3. Register in `docs/puzzle-taxonomy.json` with rarity, complexity, fun, interaction, duration
4. Add instantiation to `tools/puzzle-tester.html` for isolated testing
5. Test on mobile (touch events, not just click)

---

## Creating a New Category

1. Create `scenarios/<category-name>/`
2. Add `scenarios/<category-name>/index.json` with episode list
3. Register in `scenarios/categories.json`
4. Build your first episode inside it

---

## Multi-Language (Optional)

If you want your episode in multiple languages:

1. Create `scenarios/<category>/<episode-id>/locales/index.json`:

```json
{
  "locales": [
    { "code": "id", "label": "Indonesia", "flag": "🇮🇩" }
  ]
}

```

1. Create `scenarios/<category>/<episode-id>/locales/<lang>.json` — overlay file with translated text for cards, rooms, narrative, puzzles, and UI strings.

**Rules:**

- NEVER translate puzzle answers/solutions
- English is always the fallback
- Keep technical terms in English
- See `.kiro/skills/locale-translation/SKILL.md` for full schema

---

## Agent Pipeline (for Kiro users)

If you use Kiro to build episodes, the master agent (`.kiro/agents/master/AGENT.md`) orchestrates:

```
1. Story Creative    → Episode concept + narrative
2. Blueprint Developer → Full blueprint markdown
3. Fact Check        → Domain accuracy validation
4. Scenario Data     → Generate 9 JSON files
5. Episode Review    → validate-progression.js + rubric ≥70/78
6. Asset Agent       → Images + voice audio
7. QA Agent          → happy-path tests
8. Deploy Agent      → Ship (maintainers only)

```

Read `.kiro/agents/master/AGENT.md` before starting.

---

## Validation (MUST PASS Before PR)

```bash
# Validate episode progression (rooms/cards reachable, no dead ends)
node tools/validate-progression.js scenarios/<category>/<episode-id>

# Run integration tests
node --test tests/happy-path.test.js

```

**Episode Review rubric must score ≥70/78.** See `.kiro/skills/episode-review/SKILL.md`.

---

## Fork + PR Workflow

```bash
# 1. Fork on GitHub
# 2. Clone your fork
git clone https://github.com/<you>/unlock-cloud.git

# 3. Create a branch
git checkout -b ep<N>-<your-slug>

# 4. Build your episode
# ... (use Kiro agents or build manually)

# 5. Validate
node tools/validate-progression.js scenarios/<category>/<your-episode>
node --test tests/happy-path.test.js

# 6. Commit and push
git add scenarios/<category>/<your-episode>/ 
git add scenarios/<category>/index.json
# Only add app/puzzle/<new-type>.js if you created a new puzzle type
git commit -m "feat: ep<N> <title> - <short description>"
git push origin ep<N>-<your-slug>

# 7. Open a PR against the main repo

```

**PR checklist:**

- [ ] Episode validates (0 errors, 0 warnings)
- [ ] Tests pass
- [ ] No modifications to `app/index.js`
- [ ] No breaking changes to existing puzzles
- [ ] New puzzle types (if any) registered in taxonomy + puzzle-tester
- [ ] Episode registered in category `index.json`

---

## Common Mistakes

| # | Mistake | Fix |
| --- | --- | --- |
| 1 | NPC uses `type: "npc_dialog"` | Use `type: "tool"` — engine only reveals cards for tools |
| 2 | Repeated puzzle types in one episode | Pick from 74 types — there's always variety |
| 3 | Lore card placed AFTER its puzzle | Move lore discovery BEFORE puzzle in card ordering |
| 4 | Modified `app/index.js` | Revert. If you need engine changes, open an issue first. |
| 5 | Puzzle answer translated in locale file | NEVER translate answers — only display text |
| 6 | Linear room chain (1→2→3→4→5) | Add branching, revisits, parallel paths |
| 7 | Every room has NPC + puzzle + lore | Vary it: some rooms puzzle-only, some story-only |
| 8 | Missing `success_card` on puzzle discovery | `discovery.card_id` must equal puzzle's `success_card` |
| 9 | Didn't run validate-progression.js | Always run before PR — catches dead ends and orphan cards |
| 10 | Pushed new puzzle but didn't add to puzzle-tester.html | Register so others can test it in isolation |

---

## Need Help?

- Read `.kiro/agents/master/AGENT.md` for the full agent pipeline
- Read `.kiro/skills/scenario-blueprint/SKILL.md` for JSON schema details
- Read `.kiro/skills/episode-review/SKILL.md` for the validation rubric
- Check `scenarios/aws/ep5-quick-bites/` as a reference episode (11 rooms, 22 puzzles, branching map)
- Open an issue on GitHub for questions

