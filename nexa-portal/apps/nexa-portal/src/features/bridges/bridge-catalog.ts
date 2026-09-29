import { MOUNTED_BRIDGE_PLATFORMS, type MountedBridgePlatform } from '@nexa/contract';

export interface BridgeDefinition {
  platform: MountedBridgePlatform;
  displayName: string;
  description: string;
  /**
   * Where Connect goes.
   *
   * LinkedIn is `null` because the legacy card pointed at `/onboard-linkedin`, a route that was
   * never mounted — clicking it produced a blank screen. The button is disabled here rather than
   * linking somewhere new, since building LinkedIn onboarding is new behaviour (DP-001).
   */
  connectTo: string | null;
}

/**
 * The two cards the legacy screen rendered, in order, with their exact names and descriptions.
 *
 * Instagram and Twitter are absent even though the sidecar accepts them: mounting them would issue
 * two status requests the web UI has never made. See DP-002.
 */
export const BRIDGE_CATALOG: readonly BridgeDefinition[] = [
  {
    platform: 'whatsapp',
    displayName: 'WhatsApp',
    description: 'Receive and classify WhatsApp messages via mautrix-whatsapp',
    connectTo: '/app/onboard/whatsapp',
  },
  {
    platform: 'linkedin',
    displayName: 'LinkedIn',
    description: 'Receive and classify LinkedIn messages via mautrix-linkedin',
    connectTo: null,
  },
];

// Guards against the catalog and the contract drifting apart.
const catalogPlatforms = BRIDGE_CATALOG.map((bridge) => bridge.platform);
if (catalogPlatforms.length !== MOUNTED_BRIDGE_PLATFORMS.length) {
  throw new Error('BRIDGE_CATALOG must cover exactly MOUNTED_BRIDGE_PLATFORMS.');
}
