---
name: puzzle-components
description: Guide for using and creating puzzle lock components in app/puzzle/. Use when adding puzzles to scenarios or building new lock types.
---

# Puzzle Components

Self-contained puzzle lock components in `app/puzzle/`. Each is a single JS file with no dependencies, uses CSS variables from the main app theme, and injects its own styles.

## Generic Locks

### 4-Digit Lock (`4digits-lock.js`)
Rolling drum reels, vertical scroll, 4 digits 0–9.
```js
new DigitLock(el, { onSubmit(code) { } });
```

### Word Lock (`word-lock.js`)
Rolling reels for 3–6 letter words. Correct letter + 5 random decoys per reel.
```js
new WordLock(el, { answer: 'SHOUT', onSubmit(word, correct) { } });
```

### Wire Lock (`wire-lock.js`)
Drag wires to sockets, "Power On" to test. Decoy wires/sockets, custom labels both sides.
```js
new WireLock(el, {
  wires: [{ id: 'vpc', color: '#22c55e', label: 'VPC' }],
  sockets: [{ id: 'net', label: 'Network' }],
  solution: { vpc: 'net' },
  falseOutputs: [...], onSubmit() { }, onWrong(msg) { }
});
```

### Sequence Lock (`sequence-lock.js`)
3×3 grid tap pattern. Modes: `flash` (Simon Says) or `blind` (no hint).
```js
new SequenceLock(el, { sequence: [0,4,8], mode: 'flash', onSubmit() { } });
```

### Slider Lock (`slider-lock.js`)
Horizontal sliders with snap-to-step. "Activate" tests all.
```js
new SliderLock(el, {
  sliders: [{ label: 'Freq', min: 0, max: 100, step: 1, answer: 42 }],
  revealCorrect: true, falseOutputs: [...], onSubmit() { }, onWrong(msg) { }
});
```

### Rotation Lock (`rotation-lock.js`)
Circular dials with symbols, drag to rotate, snap to positions.
```js
new RotationLock(el, {
  dials: [{ symbols: ['▲','■','●'], answer: 2 }],
  revealCorrect: true, falseOutputs: [...], onSubmit() { }, onWrong(msg) { }
});
```

### Binary Lock (`binary-lock.js`)
8 toggle switches with live decimal readout and bit labels.
```js
new BinaryLock(el, {
  answer: '10110001', showDecimal: true,
  revealCorrect: false, falseOutputs: [...], onSubmit() { }, onWrong(msg) { }
});
```

### Jigsaw Lock (`jigsaw-lock.js`)
Scrambled tile grid. Tap two to swap.
```js
new JigsawLock(el, {
  cols: 3, rows: 3, tiles: ['1','2','3','4','5','6','7','8','9'],
  revealCorrect: true, onSubmit() { }
});
```

### Morse Lock (`morse-lock.js`)
Tap button: short = dot, long = dash. Auto-commits after pause.
```js
new MorseLock(el, { answer: 'SOS', showReference: true, onSubmit() { } });
```

### Path Lock (`path-lock.js`)
Network diagram. Tap nodes in correct route order.
```js
new PathLock(el, {
  nodes: [{ id: 'a', label: 'IGW', x: 50, y: 20 }],
  edges: [['a','b']], answer: ['a','b'], onSubmit() { }
});
```

### Sort Lock (`sort-lock.js`)
Drag items to reorder. "Confirm Order" to test.
```js
new SortLock(el, {
  answer: ['Step 1','Step 2','Step 3'], onSubmit() { }
});
```

### Match Lock (`match-lock.js`)
Flip-card memory game. Match pairs to clear.
```js
new MatchLock(el, {
  pairs: [['S3','Storage'],['EC2','Compute']], cols: 4, onSubmit() { }
});
```

### Color Lock (`color-lock.js`)
RGB sliders to match a target color.
```js
new ColorLock(el, { answer: [180,60,220], tolerance: 15, onSubmit() { } });
```

