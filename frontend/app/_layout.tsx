import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Colors } from "../src/constants/Colors";
import { useState } from "react";
import { LoadingSplash } from "../src/components/LoadingSplash";
import { store } from "@/src/redux/store";
import { Provider } from "react-redux";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { bootstrapAuth, clearGoogleAuthPhase } from "@/src/redux/slices/auth";

function AuthGuard() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isLoading = useAppSelector((state) => state.auth.isHydrating);
  const isSubmitting = useAppSelector((state) => state.auth.isSubmitting);
  const googleAuthPhase = useAppSelector((state) => state.auth.googleAuthPhase);
  const segments = useSegments();
  const router = useRouter();
  const [isSplashReady, setSplashReady] = useState(false);

  useEffect(() => {
    dispatch(bootstrapAuth());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashReady(true);
    }, 2000); // Show splash for at least 2 seconds

    return () => clearTimeout(timer);
  }, []);

  const showSplash = isLoading || !isSplashReady;
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
    return <LoadingSplash />;
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

export default function RootLayout() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: Colors.background }}>
          <AuthGuard />
        </View>
      </SafeAreaProvider>
    </Provider>
  );
}
