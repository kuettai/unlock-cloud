/**
 * Re:Solve — Happy Path Tests
 * Simulates a successful playthrough of each episode using the game engine directly.
 * Run: node --test tests/happy-path.test.js
 */

const { readFileSync } = require('fs');
const { join } = require('path');
const { test, describe, before } = require('node:test');
const assert = require('node:assert/strict');

// --- Engine loader with file-based fetch mock ---

function loadEngine() {
  const src = readFileSync(join(__dirname, '..', 'app', 'engine.js'), 'utf-8');
  const patched = src
    .replace(/localStorage\./g, '({getItem(){},setItem(){},removeItem(){}}).')
    .replace(/fetch\(/g, 'globalThis.__fetch(');
  const fn = new Function(patched + '\nreturn GameEngine;');
  return fn();
}

function mockFetch(scenarioDir) {
  globalThis.__fetch = (url) => {
    const clean = url.replace(/\?v=\d+/, '');
    const file = clean.replace(/^[^/]*\//, '');
    const fullPath = join(scenarioDir, file);
    try {
      const data = readFileSync(fullPath, 'utf-8');
      return Promise.resolve({ json: () => Promise.resolve(JSON.parse(data)) });
    } catch {
      return Promise.reject(new Error(`File not found: ${fullPath}`));
    }
  };
}

const GameEngine = loadEngine();
const SCENARIOS = join(__dirname, '..', 'scenarios', 'aws');
const SCENARIOS_BIBLE = join(__dirname, '..', 'scenarios', 'bible-jesus-miracles');

async function createEngine(episodeDir) {
  const dir = join(SCENARIOS, episodeDir);
  mockFetch(dir);
  const engine = new GameEngine('.');
  await engine.load();
  return engine;
}

// Helper: discover a card
function discover(engine, cardId, label) {
  const result = engine.discoverCard(cardId);
  assert.ok(result || engine.discoveredCards.has(cardId) || engine.revealedCards.has(cardId),
    `Failed to discover card #${cardId} (${label})`);
}

// Helper: solve a puzzle by marking it solved and discovering the result card
function solvePuzzle(engine, puzzleId, resultCardId, label) {
  engine.solvedPuzzles.add(puzzleId);
  if (resultCardId) discover(engine, resultCardId, label || `puzzle result #${resultCardId}`);
}

// Helper: solve a code_entry puzzle via engine API
function solveCode(engine, puzzleId, answer) {
  const result = engine.tryCodeEntry(puzzleId, answer);
  assert.ok(result.correct, `Puzzle ${puzzleId} failed: ${result.message}`);
}

function assertCompleted(engine) {
  assert.ok(engine.finished, 'Engine should be finished');
  assert.ok(engine.completed, 'Engine should be completed (success)');
}

// ============================================================
// EP0 — Boot Sequence
// ============================================================
describe('EP0 — Boot Sequence', () => {
  let engine;
  before(async () => { engine = await createEngine('ep0-boot-sequence'); engine.start(); });

  test('Start Chamber: discover chip and box, combine them', () => {
    assert.equal(engine.currentRoom, 1);
    discover(engine, 2, 'Locked Box');
    discover(engine, 3, 'Key Chip');
    const result = engine.tryCombination(3, 2);
    assert.equal(result.id, 5);
    assert.ok(engine.unlockedRooms.includes(20));
    assert.ok(engine.unlockedRooms.includes(10));
  });

  test('Sequence Room: solve sequence lock → Access Key', () => {
    engine.navigateToRoom(20);
    solvePuzzle(engine, 'seq-grid', 33, 'Access Key');
    assert.ok(engine.inventory.includes(33));
  });

  test('Combination Room: discover items, combine → Charged Cell', () => {
    engine.navigateToRoom(10);
    discover(engine, 11, 'Power Cell');
    discover(engine, 12, 'Device');
    const result = engine.tryCombination(11, 12);
    assert.equal(result.id, 23);
    assert.ok(engine.inventory.includes(16));
  });

  test('Hidden Room: find hidden 42 → Data Fragment', () => {
    discover(engine, 30, 'Hidden Room');
    const found = engine.tryHiddenNumber(30, 42);
    assert.ok(found);
    assert.ok(engine.inventory.includes(42));
  });

  test('Code Room: solve word lock → Ending', () => {
    solvePuzzle(engine, 'morse-go', null, 'Morse');
    discover(engine, 50, 'Code Room');
    solveCode(engine, 'base64-decode', 'locknu');
    assertCompleted(engine);
  });
});

// ============================================================
// EP1 — Awakening
// ============================================================
describe('EP1 — Awakening', () => {
  let engine;
  before(async () => { engine = await createEngine('ep1-awakening'); engine.start(); });

  test('Spawn Room: solve log analysis, discover items', () => {
    assert.equal(engine.currentRoom, 100);
    solvePuzzle(engine, 'log-analysis', 101, 'System Logs');
    discover(engine, 103, 'Broken Communicator');
    discover(engine, 102, 'Blast Door');
  });

  test('Processing Chamber: get Repair Kit, combine, login → IAM Token', () => {
    discover(engine, 110, 'Processing Chamber');
    engine.navigateToRoom(110);
    discover(engine, 111, 'Active Machine');
    discover(engine, 112, 'Repair Kit');

    // Combine Repair Kit + Broken Communicator → Repaired Communicator #115
    const combo = engine.tryCombination(112, 103);
    assert.equal(combo.id, 115);
    assert.ok(engine.inventory.includes(115));

    // Login to EC2 → IAM Access Token #116 (terminal_lock, solve via puzzle mark)
    solvePuzzle(engine, 'terminal-ec2', 116, 'IAM Access Token');
    assert.ok(engine.inventory.includes(116));
  });

  test('Archive Room: search terminal → SG Blueprint, enter Policy Vault', () => {
    discover(engine, 120, 'Archive Room');
    engine.navigateToRoom(120);
    discover(engine, 121, 'Network Diagram');

    // Search terminal → Security Group Blueprint #125 (terminal_lock)
    solvePuzzle(engine, 'terminal-archive', 125, 'SG Blueprint');
    assert.ok(engine.inventory.includes(125));

    // Enter Policy Vault via keypad
    solvePuzzle(engine, 'keypad-vault', 160, 'Policy Vault');
    assert.ok(engine.unlockedRooms.includes(160));
  });

  test('Policy Vault: get reference sheet, configure IAM policy → Policy Token', () => {
    engine.navigateToRoom(160);
    assert.equal(engine.currentRoom, 160);
    discover(engine, 161, 'Policy Console');
    discover(engine, 162, 'NACL Reference Sheet');

    // Solve policy lock → Policy Token #165
    solvePuzzle(engine, 'policy-lock', 165, 'Policy Token');
    assert.ok(engine.inventory.includes(165));
  });

  test('Gateway Antechamber: configure SG → door opens', () => {
    engine.navigateToRoom(100);
    // Blast door requires #116, #115, #165 — all in inventory, consumes them
    discover(engine, 130, 'Gateway Antechamber');
    engine.navigateToRoom(130);
    assert.equal(engine.currentRoom, 130);

    discover(engine, 133, 'Port Reference Card');

    // Solve SG config (terminal_lock) → Event #135
    solvePuzzle(engine, 'slider-sg', 135, 'Door opens');
    assert.ok(engine.unlockedRooms.includes(170));
  });

  test('NACL Corridor: configure NACL rules', () => {
    engine.navigateToRoom(170);
    assert.equal(engine.currentRoom, 170);
    discover(engine, 171, 'NACL Control Panel');

    // Solve NACL lock → Event #175
    solvePuzzle(engine, 'nacl-sg-lock', 175, 'NACL configured');
    assert.ok(engine.unlockedRooms.includes(180));
  });

  test('Wire Junction: reconnect wires → power restored', () => {
    engine.navigateToRoom(180);
    assert.equal(engine.currentRoom, 180);

    // Solve wire lock → Event #185
    solvePuzzle(engine, 'wire-junction', 185, 'Power restored');
    assert.ok(engine.unlockedRooms.includes(140));
  });

  test('Internet Gateway: enter VPC ID → Ending', () => {
    engine.navigateToRoom(140);
    assert.equal(engine.currentRoom, 140);

    // Solve keypad gateway → Event #150 (ending)
    solvePuzzle(engine, 'keypad-gateway', 150, 'Gateway activated');
    assertCompleted(engine);
  });
});

// ============================================================
// EP2 — Day One
// ============================================================
describe('EP2 — Day One', () => {
  let engine;
  before(async () => { engine = await createEngine('ep2-day-one'); engine.start(); });

  test('Reception: talk to Maya → Temp Badge', () => {
    assert.equal(engine.currentRoom, 100);
    discover(engine, 101, 'Maya');
    discover(engine, 103, 'Office Cat');
  });

  test('Your Desk: read stickies, solve dashboard → Error Logs', () => {
    discover(engine, 200, 'Your Desk');
    engine.navigateToRoom(200);
    discover(engine, 202, 'Task Sticky Notes');
    discover(engine, 203, 'Warning Sticky Notes');
    discover(engine, 204, 'Password Sticky Notes');
    discover(engine, 205, 'Basement Access Note');
    solvePuzzle(engine, 'dashboard-critical', 206, 'Quick Dashboard');
  });

  test('War Room: talk to Jordan, triage incident', () => {
    discover(engine, 300, 'War Room');
    engine.navigateToRoom(300);
    discover(engine, 301, 'Jordan');
    discover(engine, 302, 'Incident Timeline');
    discover(engine, 303, 'War Room Dashboard');
    solvePuzzle(engine, 'sort-triage', 305, 'Incident Triaged');
  });

  test('Data Team: talk to Priya, solve model selection', () => {
    engine.navigateToRoom(200);
    discover(engine, 500, 'Data Team Office');
    engine.navigateToRoom(500);
    discover(engine, 501, 'Dr. Priya');
    discover(engine, 502, 'Model Selection Whiteboard');
    discover(engine, 503, 'Model Benchmarks');
    solvePuzzle(engine, 'match-models', 505, 'Correct Model Selected');
  });

  test('DevOps Bullpen: talk to Sam, diagnose root cause', () => {
    engine.navigateToRoom(200);
    discover(engine, 700, 'DevOps Bullpen');
    engine.navigateToRoom(700);
    discover(engine, 701, 'Sam');
    discover(engine, 702, 'Pipeline Diagram');
    discover(engine, 703, 'Deployment Logs');
    solvePuzzle(engine, 'timeline-rootcause', 708, 'Root Cause Found');
  });

  test('Server Closet: reconnect cables', () => {
    discover(engine, 400, 'Server Closet');
    engine.navigateToRoom(400);
    discover(engine, 401, 'Patch Panel');
    discover(engine, 404, 'Server Rack Labels');
    solvePuzzle(engine, 'wire-cables', 403, 'Cables Reconnected');
  });

  test('Security Office: configure guardrails → Exec Badge', () => {
    engine.navigateToRoom(200);
    discover(engine, 600, 'Security Office');
    engine.navigateToRoom(600);
    discover(engine, 601, 'Frank');
    discover(engine, 602, 'CCTV Footage');
    // Card 603 may require being in room 600 context — use revealCard directly
    engine.revealCard(603);
    solvePuzzle(engine, 'sg-guardrails', 605, 'Guardrails Restored');
    discover(engine, 613, 'Executive Badge');
  });

  test('Executive Floor: open cabinet, decrypt files → Satellite Key', () => {
    engine.navigateToRoom(200);
    discover(engine, 800, 'Executive Floor');
    engine.navigateToRoom(800);
    discover(engine, 801, 'The Fox');
    discover(engine, 802, 'Locked Filing Cabinet');
    solvePuzzle(engine, 'policy-cabinet', 804, 'Cabinet Opened');
    solvePuzzle(engine, 'key-ctofiles', 806, 'Satellite Key');
  });

  test('Archive Basement: search terminal → Architecture Doc', () => {
    engine.navigateToRoom(200);
    discover(engine, 1100, 'Archive Basement');
    engine.navigateToRoom(1100);
    discover(engine, 1101, 'Original Architecture Whiteboard');
    solvePuzzle(engine, 'terminal-archive', 1103, 'Architecture Doc');
  });

  test('Rooftop: configure prompt flow, activate chain → Ending', () => {
    engine.navigateToRoom(800);
    discover(engine, 1200, 'Rooftop');
    engine.navigateToRoom(1200);
    discover(engine, 1201, 'Satellite Console');
    solvePuzzle(engine, 'path-promptflow', 1203, 'Prompt Flow Restored');
    discover(engine, 1207, 'NOVA');
    solvePuzzle(engine, 'chain-final', 1205, 'Systems Restored');
    assertCompleted(engine);
  });
});


// ============================================================
// BIBLE — EP0 — The Master's Investigation (Wedding at Cana)
// ============================================================
describe('Bible EP0 — The Master\'s Investigation', () => {
  let engine;
  before(async () => {
    const dir = join(SCENARIOS_BIBLE, 'ep0-masters-investigation');
    mockFetch(dir);
    engine = new GameEngine('.');
    await engine.load();
    engine.start();
  });

  test('Head Table: discover Cup + Ezra, combine → unlocks Servants Corner', () => {
    assert.equal(engine.currentRoom, 100);
    discover(engine, 101, 'Extraordinary Cup');
    discover(engine, 103, 'Ezra NPC');
    const result = engine.tryCombination(101, 103);
    assert.equal(result.id, 109);
    assert.ok(engine.unlockedRooms.includes(120));
  });

  test('Servants Corner: discover Servants, solve witness-wires → unlocks Stone Jars + Joachim\'s Shop', () => {
    engine.navigateToRoom(120);
    assert.equal(engine.currentRoom, 120);
    discover(engine, 121, 'The Servants NPC');
    solvePuzzle(engine, 'witness-wires', 131, 'Servant Testimony');
    assert.ok(engine.unlockedRooms.includes(140));
    assert.ok(engine.unlockedRooms.includes(160));
  });

  test('Stone Jars: discover jars, solve jar-volume (120)', () => {
    engine.navigateToRoom(140);
    assert.equal(engine.currentRoom, 140);
    discover(engine, 141, 'Six Stone Jars');
    discover(engine, 142, 'Jar Wine Sample');
    discover(engine, 143, 'Courtyard Well');
    solvePuzzle(engine, 'jar-volume', 149, 'Jar Examination');
  });

  test('Joachim\'s Shop: discover Joachim, solve merchant-eliminate', () => {
    engine.navigateToRoom(160);
    assert.equal(engine.currentRoom, 160);
    discover(engine, 161, 'Joachim NPC');
    discover(engine, 162, 'Delivery Records');
    solvePuzzle(engine, 'merchant-eliminate', 169, 'Merchant Eliminated');
  });

  test('Stone Jars: cross courtyard maze → unlocks Bride\'s Family', () => {
    engine.navigateToRoom(140);
    solvePuzzle(engine, 'courtyard-maze', 168, 'Crossed courtyard');
    assert.ok(engine.unlockedRooms.includes(180));
  });

  test('Bride\'s Family: discover Miriam, solve miriam-word (WINE) → unlocks Eastern Corner', () => {
    engine.navigateToRoom(180);
    assert.equal(engine.currentRoom, 180);
    discover(engine, 181, 'Miriam NPC');
    solvePuzzle(engine, 'miriam-word', 191, 'Miriam Testimony');
    assert.ok(engine.unlockedRooms.includes(200));
  });

  test('Eastern Corner: discover Simon & Andrew, solve first-sign → unlocks The Well', () => {
    engine.navigateToRoom(200);
    assert.equal(engine.currentRoom, 200);
    discover(engine, 201, 'Simon & Andrew NPC');
    solvePuzzle(engine, 'first-sign', 211, 'Disciple Witness');
    assert.ok(engine.unlockedRooms.includes(220));
  });

  test('The Well: discover items, solve timeline → Evidence Chain, solve WATER → kavod → Ending', () => {
    engine.navigateToRoom(220);
    assert.equal(engine.currentRoom, 220);
    discover(engine, 221, 'Well Water');
    discover(engine, 222, 'Final Wine Taste');
    discover(engine, 223, 'Evidence Table');
    solvePuzzle(engine, 'investigation-timeline', 225, 'Complete Evidence Chain');
    solvePuzzle(engine, 'final-conclusion', 228, 'Water became wine');
    solvePuzzle(engine, 'kavod-word', 999, 'His Glory');
    assertCompleted(engine);
  });
});


// ============================================================
// Bible EP1 — Philip's Impossible Math
// ============================================================
describe('Bible EP1 — Philip\'s Impossible Math', () => {
  let engine;
  before(async () => {
    const dir = join(SCENARIOS_BIBLE, 'ep1-philips-impossible-math');
    mockFetch(dir);
    engine = new GameEngine('.');
    await engine.load();
    engine.start();
  });

  test('The Hillside: count the crowd → unlocks The Crowd', () => {
    assert.equal(engine.currentRoom, 100);
    discover(engine, 102, 'Philip\'s Calculation');
    discover(engine, 103, 'Distant Markets');
    solvePuzzle(engine, 'crowd-counter', 113, 'Crowd counted');
    assert.ok(engine.unlockedRooms.includes(120));
  });

  test('The Crowd: solve denarii-math (200) → unlocks Boy\'s Basket + Arrangement', () => {
    engine.navigateToRoom(120);
    assert.equal(engine.currentRoom, 120);
    discover(engine, 121, 'Hungry Families NPC');
    discover(engine, 122, 'Empty Merchant NPC');
    discover(engine, 123, 'Judas NPC');
    discover(engine, 124, 'Denarii Calculator');
    solvePuzzle(engine, 'denarii-math', 133, 'Search exhausted');
    assert.ok(engine.unlockedRooms.includes(140));
    assert.ok(engine.unlockedRooms.includes(160));
  });

  test('The Boy\'s Basket: solve offering-table → The Offering (#155)', () => {
    engine.navigateToRoom(140);
    assert.equal(engine.currentRoom, 140);
    discover(engine, 141, 'Andrew NPC');
    discover(engine, 143, 'The Boy\'s Trust');
    solvePuzzle(engine, 'offering-table', 153, 'Five loaves and two fish');
    assert.ok(engine.inventory.includes(155));
  });

  test('The Arrangement: solve crowd-seating → Crowd Arranged (#174)', () => {
    engine.navigateToRoom(160);
    assert.equal(engine.currentRoom, 160);
    discover(engine, 162, 'Group Tally');
    solvePuzzle(engine, 'crowd-seating', 173, 'Crowd arranged');
  });

  test('Gate: combine Offering + Crowd Arranged → unlocks The Blessing', () => {
    const result = engine.tryCombination(155, 174);
    assert.equal(result.id, 175);
    assert.ok(engine.unlockedRooms.includes(180));
  });

  test('The Blessing: solve bread-break + supply-run → unlocks Hillside After', () => {
    engine.navigateToRoom(180);
    assert.equal(engine.currentRoom, 180);
    discover(engine, 182, 'The Endless Basket');
    solvePuzzle(engine, 'bread-break', 195, 'Miracle witnessed');
    solvePuzzle(engine, 'supply-run', 193, 'Basket never empties');
    assert.ok(engine.unlockedRooms.includes(200));
  });

  test('Hillside After: hidden baskets, PROPHET word-lock, combine → Ending', () => {
    engine.navigateToRoom(200);
    assert.equal(engine.currentRoom, 200);
    discover(engine, 203, 'Crowd\'s Declaration');
    // Hidden element: find 12 baskets
    solvePuzzle(engine, 'hidden-baskets', null, 'Hidden baskets');
    engine.revealCard(202);
    engine.revealCard(310);
    assert.ok(engine.inventory.includes(202));
    // Word-lock: PROPHET
    solvePuzzle(engine, 'prophet-word', 218, 'Prophet declared');
    assert.ok(engine.inventory.includes(219));
    // Final combination: #219 + #204 → #999 ending
    const result = engine.tryCombination(219, 204);
    assert.equal(result.id, 999);
    assertCompleted(engine);
  });
});

// ============================================================
// Bible EP1 — JSON Validation
// ============================================================
describe('Bible EP1 — JSON Validation', () => {
  const ep1Dir = join(__dirname, '..', 'scenarios', 'bible-jesus-miracles', 'ep1-philips-impossible-math');
  const jsonFiles = [
    'meta.json', 'narrative.json', 'cards.json', 'combinations.json',
    'puzzles.json', 'events.json', 'scoring.json', 'rooms.json', 'image-style.json'
  ];

  for (const file of jsonFiles) {
    test(`${file} parses as valid JSON`, () => {
      const raw = readFileSync(join(ep1Dir, file), 'utf-8');
      assert.doesNotThrow(() => JSON.parse(raw), `${file} is not valid JSON`);
    });
  }
});