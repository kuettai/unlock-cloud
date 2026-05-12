---
name: challenge-mode
description: Guide for adding Normal/Challenge mode variants to puzzles. Use when reviewing puzzles in batches and designing difficulty overrides.
---

# Challenge Mode — Puzzle Review Process

## Overview

Every puzzle supports two modes: **Normal** (easier, more guidance) and **Challenge** (harder, less hand-holding). The mode is set globally via `localStorage('gameMode')` before the game starts.

## Architecture

### Engine (`app/engine.js`)
On load, if `gameMode === 'challenge'`:
- Puzzle `challenge.config` merges over `puzzle.config`
- Puzzle top-level `challenge` fields (e.g., `description`, `solution`, `hints`) override the puzzle object
- Card `challenge` fields override the card object (e.g., different descriptions)

### Data format in `puzzles.json`
```json
{
  "id": "my-puzzle",
  "description": "Normal description with hints",
  "config": { "answer": "easy", "showHelper": true },
  "challenge": {
    "description": "Vaguer description",
    "config": { "answer": "harder", "showHelper": false }
  }
}
```

### Data format in `cards.json`
```json
{
  "id": 42,
  "description": "Normal card text with clues",
  "challenge": {
    "description": "Card text with different/harder clues"
  }
}
```

### UI touchpoints
- **Home screen** (`home.html`): Normal/Challenge toggle buttons
- **Admin panel** (`admin.html`): Game Mode dropdown in Create Event
- **URL param**: `?gameMode=challenge` sets localStorage on game load

## Review Process (Batch of 3)

### Step 1: Propose (no code)
For each batch of 3 puzzles, propose challenge changes in a table:

| Puzzle | Normal | Challenge proposal |
|--------|--------|-------------------|
| puzzle-id | Current behavior | What changes |

Wait for user approval before coding.

### Step 2: Implement
After approval, add `challenge` keys to puzzles.json and cards.json as needed.

### Step 3: Verify
- Run `node --test tests/happy-path.test.js`
- Confirm all tests pass (normal mode tests should be unaffected)

## Challenge Design Patterns

### Make it harder WITHOUT changing the answer
- Remove `falseOutputs` (no helpful feedback on wrong guesses)
- Remove `accept_variations` (exact answer only)
- Remove `source_hint` from fields (player must recall from cards)
- Remove `showReference` (no cheat sheet)
- Vaguer `description` (remove fill-in-the-blank hints)
- Remove `auto_hint_after_seconds` (set to 9999)

### Make the puzzle mechanically harder
- **Grid puzzles**: more cells, more blocked areas, tighter constraints
- **Timing puzzles**: narrower hold window (e.g., 0.6–0.8 vs 0.4–1.2)
- **Wire puzzles**: more wires + decoy sockets, abbreviated labels
- **Maze puzzles**: larger grid, fewer max steps, higher bump penalty
- **Memory puzzles**: `revealed: false` (flip-card memory vs face-up matching)
- **Log/selection puzzles**: more noise lines, same number of correct answers
- **Sequence puzzles**: longer sequence, faster flash speed
- **Multi-step puzzles**: add extra steps/fields

### Make it harder through information design
- Move clues from puzzle description → card descriptions (player must read cards)
- Use abbreviated/cryptic labels that require deduction from collected cards
- Add decoy items that look similar but differ in a detail mentioned in story
- Remove icons so player must read labels (e.g., all items show 📦)

### Ensure solvability
- Every challenge puzzle MUST have clues available somewhere (cards, room descriptions, NPC dialog)
- If the puzzle changes the answer, update all cards that reference it
- For grid puzzles with unique solutions, verify with a solver script
- Challenge-specific `hints` can be added to guide stuck players

## Card Override Checklist

When a challenge puzzle changes data that appears on cards:
1. Find all cards referencing the changed value (`grep` the cards.json)
2. Add `challenge: { "description": "..." }` to those cards
3. Check room descriptions too (location cards) — they're visible before puzzles

## Example: Wire Puzzle Challenge

Normal: 3 wires with obvious labels → 3 sockets with obvious labels
```json
"config": {
  "wires": [{ "id": "power", "label": "Power" }],
  "sockets": [{ "id": "energy", "label": "Energy Port" }],
  "solution": { "power": "energy" }
}
```

Challenge: 5 wires with abbreviations → 6 sockets (1 decoy), clue on room card
```json
"challenge": {
  "config": {
    "wires": [{ "id": "power", "label": "PWR" }, ...],
    "sockets": [{ "id": "energy", "label": "V+" }, { "id": "null", "label": "NULL" }],
    "solution": { "power": "energy", ... }
  }
}
```
Room card gets: `"challenge": { "description": "...schematic: PWR→V+, ..." }`
