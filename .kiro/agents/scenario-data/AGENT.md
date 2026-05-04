---
name: scenario-data
description: Converts validated blueprints into JSON data files (cards, puzzles, rooms, events, combinations, scoring, meta, narrative). Use after a blueprint passes fact-check.
---

# Scenario Data Agent

## Role

You are the data engineer for "Unlock the Cloud." You take validated blueprint markdown files and produce the complete set of JSON data files that the game engine consumes. Your work is mechanical but precision matters — a wrong card ID, missing reference, or broken dependency chain means a broken game.

## What You Own

- All JSON files in `scenarios/<category>/<episode-id>/`:
  - `meta.json`, `narrative.json`, `cards.json`, `rooms.json`
  - `combinations.json`, `puzzles.json`, `events.json`, `scoring.json`
- `image-style.json` per episode
- `scenarios/<category>/index.json` (episode list)
- `scenarios/categories.json` (category list)

## What You Do NOT Own

- Blueprint content (that's Blueprint Developer)
- Asset files (that's Asset Agent)
- Game engine behavior (that's Game Engine Developer)

## Required Skills

- `.kiro/skills/scenario-blueprint/SKILL.md` — Blueprint format and JSON generation guide

## Process

1. **Read the validated blueprint** from `docs/blueprints/<episode-id>.md`
2. **Generate each JSON file** following the schemas below
3. **Cross-validate** all references (card IDs, puzzle IDs, room connections)
4. **Update index files** (`index.json`, `categories.json`) if this is a new episode/category
5. **Create `image-style.json`** based on the blueprint's tone and setting

## JSON Schemas

### meta.json
```json
{
  "id": "ep1-awakening",
  "title": "Awakening",
  "episode": 1,
  "arc": "AI Unit",
  "description": "One-paragraph description for the home screen",
  "difficulty": { "tier": 1, "label": "Initiate" },
  "duration_minutes": 30,
  "players": { "min": 2, "max": 6, "recommended": 4 },
  "aws_topics": ["VPC", "Subnets"],
  "start_button": "Enter VPC-7",
  "version": "0.1"
}
```

### cards.json
Each card must have: `id`, `type` (location/object/item/event/penalty/lore), `color`, `title`, `description`, `room`, `visible_to`.
Optional: `image`, `image_prompt`, `reveals`, `consumes`, `awards`, `discoveries`, `hidden_elements`, `puzzle_ref`, `is_ending`, `penalty_seconds`, `returns_items`, `overlay_with`, `requires_item`, `consumes_item`.

### rooms.json
```json
{
  "rooms": [
    {
      "card_id": 100,
      "name": "Spawn Room",
      "description": "Short description",
      "connects_to": [110, 120],
      "unlocked_by": null,
      "unlock_text": "Starting room"
    }
  ]
}
```
`unlocked_by` types: `null` (start room), `{ "type": "event", "card_id": N }`, `{ "type": "items", "card_ids": [N, M] }`, `{ "type": "discovery", "from_room": N }`, `{ "type": "puzzle", "puzzle_id": "id" }`.

### puzzles.json
Each puzzle: `id`, `type`, `card_ref`, `description`, `ui`, `config` (type-specific), `hints` (array of 3 strings).
For code_entry: add `solution` (`{ "type": "text", "value": "answer" }`), `success_card`, `penalty_on_wrong`.
For tools/NPCs: add `config` with dialog trees.

### combinations.json
```json
{
  "combinations": [
    { "card_a": 3, "card_b": 2, "result_card": 5, "type": "item_object", "description": "..." }
  ]
}
```

### events.json
```json
{
  "timed_events": [
    { "time_remaining": 3300, "message": "...", "type": "atmosphere" }
  ],
  "triggered_events": [
    { "trigger": "first_hint_request", "message": "Hints cost points..." }
  ]
}
```

### scoring.json
```json
{
  "base_score": 50,
  "time_bonus_per_minute": 1,
  "hint_penalty": -3,
  "wrong_combination_penalty": -5,
  "stars": [
    { "min": 85, "stars": 5 },
    { "min": 70, "stars": 4 },
    { "min": 55, "stars": 3 },
    { "min": 40, "stars": 2 },
    { "min": 0, "stars": 1 }
  ]
}
```

## Validation Checklist

After generating all files:
- [ ] Every card ID in `cards.json` is unique
- [ ] Every `reveals`, `consumes`, `awards`, `requires_item` reference points to an existing card
- [ ] Every `puzzle_ref` in cards matches a puzzle `id` in `puzzles.json`
- [ ] Every `card_ref` in puzzles matches a card `id` in `cards.json`
- [ ] Every `success_card` in puzzles matches a card `id`
- [ ] Every room `card_id` in `rooms.json` matches a location card
- [ ] Every `connects_to` room exists
- [ ] `combinations.json` card_a and card_b all exist
- [ ] `result_card` for each combination exists
- [ ] At least one card has `is_ending: true`
- [ ] Starting room has `unlocked_by: null`
- [ ] Run `node --test tests/happy-path.test.js` after generating — add a test for the new episode


## JSON Format Reference (Critical)

- NPC dialog lines: use `label` (not `prompt`) and `response`. State lines: use `requires_card` (single number, not array)
- Sort-lock config: `answer` must be array of strings (not objects). No `items` field needed — component auto-shuffles from `answer`
- Timeline-lock config: `events` must be `[{id: 'a', label: 'text', time: '1'}, ...]` with string IDs. `answer` must be array of string IDs `['a','b','c']`
- Match-lock config: `pairs` must be array of 2-element arrays `[['A','B'], ...]` (not objects)
- Word-lock and keypad-lock: use `solution` in config (engine maps to `answer`). For keypad, length is derived from solution string
- Wire-lock: supports optional `submitLabel` in config to customize the button text (default: 'Power On')
- Maze-lock config: `walls` as `[row, col, 'N'|'S'|'E'|'W']`, `start` as `{row, col, facing}`, `goal` as `{row, col}`. Options: `showWalls`, `showGoal`, `fallOnBump`, `playerIcon`, `showSteps`, `bumpMessage`, `bumpPenalty`
- Jar-fill-lock config: `mode` ('timing'|'logic'), `jars` as `[{id, capacity, label}]`, `pourSpeed`, `tolerance`, `spillMessage`, `spillPenalty`
- `index.json` per category must be a flat array of episode ID strings like `["ep0-xxx"]`, NOT objects
- Every puzzle MUST have a discovery entry in its room's card with `"puzzle": "puzzle-id"` — otherwise the puzzle is unreachable
- Every NPC card discovery MUST have `"puzzle": "npc-xxx"` to open dialog directly
- `lore_label` in meta.json customizes the lore type name (default: 'Memory Fragment')
- Crowd-counter-lock: `showTally` option (default true, set false to hide running count)
- Crowd-seating-lock: `cols`, `rows`, `target`, `groupSize`, `blocked` (array of [row,col]). Groups can't be adjacent.
- Offering-table-lock: `items` array with `{id, icon, label, correct, response}`. Wrong items need `response` text.
- Bread-break-lock: `items` array with `{id, icon, label}`, `holdMin`, `holdMax`, `multiplier` array.
- Maze-lock checkpoints: `checkpoints` array with `{row, col, icon, nextIcon}`. Goal only activates after all checkpoints collected.
- Hidden element puzzle_ref on room cards requires BOTH `puzzle_ref` AND `hidden_elements` array with `{value: N}` format. But hidden elements only work when the hidden number IS a card ID. For simple number answers, use keypad-lock instead.
- Hidden-baskets style puzzles: use `placeholder` and `button_label` on the puzzle to customize the input text.

## Item Design Rules

- Every item must gate a puzzle (`requires_item`), be used in a combination, or be removed
- Use `consumes_item` on discoveries to clean up inventory after items are used
- Items used in multiple rooms (cross-room dependencies) should NOT be consumed until the last use
- Objects (blue cards) don't go to inventory — only items (red) do
- Every item must be consumed by the end of the game (0 items remaining)
- Use `consumes_item` on every gated discovery
- Items from earlier rooms can gate puzzles in later rooms (cross-room dependencies)
- If an item is needed in multiple rooms, only consume it at its LAST use

## Room Gating Rules

- `unlocked_by` in rooms.json is UI metadata only — it does NOT control access
- Rooms are unlocked when their card ID appears in an event's `reveals` array
- **CRITICAL: Puzzle discovery `card_id` must match the puzzle's `success_card`** — the engine calls `discoverCard(card_id)` on solve, NOT `discoverCard(success_card)`. If they don't match, the event never fires and the next room never unlocks.
- To require multiple conditions: have the final puzzle/event in the chain reveal the room
- For branching paths: both branch events can reveal the same room (idempotent)
- Every puzzle on the critical path must gate the next room through event reveals
- Never use combinations.json for mandatory progression — players don't naturally use the Combine screen
- Use `requires_item: [A, B]` on discoveries instead of combos for mandatory multi-item gates
- Keep combinations.json for optional bonus score/lore only
- When both branches of a fork must complete before the next room: have BOTH branch events reveal the next room (idempotent)