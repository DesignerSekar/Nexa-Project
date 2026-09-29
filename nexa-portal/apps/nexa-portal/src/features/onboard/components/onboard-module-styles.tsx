import { useAppConfig } from '@nexa/shared-ui/providers';
import { theme } from 'antd';

/** Token-backed layout for the full-width WhatsApp onboarding screen. */
export function OnboardModuleStyles() {
  const { token } = theme.useToken();
  const { resolvedMode } = useAppConfig();
  const surface = resolvedMode === 'dark' ? '#0a0a0a' : token.colorBgContainer;

  return (
    <style>{`
@layer components {
  .onboard-stack {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
  }

  .onboard-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
    gap: ${token.marginMD}px;
    width: 100%;
    align-items: stretch;
  }

  .onboard-panel.ant-card {
    width: 100%;
    height: 100%;
    border-radius: ${token.borderRadiusLG}px;
    border: 1px solid ${token.colorBorderSecondary};
    background: ${surface};
    box-shadow: none !important;
  }
  .onboard-panel .ant-card-body {
    display: flex;
    flex-direction: column;
    gap: ${token.marginMD}px;
    height: 100%;
    padding: ${token.paddingLG}px;
  }

  .onboard-panel__title {
    margin: 0;
    font-size: ${token.fontSizeLG}px;
    font-weight: ${token.fontWeightStrong};
    color: ${token.colorText};
  }
  .onboard-panel__subtitle {
    margin: 0;
    font-size: ${token.fontSize}px;
    color: ${token.colorTextSecondary};
  }

  .onboard-guide-list {
    display: flex;
    flex-direction: column;
    gap: ${token.marginSM}px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .onboard-guide-item {
    display: flex;
    align-items: flex-start;
    gap: ${token.marginSM}px;
    padding: ${token.paddingSM}px ${token.paddingMD}px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadius}px;
    background: ${token.colorFillAlter};
    transition: border-color 0.15s ease, background 0.15s ease;
  }
  .onboard-guide-item--active {
    border-color: ${token.colorPrimaryBorder};
    background: ${token.colorPrimaryBg};
  }
  .onboard-guide-item--done {
    opacity: 0.72;
  }
  .onboard-guide-item__index {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 28px;
    height: 28px;
    border-radius: 999px;
    font-size: ${token.fontSizeSM}px;
    font-weight: ${token.fontWeightStrong};
    color: ${token.colorTextSecondary};
    background: ${surface};
    border: 1px solid ${token.colorBorderSecondary};
  }
  .onboard-guide-item--active .onboard-guide-item__index {
    color: ${token.colorPrimary};
    border-color: ${token.colorPrimaryBorder};
    background: ${surface};
  }
  .onboard-guide-item--done .onboard-guide-item__index {
    color: ${token.colorSuccess};
    border-color: ${token.colorSuccessBorder};
  }
  .onboard-guide-item__text {
    padding-top: 3px;
    font-size: ${token.fontSize}px;
    line-height: 1.45;
    color: ${token.colorTextSecondary};
  }
  .onboard-guide-item--active .onboard-guide-item__text {
    color: ${token.colorText};
  }

  .onboard-action {
    display: flex;
    flex-direction: column;
    gap: ${token.marginMD}px;
    flex: 1;
    min-height: 320px;
  }
  .onboard-action__footer {
    margin-top: auto;
    display: flex;
    flex-wrap: wrap;
    gap: ${token.marginSM}px;
    align-items: center;
    justify-content: flex-end;
  }

  .onboard-qr {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${token.marginMD}px;
    flex: 1;
    text-align: center;
  }
  .onboard-qr__frame {
    display: flex;
    align-items: center;
    justify-content: center;
    width: min(100%, 280px);
    aspect-ratio: 1;
    padding: ${token.paddingMD}px;
    border-radius: ${token.borderRadiusLG}px;
    border: 1px solid ${token.colorBorderSecondary};
    background:
      linear-gradient(180deg, ${token.colorFillAlter} 0%, ${token.colorBgContainer} 100%);
  }
  .onboard-qr__frame img {
    width: 220px;
    height: 220px;
    border-radius: ${token.borderRadius}px;
  }
  .onboard-qr__hint {
    max-width: 360px;
    margin: 0;
    font-size: ${token.fontSize}px;
    color: ${token.colorTextSecondary};
  }

  .onboard-result {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
  }

  @media (max-width: 991px) {
    .onboard-layout {
      grid-template-columns: 1fr;
    }
  }
}
`}</style>
  );
}
