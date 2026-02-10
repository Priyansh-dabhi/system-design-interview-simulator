import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ScreenWrapper } from "../../src/components/ScreenWrapper";
import { Button } from "../../src/components/ui/Button";
import { Colors } from "../../src/constants/Colors";
import { Layout } from "../../src/constants/Layout";
import { useAuth } from "../../src/context/AuthContext";

export default function HomeScreen() {
  const { user, signOut } = useAuth();

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.username}>{user?.full_name || "Candidate"}</Text>
        </View>
        <Button
          title="Sign Out"
          onPress={signOut}
          variant="ghost"
          style={styles.signOutButton}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            Ready for your next{"\n"}interview?
          </Text>
          <Text style={styles.heroSubtitle}>
            Practice system design with our AI interviewer to get real-time
            feedback.
          </Text>
          <Button
            title="Start Interview"
            onPress={() => console.log("Start Interview")}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderText}>No interviews yet.</Text>
            <Text style={styles.placeholderSubtext}>
              Your history will appear here.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsItem}>
            <Text style={styles.settingLabel}>Theme</Text>
            <Text style={styles.settingValue}>Dark</Text>
          </View>
          <View style={styles.settingsItem}>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Text style={styles.settingValue}>On</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Layout.spacing.xl,
  },
  greeting: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
  },
  signOutButton: {
    width: "auto",
    minHeight: 32,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  scrollContent: {
    paddingBottom: Layout.spacing.xl,
  },
  heroSection: {
    marginBottom: Layout.spacing.xxl,
    padding: Layout.spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.lg,
    lineHeight: 24,
  },
  section: {
    marginBottom: Layout.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  placeholderCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
  },
  placeholderText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  placeholderSubtext: {
    color: Colors.textDim,
    fontSize: 14,
  },
  settingsItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.text,
  },
  settingValue: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
