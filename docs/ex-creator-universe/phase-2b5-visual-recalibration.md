# Phase 2B.5 — Visual recalibration

Implementation: 2026-09-05. In-app browser review resumed 2026-09-07.
Route: `/universe-preview/`; noindex; production homepage unchanged.
Status: PARTIAL pending the user's continuous-motion / visual approval.

## Visual Gap Audit v1

1. Composition: the oversized centered heading pushed the world below the fold.
2. Depth: equal card silhouettes flattened otherwise valid Z transforms.
3. Material: repeated CSS icons lacked the reference's internal glass/star depth.
4. Lighting: broad blue haze and equally illuminated borders competed with Core.
5. Negative space: coordinate HUD, status legend and repeated navigation crowded it.
6. Scale: labels/cards dominated worlds rather than letting material carry identity.
7. Breathing: the core alone carried most ambient life; rhythms lacked independence.
8. Multi-axis: framed surfaces made rotation read as tilting interface cards.
9. Focus: borders/glow signalled selection more than a changing spatial center.
10. Immersion: foreground was a diagrammatic line, not strong near-camera framing.
11. Dynamic island: local response existed but visual mass did not follow attention.
12. Risk: additional HUD, glow or particles would reinforce a generic tech demo.

The source overview and original glass-world stills were inspected. The primary
MOV was studied through a temporary 3-second-interval contact sheet, not a claim
of frame-exact timing or full native playback. The original video was not changed.

## Art Direction v2

- Core: one larger dark gravitational glass world, a small champagne spiral.
- Composition: four unequal worlds on adjustable asymmetric X/Y/Z coordinates.
- Negative space: remove diagnostic labels, card surfaces and duplicated lists.
- Lighting: dark mass first; small warm/silver-blue highlights, no blanket neon.
- Material: distinct aperture, star-map, orbital connection and horizon identities.
- Foreground: one softened partial edge; no new particle system.
- Background: sparse near-static points and low-contrast haze.
- Breathing: Core 10 seconds; worlds 13/19/17/23 seconds with independent phases.
- Dynamic island: existing demand-driven loop, 170ms arrival / 190ms release.
  Release retains the existing 1.5-second analytic settling budget (0.0005 cutoff).
- Gravity: local light/orbit, Core bias and layered recession retained.
- Typography: compact editorial title and names; secondary copy reveals on focus.
- Mobile: cardless staggered vertical sequence, no desktop camera motion.

## New original assets

All five images are newly generated with built-in image_gen, not runtime imports
of reference files. Each is 1254 × 1254. Prompt requested square, low-key smoked
glass on uniform #020408, centered ~70%, 75% dark mass, champagne/silver-blue,
no text, UI, neon, extra satellites or busy background. Reference custody unchanged.

| File under public/images/universe | Identity | Bytes | Generation identifier |
| --- | --- | ---: | --- |
| core-v2.png | fine spiral star core, one inclined metallic orbit | 1,385,018 | exec-abeaa79f-a400-4d2f-9703-396992b968d8 |
| create-v2.png | sculptural optical aperture, internal warm kinetic ribbon | 1,475,289 | exec-c6e027a2-f5ac-47e7-9c60-1953c6a05686 |
| knowledge-v2.png | sparse internal connected star map, no literal book | 1,211,614 | exec-cb743480-ee7e-41de-b19e-13f9f53ae9fd |
| language-v2.png | two delicate communication arcs in dark glass | 1,196,695 | exec-21167a77-6c62-4f1f-8b05-e624b6fcb11b |
| insight-v2.png | quiet refractive horizon and fine equatorial signal | 1,148,635 | exec-f9cc0a61-ce24-4984-8197-0c20e0bea5c5 |

The new PNGs total about 6.4 MB. No download-performance/FPS claim is made;
responsive derivative optimization belongs before production integration.
Assets were generated in parallel under Product Design's asset workflow.

## QA evidence / deliberate differences

- In-app browser inspected static export at 1440/1024/768/390 × 950.
- DOM geometry: no horizontal overflow, four distinct non-overlapping galaxy
  boxes at rest. Labels have no horizontal text overflow; all five images load.
- Knowledge keyboard focus confirmed through the browser; destinations remain
  ordinary links. Destination index is native collapsed details, not permanent UI.
- Compared overview reference and new screenshot together: glass/internal depth,
  warmer Core and hierarchy improved. Four rather than six worlds, reduced light
  density and no foreground rocks are intentional changes required by this brief.
- In-app full-page stitching showed repeated footer/mobile strips; these are not
  treated as page defects. Viewport capture plus DOM geometry were used to check
  the mobile middle/lower section. Temporary screenshots are outside the repo.
- Original MOV SHA256 remains
  `DFC65BE0790D6CE41497E5A186BF489BE2C5F3F4FFB4B0B3056EF1734857A6FB`.
- No runtime reference imports; no new rendering library or second rAF engine.
- Reduced-motion/low-GPU rules stop breathing and decorative motion. Mobile
  stops world drift/camera travel while retaining the slow Core breath.

## Explicit remaining review

The user selected **in-app browser only; dynamic acceptance left to humans**.
The existing Playwright browser suite was therefore NOT run this phase. Its
previous nine passes must not be counted as fresh Phase 2B.5 passes.

Manual A–F remain: 10-second idle, slow and rapid four-world focus sweep,
corner-to-corner parallax, Knowledge hold 2–3 seconds, release to neutral.
Also pending: physical-device touch/reduced-motion/low-GPU behavior, frame timing,
image loading on a mobile network and subjective foreground immersion. Static
source assertions are not substitutes for these checks. Do not advance to 2C
until the visual/motion direction is accepted.

No staging, commit, push or deployment. Other tracked/untracked work preserved.

## Scoped file inventory

Modified existing prototype files (these were already untracked at task start):

- `src/app/universe-preview/universe-preview.module.css`
- `src/components/universe/UniversePreview.tsx`
- `src/components/universe/UniverseCore.tsx`
- `src/components/universe/GalaxyNode.tsx`
- `src/components/universe/UniverseOrbit.tsx`
- `src/components/universe/useUniverseMotion.ts`
- `src/data/universe-navigation.ts`
- `tests/creator-universe.test.mjs`

Created: this QA document and the five original PNGs listed above.
Preview page metadata file, original Phase 0 documents, production homepage,
package.json, Market Radar test edits and the existing browser test file were
not changed in this phase. The two pre-existing tracked changes remain unstaged.

## Final validation — 2026-09-07

- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm test`: 192/192 PASS.
- `node --test tests/creator-universe.test.mjs`: 7/7 PASS.
- `npm run build`: PASS; 39 static pages, preview route exported.
- Fresh total: **199/199 PASS**. Nine existing browser tests intentionally not run.
- Prototype first-load JS reported by Next: 116 kB (not including image bytes).
- Git index remains empty; no homepage diff and zero reference runtime matches.
