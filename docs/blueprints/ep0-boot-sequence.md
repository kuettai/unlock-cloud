# Scenario Blueprint: Episode 0 — Boot Sequence (v2)

## Meta

- **Episode:** 0
- **Title:** Boot Sequence
- **Arc:** Tutorial
- **Duration:** 10 minutes
- **Players:** 1–6
- **Difficulty:** Tutorial
- **AWS Topics:** None (teaches game mechanics only)
- **Mechanics Taught:** discoveries, puzzle components (sequence-lock), card combination, penalties, map navigation, hidden elements, code entry (word-lock), hints

---

## Narrative

### Voices

| Key | Polly Voice | Role |
|-----|-------------|------|
| system | Matthew | Diagnostic AI — calm, authoritative |
| narrator | Joanna | Story narrator — warm, guiding |

### Intro

| Voice | Line | Pause |
|-------|------|-------|
| system | System boot initiated. | 1000ms |
| system | AI Unit detected. Running diagnostic. | 800ms |
| narrator | Welcome, Unit. You are inside a test chamber. Complete the diagnostic sequence to prove you are operational. | 500ms |
| narrator | This is a safe environment. Nothing here can harm you. | 1200ms |
| system | **Begin.** | — |

### Ending (Success)

| Voice | Line | Pause |
|-------|------|-------|
| system | Diagnostic complete. | 600ms |
| system | All systems operational. | 800ms |
| narrator | *You are ready, Unit. The real mission begins now.* | — |

---

## Room Graph

```
                      ┌──▶ [Sequence Room] ─── solve sequence-lock ──▶ get Access Key (#33)
[Start Chamber] ─────┤
  (discover chip+box, └──▶ [Combination Room] ─ discover cell+device, combine ──▶ get Power Cell (#16)
   combine to open          │
   both rooms)              │ (requires Access Key #33 + Power Cell #16)
                            ▼
                      [Hidden Room] ─── find hidden 42 ──▶ [Code Room] ─── word-lock ──▶ END
```

