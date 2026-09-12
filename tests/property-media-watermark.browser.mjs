// Explicit Chromium preview QA; does not certify iPhone native fullscreen.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright-core';
const output = process.env.PM_QA_DIR || 'test-results/property-media-watermark';
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [], errors = [];
try {
  for (const width of [1440, 390, 430]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, isMobile: width < 768, hasTouch: width < 768 });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.env.PM_PREVIEW_URL || 'http://127.0.0.1:4198/property-media/');
    await page.getByRole('button', { name: /略過/ }).click();
    await page.locator('[data-phase="complete"]').waitFor();
    const portfolio = page.getByRole('region', { name: '以影像探索服務的不同面向。', exact: true });
    assert.equal(await portfolio.count(), 1);
    const cards = portfolio.locator('button[aria-label^="開啟作品："]');
    const labels = await cards.evaluateAll(elements => elements.map(element => element.getAttribute('aria-label')));
    const samples = [labels[0], labels.find(label => label.includes('AI 空間'))];
    assert.ok(samples.every(Boolean));
    for (const label of samples) {
      const card = portfolio.getByRole('button', { name: label, exact: true });
      assert.equal(await card.count(), 1, 'The intended portfolio work must be unique within its region');
      await card.click();
      const dialog = page.getByRole('dialog');
      await dialog.waitFor();
      await page.waitForFunction(() => document.querySelector('[role="dialog"] video')?.videoWidth > 0);
      await page.waitForTimeout(300);
      const check = await dialog.evaluate(element => {
        const video = element.querySelector('video');
        const text = [...element.querySelectorAll('span')].find(node => node.textContent === '作品展示範例｜E.X Property Media');
        const v = video.getBoundingClientRect(), mark = text.getBoundingClientRect();
        const scale = Math.min(v.width / video.videoWidth, v.height / video.videoHeight);
        const x = v.x + (v.width - video.videoWidth * scale) / 2;
        const y = v.y + (v.height - video.videoHeight * scale) / 2;
        return { source: video.getAttribute('src'), ratio: [video.videoWidth, video.videoHeight],
          inside: mark.left >= x && mark.top >= y && mark.right <= x + video.videoWidth * scale + 1 && mark.bottom <= y + video.videoHeight * scale + 1,
          opacity: getComputedStyle(text).opacity, videoOpacity: getComputedStyle(video).opacity,
          pointer: getComputedStyle(text).pointerEvents, fit: getComputedStyle(video).objectFit,
          ai: element.textContent.includes('含 AI 視覺模擬'), purpose: element.textContent.includes('本影片僅供影音製作成果與技術展示'),
          overflow: document.documentElement.scrollWidth > innerWidth };
      });
      assert.ok(check.inside); assert.equal(check.opacity, '0.2'); assert.equal(check.videoOpacity, '1');
      assert.equal(check.pointer, 'none'); assert.equal(check.fit, 'contain'); assert.equal(check.overflow, false); assert.ok(check.purpose);
      assert.equal(check.ai, check.source.includes('/ai-staging/'));
      await page.screenshot({ path: `${output}/${width}-${check.ai ? 'ai' : 'real'}.png` });
      results.push({ width, ...check });
      if (width === 1440) {
        await page.setViewportSize({ width: 1024, height: 768 });
        await page.waitForTimeout(150);
        assert.equal(await dialog.locator('video').evaluate(video => getComputedStyle(video).objectFit), 'contain');
        await page.setViewportSize({ width, height: 900 });
      }
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('[role="dialog"] video').count(), 0);
      assert.equal(await card.evaluate(button => button === document.activeElement), true);
    }
    await context.close();
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ results, errors }, null, 2));
} finally { await browser.close(); }
