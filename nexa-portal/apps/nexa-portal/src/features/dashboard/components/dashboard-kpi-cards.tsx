import type { Stats } from '@nexa/contract';
import { formatCount } from '@nexa/util';
import { Typography } from 'antd';
import { AppIcon } from '../../../app/app-icon';
import type { IconName } from '../../../app/icon-map';

const { Text } = Typography;

export type DashboardFilterKey = 'all' | 'pending' | 'classifier';

interface DashboardKpiCardsProps {
  stats: Stats | null;
  activeFilter: DashboardFilterKey;
  onFilterChange: (filter: DashboardFilterKey) => void;
}

type Tone = 'primary' | 'warning' | 'success';

interface KpiCard {
  filterKey: DashboardFilterKey;
  title: string;
  value: string;
  valueClassName?: string;
  meta: string;
  tone: Tone;
  icon: IconName;
}

export function DashboardKpiCards({ stats, activeFilter, onFilterChange }: DashboardKpiCardsProps) {
  const cards: KpiCard[] = [
    {
      filterKey: 'all',
      title: 'Total messages',
      value: formatCount(stats?.total_messages),
      meta: 'Click to show all recent messages',
      tone: 'primary',
      icon: 'inbox',
    },
    {
      filterKey: 'pending',
      title: 'Pending actions',
      value: formatCount(stats?.pending_actions),
      meta: 'Needs triage or follow-up',
      tone: 'warning',
      icon: 'alert',
    },
    {
      filterKey: 'classifier',
      title: 'AI classifier',
      value: stats?.classifier ?? '\u2014',
      valueClassName: 'dashboard-summary-card__value--sm',
      meta: 'Active classification model',
      tone: 'success',
      icon: 'dashboard',
    },
  ];

  return (
    <div className="dashboard-kpi-overview">
      {cards.map((card) => {
        const isActive = activeFilter === card.filterKey;
        return (
          <button
            key={card.filterKey}
            type="button"
            className={[
              'dashboard-summary-card',
              `dashboard-summary-card--tone-${card.tone}`,
              isActive ? 'dashboard-summary-card--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onFilterChange(card.filterKey)}
            aria-pressed={isActive}
          >
            <div className="dashboard-summary-card__head">
              <span
                className={`dashboard-summary-card__icon dashboard-summary-card__icon--${card.tone}`}
              >
                <AppIcon name={card.icon} size={16} />
              </span>
              <Text className="dashboard-summary-card__title">{card.title}</Text>
            </div>
            <Text
              className={['dashboard-summary-card__value', card.valueClassName]
                .filter(Boolean)
                .join(' ')}
            >
              {card.value}
            </Text>
            <Text className="dashboard-summary-card__meta">{card.meta}</Text>
          </button>
        );
      })}
    </div>
  );
}
