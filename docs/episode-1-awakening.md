# Episode 1: Awakening

## Overview

| Field | Value |
|---|---|
| Arc | AI Unit |
| Duration | 60 minutes |
| Players | 2–6 (recommended 3–4) |
| Difficulty | Tier 1 — Initiate |
| AWS Concepts | VPC, Subnets, EC2, IAM Policies, Security Groups, NACLs, Internet Gateway, Route Tables |
| Mechanics | Log analysis, hex decoding, terminal entry, card combination, JSON policy editor, SG rule toggle, wire-lock, multi-field keypad, timed events, lore fragments, tools |
| Antagonist | The Purge — a system cleanup process sweeping toward you |

---

## Room Layout

```
                ┌──────── PRIVATE SUBNET ──────────────┐     ┌──── PUBLIC SUBNET ──────────────┐
                │                                      │     │                                  │
                │  [Spawn Room] ──┬──▶ [Processing]    │     │                                  │
                │       │         │    [Chamber   ]    │     │                                  │
                │       │         │                    │     │                                  │
                │       │         └──▶ [Archive Room]  │     │                                  │
                │       │                   │          │     │                                  │
                │       │              [Policy Vault]  │     │                                  │
                │       │                              │     │                                  │
                │       └── (Token+Comm+Policy) ───────┼────▶ [Gateway Antechamber]             │
                │                                      │     │        │                         │
                │   ⚠ PURGE LOCKS AT 35:00 ⚠          │     │   [NACL Corridor]                │
                │                                      │     │        │                         │
                └──────────────────────────────────────┘     │   [Wire Junction]                │
                                                             │        │                         │
                                                             │   [Internet Gateway] ──▶ EXIT    │
                                                             └──────────────────────────────────┘
```

**8 rooms total:**

| Room | Card | Subnet | Puzzle | AWS Concept |
|------|------|--------|--------|-------------|
| Spawn Room | #100 | Private | Log analysis (log-lock) | VPC, system logs |
| Processing Chamber | #110 | Private | EC2 login (terminal-lock) + hex decoder | EC2, credentials |
| Archive Room | #120 | Private | Archive search (terminal-lock) + vault keypad | Data retrieval |
| Policy Vault | #160 | Private | IAM policy (policy-lock) | IAM Policies |
| Gateway Antechamber | #130 | Public | Security Group config (terminal-lock) | Security Groups |
| NACL Corridor | #170 | Public | NACL rules (sg-lock) | NACLs vs SGs |
| Wire Junction | #180 | Public | Power cables (wire-lock) | Physical networking |
| Internet Gateway | #140 | Public | 3-field keypad (keypad-lock) | IGW, route tables |

---

## Critical Path

```
START
  │
  ▼
[Spawn Room]
  │ puzzle: log-lock → System Logs (#101) → 🟣 Memory Fragment #1 (VPC)
  │ discover: Broken Communicator (#103)
  │ discover: Blast Door (#102) — hints at "Security Group checkpoint"
  │
  ├──────────────────────────┐
  ▼                          ▼
[Processing Chamber]    [Archive Room]
  │ discover: Repair Kit     │ puzzle: terminal-lock → SG Blueprint (#125)
  │ combine: Kit+Comm        │ puzzle: keypad (7143) → Policy Vault
  │   = Repaired Comm (#115) │
  │ tool: Hex Decoder        │
  │ puzzle: terminal-lock    │
  │   = IAM Token (#116)     │
  │   → 🟣 Memory #2 (EC2)  │
  │                          │
  │                     [Policy Vault]
  │                          │ discover: NACL Reference Sheet (#162)
  │                          │ puzzle: policy-lock
  │                          │   = Policy Token (#165)
  │                          │   → 🟣 Memory #5 (IAM Policies)
  └────────┬─────────────────┘
           │ (need #116 + #115 + #165)
           ▼
     [Gateway Antechamber]
           │ discover: Port Reference (#133)
           │ tool: Audio Intercept
           │ puzzle: terminal-lock (SG: 443 + 0)
           │   = Event #135 → 🟣 Memory #3 (Security Groups)
           ▼
     [NACL Corridor]
           │ discover: Power Routing Diagram (#172)
           │ puzzle: sg-lock (NACL rules)
           │   = Event #175 → 🟣 Memory #6 (NACLs vs SGs)
           ▼
     [Wire Junction]
           │ puzzle: wire-lock (reconnect 4 cables)
           │   = Event #185 → 🟣 Memory #7 (Physical networking)
           ▼
     [Internet Gateway]
           │ puzzle: 3-field keypad (VPC ID + Gateway ID + Route CIDR)
           │   = Event #150 → 🟣 Memory #4 (Internet Gateway)
           ▼
          END
```

---

## Memory Fragments (Lore)

Each fragment auto-reveals after completing the related puzzle — giving players an AWS concept recap at each milestone.

| ID | Title | Triggered By | AWS Concept |
|----|-------|-------------|-------------|
| #105 | Memory Fragment #1 | Log analysis solved | VPC & Subnets |
| #123 | Memory Fragment #2 | EC2 login solved | EC2 instances |
| #167 | Memory Fragment #5 | Policy lock solved | IAM Policies |
| #134 | Memory Fragment #3 | SG config solved | Security Groups |
| #173 | Memory Fragment #6 | NACL configured | NACLs vs Security Groups |
| #183 | Memory Fragment #7 | Wire junction solved | Physical networking |
| #142 | Memory Fragment #4 | Gateway activated | Internet Gateway |
| #38 | Memory Fragment #0 | Hidden discovery (Processing Chamber) | Backstory (bonus) |

---

## Card Index

