import { ArrowDownIcon, ArrowUpIcon, ClockCounterClockwiseIcon } from 'phosphor-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { SummarySection } from '../shared/SummarySection';
import { InterviewHistoryItem } from '../../types/types';

const formatInterviewDate = (value: string) =>
    new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(value));

const scoreConfig = {
    good: { label: 'Strong', color: '#10B981', bg: '#10B98118' },
    average: { label: 'Average', color: '#F59E0B', bg: '#F59E0B18' },
    needs_improvement: { label: 'Needs Work', color: '#EF4444', bg: '#EF444418' },
};

export function InterviewCard({ item }: { item: InterviewHistoryItem }) {
    const [expanded, setExpanded] = useState(false);
    const config = scoreConfig[item.score];

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setExpanded(!expanded)}
            style={styles.card}
        >
            {/* Card Header */}
            <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                    <View style={[styles.topicIcon, { backgroundColor: config.bg }]}>
                        <ClockCounterClockwiseIcon size={18} color={config.color} />
                    </View>
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardTopic}>{item.topic}</Text>
                        <Text style={styles.cardDate}>{formatInterviewDate(item.date)}</Text>
                    </View>
                </View>
                <View style={styles.cardHeaderRight}>
                    <View style={[styles.scoreBadge, { backgroundColor: config.bg }]}>
                        <Text style={[styles.scoreBadgeText, { color: config.color }]}>
                            {config.label}
                        </Text>
                    </View>
                    {expanded ? (
                        <ArrowUpIcon size={16} color={Colors.textSecondary} />
                    ) : (
                        <ArrowDownIcon size={16} color={Colors.textSecondary} />
                    )}
                </View>
            </View>

            {/* Expandable Review Content */}
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
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.surface,
        borderRadius: Layout.borderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Layout.spacing.md,
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    topicIcon: {
        width: 38,
        height: 38,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Layout.spacing.sm + 4,
    },
    cardInfo: {
        flex: 1,
    },
    cardTopic: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    cardDate: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    cardHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Layout.spacing.sm,
    },
    scoreBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: Layout.borderRadius.full,
    },
    scoreBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    reviewContent: {
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingHorizontal: Layout.spacing.md,
        paddingVertical: Layout.spacing.md,
    },
});
