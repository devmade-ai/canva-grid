/**
 * @jest-environment jsdom
 */
// Requirement: Always-mounted modals (Save/Load) pass fresh inline callbacks each render.
// Regression: listener effect cleanup used to dialog.close() when onClose identity changed.
import { describe, test, expect, jest } from '@jest/globals'
import { createElement, useState, useRef, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import { useDialogSync } from '../useDialogSync.js'

function PersistHarness({ isOpen }) {
  const dialogRef = useRef(null)
  const [, setTick] = useState(0)
  const onClose = jest.fn()

  useDialogSync(dialogRef, isOpen, onClose, undefined, {
    shouldBlockClose: () => false,
    onBlockedCancel: () => {},
  })

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 5)
    return () => clearInterval(id)
  }, [])

  // eslint-disable-next-line react-hooks/refs -- integration harness must wire <dialog> ref
  return createElement('dialog', { ref: dialogRef, 'data-testid': 'dlg' }, 'open')
}

describe('useDialogSync — open persistence', () => {
  test('dialog stays open across re-renders with new callback identities', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    await act(async () => {
      root.render(createElement(PersistHarness, { isOpen: true }))
    })
    const dialog = container.querySelector('dialog')
    expect(dialog?.open).toBe(true)

    await act(async () => {
      await new Promise((r) => setTimeout(r, 80))
    })
    expect(dialog?.open).toBe(true)

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  test('native close uses the latest onClose after identity swap', async () => {
    const first = jest.fn()
    const second = jest.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    function Harness({ onClose }) {
      const dialogRef = useRef(null)
      useDialogSync(dialogRef, true, onClose, undefined)
      // eslint-disable-next-line react-hooks/refs -- integration harness must wire <dialog> ref
      return createElement('dialog', { ref: dialogRef })
    }

    await act(async () => {
      root.render(createElement(Harness, { onClose: first }))
    })
    const dialog = container.querySelector('dialog')
    expect(dialog?.open).toBe(true)

    await act(async () => {
      root.render(createElement(Harness, { onClose: second }))
    })

    await act(async () => {
      dialog.dispatchEvent(new Event('close'))
    })
    expect(second).toHaveBeenCalledTimes(1)
    expect(first).not.toHaveBeenCalled()

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })
})
