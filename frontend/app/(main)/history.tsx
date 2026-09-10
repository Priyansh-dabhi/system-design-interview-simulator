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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>History</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          All your past interviews and technical growth
        </Text>
      </View>

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
          {/* Quick Metrics Bar */}
          <View style={styles.metricsRow}>
            <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.metricNumber, { color: colors.text }]}>{stats?.total ?? history.length}</Text>
              <Text style={[styles.metricLabel, { color: colors.textDim }]}>Total</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.metricNumber, { color: '#10B981' }]}>
                {stats?.strong ?? history.filter((h) => h.score === 'good').length}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textDim }]}>Strong</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.metricNumber, { color: '#F59E0B' }]}>
                {stats?.average ?? history.filter((h) => h.score === 'average').length}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textDim }]}>Average</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.metricNumber, { color: '#EF4444' }]}>
                {stats?.needsImprovement ?? history.filter((h) => h.score === 'needs_improvement').length}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textDim }]}>Needs Work</Text>
            </View>
          </View>

          {/* Recent Interviews List */}
          <View style={styles.listSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Interviews</Text>
            <View style={styles.cardsContainer}>
              {history.map((item) => (
                <InterviewCard key={item.id} item={item} />
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
    gap: 18,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  metricNumber: {
    fontSize: 17,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  listSection: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  cardsContainer: {
    gap: 10,
  },
});
