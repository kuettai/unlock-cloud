# Scenario Blueprint: Episode 2 — 153 Fish

## Meta

- **Episode:** 2
- **Title:** 153 Fish
- **Arc:** Bible — Jesus Miracles
- **Duration:** 45 minutes
- **Players:** 1–4 (recommended 2–3)
- **Difficulty:** Tier 2 — Apprentice
- **Topics:** John 21:1-14, café ministry, hidden provision, obedience, abundance
- **Mechanics Used:** discoveries, puzzle-gated discoveries, card combination, hidden elements, slider-lock, match-lock, word-lock, keypad-lock, rotation-lock, multi-step custom, multiple-choice cascade, room revisiting, cross-card observation, lore fragments

---

## Narrative

### Voices

| Key | Polly Voice | Role |
|-----|-------------|------|
| narrator | Joanna | Story narrator — warm, reflective |
| you | Matthew | Player's inner voice — anxious then awed |
| manager | Kevin | The Manager's notes — calm, knowing |

### Intro

| Voice | Line | Pause |
|-------|------|-------|
| narrator | Sunday morning. Your phone buzzes with cancellations. Sick. Emergency. Can't make it. Sorry. | 800ms |
| you | Nobody's coming. It's just me. | 1000ms |
| narrator | Service starts in forty-five minutes. You have to open Café 153 alone. | 600ms |
| you | Store room first. Then the machine. Then the counter. I can do this. | 800ms |
| narrator | The Manager left a note on the grinder. He always does. Follow his instructions. | — |

### Mid-Event (at 20:00 remaining)

| Voice | Line | Pause |
|-------|------|-------|
| you | Wait. The shot counter says 21. But I only pulled... 14? Maybe 13? | 800ms |
| narrator | The numbers don't add up. They haven't added up all day. Look closer. | — |

### Ending (Success)

| Voice | Line | Pause |
|-------|------|-------|
| narrator | The safe opens. Inside — a single card. "Well done. You were never alone." | 1000ms |
| narrator | The net held 153 fish and did not break. | 800ms |
| narrator | You held an entire day alone — and did not break. Because it was never just you. | 1000ms |
| narrator | Café 153. Where abundance comes from obedience. | — |

### Ending (Failure)

| Voice | Line | Pause |
|-------|------|-------|
| narrator | The café closes. The numbers remain a mystery. | 800ms |
| narrator | But the provision was still there. You just didn't see it yet. | 600ms |
| narrator | Come back. Count again. The net is still full. | — |

---

## Room Graph

```
ACT 1 (Setup):
[Store Room] ──(start)──▶ [Brew Station] ──(grinder solved)──▶ [Service Counter] ──(stock+chalkboard solved)──▶ [The Floor]

ACT 3 (Investigation — same rooms revisited):
[The Floor] ──(act3 trigger)──▶ [Service Counter] ──(evidence solved)──▶ [Brew Station] ──(milk-jug solved)──▶ [Store Room]

ACT 4 (Revelation):
[Store Room] ──(names solved)──▶ [The Floor] ──(safe solved)──▶ END
```

| Room | Card ID | Unlocked By | Unlock Text |
|------|---------|-------------|-------------|
| Store Room | 10 | — (starting room) | You arrive at the back door. The store room is dark and cold. |
| Brew Station | 20 | Discovery from Store Room (stock gathered) | You carry supplies to the brew station. The machine is cold. |
| Service Counter | 30 | Event: grinder puzzle solved | The machine is dialed in. Time to set up the counter. |
| The Floor | 40 | Event: stock + chalkboard solved | Everything's ready behind the counter. Time to set up the floor. |
| The Floor (Act 3) | 40 | Event: act3 begins (timed trigger) | The rush is over. Time to close up. You start clearing tables. |
| Service Counter (Act 3) | 30 | Discovery: corner table cups found | You bring the mystery cups back to the counter to reconcile. |
| Brew Station (Act 3) | 20 | Event: evidence puzzle solved | The cups don't lie. Check the machine. |
| Store Room (Act 3) | 10 | Event: milk-jug puzzle solved | The shots confirm it. Someone used supplies. Check the store room. |
| The Floor (Act 4) | 40 | Event: names puzzle solved | You understand now. Return to the floor. |



---

## Room Details

### Room: Store Room (Card #10) — Act 1

> The back door of Café 153. Shelves line the walls — milk jugs, coffee beans, cup sleeves, syrups, matcha powder. A clipboard hangs by the door with today's prep checklist. You need to grab what you need for the day. Two hands. No help.

**Image:** `assets/store-room.png`

**Discoveries:**

| Label | Card | Type | Title | Puzzle |
|-------|------|------|-------|--------|
| Check the prep checklist | #11 | 🔵 Object | Prep Checklist | — |
| Grab supplies from the shelves | #12 | 🔴 Item | Supply Run Complete | stock |
| Notice the milk jug batch labels | #13 | 🔵 Object | Milk Jug Labels | — |

