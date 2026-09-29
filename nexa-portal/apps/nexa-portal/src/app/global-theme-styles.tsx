import { useAppConfig } from '@nexa/shared-ui/providers';
import { theme } from 'antd';

/**
 * The handful of styles that need live theme tokens and cannot be expressed as Tailwind classes:
 * scrollbars, the loading centerer, hand-rolled form labels, and the nav rail.
 *
 * Emitted as a single `<style>` in the `components` layer so Tailwind utilities still win.
 */
export function GlobalThemeStyles() {
  const { token } = theme.useToken();
  const { resolvedMode } = useAppConfig();

  const thumb = resolvedMode === 'dark' ? token.colorFillSecondary : token.colorFill;
  const isDark = resolvedMode === 'dark';
  const shellShadow = isDark ? 'rgba(0, 0, 0, 0.45)' : 'rgba(15, 23, 42, 0.05)';
  const shellShadowStrong = isDark ? 'rgba(0, 0, 0, 0.65)' : 'rgba(15, 23, 42, 0.12)';

  return (
    <style>{`
@layer components {
  :root {
    color-scheme: ${resolvedMode};
  }

  body {
    background: ${isDark ? '#000000' : token.colorBgLayout};
    color: ${token.colorText};
    font-family: ${token.fontFamily};
  }

  .custom-scroll {
    overflow: auto;
    scrollbar-width: thin;
    scrollbar-color: ${thumb} transparent;
  }
  .custom-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
  .custom-scroll::-webkit-scrollbar-track { background: transparent; }
  .custom-scroll::-webkit-scrollbar-thumb {
    background: ${thumb};
    border-radius: ${token.borderRadius}px;
  }

  .module-loading-center {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${token.paddingXL}px 0;
  }
  .module-loading-center--full {
    min-height: 100vh;
    padding: 0;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: ${token.marginXXS}px;
  }
  .form-field-label {
    font-size: ${token.fontSize}px;
    font-weight: 500;
    color: ${token.colorTextHeading};
  }
  .form-field-error {
    font-size: ${token.fontSizeSM}px;
  }

  /* Chrome/Safari paint a yellow-blue wash on autofilled inputs; flatten to the theme surface. */
  .form-field input:-webkit-autofill,
  .form-field input:-webkit-autofill:hover,
  .form-field input:-webkit-autofill:focus,
  .form-field input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 1000px ${token.colorBgContainer} inset !important;
    -webkit-text-fill-color: ${token.colorText} !important;
    caret-color: ${token.colorText};
    transition: background-color 99999s ease-in-out 0s;
  }

  /* ── Authenticated shell (ecom-v2 pattern, Nexa tokens) ── */
  .app-layout-root {
    height: 100vh;
    overflow: hidden;
    position: relative;
  }
  .app-layout-main {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    transition: margin-left 0.25s cubic-bezier(0.2, 0, 0, 1);
    margin-left: 0;
  }
  .app-layout-content {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    background: ${isDark ? '#000000' : token.colorBgLayout};
    display: flex;
    flex-direction: column;
  }
  .app-content-inner {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  .app-content-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: auto;
    min-height: 0;
    padding: ${token.paddingMD}px;
  }

  .app-sidebar-sider {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    background: ${isDark ? '#0a0a0a' : token.colorBgContainer};
    border-right: 1px solid ${token.colorBorderSecondary};
    z-index: 100;
    overflow: hidden;
    box-shadow: 2px 0 8px 0 ${shellShadow};
    transition: all 0.25s cubic-bezier(0.2, 0, 0, 1);
  }
  .app-sidebar-sider .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .app-sidebar-sider:not(.ant-layout-sider-collapsed) {
    box-shadow: 8px 0 28px 0 ${shellShadowStrong};
  }
  .app-sidebar-shell {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }
  .app-sidebar-shell__menu {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .app-sidebar-shell__footer {
    flex-shrink: 0;
    border-top: 1px solid ${token.colorBorderSecondary};
    padding: ${token.paddingSM}px;
    background: ${token.colorBgContainer};
  }
  .app-sidebar-collapse-trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: ${token.controlHeightLG}px;
    padding: 0 ${token.paddingSM}px;
    border: none;
    border-radius: ${token.borderRadius}px;
    background: transparent;
    color: ${token.colorTextSecondary};
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .app-sidebar-collapse-trigger:hover {
    background: ${token.colorFillSecondary};
    color: ${token.colorText};
  }
  .app-sidebar-sider.ant-layout-sider-collapsed .app-sidebar-collapse-trigger {
    padding: 0;
  }
  .app-sidebar-brand {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid ${token.colorBorderSecondary};
    overflow: hidden;
    padding: ${token.paddingSM}px ${token.paddingMD}px;
    background: ${isDark ? '#000000' : token.colorBgContainer};
  }
  .app-sidebar-brand__logo {
    height: 50px;
    max-width: 180px;
    width: auto;
    object-fit: contain;
    /* Dark mode: invert so the wordmark reads white on the black brand bar. */
    filter: ${isDark ? 'invert(1)' : 'none'};
  }
  .app-sidebar-menu {
    border-right: 0 !important;
    padding-top: ${token.paddingXS}px;
    background: transparent !important;
  }
  .app-sidebar-menu.ant-menu-light .ant-menu-item-selected,
  .app-sidebar-menu.ant-menu-dark .ant-menu-item-selected,
  .app-sidebar-menu.ant-menu .ant-menu-item-selected {
    background: ${token.colorPrimary} !important;
    color: ${token.colorTextLightSolid} !important;
    font-weight: ${token.fontWeightStrong};
    border-inline-start: 3px solid ${token.colorPrimary};
  }
  .app-sidebar-menu .ant-menu-item-selected .app-icon-nav {
    color: ${token.colorTextLightSolid} !important;
  }
  .app-sidebar-menu .ant-menu-item:not(.ant-menu-item-selected):hover {
    background: ${token.colorFillSecondary} !important;
  }
  .app-sidebar-menu .ant-menu-item:not(.ant-menu-item-selected):hover .app-icon-nav {
    color: ${token.colorPrimary} !important;
  }
  .app-sidebar-drawer-body {
    padding: 0 !important;
  }

  .app-layout-header {
    background: ${isDark ? '#0a0a0a' : token.colorBgContainer};
    padding: 0 ${token.paddingMD}px;
    height: 64px;
    line-height: 1.2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid ${token.colorBorderSecondary};
    z-index: 90;
    gap: ${token.marginSM}px;
  }
  .app-layout-header__left {
    display: flex;
    align-items: center;
    gap: ${token.marginMD}px;
    min-width: 0;
    flex: 1;
  }
  .app-layout-header__brand-row {
    display: flex;
    align-items: center;
    gap: ${token.marginXS}px;
  }
  .app-layout-header__tenant-name {
    font-size: ${token.fontSizeLG}px;
    color: ${token.colorText};
    white-space: nowrap;
  }
  .app-header-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: ${token.marginXS}px;
    min-width: 0;
  }
  .app-header-user-cluster {
    display: inline-flex;
    align-items: center;
    gap: ${token.marginXXS}px;
    min-width: 0;
  }
  .app-header-user-trigger {
    display: flex;
    align-items: center;
    gap: ${token.marginXS}px;
    margin: 0;
    padding: 0 ${token.paddingXS}px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: ${token.borderRadius}px;
    min-width: 0;
  }
  .app-header-user-trigger:hover {
    background: ${token.colorFillTertiary};
  }
  .app-header-user-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    line-height: 1.2;
    min-width: 0;
    max-width: 160px;
  }
  .app-header-user-name,
  .app-header-user-role {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }
  .app-header-user-name {
    font-size: ${token.fontSize}px;
  }
  .app-header-user-role {
    font-size: ${token.fontSizeSM}px;
  }

  .app-footer {
    text-align: center;
    background: ${isDark ? '#0a0a0a' : token.colorBgContainer};
    border-top: 1px solid ${token.colorBorderSecondary};
    padding: ${token.paddingXS}px ${token.paddingMD}px;
    z-index: 2;
    flex-shrink: 0;
    width: 100%;
    min-width: 0;
  }
  .app-footer__inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${token.marginSM}px;
    flex-wrap: wrap;
    width: 100%;
  }
  .app-footer__text {
    font-size: ${token.fontSizeSM}px;
    color: ${token.colorTextSecondary};
    white-space: normal;
  }

  @media (max-width: 767px) {
    .app-footer__inner {
      flex-direction: column;
      text-align: center;
      justify-content: center;
    }
  }

  @media (max-width: 991px) {
    .app-layout-header {
      height: 56px;
    }
    .app-header-user-meta {
      display: none;
    }
    .app-content-main {
      padding: ${token.paddingSM}px;
    }
  }

  @media (min-width: 992px) {
    .app-layout-root[data-sidebar-mobile='false'] .app-layout-main {
      margin-left: 220px;
    }
  }
}
`}</style>
  );
}
