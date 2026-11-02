// Requirement: The debug pill stays off unless the URL asks for it, so it doesn't
// cover the page. Embed previews keep the existing skip even if dbg=1 is also set.
// Approach: URLSearchParams. embed is a key (`?embed` or `?embed=1`), not the
//   substring "embed=", which also matched notembed= and values that merely
//   contained those letters.
// Alternatives:
//   - import.meta.env.DEV only: Rejected — the pill is still needed on production
//     when someone is diagnosing a report, which is what ?dbg=1 is for.
//   - Show only after an error: Rejected — the owner chose the URL gate.

export function shouldMountDebugPill(search) {
  const params = new URLSearchParams(search || '')
  if (params.has('embed')) return false
  return params.get('dbg') === '1'
}
