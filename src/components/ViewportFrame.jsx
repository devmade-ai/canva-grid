// Requirement: one shell, matching Sancio. The root is the measured
//   viewport. A direct env(safe-area-inset-top) band sits above the header
//   and paints the header color. The header and the band are outside the
//   scroller. Side insets are body padding, one copy. The bottom safe area
//   belongs to the fixed nav when there is one, and to the canvas padding
//   when there is not.
// Alternatives:
//   - Four in-flow bands fed by custom properties: Rejected — the deployed
//     column still left the nav off the bottom edge, and the top inset was
//     a variable rather than the direct env() Sancio paints.
//   - Padding the header row by the top inset: Rejected — that changes the
//     row whenever the inset changes. The band is the inset. The row is not.

export default function ViewportFrame({ children, className = '', nav = false }) {
  return (
    <div data-viewport-frame className={`shell-root w-full ${nav ? 'shell-has-nav' : ''} ${className}`}>
      <div data-inset-band="top" aria-hidden="true" className="shell-safe-top pointer-events-none bg-base-100" />
      {children}
    </div>
  )
}
