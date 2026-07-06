import React, { createContext, useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { getStoredThemeMode, setStoredThemeMode } from '../storage/themeStorage';
import { darkColors, lightColors } from './colors';
import { ThemeColors, ThemeMode } from './types';

interface ThemeContextValue {
    colors: ThemeColors;
    isDark: boolean;
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
    const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(Appearance.getColorScheme());

    useEffect(() => {
        // Load initial theme
        getStoredThemeMode().then(setThemeModeState);

        // Listen for system changes
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            setSystemColorScheme(colorScheme);
        });

        return () => subscription.remove();
    }, []);

    const setThemeMode = (mode: ThemeMode) => {
        setThemeModeState(mode);
        setStoredThemeMode(mode);
    };

    const isDark =
        themeMode === 'system'
            ? systemColorScheme === 'dark'
            : themeMode === 'dark';

    const colors = isDark ? darkColors : lightColors;

    return (
        <ThemeContext.Provider value={{ colors, isDark, themeMode, setThemeMode }}>
            {children}
        </ThemeContext.Provider>
    );
};
