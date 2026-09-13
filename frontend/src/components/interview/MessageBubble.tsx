import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Layout } from '../../constants/Layout';
import { Typography } from '../ui/Typography';
import { Robot, SpeakerHigh, User } from 'phosphor-react-native';

export interface Message {
    id: string;
    role: 'interviewer' | 'candidate';
    text: string;
}

interface MessageBubbleProps {
    item: Message;
    isSpeaking?: boolean;
    onToggleSpeak?: (item: Message) => void;
}

export function MessageBubble({ item, isSpeaking = false, onToggleSpeak }: MessageBubbleProps) {
    const { colors, isDark } = useTheme();
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
        contentColumn: {
            maxWidth: '80%',
            alignItems: isInterviewer ? 'flex-start' : 'flex-end',
        },
        messageBubble: {
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
        speakerBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            marginTop: 6,
            marginLeft: 2,
            paddingVertical: 3,
            paddingHorizontal: 8,
            borderRadius: 12,
            backgroundColor: isSpeaking
                ? (isDark ? 'rgba(59, 130, 246, 0.16)' : 'rgba(37, 99, 235, 0.1)')
                : 'transparent',
        },
        speakerTextActive: {
            fontSize: 11,
            fontWeight: '600',
            color: colors.primary,
        },
    }), [colors, isInterviewer, isSpeaking, isDark]);

    return (
        <View style={styles.container}>
            <View style={styles.avatar}>
                {isInterviewer ? (
                    <Robot size={20} color={colors.textSecondary} weight="fill" />
                ) : (
                    <User size={20} color={colors.primary} weight="fill" />
                )}
            </View>

            <View style={styles.contentColumn}>
                <View style={[styles.messageBubble, isInterviewer ? styles.interviewerBubble : styles.candidateBubble]}>
                    <Typography 
                        variant="body1" 
                        style={{ color: isInterviewer ? colors.text : '#FFFFFF', lineHeight: 24 }}
                    >
                        {item.text}
                    </Typography>
                </View>

                {isInterviewer && onToggleSpeak && (
                    <TouchableOpacity
                        activeOpacity={0.65}
                        onPress={() => onToggleSpeak(item)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={styles.speakerBtn}
                    >
                        <SpeakerHigh
                            size={18}
                            color={isSpeaking ? colors.primary : colors.textSecondary}
                            weight={isSpeaking ? "fill" : "regular"}
                        />
                        {isSpeaking && (
                            <Text style={styles.speakerTextActive}>Playing...</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

