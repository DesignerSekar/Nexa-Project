import {
  DASHBOARD_RECENT_MESSAGES_LIMIT,
  endpoints,
  type RecentMessagesResponse,
  type Stats,
} from '@nexa/contract';
import { getHttpClient } from '../http/http-client';

export const dashboardApi = {
  stats(): Promise<Stats> {
    return getHttpClient().get<Stats>(endpoints.stats);
  },

  /** Defaults to 10 because that is what the legacy Dashboard sends. */
  recentMessages(limit: number = DASHBOARD_RECENT_MESSAGES_LIMIT): Promise<RecentMessagesResponse> {
    return getHttpClient().get<RecentMessagesResponse>(endpoints.recentMessages(limit));
  },
};
