import { AppButton } from '@nexa/shared-ui';
import { Card, Tooltip, Typography } from 'antd';
import { useNavigate } from '@tanstack/react-router';
import { AppIcon } from '../../../app/app-icon';
import type { BridgeDefinition } from '../bridge-catalog';
import { useBridgeCard } from '../hooks/use-bridge-card';
import { BridgeStatusIndicator } from './bridge-status-indicator';

const { Text } = Typography;

export function BridgeCard({ bridge }: { bridge: BridgeDefinition }) {
  const navigate = useNavigate();
  const {
    isChecking,
    status,
    isConnected,
    statusError,
    actionError,
    actionMessage,
    isDisconnecting,
    disconnect,
  } = useBridgeCard(bridge.platform);

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-base font-bold">{bridge.displayName}</div>
          <Text type="secondary" className="text-[13px]">
            {bridge.description}
          </Text>
          {isChecking ? (
            <Text type="secondary" className="mt-1 block text-[13px]">
              {'Checking\u2026'}
            </Text>
          ) : (
            <BridgeStatusIndicator status={status} />
          )}
        </div>

        {isConnected ? (
          // Fires immediately, with no confirmation dialog. See DP-003.
          <AppButton
            danger
            type="primary"
            loading={isDisconnecting}
            icon={<AppIcon name="disconnect" />}
            onClick={disconnect}
          >
            {isDisconnecting ? 'Disconnecting\u2026' : 'Disconnect'}
          </AppButton>
        ) : bridge.connectTo ? (
          <AppButton
            type="primary"
            onClick={() => void navigate({ to: bridge.connectTo as string })}
          >
            Connect
          </AppButton>
        ) : (
          <Tooltip title={`${bridge.displayName} onboarding is not available yet.`}>
            {/* Disabled rather than linking to the dead /onboard-linkedin route. */}
            <AppButton type="primary" disabled>
              Connect
            </AppButton>
          </Tooltip>
        )}
      </div>

      {statusError ? (
        <Text type="danger" className="mt-2 block text-[13px]">
          {statusError}
        </Text>
      ) : null}
      {actionError ? (
        <Text type="danger" className="mt-2 block text-[13px]">
          {actionError}
        </Text>
      ) : null}
      {actionMessage ? (
        <Text type="success" className="mt-2 block text-[13px]">
          {actionMessage}
        </Text>
      ) : null}
    </Card>
  );
}
