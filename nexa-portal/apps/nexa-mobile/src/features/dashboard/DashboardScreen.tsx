import type { Message } from '@nexa/contract';
import { formatCount } from '@nexa/util';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useMemo, useRef, useState, type ComponentProps } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { usePalette, useThemeStore } from '../theme/theme.store';
import { useDashboard } from './use-dashboard';

export type DashboardFilterKey = 'all' | 'pending' | 'classifier';

type Tone = 'primary' | 'warning' | 'success';
type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

function filterMessages(messages: Message[], activeFilter: DashboardFilterKey): Message[] {
  if (activeFilter === 'all' || activeFilter === 'classifier') return messages;
  if (activeFilter === 'pending') {
    return messages.filter(
      (message) => message.classification === null || message.classification === 'ENQUIRY',
    );
  }
  return messages;
}

function toneColor(tone: Tone, palette: ReturnType<typeof usePalette>): string {
  if (tone === 'warning') return palette.colorWarning;
  if (tone === 'success') return palette.colorSuccess;
  return palette.colorPrimary;
}

function classificationColors(
  classification: string | null,
  palette: ReturnType<typeof usePalette>,
): { bg: string; fg: string } {
  switch (classification) {
    case 'ENQUIRY':
      return { bg: `${palette.colorPrimary}22`, fg: palette.colorPrimary };
    case 'INTENT':
      return { bg: `${palette.colorSuccess}22`, fg: palette.colorSuccess };
    case 'PROMOTION':
      return { bg: `${palette.colorWarning}22`, fg: palette.colorWarning };
    case 'SOCIAL':
      return { bg: '#a855f722', fg: '#a855f7' };
    default:
      return { bg: '#94a3b822', fg: '#64748b' };
  }
}

function KpiCard({
  title,
  value,
  meta,
  tone,
  icon,
  active,
  onPress,
  cardBg,
  border,
  textColor,
  muted,
  accent,
}: {
  title: string;
  value: string;
  meta: string;
  tone: Tone;
  icon: IconName;
  active: boolean;
  onPress: () => void;
  cardBg: string;
  border: string;
  textColor: string;
  muted: string;
  accent: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.kpiCard,
        {
          backgroundColor: cardBg,
          borderColor: active ? accent : border,
          opacity: pressed ? 0.92 : 1,
        },
        active && { borderWidth: 1.5 },
      ]}
    >
      <View style={[styles.kpiAccentBar, { backgroundColor: accent }]} />
      <View style={styles.kpiHead}>
        <View style={[styles.kpiIconWrap, { backgroundColor: `${accent}18` }]}>
          <MaterialCommunityIcons name={icon} size={16} color={accent} />
        </View>
        <Text style={[styles.kpiTitle, { color: muted }]} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <Text
        style={[
          styles.kpiValue,
          { color: textColor },
          tone === 'success' && value.length > 12 ? styles.kpiValueSm : null,
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text style={[styles.kpiMeta, { color: muted }]} numberOfLines={2}>
        {meta}
      </Text>
    </Pressable>
  );
}

function BreakdownCard({
  title,
  data,
  cardBg,
  border,
  textColor,
  muted,
}: {
  title: string;
  data: Record<string, number>;
  cardBg: string;
  border: string;
  textColor: string;
  muted: string;
}) {
  const entries = Object.entries(data);
  if (entries.length === 0) return null;

  return (
    <View style={[styles.panel, { backgroundColor: cardBg, borderColor: border }]}>
      <Text style={[styles.panelTitle, { color: textColor }]}>{title}</Text>
      {entries.map(([label, count], index) => (
        <View
          key={label}
          style={[
            styles.breakdownRow,
            index < entries.length - 1 && { borderBottomColor: border, borderBottomWidth: StyleSheet.hairlineWidth },
          ]}
        >
          <Text style={[styles.breakdownLabel, { color: muted }]} numberOfLines={1}>
            {label}
          </Text>
          <Text style={[styles.breakdownValue, { color: textColor }]}>{formatCount(count)}</Text>
        </View>
      ))}
    </View>
  );
}

function MessageCard({
  item,
  cardBg,
  border,
  textColor,
  muted,
  palette,
}: {
  item: Message;
  cardBg: string;
  border: string;
  textColor: string;
  muted: string;
  palette: ReturnType<typeof usePalette>;
}) {
  const pill = classificationColors(item.classification, palette);

  return (
    <View style={[styles.messageCard, { backgroundColor: cardBg, borderColor: border }]}>
      <View style={styles.messageTop}>
        <Text style={[styles.messageSender, { color: textColor }]} numberOfLines={1}>
          {item.sender}
        </Text>
        <View style={[styles.pill, { backgroundColor: pill.bg }]}>
          <Text style={[styles.pillText, { color: pill.fg }]}>
            {item.classification ?? '—'}
          </Text>
        </View>
      </View>
      <Text style={[styles.messageMeta, { color: muted }]}>{item.platform}</Text>
      <Text style={[styles.messageBody, { color: textColor }]} numberOfLines={3}>
        {item.content}
      </Text>
    </View>
  );
}

