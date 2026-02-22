import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Colors } from "../src/constants/Colors";
import { AuthProvider, useAuth } from "../src/context/AuthContext";

import { useState } from "react";
import { LoadingSplash } from "../src/components/LoadingSplash";
import { store } from "@/src/redux/store";
import { Provider } from "react-redux";

function AuthGuard() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isSplashReady, setSplashReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashReady(true);
    }, 2000); // Show splash for at least 2 seconds

    return () => clearTimeout(timer);
  }, []);

  const showSplash = isLoading || !isSplashReady;

  useEffect(() => {
    if (showSplash) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && segments[0] !== '(main)' && segments[0] !== '(interview)') {
      router.replace('/(main)/home');
    }
  }, [user, showSplash, segments]);

  if (showSplash) {
    return <LoadingSplash />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(main)" />
      <Stack.Screen name="(interview)" />
      <Stack.Screen name="index" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <SafeAreaProvider>
          <View style={{ flex: 1, backgroundColor: Colors.background }}>
            <AuthGuard />
          </View>
        </SafeAreaProvider>
      </AuthProvider>
    </Provider>
  );
}
