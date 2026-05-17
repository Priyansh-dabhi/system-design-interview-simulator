import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Colors } from "../../constants/Colors";
import { Layout } from "../../constants/Layout";

import { InputProps } from "../../types/types";

export const Input: React.FC<InputProps> = ({
  label,
  error,
  style,
  rightAccessory,
  ...props
}) => {
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
          placeholderTextColor={Colors.textDim}
          selectionColor={Colors.primary}
          {...props}
        />
        {rightAccessory ? <View style={styles.accessory}>{rightAccessory}</View> : null}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.md,
    width: "100%",
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: Layout.spacing.xs,
    fontWeight: "500",
  },
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    color: Colors.text,
    fontSize: 16,
    minHeight: 48,
  },
  inputWithAccessory: {
    paddingRight: 52,
  },
  inputError: {
    borderColor: Colors.error,
  },
  accessory: {
    position: "absolute",
    right: Layout.spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: Layout.spacing.xs,
  },
});
