import React, { useCallback, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../src/components/history/EmptyState';
import { InterviewCard } from '../../src/components/history/InterviewCard';
import { useTheme } from '../../src/theme/useTheme';
import { Layout } from '../../src/constants/Layout';
import { useGetHistoryQuery } from '../../src/redux/api/interview_api';
import { ScoreChart } from '../../src/components/history/ScoreChart';
import { TopicMasteryCard } from '../../src/components/history/TopicMasteryCard';
import { CaretDown, CaretUp } from 'phosphor-react-native';
import { Typography } from '../../src/components/ui/Typography';
import { Card } from '../../src/components/ui/Card';

export default function HistoryScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const [analyticsExpanded, setAnalyticsExpanded] = useState(false);
    const { data, isFetching, refetch } = useGetHistoryQuery();
    const history = data?.history ?? [];
    const stats = data?.stats;
    const { colors } = useTheme();

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        refetch().finally(() => setRefreshing(false));
    }, [refetch]);

    const styles = React.useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            paddingHorizontal: Layout.spacing.lg,
            paddingTop: Layout.spacing.xl,
            paddingBottom: Layout.spacing.md,
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            padding: Layout.spacing.lg,
            paddingBottom: 120,
        },
        statsRow: {
            flexDirection: 'row',
            gap: Layout.spacing.sm,
            marginBottom: Layout.spacing.xl,
        },
        statCard: {
            flex: 1,
            alignItems: 'center',
            paddingVertical: Layout.spacing.md,
        },
        sectionHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: Layout.spacing.md,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: colors.border,
            marginBottom: Layout.spacing.md,
        },
        cardsContainer: {
            gap: Layout.spacing.md,
        },
    }), [colors]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Typography variant="h1" weight="bold">History</Typography>
                <Typography variant="body2" color="textSecondary" style={{ marginTop: 4 }}>
                    Review your past performance and technical growth
                </Typography>
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
                            tintColor={colors.primary}
                            colors={[colors.primary]}
                            progressBackgroundColor={colors.surface}
                        />
                    }
                >
                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <Card variant="elevated" style={styles.statCard}>
                            <Typography variant="h3" weight="bold" color="text">{stats?.total ?? history.length}</Typography>
                            <Typography variant="caption" color="textSecondary" style={{ marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total</Typography>
                        </Card>
                        <Card variant="elevated" style={styles.statCard}>
                            <Typography variant="h3" weight="bold" style={{ color: '#10B981' }}>{stats?.strong ?? history.filter((h) => h.score === 'good').length}</Typography>
                            <Typography variant="caption" color="textSecondary" style={{ marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>Strong</Typography>
                        </Card>
                        <Card variant="elevated" style={styles.statCard}>
                            <Typography variant="h3" weight="bold" style={{ color: '#F59E0B' }}>{stats?.average ?? history.filter((h) => h.score === 'average').length}</Typography>
                            <Typography variant="caption" color="textSecondary" style={{ marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>Average</Typography>
                        </Card>
                        <Card variant="elevated" style={styles.statCard}>
                            <Typography variant="h3" weight="bold" style={{ color: '#EF4444' }}>{stats?.needsImprovement ?? history.filter((h) => h.score === 'needs_improvement').length}</Typography>
                            <Typography variant="caption" color="textSecondary" style={{ marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>Needs Work</Typography>
                        </Card>
                    </View>

                    {/* Analytics Section */}
                    {stats?.scoreOverTime && stats.scoreOverTime.length > 0 && (
                        <View style={{ marginBottom: Layout.spacing.xl }}>
                            <TouchableOpacity 
                                style={styles.sectionHeader} 
                                activeOpacity={0.7}
                                onPress={() => setAnalyticsExpanded(!analyticsExpanded)}
                            >
                                <Typography variant="h3" weight="semibold">Deep Analytics</Typography>
                                {analyticsExpanded ? (
                                    <CaretUp size={20} color={colors.textSecondary} />
                                ) : (
                                    <CaretDown size={20} color={colors.textSecondary} />
                                )}
                            </TouchableOpacity>
                            {analyticsExpanded && (
                                <View style={{ gap: Layout.spacing.md, marginTop: Layout.spacing.sm }}>
                                    <ScoreChart data={stats.scoreOverTime} />
                                    <TopicMasteryCard data={stats.topicMastery || []} />
                                </View>
                            )}
                        </View>
                    )}

                    {/* Interview Cards */}
                    <Typography variant="h3" weight="semibold" style={{ marginBottom: Layout.spacing.md }}>Recent Interviews</Typography>
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
