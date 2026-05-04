---
name: puzzle-mechanics
description: Creative puzzle mechanics and design patterns learned from escape room games. Use when designing new episodes or puzzles to create layered, multi-step discovery experiences.
---

# Puzzle Mechanics

Design patterns for creating engaging, layered puzzles. Each mechanic describes a way players discover answers — not through guessing, but through observation, reasoning, and tool use.

The golden rule: **Observe → Decode → Enter**. The answer is never given directly.

## Mechanic: Hidden Numbers in Artwork

A number is subtly embedded in a card's illustration. Player must examine the image carefully to find it.

**Pattern:** Location card has artwork → number hidden in the scene → player enters number → reveals new card.

**Example:** A mural with circuit patterns has "42" woven into the lines. Player spots it, enters 42, gets a Data Fragment card.

**Design tips:**
- Hide numbers in natural scene elements (cracks, wires, shadows, patterns)
- Difficulty scales with how well the number blends into the art
- Use the image-viewer tool to let players zoom in
- Auto-hint after 3 minutes if player is stuck

**Puzzle component:** Hidden element input on location cards + `image-viewer` tool.

---

## Mechanic: Cross-Card Observation

The answer comes from counting or reading details across multiple cards. No single card has the full answer.

**Pattern:** Card A has some objects (3 balloons), Card B has others (12 cars), Card C has more (7 suns) → combine counts → code is 3127.

**Example:** A log file card shows 5 errors. A dashboard card shows instance ID ending in 12. A config card shows port 80. Code: 51280.

**Design tips:**
- Spread clue fragments across 2–4 cards the player already has
- Each fragment should be a visible but non-obvious detail
- The combination method (concatenate, add, multiply) should be hinted in the story
- Works great with the keypad lock or digit lock

**Puzzle component:** `keypad-lock` or `4digits-lock` with answer derived from multiple cards.

---

## Mechanic: Card Combination Discovery

Combining two cards (Red item + Blue object) produces a new card that advances the story.

**Pattern:** Player has Item A and sees Object B → combines them → gets Event card or new Location.

**Example:** "IAM Token" (Red) + "Locked Door" (Blue) → "Door Opens" (Event) → reveals new room.

**Design tips:**
- Make the combination logical (key + lock, tool + machine, fuel + engine)
- Wrong combinations should have in-fiction consequences (penalty + story text)
- Some combinations are non-obvious — reward creative thinking
- Chain combinations: result of combo A is needed for combo B

**Puzzle component:** Engine's built-in combination system (`combinations.json`).

---

## Mechanic: Alignment / Thread Matching

Two cards are aligned (overlaid, placed side by side) and the player identifies which elements connect.

**Pattern:** Card A has lines/threads on one side, Card B has endpoints → align them → select which threads connect → correct selection unlocks.

**Example:** A network diagram card and a routing table card. Align them to see which routes connect to which subnets. Select the valid paths.

**Design tips:**
- Works digitally as a wire-lock where the "wires" come from one card's clues and "sockets" from another
- Can also be a sequence lock where the connected positions form the tap pattern
- The visual alignment creates an "aha!" moment

**Puzzle component:** `wire-lock` with wires/sockets derived from card artwork.

---

## Mechanic: Symbol-to-Code Translation

Player collects symbols/letters from multiple sources and translates them into a numeric code.

**Pattern:** Cards have letters in corners (M, D, C, I, X) → read in chapter order → MDCIX → Roman numeral → 1609.

**Example:** AWS service icons on cards spell out a code. Each icon maps to a number via a reference card. Read in order → enter code.

**Design tips:**
- The translation system (Roman numerals, ASCII, Base64, hex) should be discoverable in-game
- Provide a tool (cipher wheel, binary converter, hex decoder) to help
- The collection order matters — use card sequence or story order
- Multiple valid-looking translations make it harder (decoy symbols)

**Puzzle component:** Tools (`cipher-wheel`, `binary-converter`, `hex-decoder`) + `keypad-lock` or `word-lock`.

---

## Mechanic: Size/Order Sorting

Objects must be arranged by a physical property (size, time, severity) and the resulting sequence reveals a code.

**Pattern:** Sort boxes smallest to biggest → read their numbers in that order → 7, 3, 11 → code 7311.

**Example:** Sort CloudWatch alarms by severity (low → critical). Each alarm has a number. Read in order → enter code.

**Design tips:**
- The sorting criteria should be discoverable from a clue card
- Numbers on the items aren't the sort key — they're the payload
- Works with sort-lock for the ordering, then keypad for the code
- Can also be a timeline-lock where chronological order reveals a sequence

**Puzzle component:** `sort-lock` or `timeline-lock` → `keypad-lock`.

---

## Mechanic: Counting + Concatenation

Player counts specific objects in illustrations and concatenates the counts to form a code.

**Pattern:** "Count the [X] on card A, the [Y] on card B, the [Z] on card C" → concatenate → code.

**Example:** "How many open ports? How many failed logins? How many running instances?" → 3, 12, 7 → code 3127.

**Design tips:**
- Objects to count should be clearly defined but require careful looking
- Mix easy counts (3 balloons) with harder ones (12 cars in a busy scene)
- The prompt telling players WHAT to count can come from a separate clue card
- Avoid ambiguous counts — each object should be clearly countable

**Puzzle component:** `keypad-lock` with answer from observation.

---

## Mechanic: Story Text Encoding

A passage of narrative text contains the answer encoded in its content.

**Pattern:** "5 minutes, 1 nightlight, 25 sheep" → extract numbers → 5125.

**Example:** A system log reads: "Process started at 14:00, allocated 8 cores, consumed 92MB" → code 14892.

