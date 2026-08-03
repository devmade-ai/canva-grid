# TODO

Future enhancements and ideas for CanvaGrid.

---

## Prioritized Improvements

### Medium Priority

| Item | Effort | Description |
|------|--------|-------------|
| **TypeScript migration** | Medium-High | Actual state: ~30% of config (3/11: textDefaults.ts, fonts.ts, sampleImages.ts), ~13% of utils (1/9: layoutHelpers.ts), 0% hooks, 0% components. Next: finish config + utils, then hooks (useHistory, useAdState — needs generic types), then components (.jsx → .tsx, starting smallest). |
| **Sunset `utils/pwaCleanup.js`** | Trivial | One-shot cleanup added 2026-04-23 to drop pre-rename SW caches (`google-fonts-cache`, `gstatic-fonts-cache`). Verification mechanism: DebugPill PWA Diagnostics tab now shows an `SW Caches` row that flags any stale pre-rename names (warn status, e.g. `2 (stale: google-fonts-cache)`). When no debug report from a real install shows that warning for ~30 days (estimate ~Oct 2026), it's safe to: (1) delete `utils/pwaCleanup.js`, (2) drop the import + call from `main.jsx`, (3) remove the architecture line from CLAUDE.md, (4) remove the `SW Caches`-stale logic from DebugPill (the row itself can stay as a generic cache enumerator), (5) delete this TODO entry. |

### Low Priority (Long-term)

| Item | Effort | Description |
|------|--------|-------------|
| **Expand unit test coverage** | Low-Medium | Current: 164 tests across 14 files (cellUtils, layoutPresets, stylePresets, canvasRenderers, exportHelpers, fontEmbed, pwaCleanup, oklchToHex, pwaHelpers, layouts, platforms, themes, iconCacheBust, bundleSize). Untested: designStorage.js (IndexedDB ops — needs mock), debugLog.js (circular buffer, pub/sub, console interception, subscriber replay, report generation, URL redaction). PWA hook integration tests (singleton state, visibility handler, install prompt flow) would need browser API mocks. |

## PWA pattern audit — 2026-08-03

Repo-side findings from a fleet-wide audit of every devmade-ai PWA against the
glow-props implementation patterns. The pattern-side learnings are already folded
back into those docs, so **fetch the current pattern before starting any item** —
several of these are now described directly by it:

```bash
curl -sf "https://devmade-ai.github.io/glow-props/patterns/PWA_SYSTEM.md"
curl -sf "https://devmade-ai.github.io/glow-props/patterns/PWA_ICON_CACHE_BUST.md"
```

Line references were accurate at audit time. Severity-ordered.

1. [ ] **Live offline bug: the sample-image manifest is uncacheable.**
   `SampleImagesSection.jsx:47-50` appends `?v=<floor(now/1h)>` to the jsDelivr
   manifest URL, and the runtime rule (`vite.config.js:197-210`) is NetworkFirst with
   `maxEntries: 1`. **`ignoreURLParametersMatching` is a precache-lookup option and
   does not apply to runtime routes** — so when the hour rolls over the request URL
   no longer matches the cached key, and an installed user is offline-capable for at
   most sixty minutes after their last online visit. Fix with
   `matchOptions: { ignoreSearch: true }` (or a `cacheKeyWillBeUsed` plugin) and
   raise `maxEntries`.
2. [ ] **Duplicate precache source for `icon.svg`** — `vite.config.js:94`
   (`includeAssets`) and `:142` (`globPatterns`). Benign today because the icons sit
   at the dist root, outside the default `dontCacheBustURLsMatching` of `/^assets/`,
   so both entries carry the same revision and dedupe. Move the icons under
   `assets/`, narrow that regex, or add any transform, and it becomes the
   SW-killer that left sibling repo repo-tor precaching nothing at all.
3. [ ] **Update-policy items:** `onRegistered` is deprecated (use `onRegisteredSW`);
   launch-apply runs from the registration callback while the `controllerchange`
   listener is mounted in a `useEffect`; `onNeedRefresh` returns *before* recording
   the update, so a manual check inside the 30s window reports "up to date" to a user
   whose update is genuinely waiting; `checkForUpdate` never reads
   `registration.waiting`; the concurrency guard returns a non-canonical
   `'checking'` that `describeUpdateCheckResult` maps to `null`, so **the second tap
   produces no feedback at all**; `update()` has no plain-reload fallback and never
   surfaces a rejected apply; no preference read-back; the visibility check is
   unthrottled.
4. [ ] **Install flow:** the event is cleared *after* `prompt()` and only on
   `'accepted'`, so a dismissal leaves a spent event that throws on the next tap;
   `window.__pwaInstallPrompt` is re-written rather than consumed-and-deleted; no
   durable capture flag; `'prompted'` is tracked only in the late listener, so every
   repeat visit is missing from the funnel.
5. [ ] **No `vercel.json` headers block** — rewrites only. No `immutable` on
   `/assets/`, no `no-cache` on `index.html`/`sw.js`/`manifest.webmanifest`, no
   `/workbox-` rule.
6. [ ] **Add the duplicate-URL assertion to the icon tripwire** — it checks
   versioning, `cleanupOutdatedCaches` and `/^v$/` but not the precache manifest,
   which is the only place item 2 is visible.
7. [ ] **Write the GA-tail post-mortem.** This incident justifies the entire fleet
   update policy and is recorded *nowhere* — not in `CLAUDE.md`, not in
   `docs/AI_MISTAKES.md` (18 entries, none PWA or analytics). The only in-repo
   references cite the fleet doc, which cites this repo. The working copy is a single
   squashed commit and `index.html` has only ever carried one measurement ID, so the
   swap cannot be confirmed or refuted from here.

**Promoted into the fleet pattern from this repo:** the opaque-response
(`statuses: [0, 200]`) trap — your font-cache incident is now the worked example,
including that renaming a `cacheName` is the only way to abandon poisoned entries —
the orphaned-runtime-cache cleanup pattern with its debug-pill warning and sunset
criterion, and the two mechanisms that made the GA tail last months (an ID inlined
in the precached shell, plus `navigateFallback` making refresh a no-op).
