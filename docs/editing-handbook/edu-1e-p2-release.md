# EDU-1E-P2 — Controlled public release gate

Date: 2026-10-20. **Overall: BLOCKED. Deployment: NOT RUN.**

The owner accepted P1R engineering, the Yuni video, the Hero correction, and the legacy-test reconciliation and authorized release conditional on every gate. This record preserves those acceptances. The final release check found the new mobile overlap below, so no commit, staging, push, or deployment was performed. No product source was changed during P2.

## Publishing baseline and isolation

- Publishing repository: `excreatorstudio/excreatorstudio.github.io`.
- Verified publishing remote: `exstudio`, HTTPS GitHub URL for that exact repository. The separate `origin` remote is not a publishing target for this stage.
- Fresh fetch and `git ls-remote` both resolved main to `75dbca1b3aa0d857377bfe7646f516a1ccd18acc`.
- Previous successful Pages run: [38110941725](https://github.com/excreatorstudio/excreatorstudio.github.io/actions/runs/38110941725), same source SHA.
- Existing pipeline: `.github/workflows/deploy.yml`, push to main, `npm ci`, Next.js static build, `out`, upload-pages-artifact, deploy-pages.
- Release checkout: `.npm-cache/edu-1e-p2-release`, detached at that production SHA.
- Accepted implementation: `.npm-cache/edu-1e-p1`. All 43 copied candidate paths matched its SHA-256 snapshot. P1 public data, P1R shared video/Resources/Premium behavior, HF1 normal-flow Hero/PNG, and the legacy TeachingResources test expectation are present.
- Dependency lockfile, workflow, global CSS, and Next.js configuration remain byte-identical to production. Parent dirty work and accepted checkout are preserved.

## Blocking finding: mobile Hero eyebrow and brand circle

At a **430px** viewport in current Chrome, after the existing entrance animation completes:

| Element | Production before release | Accepted candidate |
| --- | --- | --- |
| English Hero eyebrow top | 259.20px | 221.50px |
| English Hero eyebrow bottom | 274.31px | 236.61px |
| Personal Brand circle bottom | 231.20px | 231.20px |
| Intersection of eyebrow and circle boxes | none | 9.70px |

The rendered candidate screenshot shows the English eyebrow against the lower glowing boundary of the brand circle. The Chinese h1 and book themselves remain visible. This does not meet the release requirement to avoid Hero text/control overlap; it is not dismissed merely because the book is in the DOM.

The existing mobile Hero uses a fixed/clamped minimum height and vertically centers its content. Adding the in-flow book makes the title row about 75.39px taller, moving the content block upward about 37.70px. The unchanged circle keeps its previous position. Global source was not altered.

The prior HF1 430px record places the book 16px lower than the stable current Chrome result. The existing entrance animation starts at translateY(16px); this is consistent with different animation timing, but the cause of that previous capture timing has not been independently established. Current stable rendering is the release evidence.

Evidence, local only, under `.npm-cache/p2-evidence/`:

- `hero-430-diagnostic.jpg`: stable release candidate.
- `production-before-430.jpg`: stable public baseline, same width.
- `hero-results.json`: five completed Hero widths and the blocked width.
- `browser-results.json`: 30 completed interaction records across five widths.
- `network.ndjson`: completed local HTTP response records; incomplete for aborted/ranged media transfers.
- `release-audit.json`: privacy, source parity, media fingerprints and preservation checks.

Recommended smallest follow-up: review mobile Hero vertical spacing between the copy block and existing upper control area, then repeat stable-frame QA at 430/390/320 and the full release browser gate. No corrective CSS is included here. No release approval is inferred from this recommendation.

## Fresh automated validation

Results are separate suites, not additive coverage totals.

| Gate | Fresh result |
| --- | --- |
| Typecheck | PASS |
| Lint | PASS, no warning/error |
| Build | PASS, 43/43 generated pages |
| Canonical full regression | 189 PASS / 1 existing SKIP / 0 FAIL |
| Creator Universe | 28 PASS / 0 FAIL |
| Editing Handbook focused | 14 PASS / 0 FAIL |
| Academy content + homepage entry + HF1 focused | 18 PASS / 0 FAIL (10 + 4 + 4) |
| Source/output privacy build gates | PASS, 149 output text assets, 9 private blocks compared |
| Additional source/output scan | PASS, 190 text files, zero findings, zero public source maps |
| Candidate/source parity | PASS, 43/43 copied files match accepted bytes |
| Protected parent files | 10/10 hashes preserved |
| Whitespace | PASS |
| Final browser gate | BLOCKED at 430px |
| Live feature acceptance | NOT RUN |

The skipped canonical CBC XLSX test depends on an optional retained official workbook. Its test file is unchanged against production. No skip was introduced. The local nested-checkout/multiple-lockfile build warning remains; the static build completed. The Next.js 43-page progress count is not an assertion that there are 43 physical HTML files (the exported output has 42 HTML files).

## Browser evidence

1920, 1440, 1280, 1024 and 768 each completed six checks: EX AI Hero opening, Teaching Resources opening, Academy opening, Resources-center opening, Handbook light flow, Handbook dark flow. These 30 records cover real media playback or a truthful rejection fallback, close/ESC/focus return, six terms, Premium dialog, direct navigation/refresh and overflow.

At all five completed widths the actual original transparent Hero PNG loaded, five points on the entry were reachable, and no Hero book clipping, overlap or horizontal overflow was found. Full Hero screenshots are recorded for each. At 430px, the overlap gate failed before that width's full flow. 390 and 320 were NOT RUN after the failure. No overall mobile/browser PASS is claimed.

Initial EX AI DOM state had one paused video with readyState=0 and no autoplay. The video remains preload=none, with one shared player per page, and real decoded playback was observed after explicit book activation. The HTTP logger recorded response finish events only; it captured no completed MP4 responses even during observed playback, so it does not establish absence of initial media requests or a complete byte-transfer trace. The earlier progress message claiming zero initial MP4 HTTP requests is therefore withdrawn as insufficiently measured. Actual initial MP4 transfer verification remains INCONCLUSIVE and must be repeated with request-start/abort-aware logging. The browser read-only interface does not expose a full performance/HAR trace. Physical audio output and iPhone/Safari are NOT VERIFIED in this release run.

The standalone browser files were reviewed; current interaction execution used the supported Browser runtime and the accepted reusable P1R/HF1 helpers. Historical standalone browser counts are not reused as fresh results.

## Media and privacy

- Runtime MP4: 16,947,133 bytes, SHA-256 `d5790a7d141d44c8ca4924bda1833c2a8d49d86bb7e16e72d5a6f75f0b81ae8e`.
- Accepted metadata: 23.730998s, 1080x1920, 60fps, H.264 High / AAC, yuv420p, faststart; hash verified and local browser decoded playback observed.
- No quality-changing optimization was performed. Existing embedded Chinese/English subtitles, voice and framing are retained.
- Public-use authority comes from the owner's explicit P2 publication authorization and video acceptance. No independent third-party license evidence is invented.
- Owner master remains local and excluded. Full specification, Appendix, Premium datasets, source/reference screenshots and private documents are excluded.
- The known private source path has no tracked entry or object-path occurrence in public main history. Approved public source contains only six concise introductions and short Premium preview metadata.
- No staging/commit/push means no new public Git history or deployment exposure.
- Academy course video remains independently PENDING; Handbook video remains AVAILABLE.

## Candidate path list

Every copied candidate path was reviewed as scoped source, public approved media, focused tooling/tests, or sanitized stage documentation. This is an inventory only; staging is not authorized after the failed gate.

```text
.gitignore
docs/editing-handbook/edu-1e-p1-implementation.md
docs/editing-handbook/edu-1e-p1-reconciliation.md
docs/editing-handbook/edu-1e-p1r-hf1-hero-visibility.md
docs/editing-handbook/edu-1e-p1r-implementation.md
package.json
public/images/editing-handbook/asset-manifest.json
public/images/editing-handbook/book-256.webp
public/images/editing-handbook/book-512.webp
public/images/editing-handbook/book-960.webp
public/images/editing-handbook/book-entry.png
public/media/editing-handbook/intro-24s.web.mp4
public/media/editing-handbook/intro-poster.webp
public/media/editing-handbook/media-manifest.json
scripts/editing-academy-preview.mjs
scripts/editing-handbook-assets.mjs
scripts/editing-handbook-intro-media.mjs
scripts/validate-editing-handbook.mjs
src/app/ex-ai/editing/handbook/page.tsx
src/app/ex-ai/page.tsx
src/app/resources/page.tsx
src/components/CreatorStudioHero.tsx
src/components/editing-academy/EditingAcademy.tsx
src/components/editing-handbook/editing-handbook.module.css
src/components/editing-handbook/handbook-intro.module.css
src/components/editing-handbook/HandbookBook.tsx
src/components/editing-handbook/HandbookEntry.tsx
src/components/editing-handbook/HandbookIntroPlayer.tsx
src/components/editing-handbook/HandbookPage.tsx
src/components/editing-handbook/HandbookPlaybackFeedback.tsx
src/components/editing-handbook/PremiumPreview.tsx
src/components/editing-handbook/TermIllustration.tsx
src/data/editing-handbook/index.ts
src/lib/handbook-intro.ts
tests/creator-universe.test.mjs
tests/editing-academy-browser.test.mjs
tests/editing-handbook-browser.test.mjs
tests/editing-handbook-hero-visibility.browser.mjs
tests/editing-handbook-hero-visibility.test.mjs
tests/editing-handbook-intro-browser.mjs
tests/editing-handbook-intro.test.mjs
tests/editing-handbook-preview.test.mjs
tests/editing-handbook.test.mjs
```

Excluded: private original specification and reference folder; owner video master; all P1/P1R/HF1/P2 screenshots and scan output; node_modules; .next; out; .npm-cache; unrelated parent changes and projects. The local release record itself is not staged.

## Rollback and public status

Production remains at `75dbca1b3aa0d857377bfe7646f516a1ccd18acc`, previous successful Pages run 38110941725. No rollback is needed. For a future published focused release, use a reviewed normal revert of only that release commit followed by the existing Pages workflow; verify current remote main before doing so. Never force-push or alter DNS for rollback.

Current public root, EX AI, Resources, Academy, Market Radar, Property Media, Creator Academy and AI Learning returned HTTP 200 during preflight. The not-yet-released Handbook route returned 404. The checked existing security headers were not changed. No Cloudflare/DNS/hosting setting was changed.

Commit: NOT PERFORMED. Push: NOT PERFORMED. Deployment: NOT PERFORMED.
Stop at the identified mobile visual blocker; no membership, payment, Premium delivery or later stage has started.
