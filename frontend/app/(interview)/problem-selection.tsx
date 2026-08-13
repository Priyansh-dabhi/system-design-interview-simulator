import { useStartSessionMutation } from '@/src/redux/api/interview_api';
import { clearSelectedTopic, setSelectedTopic, setDuration } from '@/src/redux/slices/problem';
import { setSession } from '@/src/redux/slices/session';
import type { RootState } from '@/src/redux/store';
import { useRouter } from 'expo-router';
import { ArrowLeftIcon, ChatCircleDotsIcon, ClockIcon, FilmReelIcon, LinkIcon, MapPinIcon } from 'phosphor-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { TopicCard, Topic } from '../../src/components/interview/TopicCard';
import { SegmentedControl, SegmentedControlOption } from '../../src/components/ui/SegmentedControl';
import { useTheme } from '../../src/theme/useTheme';
import { Layout } from '../../src/constants/Layout';

const DURATION_OPTIONS: SegmentedControlOption<number>[] = [
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '45 min', value: 45 },
    { label: '60 min', value: 60 },
];

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
    const durationMinutes = useSelector((state: RootState) => state.problem.durationMinutes);
    const router = useRouter();
    const [startSession, { isLoading }] = useStartSessionMutation();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const { colors } = useTheme();

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
        } catch { }
        console.log('Selected topic:', topic.id);
    };

    const handleStartInterview = async () => {
        if (!selectedTopic?.title) return;
        try {
            const result = await startSession({ problem: selectedTopic.title, durationMinutes }).unwrap();
            dispatch(setSession({
                sessionId: result.sessionId,
                openingMessage: result.message,
                problem: selectedTopic.title,
                durationMinutes,
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

const styles = React.useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
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
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: Layout.spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
        },
        headerTextContainer: {
            gap: Layout.spacing.sm,
        },
        headerTitle: {
            fontSize: 28,
            fontWeight: 'bold',
            color: colors.text,
            lineHeight: 36,
        },
        headerSubtitle: {
            fontSize: 15,
            color: colors.textSecondary,
            lineHeight: 22,
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            paddingHorizontal: Layout.spacing.lg,
            paddingBottom: Layout.spacing.xl,
            gap: Layout.spacing.md,
        },
        buttonContainer: {
            paddingHorizontal: Layout.spacing.lg,
            paddingVertical: Layout.spacing.md,
            paddingBottom: Layout.spacing.lg,
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
        durationCard: {
            marginBottom: Layout.spacing.lg,
            padding: Layout.spacing.md,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: Layout.borderRadius.lg,
            gap: Layout.spacing.md,
        },
        durationHeading: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Layout.spacing.sm,
        },
        durationIcon: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.primaryBrand + '18',
            alignItems: 'center',
            justifyContent: 'center',
        },
        durationCopy: {
            flex: 1,
        },
        durationLabel: {
            fontSize: 16,
            fontWeight: '700',
            color: colors.text,
        },
        durationHint: {
            marginTop: 2,
            fontSize: 13,
            color: colors.textSecondary,
        },
        startButton: {
            height: 56,
            backgroundColor: colors.primaryBrand,
            borderRadius: Layout.borderRadius.md,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: colors.primaryBrand,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
        },
        startButtonDisabled: {
            backgroundColor: colors.surfaceHighlight,
            shadowOpacity: 0,
            elevation: 0,
        },
        startButtonText: {
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '600',
        },
        startButtonTextDisabled: {
            color: colors.textSecondary,
        },
    }), [colors]);

  return (


          <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeftIcon size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Choose a System{'\n'}Design Problem</Text>
                    <Text style={styles.headerSubtitle}>Select a topic to begin your mock interview</Text>
                </View>
            </View>

            {/* Interview setup and topic cards share one scroll area. */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.durationCard}>
                    <View style={styles.durationHeading}>
                        <View style={styles.durationIcon}>
                            <ClockIcon size={19} color={colors.primaryBrand} weight="fill" />
                        </View>
                        <View style={styles.durationCopy}>
                            <Text style={styles.durationLabel}>Interview duration</Text>
                            <Text style={styles.durationHint}>Choose a pace that fits your practice time</Text>
                        </View>
                    </View>
                    <SegmentedControl
                        options={DURATION_OPTIONS}
                        value={durationMinutes}
                        onChange={(value) => dispatch(setDuration(value))}
                    />
                </View>
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
