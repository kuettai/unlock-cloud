# Scenario Blueprint: Episode 4 — The Spec Architect

## Meta

- **Episode:** 4
- **Title:** The Spec Architect
- **Arc:** AI Unit
- **Duration:** 40 minutes
- **Players:** 1–4 (recommended 2)
- **Difficulty:** Tier 2 — Practitioner
- **AWS Topics:** Kiro CLI, Spec-Driven Development, Custom Agents, Context Management, MCP Servers, CDK Deployment, Playwright Testing, React/Next.js, Lambda, DynamoDB, CloudFront
- **Mechanics Used:** spec-lock, context-lock, blueprint-lock, wire-lock, terminal-lock, path-lock, timeline-lock, chain-lock, pipe-lock, log-lock, sort-lock, defuse-lock, npc-dialog, timed-events, lore-fragments

---

## Narrative

### Voices

| Key | Polly Voice | Role |
|-----|-------------|------|
| narrator | Joanna | Story narrator — warm, professional |
| golem | Matthew | The Golem (Kiro) — starts confused, becomes confident |
| client | Brian | Lord Ashford — demanding client |
| pip | Ivy | Pip — eager apprentice |

### Intro

| Voice | Line | Pause |
|-------|------|-------|
| narrator | Tuesday morning. You arrive at the Builders' Guild. The hallway is empty. | 1000ms |
| narrator | The previous architect — Marcus — quit last Friday. No handoff. No notes. Just a half-built project and a client demo tomorrow. | 800ms |
| narrator | On your desk: a dormant golem, a stack of scattered documents, and a blinking message. | 600ms |
| client | This is Lord Ashford. My social platform launches tomorrow. I was told the new architect would handle it. Don't disappoint me. | 1000ms |
| narrator | The golem's eyes flicker. It tries to speak. | 800ms |
| golem | I... I don't know what I am. I have no context. No instructions. Tell me what to do. | 1000ms |
| pip | *A young apprentice bursts through the door.* Oh! You're the new architect! I'm Pip! The golem needs specs to build anything — without them it just... makes stuff up. | 800ms |
| narrator | The clock on the wall reads 9:00 AM. The demo is at 9:40. Your forty minutes start now. | — |

### Mid-Event (at 20:00 remaining)

| Voice | Line | Pause |
|-------|------|-------|
| client | Ashford here. Twenty minutes left. Tell me you have something to show. | 800ms |
| narrator | The message light blinks red. Pip looks at you nervously. | 600ms |
| pip | We're halfway there! The golem is building but... we still need to test and deploy. | 800ms |
| narrator | The golem hums steadily. It's working. But the clock doesn't care. | — |

### Ending (Success)

| Voice | Line | Pause |
|-------|------|-------|
| narrator | The deployment completes. The URL goes live. You paste it into the message. | 800ms |
| golem | All systems nominal. Build complete. Tests passing. Deployed to production. | 1000ms |
| client | *Long pause.* ...It works. It actually works. On your first day. I'm impressed. | 800ms |
| pip | We did it! Spec-driven development for the win! | 600ms |
| narrator | You lean back. The golem's eyes glow steady blue. It knows what it is now. | 800ms |
| narrator | And tomorrow, when the next project comes, you'll both be ready. | — |

### Ending (Failure)

| Voice | Line | Pause |
|-------|------|-------|
| client | Time's up. I'm looking at a blank page. We'll talk Monday. | 1000ms |
| narrator | The demo slot passes. Lord Ashford disconnects. Pip slumps in his chair. | 800ms |
| golem | I was close. I understand the architecture now. Next time will be different. | 600ms |
| narrator | Tomorrow, you'll be faster. The specs are written. The golem remembers. | 800ms |
| narrator | Next time, you'll ship. | — |

---

## Room Graph

```
[The Desk] ──(badge)──▶ [The Drafting Hall] ──(specs done)──▶ [The Golem Workshop]
                                                                      │
                                                              (golem configured)
                                                                      ▼
                                                              [The Build Yard] ──(build done)──▶ [The Launch Tower]
```

