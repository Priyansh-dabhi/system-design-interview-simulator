import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../src/theme/useTheme";
import React from "react";

export default function ExpoAuthSessionScreen() {
  const { colors } = useTheme();
  
  const styles = React.useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
      gap: 16,
    },
    text: {
      color: colors.textSecondary,
      fontSize: 16,
    },
  }), [colors]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primaryBrand} />
      <Text style={styles.text}>Finishing sign-in...</Text>
    </View>
  );
}

