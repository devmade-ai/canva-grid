// Requirement: Long text must shrink until it fits its cell, down to a readable floor,
// and export must capture that same size (the preview DOM is what gets downloaded).
// Approach: Binary-search the largest text's pixel size. Every text node in the cell
// shares that scale so title stays larger than body. 12px is the floor — below that,
// type in the downloaded image is hard to read, so we stop and let the editor warn.
// Alternatives:
//   - Character cap in the textarea: Rejected — a cap that fits a square fails on a banner.
//   - CSS transform on the text block: Rejected — lines don't reflow, so the download
//     is a shrunken block of the original wrapping with empty space beside it.
//   - scrollHeight on the flex wrapper: Rejected — centered text overflows both ends
//     and scrollHeight often stays equal to the box, so the overflow is invisible to it.

export const MIN_FIT_PX = 12

export function fontSizeAtScale(basePx, scale) {
  const base = Number(basePx) || 0
  if (base <= MIN_FIT_PX) return base
  return Math.max(MIN_FIT_PX, Math.round(base * scale))
}

export function trackingAtScale(basePx, scale) {
  const base = Number(basePx) || 0
  if (base === 0) return 0
  return base * scale
}

/**
 * Largest integer px in [minPx, largestPx] where fits(px) is true.
 * fits must be monotonic: a size that fits implies every smaller size fits.
 * @returns {{ px: number, overflowsAtMin: boolean }}
 */
export function largestFittingPx(fits, largestPx, minPx) {
  const largest = Math.round(Number(largestPx) || 0)
  if (largest <= 0) return { px: largest, overflowsAtMin: false }
  const floor = Math.min(largest, Math.round(Number(minPx) || 0))
  if (fits(largest)) return { px: largest, overflowsAtMin: false }
  if (floor >= largest || !fits(floor)) return { px: floor, overflowsAtMin: true }

  let lo = floor
  let hi = largest - 1
  let best = floor
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (fits(mid)) {
      best = mid
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }
  return { px: best, overflowsAtMin: false }
}

function applyScale(nodes, scale) {
  for (const node of nodes) {
    const base = Number(node.getAttribute('data-fit-base')) || 0
    node.style.fontSize = `${fontSizeAtScale(base, scale)}px`
    const tracking = node.getAttribute('data-fit-tracking')
    if (tracking != null) {
      node.style.letterSpacing = `${trackingAtScale(tracking, scale)}px`
    }
  }
}

// Sum of the children, not the wrapper's scrollHeight. Centered flex items
// hang out of both ends; scrollHeight misses the top half of that overflow.
export function contentOverflows(wrapper) {
  const style = getComputedStyle(wrapper)
  const available = wrapper.clientHeight
    - (parseFloat(style.paddingTop) || 0)
    - (parseFloat(style.paddingBottom) || 0)
  if (available <= 0) return true
  let used = 0
  for (const child of wrapper.children) {
    const childStyle = getComputedStyle(child)
    used += child.offsetHeight
      + (parseFloat(childStyle.marginTop) || 0)
      + (parseFloat(childStyle.marginBottom) || 0)
  }
  return used > available + 1
}

/**
 * Shrink every [data-fit-base] node inside a cell frame by one shared scale.
 * Leaves the DOM at the chosen size. Returns scale 1 when nothing needs to shrink.
 */
export function fitFrame(frame) {
  const nodes = [...frame.querySelectorAll('[data-fit-base]')]
  if (nodes.length === 0) return { scale: 1, overflowsAtMin: false }
  const largest = Math.max(...nodes.map((node) => Number(node.getAttribute('data-fit-base')) || 0))
  if (largest <= 0) return { scale: 1, overflowsAtMin: false }

  const fits = (px) => {
    applyScale(nodes, px / largest)
    return !contentOverflows(frame)
  }
  const { px, overflowsAtMin } = largestFittingPx(fits, largest, MIN_FIT_PX)
  const scale = px / largest
  applyScale(nodes, scale)
  return { scale, overflowsAtMin }
}
