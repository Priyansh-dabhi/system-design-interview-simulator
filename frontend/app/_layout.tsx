import 'react-native-gesture-handler';
import { Stack, useRouter, useSegments } from "expo-router";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { JetBrainsMono_400Regular, JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import * as SplashScreen from 'expo-splash-screen';

// Keep the native splash screen visible while we fetch resources from Redux
SplashScreen.preventAutoHideAsync();
import { store } from "@/src/redux/store";
import { Provider } from "react-redux";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { bootstrapAuth, clearGoogleAuthPhase } from "@/src/redux/slices/auth";
import { OfflineScreen } from "../src/components/OfflineScreen";
import { ThemeProvider } from "../src/theme/ThemeContext";
import { useTheme } from "../src/theme/useTheme";
import { GestureHandlerRootView } from "react-native-gesture-handler";

function AuthGuard({ fontsLoaded }: { fontsLoaded: boolean }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isLoading = useAppSelector((state) => state.auth.isHydrating);
  const isSubmitting = useAppSelector((state) => state.auth.isSubmitting);
  const googleAuthPhase = useAppSelector((state) => state.auth.googleAuthPhase);
  // Cast to string[] so indexing beyond [0] type-checks. Expo Router's typed
  // routes infer a length-1 tuple ([string]) when route types aren't generated
  // (e.g. in CI), which makes segments[1] a compile error otherwise.
  const segments = useSegments() as string[];
  const router = useRouter();
  const { colors } = useTheme();
  const lastNavigatedPathRef = useRef<string | null>(null);

  useEffect(() => {
    dispatch(bootstrapAuth());
  }, [dispatch]);

  // Hide the native splash screen once Redux finishes hydrating and fonts are loaded
  useEffect(() => {
    if (!isLoading && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoading, fontsLoaded]);

  const showSplash = isLoading || !fontsLoaded;
  const inAuthGroup = segments[0] === '(auth)';

  // Only clear googleAuthPhase after user is authenticated and has left the
  // auth group. Previously this fired prematurely and caused AuthGuard
  // to redirect to the login page.
  useEffect(() => {
    if (googleAuthPhase !== "idle" && !inAuthGroup && user) {
      dispatch(clearGoogleAuthPhase());
    }
  }, [dispatch, googleAuthPhase, inAuthGroup, user]);

  // Whether a Google auth or login request is currently in-flight.
  const isAuthInFlight = googleAuthPhase !== "idle" || isSubmitting;

  useEffect(() => {
    if (isLoading || showSplash) return;

    const isOnAcceptTerms = segments[0] === '(auth)' && segments[1] === 'accept-terms';

    let targetPath: string | null = null;
    if (!user && !inAuthGroup && !isAuthInFlight) {
      targetPath = '/(auth)/login';
    } else if (user && !user.acceptedTermsAt && !isOnAcceptTerms) {
      targetPath = '/(auth)/accept-terms';
    } else if (user && user.acceptedTermsAt && segments[0] !== '(main)' && segments[0] !== '(interview)') {
      targetPath = '/(main)/home';
    }

    if (targetPath) {
      if (lastNavigatedPathRef.current !== targetPath) {
        lastNavigatedPathRef.current = targetPath;
        router.replace(targetPath as any);
      }
    } else {
      // Clear ref once we are within the target route group
      lastNavigatedPathRef.current = null;
    }
  }, [user, showSplash, segments, isAuthInFlight, inAuthGroup]);

  // Remove the early return null so that Expo Router's <Stack> always mounts.
  // The native splash screen will remain visible until SplashScreen.hideAsync() is called.
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
        <Stack.Screen name="(interview)" />
        <Stack.Screen name="index" />
      </Stack>
    </View>
  );
}

function RootApp({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { colors, isDark } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <AuthGuard fontsLoaded={fontsLoaded} />
      <OfflineScreen />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    DMSans_500Medium,
    DMSans_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <ThemeProvider>
          <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <RootApp fontsLoaded={fontsLoaded} />
          </SafeAreaProvider>
        </ThemeProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
