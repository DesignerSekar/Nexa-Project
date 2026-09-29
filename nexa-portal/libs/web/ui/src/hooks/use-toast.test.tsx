import { DEFAULT_APP_CONFIG } from '@nexa/theme-web';
import { renderHook } from '@testing-library/react';
import type * as Antd from 'antd';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppConfigProvider } from '../providers/app-config-provider';
import { useToast } from './use-toast';

const notification = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
};

vi.mock('antd', async () => {
  const actual = (await vi.importActual('antd')) as typeof Antd;
  return {
    ...actual,
    App: {
      ...actual.App,
      useApp: () => ({ notification }),
    },
    Grid: {
      ...actual.Grid,
      useBreakpoint: () => ({ xs: true, sm: true, md: true, lg: true, xl: true, xxl: true }),
    },
  };
});

function wrapper({ children }: { children: ReactNode }) {
  return <AppConfigProvider config={DEFAULT_APP_CONFIG}>{children}</AppConfigProvider>;
}

describe('useToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps body to description and defaults title, duration, closable, placement', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    result.current.success('Saved');
    result.current.error('Failed');
    result.current.info('Heads up');
    result.current.warning('Careful');

    expect(notification.success).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Success',
        description: 'Saved',
        duration: 3,
        closable: true,
        placement: 'topRight',
      })
    );
    expect(notification.error).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Error',
        description: 'Failed',
        placement: 'topRight',
      })
    );
    expect(notification.info).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Info',
        description: 'Heads up',
      })
    );
    expect(notification.warning).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Warning',
        description: 'Careful',
      })
    );
  });

  it('allows overriding the title via options', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    result.current.warning('Your session has expired.', { title: 'Signed out' });

    expect(notification.warning).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Signed out',
        description: 'Your session has expired.',
      })
    );
  });
});
