import type { BridgePlatform } from '@nexa/contract';
import { queryOptions } from '@tanstack/react-query';
import { mountFetchParity } from '../parity';
import { bridgesApi } from './bridges.api';
import { bridgesKeys } from './bridges.keys';

export function bridgeStatusQueryOptions(platform: BridgePlatform) {
  return queryOptions({
    queryKey: bridgesKeys.status(platform),
    queryFn: () => bridgesApi.status(platform),
    ...mountFetchParity,
  });
}