export function DashboardScreen() {
  const palette = usePalette();
  const themeMode = useThemeStore((s) => s.themeMode);
  const { stats, messages, isLoading } = useDashboard();
  const [activeFilter, setActiveFilter] = useState<DashboardFilterKey>('all');
  const listRef = useRef<FlatList<Message>>(null);

  const isDark = themeMode === 'dark';
  const pageBg = isDark ? '#000000' : '#f5f5f5';
  const cardBg = isDark ? '#0a0a0a' : '#ffffff';
  const border = isDark ? '#262626' : '#e8e8e8';
  const muted = isDark ? '#a3a3a3' : '#8c8c8c';
  const textColor = palette.colorTextBase;

  const filtered = useMemo(
    () => filterMessages(messages, activeFilter),
    [messages, activeFilter],
  );

  const onFilter = useCallback((filter: DashboardFilterKey) => {
    setActiveFilter(filter);
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
  }, []);

  const emptyLabel =
    messages.length === 0
      ? 'No messages yet.'
      : filtered.length === 0
        ? 'No messages match this filter.'
        : null;

  const listHeader = (
    <View style={styles.stack}>
      <View style={styles.kpiGrid}>
        <KpiCard
          title="Total messages"
          value={formatCount(stats?.total_messages)}
          meta="Tap to show all recent messages"
          tone="primary"
          icon="inbox"
          active={activeFilter === 'all'}
          onPress={() => onFilter('all')}
          cardBg={cardBg}
          border={border}
          textColor={textColor}
          muted={muted}
          accent={toneColor('primary', palette)}
        />
        <KpiCard
          title="Pending actions"
          value={formatCount(stats?.pending_actions)}
          meta="Needs triage or follow-up"
          tone="warning"
          icon="alert-circle-outline"
          active={activeFilter === 'pending'}
          onPress={() => onFilter('pending')}
          cardBg={cardBg}
          border={border}
          textColor={textColor}
          muted={muted}
          accent={toneColor('warning', palette)}
        />
        <KpiCard
          title="AI classifier"
          value={stats?.classifier ?? '\u2014'}
          meta="Active classification model"
          tone="success"
          icon="view-dashboard-outline"
          active={activeFilter === 'classifier'}
          onPress={() => onFilter('classifier')}
          cardBg={cardBg}
          border={border}
          textColor={textColor}
          muted={muted}
          accent={toneColor('success', palette)}
        />
      </View>

      {stats ? (
        <View style={styles.breakdownGrid}>
          <BreakdownCard
            title="Priority breakdown"
            data={stats.priority_breakdown}
            cardBg={cardBg}
            border={border}
            textColor={textColor}
            muted={muted}
          />
          <BreakdownCard
            title="Classifier breakdown"
            data={stats.classifier_breakdown}
            cardBg={cardBg}
            border={border}
            textColor={textColor}
            muted={muted}
          />
        </View>
      ) : null}

      <View style={styles.sectionHead}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Recent messages</Text>
        {activeFilter === 'pending' ? (
          <Text style={[styles.sectionExtra, { color: muted }]}>Filtered: needs attention</Text>
        ) : null}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: pageBg }]}>
        <ActivityIndicator size="large" color={palette.colorPrimary} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: pageBg }]}>
      <FlatList
        ref={listRef}
        data={filtered}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          emptyLabel ? (
            <View style={[styles.emptyPanel, { backgroundColor: cardBg, borderColor: border }]}>
              <Text style={{ color: muted, fontSize: 13 }}>{emptyLabel}</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <MessageCard
            item={item}
            cardBg={cardBg}
            border={border}
            textColor={textColor}
            muted={muted}
            palette={palette}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 28,
    gap: 10,
  },
  stack: {
    gap: 14,
    marginBottom: 4,
  },
  kpiGrid: {
    gap: 10,
  },
  kpiCard: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  kpiAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  kpiHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  kpiIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  kpiValue: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 32,
    marginTop: 2,
  },
  kpiValueSm: {
    fontSize: 16,
    lineHeight: 22,
  },
  kpiMeta: {
    fontSize: 12,
    lineHeight: 16,
  },
  breakdownGrid: {
    gap: 10,
  },
  panel: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
  },
  panelTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: 12,
  },
  breakdownLabel: {
    flex: 1,
    fontSize: 13,
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  sectionExtra: {
    fontSize: 12,
  },
  emptyPanel: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  messageCard: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
    marginBottom: 2,
  },
  messageTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  messageSender: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  messageMeta: {
    fontSize: 12,
  },
  messageBody: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
});
