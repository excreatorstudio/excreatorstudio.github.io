# E.X Property Media vNext — Phase 1.5 Implementation Prep

## Scope boundary

Phase 1 inventories the prepared assets and establishes typed data contracts for a future Cinematic Orbit Gallery. Phase 1.5 turns those contracts into an unmounted, reusable React/Pointer Events foundation. The current `/property-media/` production experience is unchanged: the current intro remains active, the existing portfolio grid and Lightbox remain mounted, and no orbit animation or new visual transition is enabled.

## Foundation now

- `src/data/property-media-vnext.ts` provides a projection over existing portfolio IDs, not a second media library.
- The featured order is `immersive-01` (left), `presenter-01` (center/default active), and `ai-staging-01` (right).
- Orbit metadata includes category, title, optional English subtitle, poster, source media, order, placement, default-active state, and Lightbox target.
- The display contract is a `3:4` outer card with `object-fit: cover`; opened media keeps its `native` aspect ratio and uses `object-fit: contain` in the existing Lightbox.
- `propertyMediaIntroV2` registers `/media/property-media/intro/property-media-intro-v2.mp4` without changing the active Stage 1 intro.

## Phase 1 Foundation — complete

Verified assets, the three-item vNext projection, native-ratio playback rules, and the Phase 2 visual direction are documented in this plan and `vnext-asset-map.md`.

## Phase 1.5 — implementation prep complete

- `PropertyMediaOrbit` and `PropertyMediaOrbitCard` provide an unmounted, data-driven card selector with presenter as the default active item.
- The foundation supports previous/next controls, controlled or uncontrolled active index, stable IDs, card selection, an adapter to the existing portfolio/Lightbox item, ArrowLeft/ArrowRight, and an explicit pointer drag threshold.
- Pointer Events resolve horizontal mouse/touch swipes while `touch-action: pan-y` leaves normal vertical page scrolling available. The track exposes CSS center-snap hooks without a second gesture system.
- The card primitive exposes the future `3:4`/cover presentation hook and never mounts a video; media remains lazy through the existing Lightbox.
- `prefers-reduced-motion` is observed for immediate scroll selection and the foundation contains no continuous animation loop.

## Orbit component API contract (not mounted in Phase 1.5)

`PropertyMediaOrbit` accepts `items`, optional controlled `activeIndex`, optional `defaultActiveIndex`, `onActiveIndexChange`, `onSelect`, and `onOpenMedia` callbacks. Each `PropertyMediaOrbitCard` exposes a native selection button and an optional media-open button with accessible labels. No production page imports these components yet.

## Phase 2 — visual implementation pending

Phase 2 will implement the cinematic layer only after a separate visual pass: Intro v2 fog/softening handoff; bright Hero composition with `讓空間・被看見` at upper-left; an orbit over the sofa/coffee-table area; final desktop drag and mobile horizontal swipe/center snap feel; a short natural bright-floor-to-obsidian transition; restrained 10–14 second obsidian glass-light movement; and the visual conversion of Selected Works to uniform 3:4 cards. No final 3D transforms, physics, parallax, orbit lighting, glass sweep, or Hero placement is part of Phase 1.5.

## Responsive and accessibility intent

Desktop is planned as a cinematic orbital/arc selector. Mobile is planned as a horizontal swipe with one centered 3:4 card and partial neighboring cards, without page-level horizontal overflow. Existing keyboard, focus, reduced-motion, and native-ratio Lightbox behavior remains the baseline.
