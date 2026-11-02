import { TEXT_FIT_WARNING } from '../utils/textFitStatus'

// Requirement: The warning must be readable on every app theme, and a cell
//   must announce it once. text-warning on the light themes is yellow on white
//   (about 1.7:1), which fails 4.5:1 at 14px.
// Approach: One solid chip per cell, using DaisyUI's warning background with
//   its paired content color. role="status" lives on this single element.
//   Each overflowing field points at it with aria-describedby.
// Alternatives:
//   - text-warning on the page background: Rejected — fails contrast on fantasy and lofi.
//   - A chip under every field: Rejected — each chip would be its own live region,
//     so a screen reader announces the same sentence once per field.
export default function TextFitWarning({ id, show }) {
  if (!show) return null
  return (
    <p id={id} role="status" className="text-sm bg-warning text-warning-content rounded-lg px-3 py-2">
      {TEXT_FIT_WARNING}
    </p>
  )
}
