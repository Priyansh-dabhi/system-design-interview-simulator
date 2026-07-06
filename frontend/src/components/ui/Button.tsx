import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../theme/useTheme";
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
  const { colors } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return colors.surfaceHighlight;
    switch (variant) {
      case "primary":
        return colors.primary;
      case "secondary":
        return colors.buttonSecondaryBackground;
      case "ghost":
        return "transparent";
      case "outline":
        return "transparent";
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.textDim;
    switch (variant) {
      case "primary":
        return colors.buttonPrimaryText;
      case "secondary":
        return colors.buttonSecondaryText;
      case "ghost":
        return colors.textSecondary;
      case "outline":
        return colors.text;
      default:
        return colors.buttonPrimaryText;
    }
  };

  const getBorder = () => {
    if (variant === "outline") {
      return {
        borderWidth: 1,
        borderColor: disabled ? colors.surfaceHighlight : colors.border,
      };
    }
    return {};
  };

  const styles = React.useMemo(() => StyleSheet.create({
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
  }), []);

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

