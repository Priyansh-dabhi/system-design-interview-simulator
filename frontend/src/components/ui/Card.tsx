import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Layout } from '../../constants/Layout';

export interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  padding = 'md',
  style,
  children,
  ...props
}) => {
  const { colors, isDark } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'filled':
        return {
          backgroundColor: colors.surfaceHighlight,
          borderWidth: 1,
          borderColor: 'transparent',
        };
      case 'elevated':
      default:
        return {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: isDark ? colors.border : 'transparent',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0 : 0.05,
          shadowRadius: 8,
          elevation: isDark ? 0 : 2,
        };
    }
  };

  const getPadding = () => {
    switch (padding) {
      case 'none': return 0;
      case 'sm': return Layout.spacing.sm;
      case 'lg': return Layout.spacing.lg;
      case 'md':
      default: return Layout.spacing.md;
    }
  };

  return (
    <View
      style={[
        styles.base,
        getVariantStyles(),
        { padding: getPadding() },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Layout.borderRadius.lg,
    width: '100%',
  },
});
