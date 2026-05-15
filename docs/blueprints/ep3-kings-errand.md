# Scenario Blueprint: Episode 3 — The King's Errand

## Meta

- **Episode:** 3
- **Title:** The King's Errand
- **Arc:** AI Unit
- **Duration:** 60 minutes
- **Players:** 2–6 (recommended 3–4)
- **Difficulty:** Tier 3 — Specialist
- **AWS Topics:** Amazon Bedrock (multi-model selection, inference profiles), Bedrock Guardrails (content filters, denied topics, automated reasoning), Amazon Bedrock AgentCore (Runtime, Memory, Gateway, Identity, Policy, Observability), Amazon Nova (Sonic, Act, Canvas), MCP Protocol, Cedar Policy Language, Agent deployment lifecycle
- **Mechanics Used:** NPC dialog trees, card combination discovery, cross-card observation, rank-lock, scroll-lock, bazaar-lock, wire-lock, path-lock, sg-lock, terminal-lock, match-lock, timeline-lock, arch-lock, chain-lock, timed events, lore scroll fragments, knight rank progression, gold economy with reward tiers

---

## Narrative

### Voices

| Key | Polly Voice | Role |
|-----|-------------|------|
| narrator | Joanna | Story narrator — warm, whimsical |
| system | Matthew | System alerts — herald's proclamation style |
| aldric | Brian | King Aldric — jovial, distracted |
| pip | Ivy | Pip the apprentice — eager, clumsy |

### Intro

| Voice | Line | Pause |
|-------|------|-------|
| narrator | The Kingdom of Cloudmere. The morning sun warms the castle walls. Banners flutter in the breeze. | 1000ms |
| narrator | Today is the day before the Grand Harvest Festival — the biggest celebration of the year. And nothing is ready. | 800ms |
| narrator | The previous Steward of Errands quit without warning. Rumor says he tried to do everything himself instead of delegating to knights. | 600ms |
| narrator | You've been summoned to the Throne Room. King Aldric paces before his throne, muttering about decorations. | 800ms |
| aldric | Ah! You're here! Splendid! The festival is tomorrow and — well — nothing is ready. The cook has lost the menu. The foreign traders can't understand anyone. The entertainers haven't been booked. And the nobles are feuding over stall positions. Again. | 1200ms |
| aldric | I'm appointing you Steward of Errands. You'll command knights of increasing rank to handle each task. And visit the Bedrock Bazaar — the marketplace in the town square — to recruit the right allies. | 1000ms |
| pip | *A young apprentice stumbles through the door, scrolls tumbling from their arms.* I'm Pip! Your apprentice! I'll help you learn the ropes! | 800ms |
| narrator | *The clock tower chimes. Sundown is sixty minutes away.* | 600ms |
| narrator | *Welcome to Cloudmere. Your sixty minutes start now.* | — |

### Mid-Event (at 30:00 remaining)

| Voice | Line | Pause |
|-------|------|-------|
| system | **WEATHER ALERT: Storm clouds gathering over the Bazaar. Merchants preparing to cover stalls.** | 800ms |
| narrator | Thunder rumbles across the town square. The Bazaar merchants start pulling tarps over their wares. Pip looks up at the sky, worried. | 600ms |
| pip | Steward! The storm! The merchants are closing up! We have two minutes before the Bazaar shuts! | 800ms |
| narrator | Rain lashes the cobblestones. Two minutes pass. Then — sunlight breaks through. The merchants uncover their stalls, grumbling. | 600ms |
| pip | That was close! The merchants are back. But we've lost time! | — |

### Ending (Success)

| Voice | Line | Pause |
|-------|------|-------|
| narrator | The Champion knight strides through the festival grounds. Every errand complete. Every stall in place. The smell of Greta's feast drifts from the kitchens. | 800ms |
| system | **Grand Harvest Festival: READY. All errands fulfilled before sundown.** | 1000ms |
| narrator | Lanterns flicker to life across the square. Music rises from the stages. The foreign traders raise a toast in three languages. | 800ms |
| aldric | You did it! On your first day as Steward! The Queen is delighted. The nobles have stopped feuding. Even Sir Cedric cracked a smile — and I didn't think that was possible. | 800ms |
| pip | We did it, Steward! All five errands! I can't believe it! | 600ms |
| narrator | You lean against the castle wall, watching the festival come alive below. Pip hands you a mug of cider. | 800ms |
| narrator | *The Kingdom of Cloudmere celebrates. And you — the Steward of Errands — made it happen.* | — |

### Ending (Failure)

| Voice | Line | Pause |
|-------|------|-------|
| system | **Sundown. The Grand Harvest Festival is incomplete.** | 1000ms |
| narrator | The sun dips below the hills. Festival-goers arrive to half-built stalls and missing performers. Greta serves bread and cheese instead of a feast. | 800ms |
| narrator | But the lanterns still glow. The people still gather. A festival half-done is still a festival. | 600ms |
| pip | We learned a lot today, Steward. Tomorrow we'll be faster. I kept notes! | 800ms |
| narrator | *Tomorrow, you'll know which knights to send, which allies to recruit, and which errands to tackle first.* | — |

---

## Room Graph

```
                    ┌──────────── THE CASTLE ─────────────────────┐
                    │                                             │
                    │  [Throne Room] ──(King's Orders)──▶ HUB    │
                    │                                    │        │
                    │                              [Steward's     │
                    │                               Study] ◀─HUB │
                    │                               │  │  │       │
                    │                    ┌──────────┘  │  └────┐  │
                    │                    │             │        │  │
                    │              [Castle          [Chronicle  │  │
                    │               Kitchen]         Hall]      │  │
                    │                                      [Castle│
                    │                                       Gate] │
                    └─────────────────────────────────────────────┘

                    ┌──────── THE TOWN ──────────────────────────┐
                    │                                            │
                    │  [Bedrock Bazaar] ◀── HUB (from Gate)     │
                    │       │                                    │
                    │       ├──▶ [Foreign Quarter]               │
                    │       │                                    │
                    │       ├──▶ [Entertainment Guild]           │
                    │       │                                    │
                    │       └──▶ [Noble Quarter]                 │
                    │                                            │
                    └────────────────────────────────────────────┘

                    ┌──────── THE PROVING GROUND ────────────────┐
                    │                                            │
                    │  [The Proving Ground] ◀── (all errands)   │
                    │                                            │
                    └────────────────────────────────────────────┘
```

| Room | Card ID | Unlocked By | Unlock Text |
|------|---------|-------------|-------------|
| Throne Room | #100 | — (starting room) | You enter the Throne Room. King Aldric waves you over. |
| Steward's Study | #200 | King's Orders (#104) | Pip leads you down the corridor to the Steward's Study. |
| Castle Kitchen | #300 | Discovery from Study | The smell of burnt pastry guides you to the Castle Kitchen. |
| Chronicle Hall | #400 | Discovery from Study (requires Performance Roster #809) | The Chronicle Hall's heavy doors swing open. Memory crystals glow on the shelves. |
| Castle Gate | #500 | Discovery from Study (requires Scout rank, Errand 2) | The Castle Gate looms ahead — the controlled passage to the outside world. |
| Bedrock Bazaar | #600 | Gate Pass (#501) from Castle Gate | You step through the Gate into the bustling Bedrock Bazaar. |
| Foreign Quarter | #700 | Discovery from Bazaar (requires Scout Badge #505) | Colorful foreign banners mark the entrance to the Foreign Quarter. |
| Entertainment Guild | #800 | Discovery from Bazaar (requires Marshal rank, Errand 3) | A grand stage entrance leads into the Entertainment Guild. |
| Noble Quarter | #900 | Discovery from Bazaar (requires Chronicle Report #406) | Manicured hedges line the path into the Noble Quarter. |
| The Proving Ground | #1000 | All errands complete (#306, #706, #809, #909) | Sir Cedric stands at the gate. "Show me what you've built." |

---


## Room Details

### Room 1: Throne Room (Card #100)

> A grand hall with vaulted ceilings and stained-glass windows depicting past Harvest Festivals. King Aldric sits on a carved wooden throne, fidgeting with a festival program. Pip stands nearby, arms full of scrolls. Tapestries show knights of increasing rank — Soldier, Scout, Marshal, Chronicler, Champion.

**Image:** `assets/throne-room.png`

**Discoveries:**

| Label | Card | Type | Title | Puzzle | Gate |
|-------|------|------|-------|--------|------|
| Talk to King Aldric | #101 | 🔧 Tool | King Aldric | npc-aldric | — |
| Talk to Pip | #105 | 🔧 Tool | Pip (Apprentice) | npc-pip | — |
| Examine the rank tapestry | #102 | 🔵 Object | Rank Tapestry | — | — |
| Read the festival program | #103 | 🔵 Object | Festival Program | — | — |
| Go to the Steward's Study | #200 | 🟢 Location | Steward's Study | — | requires #104 (King's Orders) |

**NPC: King Aldric (npc-dialog)**

- **Portrait:** 👑
- **Greeting:** "Ah, my new Steward! The festival is tomorrow and absolutely nothing is ready. Here — take these orders. Five errands, five problems, and I need them all solved before sundown."
- **Reveals:** King's Orders (#104)
- **Lines:**
  - "What are the five errands?" → Feast menu lost, foreign traders can't communicate, entertainers not booked, nobles feuding over stalls, final rehearsal needed
  - "How do knights work?" → "You command knights by giving clear instructions. Start with a Soldier — simple orders. As you prove yourself, you'll earn higher ranks with more capabilities."
  - "Tell me about the Bazaar" → "The Bedrock Bazaar in the town square! Merchants from distant lands sell magical companions — each with unique talents. You'll need the right ally for each errand."
  - "What happened to the last Steward?" → "Tried to do everything himself. Sent a single Soldier to handle every task. Poor fellow burned out in a day."
- **State Lines:**
  - (has #306) "The feast menu is found!" → "Wonderful! Greta will be thrilled. One errand down!"
  - (has #1009) "The Champion is assembled!" → "Go! To the Proving Ground! Let Sir Cedric see what you've built!"

**NPC: Pip (npc-dialog)**

- **Portrait:** 🧒
- **Greeting:** "*Pip nearly drops a stack of scrolls.* Oh! Steward! I'm your apprentice! I'll explain everything as we go. First — let's get to the Study!"
- **Lines:**
  - "What's a Soldier?" → "The simplest knight. Follows one order at a time. No tools, no memory, no special permissions. Just: you say it, they do it."
  - "What's the Knight Rank Chart?" → "Soldier → Scout → Marshal → Chronicler → Champion. Each rank adds new capabilities. Higher-rank merchants won't work with low-rank knights!"
  - "Any tips?" → "Visit the Bazaar often! Different merchants are good at different things. And don't forget — the right ally for the right job saves gold AND time."
- **State Lines:**
  - (has #205) "I got the festival schedule!" → "Brilliant! Now check the Errand Board in the Study — it shows which errands are available."
  - (has #501) "I have the Gate Pass!" → "The Bazaar awaits! Through the Castle Gate and into the town square!"

**Object Cards:**

| ID | Title | Key Content |
|----|-------|-------------|
| 102 | Rank Tapestry | Five knight ranks depicted: Soldier (basic orders), Scout (tools + gateway), Marshal (policy + identity), Chronicler-Knight (memory + guardrails), Champion (all combined). Each rank shows which Bazaar merchants will work with that rank. |
| 103 | Festival Program | Schedule: Opening Ceremony (needs performers), Feast (needs menu), Trade Fair (needs foreign merchants), Decoration Judging (needs noble stalls), Grand Finale (needs Champion rehearsal). Five errands mapped to five events. |

**Lore:**

| ID | Title | Content |
|----|-------|---------|
| 106 | 📜 Festival History | "The Grand Harvest Festival has been held every autumn for 200 years. Each year, the Steward of Errands coordinates the preparations — dispatching knights of the realm to handle tasks too complex for any one person. The secret? Delegation. The right knight, with the right tools, for the right job." |

---

### Room 2: Steward's Study (Card #200)

> A cozy room with a large oak desk, an errand board on the wall showing five tasks with wax seals, and a shelf of handbooks. A speaking tube connects to the courtyard below — used to dispatch knights. Pip's notes are scattered everywhere. A Knight Rank Chart hangs beside the door.

**Image:** `assets/stewards-study.png`

**Discoveries:**

| Label | Card | Type | Title | Puzzle | Gate |
|-------|------|------|-------|--------|------|
| Read Pip's Handbook | #201 | 🔵 Object | Pip's Handbook | — | — |
| Check the Errand Board | #202 | 🔵 Object | Errand Board | — | — |
| Study the Knight Rank Chart | #203 | 🔵 Object | Knight Rank Chart | — | — |
| Issue your first command | #205 | 🔴 Item | Festival Schedule | first-command (terminal-lock) | — |
| Go to the Castle Kitchen | #300 | 🟢 Location | Castle Kitchen | — | — |
| Go to the Castle Gate | #500 | 🟢 Location | Castle Gate | — | requires Scout rank (Event #505) |
| Go to the Chronicle Hall | #400 | 🟢 Location | Chronicle Hall | — | requires Performance Roster (#809) |

**Object Cards:**

| ID | Title | Key Content |
|----|-------|-------------|
| 201 | Pip's Handbook | "A knight is only as good as its instructions. Be specific! 'Fetch the schedule' might get you a wooden plank. 'Fetch the festival preparation schedule from the notice board' gets results." Also: "Higher-rank merchants demand higher-rank knights. The Meta Tent serves anyone. The Anthropic Pavilion demands a Marshal." |
| 202 | Errand Board | Five wax-sealed errands: 1) The Feast Menu (Kitchen), 2) The Foreign Traders (Gate → Foreign Quarter), 3) The Entertainment Booking (Entertainment Guild), 4) The Decoration Dispute (Chronicle Hall → Noble Quarter), 5) The Grand Rehearsal (Proving Ground). Each shows required knight rank. |
| 203 | Knight Rank Chart | Soldier: prompt in, response out. Scout: + Gateway + tools. Marshal: + Policy + Identity. Chronicler-Knight: + Memory + Guardrails. Champion: all combined. Rank progression unlocks rooms and NPCs. |

