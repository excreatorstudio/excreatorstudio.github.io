# R1 — Universe Homepage Visual Refresh

Worktree: D:\CODEX-\EX-Universe-R1-Refresh. Branch: work/universe-r1-visual-refresh. Source: e4613d745c546c361e29caf315e0701efd4d4d66. No stage/commit/push/deploy.

## Implemented scope
- Universe-only navy/silver-blue atmosphere, readable smoked-blue Hero surface, pale primary CTA, small Galaxy label surfaces and clearer secondary links.
- Short proposition: 整合 AI 影音、創作者學習、語言互動與資訊工具。
- Central Core and the lower creator-center link both enter /ex-ai/; the Core remains E.X / 創作中心 × 創作者學院. Four categories unchanged.
- Mobile hides the repeated eyebrow, consolidates the heading and removes empty prompt/row spacing. Secondary destinations retain 44px targets and fit the 320px node width with wrapping.
- Header and footer finish scoped to Universe CSS Module; shared Header/Footer code unchanged. Existing edge/circuit language preserved; no additional particles or media.
- No new transform/animation/blur engine. Intro, gyro, focus, halo, twinkle, shooting-star, reduced-motion and low-GPU implementation/parameters unchanged.

## Evidence and limits
Product Design audit guidance used for hierarchy and observed browser review. Existing Property Media hero overlay PNG and glass CSS inspected read-only; existing Universe gold/blue glass reference inspected read-only. Requested user phone captures were unavailable in this context; no claim of seeing them. Existing motion-reference filename verified but its full playback was not reviewed.
Actual browser widths checked: 1440, 1024, 768, 430, 390, 320. No page horizontal overflow observed. Desktop Core Enter reached /ex-ai/; Start Exploring focused Knowledge and its Classroom link reached /ai-learning/classroom. Mobile secondary navigation opened; final 320px active links fit within the viewport (rightmost about 297px). Browser console check returned no errors.
Mobile idle page heights before/after: 430: 2351/2119; 390: 2351/2142; 320: 2201/2063 CSS px. Tablet 1024/768 grows about 172px because the reading area moves above the spatial stage to avoid overlaps. Planets are not reduced for shorter mobile pages.
Palette tests cover conservative reading-surface/text combinations at 4.5:1, not a full certification of every moving/image-backed state.

## Screenshots / preview
Local preview: http://127.0.0.1:4192/ (fresh static build).
QA captures: C:\Users\Administrator\.codex\visualizations\2026\07\28\019fa810-9bda-7473-87bd-2838b876f41c\universe-r1\comparison.html.
Six before/after top captures are supplied at scrollY=0. Some baseline captures did not fully render all planet layers; these are explicitly marked as limited and must not be treated as strict synchronized motion comparisons. Full-page stitched captures were rejected because of stitching artifacts. No generated screenshots used.
VISUAL QA: REQUIRES HUMAN REVIEW. iPhone permission/gyro feel, continuous motion, complete Intro handoff and all moving-state contrast remain manual. Static screenshots are not evidence of those behaviors.

## Final verification
All exit 0 after final 320px fix: npm.cmd run typecheck; npm.cmd run lint; npm.cmd test (189 pass / 1 existing skip / 0 fail); node --test tests/creator-universe.test.mjs tests/universe-contracts.test.mjs tests/universe-r1.test.mjs (56 pass: 28+24+4); node --test tests/property-media.test.mjs (22 pass); npm.cmd run build (41 static pages).
Real candidate audit remains NOT RUN / INPUTS REQUIRED; production PNG/Intro hashes unchanged. Package/lockfile, media, Property Media, unrelated routes and deployment workflow unchanged.

## Deferred
R2: /ex-ai/ restrained orbit/card collection; preserve every original content module. R3: optional synchronized Intro sound, never unsolicited playback. Property Media performance, media compression/hosting, candidate activation and deployment are not part of R1.
