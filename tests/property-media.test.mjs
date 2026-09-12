import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const root = path.resolve(import.meta.dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const modules = new Map();
// Execute the real pure data/helpers with the already-installed TypeScript compiler.
const loadTS = (relative) => {
  if (modules.has(relative)) return modules.get(relative);
  const testModule = { exports: {} };
  modules.set(relative, testModule.exports);
  const code = ts.transpileModule(read(relative), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const requireLocal = (name) => {
    assert.ok(name.startsWith("@/"), "Only local data imports are permitted");
    return loadTS("src/" + name.slice(2) + ".ts");
  };
  vm.runInThisContext("(function(exports, require, module) {" + code + "\n})", { filename: relative })(testModule.exports, requireLocal, testModule);
  return testModule.exports;
};

// Exercise actual component handlers without starting a browser or downloading media.
let frameClock = 0, frameId = 0;
const frames = new Map();
const flushFrames = () => {
  for (let i = 0; frames.size && i < 100; i++) {
    frameClock += 16;
    const current = [...frames.values()]; frames.clear(); current.forEach(callback => callback(frameClock));
  }
  assert.equal(frames.size, 0, "Demand loop must stop after docking");
};
const loadComponent = (relative) => {
  const output = { exports: {} };
  const element = (type, props) => ({ type, props });
  const requireLocal = (name) => {
    if (name === "react/jsx-runtime") return { jsx: element, jsxs: element };
    if (name === "react") return {
      useState: (initial) => [typeof initial === "function" ? initial() : initial, () => {}],
      useRef: (value) => ({ current: value }), useEffect: () => {},
      useCallback: (callback) => callback, forwardRef: (render) => render,
    };
    if (name === "next/image") return { default: "img" };
    if (name.endsWith(".css")) return { default: {} };
    if (name.startsWith("@/")) return loadTS("src/" + name.slice(2) + ".ts");
    const local = path.posix.join(path.posix.dirname(relative), name);
    return fs.existsSync(path.join(root, local + ".tsx")) ? loadComponent(local + ".tsx") : loadTS(local + ".ts");
  };
  const code = ts.transpileModule(read(relative), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX,
  } }).outputText;
  vm.runInThisContext("(function(exports, require, requestAnimationFrame, cancelAnimationFrame, performance, window) {" + code + "\n})")(
    output.exports, requireLocal,
    callback => { const id = ++frameId; frames.set(id, callback); return id; },
    id => frames.delete(id), { now: () => frameClock }, { matchMedia: () => ({ matches: false }) },
  );
  return output.exports;
};
const nodes = (node) => !node || typeof node !== "object" ? [] :
  [node, ...[node.props?.children].flat(Infinity).flatMap(nodes)];

test("Orbit and grid cards open the existing media directly through one native button", () => {
  const { PropertyMediaOrbitCard } = loadComponent("src/components/property-media/PropertyMediaOrbitCard.tsx");
  const { propertyMediaOrbitRing } = loadTS("src/data/property-media-vnext.ts");
  const { orbitPlane } = loadTS("src/components/property-media/property-media-orbit-layout.ts");
  const item = propertyMediaOrbitRing[1];
  const actions = [];
  const card = PropertyMediaOrbitCard({ item, active: true, plane: orbitPlane(1, 1, 9),
    onSelect: (value) => actions.push(["select", value.id]), onOpenMedia: (value) => actions.push(["open", value.id]),
  });
  const buttons = nodes(card).filter((node) => node.type === "button");
  assert.equal(buttons.length, 1, "No separate open button is required");
  assert.equal(buttons[0].props.type, "button", "Native Enter/Space activation");
  assert.equal(buttons[0].props["aria-haspopup"], "dialog");
  buttons[0].props.onClick();
  assert.deepEqual(actions, [["select", item.id], ["open", item.id]]);
  const { PropertyMediaCard } = loadComponent("src/components/property-media/PropertyMediaCard.tsx");
  let opened;
  const grid = PropertyMediaCard({ item, onOpen: (value) => { opened = value; } });
  grid.props.onClick();
  assert.equal(opened, item);
});

