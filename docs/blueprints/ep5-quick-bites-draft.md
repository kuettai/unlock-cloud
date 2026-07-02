# Scenario Blueprint Draft: "Quick Bites"

## Status: DESIGN (Story + Puzzle Structure locked)

## Meta

- **Episode:** 5
- **Title:** Quick Bites
- **Arc:** AI Unit — Real World
- **Category:** AWS
- **Duration:** 60 minutes
- **Players:** 2–6 (recommended 3–4)
- **Difficulty:** Tier 3 — Specialist
- **AWS Topics:** Amazon Quick (Spaces, Quick Index, Quick Research, Quick Sight, Quick Flows, Quick Automate, Chat Agents, Apps, Extensions)
- **Mechanics Used:** craft-lock, trap-disarm-lock, deduction-grid-lock, push-luck-lock, wager-lock, auction-lock, decay-lock, fog-map-lock, sort-lock, wire-lock, match-lock, NPC dialog, card combinations, timed mid-event

---

## Core Concept

**Player is a new hire at QuickBite** — a fast-food startup opening their 10th store. Three founders, ten stores, one investor call in 55 minutes. Nobody can answer a simple question because data lives in 15 different places.

Then you discover Amazon Quick — and suddenly you can find anything, research anything, visualize anything, and automate anything. By end of day, you're running the company from one screen.

**The player experiences the Amazon Quick journey:**
1. Chaos → organize with **Spaces**
2. Silos → connect with **Quick Index**
3. Unknowns → investigate with **Quick Research**
4. Raw data → present with **Quick Sight**
5. Manual scramble → orchestrate with **Quick Flows**

---

## Characters

### Chef Marco (CEO)
- Creative genius, terrible with numbers
- Passionate, scattered, speaks in food metaphors
- Wants to launch the Volcano Burger TODAY
- "IT'S ALWAYS THE SAUCE."

### Diana (CFO)
- Data-obsessed, skeptical of everything
- Dry humor, talks fast
- Needs projections for investor call
- "With citations."

### Raj (CIO)
- Built the ordering app in his garage
- Systems held together with duct tape
- Anxious, apologetic, drowning in tickets
- "Sorry. Also welcome aboard."

### Minor NPCs (Research Arc)

| NPC | Location | Role |
|-----|----------|------|
| Suspicious Barista | Chocolot | Notices you taking photos |
| The Gemelli Twins | Panini Gemelli | Identical owners — one friendly, one paranoid |
| Tony the Driver | Tabouleh Express | Gossipy delivery driver, loves to chat |
| Social Media Manager | The Cooker | Frantically deleting bad reviews |

---

## Amazon Quick Module Mapping

### 1. Spaces + Quick Index (Gather & Organize — Early Game)

**The problem:** Each founder has isolated documents only they understand. Individually useless fragments; combined = insights.

**Player experience:**
- Marco's Kitchen: grease-stained recipe binder, training transcripts, sauce formulas
- Diana's Office: spreadsheets, supplier invoices, POS revenue data
- Raj's Closet: system configs, API connections, vendor integrations

**Puzzle mechanic:** CraftLock (tag-based combining) in Marco's Kitchen — combine ingredient data by property tags (cost + recipe = margin, supplier + volume = forecast). Match-lock in the Break Room — categorize collected fragments into Spaces (Kitchen Ops, Finance, Systems, Customer).

**Before/After contrast:**
- Before: "What's our food cost ratio?" → nobody can answer (siloed in 3 places)
- After: Combined Space answers instantly with data from all three founders

---

### 2. Quick Research (Field Reconnaissance — Mid Game)

**Scenario:** Marco wants Volcano Burger approved. Diana won't greenlight without market validation.

**The espionage arc:** Player leaves the office to gather competitive intelligence from 4 rival food businesses. Each location uses a different research approach and a distinct new puzzle mechanic.

See **Room Details: Research Arc** below for full breakdown.

**Payoff:** Compile findings into a Quick Research report. Present to Marco AND Diana. Both convinced because findings come with sources and citations.

---

### 3. Quick Automate (Streamline Processes — Mid Game)

**The frustration (before):**
- Update menu price? → Submit ticket to IT, 2-week turnaround
- Reorder supplies? → Email procurement, back to you Thursday
- Send staff schedules? → That's HR's system, no access

Player is powerless messenger passing notes between departments.

**The breakthrough:** Raj shows you Quick Automate — connect DIRECTLY to systems. No middleman. Each vendor/system has personality quirks.

**Puzzle mechanic:** TrapDisarmLock — Raj's automation panel has wires to cut (connections to make) but the setup manual is partially redacted. Deduce the correct connection order from visible labels + incomplete rules.

---

### 4. Quick Sight (The Numbers — Late Game, Timed)

**Scenario:** Diana has 55 minutes until investor call. Has ALL the data but it's raw and messy.

**Layers:**
1. Build the dataset — wire-lock (link raw data sources to metrics)
2. Ask in plain English — match investor questions to data cards
3. The investor slide — match insight to visualization type (line/bar/pie)
4. What-if scenarios — adjust variables to find realistic-but-optimistic path

**Puzzle mechanic:** WagerLock during the actual investor call (mid-event, timed) — investor asks tough questions. Higher confidence = better impression but wrong answer tanks trust. Forces metacognition: "how sure am I about these numbers?"

**Comedy:**
- Marco: "Just show them a photo of the Volcano Burger."
- Diana: "They want 40% YoY revenue increase, not a burger."
- Marco: "...what if the burger IS the 40% increase?"
- Diana: *pulls up item-level breakdown* — Marco was right.

---

### 5. Quick Flows (Grand Finale — Store Opening Automation)

**Before:** Every store opening is a scramble. Store #6 opened without a freezer. Store #8 forgot napkins for a week.

**Player experience:** First explore Store #10 (FogMapLock — discover what's missing/needed), then arrange automation steps in correct sequence with conditions.

