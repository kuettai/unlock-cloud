# EP3 — The King's Errand: Puzzle Sequence Guide

## Overview

12 puzzles across 5 errands + 1 capstone. The Champion Equipment Rack is accessible early and revisited throughout.

```
                         ┌─────────────────────────────────────────────┐
                         │          CHAMPION EQUIPMENT RACK            │
                         │   (accessible early, revisit after each     │
                         │    errand — gear upgrades progressively)    │
                         └──────────────────┬──────────────────────────┘
                                            │ upgrades from ↓
    ┌───────────────────────────────────────┼───────────────────────────────────┐
    │                                       │                                   │
    ▼                                       ▼                                   ▼

 ═══════════════════════════════════════════════════════════════════════════════════
  TUTORIAL                    ERRAND 1                    ERRAND 2
 ═══════════════════════════════════════════════════════════════════════════════════

 ┌──────────────┐        ┌──────────────┐           ┌──────────────┐
 │ 1. FIRST     │        │ 3. BAZAAR    │           │ 2. GATE      │
 │    COMMAND   │        │    RECRUIT   │           │    WIRING    │
 │              │        │              │           │              │
 │ terminal-lock│        │ bazaar-lock  │           │  wire-lock   │
 │ "Type the    │        │ "Pick the    │           │ "Connect 3   │
 │  right cmd"  │        │  right ally" │           │  conduits"   │
 │              │        │              │           │              │
 │ 🎯 Specificity│       │ 🎯 Model      │           │ 🎯 MCP/Tools  │
 └──────┬───────┘        │   Selection  │           └──────┬───────┘
        │                └──────┬───────┘                  │
        │                       │                          │
        │                       ▼                          ▼
        │                ┌──────────────┐           ┌──────────────┐
        │                │ 4. RECIPE    │           │ 5. NEGOTIA-  │
        │                │    SORT      │           │    TION      │
        │                │              │           │              │
        │                │  sort-lock   │           │ deck-battle  │
        │                │ "Order the   │           │ "Play cards  │
        │                │  courses"    │           │  vs merchant"│
        │                │              │           │              │
        │                │ 🎯 Reasoning  │           │ 🎯 Nova Sonic │
        │                └──────────────┘           │   Protocol   │
        │                                           └──────────────┘
        │
        ▼
 ═══════════════════════════════════════════════════════════════════════════════════
  ERRAND 3                         ERRAND 4
 ═══════════════════════════════════════════════════════════════════════════════════

 ┌──────────────┐  ┌──────────────┐    ┌──────────────┐  ┌──────────────┐
 │ 6. KING'S    │  │ 7. STAGE     │    │ 8. MEMORY    │  │ 9. CODE OF   │
 │    SEAL      │  │    ASSIGN    │    │    TIMELINE  │  │    HONOR     │
 │              │  │              │    │              │  │              │
 │ scroll-lock  │  │  arch-lock   │    │timeline-lock │  │   sg-lock    │
 │ "Fill in the │  │ "Drag acts   │    │ "Order the   │  │ "Toggle      │
 │  policy"     │  │  to stages"  │    │  crystals"   │  │  guardrails" │
 │              │  │              │    │              │  │              │
 │ 🎯 Cedar      │  │ 🎯 Tool Use   │    │ 🎯 AgentCore  │  │ 🎯 Bedrock    │
 │   Policy     │  │   (Nova Act) │    │   Memory    │  │   Guardrails │
 └──────┬───────┘  └──────────────┘    └──────┬───────┘  └──────┬───────┘
        │                                      │                  │
        │                                      ▼                  │
        │                               ┌──────────────┐          │
        │                               │10. STALL     │          │
        │                               │   DESIGN     │◀─────────┘
        │                               │              │
        │                               │ match-lock   │
        │                               │ "Match pairs │
        │                               │  to houses"  │
        │                               │              │
        │                               │ 🎯 Image Gen  │
        │                               │  (Nova Canvas)│
        │                               └──────────────┘
        │
        ▼
 ═══════════════════════════════════════════════════════════════════════════════════
  ERRAND 5 — THE PROVING GROUND (Capstone)
 ═══════════════════════════════════════════════════════════════════════════════════

 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                                                                             │
 │  ┌──────────────────────┐              ┌──────────────────────┐            │
 │  │ 11. EQUIPMENT RACK   │              │ 12. REHEARSAL RUN    │            │
 │  │     (Blind Build)    │              │     (Optimization)   │            │
 │  │                      │              │                      │            │
 │  │  equipment-rack-lock │    ────▶     │  equipment-rack-lock │            │
 │  │  "Arrange gear       │              │  "Reach Soars tier   │            │
 │  │   blindly, reach     │              │   with numbers       │            │
 │  │   Strides tier"      │              │   visible"           │            │
 │  │                      │              │                      │            │
 │  │  🎯 Agent Assembly    │              │  🎯 Observability     │            │
 │  │    (AgentCore)       │              │    + Optimization    │            │
 │  └──────────────────────┘              └──────────────────────┘            │
 │                                                                             │
 │  Stats hidden (blind)                   Stats revealed (Herald's Ledger)    │
 │  Target: Strides (≥65)                  Target: Soars (≥100)               │
 │  30s cooldown between deploys           Flat before mult = optimal         │
 │                                                                             │
 └─────────────────────────────────────────────────────────────────────────────┘
                                            │
                                            ▼
                                     🎉 FESTIVAL READY
```

