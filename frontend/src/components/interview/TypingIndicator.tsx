import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Layout } from '../../constants/Layout';

export function TypingIndicator() {
    const { colors } = useTheme();

    const styles = React.useMemo(() => StyleSheet.create({
        messageContainer: {
            marginBottom: Layout.spacing.md,
            maxWidth: '80%',
        },
        interviewerContainer: {
            alignSelf: 'flex-start',
        },
        messageBubble: {
            paddingHorizontal: Layout.spacing.md,
            paddingVertical: Layout.spacing.sm + 2,
            borderRadius: Layout.borderRadius.lg,
        },
        interviewerBubble: {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
        },
        typingBubble: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        typingText: {
            fontSize: 13,
            color: colors.textSecondary,
            fontStyle: 'italic',
        },
    }), [colors]);

    return (
        <View style={[styles.messageContainer, styles.interviewerContainer]}>
            <View style={[styles.messageBubble, styles.interviewerBubble, styles.typingBubble]}>
                <ActivityIndicator size="small" color={colors.textSecondary} />
                <Text style={styles.typingText}>AI is thinking...</Text>
            </View>
        </View>
    );
}