### Keypad Lock (`keypad-lock.js`)
Classic PIN pad with 0–9, enter, clear.
```js
new KeypadLock(el, {
  answer: '4721', falseOutputs: [...], onSubmit() { }, onWrong(msg) { }
});
```

### Terminal Lock (`terminal-lock.js`)
Fake CLI prompt. Type a command to unlock.
```js
new TerminalLock(el, {
  prompt: 'admin@cloud:~$', answer: 'aws s3 ls',
  history: ['System breach detected.'],
  falseOutputs: ['command not found'], onSubmit() { }, onWrong(msg) { }
});
```

### Defuse Lock (`defuse-lock.js`)
Composite mini-tasks (toggles + code entry) with countdown timer.
```js
new DefuseLock(el, {
  timeSeconds: 30,
  tasks: [
    { type: 'toggle', label: 'Cut red wire', answer: true },
    { type: 'code', label: 'Enter code', answer: '42' },
  ],
  onSubmit() { }, onTimeout() { }
});
```

### Pipe Lock (`pipe-lock.js`)
Rotate pipe segments to connect source to sink. Pipe types: `─│┐┘└┌┬┴├┤┼`.
```js
new PipeLock(el, {
  cols: 4, rows: 3,
  pipes: ['┌','─','─','┐','│',' ',' ','│','└','─','─','┘'],
  source: { col: 0, row: 0 }, sink: { col: 3, row: 2 }, onSubmit() { }
});
```

### Maze Lock (`maze-lock.js`)
Top-down grid maze. 3 buttons: Turn Left, Forward, Turn Right. Player marker shows position + facing direction.
```js
new MazeLock(el, {
  cols: 5, rows: 5,
  walls: [[0,2,'W'], [1,1,'E'], [2,1,'S']],  // [row, col, side] — side: N/S/E/W
  start: { row: 0, col: 0, facing: 'E' },
  goal: { row: 4, col: 4 },
  maxSteps: 20,                                // optional step limit (0 = unlimited)
  showWalls: true,                             // false = walls invisible until bumped
  showGoal: true,                              // false = goal ★ hidden until reached
  fallOnBump: false,                           // true = hit wall → reset to start
  falseOutputs: ['Lost in the maze!'],
  onSubmit() { }, onWrong(msg) { },
  onBump() { }                                 // called on wall bump — engine decides penalty
});
```
Walls specified per cell side; reciprocals auto-generated. Outer boundary implicit. Player sees `▲▶▼◀` for facing. Goal shown as `★` (if `showGoal: true`); revealed on solve either way. When `showWalls: false`, walls are invisible — bumping reveals them in red and fires `onBump()` so the engine can apply penalties (e.g. -30s). `showGoal: false` hides the `★` — status says "find the exit" instead. `fallOnBump: true` resets player to start on every wall hit (keeps revealed walls visible). All three can combine for maximum difficulty where hints are essential.

## Bible-Themed Locks

### Grinder Lock (`grinder-lock.js`)
Espresso calibration — 3 sliders, pull shot, timer animation. Formula-based extraction time.
```js
new GrinderLock(el, {
  config: { sliders: [{id,label,sub,min,max,default}], formula: '10+grind*2.5-dose*0.8+yield*1.2', randomRange: 0.5, target: {min:25,max:26}, feedback: {fast,slow,perfect}, managerNote: '...' },
  onSubmit() { }, onWrong(msg) { }
});
```

### Stock Memory Lock (`stock-memory-lock.js`)
Memorize checklist (timed), then grab items from shelf. Bad items to avoid.
```js
new StockMemoryLock(el, {
  config: { memorizeSeconds: 5, checklist: [{id,label,need}], shelf: {rows,itemsPerRow,badItems}, allowReview: true, reviewSeconds: 5 },
  onSubmit() { }, onWrong(msg) { }
});
```

### Spelling Lock (`spelling-lock.js`)
Tap scrambled letters to spell words. Supports random pool selection.
```js
new SpellingLock(el, {
  config: { pool: ['WORD1','WORD2',...], pickCount: 3, sequential: true, scrambleLetters: true },
  onSubmit() { }, onWrong(msg) { }
});
```

