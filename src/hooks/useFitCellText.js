import { useLayoutEffect, useRef, useState } from 'react'
import { fitFrame } from '../utils/fitText'
import { publishTextFit } from '../utils/textFitStatus'

// Requirement: Keep each cell's text inside the cell, using the same DOM the
// download captures, and tell the editor when the floor still isn't enough.
// Approach: Measure after layout (and again when webfonts finish, because the
// first pass may have used fallback metrics). Store the scale in state so the
// next render writes it as an inline style instead of snapping back to full size.
// Alternatives:
//   - Measure only on font load: Rejected — text edits happen after fonts are ready.
//   - Leave the size as a DOM mutation without state: Rejected — the next render
//     from an unrelated edit would paint the full size until the effect re-ran.

export function useFitCellText(rootRef, fitKey) {
  const [scales, setScales] = useState({})
  // Last scale we committed. Read inside the effect so a fitKey change can
  // compare against it without listing `scales` as a dependency (that would
  // measure again on every scale update).
  const scalesRef = useRef(scales)

  useLayoutEffect(() => {
    const measure = () => {
      const root = rootRef.current
      if (!root) return
      const frames = root.querySelectorAll('[data-fit-frame]')
      const prev = scalesRef.current
      const next = {}
      const overflow = {}
      let measured = 0
      frames.forEach((frame) => {
        if (frame.clientHeight <= 0) return
        measured += 1
        const id = frame.getAttribute('data-fit-frame')
        const result = fitFrame(frame)
        next[id] = result.scale
        overflow[id] = result.overflowsAtMin
      })
      // Canvas not laid out yet — don't lock in a floor scale from a 0-height box.
      if (frames.length > 0 && measured === 0) return

      // Scale 1 is the render default. Storing it would re-render every cell that already fits.
      const stored = {}
      for (const [id, scale] of Object.entries(next)) {
        if (Math.abs(scale - 1) > 0.004) stored[id] = scale
      }
      const storedIds = Object.keys(stored)
      let changed = storedIds.length !== Object.keys(prev).length
      if (!changed) {
        for (const id of storedIds) {
          if (prev[id] === undefined || Math.abs(prev[id] - stored[id]) > 0.004) {
            changed = true
            break
          }
        }
      }
      if (changed) {
        scalesRef.current = stored
        setScales(stored)
      }
      publishTextFit(overflow)
    }

    measure()
    const fonts = document.fonts
    fonts?.addEventListener('loadingdone', measure)
    return () => fonts?.removeEventListener('loadingdone', measure)
  }, [rootRef, fitKey])

  useLayoutEffect(() => () => publishTextFit({}), [])

  return scales
}
