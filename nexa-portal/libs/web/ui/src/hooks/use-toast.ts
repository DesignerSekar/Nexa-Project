import { App, type NotificationArgsProps } from 'antd';
import { useCallback, useMemo, type ReactNode } from 'react';
import { useAntdBreakpoint } from './use-responsive-layout';

type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions extends Omit<NotificationArgsProps, 'title' | 'message' | 'type'> {
  title?: ReactNode;
}

/**
 * Notifications via `App.useApp()`, never static `message`.
 *
 * Matches ecom-v2: first arg is the body (description); title defaults to the capitalized type.
 * Placement is `top` on mobile and `topRight` on desktop.
 */
export function useToast() {
  const { notification } = App.useApp();
  const screens = useAntdBreakpoint();
  // Until AntD Grid has measured, treat as desktop (ecom useAntdBreakpoint ready-gate).
  const ready = Object.keys(screens).length > 0;
  const isMobile = ready ? !screens.md : false;

  const showToast = useCallback(
    (type: ToastType, message: ReactNode, options?: ToastOptions) => {
      const { title, ...rest } = options || {};

      notification[type]({
        title: title || type.charAt(0).toUpperCase() + type.slice(1),
        description: message,
        placement: isMobile ? 'top' : 'topRight',
        duration: 3,
        closable: true,
        ...rest,
      });
    },
    [notification, isMobile]
  );

  return useMemo(
    () => ({
      success: (message: ReactNode, options?: ToastOptions) =>
        showToast('success', message, options),
      error: (message: ReactNode, options?: ToastOptions) => showToast('error', message, options),
      info: (message: ReactNode, options?: ToastOptions) => showToast('info', message, options),
      warning: (message: ReactNode, options?: ToastOptions) =>
        showToast('warning', message, options),
    }),
    [showToast]
  );
}
