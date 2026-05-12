# Scenario Blueprint: Episode — 153 Fish

## Meta

- **Episode:** Special
- **Title:** 153 Fish
- **Arc:** Café Ministry
- **Duration:** 45 minutes
- **Players:** 2–6 (recommended 3–4)
- **Difficulty:** Tier 1 — Initiate
- **Topics:** Café operations, John 21:1-14, service, obedience, abundance
- **Mechanics Used:** discoveries, puzzle-gated discoveries, card combination, hidden elements, terminal-lock, keypad-lock, sort-lock, counting + concatenation, cross-card observation, timed events

---

## Narrative

### Voices

| Key | Polly Voice | Role |
|-----|-------------|------|
| narrator | Joanna | Story narrator — warm, guiding |
| shift1 | Matthew | Shift 1 leader — methodical, calm |
| shift2 | Kevin | Shift 2 leader — energetic, detail-oriented |

### Intro

| Voice | Line | Pause |
|-------|------|-------|
| narrator | Sunday morning. The doors open in forty-five minutes. | 800ms |
| narrator | Café 153 — named for the miraculous catch. A place where every cup served is an act of worship. | 1000ms |
| shift1 | Shift 1 reporting. Grinder's calibrated. Ice is prepped. Hot water's on. We're ready to serve. | 800ms |
| narrator | But something is off today. The numbers don't add up. | 600ms |
| shift2 | End of day. I'm doing the stocktake and... the totals are wrong. We served more than we sold. | 1000ms |
| narrator | Between the two shifts, a mystery hides. Cups that appeared without being ordered. Provision that came from nowhere. | 800ms |
| narrator | Find the discrepancy. Trace it back. Discover what the net held. | — |

### Mid-Event (at 20:00 remaining)

| Voice | Line | Pause |
|-------|------|-------|
| shift2 | I've recounted three times. There are extra cups in the wash. Someone served drinks that weren't rung up. | 800ms |
| narrator | The answer isn't in the register. It's in the morning. Look back at Shift 1. | — |

### Ending (Success)

| Voice | Line | Pause |
|-------|------|-------|
| narrator | The net held one hundred and fifty-three fish. And it did not break. | 1000ms |
| narrator | The disciples didn't catch those fish by their own effort. They cast the net on the right side — because He told them to. | 800ms |
| narrator | Every cup you serve, every order you fill — it's not your provision. It's His. | 1000ms |
| narrator | Café 153. Where abundance comes from obedience. | — |

### Ending (Failure)

| Voice | Line | Pause |
|-------|------|-------|
| narrator | The stocktake remains unresolved. The numbers still don't match. | 800ms |
| narrator | But that's okay. Sometimes the miracle takes time to see. | 600ms |
| narrator | Come back. Look again. The net is still full. | — |

---

## Room Graph

```
┌──────── SHIFT 1: SETUP ────────┐     ┌──────── SHIFT 2: CLOSING ────────┐
│                                 │     │                                   │
│  [Café Counter] ──┬──▶ [Brew Station]  │                                   │
│       │           │              │     │                                   │
│       │           └──▶ [Prep Area]     │                                   │
│       │                          │     │                                   │
│       └── (Shift Handoff) ───────┼────▶ [Register & Stocktake]            │
│                                  │     │        │                          │
│                                  │     │        ▼                          │
│                                  │     │  [The Shore] ──▶ REVELATION       │
└──────────────────────────────────┘     └──────────────────────────────────┘
```

