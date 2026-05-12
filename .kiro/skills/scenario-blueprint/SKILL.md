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
- **Discoveries** — Table: label, card ID, type (🔴/🔵), title, optional `requires` gate
- **Puzzle** (if any) — ID, type, UI variant, solution, hints (3 tiers), solve steps
- **Combinations** — Table: item + object = result card, ✅ event / ❌ penalty
- **Consumes** — Which cards are removed on success

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
| `cards.json` | Card Index + Room Details (discoveries, hidden_elements, puzzle_ref, reveals, consumes) |
| `rooms.json` | Room Graph (card_id, connects_to, unlocked_by, unlock_text, map_pos) |
| `combinations.json` | Room Details → Combinations tables |
| `puzzles.json` | Room Details → Puzzle definitions |
| `events.json` | Timed events from Room Graph + triggered events |
| `scoring.json` | Scoring section |

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
