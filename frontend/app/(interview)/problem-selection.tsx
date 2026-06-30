import { useStartSessionMutation } from '@/src/redux/api/interview_api';
import { clearSelectedTopic, setSelectedTopic } from '@/src/redux/slices/problem';
import { setSession } from '@/src/redux/slices/session';
import type { RootState } from '@/src/redux/store';
import { useRouter } from 'expo-router';
import { ArrowLeftIcon, ChatCircleDotsIcon, FilmReelIcon, LinkIcon, MapPinIcon } from 'phosphor-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { TopicCard, Topic } from '../../src/components/interview/TopicCard';
import { Colors } from '../../src/constants/Colors';
import { Layout } from '../../src/constants/Layout';

const TOPICS: Topic[] = [
    {
        id: 'whatsapp',
        title: 'Design WhatsApp',
        description: 'Real-time messaging architecture, websocket handling, and message persistence.',
        type: 'Distributed Systems',
        difficulty: 'Medium',
        accentColor: '#25D366',
        icon: <ChatCircleDotsIcon size={24} color="#25D366" weight="fill" />,
    },
    {
        id: 'netflix',
        title: 'Design Netflix',
        description: 'Video streaming optimization, CDN architecture, and adaptive bitrate streaming.',
        type: 'Streaming',
        difficulty: 'Hard',
        accentColor: '#E50914',
        icon: <FilmReelIcon size={24} color="#E50914" weight="fill" />,
    },
    {
        id: 'uber',
        title: 'Design Uber',
        description: 'Geospatial indexing, quadtrees, driver matching algorithms, and real-time location.',
        type: 'Geospatial',
        difficulty: 'Hard',
        accentColor: '#276EF1',
        icon: <MapPinIcon size={24} color="#276EF1" weight="fill" />,
    },
    {
        id: 'tinyurl',
        title: 'Design TinyURL',
        description: 'URL shortening service, redirection logic, database scaling, and encoding.',
        type: 'Database',
        difficulty: 'Easy',
        accentColor: '#F59E0B',
        icon: <LinkIcon size={24} color="#F59E0B" weight="fill" />,
    },
];

export default function TopicSelectionScreen() {
    const dispatch = useDispatch();
    const selectedTopic = useSelector((state: RootState) => state.problem.selectedTopic);
    const router = useRouter();
    const [startSession, { isLoading }] = useStartSessionMutation();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const handleCardPress = (topic: Topic) => {
        setExpandedId(prev => (prev === topic.id ? null : topic.id));
    };

    const handleTopicSelect = (topic: Topic) => {
        try {
            if (selectedTopic?.id === topic.id) {
                dispatch(clearSelectedTopic());
            } else {
                dispatch(setSelectedTopic({ id: topic.id, title: topic.title }));
            }
        } catch (err) { }
        console.log('Selected topic:', topic.id);
    };

    const handleStartInterview = async () => {
        if (!selectedTopic?.title) return;
        try {
            const result = await startSession(selectedTopic.title).unwrap();
            dispatch(setSession({
                sessionId: result.sessionId,
                openingMessage: result.message,
                problem: selectedTopic.title,
            }));
            router.push('/session');
        } catch (err: any) {
            console.error('Start session error:', err);
            Alert.alert(
                'Failed to Start Interview',
                err?.data?.message || 'Something went wrong. Please try again.',
                [{ text: 'OK' }]
            );
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeftIcon size={24} color={Colors.text} />
                </TouchableOpacity>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Choose a System{'\n'}Design Problem</Text>
                    <Text style={styles.headerSubtitle}>Select a topic to begin your mock interview</Text>
                </View>
            </View>

            {/* Topic Cards */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {TOPICS.map((topic) => (
                    <TopicCard
                        key={topic.id}
                        topic={topic}
                        isSelected={selectedTopic?.id === topic.id}
                        isExpanded={expandedId === topic.id}
                        onPress={handleCardPress}
                        onSelect={handleTopicSelect}
                    />
                ))}
            </ScrollView>

            {/* Start Interview Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.startButton, (!selectedTopic || isLoading) && styles.startButtonDisabled]}
                    activeOpacity={0.8}
                    onPress={handleStartInterview}
                    disabled={!selectedTopic || isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Text style={[styles.startButtonText, !selectedTopic && styles.startButtonTextDisabled]}>
                            Start Interview
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        paddingHorizontal: Layout.spacing.lg,
        paddingTop: Layout.spacing.md,
        paddingBottom: Layout.spacing.xl,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Layout.spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    headerTextContainer: {
        gap: Layout.spacing.sm,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.text,
        lineHeight: 36,
    },
    headerSubtitle: {
        fontSize: 15,
        color: Colors.textSecondary,
        lineHeight: 22,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: Layout.spacing.lg,
        paddingBottom: Layout.spacing.md,
        gap: Layout.spacing.md,
    },
    buttonContainer: {
        paddingHorizontal: Layout.spacing.lg,
        paddingVertical: Layout.spacing.md,
        paddingBottom: Layout.spacing.lg,
        backgroundColor: Colors.background,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    startButton: {
        height: 56,
        backgroundColor: Colors.primaryBrand,
        borderRadius: Layout.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primaryBrand,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    startButtonDisabled: {
        backgroundColor: Colors.surfaceHighlight,
        shadowOpacity: 0,
        elevation: 0,
    },
    startButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    startButtonTextDisabled: {
        color: Colors.textSecondary,
    },
});
