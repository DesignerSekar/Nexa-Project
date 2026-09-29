import { Button, type ButtonProps } from 'antd';
import { forwardRef } from 'react';

export type AppButtonProps = ButtonProps;

/**
 * Thin wrapper so call sites never import Ant Design's `Button` directly. Keeping the seam means
 * a future default change lands in one file.
 */
export const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(
  function AppButton(props, ref) {
    return <Button ref={ref} {...props} />;
  }
);
