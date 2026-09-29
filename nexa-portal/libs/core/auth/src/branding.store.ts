import { create } from 'zustand';

/**
 * ecom-v2's `tenant.store.ts`, ported in shape but not in behaviour.
 *
 * There it is hydrated from `GET /api/public/tenant`. Nexa has no such endpoint and no tenancy at
 * all, so this is seeded from a local constant and issues no request. Inventing the fetch would
 * be new backend traffic. See docs/access-control-analysis.md.
 */
export interface Branding {
  id: string;
  name: string;
  tagline: string;
  primaryColor: string | null;
}

export const DEFAULT_BRANDING: Branding = {
  id: 'nexa',
  name: 'Nexa',
  // The exact subtitle from the legacy login screen.
  tagline: 'AI message routing for WhatsApp & LinkedIn',
  primaryColor: null,
};

interface BrandingState {
  branding: Branding;
  setBranding: (branding: Partial<Branding>) => void;
}

export const useBrandingStore = create<BrandingState>((set) => ({
  branding: DEFAULT_BRANDING,
  setBranding: (patch) => set((state) => ({ branding: { ...state.branding, ...patch } })),
}));
