import { Typography } from 'antd';
import type { ReactNode } from 'react';

const { Title, Text } = Typography;

interface FeaturePageShellProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/**
 * Heading plus body for every feature route.
 *
 * Titles match the legacy `<h1>` text exactly; descriptions only appear where the old screen had
 * subtitle copy.
 */
export function FeaturePageShell({ title, description, actions, children }: FeaturePageShellProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Title level={2} className="!mb-0">
            {title}
          </Title>
          {description ? <Text type="secondary">{description}</Text> : null}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}
