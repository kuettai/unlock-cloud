# Episode 2: Day One

## Overview

| Field | Value |
|---|---|
| Arc | AI Unit |
| Duration | 60 minutes |
| Players | 2–6 (recommended 4) |
| Difficulty | Tier 2 — Practitioner |
| AWS Concepts | Amazon Bedrock, Bedrock Knowledge Bases, Bedrock Agents, Bedrock Guardrails, Bedrock Prompt Flows, Amazon Q Business, Amazon Q Developer, Amazon Quick Suite, Kiro, AWS Security Agent, AWS DevOps Agent, Amazon Lex, Amazon Comprehend, Amazon Transcribe, Amazon Textract |
| Mechanics | NPC dialog trees, card combination discovery, cross-card observation, log analysis, sort-lock, wire-lock, sg-lock, keypad-lock, rotation-lock, pillar-lock, terminal-lock, path-lock, chain-lock, timeline-lock, time-cost tools, timed events, lore insight fragments |
| Antagonist | The Clock — board meeting ends in 60 minutes; Jordan demands a fix |

---

## Room Layout

```
                    ┌─────────────────── 14TH FLOOR ───────────────────────────┐
                    │                                                          │
                    │  [Reception] ──(badge)──▶ [Your Desk] ◀── HUB           │
                    │       │                     │  │  │  │                   │
                    │    (Maya, Pixel)             │  │  │  └──▶ [Break Room]  │
                    │                              │  │  │          │          │
                    │              ┌────────────────┘  │  │     [Call Center]  │
                    │              │                   │  │                    │
                    │         [War Room]          [Data Team]  [DevOps Bullpen]│
                    │                                          │              │
                    │                                     [Server Closet]     │
                    │                                                          │
                    │  [Security Office] ◀──(error logs)── requires #1006      │
                    │       │                                                  │
                    │    (exec badge)                                          │
                    │       ▼                                                  │
                    └──────────────────────────────────────────────────────────┘

                    ┌── 15TH FLOOR ──┐     ┌── B2 ──────────────┐
                    │                │     │                     │
                    │ [Exec Floor]   │     │ [Archive Basement]  │
                    │      │         │     │                     │
                    │   (sat key)    │     └─────────────────────┘
                    │      ▼         │
                    │  [Rooftop]     │     keypad-basement (7359)
                    │   = EXIT       │     from Your Desk
                    └────────────────┘
```

**12 rooms total:**

| Room | Card | Floor | Gate | AWS Concept |
|------|------|-------|------|-------------|
| Reception | #100 | 14F | Start room | — |
| Your Desk | #200 | 14F | Temp Badge (#104) | Quick Suite dashboard |
| War Room | #300 | 14F | From Your Desk | Incident response |
| Server Closet | #400 | 14F | From DevOps Bullpen | Physical infrastructure |
| Data Team Office | #500 | 14F | From Your Desk | Bedrock models, Knowledge Bases |
| Security Office | #600 | 14F | Error Logs (#1006) | Bedrock Guardrails |
| DevOps Bullpen | #700 | 14F | From Your Desk | CI/CD, DevOps Agent |
| Executive Floor | #800 | 15F | Exec Badge (#613) | CTO files, Prompt Flow |
| Break Room | #900 | 14F | From Your Desk | — |
| Call Center | #1000 | 14F | From Break Room | Lex, Comprehend, Transcribe |
| Archive Basement | #1100 | B2 | Keypad (#200, code 7359) | Original architecture |
| Rooftop | #1200 | Roof | Satellite Key (#806) | Final activation |

---

## Critical Path