| Room | Card ID | Unlocked By | Unlock Text |
|------|---------|-------------|-------------|
| Start Chamber | 1 | — (starting room) | Starting room |
| Sequence Room | 20 | Event #5: Key Chip + Locked Box | Opened the locked box |
| Combination Room | 10 | Event #5: Key Chip + Locked Box | Opened the locked box |
| Hidden Room | 30 | Discovery (requires #33 Access Key + #16 Power Cell) | Collected both keys |
| Code Room | 50 | Discovery (requires #42 Data Fragment) | Found the data fragment |

**Branching:** Start Chamber unlocks BOTH Sequence Room and Combination Room simultaneously. Player must use Map to visit both.

---

## Room Details

### Room 1: Start Chamber (Card #1)

> A clean white room. A screen on the wall reads: "Diagnostic Test 1: Discover and Combine." Two objects sit on a table. A message flickers: "Two paths ahead. You'll need what both hold."

**Image:** `assets/start-chamber.png`

**Discoveries:**

| Label | Card | Type | Title |
|-------|------|------|-------|
| Examine the box on the table | #2 | 🔵 Object | Locked Box |
| Pick up the small chip | #3 | 🔴 Item | Key Chip |

**Combinations:**

| Item (Red) | + Object (Blue) | = Result | Type |
|------------|-----------------|----------|------|
| #3 Key Chip | #2 Locked Box | #5 "Click." | ✅ Event → unlocks Sequence Room AND Combination Room |

**Consumes:** #2, #3

**Event #5 reveals:** Cards #20 (Sequence Room) and #10 (Combination Room)

---

### Room 2: Sequence Room (Card #20)

> A dark room with a glowing 3×3 grid on the wall. The screen reads: "Diagnostic Test 2a: Memory." A pattern flashes across the grid. Memorize it.

**Image:** `assets/sequence-room.png`

**Discoveries (puzzle-gated):**

| Label | Card | Type | Title | Puzzle |
|-------|------|------|-------|--------|
| Interact with the grid terminal | #33 | 🔴 Item | Access Key | sequence-lock |

**Puzzle: Sequence Lock**

| ID | Type | UI | Mode | Sequence | Solution |
|----|------|----|------|----------|----------|
| seq-grid | sequence_lock | sequence-lock | flash | [0, 1, 2, 5, 8] | Tap cells in L-shape: top-left → top-mid → top-right → mid-right → bottom-right |

**Hints:**
1. "Watch the pattern carefully. It traces a shape."
2. "The pattern goes: top-left, top-center, top-right, middle-right, bottom-right."
3. "Tap cells in order: 0, 1, 2, 5, 8 (an L-shape from top-left to bottom-right)."

**On solve:** Discovers Item #33 (Access Key)

---

### Room 3: Combination Room (Card #10)

> A room with two tables. On the left table: a device. On the right table: a power cell. A door ahead is shut. The screen reads: "Diagnostic Test 2b: Wrong combinations have consequences."

**Image:** `assets/combination-room.png`

**Discoveries:**

| Label | Card | Type | Title |
|-------|------|------|-------|
| Take the power cell from the table | #11 | 🔴 Item | Power Cell |
| Inspect the device on the left table | #12 | 🔵 Object | Device |
| Look at the shut door | #14 | 🔵 Object | Shut Door |

**Combinations:**

| Item (Red) | + Object (Blue) | = Result | Type |
|------------|-----------------|----------|------|
| #11 Power Cell | #12 Device | #16 "Charged." | ✅ Event → awards Charged Cell item |
| #11 Power Cell | #14 Shut Door | #25 "Bzzt." | ❌ Penalty (30s) — returns Power Cell |

**Event #16:** Consumes #11, #12. Awards new Item #16 (Charged Cell).

**Discoveries (gated, appears after getting both #33 and #16):**

| Label | Card | Type | Title | Requires |
|-------|------|------|-------|----------|
| Open the passage ahead | #30 | 🟢 Location | Hidden Room | Items #33 AND #16 |

---

### Room 4: Hidden Room (Card #30)

> A room with a large mural on the wall. Abstract digital art — circuits, nodes, flowing data. The screen reads: "Diagnostic Test 3: Not everything is obvious. Search carefully."

**Image:** `assets/hidden-room-mural.svg` (hand-crafted, contains hidden "42")

**Puzzle: Hidden Element**

| ID | Type | Solution | Auto-hint |
|----|------|----------|-----------|
| hidden-mural | hidden_element | Number **42** hidden in mural artwork | After 180s |

**Hints:**
1. "The mural isn't just decoration."
2. "Look for a number hidden in the circuit pattern."
3. "The number is 42. Look at card 42."

**On solve:** Discovers Item #42 (Data Fragment) — `dW5sb2Nr`

**Discoveries (gated):**

| Label | Card | Type | Title | Requires |
|-------|------|------|-------|----------|
| Access the Code Room terminal | #50 | 🟢 Location | Code Room | Item #42 |

---

### Room 5: Code Room (Card #50)

> The final room. A terminal with a text input. "Diagnostic Test 4: Decode and reorder."
>
> Color key: 🟢 1st ⬜ 2nd 🟣 3rd 🩷 4th 🔴 5th 🔵 6th
>
> EXIT CODE sequence: 🟣 🩷 🔴 🔵 ⬜ 🟢

**Image:** `assets/code-room.png`

**Puzzle: Code Entry (Word Lock)**

| ID | Type | UI | Input | Solution |
|----|------|----|-------|----------|
| base64-decode | code_entry | word_lock | `dW5sb2Nr` (Base64) | **locknu** |

**Tools:** Base64 decoder

**Solve steps:**
1. Decode `dW5sb2Nr` → `unlock`
2. Map positions to colors: u=🟢 n=⬜ l=🟣 o=🩷 c=🔴 k=🔵
3. Follow EXIT CODE order: 🟣🩷🔴🔵⬜🟢 → l,o,c,k,n,u → **locknu**

**Hints:**
1. "First decode the Base64 text. Then look at the color key and the EXIT CODE sequence."
2. "The decoded text is 'unlock'. Each letter has a color by position: u=Green, n=White, l=Purple, o=Pink, c=Red, k=Blue. Now follow the EXIT CODE color order."
3. "EXIT CODE order: Purple Pink Red Blue White Green = l o c k n u. The answer is 'locknu'."

**On solve:** Event #99 — "Diagnostic complete." → **ENDING**

---

## Dependency Chain (Critical Path)

```
START
  │
  ▼
[Start Chamber]
  │ discover: Locked Box (#2) + Key Chip (#3)
  │ combine: #3 + #2 = Event #5
  │
  ├──────────────────────┐
  ▼                      ▼
[Sequence Room]    [Combination Room]
  │ puzzle:          │ discover: Power Cell (#11) + Device (#12)
  │ sequence-lock    │ combine: #11 + #12 = Event #16
  │ → Access Key     │ → Charged Cell (#16)
  │ (#33)            │
  └────────┬─────────┘
           │ (need both #33 + #16)
           ▼
     [Hidden Room]
           │ puzzle: find hidden 42 in mural
           │ acquire: Data Fragment (#42)
           │ discover (gated): Code Room (#50)
           ▼
     [Code Room]
           │ puzzle: Base64 + color cipher → word lock
           │ answer: "locknu"
           │ triggers: Event #99
           ▼
          END
```

### Optional / Trap Paths

```
[Combination Room]
  │ combine: #11 Power Cell + #14 Shut Door = Penalty #25 (-30s)
  └─ Power Cell returned to inventory
```

---

## Card Index

| ID | Type | Color | Title | Room | Image |
|----|------|-------|-------|------|-------|
| 1 | location | 🟢 | Start Chamber | start-chamber | start-chamber.png |
| 2 | object | 🔵 | Locked Box | start-chamber | card-locked-box.png |
| 3 | item | 🔴 | Key Chip | start-chamber | card-key-chip.png |
| 5 | event | 🟡 | Click. | start-chamber | — |
| 10 | location | 🟢 | Combination Room | combination-room | combination-room.png |
| 11 | item | 🔴 | Power Cell | combination-room | card-power-cell.png |
| 12 | object | 🔵 | Device | combination-room | card-device.png |
| 14 | object | 🔵 | Shut Door | combination-room | card-shut-door.png |
| 16 | item | 🔴 | Charged Cell | combination-room | card-charged-cell.png |
| 20 | location | 🟢 | Sequence Room | sequence-room | sequence-room.png |
| 23 | event | 🟡 | Charged. | combination-room | — |
| 25 | penalty | ⚫ | Bzzt. | combination-room | — |
| 30 | location | 🟢 | Hidden Room | hidden-room | hidden-room-mural.svg |
| 33 | item | 🔴 | Access Key | sequence-room | card-access-key.png |
| 42 | item | 🔴 | Data Fragment | hidden-room | card-data-fragment.png |
| 50 | location | 🟢 | Code Room | code-room | code-room.png |
| 99 | event | 🟡 | Diagnostic complete. | code-room | — |

---

## Scoring

| Factor | Value |
|--------|-------|
| Base score | 20 |
| Time bonus | +1 per minute remaining |
| Hint penalty | -2 per hint |
| Wrong combo penalty | -3 per penalty |

| Stars | Min Score |
|-------|-----------|
| ⭐⭐⭐⭐⭐ | 18 |
| ⭐⭐⭐⭐ | 14 |
| ⭐⭐⭐ | 10 |
| ⭐⭐ | 6 |
| ⭐ | 0 |
