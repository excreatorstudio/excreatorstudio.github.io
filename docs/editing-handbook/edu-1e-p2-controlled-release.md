# EDU-1E-P2 — Controlled public release manifest

Date: 2026-10-20. Owner accepted P1R engineering, the approved Yuni video, HF1 desktop/mobile visibility, legacy-test reconciliation and the HF2 mobile collision correction. This is the focused release source manifest, not a claim of deployment success before the publishing workflow completes.

## Production baseline and publishing boundary

- Repository: `excreatorstudio/excreatorstudio.github.io`.
- Verified publishing remote/branch: `exstudio`, `refs/heads/main`.
- Fresh remote main and isolated checkout base: `75dbca1b3aa0d857377bfe7646f516a1ccd18acc`.
- Previous successful Pages Actions run: `38110941725`.
- Previous GitHub Pages deployment: `6990786120`.
- Existing workflow: `.github/workflows/deploy.yml`, push to main, `npm ci`, `npm run build`, upload `out`, deploy Pages.
- Workflow, dependencies/lockfile, Next.js configuration, CNAME and global styles are unchanged.
- Only this focused release commit may be pushed, non-force, to the verified existing publishing branch. No tags or other remotes/branches.

## Accepted source provenance

The isolated P2 candidate includes EDU-1E-P1, P1R, HF1, the legacy Teaching Resources assertion reconciliation and HF2. The original accepted implementation checkout remains unchanged. HF2 modifies only the existing Hero wrapper and scoped mobile layout; its 430px 9.7px collision is removed without hiding/replacing the book or changing desktop rules. The owner has now accepted that visual correction.

The Handbook has one canonical content route: `/ex-ai/editing/handbook/`. EX AI Hero, local Teaching Resources, Editing Academy and Resources Center open the same shared intro. Real hrefs retain direct reading and normal browser-link behavior. Six public terms and brief Premium preview metadata are the only public Handbook lesson data. Premium dialogs are informational, not authentication or a fake paywall.

## Exact release paths

The list below contains 46 paths. No broad staging. Historical stage docs describe their original stage state and are intentionally preserved; this manifest is the current release decision record.

