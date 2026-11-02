// Requirement: The editor warns when a cell's text is as small as it can be and still
// doesn't fit. The measurement lives on the canvas (the DOM export captures).
// Approach: A tiny store the canvas publishes and the text fields subscribe to.
//   Avoids threading a callback through App and both layouts for one boolean.
// Alternatives:
//   - Callback prop on AdCanvas: Rejected — three layouts would all have to forward it.
//   - Read the canvas DOM from the editor: Rejected — the editor doesn't own that node.

export const TEXT_FIT_WARNING = "Too much text to fit. It's as small as it can be. Shorten it so nothing gets cut off."

let overflowCells = new Set()
const listeners = new Set()

function notify() {
  for (const listener of listeners) listener()
}

function sameIds(next) {
  if (next.size !== overflowCells.size) return false
  for (const id of next) {
    if (!overflowCells.has(id)) return false
  }
  return true
}

/** @param {Record<string, boolean>} overflowByCell */
export function publishTextFit(overflowByCell) {
  const next = new Set()
  for (const [id, overflows] of Object.entries(overflowByCell || {})) {
    if (overflows) next.add(String(id))
  }
  if (sameIds(next)) return
  overflowCells = next
  notify()
}

export function cellTextOverflows(cellIndex) {
  return overflowCells.has(String(cellIndex))
}

export function subscribeTextFit(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Test helper — the store is process-wide. */
export function resetTextFitStatus() {
  overflowCells = new Set()
  notify()
}
