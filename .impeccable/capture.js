const { chromium, devices } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const iphone = devices['iPhone 13'];
  const context = await browser.newContext({ ...iphone });
  const page = await context.newPage();
  const url = 'http://localhost:3000/app/index.html?scenario=../scenarios/aws/ep0-boot-sequence';
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: '.impeccable/review/mobile-intro.png' });

  // Fill name and start (single player, no roles on ep0)
  const nameInput = page.locator('#player-name-input');
  if (await nameInput.isVisible().catch(() => false)) {
    await nameInput.fill('Case Agent');
  }
  await page.locator('#start-btn').click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: '.impeccable/review/mobile-room.png' });

  // Open Map
  await page.locator('#btn-map').click().catch(() => {});
  await page.waitForTimeout(500);
  await page.screenshot({ path: '.impeccable/review/mobile-map.png' });
  await page.locator('#map-screen button:has-text("Close")').click().catch(() => {});
  await page.waitForTimeout(300);

  // Open Interact/Combine
  await page.locator('#btn-combine-mode').click().catch(() => {});
  await page.waitForTimeout(500);
  await page.screenshot({ path: '.impeccable/review/mobile-combine.png' });
  await page.locator('#combine-screen button:has-text("Cancel")').click().catch(() => {});
  await page.waitForTimeout(300);

  // Try to open a puzzle/discovery on the room if present
  const discoverBtn = page.locator('.discover-btn').first();
  if (await discoverBtn.count()) {
    await discoverBtn.click().catch(() => {});
    await page.waitForTimeout(600);
    await page.screenshot({ path: '.impeccable/review/mobile-discovery-or-puzzle.png' });
    // close whichever popup opened
    await page.keyboard.press('Escape').catch(() => {});
    await page.locator('#discover-popup.open .btn').click().catch(() => {});
    await page.locator('#puzzle-popup .panel-close').click().catch(() => {});
  }

  await browser.close();
  console.log('done');
})();
