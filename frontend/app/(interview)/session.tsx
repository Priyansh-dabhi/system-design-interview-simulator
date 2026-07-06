import { useChatMutation, useEndSessionMutation } from '@/src/redux/api/interview_api';
import { setSummary } from '@/src/redux/slices/session';
import type { RootState } from '@/src/redux/store';
import { useNavigation, useRouter } from 'expo-router';
// Safe import: expo-speech-recognition requires a development build (not Expo Go)
let ExpoSpeechRecognitionModule: any = null;
let useSpeechRecognitionEvent: any = null;
try {
    const speechModule = require('expo-speech-recognition');
    ExpoSpeechRecognitionModule = speechModule.ExpoSpeechRecognitionModule;
    useSpeechRecognitionEvent = speechModule.useSpeechRecognitionEvent;
} catch {
    // Native module not available (Expo Go)
}
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    BackHandler,
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
    const topicTitle = useSelector((state: RootState) => state.problem.selectedTopic?.title) || 'System Design Interview';

    const [sendChat, { isLoading: isSending }] = useChatMutation();
    const [endSession, { isLoading: isEnding }] = useEndSessionMutation();

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isNavigatingAway, setIsNavigatingAway] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const baseTextRef = useRef('');
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

    const performEndSession = async () => {
        if (!sessionId || !problem) return;
        try {
            const result = await endSession({ sessionId, problem }).unwrap();
            dispatch(setSummary(result));
            setIsNavigatingAway(true);
            router.replace('/summary');
        } catch (err: any) {
            console.error('End session error:', err);
            Alert.alert(
                'Summary Failed',
                err?.data?.message || 'Failed to generate summary. Please try again.',
                [{ text: 'OK' }]
            );
        }
    };

    const handleEndInterview = useCallback(() => {
        Alert.alert(
            'End Interview?',
            'This will generate your performance summary. You cannot continue this session after ending.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'End Interview', style: 'destructive', onPress: performEndSession },
            ]
        );
    }, [sessionId, problem]);

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
    }, [navigation, isNavigatingAway, isEnding, sessionId, problem]);

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

    // --- Speech Recognition Hooks (only register if native module is available) ---
    const noopHook = (_event: string, _cb: Function) => {};
    const safeUseSpeechEvent = useSpeechRecognitionEvent || noopHook;

    safeUseSpeechEvent('start', () => setIsRecording(true));
    safeUseSpeechEvent('end', () => setIsRecording(false));
    safeUseSpeechEvent('result', (event: any) => {
        const transcript = event.results[0]?.transcript;
        if (transcript) {
            const baseText = baseTextRef.current;
            const separator = baseText.length > 0 && !baseText.endsWith(' ') ? ' ' : '';
            setInputText(baseText + separator + transcript);
        }
    });
    safeUseSpeechEvent('error', (event: any) => {
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
        if (!ExpoSpeechRecognitionModule) {
            Alert.alert(
                'Voice Input Unavailable',
                'Speech recognition requires a development build. Please run "npx expo prebuild" and rebuild the app.',
                [{ text: 'OK' }]
            );
            return;
        }
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


        <SafeAreaView style={styles.container} edges={['top']}>
            <ChatHeader
                topicTitle={topicTitle}
                onBack={() => router.back()}
                onEnd={handleEndInterview}
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
                    isSending={isSending}
                    isRecording={isRecording}
                />
            </KeyboardAvoidingView>

            {isEnding && <LoadingOverlay />}
        </SafeAreaView>
    );
}

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
