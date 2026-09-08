import { useChatMutation, useEndSessionMutation, useGetHintMutation } from '@/src/redux/api/interview_api';
import { setSummary, incrementHintCount, setMessages as persistMessages, clearSession } from '@/src/redux/slices/session';
import { getMaxHints } from '../../src/utils/hints';
import type { RootState } from '@/src/redux/store';
import { useNavigation, useRouter } from 'expo-router';
import {
    ExpoSpeechRecognitionModule,
    useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { ChatHeader } from '../../src/components/interview/ChatHeader';
import { ChatInput } from '../../src/components/interview/ChatInput';
import { MessageBubble, Message } from '../../src/components/interview/MessageBubble';
import { TypingIndicator } from '../../src/components/interview/TypingIndicator';
import { LoadingOverlay } from '../../src/components/shared/LoadingOverlay';
import { useTheme } from '../../src/theme/useTheme';
import { Layout } from '../../src/constants/Layout';
import { Typography } from '../../src/components/ui/Typography';

// A simple progress indicator for the interview stages.
function StageIndicator({ currentMessageCount }: { currentMessageCount: number }) {
    const { colors } = useTheme();
    
    // Simple mocked progression based on message turns
    const stages = ['Requirements', 'Architecture', 'Deep Dive', 'Trade-offs'];
    let activeIndex = 0;
    if (currentMessageCount > 15) activeIndex = 3;
    else if (currentMessageCount > 8) activeIndex = 2;
    else if (currentMessageCount > 3) activeIndex = 1;

    return (
        <View style={{
            flexDirection: 'row', 
            paddingHorizontal: Layout.spacing.lg, 
            paddingVertical: Layout.spacing.sm,
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        }}>
            {stages.map((stage, idx) => {
                const isActive = idx === activeIndex;
                const isPast = idx < activeIndex;
                return (
                    <View key={stage} style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                        <Typography 
                            variant="caption" 
                            weight={isActive ? "bold" : "medium"}
                            style={{ color: isActive ? colors.primary : (isPast ? colors.text : colors.textDim) }}
                            numberOfLines={1}
                        >
                            {stage}
                        </Typography>
                        {idx < stages.length - 1 && (
                            <View style={{ flex: 1, height: 1, backgroundColor: colors.border, marginHorizontal: 8 }} />
                        )}
                    </View>
                );
            })}
        </View>
    );
}

export default function InterviewSessionScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const dispatch = useDispatch();

    const sessionId = useSelector((state: RootState) => state.session.sessionId);
    const openingMessage = useSelector((state: RootState) => state.session.openingMessage);
    const problem = useSelector((state: RootState) => state.session.problem);
    const durationMinutes = useSelector((state: RootState) => state.session.durationMinutes);
    const hintCount = useSelector((state: RootState) => state.session.hintCount);
    const topicTitle = useSelector((state: RootState) => state.problem.selectedTopic?.title) || 'System Design Interview';

    const [sendChat, { isLoading: isSending }] = useChatMutation();
    const [endSession, { isLoading: isEnding }] = useEndSessionMutation();
    const [getHint, { isLoading: isHintLoading }] = useGetHintMutation();

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isNavigatingAway, setIsNavigatingAway] = useState(false);
    const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
    const flatListRef = useRef<FlatList>(null);
    const baseTextRef = useRef('');
    const hasEndedRef = useRef(false);
    const endsAtRef = useRef<number | null>(null);
    const performEndSessionRef = useRef<() => void>(() => {});
    const { colors } = useTheme();

    useEffect(() => {
        if (!isRecording) {
            baseTextRef.current = inputText;
        }
    }, [inputText, isRecording]);

    useEffect(() => {
        if (openingMessage) {
            setMessages([{ id: '1', role: 'interviewer', text: openingMessage }]);
        }
    }, [openingMessage]);

    const performEndSession = useCallback(async () => {
        if (!sessionId || !problem) return;
        if (hasEndedRef.current) return;
        hasEndedRef.current = true;
        try {
            const result = await endSession({ sessionId, problem }).unwrap();
            
            if (result.status === "cancelled") {
                dispatch(clearSession());
                setIsNavigatingAway(true);
                router.replace('/(main)/home');
                return;
            }

            dispatch(setSummary(result));
            dispatch(persistMessages(messages.map(m => ({ role: m.role, text: m.text }))));
            setIsNavigatingAway(true);
            router.replace('/(interview)/summary');
        } catch (err: any) {
            hasEndedRef.current = false;
            console.error('End session error:', err);
            Alert.alert(
                'Summary Failed',
                err?.data?.message || 'Failed to generate summary. Please try again.',
                [{ text: 'OK' }]
            );
        }
    }, [dispatch, endSession, problem, router, sessionId, messages]);

    useEffect(() => {
        performEndSessionRef.current = performEndSession;
    });

    useEffect(() => {
        if (!durationMinutes) return;
        if (endsAtRef.current === null) {
            endsAtRef.current = Date.now() + durationMinutes * 60 * 1000;
        }
        const tick = () => {
            const remaining = Math.max(0, Math.round((endsAtRef.current! - Date.now()) / 1000));
            setRemainingSeconds(remaining);
            if (remaining <= 0) {
                performEndSessionRef.current();
            }
        };
        tick();
        const intervalId = setInterval(tick, 1000);
        return () => clearInterval(intervalId);
    }, [durationMinutes]);

    const handleEndInterview = useCallback(() => {
        Alert.alert(
            'End Interview?',
            'This will generate your performance summary. You cannot continue this session after ending.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'End Interview', style: 'destructive', onPress: performEndSession },
            ]
        );
    }, [performEndSession]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
            if (isNavigatingAway || isEnding) return;
            e.preventDefault();
            Alert.alert(
                'End Interview?',
                'This will generate your performance summary. You cannot continue this session after ending.',
                [
                    { text: 'Cancel', style: 'cancel', onPress: () => { } },
                    { text: 'End Interview', style: 'destructive', onPress: () => { performEndSession(); } },
                ]
            );
        });
        return unsubscribe;
    }, [navigation, isNavigatingAway, isEnding, performEndSession]);

    const handleSend = async () => {
        if (!inputText.trim() || !sessionId || !problem) return;

        const userText = inputText.trim();
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'candidate',
            text: userText,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText('');

        setTimeout(() => { flatListRef.current?.scrollToEnd({ animated: true }); }, 100);

        try {
            const result = await sendChat({ sessionId, problem, message: userText }).unwrap();
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'interviewer',
                text: result.message,
            };
            setMessages((prev) => [...prev, aiMessage]);
            setTimeout(() => { flatListRef.current?.scrollToEnd({ animated: true }); }, 100);
        } catch (err: any) {
            console.error('Chat error:', err);
            Alert.alert(
                'Chat Failed',
                err?.data?.message || 'Failed to get AI response. Please try again.',
                [{ text: 'OK' }]
            );
        }
    };

    const maxHints = getMaxHints(durationMinutes);

    const handleHint = async () => {
        if (!sessionId || isHintLoading) return;

        if (hintCount >= maxHints) {
            Alert.alert(
                'No Hints Remaining',
                `You've used all ${maxHints} hints for this session. Trust your instincts! 💡`,
                [{ text: 'OK' }]
            );
            return;
        }

        try {
            const result = await getHint({ sessionId }).unwrap();
            dispatch(incrementHintCount());
            Alert.alert('Hint', result.hint, [{ text: 'Got it!' }]);
        } catch (err: any) {
            console.error('Hint error:', err);
            Alert.alert('Hint Failed', 'Failed to get a hint. Please try again.');
        }
    };

    useSpeechRecognitionEvent('start', () => setIsRecording(true));
    useSpeechRecognitionEvent('end', () => setIsRecording(false));
    useSpeechRecognitionEvent('result', (event) => {
        const transcript = event.results[0]?.transcript;
        if (transcript) {
            const baseText = baseTextRef.current;
            const separator = baseText.length > 0 && !baseText.endsWith(' ') ? ' ' : '';
            setInputText(baseText + separator + transcript);
        }
    });
    
    useSpeechRecognitionEvent('error', (event) => {
        console.error('Speech recognition error:', event.error, event.message);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
            Alert.alert(
                'Microphone Permission Required',
                'Please enable microphone and speech recognition permissions in your device settings to use voice input.',
                [{ text: 'OK' }]
            );
        } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
            Alert.alert(
                'Voice Input Failed',
                'Speech recognition encountered an error. Please try again or use text input.',
                [{ text: 'OK' }]
            );
        }
    });

    const handleVoiceInput = async () => {
        if (isRecording) {
            ExpoSpeechRecognitionModule.stop();
            return;
        }
        const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!result.granted) {
            Alert.alert(
                'Microphone Permission Required',
                'Please enable microphone and speech recognition permissions in your device settings to use voice input.',
                [{ text: 'OK' }]
            );
            return;
        }
        ExpoSpeechRecognitionModule.start({ lang: 'en-US', interimResults: true, continuous: false });
    };

    const styles = React.useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        messagesList: {
            padding: Layout.spacing.lg,
            paddingBottom: Layout.spacing.xl,
        },
    }), [colors]);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <ChatHeader
                topicTitle={topicTitle}
                onBack={() => router.back()}
                onEnd={handleEndInterview}
                remainingSeconds={remainingSeconds ?? undefined}
            />

            <StageIndicator currentMessageCount={messages.length} />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={({ item }) => <MessageBubble item={item} />}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={isSending ? <TypingIndicator /> : null}
                />

                <ChatInput
                    value={inputText}
                    onChangeText={setInputText}
                    onSend={handleSend}
                    onVoiceInput={handleVoiceInput}
                    onHint={handleHint}
                    isSending={isSending}
                    isRecording={isRecording}
                    isHintLoading={isHintLoading}
                    hintCount={hintCount}
                    maxHints={maxHints}
                    disabled={remainingSeconds !== null && remainingSeconds <= 0}
                />
            </KeyboardAvoidingView>

            {isEnding && <LoadingOverlay />}
        </SafeAreaView>
    );
}
