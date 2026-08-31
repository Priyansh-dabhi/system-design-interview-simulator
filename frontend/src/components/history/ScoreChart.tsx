import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Circle, Polyline, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
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

    const width = 320; 
    const height = 190;
    const paddingTop = 25;
    const paddingBottom = 25;
    const paddingLeft = 35;
    const paddingRight = 15;
    
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;
    
    // Auto-scale Y axis based on data for better visibility
    const scores = data.map(d => d.score);
    const minData = Math.min(...scores);
    const maxData = Math.max(...scores);
    
    // Add padding to min/max, but constrain to 0-100
    const yMin = Math.max(0, Math.floor(minData / 10) * 10 - 10);
    const yMax = Math.min(100, Math.ceil(maxData / 10) * 10 + 10);
    const range = Math.max(10, yMax - yMin);

    const getY = (score: number) => paddingTop + chartHeight - ((score - yMin) / range) * chartHeight;
    const getX = (index: number, total: number) => paddingLeft + (total > 1 ? (index / (total - 1)) * chartWidth : chartWidth / 2);

    const points = data.map((d, i) => ({
        x: getX(i, data.length),
        y: getY(d.score),
        score: d.score,
        date: d.date
    }));

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    // Area under the curve
    const areaPath = `${pathData} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

    const getScoreColor = (score: number) => {
        if (score >= 75) return '#10B981';
        if (score >= 50) return '#F59E0B';
        return '#EF4444';
    };

    const latestColor = getScoreColor(points[points.length - 1].score);

    // Grid lines - 4 equal segments
    const gridValues = [
        yMin,
        Math.round(yMin + range * 0.25),
        Math.round(yMin + range * 0.5),
        Math.round(yMin + range * 0.75),
        yMax
    ];

    const formatDate = (dateString: string) => {
        const d = new Date(dateString);
        return `${d.getMonth() + 1}/${d.getDate()}`;
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>Score Trend (Last {data.length})</Text>
            <View style={styles.chartContainer}>
                <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
                    <Defs>
                        <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor={latestColor} stopOpacity="0.35" />
                            <Stop offset="1" stopColor={latestColor} stopOpacity="0" />
                        </LinearGradient>
                    </Defs>
                    
                    {/* Y-Axis Grid Lines & Labels */}
                    {gridValues.map((val, i) => (
                        <React.Fragment key={`grid-${i}`}>
                            <Polyline 
                                points={`${paddingLeft},${getY(val)} ${width - paddingRight},${getY(val)}`} 
                                stroke={colors.border} 
                                strokeWidth="1" 
                                strokeDasharray="4 4" 
                            />
                            <SvgText 
                                x={paddingLeft - 8} 
                                y={getY(val) + 4} 
                                fill={colors.textSecondary} 
                                fontSize="10" 
                                textAnchor="end"
                            >
                                {val}
                            </SvgText>
                        </React.Fragment>
                    ))}

                    {/* X-Axis Base Line */}
                    <Polyline 
                        points={`${paddingLeft},${height - paddingBottom} ${width - paddingRight},${height - paddingBottom}`} 
                        stroke={colors.border} 
                        strokeWidth="1" 
                    />

                    {/* Gradient Area */}
                    <Path d={areaPath} fill="url(#gradient)" />
                    
                    {/* Main Line curve */}
                    <Path d={pathData} stroke={latestColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    
                    {/* Data Points, Score Labels, and Date Labels */}
                    {points.map((p, i) => (
                        <React.Fragment key={`point-${i}`}>
                            <Circle cx={p.x} cy={p.y} r="4" fill={colors.surface} stroke={latestColor} strokeWidth="2.5" />
                            
                            {/* Score Text above point */}
                            <SvgText 
                                x={p.x} 
                                y={p.y - 10} 
                                fill={colors.text} 
                                fontSize="11" 
                                fontWeight="bold"
                                textAnchor="middle"
                            >
                                {Math.round(p.score)}
                            </SvgText>

                            {/* Date Text below x-axis */}
                            <SvgText 
                                x={p.x} 
                                y={height - paddingBottom + 16} 
                                fill={colors.textSecondary} 
                                fontSize="9" 
                                textAnchor="middle"
                            >
                                {formatDate(p.date)}
                            </SvgText>
                        </React.Fragment>
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
