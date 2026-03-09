# Session Notes

Compact context summary for session continuity. Rewrite at session end.

---

## Worked on
Fixed PDF mobile quality — all quality levels looked identical on mobile.

## Accomplished

1. **PDF mobile quality fix** — Page dimensions were scaling with pixelRatio (2x capture → 2x page size), so all quality levels had identical pixel density. Fixed to keep page at platform pixel dimensions while embedding higher-res image. Quality levels now produce genuinely different sharpness.

## Current state

- **Working** — PDF export produces visible quality differences between Low/Standard/High on mobile
- Page size: `platform.width × platform.height` points for digital, `width * 72/150` for print
- Image capture: `width * pixelRatio` pixels (1x/2x/3x per quality selection)

## Key context

- Clean integer pixel-per-point ratios (2:1, 3:1) don't cause gradient destruction — only non-integer ratios (2.667:1) did
- Print formats still always use pixelRatio:1 with 72/150 DPI conversion
- Non-PDF exports (PNG/JPG/WebP) still use pixelRatio:1