test("Fractional ring promotes multiple real cards before release and stays continuous at wrap", () => {
  const { continuousOrbitPlane: pose } = loadTS("src/components/property-media/property-media-orbit-layout.ts");
  for (const mobile of [true, false]) {
    assert.notEqual(pose(1, 1, 9, mobile).x, pose(1, 1.4, 9, mobile).x);
    assert.ok(pose(1, 1.4, 9, mobile).scale < pose(1, 1, 9, mobile).scale);
    assert.ok(pose(2, 1.4, 9, mobile).scale > pose(2, 1, 9, mobile).scale);
    for (let i = 0; i < 9; i++) {
      assert.equal(pose(i, i + 9, 9, mobile).scale, 1);
      assert.ok(Math.abs(pose(i, 8.99999, 9, mobile).x - pose(i, 9.00001, 9, mobile).x) < .001);
    }
  }
  assert.ok(pose(3, 1.4, 9, true).opacity > 0, "Incoming rear neighbor participates before docking");
});

test("Gesture direction, maximum travel and short bounded inertia survive reversals and holding", () => {
  const { moveOrbitGesture: move, orbitReleaseTarget: release } = loadTS("src/components/property-media/property-media-orbit-gesture.ts");
  const fresh = () => ({ startX: 0, startY: 0, startPosition: 1, stride: 200, deltaX: 0,
    axis: 'pending', maxTravel: 0, velocity: 0, samples: [{ x: 0, time: 0 }] });
  let d = fresh(); assert.equal(move(d, -100, 0, 300), 1.5);
  assert.equal(move(d, -40, 0, 600), 1.2, "Immediate direction reversal");
  assert.equal(move(d, 0, 0, 800), 1); assert.equal(d.maxTravel, 100, "Out-and-back is still a drag");
  assert.equal(release(d, 1, 1000, false), 1);
  d = fresh(); move(d, -10, 0, 300); assert.equal(release(d, 1.05, 500, false), 1);
  d = fresh(); move(d, -70, 0, 300); assert.equal(release(d, 1.35, 500, false), 2);
  d = fresh(); move(d, -480, 0, 800); assert.equal(release(d, 3.4, 1000, false), 3);
  d = fresh(); move(d, -30, 0, 15); assert.equal(release(d, 1.15, 20, false), 2);
  assert.equal(release(d, 1.15, 20, true), 1, "Reduced motion removes inertia, not direct drag");
  d = fresh(); move(d, 0, 30, 50); move(d, -200, 35, 70); assert.equal(d.axis, 'vertical');
});

test("Poster capture handover preserves live motion; actual owner loss cancels and next tap survives", () => {
  const { PropertyMediaOrbit } = loadComponent("src/components/property-media/PropertyMediaOrbit.tsx");
  const changes = [], orbit = PropertyMediaOrbit({ onActiveIndexChange: i => changes.push(i) });
  const track = nodes(orbit).find(n => n.props?.role === 'list').props;
  let captures = 0, captured = false;
  const target = { dataset: {}, style: { setProperty() {} }, setPointerCapture() { captures++; captured = true; },
    hasPointerCapture: () => captured, releasePointerCapture() { captured = false; } };
  track.ref.current = target;
  const cards = nodes(orbit).filter(n => n.props?.item).map(n => {
    const properties = {}, card = { offsetWidth: 200, dataset: {}, style: { setProperty(k,v) { properties[k] = v; } } };
    n.props.ref(card); return properties;
  });
  const event = { pointerId: 12, pointerType: 'touch', isPrimary: true, button: 0, clientX: 200, clientY: 200, timeStamp: 0, currentTarget: target, target: { tagName: 'IMG' } };
  track.onPointerDown(event);
  track.onPointerMove({ ...event, clientX: 170, timeStamp: 100 });
  const first = cards.map(p => p['--mobile-scale']);
  track.onLostPointerCapture(event); // IMG implicit capture loss bubbles to track.
  track.onPointerMove({ ...event, clientX: 120, timeStamp: 200 });
  assert.equal(captures, 1); assert.notEqual(cards[1]['--mobile-scale'], first[1]); assert.notEqual(cards[2]['--mobile-scale'], first[2]);
  assert.deepEqual(changes, [], "No active selection while holding");
  track.onPointerUp({ ...event, timeStamp: 400 }); flushFrames(); assert.deepEqual(changes, [2]);
  let suppressed = false;
  track.onClickCapture({ detail: 1, preventDefault() { suppressed = true; }, stopPropagation() {} }); assert.equal(suppressed, true);
  track.onPointerDown(event); track.onPointerMove({ ...event, clientX: 170, timeStamp: 100 });
  captured = false; track.onLostPointerCapture({ ...event, target }); flushFrames();
  track.onPointerDown(event); track.onPointerUp(event); flushFrames();
  track.onClickCapture({ detail: 1, preventDefault() { assert.fail('Next normal tap was eaten'); }, stopPropagation() {} });
});

