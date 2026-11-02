import { TEXT_FIT_WARNING } from '../utils/textFitStatus'

// Requirement: A short plain-words warning on the field once text is as small
// as it can be and still doesn't fit the cell.
// Approach: One status line under that field. No size jargon.
// Alternatives:
//   - Toast: Rejected — it disappears, and it isn't next to the text the user is editing.
export default function TextFitWarning({ id, show }) {
  if (!show) return null
  return (
    <p id={id} role="status" className="text-sm text-warning">
      {TEXT_FIT_WARNING}
    </p>
  )
}
