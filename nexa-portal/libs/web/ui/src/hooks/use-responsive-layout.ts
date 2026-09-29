import { Grid } from 'antd';

export type ViewportTier = 'mobile' | 'tablet' | 'web' | 'monitor';

/**
 * The four tiers every screen has to handle, per the rules file:
 * mobile < 768, tablet 768-991, web 992-1599, monitor >= 1600.
 */
export function useResponsiveLayout() {
  const screens = Grid.useBreakpoint();

  const tier: ViewportTier = screens.xxl
    ? 'monitor'
    : screens.lg
      ? 'web'
      : screens.md
        ? 'tablet'
        : 'mobile';

  return {
    tier,
    isMobile: tier === 'mobile',
    isTablet: tier === 'tablet',
    isDesktop: tier === 'web' || tier === 'monitor',
    /** Below the `web` tier the icon rail becomes a drawer. */
    useMobileNav: tier === 'mobile' || tier === 'tablet',
  };
}

export const useAntdBreakpoint = Grid.useBreakpoint;
