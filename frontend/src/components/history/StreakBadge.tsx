import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FireIcon, TrophyIcon } from 'phosphor-react-native';
import { useTheme } from '../../theme/useTheme';
import { Layout } from '../../constants/Layout';

interface StreakBadgeProps {
    currentStreak: number;
    bestStreak: number;
}

export function StreakBadge({ currentStreak, bestStreak }: StreakBadgeProps) {
    const { colors } = useTheme();

    if (bestStreak === 0) return null;

    return (
        <View style={styles.row}>
            <View style={[styles.badge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <FireIcon size={20} color={currentStreak > 0 ? "#F97316" : colors.textSecondary} weight={currentStreak > 0 ? "fill" : "regular"} />
                <View style={styles.textContainer}>
                    <Text style={[styles.value, { color: colors.text }]}>{currentStreak}</Text>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Current Streak</Text>
                </View>
            </View>
            
            <View style={[styles.badge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TrophyIcon size={20} color="#EAB308" weight="fill" />
                <View style={styles.textContainer}>
                    <Text style={[styles.value, { color: colors.text }]}>{bestStreak}</Text>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Best Streak</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        gap: Layout.spacing.md,
        marginBottom: Layout.spacing.md,
    },
    badge: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: Layout.spacing.md,
        borderRadius: Layout.borderRadius.lg,
        borderWidth: 1,
        gap: Layout.spacing.md,
    },
    textContainer: {
        flex: 1,
    },
    value: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    label: {
        fontSize: 12,
    }
});