| Room | Card ID | Unlocked By | Unlock Text |
|------|---------|-------------|-------------|
| Café Counter | 1 | — (starting room) | Starting room |
| Brew Station | 10 | Discovery from Café Counter | Entered the Brew Station |
| Prep Area | 20 | Discovery from Café Counter | Entered the Prep Area |
| Register & Stocktake | 30 | Shift Handoff (#17 Calibration Log + #25 Ice Count Sheet) | Shift 2 begins. Time to reconcile. |
| The Shore | 50 | Event #45: Discrepancy identified | "Come and have breakfast." — John 21:12 |

---

## Room Details

### Room 1: Café Counter (Card #1)

> The heart of Café 153. A chalkboard menu hangs on the wall listing today's drinks. The espresso machine gleams. Order tickets are pinned to a rail. Two doors lead deeper — one to the Brew Station, one to the Prep Area. A clipboard labeled "SHIFT HANDOFF" sits on the counter.

**Image:** `assets/cafe-counter.png`

**Discoveries:**

| Label | Card | Type | Title | Puzzle |
|-------|------|------|-------|--------|
| Read the chalkboard menu | #2 | 🔵 Object | Chalkboard Menu | — |
| Look at the order tickets | #3 | 🔵 Object | Order Tickets Rail | — |
| Examine the shift handoff clipboard | #4 | 🔵 Object | Shift Handoff Clipboard | — |
| Enter the Brew Station | #10 | 🟢 Location | Brew Station | — |
| Enter the Prep Area | #20 | 🟢 Location | Prep Area | — |
| Complete the Shift Handoff | #30 | 🟢 Location | Register & Stocktake | — |

**Gated discoveries:**
- Shift Handoff (#30): requires Calibration Log (#17) AND Ice Count Sheet (#25)

**Card #2 — Chalkboard Menu:**
```
TODAY'S MENU — Café 153
─────────────────────────
HOT                  COLD
Long Black ... $4    Iced Latte ..... $6
Latte ...... $5    Matcha Latte ... $7
Cappuccino . $5    Butterfly Pea .. $6
Flat White . $5    Iced Long Black  $5
Mocha ...... $6
─────────────────────────
"Cast your net on the right side" — John 21:6
```

**Card #3 — Order Tickets Rail:**
Shows 7 completed order tickets from the morning rush:
1. 2x Latte, 1x Long Black
2. 1x Matcha Latte, 1x Butterfly Pea
3. 3x Cappuccino
4. 1x Flat White, 1x Iced Latte
5. 2x Iced Long Black
6. 1x Mocha, 1x Latte
7. 1x Butterfly Pea, 1x Long Black

**Total from tickets: 17 drinks** (this number matters later)

**Card #4 — Shift Handoff Clipboard:**
> "Before handing off to Shift 2, ensure: ☐ Calibration log signed off, ☐ Ice count recorded, ☐ All stations wiped. Attach both documents to this clipboard."

**Lore:**

| ID | Label | Title | Content |
|----|-------|-------|---------|
| 5 | Notice the framed verse on the wall | John 21:6 | "He said to them, 'Cast the net on the right side of the boat, and you will find some.' So they cast it, and now they were not able to haul it in, because of the quantity of fish." |

---

### Room 2: Brew Station (Card #10)

> The espresso machine dominates the room. A grinder sits beside it with a digital display showing calibration numbers. Used portafilters are stacked in the sink. A logbook is open on the bench.

**Image:** `assets/brew-station.png`

**Discoveries:**

| Label | Card | Type | Title | Puzzle |
|-------|------|------|-------|--------|
| Read the grinder display | #11 | 🔵 Object | Grinder Display | — |
| Pick up the calibration logbook | #12 | 🔴 Item | Calibration Logbook | — |
| Count the used portafilters | #13 | 🔵 Object | Used Portafilters | — |
| Sign off the calibration log | #17 | 🔴 Item | Calibration Log (signed) | terminal-calibration |

**Gated discoveries:**
- "Sign off the calibration log" (#17): requires Calibration Logbook (#12)

**Card #11 — Grinder Display:**
> Digital readout: `GRIND: 7 | DOSE: 18.5g | SHOTS TODAY: 21`

**Card #13 — Used Portafilters:**
> You count the portafilters in the sink. There are 21 — matching the shot count. But wait... each latte/cap/flat white uses 1 double shot. Each long black uses 1. Each mocha uses 1. From the order tickets, coffee drinks total only 14. That's 14 shots. But the machine says 21. **7 extra shots were pulled.**

**Puzzle: Calibration Sign-off (terminal-lock)**

| ID | Type | UI | Prompt | Answer |
|----|------|----|--------|--------|
| terminal-calibration | terminal_lock | terminal-lock | `Enter today's grind setting to confirm:` | `7` |

The grind setting is visible on the Grinder Display (#11).

**On solve:** Awards signed Calibration Log (#17)

**Hints:**
1. "The logbook needs today's grind setting to be signed off."
2. "Check the grinder display for the current setting."
3. "Enter: 7"

**Lore:**

| ID | Label | Title | Content |
|----|-------|-------|---------|
| 15 | Read the note taped to the grinder | Barista's Note | "Calibrate every morning. The first shot is always a test — pour it out. The grind changes with humidity. Serve with excellence, as unto the Lord." |

---

### Room 3: Prep Area (Card #20)

> A stainless steel bench with containers of ice, jugs of milk, and bottles of syrup. A chest freezer hums in the corner. A whiteboard tracks today's prep quantities. Butterfly pea flowers steep in a glass jar, turning the water deep blue.

**Image:** `assets/prep-area.png`

**Discoveries:**

| Label | Card | Type | Title | Puzzle |
|-------|------|------|-------|--------|
| Read the prep whiteboard | #21 | 🔵 Object | Prep Whiteboard | — |
| Check the ice container | #22 | 🔵 Object | Ice Container | — |
| Examine the butterfly pea jar | #23 | 🔵 Object | Butterfly Pea Jar | — |
| Complete the ice count | #25 | 🔴 Item | Ice Count Sheet | sort-ice |

**Card #21 — Prep Whiteboard:**
```
PREP LOG — Sunday
─────────────────
Milk jugs filled: 4 (2 full-cream, 2 oat)
Ice trays frozen: 6 trays × 12 cubes = 72 cubes prepped
Hot water urn: ON at 6:30am
Butterfly pea: steeping since 6:00am
Matcha powder: restocked
```

**Card #22 — Ice Container:**
> The container is nearly empty. You count the remaining cubes: **39 left**. Each cold drink uses 6 cubes. From the order tickets, cold drinks served = 5. That's 30 cubes used. 72 prepped − 30 used = 42 should remain. But only 39 are here. **3 extra cubes missing — one extra cold drink was served.**

**Card #23 — Butterfly Pea Jar:**
> The deep blue liquid is beautiful. A small label reads: "Makes 8 servings." You notice the level — it's lower than expected. From the tickets, only 2 Butterfly Pea drinks were sold. But the jar level suggests **3 servings** were poured.

**Puzzle: Ice Count (sort-lock)**

| ID | Type | UI | Description |
|----|------|----|-------------|
| sort-ice | sort_lock | sort-lock | Arrange the ice math in correct order to complete the count sheet |

**Items to sort:** `72 prepped` → `30 used (5 drinks × 6)` → `3 extra cubes missing` → `39 remaining`

**On solve:** Awards Ice Count Sheet (#25) — documents the discrepancy

**Hints:**
1. "Start with how much ice was prepped, then subtract what was used."
2. "5 cold drinks × 6 cubes = 30 used. 72 − 30 = 42 expected. But only 39 remain."
3. "Order: 72 prepped → 30 used → 3 extra missing → 39 remaining."

**Lore:**

| ID | Label | Title | Content |
|----|-------|-------|---------|
| 26 | Notice the verse on the freezer | John 21:9 | "When they got out on land, they saw a charcoal fire in place, with fish laid out on it, and bread. — He had breakfast ready before they even arrived." |

---

### Room 4: Register & Stocktake (Card #30)

> The iPad register shows today's sales summary. A stack of receipts sits beside it. The cash box is open for counting. A stocktake form is half-filled. Something doesn't reconcile.

**Image:** `assets/register-stocktake.png`

**Discoveries:**

| Label | Card | Type | Title | Puzzle |
|-------|------|------|-------|--------|
| Review the sales summary | #31 | 🔵 Object | Sales Summary | — |
| Count the receipts | #32 | 🔵 Object | Receipt Stack | — |
| Check the cash box | #33 | 🔵 Object | Cash Box | — |
| Examine the used cups in the wash | #34 | 🔵 Object | Cup Count | — |
| Identify the discrepancy | #45 | 🟡 Event | Discrepancy Found | keypad-discrepancy |

**Gated discoveries:**
- "Identify the discrepancy" (#45): requires having seen Sales Summary (#31) AND Cup Count (#34)

**Card #31 — Sales Summary:**
```
SALES SUMMARY — Sunday
───────────────────────
Total drinks sold: 17
Total revenue: $89.00
───────────────────────
Breakdown:
  Long Black (2) ......... $8
  Latte (3) .............. $15
  Cappuccino (3) ......... $15
  Flat White (1) ......... $5
  Mocha (1) .............. $6
  Iced Latte (1) ......... $6
  Iced Long Black (2) .... $10
  Matcha Latte (1) ....... $7
  Butterfly Pea (2) ...... $12
  Butterfly Pea Soda (1) . $5
───────────────────────
```

**Card #32 — Receipt Stack:**
> You count the receipts. 17 receipts. Matches the sales summary. All accounted for... on paper.

**Card #33 — Cash Box:**
> Cash in box: $89.00. Matches the sales total exactly. No discrepancy in the money.

**Card #34 — Cup Count:**
> You count the cups in the wash basin. Hot cups: **15**. Cold cups: **6**. Total: **21 cups washed.** But only 17 drinks were sold. **4 extra cups.**

**Puzzle: Discrepancy Code (keypad-lock)**

| ID | Type | UI | Answer |
|----|------|----|--------|
| keypad-discrepancy | keypad_lock | keypad-lock | `21` |

The answer is the total cup count — the true number of drinks that were *served* (not sold).

**On solve:** Event #45 — "21 cups. 17 sold. 4 drinks appeared from nowhere. No money taken. No order placed. Someone served 4 extra drinks... for free. Who? And why?"

This unlocks The Shore (#50).

**Hints:**
1. "The money matches the sales. The discrepancy isn't in the cash — it's in the cups."
2. "Count the cups in the wash. Compare to the sales total."
3. "21 cups were used. Only 17 were sold. Enter: 21"

**Lore:**

| ID | Label | Title | Content |
|----|-------|-------|---------|
| 36 | Read the note in the cash box | Treasurer's Reminder | "If totals don't match, check cups first, then receipts, then cash. The cups never lie." |

---

### Room 5: The Shore (Card #50)

> The café is quiet now. Chairs are stacked. The lights are dimmed. But on the counter, you notice something you missed before — a small chalkboard sign, turned face-down. You flip it over. It reads: "Breakfast is ready. — The Manager." Behind the counter, four cups sit clean and unused on a tray. Each has a name written on it. These were the extra drinks. Served to the first four customers of the day — before the register was even turned on. Given freely.

**Image:** `assets/the-shore.png`

**Discoveries:**

| Label | Card | Type | Title | Puzzle |
|-------|------|------|-------|--------|
| Read the names on the cups | #51 | 🔵 Object | The Four Cups | — |
| Enter the final number | #53 | 🟡 Event | The Net Holds | keypad-153 |

**Card #51 — The Four Cups:**
> Four cups, each with a name and a drink:
> - "Simon" — Long Black
> - "Thomas" — Latte
> - "Nathanael" — Flat White
> - "James" — Cappuccino
>
> *The disciples. He served them breakfast on the shore before they even asked.*
>
> Below the cups, a small card reads: "17 sold + 4 given + ??? = the number of the catch. What fills the net?"

**Puzzle: The Net (keypad-lock)**

| ID | Type | UI | Answer |
|----|------|----|--------|
| keypad-153 | keypad_lock | keypad-lock | `153` |

The logic: The card asks "What fills the net?" — the answer is 153, the number of the miraculous catch from John 21:11. The café is named for it. The verse is on the wall. The net held 153 fish and did not break.

**On solve:** Event #53 — **ENDING (Success)**

**Hints:**
1. "The café is named 153. Why that number?"
2. "John 21:11 — Simon Peter hauled the net ashore, full of large fish, 153 of them."
3. "Enter: 153"

**Lore:**

| ID | Label | Title | Content |
|----|-------|-------|---------|
| 55 | Read the back of the chalkboard sign | The Miracle of 153 | "They fished all night and caught nothing. He said cast on the right side. They obeyed. 153 large fish — and the net didn't break. The miracle wasn't the fish. It was the obedience. And the breakfast was already waiting on the shore. He provides before we even ask." |

---

## Dependency Chain (Critical Path)

```
START
  │
  ▼
[Café Counter]
  │ discover: Chalkboard Menu (#2), Order Tickets (#3)
  │ discover: Shift Handoff Clipboard (#4)
  │
  ├──────────────────────────────┐
  ▼                              ▼
[Brew Station]              [Prep Area]
  │ discover: Grinder (#11)      │ discover: Whiteboard (#21)
  │ discover: Portafilters (#13) │ discover: Ice Container (#22)
  │   → notice 7 extra shots     │ discover: Butterfly Pea (#23)
  │ puzzle: terminal-lock         │   → notice discrepancies
  │   = Calibration Log (#17)    │ puzzle: sort-lock
  │                              │   = Ice Count Sheet (#25)
  └──────────┬───────────────────┘
             │ (need #17 + #25 for handoff)
             ▼
       [Register & Stocktake]
             │ discover: Sales Summary (#31)
             │ discover: Cup Count (#34)
             │   → 21 cups vs 17 sold
             │ puzzle: keypad-lock (enter 21)
             │   = Event #45 (discrepancy found)
             ▼
       [The Shore]
             │ discover: The Four Cups (#51)
             │ puzzle: keypad-lock (enter 153)
             │   = Event #53
             ▼
            END
```

### Optional / Trap Paths

```
[Café Counter]
  │ lore: John 21:6 verse (#5)

[Brew Station]
  │ lore: Barista's Note (#15)

[Prep Area]
  │ lore: John 21:9 verse (#26)

[Register & Stocktake]
  │ lore: Treasurer's Reminder (#36)

[The Shore]
  │ lore: The Miracle of 153 (#55)
```

---

## Timed Events

| Time Remaining | Event |
|---|---|
| 40:00 | shift1: "Don't forget to check the grinder before you sign off." |
| 30:00 | shift2: "The cash matches. But something still feels off." |
| 20:00 | **MID-EVENT:** shift2 notices extra cups. Hint toward cup count. |
| 10:00 | narrator: "The net is full. Can you see what it holds?" |
| 5:00 | narrator: "153. The number is everywhere. Look." |

---

## Card Index

| ID | Type | Color | Title | Room | Image |
|----|------|-------|-------|------|-------|
| 1 | location | 🟢 | Café Counter | cafe-counter | cafe-counter.png |
| 2 | object | 🔵 | Chalkboard Menu | cafe-counter | card-chalkboard.png |
| 3 | object | 🔵 | Order Tickets Rail | cafe-counter | card-order-tickets.png |
| 4 | object | 🔵 | Shift Handoff Clipboard | cafe-counter | card-clipboard.png |
| 5 | lore | 🟣 | John 21:6 | cafe-counter | — |
| 10 | location | 🟢 | Brew Station | brew-station | brew-station.png |
| 11 | object | 🔵 | Grinder Display | brew-station | card-grinder.png |
| 12 | item | 🔴 | Calibration Logbook | brew-station | card-logbook.png |
| 13 | object | 🔵 | Used Portafilters | brew-station | card-portafilters.png |
| 15 | lore | 🟣 | Barista's Note | brew-station | — |
| 17 | item | 🔴 | Calibration Log (signed) | brew-station | card-cal-signed.png |
| 20 | location | 🟢 | Prep Area | prep-area | prep-area.png |
| 21 | object | 🔵 | Prep Whiteboard | prep-area | card-whiteboard.png |
| 22 | object | 🔵 | Ice Container | prep-area | card-ice.png |
| 23 | object | 🔵 | Butterfly Pea Jar | prep-area | card-butterfly-pea.png |
| 25 | item | 🔴 | Ice Count Sheet | prep-area | card-ice-count.png |
| 26 | lore | 🟣 | John 21:9 | prep-area | — |
| 30 | location | 🟢 | Register & Stocktake | register | register-stocktake.png |
| 31 | object | 🔵 | Sales Summary | register | card-sales.png |
| 32 | object | 🔵 | Receipt Stack | register | card-receipts.png |
| 33 | object | 🔵 | Cash Box | register | card-cashbox.png |
| 34 | object | 🔵 | Cup Count | register | card-cups.png |
| 36 | lore | 🟣 | Treasurer's Reminder | register | — |
| 45 | event | 🟡 | Discrepancy Found | register | — |
| 50 | location | 🟢 | The Shore | the-shore | the-shore.png |
| 51 | object | 🔵 | The Four Cups | the-shore | card-four-cups.png |
| 53 | event | 🟡 | The Net Holds | the-shore | — |
| 55 | lore | 🟣 | The Miracle of 153 | the-shore | — |

---

## Scoring

| Factor | Points |
|--------|--------|
| Completed | 50 base |
| Time remaining | +1 per minute left |
| Hints used | -3 per hint |
| Lore fragments found (5) | +3 each |
| All lore found | +5 bonus |
| **Max possible** | **~100** |

| Stars | Score |
|-------|-------|
| ⭐⭐⭐⭐⭐ | 85+ |
| ⭐⭐⭐⭐ | 70–84 |
| ⭐⭐⭐ | 55–69 |
| ⭐⭐ | 40–54 |
| ⭐ | Completed |

---

## Debrief

> **The Story Behind the Puzzle:**
>
> 🐟 **John 21:1-14** — After the resurrection, the disciples went fishing and caught nothing all night. Jesus appeared on the shore and told them to cast the net on the right side. They caught 153 large fish — and the net didn't break.
>
> ☕ **The Café Connection** — Café 153 is named for this miracle. The "extra drinks" in the puzzle represent Jesus' provision — breakfast was already on the shore before the disciples arrived. He provides before we ask.
>
> 🔢 **The Numbers** — 21 shots pulled (7 extra), 3 missing ice cubes, 4 phantom cups. The discrepancies aren't errors — they're evidence of grace. Someone served freely, without record, without payment.
>
> 🎣 **The Net** — 153 is the 17th triangular number (1+2+3+...+17 = 153). There were 17 orders on the tickets. The net holds everything together.
>
> *You didn't just solve a stocktake. You traced the fingerprints of provision.*
