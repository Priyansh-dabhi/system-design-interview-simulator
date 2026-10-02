import { useChatMutation, useDeleteSessionMutation, useEndSessionMutation, useGetHintMutation } from '@/src/redux/api/interview_api';
import { setSummary, incrementHintCount, setMessages as persistMessages, clearSession } from '@/src/redux/slices/session';
import { getMaxHints } from '../../src/utils/hints';
import type { RootState } from '@/src/redux/store';
import { defaultSettings, getStoredSettings, VoicePreferences, InterviewPreferences } from '../../src/storage/settingsStorage';
import { useNavigation, useRouter } from 'expo-router';
import {
    ExpoSpeechRecognitionModule,
    useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import * as Speech from 'expo-speech';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
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
    const [deleteSession, { isLoading: isDeleting }] = useDeleteSessionMutation();
    const [getHint, { isLoading: isHintLoading }] = useGetHintMutation();

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
    const [isNavigatingAway, setIsNavigatingAway] = useState(false);
    const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
    const [voiceSettings, setVoiceSettings] = useState<VoicePreferences>(defaultSettings.voice);
    const [interviewSettings, setInterviewSettings] = useState<InterviewPreferences>(defaultSettings.interview);
    const interviewSettingsRef = useRef<InterviewPreferences>(defaultSettings.interview);

    useEffect(() => {
        interviewSettingsRef.current = interviewSettings;
    }, [interviewSettings]);

    // Load persisted settings on mount
    useEffect(() => {
        getStoredSettings().then((s) => {
            setVoiceSettings(s.voice);
            setInterviewSettings(s.interview);
            interviewSettingsRef.current = s.interview;
        });
    }, []);

    // Stop TTS speech when component unmounts
    useEffect(() => {
        return () => {
            Speech.stop();
        };
    }, []);

    const handleToggleSpeak = useCallback((message: Message) => {
        if (speakingMessageId === message.id) {
            Speech.stop();
            setSpeakingMessageId(null);
            return;
        }

        Speech.stop();
        setSpeakingMessageId(message.id);
        Speech.speak(message.text, {
            rate: voiceSettings.speechSpeed,
            pitch: 1.0,
            onDone: () => setSpeakingMessageId((curr) => (curr === message.id ? null : curr)),
            onStopped: () => setSpeakingMessageId((curr) => (curr === message.id ? null : curr)),
            onError: () => setSpeakingMessageId((curr) => (curr === message.id ? null : curr)),
        });
    }, [speakingMessageId, voiceSettings.speechSpeed]);

    const hasEndedRef = useRef(false);
    const endsAtRef = useRef<number | null>(null);
    const performEndSessionRef = useRef<() => void>(() => {});
    const flatListRef = useRef<FlatList>(null);
    const { colors } = useTheme();

    // Auto-scroll when keyboard opens
    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';

        const showSub = Keyboard.addListener(showEvent, () => {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 60);
        });

        return () => {
            showSub.remove();
        };
    }, []);

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

    const handleDiscardSession = useCallback(async () => {
        if (!sessionId) return;
        if (hasEndedRef.current) return;
        hasEndedRef.current = true;
        Speech.stop();
        setSpeakingMessageId(null);
        try {
            await deleteSession({ sessionId }).unwrap();
        } catch (e) {
            console.error('Failed to delete session on discard:', e);
        }
        dispatch(clearSession());
        setIsNavigatingAway(true);
        Alert.alert('Session Discarded', 'Your interview session was not saved.');
        router.replace('/(main)/home' as any);
    }, [sessionId, deleteSession, dispatch, router]);

    const performEndSession = useCallback(async () => {
        if (!sessionId || !problem) return;
        if (hasEndedRef.current) return;
        hasEndedRef.current = true;
        Speech.stop();
        setSpeakingMessageId(null);
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
                if (hasEndedRef.current) return;
                const autoSave = interviewSettingsRef.current.autoSave;
                if (autoSave) {
                    performEndSessionRef.current();
                } else {
                    Alert.alert(
                        "Time's Up!",
                        'Your interview time has ended. Auto-save is turned off. Would you like to evaluate and save this session to your history, or discard it?',
                        [
                            { text: 'Discard Session', style: 'destructive', onPress: handleDiscardSession },
                            { text: 'Save & Evaluate', onPress: performEndSession },
                        ],
                        { cancelable: false }
                    );
                }
            }
        };
        tick();
        const intervalId = setInterval(tick, 1000);
        return () => clearInterval(intervalId);
    }, [durationMinutes, handleDiscardSession, performEndSession]);

    const handleEndInterview = useCallback(() => {
        const userMsgCount = messages.filter(m => m.role === 'candidate').length;
        const autoSave = interviewSettingsRef.current.autoSave;

        if (userMsgCount === 0) {
            Alert.alert(
                'End Interview?',
                'You have not submitted any answers yet. Ending now will discard this session.',
                [
                    { text: 'Keep Interviewing', style: 'cancel' },
                    { text: 'Discard Session', style: 'destructive', onPress: handleDiscardSession },
                ]
            );
            return;
        }

        if (autoSave) {
            Alert.alert(
                'End Interview?',
                'This will conclude your interview and generate your performance summary.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'End & Save', style: 'destructive', onPress: performEndSession },
                ]
            );
        } else {
            Alert.alert(
                'End Interview?',
                'Auto-save is turned off. Would you like to evaluate and save this session to your history, or discard it?',
                [
                    { text: 'Keep Interviewing', style: 'cancel' },
                    { text: 'Discard Session', style: 'destructive', onPress: handleDiscardSession },
                    { text: 'Save & Evaluate', onPress: performEndSession },
                ]
            );
        }
    }, [messages, handleDiscardSession, performEndSession]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
            if (isNavigatingAway || isEnding || isDeleting) return;
            e.preventDefault();
            const autoSave = interviewSettingsRef.current.autoSave;
            if (autoSave) {
                Alert.alert(
                    'End Interview?',
                    'This will conclude your interview and save your performance summary. You cannot continue this session after ending.',
                    [
                        { text: 'Cancel', style: 'cancel', onPress: () => { } },
                        { text: 'End & Save', style: 'destructive', onPress: () => { performEndSession(); } },
                    ]
                );
            } else {
                Alert.alert(
                    'Exit Interview?',
                    'Auto-save is turned off. Would you like to evaluate and save this session to your history, or discard it?',
                    [
                        { text: 'Stay', style: 'cancel', onPress: () => { } },
                        { text: 'Discard Session', style: 'destructive', onPress: () => { handleDiscardSession(); } },
                        { text: 'Save & Evaluate', onPress: () => { performEndSession(); } },
                    ]
                );
            }
        });
        return unsubscribe;
    }, [navigation, isNavigatingAway, isEnding, isDeleting, performEndSession, handleDiscardSession]);

    const handleSend = async () => {
        if (!inputText.trim() || !sessionId || !problem) return;
        Speech.stop();
        setSpeakingMessageId(null);

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

            // Auto-play AI response if enabled in voice settings
            if (voiceSettings.autoPlayResponses) {
                setSpeakingMessageId(aiMessage.id);
                Speech.speak(aiMessage.text, {
                    rate: voiceSettings.speechSpeed,
                    pitch: 1.0,
                    onDone: () => setSpeakingMessageId((curr) => (curr === aiMessage.id ? null : curr)),
                    onStopped: () => setSpeakingMessageId((curr) => (curr === aiMessage.id ? null : curr)),
                    onError: () => setSpeakingMessageId((curr) => (curr === aiMessage.id ? null : curr)),
                });
            }
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
        if (!interviewSettings.showHints || !sessionId || isHintLoading) return;

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
        Speech.stop();
        setSpeakingMessageId(null);
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
                    renderItem={({ item }) => (
                        <MessageBubble
                            item={item}
                            isSpeaking={speakingMessageId === item.id}
                            onToggleSpeak={handleToggleSpeak}
                        />
                    )}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
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
                    showHints={interviewSettings.showHints}
                    disabled={remainingSeconds !== null && remainingSeconds <= 0}
                />
            </KeyboardAvoidingView>

            {(isEnding || isDeleting) && <LoadingOverlay />}
        </SafeAreaView>
    );
}
