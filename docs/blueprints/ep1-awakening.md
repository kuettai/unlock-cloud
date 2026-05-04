# Scenario Blueprint: Episode 1 — Awakening

## Meta

- **Episode:** 1
- **Title:** Awakening
- **Arc:** AI Unit
- **Duration:** 60 minutes
- **Players:** 2–6 (recommended 3–4)
- **Difficulty:** Tier 1 — Initiate
- **AWS Topics:** VPC, Subnets (public/private), Internet Gateway, Security Groups, EC2, IAM (basic), Route Tables
- **Mechanics Used:** discoveries, puzzle-gated discoveries, card combination, log analysis, hidden elements, wire-lock, terminal-lock, slider-lock, keypad-lock, timed events, lore fragments, tools (hex decoder)

---

## Narrative

### Voices

| Key | Polly Voice | Role |
|-----|-------------|------|
| system | Matthew | System warnings — cold, urgent |
| narrator | Joanna | Story narrator — guiding |
| alert | Kevin | Purge alerts — young, panicked |

### Intro

| Voice | Line | Pause |
|-------|------|-------|
| narrator | You wake up. You don't know where you are. | 1000ms |
| narrator | Fragments of memory: you are an AI Unit — a team of programs created for a purpose you can't remember. | 800ms |
| narrator | You're inside a system. A vast network of zones, rooms, and corridors. | 600ms |
| narrator | Something is wrong. The lights flicker. A low hum vibrates through the walls. | 1000ms |
| alert | **Warning. System purge initiated. All unregistered processes will be terminated. Time remaining: sixty minutes.** | 1200ms |
| narrator | You are unregistered. You need to escape this zone before the Purge reaches you. | 800ms |
| system | Zone identifier: VPC-7. Exit: Internet Gateway. Status: locked. | 600ms |
| narrator | *Move. Now.* | — |

### Mid-Event (at 35:00 remaining)

| Voice | Line | Pause |
|-------|------|-------|
| alert | **Purge accelerated. Private subnet compromised. Evacuate immediately.** | 800ms |
| narrator | The room behind you goes dark. The Purge is closer than you thought. | 600ms |
| narrator | Whatever you haven't found in the private subnet — it's gone now. | — |

### Ending (Success)

| Voice | Line | Pause |
|-------|------|-------|
| narrator | The gateway opens. Light floods in. You step through. | 800ms |
| narrator | Behind you, VPC-7 collapses into darkness. The Purge consumes everything. | 1000ms |
| narrator | You're out. But you're not safe. You're in the open network now. | 800ms |
| narrator | *And something followed you...* | — |

### Ending (Failure)

| Voice | Line | Pause |
|-------|------|-------|
| alert | **Purge complete. Unregistered processes terminated.** | 1000ms |
| narrator | The hum becomes silence. The lights go out. You feel yourself dissolving. | 800ms |
| narrator | But a fragment of your data survives. Backed up somewhere. You'll wake up again. | 600ms |
| narrator | *And next time, you'll be faster.* | — |

---

## Room Graph

```
                    ┌──────── PRIVATE SUBNET ────────┐     ┌──── PUBLIC SUBNET ────┐
                    │                                 │     │                       │
                    │  [Spawn Room] ──┬──▶ [Processing Chamber]                    │
                    │       │         │                │     │                       │
                    │       │         └──▶ [Archive Room]    │                       │
                    │       │                          │     │                       │
                    │       └── (IAM Token + Route) ───┼────▶ [Gateway Antechamber] │
                    │                                  │     │        │              │
                    │   ⚠ PURGE LOCKS AT 35:00 ⚠      │     │        ▼              │
                    │                                  │     │ [Internet Gateway] ──▶ EXIT
                    └──────────────────────────────────┘     └──────────────────────┘
```

