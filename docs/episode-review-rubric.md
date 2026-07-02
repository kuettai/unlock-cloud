# Episode Review Rubric

## Scoring: 0–3 per criterion

| Score | Meaning |
|-------|---------|
| 3 | Excellent — no issues, exemplary design |
| 2 | Good — minor issues, works correctly |
| 1 | Weak — functional but has gaps or confusion |
| 0 | Broken — missing, unreachable, or incorrect |

---

## A. STORY & STRUCTURE (max 15)

| # | Criterion | What to check |
|---|-----------|---------------|
| A1 | **Narrative arc** | Does the story have setup → rising tension → climax → resolution? Does the timer feel real in-fiction? |
| A2 | **Metaphor clarity** | Is the real-world/educational domain clearly mapped to the in-game world? Can a player articulate "X in-game = Y in real life"? |
| A3 | **Pacing & room flow** | Does difficulty escalate across rooms? Does each room have a distinct narrative purpose? Are there natural breather moments? |
| A4 | **Character purpose** | Does every NPC provide information the player NEEDS? Do NPCs have distinct voices and roles? |
| A5 | **Ending payoff** | Does the success ending connect the dots? Does failure feel narrative (not just "time ran out")? |

---

## B. LEARNING DESIGN (max 12)

| # | Criterion | What to check |
|---|-----------|---------------|
| B1 | **Concept coverage** | Does every listed topic in meta.json have at least one puzzle that teaches it? No gaps? |
| B2 | **Puzzle–concept alignment** | Does the puzzle TYPE match the concept? (Ordering → sort/timeline, Configuration → wire/sg, Identification → match/log) |
| B3 | **Learn-by-doing** | Does the player PERFORM the concept (not just read about it)? Do wrong answers teach through feedback? |
| B4 | **Lore depth** | Do lore fragments explain WHY, not just WHAT? Do they connect in-game actions to real-world meaning? |

---

## C. CLUE DESIGN (max 15)

| # | Criterion | What to check |
|---|-----------|---------------|
| C1 | **Every puzzle is solvable from in-game info** | Can the answer be derived without external knowledge? Are there at least 2 clue sources per puzzle? |
| C2 | **Hint progression** | 3 tiers: conceptual → specific → explicit? Do hints teach reasoning, not just give answers? |
| C3 | **Cross-card observation** | Are clues spread across multiple cards/rooms that the player must synthesize? |
| C4 | **NPC clue delivery** | Do NPCs give key information BEFORE the player needs it? Are state_lines timed to progression? |
| C5 | **False output pedagogy** | Do wrong-answer messages teach (not just say "wrong")? Do they redirect toward the correct reasoning? |

---

## D. TECHNICAL INTEGRITY (max 15)

| # | Criterion | What to check |
|---|-----------|---------------|
| D1 | **All puzzle IDs reachable** | Every puzzle in puzzles.json has a matching discovery entry with `"puzzle": "id"` |
| D2 | **All card references valid** | `reveals`, `requires_item`, `consumes_item`, `card_ref`, `success_card` all point to existing cards |
| D3 | **Event chain complete** | Every mandatory puzzle has a triggered_event. The final puzzle fires an ending event. |
| D4 | **Lore discoverable** | Every lore card is revealed by at least one card or discovery. Scoring `lore_ids` all exist. |
| D5 | **Item lifecycle complete** | Every item is either consumed, used as a gate, or present at game end. No orphaned items cluttering inventory. |

---

## E. PUZZLE VARIETY & ENGAGEMENT (max 12)

| # | Criterion | What to check |
|---|-----------|---------------|
| E1 | **Mechanic diversity** | Are at least 4 distinct puzzle types used? No excessive repetition of the same lock? |
| E2 | **Difficulty curve** | Do early puzzles teach mechanics used in later puzzles? Does the hardest puzzle come in the final room? |
| E3 | **Challenge mode** | Do challenge variants make puzzles harder WITHOUT changing answers (remove hints, add decoys, tighten constraints)? |
| E4 | **Time pressure design** | Do timed events create narrative urgency without making puzzles impossible? Is the timer fair for the content volume? |

---

## F. ITEM & DEPENDENCY FLOW (max 9)

| # | Criterion | What to check |
|---|-----------|---------------|
| F1 | **Critical path completable** | Can the game be finished following ONLY mandatory puzzles? No dead ends or circular dependencies? |
| F2 | **Gating logic** | Do `requires_item` gates make narrative sense? Does the player understand WHY they need item X before action Y? |
| F3 | **Consumption hygiene** | Are items consumed at the right time (last use)? Is inventory clean by end? Do `consumes_item` entries match `requires_item`? |

---

## TOTAL: /78

| Range | Rating |
|-------|--------|
| 70–78 | Ship-ready |
| 60–69 | Minor fixes needed |
| 45–59 | Significant gaps — needs rework |
| <45 | Not playable |

---

## Episode Scores

| Criterion | EP2 153 Fish | EP3 King's Errand | EP4 Spec Architect |
|-----------|:---:|:---:|:---:|
| **A1** Narrative arc | 3 | 3 | 3 |
| **A2** Metaphor clarity | 3 | 3 | 3 |
| **A3** Pacing & room flow | 3 | 3 | 3 |
| **A4** Character purpose | 3 | 3 | 3 |
| **A5** Ending payoff | 3 | 3 | 2 |
| **B1** Concept coverage | 3 | 3 | 3 |
| **B2** Puzzle–concept alignment | 3 | 3 | 3 |
| **B3** Learn-by-doing | 3 | 3 | 3 |
| **B4** Lore depth | 3 | 3 | 3 |
| **C1** Solvable from in-game | 3 | 3 | 3 |
| **C2** Hint progression | 3 | 3 | 3 |
| **C3** Cross-card observation | 3 | 2 | 2 |
| **C4** NPC clue delivery | 3 | 3 | 3 |
| **C5** False output pedagogy | 3 | 3 | 3 |
| **D1** Puzzles reachable | 3 | 3 | 3 |
| **D2** Card references valid | 3 | 3 | 3 |
| **D3** Event chain complete | 3 | 3 | 3 |
| **D4** Lore discoverable | 3 | 3 | 3 |
| **D5** Item lifecycle | 3 | 2 | 3 |
| **E1** Mechanic diversity | 3 | 3 | 3 |
| **E2** Difficulty curve | 3 | 3 | 3 |
| **E3** Challenge mode | N/A | N/A | 3 |
| **E4** Time pressure | 3 | 3 | 3 |
| **F1** Critical path | 3 | 3 | 3 |
| **F2** Gating logic | 3 | 3 | 3 |
| **F3** Consumption hygiene | 3 | 2 | 3 |
| **TOTAL** | **78/78** | **70/78** | **75/78** |
