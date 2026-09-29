/** Spacing, radii, typography, and layout constants shared by both platforms. */

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const RADIUS = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
} as const;

export const FONT_FAMILIES = {
  system:
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  inter: '"Inter", ui-sans-serif, system-ui, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
} as const;

export type FontFamilyKey = keyof typeof FONT_FAMILIES;

export const FONT_SIZES = {
  compact: 13,
  default: 14,
  comfortable: 16,
} as const;

export type DensityKey = keyof typeof FONT_SIZES;

/** Compact always-collapsed icon rail; expanded width kept for mobile drawer shell. */
export const LAYOUT = {
  sidebarRailWidth: 64,
  sidebarExpandedWidth: 220,
  headerHeight: 64,
  /** The `monitor` tier caps content width and centres it. */
  contentMaxWidth: 1600,
} as const;

/** Ant Design breakpoints, as the four tiers the rules file requires every screen to handle. */
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 992,
  monitor: 1600,
} as const;
