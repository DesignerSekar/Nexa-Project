import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { usePalette } from '../theme/theme.store';
import { useWhatsappOnboarding } from './use-whatsapp-onboarding';

const HOW_IT_WORKS = [
  'Enter an optional user id (defaults to “default”).',
  'Tap Start — a QR appears from the bridge bot.',
  'Scan with WhatsApp Linked Devices. Status polls every 3s; QR refreshes every 18s.',
  'When connected, the session is cleaned up automatically.',
];

export function OnboardScreen() {
  const palette = usePalette();
  const onboard = useWhatsappOnboarding();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.colorBgBase }}
      contentContainerStyle={styles.content}
    >
      <Text variant="headlineSmall" style={{ color: palette.colorTextBase }}>
        WhatsApp
      </Text>
      <Text variant="bodyMedium" style={{ color: palette.colorTextBase, opacity: 0.7, marginBottom: 12 }}>
        Link a WhatsApp account via the mautrix bridge QR flow.
      </Text>

      <Text variant="titleSmall" style={{ color: palette.colorTextBase, marginBottom: 8 }}>
        How it works
      </Text>
      {HOW_IT_WORKS.map((step, index) => (
        <Text
          key={step}
          variant="bodySmall"
          style={{ color: palette.colorTextBase, opacity: 0.75, marginBottom: 4 }}
        >
          {index + 1}. {step}
        </Text>
      ))}

      {onboard.phase === 'idle' ? (
        <View style={styles.block}>
          <TextInput
            label="User id (optional)"
            mode="outlined"
            value={onboard.userId}
            onChangeText={onboard.setUserId}
            style={styles.field}
          />
          <Button
            mode="contained"
            onPress={() => void onboard.start()}
            loading={onboard.isStarting}
            disabled={onboard.isStarting}
          >
            Start onboarding
          </Button>
        </View>
      ) : null}

      {onboard.phase === 'error' ? (
        <View style={styles.block}>
          <Text variant="titleMedium" style={{ color: palette.colorTextBase }}>
            Could not connect
          </Text>
          {onboard.error ? (
            <Text style={{ color: palette.colorError, marginVertical: 8 }}>{onboard.error}</Text>
          ) : null}
          <Button mode="contained" onPress={onboard.tryAgain}>
            Try again
          </Button>
        </View>
      ) : null}

      {onboard.phase === 'scanning' ? (
        <View style={styles.block}>
          {onboard.qr ? (
            <Image
              source={{ uri: onboard.qr.startsWith('data:') ? onboard.qr : `data:image/png;base64,${onboard.qr}` }}
              style={styles.qr}
              resizeMode="contain"
            />
          ) : (
            <Text style={{ color: palette.colorTextBase }}>Waiting for QR…</Text>
          )}
          <Text variant="bodySmall" style={{ color: palette.colorTextBase, opacity: 0.7, marginVertical: 8 }}>
            Scanning — leave this screen open. Navigating away does not cancel the session.
          </Text>
          <Button mode="outlined" onPress={onboard.cancel}>
            Cancel
          </Button>
        </View>
      ) : null}

      {onboard.phase === 'connected' ? (
        <View style={styles.block}>
          <Text variant="titleMedium" style={{ color: palette.colorSuccess }}>
            Connected
          </Text>
          <Button mode="contained" onPress={onboard.reset} style={{ marginTop: 12 }}>
            Connect another
          </Button>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  block: { marginTop: 20 },
  field: { marginBottom: 12 },
  qr: { width: 240, height: 240, alignSelf: 'center', backgroundColor: '#fff' },
});
