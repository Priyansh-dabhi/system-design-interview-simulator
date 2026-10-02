import { Redirect } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useAppSelector } from '../src/redux/hooks';
import { useTheme } from '../src/theme/useTheme';

export default function Index() {
  const user = useAppSelector((state) => state.auth.user);
  const isLoading = useAppSelector((state) => state.auth.isHydrating);
  const { colors } = useTheme();

  // While restoring auth state, stay on a neutral themed container so nothing flashes under splash
  if (isLoading) {
    return <View style={[styles.container, { backgroundColor: colors.background }]} />;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!user.acceptedTermsAt) {
    return <Redirect href="/(auth)/accept-terms" />;
  }

  return <Redirect href="/(main)/home" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
