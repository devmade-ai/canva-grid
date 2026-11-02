// Requirement: The debug pill stays off unless the URL asks for it, so it doesn't
// cover the page. Embed previews keep the existing skip even if dbg=1 is also set.
// Approach: Parse the query. `embed=` matches the previous includes() check.
// Alternatives:
//   - import.meta.env.DEV only: Rejected — the pill is still needed on production
//     when someone is diagnosing a report, which is what ?dbg=1 is for.
//   - Show only after an error: Rejected — the owner chose the URL gate.

export function shouldMountDebugPill(search) {
  const query = search || ''
  if (query.includes('embed=')) return false
  return new URLSearchParams(query).get('dbg') === '1'
}
