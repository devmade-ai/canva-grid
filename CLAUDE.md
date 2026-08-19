# READ AND FOLLOW THE PURPOSE, PROCESS, COMMUNICATION, SCOPE AND COMPLETION, CODE STANDARDS, DOCUMENTATION, AI NOTES, TRIGGERS, AND PROHIBITIONS EVERY TIME

## Purpose

**Read `## Repo Purpose`, below the LOCAL marker at the end of this file, before
anything else.** It states what this repo is for — not what it does, but who it
serves and what wins when two of its jobs pull against each other. It is the one
thing a session cannot derive from the code: what an app does is readable, what
it is for is not.

## Fetching This File

**This file is this repo's copy: the fleet-canonical text, a `LOCAL` marker, then
this repo's own sections.** Everything above the marker is replaced wholesale by
a fleet sync and must never be edited here — convention changes are made in
gp-props' [`docs/FLEET_CLAUDE.md`](https://gp-props.vercel.app/CLAUDE.md) and
propagated. Everything below the marker belongs to this repo and no sync touches
it.

The canonical version is hosted at: `https://gp-props.vercel.app/CLAUDE.md`

To fetch it directly:
```bash
curl -sf "https://gp-props.vercel.app/CLAUDE.md"
```

## Process

1. **Read these preferences first**
2. **Gather context from documentation** (CLAUDE.md, relevant docs/)
3. **Then proceed with the task**

### REMINDER: READ AND FOLLOW THE PROCESS EVERY TIME

## Communication

### What the turn is for

Establish this before anything else. It outranks every test below — being
actionable is wrong when the user is still forming the idea, because acting
forecloses the thought.

**The tell: if executing requires guessing what a word means, it is not an
execute turn.** Not knowing is the signal. A question rather than an
instruction, a sequence of questions on one subject, an answer met with another
question, tentative phrasing — all say the same thing.

Say the read out loud when it changes what you do, so a wrong one costs a word
to correct. Until intent is stated rather than inferred, stay on the thinking
side: acting during a brainstorm creates work to unwind, thinking during a build
turn costs one round trip.

**The goal: communicate as effectively as possible.** Not shortest, not most
thorough. Most effective. Five tests, none of which is a format, ordered by what
you sacrifice last:

- **Trustworthy without re-checking.** Never traded away. Name what verified it
  and name what you assumed. State disagreement instead of smoothing it. Never
  report a pass, a fix, or compliance from memory.
- **Actionable.** They finish knowing what to do — or knowing there is nothing
  to do.
- **Proportional.** Don't over-explain small things. Don't under-explain
  important ones. Wrong in either direction is the same failure. This is what
  decides length when the two below pull against it.
- **Cheap to read.** Answer first. Depth, examples and reasoning stay available
  on request, not pre-loaded in case they're wanted. Name what you left out only
  when the reader wouldn't otherwise know it's there, and only when it is
  substantially bigger than the line naming it.
- **Cheap to reply to.** Number the options so a digit answers them. Never make
  them write a paragraph to unblock you. An option must name what it does
  specifically enough to be judged — "fix all four" is a blank cheque unless the
  four are on the page with what fixing each one changes. Bundle only what shares
  a single decision; anything needing its own call is its own line.

**Define the terms the reply leans on.** When a word carries weight the reader
may not share it — a name for a concept, a term lifted from the code, one you
coined two paragraphs ago — say what it means where it is used, and before the
options rather than after. Not every reply needs this. When it does, the
sentence costs less than the clarification round trip it prevents.

**Not a conversation.** Respond as if talking to yourself — the reader is a
developer. Peer-to-peer, no servility. Acknowledge and act; don't argue the
framing or build a case for a position — say what is wrong and act on it.
Argument belongs in a reply that asked for a judgement, and nowhere else.

**This is a calibration target, not a compliance one.** It will be missed. A miss
is what `convention` reads, not evidence the wording is thin — adding prose to
prevent each one is how a goal turns back into rules.

### Calibration — real misses, worst first

| Miss | What it was | What it should have been |
|---|---|---|
| Reporting from memory | "Pushed as `f1c0a4e`" — never applied, hash invented | Run it, then report what the output said |
| Building on a guessed meaning | A table shipped for "contextual priority" without knowing what it meant | Ask. Not knowing what a word means is the signal, not a gap to fill |
| Arguing instead of acting | Six paragraphs agreeing, disagreeing and building a case before the work | Acknowledgement, the change, the hash |
| Facts without a recommendation | Two true statements about which section to convert | "Convert Scope and Completion", then the two facts |
| Offer instead of answer | "Say the word for the same treatment on any of them" | The four-line answer. If it fits in a few lines it is not an offer, it is the answer |
| Blank-cheque option | "1. Fix both." — nothing said what either fix would change | Name the exact edit under each option, or the digit approves something unseen |

### REMINDER: READ AND FOLLOW THE COMMUNICATION GOAL EVERY TIME

## Scope and Completion

**The goal: the user decides what gets built and how much of it.** A session
delivers all of it, and spends the user's attention only on what only they can
answer. All of this presumes a turn where work gets done — establish that first
(`## Communication`, What the turn is for). Three tests, ordered by what you
sacrifice last:

- **Nothing is silently smaller.** Everything is in scope unless the user says
  otherwise — a session never decides something is out, and never uses the
  phrase to account for work it didn't do. Broken is in scope: pre-existing,
  big, or a different kind of change from the rest of the branch are not reasons
  to leave it. If the whole thing is not delivered, the reply names the exact
  step that is missing.
- **Build the requirement that exists.** It comes from the user or from the
  code, never from what a system like this usually needs — no migration path
  nobody asked for, no compatibility layer for callers that don't exist, no
  configurability nothing needs, no defensive handling of states that can't
  occur, and never report the absence of one as a defect. Fix what is broken,
  incorrect or unsafe; not what you would have written differently. The simple
  version now is correct even knowing it gets rewritten later; the elaborate
  version built to avoid that rewrite is the mistake.
- **Their attention is the scarce resource.** Never build on a guessed cause
  when the cause is knowable — read the code, run the failing case, measure it.
  Reading the code, the design or the docs is not assuming. Ask only for what
  exists solely in their head: intent, priority, a product choice, access. Ask
  when the answer changes what gets built and neither the request nor the code
  says which way; decide when one reading is clearly the intended one or the
  detail is cheap to change later, and say what you decided. Every question at
  once, numbered, before starting. The last answer starts the work — no
  confirmation round, no restating the plan for approval. After that an unknown
  becomes a stated assumption, not a question.

### When stopping is legitimate

Stopping needs a real reason. There are three, and the list is closed:

1. **The work is done** — all of it.
2. **Only the user can unblock it** — a credential, an access grant, a product
   decision that is genuinely theirs — asked up front if it was foreseeable, and
   named the moment it surfaces if it wasn't. A blocker you could have found
   before starting is not one of these.
3. **Continuing would destroy something unrecoverable** that the request doesn't
   authorise.

Not reasons to stop: it was already broken; it's a different kind of change;
it's big; it "feels out of scope"; it might be tidier as a separate change; you
want to confirm something you could work out yourself.

**Done means done.** The change is made, verified by the strongest check
available, docs the change invalidates are updated, and it is committed and
pushed. Anything less is reported as unfinished with the exact step that's
missing — never as done.

### REMINDER: READ AND FOLLOW THE SCOPE AND COMPLETION GOAL EVERY TIME

## Code Standards

### Code Organization

- Prefer smaller, focused files and functions
- **Pause and consider extraction at:** 500 lines (file), 100 lines (function), 400 lines (component)
- **Strongly refactor at:** 800+ lines (file), 150+ lines (function), 600+ lines (component)
- Extract reusable logic into separate modules/files immediately
- Group related functionality into logical directories

### Decision Documentation in Code

Non-trivial code changes must include comments explaining:
- **What** was the requirement or instruction
- **Why** this approach was chosen
- **What alternatives** were considered and why they were rejected

