import { useSyncExternalStore } from 'react'
import { cellTextOverflows, subscribeTextFit } from '../utils/textFitStatus'

export function useCellTextOverflows(cellIndex) {
  return useSyncExternalStore(
    subscribeTextFit,
    () => cellTextOverflows(cellIndex),
    () => false,
  )
}
