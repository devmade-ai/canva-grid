// Requirement: Replace browser confirm() with accessible inline confirmations.
// Approach: Two-state button — first click shows confirmation with consequence text,
//   second click executes the action. Auto-resets after 3 seconds if user doesn't confirm.
//   While confirming, traps dialog Escape to cancel the pending delete before closing
//   the parent modal; Cancel restores focus to the trigger button.
// Alternatives:
//   - Modal dialog: Rejected — too heavy for simple destructive actions.
//   - Browser confirm(): Rejected — not accessible, ugly, no styling control.

import { useState, useEffect, useCallback, useRef } from 'react'
import { focusIfConnected } from '../utils/dialogFocus'

export default function ConfirmButton({
  onConfirm,
  children,
  confirmLabel = 'Confirm?',
  className = '',
  confirmClassName = '',
  disabled = false,
  title,
  autoResetMs = 3000,
  onConfirmingChange,
}) {
  const [confirming, setConfirming] = useState(false)
  const triggerRef = useRef(null)

  const setConfirmingState = useCallback((next) => {
    setConfirming(next)
    onConfirmingChange?.(next)
  }, [onConfirmingChange])

  // Auto-reset after timeout so the button doesn't stay in confirm state forever
  useEffect(() => {
    if (!confirming || autoResetMs <= 0) return
    const timer = setTimeout(() => setConfirmingState(false), autoResetMs)
    return () => clearTimeout(timer)
  }, [confirming, autoResetMs, setConfirmingState])

  // Parent <dialog> Escape: cancel pending confirm before the modal closes
  useEffect(() => {
    if (!confirming) return
    const host = triggerRef.current?.closest('dialog')
    if (!host) return
    const onCancel = (e) => {
      e.preventDefault()
      setConfirmingState(false)
      requestAnimationFrame(() => focusIfConnected(triggerRef.current))
    }
    host.addEventListener('cancel', onCancel)
    return () => host.removeEventListener('cancel', onCancel)
  }, [confirming, setConfirmingState])

  const cancelConfirm = useCallback((e) => {
    e.stopPropagation()
    setConfirmingState(false)
    requestAnimationFrame(() => focusIfConnected(triggerRef.current))
  }, [setConfirmingState])

  const handleClick = useCallback((e) => {
    e.stopPropagation()
    if (confirming) {
      setConfirmingState(false)
      onConfirm?.(e)
    } else {
      setConfirmingState(true)
    }
  }, [confirming, onConfirm, setConfirmingState])

  if (confirming) {
    return (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={handleClick}
          className={confirmClassName || 'btn btn-error btn-xs'}
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          onClick={cancelConfirm}
          className="btn btn-ghost btn-xs"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title={title}
      className={className}
    >
      {children}
    </button>
  )
}
