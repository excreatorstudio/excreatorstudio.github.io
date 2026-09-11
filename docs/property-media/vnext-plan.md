# E.X Property Media vNext — Phase 2

## Phase 2.1 — true orbit ring and static-image spatial viewer

Phase 2 was manually approved before this pass. Intro/Hero/transition/Selected Works/Lightbox are unchanged in this pass.

- Ring extends the approved three-item projection with six verified IDs: immersive-02, presenter-02, immersive-03, presenter-03, immersive-04, presenter-04. Initial front order and presenter default are unchanged. Every selection recomputes all ring planes; no random ordering or JS animation loop.
- Desktop has progressively smaller/dimmer rear cases. Tablet reduces rear density; mobile hides rear cards while previous/next and swipe still cycle through every item. Posters only; media-open uses the original portfolio adapter and Lightbox.
- Real asset: /images/floor-plan-showcase.png, copied byte-for-byte from the user-supplied parent checkout file. SHA256 C39BB90011E76CD4FB88C47A12D2010D9CEEE5B6BA4BCEB542D73E67DD0D8B7A. Reference docs/references/floor-plan-showcase-ref.png is viewed only, never rendered.
- FloorPlanShowcase mode="image": native-ratio contain image; bounded yaw ±6°, pitch ±3°, zoom 0.92–1.08. Explicit left/center/right presets, zoom, enlarged native dialog, Escape/focus restoration. Mouse drag only; mobile page scroll takes precedence, using tap controls.
- Room controls mark a type only, with an explicit future-location disclosure; no invented hotspots or camera movement. The actual asset is one static image, NOT a GLB or true complete 360 model.
- One-time viewport entrance; subtle 13s ambient while visible, paused during drag/modal background. Reduced motion disables entrance/ambient/perspective and leaves static viewing, zoom and navigation.
- Phase 2.1 visual/device acceptance remains human review. No commit, push or deploy.

## Phase 2 — implemented, human visual review pending

This section supersedes the historical Phase 1/1.5 activation restrictions below.

- Intro v2 is active after a real Sound On click. The approved local input is 19,902,447 bytes, SHA256 99b103154290626748f2e61be05c9831eb41e421e40fc7b288fe93e6ce810f66. Its original path and Git LFS rule are unchanged; legacy intro retained.
- Playback rejection, error, Skip, Escape or 12-second playback stall starts the same safe handoff. No audible autoplay or fake gesture. A finite 900ms volume ramp requests 8–55% volume; iOS may retain hardware-controlled volume.
- Handoff is 1500ms: frozen video/haze → room at 300ms → orbit at 870ms → copy and interaction at 1500ms. Reduced motion uses 220ms without animated blur/zoom.
- The bright room and upper-left title are active. Existing three-item projection is mounted; presenter remains default center. No portfolio record duplication.
- One Pointer Events system commits horizontal gestures at 48px and center-snaps by transform. Vertical movement cancels candidate drag; side controls and local arrow keys remain available. No competing native scroll carousel.
- Orbit and Selected Works use 3:4 exterior frames. Posters only; existing Lightbox keeps native contain playback, body scroll lock, Escape and focus restoration.
- 360° section is ASSET PENDING: no verified floor-plan image or sequence was found under Property Media assets. Empty/static/sequence API exists; no fabricated layout or fake rotation.
- Compact floor section blends into the supplied obsidian material; one background-only 12.8-second sweep (13.5s mobile), disabled under reduced motion.
- No inquiry, scheduling, backend, dependency, homepage or other module changes.

Human acceptance remains required at 320 / 390 / 430 / 768 / 1024 / 1440: sound, haze continuity, room crop, orbit scale/position, swipe feel, native video controls, floor blend and background motion. No commit, push or deploy.

### Local preview checkpoint

Static export served at http://127.0.0.1:4175/property-media/ with the local Python HTTP server. This previews exported HTML/CSS/JS; it does not reproduce a production CDN's video Range/cache behavior.

Built-in browser observed Sound On → video → Hero, default presenter, next selection → AI staging, Lightbox open, contain playback, Escape and focus return. Horizontal document width equals client width at 320, 390, 430, 768, 1024, 1440. Real touch drag feel, iPhone sound/volume, reduced-motion device settings, frame-perfect handoff and material visual quality require human review. Browser checks are not visual approval.

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
