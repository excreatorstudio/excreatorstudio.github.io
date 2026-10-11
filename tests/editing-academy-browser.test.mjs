import assert from "node:assert/strict";
import test, { before, after } from "node:test";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright-core";
import { createStaticPreview } from "../scripts/editing-academy-preview.mjs";

const output = resolve(process.env.EDITING_STATIC_DIR ?? "out");
const evidence = process.env.EDITING_QA_OUTPUT;
const checks = [];
let server, browser, origin;
before(async () => {
  assert.ok(existsSync(resolve(output, "ex-ai/editing/index.html")), "Build the new static route first");
  server = createStaticPreview(output);
  await new Promise(done => server.listen(0, "127.0.0.1", done));
  origin = `http://127.0.0.1:${server.address().port}`;
  const executablePath = ["C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Google/Chrome/Application/chrome.exe"].find(existsSync);
  browser = await chromium.launch({ executablePath, headless: true });
  if (evidence) await mkdir(evidence, { recursive: true });
});
after(async () => {
  if (evidence) await writeFile(resolve(evidence, "browser-results.json"), JSON.stringify({ browser: "Chromium/Edge headless", scope: "LOCAL_STATIC_BUILD", checks, physicalDevice: "NOT_TESTED" }, null, 2));
  await browser?.close();
  if (server) await new Promise(done => server.close(done));
});

async function open(width = 1440, colorScheme = "dark", options = {}) {
  const context = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 1000 }, colorScheme, isMobile: width < 600, hasTouch: width < 600, ...options });
  const consoleErrors = [], externalRequests = [];
  await context.route("**/*", route => {
    if (route.request().url().startsWith(origin + "/")) return route.continue();
    externalRequests.push(route.request().url());
    return route.abort();
  });
  const page = await context.newPage();
  page.on("pageerror", error => consoleErrors.push(error.message));
  page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
  await page.addInitScript(() => {
    window.__editingCLS = 0;
    new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__editingCLS += entry.value; }).observe({ type: "layout-shift", buffered: true });
  });
  await page.goto(`${origin}/ex-ai/editing/`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: colorScheme === "dark" ? "深色模式" : "淺色模式", exact: true }).click();
  return { context, page, consoleErrors, externalRequests };
}

for (const width of [1440, 1024, 768, 430, 390, 320]) for (const theme of ["light", "dark"]) {
  test(`${width} ${theme}: sections, no overflow, imagery, CTAs and clean console`, async () => {
    const { page, context, consoleErrors, externalRequests } = await open(width, theme);
    assert.equal(await page.locator("h1").count(), 1);
    for (const id of ["learning-steps", "free-lessons", "paid-courses", "portfolio", "coaching", "inquiry", "faq"]) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      assert.ok(await page.locator(`#${id}`).isVisible());
      const overflow = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, escaped: [...document.querySelectorAll('[data-editing-academy] a, [data-editing-academy] button, [data-course-id]')].filter(element => { const r = element.getBoundingClientRect(); return r.width && (r.left < -1 || r.right > innerWidth + 1); }).map(element => element.textContent) }));
      assert.ok(overflow.document <= overflow.viewport, JSON.stringify(overflow));
      assert.deepEqual(overflow.escaped, []);
    }
    assert.equal(await page.locator("#learning-steps [aria-pressed='true']").getAttribute("aria-label"), "步驟 01：匯入影片素材");
    assert.equal(await page.locator("#learning-steps").getAttribute("data-video-state"), "PENDING");
    const titleLayout = await page.locator("#lesson-heading").evaluate(element => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth, clientHeight: element.clientHeight, scrollHeight: element.scrollHeight }));
    assert.ok(titleLayout.scrollWidth <= titleLayout.clientWidth + 1 && titleLayout.scrollHeight > 0, JSON.stringify(titleLayout));
    assert.ok(await page.getByRole("heading", { name: "教學影片準備中", exact: true }).isVisible());
    assert.ok(await page.getByText("步驟構圖示意 · 非剪輯軟體畫面", { exact: true }).isVisible());
    assert.equal(await page.locator("#learning-steps video, #learning-steps iframe").count(), 0);
    for (const outcome of ["整理素材", "剪輯影片", "加入字幕", "搭配音樂", "輸出作品"]) assert.ok(await page.locator("#learning-steps ul").last().getByText(outcome, { exact: true }).isVisible());
    assert.equal(await page.locator("[data-course-id]").count(), 6);
    assert.equal(await page.locator("video, iframe, form").count(), 0);
    const media = await page.locator("[data-editing-academy] img").evaluateAll(images => images.map(image => ({ complete: image.complete, width: image.naturalWidth, alt: image.alt, src: image.currentSrc })));
    assert.ok(media.every(image => image.complete && image.width > 0 && image.alt));
    if (width < 600) assert.ok(media.every(image => image.src.endsWith("studio-800.webp")));
    await page.getByRole("link", { name: "免費開始學習", exact: false }).click();
    assert.ok(page.url().endsWith("#free-lessons"));
    await page.getByRole("link", { name: "探索付費課程", exact: false }).click();
    assert.ok(page.url().endsWith("#paid-courses"));
    const colors = await page.locator("[data-editing-academy]").evaluate(element => ({ background: getComputedStyle(element).backgroundColor, text: getComputedStyle(element).color }));
    assert.equal(colors.background, theme === "light" ? "rgb(244, 242, 236)" : "rgb(16, 21, 28)");
    await page.evaluate(() => scrollTo(0, 0));
    if (evidence && [1440, 390].includes(width)) {
      await page.screenshot({ path: resolve(evidence, `${width}-${theme}-full.png`), fullPage: true });
      await page.screenshot({ path: resolve(evidence, `${width}-${theme}-hero.png`) });
      await page.locator("#learning-steps").screenshot({ path: resolve(evidence, `${width}-${theme}-step-01.png`) });
    }
    const performance = await page.evaluate(() => ({ clsObserved: window.__editingCLS, resourceBytes: performance.getEntriesByType("resource").reduce((sum, entry) => sum + entry.transferSize, 0) }));
    assert.deepEqual(consoleErrors, []);
    assert.deepEqual(externalRequests, []);
    checks.push({ width, theme, result: "PASS", horizontalOverflow: "NONE", console: "CLEAN", externalRequests: 0, media, performance });
    await context.close();
  });
}

