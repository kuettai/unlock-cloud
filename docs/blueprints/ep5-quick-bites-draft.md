# Scenario Blueprint Draft: "Quick Bites"

## Status: BRAINSTORM

## Meta

- **Category:** AWS (Amazon Quick Suite)
- **Title:** Quick Bites (working title)
- **Tone:** Lighthearted / Comedic (Devil Wears Prada energy)
- **Setting:** QuickBite — a fast-food startup, Series B funded, opening their 10th store
- **Duration:** 60 minutes
- **AWS Topics:** Amazon Quick Suite (Spaces, Knowledge Bases, Research Agent, Actions, MCP, Flows, QuickSight Topics/Dashboards/Scenarios)

---

## Core Concept

**Player is the executive assistant** — mirroring what Amazon Quick Suite does for business users. The player experiences being the AI assistant: gathering knowledge, researching, connecting to systems, automating tasks, and presenting data.

**The stakes:**
- Investor call in 55 minutes (QuickSight)
- Store #10 opens tomorrow (Flows)
- Everything is on fire (literally — Store #7's fryer)

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

---

## Module Mapping

### 1. Spaces + Knowledge Base (Gather & Organize)

**Early game — manual collection:**
- Each founder has isolated documents only they understand
- Individually useless fragments; combined = insights
- Example: Marco's recipe + Diana's supplier pricing + Raj's POS data = cost-per-sandwich calculation
- Player physically gathers cards from each founder's area and combines them

**Late game — the vault:**
- Discover Marco's grease-stained recipe binder, training transcripts, safety guidelines
- Index them into categories (Kitchen Ops, Health & Safety, Secret Menu, Front-of-House)
- Twist: some knowledge is sensitive (secret sauce = restricted access)
- Payoff: new Store #10 staff can get answers without calling Marco at 6 AM

**Before/After contrast:**
- Before: Diana asks "What's our food cost ratio?" → nobody can answer (siloed)
- After: Combined space answers instantly with data from all three founders

---

### 2. Research Agent (Field Reconnaissance)

**Scenario:** Marco wants Volcano Burger approved. Diana won't greenlight without market validation.

**Mechanic:** Player leaves the office to gather competitive intelligence:
- Visit Burger Baron — observe menu, prices, what customers order
- Customer intercepts — chat with people leaving competitors
- Social media scan — review sites, trending food posts
- Supplier gossip — delivery driver mentions competitor ordering bulk habaneros

**The puzzle:** Compile findings into a research report. Identify which sources support the launch vs. which are warnings. Some are red herrings.

**Payoff:** Present to Marco AND Diana together. Both convinced because findings come with sources and citations.

**Comedy beat:** Player wearing disguise in competitor restaurant. Diana texts: "Where are you?" Player sends photo of Burger Baron's menu. Diana: "...acceptable. Carry on, spy."

---

### 3. Actions (Cut Out the Middleman)

**The frustration (before):**
- Update menu price? → "Submit ticket to IT, 2-week turnaround"
- Reorder supplies? → "Email procurement, back to you Thursday"
- Send staff schedules? → "That's HR's system, no access"

Player is powerless messenger passing notes between departments.

**The breakthrough (after):** Connect DIRECTLY to systems. No middleman. No waiting.

**Puzzle mechanic — WHO + HOW:**
- WHO: Match the problem to the right connection (supplier, system, vendor)
- HOW: What's the right way to ask? (Natural language → system understands)

**Example:** Store #4 runs out of brioche buns mid-rush.
- Old way: Call Raj → file ticket → wait 3 days
- New way: You know BunCo Bakery (WHO), say "Rush 200 buns, Store #4, by 3 PM" (HOW). Done.

**MCP moment:** Raj's janky genius — one tablet connected to ALL vendors. Single interface, plain language, it routes to the right vendor automatically.
- Early game: individual connections, one at a time (hard way)
- Late game: unlock universal channel (MCP), issue multiple commands from one place

**Comedy:** Each vendor has personality. Tony talks too much. FreshFarm portal has vegetable CAPTCHAs. Repair company has terrible hold muzak.

**Emotional arc:**
1. Frustration — have info but can't DO anything
2. Discovery — find the right connections
3. Power — do in 30 seconds what took hours of phone tag

---

### 4. QuickSight (The Numbers That Win the Money)

**Scenario:** Diana has 55 minutes until investor call. Has ALL the data but it's raw and messy.

**Layer 1 — Build the Dataset (Topics):**
- Collect raw data cards (sales receipts, app ratings, staff schedules, supplier invoices)
- Link them together: sales + cost = margin; staff hours + revenue = efficiency
- Synonyms puzzle: "burn rate" = "bleeding cash" = "monthly spend" (same question, different words)

**Layer 2 — Ask in Plain English (NL Querying):**
- Diana fires questions: "Which store has best margin?" "Fastest-growing item?"
- Player matches which data cards answer which question

**Layer 3 — The Investor Slide (Dashboard):**
- Match insight to right visualization type
- Growth over time → line chart; Store comparison → bar chart; Money allocation → pie chart
- Wrong match = investor confused; Right match = checkbook opens

**Layer 4 — What If? (Scenarios):**
- Investor asks: "What if you open 5 more stores?"
- Player adjusts variables: chicken price +15%, add breakfast hours, Volcano Burger goes viral
- Must find realistic-but-optimistic path (not the "infinite free chicken" scenario)

**Comedy:**
- Marco: "Just show them a photo of the Volcano Burger."
- Diana: "They want 40% YoY revenue increase, not a burger."
- Marco: "...what if the burger IS the 40% increase?"
- Diana: *pulls up item-level breakdown* — Marco was right.

---

### 5. Flows (The Grand Finale — Store Opening Automation)

**Before:** Every store opening is a scramble. Store #6 opened without a freezer. Store #8 forgot napkins for a week.

**Mechanic:** Players collect "step cards" throughout the game, then arrange them into correct sequence with conditions:

**Step cards (found across the game):**
- Confirm health inspection (MUST be first)
- Order opening-day inventory (needs supplier Action)
- Send staff schedules (needs employee list from Space)
- Test POS system (needs WiFi first)
- Set up WiFi and tablets (after inspection)
- Print menus (needs Marco's approval)
- Marco approves menu (needs food cost from Diana)
- Calculate food cost (needs recipe + pricing from Space)
- Social media announcement (ONLY IF inspection passed)
- Order backup generator (ONLY IF store in problem area)

**Puzzle layers:**
1. Sequencing — correct order (can't test POS without WiFi)
2. Conditions — some steps only run IF true (reasoning groups)
3. Dependencies — steps need output from previous steps (@references)

**Connects everything:**
- Spaces → where flow pulls data
- Research → informed which steps needed
- Actions → the "do" steps (order, send, create)

**Comedy:**
- Marco: "DOES THE FLOW INCLUDE SAUCE TASTING?"
- You add: "Marco approves sauce (mandatory, non-skippable, est. 45 min)"

---

## Narrative Arc

1. **Opening:** First day as assistant. Three founders all need you simultaneously. Chaos.
2. **Early game:** Simple errands expose the problem — everything is siloed, you're powerless
3. **Mid game:** You start gathering knowledge (Spaces), doing recon (Research), connecting systems (Actions)
4. **Turning point:** With organized knowledge + connections, you can now answer questions nobody could before
5. **Late game:** QuickSight (investor call prep) + Flows (store opening automation)
6. **Finale:** Investor call succeeds. Store #10 opening is automated. Founders realize YOU are running the company.
7. **Post-credits joke:** They offer you COO title. You decline — already doing the job.

---

## Progression / Emotional Arc

| Stage | Player Feels | Quick Suite Parallel |
|---|---|---|
| Chaos | Overwhelmed, powerless | No tools configured |
| Gathering | Detective, explorer | Building Spaces + Research |
| Connecting | Empowered, "I can DO things" | Actions + MCP |
| Orchestrating | Mastermind, conductor | Flows |
| Presenting | Confident, triumphant | QuickSight |

---

## Design Decisions

- **Scale:** Grand finale / main-stage episode. Bigger than ep3-kings-errand.
- **Difficulty:** Mixed tiers across puzzles
- **Investor call:** Timed mid-event (not finale)
- **Finale:** The Flow — store opening automation (everything converges)
- **Scoring:** Speed + completeness (both)
- **Puzzle types:** TBD per puzzle (lock-based, card-combination, tool-based — decide individually)
- **External locations for Actions/MCP:** TBD — may not need physical locations, could be phone/tablet-based from the office

---

## Room Structure (Proposed)

### Office Rooms (HQ — "QuickBite Tower", a cramped co-working space)

| # | Room | Owner | Primary Module | Notes |
|---|------|-------|----------------|-------|
| 1 | **Reception / Your Desk** | Player | Starting room | Chaos introduction, task board fills up |
| 2 | **Marco's Kitchen Lab** | CEO | Spaces (recipes), KB | Test kitchen + office hybrid, grease-stained binder, sauce wall |
| 3 | **Diana's Corner Office** | CFO | QuickSight, data | Spreadsheets everywhere, dual monitors, whiteboard of numbers |
| 4 | **Raj's Server Closet** | CIO | Actions, MCP | Standing desk crammed with monitors, sticky notes, the MCP tablet |
| 5 | **The Break Room** | Shared | Knowledge fragments | Bulletin board, fridge with business cards, staff gossip |
| 6 | **War Room / Boardroom** | All | QuickSight finale (investor call) | Big screen, speakerphone, the presentation moment |
| 7 | **Store #10 (Unfinished)** | — | Flows (finale) | Empty restaurant being set up, the automation target |

### External Locations (Research Agent — field recon)

| # | Room | Purpose | What Player Finds |
|---|------|---------|-------------------|
| 8 | **Burger Baron** | Competitor observation | Menu prices, customer ordering patterns, spicy item popularity |
| 9 | **Food Court (Mall)** | Customer intercepts / surveys | Customer quotes, preferences, willingness to pay |
| 10 | **FreshFarm Market** | Supplier intel | Delivery driver gossip, competitor bulk orders, ingredient trends |
| 11 | **Social Media Café** | Online research | Review sites, trending food posts, viral food challenges |

### Total: 11 rooms

---

## Open Questions (Remaining)

- Exact card count per room (target: significantly more than ep3)
- Individual puzzle mechanic assignments (next session)
- NPC interactions beyond the 3 founders (store staff? vendors? investors?)
- Mid-event trigger: what specifically happens at the investor call moment?
- Does Store #10 unlock only after mid-event, or is it accessible earlier?

---

## Source Material

Workshop content downloaded to: `tmp/workshop-content2/`
Workshop: "A Complete Guide to Amazon Quick Suite" (catalog.workshops.aws/workshops/119307ce-4c43-4e96-887c-cd8454b3d229)