### Evidence Lock (`evidence-lock.js`)
Step-by-step number deduction with narrative. Hints after N failed attempts.
```js
new EvidenceLock(el, {
  config: { steps: [{type,narrative,detail,prompt,answer,hint}], hintsAfterAttempts: 2 },
  onSubmit() { }, onWrong(msg) { }
});
```

### Milk Jug Lock (`milk-jug-lock.js`)
Multi-mechanic deduction: shelf tap, timeline choice, card elimination, number input.
```js
new MilkJugLock(el, {
  config: { jugDisplay: {jugs:[{name,batch,time}]}, steps: [{type:'shelf_tap'|'choice'|'card_elimination'|'number_input', ...}] },
  onSubmit() { }, onWrong(msg) { }
});
```

### Cascade Lock (`cascade-lock.js`)
Multi-step realization with visual progression (cup glow). Manual continue on final reveal.
```js
new CascadeLock(el, {
  config: { cupNames: [...], pauseBetweenSteps: 3000, steps: [{question,options,answer,wrong,after}], onComplete: {scene,emojis,text,subtext} },
  onSubmit() { }, onWrong(msg) { }
});
```

### Dial Lock (`dial-lock.js`)
Vertical swipeable number dials with handle. Supports reward animation (net fill + revelation text).
```js
new DialLock(el, {
  config: { dials: [{label,min,max,answer}], title, subtitle, falseOutputs: [...], reward: {type:'net_fill',total:153,emoji,revelation:{hebrew,greek,english,verse}} },
  onSubmit() { }, onWrong(msg) { }
});
```

### Café Order Lock (`cafe-order-lock.js`)
Persistent drink-making tool. Queue timer, sentiment, auto-complete (Manager helps). Pauses during other puzzles, stops after 8 served.
```js
new CafeOrderLock(el, {
  config: { recipes: {'Drink Name': {cup:'hot'|'cold', ingredients:[...]}}, queueInterval: 20000, autoCompleteChance: 0.2, maxQueue: 4 },
  onServed(totalServed) { }
});
```
Static methods: `CafeOrderLock.getPending()`, `CafeOrderLock.getServed()`, `CafeOrderLock.isRushOver()`, `CafeOrderLock.isPaused()`.
State persisted to `localStorage('cafe_order_state')`.

### Crowd Counter Lock (`crowd-counter-lock.js`)
Tap groups on a grid to count them. Must reach exact target.
```js
new CrowdCounterLock(el, {
  rows: 5, cols: 6, clusters: [{row,col,count,icon},...],
  target: 5000, tolerance: 0, showTally: false, shuffle: true,
  onSubmit({total}) {}, onWrong(msg) {}
});
```

### Crowd Seating Lock (`crowd-seating-lock.js`)
Place group markers on grid. No adjacent groups allowed (need distribution paths).
```js
new CrowdSeatingLock(el, {
  cols: 6, rows: 6, target: 12, groupSize: 50,
  blocked: [[0,2],[1,1]], onSubmit({groups}) {}, onWrong(msg) {}
});
```

### Offering Table Lock (`offering-table-lock.js`)
Tap items to place on table. Correct items stay, wrong items bounce with response text.
```js
new OfferingTableLock(el, {
  items: [{id,icon,label,correct:true}, {id,icon,label,correct:false,response:'msg'}],
  onSubmit({collected}) {}, onWrong(msg) {}
});
```

### Bread Break Lock (`bread-break-lock.js`)
Hold to break loaves/fish. Sweet spot timing. Counter multiplies with each break.
```js
new BreadBreakLock(el, {
  items: [{id,icon,label},...], holdMin: 0.4, holdMax: 1.2,
  multiplier: [10,50,200,800,2000,3500,5000],
  onSubmit({breaks}) {}, onCrumble() {}
});
```

## AWS-Themed Locks

