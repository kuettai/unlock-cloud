// @ts-check
/**
 * Shared E2E test helpers for Unlock Cloud Playwright specs.
 *
 * These helpers encapsulate the common patterns used across all episode
 * E2E tests, providing both UI-interaction utilities and engine-bypass
 * shortcuts for rapid game-state manipulation.
 */

const { expect } = require('@playwright/test');

/**
 * Close the discover popup if it is currently open.
 * This is called after discovering a card or combining items.
 *
 * @param {import('@playwright/test').Page} page - Playwright page instance
 */
async function closePopup(page) {
  const popup = page.locator('#discover-popup.open');
  if (await popup.isVisible({ timeout: 1000 }).catch(() => false)) {
    await popup.click({ position: { x: 10, y: 10 } });
    await popup.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
  }
}

/**
 * Close the puzzle popup if it is currently open.
 * This is called after solving or dismissing a puzzle.
 *
 * @param {import('@playwright/test').Page} page - Playwright page instance
 */
async function closePuzzlePopup(page) {
  const popup = page.locator('#puzzle-popup.open');
  if (await popup.isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.locator('#puzzle-popup .panel-close').click();
    await popup.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
  }
}

/**
 * Navigate to a room via the in-game map.
 * Uses engine globals `openMap()` and `goToRoom()` to bypass UI navigation.
 *
 * @param {import('@playwright/test').Page} page - Playwright page instance
 * @param {number} roomId - The numeric room identifier
 */
async function goToRoom(page, roomId) {
  await page.evaluate((id) => { openMap(); goToRoom(id); }, roomId);
  await page.waitForTimeout(600);
}

/**
 * Discover a card via the engine and dismiss the resulting popup.
 * This bypasses clicking a discover button in the UI and directly
 * triggers the card discovery through the game engine.
 *
 * @param {import('@playwright/test').Page} page - Playwright page instance
 * @param {number} cardId - The card ID to discover
 */
async function discover(page, cardId) {
  await page.evaluate((id) => { engine.discoverCard(id); renderGame(); }, cardId);
  await page.waitForTimeout(300);
  await closePopup(page);
}

/**
 * Solve a puzzle via the engine, discover the resulting card, and dismiss popups.
 * This bypasses the actual puzzle UI and directly marks the puzzle as solved.
 *
 * @param {import('@playwright/test').Page} page - Playwright page instance
 * @param {string} puzzleId - The puzzle identifier string (e.g., 'door-code')
 * @param {number} cardId - The card ID revealed upon solving the puzzle
 */
async function solvePuzzle(page, puzzleId, cardId) {
  await page.evaluate(({ pid, cid }) => {
    engine.solvedPuzzles.add(pid);
    engine.discoverCard(cid);
    renderGame();
  }, { pid: puzzleId, cid: cardId });
  await page.waitForTimeout(300);
  await closePopup(page);
}

/**
 * Enter combine mode, select an item and an object, then click Use.
 * This tests the actual combine UI flow (not an engine bypass).
 *
 * @param {import('@playwright/test').Page} page - Playwright page instance
 * @param {string} itemTitle - Display text of the item card to select
 * @param {string} objectTitle - Display text of the object card to select
 */
async function combine(page, itemTitle, objectTitle) {
  await page.locator('#btn-combine-mode').click();
  await page.locator('#combine-screen.active').waitFor();
  await page.locator('#combine-items .card', { hasText: itemTitle }).click();
  await page.locator('#combine-objects .card', { hasText: objectTitle }).click();
  await page.locator('#combine-btn').click();
  await page.waitForTimeout(500);
}

/**
 * Reveal a card via the engine without triggering discovery popups.
 * Useful for gate cards or narrative progression flags that are not
 * tied to a puzzle or discovery button.
 *
 * @param {import('@playwright/test').Page} page - Playwright page instance
 * @param {number} cardId - The card ID to reveal
 */
async function revealCard(page, cardId) {
  await page.evaluate((id) => { engine.revealCard(id); renderGame(); }, cardId);
  await page.waitForTimeout(200);
}

/**
 * Set up an episode for testing: clear state, navigate, wait for intro,
 * optionally fill player name, start the game, and wait for the first room.
 *
 * @param {import('@playwright/test').Page} page - Playwright page instance
 * @param {string} url - The episode URL path (e.g., '/app/index.html?scenario=...')
 * @param {object} [options] - Setup options
 * @param {string} [options.playerName] - If provided, fills the player name input before starting
 * @param {string} [options.introText] - Text to expect in the intro screen h2 (used for verification)
 * @param {number} [options.timeout] - Timeout for waiting on intro/room (default: 10000)
 */
async function setupEpisode(page, url, options = {}) {
  const { playerName, introText, timeout = 10000 } = options;

  // Clear any saved game state
  await page.addInitScript(() => localStorage.clear());

  // Navigate to the episode
  await page.goto(url, { waitUntil: 'networkidle' });

  // Wait for the intro screen to be ready
  if (introText) {
    await expect(page.locator('#intro-screen h2')).toContainText(introText, { timeout });
  } else {
    await expect(page.locator('#intro-screen h2')).toBeVisible({ timeout });
  }

  // Optionally fill player name
  if (playerName) {
    await page.fill('input[placeholder*="name"]', playerName);
  }

  // Start the game
  await page.evaluate(() => startGame());

  // Wait for the first room to render
  await expect(page.locator('.room-title')).toBeVisible({ timeout });
}

/**
 * Assert that the end screen is displayed with the expected title text.
 *
 * @param {import('@playwright/test').Page} page - Playwright page instance
 * @param {string} titleText - Text expected in the #end-title element
 * @param {object} [options] - Assertion options
 * @param {boolean} [options.ignoreCase] - Whether to ignore case in comparison (default: false)
 * @param {number} [options.timeout] - Timeout for end screen visibility (default: 5000)
 */
async function assertEndScreen(page, titleText, options = {}) {
  const { ignoreCase = false, timeout = 5000 } = options;
  await expect(page.locator('#end-screen')).toBeVisible({ timeout });
  await expect(page.locator('#end-title')).toContainText(titleText, { ignoreCase });
}

module.exports = {
  closePopup,
  closePuzzlePopup,
  goToRoom,
  discover,
  solvePuzzle,
  combine,
  revealCard,
  setupEpisode,
  assertEndScreen,
};
