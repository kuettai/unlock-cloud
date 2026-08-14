# re:Solve — New Developer Onboarding Guide

> Everything you need to build your first re:Solve escape-room episode.

---

## Prerequisites

- **Amazon Quick** (desktop app) — with re:Solve Episode Builder skill enabled
- **Kiro** (coding agent) — connected via ACP in Amazon Quick
- **GitHub account** — for forking and PRs
- **Node.js** (v18+) — for local dev server and validators
- **bun** — for hooks and tools (`curl -fsSL https://bun.sh/install | bash`)

---

## Step 1: Fork & Clone the Repo

```bash
# Fork on GitHub first: https://github.com/kuettai/unlock-cloud
# Then clone your fork:
git clone https://github.com/<your-username>/unlock-cloud.git
cd unlock-cloud
bun install
```

---

## Step 2: Enable re:Solve Skill in Amazon Quick

1. Open **Amazon Quick** desktop app
2. Go to **Settings → Capabilities → Skills**
3. Browse/search for **"re:Solve Episode Builder"**
4. Enable the skill

This gives Quick the full episode-building pipeline: puzzle taxonomy, design rules, Kiro dispatch, validation, and deployment orchestration.

---

## Step 3: Connect Kiro via ACP

1. In Amazon Quick, go to **Settings → Capabilities → ACP Agents**
2. Ensure **Kiro** is connected (shows as `acp-kiro`)
3. Test: type "Hey @acp-kiro, are you there?" — Kiro should respond

---

## Step 4: Prepare Your Learning Materials

Before asking Quick to build an episode, gather:

| What | Why | Format |
|------|-----|--------|
| **Topic content** | What the episode should teach | Transcripts, slides, docs, blog posts, whitepapers |
| **Learning objectives** | 3-5 things players should understand after playing | Short bullet list |
| **Theme idea** | The narrative wrapper (e.g., "heist", "space station", "startup chaos") | One sentence |
| **Duration** | How long gameplay should last | 10 min (booth), 15 min (session), 30-60 min (deep) |
| **Puzzle preferences** | Any puzzle types you love or hate | Optional |

**Tip:** The more raw source material you feed Quick, the better it understands the domain and designs puzzles that genuinely teach the concepts.

---

## Step 5: Build Your Episode

### Option A: Let Quick + Kiro build it (recommended)

In Amazon Quick, start a conversation:

```
"Build a re:Solve episode about [TOPIC]. 
Theme: [THEME]. 
Duration: [MINUTES] minutes.
Learning objectives:
1. [objective 1]
2. [objective 2]
3. [objective 3]"
```

Then attach or paste your source material (transcripts, slides, docs).

**What happens:**
1. Quick proposes a concept (rooms, puzzles, narrative arc)
2. You iterate with feedback ("more rooms", "less NPC", "add branching")
3. Quick selects puzzles from the 74-type taxonomy
4. Quick writes a full spec → dispatches to Kiro
5. Kiro generates 9 JSON files using the master agent pipeline
6. Quick validates (progression check + rubric)
7. You test locally → report bugs → Quick fixes via Kiro
8. Deploy when ready

### Option B: Build manually with Kiro agents

If you prefer hands-on control, talk directly to Kiro using the master agent:

```
"Read .kiro/agents/master/AGENT.md and follow the New Episode pipeline.
I want to build an episode about [TOPIC]."
```

Kiro will delegate to Story Creative → Blueprint Developer → Fact Check → Scenario Data → Episode Review → QA in order.

---

## Step 6: Test Locally

```bash
# Start dev server
node server/dev-server.js

# Open your episode in browser
open "http://localhost:3000/app/index.html?scenario=../scenarios/<category>/<your-episode-id>"
```

**Test checklist:**
- [ ] All rooms reachable (no dead ends)
- [ ] All puzzles solvable
- [ ] Lore cards appear before their puzzles
- [ ] NPC dialogs reveal correct cards
- [ ] Ending screen shows learning objectives
- [ ] Works on mobile (responsive, touch events)

