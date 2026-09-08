import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Layout } from '../../constants/Layout';
import { Typography } from '../ui/Typography';
import { Card } from '../ui/Card';

interface TopicMasteryCardProps {
    data: { topic: string; avgScore: number; count: number }[];
}

export function TopicMasteryCard({ data }: TopicMasteryCardProps) {
    const { colors } = useTheme();

    if (!data || data.length === 0) {
        return null;
    }

    const getScoreColor = (score: number) => {
        if (score >= 75) return '#10B981';
        if (score >= 50) return '#F59E0B';
        return '#EF4444';
    };

    return (
        <Card variant="outlined" padding="lg" style={styles.container}>
            <Typography variant="h4" weight="semibold" style={{ marginBottom: Layout.spacing.lg }}>Topic Mastery</Typography>
            
            <View style={styles.barsContainer}>
                {data.map((item, index) => (
                    <View key={index} style={styles.barRow}>
                        <View style={styles.labelContainer}>
                            <Typography variant="body2" weight="semibold" numberOfLines={1}>
                                {item.topic}
                            </Typography>
                            <Typography variant="caption" color="textSecondary" style={{ marginTop: 2 }}>
                                {item.count} {item.count === 1 ? 'session' : 'sessions'}
                            </Typography>
                        </View>
                        <View style={[styles.barTrack, { backgroundColor: colors.surfaceHighlight }]}>
                            <View 
                                style={[
                                    styles.barFill, 
                                    { 
                                        width: `${Math.max(5, item.avgScore)}%`, 
                                        backgroundColor: getScoreColor(item.avgScore)
                                    }
                                ]} 
                            />
                        </View>
                        <Typography variant="body2" weight="bold" style={{ width: 30, textAlign: 'right', color: getScoreColor(item.avgScore) }}>
                            {Math.round(item.avgScore)}
                        </Typography>
                    </View>
                ))}
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Layout.spacing.sm,
    },
    barsContainer: {
        gap: Layout.spacing.lg,
    },
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Layout.spacing.md,
    },
    labelContainer: {
        width: 110,
    },
    barTrack: {
        flex: 1,
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 4,
    },
});
