import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Layout } from '../../constants/Layout';
import { Typography } from './Typography';

export interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'primary';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  style,
}) => {
  const { colors, isDark } = useTheme();

  const getVariantColors = () => {
    switch (variant) {
      case 'success':
        return {
          bg: isDark ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5',
          text: isDark ? '#34D399' : '#065F46',
          border: isDark ? 'rgba(16, 185, 129, 0.3)' : '#A7F3D0',
        };
      case 'warning':
        return {
          bg: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7',
          text: isDark ? '#FBBF24' : '#92400E',
          border: isDark ? 'rgba(245, 158, 11, 0.3)' : '#FDE68A',
        };
      case 'error':
        return {
          bg: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2',
          text: isDark ? '#F87171' : '#991B1B',
          border: isDark ? 'rgba(239, 68, 68, 0.3)' : '#FECACA',
        };
      case 'primary':
        return {
          bg: isDark ? 'rgba(37, 99, 235, 0.2)' : '#DBEAFE',
          text: isDark ? '#60A5FA' : '#1E40AF',
          border: isDark ? 'rgba(37, 99, 235, 0.3)' : '#BFDBFE',
        };
      case 'default':
      default:
        return {
          bg: colors.surfaceHighlight,
          text: colors.textSecondary,
          border: colors.border,
        };
    }
  };

  const themeColors = getVariantColors();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: themeColors.bg,
          borderColor: themeColors.border,
        },
        style,
      ]}
    >
      <Typography
        variant="caption"
        weight="medium"
        style={{ color: themeColors.text }}
      >
        {label}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs / 2,
    borderRadius: Layout.borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
