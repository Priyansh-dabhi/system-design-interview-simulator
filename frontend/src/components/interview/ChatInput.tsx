import { HintButton } from './HintButton';
import { MicrophoneIcon, PaperPlaneRightIcon } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
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
    disabled = false,
}: ChatInputProps) {
    const { colors } = useTheme();
    const canSend = value.trim().length > 0 && !isSending && !disabled;

    const styles = React.useMemo(() => StyleSheet.create({
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'flex-end',
            padding: Layout.spacing.md,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
            gap: Layout.spacing.sm,
        },
        input: {
            flex: 1,
            backgroundColor: colors.surface,
            borderRadius: Layout.borderRadius.md,
            paddingHorizontal: Layout.spacing.md,
            paddingVertical: Layout.spacing.sm + 2,
            fontSize: 15,
            color: colors.text,
            maxHeight: 100,
            borderWidth: 1,
            borderColor: colors.border,
        },
        voiceButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
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
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.primaryBrand,
            alignItems: 'center',
            justifyContent: 'center',
        },
        sendButtonDisabled: {
            backgroundColor: colors.surface,
        },
    }), [colors]);

    return (
        <View style={styles.inputContainer}>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={disabled ? "Time's up — interview ended" : "Type your response..."}
                placeholderTextColor={colors.textSecondary}
                multiline
                maxLength={1000}
                editable={!isSending && !disabled}
            />
            <HintButton
                onPress={onHint}
                isLoading={isHintLoading}
                hintCount={hintCount}
                disabled={disabled}
            />
            <TouchableOpacity
                onPress={onVoiceInput}
                style={[styles.voiceButton, isRecording && styles.voiceButtonActive]}
            >
                <MicrophoneIcon
                    size={20}
                    color={isRecording ? '#FFFFFF' : colors.text}
                    weight={isRecording ? 'fill' : 'regular'}
                />
            </TouchableOpacity>
            <TouchableOpacity
                onPress={onSend}
                style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
                disabled={!canSend}
            >
                <PaperPlaneRightIcon
                    size={20}
                    color={canSend ? '#FFFFFF' : colors.textSecondary}
                    weight="fill"
                />
            </TouchableOpacity>
        </View>
    );
}

