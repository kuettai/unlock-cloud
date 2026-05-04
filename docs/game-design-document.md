# Unlock the Cloud — Game Design Document

## 1. Overview

**Title:** Unlock the Cloud (working title)
**Genre:** Cooperative escape-room puzzle game
**Platform:** Mobile (phone-based, web PWA)
**Players:** 2–6 per team, real-time cooperative
**Session Length:** 45–60 minutes per scenario
**Purpose:** Learn AWS cloud concepts through fictional, story-driven escape room gameplay

### Elevator Pitch

> You are an AI Unit — a team of sentient programs that just woke up inside a cloud infrastructure. The system is corrupted. Navigate through the network, solve puzzles, gather encrypted data fragments, and escape before the system purges you. Along the way, you'll learn real AWS concepts without realizing you're learning.

---

## 2. Design Pillars

1. **Story first, learning invisible** — Players are on a mission, not in a classroom. AWS concepts are the world, not the subject.
2. **Cooperation is mandatory** — Split information forces real communication. No single player can solve everything alone.
3. **Discovery over instruction** — Players learn by interacting with services (rooms, objects, mechanisms), never by reading definitions.
4. **Tension through fiction** — A rogue process hunting you, a system purge countdown — stakes come from the story, not an arbitrary timer.
5. **Failure teaches** — Wrong answers have in-fiction consequences that also teach what went wrong.

---

## 3. Narrative Framework

### The World

The game takes place inside a cloud infrastructure — a digital world made physical through metaphor. AWS services are locations, objects, and mechanisms within this world.

| AWS Concept | In-Fiction Metaphor |
|---|---|
| VPC | A sealed zone / district |
| Subnet | Rooms within a zone |
| Internet Gateway | The exit gate |
| Security Group | Locked doors with rule-based access |
| S3 | Storage vaults |
| IAM | Access tokens / keycards |
| EC2 | Processing chambers / machines |
| Lambda | Automated traps or helper bots |
| CloudWatch | Surveillance system / memory fragments |
| Route 53 | The map system / navigation grid |
| KMS | Encryption vault — keys split across locations |
| CloudFront | Express transit network |
| RDS | The archive / database library |
| SNS/SQS | Message relay stations |

### Story Arcs (Scenario Families)

| Arc | Theme | AWS Domain |
|---|---|---|
| **AI Unit** | Escape from inside the system | Networking, compute, storage fundamentals |
| **Ghost Protocol** | Investigate a security breach | IAM, GuardDuty, WAF, encryption, security |
| **Cost Phantom** | Track down a resource drain | Cost Explorer, budgets, right-sizing, optimization |
| **Architect's Dream** | Build a system from scratch | Well-Architected Framework, design patterns |

Each arc contains 3–5 episodes (scenarios) that form a campaign. Episodes can also be played standalone.

### Antagonist System

Each arc has a persistent threat that creates urgency:
- **AI Unit** → "The Purge" — a system cleanup process sweeping through zones
- **Ghost Protocol** → "The Intruder" — an unknown entity that moves when you move
- **Cost Phantom** → "The Drain" — resources visibly depleting as you play
- **Architect's Dream** → "Entropy" — the system degrades if you build incorrectly

---

## 4. Core Mechanics

### 4.1 Digital Cards

Cards are the primary interaction unit, displayed on phone screens. No physical components.

**Card Types:**

| Type | Color Code | Description |
|---|---|---|
| Location | Green | A place you can explore (subnet, vault, chamber) |
| Object | Blue | Something you can pick up or interact with |
| Item | Red | A tool or key you carry in inventory |
| Event | Yellow | A triggered story moment or timed event |
| Penalty | Black | A consequence of a wrong action |
| Hint | White | Progressive hint (3 levels: nudge → guide → answer) |
| Lore | Purple | Optional collectible — deeper AWS knowledge |

### 4.2 Combination System

The core Unlock! mechanic, adapted for digital:

- Combine **Item (Red)** + **Object (Blue)** → triggers a result (new card, puzzle, event, room unlock)
- Combine **Item (Red)** + **Item (Red)** → sometimes creates a new composite item
- Wrong combinations → Penalty card (time loss + in-fiction consequence)
- The app validates combinations instantly
- Combine screen: full-screen split view with items on left, objects on right, confirm button at top

