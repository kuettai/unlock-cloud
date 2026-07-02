// @ts-check
/**
 * TEMPLATE: Episode E2E Test
 *
 * Copy this file and rename it to match your episode (e.g., bible-ep3.spec.js).
 * Replace the placeholder values below with your episode's scenario path,
 * room IDs, card IDs, and puzzle IDs.
 *
 * Two testing approaches are shown:
 *
 * 1. ENGINE BYPASS (recommended for most tests):
 *    Uses helpers like discover(), solvePuzzle(), revealCard() to directly
 *    manipulate game state via the engine. This is faster, more stable,
 *    and tests the game-logic flow without depending on puzzle UI details.
 *    Use this when you want to verify: room unlock order, card gating,
 *    narrative progression, and end-screen conditions.
 *
 * 2. REAL UI CLICKS (for targeted interaction tests):
 *    Uses page.locator(...).click() to interact with actual discover buttons,
 *    puzzle UIs, and combine screens. This tests that the UI is wired up
 *    correctly. Use this when you want to verify: button visibility,
 *    popup behavior, puzzle input handling, and combine-mode flow.
 *
 * Most tests should use engine bypass for speed, with a small number of
 * targeted tests exercising the real UI for critical interactions.
 */

const { test, expect } = require('@playwright/test');
const {
  setupEpisode,
  assertEndScreen,
  closePopup,
  closePuzzlePopup,
  goToRoom,
  discover,
  solvePuzzle,
  combine,
  revealCard,
} = require('./helpers');

// --- Episode configuration ---
const EPISODE_URL = '/app/index.html?scenario=../scenarios/CATEGORY/EPISODE-SLUG';
const EPISODE_INTRO_TEXT = 'Episode Title'; // Text shown in intro screen h2

test.describe('Episode Title (Browser)', () => {

  // =========================================================================
  // APPROACH 1: Engine bypass — full happy path
  // =========================================================================
  // This test uses engine-bypass helpers to quickly advance through all rooms.
  // It verifies the overall game progression and end-screen without testing
  // individual puzzle UIs.
  test('Full happy path (engine bypass)', async ({ page }) => {
    // Setup: clear state, navigate, start game
    await setupEpisode(page, EPISODE_URL, {
      introText: EPISODE_INTRO_TEXT,
      playerName: 'TestPlayer', // Omit this line if episode has no name input
    });

    // --- Room 1 (starting room) ---
    await expect(page.locator('.room-title')).toContainText('Room 1 Name');
    await discover(page, 101); // Card description
    await discover(page, 102); // Another card
    await solvePuzzle(page, 'puzzle-id-1', 110); // Puzzle → unlocks Room 2

    // --- Room 2 ---
    await goToRoom(page, 20);
    await expect(page.locator('.room-title')).toContainText('Room 2 Name');
    await discover(page, 201);
    await solvePuzzle(page, 'puzzle-id-2', 210); // Puzzle → unlocks Room 3

    // --- Room 3 (final room) ---
    await goToRoom(page, 30);
    await expect(page.locator('.room-title')).toContainText('Room 3 Name');
    await solvePuzzle(page, 'final-puzzle', 999); // Final puzzle → ending

    // --- End Screen ---
    await assertEndScreen(page, 'Victory Text');
  });

  // =========================================================================
  // APPROACH 2: Real UI clicks — testing specific interactions
  // =========================================================================
  // This test exercises actual UI elements: clicking discover buttons,
  // interacting with puzzle popups, and using the combine screen.
  // Use this pattern for a focused subset of interactions you want to
  // verify at the UI level.
  test('UI interaction: puzzle and combine flow', async ({ page }) => {
    await setupEpisode(page, EPISODE_URL, {
      introText: EPISODE_INTRO_TEXT,
      playerName: 'TestPlayer',
    });

    // --- Real discover button click ---
    // Click the actual discover button in the DOM (tests button visibility/wiring)
    await page.locator('.discover-btn', { hasText: 'Examine the object' }).click();
    await closePopup(page);

    // --- Real puzzle interaction with engine solve ---
    // Click discover button to open puzzle popup, then solve via engine
    // (avoids brittle puzzle-UI assertions while still testing popup opens)
    await page.locator('.discover-btn', { hasText: 'Solve the puzzle' }).click();
    await expect(page.locator('#puzzle-popup.open')).toBeVisible();
    await page.evaluate(() => {
      engine.solvedPuzzles.add('puzzle-id-1');
      engine.discoverCard(110);
    });
    await closePuzzlePopup(page);
    await page.evaluate(() => renderGame());

    // --- Real combine interaction ---
    // Tests the combine-mode UI flow: open combine screen, select items, use
    await combine(page, 'Item Name', 'Object Name');
    await closePopup(page);
  });

  // =========================================================================
  // APPROACH 3: Gating / unlock-order test
  // =========================================================================
  // Verifies that rooms and discoveries unlock in the correct order.
  // Uses engine bypass for speed but checks engine state directly.
  test('Rooms unlock in correct order', async ({ page }) => {
    await setupEpisode(page, EPISODE_URL, {
      introText: EPISODE_INTRO_TEXT,
      playerName: 'TestPlayer',
    });

    // Only starting room unlocked initially
    const rooms = await page.evaluate(() => engine.unlockedRooms);
    expect(rooms).toEqual([1]);

    // Solve first puzzle → Room 2 unlocks
    await solvePuzzle(page, 'puzzle-id-1', 110);
    const rooms1 = await page.evaluate(() => engine.unlockedRooms);
    expect(rooms1).toContain(20);

    // Solve second puzzle → Room 3 unlocks
    await goToRoom(page, 20);
    await solvePuzzle(page, 'puzzle-id-2', 210);
    const rooms2 = await page.evaluate(() => engine.unlockedRooms);
    expect(rooms2).toContain(30);
  });

  // =========================================================================
  // APPROACH 4: Discovery gating test
  // =========================================================================
  // Verifies that certain discoveries are gated behind prerequisites.
  test('Discoveries gated correctly', async ({ page }) => {
    await setupEpisode(page, EPISODE_URL, {
      introText: EPISODE_INTRO_TEXT,
      playerName: 'TestPlayer',
    });

    // Fast-forward to the room with gated content
    await solvePuzzle(page, 'puzzle-id-1', 110);
    await goToRoom(page, 20);

    // Before prerequisite: gated discovery NOT available
    let discoveries = await page.evaluate(() => engine.getAllDiscoveriesInRoom());
    const gatedBefore = discoveries.find(d => d.card_id === 250);
    expect(gatedBefore?.available).toBeFalsy();

    // Fulfill prerequisite
    await discover(page, 201);

    // After prerequisite: gated discovery IS available
    discoveries = await page.evaluate(() => engine.getAllDiscoveriesInRoom());
    const gatedAfter = discoveries.find(d => d.card_id === 250);
    expect(gatedAfter?.available).toBe(true);
  });
});
