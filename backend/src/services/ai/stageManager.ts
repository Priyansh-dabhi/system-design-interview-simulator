export type InterviewStage = 'greeting' | 'warmup' | 'design' | 'deep_dive' | 'evaluation';

export function determineStage(messageCount: number): InterviewStage {
    if (messageCount === 0) return 'greeting';
    if (messageCount <= 4) return 'warmup';
    if (messageCount <= 10) return 'design';
    if (messageCount <= 20) return 'deep_dive';
    return 'evaluation';
}
