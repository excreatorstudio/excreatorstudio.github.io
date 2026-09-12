# R0 — Universe baseline contract repair

Approved source: e4613d745c546c361e29caf315e0701efd4d4d66.
Original baseline: full suite 189 pass / 1 skip / 0 fail; Universe 26 pass / 2 fail; build not run. This is NOT an all-pass baseline.

## Contract mapping
- Global package-string ban → TypeScript AST runtime dependency walk from root, preview, shared layout, every Universe component and navigation. Follows local aliases, relative imports, barrels, literal import()/require(); ignores type-only edges. Forbidden: three subpaths, @react-three/*, react-three-fiber, gsap subpaths. Unresolved local edges fail with a chain diagnostic. Links are not imports. Property Media may use Three without joining this graph.
- Reference-only runtime ban remains in focused tests.
- Missing local candidate audit dependency → always-on approved production asset manifest plus separate real candidate gate.
- Manifest hashes are from checked-out bytes compared byte-for-byte to git show at the approved SHA, NOT calculated expectations during each test. Covers all six production PNGs and both Intro MP4s.
- Runtime candidate paths / unapproved -web.mp4 remain forbidden; exact filename case, nonempty bytes and restored LFS status checked.

## Reproducible tests
node --test tests/universe-contracts.test.mjs

Positive: package three with disconnected Property viewer; type-only edges; complete synthetic candidate set.
Negative: engine imports/subpaths, barrel/alias/require/dynamic imports; unresolved helper; missing audit/source/image/video candidate; invalid JSON/schema; hash mismatch; path case/LFS pointer; runtime candidate activation.
Fixtures live only in unique OS temporary directories and clean up afterwards. Their text bytes are TEST DATA, never real media quality evidence.

## Explicit real candidate gate
node tests/universe-candidate-audit.mjs

Missing audit or required source/candidate → nonzero CANDIDATE_INPUTS_REQUIRED. Invalid schema also fails. No skip or optional-success path.
Real candidate audit: NOT RUN / INPUTS REQUIRED. No historical candidates copied/generated. Before any future media switch this gate AND human image/video quality review must pass.
This gate is separate from the baseline because candidates are not production inputs.

## Product integrity
R0 changes only tests/helpers, test manifest, standalone gate, and this document.
No package/lockfile, runtime source, original media, Property viewer or deployment changes.
R1 must not begin until all repaired-baseline gates pass.

## Repaired baseline verification (2026-09-12)
All commands exited 0: npm.cmd run typecheck; npm.cmd run lint; npm.cmd test (189 pass, 1 skip, 0 fail); node --test tests/creator-universe.test.mjs (28 pass); node --test tests/universe-contracts.test.mjs (24 pass); node --test tests/property-media.test.mjs (22 pass); npm.cmd run build (41 static pages).
The existing skip is the optional real CBC workbook check at tests/market-radar-cbc.test.mjs:46: data/market-radar/raw/cbc/cbc-115-07.xlsx is not supplied. No skip added. Root, universe-preview, ex-ai and property-media static outputs exist.
This is a PASS AFTER TEST CONTRACT REPAIR, not an all-pass original e4613d7 baseline. R1 started only after these gates.
