import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';

export function TypingIndicator() {
    return (
        <View style={[styles.messageContainer, styles.interviewerContainer]}>
            <View style={[styles.messageBubble, styles.interviewerBubble, styles.typingBubble]}>
                <ActivityIndicator size="small" color={Colors.textSecondary} />
                <Text style={styles.typingText}>AI is thinking...</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
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
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    typingBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    typingText: {
        fontSize: 13,
        color: Colors.textSecondary,
        fontStyle: 'italic',
    },
});
