---
name: scenario-blueprint
description: Guide for writing scenario blueprints and generating JSON data files from them. Use when designing new episodes or converting a blueprint into playable scenario data.
---

# Scenario Blueprint

## Overview

A blueprint is a single markdown file that defines an entire episode's storyline, rooms, puzzles, combinations, and dependencies. It is the **source of truth** for scenario design. All JSON data files are generated from it.

Blueprints live in `docs/blueprints/<episode-id>.md`.

## Blueprint Sections

### 1. Meta

Episode metadata: number, title, arc, duration, players, difficulty, AWS topics, mechanics taught.

### 2. Narrative

Voice assignments (Polly voice ID + role) and every spoken line per section (intro, mid_event, ending) as a table with voice, line, and pause columns.

### 3. Room Graph

A one-line ASCII flow showing room connections, plus a table of unlock conditions:

```
[Room A] ──(how)──▶ [Room B] ──(how)──▶ [Room C]
```

For branching:
```
[Room A] ──▶ [Room B]
         ──▶ [Room C]
         ──▶ [Room D]
```

### 4. Room Details (per room)

For each room, define:

- **Description** — Room text shown to the player
- **Image** — Asset filename (`.png` for generated, `.svg` for hand-crafted)
- **Discoveries** — Table: label, card ID, type (🔴/🔵), title, optional `requires` gate, optional `consumes_item`
- **Puzzle** (if any) — ID, type, UI variant, solution, hints (3 tiers), solve steps
- **Combinations** — Table: item + object = result card, ✅ event / ❌ penalty, consumes list
- **Consumes** — Which cards are removed on success

### 5. Consume Mechanics

Cards can be consumed (removed from inventory/play) in three ways:

#### A. `consumes` on event/result cards (in cards.json)

When a combination succeeds and reveals a result card, that card's `consumes` array lists card IDs to remove from the player's inventory. This is the most common pattern — the items "used up" in the combination disappear.

```json
{
  "id": 5,
  "type": "event",
  "title": "Click.",
  "consumes": [2, 3],
  "reveals": [20, 10]
}
```

**When to use:** The combination physically uses up the items (key inserted into lock, ingredients mixed, items given to NPC). Both the item (red) and object (blue) used in the combination should typically be consumed.

**When NOT to consume:** If an item is reusable (a tool, a reference card, a badge that grants ongoing access). Only consume items that are logically "spent" by the action.

#### B. `consumes_item` on discoveries (in cards.json, on discovery entries)

When a discovery button is clicked, the listed items are removed from inventory as a cost. This happens BEFORE the discovery reveals its card.

```json
{
  "card_id": 30,
  "label": "Open the passage ahead",
  "requires_item": [33, 16],
  "consumes_item": [33, 16]
}
```

**When to use:** A discovery requires spending items to activate (give an item to an NPC, use a key to open a door, sacrifice materials). The items are gone after use.

**Design note:** `requires_item` gates visibility (button only appears when you have the items). `consumes_item` removes them on click. You almost always want both together — gate + consume. But you can have `requires_item` without `consumes_item` if the item is just needed as proof (show a badge) but not consumed.

#### C. Implicit consumption via combinations

When `tryCombination` succeeds, the engine calls `revealCard(result_card)`. If that result card has a `consumes` array, those cards are removed. The combination itself does NOT auto-consume the two cards used — you must explicitly list them in `consumes` on the result card.

### Consume Design Guidelines

1. **Always ask: is this item single-use or reusable?**
   - Single-use: keys, ingredients, fuel cells, offerings, evidence submitted → consume
   - Reusable: tools, badges, reference sheets, maps → don't consume

2. **Consume both sides of a combination** when the action physically merges/destroys them:
   - "Insert Power Cell into Device" → consumes both Power Cell and Device
   - "Show Badge to Guard" → consumes neither (badge is reusable, guard stays)

3. **Consume only the item side** when the object persists:
   - "Pour water into jar" → consumes water, jar remains for inspection
   - "Give letter to NPC" → consumes letter, NPC remains

4. **Use `consumes_item` on discoveries** for gate-and-spend patterns:
   - "Use the key on the locked door" → requires_item + consumes_item the key
   - "Give all evidence to the judge" → consumes multiple items at once

5. **Track the dependency chain** — never consume an item that is needed later by another puzzle or combination. Map out the full critical path before deciding what to consume.

