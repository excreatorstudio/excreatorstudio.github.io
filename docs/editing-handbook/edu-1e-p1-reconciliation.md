# EDU-1E-P1 — Requirement reconciliation

Status: OWNER-AUTHORIZED SCOPE RECONCILED; implementation review pending.

Baseline: `75dbca1b3aa0d857377bfe7646f516a1ccd18acc`, the verified public Next.js / GitHub Pages main. Work is isolated from the dirty development checkout. No commit, push, or deployment is authorized.

## Private source provenance

The complete original specification, Sections 0–10 and Appendix A1–A8, was read locally. It remains unchanged outside this implementation checkout. Its SHA-256 is `7bc329f59ea05912f320bb10b6494d71fceec3e198226acaa2ac836c21a5c6e6`. Do not copy its full text into this document, source modules, Git, build output, search indexes, or public assets.

At audit time the exact source path had no tracked entry or history in local refs or the verified public main tree. Its public website and raw-repository paths returned 404. Local Git exclusions and candidate `.gitignore` rules protect the private source and layout reference from accidental staging. This is an exposure check of the known paths, not a claim to have scanned all historic URLs.

## Decisions and mapping

| Original requirement | Classification | Current decision |
| --- | --- | --- |
| §0 complete reading, maintainable data, staged work | PUBLIC_FREE | Read completely; typed public data; local engineering review followed by human visual review. |
| §0 confirm plan before implementation | SUPERSEDED_BY_OWNER | EDU-1E-P1 explicitly authorizes the listed reconciled decisions. No further confirmation is required for this scope. |
| §1 beginner learning and terminology | PUBLIC_FREE | Six introductory terms and one original visual example each. |
| §1 complete workflow, copying instructions, templates | FUTURE_PREMIUM | Only feature names are public; full source material is excluded. |
| §2 root site, Cloudflare hosting, DNS and www work | SUPERSEDED_BY_OWNER | Add one child route under existing EX AI; preserve GitHub Pages, domain and DNS. |
| §2 automatic publication | DEFERRED | No deployment in this stage. |
| §3 static site and content/presentation separation | PUBLIC_FREE | Retain Next.js static export; no new framework or backend. |
| §3 Astro / Vite / standalone site alternatives | SUPERSEDED_BY_OWNER | Existing Next.js architecture remains authoritative. |
| §3 no analytics; local preferences only | PUBLIC_FREE | No tracking or external service is added. |
| §4 single page, hero, navigation and footer | PUBLIC_FREE | One handbook content route, scoped reading shell and two return links. Three entries point to it. |
| §4 full how-to, workflow, shot/camera libraries, glossary, prompts and templates | FUTURE_PREMIUM | Only the approved six-term introduction and curated feature preview are exposed. |
| §4 automation integration | DEFERRED | No actual editing, AI generation or automation runs. |
| §5 full-copy button, per-prompt copy, variable highlighting and JSON download | FUTURE_PREMIUM | No full-content copy/export interface in the public preview. |
| §5 complete glossary search/category filters and prompt scenario switching | FUTURE_PREMIUM | Six-term selection replaces a full public reference search. |
| §5 mobile usability, original SVG, theme and navigation feedback | PUBLIC_FREE | Accessible term selection, original six illustrations, local light/dark/system themes and reduced motion. |
| §5 public llms.txt / handbook.md with complete source | SUPERSEDED_BY_OWNER | Explicitly prohibited; no equivalent full static export. |
| §6 typography, touch targets, readable visual examples | PUBLIC_FREE | System fonts, large visual surfaces and concise Traditional Chinese. |
| §6 tool-document layout and dominant warm orange | SUPERSEDED_BY_OWNER | Approved electric-blue book identity, navy/graphite editorial surfaces; restrained warm highlights only. |
| §7 independent content records | PUBLIC_FREE | Public typed six-term data and approved Premium preview metadata only. |
| §7 full original datasets and generated Markdown aggregation | FUTURE_PREMIUM | Keep full material private; do not import it into the build. |
| §8 desktop/mobile, metadata and maintainable updates | PUBLIC_FREE | Static route metadata and automated/browser regression gates. |
| §8 physical Safari and Lighthouse target | DEFERRED | Report actual tooling evidence; physical device review and formal scores are not assumed. |
| §8 domain binding and www redirects | SUPERSEDED_BY_OWNER | Existing infrastructure remains untouched. |
| §9 copyright restrictions and original diagrams | PUBLIC_FREE | Applies to current and future content; no third-party screenshots or prohibited external glossary/prompt collections. |
| §10 name, Traditional Chinese, no email collection/analytics | PUBLIC_FREE | Use 剪片說明書; no mailing list or tracking. |
| §10 all-free default | SUPERSEDED_BY_OWNER | Free introductory preview plus future Premium content. |
| §10 Instagram/contact defaults | DEFERRED | No unapproved contact URL or collection mechanism. |
| A1 complete copy-to-AI usage material | FUTURE_PREMIUM | Public positioning is a teaching resource, not an operational editing agent. |
| A2 complete ten-step workflow | FUTURE_PREMIUM | Public feature label only. |
| A3 introductory framing example | PUBLIC_FREE | One general example uses the same subject at different shot sizes. |
| A3 complete shot-size reference library | FUTURE_PREMIUM | The complete reference material remains private. |
| A4 introductory camera movement | PUBLIC_FREE | A concise original push-in example explains movement. |
| A4 full camera-angle/movement guidance | FUTURE_PREMIUM | The complete guidance remains private. |
| A5 approved introductory glossary terms | PUBLIC_FREE | Rewrite only the owner-approved introductory definitions. |
| A5 complete glossary | FUTURE_PREMIUM | No full glossary export or hidden public dataset. |
| A6 storyboard fields and JSON | FUTURE_PREMIUM | No schema, specimen JSON or downloadable full template is published. |
| A7 advanced instruction set | FUTURE_PREMIUM | No complete prompt text is copied or bundled. |
| A8 automation reference material | FUTURE_PREMIUM | Full reference content remains private. |
| A8 real services and execution | DEFERRED | No actual automation runs or provider connections in P1. |

## Terminology reconciliation

Shot size is subject framing, not camera angle. Camera movement distinguishes translating the camera from rotating it; the public example uses a push-in. A transition example compares a cut with a dissolve. B-roll supports the main narrative and is not restricted to removing monotony. Jump cut describes the visible discontinuity between similar compositions; removing a pause is an example, not its complete definition. Timeline is a new owner-approved introductory term, not falsely attributed to an Appendix A glossary row.

## Product and release boundaries

- The main resource entry, responsive Hero shortcut and Academy supplementary entry all target `/ex-ai/editing/handbook/`.
- Preserve the Resources link `/resources/`, Latest Tutorial, YUNI, all six categories, Academy course content and unrelated routes.
- The handbook video has independent configuration and remains PENDING. The proposed three-minute duration is not a verified runtime.
- Premium preview contains feature names only. Handbook membership and paid Academy courses have separate future entitlements; no prices, checkout, login or member database are implemented.
- Future private delivery requires verified identity, server-side entitlement checks, payment confirmation and revocation. Static client flags or hidden content do not provide access control.
- Hero placement uses the reference as direction. When adjacent positioning would obstruct existing controls, the book reflows below the title rather than using screenshot coordinates.
