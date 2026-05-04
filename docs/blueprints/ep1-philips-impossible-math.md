# Scenario Blueprint: Episode 1 — Philip's Impossible Math

## Meta

- **Episode:** 1
- **Title:** Philip's Impossible Math
- **Category:** bible-jesus-miracles
- **Arc:** Feeding the Five Thousand (John 6:1-14)
- **Duration:** 25–30 minutes
- **Players:** 1–6
- **Difficulty:** Tier 1 — Initiate
- **Bible Topics:** Feeding the 5000, divine provision vs human calculation, faith beyond logistics, the sign of the Prophet
- **Mechanics Used:** discoveries, npc-dialog, card combination, crowd-counter-lock, keypad-lock, offering-table-lock, maze-lock (checkpoints), bread-break-lock, word-lock (English + Hebrew), hidden elements, lore fragments (12 Bible verses)

---

## Narrative

### Voices

| Key | Polly Voice | Role |
|-----|-------------|------|
| narrator | Joanna | Story narrator — warm, sets the scene |
| philip | Matthew | Philip's inner thoughts — practical, calculating |

### Intro

| Voice | Line | Pause |
|-------|------|-------|
| narrator | The hillside above the Sea of Galilee is alive with people. Thousands of them — men, women, children — spread across the grass like a living carpet. | 1000ms |
| narrator | You are Philip of Bethsaida. The practical disciple. The one who counts the money, plans the routes, arranges the lodging. | 800ms |
| narrator | The teacher has been speaking all day. The sun is dropping toward the western hills. And now he turns to you. | 1000ms |
| narrator | "Where shall we buy bread for these people to eat?" | 1200ms |
| philip | I look out at the crowd. My stomach drops. This isn't a question — it's an impossibility. But he asked me. And I'm the one with the numbers. | 800ms |
| philip | Time to do the math. | — |

### Mid-Event (at 15:00 remaining)

| Voice | Line | Pause |
|-------|------|-------|
| narrator | The sun drops lower. The crowd grows restless. Hungry faces turn toward the disciples. | 800ms |
| philip | I'm running out of time. Five thousand men and their families — and I still don't have an answer. | — |

### Ending (Success)

| Voice | Line | Pause |
|-------|------|-------|
| narrator | You sit on the grass among twelve baskets, each overflowing with fragments of barley bread. | 1000ms |
| philip | Five loaves. Two fish. Five thousand fed. Twelve baskets left over. The math doesn't work. It never did. And now I understand — it was never supposed to. | 1200ms |
| narrator | The crowd is buzzing. The same phrase passes from group to group like a wave: "Surely this is the Prophet who is to come into the world." | 1000ms |
| philip | He asked me the question not because he needed an answer. He asked because he wanted me to see — truly see — that what he was about to do was beyond anything I could calculate, purchase, or arrange. | 800ms |
| narrator | You pick up your basket — still heavy with fragments — and follow the others down the hillside. The stars are coming out over the Sea of Galilee. | — |

---

## Room Graph

```
[The Hillside] ──(count 5000)──▶ [The Crowd] ──▶ [The Boy's Basket]
                                              ──▶ [The Arrangement]
                                                        │
                              ┌──────────────────────────┘
                              │ (both complete)
                              ▼
                       [The Blessing] ──(miracle)──▶ [The Hillside (After)]
```

| Room | Card ID | Unlocked By | Unlock Text |
|------|---------|-------------|-------------|
| The Hillside | 100 | — (starting room) | You stand on the hillside above the Sea of Galilee |
| The Crowd | 120 | Event #113: Crowd counted | You descend into the crowd to search for food |
| The Boy's Basket | 140 | Event #133: Search exhausted | Andrew brings a boy with a small basket |
| The Arrangement | 160 | Event #133: Search exhausted | The teacher says: "Have the people sit down" |
| The Blessing | 180 | Event #175: Both tasks complete | The food and the crowd are ready |
| The Hillside (After) | 200 | Event #195: Miracle witnessed | The miracle is done. Gather the leftovers. |



---

## Room Details

### Room 1: The Hillside (Card #100)

> The hillside above the Sea of Galilee stretches before you, covered in green grass. Thousands of people sit in clusters — men, women, children — as far as you can see. The teacher has been speaking all day. Now he turns to you with an impossible question: "Where shall we buy bread for these people to eat?" You need to count the crowd before you can even begin to calculate.

**Image:** `assets/the-hillside.png` (Hebrew letters אות carved subtly on a rock in the foreground)

**Discoveries:**

| Label | Card | Type | Title | Requires |
|-------|------|------|-------|----------|
| Survey the crowd from the ridge | #101 | 🔵 Object | The Vast Crowd (puzzle: crowd-counter) | — |
| Calculate the cost in your head | #102 | 🔴 Item | Philip's Calculation | — |
| Notice the distant villages | #103 | 🔴 Item | Distant Markets | — |

**Puzzle: Count the Crowd (Crowd Counter Lock)**

| ID | Type | UI | Solution |
|----|------|----|----------|
| crowd-counter | crowd_counter_lock | crowd-counter-lock | Select groups totaling exactly 5000 |