### Tag Lock (`tag-lock.js`)
Drag key-value tag chips onto resource boxes. Validates correct tag assignments.
```js
new TagLock(el, {
  resources: [{ id: 'web', label: 'Web Server', requiredTags: { Environment: 'Production' } }],
  extraTags: [{ key: 'Environment', value: 'Staging' }],
  onSubmit() { }
});
```

### Architecture Lock (`arch-lock.js`)
Drag service icons into drop zones on an architecture diagram.
```js
new ArchLock(el, {
  zones: [{ id: 'front', label: 'Frontend Tier', x: 50, y: 15 }],
  services: [{ id: 'alb', label: 'ALB', icon: '⚖️' }],
  solution: { front: 'alb' }, onSubmit() { }
});
```

### Log Lock (`log-lock.js`)
Scrollable CloudWatch-style log. Select correct lines containing the clue.
```js
new LogLock(el, {
  prompt: 'Find the error',
  lines: [{ text: 'ERROR Connection refused', correct: true }],
  onSubmit() { }
});
```

### Policy Lock (`policy-lock.js`)
JSON editor with dropdown blanks. Fill in IAM policy values.
```js
new PolicyLock(el, {
  template: '{\n  "Effect": "___",\n  "Action": "___"\n}',
  blanks: [{ placeholder: '___', answer: 'Allow', options: ['Allow','Deny'] }],
  onSubmit() { }
});
```

### Cost Lock (`cost-lock.js`)
Adjust dropdowns/sliders to hit a target monthly cost.
```js
new CostLock(el, {
  target: 85, tolerance: 5,
  inputs: [{ label: 'Instance', type: 'select', options: [{label:'t3.micro',cost:8}] }],
  costFn(values) { return values[0].cost; },
  onSubmit() { }
});
```

### DNS Lock (`dns-lock.js`)
Chain of dropdowns tracing a DNS resolution path.
```js
new DnsLock(el, {
  steps: [{ label: 'Domain', options: ['app.example.com'], answer: 'app.example.com' }],
  onSubmit() { }
});
```

### Key Lock (`key-lock.js`)
Two-phase: assemble key fragments in order, then decrypt a message.
```js
new KeyLock(el, {
  fragments: ['A3','F7','B1','D9'],
  encrypted: 'dW5sb2Nr', decrypted: 'unlock', onSubmit() { }
});
```

### AZ Lock (`az-lock.js`)
Distribute resources across availability zone columns for high availability.
```js
new AzLock(el, {
  zones: ['us-east-1a','us-east-1b'],
  resources: [{ id: 'web1', label: 'Web Server', icon: '🖥️' }],
  solution: { web1: 0 }, onSubmit() { }
});
```

### Security Group Lock (`sg-lock.js`)
Toggle allow/deny per rule row (protocol, port, source).
```js
new SgLock(el, {
  rules: [{ protocol: 'TCP', port: '443', source: '0.0.0.0/0', answer: 'allow' }],
  onSubmit() { }
});
```

### Subnet CIDR Lock (`cidr-lock.js`)
Select correct CIDR blocks for subnets within a VPC.
```js
new CidrLock(el, {
  vpc: '10.0.0.0/16',
  subnets: [{ label: 'Public A', options: ['10.0.1.0/24','10.0.0.0/24'], answer: '10.0.1.0/24' }],
  onSubmit() { }
});
```

### WAF Rule Lock (`waf-lock.js`)
Build WAF rules (action + match) to filter malicious requests.
```js
new WafLock(el, {
  requests: [{ method: 'POST', path: '/admin/login', ip: '203.0.113.50', label: 'brute force', malicious: true }],
  rules: [{ match: 'path', options: ['/admin/*','/api/*'], answer: '/admin/*', action: 'block' }],
  onSubmit() { }
});
```

### Container Task Lock (`task-lock.js`)
Tap containers to fit within CPU/memory limits.
```js
new TaskLock(el, {
  taskLimits: { cpu: 1024, memory: 2048 },
  containers: [{ id: 'web', label: 'Web', icon: '🌐', cpu: 512, memory: 1024 }],
  answer: ['web'], onSubmit() { }
});
```

