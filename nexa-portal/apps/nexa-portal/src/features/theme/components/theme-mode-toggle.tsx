import { AppButton } from '@nexa/shared-ui';
import { useAppConfig } from '@nexa/shared-ui/providers';
import { Tooltip } from 'antd';
import { AppIcon } from '../../../app/app-icon';
import { useAppConfigStore } from '../stores/app-config.store';

/**
 * Light/dark toggle in the header.
 *
 * Purely presentational: it sends no request and touches no session state, so it cannot affect
 * parity of any flow.
 */
export function ThemeModeToggle() {
  const { resolvedMode } = useAppConfig();
  const toggleThemeMode = useAppConfigStore((state) => state.toggleThemeMode);
  const nextLabel = resolvedMode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <Tooltip title={nextLabel}>
      <AppButton
        type="text"
        shape="circle"
        aria-label={nextLabel}
        onClick={toggleThemeMode}
        icon={<AppIcon name={resolvedMode === 'dark' ? 'sun' : 'moon'} />}
      />
    </Tooltip>
  );
}
