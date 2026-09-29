import { AppButton } from '@nexa/shared-ui';
import { Spin } from 'antd';
import { useState } from 'react';
import { AppIcon } from '../../../app/app-icon';
import { FeaturePageShell } from '../../../app/components/feature-page-shell';
import { BreakdownPanels } from '../components/breakdown-panels';
import { DashboardKpiCards, type DashboardFilterKey } from '../components/dashboard-kpi-cards';
import { DashboardModuleStyles } from '../components/dashboard-module-styles';
import { RecentMessagesPanel } from '../components/recent-messages-panel';
import { useDashboard } from '../hooks/use-dashboard';

export function DashboardPage() {
  const { stats, messages, isLoading, isFetching, refetch } = useDashboard();
  const [activeFilter, setActiveFilter] = useState<DashboardFilterKey>('all');

  const handleFilterChange = (filter: DashboardFilterKey) => {
    setActiveFilter(filter);
    requestAnimationFrame(() => {
      const panel = document.getElementById('dashboard-recent-messages');
      if (panel && typeof panel.scrollIntoView === 'function') {
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  };

  return (
    <>
      <DashboardModuleStyles />
      <FeaturePageShell
        title="Dashboard"
        description="Message triage overview — volumes, priorities, and recent classified chats."
        actions={
          <AppButton
            icon={<AppIcon name="refresh" />}
            loading={isFetching && !isLoading}
            onClick={() => refetch()}
          >
            Refresh
          </AppButton>
        }
      >
        <Spin spinning={isLoading}>
          <div className="dashboard-stack">
            <DashboardKpiCards
              stats={stats}
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
            />

            {stats ? (
              <BreakdownPanels
                priorityBreakdown={stats.priority_breakdown}
                classifierBreakdown={stats.classifier_breakdown}
              />
            ) : null}

            <RecentMessagesPanel messages={messages} activeFilter={activeFilter} />
          </div>
        </Spin>
      </FeaturePageShell>
    </>
  );
}