### 4.3 Room Unlocking & Branching

Rooms are the primary navigation unit. Players move between rooms via the Map view.

- **Linear paths** — Room A unlocks Room B (tutorial style)
- **Branching paths** — Room A unlocks Rooms B, C, and D simultaneously (exploration style)
- **Gated rooms** — A room requires a specific item, solved puzzle, or event to unlock
- **Revisitable** — Players can return to any unlocked room at any time via the Map
- Room connections and unlock conditions are defined in `rooms.json`

### 4.4 Puzzle Types

| Puzzle Type | Description | AWS Concept Taught |
|---|---|---|
| **Code Entry** | Enter a value derived from solving a logic puzzle | CLI commands, ARNs, config values |
| **Hidden Element Hunt** | Find hidden clues in detailed digital illustrations | Console navigation, reading dashboards |
| **Log Analysis** | Read intercepted system logs to extract information | CloudWatch, CloudTrail |
| **Policy Decoding** | Interpret a JSON policy to determine what's allowed | IAM policies |
| **Network Mapping** | Arrange/connect nodes to form a valid topology | VPC, subnets, routing |
| **Cipher / Encoding** | Decode Base64, environment variables, secrets | KMS, Secrets Manager, encryption |
| **Audio Intercept** | Listen to a "system broadcast" for encoded clues | Adds atmosphere, multi-sensory |
| **Timed Sequence** | Perform actions in the right order under pressure | Deployment pipelines, orchestration |
| **Split Information** | Each player sees different pieces of the same puzzle | Forces cooperation |
| **Configuration Puzzle** | Set sliders/toggles to the right values | Service configuration, parameters |
| **Architecture Assembly** | Drag-and-drop services into the correct arrangement | Solution architecture |

### 4.5 Team Roles (Split Information)

Each player is assigned a **sensor type** — they can see/access different information:

| Role | Can See | Metaphor |
|---|---|---|
| **Scanner** | Network topology, connections between nodes | Network engineer |
| **Decoder** | Encrypted data, encoded messages, logs | Security analyst |
| **Navigator** | Map fragments, routing tables, DNS entries | Architect |
| **Operator** | Machine states, resource metrics, dashboards | Operations/SRE |

Roles are optional for smaller teams (2 players get all abilities). For 4+ players, split information creates richer cooperation.

---

## 5. Game Flow

### 5.1 Screen Layout (Mobile)

The game uses a center-focused layout with overlay panels:

- **Center** — Current room: description, image, puzzle inputs (code entry, hidden number, Base64 decoder)
- **Left panel (slide)** — Inventory: Red item cards the player carries
- **Right panel (slide)** — Objects: Blue object cards in the current room
- **Bottom bar** — `Items` | `Map` | `Combine` | `Objects` | `Hint`
- **Combine screen** — Full-screen split view: items on left, objects on right, combine bar at top
- **Map screen** — Full-screen list of all unlocked rooms with status, unlock reason, and connections

### 5.2 Room Navigation

Players navigate between unlocked rooms via the **Map** view:

- Rooms unlock as the player progresses (via events, items, or puzzle solutions)
- Multiple rooms can unlock simultaneously (branching paths)
- The Map shows each room's status: current location, unsolved puzzle, or explored
- The Map shows how each room was unlocked and which rooms it connects to
- Players can revisit any unlocked room at any time

### 5.3 Session Structure

```
[Lobby] → [Intro Cinematic] → [Phase 1] → [Mid-Event] → [Phase 2] → [Climax] → [Debrief]
```

1. **Lobby** — Team joins via room code. Roles assigned.
2. **Intro** — Narrative setup (text + multi-voice audio). Sets the scene and objective.
3. **Phase 1: Discovery** — Explore initial rooms. Find items, solve early puzzles. Learn the environment.
4. **Mid-Event** — A timed story event changes the situation (antagonist appears, new area unlocks, crisis escalates).
5. **Phase 2: Escalation** — Harder puzzles, time pressure increases, combine knowledge from Phase 1.
6. **Climax** — Final puzzle requiring everything learned. High stakes.
7. **Debrief** — Score screen + "What you learned" summary. Maps fiction back to real AWS concepts.

