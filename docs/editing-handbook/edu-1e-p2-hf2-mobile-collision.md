# EDU-1E-P2-HF2 — Mobile Hero Collision Correction

Date: 2026-10-20. **Local engineering validation: PASS. Final owner visual acceptance: PENDING.**

No staging, commit, push or deployment. This follow-up removes the specific mobile collision recorded in `edu-1e-p2-release.md`; that historical blocked-run record is unchanged. It does not itself authorize resuming public release.

## Confirmed cause and narrow correction

The existing `.creator-hero__inner` grid vertically centers `.creator-hero__content`. At 430×1100, its clamped minimum height is 688px. The approved in-flow book/title row adds approximately 75.39px to the content height, so centering shifts the copy upward by half that amount, approximately **37.70px**. The independently positioned brand circle does not move. This is not an asset, visibility, z-index or breakpoint-rendering failure.

At stable animation completion before the fix, the English eyebrow starts at 221.50px and the brand circle ends at 231.20px, producing **9.70px vertical intersection** where their horizontal bounds also intersect.

Only these two application presentation files change relative to the accepted P2 candidate:

- `src/components/CreatorStudioHero.tsx`: add a scoped CSS-module class to the existing inner wrapper.
- `src/components/editing-handbook/editing-handbook.module.css`: below 640px, start-align the grid and reserve the existing upper control area using shared variables for the circle's unchanged top/size plus 1rem copy spacing.

The reserved area is responsive: `2.15rem + clamp(7.6rem, 33vw, 8rem) + 1rem`. The same variables set the existing circle top/width, without changing their values. This couples copy placement to actual control dimensions instead of applying a 430px-only offset. Taller title/copy now grows downward instead of pulling the eyebrow into the control. Desktop/tablet rules outside the mobile breakpoint are unchanged. No global CSS or unrelated control position changes.

## Before / after at 430×1100

| Measurement | Before | After |
| --- | ---: | ---: |
| Eyebrow top | 221.50px | 253.60px |
| Brand circle bottom | 231.20px | 231.20px |
| Eyebrow/circle intersection | 9.70px | **0px** |
| Eyebrow-to-circle box gap | -9.70px | **22.40px** |
| Inner grid height | 688px | 688px |

The copy moves down 32.10px relative to the faulty candidate. The brand ring extends about 6.4px beyond its control box, leaving approximately 16px of visual separation. The original production eyebrow position need not be reproduced exactly; the corrected layout no longer derives its start position from content-height centering.

## Fresh browser verification

Browser: ChatGPT in-app Chromium, local final static output at `http://127.0.0.1:4332/ex-ai/`. Stable measurements wait for the existing entrance animation to complete; computed content transform is identity. Physical iPhone/Safari and hardware audio are **NOT VERIFIED** in this run.

| Width | Full Hero capture height | Additional short height | Geometry and interaction |
| ---: | ---: | ---: | --- |
| 1920 | 1100 | 720 | PASS |
| 1440 | 1100 | 800 | PASS |
| 1280 | 1100 | 720 | PASS |
| 1024 | 1100 | 768 | PASS |
| 768 | 1100 | 700 | PASS |
| 430 | 1100 | 740 | PASS |
| 390 | 1100 | 667 | PASS |
| 375 | 1100 | 667 | PASS |
| 360 | 1100 | 640 | PASS |
| 320 | 1100 | 568 | PASS |

All **20 geometry cases** and **20 interaction cases** pass: actual transparent PNG decoded; five sampled entry hit points reachable; eyebrow/heading/book/description/search do not intersect the brand or studio foreground controls; no book clipping or horizontal overflow; brand/studio controls reachable; search editable; book pointer/keyboard activation, ESC, visible keyboard focus and focus restoration work. Short screens use normal vertical scrolling rather than compressing the Hero into the viewport.

Mobile eyebrow-to-brand box gap remains 22.40px across widths and tested heights. At 1440×1100, all ten measured main-element positions and sizes are unchanged within 0.05px versus the pre-fix accepted desktop candidate; `desktop-comparison.json` has no differences. The background carousel is time-varying, so pixel-identical screenshots are not claimed.

Additional existing browser regressions at 430 and 1440 pass **12 flow records**: Hero/Teaching Resources/Academy/Resources-center book interactions, direct Handbook navigation and refresh, six terms, keyboard selection, Premium dialog/ESC/focus, light/dark and no overflow. Academy's independent course video remains PENDING. Browser application error log: none observed in these fresh checks.

