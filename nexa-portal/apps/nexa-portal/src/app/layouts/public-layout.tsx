import { Outlet } from '@tanstack/react-router';
import { ThemeModeToggle } from '../../features/theme/components/theme-mode-toggle';

/** Centered card frame for the login screen. */
export function PublicLayout() {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-6">
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeModeToggle />
      </div>
      <div className="relative z-10 w-full max-w-[440px]">
        <Outlet />
      </div>
    </div>
  );
}
