import { ReactNode } from 'react';
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
    user: User;
}

export interface InterviewSummary {
    strengths: string[];
    missed_topics: string[];
    suggestions: string[];
}

export type InterviewScore = 'good' | 'average' | 'needs_improvement';

export interface InterviewHistoryItem {
    id: string;
    topic: string;
    status: string;
    stage: string;
    date: string;
    messageCount: number;
    score: InterviewScore;
    summary: InterviewSummary;
}

export interface InterviewStats {
    total: number;
    completed: number;
    active: number;
    strong: number;
    average: number;
    needsImprovement: number;
    strongestDomain: string;
}

export interface InterviewHistoryResponse {
    history: InterviewHistoryItem[];
    stats: InterviewStats;
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
    rightAccessory?: ReactNode;
}

export interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    isLoading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    leftIcon?: ReactNode;
}
