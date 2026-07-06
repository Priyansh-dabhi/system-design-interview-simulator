import { ClockCounterClockwiseIcon } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Layout } from '../../constants/Layout';

export function EmptyState() {
    const { colors } = useTheme();

    const styles = React.useMemo(() => StyleSheet.create({
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: Layout.spacing.xl,
        },
        emptyIconCircle: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: Layout.spacing.lg,
        },
        emptyTitle: {
            fontSize: 20,
            fontWeight: '600',
            color: colors.text,
            marginBottom: Layout.spacing.sm,
        },
        emptySubtitle: {
            fontSize: 14,
            color: colors.textSecondary,
            textAlign: 'center',
            lineHeight: 21,
        },
    }), [colors]);

    return (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
                <ClockCounterClockwiseIcon size={40} color={colors.textDim} />
            </View>
            <Text style={styles.emptyTitle}>No Interviews Yet</Text>
            <Text style={styles.emptySubtitle}>
                Complete your first mock interview to see your history and performance reviews here.
            </Text>
        </View>
    );
}

