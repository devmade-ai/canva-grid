/**
 * @jest-environment jsdom
 */
import { describe, test, expect, jest } from '@jest/globals'
import { captureDialogHost, bindDialogCancelDismiss } from '../inlineConfirmEscape.js'

describe('inlineConfirmEscape', () => {
  test('captureDialogHost uses stable root when trigger is null (unmounted)', () => {
    document.body.innerHTML = '<dialog id="d"><span id="root"></span></dialog>'
    const root = document.getElementById('root')
    expect(captureDialogHost(null, root)?.id).toBe('d')
    expect(captureDialogHost(null, root)?.id).toBe('d')
  })

  test('bindDialogCancelDismiss prevents close and runs dismiss', () => {
    document.body.innerHTML = '<dialog id="d"></dialog>'
    const dialog = document.getElementById('d')
    const dismiss = jest.fn()
    const unbind = bindDialogCancelDismiss(dialog, dismiss)
    const ev = new Event('cancel', { cancelable: true })
    dialog.dispatchEvent(ev)
    expect(ev.defaultPrevented).toBe(true)
    expect(dismiss).toHaveBeenCalledTimes(1)
    unbind()
    const ev2 = new Event('cancel', { cancelable: true })
    dialog.dispatchEvent(ev2)
    expect(dismiss).toHaveBeenCalledTimes(1)
  })
})
