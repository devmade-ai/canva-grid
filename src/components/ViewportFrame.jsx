// Requirement: one owner per physical safe-area edge, with the inset outside
//   the visible rows and outside the in-flow column. A working shell (the
//   Sancio reference) does this with separate bands so each app keeps its
//   own header and nav.
// Approach: left/right bands flank the column. A bottom band sits under that
//   row, full width, so it is not nested inside a padded nav. Top is NOT
//   drawn here — the header of each layout owns it (a band inside the
//   header, or a sticky band above the desktop header) so the status-bar
//   area uses that header's background. Overlays that escape the column
//   (sheet, dialog, toast, debug pill) own their own edges and must not
//   add a second copy of a band they sit inside.
// Alternatives:
//   - body padding on all four edges: Rejected — below 1024px a width query
//     zeroed it (sides had no owner; the dock stayed full-bleed fixed) and
//     at >=1024px it stacked on DesktopLayout's own bottom padding.
//   - Padding inside the header row and the dock: Rejected for the dock,
//     which is position:fixed and covered the canvas; daisyUI also bakes
//     the bottom inset into both height and padding, which would stack on
//     this band.

const BAND_SIZE = {
  top: ['height', 'var(--safe-top)'],
  bottom: ['height', 'var(--safe-bottom)'],
  left: ['width', 'var(--safe-left)'],
  right: ['width', 'var(--safe-right)'],
}

export function InsetBand({ edge, className = '' }) {
  const [prop, value] = BAND_SIZE[edge]
  return (
    <div
      data-inset-band={edge}
      aria-hidden="true"
      className={`shrink-0 pointer-events-none ${className}`}
      style={{ [prop]: value }}
    />
  )
}

export default function ViewportFrame({ children, className = '', bottomClassName = '' }) {
  return (
    <div data-viewport-frame className={`flex flex-col w-full ${className}`}>
      <div className="flex flex-1 min-w-0 min-h-0">
        <InsetBand edge="left" />
        <div data-viewport-column className="flex flex-col flex-1 min-w-0 min-h-0">
          {children}
        </div>
        <InsetBand edge="right" />
      </div>
      <InsetBand edge="bottom" className={bottomClassName} />
    </div>
  )
}
