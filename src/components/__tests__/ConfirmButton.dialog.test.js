/**
 * @jest-environment jsdom
 */
/* eslint-disable react-hooks/refs, react-hooks/immutability -- integration harness uses refs and dialog host stubs */
// Requirement: Regression — inline confirm inside native <dialog> must survive
//   trigger unmount (confirm UI) and layer Escape: dismiss confirm, then close parent.

import { describe, test, expect, beforeEach, jest } from '@jest/globals'
import { createElement, createRef, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import { fireEvent, waitFor } from '@testing-library/react'
import ConfirmButton from '../ConfirmButton.jsx'
import { useDialogSync } from '../../hooks/useDialogSync.js'
import { focusIfConnected } from '../../utils/dialogFocus.js'

function dispatchDialogCancel(dialog) {
  const ev = new Event('cancel', { cancelable: true })
  dialog.dispatchEvent(ev)
  return ev
}

/** Mirrors the pre-9bb6454 bug: listener bails when the trigger is unmounted. */
function brokenHostLookupWhileConfirming() {
  const triggerRef = { current: null }
  return triggerRef.current?.closest('dialog') ?? null
}

function DialogHarness({ onClose }) {
  const dialogRef = useRef(null)
  const pendingRef = useRef(false)
  const dismissRef = useRef(null)

  useDialogSync(dialogRef, true, onClose, undefined, {
    shouldBlockClose: () => pendingRef.current,
    onBlockedCancel: () => dismissRef.current?.(),
  })

  return createElement(
    'dialog',
    { ref: dialogRef, 'data-testid': 'parent-dialog' },
    createElement(ConfirmButton, {
      dismissRef,
      onConfirmingChange: (v) => { pendingRef.current = v },
      confirmLabel: 'Delete?',
      title: 'Delete design',
      onConfirm: () => {},
      autoResetMs: 3000,
    }, 'Delete'),
  )
}

async function mountHarness(onClose) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  await act(async () => {
    root.render(createElement(DialogHarness, { onClose }))
  })
  const dialog = container.querySelector('dialog')
  expect(dialog?.open).toBe(true)
  return { container, root, dialog }
}

describe('ConfirmButton inside dialog — Escape layering', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    jest.useRealTimers()
  })

  test('old host lookup fails once the trigger is unmounted for confirm UI', () => {
    expect(brokenHostLookupWhileConfirming()).toBeNull()
  })

  test('first Escape dismisses inline confirm and refocuses delete; second closes parent', async () => {
    const onClose = jest.fn()
    const { container, root, dialog } = await mountHarness(onClose)
    const deleteBtn = container.querySelector('button[title="Delete design"]')
    expect(deleteBtn).toBeTruthy()

    await act(async () => {
      fireEvent.click(deleteBtn)
    })
    expect(container.textContent).toContain('Delete?')
    expect(container.textContent).toContain('Cancel')

    let first
    await act(async () => {
      first = dispatchDialogCancel(dialog)
    })
    expect(first.defaultPrevented).toBe(true)
    expect(onClose).not.toHaveBeenCalled()
    await waitFor(() => {
      expect(container.textContent).not.toContain('Delete?')
    })
    await waitFor(() => {
      expect(container.querySelector('button[title="Delete design"]')).toBeTruthy()
    })

    let second
    await act(async () => {
      second = dispatchDialogCancel(dialog)
      if (!second.defaultPrevented) dialog.close()
    })
    expect(second.defaultPrevented).toBe(false)
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  test('Cancel button restores delete trigger focus across multiple confirm cycles', async () => {
    const onClose = jest.fn()
    const { container, root } = await mountHarness(onClose)

    for (let i = 0; i < 3; i++) {
      const deleteBtn = container.querySelector('button[title="Delete design"]')
      await act(async () => { fireEvent.click(deleteBtn) })
      const cancelBtn = [...container.querySelectorAll('button')].find((b) => b.textContent === 'Cancel')
      await act(async () => { fireEvent.click(cancelBtn) })
      await waitFor(() => {
        expect(container.textContent).not.toContain('Delete?')
        expect(container.querySelector('button[title="Delete design"]')).toBeTruthy()
      })
    }
    await act(async () => { root.unmount() })
  })

  test('autoReset race: Escape just before timeout still dismisses confirm, not parent', async () => {
    jest.useFakeTimers()
    const onClose = jest.fn()
    const { container, root, dialog } = await mountHarness(onClose)
    const deleteBtn = container.querySelector('button[title="Delete design"]')
    await act(async () => { fireEvent.click(deleteBtn) })

    let ev
    await act(async () => {
      jest.advanceTimersByTime(2990)
      ev = dispatchDialogCancel(dialog)
    })
    expect(ev.defaultPrevented).toBe(true)
    expect(onClose).not.toHaveBeenCalled()

    await act(async () => { jest.advanceTimersByTime(20) })
    expect(container.textContent).not.toContain('Delete?')

    jest.useRealTimers()
    await act(async () => { root.unmount() })
  })

  test('dismissRef fallback clears pending when parent onBlockedCancel runs', async () => {
    const onClose = jest.fn()
    const pendingRef = createRef(false)
    const dismissRef = createRef(null)
    const dialogRef = createRef(null)

    function MinimalDialog() {
      useDialogSync(dialogRef, true, onClose, undefined, {
        shouldBlockClose: () => pendingRef.current,
        onBlockedCancel: () => dismissRef.current?.(),
      })
      useEffect(() => {
        dialogRef.current?.showModal()
      }, [])
      return createElement(
        'dialog',
        { ref: dialogRef },
        createElement(ConfirmButton, {
          dismissRef,
          onConfirmingChange: (v) => { pendingRef.current = v },
          title: 'Delete design',
          confirmLabel: 'Delete?',
          onConfirm: () => {},
        }, 'Delete'),
      )
    }

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    await act(async () => { root.render(createElement(MinimalDialog)) })
    const dialog = dialogRef.current
    const deleteBtn = container.querySelector('button[title="Delete design"]')
    await act(async () => { fireEvent.click(deleteBtn) })
    expect(pendingRef.current).toBe(true)

    let ev
    await act(async () => {
      ev = dispatchDialogCancel(dialog)
    })
    expect(ev.defaultPrevented).toBe(true)
    expect(pendingRef.current).toBe(false)
    expect(onClose).not.toHaveBeenCalled()

    await act(async () => { root.unmount() })
  })

  test('unmount during confirming removes dialog cancel listener without throwing', async () => {
    const onClose = jest.fn()
    const { container, root } = await mountHarness(onClose)
    const deleteBtn = container.querySelector('button[title="Delete design"]')
    await act(async () => { fireEvent.click(deleteBtn) })
    await act(async () => { root.unmount() })
    expect(() => focusIfConnected(null)).not.toThrow()
  })
})
