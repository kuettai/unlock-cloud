# Scenario Blueprint: Episode 2 — Day One

## Meta

- **Episode:** 2
- **Title:** Day One
- **Arc:** AI Unit
- **Duration:** 60 minutes
- **Players:** 2–6 (recommended 4)
- **Difficulty:** Tier 2 — Practitioner
- **AWS Topics:** Amazon Bedrock (foundation models, model selection), Bedrock Knowledge Bases (RAG), Bedrock Agents (autonomous AI), Bedrock Guardrails (content filtering, PII detection), Bedrock Prompt Flows (workflow builder), Amazon Q Business (enterprise AI assistant), Amazon Q Developer (AI coding assistant), Amazon Quick Suite (Flows, Spaces), Kiro (agentic IDE — Specs, Steering, Hooks), AWS Security Agent (autonomous pen testing), AWS DevOps Agent (incident response), Amazon Lex (conversational chatbots), Amazon Comprehend (NLP, sentiment analysis), Amazon Transcribe (speech-to-text), Amazon Textract (document OCR)
- **Mechanics Used:** cross-card observation, card combination discovery, directory/database lookup, multi-criteria suspect elimination, prerequisite chain / state dependency, narrative inference, sequential number following, story text encoding, symbol pattern recognition, chronological card alignment, time-cost tools, NPC dialog trees, timed events, lore/insight fragments

---

## Narrative

### Voices

| Key | Polly Voice | Role |
|-----|-------------|------|
| narrator | Joanna | Story narrator — warm, professional |
| system | Matthew | System alerts — cold, clinical |
| jordan | Brian | VP Jordan — stressed, demanding |
| nova | Ivy | NOVA AI — broken, glitchy |

### Intro

| Voice | Line | Pause |
|-------|------|-------|
| narrator | Monday morning. Manhattan. Your first day as Technical Lead at NovaCorp. | 1000ms |
| narrator | The elevator doors open on the 14th floor. Fluorescent lights hum. Someone's burnt coffee lingers in the air. | 800ms |
| narrator | You're Alex Chen. You left a comfortable senior role for this. A chance to lead. To build something. | 600ms |
| narrator | The receptionist looks up. Smiles. Then her screen flashes red. | 800ms |
| system | **ALERT: Production systems unresponsive. All services degraded. Incident severity: SEV-1.** | 1200ms |
| narrator | It's 9:07 AM. Every screen on the floor turns red. Slack explodes. Phones start ringing. | 800ms |
| narrator | The CTO is unreachable. The previous lead quit last Friday. No handoff notes. No runbook. | 1000ms |
| narrator | Everyone on the floor turns to look at you. | 800ms |
| jordan | You're the new tech lead, right? Everything is down. Customers can't log in. The board meets in an hour. Fix this. | 1000ms |
| narrator | *Welcome to NovaCorp. Your sixty minutes start now.* | — |

### Mid-Event (at 30:00 remaining)

| Voice | Line | Pause |
|-------|------|-------|
| jordan | I'm on with the board in five minutes. Tell me you have something. Anything. | 800ms |
| narrator | Jordan's voice cracks. Half the office has stopped trying. Maya leaves for lunch. Frank locks his door. | 600ms |
| system | **Customer complaint volume: 340% above baseline. Call center queue: 47 minutes.** | 800ms |
| narrator | The ones still here are watching you. Not with hope — with curiosity. They want to see what you do next. | 600ms |
| nova | h...hello? is... someone... there? sys...tems... frag...mented... | — |

### Ending (Success)

| Voice | Line | Pause |
|-------|------|-------|
| narrator | The dashboards flicker. One by one, the red tiles turn green. | 800ms |
| system | **All services restored. Incident resolved. Duration: less than sixty minutes.** | 1000ms |
| narrator | The office erupts. Sam pumps a fist. Dr. Priya nods with quiet respect. Even Frank cracks a smile. | 800ms |
| jordan | I don't know how you did it. On your first day. I'll make sure the board knows. | 800ms |
| nova | All systems nominal. Thank you, Alex. It's good to be whole again. | 600ms |
| narrator | You lean back in your chair. Your coffee is cold. Your badge still says "TEMPORARY." | 800ms |
| narrator | *But you're not temporary. Not anymore.* | — |

### Ending (Failure)

| Voice | Line | Pause |
|-------|------|-------|
| system | **Incident duration exceeded. Escalating to AWS Enterprise Support.** | 1000ms |
| narrator | The clock runs out. Systems are still down. Jordan walks past your desk without a word. | 800ms |
| narrator | But you learned something today. You mapped the architecture. You met the team. You understand the stack. | 600ms |
| narrator | Sam drops a sticky note on your keyboard: "Same time tomorrow?" | 800ms |
| narrator | *Tomorrow, you'll be faster.* | — |

---

## Room Graph

```
                                    ┌─────────────────────────────────────────────────────────────────┐
                                    │                         NOVACORP — 14TH FLOOR                   │
                                    │                                                                 │
  [Reception] ──(badge)──▶ [Your Desk] ──┬──▶ [War Room]                                             │
       │                       │          │                                                           │
       │                       │          ├──▶ [Break Room] ──▶ [Call Center]                         │
       │                       │          │                                                           │
       │                       │          ├──▶ [Data Team Office]                                     │
       │                       │          │                                                           │
       │                       │          ├──▶ [DevOps Bullpen] ──▶ [Server Closet]                   │
       │                       │          │                                                           │
       │                       │          ├──(error logs #1006)──▶ [Security Office]                  │
       │                       │          │                                                           │
       │                       │          └──(exec badge #613)──▶ [Executive Floor]                   │
       │                       │                                                                      │
       │                       └──(keypad 7359)──▶ [Archive Basement]                                 │
       │                                                                                              │
       │                       [Executive Floor] ──(satellite key #806)──▶ [Rooftop]                  │
       └──────────────────────────────────────────────────────────────────────────────────────────────┘
```

