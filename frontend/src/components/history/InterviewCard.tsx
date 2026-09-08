import { ArrowDown, ArrowUp, ClockCounterClockwise } from 'phosphor-react-native';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Layout } from '../../constants/Layout';
import { SummarySection } from '../shared/SummarySection';
import { InterviewHistoryItem } from '../../types/types';
import { Typography } from '../ui/Typography';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

const formatInterviewDate = (value: string) =>
    new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(value));

const scoreConfig = {
    good: { label: 'Strong', color: '#10B981', bg: '#10B98115', border: '#10B98130' },
    average: { label: 'Average', color: '#F59E0B', bg: '#F59E0B15', border: '#F59E0B30' },
    needs_improvement: { label: 'Needs Work', color: '#EF4444', bg: '#EF444415', border: '#EF444430' },
};

export function InterviewCard({ item }: { item: InterviewHistoryItem }) {
    const { colors } = useTheme();
    const [expanded, setExpanded] = useState(false);
    const config = scoreConfig[item.score];

    const styles = React.useMemo(() => StyleSheet.create({
        container: {
            marginBottom: Layout.spacing.sm,
        },
        cardHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        cardHeaderLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
            gap: Layout.spacing.md,
        },
        topicIcon: {
            width: 40,
            height: 40,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
        },
        cardInfo: {
            flex: 1,
        },
        cardHeaderRight: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Layout.spacing.md,
        },
        reviewContent: {
            marginTop: Layout.spacing.lg,
            paddingTop: Layout.spacing.lg,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
    }), [colors]);

    return (
        <Card variant="elevated" padding="md" style={styles.container}>
            <TouchableOpacity activeOpacity={0.7} onPress={() => setExpanded(!expanded)}>
                <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                        <View style={[styles.topicIcon, { backgroundColor: config.bg, borderColor: config.border }]}>
                            <ClockCounterClockwise size={20} color={config.color} weight="fill" />
                        </View>
                        <View style={styles.cardInfo}>
                            <Typography variant="body1" weight="semibold">{item.topic}</Typography>
                            <Typography variant="caption" color="textSecondary" style={{ marginTop: 2 }}>
                                {formatInterviewDate(item.date)}
                            </Typography>
                        </View>
                    </View>
                    <View style={styles.cardHeaderRight}>
                        <View style={{ backgroundColor: config.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Layout.borderRadius.full, borderWidth: 1, borderColor: config.border }}>
                            <Typography variant="caption" weight="bold" style={{ color: config.color }}>{config.label}</Typography>
                        </View>
                        {expanded ? (
                            <ArrowUp size={16} color={colors.textSecondary} weight="bold" />
                        ) : (
                            <ArrowDown size={16} color={colors.textSecondary} weight="bold" />
                        )}
                    </View>
                </View>

                {expanded && (
                    <View style={styles.reviewContent}>
                        <SummarySection
                            strengths={item.summary.strengths}
                            missedTopics={item.summary.missed_topics}
                            suggestions={item.summary.suggestions}
                        />
                    </View>
                )}
            </TouchableOpacity>
        </Card>
    );
}
