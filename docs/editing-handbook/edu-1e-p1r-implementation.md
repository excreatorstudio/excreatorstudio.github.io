# EDU-1E-P1R — Intro video, Premium preview and Teaching Resources

Date: 2026-10-19. Local engineering: PASS. Human visual/audio acceptance: PENDING. Deployment: NOT AUTHORIZED / NOT PERFORMED.

## Scope and source

Implementation continues in the existing detached EDU-1E-P1 checkout, `.npm-cache/edu-1e-p1`, based on `75dbca1b3aa0d857377bfe7646f516a1ccd18acc`. It does not build from or overwrite the unrelated dirty parent checkout. The original P1 reconciliation and historical P1 validation record remain unchanged; this document supersedes only the Handbook pending-video presentation and describes the authorized P1R additions.

| Observed media property | Owner master | Runtime derivative |
| --- | --- | --- |
| Container | MP4 | MP4, moov before mdat / faststart |
| Duration | 23.730998 seconds | 23.730998 seconds |
| Frame | 1080×1920, 9:16 | 1080×1920, 9:16, contain |
| Video | H.264 Main, 60 fps, yuv420p | H.264 High, 60 fps, yuv420p |
| Color | Limited-range BT.709 | Limited-range BT.709, retained |
| Audio | AAC-LC, stereo, 44.1 kHz | Same AAC bitstream; not re-encoded |
| Bytes | 22,381,517 | 16,947,133 (about 24.3% smaller) |

The owner source is `public/videos/editing-handbook/handbook-intro-24s.mp4` in the parent workspace, not the release checkout. SHA-256: `506e07cfbe629ebaa1fb21fd7ae2cd3bfb9494a1fcd5b9b9cedcc352aaa75253`. Original and derivative both passed a full FFmpeg decode. Copied audio packet SHA-256 for both is `e06c9a561adae4ddc1f70c94694a88c08c3ad3c1fe704feb110e67c66b0ad1df`. No crop, stretch, narration change, added subtitle track/overlay or regeneration was performed.

Important source discrepancy: the supplied video already contains burned-in Chinese/English captions and terminology graphics, despite the request's expected “no screen subtitles.” These original visuals are retained. Owner review must confirm acceptance or supply a replacement master; removing text from the supplied video is not silently attempted.

The 540×960 WebP poster (76,614 bytes) is an actual frame extracted at two seconds. `public/media/editing-handbook/media-manifest.json` records source provenance, runtime hash, dimensions, duration, approval and audio preservation. Only the web derivative, poster and manifest are included; the owner master is not copied into runtime. The output gate rejects an accidental master-video export.

Reproduction helper: `scripts/editing-handbook-intro-media.mjs`. Set `FFMPEG_PATH` / `FFPROBE_PATH` to installed executables, and optionally `HANDBOOK_INTRO_SOURCE` to the exact owner-approved file. It verifies the master fingerprint, creates only the named derivatives, copies audio, validates decode and writes the manifest. No package, framework or hosted-media service was added.

## Shared presentation and standard links

`HandbookIntroPlayer` is a client boundary scoped to four affected routes, not the global layout. One native video element per rendered page serves:

1. EX AI Hero book.
2. EX AI Teaching Resources book.
3. Editing Academy supplementary book.
4. The new Resources-center book.
5. The introduction teaser on direct Handbook entry.

`HandbookIntroLink` retains a real `/ex-ai/editing/handbook/` href. Only plain primary activation is intercepted; modifier/middle clicks, download/other-target semantics and no-JavaScript navigation retain the normal link path. No private authority or fake authentication is attached to these controls.

The video element is already mounted with `preload="none"`, controls, playsInline and a poster, but without autoplay or muted attributes. Opening the native dialog and invoking `play()` happen synchronously inside the same genuine user gesture, without delayed navigation, timer or render effect. Initial browser checks observe one paused video, a closed dialog and readyState zero; initial page load does not start playback.