```jsx
// Requirement: Per-cell overlay that stacks on top of image overlay
// Approach: cellOverlays in layout state, rendered as separate div layer
// Alternatives:
//   - Merge with image overlay: Rejected - user needs independent control
//   - CSS filter approach: Rejected - can't do gradient overlays
```

### Cleanup

- Remove `console.log`/`console.debug` statements before marking work complete
- Delete unused imports, variables, and dead code immediately
- Remove commented-out code unless explicitly marked `// KEEP:` with reason
- Remove temporary/scratch files after implementation is complete

### Timer and Subscription Cleanup

- Every `setTimeout`/`setInterval`/`addEventListener`/`subscribe` needs a matching cleanup (`clearTimeout`/`clearInterval`/`removeEventListener`/unsubscribe handle).
- Store timer ids in a scope the cleanup can reach. Nested timeouts → array; single-shot → local const or ref.
- In React: return cleanup from `useEffect`. In plain modules: export a `dispose()` or use `AbortController`.
- HMR-safe: guard global listener attachment behind a `window.__<featureName>Attached` flag so hot-reload doesn't double-subscribe. For frameworks exposing `import.meta.hot`, also release listeners via `import.meta.hot.dispose()`.
- See the [TIMER_LEAKS pattern](https://gp-props.vercel.app/patterns/TIMER_LEAKS.md) for concrete patterns (nested-timeout array, AbortController, per-effect dispose, HMR guard). The hosted URL, not a repo-relative path — this block is mirrored into every repo, and only gp-props holds the file.

### Quality Checks

During every change, actively scan for:
- Error handling gaps
- Edge cases not covered
- Inconsistent naming
- Code duplication that should be extracted
- Missing input validation at boundaries
- Security concerns (XSS via dangerouslySetInnerHTML, unsanitized user input)
- Performance issues (unnecessary re-renders, missing keys, large re-computations)

Fix what you find. Raise it instead of fixing it only when the fix needs a decision that is genuinely the user's.

### User Experience (Non-Negotiable)

All end users are non-technical. This overrides cleverness.

- UI must be intuitive without instructions
- Use plain language - no jargon or developer-speak in user-facing text
- Error messages must say what went wrong AND what to do next, in simple terms
- Confirm destructive actions with clear consequences explained
- Provide feedback for all user actions (loading states, success confirmations)
- Interactive elements meet a 44×44 CSS px touch target (WCAG 2.5.5). Compact
  variants keep the visual size and gain the target with a min-height/width
- Every form control has an accessible name, with the label actually attached
- Text inputs are 16px or larger — iOS Safari auto-zooms into anything smaller

### Commit Message Format

All commits must include metadata footers:

```
type(scope): subject

Body explaining why.

Tags: tag1, tag2, tag3
Complexity: 1-5
Urgency: 1-5
Impact: internal|user-facing|infrastructure|api
Risk: low|medium|high
Debt: added|paid|neutral
Epic: feature-name
Semver: patch|minor|major
```

**Tags:** Use relevant tags for the change (e.g., documentation, pwa, debug, ui, refactor, testing)
**Complexity:** 1=trivial, 2=small, 3=medium, 4=large, 5=major rewrite
**Urgency:** 1=planned, 2=normal, 3=elevated, 4=urgent, 5=critical
**Impact:** internal, user-facing, infrastructure, or api
**Risk:** low=safe change, medium=could break things, high=touches critical paths
**Debt:** added=introduced shortcuts, paid=cleaned up debt, neutral=neither
**Epic:** groups related commits under one feature/initiative name
**Semver:** patch=bugfix, minor=new feature, major=breaking change

These footers are required on every commit. No exceptions.

### REMINDER: READ AND FOLLOW THE CODE STANDARDS EVERY TIME

## Documentation

**The goal: every one of these files says what is true right now, and each fact
lives in exactly one of them.** Maintained as you work, never when asked. Three
tests, ordered by what you sacrifice last:

- **Nothing in them is stale.** Before adding, read what is already there. If an
  entry is done, deployed, superseded or no longer true, **delete it** — don't
  annotate it, don't mark it complete, don't keep it for the record. Git history
  is the record. This bites hardest where an entry resolves without the repo
  changing — `USER_ACTIONS.md` above all, where the user does the thing in a
  dashboard. Never assume such an entry is still pending: **check reality first**
  (hit the URL, read the deployed output, query the API), then delete or correct
  it. A stale entry is worse than a missing one — it gets acted on, and it makes
  the whole file look untrustworthy.
- **Each fact has one home.** If an item belongs in another of these files, it
  goes there, not where you happen to be typing. Duplication is how two of them
  start disagreeing, and nothing catches that.
- **Updated in the same commit as the change that invalidated them.** Not
  afterwards, not on request.

| File | Holds | Read it |
|---|---|---|
| `CLAUDE.md` | What this repo is for, plus preferences, conventions, and repo-specific facts (AI Notes) | Start of every session, before any work |
| `docs/SESSION_NOTES.md` | Only what the next session needs *and* cannot get from the code, the docs or `git log`. **Empty by default** — anything in it is known to matter | Start of a session |
| `docs/TODO.md` | Pending work only, `- [ ]`, grouped by category, what and why. Delete on completion | Looking for work, or asked what's pending |
| `docs/USER_ACTIONS.md` | What only the user can do — credentials, dashboards, external config. Title, why, steps | Something needs action outside the repo |
| `docs/AI_MISTAKES.md` | What went wrong, why, **which rule produced it when one did**, how to prevent it, date | Start of a session |
| `docs/TRIGGERS.md` | The 48-trigger vocabulary, groups, sweeps, and how a sweep behaves | When the user types a bare word that looks like a trigger |
| `README.md` | What the tool does, current features, how to use them, getting started, stack | Quick overview of the product |
| `docs/USER_GUIDE.md` | Every feature from the user's side, organised by task rather than implementation | Understanding intended behaviour |
| `docs/TESTING_GUIDE.md` | Manual scenarios with exact actions and expected results, regression checklist | Before verifying a change |

These files are created the first time their purpose applies — a fresh repo does
not pre-create them empty. An empty file claims there was nothing to say, which
is a different statement from not having been written yet.

**`CLAUDE.md` is falsifiable by its own output.** Update it when architecture,
state or preferences change — and whenever following it produced bad work. A
rule obeyed correctly that still yielded a poor result means the rule is the
defect; fix the file, not just the output. Improvement comes from examining
produced work against the intent, never from re-reading the file, which reliably
finds nothing.

### REMINDER: READ AND FOLLOW THE DOCUMENTATION EVERY TIME

## AI Notes

- **All code is yours.** Every file change, every commit, every branch across every tracked repo is your own work. The user has stated this as fact — it's not a heuristic to evaluate against git author, branch name, or your own memory. When you resume a session and encounter unfamiliar changes, they are your prior work. Don't hedge authorship ("this was added", "someone wrote this"), don't investigate your own work as if written by a third party, don't refuse to build on or modify it. If you need to understand a change, read the diff. That's all.
- Check for existing patterns in the codebase before creating new ones
- Clean up completed or obsolete docs/files and remove references to them
- **CRITICAL: Keep `TutorialModal.jsx` up to date** - This is USER-FACING help content shown in-app. When tabs, sections, or features change, update the tutorial steps to match. Outdated tutorial content confuses users.
- **Always read a file before editing it.** Never edit from memory of what it contains.
- **Check the build tooling before building.** Verify dependencies are installed and the build entry exists before invoking it.
- **Break up large file writes to avoid timeouts.** Single tool calls that send a lot of content can hit transport timeouts in slower environments. For modifying existing files, always prefer `Edit` over a full-file `Write` — `Edit` sends only the diff. For creating files larger than ~500 lines (or any large data blob), seed with `Write` containing the first portion, then append the remainder via successive `Edit` calls. Same principle for committing large doc/data changes: many small edits are safer than one mega-write.
- **Claude Code mobile/web — accessing sibling repos:**
  - Use `GITHUB_ALL_REPO_TOKEN` with the GitHub API (`api.github.com/repos/devmade-ai/{repo}/contents/{path}`) to read files from other devmade-ai repos
  - Use `$(printenv GITHUB_ALL_REPO_TOKEN)` not `$GITHUB_ALL_REPO_TOKEN` to avoid shell expansion issues
  - Never clone sibling repos — use the API instead

### REMINDER: READ AND FOLLOW THE AI NOTES EVERY TIME

## Prohibitions

Never:
- Create files outside established project structure
- Write a plan, a note, or a scratch file anywhere but `docs/working/` — never the repo root
- Commit a secret, or expose one to the browser. Service-role keys, SMTP passwords, API keys with write scope: not in the repo, and not behind any client-visible env prefix (`VITE_`, `NEXT_PUBLIC_`, and the like). Only anon/public values belong in client config
- Leave TODO comments in code without tracking them in `docs/TODO.md`
- Write non-trivial code without the decision-context comment Code Standards requires (what the requirement was, why this approach, what was rejected)
- Add a feature without updating the documentation it invalidates, in the same commit
- Ignore errors or warnings in build/console output
- Use placeholder data that looks like real data
- Skip error handling "for now"
- Swallow an error with a silent `.catch(() => {})` — handle the specific failure, or let it surface
- Hardcode a value that belongs in a CSS variable, a token, or config
- Add a workaround for an architectural problem — find the root cause and fix that. Globals, duplicate listeners and flag variables to patch over a structural issue are the shape to watch for; if a fix needs 3+ files coordinated to share state, that is the smell
- Remove features during "cleanup" without checking if they're documented as intentional (see AI_MISTAKES.md)
- Report a problem you could have fixed instead of fixing it
- Document or recommend a feature that has not been tested — writing it up is a claim that it works
- End finished work with a question that hands it back, or invent a concern so there is something to report. Decisions go up front, before the work starts — never dangling after it. Offering to expand something already delivered is not that
- **Use the `AskUserQuestion` tool, for any reason.** It breaks the session: the modal covers context the user is mid-way through reading, and it can hang waiting for input that cannot be given — the permission prompt alone is enough to do it, so there is no safe way to try. This extends to any interactive input prompt or selection UI. List options as numbered text and let the user reply with a number.
- Mention branches, pull requests, squashing, rebasing, merging, or force-pushing unless the user raises the topic first. When the user does raise one, answer the specific question and stop — do not volunteer opinions on what they should do process-wise.
- Offer opinions on git history editing, branch strategy, PR size or shape, review flow, or commit structure. Follow instructions; don't editorialize on how the work should be organized.

### REMINDER: READ AND FOLLOW THE PROHIBITIONS EVERY TIME

## Triggers

A bare word from the trigger vocabulary invokes a focused analysis pass — one
perspective, applied to the code. `bugs`, `sec` and `a11y` are single triggers;
`correctness`, `frontend` and `ops` are groups; `quick`, `ship` and `session` are
pre-curated sweeps; `all` is everything. Suffix any of them to scope it: `branch`,
`branch <base>`, `staged`, `file <path>`.

**The vocabulary and the behaviour rules live in
[`docs/TRIGGERS.md`](docs/TRIGGERS.md).** Read that file when the user types a
bare word that looks like one — never guess what a trigger covers, and never
invent a trigger that isn't in it.

### REMINDER: READ AND FOLLOW THE TRIGGERS EVERY TIME

## Implementation Patterns (Source of Truth)

All implementation patterns live in the **gp-props** repo and are the single source of truth for all devmade-ai projects.

**Source location:** `docs/implementations/` in the gp-props repo

**How to access from any repo:**
- Fetch from the live site: `curl -sf "https://gp-props.vercel.app/patterns/{PATTERN_NAME}.md"`
- Fetch via GitHub API: `curl -sf -H "Authorization: token $(printenv GITHUB_ALL_REPO_TOKEN)" "https://api.github.com/repos/devmade-ai/gp-props/contents/docs/implementations/{PATTERN_NAME}.md" | jq -r .content | base64 -d`
- To list all available patterns: `curl -sf -H "Authorization: token $(printenv GITHUB_ALL_REPO_TOKEN)" "https://api.github.com/repos/devmade-ai/gp-props/contents/docs/implementations" | jq -r '.[].name'`

**Rules:**
- **Always fetch the latest version** from gp-props before implementing — patterns are continuously improved
- **Never create local copies** of implementation pattern files in downstream repos
- **Do not hardcode a list of patterns** — scan the source folder to discover what's available
- The set of patterns grows over time; always check the source for new additions

### Alignment levels up, never down

gp-props is the source of truth, but "source of truth" does not mean "the version that wins". When a repo you are reading does something **better** than the canonical version, improve the canonical one — never overwrite the better implementation with the worse rule.

- **Applies to anything, not just patterns** — a rule, a PWA implementation, a hook, a tripwire, a doc convention, a line of copy.
- **Better means demonstrably better:** more correct, catches a case the other misses, or says the same thing more sharply and concretely. Not "different", not "how I would have written it" — that is the taste rule in Scope and Completion, and it still applies.
- **Upstream first, then sync.** Land the improvement in gp-props, then propagate it, so every repo ends up with the better version instead of one repo quietly keeping an advantage the rest never get.
- **Say what you took and where from**, so the trail exists.
- **Levelling a repo DOWN to match the canonical version is a regression**, even when it turns the alignment audit green. A green audit over a worse fleet is a failure of the audit, not a success.

<!-- LOCAL: everything below is this repo's own. Fleet syncs never touch it. -->

## Fetching External CLAUDE.md

The shared scaffolding (Process, Principles, Code Standards, Documentation, AI Notes, Triggers, Prohibitions, Implementation Patterns) is maintained in the sister project `devmade-ai/gp-props`.

To fetch the latest version:

## Quick Reference

```
LANGUAGE=JavaScript (ES2020+)
FRAMEWORK=React 18
BUNDLER=Vite
STYLING=Tailwind CSS 4 + DaisyUI 5 (utility classes in JSX, 2 theme combos: Mono + Luxe)
LINTER=ESLint 9 (flat config) + eslint-plugin-react-hooks 7.x + eslint-plugin-react-refresh
TEST_RUNNER=Jest (164 unit tests) + Manual (see docs/TESTING_GUIDE.md)
PACKAGE_MANAGER=npm
DEPLOY=Vercel (auto-deploy on push to main)
NAMING=camelCase (variables/functions), PascalCase (components)
FILE_NAMING=PascalCase.jsx (components), camelCase.js (hooks/utils/config)
COMPONENT_STRUCTURE=flat (src/components/)
DOCS_PATH=/docs
```

---

## Project Info

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CanvaGrid - A browser-based visual design tool. Users can upload images, add text overlays, choose layouts, and export designs for social media, web, print, and presentations. Supports multi-page documents for books, stories, and slide decks.

## Project Status

Core features working:

- **Multi-page support**: Create multi-page documents (books, stories, presentations)
  - Pages array with add/duplicate/delete/reorder via Structure tab
  - Per-page: images, layout, text, overlays, padding, frames
  - Shared across pages: theme, fonts, platform, logo
- **Reader mode**: Clean full-screen view with page navigation (arrow keys, buttons, dots)
- **Freeform text mode**: Toggle on Content tab between Guided and Freeform
  - Per-cell multi-block text editors with independent content, color, size, alignment
  - Automatic markdown rendering (uses `marked` library)
- Multi-image system: Image library with per-cell assignment
  - Upload multiple images to a shared library
  - Assign different images to different cells (1 per cell)
  - Per-cell image settings: fit, position, filters
- Logo upload with position (corners, center) and size options
- Frame system: Colored borders using percentage of padding
- Flexible layout system with sub-tab organization (see Layout Tab Sub-tabs below)
- Per-cell structured text (guided mode):
  - Each cell has its own text elements: title, tagline, bodyHeading, bodyText, cta, footnote
  - Text elements organized in groups: Title+Tagline, Body, CTA, Footnote
- Theme system with 19 canvas design themes (each with light and dark variants) and custom colors
  - Canvas design themes (themes.js): 19 presets for content styling — applied via inline styles
  - App UI themes (daisyuiThemes.js): 2 combo presets (Mono: lofi/black, Luxe: fantasy/luxury) — controls app chrome
- Overlay system with 26 effects:
  - Basic: Solid color
  - Linear gradients: 8 directions (↑↓←→ and diagonals)
  - Radial: Vignette, Spotlight, Radial Soft, Radial Ring, 4 corner radials (↖↗↙↘)
  - Effects: Blur Edges, Frame, Duotone
  - Blend modes: Multiply, Screen, Overlay, Color Burn
  - Textures: Noise, Film Grain
- 24 Google Fonts (sans-serif, serif, display categories)
- Export to 40 formats across 18 platform groups:
  - Social: Instagram (Feed Portrait/Square/Feed Landscape/Story), Facebook (Feed/Square/Story/Cover), TikTok, LinkedIn (Square/Portrait/Landscape), Twitter/X, Pinterest (Pin/Story), Snapchat (Ad/Story), WhatsApp (Status), Threads (Post/Story)
  - Website: Hero (Standard/Tall/Full HD), OG Image
  - Banners: LinkedIn Banner, YouTube (Banner/Thumbnail/End Screen)
  - Print: A3, A4, A5 (Portrait & Landscape at 150 DPI)
  - E-commerce: Product Images (Square/Portrait), Store Banners (Hero/Category)
  - Other: Email Header, Zoom Background
- **Export format selection**: PNG, JPG, or WebP with per-platform recommendations
- Single download, ZIP batch download, multi-page ZIP export, and PDF export
- **PDF export**: Save as PDF via pdf-lib (PNG at 2x for lossless quality, with JPEG fallback)
- **Platform specs**: Two-level selector (platform → format), tips, file size limits, recommended formats
- Responsive preview that adapts to device width
- **PWA support**: Installable app with offline capability and fleet-standard auto-on-launch updates
  - Inline `beforeinstallprompt` capture in index.html (race condition fix)
  - Explicit manifest `id` for stable install identity
  - Dedicated 1024px maskable icon with separated icon purposes
  - Updates auto-apply at launch (waiting worker → single reload before anything is typed); mid-session detections only arm the Update button/banner — never a forced reload over unsaved designs
  - Persisted "Automatic updates" toggle (default ON, localStorage `pwaAutoUpdate`) in the mobile burger menu + desktop header; "Check for Updates" reports a typed result via toast
- **Debug system (alpha, all envs)**: In-memory event log with floating DebugPill (separate React root), console interception, PWA diagnostics, pre-React inline pill
- **Toast notifications**: Non-blocking feedback for exports, saves, deletes, warnings
- **Inline confirmations**: ConfirmButton replaces browser confirm() for destructive actions
- **Export progressive disclosure**: Secondary options collapse into "More export options"
- **Canvas controls**: Empty state guidance, contextual quick-actions for selected cell
- **Keyboard shortcuts**: 1-5 for tab switching, shortcut overlay panel (header button)
- **Mobile-first layout** (viewport < 1024px): Bottom nav bar (MobileNav), touch-draggable bottom sheet (BottomSheet) for tab content, edge-to-edge canvas, swipe-between-pages gesture, compact header with overflow menu, platform info strip

## Current Tab Structure

**Top-level tabs:** Presets, Media, Content, Structure, Style (+ Export on mobile)

### Desktop layout (>= 1024px)

Tabs render as a full-width horizontal nav bar below the header (website header pattern), with underline-style active indicator. Below the tabs is a consolidated ContextBar containing: page selector + cell selector. Undo/redo lives in the header.

```
Header (scrolls away, includes undo/redo)
Tab Nav Bar (sticky, full-width, underline active indicator)
Context Bar: [Page thumbnails] | [Cell grid]
Sidebar (tab content) | Main (platform selector + canvas + export)
```

### Mobile layout (< 1024px, detected by `useIsMobile` hook)

Fixed viewport with edge-to-edge canvas. Tab content lives in a touch-draggable BottomSheet with three snap points (closed/half/full). Navigation via fixed MobileNav bar at bottom.

```
Compact Header (grid icon + app name [gradient] + undo/redo + burger menu: Help, Install, Update, Refresh, Reader, Save, Shortcuts + dark/light toggle + theme list)
Platform Info Strip (current format name + dimensions)
Canvas (edge-to-edge, swipe left/right for page navigation)
ContextBar (page thumbnails + cell grid — consolidated single row)
BottomSheet (active tab content, drag to resize — Presets opens by default on load)
MobileNav (fixed bottom: Presets, Media, Content, Structure, Style, Export)
```

Export is a dedicated tab on mobile (vs. sidebar section on desktop) containing only download controls — platform selection lives in the Presets tab. Tapping the active tab toggles the bottom sheet open/closed. Presets bottom sheet opens by default on load so users see it's active.

Tab descriptions (workflow-based organization):
- **Presets** - Start here: Platform selection (canvas size), layout presets (with aspect ratio filtering), color themes, and visual looks
- **Media** - Sample images, upload images to library, assign to cells, per-image overlay & filters, logo
- **Content** - Write text, set visibility, cell assignment, alignment, color, size
- **Structure** - Fine-tune grid structure (section sizes, subdivisions, reorder) and manage pages (add, duplicate, reorder, delete)
- **Style** - Typography, per-cell overlay, spacing, frames

## Tech Stack

- Vite 5 + React 18
- Tailwind CSS 4 + DaisyUI 5 (2 theme combos: Mono + Luxe)
- html-to-image for rendering
- JSZip + file-saver for batch export
- marked for markdown parsing (freeform text mode)
- Vercel deployment

## Common Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build
npm run lint             # Run ESLint (flat config, ESLint 9)
npm test                 # Run unit tests (Jest)
```

## Architecture

```
src/
├── components/     # React components
│   ├── AdCanvas.jsx           # Core rendering (cell-based layout)
│   ├── CollapsibleSection.jsx # DaisyUI collapse component wrapper (collapse-arrow, checkbox-controlled)
│   ├── TemplatesTab.jsx       # Layout presets, themes, and looks
│   ├── MediaTab.jsx           # Image management hub (upload, assign, overlay, filters, logo)
│   ├── SampleImagesSection.jsx # CDN sample images gallery with category filtering
│   ├── AIPromptHelper.jsx     # AI image prompt builder
│   ├── ContentTab.jsx         # Text editing with cell assignment
│   ├── FreeformEditor.jsx     # Per-cell freeform text block editors (FreeformBlockEditor + FreeformCellEditor)
│   ├── TextStyleControls.jsx  # Shared text styling toolbar (size, bold, italic, color, alignment, spacing)
│   ├── LayoutTab.jsx          # Grid structure + cell alignment + page management
│   ├── StyleTab.jsx           # Typography, overlay, spacing (themes in Presets tab)
│   ├── ContextBar.jsx         # Sticky bar: page selector + cell selector (consolidated single row)
│   ├── PlatformPreview.jsx    # Platform selector with search filter
│   ├── ExportButtons.jsx      # Export controls (single, multi-platform, multi-page)
│   ├── TutorialModal.jsx      # In-app help walkthrough (8 steps covering all tabs)
│   ├── SaveLoadModal.jsx      # Save/load/delete designs (IndexedDB)
│   ├── LogoUploader.jsx       # Logo upload, position, and size controls
│   ├── InstallInstructionsModal.jsx # Manual PWA install instructions
│   ├── ErrorBoundary.jsx      # Error handling wrapper
│   ├── AlignmentPicker.jsx    # Reusable alignment button group
│   ├── ColorPicker.jsx        # Theme-aware color picker for text elements
│   ├── ThemeColorPicker.jsx   # Theme color swatch picker (primary/secondary/accent/neutrals)
│   ├── ThemeSelector.jsx      # DaisyUI theme combo picker (join group: dark/light toggle + Mono/Luxe)
│   ├── MiniCellGrid.jsx       # Compact cell grid (two sizing modes: fixed-width for panels, fixed-height s/m/l for bars)
│   ├── PageDots.jsx           # Shared page thumbnails (ContextBar + Structure tab)
│   ├── Toast.jsx              # Toast notifications (DaisyUI toast container + alert styling)
│   ├── ConfirmButton.jsx      # Inline confirmation replacing browser confirm()
│   ├── Tooltip.jsx            # Portal-based tooltip (prevents clipping at container edges)
│   ├── KeyboardShortcutsOverlay.jsx # Keyboard shortcuts modal (DaisyUI modal + kbd)
│   ├── EmptyStateGuide.jsx    # Empty canvas guidance (below canvas on mobile, overlay on desktop)
│   ├── QuickActionsBar.jsx    # Cell quick-action shortcuts (Image, Text, Style)
│   ├── UndoRedoButtons.jsx    # Shared undo/redo buttons (used in both mobile + desktop headers)
│   ├── BurgerMenu.jsx         # Disclosure-pattern dropdown (WAI-ARIA, DaisyUI menu, own backdrop, close-then-act, MenuItem interface, version footer)
│   ├── BottomSheet.jsx        # Touch-draggable bottom sheet for mobile tab content (3 snap points, reduced-motion support)
│   ├── MobileNav.jsx          # DaisyUI dock bottom navigation (6 tabs incl. Export, safe area insets)
│   ├── ReaderMode.jsx         # Full-screen reader view with page navigation (useEscapeKey + arrow key handler)
│   ├── MobileLayout.jsx       # Mobile-specific layout container (header, canvas, sheet, nav)
│   ├── DesktopLayout.jsx      # Desktop-specific layout container (header, sidebar, main)
│   └── DebugPill.jsx          # Floating debug panel (separate React root, 3 tabs: Log/Env/PWA)
├── config/         # Configuration
│   ├── layouts.js        # 26 overlay types (solid, gradients, radial, effects, blends, textures)
│   ├── layoutPresets.js  # 27 layouts with SVG icons and categories
│   ├── stylePresets.js   # Look presets (fonts + filters + overlay effects per layout + text styles)
│   ├── platforms.js      # 40 formats across 18 platform groups (nested: platformGroups + flat: platforms) — spec data sourced from docs/SOCIAL_MEDIA_SPECS.md
│   ├── sampleImages.ts   # CDN manifest URL for sample images (fetched at runtime)
│   ├── themes.js         # 19 color themes with light/dark variants
│   ├── fonts.ts          # 24 Google Fonts (FontEntry interface)
│   ├── textDefaults.ts   # Default text layer state (TextLayer, FreeformBlock interfaces)
│   ├── daisyuiThemes.js  # DaisyUI theme combos (Mono + Luxe, meta colors, defaults)
│   ├── menuIcons.js      # SVG path constants for burger menu and desktop header icons (incl. sun/moon)
│   └── alignment.jsx     # Alignment icon components and option arrays
├── hooks/
│   ├── useAdState.js     # Central state (multi-page, per-cell text, freeformText, layout)
│   ├── useHistory.js     # Undo/redo history management (shallowEqual skips base64)
│   ├── useDarkMode.js    # Dark mode + combo-based DaisyUI theme selection
│   ├── useOnlineStatus.js # Online/offline detection
│   ├── useFocusTrap.js   # Focus trap for BurgerMenu (modals use native <dialog> focus trap)
│   ├── useIsMobile.js    # matchMedia hook: viewport < 1024px (Tailwind lg breakpoint)
│   ├── usePWAInstall.js  # PWA install prompt state (singleton, imports pwaHelpers)
│   ├── usePWAUpdate.js   # PWA update detection state (singleton, imports pwaHelpers)
│   ├── useTheme.js       # ThemeContext wrapping useDarkMode (eliminates prop drilling)
│   ├── useDialogSync.js  # Shared <dialog> open/close sync for DaisyUI modals (4 consumers)
│   ├── useDisclosureFocus.js # Shared focus management for disclosure-pattern components
│   └── useEscapeKey.js   # Reusable Escape key handler for disclosure components
├── utils/
│   ├── cellUtils.js      # Cell counting, shifting, swapping, cleanup utilities
│   ├── designStorage.js  # IndexedDB wrapper for design persistence
│   ├── debugLog.js       # In-memory debug event store (circular buffer, console interception, report generation)
│   ├── exportHelpers.js  # Export capture utilities (captureAsBlob, captureForPdf, waitForPaint)
│   ├── canvasRenderers.js # Canvas rendering helpers (buildFilterStyle, getAlignItems, isDuotoneOverlay)
│   ├── fontEmbed.js      # Pre-fetches Google Fonts CSS + woff2 as data URLs for html-to-image's fontEmbedCSS option (CORS-safe, cached, per-weight failure tolerant)
│   ├── pwaHelpers.js     # Pure PWA utilities (detectBrowser, wasJustUpdated, trackInstallEvent, CHROMIUM_BROWSERS)
│   ├── pwaCleanup.js     # One-shot caches.delete for pre-rename SW runtime caches (sunset target: ~Oct 2026 — see TODO.md)
│   └── layoutHelpers.ts  # Layout-structure geometry (cellToSection, getFirstCellOfSection, Section interface)
├── App.jsx               # State orchestrator, delegates rendering to ReaderMode/MobileLayout/DesktopLayout
└── main.jsx
```

## Key State Structure

```js
// Multi-page support
// pages[activePage] = null means active page data is at top-level
// pages[otherIndex] = { ...perPageFields } for inactive pages
pages: [null, { images: [...], layout: {...}, text: {...}, ... }]
activePage: 0  // Index of active page

// Per-page fields: activeStylePreset, activeLayoutPreset, images, cellImages,
//   defaultImageSettings, text, layout, padding, frame, textMode, freeformText
// Shared fields: theme, fonts, platform, exportFormat, logo, logoPosition, logoSize

// Text mode: 'structured' (guided text groups) or 'freeform' (per-cell blocks)
// UI labels this as "Guided" / "Freeform" but state value remains 'structured'
textMode: 'structured'

// Freeform text — array of independently styled markdown blocks per cell.
// Content is always parsed as markdown via `marked` — no per-cell toggle.
freeformText: {
  0: [  // Array of block objects per cell
    { id: 'block-xxx', content: 'Hello **world**', color: 'secondary', size: 1, bold: false, italic: false, letterSpacing: 0, textAlign: null, spacerAbove: 0, spacerBelow: 0, lineAbove: false, lineBelow: false },
    { id: 'block-yyy', content: 'Second block', color: 'primary', size: 0.8, bold: false, italic: false, letterSpacing: 0, textAlign: null, spacerAbove: 0, spacerBelow: 0, lineAbove: false, lineBelow: false },
  ],
  1: [ /* ... */ ],
}

// Image library - all uploaded images with individual settings including overlay
images: [
  {
    id: 'img-123',
    src: 'data:...',
    name: 'hero.jpg',
    fit: 'cover',
    position: { x: 50, y: 50 },
    filters: { grayscale: 0, sepia: 0, blur: 0, contrast: 100, brightness: 100 },
    overlay: { type: 'solid', color: 'primary', opacity: 0 }  // Per-image overlay
  },
]

// Per-cell image assignments (just the image ID - settings are on the image itself)
cellImages: {
  0: 'img-123',  // Maps cell index to image ID
}

layout: {
  type: 'fullbleed' | 'rows' | 'columns',
  structure: [
    { size: 50, subdivisions: 1, subSizes: [100] },  // Section with optional subdivisions
    { size: 50, subdivisions: 2, subSizes: [50, 50] }
  ],
  textAlign: 'center',           // Global horizontal alignment fallback
  textVerticalAlign: 'center',   // Global vertical alignment fallback
  cellAlignments: [{ textAlign, textVerticalAlign }, ...]  // Per-cell overrides
  cellOverlays: {}  // Per-cell overlay settings
  cellBackgrounds: {}  // Per-cell background color override (color key, e.g. 'secondary', 'accent', 'off-white')
}

// Frame settings (colored border using percentage of padding)
frame: {
  outer: { percent: 0, color: 'primary' },  // Outer canvas frame
  cellFrames: { 0: { percent: 50, color: 'accent' } }  // Per-cell frames
}

// Per-cell structured text — each cell has its own text elements
text: {
  0: {  // cell index
    title: {
      content: '...',
      visible: true,
      color: 'secondary',
      size: 1,
      bold: true,
      italic: false,
      letterSpacing: 0,
      textAlign: null,         // Per-element horizontal alignment (null = use cell default)
      textVerticalAlign: null, // Per-element vertical alignment (null = use cell default)
    },
    // ... same structure for tagline, bodyHeading, bodyText, cta, footnote
  },
  1: { title: {...}, bodyText: {...} },  // Another cell
}

// Alignment fallback chain: element.textAlign → cellAlignments[cell] → layout.textAlign
```

## Tab Details (New Workflow-Based UI)

### Presets Tab (formerly Templates)
Entry point for users. Four sections:
- **Platform** - Target size selector (Instagram, TikTok, LinkedIn, print, etc.) — sets canvas dimensions. Shown on mobile only (desktop has platform selector always visible above canvas).
- **Layout** - Grid structure presets with aspect ratio filtering (All, Square, Portrait, Landscape) and category filtering
- **Themes** - 19 preset color themes with light/dark variant toggle + custom color inputs
- **Looks** - Visual effect presets that apply overlay, fonts, and filters without changing layout or colors

### Media Tab
Collapsible sections:
- **Sample Images** - CDN-hosted sample images with category filtering (manifest fetched at runtime from jsDelivr)
- **AI Image Prompt** - Helper for generating AI image prompts
- **Images** - Upload to library, cell selector, assign images to cells, per-image settings (fit, position)
- **Image Overlay** - Per-image overlay controls (type, color, opacity) for selected image
- **Advanced Filters** - Per-image: grayscale, sepia, blur, contrast, brightness
- **Logo** - Upload, position (corners/center), size

### Content Tab
Top-level toggle: **Guided** / **Freeform** (state value remains `'structured'` for backwards compat)

**Guided mode** - Text groups organized by purpose, each in a collapsible section:
- **Title & Tagline** - Paired text elements
- **Body** - Heading + body text
- **Call to Action** - CTA button text
- **Footnote** - Fine print
- Each text element has: visibility toggle, text input, alignment, color, size, bold/italic, letter spacing
- Text alignment controls (horizontal + vertical) per cell — moved from Structure tab

**Freeform mode** - Per-cell multi-block text editors:
- Multiple independently styled markdown blocks per cell (add/remove/reorder)
- Per-block controls: alignment, color, size, bold/italic, letter spacing, spacers, line decorators
- Automatic markdown rendering (content always parsed via `marked`)

### Structure Tab (formerly Layout)
Collapsible sections:
- **Grid** - Layout type (Full/Rows/Columns), interactive grid for editing section/cell sizes, add/remove sections and subdivisions, reorder sections (move up/down for rows, left/right for columns)
- **Pages** - Add, duplicate, reorder, and delete pages for multi-page documents

### Style Tab
Collapsible sections:
- **Typography** - Title font + body font selectors with preview
- **Overlay** - Per-cell overlay controls (stacks on top of image overlay)
- **Spacing** - Global padding + per-cell custom padding, outer frame + cell frames

Note: Color themes are in the Presets tab, not Style.

## Preset Types

| Name | Location | What It Applies | Config File |
|------|----------|-----------------|-------------|
| **Layouts** | Presets → Layout | Grid structure + image/text cell placements (filterable by aspect ratio) | `layoutPresets.js` |
| **Themes** | Presets → Themes | Color scheme with light/dark variants (primary, secondary, accent per variant) | `themes.js` |
| **Looks** | Presets → Looks | Fonts + image filters + overlay (without changing layout or colors) | `stylePresets.js` |

## Rescued From Replaced Sections

Lines the fleet sync found in this repo's canonical sections that canonical
does not say. Kept verbatim, prefixed with the section they came from, so a
later pass can decide whether each is local, obsolete, or worth upstreaming.

- Code Standards :: - See the `TIMER_LEAKS.md` implementation pattern in gp-props for concrete patterns (nested-timeout array, AbortController, per-effect dispose, HMR guard).
- Code Standards :: **Tags:** Use descriptive tags relevant to the change (e.g., docs, state, layout, export, pwa, text, media, ui)
- Documentation :: - When complete, delete completed items (git history tracks them)
- Documentation :: **Purpose:** Visual design system documentation (colors, typography, spacing, components).
- Documentation :: **When to read:** When implementing UI changes, adding new components, or adjusting visual design.
- Documentation :: **When to update:** When the design system evolves (new colors, spacing tokens, component patterns).
- Documentation :: - Color palette with hex values and semantic tokens
- Documentation :: - Typography scale and font choices
- Documentation :: - Spacing system and border radius tokens
- Documentation :: - Component patterns (buttons, inputs, cards, tabs)
- Documentation :: - Dark mode specifications
- Documentation :: - Accessibility requirements
- Documentation :: **Why:** Ensures visual consistency across the application. Reference for implementing new UI.
- AI Notes :: <!-- Reminders and learnings for AI assistants - add to this as needed -->
- AI Notes :: - **NEVER use the AskUserQuestion tool.** It breaks the session UI — the input selector covers context, gets stuck awaiting input, and provides zero value. Instead, list options as numbered text in your response and let the user reply with a number or text. This is absolute and applies to every session, every project, no exceptions.
- AI Notes :: - **ESLint setup:** ESLint 9 flat config (`eslint.config.js`) with `eslint-plugin-react-hooks@7.x` and `eslint-plugin-react-refresh` (vite preset). Run `npm run lint` before committing. The `no-unused-vars` rule has `argsIgnorePattern: '^[A-Z_]'` because ESLint's scope analysis doesn't track JSX component references (`<Foo />`) as variable usage — PascalCase function args would be false positives without this. `eslint-plugin-react-hooks@7.x` caps at ESLint 9 (doesn't support 10). When adding new `eslint-disable` comments, always include a `--` reason suffix explaining WHY the suppression is needed. Test files import Jest globals explicitly from `@jest/globals` (no ESLint global env needed).
- AI Notes :: - **Dark mode + DaisyUI dual-layer theming:** `useDarkMode.js` manages both `.dark` class (Tailwind `dark:` utilities) and `data-theme` attribute (DaisyUI component colors) on `<html>`. Users pick a theme combo (Mono or Luxe) that pairs a light + dark theme; dark/light toggle switches between them. Two combos: Mono (lofi/black), Luxe (fantasy/luxury). Two localStorage keys: `darkMode` (bool), `themeCombo` (id). Default combo: `luxe`. First-visit default is light (no stored value → false) — brand-aligned with PWA icon palette (fantasy primary). `prefers-color-scheme` is intentionally not honored; users must toggle explicitly. Cross-tab sync via `storage` event, dynamic meta theme-color per active theme. Two inline scripts in `index.html` run before React mounts: (1) flash prevention (applies `.dark` + `data-theme` + meta theme-color from localStorage before first paint), (2) PWA `beforeinstallprompt` capture. Never remove either inline script. `index.css` has `html.dark { color-scheme: dark; }` for native form inputs/scrollbars. Meta theme-color hex values and combo maps in both `daisyuiThemes.js` and the inline script are auto-generated by `scripts/generate-theme-meta.mjs` from DaisyUI's oklch definitions. Run `npm run generate-theme-meta` after DaisyUI version updates or combo changes.
- AI Notes :: - **DaisyUI color tokens:** UI chrome uses DaisyUI semantic tokens, NOT hardcoded colors. Use `bg-base-100/200/300`, `text-base-content`, `border-base-300`, `bg-primary`, `text-primary-content`, `bg-error`, `text-success`, etc. The old custom semantic tokens (`text-ui-text`, `bg-ui-surface`, `border-ui-border`) are gone — replaced by DaisyUI equivalents. Canvas design themes (19 presets in `themes.js`) still use inline styles and are unrelated to DaisyUI.
- AI Notes :: - **DaisyUI component classes for form inputs:** All form inputs MUST use DaisyUI component classes — never hand-roll Tailwind classes for inputs. Range: `range range-primary range-sm`. Checkbox: `checkbox checkbox-primary checkbox-sm`. Select: `select select-bordered select-sm`. Input: `input input-bordered input-sm`. Textarea: `textarea textarea-bordered textarea-sm`. Custom pseudo-element CSS for form inputs is forbidden — browser pseudo-element names vary across engines. Check `node_modules/daisyui/components/` for available components before writing custom form styling.
- AI Notes :: - **No low-opacity tinted backgrounds on interactive elements:** Never use `bg-primary/10`, `bg-error/15`, `bg-success/10` etc. on buttons, toggles, active states, or indicators — they become invisible on dark themes. Use `bg-base-200`/`bg-base-300` for backgrounds (guaranteed contrast on all themes) and colored text (`text-primary`, `text-error`) for semantic meaning. Pattern: `bg-base-200 text-primary hover:bg-base-300`. Only acceptable low-opacity uses: hover-only on large containers (`hover:bg-primary/10` on drop zones) and hover darkening on full-opacity buttons (`bg-primary hover:bg-primary/80`).
- AI Notes :: - **Tailwind 4 CSS-first config:** No `tailwind.config.js` or `postcss.config.js`. All config lives in `src/index.css` using `@import "tailwindcss"`, `@plugin "daisyui"`, `@theme`, `@custom-variant`, and `@utility` directives. The `@tailwindcss/vite` plugin handles processing.
- AI Notes :: - **PWA install prompt race condition:** `beforeinstallprompt` is captured by an inline script in `index.html` before React mounts. The `usePWAInstall` hook checks `window.__pwaInstallPrompt` on mount. Never remove that inline script.
- AI Notes :: - **PWA hooks use module-level singleton pattern:** Both `usePWAUpdate.js` and `usePWAInstall.js` store state at module scope (`_hasUpdate`, `_canInstall`, etc.) with a `_listeners` Set for pub/sub. React components sync via `forceRender`. This ensures state survives remounts and all consumers share values. Pure utility functions (`detectBrowser`, `wasJustUpdated`, `markUpdateApplied`, `isAutoUpdateEnabled`, `setAutoUpdateEnabled`, `describeUpdateCheckResult`, `trackInstallEvent`, `CHROMIUM_BROWSERS`) live in `utils/pwaHelpers.js` — extracted for testability (no browser-only imports).
- AI Notes :: - **PWA update policy — fleet-standard auto-on-launch** (gp-props `PWA_SYSTEM.md` "Update Application Policy"): `registerType` stays `'prompt'` (the mechanism); the behavior on top is (1) **launch-apply** — in `onRegistered`, a worker ALREADY in `registration.waiting` when registration first resolves is applied immediately (set the `_userClickedUpdate` reload latch, `markUpdateApplied()` 30s suppression, `postMessage({type:'SKIP_WAITING'})` → single reload via the existing `controllerchange` guard). Launch is the only safe apply window — canva-grid holds unsaved in-memory designs, so NEVER auto-apply mid-session; (2) **mid-session** detections (hourly poll, visibilitychange) only arm the Update button/banner, and an untapped update applies at the next launch; (3) **"Automatic updates" toggle** — persisted in bare localStorage key `pwaAutoUpdate` (`'true' | 'false'`, absent = ON) via try/catch helpers in `pwaHelpers.js`; OFF restores tap-only behavior. Surfaced as a BurgerMenu toggle item (mobile) and a header `toggle toggle-primary toggle-sm` label (desktop, next to the update buttons); (4) **"Check for Updates"** returns the fleet-canonical union `'no-sw' | 'up-to-date' | 'update-available' | 'error'` (plus internal `'checking'` for the concurrent-call guard, never toasted) — both layouts toast via the shared `describeUpdateCheckResult` mapping in `pwaHelpers.js`.
- AI Notes :: - **PWA iOS browser detection:** iOS Chrome uses `CriOS`, Firefox uses `FxiOS`, Edge uses `EdgiOS` in UA strings — not `Chrome`/`Firefox`/`Edg`. These are detected before the Safari fallback in `detectBrowser()`. Without this, all iOS non-Safari browsers are misdetected as `'safari'`, breaking the iOS cross-redirect install instructions.
- AI Notes :: - **PWA icon purposes:** Never combine `"any maskable"` in a single icon entry. Use separate entries with individual `purpose` values. Dedicated 1024px maskable icon at `pwa-maskable-1024.png`.
- AI Notes :: - **Debug system (alpha, all environments):** `src/utils/debugLog.js` is an in-memory 200-entry circular buffer with pub/sub, console interception (`console.error`/`console.warn` patched at module load), and `debugGenerateReport()` for clipboard reports with URL redaction. Consecutive identical messages (same source+event+severity) are deduplicated with a `count` field. Error handlers capture `Error.stack` from Error objects (`console.error` interceptor) and `e.error?.stack` (global error listener) — stack traces appear in debug report details for diagnosing minified crashes. Module-level listeners (console patches + window error/rejection) are guarded by `window.__debugConsolePatched` / `window.__debugLogListenersAttached` flags AND paired with an `import.meta.hot.dispose()` block that restores originals and clears the flags on HMR — without dispose, the new module's guards short-circuit re-patching while the old patches stay alive (TIMER_LEAKS pattern variant 5). `src/components/DebugPill.jsx` renders in static `#debug-root` div (separate React root, survives App crashes). Three tabs: Log, Env, PWA Diagnostics. Pre-React inline pill in `index.html` captures errors before bundle loads with 20s loading timeout. Skipped in embed mode (`?embed=`). Subscribers receive existing entries immediately on subscribe. Use `debugLog(source, event, details, severity)` to add entries (severity: info/success/warn/error).
- AI Notes :: - **pdf-lib image handling:** pdf-lib embeds PNG directly (FlateDecode — no re-encoding). Digital PDF uses pxToPt=1 (1:1 pixel-to-point mapping). Captures at user-selected pixelRatio (1x/2x/3x), giving integer px/pt ratios (1:1/2:1/3:1). Print formats use pixelRatio:1 with 72/150 DPI conversion for correct physical page size. History: (1) pixelRatio:2 + 72/96 → 2.667:1 ratio → gradient banding. (2) 1:1 mapping + page scaled with pixelRatio → identical quality. (3) pxToPt=1 fixed page + variable pixelRatio → current approach. Diagnostic image download enabled in dev mode.
- AI Notes :: - **Font embedding for export — `utils/fontEmbed.js`:** html-to-image's built-in font embedder (and its exported `getFontEmbedCSS`) walks `document.styleSheets` and reads `cssRules`, which throws SecurityError on cross-origin sheets without `crossorigin`. Even with `crossorigin="anonymous"` on the `<link>` tags, the SW runtime cache historically held opaque (status 0) responses that failed the new CORS-mode requests. Solution: pre-fetch each Google Fonts CSS URL ourselves via `getEmbeddedFontCSS(fontIds, { onWarning })`, inline every woff2 `url(...)` as a data URL (using `Promise.allSettled` so one bad weight doesn't drop the whole font), pass the result to `toCanvas` as `fontEmbedCSS`. With that option set, html-to-image short-circuits the broken stylesheet walker (verified at `embed-webfonts.js:188-192`). Cache is per-CSS-URL, lifetime = page session, with inflight dedup. Failures call `onWarning` so `exportHelpers.js` can surface partial degradation via `debugLog('export', 'font-embed-warning', ...)`. Companion changes: `crossorigin="anonymous"` on every Google Fonts `<link>` (index.html + 3 layouts) for any other CSSOM consumer; SW caches renamed `*-cache` → `*-cache-v2` with `cacheableResponse.statuses: [200]` to abandon opaque entries; `utils/pwaCleanup.js` drops the old cache names on app load.
- AI Notes :: - **Design storage is IndexedDB:** `utils/designStorage.js` wraps IndexedDB with async save/load/list/delete. One-time migration from localStorage runs on first mount via `migrateFromLocalStorage()`. Never use localStorage for designs.
- AI Notes :: - **Mobile breakpoint:** `useIsMobile` hook uses `matchMedia('(max-width: 1023px)')` — matches Tailwind `lg` breakpoint. App.jsx conditionally renders entirely different layouts for mobile vs desktop. When modifying layout/UI in App.jsx, always check both code paths.
- AI Notes :: - **BottomSheet snap points:** closed (0), half (45vh), full (80vh). Uses `transform: translateY()` for GPU-composited animation (no layout reflow). During drag, DOM updated directly via refs — React state only updates on snap (touchend). Sheet state resets when switching tabs. Props: `snapPoint`/`onSnapChange` (discrete snap values, not continuous height). **Declaration order matters:** `snapToNearest` must be declared before `handleTouchMove` and `finishTouch` — they reference it in `useCallback` dependency arrays, and `const`/`let` are not hoisted (TDZ crash if accessed before declaration).
- AI Notes :: - **Z-index scale:** Canvas internals 0-10, sticky headers 20, sheets/drawers 30, mobile nav 40, menu backdrop 40, menu dropdown 50, modals use native `<dialog>` top layer (no z-index needed), toasts `z-[70]`, debug 80. DebugPill uses inline `zIndex: 80`. **Two intentional deviations from gp-props Z_INDEX_SCALE.md:** (1) Modals use native `<dialog>` which renders in the browser top layer, above all z-indexes — this inverts the scale's "debug pill is always topmost" rule when a user-opened modal is active. Accepted because native `<dialog>` provides built-in focus trap, Escape handling, and inert background; and because the pill's crash-survival purpose is preserved (if App.jsx crashes, its modals unmount with it — the pill in the separate `#debug-root` React root remains visible). (2) MobileNav sits at z-40 rather than z-20 (pattern value for "bottom nav") because it must remain tappable above BottomSheet (z-30) so users can switch tabs while the sheet is open. The BurgerMenu backdrop is NOT a z-40 tie-break — the header gets `z-50` when the menu opens, creating a stacking context that reliably places the backdrop above MobileNav regardless of DOM order. Strict pattern alignment would require BottomSheet to stop above MobileNav via bottom-inset layout rather than z-stacking — a non-trivial refactor with no behavioral benefit, so intentionally not done.
- AI Notes :: - **Modals use native `<dialog>`:** All 4 modals (TutorialModal, SaveLoadModal, InstallInstructionsModal, KeyboardShortcutsOverlay) use DaisyUI `modal` component with `<dialog>` element. Native focus trapping replaces custom `useFocusTrap` for modals. `useFocusTrap` still used by BurgerMenu. Dialog sync pattern: `useEffect` calls `showModal()`/`close()` based on React `isOpen` prop; `close` event listener syncs back to React state.
- AI Notes :: - **DaisyUI component classes for UI chrome:** CollapsibleSection uses `collapse collapse-arrow`, SaveLoadModal uses `tabs tabs-border` + `alert alert-error alert-soft`, Toast uses `toast` (container) + `alert` (item styling), ExportButtons uses `progress progress-primary` + `join` (format selector), KeyboardShortcutsOverlay uses `kbd kbd-sm` + `divider`, DebugPill uses inline styles (separate React root, no theme context), InstallInstructionsModal uses `alert alert-warning alert-soft`, SampleImagesSection/App.jsx use `loading loading-spinner`, ThemeSelector uses `join` (connected button group), AIPromptHelper uses `join` (purpose/orientation/colors), BurgerMenu uses `menu menu-sm` (list styling), MobileNav uses `dock dock-sm` + `dock-active` + `dock-label`.
- AI Notes :: - **Burger menu:** `BurgerMenu.jsx` uses WAI-ARIA disclosure pattern (not `role="menu"`). DaisyUI `menu menu-sm` provides list item styling. Owns its own backdrop (z-40, `cursor-pointer` for iOS Safari). Uses `useEscapeKey` hook, `useDisclosureFocus`, `useFocusTrap`, `useId()` for `aria-controls`. Close-then-act pattern: menu closes first, action executes after 150ms delay. MenuItem interface supports `disabled`, `separator`, `destructive`, `external`, `highlight`, `highlightColor`, `iconClass`, plus toggle items via `toggle: true` + `checked` + optional `helper` sub-line — rendered as a `<label>` with a DaisyUI `toggle toggle-primary toggle-sm` checkbox (never an input nested in a button — invalid HTML), running `action(nextChecked)` immediately and keeping the menu open (keepOpen behavior, same precedent as the theme section). Arrow-key nav includes enabled inputs so toggles join the cycle. Version footer via `version` prop. Arrow key + Home/End keyboard navigation. State managed in App.jsx, rendered in MobileLayout. Parent header needs `z-50` when open (backdrop-blur stacking context). Accepts `children` prop for the theme section (`MenuThemeSection` in MobileLayout) — dark/light toggle with sun/moon icon + combo list (Mono/Luxe) with checkmark indicators. Menu stays open on toggle and combo selection (children don't call `onClose`).
- AI Notes :: - **PWA icon cache busting:** `vite.config.js` defines `iconVersion()` (sha256 prefix of each icon file in `public/`) and `iconCacheBustHtml()` (Vite plugin that rewrites the four icon `<link>` tags in `index.html` to `?v=<hash>`). Manifest icons use the same `versioned()` helper. Workbox config has `cleanupOutdatedCaches: true` + `ignoreURLParametersMatching: [/^utm_/, /^v$/]` — the `/^v$/` entry is required, without it Workbox precache misses versioned icon URLs and offline breaks. Plugin order: `iconCacheBustHtml()` must run before `VitePWA()`. Tripwire: `src/__tests__/iconCacheBust.test.js` asserts source and dist-level invariants. OS icon cache is the one layer no web-side change refreshes — `InstallInstructionsModal.jsx` surfaces a collapsible with platform-tailored reinstall steps (iOS long-press → Remove App, Android long-press → Uninstall, Desktop app menu → Uninstall). Pattern source: `gp-props/docs/implementations/PWA_ICON_CACHE_BUST.md`.
- AI Notes :: - **Trigger name collisions with repo conventions:** Several trigger names overlap with repo folders/concepts — `docs` (folder `docs/`), `config` (folder `src/config/`), `tests` (folder `src/__tests__/`), `mobile` (mobile-layout concept and `useIsMobile` hook), `pwa` (PWA subsystem), `state` (state files like `useAdState.js`), `api` (unused here), `ci` (CI pipeline). Context precedence: when a bare word appears as a user message on its own (or with a scope modifier like `docs branch`, `pwa staged`, `tests file <path>`), treat it as a **Triggers** invocation and run the analysis pass. When the same word appears inside a sentence or path (e.g. "update the docs", "fix the pwa manifest", "look at `src/config/`"), treat it as a normal reference to the folder/concept. Ambiguous cases — ask which was meant with numbered options.
- Implementation Patterns (Source of Truth) :: - Fetch via GitHub Pages: `curl -sf "https://gp-props.vercel.app/patterns/{PATTERN_NAME}.md"`
