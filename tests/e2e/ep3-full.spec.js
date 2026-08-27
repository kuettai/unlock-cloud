// @ts-check
/**
 * EP3 "The King's Errand" — full end-to-end playthrough.
 *
 * Unlike the smoke specs, this one does NOT bypass puzzles. Every one of the
 * 30 puzzles is solved through its real UI: wires are dragged, deck battles
 * are played turn by turn, the equipment rack is reordered by tapping rows.
 * Room travel uses the room's own discovery button, and backtracking uses the
 * map. Each step asserts the reward card landed and the next gate opened.
 *
 * Run: npx playwright test tests/e2e/ep3-full.spec.js
 */

const { test, expect } = require('@playwright/test');
const { closePopup, closePuzzlePopup, goToRoom, combine, setupEpisode } = require('./helpers');

const EP3 = '/app/index.html?scenario=../scenarios/aws/ep3-kings-errand';

// ── generic UI helpers ────────────────────────────────────────────────

/** Click a discovery button in the current room by its visible label. */
async function act(page, label) {
  const btn = page.locator('.discoveries .discover-btn', { hasText: label }).first();
  await expect(btn, `discovery "${label}" should be available`).toBeVisible({ timeout: 5000 });
  await btn.click();
  await page.waitForTimeout(250);
}

/** Click a discovery, then dismiss the card popup it opens. */
async function look(page, label) {
  await act(page, label);
  await closePopup(page);
}

/**
 * Open an NPC dialog, exhaust every dialogue option, then end the conversation.
 * "End Conversation" is the button that marks a tool puzzle solved — dismissing
 * with the ✕ deliberately does not count, so the test uses the intended path.
 */
async function talk(page, label) {
  await act(page, label);
  await expect(page.locator('#puzzle-popup.open')).toBeVisible();
  const opts = page.locator('#puzzle-mount .npcd-opt');
  const count = await opts.count();             // option list is stable, not consumed
  for (let i = 0; i < count; i++) {
    await opts.nth(i).click();
    await page.waitForTimeout(100);
  }
  await page.locator('#puzzle-mount button', { hasText: 'End Conversation' }).click();
  await page.waitForTimeout(300);
  await closePuzzlePopup(page);
  await closePopup(page);
  await page.waitForTimeout(200);
}

/** Wait for a puzzle's reward to land, then clear any popups/toasts. */
async function settle(page, cardId) {
  await expect
    .poll(() => page.evaluate(id => engine.discoveredCards.has(id) || engine.revealedCards.has(id), cardId),
      { timeout: 15000, message: `card ${cardId} should be granted` })
    .toBe(true);
  await closePuzzlePopup(page);
  await closePopup(page);
  await page.waitForTimeout(250);
}

const inv = (page, id) => page.evaluate(i => engine.inventory.includes(i), id);
const solved = (page, id) => page.evaluate(i => engine.solvedPuzzles.has(i), id);

// ── per-puzzle solvers (real interaction) ─────────────────────────────

/** terminal-lock: type a wrong answer to exercise the ladder, then the real one. */
async function solveTerminal(page, wrong, right) {
  const input = page.locator('#puzzle-mount input');
  await expect(input).toBeVisible();
  await input.fill(wrong);
  await page.locator('#puzzle-mount button').click();
  await page.waitForTimeout(200);
  await input.fill(right);
  await page.locator('#puzzle-mount button').click();
}

/** wire-lock: drag each wire dot onto its socket dot. */
async function solveWires(page, pairs) {
  for (const [wire, socket] of pairs) {
    const from = page.locator(`.wirelk-dot[data-wire="${wire}"]`);
    const to = page.locator(`.wirelk-dot[data-socket="${socket}"]`);
    const a = await from.boundingBox();
    const b = await to.boundingBox();
    if (!a || !b) throw new Error(`wire ${wire}→${socket}: dot not rendered`);
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
    await page.mouse.down();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 });
    await page.mouse.up();
    await page.waitForTimeout(120);
  }
  await page.locator('.wirelk-btn').click();
}

