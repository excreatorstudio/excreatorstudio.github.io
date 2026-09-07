# Phase 2B.7 — Breathing / Galaxy Depth / Spatial Tension

## Scope

Parameter refinement of the existing preview, not a redesign. Four worlds, routes,
original raster assets and one demand-driven motion loop retained. Homepage and
reference files unchanged. No dependencies, staging, commit, push or deploy.

## Calibration

- Focus lift 190→247px (+30%); scale increment .035→.0455 (+30% of the
  enlargement increment, NOT a claim of 30% larger final screen diameter).
- Inward staging limit 28→36.4px X, 18→23.4px Y; matching perspective compensation
  retained so deeper focus does not project the planet outward. Recession 75→90px.
- Desktop pointer gain 1→1.4, mobile 1→1.2, low GPU unchanged. Damping and settling
  logic unchanged. Percentages describe parameters, not measured subjective feel.
- Existing background image opacity .64→.88 with a static 1.65 brightness/.85
  saturation adjustment. Focus reduces opacity to .78. Existing sparse star layer
  opacity .32→.48. No additional image, particles, worlds or labels added.
- Core scale breathing amplitude .007→.0091 and opacity range .10→.13.
  Planet drift 1.5→1.95px; independent 13/17/19/23-second phases retained.
- New soft ring-light pulse: dark through 55% of each cycle, gradual peak at 76%,
  then fades. CSS opacity/transform only; no new JS loop. Orbit opacity breathes
  over 16 seconds. Phone allows only the focused world's extra halo animation.
- Reduced motion and low GPU disable added pulse/orbit animation. No sensor access.

## Verification

- Typecheck PASS; lint PASS; npm test 192/192; focused Universe tests 12/12;
  build PASS (39 static pages). Total fresh tests 204/204.
- Built-in browser inspected the new static export at 1440×1000, 1024×900,
  768×1024, 390×844. Sampled CREATE keyboard focus and mobile stack remain legible.
  Document widths 1440/1009/753/375 do not exceed requested viewports.
- Background star structures more visible, still below primary-world contrast.
  No new HUD, cards or gaming decoration. Browser error log returned none.
- Full-page browser stitching can repeat strips; not treated as duplicate DOM.
- Manual continuous pointer sweep, all-world corner extremes, real touch,
  10-second breathing feel and FPS/GPU acceptance remain pending. No external
  Playwright suite was run, preserving the user's prior browser restriction.

Overall PARTIAL: code/build checks complete; subjective motion percentages are
not asserted as measured PASS. Preview: http://127.0.0.1:3019/universe-preview/