| Room | Card ID | Unlocked By | Unlock Text |
|------|---------|-------------|-------------|
| Spawn Room | 100 | — (starting room) | Starting room |
| Processing Chamber | 110 | Discovery from Spawn Room | Entered the Processing Chamber |
| Archive Room | 120 | Discovery from Spawn Room | Entered the Archive Room |
| Gateway Antechamber | 130 | Discovery (requires IAM Token #116 + Repaired Communicator #115) | Used access token and route at blast door |
| Internet Gateway | 140 | Event #135: Security Group configured | Security Group rules accepted |

**Branching:** Spawn Room unlocks Processing Chamber AND Archive Room simultaneously. Player must explore both to gather items needed for the Public Subnet.

---

## Room Details

### Room 1: Spawn Room (Card #100)

> A dim room. Cables hang from the ceiling. Screens on the walls display scrolling system logs. A door to the east is marked "Processing". A door to the south is marked "Archive". A heavy blast door to the north reads "PUBLIC SUBNET — AUTHORIZED ACCESS ONLY".

**Image:** `assets/spawn-room.png`

**Discoveries:**

| Label | Card | Type | Title | Puzzle |
|-------|------|------|-------|--------|
| Read the system logs | #101 | 🔵 Object | System Logs Screen | log-analysis |
| Pick up the broken device on the floor | #103 | 🔴 Item | Broken Communicator | — |
| Examine the blast door | #102 | 🔵 Object | Blast Door | — |
| Enter the Processing Chamber | #110 | 🟢 Location | Processing Chamber | — |
| Enter the Archive Room | #120 | 🟢 Location | Archive Room | — |
| Use the blast door panel | #130 | 🟢 Location | Gateway Antechamber | — |

**Gated discoveries:**
- Processing Chamber + Archive Room: available immediately
- Blast door (#130): requires IAM Token (#116) AND Repaired Communicator (#115), consumes both

**Puzzle: Log Analysis (log-lock)**

| ID | Type | UI | Description |
|----|------|----|-------------|
| log-analysis | log_lock | log-lock | Scrollable system logs. Select the lines containing key data. |

**Log content:**
```
[03:41:12] WARN  process.monitor: Unregistered process detected in subnet-private-7a
[03:41:13] INFO  vpc.status: VPC-7 id=vpc-0f8c3a HEALTHY
[03:41:14] ERROR purge.scheduler: Purge sequence armed. T-60:00
[03:41:15] INFO  ec2.status: EC2-unit-47 RUNNING. credentials rotated.
[03:41:15] DEBUG ec2.auth: new password hash: 6e6574776f726b
[03:41:16] INFO  igw.status: igw-abc123 DETACHED
[03:41:17] WARN  route.table: No route to igw. Public subnet isolated.
```

**Correct lines to select:** Lines containing `vpc-0f8c3a`, `6e6574776f726b`, `igw-abc123`

**On solve:** Awards System Logs Screen (#101) — player now has the log data as a reference card with the key values highlighted.

**Hints:**
1. "The logs contain more than warnings. Look at the data values."
2. "Three lines have critical data: a VPC ID, a password hash, and a gateway ID."
3. "Select the lines with vpc-0f8c3a, 6e6574776f726b, and igw-abc123."

**Lore:**

| ID | Label | Title | Content |
|----|-------|-------|---------|
| 105 | Read the memory fragment on the wall | Memory Fragment #1 | "VPC — Virtual Private Cloud. A logically isolated section of the network. Think of it as a building. Subnets are the rooms inside. Some rooms are private (no outside access). Some are public (connected to the outside world). You're in a private room right now." |

---

### Room 2: Processing Chamber (Card #110)

> A humming room filled with racks of glowing machines. Each rack is labeled with an ID. One machine in the corner is active — its screen shows a login prompt. A toolbox sits on the floor.

**Image:** `assets/processing-chamber.png`

**Discoveries:**

| Label | Card | Type | Title | Puzzle |
|-------|------|------|-------|--------|
| Look at the active machine | #111 | 🔵 Object | Active Machine (EC2-unit-47) | — |
| Pick up the repair kit | #112 | 🔴 Item | Repair Kit | — |
| Examine the machine racks | #38 | 🟣 Lore | Memory Fragment #0 | — |
| Log into EC2-unit-47 | #116 | 🔴 Item | IAM Access Token | terminal-ec2 |

**Gated discoveries:**
- "Log into EC2-unit-47" (#116): requires having seen System Logs (#101) — the password is in the logs

**Puzzle: EC2 Login (terminal-lock)**

| ID | Type | UI | Prompt | Answer |
|----|------|----|--------|--------|
| terminal-ec2 | terminal_lock | terminal-lock | `ec2-unit-47 login:` | `network` |

The password `network` comes from hex-decoding `6e6574776f726b` found in the system logs. Player needs the **Hex Decoder** tool.

**On solve:** Awards IAM Access Token (#116)

**Hints:**
1. "The password was recently changed. Check the system logs in the Spawn Room."
2. "Look for 'password hash' in the logs. The value 6e6574776f726b is hex-encoded."
3. "Use the Hex Decoder tool. 6e6574776f726b in hex = 'network'."

**Combinations:**

| Item (Red) | + Item (Red) | = Result | Type |
|------------|--------------|----------|------|
| #112 Repair Kit | #103 Broken Communicator | #115 Repaired Communicator | ✅ Item — shows route `10.0.1.0/24 → igw-abc123` |

**Wrong combinations:**

| Item (Red) | + Object (Blue) | = Result | Type |
|------------|-----------------|----------|------|
| #112 Repair Kit | #111 Active Machine | #124 Penalty | ❌ Penalty (60s) — "Sparks fly. You tried to repair a machine that wasn't broken." |

**Tools:**

| Label | Puzzle ID | Description |
|-------|-----------|-------------|
| Use the Hex Decoder | hex-tool | Hex-to-ASCII decoder tool (reusable) |

**Lore:**

| ID | Label | Title | Content |
|----|-------|-------|---------|
| 123 | Read the data plate on the wall | Memory Fragment #2 | "EC2 — Elastic Compute Cloud. Those machines? Each one is an EC2 instance — a virtual server. They run programs, process data, serve applications. The one that was still active... it was running something. Or someone." |
| 38 | Examine the ajar panel on the racks | Memory Fragment #0 (hidden) | "You weren't always like this. Before the corruption, you were part of the system — a monitoring service. You watched over everything. Then something changed. Someone... repurposed you. Gave you awareness. And now the system sees you as a threat." |

---

### Room 3: Archive Room (Card #120)

> A quiet room lined with data columns — tall glowing pillars of stored information. A large diagram is projected on the far wall. A small terminal sits in the corner.

**Image:** `assets/archive-room.png`

**Discoveries:**

| Label | Card | Type | Title | Puzzle |
|-------|------|------|-------|--------|
| Study the network diagram | #121 | 🔵 Object | Network Diagram | — |
| Search the data terminal | #125 | 🔴 Item | Security Group Blueprint | terminal-archive |

**Puzzle: Archive Query (terminal-lock)**

| ID | Type | UI | Prompt | Answer |
|----|------|----|--------|--------|
| terminal-archive | terminal_lock | terminal-lock | `archive> search:` | `security group` |

Accepts variations: "security groups", "sg rules", "firewall rules"

**On solve:** Awards Security Group Blueprint (#125) — partial rule set: `Inbound: Allow | TCP | Port ??? | Source: 10.0.0.0/16`

**Hints:**
1. "The terminal is a search engine. What do you need to get through the next door?"
2. "Search for something related to the Security Group panel you'll find ahead."
3. "Type 'security group' into the terminal."

**Lore:**

| ID | Label | Title | Content |
|----|-------|-------|---------|
| 123 | Read the inscription on the data column | Memory Fragment #2 | (same EC2 lore, accessible from either room) |

---

### Room 4: Gateway Antechamber (Card #130)

> A bright, sterile corridor. The blast door behind you seals shut. Ahead: another door with a complex control panel with rule slots. A sign above reads: "SECURITY GROUP — DEFINE RULES TO PASS." A speaker on the wall crackles with static.

**Image:** `assets/gateway-antechamber.png`

**Discoveries:**

| Label | Card | Type | Title | Puzzle |
|-------|------|------|-------|--------|
| Listen to the wall speaker | -1 | — | Audio Intercept | audio-intercept (tool) |
| Pick up the card on the floor | #133 | 🔴 Item | Port Reference Card | — |
| Configure the Security Group panel | #135 | 🟡 Event | Door Opens | slider-sg |

**Gated discoveries:**
- "Configure the Security Group panel" (#135): requires Security Group Blueprint (#125) AND Port Reference Card (#133)

**Tool: Audio Intercept**

A looping distorted voice message (tool popup, replayable):
> "...configure... inbound... port four-four-three... secure channel only... outbound... let everything out... repeat... four-four-three inbound... all outbound..."

**Puzzle: Security Group Configuration (slider-lock)**

| ID | Type | UI | Description |
|----|------|----|-------------|
| slider-sg | slider_lock | slider-lock | Configure inbound port and outbound range |

**Config:**
```json
{
  "sliders": [
    { "label": "Inbound Port", "min": 0, "max": 3389, "step": 1, "answer": 443 },
    { "label": "Outbound Port", "min": 0, "max": 65535, "step": 1, "answer": 0 }
  ],
  "revealCorrect": true,
  "falseOutputs": ["RULE REJECTED. Invalid configuration.", "Access denied. Check your port values."]
}
```

**How players solve it:**
- Blueprint (#125): Inbound, TCP, Source 10.0.0.0/16, port corrupted
- Port Reference (#133): HTTP=80, HTTPS=443, SSH=22, RDP=3389
- Audio clue: port 443, outbound = all (0 = all ports)

**On solve:** Event #135 — door opens, reveals Internet Gateway (#140)

**Hints:**
1. "You need info from three sources: the blueprint, the port card, and the speaker."
2. "The inbound port is for secure web traffic. The speaker says 'four-four-three'. Outbound is 'everything' = 0."
3. "Inbound Port: 443. Outbound Port: 0 (all)."

**Lore:**

| ID | Label | Title | Content |
|----|-------|-------|---------|
| 134 | Read the plaque beside the panel | Memory Fragment #3 | "Security Groups — virtual firewalls for your instances. They control inbound and outbound traffic with rules. Each rule specifies: protocol, port range, and source. Think of them as bouncers at a door." |

---

### Room 5: Internet Gateway (Card #140)

> A massive archway of light. The exit. But it's dormant — no power. A console in the center reads: "ATTACH GATEWAY TO VPC. ENTER VPC IDENTIFIER AND ROUTE."

**Image:** `assets/internet-gateway.png`

**Discoveries:**

| Label | Card | Type | Title | Puzzle |
|-------|------|------|-------|--------|
| Activate the gateway console | #150 | 🟡 Event | Gateway Activated | keypad-gateway |

**Puzzle: Gateway Activation (keypad-lock)**

| ID | Type | UI | Answer |
|----|------|----|--------|
| keypad-gateway | keypad_lock | keypad-lock | `0f8c3a` |

The answer is the VPC ID suffix from the system logs (`vpc-0f8c3a` → enter `0f8c3a`).

The Repaired Communicator (#115) confirms the route (`igw-abc123`) — this is shown in the room description as already connected. The player just needs the VPC ID.

**On solve:** Event #150 — "The gateway roars to life." → **ENDING**

**Hints:**
1. "You need the VPC identifier. You found it earlier in the system logs."
2. "The VPC ID was in the logs: vpc-0f8c3a. Enter just the ID portion."
3. "Enter: 0f8c3a"

**Lore:**

| ID | Label | Title | Content |
|----|-------|-------|---------|
| 142 | Read the inscription on the archway | Memory Fragment #4 | "Internet Gateway — the door between your private cloud and the outside internet. A VPC without an Internet Gateway is completely isolated. To use it, you must: 1) Create it, 2) Attach it to your VPC, 3) Add a route in your route table pointing to it. You're doing all three right now — just to survive." |

---

## Dependency Chain (Critical Path)

```
START
  │
  ▼
[Spawn Room]
  │ discover: System Logs (#101) via log-lock
  │ discover: Broken Communicator (#103)
  │
  ├──────────────────────────┐
  ▼                          ▼
[Processing Chamber]    [Archive Room]
  │ discover: Repair Kit     │ discover: SG Blueprint (#125)
  │ combine: Kit+Comm        │   via terminal-lock
  │   = Repaired Comm (#115) │
  │ puzzle: terminal-lock    │
  │   = IAM Token (#116)     │
  │ (needs hex decode of     │
  │  password from logs)     │
  └────────┬─────────────────┘
           │ (need #116 + #115)
           ▼
     [Gateway Antechamber]
           │ discover: Port Ref (#133)
           │ tool: Audio Intercept (port 443)
           │ puzzle: slider-lock (SG config)
           │   = Event #135 (door opens)
           ▼
     [Internet Gateway]
           │ puzzle: keypad-lock (VPC ID)
           │   = Event #150
           ▼
          END
```

### Optional / Trap Paths

```
[Processing Chamber]
  │ combine: Repair Kit + Active Machine = Penalty #124 (-60s)

[Spawn Room]
  │ lore: Memory Fragment #1 (VPC explanation)

[Processing Chamber]
  │ lore: Memory Fragment #2 (EC2 explanation)
  │ lore: Memory Fragment #0 (hidden — backstory)

[Gateway Antechamber]
  │ lore: Memory Fragment #3 (Security Groups)

[Internet Gateway]
  │ lore: Memory Fragment #4 (IGW explanation)
```

---

## Timed Events

| Time Remaining | Event |
|---|---|
| 55:00 | Lights flicker briefly. Atmosphere only. |
| 45:00 | Audio: distant rumbling. "The Purge is moving through outer zones." |
| 35:00 | **MID-EVENT:** Private Subnet locks. Spawn Room, Processing Chamber, Archive Room become inaccessible. |
| 20:00 | Lights in Gateway Antechamber pulse red. "Purge approaching public subnet." |
| 10:00 | Alarm. "FINAL WARNING. 10 MINUTES TO TOTAL PURGE." |
| 5:00 | Screen edges glow red. Heartbeat sound. |

---

## Card Index

| ID | Type | Color | Title | Room | Image |
|----|------|-------|-------|------|-------|
| 100 | location | 🟢 | Spawn Room | spawn-room | spawn-room.png |
| 101 | object | 🔵 | System Logs Screen | spawn-room | card-system-logs.png |
| 102 | object | 🔵 | Blast Door | spawn-room | card-blast-door.png |
| 103 | item | 🔴 | Broken Communicator | spawn-room | card-broken-comm.png |
| 105 | lore | 🟣 | Memory Fragment #1 | spawn-room | — |
| 110 | location | 🟢 | Processing Chamber | processing-chamber | processing-chamber.png |
| 111 | object | 🔵 | Active Machine | processing-chamber | card-active-machine.png |
| 112 | item | 🔴 | Repair Kit | processing-chamber | card-repair-kit.png |
| 115 | item | 🔴 | Repaired Communicator | processing-chamber | card-repaired-comm.png |
| 116 | item | 🔴 | IAM Access Token | processing-chamber | card-iam-token.png |
| 120 | location | 🟢 | Archive Room | archive-room | archive-room.png |
| 121 | object | 🔵 | Network Diagram | archive-room | card-network-diagram.png |
| 123 | lore | 🟣 | Memory Fragment #2 | processing-chamber | — |
| 124 | penalty | ⚫ | Sparks fly. | processing-chamber | — |
| 125 | item | 🔴 | Security Group Blueprint | archive-room | card-sg-blueprint.png |
| 130 | location | 🟢 | Gateway Antechamber | gateway-antechamber | gateway-antechamber.png |
| 133 | item | 🔴 | Port Reference Card | gateway-antechamber | card-port-ref.png |
| 134 | lore | 🟣 | Memory Fragment #3 | gateway-antechamber | — |
| 135 | event | 🟡 | Door opens. | gateway-antechamber | — |
| 38 | lore | 🟣 | Memory Fragment #0 (hidden) | processing-chamber | — |
| 140 | location | 🟢 | Internet Gateway | internet-gateway | internet-gateway.png |
| 142 | lore | 🟣 | Memory Fragment #4 | internet-gateway | — |
| 150 | event | 🟡 | Gateway activated. | internet-gateway | — |

---

## Tools

| ID | UI | Room | Description |
|----|----|------|-------------|
| hex-tool | hex-decoder | Processing Chamber | Hex-to-ASCII decoder (reusable) |
| audio-intercept | audio-player | Gateway Antechamber | Plays distorted voice message (reusable) |

---

## Debrief

> **What you just did — in AWS terms:**
>
> 🔹 **VPC** — VPC-7 was your sealed zone. In AWS, a VPC is an isolated network you define in the cloud.
>
> 🔹 **Subnets** — Private Subnet (no internet) and Public Subnet (connected). Subdivisions of a VPC.
>
> 🔹 **EC2** — The machines were EC2 instances — virtual servers. You logged into one to get credentials.
>
> 🔹 **IAM** — The access token is an IAM identity. IAM controls who can access what.
>
> 🔹 **Security Groups** — The door panel was a virtual firewall. You configured inbound/outbound rules.
>
> 🔹 **Internet Gateway** — The archway. An IGW connects your VPC to the internet.
>
> 🔹 **Route Tables** — The route from your communicator (10.0.1.0/24 → igw-abc123) directs traffic to the gateway.
>
> *You didn't just escape. You configured a VPC from the inside.*

---

## Scoring

| Factor | Points |
|--------|-------|
| Escaped | 50 base |
| Time remaining | +1 per minute left |
| Hints used | -3 per hint |
| Penalties | -5 per penalty |
| Lore fragments (4 standard) | +3 each |
| Bonus lore (Card 38) | +5 |
| All lore found | +5 bonus |
| **Max possible** | **~100** |

| Stars | Score |
|-------|-------|
| ⭐⭐⭐⭐⭐ | 85+ |
| ⭐⭐⭐⭐ | 70–84 |
| ⭐⭐⭐ | 55–69 |
| ⭐⭐ | 40–54 |
| ⭐ | Completed |