**Design tips:**
- The encoding rule (extract all numbers, take first digits, count words) must be hinted
- Works as a fallback/alternative path — if player missed the main puzzle, the story gives them another way
- Can be combined with the frequency analyzer or cipher tools
- Red herrings: include extra numbers that aren't part of the code

**Puzzle component:** `terminal-lock` or `keypad-lock` with answer from narrative.

---

## Mechanic: Color/Pattern Sequence

Player identifies colors or patterns across multiple cards and enters them as a sequence.

**Pattern:** Each card has a colored element → match colors to a reference → colors map to numbers → enter sequence.

**Example:** Three security alerts: one has a blue border (8), one red (6), one yellow (4) → sequence 864.

**Design tips:**
- The color-to-number mapping should come from a separate reference card
- Order matters — define it by card number, story sequence, or spatial position
- Can use the color-lock for matching or sequence-lock for pattern entry
- Colorblind consideration: always pair colors with shapes or labels

**Puzzle component:** `sequence-lock` or `keypad-lock` with color-derived answer.

---

## Mechanic: Multi-Card Assembly

Multiple cards physically form a larger image when arranged correctly. The assembled image reveals a hidden code.

**Pattern:** 4–6 cards tile together → complete picture appears → code visible in the assembled image.

**Example:** 4 network diagram fragments. Arrange them correctly (jigsaw) → the complete diagram shows a hidden IP address.

**Design tips:**
- Each card fragment should be useful on its own (has items, clues) before assembly
- The assembled image reveals something NOT visible on individual cards
- Works digitally as a jigsaw-lock where solving reveals a code for a keypad
- The assembly order can itself be a clue (left-to-right reading)

**Puzzle component:** `jigsaw-lock` → hidden code → `keypad-lock` or `word-lock`.

---

## Mechanic: App Interaction (Digital-Only)

The app/screen has interactive elements (buttons, switches, sliders) that change the scene.

**Pattern:** Press a button → scene changes (blinds open, light turns on) → reveals new information.

**Example:** Toggle a switch on a server rack → dashboard updates → shows a hidden metric value.

**Design tips:**
- Keep interactions simple (tap, toggle, slide)
- The result should be visually satisfying (animation, reveal)
- Can gate access to hidden elements — "raise the blinds" to see the number behind them
- Chain interactions: toggle A reveals clue for toggle B

**Puzzle component:** Custom interactive cards in the engine, or slider/binary locks used as scene controls.

---

## Combining Mechanics

The best puzzles layer 2–3 mechanics together:

1. **Hidden number** (find 42 in mural) → **tool use** (Base64 decode) → **code entry** (word lock)
2. **Cross-card observation** (count objects) → **concatenation** → **keypad lock**
3. **Symbol collection** (letters from cards) → **cipher wheel** (decode) → **word lock**
4. **Card combination** (get telescope) → **hidden number** (see through telescope) → **new area**
5. **Size sorting** (arrange items) → **read sequence** → **keypad lock**
6. **Assembly** (jigsaw cards) → **hidden code in image** → **keypad lock**
7. **Story text** (read narrative) → **extract numbers** → **keypad lock** (fallback path)

Always ensure there's a logical chain the player can follow. Never require a leap of faith.

---

## Mechanic: Animation / Intermittent Reveal

An animated element (blinking lights, flickering neon, moving flames) hides information that's only visible at certain moments.

**Pattern:** Neon sign blinks → some letters switch off → remaining letters form a number or word.

**Example (Circus):** Neon sign reads "DIOSEN" but letters flicker off intermittently, leaving "IO" → number 10.

**Example (AWS):** A dashboard widget refreshes every few seconds. During the refresh flash, a hidden error code is briefly visible.

**Design tips:**
- Use CSS animation to toggle visibility of elements
- The "off" state reveals the hidden message (negative space)
- Can also work with flame trails, scrolling text, or pulsing lights
- Player must watch carefully and may need to pause/screenshot mentally

**Puzzle component:** Custom animated card + `image-viewer` tool or hidden element input.

---

## Mechanic: Card Overlay / Stacking

Place one card on top of another — the combined visual reveals hidden numbers or shapes.

**Pattern:** Card A has partial shapes. Card B has complementary shapes. Overlay them → complete number/image appears.

**Example (Circus):** Place card 68 on top of the ring → numbers 34 and 62 form from the combined artwork. Place card 89 on ring → number 66 appears.

**Example (AWS):** A network diagram card overlaid on a subnet map card → the overlapping regions highlight the correct routing path.

**Design tips:**
- Design cards with transparent/negative space that only makes sense when combined
- The overlay order matters — A on B ≠ B on A
- Digitally: show a "combine view" that merges two card images
- Can reveal multiple numbers from one overlay

**Puzzle component:** `image-viewer` showing merged image, or custom overlay UI.

---

## Mechanic: Card Rotation / Angle Placement

Rotating or angling a card reveals different information depending on orientation.

**Pattern:** Hold card at a right angle or rotate 90° → different numbers visible on each side of the split.

**Example (Circus):** Hold card 76, place saw card at right angle in center → number 8 on one side, number 5 on the other → card 85.

**Example (AWS):** A config file card rotated 180° reveals a mirrored port number.

**Design tips:**
- Design artwork that reads differently at 0° vs 90° vs 180°
- Ambigrams (numbers that read differently upside down: 6↔9, 8↔8)
- Digitally: add a rotate button on the card that shows alternate views
- Combine with overlay for extra complexity

**Puzzle component:** Image viewer with rotation control, or rotation-lock as metaphor.

---

## Mechanic: Negative Space / Distance Viewing

An image that looks like noise up close but reveals a clear number/word when viewed from a distance or squinted at.

**Pattern:** Card has bold stripes/patterns → step back or squint → number forms from the negative space.

**Example (Circus):** Card 36 viewed from a distance, moving it to the right → number 32 becomes visible in the stripe pattern.

