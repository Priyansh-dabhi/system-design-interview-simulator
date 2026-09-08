import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Circle, Polyline, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../theme/useTheme';
import { Layout } from '../../constants/Layout';
import { Typography } from '../ui/Typography';
import { Card } from '../ui/Card';

interface ScoreChartProps {
    data: { date: string; score: number }[];
}

export function ScoreChart({ data }: ScoreChartProps) {
    const { colors } = useTheme();

    if (!data || data.length === 0) {
        return (
            <Card variant="outlined" padding="lg" style={styles.container}>
                <Typography variant="h4" weight="semibold" style={{ marginBottom: Layout.spacing.md }}>Score Trend</Typography>
                <View style={styles.emptyState}>
                    <Typography variant="body2" color="textSecondary">Complete an interview to see your trend.</Typography>
                </View>
            </Card>
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
    
    const scores = data.map(d => d.score);
    const minData = Math.min(...scores);
    const maxData = Math.max(...scores);
    
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
    const areaPath = `${pathData} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

    const getScoreColor = (score: number) => {
        if (score >= 75) return '#10B981';
        if (score >= 50) return '#F59E0B';
        return '#EF4444';
    };

    const latestColor = getScoreColor(points[points.length - 1].score);

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
        <Card variant="outlined" padding="lg" style={styles.container}>
            <Typography variant="h4" weight="semibold" style={{ marginBottom: Layout.spacing.md }}>Score Trend (Last {data.length})</Typography>
            <View style={styles.chartContainer}>
                <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
                    <Defs>
                        <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor={latestColor} stopOpacity="0.35" />
                            <Stop offset="1" stopColor={latestColor} stopOpacity="0" />
                        </LinearGradient>
                    </Defs>
                    
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

                    <Polyline 
                        points={`${paddingLeft},${height - paddingBottom} ${width - paddingRight},${height - paddingBottom}`} 
                        stroke={colors.border} 
                        strokeWidth="1" 
                    />

                    <Path d={areaPath} fill="url(#gradient)" />
                    
                    <Path d={pathData} stroke={latestColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    
                    {points.map((p, i) => (
                        <React.Fragment key={`point-${i}`}>
                            <Circle cx={p.x} cy={p.y} r="4" fill={colors.surface} stroke={latestColor} strokeWidth="2.5" />
                            
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
        </Card>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Layout.spacing.sm,
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
