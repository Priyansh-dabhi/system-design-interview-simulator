import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Layout } from '../../constants/Layout';
import { Typography } from '../ui/Typography';
import { Robot, User } from 'phosphor-react-native';

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
        container: {
            marginBottom: Layout.spacing.xl,
            flexDirection: isInterviewer ? 'row' : 'row-reverse',
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
            backgroundColor: isInterviewer ? colors.surfaceHighlight : colors.primary + '20',
        },
        messageBubble: {
            maxWidth: '80%',
            paddingHorizontal: Layout.spacing.lg,
            paddingVertical: Layout.spacing.md,
            borderRadius: Layout.borderRadius.xl,
            borderBottomLeftRadius: isInterviewer ? 4 : Layout.borderRadius.xl,
            borderBottomRightRadius: !isInterviewer ? 4 : Layout.borderRadius.xl,
        },
        interviewerBubble: {
            backgroundColor: colors.surfaceHighlight,
        },
        candidateBubble: {
            backgroundColor: colors.primary,
        },
    }), [colors, isInterviewer]);

    return (
        <View style={styles.container}>
            <View style={styles.avatar}>
                {isInterviewer ? (
                    <Robot size={20} color={colors.textSecondary} weight="fill" />
                ) : (
                    <User size={20} color={colors.primary} weight="fill" />
                )}
            </View>

            <View style={[styles.messageBubble, isInterviewer ? styles.interviewerBubble : styles.candidateBubble]}>
                <Typography 
                    variant="body1" 
                    style={{ color: isInterviewer ? colors.text : '#FFFFFF', lineHeight: 24 }}
                >
                    {item.text}
                </Typography>
            </View>
        </View>
    );
}
