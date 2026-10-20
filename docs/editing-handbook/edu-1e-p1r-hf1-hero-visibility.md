# EDU-1E-P1R-HF1 — Hero book visibility

Date: 2026-10-19. Scope: local isolated P1R implementation. Fix/viewport QA: complete. Human visual acceptance: PENDING. Commit, push, deployment: NOT PERFORMED.

Preview: http://127.0.0.1:4327/ex-ai/

## 1. Confirmed diagnosis

The inspected surface is the existing `.npm-cache/edu-1e-p1` implementation, not the public deployment or the unrelated parent development checkout. The initial public website is not changed by this local correction.

The complete absence reported by the owner was NOT reproduced in this isolated build: the book component was rendered, its local asset loaded, opacity was 1, visibility was visible, and its center was reachable. No display-none condition, ancestor clipping, missing image or covering stacking layer was found at the inspected desktop positions. The confirmed discoverability/placement defect was:

- At 1920 / 1440 / 1280, the old link was a 116px card with only a 100px image. It was absolutely positioned outside the entire two-line h1 (`left: calc(100% + .8rem); top: 50%`), not attached to the Creator Academy title row.
- Below 1280, it became a separate horizontal card below the title, with a 78px book. The 390px before screenshot confirms the placement mismatch against the owner's reference.
- Presence-only assertions from the previous stage did not establish adequate visual prominence. This stage therefore saves and visually inspects the rendered full Hero, in addition to checking DOM geometry and hit targets.

Before evidence: `.npm-cache/edu-1e-p1r-hf1-evidence/before-hero-1440.jpg`, `before-hero-390.jpg`, and `before-widths.json`.

## 2. Minimal presentation correction

The existing book entry now shares a wrapping, normal-flow row with `× 創作者學院`. Its heading keeps the original accessible name. No viewport-fixed coordinates or desktop off-heading absolute position are used.

Desktop link width scales from 120–160px; the actual image width is slightly smaller because of the border. Mobile uses a 72–90px entry, a locally balanced secondary title size, and wrapping when space is insufficient. Supporting copy and search follow the complete row rather than appearing underneath the book. The eight tested widths fit the book beside the Academy text without wrapping or clipping.

The 768px visual audit also caught title/eyebrow collision with the unchanged upper Hero control area during layout refinement. Only the Hero copy container receives scoped tablet padding at 640–899px. AI Video Studio, Personal Brand and platform-navigation components, their links, global CSS, and the header are unchanged. Final geometry additionally checks copy/control collisions, not merely book collisions.

Hero uses the exact owner PNG, copied unchanged into the isolated public directory: 1254×1254, alpha, 1,528,318 bytes, SHA-256 `f60a41fd56189a58bce6793089dbc7ad09d5c6c48dff0860d9bae069112ee3fa`. The manifest records this Hero-only asset. Other Handbook entries retain their existing optimized WebP derivatives and fallback. The original parent asset is untouched. This original PNG is larger than its derivatives; that is an explicit consequence of the requested exact PNG usage, not an additional generated image.

Hover is a small one-time transform/glow response, not the shared infinite floating animation. Focus outline, active feedback and reduced-motion overrides remain. The React checklist kept the default optimized asset path and existing shared player intact; no new state, event handler, player, route or dependency was added.

## 3. Existing interaction preserved

The anchor still has `/ex-ai/editing/handbook/` as its real href. Ordinary activation retains the approved P1R intro-first presentation; its working read action reaches the canonical Handbook. Modifier/no-JavaScript link behavior remains implemented by the unchanged intro-link component. HF1 does not remove the intro to change navigation semantics.

At each width, browser QA actually exercised pointer activation, ESC/focus return, keyboard-visible focus, Enter activation and the final read link. The existing search input remained editable, platform selection switched correctly, and AI Video Studio / Personal Brand hrefs remained intact. External destinations were not visited as a proxy for testing this local layout.

## 4. Fresh validation

