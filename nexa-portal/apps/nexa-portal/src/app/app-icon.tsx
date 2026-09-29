import { iconMap, type IconName } from './icon-map';

interface AppIconProps {
  name: IconName;
  size?: number;
  className?: string;
  'aria-hidden'?: boolean;
}

export function AppIcon({ name, size = 18, className, ...rest }: AppIconProps) {
  const Icon = iconMap[name];
  return <Icon size={size} strokeWidth={1.75} className={className} aria-hidden {...rest} />;
}
