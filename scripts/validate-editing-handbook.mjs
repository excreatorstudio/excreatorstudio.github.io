import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

export async function loadHandbookData() {
  const source = await readFile(resolve("src/data/editing-handbook/index.ts"), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
}

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? filesIn(resolve(directory, entry.name)) : resolve(directory, entry.name)))).flat();
}

export async function validateHandbookSource() {
  const data = await loadHandbookData();
  assert.equal(data.HANDBOOK_HREF, "/ex-ai/editing/handbook/");
  assert.deepEqual(data.handbookTerms.map(term => term.id), ["shot-size", "camera-movement", "transition", "b-roll", "jump-cut", "timeline"]);
  const keys = ["id", "number", "title", "english", "definition", "example", "takeaway"].sort();
  for (const term of data.handbookTerms) {
    assert.deepEqual(Object.keys(term).sort(), keys, "Public term schema cannot silently acquire full Premium content");
    for (const field of ["definition", "example", "takeaway"]) assert.ok(term[field].length > 0 && term[field].length <= 100, "Introductory copy must remain concise");
  }
  assert.deepEqual(data.handbookPremiumPreview, ["完整剪輯術語庫", "景別與運鏡指南", "剪輯工作流程", "AI 指令工具箱", "分鏡表與 JSON 範本", "進階實作教學"]);
  assert.deepEqual(data.handbookPremiumCards.map(card => card.title), [...data.handbookPremiumPreview]);
  for (const card of data.handbookPremiumCards) {
    assert.deepEqual(Object.keys(card).sort(), ["description", "id", "title"]);
    assert.ok(card.description.length <= 70, "Only short public Premium descriptions may enter this dataset");
  }
  for (const media of data.approvedHandbookMedia) {
    assert.ok(data.isSafeHandbookMediaPath(media.src));
    assert.ok(["APPROVED_LOCAL", "PRODUCTION_APPROVED"].includes(media.status));
    const file = resolve("public", `.${media.src}`);
    assert.ok((await stat(file)).isFile(), "Registered approved media must exist");
    const bytes = await readFile(file);
    if (media.kind === "video") assert.ok((/\.mp4$/i.test(media.src) && bytes.subarray(4, 8).toString() === "ftyp") || (/\.webm$/i.test(media.src) && bytes.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))), "Video format signature must match approved media");
    else if (media.kind === "captions") assert.ok(/\.vtt$/i.test(media.src) && bytes.toString("utf8").trimStart().startsWith("WEBVTT"));
    else assert.ok(/\.(webp|avif|png|jpe?g)$/i.test(media.src));
  }
  if (data.handbookIntroVideo.videoStatus === "AVAILABLE") assert.equal(data.resolveHandbookVideo(data.handbookIntroVideo), "AVAILABLE");
  const publicFiles = await filesIn(resolve("public"));
  assert.ok(publicFiles.every(file => !/excreatorstudio-site-spec|hero-layout-reference|handbook\.md|editing-handbook[\\/]private[\\/]/i.test(file)), "Private source/reference cannot be public assets");
  return { freeTerms: 6, premiumPreview: "APPROVED_FEATURE_NAMES_ONLY", registeredMedia: data.approvedHandbookMedia.length, sourceCheck: "PASS" };
}

function normalize(value) {
  return value.replace(/\\u([0-9a-f]{4})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16))).replace(/[\s\\`"'{}\[\],:：、。＋+→\-]/g, "");
}

export async function validateHandbookOutput() {
  const files = await filesIn(resolve("out"));
  assert.ok(files.includes(resolve("out/ex-ai/editing/handbook/index.html")));
  assert.ok(files.every(file => !/(^|[\\/])\.env($|\.)|[\\/]\.git[\\/]|\.(sqlite|db)$|excreatorstudio-site-spec|hero-layout-reference|handbook\.md/i.test(file)), "Unexpected private/development output");
  assert.ok(files.every(file => !/[\\/]handbook-intro-24s\.mp4$/i.test(file)), "The owner master must remain local; export the approved web derivative only");
  const sourcePath = resolve(process.env.HANDBOOK_PRIVATE_SPEC ?? "../../docs/editing-handbook/excreatorstudio-site-spec.md");
  let markers = [];
  try {
    const privateSource = await readFile(sourcePath, "utf8");
    markers = [...privateSource.matchAll(/```(?:text|json)\s*\n([\s\S]*?)```/g)].map(match => normalize(match[1]).slice(0, 42)).filter(marker => marker.length >= 24);
  } catch (error) { if (error.code !== "ENOENT") throw error; }
  let scanned = 0;
  for (const file of files) {
    if (![".html", ".txt", ".js", ".json", ".md", ".map"].includes(extname(file))) continue;
    const text = await readFile(file, "utf8");
    const normalized = normalize(text);
    assert.ok(!/excreatorstudio-site-spec|附錄 A｜完整內容|# excreatorstudio\.com｜剪片說明書網站 規劃書/.test(text), "Private specification text found in public output");
    assert.ok(markers.every(marker => !normalized.includes(marker)), `Reserved source content detected in ${file}; no content is printed`);
    scanned++;
  }
  return { outputCheck: "PASS", textAssetsScanned: scanned, privateSourceComparison: markers.length ? "PASS" : "SOURCE_NOT_PRESENT_IN_CI", privateBlocksChecked: markers.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(JSON.stringify(process.argv.includes("--output") ? await validateHandbookOutput() : await validateHandbookSource(), null, 2));
}
