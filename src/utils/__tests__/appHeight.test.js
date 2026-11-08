import { describe, expect, test } from '@jest/globals'
import { isPhantomBottomInset, resizeShouldPublish } from '../appHeight.js'

describe('app shell viewport contract', () => {
  test('a bottom inset already outside the viewport is phantom', () => {
    // Firefox on Android reported 38.67px while 138px of screen sat outside
    // the layout viewport. Padding that inset draws a dead band under the nav.
    expect(isPhantomBottomInset(38.67, 800, 662)).toBe(true)
  })

  test('an edge-to-edge viewport keeps a real bottom inset', () => {
    expect(isPhantomBottomInset(34, 844, 844)).toBe(false)
    expect(isPhantomBottomInset(0, 800, 600)).toBe(false)
  })

  test('a coarse resize is the keyboard and does not move the shell', () => {
    expect(resizeShouldPublish(false)).toBe(false)
    expect(resizeShouldPublish(true)).toBe(true)
  })
})
