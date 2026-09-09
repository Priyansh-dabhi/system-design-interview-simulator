import { Link, useRouter } from "expo-router";
import { Eye, EyeSlash } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, View, Linking, Platform } from "react-native";
import { ScreenWrapper } from "../../src/components/ScreenWrapper";
import { AuthBackground } from "../../src/components/ui/AuthBackground";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { Typography } from "../../src/components/ui/Typography";
import { GoogleIcon } from "../../src/components/ui/GoogleIcon";
import { useTheme } from "../../src/theme/useTheme";
import { Layout } from "../../src/constants/Layout";
import { useAppDispatch, useAppSelector } from "../../src/redux/hooks";
import { clearAuthNotice, login, loginWithGoogle, setGoogleAuthPhase, clearGoogleAuthPhase } from "../../src/redux/slices/auth";
import { getErrorMessage } from "../../src/utils/error";
import { GoogleAuthError, signInWithGoogleAsync } from "../../src/services/googleAuth";

const APP_ICON = require("../../assets/images/app_icon_pure_black_1024.png");

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
    if (!authNotice) return;
    Alert.alert("Session ended", authNotice, [
      { text: "OK", onPress: () => dispatch(clearAuthNotice()) },
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
      if (error instanceof GoogleAuthError && error.code === "cancelled") return;
      console.error("Google sign-in failed:", error);
      Alert.alert("Google sign-in failed", getErrorMessage(error, "Please try again."));
    } finally {
      setActiveMethod(null);
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
    loginButton: {
      marginTop: Layout.spacing.sm,
    },
    googleButton: {
      marginTop: Layout.spacing.sm,
      borderRadius: Layout.borderRadius.full,
      borderColor: "rgba(255, 255, 255, 0.15)",
      paddingVertical: 12,
      backgroundColor: "#FFFFFF",
    },
    dividerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: Layout.spacing.lg,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: "rgba(148, 163, 184, 0.25)",
    },
    dividerText: {
      marginHorizontal: Layout.spacing.md,
      color: "#94A3B8",
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
    signUpText: {
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
    googleLoadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "#050810",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
    },
    loadingText: {
      color: "#94A3B8",
      marginTop: Layout.spacing.md,
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
              Welcome Back
            </Typography>
            <Typography variant="body1" align="center" style={styles.subtitle}>
              Continue your interview practice
            </Typography>
          </View>

        <View style={styles.form}>
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
                  <EyeSlash size={20} color="#64748B" />
                ) : (
                  <Eye size={20} color="#64748B" />
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
            <Typography variant="body2" style={styles.dividerText}>or</Typography>
            <View style={styles.dividerLine} />
          </View>

          {Platform.OS === "web" ? (
            <Typography variant="body2" align="center" style={styles.subtitle}>
              Native Google Sign-In is not available on the web.
            </Typography>
          ) : (
            <Button
              title="Sign in with Google"
              onPress={handleGoogleLogin}
              variant="outline"
              isLoading={activeMethod === "google"}
              style={styles.googleButton}
              textStyle={{ color: "#0F172A", fontWeight: "600" }}
              leftIcon={<GoogleIcon size={20} />}
              disabled={isBusy}
            />
          )}
        </View>

        <View style={styles.footer}>
          <Typography variant="body2" style={styles.footerText}>
            Don&apos;t have an account? 
          </Typography>
          <Link href="/(auth)/register" asChild>
            <Button
              title="Sign Up"
              variant="ghost"
              style={styles.linkButton}
              textStyle={styles.signUpText}
              onPress={() => router.push("/(auth)/register")}
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

      {googleAuthPhase === "redirecting" && (
        <View style={styles.googleLoadingOverlay}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Typography variant="body1" weight="medium" style={styles.loadingText}>
            Signing you in…
          </Typography>
        </View>
      )}
      </ScreenWrapper>
    </AuthBackground>
  );
}
