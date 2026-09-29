import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '@nexa/data';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { configurePlatform } from './src/app/composition-root';
import { RootNavigator } from './src/app/navigation';
import { SnackbarProvider } from './src/app/snackbar';
import { useThemeStore } from './src/features/theme/theme.store';

configurePlatform();

export default function App() {
  const queryClient = useMemo(() => createQueryClient(), []);
  const themeMode = useThemeStore((s) => s.themeMode);
  const paperTheme = themeMode === 'dark' ? MD3DarkTheme : MD3LightTheme;

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
