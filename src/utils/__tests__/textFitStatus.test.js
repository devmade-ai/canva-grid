import { describe, test, expect, beforeEach } from '@jest/globals'
import {
  TEXT_FIT_WARNING,
  publishTextFit,
  cellTextOverflows,
  subscribeTextFit,
  resetTextFitStatus,
} from '../textFitStatus.js'

describe('text fit status', () => {
  beforeEach(() => resetTextFitStatus())

  test('warning copy says what is wrong and what to do, in plain words', () => {
    expect(TEXT_FIT_WARNING).toBe(
      "Too much text to fit. It's as small as it can be. Shorten it so nothing gets cut off.",
    )
  })

  test('publishes overflow per cell and clears cells that now fit', () => {
    const seen = []
    const unsubscribe = subscribeTextFit(() => seen.push(cellTextOverflows(0)))
    publishTextFit({ 0: true, 1: false })
    expect(cellTextOverflows(0)).toBe(true)
    expect(cellTextOverflows(1)).toBe(false)
    publishTextFit({ 0: false })
    expect(cellTextOverflows(0)).toBe(false)
    expect(seen).toEqual([true, false])
    unsubscribe()
  })

  test('does not notify when nothing changed', () => {
    publishTextFit({ 0: true })
    let calls = 0
    const unsubscribe = subscribeTextFit(() => { calls += 1 })
    publishTextFit({ 0: true })
    expect(calls).toBe(0)
    unsubscribe()
  })
})
