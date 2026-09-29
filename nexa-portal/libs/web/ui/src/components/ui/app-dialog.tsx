import { Drawer, Modal, type DrawerProps, type ModalProps } from 'antd';

export type AppModalProps = ModalProps;

export function AppModal(props: AppModalProps) {
  return <Modal destroyOnHidden {...props} />;
}

export type AppDrawerProps = DrawerProps;

/**
 * Drawer with the themed scrollbar on its body.
 *
 * Ant Design 6 allows `classNames` to be a function, which cannot be spread, so a caller-supplied
 * function takes over entirely and opts out of `custom-scroll`.
 */
export function AppDrawer({ classNames, ...props }: AppDrawerProps) {
  const mergedClassNames =
    typeof classNames === 'function'
      ? classNames
      : { ...classNames, body: `custom-scroll ${classNames?.body ?? ''}`.trim() };

  return <Drawer destroyOnHidden classNames={mergedClassNames} {...props} />;
}
