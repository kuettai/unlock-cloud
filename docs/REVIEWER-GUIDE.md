# Reviewer Guide — re:Solve

## What is this?

re:Solve is an escape room card game that teaches through immersive storytelling. Players solve puzzles to progress through rooms, uncover narrative, and learn technical concepts (AWS services, Bible stories).

## Your Role

Review episode flows and validate that technical content is factually correct:
- Are puzzle answers accurate?
- Do NPC explanations match real AWS behavior / scripture?
- Is the difficulty progression logical?
- Are there dead ends or impossible states?

## Getting Started

### 1. Clone and run locally

```bash
git clone <repo-url>
cd unlock-cloud
npx http-server -p 8080
```

Open: http://localhost:8080/app/home.html

### 2. Key files to review

| What | Where |
|------|-------|
| Episode blueprints (narrative + flow) | `docs/blueprints/` |
| Puzzle data (answers, hints, configs) | `scenarios/<category>/<episode>/puzzles.json` |
| Card data (descriptions, discoveries) | `scenarios/<category>/<episode>/cards.json` |
| Room structure | `scenarios/<category>/<episode>/rooms.json` |
| Answer guide (visual) | Open `app/guide.html` locally — select episode, toggle Normal/Challenge |
| Existing fact-checks | `docs/fact-check/` |
| Game design overview | `docs/game-design-document.md` |

### 3. Episodes to review

**Amazon Web Services:**
| EP | Title | Topics |
|----|-------|--------|
| 0 | Boot Sequence | Tutorial — basic mechanics |
| 1 | Awakening | VPC, Subnets, Security Groups, IAM |
| 2 | Day One | Bedrock, Agents, Guardrails, Q Developer |
| 3 | The King's Errand | Bedrock AgentCore, Nova, MCP, Cedar |
| 4 | The Spec Architect | Kiro CLI, Spec-Driven Dev, CDK, Playwright |

**Bible — Miracles of Jesus:**
| EP | Title | Topics |
|----|-------|--------|
| 0 | The Master's Investigation | John 2:1-11 — Wedding at Cana |
| 1 | Philip's Impossible Math | John 6:1-14 — Feeding the 5000 |
| 2 | 153 Fish | John 21:1-14 — Breakfast on the Shore |

### 4. What to validate per episode

**For AWS episodes:**
- [ ] Service names are correct (not deprecated/renamed)
- [ ] Puzzle answers reflect real AWS behavior
- [ ] NPC dialog explanations are technically accurate
- [ ] Architecture relationships are correct (e.g., Lambda sits in Application layer, not Infrastructure)
- [ ] CLI commands shown are valid syntax
- [ ] Cost/pricing references are reasonable

**For Bible episodes:**
- [ ] Scripture references are correct (book, chapter, verse)
- [ ] Character names and roles match the text
- [ ] Timeline/sequence of events is accurate
- [ ] Theological interpretations are mainstream (not fringe)

**For all episodes:**
- [ ] Puzzle flow is solvable (no dead ends)
- [ ] Hints progress from vague → specific → answer
- [ ] Challenge mode is harder but still solvable
- [ ] `mandatory` field is correct (progression puzzles = true, NPCs/tools = false)
- [ ] `isFinal` is on the correct ending puzzle(s)

### 5. How to file issues

Create a markdown file in `docs/fact-check/<episode-id>.md` with:

```markdown
# Fact Check: <Episode Title>

## ✅ Verified
- [item] — correct because [reason]

## ⚠️ Issues Found
- [puzzle-id] — [what's wrong] — [suggested fix]

## 💡 Suggestions
- [improvement idea]
```

See `docs/fact-check/ep0-masters-investigation.md` for an example.

### 6. Playing the game

- **Locally:** http://localhost:8080/app/home.html (no gate on localhost)
- **Live:** https://beta.re-solve.cloud/app/home.html?game_id=test
- **Answer guide:** http://localhost:8080/app/guide.html

Use the **📋 History** button (top-right during gameplay) to see event log for debugging flow issues.