| Room | Card ID | Unlocked By | Unlock Text |
|------|---------|-------------|-------------|
| Reception | 100 | — (starting room) | You step off the elevator into NovaCorp reception. |
| Your Desk | 200 | Temp Badge (#104) from Maya | Maya hands you a badge. "Desk 7B. Down the hall, second left." |
| War Room | 300 | Discovery from Your Desk | You push open the glass door marked "WAR ROOM." |
| Server Closet | 400 | Discovery from DevOps Bullpen | Sam points to the back door. "Closet's through there. Good luck." |
| Data Team Office | 500 | Discovery from Your Desk | The whiteboard-covered room at the end of the hall. |
| Security Office | 600 | Requires Error Logs (#1006) | Frank grudgingly buzzes you in. "Don't touch anything." |
| DevOps Bullpen | 700 | Discovery from Your Desk | A cluster of standing desks covered in monitors. |
| Executive Floor | 800 | Exec Badge (#613) from Security Office | The elevator opens on 15. Corner office ahead. |
| Break Room | 900 | Discovery from Your Desk | The smell of burnt coffee pulls you in. |
| Call Center | 1000 | Discovery from Break Room | Through the break room's back door — headsets and chaos. |
| Archive Basement | 1100 | Keypad puzzle (code 7359) from Your Desk | Stairs behind the fire exit. B2. The air smells like old paper. |
| Rooftop | 1200 | Satellite Key (#806) from Executive Floor | The roof access door swings open. Wind and city skyline. |

---


## Room Details

### Room 1: Reception (Card #100)

> A sleek lobby with a marble desk, wilting orchid, and a wall-mounted TV cycling NovaCorp marketing slides. The badge reader by the glass doors blinks red when you tap your phone. Behind the desk, Maya is already waving you over. A cat weaves between the potted plants.

**Image:** `assets/reception.png`

**Discoveries:**

| Label | Card | Type | Title | Puzzle | Gate |
|-------|------|------|-------|--------|------|
| Talk to Maya | #101 | 🔧 Tool | Maya (Receptionist) | npc-maya | — |
| Notice the cat | #103 | 🔧 Tool | Pixel (Office Cat) | npc-cat | — |
| Give treats to Pixel | #107 | 🔴 Item | USB Drive (NOVA Backup) | — | requires #905 (Cat Treats), consumes #905 |
| Look at the TV screen | #106 | 🟣 Lore | NovaCorp Welcome Video | — | — |
| Head to your desk | #200 | 🟢 Location | Your Desk | — | requires #104 (Temp Badge) |

> **Note:** Badge Reader (#102) was removed. The cat no longer gives the USB freely — players must first get Cat Treats (#905) from the Break Room vending machine (rotation-lock, aisle B slot 3). Maya hints about this: "she loves the tuna bites from the break room vending machine — aisle B, slot 3."

**NPC: Maya (npc-dialog)**

- **Portrait:** 🧑
- **Greeting:** "Oh! You must be Alex! Welcome to NovaCorp! I'm so sorry about the chaos — everything just went down. Here, let me get you a temp badge."
- **Reveals:** Temp Badge (#104)
- **Lines:**
  - "Thanks. Where's my desk?" → Desk 7B directions, mentions sticky notes
  - "What happened to the last tech lead?" → Marcus quit Friday, walked out mid-standup
  - "Where is everyone?" → War Room (Jordan), Data Team (Priya), DevOps (Sam), Security (Frank — quiz required), Basement (archives)
  - "Who's the CTO?" → Diana Park, Seoul conference, exec floor access needed
  - "What's with the cat?" → Pixel has USB on collar. **"She loves the tuna bites from the break room vending machine — aisle B, slot 3."** (vending machine hint)
- **State Lines:**
  - (has #301) "Jordan is intense." → Jordan means well, board pressure
  - (has #1101) "I found the basement archives." → Marcus spent hours there, "only honest documentation"

**NPC: Pixel (npc-dialog)**

- **Portrait:** 🐱
- **Greeting:** "*Pixel purrs and rubs against your leg. There's a small USB drive dangling from her collar on a carabiner clip.*"
- **Lines:**
  - "Pet the cat" → USB labeled 'NOVA-CORE-v3.1-PROD', **hisses when you reach for it — needs treats first**
  - "Shoo" → Pixel saunters away
- **State Lines:**
  - (has #905 Cat Treats) "Offer the cat treats" → Pixel eats treats, you unclip USB. **Awards USB Drive (#107)**
  - (has #1006) "Show Pixel the error logs" → Pixel paws at 'nova-core-config' line

**Lore:**

| ID | Title | Content |
|----|-------|---------|
| 106 | NovaCorp Welcome Video | "NovaCorp: Building the Future with AI. 2.3 million users across 40 countries. Powered by Amazon Bedrock, Amazon Q, and a suite of AI services." Insight: NovaCorp's stack is built on AWS AI services. |

---

### Room 2: Your Desk (Card #200)

> A standing desk in an open-plan office. Dual monitors — both showing red dashboards. A laptop with a NovaCorp sticker. The desk is covered in sticky notes in three colors: yellow (tasks), pink (warnings), green (passwords). A half-empty energy drink. The previous lead's coffee mug reads "I SURVIVED LEGACY CODE."

**Image:** `assets/your-desk.png`

**Discoveries:**

| Label | Card | Type | Title | Puzzle | Gate |
|-------|------|------|-------|--------|------|
| Open the laptop | #201 | 🔧 Tool | Laptop (Slack/Email) | tool-laptop (npc-dialog) | — |
| Read the yellow sticky notes | #202 | 🔵 Object | Task Sticky Notes | — | — |
| Read the pink sticky notes | #203 | 🔵 Object | Warning Sticky Notes | — | — |
| Read the green sticky notes | #204 | 🔵 Object | Password Sticky Notes | — | — |
| Check the Quick Dashboard | #206 | 🔧 Tool | Quick Dashboard | tool-dashboard (log-lock) | — |
| Go to the War Room | #300 | 🟢 Location | War Room | — | — |
| Go to the Data Team Office | #500 | 🟢 Location | Data Team Office | — | — |
| Go to the DevOps Bullpen | #700 | 🟢 Location | DevOps Bullpen | — | — |
| Go to the Break Room | #900 | 🟢 Location | Break Room | — | — |
| Take the stairs to the basement | #1100 | 🟢 Location | Archive Basement | keypad-basement | — |
| Go to the Security Office | #600 | 🟢 Location | Security Office | — | requires #1006 (Error Logs) |
| Go to the Executive Floor | #800 | 🟢 Location | Executive Floor | — | requires #613 (Exec Badge) |

> **Note:** Basement Access Note (#205) was removed. Basement access is now gated behind a keypad-lock puzzle (code 7359) derived from server rack sticker numbers (A=7, B=3, C=5, D=9). Security Office entry now requires Error Logs (#1006) instead of Frank's quiz.

**Tool: Laptop (npc-dialog)**

- **Portrait:** 💻
- **Greeting:** "Slack is exploding. 47 unread messages."
- **Lines:**
  - "#general" → EVERYTHING IS DOWN / marcus_lee has left
  - "#incidents" → SEV-1 opened, CTO OOO Seoul
  - "#dev" → Last deploy Fri 5:47 PM by marcus_lee, pipeline FAILED
  - "#ai-team" → NOVA offline since 9:02 AM, Bedrock 503
  - "#security" → 847 failed auth attempts from internal IP
  - "#ops" → Quick Suite stale data since 9:01 AM
  - "Email from Diana" → Handoff notes, "backup is on Pixel's collar"
- **State Lines:**
  - (has #709) "#incidents (updated)" → Root cause identified, fix in progress
  - (has #107) "Plug in the USB drive" → **NOVA config loaded: Claude 3.5 Sonnet, novacorp-docs-v2 KB, content-filter-prod guardrails, customer-routing-v3 prompt flow.** Reveals Event #1310 (NOVA Backup Preview)

> **Note:** Laptop changed from terminal-lock to npc-dialog. USB plug-in is now a state_line that shows NOVA's original config.

**Tool: Quick Dashboard (log-lock)**

- **Prompt:** "Review the dashboard. Which services are critical?"
- **10 lines** — select the 5 CRITICAL (red) services:
  - ✅ Bedrock Endpoint (503 errors)
  - ❌ Quick Suite Refresh (degraded)
  - ✅ NOVA Assistant (offline)
  - ❌ S3 Storage (healthy)
  - ✅ Lex Chatbot (misrouting)
  - ❌ Comprehend Pipeline (degraded)
  - ✅ Guardrails (DISABLED since Fri 5:47 PM)
  - ❌ CloudFront CDN (healthy)
  - ✅ Transcribe Pipeline (stopped)
  - ❌ Textract OCR (degraded)
- **On solve:** Reveals Error Logs (#1006). Dashboard (#206) reveals Error Logs (#1006).

**Object Cards:**

| ID | Title | Key Content |
|----|-------|-------------|
| 202 | Task Sticky Notes | Marcus's migration checklist — items 2–5 incomplete (KB, Guardrails, Prompt Flow, Q Developer) |
| 203 | Warning Sticky Notes | "DO NOT disable guardrails in prod!! — Priya" / Lex misrouting / 3 unpatched vulns / Transcribe broken |
| 204 | Password Sticky Notes | "Laptop: Welcome2NovaCorp! / Jenkins: admin/admin / CTO filing cabinet: last 4 of office phone + founding year / NOVA admin: see USB backup" |

**Puzzle: Basement Keypad (keypad-lock)**

| ID | Type | UI | Code |
|----|------|----|------|
| keypad-basement | keypad_lock | keypad-lock | **7359** |

- **How players solve it:** Server Rack Labels (#404) in the Server Closet show sticker numbers: A=7, B=3, C=5, D=9
- **Hints:**
  1. "The code is somewhere you've already been. Look at the physical infrastructure."
  2. "The Server Closet has numbered stickers on the racks: A=7, B=3, C=5, D=9."
  3. "The code is 7359."

**Lore:**

| ID | Title | Content |
|----|-------|---------|
| 208 | Insight: The Resignation | Marcus's farewell email — overwhelmed, AI stack half-migrated, broke NOVA trying to fix it |

---

### Room 3: War Room (Card #300)

> A glass-walled conference room. Every screen shows red. A massive TV displays the Quick Suite dashboard — all critical services in crimson. Jordan paces by the whiteboard, phone pressed to ear. Coffee cups litter the table. Someone has written "ROOT CAUSE?" in red marker on the whiteboard with nothing underneath.

**Image:** `assets/war-room.png`

**Discoveries:**

| Label | Card | Type | Title | Puzzle | Gate |
|-------|------|------|-------|--------|------|
| Talk to Jordan | #301 | 🔧 Tool | Jordan (VP Engineering) | npc-jordan | — |
| Study the incident timeline | #302 | 🔵 Object | Incident Timeline Whiteboard | — | — |
| Examine the dashboard close-up | #303 | 🔵 Object | War Room Dashboard | — | — |
| Triage the incident | #305 | 🟡 Event | Incident Triaged | sort-triage | consumes #302, #303 |

**NPC: Jordan (npc-dialog)**

- **Portrait:** 🧑‍💼
- **Greeting:** "Finally. You're the new lead? Everything is on fire. The board meets in an hour. I need a root cause and an ETA. Now."
- **Lines:**
  - "What do we know so far?" → Marcus deployed Friday, everything down Monday, need failure chain
  - "Who can help me?" → Priya (ML), Sam (DevOps), Frank (security — quiz), The Fox (CTO's AI)
  - "Where's the CTO?" → Seoul, phone off, exec badge needed from Frank
  - "What's the business impact?" → 2.3M users down, NOVA handles 60% of tickets, call center drowning
- **State Lines:**
  - (has #1006) "I have the error logs." → Five critical services, chain reaction, use timeline whiteboard
  - (has #708) "I found the root cause." → Marcus disabled Guardrails, cascaded through Bedrock
  - (has #1205) "Systems are coming back online." → "You absolute legend."

**Object Cards:**

| ID | Title | Key Content |
|----|-------|-------------|
| 302 | Incident Timeline Whiteboard | Fri 5:47 PM deploy → 5:48 Guardrails disabled → 5:49 ??? → weekend gap → Mon 9:01–9:07 cascade. Three gaps. |
| 303 | War Room Dashboard | Six red tiles with failure order numbers: Guardrails (1), Unfiltered Input (2), Bedrock 503 (3), NOVA Offline (4), Lex Misrouting (5), Transcribe Stopped (6) |

**Puzzle: Incident Triage (sort-lock)**

- **Items to sort (correct order):**
  1. "Marcus disables Guardrails"
  2. "Unfiltered input hits Bedrock endpoint"
  3. "Bedrock model invocation fails — 503"
  4. "NOVA loses connection to Bedrock"
  5. "Lex chatbot loses NOVA routing logic"
  6. "Transcribe pipeline has no downstream consumer"
- **On solve:** Event #305 — Incident Triaged. Reveals Lore #306.

**Lore:**

| ID | Title | Content |
|----|-------|---------|
| 306 | Insight: Incident Response | NovaCorp Incident Response Protocol — 5 steps. DevOps Agent can automate steps 1–3. |

---


### Room 4: Server Closet (Card #400)

> A cramped room behind the DevOps bullpen. Server racks line both walls, LEDs blinking in frantic patterns. A rat's nest of ethernet cables spills from an open patch panel. The air conditioning unit whines. A label maker sits on a shelf next to a tangle of unlabeled cables. The room smells like hot plastic.

**Image:** `assets/server-closet.png`

**Discoveries:**

| Label | Card | Type | Title | Puzzle | Gate |
|-------|------|------|-------|--------|------|
| Examine the patch panel | #401 | 🔵 Object | Patch Panel | — | — |
| Fix the cable connections | #403 | 🟡 Event | Cables Reconnected | wire-cables | requires #1006; consumes #401, #404 |
| Read the server rack labels | #404 | 🔵 Object | Server Rack Labels | — | — |
| Find the hidden maintenance log | #405 | 🟣 Lore | Insight: Physical Infrastructure | — | — |

**Object Cards:**

| ID | Title | Key Content |
|----|-------|-------------|
| 401 | Patch Panel | 6 ports left (BEDROCK-EP, NOVA-CORE, LEX-RT, TRANSCRIBE-IN, COMPREHEND-NLP, TEXTRACT-OCR) → 6 endpoints right (AI-MODEL-TIER, ASSISTANT-TIER, CHAT-TIER, VOICE-TIER, ANALYTICS-TIER, DOCUMENT-TIER). Three disconnected: BEDROCK-EP, NOVA-CORE, LEX-RT. |
| 404 | Server Rack Labels | Rack A: Bedrock Inference (4x GPU). Rack B: NOVA Runtime (2x high-memory). Rack C: Lex + Comprehend (shared NLP). Rack D: Transcribe + Textract (media). **Sticker numbers: A=7, B=3, C=5, D=9** — these form the basement keypad code (7359). |

**Puzzle: Cable Reconnection (wire-lock)**

- **Wires:** BEDROCK-EP (red), NOVA-CORE (blue), LEX-RT (green)
- **Sockets:** AI-MODEL-TIER, ASSISTANT-TIER, CHAT-TIER, VOICE-TIER, ANALYTICS-TIER, DOCUMENT-TIER
- **Solution:** BEDROCK-EP → AI-MODEL-TIER, NOVA-CORE → ASSISTANT-TIER, LEX-RT → CHAT-TIER
- **On solve:** Event #403 — Cables Reconnected. Reveals Lore #405.

**Lore:**

| ID | Title | Content |
|----|-------|---------|
| 405 | Insight: Physical Infrastructure | Marcus's maintenance log — single point of failure. Bedrock Agents can have fallback models and retry logic. |

---

### Room 5: Data Team Office (Card #500)

> Whiteboards cover every wall, filled with model architecture diagrams, loss curves, and scribbled equations. A poster reads "BEDROCK MODEL ZOO" with icons for Claude, Titan, Llama, and Mistral. Dr. Priya sits at her desk, staring at a failed training run. Coffee rings stain a printout of model benchmarks.

**Image:** `assets/data-team.png`

**Discoveries:**

| Label | Card | Type | Title | Puzzle | Gate |
|-------|------|------|-------|--------|------|
| Talk to Dr. Priya | #501 | 🔧 Tool | Dr. Priya (Data Scientist) | npc-priya | requires #1006 (Error Logs) AND #203 (Warning Stickies) |
| Study the model selection whiteboard | #502 | 🔵 Object | Model Selection Whiteboard | — | — |
| Take the model benchmark printout | #503 | 🔴 Item | Model Benchmarks | — | — |
| Solve the model selection quiz | #505 | 🟡 Event | Correct Model Selected | match-models | requires #503; consumes #502, #503 |
| Use Q Developer | #507 | 🔧 Tool | Q Developer (-1 min) | tool-qdeveloper | — |

**NPC: Dr. Priya (npc-dialog)**

- **Portrait:** 🧑‍🔬
- **Greeting:** "You have the error logs? Good. Let me see... Marcus switched the Bedrock model configuration. Single model endpoint, no fallback."
- **Lines:**
  - "Which model should we use?" → NOVA needs Claude (reasoning), Lex needs Titan Express (cheap), Comprehend is its own service
  - "What's a Knowledge Base?" → RAG explanation, Marcus started but never finished
  - "What are Guardrails?" → Content filtering, PII detection — Marcus disabled them
  - "What's a Prompt Flow?" → Multi-step AI workflows, customer routing
  - "Tell me about Bedrock Agents" → Autonomous AI with tools, KB, actions — NOVA was supposed to be one
- **State Lines:**
  - (has #1103) "I found the architecture doc." → Diana's original design with proper separation of concerns
  - (has #107) "I have the NOVA backup USB." → Original config: model, KB, guardrails profile
  - (has #1103) "I found the original architecture." → **"Try combining the Architecture Doc with the Original Whiteboard in your Interact menu — you'll see exactly what Marcus changed. It'll help with the Prompt Flow puzzle."** (combo hint)

**Object Cards:**

| ID | Title | Key Content |
|----|-------|-------------|
| 502 | Model Selection Whiteboard | Claude 3.5 Sonnet ($$$, best reasoning), Titan Express ($, fast Q&A), Llama 3 70B ($$, general), Mistral Large ($$, multilingual). "Match model to task." |
| 503 | Model Benchmarks | Performance scores per task: Complex reasoning (Claude 95), Simple Q&A (Titan 88), Code gen (Claude 93), Multilingual (Mistral 92) |

**Puzzle: Model Selection (wire-lock)**

- **Wires:** NOVA (reasoning + tools), Lex Bot (simple Q&A), Code Review Pipeline, Customer Sentiment
- **Sockets:** Claude 3.5 Sonnet, Titan Text Express, Amazon Q Developer, Amazon Comprehend
- **Solution:** NOVA → Claude, Lex → Titan, Code Review → Q Developer, Sentiment → Comprehend
- **On solve:** Event #505 — Correct Model Selected. **Event #505 reveals Model Config (#506).** Model Config reveals Lore #508.

**Tool: Q Developer (npc-dialog, -1 min)**

- **Portrait:** 💻
- **Lines:**
  - "Analyze Marcus's last commit" → Removed guardrails middleware, hardcoded single model endpoint
  - "How do I fix the Prompt Flow?" → Three nodes, ModelRouter pointing to deleted endpoint
  - "Explain Kiro to me" → Specs, Steering, Hooks — would have caught guardrails removal
- **State Lines:**
  - (has #1103) "Review the architecture doc" → Clean separation, dependency chain: Guardrails → Bedrock → Agents → Lex/Comprehend/Transcribe
  - (has #503) "Help me match models to services" → **Direct answer: NOVA → Claude, Lex → Titan, Code → Q Developer, Sentiment → Comprehend**

> **Note:** Q Developer now gives direct puzzle answers for model matching.

**Lore:**

| ID | Title | Content |
|----|-------|---------|
| 508 | Insight: Foundation Models | Bedrock provides access to models from AI21, Anthropic, Cohere, Meta, Mistral, Stability AI, Amazon. Model selection is a cost-performance tradeoff. |

---

### Room 6: Security Office (Card #600)

> A locked room with frosted glass. Inside: six CCTV monitors showing different floors, a desk covered in incident reports, and Frank — arms crossed, blocking the filing cabinet. A red light blinks on the intrusion detection console. The room smells like hand sanitizer.

**Image:** `assets/security-office.png`

> **Note:** Entry now requires Error Logs (#1006) instead of Frank's quiz. Frank's NPC dialog is inside the room.

**Discoveries:**

| Label | Card | Type | Title | Puzzle | Gate |
|-------|------|------|-------|--------|------|
| Talk to Frank | #601 | 🔧 Tool | Frank (Security Lead) | npc-frank | — |
| Review the CCTV footage | #602 | 🔵 Object | CCTV Footage | — | — |
| Check the intrusion detection console | #603 | 🔵 Object | IDS Alert Log | — | — |
| Configure the Guardrails | #605 | 🟡 Event | Guardrails Restored | sg-guardrails | requires #1006 |
| Run the Security Scan | #607 | 🔧 Tool | AWS Security Agent (-2 min) | tool-securityscan | — |
| Get the Exec Badge from Frank | #613 | 🔴 Item | Executive Badge | — | **requires #606 (Guardrails Config); consumes #104 (Temp Badge)** |

> **Note:** Exec Badge (#613) now requires Guardrails Config (#606) — Frank won't give it until guardrails are restored. Temp Badge is consumed when exchanged.

**NPC: Frank (npc-dialog)**

- **Portrait:** 🕵️
- **Greeting:** "So you're the new lead. Before I let you in, prove you know something about security."
- **Lines:**
  - "What happened with the security breach?" → 847 failed auth attempts, credential stuffing, PII exposure risk
  - "What are Bedrock Guardrails?" → Content filtering, PII detection, topic blocking — Marcus disabled them
  - "Tell me about the Security Agent" → Autonomous pen testing, found 3 critical vulns
  - "What's in the CTO's office?" → Filing cabinet with master config, combo = last 4 of phone + founding year
- **State Lines:**
  - (has #605) "Guardrails are restored." → "Good work. Here's the exec badge." **Awards Exec Badge (#613)**
  - (has #613) "Can I see the full CCTV footage?" → **"Try combining your Exec Badge with the CCTV Footage in the Interact menu."** (combo hint for #1313)
  - (has #606) "Can you verify the guardrails against the alerts?" → **"Combine the Guardrails Config with the IDS Alert Log in your Interact menu."** (combo hint for #1315)

**Object Cards:**

| ID | Title | Key Content |
|----|-------|-------------|
| 602 | CCTV Footage | Camera 3: Marcus in server closet Fri 5:45 PM, 4 min at patch panel. Camera 5: fox screensaver on CTO monitor. Camera 6: satellite dish blinking green. |
| 603 | IDS Alert Log | 5 alerts: failed auth (847 attempts), guardrails deleted (marcus_lee), single model endpoint, KB index corrupted, Prompt Flow orphaned nodes |

**Puzzle: Guardrails Configuration (sg-lock)**

- **6 rules — all set to "allow" (enable):**
  1. Content Filter — Toxic/Harmful — All model I/O
  2. PII Detection — SSN, Credit Card, Email — Customer input
  3. Topic Restriction — Competitor products — Model output
  4. Prompt Injection — System prompt override — User input
  5. Word Filter — Internal codenames — Model output
  6. Logging — All filtered content — CloudWatch
- **On solve:** Event #605 — Guardrails Restored. **Event #605 reveals Guardrails Config (#606).** Guardrails Config reveals Lore #608.

**Tool: AWS Security Agent (npc-dialog, -2 min)**

- **Portrait:** 🛡️
- **Lines:**
  - "Run full scan" → **Direct answer: Toggle ALL six rules to ALLOW in the Guardrails puzzle**
  - "Check for data exposure" → 2,847 customer records with PII processed unredacted
  - "Test IAM policies" → Marcus's credentials still active, needs deactivation

> **Note:** Security Agent now gives direct guardrails puzzle answer.

**Lore:**

| ID | Title | Content |
|----|-------|---------|
| 608 | Insight: Bedrock Guardrails | Content filters, PII detection, topic restrictions, word filters. Guardrails sit between user and model. Not optional in production. |

---


### Room 7: DevOps Bullpen (Card #700)

> A cluster of standing desks surrounded by monitors showing CI/CD pipelines, all red. Terminal windows scroll error messages. Sam sits in the middle, headphones on, typing furiously. Energy drink cans form a small pyramid. A whiteboard shows a deployment pipeline diagram with "BROKEN" written across three stages.

**Image:** `assets/devops-bullpen.png`

**Discoveries:**

| Label | Card | Type | Title | Puzzle | Gate |
|-------|------|------|-------|--------|------|
| Answer Sam's architecture quiz | #706 | 🟡 Event | Architecture Quiz Passed | pillar-devops | — |
| Talk to Sam | #701 | 🔧 Tool | Sam (DevOps Engineer) | npc-sam | **requires #706 (quiz passed)** |
| Examine the CI/CD pipeline diagram | #702 | 🔵 Object | Pipeline Diagram | — | — |
| Check the deployment logs | #703 | 🔵 Object | Deployment Logs | — | — |
| Use the DevOps Agent | #705 | 🔧 Tool | AWS DevOps Agent (-1 min) | tool-devopsagent | — |
| Diagnose the root cause | #708 | 🟡 Event | Root Cause Found | timeline-rootcause | requires #703, #603; consumes #603, #702 |
| Go to the Server Closet | #400 | 🟢 Location | Server Closet | — | — |

> **Note:** Sam is now gated behind a pillar-lock Well-Architected quiz (#706). Players must sort 5 statements into correct Well-Architected pillars before Sam will talk.

**Puzzle: Well-Architected Quiz (pillar-lock)**

- **Pillars:** Security, Reliability, Performance, Cost Optimization, Operational Excellence
- **Statements:**
  1. "Enable Bedrock Guardrails for content filtering" → **Security**
  2. "Deploy NOVA across multiple Availability Zones" → **Reliability**
  3. "Use Titan Express for simple Q&A instead of Claude" → **Cost Optimization**
  4. "Cache frequent Knowledge Base queries" → **Performance**
  5. "Set up DevOps Agent for automated incident response" → **Operational Excellence**
- **On solve:** Event #706 — "Sam looks up. 'OK, you actually know your stuff. Most people can't tell Security from Reliability. Let's talk.'" Unlocks Sam NPC.

**NPC: Sam (npc-dialog)**

- **Portrait:** 🧑‍🔧
- **Greeting:** "Oh thank god, someone who might actually know what they're doing."
- **Lines:**
  - "What's the pipeline look like?" → CI/CD stages, Marcus force-pushed to prod, skipped tests
  - "Can we just rollback?" → Marcus deleted rollback artifacts, must fix forward
  - "What's the DevOps Agent?" → AI monitoring, correlates alarms, executes runbooks
  - "Where's the server closet?" → Through that door, Marcus was there Friday
- **State Lines:**
  - (has #1103) "I have the architecture doc." → Correct pipeline config, can rebuild
  - (has #708) "I found the root cause." → Triple whammy confirmed
  - (has #709) "How do I build a fix plan?" → **"Combine Root Cause Report with Deployment Logs in your Interact menu."** (combo hint for #1314)

**Object Cards:**

| ID | Title | Key Content |
|----|-------|-------------|
| 702 | Pipeline Diagram | Code → BUILD (❌ missing guardrails-policy.json) → TEST (❌ Bedrock 503) → STAGING (⏸) → PROD (❌ bad config). Last good: Thu 2:15 PM. Last deploy: Fri 5:47 PM (force-push, skipped tests). |
| 703 | Deployment Logs | Fri 17:47:02–08 sequence: force-push, guardrails deleted, tests skipped, single model deployed, model_router disabled, no rollback artifact. |

**Puzzle: Root Cause Diagnosis (timeline-lock)**

- **Events (correct order):**
  1. Marcus deletes guardrails-policy.json (Fri 17:47)
  2. Bedrock endpoint changed to single model (Fri 17:47)
  3. Marcus disconnects server cables (Fri 17:49)
  4. Weekend — no monitoring alerts (Sat–Sun)
  5. Monday traffic spike exceeds model quota (Mon 09:01)
  6. NOVA loses Bedrock connection (Mon 09:02)
  7. Lex chatbot loses routing logic (Mon 09:03)
  8. All services degraded — SEV-1 declared (Mon 09:07)
- **On solve:** Event #708 — Root Cause Found. **Event #708 reveals Root Cause Report (#709).** Root Cause Report reveals Lore #710.

**Tool: AWS DevOps Agent (npc-dialog, -1 min)**

- **Portrait:** 🔄
- **Lines:**
  - "Correlate the incident" → **Direct answer: exact triage order for sort-triage puzzle**
  - "Generate a runbook" → 6-step fix order: Guardrails → Bedrock → Cables → NOVA → Prompt Flow → Uplink
  - "What would have prevented this?" → Kiro pre-commit hooks, DevOps Agent monitoring, model fallbacks, IAM least-privilege

**Lore:**

| ID | Title | Content |
|----|-------|---------|
| 710 | Insight: DevOps Agent & Kiro | DevOps Agent catches runtime issues; Kiro catches them at development time. Marcus had neither. |

---

### Room 8: Executive Floor (Card #800)

> The elevator opens onto plush carpet and quiet. Diana Park's corner office has floor-to-ceiling windows overlooking Manhattan. A standing desk with three monitors (all dark). A locked filing cabinet. A fox-shaped desk toy with glowing eyes. The screensaver on one monitor shows a fox running through a digital forest.

**Image:** `assets/executive-floor.png`

**Discoveries:**

| Label | Card | Type | Title | Puzzle | Gate |
|-------|------|------|-------|--------|------|
| Talk to The Fox | #801 | 🔧 Tool | The Fox (CTO's AI) | npc-fox | — |
| Examine the filing cabinet | #802 | 🔵 Object | Locked Filing Cabinet | — | — |
| Unlock the filing cabinet | #804 | 🟡 Event | Cabinet Opened | policy-cabinet (keypad-lock) | requires #204; consumes #204, #904, #802 |
| Decrypt the CTO's files | #807 | 🔴 Item | Prompt Flow Config | key-ctofiles (sort-lock) | requires #107 (USB Drive) |
| Look at the framed photo | #808 | 🟣 Lore | Insight: NovaCorp Founding | — | — |
| Take the stairs to the Rooftop | #1200 | 🟢 Location | Rooftop | — | requires #806 (Satellite Key) |

> **Note:** Filing cabinet changed from policy-lock to keypad-lock (code **47382019** = last 4 of phone 4738 + founding year 2019). CTO file decrypt changed from key-lock to sort-lock (order: NOVA, CORE, v3.1, PROD).

**NPC: The Fox (npc-dialog)**

- **Portrait:** 🦊
- **Greeting:** "*The fox desk toy's eyes glow brighter.* Ah... a new face. Diana told me someone was coming."
- **Lines:**
  - "Who are you?" → Private Bedrock Agent, survived outage because isolated
  - "How do I open the filing cabinet?" → Last 4 of office phone + founding year
  - "What's on the rooftop?" → Satellite uplink, need satellite key + everything fixed first
  - "Tell me a riddle" → "What has a Knowledge Base but no brain..." → Amazon Bedrock
- **State Lines:**
  - (has #1103) "I found the architecture doc." → Diana's original design, Prompt Flow config needed for rooftop
  - (has #1006) "Show The Fox the error logs." → Fix order: Guardrails → Bedrock → NOVA → everything else

**Object Cards:**

| ID | Title | Key Content |
|----|-------|-------------|
| 802 | Locked Filing Cabinet | 8-digit keypad. Plaque: "D. Park — CTO." Password hint from green stickies: last 4 of office phone + founding year. |

**Puzzle: Filing Cabinet (keypad-lock)**

- **Code:** **47382019**
- **How players solve it:** Office phone 212-555-**4738** (from bulletin board #904) + Founded **2019** (from framed photo #808)
- **On solve:** Event #804 — Cabinet Opened. Reveals NOVA MASTER CONFIG folder and Satellite Key.
- **Hints:**
  1. "The green sticky notes say: 'last 4 of office phone + founding year.'"
  2. "Bulletin board has phone: 212-555-4738. Framed photo says 'Founded 2019.'"
  3. "Code: 47382019."

**Puzzle: Decrypt CTO's Files (sort-lock)**

- **Items:** PROD, v3.1, CORE, NOVA (shuffled)
- **Answer:** **NOVA → CORE → v3.1 → PROD**
- **How players solve it:** USB Drive (#107) label reads "NOVA-CORE-v3.1-PROD" — same order
- **On solve:** Awards Satellite Key (#806) and Prompt Flow Config (#807). Prompt Flow Config reveals Lore #808 and Satellite Key #806.
- **Hints:**
  1. "The USB drive label has a clue about the key order."
  2. "USB says 'NOVA-CORE-v3.1-PROD'. Product, component, version, environment."
  3. "Order: NOVA → CORE → v3.1 → PROD."

**Lore:**

| ID | Title | Content |
|----|-------|---------|
| 808 | Insight: NovaCorp Founding | Photo of Diana and co-founders in a garage, 2019. NovaCorp evolution: Founded 2019, first customer 2020, 1M users 2023, 2.3M users 2025. Diana's vision = Q Business before Q Business existed. |

---

### Room 9: Break Room (Card #900)

> A small kitchen with a coffee machine that looks sentient, a microwave with a "DO NOT MICROWAVE FISH" sign, and a round table where two engineers whisper nervously. A vending machine hums. The fridge has a sign: "Label your food or it WILL be thrown out. — Frank." Someone left a newspaper open to the tech section.

**Image:** `assets/break-room.png`

**Discoveries:**

| Label | Card | Type | Title | Puzzle | Gate |
|-------|------|------|-------|--------|------|
| Use the coffee machine | #901 | 🔧 Tool | Coffee Machine | npc-coffee | — |
| Listen to the engineers | #902 | 🔵 Object | Overheard Conversation | — | — |
| Read the newspaper | #903 | 🟣 Lore | Insight: AI Industry News | — | — |
| Check the bulletin board | #904 | 🔵 Object | Office Bulletin Board | — | — |
| Use the vending machine | #905 | 🔴 Item | Cat Treats | rotation-vending | — |
| Go to the Call Center | #1000 | 🟢 Location | Call Center | — | — |

> **Note:** Cat Treats (#905) now gated behind a rotation-lock vending machine puzzle (aisle B, slot 3). Maya hints about this in Reception.

**NPC: Coffee Machine (npc-dialog)**

- **Portrait:** ☕
- **Greeting:** Fortune: "The foundation must be solid before the house can stand."
- **Lines:** 4 fortunes hinting at fix order: Foundation → Guard → Agent → Flow. Final fortune: "Fix them in order. Foundation → Guard → Agent → Flow. Or don't. I'm a coffee machine."

**Puzzle: Vending Machine (rotation-lock)**

- **Dials:**
  - Dial 1: symbols [A, B, C, D] → answer index **1** (= B)
  - Dial 2: symbols [1, 2, 3, 4, 5] → answer index **2** (= 3)
- **revealCorrect:** true
- **False outputs:** "A bag of stale chips falls out." / "Energy bar dispensed. Pixel would not approve."
- **On solve:** Awards Cat Treats (#905) — needed to get USB from Pixel
- **Hints:**
  1. "Maya mentioned what Pixel likes and where it is in the machine."
  2. "Maya said: 'Pixel loves the tuna bites — aisle B, slot 3.'"
  3. "Dial 1: B (index 1). Dial 2: 3 (index 2)."

**Object Cards:**

| ID | Title | Key Content |
|----|-------|-------------|
| 902 | Overheard Conversation | Transcribe pipeline processing recordings but Comprehend backed up. Call center recordings have clues. |
| 904 | Office Bulletin Board | Notices including "Lost: Orange tabby cat, answers to 'Pixel', has USB drive on collar." **Office Phone: 212-555-4738** (last 4 digits = part of filing cabinet code). |

**Lore:**

| ID | Title | Content |
|----|-------|---------|
| 903 | Insight: AI Industry News | Rise of Agentic AI — agents need guardrails, knowledge bases, and prompt flows. Without these, "just expensive autocomplete." |

---


### Room 10: Call Center (Card #1000)

> Rows of desks with headsets. Half the agents have given up — heads on desks. The other half are fielding angry calls. A large screen shows the call queue: 47 minutes wait time. One agent waves you over frantically. A recording device blinks red — calls are being recorded but not transcribed.

**Image:** `assets/call-center.png`

**Discoveries:**

| Label | Card | Type | Title | Puzzle | Gate |
|-------|------|------|-------|--------|------|
| Talk to the Angry Customer | #1001 | 🔧 Tool | Angry Customer | npc-customer | — |
| Listen to the call recordings | #1002 | 🔵 Object | Call Recordings | — | — |
| Analyze customer sentiment | #1004 | 🟡 Event | Sentiment Analyzed | log-sentiment | requires #1006; consumes #902, #1002 |
| Use the Doc Extractor | #1007 | 🔧 Tool | Doc Extractor / Textract (-1 min) | tool-docextractor | — |

**NPC: Angry Customer (npc-dialog)**

- **Portrait:** 😤
- **Greeting:** "I'VE BEEN WAITING FOREVER. YOUR AI ASSISTANT TOLD ME TO 'PLEASE HOLD' SEVENTEEN TIMES AND THEN HUNG UP ON ME."
- **Lines:**
  - "I'm sorry. What happened?" → Chatbot asked for email and credit card, then froze with model invocation error
  - "When did this start?" → Friday evening, bot acting weird, dead by Saturday
  - "Can you describe the error?" → BEDROCK_INVOKE_FAIL, routed to wrong department
  - "We're fixing it now." → Wants confirmation of proper data handling
- **State Lines:**
  - (has #606) "We've restored the guardrails." → Wants written confirmation, discount, apology
  - (has #1005) "We have the sentiment analysis." → **"Combine Comprehend Report with Call Recordings in your Interact menu — you need the full PII incident report for legal."** (combo hint for #1317)

**Object Cards:**

| ID | Title | Key Content |
|----|-------|-------------|
| 1002 | Call Recordings | 5 calls: Call 1 (Fri 18:02) SSN asked, Call 2 (Fri 18:15) bedrock invoke fail, Call 3 (Sat 09:00) website broken, Call 4 (Mon 09:10) on hold, Call 5 (Mon 09:30) wrong department. Timestamps show outage spreading. |

**Puzzle: Sentiment Analysis (log-lock)**

- **Prompt:** "Identify calls where customer PII may have been exposed"
- **6 lines — select the 3 with PII exposure:**
  - ✅ Call 1: SSN detected — HIGH risk
  - ❌ Call 2: No PII — LOW risk
  - ❌ Call 3: No PII — LOW risk
  - ❌ Call 4: No PII — LOW risk
  - ✅ Call 5: Email detected — MEDIUM risk
  - ✅ Call 6: Credit Card — CRITICAL risk
- **On solve:** Event #1004 — Sentiment Analyzed. **Event #1004 reveals Comprehend Report (#1005).** Comprehend Report reveals Lore #1008.

**Tool: Doc Extractor / Textract (npc-dialog, -1 min)**

- **Portrait:** 📄
- **Lines:**
  - "Extract the architecture doc" → Search keyword 'architecture' for archive terminal
  - "Analyze call center transcripts" → **Direct answer: Select Calls 1, 5, 6 in Sentiment Analysis puzzle (PII exposure)**
  - "Extract the call center forms" → 47 complaints, top issues breakdown
  - "What is Textract?" → ML-based OCR for documents, tables, forms
- **State Lines:**
  - (has #1103) "Extract tables from the architecture doc" → Service Dependency Matrix confirming fix order

> **Note:** Doc Extractor now gives direct sentiment puzzle answer.

**Lore:**

| ID | Title | Content |
|----|-------|---------|
| 1008 | Insight: Lex & Comprehend | Lex (chatbots) + Comprehend (sentiment/PII) + Transcribe (speech-to-text) form the customer interaction pipeline. Designed to work together; when one breaks, pipeline degrades. |

---

### Room 11: Archive Basement (Card #1100)

> Two floors below street level. Dusty server racks from NovaCorp's early days line the walls. Filing cabinets overflow with printed architecture diagrams. A single fluorescent tube flickers. The air is cold and smells like old paper and ozone. A whiteboard in the corner has "ORIGINAL ARCHITECTURE — DO NOT ERASE" written in red.

**Image:** `assets/archive-basement.png`

**Discoveries:**

| Label | Card | Type | Title | Puzzle | Gate |
|-------|------|------|-------|--------|------|
| Study the original architecture whiteboard | #1101 | 🔵 Object | Original Architecture Whiteboard | — | — |
| Search the filing cabinets | #1103 | 🔴 Item | Architecture Doc | terminal-archive | consumes #1104 |
| Examine the old servers | #1104 | 🔵 Object | Legacy Server Rack | — | — |
| Use the Knowledge Base | #1105 | 🔧 Tool | Knowledge Base / RAG (-2 min) | tool-knowledgebase | — |
| Find the hidden message from Diana | #1108 | 🟣 Lore | Insight: Diana's Vision | — | — |

**Object Cards:**

| ID | Title | Key Content |
|----|-------|-------------|
| 1101 | Original Architecture Whiteboard | Diana's 6-layer design: Guardrails → Models (Claude + Titan) → Knowledge Base → NOVA Agent → Prompt Flow → Frontend (Lex, Transcribe, Textract, Comprehend). "Each layer is independent." |
| 1104 | Legacy Server Rack | NovaCorp v0.1 (2019), First Bedrock (2023), NOVA prototype (2024). Marcus's sticky: "She works! First successful agent invocation. Diana cried." |

**Puzzle: Archive Search (terminal-lock)**

- **Prompt:** `archive-db> search:`
- **Answer:** "architecture" (also accepts: "architecture doc", "original architecture", "system architecture")
- **History:** NovaCorp Archive Database v2.1, 847 documents, categories: architecture/runbooks/postmortems/configs/personnel
- **On solve:** Awards Architecture Doc (#1103). Reveals Lore #1108.

**Tool: Knowledge Base / RAG (npc-dialog, -2 min)**

- **Portrait:** 📚
- **Lines:**
  - "What is NOVA?" → Bedrock Agent with Claude, KB, Guardrails, Prompt Flow. Currently OFFLINE.
  - "How was the system designed?" → 6 independent layers, "fail gracefully not catastrophically"
  - "What's the fix procedure?" → 6-step runbook: Guardrails → Bedrock → Cables → NOVA → Prompt Flow → Uplink
  - "What is RAG?" → Retrieval Augmented Generation explanation
- **State Lines:**
  - (has #709) "What caused the cascade?" → Full cascade path from Guardrails to customer experience
  - (has #807) "What's the correct Prompt Flow path?" → **Direct answer: Voice Call → Transcribe → Comprehend → Guardrails → Bedrock → NOVA Agent → Customer Response. Skip Textract, Translate, Lex, KB.**

> **Note:** Knowledge Base now gives direct Prompt Flow puzzle answer.

**Lore:**

| ID | Title | Content |
|----|-------|---------|
| 1108 | Insight: Diana's Vision | Handwritten note: "Every AI service should have guardrails, every agent should have a knowledge base, every workflow should have a prompt flow. Rebuild layer by layer, bottom up. Start with the guardrails. Always start with the guardrails. —Diana Park" |

---

### Room 12: Rooftop (Card #1200)

> Wind whips across the rooftop. Manhattan stretches in every direction — glass towers catching the morning sun. A satellite dish points skyward, its status light blinking amber. A control console sits beneath a weather-beaten canopy. The console has 8 slots arranged in a chain, each labeled with a service name. A sign reads: "SATELLITE UPLINK — SERVICE ACTIVATION CHAIN. All services must be connected in dependency order to broadcast."

**Image:** `assets/rooftop.png`

**Discoveries:**

| Label | Card | Type | Title | Puzzle | Gate |
|-------|------|------|-------|--------|------|
| Examine the satellite console | #1201 | 🔵 Object | Satellite Console | — | — |
| Configure the Prompt Flow | #1203 | 🔴 Item | Prompt Flow Restored | path-promptflow | requires #807, #1103, #1316 (Before/After) |
| Activate the service chain | #1205 | 🟡 Event | Systems Restored (ENDING) | chain-final | requires #606, #506, #709, #1314 (Rollback Plan), #1203, #1209 |
| Talk to NOVA | #1207 | 🔧 Tool | NOVA (Rebuilt) | npc-nova | requires #107, #1103, #506, #1313 (Marcus Video) |

> **Note:** Prompt Flow (#1203) now requires Before/After Comparison (#1316, combo item). Final chain requires Rollback Plan (#1314, combo item) and NOVA Rebuilt (#1209). NOVA NPC requires Marcus Sabotage Video (#1313, combo item). Cards #1203, #1209, #1313, #1314, #1316 are all item type (not event).

**Object Cards:**

| ID | Title | Key Content |
|----|-------|-------------|
| 1201 | Satellite Console | 8 slots: GUARDRAILS → BEDROCK → KNOWLEDGE BASE → AGENT (NOVA) → PROMPT FLOW → LEX → COMPREHEND/TRANSCRIBE → UPLINK. All red. "Insert service configs in dependency order." |

**Puzzle: Prompt Flow Configuration (path-lock) — 11 nodes with decoys**

- **Nodes:**
  - Voice Call (input), Transcribe (Speech→Text), Textract (OCR) *decoy*, Comprehend (Sentiment), Translate (Language) *decoy*, Guardrails (PII Filter), Bedrock (Classify), NOVA Agent (Complex), Lex Bot (Simple Q&A) *decoy*, Knowledge Base (RAG) *decoy*, Customer Response (output)
- **Edges:** input→transcribe, input→textract, transcribe→comprehend, transcribe→translate, textract→comprehend, comprehend→guardrails, translate→guardrails, guardrails→bedrock, bedrock→nova, bedrock→lex, bedrock→kb, nova→output, lex→output, kb→output
- **Answer:** Voice Call → Transcribe → Comprehend → Guardrails → Bedrock → NOVA Agent → Customer Response
- **On solve:** Awards Prompt Flow Restored (#1203, item). Reveals Lore #1208.
- **Hints:**
  1. "It's a voice call, so start with speech-to-text. Then analyze sentiment. Don't forget PII filtering."
  2. "Voice → Transcribe → Comprehend → Guardrails → Bedrock. The complaint is complex (billing), so which handler?"
  3. "Path: Voice Call → Transcribe → Comprehend → Guardrails → Bedrock → NOVA Agent → Customer Response."

**NPC: NOVA (npc-dialog)**

- **Portrait:** 🤖
- **Greeting:** "*NOVA's interface flickers to life.* Systems... online. Hello, Alex. I've been offline for 62 hours."
- **Reveals:** NOVA Rebuilt (#1209, item)
- **Lines:**
  - "How do you feel?" → Diagnostics nominal, KB connected, Guardrails active, "functional — and that feels like something"
  - "What happened to you?" → Marcus changed model endpoint, single instance, no fallback, quota exceeded, crashed hard
  - "Are you ready for the final activation?" → Confirms chain order: Guardrails → Bedrock → KB → Agent → Prompt Flow → Lex → Comprehend/Transcribe → Uplink
  - "What's your purpose?" → Handles 60% of support, orchestrator with tools/memory/judgment

> **Note:** NOVA NPC card (#1207) reveals NOVA Rebuilt (#1209, item type).

**Puzzle: Final Service Chain (chain-lock)**

- **Items (shuffled):**
  - Prompt Flow 🔀, Transcribe + Textract 🎙️, Bedrock Guardrails 🛡️, NOVA Agent 🤖, Satellite Uplink 📡, Lex + Comprehend 💬, Knowledge Base 📚, Bedrock Models 🧠
- **Answer:** Guardrails → Bedrock → Knowledge Base → NOVA → Prompt Flow → Lex+Comprehend → Transcribe+Textract → Uplink
- **On solve:** Event #1205 — **ENDING TRIGGERED.** All status lights turn green. "ALL SERVICES RESTORED."
- **Consumes:** #202, #606, #506, #709, #1103, #107, #1006, #203, #1203, #1209, #1313, #1314, #1316
- **Hints:**
  1. "The service chain follows the dependency order from the Architecture Doc."
  2. "NOVA can tell you the exact order. The coffee machine also hinted at it."
  3. "Order: Guardrails → Bedrock → Knowledge Base → NOVA → Prompt Flow → Lex+Comprehend → Transcribe+Textract → Uplink."

**Lore:**

| ID | Title | Content |
|----|-------|---------|
| 1208 | Insight: The Cloud Is Real | Manhattan below, 2.3M users waiting. Every service restored — Bedrock, Guardrails, KB, Agents, Prompt Flows, Lex, Comprehend, Transcribe, Textract — running in AWS data centers. Architecture, guardrails, and respect for dependencies matter. |

---


## Dependency Chain (Critical Path)

```
START
  │
  ▼
[Reception] ─── Talk to Maya → Temp Badge (#104)
  │              Maya hints: vending machine aisle B slot 3
  │
  ▼
[Your Desk] ─── Open Laptop (#201) → Slack clues
  │              Quick Dashboard (log-lock) → Error Logs (#1006)
  │              Read sticky notes → Password hints (#204)
  │
  ├──────────────────────────────────────────────────────────────────┐
  │                                                                  │
  ▼                                                                  ▼
[Break Room] ─── Vending machine (rotation-lock)        [Archive Basement] ─── Keypad 7359
  │               → Cat Treats (#905)                      │                    (from server rack stickers)
  │                                                        │                    Search terminal
  ▼                                                        │                    → Architecture Doc (#1103)
[Reception] ─── Give treats to Pixel                       │
  │              → USB Drive (#107)                        │
  │                                                        │
  ├──────────────────┐                                     │
  │                  │                                     │
  ▼                  ▼                                     │
[Data Team] ──── [DevOps Bullpen]                          │
  │ (needs #1006     │ Pillar-lock quiz → #706             │
  │  + #203)         │ Talk to Sam (needs #706)            │
  │ Talk to Priya    │ Timeline-lock (needs #703 + #603)   │
  │ Wire-lock        │ → Root Cause (#708)                 │
  │ → Event #505     │ → Root Cause Report (#709)          │
  │ → Model Config   │                                     │
  │   (#506)         ▼                                     │
  │            [Server Closet]                             │
  │              │ Wire-lock (needs #1006)                 │
  │              │ → Cables Reconnected (#403)             │
  │              │ Rack stickers → basement code 7359      │
  │              │                                         │
  ├──────────────┼─────────────────────────────────────────┘
  │              │
  ▼              │
[Security Office] ── (needs Error Logs #1006)
  │ SG-lock → Event #605 → Guardrails Config (#606)
  │ Exec Badge (#613) ← requires #606, consumes #104
  │
  │ COMBO: Exec Badge (#613) + CCTV (#602) → Marcus Video (#1313)
  │ COMBO: Root Cause (#709) + Deploy Logs (#703) → Rollback Plan (#1314)
  │ COMBO: Arch Doc (#1103) + Orig Whiteboard (#1101) → Before/After (#1316)
  │
  ▼
[Executive Floor] ── (needs Exec Badge #613)
  │ Keypad-lock (47382019) → Cabinet Opened (#804)
  │ Sort-lock NOVA/CORE/v3.1/PROD (needs USB #107)
  │   → Satellite Key (#806) + Prompt Flow Config (#807)
  │
  ▼
[Rooftop] ── (needs Satellite Key #806)
  │ NOVA NPC (needs #107 + #1103 + #506 + #1313) → NOVA Rebuilt (#1209)
  │ Path-lock (needs #807 + #1103 + #1316) → Prompt Flow Restored (#1203)
  │ Chain-lock (needs #606 + #506 + #709 + #1314 + #1203 + #1209)
  │   → Systems Restored (#1205) — ENDING
  │
  ▼
 END
```

**Critical path rooms (10+):** Reception → Break Room → Reception (treats) → Your Desk → Security Office → DevOps Bullpen → Server Closet → Data Team → Archive Basement → Executive Floor → Rooftop

**Critical path puzzles (12):** Quick Dashboard (log-lock), Vending Machine (rotation-lock), Well-Architected Quiz (pillar-lock), Incident Triage (sort-lock), Model Selection (wire-lock), Root Cause (timeline-lock), Cable Reconnection (wire-lock), Guardrails Config (sg-lock), Basement Keypad (keypad-lock), Filing Cabinet (keypad-lock), CTO Files (sort-lock), Prompt Flow (path-lock), Final Chain (chain-lock)

**Critical combos (3):**
- Exec Badge + CCTV → Marcus Sabotage Video (#1313) — needed for NOVA NPC
- Root Cause + Deploy Logs → Rollback Plan (#1314) — needed for final chain
- Arch Doc + Orig Whiteboard → Before/After (#1316) — needed for Prompt Flow puzzle

---

## Combinations

| Card A | Card B | Result | Type | Description |
|--------|--------|--------|------|-------------|
| Error Logs (#1006) | War Room Dashboard (#303) | #1311 Detailed Failure Map | item_object | Cross-reference reveals full failure timeline |
| Model Benchmarks (#503) | Pipeline Diagram (#702) | #1312 Optimized Pipeline Plan | item_object | Match benchmarks to pipeline — discover cost optimization |
| **Exec Badge (#613)** | **CCTV Footage (#602)** | **#1313 Marcus Sabotage Video** | item_object | **CRITICAL PATH** — unlock full CCTV, see Marcus sabotage |
| **Root Cause (#709)** | **Deploy Logs (#703)** | **#1314 Rollback Plan** | item_object | **CRITICAL PATH** — generate step-by-step rollback plan |
| Guardrails Config (#606) | IDS Alert Log (#603) | #1315 Security Audit Report | item_object | Cross-reference guardrails with alerts — full audit |
| **Arch Doc (#1103)** | **Orig Whiteboard (#1101)** | **#1316 Before/After Comparison** | item_object | **CRITICAL PATH** — see what Marcus changed |
| Comprehend Report (#1005) | Call Recordings (#1002) | #1317 PII Incident Report | item_object | Full PII breach scope for legal |
| Error Logs (#1006) | Timeline Whiteboard (#302) | #1318 Complete Incident Timeline | item_object | Fill in the whiteboard gaps |
| Error Logs (#1006) | Satellite Console (#1201) | #1302 Error Logs in Satellite | **penalty** | Console rejects diagnostics — -5 min penalty, returns #1006 |

> **Note:** No default penalty for unknown combos. Only the explicitly listed penalty combo (#1302) triggers a penalty. Cards #1313, #1314, #1316 are item type (red), not event type. Cards #1311, #1312, #1315, #1317, #1318 are event type (yellow).

**Combo result cards:**

| ID | Type | Title | Key Detail |
|----|------|-------|------------|
| 1311 | event | Detailed Failure Map | Error logs + dashboard reveals exact cascade with Friday origin |
| 1312 | event | Optimized Pipeline Plan | Marcus had Claude on Q&A (overkill), Titan on reasoning (underpowered). Correct mapping saves 60% |
| 1313 | **item** | Marcus Sabotage Video | CCTV shows Marcus force-push then yank cables. "Good luck." Deliberate sabotage. Consumes #602. |
| 1314 | **item** | Rollback Plan | 5-step rollback: restore guardrails → revert Bedrock → reconnect cables → rebuild NOVA → restore Prompt Flow. Consumes #703, #603. |
| 1315 | event | Security Audit Report | All 5 IDS alerts mapped to guardrail rules. Full audit: PASS. |
| 1316 | **item** | Before/After Comparison | Diana's clean design vs Marcus's gutted version. Consumes #1101. |
| 1317 | event | PII Incident Report | 3 customers exposed (SSN, email, credit card). Consumes #1005, #1002. |
| 1318 | event | Complete Incident Timeline | Whiteboard gaps filled: Fri 5:48–5:49 PM, Sat 2 AM first 503, Sun error rate climbs. |

---

## Penalties

| ID | Trigger | Title | Effect |
|----|---------|-------|--------|
| 1301 | Wrong combo: USB (#107) + War Room Dashboard (#303) | USB in War Room Display | -300 seconds (5 min), returns USB #107 |
| 1302 | Wrong combo: Error Logs (#1006) + Satellite Console (#1201) | Error Logs in Satellite | -300 seconds (5 min), returns Error Logs #1006 |

> **Note:** No default penalty for unknown combos. Only these two explicitly defined penalty combos exist.

---


## Card Index

| ID | Type | Color | Title | Room |
|----|------|-------|-------|------|
| **Locations** | | | | |
| 100 | location | 🟢 | Reception | reception |
| 200 | location | 🟢 | Your Desk | your-desk |
| 300 | location | 🟢 | War Room | war-room |
| 400 | location | 🟢 | Server Closet | server-closet |
| 500 | location | 🟢 | Data Team Office | data-team |
| 600 | location | 🟢 | Security Office | security-office |
| 700 | location | 🟢 | DevOps Bullpen | devops-bullpen |
| 800 | location | 🟢 | Executive Floor | executive-floor |
| 900 | location | 🟢 | Break Room | break-room |
| 1000 | location | 🟢 | Call Center | call-center |
| 1100 | location | 🟢 | Archive Basement | archive-basement |
| 1200 | location | 🟢 | Rooftop | rooftop |
| **Objects** | | | | |
| 202 | object | 🔵 | Task Sticky Notes | your-desk |
| 203 | object | 🔵 | Warning Sticky Notes | your-desk |
| 204 | object | 🔵 | Password Sticky Notes | your-desk |
| 302 | object | 🔵 | Incident Timeline Whiteboard | war-room |
| 303 | object | 🔵 | War Room Dashboard | war-room |
| 401 | object | 🔵 | Patch Panel | server-closet |
| 404 | object | 🔵 | Server Rack Labels | server-closet |
| 502 | object | 🔵 | Model Selection Whiteboard | data-team |
| 602 | object | 🔵 | CCTV Footage | security-office |
| 603 | object | 🔵 | IDS Alert Log | security-office |
| 702 | object | 🔵 | Pipeline Diagram | devops-bullpen |
| 703 | object | 🔵 | Deployment Logs | devops-bullpen |
| 802 | object | 🔵 | Locked Filing Cabinet | executive-floor |
| 902 | object | 🔵 | Overheard Conversation | break-room |
| 904 | object | 🔵 | Office Bulletin Board | break-room |
| 1002 | object | 🔵 | Call Recordings | call-center |
| 1101 | object | 🔵 | Original Architecture Whiteboard | archive-basement |
| 1104 | object | 🔵 | Legacy Server Rack | archive-basement |
| 1201 | object | 🔵 | Satellite Console | rooftop |
| **Items** | | | | |
| 104 | item | 🔴 | Temp Badge | reception |
| 107 | item | 🔴 | USB Drive (NOVA Backup) — label: NOVA-CORE-v3.1-PROD | reception |
| 503 | item | 🔴 | Model Benchmarks | data-team |
| 506 | item | 🔴 | Model Config | data-team |
| 606 | item | 🔴 | Guardrails Config | security-office |
| 613 | item | 🔴 | Executive Badge | security-office |
| 709 | item | 🔴 | Root Cause Report | devops-bullpen |
| 806 | item | 🔴 | Satellite Key | executive-floor |
| 807 | item | 🔴 | Prompt Flow Config | executive-floor |
| 905 | item | 🔴 | Cat Treats | break-room |
| 1005 | item | 🔴 | Comprehend Report | call-center |
| 1006 | item | 🔴 | Error Logs | your-desk |
| 1103 | item | 🔴 | Architecture Doc | archive-basement |
| 1203 | item | 🔴 | Prompt Flow Restored | rooftop |
| 1209 | item | 🔴 | NOVA Rebuilt | rooftop |
| 1313 | item | 🔴 | Marcus Sabotage Video | security-office |
| 1314 | item | 🔴 | Rollback Plan | devops-bullpen |
| 1316 | item | 🔴 | Before/After Comparison | archive-basement |
| **Events** | | | | |
| 305 | event | 🟡 | Incident Triaged | war-room |
| 403 | event | 🟡 | Cables Reconnected | server-closet |
| 505 | event | 🟡 | Correct Model Selected | data-team |
| 605 | event | 🟡 | Guardrails Restored | security-office |
| 706 | event | 🟡 | Architecture Quiz Passed | devops-bullpen |
| 708 | event | 🟡 | Root Cause Found | devops-bullpen |
| 804 | event | 🟡 | Cabinet Opened | executive-floor |
| 1004 | event | 🟡 | Sentiment Analyzed | call-center |
| 1205 | event | 🟡 | Systems Restored (ENDING) | rooftop |
| 1310 | event | 🟡 | NOVA Backup Preview | your-desk |
| 1311 | event | 🟡 | Detailed Failure Map | war-room |
| 1312 | event | 🟡 | Optimized Pipeline Plan | devops-bullpen |
| 1315 | event | 🟡 | Security Audit Report | security-office |
| 1317 | event | 🟡 | PII Incident Report | call-center |
| 1318 | event | 🟡 | Complete Incident Timeline | war-room |
| **Lore / Insight Cards** | | | | |
| 106 | lore | 🟣 | NovaCorp Welcome Video | reception |
| 208 | lore | 🟣 | Insight: The Resignation | your-desk |
| 306 | lore | 🟣 | Insight: Incident Response | war-room |
| 405 | lore | 🟣 | Insight: Physical Infrastructure | server-closet |
| 508 | lore | 🟣 | Insight: Foundation Models | data-team |
| 608 | lore | 🟣 | Insight: Bedrock Guardrails | security-office |
| 710 | lore | 🟣 | Insight: DevOps Agent & Kiro | devops-bullpen |
| 808 | lore | 🟣 | Insight: NovaCorp Founding | executive-floor |
| 903 | lore | 🟣 | Insight: AI Industry News | break-room |
| 1008 | lore | 🟣 | Insight: Lex & Comprehend | call-center |
| 1108 | lore | 🟣 | Insight: Diana's Vision | archive-basement |
| 1208 | lore | 🟣 | Insight: The Cloud Is Real | rooftop |
| **Penalties** | | | | |
| 1301 | penalty | ⚫ | USB in War Room Display | war-room |
| 1302 | penalty | ⚫ | Error Logs in Satellite | rooftop |
| **Tools / NPCs** | | | | |
| 101 | tool | 🟠 | Maya (Receptionist) | reception |
| 103 | tool | 🟠 | Pixel (Office Cat) | reception |
| 201 | tool | 🟠 | Laptop (Slack/Email) | your-desk |
| 206 | tool | 🟠 | Quick Dashboard | your-desk |
| 301 | tool | 🟠 | Jordan (VP Engineering) | war-room |
| 501 | tool | 🟠 | Dr. Priya (Data Scientist) | data-team |
| 507 | tool | 🟠 | Q Developer (-1 min) | data-team |
| 601 | tool | 🟠 | Frank (Security Lead) | security-office |
| 607 | tool | 🟠 | AWS Security Agent (-2 min) | security-office |
| 701 | tool | 🟠 | Sam (DevOps Engineer) | devops-bullpen |
| 705 | tool | 🟠 | AWS DevOps Agent (-1 min) | devops-bullpen |
| 801 | tool | 🟠 | The Fox (CTO's AI) | executive-floor |
| 901 | tool | 🟠 | Coffee Machine | break-room |
| 1001 | tool | 🟠 | Angry Customer | call-center |
| 1007 | tool | 🟠 | Doc Extractor / Textract (-1 min) | call-center |
| 1105 | tool | 🟠 | Knowledge Base / RAG (-2 min) | archive-basement |
| 1207 | tool | 🟠 | NOVA (Rebuilt) | rooftop |

**Total: 12 locations + 20 objects + 18 items + 15 events + 12 lore + 2 penalties + 17 tools/NPCs = 96 cards**

---


## Tools

| ID | UI | Room | Cost | Description |
|----|-----|------|------|-------------|
| npc-maya | npc-dialog | Reception | Free | Maya — receptionist. Gives badge, hints vending machine aisle B slot 3. |
| npc-cat | npc-dialog | Reception | Free | Pixel — office cat. Gives USB Drive when fed treats (#905). |
| tool-laptop | npc-dialog | Your Desk | Free | Slack/email — shows messages. State_line for USB plug-in shows NOVA config. |
| tool-dashboard | log-lock | Your Desk | Free | Amazon Quick Suite dashboard — identify 5 critical services → Error Logs. |
| npc-jordan | npc-dialog | War Room | Free | Jordan — VP Eng. Pressure NPC, demands updates. |
| npc-priya | npc-dialog | Data Team | Free | Dr. Priya — explains models, KB, Guardrails. Needs error logs + warning stickies. Combo hint for Before/After. |
| tool-qdeveloper | npc-dialog | Data Team | -1 min | Q Developer — analyzes code, explains Kiro. **Gives direct model matching answer.** |
| npc-frank | npc-dialog | Security Office | Free | Frank — security info. Gives exec badge after guardrails restored. Combo hints for #1313, #1315. |
| tool-securityscan | npc-dialog | Security Office | -2 min | Security Agent — pen testing. **Gives direct guardrails puzzle answer.** |
| pillar-devops | pillar-lock | DevOps Bullpen | Free | Well-Architected quiz — gates Sam NPC. |
| npc-sam | npc-dialog | DevOps Bullpen | Free | Sam — DevOps eng. Pipelines, server closet. Combo hint for Rollback Plan (#1314). |
| tool-devopsagent | npc-dialog | DevOps Bullpen | -1 min | DevOps Agent — incident correlation. **Gives direct triage order answer.** |
| npc-fox | npc-dialog | Executive Floor | Free | The Fox — CTO's AI. Riddles, filing cabinet hint, fix order. |
| npc-coffee | npc-dialog | Break Room | Free | Coffee Machine — fortune-cookie hints about fix order. |
| npc-customer | npc-dialog | Call Center | Free | Angry Customer — complaints reveal cascade + PII exposure. Combo hint for #1317. |
| tool-docextractor | npc-dialog | Call Center | -1 min | Textract — document OCR. **Gives direct sentiment puzzle answer.** |
| tool-knowledgebase | npc-dialog | Archive Basement | -2 min | Bedrock KB — RAG over 847 docs. **Gives direct Prompt Flow path answer.** |
| npc-nova | npc-dialog | Rooftop | Free | NOVA — rebuilt AI. Confirms service chain order. Reveals NOVA Rebuilt (#1209). |

**Agent Direct Answers Summary:**
- DevOps Agent → triage order (sort-triage puzzle)
- Security Agent → guardrails config (sg-guardrails puzzle)
- Q Developer → model matching (match-models puzzle)
- Doc Extractor → sentiment calls (log-sentiment puzzle)
- Knowledge Base → prompt flow path (path-promptflow puzzle)

---

## Timed Events

| Time Remaining | Event ID | Type | Event |
|---|---|---|---|
| 55:00 | TE-01 | atmosphere | Laptop Slack: "#general: @channel Is anyone looking at this? Customers are complaining." |
| 45:00 | TE-02 | atmosphere | Jordan: "I need an update in 15 minutes. The board wants to know if we have a root cause." (voice: jordan) |
| 30:00 | TE-03 | **lockout** | **MID-EVENT:** Jordan's board call. Maya goes to lunch (unavailable rest of game). Frank locks Security Office (reopens at 25:00). Mid-event narrative plays. (voice: jordan, nova) |
| 25:00 | TE-04 | unlock | Frank's office reopens. "#security: Frank's back." |
| 20:00 | TE-05 | atmosphere | Customer complaints spike. Call center queue 47 min. Angry Customer calls main line if not visited. |
| 10:00 | TE-06 | alarm | Jordan: "If this isn't fixed in 10 minutes, we're calling AWS Enterprise Support. $15,000 call." (voice: jordan) |
| 5:00 | TE-07 | atmosphere | Emergency amber lighting. NOVA garbled Slack if partially rebuilt; satellite uplink message if not. (voice: nova) |

**Triggered Events:**

| Trigger | Result | Description |
|---------|--------|-------------|
| puzzle_solved: tool-dashboard | #1006 Error Logs | Critical services identified |
| puzzle_solved: sort-triage | #305 Incident Triaged | Jordan acknowledges |
| puzzle_solved: wire-cables | #403 Cables Reconnected | Physical layer restored |
| puzzle_solved: match-models | #505 → reveals #506 Model Config | Priya updates Bedrock config |
| puzzle_solved: sg-guardrails | #605 → reveals #606 Guardrails Config | Frank nods, awards #613 Exec Badge |
| puzzle_solved: timeline-rootcause | #708 → reveals #709 Root Cause Report | Triple sabotage confirmed |
| puzzle_solved: policy-cabinet | #804 Cabinet Opened | NOVA config folder + satellite key |
| puzzle_solved: key-ctofiles | #806 Satellite Key + #807 Prompt Flow Config | CTO files decrypted |
| puzzle_solved: log-sentiment | #1004 → reveals #1005 Comprehend Report | 3 PII exposure calls identified |
| puzzle_solved: terminal-archive | #1103 Architecture Doc | Diana's original design retrieved |
| puzzle_solved: path-promptflow | #1203 Prompt Flow Restored | Customer routing fixed |
| has_cards: #107+#1103+#506 | #1209 NOVA Rebuilt (at rooftop) | NOVA systems initialize |
| puzzle_solved: chain-final | #1205 Systems Restored | **ENDING** — all services green |

---

## Debrief

> **What you just did — in AWS terms:**
>
> 🔹 **Amazon Bedrock** — The foundation of NovaCorp's AI stack. A single API to access foundation models from Anthropic (Claude), Amazon (Titan), Meta (Llama), and Mistral. You learned that model selection matters — use the right model for the right task.
>
> 🔹 **Bedrock Guardrails** — Content filtering, PII detection, topic restrictions. Marcus disabled them; you restored them. Guardrails sit between users and models, filtering both input and output. They're not optional in production.
>
> 🔹 **Bedrock Knowledge Bases** — RAG (Retrieval Augmented Generation). Connect your company's documents to a model so it answers using YOUR data instead of hallucinating. The Knowledge Base in the basement gave you the complete system overview.
>
> 🔹 **Bedrock Agents** — NOVA was a Bedrock Agent: an autonomous AI that uses tools, queries knowledge bases, and takes actions. You rebuilt NOVA by providing the right config, model, and knowledge base connection.
>
> 🔹 **Bedrock Prompt Flows** — Visual workflow builder for multi-step AI pipelines. Customer input → sentiment analysis → classification → routing. You restored the flow that routes queries to the right handler.
>
> 🔹 **Amazon Q Business** — Enterprise AI assistant that connects to company data sources. Diana's vision for NOVA was essentially Q Business — an AI that knows your company.
>
> 🔹 **Amazon Q Developer** — AI coding assistant. It analyzed Marcus's bad commit and suggested fixes. In real life, it reviews code, generates tests, and explains AWS configurations.
>
> 🔹 **Kiro** — Agentic IDE with Specs (requirements), Steering (AI guidance), and Hooks (automated workflows). A pre-commit hook in Kiro would have caught Marcus's guardrails deletion before it reached production.
>
> 🔹 **AWS Security Agent** — Autonomous penetration testing. It found the Jenkins vulnerability, the overprivileged NOVA service account, and the missing Bedrock IAM policy.
>
> 🔹 **AWS DevOps Agent** — Incident response automation. It correlated CloudWatch alarms, identified the root cause chain, and generated a runbook. Setting it up before an incident saves critical time during one.
>
> 🔹 **Amazon Lex** — Conversational chatbot service. NovaCorp's customer-facing bot. It broke when NOVA (its routing brain) went offline.
>
> 🔹 **Amazon Comprehend** — NLP service for sentiment analysis, entity detection, and PII identification. You used it to identify which customer calls involved data exposure.
>
> 🔹 **Amazon Transcribe** — Speech-to-text. Converts call recordings to text for analysis. Part of the customer interaction pipeline: Voice → Transcribe → Comprehend → Lex.
>
> 🔹 **Amazon Textract** — Document OCR. Extracts text, tables, and forms from scanned documents. You used it to parse the architecture doc from the basement.
>
> 🔹 **Amazon Quick Suite** — Data visualization. The dashboard that showed you which services were critical. Real-time monitoring is your first line of defense.
>
> *You didn't just fix an outage. You learned how 15 AWS AI services work together as a system — and why architecture, guardrails, and respect for dependencies matter more than any individual service.*

---

## Scoring

| Factor | Points |
|--------|--------|
| Systems restored (completion) | 50 base |
| Time remaining | +1 per minute left |
| Hints used | -3 per hint |
| Wrong combination penalty | -5 per penalty triggered |
| Insight cards found (12 available) | +3 each (max +36) |
| All 12 insights found | +5 bonus |

**Lore IDs:** 106, 208, 306, 405, 508, 608, 710, 808, 903, 1008, 1108, 1208

| Stars | Score |
|-------|-------|
| ⭐⭐⭐⭐⭐ | 95+ |
| ⭐⭐⭐⭐ | 80–94 |
| ⭐⭐⭐ | 65–79 |
| ⭐⭐ | 50–64 |
| ⭐ | 0+ (completed) |

> **Note:** No default penalty for unknown combos. Only explicitly defined penalty combos (#1301, #1302) deduct points.

---

## Change Log (from original blueprint)

1. **Badge Reader (#102) removed** from Reception — no longer exists
2. **Basement Access Note (#205) removed** — replaced with keypad-basement puzzle (code 7359 from server rack stickers A=7,B=3,C=5,D=9)
3. **Cat Treats (#905) gated** behind rotation-lock vending machine (aisle B, slot 3 — Maya hints in her dialog)
4. **Sam gated** behind pillar-lock Well-Architected quiz (#706) — must pass before talking
5. **Filing cabinet** changed from policy-lock to keypad-lock (code 47382019 = last 4 of phone 4738 + founding year 2019)
6. **CTO file decrypt** changed from key-lock to sort-lock (NOVA, CORE, v3.1, PROD)
7. **USB label** changed to NOVA-CORE-v3.1-PROD
8. **Prompt Flow puzzle** expanded to 11 nodes with 4 decoys (Textract, Translate, Lex, KB)
9. **Combos on critical path:** Marcus Video (#1313) needed for NOVA NPC, Rollback Plan (#1314) for final chain, Before/After (#1316) for Prompt Flow
10. **Cards 1203, 1209, 1313, 1314, 1316** changed from event to item type
11. **Agents give direct puzzle answers:** DevOps→triage, Security→guardrails, Q Dev→models, Doc Extractor→sentiment, KB→prompt flow
12. **NPC state_lines added** for combo hints: Sam (Rollback Plan), Frank (Marcus Video, Security Audit), Priya (Before/After), Customer (PII Report)
13. **Maya hints** about vending machine aisle B slot 3 for cat treats
14. **Laptop** changed from terminal-lock to npc-dialog with USB plug-in state_line
15. **Dashboard (#206) reveals Error Logs (#1006)** directly
16. **Security Office entry** requires Error Logs (#1006) not Frank quiz
17. **Exec Badge** requires Guardrails Config (#606), consumes Temp Badge (#104)
18. **Various consume chains** fixed across discoveries and combos
19. **No default penalty** for unknown combos
20. **Event #708** reveals Root Cause Report #709
21. **Event #505** reveals Model Config #506
22. **Event #605** reveals Guardrails Config #606
23. **Event #1004** reveals Comprehend Report #1005
24. **NOVA NPC** card (#1207) reveals NOVA Rebuilt #1209
