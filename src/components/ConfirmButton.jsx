// Requirement: Replace browser confirm() with accessible inline confirmations.
// Approach: Two-state button — first click shows confirmation with consequence text,
//   second click executes the action. Auto-resets after 3 seconds if user doesn't confirm.
//   Stable root wrapper keeps dialog host identity while the trigger is unmounted for
//   confirm UI; dialog host is captured before that swap. Capture-phase cancel handler
//   dismisses inline confirm before the parent modal's bubble handler runs.
// Alternatives:
//   - Modal dialog: Rejected — too heavy for simple destructive actions.
//   - Browser confirm(): Rejected — not accessible, ugly, no styling control.

import { useState, useEffect, useCallback, useRef } from 'react'
import { focusIfConnected } from '../utils/dialogFocus'
import { bindDialogCancelDismiss, captureDialogHost } from '../utils/inlineConfirmEscape'

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
  dismissRef,
}) {
  const [confirming, setConfirming] = useState(false)
  const confirmingRef = useRef(false)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const dialogHostRef = useRef(null)
  const focusReturnRef = useRef(null)

  useEffect(() => {
    confirmingRef.current = confirming
  }, [confirming])

  const setConfirmingState = useCallback((next) => {
    setConfirming(next)
    onConfirmingChange?.(next)
    if (!next) {
      dialogHostRef.current = null
    }
  }, [onConfirmingChange])

  const dismissConfirming = useCallback(() => {
    if (!confirmingRef.current) return false
    setConfirmingState(false)
    requestAnimationFrame(() => focusIfConnected(triggerRef.current ?? focusReturnRef.current))
    return true
  }, [setConfirmingState])

  useEffect(() => {
    if (!dismissRef || !confirming) return
    dismissRef.current = dismissConfirming
    return () => {
      if (dismissRef.current === dismissConfirming) dismissRef.current = null
    }
  }, [dismissRef, confirming, dismissConfirming])

  // Auto-reset after timeout so the button doesn't stay in confirm state forever
  useEffect(() => {
    if (!confirming || autoResetMs <= 0) return
    const timer = setTimeout(() => setConfirmingState(false), autoResetMs)
    return () => clearTimeout(timer)
  }, [confirming, autoResetMs, setConfirmingState])

  // Parent <dialog> cancel — host captured before trigger unmounts (see enterConfirming)
  useEffect(() => {
    if (!confirming) return
    const host = dialogHostRef.current
    const unbind = bindDialogCancelDismiss(host, () => {
      setConfirmingState(false)
      requestAnimationFrame(() => focusIfConnected(triggerRef.current ?? focusReturnRef.current))
    })
    return unbind
  }, [confirming, setConfirmingState])

  const enterConfirming = useCallback(() => {
    const host = captureDialogHost(triggerRef.current, rootRef.current)
    dialogHostRef.current = host
    focusReturnRef.current = triggerRef.current
    setConfirmingState(true)
  }, [setConfirmingState])

  const cancelConfirm = useCallback((e) => {
    e.stopPropagation()
    setConfirmingState(false)
    requestAnimationFrame(() => focusIfConnected(triggerRef.current ?? focusReturnRef.current))
  }, [setConfirmingState])

  const handleClick = useCallback((e) => {
    e.stopPropagation()
    if (confirming) {
      setConfirmingState(false)
      onConfirm?.(e)
    } else {
      enterConfirming()
    }
  }, [confirming, onConfirm, setConfirmingState, enterConfirming])

  return (
    <span ref={rootRef} className="inline-flex shrink-0" onClick={(e) => e.stopPropagation()}>
      {confirming ? (
        <span className="flex items-center gap-1">
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
        </span>
      ) : (
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
      )}
    </span>
  )
}
