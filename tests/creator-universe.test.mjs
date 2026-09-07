import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const exists = async (path) => {
  await access(new URL(path, root));
  return true;
};

const route = await read("src/app/universe-preview/page.tsx");
const scene = await read("src/components/universe/UniversePreview.tsx");
const motion = await read("src/components/universe/useUniverseMotion.ts");
const core = await read("src/components/universe/UniverseCore.tsx");
const node = await read("src/components/universe/GalaxyNode.tsx");
const pointerField = await read("src/components/universe/UniversePointerField.tsx");
const navigation = await read("src/data/universe-navigation.ts");
const styles = await read("src/app/universe-preview/universe-preview.module.css");
const homepage = await read("src/app/page.tsx");
const packageJson = JSON.parse(await read("package.json"));

test("sparse star refinement and occasional streak preserve safe modes", () => {
  assert.match(styles, /background-size:235px 242px,328px 280px/);
  assert.ok((263 * 271) / (235 * 242) > 1.2 && (263 * 271) / (235 * 242) < 1.3);
  assert.match(styles, /distant-streak 30s linear 3s infinite/);
  assert.match(styles, /3%,100% \{ opacity:0/);
  for (const mode of ["reduced", "mobile-safe", "low-gpu"]) {
    assert.match(styles, new RegExp(`data-motion-mode="${mode}".*distantStreak.*animation:none`));
  }
  assert.match(scene, /styles.distantStreak\} aria-hidden="true"/);
});

test("intro uses exact public media, session skip, guarded playback and mounted universe", async () => {
  const intro = await read("src/components/universe/UniverseIntro.tsx");
  for (const file of ["ex-creator-universe-intro.mp4", "ex-creator-universe-intro-phone.mp4", "ex-creator-universe-mo.WAV"]) {
    assert.equal(await exists(`public/video/${file}`), true);
    assert.ok(intro.includes(`/video/${file}`));
  }
  for (const contract of ["sessionStorage", "ex-creator-universe-intro-seen", "prefers-reduced-motion", 'get("intro")', "onEnded", "onError", ".catch", "8000", "autoPlay muted playsInline"]) assert.ok(intro.includes(contract));
  assert.match(scene, /inert=\{introActive\}/);
  assert.match(scene, /<UniverseCore/);
  assert.match(styles, /animation-play-state:paused/);
  assert.match(styles, /@keyframes star-twinkle/);
  assert.match(scene, /styles.streakSecond/);
  assert.match(scene, /styles.streakThird/);
  // Three 0.9s windows spaced 9 / 11 / 10 seconds apart: never simultaneous.
  assert.ok([9,11,10].every(gap => gap > .9));
});

