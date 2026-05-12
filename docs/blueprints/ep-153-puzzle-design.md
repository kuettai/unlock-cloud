# EP 153 Fish — Puzzle Design Notes

## Overview

Prototype file: `app/puzzle-test-ep153.html`

Seven puzzles across 4 acts, each with distinct mechanics. The puzzles progress from hands-on café tasks (Act 1) to detective-style deduction (Act 3) to emotional revelation (Act 4).

---

## Puzzle Summary

| # | Nav Label | Panel ID | Act | Mechanic |
|---|-----------|----------|-----|----------|
| 1 | ☕ Grinder | grinder | 1 | Slider calibration — follow Manager's note, adjust grind/dose/yield, pull shot, hit 25-30s |
| 2 | 📦 Stock Count | stock | 1 | Memory game — memorize checklist (5s), grab from shelf, avoid bad items |
| 3 | 📝 Chalkboard | chalkboard | 1 | Letter-tap spelling — spell 3 menu items from scrambled letters |
| 4 | 🔍 Evidence | cups | 3 | Step-by-step number deduction (10 steps: cups + shots) |
| 5 | 🥛 Milk Jug | shots | 3 | Multi-mechanic deduction (shelf tap, timeline choice, card elimination) |
| 6 | ✝️ The Names | names | 4 | Realization cascade — 4 multiple-choice steps with cup glow + scene transition |
| 7 | 🐟 The Safe | net | 4 | 3-dial combination safe → net-filling animation reward |

---

## Puzzle 1: Grinder Calibration

**Panel ID:** `grinder`

### Mechanic:
- 3 sliders: Grind Size (1-9), Dose (1-9), Yield (1-9)
- Pull shot → animated extraction with timer
- Target: 25-30 seconds = perfect extraction
- Formula: `10 + grind*2.5 - dose*0.8 + yield*1.2 ± 1 random`

### How the player finds the answer:
- **Manager's sticky note** on the machine (yellow post-it, slightly rotated):
  > "Dial-in notes (Manager): Grind 7, Dose 5, Yield 4. Should pull ~27s."
- Default dials start WRONG (3:7:2 → ~14s, way too fast)
- Player must read the note and follow instructions — first act of obedience

### Narrative significance:
- The Manager left instructions *for you*. He knew you'd be alone today. He prepared.
- Mirrors "Cast your net on the right side" — obey without understanding why, and it works.
- Player doesn't realize the significance yet; in Act 4 they'll remember: He was already here.

### Feedback:
- Too fast (<25s): "⚡ Blonde & sour. Too fast — grind finer."
- Too slow (>30s): "🐌 Dark & bitter. Too slow — grind coarser."
- Perfect (25-30s): "✅ Golden crema. Balanced. Perfect."

---

## Puzzle 4: Evidence (Cup Count & Shot Recon)

**Panel ID:** `cups`

Combined puzzle — originally two separate panels (Cup Count + Shot Recon) merged because they had identical mechanics (fill-in-the-number deduction).

### 10 Steps:

**Cup evidence (steps 0-5):**
1. Count wash basin: 15 hot + 6 cold = **21**
2. Discover corner table (4 cups with names) → total = **25**
3. Cross-reference POS (17 transactions) → unaccounted = **8**
4. Of 21 washed, how many from your 17 sales? → **17**
5. Mystery cups in wash: 21 − 17 = **4**
6. Total drinks not made by you: 4 + 4 = **8**

**Shot counter evidence (steps 6-9):**
7. Count shots from order tickets → **13**
8. Add calibration shot → **14**
9. Add 4 mystery drinks → **18**
10. Unexplained shots: 21 − 18 = **3**

### Key narrative math:
- POS shows 17 transactions, $89 — cash matches perfectly
- 21 cups in wash = 17 yours + 4 served by "The Manager" (free, no POS entry)
- 4 cups on corner table = served AFTER the rush to unseen people (disciples)
- Shot counter: 21 total = 13 orders + 1 calibration + 4 mystery + 3 unexplained
- The Manager served WITHOUT charging — grace, not commerce

