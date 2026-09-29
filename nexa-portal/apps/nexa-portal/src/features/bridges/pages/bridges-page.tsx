import { FeaturePageShell } from '../../../app/components/feature-page-shell';
import { BRIDGE_CATALOG } from '../bridge-catalog';
import { BridgeCard } from '../components/bridge-card';

export function BridgesPage() {
  return (
    <FeaturePageShell title="Bridges" description="Manage connected messaging platforms.">
      <div className="flex flex-col gap-5">
        {BRIDGE_CATALOG.map((bridge) => (
          <BridgeCard key={bridge.platform} bridge={bridge} />
        ))}
      </div>
    </FeaturePageShell>
  );
}
