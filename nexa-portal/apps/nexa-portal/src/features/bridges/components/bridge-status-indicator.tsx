import { BRIDGE_STATUS } from '@nexa/contract';
import { humanizeStatus } from '@nexa/util';
import { theme, Typography } from 'antd';

const { Text } = Typography;

interface BridgeStatusIndicatorProps {
  status: string | null;
}

/**
 * Coloured dot plus humanised label.
 *
 * The legacy colour mapping, moved onto theme tokens: connected is green, `logged_out` and
 * `disconnected` are amber, any other non-null status is neutral, and null reads "Unknown".
 */
export function BridgeStatusIndicator({ status }: BridgeStatusIndicatorProps) {
  const { token } = theme.useToken();

  const color = !status
    ? token.colorTextQuaternary
    : status === BRIDGE_STATUS.connected
      ? token.colorSuccess
      : status === BRIDGE_STATUS.loggedOut || status === BRIDGE_STATUS.disconnected
        ? token.colorWarning
        : token.colorTextTertiary;

  return (
    <div className="mt-1 flex items-center gap-2">
      <span
        aria-hidden
        className="inline-block h-2 w-2 rounded-full"
        style={{ background: color }}
      />
      <Text className="text-[13px]" style={{ color }}>
        {humanizeStatus(status)}
      </Text>
    </div>
  );
}
