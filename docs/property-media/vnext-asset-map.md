# E.X Property Media vNext — Asset Map

## Verification

The following paths were checked against the working tree on 2026-09-10. Binary source files were not modified.

| Path | Type | Size | Local metadata | Status / intended use |
| --- | --- | ---: | --- | --- |
| `public/images/property-media/hero/property-media-hero-bright-wide.png` | PNG | 2,338,575 bytes | 1672×941 | Prepared Phase 2 Hero candidate; not active |
| `public/images/property-media/backgrounds/property-media-obsidian-gold.png` | PNG | 2,024,507 bytes | 941×1672 | Prepared floor/background candidate; not active |
| `public/media/property-media/intro/property-media-intro-v2.mp4` | MP4 | 16,917,350 bytes | Duration/resolution unavailable: no local `ffprobe`, `ffmpeg`, or `magick` | Registered for Phase 2; not active |
| `docs/design/property-media/vnext/property-media-vnext-reference-01.png` | PNG | 2,390,105 bytes | 941×1672 | Design reference only; never a runtime dependency |
| `docs/design/property-media/vnext/property-media-vnext-reference-02.png` | PNG | 2,465,081 bytes | 941×1672 | Design reference only; never a runtime dependency |
| `docs/design/property-media/vnext/property-media-vnext-fullpage-reference.png` | PNG | 2,548,327 bytes | 941×1672 | Design reference only; never a runtime dependency |

The existing Stage 1 intro remains `/media/property-media/intro/property-media-intro.mp4`. Prepared v2 media is not selected by `PropertyMediaExperience` in Phase 1.

## Media and Git safety

The repository keeps the existing LFS rule `public/media/property-media/**/*.mp4 filter=lfs diff=lfs merge=lfs -text`. Source videos and reference files remain in place; no rename, recompression, overwrite, deletion, or runtime import from `docs/design/property-media/vnext/` is allowed.

## Future composition notes

The vNext first view uses the bright Hero image as the room environment, with `讓空間・被看見` toward the upper-left and the three orbit cards integrated over the sofa/coffee-table area. The physical floor should flow naturally into the obsidian-gold material before a conventional Selected Works grid. The obsidian layer may later receive one broad, very low-opacity glass/light event every 10–14 seconds and must stop under reduced motion.
