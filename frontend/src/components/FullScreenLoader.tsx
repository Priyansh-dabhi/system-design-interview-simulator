import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/Colors";

type FullScreenLoaderProps = {
  message?: string;
};

export const FullScreenLoader = ({ message = "Loading..." }: FullScreenLoaderProps) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.text} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
    gap: 18,
  },
  message: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "500",
    opacity: 0.86,
  },
});
