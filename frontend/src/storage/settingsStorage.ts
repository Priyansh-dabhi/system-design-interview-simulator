import AsyncStorage from '@react-native-async-storage/async-storage';

export type InterviewMode = 'text' | 'voice';
export type InterviewDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type InterviewDuration = 20 | 30 | 45 | 60;
export type SpeechSpeed = 0.8 | 1.0 | 1.2 | 1.5;

export interface InterviewPreferences {
    defaultMode: InterviewMode;
    defaultDifficulty: InterviewDifficulty;
    duration: InterviewDuration;
    showHints: boolean;
    autoSave: boolean;
}

export interface VoicePreferences {
    aiVoice: string;
    speechSpeed: SpeechSpeed;
    autoPlayResponses: boolean;
}

export interface NotificationPreferences {
    interviewReminders: boolean;
    learningReminders: boolean;
    dailyPractice: boolean;
    dailyPracticeTime: string;
    achievementNotifications: boolean;
    weeklyProgressSummary: boolean;
}

export interface AppSettings {
    interview: InterviewPreferences;
    voice: VoicePreferences;
    notifications: NotificationPreferences;
}

export const defaultSettings: AppSettings = {
    interview: {
        defaultMode: 'text',
        defaultDifficulty: 'intermediate',
        duration: 45,
        showHints: true,
        autoSave: true,
    },
    voice: {
        aiVoice: 'Professional',
        speechSpeed: 1.0,
        autoPlayResponses: false,
    },
    notifications: {
        interviewReminders: true,
        learningReminders: true,
        dailyPractice: false,
        dailyPracticeTime: '7:00 PM',
        achievementNotifications: true,
        weeklyProgressSummary: true,
    },
};

const SETTINGS_STORAGE_KEY = 'interviewai_app_settings';

export async function getStoredSettings(): Promise<AppSettings> {
    try {
        const raw = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        if (!raw) return defaultSettings;
        const parsed = JSON.parse(raw);
        return {
            interview: { ...defaultSettings.interview, ...parsed.interview },
            voice: { ...defaultSettings.voice, ...parsed.voice },
            notifications: { ...defaultSettings.notifications, ...parsed.notifications },
        };
    } catch {
        return defaultSettings;
    }
}

export async function setStoredSettings(settings: AppSettings): Promise<void> {
    try {
        await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
        // Ignored
    }
}