**Card #11 — Prep Checklist:**
> ```
> DAILY PREP — Sunday
> ────────────────────
> ☐ Milk: 2 jugs (full-cream)
> ☐ Beans: 1 bag (house blend)
> ☐ Cups: 1 sleeve (25 cups)
> ☐ Ice: 6 trays → container
> ☐ Syrups: vanilla, caramel, hazelnut
> ☐ Matcha powder: check level
> ────────────────────
> "His mercies are new every morning" — Lam 3:23
> ```

**Card #13 — Milk Jug Labels:**
> Each jug has a batch sticker. The two you grab read: "Batch A-1" and "Batch B-2". Behind them on the shelf, you notice others: "Batch C-**3**", "Batch D-4", "Batch E-5". Five jugs total on the shelf. You only need two.
>
> *Key detail: Batch C-3 — the number 3 is planted here for the safe puzzle.*

**Puzzle: Stock Count (match-lock)**

| ID | Type | UI | Description |
|----|------|----|-------------|
| stock | match_lock | match-lock | Memory game — flip cards to match supply pairs from the checklist |

```js
new MatchLock(el, {
  pairs: [
    ['🥛 Milk', '2 Jugs'],
    ['☕ Beans', '1 Bag'],
    ['🥤 Cups', '1 Sleeve'],
    ['🧊 Ice', '6 Trays'],
    ['🍯 Syrups', '3 Bottles'],
    ['🍵 Matcha', 'Restocked']
  ],
  cols: 4,
  onSubmit() { }
});
```

**On solve:** Awards Supply Run Complete (#12). Unlocks transition to Brew Station.

**Hints:**
1. "Match each supply item to its quantity from the checklist."
2. "Milk goes with 2 Jugs. Beans with 1 Bag. Cups with 1 Sleeve."
3. "Ice = 6 Trays, Syrups = 3 Bottles, Matcha = Restocked."

**Lore:**

| ID | Label | Title | Content |
|----|-------|-------|---------|
| 300 | Read the verse on the clipboard | Lamentations 3:22-23 | "The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning; great is your faithfulness." |

---

### Room: Store Room (Card #10) — Act 3 (Revisited)

> You're back in the store room for the final stocktake. The shelves look different now. You took 2 milk jugs this morning. Both are empty in the rinse sink by the brew station. But here — in the store room rinse sink — there's a THIRD empty jug. Batch C-3. You didn't take this one. Someone else did.

**Image:** `assets/store-room-act3.png`

**Act 3 Discoveries:**

| Label | Card | Type | Title | Puzzle |
|-------|------|------|-------|--------|
| Examine the third milk jug | #70 | 🔵 Object | The Third Jug | — |
| Check the bean bag weight | #71 | 🔵 Object | Bean Bag Evidence | — |
| Count remaining cups on shelf | #72 | 🔵 Object | Cup Sleeve (Empty) | — |
| Piece together who was here | #73 | 🔴 Item | The Names on the Cups | names |

**Card #70 — The Third Jug:**
> Batch C-3. Empty. Rinsed. Someone took this jug from the shelf, used it during service, rinsed it, and put it back. Someone who knew where things were. Someone who had the store room code.

**Card #71 — Bean Bag Evidence:**
> The bag is lighter than it should be. 21 shots = ~210g of beans. But the bag feels closer to 280-300g used. That's 28-30 shots worth. More than the machine counter shows for YOUR shots.

**Card #72 — Cup Sleeve (Empty):**
> You took one sleeve this morning: 25 cups. The sleeve is completely empty. 21 cups in the wash + 4 on the corner table = 25. Every single cup was used. Exactly.

**Puzzle: The Names (multiple-choice cascade)**

| ID | Type | UI | Description |
|----|------|----|-------------|
| names | choice_cascade | custom | 4-step realization — each correct answer lights up a cup |

**Visual:** 4 cup silhouettes at top (Simon, Thomas, Nathanael, James). Each glows gold on correct answer.

**Steps:**

| Step | Question | Options | Answer |
|------|----------|---------|--------|
| 1 | "Simon. Thomas. Nathanael. James. Do you recognize these names?" | A) Regular customers, B) Staff from another branch, C) **Disciples of Jesus**, D) Names from the roster | C |
| 2 | "What connects these four disciples?" | A) The Last Supper, B) **A breakfast on the shore**, C) The road to Emmaus, D) The upper room | B |
| 3 | "What happened that morning on the shore?" | A) They walked on water, B) They fed 5000, C) **They cast the net on the right side — 153 fish**, D) They calmed the storm | C |
| 4 | "What was already waiting on the shore when they arrived?" | A) A boat, B) Other disciples, C) A crowd, D) **Breakfast — bread and fish on a charcoal fire** | D |

**On solve:** All 4 cups glow green. Scene transitions to warm sunrise palette. Reveals Act 4 Floor access. Awards card #73.

**Hints:**
1. "These aren't random names. They're from John chapter 21."
2. "John 21:2 lists who was there: Simon Peter, Thomas, Nathanael, the sons of Zebedee..."
3. "Step by step: Disciples → Breakfast on shore → 153 fish → Bread and fish on charcoal fire."



---

### Room: Brew Station (Card #20) — Act 1

