import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@nexa/auth';
import { useMemo, useState, type ComponentProps } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, Portal, Text } from 'react-native-paper';
import { useLogout } from '../shell/use-logout';
import { usePalette, useThemeStore } from '../theme/theme.store';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

function initialsFromName(name: string | undefined | null): string {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ''}${parts[parts.length - 1]![0] ?? ''}`.toUpperCase();
}

function InfoRow({
  icon,
  label,
  value,
  border,
  muted,
  textColor,
  isLast,
}: {
  icon: IconName;
  label: string;
  value: string;
  border: string;
  muted: string;
  textColor: string;
  isLast?: boolean;
}) {
  return (
    <View
      style={[
        styles.infoRow,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: border },
      ]}
    >
      <View style={[styles.infoIconWrap, { backgroundColor: `${muted}22` }]}>
        <MaterialCommunityIcons name={icon} size={18} color={muted} />
      </View>
      <View style={styles.infoText}>
        <Text style={[styles.infoLabel, { color: muted }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: textColor }]} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}

/** Profile from session store — no extra API. Sign-out confirms first. */
export function ProfileScreen() {
  const palette = usePalette();
  const themeMode = useThemeStore((s) => s.themeMode);
  const toggleTheme = useThemeStore((s) => s.toggleThemeMode);
  const user = useAuthStore((s) => s.user);
  const { logout, isPending } = useLogout();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isDark = themeMode === 'dark';
  const pageBg = isDark ? '#000000' : '#f5f5f5';
  const cardBg = isDark ? '#0a0a0a' : '#ffffff';
  const border = isDark ? '#262626' : '#e8e8e8';
  const muted = isDark ? '#a3a3a3' : '#8c8c8c';
  const textColor = palette.colorTextBase;

  const initials = useMemo(() => initialsFromName(user?.name), [user?.name]);

  return (
    <View style={[styles.root, { backgroundColor: pageBg }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        pointerEvents={isPending ? 'none' : 'auto'}
      >
        <View style={[styles.heroCard, { backgroundColor: cardBg, borderColor: border }]}>
          <View style={[styles.avatar, { backgroundColor: `${palette.colorPrimary}22` }]}>
            <Text style={[styles.avatarText, { color: palette.colorPrimary }]}>{initials}</Text>
          </View>
          <Text style={[styles.heroName, { color: textColor }]} numberOfLines={1}>
            {user?.name ?? '—'}
          </Text>
          <Text style={[styles.heroEmail, { color: muted }]} numberOfLines={1}>
            {user?.email ?? '—'}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
          <InfoRow
            icon="account-outline"
            label="Name"
            value={user?.name ?? '—'}
            border={border}
            muted={muted}
            textColor={textColor}
          />
          <InfoRow
            icon="email-outline"
            label="Email"
            value={user?.email ?? '—'}
            border={border}
            muted={muted}
            textColor={textColor}
          />
          <InfoRow
            icon="phone-outline"
            label="Mobile number"
            value={user?.phone || '—'}
            border={border}
            muted={muted}
            textColor={textColor}
            isLast
          />
        </View>

        {/* <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
          <View style={styles.themeRow}>
            <View style={styles.themeLeft}>
              <View style={[styles.infoIconWrap, { backgroundColor: `${palette.colorPrimary}18` }]}>
                <MaterialCommunityIcons
                  name={isDark ? 'weather-night' : 'white-balance-sunny'}
                  size={18}
                  color={palette.colorPrimary}
                />
              </View>
              <View style={styles.infoText}>
                <Text style={[styles.infoLabel, { color: muted }]}>Appearance</Text>
                <Text style={[styles.infoValue, { color: textColor }]}>
                  {isDark ? 'Dark mode' : 'Light mode'}
                </Text>
              </View>
            </View>
            <Button
              mode="outlined"
              compact
              onPress={toggleTheme}
              textColor={palette.colorPrimary}
              style={{ borderColor: border }}
            >
              {isDark ? 'Light' : 'Dark'}
            </Button>
          </View>
        </View> */}

        <Button
          mode="contained"
          buttonColor={palette.colorError}
          textColor="#ffffff"
          onPress={() => setConfirmOpen(true)}
          loading={isPending}
          disabled={isPending}
          style={styles.signOut}
          contentStyle={styles.signOutContent}
          icon="logout"
        >
          Sign out
        </Button>
      </ScrollView>

      {isPending ? (
        <View
          style={[
            styles.spinnerOverlay,
            { backgroundColor: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.72)' },
          ]}
          accessibilityLabel="Signing out"
          accessibilityRole="progressbar"
        >
          <ActivityIndicator size="large" color={palette.colorPrimary} />
        </View>
      ) : null}

      <Portal>
        <Dialog
          visible={confirmOpen}
          onDismiss={() => (isPending ? undefined : setConfirmOpen(false))}
          style={{ backgroundColor: cardBg }}
        >
          <Dialog.Title style={{ color: textColor }}>Sign out?</Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: muted }}>You will need to sign in again to use Nexa.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmOpen(false)} textColor={muted} disabled={isPending}>
              Cancel
            </Button>
            <Button
              onPress={() => {
                setConfirmOpen(false);
                void logout();
              }}
              textColor={palette.colorError}
              loading={isPending}
              disabled={isPending}
            >
              Sign out
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  heroCard: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '700',
  },
  heroName: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
  heroEmail: {
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  themeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  signOut: {
    marginTop: 4,
    borderRadius: 8,
  },
  signOutContent: {
    paddingVertical: 6,
  },
  spinnerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
});
