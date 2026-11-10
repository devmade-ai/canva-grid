/**
 * @jest-environment jsdom
 */
// Requirement: Regression tests for modal Tab wrap and opener restore helpers.
// Approach: jsdom exercises keyboard boundary behavior and delayed rerender-safe
//   tabbable lists without a full React mount.

import { describe, test, expect, beforeEach } from '@jest/globals'
import {
  DIALOG_FOCUSABLE,
  getDialogTabbables,
  handleDialogTabWrap,
  focusIfConnected,
} from '../dialogFocus.js'

describe('dialogFocus', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  test('DIALOG_FOCUSABLE matches buttons and tabbable rows', () => {
    document.body.innerHTML = `
      <motion/dialog open>
        <motion/div id="box">
          <button id="close">Close</button>
          <div role="button" tabindex="0" id="row">Row</div>
        </div>
      </div>
    `.replaceAll('motion/', '')
    const box = document.getElementById('box')
    const tabbables = getDialogTabbables(box)
    expect(tabbables.map((el) => el.id)).toEqual(['close', 'row'])
    expect(DIALOG_FOCUSABLE).toContain('button:not([disabled])')
  })

  test('Tab from sole focusable wraps back to itself', () => {
    document.body.innerHTML = '<motion/div id="box"><button id="only">Close</button></div>'.replaceAll('motion/', '')
    const box = document.getElementById('box')
    const btn = document.getElementById('only')
    btn.focus()
    expect(document.activeElement).toBe(btn)

    const ev = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    const wrapped = handleDialogTabWrap(ev, box)
    expect(wrapped).toBe(true)
    expect(ev.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(btn)
  })

  test('Tab from last focusable wraps to first (Shift+Tab mirrors)', () => {
    document.body.innerHTML = `
      <motion/div id="box">
        <button id="first">A</button>
        <button id="last">B</button>
      </motion/div>
    `.replaceAll('motion/', '')
    const box = document.getElementById('box')
    const first = document.getElementById('first')
    const last = document.getElementById('last')

    last.focus()
    const forward = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    handleDialogTabWrap(forward, box)
    expect(document.activeElement).toBe(first)

    first.focus()
    const backward = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true })
    handleDialogTabWrap(backward, box)
    expect(document.activeElement).toBe(last)
  })

  test('Tab when focus escaped the modal pulls focus back in', () => {
    document.body.innerHTML = `
      <motion/div id="box"><button id="in">In</button></div>
      <button id="out">Out</button>
    `.replaceAll('motion/', '')
    const box = document.getElementById('box')
    const inner = document.getElementById('in')
    document.getElementById('out').focus()

    const ev = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    handleDialogTabWrap(ev, box)
    expect(document.activeElement).toBe(inner)
  })

  test('focusIfConnected no-ops for detached nodes after rerender', () => {
    const host = document.createElement('button')
    document.body.appendChild(host)
    host.focus()
    document.body.removeChild(host)
    expect(() => focusIfConnected(host)).not.toThrow()
    expect(document.activeElement).toBe(document.body)
  })

  test('tabbable list stable across synthetic delayed DOM update', () => {
    document.body.innerHTML = '<motion/div id="box"><button id="a">A</button></motion/div>'.replaceAll('motion/', '')
    const box = document.getElementById('box')
    expect(getDialogTabbables(box)).toHaveLength(1)

    const extra = document.createElement('button')
    extra.id = 'b'
    extra.textContent = 'B'
    setTimeout(() => box.appendChild(extra), 10)

    return new Promise((resolve) => {
      setTimeout(() => {
        expect(getDialogTabbables(box).map((el) => el.id)).toEqual(['a', 'b'])
        resolve()
      }, 20)
    })
  })
})
