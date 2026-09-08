import { GraduationCap } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Layout } from '../../constants/Layout';
import { StudyPlanItem } from '../../types/types';
import { Typography } from '../ui/Typography';
import { Card } from '../ui/Card';

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
            marginBottom: Layout.spacing.sm,
        },
        iconContainer: {
            width: 32,
            height: 32,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0EA5E915',
        },
        cardItem: {
            gap: 4,
            padding: Layout.spacing.md,
            borderRadius: Layout.borderRadius.md,
            backgroundColor: colors.surfaceHighlight,
            marginBottom: Layout.spacing.xs,
        },
    }), [colors]);

    if (!items || items.length === 0) return null;

    return (
        <Card padding="lg" variant="outlined">
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <GraduationCap size={18} color="#0EA5E9" weight="fill" />
                </View>
                <Typography variant="h4" weight="semibold">Study Plan</Typography>
            </View>
            <View style={styles.container}>
                {items.map((item, i) => (
                    <View key={`${item.topic}-${i}`} style={styles.cardItem}>
                        <Typography variant="body2" weight="bold">{item.topic}</Typography>
                        {!!item.why && (
                            <Typography variant="caption" color="textSecondary" style={{ lineHeight: 18 }}>
                                {item.why}
                            </Typography>
                        )}
                    </View>
                ))}
            </View>
        </Card>
    );
}
