import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Colors } from "../src/constants/Colors";

export default function ExpoAuthSessionScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.text}>Finishing sign-in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
    gap: 16,
  },
  text: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
});
