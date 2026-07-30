import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Linking, Alert } from "react-native";
import { CheckSquareOffset, Square } from "phosphor-react-native";
import { ScreenWrapper } from "../../src/components/ScreenWrapper";
import { Button } from "../../src/components/ui/Button";
import { useTheme } from "../../src/theme/useTheme";
import { Layout } from "../../src/constants/Layout";
import { useAppDispatch, useAppSelector } from "../../src/redux/hooks";
import { acceptTerms } from "../../src/redux/slices/auth";
import { getErrorMessage } from "../../src/utils/error";

export default function AcceptTermsScreen() {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();

  const [hasAccepted, setHasAccepted] = useState(false);
  const isLoading = useAppSelector((state) => state.auth.isSubmitting);

  const handleContinue = async () => {
    if (!hasAccepted) return;

    try {
      await dispatch(acceptTerms()).unwrap();
      // AuthGuard will automatically redirect to home once user.acceptedTermsAt is set
    } catch (err: any) {
      const errorMessage = getErrorMessage(err, "Failed to accept terms");
      Alert.alert("Error", errorMessage);
    }
  };

  const openPrivacyPolicy = () => {
    Linking.openURL("https://priyansh-dabhi.github.io/privacy-policy/#privacy");
  };

  const openTermsAndConditions = () => {
    Linking.openURL("https://priyansh-dabhi.github.io/privacy-policy/#terms");
  };

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        content: {
          flex: 1,
          justifyContent: "space-between",
        },
        header: {
          marginTop: Layout.spacing.xxl,
          marginBottom: Layout.spacing.xl,
        },
        title: {
          fontSize: 32,
          fontWeight: "bold",
          color: colors.text,
          marginBottom: Layout.spacing.sm,
        },
        subtitle: {
          fontSize: 16,
          color: colors.textSecondary,
          lineHeight: 24,
        },
        scrollArea: {
          flex: 1,
          marginBottom: Layout.spacing.xl,
        },
        summaryBox: {
          backgroundColor: colors.surfaceHighlight,
          padding: Layout.spacing.lg,
          borderRadius: Layout.borderRadius.md,
          marginBottom: Layout.spacing.xl,
        },
        summaryTitle: {
          fontSize: 18,
          fontWeight: "600",
          color: colors.text,
          marginBottom: Layout.spacing.md,
        },
        summaryText: {
          fontSize: 14,
          color: colors.textSecondary,
          lineHeight: 22,
          marginBottom: Layout.spacing.sm,
        },
        linkText: {
          color: colors.primary,
          fontWeight: "600",
        },
        checkboxContainer: {
          flexDirection: "row",
          alignItems: "flex-start",
          marginBottom: Layout.spacing.xl,
          paddingHorizontal: Layout.spacing.sm,
        },
        checkboxIcon: {
          marginRight: Layout.spacing.md,
          marginTop: 2,
        },
        checkboxLabel: {
          flex: 1,
          fontSize: 15,
          color: colors.text,
          lineHeight: 22,
        },
        footer: {
          paddingBottom: Layout.spacing.xl,
        },
      }),
    [colors]
  );

  return (
    <ScreenWrapper>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome!</Text>
          <Text style={styles.subtitle}>
            Before you start your interview prep, please review and accept our
            terms.
          </Text>
        </View>

        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>What you are agreeing to</Text>
            <Text style={styles.summaryText}>
              • We collect your interview transcripts and performance data to provide you with personalized feedback.
            </Text>
            <Text style={styles.summaryText}>
              • We do not sell your personal data to third parties.
            </Text>
            <Text style={styles.summaryText}>
              • You can request to delete your account and associated data at any time.
            </Text>
          </View>

          <Pressable
            style={styles.checkboxContainer}
            onPress={() => setHasAccepted(!hasAccepted)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: hasAccepted }}
          >
            <View style={styles.checkboxIcon}>
              {hasAccepted ? (
                <CheckSquareOffset size={28} color={colors.primary} weight="fill" />
              ) : (
                <Square size={28} color={colors.textSecondary} />
              )}
            </View>
            <Text style={styles.checkboxLabel}>
              I have read and agree to the{" "}
              <Text style={styles.linkText} onPress={openTermsAndConditions}>
                Terms & Conditions
              </Text>{" "}
              and{" "}
              <Text style={styles.linkText} onPress={openPrivacyPolicy}>
                Privacy Policy
              </Text>
              .
            </Text>
          </Pressable>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Continue"
            onPress={handleContinue}
            isLoading={isLoading}
            disabled={!hasAccepted || isLoading}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}