/** bazaar-lock: drag the quest onto a stall, then dispatch. */
async function solveBazaar(page, stallId) {
  await page.locator('.bzlk-quest').first().dragTo(page.locator(`.bzlk-stall[data-stall="${stallId}"]`));
  await page.waitForTimeout(200);
  await page.locator('.bzlk-btn').click();
}

/** prompt-lock: tap fragments in order, then send. */
async function solvePrompt(page, fragments) {
  for (const f of fragments) {
    await page.locator('.prlk-frag', { hasText: new RegExp(`^${f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }).click();
    await page.waitForTimeout(80);
  }
  await page.locator('.prlk-btn').click();
}

/**
 * deck-battle-lock: play greedily until the conviction bar fills.
 * Reads the merchant's telegraphed intent and the hand each turn, spends
 * persuasion when it can beat their block, composure when it cannot.
 */
async function solveDeckBattle(page, label) {
  for (let turn = 0; turn < 60; turn++) {
    if (await page.locator('.dblk-win').isVisible().catch(() => false)) return turn;
    if (await page.locator('.dblk-lose').isVisible().catch(() => false)) {
      await page.locator('.dblk-result .dblk-btn-sec').click();   // Retry
      await page.waitForTimeout(200);
      continue;
    }
    const state = await page.evaluate(() => {
      const intents = [...document.querySelectorAll('.dblk-m-intents div')].map(d => parseInt(d.textContent.replace(/\D/g, '')) || 0);
      const gold = parseInt(document.querySelector('.dblk-stats strong')?.textContent || '0');
      const hand = [...document.querySelectorAll('.dblk-card')].map((c, i) => {
        const v = c.querySelector('.dblk-card-val')?.textContent || '';
        return { i, persuasion: v.includes('🗣️'), value: parseInt(v.replace(/\D/g, '')) || 0 };
      });
      return { attack: intents[0] ?? 0, block: intents[1] ?? 0, gold, hand };
    });
    if (!state.hand.length) break;

    const pers = state.hand.filter(c => c.persuasion).sort((a, b) => b.value - a.value);
    const comp = state.hand.filter(c => !c.persuasion).sort((a, b) => b.value - a.value);
    const topTwoPersuasion = pers.slice(0, 2).reduce((s, c) => s + c.value, 0);
    // Spend persuasion only when it actually lands past their guard, and never
    // when the purse is nearly empty; otherwise soak the hit with composure.
    const pick = (topTwoPersuasion > state.block && state.gold > 20)
      ? [...pers, ...comp].slice(0, 2)
      : [...comp, ...pers].slice(0, 2);

    for (const c of pick) {
      await page.locator('.dblk-card').nth(c.i).click();
      await page.waitForTimeout(60);
    }
    await page.locator('.dblk-actions .dblk-btn').click();   // End Turn
    await page.waitForTimeout(220);
  }
  throw new Error(`${label}: deck battle did not resolve`);
}

/** scroll-lock: choose every clause, then apply the seal. */
async function solveScroll(page, answers) {
  const selects = page.locator('select.scrlk-select');
  for (let i = 0; i < answers.length; i++) await selects.nth(i).selectOption(answers[i]);
  await page.locator('.scrlk-btn').click();
}

/** booking-run-lock: run each call, let it fail, then pick the fix. */
async function solveBookingRun(page, fixes) {
  for (const fix of fixes) {
    await page.locator('#brlk-go').click();
    await page.waitForTimeout(150);
    await page.locator('.brlk-opt', { hasText: new RegExp(`^${fix}$`) }).click();
    await page.waitForTimeout(150);
    const next = page.locator('#brlk-next');
    if (await next.isVisible().catch(() => false)) await next.click();
    await page.waitForTimeout(150);
  }
}

/** timeline-lock: selection-sort the list by tapping pairs into place. */
async function solveTimeline(page, orderedLabels) {
  for (let target = 0; target < orderedLabels.length; target++) {
    const labels = await page.locator('.tmlk-ev-label').allTextContents();
    const at = labels.findIndex(l => l.includes(orderedLabels[target]));
    if (at === -1) throw new Error(`timeline: "${orderedLabels[target]}" not found`);
    if (at === target) continue;
    await page.locator('.tmlk-item').nth(at).click();
    await page.waitForTimeout(80);
    await page.locator('.tmlk-item').nth(target).click();
    await page.waitForTimeout(120);
  }
  await page.locator('.tmlk-btn').click();
}

/** sg-lock: rows default to DENY; flip the ones that must ALLOW. */
async function solveSg(page, allowRows) {
  for (const r of allowRows) {
    await page.locator('.sglk-row:not(.sglk-hdr) .sglk-toggle').nth(r).click();
    await page.waitForTimeout(80);
  }
  await page.locator('.sglk-btn').click();
}

/** image-prompt-lock: fill each commission's three traits and generate. */
async function solveImagePrompt(page, commissions) {
  for (const c of commissions) {
    await page.locator('.iplk-tab', { hasText: c.noble }).click();
    await page.waitForTimeout(120);
    for (const trait of [c.color, c.material, c.style]) {
      await page.locator('.iplk-opt', { hasText: new RegExp(`^${trait}$`) }).click();
      await page.waitForTimeout(80);
    }
    await page.locator('.iplk-btn').click();
    await page.waitForTimeout(300);
  }
}

/** equipment-rack-lock: switch a slot OFF by the name shown on its row. */
async function disableRackRow(page, name) {
  const names = await page.locator('.eqrk-name').allTextContents();
  const at = names.findIndex(n => n.includes(name));
  if (at === -1) throw new Error(`rack row "${name}" not found in ${JSON.stringify(names)}`);
  await page.locator('.eqrk-row').nth(at).locator('.eqrk-toggle').click();
  await page.waitForTimeout(100);
}

/** equipment-rack-lock: tap row A then row B to move A into B's slot. */
async function moveRackRow(page, name, toPos) {
  const names = await page.locator('.eqrk-name').allTextContents();
  const from = names.findIndex(n => n.includes(name));
  if (from === -1) throw new Error(`rack row "${name}" not found in ${JSON.stringify(names)}`);
  if (from === toPos) return;
  await page.locator('.eqrk-row').nth(from).click();
  await page.waitForTimeout(80);
  await page.locator('.eqrk-row').nth(toPos).click();
  await page.waitForTimeout(120);
}

// ── the playthrough ──────────────────────────────────────────────────

test.describe('EP3 — The King\'s Errand (full playthrough, real puzzle UIs)', () => {
  test.setTimeout(240000);

  test('plays from the Throne Room to the ending without engine bypasses', async ({ page }) => {
    const jsErrors = [];
    page.on('pageerror', e => jsErrors.push(e.message));

    await setupEpisode(page, EP3, { playerName: 'E2E Steward' });

    // ── Throne Room ──────────────────────────────────────────────
    await talk(page, 'Talk to King Aldric');          // awards King's Orders (#104)
    expect(await inv(page, 104), 'King\'s Orders in inventory').toBe(true);
    await talk(page, 'Talk to Pip');
    await look(page, 'Examine the rank tapestry');
    await look(page, 'Read the festival program');
    await act(page, 'Go to the Steward\'s Study');
    await closePopup(page);

    // ── Steward's Study — first-command (terminal-lock) ───────────
    await look(page, 'Read Pip\'s Handbook');
    await look(page, 'Check the Errand Board');
    await look(page, 'Study the Knight Rank Chart');
    // The rack must NOT be offered here — it is a Proving Ground puzzle.
    await expect(page.locator('.discoveries')).not.toContainText('Equipment Rack');
    await act(page, 'Issue your first command');
    await solveTerminal(page, 'fetch schedule', 'fetch schedule from notice board');
    await settle(page, 205);
    expect(await solved(page, 'first-command')).toBe(true);

    // ── Castle Kitchen — quest setup ─────────────────────────────
    await act(page, 'Go to the Castle Kitchen');
    await closePopup(page);
    await talk(page, 'Talk to Greta');                // awards Greta's Plea (#301)
    await look(page, 'Examine the recipe archive');
    await look(page, 'Look at Greta\'s cooking pot');

    // ── Castle Gate — gate-wiring (wire-lock) ────────────────────
    await goToRoom(page, 200);
    await act(page, 'Go to the Castle Gate');
    await closePopup(page);
    await talk(page, 'Talk to the Gate Warden');
    await look(page, 'Examine the gate conduits');
    await act(page, 'Wire the conduits');
    await solveWires(page, [['translation', 'sonic'], ['tradeledger', 'inventory'], ['currency', 'treasury']]);
    await settle(page, 501);
    expect(await inv(page, 505), 'Scout Badge awarded with the Gate Pass').toBe(true);

    // ── Bedrock Bazaar — bazaar-recruit (bazaar-lock) ─────────────
    await act(page, 'Go to the Bedrock Bazaar');
    await closePopup(page);
    await look(page, 'Collect the Bazaar Token');
    await look(page, 'Read the merchant stall directory');
    await talk(page, 'Talk to the Nova Company Clerk');
    await talk(page, 'Talk to the Meta Captain');
    await act(page, 'Recruit an ally for the Kitchen');
    await solveBazaar(page, 'anthropic');
    await settle(page, 605);

    // combination: the recruited ally meets the archive
    await combine(page, 'Ally Contract', 'Recipe Archive');
    await closePopup(page);

    // ── Kitchen again — recipe-sort (prompt-lock) ─────────────────
    await goToRoom(page, 300);
    await act(page, 'Send your ally into the recipe archive');
    await solvePrompt(page, ['Find', 'the feast menu', 'in the recipe archive', 'sorted by course order']);
    await settle(page, 306);

    // ── Foreign Quarter — three deck battles ─────────────────────
    await goToRoom(page, 600);
    await act(page, 'Go to the Foreign Quarter');
    await closePopup(page);
    await talk(page, 'Talk to Ambassador Kael');
    await talk(page, 'Talk to the Tongue of Babel');   // awards contract (#705)
    await look(page, 'Examine the foreign trade ledger');

    await act(page, 'Negotiate with Spice Trader');
    await solveDeckBattle(page, 'spice trader');
    await settle(page, 706);

    await act(page, 'Negotiate with Silk Merchant');
    await solveDeckBattle(page, 'silk merchant');
    await settle(page, 707);

    await act(page, 'Negotiate with Fireworks Master');
    await solveDeckBattle(page, 'fireworks master');
    await settle(page, 708);

    // ── Entertainment Guild — kings-seal + stage-assign ──────────
    await goToRoom(page, 600);
    await act(page, 'Go to the Entertainment Guild');
    await closePopup(page);
    await talk(page, 'Talk to Mistress Thornbury');    // awards Thornbury's List (#803)
    await talk(page, 'Talk to the Master Artificer');
    await look(page, 'Examine the performance stage model');

    await act(page, 'Write the King\'s Seal');
    await solveScroll(page, ['book', '50', 'forbidden', 'all']);
    await settle(page, 806);

    await act(page, 'Assign performers to stages');
    await solveBookingRun(page, ['50', 'bard', 'jugglers', 'royal-choir']);
    await settle(page, 809);

    // Marshal rank now grants an audience the Bazaar refused earlier.
    await goToRoom(page, 600);
    await talk(page, 'Talk to the Anthropic Scholar');

    // ── Chronicle Hall — memory-timeline ─────────────────────────
    await goToRoom(page, 200);
    await act(page, 'Go to the Chronicle Hall');
    await closePopup(page);
    await talk(page, 'Talk to the Chronicler');
    await look(page, 'Examine the memory crystal display');
    await look(page, 'Examine the chronicle shelves');
    // Scroll #4 must arrive with the shelves, i.e. BEFORE the puzzle it explains.
    expect(await page.evaluate(() => engine.revealedCards.has(407)), 'Scroll #4 revealed pre-puzzle').toBe(true);
    await look(page, 'Collect the memory crystals');
    await act(page, 'Reconstruct last year\'s festival');
    await solveTimeline(page, ['Spring Fair', 'Summer Tourney', 'shared the north row', 'moved to west stalls', 'Final layout', 'Winter Solstice']);
    await settle(page, 406);

    // ── Noble Quarter — code-of-honor + stall-design ─────────────
    await goToRoom(page, 600);
    await act(page, 'Go to the Noble Quarter');
    await closePopup(page);
    await talk(page, 'Talk to Lord Ashford');
    await talk(page, 'Talk to Lady Birch');
    await talk(page, 'Talk to the Court Painter');
    await look(page, 'Examine the stall layout map');
    await look(page, 'Read the Code of Honor tablet');

    await act(page, 'Configure the Code of Honor');
    await solveSg(page, [3]);                          // only "Factual Historical References" allows
    await settle(page, 906);

    // combination: evidence presented under the Code
    await combine(page, 'Chronicle Report', 'Stall Layout Map');
    await closePopup(page);

    await act(page, 'Match stall designs to houses');
    await solveImagePrompt(page, [
      { noble: 'Lord Ashford', color: 'crimson', material: 'oak', style: 'bold' },
      { noble: 'Lady Birch', color: 'emerald', material: 'willow', style: 'elegant' },
      { noble: 'Shared Row', color: 'gold', material: 'iron', style: 'neutral' },
    ]);
    await settle(page, 909);

    // ── Proving Ground — assembly + rehearsal ────────────────────
    await goToRoom(page, 600);
    await act(page, 'Go to the Proving Ground');
    await closePopup(page);
    await talk(page, 'Talk to Sir Cedric');
    await look(page, 'Examine the Champion Assembly Rack');

    // Assembly: the Ledger is left on the platform, so numbers stay hidden.
    // Three slots belong to no errand and drag the score to 21 — the only way
    // through blind is reading the names, not the numbers.
    await act(page, 'Assemble the Champion');
    await expect(page.locator('.eqrk-row')).toHaveCount(10);
    for (const junk of ['Untested Shortcut', 'Unlogged Action', 'Borrowed Confidence']) {
      await disableRackRow(page, junk);
    }
    await page.locator('.eqrk-btn', { hasText: 'Deploy' }).click();
    await settle(page, 1009);

    // Rehearsal: take the Ledger now, so both racks read observability_card 1005
    // as satisfied and the score renders for the rest of this run.
    await look(page, 'Examine the Herald\'s Ledger');
    // Disabling the junk gets 73, which is not Soars — the flats must also
    // come before the multipliers. Numbers are visible now to verify it.
    await act(page, 'Run the rehearsal');
    await expect(page.locator('.eqrk-row')).toHaveCount(10);
    for (const junk of ['Untested Shortcut', 'Unlogged Action', 'Borrowed Confidence']) {
      await disableRackRow(page, junk);
    }
    await moveRackRow(page, 'Foundation Model Core', 9);
    await moveRackRow(page, 'Cedar Seal', 9);
    await moveRackRow(page, 'Guardrail Mantle', 9);
    await page.locator('.eqrk-btn', { hasText: 'Deploy' }).click();
    await expect(page.locator('.eqrk-score')).toContainText('128');

    // ── Ending ───────────────────────────────────────────────────
    await expect
      .poll(() => page.evaluate(() => engine.completed && engine.finished), { timeout: 15000 })
      .toBe(true);

    const final = await page.evaluate(() => ({
      solved: engine.solvedPuzzles.size,
      unsolved: Object.keys(engine.puzzles).filter(p => !engine.solvedPuzzles.has(p)),
      rooms: engine.unlockedRooms.length,
      score: engine.getScore(),
    }));
    expect(final.rooms, 'all ten rooms visited').toBe(10);
    expect(final.unsolved, `every puzzle solved (missing: ${final.unsolved.join(', ')})`).toEqual([]);
    expect(final.solved, 'all thirty puzzles solved').toBe(30);
    expect(final.score.stars, 'a clean run should earn 3+ stars').toBeGreaterThanOrEqual(3);
    expect(jsErrors, 'no JavaScript errors during the run').toEqual([]);
  });
});
