# Game Systems — Time Pressure & Recurring Events

## Overview

The game runs on a countdown timer (typically 30-60 minutes). Beyond the main puzzle chain, several systems create urgency and engagement:

## 1. Countdown Timer

- Set in `meta.json` → `duration_minutes`
- Timer displayed in-game header
- Clamped to 0 (never goes negative)
- Time remaining affects final score (`scoring.json` → `time_bonus_per_minute`)
- Some NPCs cost time when consulted (`time_cost_seconds` in puzzle config)

## 2. Timed Events

Defined in `events.json` → `timed_events[]`. Fire at specific `time_remaining` thresholds.

| Type | Effect |
|---|---|
| `atmosphere` | Flavor text / NPC message (no gameplay impact) |
| `lockout` | Temporarily locks a room (e.g., storm closes the Bazaar for 2 minutes) |
| `alarm` | Warning message with urgency styling |
| `urgency` | Final countdown pressure messages |

## 3. Recurring Distractor — Café Orders (New)

A persistent side-activity that runs alongside the main puzzles. Designed for the café story arc.

### Concept
- Every ~60 seconds, a customer order appears
- Player must: pick cup type → add ingredients in correct order → serve
- Orders queue up (max 4). Ignoring them drops **sentiment**
- Serving correctly earns bonus points and keeps sentiment high

### Sentiment System
| Level | Emoji | Trigger |
|---|---|---|
| Happy | 😊 | Sentiment ≥ 80 |
| Neutral | 😐 | Sentiment 60-79 |
| Impatient | 😤 | Sentiment 40-59 |
| Angry | 😡 | Sentiment < 40 |

- Sentiment decays while orders wait in queue
- Sentiment recovers +10 per successful serve
- Drops -15 if queue overflows (>4 orders)
- Shown in game UI and end screen

### Recipes (9 drinks)
| Drink | Cup | Ingredients (in order) |
|---|---|---|
| Hot Americano | Hot | Espresso → Hot Water |
| Iced Americano | Cold | Ice → Espresso → Cold Water |
| Hot Latte | Hot | Espresso → Steamed Milk |
| Iced Latte | Cold | Ice → Espresso → Milk → Syrup |
| Matcha Latte | Cold | Ice → Matcha → Milk |
| Hot Tea | Hot | Tea Bag → Hot Water |
| Butterfly Pea Soda | Cold | Ice → Nata De Coco → Butterfly Pea → Soda Water → Lemon |
| Hot Chocolate | Hot | Cocoa → Hot Milk → Whipped Cream |
| Iced Chocolate | Cold | Ice → Cocoa → Milk → Chocolate Syrup |

### Validation Rules
- Cup must be full (5 layers)
- Required ingredients must appear in correct order
- Extra/duplicate ingredients are allowed (to fill the cup)
- Wrong cup or missing ingredients = redo (no penalty, just try again)

### Visual Design
- Transparent cup fills with colored layers (bottom-up)
- Ingredient palette grouped into categories (2-column grid)
- Color legend beside the cup
- Order queue shows wait time per customer

### Integration Points
- Each serve fires a leaderboard event (`drink_served`)
- Total drinks served shown in end screen
- Sentiment shown in end screen
- Does NOT gate any puzzles — purely optional bonus activity

### Design Intent
- Creates **context-switching pressure** — players must decide: solve the main puzzle or serve the waiting customer?
- Rewards **memorization** — players learn recipes over time
- Adds **ambient urgency** without blocking progress
- Multiplayer: one player can "run the café" while others solve puzzles

## 4. Penalty Combinations

Defined in `combinations.json`. Combining wrong cards triggers:
- Time penalty (`penalty_seconds`)
- Flavor text explaining why it failed
- Cards are NOT consumed (can retry)

## 5. NPC Time Costs

Some NPCs in `puzzles.json` have `time_cost_seconds: 60`. Opening them deducts time from the clock. This represents "investing time" to get information — a tradeoff.

## Prototype

The café order system is prototyped in `puzzle-rogue.html` (☕ tab). The component will be `app/puzzle/cafe-order-lock.js` when deployed.
