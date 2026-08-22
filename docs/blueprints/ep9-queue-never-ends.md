# Episode 9 — The Queue That Never Ends

## 1. Meta

| Field | Value |
|-------|-------|
| Episode | 9 |
| Title | The Queue That Never Ends |
| Arc | standalone |
| Category | aws |
| Duration | 15 minutes |
| Players | 1–6 (recommended 2–3) |
| Difficulty | Tier 1 — Event Session |
| AWS Topics | Amazon Connect (contact flows, queues, routing profiles, real-time metrics, ACW) |
| Setting | Ministry of Better Workplaces — citizen services contact centre |
| Tone | Light comedy, relatable government office setting, fun-first with learning woven in |
| Event | Ministry of Manpower |

**Premise:** It's Monday morning at the Ministry of Better Workplaces. The contact centre's phone system crashed overnight and citizens are flooding in with calls. You're the new operations team lead on your first day — triage the chaos, rebuild the contact flow, read the dashboards, assign agents properly, and prove you can handle a live call before the Director's walkthrough at noon.

**Learning Objectives:**
1. Understand how queues categorise incoming requests
2. Know how contact flows route calls step by step
3. Read real-time metrics to identify bottlenecks
4. Match agent skills to routing profiles
5. Complete After Contact Work (ACW) properly — disposition, summary, follow-up

---

## 2. Narrative

### Voices

| Voice ID | Role |
|----------|------|
| Joanna | System — the Contact Centre IVR, calm and professional |
| Matthew | Director Tan — stern but fair, wants results |
| Salli | Mei — veteran agent, sarcastic, secretly helpful |

### Intro Segments

| Voice | Line | Pause |
|-------|------|-------|
| system | Welcome to the Ministry of Better Workplaces Contact Centre. You are now logged in as Operations Lead. | 800 |
| system | Current status: critical. All queues overloaded. Average wait time: forty-seven minutes. Citizens are... unhappy. | 1000 |
| mei | Oh good, the new lead's here. Don't worry — it's only been like this since six AM. The old system died. Something about an expired certificate. Classic Monday. | 1000 |
| director | This is Director Tan. I'm doing a walkthrough at noon. I expect the centre to be operational. No excuses. Fix it. | 800 |
| system | You have fifteen minutes. Good luck, Operations Lead. | 600 |

### Mid-Event Segments (trigger at 7:30 remaining)

| Voice | Line | Pause |
|-------|------|-------|
| system | Seven minutes remaining. Queue backlog: decreasing. Director walkthrough: imminent. | 800 |
| mei | You're actually not bad at this. Don't let it go to your head. | 600 |
| director | I can see the dashboards from my office. Keep it up. | 600 |

### Ending — Success

| Voice | Line | Pause |
|-------|------|-------|
| system | All queues operational. Average wait time: under two minutes. After Contact Work: logged correctly. | 800 |
| system | Contact centre status upgraded to: green. | 1000 |
| mei | Not bad for a first day. You actually filled in the case notes properly. Most people skip that part and wonder why follow-ups never happen. | 800 |
| director | Impressive. The dashboards are green, the agents are routing correctly, and you even handled a live call. Welcome to the team. | 800 |
| system | Congratulations, Operations Lead. You've restored service to the citizens of Better Workplaces. | 600 |

### Ending — Failure (time expired)

| Voice | Line | Pause |
|-------|------|-------|
| system | Time expired. Queue backlog remains critical. Director walkthrough: in progress. | 800 |
| director | I see. We'll... reconvene tomorrow. With a plan this time. | 800 |
| mei | Hey. First days are rough. Come back tomorrow — I'll save you a parking spot. The good one, near the lift. | 800 |
| system | Session ended. You may retry at any time. The citizens will wait. They always wait. | 600 |

---

## 3. Room Graph

```
[Lobby] ──(sort queues)──▶ [Server Room] ──(build flow)──▶ [Ops Dashboard] ──(read metrics)──▶ [Training Room] ──(match agents)──▶ [Contact Center Warroom]
```

| Room | Unlocked By |
|------|-------------|
| Lobby | Starting room |
| Server Room | Solve sort-lock (queue triage) in Lobby |
| Ops Dashboard | Solve chain-lock (contact flow) in Server Room |
| Training Room | Solve log-lock (metrics reading) in Ops Dashboard |
| Contact Center Warroom | Solve match-lock (agent routing) in Training Room |

---

## 4. Room Details

