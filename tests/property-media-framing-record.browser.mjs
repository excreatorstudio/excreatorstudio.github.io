// Actual browser frames, no generated imagery; silent QA recording, not audio certification.
import { chromium } from 'playwright-core';
import fs from 'node:fs/promises';
const output = process.env.PM_QA_DIR || 'test-results/property-media-framing';
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
let recording = false, loop;
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto(process.env.PM_PREVIEW_URL || 'http://127.0.0.1:4199/property-media/');
  const encoder = await browser.newPage();
  await encoder.setContent('<canvas width="390" height="844"></canvas>');
  await encoder.evaluate(() => {
    window.chunks = [];
    window.recorder = new MediaRecorder(document.querySelector('canvas').captureStream(12), { mimeType: 'video/webm;codecs=vp8' });
    window.recorder.ondataavailable = event => window.chunks.push(event.data);
    window.recorder.start();
  });
  await page.bringToFront();
  recording = true;
  loop = (async () => {
    while (recording) {
      const frame = (await page.screenshot({ type: 'jpeg', quality: 85 })).toString('base64');
      await encoder.evaluate(async data => {
        const image = new Image(); image.src = 'data:image/jpeg;base64,' + data;
        await image.decode(); document.querySelector('canvas').getContext('2d').drawImage(image, 0, 0);
      }, frame);
      await page.waitForTimeout(65);
    }
  })();
  await page.getByRole('button', { name: /進入空間/ }).click();
  await page.locator('[data-phase="complete"]').waitFor();
  await page.waitForTimeout(1500);
  recording = false; await loop;
  const bytes = await encoder.evaluate(() => new Promise(resolve => {
    window.recorder.onstop = async () => resolve(Array.from(new Uint8Array(await new Blob(window.chunks).arrayBuffer())));
    window.recorder.stop();
  }));
  const file = `${output}/390-intro-handoff.webm`;
  await fs.writeFile(file, Buffer.from(bytes));
  console.log(file, bytes.length, 'bytes');
} finally { recording = false; if (loop) await loop.catch(() => {}); await browser.close(); }
