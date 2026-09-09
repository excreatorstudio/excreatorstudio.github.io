# Phase 2E-A — Root Homepage Audit

Audit date: 2026-09-09  
Scope: the existing root homepage before the E.X Creator Universe cutover.

## Current root content

| Existing content | Decision | Rationale |
| --- | --- | --- |
| `CreatorStudioHero` presentation shell | SAFE TO REPLACE | Presentation-only root surface; the shared Universe now provides the top-level entrance. |
| Learning Apps / product-link aggregation | MOVE / ALREADY EXISTS ELSEWHERE | Destination products remain available through their existing routes and the four Galaxy owners. |
| AI Learning Station entry | ALREADY EXISTS ELSEWHERE | Owned by the Knowledge Galaxy and `/ai-learning/`. |
| Creator Academy promotion | ALREADY EXISTS ELSEWHERE | Owned by the Create Galaxy and its existing route. |
| Creator Categories | ALREADY EXISTS ELSEWHERE | Existing category pages remain reachable; the Galaxy layer is now the primary product taxonomy. |
| Membership preview copy | SAFE TO REPLACE | Planning copy only; no authenticated membership workflow is removed. |
| Tutorial / resource cards | KEEP VIA EXISTING ROUTES | Existing `/ai-tutorials/` and `/resources/` destinations remain intact outside the new root surface. |
| Property Media entry | KEEP | Remains a low-priority company showcase portal to `/property-media/`, rendered below the Universe after intro. |
| Shared header and footer | KEEP | The header now uses the approved Universe utility shell; shared footer and route behavior remain available. |

## Cutover decision

The root page is safe to replace with the shared `UniversePreview` implementation because the former root was an aggregation/presentation layer, while its meaningful destinations remain in their own static routes. No route, media asset, account flow, or business logic is deleted by this cutover.

- `/` renders the shared Universe with indexable root metadata and the secondary Property Media portal.
- `/universe-preview/` remains the QA/fallback route and stays `noindex`.
- Intro/session behavior is shared through `UniverseIntro`: first session playback, `?intro=1` force replay, safe skip handoff, muted autoplay, and reduced-motion fallback.
- The four primary Galaxy labels remain `創作 / Create`, `知識 / Knowledge`, `語言 / Language`, and `洞察 / Insight`.
- Existing `/ai-learning/`, `/market-radar/`, `/property-media/`, and other static destinations are not removed or redirected.