test("Orbit suppresses mouse drags, touch swipes, scrolls and cancellation while preserving tap and keyboard", () => {
  const { PropertyMediaOrbit } = loadComponent("src/components/property-media/PropertyMediaOrbit.tsx");
  for (const kind of ["mouse", "touch"]) {
    for (const scenario of ["tap", "drag", "short-drag", "vertical", "cancel", "lost-capture"]) {
      const changes = [];
      const orbit = PropertyMediaOrbit({ onActiveIndexChange: (index) => changes.push(index) });
      const track = nodes(orbit).find((node) => node.props?.role === "list").props;
      const target = { dataset: {}, style: { setProperty() {} }, setPointerCapture() {}, hasPointerCapture: () => false, releasePointerCapture() {} };
      const event = { pointerId: 1, pointerType: kind, isPrimary: true, button: 0, clientX: 0, clientY: 0, currentTarget: target, target, timeStamp: 0 };
      track.onPointerDown(event);
      if (["drag", "short-drag", "vertical", "lost-capture"].includes(scenario)) track.onPointerMove({ ...event,
        clientX: scenario === "drag" ? -80 : ["short-drag", "lost-capture"].includes(scenario) ? 16 : 0,
        clientY: scenario === "vertical" ? 80 : 0,
        timeStamp: 100,
      });
      if (scenario === "cancel") track.onPointerCancel(event);
      else if (scenario === "lost-capture") track.onLostPointerCapture(event);
      else track.onPointerUp({ ...event, timeStamp: 300 });
      flushFrames();
      let prevented = false;
      track.onClickCapture({ detail: 1, preventDefault: () => { prevented = true; }, stopPropagation() {} });
      assert.equal(prevented, scenario !== "tap", `${kind}: ${scenario}`);
      assert.deepEqual(changes, scenario === "drag" ? [2] : []);
      track.onPointerCancel(event);
      track.onClickCapture({ detail: 0, preventDefault: () => assert.fail("Keyboard activation suppressed"), stopPropagation() {} });
    }
  }
});

test("Verified real GLB enables model mode while preserving the approved PNG fallback", () => {
  const section = read("src/components/property-media/PropertyMediaFloorPlan.tsx");
  assert.match(section, /data-model-status="VERIFIED"/);
  assert.match(section, /FloorPlanShowcase mode="model"/);
  const glb = fs.readFileSync(path.join(root, "public/models/property-media/floor-plan/floor-plan-showcase.glb"));
  assert.equal(glb.toString("ascii", 0, 4), "glTF");
  assert.equal(glb.readUInt32LE(4), 2);
  assert.equal(glb.readUInt32LE(8), glb.length);
  const manifest = JSON.parse(glb.toString("utf8", 20, 20 + glb.readUInt32LE(12)));
  assert.ok(manifest.meshes.length > 1);
  assert.ok(manifest.materials.length > 0);
  assert.ok(manifest.buffers.every(buffer => !buffer.uri));
  assert.equal(manifest.images?.length || 0, 0);
  const viewer = read("src/components/property-media/FloorPlanShowcase.tsx");
  assert.match(viewer, /mode === "model" && !modelFailed/);
  assert.match(viewer, /setModelFailed\(true\)/);
  assert.match(viewer, /modelMode \? "model" : "image"/);
});

