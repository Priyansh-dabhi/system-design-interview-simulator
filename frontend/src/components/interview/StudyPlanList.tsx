import { GraduationCapIcon } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Layout } from '../../constants/Layout';
import { StudyPlanItem } from '../../types/types';

interface StudyPlanListProps {
    items: StudyPlanItem[];
}

export function StudyPlanList({ items }: StudyPlanListProps) {
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
            backgroundColor: '#0EA5E920',
        },
        title: { fontSize: 14, fontWeight: '600', color: colors.text },
        card: {
            gap: 3,
            paddingHorizontal: Layout.spacing.sm + 4,
            paddingVertical: Layout.spacing.sm + 2,
            borderRadius: Layout.borderRadius.sm + 2,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.background,
        },
        topic: { fontSize: 13, fontWeight: '600', color: colors.text },
        why: { fontSize: 12, color: colors.textSecondary, lineHeight: 17 },
    }), [colors]);

    if (items.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <GraduationCapIcon size={16} color="#0EA5E9" weight="fill" />
                </View>
                <Text style={styles.title}>Study Plan</Text>
            </View>
            {items.map((item, i) => (
                <View key={`${item.topic}-${i}`} style={styles.card}>
                    <Text style={styles.topic}>{item.topic}</Text>
                    {!!item.why && <Text style={styles.why}>{item.why}</Text>}
                </View>
            ))}
        </View>
    );
}