**Config:**
```json
{
  "rows": 5, "cols": 6,
  "clusters": [
    { "row": 0, "col": 0, "count": 800, "icon": "👨‍👩‍👦" },
    { "row": 0, "col": 3, "count": 600, "icon": "👥" },
    { "row": 0, "col": 5, "count": 400, "icon": "👥" },
    { "row": 1, "col": 1, "count": 700, "icon": "👨‍👩‍👦" },
    { "row": 1, "col": 4, "count": 500, "icon": "👥" },
    { "row": 2, "col": 0, "count": 300, "icon": "👥" },
    { "row": 2, "col": 2, "count": 900, "icon": "👨‍👩‍👦" },
    { "row": 2, "col": 5, "count": 200, "icon": "👥" },
    { "row": 3, "col": 1, "count": 450, "icon": "👥" },
    { "row": 3, "col": 3, "count": 650, "icon": "👨‍👩‍👦" },
    { "row": 4, "col": 0, "count": 150, "icon": "👥" },
    { "row": 4, "col": 2, "count": 550, "icon": "👥" },
    { "row": 4, "col": 4, "count": 350, "icon": "👨‍👩‍👦" },
    { "row": 4, "col": 5, "count": 250, "icon": "👥" }
  ],
  "target": 5000,
  "tolerance": 0
}
```

**Hints:**
1. "Count the men, as is custom. You need groups that add up to exactly 5,000."
2. "Try selecting the largest groups first, then fill in with smaller ones. 800 + 700 + 900 + 650 + 550 + 500 + 400 + 300 + 200 = ?"
3. "Select: 800, 600, 700, 500, 900, 650, 550, 300 = 5,000."

**On solve:** Event #113 — "Five thousand men. At least. Plus women and children — the true number could be ten thousand or more." Discovers Bible Fragment #300 (John 6:5), #301 (John 6:10). Unlocks The Crowd (#120).

**Combinations:**

| Item (Red) | + Object (Blue) | = Result | Type |
|------------|-----------------|----------|------|
| #102 Philip's Calculation | #101 The Vast Crowd | #112 "It would take more than 200 denarii — eight months' wages — for each one to have even a little!" | ✅ Event → discovers Bible Fragment #302 (John 6:7) |

**Lore:**

| Label | Card | Type | Title | Verse |
|-------|------|------|-------|-------|
| Bible Fragment: John 6:5 | #300 | 📜 Lore | "Where shall we buy bread for these people to eat?" | John 6:5 |
| Bible Fragment: John 6:10 | #301 | 📜 Lore | "Now there was much grass in the place." | John 6:10 |
| Bible Fragment: John 6:7 | #302 | 📜 Lore | "It would take more than half a year's wages..." | John 6:7 |



---

### Room 2: The Crowd (Card #120)

> You descend into the crowd, searching for food. Families huddle on the grass. A merchant sits with an empty cart. The other disciples fan out — Peter shrugs, James and John have nothing. Judas clutches the money bag, counting coins. Surely someone brought provisions. You ask family after family. Nothing. The crowd came unprepared, drawn by the teacher's words, not thinking about dinner.

**Image:** `assets/the-crowd.png`

**Discoveries:**

| Label | Card | Type | Title | Requires |
|-------|------|------|-------|----------|
| Ask the families for food | #121 | 🔵 Object | The Hungry Families (NPC) | — |
| Speak with the merchant | #122 | 🔵 Object | The Empty Merchant (NPC) | — |
| Consult Judas about the money | #123 | 🔵 Object | Judas & the Money Bag (NPC) | — |
| Calculate the denarii needed | #124 | 🔵 Object | Denarii Calculator (puzzle: denarii-math) | requires_item: #102 |