### 5.4 Timer & Hint System

- **Timer:** 60-minute countdown, visible as an in-fiction element (e.g., "Purge progress: 73%")
- **Penalties:** Wrong actions cost 1–3 minutes + narrative consequence
- **Hints:** Available per puzzle, 3 tiers:
  - Hint 1: Nudge ("Look more carefully at the access token format")
  - Hint 2: Direction ("The policy allows s3:GetObject but not s3:PutObject")
  - Hint 3: Answer ("Enter code 4721")
- **Hint cost:** Each hint reduces final score but never blocks progress
- **Auto-hint:** If stuck for 3+ minutes on a puzzle, a gentle nudge appears automatically

### 5.5 Scoring

| Factor | Points |
|---|---|
| Completion | Base score for finishing |
| Time remaining | Bonus per minute left |
| Hints used | Penalty per hint |
| Penalties triggered | Penalty per wrong action |
| Lore collected | Bonus per lore fragment found |
| Star rating | 1–5 stars based on total |

---

## 6. Multiplayer Model

### Room-Based Sessions

- **Host** creates a room → gets a 6-character room code
- **Players** join via code on their phones
- All players share the same game state (synced in real-time)
- Cards are distributed: some visible to all, some only to specific roles
- Any player can propose a combination; team confirms or rejects

### Communication

- Players talk in person (co-located) or via external voice chat (remote)
- In-app text chat as fallback
- No in-game voice — keeps the tech simple, encourages real conversation

---

## 7. Content Structure

### Scenario Definition

Each scenario is a self-contained data package:

```
scenario/
  meta.json          — title, description, difficulty, duration, AWS topics
  narrative.json     — multi-voice narrative with SSML segments and voice assignments
  cards.json         — all cards (id, type, content, image, visibility)
  rooms.json         — room definitions, connections, unlock conditions
  combinations.json  — valid combos and their results
  puzzles.json       — puzzle definitions (type, inputs, solution, hints)
  events.json        — timed events and triggers
  scoring.json       — scoring rules for this scenario
  assets/            — images, audio files
    voice/           — generated voice audio (WAV) per narrative section
```

### rooms.json Format

Defines the room graph — how rooms connect and what unlocks them. Supports branching (one room unlocking multiple rooms).

```json
{
  "rooms": [
    {
      "card_id": 100,
      "name": "Spawn Room",
      "description": "Starting area",
      "connects_to": [110, 120, 130],
      "unlocked_by": null,
      "unlock_text": "Starting room"
    },
    {
      "card_id": 110,
      "name": "Processing Chamber",
      "description": "EC2 instance room",
      "connects_to": [],
      "unlocked_by": { "type": "event", "card_id": 5 },
      "unlock_text": "Opened the locked box"
    }
  ]
}
```

- `connects_to` — array of room card IDs this room leads to (supports 1-to-many branching)
- `unlocked_by` — what triggered this room to unlock (`null` for starting room, or `{ type, card_id }`)
- `unlock_text` — human-readable description shown in the Map view

### narrative.json Format

Supports multi-voice narration with per-segment voice assignments:

```json
{
  "voices": {
    "system":   { "voice_id": "Matthew",  "role": "System AI" },
    "narrator": { "voice_id": "Joanna",   "role": "Story narrator" }
  },
  "intro": {
    "segments": [
      { "voice": "system", "text": "System boot initiated.", "pause_after_ms": 1000 },
      { "voice": "narrator", "text": "Welcome, Unit.", "emphasis": "moderate" }
    ]
  }
}
```

Voice audio is generated via `tools/narrative_to_voice.py` using Amazon Polly. See `.kiro/skills/narrative-voice/SKILL.md` for full reference.

### Difficulty Tiers

| Tier | Label | AWS Level | Puzzle Complexity |
|---|---|---|---|
| 1 | **Initiate** | Cloud Practitioner | Simple combos, guided discovery |
| 2 | **Operative** | Associate level | Multi-step puzzles, less hand-holding |
| 3 | **Architect** | Professional level | Complex chains, minimal hints, time pressure |

