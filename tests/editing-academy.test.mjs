import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import sharp from "sharp";

const root = new URL("../", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");
const source = await read("src/data/editing-academy.ts");
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
const { editingCourses: courses, editingAssets: assets, editingInquiry: inquiry, editingPortfolio: portfolio, editingStarterLesson: starterLesson, getEditingLessonVideoPresentation, isApprovedEditingLessonStill } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const component = await read("src/components/editing-academy/EditingAcademy.tsx");
const data = await read("src/data/editing-academy.ts");
const route = await read("src/app/ex-ai/editing/page.tsx");
const css = await read("src/components/editing-academy/editing-academy.module.css");

test("additive static editing route preserves the EX AI entry", async () => {
  assert.match(route, /EditingAcademy/);
  assert.match(route, /canonical: "\/ex-ai\/editing\/"/);
  assert.match(await read("src/app/ex-ai/page.tsx"), /CreatorStudioHero/);
  assert.match(component, /href="\/ex-ai\/"/);
  assert.doesNotMatch(route, /force-dynamic|server action|cookies\(/);
});

test("six unique typed courses contain the requested identifiers and teaching contract", () => {
  assert.deepEqual(courses.map(course => course.id), ["F01", "F02", "F03", "P01", "P02", "P03"]);
  assert.equal(new Set(courses.map(course => course.slug)).size, 6);
  for (const course of courses) {
    for (const field of ["id", "slug", "title", "category", "difficulty", "description", "thumbnail", "status", "audience", "deliveryMode"]) assert.ok(course[field], `${course.id}: ${field}`);
    assert.ok(course.learningOutcomes.length >= 2);
    assert.ok(course.syllabus.length >= 3);
  }
  assert.equal(courses[3].software, "CapCut");
  assert.equal(courses[4].software, "DaVinci Resolve");
  assert.match(courses[5].syllabus.join(), /首尾幀/);
});

test("unverified lessons, enrollment, contact, price and duration are not fabricated", () => {
  assert.ok(courses.every(course => course.status === "COMING_SOON"));
  assert.ok(courses.every(course => !course.price && !course.durationMinutes && !course.video));
  assert.equal(inquiry.status, "PENDING");
  assert.equal(inquiry.destination, null);
  assert.doesNotMatch(component, /<iframe|<form|mailto:|line\.me|href="#"/);
  assert.match(component, /controls playsInline preload="metadata"/);
  assert.match(component, /尚未開放報名/);
  assert.match(component, /不收集個人資料/);
});

test("all section CTAs target actual sections and have honest meaningful actions", () => {
  const targets = [...component.matchAll(/href="#([^"]+)"/g)].map(match => match[1]);
  for (const target of targets) assert.ok(component.includes(`id="${target}"`), target);
  assert.match(component, /onClick=\{event => onOpen\(course, event\.currentTarget\)\}/);
  assert.match(component, /課綱預覽/);
  assert.match(component, /showModal\(\)/);
  assert.match(component, /onCancel=\{event => \{ event\.preventDefault\(\); closeCourse\(\); \}\}/);
  assert.match(component, /trigger\.current\?\.focus/);
});

test("runtime image derivatives exist with accurate dimensions and conservative governance", async () => {
  assert.equal(assets.length, 2);
  for (const asset of assets) {
    assert.equal(asset.status, "MOCK_ONLY");
    assert.ok(asset.alt.includes("示意"));
    assert.ok(asset.focalPoint);
    assert.ok(!asset.src.includes("docs/") && !asset.src.startsWith("http"));
    const file = new URL(`public${asset.src}`, root);
    const metadata = await sharp(await readFile(file)).metadata();
    assert.equal(metadata.format, "webp");
    assert.equal(metadata.width, asset.width);
    assert.equal(metadata.height, asset.height);
    assert.ok((await stat(file)).size < 100_000);
  }
});

test("portfolio claims are governed placeholders, not fabricated student results", () => {
  assert.equal(portfolio.length, 4);
  for (const work of portfolio) assert.match(work.description, /示意/);
  assert.match(component, /非學員作品/);
  assert.match(component, /案例待補/);
  assert.match(component, /data-asset-status="MOCK_ONLY"/);
});

test("responsive media, reserve space, safe fallback and reduced motion are explicit", () => {
  assert.match(component, /<picture>/);
  assert.match(component, /publicAssetPath\(editingAssets\[1\]\.src\)/);
  assert.match(component, /width="1600" height="900"/);
  assert.match(component, /loading="eager" fetchPriority="high"/);
  assert.match(component, /onError=\{\(\) => setHeroFailed\(true\)\}/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /max-width: 600px/);
  assert.match(css, /max-width: 360px/);
  assert.match(css, /focus-visible/);
  assert.match(css, /aspect-ratio/);
});

test("no backend, payment or external generation boundary is introduced", () => {
  assert.doesNotMatch(`${route}\n${source}\n${component}`, /fetch\(|axios|supabase|prisma|apiKey|OPENAI|signIn|checkout|dangerouslySetInnerHTML/);
  assert.match(component, /localStorage\.setItem\("ex-editing-theme"/);
  assert.match(component, /aria-pressed=\{theme === value\}/);
  assert.match(css, /prefers-color-scheme: light/);
});

test("visual lesson has four accurate beginner steps and an honest pending video placeholder", () => {
  assert.equal(starterLesson.lessonId, "first-short-video");
  assert.equal(starterLesson.title, "一支影片，快速學會簡單剪輯");
  assert.equal(starterLesson.description, "即將帶你完成第一支短影片，從匯入素材到輸出作品。");
  assert.equal(starterLesson.videoStatus, "PENDING");
  assert.equal(starterLesson.videoSrc, null);
  assert.deepEqual(starterLesson.steps.map(({ number, title, instruction }) => ({ number, title, instruction })), [
    { number: "01", title: "匯入影片素材", instruction: "將影片加入剪輯軟體，拖曳到時間軸。" },
    { number: "02", title: "剪掉多餘片段", instruction: "保留精彩畫面，移除不需要的部分。" },
    { number: "03", title: "加入字幕", instruction: "加入簡單文字，讓影片更容易理解。" },
    { number: "04", title: "加入音樂並輸出", instruction: "調整背景音樂，輸出完成的影片。" },
  ]);
  assert.equal(getEditingLessonVideoPresentation(starterLesson), "PENDING");
  assert.match(component, /教學影片準備中/);
  assert.match(component, /此區沒有播放功能/);
  assert.match(component, /aria-pressed=\{activeIndex === index\}/);
  assert.match(component, /onKeyDown=\{event => moveStepFocus\(event, index\)\}/);
  assert.match(component, /id="learning-steps"/);
  assert.match(component, /完成這堂課，你將學會/);
  for (const outcome of ["整理素材", "剪輯影片", "加入字幕", "搭配音樂", "輸出作品"]) assert.ok(component.includes(outcome));
});

test("video configuration fails safely without approved local media; approved screenshots have accessible fallback", () => {
  const available = { ...starterLesson, videoStatus: "AVAILABLE", videoSrc: "/videos/editing-academy/first-short-video.mp4", videoAssetStatus: "APPROVED_LOCAL" };
  assert.equal(getEditingLessonVideoPresentation(available), "AVAILABLE");
  assert.equal(getEditingLessonVideoPresentation({ ...available, videoSrc: null }), "FALLBACK");
  assert.equal(getEditingLessonVideoPresentation({ ...available, videoSrc: "https://example.invalid/lesson.mp4" }), "FALLBACK");
  assert.equal(getEditingLessonVideoPresentation({ ...available, videoAssetStatus: "MOCK_ONLY" }), "FALLBACK");
  assert.equal(isApprovedEditingLessonStill(starterLesson.steps[0]), false);
  assert.equal(isApprovedEditingLessonStill({ ...starterLesson.steps[0], imageSrc: "/images/editing-academy/step-01.webp", imageAlt: "匯入素材步驟截圖", imageStatus: "APPROVED_LOCAL" }), true);
  assert.equal(isApprovedEditingLessonStill({ ...starterLesson.steps[0], imageSrc: "//unapproved.invalid/step.webp", imageAlt: "截圖", imageStatus: "APPROVED_LOCAL" }), false);
  assert.match(component, /onError=\{\(\) => setVideoFailed\(true\)\}/);
  assert.match(component, /setFailedStills\(current => \[\.\.\.current, activeStep\.imageSrc!\]\)/);
  assert.doesNotMatch(component, /autoPlay/);
  assert.doesNotMatch(data, /https:\/\/.*editing-academy.*(?:video|step)/);
});
