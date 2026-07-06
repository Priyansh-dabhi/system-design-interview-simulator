import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useTheme } from "../../theme/useTheme";
import { Layout } from "../../constants/Layout";

import { InputProps } from "../../types/types";

export const Input: React.FC<InputProps> = ({
  label,
  error,
  style,
  rightAccessory,
  ...props
}) => {
  const { colors } = useTheme();

  const styles = React.useMemo(() => StyleSheet.create({
    container: {
      marginBottom: Layout.spacing.md,
      width: "100%",
    },
    label: {
      color: colors.textSecondary,
      fontSize: 14,
      marginBottom: Layout.spacing.xs,
      fontWeight: "500",
    },
    inputWrapper: {
      position: "relative",
      justifyContent: "center",
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Layout.borderRadius.md,
      padding: Layout.spacing.md,
      color: colors.text,
      fontSize: 16,
      minHeight: 48,
    },
    inputWithAccessory: {
      paddingRight: 52,
    },
    inputError: {
      borderColor: colors.error,
    },
    accessory: {
      position: "absolute",
      right: Layout.spacing.md,
      alignItems: "center",
      justifyContent: "center",
    },
    errorText: {
      color: colors.error,
      fontSize: 12,
      marginTop: Layout.spacing.xs,
    },
  }), [colors]);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            rightAccessory ? styles.inputWithAccessory : null,
            error ? styles.inputError : null,
            style,
          ]}
          placeholderTextColor={colors.textDim}
          selectionColor={colors.primary}
          {...props}
        />
        {rightAccessory ? <View style={styles.accessory}>{rightAccessory}</View> : null}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

