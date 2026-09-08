# Phase 2D — Navigation & Product UX Consolidation

## Scope and IA decision

Preview only: `/universe-preview/`, noindex. Production homepage source is unchanged. Product Design review informed the utility-only header and progressive disclosure; the accepted Phase 2C composition, gyro math, focus lighting, ambient timing and intro remain unchanged.

The four galaxies own product navigation. The preview header exposes only Universe entrance and About E.X. Account placeholders are omitted, not replaced with invented authentication. Other routes retain the existing shared header markup through an exact preview-path branch. See [navigation map](phase-2d-navigation-map.md).

Create leads to the existing Creator Academy rather than the placeholder Video Production page. Knowledge leads to AI Learning; Insight to Market Radar. Language reveals the two existing local language landing pages; their downstream external hosting links remain outside this change. Custom-domain availability was not confirmed, so no external domain migration is implied. Planned products are not clickable placeholders.

## Hero and interaction

Chinese proposition: 創作、學習、語言與洞察，匯聚成你的 AI 工作宇宙。

English secondary: Create · Learn · Connect · Discover.

Exactly one primary CTA: 開始探索 / Start Exploring. It focuses Knowledge without route navigation and scrolls it into view on mobile. Existing sensor permission control remains a separate utility, not a competing primary CTA.

Secondary links are separate semantic anchors, never nested inside the galaxy anchor. Inactive destination groups are hidden and inert; active links enter keyboard order. Tab reaches the revealed destinations, Enter navigates, and Space is handled for the links. The motion hook changes only `:focus` to `:focus-within` so secondary keyboard focus retains the existing spatial focus. Mobile retains first-tap focus and second-action navigation. Language's main action opens its choices.

## Image audit and candidates

All six PNG files have no alpha channel. Current dark edges/glow rely on the image content and existing composition, not transparency. Candidates preserve dimensions. Bytes below are decimal; hashes and reproducible file-level inventory are in `public/images/universe/candidates/audit.json`.

| Asset | Dimensions | PNG bytes | WebP bytes | AVIF bytes |
| --- | --- | ---: | ---: | ---: |
| background-depth-v1 | 1536 × 1024 | 1,471,687 | 17,370 | 5,010 |
| core-v2 | 1254 × 1254 | 1,385,018 | 97,766 | 49,033 |
| create-v2 | 1254 × 1254 | 1,475,289 | 107,990 | 48,918 |
| knowledge-v2 | 1254 × 1254 | 1,211,614 | 65,762 | 32,207 |
| language-v2 | 1254 × 1254 | 1,196,695 | 69,928 | 34,851 |
| insight-v2 | 1254 × 1254 | 1,148,635 | 62,500 | 24,092 |
| Total | | 7,888,938 | 421,316 | 194,111 |

WebP reduction: 94.66%; AVIF: 97.54%. A reduced-size side-by-side contact sheet was inspected: silhouettes, rings and light hierarchy remain similar. This is NOT a full-resolution gradient/banding quality approval. Keep production PNG; WebP is the conservative first candidate for manual review, AVIF an optional alternative. No runtime paths switched. No reference files used or modified.

## Video audit

| Video | Original | Candidate | Reduction |
| --- | ---: | ---: | ---: |
| Desktop | 22,039,749 bytes, 3840 × 2160 | 11,441,588 bytes, 1920 × 1080 | 48.09% |
| Phone | 21,079,262 bytes, 2160 × 3840 | 9,950,157 bytes, 1080 × 1920 | 52.80% |

Candidates: `public/video/ex-creator-universe-intro-web.mp4` and `public/video/ex-creator-universe-intro-phone-web.mp4`. H.264 CRF 18, slow preset, yuv420p, AAC, faststart. Originals preserved and hash-tested. These conservative candidates exceed the preferred 5–10 MB / 4–8 MB targets slightly. Full temporal quality review of black gradients, bloom, compression noise and final-frame continuity is pending. Production Video Switched: NO.

Generator: `scripts/universe-media-candidates.mjs`, using installed sharp and optional `UNIVERSE_FFMPEG`. It refuses candidate overwrite. Candidates are review artifacts, not runtime dependencies; avoid shipping unused alternatives in a later release without an explicit packaging decision.

## Loading / performance audit

Intro selects one viewport-specific source, with preload and muted autoplay. Universe remains pre-mounted; Core is prioritized, galaxy images use lazy loading, and CSS background can load during intro. Existing unoptimized images do not obtain smaller files merely from sizes. No preload or activation schedule was changed: primary interaction after handoff and ambient delay remain protected. Approving compressed media offers the largest next bandwidth reduction without risking a late-loading planet. Separate mobile raster variants remain optional after quality review.

## Validation and remaining review

- Typecheck and lint passed; main suite 192/192 and Universe focused suite 26/26 passed.
- Static export build passed, 39 pages generated.
- Built-in browser inspected 1440, 1024, 768 and 390 layouts. No observed clipping or horizontal overflow in inspected neutral/Knowledge-focus states. Mobile utility menu and Knowledge secondary links are readable.
- CTA remains in preview and focuses Knowledge; Tab reaches Classroom; Enter loads the actual Classroom route.
- Real iPhone gyro, all moving focus extremes, reduced-motion device preference, long ambient observation and low-end-device performance require manual regression. Source contracts remain tested; no claim of new device acceptance.
- Full-resolution image and full-playback video comparison remain required before production switch.
- No stage, commit, push or deploy. Phase 2E production-homepage promotion is NOT READY until local product review and device regression are accepted.
