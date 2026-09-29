import type { User } from '@nexa/contract';
import { create } from 'zustand';

/**
 * Session state.
 *
 * There is deliberately no token field. On web the session is an HttpOnly cookie, invisible to JS;
 * on mobile a token would live inside the `AuthStrategy`, not here. Storing one would imply the
 * client owns the session, which it does not.
 */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  /** True until the first `/api/auth/me` settles. Drives the bootstrap splash. */
  isRehydrating: boolean;
  setUser: (user: User | null) => void;
  setRehydrating: (value: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isRehydrating: true,

  setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
  setRehydrating: (isRehydrating) => set({ isRehydrating }),
  clear: () => set({ user: null, isAuthenticated: false }),
}));
