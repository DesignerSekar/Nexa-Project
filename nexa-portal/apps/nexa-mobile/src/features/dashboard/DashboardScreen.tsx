import type { Message, Stats } from '@nexa/contract';
import { formatCount } from '@nexa/util';
import { useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Chip, Text } from 'react-native-paper';
import { usePalette } from '../theme/theme.store';
import { useDashboard } from './use-dashboard';

export type DashboardFilterKey = 'all' | 'pending' | 'classifier';

function filterMessages(messages: Message[], activeFilter: DashboardFilterKey): Message[] {
  if (activeFilter === 'all' || activeFilter === 'classifier') return messages;
  if (activeFilter === 'pending') {
    return messages.filter(
      (message) => message.classification === null || message.classification === 'ENQUIRY'
    );
  }
  return messages;
}

function BreakdownBlock({
  title,
  data,
  textColor,
}: {
  title: string;
  data: Record<string, number>;
  textColor: string;
}) {
  const entries = Object.entries(data);
  if (entries.length === 0) {
    return (
      <View style={styles.breakdown}>
        <Text variant="titleSmall" style={{ color: textColor }}>
          {title}
        </Text>
        <Text variant="bodySmall" style={{ color: textColor, opacity: 0.6 }}>
          No data
        </Text>
      </View>
    );
  }
  return (
    <View style={styles.breakdown}>
      <Text variant="titleSmall" style={{ color: textColor }}>
        {title}
      </Text>
      {entries.map(([key, value]) => (
        <Text key={key} variant="bodySmall" style={{ color: textColor, opacity: 0.8 }}>
          {key}: {formatCount(value)}
        </Text>
      ))}
    </View>
  );
}

function KpiChip({
  label,
  value,
  active,
  onPress,
}: {
  label: string;
  value: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={{ flex: 1 }}>
      <Chip selected={active} showSelectedOverlay style={styles.kpi}>
        <Text variant="labelLarge">{label}</Text>
        {'\n'}
        <Text variant="titleMedium">{value}</Text>
      </Chip>
    </Pressable>
  );
}

export function DashboardScreen() {
  const palette = usePalette();
  const { stats, messages, isLoading, isFetching, refetch } = useDashboard();
  const [activeFilter, setActiveFilter] = useState<DashboardFilterKey>('all');
  const listRef = useRef<FlatList<Message>>(null);
  const filtered = filterMessages(messages, activeFilter);

  const onFilter = (filter: DashboardFilterKey) => {
    setActiveFilter(filter);
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: palette.colorBgBase }]}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: palette.colorBgBase }]}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={{ color: palette.colorTextBase }}>
          Dashboard
        </Text>
        <Chip icon="refresh" onPress={() => refetch()} selected={isFetching && !isLoading}>
          Refresh
        </Chip>
      </View>

      <View style={styles.kpiRow}>
        <KpiChip
          label="Total"
          value={formatCount(stats?.total_messages)}
          active={activeFilter === 'all'}
          onPress={() => onFilter('all')}
        />
        <KpiChip
          label="Pending"
          value={formatCount(stats?.pending_actions)}
          active={activeFilter === 'pending'}
          onPress={() => onFilter('pending')}
        />
        <KpiChip
          label="Classifier"
          value={stats?.classifier ?? '—'}
          active={activeFilter === 'classifier'}
          onPress={() => onFilter('classifier')}
        />
      </View>

      {stats ? <StatsBreakdowns stats={stats} textColor={palette.colorTextBase} /> : null}

      <Text variant="titleMedium" style={[styles.listTitle, { color: palette.colorTextBase }]}>
        Recent messages
        {activeFilter === 'pending' ? ' · needs attention' : ''}
      </Text>

      <FlatList
        ref={listRef}
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={{ color: palette.colorTextBase, opacity: 0.6 }}>
            {messages.length === 0 ? 'No messages yet.' : 'No messages match this filter.'}
          </Text>
        }
        renderItem={({ item }) => (
          <View style={[styles.row, { borderColor: palette.colorTextBase + '22' }]}>
            <Text variant="labelLarge" style={{ color: palette.colorTextBase }}>
              {item.sender}
            </Text>
            <Text variant="bodySmall" style={{ color: palette.colorTextBase, opacity: 0.7 }}>
              {item.platform} · {item.classification ?? 'unclassified'}
            </Text>
            <Text
              variant="bodyMedium"
              numberOfLines={2}
              style={{ color: palette.colorTextBase, marginTop: 4 }}
            >
              {item.content}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

function StatsBreakdowns({ stats, textColor }: { stats: Stats; textColor: string }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.breakdownScroll}>
      <BreakdownBlock
        title="Priority"
        data={stats.priority_breakdown}
        textColor={textColor}
      />
      <BreakdownBlock
        title="Classifier"
        data={stats.classifier_breakdown}
        textColor={textColor}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  kpiRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  kpi: { minHeight: 64, justifyContent: 'center' },
  breakdownScroll: { maxHeight: 100, paddingHorizontal: 16, marginBottom: 8 },
  breakdown: { marginRight: 16, minWidth: 140 },
  listTitle: { paddingHorizontal: 16, marginBottom: 8 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  row: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
});
