import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Circle, Polyline, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../theme/useTheme';
import { Layout } from '../../constants/Layout';

interface ScoreChartProps {
    data: { date: string; score: number }[];
}

export function ScoreChart({ data }: ScoreChartProps) {
    const { colors } = useTheme();

    if (!data || data.length === 0) {
        return (
            <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.title, { color: colors.text }]}>Score Trend</Text>
                <View style={styles.emptyState}>
                    <Text style={{ color: colors.textSecondary }}>Complete an interview to see your trend.</Text>
                </View>
            </View>
        );
    }

    const width = 300; // rough width for SVG viewbox
    const height = 100;
    const padding = 10;
    const minScore = 0;
    const maxScore = 100;

    // Calculate points
    const points = data.map((d, i) => {
        const x = padding + (i / Math.max(1, data.length - 1)) * (width - padding * 2);
        const y = height - padding - ((d.score - minScore) / (maxScore - minScore)) * (height - padding * 2);
        return { x, y, score: d.score };
    });

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    // Area under the curve
    const areaPath = `${pathData} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    const getScoreColor = (score: number) => {
        if (score >= 75) return '#10B981'; // Green
        if (score >= 50) return '#F59E0B'; // Amber
        return '#EF4444'; // Red
    };

    const latestColor = getScoreColor(points[points.length - 1].score);

    return (
        <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>Score Trend (Last {data.length})</Text>
            <View style={styles.chartContainer}>
                <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
                    <Defs>
                        <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor={latestColor} stopOpacity="0.2" />
                            <Stop offset="1" stopColor={latestColor} stopOpacity="0" />
                        </LinearGradient>
                    </Defs>
                    
                    {/* Grid lines (horizontal 50 and 75) */}
                    <Polyline points={`${padding},${height/2} ${width-padding},${height/2}`} stroke={colors.border} strokeWidth="1" strokeDasharray="4 4" />
                    <Polyline points={`${padding},${height/4} ${width-padding},${height/4}`} stroke={colors.border} strokeWidth="1" strokeDasharray="4 4" />

                    <Path d={areaPath} fill="url(#gradient)" />
                    <Path d={pathData} stroke={latestColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    
                    {points.map((p, i) => (
                        <Circle key={i} cx={p.x} cy={p.y} r="4" fill={colors.surface} stroke={latestColor} strokeWidth="2" />
                    ))}
                </Svg>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: Layout.borderRadius.lg,
        padding: Layout.spacing.lg,
        borderWidth: 1,
        marginBottom: Layout.spacing.md,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: Layout.spacing.md,
    },
    chartContainer: {
        width: '100%',
        alignItems: 'center',
    },
    emptyState: {
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
