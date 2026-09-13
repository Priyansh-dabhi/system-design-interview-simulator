import { Link, useRouter } from "expo-router";
import { Eye, EyeSlash } from "phosphor-react-native";
import React, { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, View, Linking } from "react-native";
import { ScreenWrapper } from "../../src/components/ScreenWrapper";
import { AuthBackground } from "../../src/components/ui/AuthBackground";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { Typography } from "../../src/components/ui/Typography";
import { useTheme } from "../../src/theme/useTheme";
import { Layout } from "../../src/constants/Layout";
import { useAppDispatch, useAppSelector } from "../../src/redux/hooks";
import { register } from "../../src/redux/slices/auth";
import { getErrorMessage } from "../../src/utils/error";

const APP_ICON = require("../../assets/images/app_icon_pure_black_1024.png");

export default function RegisterScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const isLoading = useAppSelector((state) => state.auth.isSubmitting);

  const handleRegister = async () => {
    try {
      const trimmedName = name.trim();
      const trimmedEmail = email.trim().toLowerCase();

      if (!trimmedName || !trimmedEmail || !password.trim()) {
        Alert.alert("Error", "Please fill in all fields");
        return;
      }

      if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        Alert.alert(
          "Error",
          "Password must be at least 8 characters long and include at least one letter and one number."
        );
        return;
      }

      await dispatch(register({ full_name: trimmedName, email: trimmedEmail, password })).unwrap();
    } catch (err: any) {
      const errorMessage = getErrorMessage(err, "Registration failed");
      Alert.alert("Error", errorMessage || "Registration failed");
    }
  };

  const openPrivacyPolicy = () => Linking.openURL('https://priyansh-dabhi.github.io/privacy-policy/#privacy');
  const openTermsAndConditions = () => Linking.openURL('https://priyansh-dabhi.github.io/privacy-policy/#terms');

  const styles = React.useMemo(() => StyleSheet.create({
    content: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: Layout.spacing.lg,
    },
    logoContainer: {
      alignItems: "center",
      marginBottom: Layout.spacing.lg,
      shadowColor: "#3B82F6",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 8,
    },
    logoBadge: {
      width: 72,
      height: 72,
      borderRadius: 18,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: "#080B12",
    },
    logoImage: {
      width: "100%",
      height: "100%",
    },
    header: {
      alignItems: "center",
      marginBottom: Layout.spacing.xl,
    },
    title: {
      color: "#FFFFFF",
      marginBottom: Layout.spacing.xs,
    },
    subtitle: {
      color: "#94A3B8",
    },
    inputLabel: {
      color: "#E2E8F0",
      fontWeight: "500",
    },
    form: {
      marginBottom: Layout.spacing.xl,
    },
    button: {
      marginTop: Layout.spacing.sm,
    },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    footerText: {
      color: "#94A3B8",
    },
    linkButton: {
      width: "auto",
      minHeight: 0,
      paddingVertical: 0,
      paddingHorizontal: 4,
    },
    signInText: {
      color: "#3B82F6",
      fontWeight: "600",
    },
    legalFooter: {
      marginTop: Layout.spacing.xl,
      marginBottom: Layout.spacing.lg,
      alignItems: "center",
      justifyContent: "center",
    },
    legalText: {
      color: "#94A3B8",
      textAlign: "center",
    },
    legalLink: {
      color: "#3B82F6",
      fontWeight: "600",
    },
  }), [colors]);

  return (
    <AuthBackground>
      <ScreenWrapper transparent>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBadge}>
              <Image
                source={APP_ICON}
                style={styles.logoImage}
                resizeMode="cover"
              />
            </View>
          </View>

          <View style={styles.header}>
            <Typography variant="h2" weight="bold" align="center" style={styles.title}>
              Create Account
            </Typography>
            <Typography variant="body1" align="center" style={styles.subtitle}>
              Start mastering system design today
            </Typography>
          </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            labelStyle={styles.inputLabel}
            placeholder="John Doe"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <Input
            label="Email"
            labelStyle={styles.inputLabel}
            placeholder="name@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            label="Password"
            labelStyle={styles.inputLabel}
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            rightAccessory={
              <Pressable
                onPress={() => setShowPassword((current) => !current)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeSlash size={20} color="#64748B" />
                ) : (
                  <Eye size={20} color="#64748B" />
                )}
              </Pressable>
            }
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            isLoading={isLoading}
            style={styles.button}
          />
        </View>

        <View style={styles.footer}>
          <Typography variant="body2" style={styles.footerText}>
            Already have an account? 
          </Typography>
          <Link href="/(auth)/login" asChild>
            <Button
              title="Sign In"
              variant="ghost"
              style={styles.linkButton}
              textStyle={styles.signInText}
              onPress={() => router.push("/(auth)/login")}
            />
          </Link>
        </View>

        <View style={styles.legalFooter}>
          <Typography variant="caption" align="center" style={styles.legalText}>
            By continuing, you agree to our{" "}
            <Typography variant="caption" weight="semibold" style={styles.legalLink} onPress={openTermsAndConditions}>
              Terms & Conditions
            </Typography>
            {" "}and{" "}
            <Typography variant="caption" weight="semibold" style={styles.legalLink} onPress={openPrivacyPolicy}>
              Privacy Policy
            </Typography>
          </Typography>
        </View>
      </View>
    </ScreenWrapper>
  </AuthBackground>
  );
}
