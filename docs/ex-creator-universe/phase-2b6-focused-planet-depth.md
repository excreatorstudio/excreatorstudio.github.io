# Phase 2B.6 — Focused Planet Lift + Background Galaxy Depth

Scope: `/universe-preview/` only. No homepage, auth, membership, hosting, routing
destination, dependency, or original-reference changes. No stage/commit/push/deploy.

## Direction and reference boundary

Retain the accepted 2B.5 optical worlds, asymmetric layout, restrained gold and
silver-blue palette, minimal labels and slow independent breathing. Add depth,
not decorative density. Re-read the specification, asset map, inventory and
2B.5 recalibration notes; reviewed the overview image and MOV contact-sheet study.
The specifically mentioned new “current / simulated enhancement” attachments
were not identifiable in this task. Exact comparison with those remains pending.

## Implementation

- Same demand-driven `useUniverseMotion` loop; focus weights remain monotonic
  exponential 170ms arrival / 190ms release, with no bounce or second engine.
- Desktop focus adds 190px Z (formerly 140), 3.5% local scale, and up to 28px X /
  18px Y staging toward the centre. Unfocused worlds recede 75px.
- Staging uses untransformed layout measurements, not moving hit-box bounds.
  An initial visual check exposed outward perspective expansion. Compensation
  `-distanceFromPerspectiveOrigin * 190 / (1400 - baseZ)` now cancels that expansion
  before applying the small inward displacement. Perspective origin remains 50%/46%.
- Halo is one opacity-driven radial light field per world, no animated blur or
  box-shadow. Existing local orbit/light now use measured field dimensions.
- New original background: `public/images/universe/background-depth-v1.png`.
  Two faint distant galaxies, dark centre, no UI or copied reference pixels.
  Far layer Z -240, focus recession 55px, opacity .64→.55; existing deep layer is
  -340, main haze -170, near framing +155. Main worlds remain the subject.
- Desktop world pointer offsets 11/8px; far layer -5/-3px; deep -1/-.6px;
  foreground retains 42/29px plus bounded velocity. Parent rotation is unchanged.
- Mobile: first tap focuses, second tap enters; keyboard and modifier-click keep
  normal navigation. Visible touch hint; passive touch delta input reuses the same
  loop and resets on pointerup/cancel. Browser scrolling is never prevented.
- Mobile staging max 12px X, -5px Y, Z28 with 2.5% scale; no full desktop camera.
  Device tilt is deliberately not enabled: no automatic permissions/sensor access.
  Touch is the selected safe fallback; physical-device acceptance remains manual.
- Reduced motion: zero spatial strength, no continuous animation or velocity,
  clear focus/halo/navigation retained. Low GPU now takes precedence on mobile too;
  new background and halo disabled, existing ambient animations stopped.

## Asset provenance

Generated with the built-in image tool; 1536×1024 PNG, reference-only inputs were
not imported/copied as runtime assets. Prompt:

> Original landscape distant-galaxy background for restrained luxury editorial
> space. Near-black midnight navy; at least 75% dark negative space, especially
> centre. Two faint small spiral galaxies at lower-left and upper-right; sparse
> star-band haze, low brightness/contrast/saturation, silver-blue and tiny champagne
> highlights. No foreground planets, central sun, text, UI, rainbow or particle storm.

## Verification and manual acceptance

Run existing npm suite plus `node --test tests/creator-universe.test.mjs` separately;
the unrelated package test-list modification is not edited. Focused checks cover
route/noindex, four worlds, projected centre shift, bounded staging, safe background,
touch navigation guard, reduced motion, no heavy dependencies and single-loop logic.
Static source checks and analytic decay are NOT measured FPS or real touch tests.

Only the built-in browser is permitted; the earlier external Playwright harness is
not executed. Final responsive observations and exact command results are in
`design-qa.md`. Continuous-motion acceptance remains manual:

| Test | Action | Acceptance target |
|---|---|---|
| A | Hold CREATE | Slightly inward, larger, nearer, restrained halo |
| B | Quickly CREATE → KNOWLEDGE | Continuous attention transfer, no snapping |
| C | Slowly sweep all four | Distinct depth and layered parallax |
| D | Observe distant background | Visible depth without competing with worlds |
| E | Real phone first/second tap and scroll | Focus then navigate, usable scrolling |
| F | Stop 10 seconds | Quiet breathing, no useless rAF work |

Do not advance to Phase 2C until subjective motion and real-phone review are accepted.
