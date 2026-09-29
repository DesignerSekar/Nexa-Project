export const onboardKeys = {
  all: ['onboard'] as const,
  status: (sessionId: string) => [...onboardKeys.all, 'status', sessionId] as const,
  qr: (sessionId: string) => [...onboardKeys.all, 'qr', sessionId] as const,
};