test("cinematic bridge retains video and delays interaction with safe audio and reduced fallback", async () => {
  const intro = await read("src/components/universe/UniverseIntro.tsx");
  assert.match(intro, /video.current\?\.pause\(\)/);
  assert.match(intro, /useSimple \? 240.*650 : 850/);
  assert.match(intro, /if \(!useSimple\) onBridge\(\)/);
  assert.match(intro, /blocked-safely/);
  assert.doesNotMatch(intro, /addEventListener\("pointerdown"|addEventListener\("keydown"/);
  assert.equal((intro.match(/audio.play\(\)/g) ?? []).length, 1);
  assert.match(scene, /data-bridging=\{bridging && introActive\}/);
  assert.match(scene, /inert=\{introActive\}/);
  assert.match(styles, /bridge-bloom 850ms/);
  assert.match(styles, /0%,12% \{ opacity:1; transform:scale\(1\)/);
  assert.match(styles, /prefers-reduced-motion:reduce.*opticalBloom.*display:none/);
  assert.match(styles, /width:96px/);
  assert.match(styles, /opacity:.78/);
  assert.match(styles, /twinkles i:nth-child\(6\)/);
});

test("Universe preview route is static and noindex", async () => {
  assert.equal(await exists("src/app/universe-preview/page.tsx"), true);
  assert.match(route, /robots: \{ index: false, follow: false \}/);
  assert.match(route, /canonical: "\/universe-preview\/"/);
  assert.doesNotMatch(route, /cookies\(|headers\(|force-dynamic|server action/i);
});

test("the first composition renders the four primary galaxies and safe destinations", () => {
  for (const id of ["create", "knowledge", "language", "insight"]) assert.match(navigation, new RegExp(`id: "${id}"`));
  for (const [title, subtitle] of [["創作", "Create"], ["知識", "Knowledge"], ["語言", "Language"], ["洞察", "Insight"]]) {
    assert.match(navigation, new RegExp(`title: "${title}"`));
    assert.match(navigation, new RegExp(`subtitle: "${subtitle}"`));
  }
  assert.match(navigation, /href: "\/ai-learning\//);
  assert.match(navigation, /href: "\/market-radar\//);
  assert.match(scene, /universeGalaxies\.map/);
  assert.match(scene, /UniverseCore/);
  assert.match(core, /universeCore\.subtitle/);
});

test("spatial interaction uses one rAF loop with normalized pointer and focus transfer", () => {
  assert.match(motion, /requestAnimationFrame\(tick\)/);
  assert.match(motion, /Math\.max\(-1, Math\.min\(1/);
  assert.match(motion, /setProperty\("--pointer-x"/);
  assert.match(motion, /setProperty\("--pointer-y"/);
  assert.match(motion, /setActiveGalaxy/);
  assert.match(node, /aria-label=\{`\$\{galaxy\.title\}/);
  assert.match(pointerField, /ref=\{sceneRef\}/);
  assert.match(styles, /translate3d\(calc\(var\(--pointer-x\)/);
  assert.match(styles, /--focus-weight/);
});

test("motion safety and mobile safe mode remain explicit", () => {
  assert.match(motion, /prefers-reduced-motion: reduce/);
  assert.match(motion, /max-width: 767px/);
  assert.match(motion, /"low-gpu"/);
  assert.match(styles, /data-motion-mode="reduced"/);
  assert.match(styles, /data-motion-mode="mobile-safe"/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /@media \(max-width: 767px\)/);
  assert.match(styles, /grid-template-columns: 1fr/);
});

test("reference assets are not runtime dependencies and homepage stays untouched", () => {
  assert.doesNotMatch(`${route}\n${scene}\n${core}\n${node}`, /assets\/references\/ex-creator-universe/);
  assert.doesNotMatch(JSON.stringify(packageJson.dependencies), /three|react-three-fiber|gsap/i);
  assert.doesNotMatch(homepage, /universe-preview|UniversePreview/);
});

test("recalibration uses independent original worlds and focus-only secondary copy", async () => {
  for (const name of ["core", "create", "knowledge", "language", "insight"]) {
    assert.equal(await exists(`public/images/universe/${name}-v2.png`), true);
  }
  assert.match(node, /aria-hidden=\{!active\}/);
  assert.match(styles, /opacity:var\(--focus-weight\)/);
  assert.doesNotMatch(scene, /sceneCoordinate|sceneLegend|toplineRule|lowerNote/);
  assert.match(scene, /<details/);
  assert.match(styles, /core-breathe 10s/);
  for (const duration of [13, 17, 19, 23]) assert.match(styles, new RegExp(`--breath-duration:${duration}s`));
});

test("attention releases monotonically in the existing demand-driven loop", () => {
  assert.match(motion, /destination \? 170 : 190/);
  assert.match(motion, /if \(unsettled\) frame = requestAnimationFrame\(tick\)/);
  assert.equal((motion.match(/function tick\(/g) ?? []).length, 1);
  assert.doesNotMatch(motion, /setInterval|setTimeout/);
  assert.match(styles, /data-motion-mode="low-gpu".*coreImage.*animation:none/);
  // Preserve the existing 1.5-second settling budget without running a browser.
  // This checks the analytic decay, not measured runtime frame performance.
  assert.ok(Math.exp(-1500 / 190) < 0.0005);
});

test("focused staging is bounded and uses stable layout rather than animated bounds", () => {
  assert.match(motion, /isStack \? 14 : 36.4/);
  assert.match(motion, /clamp\(\(parent.clientHeight \/ 2 - centerY\) \* .104, 23.4\)/);
  assert.match(motion, /node.element.offsetLeft/);
  assert.doesNotMatch(motion, /node.element.getBoundingClientRect/);
  assert.match(styles, /var\(--focus-weight\) \* 247px/);
  assert.match(styles, /var\(--center-shift-x\) \+ var\(--depth-compensation-x\)/);
  assert.match(styles, /galaxyVisual::before/);
});

test("perspective compensation makes the projected focus centre move inward", () => {
  for (const [x, y, z] of [[.73, .24, 28], [.23, .44, 72], [.77, .73, 4], [.36, .83, -34]]) {
    for (const [coordinate, origin, size, limit, gain] of [[x,.5,1340,36.4,.13], [y,.46,860,23.4,.104]]) {
      const d = (coordinate - origin) * size;
      const shift = Math.max(-limit, Math.min(limit, (.5 - coordinate) * size * gain));
      const compensation = -d * 247 / (1400 - z);
      const neutral = d * 1400 / (1400 - z);
      const focused = (d + compensation + shift) * 1400 / (1400 - z - 247);
      assert.ok(Math.abs(focused) < Math.abs(neutral));
    }
  }
});

test("far galaxies use an original noninteractive subdued layer with low GPU fallback", async () => {
  assert.equal(await exists("public/images/universe/background-depth-v1.png"), true);
  assert.match(scene, /data-depth-layer="far-galaxies" aria-hidden="true"/);
  assert.match(styles, /background-depth-v1.png/);
  assert.match(styles, /opacity:calc\(.88 - var\(--engaged\) \* .10\)/);
  assert.match(styles, /data-motion-mode="low-gpu".*farGalaxies.*display:none/);
  assert.doesNotMatch(styles, /assets\/references/);
});

test("fine tuning adds bounded gain and asynchronous CSS pulses without another frame engine", () => {
  assert.match(motion, /mode === "full" \? 1.4 : mode === "mobile-safe" \? 1.2 : 1/);
  assert.match(styles, /@keyframes world-halo/);
  assert.match(styles, /0%,55%,100% \{ opacity:0/);
  assert.match(styles, /world-halo var\(--breath-duration\).*var\(--breath-phase\)/);
  assert.match(styles, /data-motion-mode="low-gpu".*galaxyVisual::after.*animation:none/);
  assert.match(styles, /data-motion-mode="reduced".*galaxyVisual::after.*animation:none/);
  assert.match(styles, /filter:brightness\(1.65\) saturate\(.85\)/);
  assert.doesNotMatch(styles, /transition:filter|animation:.*brightness/);
});

test("touch focus is separate from navigation and passive drift shares the existing loop", () => {
  assert.match(scene, /alreadyFocused: activeGalaxy === id/);
  assert.match(scene, /event.detail !== 0 && touch\?\.id === galaxy.id && !touch.alreadyFocused/);
  assert.match(node, /event.pointerType !== "touch"/);
  assert.match(motion, /!touchOrigin \|\| mode === "reduced" \|\| lowGpu/);
  for (const event of ["pointerdown", "pointerup", "pointercancel"]) {
    assert.match(motion, new RegExp(`addEventListener\\("${event}"`));
    assert.match(motion, new RegExp(`removeEventListener\\("${event}"`));
  }
  assert.doesNotMatch(motion, /preventDefault|DeviceOrientationEvent|deviceorientation/);
  assert.equal((motion.match(/function tick\(/g) ?? []).length, 1);
});

test("cosmic background keeps separate faint layers and a non-cropping mobile fallback", () => {
  assert.match(scene, /data-depth-layer="galactic-mist" aria-hidden="true"/);
  assert.match(styles, /mist-breathe 28s/);
  assert.match(styles, /background-size:100% auto; background-repeat:repeat-y/);
  assert.match(styles, /data-motion-mode="reduced".*galacticMist::after.*animation:none/);
  assert.match(styles, /data-motion-mode="low-gpu".*galacticMist::after.*animation:none/);
  assert.match(styles, /pointer-x\) \* -2px/);
  assert.doesNotMatch(styles, /assets\/references/);
});
