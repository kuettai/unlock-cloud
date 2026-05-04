// @ts-check
const { test, expect } = require('@playwright/test');

const EP0_URL = '/app/index.html?scenario=../scenarios/aws/ep0-boot-sequence';

/** Close the discover popup */
async function closePopup(page) {
  const popup = page.locator('#discover-popup.open');
  if (await popup.isVisible()) {
    await popup.click({ position: { x: 10, y: 10 } });
    await popup.waitFor({ state: 'hidden', timeout: 3000 });
  }
}

/** Close the puzzle popup */
async function closePuzzlePopup(page) {
  const popup = page.locator('#puzzle-popup.open');
  if (await popup.isVisible()) {
    await page.locator('#puzzle-popup .panel-close').click();
    await popup.waitFor({ state: 'hidden', timeout: 3000 });
  }
}

/** Navigate to a room via the map */
async function goToRoom(page, roomId) {
  await page.evaluate((id) => { openMap(); goToRoom(id); }, roomId);
  await page.waitForTimeout(800);
}

/** Enter combine mode, select items, click Use */
async function combine(page, itemTitle, objectTitle) {
  await page.locator('#btn-combine-mode').click();
  await page.locator('#combine-screen.active').waitFor();
  await page.locator('#combine-items .card', { hasText: itemTitle }).click();
  await page.locator('#combine-objects .card', { hasText: objectTitle }).click();
  await page.locator('#combine-btn').click();
  await page.waitForTimeout(500);
}

test.describe('EP0 — Boot Sequence (Browser)', () => {

  test('Full happy path', async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto(EP0_URL, { waitUntil: 'networkidle' });

    // Wait for engine to load
    await expect(page.locator('#intro-screen h2')).toContainText('Boot Sequence', { timeout: 10000 });

    // Start the game
    await page.evaluate(() => startGame());
    await expect(page.locator('.room-title')).toBeVisible({ timeout: 10000 });

    // --- Start Chamber ---
    await expect(page.locator('.room-title')).toContainText('Start Chamber');

    // Solve jigsaw via engine, discover box
    await page.locator('.discover-btn', { hasText: 'Examine the box' }).click();
    await expect(page.locator('#puzzle-popup.open')).toBeVisible();
    await page.evaluate(() => { engine.solvedPuzzles.add('jigsaw-box'); engine.discoverCard(2); });
    await closePuzzlePopup(page);
    await page.evaluate(() => renderGame());

    // Discover chip
    await page.locator('.discover-btn', { hasText: 'Pick up the small chip' }).click();
    await closePopup(page);

    // Combine: Key Chip + Locked Box
    await combine(page, 'Key Chip', 'Locked Box');
    await closePopup(page);

    // --- Sequence Room ---
    await goToRoom(page, 20);
    await expect(page.locator('.room-title')).toContainText('Sequence Room');

    // Solve sequence via engine
    await page.locator('.discover-btn', { hasText: 'Interact with the grid' }).click();
    await expect(page.locator('#puzzle-popup.open')).toBeVisible();
    await page.evaluate(() => { engine.solvedPuzzles.add('seq-grid'); engine.discoverCard(33); });
    await closePuzzlePopup(page);
    await page.evaluate(() => renderGame());
    await closePopup(page);

    // --- Combination Room ---
    await goToRoom(page, 10);
    await expect(page.locator('.room-title')).toContainText('Combination Room');

    // Discover Power Cell
    await page.locator('.discover-btn', { hasText: 'Take the power cell' }).click();
    await closePopup(page);

    // Solve wire puzzle via engine, discover Device
    await page.locator('.discover-btn', { hasText: 'Inspect the device' }).click();
    await expect(page.locator('#puzzle-popup.open')).toBeVisible();
    await page.evaluate(() => { engine.solvedPuzzles.add('wire-device'); engine.discoverCard(12); });
    await closePuzzlePopup(page);
    await page.evaluate(() => renderGame());
    await closePopup(page);

    // Combine: Power Cell + Device → Charged Cell
    await combine(page, 'Power Cell', 'Device');
    await closePopup(page);

    // Open passage to Hidden Room (requires #33 + #16)
    await page.locator('.discover-btn', { hasText: 'Open the passage' }).click();
    await page.waitForTimeout(800);

    // --- Hidden Room ---
    await expect(page.locator('.room-title')).toContainText('Hidden Room');

    // Enter hidden number 42
    await page.locator('input[id^="hidden-input-"]').fill('42');
    await page.locator('button', { hasText: 'Look up' }).click();
    await closePopup(page);

    // Solve morse via engine, discover Code Room
    await page.locator('.discover-btn', { hasText: 'Access the Code Room' }).click();
    await expect(page.locator('#puzzle-popup.open')).toBeVisible();
    await page.evaluate(() => { engine.solvedPuzzles.add('morse-go'); engine.discoverCard(50); });
    await closePuzzlePopup(page);
    await page.evaluate(() => renderGame());

    // --- Code Room ---
    await expect(page.locator('.room-title')).toContainText('Code Room');

    // Solve word lock via engine → ending
    await page.evaluate(() => { engine.solvedPuzzles.add('base64-decode'); engine.revealCard(99); renderGame(); });

    // --- End Screen ---
    await expect(page.locator('#end-screen')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#end-title')).toContainText('complete', { ignoreCase: true });
  });
});
