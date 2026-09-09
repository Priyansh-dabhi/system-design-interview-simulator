import { clearSession } from '@/src/redux/slices/session';
import type { RootState } from '@/src/redux/store';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'phosphor-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../src/theme/useTheme';

export default function CompleteScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { colors } = useTheme();

  const summary = useSelector((state: RootState) => state.session.summary);
  const messages = useSelector((state: RootState) => state.session.messages);

  const score = typeof summary?.overall_score === 'number' ? summary.overall_score : 0;
  const durationMin = summary?.durationSeconds
    ? Math.max(1, Math.round(summary.durationSeconds / 60))
    : 15;
  const questionCount = Math.max(1, messages.filter((m) => m.role === 'user').length);

  const scoreColor = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';

  const size = 130;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(1, Math.max(0, score / 100));
  const strokeDashoffset = circumference * (1 - progress);

  const handleViewEvaluation = () => {
    router.replace('/(interview)/summary' as any);
  };

  const handleBackHome = () => {
    dispatch(clearSession());
    router.replace('/(main)/home' as any);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
        {/* Animated Score Ring */}
        <View style={styles.ringWrapper}>
          <Svg width={size} height={size}>
            {/* Background Track */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(51, 65, 85, 0.3)"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Progress Arc */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={scoreColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </Svg>
          <View style={styles.scoreTextOverlay}>
            <Text style={[styles.scoreNumber, { color: colors.text }]}>{score}</Text>
            <Text style={[styles.scoreMax, { color: colors.textDim }]}>/100</Text>
          </View>
        </View>

        {/* Title & Feedback */}
        <View style={styles.headerBlock}>
          <Text style={[styles.title, { color: colors.text }]}>Interview Complete</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {score >= 70
              ? 'Great performance! You demonstrated solid architectural foundations and trade-off considerations.'
              : score > 0
              ? 'Good effort! Review your evaluation to see targeted recommendations for key topics.'
              : 'Session concluded. Review the comprehensive evaluation below to identify areas for improvement.'}
          </Text>
        </View>

        {/* 3 Quick Stats Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{durationMin} min</Text>
            <Text style={[styles.statLabel, { color: colors.textDim }]}>Duration</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{questionCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textDim }]}>Questions</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>5/5</Text>
            <Text style={[styles.statLabel, { color: colors.textDim }]}>Stages</Text>
          </View>
        </View>

        {/* CTAs */}
        <View style={styles.ctaBlock}>
          <Pressable
            onPress={handleViewEvaluation}
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] },
            ]}
          >
            <Text style={styles.primaryBtnText}>View Full Evaluation</Text>
            <ArrowRight size={18} color="#FFFFFF" weight="bold" />
          </Pressable>

          <Pressable
            onPress={handleBackHome}
            style={({ pressed }) => [
              styles.secondaryBtn,
              { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.92 : 1 },
            ]}
          >
            <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>Back to Home</Text>
          </Pressable>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  ringWrapper: {
    position: 'relative',
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreTextOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  scoreMax: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: -2,
  },
  headerBlock: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  statCard: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  ctaBlock: {
    width: '100%',
    gap: 10,
    marginTop: 8,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
