import { useChatMutation, useEndSessionMutation } from '@/src/redux/api/interview_api';
import { setSummary } from '@/src/redux/slices/session';
import type { RootState } from '@/src/redux/store';
import { useRouter } from 'expo-router';
import { ArrowLeftIcon, MicrophoneIcon, PaperPlaneRightIcon } from 'phosphor-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Colors } from '../../src/constants/Colors';
import { Layout } from '../../src/constants/Layout';

interface Message {
    id: string;
    role: 'interviewer' | 'candidate';
    text: string;
}

export default function InterviewSessionScreen() {
    const router = useRouter();
    const dispatch = useDispatch();

    // Read session data from Redux
    const sessionId = useSelector((state: RootState) => state.session.sessionId);
    const openingMessage = useSelector((state: RootState) => state.session.openingMessage);
    const problem = useSelector((state: RootState) => state.session.problem);
    const topicTitle = useSelector((state: RootState) => state.problem.selectedTopic?.title) || 'System Design Interview';

    const [sendChat, { isLoading: isSending }] = useChatMutation();
    const [endSession, { isLoading: isEnding }] = useEndSessionMutation();

    // Initialize messages with the AI opening question from the API
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    // Set initial message from the API response
    useEffect(() => {
        if (openingMessage) {
            setMessages([
                {
                    id: '1',
                    role: 'interviewer',
                    text: openingMessage,
                },
            ]);
        }
    }, [openingMessage]);

    const handleSend = async () => {
        if (!inputText.trim() || !sessionId || !problem) return;

        const userText = inputText.trim();
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'candidate',
            text: userText,
        };

        // Append user message immediately
        setMessages((prev) => [...prev, userMessage]);
        setInputText('');

        // Auto-scroll to bottom
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);

        try {
            const result = await sendChat({ sessionId, problem, message: userText }).unwrap();

            // Append AI response
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'interviewer',
                text: result.message,
            };
            setMessages((prev) => [...prev, aiMessage]);

            // Auto-scroll after AI response
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } catch (err: any) {
            console.error('Chat error:', err);
            Alert.alert(
                'Chat Failed',
                err?.data?.message || 'Failed to get AI response. Please try again.',
                [{ text: 'OK' }]
            );
        }
    };

    const handleVoiceInput = () => {
        setIsRecording(!isRecording);
        // TODO: Implement voice recording logic
        console.log(isRecording ? 'Stopping recording...' : 'Starting recording...');
    };

    const handleEndInterview = () => {
        Alert.alert(
            'End Interview?',
            'This will generate your performance summary. You cannot continue this session after ending.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'End Interview',
                    style: 'destructive',
                    onPress: async () => {
                        if (!sessionId || !problem) return;
                        try {
                            const result = await endSession({ sessionId, problem }).unwrap();
                            dispatch(setSummary(result));
                            router.replace('/summary');
                        } catch (err: any) {
                            console.error('End session error:', err);
                            Alert.alert(
                                'Summary Failed',
                                err?.data?.message || 'Failed to generate summary. Please try again.',
                                [{ text: 'OK' }]
                            );
                        }
                    },
                },
            ]
        );
    };

    const renderMessage = ({ item }: { item: Message }) => {
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
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                {/* Back Button */}
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeftIcon size={24} color={Colors.text} />
                </TouchableOpacity>

                {/* Center: Topic + AI Interviewer */}
                <View style={styles.headerCenter}>
                    <Text style={styles.topicTitle}>{topicTitle}</Text>
                    <Text style={styles.aiLabel}>AI INTERVIEWER</Text>
                </View>

                {/* End Button */}
                <TouchableOpacity onPress={handleEndInterview} style={styles.endButton}>
                    <Text style={styles.endButtonText}>End</Text>
                </TouchableOpacity>
            </View>

            {/* Messages */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messagesList}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={
                    isSending ? (
                        <View style={[styles.messageContainer, styles.interviewerContainer]}>
                            <View style={[styles.messageBubble, styles.interviewerBubble, styles.typingBubble]}>
                                <ActivityIndicator size="small" color={Colors.textSecondary} />
                                <Text style={styles.typingText}>AI is thinking...</Text>
                            </View>
                        </View>
                    ) : null
                }
            />

            {/* Input Area */}
            <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Type your response..."
                        placeholderTextColor={Colors.textSecondary}
                        multiline
                        maxLength={1000}
                        editable={!isSending}
                    />
                    <TouchableOpacity
                        onPress={handleVoiceInput}
                        style={[styles.voiceButton, isRecording && styles.voiceButtonActive]}
                    >
                        <MicrophoneIcon
                            size={20}
                            color={isRecording ? '#FFFFFF' : Colors.text}
                            weight={isRecording ? 'fill' : 'regular'}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleSend}
                        style={[styles.sendButton, (!inputText.trim() || isSending) && styles.sendButtonDisabled]}
                        disabled={!inputText.trim() || isSending}
                    >
                        <PaperPlaneRightIcon
                            size={20}
                            color={inputText.trim() && !isSending ? '#FFFFFF' : Colors.textSecondary}
                            weight="fill"
                        />
                    </TouchableOpacity>
                </View>
            </KeyboardStickyView>

            {/* Loading Overlay while generating summary */}
            {isEnding && (
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingCard}>
                        <ActivityIndicator size="large" color={Colors.primaryBrand} />
                        <Text style={styles.loadingTitle}>Generating Summary</Text>
                        <Text style={styles.loadingSubtitle}>Analyzing your interview performance...</Text>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Layout.spacing.md,
        paddingVertical: Layout.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.background,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: Layout.spacing.md,
    },
    topicTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        textAlign: 'center',
    },
    aiLabel: {
        fontSize: 11,
        fontWeight: '500',
        color: Colors.textSecondary,
        marginTop: 2,
        letterSpacing: 0.5,
    },
    endButton: {
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 20,
        backgroundColor: '#1A0A0A',
        borderWidth: 1,
        borderColor: '#2A1010',
    },
    endButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.error,
    },
    messagesList: {
        padding: Layout.spacing.lg,
        paddingBottom: Layout.spacing.xl,
    },
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
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    loadingCard: {
        backgroundColor: Colors.surface,
        borderRadius: Layout.borderRadius.lg,
        padding: 32,
        alignItems: 'center',
        gap: 16,
        marginHorizontal: 40,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    loadingTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
    },
    loadingSubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
});
