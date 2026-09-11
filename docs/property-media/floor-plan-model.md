# Floor Plan Model — visual 3D reconstruction

## SOURCE
`public/images/floor-plan-showcase.png`

Verified PNG: 1448 × 1086, 2,149,534 bytes, RGBA (PNG colour type 6). Actual alpha range: 0–255; transparent pixels present. Source preserved without modification.

## OUTPUT
`public/models/property-media/floor-plan/floor-plan-showcase.glb`

Created with Blender 5.2.1 LTS at `C:\Program Files\Blender Foundation\Blender 5.2\blender.exe`, using `scripts/property-media/create-floor-plan-model.py`.

GLB binary: 1,078,440 bytes. 221 mesh nodes, 14,327 triangles, 13 materials. No image textures, cameras, lights or external buffer dependencies. Coincident plaster/upholstery/worktop solids were boolean-unioned to avoid overlapping-surface render artifacts. Script refuses an existing GLB unless the explicit `--replace-generated` flag is passed for an intentional regeneration.

## MODEL TYPE
Visual architectural reconstruction with real meshes. Solid floor slab, segmented exterior walls and windows, interior partitions and door gaps, open door leaves, beds, wardrobes, sofas, tables, chairs, kitchen and simplified bathroom/laundry fixtures. Open ceiling / cutaway presentation. No PNG billboard or fake backside.

## ACCURACY
Approximate visual reconstruction, not engineering/CAD/BIM accuracy. No measured dimensions are supplied.

## SOURCE READABILITY
The image visibly depicts three bedrooms, two bathrooms, a kitchen, living/dining space, a balcony and a laundry recess. Exterior footprint, main partitions, visible openings and large furniture volumes can guide a simplified reconstruction. Exact dimensions, wall heights, hidden wall construction, unseen exterior details and under-floor structure cannot be verified.

## KNOWN ASSUMPTIONS
- Image-relative plan positions mapped to 0.01 model units per source pixel. This is a normalized scale, not a measured building size; the oblique source image has not been survey-rectified.
- Floor slab thickness: 0.20 units. Cutaway walls: 1.35 units above slab. Most wall thicknesses approximate 0.18–0.23 units. These values serve presentation readability, not construction accuracy.
- Furniture sizes/heights and door swings are simplified from visible positions. No room sizes, clearances or accessibility compliance are certified.
- Window sill heights, frames, unseen exterior wall faces and backs of furniture are neutral inferred geometry. No new hidden rooms, roof, structure or unseen exterior decoration added.
- Fine decor, plants, marble texture, fabric folds and plumbing detail omitted. Materials approximate the source palette with plain lightweight PBR surfaces.
- Room names are descriptive object labels; no verified room-camera target metadata is supplied.

## MODEL BOUNDS / AXES
glTF Y-up bounds: approximately **X 13.50 × Y 1.55 × Z 9.35** normalized units. Horizontal center approximately `(0, 0.025)` in X/Z; floor bottom Y=0. Blender Z-up is converted by the GLB exporter. No distant origin or negative-height floor geometry.

## WEB INTENT
Interactive 360° real-estate floor-plan viewer. Website integration remains unchanged. The existing PNG remains the approved 2.5D presentation and future loading/error fallback.

## VALIDATION
Valid GLB v2 header and declared length checked. Export re-imported into a factory-empty Blender scene; finite vertices, mesh/material existence, triangle count and bounds verified. Embedded images: zero. Source SHA-256 unchanged: `bf7e63f0d10da807c8a7484d2b86b4dfcf871ff7d600531664fbab325a9c2204`.

QA renders use the re-imported GLB with independent neutral lighting and a QA-only ground. Front/rear three-quarter, side and elevated top renders, `.blend` and `validation.json` are stored outside public assets at:
`C:\Users\Administrator\AppData\Local\Temp\ex-property-floor-plan-qa-jn5j4076`

Ready for the next web integration stage, subject to user layout/style approval and eventual mobile render-performance QA. No website code/dependencies were changed. No claim of engineering, CAD, BIM or as-built accuracy.