test("lesson steps select by pointer and keyboard; responsive screenshots retain the pending media and outcome", async () => {
  for (const width of [1440, 390]) for (const theme of ["light", "dark"]) {
    const { page, context, consoleErrors, externalRequests } = await open(width, theme);
    const stepOne = page.getByRole("button", { name: "步驟 01：匯入影片素材", exact: true });
    const stepTwo = page.getByRole("button", { name: "步驟 02：剪掉多餘片段", exact: true });
    const stepThree = page.getByRole("button", { name: "步驟 03：加入字幕", exact: true });
    await stepTwo.click();
    assert.equal(await stepTwo.getAttribute("aria-pressed"), "true");
    assert.equal((await page.locator("#lesson-step-instruction").innerText()).split("\n").filter(Boolean).join("\n"), "STEP 02 / 04\n剪掉多餘片段\n保留精彩畫面，移除不需要的部分。");
    assert.equal(await page.locator("#learning-steps").getAttribute("data-video-state"), "PENDING");
    if (evidence) await page.locator("#learning-steps").screenshot({ path: resolve(evidence, `${width}-${theme}-step-02.png`) });
    await stepOne.focus();
    await page.keyboard.press("ArrowDown");
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute("aria-label")), "步驟 02：剪掉多餘片段");
    assert.equal(await stepTwo.getAttribute("aria-pressed"), "true");
    await page.keyboard.press("End");
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute("aria-label")), "步驟 04：加入音樂並輸出");
    await page.keyboard.press("Home");
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute("aria-label")), "步驟 01：匯入影片素材");
    await stepThree.press("Space");
    assert.equal(await stepThree.getAttribute("aria-pressed"), "true");
    const layout = await page.locator("#learning-steps").evaluate(element => ({ width: element.getBoundingClientRect().width, scrollWidth: element.scrollWidth, columns: getComputedStyle(element.querySelector("[class*='lessonGrid']")).gridTemplateColumns }));
    assert.ok(layout.scrollWidth <= layout.width + 1, JSON.stringify(layout));
    assert.deepEqual(consoleErrors, []);
    assert.deepEqual(externalRequests, []);
    checks.push({ width, theme, interaction: "pointer / arrows / Home / End / Space", result: "PASS", overflow: "NONE", video: "PENDING" });
    await context.close();
  }
});

