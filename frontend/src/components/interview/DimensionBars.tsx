import { ChartBarIcon } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Layout } from '../../constants/Layout';
import { DimensionScore } from '../../types/types';
import { dimensionColor } from './summaryColors';

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
        container: { gap: Layout.spacing.sm },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Layout.spacing.sm,
            marginBottom: 2,
        },
        iconContainer: {
            width: 28,
            height: 28,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#3B82F620',
        },
        title: { fontSize: 14, fontWeight: '600', color: colors.text },
        row: { gap: 4, marginBottom: Layout.spacing.sm },
        rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
        rowLabel: { fontSize: 13, fontWeight: '600', color: colors.text },
        rowScore: { fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },
        track: {
            height: 6,
            borderRadius: 3,
            backgroundColor: colors.surfaceHighlight,
            overflow: 'hidden',
        },
        fill: { height: 6, borderRadius: 3 },
        comment: { fontSize: 12, color: colors.textSecondary, lineHeight: 17 },
    }), [colors]);

    if (rows.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <ChartBarIcon size={16} color="#3B82F6" weight="fill" />
                </View>
                <Text style={styles.title}>Performance Breakdown</Text>
            </View>
            {rows.map((d) => {
                const { score, comment } = scores[d.key];
                const color = dimensionColor(score);
                const pct = Math.max(0, Math.min(100, (score / 10) * 100));
                return (
                    <View key={d.key} style={styles.row}>
                        <View style={styles.rowTop}>
                            <Text style={styles.rowLabel}>{d.label}</Text>
                            <Text style={[styles.rowScore, { color }]}>{score}/10</Text>
                        </View>
                        <View style={styles.track}>
                            <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
                        </View>
                        {!!comment && <Text style={styles.comment}>{comment}</Text>}
                    </View>
                );
            })}
        </View>
    );
}
