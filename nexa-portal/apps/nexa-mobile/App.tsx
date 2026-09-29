import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '@nexa/data';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { configurePlatform } from './src/app/composition-root';
import { RootNavigator } from './src/app/navigation';
import { SnackbarProvider } from './src/app/snackbar';
import { buildPaperTheme } from './src/features/theme/paper-theme';
import { usePalette, useThemeStore } from './src/features/theme/theme.store';

configurePlatform();

export default function App() {
  const queryClient = useMemo(() => createQueryClient(), []);
  const themeMode = useThemeStore((s) => s.themeMode);
  const palette = usePalette();
  const paperTheme = useMemo(
    () => buildPaperTheme(themeMode, palette),
    [palette, themeMode],
  );

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={paperTheme}>
          <SnackbarProvider>
            <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
            <RootNavigator />
          </SnackbarProvider>
        </PaperProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
