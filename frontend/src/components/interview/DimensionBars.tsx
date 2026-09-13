import { ChartBar } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Layout } from '../../constants/Layout';
import { DimensionScore } from '../../types/types';
import { dimensionColor } from './summaryColors';
import { Typography } from '../ui/Typography';
import { Card } from '../ui/Card';

interface DimensionBarsProps {
    scores: Record<string, DimensionScore>;
}

const DIMENSIONS: { key: string; label: string }[] = [
    { key: 'requirements', label: 'Requirements' },
    { key: 'scalability', label: 'Scalability' },
    { key: 'data_modeling', label: 'Data Modeling' },
    { key: 'tradeoffs', label: 'Trade-offs' },
    { key: 'communication', label: 'Communication' },
];

export function DimensionBars({ scores }: DimensionBarsProps) {
    const { colors } = useTheme();
    const rows = DIMENSIONS.filter((d) => scores[d.key]);

    const styles = React.useMemo(() => StyleSheet.create({
        container: { gap: Layout.spacing.lg },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Layout.spacing.sm,
            marginBottom: Layout.spacing.sm,
        },
        iconContainer: {
            width: 32,
            height: 32,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.primary + '15',
        },
        row: { gap: 6 },
        rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
        track: {
            height: 8,
            borderRadius: 4,
            backgroundColor: colors.surfaceHighlight,
            overflow: 'hidden',
        },
        fill: { height: 8, borderRadius: 4 },
        commentWrapper: {
            backgroundColor: colors.surfaceHighlight,
            padding: Layout.spacing.md,
            borderRadius: Layout.borderRadius.md,
            marginTop: 4,
        },
    }), [colors]);

    if (rows.length === 0) return null;

    return (
        <Card padding="lg" variant="outlined">
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <ChartBar size={18} color={colors.primary} weight="fill" />
                </View>
                <Typography variant="h4" weight="semibold">Performance Breakdown</Typography>
            </View>
            
            <View style={styles.container}>
                {rows.map((d) => {
                    const { score, comment } = scores[d.key];
                    const color = dimensionColor(score);
                    const pct = Math.max(0, Math.min(100, (score / 10) * 100));
                    return (
                        <View key={d.key} style={styles.row}>
                            <View style={styles.rowTop}>
                                <Typography variant="body1" weight="semibold">{d.label}</Typography>
                                <Typography variant="body1" weight="bold" style={{ color, fontVariant: ['tabular-nums'] }}>{score}/10</Typography>
                            </View>
                            <View style={styles.track}>
                                <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
                            </View>
                            {!!comment && (
                                <View style={styles.commentWrapper}>
                                    <Typography variant="body2" color="textSecondary" style={{ lineHeight: 20 }}>
                                        {comment}
                                    </Typography>
                                </View>
                            )}
                        </View>
                    );
                })}
            </View>
        </Card>
    );
}
