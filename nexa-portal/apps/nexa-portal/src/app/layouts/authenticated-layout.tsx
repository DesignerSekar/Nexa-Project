import { useResponsiveLayout } from '@nexa/shared-ui';
import { Layout } from 'antd';
import { Outlet } from '@tanstack/react-router';
import { useState } from 'react';
import { AppFooter } from './app-footer';
import { AuthenticatedLayoutHeader } from './authenticated-layout-header';
import { AuthenticatedSidebar } from './authenticated-sidebar';

const { Content } = Layout;

export function AuthenticatedLayout() {
  const { useMobileNav, tier } = useResponsiveLayout();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <Layout
      className="app-layout-root"
      data-viewport-tier={tier}
      data-sidebar-collapsed="false"
      data-sidebar-mobile={useMobileNav ? 'true' : 'false'}
    >
      <AuthenticatedSidebar
        isMobile={useMobileNav}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <Layout className="app-layout-main">
        <AuthenticatedLayoutHeader
          showMobileMenu={useMobileNav}
          onMobileMenuOpen={() => setMobileNavOpen(true)}
        />
        <Content className="app-layout-content">
          <div className="app-content-inner">
            <main className="app-content-main custom-scroll">
              <div className="w-full">
                <Outlet />
              </div>
            </main>
          </div>
        </Content>
        <AppFooter />
      </Layout>
    </Layout>
  );
}
