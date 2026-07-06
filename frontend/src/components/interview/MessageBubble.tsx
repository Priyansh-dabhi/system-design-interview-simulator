import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
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
    const { colors } = useTheme();
    const isInterviewer = item.role === 'interviewer';

    const styles = React.useMemo(() => StyleSheet.create({
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
            backgroundColor: colors.aiMessageBg,
            borderWidth: 1,
            borderColor: colors.aiMessageBorder,
        },
        candidateBubble: {
            backgroundColor: colors.userMessageBg,
        },
        messageText: {
            fontSize: 15,
            lineHeight: 22,
        },
        interviewerText: {
            color: colors.aiMessageText,
        },
        candidateText: {
            color: colors.userMessageText,
        },
    }), [colors]);
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