Rejected playback promises show the explicit `點擊播放影片` action. They do not imply success or silently switch to muted autoplay. Close and ESC pause playback and return focus. Native controls plus explicit Play/Pause and Replay are usable. End state retains a poster, exposes `開始閱讀剪片說明書 →` and `重新觀看`, and does not redirect. The Handbook can be entered before the video ends.

Direct Handbook entry displays content immediately and an obvious real-video introduction near the top; it does not autoplay. Its config is AVAILABLE, independent of the Academy's unchanged four-step course config, which remains PENDING.

## Resources and Premium boundaries

The selected baseline `/resources/` was a placeholder, with a description and “內容準備中” text but no active downloads. Its original description and preparation message are retained. Its local heading is now `教學資源中心 / LEARNING RESOURCES`, with the approved book, the shared intro behavior, direct reading and Academy links. Global navigation labels, the homepage Resources link, Latest Tutorial, YUNI and category order are unchanged.

The original six free terms, original SVG illustrations, short definitions/examples, keyboard interaction and themes remain. Six Premium feature titles are reused as cards, with short public descriptions, a lock, Premium status and geometric blurred decoration. The blur contains no source text. Every card opens only the informational membership-preparation dialog; Close/ESC and focus return work.

No full glossary, advanced prompt, storyboard schema/JSON, Premium Markdown/dataset or original specification is imported or exported. The source schema limits cards to id/title/short description. The original private source and layout reference remain excluded from Git and public output. Local output comparison checks nine reserved source blocks without printing their text.

This is not an entitlement system. Real membership still requires separately authorized identity, server-side entitlement enforcement, private delivery, payment confirmation and revocation. No login, checkout, payment, database, member API or external AI connection was implemented. Handbook membership remains separate from Academy course access.

## Validation evidence

Report suites separately; do not sum overlapping counts:

| Check | Result |
| --- | --- |
| `npm.cmd run test:editing-handbook` | 14 PASS: existing Handbook 5, intro 8, preview MIME/range 1 |
| Academy content regression | 10 PASS |
| Existing homepage-entry regression | 4 PASS |
| Canonical `npm.cmd test` | 189 PASS; one pre-existing skip; zero fail |
| Typecheck | PASS |
| Lint | PASS; no warnings |
| Static build | PASS, 43/43 pages; no route-count change from P1 |
| Output privacy scan | PASS; 149 text assets, nine reserved source blocks, no match |
| Local routes | Nine relevant routes return HTTP 200 |
| Browser width/theme checks | 36 unique records, not a historical-suite count |

The supported Browser runtime tested 1440 / 1024 / 768 / 430 / 390 / 320. Each width covers four book openings and two Handbook theme/term/Premium flows. All 24 book-opening records reached actual playing state. The test checks closed/paused initial state, one player, actual duration/resolution, portrait ratio, dialog/Close bounds, no horizontal overflow, keyboard activation, ESC, focus return, direct reading, six selections, Premium dialog and refresh/theme persistence. Additional live checks cover every Premium card, all six existing Academy course dialogs, Academy four-step keyboard/pointer behavior, native-dialog focus containment and EX AI client-navigation shell restoration.

The video was observed advancing, replay restarted near one second, and natural end was observed at 23.730998 seconds on desktop/mobile without redirect. This verifies media/UI operation in local Chromium. It does NOT establish actual loudspeaker output or universal audible autoplay support. Hardware audio: NOT_VERIFIED. iPhone/Safari/physical touch: HUMAN_QA_REQUIRED. Denied-playback behavior was unit-tested (including rendered fallback button); the real browser accepted the tested gestures, so a real policy denial was NOT observed.

Console inspection observed no new application errors. The historical EX Galaxy prefetch 404 remains a known baseline issue, not a new fix or a promise that every browser log is globally clean. New media URLs are same-origin and no external provider/fetch/integration was added; a full HAR/network trace was not available from this browser surface.

Reduced-motion CSS remains present, the new overlay is not animated continuously, and keyboard/native semantics remain. Screen-reader, physical-device and full WCAG audits are NOT claimed. The React checklist informed the scoped provider, single shared video, event-driven playback and independent lesson state.