### Room 1: Lobby — Citizen Triage

**Description:** The ground floor lobby is pandemonium. Chairs overflowing. A ticket machine spits numbers endlessly. Three phone lines ring simultaneously. A whiteboard on the wall shows queue categories — but someone's scrambled the labels. On the reception desk: a sticky note from Mei: "Sort the queues first or nothing routes. — M"

**Image:** `assets/lobby.png`

**Discoveries:**
| Label | Card ID | Type | Title |
|-------|---------|------|-------|
| Read Mei's sticky note | 110 | 🟣 lore | Mei's Monday Survival Guide |
| Look at the queue board | 105 | 🟡 event | Queues Sorted (puzzle: sort-queues) |

**Puzzle: sort-queues**
- Type: `sort-lock`
- Concept: Drag citizen complaint types into the correct queue priority order
- Answer: ["Work Permit Renewal", "Salary Dispute", "Workplace Safety Report", "General Enquiry", "Feedback & Compliments"]
- Distractors: ["Pizza Delivery Order"]
- Hints:
  1. "Renewals are time-sensitive — they go first. What's least urgent?"
  2. "Safety reports are urgent but not as time-bound as permits. General enquiries and feedback are lower priority."
  3. "Order: Work Permit Renewal → Salary Dispute → Workplace Safety Report → General Enquiry → Feedback & Compliments"

**What players learn:** Queues have priority. Not everything is equal — time-sensitive matters route first.

---

### Room 2: Server Room — Contact Flow Builder

**Description:** A cold server room. Racks of equipment blink amber — the old PBX is truly dead. A large touchscreen on the wall shows a blank contact flow canvas. Above it, spray-painted by some frustrated engineer: "CALLS DON'T ROUTE THEMSELVES." Mei left another note: "Build it in order: greet, identify, route, queue, connect. Skip one and calls drop into the void."

**Image:** `assets/server-room.png`

**Discoveries:**
| Label | Card ID | Type | Title |
|-------|---------|------|-------|
| Read the engineer's note on the wall | 210 | 🟣 lore | The PBX Graveyard |
| Build the contact flow | 205 | 🟡 event | Contact Flow Live (puzzle: build-flow) |

**Puzzle: build-flow**
- Type: `chain-lock`
- Concept: Build an Amazon Connect contact flow by chaining blocks in the correct order
- Items:
  - { id: "greet", label: "Play Greeting", icon: "👋" }
  - { id: "identify", label: "Get Customer Input", icon: "🔢" }
  - { id: "route", label: "Check Queue Availability", icon: "🔀" }
  - { id: "queue", label: "Transfer to Queue", icon: "📋" }
  - { id: "connect", label: "Connect to Agent", icon: "🎧" }
  - { id: "hold-music", label: "Play Hold Music", icon: "🎵" } (distractor — valid but not in critical path)
- Answer: ["greet", "identify", "route", "queue", "connect"]
- Hints:
  1. "Every call starts with a greeting. What does the caller need to do next?"
  2. "After greeting: get their input (which service?), check if agents are available, put them in queue, then connect."
  3. "Order: Play Greeting → Get Customer Input → Check Queue Availability → Transfer to Queue → Connect to Agent"

**What players learn:** Contact flows are sequential logic — each block serves a purpose and order matters.

---

### Room 3: Ops Dashboard — Metrics Wall

**Description:** A wall of screens showing real-time contact centre metrics. Numbers scroll. Graphs spike. Three queues are displayed: Work Permits (red), Salary (amber), General (green). A scrolling log feed shows agent activities. Somewhere in this data is the bottleneck causing the 47-minute wait. Mei's voice crackles over the intercom: "Find the broken queue. The numbers don't lie."

**Image:** `assets/ops-dashboard.png`

**Discoveries:**
| Label | Card ID | Type | Title |
|-------|---------|------|-------|
| Check the queue health poster | 310 | 🟣 lore | Metrics That Matter |
| Analyse the dashboard logs | 305 | 🟡 event | Bottleneck Found (puzzle: find-bottleneck) |