test("Real model is client-lazy, bounded, demand rendered and keyboard-control accessible", () => {
  const viewer = read("src/components/property-media/FloorPlanShowcase.tsx");
  const model = read("src/components/property-media/FloorPlanModel.tsx");
  assert.match(viewer, /if \(!entered \|\| !modelMode\) return/);
  assert.match(viewer, /closest\("\[inert\]"\)/);
  assert.match(viewer, /import\("\.\/FloorPlanModel"\)/);
  assert.match(viewer, /IntersectionObserver/);
  assert.match(viewer, /modelPoster/);
  assert.match(viewer, /Reset View/);
  assert.match(viewer, /command\("left"\)/);
  assert.match(viewer, /command\("right"\)/);
  assert.match(viewer, /command\("in"\)/);
  assert.match(viewer, /command\("out"\)/);
  assert.match(model, /^"use client"/);
  assert.match(model, /\/models\/property-media\/floor-plan\/floor-plan-showcase\.glb/);
  assert.match(model, /new GLTFLoader/);
  assert.match(model, /new OrbitControls/);
  assert.match(model, /getBoundingSphere/);
  assert.match(model, /minDistance = radius/);
  assert.match(model, /maxDistance = defaultDistance/);
  assert.match(model, /minPolarAngle = \.18/);
  assert.match(model, /maxPolarAngle = Math.PI \* \.46/);
  assert.match(model, /enableDamping = !flags.current.reduced/);
  assert.match(model, /!flags.current.active/);
  assert.match(model, /cancelAnimationFrame/);
  assert.match(model, /renderer.dispose\(\)/);
  assert.match(model, /webglcontextlost/);
  assert.doesNotMatch(model, /floor-plan-showcase\.png|TextureLoader|autoRotate = true|\/api\//);
});

test("Orbit ring reuses unique verified portfolio records and preserves the approved front three", () => {
  const { propertyMediaOrbitRing: ring, propertyMediaVnextOrbit: primary, toPropertyMediaPortfolioItem } = loadTS("src/data/property-media-vnext.ts");
  assert.ok(ring.length > 3);
  assert.equal(new Set(ring.map((item) => item.id)).size, ring.length);
  assert.deepEqual(ring.slice(0, 3), primary);
  assert.equal(ring.findIndex((item) => item.defaultActive), 1);
  assert.equal(ring[1].id, "presenter-01");
  assert.deepEqual(ring.slice(0, 3).map((item) => item.category), ["immersive", "presenter", "ai-staging"]);
  for (const item of ring) {
    const source = toPropertyMediaPortfolioItem(item);
    assert.equal(item.media, source.media);
    assert.equal(item.poster, source.poster);
    for (const asset of [item.media, item.poster]) assert.ok(fs.existsSync(path.join(root, "public", asset)), asset);
  }
});

test("Orbit depth planes cycle every item through center, sides and rear without a global loop", () => {
  const { orbitPlane, normalizeOrbitIndex } = loadTS("src/components/property-media/property-media-orbit-layout.ts");
  assert.equal(normalizeOrbitIndex(-1, 9), 8);
  assert.equal(normalizeOrbitIndex(9, 9), 0);
  assert.equal(normalizeOrbitIndex(0, 0), 0);
  for (let active = 0; active < 9; active++) {
    const planes = Array.from({ length: 9 }, (_, index) => orbitPlane(index, active, 9));
    assert.equal(planes.filter((p) => p.slot === "center").length, 1);
    assert.equal(planes.filter((p) => p.slot === "rear").length, 6);
    assert.equal(planes[active].scale, 1);
    assert.equal(orbitPlane(normalizeOrbitIndex(active - 1, 9), active, 9).slot, "left");
    assert.equal(orbitPlane(normalizeOrbitIndex(active + 1, 9), active, 9).slot, "right");
    for (const p of planes.filter((p) => p.slot === "rear")) {
      assert.ok(p.scale < planes.find((p) => p.slot === "left").scale);
      assert.ok(p.opacity < 1 && p.z < planes[active].z);
      assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y));
    }
  }
  const css = read("src/components/property-media/property-media-orbit.module.css");
  assert.match(css, /data-mobile-visible='false'[^}]*visibility: hidden/);
  assert.doesNotMatch(css.split('@media (max-width: 767px)')[1], /display: none|translateX\(-149%\)|translateX\(49%\)/);
  assert.doesNotMatch(read("src/components/property-media/PropertyMediaOrbit.tsx"), /Math\.random|setInterval|<video/);
});

