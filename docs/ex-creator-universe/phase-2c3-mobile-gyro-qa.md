# Phase 2C.3 — Mobile gyro and circular stars

Local implementation; no deployment performed.

## Input and performance contract

- Intro and bridge must complete before sensor registration or primary rAF updates. Ambient activation retains its existing 450ms delay.
- `DESKTOP_FULL`, `MOBILE_GYRO`, `MOBILE_TOUCH`, `LOW_GPU`, `REDUCED_MOTION` remain separate runtime tiers. Gyro indicates a registered, permitted sensor listener; actual sensor availability still needs device verification.
- iOS permission is requested only by the small “啟用 3D 空間感 / 3D Spatial” button. A sessionStorage marker is written before the request, preventing repeated prompts. Denial/rejection keeps touch input and navigation available.
- The initial valid pose becomes neutral. Gamma / beta offsets are wrapped, normalized over 24 / 28 degrees and clamped. Input is coalesced to at most ~31Hz with a .015 deadband. The existing 150ms exponential interpolation owns rendering; no second animation loop.
- Foreground / focused planet / primary planet / Core / distant galaxy / deep stars use different offsets. Focus offset and Z lift remain part of the same planet transform; gyro changes pointer variables only.
- Hidden tabs remove the sensor listener; returning recalibrates neutral. Cleanup removes listeners. Reduced motion and low GPU never attach sensors.

## Ambient changes

- Eight round star nodes, 3px on mobile, with a soft circular halo. Durations and negative delays differ. Mobile peak opacity .98; opacity falls to .3, with only a small scale change.
- One mobile streak element has three .9s windows over 27 seconds. Gaps are 8.1 / 9.45 / 9.45 seconds; no simultaneous streaks. Desktop cadence is unchanged.
- Low GPU retains only three static star nodes; reduced motion disables animation and spatial drag.

## Manual acceptance — pending

Use `/universe-preview/?intro=1` for handoff verification. Phone gyro testing requires an HTTPS preview trusted by the device; plain LAN HTTP is suitable for touch/layout checks but does not establish sensor acceptance. No tunnel or hosting configuration was changed in this phase.

1. At 1440 / 1024 / 768 / 390 check labels, overflow and unchanged composition.
2. On iPhone, enable 3D Spatial. Tilt left/right/up/down slowly. Foreground must move most; deep stars least. The held starting pose should feel neutral.
3. Focus 知識, then tilt. Its focus halo / Z lift must remain while parallax continues.
4. In a separate fresh session, deny permission. Drag and double-tap navigation must remain usable; no second prompt.
5. Hold still for 15 seconds: round stars should brighten asynchronously. Observe for 30 seconds: approximately three mobile streaks.
6. Verify reduced motion and low GPU: no gyro / streak; navigation remains available.
7. On a physical lower-end phone check jitter, discomfort and intro-to-scene performance. Automated unit checks are not evidence of sensor feel or measured FPS.

Automated verification is recorded in the task report. `npm test` does not include the Universe suite, so additionally run `node --test tests/creator-universe.test.mjs`.