**Puzzle: find-bottleneck**
- Type: `log-lock`
- Prompt: "Select the lines that show why the Work Permits queue has a 47-minute wait"
- Lines:
  - { text: "09:01 [GENERAL] Agent Lim — Available — Avg Handle: 3m", correct: false }
  - { text: "09:01 [SALARY] Agent Wong — Available — Avg Handle: 8m", correct: false }
  - { text: "09:02 [WORK PERMITS] Agent Chan — After Contact Work — 22 minutes", correct: true }
  - { text: "09:02 [WORK PERMITS] Agent Lee — Offline — Reason: Break", correct: true }
  - { text: "09:03 [GENERAL] Agent Tan — Available — Avg Handle: 4m", correct: false }
  - { text: "09:03 [WORK PERMITS] Queue depth: 34 callers — 0 agents available", correct: true }
  - { text: "09:04 [SALARY] Queue depth: 3 callers — 2 agents available", correct: false }
  - { text: "09:04 [GENERAL] Queue depth: 1 caller — 3 agents available", correct: false }
- Hints:
  1. "Focus on the Work Permits queue. What's unusual about agent availability?"
  2. "One agent is stuck in ACW for 22 minutes, another is offline. Zero agents available for 34 callers."
  3. "Select: Agent Chan stuck in ACW 22min, Agent Lee offline, and Queue depth 34 with 0 agents."

**What players learn:** Real-time metrics tell you exactly where the problem is — agent status and queue depth are your first indicators.

---

### Room 4: Training Room — Agent Assignment

**Description:** A bright training room with workstation pods. Each pod has an agent profile displayed — their language skills, specialisations, and certifications. A routing configuration panel on the main screen shows empty slots. The task: match the right agents to the right routing profiles so calls go to someone who can actually help.

**Image:** `assets/training-room.png`

**Discoveries:**
| Label | Card ID | Type | Title |
|-------|---------|------|-------|
| Read the routing profiles guide | 410 | 🟣 lore | Skills-Based Routing 101 |
| Assign agents to routing profiles | 405 | 🟡 event | Agents Routed (puzzle: assign-agents) |

**Puzzle: assign-agents**
- Type: `match-lock`
- Concept: Match agents to the correct routing profile based on their skills
- Pairs:
  - ["Agent Chan — Mandarin, Work Permits certified", "Work Permits Queue"]
  - ["Agent Wong — English/Malay, Salary specialist", "Salary Disputes Queue"]
  - ["Agent Lim — English, General trained", "General Enquiries Queue"]
  - ["Agent Raj — Tamil/English, Safety certified", "Workplace Safety Queue"]
- Cols: 4
- Hints:
  1. "Match language and certification to queue type. Work Permits needs someone with that certification."
  2. "Chan has Work Permits cert, Wong handles Salary, Raj is Safety certified."
  3. "Chan→Work Permits, Wong→Salary, Lim→General, Raj→Safety"

**What players learn:** Skills-based routing ensures callers reach agents who can actually resolve their issue — language, certification, and specialisation all factor in.

---

### Room 5: Contact Center Warroom — Handle the Call

**Description:** The warroom. Big screens show all queues running green. Director Tan stands at the door, arms crossed. "One more thing. Show me your team can handle a real call. Pick it up, resolve it, log it properly." A phone rings. On the screen: a text transcript of a citizen's call appears. After you read it, you need to fill in the After Contact Work form correctly.

**Transcript displayed:**
> "Hello, I submitted my work permit renewal three weeks ago — reference WP-20240815. I was told it would take 10 working days but I haven't received any update. My current permit expires next week and I'm worried I'll be out of compliance. Can someone check the status?"

**Image:** `assets/warroom.png`

**Discoveries:**
| Label | Card ID | Type | Title |
|-------|---------|------|-------|
| Read the ACW best practices poster | 510 | 🟣 lore | Why ACW Matters |
| Pick up the call and complete ACW | 599 | 🟡 event | Call Handled (puzzle: complete-acw) |

