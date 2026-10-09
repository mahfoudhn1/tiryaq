import React from 'react';
import { Provider } from 'react-redux';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '@/store/store';
import { ThemeProvider, useTheme } from '@/theme';
import { useBootstrap } from '@/hooks/useBootstrap';
import { AppNavigator } from '@/navigation/AppNavigator';
import { TiryaqLogo } from '@/components/brand/TiryaqLogo';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Root() {
  const { loading } = useBootstrap();
  const { colors, isDark } = useTheme();

  if (loading) {
    return (
      <View style={[styles.boot, { backgroundColor: colors.background }]}>
        <TiryaqLogo size={220} animated />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <SafeAreaView
        edges={['top']}
        style={[styles.root, { backgroundColor: colors.background }]}
      >
        <AppNavigator />
      </SafeAreaView>
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SafeAreaProvider>
            <NavigationContainer>
              <Root />
            </NavigationContainer>
          </SafeAreaProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  boot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