## Corrected video network observation

The prior P2 finish-only recorder could miss pending and cancelled MP4 transfers. HF2 uses a local request-start observer with request headers, response headers, abort and close events; it is not restricted to completed responses.

- Before the first book activation: **105 requests started, zero MP4 requests started**, video paused, readyState 0, no autoplay. Actual DOM `preload` attribute: `none`.
- First MP4 request starts after activation at 08:00:50.090 UTC: `GET`, `Range: bytes=0-`, same-origin video fetch.
- Response: **206**, `video/mp4`, `Accept-Ranges: bytes`, `Content-Range: bytes 0-16947132/16947133`.
- Decoded playback: 23.730998s duration, 1080×1920, unmuted, playing, current time advances past 1.10s.
- The first transfer later records abort/close with `complete=false`, 13,238,272 queued body bytes and 13,238,528 socket bytes written. These are server-side transfer observations, not acknowledged client-delivery measurements.
- At the final recorded audit snapshot, 40 MP4 request starts and 40 response headers were captured, including 40 aborted/incomplete closes; zero finish events. These requests come from repeated deliberate interaction tests, not initial page loading.

**Initial media request observation: VERIFIED for this local run.** No claim is made about a public-host HAR, universal Safari audible autoplay or physical audio output. The video is unchanged and no optimization/transcoding was performed.

## Fresh automated gates

| Gate | Result |
| --- | --- |
| Typecheck | PASS |
| Lint | PASS, no warnings/errors |
| Build | PASS, 43/43 generation progress |
| Canonical full regression | 189 PASS / 1 existing SKIP / 0 FAIL |
| Creator Universe | 28 PASS / 0 FAIL |
| Editing Handbook focused | 14 PASS / 0 FAIL |
| Editing Academy | 10 PASS / 0 FAIL |
| Academy homepage entry | 4 PASS / 0 FAIL |
| Hero visibility focused | 4 PASS / 0 FAIL |
| Source/output privacy build gates | PASS, 149 output text assets, 9 private blocks compared |

Suite totals overlap and are not additive coverage counts. The canonical CBC workbook-dependent skip is unchanged. The existing nested-checkout/multiple-lockfile build warning remains non-blocking. The static export contains 42 physical HTML files; Next.js build progress is 43/43.

## Release protection and evidence

The accepted P1/P1R/HF1 checkout remains untouched (43 candidate hashes). In this release checkout, the other 41 candidate paths remain byte-identical. Ten protected parent paths are unchanged. Dependency lockfile, deployment workflow, Next.js configuration and global CSS are unchanged. Nothing is staged.

Approved runtime video remains 16,947,133 bytes, SHA-256 `d5790a7d141d44c8ca4924bda1833c2a8d49d86bb7e16e72d5a6f75f0b81ae8e`. Private source specification, complete Premium content, master media, reference images and browser evidence remain outside public output. The fresh output privacy checks and sanitized release audit are recorded locally; no public-history exposure is introduced.

Additional final sanitized audit: 191 selected-source/document/output text files scanned, 9 reserved private blocks compared, zero findings and zero public source maps. `git diff --check` passes and the staged index is empty.

Ignored local evidence: `.npm-cache/hf2-evidence/`. Required comparisons: `before-430.jpg`, `after-430.jpg`, `after-390.jpg`, `after-375.jpg`, `after-320.jpg`, `after-1440.jpg`. Full ten-width captures and ten short-height captures are retained, together with `geometry-results.json`, `interaction-results.json`, `browser-results.json`, `desktop-comparison.json`, `network.ndjson`, `network-summary.json`, `preservation.json` and `release-audit.json`. Local diagnostic helpers are ignored and are not release files.

Previously verified rollback reference remains `75dbca1b3aa0d857377bfe7646f516a1ccd18acc`, successful Pages run `38110941725`. No remote update or rollback was performed. Production, DNS, Cloudflare and hosting settings were not changed by HF2.

Commit: **NOT PERFORMED**. Push: **NOT PERFORMED**. Deploy: **NOT PERFORMED**.

Next: owner visual acceptance of the corrected mobile Hero; only then consider resuming EDU-1E-P2 under its release gates. No automatic deployment or later-stage implementation.
