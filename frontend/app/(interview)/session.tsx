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

export default function InterviewSessionScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const dispatch = useDispatch();

    // Read session data from Redux
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
    // Guards against ending the session more than once (timer + back gesture + End button).
    const hasEndedRef = useRef(false);
    const endsAtRef = useRef<number | null>(null);
    const performEndSessionRef = useRef<() => void>(() => {});
    const { colors } = useTheme();

    // Keep track of text before recording to allow appending on resume
    useEffect(() => {
        if (!isRecording) {
            baseTextRef.current = inputText;
        }
    }, [inputText, isRecording]);

    // Set initial message from the API response
    useEffect(() => {
        if (openingMessage) {
            setMessages([{ id: '1', role: 'interviewer', text: openingMessage }]);
        }
    }, [openingMessage]);

    const performEndSession = useCallback(async () => {
        if (!sessionId || !problem) return;
        if (hasEndedRef.current) return; // already ending/ended — don't double-fire
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
            
            // Persist current messages for transcript export
            dispatch(persistMessages(messages.map(m => ({ role: m.role, text: m.text }))));
            
            setIsNavigatingAway(true);
            router.replace('/summary');
        } catch (err: any) {
            hasEndedRef.current = false; // allow retry on failure
            console.error('End session error:', err);
            Alert.alert(
                'Summary Failed',
                err?.data?.message || 'Failed to generate summary. Please try again.',
                [{ text: 'OK' }]
            );
        }
    }, [dispatch, endSession, problem, router, sessionId]);

    // Keep a live ref to performEndSession so the countdown interval always
    // calls the latest closure without needing to re-create the interval.
    useEffect(() => {
        performEndSessionRef.current = performEndSession;
    });

    // Countdown: derive a fixed deadline once, tick every second, and auto-end
    // (exactly once, via hasEndedRef) when it reaches zero.
    useEffect(() => {
        if (!durationMinutes) return; // untimed session — no countdown
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

    // Intercept back button and gestures
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
                `You've used all ${maxHints} hints for this session. Trust your instincts — you've got this! 💡`,
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

    // --- Speech Recognition Hooks ---
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

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
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
