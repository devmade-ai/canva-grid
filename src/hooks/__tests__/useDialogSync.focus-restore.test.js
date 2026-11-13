/**
 * @jest-environment jsdom
 */
/* eslint-disable react-hooks/refs -- integration harness wires <dialog> and trap roots */
// Requirement: Explicit close (click/Enter) must restore opener focus like Escape.
// Regression: conditionally mounted KeyboardShortcutsOverlay called parent onClose
//   without dialog.close(), so the close listener never ran focus restore.
import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import { createElement, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import { fireEvent } from '@testing-library/react'
import { useDialogSync } from '../useDialogSync.js'

function OverlayHarness({ onParentClose }) {
  const dialogRef = useRef(null)
  const modalBoxRef = useRef(null)
  const { requestClose } = useDialogSync(dialogRef, true, onParentClose, undefined, {
    trapRootRef: modalBoxRef,
  })

  return createElement(
    'dialog',
    { ref: dialogRef },
    createElement(
      'div',
      { ref: modalBoxRef },
      createElement('button', {
        type: 'button',
        'aria-label': 'Close dialog',
        onClick: requestClose,
      }, 'Close'),
    ),
  )
}

describe('useDialogSync — requestClose focus restore', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    jest.useRealTimers()
  })

  test('requestClose restores opener even when parent unmounts on close', async () => {
    const opener = document.createElement('button')
    opener.id = 'opener'
    opener.textContent = 'Open'
    document.body.appendChild(opener)

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    let open = true
    const onParentClose = jest.fn(() => {
      open = false
      rerender()
    })

    function Shell() {
      if (!open) return null
      return createElement(OverlayHarness, { onParentClose })
    }

    function rerender() {
      return act(async () => {
        root.render(createElement(Shell))
      })
    }

    await act(async () => {
      opener.focus()
      root.render(createElement(Shell))
    })

    const dialog = container.querySelector('dialog')
    expect(dialog?.open).toBe(true)

    const closeBtn = container.querySelector('button[aria-label="Close dialog"]')
    await act(async () => {
      fireEvent.click(closeBtn)
    })

    expect(onParentClose).toHaveBeenCalledTimes(1)
    await act(async () => {
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    })
    expect(document.activeElement).toBe(opener)

    await act(async () => {
      root.unmount()
    })
    container.remove()
    opener.remove()
  })

  test('Shift+Tab from first control wraps to last inside trapRootRef', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    const onClose = jest.fn()

    function TrapHarness() {
      const dialogRef = useRef(null)
      const modalBoxRef = useRef(null)
      useDialogSync(dialogRef, true, onClose, undefined, { trapRootRef: modalBoxRef })

      return createElement(
        'dialog',
        { ref: dialogRef },
        createElement(
          'div',
          { ref: modalBoxRef },
          createElement('button', { id: 'first', type: 'button' }, 'First'),
          createElement('button', { id: 'last', type: 'button' }, 'Last'),
        ),
      )
    }

    await act(async () => {
      root.render(createElement(TrapHarness))
    })

    const first = document.getElementById('first')
    const last = document.getElementById('last')
    first.focus()

    await act(async () => {
      const ev = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      })
      document.dispatchEvent(ev)
    })

    expect(document.activeElement).toBe(last)

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })
})
