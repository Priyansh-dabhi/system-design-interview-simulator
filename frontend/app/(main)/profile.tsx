import { useGetHistoryQuery } from '@/src/redux/api/interview_api';
import { useAppDispatch, useAppSelector } from '@/src/redux/hooks';
import { logout } from '@/src/redux/slices/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
    Bug,
    CheckCircle,
    FileText,
    Fire,
    Gear,
    Info,
    Lifebuoy,
    PencilSimple,
    Shield,
    ShieldCheck,
    SignOut,
    Sparkle,
    Target,
    Trophy,
} from 'phosphor-react-native';
import React, { useMemo, useState } from 'react';
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
import { AchievementBadge } from '../../src/components/profile/AchievementBadge';
import {
    AboutModal,
    DataPrivacyModal,
    EditProfileModal,
    ReportProblemModal,
} from '../../src/components/profile/ProfileModals';
import { ProfileRow } from '../../src/components/profile/ProfileRow';
import { useTheme } from '../../src/theme/useTheme';
import { computeAchievements } from '../../src/utils/achievements';

export default function ProfileScreen() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const { data } = useGetHistoryQuery();
    const stats = data?.stats;
    const history = data?.history;
    const { colors, isDark } = useTheme();

    // Local profile customization
    const [candidateRole, setCandidateRole] = useState('System Design Candidate');
    const [displayName, setDisplayName] = useState('');

    // Modals state
    const [editProfileVisible, setEditProfileVisible] = useState(false);
    const [dataPrivacyVisible, setDataPrivacyVisible] = useState(false);
    const [aboutVisible, setAboutVisible] = useState(false);
    const [reportProblemVisible, setReportProblemVisible] = useState(false);

    const openPrivacyPolicy = () => {
        Linking.openURL('https://priyansh-dabhi.github.io/privacy-policy/#privacy');
    };

    const openTermsAndConditions = () => {
        Linking.openURL('https://priyansh-dabhi.github.io/privacy-policy/#terms');
    };

    const openHelpSupport = () => {
        Alert.alert(
            'Help & Support',
            'Need assistance with your simulations or account? Reach out to our engineering support team.\n\nsupport@interviewai.app',
            [
                { text: 'Copy Email', onPress: () => Linking.openURL('mailto:support@interviewai.app') },
                { text: 'Close', style: 'cancel' },
            ]
        );
    };

    // Calculate metrics from real data
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

    // Achievements calculation
    const achievements = useMemo(() => {
        return computeAchievements(stats, history);
    }, [stats, history]);

    const candidateName = displayName || user?.fullName || 'Senior Engineer';
    const candidateEmail = user?.email || 'candidate@example.com';
    const initial = candidateName.charAt(0).toUpperCase();

    // Exact requested Sign Out confirmation dialog
    const handleSignOut = () => {
        Alert.alert(
            'Sign out?',
            'You’ll need to sign in again to access your account.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: () => dispatch(logout()),
                },
            ]
        );
    };

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
        },
        headerTextContainer: {
            flex: 1,
            marginRight: 12,
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
        settingsBtn: {
            width: 40,
            height: 40,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
            borderWidth: 1,
            borderColor: colors.border,
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            padding: 18,
            paddingBottom: 40,
            gap: 24,
        },

        // 1. Profile Details Card
        identityCard: {
            borderRadius: 20,
            padding: 20,
            shadowColor: '#2563EB',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isDark ? 0.32 : 0.2,
            shadowRadius: 16,
            elevation: 6,
        },
        identityTopRow: {
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
        editBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            paddingHorizontal: 11,
            paddingVertical: 6,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.3)',
        },
        editBtnText: {
            fontSize: 12,
            fontWeight: '700',
            color: '#FFFFFF',
        },
        identityBody: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
        },
        avatarBox: {
            width: 60,
            height: 60,
            borderRadius: 18,
            backgroundColor: 'rgba(255, 255, 255, 0.22)',
            borderWidth: 1.5,
            borderColor: 'rgba(255, 255, 255, 0.45)',
            alignItems: 'center',
            justifyContent: 'center',
        },
        avatarText: {
            fontSize: 24,
            fontWeight: '800',
            color: '#FFFFFF',
        },
        identityDetails: {
            flex: 1,
            gap: 3,
        },
        candidateNameText: {
            fontSize: 19,
            fontWeight: '800',
            color: '#FFFFFF',
            letterSpacing: -0.3,
        },
        candidateEmailText: {
            fontSize: 13,
            color: '#BFDBFE',
            fontWeight: '500',
        },
        rolePill: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            marginTop: 4,
        },
        roleText: {
            fontSize: 11,
            fontWeight: '600',
            color: '#E0E7FF',
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

        // 2. Performance Overview Grid
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
            minHeight: 110,
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

        // 3. Achievements Grid
        achievementsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
        },

        // Grouped Card List
        cardGroup: {
            backgroundColor: colors.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
        },
        divider: {
            height: 1,
            backgroundColor: colors.border,
            marginLeft: 62,
        },

        // 7. Sign Out Button
        signOutCard: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            borderWidth: 1,
            borderColor: 'rgba(239, 68, 68, 0.22)',
            borderRadius: 14,
            paddingVertical: 14,
            marginTop: 4,
        },
        signOutText: {
            fontSize: 15,
            fontWeight: '700',
            color: '#EF4444',
        },

        // 8. Version Footer (Exact as requested)
        footer: {
            alignItems: 'center',
            marginTop: 4,
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
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Profile</Text>
                    <Text style={styles.headerSubtitle}>Candidate profile & simulator preferences</Text>
                </View>
                <TouchableOpacity
                    style={styles.settingsBtn}
                    onPress={() => router.push('/(main)/settings' as any)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    activeOpacity={0.7}
                    accessibilityLabel="Settings"
                    accessibilityRole="button"
                >
                    <Gear size={22} color={colors.text} weight="regular" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* 1. Profile Details */}
                <LinearGradient
                    colors={['#2563EB', '#1E3A8A']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.identityCard}
                >
                    <View style={styles.identityTopRow}>
                        <View style={styles.verifiedBadge}>
                            <View style={styles.pulseDot} />
                            <Text style={styles.verifiedBadgeText}>CANDIDATE VERIFIED</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.editBtn}
                            onPress={() => setEditProfileVisible(true)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <PencilSimple size={13} color="#FFFFFF" weight="bold" />
                            <Text style={styles.editBtnText}>Edit Profile</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.identityBody}>
                        <View style={styles.avatarBox}>
                            <Text style={styles.avatarText}>{initial}</Text>
                        </View>
                        <View style={styles.identityDetails}>
                            <Text style={styles.candidateNameText} numberOfLines={1}>
                                {candidateName}
                            </Text>
                            <Text style={styles.candidateEmailText} numberOfLines={1}>
                                {candidateEmail}
                            </Text>
                            <View style={styles.rolePill}>
                                <Target size={13} color="#93C5FD" weight="bold" />
                                <Text style={styles.roleText} numberOfLines={1}>{candidateRole}</Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>

                {/* 2. Performance Overview */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Performance Overview</Text>
                        <Text style={styles.sectionSubtitle}>Simulation scores and preparation progress</Text>
                    </View>

                    <View style={styles.metricGrid}>
                        {/* Metric 1: Total Interviews */}
                        <Pressable
                            style={({ pressed }) => [styles.metricCard, { opacity: pressed ? 0.85 : 1 }]}
                            onPress={() => router.push('/(main)/history' as any)}
                        >
                            <View style={styles.metricTopRow}>
                                <View style={[styles.metricIconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
                                    <CheckCircle size={18} color="#3B82F6" weight="fill" />
                                </View>
                            </View>
                            <View>
                                <Text style={styles.metricValue}>{stats?.total ?? 0}</Text>
                                <Text style={styles.metricLabel}>Total Interviews</Text>
                            </View>
                        </Pressable>

                        {/* Metric 2: Average Score */}
                        <Pressable
                            style={({ pressed }) => [styles.metricCard, { opacity: pressed ? 0.85 : 1 }]}
                            onPress={() => router.push('/(main)/history' as any)}
                        >
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
                        </Pressable>

                        {/* Metric 3: Best Score */}
                        <Pressable
                            style={({ pressed }) => [styles.metricCard, { opacity: pressed ? 0.85 : 1 }]}
                            onPress={() => router.push('/(main)/history' as any)}
                        >
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
                        </Pressable>

                        {/* Metric 4: Current Streak */}
                        <Pressable
                            style={({ pressed }) => [styles.metricCard, { opacity: pressed ? 0.85 : 1 }]}
                            onPress={() => router.push('/(main)/history' as any)}
                        >
                            <View style={styles.metricTopRow}>
                                <View style={[styles.metricIconCircle, { backgroundColor: 'rgba(249, 115, 22, 0.12)' }]}>
                                    <Fire size={18} color="#F97316" weight="fill" />
                                </View>
                            </View>
                            <View>
                                <Text style={styles.metricValue}>
                                    {stats?.currentStreak ?? 0} {stats?.currentStreak === 1 ? 'day' : 'days'}
                                </Text>
                                <Text style={styles.metricLabel}>Current Streak</Text>
                            </View>
                        </Pressable>
                    </View>
                </View>

                {/* 3. Achievements */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Achievements</Text>
                        <Text style={styles.sectionSubtitle}>System design milestones & mastery recognition</Text>
                    </View>

                    <View style={styles.achievementsGrid}>
                        {achievements.map((ach) => (
                            <AchievementBadge key={ach.id} achievement={ach} />
                        ))}
                    </View>
                </View>


                {/* 4. Legal & Support */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Legal & Support</Text>
                        <Text style={styles.sectionSubtitle}>Compliance, privacy & assistance</Text>
                    </View>

                    <View style={styles.cardGroup}>
                        <ProfileRow
                            icon={<ShieldCheck size={18} color={colors.text} />}
                            title="Privacy Policy"
                            subtitle="Data retention & privacy terms"
                            onPress={openPrivacyPolicy}
                        />
                        <View style={styles.divider} />
                        <ProfileRow
                            icon={<FileText size={18} color={colors.text} />}
                            title="Terms & Conditions"
                            subtitle="Licensing and usage terms"
                            onPress={openTermsAndConditions}
                        />
                        <View style={styles.divider} />
                        <ProfileRow
                            icon={<Shield size={18} color={colors.text} />}
                            title="Data & Privacy"
                            subtitle="Control your telemetry & account"
                            onPress={() => setDataPrivacyVisible(true)}
                        />
                        <View style={styles.divider} />
                        <ProfileRow
                            icon={<Lifebuoy size={18} color={colors.text} />}
                            title="Help & Support"
                            subtitle="Technical support & guidance"
                            onPress={openHelpSupport}
                        />
                        <View style={styles.divider} />
                        <ProfileRow
                            icon={<Bug size={18} color={colors.text} />}
                            title="Report a Problem"
                            subtitle="Submit simulation bugs or feedback"
                            onPress={() => setReportProblemVisible(true)}
                        />
                    </View>
                </View>

                {/* 5. About */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>About</Text>
                    </View>
                    <View style={styles.cardGroup}>
                        <ProfileRow
                            icon={<Info size={18} color={colors.text} />}
                            title="About InterviewAI"
                            subtitle="Version, architecture & platform"
                            onPress={() => setAboutVisible(true)}
                        />
                    </View>
                </View>

                {/* 6. Sign Out */}
                <Pressable
                    onPress={handleSignOut}
                    style={({ pressed }) => [styles.signOutCard, { opacity: pressed ? 0.85 : 1 }]}
                >
                    <SignOut size={18} color="#EF4444" weight="bold" />
                    <Text style={styles.signOutText}>Sign Out</Text>
                </Pressable>

                {/* 7. Version information */}
                <View style={styles.footer}>
                    <Text style={styles.footerVersion}>AI System Design Simulator • v1.0.0</Text>
                    <Text style={styles.footerTagline}>Engineered for top-tier software engineers</Text>
                </View>
            </ScrollView>

            {/* Modals */}
            <EditProfileModal
                visible={editProfileVisible}
                onClose={() => setEditProfileVisible(false)}
                currentName={candidateName}
                currentEmail={candidateEmail}
                currentRole={candidateRole}
                onSave={(name, role) => {
                    setDisplayName(name);
                    setCandidateRole(role);
                }}
            />

            <DataPrivacyModal
                visible={dataPrivacyVisible}
                onClose={() => setDataPrivacyVisible(false)}
                onSignOut={() => dispatch(logout())}
            />

            <AboutModal
                visible={aboutVisible}
                onClose={() => setAboutVisible(false)}
            />

            <ReportProblemModal
                visible={reportProblemVisible}
                onClose={() => setReportProblemVisible(false)}
            />
        </SafeAreaView>
    );
}