**Example (AWS):** A "corrupted data" visualization that, when zoomed out, spells an error code.

**Design tips:**
- Use thick contrasting stripes or blocks that form digits in negative space
- Works great as card artwork — the "zoom out" moment is satisfying
- Digitally: provide a "zoom out" button or pinch-to-zoom on the image viewer
- Can also use stereogram-style patterns

**Puzzle component:** `image-viewer` with zoom controls.

---

## Mechanic: Color-Grouped Object Reading

Objects of the same color, when isolated from the scene, form numbers or letters.

**Pattern:** Scene has mixed-color objects → group by color → each color group forms a digit → combine digits.

**Example (Circus):** Jugglers with colored props — green rings form "2", yellow clubs form "4", pink+purple balls form "61" → 2 + 61 = 63.

**Example (AWS):** A dashboard with colored metrics. Blue dots form "5", red dots form "12", green dots form "3" → code 5123.

**Design tips:**
- Each color group should have enough objects to form a recognizable digit
- The grouping instruction can come from a separate clue card
- Mix 2-3 colors to create a multi-digit code
- Colorblind consideration: use patterns/shapes alongside colors

**Puzzle component:** `image-viewer` + observation → `keypad-lock`.

---

## Mechanic: Path Tracing / Track Following

Follow a path, trail, or movement pattern on a card — the shape it traces forms a letter or number.

**Pattern:** Description says "follow the tracks" → trace the movement → path forms a letter.

**Example (Circus):** "Acrobat monkeys appear on the ring, make a full lap, then go out the same way they came." Tracing their path forms the letter Q.

**Example (AWS):** "Trace the packet route through the VPC" → the path through subnets forms the number 7.

**Design tips:**
- The path should be traceable on the card artwork (dotted lines, footprints, arrows)
- The resulting shape must be a recognizable letter/number
- Can combine with the path-lock component for interactive tracing
- Multiple paths on one card = multiple letters = a word

**Puzzle component:** `path-lock` or observation → `word-lock` / `keypad-lock`.

---

## Mechanic: Sequential Number Following

A card or clue tells you to "call the following number" — the next card number in sequence is the answer.

**Pattern:** Card 18 says "Let's call the following number together" → the number that follows 18 is 19 → take card 19.

**Example (AWS):** A log entry says "next process ID" → current PID is 4071 → next is 4072 → code 4072.

**Design tips:**
- Simple but satisfying when the player catches the wordplay
- "Following" can mean sequential, alphabetical, or logical next
- Can be a red herring if players overthink it
- Works as a quick breather puzzle between harder ones

**Puzzle component:** Observation → card reveal or `keypad-lock`.

---

## Mechanic: Arithmetic Chain

Follow a path through numbered waypoints, applying operations (+, −) at each step to reach a final total.

**Pattern:** Start at value 3 → follow path → +9 +7 −3 +6 −2 +4 = 24.

**Example (Circus):** Poodle starts at 3+, follow numbered notches on the program: 3+9+7−3+6−2+4 = 24.

**Example (AWS):** Trace a request through services. Each service adds or subtracts latency: 10+25+5−3+12 = 49ms → code 49.

**Design tips:**
- The path and operations should be visually clear on the card
- Starting value and operation signs (+/−) are part of the artwork
- Player needs to follow the correct path (wrong path = wrong answer)
- The binary-converter tool can help if operations are in binary

**Puzzle component:** Observation + mental math → `keypad-lock`.

---

## Mechanic: Prerequisite Chain / State Dependency

An action only works if a prior state has been achieved. Doing things out of order fails silently or gives a wrong result.

**Pattern:** You must visit location A before action B works. Combining items only succeeds if you've seen a specific clue first.

**Example (Circus):** Enter machine 17 to find the clown's nose → only works if you first visited machine 17 to see the clown was sad.

**Example (AWS):** You can only decrypt the file after assembling the KMS key. Trying to decrypt first gives a "key not found" false output.

**Design tips:**
- Track state in the engine (visited rooms, solved puzzles, collected items)
- Failed attempts should give in-fiction feedback ("the door won't budge" not "wrong answer")
- Creates natural story pacing — players must explore before solving
- Avoid deep chains (max 2-3 prerequisites) to prevent frustration

**Puzzle component:** Engine state tracking + `falseOutputs` on premature attempts.

---

## Mechanic: App Interaction Sequence

The app has buttons/controls that must be pressed in a specific pattern derived from story clues.

**Pattern:** Clue says "press the flower 3 times and his nose once" → tap flower ×3, nose ×1 → stains form number 58.

**Example (Circus):** Program says the clown's specialty is "flower 3 times, nose once" → press in app → reveals 58.

**Example (AWS):** A runbook says "restart the service, then check logs twice, then clear the cache" → tap buttons in that order.

**Design tips:**
- The sequence instruction comes from a separate clue (program, manual, note)
- The app interaction should have visual feedback (animations, sounds)
- Wrong sequences can trigger penalty events
- Combine with the defuse-lock for timed sequences

**Puzzle component:** `sequence-lock` (blind mode) or custom button UI.

---

## Mechanic: Menu/List Selection

An in-app menu or list where the player must choose the correct option based on story context.

**Pattern:** Machine shows a list of options → story context tells you which to pick → correct choice advances.

**Example (Circus):** Balloon machine asks "What shape for your balloon?" with options (dog, mouse, giraffe, bear) → story says elephant is scared of mice → pick mouse.

**Example (AWS):** A service configuration screen: pick the right instance type based on workload requirements described in a clue card.

**Design tips:**
- The correct answer should be deducible from story clues, not guessable
- Include plausible wrong options that make sense without the clue
- Wrong choices can trigger false outputs or penalties
- Can be implemented as a simple dropdown or the DNS-lock style chain