The existing standalone Handbook/Academy browser test sources were adapted to the new intro-first behavior and to scope pending-video assertions to the Academy course. They were NOT rerun as separate standalone suites in this stage; current UI evidence comes from the supported Browser runtime and the 36 records plus additional checks. Previous P1 14/17 counts are not reused as fresh P1R results.

Tooling limitation: same-call batched browser screenshots could lag behind DOM state; full-page capture also failed on this surface. Those diagnostic images are not the review pack. Final `review/` JPEGs were captured in a separate call after each prepared view and visually inspected; corresponding AX text is saved. Local viewport screenshots, not a physical-device audit.

Build retains the existing nested-worktree/multiple-lockfile warning. It completes successfully; no unrelated Next.js root/tracing configuration was changed merely to silence it.

## Review handoff

Working checkout: `D:\CODEX-\E.X Learning & Knowledge Hub\.npm-cache\edu-1e-p1`.

- EX AI: `http://127.0.0.1:4327/ex-ai/`
- Resources: `http://127.0.0.1:4327/resources/`
- Academy: `http://127.0.0.1:4327/ex-ai/editing/`
- Handbook: `http://127.0.0.1:4327/ex-ai/editing/handbook/`
- Reviewed evidence index: `.npm-cache/edu-1e-p1r-evidence/review/README.md`.
- Structured checks: `.npm-cache/edu-1e-p1r-evidence/browser-results.json` and `additional-browser-results.json`.

Restart locally if necessary:

```powershell
$env:EDITING_STATIC_DIR = 'out'
$env:EDITING_PREVIEW_PORT = '4327'
node scripts/editing-academy-preview.mjs
```

The local preview helper now supports correct MP4/WebM MIME, HEAD and byte ranges for native playback/seek; it is not a new production server. Hosting and GitHub Pages remain unchanged.

Human acceptance must review actual sound, the supplied video's baked-in text, all book entry impressions and real iPhone Safari behavior. The approximately 17 MB 1080p60 derivative remains a bandwidth consideration; this stage does not add a CDN/adaptive-streaming architecture or hide quality changes to chase a tiny file size.

## P1R-only change inventory

Modified relative to the local P1 implementation:

```text
package.json
scripts/editing-academy-preview.mjs
scripts/validate-editing-handbook.mjs
src/app/ex-ai/page.tsx
src/app/resources/page.tsx
src/components/editing-academy/EditingAcademy.tsx
src/components/editing-handbook/HandbookEntry.tsx
src/components/editing-handbook/HandbookPage.tsx
src/components/editing-handbook/editing-handbook.module.css
src/data/editing-handbook/index.ts
tests/editing-academy-browser.test.mjs
tests/editing-handbook-browser.test.mjs
tests/editing-handbook.test.mjs
```

Created:

```text
docs/editing-handbook/edu-1e-p1r-implementation.md
public/media/editing-handbook/intro-24s.web.mp4
public/media/editing-handbook/intro-poster.webp
public/media/editing-handbook/media-manifest.json
scripts/editing-handbook-intro-media.mjs
src/components/editing-handbook/HandbookIntroPlayer.tsx
src/components/editing-handbook/HandbookPlaybackFeedback.tsx
src/components/editing-handbook/PremiumPreview.tsx
src/components/editing-handbook/handbook-intro.module.css
src/lib/handbook-intro.ts
tests/editing-handbook-intro-browser.mjs
tests/editing-handbook-intro.test.mjs
tests/editing-handbook-preview.test.mjs
```

Package changes add a focused test command only; no dependency/lockfile upgrade. Original book PNG, private specification, layout reference, owner video and unrelated dirty parent files remain unchanged. Evidence, generated output and installed dependencies remain ignored, outside runtime/source staging. No staging, commit, push, deployment, DNS/Cloudflare change, membership or payment work was performed.

STOP: await owner visual/audio acceptance. No automatic next stage or public release.
