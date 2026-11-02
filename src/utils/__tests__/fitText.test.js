import { describe, test, expect } from '@jest/globals'
import { fontSizeAtScale, trackingAtScale, largestFittingPx, MIN_FIT_PX } from '../fitText.js'

describe('fontSizeAtScale', () => {
  test('keeps the requested size at scale 1', () => {
    expect(fontSizeAtScale(54, 1)).toBe(54)
  })

  test('shrinks in proportion and rounds to whole pixels', () => {
    expect(fontSizeAtScale(54, 0.5)).toBe(27)
  })

  test('does not go below the floor', () => {
    expect(fontSizeAtScale(54, 0.1)).toBe(MIN_FIT_PX)
  })

  test('does not shrink text that is already at or under the floor', () => {
    expect(fontSizeAtScale(10, 0.5)).toBe(10)
    expect(fontSizeAtScale(MIN_FIT_PX, 0.2)).toBe(MIN_FIT_PX)
  })
})

describe('trackingAtScale', () => {
  test('scales letter spacing with the text and leaves zero alone', () => {
    expect(trackingAtScale(2, 0.5)).toBe(1)
    expect(trackingAtScale(0, 0.5)).toBe(0)
    expect(trackingAtScale(-1, 0.5)).toBe(-0.5)
  })
})

describe('largestFittingPx', () => {
  test('stays at the requested size when it already fits', () => {
    expect(largestFittingPx(() => true, 54, MIN_FIT_PX)).toEqual({ px: 54, overflowsAtMin: false })
  })

  test('picks the largest size that fits', () => {
    const result = largestFittingPx((px) => px <= 30, 54, MIN_FIT_PX)
    expect(result).toEqual({ px: 30, overflowsAtMin: false })
  })

  test('stops at the floor and reports that it still does not fit', () => {
    const result = largestFittingPx(() => false, 54, MIN_FIT_PX)
    expect(result).toEqual({ px: MIN_FIT_PX, overflowsAtMin: true })
  })

  test('does not shrink a size that is already under the floor', () => {
    const result = largestFittingPx(() => false, 9, MIN_FIT_PX)
    expect(result).toEqual({ px: 9, overflowsAtMin: true })
  })
})
