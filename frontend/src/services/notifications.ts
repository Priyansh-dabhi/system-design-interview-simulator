import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { getStoredSettings } from '../storage/settingsStorage';

export const PRACTICE_CHANNEL_ID = 'practice-reminders';
export const LEARNING_CHANNEL_ID = 'learning-reminders';

export const DAILY_PRACTICE_ID = 'daily-practice';
export const LEARNING_REMINDER_ID = 'learning-reminder';

/**
 * Configure foreground notification behavior and Android notification channels.
 */
export async function initNotifications(): Promise<void> {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(PRACTICE_CHANNEL_ID, {
        name: 'Daily Practice Reminders',
        description: 'Reminders to complete your daily system design interview practice round',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2563EB',
      });

      await Notifications.setNotificationChannelAsync(LEARNING_CHANNEL_ID, {
        name: 'Learning Reminders',
        description: 'Prompts to continue your system design modules and architectural concepts',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10B981',
      });
    }
  } catch (err) {
    console.warn('Failed to initialize notifications:', err);
  }
}

/**
 * Checks and requests notification permissions.
 * Returns true if permissions are granted.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const existing = await Notifications.getPermissionsAsync();
    let finalStatus = existing.status;

    if (finalStatus !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      finalStatus = requested.status;
    }

    return finalStatus === 'granted';
  } catch (err) {
    console.warn('Error requesting notification permissions:', err);
    return false;
  }
}

/**
 * Parses a 12-hour or 24-hour time string (e.g. "7:00 PM" or "19:00") into hour and minute.
 */
export function parseTimeString(timeStr: string): { hour: number; minute: number } {
  try {
    const trimmed = (timeStr || '').trim();
    const match = trimmed.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
    if (!match) {
      return { hour: 19, minute: 0 }; // Default 7:00 PM
    }

    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const period = match[3] ? match[3].toUpperCase() : null;

    if (period === 'PM' && hour < 12) {
      hour += 12;
    } else if (period === 'AM' && hour === 12) {
      hour = 0;
    }

    return { hour, minute };
  } catch {
    return { hour: 19, minute: 0 };
  }
}

/**
 * Schedules the recurring daily interview practice reminder.
 */
export async function scheduleDailyPracticeReminder(timeString: string): Promise<void> {
  try {
    await cancelDailyPracticeReminder();
    const { hour, minute } = parseTimeString(timeString);

    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_PRACTICE_ID,
      content: {
        title: '🎯 Time for System Design Practice!',
        body: 'Keep your interview preparation streak alive. Jump into a mock round now.',
        sound: true,
        data: { screen: '/(main)/practice' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        channelId: PRACTICE_CHANNEL_ID,
        hour,
        minute,
      },
    });
  } catch (err) {
    console.warn('Failed to schedule daily practice reminder:', err);
  }
}

/**
 * Cancels the daily practice reminder.
 */
export async function cancelDailyPracticeReminder(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(DAILY_PRACTICE_ID);
  } catch {
    // Ignore cancellation error if not found
  }
}

/**
 * Schedules the recurring learning reminder (daily at 10:00 AM).
 */
export async function scheduleLearningReminder(): Promise<void> {
  try {
    await cancelLearningReminder();

    await Notifications.scheduleNotificationAsync({
      identifier: LEARNING_REMINDER_ID,
      content: {
        title: '📚 Continue Learning',
        body: 'Pick up where you left off — your next system design module is ready.',
        sound: true,
        data: { screen: '/(main)/learning' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        channelId: LEARNING_CHANNEL_ID,
        hour: 10,
        minute: 0,
      },
    });
  } catch (err) {
    console.warn('Failed to schedule learning reminder:', err);
  }
}

/**
 * Cancels the learning reminder.
 */
export async function cancelLearningReminder(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(LEARNING_REMINDER_ID);
  } catch {
    // Ignore cancellation error if not found
  }
}

/**
 * Cancels all scheduled local notifications.
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // Ignore
  }
}

/**
 * Hook to listen for notification taps and navigate via Expo Router.
 */
export function useNotificationResponseListener(): void {
  const router = useRouter();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      try {
        const screen = response.notification.request.content.data?.screen;
        if (typeof screen === 'string') {
          router.push(screen as any);
        }
      } catch (err) {
        console.warn('Failed to navigate from notification response:', err);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [router]);
}

/**
 * Safety net sync: ensures OS scheduled alarms match current stored preferences.
 */
export async function syncNotificationsWithSettings(): Promise<void> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    const settings = await getStoredSettings();

    if (settings.notifications.dailyPractice) {
      await scheduleDailyPracticeReminder(settings.notifications.dailyPracticeTime);
    } else {
      await cancelDailyPracticeReminder();
    }

    if (settings.notifications.learningReminders) {
      await scheduleLearningReminder();
    } else {
      await cancelLearningReminder();
    }
  } catch (err) {
    console.warn('Failed to sync notifications with settings:', err);
  }
}
