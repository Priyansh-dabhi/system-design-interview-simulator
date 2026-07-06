import {
    ChartBarIcon,
    ClipboardTextIcon,
    GearSixIcon,
    SignOutIcon,
    TargetIcon,
    TrophyIcon,
    UserCircleIcon,
} from 'phosphor-react-native';
import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ControlRow } from '../../src/components/profile/ControlRow';
import { MetricCard } from '../../src/components/profile/MetricCard';
import { useTheme } from '../../src/theme/useTheme';
import { Layout } from '../../src/constants/Layout';
import { useGetHistoryQuery } from '../../src/redux/api/interview_api';
import { useAppDispatch, useAppSelector } from '../../src/redux/hooks';
import { logout } from '../../src/redux/slices/auth';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
    const router = useRouter();
    const user = useAppSelector((state) => state.auth.user);
    const { data } = useGetHistoryQuery();
    const dispatch = useAppDispatch();
    const stats = data?.stats;
    const { colors } = useTheme();

    const completionRate =
        stats && stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}%` : '0%';
    const focusArea =
        (stats?.needsImprovement ?? 0) > 0
            ? 'Review missed topics'
            : stats?.completed
                ? 'Keep practicing'
                : 'Start first interview';

    const performanceMetrics = [
        { label: 'Total Interviews', value: String(stats?.total ?? 0), icon: ClipboardTextIcon, color: '#3B82F6', bg: '#3B82F618' },
        { label: 'Completion Rate', value: completionRate, icon: ChartBarIcon, color: '#10B981', bg: '#10B98118' },
        { label: 'Strongest Domain', value: stats?.strongestDomain ?? 'Not enough data', icon: TrophyIcon, color: '#F59E0B', bg: '#F59E0B18' },
        { label: 'Focus Area', value: focusArea, icon: TargetIcon, color: '#8B5CF6', bg: '#8B5CF618' },
    ];

    const initials = user?.fullName
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U';

    const handleSignOut = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', style: 'destructive', onPress: () => dispatch(logout()) },
            ]
        );
    };

const styles = React.useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        scrollContent: {
            padding: Layout.spacing.lg,
            paddingBottom: 120,
        },
        profileHeader: {
            alignItems: 'center',
            paddingVertical: Layout.spacing.xl,
            marginBottom: Layout.spacing.md,
        },
        avatar: {
            width: 88,
            height: 88,
            borderRadius: 44,
            backgroundColor: colors.primaryBrand,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: Layout.spacing.md,
            shadowColor: colors.primaryBrand,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 6,
        },
        avatarText: {
            fontSize: 32,
            fontWeight: '700',
            color: '#FFFFFF',
        },
        userName: {
            fontSize: 22,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 4,
        },
        userEmail: {
            fontSize: 14,
            color: colors.textSecondary,
        },
        sectionContainer: {
            marginBottom: Layout.spacing.xl,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginBottom: Layout.spacing.md,
        },
        metricsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: Layout.spacing.sm,
        },
        controlsList: {
            backgroundColor: colors.surface,
            borderRadius: Layout.borderRadius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
        },
        versionContainer: {
            alignItems: 'center',
            paddingVertical: Layout.spacing.xl,
            marginTop: Layout.spacing.md,
        },
        versionText: {
            fontSize: 13,
            color: colors.textSecondary,
            fontWeight: '500',
        },
    }), [colors]);

  return (


          <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
                    <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
                </View>

                {/* Performance Metrics */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Performance Metrics</Text>
                    <View style={styles.metricsGrid}>
                        {performanceMetrics.map((metric) => (
                            <MetricCard
                                key={metric.label}
                                label={metric.label}
                                value={metric.value}
                                icon={metric.icon}
                                color={metric.color}
                                bg={metric.bg}
                            />
                        ))}
                    </View>
                </View>

                {/* Account Controls */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Account Controls</Text>
                    <View style={styles.controlsList}>
                        <ControlRow
                            label="Edit Profile"
                            icon={UserCircleIcon}
                            onPress={() => console.log('Navigate to Edit Profile')}
                        />
                        <ControlRow
                            label="Preferences"
                            icon={GearSixIcon}
                            onPress={() => router.push('/(main)/preferences' as any)}
                        />
                        <ControlRow
                            label="Sign Out"
                            icon={SignOutIcon}
                            iconColor={colors.error}
                            iconBg={colors.dangerSurfaceBg}
                            labelColor={colors.error}
                            chevronColor={colors.error}
                            isLast
                            onPress={handleSignOut}
                        />
                    </View>
                </View>

                {/* App Version */}
                <View style={styles.versionContainer}>
                    <Text style={styles.versionText}>v1.0.0-beta</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
