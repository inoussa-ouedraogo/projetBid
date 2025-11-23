import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { AuthStackParamList, RootStackParamList, AppTabsParamList } from './types';
import LoginScreen from '@/screens/Auth/LoginScreen';
import RegisterScreen from '@/screens/Auth/RegisterScreen';
import HomeScreen from '@/screens/HomeScreen';
import AuctionsScreen from '@/screens/AuctionsScreen';
import BidsScreen from '@/screens/BidsScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import AuctionDetailScreen from '@/screens/AuctionDetailScreen';
import FavoritesScreen from '@/screens/FavoritesScreen';
import SwipeScreen from '@/screens/SwipeScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<AppTabsParamList>();

const AppTabs = () => {
  const { colors, palette } = useTheme();
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarStyle: { backgroundColor: colors.surface, borderTopWidth: 0 },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<keyof AppTabsParamList, keyof typeof Ionicons.glyphMap> = {
            Home: 'home',
            Auctions: 'pricetag',
            Bids: 'cash',
            Favorites: 'heart',
            Swipe: 'swap-horizontal',
            Profile: 'person',
          };
          return <Ionicons name={icons[route.name]} color={color} size={size} />;
        },
      })}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Auctions" component={AuctionsScreen} />
      <Tabs.Screen
        name="Bids"
        component={BidsScreen}
        options={{ title: 'Participations', tabBarLabel: 'Participations' }}
      />
      <Tabs.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favoris' }} />
      <Tabs.Screen name="Swipe" component={SwipeScreen} options={{ title: 'Parcours' }} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
};

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

const PrivateNavigator = () => (
  <RootStack.Navigator screenOptions={{ headerShown: false }}>
    <RootStack.Screen name="Tabs" component={AppTabs} />
    <RootStack.Screen name="AuctionDetail" component={AuctionDetailScreen} />
  </RootStack.Navigator>
);

export const AppNavigator = () => {
  const { user, initializing } = useAuth();
  const theme = useTheme();

  const navTheme = {
    ...(theme.colors.background === '#05060A' ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.colors.background === '#05060A' ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.textPrimary,
      border: theme.colors.border,
      notification: theme.palette.secondary,
      primary: theme.palette.primary,
    },
  };

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.palette.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {user ? <PrivateNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
