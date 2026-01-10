# Session Notes

## Current Session

Implemented major layout and positioning overhaul.

### Changes Made

1. **Moved Overlay to Image Tab** - Overlay controls now in ImageUploader, removed standalone Overlay tab

2. **Per-Cell Text Alignment** - Each cell in split layouts can have its own horizontal/vertical alignment
   - Added `cellAlignments` array to layout state
   - LayoutSelector shows alignment controls per cell

3. **Text Element Grouping** - Text elements organized into logical groups:
   - Title + Tagline (move together)
   - Body Heading + Body Text (move together)
   - CTA (independent)
   - Footnote (independent)

4. **Text Groups Assignable to Cells** - Each text group can be assigned to any cell via dropdown in Layout tab
   - Auto mode distributes based on image coverage
   - Manual assignment overrides auto behavior

5. **Image as Layer Over Cells** - Complete architecture change:
   - Replaced `imagePosition`/`imageProportion`/`textOnImage` with `imageCells` array
   - Image can now span any combination of cells
   - Cells are equal-sized; image renders as overlay on selected cells
   - Text renders on image cells (with shadow) or background cells (no shadow)

### Architecture Notes

- `layout.imageCells` - Array of cell indices where image appears (e.g., `[0]`, `[0,1]`, `[0,2]`)
- `state.textGroups` - Object mapping group IDs to cell assignments
- `renderCellContent()` - Unified cell renderer handling both image and text layers
