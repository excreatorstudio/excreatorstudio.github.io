import assert from "node:assert/strict";
import test, { before, after } from "node:test";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, extname, sep } from "node:path";
import { chromium } from "playwright-core";

// Explicit local acceptance: node --test tests/creator-universe-browser.test.mjs
// Requires a fresh npm run build. Never contacts production services.
const root = resolve("out");
let server, browser, url;
const errors = [];
before(async () => {
  assert.ok(existsSync(resolve(root, "universe-preview/index.html")), "Build the prototype first");
  server = createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
      let file = resolve(root, `.${pathname}`, pathname.endsWith("/") ? "index.html" : "");
      if (!extname(file) && existsSync(resolve(file, "index.html"))) file = resolve(file, "index.html");
      if (!file.startsWith(root + sep)) throw new Error("outside static output");
      const content = await readFile(file);
      res.writeHead(200, { "Content-Type": ({ ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2" })[extname(file)] ?? "application/octet-stream" });
      res.end(content);
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise(resolveListen => server.listen(0, "127.0.0.1", resolveListen));
  url = `http://127.0.0.1:${server.address().port}/universe-preview/`;
  const executablePath = ["C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Microsoft/Edge/Application/msedge.exe"].find(existsSync);
  browser = await chromium.launch({ executablePath, headless: true });
});
after(async () => { await browser?.close(); if (server) await new Promise(done => server.close(done)); });

async function open(width, options = {}) {
  const context = await browser.newContext({ viewport: { width, height: 950 }, ...options });
  // Keep this a static local test; do not make auth or other external requests.
  await context.route("**/*", route => route.request().url().startsWith("http://127.0.0.1:") ? route.continue() : route.abort());
  const page = await context.newPage();
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(url);
  await page.waitForFunction(() => document.querySelector('[data-motion-mode]')?.getAttribute('data-motion-mode') !== 'reduced');
  return { page, context };
}
async function geometry(page) {
  return page.evaluate(() => {
    const nodes = [...document.querySelectorAll("[data-galaxy]")];
    const boxes = nodes.map(node => { const r = node.getBoundingClientRect(); return { id: node.dataset.galaxy, x: r.x, y: r.y, right: r.right, bottom: r.bottom }; });
    const labels = nodes.flatMap(node => [...node.querySelectorAll("strong, small, [class*='galaxyCopy'] > span")]).map(node => ({ text: node.textContent, clipped: node.scrollWidth > node.clientWidth + 1 }));
    return { width: innerWidth, scroll: document.documentElement.scrollWidth, boxes, labels };
  });
}
async function capture(page, name) {
  if (!process.env.UNIVERSE_QA_OUTPUT) return;
  await mkdir(process.env.UNIVERSE_QA_OUTPUT, { recursive: true });
  await page.screenshot({ path: resolve(process.env.UNIVERSE_QA_OUTPUT, `${name}.png`), fullPage: true });
}
for (const width of [1440, 1024, 768, 390]) {
  test(`rendered ${width}px: visible labels, no overflow or galaxy overlap`, async () => {
    const { page, context } = await open(width, width === 390 ? { isMobile: true, hasTouch: true } : {});
    await page.waitForTimeout(600);
    for (const id of [null, "knowledge", "create", "language", "insight"]) {
      if (id) { await page.locator(`[data-galaxy="${id}"]`).focus(); await page.waitForTimeout(1100); }
      const g = await geometry(page);
      assert.ok(g.scroll <= g.width, JSON.stringify(g));
      for (const box of g.boxes) assert.ok(box.x >= 0 && box.right <= g.width, JSON.stringify(box));
      for (const label of g.labels) assert.equal(label.clipped, false, label.text);
      for (let i = 0; i < g.boxes.length; i++) for (let j = i + 1; j < g.boxes.length; j++) {
        const a = g.boxes[i], b = g.boxes[j];
        assert.ok(a.right <= b.x || b.right <= a.x || a.bottom <= b.y || b.bottom <= a.y, `${width}: ${a.id} overlaps ${b.id}`);
      }
      if (!id || id === "knowledge") await capture(page, `${width}-${id ?? "idle"}`);
    }
    await context.close();
  });
}
test("focus transfers gradually, retreats neighbours, and frame writes stop after settling", async () => {
  const { page, context } = await open(1440);
  const knowledge = page.locator('[data-galaxy="knowledge"]');
  await knowledge.focus(); await page.waitForTimeout(1200);
  const depths = await page.locator("[data-galaxy]").evaluateAll(nodes => nodes.map(node => ({ id: node.dataset.galaxy, z: new DOMMatrix(getComputedStyle(node).transform).m43 })));
  assert.ok(depths.find(n => n.id === "knowledge").z > 200);
  assert.ok(depths.find(n => n.id === "insight").z < -80);
  await page.locator('[data-galaxy="create"]').focus();
  await page.waitForTimeout(60);
  const weight = Number(await knowledge.evaluate(node => node.style.getPropertyValue("--focus-weight")));
  assert.ok(weight > 0 && weight < 1, `continuous departure: ${weight}`);
  await page.waitForTimeout(1500);
  const writes = await page.evaluate(() => new Promise(done => {
    let count = 0;
    const observer = new MutationObserver(records => { count += records.length; });
    observer.observe(document.querySelector('[data-testid="universe-pointer-field"]'), { attributes: true, subtree: true, attributeFilter: ["style"] });
    setTimeout(() => { observer.disconnect(); done(count); }, 250);
  }));
  assert.equal(writes, 0, "idle frame loop must settle");
  await page.mouse.move(10, 10);
  await page.locator('[data-galaxy="insight"]').focus();
  await page.keyboard.press("Tab");
  await page.waitForTimeout(1100);
  assert.equal(await page.locator("[data-active-galaxy]").getAttribute("data-active-galaxy"), "none");
  await context.close();
});
test("pointer proximity, pitch/yaw and safe navigation remain functional", async () => {
  const { page, context } = await open(1440);
  await page.locator('[data-galaxy="knowledge"]').hover(); await page.waitForTimeout(900);
  assert.equal(await page.locator("[data-active-galaxy]").getAttribute("data-active-galaxy"), "knowledge");
  const matrix = await page.locator("[data-active-galaxy]").evaluate(node => getComputedStyle(node).transform);
  assert.match(matrix, /matrix3d/);
  await page.locator('[data-galaxy="knowledge"]').focus();
  await page.keyboard.press("Space");
  await page.waitForURL(/\/ai-learning\/?$/);
  await context.close();
});
test("environment follows focus with layered depth, light lag and a stable core", async () => {
  const { page, context } = await open(1440);
  const layer = name => page.locator(`[data-depth-layer="${name}"]`);
  const matrix = locator => locator.evaluate(el => { const m = new DOMMatrix(getComputedStyle(el).transform); return { x: m.m41, y: m.m42, z: m.m43 }; });
  const backBefore = await matrix(layer("back"));
  await page.evaluate(() => {
    window.__lightLagObserved = false;
    const el = document.querySelector('[data-testid="universe-pointer-field"]');
    const observer = new MutationObserver(() => {
      const focus = Math.abs(Number(el.style.getPropertyValue("--focus-x")));
      const light = Math.abs(Number(el.style.getPropertyValue("--light-x")));
      if (focus > light + 0.0005) window.__lightLagObserved = true;
    });
    observer.observe(el, { attributes: true, attributeFilter: ["style"] });
    setTimeout(() => observer.disconnect(), 1800);
  });
  await page.locator('[data-galaxy="knowledge"]').focus();
  await page.waitForTimeout(1700);
  assert.equal(await page.evaluate(() => window.__lightLagObserved), true, "light follows more slowly than focus");
  assert.ok((await matrix(layer("back"))).z < backBefore.z - 70, "background pulls away");
  assert.ok((await matrix(layer("deep"))).z < (await matrix(layer("back"))).z);
  assert.ok((await matrix(layer("front"))).z > 100);
  assert.ok(Number(await layer("local-orbit").evaluate(el => getComputedStyle(el).opacity)) > 0.5);
  assert.ok(await page.locator('[data-testid="universe-core"]').isVisible());
  await capture(page, "1440-environment-focus");
  await context.close();
});

test("corner sweeps separate parallax rates; bounded velocity decays and the loop sleeps", async () => {
  const { page, context } = await open(1440);
  const field = page.locator('[data-testid="universe-pointer-field"]');
  const bounds = await field.boundingBox();
  const positions = () => page.locator('[data-depth-layer]').evaluateAll(nodes => Object.fromEntries(nodes.map(el => [el.dataset.depthLayer, new DOMMatrix(getComputedStyle(el).transform).m41])));
  await page.mouse.move(bounds.x + 25, bounds.y + 25);
  await page.waitForTimeout(1800);
  const left = await positions();
  await page.mouse.move(bounds.x + bounds.width - 25, bounds.y + Math.min(bounds.height - 25, 700));
  await page.waitForTimeout(50);
  await page.mouse.move(bounds.x + 30, bounds.y + 30);
  await page.waitForTimeout(40);
  const speed = await field.evaluate(el => Number(el.style.getPropertyValue("--velocity-x")));
  assert.ok(Math.abs(speed) > 0 && Math.abs(speed) <= 1);
  await page.mouse.move(bounds.x + bounds.width - 25, bounds.y + 30);
  await page.waitForTimeout(2000);
  const right = await positions();
  assert.ok(Math.abs(right.front - left.front) > Math.abs(right.deep - left.deep) * 10);
  assert.equal(await field.evaluate(el => Number(el.style.getPropertyValue("--velocity-x"))), 0);
  const writes = await field.evaluate(el => new Promise(done => {
    let count = 0;
    const observer = new MutationObserver(records => { count += records.length; });
    observer.observe(el, { attributes: true, attributeFilter: ["style"] });
    setTimeout(() => { observer.disconnect(); done(count); }, 300);
  }));
  assert.equal(writes, 0);
  await context.close();
});

test("reduced motion has no camera or focus travel; low GPU mode removes ambient animation", async () => {
  const { page, context } = await open(1024);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForFunction(() => document.querySelector('[data-motion-mode]').dataset.motionMode === "reduced");
  const node = page.locator('[data-galaxy="knowledge"]');
  const before = await node.evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m43);
  await node.focus(); await page.waitForTimeout(100);
  assert.equal(await node.evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m43), before);
  assert.equal(await page.locator("[data-active-galaxy]").evaluate(el => getComputedStyle(el).transform), "none");
  assert.equal(await page.locator('[data-depth-layer="front"]').evaluate(el => getComputedStyle(el).display), "none");
  assert.equal(await page.locator('[data-depth-layer="local-orbit"]').evaluate(el => getComputedStyle(el).display), "none");
  await context.close();
  const low = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  await low.addInitScript(() => Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 2 }));
  const lowPage = await low.newPage(); await lowPage.goto(url);
  await lowPage.waitForFunction(() => document.querySelector('[data-motion-mode]').dataset.motionMode === "low-gpu");
  assert.equal(await lowPage.locator('[data-testid="universe-core"] > div').first().evaluate(el => getComputedStyle(el).animationName), "none");
  await low.close();
  assert.deepEqual(errors, []);
});
