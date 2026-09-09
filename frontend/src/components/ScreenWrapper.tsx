import React from "react";
import { KeyboardAvoidingView, Platform, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../theme/useTheme";
import { Layout } from "../constants/Layout";

import { ScreenWrapperProps } from "../types/types";

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  style,
  withPadding = true,
  transparent = false,
}) => {
  const { colors, isDark } = useTheme();

  const styles = React.useMemo(() => StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: transparent ? 'transparent' : colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: transparent ? 'transparent' : colors.background,
    },
    padding: {
      paddingHorizontal: Layout.spacing.lg,
      paddingTop: Layout.spacing.md,
    },
  }), [colors, transparent]);

  const statusBarBg = transparent
    ? '#050810'
    : colors.background;

  const barStyle = transparent ? "light-content" : (isDark ? "light-content" : "dark-content");

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={barStyle}
        backgroundColor={statusBarBg}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={[styles.container, withPadding && styles.padding, style]}>
          {children}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};


