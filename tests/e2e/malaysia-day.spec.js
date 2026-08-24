// @ts-check
/**
 * Playtest: Selamat Hari Malaysia (corporate/malaysia-day)
 * Each award room now has TWO sequential puzzles. Puzzle 1 reveals puzzle 2
 * (gated by requires_item on puzzle-1 success card); puzzle 2 awards the
 * trophy and auto-advances to the next room.
 */
const { test, expect } = require('@playwright/test');
const {
  setupEpisode,
  assertEndScreen,
  closePopup,
  discover,
  solvePuzzle,
} = require('./helpers');

const EPISODE_URL = '/app/index.html?scenario=../scenarios/corporate/malaysia-day&mode=guest';
const INTRO_TEXT = 'Selamat Hari Malaysia';

test.describe('Selamat Hari Malaysia (Browser)', () => {

  test('Full happy path — two puzzles per room → win', async ({ page }) => {
    await setupEpisode(page, EPISODE_URL, { introText: INTRO_TEXT });
    await expect(page.locator('.room-title')).toContainText('The Office');

    // Office → first station
    await discover(page, 200);
    expect(await page.evaluate(() => engine.currentRoom)).toBe(200);

    // Room 2: puzzle 1 (wire) then puzzle 2 (jigsaw) → trophy + advance
    await solvePuzzle(page, 'match-peer', 205);
    // second puzzle discovery should now be available (gated on 205)
    let d = await page.evaluate(() => engine.getAllDiscoveriesInRoom());
    expect(d.find(x => x.card_id === 215)?.available).toBe(true);
    await solvePuzzle(page, 'jigsaw-peer', 215);
    expect(await page.evaluate(() => engine.inventory)).toContain(201);
    expect(await page.evaluate(() => engine.currentRoom)).toBe(300);

    // Room 3: keypad then wager quiz
    await solvePuzzle(page, 'height-achiever', 305);
    d = await page.evaluate(() => engine.getAllDiscoveriesInRoom());
    expect(d.find(x => x.card_id === 315)?.available).toBe(true);
    await solvePuzzle(page, 'quiz-achiever', 315);
    expect(await page.evaluate(() => engine.inventory)).toContain(301);
    expect(await page.evaluate(() => engine.currentRoom)).toBe(400);

    // Room 4: word then blind sequence
    await solvePuzzle(page, 'word-boundaries', 405);
    d = await page.evaluate(() => engine.getAllDiscoveriesInRoom());
    expect(d.find(x => x.card_id === 415)?.available).toBe(true);
    await solvePuzzle(page, 'sequence-boundaries', 415);
    expect(await page.evaluate(() => engine.inventory)).toContain(401);
    expect(await page.evaluate(() => engine.currentRoom)).toBe(500);

    // Finale
    await solvePuzzle(page, 'final-malaysiaday', 599);
    await assertEndScreen(page, 'Selamat Hari Malaysia', { ignoreCase: true });
  });

  test('Second puzzle is gated until the first is solved', async ({ page }) => {
    await setupEpisode(page, EPISODE_URL, { introText: INTRO_TEXT });
    await discover(page, 200);

    // In room 2 before solving puzzle 1: jigsaw (215) not available
    let d = await page.evaluate(() => engine.getAllDiscoveriesInRoom());
    expect(d.find(x => x.card_id === 215)?.available).toBeFalsy();
    // wire puzzle (205) IS available
    expect(d.find(x => x.card_id === 205)?.available).toBe(true);

    // Solve puzzle 1 → puzzle 2 unlocks, but trophy NOT yet awarded
    await solvePuzzle(page, 'match-peer', 205);
    expect(await page.evaluate(() => engine.inventory)).not.toContain(201);
    d = await page.evaluate(() => engine.getAllDiscoveriesInRoom());
    expect(d.find(x => x.card_id === 215)?.available).toBe(true);
  });

  test('UI: all seven puzzle popups mount with correct components', async ({ page }) => {
    await setupEpisode(page, EPISODE_URL, { introText: INTRO_TEXT });
    const cfgUi = await page.evaluate(() => ({
      p1: engine.puzzles['match-peer'].ui,
      p1b: engine.puzzles['jigsaw-peer'].ui,
      p2: engine.puzzles['height-achiever'].ui,
      p2b: engine.puzzles['quiz-achiever'].ui,
      p3: engine.puzzles['word-boundaries'].ui,
      p3b: engine.puzzles['sequence-boundaries'].ui,
      pf: engine.puzzles['final-malaysiaday'].ui,
    }));
    expect(cfgUi).toEqual({
      p1: 'wire-lock', p1b: 'jigsaw-lock',
      p2: 'keypad-lock', p2b: 'wager-lock',
      p3: 'word-lock', p3b: 'pillar-lock',
      pf: '4digits-lock',
    });
  });
});
