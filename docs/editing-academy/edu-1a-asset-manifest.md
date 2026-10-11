# EDU-1A — Editing Academy asset governance

Date: 2026-10-11. Route: `/ex-ai/editing/`. No asset generation, external download, or video API call.

## Audited local material

- `public/images/creator-studio/hero-showcase-v1.png`: existing tracked, active EX AI studio illustration. Inspected: camera, workstation, screen wall; no identifying client information. Reused only as a clearly labelled **MOCK_ONLY studio illustration**, not an actual classroom or final licensed photograph. Prior runtime use is not proof of production licensing.
- `public/images/property-media/posters/**`: existing portfolio derivatives governed by Property Media Stage 2. Not reused for Academy: samples are not Academy lessons/student work; some contain property/business identity. Original files unchanged.
- `public/media/property-media/**`, `public/videos/creator-academy/**`: existing unrelated media, not verified as F01–F03 teaching content. Not loaded by the new route.
- `docs/design-reference/**`, `docs/design/**`, `docs/visual-reference/**`: REFERENCE_ONLY; not copied/imported into this route.
- Candidate Universe / Property Media artwork: no silent promotion to Academy runtime.

## Active file assets

| ID | Runtime path | Status | Format / dimensions | Bytes | Alt / focal point | Usage |
| --- | --- | --- | --- | ---: | --- | --- |
| studio-wide | `/images/editing-academy/studio-1600.webp` | MOCK_ONLY | WebP / 1600×900 / 16:9 | 63,156 | 剪輯工作室視覺示意：攝影機、剪輯工作站與多螢幕監看牆 / 68% 50% desktop | Hero, eager/high priority |
| studio-small | `/images/editing-academy/studio-800.webp` | MOCK_ONLY | WebP / 800×450 / 16:9 | 25,946 | same meaningful alt / 75% 50% mobile | Responsive Hero source, selected below 768px |

Source for both: `/images/creator-studio/hero-showcase-v1.png` (1672×941; 1,531,856 bytes). Derivative command: `node scripts/editing-academy-assets.mjs`. Only resize/format conversion; original unchanged. No EXIF retained by the default derivative pipeline. No inference of production licensing.

Runtime file counts: **2 images / 0 videos; MOCK_ONLY 2; APPROVED_LOCAL 0; PRODUCTION_APPROVED 0; REFERENCE_ONLY 0**. One responsive Hero image is selected, not both. There are no below-fold raster requests to lazy-load: course/portfolio artwork is lightweight local CSS/HTML, with reserved aspect ratios.

Five reusable UI-art motifs (`timeline`, `sound`, `property`, `color`, `ai`) are **MOCK_ONLY** procedural layout illustrations, not image files. They have useful `role=img` labels; component innards are decorative. Visible `構圖示意` labels plus portfolio-wide `非學員作品` disclosure remain. No play button, fake before/after transformation, fabricated metrics, or student attribution.

Missing Hero file: same reserved composition, neutral E.X material and descriptive fallback, no broken-image UI. Text and navigation remain available.

## Required content briefs / gaps

| ID | Subject / composition | Crop / recommended source | Approval and content needed |
| --- | --- | --- | --- |
| HERO | Real editing workstation, camera supporting the environment, warm practical lighting, negative space left; no readable private screen content | 2400×1350; desktop right focal point, 800-wide mobile crop retaining camera | Academy usage rights; real classroom claim only if verified; optional short muted ambient video later |
| F01 | Three source clips arranged into a short-film timeline; neutral tools, no fabricated video duration | 1600×900 with central 70% safe crop | Actual lesson video, teaching outline, verified runtime, captions/transcript and thumbnail |
| F02 | Readable subtitle safe area and music waveform, no unlicensed song waveform/content | 1600×900; mobile keep subtitle and waveform | Actual lesson, verified runtime, captions/transcript, licensed music evidence |
| F03 | Approved residential interior with clear walking sequence, no owner/contact/address disclosure | 1600×900; center-safe space detail | Lesson, verified runtime, property permission, factual disclosure and thumbnail |
| P01 | CapCut learning outcome and organized editing workspace; no fake finished student work | 1600×1000; central safe area | Confirm syllabus, delivery format, version/requirements, price, schedule and approved inquiry/enrollment path |
| P02 | Professional edit/color environment, controlled warm-neutral grading context | 1600×1000; center-safe screens | Same approvals as P01 plus commercial delivery scope and Resolve version |
| P03 | Matched AI first/last frames and post-production context, coherent subject identity | 1600×1000; first/last frame survives mobile crop | Same approvals as P01 plus source/model rights and truthful AI disclosure |
| WORK-01 | Verified **same-source** Before/After pair, matching frame/composition | Pair at equal resolution, minimum 1600×900 | Original/edit ownership and permission, honest description; no outcome statistics |
| WORK-02 | Approved finished vertical Reel, strong center composition | 1080×1920 master + optimized derivative/poster | Creator credit, music rights, playback/accessibility approval; no student attribution without evidence |
| WORK-03 | Approved real-estate edit with no private data | 1920×1080 or native 1080×1920 | Property/media rights and safe public captions |
| WORK-04 | Approved AI-assisted edited sequence, coherent shots and restrained motion | Native 1080p master + poster | Source and AI disclosure, rights and accessibility text |
| COACH-01 | Optional individual work-review scene, natural side/back view; no staged testimonials | 1600×1000, environment-first crop | Actual format, scope, official contact, schedule/price if later approved |
| COACH-02 | Optional small-group practical teaching scene, no identifiable students without consent | 1600×1000, mobile center-safe crop | Actual class size/location/format, consent and official inquiry path |

All missing content remains **PENDING / COMING_SOON**. The phrase `30 秒` in F01 is the target exercise output, not an invented lesson duration. No price is displayed. Inquiry integration: **PENDING** (no verified destination in attachment or existing project governance). No contact information is invented; the page explains availability and collects nothing.

Replacement workflow: approved source → optimized local derivative → typed config/manifest update → accessible text and status verification → focused tests/browser QA. Approval is separate from file presence. Do not automatically change MOCK_ONLY to PRODUCTION_APPROVED.
