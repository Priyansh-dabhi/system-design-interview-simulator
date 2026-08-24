import { Link, useRouter } from "expo-router";
import { Eye, EyeSlash } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View, Linking, Platform } from "react-native";
import { ScreenWrapper } from "../../src/components/ScreenWrapper";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { GoogleIcon } from "../../src/components/ui/GoogleIcon";
import { useTheme } from "../../src/theme/useTheme";
import { Layout } from "../../src/constants/Layout";
import { useAppDispatch, useAppSelector } from "../../src/redux/hooks";
import { clearAuthNotice, login, loginWithGoogle, setGoogleAuthPhase, clearGoogleAuthPhase } from "../../src/redux/slices/auth";
import { getErrorMessage } from "../../src/utils/error";
import { GoogleAuthError, signInWithGoogleAsync } from "../../src/services/googleAuth";

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeMethod, setActiveMethod] = useState<"password" | "google" | null>(null);
  const isLoading = useAppSelector((state) => state.auth.isSubmitting);
  const authNotice = useAppSelector((state) => state.auth.authNotice);
  const googleAuthPhase = useAppSelector((state) => state.auth.googleAuthPhase);
  const isBusy = isLoading || activeMethod !== null;

  useEffect(() => {
    if (!authNotice) {
      return;
    }

    Alert.alert("Session ended", authNotice, [
      {
        text: "OK",
        onPress: () => dispatch(clearAuthNotice()),
      },
    ]);
  }, [authNotice, dispatch]);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password.trim()) {
      Alert.alert("Missing information", "Please enter both your email and password.");
      return;
    }

    try {
      setActiveMethod("password");
      await dispatch(login({ email: trimmedEmail, password })).unwrap();
    } catch (error: any) {
      console.error("Login failed:", error);
      Alert.alert("Login failed", getErrorMessage(error, "Please check your credentials and try again."));
    } finally {
      setActiveMethod(null);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setActiveMethod("google");
      const { firebaseIdToken } = await signInWithGoogleAsync();
      dispatch(setGoogleAuthPhase("redirecting"));
      await dispatch(loginWithGoogle(firebaseIdToken)).unwrap();
    } catch (error) {
      dispatch(clearGoogleAuthPhase());
      if (error instanceof GoogleAuthError && error.code === "cancelled") {
        return;
      }
      console.error("Google sign-in failed:", error);
      Alert.alert("Google sign-in failed", getErrorMessage(error, "Please try again."));
    } finally {
      setActiveMethod(null);
    }
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://priyansh-dabhi.github.io/privacy-policy/#privacy');
  };

  const openTermsAndConditions = () => {
    Linking.openURL('https://priyansh-dabhi.github.io/privacy-policy/#terms');
  };

const styles = React.useMemo(() => StyleSheet.create({
    content: {
      flex: 1,
      justifyContent: "center",
    },
    header: {
      marginBottom: Layout.spacing.xxl,
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
    },
    form: {
      marginBottom: Layout.spacing.xl,
    },
    loginButton: {
      marginTop: Layout.spacing.sm,
    },
    googleButton: {
      marginTop: Layout.spacing.sm,
      borderRadius: 100,
      borderColor: colors.border,
      paddingVertical: 12,
      backgroundColor: colors.surface,
    },
    googleButtonText: {
      color: colors.text,
      fontWeight: "600",
    },
    dividerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: Layout.spacing.lg,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      color: colors.textSecondary,
      marginHorizontal: Layout.spacing.md,
      fontSize: 14,
    },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    footerText: {
      color: colors.textSecondary,
    },
    linkButton: {
      width: "auto",
      minHeight: 0,
      paddingVertical: 0,
      paddingHorizontal: 4,
    },
    linkText: {
      color: colors.primary,
    },
    legalFooter: {
      marginTop: Layout.spacing.xl,
      marginBottom: Layout.spacing.lg,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: Layout.spacing.lg,
    },
    legalText: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: "center",
    },
    legalLink: {
      color: colors.primary,
      fontWeight: "600",
    },
    googleLoadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "transparent",
      alignItems: "center" as const,
      justifyContent: "center" as const,
      zIndex: 10,
    },
    googleLoadingText: {
      marginTop: Layout.spacing.md,
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: "500" as const,
    },
  }), [colors]);

  return (
      <ScreenWrapper>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Sign in to continue your interview prep
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="name@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            label="Password"
            placeholder="Enter your password"
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
                  <EyeSlash size={20} color={colors.textDim} />
                ) : (
                  <Eye size={20} color={colors.textDim} />
                )}
              </Pressable>
            }
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            isLoading={activeMethod === "password"}
            style={styles.loginButton}
            disabled={isBusy && activeMethod !== "password"}
          />

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {Platform.OS === "web" ? (
            <Text style={{ textAlign: "center", color: colors.textSecondary, marginTop: Layout.spacing.sm }}>
              Native Google Sign-In is not available on the web.
            </Text>
          ) : (
            <Button
              title="Sign in with Google"
              onPress={handleGoogleLogin}
              variant="outline"
              isLoading={activeMethod === "google"}
              style={styles.googleButton}
              textStyle={styles.googleButtonText}
              leftIcon={<GoogleIcon size={20} />}
              disabled={isBusy}
            />
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don&apos;t have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <Button
              title="Sign Up"
              variant="ghost"
              style={styles.linkButton}
              textStyle={styles.linkText}
              onPress={() => router.push("/(auth)/register")}
            />
          </Link>
        </View>

        <View style={styles.legalFooter}>
          <Text style={styles.legalText}>
            By continuing, you agree to our{" "}
            <Text style={styles.legalLink} onPress={openTermsAndConditions}>Terms & Conditions</Text>
            {" "}and{" "}
            <Text style={styles.legalLink} onPress={openPrivacyPolicy}>Privacy Policy</Text>
          </Text>
        </View>
      </View>

      {/* Full-screen loading overlay shown after Google picker closes,
          while AuthGuard waits to redirect to home. */}
      {googleAuthPhase === "redirecting" && (
        <View style={styles.googleLoadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.googleLoadingText}>Signing you in…</Text>
        </View>
      )}
    </ScreenWrapper>
  );
}
