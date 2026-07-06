import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme/useTheme";

type FullScreenLoaderProps = {
  message?: string;
};

export const FullScreenLoader = ({ message = "Loading..." }: FullScreenLoaderProps) => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.text} />
      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
  },
  message: {
    fontSize: 15,
    fontWeight: "500",
    opacity: 0.86,
  },
});
