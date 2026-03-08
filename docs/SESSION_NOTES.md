# Session Notes

Compact context summary for session continuity. Rewrite at session end.

---

## Worked on
Export quality selector — user-selectable resolution multiplier for all export types.

## Accomplished

1. **Added export quality selector** — Three-level quality toggle (Standard 1x / High 2x / Maximum 3x) in ExportButtons, matching the existing format selector pattern.
2. **Wired into all export paths** — Single image, all-pages ZIP, PDF, and multi-platform ZIP all use the selected quality's pixelRatio.
3. **PDF minimum quality floor** — PDF export uses `Math.max(pixelRatio, 2)` so overlays never look blurry, even at Standard quality.
4. **State management** — New `exportQuality` field in useAdState (shared across pages, defaults to 'standard'), with `setExportQuality` setter.
5. **Documentation updated** — USER_GUIDE.md, CLAUDE.md project status and key state structure.

## Current state

- **Working** — Build passes, all features functional
- New `exportQuality` state field (shared across pages, defaults to 'standard')
- Quality selector appears between File Format and Download Current button in export area

## Key context

- `captureAsBlob` and `captureAsDataUrl` both accept pixelRatio as parameter now (were hardcoded to 1 and 2 respectively)
- PDF always uses minimum pixelRatio 2 regardless of quality setting (prevents blurry overlay resampling)
- Quality is a shared field (not per-page), stored alongside exportFormat
