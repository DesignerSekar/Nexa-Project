import { useAuthStore } from '@nexa/auth';
import { Card, Descriptions } from 'antd';
import { FeaturePageShell } from '../../../app/components/feature-page-shell';

/**
 * Read-only profile.
 *
 * Renders only what `/api/auth/me` already returned during bootstrap — no request of its own, and
 * no edit form, because the sidecar exposes no profile-update endpoint and adding one would be a
 * backend change.
 */
export function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <FeaturePageShell title="Profile">
      <Card>
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Name">{user?.name ?? '\u2014'}</Descriptions.Item>
          <Descriptions.Item label="Email">{user?.email ?? '\u2014'}</Descriptions.Item>
          <Descriptions.Item label="Mobile number">{user?.phone || '\u2014'}</Descriptions.Item>
        </Descriptions>
      </Card>
    </FeaturePageShell>
  );
}
