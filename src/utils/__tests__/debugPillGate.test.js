import { describe, test, expect } from '@jest/globals'
import { shouldMountDebugPill } from '../debugPillGate.js'

describe('shouldMountDebugPill', () => {
  test('stays hidden with no query', () => {
    expect(shouldMountDebugPill('')).toBe(false)
    expect(shouldMountDebugPill('?')).toBe(false)
  })

  test('shows only for dbg=1', () => {
    expect(shouldMountDebugPill('?dbg=1')).toBe(true)
    expect(shouldMountDebugPill('?platform=instagram-square&dbg=1')).toBe(true)
    expect(shouldMountDebugPill('?dbg=true')).toBe(false)
    expect(shouldMountDebugPill('?dbg=0')).toBe(false)
    expect(shouldMountDebugPill('?xdbg=1')).toBe(false)
  })

  test('an embed query key skips the pill, even with dbg=1', () => {
    expect(shouldMountDebugPill('?embed')).toBe(false)
    expect(shouldMountDebugPill('?embed=')).toBe(false)
    expect(shouldMountDebugPill('?embed=1')).toBe(false)
    expect(shouldMountDebugPill('?dbg=1&embed=1')).toBe(false)
    expect(shouldMountDebugPill('?embed=preview&dbg=1')).toBe(false)
    expect(shouldMountDebugPill('?dbg=1&embed')).toBe(false)
  })

  test('embed is the key name, not a substring', () => {
    expect(shouldMountDebugPill('?dbg=1&notembed=1')).toBe(true)
    expect(shouldMountDebugPill('?dbg=1&note=embed')).toBe(true)
  })
})
