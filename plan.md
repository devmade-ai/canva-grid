# Plan: Remove `imageCells` concept, keep only `cellImages`

## What this changes

Currently there are two overlapping concepts:
- `layout.imageCells` — hardcoded array in presets saying "these cells ARE image cells"
- `state.cellImages` — user's actual image assignments (`{ cellIndex: imageId }`)

AdCanvas already ignores `imageCells` entirely — it renders based on `cellImages`. So `imageCells` is a ghost concept that only creates bugs in text redistribution and forces assumptions about what the user wants.

After this change: a cell has an image if and only if the user assigned one via `cellImages`. Any cell can have both image and text. Layout presets define structure only (grid shape, sizes, alignments), not content placement.

## Files to change

### 1. `src/config/layoutPresets.js`
- Remove `imageCells` from every preset's `layout` object (all 35 presets)
- Update preset descriptions that reference "image" vs "text" cells (e.g., "Image top, text bottom" → "Top / Bottom")
- SVG icons: keep as-is (blue/gray visual distinction is just a visual hint, not functional)

### 2. `src/hooks/useAdState.js`

**`defaultState` and `defaultPageData` (lines 86-117, 119-208):**
- Remove `imageCells: [0]` from `layout` objects

**`migrateTextForStorage` (lines 24-60):**
- This handles legacy migration from old global text format
- Currently uses `imageCells` to decide where to place title vs body text
- Change: place all text on cell 0 (it's a one-time legacy migration, exact placement doesn't matter much — user can move it)

**`addImage` (lines 213-266):**
- Currently auto-assigns to first unoccupied `imageCells` entry
- Change: auto-assign to first cell (0, 1, 2...) that doesn't already have an image in `cellImages`

**`setLayout` / `_cellShift` handling (lines 368-496):**
- Remove the block that shifts `imageCells` array values (lines 410-419)
- Remove the block that remaps `imageCells` on swap (lines 457-461)
- Remove the fallback `const finalImageCells = shiftedImageCells.length > 0 ? shiftedImageCells : [0]`

**`applyLayoutPreset` (lines 610-673):**
- This is the core problem function
- Remove all `imageCells`/`nonImageCells` logic
- New behavior:
  1. Clean up orphaned cells beyond new cell count (cellImages, padding, frames, freeformText)
  2. Text: keep all text in place for cells that still exist in the new layout, drop text for cells beyond new count
  3. Apply the new layout structure
- No text redistribution needed — text stays where it is, user moves it if they want

### 3. `src/components/LayoutTab.jsx`
- Line 254: Remove `const imageCells = layout.imageCells || [0]`
- Lines 264-278: Remove `imageCells: [0]` from `handleTypeChange` calls to `onLayoutChange`
- Line 635: Stop passing `imageCells` to `CellGrid`
- `CellGrid` component (line 33): Remove `imageCells` prop default and usage
- Line 165: Remove `const isImage = imageCells.includes(currentCellIndex)` and any rendering that depends on it

### 4. `src/components/ContentTab.jsx`
- Line 514: Remove `const imageCells = layout.imageCells || [0]`
- Line 567: Stop passing `imageCells` to `MiniCellGrid`

### 5. `src/components/TemplatesTab.jsx`
- Lines 149-156: Remove `imageCells` comparison from `isLayoutPresetActive`
- Just compare `layout.type` and `layout.structure`

### 6. `src/components/MiniCellGrid.jsx`
- Line 15: Remove `imageCells` prop
- Clean up any remaining references (already mostly migrated to `cellImages`)

### 7. `CLAUDE.md`
- Update state structure documentation to remove `imageCells` references
- Update architecture notes

## What does NOT change
- `AdCanvas.jsx` — already doesn't use `imageCells`
- `cellImages` — stays exactly as-is
- SVG preset icons — keep the blue/gray visual, it's just a preview hint
- How images render — unchanged
- How text renders — unchanged
- User can still assign images to any cell via Media tab
- User can still type text in any cell via Content tab

## Effects on user experience
- Switching layout presets preserves text where it is (for cells that still exist)
- No more silent text merging/overwriting
- No more "image cell vs text cell" distinction — every cell can have both
- Image auto-assignment on upload: fills first empty cell instead of first "image cell"