**Puzzle: First Command (terminal-lock)**

| ID | Type | UI |
|----|------|----|
| first-command | terminal_lock | terminal-lock |

- **Prompt:** `steward@cloudmere:~$ dispatch soldier:`
- **Answer:** `fetch the festival preparation schedule from the notice board`
- **History:** `[Steward's Study — Speaking Tube Active]`, `Soldier standing by for orders.`
- **False Outputs:**
  - "fetch the schedule" → "The Soldier returns with a wooden plank covered in notches. 'You said schedule, Steward! This has notches for days!'"
  - "get schedule" → "The Soldier stares blankly. 'Get... what? From where?'"
  - "help" → "Pip whispers: 'Be specific! Tell the Soldier exactly WHAT to fetch and WHERE to find it.'"
- **On solve:** Awards Festival Schedule (#205). Reveals Lore #206.
- **Hints:**
  1. "Pip's Handbook says: be specific about WHAT and WHERE."
  2. "You need the festival preparation schedule. It's posted on the notice board in the courtyard."
  3. "Type: `fetch the festival preparation schedule from the notice board`"

**Lore:**

| ID | Title | Content |
|----|-------|---------|
| 206 | 📜 Scroll #0: What is a Knight? | "A knight — in the language of the realm — is an agent. A Soldier is the simplest: you give it an instruction (a prompt), and it carries out the task. No tools, no memory, no judgment beyond what you tell it. In the world beyond Cloudmere, this is a foundation model invocation — a single call to Amazon Bedrock. The quality of the result depends entirely on the clarity of your command." |

---

### Room 3: Castle Kitchen (Card #300)

> A cavernous kitchen with iron pots hanging from ceiling hooks, a roaring hearth, and shelves upon shelves of recipe scrolls. Greta the Head Cook stands amid the chaos, flour in her hair, waving a ladle like a scepter. The recipe archive — hundreds of scrolls in wooden cubbyholes — dominates the far wall.

**Image:** `assets/castle-kitchen.png`

**Discoveries:**

| Label | Card | Type | Title | Puzzle | Gate |
|-------|------|------|-------|--------|------|
| Talk to Greta | #304 | 🔧 Tool | Greta (Head Cook) | npc-greta | — |
| Examine the recipe archive | #302 | 🔵 Object | Recipe Archive Shelves | — | — |
| Sort the recipe scrolls | #306 | 🔴 Item | Feast Menu | recipe-sort (sort-lock) | requires Ally Contract (#605) |
| Look at Greta's cooking pot | #303 | 🔵 Object | Greta's Cooking Pot | — | — |

**NPC: Greta (npc-dialog)**

- **Portrait:** 👩‍🍳
- **Greeting:** "FINALLY! Someone from the castle! The feast menu is LOST! It's somewhere in that archive — hundreds of scrolls — and a basic Soldier can't tell a soufflé from a stew! I need someone SMART to search through them!"
- **Reveals:** Greta's Plea (#301)
- **Lines:**
  - "What kind of help do you need?" → "Someone who can REASON through these scrolls. Read them, understand the courses, find the right one. Not a brute — a scholar!"
  - "What's the menu order?" → "Any proper feast goes: Appetizers first, then Soup, then the Main Course, then Dessert, and finally Drinks. Sort them right and the menu reveals itself!"
  - "Can't a Soldier do this?" → "I TRIED! The Soldier brought me a scroll about pickling turnips! I need a THINKER, not a fetcher. Go to the Bazaar — find someone with brains!"
- **State Lines:**
  - (has #605) "I have an ally from the Bazaar!" → "Oh, a proper scholar! NOW we can search! Get to those shelves!"
  - (has #306) "The feast menu is found!" → "BEAUTIFUL! Roast pheasant, honeyed parsnips, elderflower wine — the King will weep with joy!"

**Object Cards:**

| ID | Title | Key Content |
|----|-------|-------------|
| 301 | Greta's Plea | "The feast menu scroll is buried in the archive. I need a Bazaar ally who can reason through hundreds of recipes. A Soldier won't cut it — find a scholar at the Bazaar!" |
| 302 | Recipe Archive Shelves | Hundreds of scrolls in cubbyholes, labeled by category but hopelessly jumbled. Categories visible: Appetizers, Soups, Mains, Desserts, Drinks, Preserves, Sauces. "Sorting them by proper course order would reveal the feast menu." |
| 303 | Greta's Cooking Pot | A massive iron pot bubbling with something unidentifiable. A sticky note reads: "DO NOT TASTE — experimental. Last person who tried saw colors for three days." |

**Puzzle: Recipe Sort (sort-lock)**

| ID | Type | UI |
|----|------|----|
| recipe-sort | sort_lock | sort-lock |

- **Items (shuffled):**
  - "🥗 Honeyed Fig & Walnut Salad" (Appetizer)
  - "🍲 Roasted Butternut Soup" (Soup)
  - "🍗 Crown Roast Pheasant with Herb Crust" (Main)
  - "🍰 Elderflower Cream Tart" (Dessert)
  - "🍷 Spiced Harvest Cider" (Drinks)
- **Answer:** Appetizer → Soup → Main → Dessert → Drinks (as listed above)
- **On solve:** Awards Feast Menu (#306). Reveals Event #1201 (Ally Recruited — Kitchen).
- **Hints:**
  1. "Greta mentioned the proper order of a feast. Think about how courses are served."
  2. "A feast goes: Appetizers → Soup → Main Course → Dessert → Drinks."
  3. "Order: Honeyed Fig Salad → Butternut Soup → Crown Roast Pheasant → Elderflower Tart → Spiced Cider."

---


### Room 4: Chronicle Hall (Card #400)

> A hushed, vaulted chamber lined with shelves of glowing memory crystals — each one a preserved record of past events. A large circular table in the center holds a timeline display where crystals can be placed in sequence. The air shimmers faintly. Dust motes drift through beams of colored light from high windows.

**Image:** `assets/chronicle-hall.png`

**Discoveries:**

| Label | Card | Type | Title | Puzzle | Gate |
|-------|------|------|-------|--------|------|
| Talk to the Chronicler | #401 | 🔧 Tool | The Chronicler | npc-chronicler | — |
| Examine the memory crystal display | #402 | 🔵 Object | Memory Crystal Display | — | — |
| Examine the chronicle shelves | #403 | 🔵 Object | Chronicle Shelves | — | — |
| Reconstruct last year's festival | #406 | 🔴 Item | Chronicle Report | memory-timeline (timeline-lock) | requires Memory Crystals (#405) |
| Collect the memory crystals | #405 | 🔴 Item | Memory Crystals | — | — |

**NPC: The Chronicler (npc-dialog)**

- **Portrait:** 📜
- **Greeting:** "Welcome to the Chronicle Hall. I am the keeper of memories — every festival, every arrangement, every dispute, recorded in crystal. You seek last year's layout, yes?"
- **Lines:**
  - "I need last year's festival arrangement." → "The memory crystals hold fragments from many festivals. You must sort them chronologically to find the relevant year. Take the crystals to the timeline table."
  - "What are memory crystals?" → "Each crystal stores a moment — a conversation, a decision, an arrangement. Across sessions, across years. Long-term memory for the realm."
  - "How does the timeline work?" → "Place the crystal fragments in chronological order on the table. When the sequence is correct, the relevant year's layout will be revealed."
- **State Lines:**
  - (has #406) "I have the Chronicle Report!" → "Good. Now take it to the Noble Quarter — Lord Ashford and Lady Birch need to see the truth of last year's arrangement."

**Object Cards:**

| ID | Title | Key Content |
|----|-------|-------------|
| 402 | Memory Crystal Display | A circular table with 6 slots arranged in a timeline. "Place memory fragments in chronological order to reconstruct a specific year's records." Currently empty. |
| 403 | Chronicle Shelves | Rows of crystals labeled by year and event. Most are dim. Six crystals glow brightly — fragments from recent festivals, ready to be sorted. A plaque reads: "Memory persists across sessions. What was learned yesterday serves today." |

**Puzzle: Memory Timeline (timeline-lock)**

| ID | Type | UI |
|----|------|----|
| memory-timeline | timeline_lock | timeline-lock |

- **Events (correct chronological order):**
  1. "Spring Fair — Lord Ashford awarded east stalls" (3 years ago)
  2. "Summer Tourney — Lady Birch won decoration prize" (2 years ago)
  3. "Harvest Festival — Ashford and Birch shared the north row" (last year, spring)
  4. "Harvest Festival — Birch moved to west stalls after complaint" (last year, summer)
  5. "Harvest Festival — Final layout: Ashford=east, Birch=west, shared=north" (last year, autumn)
  6. "Winter Solstice — Both houses praised the arrangement" (last year, winter)
- **On solve:** Awards Chronicle Report (#406). Reveals Lore #407.
- **Hints:**
  1. "Arrange the memory fragments from oldest to newest. Look at the seasonal and yearly clues."
  2. "The sequence spans 3 years: Spring Fair → Summer Tourney → two Harvest entries → final layout → Winter Solstice."
  3. "Order: Spring Fair (3yr ago) → Summer Tourney (2yr) → Shared north row → Birch moved west → Final layout → Winter Solstice."

**Lore:**

| ID | Title | Content |
|----|-------|---------|
| 407 | 📜 Scroll #4: The Chronicle & The Code | "The Chronicle Hall is AgentCore Memory — long-term storage that persists across sessions. A Chronicler knight remembers past conversations, past arrangements, past decisions. But memory without restraint is dangerous. A Chronicler who reveals private details or takes sides in a dispute violates trust. That's why every Chronicler must also follow the Code of Honor — Bedrock Guardrails. Content filters block harmful output. PII filters protect private information. Denied topics prevent the agent from straying into forbidden territory. Automated reasoning checks ensure factual accuracy. Memory + Guardrails = a knight you can trust." |

---

### Room 5: Castle Gate (Card #500)

> A massive stone gatehouse with iron portcullis and a control room full of conduit pipes — each one a channel connecting the castle to the outside world. The Gate Warden sits at a desk covered in connection diagrams. Beyond the gate, the sounds of the Bazaar drift in — merchants calling, coins clinking, music playing.

**Image:** `assets/castle-gate.png`

**Discoveries:**

| Label | Card | Type | Title | Puzzle | Gate |
|-------|------|------|-------|--------|------|
| Talk to the Gate Warden | #503 | 🔧 Tool | Gate Warden | npc-gatewarden | — |
| Examine the gate conduits | #502 | 🔵 Object | Gate Conduits | — | — |
| Wire the conduits | #501 | 🔴 Item | Gate Pass | gate-wiring (wire-lock) | requires King's Orders (#104) |
| Earn the Scout Badge | #505 | 🔴 Item | Scout Badge | — | requires Gate Pass (#501) |
| Go to the Bedrock Bazaar | #600 | 🟢 Location | Bedrock Bazaar | — | requires Gate Pass (#501) |

**NPC: Gate Warden (npc-dialog)**

- **Portrait:** 🛡️
- **Greeting:** "Halt! The Gate is sealed. These conduits connect the castle to the outside world — the Bazaar, the Foreign Quarter, the Trade Ledger. But they've been disconnected since the last Steward left. Wire them correctly and I'll grant you passage."
- **Lines:**
  - "What are these conduits?" → "Each conduit is a channel to an external service. Translation goes to the Nova Sonic endpoint. The Trade Ledger connects to the merchant inventory. Currency Exchange links to the treasury. Wire them wrong and you'll be talking to the wrong service."
  - "What's a Scout?" → "A Scout is a knight who can pass through this Gate — interact with the outside world using tools. A Soldier stays inside the castle walls. A Scout ventures beyond."
  - "How do I wire them?" → "Match each conduit to its correct endpoint. The labels tell you what each one does."
- **State Lines:**
  - (has #501) "The conduits are wired!" → "Well done. Here's your Gate Pass and Scout Badge. You can now pass through the Gate — and your knights can use external tools." **Awards Scout Badge (#505)**

**Object Cards:**

| ID | Title | Key Content |
|----|-------|-------------|
| 502 | Gate Conduits | Three conduit pipes on the left: Translation (speech services), Trade Ledger (merchant inventory), Currency Exchange (treasury). Six endpoints on the right: Nova Sonic Endpoint, Merchant Inventory API, Treasury Service, Weather Oracle, Courier Network, Bard's Archive. Three are correct, three are decoys. |

**Puzzle: Gate Wiring (wire-lock)**

| ID | Type | UI |
|----|------|----|
| gate-wiring | wire_lock | wire-lock |

- **Wires:** Translation (blue), Trade Ledger (green), Currency Exchange (gold)
- **Sockets:** Nova Sonic Endpoint, Merchant Inventory API, Treasury Service, Weather Oracle, Courier Network, Bard's Archive
- **Solution:** Translation → Nova Sonic Endpoint, Trade Ledger → Merchant Inventory API, Currency Exchange → Treasury Service
- **False Outputs:**
  - "Translation → Weather Oracle" → "The conduit hums... and starts reporting tomorrow's rainfall in Elvish."
  - "Trade Ledger → Bard's Archive" → "The merchant inventory now lists 47 ballads and a sonnet about cheese."
- **On solve:** Awards Gate Pass (#501). Reveals Lore #506.
- **Hints:**
  1. "Match each conduit to the service it logically connects to. Translation needs a speech service."
  2. "Translation → Nova Sonic (speech). Trade Ledger → Merchant Inventory (goods). Currency Exchange → Treasury (money)."
  3. "Wire: Translation→Nova Sonic, Trade Ledger→Merchant Inventory API, Currency Exchange→Treasury Service."

**Lore:**

| ID | Title | Content |
|----|-------|---------|
| 506 | 📜 Scroll #2: The Castle Gate | "The Castle Gate is the MCP Gateway — the controlled passage connecting your agent to external tools and services. A Soldier stays inside the walls (no tools). A Scout passes through the Gate, gaining the ability to call external APIs, query databases, and interact with services beyond the castle. In AWS terms, this is AgentCore Gateway — connecting Bedrock Agents to external tools via the Model Context Protocol (MCP). Each conduit is a tool definition: what it does, what parameters it accepts, what it returns. Wire them correctly, and your agent can reach the world." |

---


### Room 6: Bedrock Bazaar (Card #600)

> A bustling town square marketplace ringed by colorful merchant stalls. Each stall flies a distinctive banner. The Anthropic Pavilion gleams with scholarly elegance. The Meta Tent echoes with boisterous laughter. The Nova Company guild hall dominates one corner — a single building with four department signs. The DeepSeek Caravan sits quietly at the edge, star charts hanging from its awning. The Qwen Traders greet passersby in a different language each time.

**Image:** `assets/bedrock-bazaar.png`

**Discoveries:**

| Label | Card | Type | Title | Puzzle | Gate |
|-------|------|------|-------|--------|------|
| Read the merchant stall directory | #602 | 🔵 Object | Merchant Stall Directory | — | — |
| Talk to the Nova Company Clerk | #606 | 🔧 Tool | Nova Company Clerk | npc-novaclerk | — |
| Talk to the Anthropic Scholar | #603 | 🔧 Tool | Anthropic Scholar | npc-anthropic | requires King's Seal (#806) |
| Talk to the Meta Captain | #604 | 🔧 Tool | Meta Captain | npc-metacaptain | — |
| Recruit an ally for the Kitchen | #605 | 🔴 Item | Ally Contract | bazaar-recruit (bazaar-lock) | requires Greta's Plea (#301) |
| Collect the Bazaar Token | #601 | 🔴 Item | Bazaar Token | — | — |
| Go to the Foreign Quarter | #700 | 🟢 Location | Foreign Quarter | — | requires Scout Badge (#505) |
| Go to the Entertainment Guild | #800 | 🟢 Location | Entertainment Guild | — | requires King's Seal (#806) |
| Go to the Noble Quarter | #900 | 🟢 Location | Noble Quarter | — | requires Chronicle Report (#406) |

**NPC: Nova Company Clerk (npc-dialog)**

- **Portrait:** 🏛️
- **Greeting:** "Welcome to the Nova Company! We're a single guild with four specialized departments. Sonic for speech, Act for mechanisms, Canvas for art, and Frontier for general missions. How can we help?"
- **Lines:**
  - "Tell me about Sonic" → "The Tongue of Babel — our speech-to-speech interpreters. Twins who translate in real-time. Perfect for the foreign traders problem."
  - "Tell me about Act" → "The Master Artificer — can operate any machine, mechanism, or contraption. Boasts he's worked every guild hall in the realm. Needs a Marshal's authority to deploy."
  - "Tell me about Canvas" → "The Court Painter — creates images on command. Flamboyant, dramatic reveals. Needs a Chronicler-Knight's trust to work with."
  - "Tell me about Frontier" → "The Company Commander — versatile generalists. Can handle any assignment competently. Our all-rounders."
- **State Lines:**
  - (has #505) "I need the Tongue of Babel for the Foreign Quarter." → "Excellent choice! The twins are ready. They'll meet you in the Foreign Quarter."
  - (has #806) "I need the Master Artificer for the Entertainment Guild." → "The Artificer is eager! But he'll need the King's Seal — proof of royal authority."

**NPC: Anthropic Scholar (npc-dialog)**

- **Portrait:** 🧙
- **Greeting:** "*The elderly scholar adjusts his spectacles.* Ah. A Marshal, no less. We only counsel those who carry the King's Seal. What wisdom do you seek?"
- **Lines:**
  - "Why do you require Marshal rank?" → "Powerful counsel requires proper governance. You wouldn't deploy a wise advisor without ensuring they operate under the King's law. Policy and identity come first."
  - "What's your specialty?" → "Reasoning. Nuance. Ethics. When a task requires careful thought — analyzing archives, weighing arguments, crafting policy — we are unmatched."
  - "Tell me about inference profiles" → "Not all tasks need the same depth of thought. A quick question needs a quick mind. A complex analysis needs a deep one. Choose the right profile for the task."

**NPC: Meta Captain (npc-dialog)**

- **Portrait:** 💪
- **Greeting:** "*The boisterous captain slams a fist on the table.* HA! Welcome! We arm-wrestle, not check credentials! Anyone can hire from the Meta Tent!"
- **Lines:**
  - "What's your specialty?" → "Strong, versatile warriors! General purpose, multilingual. Not the cheapest, not the priciest. We get the job done."
  - "Why no rank requirement?" → "We believe in open access! Some merchants demand fancy badges. We demand a firm handshake. *extends hand*"
  - "Can you help with the kitchen?" → "We CAN search archives, sure. But for deep reasoning through hundreds of scrolls? You might want the Anthropic Pavilion or a Nova Frontier specialist. We're better at general tasks."

**Object Cards:**

| ID | Title | Key Content |
|----|-------|-------------|
| 602 | Merchant Stall Directory | **Anthropic Pavilion** (🧙 reasoning, nuance — requires Marshal rank, cost: 40g). **Nova Company** (🏛️ four departments — varies). **Meta Tent** (💪 general purpose — no rank required, cost: 15g). **DeepSeek Caravan** (🔮 math, logic, code — requires Chronicler rank, cost: 25g). **Qwen Traders** (🌐 multilingual — requires Scout rank, cost: 20g). |

**Puzzle: Bazaar Recruitment (bazaar-lock)**

| ID | Type | UI |
|----|------|----|
| bazaar-recruit | bazaar_lock | bazaar-lock |

- **Budget:** 100 gold
- **Stalls:**
  - Anthropic Pavilion (🧙, Reasoning, cost: 40g)
  - Nova Frontier (🏛️, General, cost: 30g)
  - Meta Tent (💪, General, cost: 15g)
  - DeepSeek Caravan (🔮, Code/Logic, cost: 25g)
  - Qwen Traders (🌐, Multilingual, cost: 20g)
- **Quests:**
  - "Search the recipe archives" →
    - Anthropic: **gold** tier, "Flawless research! The scholar finds the feast menu in minutes." (cost 40g)
    - Nova Frontier: **silver** tier, "Competent search. Takes a while but finds the menu." (cost 30g)
    - Meta Tent: **bronze** tier, "The captain rummages through scrolls, knocking several off shelves. Eventually finds it." (cost 15g)
    - DeepSeek: **silver** tier, "Methodical search. Finds it through logical elimination." (cost 25g)
    - Qwen: fail, "The polyglot reads the scrolls beautifully in six languages but can't reason about course order."
- **On solve:** Awards Ally Contract (#605). Reveals Lore #607. Reward tier affects recipe-sort puzzle difficulty.
- **Tier effects on recipe-sort:**
  - 🥇 Gold: items pre-labeled with course type (Appetizer, Soup, etc.)
  - 🥈 Silver: standard — no labels
  - 🥉 Bronze: extra decoy scroll added ("🧅 Pickled Turnip Relish")
- **Hints:**
  1. "Greta needs someone who can REASON through archives. Which merchant specializes in reasoning?"
  2. "The Anthropic Pavilion specializes in reasoning and nuance — perfect for searching archives. But they cost the most."
  3. "Assign 'Search the recipe archives' to the Anthropic Pavilion for gold tier, or any other valid stall for silver/bronze."

**Lore:**

| ID | Title | Content |
|----|-------|---------|
| 607 | 📜 Scroll #1: The Bazaar of Bedrock | "The Bedrock Bazaar is Amazon Bedrock's multi-model selection. Each merchant stall is a foundation model family: Anthropic (Claude), Meta (Llama), Amazon Nova, DeepSeek, Qwen. Choosing the right model for the task is a cost-performance tradeoff. Claude excels at reasoning but costs more. Llama is versatile and open. Nova offers specialized departments (Sonic for speech, Act for automation, Canvas for images). Inference profiles let you tune the depth of processing. The Bazaar teaches: don't just pick the most powerful model — pick the RIGHT model for the job." |

---


### Room 7: Foreign Quarter (Card #700)

> A colorful district of silk canopies, spice stalls, and unfamiliar scripts on every sign. Ambassador Kael stands in the middle of the street, gesturing wildly at a group of Eastern merchants who gesture back with equal confusion. The Tongue of Babel — a pair of twins from the Nova Company — wait nearby, ready to translate. Crates of spices, silks, and fireworks line the walls.

**Image:** `assets/foreign-quarter.png`

**Discoveries:**

| Label | Card | Type | Title | Puzzle | Gate |
|-------|------|------|-------|--------|------|
| Talk to Ambassador Kael | #701 | 🔧 Tool | Ambassador Kael | npc-kael | — |
| Talk to the Tongue of Babel | #703 | 🔧 Tool | The Tongue of Babel (-1 min) | npc-tongue | — |
| Examine the foreign trade ledger | #702 | 🔵 Object | Foreign Trade Ledger | — | — |
| Navigate the negotiation | #706 | 🔴 Item | Trade Agreement | negotiation (deck-battle-lock) | requires Tongue of Babel Contract (#705) |
| Earn the Tongue of Babel Contract | #705 | 🔴 Item | Tongue of Babel Contract | — | requires Scout Badge (#505) |

**NPC: Ambassador Kael (npc-dialog)**

- **Portrait:** 🤷
- **Greeting:** "*Kael waves his arms.* You! New Steward! The Eastern merchants — they bring spices, silks, fireworks for festival! But nobody understand! I try — *mimes eating* — they think I challenge them to eating contest!"
- **Lines:**
  - "What do we need from them?" → "Spices for Greta's feast, silks for decoration, fireworks for grand finale. Three things. But negotiation has protocol — greeting first, then state needs, then hear offer, then counter, then agreement. Skip a step and they walk away!"
  - "Why can't you translate?" → "I speak six languages! They speak a seventh! We need the Tongue of Babel from the Nova Company — speech-to-speech translation."
  - "What if I say the wrong thing?" → "Diplomatic incident! Last time someone skipped the greeting, the merchants packed up and left for three days. Follow the protocol!"
- **State Lines:**
  - (has #705) "The Tongue of Babel is ready!" → "Wonderful! Now follow the negotiation path carefully. Greeting → State needs → Hear offer → Counter-offer → Agreement."
  - (has #706) "Trade agreement signed!" → "MAGNIFICENT! Spices, silks, AND fireworks! The festival will be glorious!"

**NPC: The Tongue of Babel (npc-dialog, -1 min)**

- **Portrait:** 👯
- **Greeting:** "*The twins speak in unison, then argue.* 'Welcome!' 'No, it should be Greetings!' 'Welcome is warmer!' 'Greetings is more formal!' *They turn to you.* We're ready to translate. Just follow the negotiation protocol."
- **Reveals:** Tongue of Babel Contract (#705)
- **Lines:**
  - "How does translation work?" → "We hear speech in one language and speak it in another — in real time. No text, no delay. Speech-to-speech. Just talk naturally and we'll handle the rest."
  - "Any tips for the negotiation?" → "Start with a greeting — it's cultural respect. Then state your needs clearly. Listen to their counter-offer before making yours. And NEVER skip straight to demands."
  - "Why do you argue?" → *Twin 1:* "We don't argue!" *Twin 2:* "We discuss nuance!" *Both:* "Idioms are HARD."

**Object Cards:**

| ID | Title | Key Content |
|----|-------|-------------|
| 702 | Foreign Trade Ledger | Lists available goods: Saffron (50g), Silk Bolts (30g), Festival Fireworks (40g), Jade Figurines (25g — decoy), Exotic Tea (10g — decoy). Notes: "Merchants expect formal negotiation protocol. Greeting → Needs → Offer → Counter → Agreement." |

**Puzzle: Negotiation (deck-battle-lock)**

| ID | Type | UI |
|----|------|----|
| negotiation | deck_battle_lock | deck-battle-lock |

- **Mechanic:** STS-inspired persuasion card battle. Draw 4, play 2 per turn. Persuasion cards fill conviction meter (minus merchant's block). Merchant attacks drain gold (minus your composure). Merchant cycles a 3-turn intent pattern.
- **Merchant:** Spice Trader (Easy) — Conviction target: 8
- **Pattern rotation:** Turn 1: attack 2g, block 0 ("Greetings, friend.") → Turn 2: attack 5g, block 1 ("Show me coin.") → Turn 3: attack 3g, block 3 ("I'm not sure...") → repeats
- **Starting deck (6 cards):** 2× Formal Greeting (🗣️2), 2× Polite Deflection (🛡️2), Scout's Confidence (🗣️3), Gate Knowledge (🛡️3)
- **Gold = HP:** starts at 80. Gold lost here reduces Bazaar budget.
- **Walk Away:** player can leave and retry later with a stronger deck (more quest cards).
- **Quest cards added to deck:** Tongue of Babel (🗣️6), Royal Authority (🗣️5), Dragon Lance (🗣️4), Gift of Insight (🗣️+🛡️3), Diplomatic Poise (🛡️5), Swift Retreat (🛡️4)
- **On solve:** Awards Trade Agreement (#706). Reveals Event #1202 (Trade Negotiated).
- **Hints:**
  1. "The merchant cycles through 3 moods. Watch the pattern — go all-in persuasion when block is 0."
  2. "Play 2 cards per turn. Mix Persuasion (deals conviction) and Composure (blocks gold loss)."
  3. "With only starting cards, you'll lose ~15-20g. Complete more quests first to add stronger cards to your deck."

---

### Room 8: Entertainment Guild (Card #800)

> A theatrical hall with a miniature stage model in the center, showing the festival grounds with four performance areas. Mistress Thornbury sweeps across the room in a dramatic cape, gesturing at empty booking sheets. The Master Artificer from the Nova Company tinkers with a mechanical puppet in the corner, oil staining his hands.

**Image:** `assets/entertainment-guild.png`

**Discoveries:**

| Label | Card | Type | Title | Puzzle | Gate |
|-------|------|------|-------|--------|------|
| Talk to Mistress Thornbury | #801 | 🔧 Tool | Mistress Thornbury | npc-thornbury | — |
| Talk to the Master Artificer | #805 | 🔧 Tool | The Master Artificer (-1 min) | npc-artificer | — |
| Examine the performance stage model | #802 | 🔵 Object | Performance Stage Model | — | — |
| Write the King's Seal | #806 | 🔴 Item | King's Seal (Cedar Policy) | kings-seal (scroll-lock) | requires Thornbury's List (#803) |
| Assign performers to stages | #809 | 🔴 Item | Performance Roster | stage-assign (arch-lock) | requires King's Seal (#806) |

**NPC: Mistress Thornbury (npc-dialog)**

- **Portrait:** 🎭
- **Greeting:** "*Thornbury throws her cape over one shoulder.* DARLING! The festival needs PERFORMERS! Jugglers, bards, fire-breathers — scattered across every guildhall and tavern in the realm! I need someone who can visit every venue, read every notice board, and book acts on the crown's behalf!"
- **Reveals:** Thornbury's List (#803)
- **Lines:**
  - "Who can do this?" → "The Master Artificer from the Nova Company! He can walk into any establishment and operate any booking system. But some venues require proof of royal authority — you'll need to write a King's Seal first."
  - "What performers do you need?" → "Main Stage: something GRAND — fire-breathers or acrobats. Tavern Corner: a bard, obviously. Children's Area: jugglers or puppeteers. Grand Finale: the Royal Choir. Match them to the right stage!"
  - "What's the budget?" → "50 gold per act, maximum. And do NOT hire the King's personal bard — His Majesty will have a fit if Sir Reginald is performing instead of attending as a guest."
- **State Lines:**
  - (has #806) "The King's Seal is written!" → "PERFECT! Now the Artificer can book with authority. Assign the performers to their stages!"
  - (has #809) "All performers are booked!" → "MAGNIFICENT! The show will go on! *dramatic bow*"

**NPC: The Master Artificer (npc-dialog, -1 min)**

- **Portrait:** 🔧
- **Greeting:** "*The Artificer looks up from a half-assembled puppet, oil on his cheek.* Ah! A job! I can operate ANY mechanism — booking systems, stage rigging, ticket counters. Just point me at it. But I'll need the King's Seal for the fancy venues."
- **Lines:**
  - "What can you do?" → "I've worked every guild hall, tavern, and workshop in the realm. Give me a mechanism and I'll figure it out. Booking systems, stage controls, lighting rigs — you name it."
  - "Why do you need the King's Seal?" → "Some venues only accept bookings from authorized agents. The Seal proves I'm acting on behalf of the crown — with specific permissions and limits."
  - "Any booking tips?" → "Fire-breathers on the Main Stage — they need space. Bards in the Tavern Corner — intimate setting. Jugglers for the kids. And the Royal Choir for the Grand Finale — nothing else will do."

**Object Cards:**

| ID | Title | Key Content |
|----|-------|-------------|
| 802 | Performance Stage Model | Four stages on the model: Main Stage (large, open-air), Tavern Corner (small, intimate), Children's Area (safe, colorful), Grand Finale Stage (elevated, grand). Each has a drop zone for a performer type. |
| 803 | Thornbury's List | "Performers needed: Fire-Breathers (Main Stage — need space for flames), Wandering Bard (Tavern Corner — intimate acoustic), Juggling Troupe (Children's Area — safe and fun), Royal Choir (Grand Finale — nothing less will do). Budget: 50g per act MAX. FORBIDDEN: Do NOT book Sir Reginald (King's personal bard)." |

**Puzzle: King's Seal (scroll-lock)**

| ID | Type | UI |
|----|------|----|
| kings-seal | scroll_lock | scroll-lock |

- **Title:** "The King's Seal — Royal Booking Authority"
- **Clauses:**
  1. "The bearer may ___ performers on behalf of the crown." → options: [book, dismiss, conscript] → answer: **book**
  2. "The maximum expenditure per act shall not exceed ___ gold." → options: [25, 50, 100, unlimited] → answer: **50**
  3. "The bearer is ___ from hiring Sir Reginald, the King's personal bard." → options: [permitted, forbidden, encouraged] → answer: **forbidden**
  4. "This authority extends to ___ venues in the realm." → options: [guild halls only, taverns only, all, none] → answer: **all**
- **On solve:** Awards King's Seal (#806). Reveals Lore #807. Reveals Event #1203 (Performers Booked — partial).
- **Hints:**
  1. "Thornbury's List specifies the budget and restrictions. Read it carefully."
  2. "The Artificer needs to: book (not dismiss), spend max 50 gold, NOT hire Sir Reginald, and access ALL venues."
  3. "Answers: book, 50, forbidden, all."

**Puzzle: Stage Assignment (arch-lock)**

| ID | Type | UI |
|----|------|----|
| stage-assign | arch_lock | arch-lock |

- **Zones:** Main Stage (center), Tavern Corner (bottom-left), Children's Area (bottom-right), Grand Finale (top)
- **Services:**
  - 🔥 Fire-Breathers (icon: fire)
  - 🎵 Wandering Bard (icon: music)
  - 🤹 Juggling Troupe (icon: juggler)
  - 🎶 Royal Choir (icon: choir)
  - ⚔️ Sir Reginald (icon: sword — decoy, forbidden)
- **Solution:** Main Stage → Fire-Breathers, Tavern Corner → Wandering Bard, Children's Area → Juggling Troupe, Grand Finale → Royal Choir
- **On solve:** Awards Performance Roster (#809).
- **Hints:**
  1. "Thornbury described what each stage needs. Fire-breathers need space, bards need intimacy."
  2. "Main Stage=Fire-Breathers, Tavern=Bard, Children's=Jugglers, Finale=Royal Choir. Don't use Sir Reginald!"
  3. "Drag: 🔥→Main Stage, 🎵→Tavern Corner, 🤹→Children's Area, 🎶→Grand Finale."

**Lore:**

| ID | Title | Content |
|----|-------|---------|
| 807 | 📜 Scroll #3: The King's Seal | "The King's Seal is Cedar Policy — a declarative language for defining permissions. Cedar policies specify who (principal) can do what (action) on which resources, under what conditions. 'The bearer may BOOK performers' = Allow action. 'Max 50 gold' = condition. 'Forbidden from hiring Sir Reginald' = Deny rule. Cedar policies are evaluated by AgentCore Identity — proving who the agent is and what it's allowed to do. A Marshal knight carries the Seal: Agent + Policy + Identity. You can't just throw a powerful agent at a task without defining its boundaries." |

---


### Room 9: Noble Quarter (Card #900)

> An elegant district of manicured gardens and heraldic banners. Lord Ashford's crimson pavilion faces Lady Birch's emerald pavilion across a cobblestone plaza. Both nobles stand with arms crossed, glaring at each other. The Court Painter from the Nova Company has set up an easel between them, paint-splattered and ready. A stall layout map is pinned to a notice board.

**Image:** `assets/noble-quarter.png`

**Discoveries:**

| Label | Card | Type | Title | Puzzle | Gate |
|-------|------|------|-------|--------|------|
| Talk to Lord Ashford | #901 | 🔧 Tool | Lord Ashford | npc-ashford | — |
| Talk to Lady Birch | #902 | 🔧 Tool | Lady Birch | npc-birch | — |
| Talk to the Court Painter | #904 | 🔧 Tool | The Court Painter (-1 min) | npc-painter | — |
| Examine the stall layout map | #903 | 🔵 Object | Stall Layout Map | — | — |
| Configure the Code of Honor | #906 | 🔴 Item | Code of Honor Config | code-of-honor (sg-lock) | requires Chronicle Report (#406) |
| Match stall designs to houses | #909 | 🔴 Item | Stall Designs | stall-design (match-lock) | requires Chronicle Report (#406) AND Code of Honor Config (#906) |

**NPC: Lord Ashford (npc-dialog)**

- **Portrait:** 🔴
- **Greeting:** "*Ashford adjusts his crimson cloak.* I had the EAST stalls last year! The morning sun hits them perfectly! Birch is trying to steal my position — AGAIN!"
- **Lines:**
  - "What do you want?" → "East-facing stalls with the crimson canopy. Morning sun for my wine display. And I want the oak-carved signage — it matches House Ashford's tradition."
  - "What about Lady Birch?" → "She can have the west! She had it last year and it was FINE! The Chronicle Hall records will prove I'm right!"
  - "Can you compromise?" → "I'll share the north row — IF I keep the east. That's my final offer. And the design must have crimson banners, not that ghastly emerald."
- **State Lines:**
  - (has #406) "The Chronicle Report shows last year's layout." → "HA! See? East was mine! ...wait, it also says we SHARED the north row? Hmm. Fine. But the design must suit House Ashford."
  - (has #909) "The stall designs are assigned!" → "Acceptable. The crimson canopy with oak signage — dignified. I suppose Birch's design is... adequate."

**NPC: Lady Birch (npc-dialog)**

- **Portrait:** 🟢
- **Greeting:** "*Birch fans herself with an emerald fan.* That man is IMPOSSIBLE. I won the decoration prize two years ago! My stalls should have the prime position!"
- **Lines:**
  - "What do you want?" → "West-facing stalls with the emerald silk canopy. Afternoon light for my textile display. And I want the willow-woven signage — it's elegant, unlike Ashford's brutish oak."
  - "What about Lord Ashford?" → "He can keep his precious east. But the north row should be SHARED — the Chronicle Hall records will confirm this."
  - "Can you compromise?" → "Shared north row is acceptable. But my design must have emerald silk and willow-woven signs. None of that crimson nonsense near MY stalls."
- **State Lines:**
  - (has #406) "The Chronicle Report confirms the shared arrangement." → "There! Shared north row, just as I said. Now — the Court Painter can draft designs. But make sure the Chronicler follows the Code of Honor — no favoritism!"
  - (has #909) "The stall designs are assigned!" → "The emerald silk with willow signage — perfection. And the shared north row design is... diplomatically neutral. Well done, Steward."

**NPC: The Court Painter (npc-dialog, -1 min)**

- **Portrait:** 🎨
- **Greeting:** "*The Painter dramatically unveils a blank canvas.* I am READY to create! Three designs needed: one for Ashford, one for Birch, one for the shared north row. But I need to know their preferences first — talk to both nobles!"
- **Lines:**
  - "What designs can you make?" → "Crimson Canopy with Oak Signage (traditional, bold), Emerald Silk with Willow Signage (elegant, flowing), and Neutral Gold with Iron Signage (diplomatic, shared). Match each to the right house!"
  - "Can you just pick?" → "A Court Painter creates — they don't judge! That's YOUR job, Steward. Talk to the nobles, learn their preferences, then match my designs to their houses."
  - "What about the shared row?" → "The north row needs a NEUTRAL design — neither crimson nor emerald. Gold with iron signage. Both houses agreed to share it last year."

**Object Cards:**

| ID | Title | Key Content |
|----|-------|-------------|
| 903 | Stall Layout Map | Festival grounds map showing: East Row (morning sun, wine displays), West Row (afternoon light, textile displays), North Row (shared, food vendors), South Row (entertainment stages). Notes: "East=Ashford (last year), West=Birch (last year), North=Shared." |

**Puzzle: Code of Honor (sg-lock)**

| ID | Type | UI |
|----|------|----|
| code-of-honor | sg_lock | sg-lock |

- **Rules (all must be set correctly):**
  1. Favoritism Language — "Block statements favoring one house over another" — answer: **allow** (= enable the block)
  2. Private Financial Details — "Block revealing either house's private budget" — answer: **allow** (= enable the block)
  3. Budget Promises — "Block promises exceeding the festival decoration budget" — answer: **allow** (= enable the block)
  4. Factual Historical References — "Allow citing Chronicle Hall records as evidence" — answer: **allow** (= enable the allow-rule)
- **On solve:** Awards Code of Honor Config (#906).
- **Hints:**
  1. "The Chronicler must be fair. Block favoritism, block private details, block overspending — but ALLOW factual references."
  2. "Toggle ALL four rules to 'allow': block favoritism, block PII, block budget promises, allow historical facts."
  3. "Set all four toggles to the green/allow position."

**Puzzle: Stall Design Match (match-lock)**

| ID | Type | UI |
|----|------|----|
| stall-design | match_lock | match-lock |

- **Pairs:**
  - "🔴 Crimson Canopy + Oak Signage" ↔ "House Ashford (East Row)"
  - "🟢 Emerald Silk + Willow Signage" ↔ "House Birch (West Row)"
  - "🟡 Neutral Gold + Iron Signage" ↔ "Shared North Row"
- **On solve:** Awards Stall Designs (#909). Reveals Event #1204 (Dispute Resolved).
- **Hints:**
  1. "Talk to both Lord Ashford and Lady Birch — each describes their preferred design style."
  2. "Ashford wants crimson + oak (east). Birch wants emerald + willow (west). The shared row gets neutral gold + iron."
  3. "Match: Crimson→Ashford, Emerald→Birch, Gold→Shared North Row."

---

### Room 10: The Proving Ground (Card #1000)

> An open field outside the castle walls, ringed by training dummies and weapon racks. A large assembly platform stands in the center — a rack with labeled slots for each knight capability. Sir Cedric, a grizzled knight-commander with a scarred face and crossed arms, blocks the path to the Festival Grounds beyond. A Herald's Ledger sits on a podium, ready to record every action.

**Image:** `assets/proving-ground.png`

**Discoveries:**

| Label | Card | Type | Title | Puzzle | Gate |
|-------|------|------|-------|--------|------|
| Talk to Sir Cedric | #1001 | 🔧 Tool | Sir Cedric | npc-cedric | — |
| Examine the Champion Assembly Rack | #1002 | 🔵 Object | Champion Assembly Rack | — | — |
| Examine the Herald's Ledger | #1005 | 🔴 Item | Herald's Ledger | — | — |
| Assemble the Champion | #1009 | 🔴 Item | Champion's Crest | equipment-rack (equipment-rack-lock) | requires #605, #505, #806, #406, #906 |
| Run the rehearsal | #1010 | 🟡 Event | Festival Ready (ENDING) | rehearsal-run (equipment-rack-lock) | requires Champion's Crest (#1009) |

**NPC: Sir Cedric (npc-dialog)**

- **Portrait:** ⚔️
- **Greeting:** "*Cedric doesn't smile.* So. You're the new Steward. You want to deploy a Champion? Then prove you can assemble one. A Champion is the realm's finest — every capability combined. Get it wrong and the whole thing falls apart."
- **Lines:**
  - "What's a Champion?" → "Model from the Bazaar. Gateway from the Castle Gate. Memory from the Chronicle Hall. Policy from the King's Seal. Guardrails from the Code of Honor. Observability from the Herald's Ledger. Runtime to deploy it all. Miss one piece and it's just a fancy Soldier."
  - "What order do they go in?" → "Dependencies matter. You can't add Memory before you have a Gateway. You can't enforce Policy without Identity. And you can't observe what hasn't been deployed. Think about what depends on what."
  - "What's the Herald's Ledger?" → "Every action the Champion takes gets recorded. Who it talked to, what tools it used, what decisions it made. The King reviews the Ledger after every mission. No Ledger, no accountability."
  - "What happens after assembly?" → "The rehearsal. Your Champion runs through the entire festival preparation — checking supplies, recalling arrangements, verifying permissions, filtering responses, logging actions, and reporting to the King. One final test."
- **State Lines:**
  - (has #1009) "The Champion is assembled!" → "*Cedric nods — almost imperceptibly.* Not bad. Now run the rehearsal. Prove it works end to end."
  - (has #1010) "The rehearsal is complete!" → "*Cedric actually smiles.* Well done, Steward. The Champion is ready. The festival... is ready."

**Object Cards:**

| ID | Title | Key Content |
|----|-------|-------------|
| 1002 | Champion Assembly Rack | Seven labeled slots in a chain: 1) Model (🧠 from Bazaar), 2) Gateway (🚪 from Castle Gate), 3) Memory (💎 from Chronicle Hall), 4) Policy (👑 from King's Seal), 5) Guardrails (⚖️ from Code of Honor), 6) Observability (📋 Herald's Ledger), 7) Runtime (⚡ Deploy). "Insert capabilities in dependency order." |

**Puzzle: Champion Assembly (chain-lock)**

| ID | Type | UI |
|----|------|----|
| equipment-rack | equipment_rack_lock | equipment-rack-lock |

- **Mechanic:** Balatro-inspired blind build. 7 equipment slots with hidden stats. Players enable/disable and reorder gear, then deploy on a 30-second cooldown to receive a tier impression (no numbers).
- **Equipment Slots:**
  - 🗡️ Wooden Stick (+2) → 🐉 Dragon Lance (×2) — upgrades via: bazaar-recruit
  - 🛡️ Broken Heavy Armor (÷3) → 🧥 Light Armor (+4) — upgrades via: gate-wiring
  - 👢 Rusty Greaves (−3) → 🥾 Windwalker Boots (+6) — upgrades via: negotiation
  - ⛑️ Cracked Visor (−1) → 👑 Crown of Clarity (×1.5) — upgrades via: kings-seal
  - 💍 Cursed Band (÷2) → 💎 Ring of Focus (+8) — upgrades via: recipe-sort
  - 🧣 Tattered Cloak (+1) → 🦅 Cloak of Soaring (×1.3) — upgrades via: code-of-honor
  - 📿 Dull Pendant (+0) → 🔮 Amulet of Insight (+5) — upgrades via: memory-timeline
- **Target tier:** Strides (score ≥ 65). Observability OFF (stats hidden).
- **Score range:** 0 (all cursed) → 128 (all upgraded, optimal order)
- **On solve:** Awards Champion's Crest (#1009). Reveals Lore #1006. Reveals Event #1008 (Champion Assembled).
- **Hints:**
  1. "Some equipment is cursed — it drags the Champion down. Try disabling items that sound broken."
  2. "Complete errands to upgrade gear. The Bazaar upgrades your weapon, the Gate upgrades your armor."
  3. "Once you can see the numbers (Observability), arrange flat bonuses before multipliers for maximum power."

**Puzzle: Rehearsal Run (equipment-rack-lock)**

| ID | Type | UI |
|----|------|----|
| rehearsal-run | equipment_rack_lock | equipment-rack-lock |

- **Mechanic:** Same equipment rack, but now with Observability ON (numbers visible). Target tier: Soars (score ≥ 100). This is the pure optimization challenge — arrange flat bonuses before multipliers.
- **Target tier:** Soars (score ≥ 100). Observability ON (stats revealed).
- **Optimal order:** All flat items first (+4, +6, +8, +5), then all multipliers (×2, ×1.5, ×1.3) = 128.
- **On solve:** Event #1010 — **ENDING TRIGGERED.** Festival Ready.
- **Hints:**
  1. "You need ALL equipment upgraded and properly ordered to reach Soars."
  2. "With Observability enabled, you can see the numbers. Put flat bonuses (+N) before multipliers (×N)."
  3. "Optimal order: all +N items first, then ×N items. Score: 128."

**Lore:**

| ID | Title | Content |
|----|-------|---------|
| 1006 | 📜 Scroll #5: The Proving Ground | "The Proving Ground is AgentCore Runtime — where agents are assembled and deployed. A Champion combines every capability: a foundation model (Bedrock), external tools (Gateway/MCP), long-term memory (AgentCore Memory), permissions (Cedar Policy/Identity), content safety (Guardrails), and action logging (Observability). The deployment lifecycle is: select model → connect tools → attach memory → define policy → configure guardrails → enable observability → deploy to runtime. Each layer depends on the ones below it. Skip a layer and the agent is incomplete. The Herald's Ledger is Observability — every action traced, every decision recorded, every tool call logged. Without it, you're flying blind." |

---


## Dependency Chain (Critical Path)

```
START
  │
  ▼
[Throne Room]
  │ npc: King Aldric → King's Orders (#104)
  │ npc: Pip → tutorial dialog
  │
  ▼
[Steward's Study] ── HUB
  │ puzzle: terminal-lock (first command to Soldier)
  │   = Festival Schedule (#205) → 📜 Scroll #0 (What is a Knight?)
  │ discover: Pip's Handbook (#201), Errand Board (#202), Rank Chart (#203)
  │
  ├──────────────────────────────────────────────────────────────────┐
  │                                                                  │
  ▼                                                                  ▼
[Castle Kitchen] ── ERRAND 1 (part 1)                      [Castle Gate] ── ERRAND 2 (part 1)
  │ npc: Greta → Greta's Plea (#301)                         │ discover: Gate Conduits (#502)
  │ need: Bazaar ally first → go to Gate                      │ puzzle: wire-lock (MCP connections)
  │                                                           │   = Gate Pass (#501) → Scout Badge (#505)
  │                                                           │   → 📜 Scroll #2 (The Castle Gate)
  │                                                           │
  │                                                           ▼
  │                                                     [Bedrock Bazaar] ── HUB (Town)
  │                                                       │ puzzle: bazaar-lock (recruit ally)
  │                                                       │   = Ally Contract (#605)
  │                                                       │   → 📜 Scroll #1 (Bazaar of Bedrock)
  │                                                       │
  │  ◀──── return to Kitchen with Ally Contract ──────────┘
  │                                                       │
  ▼                                                       │
[Castle Kitchen] ── ERRAND 1 (part 2)                     │
  │ puzzle: sort-lock (recipe scrolls)                    │
  │   requires: Ally Contract (#605)                      │
  │   = Feast Menu (#306)                                 │
  │                                                       │
  │  ┌────────────────────────────────────────────────────┘
  │  │
  │  ▼
  │ [Foreign Quarter] ── ERRAND 2 (part 2)
  │  │ requires: Scout Badge (#505)
  │  │ npc: Ambassador Kael, Tongue of Babel → Contract (#705)
  │  │ puzzle: deck-battle-lock (persuasion card battle)
  │  │   = Trade Agreement (#706)
  │  │
  ├──┘
  │
  ▼
[Entertainment Guild] ── ERRAND 3
  │ requires: from Bazaar (Marshal rank earned via King's Seal)
  │ npc: Mistress Thornbury → Thornbury's List (#803)
  │ npc: The Master Artificer (Nova Act)
  │ puzzle: scroll-lock (write Cedar policy / King's Seal)
  │   = King's Seal (#806) → 📜 Scroll #3 (The King's Seal)
  │ puzzle: arch-lock (assign performers to stages)
  │   requires: King's Seal (#806)
  │   = Performance Roster (#809)
  │
  ▼
[Chronicle Hall] ── ERRAND 4 (part 1)
  │ requires: Chronicler rank (from Study, after Errand 3)
  │ discover: Memory Crystals (#405)
  │ puzzle: timeline-lock (reconstruct past festival)
  │   = Chronicle Report (#406)
  │   → 📜 Scroll #4 (Chronicle & Code)
  │
  ▼
[Noble Quarter] ── ERRAND 4 (part 2)
  │ requires: Code of Honor Config (#906)
  │ npc: Lord Ashford, Lady Birch, Court Painter
  │ puzzle: sg-lock (configure Code of Honor / Guardrails)
  │   requires: Chronicle Report (#406)
  │   = Code of Honor Config (#906)
  │ puzzle: match-lock (stall designs → noble houses)
  │   requires: Chronicle Report (#406) + Code of Honor (#906)
  │   = Stall Designs (#909)
  │
  ▼
[The Proving Ground] ── ERRAND 5
  │ requires: all errands (#306 + #706 + #809 + #909)
  │ npc: Sir Cedric
  │ puzzle: chain-lock (assemble Champion capabilities)
  │   requires: #605 + #505 + #806 + #406 + #906
  │   = Champion's Crest (#1009)
  │   → 📜 Scroll #5 (The Proving Ground)
  │ puzzle: path-lock (run the rehearsal)
  │   requires: Champion's Crest (#1009)
  │   = Festival Ready (#1010) → END
  │
  ▼
 END — Festival Grounds celebration scene
```

**Critical path rooms (10):** Throne Room → Steward's Study → Castle Kitchen → Castle Gate → Bedrock Bazaar → Castle Kitchen (return) → Foreign Quarter → Entertainment Guild → Chronicle Hall → Noble Quarter → The Proving Ground

**Critical path puzzles (12):** First Command (terminal-lock), Gate Wiring (wire-lock), Bazaar Recruitment (bazaar-lock), Recipe Sort (sort-lock), Negotiation (deck-battle-lock), King's Seal (scroll-lock), Stage Assignment (arch-lock), Memory Timeline (timeline-lock), Code of Honor (sg-lock), Stall Design Match (match-lock), Champion Assembly (equipment-rack-lock), Rehearsal (equipment-rack-lock)

---


## Combinations

| Card A | Card B | Result | Type | Description |
|--------|--------|--------|------|-------------|
| #605 Ally Contract | #301 Greta's Plea | #1201 Ally Recruited (enables Kitchen sort) | 🟡 event | The Bazaar ally arrives at the Kitchen, ready to search the archives. |
| #505 Scout Badge | #705 Tongue Contract | #1202 Trade Negotiated | 🟡 event | The Scout and Tongue of Babel work together — trade routes established. |
| #806 King's Seal | #803 Thornbury's List | #1203 Performers Booked | 🟡 event | The Artificer books all performers with royal authority. |
| #406 Chronicle Report | #906 Code of Honor | #1204 Dispute Resolved | 🟡 event | The Chronicler presents fair evidence under the Code — both nobles accept. |
| #601 Bazaar Token | #302 Recipe Shelves | #1301 Penalty (wrong approach) | ⚫ penalty | "You wave a Bazaar Token at the recipe shelves. Nothing happens. You need an ALLY, not a token." -3 min |
| #405 Memory Crystals | #903 Stall Map | #1302 Penalty (no guardrails) | ⚫ penalty | "The Chronicler blurts out Lord Ashford's private debts! Configure the Code of Honor FIRST!" -3 min |

---


## Timed Events

| Time Remaining | Event ID | Type | Event |
|---|---|---|---|
| 55:00 | TE-01 | atmosphere | Pip: "The sun's moving fast, Steward! We'd better get started." (voice: pip) |
| 45:00 | TE-02 | atmosphere | King Aldric (messenger): "How goes the preparation? The Queen is asking about the decorations." (voice: aldric) |
| 35:00 | TE-03 | atmosphere | Greta sends word: "If I don't have that menu soon, I'm serving PORRIDGE to the entire kingdom!" |
| 30:00 | TE-04 | **lockout** | **MID-EVENT:** Storm over the Bazaar. Merchants cover stalls — Bazaar locked for 2 minutes. Mid-event narrative plays. (voice: pip) |
| 28:00 | TE-05 | unlock | Storm passes. Bazaar reopens. Pip: "That was close! The merchants are back." (voice: pip) |
| 25:00 | TE-06 | atmosphere | Lord Ashford sends an angry messenger: "If my stall isn't sorted by sundown, I'm boycotting the festival!" |
| 15:00 | TE-07 | alarm | Sir Cedric sends word: "The Proving Ground closes at dusk. If your Champion isn't ready, there'll be no rehearsal." |
| 10:00 | TE-08 | atmosphere | The sun begins to set. Golden light across all rooms. Pip: "Steward, we're running out of daylight!" (voice: pip) |
| 5:00 | TE-09 | urgency | Torches are lit. Festival-goers start arriving early. Pip: "They're HERE! Are we ready?!" (voice: pip) |

**Triggered Events:**

| Trigger | Result | Description |
|---------|--------|-------------|
| puzzle_solved: first-command | #205 Festival Schedule + 📜 Scroll #0 | Soldier returns with the schedule |
| puzzle_solved: gate-wiring | #501 Gate Pass + #505 Scout Badge + 📜 Scroll #2 | Gate opens, Scout rank earned |
| puzzle_solved: bazaar-recruit | #605 Ally Contract + 📜 Scroll #1 | Ally recruited from the Bazaar |
| puzzle_solved: recipe-sort | #306 Feast Menu | Greta cheers — menu found |
| puzzle_solved: negotiation | #706 Trade Agreement | Ambassador Kael celebrates |
| puzzle_solved: kings-seal | #806 King's Seal + 📜 Scroll #3 | Marshal rank earned |
| puzzle_solved: stage-assign | #809 Performance Roster | Thornbury takes a bow |
| puzzle_solved: memory-timeline | #406 Chronicle Report + 📜 Scroll #4 | Last year's layout reconstructed |
| puzzle_solved: code-of-honor | #906 Code of Honor Config | Guardrails configured |
| puzzle_solved: stall-design | #909 Stall Designs | Both nobles grudgingly satisfied |
| puzzle_solved: equipment-rack | #1009 Champion's Crest + 📜 Scroll #5 | Champion assembled |
| puzzle_solved: rehearsal-run | #1010 Festival Ready | **ENDING** — festival begins |

---


## Card Index

### Locations — 🟢 Green (10)

| ID | Title | Room |
|----|-------|------|
| 100 | Throne Room | throne-room |
| 200 | Steward's Study | stewards-study |
| 300 | Castle Kitchen | castle-kitchen |
| 400 | Chronicle Hall | chronicle-hall |
| 500 | Castle Gate | castle-gate |
| 600 | Bedrock Bazaar | bedrock-bazaar |
| 700 | Foreign Quarter | foreign-quarter |
| 800 | Entertainment Guild | entertainment-guild |
| 900 | Noble Quarter | noble-quarter |
| 1000 | The Proving Ground | proving-ground |

### Objects — 🔵 Blue (14)

| ID | Title | Room |
|----|-------|------|
| 102 | Rank Tapestry | throne-room |
| 103 | Festival Program | throne-room |
| 201 | Pip's Handbook | stewards-study |
| 202 | Errand Board | stewards-study |
| 203 | Knight Rank Chart | stewards-study |
| 302 | Recipe Archive Shelves | castle-kitchen |
| 303 | Greta's Cooking Pot | castle-kitchen |
| 402 | Memory Crystal Display | chronicle-hall |
| 403 | Chronicle Shelves | chronicle-hall |
| 502 | Gate Conduits | castle-gate |
| 602 | Merchant Stall Directory | bedrock-bazaar |
| 702 | Foreign Trade Ledger | foreign-quarter |
| 802 | Performance Stage Model | entertainment-guild |
| 903 | Stall Layout Map | noble-quarter |
| 1002 | Champion Assembly Rack | proving-ground |

### Items — 🔴 Red (19)

| ID | Title | Room |
|----|-------|------|
| 104 | King's Orders | throne-room |
| 205 | Festival Schedule | stewards-study |
| 301 | Greta's Plea | castle-kitchen |
| 306 | Feast Menu | castle-kitchen |
| 405 | Memory Crystals | chronicle-hall |
| 406 | Chronicle Report | chronicle-hall |
| 501 | Gate Pass | castle-gate |
| 505 | Scout Badge | castle-gate |
| 601 | Bazaar Token | bedrock-bazaar |
| 605 | Ally Contract | bedrock-bazaar |
| 705 | Tongue of Babel Contract | foreign-quarter |
| 706 | Trade Agreement | foreign-quarter |
| 803 | Thornbury's List | entertainment-guild |
| 806 | King's Seal (Cedar Policy) | entertainment-guild |
| 809 | Performance Roster | entertainment-guild |
| 906 | Code of Honor Config | noble-quarter |
| 909 | Stall Designs | noble-quarter |
| 1005 | Herald's Ledger | proving-ground |
| 1009 | Champion's Crest | proving-ground |

### Events — 🟡 Yellow (8)

| ID | Title | Room |
|----|-------|------|
| 504 | Gate Opened | castle-gate |
| 1008 | Champion Assembled | proving-ground |
| 1010 | Festival Ready (ENDING) | proving-ground |
| 1201 | Ally Recruited | bedrock-bazaar |
| 1202 | Trade Negotiated | foreign-quarter |
| 1203 | Performers Booked | entertainment-guild |
| 1204 | Dispute Resolved | noble-quarter |

### Lore — 🟣 Purple (7)

| ID | Title | Room |
|----|-------|------|
| 106 | 📜 Festival History | throne-room |
| 206 | 📜 Scroll #0: What is a Knight? | stewards-study |
| 506 | 📜 Scroll #2: The Castle Gate | castle-gate |
| 607 | 📜 Scroll #1: The Bazaar of Bedrock | bedrock-bazaar |
| 807 | 📜 Scroll #3: The King's Seal | entertainment-guild |
| 407 | 📜 Scroll #4: The Chronicle & The Code | chronicle-hall |
| 1006 | 📜 Scroll #5: The Proving Ground | proving-ground |

### Tools / NPCs — 🟠 Orange (15)

| ID | Title | Room | Cost |
|----|-------|------|------|
| 101 | King Aldric | throne-room | free |
| 105 | Pip (Apprentice) | throne-room | free |
| 304 | Greta (Head Cook) | castle-kitchen | free |
| 401 | The Chronicler | chronicle-hall | free |
| 503 | Gate Warden | castle-gate | free |
| 603 | Anthropic Scholar | bedrock-bazaar | free |
| 604 | Meta Captain | bedrock-bazaar | free |
| 606 | Nova Company Clerk | bedrock-bazaar | free |
| 701 | Ambassador Kael | foreign-quarter | free |
| 703 | The Tongue of Babel | foreign-quarter | -1 min |
| 801 | Mistress Thornbury | entertainment-guild | free |
| 805 | The Master Artificer | entertainment-guild | -1 min |
| 901 | Lord Ashford | noble-quarter | free |
| 902 | Lady Birch | noble-quarter | free |
| 904 | The Court Painter | noble-quarter | -1 min |
| 1001 | Sir Cedric | proving-ground | free |

### Penalties — ⚫ Black (2)

| ID | Title | Room | Penalty |
|----|-------|------|---------|
| 1301 | Wrong Approach (Token + Shelves) | castle-kitchen | -3 min |
| 1302 | No Guardrails (Crystals + Map) | noble-quarter | -3 min |

**Total: 10 locations + 15 objects + 19 items + 7 events + 7 lore + 16 tools/NPCs + 2 penalties = 76 cards**

---


## Tools

| ID | UI | Room | Cost | Description |
|----|-----|------|------|-------------|
| npc-aldric | npc-dialog | Throne Room | Free | King Aldric — gives mission, awards King's Orders. |
| npc-pip | npc-dialog | Throne Room | Free | Pip — apprentice, tutorial guide, hints throughout. |
| npc-greta | npc-dialog | Castle Kitchen | Free | Greta — quest-giver for Errand 1, needs Bazaar ally. |
| npc-chronicler | npc-dialog | Chronicle Hall | Free | The Chronicler — explains memory crystals and timeline. |
| npc-gatewarden | npc-dialog | Castle Gate | Free | Gate Warden — explains conduits, awards Scout Badge after wiring. |
| npc-novaclerk | npc-dialog | Bedrock Bazaar | Free | Nova Company Clerk — explains four departments (Sonic, Act, Canvas, Frontier). |
| npc-anthropic | npc-dialog | Bedrock Bazaar | Free | Anthropic Scholar — requires Marshal rank, explains reasoning models. |
| npc-metacaptain | npc-dialog | Bedrock Bazaar | Free | Meta Captain — no rank required, explains open-access models. |
| npc-kael | npc-dialog | Foreign Quarter | Free | Ambassador Kael — quest-giver for Errand 2, describes negotiation protocol. |
| npc-tongue | npc-dialog | Foreign Quarter | -1 min | Tongue of Babel — Nova Sonic twins, speech-to-speech translation. Awards Contract #705. |
| npc-thornbury | npc-dialog | Entertainment Guild | Free | Mistress Thornbury — quest-giver for Errand 3, describes performer needs. Awards List #803. |
| npc-artificer | npc-dialog | Entertainment Guild | -1 min | Master Artificer — Nova Act, can operate any mechanism. Needs King's Seal. |
| npc-ashford | npc-dialog | Noble Quarter | Free | Lord Ashford — wants east stalls, crimson + oak design. |
| npc-birch | npc-dialog | Noble Quarter | Free | Lady Birch — wants west stalls, emerald + willow design. |
| npc-painter | npc-dialog | Noble Quarter | -1 min | Court Painter — Nova Canvas, creates stall designs. |
| npc-cedric | npc-dialog | Proving Ground | Free | Sir Cedric — quest-giver for Errand 5, tests Champion assembly. |

---

## Puzzles

| ID | Type | Room | UI | Answer Summary |
|----|------|------|----|----------------|
| first-command | terminal_lock | Steward's Study | terminal-lock | `fetch the festival preparation schedule from the notice board` |
| gate-wiring | wire_lock | Castle Gate | wire-lock | Wire 3 conduits to correct MCP endpoints |
| bazaar-recruit | bazaar_lock | Bedrock Bazaar | bazaar-lock | Assign archive search quest to best-fit merchant stall |
| recipe-sort | sort_lock | Castle Kitchen | sort-lock | Sort scrolls: Appetizer → Soup → Main → Dessert → Drinks |
| negotiation | deck_battle_lock | Foreign Quarter | deck-battle-lock | Persuasion card battle vs Spice Trader (conviction 8, 3-turn rotation) |
| kings-seal | scroll_lock | Entertainment Guild | scroll-lock | Cedar policy: book, 50 gold, forbidden (Sir Reginald), all venues |
| stage-assign | arch_lock | Entertainment Guild | arch-lock | Drag 4 performer types to correct stage slots |
| memory-timeline | timeline_lock | Chronicle Hall | timeline-lock | Order 6 festival memory fragments chronologically |
| code-of-honor | sg_lock | Noble Quarter | sg-lock | Toggle 4 guardrail rules: all to allow/enable |
| stall-design | match_lock | Noble Quarter | match-lock | Match 3 stall designs to correct noble houses |
| equipment-rack | equipment_rack_lock | Proving Ground | equipment-rack-lock | Blind-build: equip/arrange/deploy to reach Strides tier |
| rehearsal-run | equipment_rack_lock | Proving Ground | equipment-rack-lock | Optimization: reach Soars tier with observability enabled |

---

## Knight Rank Progression

| Errand | Knight Rank | Capabilities | AWS Equivalent | Unlocks Access To |
|--------|-------------|-------------|----------------|-------------------|
| 0 | Soldier | Follows simple orders | Basic agent — prompt in, response out | Kitchen, Castle Gate |
| 1 | Soldier + Ally | Paired with a Bazaar ally | Agent + foundation model selection | Castle Gate (if not yet visited) |
| 2 | Scout | Can pass through the Gate, use external tools | Agent + MCP Gateway + tools | Bazaar, Foreign Quarter, Nova Sonic |
| 3 | Marshal | Operates under the King's Seal, has identity | Agent + Cedar Policy + Identity | Entertainment Guild, Artificer, Anthropic Pavilion |
| 4 | Chronicler-Knight | Remembers past missions, follows Code of Honor | Agent + Memory + Guardrails | Chronicle Hall, Noble Quarter, Court Painter, DeepSeek |
| 5 | Champion | All capabilities combined | Full AgentCore | Proving Ground, Sir Cedric |

**Rank-gating mechanic:** Higher-rank merchants and NPCs refuse to work with low-rank knights. The Meta Tent serves anyone ("We arm-wrestle, not check credentials"), but the Anthropic Pavilion demands Marshal rank ("We only counsel those who carry the King's Seal"). This teaches that more powerful models/agents require proper governance before deployment.

---

## Gold Economy & Reward Tiers

**Core loop:** Complete errands → earn gold → spend gold at the Bazaar on allies (LLMs) → ally quality determines reward tier → reward tier affects future puzzle difficulty → remaining gold adds to final score.

**Budget:** 100 gold total for the scenario.

**Reward tiers:**
- 🥇 **Gold** — Best ally for the job. Future puzzle is easier (more hints, pre-labeled items, fewer decoys).
- 🥈 **Silver** — Capable but not optimal. Future puzzle at standard difficulty.
- 🥉 **Bronze** — Cheapest viable ally. Future puzzle is harder (extra decoys, fewer labels).

**Tier effects by puzzle:**

| Puzzle | 🥇 Gold | 🥈 Silver | 🥉 Bronze |
|--------|---------|-----------|-----------|
| recipe-sort | Items pre-labeled with course type | Standard — no labels | Extra decoy scroll added |
| negotiation (path-lock) | Trap nodes labeled "TRAP" | Standard — no labels | Extra trap node added |
| stage-assign (arch-lock) | Decoy performer labeled "FORBIDDEN" | Standard — no labels | Extra decoy performer added |

**Scoring impact:** Remaining gold from the Bazaar converts to bonus points (1 gold = 1 point). All-gold-tier play costs the full budget (0 saved). Budget play saves gold but makes puzzles harder.

---

## Scoring

| Factor | Points |
|--------|--------|
| Festival Ready (completed) | 50 base |
| Time remaining | +1 per minute left |
| Hints used | -3 per hint |
| Penalties triggered | -3 per penalty |
| Lore scrolls (6 standard + 1 history) | +3 each (max +21) |
| All 7 lore cards found | +5 bonus |
| Nova Company NPCs all consulted (Clerk + Tongue + Artificer + Painter) | +3 bonus |
| Remaining Bazaar gold | +1 per gold remaining |

**Max possible:** 50 (base) + 60 (time) + 21 (7 scrolls × 3) + 5 (all scrolls) + 3 (Nova bonus) + 100 (all gold saved — impossible in practice, theoretical max ~60) = **~139 theoretical, ~120 practical**

| Stars | Score |
|-------|-------|
| ⭐⭐⭐⭐⭐ | 90+ |
| ⭐⭐⭐⭐ | 75–89 |
| ⭐⭐⭐ | 60–74 |
| ⭐⭐ | 45–59 |
| ⭐ | Completed |

> **Note:** No default penalty for unknown combos. Only the two explicitly defined penalty combos (#1301, #1302) deduct points.

---

## Debrief

> **What you just did — in AWS terms:**
>
> 🔹 **Amazon Bedrock** — The Bedrock Bazaar. A single marketplace to access foundation models from Anthropic (Claude), Meta (Llama), Amazon (Nova), DeepSeek, and Qwen. You learned that model selection is a cost-performance tradeoff — the right model for the right task.
>
> 🔹 **Amazon Nova** — The Nova Company guild with four departments: Sonic (speech-to-speech), Act (browser/SaaS automation), Canvas (image generation), and Frontier (general-purpose). A single Amazon model family with specialized capabilities.
>
> 🔹 **AgentCore Gateway (MCP)** — The Castle Gate. Connecting your agent to external tools and services via the Model Context Protocol. A Scout knight passes through the Gate; a Soldier stays inside the walls.
>
> 🔹 **Cedar Policy & Identity** — The King's Seal. Declarative permissions defining what an agent can do, on which resources, under what conditions. A Marshal knight carries the Seal — agent + policy + identity.
>
> 🔹 **AgentCore Memory** — The Chronicle Hall. Long-term memory that persists across sessions. A Chronicler knight remembers past conversations and decisions.
>
> 🔹 **Bedrock Guardrails** — The Code of Honor. Content filters, PII detection, denied topics, and automated reasoning checks. Even the mightiest knight is bound by sacred rules of conduct.
>
> 🔹 **AgentCore Runtime** — The Proving Ground. Where agents are assembled from components and deployed. The Champion combines every capability: model + gateway + memory + policy + guardrails + observability.
>
> 🔹 **AgentCore Observability** — The Herald's Ledger. Every action traced, every decision recorded, every tool call logged. Without observability, you're flying blind.
>
> *You didn't just prepare a festival. You learned how Amazon Bedrock AgentCore assembles a complete AI agent — from selecting a foundation model, to connecting tools, to enforcing policy, to deploying with full observability. Each knight rank maps to a real capability. Each errand teaches a real concept. The kingdom runs on the same principles as the cloud.*
