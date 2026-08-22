#!/usr/bin/env node
/**
 * Clue guard — asserts that every phrase a player needs in order to solve an
 * episode's puzzles still appears somewhere in that episode's player-facing
 * text (room descriptions, card descriptions, NPC dialogue, hints).
 *
 * Trimming prose is safe right up until it deletes the one sentence carrying a
 * puzzle answer. This is the net under that: edit freely, then re-run.
 *
 * Clue lists live in tools/clue-guard.clues.json, keyed by episode directory.
 * Each entry is { "puzzle-id": ["phrase", ["either-this", "or-this"], ...] }.
 * A nested array means "at least one of these must survive".
 *
 * Usage: node tools/clue-guard.js scenarios/aws/ep3-kings-errand
 */
const fs = require('fs');
const path = require('path');

const dir = process.argv[2];
if (!dir) { console.error('usage: node tools/clue-guard.js <episode-dir>'); process.exit(2); }

const read = f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
const allClues = JSON.parse(fs.readFileSync(path.join(__dirname, 'clue-guard.clues.json'), 'utf8'));

const key = Object.keys(allClues).find(k => path.resolve(dir).endsWith(k));
if (!key) {
  console.log(`  no clue list registered for ${dir} — nothing to check`);
  process.exit(0);
}

// Everything the player can read, per puzzle-agnostic pool plus per-puzzle hints.
const cards = read('cards.json').cards;
const puzzles = read('puzzles.json').puzzles;

let pool = '';
for (const c of cards) pool += ` ${c.title || ''} ${c.description || ''}`;
for (const c of cards) for (const d of c.discoveries || []) pool += ` ${d.label || ''}`;
for (const p of puzzles) {
  const cfg = p.config || {};
  pool += ` ${cfg.greeting || ''}`;
  for (const l of [...(cfg.lines || []), ...(cfg.state_lines || [])]) pool += ` ${l.label || ''} ${l.response || ''}`;
  for (const h of p.hints || []) pool += ` ${h}`;
}
const haystack = pool.toLowerCase().replace(/\s+/g, ' ');

const missing = [];
let checked = 0;
for (const [puzzleId, phrases] of Object.entries(allClues[key])) {
  for (const phrase of phrases) {
    checked++;
    const alts = Array.isArray(phrase) ? phrase : [phrase];
    if (!alts.some(a => haystack.includes(a.toLowerCase()))) missing.push({ puzzleId, alts });
  }
}

console.log(`  CLUE GUARD: ${dir}`);
console.log(`  ${checked - missing.length}/${checked} required clues present`);
if (missing.length) {
  console.log('\n  ❌ MISSING — a puzzle lost its clue:');
  for (const m of missing) console.log(`     ${m.puzzleId}: ${m.alts.map(a => `"${a}"`).join(' | ')}`);
  process.exit(1);
}
console.log('  ✅ every registered clue survives\n');
