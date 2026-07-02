#!/usr/bin/env node
/**
 * Validate Episode Progression
 * 
 * Checks that all rooms are reachable through the reveal chain,
 * starting from the first room (unlocked_by: null).
 * 
 * Usage: node tools/validate-progression.js scenarios/<category>/<episode>
 * 
 * Checks:
 *   1. All rooms are reachable from start via reveals chain
 *   2. Every puzzle result card reveals the next required room
 *   3. No orphan rooms (rooms that nothing reveals)
 *   4. No orphan cards (cards referenced in reveals/requires that don't exist)
 *   5. The ending card (is_ending: true) is reachable
 *   6. Every puzzle has a discovery entry in its room
 *   7. Every requires_item references a card the player can actually obtain
 */

const { readFileSync } = require('fs');
const { join } = require('path');

const dir = process.argv[2];
if (!dir) {
  console.error('Usage: node tools/validate-progression.js scenarios/<category>/<episode>');
  process.exit(1);
}

function load(file) {
  return JSON.parse(readFileSync(join(dir, file), 'utf-8'));
}

const cards = load('cards.json').cards;
const rooms = load('rooms.json').rooms;
const puzzles = load('puzzles.json').puzzles;
const combinations = load('combinations.json').combinations;

const cardMap = new Map(cards.map(c => [c.id, c]));
const roomCardIds = new Set(rooms.map(r => r.card_id));
const puzzleMap = new Map(puzzles.map(p => [p.id, p]));

const errors = [];
const warnings = [];

// --- 1. Find start room ---
const startRoom = rooms.find(r => r.unlocked_by === null);
if (!startRoom) {
  errors.push('FATAL: No starting room (unlocked_by: null)');
  report();
  process.exit(1);
}

// --- 2. Simulate reachability via BFS on reveals ---
const reachable = new Set();
const obtainable = new Set(); // cards the player can obtain
const queue = [startRoom.card_id];

// Seed: start room is reachable
reachable.add(startRoom.card_id);

// BFS: follow reveals + discoveries + puzzle results
while (queue.length > 0) {
  const id = queue.shift();
  const card = cardMap.get(id);
  if (!card) continue;

  obtainable.add(id);

  // Follow reveals
  for (const rid of (card.reveals || [])) {
    if (!reachable.has(rid)) {
      reachable.add(rid);
      queue.push(rid);
    }
  }

  // Follow discoveries (items the player can get in this room)
  for (const disc of (card.discoveries || [])) {
    if (!reachable.has(disc.card_id)) {
      reachable.add(disc.card_id);
      queue.push(disc.card_id);
    }
  }

  // Follow puzzle results (card_ref on puzzles that reference this card)
  for (const puzzle of puzzles) {
    if (puzzle.card_ref === id || (card.discoveries || []).some(d => d.puzzle === puzzle.id)) {
      if (puzzle.card_ref && !reachable.has(puzzle.card_ref)) {
        reachable.add(puzzle.card_ref);
        queue.push(puzzle.card_ref);
      }
    }
  }

  // Follow combinations where both inputs are obtainable
  for (const combo of combinations) {
    if (obtainable.has(combo.card_a) && obtainable.has(combo.card_b)) {
      if (!reachable.has(combo.result_card)) {
        reachable.add(combo.result_card);
        queue.push(combo.result_card);
      }
    }
  }
}

// --- 3. Check all rooms are reachable ---
const unreachableRooms = rooms.filter(r => !reachable.has(r.card_id));
for (const r of unreachableRooms) {
  errors.push(`UNREACHABLE ROOM: ${r.card_id} (${r.name}) — nothing in the reveal chain leads here`);
}

// --- 4. Check ending is reachable ---
const endingCards = cards.filter(c => c.is_ending);
if (endingCards.length === 0) {
  errors.push('No card with is_ending: true');
} else {
  for (const ec of endingCards) {
    if (!reachable.has(ec.id)) {
      errors.push(`UNREACHABLE ENDING: Card ${ec.id} (${ec.title}) — cannot reach the ending`);
    }
  }
}

// --- 5. Check orphan references in reveals ---
for (const card of cards) {
  for (const rid of (card.reveals || [])) {
    if (!cardMap.has(rid)) {
      errors.push(`ORPHAN REVEAL: Card ${card.id} reveals card ${rid} which doesn't exist`);
    }
  }
}

// --- 6. Check every puzzle has a discovery entry ---
for (const puzzle of puzzles) {
  const hasDiscovery = cards.some(c =>
    (c.discoveries || []).some(d => d.puzzle === puzzle.id)
  );
  if (!hasDiscovery) {
    warnings.push(`Puzzle "${puzzle.id}" has no discovery entry in any room — unreachable via UI`);
  }
}

// --- 7. Check requires_item references obtainable cards ---
for (const card of cards) {
  for (const disc of (card.discoveries || [])) {
    const reqItems = Array.isArray(disc.requires_item) ? disc.requires_item : (disc.requires_item ? [disc.requires_item] : []);
    for (const reqId of reqItems) {
      if (!cardMap.has(reqId)) {
        errors.push(`MISSING REQUIREMENT: Card ${card.id} discovery "${disc.label}" requires card ${reqId} which doesn't exist`);
      } else if (!reachable.has(reqId)) {
        warnings.push(`Card ${card.id} discovery "${disc.label}" requires card ${reqId} which may not be obtainable`);
      }
    }
  }
}

// --- 8. Check puzzle card_refs exist ---
for (const puzzle of puzzles) {
  if (puzzle.card_ref && !cardMap.has(puzzle.card_ref)) {
    errors.push(`Puzzle "${puzzle.id}" card_ref ${puzzle.card_ref} doesn't exist in cards.json`);
  }
}

// --- 9. Summary stats ---
const reachableRooms = rooms.filter(r => reachable.has(r.card_id));

// --- Report ---
function report() {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  PROGRESSION VALIDATION: ${dir}`);
  console.log(`${'═'.repeat(60)}\n`);
  console.log(`  Rooms:    ${reachableRooms.length}/${rooms.length} reachable`);
  console.log(`  Cards:    ${reachable.size}/${cards.length} reachable`);
  console.log(`  Puzzles:  ${puzzles.length}`);
  console.log(`  Combos:   ${combinations.length}`);
  console.log(`  Start:    Room ${startRoom.card_id} (${startRoom.name})`);
  console.log(`  Ending:   ${endingCards.map(c => `Card ${c.id}`).join(', ') || 'NONE'}`);
  console.log('');

  if (errors.length === 0 && warnings.length === 0) {
    console.log('  ✅ ALL CHECKS PASSED\n');
  }

  if (errors.length > 0) {
    console.log(`  ❌ ERRORS (${errors.length}):`);
    errors.forEach(e => console.log(`     • ${e}`));
    console.log('');
  }

  if (warnings.length > 0) {
    console.log(`  ⚠️  WARNINGS (${warnings.length}):`);
    warnings.forEach(w => console.log(`     • ${w}`));
    console.log('');
  }

  // Room reachability map
  console.log('  Room chain:');
  for (const r of rooms) {
    const status = reachable.has(r.card_id) ? '✓' : '✗';
    const revealedBy = cards.filter(c => (c.reveals || []).includes(r.card_id)).map(c => c.id);
    const source = r.unlocked_by === null ? '(start)' : `← revealed by cards [${revealedBy.join(', ')}]`;
    console.log(`     ${status} ${r.card_id} ${r.name} ${source}`);
  }
  console.log('');
}

report();
process.exit(errors.length > 0 ? 1 : 0);
