import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { usePalette } from '../theme/theme.store';
import { useLoginForm } from './use-login-form';

/**
 * Sign in / Create account. OAuth buttons are present but disabled until deep-link Phase 3b —
 * same binding #5 target; do not invent a new OAuth API.
 */
export function AuthScreen() {
  const palette = usePalette();
  const form = useLoginForm();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: palette.colorBgBase }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text variant="displaySmall" style={{ color: palette.colorTextBase, fontWeight: '700' }}>
          Nexa
        </Text>
        <Text variant="bodyMedium" style={[styles.sub, { color: palette.colorTextBase }]}>
          Sign in to manage bridges and triage messages.
        </Text>

        <SegmentedButtons
          value={form.tab}
          onValueChange={(value) => form.selectTab(value as 'login' | 'register')}
          buttons={[
            { value: 'login', label: 'Sign in' },
            { value: 'register', label: 'Create account' },
          ]}
          style={styles.tabs}
        />

        {form.tab === 'register' ? (
          <TextInput
            label="Name"
            mode="outlined"
            value={form.name}
            onChangeText={form.setName}
            autoCapitalize="words"
            style={styles.field}
          />
        ) : null}

        <TextInput
          label="Email"
          mode="outlined"
          value={form.email}
          onChangeText={form.setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          style={styles.field}
        />

        <TextInput
          label="Password"
          mode="outlined"
          value={form.password}
          onChangeText={form.setPassword}
          secureTextEntry={!showPassword}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword((v) => !v)}
            />
          }
          style={styles.field}
        />

        {form.tab === 'register' ? (
          <TextInput
            label="Phone (optional)"
            mode="outlined"
            value={form.phone}
            onChangeText={form.setPhone}
            keyboardType="phone-pad"
            style={styles.field}
          />
        ) : null}

        {form.error ? (
          <HelperText type="error" visible>
            {form.error}
          </HelperText>
        ) : null}

        <Button
          mode="contained"
          onPress={() => void form.submit()}
          loading={form.isSubmitting}
          disabled={form.isSubmitting}
          style={styles.submit}
        >
          {form.tab === 'login' ? 'Sign in' : 'Create account'}
        </Button>

        <View style={styles.oauthRow}>
          <Button mode="outlined" disabled style={styles.oauthBtn} icon="google">
            Google (use web)
          </Button>
          <Button mode="outlined" disabled style={styles.oauthBtn} icon="github">
            GitHub (use web)
          </Button>
        </View>
        <Text variant="bodySmall" style={{ color: palette.colorTextBase, opacity: 0.6 }}>
          OAuth deep links ship in a follow-up; email/password works now.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 24, paddingTop: 64, gap: 4 },
  sub: { opacity: 0.75, marginBottom: 16 },
  tabs: { marginBottom: 12 },
  field: { marginBottom: 8 },
  submit: { marginTop: 8 },
  oauthRow: { flexDirection: 'row', gap: 8, marginTop: 20 },
  oauthBtn: { flex: 1 },
});
