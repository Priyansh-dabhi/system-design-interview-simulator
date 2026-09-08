import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Layout } from '../../constants/Layout';
import { Robot } from 'phosphor-react-native';
import { Typography } from '../ui/Typography';

export function TypingIndicator() {
    const { colors } = useTheme();

    const styles = React.useMemo(() => StyleSheet.create({
        container: {
            marginBottom: Layout.spacing.xl,
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: Layout.spacing.sm,
            maxWidth: '100%',
        },
        avatar: {
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.surfaceHighlight,
        },
        messageBubble: {
            maxWidth: '80%',
            paddingHorizontal: Layout.spacing.lg,
            paddingVertical: Layout.spacing.md,
            borderRadius: Layout.borderRadius.xl,
            borderBottomLeftRadius: 4,
            backgroundColor: colors.surfaceHighlight,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
    }), [colors]);

    return (
        <View style={styles.container}>
            <View style={styles.avatar}>
                <Robot size={20} color={colors.textSecondary} weight="fill" />
            </View>

            <View style={styles.messageBubble}>
                <ActivityIndicator size="small" color={colors.textSecondary} />
                <Typography variant="body2" color="textSecondary" style={{ fontStyle: 'italic' }}>
                    AI is thinking...
                </Typography>
            </View>
        </View>
    );
}