> The espresso machine is cold. You flip the power switch — it hums to life. The grinder sits beside it with a yellow sticky note from the Manager. A shot counter on the machine reads 000. You need to calibrate before you can serve.

**Image:** `assets/brew-station.png`

**Discoveries:**

| Label | Card | Type | Title | Puzzle |
|-------|------|------|-------|--------|
| Read the Manager's sticky note | #21 | 🔵 Object | Manager's Note | — |
| Check the shot counter | #22 | 🔵 Object | Shot Counter (000) | — |
| Calibrate the grinder | #23 | 🔴 Item | Grinder Dialed In | grinder |

**Card #21 — Manager's Note:**
> A yellow post-it, slightly rotated, stuck to the grinder:
> ```
> Dial-in notes (Manager):
> Grind 7, Dose 5, Yield 4.
> Should pull ~27s. Trust me.
> — M
> ```
> *He knew you'd be alone today. He left instructions.*

**Card #22 — Shot Counter (000):**
> The digital display reads 000. Fresh start. You notice it flickers briefly to "**1**" then back to 000 as the machine warms up. A ghost in the system? Or a calibration test already logged?
>
> *Key detail: The number 1 is planted here for the safe puzzle.*

**Puzzle: Grinder Calibration (slider-lock)**

| ID | Type | UI | Description |
|----|------|----|-------------|
| grinder | slider_lock | slider-lock | 3 sliders — follow the Manager's note to dial in the perfect shot |

```js
new SliderLock(el, {
  sliders: [
    { label: 'Grind', min: 1, max: 9, step: 1, answer: 7 },
    { label: 'Dose', min: 1, max: 9, step: 1, answer: 5 },
    { label: 'Yield', min: 1, max: 9, step: 1, answer: 4 }
  ],
  revealCorrect: false,
  falseOutputs: [
    '⚡ Blonde & sour. Too fast — grind finer.',
    '🐌 Dark & bitter. Too slow — grind coarser.',
    'Channeling — uneven extraction. Adjust dose.'
  ],
  onSubmit() { },
  onWrong(msg) { }
});
```

**Formula (narrative only):** `extractionTime = 10 + grind*2.5 - dose*0.8 + yield*1.2`. Target: 25-30s.

