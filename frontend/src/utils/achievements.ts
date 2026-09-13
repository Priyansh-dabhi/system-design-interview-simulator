import { InterviewStats, InterviewHistoryItem } from '../types/types';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: 'trophy' | 'fire' | 'lightning' | 'books' | 'microphone' | 'sparkle' | 'crown';
    unlocked: boolean;
    progress?: string;
}

export function computeAchievements(
    stats?: InterviewStats,
    history?: InterviewHistoryItem[]
): Achievement[] {
    const total = stats?.total ?? 0;
    const currentStreak = stats?.currentStreak ?? 0;
    const bestStreak = stats?.bestStreak ?? 0;
    const streak = Math.max(currentStreak, bestStreak);

    // Calculate best score from scoreOverTime or history items
    let bestScore = 0;
    if (stats?.scoreOverTime && stats.scoreOverTime.length > 0) {
        bestScore = Math.max(...stats.scoreOverTime.map((s) => s.score));
    } else if (history && history.length > 0) {
        const scores = history
            .map((h) => h.overallScore)
            .filter((s): s is number => typeof s === 'number');
        if (scores.length > 0) {
            bestScore = Math.max(...scores);
        }
    }

    return [
        {
            id: 'first_interview',
            title: 'First Interview',
            description: 'Complete your first system design simulation',
            icon: 'lightning',
            unlocked: total >= 1,
            progress: total >= 1 ? 'Unlocked' : `${total}/1 completed`,
        },
        {
            id: 'score_80',
            title: 'Score 80+',
            description: 'Achieve an evaluation score of 80 or higher',
            icon: 'trophy',
            unlocked: bestScore >= 80,
            progress: bestScore >= 80 ? 'Unlocked' : `Best: ${bestScore}/80`,
        },
        {
            id: 'streak_7',
            title: '7 Day Streak',
            description: 'Practice system design 7 consecutive days',
            icon: 'fire',
            unlocked: streak >= 7,
            progress: streak >= 7 ? 'Unlocked' : `${streak}/7 days`,
        },
        {
            id: 'problems_10',
            title: '10 Problems',
            description: 'Simulate 10 distributed system architectures',
            icon: 'books',
            unlocked: total >= 10,
            progress: total >= 10 ? 'Unlocked' : `${total}/10 sessions`,
        },
        {
            id: 'first_voice',
            title: 'First Voice Interview',
            description: 'Complete a voice-guided simulator session',
            icon: 'microphone',
            unlocked: false, // Locked until voice session telemetry is recorded
            progress: 'Locked',
        },
        {
            id: 'learning_module',
            title: 'First Learning Module',
            description: 'Complete your first system design curriculum module',
            icon: 'sparkle',
            unlocked: false, // Ready for learning module connection
            progress: 'Locked',
        },
        {
            id: 'perfect_test',
            title: 'Perfect Test',
            description: 'Score a flawless 100 on an interview evaluation',
            icon: 'crown',
            unlocked: bestScore === 100,
            progress: bestScore === 100 ? 'Unlocked' : 'Locked',
        },
    ];
}
