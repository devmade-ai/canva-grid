// Requirement: the shell tracks the layout viewport, and a bottom inset the
//   browser already excluded is not padded a second time.
// Approach: the live Sancio shell (sun-sea-o). --app-height is 100dvh only
//   until this module replaces it with innerHeight. A hidden probe reads
//   env(safe-area-inset-bottom). When screen.height - innerHeight is at
//   least that inset, the token is set to 0px. Otherwise the override is
//   removed so the stylesheet env() keeps tracking. pageshow, a visible
//   visibilitychange, and orientationchange publish now, on the next frame,
//   and again at 150ms and 600ms, because the first innerHeight after a
//   rotation can still be the previous one. A fine-pointer resize publishes
//   immediately. A coarse resize does not: that event is the soft keyboard,
//   and following it slides the bottom nav off the viewport.
// Alternatives:
//   - Leave the shell on 100dvh: Rejected — Android standalone latches it
//     too tall and the nav sits past the screen until a full relaunch.
//   - Publish on every resize: Rejected — the keyboard collapse.
//   - Sniff Firefox for the phantom inset: Rejected — the screen-versus-
//     viewport comparison measures the bug.

const SETTLE_MS = [150, 600]

export function isPhantomBottomInset(insetPx, screenHeight, innerHeight) {
  return insetPx > 0 && screenHeight - innerHeight >= insetPx
}

export function resizeShouldPublish(finePointer) {
  return finePointer === true
}

export function publishAppShell(win, probe) {
  const doc = win.document
  const inset = probe ? (parseFloat(win.getComputedStyle(probe).paddingBottom) || 0) : 0
  doc.documentElement.style.setProperty('--app-height', `${win.innerHeight}px`)
  if (isPhantomBottomInset(inset, win.screen.height, win.innerHeight)) {
    doc.documentElement.style.setProperty('--safe-bottom', '0px')
  } else {
    doc.documentElement.style.removeProperty('--safe-bottom')
  }
}

export function attachAppHeight() {
  if (typeof window === 'undefined' || window.__appHeightAttached) return () => {}
  window.__appHeightAttached = true
  const probe = document.createElement('div')
  probe.setAttribute('aria-hidden', 'true')
  probe.setAttribute('data-safe-bottom-probe', '')
  probe.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;padding-bottom:env(safe-area-inset-bottom,0px)'
  document.documentElement.appendChild(probe)

  let frame = 0
  let timers = []
  const publish = () => publishAppShell(window, probe)
  const settle = () => {
    if (frame) cancelAnimationFrame(frame)
    for (const id of timers) clearTimeout(id)
    publish()
    frame = requestAnimationFrame(() => {
      frame = 0
      publish()
    })
    timers = SETTLE_MS.map((ms) => setTimeout(publish, ms))
  }
  const onVisible = () => {
    if (document.visibilityState === 'visible') settle()
  }
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
  const onResize = () => {
    if (resizeShouldPublish(fine.matches)) publish()
  }

  settle()
  window.addEventListener('pageshow', settle)
  document.addEventListener('visibilitychange', onVisible)
  window.addEventListener('orientationchange', settle)
  window.addEventListener('resize', onResize)

  return () => {
    if (frame) cancelAnimationFrame(frame)
    for (const id of timers) clearTimeout(id)
    window.removeEventListener('pageshow', settle)
    document.removeEventListener('visibilitychange', onVisible)
    window.removeEventListener('orientationchange', settle)
    window.removeEventListener('resize', onResize)
    probe.remove()
    window.__appHeightAttached = false
  }
}