```
START
  │
  ▼
[Reception]
  │ npc: Maya → Temp Badge (#104)
  │ npc: Pixel (needs cat treats for USB)
  │
  ▼
[Your Desk]
  │ tool: Laptop (Slack/email context)
  │ discover: Sticky Notes (#202, #203, #204)
  │ puzzle: log-lock (Quick Dashboard) → Error Logs (#1006) → 🟣 Insight: The Resignation
  │
  ├──────────────────────────────────────────────────────────────────────┐
  │                                                                      │
  ▼                                                                      ▼
[War Room]                                                          [Break Room]
  │ npc: Jordan                                                       │ npc: Coffee Machine (hints)
  │ discover: Timeline (#302), Dashboard (#303)                       │ discover: Overheard Convo (#902)
  │ puzzle: sort-lock (triage cascade)                                │ discover: Bulletin Board (#904)
  │   = Incident Triaged (#305) → 🟣 Insight: Incident Response      │ puzzle: rotation-lock (vending B3)
  │                                                                   │   = Cat Treats (#905)
  │                                                                   │       ↓
  │                                                                   │  [Reception] give treats to Pixel
  │                                                                   │   = USB Drive (#107)
  │                                                                   │
  ├──────────────────────────────────────────────────────────────────────┤
  │                                                                      │
  ▼                                                                      ▼
[Data Team]                                                         [DevOps Bullpen]
  │ npc: Dr. Priya (needs #1006 + #203)                               │ puzzle: pillar-lock (Well-Architected)
  │ discover: Model Whiteboard (#502)                                  │   = Architecture Quiz Passed (#706)
  │ discover: Model Benchmarks (#503)                                  │ npc: Sam (needs #706)
  │ puzzle: wire-lock (match models)                                   │ discover: Pipeline (#702), Deploy Logs (#703)
  │   = Model Config (#506) → 🟣 Insight: Foundation Models           │ puzzle: timeline-lock (root cause)
  │                                                                    │   requires #703 + #603
  │                                                                    │   = Root Cause Report (#709)
  │                                                                    │   → 🟣 Insight: DevOps Agent & Kiro
  │                                                                    │
  │                                                                    ▼
  │                                                                [Server Closet]
  │                                                                    │ discover: Patch Panel (#401), Rack Labels (#404)
  │                                                                    │ puzzle: wire-lock (reconnect cables)
  │                                                                    │   requires #1006, consumes #401 + #404
  │                                                                    │   = Cables Reconnected (#403)
  │                                                                    │   → 🟣 Insight: Physical Infrastructure
  │                                                                    │
  ├────────────────────────────────────────────────────────────────────┘
  │
  ▼
[Security Office] — requires Error Logs (#1006)
  │ npc: Frank
  │ discover: CCTV (#602), IDS Alert Log (#603)
  │ puzzle: sg-lock (enable 6 guardrail rules)
  │   = Guardrails Config (#606) + Exec Badge (#613)
  │   → 🟣 Insight: Bedrock Guardrails
  │
  │ combo: Exec Badge + CCTV = Marcus Sabotage Video (#1313)
  │ combo: Root Cause + Deploy Logs = Rollback Plan (#1314)
  │
  ▼
[Executive Floor] — requires Exec Badge (#613)
  │ npc: The Fox
  │ discover: Filing Cabinet (#802), Framed Photo (#808)
  │ puzzle: keypad-lock (47382019) → Cabinet Opened (#804)
  │ puzzle: sort-lock (NOVA/CORE/v3.1/PROD) → Satellite Key (#806) + Prompt Flow Config (#807)
  │   → 🟣 Insight: NovaCorp Founding
  │
  ▼
[Archive Basement] — keypad-lock (7359) from Your Desk
  │ discover: Original Whiteboard (#1101), Legacy Rack (#1104)
  │ puzzle: terminal-lock (search "architecture")
  │   = Architecture Doc (#1103) → 🟣 Insight: Diana's Vision
  │
  │ combo: Arch Doc + Orig Whiteboard = Before/After Comparison (#1316)
  │
  ▼
[Call Center] — from Break Room
  │ npc: Angry Customer
  │ discover: Call Recordings (#1002)
  │ puzzle: log-lock (sentiment analysis)
  │   requires #1006, consumes #902 + #1002
  │   = Comprehend Report (#1005) → 🟣 Insight: Lex & Comprehend
  │
  ▼
[Rooftop] — requires Satellite Key (#806)
  │ discover: Satellite Console (#1201)
  │ puzzle: path-lock (Prompt Flow routing)
  │   requires #807 + #1103 + #1316
  │   = Prompt Flow Restored (#1203) → 🟣 Insight: The Cloud Is Real
  │
  │ npc: NOVA (rebuilt) — requires #107 + #1103 + #506 + #1313
  │   = NOVA Rebuilt (#1209)
  │
  │ puzzle: chain-lock (service dependency chain)
  │   requires #606 + #506 + #709 + #1314 + #1203 + #1209
  │   = Systems Restored (#1205) → END
  │
  ▼
 END
```

---

## Insight Cards (Lore)

Each insight auto-reveals after completing the related puzzle or discovery — giving players an AWS concept recap at each milestone.

