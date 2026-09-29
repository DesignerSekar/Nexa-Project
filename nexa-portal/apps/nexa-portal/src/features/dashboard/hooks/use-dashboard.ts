import { recentMessagesQueryOptions, statsQueryOptions } from '@nexa/data';
import { useQueries } from '@tanstack/react-query';

/**
 * Controller for the Dashboard.
 *
 * Two parallel mount fetches (stats + recent messages). Failures are swallowed into zero state,
 * matching the legacy `.catch(() => {})`. Exposes `refetch` for the header Refresh action.
 */
export function useDashboard() {
  return useQueries({
    queries: [statsQueryOptions(), recentMessagesQueryOptions()],
    combine: ([statsResult, messagesResult]) => ({
      stats: statsResult.data ?? null,
      messages: messagesResult.data?.messages ?? [],
      isLoading: statsResult.isLoading || messagesResult.isLoading,
      isFetching: statsResult.isFetching || messagesResult.isFetching,
      refetch: () => {
        void statsResult.refetch();
        void messagesResult.refetch();
      },
    }),
  });
}
