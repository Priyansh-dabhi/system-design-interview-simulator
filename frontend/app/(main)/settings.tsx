import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { useRouter } from 'expo-router';
import {
    ArrowLeft,
    Bell,
    CheckCircle,
    Desktop,
    Microphone,
    Moon,
    SlidersHorizontal,
    SpeakerHigh,
    Sun,
} from 'phosphor-react-native';
import React, { useEffect, useState } from 'react';
import {
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    AppSettings,
    defaultSettings,
    getStoredSettings,
    InterviewDifficulty,
    InterviewDuration,
    InterviewMode,
    setStoredSettings,
    SpeechSpeed,
} from '../../src/storage/settingsStorage';
import { ThemeMode } from '../../src/theme/types';
import { useTheme } from '../../src/theme/useTheme';

export default function SettingsScreen() {
    const router = useRouter();
    const { colors, isDark, themeMode, setThemeMode } = useTheme();

    const [settings, setSettings] = useState<AppSettings>(defaultSettings);
    const [micPermission, setMicPermission] = useState<string>('Checking...');

    useEffect(() => {
        getStoredSettings().then(setSettings);
        checkMicPermission();
    }, []);

    const checkMicPermission = async () => {
        try {
            const status = await ExpoSpeechRecognitionModule.getPermissionsAsync();
            if (status.granted) {
                setMicPermission('Allowed');
            } else {
                setMicPermission('Not Granted');
            }
        } catch {
            setMicPermission('Unknown');
        }
    };

    const requestMicPermission = async () => {
        try {
            const res = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
            setMicPermission(res.granted ? 'Allowed' : 'Denied');
        } catch {
            setMicPermission('Denied');
        }
    };

    const updateInterviewSetting = <K extends keyof AppSettings['interview']>(
        key: K,
        val: AppSettings['interview'][K]
    ) => {
        setSettings((prev) => {
            const updated = {
                ...prev,
                interview: { ...prev.interview, [key]: val },
            };
            setStoredSettings(updated);
            return updated;
        });
    };

    const updateVoiceSetting = <K extends keyof AppSettings['voice']>(
        key: K,
        val: AppSettings['voice'][K]
    ) => {
        setSettings((prev) => {
            const updated = {
                ...prev,
                voice: { ...prev.voice, [key]: val },
            };
            setStoredSettings(updated);
            return updated;
        });
    };

    const updateNotificationSetting = <K extends keyof AppSettings['notifications']>(
        key: K,
        val: AppSettings['notifications'][K]
    ) => {
        setSettings((prev) => {
            const updated = {
                ...prev,
                notifications: { ...prev.notifications, [key]: val },
            };
            setStoredSettings(updated);
            return updated;
        });
    };

    const themeOptions: { id: ThemeMode; label: string; icon: any }[] = [
        { id: 'light', label: 'Light', icon: Sun },
        { id: 'dark', label: 'Dark', icon: Moon },
        { id: 'system', label: 'System', icon: Desktop },
    ];

    const durationOptions: InterviewDuration[] = [20, 30, 45, 60];
    const speedOptions: SpeechSpeed[] = [0.8, 1.0, 1.2, 1.5];

    const styles = React.useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
        },
        backBtn: {
            width: 38,
            height: 38,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
            borderWidth: 1,
            borderColor: colors.border,
            marginRight: 14,
        },
        headerTextContainer: {
            flex: 1,
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: '800',
            color: colors.text,
            letterSpacing: -0.3,
        },
        headerSubtitle: {
            fontSize: 12,
            color: colors.textSecondary,
            marginTop: 1,
        },
        scrollContent: {
            padding: 18,
            paddingBottom: 50,
            gap: 22,
        },
        section: {
            gap: 10,
        },
        sectionHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginBottom: 2,
        },
        sectionTitle: {
            fontSize: 15,
            fontWeight: '700',
            color: colors.text,
            letterSpacing: -0.2,
        },
        card: {
            backgroundColor: colors.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 16,
            gap: 16,
        },
        rowBetween: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        rowLabel: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
        },
        rowDesc: {
            fontSize: 12,
            color: colors.textSecondary,
            marginTop: 2,
        },
        divider: {
            height: 1,
            backgroundColor: colors.border,
        },
        segmentedControl: {
            flexDirection: 'row',
            backgroundColor: isDark ? '#0D1117' : '#F1F5F9',
            borderRadius: 12,
            padding: 4,
            borderWidth: 1,
            borderColor: colors.border,
            gap: 4,
        },
        segmentBtn: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingVertical: 9,
            borderRadius: 9,
        },
        segmentBtnActive: {
            backgroundColor: colors.surface,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: isDark ? 0.3 : 0.08,
            shadowRadius: 2,
            elevation: 2,
        },
        segmentText: {
            fontSize: 12,
            fontWeight: '600',
            color: colors.textSecondary,
        },
        segmentTextActive: {
            color: colors.text,
            fontWeight: '700',
        },
        pillRow: {
            flexDirection: 'row',
            gap: 8,
        },
        pillBtn: {
            flex: 1,
            paddingVertical: 9,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
            borderWidth: 1,
            borderColor: colors.border,
        },
        pillBtnActive: {
            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.18)' : 'rgba(37, 99, 235, 0.1)',
            borderColor: colors.primary,
        },
        pillText: {
            fontSize: 12,
            fontWeight: '600',
            color: colors.textSecondary,
        },
        pillTextActive: {
            color: colors.primary,
            fontWeight: '700',
        },
        badgePill: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 8,
        },
        badgeAllowed: {
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            borderWidth: 1,
            borderColor: 'rgba(16, 185, 129, 0.25)',
        },
        badgeDenied: {
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            borderWidth: 1,
            borderColor: 'rgba(239, 68, 68, 0.25)',
        },
        badgeAllowedText: {
            fontSize: 11,
            fontWeight: '700',
            color: '#10B981',
        },
        badgeDeniedText: {
            fontSize: 11,
            fontWeight: '700',
            color: '#EF4444',
        },
        explanatoryNote: {
            fontSize: 12,
            color: colors.textDim,
            lineHeight: 17,
        },
        reminderTimeRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 8,
        },
        timeChip: {
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 8,
            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(37, 99, 235, 0.1)',
            borderWidth: 1,
            borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(37, 99, 235, 0.2)',
        },
        timeChipText: {
            fontSize: 12,
            fontWeight: '700',
            color: colors.primary,
        },
    }), [colors, isDark]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Top Navigation */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => router.back()}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <ArrowLeft size={18} color={colors.text} weight="bold" />
                </TouchableOpacity>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Settings</Text>
                    <Text style={styles.headerSubtitle}>Customize your InterviewAI experience</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* 1. Appearance Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Sun size={17} color={colors.primary} weight="fill" />
                        <Text style={styles.sectionTitle}>Appearance & Theme</Text>
                    </View>
                    <View style={styles.card}>
                        <View>
                            <Text style={styles.rowLabel}>Theme Preference</Text>
                            <Text style={styles.rowDesc}>Select application display appearance</Text>
                        </View>
                        <View style={styles.segmentedControl}>
                            {themeOptions.map((opt) => {
                                const active = themeMode === opt.id;
                                const Icon = opt.icon;
                                return (
                                    <Pressable
                                        key={opt.id}
                                        onPress={() => setThemeMode(opt.id)}
                                        style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                                    >
                                        <Icon
                                            size={16}
                                            color={active ? colors.primary : colors.textSecondary}
                                            weight={active ? 'fill' : 'regular'}
                                        />
                                        <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                                            {opt.label}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>
                </View>

                {/* 2. Interview Preferences */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <SlidersHorizontal size={17} color={colors.primary} weight="fill" />
                        <Text style={styles.sectionTitle}>Interview Preferences</Text>
                    </View>
                    <View style={styles.card}>
                        {/* Mode */}
                        <View>
                            <Text style={styles.rowLabel}>Default Interview Mode</Text>
                            <Text style={styles.rowDesc}>Interactive chat format for simulations</Text>
                        </View>
                        <View style={styles.segmentedControl}>
                            {(['text', 'voice'] as InterviewMode[]).map((mode) => {
                                const active = settings.interview.defaultMode === mode;
                                return (
                                    <Pressable
                                        key={mode}
                                        onPress={() => updateInterviewSetting('defaultMode', mode)}
                                        style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                                    >
                                        <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                                            {mode === 'text' ? 'Text Interview' : 'Voice Interview'}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        <View style={styles.divider} />

                        {/* Difficulty */}
                        <View>
                            <Text style={styles.rowLabel}>Default Difficulty</Text>
                            <Text style={styles.rowDesc}>Starting probing level for problem setups</Text>
                        </View>
                        <View style={styles.segmentedControl}>
                            {(['beginner', 'intermediate', 'advanced'] as InterviewDifficulty[]).map((diff) => {
                                const active = settings.interview.defaultDifficulty === diff;
                                return (
                                    <Pressable
                                        key={diff}
                                        onPress={() => updateInterviewSetting('defaultDifficulty', diff)}
                                        style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                                    >
                                        <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                                            {diff.charAt(0).toUpperCase() + diff.slice(1)}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        <View style={styles.divider} />

                        {/* Duration */}
                        <View>
                            <Text style={styles.rowLabel}>Interview Duration</Text>
                            <Text style={styles.rowDesc}>Recommended simulation countdown length</Text>
                        </View>
                        <View style={styles.pillRow}>
                            {durationOptions.map((dur) => {
                                const active = settings.interview.duration === dur;
                                return (
                                    <TouchableOpacity
                                        key={dur}
                                        onPress={() => updateInterviewSetting('duration', dur)}
                                        style={[styles.pillBtn, active && styles.pillBtnActive]}
                                    >
                                        <Text style={[styles.pillText, active && styles.pillTextActive]}>
                                            {dur} min
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <View style={styles.divider} />

                        {/* Hints toggle */}
                        <View style={styles.rowBetween}>
                            <View style={{ flex: 1, paddingRight: 10 }}>
                                <Text style={styles.rowLabel}>Show hints during practice</Text>
                                <Text style={styles.rowDesc}>Offer on-demand guidance chips during sessions</Text>
                            </View>
                            <Switch
                                value={settings.interview.showHints}
                                onValueChange={(val) => updateInterviewSetting('showHints', val)}
                                trackColor={{ false: colors.border, true: colors.primary }}
                                thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
                            />
                        </View>

                        <View style={styles.divider} />

                        {/* Auto-save toggle */}
                        <View style={styles.rowBetween}>
                            <View style={{ flex: 1, paddingRight: 10 }}>
                                <Text style={styles.rowLabel}>Auto-save interview sessions</Text>
                                <Text style={styles.rowDesc}>Automatically commit transcripts on conclusion</Text>
                            </View>
                            <Switch
                                value={settings.interview.autoSave}
                                onValueChange={(val) => updateInterviewSetting('autoSave', val)}
                                trackColor={{ false: colors.border, true: colors.primary }}
                                thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
                            />
                        </View>
                    </View>
                </View>

                {/* 3. Voice & Audio */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Microphone size={17} color={colors.primary} weight="fill" />
                        <Text style={styles.sectionTitle}>Voice & Audio</Text>
                    </View>
                    <View style={styles.card}>
                        <View style={styles.rowBetween}>
                            <View>
                                <Text style={styles.rowLabel}>AI Voice</Text>
                                <Text style={styles.rowDesc}>Interviewer dialogue persona</Text>
                            </View>
                            <View style={styles.timeChip}>
                                <Text style={styles.timeChipText}>{settings.voice.aiVoice}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View>
                            <Text style={styles.rowLabel}>Speech Speed</Text>
                            <Text style={styles.rowDesc}>Rate of text-to-speech voice playback</Text>
                        </View>
                        <View style={styles.pillRow}>
                            {speedOptions.map((spd) => {
                                const active = settings.voice.speechSpeed === spd;
                                return (
                                    <TouchableOpacity
                                        key={spd}
                                        onPress={() => updateVoiceSetting('speechSpeed', spd)}
                                        style={[styles.pillBtn, active && styles.pillBtnActive]}
                                    >
                                        <Text style={[styles.pillText, active && styles.pillTextActive]}>
                                            {spd}x
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.rowBetween}>
                            <View style={{ flex: 1, paddingRight: 10 }}>
                                <Text style={styles.rowLabel}>Auto-play AI responses</Text>
                                <Text style={styles.rowDesc}>Automatically read out interviewer replies</Text>
                            </View>
                            <Switch
                                value={settings.voice.autoPlayResponses}
                                onValueChange={(val) => updateVoiceSetting('autoPlayResponses', val)}
                                trackColor={{ false: colors.border, true: colors.primary }}
                                thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
                            />
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.rowBetween}>
                            <View style={{ flex: 1, paddingRight: 10 }}>
                                <Text style={styles.rowLabel}>Microphone Permission</Text>
                                <Text style={styles.rowDesc}>Required for voice-based candidate responses</Text>
                            </View>
                            <TouchableOpacity
                                onPress={requestMicPermission}
                                style={[
                                    styles.badgePill,
                                    micPermission === 'Allowed' ? styles.badgeAllowed : styles.badgeDenied,
                                ]}
                            >
                                {micPermission === 'Allowed' ? (
                                    <CheckCircle size={12} color="#10B981" weight="fill" />
                                ) : null}
                                <Text
                                    style={
                                        micPermission === 'Allowed'
                                            ? styles.badgeAllowedText
                                            : styles.badgeDeniedText
                                    }
                                >
                                    {micPermission}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.explanatoryNote}>
                            Voice interviews use your microphone to capture spoken answers. On-device recognition transcribes your responses in real time.
                        </Text>
                    </View>
                </View>

                {/* 4. Notifications */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Bell size={17} color={colors.primary} weight="fill" />
                        <Text style={styles.sectionTitle}>Notifications</Text>
                    </View>
                    <View style={styles.card}>
                        <View style={styles.rowBetween}>
                            <View style={{ flex: 1, paddingRight: 10 }}>
                                <Text style={styles.rowLabel}>Interview Reminders</Text>
                                <Text style={styles.rowDesc}>Reminders for scheduled mock rounds</Text>
                            </View>
                            <Switch
                                value={settings.notifications.interviewReminders}
                                onValueChange={(val) => updateNotificationSetting('interviewReminders', val)}
                                trackColor={{ false: colors.border, true: colors.primary }}
                                thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
                            />
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.rowBetween}>
                            <View style={{ flex: 1, paddingRight: 10 }}>
                                <Text style={styles.rowLabel}>Learning Reminders</Text>
                                <Text style={styles.rowDesc}>Prompts to continue system design modules</Text>
                            </View>
                            <Switch
                                value={settings.notifications.learningReminders}
                                onValueChange={(val) => updateNotificationSetting('learningReminders', val)}
                                trackColor={{ false: colors.border, true: colors.primary }}
                                thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
                            />
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.rowBetween}>
                            <View style={{ flex: 1, paddingRight: 10 }}>
                                <Text style={styles.rowLabel}>Daily Practice Reminder</Text>
                                <Text style={styles.rowDesc}>Keep your preparation streak active</Text>
                            </View>
                            <Switch
                                value={settings.notifications.dailyPractice}
                                onValueChange={(val) => updateNotificationSetting('dailyPractice', val)}
                                trackColor={{ false: colors.border, true: colors.primary }}
                                thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
                            />
                        </View>

                        {settings.notifications.dailyPractice ? (
                            <View style={styles.reminderTimeRow}>
                                <Text style={styles.rowDesc}>Reminder Time</Text>
                                <View style={styles.timeChip}>
                                    <Text style={styles.timeChipText}>{settings.notifications.dailyPracticeTime}</Text>
                                </View>
                            </View>
                        ) : null}

                        <View style={styles.divider} />

                        <View style={styles.rowBetween}>
                            <View style={{ flex: 1, paddingRight: 10 }}>
                                <Text style={styles.rowLabel}>Achievement Notifications</Text>
                                <Text style={styles.rowDesc}>Celebrate milestone unlocks and streaks</Text>
                            </View>
                            <Switch
                                value={settings.notifications.achievementNotifications}
                                onValueChange={(val) => updateNotificationSetting('achievementNotifications', val)}
                                trackColor={{ false: colors.border, true: colors.primary }}
                                thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
                            />
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.rowBetween}>
                            <View style={{ flex: 1, paddingRight: 10 }}>
                                <Text style={styles.rowLabel}>Weekly Progress Summary</Text>
                                <Text style={styles.rowDesc}>Digest of readiness and areas for growth</Text>
                            </View>
                            <Switch
                                value={settings.notifications.weeklyProgressSummary}
                                onValueChange={(val) => updateNotificationSetting('weeklyProgressSummary', val)}
                                trackColor={{ false: colors.border, true: colors.primary }}
                                thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
