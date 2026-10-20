import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import test from "node:test";
import ts from "typescript";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import sharp from "sharp";
import { loadHandbookData } from "../scripts/validate-editing-handbook.mjs";

const source = await readFile("src/lib/handbook-intro.ts", "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
const { attemptHandbookPlayback, isPlainHandbookActivation } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const data = await loadHandbookData();
const plain = { button: 0, defaultPrevented: false, altKey: false, ctrlKey: false, metaKey: false, shiftKey: false };

test("blocked playback renders an explicit audible-play action, not fake success or silent autoplay", async () => {
  const jsx = await readFile("src/components/editing-handbook/HandbookPlaybackFeedback.tsx", "utf8");
  const require = createRequire(import.meta.url);
  const compiled = ts.transpileModule(jsx, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText.replace('"react/jsx-runtime"', JSON.stringify(pathToFileURL(require.resolve("react/jsx-runtime")).href));
  const { HandbookPlaybackFeedback } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
  const html = renderToStaticMarkup(createElement(HandbookPlaybackFeedback, { state: "blocked", onPlay() {} }));
  assert.match(html, /瀏覽器尚未允許有聲播放/);
  assert.match(html, /button[^>]+type="button"[^>]*>點擊播放影片/);
  assert.doesNotMatch(html, /播放成功|靜音播放|<video/);
});

test("only an unmodified primary activation opens the intro; standard browser link behavior is preserved", () => {
  assert.equal(isPlainHandbookActivation(plain), true);
  assert.equal(isPlainHandbookActivation(plain, "_self"), true);
  for (const key of ["altKey", "ctrlKey", "metaKey", "shiftKey", "defaultPrevented"]) assert.equal(isPlainHandbookActivation({ ...plain, [key]: true }), false);
  for (const button of [1, 2]) assert.equal(isPlainHandbookActivation({ ...plain, button }), false);
  assert.equal(isPlainHandbookActivation(plain, "_blank"), false);
  assert.equal(isPlainHandbookActivation(plain, undefined, true), false);
});

test("play() runs synchronously inside the activation path and rejected audible playback is handled", async () => {
  const calls = [];
  const denied = new Error("synthetic NotAllowedError for the unit test only");
  attemptHandbookPlayback({ play() { calls.push("play"); return Promise.reject(denied); } }, error => calls.push(error));
  assert.deepEqual(calls, ["play"], "play must happen before the click handler can finish");
  calls.push("handler-returned");
  await Promise.resolve();
  assert.deepEqual(calls, ["play", "handler-returned", denied]);
});

test("synchronous media errors are caught without faking successful playback", () => {
  const error = new Error("synthetic media failure");
  const failures = [];
  attemptHandbookPlayback({ play() { throw error; } }, problem => failures.push(problem));
  assert.deepEqual(failures, [error]);
});

test("successful playback does not trigger the denied-playback handler", async () => {
  let blocked = false;
  attemptHandbookPlayback({ play: () => Promise.resolve() }, () => { blocked = true; });
  await Promise.resolve();
  assert.equal(blocked, false);
});

test("runtime intro manifest matches the approved faststart portrait asset; the owner original is excluded", async () => {
  const manifest = JSON.parse(await readFile("public/media/editing-handbook/media-manifest.json", "utf8"));
  const bytes = await readFile(`public${manifest.video.src}`);
  assert.equal(bytes.length, manifest.video.bytes);
  assert.equal(createHash("sha256").update(bytes).digest("hex"), manifest.video.sha256);
  assert.equal(manifest.ownerSource.includedInRuntime, false);
  assert.equal(manifest.video.width / manifest.video.height, 9 / 16);
  assert.ok(manifest.video.durationSeconds > 23 && manifest.video.durationSeconds < 25);
  assert.equal(manifest.video.audioCopiedWithoutReencoding, true);
  const boxes = [];
  for (let offset = 0; offset + 8 <= bytes.length;) {
    const size = bytes.readUInt32BE(offset);
    boxes.push(bytes.subarray(offset + 4, offset + 8).toString());
    assert.ok(size >= 8 && offset + size <= bytes.length);
    offset += size;
  }
  assert.ok(boxes.indexOf("moov") >= 0 && boxes.indexOf("moov") < boxes.indexOf("mdat"));
  const poster = await sharp(await readFile(`public${manifest.poster.src}`)).metadata();
  assert.equal(poster.width, 540);
  assert.equal(poster.height, 960);
  assert.equal(poster.exif, undefined);
});

test("Premium cards contain short preview metadata only and no hidden content dataset", () => {
  assert.equal(data.handbookPremiumCards.length, 6);
  for (const card of data.handbookPremiumCards) {
    assert.deepEqual(Object.keys(card).sort(), ["description", "id", "title"]);
    assert.ok(card.description.length < 70);
  }
});

test("exported entry routes each have one shared non-autoplay player and standard Handbook hrefs", async () => {
  for (const path of ["ex-ai", "ex-ai/editing", "ex-ai/editing/handbook", "resources"]) {
    const html = await readFile(`out/${path}/index.html`, "utf8");
    assert.equal((html.match(/<video\b/g) ?? []).length, 1, path);
    assert.match(html, /preload="none"/);
    assert.doesNotMatch(html, /autoPlay=|autoplay=|muted=""|<iframe|<form|input[^>]*password/);
    assert.match(html, /href="\/ex-ai\/editing\/handbook\/"/);
    assert.doesNotMatch(html, /excreatorstudio-site-spec|handbook-intro-24s\.mp4/);
  }
  const resources = await readFile("out/resources/index.html", "utf8");
  assert.match(resources, /教學資源中心/);
  assert.match(resources, /LEARNING RESOURCES/);
  assert.match(resources, /此分類的首批教學與資源正在整理，敬請期待。/);
});
