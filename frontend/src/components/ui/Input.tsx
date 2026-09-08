import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { Typography } from "./Typography";
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
      marginBottom: Layout.spacing.xs,
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
      fontFamily: "Inter_400Regular",
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
      marginTop: Layout.spacing.xs,
    },
  }), [colors]);

  return (
    <View style={styles.container}>
      {label && <Typography variant="body2" weight="medium" color="textSecondary" style={styles.label}>{label}</Typography>}
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
      {error && <Typography variant="caption" color="error" style={styles.errorText}>{error}</Typography>}
    </View>
  );
};

