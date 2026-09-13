import { setSelectedTopic } from '@/src/redux/slices/problem';
import { useRouter } from 'expo-router';
import { CaretRight, Clock } from 'phosphor-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../src/theme/useTheme';

type Difficulty = 'All' | 'Beginner' | 'Intermediate' | 'Advanced';

interface ProblemItem {
  id: string;
  title: string;
  subtitle: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number;
  topics: string[];
  attempts?: number;
  bestScore?: number;
}

const PROBLEMS: ProblemItem[] = [
  {
    id: 'whatsapp',
    title: 'Design WhatsApp',
    subtitle: 'Real-time messaging, websockets, and message persistence.',
    difficulty: 'Advanced',
    duration: 45,
    topics: ['WebSockets', 'Message Queues', 'Cassandra', 'E2EE'],
    attempts: 4,
    bestScore: 82,
  },
  {
    id: 'netflix',
    title: 'Design Netflix',
    subtitle: 'Video streaming optimization, CDN architecture, and adaptive bitrate.',
    difficulty: 'Advanced',
    duration: 45,
    topics: ['Video Transcoding', 'CDN', 'Adaptive Bitrate', 'Cassandra'],
    attempts: 1,
  },
  {
    id: 'uber',
    title: 'Design Uber',
    subtitle: 'Geospatial indexing, driver matching algorithms, and real-time location.',
    difficulty: 'Advanced',
    duration: 45,
    topics: ['Geohash', 'WebSockets', 'Redis', 'Matching Algo'],
    attempts: 2,
    bestScore: 78,
  },
  {
    id: 'tinyurl',
    title: 'Design URL Shortener (TinyURL)',
    subtitle: 'URL shortening service, redirection logic, and base-62 encoding.',
    difficulty: 'Beginner',
    duration: 30,
    topics: ['Base62 Encoding', 'Hashing', 'Redis Caching', 'Rate Limiting'],
    attempts: 3,
    bestScore: 91,
  },
  {
    id: 'instagram',
    title: 'Design Instagram',
    subtitle: 'Photo sharing feed architecture, fan-out on write, and timeline ranking.',
    difficulty: 'Intermediate',
    duration: 35,
    topics: ['Fan-out', 'Feed Ranking', 'S3 Storage', 'Cache Invalidation'],
    attempts: 0,
  },
  {
    id: 'twitter',
    title: 'Design Twitter / X',
    subtitle: 'High-throughput tweet ingestion, follower graph, and timeline generation.',
    difficulty: 'Intermediate',
    duration: 35,
    topics: ['Timeline Service', 'Redis Clusters', 'Fan-out on Read', 'Graph DB'],
    attempts: 0,
  },
];

export default function PracticeScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const [filter, setFilter] = useState<Difficulty>('All');

  const filters: Difficulty[] = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredProblems = filter === 'All'
    ? PROBLEMS
    : PROBLEMS.filter((p) => p.difficulty === filter);

  const handleSelectProblem = (problem: ProblemItem) => {
    dispatch(setSelectedTopic({ id: problem.id, title: problem.title }));
    router.push('/(interview)/setup' as any);
  };

  const getBadgeStyle = (d: ProblemItem['difficulty']) => {
    switch (d) {
      case 'Beginner':
        return { bg: 'rgba(16, 185, 129, 0.12)', text: '#10B981' };
      case 'Intermediate':
        return { bg: 'rgba(245, 158, 11, 0.12)', text: '#F59E0B' };
      case 'Advanced':
        return { bg: 'rgba(239, 68, 68, 0.12)', text: '#EF4444' };
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Interviews</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Choose a system design problem to solve
        </Text>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {filters.map((f) => {
            const active = filter === f;
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={[
                  styles.filterChip,
                  active
                    ? { backgroundColor: colors.primary }
                    : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    active ? { color: '#FFFFFF', fontWeight: '700' } : { color: colors.textSecondary },
                  ]}
                >
                  {f}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Problem Cards List */}
      <ScrollView
        style={styles.scrollList}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredProblems.map((p) => {
          const badge = getBadgeStyle(p.difficulty);
          return (
            <Pressable
              key={p.id}
              onPress={() => handleSelectProblem(p)}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: pressed ? 0.92 : 1,
                  transform: [{ scale: pressed ? 0.99 : 1 }],
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Text style={[styles.problemTitle, { color: colors.text }]}>{p.title}</Text>
                  <Text style={[styles.problemSubtitle, { color: colors.textSecondary }]}>
                    {p.subtitle}
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.badgeText, { color: badge.text }]}>{p.difficulty}</Text>
                </View>
              </View>

              {/* Topic Tags */}
              <View style={styles.topicsRow}>
                {p.topics.map((t) => (
                  <View
                    key={t}
                    style={[styles.topicTag, { backgroundColor: colors.background, borderColor: colors.border }]}
                  >
                    <Text style={[styles.topicTagText, { color: colors.textSecondary }]}>{t}</Text>
                  </View>
                ))}
              </View>

              {/* Card Footer */}
              <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                <View style={styles.footerLeft}>
                  <View style={styles.durationRow}>
                    <Clock size={13} color={colors.textDim} />
                    <Text style={[styles.footerText, { color: colors.textDim }]}>{p.duration} min</Text>
                  </View>
                  {p.attempts && p.attempts > 0 ? (
                    <Text style={[styles.footerText, { color: colors.textDim }]}>
                      {p.attempts} attempt{p.attempts !== 1 ? 's' : ''}
                    </Text>
                  ) : null}
                </View>

                {p.bestScore ? (
                  <View style={styles.bestScoreRow}>
                    <Text style={[styles.bestScoreLabel, { color: colors.textDim }]}>Best</Text>
                    <Text
                      style={[
                        styles.bestScoreValue,
                        { color: p.bestScore >= 80 ? '#10B981' : '#F59E0B' },
                      ]}
                    >
                      {p.bestScore}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.newRow}>
                    <Text style={[styles.newText, { color: colors.primary }]}>Start Setup</Text>
                    <CaretRight size={13} color={colors.primary} />
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
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
  filterRow: {
    gap: 8,
    marginTop: 14,
    paddingRight: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 12,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  problemTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  problemSubtitle: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  topicsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  topicTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  topicTagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
  },
  bestScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bestScoreLabel: {
    fontSize: 11,
  },
  bestScoreValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  newRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  newText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
