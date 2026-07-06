import type { IconWeight } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Layout } from '../../constants/Layout';

interface MetricCardProps {
    label: string;
    value: string;
    icon: React.ComponentType<{ size: number; color: string; weight?: IconWeight }>;
    color: string;
    bg: string;
}

export function MetricCard({ label, value, icon: Icon, color, bg }: MetricCardProps) {
    const { colors } = useTheme();

    const styles = React.useMemo(() => StyleSheet.create({
        metricCard: {
            width: '48.5%',
            backgroundColor: colors.surface,
            borderRadius: Layout.borderRadius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: Layout.spacing.md,
            minHeight: 110,
        },
        metricIconContainer: {
            width: 36,
            height: 36,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: Layout.spacing.sm,
        },
        metricLabel: {
            fontSize: 12,
            color: colors.textSecondary,
            marginBottom: 4,
            fontWeight: '500',
        },
        metricValue: {
            fontSize: 20,
            fontWeight: '700',
            color: colors.text,
        },
        metricValueSmall: {
            fontSize: 14,
            fontWeight: '600',
            lineHeight: 20,
        },
    }), [colors]);

    return (
        <View style={styles.metricCard}>
            <View style={[styles.metricIconContainer, { backgroundColor: bg }]}>
                <Icon size={20} color={color} weight="fill" />
            </View>
            <Text style={styles.metricLabel}>{label}</Text>
            <Text
                style={[styles.metricValue, value.length > 5 && styles.metricValueSmall]}
                numberOfLines={2}
            >
                {value}
            </Text>
        </View>
    );
}

