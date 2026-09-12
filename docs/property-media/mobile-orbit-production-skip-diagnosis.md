# Mobile Orbit — Production Skip Gate Diagnosis

Date: 2026-09-12. Worktree: `_pm_vnext_merge`; branch: `integration/property-media-vnext`; HEAD: `e4613d745c546c361e29caf315e0701efd4d4d66`.
The existing uncommitted touch hotfix is preserved. This diagnosis changes only local QA tooling and this document, not production components, CSS, assets or dependencies.

## Root cause and classification

`PRODUCTION_HANDOFF_REGRESSION` describes the observed **local production-preview failure**, not an Intro state-machine code defect or a verified deployed-site regression.
Specific cause: the original Python static preview intermittently reset resource connections (`net::ERR_CONNECTION_RESET`). One reproduction lost `/_next/static/chunks/4bd1b696-f785427dddbba9fb.js` (React runtime); others lost CSS/images. The document remained unhydrated: phase `ready`, overlay present, main content inert; clicking the server-rendered Skip button did not run its React handler.

`TEST_ORACLE_STALE` is ruled out. `data-phase="complete"` still exists persistently after a real successful handoff. It was not added or altered for the test.

The exact lower-level cause of the Python connection resets is not established. A quiet Python server also reproduced resets, so logging alone is not a proven explanation. Serving the identical `out` through the local Node HTTP/1.1 helper restored reliable resource delivery and handoff without application changes or longer timeouts. The helper binds only to loopback, serves only `out`, and supports media byte ranges. It is not a production server or deployment change.

## Actual Intro contract

`ready` → optional `playing` → `handoff` → `background` → `orbit` → persistent `complete`.

- Skip works from ready or playing. It pauses the video, clears watchdog/audio ramp and starts deterministic timers.
- Normal offsets after Skip: background 300ms; orbit 870ms; complete 1500ms.
- Reduced motion uses a 220ms total handoff (44ms/127.6ms/220ms offsets).
- Completion removes the Intro overlay, removes main-content inert, restores body overflow and focuses the Hero heading.
- No transitionend/animationend dependency. Unmount clears timers. No changes were required.
- Playback starts only after explicit Sound On interaction. Rejected play promises call finishIntro; there is no audible autoplay requirement in this product.

## Evidence

Fresh independent Chrome contexts, 390×844, same action. Native samples include actual elapsed time; Playwright action overhead affected dev timing, so nominal labels are not claimed as exact millisecond measurements.

| Checkpoint | Dev observed elapsed / phase | Reliable static preview elapsed / phase |
|---|---|---|
| Immediately after click returns | 221ms / handoff | 13ms / handoff |
| Nominal +100ms | 344ms / background | 112ms / handoff |
| Nominal +300ms | 523ms / background | 316ms / background |
| Nominal +1s | 1215ms / orbit | 1010ms / orbit |
| Nominal +2s | 2212ms / complete | 2023ms / complete |

At final state, both remove the overlay/inert and unlock scrolling. No unhandled promise rejection or JS runtime exception was observed. The existing `/favicon.ico` 404 was recorded separately in both environments; no favicon or unrelated source was changed.

### Storage / failure cases

- Fresh session: Intro appears, Skip completes.
- Same-session reload: **Intro appears again**. Property Media has no sessionStorage seen marker/bypass. Empty storage remains empty. No unrelated storage was cleared.
- Playback rejection: injected rejection after explicit entry successfully completes handoff; this is fault injection, not browser-wide autoplay certification.
- Reduced motion: final usable state reached in both environments; production sampled completion at ~280ms including automation overhead. Dev early-click sampling can precede passive effect initialization and used the normal-duration fallback; functionality remained intact.
- `?intro=1`: has no special semantics in current Property Media. Fresh load shows Intro as usual, Skip completes. No force-replay feature was introduced.

## Browser and engineering gates

- Chrome 153.0.8010.37 on Windows, headless, CDP touch input on actual card posters.
- Mobile 430/390/375/320: Skip, usable content, held fractional movement, reverse, release, all nine cases, cancel/out-and-back click protection, next tap Lightbox, native vertical scroll, reduced-motion gestures and Space activation passed. No horizontal overflow.
- Desktop 768/1440: static composition does not drift; drag, arrows, hover feedback, ArrowLeft, Enter, direct click and Escape passed. Static card-position logic was not modified in this diagnosis.
- CDP acknowledges before dispatching coalesced touchmove. The reversal test now samples after 32ms (two frames) instead of reading before React receives the event. Observed 390px position changed from 1.35826 to 1.17416; no Orbit code or 30-second timeout was changed.
- Focused: 25/25 PASS; Typecheck PASS; Lint PASS; full tests 189 PASS / 1 existing SKIP / 0 FAIL; static Build PASS (41 pages).
- Browser gates repeated against the freshly rebuilt `out` before recording.
- Actual iPhone Safari, acoustic quality and subjective feel remain human review.

## Reproduction commands

```powershell
node tests/property-media-preview.mjs
# Separate terminal:
$env:PM_PREVIEW_URL='http://127.0.0.1:4197/property-media/'
node tests/property-media-touch.browser.mjs
# Diagnosis also requires dev on port 4194:
node tests/property-media-skip-diagnosis.browser.mjs
# Only after browser gate passes, set an external QA artifact directory:
$env:PM_QA_DIR='<local QA directory>'
node tests/property-media-touch-record.browser.mjs
```

QA artifacts for this run: `C:\Users\Administrator\.codex\visualizations\2026\07\28\019fa810-9bda-7473-87bd-2838b876f41c\pm-skip-gate`; detailed dev/production evidence is under the adjacent `pm-skip-diagnosis` directory.
The recording uses actual Chrome screenshots encoded by MediaRecorder, not generated imagery or a device recording.

No stage, commit, push or deploy performed.
