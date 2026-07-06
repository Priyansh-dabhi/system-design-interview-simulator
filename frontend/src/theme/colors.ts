import { ThemeColors } from './types';

export const darkColors: ThemeColors = {
    background: '#000000',
    surface: '#121212',
    surfaceHighlight: '#2A2A2A',
    text: '#FFFFFF',
    textSecondary: '#A1A1AA', // Zinc 400
    textDim: '#fff', // Zinc 600 - keeping existing behavior
    primary: '#E4E4E7', // Zinc 200
    primaryDark: '#A1A1AA',
    border: '#27272A', // Zinc 800
    error: '#EF4444',
    success: '#10B981',

    buttonPrimaryText: '#000000',
    buttonSecondaryBackground: '#27272A',
    buttonSecondaryText: '#FFFFFF',
    inputBackground: '#18181B',

    primaryBrand: '#137fec',
    backgroundDark: '#101922',
    surfaceDark: '#18222c',
    surfaceDarker: '#141e27',

    userMessageBg: '#137fec',
    userMessageText: '#FFFFFF',
    aiMessageBg: '#121212',
    aiMessageText: '#FFFFFF',
    aiMessageBorder: '#27272A',

    dangerSurfaceBg: '#1A0A0A',
    dangerSurfaceBorder: '#2A1010',
    overlayBackground: 'rgba(0, 0, 0, 0.7)',
};

export const lightColors: ThemeColors = {
    background: '#F8F9FB',
    surface: '#FFFFFF',
    surfaceHighlight: '#EEF1F5',
    text: '#111827',
    textSecondary: '#5F6B7A',
    textDim: '#94A3B8',
    primary: '#1570C8',
    primaryDark: '#0F5298',
    border: '#DFE3EA',
    error: '#DC2626',
    success: '#059669',

    buttonPrimaryText: '#FFFFFF',
    buttonSecondaryBackground: '#FFFFFF',
    buttonSecondaryText: '#111827',
    inputBackground: '#FFFFFF',

    primaryBrand: '#1570C8',
    backgroundDark: '#F1F4F8',
    surfaceDark: '#E8ECF1',
    surfaceDarker: '#E2E6EC',

    userMessageBg: '#E8F0FE',
    userMessageText: '#111827',
    aiMessageBg: '#FFFFFF',
    aiMessageText: '#111827',
    aiMessageBorder: '#DFE3EA',

    dangerSurfaceBg: '#FEF2F2',
    dangerSurfaceBorder: '#FEE2E2',
    overlayBackground: 'rgba(0, 0, 0, 0.3)',
};
