import { CheckIcon } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Layout } from '../../constants/Layout';

export type TopicDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface Topic {
    id: string;
    title: string;
    description: string;
    type: string;
    difficulty: TopicDifficulty;
    accentColor: string;
    icon: React.ReactNode;
}

const DIFFICULTY_COLORS: Record<TopicDifficulty, string> = {
    Easy: '#10B981',
    Medium: '#F59E0B',
    Hard: '#EF4444',
};

interface TopicCardProps {
    topic: Topic;
    isSelected: boolean;
    isExpanded: boolean;
    onPress: (topic: Topic) => void;
    onSelect: (topic: Topic) => void;
}

export function TopicCard({ topic, isSelected, isExpanded, onPress, onSelect }: TopicCardProps) {
    const { colors } = useTheme();

    const styles = React.useMemo(() => StyleSheet.create({
        topicCard: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            backgroundColor: colors.surface,
            padding: Layout.spacing.lg,
            borderRadius: Layout.borderRadius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            gap: Layout.spacing.md,
            position: 'relative',
        },
        topicCardSelected: {
            borderColor: colors.primaryBrand,
            backgroundColor: colors.surfaceHighlight,
        },
        topicIconContainer: {
            width: 48,
            height: 48,
            borderRadius: Layout.borderRadius.md,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 2,
        },
        topicContent: {
            flex: 1,
            gap: 8,
        },
        topicHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        topicTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
        },
        metadataRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        typeBadge: {
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 4,
            backgroundColor: colors.surfaceHighlight,
        },
        typeText: {
            fontSize: 11,
            fontWeight: '500',
            color: colors.textSecondary,
        },
        difficultyBadge: {
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 4,
        },
        difficultyText: {
            fontSize: 11,
            fontWeight: '600',
        },
        topicDescription: {
            fontSize: 13,
            color: colors.textSecondary,
            lineHeight: 18,
            textAlign: 'left',
        },
        expandHint: {
            fontSize: 11,
            color: colors.textSecondary,
            opacity: 0.55,
            marginTop: -2,
        },
        checkbox: {
            position: 'absolute',
            top: Layout.spacing.md,
            right: Layout.spacing.md,
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
        },
        checkboxSelected: {
            backgroundColor: colors.primaryBrand,
            borderColor: colors.primaryBrand,
        },
    }), [colors]);

    return (
        <TouchableOpacity
            style={[styles.topicCard, isSelected && styles.topicCardSelected]}
            activeOpacity={0.75}
            onPress={() => onPress(topic)}
        >
            {/* Icon */}
            <View style={[styles.topicIconContainer, { backgroundColor: topic.accentColor + '15' }]}>
                {topic.icon}
            </View>

            {/* Content */}
            <View style={styles.topicContent}>
                <View style={styles.topicHeader}>
                    <Text style={styles.topicTitle}>{topic.title}</Text>
                </View>

                {/* Description – collapsed (2 lines) or expanded (full) */}
                <Text
                    style={styles.topicDescription}
                    numberOfLines={isExpanded ? undefined : 2}
                    ellipsizeMode="tail"
                >
                    {topic.description}
                </Text>

                {/* Tap hint */}
                <Text style={styles.expandHint}>
                    {isExpanded ? 'Tap to collapse ▲' : 'Tap to expand ▼'}
                </Text>

                {/* Metadata: Type and Difficulty */}
                <View style={styles.metadataRow}>
                    <View style={styles.typeBadge}>
                        <Text style={styles.typeText}>{topic.type}</Text>
                    </View>
                    <View style={[styles.difficultyBadge, { backgroundColor: DIFFICULTY_COLORS[topic.difficulty] + '20' }]}>
                        <Text style={[styles.difficultyText, { color: DIFFICULTY_COLORS[topic.difficulty] }]}>
                            {topic.difficulty}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Checkbox – separate tap target for selection */}
            <TouchableOpacity
                style={[styles.checkbox, isSelected && styles.checkboxSelected]}
                onPress={(e) => { e.stopPropagation?.(); onSelect(topic); }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
                {isSelected && <CheckIcon size={16} color="#FFFFFF" weight="bold" />}
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