**Test individual puzzles in isolation:**
```
open "http://localhost:3000/tools/puzzle-tester.html"
```
Paste your puzzle config JSON to test without loading the full episode.

---

## Step 7: Validate

```bash
# Check episode progression (rooms/cards reachable, no dead ends)
node tools/validate-progression.js scenarios/<category>/<your-episode-id>

# Run integration tests
node --test tests/happy-path.test.js
```

Both must pass before submitting a PR.

---

## Step 8: Submit Your PR

```bash
# Create a branch
git checkout -b ep<N>-<your-slug>

# Stage your episode files
git add scenarios/<category>/<your-episode-id>/
git add scenarios/<category>/index.json
# If you created a new puzzle type:
git add app/puzzle/<your-name>-lock.js
git add docs/puzzle-taxonomy.json

# Commit
git commit -m "feat: ep<N> <title> - <short description>"

# Push and open PR
git push origin ep<N>-<your-slug>
```

**PR checklist:**
- [ ] Episode validates (0 errors, 0 warnings)
- [ ] Tests pass
- [ ] **No modifications to `app/index.js`** (ever)
- [ ] No breaking changes to existing puzzles
- [ ] Episode registered in category `index.json`
- [ ] New puzzle types registered in `docs/puzzle-taxonomy.json` + `tools/puzzle-tester.html`

---

## Key Resources in the Repo

| File/Folder | What it does |
|-------------|--------------|
| `project.md` | Full steering guide with design rules and constraints |
| `docs/puzzle-taxonomy.json` | All 74 puzzle types with rarity, complexity, fun, interaction |
| `.kiro/agents/master/AGENT.md` | Master agent pipeline (delegation order) |
| `.kiro/agents/scenario-data/AGENT.md` | JSON generation rules |
| `.kiro/skills/scenario-blueprint/SKILL.md` | Blueprint format and JSON schema |
| `.kiro/skills/episode-review/SKILL.md` | Validation rubric (must score ≥70/78) |
| `.kiro/skills/locale-translation/SKILL.md` | Multi-language overlay schema |
| `scenarios/aws/ep5-quick-bites/` | Reference episode (11 rooms, 22 puzzles, branching) |
| `tools/puzzle-tester.html` | Test puzzles in isolation |
| `tools/validate-progression.js` | Episode validator |

---

## Tips for Success

1. **Feed Quick lots of source material** — transcripts, slides, docs. It designs better puzzles when it deeply understands the domain.
2. **Iterate the design before building** — get rooms + puzzles right with Quick before dispatching to Kiro. Changing JSON is harder than changing a concept doc.
3. **Use branching maps** — linear episodes (1→2→3→4→5) are boring. Add parallel paths, revisits, hub rooms.
4. **Vary room content** — not every room needs NPC + puzzle + lore. Some rooms are fast (puzzle-only), some are story beats (lore-only).
5. **Test on mobile** — most event attendees play on their phones.
6. **Read `project.md`** — it has the full rules, common mistakes, and constraints.

---

## FAQ

**Q: Can I create a new puzzle type?**
A: Yes! Add `app/puzzle/<name>-lock.js`, register in `docs/puzzle-taxonomy.json` and `tools/puzzle-tester.html`.

**Q: Can I create a new category (not AWS)?**
A: Yes! Create `scenarios/<your-category>/`, add `index.json`, register in `scenarios/categories.json`.

**Q: Can I modify `app/index.js`?**
A: No. If you need engine changes, open a GitHub issue first.

**Q: Can I modify existing puzzle types?**
A: Only if backward-compatible (add params with defaults, never remove/rename). Existing episodes must still work identically.

**Q: How do I add multi-language?**
A: Add `locales/index.json` + `locales/<lang>.json` inside your episode folder. See `.kiro/skills/locale-translation/SKILL.md` for the schema.

**Q: How long does it take to build an episode?**
A: With Quick + Kiro: ~1-2 hours for a 10-room episode. Manual: 4-8 hours.

**Q: Where do I get help?**
A: Open an issue on GitHub, or ask in the re:Solve Slack channel.
