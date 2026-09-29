import {
  AlertTriangle,
  Check,
  ChevronLeft,
  Inbox,
  LayoutDashboard,
  Link2,
  Loader2,
  LogOut,
  type LucideIcon,
  Menu,
  MessageCircle,
  Moon,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  QrCode,
  RefreshCw,
  Sun,
  Unplug,
  User,
  X,
} from 'lucide-react';

/**
 * Every icon the portal uses, in one place.
 *
 * Components reference icons by name through `AppIcon` rather than importing from `lucide-react`,
 * so the icon set stays auditable and swapping the library is a single-file change.
 */
export const iconMap = {
  alert: AlertTriangle,
  back: ChevronLeft,
  bridges: Link2,
  check: Check,
  close: X,
  dashboard: LayoutDashboard,
  disconnect: Unplug,
  inbox: Inbox,
  menu: Menu,
  moon: Moon,
  panelLeftClose: PanelLeftClose,
  panelLeftOpen: PanelLeftOpen,
  play: Play,
  profile: User,
  qrCode: QrCode,
  refresh: RefreshCw,
  signOut: LogOut,
  spinner: Loader2,
  sun: Sun,
  theme: Palette,
  whatsapp: MessageCircle,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof iconMap;
