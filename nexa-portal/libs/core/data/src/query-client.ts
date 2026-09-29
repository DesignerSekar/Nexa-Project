import { QueryClient } from '@tanstack/react-query';

/**
 * Defaults copied from ecom-v2's `libs/platform/src/query-client.ts`.
 *
 * `refetchOnWindowFocus: false` is load-bearing for parity, not just a preference: the legacy
 * screens fetch once on mount and never again, so leaving React Query's default on would add
 * requests the old app never made.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

export const queryClient = createQueryClient();
