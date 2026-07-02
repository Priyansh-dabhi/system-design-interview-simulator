import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { Layout } from "../../constants/Layout";

import { ButtonProps } from "../../types/types";

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  leftIcon,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return Colors.surfaceHighlight;
    switch (variant) {
      case "primary":
        return Colors.primary;
      case "secondary":
        return Colors.buttonSecondaryBackground;
      case "ghost":
        return "transparent";
      case "outline":
        return "transparent";
      default:
        return Colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return Colors.textDim;
    switch (variant) {
      case "primary":
        return Colors.buttonPrimaryText;
      case "secondary":
        return Colors.buttonSecondaryText;
      case "ghost":
        return Colors.textSecondary;
      case "outline":
        return Colors.text;
      default:
        return Colors.buttonPrimaryText;
    }
  };

  const getBorder = () => {
    if (variant === "outline") {
      return {
        borderWidth: 1,
        borderColor: disabled ? Colors.surfaceHighlight : Colors.border,
      };
    }
    return {};
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: getBackgroundColor() },
        getBorder(),
        style,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <View style={styles.contentContainer}>
          {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
          <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    width: "100%",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  leftIconContainer: {
    marginRight: Layout.spacing.sm,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.7,
  },
});
