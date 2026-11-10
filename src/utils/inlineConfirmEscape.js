// Requirement: Inline confirm inside <dialog> must keep cancel handler after trigger unmount.
// Approach: Capture dialog host before swapping trigger UI; bind cancel in capture phase.
// Alternatives:
//   - Lookup host from triggerRef after unmount: Rejected — ref cleared, listener never attaches.

/**
 * @param {Element | null | undefined} triggerEl
 * @param {Element | null | undefined} rootEl
 * @returns {HTMLDialogElement | null}
 */
export function captureDialogHost(triggerEl, rootEl) {
  const fromTrigger = triggerEl?.closest?.('dialog')
  if (fromTrigger instanceof HTMLDialogElement) return fromTrigger
  const fromRoot = rootEl?.closest?.('dialog')
  if (fromRoot instanceof HTMLDialogElement) return fromRoot
  return null
}

/**
 * @param {HTMLDialogElement | null | undefined} host
 * @param {() => void} onDismiss
 * @returns {() => void}
 */
export function bindDialogCancelDismiss(host, onDismiss) {
  if (!host) return () => {}
  const onCancel = (e) => {
    e.preventDefault()
    onDismiss()
  }
  host.addEventListener('cancel', onCancel, true)
  return () => host.removeEventListener('cancel', onCancel, true)
}
