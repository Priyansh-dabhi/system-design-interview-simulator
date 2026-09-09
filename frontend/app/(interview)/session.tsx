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

// Clean stage progress indicator matching Figma
function StageIndicator({ currentMessageCount }: { currentMessageCount: number }) {
    const { colors } = useTheme();
    const stages = ['Requirements', 'High-Level Design', 'Deep Dive', 'Scalability', 'Trade-offs'];
    let activeIndex = 0;
    if (currentMessageCount > 12) activeIndex = 4;
    else if (currentMessageCount > 8) activeIndex = 3;
    else if (currentMessageCount > 5) activeIndex = 2;
    else if (currentMessageCount > 2) activeIndex = 1;

    const progressPct = ((activeIndex + 1) / stages.length) * 100;

    return (
        <View style={{
            paddingHorizontal: 20,
            paddingVertical: 10,
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            gap: 6,
        }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" weight="bold" style={{ color: colors.primary }}>
                    {stages[activeIndex]}
                </Typography>
                <Typography variant="caption" color="textDim" weight="medium">
                    {activeIndex + 1} / {stages.length}
                </Typography>
            </View>
            <View style={{ height: 4, backgroundColor: 'rgba(51, 65, 85, 0.4)', borderRadius: 2, overflow: 'hidden' }}>
                <View style={{ height: '100%', width: `${progressPct}%`, backgroundColor: colors.primary, borderRadius: 2 }} />
            </View>
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
    const topicTitle = useSelector((state: RootState) => state.problem.selectedTopic?.title) || problem || 'Interview';

    const [sendChat, { isLoading: isSending }] = useChatMutation();
    const [endSession, { isLoading: isEnding }] = useEndSessionMutation();
    const [getHint, { isLoading: isHintLoading }] = useGetHintMutation();

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
    const [isNavigatingAway, setIsNavigatingAway] = useState(false);

    const hasEndedRef = useRef(false);
    const endsAtRef = useRef<number | null>(null);
    const performEndSessionRef = useRef<() => void>(() => {});
    const flatListRef = useRef<FlatList>(null);
    const { colors } = useTheme();

    // Voice recognition logic
    useSpeechRecognitionEvent('start', () => setIsRecording(true));
    useSpeechRecognitionEvent('end', () => setIsRecording(false));
    useSpeechRecognitionEvent('result', (event) => {
        const transcript = event.results[0]?.transcript;
        if (transcript) {
            setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
    });
    useSpeechRecognitionEvent('error', (event) => {
        console.error('Speech recognition error:', event.error, event.message);
        setIsRecording(false);
    });

    const handleVoiceToggle = useCallback(async () => {
        if (isRecording) {
            ExpoSpeechRecognitionModule.stop();
        } else {
            setInputText('');
            ExpoSpeechRecognitionModule.start({
                lang: 'en-US',
                interimResults: true,
            });
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
                Alert.alert("Session Concluded", "Session discarded.");
                router.replace('/(main)/home' as any);
                return;
            }

            dispatch(setSummary(result));
            dispatch(persistMessages(messages.map(m => ({ role: m.role, text: m.text }))));
            setIsNavigatingAway(true);
            router.replace('/(interview)/complete' as any);
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
        const userMsgCount = messages.filter(m => m.role === 'candidate').length;
        if (userMsgCount === 0) {
            Alert.alert(
                'End Interview?',
                'You have not submitted any answers yet. Ending now will conclude this session with a baseline evaluation.',
                [
                    { text: 'Keep Interviewing', style: 'cancel' },
                    { text: 'End & Evaluate', style: 'destructive', onPress: performEndSession },
                ]
            );
        } else {
            Alert.alert(
                'End Interview?',
                'This will conclude your interview and generate your performance summary.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'End Interview', style: 'destructive', onPress: performEndSession },
                ]
            );
        }
    }, [messages, performEndSession]);

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
