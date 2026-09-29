import {
  endpoints,
  type BridgeLogoutResponse,
  type BridgePlatform,
  type BridgeStatusResponse,
} from '@nexa/contract';
import { getHttpClient } from '../http/http-client';

export const bridgesApi = {
  status(platform: BridgePlatform): Promise<BridgeStatusResponse> {
    return getHttpClient().get<BridgeStatusResponse>(endpoints.bridge.status(platform));
  },

  logout(platform: BridgePlatform): Promise<BridgeLogoutResponse> {
    return getHttpClient().post<BridgeLogoutResponse>(endpoints.bridge.logout(platform));
  },
};
