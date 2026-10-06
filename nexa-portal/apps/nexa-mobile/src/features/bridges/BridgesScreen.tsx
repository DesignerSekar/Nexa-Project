import { BRIDGE_STATUS } from '@nexa/contract';
import { humanizeStatus } from '@nexa/util';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { ComponentProps } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Portal, Text } from 'react-native-paper';
import type { MainTabParamList } from '../../app/navigation';
import { usePalette, useThemeStore } from '../theme/theme.store';
import { BRIDGE_CATALOG, type BridgeDefinition } from './bridge-catalog';
import { useBridgeCard } from './use-bridge-card';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

function platformIcon(platform: BridgeDefinition['platform']): IconName {
  if (platform === 'whatsapp') return 'whatsapp';
  if (platform === 'linkedin') return 'linkedin';
  return 'link-variant';
}

function statusTone(
  status: string | null,
  hasError: boolean,
  palette: ReturnType<typeof usePalette>,
): { color: string; label: string } {
  if (hasError) {
    return { color: palette.colorError, label: 'Could not reach bridge' };
  }
  if (!status) {
    return { color: '#94a3b8', label: humanizeStatus(null) };
  }
  if (status === BRIDGE_STATUS.connected) {
    return { color: palette.colorSuccess, label: humanizeStatus(status) };
  }
  if (status === BRIDGE_STATUS.loggedOut || status === BRIDGE_STATUS.disconnected) {
    return { color: palette.colorWarning, label: humanizeStatus(status) };
  }
  return { color: '#94a3b8', label: humanizeStatus(status) };
}

function BridgeCardRow({ bridge }: { bridge: BridgeDefinition }) {
  const palette = usePalette();
  const themeMode = useThemeStore((s) => s.themeMode);
  const card = useBridgeCard(bridge.platform);
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  const isDark = themeMode === 'dark';
  const cardBg = isDark ? '#0a0a0a' : '#ffffff';
  const border = isDark ? '#262626' : '#e8e8e8';
  const muted = isDark ? '#a3a3a3' : '#8c8c8c';
  const textColor = palette.colorTextBase;
  const iconAccent =
    bridge.platform === 'whatsapp'
      ? '#25D366'
      : bridge.platform === 'linkedin'
        ? '#0A66C2'
        : palette.colorPrimary;

  const tone = statusTone(card.status, Boolean(card.statusError), palette);

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
      <View style={styles.cardTop}>
        <View style={[styles.iconWrap, { backgroundColor: `${iconAccent}18` }]}>
          <MaterialCommunityIcons name={platformIcon(bridge.platform)} size={22} color={iconAccent} />
        </View>

        <View style={styles.cardBody}>
          <View style={styles.titleRow}>
            <Text style={[styles.cardTitle, { color: textColor }]} numberOfLines={1}>
              {bridge.displayName}
            </Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: card.isChecking ? `${muted}22` : `${tone.color}18`,
                },
              ]}
            >
              {card.isChecking ? (
                <>
                  <ActivityIndicator size="small" color={palette.colorPrimary} />
                  <Text style={[styles.statusLabel, { color: muted }]}>Checking…</Text>
                </>
              ) : (
                <>
                  <View style={[styles.statusDot, { backgroundColor: tone.color }]} />
                  <Text style={[styles.statusLabel, { color: tone.color }]} numberOfLines={1}>
                    {tone.label}
                  </Text>
                </>
              )}
            </View>
          </View>
          <Text style={[styles.cardDesc, { color: muted }]}>{bridge.description}</Text>
        </View>
      </View>

      {card.actionMessage ? (
        <Text style={[styles.feedback, { color: palette.colorSuccess }]}>{card.actionMessage}</Text>
      ) : null}
      {card.actionError ? (
        <Text style={[styles.feedback, { color: palette.colorError }]}>{card.actionError}</Text>
      ) : null}
      {card.statusError && !card.isChecking ? (
        <Text style={[styles.feedback, { color: palette.colorError }]}>{card.statusError}</Text>
      ) : null}

      <View style={styles.actions}>
        {card.isConnected ? (
          <Button
            mode="contained"
            buttonColor={palette.colorError}
            textColor="#ffffff"
            onPress={() => card.disconnect()}
            disabled={card.isDisconnecting}
            style={styles.actionBtn}
            contentStyle={styles.actionBtnContent}
            icon="link-off"
          >
            Disconnect
          </Button>
        ) : bridge.connectTo === 'onboard' ? (
          <Button
            mode="contained"
            buttonColor={palette.colorPrimary}
            textColor="#ffffff"
            onPress={() => navigation.navigate('WhatsApp')}
            disabled={card.isDisconnecting}
            style={styles.actionBtn}
            contentStyle={styles.actionBtnContent}
            icon="link-variant"
          >
            Connect
          </Button>
        ) : (
          <Button
            mode="contained"
            disabled
            style={styles.actionBtn}
            contentStyle={styles.actionBtnContent}
          >
            Connect
          </Button>
        )}
      </View>

      {!card.isConnected && bridge.connectTo === null ? (
        <Text style={[styles.hint, { color: muted }]}>
          {bridge.displayName} onboarding is not available yet.
        </Text>
      ) : null}

      {card.isDisconnecting ? (
        <Portal>
          <View
            style={[
              styles.spinnerOverlay,
              { backgroundColor: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.72)' },
            ]}
            accessibilityLabel="Disconnecting"
            accessibilityRole="progressbar"
          >
            <ActivityIndicator size="large" color={palette.colorPrimary} />
          </View>
        </Portal>
      ) : null}
    </View>
  );
}

export function BridgesScreen() {
  const themeMode = useThemeStore((s) => s.themeMode);
  const pageBg = themeMode === 'dark' ? '#000000' : '#f5f5f5';

  return (
    <View style={[styles.root, { backgroundColor: pageBg }]}>
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {BRIDGE_CATALOG.map((bridge) => (
          <BridgeCardRow key={bridge.platform} bridge={bridge} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 12,
  },
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    gap: 10,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    minWidth: 0,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    maxWidth: '52%',
    flexShrink: 0,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  feedback: {
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    alignItems: 'stretch',
  },
  actionBtn: {
    borderRadius: 8,
  },
  actionBtnContent: {
    paddingVertical: 4,
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
  },
  spinnerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
});
