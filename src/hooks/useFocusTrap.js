// Requirement: Trap Tab/Shift+Tab inside a container so keyboard users can't tab behind it.
// Approach: Intercepts Tab at first/last focusable boundaries and wraps around.
//   Only handles Tab trapping — initial focus and focus restore are handled by
//   useDisclosureFocus (the two hooks complement each other).
// Alternatives:
//   - Third-party focus-trap library: Rejected — adds dependency for simple behavior.
//   - Manual tabIndex management: Rejected — brittle, breaks when container content changes.

import { useEffect } from 'react'
import { handleDialogTabWrap } from '../utils/dialogFocus'

export function useFocusTrap(containerRef, isActive = true) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const handleKeyDown = (e) => {
      handleDialogTabWrap(e, containerRef.current)
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [isActive, containerRef])
}
