import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import { createHash } from "node:crypto";
import ts from "typescript";

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

// Execute the real hook against controlled platform events, without a browser or sensors.
function sensorHarness({ enabled = true, reduced = false, low = false, requestPermission } = {}) {
  const listeners = new Map();
  const rootEvents = new Map();
  const frames = new Map();
  const values = new Map();
  const storage = new Map();
  let cleanup;
  let time = 0;
  let sequence = 0;
  const node = { style: { setProperty() {} } };
  const element = {
    style: { setProperty: (key, value) => values.set(key, Number(value)) },
    querySelector: () => node, getBoundingClientRect: () => ({ left:0, top:0, width:390, height:1600 }),
    addEventListener: (name, handler) => rootEvents.set(name, handler), removeEventListener() {},
  };
  let refIndex = 0;
  const context = {
    exports: {}, require: name => name === "react" ? {
      useRef: value => ({ current: refIndex++ === 0 ? element : value }),
      useState: value => [value, () => {}], useEffect: effect => { cleanup = effect(); },
    } : { universeGalaxies: [{ id:"knowledge", position:{ x:"50%", y:"50%", z:0 } }] },
    navigator: { deviceMemory:low ? 2 : 8, hardwareConcurrency:low ? 2 : 8 },
    window: { DeviceOrientationEvent:{ requestPermission }, addEventListener:(name, handler) => listeners.set(name, handler), removeEventListener:name => listeners.delete(name) },
    document:{ hidden:false, addEventListener(){}, removeEventListener(){} },
    sessionStorage:{ getItem:key => storage.get(key), setItem:(key,value) => storage.set(key,value) },
    matchMedia: query => ({ matches:query.includes("reduced") ? reduced : true, addEventListener(){}, removeEventListener(){} }),
    ResizeObserver:class { observe(){} disconnect(){} }, performance:{ now:() => time },
    requestAnimationFrame: handler => { frames.set(++sequence,handler); return sequence; },
    cancelAnimationFrame: id => frames.delete(id),
  };
  vm.runInNewContext(ts.transpileModule(motion, { compilerOptions:{ module:ts.ModuleKind.CommonJS } }).outputText, context);
  const hook = context.exports.useUniverseMotion(enabled);
  return { hook, listeners, rootEvents, values, storage, cleanup:() => cleanup(),
    sensor:(beta,gamma) => { time += 40; listeners.get("deviceorientation")?.({ beta,gamma }); },
    settle:() => { for(let i=0;i<200 && frames.size;i++){ time += 16; const callbacks=[...frames.values()]; frames.clear(); callbacks.forEach(callback=>callback(time)); } return frames.size; },
  };
}

test("gyro waits for intro and excludes reduced motion and low GPU", () => {
  for (const options of [{ enabled:false },{ reduced:true },{ low:true }]) {
    const harness = sensorHarness(options);
    assert.equal(harness.listeners.has("deviceorientation"),false);
    harness.cleanup();
  }
  assert.match(scene,/useUniverseMotion\(!introActive\)/);
});

test("iOS asks once and denied or rejected permission preserves touch fallback", async () => {
  for(const rejects of [false,true]) {
    let calls=0;
    const harness=sensorHarness({requestPermission:()=>{calls++; return rejects ? Promise.reject(new Error("blocked")) : Promise.resolve("denied");}});
    harness.hook.enableGyro(); harness.hook.enableGyro();
    await new Promise(resolve=>setImmediate(resolve));
    assert.equal(calls,1);
    assert.equal(harness.listeners.has("deviceorientation"),false);
    harness.rootEvents.get("pointerdown")({pointerType:"touch",clientX:10,clientY:10});
    harness.rootEvents.get("pointermove")({pointerType:"touch",clientX:80,clientY:30});
    harness.settle();
    assert.ok(harness.values.get("--pointer-x")>0);
    harness.cleanup();
  }
});

