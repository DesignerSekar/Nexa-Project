import { FontAwesome } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Button,
  Divider,
  HelperText,
  IconButton,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePalette, useThemeStore } from '../theme/theme.store';
import { useLoginForm, type AuthTab } from './use-login-form';

/** Eight bullets, matching web LoginPage password placeholders. */
const PASSWORD_PLACEHOLDER = '\u2022'.repeat(8);

/** Official-ish Google brand blue for the G mark. */
const GOOGLE_BRAND = '#4285F4';
/** GitHub mark — invert on dark surfaces. */
const GITHUB_BRAND_LIGHT = '#24292F';
const GITHUB_BRAND_DARK = '#F0F6FC';

function FieldLabel({
  label,
  required,
  color,
  errorColor,
}: {
  label: string;
  required?: boolean;
  color: string;
  errorColor: string;
}) {
  return (
    <Text style={[styles.fieldLabel, { color }]}>
      {label}
      {required ? <Text style={{ color: errorColor }}> *</Text> : null}
    </Text>
  );
}

/**
 * Sign in / Create account — visual parity with web LoginPage + PublicLayout.
 * OAuth buttons stay disabled until deep-link Phase 3b.
 */
export function AuthScreen() {
  const palette = usePalette();
  const themeMode = useThemeStore((s) => s.themeMode);
  const toggleTheme = useThemeStore((s) => s.toggleThemeMode);
  const form = useLoginForm();
  const [showPassword, setShowPassword] = useState(false);

  const isDark = themeMode === 'dark';
  const pageBg = isDark ? '#000000' : '#f5f5f5';
  const cardBg = isDark ? '#0a0a0a' : '#ffffff';
  const muted = isDark ? '#a3a3a3' : '#8c8c8c';
  const labelColor = isDark ? '#fafafa' : '#262626';
  const border = isDark ? '#333333' : '#d9d9d9';
  const tabInactive = isDark ? '#a3a3a3' : '#595959';

  const submitLabel = form.isSubmitting
    ? 'Please wait\u2026'
    : form.tab === 'login'
      ? 'Sign in'
      : 'Create account';

  const selectTab = (tab: AuthTab) => form.selectTab(tab);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: pageBg }]}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.toggleRow}>
          <IconButton
            icon={isDark ? 'white-balance-sunny' : 'moon-waning-crescent'}
            onPress={toggleTheme}
            accessibilityLabel={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            iconColor={palette.colorTextBase}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Surface
            style={[
              styles.card,
              {
                backgroundColor: cardBg,
                borderColor: border,
                shadowColor: isDark ? '#000000' : '#0f172a',
              },
            ]}
            elevation={isDark ? 0 : 2}
          >
            <View
              pointerEvents={form.isSubmitting ? 'none' : 'auto'}
              style={form.isSubmitting ? styles.cardDimmed : undefined}
            >
            <View style={styles.brand}>
              <Text style={[styles.title, { color: palette.colorTextBase }]}>Nexa</Text>
              <Text style={[styles.subtitle, { color: muted }]}>
                AI message routing for WhatsApp, LinkedIn, Instagram & X
              </Text>
            </View>

            <View style={[styles.tabs, { borderBottomColor: border }]}>
              {(
                [
                  { key: 'login', label: 'Sign in' },
                  { key: 'register', label: 'Create account' },
                ] as const
              ).map((tab) => {
                const active = form.tab === tab.key;
                return (
                  <Pressable
                    key={tab.key}
                    onPress={() => selectTab(tab.key)}
                    style={[
                      styles.tab,
                      active && {
                        borderBottomColor: palette.colorPrimary,
                        borderBottomWidth: 2,
                      },
                    ]}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: active }}
                  >
                    <Text
                      style={[
                        styles.tabLabel,
                        {
                          color: active ? palette.colorTextBase : tabInactive,
                          fontWeight: active ? '600' : '400',
                        },
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.form}>
              {form.tab === 'register' ? (
                <View style={styles.fieldBlock}>
                  <FieldLabel
                    label="Name"
                    required
                    color={labelColor}
                    errorColor={palette.colorError}
                  />
                  <TextInput
                    mode="outlined"
                    value={form.name}
                    onChangeText={form.setName}
                    autoCapitalize="words"
                    autoComplete="name"
                    placeholder="Jane Doe"
                    outlineColor={border}
                    activeOutlineColor={palette.colorPrimary}
                    style={[styles.input, { backgroundColor: cardBg }]}
                    dense
                  />
                </View>
              ) : null}

              <View style={styles.fieldBlock}>
                <FieldLabel
                  label="Email"
                  required
                  color={labelColor}
                  errorColor={palette.colorError}
                />
                <TextInput
                  mode="outlined"
                  value={form.email}
                  onChangeText={form.setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  placeholder="you@example.com"
                  outlineColor={border}
                  activeOutlineColor={palette.colorPrimary}
                  style={[styles.input, { backgroundColor: cardBg }]}
                  dense
                />
              </View>

              <View style={styles.fieldBlock}>
                <FieldLabel
                  label="Password"
                  required
                  color={labelColor}
                  errorColor={palette.colorError}
                />
                <TextInput
                  mode="outlined"
                  value={form.password}
                  onChangeText={form.setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete={form.tab === 'login' ? 'password' : 'password-new'}
                  placeholder={PASSWORD_PLACEHOLDER}
                  outlineColor={border}
                  activeOutlineColor={palette.colorPrimary}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowPassword((v) => !v)}
                    />
                  }
                  style={[styles.input, { backgroundColor: cardBg }]}
                  dense
                />
              </View>

              {form.tab === 'register' ? (
                <View style={styles.fieldBlock}>
                  <FieldLabel label="Mobile number" color={labelColor} errorColor={palette.colorError} />
                  <TextInput
                    mode="outlined"
                    value={form.phone}
                    onChangeText={form.setPhone}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    placeholder="+91 9876543210"
                    outlineColor={border}
                    activeOutlineColor={palette.colorPrimary}
                    style={[styles.input, { backgroundColor: cardBg }]}
                    dense
                  />
                </View>
              ) : null}

              {form.error ? (
                <HelperText type="error" visible style={{ color: palette.colorError, paddingHorizontal: 0 }}>
                  {form.error}
                </HelperText>
              ) : null}

              <Button
                mode="contained"
                onPress={() => void form.submit()}
                loading={form.isSubmitting}
                disabled={form.isSubmitting}
                buttonColor={palette.colorPrimary}
                textColor="#ffffff"
                style={styles.submit}
                contentStyle={styles.submitContent}
                labelStyle={styles.submitLabel}
              >
                {submitLabel}
              </Button>
            </View>

            <View style={styles.dividerRow}>
              <Divider style={[styles.dividerLine, { backgroundColor: border }]} />
              <Text style={[styles.dividerText, { color: muted }]}>or continue with</Text>
              <Divider style={[styles.dividerLine, { backgroundColor: border }]} />
            </View>

            <View style={styles.oauthRow}>
              <Button
                mode="outlined"
                onPress={() => undefined}
                style={[styles.oauthBtn, { borderColor: border, backgroundColor: cardBg }]}
                textColor={labelColor}
                icon={({ size }) => (
                  <FontAwesome name="google" size={size} color={GOOGLE_BRAND} />
                )}
                contentStyle={styles.oauthContent}
              >
                Google
              </Button>
              <Button
                mode="outlined"
                onPress={() => undefined}
                style={[styles.oauthBtn, { borderColor: border, backgroundColor: cardBg }]}
                textColor={labelColor}
                icon={({ size }) => (
                  <FontAwesome
                    name="github"
                    size={size}
                    color={isDark ? GITHUB_BRAND_DARK : GITHUB_BRAND_LIGHT}
                  />
                )}
                contentStyle={styles.oauthContent}
              >
                GitHub
              </Button>
            </View>
            <Text style={[styles.oauthHint, { color: muted }]}>
              OAuth opens on web for now; email/password works here.
            </Text>
            </View>

            {form.isSubmitting ? (
              <View
                style={[
                  styles.spinnerOverlay,
                  { backgroundColor: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.72)' },
                ]}
                accessibilityLabel="Signing in"
                accessibilityRole="progressbar"
              >
                <ActivityIndicator size="large" color={palette.colorPrimary} />
              </View>
            ) : null}
          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  root: { flex: 1 },
  toggleRow: {
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 22,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  cardDimmed: {
    opacity: 0.55,
  },
  spinnerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  brand: {
    alignItems: 'center',
    marginBottom: 14,
    gap: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 14,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginRight: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -StyleSheet.hairlineWidth,
  },
  tabLabel: {
    fontSize: 14,
  },
  form: {
    gap: 10,
  },
  fieldBlock: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    fontSize: 14,
  },
  submit: {
    marginTop: 4,
    borderRadius: 8,
  },
  submitContent: {
    paddingVertical: 8,
  },
  submitLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  dividerText: {
    fontSize: 12,
    marginHorizontal: 10,
  },
  oauthRow: { flexDirection: 'row', gap: 10 },
  oauthBtn: { flex: 1, borderRadius: 8 },
  oauthContent: { paddingVertical: 4 },
  oauthHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
});
