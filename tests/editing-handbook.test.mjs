import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import sharp from "sharp";
import { loadHandbookData, validateHandbookSource, validateHandbookOutput } from "../scripts/validate-editing-handbook.mjs";

const data = await loadHandbookData();
const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("public schema contains exactly the six owner-approved introductions and curated feature names", async () => {
  assert.equal((await validateHandbookSource()).sourceCheck, "PASS");
  assert.equal(data.handbookTerms.length, 6);
  assert.equal(new Set(data.handbookTerms.map(term => term.id)).size, 6);
  assert.deepEqual(data.handbookTerms.map(term => term.english), ["Shot Size", "Camera Movement", "Transition", "B-roll", "Jump Cut", "Timeline"]);
});

test("Handbook intro uses approved media independently of the pending Academy course", async () => {
  assert.equal(data.resolveHandbookVideo(data.handbookIntroVideo), "AVAILABLE");
  assert.equal(data.handbookIntroVideo.videoSrc, "/media/editing-handbook/intro-24s.web.mp4");
  assert.equal(data.handbookIntroVideo.duration, "0:24");
  assert.equal(data.resolveHandbookVideo({ ...data.handbookIntroVideo, videoStatus: "PENDING", videoSrc: null }), "PENDING");
  const available = { ...data.handbookIntroVideo, videoStatus: "AVAILABLE", videoSrc: "/media/editing-handbook/intro.mp4" };
  assert.equal(data.resolveHandbookVideo(available), "FALLBACK");
  const registry = [{ src: available.videoSrc, kind: "video", status: "APPROVED_LOCAL" }];
  assert.equal(data.resolveHandbookVideo(available, registry), "AVAILABLE");
  assert.equal(data.resolveHandbookVideo({ ...available, videoStatus: "UNKNOWN" }, registry), "FALLBACK");
  assert.equal(data.resolveHandbookVideo(available, [{ ...registry[0], status: "MOCK_ONLY" }]), "FALLBACK");
  assert.equal(data.resolveHandbookVideo({ ...available, videoSrc: "https://example.com/video.mp4" }, registry), "FALLBACK");
  assert.match(await read("src/data/editing-academy.ts"), /lessonId: "first-short-video"/);
  assert.notEqual(data.handbookIntroVideo.id, "first-short-video");
});

test("media guards reject traversal, encoded backslashes and unapproved auxiliary sources", () => {
  for (const path of ["//evil.test/video.mp4", "/media/editing-handbook/../private.mp4", "/media/editing-handbook/%2e%2e/private.mp4", "/media/editing-handbook/%5cprivate.mp4", "/media/editing-handbook/video.mp4?token=unsafe"]) assert.equal(data.isSafeHandbookMediaPath(path), false, path);
  assert.equal(data.resolveHandbookAuxiliaryMedia("/media/editing-handbook/subtitles.vtt", "captions"), undefined);
  assert.equal(data.resolveHandbookAuxiliaryMedia("/media/editing-handbook/subtitles.vtt", "captions", [{ src: "/media/editing-handbook/subtitles.vtt", kind: "captions", status: "APPROVED_LOCAL" }]), "/media/editing-handbook/subtitles.vtt");
});

test("optimized approved book derivatives retain transparency and accurate metadata", async () => {
  const manifest = JSON.parse(await read("public/images/editing-handbook/asset-manifest.json"));
  assert.equal(manifest.referenceOnlyLayoutImageIncluded, false);
  assert.equal(manifest.sourceSha256, "f60a41fd56189a58bce6793089dbc7ad09d5c6c48dff0860d9bae069112ee3fa");
  for (const asset of manifest.assets) {
    const file = new URL(`../public${asset.src}`, import.meta.url);
    const metadata = await sharp(await readFile(file)).metadata();
    assert.equal(metadata.width, asset.width);
    assert.equal(metadata.height, asset.height);
    assert.equal(metadata.hasAlpha, true);
    assert.equal((await stat(file)).size, asset.bytes);
    assert.equal(asset.status, "APPROVED_LOCAL");
    assert.ok(asset.alt && asset.bytes < 200000);
    assert.equal(metadata.exif, undefined);
  }
});

test("the exported Handbook is one canonical route with an idle real intro and no protected source payloads", async () => {
  assert.equal((await validateHandbookOutput()).outputCheck, "PASS");
  const html = await read("out/ex-ai/editing/handbook/index.html");
  assert.match(html, /canonical[^>]+\/ex-ai\/editing\/handbook\//);
  assert.match(html, /24 秒，看懂剪輯語言/);
  assert.doesNotMatch(html, /VIDEO_PENDING|教學影片準備中/);
  assert.match(html, /規劃中，尚未開放訂閱/);
  assert.equal((html.match(/<video\b/g) ?? []).length, 1);
  assert.doesNotMatch(html, /<iframe|<form|autoPlay=|autoplay=/);
  assert.match(html, /preload="none"/);
  const home = await read("out/ex-ai/index.html");
  assert.equal((home.match(/data-handbook-entry=/g) ?? []).length, 2);
  assert.match(home, /href="\/resources\/?"/);
  assert.match(home, /Latest tutorial/);
  const academy = await read("out/ex-ai/editing/index.html");
  assert.equal((academy.match(/data-handbook-entry=/g) ?? []).length, 1);
  assert.match(academy, /VIDEO_PENDING/);
});
