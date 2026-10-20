import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import test from "node:test";
import sharp from "sharp";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Hero book belongs to the Creator Academy title row while the heading retains its accessible name", async () => {
  const hero = await read("src/components/CreatorStudioHero.tsx");
  assert.match(hero, /aria-label="E.X AI 創作中心 × 創作者學院"/);
  assert.match(hero, /heroAcademyRow[\s\S]*creator-hero__title-accent[\s\S]*<HandbookEntry variant="hero"\s*\/>[\s\S]*<\/span>[\s\S]*<\/h1>/);
  assert.equal((hero.match(/<HandbookEntry/g) ?? []).length, 1);
  for (const protectedControl of ["AIVideoCenterSwitch", "PersonalBrandShowcaseFloat", "InteractiveGlassNavigator", "creator-site-search"]) assert.ok(hero.includes(protectedControl));
});

test("Hero layout reserves natural flow, scales the book, wraps safely and avoids an infinite hover animation", async () => {
  const css = await read("src/components/editing-handbook/editing-handbook.module.css");
  const entryRule = css.match(/\.heroEntry\s*\{([^}]+)\}/)[1];
  assert.doesNotMatch(entryRule, /position:\s*(absolute|fixed)|left:|top:|display:\s*none|opacity:\s*0/);
  assert.match(entryRule, /width:\s*clamp\(120px, 11vw, 160px\)/);
  assert.match(css, /\.heroHeading \.heroAcademyRow\s*\{[^}]*display:\s*flex;[^}]*flex-wrap:\s*wrap/);
  assert.match(css, /\.heroEntry:hover > \.book\s*\{[^}]*animation:\s*none/);
  assert.match(css, /prefers-reduced-motion:\s*reduce[^]*?\.heroEntry:hover > \.book, \.heroEntry:active > \.book\s*\{[^}]*transform:\s*none/);
  assert.match(css, /\.entry:focus-visible[^}]*outline:\s*2px/);
});

test("Hero uses the exact approved transparent PNG; other book entries keep their existing derivatives", async () => {
  const bytes = await readFile(new URL("../public/images/editing-handbook/book-entry.png", import.meta.url));
  const manifest = JSON.parse(await read("public/images/editing-handbook/asset-manifest.json"));
  assert.equal(createHash("sha256").update(bytes).digest("hex"), manifest.sourceSha256);
  assert.equal(manifest.heroAsset.sha256, manifest.sourceSha256);
  assert.equal(manifest.heroAsset.status, "APPROVED_LOCAL");
  assert.equal(bytes.length, manifest.heroAsset.bytes);
  const meta = await sharp(bytes).metadata();
  assert.equal(meta.width, 1254); assert.equal(meta.height, 1254); assert.equal(meta.hasAlpha, true);
  const entry = await read("src/components/editing-handbook/HandbookEntry.tsx");
  const book = await read("src/components/editing-handbook/HandbookBook.tsx");
  assert.match(entry, /original=\{variant === "hero"\}/);
  assert.match(book, /original = false/);
  assert.match(book, /!original && <source/);
  assert.match(book, /original \? "\/images\/editing-handbook\/book-entry.png" : "\/images\/editing-handbook\/book-512.webp"/);
});

test("export retains the real Handbook href, intro-first flow and other EX AI sections", async () => {
  const html = await read("out/ex-ai/index.html");
  const hero = html.match(/<section class="creator-hero"[\s\S]*?<\/h1>/)?.[0];
  assert.ok(hero);
  assert.match(hero, /data-handbook-entry="hero"/);
  assert.match(hero, /href="\/ex-ai\/editing\/handbook\/"/);
  assert.match(hero, /src="\/images\/editing-handbook\/book-entry.png"/);
  assert.equal((html.match(/<video\b/g) ?? []).length, 1);
  for (const copy of ["Learning Apps", "Creator Academy", "剪輯實戰學院", "教學資源", "免費資源庫", "Latest tutorial"]) assert.ok(html.includes(copy), copy);
  assert.match(await read("src/components/editing-handbook/HandbookIntroPlayer.tsx"), /isPlainHandbookActivation/);
});
