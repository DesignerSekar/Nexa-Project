import type { Message } from '@nexa/contract';
import { formatCount, formatTimestamp, senderHandle, truncate } from '@nexa/util';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useMemo, useRef, useState, type ComponentProps } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
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
      return { bg: '#0d948822', fg: '#0d9488' };
    default:
      return { bg: '#94a3b822', fg: '#64748b' };
  }
}

function platformIcon(platform: string): IconName {
  const key = platform.toLowerCase();
  if (key.includes('whatsapp')) return 'whatsapp';
  if (key.includes('linkedin')) return 'linkedin';
  return 'message-text-outline';
}

function platformAccent(platform: string, fallback: string): string {
  const key = platform.toLowerCase();
  if (key.includes('whatsapp')) return '#25D366';
  if (key.includes('linkedin')) return '#0A66C2';
  return fallback;
}

function KpiCard({
  title,
  value,
  meta,
  icon,
  active,
  onPress,
  cardBg,
  border,
  textColor,
  muted,
  accent,
  wide,
}: {
  title: string;
  value: string;
  meta: string;
  icon: IconName;
  active: boolean;
  onPress: () => void;
  cardBg: string;
  border: string;
  textColor: string;
  muted: string;
  accent: string;
  wide?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.kpiCard,
        wide ? styles.kpiCardWide : styles.kpiCardHalf,
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
          value.length > 14 ? styles.kpiValueSm : null,
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
  accent,
}: {
  title: string;
  data: Record<string, number>;
  cardBg: string;
  border: string;
  textColor: string;
  muted: string;
  accent: string;
}) {
  const entries = Object.entries(data);
  if (entries.length === 0) return null;

  const max = Math.max(...entries.map(([, count]) => count), 1);

  return (
    <View style={[styles.panel, { backgroundColor: cardBg, borderColor: border }]}>
      <Text style={[styles.panelTitle, { color: textColor }]}>{title}</Text>
      {entries.map(([label, count], index) => (
        <View
          key={label}
          style={[
            styles.breakdownRow,
            index < entries.length - 1 && {
              borderBottomColor: border,
              borderBottomWidth: StyleSheet.hairlineWidth,
            },
          ]}
        >
          <View style={styles.breakdownMain}>
            <View style={styles.breakdownTop}>
              <Text style={[styles.breakdownLabel, { color: muted }]} numberOfLines={1}>
                {label}
              </Text>
              <Text style={[styles.breakdownValue, { color: textColor }]}>
                {formatCount(count)}
              </Text>
            </View>
            <View style={[styles.barTrack, { backgroundColor: `${muted}22` }]}>
              <View
                style={[
                  styles.barFill,
                  { width: `${Math.round((count / max) * 100)}%`, backgroundColor: accent },
                ]}
              />
            </View>
          </View>
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
  const accent = platformAccent(item.platform, palette.colorPrimary);

  return (
    <View style={[styles.messageCard, { backgroundColor: cardBg, borderColor: border }]}>
      <View style={styles.messageTop}>
        <View style={[styles.platformIcon, { backgroundColor: `${accent}18` }]}>
          <MaterialCommunityIcons name={platformIcon(item.platform)} size={16} color={accent} />
        </View>
        <View style={styles.messageHeadText}>
          <Text style={[styles.messageSender, { color: textColor }]} numberOfLines={1}>
            {senderHandle(item.sender)}
          </Text>
          <Text style={[styles.messageMeta, { color: muted }]} numberOfLines={1}>
            {item.platform}
            {item.timestamp ? ` · ${formatTimestamp(item.timestamp)}` : ''}
          </Text>
        </View>
        <View style={[styles.pill, { backgroundColor: pill.bg }]}>
          <Text style={[styles.pillText, { color: pill.fg }]}>
            {item.classification ?? '—'}
          </Text>
        </View>
      </View>
      <Text style={[styles.messageBody, { color: textColor }]} numberOfLines={3}>
        {truncate(item.content)}
      </Text>
    </View>
  );
}

export function DashboardScreen() {
  const palette = usePalette();
  const themeMode = useThemeStore((s) => s.themeMode);
  const { stats, messages, isLoading, isFetching, refetch } = useDashboard();
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
          meta="Tap to show all"
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
          title="Pending"
          value={formatCount(stats?.pending_actions)}
          meta="Needs triage"
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
          icon="view-dashboard-outline"
          active={activeFilter === 'classifier'}
          onPress={() => onFilter('classifier')}
          cardBg={cardBg}
          border={border}
          textColor={textColor}
          muted={muted}
          accent={toneColor('success', palette)}
          wide
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
            accent={palette.colorPrimary}
          />
          <BreakdownCard
            title="Classifier breakdown"
            data={stats.classifier_breakdown}
            cardBg={cardBg}
            border={border}
            textColor={textColor}
            muted={muted}
            accent={palette.colorSuccess}
          />
        </View>
      ) : null}

      <View style={styles.sectionHead}>
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Recent messages</Text>
          <View style={[styles.countBadge, { backgroundColor: `${muted}22` }]}>
            <Text style={[styles.countBadgeText, { color: muted }]}>
              {formatCount(filtered.length)}
            </Text>
          </View>
        </View>
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
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={() => refetch()}
            tintColor={palette.colorPrimary}
            colors={[palette.colorPrimary]}
          />
        }
        ListEmptyComponent={
          emptyLabel ? (
            <View style={[styles.emptyPanel, { backgroundColor: cardBg, borderColor: border }]}>
              <View style={[styles.emptyIcon, { backgroundColor: `${muted}18` }]}>
                <MaterialCommunityIcons name="inbox-outline" size={28} color={muted} />
              </View>
              <Text style={[styles.emptyTitle, { color: textColor }]}>{emptyLabel}</Text>
              <Text style={[styles.emptyHint, { color: muted }]}>
                Pull down to refresh when new messages arrive.
              </Text>
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
    paddingTop: 12,
    paddingBottom: 28,
    gap: 10,
  },
  stack: {
    gap: 12,
    marginBottom: 2,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kpiCard: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  kpiCardHalf: {
    width: '48%',
    flexGrow: 1,
    minWidth: '46%',
  },
  kpiCardWide: {
    width: '100%',
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
    fontSize: 12,
    fontWeight: '500',
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
    marginTop: 2,
  },
  kpiValueSm: {
    fontSize: 15,
    lineHeight: 20,
  },
  kpiMeta: {
    fontSize: 11,
    lineHeight: 15,
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
    fontWeight: '700',
    marginBottom: 4,
  },
  breakdownRow: {
    paddingVertical: 10,
  },
  breakdownMain: {
    gap: 6,
  },
  breakdownTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  barTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  sectionHead: {
    marginTop: 4,
    gap: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  countBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sectionExtra: {
    fontSize: 12,
  },
  emptyPanel: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyHint: {
    fontSize: 12,
    textAlign: 'center',
  },
  messageCard: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  messageTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  platformIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageHeadText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  messageSender: {
    fontSize: 14,
    fontWeight: '600',
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
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
  },
});