test("Floor-plan perspective and zoom are bounded under large, invalid and repeated input", () => {
  const { clampFloorPlanView, dragFloorPlanView, INITIAL_FLOOR_PLAN_VIEW } = loadTS("src/components/property-media/floor-plan-state.ts");
  assert.deepEqual(clampFloorPlanView({ pitch: 100, yaw: -200, zoom: 10 }), { pitch: 3, yaw: -6, zoom: 1.08 });
  assert.deepEqual(clampFloorPlanView({ pitch: -100, yaw: 200, zoom: -10 }), { pitch: -3, yaw: 6, zoom: .92 });
  assert.deepEqual(clampFloorPlanView({ pitch: NaN, yaw: Infinity, zoom: NaN }), INITIAL_FLOOR_PLAN_VIEW);
  for (const delta of [-100000, -48, 0, 48, 100000]) {
    const view = dragFloorPlanView(INITIAL_FLOOR_PLAN_VIEW, delta, -delta);
    assert.ok(Math.abs(view.pitch) <= 3 && Math.abs(view.yaw) <= 6);
    assert.equal(view.zoom, 1);
  }
});

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
  assert.match(experience, /playsInline preload="none"/);
  assert.match(experience, /video\.play\(\)\.then/);
  assert.match(experience, /\.catch\(finishIntro\)/);
  assert.doesNotMatch(experience, /autoPlay/);
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
  assert.match(card, /unoptimized loading="lazy"/);
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
  assert.match(experience, /scene\.copy/);
  assert.ok(fs.existsSync(path.join(root, "public/images/property-media/hero/hero-ui-overlay.png")));
});

