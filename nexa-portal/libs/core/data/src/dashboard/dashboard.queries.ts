import { DASHBOARD_RECENT_MESSAGES_LIMIT } from '@nexa/contract';
import { queryOptions } from '@tanstack/react-query';
import { mountFetchParity } from '../parity';
import { dashboardApi } from './dashboard.api';
import { dashboardKeys } from './dashboard.keys';

export function statsQueryOptions() {
  return queryOptions({
    queryKey: dashboardKeys.stats(),
    queryFn: () => dashboardApi.stats(),
    ...mountFetchParity,
  });
}

export function recentMessagesQueryOptions(limit: number = DASHBOARD_RECENT_MESSAGES_LIMIT) {
  return queryOptions({
    queryKey: dashboardKeys.recentMessages(limit),
    queryFn: () => dashboardApi.recentMessages(limit),
    ...mountFetchParity,
  });
}