### Lambda Chain Lock (`chain-lock.js`)
Tap items to build an event pipeline in order.
```js
new ChainLock(el, {
  items: [{ id: 'api', label: 'API Gateway', icon: '🌐' }],
  answer: ['api'], onSubmit() { }
});
```

### S3 Lifecycle Lock (`lifecycle-lock.js`)
Set day thresholds for storage class transitions on a visual timeline.
```js
new LifecycleLock(el, {
  stages: [{ label: 'Standard → IA', min: 30, max: 180, step: 30, answer: 30 }],
  onSubmit() { }
});
```

### DynamoDB Query Lock (`query-lock.js`)
Build a query by selecting partition key, sort key condition, and filter.
```js
new QueryLock(el, {
  table: 'Orders', schema: { pk: 'userId', sk: 'orderDate' },
  fields: [{ label: 'Partition Key', options: ['user-123','*'], answer: 'user-123' }],
  onSubmit() { }
});
```

### CloudWatch Alarm Lock (`alarm-lock.js`)
Configure alarm with mini metric graph. Dropdowns for metric, threshold, period, action.
```js
new AlarmLock(el, {
  fields: [{ label: 'Metric', options: ['CPUUtilization','NetworkIn'], answer: 'CPUUtilization' }],
  onSubmit() { }
});
```

### Incident Timeline Lock (`timeline-lock.js`)
Tap events to swap and arrange chronologically on a vertical timeline.
```js
new TimelineLock(el, {
  events: [{ id: 'a', label: 'Alarm fired', time: '10:23' }],
  answer: ['a'], onSubmit() { }
});
```

### Well-Architected Lock (`pillar-lock.js`)
Statements appear one by one. Sort each into the correct Well-Architected pillar.
```js
new PillarLock(el, {
  pillars: ['Security','Reliability','Performance','Cost','Ops Excellence'],
  statements: [{ text: 'Encrypt data at rest', answer: 'Security' }],
  onSubmit() { }
});
```

## Tools & NPCs

Tools and NPCs share the same engine mechanic: `type: "tool"` in puzzles.json. They appear in the 🔧 Tools footer panel and can be opened from room discoveries or the Tools screen.

### Tool Types

**Standard Tools** — utility UIs the player can reuse:
```json
{
  "id": "hex-tool",
  "type": "tool",
  "card_ref": 110,
  "description": "Hex-to-ASCII decoder (reusable)",
  "ui": "hex-decoder",
  "config": {},
  "hints": []
}
```

Built-in tool UIs: `hex-decoder`, `base64-decoder`, `audio-player`, `image-viewer`, `cipher-wheel`, `binary-converter`, `freq-analyzer`, `aws-glossary`.

**NPCs** — tools with a character. Same `type: "tool"` but use `ui: "npc-dialog"`:
```json
{
  "id": "npc-scientist",
  "type": "tool",
  "card_ref": 200,
  "description": "Dr. Nova — AI Research Lead",
  "ui": "npc-dialog",
  "config": {
    "name": "Dr. Nova",
    "portrait": "🧑‍🔬",
    "greeting": "Ah, you must be the new recruit. Let me explain how things work around here.",
    "lines": [
      { "label": "What is this place?", "response": "This is the Model Lab. We train and evaluate foundation models here." },
      { "label": "How do I get past the door?", "response": "You'll need to configure the guardrails first. Check the control panel." },
      { "label": "Tell me about Bedrock", "response": "Amazon Bedrock gives you access to foundation models through a single API. No infrastructure to manage." }
    ],
    "state_lines": [
      { "requires_card": 38, "label": "I remember something...", "response": "You... you were one of the original monitoring processes. I thought you were all purged." }
    ]
  },
  "hints": []
}
```

### NPC Config

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Display name |
| `portrait` | string | Emoji or image path for avatar |
| `greeting` | string | First line shown when opened |
| `lines` | array | Dialog options: `{ label, response }` — always available |
| `state_lines` | array | Conditional dialog: `{ requires_card, label, response }` — only if player has the card |

