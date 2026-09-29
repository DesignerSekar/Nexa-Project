import type { IconName } from '../icon-map';

export interface NavItem {
  to: string;
  /** Exact label from the legacy sidebar. Do not reword. */
  label: string;
  icon: IconName;
}

/**
 * The three destinations the legacy sidebar offered, in the same order with the same labels.
 *
 * "WhatsApp" points at the WhatsApp onboarding screen, matching the old `/onboard` link. LinkedIn
 * is absent here exactly as it was there — the Bridges card linked to a route that never existed,
 * and adding it is deferred as DP-001.
 */
export const NAV_ITEMS: readonly NavItem[] = [
  { to: '/app/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/app/onboard/whatsapp', label: 'WhatsApp', icon: 'whatsapp' },
  { to: '/app/bridges', label: 'Bridges', icon: 'bridges' },
];
