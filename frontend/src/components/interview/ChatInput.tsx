import { HintButton } from './HintButton';
import { Microphone, PaperPlaneRight } from 'phosphor-react-native';
import React, { useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { useTheme } from '../../theme/useTheme';
import { Layout } from '../../constants/Layout';

interface ChatInputProps {
    value: string;
    onChangeText: (text: string) => void;
    onSend: () => void;
    onVoiceInput: () => void;
    onHint: () => void;
    isSending: boolean;
    isRecording: boolean;
    isHintLoading: boolean;
    hintCount: number;
    maxHints: number;
    disabled?: boolean;
}

export function ChatInput({
    value,
    onChangeText,
    onSend,
    onVoiceInput,
    onHint,
    isSending,
    isRecording,
    isHintLoading,
    hintCount,
    maxHints,
    disabled = false,
}: ChatInputProps) {
    const { colors } = useTheme();
    const canSend = value.trim().length > 0 && !isSending && !disabled;

    // Pulse animation for recording
    const scale = useSharedValue(1);
    
    useEffect(() => {
        if (isRecording) {
            scale.value = withRepeat(
                withSequence(
                    withTiming(1.15, { duration: 500 }),
                    withTiming(1, { duration: 500 })
                ),
                -1,
                true
            );
        } else {
            scale.value = withTiming(1, { duration: 200 });
        }
    }, [isRecording, scale]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const styles = React.useMemo(() => StyleSheet.create({
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'flex-end',
            paddingHorizontal: Layout.spacing.lg,
            paddingVertical: Layout.spacing.md,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.surface,
            gap: Layout.spacing.sm,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 10, // Gives a slight "floating" top shadow on Android
        },
        inputWrapper: {
            flex: 1,
            backgroundColor: colors.background,
            borderRadius: Layout.borderRadius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            flexDirection: 'row',
            alignItems: 'flex-end',
            paddingRight: Layout.spacing.xs,
        },
        input: {
            flex: 1,
            paddingHorizontal: Layout.spacing.md,
            paddingVertical: Layout.spacing.sm + 4,
            fontSize: 15,
            color: colors.text,
            maxHeight: 120,
            minHeight: 48,
            fontFamily: 'Inter_400Regular',
        },
        voiceButtonWrapper: {
            padding: 8,
            alignItems: 'center',
            justifyContent: 'center',
            height: 48,
        },
        voiceButton: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.border,
        },
        voiceButtonActive: {
            backgroundColor: '#EF4444',
            borderColor: '#DC2626',
        },
        sendButton: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
        },
        sendButtonDisabled: {
            backgroundColor: colors.surfaceHighlight,
        },
    }), [colors]);

    return (
        <View style={styles.inputContainer}>
            <HintButton
                onPress={onHint}
                isLoading={isHintLoading}
                hintCount={hintCount}
                maxHints={maxHints}
                disabled={disabled}
            />

            <View style={styles.inputWrapper}>
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={disabled ? "Time's up" : "Message your interviewer..."}
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    maxLength={2000}
                    editable={!isSending && !disabled}
                />
                
                <TouchableOpacity onPress={onVoiceInput} style={styles.voiceButtonWrapper}>
                    <Animated.View style={[styles.voiceButton, isRecording && styles.voiceButtonActive, animatedStyle]}>
                        <Microphone
                            size={18}
                            color={isRecording ? '#FFFFFF' : colors.textSecondary}
                            weight={isRecording ? 'fill' : 'bold'}
                        />
                    </Animated.View>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                onPress={onSend}
                style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
                disabled={!canSend}
            >
                <PaperPlaneRight
                    size={20}
                    color={canSend ? '#FFFFFF' : colors.textDim}
                    weight="fill"
                />
            </TouchableOpacity>
        </View>
    );
}
