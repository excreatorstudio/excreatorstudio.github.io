import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const home = readFileSync(new URL("../src/app/ex-ai/page.tsx", import.meta.url), "utf8");
const entry = readFileSync(new URL("../src/components/EditingAcademyEntry.tsx", import.meta.url), "utf8");
const creatorPromo = readFileSync(new URL("../src/components/CreatorAcademyPromo.tsx", import.meta.url), "utf8");
const platform = readFileSync(new URL("../src/data/creator-platform.ts", import.meta.url), "utf8");

test("homepage adds a standalone Editing Academy entry without moving existing sections", () => {
  const yuni = home.indexOf("<CreatorAcademyPromo />");
  const editing = home.indexOf("<EditingAcademyEntry />");
  const categories = home.indexOf('aria-labelledby="categories"');
  const membership = home.indexOf("<MembershipPreview />");

  assert.ok(yuni >= 0 && yuni < editing && editing < categories && categories < membership);
  assert.match(home, /import \{ EditingAcademyEntry \} from "@\/components\/EditingAcademyEntry"/);
});

test("entry has the approved copy, tags, and real Editing Academy route", () => {
  for (const copy of [
    "EX EDITING ACADEMY",
    "剪輯實戰學院",
    "從第一支短影音開始，",
    "透過圖像步驟與實際練習，",
    "逐步掌握影片剪輯。",
    "免費學習",
    "剪輯實作",
    "AI 影片",
    "進入剪輯學院 →",
    'href="/ex-ai/editing/"',
  ]) {
    assert.ok(entry.includes(copy), `missing approved entry content: ${copy}`);
  }
});

test("entry CTA is keyboard reachable with a visible focus indicator", () => {
  assert.match(entry, /<Link[\s\S]*?href="\/ex-ai\/editing\/"/);
  assert.match(entry, /focus-visible:outline-2/);
  assert.match(entry, /min-h-12/);
});

test("Creator Academy/YUNI and all six creator categories remain present", () => {
  assert.match(creatorPromo, /Creator Academy \/ YUNI/);
  assert.match(creatorPromo, /href="\/creator-academy"/);
  for (const id of ['id: "ai"', 'id: "video"', 'id: "creator"', 'id: "courses"', 'id: "resources"', 'id: "health"']) {
    assert.ok(platform.includes(id), `missing existing category ${id}`);
  }
});
