# AI Mistakes & Learnings

Record of significant AI mistakes to prevent repetition across sessions.

---

## 2025-01 | Layout Presets Used Wrong Data Format

**What went wrong:** Layout presets were using the old `textGroups` format (`titleGroup: { cell: 1 }`) but the app state had been refactored to use `textCells` format (`title: 1, tagline: 1`). Presets appeared to work (icons showed correct layout) but text ended up in wrong cells.

**Why it happened:** During a refactor, the state structure changed but the preset configurations weren't updated to match. No validation caught the mismatch.

**How to prevent:**

- When refactoring state structures, search for ALL usages of the old format
- Preset configs must match the current state shape exactly
- Test presets after any state structure changes

---

## 2025-01 | Removed Features Without Tracking

**What went wrong:** Multiple sessions removed features (Presets tab, per-cell alignment, text visibility controls) without documenting why or that they were removed. Later sessions had to restore them.

**Why it happened:** Features were removed during "cleanup" or "simplification" without understanding they were intentional. No record of what features should exist.

**How to prevent:**

- CLAUDE.md Project Status must list ALL working features
- Before removing any feature, check if it's documented as intentional
- If removing something, document WHY in SESSION_NOTES

---

*Add new entries above this line*
