import { CaretRight } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Layout } from '../../constants/Layout';
import { Typography } from '../ui/Typography';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

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

interface TopicCardProps {
    topic: Topic;
    onPress: (topic: Topic) => void;
}

export function TopicCard({ topic, onPress }: TopicCardProps) {
    const { colors } = useTheme();

    const getDifficultyVariant = (difficulty: TopicDifficulty) => {
        switch (difficulty) {
            case 'Hard': return 'error';
            case 'Medium': return 'warning';
            case 'Easy': return 'success';
            default: return 'default';
        }
    };

    const styles = React.useMemo(() => StyleSheet.create({
        topicIconContainer: {
            width: 48,
            height: 48,
            borderRadius: Layout.borderRadius.md,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: Layout.spacing.md,
        },
        topicContent: {
            flex: 1,
            justifyContent: 'center',
        },
        metadataRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Layout.spacing.sm,
            marginTop: Layout.spacing.sm,
        },
    }), []);

    return (
        <TouchableOpacity activeOpacity={0.7} onPress={() => onPress(topic)}>
            <Card padding="lg" variant="elevated" style={{ marginBottom: Layout.spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={[styles.topicIconContainer, { backgroundColor: topic.accentColor + '15' }]}>
                        {topic.icon}
                    </View>

                    <View style={styles.topicContent}>
                        <Typography variant="body1" weight="semibold" style={{ marginBottom: 2 }}>{topic.title}</Typography>
                        <Typography variant="body2" color="textSecondary" numberOfLines={2}>{topic.description}</Typography>
                        <View style={styles.metadataRow}>
                            <Badge label={topic.type} variant="default" />
                            <Badge label={topic.difficulty} variant={getDifficultyVariant(topic.difficulty) as any} />
                        </View>
                    </View>

                    <CaretRight size={20} color={colors.textDim} style={{ marginLeft: Layout.spacing.sm }} />
                </View>
            </Card>
        </TouchableOpacity>
    );
}