**Puzzle component:** `dns-lock` (dropdown chain) or custom selection UI.

---

## Mechanic: Multi-Card Scoring System

A reference card defines a scoring system. Player applies it to another card to calculate a total.

**Pattern:** Reference card: bullseye=5, white ring=1, green=2, cyan=3, red=4. Target card has hits → calculate score → enter total.

**Example (Circus):** Knife thrower's target: reference shows ring values. Card 91 has hits at positions → 1+1+3+5+2 = 12.

**Example (AWS):** A cost reference card shows per-service pricing. A usage card shows consumption → calculate total cost → enter in cost-lock.

**Design tips:**
- The scoring reference and the scored object should be on different cards
- Forces players to cross-reference carefully
- Can scale difficulty by adding more scoring categories
- Works naturally with the cost-lock component

**Puzzle component:** Observation + calculation → `keypad-lock` or `cost-lock`.

---

---

## Mechanic: Directory / Database Lookup

A reference card acts as a searchable directory. Player reads a name from one card, looks it up in the directory, and gets an address/number that becomes the next card.

**Pattern:** Clue card mentions a name → look up name in the directory card → directory gives a number → take that card.

**Example (Sherlock):** Letter says "purchase a map at Smith & Sons" → look up "Smith & Sons" in the London Directory (card 35) → get card 38. Repeat for "Lamford" → get card 93.

**Example (AWS):** A log mentions service name "CloudFront" → look it up in the AWS Glossary tool → glossary shows it's a CDN on port 443 → use 443 in the security group lock.

**Design tips:**
- The directory card should have many entries (10+) so it's not trivially scannable
- The lookup keyword must come from a separate clue — never from the directory itself
- Multiple lookups through the same directory across the scenario creates familiarity
- Digitally: the `aws-glossary` tool or a custom searchable list

**Puzzle component:** `aws-glossary` tool or custom searchable reference + card reveal.

---

## Mechanic: Coin / Object Classification + Counting

Objects scattered across multiple cards must first be classified by type, then counted per type to form a code.

**Pattern:** Cards show various objects → identify types using a reference → count each type → concatenate counts → code.

**Example (Sherlock):** Coins on cards 9, 35, B → classify as groats, shillings, pennies, farthings → count: 1 shilling, 1 groat, 2 pennies, 3 farthings → code 1123.

**Example (AWS):** Resources across cards: identify as EC2 (3), S3 buckets (1), Lambda functions (4), RDS instances (2) → code 3142.

