import { rehydrateSession, useAuthStore } from '@nexa/auth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, type ComponentProps } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { AuthScreen } from '../features/auth/AuthScreen';
import { BridgesScreen } from '../features/bridges/BridgesScreen';
import { DashboardScreen } from '../features/dashboard/DashboardScreen';
import { OnboardScreen } from '../features/onboard/OnboardScreen';
import { ProfileScreen } from '../features/profile/ProfileScreen';
import { usePalette, useThemeStore } from '../features/theme/theme.store';
import { useUnauthorizedSessionClear } from './use-unauthorized-session-clear';

export type MainTabParamList = {
  Dashboard: undefined;
  WhatsApp: undefined;
  Bridges: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const palette = usePalette();
  const toggleTheme = useThemeStore((s) => s.toggleThemeMode);
  const themeMode = useThemeStore((s) => s.themeMode);

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: palette.colorBgBase },
        headerTintColor: palette.colorTextBase,
        tabBarStyle: { backgroundColor: palette.colorBgBase },
        tabBarActiveTintColor: palette.colorPrimary,
        tabBarInactiveTintColor: palette.colorTextBase + '99',
        headerRight: () => (
          <IconButton
            icon={themeMode === 'dark' ? 'white-balance-sunny' : 'moon-waning-crescent'}
            onPress={toggleTheme}
            accessibilityLabel="Toggle theme"
          />
        ),
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarIcon: ({ color, size }) => <TabIcon name="view-dashboard" color={color} size={size} /> }}
      />
      <Tab.Screen
        name="WhatsApp"
        component={OnboardScreen}
        options={{
          title: 'WhatsApp',
          tabBarIcon: ({ color, size }) => <TabIcon name="whatsapp" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Bridges"
        component={BridgesScreen}
        options={{ tabBarIcon: ({ color, size }) => <TabIcon name="bridge" color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ color, size }) => <TabIcon name="account" color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
}

function TabIcon({
  name,
  color,
  size,
}: {
  name: ComponentProps<typeof MaterialCommunityIcons>['name'];
  color: string;
  size: number;
}) {
  return <MaterialCommunityIcons name={name} color={color} size={size} />;
}

export function RootNavigator() {
  const isRehydrating = useAuthStore((s) => s.isRehydrating);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const palette = usePalette();
  const themeMode = useThemeStore((s) => s.themeMode);

  useUnauthorizedSessionClear();

  useEffect(() => {
    void rehydrateSession();
  }, []);

  if (isRehydrating) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: palette.colorBgBase }}>
        <ActivityIndicator color={palette.colorPrimary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={themeMode === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
