# TODO

Future enhancements and ideas for the Social Ad Creator.

---

## Cleanup (Post-Refactor)

### Legacy Component Removal

After verifying the new workflow-based UI works correctly in browser testing:

- [ ] Delete `ImageUploader.jsx` (replaced by `MediaTab.jsx`)
- [ ] Delete `TextEditor.jsx` (replaced by `ContentTab.jsx`)
- [ ] Delete `LayoutSelector.jsx` (replaced by `LayoutTab.jsx`)
- [ ] Delete `ThemePicker.jsx` (replaced by `StyleTab.jsx`)
- [ ] Delete `FontSelector.jsx` (replaced by `StyleTab.jsx`)
- [ ] Delete `StylePresetSelector.jsx` (replaced by `TemplatesTab.jsx`)
- [ ] Delete or archive `docs/REFACTOR_PLAN.md` (implementation complete)

**Why keep them for now:** Reference for edge cases, fallback if issues found during testing, and to preserve git history of the old implementation. Delete once new UI is verified stable.

---

## Potential Improvements

### Content & Presets

- [ ] Save/load designs to localStorage
- [ ] Template gallery with complete designs

### Visual Effects

- [ ] More overlay types (diagonal gradient, radial from corner)
- [ ] Animation preview for story formats

### Usability

- [ ] Aspect ratio lock for custom sizes
- [ ] Image cropping/repositioning within frame

### Technical

- [ ] TypeScript migration
- [ ] Unit tests for config utilities
- [ ] PWA support for offline use
