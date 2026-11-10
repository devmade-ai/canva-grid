// Requirement: Shared focusable discovery + Tab wrap for native <dialog> modals.
// Approach: Pure DOM helpers testable in Jest; useFocusTrap and useDialogSync
//   both import the same selector so boundary detection stays consistent.
// Alternatives:
//   - Rely on UA dialog focus cycles only: Rejected — single-focusable dialogs
//     and Tab from the last control leave the modal in Chromium.
//   - focus-trap-react: Rejected — extra dependency for a few lines.

export const DIALOG_FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * @param {ParentNode | null | undefined} root
 * @returns {HTMLElement[]}
 */
export function getDialogTabbables(root) {
  if (!root) return []
  return Array.from(root.querySelectorAll(DIALOG_FOCUSABLE)).filter(
    (el) => !el.closest('[inert]'),
  )
}

/**
 * @param {KeyboardEvent} e
 * @param {ParentNode | null | undefined} root
 * @returns {boolean} true when default was prevented (wrapped focus)
 */
export function handleDialogTabWrap(e, root) {
  if (e.key !== 'Tab') return false
  const elements = getDialogTabbables(root)
  if (elements.length === 0) return false

  const first = elements[0]
  const last = elements[elements.length - 1]
  const active = document.activeElement

  if (e.shiftKey) {
    if (active === first || !root.contains(active)) {
      e.preventDefault()
      last.focus()
      return true
    }
  } else if (active === last || !root.contains(active)) {
    e.preventDefault()
    first.focus()
    return true
  }
  return false
}

/**
 * @param {Element | null | undefined} el
 */
export function focusIfConnected(el) {
  if (el && typeof el.focus === 'function' && document.contains(el)) {
    try {
      el.focus({ preventScroll: true })
    } catch {
      el.focus()
    }
  }
}
