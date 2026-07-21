// Requirement: PWA update detection + the fleet-standard auto-on-launch apply policy
//   (glow-props PWA_SYSTEM "Update Application Policy"). Launch-apply an update that was
//   ALREADY waiting when registration resolves; defer anything detected mid-session.
// Approach: Module-level singleton so SW state survives React remounts. Checks for updates
//   every 60 minutes and when the tab regains focus (visibilitychange). 30-second suppression
//   after any apply (user tap or launch-apply) prevents false re-detection during SW settle.
//   Launch-apply is gated on the persisted "Automatic updates" preference (default ON).
// Alternatives:
//   - Hook-local state only: Rejected — re-initializes on remount, re-triggers register(),
//     causes "update available" to re-appear after navigation.
//   - No visibility check: Rejected — users who leave tabs open for days would miss updates
//     until the next hourly interval fires.
//   - registerType 'autoUpdate': Rejected — reloads mid-session over unsaved in-memory
//     designs. CanvaGrid is an editor; launch is the only safe apply window.
//   - Tap-only prompt (previous behavior): Rejected fleet-wide — clients that never tap
//     run stale code indefinitely (the canva-grid GA-measurement-ID tail incident).
import { useEffect, useState, useCallback } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { debugLog } from '../utils/debugLog'
import { wasJustUpdated, markUpdateApplied, isAutoUpdateEnabled, setAutoUpdateEnabled } from '../utils/pwaHelpers'

const CHECK_INTERVAL_MS = 60 * 60 * 1000
// SW lifecycle events (onNeedRefresh, onOfflineReady) fire asynchronously after
// registration.update(). No event signals "check complete", so we settle with a delay.
const UPDATE_CHECK_SETTLE_MS = 1500

// Module-level state — survives component remounts
let _registration = null
let _hasUpdate = false
let _userClickedUpdate = false
let _isChecking = false
const _listeners = new Set()

function notifyListeners() { _listeners.forEach(fn => fn()) }

