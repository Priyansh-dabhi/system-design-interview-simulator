import { CaretRight } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../theme/useTheme';
import { InterviewHistoryItem } from '../../types/types';

const formatInterviewDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));

export function InterviewCard({ item }: { item: InterviewHistoryItem }) {
  const router = useRouter();
  const { colors } = useTheme();

  const displayScore =
    typeof item.overallScore === 'number'
      ? Math.round(item.overallScore)
      : item.score === 'good'
      ? 85
      : item.score === 'average'
      ? 70
      : 55;

  const scoreStyle =
    displayScore >= 80
      ? { text: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' }
      : displayScore >= 65
      ? { text: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' }
      : { text: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)' };

  const handleCardPress = () => {
    router.push({
      pathname: '/(interview)/summary',
      params: { sessionId: item.id },
    });
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleCardPress}
        style={styles.cardHeader}
      >
        {/* Left: Square Score Badge */}
        <View style={[styles.scoreBadge, { backgroundColor: scoreStyle.bg }]}>
          <Text style={[styles.scoreText, { color: scoreStyle.text }]}>{displayScore}</Text>
        </View>

        {/* Center: Info */}
        <View style={styles.cardInfo}>
          <Text style={[styles.topicTitle, { color: colors.text }]} numberOfLines={1}>
            {item.topic}
          </Text>
          <Text style={[styles.dateText, { color: colors.textDim }]}>
            {formatInterviewDate(item.date)}
          </Text>
          <View style={styles.badgeRow}>
            <View style={[styles.diffBadgeBox, { backgroundColor: scoreStyle.bg }]}>
              <Text style={[styles.diffBadgeText, { color: scoreStyle.text }]}>
                {item.score === 'good' ? 'Strong' : item.score === 'average' ? 'Average' : 'Needs Work'}
              </Text>
            </View>
          </View>
        </View>

        {/* Right: Navigate Chevron */}
        <View style={styles.chevronBox}>
          <CaretRight size={18} color={colors.textDim} weight="bold" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  scoreBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '800',
  },
  cardInfo: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  dateText: {
    fontSize: 12,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  diffBadgeBox: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  diffBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chevronBox: {
    padding: 4,
  },
  expandedContent: {
    padding: 16,
    borderTopWidth: 1,
  },
});
