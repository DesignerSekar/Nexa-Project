import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, Image, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { usePalette, useThemeStore } from '../theme/theme.store';
import { useWhatsappOnboarding, type OnboardPhase } from './use-whatsapp-onboarding';

const WA_GREEN = '#25D366';

const STEPS = [
  'Enter a user ID (any label, e.g. your name)',
  'Tap Start onboarding — a QR code will appear',
  'Open WhatsApp → Linked devices → Link a device',
  'Scan the QR code',
] as const;

function activeStepIndex(phase: OnboardPhase): number {
  switch (phase) {
    case 'idle':
      return 0;
    case 'scanning':
      return 3;
    case 'connected':
      return 4;
    case 'error':
      return 0;
    default:
      return 0;
  }
}

export function OnboardScreen() {
  const palette = usePalette();
  const themeMode = useThemeStore((s) => s.themeMode);
  const onboard = useWhatsappOnboarding();

  const isDark = themeMode === 'dark';
  const pageBg = isDark ? '#000000' : '#f5f5f5';
  const cardBg = isDark ? '#0a0a0a' : '#ffffff';
  const border = isDark ? '#262626' : '#e8e8e8';
  const muted = isDark ? '#a3a3a3' : '#8c8c8c';
  const textColor = palette.colorTextBase;
  const busy = onboard.isStarting;
  const active = activeStepIndex(onboard.phase);

  return (
    <View style={[styles.root, { backgroundColor: pageBg }]}>
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        pointerEvents={busy ? 'none' : 'auto'}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
          <View style={styles.heroRow}>
            <View style={[styles.iconWrap, { backgroundColor: `${WA_GREEN}18` }]}>
              <MaterialCommunityIcons name="whatsapp" size={26} color={WA_GREEN} />
            </View>
            <View style={styles.heroText}>
              <Text style={[styles.heroTitle, { color: textColor }]}>Connect WhatsApp</Text>
              <Text style={[styles.heroDesc, { color: muted }]}>
                Link an account so Nexa can receive and classify messages.
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>How it works</Text>
          <Text style={[styles.sectionSubtitle, { color: muted }]}>
            Follow these steps on this screen and on your phone.
          </Text>

          <View style={styles.steps} accessibilityLabel="How to connect WhatsApp">
            {STEPS.map((step, index) => {
              const done = index < active;
              const isActive = index === active;
              const badgeColor = done || isActive ? WA_GREEN : muted;
              const labelColor = done || isActive ? textColor : muted;

              return (
                <View
                  key={step}
                  style={[
                    styles.stepRow,
                    index < STEPS.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.stepBadge,
                      {
                        backgroundColor: done || isActive ? `${WA_GREEN}22` : `${muted}18`,
                      },
                    ]}
                  >
                    {done ? (
                      <MaterialCommunityIcons name="check" size={14} color={badgeColor} />
                    ) : (
                      <Text style={[styles.stepIndex, { color: badgeColor }]}>{index + 1}</Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepText,
                      { color: labelColor, fontWeight: isActive ? '600' : '400' },
                    ]}
                  >
                    {step}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
          {onboard.phase === 'idle' ? (
            <View style={styles.actionBlock}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Start linking</Text>
              <Text style={[styles.sectionSubtitle, { color: muted }]}>
                Use any label you will recognize later. Leave blank to use default.
              </Text>

              <TextInput
                label="User ID"
                mode="outlined"
                value={onboard.userId}
                onChangeText={onboard.setUserId}
                placeholder="e.g. alice"
                style={styles.field}
                disabled={busy}
                outlineColor={border}
                activeOutlineColor={palette.colorPrimary}
                left={<TextInput.Icon icon="account" color={palette.colorTextBase} />}
              />

              <Button
                mode="contained"
                buttonColor={palette.colorPrimary}
                textColor="#ffffff"
                onPress={() => void onboard.start()}
                disabled={busy}
                style={styles.actionBtn}
                contentStyle={styles.actionBtnContent}
                icon="play"
              >
                Start onboarding
              </Button>
            </View>
          ) : null}

          {onboard.phase === 'scanning' ? (
            <View style={styles.actionBlock}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Scan the QR code</Text>
              <Text style={[styles.sectionSubtitle, { color: muted }]}>
                WhatsApp → Linked devices → Link a device
              </Text>

              <View style={[styles.qrFrame, { borderColor: border, backgroundColor: '#ffffff' }]}>
                {onboard.qr ? (
                  <Image
                    source={{
                      uri: onboard.qr.startsWith('data:')
                        ? onboard.qr
                        : `data:image/png;base64,${onboard.qr}`,
                    }}
                    style={styles.qr}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.qrPlaceholder}>
                    <ActivityIndicator size="small" color={palette.colorPrimary} />
                    <Text style={{ color: muted, marginTop: 8 }}>Waiting for QR…</Text>
                  </View>
                )}
              </View>

              <Text style={[styles.hint, { color: muted }]}>
                Leave this screen open while you scan. Navigating away does not cancel the session.
              </Text>

              <Button
                mode="contained"
                onPress={onboard.cancel}
                disabled={busy}
                buttonColor={palette.colorError}
                textColor="#ffffff"
                style={styles.actionBtn}
                contentStyle={styles.actionBtnContent}
                
              >
                Cancel
              </Button>
            </View>
          ) : null}

          {onboard.phase === 'connected' ? (
            <View style={styles.resultBlock}>
              <View style={[styles.resultIcon, { backgroundColor: `${palette.colorSuccess}18` }]}>
                <MaterialCommunityIcons name="check-circle" size={36} color={palette.colorSuccess} />
              </View>
              <Text style={[styles.resultTitle, { color: textColor }]}>WhatsApp connected!</Text>
              <Text style={[styles.resultSubtitle, { color: muted }]}>
                Messages will now be classified automatically.
              </Text>
              <Button
                mode="contained"
                buttonColor={palette.colorPrimary}
                textColor="#ffffff"
                onPress={onboard.reset}
                disabled={busy}
                style={styles.actionBtn}
                contentStyle={styles.actionBtnContent}
                icon="qrcode"
              >
                Connect another
              </Button>
            </View>
          ) : null}

          {onboard.phase === 'error' ? (
            <View style={styles.actionBlock}>
              <View style={[styles.resultIcon, { backgroundColor: `${palette.colorError}18` }]}>
                <MaterialCommunityIcons name="alert-circle" size={36} color={palette.colorError} />
              </View>
              <Text style={[styles.sectionTitle, { color: textColor, textAlign: 'center' }]}>
                Could not connect
              </Text>
              <Text style={[styles.sectionSubtitle, { color: muted, textAlign: 'center' }]}>
                Something went wrong while linking WhatsApp. You can try again.
              </Text>
              {onboard.error ? (
                <Text style={[styles.errorText, { color: palette.colorError }]}>{onboard.error}</Text>
              ) : null}
              <Button
                mode="contained"
                buttonColor={palette.colorPrimary}
                textColor="#ffffff"
                onPress={onboard.tryAgain}
                disabled={busy}
                style={styles.actionBtn}
                contentStyle={styles.actionBtnContent}
                icon="refresh"
              >
                Try again
              </Button>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {busy ? (
        <View
          style={[
            styles.spinnerOverlay,
            { backgroundColor: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.72)' },
          ]}
          accessibilityLabel="Starting onboarding"
          accessibilityRole="progressbar"
        >
          <ActivityIndicator size="large" color={palette.colorPrimary} />
        </View>
      ) : null}
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
    paddingVertical: 14,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
  },
  heroDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 12,
  },
  steps: {
    gap: 0,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndex: {
    fontSize: 12,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  actionBlock: {
    gap: 0,
  },
  field: {
    marginBottom: 14,
  },
  actionBtn: {
    borderRadius: 8,
  },
  actionBtnContent: {
    paddingVertical: 4,
  },
  qrFrame: {
    alignSelf: 'center',
    width: 248,
    height: 248,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 12,
  },
  qr: {
    width: 220,
    height: 220,
  },
  qrPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: 14,
  },
  resultBlock: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  resultIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    textAlign: 'center',
  },
  resultSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 14,
  },
  spinnerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
});
