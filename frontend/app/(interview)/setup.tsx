import { useStartSessionMutation } from '@/src/redux/api/interview_api';
import { setDifficulty, setDuration } from '@/src/redux/slices/problem';
import { clearSession, setSession } from '@/src/redux/slices/session';
import type { RootState } from '@/src/redux/store';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check } from 'phosphor-react-native';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../src/theme/useTheme';
import { getSafeBottomInset } from '../../src/utils/safeArea';

const DURATIONS = [15, 30, 45, 60];
const DIFFICULTIES: ('junior' | 'mid' | 'senior')[] = ['junior', 'mid', 'senior'];

const EVALUATION_CRITERIA = [
  'Requirements Gathering & Scope',
  'High-Level Architecture Design',
  'Data Storage & Scalability Bottlenecks',
  'Trade-off & Failure Mode Analysis',
  'Clear Technical Communication',
];

export default function SetupScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const safeBottom = getSafeBottomInset(insets.bottom);

  const selectedTopic = useSelector((state: RootState) => state.problem.selectedTopic);
  const durationMinutes = useSelector((state: RootState) => state.problem.durationMinutes);
  const difficultyLevel = useSelector((state: RootState) => state.problem.difficultyLevel);

  const [startSession, { isLoading }] = useStartSessionMutation();

  const handleStartInterview = async () => {
    if (!selectedTopic) return;

    try {
      dispatch(clearSession());
      const result = await startSession({
        problem: selectedTopic.title,
        durationMinutes,
        difficultyLevel,
      }).unwrap();

      dispatch(
        setSession({
          sessionId: result.sessionId,
          openingMessage: result.message,
          problem: selectedTopic.title,
          durationMinutes,
          difficultyLevel,
        })
      );

      router.push('/(interview)/session' as any);
    } catch (err: any) {
      Alert.alert(
        'Failed to Start Interview',
        err?.data?.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'junior':
        return { text: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' };
      case 'mid':
        return { text: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' };
      case 'senior':
        return { text: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)' };
      default:
        return { text: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' };
    }
  };

  const diffBadge = getDifficultyColor(difficultyLevel);

  if (!selectedTopic) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <ArrowLeft size={20} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Interview Setup</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Problem Card (Figma Gradient Card) */}
        <LinearGradient
          colors={['#111827', '#0D1117']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.problemCard, { borderColor: colors.border }]}
        >
          <View style={[styles.diffBadge, { backgroundColor: diffBadge.bg }]}>
            <Text style={[styles.diffBadgeText, { color: diffBadge.text }]}>
              {difficultyLevel.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.problemTitle}>{selectedTopic.title}</Text>
          <Text style={styles.problemSubtitle}>
            System design interview with adaptive AI questioning and real-time evaluation.
          </Text>

          <View style={styles.metricsRow}>
            <View style={styles.metricCol}>
              <Text style={styles.metricLabel}>Duration</Text>
              <Text style={styles.metricValue}>{durationMinutes} min</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricCol}>
              <Text style={styles.metricLabel}>Level</Text>
              <Text style={[styles.metricValue, { color: diffBadge.text }]}>
                {difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)}
              </Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricCol}>
              <Text style={styles.metricLabel}>Stages</Text>
              <Text style={styles.metricValue}>5 Phases</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Evaluation Criteria Checklist */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>What will be evaluated</Text>
          <View style={styles.criteriaList}>
            {EVALUATION_CRITERIA.map((criterion) => (
              <View
                key={criterion}
                style={[styles.criterionItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.checkCircle}>
                  <Check size={12} color="#3B82F6" weight="bold" />
                </View>
                <Text style={[styles.criterionText, { color: colors.textSecondary }]}>{criterion}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Duration Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Duration</Text>
          <View style={styles.optionsRow}>
            {DURATIONS.map((dur) => {
              const isSelected = durationMinutes === dur;
              return (
                <Pressable
                  key={dur}
                  onPress={() => dispatch(setDuration(dur))}
                  style={[
                    styles.optionButton,
                    isSelected
                      ? { backgroundColor: colors.primary, borderColor: colors.primary }
                      : { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      isSelected ? { color: '#FFFFFF', fontWeight: '700' } : { color: colors.textSecondary },
                    ]}
                  >
                    {dur}m
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Difficulty Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Difficulty</Text>
          <View style={styles.optionsRow}>
            {DIFFICULTIES.map((diff) => {
              const isSelected = difficultyLevel === diff;
              return (
                <Pressable
                  key={diff}
                  onPress={() => dispatch(setDifficulty(diff))}
                  style={[
                    styles.optionButton,
                    isSelected
                      ? { backgroundColor: colors.primary, borderColor: colors.primary }
                      : { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      isSelected ? { color: '#FFFFFF', fontWeight: '700' } : { color: colors.textSecondary },
                    ]}
                  >
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: safeBottom + 12,
          },
        ]}
      >
        <Pressable
          onPress={handleStartInterview}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.startBtn,
            {
              backgroundColor: colors.primary,
              opacity: isLoading ? 0.7 : pressed ? 0.92 : 1,
              transform: [{ scale: pressed ? 0.99 : 1 }],
            },
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.startBtnText}>Start Live Interview</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 20,
  },
  problemCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
  },
  diffBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  diffBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  problemTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  problemSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 18,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(51, 65, 85, 0.4)',
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(51, 65, 85, 0.4)',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  criteriaList: {
    gap: 8,
  },
  criterionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  criterionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  optionButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  startBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
