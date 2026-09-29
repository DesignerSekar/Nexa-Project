export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  recentMessages: (limit: number) => [...dashboardKeys.all, 'recent-messages', limit] as const,
};