---

## Puzzle 5: The Third Milk Jug

**Panel ID:** `shots`

### Visual features:
- Persistent 3-jug display at top (updates as player progresses)
- Jugs start greyed out → A & B glow green ("You") → C glows red ("???")

### 5 Steps:
1. **Shelf interaction** — Store room shelf with 5 jugs, tap the 2 you took
2. **Timeline choice** — When was Jug C needed? → During the rush (8:15-10am)
3. **Card elimination** — 2×2 grid of suspects with icons, tap to flip/eliminate:
   - 👤 Customer → ❌ No store room code
   - 🚚 Delivery driver → ❌ No deliveries on Sundays
   - 🤔 You (forgot) → ❌ Both hands full during rush
   - 🔑 Someone with the code → ✅ Knows the layout, has access
4. **Number input** — Milk drinks from Jug C: 4 + 4 = **8**
5. **Final choice** — What does it prove? → Someone worked a full shift beside you

---

## Puzzle 6: The Names on the Cups

**Panel ID:** `names`

### Visual features:
- 4 cup cards at top, start dim (grey border)
- Each correct answer lights up one cup (gold glow, box-shadow)
- On completion: all cups turn green, scene transitions to warm sunrise palette
- Final scene: 🌅🔥🍞🐟 emoji shore, "Come and have breakfast" in gold
- 3-second pause between steps for emotional weight

### 4 Steps (realization cascade):
1. "Do you recognize these names?" → **Disciples of Jesus**
2. "What connects them?" → **A breakfast on the shore**
3. "What happened that morning?" → **Cast on the right side, net filled**
4. "What was waiting on the shore?" → **Breakfast — bread and fish on a charcoal fire**

### Design rationale:
- No Bible knowledge required — the puzzle TEACHES the passage through discovery
- Replaced a text-input "guess the verse reference" (tedious, trivia-based)
- Mirrors the character's emotional arc: confusion → recognition → awe

---

## Puzzle 7: The Cash Safe (153)

**Panel ID:** `net`

### Narrative framing:
End of shift cash drop. The Manager sets the safe code daily. You've never needed it — he always does closing. But today you're "alone." The note says: *"Today's code — you already saw it. The machine. The table. The jug."*

### Mechanic:
- 3 vertical swipeable number dials (0-9), drag to set
- Labels hint at source: "shot counter", "table number", "batch number"
- Circular handle to attempt opening
- Wrong: handle jiggles red, error message fades
- Correct (1-5-3): handle rotates 90°, glows green

### Reward animation:
- Net visual appears below the safe
- 🐟 fish emoji fill the net in accelerating batches (~3s)
- Counter ticks 0 → 153, color shifts blue → gold
- Net border glows gold when full
- 1.2s pause → closing monologue appears

### Clue planting (for actual game):
These numbers must be planted in earlier scenes:
- **1** — Shot counter briefly displays "1" before the player zeros it (Grinder scene)
- **5** — Corner table has number 5 on the table stand (Floor scene)
- **3** — Third milk jug batch label ends in 3 (Store Room scene)

---

## Design Principles

1. **No trivia** — Puzzles should be solvable from evidence presented, not prior knowledge
2. **Varied mechanics** — Each puzzle feels different (sliders, memory, spelling, deduction, elimination, cascade, dials)
3. **Narrative integration** — Every puzzle advances the story; the mechanic IS the story beat
4. **Visual anchors** — Each puzzle has something to look at beyond text (machine, shelf, cups, jugs, safe, net)
5. **Emotional pacing** — Act 1 is competence, Act 3 is unease, Act 4 is awe. Puzzles match the tone.
6. **Hints after 2 failures** — Number inputs show hints; choices show specific wrong-answer feedback
7. **Progressive revelation** — Information unfolds step by step, never dumped all at once
