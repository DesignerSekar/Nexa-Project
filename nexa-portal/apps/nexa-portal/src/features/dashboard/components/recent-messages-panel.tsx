import type { Message } from '@nexa/contract';
import { Card, Typography } from 'antd';
import type { DashboardFilterKey } from './dashboard-kpi-cards';
import { RecentMessagesTable } from './recent-messages-table';

const { Text } = Typography;

interface RecentMessagesPanelProps {
  messages: Message[];
  activeFilter: DashboardFilterKey;
}

function filterMessages(messages: Message[], activeFilter: DashboardFilterKey): Message[] {
  if (activeFilter === 'all' || activeFilter === 'classifier') {
    return messages;
  }
  // "Pending" surfaces unclassified / enquiry-like items that typically need attention.
  if (activeFilter === 'pending') {
    return messages.filter(
      (message) => message.classification === null || message.classification === 'ENQUIRY'
    );
  }
  return messages;
}

export function RecentMessagesPanel({ messages, activeFilter }: RecentMessagesPanelProps) {
  const filtered = filterMessages(messages, activeFilter);
  const emptyLabel =
    messages.length === 0
      ? 'No messages yet.'
      : filtered.length === 0
        ? 'No messages match this filter.'
        : null;

  const extra =
    activeFilter === 'pending' ? (
      <Text type="secondary" className="text-xs">
        Filtered: needs attention
      </Text>
    ) : null;

  return (
    <Card
      id="dashboard-recent-messages"
      className="dashboard-panel"
      title={
        <Text strong className="dashboard-panel__title">
          Recent messages
        </Text>
      }
      extra={extra}
    >
      {emptyLabel ? (
        <Text type="secondary" className="py-5 text-[13px]">
          {emptyLabel}
        </Text>
      ) : (
        <RecentMessagesTable messages={filtered} />
      )}
    </Card>
  );
}
