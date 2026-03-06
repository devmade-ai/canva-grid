# Session Notes

Compact context summary for session continuity. Rewrite at session end.

---

## Worked on
Platform specs system: nested data structure, two-level selector UI, export format selection.

## Accomplished

1. **Restructured platforms.js** — Flat array → nested `platformGroups` with parent platforms containing `formats[]`, `tips[]`, `recommendedFormat`, `maxFileSize`. Flat `platforms` export preserved for backward compatibility with all 10 consumers.
2. **Two-level platform selector** — `PlatformPreview.jsx` rewritten: Category → Platform → Format nesting. Single-format platforms select directly, multi-format platforms expand. Info bar shows selected format specs + collapsible tips per platform.
3. **Export format selection** — PNG/JPG/WebP toggle in ExportButtons. Uses `toJpeg` for JPG, `toCanvas` + `canvas.toBlob` for WebP, `toPng` for PNG. Format persists in state as `exportFormat`. PDF always uses PNG internally. "Use recommended" link shown when platform suggests a different format.
4. **Instagram formats expanded** — Was 2 formats (Square, Story). Now 4: Feed Portrait (1080×1350), Square (1080×1080), Feed Landscape (1080×566), Story/Reels (1080×1920).
5. **Facebook formats expanded** — Was 1 format (Post). Now 4: Feed Post, Square Post, Story, Cover Photo.
6. **Added `categoryLabels` and `categoryOrder` to platforms.js** — Centralized, removed duplicates from PlatformPreview and ExportButtons.

## Current state

- **Working** — Build passes, all features functional
- Platform count: 28 formats across 12 platform groups (was 22 flat entries)
- New `exportFormat` state field (shared across pages, defaults to 'png')
- Phase 4 (remaining platform data: Pinterest, Snapchat, YouTube, e-commerce) tracked in TODO.md

## Key context

- Old format IDs preserved for saved design compatibility (`instagram-square`, `facebook`, `twitter`, etc.)
- New format IDs added: `instagram-feed-portrait`, `instagram-feed-landscape`, `facebook-square`, `facebook-story`, `facebook-cover`
- `platformGroups` is the source of truth; `platforms` flat array is derived from it
- `findFormat(id)` and `findPlatformGroup(id)` helper exports added to platforms.js
- `ecommerce` category label defined but no platforms in it yet (Phase 4)
