import { Tabs, type TabsProps } from 'antd';

export type AppTabsProps = TabsProps;

export function AppTabs(props: AppTabsProps) {
  return <Tabs {...props} />;
}
