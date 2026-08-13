import { BookOpenIcon } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Layout } from '../../constants/Layout';

interface IdealAnswerCardProps {
    text: string;
}

export function IdealAnswerCard({ text }: IdealAnswerCardProps) {
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
            backgroundColor: '#10B98120',
        },
        title: { fontSize: 14, fontWeight: '600', color: colors.text },
        card: {
            padding: Layout.spacing.md,
            borderRadius: Layout.borderRadius.md,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
        },
        body: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
    }), [colors]);

    if (!text) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <BookOpenIcon size={16} color="#10B981" weight="fill" />
                </View>
                <Text style={styles.title}>Ideal Answer</Text>
            </View>
            <View style={styles.card}>
                <Text style={styles.body}>{text}</Text>
            </View>
        </View>
    );
}
