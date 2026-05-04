# Scenario Blueprint: Episode 0 — The Master of the Feast's Investigation

## Meta

- **Episode:** 0
- **Title:** The Master of the Feast's Investigation
- **Category:** bible-jesus-miracles
- **Arc:** The Wedding at Cana (John 2:1-11)
- **Duration:** 20–30 minutes
- **Players:** 1–6
- **Difficulty:** Tier 1 — Initiate
- **Bible Topics:** First miracle of Jesus, water to wine, faith and evidence, the role of servants and witnesses
- **Mechanics Used:** discoveries, npc-dialog, card combination, word-lock, sort-lock, keypad-lock, wire-lock, match-lock, timeline-lock, hidden elements, lore fragments (13 Bible verses)

---

## Narrative

### Voices

| Key | Polly Voice | Role |
|-----|-------------|------|
| narrator | Joanna | Story narrator — warm, sets the scene |
| matthias | Matthew | Matthias's inner thoughts — authoritative, investigative |
| miriam | Ruth | Mary's voice — gentle, knowing |

### Intro

| Voice | Line | Pause |
|-------|------|-------|
| narrator | The evening air is warm and sweet with the scent of roasted lamb and fresh bread. Music drifts across the courtyard of a modest but proud home in Cana of Galilee. | 1000ms |
| narrator | You are Matthias, the master of the feast — a man of reputation, hired to ensure this wedding celebration is flawless. | 800ms |
| narrator | A servant places a cup before you. You drink. And the world stops. | 1000ms |
| matthias | This wine — it is extraordinary. Rich, deep, layered with a complexity that the finest vineyards in Jerusalem could not produce. | 800ms |
| matthias | Something is wrong. Or rather, something is impossibly right. | 1200ms |
| narrator | You call the bridegroom over. | 600ms |
| matthias | Everyone serves the good wine first, and the cheaper wine after the guests have drunk freely. But you — you have kept the good wine until now! | 800ms |
| narrator | The bridegroom smiles, but you see the flicker of confusion in his eyes. He doesn't know where this wine came from either. | 1000ms |
| matthias | I intend to find out what happened. | — |

### Mid-Event (at 15:00 remaining)

| Voice | Line | Pause |
|-------|------|-------|
| narrator | The hour grows late. Guests are beginning to leave. The courtyard thins. | 800ms |
| matthias | I'm running out of time. The witnesses will scatter by dawn. I must piece this together now. | — |

### Ending (Success)

| Voice | Line | Pause |
|-------|------|-------|
| narrator | You sit alone at the head table, your cup still half full of the wine that should not exist. | 1000ms |
| matthias | I have eliminated every explanation I know. What remains is the one I don't. | 800ms |
| narrator | Water became wine. The servants saw it. The mother believed it. The fishermen call it the first sign. | 1000ms |
| matthias | I don't have an answer. But for the first time in my careful, controlled life, the mystery itself is enough. | 800ms |
| narrator | You step out into the cool Galilean night. The stars are impossibly bright. | — |

---

## Room Graph

```
[The Head Table] ──(question Ezra)──▶ [The Servants' Corner] ──(servant testimony)──▶ [The Stone Jars]
                                                                                           │
                                              ┌────────────────────────────────────────────┘
                                              │ (examine jars)
                                              ▼
                                       [Joachim's Shop] ──(eliminate merchant)──▶ [The Bride's Family Area]
                                                                                           │
                                              ┌────────────────────────────────────────────┘
                                              │ (interview Miriam)
                                              ▼
                                       [The Eastern Corner] ──(meet disciples)──▶ [The Well]
```

| Room | Card ID | Unlocked By | Unlock Text |
|------|---------|-------------|-------------|
| The Head Table | 100 | — (starting room) | You sit at the head of the wedding feast |
| The Servants' Corner | 120 | Event #109: Ezra's Confession | Ezra directs you to the servants |
| The Stone Jars | 140 | Event #131: Servant Testimony | The servants tell you to see the jars yourself |
| Joachim's Shop | 160 | Event #149: Jar Examination | You pursue the merchant explanation |
| The Bride's Family Area | 180 | Event #169: Merchant Eliminated | The rational explanations are exhausted |
| The Eastern Corner | 200 | Event #191: Miriam's Testimony | Miriam points you toward her son's followers |
| The Well | 220 | Event #211: Disciple Witness | You have gathered all the testimony |



---

## Room Details

### Room 1: The Head Table (Card #100)

> The head table of the wedding feast. Fine linen, clay lamps flickering, the remnants of a magnificent meal. Before you sits a cup of wine — the most extraordinary wine you have ever tasted. The bridegroom dances with his bride, oblivious. Your chief steward Ezra hovers nervously nearby. Servants whisper near the far wall, glancing toward unfamiliar guests in the eastern corner.

**Image:** `assets/head-table.png`

**Discoveries:**

