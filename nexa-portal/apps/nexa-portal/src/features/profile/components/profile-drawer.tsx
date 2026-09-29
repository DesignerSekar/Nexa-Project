import { useAuthStore } from '@nexa/auth';
import { AppButton, AppDrawer } from '@nexa/shared-ui';
import { Descriptions } from 'antd';
import { AppIcon } from '../../../app/app-icon';

interface ProfileDrawerProps {
  open: boolean;
  onClose: () => void;
}

/** Read-only profile panel opened from the header user cluster. */
export function ProfileDrawer({ open, onClose }: ProfileDrawerProps) {
  const user = useAuthStore((state) => state.user);

  return (
    <AppDrawer
      title="Profile"
      open={open}
      onClose={onClose}
      placement="right"
      width={500}
      destroyOnHidden
      closable={false}
      extra={
        <AppButton
          type="text"
          shape="circle"
          aria-label="Close profile"
          icon={<AppIcon name="close" />}
          onClick={onClose}
        />
      }
    >
      <div className="flex flex-col gap-4">
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Name">{user?.name ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Email">{user?.email ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Mobile number">{user?.phone || '—'}</Descriptions.Item>
        </Descriptions>
      </div>
    </AppDrawer>
  );
}
