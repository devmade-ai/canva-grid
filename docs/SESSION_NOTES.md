# Session Notes

Compact context summary for session continuity. Rewrite at session end.

---

## Worked on
Fixed sample images path issue for GitHub Pages

## Accomplished

- **Fixed sample images not loading on GitHub Pages**: BASE_URL was being added twice
  - `sampleImages.js` was prepending BASE_URL to paths
  - `MediaTab.jsx` was adding BASE_URL again when using the paths
  - Result: `/social-ad-creator/social-ad-creator/samples/...` (404)
- **Fix**: Removed BASE_URL from `sampleImages.js`, paths are now relative (`samples/sample-01.jpg`)
- **Documented in AI_MISTAKES.md**: This issue was reported 7+ times by user

## Current state
- **Build**: Passing
- Sample images should now work on GitHub Pages deployment
- Sample images available via Media tab > Images > Sample Images section

## Key context

- Sample image paths in `sampleImages.js` are relative to public folder (no leading slash, no BASE_URL)
- `MediaTab.jsx` adds `import.meta.env.BASE_URL` when constructing full URLs
- This pattern ensures paths work both in dev (BASE_URL = `/`) and prod (BASE_URL = `/social-ad-creator/`)