6. **Consumed cards appear in the "Used" section** of the Interact screen, greyed out. Players can still see what they had. This is a UI feature, not something you need to configure.

### 5. Dependency Chain

ASCII flow diagram showing the critical path from START to END. Include optional/trap paths separately.

### 6. Card Index

Full table of every card: ID, type, color, title, room, image filename. Note the ID spacing strategy to avoid accidental collisions.

### 7. Scoring

Base score, time bonus, hint penalty, wrong combo penalty, and star thresholds.

## Card ID Conventions

- Space IDs so wrong combinations (sum of two IDs) don't land on valid cards
- Location cards: round numbers (1, 10, 30, 50, 100, 110...)
- Items/objects: near their room's location ID (room 10 → items 11, 12, 14)
- Events: sum of the combination that triggers them (3+2=5, 11+12=23)
- Penalties: sum of the wrong combination (11+14=25)
- Reserve 99 or 999 for ending events

## Generating JSON from a Blueprint

Given a completed blueprint, generate these files in `scenarios/<category>/<episode-id>/`:

| File | Source Section |
|------|---------------|
| `meta.json` | Meta |
| `narrative.json` | Narrative (voices + segments with pause/emphasis) |
| `cards.json` | Card Index + Room Details (discoveries, hidden_elements, puzzle_ref, reveals, consumes, consumes_item) |
| `rooms.json` | Room Graph (card_id, connects_to, unlocked_by, unlock_text, map_pos) |
| `combinations.json` | Room Details → Combinations tables |
| `puzzles.json` | Room Details → Puzzle definitions |
| `events.json` | Timed events from Room Graph + triggered events |

### puzzles.json Mandatory Field

Every puzzle MUST include a `mandatory` field:
- `"mandatory": true` — actual puzzles (locks, code entries, hidden elements) that block progression
- `"mandatory": false` — NPCs (`type: "tool"`, `ui: "npc-dialog"`), audio players, reusable tools

### puzzles.json isFinal Field

At least ONE puzzle per episode MUST have `"isFinal": true` — any puzzle that triggers an ending. Multiple puzzles can be `isFinal` if the episode has branching endings (e.g., different paths lead to different conclusions). This tells the backend the game is complete when ANY `isFinal` puzzle is solved.

These fields are used by the backend to track player progression and game completion.
| `scoring.json` | Scoring section |

### cards.json Consume Fields Checklist

When generating `cards.json`, for every event/result card ask:
1. What items were used to trigger this card? → add them to `"consumes": [...]`
2. Are those items single-use? If reusable, don't consume them.
3. Does any later puzzle/combination need these items? If yes, don't consume them.

For every discovery with `requires_item`, ask:
1. Is the required item spent by this action? → add `"consumes_item": [...]`
2. Or is it just shown/checked? → only `requires_item`, no consume.

After generating JSON, run:
- `python tools/narrative_to_voice.py scenarios/<category>/<episode-id>` — generate voice audio
- `python tools/cards_to_images.py scenarios/<category>/<episode-id>` — generate card artwork

## Folder Structure

### Isometric Map Layout

Rooms can define `map_pos: [x, y]` in `rooms.json` for a 2.5D isometric map view. If present, the map renders as tilted tiles with room images; otherwise falls back to a list view.

Coordinate space: 400×480px grid, tiles are 120×120px. Position is top-left corner of each tile.

Example layout for a café:
```json
{ "card_id": 1, "name": "Back Door", "map_pos": [140, 380] }
{ "card_id": 10, "name": "Store Room", "map_pos": [60, 280] }
{ "card_id": 20, "name": "Brew Station", "map_pos": [140, 180] }
{ "card_id": 30, "name": "Service Counter", "map_pos": [220, 280] }
{ "card_id": 40, "name": "The Floor", "map_pos": [140, 60] }
```

## Folder Structure

```
scenarios/
  categories.json          — list of categories with metadata
  <category>/
    index.json             — list of episode IDs in this category
    <episode-id>/
      meta.json
      narrative.json
      cards.json
      rooms.json
      combinations.json
      puzzles.json
      events.json
      scoring.json
      image-style.json
      assets/
        cover.png
        voice/
        *.png
```

Current categories: `aws` (3 episodes: ep0-boot-sequence, ep1-awakening, ep2-day-one)

## Reference

See `docs/blueprints/ep1-awakening.md` for a complete example.
