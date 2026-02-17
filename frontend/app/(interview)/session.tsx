import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeftIcon, PaperPlaneRightIcon } from 'phosphor-react-native';
import React, { useRef, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/Colors';
import { Layout } from '../../src/constants/Layout';

interface Message {
    id: string;
    role: 'interviewer' | 'candidate';
    text: string;
}

export default function InterviewSessionScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const topicTitle = params.topicTitle as string || 'System Design Interview';

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'interviewer',
            text: "Let's start by defining the functional requirements. What features do you think are critical for an MVP?",
        },
        {
            id: '2',
            role: 'candidate',
            text: 'We need 1:1 messaging, sent/delivered/read receipts, and last seen status. Also critical is offline support.',
        },
        {
            id: '3',
            role: 'interviewer',
            text: 'Good. Now, how would you estimate the QPS for the messaging service if we assume 500M DAU?',
        },
    ]);

    const [inputText, setInputText] = useState('');
    const flatListRef = useRef<FlatList>(null);

    const handleSend = () => {
        if (inputText.trim()) {
            const newMessage: Message = {
                id: Date.now().toString(),
                role: 'candidate',
                text: inputText.trim(),
            };
            setMessages([...messages, newMessage]);
            setInputText('');

            // Auto-scroll to bottom
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    };

    const handleEndInterview = () => {
        // TODO: Navigate to interview summary or show confirmation dialog
        console.log('Ending interview...');
        router.back();
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
            />

            {/* Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Type your response..."
                        placeholderTextColor={Colors.textSecondary}
                        multiline
                        maxLength={1000}
                    />
                    <TouchableOpacity
                        onPress={handleSend}
                        style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                        disabled={!inputText.trim()}
                    >
                        <PaperPlaneRightIcon
                            size={20}
                            color={inputText.trim() ? '#FFFFFF' : Colors.textSecondary}
                            weight="fill"
                        />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
