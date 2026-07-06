import React, { useCallback, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../src/components/history/EmptyState';
import { InterviewCard } from '../../src/components/history/InterviewCard';
import { useTheme } from '../../src/theme/useTheme';
import { Layout } from '../../src/constants/Layout';
import { useGetHistoryQuery } from '../../src/redux/api/interview_api';

export default function HistoryScreen() {
    const [refreshing, setRefreshing] = useState(false);
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
            paddingTop: Layout.spacing.md,
            paddingBottom: Layout.spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        headerTitle: {
            fontSize: 26,
            fontWeight: '700',
            color: colors.text,
        },
        headerSubtitle: {
            fontSize: 14,
            color: colors.textSecondary,
            marginTop: 4,
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
            marginBottom: Layout.spacing.lg,
        },
        statCard: {
            flex: 1,
            backgroundColor: colors.surface,
            borderRadius: Layout.borderRadius.md,
            borderWidth: 1,
            borderColor: colors.border,
            paddingVertical: Layout.spacing.md,
            alignItems: 'center',
        },
        statValue: {
            fontSize: 22,
            fontWeight: '700',
            color: colors.text,
        },
        statLabel: {
            fontSize: 11,
            fontWeight: '500',
            color: colors.textSecondary,
            marginTop: 2,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            textAlign: 'center',
        },
        cardsContainer: {
            gap: Layout.spacing.md,
        },
    }), [colors]);

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
                            tintColor={colors.primaryBrand}
                            colors={[colors.primaryBrand]}
                            progressBackgroundColor={colors.surface}
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
