import { ONBOARD_QR_REFRESH_MS } from '@nexa/data';
import { AppButton } from '@nexa/shared-ui';
import { Alert, Spin, Typography } from 'antd';
import { AppIcon } from '../../../app/app-icon';

const { Text } = Typography;

/** 18000ms rendered as "18 s", matching the legacy copy without hard-coding the number twice. */
const QR_REFRESH_SECONDS = ONBOARD_QR_REFRESH_MS / 1000;

interface QrPanelProps {
  qr: string | null;
  onCancel: () => void;
}

export function QrPanel({ qr, onCancel }: QrPanelProps) {
  return (
    <div className="onboard-action">
      <div>
        <h3 className="onboard-panel__title">Scan the QR code</h3>
        <p className="onboard-panel__subtitle">
          WhatsApp {'\u2192'} Linked devices {'\u2192'} Link a device
        </p>
      </div>

      <div className="onboard-qr">
        <div className="onboard-qr__frame">
          {qr ? (
            <img src={qr} alt="QR code" width={220} height={220} />
          ) : (
            <Spin tip="Waiting for QR code…" size="medium">
              <div style={{ width: 220, height: 220 }} />
            </Spin>
          )}
        </div>

        <Text className="onboard-qr__hint">
          Keep this page open until your phone confirms the link. The code refreshes every{' '}
          {QR_REFRESH_SECONDS} s.
        </Text>

        <Alert
          type="info"
          showIcon
          icon={<AppIcon name="whatsapp" size={16} />}
          message={`Polling for connection\u2026 QR refreshes every ${QR_REFRESH_SECONDS} s`}
        />
      </div>

      <div className="onboard-action__footer">
        <AppButton danger size="medium" onClick={onCancel}>
          Cancel
        </AppButton>
      </div>
    </div>
  );
}
