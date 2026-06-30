import { MicrophoneIcon, PaperPlaneRightIcon } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';

interface ChatInputProps {
    value: string;
    onChangeText: (text: string) => void;
    onSend: () => void;
    onVoiceInput: () => void;
    isSending: boolean;
    isRecording: boolean;
}

export function ChatInput({
    value,
    onChangeText,
    onSend,
    onVoiceInput,
    isSending,
    isRecording,
}: ChatInputProps) {
    const canSend = value.trim().length > 0 && !isSending;

    return (
        <View style={styles.inputContainer}>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder="Type your response..."
                placeholderTextColor={Colors.textSecondary}
                multiline
                maxLength={1000}
                editable={!isSending}
            />
            <TouchableOpacity
                onPress={onVoiceInput}
                style={[styles.voiceButton, isRecording && styles.voiceButtonActive]}
            >
                <MicrophoneIcon
                    size={20}
                    color={isRecording ? '#FFFFFF' : Colors.text}
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
                    color={canSend ? '#FFFFFF' : Colors.textSecondary}
                    weight="fill"
                />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: Layout.spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        backgroundColor: Colors.background,
        gap: Layout.spacing.sm,
    },
    input: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: Layout.borderRadius.md,
        paddingHorizontal: Layout.spacing.md,
        paddingVertical: Layout.spacing.sm + 2,
        fontSize: 15,
        color: Colors.text,
        maxHeight: 100,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    voiceButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    voiceButtonActive: {
        backgroundColor: '#EF4444',
        borderColor: '#DC2626',
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primaryBrand,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: Colors.surface,
    },
});
