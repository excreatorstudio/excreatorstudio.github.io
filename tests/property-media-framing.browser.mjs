// Local Chromium comparison: identical asset, 4s frame, viewport and scroll position.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright-core';
const output = process.env.PM_QA_DIR || 'test-results/property-media-framing';
const label = process.env.PM_FRAME_LABEL || 'after';
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [], errors = [];
try {
  for (const [width, height] of [[390,844],[430,932],[320,740],[1440,900]]) {
    const context = await browser.newContext({ viewport: { width, height }, isMobile: width < 768, hasTouch: width < 768 });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.env.PM_PREVIEW_URL || 'http://127.0.0.1:4198/property-media/');
    const intro = page.getByRole('dialog', { name: 'E.X Property Media 開場', exact: true });
    await intro.getByRole('button', { name: /進入空間/ }).click();
    await page.waitForFunction(() => document.querySelector('[role="dialog"] video')?.videoWidth > 0);
    await page.waitForFunction(() => document.querySelector('[role="dialog"] video')?.readyState >= 2);
    await intro.locator('video').evaluate(video => { video.pause(); video.currentTime = 4; });
    await page.waitForFunction(() => {
      const video = document.querySelector('[role="dialog"] video');
      return video && !video.seeking && video.readyState >= 2 && Math.abs(video.currentTime - 4) < .05;
    }, null, { timeout: 8000 });
    const dimensions = await intro.locator('video').evaluate(video => {
      const box = video.getBoundingClientRect(), style = getComputedStyle(video);
      const scale = Math.max(box.width / video.videoWidth, box.height / video.videoHeight);
      return { source: video.getAttribute('src'), native: [video.videoWidth, video.videoHeight], time: video.currentTime,
        box: { width: box.width, height: box.height, y: box.y }, fit: style.objectFit, position: style.objectPosition,
        transform: style.transform, visibleSourceWidth: box.width / scale };
    });
    await page.screenshot({ path: `${output}/${label}-${width}-intro.png` });
    await intro.getByRole('button', { name: /略過/ }).click();
    await page.locator('[data-phase="complete"]').waitFor();
    await page.waitForTimeout(750);
    const hero = await page.locator('[aria-labelledby="property-media-title"]').evaluate(element => {
      const background = element.querySelector('[aria-hidden="true"]');
      const style = getComputedStyle(background), box = background.getBoundingClientRect();
      return { width: box.width, height: box.height, backgroundSize: style.backgroundSize, position: style.backgroundPosition };
    });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: `${output}/${label}-${width}-hero.png` });
    results.push({ width, height, intro: dimensions, hero });
    await context.close();
  }
  assert.deepEqual(errors, []);
  await fs.writeFile(`${output}/${label}.json`, JSON.stringify({ results, errors }, null, 2));
  console.log(JSON.stringify({ results, errors }, null, 2));
} finally { await browser.close(); }
