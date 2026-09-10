import { useGetHistoryQuery } from '@/src/redux/api/interview_api';
import { useAppDispatch, useAppSelector } from '@/src/redux/hooks';
import { logout } from '@/src/redux/slices/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  CaretRight,
  CheckCircle,
  FileText,
  Fire,
  Gear,
  Lightning,
  ShieldCheck,
  SignOut,
  Sparkle,
  Target,
  Trophy,
} from 'phosphor-react-native';
import React, { useMemo } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/useTheme';
import { Layout } from '../../src/constants/Layout';

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { data } = useGetHistoryQuery();
  const stats = data?.stats;
  const { colors, isDark } = useTheme();

  const openPrivacyPolicy = () => {
    Linking.openURL('https://priyansh-dabhi.github.io/privacy-policy/#privacy');
  };

  const openTermsAndConditions = () => {
    Linking.openURL('https://priyansh-dabhi.github.io/privacy-policy/#terms');
  };

  const averageScore = useMemo(() => {
    const scores = stats?.scoreOverTime;
    if (scores && scores.length > 0) {
      return Math.round(scores.reduce((acc, curr) => acc + curr.score, 0) / scores.length);
    }
    return '--';
  }, [stats?.scoreOverTime]);

  const bestScore = useMemo(() => {
    const scores = stats?.scoreOverTime;
    if (scores && scores.length > 0) {
      return Math.max(...scores.map((s) => s.score));
    }
    return '--';
  }, [stats?.scoreOverTime]);

  const initial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'P';

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of your account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => dispatch(logout()) },
    ]);
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '800',
      letterSpacing: -0.3,
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: 13,
      marginTop: 2,
      color: colors.textSecondary,
    },
    settingsButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 18,
      paddingBottom: 40,
      gap: 22,
    },
    // Signature Blue Hero Card (Matching Home Screen)
    heroCard: {
      borderRadius: 20,
      padding: 20,
      shadowColor: '#2563EB',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.28,
      shadowRadius: 18,
      elevation: 7,
    },
    heroBadgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    verifiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(255, 255, 255, 0.18)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.25)',
    },
    pulseDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#34D399',
    },
    verifiedBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: 0.6,
    },
    targetRoleBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(0, 0, 0, 0.22)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
    },
    targetRoleText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#93C5FD',
    },
    candidateProfileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    avatarBox: {
      width: 62,
      height: 62,
      borderRadius: 18,
      backgroundColor: 'rgba(255, 255, 255, 0.22)',
      borderWidth: 1.5,
      borderColor: 'rgba(255, 255, 255, 0.45)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: 26,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    candidateDetails: {
      flex: 1,
      gap: 3,
    },
    candidateName: {
      fontSize: 20,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: -0.3,
    },
    candidateEmail: {
      fontSize: 13,
      color: '#BFDBFE',
      fontWeight: '500',
    },
    candidateTrackPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: 4,
    },
    candidateTrackText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#E0E7FF',
    },
    heroChipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 18,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.15)',
    },
    heroChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 8,
    },
    heroChipText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    // Section Layouts
    section: {
      gap: 12,
    },
    sectionHeader: {
      marginBottom: 2,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: -0.2,
      color: colors.text,
    },
    sectionSubtitle: {
      fontSize: 12,
      marginTop: 2,
      color: colors.textSecondary,
    },
    // 2x2 Metric Cards Grid
    metricGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    metricCard: {
      width: '48.5%',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 112,
      justifyContent: 'space-between',
    },
    metricTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    metricIconCircle: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    metricValue: {
      fontSize: 21,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.4,
    },
    metricLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
      marginTop: 2,
    },
    // Grouped Card List
    cardGroup: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    groupItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    groupItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    groupItemIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    groupItemTextContainer: {
      flex: 1,
    },
    groupItemTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    groupItemSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 1,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginLeft: 64,
    },
    // Sign Out Button
    signOutCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: 'rgba(239, 68, 68, 0.08)',
      borderWidth: 1,
      borderColor: 'rgba(239, 68, 68, 0.22)',
      borderRadius: 14,
      paddingVertical: 13,
      marginTop: 4,
    },
    signOutText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#EF4444',
    },
    footer: {
      alignItems: 'center',
      marginTop: 8,
      gap: 3,
    },
    footerVersion: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textDim,
    },
    footerTagline: {
      fontSize: 11,
      color: colors.textDim,
    },
  }), [colors, isDark]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Screen Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Profile</Text>
            <Text style={styles.headerSubtitle}>Candidate profile & simulator preferences</Text>
          </View>
          <Pressable
            onPress={() => router.push('/(main)/preferences' as any)}
            style={styles.settingsButton}
            accessibilityLabel="Preferences"
          >
            <Gear size={20} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Signature Blue Hero Card */}
        <LinearGradient
          colors={['#2563EB', '#1E3A8A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroBadgeRow}>
            <View style={styles.verifiedBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.verifiedBadgeText}>CANDIDATE VERIFIED</Text>
            </View>
            <View style={styles.targetRoleBadge}>
              <Lightning size={12} color="#93C5FD" weight="fill" />
              <Text style={styles.targetRoleText}>FAANG Track</Text>
            </View>
          </View>

          <View style={styles.candidateProfileRow}>
            <View style={styles.avatarBox}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <View style={styles.candidateDetails}>
              <Text style={styles.candidateName} numberOfLines={1}>
                {user?.fullName || 'Senior Engineer'}
              </Text>
              <Text style={styles.candidateEmail} numberOfLines={1}>
                {user?.email || 'candidate@example.com'}
              </Text>
              <View style={styles.candidateTrackPill}>
                <Target size={13} color="#93C5FD" weight="bold" />
                <Text style={styles.candidateTrackText}>System Design Simulator</Text>
              </View>
            </View>
          </View>

          <View style={styles.heroChipsRow}>
            <View style={styles.heroChip}>
              <CheckCircle size={12} color="#93C5FD" weight="fill" />
              <Text style={styles.heroChipText}>5 Core Pillars Evaluated</Text>
            </View>
            <View style={styles.heroChip}>
              <Sparkle size={12} color="#93C5FD" weight="fill" />
              <Text style={styles.heroChipText}>Adaptive Interview AI</Text>
            </View>
          </View>
        </LinearGradient>

        {/* 2x2 Performance Overview Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Performance Overview</Text>
            <Text style={styles.sectionSubtitle}>Simulation scores and preparation progress</Text>
          </View>

          <View style={styles.metricGrid}>
            {/* Metric 1: Total Interviews */}
            <View style={styles.metricCard}>
              <View style={styles.metricTopRow}>
                <View style={[styles.metricIconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
                  <CheckCircle size={18} color="#3B82F6" weight="fill" />
                </View>
              </View>
              <View>
                <Text style={styles.metricValue}>{stats?.total ?? 0}</Text>
                <Text style={styles.metricLabel}>Total Interviews</Text>
              </View>
            </View>

            {/* Metric 2: Average Score */}
            <View style={styles.metricCard}>
              <View style={styles.metricTopRow}>
                <View style={[styles.metricIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                  <Sparkle size={18} color="#10B981" weight="fill" />
                </View>
              </View>
              <View>
                <Text style={styles.metricValue}>
                  {averageScore}{averageScore !== '--' ? '/100' : ''}
                </Text>
                <Text style={styles.metricLabel}>Average Score</Text>
              </View>
            </View>

            {/* Metric 3: Best Score (Exact label requested) */}
            <View style={styles.metricCard}>
              <View style={styles.metricTopRow}>
                <View style={[styles.metricIconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                  <Trophy size={18} color="#F59E0B" weight="fill" />
                </View>
              </View>
              <View>
                <Text style={styles.metricValue}>
                  {bestScore}{bestScore !== '--' ? '/100' : ''}
                </Text>
                <Text style={styles.metricLabel}>Best Score</Text>
              </View>
            </View>

            {/* Metric 4: Current Streak */}
            <View style={styles.metricCard}>
              <View style={styles.metricTopRow}>
                <View style={[styles.metricIconCircle, { backgroundColor: 'rgba(249, 115, 22, 0.12)' }]}>
                  <Fire size={18} color="#F97316" weight="fill" />
                </View>
              </View>
              <View>
                <Text style={styles.metricValue}>
                  {stats?.currentStreak ?? 0} {stats?.currentStreak === 1 ? 'Day' : 'Days'}
                </Text>
                <Text style={styles.metricLabel}>Current Streak</Text>
              </View>
            </View>
          </View>
        </View>

        {/* App & Preferences Group */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Preferences</Text>
          </View>
          <View style={styles.cardGroup}>
            <Pressable
              onPress={() => router.push('/(main)/preferences' as any)}
              style={({ pressed }) => [styles.groupItem, { opacity: pressed ? 0.85 : 1 }]}
            >
              <View style={styles.groupItemLeft}>
                <View style={styles.groupItemIcon}>
                  <Gear size={18} color={colors.text} />
                </View>
                <View style={styles.groupItemTextContainer}>
                  <Text style={styles.groupItemTitle}>Appearance & Theme</Text>
                  <Text style={styles.groupItemSubtitle}>Toggle light, dark, or system mode</Text>
                </View>
              </View>
              <CaretRight size={16} color={colors.textDim} />
            </Pressable>
          </View>
        </View>

        {/* Legal & Compliance Group */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Legal & Security</Text>
          </View>
          <View style={styles.cardGroup}>
            <Pressable
              onPress={openPrivacyPolicy}
              style={({ pressed }) => [styles.groupItem, { opacity: pressed ? 0.85 : 1 }]}
            >
              <View style={styles.groupItemLeft}>
                <View style={styles.groupItemIcon}>
                  <ShieldCheck size={18} color={colors.text} />
                </View>
                <View style={styles.groupItemTextContainer}>
                  <Text style={styles.groupItemTitle}>Privacy Policy</Text>
                  <Text style={styles.groupItemSubtitle}>Data retention, storage & confidentiality</Text>
                </View>
              </View>
              <CaretRight size={16} color={colors.textDim} />
            </Pressable>

            <View style={styles.divider} />

            <Pressable
              onPress={openTermsAndConditions}
              style={({ pressed }) => [styles.groupItem, { opacity: pressed ? 0.85 : 1 }]}
            >
              <View style={styles.groupItemLeft}>
                <View style={styles.groupItemIcon}>
                  <FileText size={18} color={colors.text} />
                </View>
                <View style={styles.groupItemTextContainer}>
                  <Text style={styles.groupItemTitle}>Terms & Conditions</Text>
                  <Text style={styles.groupItemSubtitle}>Simulator licensing and usage terms</Text>
                </View>
              </View>
              <CaretRight size={16} color={colors.textDim} />
            </Pressable>
          </View>
        </View>

        {/* Sign Out Action */}
        <Pressable
          onPress={handleSignOut}
          style={({ pressed }) => [styles.signOutCard, { opacity: pressed ? 0.85 : 1 }]}
        >
          <SignOut size={18} color="#EF4444" weight="bold" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerVersion}>AI System Design Simulator • v1.0.0</Text>
          <Text style={styles.footerTagline}>Engineered for top-tier software engineers</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