| ID | Title | Triggered By | AWS Concept |
|----|-------|-------------|-------------|
| #106 | NovaCorp Welcome Video | Look at TV in Reception | NovaCorp overview, AWS AI services |
| #208 | Insight: The Resignation | Quick Dashboard solved (via #1006) | Marcus's resignation, half-migrated AI stack |
| #306 | Insight: Incident Response | Triage puzzle solved | DevOps Agent, incident response protocol |
| #405 | Insight: Physical Infrastructure | Cables reconnected | Bedrock Agents fallback, dependency chains |
| #508 | Insight: Foundation Models | Model selection solved (via #506) | Bedrock model selection, cost-performance |
| #608 | Insight: Bedrock Guardrails | Guardrails puzzle solved (via #606) | Guardrails: content filter, PII, topics |
| #710 | Insight: DevOps Agent & Kiro | Root cause found (via #709) | DevOps Agent + Kiro IDE |
| #808 | Insight: NovaCorp Founding | CTO files decrypted (via #807) | Amazon Q Business, company history |
| #903 | Insight: AI Industry News | Read newspaper in Break Room | Agentic AI, Bedrock ecosystem |
| #1008 | Insight: Lex & Comprehend | Sentiment analysis solved (via #1005) | Lex + Comprehend + Transcribe pipeline |
| #1108 | Insight: Diana's Vision | Architecture Doc found (via #1103) | Bedrock composability, guardrails-first |
| #1208 | Insight: The Cloud Is Real | Prompt Flow restored (via #1203) | Real-world AWS AI services |

---

## Card Index (95 cards total)

### Locations — 🟢 Green (12)

| ID | Title | Room |
|----|-------|------|
| 100 | Reception | reception |
| 200 | Your Desk | your-desk |
| 300 | War Room | war-room |
| 400 | Server Closet | server-closet |
| 500 | Data Team Office | data-team |
| 600 | Security Office | security-office |
| 700 | DevOps Bullpen | devops-bullpen |
| 800 | Executive Floor | executive-floor |
| 900 | Break Room | break-room |
| 1000 | Call Center | call-center |
| 1100 | Archive Basement | archive-basement |
| 1200 | Rooftop | rooftop |

### Objects — 🔵 Blue (19)

| ID | Title | Room |
|----|-------|------|
| 202 | Task Sticky Notes | your-desk |
| 203 | Warning Sticky Notes | your-desk |
| 204 | Password Sticky Notes | your-desk |
| 302 | Incident Timeline Whiteboard | war-room |
| 303 | War Room Dashboard | war-room |
| 401 | Patch Panel | server-closet |
| 404 | Server Rack Labels | server-closet |
| 502 | Model Selection Whiteboard | data-team |
| 602 | CCTV Footage | security-office |
| 603 | IDS Alert Log | security-office |
| 702 | Pipeline Diagram | devops-bullpen |
| 703 | Deployment Logs | devops-bullpen |
| 802 | Locked Filing Cabinet | executive-floor |
| 902 | Overheard Conversation | break-room |
| 904 | Office Bulletin Board | break-room |
| 1002 | Call Recordings | call-center |
| 1101 | Original Architecture Whiteboard | archive-basement |
| 1104 | Legacy Server Rack | archive-basement |
| 1201 | Satellite Console | rooftop |

### Items — 🔴 Red (18)

| ID | Title | Room |
|----|-------|------|
| 104 | Temp Badge | reception |
| 107 | USB Drive (NOVA Backup) | reception |
| 503 | Model Benchmarks | data-team |
| 506 | Model Config | data-team |
| 606 | Guardrails Config | security-office |
| 613 | Executive Badge | security-office |
| 709 | Root Cause Report | devops-bullpen |
| 806 | Satellite Key | executive-floor |
| 807 | Prompt Flow Config | executive-floor |
| 905 | Cat Treats | break-room |
| 1005 | Comprehend Report | call-center |
| 1006 | Error Logs | your-desk |
| 1103 | Architecture Doc | archive-basement |
| 1203 | Prompt Flow Restored | rooftop |
| 1209 | NOVA Rebuilt | rooftop |
| 1313 | Marcus Sabotage Video | security-office |
| 1314 | Rollback Plan | devops-bullpen |
| 1316 | Before/After Comparison | archive-basement |

### Events — 🟡 Yellow (15)

| ID | Title | Room |
|----|-------|------|
| 305 | Incident Triaged | war-room |
| 403 | Cables Reconnected | server-closet |
| 505 | Correct Model Selected | data-team |
| 605 | Guardrails Restored | security-office |
| 706 | Architecture Quiz Passed | devops-bullpen |
| 708 | Root Cause Found | devops-bullpen |
| 804 | Cabinet Opened | executive-floor |
| 1004 | Sentiment Analyzed | call-center |
| 1205 | Systems Restored | rooftop |
| 1310 | NOVA Backup Preview | your-desk |
| 1311 | Detailed Failure Map | war-room |
| 1312 | Optimized Pipeline Plan | devops-bullpen |
| 1315 | Security Audit Report | security-office |
| 1317 | PII Incident Report | call-center |
| 1318 | Complete Incident Timeline | war-room |

