import { HintButton } from './HintButton';
import { Microphone, PaperPlaneRight } from 'phosphor-react-native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { useTheme } from '../../theme/useTheme';

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
    bottomInset?: number;
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
    bottomInset = 0,
}: ChatInputProps) {
    const { colors, isDark } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
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
            paddingHorizontal: 14,
            paddingTop: 10,
            paddingBottom: Math.max(bottomInset, 10),
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.surface,
            gap: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: isDark ? 0.25 : 0.05,
            shadowRadius: 8,
            elevation: 8,
        },
        inputWrapper: {
            flex: 1,
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.75)' : '#F1F5F9',
            borderRadius: 22,
            borderWidth: 1.5,
            borderColor: isFocused ? colors.primary : colors.border,
            flexDirection: 'row',
            alignItems: 'center',
            paddingLeft: 14,
            paddingRight: 6,
            minHeight: 44,
        },
        input: {
            flex: 1,
            paddingVertical: 8,
            fontSize: 15,
            color: colors.text,
            maxHeight: 120,
            minHeight: 40,
            fontFamily: 'Inter_400Regular',
        },
        voiceButtonWrapper: {
            padding: 4,
            alignItems: 'center',
            justifyContent: 'center',
        },
        voiceButton: {
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: isRecording ? '#EF4444' : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
        },
        sendButton: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.35,
            shadowRadius: 6,
            elevation: 4,
        },
        sendButtonDisabled: {
            backgroundColor: isDark ? 'rgba(51, 65, 85, 0.35)' : 'rgba(226, 232, 240, 0.9)',
            shadowOpacity: 0,
            elevation: 0,
        },
    }), [colors, isDark, isFocused, bottomInset]);

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
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={disabled ? "Time's up" : "Message your interviewer..."}
                    placeholderTextColor={colors.textDim}
                    multiline
                    maxLength={2000}
                    editable={!isSending && !disabled}
                />
                
                <TouchableOpacity
                    onPress={onVoiceInput}
                    style={styles.voiceButtonWrapper}
                    accessibilityRole="button"
                    accessibilityLabel={isRecording ? "Stop voice recording" : "Start voice input"}
                >
                    <Animated.View style={[styles.voiceButton, animatedStyle]}>
                        <Microphone
                            size={19}
                            color={isRecording ? '#FFFFFF' : (isFocused ? colors.primary : colors.textSecondary)}
                            weight={isRecording ? 'fill' : 'bold'}
                        />
                    </Animated.View>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                onPress={onSend}
                style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
                disabled={!canSend}
                accessibilityRole="button"
                accessibilityLabel="Send message"
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
