import { useAppConfig } from '@nexa/shared-ui/providers';
import { theme } from 'antd';

/** Token-backed CSS for ecom-style dashboard KPI cards and panels. */
export function DashboardModuleStyles() {
  const { token } = theme.useToken();
  const { resolvedMode } = useAppConfig();
  const isDark = resolvedMode === 'dark';
  const surface = isDark ? '#0a0a0a' : token.colorBgContainer;
  const cardShadow = isDark ? '0 1px 2px rgba(0, 0, 0, 0.45)' : '0 1px 2px rgba(15, 23, 42, 0.04)';
  const cardShadowHover = isDark
    ? '0 4px 12px rgba(0, 0, 0, 0.55)'
    : '0 4px 12px rgba(15, 23, 42, 0.08)';

  return (
    <style>{`
@layer components {
  .dashboard-stack {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
  }

  .dashboard-kpi-overview {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: ${token.marginMD}px;
    width: 100%;
  }

  .dashboard-summary-card {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: ${token.marginXS}px;
    min-height: 120px;
    padding: ${token.paddingMD}px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;
    background: ${surface};
    box-shadow: ${cardShadow};
    text-align: left;
    cursor: pointer;
    overflow: hidden;
    transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
  }
  .dashboard-summary-card::before {
    content: '';
    position: absolute;
    inset: 0 auto auto 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    opacity: 0.08;
    background: linear-gradient(135deg, currentColor 0%, transparent 55%);
  }
  .dashboard-summary-card:hover {
    transform: translateY(-1px);
    box-shadow: ${cardShadowHover};
  }
  .dashboard-summary-card--tone-primary {
    color: ${token.colorPrimary};
    border-color: ${token.colorPrimaryBorder};
  }
  .dashboard-summary-card--tone-warning {
    color: ${token.colorWarning};
    border-color: ${token.colorWarningBorder};
  }
  .dashboard-summary-card--tone-success {
    color: ${token.colorSuccess};
    border-color: ${token.colorSuccessBorder};
  }
  .dashboard-summary-card--active {
    border-color: currentColor;
    box-shadow: 0 0 0 1px currentColor inset;
  }
  .dashboard-summary-card__head {
    display: flex;
    align-items: center;
    gap: ${token.marginXS}px;
    position: relative;
    z-index: 1;
  }
  .dashboard-summary-card__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: ${token.borderRadius}px;
    background: ${token.colorFillTertiary};
  }
  .dashboard-summary-card__icon--primary { color: ${token.colorPrimary}; background: ${token.colorPrimaryBg}; }
  .dashboard-summary-card__icon--warning { color: ${token.colorWarning}; background: ${token.colorWarningBg}; }
  .dashboard-summary-card__icon--success { color: ${token.colorSuccess}; background: ${token.colorSuccessBg}; }
  .dashboard-summary-card__title {
    font-size: ${token.fontSize}px;
    color: ${token.colorTextSecondary};
  }
  .dashboard-summary-card__value {
    position: relative;
    z-index: 1;
    font-size: 28px;
    font-weight: ${token.fontWeightStrong};
    line-height: 1.15;
    color: ${token.colorText};
  }
  .dashboard-summary-card__value--sm {
    font-size: 18px;
  }
  .dashboard-summary-card__meta {
    position: relative;
    z-index: 1;
    font-size: ${token.fontSizeSM}px;
    color: ${token.colorTextTertiary};
  }

  .dashboard-panel.ant-card {
    width: 100%;
    border-radius: ${token.borderRadiusLG}px;
    border: 1px solid ${token.colorBorderSecondary};
    background: ${surface};
    box-shadow: none !important;
  }
  .dashboard-panel.ant-card:hover {
    box-shadow: none !important;
  }
  .dashboard-panel .ant-card-body {
    padding: ${token.paddingMD}px ${token.paddingLG}px;
  }
  .dashboard-panel__title {
    font-size: ${token.fontSizeLG}px;
    color: ${token.colorText};
  }

  .dashboard-twin-sections {
    width: 100%;
  }
  .dashboard-equal-row .ant-col {
    display: flex;
  }
  .dashboard-equal-row .dashboard-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .dashboard-equal-row .dashboard-panel .ant-card-body {
    flex: 1;
  }

  .dashboard-breakdown-list {
    display: flex;
    flex-direction: column;
    gap: ${token.marginSM}px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .dashboard-breakdown-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${token.marginSM}px;
    padding: ${token.paddingXS}px 0;
    border-bottom: 1px solid ${token.colorSplit};
  }
  .dashboard-breakdown-row:last-child {
    border-bottom: 0;
  }
  .dashboard-breakdown-row__label {
    font-size: ${token.fontSize}px;
    color: ${token.colorTextSecondary};
  }
  .dashboard-breakdown-row__value {
    font-size: ${token.fontSizeLG}px;
    font-weight: ${token.fontWeightStrong};
    color: ${token.colorText};
  }

  .dashboard-messages-grid {
    width: 100%;
    min-height: 200px;
  }
  .dashboard-messages-grid .ag-root-wrapper {
    border-radius: ${token.borderRadius}px;
    border-color: ${token.colorBorderSecondary};
  }

  @media (max-width: 1199px) {
    .dashboard-kpi-overview {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media (max-width: 767px) {
    .dashboard-kpi-overview {
      grid-template-columns: 1fr;
    }
  }
}
`}</style>
  );
}
