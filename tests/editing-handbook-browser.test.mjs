import assert from "node:assert/strict";
import test, { before, after } from "node:test";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright-core";
import { createStaticPreview } from "../scripts/editing-academy-preview.mjs";

const evidence = resolve(process.env.HANDBOOK_QA_OUTPUT ?? ".npm-cache/edu-1e-p1r-evidence/standalone-browser");
const checks = [];
const href = "/ex-ai/editing/handbook/";
const termIds = ["shot-size", "camera-movement", "transition", "b-roll", "jump-cut", "timeline"];
let server, browser, origin;

before(async () => {
  assert.ok(existsSync(resolve("out/ex-ai/editing/handbook/index.html")), "Build the isolated static site first");
  await mkdir(evidence, { recursive: true });
  server = createStaticPreview(resolve("out"));
  await new Promise(done => server.listen(0, "127.0.0.1", done));
  origin = `http://127.0.0.1:${server.address().port}`;
  const executablePath = ["C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Microsoft/Edge/Application/msedge.exe"].find(existsSync);
  browser = await chromium.launch({ executablePath, headless: true });
});

after(async () => {
  await writeFile(resolve(evidence, "browser-results.json"), JSON.stringify({ scope: "LOCAL_STATIC_BUILD", browser: "Chromium / Edge headless", physicalDevice: "NOT_TESTED", checks }, null, 2));
  await browser?.close();
  if (server) await new Promise(done => server.close(done));
});

async function open(width, theme, options = {}) {
  const context = await browser.newContext({ viewport: { width, height: width < 600 ? 900 : 1000 }, colorScheme: theme, deviceScaleFactor: 1, isMobile: width < 600, hasTouch: width < 600, ...options });
  const errors = [], failures = [], external = [];
  await context.route("**/*", route => {
    if (route.request().url().startsWith(origin + "/")) return route.continue();
    external.push(route.request().url());
    return route.abort();
  });
  const page = await context.newPage();
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  page.on("response", response => { if (response.status() >= 400) failures.push({ path: new URL(response.url()).pathname, status: response.status() }); });
  return { page, context, errors, failures, external };
}

async function navigate(page, path) {
  const response = await page.goto(origin + path, { waitUntil: "networkidle" });
  assert.equal(response.status(), 200, `${path} loads directly`);
}

async function noOverflow(page) {
  const result = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
  assert.ok(result.document <= result.viewport, JSON.stringify(result));
}

async function snapshot(locator, name) {
  await locator.scrollIntoViewIfNeeded();
  await locator.screenshot({ path: resolve(evidence, name), animations: "disabled" });
}

