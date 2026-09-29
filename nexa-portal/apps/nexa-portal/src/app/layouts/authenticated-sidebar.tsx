import { LAYOUT } from '@nexa/tokens';
import { AppDrawer } from '@nexa/shared-ui';
import { useAppConfig } from '@nexa/shared-ui/providers';
import type { MenuProps } from 'antd';
import { Layout, Menu } from 'antd';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { AppIcon } from '../app-icon';
import { NAV_ITEMS } from './nav-items';

const { Sider } = Layout;

const SIDEBAR_WIDTH = LAYOUT.sidebarExpandedWidth;
const NEXA_LOGO_URL = '/nexa-logo.png';

interface AuthenticatedSidebarProps {
  isMobile: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function SidebarBrand() {
  return (
    <div className="app-sidebar-brand">
      <img src={NEXA_LOGO_URL} alt="Nexa" className="app-sidebar-brand__logo" />
    </div>
  );
}

export function AuthenticatedSidebar({
  isMobile,
  mobileOpen,
  onMobileClose,
}: AuthenticatedSidebarProps) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { resolvedMode } = useAppConfig();
  const menuTheme = resolvedMode === 'dark' ? 'dark' : 'light';

  const selectedKey =
    NAV_ITEMS.find((item) => pathname.startsWith(item.to))?.to ?? NAV_ITEMS[0]?.to ?? '';

  const items: MenuProps['items'] = NAV_ITEMS.map((item) => ({
    key: item.to,
    icon: <AppIcon name={item.icon} size={18} className="app-icon-nav" />,
    label: item.label,
    title: item.label,
  }));

  const onSelect: MenuProps['onSelect'] = ({ key }) => {
    onMobileClose();
    void navigate({ to: key as (typeof NAV_ITEMS)[number]['to'] });
  };

  const menu = (
    <Menu
      mode="inline"
      theme={menuTheme}
      selectedKeys={selectedKey ? [selectedKey] : []}
      items={items}
      onSelect={onSelect}
      className="app-sidebar-menu"
      inlineCollapsed={false}
    />
  );

  const brand = <SidebarBrand />;

  if (isMobile) {
    return (
      <AppDrawer
        open={mobileOpen}
        onClose={onMobileClose}
        placement="left"
        width={SIDEBAR_WIDTH}
        closable={false}
        classNames={{ body: 'app-sidebar-drawer-body' }}
        styles={{ body: { padding: 0 } }}
      >
        <div className="app-sidebar-shell">
          {brand}
          <div className="app-sidebar-shell__menu custom-scroll">{menu}</div>
        </div>
      </AppDrawer>
    );
  }

  return (
    <Sider
      collapsed={false}
      collapsible={false}
      trigger={null}
      width={SIDEBAR_WIDTH}
      theme={menuTheme}
      className="app-sidebar-sider"
    >
      <div className="app-sidebar-shell">
        {brand}
        <div className="app-sidebar-shell__menu custom-scroll">{menu}</div>
      </div>
    </Sider>
  );
}
