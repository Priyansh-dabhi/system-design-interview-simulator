import { clearSelectedTopic, setSelectedTopic } from '@/src/redux/slices/problem';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChatCircleDots, FilmReel, Link as LinkIcon, MapPin } from 'phosphor-react-native';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { TopicCard, Topic } from '../../src/components/interview/TopicCard';
import { Typography } from '../../src/components/ui/Typography';
import { useTheme } from '../../src/theme/useTheme';
import { Layout } from '../../src/constants/Layout';

const TOPICS: Topic[] = [
    {
        id: 'whatsapp',
        title: 'Design WhatsApp',
        description: 'Real-time messaging architecture, websocket handling, and message persistence.',
        type: 'Distributed Systems',
        difficulty: 'Medium',
        accentColor: '#25D366',
        icon: <ChatCircleDots size={24} color="#25D366" weight="fill" />,
    },
    {
        id: 'netflix',
        title: 'Design Netflix',
        description: 'Video streaming optimization, CDN architecture, and adaptive bitrate streaming.',
        type: 'Streaming',
        difficulty: 'Hard',
        accentColor: '#E50914',
        icon: <FilmReel size={24} color="#E50914" weight="fill" />,
    },
    {
        id: 'uber',
        title: 'Design Uber',
        description: 'Geospatial indexing, quadtrees, driver matching algorithms, and real-time location.',
        type: 'Geospatial',
        difficulty: 'Hard',
        accentColor: '#276EF1',
        icon: <MapPin size={24} color="#276EF1" weight="fill" />,
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
    const router = useRouter();
    const { colors } = useTheme();

    useEffect(() => {
        // Clear any previously selected topic when landing on this screen
        dispatch(clearSelectedTopic());
    }, [dispatch]);

    const handleTopicSelect = (topic: Topic) => {
        dispatch(setSelectedTopic({ id: topic.id, title: topic.title }));
        router.push('/(interview)/setup' as any);
    };

    const styles = React.useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            paddingHorizontal: Layout.spacing.lg,
            paddingTop: Layout.spacing.md,
            paddingBottom: Layout.spacing.lg,
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
            gap: Layout.spacing.xs,
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            paddingHorizontal: Layout.spacing.lg,
            paddingBottom: Layout.spacing.xl,
        },
    }), [colors]);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.headerTextContainer}>
                    <Typography variant="h2" weight="bold">Choose an Interview</Typography>
                    <Typography variant="body1" color="textSecondary">Select a system design problem to solve</Typography>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {TOPICS.map((topic) => (
                    <TopicCard
                        key={topic.id}
                        topic={topic}
                        onPress={handleTopicSelect}
                    />
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}
