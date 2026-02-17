import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { CaretRightIcon, ClockCounterClockwiseIcon, PlayIcon } from "phosphor-react-native";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from "../../src/constants/Colors";
import { Layout } from "../../src/constants/Layout";
import { useAuth } from "../../src/context/AuthContext";

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  // Mock data for weekly progress
  const weeklyProgress = 3;
  const recommendedInterviews = [
    {
      id: '1',
      title: 'Distributed Caching',
      description: 'High frequency in recent interviews',
      color: '#3B82F6', // Blue
    },
    {
      id: '2',
      title: 'Load Balancing',
      description: 'Core concept refresher',
      color: '#10B981', // Emerald
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Evening, {user?.full_name?.split(' ')[0] || 'Alex'}</Text>
            <Text style={styles.subGreeting}>Ready to practice today?</Text>
          </View>
          <TouchableOpacity onPress={signOut} style={styles.profileButton}>
            {/* Placeholder for user avatar or initials */}
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{user?.full_name?.[0] || 'A'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Weekly Progress Card */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Weekly Progress</Text>
          <View style={styles.progressCard}>
            <LinearGradient
              colors={[Colors.surfaceHighlight, Colors.surfaceDark]}
              style={styles.progressCardGradient}
            >
              <View style={styles.progressContent}>
                <View>
                  <Text style={styles.progressLabel}>Interviews Practiced</Text>
                  <Text style={styles.progressValue}>{weeklyProgress}</Text>
                </View>
                <View style={styles.circularProgressPlaceholder}>
                  {/* Placeholder for a circular progress chart if needed */}
                  <ClockCounterClockwiseIcon size={32} color={Colors.primaryBrand} />
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Action Area - Moved to Center */}
        <View style={styles.actionArea}>
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.9} onPress={() => router.push('/(interview)/topic-selection' as any)}>
            <PlayIcon size={24} color="#FFFFFF" weight="fill" />
            <Text style={styles.primaryButtonText}>Start New Interview</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.9} onPress={() => console.log("History")}>
            <ClockCounterClockwiseIcon size={24} color={Colors.textSecondary} />
            <Text style={styles.secondaryButtonText}>Interview History</Text>
          </TouchableOpacity>
        </View>

        {/* Recommended Topics Section - Moved to Last */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended Interviews</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.topicsList}>
            {recommendedInterviews.map((topic) => (
              <TouchableOpacity key={topic.id} style={styles.topicCard} activeOpacity={0.7}>
                <View style={[styles.topicIcon, { backgroundColor: topic.color + '20' }]}>
                  <View style={[styles.topicIconInner, { backgroundColor: topic.color }]} />
                </View>
                <View style={styles.topicInfo}>
                  <Text style={styles.topicTitle}>{topic.title}</Text>
                  <Text style={styles.topicDescription}>{topic.description}</Text>
                </View>
                <CaretRightIcon size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    color: Colors.text,
  },
  subGreeting: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryBrand,
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
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primaryBrand,
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
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  progressValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.text,
  },
  circularProgressPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.surfaceHighlight,
  },
  topicsList: {
    gap: Layout.spacing.md,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Colors.text,
    marginBottom: 2,
  },
  topicDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  actionArea: {
    gap: 12,
    marginVertical: Layout.spacing.xl,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: Colors.primaryBrand,
    borderRadius: Layout.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primaryBrand,
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
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#CBD5E1', // Slate 300
    fontSize: 16,
    fontWeight: '500',
  },
});

