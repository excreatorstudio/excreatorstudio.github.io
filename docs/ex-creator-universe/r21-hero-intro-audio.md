# R2.1 — Hero Compression / Intro Audio
Worktree: D:\CODEX-\EX-Universe-R1-Refresh
Branch: work/universe-r1-visual-refresh
HEAD: e4613d745c546c361e29caf315e0701efd4d4d66 (existing R0/R1/R2 uncommitted work preserved).
No media, dependency, route or motion-math changes.

## Changes
- Header 72 → 58px desktop; 62.4 → 54px mobile. Interactive controls retain 44px targets.
- Hero padding and copy gaps tightened; no glass colors/blur/material redesign and no font-size reduction.
- 768–1199px scene margin overlaps existing empty upper space by 32px; no planet scaling or transform changes.
- Mobile sensor control has a reserved 44px slot before/after Intro; no gyro authorization change.
- Intro uses the existing tracked /video/ex-creator-universe-mo.wav and unchanged MP4s. Original audio started independently before video, with no mid-playback enable UI.
- New event-driven audio helper: automatic attempt only once when video plays; rejected playback does not stop video or retry on unrelated actions. Explicit Sound button can retry at current video time; metadata/playing/seek events synchronize without a timer loop.
- Pause/waiting/visibility stop sound; accepted playback can resume with the video. End/error/Skip/unmount stop it and invalidate pending promises. Cleanup removes listeners and source. Sound never restarts after its duration has passed.
- Session bypass creates no audio controller; forced replay owns a fresh controller.
- R1/R2 style assertions remain scoped to their original blocks. Authorized Intro change replaces the historical byte-equality constraint with bridge/session assertions plus executable sound-policy tests. R0 contract logic unchanged.

## Measured stable first viewport
Percent means Core link bounding-box vertical intersection, not a claim about every animated pixel.
Width x height | Header before/after | Hero before/after | Core before/after
1440x900 | 72/58 | 233.1/199.0 | 100/100%
1366x768 | 72/58 | 231.6/197.5 | 100/100%
1024x768 | 72/58 | 203.8/171.1 | 82/100%
768x1024 | 72/58 | 203.8/171.1 | 100/100%
430x932 | 62.4/54 | 215.7/187.9 | 100/100%
390x844 | 62.4/54 | 240.3/211.1 | 100/100%
375x812 | 62.4/54 | 233.3/208.9 | 100/100%
320x720 | 62.4/54 | 233.3/208.9 | 100/100%

No page horizontal overflow observed at these widths. Desktop nearby planets visible (lower ones partial at 1024); mobile first Create planet enters earlier. 390px measured during Intro and after: Hero stays 211.1px; Core position differs only ~0.75px from existing breathing, no added layout jump observed.
These are stable-layout checks, not frame-by-frame recordings for every size. Continuous visual quality, gyro and first-frame animation timing remain human review.

## Audio QA evidence
- Executable mocks: allowed and blocked autoplay, explicit mid-Intro sync, delayed metadata, pause/resume, exhausted soundtrack, pending play after Skip, video error/end, visibility, disposal and separate replay all PASS.
- Browser: explicit Sound control present during forced Intro, Intro reaches Universe; same-session load bypasses Intro. 390px handoff layout checked.
- Tool latency exceeded the short Intro when attempting mid-playback click; actual audible output, permission variations across browsers, real mid-Intro sync and audible Skip cutoff remain NOT VERIFIED / human review. No browser-wide autoplay guarantee.
- No unrelated mouse/keyboard/scroll handlers start audio.

## Validation
Each exited 0:
npm.cmd run typecheck
npm.cmd run lint
node --test tests/creator-universe.test.mjs tests/universe-r1.test.mjs tests/universe-r2.test.mjs tests/universe-r21.test.mjs tests/universe-contracts.test.mjs
70 pass, 0 fail, 0 skipped (28 Universe + 4 R1 + 3 R2 + 11 R2.1 + 24 R0 helper cases).
npm.cmd run build — 41 static pages.

Preview: http://127.0.0.1:4192/?review=r21-final
Force Intro: http://127.0.0.1:4192/?intro=1&review=r21-manual
Screenshots/measurements: C:\Users\Administrator\.codex\visualizations\2026\07\28\019fa810-9bda-7473-87bd-2838b876f41c\universe-r21
No commit/push/deploy.
