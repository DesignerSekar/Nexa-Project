import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { usePalette } from '../theme/theme.store';
import { BRIDGE_CATALOG } from './bridge-catalog';
import { useBridgeCard } from './use-bridge-card';
import type { MainTabParamList } from '../../app/navigation';

function BridgeCardRow({
  displayName,
  description,
  platform,
  connectTo,
}: (typeof BRIDGE_CATALOG)[number]) {
  const palette = usePalette();
  const card = useBridgeCard(platform);
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  return (
    <View style={[styles.card, { borderColor: palette.colorTextBase + '33' }]}>
      <Text variant="titleMedium" style={{ color: palette.colorTextBase }}>
        {displayName}
      </Text>
      <Text variant="bodySmall" style={{ color: palette.colorTextBase, opacity: 0.7, marginBottom: 8 }}>
        {description}
      </Text>

      {card.isChecking ? (
        <ActivityIndicator />
      ) : (
        <Text variant="labelLarge" style={{ color: palette.colorTextBase, marginBottom: 8 }}>
          Status: {card.statusError || card.status || 'unknown'}
        </Text>
      )}

      {card.actionMessage ? (
        <Text style={{ color: palette.colorSuccess, marginBottom: 4 }}>{card.actionMessage}</Text>
      ) : null}
      {card.actionError ? (
        <Text style={{ color: palette.colorError, marginBottom: 4 }}>{card.actionError}</Text>
      ) : null}

      {card.isConnected ? (
        <Button
          mode="outlined"
          onPress={() => card.disconnect()}
          loading={card.isDisconnecting}
          disabled={card.isDisconnecting}
        >
          Disconnect
        </Button>
      ) : connectTo === 'onboard' ? (
        <Button mode="contained" onPress={() => navigation.navigate('WhatsApp')}>
          Connect
        </Button>
      ) : (
        <Button mode="contained" disabled>
          Connect (unavailable)
        </Button>
      )}
    </View>
  );
}

export function BridgesScreen() {
  const palette = usePalette();

  return (
    <View style={[styles.root, { backgroundColor: palette.colorBgBase }]}>
      <Text variant="headlineSmall" style={{ color: palette.colorTextBase, marginBottom: 16 }}>
        Bridges
      </Text>
      {BRIDGE_CATALOG.map((bridge) => (
        <BridgeCardRow key={bridge.platform} {...bridge} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16 },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
});
