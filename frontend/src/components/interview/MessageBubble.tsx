import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';

export interface Message {
    id: string;
    role: 'interviewer' | 'candidate';
    text: string;
}

interface MessageBubbleProps {
    item: Message;
}

export function MessageBubble({ item }: MessageBubbleProps) {
    const isInterviewer = item.role === 'interviewer';
    return (
        <View
            style={[
                styles.messageContainer,
                isInterviewer ? styles.interviewerContainer : styles.candidateContainer,
            ]}
        >
            <View
                style={[
                    styles.messageBubble,
                    isInterviewer ? styles.interviewerBubble : styles.candidateBubble,
                ]}
            >
                <Text
                    style={[
                        styles.messageText,
                        isInterviewer ? styles.interviewerText : styles.candidateText,
                    ]}
                >
                    {item.text}
                </Text>
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
    candidateContainer: {
        alignSelf: 'flex-end',
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
    candidateBubble: {
        backgroundColor: Colors.primaryBrand,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    interviewerText: {
        color: Colors.text,
    },
    candidateText: {
        color: '#FFFFFF',
    },
});
