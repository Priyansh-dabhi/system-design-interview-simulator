import React, { useState } from "react";
import { View, StyleSheet, Pressable, ScrollView, Linking, Alert } from "react-native";
import { CheckSquareOffset, Square } from "phosphor-react-native";
import { ScreenWrapper } from "../../src/components/ScreenWrapper";
import { Button } from "../../src/components/ui/Button";
import { Typography } from "../../src/components/ui/Typography";
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
    } catch (err: any) {
      Alert.alert("Error", getErrorMessage(err, "Failed to accept terms"));
    }
  };

  const openPrivacyPolicy = () => Linking.openURL("https://priyansh-dabhi.github.io/privacy-policy/#privacy");
  const openTermsAndConditions = () => Linking.openURL("https://priyansh-dabhi.github.io/privacy-policy/#terms");

  const styles = React.useMemo(() => StyleSheet.create({
    content: {
      flex: 1,
      justifyContent: "space-between",
      paddingHorizontal: Layout.spacing.lg,
    },
    header: {
      marginTop: Layout.spacing.xxl,
      marginBottom: Layout.spacing.xl,
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
    },
    footer: {
      paddingBottom: Layout.spacing.xl,
    },
  }), [colors]);

  return (
    <ScreenWrapper>
      <View style={styles.content}>
        <View style={styles.header}>
          <Typography variant="h2" weight="bold" style={{ marginBottom: Layout.spacing.sm }}>
            Welcome!
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Before you start your interview prep, please review and accept our terms.
          </Typography>
        </View>

        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
          <View style={styles.summaryBox}>
            <Typography variant="h4" weight="semibold" style={{ marginBottom: Layout.spacing.md }}>
              What you are agreeing to
            </Typography>
            <Typography variant="body2" color="textSecondary" style={{ marginBottom: Layout.spacing.sm }}>
              • We collect your interview transcripts and performance data to provide you with personalized feedback.
            </Typography>
            <Typography variant="body2" color="textSecondary" style={{ marginBottom: Layout.spacing.sm }}>
              • We do not sell your personal data to third parties.
            </Typography>
            <Typography variant="body2" color="textSecondary" style={{ marginBottom: Layout.spacing.sm }}>
              • You can request to delete your account and associated data at any time.
            </Typography>
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
            <View style={styles.checkboxLabel}>
              <Typography variant="body2" style={{ lineHeight: 22 }}>
                I have read and agree to the{" "}
                <Typography variant="body2" color="primary" weight="semibold" onPress={openTermsAndConditions}>
                  Terms & Conditions
                </Typography>
                {" "}and{" "}
                <Typography variant="body2" color="primary" weight="semibold" onPress={openPrivacyPolicy}>
                  Privacy Policy
                </Typography>
                .
              </Typography>
            </View>
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
