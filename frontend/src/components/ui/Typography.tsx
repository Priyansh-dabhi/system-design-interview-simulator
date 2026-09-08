import React from 'react';
import { Text, TextProps, StyleSheet, TextStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';

type Variant = 'h1' | 'h2' | 'h3' | 'h4' | 'body1' | 'body2' | 'caption' | 'mono';

export interface TypographyProps extends TextProps {
  variant?: Variant;
  color?: 'text' | 'textSecondary' | 'textDim' | 'primary' | 'error' | 'success';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body1',
  color = 'text',
  weight,
  align = 'left',
  style,
  children,
  ...props
}) => {
  const { colors } = useTheme();

  const getFontFamily = () => {
    if (variant === 'mono') {
      return weight === 'medium' ? 'JetBrainsMono_500Medium' : 'JetBrainsMono_400Regular';
    }
    
    // Headings use DM Sans
    if (variant.startsWith('h')) {
      return weight === 'bold' ? 'DMSans_700Bold' : 'DMSans_500Medium';
    }

    // Body uses Inter
    switch (weight) {
      case 'medium': return 'Inter_500Medium';
      case 'semibold': return 'Inter_600SemiBold';
      case 'bold': return 'Inter_700Bold';
      default: return 'Inter_400Regular';
    }
  };

  const getVariantStyles = (): TextStyle => {
    switch (variant) {
      case 'h1': return { fontSize: 32, lineHeight: 40 };
      case 'h2': return { fontSize: 24, lineHeight: 32 };
      case 'h3': return { fontSize: 20, lineHeight: 28 };
      case 'h4': return { fontSize: 18, lineHeight: 28 };
      case 'body1': return { fontSize: 16, lineHeight: 24 };
      case 'body2': return { fontSize: 14, lineHeight: 20 };
      case 'caption': return { fontSize: 12, lineHeight: 16 };
      case 'mono': return { fontSize: 14, lineHeight: 20 };
      default: return { fontSize: 16, lineHeight: 24 };
    }
  };

  return (
    <Text
      style={[
        getVariantStyles(),
        {
          fontFamily: getFontFamily(),
          color: colors[color] as string,
          textAlign: align,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};
