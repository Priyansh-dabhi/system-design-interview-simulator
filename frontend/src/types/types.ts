import { TextInputProps, TextStyle, ViewStyle } from 'react-native';

export interface User {
    id: number;
    fullName: string;
    email: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export interface RefreshResponse {
    accessToken: string;
    refreshToken: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    full_name: string;
    email: string;
    password: string;
}

export interface ScreenWrapperProps {
    children: React.ReactNode;
    style?: ViewStyle;
    withPadding?: boolean;
}

export interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
}

export interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    isLoading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}
