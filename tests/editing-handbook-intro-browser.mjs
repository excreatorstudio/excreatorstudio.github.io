// Run through the authorized Browser skill's persistent Node tool, not a second browser driver.
// import this module and pass its selected {browser, tab, viewport}; evidence stays ignored/local.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const href = "/ex-ai/editing/handbook/";
const termIds = ["shot-size", "camera-movement", "transition", "b-roll", "jump-cut", "timeline"];

export async function checkHandbookWidth({ tab, viewport, width, origin = "http://127.0.0.1:4327", evidence, rows, capture = false }) {
  const height = width < 600 ? 900 : 1000;
  await viewport.set({ width, height });
  await mkdir(evidence, { recursive: true });
  const image = async name => {
    if (!capture) return;
    // Let the 220ms diagram transition and browser screenshot compositor finish painting.
    await tab.playwright.waitForTimeout(400);
    await tab.ax.get();
    const proof = await tab.ax.get("both");
    assert.ok(proof.screenshot, "Capture must include a fresh rendered frame, not only DOM state");
    await writeFile(resolve(evidence, `${name}-${width}.jpg`), proof.screenshot);
  };
  async function go(path) {
    const url = origin + path;
    if (await tab.url() === url) await tab.reload(); else await tab.goto(url);
    await tab.playwright.locator("h1").waitFor({ state: "visible" });
  }
  async function overflow() {
    const dimensions = await tab.playwright.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    assert.ok(dimensions.scroll <= dimensions.width, `overflow ${JSON.stringify(dimensions)}`);
  }
  async function entry(selector, name, keyboard = false) {
    assert.equal(await tab.playwright.locator(selector).getAttribute("href"), href);
    const idle = await tab.playwright.evaluate(() => ({ count: document.querySelectorAll("video").length, open: document.querySelector("[data-handbook-intro]")?.open, paused: document.querySelector("video")?.paused }));
    assert.equal(idle.count, 1);
    assert.equal(idle.open, false);
    assert.equal(idle.paused, true);
    if (keyboard) await tab.playwright.locator(selector).press("Enter"); else await tab.playwright.locator(selector).click();
    await tab.playwright.locator('[data-handbook-intro][open][data-playback="playing"], [data-handbook-intro][open][data-playback="blocked"]').waitFor({ state: "visible", timeoutMs: 12000 });
    const playback = await tab.playwright.locator("[data-handbook-intro]").getAttribute("data-playback");
    const bounds = await tab.playwright.locator("[data-handbook-intro]").evaluate(element => {
      const r = element.getBoundingClientRect();
      const close = element.querySelector('[aria-label="關閉介紹影片"]').getBoundingClientRect();
      const video = element.querySelector("video").getBoundingClientRect();
      return { top: r.top, left: r.left, right: r.right, bottom: r.bottom, closeTop: close.top, closeBottom: close.bottom, videoWidth: video.width, videoHeight: video.height };
    });
    assert.ok(bounds.left >= 0 && bounds.right <= width && bounds.top >= 0 && bounds.bottom <= height + 1, JSON.stringify(bounds));
    assert.ok(bounds.closeTop >= bounds.top && bounds.closeBottom <= bounds.bottom);
    assert.ok(Math.abs(bounds.videoWidth / bounds.videoHeight - 9 / 16) < .02);
    if (playback === "playing") {
      const media = await tab.playwright.locator("[data-handbook-intro] video").evaluate(video => ({ paused: video.paused, duration: video.duration, width: video.videoWidth, height: video.videoHeight }));
      assert.equal(media.paused, false);
      assert.ok(media.duration > 23 && media.duration < 25);
      assert.equal(media.width / media.height, 9 / 16);
      await tab.playwright.getByRole("button", { name: "暫停", exact: true }).click();
    } else assert.ok(await tab.playwright.getByRole("button", { name: "點擊播放影片", exact: true }).isVisible());
    await image(`${name}-video`);
    await tab.ax.pressKey(null, "Escape");
    const closed = await tab.playwright.evaluate(() => ({ open: document.querySelector("[data-handbook-intro]")?.open, paused: document.querySelector("video")?.paused, focus: document.activeElement?.getAttribute("data-handbook-entry") }));
    assert.equal(closed.open, false);
    assert.equal(closed.paused, true);
    assert.equal(closed.focus, selector.match(/="([^"]+)"/)[1]);
    await overflow();
    rows.push({ width, check: name, playback, portrait: "PASS", close: "PASS", focusReturn: "PASS", audibleHardware: "NOT_VERIFIED" });
  }

  await go("/ex-ai/");
  await overflow();
  assert.equal(await tab.playwright.locator(".creator-category-card").count(), 6);
  assert.ok(await tab.playwright.getByText("Creator Academy / YUNI", { exact: true }).isVisible());
  assert.equal(await tab.playwright.getByRole("link", { name: "查看資源 →", exact: true }).getAttribute("href"), "/resources/");
  await entry('[data-handbook-entry="hero"]', "ex-ai-book", true);
  await entry('[data-handbook-entry="resources"]', "teaching-resources-book");

  await go("/ex-ai/editing/");
  assert.equal(await tab.playwright.locator("#learning-steps").getAttribute("data-video-state"), "PENDING");
  assert.equal(await tab.playwright.locator("[data-course-id]").count(), 6);
  await entry('[data-handbook-entry="academy"]', "academy-book", true);

  await go("/resources/");
  assert.ok(await tab.playwright.getByRole("heading", { name: "教學資源中心", exact: true }).isVisible());
  assert.ok(await tab.playwright.getByText("此分類的首批教學與資源正在整理，敬請期待。", { exact: true }).isVisible());
  await entry('[data-handbook-entry="directory"]', "resources-book");
  assert.equal(await tab.playwright.getByRole("link", { name: "直接閱讀剪片說明書 →", exact: true }).getAttribute("href"), href);
  await tab.playwright.getByRole("link", { name: "直接閱讀剪片說明書 →", exact: true }).click();
  await tab.playwright.waitForURL(origin + href, { timeoutMs: 10000 });
  assert.equal(await tab.playwright.locator("[data-handbook-intro]").getAttribute("data-playback"), "idle");
  assert.equal(await tab.playwright.locator("#handbook-video").getAttribute("data-handbook-video"), "AVAILABLE");
  assert.equal(await tab.playwright.getByRole("tab").count(), 6);
  assert.equal(await tab.playwright.locator("[data-premium-card]").count(), 6);
  assert.equal(await tab.playwright.locator("form, iframe, input[type=password]").count(), 0);

  for (const theme of ["light", "dark"]) {
    await tab.playwright.getByRole("button", { name: theme === "light" ? "淺色模式" : "深色模式", exact: true }).click();
    assert.equal(await tab.playwright.locator("[data-editing-handbook]").getAttribute("data-theme"), theme);
    await overflow();
    for (const [index, id] of termIds.entries()) {
      await tab.playwright.getByRole("tab").nth(index).click();
      assert.equal(await tab.playwright.locator("#handbook-term-panel").getAttribute("data-active-term"), id);
    }
    await tab.playwright.getByRole("tab").first().press("Home");
    await tab.playwright.getByRole("tab").first().press("ArrowRight");
    assert.equal(await tab.playwright.locator("#handbook-term-panel").getAttribute("data-active-term"), "camera-movement");
    await image(`handbook-free-${theme}`);
    await tab.playwright.locator('[data-premium-card="glossary"]').click();
    assert.ok(await tab.playwright.getByRole("heading", { name: "會員專屬內容", exact: true }).isVisible());
    assert.ok(await tab.playwright.getByText("會員功能準備中", { exact: true }).isVisible());
    await image(`premium-dialog-${theme}`);
    await tab.ax.pressKey(null, "Escape");
    assert.equal(await tab.playwright.evaluate(() => document.activeElement?.getAttribute("data-premium-card")), "glossary");
    await image(`premium-cards-${theme}`);
    rows.push({ width, theme, check: "Handbook six terms / keyboard / Premium dialog / focus / no overflow", result: "PASS" });
  }
  await tab.reload();
  await tab.playwright.locator('[data-editing-handbook][data-theme="dark"]').waitFor({ state: "visible" });
  assert.equal(await tab.playwright.evaluate(() => document.querySelector("[data-handbook-intro]")?.open), false);
  await overflow();
  const logs = await tab.dev.logs({ levels: ["error"], limit: 30 });
  const unexpected = logs.filter(log => !/404|ex-galaxy-ui/.test(log.message));
  assert.equal(unexpected.length, 0, JSON.stringify(unexpected));
  await writeFile(resolve(evidence, "browser-results.json"), JSON.stringify({ scope: "LOCAL_STATIC_BUILD_BROWSER_RUNTIME", browser: "ChatGPT in-app Chromium", rows, audiblePlayback: "PLAY_REQUEST_ACCEPTED_WHERE_PLAYING; HARDWARE_AUDIO_NOT_VERIFIED", iphoneSafari: "HUMAN_QA_REQUIRED", knownConsoleNoise: "EX AI ex-galaxy-ui prefetch 404" }, null, 2));
  return { width, result: "PASS", checks: rows.filter(row => row.width === width).length };
}

// Prepare UI in one tool call, then call this in the NEXT call. This browser's
// compositor can lag behind same-call DOM changes. Inspect resulting pixels;
// an AX/DOM assertion alone is not proof of a correct screenshot.
export async function savePreparedReview({ tab, evidence, name }) {
  await mkdir(evidence, { recursive: true });
  const proof = await tab.ax.get("both");
  assert.ok(proof.screenshot);
  await writeFile(resolve(evidence, `${name}.jpg`), proof.screenshot);
  await writeFile(resolve(evidence, `${name}.ax.txt`), proof.state);
  return { saved: name, url: await tab.url() };
}
