import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from '@/navigation/AppNavigator';
import { AuthProvider } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';

const queryClient = new QueryClient();

declare const ErrorUtils:
  | undefined
  | {
      getGlobalHandler?: () => ((error: any, isFatal?: boolean) => void) | undefined;
      setGlobalHandler?: (
        handler: (error: any, isFatal?: boolean) => void
      ) => void;
    };

if (__DEV__ && typeof ErrorUtils !== 'undefined') {
  const defaultHandler = ErrorUtils.getGlobalHandler?.();
  ErrorUtils.setGlobalHandler?.((error, isFatal) => {
    console.log('[smartbid:error]', error?.message || error, error?.stack);
    defaultHandler?.(error, isFatal);
  });
}

const AppContainer = () => {
  const { colors } = useTheme();
  return (
    <>
      <StatusBar style={colors.background === '#05060A' ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppContainer />
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
