import { App } from 'antd';

interface ConfirmOptions {
  title: string;
  content?: string;
  okText?: string;
  cancelText?: string;
  danger?: boolean;
}

/**
 * Promise-returning confirmation dialog.
 *
 * Parity note: this is deliberately NOT wired in front of bridge disconnect, even though that is
 * the obvious place for it and ecom-v2's conventions would call for it. The legacy Disconnect
 * button fires immediately, and inserting a step changes behaviour. Tracked as DP-003.
 */
export function useConfirm() {
  const { modal } = App.useApp();

  return function confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      modal.confirm({
        title: options.title,
        content: options.content,
        okText: options.okText ?? 'Confirm',
        cancelText: options.cancelText ?? 'Cancel',
        okButtonProps: { danger: options.danger },
        centered: true,
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  };
}