**On solve:** "✅ Golden crema. Balanced. Perfect. ~27 seconds." Awards Grinder Dialed In (#23). Unlocks Service Counter.

**Hints:**
1. "The Manager left a note on the grinder. Read it carefully."
2. "The note says: Grind 7, Dose 5, Yield 4."
3. "Set sliders to 7, 5, 4 — exactly as the Manager instructed."

**Lore:**

| ID | Label | Title | Content |
|----|-------|-------|---------|
| 301 | Notice the verse taped inside the hopper lid | John 21:6 | "He said to them, 'Cast the net on the right side of the boat, and you will find some.' So they cast it, and now they were not able to haul it in, because of the quantity of fish." |

---

### Room: Brew Station (Card #20) — Act 3 (Revisited)

> The rush is over. You lean against the bench, exhausted. The shot counter now reads: **21**. You count backward from the order tickets. The math doesn't work. Someone was pulling shots behind you during the rush.

**Image:** `assets/brew-station-act3.png`

**Act 3 Discoveries:**

| Label | Card | Type | Title | Puzzle |
|-------|------|------|-------|--------|
| Read the shot counter | #74 | 🔵 Object | Shot Counter (21) | — |
| Check the used portafilters | #75 | 🔵 Object | Portafilter Evidence | — |
| Trace the milk usage | #76 | 🔴 Item | Milk Jug Mystery Solved | milk-jug |

**Card #74 — Shot Counter (21):**
> The machine says 21 shots pulled today. From the order tickets: 13 coffee drinks = 13 shots. Plus your calibration shot = 14. Even adding the 4 mystery cups (if coffee) = 18 max. The counter says 21. **3 unexplained shots.**

**Card #75 — Portafilter Evidence:**
> 21 used portafilters in the sink. Matching the counter. But your hands only held 14 of them. Someone else was at this machine. During the rush. Behind you.

**Puzzle: The Third Milk Jug (multi-step)**

| ID | Type | UI | Description |
|----|------|----|-------------|
| milk-jug | multi_step | custom | 5-step deduction with shelf interaction, timeline, and elimination |

**Visual:** 3 milk jug silhouettes at top. Jugs A & B glow green ("Yours"). Jug C starts grey, glows red ("???") on step 2.

**Steps:**

| Step | Mechanic | Prompt | Answer |
|------|----------|--------|--------|
| 1 | Shelf tap | "Tap the 2 jugs you took this morning" | Tap Batch A-1 and Batch B-2 (from 5 jugs shown) |
| 2 | Multiple choice | "When was Jug C needed?" | "During the rush (8:15-10am)" |
| 3 | Card elimination (2×2 grid, tap to flip/eliminate) | "Who took Jug C?" | Eliminate: 👤 Customer (no code), 🚚 Driver (no Sunday delivery), 🤔 You (hands full) → ✅ 🔑 Someone with the code |
| 4 | Number input | "How many drinks from Jug C? (mystery rush + corner table)" | 8 |
| 5 | Multiple choice | "What does the third jug prove?" | "Someone worked a full shift beside you" |

**On solve:** Awards Milk Jug Mystery Solved (#76). Unlocks Store Room (Act 3).

**Hints:**
1. "You took Batch A-1 and B-2. The third jug is C-3 — you saw it on the shelf earlier."
2. "Only someone with the store room code could get Jug C. Not a customer, not a driver."
3. "4 mystery cups during rush + 4 cups on corner table = 8 drinks from Jug C."

**Lore:**

| ID | Label | Title | Content |
|----|-------|-------|---------|
| 302 | Find the note tucked behind the machine | Manager's Schedule | "I don't clock in on Sundays. But I'm always here. — M" |



---

### Room: Service Counter (Card #30) — Act 1

> The counter is bare. The chalkboard is blank. Cup sleeves need stacking, syrups need arranging, the POS needs switching on. You write today's specials on the board — three drinks the Manager suggested last week. Ice goes into the container: 6 trays, 72 cubes.

**Image:** `assets/service-counter.png`

**Discoveries:**

| Label | Card | Type | Title | Puzzle |
|-------|------|------|-------|--------|
| Write the chalkboard specials | #31 | 🔴 Item | Chalkboard Ready | chalkboard |
| Stack the cups and arrange syrups | #32 | 🔵 Object | Counter Setup | — |
| Switch on the POS | #33 | 🔵 Object | POS Starting Balance ($0) | — |
| Count the ice cubes | #34 | 🔵 Object | Ice Count (72 cubes) | — |

**Card #32 — Counter Setup:**
> Cups stacked: one full sleeve (25). Syrups lined up: vanilla, caramel, hazelnut. Matcha powder in the tin. Butterfly pea steeping in the jar. Everything in its place.

**Card #33 — POS Starting Balance:**
> Register reads $0.00. Zero transactions. The day hasn't started yet.

**Card #34 — Ice Count:**
> 6 trays × 12 cubes = 72 cubes in the container. Ready for cold drinks.

**Puzzle: Chalkboard Specials (word-lock)**

| ID | Type | UI | Description |
|----|------|----|-------------|
| chalkboard | word_lock | word-lock | Spell 3 menu items on rolling letter reels |

```js
// Three words spelled sequentially
new WordLock(el, { answer: 'MOCHA', onSubmit(word, correct) { } });
new WordLock(el, { answer: 'LATTE', onSubmit(word, correct) { } });
new WordLock(el, { answer: 'MATCHA', onSubmit(word, correct) { } });
```

**Implementation note:** 3 sequential word-lock rounds. Each word has correct letters + 5 random decoys per reel.

**On solve:** Awards Chalkboard Ready (#31). Combined with stock puzzle completion, unlocks The Floor.

**Hints:**
1. "The Manager suggested three specials. Think classic café drinks."
2. "Five letters each for the first two. Six for the third. All on the menu."
3. "MOCHA, LATTE, MATCHA."

**Lore:**

| ID | Label | Title | Content |
|----|-------|-------|---------|
| 303 | Read the small print at the bottom of the chalkboard frame | Proverbs 16:3 | "Commit your work to the Lord, and your plans will be established." |

---

### Room: Service Counter (Card #30) — Act 3 (Revisited)

> Closing time. You count the cash: $89. POS shows 17 transactions, $89 total. Perfect match. Then you count the cups in the wash basin. Hot cups: 15. Cold cups: 6. Total: 21. But you only sold 17 drinks. And there are 4 more cups on the corner table. The math breaks.

**Image:** `assets/service-counter-act3.png`

**Act 3 Discoveries:**

| Label | Card | Type | Title | Puzzle |
|-------|------|------|-------|--------|
| Count the cash and receipts | #77 | 🔵 Object | Cash Reconciliation ($89) | — |
| Count cups in the wash | #78 | 🔵 Object | Cup Count (21 washed) | — |
| Cross-reference the order tickets | #79 | 🔵 Object | Order Ticket Breakdown | — |
| Work through the evidence | #80 | 🔴 Item | Evidence Complete | cups |

**Card #77 — Cash Reconciliation:**
> Cash: $89.00. Receipts: 17. POS total: $89.00. Everything matches perfectly. No theft. No error. The money is clean.

**Card #78 — Cup Count (21 washed):**
> Hot cups in wash: 15. Cold cups: 6. Total washed: 21. But only 17 drinks sold. 4 extra cups in the wash — served but never charged.

**Card #79 — Order Ticket Breakdown:**
> From the 17 order tickets:
> - Lattes (3) = 3 shots
> - Cappuccinos (3) = 3 shots
> - Flat White (1) = 1 shot
> - Long Blacks (2) = 2 shots
> - Mocha (1) = 1 shot
> - Iced Latte (1) = 1 shot
> - Iced Long Black (2) = 2 shots
> - Matcha/Butterfly Pea (4) = 0 shots
>
> **Total coffee drinks: 13 = 13 shots from your orders.**

**Puzzle: Evidence (keypad-lock with 10 steps)**

| ID | Type | UI | Description |
|----|------|----|-------------|
| cups | keypad_lock | keypad-lock | 10 sequential number inputs — cup count + shot recon |

```js
new KeypadLock(el, {
  answer: '21',  // each step has its own answer, managed by wrapper
  falseOutputs: [
    'That doesn\'t match. Count again.',
    'Check your arithmetic.',
    'Look at the evidence cards.'
  ],
  onSubmit() { },
  onWrong(msg) { }
});
```

**10 Steps (sequential keypad entries):**

| Step | Prompt | Answer | Narrative |
|------|--------|--------|-----------|
| 1 | "Hot cups in wash basin?" | 15 | You count carefully. Fifteen. |
| 2 | "Cold cups in wash basin?" | 6 | Six cold cups. |
| 3 | "Total cups washed?" | 21 | 15 + 6 = 21 cups went through service today. |
| 4 | "Cups on the corner table?" | 4 | Four cups with names. Simon, Thomas, Nathanael, James. |
| 5 | "Total cups used today?" | 25 | 21 washed + 4 on table = 25 total. |
| 6 | "POS transactions (drinks sold)?" | 17 | Seventeen paid orders. Cash matches. |
| 7 | "Unaccounted cups (total − sold)?" | 8 | 25 − 17 = 8 drinks nobody paid for. |
| 8 | "Coffee shots from your 17 orders?" | 13 | Count from tickets: 13 coffee drinks = 13 shots. |
| 9 | "Add calibration shot. Total known shots?" | 14 | 13 + 1 calibration = 14 shots you can account for. |
| 10 | "Machine counter minus known shots = unexplained?" | 7 | 21 − 14 = 7 shots you didn't pull. Someone else did. |

**On solve:** Awards Evidence Complete (#80). Unlocks Brew Station (Act 3). Narrative: "Seven extra shots. Eight phantom drinks. The machine doesn't lie. Someone was here."

**Hints:**
1. "Start with what you can count: cups in the wash, cups on the table."
2. "The POS says 17 sold. But 25 cups were used. The difference is the mystery."
3. "Step 10: The machine says 21 total shots. You account for 14. The gap is 7."

**Lore:**

| ID | Label | Title | Content |
|----|-------|-------|---------|
| 304 | Notice the receipt with no order number | Mystery Receipt | A receipt with no timestamp, no order number. Just a handwritten note: "On the house. — M" |
| 305 | Read the verse under the POS | John 21:12 | "Jesus said to them, 'Come and have breakfast.' None of the disciples dared ask him, 'Who are you?' They knew it was the Lord." |



---

### Room: The Floor (Card #40) — Act 1

> The gathering area. Tables and chairs in morning sunlight. You set up table numbers, straighten chairs, wipe surfaces. The room is empty and quiet. You take a breath. You're ready. You're alone, but you're ready. You flip the sign to OPEN.

**Image:** `assets/the-floor.png`

**Discoveries:**

| Label | Card | Type | Title | Puzzle |
|-------|------|------|-------|--------|
| Set up the tables | #41 | 🔵 Object | Tables Ready | — |
| Notice table 5 in the corner | #42 | 🔵 Object | Corner Table (#5) | — |
| Flip the sign to OPEN | #43 | 🟡 Event | Café Open | — |

**Card #41 — Tables Ready:**
> Eight tables, each with a small numbered stand. All clean. All empty. No cups anywhere. Remember this.

**Card #42 — Corner Table (#5):**
> Table 5, tucked in the corner by the window. Sunlight falls across it. The table number stand reads "**5**". Something about this spot feels... set apart.
>
> *Key detail: The number 5 is planted here for the safe puzzle.*

**Card #43 — Café Open (Event):**
> You flip the sign. "Lord, help me get through this." The first customer walks in. The rush begins.
>
> *This event triggers the Act 2 → Act 3 transition after a timed pause.*

**Lore:**

| ID | Label | Title | Content |
|----|-------|-------|---------|
| 306 | Read the framed verse by the door | John 21:4 | "Early in the morning, Jesus stood on the shore, but the disciples did not realize that it was Jesus." |

---

### Room: The Floor (Card #40) — Act 3 (Revisited)

> The last customer leaves. You grab a tub and start clearing tables. Most are clean — people bussed their own cups. But table 5 in the corner... four cups. Still slightly warm. Each has a name written in handwriting that isn't yours: Simon, Thomas, Nathanael, James.

**Image:** `assets/the-floor-act3.png`

**Act 3 Discoveries:**

| Label | Card | Type | Title | Puzzle |
|-------|------|------|-------|--------|
| Clear the tables | #81 | 🔵 Object | Tables Cleared | — |
| Examine the corner table cups | #82 | 🔴 Item | Four Mystery Cups | — |
| Read the names on the cups | #83 | 🔵 Object | Cup Names | — |

**Card #81 — Tables Cleared:**
> Seven tables clean. Customers bussed their own today. Only table 5 has cups left.

**Card #82 — Four Mystery Cups:**
> Four cups on table 5. Still warm. You didn't serve this table. You don't remember anyone sitting here. But the cups are real. The coffee is real. Someone sat here and was served.

**Card #83 — Cup Names:**
> Written in neat handwriting — not yours:
> - "Simon" — Long Black
> - "Thomas" — Flat White
> - "Nathanael" — Cappuccino
> - "James" — Latte
>
> You know these names. You've read them before. But where?

*Finding the corner table cups triggers access to Service Counter (Act 3).*

**Lore:**

| ID | Label | Title | Content |
|----|-------|-------|---------|
| 307 | Notice the charcoal sketch on the wall near table 5 | The Shore | A simple charcoal drawing: a beach, a fire, bread, fish. No artist signature. You've never noticed it before. Was it always there? |

---

### Room: The Floor (Card #40) — Act 4

> You walk back to the floor. The corner table. The four cups. The charcoal sketch on the wall. The sunlight through the windows. This isn't just a café. This is the shore. And He was here the whole time.

**Image:** `assets/the-floor-act4.png`

**Act 4 Discoveries:**

| Label | Card | Type | Title | Puzzle |
|-------|------|------|-------|--------|
| Open the cash safe | #90 | 🔵 Object | The Cash Safe | safe |
| Read the Manager's final note | #91 | 🔵 Object | Manager's Final Note | — |

**Card #91 — Manager's Final Note:**
> Tucked under the safe, a folded card:
> ```
> Today's code — you already saw it.
> The machine. The table. The jug.
> 
> You were never alone.
> — The Manager
> ```

**Puzzle: The Cash Safe (rotation-lock)**

| ID | Type | UI | Description |
|----|------|----|-------------|
| safe | rotation_lock | rotation-lock | 3 dials — code planted across earlier scenes |

```js
new RotationLock(el, {
  dials: [
    { symbols: ['0','1','2','3','4','5','6','7','8','9'], answer: 1 },
    { symbols: ['0','1','2','3','4','5','6','7','8','9'], answer: 5 },
    { symbols: ['0','1','2','3','4','5','6','7','8','9'], answer: 3 }
  ],
  revealCorrect: false,
  falseOutputs: [
    'The handle jiggles. Wrong combination.',
    'Nothing. Try again.',
    'The safe stays locked. Think about what you saw today.'
  ],
  onSubmit() { },
  onWrong(msg) { }
});
```

**Answer: 1-5-3** (153 — the miraculous catch)

**Clue sources planted earlier:**
- **1** — Shot counter flickered to "1" during warmup (Brew Station, Act 1, Card #22)
- **5** — Corner table number stand reads "5" (The Floor, Act 1, Card #42)
- **3** — Milk jug batch label "C-**3**" (Store Room, Act 1, Card #13)

**On solve:** Event #999 — Safe opens. Net animation: 🐟 fish fill a net visual, counter ticks 0→153, colors shift blue→gold. Then closing monologue plays.

**Reward animation:**
- Net visual appears below the safe
- Fish emoji fill in accelerating batches (~3s)
- Counter: 0 → 153, color shifts blue → gold
- Net border glows gold when full
- 1.2s pause → ending narrative plays

**Hints:**
1. "The Manager's note says: 'The machine. The table. The jug.' What numbers did you see there?"
2. "Shot counter showed 1. Table number was 5. Jug batch ended in 3."
3. "The code is 1-5-3. The number of the miraculous catch."

**Lore:**

| ID | Label | Title | Content |
|----|-------|-------|---------|
| 308 | Read the card inside the safe | John 21:11 | "Simon Peter climbed back into the boat and dragged the net ashore. It was full of large fish, 153, but even with so many the net was not torn." |
| 309 | Turn over the card | The Miracle of 153 | "153 is the 17th triangular number. 1+2+3+...+17 = 153. There were 17 orders today. The net holds everything together — and does not break." |



---

## Combinations

| Card A | Card B | Result | Type | Description |
|--------|--------|--------|------|-------------|
| #82 (Four Mystery Cups) | #78 (Cup Count) | #84 (Event: Cup Math Confirmed) | item_object | Cross-reference mystery cups with wash count |
| #74 (Shot Counter 21) | #79 (Order Ticket Breakdown) | #85 (Event: Shot Discrepancy) | item_object | Compare machine counter to order tickets |
| #70 (Third Jug) | #71 (Bean Bag Evidence) | #86 (Event: Supply Discrepancy) | item_object | Third jug + extra beans = someone used supplies |
| #76 (Milk Jug Solved) | #80 (Evidence Complete) | #87 (Event: Full Picture) | item_item | All evidence points to one conclusion |
| #73 (Names Puzzle Done) | #91 (Manager's Final Note) | #92 (Event: The Code Hint) | item_object | The names lead you to understand the note |

**Combination Events:**

| Card | Title | Reveals | Description |
|------|-------|---------|-------------|
| #84 | Cup Math Confirmed | — | "21 in the wash + 4 on the table = 25. Only 17 sold. 8 drinks appeared from nowhere." |
| #85 | Shot Discrepancy | — | "The machine pulled 21 shots. You only made 14. Seven shots — someone else's hands." |
| #86 | Supply Discrepancy | — | "A third jug. Extra beans. Someone restocked mid-shift without you noticing." |
| #87 | Full Picture | #73 access | "Cups. Shots. Milk. Beans. Every piece of evidence says the same thing: you weren't alone." |
| #92 | The Code Hint | — | "The machine (1). The table (5). The jug (3). You already have the answer." |

---

## Dependency Chain (Critical Path)

```
START
  │
  ▼
[Store Room — Act 1]
  │ puzzle: stock (match_lock) → #12
  │ observe: milk jug labels (#13 — plants "3")
  │
  ▼
[Brew Station — Act 1]
  │ observe: Manager's note (#21 — grind 7/dose 5/yield 4)
  │ observe: shot counter flicker (#22 — plants "1")
  │ puzzle: grinder (slider_lock) → #23
  │   unlocks Service Counter
  │
  ▼
[Service Counter — Act 1]
  │ puzzle: chalkboard (word_lock) → #31
  │   (stock #12 + chalkboard #31 → unlocks The Floor)
  │
  ▼
[The Floor — Act 1]
  │ observe: corner table #5 (#42 — plants "5")
  │ event: flip sign → café open (#43)
  │   triggers Act 3 after timed pause
  │
  ═══════════ ACT 3 BEGINS ═══════════
  │
  ▼
[The Floor — Act 3]
  │ discover: corner table cups (#82)
  │   unlocks Service Counter (Act 3)
  │
  ▼
[Service Counter — Act 3]
  │ discover: cup count (#78), order tickets (#79)
  │ puzzle: evidence (keypad_lock, 10 steps) → #80
  │   unlocks Brew Station (Act 3)
  │
  ▼
[Brew Station — Act 3]
  │ discover: shot counter 21 (#74)
  │ puzzle: milk-jug (multi-step) → #76
  │   unlocks Store Room (Act 3)
  │
  ▼
[Store Room — Act 3]
  │ discover: third jug (#70), beans (#71), cups (#72)
  │ puzzle: names (choice cascade) → #73
  │   unlocks The Floor (Act 4)
  │
  ═══════════ ACT 4 BEGINS ═══════════
  │
  ▼
[The Floor — Act 4]
  │ discover: Manager's final note (#91)
  │ puzzle: safe (rotation_lock) → 1-5-3
  │   = Event #999 — ENDING
  │
  ▼
 END
```

### Optional Paths (Lore / Combinations)

```
[Store Room Act 1] → Lore #300 (Lamentations 3:22-23)
[Brew Station Act 1] → Lore #301 (John 21:6)
[Service Counter Act 1] → Lore #303 (Proverbs 16:3)
[The Floor Act 1] → Lore #306 (John 21:4)
[Service Counter Act 3] → Lore #304 (Mystery Receipt), #305 (John 21:12)
[Brew Station Act 3] → Lore #302 (Manager's Schedule)
[The Floor Act 3] → Lore #307 (The Shore sketch)
[The Floor Act 4] → Lore #308 (John 21:11), #309 (Triangular number)
```

---

## Timed Events

| Time Remaining | Type | Event |
|---|---|---|
| 40:00 | narrative | you: "Okay. Store room first. Grab what I need. I can do this." |
| 35:00 | narrative | narrator: "The machine is warming up. Follow the Manager's instructions." |
| 25:00 | narrative | narrator: "The rush is over. The café is quiet. Time to close." (Act 3 trigger) |
| 20:00 | alert | **MID-EVENT:** you: "The shot counter says 21. But I only pulled 14..." |
| 15:00 | narrative | narrator: "The evidence is mounting. Someone was here." |
| 10:00 | narrative | narrator: "The names on the cups. You know them. Think." |
| 5:00 | narrative | narrator: "The machine. The table. The jug. The answer is in what you already saw." |

**Triggered Events:**

| Trigger | Event | Effect |
|---------|-------|--------|
| puzzle_solved: stock | Stock gathered | Unlock Brew Station |
| puzzle_solved: grinder | Grinder dialed in | Unlock Service Counter |
| puzzle_solved: chalkboard (+ stock done) | Counter ready | Unlock The Floor |
| event: #43 (café open) + timer | Act 3 begins | Floor transitions to Act 3 state |
| discovery: #82 (corner cups) | Cups found | Unlock Service Counter (Act 3) |
| puzzle_solved: cups | Evidence complete | Unlock Brew Station (Act 3) |
| puzzle_solved: milk-jug | Milk mystery solved | Unlock Store Room (Act 3) |
| puzzle_solved: names | Names understood | Unlock The Floor (Act 4) |
| puzzle_solved: safe | Net fills | Event #999 — Ending |



---

## Card Index

### Locations (🟢)

| ID | Title | Room | Image |
|----|-------|------|-------|
| 10 | Store Room | store-room | store-room.png |
| 20 | Brew Station | brew-station | brew-station.png |
| 30 | Service Counter | service-counter | service-counter.png |
| 40 | The Floor | the-floor | the-floor.png |

### Objects (🔵) — Act 1

| ID | Title | Room | Image |
|----|-------|------|-------|
| 11 | Prep Checklist | store-room | card-checklist.png |
| 13 | Milk Jug Labels | store-room | card-jug-labels.png |
| 21 | Manager's Note | brew-station | card-manager-note.png |
| 22 | Shot Counter (000) | brew-station | card-shot-counter.png |
| 32 | Counter Setup | service-counter | card-counter-setup.png |
| 33 | POS Starting Balance | service-counter | card-pos.png |
| 34 | Ice Count (72) | service-counter | card-ice-count.png |
| 41 | Tables Ready | the-floor | card-tables.png |
| 42 | Corner Table (#5) | the-floor | card-corner-table.png |

### Items (🔴) — Act 1

| ID | Title | Room | Image |
|----|-------|------|-------|
| 12 | Supply Run Complete | store-room | card-supplies.png |
| 23 | Grinder Dialed In | brew-station | card-grinder-done.png |
| 31 | Chalkboard Ready | service-counter | card-chalkboard.png |

### Events (🟡) — Act 1

| ID | Title | Room | Reveals |
|----|-------|------|---------|
| 43 | Café Open | the-floor | Act 3 transition |

### Objects (🔵) — Act 3

| ID | Title | Room | Image |
|----|-------|------|-------|
| 70 | The Third Jug | store-room | card-third-jug.png |
| 71 | Bean Bag Evidence | store-room | card-beans.png |
| 72 | Cup Sleeve (Empty) | store-room | card-empty-sleeve.png |
| 74 | Shot Counter (21) | brew-station | card-shot-21.png |
| 75 | Portafilter Evidence | brew-station | card-portafilters.png |
| 77 | Cash Reconciliation | service-counter | card-cash.png |
| 78 | Cup Count (21 washed) | service-counter | card-cup-count.png |
| 79 | Order Ticket Breakdown | service-counter | card-tickets.png |
| 81 | Tables Cleared | the-floor | card-tables-cleared.png |
| 82 | Four Mystery Cups | the-floor | card-mystery-cups.png |
| 83 | Cup Names | the-floor | card-cup-names.png |

### Items (🔴) — Act 3

| ID | Title | Room | Image |
|----|-------|------|-------|
| 73 | The Names on the Cups | store-room | card-names-solved.png |
| 76 | Milk Jug Mystery Solved | brew-station | card-milk-solved.png |
| 80 | Evidence Complete | service-counter | card-evidence.png |

### Events (🟡) — Act 3 Combinations

| ID | Title | Reveals |
|----|-------|---------|
| 84 | Cup Math Confirmed | — |
| 85 | Shot Discrepancy | — |
| 86 | Supply Discrepancy | — |
| 87 | Full Picture | #73 access |

### Act 4 Cards

| ID | Type | Title | Room | Image |
|----|------|-------|------|-------|
| 90 | 🔵 object | The Cash Safe | the-floor | card-safe.png |
| 91 | 🔵 object | Manager's Final Note | the-floor | card-final-note.png |
| 92 | 🟡 event | The Code Hint | the-floor | — |

### Ending

| ID | Type | Title |
|----|------|-------|
| 999 | 🟡 event | The Net Holds — 153 |

### Lore / Scripture Fragments (🟣)

| ID | Title | Room | Source |
|----|-------|------|--------|
| 300 | Lamentations 3:22-23 | store-room | Clipboard |
| 301 | John 21:6 | brew-station | Hopper lid |
| 302 | Manager's Schedule | brew-station (Act 3) | Behind machine |
| 303 | Proverbs 16:3 | service-counter | Chalkboard frame |
| 304 | Mystery Receipt | service-counter (Act 3) | Under POS |
| 305 | John 21:12 | service-counter (Act 3) | Under POS |
| 306 | John 21:4 | the-floor | By the door |
| 307 | The Shore (sketch) | the-floor (Act 3) | Wall near table 5 |
| 308 | John 21:11 | the-floor (Act 4) | Inside safe |
| 309 | The Miracle of 153 | the-floor (Act 4) | Back of safe card |

---

## Scoring

| Factor | Points |
|--------|--------|
| Completed | 50 base |
| Time remaining | +1 per minute left |
| Hints used | -3 per hint |
| Lore fragments found (10) | +2 each |
| All lore found | +5 bonus |
| Combinations discovered (5) | +2 each |
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
> 🐟 **John 21:1-14** — After the resurrection, the disciples went fishing and caught nothing all night. Jesus appeared on the shore at dawn. "Cast the net on the right side." They obeyed. 153 large fish — and the net didn't break. Breakfast was already waiting on the shore.
>
> ☕ **The Café Connection** — You thought you were alone. You thought the day depended on your effort. But the Manager was there the whole time — pulling shots, serving customers, restocking milk. He didn't announce himself. He just served.
>
> 🔢 **The Numbers** — 21 shots (7 extra). 25 cups (8 unaccounted). A third milk jug. The evidence isn't of theft — it's of grace. Someone served freely, without record, without payment.
>
> 🎣 **153** — The 17th triangular number (1+2+3+...+17 = 153). There were 17 paid orders. The net holds everything — and does not break.
>
> 🔑 **The Three Clues** — The shot counter (1), the table number (5), the jug batch (3). He planted the answer in the morning, before the rush even started. He provides before we ask.
>
> *You didn't just close a café. You traced the fingerprints of the One who was beside you all along.*
