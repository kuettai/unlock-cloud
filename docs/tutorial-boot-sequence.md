# Episode 0: "Boot Sequence" (Tutorial)

## Overview

| Field | Value |
|---|---|
| Duration | 10 minutes |
| Players | 1–6 (works solo or team) |
| Difficulty | Tutorial — fully guided |
| AWS Concepts | None explicitly — teaches game mechanics only |
| Purpose | Teach: card types, combination, hidden elements, code entry, hints, penalties |

## Narrative Setup

> *System boot initiated...*
> *AI Unit detected. Running diagnostic...*
> *Welcome, Unit. You are inside a test chamber. Complete the diagnostic sequence to prove you are operational. This is a safe environment. Nothing here can harm you.*
> *Begin.*

The fiction: you just woke up as an AI. The system is running a diagnostic on you. Each "test" teaches a game mechanic. It's low-stakes, friendly, and short.

---

## Room Layout

```
[Start Chamber] → [Combination Room] → [Hidden Room] → [Code Room] → [Exit]
```

4 rooms. Each teaches one core mechanic. Linear path — no branching.

### Room Connections (rooms.json)

```
Start Chamber ──[solve combo]──▶ Combination Room ──[power device]──▶ Hidden Room ──[find fragment]──▶ Code Room
```

All rooms are linear. Each unlocks the next via an event or item discovery. Defined in `scenarios/ep0-boot-sequence/rooms.json`.

---

## Card Deck

### Start Chamber

| ID | Type | Color | Content |
|---|---|---|---|
| 1 | Location | 🟢 Green | **Start Chamber** — A clean white room. A screen on the wall reads: "Diagnostic Test 1: Combination." Two objects sit on a table. *Look at cards 2 and 3.* |
| 2 | Object | 🔵 Blue | **Locked Box** — A small box with a slot on top. It needs something inserted. *(Blue card = something you interact WITH)* |
| 3 | Item | 🔴 Red | **Key Chip** — A small chip that looks like it fits into something. *(Red card = something you USE)* |

**What the player does:** They see Red 3 + Blue 2. They combine: 3 + 2 = **5**. This reveals Card 5.

| ID | Type | Color | Content |
|---|---|---|---|
| 5 | Event | 🟡 Yellow | **"Click."** The box opens. Inside is a message: *"Test 1 complete. You've learned combination. Red + Blue = new discovery. Proceed to the next room."* → *Look at card 10.* |

**Mechanic taught:** Card combination (Red + Blue).

---

### Combination Room

| ID | Type | Color | Content |
|---|---|---|---|
| 10 | Location | 🟢 Green | **Combination Room** — A room with two tables. On the left table: a device. On the right table: a power cell. A door ahead is shut. The screen reads: "Diagnostic Test 2: Wrong combinations have consequences." *Look at cards 11, 12, and 14.* |
| 11 | Item | 🔴 Red | **Power Cell** — A glowing energy cell. |
| 12 | Object | 🔵 Blue | **Device** — A machine with a slot for a power cell. |
| 14 | Object | 🔵 Blue | **Shut Door** — A heavy door. It won't budge by hand. |

**Correct path:** 11 + 12 = **23** (power cell + device).

| ID | Type | Color | Content |
|---|---|---|---|
| 23 | Event | 🟡 Yellow | **The device powers on.** The door clicks open. *"Test 2 complete. Correct combination. Proceed."* → *Look at card 30.* |

**Wrong path (if they try):** 11 + 14 = **25** (power cell + door directly).

| ID | Type | Color | Content |
|---|---|---|---|
| 25 | Penalty | ⚫ Black | **"Bzzt."** You jammed the power cell into the door. It doesn't fit. The cell sparks. *"Wrong combination. Time penalty: 30 seconds. Think about what fits where."* → Return the power cell to your inventory. |

**Mechanic taught:** Wrong combinations = penalty. Think before combining.

---

### Hidden Room

| ID | Type | Color | Content |
|---|---|---|---|
| 30 | Location | 🟢 Green | **Hidden Room** — A room with a large mural on the wall. Abstract digital art — circuits, nodes, flowing data. The screen reads: "Diagnostic Test 3: Not everything is obvious. Search carefully." *(The mural image contains a hidden number "42" embedded subtly in the circuit pattern.)* |

**What the player does:** Examine the mural image closely. Find the hidden number **42**. Look at card 42.

| ID | Type | Color | Content |
|---|---|---|---|
| 42 | Item | 🔴 Red | **Data Fragment** — A piece of encrypted data. It reads: `dW5sb2Nr` *(This is Base64 for "unlock")* |