**NPC: The Hungry Families (#121)**

| ID | Type | UI |
|----|------|----|
| npc-families | tool | npc-dialog |

**Config:**
- **Name:** The Families
- **Portrait:** 👨‍👩‍👦
- **Greeting:** A woman looks up at you, her children tugging at her robe. "Are you one of the teacher's followers?"
- **Lines:**
  - "Did you bring any food?" → "We brought nothing. We expected to return home by noon, but the teacher kept speaking and we couldn't leave."
  - "Do you know anyone who brought provisions?" → "No one planned for this. We all came in a hurry when we heard the teacher was here."
  - "How many are in your group?" → "My husband, myself, and three children. But look around — every family is the same. Thousands of us, and not a crumb between us."
- **State Lines:**
  - (requires_card #102 Philip's Calculation) "I've calculated the cost — 200 denarii at minimum." → She laughs bitterly. "200 denarii? My husband earns one denarius a day. You might as well say a thousand." *(discovers Bible Fragment #303)*

**NPC: The Empty Merchant (#122)**

| ID | Type | UI |
|----|------|----|
| npc-merchant | tool | npc-dialog |

**Config:**
- **Name:** The Merchant
- **Portrait:** 🧔
- **Greeting:** The merchant sits beside his empty cart, arms crossed. "If you're looking to buy, you're too late."
- **Lines:**
  - "Do you have any food to sell?" → "Sold everything hours ago. A few dried figs, some olives. Gone before midday. This crowd cleaned me out."
  - "Where is the nearest market?" → "Bethsaida is the closest, but their market couldn't feed a hundred people, let alone five thousand. Tiberias is across the water. Capernaum — too far before dark."
  - "Could we send people to buy food in the villages?" → "Even if you could, the villages around here don't have enough. You'd need a caravan from Sepphoris. That's a day's journey."

**NPC: Judas & the Money Bag (#123)**

| ID | Type | UI |
|----|------|----|
| npc-judas | tool | npc-dialog |

**Config:**
- **Name:** Judas
- **Portrait:** 💰
- **Greeting:** Judas looks up from counting coins. "Don't ask me for a miracle, Philip. I deal in numbers, same as you."
- **Lines:**
  - "How much do we have?" → "Less than you'd like. Certainly not 200 denarii. We have perhaps 30 denarii — enough for the disciples' own meals for a week, not for this crowd."
  - "Could we take a collection from the crowd?" → "From whom? These are poor Galileans. Fishermen, farmers, day laborers. They have nothing to give."
  - "What do you suggest?" → "Send them away. Let them buy food in the villages. It's the only rational option." He pauses. "But the teacher said no."
- **State Lines:**
  - (requires_card #103 Distant Markets) "The nearest markets can't supply enough." → Judas nods grimly. "I know. I've already calculated it. Even if we emptied every shop in Bethsaida, we'd feed maybe two hundred. The math doesn't work, Philip." *(triggers Event #130)*

**Puzzle: Denarii Math (Keypad Lock)**

| ID | Type | UI | Solution |
|----|------|----|----------|
| denarii-math | code_entry | keypad-lock | 200 |

Philip calculated the minimum cost. A loaf feeds 3 people. 5,000 men need at least 1,667 loaves. At half a denarius per loaf, how many denarii minimum? (Round down to the nearest hundred.)

**False Outputs:**
- Entering 100: "That would only buy 200 loaves — enough for 600 people."
- Entering 300: "Even 200 denarii is more than enough for 'a little.' You're overestimating."
- Entering 30: "That's what Judas has in the bag. Not nearly enough."

**Hints:**
1. "One loaf feeds about 3 people. 5,000 men need roughly 1,667 loaves."
2. "At half a denarius per loaf: 1,667 × 0.5 ≈ 834 denarii. But Philip rounded to the nearest landmark number."
3. "Philip said 'more than 200 denarii' — that's the biblical figure. Enter 200."

**On solve:** Event #133 — "200 denarii. Eight months' wages. And even that wouldn't be enough — just 'a little' for each person. The math doesn't work. It can't work." Discovers Bible Fragment #304 (Mark 6:37). Unlocks The Boy's Basket (#140) AND The Arrangement (#160).

**Combinations:**

| Item (Red) | + Object (Blue) | = Result | Type |
|------------|-----------------|----------|------|
| #103 Distant Markets | #122 The Empty Merchant | #130 "Every market within reach is empty or too far. There is no supply chain that solves this." | ✅ Event → adds to evidence |

**Trap Combination:**

| Item (Red) | + Object (Blue) | = Result | Type |
|------------|-----------------|----------|------|
| #102 Philip's Calculation | #123 Judas & the Money Bag | #128 "You and Judas argue over the numbers. 200 denarii, 30 denarii — it doesn't matter. Neither amount feeds five thousand. You've wasted time on arithmetic." | ❌ Penalty (30s) |

**Consumes (on #133):** #103

**Lore:**

| Label | Card | Type | Title | Verse |
|-------|------|------|-------|-------|
| Bible Fragment: John 6:6 | #303 | 📜 Lore | "He asked this only to test him..." | John 6:6 |
| Bible Fragment: Mark 6:37 | #304 | 📜 Lore | "You give them something to eat." | Mark 6:37 |



---

### Room 3: The Boy's Basket (Card #140)

> Andrew appears, pushing through the crowd with a boy at his side. The boy is young — perhaps twelve — clutching a small woven basket. Andrew looks embarrassed, almost apologetic. "There is a boy here who has five barley loaves and two small fish." You stare at the basket. Barley loaves — the cheapest bread. Two small dried fish. For five thousand men and their families. It's not a solution — it's a joke. But the teacher doesn't laugh.

**Image:** `assets/the-boys-basket.png` (5+2 scratched into the basket weave)

**Discoveries:**

| Label | Card | Type | Title | Requires |
|-------|------|------|-------|----------|
| Speak with Andrew | #141 | 🔵 Object | Andrew (NPC) | — |
| Examine the boy's basket | #142 | 🔵 Object | The Boy's Basket (puzzle: offering-table) | — |
| Look at the boy | #143 | 🔴 Item | The Boy's Trust | — |

**NPC: Andrew (#141)**

| ID | Type | UI |
|----|------|----|
| npc-andrew | tool | npc-dialog |

**Config:**
- **Name:** Andrew
- **Portrait:** 🧑‍🦱
- **Greeting:** Andrew shifts his weight, uncomfortable. "I know it's not much. But it's all I could find."
- **Lines:**
  - "Five loaves and two fish? For five thousand?" → "I know, I know. But what are these among so many? I searched the entire crowd, Philip. This boy is the only one who brought anything."
  - "Where did you find him?" → "Near the back of the crowd. His mother packed the basket this morning. He was willing to share — didn't even hesitate."
  - "Why bring this to the teacher?" → Andrew pauses. "Because he asked us to feed them. And this is all there is. I'd rather bring something impossible than bring nothing at all."
- **State Lines:**
  - (requires_card #143 The Boy's Trust) "The boy gave everything he had without hesitation." → Andrew nods slowly. "He didn't calculate whether it was enough. He just offered it. Maybe that's the point." *(discovers Bible Fragment #305)*

**Puzzle: The Offering Table (Offering Table Lock)**

| ID | Type | UI | Solution |
|----|------|----|----------|
| offering-table | offering_table_lock | offering-table-lock | Select 5 loaves + 2 fish from distractors |

**Config:**
```json
{
  "items": [
    { "id": "l1", "icon": "🍞", "label": "Barley loaf", "correct": true },
    { "id": "coins", "icon": "💰", "label": "Bag of coins", "correct": false, "response": "Philip said 200 denarii wouldn't be enough." },
    { "id": "l2", "icon": "🍞", "label": "Barley loaf", "correct": true },
    { "id": "water", "icon": "🫗", "label": "Water skin", "correct": false, "response": "Water won't feed the hungry." },
    { "id": "f1", "icon": "🐟", "label": "Small fish", "correct": true },
    { "id": "cloth", "icon": "🧣", "label": "Linen cloth", "correct": false, "response": "You can't eat cloth." },
    { "id": "l3", "icon": "🍞", "label": "Barley loaf", "correct": true },
    { "id": "figs", "icon": "🫒", "label": "A few dried figs", "correct": false, "response": "Barely enough for one person." },
    { "id": "f2", "icon": "🐟", "label": "Small fish", "correct": true },
    { "id": "l4", "icon": "🍞", "label": "Barley loaf", "correct": true },
    { "id": "sandal", "icon": "👡", "label": "Worn sandal", "correct": false, "response": "That's not food." },
    { "id": "l5", "icon": "🍞", "label": "Barley loaf", "correct": true },
    { "id": "scroll", "icon": "📜", "label": "Torah scroll", "correct": false, "response": "Man does not live by bread alone... but they still need bread." }
  ]
}
```

**Hints:**
1. "The boy has five barley loaves and two small fish. Find exactly those items among the crowd's belongings."
2. "Look for the 🍞 and 🐟 icons. Ignore coins, water, cloth, and other distractors."
3. "Select all 5 loaves (🍞) and both fish (🐟). Leave everything else."

**On solve:** Event #153 — "Five loaves and two fish. Andrew's question echoes: 'What are these among so many?' But the teacher takes the basket." Discovers Bible Fragment #306 (John 6:9). Discovers Item #155 (The Offering — "Five barley loaves and two small fish, given freely by a boy").

**Combinations:**

| Item (Red) | + Object (Blue) | = Result | Type |
|------------|-----------------|----------|------|
| #143 The Boy's Trust | #141 Andrew | #152 "The boy didn't calculate whether it was enough. He just offered everything he had. Perhaps faith isn't about the math." | ✅ Event → discovers Bible Fragment #305 |

**Consumes (on #153):** #143

**Lore:**

| Label | Card | Type | Title | Verse |
|-------|------|------|-------|-------|
| Bible Fragment: John 6:9 | #305 | 📜 Lore | "What are these among so many?" | John 6:9 |
| Bible Fragment: John 6:9 | #306 | 📜 Lore | "There is a boy here who has five barley loaves and two small fish." | John 6:9 |



---

### Room 4: The Arrangement (Card #160)

> The teacher gives an instruction that makes no logistical sense: "Have the people sit down." You and the other disciples begin organizing the crowd into groups — fifties and hundreds — across the green hillside. It takes time. The sun continues to drop. The crowd murmurs — some confused, some impatient, some trusting. You walk among them, directing, counting, arranging. The hillside transforms from a chaotic mass into an organized assembly. Like a feast being prepared — except there is no feast.

**Image:** `assets/the-arrangement.png`

**Discoveries:**

| Label | Card | Type | Title | Requires |
|-------|------|------|-------|----------|
| Begin organizing the crowd | #161 | 🔵 Object | The Crowd Groups (puzzle: arrangement-maze) | — |
| Count the organized groups | #162 | 🔴 Item | Group Tally | — |

**Puzzle: Organize the Crowd (Maze Lock with Checkpoints)**

| ID | Type | UI | Solution |
|----|------|----|----------|
| arrangement-maze | maze_lock | maze-lock | Visit all 6 checkpoints, return to start |

Navigate the hillside, visiting each group (◆) to seat them in order. Return to the start (★) when all groups are organized.

**Config:**
```json
{
  "cols": 6, "rows": 5,
  "walls": [
    [0,2,"S"], [0,4,"W"],
    [1,1,"E"], [1,3,"S"],
    [2,0,"S"], [2,4,"W"],
    [3,2,"E"], [3,5,"W"]
  ],
  "start": { "row": 2, "col": 3, "facing": "N" },
  "goal": { "row": 2, "col": 3 },
  "showGoal": true,
  "playerIcon": "🍞",
  "showSteps": true,
  "showWalls": true,
  "checkpoints": [
    { "row": 0, "col": 0, "icon": "👥", "nextIcon": "🐟" },
    { "row": 0, "col": 5, "icon": "👥", "nextIcon": "🍞" },
    { "row": 1, "col": 2, "icon": "👥", "nextIcon": "🐟" },
    { "row": 3, "col": 0, "icon": "👥", "nextIcon": "🍞" },
    { "row": 3, "col": 4, "icon": "👥", "nextIcon": "🐟" },
    { "row": 4, "col": 2, "icon": "👥", "nextIcon": "🍞" }
  ]
}
```

**Hints:**
1. "Visit every group (👥) on the hillside. They'll turn to ✓ when you reach them."
2. "Start by heading north to reach the top groups, then work your way down and around."
3. "After visiting all 6 groups, return to the ★ starting position to complete the arrangement."

**On solve:** Event #173 — "The crowd is seated. Groups of fifty. Groups of a hundred. The hillside is organized like a feast — except there are only five loaves and two fish." Discovers Bible Fragment #307 (John 6:10), #308 (Mark 6:40). Discovers Item #174 (Crowd Arranged — "Five thousand men seated in orderly groups, ready for... something").

**Lore:**

| Label | Card | Type | Title | Verse |
|-------|------|------|-------|-------|
| Bible Fragment: John 6:10 | #307 | 📜 Lore | "Jesus said, 'Have the people sit down.'" | John 6:10 |
| Bible Fragment: Mark 6:40 | #308 | 📜 Lore | "So they sat down in groups of hundreds and fifties." | Mark 6:40 |



---

### Gate: Both Branches Complete → The Blessing

Event #175 fires when the player has BOTH Item #155 (The Offering) AND Item #174 (Crowd Arranged). This is checked via a combination:

| Item (Red) | + Object (Blue) | = Result | Type |
|------------|-----------------|----------|------|
| #155 The Offering | #174 Crowd Arranged | #175 "The food is gathered. The crowd is seated. Everything is ready. The teacher takes the basket from the boy." | ✅ Event → unlocks The Blessing (#180) |

**Consumes (on #175):** #155, #174

*Note: #155 and #174 are items from Rooms 3 and 4 respectively. They are NOT consumed until this combination, allowing the player to complete both branches in any order.*

---

### Room 5: The Blessing (Card #180)

> The teacher takes the five loaves and the two fish. He looks up to heaven. He gives thanks. And then he begins to break the bread. You watch his hands. He tears a loaf and hands a piece to you. You take it — warm, fresh, as if just baked. He tears another piece. And another. The loaf doesn't get smaller. He hands you a basket: "Distribute."

**Image:** `assets/the-blessing.png`

**Discoveries:**

| Label | Card | Type | Title | Requires |
|-------|------|------|-------|----------|
| Watch the teacher break the bread | #181 | 🔵 Object | The Breaking (puzzle: bread-break) | — |
| Take a basket and distribute | #182 | 🔴 Item | The Endless Basket | — |

**Puzzle: Break the Bread (Bread Break Lock)**

| ID | Type | UI | Solution |
|----|------|----|----------|
| bread-break | bread_break_lock | bread-break-lock | Hold each item in the green zone to break it |

Hold each loaf and fish to break it. Too quick = nothing happens. Too long = it crumbles. The counter multiplies with each successful break.

**Config:**
```json
{
  "items": [
    { "id": "l1", "icon": "🍞", "label": "Loaf 1" },
    { "id": "l2", "icon": "🍞", "label": "Loaf 2" },
    { "id": "l3", "icon": "🍞", "label": "Loaf 3" },
    { "id": "l4", "icon": "🍞", "label": "Loaf 4" },
    { "id": "l5", "icon": "🍞", "label": "Loaf 5" },
    { "id": "f1", "icon": "🐟", "label": "Fish 1" },
    { "id": "f2", "icon": "🐟", "label": "Fish 2" }
  ],
  "holdMin": 0.4,
  "holdMax": 1.2,
  "multiplier": [10, 50, 200, 800, 2000, 3500, 5000]
}
```

**Hints:**
1. "Hold each item — not too quick, not too long. Find the sweet spot in the green zone."
2. "Press and hold for about half a second to one second. Release when the bar is in the green."
3. "The counter shows how many are fed. Break all 7 items to reach 5,000+."

**On solve:** Event #195 — "5,000 fed. From five loaves and two fish. The basket never emptied. The bread was always warm. The fish was always fresh. 'As much as they wanted.' Not a little. Not a bite. As much as they wanted." Discovers Bible Fragment #309 (John 6:11). Unlocks The Hillside After (#200).

**Combinations:**

| Item (Red) | + Object (Blue) | = Result | Type |
|------------|-----------------|----------|------|
| #182 The Endless Basket | #181 The Breaking | #193 "You keep distributing. Group after group. Fifty people. A hundred. Five hundred. A thousand. The basket never empties." | ✅ Event → bonus score |

**Consumes (on #195):** #182

**Lore:**

| Label | Card | Type | Title | Verse |
|-------|------|------|-------|-------|
| Bible Fragment: John 6:11 | #309 | 📜 Lore | "Jesus then took the loaves, gave thanks, and distributed to those who were seated as much as they wanted." | John 6:11 |



---

### Room 6: The Hillside — After (Card #200)

> The crowd is satisfied. Every person on this hillside has eaten their fill. Stunned silence gives way to wonder, then excited whispers. The teacher turns to you: "Gather the pieces that are left over. Let nothing be wasted." You take a basket and begin collecting. Fragments of barley bread, pieces of fish — scattered across the grass where thousands just ate. The hillside stretches before you in the fading light, dotted with the remains of an impossible feast.

**Image:** `assets/the-hillside-after.png` (12 baskets hidden in the grass pattern)

**Discoveries:**

| Label | Card | Type | Title | Requires |
|-------|------|------|-------|----------|
| Search the hillside for hidden baskets | #201 | 🔵 Object | Hidden Baskets (hidden element) | — |
| Count the baskets you've collected | #202 | 🔴 Item | Twelve Baskets | — |
| Listen to the crowd's reaction | #203 | 🔴 Item | The Crowd's Declaration | — |
| Reflect on the sign | #204 | 🔵 Object | The Sign Revealed (puzzle: prophet-word) | requires_item: #202 |
| Study the Hebrew letters on the rock | #205 | 🔵 Object | The Hebrew Sign (puzzle: hebrew-sign) | requires_item: #203 |

**Puzzle: Hidden Element — Find 12 Baskets**

| ID | Type | Solution | Auto-hint |
|----|------|----------|-----------|
| hidden-baskets | hidden_element | Number **12** hidden in the grass pattern | After 120s |

**Hints:**
1. "The teacher said to gather the leftovers. Look carefully at the hillside artwork."
2. "How many baskets did the disciples collect? Look for that number hidden in the grass."
3. "The number 12 is hidden in the grass pattern of the artwork."

**On solve:** Discovers Item #202 (Twelve Baskets — "Twelve full baskets of leftovers from five loaves and two fish. One for each disciple.") and Bible Fragment #310 (John 6:12).

**Puzzle: The Prophet (Word Lock — English)**

| ID | Type | UI | Input | Solution |
|----|------|----|-------|----------|
| prophet-word | code_entry | word-lock | 7 letters | PROPHET |

The crowd saw the sign and declared: "Surely this is the ____ who is to come into the world."

**Hints:**
1. "After seeing the miracle, the crowd recognized Jesus as a figure foretold in Scripture."
2. "Moses promised that God would raise up someone like him. The crowd used that title."
3. "The answer is PROPHET. 'Surely this is the Prophet who is to come into the world.' (John 6:14)"

**On solve:** Event #218 — Discovers Bible Fragment #311 (John 6:14). Discovers Item #219 (The Sign Understood — "This was not luck, or planning, or logistics. It was a sign.").

**Puzzle: The Hebrew Sign (Word Lock — Hebrew)**

| ID | Type | UI | Input | Solution |
|----|------|----|-------|----------|
| hebrew-sign | code_entry | word-lock | 3 letters | אות |

You noticed Hebrew letters carved on a rock back on the hillside. The word means "sign" — what the crowd called this miracle. Enter the Hebrew word.

**Config:**
```json
{
  "answer": "אות",
  "alphabet": "אבגדהוזחטיכלמנסעפצקרשת"
}
```

**Hints:**
1. "Remember the rock in Room 1? Hebrew letters were carved into it. The word means 'sign.'"
2. "The Hebrew word for 'sign' is three letters: aleph, vav, tav. Hebrew reads right to left."
3. "Enter אות (aleph-vav-tav). Look at the Room 1 artwork for the visual clue."

**On solve:** Event #222 — "אות — Sign. The feeding of the five thousand was not just a meal. It was a sign — pointing beyond itself to who Jesus is." Discovers Bible Fragment #300 bonus context.

**Final Combination:**

| Item (Red) | + Object (Blue) | = Result | Type |
|------------|-----------------|----------|------|
| #219 The Sign Understood | #204 The Sign Revealed | #999 "Five loaves. Two fish. Five thousand fed. Twelve baskets left over. The math doesn't work. It never did. And now you understand — it was never supposed to." | ✅ Event → **ENDING** |

**Trap Combination:**

| Item (Red) | + Object (Blue) | = Result | Type |
|------------|-----------------|----------|------|
| #102 Philip's Calculation | #202 Twelve Baskets | #215 "You try to make the numbers work. Five loaves divided by five thousand... twelve baskets of leftovers from seven items... The math breaks every way you try it. That's the point." | ❌ Penalty (30s) |

**Consumes (on #999):** #219

**Lore:**

| Label | Card | Type | Title | Verse |
|-------|------|------|-------|-------|
| Bible Fragment: John 6:12 | #310 | 📜 Lore | "Gather the pieces that are left over. Let nothing be wasted." | John 6:12 |
| Bible Fragment: John 6:13 | #311 | 📜 Lore | "They filled twelve baskets with the pieces of the five barley loaves left over." | John 6:13 |



---

## Dependency Chain (Critical Path)

```
START
  │
  ▼
[The Hillside] (#100)
  │ discover: The Vast Crowd (#101) — puzzle: crowd-counter
  │ discover: Philip's Calculation (#102)
  │ → Event #113 (Crowd counted — 5,000 men)
  │
  ▼
[The Crowd] (#120)
  │ discover: Families (#121), Merchant (#122), Judas (#123)
  │ discover: Denarii Calculator (#124) — requires_item: #102
  │ puzzle: keypad-lock (enter 200)
  │ → Event #133 (Search exhausted — 200 denarii not enough)
  │
  ├──────────────────────────────┐
  ▼                              ▼
[The Boy's Basket] (#140)    [The Arrangement] (#160)
  │ discover: Andrew (#141)    │ discover: Crowd Groups (#161)
  │ puzzle: offering-table     │ puzzle: maze-lock (checkpoints)
  │ → Event #153               │ → Event #173
  │ → Item #155 (The Offering) │ → Item #174 (Crowd Arranged)
  │                              │
  └──────────┬───────────────────┘
             │ combine: #155 + #174 = Event #175
             ▼
[The Blessing] (#180)
  │ discover: The Breaking (#181) — puzzle: bread-break
  │ → Event #195 (Miracle witnessed — 5,000 fed)
  │
  ▼
[The Hillside After] (#200)
  │ discover: Hidden Baskets (#201) — hidden element (find 12)
  │ → Item #202 (Twelve Baskets)
  │ discover: Crowd's Declaration (#203)
  │ puzzle: word-lock PROPHET (requires_item: #202)
  │ → Event #218 → Item #219 (The Sign Understood)
  │ puzzle: word-lock אות (requires_item: #203)
  │ → Event #222 (bonus)
  │ combine: #219 + #204 = Event #999 (ENDING)
  │
  ▼
END
```

### Optional Paths

```
[The Hillside]
  │ combine: #102 Calculation + #101 Crowd = Event #112 → Bible Fragment #302 (bonus lore)

[The Crowd]
  │ combine: #103 Distant Markets + #122 Merchant = Event #130 (bonus evidence)
  │ NPC state_lines: Families (requires #102) → Bible Fragment #303
  │ NPC state_lines: Judas (requires #103) → Event #130

[The Boy's Basket]
  │ combine: #143 Boy's Trust + #141 Andrew = Event #152 → Bible Fragment #305

[The Blessing]
  │ combine: #182 Endless Basket + #181 The Breaking = Event #193 (bonus score)

[The Hillside After]
  │ puzzle: hebrew-sign word-lock אות → Event #222 (bonus lore)
```

### Trap / Penalty Paths

```
[The Crowd]
  │ combine: #102 Calculation + #123 Judas = Penalty #128 (-30s)
  │   "You and Judas argue over the numbers."

[The Hillside After]
  │ combine: #102 Calculation + #202 Twelve Baskets = Penalty #215 (-30s)
  │   "You try to make the numbers work. The math breaks."
```



---

## Card Index

| ID | Type | Color | Title | Room | Image |
|----|------|-------|-------|------|-------|
| 100 | location | 🟢 | The Hillside | the-hillside | the-hillside.png |
| 101 | object | 🔵 | The Vast Crowd | the-hillside | card-vast-crowd.png |
| 102 | item | 🔴 | Philip's Calculation | the-hillside | card-philips-calculation.png |
| 103 | item | 🔴 | Distant Markets | the-hillside | card-distant-markets.png |
| 112 | event | 🟡 | "More than 200 denarii!" | the-hillside | — |
| 113 | event | 🟡 | Crowd counted — 5,000 men. | the-hillside | — |
| 120 | location | 🟢 | The Crowd | the-crowd | the-crowd.png |
| 121 | object | 🔵 | The Hungry Families (NPC) | the-crowd | card-families.png |
| 122 | object | 🔵 | The Empty Merchant (NPC) | the-crowd | card-merchant.png |
| 123 | object | 🔵 | Judas & the Money Bag (NPC) | the-crowd | card-judas.png |
| 124 | object | 🔵 | Denarii Calculator | the-crowd | card-denarii-calc.png |
| 128 | penalty | ⚫ | "Arguing over numbers." | the-crowd | — |
| 130 | event | 🟡 | "No supply chain solves this." | the-crowd | — |
| 133 | event | 🟡 | Search exhausted — 200 denarii not enough. | the-crowd | — |
| 140 | location | 🟢 | The Boy's Basket | the-boys-basket | the-boys-basket.png |
| 141 | object | 🔵 | Andrew (NPC) | the-boys-basket | card-andrew.png |
| 142 | object | 🔵 | The Boy's Basket | the-boys-basket | card-boys-basket.png |
| 143 | item | 🔴 | The Boy's Trust | the-boys-basket | card-boys-trust.png |
| 152 | event | 🟡 | "He just offered everything." | the-boys-basket | — |
| 153 | event | 🟡 | Five loaves and two fish gathered. | the-boys-basket | — |
| 155 | item | 🔴 | The Offering | the-boys-basket | card-the-offering.png |
| 160 | location | 🟢 | The Arrangement | the-arrangement | the-arrangement.png |
| 161 | object | 🔵 | The Crowd Groups | the-arrangement | card-crowd-groups.png |
| 162 | item | 🔴 | Group Tally | the-arrangement | card-group-tally.png |
| 173 | event | 🟡 | Crowd arranged in groups. | the-arrangement | — |
| 174 | item | 🔴 | Crowd Arranged | the-arrangement | card-crowd-arranged.png |
| 175 | event | 🟡 | Both tasks complete — ready for the blessing. | gate | — |
| 180 | location | 🟢 | The Blessing | the-blessing | the-blessing.png |
| 181 | object | 🔵 | The Breaking | the-blessing | card-the-breaking.png |
| 182 | item | 🔴 | The Endless Basket | the-blessing | card-endless-basket.png |
| 193 | event | 🟡 | "The basket never empties." | the-blessing | — |
| 195 | event | 🟡 | Miracle witnessed — 5,000 fed. | the-blessing | — |
| 200 | location | 🟢 | The Hillside (After) | the-hillside-after | the-hillside-after.png |
| 201 | object | 🔵 | Hidden Baskets | the-hillside-after | card-hidden-baskets.png |
| 202 | item | 🔴 | Twelve Baskets | the-hillside-after | card-twelve-baskets.png |
| 203 | item | 🔴 | The Crowd's Declaration | the-hillside-after | card-crowd-declaration.png |
| 204 | object | 🔵 | The Sign Revealed | the-hillside-after | card-sign-revealed.png |
| 205 | object | 🔵 | The Hebrew Sign | the-hillside-after | card-hebrew-sign.png |
| 215 | penalty | ⚫ | "The math breaks." | the-hillside-after | — |
| 218 | event | 🟡 | "Surely this is the Prophet." | the-hillside-after | — |
| 219 | item | 🔴 | The Sign Understood | the-hillside-after | card-sign-understood.png |
| 222 | event | 🟡 | "אות — Sign." | the-hillside-after | — |
| 999 | event | 🟡 | Investigation complete. | the-hillside-after | — |

### Bible Fragments (Lore Cards)

| ID | Type | Color | Title | Verse | Discovered In |
|----|------|-------|-------|-------|---------------|
| 300 | lore | 📜 | "Where shall we buy bread for these people to eat?" | John 6:5 | the-hillside |
| 301 | lore | 📜 | "Now there was much grass in the place." | John 6:10 | the-hillside |
| 302 | lore | 📜 | "It would take more than half a year's wages..." | John 6:7 | the-hillside |
| 303 | lore | 📜 | "He asked this only to test him..." | John 6:6 | the-crowd |
| 304 | lore | 📜 | "You give them something to eat." | Mark 6:37 | the-crowd |
| 305 | lore | 📜 | "What are these among so many?" | John 6:9 | the-boys-basket |
| 306 | lore | 📜 | "There is a boy here who has five barley loaves and two small fish." | John 6:9 | the-boys-basket |
| 307 | lore | 📜 | "Jesus said, 'Have the people sit down.'" | John 6:10 | the-arrangement |
| 308 | lore | 📜 | "So they sat down in groups of hundreds and fifties." | Mark 6:40 | the-arrangement |
| 309 | lore | 📜 | "Jesus then took the loaves, gave thanks, and distributed..." | John 6:11 | the-blessing |
| 310 | lore | 📜 | "Gather the pieces that are left over. Let nothing be wasted." | John 6:12 | the-hillside-after |
| 311 | lore | 📜 | "They filled twelve baskets with the pieces of the five barley loaves left over." | John 6:13 | the-hillside-after |



---

## Timed Events

| Time Remaining | Event | Effect |
|----------------|-------|--------|
| 30:00 | Start | Intro narrative plays. The Hillside is revealed. |
| 15:00 | Mid-Event | Mid-event narrative plays: "The sun drops lower. The crowd grows restless." |
| 05:00 | Urgency | philip: "The sun is almost gone. Five thousand hungry people and I still have no answer. I must finish this now." |
| 00:00 | Time Up | Ending (Failure): "The sun sets. The crowd disperses, hungry and disappointed. You stand on the empty hillside, holding nothing but your calculations. The math was right — but the answer was never in the numbers." |

---

## Scoring

| Factor | Value |
|--------|-------|
| Base score | 30 |
| Time bonus | +1 per minute remaining |
| Hint penalty | -2 per hint used |
| Wrong combo penalty | -3 per penalty triggered |
| Lore bonus | +1 per Bible fragment collected (max 12) |

| Stars | Min Score |
|-------|-----------|
| ⭐⭐⭐⭐⭐ | 38 |
| ⭐⭐⭐⭐ | 30 |
| ⭐⭐⭐ | 22 |
| ⭐⭐ | 14 |
| ⭐ | 0 |

**Perfect run:** 30 base + 12 lore + ~10 time bonus = 52 (no hints, no penalties, all fragments)
**Casual run:** 30 base + 7 lore + 5 time - 4 hints - 3 penalty = 35 (4 stars)

---

## meta.json Reference

```json
{
  "id": "ep1-philips-impossible-math",
  "title": "Philip's Impossible Math",
  "episode": 1,
  "arc": "Feeding the Five Thousand",
  "description": "Five thousand hungry people. No food. No money. No time. You are Philip — the practical disciple who counts the money. The teacher asks you an impossible question, and every calculation leads to the same answer: it can't be done. But what if the answer was never in the numbers?",
  "difficulty": { "tier": 1, "label": "Initiate" },
  "duration_minutes": 30,
  "players": { "min": 1, "max": 6, "recommended": 4 },
  "bible_topics": ["Feeding the 5000", "Divine provision", "Faith beyond logistics", "The sign of the Prophet"],
  "start_button": "Survey the Hillside",
  "lore_label": "Scripture Fragments",
  "end_title": "Investigation Complete",
  "version": "0.1"
}
```
