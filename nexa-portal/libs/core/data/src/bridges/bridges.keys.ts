import type { BridgePlatform } from '@nexa/contract';

export const bridgesKeys = {
  all: ['bridges'] as const,
  status: (platform: BridgePlatform) => [...bridgesKeys.all, 'status', platform] as const,
};