**Step cards (collected throughout the game):**
- Confirm health inspection (MUST be first)
- Order opening-day inventory (needs supplier connection from Automate)
- Send staff schedules (needs employee list from Spaces)
- Test POS system (needs WiFi first)
- Set up WiFi and tablets (after inspection)
- Print menus (needs Marco's approval)
- Marco approves menu (needs food cost from Quick Sight)
- Calculate food cost (needs recipe + pricing from Spaces)
- Social media announcement (ONLY IF inspection passed)
- Order backup generator (ONLY IF store in problem area — from Research)

**Puzzle layers:**
1. FogMapLock — explore the unfinished store to discover what's needed
2. Sort-lock — arrange steps in correct order
3. Conditions — some steps only run IF true (deduction from game state)

**Connects everything:**
- Spaces → where the flow pulls data
- Research → informed which steps are needed
- Automate → the "do" steps (order, send, create)
- Quick Sight → numbers that drive decisions (food cost approval)

**Comedy:** Marco: "DOES THE FLOW INCLUDE SAUCE TASTING?" You add: "Marco approves sauce (mandatory, non-skippable, est. 45 min)"

---

## Room Structure

### Phase 1: HQ — Setup & Organization (4 rooms)

| # | Room | Owner | Quick Feature | Primary Puzzle |
|---|------|-------|---------------|----------------|
| 1 | **Reception / Your Desk** | Player | Intro, Spaces overview | Sort-lock (triage task board) |
| 2 | **Marco's Kitchen Lab** | CEO | Quick Index (data sources) | CraftLock (combine data by tags) |
| 3 | **Diana's Corner Office** | CFO | Quick Sight (datasets) | Wire-lock (link metrics → questions) |
| 4 | **Raj's Server Closet** | CIO | Quick Automate | TrapDisarmLock (redacted connection manual) |

### Phase 2: Shared HQ (1 room)

| # | Room | Owner | Quick Feature | Primary Puzzle |
|---|------|-------|---------------|----------------|
| 5 | **The Break Room** | Shared | Spaces (organize) | Match-lock (categorize fragments) |

### Phase 3: Research Arc — Espionage (4 rooms)

| # | Room | Competitor (Real) | Food Business | Puzzle |
|---|------|-------------------|---------------|--------|
| 6 | **Chocolot** | Microsoft Copilot | Chocolate dessert bar | PushLuckLock |
| 7 | **Panini Gemelli** | Google Gemini | Italian fast-casual (twin owners) | WagerLock |
| 8 | **Tabouleh Express** | Salesforce Tableau | Mediterranean delivery dock | AuctionLock |
| 9 | **The Cooker** | Google Looker | Gastropub with social wall | DecayLock |

### Phase 4: Endgame (2 rooms)

| # | Room | Purpose | Quick Feature | Primary Puzzle |
|---|------|---------|---------------|----------------|
| 10 | **War Room / Boardroom** | Investor call (mid-event, timed) | Quick Sight (present) | WagerLock (investor Q&A) |
| 11 | **Store #10 (Unfinished)** | Grand finale — automation | Quick Flows | FogMapLock → Sort-lock |

### Total: 11 rooms

---

## Research Arc — Detailed Room Design

### Room 6: Chocolot (PushLuckLock)

**Competitor reference:** Microsoft Copilot → "Chocolot"

**Setting:** A sleek, dimly-lit chocolate dessert bar. Trendy. Packed. Their "Smart Menu" suspiciously mirrors QuickBite's offerings. You're posing as a customer, photographing intel.

**Intel to gather:** Menu pricing structure, kitchen throughput (visible from bar), loyalty card tiers, seasonal promo calendar on back wall.

**Mechanic:** Each "draw" = snapping a photo or peeking behind the counter. Security scene escalates: barista glances → shift manager appears → cameras pan → security guard approaches. Bank = pocket your phone and pretend to eat a truffle.

**Bag config:**
```js
bag: [
  { type: 'gem', value: 3, label: '📸 Menu photo +3', weight: 3 },
  { type: 'gem', value: 5, label: '📊 Sales board +5', weight: 2 },
  { type: 'gem', value: 8, label: '📋 Full pricing +8', weight: 1 },
  { type: 'bust', value: 0, label: '🚨 "Hey! No photos!"', weight: 2 },
]
target: 25, maxRounds: 4
```

**Comedy:** Their menu items are all "AI-powered" — *"Co-Pilot Truffle: our algorithm chose this flavor for you."* Diana texts: "Get their margin structure." You text back: "I'm eating a $14 chocolate." Diana: "Expense it. With citations."

---

### Room 7: Panini Gemelli (WagerLock)

**Competitor reference:** Google Gemini → "Panini Gemelli" (gemelli = Italian for "twins", also a pasta shape)

**Setting:** Italian fast-casual run by identical twin brothers (the Gemelli brothers). One's friendly, one's suspicious. They take turns on the floor. You never know which twin is watching.

**Intel to gather:** Expansion plans, delivery radius, breakfast menu launch, supplier exclusivity deals.

**Mechanic:** Stake tiers map to approach boldness:
- **Mumble** (1 pt, 0 penalty, 2 choices): Casual chitchat with regulars. "Nice panini, is it new?"
- **Smooth Talk** (2 pts, -1 penalty, 4 choices): Engage the friendly twin. "Business looks great — opening more?"
- **Brazen Lie** (4 pts, -3 penalty, 6 choices): Pose as food blogger, interview suspicious twin. One wrong word = cover blown.

**Stakes config:**
```js
target: 6,
stakes: [
  { label: 'Mumble', wager: 1, penalty: 0, color: '#22c55e', showOptions: 2 },
  { label: 'Smooth Talk', wager: 2, penalty: -1, color: '#eab308', showOptions: 4 },
  { label: 'Brazen Lie', wager: 4, penalty: -3, color: '#ef4444', showOptions: 6 },
]
```

**Comedy:** Both twins respond to "Marco!" The suspicious one keeps almost catching you: "Wait... didn't I see you at that QuickBite on 5th Street?" You: *sweating* "Never heard of it."

---

### Room 8: Tabouleh Express (AuctionLock)

**Competitor reference:** Salesforce Tableau → "Tabouleh Express"

**Setting:** Behind the Mediterranean place — a busy delivery dock at 6 AM. Drivers, suppliers, and kitchen staff mill around. Limited time to buy intel from gossipy contacts.

**Intel to gather:** New catering contract (key), bulk orders revealing expansion (key), staff complaints (decoy), owner's divorce drama (decoy).

**Mechanic:** Each "lot" is a person willing to talk:
```js
budget: 100,
requiredItems: 3,
lots: [
  { id: 'tony', label: '🚚 Tony the Driver', hint: 'Loading heavy crates. Smells like lemon. Mentions "the big new order."', value: 'key', minBid: 20, idealBid: 30 },
  { id: 'cook', label: '🚬 Line Cook on Break', hint: 'Chatty. Keeps checking phone. Mostly complaining about hours.', value: 'decoy', minBid: 10, idealBid: 15 },
  { id: 'produce', label: '🥬 Produce Guy', hint: 'Been here 6 months. Knows every restaurant on the route.', value: 'key', minBid: 25, idealBid: 35 },
  { id: 'assistant', label: '☕ Owner\'s Assistant', hint: 'Grabbing coffees. Nervous. Mentions "expansion paperwork."', value: 'key', minBid: 30, idealBid: 40 },
  { id: 'cleaner', label: '🧹 Night Cleaner', hint: 'Finishing shift. Tired. Talks about "nothing ever changes here."', value: 'decoy', minBid: 5, idealBid: 10 },
  { id: 'inspector', label: '📋 Health Inspector', hint: 'Official clipboard. Won\'t make eye contact. Lips are sealed.', value: 'decoy', minBid: 15, idealBid: 25 },
]
```

Haggling = buying them coffee, helping unload, offering cigarettes. Overpay = waste time on worthless gossip.

**Comedy:** Tony literally says "I'll talk, but you gotta help me carry these 40 trays of falafel." Haggle cost = physical labor. The health inspector just stares at you disapprovingly.

---

### Room 9: The Cooker (DecayLock)

**Competitor reference:** Google Looker → "The Cooker"

**Setting:** A gastropub with a "Live Social Wall" — big screen cycling customer reviews, social posts, food blog mentions. Their marketing manager (corner booth, laptop) is actively deleting negative posts in real-time.

**Intel to gather:** Customer complaints revealing weaknesses, a food blogger's QuickBite comparison, a leaked staff review about losing their head chef, a scrubbed health inspection comment.

**Mechanic:**
```js
fragments: [
  { text: 'Review: "Worst experience at The Cooker. 45 min wait, cold food, rude staff. Will go to QuickBite next time."', decayAfter: 4 },
  { text: 'Staff post: "Head chef interviewing at Gordon\'s place. The Cooker is sinking."', decayAfter: 6 },
  { text: 'Blog: "Comparing The Cooker vs QuickBite: honestly QuickBite wins on speed, price, AND quality."', decayAfter: 8 },
  { text: 'Health note: "Third complaint about kitchen temp this month. Inspector due Friday."', decayAfter: 5 },
],
question: 'What is The Cooker\'s biggest operational vulnerability?',
answer: 'head chef',
decayRate: 1.5
```

Posts appear on the social wall with different decay timers — the marketing manager is prioritizing which fires to put out.

**Comedy:** The marketing manager mutters "Delete... delete... oh god delete that one too" while stress-eating their own food. At one point they look up and make eye contact with you. You pretend to be reading the beer menu.

---

## Narrative Arc

| # | Beat | Player Feels | Quick Feature |
|---|------|-------------|---------------|
| 1 | **Opening** | Overwhelmed, lost | None yet — chaos |
| 2 | **HQ exploration** | Detective, explorer | Spaces, Quick Index |
| 3 | **Espionage arc** | Spy, thrilled, tense | Quick Research |
| 4 | **Mid-event** | Panicked, pressured | Quick Sight (investor call) |
| 5 | **Store #10** | Mastermind, conductor | Quick Flows |
| 6 | **Finale** | Triumphant | All features converge |

---

## Narrative

### Voices

| Key | Polly Voice | Role |
|-----|-------------|------|
| narrator | Joanna | Story narrator — warm, comedic timing |
| system | Matthew | System alerts — corporate memo style |
| marco | Brian | Chef Marco — passionate, scattered, loud |
| diana | Amy | Diana — fast, dry, skeptical |
| raj | Raveena | Raj — anxious, apologetic, technical |

### Intro

| Voice | Line | Pause |
|-------|------|-------|
| narrator | QuickBite HQ. A cramped co-working space that smells like test-kitchen grease and ambition. Whiteboards everywhere. Post-its on the ceiling. | 800ms |
| narrator | You're the new Executive Assistant. Your first day. You don't even have a login yet. | 600ms |
| marco | *bursting through the kitchen door, apron covered in hot sauce* — YOU! New person! I need the food cost ratio for the Volcano Burger BY NOON or Diana will kill the launch! | 1000ms |
| diana | *appearing from her office, phone in each hand* — Ignore him. I need a competitive analysis deck for the investor call. Which is in — *checks watch* — fifty-five minutes. With citations. | 1000ms |
| raj | *poking head out of a server closet* — Hi! Sorry! Also the POS system is down at Store #4. And Store #7's fryer is literally on fire. Not metaphorically. Welcome aboard! | 800ms |
| narrator | Three founders. Ten stores. One investor call in fifty-five minutes. And nobody can answer a single question because the data lives in fifteen different places. | 800ms |
| narrator | Your sixty minutes start now. | — |

### Mid-Event (at 25:00 remaining)

| Voice | Line | Pause |
|-------|------|-------|
| system | **INCOMING: Investor call moved up. Diana needs you in the War Room in 2 minutes.** | 800ms |
| diana | They moved it up! The call is NOW! Get in here — do you have the numbers? Do you have the deck? | 600ms |
| marco | TELL THEM ABOUT THE VOLCANO BURGER! | 400ms |
| narrator | Diana's already dialing. The boardroom screen blinks to life. Three investors stare back. This is happening. | — |

### Ending (Success)

| Voice | Line | Pause |
|-------|------|-------|
| narrator | The investor call ends. Diana's face cracks — is that a smile? That might be a smile. | 800ms |
| system | **INVESTMENT CONFIRMED. Series C secured.** | 600ms |
| marco | I TOLD you. The Volcano Burger! They loved the numbers! They said "impressive margins!" That's the sauce! | 800ms |
| diana | They loved the *research*. The competitive analysis. The fact that we had CITATIONS. On your first day. | 600ms |
| raj | Store #10's opening sequence just ran automatically. Every step. No tickets. No scramble. I didn't get a single phone call. | 800ms |
| raj | That's... that's never happened before. *tearing up* | 600ms |
| narrator | Three founders look at you. The new hire. Who organized the chaos, researched the market, automated the opening, and won the money. On day one. | 800ms |
| marco | So. Chief Operating Officer. Interested? | 400ms |
| narrator | You take a bite of the Volcano Burger. It's perfect. | — |

### Ending (Failure)

| Voice | Line | Pause |
|-------|------|-------|
| system | **Time expired. Investor call: incomplete.** | 800ms |
| narrator | The investors smile politely. "Send us the deck when it's ready." The kind of polite that means no. | 600ms |
| diana | We'll get them next time. The data was there — we just need to be faster at connecting it. | 600ms |
| raj | Store #10 opened anyway. There were... issues. But nobody got hurt. Mostly. | 400ms |
| marco | The Volcano Burger was still perfect. That part went great. | 600ms |
| narrator | Tomorrow you'll know where to find everything. How to research faster. How to automate instead of scramble. Quick learns, and so do you. | — |

---

## Room Graph

```
                ┌──────────── QUICKBITE HQ ──────────────────────┐
                │                                                  │
                │  [Reception] ──(start)──▶ HUB                   │
                │                            │                     │
                │              ┌─────────────┼──────────────┐      │
                │              │             │              │      │
                │        [Marco's       [Diana's       [Raj's     │
                │         Kitchen]       Office]        Closet]   │
                │              │             │              │      │
                │              └─────────────┼──────────────┘      │
                │                            │                     │
                │                      [Break Room]                │
                │                       (need 3 fragments)         │
                │                            │                     │
                └────────────────────────────┼─────────────────────┘
                                             │
                ┌──────── FIELD RESEARCH ─────┼─────────────────────┐
                │                            │                      │
                │   [Chocolot]  [Panini    [Tabouleh   [The        │
                │               Gemelli]    Express]    Cooker]    │
                │      │           │           │          │        │
                │      └───────────┴───────────┴──────────┘        │
                │               (need 3/4 research cards)          │
                └──────────────────────┼────────────────────────────┘
                                       │
                ┌──── ENDGAME ─────────┼────────────────────────────┐
                │                      │                            │
                │              [War Room]  ◀── mid-event trigger    │
                │                   │                               │
                │              [Store #10]  ◀── isFinal             │
                │                                                   │
                └───────────────────────────────────────────────────┘
```

### Room Unlock Conditions

| Room | Unlocked By | Notes |
|------|-------------|-------|
| Reception | — | Starting room |
| Marco's Kitchen | Start (always open) | Parallel with Diana + Raj |
| Diana's Office | Start (always open) | Parallel with Marco + Raj |
| Raj's Closet | Start (always open) | Parallel with Marco + Diana |
| Break Room | Have data fragments from all 3 founders | Combination gate |
| Chocolot | Break Room solved | Research arc opens |
| Panini Gemelli | Break Room solved | Parallel research |
| Tabouleh Express | Break Room solved | Parallel research |
| The Cooker | Break Room solved | Parallel research |
| War Room | 3/4 research cards obtained | Mid-event triggers on entry |
| Store #10 | War Room investor call complete | Final room |

---

## Dependency Chain (Critical Path)

```
START
  │
  ├─▶ Marco's Kitchen ──▶ Recipe Data Card
  ├─▶ Diana's Office ──▶ Financial Data Card
  ├─▶ Raj's Closet ──▶ Systems Data Card
  │
  ▼
Break Room (combine 3 data cards → Research Briefing)
  │
  ├─▶ Chocolot ──▶ Research Card: Pricing Intel
  ├─▶ Panini Gemelli ──▶ Research Card: Expansion Intel
  ├─▶ Tabouleh Express ──▶ Research Card: Supply Chain Intel
  ├─▶ The Cooker ──▶ Research Card: Weakness Intel
  │
  ▼ (3/4 needed)
War Room (WagerLock — investor Q&A under pressure)
  │
  ▼
Store #10 (FogMapLock → Sort-lock — automation finale)
  │
  ▼
END
```

### Optional/Bonus Path
- Each founder room has 1 lore card (deeper Quick feature explanation)
- Each research room has a bonus "detail" card for scoring (gathered if you exceed the puzzle target)
- War Room: "What-if" bonus puzzle after investor call (Quick Sight scenarios)
- Store #10: App Workshop bonus (Quick Apps — build a staff ordering tool)

---

## Scoring (Draft)

| Component | Points |
|-----------|--------|
| Base (complete all required puzzles) | 600 |
| Time bonus (per minute under 60) | +15/min |
| Research bonus (all 4 rooms instead of 3) | +100 |
| Investor call confidence (high-wager correct answers) | +50 max |
| Store #10 optimal flow (all steps correct first try) | +75 |
| Lore cards collected (×3 founders + ×4 research) | +25 each |
| Hint penalty | -30 per hint |
| Wrong combination penalty | -15 per wrong |
| **Maximum possible** | ~1200 |

| Stars | Threshold |
|-------|-----------|
| ⭐ | 400 (complete) |
| ⭐⭐ | 650 (good) |
| ⭐⭐⭐ | 900 (excellent) |

---

## Progression / Emotional Arc

| Stage | Player Feels | Quick Feature | Room(s) |
|---|---|---|---|
| Chaos | Overwhelmed, powerless | None — the problem | Reception |
| Gathering | Detective, explorer | Spaces + Quick Index | Marco, Diana, Raj |
| Organizing | Connector, synthesizer | Spaces (combine) | Break Room |
| Espionage | Spy, thrilled, tense | Quick Research | Chocolot, Gemelli, Tabouleh, Cooker |
| Presenting | Pressured, confident | Quick Sight | War Room |
| Orchestrating | Mastermind, conductor | Quick Flows | Store #10 |
| Triumph | COO energy | All converge | Ending |

---

## Room Details — Puzzle Configs

### Room 1: Reception / Your Desk

**Description:** A cramped desk near the entrance. A whiteboard task board is already overflowing with sticky notes from three different handwriting styles. Post-its on every surface. Your laptop isn't even set up yet.

**Puzzle: Sort Lock (triage the task board)**

```js
new SortLock(el, {
  items: [
    "Build the investor deck with Diana's numbers",
    "Set up auto-open so stores launch at 5 AM",
    "Find where Marco hid the recipe files",
    "Hook up the supplier ordering portal",
    "Dig into what competitors charge for delivery",
    "Sort the shared drive before it eats itself"
  ],
  answer: [
    "Find where Marco hid the recipe files",
    "Sort the shared drive before it eats itself",
    "Hook up the supplier ordering portal",
    "Dig into what competitors charge for delivery",
    "Build the investor deck with Diana's numbers",
    "Set up auto-open so stores launch at 5 AM"
  ],
  onSubmit(correct) { }
});
```

**Solve logic:** Gather info (Index) → Organize (Spaces) → Connect (Automate) → Research → Present (Sight) → Orchestrate (Flows). Teaches the Amazon Quick journey order.

---

### Room 2: Marco's Kitchen Lab

**Description:** A test kitchen that doubles as an office. Grease-stained recipe binders lean against a monitor showing food photos. The sauce wall has 47 labeled bottles. Somewhere under the chili flakes is a cost spreadsheet.

**Puzzle: Craft Lock (combine data by tags)**

```js
new CraftLock(el, {
  materials: [
    { id: 'recipe-card', label: '📋 Recipe Card', tags: ['food', 'raw'] },
    { id: 'cost-sheet', label: '💵 Cost Sheet', tags: ['financial', 'raw'] },
    { id: 'supplier-list', label: '📦 Supplier List', tags: ['vendor', 'raw'] },
    { id: 'calculator', label: '🧮 Calculator', tags: ['math'], permanent: true },
    { id: 'marcos-notebook', label: "📓 Marco's Notebook", tags: ['food', 'secret'] },
    { id: 'pos-export', label: '🖥️ POS Export', tags: ['financial', 'digital'] }
  ],
  rules: [
    { inputs: ['food', 'secret'], output: { id: 'full-recipe', label: '📖 Complete Recipe', tags: ['food', 'detailed'] } },
    { inputs: ['financial', 'vendor'], output: { id: 'vendor-pricing', label: '🏷️ Vendor Pricing Matrix', tags: ['financial', 'detailed'] } },
    { inputs: ['food', 'detailed'], output: { id: 'ingredient-breakdown', label: '🥩 Ingredient Breakdown', tags: ['ingredient', 'costed'] } },
    { inputs: ['financial', 'detailed'], output: { id: 'unit-costs', label: '💰 Unit Cost per Ingredient', tags: ['ingredient', 'priced'] } },
    { inputs: ['costed', 'priced'], output: { id: 'cost-per-item', label: '📊 Cost per Menu Item', tags: ['analysis', 'partial'] } },
    { inputs: ['analysis', 'math'], output: { id: 'food-cost-analysis', label: '✅ Food Cost Analysis', tags: ['final'] } }
  ],
  goal: 'food-cost-analysis',
  onSubmit(correct) { }
});
```

**Chain:** Recipe + Notebook → Complete Recipe. Cost + Supplier → Vendor Pricing. Then intermediates combine → Cost per Item → Calculator produces final analysis. 3 steps deep.

**Lore Card (Quick Index):** *"You know how I can never find my own recipes? Diana wanted the food cost but the recipe was in my binder, the portions were in my notebook, and the prices were in her spreadsheet. Quick Index is like having one giant searchable pantry — you tell it where all your ingredients live, and it finds them when you need them. No more digging through drawers."* — Marco

---

### Room 3: Diana's Corner Office

**Description:** Dual monitors, both showing spreadsheets. Whiteboards covered in numbers with red circles around alarming ones. A countdown timer on her desk shows minutes until the investor call. Stacks of printed reports marked "DRAFT — DO NOT SHARE."

**Puzzle: Wire Lock (link data sources to questions)**

```js
new WireLock(el, {
  wires: [
    { id: 'pos-revenue', color: '#22c55e', label: 'POS Revenue' },
    { id: 'staff-hours', color: '#3b82f6', label: 'Staff Hours' },
    { id: 'supplier-invoices', color: '#eab308', label: 'Supplier Invoices' },
    { id: 'customer-ratings', color: '#a855f7', label: 'Customer Ratings' },
    { id: 'delivery-times', color: '#ef4444', label: 'Delivery Times' }
  ],
  sockets: [
    { id: 'profit-margin', label: "What's our profit margin?" },
    { id: 'overstaffed', label: "Are we overstaffed?" },
    { id: 'cheapest-supplier', label: "Who's our cheapest supplier?" },
    { id: 'customers-happy', label: "Are customers happy?" },
    { id: 'delivery-slow', label: "Is delivery too slow?" },
    { id: 'decoy-color', label: "What's Marco's favorite color?" },
    { id: 'decoy-birthday', label: "When is Raj's birthday?" }
  ],
  solution: {
    'pos-revenue': 'profit-margin',
    'staff-hours': 'overstaffed',
    'supplier-invoices': 'cheapest-supplier',
    'customer-ratings': 'customers-happy',
    'delivery-times': 'delivery-slow'
  },
  falseOutputs: [
    "That data doesn't answer that question. Think about what each number measures.",
    "Diana sighs: 'Match the DATA to the QUESTION it answers.'",
    "That's like using a thermometer to measure distance."
  ],
  onSubmit() { }, onWrong(msg) { }
});
```

**Lore Card (Quick Sight):** *"Numbers without context are noise. Quick Sight takes your raw data — sales, costs, ratings — and turns them into answers. Not just charts. Answers. I ask 'which store has the best margin?' and it tells me. In English. With a chart I can show investors who think Excel is cutting-edge technology."* — Diana

---

### Room 4: Raj's Server Closet

**Description:** A standing desk crammed between two server racks. Monitors show dashboards in various states of green and red. Sticky notes with passwords everywhere (don't look). A coffee-stained manual is taped to the wall with several sections unreadable.

**Puzzle: Trap Disarm Lock (redacted automation panel)**

```js
new TrapDisarmLock(el, {
  wires: [
    { id: 'pos', color: 'red', label: 'POS System', position: 1 },
    { id: 'supplier', color: 'blue', label: 'Supplier Portal', position: 2 },
    { id: 'scheduler', color: 'yellow', label: 'Staff Scheduler', position: 3 },
    { id: 'delivery', color: 'green', label: 'Delivery Tracker', position: 4 },
    { id: 'payment', color: 'white', label: 'Payment Gateway', position: 5 }
  ],
  rules: [
    { text: 'Payment Gateway must be activated before ████████ Portal.', hint: 'Supplier' },
    { text: 'The POS System must come online before the ██████ Tracker.', hint: 'Delivery' },
    { text: 'Never activate Staff Scheduler first — it depends on ███ data.', hint: 'POS' },
    { text: 'The wire in position █ is always activated second.', hint: '1' },
    { text: 'Delivery Tracker is the last system to go live.', hint: null }
  ],
  solution: ['payment', 'pos', 'scheduler', 'supplier', 'delivery'],
  maxStrikes: 3,
  onSubmit(correct) { },
  onFail() { }
});
```

**Deduction logic:** Rule 5 (clear) → Delivery is last. Rule 3 → Scheduler needs POS before it. Rule 1 → Payment before Supplier. Rule 4 → Position 1 (POS) is second. Therefore: Payment → POS → Scheduler → Supplier → Delivery.

**Lore Card (Quick Automate):** *"Every one of these systems — POS, suppliers, scheduling, delivery — used to be a phone call. Or a ticket. Or a sticky note that fell behind the rack. Quick Automate connects them so actions happen automatically. Not 'I'll get to it Thursday' automatically. Actually automatically. The system that orders buns when stock hits 20%? That's Automate."* — Raj

---

### Room 5: The Break Room

**Description:** A kitchenette with a bulletin board overflowing with notes, business cards, clipped articles, and a passive-aggressive sign about labeling your food. The fridge has menus from competitors magneted to it. Someone wrote "KNOW THY ENEMY" on a sticky note above them.

**Puzzle: Match Lock (categorize fragments into Spaces)**

```js
new MatchLock(el, {
  pairs: [
    ["Volcano Burger needs 340g patty — Marco", "Kitchen Ops"],
    ["Fryer oil swap every 3 days max — Marco", "Kitchen Ops"],
    ["We're bleeding $200/day on spoilage — Diana", "Finance"],
    ["Investor meeting Friday, need P&L — Diana", "Finance"],
    ["POS drops WiFi after 11pm — Raj", "Systems"],
    ["Auto-order triggers at 20% stock — Raj", "Systems"],
    ["Yelp says wait times over 8 mins — Diana", "Customer Intel"],
    ["Regulars want spicy option, 12 asks this week — Marco", "Customer Intel"]
  ],
  cols: 4,
  onSubmit() { }
});
```

**Also in this room:** Card combination discovery. Once player has Recipe Data + Financial Data + Systems Data cards from the 3 founder rooms, they combine here to produce the **Research Briefing** card that unlocks the espionage arc.

**Lore Card (Spaces):** *"This bulletin board? It's the analogue version of Spaces. Kitchen stuff, money stuff, tech stuff, customer stuff — all jumbled together. Quick Spaces lets you create dedicated areas: Kitchen Ops space, Finance space, Systems space. Everyone puts their stuff in the right place, and anyone can find it. Revolutionary? No. But neither is labeling your lunch, and nobody does that either."* — Raj

---

### Room 6: Chocolot

**Description:** A sleek, dimly-lit chocolate dessert bar. Mood lighting. Leather booths. The menu is on a backlit board — their "AI-Powered Flavor Matching" is suspiciously similar to QuickBite's recommendation engine. A barista polishes glasses while watching the room. Security cameras you hadn't noticed blink red.

**Puzzle: Push-Your-Luck Lock (photograph intel without getting caught)**

```js
new PushLuckLock(el, {
  target: 25,
  maxRounds: 4,
  bag: [
    { type: 'gem', value: 3, label: '📸 Menu photo +3', weight: 3 },
    { type: 'gem', value: 5, label: '📊 Sales board +5', weight: 2 },
    { type: 'gem', value: 8, label: '📋 Pricing doc +8', weight: 1 },
    { type: 'bust', value: 0, label: '🚫 "Hey! No photos!"', weight: 2 },
  ],
  onSubmit(correct) { },
  onPenalty(rounds) { }
});
```

**Lore Card (Quick Research):** *"What you just did in there — observing, gathering data points, noting patterns — that's Quick Research. Except Quick Research does it with documents, databases, and public sources instead of a phone camera. It synthesizes everything into a report with citations. Diana's favorite word: citations."* — narrator

---

### Room 7: Panini Gemelli

**Description:** A bright Italian fast-casual spot. Checkered tablecloths. A chalkboard menu with hand-drawn pasta illustrations. Two identical men in matching aprons work the floor — one waves warmly at every customer, the other scans the room with narrow eyes. A "NOW HIRING — 2ND LOCATION" sign is taped to the register. Wait, it just got flipped face-down.

**Puzzle: Wager Lock (social engineering conversations)**

```js
new WagerLock(el, {
  target: 7,
  stakes: [
    { label: 'Mumble', wager: 1, penalty: 0, color: '#22c55e', showOptions: 2 },
    { label: 'Smooth Talk', wager: 2, penalty: -1, color: '#eab308', showOptions: 4 },
    { label: 'Brazen Lie', wager: 4, penalty: -3, color: '#ef4444', showOptions: 6 },
  ],
  questions: [
    {
      question: 'The friendly twin asks what brings you in today. What do you say?',
      options: [
        'Just grabbing lunch, heard great things online',
        "I'm a food blogger reviewing the neighborhood",
        'Scoping out franchise opportunities in the area',
        'My office is nearby, first time here',
        "I'm writing an article on Italian fast-casual trends",
        'A friend recommended your paninis specifically'
      ],
      answer: 'Just grabbing lunch, heard great things online'
    },
    {
      question: 'A regular mentions they come every day. How do you learn about peak hours?',
      options: [
        'Ask what time the line is shortest so you can "avoid the rush"',
        'Demand to know their daily sales volume',
        'Complain loudly about the current wait time',
        'Ask if they noticed any new menu items recently',
        "Say you're from the health department doing a survey",
        'Tell them you work for a competing restaurant'
      ],
      answer: 'Ask what time the line is shortest so you can "avoid the rush"'
    },
    {
      question: 'The suspicious twin is restocking napkins nearby. How do you learn about supplier costs?',
      options: [
        'Comment that their ingredients taste premium and ask where they source',
        'Grab a napkin and read the supplier label while chatting',
        'Offer to sell them cheaper supplies from a fake wholesaler',
        'Ask directly what their food cost percentage is',
        'Snap a photo of the supply boxes behind the counter',
        "Tell him you're an investor and demand financials"
      ],
      answer: 'Comment that their ingredients taste premium and ask where they source'
    },
    {
      question: 'You overhear staff mentioning a second location. How do you confirm expansion plans?',
      options: [
        'Casually ask the cashier if they\'re hiring for "the new spot"',
        'Follow the staff member into the back room',
        'Call the landlord pretending to be the twin',
        'Ask loudly whether they deliver to the east side yet',
        'Mention you saw a job posting and ask which location',
        'Congratulate the friendly twin on "the expansion" and gauge his reaction'
      ],
      answer: 'Casually ask the cashier if they\'re hiring for "the new spot"'
    },
    {
      question: 'The friendly twin offers a loyalty card. How do you learn their retention strategy?',
      options: [
        'Accept and ask how many stamps until free — "my old place did 8"',
        'Refuse and say loyalty programs are scams',
        'Take a photo of the terms and conditions',
        'Ask how many active loyalty members they have total',
        'Pocket it and say your "marketing team" would love the design',
        'Ask what percentage of customers use theirs'
      ],
      answer: 'Accept and ask how many stamps until free — "my old place did 8"'
    },
    {
      question: 'The suspicious twin catches you staring at the specials board. What do you say?',
      options: [
        "Smile and say you can't decide — everything looks too good",
        'Pretend you were reading the WiFi password above it',
        'Pull out your phone and start taking notes openly',
        'Ask him to explain every item for your "dietary restrictions"',
        "Say you're comparing prices for your office catering order",
        'Freeze and stammer about looking at the wall art'
      ],
      answer: "Smile and say you can't decide — everything looks too good"
    }
  ],
  onSubmit(correct) { }
});
```

---

### Room 8: Tabouleh Express

**Description:** The loading dock behind a Mediterranean restaurant, 6 AM. Fluorescent dock lights buzz. Delivery vans idle. Stacks of ingredient crates labeled in three languages. People mill about — drivers checking phones, kitchen staff grabbing coffee, a woman with a binder near the office door. The smell of fresh flatbread and diesel.

**Puzzle: Auction Lock (buy intel from gossipy contacts)**

```js
new AuctionLock(el, {
  budget: 100,
  requiredItems: 3,
  lots: [
    {
      id: 'tony-driver', label: '🚛 Tony the Driver',
      hint: 'Leaning against his van checking a clipboard. Mutters about "three new catering drops this week."',
      value: 'key', minBid: 18, idealBid: 25
    },
    {
      id: 'line-cook', label: '🍳 Line Cook on Break',
      hint: 'Sitting on a milk crate scrolling his phone. Yawns about being here since 4 AM.',
      value: 'decoy', minBid: 8, idealBid: 12
    },
    {
      id: 'produce-guy', label: '🥬 Produce Delivery Guy',
      hint: 'Unloading twice the usual crate count. Whistles while stacking bulk-labeled boxes.',
      value: 'key', minBid: 20, idealBid: 30
    },
    {
      id: 'owners-assistant', label: "📱 Owner's Assistant",
      hint: 'On the phone near the office, flipping through lease agreements and renovation quotes.',
      value: 'key', minBid: 25, idealBid: 35
    },
    {
      id: 'night-cleaner', label: '🧹 Night Cleaner',
      hint: 'Heading home with earbuds in, barely awake. Nods but keeps walking to the bus stop.',
      value: 'decoy', minBid: 5, idealBid: 10
    },
    {
      id: 'health-inspector', label: '🪪 Health Inspector',
      hint: "Crisp polo, lanyard badge, writing on a form. Radiates 'don't talk to me' energy.",
      value: 'decoy', minBid: 30, idealBid: 40
    },
    {
      id: 'pastry-supplier', label: '🧁 Pastry Supplier',
      hint: 'Loading empty trays into her van. Checks phone — a spreadsheet of standing orders from five restaurants.',
      value: 'key', minBid: 15, idealBid: 22
    }
  ],
  onSubmit(correct) { }
});
```

---

### Room 9: The Cooker

**Description:** A trendy gastropub with exposed brick and Edison bulbs. Above the bar: a massive screen cycling through customer posts, reviews, and blog mentions — "The Cooker Social Wall." In a corner booth, a young woman in a branded hoodie frantically types on a laptop, occasionally groaning and hitting delete. The posts on the wall are... flickering. Some are disappearing mid-sentence.

**Puzzle: Decay Lock (read reviews before they're deleted)**

```js
new DecayLock(el, {
  fragments: [
    {
      text: '@hangry_hannah: Waited 40 mins for a burger at The Cooker. Came out cold. Staff looked overwhelmed. Never again.',
      decayAfter: 5
    },
    {
      text: "Anonymous (Glassdoor): Head chef has been interviewing downtown. Morale in the kitchen is rock bottom. Management doesn't care.",
      decayAfter: 9
    },
    {
      text: 'ForkAndKnifeBlog: Tried The Cooker vs QuickBite side by side. QuickBite wins on speed, consistency, and value. Their only edge is desserts.',
      decayAfter: 14
    },
    {
      text: '@local_eats_watchdog: Tip that The Cooker failed last kitchen temp check. Walk-in at 48°F. Health dept flagged it, no closure yet.',
      decayAfter: 6
    },
    {
      text: '@dessert_queen_99: The Cooker molten lava cake is INCREDIBLE but $18 for dessert?? Only reason I still go honestly.',
      decayAfter: 10
    }
  ],
  question: "Based on what you saw, what is The Cooker's biggest operational vulnerability?",
  answers: ['head chef leaving', 'chef leaving', 'understaffed', 'staffing', 'losing their chef', 'head chef', 'chef interviewing', 'staff shortage'],
  decayRate: 1.5,
  onSubmit(correct) { }
});
```

**Solve logic:** Fragments 1 (overwhelmed staff), 2 (chef leaving), and 4 (health issues from understaffing) together reveal the core vulnerability: they're losing their head chef, causing cascading quality failures.

---

### Room 10: War Room / Boardroom

**Description:** A glass-walled conference room. The speakerphone is already ringing. Diana stands at the head of the table, slides loaded on the big screen. Three investor faces appear — polite smiles that could turn skeptical any second. Marco hovers in the doorway with a Volcano Burger sample "just in case." This is it.

**Puzzle: Wager Lock (investor Q&A under pressure)**

```js
new WagerLock(el, {
  target: 8,
  stakes: [
    { label: 'Conservative', wager: 1, penalty: 0, color: '#22c55e', showOptions: 2 },
    { label: 'Confident', wager: 2, penalty: -1, color: '#eab308', showOptions: 4 },
    { label: 'Bold Claim', wager: 4, penalty: -3, color: '#ef4444', showOptions: 6 },
  ],
  questions: [
    {
      question: "What is QuickBite's current food cost ratio?",
      options: ['28%', '32%', '37%', '41%', '24%', '45%'],
      answer: '32%'
    },
    {
      question: "Who is your biggest competitive threat right now?",
      options: ['Chocolot', 'Panini Gemelli', 'Tabouleh Express', 'The Cooker', 'GrabGo', 'NomNom Express'],
      answer: 'Panini Gemelli'
    },
    {
      question: 'What is your current customer satisfaction score?',
      options: ['4.6 out of 5', '4.2 out of 5', '3.9 out of 5', '4.8 out of 5', '3.7 out of 5', '4.0 out of 5'],
      answer: '4.6 out of 5'
    },
    {
      question: 'How many new stores can you realistically open next year?',
      options: ['4 stores', '6 stores', '8 stores', '10 stores', '3 stores', '12 stores'],
      answer: '6 stores'
    },
    {
      question: 'What is your average ticket size per customer?',
      options: ['$9.40', '$11.20', '$14.80', '$7.60', '$16.50', '$12.90'],
      answer: '$11.20'
    },
    {
      question: "What's QuickBite's monthly revenue run rate?",
      options: ['$180K', '$240K', '$310K', '$140K', '$420K', '$95K'],
      answer: '$240K'
    },
    {
      question: 'What percentage of orders come through your mobile app?',
      options: ['62% mobile', '45% mobile', '78% mobile', '34% mobile', '51% mobile', '88% mobile'],
      answer: '62% mobile'
    },
    {
      question: 'What is your break-even timeline per new store?',
      options: ['14 months', '9 months', '6 months', '18 months', '24 months', '11 months'],
      answer: '9 months'
    }
  ],
  onSubmit(correct) { }
});
```

**Design note:** The "correct" answers reference data gathered throughout the episode. 32% food cost comes from Marco's kitchen puzzle. Panini Gemelli as biggest threat comes from the research arc. 4.6 satisfaction comes from Diana's data. This rewards players who paid attention.

**Lore Card (Quick Sight — Scenarios):** *"What-if analysis. That's the part that wins the money. Not 'here's what happened' — investors know the past. 'Here's what happens IF we open 6 stores, IF chicken prices rise 15%, IF the Volcano Burger does what we think.' Quick Sight Scenarios let you adjust the variables and show them the future. A future where they make money."* — Diana

---

### Room 11: Store #10 (Unfinished)

**Description:** An empty restaurant. Bare concrete floors with tape marking where booths will go. Wires hang from the ceiling. A stack of flat-pack tables sits in the corner. The walk-in fridge hums but the door is propped open. Everything COULD be ready by tomorrow — if someone figures out what's missing and automates the rest.

**Part 1 — Fog Map Lock (explore the unfinished store)**

```js
new FogMapLock(el, {
  cols: 5,
  rows: 5,
  energy: 12,
  intelNeeded: 3,
  tiles: [
    { x: 0, y: 4, type: 'start' },
    // Intel (4 total, need 3)
    { x: 2, y: 3, type: 'intel', label: '📡 WiFi Router location mapped' },
    { x: 4, y: 3, type: 'intel', label: '📜 Health Certificate found' },
    { x: 1, y: 1, type: 'intel', label: '🔑 Staff Locker Keys retrieved' },
    { x: 3, y: 0, type: 'intel', label: '💳 POS Terminal located' },
    // Traps
    { x: 1, y: 3, type: 'trap', label: '🧊 Broken freezer — time lost', cost: 2 },
    { x: 3, y: 2, type: 'trap', label: '💧 Flooded bathroom — detour', cost: 1 },
    { x: 2, y: 0, type: 'trap', label: '⚡ Electrical short — danger', cost: 2 },
    // Bonuses
    { x: 0, y: 2, type: 'bonus', label: '🪑 Tables already assembled', gain: 2 },
    { x: 4, y: 1, type: 'bonus', label: '🪧 Signage delivered early', gain: 1 },
    // Exit
    { x: 4, y: 0, type: 'exit' },
  ],
  onSubmit(correct) { }
});
```

**Map layout:**
```
y=0:  [ ][ ][TRAP:⚡][INTEL:POS][EXIT]
y=1:  [ ][INTEL:Keys][ ][ ][BONUS:Sign]
y=2:  [BONUS:Tables][ ][ ][TRAP:💧][ ]
y=3:  [ ][TRAP:🧊][INTEL:WiFi][ ][INTEL:Health]
y=4:  [START][ ][ ][ ][ ]
```

**Part 2 — Sort Lock (sequence the store opening automation)**

```js
new SortLock(el, {
  items: [
    'Send social media announcement',
    'Test POS system',
    'Order opening-day inventory',
    'Print menus',
    'Set up WiFi and tablets',
    'Marco approves menu',
    'Confirm health inspection',
    'Calculate food cost'
  ],
  answer: [
    'Confirm health inspection',
    'Set up WiFi and tablets',
    'Test POS system',
    'Calculate food cost',
    'Marco approves menu',
    'Print menus',
    'Order opening-day inventory',
    'Send social media announcement'
  ],
  onSubmit(correct) { }
});
```

**Dependency logic:**
1. Health inspection → must be first (can't operate without it)
2. WiFi → infrastructure before digital systems
3. Test POS → needs WiFi
4. Calculate food cost → needs working POS data
5. Marco approves menu → needs food cost finalized
6. Print menus → needs Marco's approval
7. Order inventory → needs final menu to know what to order
8. Social media → only announce when everything is confirmed

**Lore Card (Quick Flows):** *"Every store opening used to be a scramble. Store #6 opened without a freezer. Store #8 forgot napkins for a WEEK. Quick Flows is the checklist that runs itself. Step 1 triggers step 2. Step 2 won't run until step 1 actually completes. Conditions, dependencies, automatic triggers. You design it once — every future store opens the same way. No scramble. No forgotten napkins."* — Raj

---

## Lore Cards (Complete Set)

| # | Room | Quick Feature | Card Title (in-world) | Voice |
|---|------|---------------|----------------------|-------|
| 1 | Marco's Kitchen | Quick Index | "The Searchable Pantry" | Marco |
| 2 | Diana's Office | Quick Sight | "Numbers Into Answers" | Diana |
| 3 | Raj's Closet | Quick Automate | "The System That Orders Buns" | Raj |
| 4 | Break Room | Spaces | "Label Your Lunch" | Raj |
| 5 | Research Arc | Quick Research | "Citations, Citations, Citations" | Narrator |
| 6 | War Room | Quick Sight Scenarios | "Selling The Future" | Diana |
| 7 | Store #10 | Quick Flows | "The Checklist That Runs Itself" | Raj |

---

## Design Decisions

- **Scale:** Grand finale / main-stage episode. Biggest episode yet.
- **Product scope:** Amazon Quick ONLY (not Amazon Q Business)
- **Competitor names:** Food puns on real competitors (Copilot→Chocolot, Gemini→Gemelli, Tableau→Tabouleh, Looker→Cooker)
- **Research arc:** 4 rooms using new v1 puzzle mechanics (push-luck, wager, auction, decay)
- **Mid-event trigger:** Investor call moved up (at 25:00 remaining), triggers War Room
- **Finale:** Store #10 automation (Quick Flows), NOT the investor call
- **Gate strategy:** Need 3/4 research rooms (one failure is survivable)
- **Timer visibility:** Hidden during intro, shown from game start

---

## Decisions Locked

- **Card count target:** 80–100 total cards across episode
- **Card ID spacing:** Rooms at 1/100/200/300... items offset by 10-90
- **Break Room mechanic:** Simple card combination (engine-native). Recipe Card + Financial Card + Systems Card → combine → Research Briefing unlocks. Not a hard puzzle — acts as a checkpoint. Room's real value = bulletin board gossip hinting at competitor locations (NPC dialog).
- **Store #10 FogMapLock:**
  - Normal: 5×5 grid, energy 12, intel needed 3 (of 4), start bottom-left, exit top-right
  - Challenge: 9×5 grid, energy 18, intel needed 4 (of 5), more traps, fewer bonuses
- **Image style:** Comedic + fun, flat illustration, warm palette.
  - HQ rooms: Cluttered startup chaos (sticky notes, whiteboards, coffee stains)
  - Espionage rooms: Spy-comedy noir — dramatic shadows, trenchcoat vibes, food-as-spy-gadgets (truffle instead of gun, hiding behind menu instead of newspaper)
  - Endgame: Clean boardroom + empty restaurant being assembled
- **Lore cards:** Discovery-gated (solve puzzle → unlock lore). Written in founder voices explaining Quick features through food metaphors. 7 total (1 per feature room).
- **Challenge mode:** Deferred until base flow is tested by players
- **Audio/voice timing:** Deferred

## Open Questions (Remaining for Next Pass)

- [ ] War Room: own WagerLock instance or different puzzle type? (need to experience flow first)
- [ ] Card dependency chain at individual card level (full Card Index table)
- [ ] Card ID assignment (which IDs for which cards across all rooms)
- [ ] Challenge mode variants per puzzle (deferred until base flow tested)
- [ ] Hints (3 tiers per puzzle) — needed for full blueprint completion
- [ ] Timed events detail (exact mid-event trigger logic)

## Completed This Pass

- [x] All 11 room puzzle configs written (exact constructor calls)
- [x] NPC dialog trees — 3 founders (full state_lines) + 5 minor NPCs → `scenarios/corporate/quick-bites/npcs.json`
- [x] 7 lore cards (feature explanations in founder voices)
- [x] Store #10 FogMapLock tile placement (map layout documented)
- [x] Research rooms: all question/answer content for PushLuck, Wager, Auction, Decay
- [x] Room descriptions for all 11 rooms

---

## Source Material

- AWS Documentation: Amazon Quick (https://docs.aws.amazon.com/quicksight/latest/user/what-is-quicksight.html)
- Amazon Quick capabilities: Sight, Flows, Automate, Index, Research, Apps, Spaces, Chat agents, Extensions
- Workshop reference: "A Complete Guide to Amazon Quick" (catalog.workshops.aws)