**Puzzle: complete-acw**
- Type: `context-lock`
- Concept: The "documents" are ACW form fields. Player must keep only the correct entries and remove wrong ones. The "stream" shows whether the case note makes sense.
- agentName: "case-notes"
- intro: "Complete the After Contact Work form. Remove incorrect entries — keep only what matches the citizen's call."
- Capacity: 400
- Documents:
  - { id: "cat-wp", label: "Category: Work Permit Renewal", tokens: 80, status: "required", missingLine: "⚠️ Missing category — case cannot be classified" }
  - { id: "cat-salary", label: "Category: Salary Dispute", tokens: 80, status: "poison", poisonLine: "❌ Wrong category — this isn't a salary issue" }
  - { id: "ref-correct", label: "Reference: WP-20240815", tokens: 60, status: "required", missingLine: "⚠️ No reference number — case cannot be traced" }
  - { id: "ref-wrong", label: "Reference: SD-20240101", tokens: 60, status: "poison", poisonLine: "❌ Wrong reference number — doesn't match caller's case" }
  - { id: "summary-correct", label: "Summary: Permit renewal submitted 3 weeks ago, no update received, expires next week", tokens: 100, status: "required", missingLine: "⚠️ Missing summary — follow-up team won't know the issue" }
  - { id: "summary-wrong", label: "Summary: Caller wants to file a new application", tokens: 100, status: "poison", poisonLine: "❌ Inaccurate summary — caller is checking status, not filing new" }
  - { id: "action-correct", label: "Follow-up: Escalate to permits team for expedited status check", tokens: 100, status: "required", missingLine: "⚠️ No follow-up action — case will sit unresolved" }
  - { id: "action-wrong", label: "Follow-up: No action required, case closed", tokens: 100, status: "poison", poisonLine: "❌ Case isn't resolved — citizen still waiting for an answer" }
- Hints:
  1. "Read the transcript carefully. What did the citizen call about? Match category, reference, summary, and action."
  2. "It's a work permit renewal (not salary). Reference is WP-20240815. They want a status check, not a new application."
  3. "Keep: Work Permit Renewal + WP-20240815 + 'submitted 3 weeks ago' summary + escalate to permits team. Remove everything else."

**What players learn:** ACW isn't just admin — it's how the system tracks cases, triggers follow-ups, and feeds analytics. Get it wrong and the citizen falls through the cracks.

---

## 5. Dependency Chain

```
START
  │
  ▼
[Lobby] ── solve sort-queues ──▶ reveals Server Room (card 200)
  │
  ▼
[Server Room] ── solve build-flow ──▶ reveals Ops Dashboard (card 300)
  │
  ▼
[Ops Dashboard] ── solve find-bottleneck ──▶ reveals Training Room (card 400)
  │
  ▼
[Training Room] ── solve assign-agents ──▶ reveals Contact Center Warroom (card 500)
  │
  ▼
[Contact Center Warroom] ── solve complete-acw ──▶ ENDING (card 599)
```

No branching. Linear progression. Each room teaches one concept.

---

## 6. Card Index

| ID | Type | Color | Title | Room |
|----|------|-------|-------|------|
| 100 | location | green | Lobby — Citizen Triage | lobby |
| 101 | object | blue | Queue Priority Board | lobby |
| 105 | event | yellow | Queues Sorted | lobby |
| 110 | lore | purple | Mei's Monday Survival Guide | lobby |
| 200 | location | green | Server Room — Contact Flow Builder | server-room |
| 201 | object | blue | Contact Flow Canvas | server-room |
| 205 | event | yellow | Contact Flow Live | server-room |
| 210 | lore | purple | The PBX Graveyard | server-room |
| 300 | location | green | Ops Dashboard — Metrics Wall | ops-dashboard |
| 301 | object | blue | Real-Time Metrics Display | ops-dashboard |
| 305 | event | yellow | Bottleneck Found | ops-dashboard |
| 310 | lore | purple | Metrics That Matter | ops-dashboard |
| 400 | location | green | Training Room — Agent Assignment | training-room |
| 401 | object | blue | Routing Configuration Panel | training-room |
| 405 | event | yellow | Agents Routed | training-room |
| 410 | lore | purple | Skills-Based Routing 101 | training-room |
| 500 | location | green | Contact Center Warroom | warroom |
| 501 | object | blue | ACW Terminal | warroom |
| 510 | lore | purple | Why ACW Matters | warroom |
| 599 | event | yellow | Call Handled — Welcome to the Team | warroom |

---

## 7. Scoring

| Parameter | Value |
|-----------|-------|
| Base score | 50 |
| Time bonus per minute remaining | 1 |
| Hint penalty | -2 |
| Wrong attempt penalty | -3 |
| Lore bonus (per lore card found) | 2 |
| Lore card IDs | 110, 210, 310, 410, 510 |
| All-lore bonus | 5 |

### Star Thresholds

| Stars | Min Score |
|-------|-----------|
| 5 | 60 |
| 4 | 50 |
| 3 | 35 |
| 2 | 20 |
| 1 | 0 |

**Notes:** Generous tuning for event use. A clean run (no hints, 5+ min remaining, 3 lore) lands 4–5 stars easily. Most players should get 3+ stars to walk away feeling good.
