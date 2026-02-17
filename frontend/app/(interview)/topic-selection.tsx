import { useRouter } from 'expo-router';
import { ArrowLeftIcon, ChatCircleDotsIcon, CheckIcon, FilmReelIcon, LinkIcon, MapPinIcon } from 'phosphor-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/Colors';
import { Layout } from '../../src/constants/Layout';

interface Topic {
    id: string;
    title: string;
    description: string;
    type: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    accentColor: string;
    icon: React.ReactNode;
}

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

const DIFFICULTY_COLORS = {
    Easy: '#10B981',
    Medium: '#F59E0B',
    Hard: '#EF4444',
};

export default function TopicSelectionScreen() {
    const router = useRouter();
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

    const handleTopicPress = (topic: Topic) => {
        // Toggle selection
        setSelectedTopic(selectedTopic === topic.id ? null : topic.id);
        console.log('Selected topic:', topic.id);
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
                {TOPICS.map((topic) => {
                    const isSelected = selectedTopic === topic.id;
                    return (
                        <TouchableOpacity
                            key={topic.id}
                            style={[
                                styles.topicCard,
                                isSelected && styles.topicCardSelected,
                            ]}
                            activeOpacity={0.7}
                            onPress={() => handleTopicPress(topic)}
                        >
                            {/* Icon */}
                            <View style={[styles.topicIconContainer, { backgroundColor: topic.accentColor + '15' }]}>
                                {topic.icon}
                            </View>

                            {/* Content */}
                            <View style={styles.topicContent}>
                                <View style={styles.topicHeader}>
                                    <Text style={styles.topicTitle}>{topic.title}</Text>
                                </View>

                                {/* Description - Centered */}
                                <Text style={styles.topicDescription} numberOfLines={2} ellipsizeMode="tail">{topic.description}</Text>

                                {/* Metadata: Type and Difficulty */}
                                <View style={styles.metadataRow}>
                                    <View style={styles.typeBadge}>
                                        <Text style={styles.typeText}>{topic.type}</Text>
                                    </View>
                                    {/* <Text style={styles.metadataDot}>•</Text> */}
                                    <View style={[styles.difficultyBadge, { backgroundColor: DIFFICULTY_COLORS[topic.difficulty] + '20' }]}>
                                        <Text style={[styles.difficultyText, { color: DIFFICULTY_COLORS[topic.difficulty] }]}>
                                            {topic.difficulty}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Checkbox */}
                            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                {isSelected && <CheckIcon size={16} color="#FFFFFF" weight="bold" />}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Start Interview Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.startButton, !selectedTopic && styles.startButtonDisabled]}
                    activeOpacity={0.8}
                    onPress={() => {
                        if (selectedTopic) {
                            const topic = TOPICS.find(t => t.id === selectedTopic);
                            router.push({
                                pathname: '/(interview)/session' as any,
                                params: {
                                    topicId: selectedTopic,
                                    topicTitle: topic?.title || 'System Design Interview'
                                }
                            });
                        }
                    }}
                    disabled={!selectedTopic}
                >
                    <Text style={[styles.startButtonText, !selectedTopic && styles.startButtonTextDisabled]}>
                        Start Interview
                    </Text>
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
    topicCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: Colors.surface,
        padding: Layout.spacing.lg,
        borderRadius: Layout.borderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: Layout.spacing.md,
        position: 'relative',
    },
    topicCardSelected: {
        borderColor: Colors.primaryBrand,
        backgroundColor: Colors.surfaceHighlight,
    },
    topicIconContainer: {
        width: 48,
        height: 48,
        borderRadius: Layout.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    topicContent: {
        flex: 1,
        gap: 8,
    },
    topicHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    topicTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    metadataRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        backgroundColor: Colors.surfaceHighlight,
    },
    typeText: {
        fontSize: 11,
        fontWeight: '500',
        color: Colors.textSecondary,
    },
    metadataDot: {
        fontSize: 10,
        color: Colors.textSecondary,
    },
    difficultyBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
    },
    difficultyText: {
        fontSize: 11,
        fontWeight: '600',
    },
    topicDescription: {
        fontSize: 13,
        color: Colors.textSecondary,
        lineHeight: 18,
        textAlign: 'center',
    },
    checkbox: {
        position: 'absolute',
        top: Layout.spacing.md,
        right: Layout.spacing.md,
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    checkboxSelected: {
        backgroundColor: Colors.primaryBrand,
        borderColor: Colors.primaryBrand,
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
