import { useRouter } from 'expo-router';
import { CaretRight, Play, Lightning, ChartLineUp, ClockCounterClockwise } from "phosphor-react-native";
import React, { useEffect } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { useTheme } from "../../src/theme/useTheme";
import { Layout } from "../../src/constants/Layout";
import { setSelectedTopic } from '@/src/redux/slices/problem';
import { useAppSelector } from '@/src/redux/hooks';
import { useGetHistoryQuery } from '@/src/redux/api/interview_api';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { Typography } from "../../src/components/ui/Typography";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { Badge } from "../../src/components/ui/Badge";

export default function HomeScreen() {
  const user = useAppSelector((state) => state.auth.user);
  const { data } = useGetHistoryQuery();
  const router = useRouter();
  const dispatch = useDispatch();
  const { colors } = useTheme();

  useEffect(() => {
    const requestPermissions = async () => {
      await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    };
    requestPermissions();
  }, []);

  const interviewsPracticed = data?.stats.completed ?? 0;
  // Mock average score and streak if not present in data
  const averageScore = data?.stats.averageScore ?? 0; 
  const currentStreak = data?.stats.currentStreak ?? 0;

  const recommendedInterviews = [
    {
      id: 'whatsapp',
      title: 'Design WhatsApp',
      description: 'Real-time messaging, websockets, message persistence.',
      difficulty: 'Advanced',
    },
    {
      id: 'netflix',
      title: 'Design Netflix',
      description: 'Video streaming optimization, CDN architecture.',
      difficulty: 'Advanced',
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleTopicSelect = (topic: { id: string; title: string }) => {
    dispatch(setSelectedTopic({ id: topic.id, title: topic.title }));
    router.push('/(interview)/problem-selection');
  };

  const getDifficultyVariant = (difficulty: string) => {
    switch (difficulty) {
      case 'Advanced': return 'error';
      case 'Intermediate': return 'warning';
      case 'Beginner': return 'success';
      default: return 'default';
    }
  };

  const styles = React.useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: Layout.spacing.lg,
      paddingBottom: 100,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Layout.spacing.xl,
      paddingTop: 16,
    },
    avatarPlaceholder: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.surface,
    },
    sectionContainer: {
      marginBottom: Layout.spacing.xl,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Layout.spacing.md,
    },
    statsRow: {
      flexDirection: 'row',
      gap: Layout.spacing.md,
      marginBottom: Layout.spacing.xl,
    },
    statCard: {
      flex: 1,
      alignItems: 'center',
    },
    topicCard: {
      marginBottom: Layout.spacing.md,
    },
    topicInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
  }), [colors]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Typography variant="h3" weight="bold">{getGreeting()}, {user?.fullName?.split(' ')[0] || 'Alex'}</Typography>
            <Typography variant="body2" color="textSecondary" style={{ marginTop: 4 }}>Ready to advance your system design skills?</Typography>
          </View>
          <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/profile')}>
            <View style={styles.avatarPlaceholder}>
              <Typography variant="h4" color="textDim" style={{ color: '#FFF' }}>{user?.fullName?.[0] || 'A'}</Typography>
            </View>
          </TouchableOpacity>
        </View>

        {/* Primary CTA */}
        <View style={styles.sectionContainer}>
          <Button
            title="Start Interview"
            onPress={() => router.push('/(interview)/problem-selection')}
            leftIcon={<Play size={20} color="#FFF" weight="fill" />}
            style={{ paddingVertical: Layout.spacing.lg }}
          />
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <Card padding="md" style={styles.statCard}>
            <Lightning size={24} color={'#F59E0B'} weight="fill" style={{ marginBottom: 8 }} />
            <Typography variant="h3" weight="bold">{currentStreak}</Typography>
            <Typography variant="caption" color="textSecondary">Day Streak</Typography>
          </Card>
          <Card padding="md" style={styles.statCard}>
            <ClockCounterClockwise size={24} color={colors.primary} weight="fill" style={{ marginBottom: 8 }} />
            <Typography variant="h3" weight="bold">{interviewsPracticed}</Typography>
            <Typography variant="caption" color="textSecondary">Interviews</Typography>
          </Card>
          <Card padding="md" style={styles.statCard}>
            <ChartLineUp size={24} color={colors.success} weight="fill" style={{ marginBottom: 8 }} />
            <Typography variant="h3" weight="bold">{averageScore || '--'}</Typography>
            <Typography variant="caption" color="textSecondary">Avg. Score</Typography>
          </Card>
        </View>

        {/* Recommended Topics */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Typography variant="h4" weight="semibold">Recommended for you</Typography>
            <TouchableOpacity onPress={() => router.push('/(interview)/problem-selection')}>
              <Typography variant="body2" color="primary" weight="medium">See all</Typography>
            </TouchableOpacity>
          </View>

          {recommendedInterviews.map((topic) => (
            <TouchableOpacity key={topic.id} activeOpacity={0.7} onPress={() => handleTopicSelect(topic)}>
              <Card padding="lg" style={styles.topicCard} variant="elevated">
                <View style={styles.topicInfo}>
                  <View style={{ flex: 1, paddingRight: Layout.spacing.md }}>
                    <Typography variant="body1" weight="semibold" style={{ marginBottom: 4 }}>{topic.title}</Typography>
                    <Typography variant="body2" color="textSecondary" style={{ marginBottom: Layout.spacing.md }}>
                      {topic.description}
                    </Typography>
                    <Badge label={topic.difficulty} variant={getDifficultyVariant(topic.difficulty) as any} />
                  </View>
                  <View style={{ justifyContent: 'center', height: '100%' }}>
                    <CaretRight size={20} color={colors.textDim} />
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
