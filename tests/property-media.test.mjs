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

test("Property Media vNext assets are present and the intro v2 path is registered without activation", () => {
  const data = read("src/data/property-media.ts");
  const vnext = read("src/data/property-media-vnext.ts");
  const experience = read("src/components/property-media/PropertyMediaExperience.tsx");
  const files = [
    "public/images/property-media/hero/property-media-hero-bright-wide.png",
    "public/images/property-media/backgrounds/property-media-obsidian-gold.png",
    "public/media/property-media/intro/property-media-intro-v2.mp4",
    "docs/design/property-media/vnext/property-media-vnext-reference-01.png",
    "docs/design/property-media/vnext/property-media-vnext-reference-02.png",
    "docs/design/property-media/vnext/property-media-vnext-fullpage-reference.png",
  ];
  for (const file of files) assert.ok(fs.existsSync(path.join(root, file)), file);
  assert.match(data, /propertyMediaIntroV2 = "\/media\/property-media\/intro\/property-media-intro-v2\.mp4"/);
  assert.match(vnext, /propertyMediaVnextIntro = propertyMediaIntroV2/);
  assert.match(vnext, /propertyMediaVnextOrbit/);
  assert.doesNotMatch(experience, /propertyMediaIntroV2|propertyMediaVnextOrbit/);
  assert.match(read(".gitattributes"), /public\/media\/property-media\/\*\*\/\*\.mp4 filter=lfs/);
});

test("Property Media vNext orbit projection has three ordered featured worlds with presenter centered", () => {
  const vnext = read("src/data/property-media-vnext.ts");
  const categories = [...vnext.matchAll(/category: "(immersive|presenter|ai-staging)"/g)].map((match) => match[1]);
  assert.deepEqual(categories, ["immersive", "presenter", "ai-staging"]);
  assert.deepEqual([...vnext.matchAll(/placement: "(left|center|right)"/g)].map((match) => match[1]), ["left", "center", "right"]);
  assert.equal((vnext.match(/defaultActive: true/g) ?? []).length, 1);
  assert.match(vnext, /portfolioItemId: "presenter-01"[\s\S]*?title: "空間口播導覽"[\s\S]*?defaultActive: true/);
  assert.match(vnext, /portfolioItemId: "immersive-01"/);
  assert.match(vnext, /portfolioItemId: "ai-staging-01"/);
  assert.match(vnext, /cardAspectRatio: "3:4"/);
  assert.match(vnext, /openedMediaAspectRatio: "native"/);
  assert.match(vnext, /displayAspectRatio: propertyMediaVnextDisplayContract\.cardAspectRatio/);
  assert.match(vnext, /openedAspectRatio: propertyMediaVnextDisplayContract\.openedMediaAspectRatio/);
  assert.match(vnext, /lightboxTarget/);
  assert.match(vnext, /cardObjectFit: "cover"/);
  assert.match(vnext, /lightboxObjectFit: "contain"/);
  assert.match(read("src/components/property-media/PropertyMediaLightbox.tsx"), /item\.aspectRatio/);
  assert.match(read("src/components/property-media/property-media.module.css"), /\.lightboxVideo \{[\s\S]*object-fit: contain/);
});

test("Property Media vNext contracts are documented separately from the Phase 2 visual implementation", () => {
  const plan = read("docs/property-media/vnext-plan.md");
  const assets = read("docs/property-media/vnext-asset-map.md");
  assert.match(plan, /Phase 1 Foundation/);
  assert.match(plan, /Phase 2 — visual implementation pending/);
  assert.match(plan, /3:4/);
  assert.match(plan, /native/);
  assert.match(plan, /presenter-01/);
  assert.match(plan, /Orbit component API contract/);
  assert.match(plan, /Phase 1\.5 — implementation prep complete/);
  assert.match(plan, /touch-action: pan-y/);
  assert.match(assets, /property-media-intro-v2\.mp4/);
  assert.match(assets, /Duration\/resolution unavailable/);
  assert.match(assets, /never a runtime dependency/);
  assert.match(assets, /10–14 seconds/);
});

test("Property Media vNext orbit foundation is reusable, accessible and not mounted in production", () => {
  const orbit = read("src/components/property-media/PropertyMediaOrbit.tsx");
  const card = read("src/components/property-media/PropertyMediaOrbitCard.tsx");
  const orbitCss = read("src/components/property-media/property-media-orbit.module.css");
  const experience = read("src/components/property-media/PropertyMediaExperience.tsx");

  assert.match(orbit, /activeIndex\?: number/);
  assert.match(orbit, /defaultActiveIndex\?: number/);
  assert.match(orbit, /onActiveIndexChange/);
  assert.match(orbit, /onSelect/);
  assert.match(orbit, /onOpenMedia\?: \(item: PropertyMediaPortfolioItem\)/);
  assert.match(orbit, /PROPERTY_MEDIA_ORBIT_DRAG_THRESHOLD_PX = 48/);
  assert.match(orbit, /PROPERTY_MEDIA_ORBIT_CLICK_SLOP_PX = 8/);
  assert.match(orbit, /onPointerDown/);
  assert.match(orbit, /onPointerMove/);
  assert.match(orbit, /onPointerUp/);
  assert.match(orbit, /onPointerCancel/);
  assert.match(orbit, /setPointerCapture/);
  assert.match(orbit, /releasePointerCapture/);
  assert.match(orbit, /ArrowLeft/);
  assert.match(orbit, /ArrowRight/);
  assert.match(orbit, /scrollIntoView/);
  assert.match(orbit, /prefers-reduced-motion/);
  assert.match(orbit, /toPropertyMediaPortfolioItem/);
  assert.match(card, /aria-pressed/);
  assert.match(card, /onOpenMedia/);
  assert.match(card, /data-display-aspect-ratio/);
  assert.doesNotMatch(orbit, /<video/);
  assert.doesNotMatch(card, /<video/);
  assert.match(orbitCss, /aspect-ratio: var\(--property-media-orbit-card-aspect-ratio\)/);
  assert.match(orbitCss, /scroll-snap-type: x mandatory/);
  assert.match(orbitCss, /touch-action: pan-y/);
  assert.match(orbitCss, /min-height: 2\.75rem/);
  assert.match(orbitCss, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(experience, /PropertyMediaOrbit/);
});