**Design tips:**
- The classification reference (what's a groat vs a penny) should be on a separate card
- Objects should look similar enough that classification requires careful study
- Order of the digits in the code should follow a defined rule (alphabetical, size, etc.)
- Cross-card counting forces players to revisit earlier cards

**Puzzle component:** Observation + classification → `keypad-lock`.

---

## Mechanic: Multi-Criteria Suspect Elimination

Multiple clues each eliminate some options from a set. Only one option satisfies ALL criteria.

**Pattern:** 4 suspects shown → Clue A: "long black hair" (eliminates 2) → Clue B: "wears lipstick" (eliminates 1 more) → Clue C: "is tall" (confirms the answer).

**Example (Sherlock):** 4 suspects. Card 77: long black hair. Card 60: wears lipstick. Card 24: is tall. Only suspect #3 matches all three → select in machine.

**Example (AWS):** 4 instance types shown. Clue A: "needs GPU" → eliminates t3, m5. Clue B: "under $2/hr" → eliminates p4d. Clue C: "at least 16GB RAM" → confirms g4dn.xlarge.

**Design tips:**
- Each clue should eliminate at least one option but not uniquely identify the answer alone
- Clues come from different cards discovered at different times
- The elimination process should feel like detective reasoning
- Show all options visually so the player can cross-reference
- Works great with the match-lock or a custom selection UI

**Puzzle component:** Custom selection machine or `dns-lock` style dropdown.

---

## Mechanic: Card Flip / Hidden Back

Cards have information on their back that's only relevant when a clue tells you to flip them.

**Pattern:** Cards are face-up during play → a clue says "flip the cards over" → backs reveal hidden numbers/symbols.

**Example (Sherlock):** Carriage cards 97, 35, 14 → flip them over → each has a circled number on the back: 25, 33, 29.

**Example (AWS):** Resource cards show the service name on front → flip reveals the ARN or config detail needed for a policy lock.

**Design tips:**
- Players naturally ignore card backs — the "flip" instruction is the aha moment
- Back-side info should be subtle (small, grey, in a corner) to reward careful looking
- The trigger to flip must come from a separate clue or puzzle result
- Digitally: a "flip" button on cards, or a second view revealed after a condition is met

**Puzzle component:** Engine card property `has_back: true` + flip interaction.

---

## Mechanic: Route Tracing on Map

Plot a character's movements on a map. The path drawn forms a number or letter.

**Pattern:** Card describes a route (home → church → work) → trace on map card → the drawn path forms a digit.

**Example (Sherlock):** Suspect 1: south Linus St → St Peter's Church → doctor's surgery. Traced on map → path forms "7". Suspect 2's path forms "41". Suspect 3's path forms "6". Code: 7416.

**Example (AWS):** Trace a packet's route: IGW → public subnet → NAT → private subnet → RDS. The path on the VPC diagram forms "3".

**Design tips:**
- The map must be detailed enough that the route is unambiguous
- Each route should form a clearly recognizable digit/letter
- Multiple routes on the same map = multiple digits = a code
- The route description comes from a separate card (not the map itself)
- This is the most satisfying mechanic when it clicks — the "I see it!" moment

**Puzzle component:** `path-lock` for interactive tracing, or `image-viewer` + observation → `keypad-lock`.

---

## Mechanic: Deductive Elimination by Evidence

Physical evidence on cards (mud, wheel tracks, clean legs) eliminates options through logical reasoning.

**Pattern:** Multiple options shown → examine evidence card → rule out options one by one based on physical details.

**Example (Sherlock):** 3 carriages. Street is muddy (card 14). Carriage 25: horse legs are spotless → can't have been on muddy street → eliminated. Carriage 29: smooth wheels but tracks show notches → eliminated. Carriage 33 is the answer.

**Example (AWS):** 3 possible root causes for an outage. Log shows no DNS errors → eliminates Route 53. Metrics show normal CPU → eliminates EC2. Only remaining: security group misconfiguration.

**Design tips:**
- Each piece of evidence should clearly eliminate exactly one option
- The evidence and the options should be on different cards
- The reasoning should feel logical, not arbitrary
- Present it as "what DOESN'T match" rather than "what matches"
- Works well with the log-lock for selecting the right evidence

**Puzzle component:** `log-lock` for evidence selection, or custom elimination UI.

---

## Mechanic: Chronological Card Alignment

Arrange story event cards in chronological order. When aligned, highlighted elements across cards form a code.

**Pattern:** 4 event cards → arrange by timeline → red numbers on each card, read left to right → code.

**Example (Sherlock):** Cards 92 (murder), 30 (conviction), U (alibi), 70 (revenge) in chronological order → red numbers: 1, 1, 5, 2 → code 1152.

**Example (AWS):** Incident cards: alarm (1), investigation (4), fix deployed (0), all clear (3) → code 1403.

**Design tips:**
- The chronological order must be deducible from card content (dates, "before/after" language)
- The code elements (colored numbers, symbols) should be subtle — not the main content
- Wrong order = wrong code, no partial credit
- Combines timeline-lock ordering with hidden element reading

**Puzzle component:** `timeline-lock` for ordering → read code from aligned cards → `keypad-lock`.

---

## Mechanic: Symbol Pattern Recognition

A recurring symbol across cards marks important information. Player must recognize the pattern and act on it.

**Pattern:** A specific symbol (gang tattoo, circus logo, AWS icon) appears on certain cards → finding all instances reveals a connection or unlocks a combination.

**Example (Sherlock):** Gang symbols on tattoo → look for same symbols across evidence cards → combine tattoo card + symbol file → reveals gang identity.

**Example (AWS):** A specific error icon appears on 3 different log cards → combining those 3 card numbers reveals the fix.

**Design tips:**
- The symbol should be introduced early but its significance revealed later
- Scatter it across 3-5 cards so finding all instances requires thorough exploration
- The "collect them all" moment should trigger a combination or code entry
- Can be combined with the card combination mechanic

**Puzzle component:** Observation → card combination or `keypad-lock`.

---

## Mechanic: Narrative Connection / Inference

Two separate pieces of story information, when connected by the player's reasoning, unlock a new card combination.

**Pattern:** Card A reveals fact X. Card B reveals fact Y. Player realizes X + Y implies Z → combines the relevant cards.

**Example (Sherlock):** Card 19: Elisabeth Lally's death. Card 58: Viper Gang's activities. Player connects: the gang murdered her → combine cards 82 + 30 = 98 (the revelation).

**Example (AWS):** Card shows "data encrypted at rest." Another card shows "KMS key deleted." Player infers: data is unrecoverable → combine evidence cards to unlock the incident report.

**Design tips:**
- Neither card alone suggests the combination — the player must make the logical leap
- The inference should be supported by enough context that it's fair, not a guess
- This is the highest-satisfaction mechanic — pure detective reasoning
- Provide a hint path for players who don't make the connection

**Puzzle component:** Engine combination system with story-driven discovery.

---

---

## Mechanic: Reverse Combination Deduction

The result card number is known, but the input cards are not. Player works backwards to figure out which two cards to combine.

**Pattern:** Card 3 exists as a combo result. It's Blue + Red. Only way to get 3: card 2 (Blue) + card 1 (Red). Deduce the inputs.

**Example (ATW):** Banana is card 3. It's a Blue+Red combination. 2+1=3, so take cards 2 and 1 to peel the banana.

**Example (AWS):** A decrypted message is card 47. It's an Item+Object combo. Player must figure out which key (Red) + which lock (Blue) produces 47.

**Design tips:**
- The result card should be visible or referenced before the player has the inputs
- Multiple possible additions exist — only one pair is valid (both cards must exist and be correct types)
- Creates a satisfying "reverse engineering" moment
- Can be hinted by card type colors (Red + Blue = result)

**Puzzle component:** Engine combination system, used in reverse by the player.

---

## Mechanic: Deck Edge / Physical Manipulation

The physical arrangement or edge of stacked cards reveals information. Cutting, flipping, or rearranging the stack changes what's visible.

**Pattern:** Letter "D" on deck edge → cut deck, reverse halves → D becomes K.

**Example (ATW):** Letter D written on card edges when stacked. Cut the deck, flip the bottom half on top → the letter transforms into K.

**Example (AWS):** Stack 4 config cards in order → their edges form a barcode or number. Reorder them → different number appears.

**Design tips:**
- Digitally: simulate with a "stack view" that shows card edges aligned
- The transformation (cut, flip, rotate) should be hinted by a clue
- Works as a visual puzzle in the image viewer
- The before/after should produce clearly different letters or numbers

**Puzzle component:** `image-viewer` with stack simulation, or `jigsaw-lock` for reordering.

---

## Mechanic: Date / Time Arithmetic

Player calculates a date or time by adding/subtracting from a known reference point.

**Pattern:** Left London on Day 1 (Oct 2). Arrived Suez on Day 8. Calculate: Oct 2 + 7 days = Oct 9, 1872. Enter the date.

**Example (ATW):** Newspaper says departure Oct 2, 1872. Travel diary says Suez is Day 8. Oct 2 + 7 = Oct 9. Set the stamp to that date.

**Example (AWS):** CloudTrail log shows deployment at 14:00 UTC. Incident report says failure occurred 3h 27m later. Calculate: 17:27 UTC → enter as code 1727.

**Design tips:**
- Provide the reference date/time on one card and the offset on another
- The calculation should be simple enough to do mentally (no leap year tricks)
- The answer format (date, time, day number) should be clearly specified
- Can use the slider-lock for setting date components

**Puzzle component:** `keypad-lock` or `slider-lock` for date/time entry.

---

## Mechanic: Signal / Flag Code Translation

Visual symbols (flags, semaphore, signal lights) must be decoded using a reference chart found elsewhere.

**Pattern:** Flags on a ship → look up in maritime code reference → each flag = a number or letter.

**Example (ATW):** Two flags on ship masts. Travel diary has maritime code chart. Flags correspond to 1 and 4 → card 14.

**Example (AWS):** Status lights on a server rack: green-red-green-yellow. Reference card maps colors to binary: G=1, R=0, Y=1 → 1011 → use binary converter → 11.

**Design tips:**
- The reference chart and the signals should be on different cards
- Include extra symbols in the reference that aren't used (decoys)
- The translation system can be any code: maritime flags, Morse, semaphore, binary
- Tools (binary converter, cipher wheel) can assist the translation

**Puzzle component:** Reference card + observation → tools → `keypad-lock` or `word-lock`.

---

## Mechanic: Photo / Fragment Map Transposition

Multiple image fragments, when placed at correct positions on a map or grid, form a letter or number from their arrangement pattern.

**Pattern:** 4 travel photos → place each at the location where it was taken on the map → the positions of the photos form the letter M.

**Example (ATW):** Jungle photos numbered 1-4 in diary. Transpose to map locations → arrangement traces the letter M → take card M.

**Example (AWS):** 5 incident reports, each from a different AZ. Plot them on the region map → their positions form the number 3.

**Design tips:**
- Each fragment must have a clear "where it belongs" indicator (location name, coordinates)
- The resulting letter/number should be recognizable from the placement pattern
- Works digitally as a drag-onto-grid puzzle
- The map should have enough landmarks that placement is unambiguous

**Puzzle component:** `arch-lock` (drag to zones) or `path-lock` + observation.

---

## Mechanic: Phonetic / Linguistic Puzzle

A word or number is disguised by a language transformation. Player must strip or apply a linguistic rule to decode it.

**Pattern:** Mantra with "-KA" suffix on each syllable: "SE-KA VEN-KA TY-KA TWO-KA" → strip -KA → "SEVENTY-TWO" → 72.

**Example (ATW):** Guide says "Ka" sound is added to honor Kali. Mantra in the temple: SE-VEN-TY-TWO with -KA suffixes. Remove them → 72.

**Example (AWS):** An encoded error message where every other syllable is noise: "ER-bip-ROR-bip CO-bip-DE-bip" → strip "bip" → "ERROR CODE".

**Design tips:**
- The linguistic rule must be explained somewhere in the story (a clue card, NPC dialogue)
- The encoded text should be clearly presented (syllable breaks help)
- The transformation should be simple: add/remove prefix/suffix, reverse, substitute
- Can combine with the cipher wheel tool for more complex transformations

**Puzzle component:** Observation + mental decoding → `keypad-lock` or `word-lock`.

---

## Combining Mechanics (Extended)

Layer 2–3 mechanics for richer puzzles:

1. **Hidden number** (find 42 in mural) → **tool use** (Base64 decode) → **code entry** (word lock)
2. **Cross-card observation** (count objects) → **concatenation** → **keypad lock**
3. **Symbol collection** (letters from cards) → **cipher wheel** (decode) → **word lock**
4. **Card combination** (get telescope) → **hidden number** (see through telescope) → **new area**
5. **Size sorting** (arrange items) → **read sequence** → **keypad lock**
6. **Assembly** (jigsaw cards) → **hidden code in image** → **keypad lock**
7. **Story text** (read narrative) → **extract numbers** → **keypad lock** (fallback path)
8. **Animation reveal** (flickering sign) → **negative space reading** → **card number**
9. **Card overlay** (stack two cards) → **hidden numbers appear** → **new cards**
10. **Color grouping** (isolate by color) → **digit formation** → **arithmetic** → **code entry**
11. **Prerequisite chain** (visit A first) → **card combination** (now works) → **new item**
12. **Path tracing** (follow tracks) → **letter formation** → **word lock**
13. **Scoring system** (reference + target) → **calculation** → **keypad lock**
14. **Directory lookup** (name from clue) → **search reference** → **card number** → **new location**
15. **Object classification** (identify types) → **count per type** → **concatenate** → **keypad lock**
16. **Multi-criteria elimination** (clue A + B + C) → **single match** → **selection**
17. **Card flip** (trigger from clue) → **hidden back info** → **new cards or code**
18. **Route tracing on map** (plot movements) → **path forms digit** → **keypad lock**
19. **Evidence elimination** (physical details) → **rule out options** → **identify answer**
20. **Chronological alignment** (order events) → **read highlighted elements** → **code**
21. **Narrative inference** (connect two facts) → **card combination** → **revelation**
22. **Cross-image object matching** (spot same object in two scenes) → **positional reading** → **code**
23. **Compass navigation** (directional codes on map) → **trace path** → **destination**
24. **Template overlay on map** (physical cutout on map) → **revealed location**
25. **Distance radius elimination** (known distance + map) → **eliminate by game state** → **destination**
26. **Connection graph intersection** (count links from multiple nodes) → **unique match** → **destination**
27. **Word-as-directional-acronym** (city name = compass initials) → **trace on map** → **hidden number**
28. **Scientific reference mapping** (elements → plot on reference) → **positions form digit** → **code**
29. **Color filter reveal** (slide colored overlay) → **hidden info appears** → **code**
30. **Pattern sequence completion** (identify repetition/symmetry rule) → **fill missing link** → **code**
31. **Device shake gesture** (physical phone shake) → **triggers in-app action**
32. **Area coverage reading** (place components covering regions) → **shapes form digits** → **code**
33. **Molecular overlay** (superimpose two structures) → **matching elements** → **number at intersection**


Always ensure there's a logical chain the player can follow. Never require a leap of faith.


---

## Mechanic: Cross-Image Object Matching

An identical object appears in two different scenes. Its position or context in one scene provides the code for the other.

**Pattern:** Object on card A matches object in card B's scene → the object's position/arrangement in scene B encodes the answer.

**Example (Pandemic):** A majestic cup sits on a safe. The same cup appears at an archaeological site. The cup's placement at the site shows coordinate order (yellow then purple) → code 1016.

**Example (AWS):** A specific icon on a dashboard matches an icon in an architecture diagram. The icon's position in the diagram (subnet 3, AZ-b) gives the answer.

**Design tips:**
- The matching object should be distinctive enough to recognize across scenes
- The object itself isn't the answer — its *context* in the second scene is
- Forces players to carefully compare two cards side by side
- The "I've seen that before!" moment is the trigger

**Puzzle component:** Observation across cards → `keypad-lock`.

---

## Mechanic: Compass Navigation on Map

Coded directional instructions (N/S/E/W + step counts) are traced on a map to reach a destination.

**Pattern:** Letter codes: W=West, S=South, E=East, N=North. Numbers = grid steps. Start from a known city → follow directions → arrive at destination.

**Example (Pandemic):** From London: 4W, 16S, 20E, 3N, 8E, 3N, 1W → trace on Quarantine Map → arrive at Hong Kong.

**Example (AWS):** Navigate a VPC subnet grid: 2E (cross 2 subnets east), 1S (down to private tier), 3E → reach the database instance.

**Design tips:**
- The map grid must be clearly defined with consistent spacing
- Starting point must be unambiguous
- Direction codes can come from a separate clue card (letter, note, log)
- Wrong starting point or miscounting leads to wrong destination (self-checking)

**Puzzle component:** `path-lock` for interactive tracing, or observation → map navigation in engine.

---

## Mechanic: Template Overlay on Map

A physical cutout or shaped piece of paper is placed on a map. The holes/shapes in the template reveal specific locations.

**Pattern:** Find a crumpled paper → place it on the map at the correct starting position → holes align with a city → that's the destination.

**Example (Pandemic):** Crumpled paper from hotel room → place on map starting at Hong Kong → holes reveal Miami as next stopover.

**Example (AWS):** A "subnet mask" card with cutouts → overlay on a network diagram → visible IPs through the holes are the allowed addresses.

**Design tips:**
- The template must have a clear anchor point (starting city, corner alignment)
- Digitally: show the overlay as a semi-transparent layer the player can drag
- The template can be found as a clue item earlier in the scenario
- Multiple valid placements = multiple answers (use game state to disambiguate)

**Puzzle component:** `image-viewer` with overlay mode, or `jigsaw-lock` for placement.

---

## Mechanic: Distance Radius Elimination

A known distance is used as a radius on a map. Multiple cities fall on the circle — game state eliminates all but one.

**Pattern:** Know the flight distance → draw circle from origin → 2+ cities at that distance → eliminate contaminated/closed ones → one remains.

**Example (Pandemic):** Flight distance from card 15 → transfer to map from Miami → Istanbul and Khartoum both at that distance → Khartoum's airport is closed (contaminated) → answer is Istanbul.

**Example (AWS):** Latency measurement of 50ms → check which regions are ~50ms from us-east-1 → eu-west-1 and sa-east-1 → sa-east-1 is in maintenance → answer is eu-west-1.

**Design tips:**
- The distance/radius must come from a separate card or puzzle result
- At least 2 candidates must fall on the circle to require elimination
- The elimination criteria should be established earlier in the story (not arbitrary)
- Creates a satisfying two-step deduction: geometry + logic

**Puzzle component:** Observation + game state reasoning → map navigation or `dns-lock`.

---

## Mechanic: Connection Graph Intersection

A node in a network is identified by its unique combination of connections to known nodes.

**Pattern:** Target city has exactly N connections from city A, M from city B, P from city C → only one city satisfies all three → that's the answer.

**Example (Pandemic):** Radar shows Cook is in a city with 3 connections from Atlanta, 2 from Khartoum, 3 from Delhi. Only Essen matches all three.

**Example (AWS):** A service has 2 dependencies on compute services, 1 on storage, and 3 on networking. Only ECS matches that dependency profile.

**Design tips:**
- The connection counts must come from a visual (radar, network diagram, dependency graph)
- Multiple nodes should partially match (2 of 3 criteria) to create false leads
- The graph should be provided on a separate card from the clue
- Works naturally with architecture diagrams and network topologies

**Puzzle component:** `arch-lock` for visual graph reasoning, or observation → `dns-lock`.

---

## Mechanic: Word-as-Directional-Acronym

A word (often a place name) is reinterpreted as directional initials, turning it into a navigation sequence.

**Pattern:** City name "ESSEN" → E(ast)/S(outh)/S(outh)/E(ast)/N(orth) → follow on map → find hidden element.

**Example (Pandemic):** Note says "ESSEN is the route to follow." ESSEN = East, South, South, East, North. From Essen on the map, follow those directions → find hidden +39.

**Example (AWS):** Service name "SENSE" → S(outh)/E(ast)/N(orth)/S(outh)/E(ast) → trace on region map → hidden endpoint.

**Design tips:**
- The word must consist entirely of valid direction letters (N, S, E, W)
- A clue must hint that the word should be read as directions ("this is also the route")
- The starting point for navigation must be clear (often the word itself is a location)
- Extremely satisfying "double meaning" moment when the player gets it

**Puzzle component:** Observation + wordplay → map tracing → hidden number → `keypad-lock`.

---

## Mechanic: Scientific Reference Mapping

Elements or data points are plotted onto a scientific reference (periodic table, star chart, DNA codon table) and their positions form digits.

**Pattern:** Chemical elements from analysis → find on periodic table → their positions trace a number.

**Example (Pandemic):** Molecule 1: H, K, Ti, Rf → plot on periodic table → positions form "4". Molecule 2: C, F, Br, Fl, Ts → positions form "2". Code: 42.

**Example (AWS):** Service metrics mapped to a performance chart → plotted points form the number 7 → enter code.

**Design tips:**
- The reference chart (periodic table, ASCII table, etc.) should be provided as a card or tool
- Elements/data points come from a separate analysis or clue card
- The "positions form a digit" requires the player to step back and see the pattern
- Combines scientific knowledge with visual pattern recognition

**Puzzle component:** Reference card + observation → `keypad-lock`.

---

## Mechanic: Color Filter Reveal

A colored overlay or filter is applied to an image, revealing hidden information invisible without it.

**Pattern:** Image has hidden data encoded in a specific color channel → apply colored filter (slide colored object across screen) → hidden number/text appears.

**Example (Pandemic):** Red variant DNA sample under microscope → use colored cube as "infrared filter" → slide across screen → DNA fragments reveal number 4.

**Example (AWS):** A "encrypted" dashboard → apply the decryption key (colored overlay) → hidden metrics become visible.

**Design tips:**
- Digitally: implement as a draggable colored overlay that changes blend mode
- The hidden info should be completely invisible without the filter (not just hard to see)
- The filter object should be found/earned earlier in the scenario
- Can use CSS mix-blend-mode or canvas compositing for the effect

**Puzzle component:** Custom filter UI in `image-viewer`, or `color-lock` as metaphor.

---

## Mechanic: Pattern Sequence Completion

A repeating or symmetrical pattern has a missing element. Player identifies the pattern rule and fills in the gap.

**Pattern:** Sequence follows a rule (3-part repetition, 4-part repetition, symmetry) → one element is missing → deduce and enter it.

**Example (Pandemic):** DNA bases: Base 1 is a 3-part repeating pattern → missing link has polka dot texture → proteins T, G, T → enter "TGT". Base 2 is 4-part repetition → missing is plain → "AAA". Base 3 is symmetrical around center → missing has bias stripe → "GCT".

**Example (AWS):** A cron schedule pattern: "0 */2 * * *", "0 */4 * * *", "? */? * * *" → pattern doubles → answer is "0 */8 * * *".

**Design tips:**
- Each pattern should use a different rule to keep it fresh
- Visual cues (textures, colors, shapes) help identify which element is missing
- The pattern rule should be discoverable, not require domain expertise
- Multiple patterns in sequence creates escalating difficulty

**Puzzle component:** `word-lock` or `terminal-lock` for entering the completed pattern.

---

## Mechanic: Device Physical Gesture

A physical action with the device (shake, tilt, flip) triggers an in-app event.

**Pattern:** Story says "shake the test tube" → player physically shakes their phone → app detects motion → action completes.

**Example (Pandemic):** Mix red and blue cures in a test tube → "shake your device" → accelerometer detects shake → purple solution created → take card 90.

**Example (AWS):** "Reboot the server" → shake device → server restart animation plays → new state revealed.

**Design tips:**
- Use the DeviceMotion API for shake detection
- Always provide a fallback button for desktop/accessibility ("tap to shake")
- The gesture should match the in-fiction action (shake = mix, tilt = pour, flip = turn over)
- Provide clear instruction text and visual feedback during the gesture
- Keep the threshold low enough that gentle shaking works

**Puzzle component:** Custom gesture handler in engine, with button fallback.

---

## Mechanic: Area Coverage Reading

Physical or digital components are placed to cover regions on a map. The shapes formed by the covered areas reveal numbers.

**Pattern:** Place game pieces on continents → pieces cover areas between city connections → each color/variant's coverage forms a digit → concatenate → code.

**Example (Pandemic):** Place cure components on each continent covering connection areas. Yellow coverage forms "5", blue forms "2", red forms "8" → code 528.

**Example (AWS):** Place service icons across region map covering AZs. The covered pattern for compute forms "3", storage forms "1", networking forms "7" → code 317.

**Design tips:**
- The components must have specific shapes that only fit certain areas
- The "digit in the coverage" should be visible when stepping back
- Digitally: drag-and-drop pieces onto a map, with snap-to-region
- Each color/category produces one digit — order should be defined by a clue

**Puzzle component:** `arch-lock` with drag-to-zone, or `jigsaw-lock` on a map background.

---

## Mechanic: Molecular / Structural Overlay

Two structural diagrams (molecules, architectures, circuits) are superimposed. Matching elements between them highlight a specific feature that encodes the answer.

**Pattern:** Diagram A + Diagram B → overlay → communal structure highlighted → specific node/atom at intersection → forms a number.

**Example (Pandemic):** White powder molecules + Cook's blood molecules → superimpose → match communal molecular structure (purple) + oxygen atom (O) → combined molecules form number 68.

**Example (AWS):** Two architecture diagrams from different teams → overlay → shared services highlighted → the shared service IDs form the integration code.

**Design tips:**
- Both diagrams should look complex individually but simplify when overlaid
- The "matching" elements should be visually distinct (color, shape)
- The non-matching elements fade away or become noise
- Digitally: toggle between individual and overlay views

**Puzzle component:** `image-viewer` with overlay toggle, or `match-lock` for pairing elements.