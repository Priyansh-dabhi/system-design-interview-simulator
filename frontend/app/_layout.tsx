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
  // auth group.  Previously this fired during the browser-to-app transition
  // (when segments briefly leave "(auth)") and prematurely reset the phase,
  // allowing the AuthGuard to redirect to the login page.
  useEffect(() => {
    if (googleAuthPhase !== "idle" && !inAuthGroup && user) {
      dispatch(clearGoogleAuthPhase());
    }
  }, [dispatch, googleAuthPhase, inAuthGroup, user]);

  // Whether a Google auth or login request is currently in-flight.
  const isAuthInFlight = googleAuthPhase !== "idle" || isSubmitting;

  useEffect(() => {
    if (showSplash) return;

    if (!user && !inAuthGroup && !isAuthInFlight) {
      router.replace('/(auth)/login');
    } else if (user && segments[0] !== '(main)' && segments[0] !== '(interview)') {
      router.replace('/(main)/home');
    }
  }, [user, showSplash, segments, isAuthInFlight]);

  if (showSplash) {
    return null; // Return nothing so the native splash screen is all that is visible
  }

  // Show LoadingSplash as an overlay (not a replacement) while Google auth
  // is in-flight.  This keeps the Stack — and the google-signin screen —
  // mounted so its async flow can finish, while hiding the underlying
  // screens from the user (no login-page flash).
  const showAuthOverlay = isAuthInFlight && !user;

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
        <Stack.Screen name="(interview)" />
        <Stack.Screen name="expo-auth-session" />
        <Stack.Screen name="index" />
      </Stack>
      {showAuthOverlay && (
        <View style={StyleSheet.absoluteFill}>
          <LoadingSplash />
        </View>
      )}
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
