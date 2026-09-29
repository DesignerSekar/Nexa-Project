import { MOUNTED_BRIDGE_PLATFORMS, type MountedBridgePlatform } from '@nexa/contract';

export interface BridgeDefinition {
  platform: MountedBridgePlatform;
  displayName: string;
  description: string;
  /** WhatsApp → Onboard tab. LinkedIn stays a dead-end (DP-001). */
  connectTo: 'onboard' | null;
}

export const BRIDGE_CATALOG: readonly BridgeDefinition[] = [
  {
    platform: 'whatsapp',
    displayName: 'WhatsApp',
    description: 'Receive and classify WhatsApp messages via mautrix-whatsapp',
    connectTo: 'onboard',
  },
  {
    platform: 'linkedin',
    displayName: 'LinkedIn',
    description: 'Receive and classify LinkedIn messages via mautrix-linkedin',
    connectTo: null,
  },
];

const catalogPlatforms = BRIDGE_CATALOG.map((bridge) => bridge.platform);
if (catalogPlatforms.length !== MOUNTED_BRIDGE_PLATFORMS.length) {
  throw new Error('BRIDGE_CATALOG must cover exactly MOUNTED_BRIDGE_PLATFORMS.');
}
