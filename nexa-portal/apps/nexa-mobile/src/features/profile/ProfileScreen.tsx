import { useAuthStore } from '@nexa/auth';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Dialog, Portal, Text } from 'react-native-paper';
import { useLogout } from '../shell/use-logout';
import { usePalette } from '../theme/theme.store';

/** Profile from session store — no extra API. Sign-out confirms first. */
export function ProfileScreen() {
  const palette = usePalette();
  const user = useAuthStore((s) => s.user);
  const { logout, isPending } = useLogout();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <View style={[styles.root, { backgroundColor: palette.colorBgBase }]}>
      <Text variant="headlineSmall" style={{ color: palette.colorTextBase }}>
        Profile
      </Text>
      <Text variant="bodyLarge" style={{ color: palette.colorTextBase, marginTop: 16 }}>
        {user?.name ?? '—'}
      </Text>
      <Text variant="bodyMedium" style={{ color: palette.colorTextBase, opacity: 0.7 }}>
        {user?.email ?? '—'}
      </Text>
      {user?.phone ? (
        <Text variant="bodyMedium" style={{ color: palette.colorTextBase, opacity: 0.7 }}>
          {user.phone}
        </Text>
      ) : null}

      <Button
        mode="contained"
        buttonColor={palette.colorError}
        onPress={() => setConfirmOpen(true)}
        loading={isPending}
        style={styles.signOut}
      >
        Sign out
      </Button>

      <Portal>
        <Dialog visible={confirmOpen} onDismiss={() => setConfirmOpen(false)}>
          <Dialog.Title>Sign out?</Dialog.Title>
          <Dialog.Content>
            <Text>You will need to sign in again to use Nexa.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmOpen(false)}>Cancel</Button>
            <Button
              onPress={() => {
                setConfirmOpen(false);
                void logout();
              }}
              loading={isPending}
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
  root: { flex: 1, padding: 20 },
  signOut: { marginTop: 32, alignSelf: 'flex-start' },
});
