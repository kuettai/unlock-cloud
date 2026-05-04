// @ts-check
const { test, expect } = require('@playwright/test');

const EP1_URL = '/app/index.html?scenario=../scenarios/bible-jesus-miracles/ep1-philips-impossible-math';

async function closePopup(page) {
  const popup = page.locator('#discover-popup.open');
  if (await popup.isVisible({ timeout: 1000 }).catch(() => false)) {
    await popup.click({ position: { x: 10, y: 10 } });
    await popup.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
  }
}

async function closePuzzlePopup(page) {
  const popup = page.locator('#puzzle-popup.open');
  if (await popup.isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.locator('#puzzle-popup .panel-close').click();
    await popup.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
  }
}

async function goToRoom(page, roomId) {
  await page.evaluate((id) => { openMap(); goToRoom(id); }, roomId);
  await page.waitForTimeout(600);
}

/** Discover a card + close popup */
async function discover(page, cardId) {
  await page.evaluate((id) => {
    const card = engine.discoverCard(id);
    renderGame();
  }, cardId);
  await page.waitForTimeout(300);
  await closePopup(page);
}

/** Solve a puzzle via engine */
async function solvePuzzle(page, puzzleId, cardId) {
  await page.evaluate(({ pid, cid }) => {
    engine.solvedPuzzles.add(pid);
    engine.discoverCard(cid);
    renderGame();
  }, { pid: puzzleId, cid: cardId });
  await page.waitForTimeout(300);
  await closePopup(page);
}

test.describe('Bible EP1 — Philip\'s Impossible Math (Browser)', () => {

  test('Full happy path', async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto(EP1_URL, { waitUntil: 'networkidle' });
    await expect(page.locator('#intro-screen h2')).toContainText('Impossible Math', { timeout: 10000 });
    await page.evaluate(() => startGame());
    await expect(page.locator('.room-title')).toBeVisible({ timeout: 10000 });

    // --- The Hillside (#100) ---
    await expect(page.locator('.room-title')).toContainText('Hillside');
    await discover(page, 102); // Philip's Calculation
    await discover(page, 103); // Distant Markets
    await solvePuzzle(page, 'crowd-counter', 113); // → unlocks The Crowd

    // --- The Crowd (#120) ---
    await goToRoom(page, 120);
    await expect(page.locator('.room-title')).toContainText('Crowd');
    await discover(page, 121); // Families NPC
    await discover(page, 122); // Merchant NPC
    await discover(page, 123); // Judas NPC
    await solvePuzzle(page, 'denarii-math', 133); // → unlocks Boy's Basket + Arrangement

    // --- The Boy's Basket (#140) ---
    await goToRoom(page, 140);
    await expect(page.locator('.room-title')).toContainText('Boy');
    await discover(page, 141); // Andrew NPC
    await discover(page, 143); // Boy's Trust
    await solvePuzzle(page, 'offering-table', 153); // → The Offering

    // --- The Arrangement (#160) ---
    await goToRoom(page, 160);
    await expect(page.locator('.room-title')).toContainText('Arrangement');
    await discover(page, 162); // Group Tally
    await solvePuzzle(page, 'crowd-seating', 173); // → Crowd Arranged

    // --- The Blessing (#180) ---
    await goToRoom(page, 180);
    await expect(page.locator('.room-title')).toContainText('Blessing');
    await discover(page, 182); // Endless Basket (requires #155 + #174)
    await solvePuzzle(page, 'bread-break', 195); // (requires #182 + #143)
    await solvePuzzle(page, 'supply-run', 193); // → unlocks Hillside After

    // --- The Hillside After (#200) ---
    await goToRoom(page, 200);
    await expect(page.locator('.room-title')).toContainText('Hillside');
    await discover(page, 203); // Crowd's Declaration
    await solvePuzzle(page, 'hidden-baskets', 202); // Twelve Baskets
    await solvePuzzle(page, 'prophet-word', 218); // PROPHET
    await solvePuzzle(page, 'hebrew-sign', 222); // אות → ending

    // --- End Screen ---
    await expect(page.locator('#end-screen')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#end-title')).toContainText('Investigation Complete');

    // Verify scripture fragments
    await expect(page.locator('#end-lore')).toContainText('Scripture Fragments');
  });
});
