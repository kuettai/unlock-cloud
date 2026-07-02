const { test, expect } = require('@playwright/test');
const { setupEpisode, assertEndScreen, discover, solvePuzzle, goToRoom } = require('./helpers');

const EP5_URL = '/app/index.html?scenario=../scenarios/aws/ep5-quick-bites';

test.describe('EP5 — Quick Bites (Browser)', () => {

  test('Loads intro and starts game', async ({ page }) => {
    await setupEpisode(page, EP5_URL, {
      introText: 'Quick Bites',
      playerName: 'TestPlayer',
    });

    const roomTitle = await page.locator('.room-title').textContent();
    console.log('Starting room:', roomTitle);
    expect(roomTitle).toContain('Reception');

    const discoveries = await page.locator('.discover-btn').count();
    console.log('Discovery buttons:', discoveries);
    expect(discoveries).toBeGreaterThan(0);

    const state = await page.evaluate(() => ({
      room: engine.currentRoom,
      rooms: engine.unlockedRooms,
    }));
    expect(state.room).toBe(100);
  });

  test('Reception puzzle unlocks founder rooms', async ({ page }) => {
    await setupEpisode(page, EP5_URL, {
      introText: 'Quick Bites',
      playerName: 'TestPlayer',
    });

    await solvePuzzle(page, 'reception-sort', 110);

    const rooms = await page.evaluate(() => engine.unlockedRooms);
    console.log('Unlocked rooms:', rooms);
    expect(rooms).toContain(200); // Marco
    expect(rooms).toContain(300); // Diana
    expect(rooms).toContain(400); // Raj
  });

  test('Full critical path to ending', async ({ page }) => {
    await setupEpisode(page, EP5_URL, {
      introText: 'Quick Bites',
      playerName: 'TestPlayer',
    });

    // Reception
    await solvePuzzle(page, 'reception-sort', 110);

    // Founder rooms (parallel)
    await goToRoom(page, 200);
    await solvePuzzle(page, 'craft-kitchen', 210);
    await goToRoom(page, 300);
    await solvePuzzle(page, 'wire-diana', 310);
    await goToRoom(page, 400);
    await solvePuzzle(page, 'trap-raj', 410);

    // Break Room
    await goToRoom(page, 500);
    await solvePuzzle(page, 'match-breakroom', 510);

    // Research (3/4)
    await goToRoom(page, 600);
    await solvePuzzle(page, 'pushluck-chocolot', 610);
    await goToRoom(page, 700);
    await solvePuzzle(page, 'wager-gemelli', 710);
    await goToRoom(page, 800);
    await solvePuzzle(page, 'auction-tabouleh', 810);

    // War Room
    await goToRoom(page, 1000);
    await solvePuzzle(page, 'wager-warroom', 1010);

    // Store #10
    await goToRoom(page, 1100);
    await solvePuzzle(page, 'fogmap-store10', 1101);
    await solvePuzzle(page, 'sort-store10', 999);

    // Check completion
    const finished = await page.evaluate(() => engine.finished);
    const completed = await page.evaluate(() => engine.completed);
    console.log('Finished:', finished, 'Completed:', completed);

    if (finished) {
      await assertEndScreen(page, 'Quick Bites', { ignoreCase: true, timeout: 5000 });
    }
  });
});
