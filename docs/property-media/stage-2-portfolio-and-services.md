# E.X Property Media — Stage 2 Portfolio & Service Exploration

## Product structure

`/property-media/` remains an E.X ecosystem route, not a standalone site. Stage 2 extends the approved Stage 1 introduction with this browsing sequence:

1. Hero and a single “查看作品 / Selected works” CTA
2. Selected Works: three editorial-scale items
3. Category Explorer and the complete portfolio library
4. AI Space Transformation
5. Service Chapters and a four-step process
6. A frontend-only inquiry summary

## Portfolio and category decisions

The media data lives in `src/data/property-media-portfolio.ts`, separate from visual components. Current categories are based on verified folders and media rather than invented products:

- 房屋導覽 / Property Tour
- 現場口播 / Presenter-led
- AI 空間展示 / AI Staging
- 土地呈現 / Land Visual
- 其他 AI 作品 / Other AI

Items are labelled as showcase or AI demo. No customer, address, transaction, performance result, or fabricated project detail is presented.

## Media loading strategy

- The page initially loads derived poster images only.
- Gallery cards never mount a video element.
- The selected media source is mounted with `preload="metadata"` only after the visitor opens the lightbox.
- The lightbox supports both 9:16 and landscape video without stretching.
- Intro delivery remains owned by Stage 1 and is not changed by Stage 2.

## AI staging rule

The current source set contains one AI-staging video, but does not provide a verified same-scene Before/After pair. Stage 2 therefore presents an actual AI-staging media preview and clear disclosure, not a misleading slider:

> AI-generated spatial visualization. 本區影像為 AI 示意，不等同真實裝潢、現況或任何完工承諾。

A draggable comparison belongs in a later stage only after a verified paired source is supplied.

## Inquiry architecture

The inquiry module is intentionally client-only. It collects a temporary on-page request summary and explicitly states that no information is submitted, stored, or sent. There is no fabricated API response, database, mail delivery, reservation flow, calendar flow, or external write.

## Mobile and accessibility rules

- Filters are horizontally scrollable buttons with `aria-pressed`.
- Work cards are native buttons and open with keyboard activation.
- The lightbox supports close button, Escape, backdrop close, focus restoration, and body-scroll locking.
- Portrait media remains portrait in the lightbox; mobile uses a near-fullscreen viewer.
- Reduced motion simplifies visual transitions without disabling filtering, lightbox, comparison disclosure, or navigation.

## Remaining production gaps

- Confirm a genuine paired AI staging source before adding Before/After controls.
- Confirm the official contact destination before enabling an actual inquiry submission. Reservation, appointment and calendar integration are outside this stage.
- Perform human visual and real-media playback review before optimizing or replacing any original video delivery files.