test("every course opens real details; native dialog keyboard focus returns safely", async () => {
  const { page, context, consoleErrors } = await open(390);
  for (const id of ["F01", "F02", "F03", "P01", "P02", "P03"]) {
    const button = page.locator(`[data-course-id="${id}"] button`);
    await button.focus();
    await page.keyboard.press("Enter");
    await page.locator("dialog[open]").waitFor();
    await page.getByRole("heading", { name: "課綱預覽", exact: true }).waitFor();
    assert.equal(await page.locator("dialog li").count(), 5);
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute("aria-label")), "關閉課程預覽");
    await page.keyboard.press("Shift+Tab");
    assert.ok(await page.evaluate(() => !!document.activeElement?.closest("dialog")), JSON.stringify({ id, active: await page.evaluate(() => ({ tag: document.activeElement?.tagName, text: document.activeElement?.textContent?.slice(0, 100), open: !!document.querySelector("dialog[open]") })) }));
    await page.keyboard.press("Tab");
    await page.keyboard.press("Escape");
    await page.locator("dialog #course-dialog-title").waitFor({ state: "detached" });
    assert.equal(await page.locator("dialog[open]").count(), 0);
    assert.ok(await button.evaluate(element => document.activeElement === element));
  }
  await page.locator('[data-course-id="F01"] button').press("Space");
  await page.getByRole("button", { name: "關閉課程預覽" }).click();
  await page.locator("dialog #course-dialog-title").waitFor({ state: "detached" });
  await page.locator('[data-course-id="P01"] button').click();
  await page.getByRole("button", { name: "查看詢問狀態", exact: false }).click();
  assert.equal(await page.locator("dialog[open]").count(), 0);
  assert.equal(await page.evaluate(() => document.activeElement?.id), "inquiry");
  assert.ok(await page.getByRole("heading", { name: "詢問管道準備中" }).isVisible());
  assert.deepEqual(consoleErrors, []);
  checks.push({ interaction: "all 6 course dialogs / Enter / Space / Tab / Shift+Tab / Escape / focus return", result: "PASS" });
  await context.close();
});

test("FAQ keyboard operation, inquiry pending and theme persistence/system mode", async () => {
  const { page, context } = await open();
  const first = page.locator("#faq summary").first();
  await first.focus(); await page.keyboard.press("Enter");
  assert.ok(await page.locator("#faq details").first().getAttribute("open") !== null);
  await page.keyboard.press("Space");
  assert.equal(await page.locator("#faq details").first().getAttribute("open"), null);
  await page.getByRole("link", { name: "了解教學詢問方式", exact: false }).click();
  assert.ok(page.url().endsWith("#inquiry"));
  assert.ok(await page.getByRole("heading", { name: "詢問管道準備中" }).isVisible());
  await page.getByRole("button", { name: "淺色模式", exact: true }).click();
  await page.reload();
  assert.equal(await page.locator("[data-editing-academy]").getAttribute("data-theme"), "light");
  await page.getByRole("button", { name: "跟隨系統" }).click();
  await page.emulateMedia({ colorScheme: "light" });
  assert.equal(await page.locator("[data-editing-academy]").evaluate(element => getComputedStyle(element).backgroundColor), "rgb(244, 242, 236)");
  await page.emulateMedia({ colorScheme: "dark" });
  assert.equal(await page.locator("[data-editing-academy]").evaluate(element => getComputedStyle(element).backgroundColor), "rgb(16, 21, 28)");
  checks.push({ interaction: "FAQ / honest inquiry / persisted theme / live system theme", result: "PASS" });
  await context.close();
});

test("failed image retains layout and usable navigation; reduced motion removes feedback transforms", async () => {
  const { page, context } = await open(320, "dark", { reducedMotion: "reduce" });
  const before = await page.locator('[aria-labelledby="editing-heading"]').boundingBox();
  await page.route("**/images/editing-academy/**", route => route.abort());
  await page.reload({ waitUntil: "networkidle" });
  await page.locator('[data-media-fallback="true"]').waitFor();
  const after = await page.locator('[aria-labelledby="editing-heading"]').boundingBox();
  assert.equal(before.height, after.height);
  assert.equal(await page.locator("[data-editing-academy] img").count(), 0);
  await page.getByRole("link", { name: "免費開始學習", exact: false }).click();
  assert.ok(page.url().endsWith("#free-lessons"));
  const transition = await page.getByRole("link", { name: "免費開始學習", exact: false }).evaluate(element => getComputedStyle(element).transitionDuration);
  assert.equal(transition, "0s");
  checks.push({ interaction: "image failure / stable reserved layout / reduced motion", result: "PASS", expectedNetworkAbort: true });
  await context.close();
});

test("page-local shell does not replace the existing EX AI entry", async () => {
  const { page, context } = await open();
  await page.getByRole("link", { name: "返回 EX AI", exact: true }).first().click();
  await page.waitForURL(`${origin}/ex-ai/`);
  assert.ok(await page.locator(".creator-header").isVisible());
  assert.ok(await page.getByRole("heading", { name: "E.X AI 創作中心 × 創作者學院" }).isVisible());
  assert.equal(await page.locator("[data-editing-academy]").count(), 0);
  await page.goto(`${origin}/ex-ai/editing/`);
  assert.ok(await page.locator("[data-editing-academy]").isVisible());
  checks.push({ interaction: "existing EX AI route / shell restoration / direct reload", result: "PASS" });
  await context.close();
});