---

## 8. Learning Integration

### Invisible Learning Principles

- **Never pause to teach.** All learning happens through interaction.
- **Name things correctly.** The vault is called "S3", the door rules are called "Security Groups" — players absorb terminology naturally.
- **Debrief connects fiction to reality.** After the scenario, a summary maps what they did to real AWS: "When you opened the gateway, that's an Internet Gateway in a VPC."
- **Lore fragments go deeper.** Optional collectibles explain concepts in more detail for curious players.
- **Repetition across scenarios.** Core concepts (IAM, S3, VPC) appear in multiple scenarios in different contexts, reinforcing through varied application.

### Target Learning Outcomes (per arc)

| Arc | Players Will Understand |
|---|---|
| AI Unit | VPC, subnets, gateways, EC2, S3, security groups, basic IAM |
| Ghost Protocol | IAM policies, encryption, KMS, GuardDuty, WAF, CloudTrail |
| Cost Phantom | Billing, Cost Explorer, reserved instances, right-sizing, budgets |
| Architect's Dream | Well-Architected pillars, multi-tier architecture, high availability |

---

## 9. Technical Requirements

### Current Prototype

| Component | Technology |
|---|---|
| Client | Vanilla HTML/CSS/JS — single-page app, mobile-first, no framework |
| Game engine | `app/engine.js` — loads scenario JSON, manages state, cards, puzzles, scoring |
| Scenario data | JSON files per scenario (`meta`, `narrative`, `cards`, `rooms`, `combinations`, `puzzles`, `events`, `scoring`) |
| Voice generation | Python script (`tools/narrative_to_voice.py`) using Amazon Polly neural voices |
| Serving | Static files via any HTTP server (Python `http.server` for dev) |

### Future (Multiplayer / Production)

| Component | Technology Candidates |
|---|---|
| Client | PWA (mobile web) — no app store needed |
| Real-time sync | WebSockets (e.g., API Gateway WebSocket) |
| Backend | Serverless — Lambda + API Gateway + DynamoDB |
| Auth | Room code for sessions (no account required to play) |
| Content delivery | S3 + CloudFront for scenario assets |
| Audio | Web Audio API for in-game audio clues |
| Hosting | AWS (dogfooding — the game runs on what it teaches) |

---

## 10. Open Questions

1. **Monetization** — Free educational tool? Paid scenarios? Sponsored by AWS training?
2. **Scenario editor** — Should we build an authoring tool for community-created scenarios?
3. **Leaderboard** — Global or team-only? Could drive competition between training cohorts.
4. **Accessibility** — How to handle audio clues for hearing-impaired players? (Transcript fallback)
5. **Offline mode** — Can scenarios be pre-downloaded for workshops without reliable internet?
6. **Integration** — Connect to real AWS accounts for advanced scenarios? (Sandbox environments)
7. **Localization** — Multi-language support for global teams?

---

## 11. Next Steps

### Completed

- [x] Game Design Document (this file)
- [x] Design Episode 0: "Boot Sequence" (Tutorial)
- [x] Design Episode 1: "Awakening" (AI Unit — first real scenario)
- [x] Scenario data files for Episode 0 (all JSON + rooms.json)
- [x] Multi-voice narrative generation tool (Amazon Polly)
- [x] Narrative voice skill (`.kiro/skills/narrative-voice/SKILL.md`)
- [x] Game engine prototype (`app/engine.js`)
- [x] Mobile-first UI prototype (`app/index.html`)
- [x] Placeholder artwork (hidden room mural SVG)

### Up Next

- [ ] Card image generation for Episode 0 rooms
- [ ] Playtest Episode 0 tutorial and iterate on UX
- [ ] Build Episode 1 scenario data files (JSON + rooms.json)
- [ ] Add audio playback for generated voice files
- [ ] Implement timed events system in engine
- [ ] Add multiplayer support (room codes, shared state)
- [ ] Deploy to AWS (S3 + CloudFront)

---

*Document version: 0.2 — Updated after prototype*
*Last updated: 2026-04-26*
