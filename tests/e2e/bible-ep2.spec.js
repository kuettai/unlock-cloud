// @ts-check
const { test, expect } = require('@playwright/test');

const EP2_URL = '/app/index.html?scenario=../scenarios/bible-jesus-miracles/ep2-153-fish';

async function closePopup(page) {
  const popup = page.locator('#discover-popup.open');
  if (await popup.isVisible({ timeout: 1000 }).catch(() => false)) {
    await popup.click({ position: { x: 10, y: 10 } });
    await popup.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
  }
}

async function goToRoom(page, roomId) {
  await page.evaluate((id) => { openMap(); goToRoom(id); }, roomId);
  await page.waitForTimeout(600);
}

async function discover(page, cardId) {
  await page.evaluate((id) => { engine.discoverCard(id); renderGame(); }, cardId);
  await page.waitForTimeout(300);
  await closePopup(page);
}

async function solvePuzzle(page, puzzleId, cardId) {
  await page.evaluate(({ pid, cid }) => {
    engine.solvedPuzzles.add(pid);
    engine.discoverCard(cid);
    renderGame();
  }, { pid: puzzleId, cid: cardId });
  await page.waitForTimeout(300);
  await closePopup(page);
}

async function revealCard(page, cardId) {
  await page.evaluate((id) => { engine.revealCard(id); renderGame(); }, cardId);
  await page.waitForTimeout(200);
}