## Puzzle Variety Summary

| # | Puzzle | Type | Mechanic | Interaction |
|---|--------|------|----------|-------------|
| 1 | First Command | terminal-lock | Type a command | Text input |
| 2 | Gate Wiring | wire-lock | Drag wires to sockets | Drag & connect |
| 3 | Bazaar Recruit | bazaar-lock | Assign quest to merchant | Select & assign |
| 4 | Recipe Sort | sort-lock | Drag to reorder | Drag reorder |
| 5 | Negotiation | deck-battle-lock | Play cards vs merchant | Card selection |
| 6 | King's Seal | scroll-lock | Fill-in-the-blank policy | Dropdown select |
| 7 | Stage Assign | arch-lock | Drag performers to zones | Drag & drop |
| 8 | Memory Timeline | timeline-lock | Tap to swap chronologically | Tap swap |
| 9 | Code of Honor | sg-lock | Toggle allow/deny rules | Toggle switches |
| 10 | Stall Design | match-lock | Match pairs | Flip & match |
| 11 | Equipment Rack | equipment-rack-lock | Arrange/enable blindly | Drag + toggle |
| 12 | Rehearsal Run | equipment-rack-lock | Optimize with numbers | Drag + toggle |

## Mechanic Diversity (no two adjacent puzzles share a mechanic)

```
Type text → Drag wires → Select ally → Drag order → Play cards →
Fill blanks → Drag zones → Tap swap → Toggle rules → Flip match →
Blind arrange → Optimize arrange
```

## Roguelike-Inspired Puzzles

| Puzzle | Inspiration | Key Design |
|--------|-------------|------------|
| Equipment Rack | **Balatro** | Hidden stats, order matters (flat before mult), blind experimentation, 30s cooldown, tier impressions |
| Rehearsal Run | **Balatro** | Same rack with numbers revealed (Observability), pure optimization |
| Negotiation | **Slay the Spire** | Draw 4 play 2, merchant with rotating attack/block pattern, gold=HP, walk away option |

## Shared Progression System

```
Quest completed ──┬──▶ Equipment slot upgraded (Balatro)
                  │
                  └──▶ New card added to deck (STS)

Example: Complete "Gate Wiring"
  → Armor upgrades: Broken Heavy Armor (÷3) → Light Armor (+4)
  → Card added: "Gate Knowledge" (🛡️ Composure 3)
```

## Player Decision Points

| Moment | Decision | Tradeoff |
|--------|----------|----------|
| Equipment Rack (early) | Enable cursed gear or disable? | More slots = more potential, but penalties hurt |
| Negotiation | Play 2 Persuasion or split with Composure? | Fast win vs. save gold |
| Negotiation | Walk away or push through? | Retry later with better deck vs. spend gold now |
| Equipment Rack (late) | Which order for flat/mult? | Optimization puzzle once numbers visible |
| Bazaar Recruit | Spend more for gold tier? | Better puzzle help vs. save budget |
