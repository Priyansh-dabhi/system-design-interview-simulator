import { CheckCircleIcon, TargetIcon, XCircleIcon } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Layout } from '../../constants/Layout';
import { TopicCoverageItem } from '../../types/types';
import { AMBER, SUCCESS } from './summaryColors';

interface CoverageChecklistProps {
    items: TopicCoverageItem[];
}

export function CoverageChecklist({ items }: CoverageChecklistProps) {
    const { colors } = useTheme();

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
            backgroundColor: '#8B5CF620',
        },
        title: { fontSize: 14, fontWeight: '600', color: colors.text },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Layout.spacing.sm,
            paddingHorizontal: Layout.spacing.sm + 4,
            paddingVertical: Layout.spacing.sm,
            borderRadius: Layout.borderRadius.sm + 2,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.background,
        },
        topic: { flex: 1, fontSize: 13, color: colors.text },
    }), [colors]);

    if (items.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <TargetIcon size={16} color="#8B5CF6" weight="fill" />
                </View>
                <Text style={styles.title}>Topic Coverage</Text>
            </View>
            {items.map((item, i) => (
                <View key={`${item.topic}-${i}`} style={styles.row}>
                    {item.covered ? (
                        <CheckCircleIcon size={18} color={SUCCESS} weight="fill" />
                    ) : (
                        <XCircleIcon size={18} color={AMBER} weight="fill" />
                    )}
                    <Text style={styles.topic}>{item.topic}</Text>
                </View>
            ))}
        </View>
    );
}
