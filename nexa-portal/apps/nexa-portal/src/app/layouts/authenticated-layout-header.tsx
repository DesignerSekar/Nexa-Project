import { useAuthStore } from '@nexa/auth';
import { AppButton } from '@nexa/shared-ui';
import { useConfirm } from '@nexa/shared-ui/hooks';
import { Avatar, Layout, Tooltip, Typography } from 'antd';
import { useState } from 'react';
import { useLogout } from '../../features/auth/hooks/use-logout';
import { ProfileDrawer } from '../../features/profile/components/profile-drawer';
import { ThemeModeToggle } from '../../features/theme/components/theme-mode-toggle';
import { AppIcon } from '../app-icon';

const { Header } = Layout;
const { Text } = Typography;

interface AuthenticatedLayoutHeaderProps {
  showMobileMenu: boolean;
  onMobileMenuOpen: () => void;
}

export function AuthenticatedLayoutHeader({
  showMobileMenu,
  onMobileMenuOpen,
}: AuthenticatedLayoutHeaderProps) {
  const user = useAuthStore((state) => state.user);
  const confirm = useConfirm();
  const { logout, isPending } = useLogout();
  const [profileOpen, setProfileOpen] = useState(false);

  const displayName = user?.name || user?.email || '';
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    void confirm({
      title: 'Sign out',
      content: 'Are you sure you want to end your current session?',
      okText: 'Sign out',
      cancelText: 'Cancel',
      danger: true,
    }).then((ok) => {
      if (ok) void logout();
    });
  };

  return (
    <>
      <Header className="app-layout-header">
        <div className="app-layout-header__left">
          {showMobileMenu ? (
            <Tooltip title="Open navigation">
              <AppButton
                type="text"
                aria-label="Open navigation"
                icon={<AppIcon name="menu" size={18} />}
                onClick={onMobileMenuOpen}
              />
            </Tooltip>
          ) : null}
          <div className="app-layout-header__brand-row">
            {/* <Text strong className="app-layout-header__tenant-name">
              Nexa
            </Text> */}
          </div>
        </div>

        <div className="app-header-actions">
          <ThemeModeToggle />
          <div className="app-header-user-cluster">
            <Tooltip title="Profile">
              <button
                type="button"
                className="app-header-user-trigger"
                aria-label="Open profile"
                onClick={() => setProfileOpen(true)}
              >
                <Avatar size={32}>{initials || <AppIcon name="profile" size={16} />}</Avatar>
                <span className="app-header-user-meta">
                  <Text strong className="app-header-user-name">
                    {displayName}
                  </Text>
                  <Text type="secondary" className="app-header-user-role">
                    {user?.email}
                  </Text>
                </span>
              </button>
            </Tooltip>
            <Tooltip title="Sign out">
              <AppButton
                type="text"
                shape="circle"
                danger
                loading={isPending}
                aria-label="Sign out"
                icon={<AppIcon name="signOut" />}
                onClick={handleLogout}
              />
            </Tooltip>
          </div>
        </div>
      </Header>

      <ProfileDrawer open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
