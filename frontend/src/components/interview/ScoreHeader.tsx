import { Clock } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Layout } from '../../constants/Layout';
import { overallBand } from './summaryColors';
import { Typography } from '../ui/Typography';
import { Card } from '../ui/Card';

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
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Layout.spacing.xl,
        },
        scoreCircle: {
            width: 88,
            height: 88,
            borderRadius: 44,
            borderWidth: 6,
            borderColor: band.color,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: band.color + '10',
        },
        info: {
            flex: 1,
            justifyContent: 'center',
        },
        durationChip: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            marginTop: Layout.spacing.sm,
            alignSelf: 'flex-start',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: Layout.borderRadius.full,
            backgroundColor: colors.surfaceHighlight,
            borderWidth: 1,
            borderColor: colors.border,
        },
    }), [colors, band.color]);

    return (
        <Card padding="xl" variant="elevated">
            <View style={styles.container}>
                <View style={styles.scoreCircle}>
                    <Typography variant="h2" weight="bold" style={{ color: colors.text, fontVariant: ['tabular-nums'], marginBottom: -4 }}>
                        {Math.round(overallScore)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" weight="semibold">/ 100</Typography>
                </View>
                <View style={styles.info}>
                    <Typography variant="caption" color="textSecondary" weight="bold" style={{ letterSpacing: 1, marginBottom: 4 }}>
                        OVERALL SCORE
                    </Typography>
                    <Typography variant="h3" weight="bold" style={{ color: band.color }}>
                        {band.label}
                    </Typography>
                    {typeof durationSeconds === 'number' && (
                        <View style={styles.durationChip}>
                            <Clock size={14} color={colors.textSecondary} weight="fill" />
                            <Typography variant="caption" weight="semibold">
                                {formatDuration(durationSeconds)}
                            </Typography>
                        </View>
                    )}
                </View>
            </View>
        </Card>
    );
}
