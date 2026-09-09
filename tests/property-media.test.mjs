import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

test("Property Media route, entry and reusable media data are wired", () => {
  const page = read("src/app/property-media/page.tsx");
  const experience = read("src/components/property-media/PropertyMediaExperience.tsx");
  const data = read("src/data/property-media.ts");
  const home = read("src/app/page.tsx");
  const universe = read("src/components/universe/UniversePreview.tsx");

  assert.match(page, /PropertyMediaExperience/);
  assert.match(page, /property-media\//);
  assert.match(page, /E\.X Property Media｜房產影音與空間視覺服務/);
  assert.match(data, /property-media-intro\.mp4/);
  assert.match(experience, /autoPlay muted playsInline/);
  assert.match(experience, /onEnded=\{finishIntro\}/);
  assert.match(experience, /onError=/);
  assert.match(experience, /prefers-reduced-motion/);
  assert.match(data, /propertyMediaCategories/);
  for (const category of ["immersive", "presenter", "ai-staging", "land-ai", "other-ai"]) assert.match(data, new RegExp(`id: "${category}"`));
  assert.match(`${home}\n${universe}`, /PropertyMediaEntry/);
});

test("Property Media Stage 2 portfolio is data-driven and uses verified media paths", () => {
  const portfolio = read("src/data/property-media-portfolio.ts");
  const explorer = read("src/components/property-media/PropertyMediaPortfolio.tsx");
  const card = read("src/components/property-media/PropertyMediaCard.tsx");

  for (const category of ["PROPERTY_VIDEO", "PRESENTER", "AI_STAGING", "LAND_VISUAL", "AI_VISUAL"]) assert.match(portfolio, new RegExp(category));
  assert.match(portfolio, /propertyMediaPortfolioFilters/);
  assert.match(portfolio, /featured: true/);
  assert.match(portfolio, /\/media\/property-media/);
  assert.match(portfolio, /\/images\/property-media\/posters/);
  assert.match(explorer, /aria-pressed/);
  assert.match(explorer, /activeFilter/);
  assert.match(card, /unoptimized priority=\{featured\}/);
  assert.doesNotMatch(card, /<video/);
});

test("Property Media lightbox is accessible and loads video only after selection", () => {
  const lightbox = read("src/components/property-media/PropertyMediaLightbox.tsx");
  assert.match(lightbox, /role="dialog"/);
  assert.match(lightbox, /aria-modal="true"/);
  assert.match(lightbox, /event\.key === "Escape"/);
  assert.match(lightbox, /document\.body\.style\.overflow = "hidden"/);
  assert.match(lightbox, /previousFocus\.current\?\.focus/);
  assert.match(lightbox, /controls autoPlay playsInline preload="metadata"/);
  assert.match(lightbox, /lightboxPortrait/);
});

test("Property Media AI staging discloses its production boundary", () => {
  const staging = read("src/components/property-media/AIStagingShowcase.tsx");
  assert.match(staging, /AI-generated spatial visualization/);
  assert.match(staging, /Before \/ After/);
  assert.match(staging, /可驗證的同場景/);
  assert.doesNotMatch(read("src/components/property-media/PropertyMediaExperience.tsx"), /PropertyMediaInquiry|<[^>]*Inquiry/i);
});

test("Property Media is a showcase-only experience with a clean service ending", () => {
  const files = [
    "src/components/property-media/PropertyMediaExperience.tsx",
    "src/data/property-media-portfolio.ts",
  ].map(read).join("\n");
  assert.match(files, /<PropertyMediaServices \/>/);
  assert.match(files, /<PropertyMediaLightbox/);
  assert.doesNotMatch(files, /PropertyMediaInquiry|booking|reservation|appointment|calendar|預約|選擇日期|選擇時段/i);
  assert.equal(fs.existsSync(path.join(root, "src/components/property-media/PropertyMediaInquiry.tsx")), false);
});

test("Property Media Stage 2 documents and responsive contracts exist", () => {
  const css = read("src/components/property-media/property-media.module.css");
  const productDoc = read("docs/property-media/stage-2-portfolio-and-services.md");
  const assetDoc = read("docs/property-media/stage-2-asset-map.md");
  assert.ok(fs.existsSync(path.join(root, "docs/property-media/stage-2-portfolio-and-services.md")));
  assert.ok(fs.existsSync(path.join(root, "docs/property-media/stage-2-asset-map.md")));
  assert.match(css, /filterRail/);
  assert.match(css, /max-width: 639px/);
  assert.match(css, /overflow-x: auto/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(productDoc, /No customer, address, transaction/);
  assert.match(assetDoc, /Total poster count: 19/);
});

test("Property Media media files exist without changing their source names", () => {
  const files = [
    "public/media/property-media/intro/property-media-intro.mp4",
    "public/media/property-media/immersive/immersive-01.mp4",
    "public/media/property-media/presenter/presenter-01.mp4",
    "public/media/property-media/ai-staging/ai-staging-01.mp4",
    "public/media/property-media/land-ai/land-ai-01.mp4",
    "public/media/property-media/other-ai/other-ai-01.mp4",
  ];
  for (const file of files) assert.ok(fs.existsSync(path.join(root, file)), file);
  const posters = [
    "public/images/property-media/posters/immersive/immersive-01.jpg",
    "public/images/property-media/posters/presenter/presenter-01.jpg",
    "public/images/property-media/posters/ai-staging/ai-staging-01.jpg",
    "public/images/property-media/posters/land-ai/land-ai-01.jpg",
    "public/images/property-media/posters/other-ai/other-ai-01.jpg",
  ];
  for (const file of posters) assert.ok(fs.existsSync(path.join(root, file)), file);
});

test("Property Media experience has a cinematic handoff and safe no-overflow mobile CSS", () => {
  const css = read("src/components/property-media/property-media.module.css");
  const experience = read("src/components/property-media/PropertyMediaExperience.tsx");
  assert.match(css, /introHandoff/);
  assert.match(css, /filter: blur\(9px\)/);
  assert.match(css, /object-fit: cover/);
  assert.match(css, /max-width: 639px/);
  assert.match(css, /overflow: clip/);
  assert.match(experience, /heroBackground/);
  assert.match(experience, /heroTextPlate/);
  assert.ok(fs.existsSync(path.join(root, "public/images/property-media/hero/hero-ui-overlay.png")));
});

test("Property Media Hero visual upgrade stays showcase-only", () => {
  const css = read("src/components/property-media/property-media.module.css");
  const experience = read("src/components/property-media/PropertyMediaExperience.tsx");
  assert.match(css, /hero-ui-overlay\.png/);
  assert.match(css, /backdrop-filter: blur\(13px\)/);
  assert.match(css, /heroTextPlate/);
  assert.doesNotMatch(experience, /PropertyMediaInquiry|booking|reservation|appointment|calendar|預約|選擇日期|選擇時段/i);
});

test("Property Media portfolio uses an obsidian surface and restrained glass sweep", () => {
  const css = read("src/components/property-media/property-media.module.css");
  assert.match(css, /Stage 2A\.1/);
  assert.match(css, /selectedWorks, \.portfolio/);
  assert.match(css, /rgba\(244, 215, 154, \.42\)/);
  assert.match(css, /propertyMediaGlassSweep/);
  assert.match(css, /translate3d\(-150%, 0, 0\)/);
  assert.match(css, /animation-duration: 14\.8s/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});

test("Property Media Stage 2A.1.2 blends gold veins and fine cracks with a periodic sweep", () => {
  const css = read("src/components/property-media/property-media.module.css");
  assert.match(css, /Stage 2A\.1\.2/);
  assert.match(css, /background-blend-mode: screen/);
  assert.match(css, /rgba\(244, 215, 154, \.12\)/);
  assert.match(css, /rgba\(213, 170, 97, \.1\)/);
  assert.match(css, /animation-duration: 10\.8s/);
  assert.match(css, /mix-blend-mode: screen/);
  assert.match(css, /animation-duration: 12s/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});
