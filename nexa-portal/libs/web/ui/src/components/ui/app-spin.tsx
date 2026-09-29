import { Spin } from 'antd';
import { cn } from '../../utils/cn';

interface AppSpinProps {
  /** Fills the viewport height, for route-level loads. */
  fullPage?: boolean;
  className?: string;
}

/**
 * Centered, spinner-only loading state.
 *
 * Rule 8 of the rules file: no `tip`, no `description`, no adjacent "Loading…" copy. The
 * accessible name goes on the wrapper so screen readers still announce it.
 */
export function AppSpin({ fullPage = false, className }: AppSpinProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('module-loading-center', fullPage && 'module-loading-center--full', className)}
    >
      <Spin size="medium" />
    </div>
  );
}