| Label | Card | Type | Title |
|-------|------|------|-------|
| Examine the cup of wine | #101 | 🔴 Item | The Extraordinary Cup |
| Look at the wedding feast supplies | #102 | 🔵 Object | Wine Ledger |
| Speak with Ezra the steward | #103 | 🔵 Object | Ezra (NPC) |

**NPC: Ezra the Steward (#103)**

| ID | Type | UI |
|----|------|----|
| npc-ezra | tool | npc-dialog |

**Config:**
- **Name:** Ezra
- **Portrait:** 🧔
- **Greeting:** "M-master Matthias! I was just about to come find you..."
- **Lines:**
  - "Where did this wine come from?" → "From the stores, master. I... I think."
  - "Don't lie to me, Ezra. I approved the stores." → "I... I will ask the servants. They were handling the jars tonight. Please, speak to them — they are by the far wall."
  - "What do you know about the guests in the eastern corner?" → "Unfamiliar faces, master. Not family. Not from Cana. Guests of a guest, perhaps. They arrived with a teacher from Nazareth."
- **State Lines:**
  - (requires #101 Extraordinary Cup) "Taste this wine and tell me it came from our stores." → "That is... that is not our wine, master. I have never tasted anything like it. The servants — you must speak to the servants. They know something." *(triggers Event #109)*

**Combinations:**

| Item (Red) | + Object (Blue) | = Result | Type |
|------------|-----------------|----------|------|
| #101 The Extraordinary Cup | #102 Wine Ledger | #108 "This wine is not on the ledger." | ✅ Event → discovers Bible Fragment #300 (John 2:10) |
| #101 The Extraordinary Cup | #103 Ezra | #109 "Ezra confesses." | ✅ Event → unlocks The Servants' Corner (#120) |

**Consumes (on #109):** #103

**Lore:**

| Label | Card | Type | Title | Requires |
|-------|------|------|-------|----------|
| Bible Fragment: John 2:10 | #300 | 📜 Lore | "Everyone serves the good wine first..." | Event #108 |

---

### Room 2: The Servants' Corner (Card #120)

> Three young servants huddle near the far wall of the courtyard, whispering among themselves. They fall silent when they see you approach. Amos, the eldest, stands protectively in front of the younger two — Tobiah and Reuben. Oil lamps cast long shadows across their worried faces.

**Image:** `assets/servants-corner.png`

**Discoveries:**

| Label | Card | Type | Title |
|-------|------|------|-------|
| Approach the three servants | #121 | 🔵 Object | The Servants (NPC) |
| Notice Reuben glancing toward the eastern corner | #122 | 🔴 Item | Reuben's Glance |
| Examine the servants' water-stained hands | #123 | 🔴 Item | Water-Stained Hands |

**NPC: The Servants (#121)**

| ID | Type | UI |
|----|------|----|
| npc-servants | tool | npc-dialog |

**Config:**
- **Name:** Amos, Tobiah & Reuben
- **Portrait:** 👥
- **Greeting:** "Master Matthias! We were told not to—" Amos stops himself.
- **Lines:**
  - "The wine. Tell me." → Amos: "Master, we were told not to speak of it." Tobiah shifts nervously.
  - "I am not angry. I am puzzled. That wine is the finest I have encountered in twenty years." → Tobiah breaks: "It came from the water pots, sir. The purification jars. We filled them with water. To the brim. And then... we drew from them. And it was wine."
  - "That is absurd. Who told you to do this?" → They exchange glances. Amos shakes his head. Reuben mutters: "A woman came to us first. She said, 'Whatever he tells you, do it.' Then a man told us to fill the jars."
  - "Which man? Point him out." → Reuben's eyes dart toward the eastern corner, then back to the ground. "I cannot say more, master. Please. Go see the jars for yourself."
- **State Lines:**
  - (requires #101 Extraordinary Cup) "Taste this — is this what you drew from the jars?" → All three taste it. Tobiah goes pale. "Yes, master. That is exactly what we drew. But we filled them with water. I swear it." *(discovers Bible Fragment #302)*

**Puzzle: Witness Testimony (Wire Lock)**

| ID | Type | UI | Solution |
|----|------|----|----------|
| witness-wires | wire_lock | wire-lock | See below |

Connect each testimony to the correct servant:

**Wires (left):**
- "It came from the water pots" (testimony-water)
- "A woman said, 'Whatever he tells you, do it'" (testimony-woman)
- "We filled them to the brim" (testimony-filled)

**Sockets (right):**
- Tobiah (tobiah)
- Reuben (reuben)
- Amos (amos)

**Solution:** testimony-water → tobiah, testimony-woman → reuben, testimony-filled → amos

**False Outputs:**
- "The servants' stories don't match. Something is off..." (wrong wiring)

**Hints:**
1. "Listen carefully to each servant's words during the conversation. Who said what?"
2. "Tobiah spoke about the water pots first. Reuben mentioned the woman. Amos confirmed they filled the jars."
3. "Connect: 'water pots' → Tobiah, 'woman's instruction' → Reuben, 'filled to the brim' → Amos."

**On solve:** Event #131 — discovers Bible Fragments #301 (John 2:7-8), #302 (John 2:5), #303 (John 2:9). Unlocks The Stone Jars (#140).

**Lore:**

| Label | Card | Type | Title |
|-------|------|------|-------|
| Bible Fragment: John 2:7-8 | #301 | 📜 Lore | "Fill the water pots with water..." |
| Bible Fragment: John 2:5 | #302 | 📜 Lore | "Whatever he says to you, do it." |
| Bible Fragment: John 2:9 | #303 | 📜 Lore | "The servants who had drawn the water knew." |


---

### Room 3: The Stone Jars (Card #140)

> Six massive stone jars stand at the entrance of the courtyard, used for ceremonial purification. Each holds two to three metretes — you calculate 120 to 180 gallons total. You peer into the nearest jar. Dark liquid. You dip a finger and taste. Wine. The same impossible wine. The jars are solid stone — no hidden compartments, no false bottoms. The ground beneath is dry. No pipes, no channels.

**Image:** `assets/stone-jars.png` (contains hidden number **6** in the stone grain pattern of the jars)

**Discoveries:**

| Label | Card | Type | Title |
|-------|------|------|-------|
| Inspect the six stone jars closely | #141 | 🔵 Object | The Six Stone Jars |
| Taste the liquid in the nearest jar | #142 | 🔴 Item | Jar Wine Sample |
| Check the well where water was drawn | #143 | 🔵 Object | The Courtyard Well |
| Examine the ground beneath the jars | #144 | 🔴 Item | Dry Ground Evidence |

**Puzzle: Hidden Element**

| ID | Type | Solution | Auto-hint |
|----|------|----------|-----------|
| hidden-jars | hidden_element | Number **6** hidden in stone grain pattern | After 120s |

**Hints:**
1. "The jars themselves hold a clue. Look at the stone carefully."
2. "Count the jars — but also look for a number hidden in the artwork."
3. "The number 6 is hidden in the stone grain pattern. Look at card #146."

**On solve:** Discovers Item #146 (Jar Count Clue — "Six jars, each holding 20-30 gallons. The volume alone rules out smuggling.")

**Puzzle: Volume Calculation (Keypad Lock)**

| ID | Type | UI | Solution |
|----|------|----|----------|
| jar-volume | code_entry | keypad-lock | 120 |

The servants said they filled the jars "to the brim." Six jars × 20 gallons minimum each = ?

**False Outputs:**
- Entering 180: "That's the maximum. What's the minimum volume that rules out smuggling?"
- Entering 6: "That's the number of jars, not the total volume."

**Hints:**
1. "The Bible says each jar holds two to three metretes. A metrete is about 10 gallons."
2. "Six jars × two metretes minimum × 10 gallons = ?"
3. "6 × 2 × 10 = 120. Enter 120."

**On solve:** Event #149 — "120 gallons minimum. No merchant could smuggle that volume into a wedding unnoticed." Discovers Bible Fragment #304 (John 2:6). Unlocks Joachim's Shop (#160).

**Combinations:**

| Item (Red) | + Object (Blue) | = Result | Type |
|------------|-----------------|----------|------|
| #142 Jar Wine Sample | #143 The Courtyard Well | #148 "You taste the well water. Plain, clean, ordinary. Then the jar wine. Extraordinary. Same source — impossible results." | ✅ Event → discovers Bible Fragment #305 |
| #144 Dry Ground Evidence | #141 The Six Stone Jars | #147 "Solid stone. Dry ground. No mechanism. No trick." | ✅ Event → adds to evidence |

**Trap Combination:**

| Item (Red) | + Object (Blue) | = Result | Type |
|------------|-----------------|----------|------|
| #122 Reuben's Glance | #141 The Six Stone Jars | #145 "Maybe the servants hid wine skins inside the jars before filling them with water? But the volume... and the taste... no. This theory doesn't hold." | ❌ Penalty (30s) |

**Consumes (on #149):** #146

**Lore:**

| Label | Card | Type | Title |
|-------|------|------|-------|
| Bible Fragment: John 2:6 | #304 | 📜 Lore | "Six water pots of stone... containing two or three metretes apiece." |
| Bible Fragment: John 2:9 (source) | #305 | 📜 Lore | "The ruler of the feast... didn't know where it came from." |

---

### Room 4: Joachim's Shop (Card #160)

> A small wine merchant's shop, two streets from the wedding. Old Joachim is closing up for the night. Shelves of clay jars line the walls, each labeled with origin and vintage. The smell of aged oak and grape must fills the air. Joachim squints at you in the lamplight.

**Image:** `assets/joachims-shop.png`

**Discoveries:**

| Label | Card | Type | Title |
|-------|------|------|-------|
| Speak with Joachim the wine merchant | #161 | 🔵 Object | Joachim (NPC) |
| Examine the shop's delivery records | #162 | 🔴 Item | Delivery Records |
| Inspect the wine jars on the shelves | #163 | 🔵 Object | Joachim's Wine Stock |

**NPC: Joachim the Wine Merchant (#161)**

| ID | Type | UI |
|----|------|----|
| npc-joachim | tool | npc-dialog |

**Config:**
- **Name:** Joachim
- **Portrait:** 🧓
- **Greeting:** "Matthias? At this hour? What brings you from the wedding?"
- **Lines:**
  - "The wine you sold for the wedding — was that all of it?" → "Every drop. Three jars of my Galilean red, as agreed. Why?"
  - "Did anyone else purchase wine for this wedding?" → "Not through me. And I am the only merchant in Cana, Matthias. You know this."
  - "Could someone have brought wine from outside? Sepphoris? Capernaum?" → "Wine of that quality? You'd have to go to Jerusalem. Maybe Tyre. And even then..." He pauses. "Why? What happened?"
  - "I tasted wine tonight that I cannot account for." → Joachim laughs. "Then someone is a better merchant than me. But it did not come from Cana, I promise you that."
- **State Lines:**
  - (requires #142 Jar Wine Sample) "Taste this and tell me where it's from." → Joachim's eyes widen. He tastes again. "This is... I have no words. This is not from Galilee. Not from Judea. I have tasted wines from Egypt, Cyprus, Lebanon — this surpasses them all. Where did you get this?" *(discovers Bible Fragment #306)*

**Puzzle: Eliminate the Merchant Theory (Match Lock)**

| ID | Type | UI | Solution |
|----|------|----|----------|
| merchant-eliminate | match_lock | match-lock | See below |

Match each theory to the evidence that disproves it:

**Pairs:**
- "Smuggled wine" ↔ "120+ gallons — impossible to smuggle unnoticed"
- "Second wine order" ↔ "Joachim is the only merchant in Cana"
- "Gift from a wealthy relative" ↔ "The bridegroom didn't know where it came from"
- "Wine from another town" ↔ "No delivery records exist"

**Hints:**
1. "Each wrong theory has a specific piece of evidence that disproves it. Think about what you've learned."
2. "The volume rules out smuggling. Joachim's monopoly rules out a second order. The bridegroom's confusion rules out a gift."
3. "Smuggled → 120 gallons. Second order → only merchant. Gift → bridegroom confused. Other town → no records."

**On solve:** Event #169 — "Every rational explanation eliminated. The wine came from nowhere — or from somewhere beyond your understanding." Discovers Bible Fragment #306. Unlocks The Bride's Family Area (#180).

**Combinations:**

| Item (Red) | + Object (Blue) | = Result | Type |
|------------|-----------------|----------|------|
| #162 Delivery Records | #163 Joachim's Wine Stock | #167 "Three jars of Galilean red. That's all. The records confirm it — no extra wine was delivered." | ✅ Event → adds to evidence |

**Trap Combination:**

| Item (Red) | + Object (Blue) | = Result | Type |
|------------|-----------------|----------|------|
| #162 Delivery Records | #161 Joachim | #165 "You accuse Joachim of hiding a secret delivery. He is deeply offended. 'I have been honest with you for twenty years, Matthias!' You've wasted time on a dead end." | ❌ Penalty (30s) |

**Consumes (on #169):** #162

**Lore:**

| Label | Card | Type | Title |
|-------|------|------|-------|
| Bible Fragment: John 2:3 | #306 | 📜 Lore | "When the wine ran out..." |


---

### Room 5: The Bride's Family Area (Card #180)

> Near the bride's family, you find an older woman — modest in dress but carrying herself with quiet authority. Miriam, from Nazareth. The mother of one of the guests. She looks at you with calm, steady eyes as you approach. Around her, the bride's relatives laugh and celebrate, unaware of your investigation.

**Image:** `assets/brides-family-area.png`

**Discoveries:**

| Label | Card | Type | Title |
|-------|------|------|-------|
| Speak with Miriam | #181 | 🔵 Object | Miriam (NPC) |
| Observe Miriam's quiet confidence | #182 | 🔴 Item | Miriam's Knowing Smile |
| Notice the family connections | #183 | 🔴 Item | Guest List Clue |

**NPC: Miriam (#181)**

| ID | Type | UI |
|----|------|----|
| npc-miriam | tool | npc-dialog |

**Config:**
- **Name:** Miriam
- **Portrait:** 👩
- **Greeting:** "You must be the master of the feast. I could see you were troubled earlier."
- **Lines:**
  - "The servants said a woman told them to obey. Was that you?" → "I did. A mother notices when things go wrong. The servants were worried. The bridegroom's family would have been shamed."
  - "You knew the wine had run out?" → "I did. So I went to my son and told him, 'They have no wine.'"
  - "And he agreed to help?" → A complicated expression crosses her face. "Not at first. He said to me, 'Woman, what does that have to do with you and me? My hour has not yet come.'"
  - "His hour?" → "I did not fully understand it myself. But I have known my son for thirty years. Even when he says the time is not right... compassion moves him."
  - "But what did he actually do?" → *(voice: miriam)* "Matthias. You are a man who arranges things. You are looking for an arrangement — a system, a trick. What if there is no arrangement? What if what the servants told you is simply what happened?"
- **State Lines:**
  - (requires #144 Dry Ground Evidence) "I checked the jars. Solid stone. No trick." → She smiles — a small, private smile. "I told the servants to do whatever he said. And they did. That is all I can tell you, because that is all I did." *(discovers Bible Fragment #309)*
  - (requires #142 Jar Wine Sample) "This wine — do you know what it is?" → "I know what it means. It means my son's time has begun, whether he said it had or not." *(discovers Bible Fragment #308)*

**Puzzle: Miriam's Testimony (Word Lock)**

| ID | Type | UI | Input | Solution |
|----|------|----|-------|----------|
| miriam-word | code_entry | word-lock | 4 letters | WINE |

Miriam told her son about the problem in three words. What was missing at the wedding? "They have no ____."

**Hints:**
1. "Miriam went to her son with a simple statement about what the wedding lacked."
2. "She said, 'They have no ____.' What ran out at the wedding?"
3. "The answer is WINE. 'They have no wine.' (John 2:3)"

**On solve:** Event #191 — Miriam places a hand on your arm. "Go speak to his followers. They are in the eastern corner. They saw everything." Discovers Bible Fragments #307, #308, #309. Unlocks The Eastern Corner (#200).

**Lore:**

| Label | Card | Type | Title |
|-------|------|------|-------|
| Bible Fragment: John 2:1 | #307 | 📜 Lore | "Jesus' mother was there." |
| Bible Fragment: John 2:3 | #308 | 📜 Lore | "Jesus' mother said to him, 'They have no wine.'" |
| Bible Fragment: John 2:4 | #309 | 📜 Lore | "Woman, what does that have to do with you and me? My hour has not yet come." |

---

### Room 6: The Eastern Corner (Card #200)

> A group of men — perhaps a dozen — sit together in the eastern corner of the courtyard. They are not wealthy, not scholars. Fishermen, by the look of their hands. Among them sits a man you cannot quite see clearly in the lamplight — quieter than the rest, listening more than speaking. Simon, the broad-shouldered one, looks up as you approach.

**Image:** `assets/eastern-corner.png`

**Discoveries:**

| Label | Card | Type | Title |
|-------|------|------|-------|
| Speak with Simon and Andrew | #201 | 🔵 Object | Simon & Andrew (NPC) |
| Observe the teacher in the lamplight | #202 | 🔴 Item | Glimpse of the Teacher |
| Notice the wonder on the disciples' faces | #203 | 🔴 Item | Disciples' Awe |

**NPC: Simon & Andrew (#201)**

| ID | Type | UI |
|----|------|----|
| npc-fishermen | tool | npc-dialog |

**Config:**
- **Name:** Simon & Andrew
- **Portrait:** 🧑‍🤝‍🧑
- **Greeting:** Simon speaks up: "We are from Capernaum and Bethsaida. We came with our teacher."
- **Lines:**
  - "Your teacher was invited to this wedding?" → "He was. Along with us."
  - "I'm told he spoke to the servants about the water jars." → Simon and Andrew exchange a look — not fear, but wonder. Andrew: "We saw it. We watched the servants fill the jars from the well. We saw them draw from the jars and bring the cup to you."
  - "He simply told them to fill the jars with water?" → Simon nods slowly. "'Fill the water pots with water.' And then, 'Now draw some out, and take it to the ruler of the feast.' Nothing else."
  - "No powder, no mixture, no trick?" → "Water, master." Simon's voice is steady. "We watched. It was water."
  - "Why do you follow this teacher?" → Andrew, almost to himself: "We left our nets three days ago. We were not sure why. This is the first sign we have seen. And now we believe."
- **State Lines:**
  - (requires #182 Miriam's Knowing Smile) "His mother sent me to you. She believes in him completely." → Simon: "She has known him longest. But tonight, we all saw it. This is the beginning of something." *(discovers Bible Fragment #311)*
  - (requires #123 Water-Stained Hands) "The servants' hands were still wet from the well water." → Andrew: "Because it WAS water when they carried it. The change happened in the jars. We were watching." *(adds to evidence)*

**Puzzle: The First Sign (Sort Lock)**

| ID | Type | UI | Solution |
|----|------|----|----------|
| first-sign | sort_lock | sort-lock | See below |

Order the events of the miracle as the disciples witnessed them:

**Items (shuffled):**
1. "The wine ran out at the wedding"
2. "Miriam told her son, 'They have no wine'"
3. "He said, 'My hour has not yet come'"
4. "Miriam told the servants, 'Do whatever he tells you'"
5. "He told the servants to fill the jars with water"
6. "The servants filled six stone jars to the brim"
7. "He said, 'Draw some out and take it to the ruler'"
8. "Matthias tasted the wine and was astonished"

**Correct order:** 1, 2, 3, 4, 5, 6, 7, 8

**Hints:**
1. "Think about the sequence of events. What happened first — the problem, or the solution?"
2. "The wine ran out → Miriam told her son → He hesitated → She told the servants to obey → He gave instructions → They filled the jars → They drew out wine → You tasted it."
3. "Order: wine ran out, Miriam spoke to son, 'my hour has not yet come', 'do whatever he tells you', fill jars, filled to brim, draw some out, Matthias tasted."

**On solve:** Event #211 — "The disciples' account matches the servants' testimony perfectly. Independent witnesses. The same story." Discovers Bible Fragments #310, #311. Unlocks The Well (#220).

**Lore:**

| Label | Card | Type | Title |
|-------|------|------|-------|
| Bible Fragment: John 2:2 | #310 | 📜 Lore | "Jesus also was invited, with his disciples, to the marriage." |
| Bible Fragment: John 2:11 | #311 | 📜 Lore | "This beginning of his signs Jesus did in Cana of Galilee, and revealed his glory; and his disciples believed in him." |


---

### Room 7: The Well (Card #220)

> The courtyard is thinning. The hour is late. You stand alone by the six stone jars, retracing everything. The well stands nearby — the source of the water that became wine. A stone bench beside the entrance invites you to sit and lay out the evidence like a man arranging a feast table. Stars shine overhead. The last guests stumble home singing.

**Image:** `assets/the-well.png`

**Discoveries:**

| Label | Card | Type | Title |
|-------|------|------|-------|
| Draw water from the well one last time | #221 | 🔴 Item | Well Water (still water) |
| Taste the jar wine one final time | #222 | 🔴 Item | Final Wine Taste |
| Sit on the stone bench and review the evidence | #223 | 🔵 Object | The Evidence Table |

**Puzzle: The Investigation Summary (Timeline Lock)**

| ID | Type | UI | Solution |
|----|------|----|----------|
| investigation-timeline | timeline_lock | timeline-lock | See below |

Arrange Matthias's investigation steps in the order you conducted them, matching each step to its key finding:

**Events (shuffled):**
1. "Tasted the extraordinary wine" — "This is not the wine I approved"
2. "Questioned Ezra the steward" — "He didn't know the source either"
3. "Interviewed the three servants" — "They filled the jars with water"
4. "Examined the six stone jars" — "Solid stone, no mechanism, 120+ gallons"
5. "Visited Joachim the merchant" — "No wine was delivered or purchased"
6. "Spoke with Miriam the mother" — "She told the servants to obey her son"
7. "Met Simon and the disciples" — "They call it the first sign"

**Correct order:** 1, 2, 3, 4, 5, 6, 7

**Hints:**
1. "Retrace your steps through the investigation. Where did you start?"
2. "You tasted the wine, then questioned Ezra, then the servants, then the jars, then the merchant, then Miriam, then the disciples."
3. "Order: wine → Ezra → servants → jars → Joachim → Miriam → Simon & Andrew."

**On solve:** Discovers Item #225 (Complete Evidence Chain) and Bible Fragment #312.

**Final Puzzle: The Conclusion (Word Lock)**

| ID | Type | UI | Input | Solution |
|----|------|----|-------|----------|
| final-conclusion | code_entry | word-lock | 5 letters | WATER |

With all evidence gathered, answer the question: According to every witness — servants, mother, and disciples — what was poured into the six stone jars?

**False Outputs:**
- Entering "WINE": "That's what came OUT of the jars. But what went IN?"
- Entering "FAITH": "A beautiful thought, but the servants filled the jars with something physical."

**Hints:**
1. "Every witness told you the same thing about what went into the jars."
2. "The servants filled the jars from the well. What comes from a well?"
3. "The answer is WATER. 'The water now become wine.' (John 2:9)"

**On solve:** Event #999 — **ENDING**

**Combinations:**

| Item (Red) | + Object (Blue) | = Result | Type |
|------------|-----------------|----------|------|
| #221 Well Water | #222 Final Wine Taste | #224 "Water. Wine. The same jars. The same well. You have eliminated every explanation you know. What remains is the one you don't." | ✅ Event → discovers Bible Fragment #312 (alternate path) |
| #225 Complete Evidence Chain | #223 The Evidence Table | #226 "You lay out every piece of evidence. The testimony is consistent. The physical evidence rules out fraud. What happened tonight was not a trick." | ✅ Event → bonus score |

**Trap Combination:**

| Item (Red) | + Object (Blue) | = Result | Type |
|------------|-----------------|----------|------|
| #203 Disciples' Awe | #223 The Evidence Table | #227 "You wonder if the disciples are simply gullible men, easily impressed. But the servants told the same story independently. And the jars don't lie." | ❌ Penalty (30s) |

**Lore:**

| Label | Card | Type | Title |
|-------|------|------|-------|
| Bible Fragment: John 2:9 (final) | #312 | 📜 Lore | "The water now become wine." |


---

## Dependency Chain (Critical Path)

```
START
  │
  ▼
[The Head Table] (#100)
  │ discover: Extraordinary Cup (#101) + Ezra (#103)
  │ combine: #101 + #103 = Event #109 (Ezra confesses)
  │
  ▼
[The Servants' Corner] (#120)
  │ discover: The Servants (#121)
  │ puzzle: wire-lock (match testimony to servants)
  │ → Event #131 (Servant Testimony confirmed)
  │
  ▼
[The Stone Jars] (#140)
  │ discover: Six Stone Jars (#141), Jar Wine Sample (#142), Well (#143)
  │ puzzle: hidden element (find 6) → keypad-lock (enter 120)
  │ → Event #149 (Jar Examination complete)
  │
  ▼
[Joachim's Shop] (#160)
  │ discover: Joachim (#161), Delivery Records (#162)
  │ puzzle: match-lock (eliminate 4 theories)
  │ → Event #169 (Merchant theory eliminated)
  │
  ▼
[The Bride's Family Area] (#180)
  │ discover: Miriam (#181)
  │ puzzle: word-lock (enter WINE — "They have no ____")
  │ → Event #191 (Miriam's Testimony)
  │
  ▼
[The Eastern Corner] (#200)
  │ discover: Simon & Andrew (#201)
  │ puzzle: sort-lock (order 8 miracle events)
  │ → Event #211 (Disciple Witness confirmed)
  │
  ▼
[The Well] (#220)
  │ discover: Well Water (#221), Final Wine Taste (#222), Evidence Table (#223)
  │ puzzle: timeline-lock (order 7 investigation steps)
  │ → Complete Evidence Chain (#225)
  │ puzzle: word-lock (enter WATER — what went into the jars?)
  │ → Event #999 (ENDING)
  │
  ▼
END
```

### Optional Paths

```
[The Head Table]
  │ combine: #101 Cup + #102 Ledger = Event #108 → Bible Fragment #300 (bonus lore)

[The Stone Jars]
  │ combine: #142 Jar Wine + #143 Well = Event #148 → Bible Fragment #305 (bonus lore)
  │ combine: #144 Dry Ground + #141 Jars = Event #147 (bonus evidence)

[Joachim's Shop]
  │ combine: #162 Records + #163 Stock = Event #167 (bonus evidence)

[The Well]
  │ combine: #221 Water + #222 Wine = Event #224 → Bible Fragment #312 (alternate path)
  │ combine: #225 Evidence + #223 Table = Event #226 (bonus score)
```

### Trap / Penalty Paths

```
[The Stone Jars]
  │ combine: #122 Reuben's Glance + #141 Jars = Penalty #145 (-30s)
  │   "Maybe the servants hid wine skins inside the jars?"

[Joachim's Shop]
  │ combine: #162 Records + #161 Joachim = Penalty #165 (-30s)
  │   "You accuse Joachim of hiding a secret delivery."

[The Well]
  │ combine: #203 Disciples' Awe + #223 Evidence Table = Penalty #227 (-30s)
  │   "You wonder if the disciples are simply gullible."
```


---

## Card Index

| ID | Type | Color | Title | Room | Image |
|----|------|-------|-------|------|-------|
| 100 | location | 🟢 | The Head Table | head-table | head-table.png |
| 101 | item | 🔴 | The Extraordinary Cup | head-table | card-extraordinary-cup.png |
| 102 | object | 🔵 | Wine Ledger | head-table | card-wine-ledger.png |
| 103 | object | 🔵 | Ezra (NPC) | head-table | card-ezra.png |
| 108 | event | 🟡 | "This wine is not on the ledger." | head-table | — |
| 109 | event | 🟡 | Ezra confesses. | head-table | — |
| 120 | location | 🟢 | The Servants' Corner | servants-corner | servants-corner.png |
| 121 | object | 🔵 | The Servants (NPC) | servants-corner | card-servants.png |
| 122 | item | 🔴 | Reuben's Glance | servants-corner | card-reubens-glance.png |
| 123 | item | 🔴 | Water-Stained Hands | servants-corner | card-water-stained-hands.png |
| 131 | event | 🟡 | Servant Testimony confirmed. | servants-corner | — |
| 140 | location | 🟢 | The Stone Jars | stone-jars | stone-jars.png |
| 141 | object | 🔵 | The Six Stone Jars | stone-jars | card-six-jars.png |
| 142 | item | 🔴 | Jar Wine Sample | stone-jars | card-jar-wine-sample.png |
| 143 | object | 🔵 | The Courtyard Well | stone-jars | card-courtyard-well.png |
| 144 | item | 🔴 | Dry Ground Evidence | stone-jars | card-dry-ground.png |
| 145 | penalty | ⚫ | "Hidden wine skins?" — wrong theory | stone-jars | — |
| 146 | item | 🔴 | Jar Count Clue | stone-jars | card-jar-count.png |
| 147 | event | 🟡 | "Solid stone. No mechanism." | stone-jars | — |
| 148 | event | 🟡 | "Water from the well. Wine from the jars." | stone-jars | — |
| 149 | event | 🟡 | Jar Examination complete. | stone-jars | — |
| 160 | location | 🟢 | Joachim's Shop | joachims-shop | joachims-shop.png |
| 161 | object | 🔵 | Joachim (NPC) | joachims-shop | card-joachim.png |
| 162 | item | 🔴 | Delivery Records | joachims-shop | card-delivery-records.png |
| 163 | object | 🔵 | Joachim's Wine Stock | joachims-shop | card-wine-stock.png |
| 165 | penalty | ⚫ | "You accuse Joachim." — wrong theory | joachims-shop | — |
| 167 | event | 🟡 | "Three jars. That's all." | joachims-shop | — |
| 169 | event | 🟡 | Merchant theory eliminated. | joachims-shop | — |
| 180 | location | 🟢 | The Bride's Family Area | brides-family | brides-family-area.png |
| 181 | object | 🔵 | Miriam (NPC) | brides-family | card-miriam.png |
| 182 | item | 🔴 | Miriam's Knowing Smile | brides-family | card-miriams-smile.png |
| 183 | item | 🔴 | Guest List Clue | brides-family | card-guest-list.png |
| 191 | event | 🟡 | Miriam's Testimony. | brides-family | — |
| 200 | location | 🟢 | The Eastern Corner | eastern-corner | eastern-corner.png |
| 201 | object | 🔵 | Simon & Andrew (NPC) | eastern-corner | card-simon-andrew.png |
| 202 | item | 🔴 | Glimpse of the Teacher | eastern-corner | card-glimpse-teacher.png |
| 203 | item | 🔴 | Disciples' Awe | eastern-corner | card-disciples-awe.png |
| 211 | event | 🟡 | Disciple Witness confirmed. | eastern-corner | — |
| 220 | location | 🟢 | The Well | the-well | the-well.png |
| 221 | item | 🔴 | Well Water (still water) | the-well | card-well-water.png |
| 222 | item | 🔴 | Final Wine Taste | the-well | card-final-wine.png |
| 223 | object | 🔵 | The Evidence Table | the-well | card-evidence-table.png |
| 224 | event | 🟡 | "Water. Wine. Same jars." | the-well | — |
| 225 | item | 🔴 | Complete Evidence Chain | the-well | card-evidence-chain.png |
| 226 | event | 🟡 | "The testimony is consistent." | the-well | — |
| 227 | penalty | ⚫ | "Gullible disciples?" — wrong theory | the-well | — |
| 999 | event | 🟡 | Investigation complete. | the-well | — |

### Bible Fragments (Lore Cards)

| ID | Type | Color | Title | Verse | Discovered In |
|----|------|-------|-------|-------|---------------|
| 300 | lore | 📜 | "Everyone serves the good wine first..." | John 2:10 | head-table |
| 301 | lore | 📜 | "Fill the water pots with water..." | John 2:7-8 | servants-corner |
| 302 | lore | 📜 | "Whatever he says to you, do it." | John 2:5 | servants-corner |
| 303 | lore | 📜 | "The servants who had drawn the water knew." | John 2:9 | servants-corner |
| 304 | lore | 📜 | "Six water pots of stone..." | John 2:6 | stone-jars |
| 305 | lore | 📜 | "The ruler of the feast... didn't know where it came from." | John 2:9 | stone-jars |
| 306 | lore | 📜 | "When the wine ran out..." | John 2:3 | joachims-shop |
| 307 | lore | 📜 | "Jesus' mother was there." | John 2:1 | brides-family |
| 308 | lore | 📜 | "They have no wine." | John 2:3 | brides-family |
| 309 | lore | 📜 | "My hour has not yet come." | John 2:4 | brides-family |
| 310 | lore | 📜 | "Jesus also was invited, with his disciples..." | John 2:2 | eastern-corner |
| 311 | lore | 📜 | "This beginning of his signs..." | John 2:11 | eastern-corner |
| 312 | lore | 📜 | "The water now become wine." | John 2:9 | the-well |


---

## Timed Events

| Time Remaining | Event | Effect |
|----------------|-------|--------|
| 25:00 | Start | Intro narrative plays. The Head Table is revealed. |
| 15:00 | Mid-Event | Mid-event narrative plays: "The hour grows late. Guests are leaving." |
| 05:00 | Urgency | matthias: "Dawn approaches. The servants will scatter. I must finish this now." |
| 00:00 | Time Up | Ending (Failure): "The wedding ends. The guests leave. The mystery remains unsolved. But the wine... the wine you will never forget." |

---

## Scoring

| Factor | Value |
|--------|-------|
| Base score | 30 |
| Time bonus | +1 per minute remaining |
| Hint penalty | -2 per hint used |
| Wrong combo penalty | -3 per penalty triggered |
| Lore bonus | +1 per Bible fragment collected (max 13) |

| Stars | Min Score |
|-------|-----------|
| ⭐⭐⭐⭐⭐ | 38 |
| ⭐⭐⭐⭐ | 30 |
| ⭐⭐⭐ | 22 |
| ⭐⭐ | 14 |
| ⭐ | 0 |

**Perfect run:** 30 base + 13 lore + ~10 time bonus = 53 (no hints, no penalties, all fragments)
**Casual run:** 30 base + 7 lore + 5 time - 4 hints - 3 penalty = 35 (4 stars)
