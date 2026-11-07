import { useEffect, useState } from 'react'

const QUERY = '(pointer: coarse)'

function readCoarse() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia(QUERY).matches
}

// Requirement: Know when the pointer is coarse so the context-bar minimap can
//   cap its height and scroll, instead of locking a 64px grid that makes cells
//   ~31px tall. CSS min-size alone cannot drop that inline height.
// Approach: matchMedia listener. Missing matchMedia (Jest's node environment)
//   stays false, so existing tests keep the fine-pointer layout.
// Alternatives:
//   - Reuse useIsMobile: Rejected — width and pointer are different axes. A
//     touchscreen desktop is coarse; a fine-pointer phone window is not.
//   - CSS-only max-height: Rejected — the inline height would still clip cells
//     unless the component stops setting it.
export function useCoarsePointer() {
  const [coarse, setCoarse] = useState(readCoarse)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined
    const mq = window.matchMedia(QUERY)
    const onChange = () => setCoarse(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return coarse
}