```text
.gitignore
docs/editing-handbook/edu-1e-p1-implementation.md
docs/editing-handbook/edu-1e-p1-reconciliation.md
docs/editing-handbook/edu-1e-p1r-hf1-hero-visibility.md
docs/editing-handbook/edu-1e-p1r-implementation.md
docs/editing-handbook/edu-1e-p2-release.md
docs/editing-handbook/edu-1e-p2-hf2-mobile-collision.md
docs/editing-handbook/edu-1e-p2-controlled-release.md
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

Staging uses `git add --` with exactly the reviewed list above. The ignored local release tool validates that list against every changed/untracked candidate and the staged index before commit. No partial unrelated hunks are included.

## Explicit exclusions

- Private source `docs/editing-handbook/excreatorstudio-site-spec.md`, complete Appendix A, full Premium glossary/prompts/storyboards, private datasets and source exports.
- `docs/editing-handbook/references/`, layout references, owner video master `public/videos/editing-handbook/handbook-intro-24s.mp4`.
- `.npm-cache/`, `.next/`, `out/`, `node_modules/`, local browser screenshots/logs/audits, local validation helpers and generated test output.
- Parent dirty Property Media, unfinished Training Manager, `_pm_vnext_merge`, Generation/Creative Studio/other projects, private learning data and all unrelated source.
- No `.env` files or credentials; only existing non-secret `.env.example` remains in the unchanged base.

The private original specification has no tracked path or known object-path occurrence in the current public main history. It is not a release file, and the exact local path/reference folder is ignored. The selected source, staged blobs and final static output are scanned for credentials and reserved private content without printing content or secret values.

## Approved media

- Runtime video: `/media/editing-handbook/intro-24s.web.mp4`, 16,947,133 bytes, SHA-256 `d5790a7d141d44c8ca4924bda1833c2a8d49d86bb7e16e72d5a6f75f0b81ae8e`.
- Duration 23.730998s; 1080×1920, 60fps, H.264/AAC, yuv420p, faststart. Original accepted web bytes retained; no new transcode or quality change.
- Poster: approved local 540×960 WebP, 76,614 bytes.
- Public-use authority: owner publication authorization and explicit human media acceptance. No independent third-party license claim is invented.
- One shared player per page, `preload="none"`, no autoplay attribute, user-gesture playback attempt and truthful blocked-playback fallback. Replay, close, skip/read and natural end are checked; no end redirect.
- Academy's separate four-step tutorial remains PENDING and has no substituted Handbook media.

## Fresh release gates

All blocking pre-publication gates PASS from this isolated HF2 source:

| Gate | Fresh result |
| --- | --- |
| Typecheck / Lint | PASS / PASS, no lint warnings/errors |
| Static build | PASS, 43/43 generated pages; 42 physical HTML files |
| Canonical full regression | 189 PASS / 1 unchanged optional-workbook SKIP / 0 FAIL |
| Creator Universe | 28 PASS / 0 FAIL |
| Handbook focused | 14 PASS / 0 FAIL |
| Academy / entry / Hero focused | 18 PASS / 0 FAIL (10 + 4 + 4) |
| Source/output build privacy gates | PASS; 149 output text assets and 9 private blocks compared |
| Additional selected-source/output audit | PASS; 46 approved paths, 193 text files, zero findings, zero public source maps |
| Browser flows | 48 PASS across 1920/1440/1280/1024/768/430/390/320; four entries, media, terms, Premium, light/dark, keyboard, focus and refresh |
| Stable Hero geometry | 13 PASS covering all ten widths including 375/360; extra 375×667, 360×640, 320×568, 430×740, 390×667 |
| Extra short-height search / pointer / keyboard / ESC / focus | 5 PASS |
| 430px collision | 0px, 22.4px eyebrow-to-brand-box gap; approved PNG visible |
| Browser application errors | NONE OBSERVED in final checks |
| Parent / accepted checkout preservation | 10 protected parent hashes and 43 accepted-checkout hashes unchanged; other 41 P2 candidates unchanged from accepted source |
| Whitespace / source isolation | PASS; staged blobs and exact index list rechecked before commit |

The existing nested-checkout/multiple-lockfile warning is non-blocking. The unchanged canonical CBC test skip depends on an optional retained official workbook. Suite counts are separate, not additive.

Actual on-demand media observation uses request starts and abort/close events: zero MP4 starts before the first book activation, `preload=none`, paused/readyState 0 and no autoplay. Activation triggers a same-origin ranged GET and a 206 response. Decoded playback is unmuted, 1080×1920, duration 23.730998s. Pause/replay work; natural end is observed at the same URL with `ended=true`, followed by a working deliberate reading link. Server queued/socket bytes are not claimed as acknowledged client delivery. Physical audio and iPhone/Safari remain NOT VERIFIED in this run.

One action-layer natural-end wait expired before the real 24-second clip finished; later actual DOM state confirmed natural end. One automated keyboard dispatch immediately after an Academy route change did not open the dialog; direct accessibility-keyboard activation worked. A local ignored harness now waits for page load and a stable interactive frame before dispatch, and the affected 1440px flow plus all remaining widths passed. No product or approved test-source logic changed for these harness timing adjustments. These are recorded rather than misreported as product fixes.

Existing public root/EX AI/Resources/Academy/Market Radar/Property Media/Creator Academy/AI Learning all return 200 over HTTPS before publication. HTTP EX AI also returns 200 without a redirect in the current baseline. This existing posture is preserved, not hardened or represented as mandatory HTTPS enforcement. Existing Pages headers are captured for live comparison; no CSP or other security control is weakened.

Ignored local evidence is under `.npm-cache/p2-resume-evidence/`, with validation logs, exact source fingerprints, request-start traces, stable screenshots and browser result JSON. Staged-source scan, final publishing result and live checks are retained separately. Any subsequent blocking gate failure stops publication.

## Rollback readiness

Before push, recheck remote main to avoid overwriting another release. Record the focused release commit and the existing production SHA/run/deployment above. If a live regression is found, stop further feature changes, review a normal revert of only that focused commit against current main, run the existing Pages workflow and confirm restored routes. Do not force-push, reset shared history, change DNS or copy dirty parent state. This is a documented procedure; no destructive rollback rehearsal is performed.

Cloudflare/DNS/registrar/hosting changes: ZERO. No membership, payments, new AI service, database or Premium delivery is added. Deployment identifiers and live QA are recorded separately after actual workflow completion; this pre-publication manifest does not invent those results.