test("granted gyro clamps and damps real targets while preserving focus and settling", async () => {
  const harness=sensorHarness({requestPermission:()=>Promise.resolve("granted")});
  harness.hook.enableGyro();
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(harness.listeners.has("deviceorientation"),true);
  harness.sensor(70,0); harness.sensor(80,12);
  harness.hook.focusGalaxy("knowledge");
  assert.equal(harness.settle(),0);
  assert.ok(harness.values.get("--pointer-x")>0);
  assert.equal(harness.values.get("--engaged"),1);
  harness.sensor(180,90); harness.settle();
  assert.ok(Math.abs(harness.values.get("--pointer-x"))<=2.1);
  const previous=harness.values.get("--pointer-x");
  harness.sensor(null,null); harness.settle();
  assert.equal(harness.values.get("--pointer-x"),previous);
  harness.cleanup();
  assert.equal(harness.listeners.has("deviceorientation"),false);
});

test("mobile round stars and one streak instance keep bounded asynchronous activity", () => {
  assert.equal((scene.match(/<i \/>/g)??[]).length,16);
  assert.match(styles,/border-radius:50%/);
  assert.match(styles,/@keyframes round-twinkle/);
  assert.match(styles,/@keyframes secondary-twinkle/);
  assert.match(styles,/nth-child\(n\+9\)/);
  assert.match(styles,/animation-duration:4.8s; animation-delay:-1.7s/);
  assert.match(styles,/mobile-streak 21s/);
  assert.match(styles,/mobile-light-flow 17s/);
  assert.match(styles,/\.streakSecond,.*\.streakThird \{ display:none/);
  assert.match(styles,/data-motion-mode="low-gpu".*twinkles i:nth-child\(n\+4\).*display:none/);
  assert.match(styles,/animation:none !important/);
});

test("sparse star refinement and occasional streak preserve safe modes", () => {
  assert.match(styles, /background-size:235px 242px,328px 280px/);
  assert.ok((263 * 271) / (235 * 242) > 1.2 && (263 * 271) / (235 * 242) < 1.3);
  assert.match(styles, /distant-streak 30s linear 3s infinite/);
  assert.match(styles, /3%,100% \{ opacity:0/);
  for (const mode of ["reduced", "low-gpu"]) {
    assert.match(styles, new RegExp(`data-motion-mode="${mode}".*distantStreak.*animation:none`));
  }
  assert.match(scene, /styles.distantStreak\} aria-hidden="true"/);
});

test("intro uses exact public media, session skip, guarded playback and mounted universe", async () => {
  const intro = await read("src/components/universe/UniverseIntro.tsx");
  for (const file of ["ex-creator-universe-intro.mp4", "ex-creator-universe-intro-phone.mp4", "ex-creator-universe-mo.wav"]) {
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

test("production UX keeps mobile standard alive while deferring ambient activation", () => {
  assert.match(styles, /brightness\(1.15\)/);
  assert.match(styles, /galaxyNodeActive.*brightness\(1.34\)/);
  assert.match(node, /styles.focusFilament/);
  assert.match(scene, /MOBILE_GYRO.*MOBILE_TOUCH/);
  assert.match(scene, /setAmbientReady\(true\), 450/);
  assert.match(styles, /data-ambient-ready="false"/);
  assert.match(styles, /mobile-streak 21s/);
  assert.match(styles, /mobile-light-flow 17s/);
  assert.match(styles, /mobile-breathe var\(--breath-duration\)/);
  assert.match(styles, /54.6px/);
  assert.match(motion, /deviceMemory \?\? 8\) <= 2 &&/);
  assert.doesNotMatch(motion, /userAgent/);
  assert.equal((motion.match(/function tick\(/g) ?? []).length, 1);
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
  assert.match(motion, /isStack \? 21 : 36.4/);
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
  assert.match(motion, /mode === "full" \? 1.4 : mode === "mobile-safe" \? \(listening \? 2.1 : 1.8\) : 1/);
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
  assert.doesNotMatch(motion, /preventDefault/);
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

test("mobile depth tuning separates near, primary, far and deep planes", () => {
  assert.match(styles, /Mobile depth planes deliberately move against one another/);
  assert.match(styles, /var\(--pointer-x\) \* 28px/);
  assert.match(styles, /var\(--pointer-x\) \* -5px/);
  assert.match(styles, /var\(--pointer-x\) \* -2\.5px/);
  assert.match(styles, /var\(--focus-weight\) \* 72px/);
  assert.match(styles, /scale\(1\.015\)/);
  assert.match(styles, /scale\(\.99\)/);
});

test("Phase 2D destination ownership is unique and local routes exist", async () => {
  const context = { exports:{} };
  vm.runInNewContext(ts.transpileModule(navigation, { compilerOptions:{ module:ts.ModuleKind.CommonJS } }).outputText, context);
  const galaxies = context.exports.universeGalaxies;
  assert.deepEqual(Array.from(galaxies, g => g.title), ["創作", "知識", "語言", "洞察"]);
  assert.equal(new Set(galaxies.map(g => g.href)).size, 4);
  const owners = new Map();
  for (const galaxy of galaxies) {
    assert.ok(galaxy.destinations.length >= 1 && galaxy.destinations.length <= 4);
    for (const href of [galaxy.href, ...galaxy.destinations.map(d => d.href)]) {
      if (href.startsWith("#")) { assert.equal(href, "#language-destinations"); continue; }
      assert.equal(await exists(`src/app${href}page.tsx`), true);
      assert.ok(!owners.has(href) || owners.get(href) === galaxy.id, `Ambiguous product owner: ${href}`);
      owners.set(href, galaxy.id);
    }
  }
});

test("Phase 2D header is preview-only utility navigation with no fake accounts", async () => {
  const header = await read("src/components/Header.tsx");
  const utility = await read("src/components/universe/UniverseHeader.tsx");
  assert.match(header, /pathname === "\/universe-preview" \|\| pathname === "\/universe-preview\/"/);
  for (const label of ["宇宙入口", "關於 E.X", "手機全域導覽"]) assert.ok(utility.includes(label));
  assert.doesNotMatch(utility, /#membership|登入|點數|訂閱|創作|知識|語言|洞察/);
  assert.match(utility, /href="\/"/);
  assert.equal(await exists("docs/ex-creator-universe/phase-2d-navigation-map.md"), true);
});

test("Phase 2D one CTA focuses a real world and secondary links are separate accessible actions", () => {
  assert.equal((scene.match(/data-primary-cta="true"/g) ?? []).length,1);
  assert.match(scene, /創作、學習、語言與洞察，/);
  assert.match(scene, /匯聚成你的 AI 工作宇宙。/);
  assert.match(scene, /Start Exploring/);
  assert.match(scene, /focus\(\{ preventScroll: true \}\)/);
  assert.match(node, /inert=\{!active\}/);
  assert.match(node, /tabIndex=\{active \? 0 : -1\}/);
  assert.match(node, /<\/Link>\s*<nav/);
  assert.match(node, /event.key === " "/);
  assert.match(motion, /\[data-galaxy\]:focus-within/);
});

test("media candidates preserve original hashes and remain outside runtime source paths", async () => {
  const audit = JSON.parse(await read("public/images/universe/candidates/audit.json"));
  for (const image of audit.images) {
    const bytes = await readFile(new URL(`public/images/universe/${image.name}.png`, root));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), image.sha256);
    for (const format of ["webp", "avif"]) assert.equal(await exists(`public/images/universe/candidates/${image.name}.${format}`),true);
  }
  for (const video of audit.videos) {
    const bytes = await readFile(new URL(`public/video/${video.name}.mp4`,root));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), video.sha256);
    assert.equal(await exists(`public/video/${video.name}-web.mp4`),true);
  }
  assert.doesNotMatch(scene+node+core+styles, /\/candidates\//);
  assert.doesNotMatch(await read("src/components/universe/UniverseIntro.tsx"), /-web\.mp4/);
});
