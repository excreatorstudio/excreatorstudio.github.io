# R2.2 — Mobile Spatial Galaxy Corridor

## Scope and baseline

- Worktree: `D:\CODEX-\EX-Universe-R1-Refresh`; branch: `work/universe-r1-visual-refresh`.
- HEAD: `e4613d745c546c361e29caf315e0701efd4d4d66`, with existing uncommitted R0/R1/R2/R2.1 preserved.
- Desktop glass/composition, gyro coefficients, routes, media and other products are unchanged.

## Mobile implementation

- Below 768px, Core/Create/Knowledge/Language/Insight form an asymmetric, overlapping corridor. Knowledge is near, Insight primary, Create far and Language deep; Core remains the landmark.
- Different widths, negative margins, opacity and stacking create static depth, including reduced-motion and low-GPU modes.
- Passive scroll updates cached node targets. The existing demand-driven motion loop settles `--scroll-depth` and `--corridor-emphasis`; no second loop, scroll hijacking or per-frame layout measurement.
- Dynamic scroll depth runs only in mobile-safe mode. Gyro/focus and scroll contributions share the existing transform pipeline.
- Planet identity plates remain interactive. Transparent image corners do not capture neighboring labels; the existing circular visual hit region and identity plate accept input. Focus raises a node and its destinations.

## Intro audio addendum

- Existing single audible autoplay attempt and rejection-safe video playback retained.
- Sound is now a true music/mute toggle. Explicit mute affects only audio and remains effective during this Intro; manual enable synchronizes to video time.
- Skip/finish stop the audio controller before the existing cinematic handoff. Revision invalidation prevents pending playback after Skip; unmount disposes listeners and the audio source.
- No audio persistence, new audio asset or permanent synchronization loop added.

## Validation for this revision

- Typecheck: PASS; Lint: PASS; production static Build: PASS; all exit codes 0.
- Full tests: 190 total, 189 PASS, 1 existing SKIP, 0 FAIL. Skip: optional CBC workbook `data/market-radar/raw/cbc/cbc-115-07.xlsx` is absent.
- Combined focused tests: 100 PASS, 0 FAIL: Creator Universe 28, R1 4, R2 3, R2.1 11, R2.2 8, contract helpers 24, Property Media 22.
- R2.2 tests exercise real motion-hook scroll targets/settling and audio-controller mute, pending playback and Skip behavior. R1 immutable-hook and R2.1 stylesheet-scope assertions were updated only for the newly authorized R2.2 scope; original gyro, media, route and glass contracts remain covered.

## Browser evidence and limits

- New `out` served at `http://127.0.0.1:4192/?review=r22-final`.
- Chromium viewport checks: 430/390/375/360/320px, no measured horizontal page overflow. Native PageDown changes scroll-depth variables; 390px commonly shows multiple worlds.
- After fixing an observed Language-label overlap, visible label centers hit their own nodes. Keyboard opens language destinations; Core Enter actually navigates to `/ex-ai/`.
- Desktop 1440x900: unchanged spatial composition observed; Core bounds approximately y202–659. No overflow.
- Screenshots: `C:\Users\Administrator\.codex\visualizations\2026\07\28\019fa810-9bda-7473-87bd-2838b876f41c\universe-r22`. Five 390px corridor checkpoints plus other mobile widths and desktop.
- Static images do not verify gyro feel, motion smoothness, real touch, actual sound or browser-wide autoplay policy. Those remain human QA. Audio race/rejection claims are automated-controller evidence, not acoustic/browser-policy certification. Force-replay interaction was not captured within the short Intro window.
- No screen-recording capability was available; no generated video substitutes for browser evidence.

No stage, commit, push or deploy performed. Other worktrees and remote divergence were not modified.
