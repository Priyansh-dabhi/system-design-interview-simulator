import { BookOpen } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Layout } from '../../constants/Layout';
import { Typography } from '../ui/Typography';
import { Card } from '../ui/Card';

interface IdealAnswerCardProps {
    text: string;
}

export function IdealAnswerCard({ text }: IdealAnswerCardProps) {
    const { colors } = useTheme();

    const styles = React.useMemo(() => StyleSheet.create({
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Layout.spacing.sm,
            marginBottom: Layout.spacing.md,
        },
        iconContainer: {
            width: 32,
            height: 32,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.success + '15',
        },
        bodyContainer: {
            padding: Layout.spacing.md,
            borderRadius: Layout.borderRadius.md,
            backgroundColor: colors.surfaceHighlight,
        },
    }), [colors]);

    if (!text) return null;

    return (
        <Card padding="lg" variant="outlined">
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <BookOpen size={18} color={colors.success} weight="fill" />
                </View>
                <Typography variant="h4" weight="semibold">Ideal Answer</Typography>
            </View>
            <View style={styles.bodyContainer}>
                <Typography variant="body2" color="textSecondary" style={{ lineHeight: 22 }}>
                    {text}
                </Typography>
            </View>
        </Card>
    );
}