| Room | Card ID | Unlocked By | Unlock Text |
|------|---------|-------------|-------------|
| The Desk | 1 | — (starting room) | You sit at the architect's desk. |
| The Drafting Hall | 10 | Discovery from The Desk (badge #3) | You enter the Drafting Hall. Blueprints cover every surface. |
| The Golem Workshop | 30 | Event: all 3 spec-lock rounds solved | The specs are done. Time to configure the golem. |
| The Build Yard | 50 | Event: golem configured (context + blueprint solved) | The golem awakens. The Build Yard doors open. |
| The Launch Tower | 70 | Event: build pipeline complete | The elevator rises to the Launch Tower. |

---

## Room Details

### Room 1: The Desk (Card #1)

> Your new desk. A dormant golem sits in the corner, eyes dark. Scattered documents cover the surface — some current, some clearly outdated. A badge reader blinks by the inner door. Pip waves from the hallway.

**Image:** `assets/the-desk.png`

**Discoveries:**

| Label | Card | Type | Title | Requires | Puzzle |
|-------|------|------|-------|----------|--------|
| Talk to Pip | #2 | 🔵 | Pip (Apprentice) | — | npc-pip |
| Pick up the guild badge | #3 | 🔴 | Architect's Badge | — | — |
| Try talking to the golem | #4 | 🔵 | Dormant Golem | — | — |
| Sort the desk papers | #5 | 🔴 | Sorted Papers | — | sort-priorities |
| Enter the Drafting Hall | #10 | 🟢 | The Drafting Hall | badge #3 | — |

**Puzzle: sort-priorities (sort-lock)**

Sort the development phases into correct order.

- **Items (scrambled):** Test, Deploy, Build, Design, Requirements
- **Answer:** Requirements, Design, Build, Test, Deploy
- **Hints:**
  1. "What comes before you can build? You need to know WHAT to build."
  2. "Requirements first. Then design HOW. Then build. Then test. Then deploy."
  3. "Requirements → Design → Build → Test → Deploy"

**On solve:** Awards Sorted Papers (#5) — reveals that Marcus skipped Requirements and Design entirely. Lore fragment.

---

### Room 2: The Drafting Hall (Card #10)

> A long room with drafting tables. The left wall has a terminal. The right wall has a client communication screen. In the center: a large scroll frame waiting for structured specs.

**Image:** `assets/drafting-hall.png`

**Discoveries:**

| Label | Card | Type | Title | Requires | Puzzle |
|-------|------|------|-------|----------|--------|
| Talk to Lord Ashford (screen) | #11 | 🔵 | Lord Ashford | — | npc-ashford |
| Write the specs | #12 | 🔴 | Project Specs | — | spec-requirements |
| Read Marcus's sticky notes | #13 | 🔵 | Marcus's Notes | — | — |
| Go to the Golem Workshop | #30 | 🟢 | The Golem Workshop | specs #12 | — |

**Puzzle: spec-requirements (spec-lock)**

3 rounds of vibe → chaos → structured spec. (See spec-lock.js)

- **Round 1:** "make it social and posty" → registered user / post 280-char messages / followers see my updates
- **Round 2:** "let people stalk each other" → logged-in user / follow other users / their posts appear in my feed
- **Round 3:** "make it work on phones and not crash" → mobile user / responsive UI under 3s load / use the app anywhere reliably

**On solve:** Awards Project Specs (#12). Unlocks Golem Workshop.

---

### Room 3: The Golem Workshop (Card #30)

> A circular chamber. The golem sits in the center, connected to conduit pipes on all sides. A monitor shows its build output — currently static. Document shelves line the walls. A pipe junction box connects to external guilds.

**Image:** `assets/golem-workshop.png`

**Discoveries:**

| Label | Card | Type | Title | Requires | Puzzle |
|-------|------|------|-------|----------|--------|
| Load the golem's memory | #31 | 🔴 | Context Loaded | — | context-memory |
| Wire the MCP conduits | #32 | 🔴 | MCP Connected | — | wire-mcp |
| Connect the pipe junction | #33 | 🔴 | Pipeline Ready | wire #32 | pipe-junction |
| Go to the Build Yard | #50 | 🟢 | The Build Yard | context #31, pipe #33 | — |

**Puzzle: context-memory (context-lock)**

Debug the golem's mind — remove poisoned docs from the live stream.

- **Documents:** requirements.md (required), requirements-v1.md (poison), design.md (required), design-marcus.md (poison), tasks.md (required), CHANGELOG.md (safe), README.md (safe), meeting-notes.md (poison)
- **Capacity:** 2000 tokens
- **Correct:** requirements.md (500) + design.md (800) + tasks.md (600) = 1900

**Puzzle: wire-mcp (wire-lock)**

Connect 3 conduits to correct MCP endpoints.

- **Wires:** Testing Guild, Diagram Guild, Documentation Guild
- **Sockets:** Playwright Server, AWS Diagram Server, AWS Docs Server, Weather Oracle, Bard's Archive, Courier Network
- **Solution:** Testing→Playwright, Diagram→AWS Diagram, Documentation→AWS Docs
- **False outputs:** "The testing conduit now connects to the weather. Your tests predict rain.", "The diagram guild is receiving poetry instead of architecture."

**Puzzle: pipe-junction (pipe-lock)**

Rotate pipe segments to connect Kiro CLI → MCP Server → External Tool.

- **Grid:** 4×3
- **Source:** Kiro CLI (left)
- **Sink:** External Tool (right)

**On all solved:** Golem awakens. Build Yard unlocks.

---

### Room 4: The Build Yard (Card #50)

> An open construction yard. The golem stands ready, glowing blue. A blueprint frame shows the architecture layers. A terminal awaits commands. The building foundation is laid but empty.

**Image:** `assets/build-yard.png`

**Discoveries:**

| Label | Card | Type | Title | Requires | Puzzle |
|-------|------|------|-------|----------|--------|
| Issue first build command | #51 | 🔴 | First Command | — | terminal-build |
| Place the architecture | #52 | 🔴 | Architecture Done | command #51 | blueprint-arch |
| Navigate the codebase | #53 | 🔴 | Codebase Mapped | arch #52 | path-codebase |
| Go to the Launch Tower | #70 | 🟢 | The Launch Tower | mapped #53 | — |

**Puzzle: terminal-build (terminal-lock)**

Issue the first build command to the golem.

- **Prompt:** `architect@guild:~$ kiro`
- **Answer:** `build from design-specs`
- **Accept variations:** `build from design-specs/`, `build using design-specs`, `build from ./design-specs`
- **History:** `[Golem Workshop — Golem Active]`, `Golem: "Ready. What should I build from?"`
- **False outputs:** "The golem builds a random todo app. Be specific — tell it WHERE the specs are.", "Golem: 'Build what? I need a source.'", "Pip: 'Tell it to build FROM the design-specs!'"

**Puzzle: blueprint-arch (blueprint-lock)**

Place 8 components on correct architecture layers. Sequential placement with contextual errors.

- **Layers:** Presentation, Application, Data, Infrastructure
- **Components:** CDK Stack, IAM Roles, DynamoDB, SQLite, Lambda Functions, API Routes, React+Next.js, CloudFront CDN

**Puzzle: path-codebase (path-lock)**

Navigate the correct file path through the project structure.

- **Nodes:** root, src, components, pages, api, lib, infra, cdk-stack.ts
- **Edges:** root→src, root→infra, src→components, src→pages, src→api, src→lib, infra→cdk-stack.ts
- **Answer:** root → infra → cdk-stack.ts (find the deployment config)

**On all solved:** Build complete. Launch Tower unlocks.

---

### Room 5: The Launch Tower (Card #70)

> The top floor. A panoramic window shows the city below. A deployment console with a countdown timer. A test results screen. The golem stands at the controls, ready for final commands.

**Image:** `assets/launch-tower.png`

**Discoveries:**

| Label | Card | Type | Title | Requires | Puzzle |
|-------|------|------|-------|----------|--------|
| Build the test pipeline | #71 | 🔴 | Tests Ready | — | chain-tests |
| Order the deployment | #72 | 🔴 | Deploy Sequence | tests #71 | timeline-deploy |
| Check the deploy logs | #73 | 🔴 | Bug Found | deploy #72 | log-bug |
| Ship it! | #99 | 🔴 | Launched! | bug #73 | defuse-ship |

**Puzzle: chain-tests (chain-lock)**

Build the Playwright test pipeline in correct order.

- **Items:** Navigate to URL, Click Login, Fill Form, Assert Feed Visible, Take Screenshot
- **Answer:** Navigate to URL → Click Login → Fill Form → Assert Feed Visible → Take Screenshot

**Puzzle: timeline-deploy (timeline-lock)**

Order the two-phase deployment steps.

- **Events:**
  - CDK deploy infrastructure (Lambda + DynamoDB + API Gateway)
  - Extract API Gateway URL from CDK output
  - Rebuild frontend with real API URL
  - Deploy static assets to S3
  - Invalidate CloudFront cache
- **Answer:** (above order)

**Puzzle: log-bug (log-lock)**

Find the CORS error in the deployment logs.

- **Lines:**
  - `✅ Lambda function deployed successfully`
  - `✅ DynamoDB table created: q-social-posts`
  - `✅ API Gateway endpoint: https://abc123.execute-api.us-east-1.amazonaws.com`
  - `❌ Access-Control-Allow-Origin header missing from API response` ← CORRECT
  - `✅ S3 bucket created: q-social-frontend-assets`
  - `✅ CloudFront distribution: d1234.cloudfront.net`
  - `⚠️ Cache invalidation pending (takes ~60s)`
  - `❌ POST /api/posts returns 403 from browser — CORS policy blocked` ← CORRECT
  - `✅ GET /health returns 200`

**Correct lines:** The two CORS-related error lines.

**Puzzle: defuse-ship (defuse-lock)**

Timed final deployment — 45 seconds.

- **Tasks:**
  - Toggle: "Add CORS headers to Lambda" → true
  - Toggle: "Redeploy API Gateway" → true
  - Toggle: "Skip tests" → false (trap!)
  - Code: "Enter the CloudFront URL" → `d1234.cloudfront.net`

**On solve:** Ending event triggers. Episode complete.

---

## Dependency Chain

```
START
  │
  ▼
[The Desk] ── sort-priorities ──▶ badge ──▶ [Drafting Hall]
                                                │
                                          spec-requirements (3 rounds)
                                                │
                                                ▼
                                        [Golem Workshop]
                                         │     │     │
                                   context  wire   pipe
                                         │     │     │
                                         └──┬──┘     │
                                            │        │
                                            └───┬────┘
                                                ▼
                                         [Build Yard]
                                         │     │     │
                                    terminal blueprint path
                                         │     │     │
                                         └──┬──┘     │
                                            └───┬────┘
                                                ▼
                                        [Launch Tower]
                                         │  │  │  │
                                      chain time log defuse
                                                │
                                                ▼
                                              END
```

---

## Card Index

| ID | Type | Color | Title | Room |
|----|------|-------|-------|------|
| 1 | location | green | The Desk | — |
| 2 | object | blue | Pip (Apprentice) | desk |
| 3 | item | red | Architect's Badge | desk |
| 4 | object | blue | Dormant Golem | desk |
| 5 | item | red | Sorted Papers | desk |
| 10 | location | green | The Drafting Hall | — |
| 11 | object | blue | Lord Ashford | drafting |
| 12 | item | red | Project Specs | drafting |
| 13 | object | blue | Marcus's Notes | drafting |
| 30 | location | green | The Golem Workshop | — |
| 31 | item | red | Context Loaded | workshop |
| 32 | item | red | MCP Connected | workshop |
| 33 | item | red | Pipeline Ready | workshop |
| 50 | location | green | The Build Yard | — |
| 51 | item | red | First Command | build |
| 52 | item | red | Architecture Done | build |
| 53 | item | red | Codebase Mapped | build |
| 70 | location | green | The Launch Tower | — |
| 71 | item | red | Tests Ready | launch |
| 72 | item | red | Deploy Sequence | launch |
| 73 | item | red | Bug Found | launch |
| 99 | event | gold | Launched! | launch |

---

## Scoring

| Metric | Value |
|--------|-------|
| Base score per puzzle | 100 |
| Time bonus (finish < 25 min) | +200 |
| Time bonus (finish < 35 min) | +100 |
| Hint penalty (per hint used) | -25 |
| Wrong answer penalty | -10 |
| ⭐⭐⭐ threshold | 1100+ |
| ⭐⭐ threshold | 800+ |
| ⭐ threshold | 500+ |

---

## NPCs

### Pip (npc-pip)

- **Portrait:** 🧒
- **Greeting:** "Oh! You're the new architect! I'm Pip! I'll explain everything as we go."
- **Lines:**
  - "What's spec-driven development?" → "Instead of just telling the golem 'build something cool,' you write exact specs first. Who uses it, what it does, why it matters. Then the golem builds exactly that."
  - "What happened to Marcus?" → "He was a vibe coder. Just told the golem to build stuff without specs. It worked... until it didn't. The client got a chat app when they wanted a social platform."
  - "How does the golem work?" → "It needs context — documents loaded into its memory. The right docs make it brilliant. Wrong docs make it build nonsense. And it has a memory limit!"
- **State lines:**
  - requires #12: "The specs are done! Now we need to configure the golem's memory and connect it to external tools."
  - requires #52: "Architecture placed! The golem is building. Now we test and deploy!"

### Lord Ashford (npc-ashford)

- **Portrait:** 👑
- **Greeting:** "You're the new architect? Marcus promised me a social platform. I got a cat adoption site. Don't repeat his mistakes."
- **Lines:**
  - "What do you need?" → "A social platform. Users post short messages. They follow each other. It works on mobile. It doesn't crash. Is that so hard?"
  - "What went wrong with Marcus?" → "He never asked what I wanted. Just started building. Three weeks later I had a beautiful app that did everything EXCEPT what I needed."
  - "When's the demo?" → "Forty minutes. If I don't see a working URL by then, I'm finding another guild."

---

## Lore Fragments

| ID | Room | Title | Content |
|----|------|-------|---------|
| 5 | desk | Marcus's Mistake | "Marcus never wrote specs. He told the golem 'build a social app' and got a different interpretation every time. Vibe coding works for prototypes. It fails for production." |
| 13 | drafting | The Three Artifacts | "Spec-driven development produces three documents: Requirements (WHAT), Design (HOW), and Tasks (IN WHAT ORDER). Together they give the golem everything it needs." |
| 33 | workshop | MCP — The Conduits | "Model Context Protocol connects the golem to external tools. Testing tools, diagram generators, documentation servers. Each connection extends what the golem can do." |
| 53 | build | Two-Phase Deploy | "You can't deploy frontend and backend simultaneously. The frontend needs the API URL — which only exists AFTER the backend deploys. Phase 1: infrastructure. Phase 2: frontend with real URLs." |