test("Property Media bright Hero and layered handoff replace the legacy visual treatment", () => {
  const css = read("src/components/property-media/property-media-scene.module.css");
  const experience = read("src/components/property-media/PropertyMediaExperience.tsx");
  assert.match(css, /property-media-hero-bright-wide\.png/);
  assert.match(css, /\.copy \{[^}]*left:/);
  assert.match(experience, /讓空間・被看見/);
  for (const phase of ["ready", "playing", "handoff", "background", "orbit", "complete"]) assert.ok(experience.includes('"' + phase + '"'));
  assert.match(experience, /reduced\.current \? 220 : 1500/);
  assert.match(experience, /videoRef\.current\?\.pause/);
  assert.match(experience, /introState !== "complete" \? \(/);
  assert.match(experience, /inert=\{introState !== "complete"\}/);
  assert.match(experience, /進入空間/);
  assert.match(experience, /Sound On/);
  assert.match(experience, /video\.volume = \.08/);
  assert.match(experience, /setTimeout\(finishIntro, 12000\)/);
  assert.match(css, /data-phase='background'/);
  assert.match(css, /data-phase='orbit'/);
  assert.doesNotMatch(experience, /PropertyMediaInquiry|booking|reservation|appointment|calendar|預約/i);
});

test("Property Media obsidian material is background-only with reduced-motion support", () => {
  const css = read("src/components/property-media/property-media-scene.module.css");
  assert.match(css, /property-media-obsidian-gold\.png/);
  assert.match(css, /materialLight 12\.8s/);
  assert.match(css, /translate3d/);
  assert.match(css, /pointer-events: none/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /\.surfaceLight \{ animation: none/);
  const grid = read("src/components/property-media/property-media.module.css");
  assert.match(grid, /\.workMedia \{ aspect-ratio: 3 \/ 4/);
  assert.match(grid, /repeat\(3, minmax\(0, 1fr\)\)/);
});

test("Property Media floor-plan section preserves the real static fallback, never the mockup", () => {
  const floor = read("src/components/property-media/PropertyMediaFloorPlan.tsx");
  const experience = read("src/components/property-media/PropertyMediaExperience.tsx");
  assert.match(experience, /<PropertyMediaFloorPlan/);
  assert.match(floor, /360° 格局展示/);
  assert.match(floor, /360° Floor Plan Experience/);
  assert.match(floor, /GLB READY/);
  assert.match(floor, /FloorPlanShowcase mode="model"/);
  const viewer = read("src/components/property-media/FloorPlanShowcase.tsx");
  const css = read("src/components/property-media/floor-plan-showcase.module.css");
  const image = fs.readFileSync(path.join(root, "public/images/floor-plan-showcase.png"));
  assert.equal(image.subarray(1,4).toString(), "PNG");
  assert.ok(image.readUInt32BE(16) > 0 && image.readUInt32BE(20) > 0);
  assert.match(viewer, /\/images\/floor-plan-showcase\.png/);
  assert.doesNotMatch(viewer, /floor-plan-showcase-ref|\.glb|\.gltf|Three\.js/);
  assert.match(viewer, /非完整 3D 模型/);
  assert.match(css, /object-fit: contain/);
  assert.match(viewer, /onPointerCancel/);
  assert.match(viewer, /Rotate Left/);
  assert.match(viewer, /Rotate Right/);
  assert.match(viewer, /重設視角及縮放/);
  assert.match(viewer, /showModal/);
  assert.match(viewer, /onCancel/);
  assert.match(viewer, /空間按鈕僅標記類型/);
  assert.match(viewer, /event\.pointerType === "touch"/);
  assert.match(css, /touch-action: pan-y/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /animation: none/);
  assert.match(read("src/components/property-media/PropertyMediaPortfolio.tsx"), /property-media-selected-works/);
});

test("Property Media vNext assets are present and the intro v2 path is activated through the registered config", () => {
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
  assert.match(experience, /src=\{propertyMediaVnextIntro\}/);
  assert.match(read(".gitattributes"), /public\/media\/property-media\/\*\*\/\*\.mp4 filter=lfs/);
});

test("Property Media vNext orbit projection has three ordered featured worlds with presenter centered", () => {
  const vnext = read("src/data/property-media-vnext.ts");
  const categories = [...vnext.matchAll(/category: "(immersive|presenter|ai-staging)"/g)].map((match) => match[1]);
  assert.deepEqual(categories, ["immersive", "presenter", "ai-staging"]);
  assert.deepEqual(loadTS("src/data/property-media-vnext.ts").propertyMediaVnextOrbit.map((item) => item.placement), ["left", "center", "right"]);
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
  assert.match(plan, /Phase 2 — implemented, human visual review pending/);
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

test("Property Media vNext orbit foundation is reusable, accessible and mounted in the Hero", () => {
  const orbit = read("src/components/property-media/PropertyMediaOrbit.tsx");
  const card = read("src/components/property-media/PropertyMediaOrbitCard.tsx");
  const orbitCss = read("src/components/property-media/property-media-orbit.module.css");
  const experience = read("src/components/property-media/PropertyMediaExperience.tsx");

  assert.match(orbit, /activeIndex\?: number/);
  assert.match(orbit, /defaultActiveIndex\?: number/);
  assert.match(orbit, /onActiveIndexChange/);
  assert.match(orbit, /onSelect/);
  assert.match(orbit, /onOpenMedia\?: \(item: PropertyMediaPortfolioItem\)/);
  assert.match(orbit, /PROPERTY_MEDIA_ORBIT_CLICK_SLOP_PX = ORBIT_CLICK_SLOP/);
  assert.match(read("src/components/property-media/property-media-orbit-gesture.ts"), /ORBIT_CLICK_SLOP = 8/);
  assert.match(orbit, /onPointerDown/);
  assert.match(orbit, /onPointerMove/);
  assert.match(orbit, /onPointerUp/);
  assert.match(orbit, /onPointerCancel/);
  assert.match(orbit, /setPointerCapture/);
  assert.match(orbit, /releasePointerCapture/);
  assert.match(orbit, /ArrowLeft/);
  assert.match(orbit, /ArrowRight/);
  assert.match(orbit, /plane=\{orbitPlane/);
  assert.match(read("src/components/property-media/property-media-orbit-gesture.ts"), /vertical > Math\.abs\(drag\.deltaX\)/);
  assert.match(orbit, /prefers-reduced-motion/);
  assert.match(orbit, /toPropertyMediaPortfolioItem/);
  assert.match(card, /aria-pressed/);
  assert.match(card, /onOpenMedia/);
  assert.match(card, /data-display-aspect-ratio/);
  assert.doesNotMatch(orbit, /<video/);
  assert.doesNotMatch(card, /<video/);
  assert.match(orbitCss, /aspect-ratio: var\(--property-media-orbit-card-aspect-ratio\)/);
  assert.match(orbitCss, /data-orbit-placement/);
  assert.match(orbitCss, /translateX\(-50%\)/);
  assert.match(orbitCss, /touch-action: pan-y/);
  assert.match(orbitCss, /min-height: 2\.75rem/);
  assert.match(orbitCss, /prefers-reduced-motion: reduce/);
  assert.match(experience, /<PropertyMediaOrbit onOpenMedia=\{setSelectedItem\}/);
});
