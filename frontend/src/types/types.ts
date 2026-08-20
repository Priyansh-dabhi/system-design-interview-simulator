import { ReactNode } from 'react';
import { TextInputProps, TextStyle, ViewStyle } from 'react-native';

export interface User {
    id: number;
    fullName: string;
    email: string;
    acceptedTermsAt: string | null;
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

export interface DimensionScore {
    score: number;
    comment: string;
}

export interface TopicCoverageItem {
    topic: string;
    covered: boolean;
}

export interface StudyPlanItem {
    topic: string;
    why: string;
}

export interface InterviewSummary {
    strengths: string[];
    missed_topics: string[];
    suggestions: string[];
    // Rich fields (present for interviews scored by the upgraded summary model).
    overall_score?: number;
    dimension_scores?: Record<string, DimensionScore>;
    topic_coverage?: TopicCoverageItem[];
    study_plan?: StudyPlanItem[];
    ideal_answer?: string;
    durationSeconds?: number;
}

export type InterviewScore = 'good' | 'average' | 'needs_improvement';

export interface InterviewHistoryItem {
    id: string;
    topic: string;
    status: string;
    stage: string;
    date: string;
    messageCount: number;
    overallScore?: number | null;
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
    scoreOverTime: { date: string; score: number }[];
    topicMastery: { topic: string; avgScore: number; count: number }[];
    currentStreak: number;
    bestStreak: number;
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
