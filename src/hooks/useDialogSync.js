// Requirement: Sync native <dialog> open/close with React state across all DaisyUI modals.
// Approach: Shared hook eliminates duplicated dialog sync code from 4 modal components.
//   Handles showModal()/close(), native close event (Escape key), backdrop click,
//   opener focus restore, and optional cancel blocking for nested inline confirms.
// Alternatives:
//   - Inline useEffect in each modal: Rejected — identical pattern duplicated 4 times.
//   - Third-party modal library: Rejected — adds dependency for simple native <dialog> sync.

import { useEffect, useCallback, useRef } from 'react'
import { focusIfConnected } from '../utils/dialogFocus'

/**
 * @param {React.RefObject} dialogRef - Ref to the <dialog> element
 * @param {boolean} isOpen - Whether the dialog should be open
 * @param {Function} onClose - Called when the dialog closes (Escape, backdrop click)
 * @param {Function} [onOpen] - Optional callback fired when dialog opens (e.g., reset state)
 * @param {{ shouldBlockClose?: () => boolean, onBlockedCancel?: () => void }} [options]
 */
export function useDialogSync(dialogRef, isOpen, onClose, onOpen, options) {
  const openerRef = useRef(null)
  const shouldBlockClose = options?.shouldBlockClose
  const onBlockedCancel = options?.onBlockedCancel

  // Sync React isOpen → native dialog.showModal()/close()
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) {
      onOpen?.()
      openerRef.current = document.activeElement
      dialog.showModal()
    } else if (!isOpen && dialog.open) {
      dialog.close()
    }
  }, [isOpen, dialogRef, onOpen])

  // Sync native close → React state; block Escape when inline confirm is pending
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleClose = () => {
      const opener = openerRef.current
      onClose()
      requestAnimationFrame(() => focusIfConnected(opener))
    }

    const handleCancel = (e) => {
      if (!shouldBlockClose?.()) return
      e.preventDefault()
      onBlockedCancel?.()
    }

    dialog.addEventListener('close', handleClose)
    dialog.addEventListener('cancel', handleCancel)
    return () => {
      dialog.removeEventListener('close', handleClose)
      dialog.removeEventListener('cancel', handleCancel)
      if (dialog.open) {
        const opener = openerRef.current
        dialog.close()
        focusIfConnected(opener)
      }
    }
  }, [onClose, dialogRef, shouldBlockClose, onBlockedCancel])

  // Backdrop click handler — close when clicking the <dialog> backdrop (not modal-box)
  const handleBackdropClick = useCallback((e) => {
    if (e.target === dialogRef.current) onClose()
  }, [onClose, dialogRef])

  return { handleBackdropClick }
}