test.describe('Bible EP2 — 153 Fish (Café 153)', () => {

  test('Full two-shift happy path', async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto(EP2_URL, { waitUntil: 'networkidle' });
    await expect(page.locator('#intro-screen h2')).toContainText('153 Fish', { timeout: 10000 });
    await page.fill('input[placeholder*="name"]', 'TestPlayer');
    await page.evaluate(() => startGame());
    await expect(page.locator('.room-title')).toBeVisible({ timeout: 10000 });

    // ═══ SHIFT 1: SETUP (forward) ═══

    // --- Back Door (#1) ---
    await expect(page.locator('.room-title')).toContainText('Back Door');
    await discover(page, 2);  // Store Room Key
    await discover(page, 3);  // Door Code Note
    await solvePuzzle(page, 'door-code', 10); // → unlocks Store Room

    // --- Store Room (#10) ---
    await goToRoom(page, 10);
    await expect(page.locator('.room-title')).toContainText('Store Room');
    await discover(page, 11); // Prep Checklist
    await discover(page, 13); // Milk Jug Labels
    await solvePuzzle(page, 'stock', 12); // → reveals Brew Station (#20)

    // --- Brew Station (#20) ---
    await goToRoom(page, 20);
    await expect(page.locator('.room-title')).toContainText('Brew Station');
    await discover(page, 21); // Manager's Note
    await discover(page, 22); // Shot Counter (000)
    await solvePuzzle(page, 'grinder', 23); // → reveals Service Counter (#30)

    // --- Service Counter (#30) ---
    await goToRoom(page, 30);
    await expect(page.locator('.room-title')).toContainText('Service Counter');
    await discover(page, 32); // Counter Setup
    await discover(page, 33); // POS Starting Balance
    await discover(page, 34); // Ice Count
    await solvePuzzle(page, 'chalkboard', 31); // → reveals The Floor (#40)

    // --- The Floor (#40) ---
    await goToRoom(page, 40);
    await expect(page.locator('.room-title')).toContainText('Floor');
    await discover(page, 41); // Tables Ready
    await discover(page, 42); // Corner Table (#5)
    await discover(page, 43); // Café Open → reveals card 44

    // ═══ ACT 2: THE RUSH ═══
    // Simulate serving 4 drinks (gate for final puzzle)
    await revealCard(page, 45); // "Drinks Served" card

    // ═══ SHIFT 2: CLOSING (reverse) ═══

    // --- The Floor: Find mystery cups ---
    await discover(page, 82); // Four Mystery Cups
    await discover(page, 83); // Cup Names (Simon, Thomas, Nathanael, James)

    // --- Service Counter: Evidence puzzle ---
    await goToRoom(page, 30);
    await discover(page, 77); // Cash Reconciliation
    await discover(page, 78); // Cup Count (21 washed)
    await solvePuzzle(page, 'cups', 80); // Evidence Complete → reveals 74, 75

    // --- Brew Station: Milk Jug puzzle ---
    await goToRoom(page, 20);
    await discover(page, 74); // Shot Counter (21)
    await solvePuzzle(page, 'milk-jug', 76); // Milk Jug Mystery Solved → reveals 70, 71, 72

    // --- The Floor: Names + Safe ---
    await goToRoom(page, 40);
    await solvePuzzle(page, 'names', 73); // The Names → reveals 90, 91

    // Final puzzle: The Safe (153)
    await solvePuzzle(page, 'safe', 999); // → ending

    // ═══ END SCREEN ═══
    await expect(page.locator('#end-screen')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#end-title')).toContainText('Net Holds');
  });

  test('Rooms unlock in correct order (Shift 1)', async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto(EP2_URL, { waitUntil: 'networkidle' });
    await page.fill('input[placeholder*="name"]', 'TestPlayer');
    await page.evaluate(() => startGame());
    await expect(page.locator('.room-title')).toBeVisible({ timeout: 10000 });

    // Only Back Door unlocked initially
    const rooms = await page.evaluate(() => engine.unlockedRooms);
    expect(rooms).toEqual([1]);

    // Solve door-code → Store Room unlocks
    await solvePuzzle(page, 'door-code', 10);
    const rooms1 = await page.evaluate(() => engine.unlockedRooms);
    expect(rooms1).toContain(10);

    // Solve stock → Brew Station unlocks
    await solvePuzzle(page, 'stock', 12);
    const rooms2 = await page.evaluate(() => engine.unlockedRooms);
    expect(rooms2).toContain(20);

    // Solve grinder → Service Counter unlocks
    await solvePuzzle(page, 'grinder', 23);
    const rooms3 = await page.evaluate(() => engine.unlockedRooms);
    expect(rooms3).toContain(30);

    // Solve chalkboard → The Floor unlocks
    await solvePuzzle(page, 'chalkboard', 31);
    const rooms4 = await page.evaluate(() => engine.unlockedRooms);
    expect(rooms4).toContain(40);
  });

  test('Act 3 discoveries gated correctly', async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto(EP2_URL, { waitUntil: 'networkidle' });
    await page.fill('input[placeholder*="name"]', 'TestPlayer');
    await page.evaluate(() => startGame());
    await expect(page.locator('.room-title')).toBeVisible({ timeout: 10000 });

    // Fast-forward to The Floor
    await solvePuzzle(page, 'door-code', 10);
    await solvePuzzle(page, 'stock', 12);
    await solvePuzzle(page, 'grinder', 23);
    await solvePuzzle(page, 'chalkboard', 31);
    await goToRoom(page, 40);

    // Before card 43: mystery cups NOT available
    let discoveries = await page.evaluate(() => engine.getAllDiscoveriesInRoom());
    const mysteryBefore = discoveries.find(d => d.card_id === 82);
    expect(mysteryBefore?.available).toBeFalsy();

    // Discover card 43 (Café Open) + serve 4 drinks
    await discover(page, 43);
    await revealCard(page, 45);

    // Now mystery cups available (requires card 45 = drinks served)
    discoveries = await page.evaluate(() => engine.getAllDiscoveriesInRoom());
    const mysteryAfter = discoveries.find(d => d.card_id === 82);
    expect(mysteryAfter?.available).toBe(true);

    // Evidence puzzle at counter requires card 82
    await goToRoom(page, 30);
    discoveries = await page.evaluate(() => engine.getAllDiscoveriesInRoom());
    const evidenceBefore = discoveries.find(d => d.card_id === 78);
    expect(evidenceBefore?.available).toBeFalsy();

    // Discover mystery cups → counter evidence unlocks
    await goToRoom(page, 40);
    await discover(page, 82);
    await goToRoom(page, 30);
    discoveries = await page.evaluate(() => engine.getAllDiscoveriesInRoom());
    const evidenceAfter = discoveries.find(d => d.card_id === 78);
    expect(evidenceAfter?.available).toBe(true);
  });
});
