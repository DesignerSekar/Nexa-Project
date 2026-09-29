/**
 * Query options that make React Query behave like the legacy `useEffect` + `fetch` screens.
 *
 * This matters more than it looks. React Query's defaults would quietly add requests the old app
 * never made, and every one of those shows up as a delta in the Phase 9 network diff:
 *
 * - `retry: 1` (the global default) would fire a second request after any failure. The legacy
 *   screens all do a single attempt and swallow the error.
 * - `staleTime: 5 min` would skip the fetch when a screen is revisited inside that window. The
 *   legacy screens refetch on every mount, because that is what a `[]`-dependency effect does.
 * - `refetchOnReconnect` would fire on network recovery. The legacy screens never do.
 *
 * Use these on any query that replaces a mount-effect fetch.
 * See docs/screen-inventory.md.
 */
export const mountFetchParity = {
  retry: false,
  staleTime: 0,
  refetchOnMount: 'always',
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

/**
 * Poll cadences from the legacy Onboard screen, in milliseconds. These are exact values, not
 * approximations: `docs/screen-inventory.md` records them as parity criteria and the tests assert
 * them with fake timers.
 */
export const ONBOARD_STATUS_POLL_MS = 3000;
export const ONBOARD_QR_REFRESH_MS = 18000;

/**
 * Options for the two onboarding polls.
 *
 * `retry: false` combined with a constant `refetchInterval` is what reproduces "errors are
 * swallowed and polling continues". React Query's default is retry-then-stop, which would silently
 * halt the poll after a transient failure and strand the user on the QR screen.
 *
 * `staleTime: Infinity` is what keeps the first request at t=interval rather than t=0. It is the
 * load-bearing option here, not `refetchOnMount`: these queries start disabled and are enabled
 * when a session id appears, and React Query fetches on that transition whenever the cached data
 * is stale. Marking the seeded data permanently fresh is the only thing that suppresses it.
 * `refetchInterval` is independent of staleness, so polling is unaffected.
 *
 * `gcTime: 0` then drops the cache as soon as the poll stops, so the next session reseeds its own
 * `initialData` instead of reusing the previous session's.
 */
export const pollParity = {
  retry: false,
  staleTime: Infinity,
  gcTime: 0,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

/**
 * Seeded as the status query's `initialData` so the first status request lands at t=3000ms.
 *
 * A `setInterval` does not run its callback immediately; React Query, with no initial data, fetches
 * as soon as the query is enabled. Without this the screen would issue one status request the
 * legacy screen never made, at t=0.
 *
 * It has to be a sentinel rather than the `status` from the start response, because the legacy
 * screen ignores that field entirely — it reads only `res.qr` and then waits for the first poll.
 * Seeding the real status would let the screen jump to connected or error a full poll early.
 */
export const ONBOARD_STATUS_NOT_YET_POLLED = '__not_yet_polled__';
