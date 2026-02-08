import { TextInputProps, TextStyle, ViewStyle } from 'react-native';

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    signIn: (email: string) => Promise<void>;
    signUp: (name: string, email: string) => Promise<void>;
    signOut: () => Promise<void>;
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