### Lore — 🟣 Purple (12)

| ID | Title | Room |
|----|-------|------|
| 106 | NovaCorp Welcome Video | reception |
| 208 | Insight: The Resignation | your-desk |
| 306 | Insight: Incident Response | war-room |
| 405 | Insight: Physical Infrastructure | server-closet |
| 508 | Insight: Foundation Models | data-team |
| 608 | Insight: Bedrock Guardrails | security-office |
| 710 | Insight: DevOps Agent & Kiro | devops-bullpen |
| 808 | Insight: NovaCorp Founding | executive-floor |
| 903 | Insight: AI Industry News | break-room |
| 1008 | Insight: Lex & Comprehend | call-center |
| 1108 | Insight: Diana's Vision | archive-basement |
| 1208 | Insight: The Cloud Is Real | rooftop |

### Tools — 🟠 Orange (17)

| ID | Title | Room | Cost |
|----|-------|------|------|
| 101 | Maya (Receptionist) | reception | free |
| 103 | Pixel (Office Cat) | reception | free |
| 201 | Laptop (Slack/Email) | your-desk | free |
| 206 | Quick Dashboard | your-desk | free |
| 301 | Jordan (VP Engineering) | war-room | free |
| 501 | Dr. Priya (Data Scientist) | data-team | free |
| 507 | Q Developer | data-team | -1 min |
| 601 | Frank (Security Lead) | security-office | free |
| 607 | AWS Security Agent | security-office | -2 min |
| 701 | Sam (DevOps Engineer) | devops-bullpen | free |
| 705 | AWS DevOps Agent | devops-bullpen | -1 min |
| 801 | The Fox (CTO's AI) | executive-floor | free |
| 901 | Coffee Machine | break-room | free |
| 1001 | Angry Customer | call-center | free |
| 1007 | Doc Extractor / Textract | call-center | -1 min |
| 1105 | Knowledge Base / RAG | archive-basement | -2 min |
| 1207 | NOVA (Rebuilt) | rooftop | free |

### Penalties — ⚫ Black (2)

| ID | Title | Room | Penalty |
|----|-------|------|---------|
| 1301 | USB in War Room Display | war-room | -5 min |
| 1302 | Error Logs in Satellite | rooftop | -5 min |

---

## Puzzles

| ID | Type | Room | UI | Answer |
|----|------|------|----|--------|
| npc-maya | tool | Reception | npc-dialog | Dialog tree → reveals Temp Badge (#104) |
| npc-cat | tool | Reception | npc-dialog | Dialog tree (needs treats for USB) |
| tool-laptop | tool | Your Desk | npc-dialog | Slack/email context, USB preview |
| tool-dashboard | log_lock | Your Desk | log-lock | Select 5 CRITICAL services (Bedrock, NOVA, Lex, Guardrails, Transcribe) |
| keypad-basement | keypad_lock | Your Desk | keypad-lock | `7359` |
| npc-jordan | tool | War Room | npc-dialog | Dialog tree — incident context |
| sort-triage | sort_lock | War Room | sort-lock | Guardrails → Unfiltered → Bedrock 503 → NOVA → Lex → Transcribe |
| wire-cables | wire_lock | Server Closet | wire-lock | BEDROCK-EP→AI-MODEL, NOVA-CORE→ASSISTANT, LEX-RT→CHAT |
| npc-priya | tool | Data Team | npc-dialog | Dialog tree — model/KB/guardrails context |
| match-models | wire_lock | Data Team | wire-lock | NOVA→Claude, Lex→Titan, Code→Q Developer, Sentiment→Comprehend |
| tool-qdeveloper | tool | Data Team | npc-dialog | AI coding assistant (-1 min) |
| npc-frank | tool | Security Office | npc-dialog | Dialog tree — security quiz gates room |
| sg-guardrails | sg_lock | Security Office | sg-lock | Enable all 6 rules (Content, PII, Topic, Injection, Word, Logging) |
| tool-securityscan | tool | Security Office | npc-dialog | Pen testing (-2 min) |
| pillar-devops | pillar_lock | DevOps Bullpen | pillar-lock | Guardrails→Security, Multi-AZ→Reliability, Titan→Cost, Cache→Perf, Agent→OpEx |
| npc-sam | tool | DevOps Bullpen | npc-dialog | Dialog tree — pipeline/rollback context |
| timeline-rootcause | timeline_lock | DevOps Bullpen | timeline-lock | a→b→c→d→e→f→g→h (Fri deploy → weekend → Mon cascade) |
| tool-devopsagent | tool | DevOps Bullpen | npc-dialog | Incident automation (-1 min) |
| npc-fox | tool | Executive Floor | npc-dialog | Dialog tree — riddles, cabinet hint |
| policy-cabinet | keypad_lock | Executive Floor | keypad-lock | `47382019` (phone last 4 + founding year) |
| key-ctofiles | sort_lock | Executive Floor | sort-lock | NOVA → CORE → v3.1 → PROD |
| npc-coffee | tool | Break Room | npc-dialog | Fortune-cookie hints about fix order |
| rotation-vending | rotation_lock | Break Room | rotation-lock | Dial 1: B (idx 1), Dial 2: 3 (idx 2) |
| npc-customer | tool | Call Center | npc-dialog | Dialog tree — PII exposure clues |
| log-sentiment | log_lock | Call Center | log-lock | Select calls 1 (SSN), 5 (email), 6 (credit card) |
| tool-docextractor | tool | Call Center | npc-dialog | Textract OCR (-1 min) |
| terminal-archive | terminal_lock | Archive Basement | terminal-lock | `architecture` |
| tool-knowledgebase | tool | Archive Basement | npc-dialog | RAG over NovaCorp docs (-2 min) |
| path-promptflow | path_lock | Rooftop | path-lock | Voice→Transcribe→Comprehend→Guardrails→Bedrock→NOVA→Response |
| npc-nova | tool | Rooftop | npc-dialog | Dialog tree — confirms service chain order |
| chain-final | chain_lock | Rooftop | chain-lock | Guardrails→Bedrock→KB→NOVA→PromptFlow→Lex+Comp→Transcribe+Text→Uplink |

---

## Combinations

| Card A | Card B | Result | Type |
|--------|--------|--------|------|
| #1006 Error Logs | #303 War Room Dashboard | #1311 Detailed Failure Map | 🟡 event |
| #503 Model Benchmarks | #702 Pipeline Diagram | #1312 Optimized Pipeline Plan | 🟡 event |
| #613 Exec Badge | #602 CCTV Footage | #1313 Marcus Sabotage Video | 🔴 item ★ |
| #709 Root Cause Report | #703 Deployment Logs | #1314 Rollback Plan | 🔴 item ★ |
| #606 Guardrails Config | #603 IDS Alert Log | #1315 Security Audit Report | 🟡 event |
| #1103 Architecture Doc | #1101 Orig Whiteboard | #1316 Before/After Comparison | 🔴 item ★ |
| #1005 Comprehend Report | #1002 Call Recordings | #1317 PII Incident Report | 🟡 event |
| #1006 Error Logs | #302 Timeline Whiteboard | #1318 Complete Incident Timeline | 🟡 event |
| #1006 Error Logs | #1201 Satellite Console | #1302 Penalty (Error Logs in Satellite) | ❌ penalty |

★ = Required on critical path (needed for final chain-lock puzzle)

---

## Timed Events

| Time Remaining | Event | Type |
|---|---|---|
| 55:00 | Slack: "@channel Is anyone looking at this? Customers are complaining." | atmosphere |
| 45:00 | Jordan: "I need an update in 15 minutes. The board wants a root cause." | atmosphere |
| 30:00 | **MID-EVENT:** Jordan's board call begins. Maya goes to lunch (permanent). Frank locks Security Office for 5 min. "Half the team just left for lunch." NOVA sends garbled message. | lockout |
| 25:00 | Frank's Security Office reopens. "Frank's back. Says he'll help if you have something concrete." | unlock |
| 20:00 | Customer complaints spike. Call queue: 47 minutes. | atmosphere |
| 10:00 | Jordan: "If this isn't fixed in 10 minutes, we're calling AWS Enterprise Support. That's a $15,000 call." | alarm |
| 5:00 | Emergency amber lighting. NOVA sends garbled Slack if partially rebuilt. | atmosphere |

---

## Scoring

| Factor | Points |
|--------|--------|
| Escaped (systems restored) | 50 base |
| Time remaining | +1 per minute left |
| Hints used | -3 per hint |
| Wrong combinations | -5 per penalty |
| Lore insights (12 standard) | +3 each |
| All 12 lore found | +5 bonus |

**Max possible:** 50 (base) + 60 (time) + 36 (12 lore × 3) + 5 (all lore) = **151**

| Stars | Score |
|-------|-------|
| ⭐⭐⭐⭐⭐ | 95+ |
| ⭐⭐⭐⭐ | 80–94 |
| ⭐⭐⭐ | 65–79 |
| ⭐⭐ | 50–64 |
| ⭐ | Completed |
