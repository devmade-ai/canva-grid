/**
 * @jest-environment jsdom
 */
/* eslint-disable react-hooks/refs -- harness wires dialog/load-row refs for integration */
// Requirement: Load-row Enter must not invoke handleLoad when focus is on nested Delete.
// Regression: row onKeyDown fired on bubbled Enter while Delete used keyboard activation,
//   which called handleLoad → onClose (matches live Enter-on-Delete closing parent).

import { describe, test, expect, jest } from '@jest/globals'
import { createElement, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { act, fireEvent } from '@testing-library/react'
import ConfirmButton from '../ConfirmButton.jsx'
import { useDialogSync } from '../../hooks/useDialogSync.js'

function brokenRowHandler(onLoad) {
  return (e) => {
    if (e.key === 'Enter') onLoad()
  }
}

function fixedRowHandler(onLoad) {
  return (e) => {
    if (e.key === 'Enter' && e.target === e.currentTarget) onLoad()
  }
}

function RowHarness({ onRowKeyDown, onClose }) {
  const dialogRef = useRef(null)
  useDialogSync(dialogRef, true, onClose, undefined, {
    shouldBlockClose: () => false,
    onBlockedCancel: () => {},
  })
  return createElement(
    'dialog',
    { ref: dialogRef, open: true },
    createElement(
      'div',
      {
        role: 'button',
        tabIndex: 0,
        'data-testid': 'load-row',
        onKeyDown: onRowKeyDown,
      },
      createElement(
        ConfirmButton,
        { title: 'Delete design', confirmLabel: 'Delete?', onConfirm: () => {} },
        'Del',
      ),
    ),
  )
}

describe('SaveLoad Load row — Enter from Delete', () => {
  test('pre-fix row handler: bubbled Enter invoked load (documents live bug)', () => {
    const onLoad = jest.fn()
    const row = document.createElement('div')
    row.setAttribute('role', 'button')
    row.addEventListener('keydown', brokenRowHandler(onLoad))
    const del = document.createElement('button')
    del.type = 'button'
    row.appendChild(del)
    document.body.appendChild(row)
    del.focus()
    fireEvent.keyDown(del, { key: 'Enter', bubbles: true })
    expect(onLoad).toHaveBeenCalledTimes(1)
    row.remove()
  })

  test('fixed row handler: Enter on Delete does not load or close parent dialog', async () => {
    const onLoad = jest.fn()
    const onClose = jest.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    await act(async () => {
      root.render(
        createElement(RowHarness, {
          onRowKeyDown: fixedRowHandler(onLoad),
          onClose,
        }),
      )
    })
    const del = container.querySelector('button[title="Delete design"]')
    del.focus()
    await act(async () => {
      fireEvent.keyDown(del, { key: 'Enter', bubbles: true })
    })
    expect(onLoad).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
    await act(async () => {
      fireEvent.click(del)
    })
    expect(container.textContent).toContain('Delete?')

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  test('confirm UI stays open for 2s (before autoReset) without parent close', async () => {
    jest.useFakeTimers()
    const onClose = jest.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    await act(async () => {
      root.render(
        createElement(RowHarness, {
          onRowKeyDown: fixedRowHandler(jest.fn()),
          onClose,
        }),
      )
    })
    const del = container.querySelector('button[title="Delete design"]')
    await act(async () => {
      fireEvent.click(del)
    })
    await act(async () => {
      jest.advanceTimersByTime(2000)
    })
    expect(container.textContent).toContain('Delete?')
    expect(onClose).not.toHaveBeenCalled()
    jest.useRealTimers()
    await act(async () => {
      root.unmount()
    })
    container.remove()
  })
})
