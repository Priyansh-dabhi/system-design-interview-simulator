export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
    background: string;
    surface: string;
    surfaceHighlight: string;
    text: string;
    textSecondary: string;
    textDim: string;
    primary: string;
    primaryDark: string;
    border: string;
    error: string;
    success: string;

    // Specific UI elements
    buttonPrimaryText: string;
    buttonSecondaryBackground: string;
    buttonSecondaryText: string;
    inputBackground: string;

    // Stitch Design System
    primaryBrand: string;
    backgroundDark: string;
    surfaceDark: string;
    surfaceDarker: string;

    // Chat specific
    userMessageBg: string;
    userMessageText: string;
    aiMessageBg: string;
    aiMessageText: string;
    aiMessageBorder: string;

    // Additional Semantic
    dangerSurfaceBg: string;
    dangerSurfaceBorder: string;
    overlayBackground: string;
}