for (const width of [1440, 1024, 768, 430, 390, 320]) for (const theme of ["light", "dark"]) {
  test(`${width} ${theme}: three entries, preserved pages, six terms and honest media`, async () => {
    const { page, context, errors, failures, external } = await open(width, theme);
    const capture = [1440, 390].includes(width);
    await navigate(page, "/ex-ai/");
    await noOverflow(page);
    const heroEntry = page.locator('[data-handbook-entry="hero"]');
    const resourceEntry = page.locator('[data-handbook-entry="resources"]');
    assert.equal(await heroEntry.getAttribute("href"), href);
    assert.equal(await resourceEntry.getAttribute("href"), href);
    assert.ok(await heroEntry.isVisible());
    assert.ok(await resourceEntry.isVisible());
    const collisions = await heroEntry.evaluate(element => {
      const r = element.getBoundingClientRect();
      return ["#creator-studio-heading", "#creator-site-search", ".creator-hero__primary-entry", ".personal-brand-showcase-float", ".platform-navigator", ".creator-header"].flatMap(selector => {
        const other = document.querySelector(selector);
        if (!other) return [];
        const b = other.getBoundingClientRect();
        return b.width && b.height && Math.min(r.right, b.right) - Math.max(r.left, b.left) > 1 && Math.min(r.bottom, b.bottom) - Math.max(r.top, b.top) > 1 ? [selector] : [];
      });
    });
    assert.deepEqual(collisions, [], `book entry overlaps existing elements at ${width}`);
    assert.equal(await heroEntry.evaluate(element => { const r = element.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; }), true);
    const centerHit = await heroEntry.evaluate(element => { const r = element.getBoundingClientRect(); const target = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return target && element.contains(target); });
    assert.ok(centerHit, "Hero book must not be covered by an existing float");
    assert.equal(await page.locator('.creator-categories-section .creator-category-card').count(), 6);
    assert.ok(await page.getByText("Creator Academy / YUNI", { exact: true }).isVisible());
    assert.ok(await page.getByRole("heading", { name: "教學資源", exact: true }).isVisible());
    assert.ok(await page.getByRole("heading", { name: "免費資源庫", exact: true }).isVisible());
    assert.match(await page.getByRole("link", { name: "查看資源 →", exact: true }).getAttribute("href"), /^\/resources\/?$/);
    assert.ok(await page.getByText("Latest tutorial", { exact: true }).isVisible());
    assert.ok(await page.locator('.creator-hero__primary-entry a').isVisible());
    assert.ok(await page.locator('.personal-brand-showcase-float').isVisible());
    if (capture && theme === "dark") {
      await snapshot(page.locator('.creator-hero'), `A-B-ex-ai-hero-${width}.png`);
      await snapshot(page.locator('[aria-labelledby="teaching-resources-heading"]'), `C-D-resources-${width}.png`);
    }
    await heroEntry.focus();
    await page.keyboard.press("Enter");
    await page.locator('[data-handbook-intro][open]').waitFor();
    await page.getByRole('link', { name: '開始閱讀剪片說明書 →', exact: true }).click();
    await page.waitForURL(origin + href);
    assert.ok(await page.getByRole("heading", { name: "剪片說明書", exact: true, level: 1 }).isVisible());
    await navigate(page, "/ex-ai/");
    await page.locator('[data-handbook-entry="resources"]').click();
    await page.locator('[data-handbook-intro][open]').waitFor();
    await page.getByRole('link', { name: '開始閱讀剪片說明書 →', exact: true }).click();
    await page.waitForURL(origin + href);

    await navigate(page, "/ex-ai/editing/");
    await page.getByRole("button", { name: theme === "light" ? "淺色模式" : "深色模式", exact: true }).click();
    await noOverflow(page);
    const academyEntry = page.locator('[data-handbook-entry="academy"]');
    assert.equal(await academyEntry.getAttribute("href"), href);
    const order = await page.evaluate(() => {
      const lesson = document.querySelector('#learning-steps');
      const entry = document.querySelector('[data-handbook-entry="academy"]');
      const courses = document.querySelector('#free-lessons');
      return Boolean(lesson.compareDocumentPosition(entry) & Node.DOCUMENT_POSITION_FOLLOWING) && Boolean(entry.compareDocumentPosition(courses) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    assert.ok(order);
    assert.equal(await page.locator('[data-course-id]').count(), 6);
    assert.equal(await page.locator('#learning-steps').getAttribute('data-video-state'), 'PENDING');
    if (capture) await snapshot(academyEntry, `E-F-academy-entry-${width}-${theme}.png`);
    await academyEntry.click();
    await page.locator('[data-handbook-intro][open]').waitFor();
    await page.getByRole('link', { name: '開始閱讀剪片說明書 →', exact: true }).click();
    await page.waitForURL(origin + href);

    await page.getByRole("button", { name: theme === "light" ? "淺色模式" : "深色模式", exact: true }).click();
    await noOverflow(page);
    assert.equal(await page.locator('[data-editing-handbook]').getAttribute('data-theme'), theme);
    assert.equal(await page.getByRole('tab').count(), 6);
    assert.equal(await page.getByRole('tablist').getAttribute('aria-orientation'), width >= 1024 ? 'vertical' : 'horizontal');
    const themeTargets = await page.locator('[aria-label="手冊外觀"] button').evaluateAll(buttons => buttons.map(button => { const r = button.getBoundingClientRect(); return { width: r.width, height: r.height }; }));
    assert.ok(themeTargets.every(box => box.width >= 44 && box.height >= 44));
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('[data-handbook-video]').getAttribute('data-handbook-video'), 'AVAILABLE');
    assert.ok(await page.getByRole('heading', { name: '24 秒，看懂剪輯語言', exact: true }).isVisible());
    assert.equal(await page.locator('iframe, form, input[type="password"]').count(), 0);
    assert.equal(await page.locator('video').count(), 1);
    assert.equal(await page.locator('#handbook-video button').count(), 0);
    const videoLayout = await page.locator('#handbook-video [class*="videoPoster"]').evaluate(element => { const r = element.getBoundingClientRect(); return { ratio: r.width / r.height }; });
    assert.ok(Math.abs(videoLayout.ratio - 9 / 16) < .02, JSON.stringify(videoLayout));
    assert.ok(await page.getByText('規劃中，尚未開放訂閱', { exact: true }).isVisible());
    assert.equal(await page.locator('[data-premium-card]').count(), 6);
    if (capture) {
      await snapshot(page.locator('[aria-labelledby="handbook-heading"]'), `G-H-handbook-hero-${width}-${theme}.png`);
      await snapshot(page.locator('#handbook-terms'), `I-J-six-terms-${width}-${theme}.png`);
      await snapshot(page.locator('#premium-preview'), `K-premium-${width}-${theme}.png`);
      await snapshot(page.locator('#handbook-video'), `L-video-intro-${width}-${theme}.png`);
    }
    for (const [index, id] of termIds.entries()) {
      await page.getByRole('tab').nth(index).click();
      assert.equal(await page.locator('#handbook-term-panel').getAttribute('data-active-term'), id);
      assert.equal(await page.getByRole('tab', { selected: true }).count(), 1);
      assert.ok((await page.locator('#handbook-term-panel svg title').textContent()).length > 8);
      assert.ok((await page.locator('#handbook-term-panel h3').textContent()).length > 0);
      if (width === 1440 && theme === 'dark') await snapshot(page.locator('#handbook-term-panel'), `term-${index + 1}-${id}.png`);
    }
    const first = page.getByRole('tab').first();
    await first.focus();
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#handbook-term-panel').getAttribute('data-active-term'), 'camera-movement');
    await page.keyboard.press('End');
    assert.equal(await page.locator('#handbook-term-panel').getAttribute('data-active-term'), 'timeline');
    await page.keyboard.press('Home');
    await page.keyboard.press('Space');
    assert.equal(await page.locator('#handbook-term-panel').getAttribute('data-active-term'), 'shot-size');
    assert.ok(await first.evaluate(element => element.matches(':focus-visible')));
    const imageStatus = await page.locator('[data-handbook-book] img').evaluateAll(images => images.map(image => ({ complete: image.complete, naturalWidth: image.naturalWidth, src: image.currentSrc, alt: image.alt })));
    assert.ok(imageStatus.every(image => image.complete && image.naturalWidth > 0 && image.alt && image.src.endsWith('.webp')));
    if (width < 600) assert.ok(imageStatus.every(image => !image.src.endsWith('book-960.webp')), 'mobile must not receive the large desktop derivative at DPR 1');
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('[data-editing-handbook]').getAttribute('data-theme'), theme);
    await noOverflow(page);
    const known404 = failures.filter(item => item.status === 404 && item.path === '/ex-galaxy-ui/index.txt');
    assert.deepEqual(failures.filter(item => !known404.includes(item)), []);
    assert.deepEqual(errors.filter(message => !message.includes('404')), []);
    assert.deepEqual(external, []);
    checks.push({ width, theme, result: 'PASS', entries: 3, terms: 6, keyboard: 'PASS', overflow: 'NONE', collisions: 'NONE', externalRequests: 0, console: known404.length ? 'EXISTING_EX_GALAXY_PREFETCH_404_ONLY' : 'CLEAN' });
    await context.close();
  });
}

test('missing book, reduced motion and return navigation preserve a usable reading experience', async () => {
  const { page, context } = await open(320, 'light', { reducedMotion: 'reduce' });
  await navigate(page, href);
  const before = await page.locator('[data-handbook-book]').boundingBox();
  await page.route('**/images/editing-handbook/*.webp', route => route.abort());
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('[data-media-fallback="true"]').waitFor();
  const afterBox = await page.locator('[data-handbook-book]').boundingBox();
  assert.equal(before.height, afterBox.height);
  assert.equal(before.width, afterBox.width);
  await page.getByRole('tab').nth(4).click();
  assert.equal(await page.locator('#handbook-term-panel').getAttribute('data-active-term'), 'jump-cut');
  assert.equal(await page.locator('#handbook-term-panel [class*="diagram"]').first().evaluate(element => getComputedStyle(element).animationName), 'none');
  await page.locator('header').getByRole('link', { name: '返回剪輯學院', exact: false }).click();
  await page.waitForURL(origin + '/ex-ai/editing/');
  await page.locator('[data-handbook-entry="academy"]').click();
  await page.locator('[data-handbook-intro][open]').waitFor();
  await page.getByRole('link', { name: '開始閱讀剪片說明書 →', exact: true }).click();
  await page.waitForURL(origin + href);
  await page.locator('header').getByRole('link', { name: '返回 EX AI', exact: false }).click();
  await page.waitForURL(origin + '/ex-ai/');
  assert.ok(await page.locator('[data-handbook-entry="hero"]').isVisible());
  checks.push({ interaction: 'image fallback / reserved dimensions / reduced motion / return links', result: 'PASS', intentionalMediaAbort: true });
  await context.close();
});

test('existing critical static routes remain available', async () => {
  const { page, context } = await open(1440, 'dark');
  for (const path of ['/', '/resources/', '/creator-academy/', '/ai-learning/', '/property-media/', '/market-radar/']) await navigate(page, path);
  checks.push({ interaction: 'six existing critical routes', result: 'PASS' });
  await context.close();
});
