import { useGetHistoryQuery } from '@/src/redux/api/interview_api';
import { useAppDispatch, useAppSelector } from '@/src/redux/hooks';
import { logout } from '@/src/redux/slices/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  CaretRight,
  Clock,
  FileText,
  Gear,
  ShieldCheck,
  SignOut,
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
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/useTheme';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const { data } = useGetHistoryQuery();
  const dispatch = useAppDispatch();
  const stats = data?.stats;
  const { colors } = useTheme();

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
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => dispatch(logout()) },
    ]);
  };

  const menuItems = [
    {
      icon: <Trophy size={18} color={colors.textSecondary} />,
      label: 'Performance Reports',
      action: () => router.push('/(main)/history' as any),
    },
    {
      icon: <Clock size={18} color={colors.textSecondary} />,
      label: 'Interview History',
      action: () => router.push('/(main)/history' as any),
    },
    {
      icon: <Gear size={18} color={colors.textSecondary} />,
      label: 'Settings & Preferences',
      action: () => router.push('/(main)/preferences' as any),
    },
    {
      icon: <ShieldCheck size={18} color={colors.textSecondary} />,
      label: 'Privacy Policy',
      action: openPrivacyPolicy,
    },
    {
      icon: <FileText size={18} color={colors.textSecondary} />,
      label: 'Terms & Conditions',
      action: openTermsAndConditions,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Hero Header */}
      <View style={[styles.heroHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.userRow}>
          {/* Gradient Square Avatar */}
          <LinearGradient
            colors={['#3B82F6', '#4F46E5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{initial}</Text>
          </LinearGradient>

          {/* User Info */}
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>{user?.fullName || 'Priyansh Dabhi'}</Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
              {user?.email || 'engineer@example.com'}
            </Text>
            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.activeText}>Active learner</Text>
            </View>
          </View>
        </View>

        {/* 4-Column Quick Stats Row */}
        <View style={styles.quickStatsRow}>
          <View style={styles.quickStatCol}>
            <Text style={[styles.quickStatValue, { color: colors.text }]}>{stats?.total ?? 0}</Text>
            <Text style={[styles.quickStatLabel, { color: colors.textDim }]}>Interviews</Text>
          </View>
          <View style={styles.quickStatCol}>
            <Text style={[styles.quickStatValue, { color: colors.text }]}>{averageScore}</Text>
            <Text style={[styles.quickStatLabel, { color: colors.textDim }]}>Avg Score</Text>
          </View>
          <View style={styles.quickStatCol}>
            <Text style={[styles.quickStatValue, { color: colors.text }]}>{bestScore}</Text>
            <Text style={[styles.quickStatLabel, { color: colors.textDim }]}>Best</Text>
          </View>
          <View style={styles.quickStatCol}>
            <Text style={[styles.quickStatValue, { color: colors.text }]}>
              {stats?.currentStreak ?? 0}d
            </Text>
            <Text style={[styles.quickStatLabel, { color: colors.textDim }]}>Streak</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Achievements Card (Figma) */}
        <View style={[styles.achievementsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Achievements</Text>
          <View style={styles.badgesRow}>
            {[
              { icon: '🔥', label: '7-Day Streak', earned: (stats?.currentStreak ?? 0) >= 7 },
              { icon: '🎯', label: 'First 90+', earned: (bestScore !== '--' && Number(bestScore) >= 90) },
              { icon: '⚡', label: '5+ Interviews', earned: (stats?.total ?? 0) >= 5 },
              { icon: '🏆', label: 'Expert', earned: false },
            ].map((b) => (
              <View
                key={b.label}
                style={[styles.badgeItem, { opacity: b.earned ? 1 : 0.35 }]}
              >
                <View style={[styles.badgeIconBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={styles.badgeEmoji}>{b.icon}</Text>
                </View>
                <Text style={[styles.badgeLabel, { color: colors.textSecondary }]}>{b.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Menu Items List */}
        <View style={styles.menuList}>
          {menuItems.map((item) => (
            <Pressable
              key={item.label}
              onPress={item.action}
              style={({ pressed }) => [
                styles.menuItem,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: pressed ? 0.92 : 1,
                },
              ]}
            >
              <View style={styles.menuLeft}>
                {item.icon}
                <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
              </View>
              <CaretRight size={16} color={colors.textDim} />
            </Pressable>
          ))}

          {/* Sign Out Row */}
          <Pressable
            onPress={handleSignOut}
            style={({ pressed }) => [
              styles.signOutItem,
              {
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                borderColor: 'rgba(239, 68, 68, 0.2)',
                opacity: pressed ? 0.88 : 1,
              },
            ]}
          >
            <View style={styles.menuLeft}>
              <SignOut size={18} color="#EF4444" weight="bold" />
              <Text style={styles.signOutLabel}>Sign Out</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
    borderBottomWidth: 1,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  userEmail: {
    fontSize: 13,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  activeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(51, 65, 85, 0.4)',
  },
  quickStatCol: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 17,
    fontWeight: '800',
  },
  quickStatLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
  },
  achievementsCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badgeItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  badgeIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  badgeEmoji: {
    fontSize: 20,
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  menuList: {
    gap: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  signOutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 4,
  },
  signOutLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
});
