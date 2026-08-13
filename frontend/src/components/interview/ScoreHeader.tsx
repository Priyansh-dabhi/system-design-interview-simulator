import { ClockIcon } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Layout } from '../../constants/Layout';
import { overallBand } from './summaryColors';

interface ScoreHeaderProps {
    overallScore: number;
    durationSeconds?: number;
}

const formatDuration = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes <= 0) return `${seconds}s`;
    return `${minutes}m ${seconds}s`;
};

export function ScoreHeader({ overallScore, durationSeconds }: ScoreHeaderProps) {
    const { colors } = useTheme();
    const band = overallBand(overallScore);

    const styles = React.useMemo(() => StyleSheet.create({
        card: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Layout.spacing.lg,
            backgroundColor: colors.surface,
            borderRadius: Layout.borderRadius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: Layout.spacing.lg,
        },
        scoreCircle: {
            width: 76,
            height: 76,
            borderRadius: 38,
            borderWidth: 5,
            borderColor: band.color,
            alignItems: 'center',
            justifyContent: 'center',
        },
        scoreValue: {
            fontSize: 26,
            fontWeight: '800',
            color: colors.text,
            fontVariant: ['tabular-nums'],
        },
        scoreOutOf: {
            fontSize: 10,
            color: colors.textSecondary,
            marginTop: -2,
        },
        info: {
            flex: 1,
            gap: 3,
        },
        label: {
            fontSize: 12,
            color: colors.textSecondary,
            fontWeight: '600',
            letterSpacing: 0.5,
        },
        bandLabel: {
            fontSize: 18,
            fontWeight: '700',
            color: band.color,
        },
        durationChip: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            marginTop: 6,
            alignSelf: 'flex-start',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: Layout.borderRadius.full,
            backgroundColor: colors.surfaceHighlight,
        },
        durationText: {
            fontSize: 12,
            color: colors.textSecondary,
            fontWeight: '600',
        },
    }), [colors, band.color]);

    return (
        <View style={styles.card}>
            <View style={styles.scoreCircle}>
                <Text style={styles.scoreValue}>{Math.round(overallScore)}</Text>
                <Text style={styles.scoreOutOf}>/ 100</Text>
            </View>
            <View style={styles.info}>
                <Text style={styles.label}>OVERALL SCORE</Text>
                <Text style={styles.bandLabel}>{band.label}</Text>
                {typeof durationSeconds === 'number' && (
                    <View style={styles.durationChip}>
                        <ClockIcon size={13} color={colors.textSecondary} weight="fill" />
                        <Text style={styles.durationText}>{formatDuration(durationSeconds)}</Text>
                    </View>
                )}
            </View>
        </View>
    );
}