export function usePWAUpdate() {
  const [, forceRender] = useState(0)
  const [checking, setChecking] = useState(false)
  // Requirement: Interval must survive React Strict Mode double-mount.
  // Approach: registered state flag triggers the interval effect. useRegisterSW uses
  //   useState lazy initializer internally — onRegistered only fires once, not on re-mount.
  //   Without this flag, Strict Mode cleanup kills the interval and it's never recreated.
  const [registered, setRegistered] = useState(false)

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        _registration = r
        setRegistered(true)
        debugLog('pwa', 'sw-registered', { scope: r.scope })

        // Requirement: Fleet auto-on-launch policy — a worker ALREADY waiting when
        //   registration first resolves installed during a previous session. Nothing
        //   has been typed at launch, so applying now cannot destroy unsaved designs.
        //   A worker that reaches waiting LATER is mid-session → onNeedRefresh only
        //   arms the banner/menu item; it applies on tap or at the next launch.
        // Approach: Reuse the controllerchange reload latch (_userClickedUpdate) and
        //   the 30s wasJustUpdated() suppression, then message SKIP_WAITING directly
        //   at the waiting worker. The reload arrives via the existing controllerchange
        //   guard — a single reload, never a loop (post-reload there is no waiting
        //   worker, and the suppression covers lifecycle stragglers).
        // Alternatives:
        //   - updateServiceWorker(true) closure: Rejected — depends on the destructured
        //     return existing when the async callback fires; postMessage to r.waiting
        //     has no closure ordering hazard and is the PWA_SYSTEM spec's primary form.
        //   - Applying on visibilitychange too: Rejected — that's mid-session; the user
        //     may have unsaved work. Launch is the only auto-apply window.
        if (r.waiting && isAutoUpdateEnabled() && !wasJustUpdated()) {
          _userClickedUpdate = true // reuse the controllerchange reload latch
          // onNeedRefresh may already have fired for the waiting worker (event order
          // vs onRegistered is not guaranteed) — clear the flag so the "update
          // available" banner doesn't flash during the brief pre-reload window.
          _hasUpdate = false
          markUpdateApplied() // 30s false-re-detection suppression across the reload
          debugLog('pwa', 'update-launch-apply', 'Applying update that was waiting at launch')
          r.waiting.postMessage({ type: 'SKIP_WAITING' })
          notifyListeners()
        }
      }
    },
    onNeedRefresh() {
      if (wasJustUpdated()) return
      _hasUpdate = true
      debugLog('pwa', 'update-available', 'New version available')
      notifyListeners()
    },
    onOfflineReady() {
      debugLog('pwa', 'offline-ready', 'App ready for offline use')
    },
    onRegisterError(error) {
      debugLog('pwa', 'sw-register-error', { error: String(error) }, 'error')
    },
  })

  // Sync module state to React
  useEffect(() => {
    const listener = () => forceRender(n => n + 1)
    _listeners.add(listener)
    return () => { _listeners.delete(listener) }
  }, [])

  // Visibility-based update checks — catches updates when user returns to tab
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && _registration) {
        _registration.update().catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  // controllerchange reload guard — auto-reload once when new SW takes control,
  // but ONLY if the apply latch was set (user tapped "Update", or the launch-apply
  // path set it). Background SW lifecycle events (e.g. another tab updating) never
  // yank the page while the user is editing.
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    let refreshing = false
    const handleController = () => {
      if (refreshing || !_userClickedUpdate) return
      refreshing = true
      window.location.reload()
    }
    navigator.serviceWorker.addEventListener('controllerchange', handleController)
    return () => navigator.serviceWorker.removeEventListener('controllerchange', handleController)
  }, [])

  // Hourly update check interval — depends on registered flag so it re-creates
  // after Strict Mode cleanup/re-mount (onRegistered only fires once).
  useEffect(() => {
    if (!registered || !_registration) return
    const id = setInterval(() => {
      _registration.update().catch(() => {})
    }, CHECK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [registered])

  const update = useCallback(() => {
    _userClickedUpdate = true
    debugLog('pwa', 'update-triggered', 'User triggered update')
    markUpdateApplied()
    updateServiceWorker(true)
  }, [updateServiceWorker])

  // Manual "Check for updates" — returns the fleet-canonical typed result
  // ('no-sw' | 'up-to-date' | 'update-available' | 'error') for toast feedback;
  // after the settle delay the module update flag distinguishes the middle two.
  // Module-level _isChecking guard prevents concurrent calls from overlapping
  // (e.g., user double-taps "Check for updates" button) — the extra 'checking'
  // result is internal and never toasted (describeUpdateCheckResult → null).
  const checkForUpdate = useCallback(async () => {
    if (!_registration) return 'no-sw'
    if (_isChecking) return 'checking'
    _isChecking = true
    setChecking(true)
    try {
      await _registration.update()
      await new Promise(r => setTimeout(r, UPDATE_CHECK_SETTLE_MS))
      return _hasUpdate ? 'update-available' : 'up-to-date'
    } catch (e) {
      debugLog('pwa', 'update-check-failed', { error: String(e) }, 'error')
      return 'error'
    } finally {
      _isChecking = false
      setChecking(false)
    }
  }, [])

  // Persisted "Automatic updates" preference — writes through the pwaHelpers
  // storage helper, then notifies every hook consumer so toggles re-render.
  const setAutoUpdate = useCallback((on) => {
    setAutoUpdateEnabled(on)
    debugLog('pwa', 'auto-update-toggled', { enabled: on })
    notifyListeners()
  }, [])

  return {
    // Gate needRefresh with wasJustUpdated() — the library sets needRefresh
    // internally regardless of what onNeedRefresh does, so without this check
    // the 30-second suppression could be bypassed.
    hasUpdate: _hasUpdate || (needRefresh && !wasJustUpdated()),
    update,
    checkForUpdate,
    checking,
    // Read from storage per render (cheap) rather than mirroring in module state —
    // one source of truth; setAutoUpdate's notifyListeners() forces the re-read.
    autoUpdateEnabled: isAutoUpdateEnabled(),
    setAutoUpdate,
  }
}
