import {
    CaretRightIcon,
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
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/Colors';
import { Layout } from '../../src/constants/Layout';
import { useGetHistoryQuery } from '../../src/redux/api/interview_api';
import { useAppDispatch, useAppSelector } from '../../src/redux/hooks';
import { logout } from '../../src/redux/slices/auth';

// Account control items
const ACCOUNT_CONTROLS = [
    {
        label: 'Edit Profile',
        icon: UserCircleIcon,
        color: Colors.text,
        action: 'edit_profile',
    },
    {
        label: 'Preferences',
        icon: GearSixIcon,
        color: Colors.text,
        action: 'preferences',
    },
];

export default function ProfileScreen() {
    const user = useAppSelector((state) => state.auth.user);
    const { data } = useGetHistoryQuery();
    const dispatch = useAppDispatch();
    const stats = data?.stats;
    const completionRate =
        stats && stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}%` : '0%';
    const focusArea =
        (stats?.needsImprovement ?? 0) > 0
            ? 'Review missed topics'
            : stats?.completed
                ? 'Keep practicing'
                : 'Start first interview';
    const performanceMetrics = [
        {
            label: 'Total Interviews',
            value: String(stats?.total ?? 0),
            icon: ClipboardTextIcon,
            color: '#3B82F6',
            bg: '#3B82F618',
        },
        {
            label: 'Completion Rate',
            value: completionRate,
            icon: ChartBarIcon,
            color: '#10B981',
            bg: '#10B98118',
        },
        {
            label: 'Strongest Domain',
            value: stats?.strongestDomain ?? 'Not enough data',
            icon: TrophyIcon,
            color: '#F59E0B',
            bg: '#F59E0B18',
        },
        {
            label: 'Focus Area',
            value: focusArea,
            icon: TargetIcon,
            color: '#8B5CF6',
            bg: '#8B5CF618',
        },
    ];

    const initials = user?.fullName
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U';

    const handleAction = (action: string) => {
        switch (action) {
            case 'edit_profile':
                console.log('Navigate to Edit Profile');
                break;
            case 'preferences':
                console.log('Navigate to Preferences');
                break;
            default:
                break;
        }
    };

    const handleSignOut = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
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

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
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
                        {performanceMetrics.map((metric) => {
                            const Icon = metric.icon;
                            return (
                                <View key={metric.label} style={styles.metricCard}>
                                    <View style={[styles.metricIconContainer, { backgroundColor: metric.bg }]}>
                                        <Icon size={20} color={metric.color} weight="fill" />
                                    </View>
                                    <Text style={styles.metricLabel}>{metric.label}</Text>
                                    <Text
                                        style={[
                                            styles.metricValue,
                                            metric.value.length > 5 && styles.metricValueSmall,
                                        ]}
                                        numberOfLines={2}
                                    >
                                        {metric.value}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Account Controls */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Account Controls</Text>
                    <View style={styles.controlsList}>
                        {ACCOUNT_CONTROLS.map((control) => {
                            const Icon = control.icon;
                            return (
                                <TouchableOpacity
                                    key={control.action}
                                    style={styles.controlRow}
                                    activeOpacity={0.6}
                                    onPress={() => handleAction(control.action)}
                                >
                                    <View style={styles.controlLeft}>
                                        <View style={styles.controlIconContainer}>
                                            <Icon size={20} color={control.color} />
                                        </View>
                                        <Text style={styles.controlLabel}>{control.label}</Text>
                                    </View>
                                    <CaretRightIcon size={16} color={Colors.textSecondary} />
                                </TouchableOpacity>
                            );
                        })}

                        {/* Sign Out — separate destructive row */}
                        <TouchableOpacity
                            style={[styles.controlRow, styles.signOutRow]}
                            activeOpacity={0.6}
                            onPress={handleSignOut}
                        >
                            <View style={styles.controlLeft}>
                                <View style={[styles.controlIconContainer, styles.signOutIconContainer]}>
                                    <SignOutIcon size={20} color={Colors.error} />
                                </View>
                                <Text style={[styles.controlLabel, styles.signOutLabel]}>Sign Out</Text>
                            </View>
                            <CaretRightIcon size={16} color={Colors.error} />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        padding: Layout.spacing.lg,
        paddingBottom: 120,
    },

    // Profile Header
    profileHeader: {
        alignItems: 'center',
        paddingVertical: Layout.spacing.xl,
        marginBottom: Layout.spacing.md,
    },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: Colors.primaryBrand,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Layout.spacing.md,
        shadowColor: Colors.primaryBrand,
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
        color: Colors.text,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: Colors.textSecondary,
    },

    // Sections
    sectionContainer: {
        marginBottom: Layout.spacing.xl,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Layout.spacing.md,
    },

    // Metrics Grid
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Layout.spacing.sm,
    },
    metricCard: {
        width: '48.5%',
        backgroundColor: Colors.surface,
        borderRadius: Layout.borderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Layout.spacing.md,
        minHeight: 110,
    },
    metricIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Layout.spacing.sm,
    },
    metricLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 4,
        fontWeight: '500',
    },
    metricValue: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.text,
    },
    metricValueSmall: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
    },

    // Account Controls
    controlsList: {
        backgroundColor: Colors.surface,
        borderRadius: Layout.borderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
    },
    controlRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Layout.spacing.md,
        paddingVertical: Layout.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    controlLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Layout.spacing.sm + 4,
    },
    controlIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: Colors.surfaceHighlight + '60',
        alignItems: 'center',
        justifyContent: 'center',
    },
    controlLabel: {
        fontSize: 15,
        fontWeight: '500',
        color: Colors.text,
    },

    // Sign Out
    signOutRow: {
        borderBottomWidth: 0,
    },
    signOutIconContainer: {
        backgroundColor: '#EF444418',
    },
    signOutLabel: {
        color: Colors.error,
    },
});
