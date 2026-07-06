import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { CaretRightIcon, ClockCounterClockwiseIcon, PlayIcon } from "phosphor-react-native";
import React, { useEffect } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { useTheme } from "../../src/theme/useTheme";
import { Layout } from "../../src/constants/Layout";
import { setSelectedTopic } from '@/src/redux/slices/problem';
import { useAppDispatch, useAppSelector } from '@/src/redux/hooks';
import { logout } from '@/src/redux/slices/auth';
import { useGetHistoryQuery } from '@/src/redux/api/interview_api';

// Safe import: expo-speech-recognition requires a development build (not Expo Go)
let ExpoSpeechRecognitionModule: any = null;
try {
    const speechModule = require('expo-speech-recognition');
    ExpoSpeechRecognitionModule = speechModule.ExpoSpeechRecognitionModule;
} catch {
    // Native module not available (Expo Go)
}

export default function HomeScreen() {
  const user = useAppSelector((state) => state.auth.user);
  const { data } = useGetHistoryQuery();
  const router = useRouter();
  const dispatch = useDispatch();
  const appDispatch = useAppDispatch();
  const { colors } = useTheme();

  useEffect(() => {
    // Request permissions upfront when user first lands on the home screen
    const requestPermissions = async () => {
      if (ExpoSpeechRecognitionModule) {
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      }
    };
    requestPermissions();
  }, []);

  const interviewsPracticed = data?.stats.completed ?? 0;
  const recommendedInterviews = [
    {
      id: 'whatsapp',
      title: 'Design WhatsApp',
      description: 'Real-time messaging, websockets, message persistence.',
      color: '#25D366', // WhatsApp Green
    },
    {
      id: 'netflix',
      title: 'Design Netflix',
      description: 'Video streaming optimization, CDN architecture.',
      color: '#E50914', // Netflix Red
    },
    {
      id: 'uber',
      title: 'Design Uber',
      description: 'Geospatial indexing, driver matching algorithms.',
      color: '#276EF1', // Uber Blue
    },
  ];

  const handleTopicSelect = (topic: { id: string; title: string }) => {
    dispatch(setSelectedTopic({ id: topic.id, title: topic.title }));
    router.push('/(interview)/problem-selection');
  };


    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Evening, {user?.fullName?.split(' ')[0] || 'Alex'}</Text>
            <Text style={styles.subGreeting}>Ready to practice today?</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            {/* Placeholder for user avatar or initials */}
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{user?.fullName?.[0] || 'A'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Weekly Progress Card */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Weekly Progress</Text>
          <View style={styles.progressCard}>
            <LinearGradient
              colors={[colors.surfaceHighlight, colors.surface]}
              style={styles.progressCardGradient}
            >
              <View style={styles.progressContent}>
                <View>
                  <Text style={styles.progressLabel}>Interviews Practiced</Text>
                  <Text style={styles.progressValue}>{interviewsPracticed}</Text>
                </View>
                <View style={styles.circularProgressPlaceholder}>
                  {/* Placeholder for a circular progress chart if needed */}
                  <ClockCounterClockwiseIcon size={32} color={colors.primaryBrand} />
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Action Area - Moved to Center */}
        <View style={styles.actionArea}>
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.9} onPress={() => router.push('/(interview)/problem-selection')}>
            <PlayIcon size={24} color="#FFFFFF" weight="fill" />
            <Text style={styles.primaryButtonText}>Start New Interview</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.9} onPress={() => router.push('/history')}>
            <ClockCounterClockwiseIcon size={24} color={colors.textSecondary} />
            <Text style={styles.secondaryButtonText}>Interview History</Text>
          </TouchableOpacity>
        </View>

        {/* Recommended Topics Section - Moved to Last */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended Interviews</Text>
            <TouchableOpacity onPress={()=> router.push('/problem-selection')}>
              <Text style={styles.seeAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.topicsList}>
            {recommendedInterviews.map((topic) => (
              <TouchableOpacity
                key={topic.id}
                style={styles.topicCard}
                activeOpacity={0.7}
                onPress={() => handleTopicSelect(topic)}
              >
                <View style={[styles.topicIcon, { backgroundColor: topic.color + '20' }]}>
                  <View style={[styles.topicIconInner, { backgroundColor: topic.color }]} />
                </View>
                <View style={styles.topicInfo}>
                  <Text style={styles.topicTitle}>{topic.title}</Text>
                  <Text style={styles.topicDescription}>{topic.description}</Text>
                </View>
                <CaretRightIcon size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

  const styles = React.useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: Layout.spacing.lg,
      paddingBottom: 100, // Extra padding for bottom tab bar
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Layout.spacing.xl,
    },
    greeting: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    subGreeting: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 4,
    },
    profileButton: {
      padding: 4,
    },
    avatarPlaceholder: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primaryBrand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      color: '#FFF',
      fontSize: 18,
      fontWeight: '600',
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
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: Layout.spacing.sm,
    },
    seeAllText: {
      fontSize: 14,
      color: colors.primaryBrand,
      fontWeight: '500',
    },
    progressCard: {
      borderRadius: Layout.borderRadius.lg,
      overflow: 'hidden',
    },
    progressCardGradient: {
      padding: Layout.spacing.lg,
    },
    progressContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    progressLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    progressValue: {
      fontSize: 36,
      fontWeight: 'bold',
      color: colors.text,
    },
    circularProgressPlaceholder: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 4,
      borderColor: colors.surfaceHighlight,
    },
    topicsList: {
      gap: Layout.spacing.md,
    },
    topicCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: Layout.spacing.md,
      borderRadius: Layout.borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    topicIcon: {
      width: 40,
      height: 40,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Layout.spacing.md,
    },
    topicIconInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    topicInfo: {
      flex: 1,
    },
    topicTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    topicDescription: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    actionArea: {
      gap: 12,
      marginVertical: Layout.spacing.xl,
    },
    primaryButton: {
      width: '100%',
      height: 56,
      backgroundColor: colors.primaryBrand,
      borderRadius: Layout.borderRadius.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      shadowColor: colors.primaryBrand,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    primaryButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    secondaryButton: {
      width: '100%',
      height: 56,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Layout.borderRadius.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    secondaryButtonText: {
      color: colors.textSecondary,
      fontSize: 16,
      fontWeight: '500',
    },
  }), [colors]);

