import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { useState } from "react";
import * as SplashScreen from 'expo-splash-screen';

// Keep the native splash screen visible while we fetch resources from Redux
SplashScreen.preventAutoHideAsync();
import { LoadingSplash } from "../src/components/LoadingSplash";
import { store } from "@/src/redux/store";
import { Provider } from "react-redux";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { bootstrapAuth, clearGoogleAuthPhase } from "@/src/redux/slices/auth";
import { OfflineScreen } from "../src/components/OfflineScreen";
import { ThemeProvider } from "../src/theme/ThemeContext";
import { useTheme } from "../src/theme/useTheme";

function AuthGuard() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isLoading = useAppSelector((state) => state.auth.isHydrating);
  const isSubmitting = useAppSelector((state) => state.auth.isSubmitting);
  const googleAuthPhase = useAppSelector((state) => state.auth.googleAuthPhase);
  const segments = useSegments();
  const router = useRouter();
  useEffect(() => {
    dispatch(bootstrapAuth());
  }, [dispatch]);

  // Hide the native splash screen once Redux finishes hydrating
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  const showSplash = isLoading;
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
    if (showSplash) return;

    const isOnAcceptTerms = segments[0] === '(auth)' && segments[1] === 'accept-terms';

    if (!user && !inAuthGroup && !isAuthInFlight) {
      router.replace('/(auth)/login');
    } else if (user && !user.acceptedTermsAt && !isOnAcceptTerms) {
      router.replace('/(auth)/accept-terms');
    } else if (user && user.acceptedTermsAt && segments[0] !== '(main)' && segments[0] !== '(interview)') {
      router.replace('/(main)/home');
    }
  }, [user, showSplash, segments, isAuthInFlight, inAuthGroup]);

  if (showSplash) {
    return null; // Return nothing so the native splash screen is all that is visible
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
        <Stack.Screen name="(interview)" />
        <Stack.Screen name="index" />
      </Stack>
    </View>
  );
}

function RootApp() {
  const { colors, isDark } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <AuthGuard />
      <OfflineScreen />
    </View>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <SafeAreaProvider>
          <RootApp />
        </SafeAreaProvider>
      </ThemeProvider>
    </Provider>
  );
}
