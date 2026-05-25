import {
    ArrowDownIcon,
    ArrowUpIcon,
    CheckCircleIcon,
    ClockCounterClockwiseIcon,
    LightbulbIcon,
    WarningCircleIcon,
} from 'phosphor-react-native';
import React, { useCallback, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/Colors';
import { Layout } from '../../src/constants/Layout';
import { useGetHistoryQuery } from '../../src/redux/api/interview_api';
import { InterviewHistoryItem } from '../../src/types/types';

const formatInterviewDate = (value: string) =>
    new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(value));

// Score config
const scoreConfig = {
    good: { label: 'Strong', color: '#10B981', bg: '#10B98118' },
    average: { label: 'Average', color: '#F59E0B', bg: '#F59E0B18' },
    needs_improvement: { label: 'Needs Work', color: '#EF4444', bg: '#EF444418' },
};

// ─── Expandable Card ───────────────────────────────────────────────────────────

function InterviewCard({ item }: { item: InterviewHistoryItem }) {
    const [expanded, setExpanded] = useState(false);
    const config = scoreConfig[item.score];

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setExpanded(!expanded)}
            style={styles.card}
        >
            {/* Card Header */}
            <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                    <View style={[styles.topicIcon, { backgroundColor: config.bg }]}>
                        <ClockCounterClockwiseIcon size={18} color={config.color} />
                    </View>
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardTopic}>{item.topic}</Text>
                        <Text style={styles.cardDate}>{formatInterviewDate(item.date)}</Text>
                    </View>
                </View>
                <View style={styles.cardHeaderRight}>
                    <View style={[styles.scoreBadge, { backgroundColor: config.bg }]}>
                        <Text style={[styles.scoreBadgeText, { color: config.color }]}>
                            {config.label}
                        </Text>
                    </View>
                    {expanded ? (
                        <ArrowUpIcon size={16} color={Colors.textSecondary} />
                    ) : (
                        <ArrowDownIcon size={16} color={Colors.textSecondary} />
                    )}
                </View>
            </View>

            {/* Expandable Review Content */}
            {expanded && (
                <View style={styles.reviewContent}>
                    {/* Strengths */}
                    <View style={styles.reviewSection}>
                        <View style={styles.reviewSectionHeader}>
                            <View style={[styles.reviewIconContainer, { backgroundColor: '#10B98120' }]}>
                                <CheckCircleIcon size={16} color="#10B981" weight="fill" />
                            </View>
                            <Text style={styles.reviewSectionTitle}>Strengths</Text>
                        </View>
                        {item.summary.strengths.map((text, i) => (
                            <View key={`s-${i}`} style={[styles.bulletCard, styles.strengthBullet]}>
                                <View style={[styles.bulletDot, { backgroundColor: '#10B981' }]} />
                                <Text style={styles.bulletText}>{text}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Missed Topics */}
                    <View style={styles.reviewSection}>
                        <View style={styles.reviewSectionHeader}>
                            <View style={[styles.reviewIconContainer, { backgroundColor: '#F59E0B20' }]}>
                                <WarningCircleIcon size={16} color="#F59E0B" weight="fill" />
                            </View>
                            <Text style={styles.reviewSectionTitle}>Missed Topics</Text>
                        </View>
                        {item.summary.missed_topics.map((text, i) => (
                            <View key={`m-${i}`} style={[styles.bulletCard, styles.missedBullet]}>
                                <View style={[styles.bulletDot, { backgroundColor: '#F59E0B' }]} />
                                <Text style={styles.bulletText}>{text}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Suggestions */}
                    <View style={styles.reviewSection}>
                        <View style={styles.reviewSectionHeader}>
                            <View style={[styles.reviewIconContainer, { backgroundColor: '#3B82F620' }]}>
                                <LightbulbIcon size={16} color="#3B82F6" weight="fill" />
                            </View>
                            <Text style={styles.reviewSectionTitle}>Suggestions</Text>
                        </View>
                        {item.summary.suggestions.map((text, i) => (
                            <View key={`sg-${i}`} style={[styles.bulletCard, styles.suggestionBullet]}>
                                <View style={[styles.bulletDot, { backgroundColor: '#3B82F6' }]} />
                                <Text style={styles.bulletText}>{text}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </TouchableOpacity>
    );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState() {
    return (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
                <ClockCounterClockwiseIcon size={40} color={Colors.textDim} />
            </View>
            <Text style={styles.emptyTitle}>No Interviews Yet</Text>
            <Text style={styles.emptySubtitle}>
                Complete your first mock interview to see your history and performance reviews here.
            </Text>
        </View>
    );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function HistoryScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const { data, isFetching, refetch } = useGetHistoryQuery();
    const history = data?.history ?? [];
    const stats = data?.stats;

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        // Simulate network request — replace with actual API call
        refetch().finally(() => setRefreshing(false));
    }, [refetch]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Interview History</Text>
                <Text style={styles.headerSubtitle}>
                    Review your past performance and technical growth
                </Text>
            </View>

            {/* Content */}
            {history.length === 0 ? (
                <EmptyState />
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing || isFetching}
                            onRefresh={onRefresh}
                            tintColor={Colors.primaryBrand}
                            colors={[Colors.primaryBrand]}
                            progressBackgroundColor={Colors.surface}
                        />
                    }
                >
                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{stats?.total ?? history.length}</Text>
                            <Text style={styles.statLabel}>Total</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={[styles.statValue, { color: '#10B981' }]}>
                                {stats?.strong ?? history.filter((h) => h.score === 'good').length}
                            </Text>
                            <Text style={styles.statLabel}>Strong</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={[styles.statValue, { color: '#F59E0B' }]}>
                                {stats?.average ?? history.filter((h) => h.score === 'average').length}
                            </Text>
                            <Text style={styles.statLabel}>Average</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={[styles.statValue, { color: '#EF4444' }]}>
                                {stats?.needsImprovement ?? history.filter((h) => h.score === 'needs_improvement').length}
                            </Text>
                            <Text style={styles.statLabel}>Needs Work</Text>
                        </View>
                    </View>

                    {/* Interview Cards */}
                    <View style={styles.cardsContainer}>
                        {history.map((item) => (
                            <InterviewCard key={item.id} item={item} />
                        ))}
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    // Header
    header: {
        paddingHorizontal: Layout.spacing.lg,
        paddingTop: Layout.spacing.md,
        paddingBottom: Layout.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '700',
        color: Colors.text,
    },
    headerSubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 4,
    },

    // Scroll
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Layout.spacing.lg,
        paddingBottom: 120,
    },

    // Stats Row
    statsRow: {
        flexDirection: 'row',
        gap: Layout.spacing.sm,
        marginBottom: Layout.spacing.lg,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: Layout.borderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingVertical: Layout.spacing.md,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.text,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '500',
        color: Colors.textSecondary,
        marginTop: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        textAlign: 'center',
    },

    // Cards
    cardsContainer: {
        gap: Layout.spacing.md,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: Layout.borderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Layout.spacing.md,
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    topicIcon: {
        width: 38,
        height: 38,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Layout.spacing.sm + 4,
    },
    cardInfo: {
        flex: 1,
    },
    cardTopic: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    cardDate: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    cardHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Layout.spacing.sm,
    },
    scoreBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: Layout.borderRadius.full,
    },
    scoreBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.3,
    },

    // Review Content (expanded)
    reviewContent: {
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingHorizontal: Layout.spacing.md,
        paddingVertical: Layout.spacing.md,
        gap: Layout.spacing.lg,
    },
    reviewSection: {
        gap: Layout.spacing.sm,
    },
    reviewSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Layout.spacing.sm,
        marginBottom: 2,
    },
    reviewIconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    reviewSectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
    },
    bulletCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: Colors.background,
        paddingHorizontal: Layout.spacing.sm + 4,
        paddingVertical: Layout.spacing.sm + 2,
        borderRadius: Layout.borderRadius.sm + 2,
        borderWidth: 1,
        gap: Layout.spacing.sm,
    },
    strengthBullet: {
        borderColor: '#10B98125',
    },
    missedBullet: {
        borderColor: '#F59E0B25',
    },
    suggestionBullet: {
        borderColor: '#3B82F625',
    },
    bulletDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 6,
    },
    bulletText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 19,
        color: Colors.textSecondary,
    },

    // Empty State
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Layout.spacing.xl,
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Layout.spacing.lg,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Layout.spacing.sm,
    },
    emptySubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 21,
    },
});
