import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Layout } from '../../constants/Layout';

interface TopicMasteryCardProps {
    data: { topic: string; avgScore: number; count: number }[];
}

export function TopicMasteryCard({ data }: TopicMasteryCardProps) {
    const { colors } = useTheme();

    if (!data || data.length === 0) {
        return null;
    }

    const getScoreColor = (score: number) => {
        if (score >= 75) return '#10B981'; // Green
        if (score >= 50) return '#F59E0B'; // Amber
        return '#EF4444'; // Red
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>Topic Mastery</Text>
            
            <View style={styles.barsContainer}>
                {data.map((item, index) => (
                    <View key={index} style={styles.barRow}>
                        <View style={styles.labelContainer}>
                            <Text style={[styles.topicLabel, { color: colors.text }]} numberOfLines={1}>
                                {item.topic}
                            </Text>
                            <Text style={[styles.countLabel, { color: colors.textSecondary }]}>
                                {item.count} {item.count === 1 ? 'session' : 'sessions'}
                            </Text>
                        </View>
                        <View style={styles.barTrack}>
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
                        <Text style={[styles.scoreLabel, { color: getScoreColor(item.avgScore) }]}>
                            {item.avgScore}
                        </Text>
                    </View>
                ))}
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
        marginBottom: Layout.spacing.lg,
    },
    barsContainer: {
        gap: Layout.spacing.md,
    },
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Layout.spacing.sm,
    },
    labelContainer: {
        width: 100,
    },
    topicLabel: {
        fontSize: 13,
        fontWeight: '500',
    },
    countLabel: {
        fontSize: 11,
        marginTop: 2,
    },
    barTrack: {
        flex: 1,
        height: 8,
        backgroundColor: 'rgba(150, 150, 150, 0.2)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 4,
    },
    scoreLabel: {
        width: 25,
        fontSize: 13,
        fontWeight: 'bold',
        textAlign: 'right',
    },
});