**If stuck (3+ minutes):** Auto-hint appears: *"Look at the mural more carefully. There's a number hidden in the circuit lines."*

**Mechanic taught:** Hidden elements in artwork. Careful observation matters.

---

### Code Room

| ID | Type | Color | Content |
|---|---|---|---|
| 50 | Location | 🟢 Green | **Code Room** — The final room. A terminal with a text input. The screen reads: "Diagnostic Test 4: Enter the decoded message to complete the sequence." A reference chart on the wall shows: *"Base64 is an encoding format. Use the decoder tool below."* *(The app provides a simple Base64 decoder tool on this screen.)* |

**What the player does:** Use the in-app decoder to decode `dW5sb2Nr` → "unlock". Type **unlock** into the terminal.

**On correct entry:**

| ID | Type | Color | Content |
|---|---|---|---|
| 99 | Event | 🟡 Yellow | *"Diagnostic complete. All systems operational."* The room fills with light. *"You are ready, Unit. The real mission begins now."* → **Tutorial complete.** |

**On wrong entry:** *"Incorrect code. Try again. No penalty — this is practice."* (No penalty in the code room — we want them to experiment.)

**Mechanic taught:** Code entry puzzles. Using in-app tools.

---

### Hint Demo (Woven In)

During the Hidden Room (Card 30), if the player taps the hint button:

- **Hint 1:** *"The mural isn't just decoration."*
- **Hint 2:** *"Look for a number hidden in the circuit pattern."*
- **Hint 3:** *"The number is 42. Look at card 42."*

A brief tooltip appears the first time: *"Hints are always available. They cost points but never block you. Use them if you're stuck."*

**Mechanic taught:** Hint system (3 tiers, costs points, always available).

---

## Summary: What the Tutorial Teaches

| Test | Mechanic | How |
|---|---|---|
| 1 — Start Chamber | Card combination (Red + Blue) | Combine key chip + locked box |
| 2 — Combination Room | Wrong combos = penalty | Try wrong combo, get time penalty |
| 3 — Hidden Room | Hidden elements in art + hints | Find hidden number in mural |
| 4 — Code Room | Code entry + in-app tools | Decode Base64 and enter answer |

**Not taught in tutorial (learned in Episode 1):**
- Split information / team roles
- Timed events
- Audio clues
- Lore fragments

These are introduced gradually in the first real scenario so the tutorial stays short and focused.

---

## Flow Diagram

```
START
  │
  ▼
[Card 1: Start Chamber]
  │ See cards 2 (Blue) and 3 (Red)
  │ Combine: 3 + 2 = 5
  ▼
[Card 5: Box opens] ✅ Learned: Combination
  │
  ▼
[Card 10: Combination Room]
  │ See cards 11 (Red), 12 (Blue), 14 (Blue)
  │ Correct: 11 + 12 = 23
  │ Wrong:   11 + 14 = 25 (penalty)
  ▼
[Card 23: Device powers on, door opens] ✅ Learned: Penalties
  │
  ▼
[Card 30: Hidden Room]
  │ Examine mural → find hidden "42"
  │ (Hint system available here)
  ▼
[Card 42: Data Fragment with Base64]  ✅ Learned: Hidden elements + Hints
  │
  ▼
[Card 50: Code Room]
  │ Decode Base64 → type "unlock"
  ▼
[Card 99: Diagnostic complete] ✅ Learned: Code entry
  │
  ▼
END → Proceed to Episode 1
```

---

## Data Files

All scenario data for this episode lives in `scenarios/ep0-boot-sequence/`:

| File | Contents |
|---|---|
| `meta.json` | Episode metadata, difficulty tier 0 |
| `narrative.json` | Multi-voice intro/ending (Matthew + Joanna) |
| `cards.json` | 14 cards (4 locations, 3 items, 3 objects, 3 events, 1 penalty) |
| `rooms.json` | 4 rooms, linear connections, unlock conditions |
| `combinations.json` | 3 combos (2 valid, 1 penalty) |
| `puzzles.json` | 2 puzzles (hidden element + code entry) |
| `events.json` | 1 triggered tooltip (hint system intro) |
| `scoring.json` | Base 20 points, light penalties |
| `assets/voice/` | Generated audio (intro.wav, ending_success.wav) |
| `assets/hidden-room-mural.svg` | Circuit board art with hidden "42" |

---

*Document version: 0.2*
*Last updated: 2026-04-26*
