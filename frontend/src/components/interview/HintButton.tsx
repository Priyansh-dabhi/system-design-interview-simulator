import { Lightbulb } from 'phosphor-react-native';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/useTheme';

interface HintButtonProps {
    onPress: () => void;
    isLoading: boolean;
    hintCount: number;
    maxHints: number;
    disabled?: boolean;
}

export function HintButton({ onPress, isLoading, hintCount, maxHints, disabled = false }: HintButtonProps) {
    const { colors, isDark } = useTheme();
    const remaining = Math.max(0, maxHints - hintCount);
    const isExhausted = remaining <= 0;

    const styles = React.useMemo(() => StyleSheet.create({
        button: {
            height: 44,
            paddingHorizontal: 12,
            borderRadius: 22,
            backgroundColor: isExhausted
                ? (isDark ? 'rgba(51, 65, 85, 0.25)' : '#F1F5F9')
                : (isDark ? 'rgba(245, 158, 11, 0.12)' : '#FEF3C7'),
            borderWidth: 1,
            borderColor: isExhausted
                ? colors.border
                : (isDark ? 'rgba(245, 158, 11, 0.3)' : '#FDE68A'),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
        },
        buttonDisabled: {
            opacity: 0.5,
        },
        countText: {
            fontSize: 13,
            fontWeight: '700',
            color: isExhausted ? colors.textDim : (isDark ? '#FBBF24' : '#D97706'),
        },
    }), [colors, isDark, isExhausted]);

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || isLoading || isExhausted}
            style={[styles.button, (disabled || isLoading) && styles.buttonDisabled]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Hints remaining: ${remaining}`}
        >
            {isLoading ? (
                <ActivityIndicator size="small" color="#F59E0B" />
            ) : (
                <>
                    <Lightbulb
                        size={18}
                        color={isExhausted ? colors.textDim : '#F59E0B'}
                        weight={isExhausted ? 'regular' : 'fill'}
                    />
                    <Text style={styles.countText}>{remaining}</Text>
                </>
            )}
        </TouchableOpacity>
    );
}
