# AI Mistakes & Learnings

Record of significant AI mistakes to prevent repetition across sessions.

---

## 2025-01 | Presets Used Wrong Data Format (Happened Twice)

**What went wrong:** Both layout presets and style presets were using the old `textGroups` format (`titleGroup: { cell: 1 }`) but the app state had been refactored to use `textCells` format (`title: 1, tagline: 1`). Presets appeared to work (icons showed correct layout) but text cell assignments weren't applied.

**Why it happened:** During a refactor, the state structure changed but preset configurations weren't updated to match. Layout presets were fixed first, but style presets (`stylePresets.js`) were missed and had to be fixed in a later session.

**How to prevent:**

- When refactoring state structures, search for ALL usages of the old format across ALL config files
- Preset configs must match the current state shape exactly
- Test presets after any state structure changes
- Remember: there are TWO preset types (layout and style) that both need updating

---

## 2025-01 | Removed Features Without Tracking

**What went wrong:** Multiple sessions removed features (Presets tab, per-cell alignment, text visibility controls) without documenting why or that they were removed. Later sessions had to restore them.

**Why it happened:** Features were removed during "cleanup" or "simplification" without understanding they were intentional. No record of what features should exist.

**How to prevent:**

- CLAUDE.md Project Status must list ALL working features
- Before removing any feature, check if it's documented as intentional
- If removing something, document WHY in SESSION_NOTES

---

## 2025-01 | Over-Engineered Alignment (Per-Item Per-Cell Instead of Per-Cell)

**What went wrong:** User asked for per-cell text alignment (each cell can have different alignment). AI implemented per-item per-cell alignment (each text element in each cell can have different alignment). This over-engineering:

- Made the UI unnecessarily complex
- Broke existing functionality
- Required 11+ commits across multiple sessions to fix
- Cascading issues with cell grid rendering, fullbleed layouts, and more

**Timeline of damage:**

- `85e686c` Added per-group cell selectors and alignment (the mistake)
- `4264848` Revert per-group alignment to cell-level alignment
- `377775c`, `9876080`, `b54adc4` Multiple fixes for broken cell grid display
- `71117ad` Finally restore layout presets and placement tab features

**Why it happened:** AI interpreted "per-cell alignment" as a more complex feature than intended. Didn't clarify requirements before implementing. Over-engineering tendency.

**How to prevent:**

- CLARIFY before implementing: "Do you want alignment per cell, or per text element per cell?"
- Start with the simpler interpretation unless user specifies otherwise
- If a feature seems complex, ask if simpler version would suffice
- Don't add granularity the user didn't ask for

---

## 2026-01 | Double BASE_URL in Sample Images Path (User Reported 7+ Times)

**What went wrong:** Sample images weren't loading on GitHub Pages. The user reported this issue multiple times and even suggested it was a path issue related to Vite's base URL.

**Why it happened:** The `sampleImages.js` config was already prepending `import.meta.env.BASE_URL` to file paths:
```javascript
file: `${BASE_URL}samples/sample-01.jpg`  // Already /social-ad-creator/samples/...
```

Then `MediaTab.jsx` was adding BASE_URL again:
```javascript
src={import.meta.env.BASE_URL + sample.file.slice(1)}  // Doubled!
```

Result: `/social-ad-creator/social-ad-creator/samples/sample-01.jpg` (404)

**How to prevent:**

- When dealing with asset paths, trace the full path from config to usage
- Don't blindly add BASE_URL - check if the path already includes it
- Test GitHub Pages deployment specifically (paths work differently in dev vs prod)
- When users report the same issue multiple times and suggest a cause, investigate that cause immediately

---

## 2026-02 | Fixed Wrong Thing 3 Times Before Asking (Markdown Rendering)

**What went wrong:** User reported "markdown is still not rendering correctly on the display." Instead of asking what they were doing, AI made three wrong assumptions in sequence:
1. Assumed it was a CSS styling issue (fixed list-style-type, added pre/code styles)
2. Assumed user was in structured mode (added `marked.parseInline()` to structured text)
3. Finally learned user was in freeform mode typing `# Title` - the real issue was freeform mode required a hidden MD toggle that defaulted to off

Each wrong assumption led to a commit that didn't solve the actual problem. Three commits wasted before the real fix.

**Why it happened:** AI jumped to writing code instead of asking "which mode are you in?" and "what exactly did you type?" One clarifying question would have immediately revealed the issue.

**How to prevent:**
- When a user reports a bug, **ask what they're doing** before writing any code
- Don't assume which feature/mode/path the user is using
- A single clarifying question ("Are you in freeform mode with MD toggled on?") would have saved 3 wrong commits
- The cost of asking is low; the cost of fixing the wrong thing is high

---

*Add new entries above this line*
