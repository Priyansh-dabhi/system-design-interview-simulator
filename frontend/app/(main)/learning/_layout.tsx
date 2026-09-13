import { Stack } from "expo-router";
import React from "react";
import { useTheme } from "../../../src/theme/useTheme";

export default function LearningLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="topic/[slug]" />
      <Stack.Screen name="lesson/[id]" />
      <Stack.Screen name="result/[id]" />
    </Stack>
  );
}
