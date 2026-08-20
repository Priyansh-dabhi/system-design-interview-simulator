import { LightbulbIcon } from 'phosphor-react-native';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Layout } from '../../constants/Layout';

interface HintButtonProps {
    onPress: () => void;
    isLoading: boolean;
    hintCount: number;
    disabled?: boolean;
}

export function HintButton({ onPress, isLoading, hintCount, disabled = false }: HintButtonProps) {
    const { colors } = useTheme();

    const styles = React.useMemo(() => StyleSheet.create({
        container: {
            position: 'relative',
        },
        button: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.border,
        },
        buttonDisabled: {
            opacity: 0.5,
        },
        badge: {
            position: 'absolute',
            top: -4,
            right: -4,
            backgroundColor: '#F59E0B',
            borderRadius: 10,
            minWidth: 18,
            height: 18,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: colors.background,
        },
        badgeText: {
            color: '#FFFFFF',
            fontSize: 10,
            fontWeight: 'bold',
        }
    }), [colors]);

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled || isLoading}
                style={[styles.button, (disabled || isLoading) && styles.buttonDisabled]}
                activeOpacity={0.7}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color="#F59E0B" />
                ) : (
                    <LightbulbIcon size={20} color={disabled ? colors.textSecondary : "#F59E0B"} weight="fill" />
                )}
            </TouchableOpacity>
            {hintCount > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{hintCount}</Text>
                </View>
            )}
        </View>
    );
}