| Check | Result |
| --- | --- |
| HF1 focused tests | 4 PASS |
| Handbook focused suite | 14 PASS |
| Academy + homepage entry | 14 PASS (10 + 4) |
| Canonical full suite | 189 PASS, one existing skip, zero fail |
| Additional Creator Universe suite | 27 PASS, one existing FAIL |
| Typecheck | PASS |
| Lint | PASS |
| Build / static export | PASS, 43/43 pages |
| Private output gate | PASS, 149 text assets / nine reserved blocks |
| `git diff --check` | PASS |

Do not sum overlapping suites. The additional Universe failure is its old `/Popular resources/` assertion against `src/app/ex-ai/page.tsx`; that file already composes Teaching Resources. The page source and the test match their pre-HF1 hashes, proving this failure is outside the Hero correction. The old test was not changed, and the Resources page was not reverted to make it pass. No all-tests-green claim is made. The existing Next.js nested-worktree/multiple-lockfile warning is also retained without unrelated configuration changes.

Browser final-build matrix: 1920 / 1440 / 1280 / 1024 / 768 / 430 / 390 / 320, each with visible loaded original PNG, five reachable link points, no book/text/control overlap, no ancestor clipping, no horizontal overflow and real Handbook navigation. Full Hero screenshots were individually inspected, including the extra 768px capture. The saved source reference and final 390px capture were inspected together: right-side Academy-title book placement, unchanged top control concept and clear supporting copy/search are preserved; this is responsive adaptation, not a pixel-for-pixel copy or reference-image background.

Resources, Academy and Handbook were also opened directly. Academy still has six courses and its PENDING lesson; Resources retains its heading and book link; Handbook retains six terms and its direct-refresh path. The mobile menu opens and retains all eight existing navigation items. Final inspected browser console reads returned no new application errors; the known EX Galaxy prefetch 404 remains historical baseline noise and its endpoint is not repaired here.

Physical touch/iPhone/Safari, screen-reader and full WCAG testing: NOT VERIFIED in HF1. Reduced motion is verified from the scoped CSS branch, not an OS-setting test. Pointer/viewport evidence is not physical-device acceptance. Human visual acceptance remains PENDING.

## 5. Preservation and exact HF1 delta

The before inventory hashes 482 existing readable paths. Exactly five of those change (the four presentation files and asset manifest below); 477 remain identical, with no missing path or unexpected changed file. Git's quoted Unicode PDF path was not included in that hash inventory; its unchanged tracked state is independently verified against HEAD. It is not a new HF1 file.

The original parent checkout's known dirty files, private specification, source book, layout reference and owner video remain unchanged. The private source remains ignored/untracked and absent from static output. Both checkouts have no staged files. The isolated HEAD remains `75dbca1b3aa0d857377bfe7646f516a1ccd18acc`.

Modified from P1R:

```text
src/components/CreatorStudioHero.tsx
src/components/editing-handbook/HandbookEntry.tsx
src/components/editing-handbook/HandbookBook.tsx
src/components/editing-handbook/editing-handbook.module.css
public/images/editing-handbook/asset-manifest.json
```

Created:

```text
public/images/editing-handbook/book-entry.png
tests/editing-handbook-hero-visibility.test.mjs
tests/editing-handbook-hero-visibility.browser.mjs
docs/editing-handbook/edu-1e-p1r-hf1-hero-visibility.md
```

The new PNG is a byte-identical copy, not a replacement or regenerated owner asset. Evidence and generated output remain ignored. Existing P1/P1R dirty changes are not attributed to HF1.

## 6. Human review and stop

Review index: `.npm-cache/edu-1e-p1r-hf1-evidence/README.md`. It links all eight full-Hero captures, before images and machine-readable final geometry/interaction results.

Local server command from this isolated checkout:

```powershell
$env:EDITING_STATIC_DIR = 'out'
$env:EDITING_PREVIEW_PORT = '4327'
node scripts/editing-academy-preview.mjs
```

No Academy/Handbook content, Resources page, other EX AI sections, hosting, DNS, Cloudflare, membership or payment changes. No Git staging/commit/push/deploy. STOP for owner visual review; EDU-1E-P2 deployment has not started.