### NPC Categories

| Category | Icon | Example |
|----------|------|---------|
| Human | 🧑‍🔬 👩‍💻 🧑‍🔧 | Scientists, engineers, guards |
| Robot | 🤖 | System assistants, broken bots |
| Animal | 🐱 🦊 🐦 | Stray processes, guide creatures |
| AI Entity | 🧠 💀 | Friendly/hostile AI characters |

### Discovery Button Icons

In room discoveries, tools and NPCs use distinct icons:
- 🔧 for standard tools
- The NPC's portrait emoji for NPCs (auto-detected from `ui: "npc-dialog"`)

### In the Footer

Both tools and NPCs appear in the 🔧 Tools screen, grouped by room. NPCs show their portrait and name. Tools show 🔧 and description.

## Common Options

| Option | Locks | Description |
|---|---|---|
| `mandatory` | all | `true`: required for progression (tracked by backend). `false`: optional (NPCs, tools, audio). **Always include this field.** |
| `revealCorrect` | slider, rotation, binary, jigsaw | `true`: per-input green feedback. `false`: all-or-nothing. |
| `falseOutputs` | wire, slider, rotation, binary, keypad, terminal | Misleading messages on wrong attempts. |
| `onWrong(msg)` | wire, slider, rotation, binary, keypad, terminal | Callback with false output on failure. |
| `onSubmit` | all | Callback on success. |
| `onTimeout` | defuse | Callback when timer runs out. |

## Anti-Brute-Force

- `revealCorrect: false` — no per-input feedback.
- `falseOutputs` + `onWrong` — misleading story events on failure.
- Sequence lock `blind` mode — no pattern shown.
- Morse lock `showReference: false` — no alphabet hint.

## Test Pages

- `app/puzzle-test.html` — generic locks (digit, word, wire, sequence, slider, rotation, binary, jigsaw, morse)
- `app/puzzle-test-2.html` — interaction locks (path, sort, match, color, keypad, terminal, defuse, pipe)
- `app/puzzle-test-3.html` — AWS-themed locks (tag, arch, log, policy, cost, dns, key, az)
- `app/puzzle-test-4.html` — AWS deep-dive locks (sg, cidr, waf, task, chain, lifecycle, query, alarm, timeline, pillar)
- `app/puzzle-test-maze.html` — maze lock (grid navigation with turn/forward controls)
- `app/puzzle-test-ep153.html` — EP153 café locks (grinder, stock memory, spelling, evidence, milk jug, cascade, dial, café orders)
- `app/maps-test.html` — isometric 2.5D map view prototype

## Conventions

- File: `app/puzzle/<name>-lock.js`
- Class: PascalCase (e.g., `DigitLock`, `WireLock`)
- CSS: prefixed with short class name (e.g., `dlock-`, `wirelk-`)
- Styles injected once via `_injectStyles()`, uses app CSS variables with fallbacks
- All components are mobile-first, touch-friendly

## Creating New Locks

1. Create `app/puzzle/<name>-lock.js` with a single class.
2. Use CSS variable fallbacks: `var(--accent, #3b82f6)`.
3. Inject styles with a unique `<style id="...">` to avoid duplicates.
4. Provide `onSubmit` callback. Add `falseOutputs`/`onWrong` if it has an activate button.
5. Add `revealCorrect` option if the puzzle has per-input feedback.
6. Add to the appropriate test page for testing.
7. Update this skill file.

## Puzzle → Card Consumption

When a puzzle is solved, the engine calls `discoverCard(successCard)`. If that discovery has `consumes_item`, those items are removed. If the revealed card has `consumes`, those cards are removed.

When wiring a puzzle into `cards.json`, always decide:
- **What items did the player spend to attempt this puzzle?** → put them in `consumes_item` on the discovery entry
- **What items does solving this puzzle "use up"?** → put them in `consumes` on the result/success card
- **Is the puzzle's prerequisite item reusable?** (e.g., a reference sheet needed to solve the puzzle but not destroyed) → use `requires_item` only, no `consumes_item`
