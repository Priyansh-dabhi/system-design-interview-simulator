import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode } from '../theme/types';

const THEME_MODE_KEY = 'theme_mode';

export const getStoredThemeMode = async (): Promise<ThemeMode> => {
    try {
        const mode = await AsyncStorage.getItem(THEME_MODE_KEY);
        if (mode === 'light' || mode === 'dark' || mode === 'system') {
            return mode as ThemeMode;
        }
    } catch {
        // Fallback
    }
    return 'dark'; // Default to dark for existing users
};

export const setStoredThemeMode = async (mode: ThemeMode): Promise<void> => {
    try {
        await AsyncStorage.setItem(THEME_MODE_KEY, mode);
    } catch {
        // Ignored
    }
};
