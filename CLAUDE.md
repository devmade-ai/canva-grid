# My Preferences

## Process

1. **Read these preferences first**
2. **Gather context from documentation** (CLAUDE.md, relevant docs/)
3. **Then proceed with the task**

## Principles

1. **User-first design** - Align with how real people will use the tool (top priority)
2. **Simplicity** - Simple flow, clear guidance, non-overwhelming visuals, accurate interpretation
3. **Document WHY** - Explain decisions and how they align with tool goals
4. **Keep docs updated** - HISTORY.md, CALCULATIONS.md, BUSINESS_GUIDE.md, CLAUDE.md as relevant
5. **Testability** - Ensure correctness and alignment with usage goals can be verified
6. **Know the purpose** - Always be aware of what the tool is for
7. **Logical checkpoints** - Stop at sensible points, document progress in docs/SESSION_NOTES.md
8. **Follow conventions** - Best practices and consistent patterns
9. **Capture ideas** - Add lower priority items and improvements I notice to docs/TODO.md so they persist between sessions (AI-managed, user can review)
10. **Repeatable process** - Follow consistent steps to ensure all the above
11. **Document user actions** - When manual user action is required (external dashboards, credentials, etc.), add detailed instructions to docs/USER_ACTIONS.md

## AI Notes

<!-- Reminders and learnings for AI assistants - add to this as needed -->

- Always read a file before attempting to edit it
- Check for existing patterns in the codebase before creating new ones
- Commit and push changes before ending a session
- Keep SESSION_NOTES.md lean - remove previous session notes once no longer relevant
- Clean up completed or obsolete docs/files and remove references to them

---

## Project Info

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Social Ad Creator - A browser-based tool for creating social media advertisements. Users can upload images, add text overlays, choose layouts, and export ads for multiple platforms.

## Project Status

Core features working:

- Image upload with drag-drop, object fit (cover/contain), position, grayscale, overlay controls
- Flexible layout system:
  - Split type (none/columns/rows) with 2-3 sections
  - Image can span any combination of cells (imageCells array)
  - Per-cell horizontal and vertical alignment
- Text groups with cell assignment:
  - Title + Tagline (paired)
  - Body Heading + Body Text (paired)
  - CTA (independent)
  - Footnote (independent)
- Logo upload with position (corners, center) and size options
- Theme system with 4 presets and custom colors
- Overlay system (solid, gradient up/down, vignette) - integrated in Image tab
- 15 Google Fonts (sans-serif, serif, display categories)
- Export to 6 platforms (LinkedIn, Facebook, Instagram, Twitter/X, TikTok)
- Single download and ZIP batch download

## Tech Stack

- Vite + React 18
- Tailwind CSS
- html-to-image for rendering
- JSZip + file-saver for batch export
- GitHub Pages deployment

## Common Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run deploy   # Deploy to GitHub Pages
```

## Architecture

```
src/
├── components/     # React components
│   ├── AdCanvas.jsx       # Core rendering (cell-based layout)
│   ├── ImageUploader.jsx  # Image upload + overlay controls
│   ├── LogoUploader.jsx   # Logo upload and positioning
│   ├── TextEditor.jsx     # Text layer editing
│   ├── LayoutSelector.jsx # Layout, cell alignment, text placement
│   ├── ThemePicker.jsx
│   ├── FontSelector.jsx
│   ├── PlatformPreview.jsx
│   └── ExportButtons.jsx
├── config/         # Configuration
│   ├── layouts.js     # Overlay types and helpers
│   ├── platforms.js   # 6 platform sizes
│   ├── themes.js      # 4 preset themes
│   └── fonts.js       # 15 Google Fonts
├── hooks/
│   └── useAdState.js  # Central state (includes textGroups, layout.imageCells)
├── utils/
│   └── export.js      # Export utilities
├── App.jsx
└── main.jsx
```

## Key State Structure

```js
layout: {
  splitType: 'none' | 'vertical' | 'horizontal',
  sections: 2 | 3,
  imageCells: [0],  // Array of cell indices where image appears
  textAlign, textVerticalAlign,  // Global defaults
  cellAlignments: [{textAlign, textVerticalAlign}, ...]  // Per-cell overrides
}

textGroups: {
  titleGroup: { cell: null },   // null = auto, number = specific cell
  bodyGroup: { cell: null },
  cta: { cell: null },
  footnote: { cell: null }
}
```
