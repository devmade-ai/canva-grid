// Requirement: Sync native <dialog> open/close with React state across all DaisyUI modals.
// Approach: Shared hook eliminates duplicated dialog sync code from 4 modal components.
//   Callback refs keep listener effect stable — SaveLoadModal stays mounted with inline
//   onClose/options; re-attaching listeners must not call dialog.close() on cleanup.
// Alternatives:
//   - Inline useEffect in each modal: Rejected — identical pattern duplicated 4 times.
//   - Deps on onClose/options: Rejected — caused production Save/Load flash-close (PR166).

import { useEffect, useLayoutEffect, useCallback, useRef } from 'react'
import { focusIfConnected } from '../utils/dialogFocus'
import { useFocusTrap } from './useFocusTrap'

/**
 * @param {React.RefObject} dialogRef - Ref to the <dialog> element
 * @param {boolean} isOpen - Whether the dialog should be open
 * @param {Function} onClose - Called when the dialog closes (Escape, backdrop click)
 * @param {Function} [onOpen] - Optional callback fired when dialog opens (e.g., reset state)
 * @param {{ shouldBlockClose?: () => boolean, onBlockedCancel?: () => void, trapRootRef?: React.RefObject<Element | null> }} [options]
 */
export function useDialogSync(dialogRef, isOpen, onClose, onOpen, options) {
  const trapRootRef = options?.trapRootRef ?? dialogRef
  useFocusTrap(trapRootRef, isOpen)

  const openerRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const onOpenRef = useRef(onOpen)
  const shouldBlockCloseRef = useRef(options?.shouldBlockClose)
  const onBlockedCancelRef = useRef(options?.onBlockedCancel)

  // Sync latest callbacks after commit — avoids render-phase ref writes (react-hooks/refs)
  // and keeps listener effect deps stable so always-mounted modals are not flash-closed.
  useLayoutEffect(() => {
    onCloseRef.current = onClose
    onOpenRef.current = onOpen
    shouldBlockCloseRef.current = options?.shouldBlockClose
    onBlockedCancelRef.current = options?.onBlockedCancel
  })

  // Sync React isOpen → native dialog.showModal()/close()
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) {
      onOpenRef.current?.()
      openerRef.current = document.activeElement
      dialog.showModal()
    } else if (!isOpen && dialog.open) {
      dialog.close()
    }
  }, [isOpen, dialogRef])

  // Native close/cancel listeners — attach once per dialog node; never close on effect cleanup
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleClose = () => {
      const opener = openerRef.current
      onCloseRef.current()
      requestAnimationFrame(() => focusIfConnected(opener))
    }

    const handleCancel = (e) => {
      if (!shouldBlockCloseRef.current?.()) return
      e.preventDefault()
      onBlockedCancelRef.current?.()
    }

    dialog.addEventListener('close', handleClose)
    dialog.addEventListener('cancel', handleCancel)
    return () => {
      dialog.removeEventListener('close', handleClose)
      dialog.removeEventListener('cancel', handleCancel)
    }
  }, [dialogRef])

  // Requirement: Every dismiss path must call dialog.close() so the native `close`
  // event runs opener restore (Enter/click on Close, Got it, backdrop — not only Escape).
  // Approach: requestClose → dialog.close() → handleClose → onClose + rAF focus restore.
  // Alternatives:
  //   - Parent onClose only: Rejected — conditionally mounted overlays unmount before close fires.
  const requestClose = useCallback(() => {
    const dialog = dialogRef.current
    if (dialog?.open) dialog.close()
    else onCloseRef.current()
  }, [dialogRef])

  const handleBackdropClick = useCallback((e) => {
    if (e.target === dialogRef.current) requestClose()
  }, [dialogRef, requestClose])

  return { handleBackdropClick, requestClose }
}