| ID | Type | Color | Title | Room |
|----|------|-------|-------|------|
| 100 | location | 🟢 | Spawn Room | spawn-room |
| 101 | object | 🔵 | System Logs Screen | spawn-room |
| 102 | object | 🔵 | Blast Door | spawn-room |
| 103 | object | 🔵 | Broken Communicator | spawn-room |
| 105 | lore | 🟣 | Memory Fragment #1 | spawn-room |
| 110 | location | 🟢 | Processing Chamber | processing-chamber |
| 111 | object | 🔵 | Active Machine (EC2-unit-47) | processing-chamber |
| 112 | item | 🔴 | Repair Kit | processing-chamber |
| 115 | item | 🔴 | Repaired Communicator | processing-chamber |
| 116 | item | 🔴 | IAM Access Token | processing-chamber |
| 120 | location | 🟢 | Archive Room | archive-room |
| 121 | object | 🔵 | Network Diagram | archive-room |
| 123 | lore | 🟣 | Memory Fragment #2 | processing-chamber |
| 124 | penalty | ⚫ | Sparks fly | processing-chamber |
| 125 | item | 🔴 | Security Group Blueprint | archive-room |
| 130 | location | 🟢 | Gateway Antechamber | gateway-antechamber |
| 133 | item | 🔴 | Port Reference Card | gateway-antechamber |
| 134 | lore | 🟣 | Memory Fragment #3 | gateway-antechamber |
| 135 | event | 🟡 | Door opens | gateway-antechamber |
| 38 | lore | 🟣 | Memory Fragment #0 (hidden) | processing-chamber |
| 140 | location | 🟢 | Internet Gateway | internet-gateway |
| 142 | lore | 🟣 | Memory Fragment #4 | internet-gateway |
| 150 | event | 🟡 | Gateway activated | internet-gateway |
| 160 | location | 🟢 | Policy Vault | policy-vault |
| 161 | object | 🔵 | Policy Console | policy-vault |
| 162 | item | 🔴 | NACL Reference Sheet | policy-vault |
| 165 | item | 🔴 | Policy Token | policy-vault |
| 167 | lore | 🟣 | Memory Fragment #5 | policy-vault |
| 170 | location | 🟢 | NACL Corridor | nacl-corridor |
| 171 | object | 🔵 | NACL Control Panel | nacl-corridor |
| 172 | item | 🔴 | Power Routing Diagram | nacl-corridor |
| 173 | lore | 🟣 | Memory Fragment #6 | nacl-corridor |
| 175 | event | 🟡 | NACL configured | nacl-corridor |
| 180 | location | 🟢 | Wire Junction | wire-junction |
| 181 | object | 🔵 | Severed Power Cables | wire-junction |
| 183 | lore | 🟣 | Memory Fragment #7 | wire-junction |
| 185 | event | 🟡 | Power restored | wire-junction |

---

## Puzzles

| ID | Type | Room | UI | Answer |
|----|------|------|----|--------|
| log-analysis | log_lock | Spawn Room | log-lock | Select lines with vpc-0f8c3a, 6e6574776f726b, igw-abc123 |
| terminal-ec2 | terminal_lock | Processing Chamber | terminal-lock | `network` (hex decode of 6e6574776f726b) |
| hex-tool | tool | Processing Chamber | hex-decoder | Reusable hex-to-ASCII tool |
| terminal-archive | terminal_lock | Archive Room | terminal-lock | `security group` |
| keypad-vault | keypad_lock | Archive Room | keypad-lock | `7143` |
| policy-lock | policy_lock | Policy Vault | policy-lock | Allow / ec2:AuthorizeGatewayTransit / arn:aws:ec2:*:*:instance/* |
| audio-intercept | tool | Gateway Antechamber | audio-player | Reusable distorted voice message |
| slider-sg | terminal_lock | Gateway Antechamber | terminal-lock | Inbound: 443, Outbound: 0 |
| nacl-sg-lock | sg_lock | NACL Corridor | sg-lock | Toggle 4 rules: Allow/Deny/Allow/Deny |
| wire-junction | wire_lock | Wire Junction | wire-lock | Red→Power, Blue→Data, Green→Signal, Yellow→Ground |
| keypad-gateway | keypad_lock | Internet Gateway | keypad-lock | vpc-0f8c3a / igw-abc123 / 10.0.1.0/24 |

---

## Combinations

| Card A | Card B | Result | Type |
|--------|--------|--------|------|
| #112 Repair Kit | #103 Broken Communicator | #115 Repaired Communicator | ✅ item_object |
| #112 Repair Kit | #111 Active Machine | #124 Penalty (60s) | ❌ item_object |

---

## Timed Events

| Time Remaining | Event |
|---|---|
| 55:00 | Lights flicker briefly (atmosphere) |
| 45:00 | Distant rumbling — "The Purge is moving through outer zones" |
| 35:00 | **MID-EVENT:** Private Subnet locks (rooms 100, 110, 120, 160 inaccessible) |
| 20:00 | Lights pulse red in Gateway Antechamber |
| 10:00 | FINAL WARNING alarm |
| 5:00 | Screen edges glow red, heartbeat sound |

---

## Scoring

| Factor | Points |
|--------|--------|
| Escaped | 50 base |
| Time remaining | +1 per minute left |
| Hints used | -3 per hint |
| Penalties | -5 per penalty |
| Lore fragments (7 standard) | +3 each |
| Bonus lore (Card #38) | +5 |
| All lore found | +5 bonus |

| Stars | Score |
|-------|-------|
| ⭐⭐⭐⭐⭐ | 85+ |
| ⭐⭐⭐⭐ | 70–84 |
| ⭐⭐⭐ | 55–69 |
| ⭐⭐ | 40–54 |
| ⭐ | Completed |
