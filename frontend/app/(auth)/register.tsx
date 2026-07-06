import { Link, useRouter } from "expo-router";
import { Eye, EyeIcon, EyeSlash, EyeSlashIcon } from "phosphor-react-native";
import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenWrapper } from "../../src/components/ScreenWrapper";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { useTheme } from "../../src/theme/useTheme";
import { Layout } from "../../src/constants/Layout";
import { useAppDispatch, useAppSelector } from "../../src/redux/hooks";
import { register } from "../../src/redux/slices/auth";
import { getErrorMessage } from "../../src/utils/error";

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


    <ScreenWrapper>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Start mastering system design today
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
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
                  <EyeSlashIcon size={20} color={colors.textDim} />
                ) : (
                  <EyeIcon size={20} color={colors.textDim} />
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
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <Button
              title="Sign In"
              variant="ghost"
              style={styles.linkButton}
              textStyle={styles.linkText}
              onPress={() => router.push("/(auth)/login")}
            />
          </Link>
        </View>
      </View>
    </ScreenWrapper>
  );
}

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
    button: {
      marginTop: Layout.spacing.sm,
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
  }), [colors]);

  return (
