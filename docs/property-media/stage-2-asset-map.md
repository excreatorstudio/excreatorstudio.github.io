# E.X Property Media — Stage 2 Asset Map

## Source media policy

All source video files remain in `public/media/property-media/` without renaming, moving, recompression, conversion, or overwrite. Their role is production media source. Stage 2 adds small JPEG poster derivatives under `public/images/property-media/posters/`; these are only gallery previews and are reproducible via `scripts/property-media/generate-posters.ps1`.

## Verified source inventory

| Group | Source pattern | Count | Orientation | Intended Stage 2 usage |
| --- | --- | ---: | --- | --- |
| Intro | `intro/property-media-intro.mp4` | 1 | 2560×1440 | Stage 1 fullscreen introduction |
| Immersive | `immersive/immersive-01..07.mp4` | 7 | 1080×1920 | Property Tour portfolio |
| Presenter | `presenter/presenter-01..08.mp4` | 8 | 1080×1920, with `presenter-02` 720×1280 | Presenter-led portfolio |
| AI staging | `ai-staging/ai-staging-01.mp4` | 1 | 1612×1080 | AI Space Transformation source and gallery item |
| Land AI | `land-ai/land-ai-01.mp4` | 1 | 1080×1920 | Land Visual gallery item |
| Other AI | `other-ai/other-ai-01..02.mp4` | 2 | 1080×1920 | Other AI Works gallery items |

## Poster inventory

| Poster group | Count | Format | Intended usage |
| --- | ---: | --- | --- |
| `posters/immersive` | 7 | JPEG, derived | Property Tour cards |
| `posters/presenter` | 8 | JPEG, derived | Presenter cards |
| `posters/ai-staging` | 1 | JPEG, derived | AI staging section and card |
| `posters/land-ai` | 1 | JPEG, derived | Land Visual card |
| `posters/other-ai` | 2 | JPEG, derived | Other AI cards |

Total poster count: 19. The posters are intentionally loaded as images; source videos are lazy-mounted in the lightbox only.

## Quality and production notes

- Source files include large delivery masters. Stage 2 does not alter them.
- No candidate video is switched automatically: visual review must cover black gradients, glow, macroblocking and banding before a delivery replacement is approved.
- The AI staging clip is a single source, not an established Before/After set. Do not treat its poster as proof of a real-world change.
- The UI reference image remains design reference only and is not a runtime page background.
