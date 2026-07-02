---
name: episode-review
description: Structured review process for validating episode quality — story, learning, clues, technical integrity, and puzzle engagement. Use when reviewing a new or modified episode before deployment.
---

# Episode Review Skill

## When to Use

- After a new episode's JSON files are generated
- After significant changes to cards, puzzles, or events
- Before deployment (QA Agent should invoke this)
- When user asks to "review" an episode

## Review Process

### Phase 1: Load All Data

Read these files from `scenarios/<category>/<episode>/`:

1. `meta.json` — episode metadata, topics, mechanics
2. `rooms.json` — room graph, unlock conditions
3. `narrative.json` — voice segments, story beats
4. `cards.json` — all cards (locations, items, objects, events, lore, tools)
5. `puzzles.json` — all puzzle configs with hints and challenge variants
6. `events.json` — timed and triggered events
7. `combinations.json` — card combination recipes
8. `scoring.json` — score formula, lore IDs, star thresholds

### Phase 2: Technical Validation (automated checks)

Run these cross-reference checks programmatically:

```python
# 1. Every puzzle referenced in discoveries exists in puzzles.json
for card in cards:
    for discovery in card.discoveries:
        assert discovery.puzzle in puzzle_ids

# 2. Every card_ref and success_card points to an existing card
for puzzle in puzzles:
    assert puzzle.card_ref in card_ids
    if puzzle.success_card:
        assert puzzle.success_card in card_ids

# 3. Every triggered event references an existing puzzle
for event in triggered_events:
    assert event.puzzle_id in puzzle_ids

# 4. Every reveals, requires_item, consumes_item points to existing cards
for card in cards:
    for r in card.reveals: assert r in card_ids
    for d in card.discoveries:
        for ri in d.requires_item: assert ri in card_ids
        for ci in d.consumes_item: assert ci in card_ids

# 5. Every lore card is reachable (revealed by at least one card)
lore_ids = {c.id for c in cards if c.type == 'lore'}
revealed_lore = {r for c in cards for r in c.reveals if r in lore_ids}
assert lore_ids == revealed_lore

# 6. Scoring lore_ids all exist
for lid in scoring.lore_ids: assert lid in card_ids

# 7. Combination card_a, card_b, result_card all exist
for combo in combinations:
    assert combo.card_a in card_ids
    assert combo.card_b in card_ids
    assert combo.result_card in card_ids

# 8. At least one card has is_ending: true
assert any(c.is_ending for c in cards)

# 9. At least one puzzle has isFinal: true
assert any(p.isFinal for p in puzzles)
```

Report any failures before proceeding.

### Phase 3: Story & Structure Review

Assess the narrative flow:

1. **Map the room graph** — draw the room unlock flow showing dependencies
2. **Identify the critical path** — which puzzles MUST be solved to reach the ending?
3. **Check pacing** — does each room escalate tension? Are there breather moments?
4. **Evaluate NPCs** — does every NPC give information needed for a subsequent puzzle?
5. **Assess endings** — does success connect all threads? Does failure acknowledge progress?

### Phase 4: Clue Chain Analysis

For EACH mandatory puzzle, trace:

1. **What is the answer?** (from puzzle config)
2. **Where is the answer available in-game?** (which cards, NPC dialogs, room descriptions)
3. **How many independent clue sources exist?** (minimum 2 required)
4. **Do hints escalate properly?** (conceptual → specific → explicit)
5. **Do false outputs teach?** (redirect toward correct reasoning, not just "wrong")

Flag any puzzle where:
- The answer requires external knowledge not available in-game
- Only one clue source exists (single point of failure)
- Hints jump straight to the answer without teaching

### Phase 5: Learning Design Assessment

For each topic listed in `meta.json`:

1. **Which puzzle teaches it?** Map topic → puzzle
2. **Does the player PERFORM the concept?** (not just read about it)
3. **Does the puzzle type fit the concept?** (ordering → timeline/sort, wiring → wire-lock, etc.)
4. **Do lore fragments deepen understanding?** (explain WHY, not just WHAT)

### Phase 6: Item & Dependency Flow

1. **Trace every item's lifecycle:**
   - Created by: (discovery or puzzle solve)
   - Used as gate for: (requires_item on which discoveries)
   - Consumed by: (consumes_item or consumes on result cards)
   - Status at end: (consumed, or still in inventory)

2. **Check for orphaned items** — items that are never consumed and never gate anything
3. **Check for premature consumption** — items consumed before their last use
4. **Check for dead ends** — gates that can never be satisfied

### Phase 7: Scoring with Rubric

Apply the rubric from `docs/episode-review-rubric.md`:

- **A. Story & Structure** (5 criteria, max 15)
- **B. Learning Design** (4 criteria, max 12)
- **C. Clue Design** (5 criteria, max 15)
- **D. Technical Integrity** (5 criteria, max 15)
- **E. Puzzle Variety & Engagement** (4 criteria, max 12)
- **F. Item & Dependency Flow** (3 criteria, max 9)

**Total: /78**

| Range | Rating | Action |
|-------|--------|--------|
| 70–78 | Ship-ready | Deploy |
| 60–69 | Minor fixes needed | Fix and re-review |
| 45–59 | Significant gaps | Rework with Blueprint Developer |
| <45 | Not playable | Return to Story Creative |

### Phase 8: Report

Output format:

```markdown
# Episode Review: [Title]

## Technical Validation
- [PASS/FAIL with details]

## Story Structure
- Room flow diagram (ASCII)
- Critical path summary
- NPC information delivery assessment

## Clue Chain Analysis
| Puzzle | Answer | Clue Sources | Gaps |
|--------|--------|--------------|------|

## Learning Coverage
| Topic | Puzzle | Type Match | Learn-by-doing |
|-------|--------|-----------|----------------|

## Issues Found
1. [CRITICAL] ...
2. [MINOR] ...

## Rubric Score: XX/78 — [Rating]

## Recommended Fixes
1. ...
```

## Common Issues Checklist

Issues found across reviewed episodes — check these first:

- [ ] Orphaned puzzles (in puzzles.json but no discovery entry)
- [ ] Events referencing renamed/deleted puzzle IDs
- [ ] Lore cards defined but never revealed by any card
- [ ] Cards defined but never discoverable or revealed
- [ ] `requires_item` referencing items the player can't obtain before that point
- [ ] Puzzle item names that don't reinforce the educational concept
- [ ] Missing `isFinal: true` on the ending puzzle
- [ ] Missing `mandatory` field on puzzles
- [ ] `meta.json` listing mechanics that aren't actually used
- [ ] Deployment Runbook / reference cards with no discovery entry

## Integration with Other Agents

- **QA Agent** should run this review before deployment
- **Scenario Data Agent** should run Phase 2 after generating JSON
- **Blueprint Developer** should reference the rubric when designing
- **Master Agent** should gate deployment on a score ≥70
