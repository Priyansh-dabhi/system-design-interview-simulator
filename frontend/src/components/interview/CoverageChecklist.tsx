import { CheckCircle, Target, XCircle } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Layout } from '../../constants/Layout';
import { TopicCoverageItem } from '../../types/types';
import { AMBER, SUCCESS } from './summaryColors';
import { Typography } from '../ui/Typography';
import { Card } from '../ui/Card';

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
            marginBottom: Layout.spacing.sm,
        },
        iconContainer: {
            width: 32,
            height: 32,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#8B5CF615',
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Layout.spacing.md,
            paddingVertical: Layout.spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
    }), [colors]);

    if (!items || items.length === 0) return null;

    return (
        <Card padding="lg" variant="outlined">
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Target size={18} color="#8B5CF6" weight="fill" />
                </View>
                <Typography variant="h4" weight="semibold">Topic Coverage</Typography>
            </View>
            <View style={styles.container}>
                {items.map((item, i) => (
                    <View key={`${item.topic}-${i}`} style={[styles.row, i === items.length - 1 && { borderBottomWidth: 0 }]}>
                        {item.covered ? (
                            <CheckCircle size={20} color={colors.success || SUCCESS} weight="fill" />
                        ) : (
                            <XCircle size={20} color={AMBER} weight="fill" />
                        )}
                        <Typography variant="body2" style={{ flex: 1 }}>{item.topic}</Typography>
                    </View>
                ))}
            </View>
        </Card>
    );
}
